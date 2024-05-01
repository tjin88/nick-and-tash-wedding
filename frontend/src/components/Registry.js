import React, { useState } from 'react';
import './Registry.css';

function Registry({ initialRegistry }) {
  const [registry, setRegistry] = useState(initialRegistry);

  const handleCheckboxChange = (key) => {
    const newRegistry = {
      ...registry,
      [key]: !registry[key]
    };
    setRegistry(newRegistry);
  };

  return (
    <div className='registry'>
      <h1 className='registry-title'>Registry</h1>
      <ul>
        {Object.entries(registry).map(([key, value]) => (
          <li key={key} className={`listItem ${value ? 'bought' : ''}`} onClick={() => handleCheckboxChange(key)}>
            <input
              type="checkbox"
              checked={value}
              onChange={() => {}} // Change handler is not needed since the li onClick handles it, and this is needed because it removes a warning
              readOnly={value}
            />
            {key}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Registry;