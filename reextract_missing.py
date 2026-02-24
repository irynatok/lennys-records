#!/usr/bin/env python3
"""
Re-extract missing lightning round elements from transcripts.
Focuses on episodes with incomplete data.
"""

import json
import os
import re
from pathlib import Path
from typing import Optional, Dict, Any, List
import time

# Try Groq first, fallback to Gemini
try:
    from groq import Groq
    GROQ_AVAILABLE = bool(os.environ.get('GROQ_API_KEY'))
    if GROQ_AVAILABLE:
        groq_client = Groq(api_key=os.environ.get('GROQ_API_KEY'))
except ImportError:
    GROQ_AVAILABLE = False

try:
    from google import genai
    GEMINI_AVAILABLE = bool(os.environ.get('GOOGLE_API_KEY'))
    if GEMINI_AVAILABLE:
        gemini_client = genai.Client(api_key=os.environ.get('GOOGLE_API_KEY'))
except ImportError:
    GEMINI_AVAILABLE = False


def load_recommendations():
    """Load existing recommendations."""
    with open('recommendations.json', 'r', encoding='utf-8') as f:
        return json.load(f)


def save_recommendations(episodes):
    """Save updated recommendations."""
    with open('recommendations.json', 'w', encoding='utf-8') as f:
        json.dump(episodes, f, indent=2, ensure_ascii=False)


def load_transcript(filename: str) -> Optional[str]:
    """Load transcript file."""
    transcript_path = Path('lennys-podcast-transcripts') / filename
    if not transcript_path.exists():
        print(f"   ⚠️  Transcript not found: {filename}")
        return None

    with open(transcript_path, 'r', encoding='utf-8') as f:
        return f.read()


def extract_lightning_section(transcript: str) -> Optional[str]:
    """Extract the lightning round section from transcript."""
    # Common lightning round markers
    markers = [
        r"lightning round",
        r"lightning questions",
        r"quick fire",
        r"rapid fire",
        r"quick questions"
    ]

    for marker in markers:
        pattern = re.compile(f"({marker}.*?)(?:where can folks|find you|thank you|that's all|wrap)",
                           re.IGNORECASE | re.DOTALL)
        match = pattern.search(transcript)
        if match:
            return match.group(1)

    # If no marker found, return last 30% of transcript (lightning rounds are usually at the end)
    words = transcript.split()
    start_idx = int(len(words) * 0.7)
    return ' '.join(words[start_idx:])


def create_extraction_prompt(lightning_section: str, missing_fields: List[str]) -> str:
    """Create a targeted prompt for missing fields."""

    field_descriptions = {
        'books': 'favorite books or book recommendations',
        'movies': 'favorite movies, TV shows, or documentaries',
        'products': 'favorite products, tools, apps, or services (under $250)',
        'life_motto': 'life motto, favorite quote, or guiding principle'
    }

    missing_desc = ', '.join([field_descriptions[f] for f in missing_fields])

    return f"""Extract the following information from this lightning round section: {missing_desc}.

TRANSCRIPT:
{lightning_section}

Return ONLY a valid JSON object with these fields (use null for any field not found):
{{
  "books": [
    {{"title": "Book Title", "author": "Author Name", "why": "why they recommend it", "url": null}}
  ],
  "tv_movies": [
    {{"title": "Movie/Show Title", "type": "movie/tv/documentary", "why": "why they recommend it", "url": null}}
  ],
  "products": [
    {{"name": "Product Name", "why": "why they recommend it", "url": null}}
  ],
  "life_motto": "Their life motto or favorite quote"
}}

IMPORTANT:
- Extract ALL items mentioned for each category
- Include "why" explanations when available
- If a category is not mentioned, use an empty array [] or null
- Return valid JSON only, no markdown formatting
- Focus on finding: {missing_desc}
"""


def extract_with_llm(lightning_section: str, missing_fields: List[str]) -> Optional[Dict[str, Any]]:
    """Extract missing fields using LLM (Groq or Gemini)."""

    prompt = create_extraction_prompt(lightning_section, missing_fields)

    # Try Groq first
    if GROQ_AVAILABLE:
        try:
            response = groq_client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.1,
                max_tokens=2000
            )
            result = response.choices[0].message.content

            # Clean up markdown formatting if present
            result = result.strip()
            if result.startswith('```'):
                result = re.sub(r'^```(?:json)?\n?', '', result)
                result = re.sub(r'\n?```$', '', result)

            return json.loads(result)

        except Exception as e:
            print(f"   ⚠️  Groq failed: {e}")

    # Fallback to Gemini
    if GEMINI_AVAILABLE:
        try:
            response = gemini_client.models.generate_content(
                model='gemini-2.5-flash-lite',
                contents=prompt
            )
            result = response.text.strip()

            # Clean up markdown formatting
            if result.startswith('```'):
                result = re.sub(r'^```(?:json)?\n?', '', result)
                result = re.sub(r'\n?```$', '', result)

            return json.loads(result)

        except Exception as e:
            print(f"   ⚠️  Gemini failed: {e}")

    return None


def merge_lightning_round(existing: Dict, extracted: Dict, missing_fields: List[str]) -> Dict:
    """Merge extracted data with existing data, only updating missing fields."""

    if not existing:
        return extracted

    result = existing.copy()

    # Only update fields that were marked as missing
    if 'books' in missing_fields and extracted.get('books'):
        result['books'] = extracted['books']

    if 'movies' in missing_fields and extracted.get('tv_movies'):
        result['tv_movies'] = extracted['tv_movies']

    if 'products' in missing_fields and extracted.get('products'):
        result['products'] = extracted['products']

    if 'life_motto' in missing_fields and extracted.get('life_motto'):
        result['life_motto'] = extracted['life_motto']

    return result


def identify_missing_fields(episode: Dict) -> List[str]:
    """Identify which fields are missing for an episode."""
    missing = []

    lightning_round = episode.get('lightning_round', {})
    if not lightning_round:
        return ['books', 'movies', 'products', 'life_motto']

    if not lightning_round.get('books'):
        missing.append('books')
    if not lightning_round.get('tv_movies'):
        missing.append('movies')
    if not lightning_round.get('products'):
        missing.append('products')
    if not lightning_round.get('life_motto'):
        missing.append('life_motto')

    return missing


def reextract_episode(episode: Dict, priority: str = 'all') -> Optional[Dict]:
    """Re-extract missing data for a single episode.

    Args:
        episode: Episode data
        priority: 'all' (all missing), 'critical' (4 missing), 'partial' (1-3 missing)
    """

    missing_fields = identify_missing_fields(episode)

    if not missing_fields:
        return None  # Nothing to extract

    # Filter by priority
    if priority == 'critical' and len(missing_fields) < 4:
        return None
    elif priority == 'partial' and len(missing_fields) == 4:
        return None

    filename = episode.get('filename', '')
    guests = episode.get('guests', [])
    guest_names = ', '.join([g.get('name', 'Unknown') for g in guests])

    print(f"\n📄 {filename}")
    print(f"   Guest(s): {guest_names}")
    print(f"   Missing: {', '.join(missing_fields)}")

    # Load transcript
    transcript = load_transcript(filename)
    if not transcript:
        return None

    # Extract lightning section
    lightning_section = extract_lightning_section(transcript)
    if not lightning_section or len(lightning_section) < 100:
        print(f"   ⚠️  No lightning section found")
        return None

    print(f"   🔍 Extracting missing fields...")

    # Extract with LLM
    extracted = extract_with_llm(lightning_section, missing_fields)
    if not extracted:
        print(f"   ❌ Extraction failed")
        return None

    # Merge with existing data
    updated_lightning = merge_lightning_round(
        episode.get('lightning_round', {}),
        extracted,
        missing_fields
    )

    # Show what was found
    found = []
    if 'books' in missing_fields and updated_lightning.get('books'):
        found.append(f"{len(updated_lightning['books'])} books")
    if 'movies' in missing_fields and updated_lightning.get('tv_movies'):
        found.append(f"{len(updated_lightning['tv_movies'])} movies")
    if 'products' in missing_fields and updated_lightning.get('products'):
        found.append(f"{len(updated_lightning['products'])} products")
    if 'life_motto' in missing_fields and updated_lightning.get('life_motto'):
        found.append("life motto")

    if found:
        print(f"   ✅ Found: {', '.join(found)}")
    else:
        print(f"   ⚠️  No new data extracted")
        return None

    episode['lightning_round'] = updated_lightning
    return episode


def main():
    import argparse

    parser = argparse.ArgumentParser(description='Re-extract missing lightning round elements')
    parser.add_argument('--priority', choices=['all', 'critical', 'partial'],
                       default='critical',
                       help='Which episodes to process: critical (4 missing), partial (1-3 missing), all')
    parser.add_argument('--limit', type=int, default=0,
                       help='Maximum number of episodes to process (0 for all)')
    parser.add_argument('--dry-run', action='store_true',
                       help='Show what would be extracted without saving')

    args = parser.parse_args()

    if not GROQ_AVAILABLE and not GEMINI_AVAILABLE:
        print("❌ No API keys found. Set GROQ_API_KEY or GOOGLE_API_KEY environment variable.")
        return

    api_name = "Groq (llama-3.3-70b)" if GROQ_AVAILABLE else "Gemini"
    print(f"\n🚀 Re-extracting missing elements using {api_name}")
    print(f"   Priority: {args.priority}")
    print(f"   Limit: {args.limit if args.limit > 0 else 'no limit'}")
    print(f"   Dry run: {args.dry_run}")

    # Load data
    episodes = load_recommendations()

    # Track progress
    processed = 0
    updated = 0
    skipped = 0

    for episode in episodes:
        if args.limit > 0 and processed >= args.limit:
            break

        original_episode = episode.copy()
        updated_episode = reextract_episode(episode, priority=args.priority)

        if updated_episode:
            processed += 1

            # Update in place
            for key, value in updated_episode.items():
                episode[key] = value

            updated += 1

            # Save after each successful extraction (unless dry run)
            if not args.dry_run:
                save_recommendations(episodes)
                print(f"   💾 Saved to recommendations.json")

            # Rate limiting (Gemini free tier: 10 requests/minute = 6s minimum, using 7s to be safe)
            time.sleep(7)
        else:
            if identify_missing_fields(episode):
                skipped += 1

    print(f"\n{'='*80}")
    print(f"SUMMARY")
    print(f"{'='*80}")
    print(f"Processed: {processed}")
    print(f"Updated: {updated}")
    print(f"Skipped: {skipped}")

    if args.dry_run:
        print(f"\n⚠️  Dry run mode - no changes saved")
    else:
        print(f"\n✅ Recommendations updated in recommendations.json")
        print(f"💡 Don't forget to copy to web/public/: cp recommendations.json web/public/")


if __name__ == '__main__':
    main()
