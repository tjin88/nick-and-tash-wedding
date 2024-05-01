import React, { useState } from 'react';
import './Photos.css';

function Photos({ photos, setPhotos }) {
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [showUploadOptions, setShowUploadOptions] = useState(false);
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  // both mobile and web
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
        const newPhotoUrl = URL.createObjectURL(file);
        console.log('newPhotoUrl', newPhotoUrl);
        setPhotos([...photos, newPhotoUrl]);
        // Handle the upload to Google Drive here
    }
  };

  // mobile only!
  const handleCameraCapture = (event) => {
    const file = event.target.files[0];
    if (file) {
        const newPhotoUrl = URL.createObjectURL(file);
        console.log('newPhotoUrl', newPhotoUrl);
        setPhotos([...photos, newPhotoUrl]);
        // Handle the upload to Google Drive here
    }
  };

  return (
    <div className="photo-container">
      <h1 className='title'>Photos</h1>
      <div className="upload-section">
        <button onClick={() => setShowUploadOptions(!showUploadOptions)} className="upload-button">Upload Photos</button>
        {showUploadOptions && (
          <div className="upload-options">
            <input type="file" accept="image/*" onChange={handleFileSelect} id="file-upload" style={{ display: 'none' }} />
            <label htmlFor="file-upload" className="upload-option">Upload Photo</label>
            {isMobile && (
              <div className='mobile'>
                  <input type="file" accept="image/*" capture="environment" onChange={handleCameraCapture} id="camera-upload" style={{ display: 'none' }} />
                  <label htmlFor="camera-upload" className="upload-option">Take Photo</label>
              </div>
            )}
          </div>
        )}
      </div>
      <div className="photo-gallery">
        {photos.map((photo, index) => (
          <img key={index} src={photo} alt={`Gallery ${index}`} className="photo-item" onClick={() => setSelectedPhoto(photo)} />
        ))}
      </div>
      {selectedPhoto && (
        <div className="photo-modal" onClick={() => setSelectedPhoto(null)}>
          <img src={selectedPhoto} alt="Enlarged view" className="modal-content"/>
          <span className="close-modal" onClick={() => setSelectedPhoto(null)}>&times;</span>
        </div>
      )}
    </div>
  );
}

export default Photos;