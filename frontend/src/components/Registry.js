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
      <h1>Registry</h1>
      {Object.entries(registry).map(([key, value]) => (
        <div key={key} className={`registry-item ${value ? 'bought' : ''}`}>
          <input
            type="checkbox"
            checked={value}
            onChange={() => handleCheckboxChange(key)}
            readOnly={value}
          />
          <p>{key}</p>
        </div>
      ))}
    </div>
  );
}

export default Registry;
