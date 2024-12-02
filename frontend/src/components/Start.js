import React, { useState, useEffect } from 'react';
import CountdownTimer from '../utils/CountdownTimer';
import './Start.css';

function Start({ locations, isAdmin, setIsOpened, guests, invitedLocation }) {
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
  const [password, setPassword] = useState('');

  useEffect(() => {
    setShowCanada(invitedLocation === 'Canada' || invitedLocation === 'Both Australia and Canada');
    setShowAustralia(invitedLocation === 'Australia' || invitedLocation === 'Both Australia and Canada');
  }, [invitedLocation, showCanada, showAustralia]);

  const handlePasswordCheck = () => {
    if (password === process.env.REACT_APP_ADMIN_PASSWORD) {
      setIsOpened(true);
    } else {
      window.location.href = "/invalid-invite";
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handlePasswordCheck();
    }
  };
  
  return (
    <div className="startInvitation">
      <div className="background-image"></div>
      <div className="background-image-mobile"></div>
      <div className="content">
        <p>{formattedGuestNames}, you're invited to</p>
        <h1>Nicholas and Natasha’s</h1>
        <h1>Wedding Reception</h1>
        {isAdmin ? (
          <div className="password-container">
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={handleKeyPress}
              className="password-input"
            />
            <button onClick={handlePasswordCheck}>Open Invitation</button>
          </div>
        ) : (
          <button onClick={() => setIsOpened(true)}>Open Invitation</button>
        )}
        {showCanada && (
          <div className="canada-row">
            <p className="date-cell">August 23, 2025</p>
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
        {/* <div className="countdown-container">
          <table className="countdown-table">
            <tbody>
              {showCanada && (
                <tr className="canada-row">
                  <td className="date-cell">August 23, 2025</td>
                  <a 
                    href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(locations.canada.fullAddress)}`}
                    className="location-cell"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {locations.canada.fullAddress}
                  </a>
                  <td className="days-cell">{canadaDaysRemaining} Days To Go</td>
                </tr>
              )}
              {showAustralia && (
                <tr className="australia-row">
                  <a 
                    href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(locations.australia.fullAddress)}`}
                    className="location-cell"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {locations.australia.fullAddress}
                  </a>
                  <td className="date-cell">October 11, 2025</td>
                  <td className="days-cell">{australiaDaysRemaining} Days To Go</td>
                </tr>
              )}
            </tbody>
          </table>
        </div> */}
      </div>
    </div>
  );
}

export default Start;
