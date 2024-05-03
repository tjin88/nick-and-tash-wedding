import React, { useState } from 'react';
import QRCode from 'qrcode.react';
import './Rsvp.css';

function Rsvp({ isAdmin, invites, fetchAllInvites, fetchInviteById, inviteId, guests, setGuests, hasRSVPd, givenPlusOne }) {
  const [plusOne, setPlusOne] = useState({ firstName: '', lastName: '', dietaryRequirements: '' });
  const [newGuests, setNewGuests] = useState([{ firstName: '', lastName: '', dietaryRequirements: '' }]);
  const [isNewGuestGivenPlusOne, setIsNewGuestGivenPlusOne] = useState(false);

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
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guests: newGuests, givenPlusOne: isNewGuestGivenPlusOne })
      });
      const data = await response.json();
      fetchAllInvites();
      alert(`New invite created with ID: ${data._id}`);
    } catch (error) {
      console.error('Failed to create new invite:', error);
      alert('Failed to create new invite.');
    }
  };

  const handleRSVPUpdate = async () => {
    try {
      let body;
      if (givenPlusOne) {
        body = [...guests, plusOne];
      } else {
        body = guests;
      }

      const response = await fetch(`https://nick-and-tash-wedding.onrender.com/api/invites/${encodeURIComponent(inviteId)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guests: body })
      });
      const data = await response.json();
      fetchInviteById();
      alert(`RSVP updated successfully for Invite ID: ${data._id}`);
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
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      fetchAllInvites();
      alert(`Successfully deleted invite`);
    } catch (error) {
      console.error('Failed to delete invite:', error);
      alert('Failed to delete invite.');
    }
  };

  // TODO: Canada vs Australia Wedding ???
  return (
    <div className="rsvp-table-container">
      <h1>RSVP</h1>
      {!isAdmin && (<div className='rsvp-table'>
        <table>
          <thead>
            <tr>
              <th>Guests</th>
              <th>Name</th>
              <th>Dietary Requirements</th>
            </tr>
          </thead>
          <tbody>
            {guests.map((guest, index) => (
              <tr key={index}>
                <td>Invited</td>
                <td>{guest.firstName} {guest.lastName}</td>
                <td>
                  <input
                    type="text"
                    placeholder="Any dietary requirements?"
                    value={guest.dietaryRequirements}
                    onChange={(e) => handleGuestChange(index, 'dietaryRequirements', e.target.value)}
                  />
                </td>
              </tr>
            ))}
            {givenPlusOne && (
              <tr>
                <td>Plus One</td>
                <td className="inputHorizontal">
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
              </tr>
            )}
          </tbody>
        </table>
        <button onClick={handleRSVPUpdate}>{hasRSVPd ? "Resubmit" : "Submit"}</button>
      </div>)}
      {isAdmin && (
        <div className='admin-see-invites'>
          <h2>Invites</h2>
          <table>
            <thead>
              <tr>
                <th>Invite ID</th>
                <th>Name</th>
                <th>Dietary Requirements</th>
                <th>Has RSVP'd?</th>
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
                      <td rowSpan={invite.guests.length}>{invite.hasRSVPd ? 'Yes' : 'No'}</td>
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
          <button onClick={handleAddGuest}>Add Another Guest</button>
          <div>
            <input 
              type="checkbox" 
              id="plusOne" 
              value={isNewGuestGivenPlusOne}
              onChange={() => setIsNewGuestGivenPlusOne(!isNewGuestGivenPlusOne)}
            />
            <label htmlFor="plusOne">Should this invite include a Plus One?</label>
          </div>
          <button onClick={handleSubmitNewInvite}>Submit New Invite</button>
        </div>
      )}
    </div>
  );
}

export default Rsvp;