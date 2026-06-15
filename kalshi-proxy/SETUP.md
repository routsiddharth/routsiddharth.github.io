# Kalshi proxy — setup

`ishanai.html` can't call Kalshi directly: Kalshi's API sits behind CloudFront,
which returns **403 to any request carrying an `Origin` header** (i.e. every
browser `fetch`) and sends no CORS headers. This tiny Cloudflare Worker runs
server-side (no `Origin`), signs each request with your RSA key, fans out to the
markets endpoint, and returns one CORS-enabled JSON payload the page renders.

Your key lives only as an encrypted Worker secret — it never touches the public
page or this repo.

## Deploy — dashboard (no CLI)

1. Cloudflare dashboard → **Workers & Pages** → **Create** → **Create Worker**.
   Name it `kalshi-proxy`, deploy the hello-world, then **Edit code** and paste
   the contents of `worker.js`. Save & deploy.
2. Worker → **Settings → Variables and Secrets** → add two **secrets**:
   - `KALSHI_KEY_ID`  → `b88050cb-2ef8-4231-ae37-abe248699ca0`
   - `KALSHI_PRIVATE_KEY` → your key in **PKCS#8** PEM form (starts with
     `-----BEGIN PRIVATE KEY-----`). Workers' WebCrypto only accepts PKCS#8, so
     convert your `-----BEGIN RSA PRIVATE KEY-----` file once:
     ```
     openssl pkcs8 -topk8 -nocrypt -in kalshi_key.pem -out kalshi_pkcs8.pem
     ```
   - (optional) `ALLOW_ORIGIN` → `https://sidrout.com` to lock the proxy to your
     site. Defaults to `*`.
3. Copy the Worker URL (e.g. `https://kalshi-proxy.<your-subdomain>.workers.dev`)
   into `WORKER_URL` near the top of `../ishanai.html`.

## Deploy — CLI

```
npm i -g wrangler
cd kalshi-proxy
wrangler deploy
wrangler secret put KALSHI_KEY_ID        # paste the uuid
wrangler secret put KALSHI_PRIVATE_KEY   # paste the PKCS#8 PEM
```

## Verify

Open the Worker URL directly in a browser — you should get JSON with a
`positions` array. Then load `ishanai.html`.
