import React, { useState } from 'react';
import './Registry.css';

function Registry({ initialRegistry, isAdmin }) {
  const [registry, setRegistry] = useState(initialRegistry);

  const handleCheckboxChange = async (key) => {
    const updatedValue = !registry[key];
    const newRegistry = { ...registry, [key]: updatedValue };

    try {
      const response = await fetch(`https://nick-and-tash-wedding.onrender.com/api/registry/${key}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isBought: updatedValue })
      });
      if (!response.ok) throw new Error('Failed to update the registry item.');
      setRegistry(newRegistry);
    } catch (error) {
      console.error('Failed to update item:', error);
      alert('Failed to update the item.');
    }
  };

  const handleAddItem = async () => {
    const itemName = prompt("Enter the name of the new item:");
    if (!itemName) return;

    try {
      const response = await fetch('https://nick-and-tash-wedding.onrender.com/api/registry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ item: itemName, isBought: false })
      });
      const newItem = await response.json();
      setRegistry({ ...registry, [newItem.item]: newItem.isBought });
    } catch (error) {
      console.error('Failed to add new item:', error);
      alert('Failed to add new item.');
    }
  };

  const handleDeleteItem = async (key) => {
    if (!window.confirm(`Are you sure you want to delete "${key}"?`)) return;

    try {
      const response = await fetch(`https://nick-and-tash-wedding.onrender.com/api/registry/${key}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete the registry item.');

      const { [key]: deletedItem, ...remainingItems } = registry;
      setRegistry(remainingItems);
    } catch (error) {
      console.error('Failed to delete item:', error);
      alert('Failed to delete the item.');
    }
  };

  // TODO: Add socket to update registry in real-time
  return (
    <div className='registry'>
      <div className='left-side'>
        <h1 className='registry-title'>Registry</h1>
        {isAdmin && <button onClick={handleAddItem} className='update-registry'>Add new item</button>}
      </div>
      <ul className='right-side'>
        {Object.entries(registry).map(([key, value]) => (
          <li key={key} className={`listItem ${value ? 'bought' : ''}`} onClick={() => handleCheckboxChange(key)}>
            <div>
              <input
                type="checkbox"
                checked={value}
                onChange={() => {}} // This is just to avoid React warnings about read-only fields without onChange handlers.
                readOnly={value}
              />
              {key}
            </div>
            {isAdmin && <button onClick={() => handleDeleteItem(key)} className='delete-item'>Delete</button>}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Registry;