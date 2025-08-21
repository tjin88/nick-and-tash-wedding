// Adjust mobile to take up full page height and width
import React, { useState } from 'react';
// import GooseHandDrawn from '../images/logo.png';
import GooseTransparent from '../images/goose_no_white.png';
// import GooseWhite from '../images/goose_white_wheels.png';
import './Navbar.css';

function Navbar({ setNavOption, setIsOpened, invitedLocation, isAdmin, hasRSVPd, isPlaceholderGuest }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleClick = (option) => {
    if (option === "start") {
      setIsOpened(false);
      return;
    }
    setNavOption(option);
    setIsMenuOpen(false);
  };

  // const getLocationSpecificOptions = () => {
  //   if (invitedLocation === 'Both Australia and Canada') {
  //     return [
  //       <li key="canada-menu" onClick={() => handleClick("menu-canada")}><p>Canada Menu</p></li>,
  //       <li key="canada-schedule" onClick={() => handleClick("schedule-canada")}><p>Canada Schedule</p></li>,
  //       <li key="australia-menu" onClick={() => handleClick("menu-australia")}><p>Australia Menu</p></li>,
  //       <li key="australia-schedule" onClick={() => handleClick("schedule-australia")}><p>Australia Schedule</p></li>
  //     ];
  //   }
    
  //   return [
  //     <li key="menu" onClick={() => handleClick("menu")}><p>Menu</p></li>,
  //     <li key="schedule" onClick={() => handleClick("schedule")}><p>Schedule</p></li>
  //   ];
  // };

  return (
    <nav className="navbar">
      {/* <img src={GooseHandDrawn} alt="N&N" className="logo" onClick={() => handleClick("start")} /> */}
      <img src={GooseTransparent} alt="N&N" className="logo" onClick={() => handleClick("start")} />
      {/* <img src={GooseWhite} alt="N&N" className="logo" onClick={() => handleClick("start")} /> */}
      <div className="menu-icon" onClick={() => setIsMenuOpen(!isMenuOpen)}>
        <p className='isMenuOpenPTag'>Menu {isMenuOpen ? 'X' : '☰'}</p>
      </div>
      <ul className={`nav-links ${isMenuOpen ? 'open' : ''}`}>
        {invitedLocation !== "Canada" && !isPlaceholderGuest && <li onClick={() => handleClick("rsvp")}><p>RSVP</p></li>}
        <li onClick={() => handleClick("date/venue")}><p>Date & Venue</p></li>
        <li onClick={() => handleClick("schedule")}><p>Schedule</p></li>
        <li onClick={() => handleClick("menu")}><p>Menu</p></li>
        {invitedLocation !== "Australia" && <li onClick={() => handleClick("seating")}><p>Seating</p></li>}
        {invitedLocation !== "Australia" && !isPlaceholderGuest && <li onClick={() => handleClick("seeAllRSVPs")}><p>See Who’s Coming</p></li>}
        {/* Decided to remove registry from Canada and Australia */}
        {/* {invitedLocation !== "Canada" && <li onClick={() => handleClick("registry")}><p>Registry</p></li>} */}
        {/* Hidden for now */}
        {<li onClick={() => handleClick("photos")}><p>Photos</p></li>}
        <li onClick={() => handleClick("faq")}><p>FAQ</p></li>
        {invitedLocation !== "Canada" && <li onClick={() => handleClick("vendors")}><p>Vendors</p></li>}
      </ul>
    </nav>
  );
}

export default Navbar;