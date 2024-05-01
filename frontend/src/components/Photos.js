import React, { useState } from 'react';
import './Photos.css';

function Photos({ photos, setPhotos }) {
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  // const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  // both mobile and web --> iPhone this works!
  // TODO: Test on Android
  const handleFileSelect = (event) => {
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
        <input type="file" accept="image/*" onChange={handleFileSelect} id="file-upload" style={{ display: 'none' }} />
        <label htmlFor="file-upload" className="upload-option">Upload Photo</label>
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