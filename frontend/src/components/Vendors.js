import React from 'react';
import './Vendors.css';

function Vendors() {
  // Role: Name of vendor
  const vendors = {
    'Florist': 'Flowers by Jane',
    'Photographer': 'Snap Happy Photography',
    'Music': 'The Wedding Singers',
    'Catering': 'Food for All',
    'Wedding Planner': 'Plan My Wedding'
  };

  return (
    <div>
      <h1>Vendors</h1>
      <p>Huge thank you to our lovely vendors! We couldn't have done it without you :)</p>
      <ul>
        {Object.entries(vendors).map(([key, value]) => (
          <li key={key}>{key}: {value}</li>
        ))}
      </ul>
    </div>
  );
}

export default Vendors;