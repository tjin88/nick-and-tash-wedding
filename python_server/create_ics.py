import os
from datetime import datetime

def generate_ics(event_title, start_datetime, end_datetime, location, description):
    """
    Generate the ICS content for an event.

    Args:
        event_title (str): The title of the event.
        start_datetime (str): Start datetime in the format "YYYY-MM-DD HH:MM:SS".
        end_datetime (str): End datetime in the format "YYYY-MM-DD HH:MM:SS".
        location (str): The event's location.
        description (str): Event description.

    Returns:
        str: The ICS content.
    """
    # Convert start and end datetime to the correct format
    start_time = datetime.strptime(start_datetime, "%Y-%m-%d %H:%M:%S")
    end_time = datetime.strptime(end_datetime, "%Y-%m-%d %H:%M:%S")

    # Format datetime in UTC
    start_datetime_utc = start_time.strftime("%Y%m%dT%H%M%SZ")
    end_datetime_utc = end_time.strftime("%Y%m%dT%H%M%SZ")
    dtstamp = datetime.utcnow().strftime("%Y%m%dT%H%M%SZ")

    # Generate UID based on the timestamp (this should be globally unique)
    uid = f"{dtstamp}-nick-and-tash-wedding"

    # Start the ICS content
    ics_content = """BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//NickAndTashWedding//NONSGML v1.0//EN
CALSCALE:GREGORIAN
"""

    # Event details
    ics_content += f"""BEGIN:VEVENT
UID:{uid}
DTSTAMP:{dtstamp}
DTSTART:{start_datetime_utc}
DTEND:{end_datetime_utc}
SUMMARY:{event_title}
DESCRIPTION:{description}
LOCATION:{location}
STATUS:CONFIRMED
SEQUENCE:0
TRANSP:OPAQUE
BEGIN:VALARM
TRIGGER:-P2DT0H0M
DESCRIPTION:Reminder: {event_title}
ACTION:DISPLAY
END:VALARM
END:VEVENT
"""

    # End the ICS content
    ics_content += """END:VCALENDAR
"""

    return ics_content

def save_ics(ics_content, filename="wedding_invite.ics"):
    """
    Save the generated ICS content to a file.

    Args:
        ics_content (str): The ICS content to save.
        filename (str): The filename where the ICS content will be saved.
    """
    try:
        with open(filename, 'w') as f:
            f.write(ics_content)
        print(f"ICS file saved successfully at {os.path.abspath(filename)}")
    except Exception as e:
        print(f"Error saving ICS file: {e}")

def main():
    # Event details
    event_title = "Nicholas & Natasha's Wedding"
    start_datetime = "2025-08-23 22:00:00"  # Format: YYYY-MM-DD HH:MM:SS (local time)
    end_datetime = "2025-08-24 00:00:00"   # Format: YYYY-MM-DD HH:MM:SS (local time)
    location = "Sheraton Toronto Airport Hotel & Conference Centre, 801 Dixon Road, Toronto, ON"
    description = "Join us to celebrate the wedding of Nicholas and Natasha!"
    
    # Generate ICS content
    ics_content = generate_ics(event_title, start_datetime, end_datetime, location, description)

    # Save ICS to file
    save_ics(ics_content)

if __name__ == "__main__":
    main()
