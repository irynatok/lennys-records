
import json
import os

transcript_dir = '/Users/irynatokarchuk/Dev/irynka-programynka/pet-projects/lennys-records/lennys-podcast-transcripts'
json_path = '/Users/irynatokarchuk/Dev/irynka-programynka/pet-projects/lennys-records/recommendations.json'

try:
    with open(json_path, 'r') as f:
        data = json.load(f)
    
    processed_files = set(entry.get('filename') for entry in data)
    
    all_files = sorted([f for f in os.listdir(transcript_dir) if f.endswith('.txt')])
    
    unprocessed = [f for f in all_files if f not in processed_files]
    
    # Skip the ones we just processed in this session if they weren't added to json (because they had no data)
    # The ones we processed: Adam Fishman.txt, Adam Grenier.txt, Amjad Masad.txt, Andy Johns.txt
    # Ami Vora.txt should be in json now.
    
    # But wait, if I don't add the ones without data to json, I will keep reprocessing them.
    # To avoid this, I should add them to json with empty recommendations or a "processed": true flag?
    # The existing schema doesn't seem to have a flag.
    # If I don't add them, I need to keep track of them somewhere else or just know which ones I've done.
    # For now, I'll just exclude them manually in the script or print the first 10 unprocessed and I'll pick the next 5.
    
    print("Top 10 unprocessed files:")
    for f in unprocessed[:10]:
        print(f)

except Exception as e:
    print(f"Error: {e}")
