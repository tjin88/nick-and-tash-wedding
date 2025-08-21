import React, { useState, useEffect } from 'react';
import './PhotoSlideshow.css';

const VIDEO_FILE_TYPES = ['mp4', 'webm', 'ogg', 'mov', 'avi', 'mkv', 'flv', 'wmv'];
const videoRegex = new RegExp(`\\.(${VIDEO_FILE_TYPES.join('|')})$`, 'i');

/**
 * PhotoSlideshow Component
 * 
 * A fullscreen slideshow component designed for projector display at the wedding.
 * Features:
 * - Random photo selection from Canada location photos
 * - Multiple layout options (single, grid, horizontal, vertical, triptych, mosaic)
 * - Automatic slide changes every 8 seconds
 * - Fullscreen support
 * - Keyboard controls (Space/Arrow Right: Next, F: Fullscreen, Esc: Exit)
 * - Responsive design for different screen sizes
 * 
 * Access via: /canadian-wedding-slideshow
 */
function PhotoSlideshow() {
  const [photos, setPhotos] = useState([]);
  const [currentPhotos, setCurrentPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentLayout, setCurrentLayout] = useState('grid');
  const [slideInterval, setSlideInterval] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Layout configurations
  const layouts = [
    'grid',           // 2x2 grid
    'horizontal',     // 2 photos side by side
    'vertical',       // 2 photos stacked
    'single',         // 1 large photo
    'triptych',       // 3 photos in a row
    'mosaic'          // 4 photos in a creative arrangement
  ];

  // Orientation configurations
  const orientations = [
    'landscape',      // 16:9 aspect ratio
    'portrait',       // 9:16 aspect ratio
    'square',         // 1:1 aspect ratio
    'ultrawide'       // 21:9 aspect ratio
  ];

  useEffect(() => {
    fetchPhotos();
    
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
  }, [isFullscreen]);

  useEffect(() => {
    if (photos.length > 0) {
      changeSlides();
    }
  }, [photos]);

  const fetchPhotos = async () => {
    try {
      const response = await fetch('https://nick-and-tash-wedding.onrender.com/api/photos?location=Canada');
      if (!response.ok) {
        throw new Error('Failed to fetch photos');
      }
      const data = await response.json();
      setPhotos(data);
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

  const getRandomLayout = () => {
    return layouts[Math.floor(Math.random() * layouts.length)];
  };

  const getRandomOrientation = () => {
    return orientations[Math.floor(Math.random() * orientations.length)];
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
    if (photos.length === 0) return [];
    
    const shuffled = shuffleArray(photos);
    return shuffled.slice(0, Math.min(count, photos.length));
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
    const newLayout = getRandomLayout();
    const newOrientation = getRandomOrientation();
    
    setCurrentLayout(newLayout);
    
    // Determine how many photos to show based on layout
    let photoCount = 1;
    switch (newLayout) {
      case 'grid':
      case 'mosaic':
        photoCount = 4;
        break;
      case 'horizontal':
      case 'vertical':
        photoCount = 2;
        break;
      case 'triptych':
        photoCount = 3;
        break;
      case 'single':
      default:
        photoCount = 1;
        break;
    }
    
    // Use the random photos API for better performance
    const randomPhotos = await fetchRandomPhotos(photoCount);
    if (randomPhotos.length > 0) {
      setCurrentPhotos(randomPhotos);
    } else {
      // Fallback to local random selection if API fails
      const selectedPhotos = getRandomPhotos(photoCount);
      setCurrentPhotos(selectedPhotos);
    }
  };

  const getOptimizedImageUrl = (url) => {
    if (url.includes('/upload/f_jpg') || videoRegex.test(url)) {
      return url;
    }
    return url.replace('/upload/', '/upload/f_jpg,q_auto/');
  };

  const renderPhoto = (photo, index) => {
    const photoUrl = typeof photo === 'string' ? photo : photo.url;
    const isVideo = videoRegex.test(photoUrl);
    
    if (isVideo) {
      return (
        <video 
          key={index}
          src={photoUrl} 
          className="slideshow-media"
          autoPlay 
          muted 
          loop
          playsInline
        />
      );
    } else {
      return (
        <img 
          key={index}
          src={getOptimizedImageUrl(photoUrl)} 
          alt={`Slideshow ${index}`} 
          className="slideshow-media"
        />
      );
    }
  };

  const renderLayout = () => {
    if (currentPhotos.length === 0) {
      return (
        <div className="slideshow-container no-photos">
          <div className="no-photos-message">
            <h2>Wedding Photos</h2>
            <p>Photos will appear here shortly...</p>
          </div>
        </div>
      );
    }

    return (
      <div className={`slideshow-container ${currentLayout}`}>
        {currentLayout === 'single' && (
          <div className="single-layout">
            {renderPhoto(currentPhotos[0], 0)}
          </div>
        )}
        
        {currentLayout === 'horizontal' && (
          <div className="horizontal-layout">
            {currentPhotos.map((photo, index) => (
              <div key={index} className="horizontal-item">
                {renderPhoto(photo, index)}
              </div>
            ))}
          </div>
        )}
        
        {currentLayout === 'vertical' && (
          <div className="vertical-layout">
            {currentPhotos.map((photo, index) => (
              <div key={index} className="vertical-item">
                {renderPhoto(photo, index)}
              </div>
            ))}
          </div>
        )}
        
        {currentLayout === 'grid' && (
          <div className="grid-layout">
            {currentPhotos.map((photo, index) => (
              <div key={index} className="grid-item">
                {renderPhoto(photo, index)}
              </div>
            ))}
          </div>
        )}
        
        {currentLayout === 'triptych' && (
          <div className="triptych-layout">
            {currentPhotos.map((photo, index) => (
              <div key={index} className="triptych-item">
                {renderPhoto(photo, index)}
              </div>
            ))}
          </div>
        )}
        
        {currentLayout === 'mosaic' && (
          <div className="mosaic-layout">
            {currentPhotos.map((photo, index) => (
              <div key={index} className={`mosaic-item mosaic-${index + 1}`}>
                {renderPhoto(photo, index)}
              </div>
            ))}
          </div>
        )}
      </div>
    );
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
      {renderLayout()}
      
      {/* Manual controls for testing */}
      <div className="slideshow-controls">
        {/* <button onClick={() => changeSlides()} className="change-slides-btn">
          Change Slides
        </button>
        <button onClick={toggleFullscreen} className="fullscreen-btn">
          {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
        </button> */}
        <div className="layout-info">
          Current Layout: {currentLayout} | Photos: {currentPhotos.length}
        </div>
        <div className="keyboard-info">
          Space/→: Next | F: Fullscreen | Esc: Exit
        </div>
      </div>
    </div>
  );
}

export default PhotoSlideshow;
