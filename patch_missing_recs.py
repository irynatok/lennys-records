#!/usr/bin/env python3
"""Patch missing book recommendations into recommendations.json."""
import json, shutil

with open('recommendations.json') as f:
    recs = json.load(f)

PATCHES = {
    'we-replaced-our-sales-team-with-20-ai-agents': {
        'books': [
            {'title': 'High Output Management', 'author': 'Andrew Grove', 'url': 'https://www.amazon.com/High-Output-Management-Andrew-Grove/dp/0679762884/'},
            {'title': 'Only the Paranoid Survive', 'author': 'Andy Grove', 'url': 'https://www.amazon.com/Only-Paranoid-Survive-Exploit-Challenge/dp/0385483821'},
            {'title': 'Zone to Win', 'author': 'Geoffrey Moore', 'url': 'https://www.amazon.com/Zone-Win-Organizing-Compete-Disruption/dp/1682302113'},
            {"title": "Poor Charlie's Almanack", 'author': 'Charles T. Munger', 'url': 'https://www.amazon.com/Poor-Charlies-Almanack-Essential-Charles/dp/1953953239'},
            {'title': 'Invent and Wander', 'author': 'Jeff Bezos', 'url': 'https://www.amazon.com/Invent-Wander-Collected-Writings-Introduction/dp/1647820715/'},
            {'title': 'The 15 Commitments of Conscious Leadership', 'author': None, 'url': 'https://www.amazon.com/15-Commitments-Conscious-Leadership-Sustainable-ebook/dp/B00R3MHWUE'},
        ]
    },
    'inside-notion-ivan-zhao': {
        'books': [
            {'title': 'The Romance of the Three Kingdoms', 'author': 'Luo Guanzhong', 'url': 'https://www.amazon.com/Romance-Three-Kingdoms-Luo-Guanzhong/dp/024133277X'},
        ]
    },
    'anthropics-cpo-heres-what-comes-next': {
        'books': [
            {'title': 'The Goal: A Process of Ongoing Improvement', 'author': 'Eliyahu M. Goldratt', 'url': 'https://www.amazon.com/Goal-Process-Ongoing-Improvement/dp/0884271951'},
        ]
    },
    'the-quiet-architect-peter-deng': {
        'books': [
            {'title': 'Sapiens: A Brief History of Humankind', 'author': 'Yuval Noah Harari', 'url': 'https://www.amazon.com/Sapiens-Humankind-Yuval-Noah-Harari/dp/0062316095'},
            {'title': 'The Design of Everyday Things', 'author': 'Don Norman', 'url': 'https://www.amazon.com/Design-Everyday-Things-Revised-Expanded/dp/0465050654'},
            {'title': 'The Silk Roads: A New History of the World', 'author': 'Peter Frankopan', 'url': 'https://www.amazon.com/Silk-Roads-New-History-World/dp/1101912375'},
        ]
    },
    'superhumans-secret-to-success-rahul-vohra': {
        'books': [
            {'title': 'Monetizing Innovation', 'author': 'Madhavan Ramanujam', 'url': 'https://www.amazon.com/Monetizing-Innovation-Companies-Design-Product/dp/1119240867'},
        ]
    },
    'shape-up-ryan-singer': {
        'books': [
            {'title': 'Demand-Side Sales 101', 'author': 'Bob Moesta', 'url': 'https://www.amazon.com/Demand-Side-Sales-101-Customers-Progress/dp/1544509987/'},
            {'title': 'Competing Against Luck', 'author': 'Clayton M. Christensen', 'url': 'https://www.amazon.com/Competing-Against-Luck-Innovation-Customer/dp/0062435612/'},
            {'title': 'Job Moves: 9 Steps for Making Progress in Your Career', 'author': 'Ethan Bernstein', 'url': 'https://www.amazon.com/Job-Moves-Making-Progress-Career/dp/0063283581'},
        ]
    },
    'an-inside-look-at-how-figma-builds': {
        'books': [
            {'title': 'Switch: How to Change Things When Change Is Hard', 'author': 'Chip Heath & Dan Heath', 'url': 'https://www.amazon.com/Switch-Change-Things-When-Hard/dp/0385528752/'},
            {'title': 'The Story of the Stone (Dream of the Red Chamber)', 'author': 'Cao Xueqin', 'url': 'https://www.amazon.com/Story-Stone-Dream-Chamber-Vol/dp/0140442936'},
        ]
    },
}

patched = []
for ep in recs:
    url = ep.get('substack_url') or ''
    for fragment, patch in PATCHES.items():
        if fragment in url:
            if ep.get('lightning_round') is None:
                ep['lightning_round'] = {}
            lr = ep['lightning_round']
            for cat, items in patch.items():
                existing = lr.get(cat) or []
                existing_titles = {b.get('title', '').lower() for b in existing}
                new_items = [b for b in items if b['title'].lower() not in existing_titles]
                lr[cat] = existing + new_items
                guest = (ep.get('guests') or [{}])[0].get('name', 'unknown')
                if new_items:
                    print(f"OK {guest}: +{len(new_items)} {cat}")
            patched.append(url)
            break

print(f"Patched {len(patched)} episodes")
with open('recommendations.json', 'w') as f:
    json.dump(recs, f, indent=2, ensure_ascii=False)
shutil.copy('recommendations.json', 'web/public/recommendations.json')
print("Saved + copied to web/public/recommendations.json")
