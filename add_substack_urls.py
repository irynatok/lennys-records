#!/usr/bin/env python3
"""
Add Substack article URLs to recommendations.json by matching guest names
from the Lenny's Podcast RSS feed.
"""

import json
import re
import xml.etree.ElementTree as ET
from pathlib import Path
import urllib.request

PODCAST_RSS = "https://api.substack.com/feed/podcast/10845.rss"
RECS_FILE = Path("recommendations.json")
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
}


def fetch_podcast_feed():
    """Fetch the podcast RSS feed."""
    req = urllib.request.Request(PODCAST_RSS, headers=HEADERS)
    with urllib.request.urlopen(req) as response:
        return response.read()


def parse_episodes(xml_content):
    """Extract episodes from podcast RSS feed."""
    root = ET.fromstring(xml_content)
    episodes = []

    for item in root.findall('.//item'):
        title_elem = item.find('title')
        link_elem = item.find('link')

        if title_elem is not None and link_elem is not None:
            title = title_elem.text or ''
            url = link_elem.text or ''
            if title and url:
                episodes.append({'title': title, 'url': url})

    return episodes


def normalize(text):
    """Normalize text for matching."""
    return re.sub(r'[^a-z0-9\s]', '', text.lower()).strip()


def extract_guest_from_title(title):
    """Extract guest name from podcast title like 'Topic | Guest Name (Company)'."""
    if '|' in title:
        after_pipe = title.split('|', 1)[1].strip()
        # Remove company in parentheses
        name = re.sub(r'\s*\([^)]*\)\s*$', '', after_pipe).strip()
        return name
    return None


def find_matching_url(guest_names, podcast_episodes):
    """Find podcast episode URL matching any of the guest names."""
    for guest_name in guest_names:
        normalized_guest = normalize(guest_name)
        guest_parts = normalized_guest.split()
        last_name = guest_parts[-1] if guest_parts else ''

        for ep in podcast_episodes:
            # Strategy 1: Match against extracted guest name from "Topic | Guest (Company)" format
            ep_guest = extract_guest_from_title(ep['title'])
            if ep_guest:
                normalized_ep_guest = normalize(ep_guest)
                if last_name and len(last_name) > 2 and last_name in normalized_ep_guest:
                    if len(guest_parts) >= 2:
                        first_name = guest_parts[0]
                        if first_name in normalized_ep_guest:
                            return ep['url']
                    else:
                        return ep['url']

            # Strategy 2: Match guest name parts in full title (handles all formats)
            normalized_title = normalize(ep['title'])
            if len(guest_parts) >= 2 and all(part in normalized_title for part in guest_parts if len(part) > 2):
                return ep['url']

    return None


def add_urls_to_recommendations():
    """Add Substack URLs to recommendations.json."""
    print("Fetching podcast RSS feed...")
    xml_content = fetch_podcast_feed()

    print("Parsing podcast episodes...")
    podcast_episodes = parse_episodes(xml_content)
    print(f"Found {len(podcast_episodes)} podcast episodes\n")

    # Show some examples
    print("Sample episodes:")
    for ep in podcast_episodes[:3]:
        print(f"  {ep['title'][:100]}")
        print(f"  {ep['url']}")
        print()

    print("Loading recommendations...")
    with open(RECS_FILE, 'r') as f:
        recs = json.load(f)

    matched = 0
    unmatched = 0
    unmatched_list = []

    print("Matching episodes to articles...\n")
    for episode in recs:
        # Skip compilation episodes - they aggregate multiple episodes
        if 'Compilation' in episode.get('filename', ''):
            episode['substack_url'] = None
            unmatched += 1
            print(f"  ⊘ Skipping compilation: {episode.get('filename')}")
            continue

        guest_names = [g['name'] for g in episode.get('guests', [])]
        if not guest_names:
            episode['substack_url'] = None
            unmatched += 1
            continue

        url = find_matching_url(guest_names, podcast_episodes)

        if url:
            episode['substack_url'] = url
            matched += 1
            print(f"  ✓ {guest_names[0]}")
        else:
            episode['substack_url'] = None
            unmatched += 1
            unmatched_list.append(guest_names[0])

    print(f"\nMatched: {matched}, Unmatched: {unmatched}")

    if unmatched_list:
        print(f"\nUnmatched guests ({len(unmatched_list)}):")
        for name in unmatched_list:
            print(f"  - {name}")

    print("\nSaving updated recommendations...")
    with open(RECS_FILE, 'w') as f:
        json.dump(recs, f, indent=2, ensure_ascii=False)

    print("Done!")


if __name__ == "__main__":
    add_urls_to_recommendations()
