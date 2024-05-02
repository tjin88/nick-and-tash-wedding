import React, { useState, useEffect } from 'react';
import Start from './components/Start';
import Navbar from './components/Navbar';
// import Welcome from './components/Welcome';
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
  const [registry, setRegistry] = useState({
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
  });

  const [vendors, setVendors] = useState({
    'Florist': 'Flowers by Jane',
    'Photographer': 'Snap Happy Photography',
    'Music': 'The Wedding Singers',
    'Catering': 'Food for All',
    'Wedding Planner': 'Plan My Wedding'
  });

  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPhotos = async () => {
      setLoading(true);
      try {
        const response = await fetch('https://nick-and-tash-wedding.onrender.com/api/photos');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setPhotos(data.map(photo => photo.url));
      } catch (error) {
        // TODO: Change to setError rather than alert
        alert('Error fetching photos:', error.message);
        // setError(error.message);
      }
      setLoading(false);
    };

    const fetchRegistry = async () => {
      setLoading(true);
      try {
        const response = await fetch('https://nick-and-tash-wedding.onrender.com/api/registry');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        const registryObject = data.reduce((obj, item) => {
          obj[item.item] = item.isBought;
          return obj;
        }, {});
        setRegistry(registryObject);
      } catch (error) {
        // TODO: Change to setError rather than alert
        alert('Error fetching registry:', error.message);
        // setError(error.message);
      }
      setLoading(false);
    };

    fetchPhotos();
    fetchRegistry();
  }, []);
  
  return (
    <div className="App">
      {!isOpened && <Start setIsOpened={setIsOpened} name={name}/>}
      { isOpened && <Navbar setNavOption={setNavOption}/>}
      {/* { isOpened && navOption === 'welcome' && <Welcome/> } */}
      { isOpened && navOption === 'rsvp' && <Rsvp listOfNames={listOfNames} givenPlusOne={givenPlusOne}/> }
      { isOpened && navOption === 'menu' && <Menu/> }
      { isOpened && navOption === 'schedule' && <Schedule/> }
      { isOpened && navOption === 'registry' && <Registry initialRegistry={registry}/> }
      { isOpened && navOption === 'photos' && <Photos photos={photos} setPhotos={setPhotos}/> }
      { isOpened && navOption === 'vendors' && <Vendors vendors={vendors}/> }
    </div>
  );
}

export default App;
