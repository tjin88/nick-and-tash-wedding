import pandas as pd
import requests
import json

class WeddingInviteManager:
    def __init__(self, api_url='https://nick-and-tash-wedding.onrender.com'):
        self.api_url = api_url
        self.base_website = 'https://nick-and-tash-wedding.web.app'

    def create_invite(self, guests, given_plus_one=False, location='Canada'):
        """Creates an invite through the API and returns the invite ID"""
        guest_data = [{
            'firstName': guest.split()[0],
            'lastName': ' '.join(guest.split()[1:]) if len(guest.split()) > 1 else '',
            'dietaryRequirements': '',
            'attendingStatus': ''
        } for guest in guests]

        payload = {
            'guests': guest_data,
            'givenPlusOne': given_plus_one,
            'invitedLocation': location
        }

        response = requests.post(
            f'{self.api_url}/api/invites',
            headers={'Content-Type': 'application/json'},
            json=payload
        )
        
        if response.status_code != 201:
            raise Exception(f"Failed to create invite: {response.text}")
            
        return response.json()['_id']

    def generate_invite_link(self, invite_id):
        """Generates the full invite link for the given invite ID"""
        return f"{self.base_website}/invite/{invite_id}"

def format_guest_list(guests):
    """Formats a list of guests into a natural greeting (e.g., 'Person 1, Person 2 and Person 3')"""
    if len(guests) == 1:
        return guests[0]
    elif len(guests) == 2:
        return f"{guests[0]} and {guests[1]}"
    else:
        return f"{', '.join(guests[:-1])}, and {guests[-1]}"

def generate_emails_with_invites(dataframe, invite_manager):
    emails = []
    for _, row in dataframe.iterrows():
        # Parse guests and emails
        guests = [g.strip() for g in row['Guests'].split(',')]
        emails_list = [e.strip() for e in row['email'].split(',')]
        
        # Check for plus one
        has_plus_one = pd.notna(row['plus one']) and row['plus one'].lower() == 'yes'
        
        # Create invite through API
        try:
            invite_id = invite_manager.create_invite(
                guests=guests,
                given_plus_one=has_plus_one
            )
            invite_link = invite_manager.generate_invite_link(invite_id)
        except Exception as e:
            print(f"Error creating invite for {guests}: {str(e)}")
            continue

        # Format guest names for greeting
        greeting = format_guest_list(guests)

        # Generate email content with invite link
        email_content = f"""
        Dear {greeting},
        
        You are cordially invited to our wedding! We are thrilled to celebrate this special day with you.
        
        Please RSVP at your earliest convenience using your personal invite link:
        {invite_link}
        
        {"You are welcome to bring a plus one to our celebration!" if has_plus_one else ""}
        
        Best regards,
        Nick & Tash
        """
        
        # Create subject line
        subject = "Save the Date - Nick & Tash's Wedding Celebration"
        
        # Collect the email data
        emails.append({
            'to': emails_list,
            'subject': subject,
            'content': email_content.strip(),
            'invite_id': invite_id,
            'invite_link': invite_link
        })
    
    return emails

def main():
    # Initialize the invite manager
    invite_manager = WeddingInviteManager()
    
    # Load the CSV file
    file_path = './csv/Nick & Tash Canadian Wedding - Sample.csv'
    data = pd.read_csv(file_path)
    
    # Generate emails with invite links
    email_data = generate_emails_with_invites(data, invite_manager)
    
    # Display the results
    print("\nGenerated Invites and Emails:")
    for email in email_data:
        print(f"\nInvite ID: {email['invite_id']}")
        print(f"Link: {email['invite_link']}")
        print(f"To: {email['to']}")
        print("Content:")
        print(email['content'])
        print("-" * 80)
    
    # Optionally, save the results to a CSV for record keeping
    results_df = pd.DataFrame(email_data)
    results_df.to_csv('./out/generated_invites.csv', index=False)
    print("\nResults have been saved to 'generated_invites.csv'")

if __name__ == "__main__":
    main()