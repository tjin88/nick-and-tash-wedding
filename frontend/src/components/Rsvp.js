import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode.react';
import RSVPPieChart from './RSVPPieChart';
import './Rsvp.css';

function Rsvp({ isAdmin, invites, fetchAllInvites, fetchInviteById, inviteId, guests, setGuests, hasRSVPd, givenPlusOne, invitedLocation, locations, numGuestsOnBus, numGuestsMorningBreakfast }) {
  const [plusOne, setPlusOne] = useState({ firstName: '', lastName: '', dietaryRequirements: '', attendingStatus: ''});
  const [newGuests, setNewGuests] = useState([{ firstName: '', lastName: '', dietaryRequirements: '' }]);
  const [isNewGuestGivenPlusOne, setIsNewGuestGivenPlusOne] = useState(false);
  const [newInviteLocation, setNewInviteLocation] = useState('Canada');
  
  // Australia Only
  const [transportOption, setTransportOption] = useState('');
  const [accommodationAddress, setAccommodationAddress] = useState('');
  const [accommodationLocalName, setAccommodationLocalName] = useState('');
  // const [vehicleAttendees, setVehicleAttendees] = useState('');
  const [brekkieOption, setBrekkieOption] = useState(-1);
  const [partyBusRiders, setPartyBusRiders] = useState(-1);

  // Initialize state values from props when component loads
  useEffect(() => {
    if (numGuestsOnBus !== undefined) {
      setPartyBusRiders(numGuestsOnBus);
      // Set transport option based on the bus riders count
      if (numGuestsOnBus > 0) {
        setTransportOption('partyBus');
      } else if (numGuestsOnBus === 0) {
        setTransportOption('parkingSpot');
      }
    }
    if (numGuestsMorningBreakfast !== undefined) {
      setBrekkieOption(numGuestsMorningBreakfast);
    }
  }, [numGuestsOnBus, numGuestsMorningBreakfast]);

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
    // Transportation validation - moved to the beginning
    if (transportOption === 'partyBus' && !accommodationAddress.trim()) {
      alert('Please provide your accommodation address for the bus.');
      return;
    }

    try {
      let guestsList;
      if (givenPlusOne && plusOne.firstName && plusOne.lastName) {
        guestsList = [...guests, plusOne];
      } else {
        guestsList = guests;
      }

      // Prepare the request body with the new fields
      const requestBody = {
        guests: guestsList
      };

      // Add the new fields for Australia/Both locations
      if (invitedLocation === "Australia" || invitedLocation === "Both Australia and Canada") {
        requestBody.numGuestsOnBus = parseInt(partyBusRiders) || -1;
        requestBody.numGuestsMorningBreakfast = parseInt(brekkieOption) || -1;
      }

      const response = await fetch(`https://nick-and-tash-wedding.onrender.com/api/invites/${encodeURIComponent(inviteId)}`, {
      // const response = await fetch(`http://localhost:3003/api/invites/${encodeURIComponent(inviteId)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
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

  // const fillAllRSVP = () => {
  //   const firstGuestStatus = guests[0].attendingStatus;
  //   const updatedGuests = guests.map(guest => ({ ...guest, attendingStatus: firstGuestStatus }));
  //   const updatedPlusOne = { ...plusOne, attendingStatus: firstGuestStatus };
  //   setGuests(updatedGuests);
  //   setPlusOne(updatedPlusOne);
  // };

  const getAvailableOptions = () => {
    switch(invitedLocation) {
      case 'Canada':
        return [
          <option value="Canada Only" key="Canada Only">Attending Canada</option>,
          <option value="Not Attending" key="Not Attending">Regretfully Won't Attend</option>
        ];
      case 'Australia':
        return [
          <option value="Australia Only" key="Australia Only">Attending Australia</option>,
          <option value="Not Attending" key="Not Attending">Regretfully Won't Attend</option>
        ];
      case 'Both Australia and Canada':
        return [
          <option value="Canada Only" key="Canada Only">Attending Canada only</option>,
          <option value="Australia Only" key="Australia Only">Attending Australia Only</option>,
          <option value="Both Australia and Canada" key="Both Australia and Canada">Attending Both Canada and Australia</option>,
          <option value="Not Attending" key="Not Attending">Regretfully Won't Attend</option>
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
      <div className='title'>RSVP</div>
      {
        hasRSVPd 
        ? <p>Thank you for RSVP-ing! We look forward to celebrating with you soon.</p>
        : invitedLocation === "Canada"
            ? <p>Please join us in celebrating Nicholas and Natasha's wedding.</p>
            : <p>Please join us in celebrating our wedding.</p>
      }
      <p>Kindly let us know if you'll be joining us in celebrating our special day by RSVP-ing before <strong>{invitedLocation === "Canada" ? "May 1, 2025" : "August 8, 2025"}</strong> — we can't wait to hear from you!</p>
      {invitedLocation === "Canada" && <p>Location: Sheraton Parkway Toronto North Hotel & Suites, 600 Hwy 7, Richmond Hill, ON L4B 1B2</p>}
      {invitedLocation === "Australia" && <p>Location: Tiffany's Maleny, 409 Mountain View Road, Maleny Qld 4552</p>}
      {invitedLocation === "Both Australia and Canada" && 
        <>
          <p>Canada Location: Sheraton Parkway Toronto North Hotel & Suites, 600 Hwy 7, Richmond Hill, ON L4B 1B2</p>
          <p>Australia Location: Tiffany's Maleny, 409 Mountain View Road, Maleny Qld 4552</p>
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
              <th className='horizontal'>
                Status
                {/* {guests.length > 1 && <button onClick={fillAllRSVP} className='rsvpAllButton'>Prefill same as first</button>} */}
              </th>
              <th>Dietary Requirements</th>
            </tr>
          </thead>
          <tbody>
            {guests.map((guest, index) => (
              <tr key={index}>
                {/* {givenPlusOne && <td>Invited</td>} */}
                <td>{guest.firstName} {guest.lastName}</td>
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
                {/* <td>Plus One</td> */}
                <td className="plusOneInput">
                  <input 
                    type="text" 
                    placeholder="+1 First Name" 
                    className="half-width" 
                    value={plusOne.firstName}
                    onChange={(e) => handlePlusOneChange('firstName', e.target.value)} 
                  />
                  <input 
                    type="text" 
                    placeholder="+1 Last Name" 
                    className="half-width"
                    value={plusOne.lastName}
                    onChange={(e) => handlePlusOneChange('lastName', e.target.value)} 
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
        {/* Scroll hint for mobile users */}
        <div className="mobile-scroll-hint">
          <p><span style={{color: '#B22222'}}>*</span> Please scroll sideways on table above to add any dietary requirements</p>
          {/* <p><span style={{color: '#B22222'}}>*</span> Please complete the table if you would like to bring a plus one</p> */}
        </div>
        {/* Transportation Options Start */}
        {invitedLocation !== "Canada" && <div className="transportation-options">
          <div className="transportation-options-background">
            <label><strong className='label-title'>Transportation Options</strong></label>
            <p>We are organising a group bus. There will be one pick up time (to be determined) and one drop off time, leaving the venue ~11pm.<br/><br/>Tiffany's Maleny has told us there is limited street parking for those who will be driving and that the one and only local taxi driver in Maleny takes his last run at 6pm.<br/><br/>Please message us directly if you prefer one-way transportation or any other transportation requests</p>
          </div>
          <div className="rsvp-option-row">
            <div
              className={`rsvp-option${transportOption === 'partyBus' ? ' selected' : ''}`}
              onClick={() => setTransportOption('partyBus')}
              tabIndex={0}
              role="button"
              aria-pressed={transportOption === 'partyBus'}
              style={{marginRight: '0'}}
            >
              {transportOption === 'partyBus' ? (
                <div style={{display: 'flex', alignItems: 'center', gap: '1rem', width: '100%'}}>
                  <label htmlFor="partyBusRiders" style={{marginBottom: 0, cursor: 'pointer', whiteSpace: 'nowrap'}}>
                    Number of guests taking the bus:
                  </label>
                  <select
                    id="partyBusRiders"
                    value={partyBusRiders === -1 ? '' : partyBusRiders}
                    onChange={(e) => setPartyBusRiders(parseInt(e.target.value))}
                    className="party-bus-riders-dropdown"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <option value="" disabled># of guests</option>
                    {Array.from({ length: guests.length + (givenPlusOne ? 1 : 0) }, (_, i) => (
                      <option key={i + 1} value={(i + 1).toString()}>
                        {i + 1 === 1 ? '1 guest' : `${i + 1} guests`}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <>
                  <input
                    type="radio"
                    id="partyBus"
                    name="transportOption"
                    value="partyBus"
                    checked={transportOption === 'partyBus'}
                    onChange={() => setTransportOption('partyBus')}
                    style={{pointerEvents: 'none'}}
                  />
                  <label htmlFor="partyBus" style={{marginBottom: 0, cursor: 'pointer'}}>
                    {guests.length > 1 ? "We'd" : "I'd"} like to ride the bus
                  </label>
                </>
              )}
            </div>
            <div
              className={`rsvp-option${transportOption === 'parkingSpot' ? ' selected' : ''}`}
              onClick={() => setTransportOption('parkingSpot')}
              tabIndex={0}
              role="button"
              aria-pressed={transportOption === 'parkingSpot'}
            >
              <input
                type="radio"
                id="parkingSpot"
                name="transportOption"
                value="parkingSpot"
                checked={transportOption === 'parkingSpot'}
                onChange={() => setTransportOption('parkingSpot')}
                style={{pointerEvents: 'none'}}
              />
              <label htmlFor="parkingSpot" style={{marginBottom: 0, cursor: 'pointer'}}>
              {guests.length > 1 ? "We" : "I"} will arrange {guests.length > 1 ? "our" : "my"} own transportation
              </label>
            </div>
          </div>

          {/* Party Bus Fields */}
          <div
            className={`party-bus-fields ${transportOption === 'partyBus' ? 'show' : ''}`}
            aria-hidden={transportOption !== 'partyBus'}
          >
            <div>
              <label htmlFor="accommodationAddress">Accommodation address<span style={{color: '#B22222'}}>*</span>:</label>
              <input
                className="input-pink-background"
                type="text"
                id="accommodationAddress"
                value={accommodationAddress}
                placeholder="e.g. 369 Anywhere Street, Maleny Qld 4552"
                onChange={e => setAccommodationAddress(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="accommodationLocalName">Accommodation local name (if applicable):</label>
              <input
                className="input-pink-background"
                type="text"
                id="accommodationLocalName"
                value={accommodationLocalName}
                placeholder="e.g. Nick's Bottom"
                onChange={e => setAccommodationLocalName(e.target.value)}
              />
            </div>
          </div>

          {/* Parking Spot Fields */}
          {/* <div
            className={`parking-spot-fields ${transportOption === 'parkingSpot' ? 'show' : ''}`}
            aria-hidden={transportOption !== 'parkingSpot'}
          >
            <div>
              <label htmlFor="vehicleAttendees">Names of all attendees who will be in the vehicle<span style={{color: '#B22222'}}>*</span>:</label>
              <input
                className="input-pink-background"
                type="text"
                id="vehicleAttendees"
                value={vehicleAttendees}
                onChange={e => setVehicleAttendees(e.target.value)}
                placeholder="e.g. John Smith, Jane Doe"
              />
            </div>
          </div> */}
        </div>}
        {/* Transportation Options End */}
        
        {/* Brekkie RSVP Options Start */}
        {invitedLocation !== "Canada" && <div className="brekkie-rsvp-options">
          <div className="brekkie-rsvp-options-background">
            <label><strong className='label-title'>Sunday Morning Breakfast Option</strong></label>
            <p>We want to spend as much time with you as possible; we are hosting a post wedding brekkie at Maple 3 Cafe @ 9am.</p>
            <div className="brekkie-dropdown-container">
              <label htmlFor="brekkieAttendees" className="brekkie-dropdown-label">
                Number of guests attending morning breakfast<span style={{color: '#B22222'}}>*</span>:
              </label>
              <select
                id="brekkieAttendees"
                value={brekkieOption === -1 ? '' : brekkieOption}
                onChange={(e) => setBrekkieOption(parseInt(e.target.value))}
                className={`brekkie-dropdown ${brekkieOption !== -1 ? 'selected' : ''}`}
              >
                <option value="" disabled># of guests</option>
                {Array.from({ length: guests.length + (givenPlusOne ? 1 : 0) + 1 }, (_, i) => (
                  <option key={i} value={i.toString()}>
                    {i === 0 ? 'None' : 
                    i === 1 ? '1 guest' : 
                    `${i} guests`}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>}
        {/* Brekkie RSVP Options End */}

        {hasRSVPd && 
        <div className="change-your-mind-container">
          <div className="change-your-mind-background">
            <p>Change your mind? Please update your RSVP status and resubmit.</p>
          </div>
        </div>}
        <div className="rsvp-button-container">
          <button className="rsvp-button" onClick={handleRSVPUpdate}>{hasRSVPd ? "Resubmit" : "Submit"}</button>
        </div>
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