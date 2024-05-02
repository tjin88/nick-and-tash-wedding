import React, { useState } from 'react';
import './Navbar.css';

function Navbar({ setNavOption }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleClick = (option) => {
    setNavOption(option);
    setIsMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="logo">
        <p>N&N</p>
      </div>
      <div className="menu-icon" onClick={() => setIsMenuOpen(!isMenuOpen)}>
        <p>{isMenuOpen ? 'X' : '☰'}</p>
      </div>
      <ul className={`nav-links ${isMenuOpen ? 'open' : ''}`}>
        <li onClick={() => handleClick("rsvp")}><p>Rsvp</p></li>
        <li onClick={() => handleClick("menu")}><p>Menu</p></li>
        <li onClick={() => handleClick("schedule")}><p>Schedule</p></li>
        <li onClick={() => handleClick("registry")}><p>Registry</p></li>
        <li onClick={() => handleClick("photos")}><p>Photos</p></li>
        <li onClick={() => handleClick("vendors")}><p>Vendors</p></li>
      </ul>
    </nav>
  );
}

export default Navbar;