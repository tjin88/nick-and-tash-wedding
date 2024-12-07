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
            wedding_date = "23 AUGUST 2025"
            
            # Generate HTML email content
            email_content = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {{
                        font-family: Arial, sans-serif;
                        line-height: 1.6;
                        color: #333333;
                        max-width: 600px;
                        margin: 0 auto;
                        text-align: center;
                    }}
                    .title {{
                        font-size: 24px;
                        margin: 20px 0;
                    }}
                    .date {{
                        font-size: 18px;
                        margin: 15px 0;
                    }}
                    .content {{
                        text-align: left;
                        margin: 20px 0;
                    }}
                    .button {{
                        display: inline-block;
                        padding: 10px 20px;
                        background-color: #333333;
                        color: white;
                        text-decoration: none;
                        border-radius: 5px;
                        margin: 10px 0;
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
                        Dear {greeting},
                        <br><br>
                        We're making it official, and you're cordially invited!
                        <br><br>
                        We have a wedding website with all the details—from travel and lodging to the day-of schedule and what to wear. 
                        Take a look to RSVP and find more information. We hope you can join us!
                        <br><br>
                        {"You are welcome to bring a plus one to our celebration!<br><br>" if has_plus_one else ""}
                    </div>

                    <a href="{invite_link}" class="button">View Invitation</a>
                    
                    <div class="footer">
                        This message was sent on behalf of Nicholas and Natasha.
                    </div>
                </div>
            </body>
            </html>
            """
            
            # Send the email
            subject = "Save the Date - Nick & Tash's Wedding Celebration"
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
    file_path = './csv/Nick & Tash Canadian Wedding - Sample.csv'
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