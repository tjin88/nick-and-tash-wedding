import React, { useState } from 'react';
import Start from './components/Start';
import Navbar from './components/Navbar';
import Welcome from './components/Welcome';
import Rsvp from './components/Rsvp';
import Menu from './components/Menu';
import Schedule from './components/Schedule';
import Registry from './components/Registry';
import Photos from './components/Photos';
import Vendors from './components/Vendors';
import './App.css';

function App() {
  const [isOpened, setIsOpened] = useState(false);
  const [givenPlusOne, setGivenPlusOne] = useState(true);
  const [navOption, setNavOption] = useState('rsvp');
  const name = 'Tristan';
  // const listOfNames = ['Nick Jin', 'Tash Dalton', 'Tristan Jin', 'Megan Does', 'John Doe', 'Jane Doe'];
  const listOfNames = ['Nick Jin'];

  // key = object, value = if bought
  const registry = {
    'Lawn Mower': false,
    'Robot Vaccum': false,
    'Smart Lights': true,
    'Clothes': false,
    'Pot Plants': true,
    'S': false,
    'd': false,
    'Smart': true,
    'Clothedds': false,
    'Pot': true,
    'Mower': false,
    'Vaccum': false,
    ' Lights': true,
    'dddsdsdf': false,
    'Pot adsf': true
  };

  const vendors = {
    'Florist': 'Flowers by Jane',
    'Photographer': 'Snap Happy Photography',
    'Music': 'The Wedding Singers',
    'Catering': 'Food for All',
    'Wedding Planner': 'Plan My Wedding'
  };
  
  return (
    <div className="App">
      {!isOpened && <Start setIsOpened={setIsOpened} name={name}/>}
      { isOpened && <Navbar setNavOption={setNavOption}/>}
      {/* { isOpened && navOption === 'welcome' && <Welcome/> } */}
      { isOpened && navOption === 'rsvp' && <Rsvp listOfNames={listOfNames} givenPlusOne={givenPlusOne}/> }
      { isOpened && navOption === 'menu' && <Menu/> }
      { isOpened && navOption === 'schedule' && <Schedule/> }
      { isOpened && navOption === 'registry' && <Registry initialRegistry={registry}/> }
      { isOpened && navOption === 'photos' && <Photos/> }
      { isOpened && navOption === 'vendors' && <Vendors vendors={vendors}/> }
    </div>
  );
}

export default App;
