#!/usr/bin/env python3
"""
RSVP Report Generator

This script fetches RSVP data from the wedding API and generates an Excel report
with three separate tabs for attendees who have responded Yes, No, or haven't responded yet.
"""

import os
import sys
import requests
import pandas as pd
from datetime import datetime
from dotenv import load_dotenv
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Default API URL - can be overridden with environment variable
API_BASE_URL = os.getenv('API_BASE_URL', 'http://localhost:3003')
RSVP_SUMMARY_ENDPOINT = '/api/rsvp-summary'

def fetch_rsvp_data():
    """Fetch RSVP data from the API endpoint"""
    try:
        url = f"{API_BASE_URL}{RSVP_SUMMARY_ENDPOINT}"
        logger.info(f"Fetching RSVP data from: {url}")
        
        response = requests.get(url)
        response.raise_for_status()  # Raise exception for HTTP errors
        
        return response.json()
    except requests.exceptions.RequestException as e:
        logger.error(f"Error fetching RSVP data: {e}")
        sys.exit(1)

def create_excel_report(data):
    """Create Excel report with three tabs for Yes, No, and Not Responded"""
    try:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        out_dir = os.path.join(os.path.dirname(__file__), 'rsvp_report')
        
        # Create output directory if it doesn't exist
        if not os.path.exists(out_dir):
            os.makedirs(out_dir)
            
        file_path = os.path.join(out_dir, f"wedding_rsvp_report_{timestamp}.xlsx")
        
        # Create a Pandas Excel writer using openpyxl as the engine
        with pd.ExcelWriter(file_path, engine='openpyxl') as writer:
            
            # Process each status category
            for status in ['Yes', 'No', 'Not Responded']:
                # Convert the list of dictionaries to a dataframe
                df = pd.DataFrame(data[status])
                
                # Reorder and rename columns for better readability
                columns_order = ['name', 'status', 'location', 'inviteId']
                column_names = {
                    'name': 'Guest Name', 
                    'status': 'RSVP Status', 
                    'location': 'Invited Location', 
                    'inviteId': 'Invite ID'
                }
                
                # Make sure all columns exist (even if empty)
                for col in columns_order:
                    if col not in df.columns:
                        df[col] = None
                
                # Select and rename columns
                df = df[columns_order].rename(columns=column_names)
                
                # Write dataframe to Excel sheet
                df.to_excel(writer, sheet_name=status, index=False)
                
                # Adjust column widths
                worksheet = writer.sheets[status]
                for i, col in enumerate(df.columns):
                    max_width = max(
                        df[col].astype(str).map(len).max(),
                        len(col)
                    ) + 2  # Add padding
                    # Convert to Excel column width which is in characters
                    worksheet.column_dimensions[chr(65 + i)].width = max_width
        
        logger.info(f"Excel report generated: {file_path}")
        return file_path
        
    except Exception as e:
        logger.error(f"Error creating Excel report: {e}")
        sys.exit(1)

def generate_summary_statistics(data):
    """Generate and print summary statistics"""
    yes_count = len(data['Yes'])
    no_count = len(data['No'])
    not_responded_count = len(data['Not Responded'])
    total_guests = yes_count + no_count + not_responded_count
    
    # Calculate response rate
    response_rate = ((yes_count + no_count) / total_guests) * 100 if total_guests > 0 else 0
    
    # Count by location for 'Yes' responses
    location_counts = {}
    for guest in data['Yes']:
        location = guest.get('status', 'Unknown')
        location_counts[location] = location_counts.get(location, 0) + 1
    
    print("\n===== WEDDING RSVP SUMMARY =====")
    print(f"Total Guests: {total_guests}")
    print(f"Attending: {yes_count} ({yes_count/total_guests*100:.1f}%)")
    print(f"Not Attending: {no_count} ({no_count/total_guests*100:.1f}%)")
    print(f"Not Responded: {not_responded_count} ({not_responded_count/total_guests*100:.1f}%)")
    print(f"Response Rate: {response_rate:.1f}%")
    
    if location_counts:
        print("\n----- Attending By Location -----")
        for location, count in location_counts.items():
            print(f"{location}: {count} guests ({count/yes_count*100:.1f}%)")
    
    print("================================\n")

def main():
    """Main function to run the script"""
    try:
        logger.info("Starting RSVP report generation")
        
        # Fetch data from API
        data = fetch_rsvp_data()
        
        # Generate Excel report
        excel_path = create_excel_report(data)
        
        # Print summary statistics
        generate_summary_statistics(data)
        
        logger.info("RSVP report generation completed successfully")
        print(f"Excel report saved to: {excel_path}")
        
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main() 