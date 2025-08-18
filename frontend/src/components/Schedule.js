import React from 'react';
import BrideToBe from '../images/Bride_To_Be.jpeg';
import './Schedule.css';

function Schedule({ invitedLocation }) {
  const canadianSchedule = [
    {
      title: "5:00pm | Arrival time - Appetizers and Open bar",
      details: [],
    },
    {
      title: "5:45pm | Guests seated",
      details: [],
    },
    {
      title: "6:00pm | Welcome Speech",
      details: [],
    },
    {
      title: "6:10pm | Food is served",
      details: [],
    },
    {
      title: "6:10pm | Family and friends group photos to be taken during the first 3 dinner courses",
      details: [],
    },
    {
      title: "Dancing to follow",
      details: [],
    }
  ];

  const australianSchedule = [
    {
      title: "2:20 PM: Guests Arrive",
      details: [],
    },
    {
      title: "3:00 PM: Wedding Ceremony",
      details: [],
    },
    {
      title: "4:15 PM: Garden Party",
      details: [],
    },
    {
      title: "5:30 PM: Reception",
      details: [],
    },
    {
      title: "11 PM: Celebration Concludes",
      details: [],
    }
  ];

  const australianScheduleTwo = [
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

  const renderLocationSchedule = (location, schedule_items) => (
    <div className="schedule-section">
      <div className="schedule-column">
        {location !== 'Canada' && (
          <>
            <h2 className="schedule-location-title">
              {invitedLocation === 'Both Australia and Canada' ? `${location} ` : ''}
              Wedding Events
            </h2>
            <p className="schedule-location-title-subtext">October 11, 2025</p>
          </>
        )}
        {schedule_items.map((item, index) => (
          <div 
            key={index} 
            className="schedule-item"
            style={{"--item-index": index}}
          >
            <p>{item.title}</p>
            {item.time && item.location && (
              <div className='scheduleHorizontal'>
                <h3>{item.time}</h3>
                <h3>|</h3>
                <h3><em>{item.location}</em></h3>
              </div>
            )}
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
      <p className="title schedule-title">Schedule</p>
      <div className="schedule-flex-container">
        <div className="hero-image-container">
          <img 
            src={BrideToBe}
            alt="Wedding couple" 
            className="hero-image"
          />
        </div>
        {invitedLocation === 'Both Australia and Canada' ? (
          <div className="schedule-container">
            {renderLocationSchedule('Canada', canadianSchedule)}
            <div className="schedule-divider"></div>
            {renderLocationSchedule('Australia', australianSchedule)}
          </div>
        ) : (
          <div className="schedule-container">
            {renderLocationSchedule(invitedLocation, invitedLocation === 'Canada' ? canadianSchedule : australianSchedule)}
            {/* <div className="schedule-divider"></div>
            { invitedLocation === 'Australia' && renderLocationSchedule('Australia', australianScheduleTwo) } */}
          </div>
        )}
      </div>
    </div>
  );
}

export default Schedule;