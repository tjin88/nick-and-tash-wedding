import os
import csv
import argparse
from pymongo import MongoClient
from bson import ObjectId
from dotenv import load_dotenv
import re

'''
python simple_db_calls.py --function dietary
    Export guests with meaningful dietary requirements to out_db_calls/guests_with_dietary_requirements_cleaned.csv
python simple_db_calls.py --function rsvp [--location all|canada|australia]
    Export all guests who have RSVP'd (responded with any status) to out_db_calls/guests_who_have_rsvpd.csv
    Optional location filter: all (default), canada, or australia
python simple_db_calls.py --function attending [--location all|canada|australia]
    Export guests who have RSVP'd as attending (Australia or Canada) to out_db_calls/guests_attending.csv
    Optional location filter: all (default), canada, or australia
python simple_db_calls.py --function all_invites [--location all|canada|australia]
    Export all invites and their guests to out_db_calls/all_invites.csv
    Optional location filter: all (default), canada, or australia
python simple_db_calls.py --function reset_invite --invite_id <invite_id> [--given_plus_one true|false]
    Reset specific fields for an invite and optionally update givenPlusOne
python simple_db_calls.py --function delete_photos [--location all|canada|australia]
    Delete all photos from the database
    Optional location filter: all (default), canada, or australia
'''

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
photo_collection = db['photos']

# List of values to treat as 'no dietary restriction', all cleaned (lowercase, no punctuation, no spaces)
EXCLUDE_DIETARY = {"no", "none", "na", "nil", "nope", "notattending", "norestrictions"}

def is_meaningful_dietary(val):
    """Check if dietary requirement is meaningful (not empty or generic 'no' response)"""
    # Remove punctuation, lowercase, and strip
    cleaned = re.sub(r'[^a-zA-Z0-9 ]', '', val).strip().lower().replace(' ', '')
    return cleaned and cleaned not in EXCLUDE_DIETARY

def export_dietary_requirements():
    """Export guests with meaningful dietary requirements"""
    print("Fetching guests with dietary requirements...")
    
    # Query all invites
    invites = invite_collection.find({})
    
    rows = []
    for invite in invites:
        invited_location = invite.get('invitedLocation', 'Unknown')
        guests = invite.get('guests', [])
        
        for guest in guests:
            first = guest.get('firstName', '')
            last = guest.get('lastName', '')
            dietary = guest.get('dietaryRequirements', '')
            
            if dietary.strip() and is_meaningful_dietary(dietary):
                rows.append({
                    'firstName': first,
                    'lastName': last,
                    'dietaryRequirements': dietary,
                    'invitedLocation': invited_location
                })
    
    # Write to CSV
    os.makedirs('out_db_calls', exist_ok=True)
    filename = 'out_db_calls/guests_with_dietary_requirements_cleaned.csv'
    
    with open(filename, 'w', newline='', encoding='utf-8') as csvfile:
        fieldnames = ['firstName', 'lastName', 'dietaryRequirements', 'invitedLocation']
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()
        for row in rows:
            writer.writerow(row)
    
    print(f"Exported {len(rows)} guests with meaningful dietary requirements to {filename}")

def export_rsvp_responses(location_filter="all"):
    """Export all guests who have RSVP'd (responded with any status)"""
    location_display = location_filter.title() if location_filter != "all" else "All Locations"
    print(f"Fetching guests who have RSVP'd from {location_display}...")
    
    # Query all invites
    invites = invite_collection.find({})
    
    rows = []
    for invite in invites:
        invited_location = invite.get('invitedLocation', 'Unknown')
        
        # Apply location filter
        if location_filter != "all":
            if invited_location.lower() != location_filter.lower():
                continue
        
        guests = invite.get('guests', [])
        
        for guest in guests:
            first = guest.get('firstName', '')
            last = guest.get('lastName', '')
            attending_status = guest.get('attendingStatus', '')
            
            # Only include guests who have responded (attendingStatus is not empty)
            if attending_status.strip():
                rows.append({
                    'firstName': first,
                    'lastName': last,
                    'attendingStatus': attending_status,
                    'invitedLocation': invited_location
                })
    
    # Write to CSV
    os.makedirs('out_db_calls', exist_ok=True)
    
    # Include location in filename if filtered
    if location_filter == "all":
        filename = 'out_db_calls/guests_who_have_rsvpd.csv'
    else:
        filename = f'out_db_calls/guests_who_have_rsvpd_{location_filter.lower()}.csv'
    
    with open(filename, 'w', newline='', encoding='utf-8') as csvfile:
        fieldnames = ['firstName', 'lastName', 'attendingStatus', 'invitedLocation']
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()
        for row in rows:
            writer.writerow(row)
    
    print(f"Exported {len(rows)} guests who have RSVP'd from {location_display} to {filename}")

def export_attending_guests(location_filter="all"):
    """Export guests who have RSVP'd as attending (Australia or Canada)"""
    location_display = location_filter.title() if location_filter != "all" else "All Locations"
    print(f"Fetching guests who have RSVP'd as attending from {location_display}...")
    
    # Define the attending status values based on the schema
    attending_statuses = ['Canada Only', 'Australia Only', 'Both Australia and Canada']
    
    # Query all invites
    invites = invite_collection.find({})
    
    rows = []
    for invite in invites:
        invited_location = invite.get('invitedLocation', 'Unknown')
        
        # Apply location filter
        if location_filter != "all":
            if invited_location.lower() != location_filter.lower():
                continue
        
        guests = invite.get('guests', [])
        
        for guest in guests:
            first = guest.get('firstName', '')
            last = guest.get('lastName', '')
            attending_status = guest.get('attendingStatus', '')
            
            # Only include guests who have RSVP'd as attending
            if attending_status.strip() and attending_status in attending_statuses:
                rows.append({
                    'firstName': first,
                    'lastName': last,
                    'attendingStatus': attending_status,
                    'invitedLocation': invited_location
                })
    
    # Write to CSV
    os.makedirs('out_db_calls', exist_ok=True)
    
    # Include location in filename if filtered
    if location_filter == "all":
        filename = 'out_db_calls/guests_attending.csv'
    else:
        filename = f'out_db_calls/guests_attending_{location_filter.lower()}.csv'
    
    with open(filename, 'w', newline='', encoding='utf-8') as csvfile:
        fieldnames = ['firstName', 'lastName', 'attendingStatus', 'invitedLocation']
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()
        for row in rows:
            writer.writerow(row)
    
    print(f"Exported {len(rows)} guests who have RSVP'd as attending from {location_display} to {filename}")

def export_all_invites(location_filter="all"):
    """Export all invites and their guests"""
    location_display = location_filter.title() if location_filter != "all" else "All Locations"
    print(f"Fetching all invites from {location_display}...")
    
    # Query all invites
    invites = invite_collection.find({})
    
    rows = []
    for invite in invites:
        invited_location = invite.get('invitedLocation', 'Unknown')
        
        # Apply location filter
        if location_filter != "all":
            if invited_location.lower() != location_filter.lower():
                continue
        
        invite_id = str(invite.get('_id', ''))
        given_plus_one = invite.get('givenPlusOne', False)
        guests = invite.get('guests', [])
        
        for guest in guests:
            first = guest.get('firstName', '')
            last = guest.get('lastName', '')
            attending_status = guest.get('attendingStatus', '')
            dietary = guest.get('dietaryRequirements', '')
            
            rows.append({
                'inviteId': invite_id,
                'firstName': first,
                'lastName': last,
                'attendingStatus': attending_status,
                'dietaryRequirements': dietary,
                'invitedLocation': invited_location,
                'givenPlusOne': given_plus_one
            })
    
    # Write to CSV
    os.makedirs('out_db_calls', exist_ok=True)
    
    # Include location in filename if filtered
    if location_filter == "all":
        filename = 'out_db_calls/all_invites.csv'
    else:
        filename = f'out_db_calls/all_invites_{location_filter.lower()}.csv'
    
    with open(filename, 'w', newline='', encoding='utf-8') as csvfile:
        fieldnames = ['inviteId', 'firstName', 'lastName', 'attendingStatus', 'dietaryRequirements', 'invitedLocation', 'givenPlusOne']
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()
        for row in rows:
            writer.writerow(row)
    
    print(f"Exported {len(rows)} guests from all invites in {location_display} to {filename}")

def reset_invite(invite_id, given_plus_one=None):
    """Reset specific fields for an invite and optionally update givenPlusOne"""
    print(f"Resetting invite with ID: {invite_id}")
    
    # Convert string ID to ObjectId
    try:
        object_id = ObjectId(invite_id)
    except Exception as e:
        print(f"Error: Invalid invite ID format: {invite_id}")
        return False
    
    # Build the update document for invite-level fields
    update_fields = {
        'numGuestsMorningBreakfast': -1,
        'numGuestsOnBus': -1,
        'guestAccommodationAddress': '',
        'guestAccommodationLocalName': '',
        'hasRSVPd': False
    }
    
    # Add givenPlusOne if specified
    if given_plus_one is not None:
        update_fields['givenPlusOne'] = given_plus_one
    
    # First, get the current invite to access its guests
    invite = invite_collection.find_one({'_id': object_id})
    if not invite:
        print(f"Error: No invite found with ID {invite_id}")
        return False
    
    # Reset attendingStatus for each guest
    guests = invite.get('guests', [])
    updated_guests = []
    for guest in guests:
        updated_guest = guest.copy()
        updated_guest['attendingStatus'] = ''
        updated_guests.append(updated_guest)
    
    # Add the updated guests to the update fields
    update_fields['guests'] = updated_guests
    
    # Update the invite
    result = invite_collection.update_one(
        {'_id': object_id},
        {'$set': update_fields}
    )
    
    if result.modified_count == 0:
        print(f"Warning: Invite {invite_id} found but no changes were made")
        return True
    else:
        print(f"Successfully reset invite {invite_id}")
        print(f"Reset attendingStatus for {len(updated_guests)} guests")
        if given_plus_one is not None:
            print(f"Updated givenPlusOne to: {given_plus_one}")
        return True

def delete_all_photos(location_filter="all"):
    """Delete all photos from the database"""
    location_display = location_filter.title() if location_filter != "all" else "All Locations"
    print(f"Deleting all photos from {location_display}...")
    
    # Build the query based on location filter
    if location_filter == "all":
        query = {}
    else:
        query = {"location": location_filter.lower()}
    
    # Count photos before deletion
    photo_count = photo_collection.count_documents(query)
    
    if photo_count == 0:
        print(f"No photos found for {location_display}")
        return
    
    # Confirm deletion
    print(f"Found {photo_count} photos to delete from {location_display}")
    confirm = input(f"Are you sure you want to delete all {photo_count} photos from {location_display}? (yes/no): ")
    
    if confirm.lower() != 'yes':
        print("Deletion cancelled.")
        return
    
    # Delete the photos
    result = photo_collection.delete_many(query)
    
    print(f"Successfully deleted {result.deleted_count} photos from {location_display}")

def main():
    parser = argparse.ArgumentParser(description='Wedding database query tool')
    parser.add_argument('--function', '-f', 
                       choices=['dietary', 'rsvp', 'attending', 'all_invites', 'reset_invite', 'delete_photos'], 
                       required=True,
                       help='Function to run: dietary (guests with dietary requirements), rsvp (guests who have responded), attending (guests who have RSVP\'d as attending), all_invites (all invites), reset_invite (reset specific invite fields), or delete_photos (delete all photos)')
    parser.add_argument('--location', '-l',
                       choices=['all', 'canada', 'australia'],
                       default='all',
                       help='Location filter for RSVP, attending, invites, and delete_photos functions (default: all)')
    parser.add_argument('--invite_id', '-i',
                       help='Invite ID for reset_invite function')
    parser.add_argument('--given_plus_one', '-g',
                       choices=['true', 'false'],
                       help='Set givenPlusOne value for reset_invite function (true/false)')
    
    args = parser.parse_args()
    
    if args.function == 'dietary':
        export_dietary_requirements()
    elif args.function == 'rsvp':
        export_rsvp_responses(args.location)
    elif args.function == 'attending':
        export_attending_guests(args.location)
    elif args.function == 'all_invites':
        export_all_invites(args.location)
    elif args.function == 'reset_invite':
        if not args.invite_id:
            print("Error: --invite_id is required for reset_invite function")
            return
        
        # Convert given_plus_one string to boolean if provided
        given_plus_one_bool = None
        if args.given_plus_one:
            given_plus_one_bool = args.given_plus_one.lower() == 'true'
        
        reset_invite(args.invite_id, given_plus_one_bool)
    elif args.function == 'delete_photos':
        delete_all_photos(args.location)

if __name__ == "__main__":
    main()
