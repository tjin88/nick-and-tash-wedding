import pandas as pd
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
        logging.FileHandler('./out_sent_invites/log/save_the_date.log'),
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
                    # TODO: Update the image name to be "cooked_the_goose.jpg" in the HTML content
                    img.add_header('Content-ID', '<save_the_date_photo>')
                    img.add_header('Content-Disposition', 'inline', filename="nick_and_tash.jpg")
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

def format_guest_list(guests):
    """Formats a list of guests into a natural greeting"""
    if len(guests) == 1:
        return guests[0]
    elif len(guests) == 2:
        return f"{guests[0]} and {guests[1]}"
    else:
        return f"{', '.join(guests[:-1])}, and {guests[-1]}"

def generate_calendar_links(event_title, start_datetime, end_datetime, location, description):
    """
    Generate Google Calendar link.

    Args:
        event_title (str): The title of the event.
        start_datetime (str): Start datetime in the format "YYYYMMDDTHHMMSSZ".
        end_datetime (str): End datetime in the format "YYYYMMDDTHHMMSSZ".
        location (str): The event's location.
        description (str): Event description.

    Returns:
        str: Google Calendar link
    """
    # Google Calendar link
    base_google = "https://www.google.com/calendar/render?"
    google_params = {
        'action': 'TEMPLATE',
        'text': event_title,
        'dates': f"{start_datetime}/{end_datetime}",
        'details': description,
        'location': location,
        'guestsCanInviteOthers': 'false',
        'guestsCanSeeOtherGuests': 'false'
    }
    google_link = base_google + urlencode(google_params)
    apple_outlook_link = f"https://nick-and-tash-wedding.onrender.com/api/download-australia-ics/"

    return google_link, apple_outlook_link

def process_and_send_emails(dataframe, email_manager, image_path=None):
    """Process the guest list and send emails"""
    results = []
    
    for idx, row in dataframe.iterrows():
        try:
            # Parse guests and emails
            guests = [g.strip() for g in row['Guests'].split(',')]
            emails_list = [e.strip() for e in row['email'].split(',')]
            
            logging.info(f"Processing save-the-date for guests: {guests}")
            
            # Format guest names for greeting
            greeting = format_guest_list(guests)
            event_date = "11 October 2025 | 3:00 PM AEST"
            google_link, apple_outlook_link = generate_calendar_links(
                event_title="Nicholas & Natasha's 🇦🇺 Wedding",
                start_datetime="20251011T050000Z",  # 3 PM AEST
                end_datetime="20251011T130000Z",  # 11 PM AEST
                location="Tiffany's Maleny, 409 Mountain View Road, Maleny QLD 4552",
                description="Join us to celebrate Nicholas and Natasha's wedding!"
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
                        margin-top: 24px;
                    }}
                    .date {{
                        font-size: 24px;
                        color: #555555;
                        margin: 10px 0;
                    }}
                    .content {{
                        margin: 20px 0;
                        font-size: 16px;
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
                    <img src="cid:save_the_date_photo" alt="Save the Date" style="max-width: 650px; margin: 30px auto;">
                    <div class="title">Nicholas & Natasha's Wedding</div>
                    <div class="date">{event_date}</div>
                    
                    <div class="content">
                        Dear {greeting},<br><br>
                        We're excited to announce that we're getting married! 
                        Please save the date and join us for our wedding celebration 
                        on October 11, 2025, 3:00 PM AEST at Tiffany's Maleny.<br><br>
                        Full Address: <a href="https://www.google.com/maps/place/Tiffany's+Maleny/@-26.780165,152.856227,17z/data=!3m1!4b1!4m6!3m5!1s0x6b9387a6d3e36c55:0x2fddd8e805ff0aa4!8m2!3d-26.780165!4d152.856227!16s%2Fg%2F1tj2nmwp">Tiffany's Maleny, 409 Mountain View Road, Maleny QLD 4552</a><br><br>
                        Invite with more details to come.
                    </div>
                    
                    <a href="{google_link}" class="button">Add to Google Calendar</a>
                    <a href="{apple_outlook_link}" class="button">Add to Apple/Outlook Calendar</a>
                </div>
            </body>
            </html>
            """
            
            # Send the email
            subject = "Save the Date - Nicholas and Natasha's 🇦🇺 Wedding !"
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
                'email_sent': email_sent,
                'timestamp': datetime.now().isoformat()
            })
            
        except Exception as e:
            logging.error(f"Error processing row {idx}: {str(e)}")
            results.append({
                'guests': ', '.join(guests) if 'guests' in locals() else 'Unknown',
                'emails': ', '.join(emails_list) if 'emails_list' in locals() else 'Unknown',
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
    
    # Initialize email manager
    email_manager = EmailManager(email_address, email_password)
    
    # Load the CSV file
    file_path = './csv/Nick & Tash Wedding Invites - To Be Sent (Australia) (5).csv'
    image_path = './images/save_the_date.jpg'
    
    try:
        data = pd.read_csv(file_path)
        logging.info(f"Successfully loaded {len(data)} rows from CSV")
        
        # Process and send emails
        results = process_and_send_emails(
            dataframe=data,
            email_manager=email_manager,
            image_path=image_path
        )
        
        # Save results to CSV
        results_df = pd.DataFrame(results)
        output_path = f'./out_sent_invites/sent_save_the_dates_{datetime.now().strftime("%Y%m%d_%H%M%S")}.csv'
        results_df.to_csv(output_path, index=False)
        logging.info(f"Results saved to {output_path}")
        
        # Print summary
        successful_sends = sum(1 for r in results if r['email_sent'])
        print(f"\nSummary:")
        print(f"Total emails processed: {len(results)}")
        print(f"Successful email sends: {successful_sends}")
        print(f"Failed email sends: {len(results) - successful_sends}")
        print(f"Results saved to: {output_path}")
        
    except Exception as e:
        logging.error(f"Critical error in main execution: {str(e)}")
        raise

if __name__ == "__main__":
    main()