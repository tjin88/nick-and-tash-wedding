import React from 'react';
import './Menu.css';

function Menu({ invitedLocation }) {
  
  const renderLocationMenu = (location) => (
    <div className={`${location}-menu-section`}>
      <h2>{invitedLocation === 'Both Australia and Canada' ? `${location} ` : ''}Reception</h2>
      <div className="menu-course">
        <h3>Appetizers</h3>
        {location === 'Canada' ? (
          <ul>
            <li>Canadian Appetizer 1</li>
            <li>Canadian Appetizer 2</li>
          </ul>
        ) : (
          <ul>
            <li>Australian Appetizer 1</li>
            <li>Australian Appetizer 2</li>
          </ul>
        )}
      </div>
      <div className="menu-course">
        <h3>Main Course</h3>
        {location === 'Canada' ? (
          <ul>
            <li>Canadian Main 1</li>
            <li>Canadian Main 2</li>
          </ul>
        ) : (
          <ul>
            <li>Australian Main 1</li>
            <li>Australian Main 2</li>
          </ul>
        )}
      </div>
      <div className="menu-course">
        <h3>Dessert</h3>
        {location === 'Canada' ? (
          <ul>
            <li>Canadian Dessert</li>
          </ul>
        ) : (
          <ul>
            <li>Australian Dessert</li>
          </ul>
        )}
      </div>
    </div>
  );

  return (
    <div className="menu-container">
      <h1 className='title'>Menu</h1>
      {invitedLocation === 'Both Australia and Canada' ? (
        <>
          {renderLocationMenu('Canada')}
          <div className="menu-divider"></div>
          {renderLocationMenu('Australia')}
        </>
      ) : (
        renderLocationMenu(invitedLocation)
      )}
    </div>
  );
}

export default Menu;