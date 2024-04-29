import React, { useState } from 'react';
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
  const [navOption, setNavOption] = useState('welcome');
  
  return (
    <div className="App">
      <Navbar setNavOption={setNavOption}/>
      { navOption === 'welcome' && <Welcome/> }
      { navOption === 'rsvp' && <Rsvp/> }
      { navOption === 'menu' && <Menu/> }
      { navOption === 'schedule' && <Schedule/> }
      { navOption === 'registry' && <Registry/> }
      { navOption === 'photos' && <Photos/> }
      { navOption === 'vendors' && <Vendors/> }
    </div>
  );
}

export default App;
