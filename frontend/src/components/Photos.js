// TODO: Currently this is implemented to show ALL photos, not just Canada or just Australia **
import React, { useState, useEffect } from 'react';
import './Photos.css';

function Photos({ photos, setPhotos, fetchPhotos, username, invitedLocation }) {
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [uploadError, setUploadError] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  // const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  useEffect(() => {
    fetchPhotos();
  }, []);

  const handleFileSelect = async (event) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setIsUploading(true);
      setUploadError('');
      
      const formData = new FormData();
      formData.append('location', invitedLocation || "Both Australia and Canada");
      
      // Add all selected files
      for (let i = 0; i < files.length; i++) {
        formData.append('files', files[i]);
      }
      
      // Add username to the form data
      formData.append('username', username);

      try {
        const response = await fetch('https://nick-and-tash-wedding.onrender.com/api/upload-photos', {
        // const response = await fetch('http://localhost:3003/api/upload-photos', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to upload photos: ${errorText}`);
        }

        const result = await response.json();
        
        // Extract URLs from the response - updated to use 'media' instead of 'photos'
        const newPhotoUrls = result.media.map(mediaItem => mediaItem.url);
        setPhotos([...photos, ...newPhotoUrls]);
        
        // Clear the file input
        event.target.value = '';
        
      } catch (error) {
        console.error('Upload error:', error);
        setUploadError('Failed to upload photos: ' + error.message);
      } finally {
        setIsUploading(false);
      }
    }
  };

  // TODO: Add delete functionality
  return (
    <div className="photo-container">
      <p className='title'>Photos</p>
      <p style={{paddingBottom: '16px'}}>Please upload your photos from the wedding day to share with us!</p>
      <div className="upload-section">
        {uploadError && <p className="error">{uploadError}</p>}
        {isUploading && <p className="uploading">Uploading ...</p>}
        <input 
          type="file" 
          accept="image/*,video/*" 
          multiple 
          onChange={handleFileSelect} 
          id="file-upload" 
          style={{ display: 'none' }} 
          disabled={isUploading}
        />
        <label htmlFor="file-upload" className={`upload-option ${isUploading ? 'disabled' : ''}`}>
          {isUploading ? 'Uploading ...' : 'Upload Photos / Videos'}
        </label>
      </div>
      <div className="photo-gallery">
        {photos.map((photo, index) => {
          const isVideo = /\.(mp4|webm|ogg)$/i.test(photo);
          return isVideo ? (
            <video key={index} src={photo} className="photo-item" controls onClick={() => setSelectedPhoto(photo)} />
          ) : (
            <img key={index} src={photo} alt={`Gallery item ${index}`} className="photo-item" onClick={() => setSelectedPhoto(photo)} />
          );
        })}
      </div>
      {selectedPhoto && (
        <div className="photo-modal" onClick={() => setSelectedPhoto(null)}>
          {/\.(mp4|webm|ogg)$/i.test(selectedPhoto) ? (
            <video src={selectedPhoto} className="modal-content" controls autoPlay />
          ) : (
            <img src={selectedPhoto} alt="Enlarged view" className="modal-content"/>
          )}
          <span className="close-modal" onClick={() => setSelectedPhoto(null)}>&times;</span>
        </div>
      )}
    </div>
  );
}

export default Photos;