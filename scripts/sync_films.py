#!/usr/bin/env python3
"""
Sync the Letterboxd list at LIST_URL into assets/data/films.json + assets/images/films/.

Letterboxd has no public API and puts its poster/JSON endpoints behind a Cloudflare
bot challenge, so this scrapes the two pages that do serve plainly (the list page and
each film page) and resolves posters through TMDB, which is where Letterboxd's posters
come from anyway.

Needs TMDB_API_KEY in the environment for posters. Without it the script still refreshes
titles/years/slugs and leaves any posters it already has in place.

Anything that fails upstream falls back to the existing films.json entry, so a bad night
at Letterboxd degrades to stale data rather than an empty strip on the site.
"""

import html
import json
import os
import re
import ssl
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

# python.org builds on macOS ship without the system CA bundle wired up; certifi covers
# that. CI images are fine either way, hence the fallback rather than a hard dependency.
try:
    import certifi
    SSL_CTX = ssl.create_default_context(cafile=certifi.where())
except ImportError:
    SSL_CTX = ssl.create_default_context()

LIST_URL = "https://letterboxd.com/sidr/list/siddus-five-stars/"

ROOT = Path(__file__).resolve().parent.parent
DATA_FILE = ROOT / "assets" / "data" / "films.json"
POSTER_DIR = ROOT / "assets" / "images" / "films"
POSTER_REL = "assets/images/films"

UA = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36"
)
TMDB_KEY = os.environ.get("TMDB_API_KEY", "").strip()
# 342px wide covers a 132px slot at 2x DPI without shipping a megabyte of posters.
TMDB_SIZE = "w342"


def get(url, tries=3, binary=False):
    last = None
    for attempt in range(tries):
        req = urllib.request.Request(
            url,
            headers={
                "User-Agent": UA,
                "Accept-Language": "en-US,en;q=0.9",
                "Referer": "https://letterboxd.com/",
            },
        )
        try:
            with urllib.request.urlopen(req, timeout=30, context=SSL_CTX) as r:
                body = r.read()
                return body if binary else body.decode("utf-8", "replace")
        except (urllib.error.URLError, urllib.error.HTTPError, TimeoutError) as e:
            last = e
            time.sleep(1.5 * (attempt + 1))
    print(f"    ! fetch failed: {url} ({last})", file=sys.stderr)
    return None


def parse_list(page):
    """Pull (title, year, slug) out of the list page's LazyPoster components."""
    films = []
    seen = set()
    for m in re.finditer(
        r'data-item-name="([^"]*)"[^>]*?data-item-slug="([^"]*)"', page
    ):
        name, slug = html.unescape(m.group(1)), m.group(2)
        if slug in seen:
            continue
        seen.add(slug)
        ym = re.search(r"\s*\((\d{4})\)\s*$", name)
        films.append(
            {
                "title": ym and name[: ym.start()].strip() or name.strip(),
                "year": int(ym.group(1)) if ym else None,
                "slug": slug,
                "url": f"https://letterboxd.com/film/{slug}/",
            }
        )
    return films


def tmdb_id_for(slug):
    page = get(f"https://letterboxd.com/film/{slug}/")
    if not page:
        return None
    m = re.search(r'tmdb-id="(\d+)"', page)
    return int(m.group(1)) if m else None


def poster_path_for(tmdb_id):
    if not TMDB_KEY:
        return None
    raw = get(f"https://api.themoviedb.org/3/movie/{tmdb_id}?api_key={TMDB_KEY}")
    if not raw:
        return None
    try:
        return json.loads(raw).get("poster_path")
    except json.JSONDecodeError:
        return None


def download_poster(path, slug):
    blob = get(f"https://image.tmdb.org/t/p/{TMDB_SIZE}{path}", binary=True)
    if not blob or len(blob) < 1000:
        return None
    POSTER_DIR.mkdir(parents=True, exist_ok=True)
    (POSTER_DIR / f"{slug}.jpg").write_bytes(blob)
    return f"{POSTER_REL}/{slug}.jpg"


def main():
    previous = {}
    if DATA_FILE.exists():
        try:
            for f in json.loads(DATA_FILE.read_text()).get("films", []):
                previous[f["slug"]] = f
        except (json.JSONDecodeError, KeyError):
            pass

    page = get(LIST_URL)
    if not page:
        print("Could not reach the list page; leaving films.json untouched.", file=sys.stderr)
        return 1

    films = parse_list(page)
    if not films:
        print("List page returned no films (markup may have changed).", file=sys.stderr)
        return 1
    print(f"{len(films)} films on the list")

    if not TMDB_KEY:
        print("No TMDB_API_KEY set — refreshing metadata only, keeping existing posters.")

    for f in films:
        old = previous.get(f["slug"], {})
        f["tmdb"] = old.get("tmdb") or tmdb_id_for(f["slug"])

        existing = old.get("poster")
        if existing and (ROOT / existing).exists():
            f["poster"] = existing
        elif f["tmdb"] and TMDB_KEY:
            p = poster_path_for(f["tmdb"])
            f["poster"] = (download_poster(p, f["slug"]) if p else None) or None
        else:
            f["poster"] = None

        print(f"  {'*' if f['poster'] else ' '} {f['title']} ({f['year']})")
        time.sleep(0.4)   # be a polite scraper

    # drop posters for films no longer on the list
    live = {f["slug"] for f in films}
    if POSTER_DIR.exists():
        for stale in POSTER_DIR.glob("*.jpg"):
            if stale.stem not in live:
                stale.unlink()
                print(f"  - removed {stale.name}")

    DATA_FILE.parent.mkdir(parents=True, exist_ok=True)
    DATA_FILE.write_text(
        json.dumps({"list": LIST_URL, "films": films}, indent=2, ensure_ascii=False) + "\n"
    )
    have = sum(1 for f in films if f["poster"])
    print(f"Wrote {DATA_FILE.relative_to(ROOT)} — {have}/{len(films)} with posters")
    return 0


if __name__ == "__main__":
    sys.exit(main())
