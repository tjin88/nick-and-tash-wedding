import os
import csv
from pymongo import MongoClient
from dotenv import load_dotenv
import re

load_dotenv()

MONGO_USER = os.getenv('MONGO_USER')
MONGO_PASS = os.getenv('MONGO_PASS')
MONGO_CLUSTER = os.getenv('MONGO_CLUSTER')

if not all([MONGO_USER, MONGO_PASS, MONGO_CLUSTER]):
    raise Exception("Missing one or more required MongoDB environment variables.")

mongo_uri = f"mongodb+srv://{MONGO_USER}:{MONGO_PASS}@{MONGO_CLUSTER}.mongodb.net/db?retryWrites=true&w=majority"

client = MongoClient(mongo_uri)
db = client['db']
invite_collection = db['invites']

# Query all invites
invites = invite_collection.find({})

rows = []
# List of values to treat as 'no dietary restriction', all cleaned (lowercase, no punctuation, no spaces)
EXCLUDE_DIETARY = {"no", "none", "na", "nil", "nope", "notattending", "norestrictions"}

def is_meaningful_dietary(val):
    # Remove punctuation, lowercase, and strip
    cleaned = re.sub(r'[^a-zA-Z0-9 ]', '', val).strip().lower().replace(' ', '')
    return cleaned and cleaned not in EXCLUDE_DIETARY

for invite in invites:
    guests = invite.get('guests', [])
    for guest in guests:
        first = guest.get('firstName', '')
        last = guest.get('lastName', '')
        dietary = guest.get('dietaryRequirements', '')
        if dietary.strip() and is_meaningful_dietary(dietary):
            rows.append({
                'firstName': first,
                'lastName': last,
                'dietaryRequirements': dietary
            })

# Write to CSV
os.makedirs('out_db_calls', exist_ok=True)
with open('out_db_calls/guests_with_dietary_requirements_cleaned.csv', 'w', newline='', encoding='utf-8') as csvfile:
    fieldnames = ['firstName', 'lastName', 'dietaryRequirements']
    writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
    writer.writeheader()
    for row in rows:
        writer.writerow(row)

print(f"Exported {len(rows)} guests with meaningful dietary requirements to out_db_calls/guests_with_dietary_requirements_cleaned.csv")
