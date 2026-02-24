#!/usr/bin/env python3
"""
Analyze recommendations.json to identify episodes with missing elements.
"""

import json
from collections import defaultdict

def analyze_recommendations(filename='recommendations.json'):
    with open(filename, 'r', encoding='utf-8') as f:
        episodes = json.load(f)

    # Track statistics
    stats = {
        'total_episodes': len(episodes),
        'with_lightning_round': 0,
        'missing_books': [],
        'missing_movies': [],
        'missing_products': [],
        'missing_life_motto': [],
        'missing_any': [],
        'complete': []
    }

    for episode in episodes:
        lightning_round = episode.get('lightning_round')

        if not lightning_round:
            continue

        stats['with_lightning_round'] += 1

        guests = episode.get('guests', [])
        guest_names = ', '.join([g.get('name', 'Unknown') for g in guests])
        filename = episode.get('filename', 'Unknown')

        has_books = bool(lightning_round.get('books'))
        has_movies = bool(lightning_round.get('tv_movies'))
        has_products = bool(lightning_round.get('products'))
        has_motto = bool(lightning_round.get('life_motto'))

        episode_info = {
            'filename': filename,
            'guests': guest_names,
            'books': len(lightning_round.get('books', [])),
            'movies': len(lightning_round.get('tv_movies', [])),
            'products': len(lightning_round.get('products', [])),
            'has_motto': has_motto
        }

        missing_count = 0

        if not has_books:
            stats['missing_books'].append(episode_info)
            missing_count += 1
        if not has_movies:
            stats['missing_movies'].append(episode_info)
            missing_count += 1
        if not has_products:
            stats['missing_products'].append(episode_info)
            missing_count += 1
        if not has_motto:
            stats['missing_life_motto'].append(episode_info)
            missing_count += 1

        if missing_count > 0:
            episode_info['missing_count'] = missing_count
            stats['missing_any'].append(episode_info)
        else:
            stats['complete'].append(episode_info)

    return stats

def print_analysis(stats):
    print(f"\n{'='*80}")
    print(f"RECOMMENDATIONS ANALYSIS")
    print(f"{'='*80}\n")

    print(f"Total episodes: {stats['total_episodes']}")
    print(f"Episodes with lightning rounds: {stats['with_lightning_round']}")
    print(f"Complete episodes (all 4 elements): {len(stats['complete'])}")
    print(f"Episodes with missing elements: {len(stats['missing_any'])}\n")

    print(f"{'='*80}")
    print(f"BREAKDOWN BY MISSING ELEMENT")
    print(f"{'='*80}\n")

    print(f"Missing Books: {len(stats['missing_books'])} episodes")
    print(f"Missing Movies/TV: {len(stats['missing_movies'])} episodes")
    print(f"Missing Products: {len(stats['missing_products'])} episodes")
    print(f"Missing Life Motto: {len(stats['missing_life_motto'])} episodes\n")

    if stats['missing_any']:
        print(f"{'='*80}")
        print(f"EPISODES WITH MISSING ELEMENTS (sorted by most missing)")
        print(f"{'='*80}\n")

        # Sort by number of missing elements
        sorted_missing = sorted(stats['missing_any'],
                               key=lambda x: x.get('missing_count', 0),
                               reverse=True)

        for i, ep in enumerate(sorted_missing, 1):
            missing_items = []
            if ep['books'] == 0:
                missing_items.append('books')
            if ep['movies'] == 0:
                missing_items.append('movies')
            if ep['products'] == 0:
                missing_items.append('products')
            if not ep['has_motto']:
                missing_items.append('life_motto')

            print(f"{i}. {ep['filename']}")
            print(f"   Guest(s): {ep['guests']}")
            print(f"   Missing: {', '.join(missing_items)} ({ep.get('missing_count', 0)} elements)")
            print(f"   Current: {ep['books']} books, {ep['movies']} movies, "
                  f"{ep['products']} products, "
                  f"{'Yes' if ep['has_motto'] else 'No'} motto")
            print()

if __name__ == '__main__':
    stats = analyze_recommendations()
    print_analysis(stats)

    # Save detailed report
    with open('missing_elements_report.json', 'w', encoding='utf-8') as f:
        json.dump(stats, f, indent=2, ensure_ascii=False)

    print(f"\nDetailed report saved to: missing_elements_report.json")
