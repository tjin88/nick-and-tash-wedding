import React from 'react';
import './Vendors.css';

function Vendors({ vendors }) {

  return (
    <div className='vendors'>
      <h1 className='title'>Vendors</h1>
      <p className='subtitle'>Huge thank you to our lovely vendors! We couldn't have done it without you :)</p>
      <ul>
        {Object.entries(vendors).map(([key, value]) => (
          <li className='vendorListItem' key={key}>{key}: {value}</li>
        ))}
      </ul>
    </div>
  );
}

export default Vendors;
