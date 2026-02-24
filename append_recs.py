
import json
import os

file_path = 'recommendations.json'

new_entries = [
  {
    "filename": "Ryan Hoover.txt",
    "guests": [
      {
        "name": "Ryan Hoover",
        "titles": ["Founder of Product Hunt", "Investor"],
        "reach": {
          "platforms": ["Twitter"],
          "websites": ["ryanhoover.me"],
          "products": ["Product Hunt"]
        }
      }
    ],
    "lightning_round": {}
  },
  {
    "filename": "Ryan J. Salva.txt",
    "guests": [
      {
        "name": "Ryan J. Salva",
        "titles": ["Product Leader at GitHub"],
        "reach": {
          "platforms": ["Twitter", "GitHub", "LinkedIn"],
          "websites": [],
          "products": ["GitHub Copilot"]
        }
      }
    ],
    "lightning_round": {
      "books": [
        {"title": "Make It So", "author": "Nathan Shedroff", "why": "Sci-fi UX makes its way into products 20-30 years later"},
        {"title": "Brief Interviews with Hideous Men", "author": "David Foster Wallace", "why": "Villain speeches, terrible people"}
      ],
      "tv_movies": [
        {"title": "Arrival", "type": "movie", "why": "About language and memory"}
      ],
      "interview_question": "Teach me something new in one minute (graded on completeness, complexity, clarity)"
    }
  },
  {
    "filename": "Ryan Singer.txt",
    "guests": [
      {
        "name": "Ryan Singer",
        "titles": ["Product Strategy at Basecamp"],
        "reach": {
          "platforms": [],
          "websites": [],
          "products": ["Shape Up"]
        }
      }
    ],
    "lightning_round": {}
  },
  {
    "filename": "Sachin Monga.txt",
    "guests": [
      {
        "name": "Sachin Monga",
        "titles": ["VP of Product at Substack"],
        "reach": {
          "platforms": ["Twitter"],
          "websites": ["substackinc.com"],
          "products": ["Substack"]
        }
      }
    ],
    "lightning_round": {
      "books": [
        {"title": "The Timeless Way of Building", "author": "Christopher Alexander", "why": "Interesting parallel with internet incentive structures"}
      ],
      "tv_movies": [
        {"title": "For All Mankind", "type": "tv_show", "why": "Every episode like standalone movie"}
      ]
    }
  },
  {
    "filename": "Sahil Mansuri.txt",
    "guests": [
      {
        "name": "Sahil Mansuri",
        "titles": ["Founder and CEO of Bravado"],
        "reach": {
          "platforms": ["LinkedIn"],
          "websites": ["bravado.co"],
          "products": ["Bravado"]
        }
      }
    ],
    "lightning_round": {
      "books": [
        {"title": "Stumbling Upon Happiness", "author": "Dan Gilbert", "why": "Teaches how to sell using psychology"}
      ],
      "tv_movies": [
        {"title": "The Blacklist", "type": "tv_show", "why": "Really like James Spader"},
        {"title": "The Newsroom", "type": "tv_show", "why": "Big fan of Aaron Sorkin"},
        {"title": "West Wing", "type": "tv_show", "why": "Aaron Sorkin"}
      ],
      "products": [
        {"name": "Pen and paper", "why": "Favorite tools, Luddite"},
        {"name": "Grain", "why": "Make clips of Zoom meetings, share customer words"}
      ]
    }
  }
]

with open(file_path, 'r') as f:
    data = json.load(f)

existing_filenames = {entry['filename'] for entry in data}
for entry in new_entries:
    if entry['filename'] not in existing_filenames:
        data.append(entry)
    else:
        print(f"Skipping {entry['filename']}, already exists.")

data.sort(key=lambda x: x['filename'])

with open(file_path, 'w') as f:
    json.dump(data, f, indent=2)

print("Successfully appended new recommendations.")
