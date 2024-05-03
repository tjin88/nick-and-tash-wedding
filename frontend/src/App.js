import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
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

function App({ isAdmin }) {
  const [isOpened, setIsOpened] = useState(false);
  const [givenPlusOne, setGivenPlusOne] = useState(true);
  const [navOption, setNavOption] = useState('rsvp');
  const [invites, setInvites] = useState([]);
  const [hasRSVPd, setHasRSVPd] = useState(false);
  const [guests, setGuests] = useState([{
    "firstName": "Admin",
    "lastName": ""
  }]);
  const { inviteId } = useParams();
  const [registry, setRegistry] = useState({});
  const [vendors, setVendors] = useState({});
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);

  /* 
    TODO: Add security to site by verifying they are:
      1. Admin
      2. Invited guests
  */

  const fetchAllInvites = async () => {
    try {
      // const response = await fetch('http://localhost:3003/api/all-invites');
      const response = await fetch('https://nick-and-tash-wedding.onrender.com/api/all-invites');
      if (!response.ok) throw new Error('Failed to fetch invites');
      const data = await response.json();
      setInvites(data);
    } catch (error) {
      console.error('Error fetching invites:', error.message);
    }
  };

  const fetchInviteById = async () => {
    if (!inviteId) return;
    try {
      const response = await fetch(`https://nick-and-tash-wedding.onrender.com/api/invites/${inviteId}`);
      // const response = await fetch(`http://localhost:3003/api/invites/${inviteId}`);
      if (!response.ok) throw new Error('Failed to fetch invite by ID');
      const data = await response.json();
      setGuests(data.guests);
      setHasRSVPd(data.hasRSVPd);
      setGivenPlusOne(data.givenPlusOne);
    } catch (error) {
      console.error('Error fetching invite by ID:', error);
    }
  };

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
        console.error('Error fetching photos:', error.message);
        // alert('Error fetching photos:', error.message);
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
        console.error('Error fetching registry:', error.message);
        // alert('Error fetching registry:', error.message);
        // setError(error.message);
      }
      setLoading(false);
    };

    const fetchVendors = async () => {
      setLoading(true);
      try {
        const response = await fetch('https://nick-and-tash-wedding.onrender.com/api/vendors');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        const vendorObject = data.reduce((obj, vendor) => {
          obj[vendor.role] = vendor.name;
          return obj;
        }, {});
        setVendors(vendorObject);
      } catch (error) {
        // TODO: Change to setError rather than alert
        console.error('Error fetching vendors:', error.message);
        // alert('Error fetching vendors:', error.message);
        // setError(error.message);
      }
      setLoading(false);
    };

    if (isAdmin) {
      fetchAllInvites();
    } else {
      fetchInviteById();
    }
    fetchPhotos();
    fetchRegistry();
    fetchVendors();
  }, [inviteId, isAdmin]);
  
  return (
    <div className="App">
      { !isOpened && <Start setIsOpened={setIsOpened} guests={guests}/> }
      { isOpened && <Navbar setNavOption={setNavOption}/> }
      {/* { isOpened && navOption === 'welcome' && <Welcome/> } */}
      { isOpened && navOption === 'rsvp' && <Rsvp isAdmin={isAdmin} invites={invites} fetchAllInvites={fetchAllInvites} fetchInviteById={fetchInviteById} inviteId={inviteId} guests={guests} setGuests={setGuests} hasRSVPd={hasRSVPd} givenPlusOne={givenPlusOne}/> }
      { isOpened && navOption === 'menu' && <Menu/> }
      { isOpened && navOption === 'schedule' && <Schedule/> }
      { isOpened && navOption === 'registry' && <Registry initialRegistry={registry} isAdmin={isAdmin}/> }
      { isOpened && navOption === 'photos' && <Photos photos={photos} setPhotos={setPhotos}/> }
      { isOpened && navOption === 'vendors' && <Vendors initialVendors={vendors} isAdmin={isAdmin}/> }
    </div>
  );
}

export default App;
