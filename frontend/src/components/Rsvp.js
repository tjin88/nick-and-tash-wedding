import React, { useState } from 'react';
import QRCode from 'qrcode.react';
import RSVPPieChart from './RSVPPieChart';
import './Rsvp.css';

function Rsvp({ isAdmin, invites, fetchAllInvites, fetchInviteById, inviteId, guests, setGuests, hasRSVPd, givenPlusOne, invitedLocation, locations }) {
  const [plusOne, setPlusOne] = useState({ firstName: '', lastName: '', dietaryRequirements: '', attendingStatus: ''});
  const [newGuests, setNewGuests] = useState([{ firstName: '', lastName: '', dietaryRequirements: '' }]);
  const [isNewGuestGivenPlusOne, setIsNewGuestGivenPlusOne] = useState(false);
  const [newInviteLocation, setNewInviteLocation] = useState('Canada');

  const handleGuestChange = (index, field, value) => {
    const updatedGuests = [...guests];
    updatedGuests[index] = { ...updatedGuests[index], [field]: value };
    setGuests(updatedGuests);
  };

  const handlePlusOneChange = (field, value) => {
    setPlusOne(prev => ({ ...prev, [field]: value }));
  };
  
  const handleNewGuestChange = (index, field, value) => {
    const updatedNewGuests = [...newGuests];
    updatedNewGuests[index] = { ...updatedNewGuests[index], [field]: value };
    setNewGuests(updatedNewGuests);
  };

  const handleAddGuest = () => {
    setNewGuests([...newGuests, { firstName: '', lastName: '', dietaryRequirements: '' }]);
  };

  const handleSubmitNewInvite = async () => {
    try {
      const response = await fetch('https://nick-and-tash-wedding.onrender.com/api/invites', {
      // const response = await fetch('http://localhost:3003/api/invites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guests: newGuests, givenPlusOne: isNewGuestGivenPlusOne, invitedLocation: newInviteLocation })
      });
      const data = await response.json();
      fetchAllInvites();
      alert(`New invite created with ID: ${data._id}`);

      setNewGuests([{ firstName: '', lastName: '', dietaryRequirements: '' }]);
      setIsNewGuestGivenPlusOne(false);
    } catch (error) {
      console.error('Failed to create new invite:', error);
      alert('Failed to create new invite.');
    }
  };

  const handleRSVPUpdate = async () => {
    try {
      let body;
      if (givenPlusOne && plusOne.firstName && plusOne.lastName) {
        body = [...guests, plusOne];
      } else {
        body = guests;
      }

      const response = await fetch(`https://nick-and-tash-wedding.onrender.com/api/invites/${encodeURIComponent(inviteId)}`, {
      // const response = await fetch(`http://localhost:3003/api/invites/${encodeURIComponent(inviteId)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guests: body })
      });
      const data = await response.json();
      if (data._id) {
        fetchAllInvites();
        fetchInviteById();
        const allGuests = givenPlusOne && plusOne.firstName && plusOne.lastName ? [...guests, plusOne] : guests;
        const allNotAttending = allGuests.every(guest => guest.attendingStatus === "Not Attending");
        
        if (allNotAttending) {
          alert("Thank you for RSVP-ing. We're sorry you can't make it, and look forward to seeing you another time.");
        } else {
          alert("Thank you for RSVP-ing. We can't wait to celebrate with you soon!! 😁");
        }
      } else {
        alert(`Failed to update RSVP - Please ensure all statuses are filled out.`);
      }
    } catch (error) {
      console.error('Failed to update RSVP:', error);
      alert('Failed to update RSVP.');
    }
  };

  const handleDeleteInvite = async (id, guests) => {
    const guestNames = guests.map(guest => `${guest.firstName} ${guest.lastName}`);
    const formattedGuestNames = guestNames.length > 1
      ? `${guestNames.slice(0, -1).join(', ')} and ${guestNames[guestNames.length - 1]}`.trim()
      : guestNames.join().trim();

    if (!window.confirm(`Are you sure you want to delete the invite for ${formattedGuestNames}?`)) return;

    try {
      const response = await fetch(`https://nick-and-tash-wedding.onrender.com/api/invites/${encodeURIComponent(id)}`, {
      // const response = await fetch(`http://localhost:3003/api/invites/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      if (data && data.message && data.message === "Invite deleted successfully") {
        fetchAllInvites();
        alert(`Successfully deleted invite`);
      } else {
        throw new Error('Failed to delete invite');
      }
    } catch (error) {
      console.error('Failed to delete invite:', error);
      alert('Failed to delete invite.');
    }
  };

  const fillAllRSVP = () => {
    const firstGuestStatus = guests[0].attendingStatus;
    const updatedGuests = guests.map(guest => ({ ...guest, attendingStatus: firstGuestStatus }));
    const updatedPlusOne = { ...plusOne, attendingStatus: firstGuestStatus };
    setGuests(updatedGuests);
    setPlusOne(updatedPlusOne);
  };

  const getAvailableOptions = () => {
    switch(invitedLocation) {
      case 'Canada':
        return [
          <option value="Canada Only" key="Canada Only">Attending Canada</option>,
          <option value="Not Attending" key="Not Attending">Regretfully Won’t Attend</option>
        ];
      case 'Australia':
        return [
          <option value="Australia Only" key="Australia Only">Attending Australia</option>,
          <option value="Not Attending" key="Not Attending">Regretfully Won’t Attend</option>
        ];
      case 'Both Australia and Canada':
        return [
          <option value="Canada Only" key="Canada Only">Attending Canada only</option>,
          <option value="Australia Only" key="Australia Only">Attending Australia Only</option>,
          <option value="Both Australia and Canada" key="Both Australia and Canada">Attending Both Canada and Australia</option>,
          <option value="Not Attending" key="Not Attending">Regretfully Won’t Attend</option>
        ];
      default:
        return [];
    }
  };

  const getLocationGoogleMaps = () => {
    if (invitedLocation === 'Both Australia and Canada') {
      return (
        <div className="map-large-container">
          <div className="map-container">
            <iframe
              title="Wedding Venue Location"
              src={`https://www.google.com/maps/embed/v1/place?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}&q=${encodeURIComponent(locations.canada.fullAddress)}`}
              width="100%"
              height="300"
              style={{ border: 0, display: 'block' }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
            <a 
              href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(locations.canada.fullAddress)}`}
              className="directions-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              Get Directions →
            </a>
          </div>
          <div className="map-container">
            <iframe
              title="Wedding Venue Location"
              src={`https://www.google.com/maps/embed/v1/place?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}&q=${encodeURIComponent(locations.australia.fullAddress)}`}
              width="100%"
              height="300"
              style={{ border: 0, display: 'block' }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
            <a 
              href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(locations.australia.fullAddress)}`}
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
    const locationInfo = invitedLocation === 'Australia' ? locations.australia : locations.canada;
    return (
      <div className="map-container">
        <iframe
          title="Wedding Venue Location"
          src={`https://www.google.com/maps/embed/v1/place?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}&q=${encodeURIComponent(locationInfo.fullAddress)}`}
          width="100%"
          height="300"
          style={{ border: 0, display: 'block' }}
          allowFullScreen=""
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
        <a 
          href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(locationInfo.fullAddress)}`}
          className="directions-link"
          target="_blank"
          rel="noopener noreferrer"
        >
          Get Directions →
        </a>
      </div>
    );
  };

  return (
    <div className="rsvp-table-container">
      <h1 className='title'>RSVP</h1>
      {
        hasRSVPd 
        ? <p>Thank you for RSVP-ing! We look forward to celebrating with you soon.</p>
        : <p>Please join us in celebrating Nicholas and Natasha’s wedding.</p>
      }
      <p>Kindly let us know if you’ll be joining us in celebrating our special day by RSVP-ing before May 1, 2025 — we can’t wait to hear from you!</p>
      {invitedLocation === "Canada" && <p>Location: Sheraton Parkway Toronto North Hotel & Suites, 600 Hwy 7, Richmond Hill, ON L4B 1B2</p>}
      {invitedLocation === "Australia" && <p>Location: Tiffany’s Maleny, 409 Mountain View Road, Maleny Qld 4552</p>}
      {invitedLocation === "Both Australia and Canada" && 
        <>
          <p>Canada Location: Sheraton Parkway Toronto North Hotel & Suites, 600 Hwy 7, Richmond Hill, ON L4B 1B2</p>
          <p>Australia Location: Tiffany’s Maleny, 409 Mountain View Road, Maleny Qld 4552</p>
        </>
      }
      {getLocationGoogleMaps()}
      {isAdmin && <RSVPPieChart invites={invites} />}
      {!isAdmin && (<div className='rsvp-table'>
        <table>
          <thead>
            <tr>
              <th>Guests</th>
              {/* {givenPlusOne && <th>Name</th>} */}
              <th>Dietary Requirements</th>
              <th className='horizontal'>
                Status
                {/* {guests.length > 1 && <button onClick={fillAllRSVP} className='rsvpAllButton'>Prefill same as first</button>} */}
              </th>
            </tr>
          </thead>
          <tbody>
            {guests.map((guest, index) => (
              <tr key={index}>
                {/* {givenPlusOne && <td>Invited</td>} */}
                <td>{guest.firstName} {guest.lastName}</td>
                <td>
                  <input
                    type="text"
                    placeholder="Any dietary requirements?"
                    value={guest.dietaryRequirements}
                    onChange={(e) => handleGuestChange(index, 'dietaryRequirements', e.target.value)}
                  />
                </td>
                <td>
                  <select
                    value={guest.attendingStatus || ''}
                    // defaultValue={''}
                    onChange={(e) => handleGuestChange(index, 'attendingStatus', e.target.value)}
                  >
                    <option value="" key="" disabled>Select one</option>
                    {getAvailableOptions()}
                  </select>
                </td>
              </tr>
            ))}
            {givenPlusOne && (
              <tr>
                {/* <td>Plus One</td> */}
                <td className="plusOneInput">
                  <input 
                    type="text" 
                    placeholder="First Name" 
                    className="half-width" 
                    value={plusOne.firstName}
                    onChange={(e) => handlePlusOneChange('firstName', e.target.value)} 
                  />
                  <input 
                    type="text" 
                    placeholder="Last Name" 
                    className="half-width"
                    value={plusOne.lastName}
                    onChange={(e) => handlePlusOneChange('lastName', e.target.value)} 
                  />
                </td>
                <td>
                  <input 
                    type="text" 
                    placeholder="Any dietary requirements?"
                    value={plusOne.dietaryRequirements}
                    onChange={(e) => handlePlusOneChange('dietaryRequirements', e.target.value)} 
                  />
                </td>
                <td>
                  <select
                    value={plusOne.attendingStatus || ''}
                    // defaultValue={''}
                    onChange={(e) => handlePlusOneChange('attendingStatus', e.target.value)}
                  >
                    <option value="" disabled>Select one</option>
                    {getAvailableOptions()}
                  </select>
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {hasRSVPd && <p>Change your mind? Please update your RSVP status and resubmit.</p>}
        <button className="rsvp-button" onClick={handleRSVPUpdate}>{hasRSVPd ? "Resubmit" : "Submit"}</button>
      </div>)}
      {/* TODO: Make this filterable based on, well, anything. 
                1. RSVP status
                2. Dietary Requirements
                3. Invited To
                4. Search name
                5. Given Plus One
       */}
      {isAdmin && (
        <div className='rsvp-table'>
          <h2>Invites</h2>
          <table>
            <thead>
              <tr>
                <th>Invite ID</th>
                <th>Name</th>
                <th>Dietary Requirements</th>
                <th>RSVP status</th>
                <th>Invited To</th>
                <th>Given Plus One?</th>
                <th>Link</th>
                <th>Options</th>
              </tr>
            </thead>
            <tbody>
              {invites.map((invite, index) => invite.guests.map((guest, i) => (
                <tr key={`${index}-${i}`}>
                  {i === 0 && (
                    <>
                      <td rowSpan={invite.guests.length}>{invite._id}</td>
                      <td>{guest.firstName} {guest.lastName}</td>
                      <td>{guest.dietaryRequirements}</td>
                      <td>{guest.attendingStatus}</td>
                      <td rowSpan={invite.guests.length}>{invite.invitedLocation}</td>
                      <td rowSpan={invite.guests.length}>{invite.givenPlusOne ? 'Yes' : 'No'}</td>
                      <td rowSpan={invite.guests.length} className='link-and-qr-code'>
                        <a href={`https://nick-and-tash-wedding.web.app/invite/${invite._id}`}>Link</a>
                        <QRCode value={`https://nick-and-tash-wedding.web.app/invite/${invite._id}`} size={64} className="qr-code" />
                      </td>
                      <td rowSpan={invite.guests.length} onClick={() => handleDeleteInvite(invite._id, invite.guests)}>Delete Invitation</td>
                    </>
                  )}
                  {i !== 0 && (
                    <>
                      <td>{guest.firstName} {guest.lastName}</td>
                      <td>{guest.dietaryRequirements}</td>
                      <td>{guest.attendingStatus}</td>
                    </>
                  )}
                </tr>
              )))}
            </tbody>
          </table>
        </div>
      )}
      {isAdmin && (
        <div className="admin-add-invite">
          <h2>Add New Invite</h2>
          <div className="invite-location-selector">
            <label>Invited To:</label>
            <select 
              defaultValue={''}
              onChange={(e) => setNewInviteLocation(e.target.value)}
            >
              <option value="" disabled>Select one</option>
              <option value="Canada">Canada Only</option>
              <option value="Australia">Australia Only</option>
              <option value="Both Australia and Canada">Both Locations</option>
            </select>
          </div>
          {newGuests.map((guest, index) => (
            <div key={index} className="new-guest-inputs">
              <input
                type="text"
                placeholder="First Name"
                value={guest.firstName}
                onChange={(e) => handleNewGuestChange(index, 'firstName', e.target.value)}
              />
              <input
                type="text"
                placeholder="Last Name"
                value={guest.lastName}
                onChange={(e) => handleNewGuestChange(index, 'lastName', e.target.value)}
              />
              <input
                type="text"
                placeholder="Dietary Requirements"
                value={guest.dietaryRequirements}
                onChange={(e) => handleNewGuestChange(index, 'dietaryRequirements', e.target.value)}
              />
            </div>
          ))}
          <button className="rsvp-button" onClick={handleAddGuest}>Add Another Guest</button>
          <div>
            <input 
              type="checkbox"
              id="plusOne" 
              value={isNewGuestGivenPlusOne}
              onChange={() => setIsNewGuestGivenPlusOne(!isNewGuestGivenPlusOne)}
            />
            <label htmlFor="plusOne">Should this invite include a Plus One?</label>
          </div>
          <button className="rsvp-button" onClick={handleSubmitNewInvite}>Submit New Invite</button>
        </div>
      )}
    </div>
  );
}

export default Rsvp;