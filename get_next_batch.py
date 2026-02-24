import json
import os
import sys

def main():
    try:
        with open('recommendations.json', 'r') as f:
            data = json.load(f)
            processed = set(item['filename'] for item in data)
    except FileNotFoundError:
        processed = set()

    all_files = sorted([f for f in os.listdir('lennys-podcast-transcripts') if f.endswith('.txt')])
    unprocessed = [f for f in all_files if f not in processed]
    
    # Print next 5
    for f in unprocessed[:5]:
        print(f)

if __name__ == "__main__":
    main()
