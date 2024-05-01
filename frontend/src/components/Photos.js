import React, { useState } from 'react';
import './Photos.css';

function Photos({ photos, setPhotos }) {
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [uploadError, setUploadError] = useState('');
  // const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to upload the photo: ${errorText}`);
        }

        const result = await response.json();
        setPhotos([...photos, result.url]);
      } catch (error) {
        console.error('Upload error:', error);
        setUploadError('Failed to upload photo: ' + error.message);
      }
    }
  };

  return (
    <div className="photo-container">
      <h1 className='title'>Photos</h1>
      <div className="upload-section">
        {uploadError && <p className="error">{uploadError}</p>}
        <input type="file" accept="image/*" onChange={handleFileSelect} id="file-upload" style={{ display: 'none' }} />
        <label htmlFor="file-upload" className="upload-option">Upload Photo</label>
      </div>
      <div className="photo-gallery">
        {photos.map((photo, index) => (
          <img key={index} src={photo} alt={`Gallery item ${index}`} className="photo-item" onClick={() => setSelectedPhoto(photo)} />
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