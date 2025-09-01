import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
// import { io } from "socket.io-client";
import Start from './components/Start';
import GuestStart from './components/GuestStart';
import Navbar from './components/Navbar';
// import Welcome from './components/Welcome';
import Rsvp from './components/Rsvp';
import SeeAllRSVPs from './components/SeeAllRSVPs';
import Menu from './components/Menu';
import Schedule from './components/Schedule';
import Registry from './components/Registry';
import Photos from './components/Photos';
import FAQ from './components/Faq';
import Vendors from './components/Vendors';
import DateAndVenue from './components/DateAndVenue';
import Seating from './components/Seating';
import './App.css';
import { useSocket } from "./utils/SocketProvider"; 

function App({ isAdmin, isPlaceholderGuest, navOptionPlaceholder = 'rsvp' }) {
  const socket = useSocket();
  const [isOpened, setIsOpened] = useState(isPlaceholderGuest === "Canada Post-Wedding" ? true : false);
  const [givenPlusOne, setGivenPlusOne] = useState(true);
  const [navOption, setNavOption] = useState(navOptionPlaceholder);
  const [invites, setInvites] = useState([]);
  const [hasRSVPd, setHasRSVPd] = useState(false);
  const [guests, setGuests] = useState([{"firstName": "Admin", "lastName": ""}]);

  const [invitedLocation, setInvitedLocation] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  // const [events, setEvents] = useState({}); // TODO: Currently not in use

  const [numGuestsOnBus, setNumGuestsOnBus] = useState(-1);
  const [numGuestsMorningBreakfast, setNumGuestsMorningBreakfast] = useState(-1);
  const [guestAccommodationAddress, setGuestAccommodationAddress] = useState('');
  const [guestAccommodationLocalName, setGuestAccommodationLocalName] = useState('');

  const { inviteId } = useParams();
  const [registry, setRegistry] = useState({});
  const [vendors, setVendors] = useState({});
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [photosPaginationInfo, setPhotosPaginationInfo] = useState({
    currentPage: 1,
    totalPages: 1,
    totalPhotos: 0,
    hasNextPage: false
  });
  // const socket = io('https://nick-and-tash-wedding.onrender.com');
  // const socket = io('http://localhost:3003');
  // const socketRef = useRef(null);

  const locations = {
    canada: {
      venue: "Sheraton Parkway Toronto North Hotel & Suites",
      address: "600 Hwy 7, Richmond Hill, ON L4B 1B2",
      date: "August 23, 2025",
      time: "[Canadian Time]",
      fullAddress: "Sheraton Parkway Toronto North Hotel & Suites, 600 Hwy 7, Richmond Hill, ON L4B 1B2"
    },
    australia: {
      venue: "Tiffany's Maleny",
      address: "409 Mountain View Road, Maleny Qld 4552",
      date: "October 11, 2025",
      time: "[Australian Time]",
      fullAddress: "Tiffany's Maleny, 409 Mountain View Road, Maleny Qld 4552"
    }
  };

  // useEffect(() => {
  //   // Create socket connection
  //   socketRef.current = io('https://nick-and-tash-wedding.onrender.com', {
  //     // Optional configuration
  //     reconnectionDelay: 1000,
  //     reconnection: true,
  //     reconnectionAttempts: 10,
  //     transports: ['websocket'],
  //     agent: false,
  //     upgrade: false,
  //     rejectUnauthorized: false
  //   });

  //   // Event listeners
  //   socketRef.current.on('photo-updated', (photoData) => {
  //     setPhotos(prevPhotos => [...prevPhotos, photoData]);
  //   });

  //   socketRef.current.on('photo-deleted', (deletedPhotoData) => {
  //     console.log('Photo deleted via socket:', deletedPhotoData);
  //     setPhotos(prevPhotos => prevPhotos.filter(photo => {
  //       // Handle both string and object photo formats
  //       if (typeof photo === 'string') {
  //         return photo !== deletedPhotoData.url;
  //       }
  //       return photo._id !== deletedPhotoData.photoId;
  //     }));
  //   });
  
  //   socketRef.current.on('registry-item-added', (newItem) => {
  //     setRegistry(prevRegistry => ({ ...prevRegistry, [newItem.key]: newItem.isBought }));
  //   });
    
  //   socketRef.current.on('registry-updated', (updatedItem) => {
  //     setRegistry(prev => ({ ...prev, [updatedItem.key]: updatedItem.isBought }));
  //   });
  
  //   socketRef.current.on('registry-item-deleted', (key) => {
  //     setRegistry(prev => {
  //       const { [key]: _, ...newState } = prev;
  //       return newState;
  //     });
  //   });

  //   // Cleanup function
  //   return () => {
  //     if (socketRef.current) {
  //       socketRef.current.disconnect();
  //       socketRef.current = null;
  //     }
  //   };
  // }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on("photo-updated", (photoData) => {
      setPhotos((prev) => {
        // Check if photo already exists to avoid duplicates
        const exists = prev.some(photo => 
          typeof photo === "string" 
            ? photo === photoData.url 
            : photo._id === photoData._id
        );
        
        if (!exists) {
          return [photoData, ...prev];
        }
        return prev;
      });

      // Update pagination info when new photos are added
      setPhotosPaginationInfo(prev => ({
        ...prev,
        totalPhotos: prev.totalPhotos + 1
      }));
    });

    socket.on("photo-deleted", (deletedPhotoData) => {
      setPhotos((prev) => {
        const filtered = prev.filter((photo) =>
          typeof photo === "string"
            ? photo !== deletedPhotoData.url
            : photo._id !== deletedPhotoData.photoId
        );
        return filtered;
      });

      // Update pagination info when photos are deleted
      setPhotosPaginationInfo(prev => ({
        ...prev,
        totalPhotos: Math.max(0, prev.totalPhotos - 1)
      }));
    });

    socket.on("registry-item-added", (newItem) => {
      setRegistry((prev) => ({ ...prev, [newItem.key]: newItem.isBought }));
    });

    socket.on("registry-updated", (updatedItem) => {
      setRegistry((prev) => ({ ...prev, [updatedItem.key]: updatedItem.isBought }));
    });

    socket.on("registry-item-deleted", (key) => {
      setRegistry((prev) => {
        const { [key]: _, ...rest } = prev;
        return rest;
      });
    });

    return () => {
      socket.off("photo-updated");
      socket.off("photo-deleted");
      socket.off("registry-item-added");
      socket.off("registry-updated");
      socket.off("registry-item-deleted");
    };
  }, [socket]);

  // Modified fetchPhotos function with pagination support
  const fetchPhotos = async (page = 1, limit = 20) => {
    // Don't fetch if invitedLocation is not available
    if (!invitedLocation) {
      console.log('Skipping photo fetch - no invitedLocation available');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`https://nick-and-tash-wedding.onrender.com/api/photos?location=${encodeURIComponent(invitedLocation)}&page=${page}&limit=${limit}`);
      // const response = await fetch('http://localhost:3003/api/photos');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      
      if (page === 1) {
        // First page load - replace photos
        setPhotos(data.photos);
      } else {
        // Subsequent pages - append photos
        setPhotos(prev => [...prev, ...data.photos]);
      }
      
      // Update pagination info
      setPhotosPaginationInfo({
        currentPage: data.pagination.currentPage,
        totalPages: data.pagination.totalPages,
        totalPhotos: data.pagination.totalPhotos,
        hasNextPage: data.pagination.hasNextPage
      });
      
    } catch (error) {
      // TODO: Change to setError rather than alert
      console.error('Error fetching photos:', error.message);
      // setError(error.message);
    }
    setLoading(false);
  };

  // Legacy fetchPhotos function for compatibility (loads first page only)
  const fetchPhotosLegacy = () => {
    fetchPhotos(1, 20);
  };

  useEffect(() => {
    if (invitedLocation) {
      fetchPhotosLegacy();
    }
  }, [invitedLocation]);

  /* 
    TODO: Add security to site by verifying they are:
      1. Admin
      2. Invited guests
  */

  const fetchAllInvites = async () => {
    try {
      const response = await fetch('https://nick-and-tash-wedding.onrender.com/api/all-invites');
      // const response = await fetch('http://localhost:3003/api/all-invites');
      if (!response.ok) throw new Error('Failed to fetch invites');
      const data = await response.json();
      setInvites(data);
      fetchPhotosLegacy();
    } catch (error) {
      console.error('Error fetching invites:', error.message);
    }
  };

  const fetchInviteById = async () => {
    if (!inviteId) return;
    try {
      const response = await fetch(`https://nick-and-tash-wedding.onrender.com/api/invites/${encodeURIComponent(inviteId)}`);
      // const response = await fetch(`http://localhost:3003/api/invites/${encodeURIComponent(inviteId)}`);
      if (!response.ok) throw new Error('Failed to fetch invite by ID');
      const data = await response.json();
      setGuests(data.guests);
      setHasRSVPd(data.hasRSVPd);
      setGivenPlusOne(data.givenPlusOne);
      setInvitedLocation(data.invitedLocation);
      setNumGuestsOnBus(data.numGuestsOnBus);
      setNumGuestsMorningBreakfast(data.numGuestsMorningBreakfast);
      setGuestAccommodationAddress(data.guestAccommodationAddress);
      setGuestAccommodationLocalName(data.guestAccommodationLocalName);
      fetchPhotosLegacy();
      if (data.invitedLocation !== "Australia") { fetchAllInvites(); }
    } catch (error) {
      console.error('Error fetching invite by ID:', error);
    }
  };

  // const fetchEvents = async () => {
  //   setLoading(true);
  //   try {
  //     const response = await fetch('https://nick-and-tash-wedding.onrender.com/api/events');
  //     // const response = await fetch('http://localhost:3003/api/events');
  //     if (!response.ok) throw new Error('Failed to fetch events');
  //     const data = await response.json();
  //     setEvents(data);
  //   } catch (error) {
  //     console.error('Error fetching events:', error);
  //   }
  //   setLoading(false);
  // };

  useEffect(() => {
    const fetchRegistry = async () => {
      setLoading(true);
      try {
        const response = await fetch('https://nick-and-tash-wedding.onrender.com/api/registry');
        // const response = await fetch('http://localhost:3003/api/registry');
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
        // setError(error.message);
      }
      setLoading(false);
    };

    const fetchVendors = async () => {
      setLoading(true);
      try {
        const response = await fetch('https://nick-and-tash-wedding.onrender.com/api/vendors');
        // const response = await fetch('http://localhost:3003/api/vendors');
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
        // setError(error.message);
      }
      setLoading(false);
    };

    if (isAdmin) {
      setInvitedLocation("Both Australia and Canada");
      fetchAllInvites();
    } else if (isPlaceholderGuest === "Canada" || isPlaceholderGuest === "Canada Post-Wedding") {
      setInvitedLocation("Canada");
      fetchAllInvites();
    } else if (isPlaceholderGuest === "Australia") {
      setInvitedLocation("Australia");
      fetchAllInvites();
    } else {
      fetchInviteById();
    }
    fetchRegistry();
    fetchVendors();
  }, [inviteId, isAdmin]);

  useEffect(() => {
    // Auto-navigate Canada-only invites from RSVP to Schedule
    if (navOption === 'rsvp' && invitedLocation === "Canada") {
      setNavOption('date/venue');
    }
  }, [navOption, invitedLocation]);
  
  return (
    <div className="App">
      { !isOpened && isPlaceholderGuest && <GuestStart isPlaceholderGuest={isPlaceholderGuest} setNavOption={setNavOption} locations={locations} isAdmin={isAdmin} setIsOpened={setIsOpened} guests={guests} invitedLocation={invitedLocation}/> }
      { !isOpened && !isPlaceholderGuest && <Start setNavOption={setNavOption} locations={locations} isAdmin={isAdmin} setIsOpened={setIsOpened} guests={guests} invitedLocation={invitedLocation}/> }
      { isOpened && <Navbar setNavOption={setNavOption} setIsOpened={setIsOpened} invitedLocation={invitedLocation} hasRSVPd={hasRSVPd} isAdmin={isAdmin} isPlaceholderGuest={isPlaceholderGuest}/> }
      {/* { isOpened && navOption === 'welcome' && <Welcome/> } */}
      { isOpened && navOption === 'rsvp' && 
        <Rsvp 
          isAdmin={isAdmin} 
          invites={invites} 
          fetchAllInvites={fetchAllInvites} 
          fetchInviteById={fetchInviteById} 
          inviteId={inviteId} 
          guests={guests} 
          setGuests={setGuests} 
          hasRSVPd={hasRSVPd} 
          givenPlusOne={givenPlusOne}
          invitedLocation={invitedLocation}
          selectedLocation={selectedLocation}
          setSelectedLocation={setSelectedLocation}
          locations={locations}
          numGuestsOnBus={numGuestsOnBus}
          numGuestsMorningBreakfast={numGuestsMorningBreakfast}
          guestAccommodationAddress={guestAccommodationAddress}
          guestAccommodationLocalName={guestAccommodationLocalName}
        /> 
      }
      { isOpened && navOption === 'date/venue' && <DateAndVenue /> }
      { isOpened && navOption === 'seeAllRSVPs' && <SeeAllRSVPs invites={invites} fetchAllInvites={fetchAllInvites}/> }
      { isOpened && navOption === 'menu' && <Menu selectedLocation={selectedLocation} invitedLocation={invitedLocation} /> }
      { isOpened && navOption === 'schedule' && <Schedule selectedLocation={selectedLocation} invitedLocation={invitedLocation} /> }
      { isOpened && navOption === 'registry' && <Registry registry={registry} setRegistry={setRegistry} isAdmin={isAdmin}/> }
      { isOpened && navOption === 'photos' && <Photos isAdmin={isAdmin} photos={photos} setPhotos={setPhotos} fetchPhotos={fetchPhotosLegacy} username={guests[0].firstName + "_" + guests[0].lastName} invitedLocation={invitedLocation} /> }
      { isOpened && navOption === 'seating' && <Seating /> }
      { isOpened && navOption === 'faq' && <FAQ locations={locations} invitedLocation={invitedLocation} /> }
      { isOpened && navOption === 'vendors' && <Vendors initialVendors={vendors} isAdmin={isAdmin}/> }
    </div>
  );
}

export default App;