import React, { useState, useEffect } from 'react';
import './Start.css';

function Start({ setIsOpened, guests, invitedLocation }) {
  const currentDate = new Date();
  const canadaWeddingDate = new Date('August 23, 2025 00:00:00');
  const australiaWeddingDate = new Date('October 11, 2025 00:00:00');
  const canadaDaysRemaining = Math.floor(Math.abs(canadaWeddingDate - currentDate) / (24*60*60*1000));
  const australiaDaysRemaining = Math.floor(Math.abs(australiaWeddingDate - currentDate) / (24*60*60*1000));

  const guestNames = guests.map(guest => `${guest.firstName} ${guest.lastName}`);
  const formattedGuestNames = guestNames.length > 1
    ? `${guestNames.slice(0, -1).join(', ')} and ${guestNames[guestNames.length - 1]}`.trim()
    : guestNames.join().trim();

  const [showCanada, setShowCanada] = useState(false);
  const [showAustralia, setShowAustralia] = useState(false);
    
  useEffect(() => {
    setShowCanada(invitedLocation === 'Canada' || invitedLocation === 'Both Australia and Canada');
    setShowAustralia(invitedLocation === 'Australia' || invitedLocation === 'Both Australia and Canada');
  }, [invitedLocation, showCanada, showAustralia]);
  
  return (
    <div className="startInvitation">
      <div className="content">
        <p>{formattedGuestNames}, you're invited to</p>
        <h1>Nicholas and Natasha’s Wedding</h1>
        <button onClick={() => setIsOpened(true)}>Open Invitation</button>

        {/* TODO: Might be better to make these two a table, then center each */}
        <div>
          {showCanada && (<div className='canadaStartCountdown'>
            <p>Toronto | August 23, 2025 | {canadaDaysRemaining} Days To Go</p>
          </div>)}
          {showAustralia && (<div className='australiaStartCountdown'>
            <p>Brisbane | October 11, 2025 | {australiaDaysRemaining} Days To Go</p>
          </div>)}
        </div>
      </div>
    </div>
  );
}

export default Start;
