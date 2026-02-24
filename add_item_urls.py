#!/usr/bin/env python3
"""
Enrich recommendations.json with data scraped from each episode's Substack article:

1. Direct URLs for recommended books, products, and TV/movies (matched via fuzzy name match)
2. "Where to find" links for each guest — scraped from the "Where to find {Name}:" section

Resumable: episodes already enriched with where_to_find are skipped unless --force is passed.
Run: python3 add_item_urls.py
"""

import json
import re
import sys
import time
import urllib.request
from difflib import SequenceMatcher
from pathlib import Path
from typing import List, Optional, Dict

RECS_FILE = Path("recommendations.json")
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
}
RATE_LIMIT_SECONDS = 0.5
FUZZY_THRESHOLD = 0.65
FORCE = '--force' in sys.argv


# ── Fetch ──────────────────────────────────────────────────────────────────────

def fetch_page(url: str) -> str:
    req = urllib.request.Request(url, headers=HEADERS)
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            return resp.read().decode('utf-8', errors='replace')
    except Exception as e:
        print(f"    ⚠ fetch error: {e}")
        return ""


# ── Parse bullet links ─────────────────────────────────────────────────────────

def extract_all_bullet_links(html: str) -> List[Dict]:
    """
    Extract ALL bullet-point `{name: label, url: href}` pairs from Substack HTML.

    Two HTML patterns:

    A) Plain label in span:
       <p><span>• Notejoy: </span><a href="https://notejoy.com/" rel>...</a></p>

    B) Italic title (books):
       <p><span>• </span><em>Title</em><span>: </span><a href="https://amazon.com/..." rel>...</a></p>
    """
    links: List[Dict] = []
    seen_urls: set = set()

    def add(name: str, url: str) -> None:
        url = url.strip()
        if url not in seen_urls:
            links.append({'name': name.strip(), 'url': url})
            seen_urls.add(url)

    # Pattern A
    for m in re.finditer(
        r'[•·]\s*([^<\n]{2,100}?):\s*</span>\s*<a\s+href="(https?://[^"]+)"',
        html, re.IGNORECASE
    ):
        add(m.group(1), m.group(2))

    # Pattern B (em-tagged book title)
    for m in re.finditer(
        r'[•·]\s*</span>\s*<em>([^<]{2,100})</em>(?:<span>[^<]*</span>)*\s*<a\s+href="(https?://[^"]+)"',
        html, re.IGNORECASE
    ):
        add(m.group(1), m.group(2))

    return links


def extract_where_to_find(html: str, guest_names: List[str]) -> List[Dict]:
    """
    Find all "Where to find {Guest}:" sections in the HTML and extract their links.
    Skips the "Where to find Lenny:" section.

    Returns a list of {label, url} dicts, e.g.:
      [{"label": "X", "url": "https://x.com/awilkinson"}, ...]
    """
    # Lenny's own section — never include these
    LENNY_MARKERS = {'lenny', 'lennyrachitsky', 'lennysnewsletter', 'rachitsky'}

    def is_lenny(name: str) -> bool:
        n = name.lower()
        return any(m in n for m in LENNY_MARKERS)

    results: List[Dict] = []
    seen_urls: set = set()

    # Find every "Where to find {Name}:" <strong> header
    # Pattern: <strong>Where to find {Name}:</strong> ... bullet links ... next <strong>
    section_pat = re.compile(
        r'<strong>Where to find ([^<]{1,100}):</strong>(.*?)(?=<strong>|$)',
        re.IGNORECASE | re.DOTALL
    )

    # Pattern A for within a section
    link_pat_a = re.compile(
        r'[•·]\s*([^<\n]{1,80}?):\s*</span>\s*<a\s+href="(https?://[^"]+)"',
        re.IGNORECASE
    )

    for section_m in section_pat.finditer(html):
        section_name = section_m.group(1).strip()
        section_html = section_m.group(2)

        if is_lenny(section_name):
            continue  # skip Lenny's own section

        for link_m in link_pat_a.finditer(section_html):
            label = link_m.group(1).strip()
            url = link_m.group(2).strip()
            if url not in seen_urls:
                results.append({'label': label, 'url': url})
                seen_urls.add(url)

    return results


# ── Item URL matching ──────────────────────────────────────────────────────────

def normalize(text: str) -> str:
    text = re.sub(r'[^\w\s]', ' ', text.lower())
    return re.sub(r'\s+', ' ', text).strip()


def similarity(a: str, b: str) -> float:
    return SequenceMatcher(None, normalize(a), normalize(b)).ratio()


def best_match_url(item_name: str, bullet_links: List[Dict]) -> Optional[str]:
    best_score = 0.0
    best_url = None
    norm_item = normalize(item_name)

    for link in bullet_links:
        norm_link = normalize(link['name'])
        if norm_item in norm_link or norm_link in norm_item:
            if len(norm_item) >= 3 and len(norm_link) >= 3:
                return link['url']
        score = similarity(item_name, link['name'])
        if score > best_score:
            best_score = score
            best_url = link['url']

    return best_url if best_score >= FUZZY_THRESHOLD else None


# ── Episode helpers ────────────────────────────────────────────────────────────

def needs_item_urls(episode: dict) -> bool:
    lr = episode.get('lightning_round') or {}
    for book in lr.get('books') or []:
        if book.get('url') is None:
            return True
    for movie in lr.get('tv_movies') or []:
        if movie.get('url') is None:
            return True
    for product in lr.get('products') or []:
        if product.get('url') is None:
            return True
    return False


def needs_where_to_find(episode: dict) -> bool:
    return 'where_to_find' not in episode


def mark_nulls(episode: dict) -> None:
    """Mark all missing item URLs as None so resumability works."""
    lr = episode.get('lightning_round') or {}
    for book in lr.get('books') or []:
        if 'url' not in book:
            book['url'] = None
    for movie in lr.get('tv_movies') or []:
        if 'url' not in movie:
            movie['url'] = None
    for product in lr.get('products') or []:
        if 'url' not in product:
            product['url'] = None
    if 'where_to_find' not in episode:
        episode['where_to_find'] = []


def enrich_items(episode: dict, bullet_links: List[Dict]) -> int:
    lr = episode.get('lightning_round') or {}
    added = 0

    for book in lr.get('books') or []:
        if book.get('url') is not None:
            continue
        name = book.get('title', '')
        url = best_match_url(f"{name} {book.get('author', '')}", bullet_links) or best_match_url(name, bullet_links)
        book['url'] = url
        if url:
            added += 1

    for movie in lr.get('tv_movies') or []:
        if movie.get('url') is not None:
            continue
        url = best_match_url(movie.get('title', ''), bullet_links)
        movie['url'] = url
        if url:
            added += 1

    for product in lr.get('products') or []:
        if product.get('url') is not None:
            continue
        url = best_match_url(product.get('name', ''), bullet_links)
        product['url'] = url
        if url:
            added += 1

    return added


# ── Main ───────────────────────────────────────────────────────────────────────

def run():
    print("Loading recommendations.json...")
    with open(RECS_FILE, 'r') as f:
        recs = json.load(f)

    total = len(recs)
    with_url = sum(1 for ep in recs if ep.get('substack_url'))
    print(f"  {total} episodes, {with_url} have a Substack URL")
    if FORCE:
        print("  --force: re-scraping all episodes")
    print()

    total_item_urls = 0
    total_where_links = 0
    processed = 0
    errors = 0

    for i, episode in enumerate(recs):
        substack_url = episode.get('substack_url')
        guest_names = [g['name'] for g in (episode.get('guests') or [])]
        guest_label = guest_names[0] if guest_names else '(no guest)'

        if not substack_url:
            mark_nulls(episode)
            continue

        want_items = FORCE or needs_item_urls(episode)
        want_where = FORCE or needs_where_to_find(episode)

        if not want_items and not want_where:
            continue

        print(f"[{i+1}/{total}] {guest_label}")
        print(f"  {'items+where' if (want_items and want_where) else 'items' if want_items else 'where_to_find'}")

        html = fetch_page(substack_url)
        if not html:
            errors += 1
            continue

        bullet_links = extract_all_bullet_links(html)
        print(f"  {len(bullet_links)} bullet links found")

        if want_items:
            added = enrich_items(episode, bullet_links)
            total_item_urls += added
            print(f"  ✓ {added} item URLs matched")

        if want_where:
            where = extract_where_to_find(html, guest_names)
            episode['where_to_find'] = where
            total_where_links += len(where)
            if where:
                print(f"  ✓ {len(where)} Where to Find links: {', '.join(l['label'] for l in where)}")
            else:
                print(f"  — No Where to Find links")

        processed += 1
        time.sleep(RATE_LIMIT_SECONDS)

    print(f"\n{'─'*50}")
    print(f"Processed:          {processed} episodes")
    print(f"Item URLs added:    {total_item_urls}")
    print(f"Where to Find links:{total_where_links}")
    print(f"Errors:             {errors}")

    print("\nSaving recommendations.json...")
    with open(RECS_FILE, 'w') as f:
        json.dump(recs, f, indent=2, ensure_ascii=False)
    print("Done! ✓")
    print("\nRemember to copy:")
    print("  cp recommendations.json web/public/recommendations.json")


if __name__ == "__main__":
    run()
