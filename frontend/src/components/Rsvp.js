import React, { useState } from 'react';
import './Rsvp.css';

function Rsvp({ isAdmin, invites, inviteId, guests, setGuests, hasRSVPd, givenPlusOne }) {
  const [newGuests, setNewGuests] = useState([{ firstName: '', lastName: '', dietaryRequirements: '' }]);
  const [isNewGuestGivenPlusOne, setIsNewGuestGivenPlusOne] = useState(false);

  const handleGuestChange = (index, field, value) => {
    const updatedGuests = [...guests];
    updatedGuests[index] = { ...updatedGuests[index], [field]: value };
    setGuests(updatedGuests);
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
      alert(`New invite created with ID: ${data._id}`);
    } catch (error) {
      console.error('Failed to create new invite:', error);
      alert('Failed to create new invite.');
    }
  };

  const handleRSVPUpdate = async () => {
    try {
      const response = await fetch(`https://nick-and-tash-wedding.onrender.com/api/invites/${inviteId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guests: guests })
      });
      const data = await response.json();
      alert(`RSVP updated successfully for Invite ID: ${data._id}`);
    } catch (error) {
      console.error('Failed to update RSVP:', error);
      alert('Failed to update RSVP.');
    }
  };

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
                  <input type="text" placeholder="First Name" className="half-width" />
                  <input type="text" placeholder="Last Name" className="half-width" />
                </td>
                <td><input type="text" placeholder="Any dietary requirements?" /></td>
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
                <th>Guests</th>
                <th>Name</th>
                <th>Dietary Requirements</th>
              </tr>
            </thead>
            <tbody>
              {invites.map((invite, index) => (
                <tr key={index}>
                  <td>{invite._id}</td>
                  {invite.guests.map((guest, i) => (
                    <React.Fragment key={i}>
                      <td>{guest.firstName} {guest.lastName}</td>
                      <td>{guest.dietaryRequirements}</td>
                    </React.Fragment>
                  ))}
                </tr>
              ))}
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