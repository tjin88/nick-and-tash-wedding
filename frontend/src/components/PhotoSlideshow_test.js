import React, { useState, useEffect } from 'react';

const PhotoSlideshow = () => {
  // Sample photo URLs - replace these with your actual photo URLs
  const photoUrls = [
    "http://res.cloudinary.com/dzqvochvq/image/upload/v1754520007/demo/nnjin_wedding_August_6_2025_10-40-04-PM_Admin__2.jpg",
    "http://res.cloudinary.com/dzqvochvq/image/upload/v1754520007/demo/nnjin_wedding_August_6_2025_10-40-04-PM_Admin__2.jpg",
    "http://res.cloudinary.com/dzqvochvq/image/upload/v1754520007/demo/nnjin_wedding_August_6_2025_10-40-04-PM_Admin__2.jpg",
    "http://res.cloudinary.com/dzqvochvq/image/upload/v1754520007/demo/nnjin_wedding_August_6_2025_10-40-04-PM_Admin__2.jpg",
    "http://res.cloudinary.com/dzqvochvq/image/upload/v1754520007/demo/nnjin_wedding_August_6_2025_10-40-04-PM_Admin__2.jpg",
    "http://res.cloudinary.com/dzqvochvq/image/upload/v1754520007/demo/nnjin_wedding_August_6_2025_10-40-04-PM_Admin__2.jpg",
    "http://res.cloudinary.com/dzqvochvq/image/upload/v1754520007/demo/nnjin_wedding_August_6_2025_10-40-04-PM_Admin__2.jpg",
    "http://res.cloudinary.com/dzqvochvq/image/upload/v1754520007/demo/nnjin_wedding_August_6_2025_10-40-04-PM_Admin__2.jpg",
    "http://res.cloudinary.com/dzqvochvq/image/upload/v1754520007/demo/nnjin_wedding_August_6_2025_10-40-04-PM_Admin__2.jpg",
  ];

  const [photos, setPhotos] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Create a photo object with random positioning
  const createPhoto = (url, index) => {
    const colors = [
      'bg-red-400', 'bg-blue-400', 'bg-green-400', 'bg-yellow-400', 
      'bg-purple-400', 'bg-pink-400', 'bg-indigo-400', 'bg-cyan-400'
    ];
    
    return {
      id: `photo-${Date.now()}-${Math.random()}-${index}`, // More unique ID
      url: url,
      top: Math.random() * 50 + 20, // 20% to 70% from top
      left: Math.random() * 50 + 20, // 20% to 70% from left
      rotation: Math.random() * 20 - 10, // -10 to 10 degrees
      scale: Math.random() * 0.2 + 0.9, // 0.9 to 1.1 scale
      color: colors[index % colors.length],
      zIndex: index + 1
    };
  };

  // Add a new photo
  const addNewPhoto = () => {
    const newPhoto = createPhoto(photoUrls[currentIndex % photoUrls.length], currentIndex);
    
    setPhotos(prev => {
      const updated = [...prev, newPhoto];
      return updated.slice(-3); // Keep max 3 photos
    });

    setCurrentIndex(prev => prev + 1);
  };

  // Remove oldest photo
  const removeOldPhoto = () => {
    setPhotos(prev => prev.slice(1));
  };

  // Initialize slideshow
  useEffect(() => {
    let photoCounter = 0;
    
    const addPhoto = () => {
      const newPhoto = createPhoto(photoUrls[photoCounter % photoUrls.length], photoCounter);
      setPhotos(prev => [...prev, newPhoto].slice(-3)); // Keep only last 3
      setCurrentIndex(photoCounter + 1);
      photoCounter++;
    };
    
    // Add first photo immediately
    addPhoto();
    
    const interval = setInterval(addPhoto, 3000);

    return () => clearInterval(interval);
  }, []); // Empty dependency array to run only once

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-800 to-black">
      {photos.map((photo) => (
        <div
          key={photo.id}
          className="absolute transition-all duration-500 ease-out"
          style={{
            top: `${photo.top}%`,
            left: `${photo.left}%`,
            transform: `translate(-50%, -50%) rotate(${photo.rotation}deg) scale(${photo.scale})`,
            zIndex: photo.zIndex,
          }}
        >
          {/* Polaroid-style photo frame */}
          <div className="bg-white p-3 rounded-lg shadow-2xl transform hover:scale-105 transition-transform">
            <div className="w-40 h-32 rounded overflow-hidden relative">
              {/* Actual image */}
              <img
                src={photo.url}
                alt={`Photo ${photo.id}`}
                className="object-cover rounded"
                style={{ width: '200px', height: 'auto' }}
                onLoad={(e) => {
                  console.log('Image loaded successfully:', photo.url);
                  e.target.style.display = 'block';
                }}
                onError={(e) => {
                  console.log('Image failed to load:', photo.url);
                  // Hide the broken image and show fallback
                  e.target.style.display = 'none';
                  const fallback = e.target.nextElementSibling;
                  if (fallback) {
                    fallback.style.display = 'flex';
                  }
                }}
              />
              {/* Fallback colored rectangle */}
              <div 
                className={`absolute inset-0 ${photo.color} flex items-center justify-center text-white font-bold text-lg`}
                style={{ display: 'none' }}
              >
                Photo {photos.indexOf(photo) + 1}
              </div>
            </div>
            {/* Optional caption area */}
            <div className="h-8 flex items-center justify-center">
              <div className="w-4 h-4 bg-gray-200 rounded-full"></div>
            </div>
          </div>
        </div>
      ))}
      
      {/* Debug info */}
      <div className="absolute top-4 left-4 text-white text-sm bg-black bg-opacity-50 p-2 rounded">
        Photos: {photos.length} | Index: {currentIndex}
      </div>
      
      {/* Instructions */}
      <div className="absolute bottom-4 right-4 text-white text-sm opacity-70">
        Photo Slideshow - Replace URLs with your photos
      </div>
    </div>
  );
};

export default PhotoSlideshow;