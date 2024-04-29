import React from 'react';
import './Rsvp.css';

function Rsvp({ listOfNames, givenPlusOne }) {
  return (
    <div className="rsvp-table-container">
      <h1>RSVP</h1>
      <table>
        <thead>
          <tr>
            <th>Guests</th>
            <th>Name</th>
            <th>Dietary Requirements</th>
          </tr>
        </thead>
        <tbody>
          {listOfNames.map((name, index) => (
            <tr key={index}>
              <td>Invited</td>
              <td>{name}</td>
              <td><input type="text" placeholder="Any dietary requirements?" /></td>
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
      <button>Submit</button>
    </div>
  );
}

export default Rsvp;