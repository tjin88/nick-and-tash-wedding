import React, { useState, useEffect, useRef, useCallback } from 'react';
// import { io } from "socket.io-client";
import { useSocket } from "../utils/SocketProvider";
import './PhotoSlideshow_v0.css';

function PhotoSlideshow() {
  const [currentPhoto, setCurrentPhoto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [photoCount, setPhotoCount] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [lastPhotoTime, setLastPhotoTime] = useState(Date.now());
  
  // const socketRef = useRef(null);
  const socket = useSocket();
  const slideIntervalRef = useRef(null);
  const retryTimeoutRef = useRef(null);
  const mountedRef = useRef(true);
  
  const SLIDE_INTERVAL = 8000;
  const MAX_RETRIES = 5;
  const RETRY_DELAY = 2000;
  const API_BASE = 'https://nick-and-tash-wedding.onrender.com';
  const REQUEST_TIMEOUT = 15000; // Increased for large datasets

  const initializeSocket = useCallback(() => {
    // if (socketRef.current?.connected) return;

    try {
      // socketRef.current = io(API_BASE, {
      //   reconnectionDelay: 1000,
      //   reconnection: true,
      //   reconnectionAttempts: MAX_RETRIES,
      //   transports: ['websocket', 'polling'],
      //   timeout: 15000, // Increased timeout
      //   forceNew: true
      // });

      // socketRef.current.on('connect', () => {
      //   console.log('Socket connected');
      //   setConnectionStatus('connected');
      //   setError(null);
      // });

      // socketRef.current.on('disconnect', (reason) => {
      //   console.log('Socket disconnected:', reason);
      //   setConnectionStatus('disconnected');
        
      //   if (reason !== 'io client disconnect') {
      //     retryTimeoutRef.current = setTimeout(() => {
      //       if (mountedRef.current && !socketRef.current?.connected) {
      //         initializeSocket();
      //       }
      //     }, RETRY_DELAY);
      //   }
      // });

      // socketRef.current.on('connect_error', (error) => {
      //   console.error('Socket connection error:', error);
      //   setConnectionStatus('error');
      //   setError(`Connection error: ${error.message}`);
      // });

      // Handle real-time photo updates
      // socketRef.current.on('photo-updated', (photoData) => {
      //   if (photoData.mediaType === 'image' && 
      //       (photoData.location === 'Canada' || photoData.location === 'Both Australia and Canada')) {
      //     setPhotoCount(prev => prev + 1);
      //   }
      // });

      // socketRef.current.on('photo-deleted', () => {
      //   setPhotoCount(prev => Math.max(0, prev - 1));
      // });

      socket.on('photo-updated', (photoData) => {
        if (photoData.mediaType === 'image' && 
            (photoData.location === 'Canada' || photoData.location === 'Both Australia and Canada')) {
          setPhotoCount(prev => prev + 1);
        }
      });

      socket.on('photo-deleted', () => {
        setPhotoCount(prev => Math.max(0, prev - 1));
      });

    } catch (error) {
      console.error('Socket initialization failed:', error);
      setConnectionStatus('error');
      // setError(`Connection failed: ${error.message}`);
    }
  }, []);

  const fetchRandomPhoto = useCallback(async (retryCount = 0) => {
    try {
      const response = await fetch(
        `${API_BASE}/api/photos/random?count=1&location=Canada&seed=${Math.random()}`
      );
      const data = await response.json();
  
      // console.log("Random photo response:", data);
  
      if (!Array.isArray(data) || data.length === 0) {
        throw new Error("No photos available");
      }
  
      const photo = data[0];
  
      // Ensure we have a usable URL
      if (!photo.url && !photo.secure_url && !photo.imageUrl) {
        throw new Error("Photo object missing URL");
      }
  
      return photo;
    } catch (err) {
      console.error("fetchRandomPhoto failed:", err);
      if (retryCount < MAX_RETRIES) {
        await new Promise(res => setTimeout(res, RETRY_DELAY));
        return fetchRandomPhoto(retryCount + 1);
      }
      throw err;
    }
  }, []);  

  const fetchPhotoCount = useCallback(async () => {
    try {
      // console.log('Fetching photo count...');
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(`${API_BASE}/api/photos/count?location=Canada`, {
        signal: controller.signal,
        headers: { 'Cache-Control': 'no-store' }
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json();
        // console.log('Photo count received:', data.count);
        setPhotoCount(data.count || 0);
      }
    } catch (error) {
      console.warn('Photo count fetch failed:', error.message);
    }
  }, []);

  const getOptimizedImageUrl = useCallback((url) => {
    if (!url || url.includes('/upload/f_jpg')) return url;
    return url.replace('/upload/', '/upload/f_jpg,q_auto:good,w_1920,h_1080,c_limit/');
  }, []);

  const changeSlide = useCallback(async () => {
    if (!mountedRef.current) {
      // console.log("mountedRef: ", mountedRef);
      // console.log("mountedRef.current: ", mountedRef.current);
      // console.log('changeSlide: Component not mounted, returning');
      return;
    }

    try {
      console.log('Changing slide...');
      setError(null);
      
      const newPhoto = await fetchRandomPhoto();
      // console.log('mountedRef.current after fetch:', mountedRef.current);
      
      if (!newPhoto) {
        console.log('No photo returned, exiting');
        return;
      }
      
      if (!mountedRef.current) {
        console.log('Component unmounted after fetch, exiting');
        return;
      }

      // console.log('Setting new photo:', newPhoto);
      setCurrentPhoto(newPhoto);
      // console.log('Photo set, updating last photo time');
      setLastPhotoTime(Date.now());
      // console.log('changeSlide completed successfully');

    } catch (error) {
      console.error('Slide change failed:', error);
      if (mountedRef.current) {
        setError(`Failed to load photo: ${error.message}`);
      }
    }
  }, [fetchRandomPhoto]);

  // Fullscreen controls
  const toggleFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (error) {
      console.warn('Fullscreen toggle failed:', error);
    }
  }, []);

  const exitFullscreen = useCallback(async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (error) {
      console.warn('Exit fullscreen failed:', error);
    }
  }, []);

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (e) => {
      switch(e.key) {
        case ' ':
        case 'ArrowRight':
          e.preventDefault();
          changeSlide();
          break;
        case 'f':
        case 'F':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'Escape':
          if (isFullscreen) exitFullscreen();
          break;
        case 'r':
        case 'R':
          e.preventDefault();
          changeSlide();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [changeSlide, toggleFullscreen, exitFullscreen, isFullscreen]);

  // Initialize on mount
  useEffect(() => {
    mountedRef.current = true; 
    const initialize = async () => {
      // console.log('Initializing slideshow...');
      
      // Set loading to false immediately to prevent unmount issues
      // console.log('Setting loading to false immediately');
      setLoading(false);
      
      try {
        // console.log('Starting socket initialization...');
        initializeSocket();
        // console.log('Socket initialization completed');
        
        // Fetch count first (non-blocking but with error handling)
        // console.log('Starting photo count fetch...');
        try {
          await fetchPhotoCount();
          // console.log('Photo count fetch completed');
        } catch (error) {
          console.warn('Photo count fetch failed, continuing...', error);
        }
        
        // Try to load first photo
        console.log('Starting first photo load...');
        try {
          await changeSlide();
          // console.log('First photo loaded successfully');
        } catch (error) {
          console.error('Failed to load first photo:', error);
          // Continue with initialization even if first photo fails
        }
        // console.log('Photo load attempt completed');
        
      } catch (error) {
        console.error('Initialization failed:', error);
        // if (mountedRef.current) {
        //   setError(`Initialization failed: ${error.message}`);
        // }
      }
    };

    // console.log('Calling initialize function...');
    initialize();

    slideIntervalRef.current = setInterval(() => {
      if (mountedRef.current) changeSlide();
    }, SLIDE_INTERVAL);

    return () => {
      mountedRef.current = false;
      
      if (slideIntervalRef.current) clearInterval(slideIntervalRef.current);
      if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);
      // if (socketRef.current) socketRef.current.disconnect();
    };
  }, []);

  // Stale photo detection
  useEffect(() => {
    const staleCheckInterval = setInterval(() => {
      if (!mountedRef.current) return;
      
      const timeSinceLastPhoto = Date.now() - lastPhotoTime;
      if (timeSinceLastPhoto > SLIDE_INTERVAL * 2.5) {
        console.warn('Stale photo detected, refreshing');
        changeSlide();
      }
    }, SLIDE_INTERVAL);

    return () => clearInterval(staleCheckInterval);
  }, [lastPhotoTime, changeSlide]);

  // Network status monitoring
  useEffect(() => {
    const handleOnline = () => {
      console.log('Network restored');
      setConnectionStatus('reconnecting');
      initializeSocket();
      changeSlide();
    };

    const handleOffline = () => {
      console.log('Network lost');
      setConnectionStatus('offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [initializeSocket, changeSlide]);

  if (loading) {
    return (
      <div className="slideshow-loading">
        <div className="loading-spinner"></div>
        <p>Loading wedding photos...</p>
        <p>Status: {connectionStatus} | Photos: {photoCount}</p>
        {error && <p className="error-message">Error: {error}</p>}
      </div>
    );
  }

  if (error && !currentPhoto) {
    return (
      <div className="slideshow-error">
        <div className="error-content">
          <h2>Unable to Load Photos</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="photo-slideshow">
      <div className="slideshow-container">
        {!currentPhoto ? (
          <div className="no-photos">
            <div className="no-photos-message">
              <h2>Wedding Photos</h2>
              <p>Photos will appear here shortly...</p>
              {error && <p className="error-text">{error}</p>}
            </div>
          </div>
        ) : (
          <div className="photos-area">
            <img 
              src={getOptimizedImageUrl(currentPhoto.url)} 
              alt="Wedding slideshow" 
              className="slideshow-photo"
              onError={() => {
                console.error('Image load failed:', currentPhoto.url);
                setError('Image failed to load');
                setTimeout(() => changeSlide(), 2000); // Auto-retry after 2s
              }}
              onLoad={() => {
                if (error?.includes('Image failed to load')) {
                  setError(null);
                }
              }}
            />
          </div>
        )}
      </div>
      
      <div className="slideshow-controls">
        <div className="layout-info">
          Photos: {photoCount} | Status: {connectionStatus}
          {error && <span className="error-indicator"> ⚠️</span>}
        </div>
        <div className="keyboard-info">
          Space/→: Next | F: Fullscreen | R: Refresh | Esc: Exit
        </div>
      </div>
    </div>
  );
}

export default PhotoSlideshow;