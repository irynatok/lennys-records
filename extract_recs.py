#!/usr/bin/env python3
"""
Extract lightning round recommendations from Lenny's Podcast transcripts.

Reads .txt transcript files, locates the lightning round section + guest intro/outro,
sends them to an LLM for structured extraction, and saves results to recommendations.json.

Uses Groq (llama-3.3-70b) as primary, falls back to Google Gemini on rate limits.

Usage:
    pip install groq google-genai
    export GROQ_API_KEY=gsk-...
    export GOOGLE_API_KEY=AI...
    python3 extract_recs.py

Resumes from where it left off if interrupted (reads existing recommendations.json).
"""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
import time
from pathlib import Path

from groq import Groq
from google import genai

TRANSCRIPTS_DIR = Path("lennys-podcast-transcripts")
OUTPUT_FILE = Path("recommendations.json")
GROQ_MODEL = "llama-3.3-70b-versatile"
GEMINI_MODEL = "gemini-2.5-flash-lite"
DELAY_BETWEEN_REQUESTS = 1.0  # seconds
MAX_SECTION_CHARS = 8000  # truncate long sections to stay under token limits

EXTRACTION_PROMPT = """\
You are extracting structured data from a Lenny's Podcast transcript.

You will receive three sections:
1. INTRO — the first ~50 lines, containing the guest introduction
2. LIGHTNING ROUND — the lightning round Q&A section
3. OUTRO — the last ~50 lines, containing "where to find" info

Extract the following JSON. Be precise — only include information explicitly stated.
If a field has no data, use null for scalars or [] for arrays.

IMPORTANT:
- Some episodes have 2 guests. If so, return an array of guest objects under "guests" instead of a single "guest".
- For books, try to identify the author if mentioned. If not mentioned, use null.
- "why" should be a brief reason the guest recommended it, or null if they didn't elaborate.
- "type" for tv_movies should be "tv_show" or "movie".
- "interview_question" is the guest's favorite question to ask candidates in interviews.
- "productivity_tip" is a life hack or productivity advice.
- "life_motto" is a motto or maxim they live by.
- Only include items actually recommended. Do not fabricate.

Return ONLY valid JSON matching this schema (no markdown fences, no commentary):

{
  "guests": [
    {
      "name": "string",
      "titles": ["string"],
      "reach": {
        "platforms": ["@handle on Twitter", "LinkedIn"],
        "websites": ["url"],
        "products": ["product name"]
      }
    }
  ],
  "lightning_round": {
    "books": [{"title": "string", "author": "string|null", "why": "string|null"}],
    "tv_movies": [{"title": "string", "type": "tv_show|movie", "why": "string|null"}],
    "products": [{"name": "string", "why": "string|null"}],
    "life_motto": "string|null",
    "interview_question": "string|null",
    "productivity_tip": "string|null"
  }
}
"""


def find_lightning_round(lines: list[str]) -> str | None:
    """Find the lightning round section in the transcript.

    Looks for common phrasings Lenny uses to start the lightning round,
    then captures everything from there to the end-of-lightning-round
    signals (wrap-up, "where can folks find you", "thank you so much", etc).
    """
    start_idx = None
    # Search for the start of lightning round (various phrasings)
    for i, line in enumerate(lines):
        lower = line.lower()
        if any(phrase in lower for phrase in [
            "lightning round",
            "rapid fire",
            "rapid-fire",
        ]):
            # Use the first mention that looks like the actual start
            # (Lenny sometimes mentions it a few lines before starting)
            start_idx = i
            break

    if start_idx is None:
        return None

    # Find the end: look for wrap-up signals after the lightning round starts
    end_idx = len(lines)
    for i in range(start_idx + 5, len(lines)):
        lower = lines[i].lower()
        if any(phrase in lower for phrase in [
            "where can folks find you",
            "where can people find you",
            "where can listeners find you",
            "two final questions",
            "final question. where",
            "thank you so much for being here",
            "thanks so much for being here",
            "thank you for being here",
            "this was amazing",
            "this was incredible",
            "this has been amazing",
            "this has been incredible",
            "what a conversation",
            "bye everyone",
        ]):
            # Include a few lines after the signal for context
            end_idx = min(i + 10, len(lines))
            break

    section = "\n".join(lines[start_idx:end_idx])
    # Only return if it's substantial enough to be a real lightning round
    if len(section) < 200:
        return None
    return section


def extract_sections(filepath: Path) -> dict | None:
    """Read a transcript file and extract intro, lightning round, and outro sections."""
    text = filepath.read_text(encoding="utf-8", errors="replace")
    lines = text.splitlines()

    if len(lines) < 10:
        return None

    lightning = find_lightning_round(lines)
    if lightning is None:
        return None

    intro = "\n".join(lines[:50])[:MAX_SECTION_CHARS]
    outro = "\n".join(lines[-50:])[:MAX_SECTION_CHARS]
    lightning = lightning[:MAX_SECTION_CHARS]

    return {
        "intro": intro,
        "lightning_round": lightning,
        "outro": outro,
    }


def build_user_content(sections: dict) -> str:
    return (
        f"=== INTRO ===\n{sections['intro']}\n\n"
        f"=== LIGHTNING ROUND ===\n{sections['lightning_round']}\n\n"
        f"=== OUTRO ===\n{sections['outro']}"
    )


def call_groq(client: Groq, sections: dict) -> dict:
    """Send transcript sections to Groq and get structured extraction."""
    response = client.chat.completions.create(
        model=GROQ_MODEL,
        messages=[
            {"role": "user", "content": EXTRACTION_PROMPT + "\n\n" + build_user_content(sections)}
        ],
        max_tokens=2048,
    )

    raw = response.choices[0].message.content.strip()
    raw = re.sub(r"^```(?:json)?\s*", "", raw)
    raw = re.sub(r"\s*```$", "", raw)
    return json.loads(raw)


def call_gemini(client: genai.Client, sections: dict) -> dict:
    """Send transcript sections to Gemini and get structured extraction."""
    response = client.models.generate_content(
        model=GEMINI_MODEL,
        contents=EXTRACTION_PROMPT + "\n\n" + build_user_content(sections),
    )

    raw = response.text.strip()
    raw = re.sub(r"^```(?:json)?\s*", "", raw)
    raw = re.sub(r"\s*```$", "", raw)
    return json.loads(raw)


def call_llm(groq_client: Groq, gemini_client: genai.Client | None, sections: dict) -> dict:
    """Try Groq first, fall back to Gemini on rate limit or request-too-large errors."""
    try:
        return call_groq(groq_client, sections)
    except Exception as e:
        err = str(e).lower()
        is_rate_limit = "rate" in err or "429" in err or "413" in err
        if not is_rate_limit:
            raise

        if gemini_client is None:
            raise

        print("GROQ LIMITED, trying Gemini...", end=" ", flush=True)
        return call_gemini(gemini_client, sections)


def load_existing_results() -> list[dict]:
    """Load previously saved results to allow resumption."""
    if OUTPUT_FILE.exists():
        with open(OUTPUT_FILE, "r") as f:
            return json.load(f)
    return []


def save_results(results: list[dict]) -> None:
    """Write results to JSON file."""
    with open(OUTPUT_FILE, "w") as f:
        json.dump(results, f, indent=2, ensure_ascii=False)


def main():
    parser = argparse.ArgumentParser(description="Extract lightning round recommendations.")
    parser.add_argument("--limit", type=int, default=None,
                        help="Max number of episodes to process (for testing)")
    args = parser.parse_args()

    if not TRANSCRIPTS_DIR.exists():
        print(f"Error: directory '{TRANSCRIPTS_DIR}' not found.")
        sys.exit(1)

    # Check for API keys
    if not os.environ.get("GROQ_API_KEY"):
        print("Error: GROQ_API_KEY environment variable not set.")
        sys.exit(1)

    groq_client = Groq()

    gemini_client = None
    if os.environ.get("GOOGLE_API_KEY"):
        gemini_client = genai.Client()
        print("Gemini fallback: enabled")
    else:
        print("Gemini fallback: disabled (no GOOGLE_API_KEY)")

    # Get all transcript files, sorted for deterministic order
    all_files = sorted(TRANSCRIPTS_DIR.glob("*.txt"))
    print(f"Found {len(all_files)} transcript files.")

    # Load existing results and build a set of already-processed filenames
    results = load_existing_results()
    processed = {r["filename"] for r in results}
    print(f"Already processed: {len(processed)} files. Resuming...\n")

    skipped = 0
    errors = 0
    newly_processed = 0

    for i, filepath in enumerate(all_files):
        filename = filepath.name

        if filename in processed:
            continue

        print(f"[{i+1}/{len(all_files)}] {filename}...", end=" ", flush=True)

        # Extract sections from the transcript
        sections = extract_sections(filepath)
        if sections is None:
            print("SKIP (no lightning round)")
            skipped += 1
            continue

        # Call LLM (Groq primary, Gemini fallback)
        try:
            extracted = call_llm(groq_client, gemini_client, sections)
        except json.JSONDecodeError as e:
            print(f"ERROR (bad JSON: {e})")
            errors += 1
            continue
        except Exception as e:
            print(f"API ERROR ({e})")
            errors += 1
            continue

        # Normalize: if API returned a single guest object, wrap it
        if "guest" in extracted and "guests" not in extracted:
            extracted["guests"] = [extracted.pop("guest")]

        result = {"filename": filename, **extracted}
        results.append(result)

        # Save incrementally after every successful extraction
        save_results(results)
        print("OK")
        newly_processed += 1

        if args.limit and newly_processed >= args.limit:
            print(f"\nReached limit of {args.limit} episodes.")
            break

        time.sleep(DELAY_BETWEEN_REQUESTS)

    print(f"\nDone! Processed {len(results)} episodes total.")
    print(f"Skipped (no lightning round): {skipped}")
    print(f"Errors: {errors}")
    print(f"Results saved to {OUTPUT_FILE}")


if __name__ == "__main__":
    main()
