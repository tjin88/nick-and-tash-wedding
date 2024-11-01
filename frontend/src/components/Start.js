import React from 'react';
import './Start.css';

function Start({ setIsOpened, guests, invitedLocation }) {
  const currentDate = new Date();
  const canadaWeddingDate = new Date('August 23, 2025 00:00:00');
  const australiaWeddingDate = new Date('October 11, 2025 00:00:00');
  const canadaDaysRemaining = Math.floor(Math.abs(canadaWeddingDate - currentDate) / (24*60*60*1000));
  const australiaDaysRemaining = Math.floor(Math.abs(australiaWeddingDate - currentDate) / (24*60*60*1000));

  const showCanada = invitedLocation === 'Canada' || invitedLocation === 'Both Australia and Canada';
  const showAustralia = invitedLocation === 'Australia' || invitedLocation === 'Both Australia and Canada';

  const guestNames = guests.map(guest => `${guest.firstName} ${guest.lastName}`);
  const formattedGuestNames = guestNames.length > 1
    ? `${guestNames.slice(0, -1).join(', ')} and ${guestNames[guestNames.length - 1]}`.trim()
    : guestNames.join().trim();

  return (
    <div className="startInvitation">
      <div className="content">
        <p>{formattedGuestNames}, you're invited to</p>
        <h1>Nick & Tash's Wedding</h1>
        <button onClick={() => setIsOpened(true)}>Open Invitation</button>
        {showCanada && (<div className='canadaStartCountdown'>
          <p>August 23, 2025</p>
          <p>|</p>
          <p>{canadaDaysRemaining} Days To Go</p>
        </div>)}
        {showAustralia && (<div className='australiaStartCountdown'>
          <p>October 11, 2025</p>
          <p>|</p>
          <p>{australiaDaysRemaining} Days To Go</p>
        </div>)}
      </div>
    </div>
  );
}

export default Start;
