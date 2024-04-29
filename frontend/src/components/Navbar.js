import React, { setState } from 'react';
import './Navbar.css';

function Navbar({ setNavOption }) {
  return (
    <nav className="navbar">
      <div className="logo">
        <p>N&N</p>
      </div>
      <ul className="nav-links">
        <li onClick={() => setNavOption("welcome")}><p>Welcome</p></li>
        <li onClick={() => setNavOption("rsvp")}><p>Rsvp</p></li>
        <li onClick={() => setNavOption("menu")}><p>Menu</p></li>
        <li onClick={() => setNavOption("schedule")}><p>Schedule</p></li>
        <li onClick={() => setNavOption("registry")}><p>Registry</p></li>
        <li onClick={() => setNavOption("photos")}><p>Photos</p></li>
        <li onClick={() => setNavOption("vendors")}><p>Vendors</p></li>
      </ul>
    </nav>
  );
}

export default Navbar;
