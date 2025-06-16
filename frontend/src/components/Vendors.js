import React, { useState } from 'react';
import './Vendors.css';

function Vendors({ initialVendors, isAdmin }) {
  const [vendors, setVendors] = useState(initialVendors);

  const handleAddVendor = async () => {
    const role = prompt("Enter the vendor's role:");
    const name = prompt("Enter the vendor's name:");
    if (!role || !name) return;

    const newVendor = { role, name };
    try {
      const response = await fetch('https://nick-and-tash-wedding.onrender.com/api/vendors', {
      // const response = await fetch('http://localhost:3003/api/vendors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newVendor)
      });
      if (!response.ok) throw new Error('Failed to add vendor');
      const result = await response.json();
      setVendors({ ...vendors, [result.role]: result.name });
    } catch (error) {
      alert('Error adding vendor: ' + error.message);
    }
  };

  const handleDeleteVendor = async (role) => {
    if (!window.confirm(`Are you sure you want to delete ${role}?`)) return;

    try {
      const response = await fetch(`https://nick-and-tash-wedding.onrender.com/api/vendors/${encodeURIComponent(role)}`, {
      // const response = await fetch(`http://localhost:3003/api/vendors/${encodeURIComponent(role)}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete vendor');
      const updatedVendors = { ...vendors };
      delete updatedVendors[role];
      setVendors(updatedVendors);
    } catch (error) {
      alert('Error deleting vendor: ' + error.message);
    }
  };

  return (
    <div className='vendors'>
      <p className='title'>Vendors</p>
      <p className='subtitle'>Huge thank you to our lovely vendors, we couldn’t have done it without you!</p>
      {isAdmin && <button onClick={handleAddVendor} className='add-vendor'>Add new Vendor</button>}
      <ul>
        {Object.entries(vendors).map(([role, name]) => (
          <li className='vendorListItem' key={role}>
            {role}: {name}
            {isAdmin && <button onClick={() => handleDeleteVendor(role)} className='delete-vendor'>Delete</button>}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Vendors;
