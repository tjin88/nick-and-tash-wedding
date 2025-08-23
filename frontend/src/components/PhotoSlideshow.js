import React, { useState, useEffect, useRef } from 'react';
import { io } from "socket.io-client";
import { ReactPhotoCollage } from "react-photo-collage";
import './PhotoSlideshow.css';

function PhotoSlideshow() {
  const [photos, setPhotos] = useState([]);
  const [currentPhotos, setCurrentPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [slideInterval, setSlideInterval] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    // Create socket connection for real-time updates
    socketRef.current = io('https://nick-and-tash-wedding.onrender.com', {
      reconnectionDelay: 1000,
      reconnection: true,
      reconnectionAttempts: 10,
      transports: ['websocket'],
      agent: false,
      upgrade: false,
      rejectUnauthorized: false
    });

    // Listen for new photo uploads (images only)
    socketRef.current.on('photo-updated', (photoData) => {
      // Only add images, not videos
      if (photoData.mediaType === 'image') {
        console.log('New photo received via socket:', photoData);
        setPhotos(prevPhotos => {
          // Check if photo already exists to prevent duplicates
          const exists = prevPhotos.some(photo => 
            (typeof photo === 'string' ? photo : photo._id) === 
            (typeof photoData === 'string' ? photoData : photoData._id)
          );
          if (exists) {
            console.log('Photo already exists, not adding duplicate');
            return prevPhotos;
          }
          return [...prevPhotos, photoData];
        });
      }
    });

    // Listen for photo deletions
    socketRef.current.on('photo-deleted', (deletedPhotoData) => {
      console.log('Photo deleted via socket:', deletedPhotoData);
      setPhotos(prevPhotos => prevPhotos.filter(photo => {
        if (typeof photo === 'string') {
          return photo !== deletedPhotoData.url;
        }
        return photo._id !== deletedPhotoData.photoId;
      }));
    });

    // Handle socket connection errors
    socketRef.current.on('connect_error', (error) => {
      console.log('Socket connection error:', error);
    });

    socketRef.current.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
    });

    // Cleanup socket on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    // Only fetch photos if we don't have any yet
    if (photos.length === 0) {
      fetchPhotos();
    }
    
    // Set up automatic slide changes every 8 seconds
    const interval = setInterval(() => {
      changeSlides();
    }, 8000);
    
    setSlideInterval(interval);

    // Keyboard controls
    const handleKeyPress = (e) => {
      switch(e.key) {
        case ' ':
        case 'ArrowRight':
          e.preventDefault();
          changeSlides();
          break;
        case 'f':
        case 'F':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'Escape':
          if (isFullscreen) {
            exitFullscreen();
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);

    return () => {
      if (interval) {
        clearInterval(interval);
      }
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [isFullscreen, photos.length]);

  useEffect(() => {
    if (photos.length > 0) {
      console.log('Photos changed, triggering changeSlides. Photos count:', photos.length);
      changeSlides();
    } else {
      console.log('No photos available, skipping changeSlides');
    }
  }, [photos.length]);

  const fetchPhotos = async () => {
    try {
      console.log('Fetching photos...');
      const response = await fetch('https://nick-and-tash-wedding.onrender.com/api/photos?location=Canada');
      if (!response.ok) {
        throw new Error('Failed to fetch photos');
      }
      const data = await response.json();
      console.log('Fetched photos:', data.length);
      
      if (data && data.length > 0) {
        setPhotos(data);
      } else {
        console.log('No photos returned from API');
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching photos:', error);
      setLoading(false);
    }
  };

  const fetchRandomPhotos = async (count) => {
    try {
      const response = await fetch(`https://nick-and-tash-wedding.onrender.com/api/photos/random?count=${count}&location=Canada`);
      if (!response.ok) {
        throw new Error('Failed to fetch random photos');
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching random photos:', error);
      return [];
    }
  };

  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const getRandomPhotos = (count) => {
    if (photos.length === 0) {
      console.log('No photos available for selection');
      return [];
    }
    
    // TODO: This may not be the best implementation
    const shuffled = shuffleArray(photos);
    const selected = shuffled.slice(0, Math.min(count, photos.length));
    console.log(`Selected ${selected.length} photos from ${photos.length} available`);
    return selected;
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(err => {
        console.log('Error attempting to enable fullscreen:', err);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      }).catch(err => {
        console.log('Error attempting to exit fullscreen:', err);
      });
    }
  };

  const exitFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      }).catch(err => {
        console.log('Error attempting to exit fullscreen:', err);
      });
    }
  };

  const changeSlides = async () => {
    // Check if we have photos available
    if (photos.length === 0) {
      console.log('No photos available, skipping slide change');
      return;
    }
    
    const photoCount = 18 // TODO: this should be a random number. Something like 6-12 ;
    
    // Use the random photos API for better performance
    const randomPhotos = await fetchRandomPhotos(photoCount);
    if (randomPhotos.length > 0) {
      console.log('Using API photos:', randomPhotos.length);
      setCurrentPhotos(randomPhotos);
    } else {
      // Fallback to local random selection if API fails
      const localPhotos = getRandomPhotos(photoCount);
      console.log('Using local photos:', localPhotos.length);
      setCurrentPhotos(localPhotos);
    }
  };

  const getOptimizedImageUrl = (url) => {
    if (url.includes('/upload/f_jpg')) {
      return url;
    }
    return url.replace('/upload/', '/upload/f_jpg,q_auto/');
  };

  const renderPhotoCollage = () => {
    if (currentPhotos.length === 0) return null;
    
    // Prepare photos for the collage component
    const collagePhotos = currentPhotos.map(photo => {
      const photoUrl = typeof photo === 'string' ? photo : photo.url;
      return getOptimizedImageUrl(photoUrl);
    });
    
    // Define collage layout - this creates a nice grid pattern
    const layout = [
      { w: 2, h: 2 }, // Large photo
      { w: 1, h: 1 }, // Small photo
      { w: 1, h: 1 }, // Small photo
      { w: 1, h: 1 }, // Small photo
      { w: 1, h: 1 }, // Small photo
      { w: 2, h: 1 }, // Medium photo
      { w: 1, h: 1 }, // Small photo
      { w: 1, h: 1 }, // Small photo
      { w: 1, h: 1 }, // Small photo
      { w: 1, h: 1 }, // Small photo
      { w: 1, h: 1 }, // Small photo
      { w: 1, h: 1 }, // Small photo
    ];
    
    const setting = {
      width: '100%',
      height: ['250px', '170px'],
      layout: layout,
      photos: collagePhotos,
      showNumOfRemainingPhotos: false
    };
    
    return <ReactPhotoCollage {...setting} />;
  };

  if (loading) {
    return (
      <div className="slideshow-loading">
        <div className="loading-spinner"></div>
        <p>Loading wedding photos...</p>
      </div>
    );
  }

  return (
    <div className="photo-slideshow">
      <div className="slideshow-container">
        {currentPhotos.length === 0 ? (
          <div className="no-photos">
            <div className="no-photos-message">
              <h2>Wedding Photos</h2>
              <p>Photos will appear here shortly...</p>
            </div>
          </div>
        ) : (
          <div className="photos-section">
            {renderPhotoCollage()}
          </div>
        )}
      </div>
      
      {/* Manual controls for testing */}
      <div className="slideshow-controls">
        <div className="layout-info">
          Photos: {photos.length} | Current: {currentPhotos.length}
        </div>
        <div className="keyboard-info">
          Space/→: Next | F: Fullscreen | Esc: Exit
        </div>
      </div>
    </div>
  );
}

export default PhotoSlideshow;