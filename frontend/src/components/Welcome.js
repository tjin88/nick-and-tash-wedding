import React from 'react';
import Welcome_Photo from '../images/Welcome_Photo.png';
import './Welcome.css';

function Welcome() {
  const currentDate = new Date();
  const weddingDate = new Date('October 11, 2025 00:00:00');
  const days = Math.floor(Math.abs(weddingDate - currentDate) / (24*60*60*1000));

  return (
    <div className="welcome-container">
      <h2>Welcome Tristan, you're invited to</h2>
      <h1>Nick & Tash's Wedding</h1>
      <div className='welcomeCountdown'>
        <p>October 11, 2025</p>
        <p>|</p>
        <p>{days} Days To Go</p>
      </div>
      <img src={Welcome_Photo} alt='Welcome at Nick and Tash’s Wedding' className='welcome-photo'/>
      <p className='story-text'>Something something our story something somting</p>
    </div>
  )
}

export default Welcome;
      