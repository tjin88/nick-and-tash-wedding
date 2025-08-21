import React from 'react';
import './Rsvp.css';

function DateAndVenue() {
  const canadaLocation = "Sheraton Parkway Toronto North Hotel & Suites, 600 Hwy 7, Richmond Hill, ON L4B 1B2";
  
  return (
    <div className="rsvp-table-container date-venue-container">
      <div className='title'>Date & Venue</div>
      <p>We're looking forward to celebrating Nicholas and Natasha’s wedding with you.</p>
      <p><strong>Saturday August 23, 2025 @ 5:00 PM</strong></p>
      <p>Location: {canadaLocation}</p>
      
      <div className="map-container">
        <iframe
          title="Wedding Venue Location"
          src={`https://www.google.com/maps/embed/v1/place?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}&q=${encodeURIComponent(canadaLocation)}`}
          width="100%"
          height="300"
          style={{ border: 0, display: 'block' }}
          allowFullScreen=""
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
        <a 
          href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(canadaLocation)}`}
          className="directions-link"
          target="_blank"
          rel="noopener noreferrer"
        >
          Get Directions →
        </a>
      </div>
    </div>
  );
}

export default DateAndVenue;
