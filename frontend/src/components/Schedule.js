import React from 'react';
import './Schedule.css';

function Schedule({ invitedLocation }) {

  const canadianSchedule = [
    {
      title: "5 PM: Appetizers and Family Group Photos",
      // time: "August 23, 2025, 5:00 PM",
      // location: "Sheraton Parkway Toronto North Hotel & Suites (Hwy 7 and Leslie Street)",
      details: [],
    },
    {
      title: "6 PM: Guests to be Seated",
      // time: "August 23, 2025, 6:00 PM",
      // location: "Sheraton Parkway Toronto North Hotel & Suites (Hwy 7 and Leslie Street)",
      details: [],
    },
    {
      title: "6:30 PM: Food is Served",
      // time: "August 23, 2025, 6:30 PM",
      // location: "Sheraton Parkway Toronto North Hotel & Suites (Hwy 7 and Leslie Street)",
      details: [],
    },
    {
      title: "Dinner and dancing to follow",
      // time: "August 23, 2025, 6:30 PM",
      // location: "Sheraton Parkway Toronto North Hotel & Suites (Hwy 7 and Leslie Street)",
      details: [],
    }
  ];

  const australianSchedule = [
    {
      title: "Welcome Drinks",
      time: "October 10, 2025, 6:00 PM",
      location: "Sydney Location",
      details: [
        "Welcome drinks for all guests",
        "Smart casual attire"
      ]
    },
    {
      title: "Wedding Ceremony",
      time: "October 11, 2025, 2:00 PM",
      location: "Sydney Wedding Venue",
      details: [
        "Ceremony begins promptly",
        "Formal attire"
      ]
    },
    {
      title: "Reception",
      time: "October 11, 2025, 4:00 PM",
      location: "Sydney Reception Venue",
      details: [
        "Cocktail hour",
        "Dinner and dancing to follow"
      ]
    }
  ];

  const renderLocationSchedule = (location) => (
    <div className="schedule-section">
      <div className="schedule-column col-lg-10">
        {location !== 'Canada' && <h2 className="schedule-location-title">{invitedLocation === 'Both Australia and Canada' ? `${location} ` : ''}Wedding Events</h2>}
        {(location === 'Canada' ? canadianSchedule : australianSchedule).map((item, index) => (
          <div key={index} className="schedule-item">
            <h2>{item.title}</h2>
            {item.time && item.location && <div className='scheduleHorizontal'>
              <h3>{item.time}</h3>
              <h3>|</h3>
              <h3><em>{item.location}</em></h3>
            </div>}
            <ul>
              {item.details.map((detail, i) => (
                <li key={i}>{detail}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="schedule">
      <h1 className="title schedule-title">Schedule</h1>
      {invitedLocation === 'Both Australia and Canada' ? (
        <div className="schedule-container">
          {renderLocationSchedule('Canada')}
          <div className="schedule-divider"></div>
          {renderLocationSchedule('Australia')}
        </div>
      ) : (
        renderLocationSchedule(invitedLocation)
      )}
    </div>
  );
}

export default Schedule;