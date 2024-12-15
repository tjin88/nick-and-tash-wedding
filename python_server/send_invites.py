import pandas as pd
import requests
import json
import smtplib
import os
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.image import MIMEImage
from pathlib import Path
from datetime import datetime
from urllib.parse import urlencode
from dotenv import load_dotenv

# Load .env file from the current directory
if not load_dotenv():
    raise ValueError("No .env file found in the current directory")
        
# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('./out/log/wedding_invites.log'),
        logging.StreamHandler()
    ]
)

class EmailManager:
    def __init__(self, email_address, email_password):
        self.email_address = email_address
        self.email_password = email_password
        self.smtp_server = "smtp.gmail.com"
        self.smtp_port = 587
        
    def send_email(self, to_addresses, subject, html_content, image_path=None):
        """Sends an HTML email with an embedded image"""
        msg = MIMEMultipart('related')
        msg['Subject'] = subject
        msg['From'] = self.email_address
        msg['To'] = ', '.join(to_addresses)

        # Create HTML part
        html_part = MIMEText(html_content, 'html')
        msg.attach(html_part)

        # Attach image if provided
        if image_path and Path(image_path).exists():
            try:
                with open(image_path, 'rb') as f:
                    img = MIMEImage(f.read())
                    img.add_header('Content-ID', '<wedding_photo>')
                    msg.attach(img)
            except Exception as e:
                logging.error(f"Failed to attach image {image_path}: {str(e)}")

        # Send email
        try:
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls()
                server.login(self.email_address, self.email_password)
                server.send_message(msg)
            logging.info(f"Successfully sent email to {to_addresses}")
            return True
        except Exception as e:
            logging.error(f"Failed to send email to {to_addresses}: {str(e)}")
            return False

class WeddingInviteManager:
    def __init__(self, api_url='https://nick-and-tash-wedding.onrender.com'):
        self.api_url = api_url
        self.base_website = 'https://nick-and-tash-wedding.web.app'

    def _parse_guests_with_last_names(self, guests):
        """
        Parse the guest list to determine if a shared last name should be applied.
        Returns a list of dictionaries with firstName and lastName for each guest.
        """
        # First, identify all explicit last names in the invite
        explicit_last_names = set()
        for guest in guests:
            name_parts = guest.split()
            if len(name_parts) > 1:
                explicit_last_names.add(' '.join(name_parts[1:]))
        
        # If there's exactly one explicit last name, use it as shared last name
        shared_last_name = next(iter(explicit_last_names)) if len(explicit_last_names) == 1 else None
        
        # Process each guest
        guest_data = []
        for guest in guests:
            name_parts = guest.split()
            first_name = name_parts[0]
            
            if len(name_parts) > 1:
                # Guest has their own last name, use it
                last_name = ' '.join(name_parts[1:])
            else:
                # Guest has no last name
                # Only use shared last name if there's exactly one explicit last name in the group
                last_name = shared_last_name if shared_last_name else ''
            
            guest_data.append({
                'firstName': first_name,
                'lastName': last_name,
                'dietaryRequirements': '',
                'attendingStatus': ''
            })
            
        return guest_data

    def create_invite(self, guests, given_plus_one=False, location='Canada'):
        """Creates an invite through the API and returns the invite ID"""
        guest_data = self._parse_guests_with_last_names(guests)
        
        # Log the parsed guest data for debugging
        logging.info(f"Parsed guest data: {json.dumps(guest_data, indent=2)}")
        
        payload = {
            'guests': guest_data,
            'givenPlusOne': given_plus_one,
            'invitedLocation': location
        }

        try:
            response = requests.post(
                f'{self.api_url}/api/invites',
                headers={'Content-Type': 'application/json'},
                json=payload
            )
            response.raise_for_status()
            return response.json()['_id']
        except requests.exceptions.RequestException as e:
            logging.error(f"Failed to create invite for {guests}: {str(e)}")
            raise

    def generate_invite_link(self, invite_id):
        """Generates the full invite link for the given invite ID"""
        return f"{self.base_website}/invite/{invite_id}"

def format_guest_list(guests):
    """Formats a list of guests into a natural greeting"""
    if len(guests) == 1:
        return guests[0]
    elif len(guests) == 2:
        return f"{guests[0]} and {guests[1]}"
    else:
        return f"{', '.join(guests[:-1])}, and {guests[-1]}"

def generate_calendar_links(event_title, start_datetime, end_datetime, location, description, invite_id):
    """
    Generate Google Calendar and Apple/Outlook Calendar links.

    Args:
        event_title (str): The title of the event.
        start_datetime (str): Start datetime in the format "YYYYMMDDTHHMMSSZ".
        end_datetime (str): End datetime in the format "YYYYMMDDTHHMMSSZ".
        location (str): The event's location.
        description (str): Event description.

    Returns:
        tuple: Google Calendar link, Apple/Outlook .ics content link.
    """
    # Google Calendar link
    base_google = "https://www.google.com/calendar/render?"
    google_params = {
        'action': 'TEMPLATE',
        'text': event_title,
        'dates': f"{start_datetime}/{end_datetime}",
        'details': description,
        'location': location
    }
    google_link = base_google + urlencode(google_params)
    apple_outlook_link = f"https://nick-and-tash-wedding.onrender.com/api/download-ics/{invite_id}"

    return google_link, apple_outlook_link


def process_and_send_invites(dataframe, email_manager, invite_manager, image_path=None):
    """Process the guest list and send emails"""
    results = []
    
    for idx, row in dataframe.iterrows():
        try:
            # Parse guests and emails
            guests = [g.strip() for g in row['Guests'].split(',')]
            emails_list = [e.strip() for e in row['email'].split(',')]
            has_plus_one = pd.notna(row['plus one']) and row['plus one'].lower() == 'yes'
            
            logging.info(f"Processing invite for guests: {guests}")
            
            # Create invite through API
            invite_id = invite_manager.create_invite(
                guests=guests,
                given_plus_one=has_plus_one
            )
            invite_link = invite_manager.generate_invite_link(invite_id)
            
            # Format guest names for greeting
            greeting = format_guest_list(guests)
            wedding_date = "23 AUGUST 2025 | 5:00 PM EDT"
            google_link, apple_outlook_link = generate_calendar_links(
                event_title="Nicholas & Natasha's Wedding",
                start_datetime="20250823T210000Z",  # 5 PM EDT
                end_datetime="20250824T040000Z",
                location="Sheraton Parkway Toronto North Hotel & Suites, 600 Hwy 7, Richmond Hill, ON L4B 1B2",
                description=f"Join us to celebrate the wedding of Nicholas and Natasha!\n\nLink to invite: https://nick-and-tash-wedding.onrender.com/api/download-ics/{invite_id}",
                invite_id=invite_id
            )
            
            # Generate HTML email content
            email_content = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {{
                        font-family: Arial, sans-serif;
                        color: #333333;
                        max-width: 600px;
                        margin: 0 auto;
                        text-align: center;
                        line-height: 1.6;
                    }}
                    a.button {{
                        text-decoration: none;
                        color: white;
                    }}

                    .title {{
                        color: #3c4c24;
                        font-size: 28px;
                        font-weight: bold;
                        margin-top: 20px;
                    }}
                    .date {{
                        font-size: 20px;
                        color: #555555;
                        margin: 10px 0;
                    }}
                    .content {{
                        margin: 20px 0;
                    }}
                    .button {{
                        display: inline-block;
                        padding: 10px 20px;
                        margin: 10px;
                        background-color: #3c4c24;
                        color: white;
                        text-decoration: none;
                        border-radius: 5px;
                        font-size: 16px;
                    }}
                    .button:hover {{
                        background-color: #566d31;
                    }}
                    .footer {{
                        margin-top: 30px;
                        font-size: 14px;
                        color: #666666;
                    }}
                </style>
            </head>
            <body>
                <div>
                    <img src="cid:wedding_photo" alt="Nicholas & Natasha" style="max-width: 100%; margin-bottom: 20px;">
                    <div class="title">Nicholas & Natasha</div>
                    <div class="date">{wedding_date}</div>
                    
                    <div class="content">
                        Dear {greeting},<br><br>
                        You are cordially invited to share in our celebration! 
                        We have a wedding reception website with all the details - from travel and lodging 
                        to the evening-of schedule and what to wear. 
                        Take a look to RSVP and find more information. We hope you can join us!
                    </div>

                    <a href="{invite_link}" class="button">View Invitation</a>
                    <a href="{google_link}" class="button">Add to Google Calendar</a>
                    <a href="{apple_outlook_link}" class="button">Add to Apple/Outlook Calendar</a>

                    <div class="footer">
                        This message was sent on behalf of Nicholas & Natasha. 
                    </div>
                </div>
            </body>
            </html>

            """
            
            # Send the email
            subject = "Invitation to Nicholas and Natasha’s Toronto Wedding Reception"
            email_sent = email_manager.send_email(
                to_addresses=emails_list,
                subject=subject,
                html_content=email_content,
                image_path=image_path
            )
            
            # Record the result
            results.append({
                'guests': ', '.join(guests),
                'emails': ', '.join(emails_list),
                'invite_id': invite_id,
                'invite_link': invite_link,
                'email_sent': email_sent,
                'timestamp': datetime.now().isoformat()
            })
            
        except Exception as e:
            logging.error(f"Error processing row {idx}: {str(e)}")
            results.append({
                'guests': ', '.join(guests) if 'guests' in locals() else 'Unknown',
                'emails': ', '.join(emails_list) if 'emails_list' in locals() else 'Unknown',
                'invite_id': None,
                'invite_link': None,
                'email_sent': False,
                'error': str(e),
                'timestamp': datetime.now().isoformat()
            })
    
    return results

def main():
    # Load environment variables
    email_address = os.getenv('WEDDING_EMAIL')
    email_password = os.getenv('WEDDING_EMAIL_PASSWORD')
    
    if not email_address or not email_password:
        raise ValueError("Email credentials not found in environment variables")
    
    # Initialize managers
    email_manager = EmailManager(email_address, email_password)
    invite_manager = WeddingInviteManager()
    
    # Load the CSV file
    file_path = './csv/Nick & Tash Canadian Wedding - To Be Sent.csv'
    image_path = './images/nick_and_tash_cropped.jpg'
    
    try:
        data = pd.read_csv(file_path)
        logging.info(f"Successfully loaded {len(data)} rows from CSV")
        
        # Process invites and send emails
        results = process_and_send_invites(
            dataframe=data,
            email_manager=email_manager,
            invite_manager=invite_manager,
            image_path=image_path
        )
        
        # Save results to CSV
        results_df = pd.DataFrame(results)
        output_path = f'./out/sent_invites_{datetime.now().strftime("%Y%m%d_%H%M%S")}.csv'
        results_df.to_csv(output_path, index=False)
        logging.info(f"Results saved to {output_path}")
        
        # Print summary
        successful_sends = sum(1 for r in results if r['email_sent'])
        print(f"\nSummary:")
        print(f"Total invites processed: {len(results)}")
        print(f"Successful email sends: {successful_sends}")
        print(f"Failed email sends: {len(results) - successful_sends}")
        print(f"Results saved to: {output_path}")
        
    except Exception as e:
        logging.error(f"Critical error in main execution: {str(e)}")
        raise

if __name__ == "__main__":
    main()