
import json
import os

filepath = '/Users/irynatokarchuk/Dev/irynka-programynka/pet-projects/lennys-records/recommendations.json'

new_entry = {
    "filename": "Ami Vora.txt",
    "guests": [
        {
            "name": "Ami Vora",
            "titles": [
                "Chief Product Officer at Faire",
                "Former VP of Product at WhatsApp",
                "Former VP of Product at Facebook"
            ],
            "reach": {
                "platforms": [
                    "LinkedIn"
                ],
                "websites": [
                    "amiboard.substack.com"
                ],
                "products": [
                    "Faire"
                ]
            }
        }
    ],
    "lightning_round": {
        "books": [
            {
                "title": "The Year of Yes",
                "author": "Shonda Rhimes",
                "why": "It's about just saying yes to things and finding your voice when you do feel like you're sometimes the first or the only or the different, and what that feels like."
            }
        ],
        "tv_movies": [
            {
                "title": "The Office",
                "type": "tv_show",
                "why": "Things are just very comfortable that I already know everything, there's no surprises."
            },
            {
                "title": "30 Rock",
                "type": "tv_show",
                "why": "Things are just very comfortable that I already know everything, there's no surprises."
            }
        ],
        "products": [
            {
                "name": "Fellow's electric kettle",
                "why": "It's a calming ritual and just a little feeling of luxury."
            }
        ],
        "life_motto": "You can either have more energy or less ambition",
        "interview_question": None,
        "productivity_tip": None
    }
}

try:
    with open(filepath, 'r') as f:
        data = json.load(f)
    
    # Check if entry already exists to avoid duplicates
    exists = False
    for entry in data:
        if entry['filename'] == new_entry['filename']:
            exists = True
            break
            
    if not exists:
        data.append(new_entry)
        with open(filepath, 'w') as f:
            json.dump(data, f, indent=2)
        print("Successfully appended Ami Vora.")
    else:
        print("Ami Vora already exists.")

except Exception as e:
    print(f"Error: {e}")
