import React from 'react';
import './Start.css';

function Start({ setIsOpened, guests }) {
  const currentDate = new Date();
  const weddingDate = new Date('October 11, 2025 00:00:00');
  const days = Math.floor(Math.abs(weddingDate - currentDate) / (24*60*60*1000));
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
        <div className='startCountdown'>
          <p>October 11, 2025</p>
          <p>|</p>
          <p>{days} Days To Go</p>
        </div>
      </div>
    </div>
  );
}

export default Start;
