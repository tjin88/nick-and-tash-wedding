import React, { useState, useEffect } from 'react';
import CountdownTimer from '../utils/CountdownTimer';
import './Start.css';

function GuestStart({ setNavOption, locations, setIsOpened, invitedLocation }) {
  const canadaWeddingDate = new Date('August 23, 2025 00:00:00');
  const australiaWeddingDate = new Date('October 11, 2025 00:00:00');
  const [showCanada, setShowCanada] = useState(false);
  const [showAustralia, setShowAustralia] = useState(false);

  useEffect(() => {
    setShowCanada(invitedLocation === 'Canada' || invitedLocation === 'Both Australia and Canada');
    setShowAustralia(invitedLocation === 'Australia' || invitedLocation === 'Both Australia and Canada');
  }, [invitedLocation, showCanada, showAustralia]);
  
  return (
    <div className="startInvitation">
      <div className="background-image"></div>
      <div className="background-image-mobile"></div>
      <div className="content">
        <p>Welcome to</p>
        <p className='title_beautifully_delicious_script'>Nicholas and Natasha’s</p>
        <p className='title_beautifully_delicious_script'>Wedding{invitedLocation === 'Canada' ? " Reception" : ""}</p>
        <div className='navbar-options'>
          <button onClick={() => {setIsOpened(true); setNavOption('schedule');}}>Schedule</button>
          {showCanada && <button onClick={() => {setIsOpened(true); setNavOption('seatingPlan');}}>Seating Plan</button>}
          <button onClick={() => {setIsOpened(true); setNavOption('menu');}}>Menu</button>
          <button onClick={() => {setIsOpened(true); setNavOption('photos');}}>Photos/Videos</button>
          <button onClick={() => {setIsOpened(true); setNavOption('faq');}}>FAQ</button>
        </div>
        {showCanada && (
          <div className="canada-row">
            <p className="date-cell">August 23, 2025 | 5:00 PM EDT</p>
            <a 
              href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(locations.canada.fullAddress)}`}
              className="location-cell"
              target="_blank"
              rel="noopener noreferrer"
            >
              <p>{locations.canada.fullAddress}</p>
            </a>
            <CountdownTimer targetDate={canadaWeddingDate} />
          </div>
        )}
        {showAustralia && (
          <div className="australia-row">
            <p className="date-cell">October 11, 2025 | 3:00 PM AEST</p>
            <a 
              href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(locations.australia.fullAddress)}`}
              className="location-cell"
              target="_blank"
              rel="noopener noreferrer"
            >
              <p>{locations.australia.fullAddress}</p>
            </a>
            <CountdownTimer targetDate={australiaWeddingDate} />
          </div>
        )}
      </div>
    </div>
  );
}

export default GuestStart;
