// Kalshi read-only proxy — for ishanai.html
// -------------------------------------------------------------------------
// Kalshi's API sits behind CloudFront, which returns 403 to any request that
// carries an `Origin` header (i.e. every browser fetch) and sends no CORS
// headers. So the page cannot call Kalshi directly. This Worker runs on
// Cloudflare's edge (server-side, no Origin), signs each request with your
// RSA key, fans out to the markets endpoint, and returns one consolidated,
// CORS-enabled JSON payload the page renders.
//
// Required secrets (Workers & Pages -> your worker -> Settings -> Variables):
//   KALSHI_KEY_ID       your access key id (the uuid)
//   KALSHI_PRIVATE_KEY  your key as PKCS#8 PEM (-----BEGIN PRIVATE KEY-----)
//
// Optional:
//   ALLOW_ORIGIN        defaults to "*". Set to "https://sidrout.com" to lock
//                       the proxy to your site only.
// -------------------------------------------------------------------------

const BASE = "https://api.elections.kalshi.com";

export default {
  async fetch(request, env) {
    const cors = {
      "Access-Control-Allow-Origin": env.ALLOW_ORIGIN || "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Vary": "Origin",
    };
    if (request.method === "OPTIONS") return new Response(null, { headers: cors });
    if (request.method !== "GET") {
      return json({ error: "method not allowed" }, 405, cors);
    }
    if (!env.KALSHI_KEY_ID || !env.KALSHI_PRIVATE_KEY) {
      return json({ error: "worker missing KALSHI_KEY_ID / KALSHI_PRIVATE_KEY secrets" }, 500, cors);
    }
    try {
      return json(await buildPayload(env), 200, { ...cors, "Cache-Control": "no-store" });
    } catch (e) {
      return json({ error: String((e && e.message) || e) }, 502, cors);
    }
  },
};

function json(obj, status, headers) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { ...headers, "Content-Type": "application/json" },
  });
}

// --- signing -------------------------------------------------------------
let KEY_PROMISE = null;
function getKey(env) {
  if (!KEY_PROMISE) {
    KEY_PROMISE = crypto.subtle.importKey(
      "pkcs8",
      pemToDer(env.KALSHI_PRIVATE_KEY),
      { name: "RSA-PSS", hash: "SHA-256" },
      false,
      ["sign"]
    );
  }
  return KEY_PROMISE;
}

function pemToDer(pem) {
  const b64 = pem.replace(/-----[^-]+-----/g, "").replace(/\s+/g, "");
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes.buffer;
}

function bufToB64(buf) {
  const bytes = new Uint8Array(buf);
  let s = "";
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return btoa(s);
}

// Kalshi signs `timestamp + METHOD + path` (path WITHOUT query string), salt
// length = digest length (32) — matches openssl rsa_pss_saltlen:digest.
async function kalshi(env, method, path, query = "") {
  const ts = Date.now().toString();
  const key = await getKey(env);
  const msg = new TextEncoder().encode(ts + method + path);
  const sig = await crypto.subtle.sign({ name: "RSA-PSS", saltLength: 32 }, key, msg);
  const res = await fetch(BASE + path + query, {
    method,
    headers: {
      "KALSHI-ACCESS-KEY": env.KALSHI_KEY_ID,
      "KALSHI-ACCESS-SIGNATURE": bufToB64(sig),
      "KALSHI-ACCESS-TIMESTAMP": ts,
      "Accept": "application/json",
    },
  });
  if (!res.ok) throw new Error("kalshi " + path + " -> " + res.status + " " + (await res.text()).slice(0, 200));
  return res.json();
}

// --- payload -------------------------------------------------------------
async function buildPayload(env) {
  const [posResp, balResp] = await Promise.all([
    kalshi(env, "GET", "/trade-api/v2/portfolio/positions", "?count_filter=position&limit=1000"),
    kalshi(env, "GET", "/trade-api/v2/portfolio/balance").catch(() => null),
  ]);

  // Only markets you actually hold a non-zero position in.
  const held = (posResp.market_positions || []).filter(
    (p) => parseFloat(p.position_fp) !== 0
  );

  const markets = await Promise.all(
    held.map((p) =>
      kalshi(env, "GET", "/trade-api/v2/markets/" + encodeURIComponent(p.ticker))
        .then((r) => r.market)
        .catch(() => null)
    )
  );

  return {
    fetched_at: new Date().toISOString(),
    balance: balResp,
    event_positions: posResp.event_positions || [],
    positions: held.map((position, i) => ({ position, market: markets[i] })),
  };
}
