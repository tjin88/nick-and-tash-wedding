import React, { useState, useEffect } from 'react';
import './Photos.css';

function Photos({ photos, setPhotos, fetchPhotos, username, invitedLocation }) {
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [uploadError, setUploadError] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  // const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  // Cloudinary configuration
  const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}/auto/upload`;
  const UPLOAD_PRESET = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET; // You'll need to create this

  useEffect(() => {
    fetchPhotos();
  }, []);

  // Generate unique ID (moved from server)
  const generateUniqueId = (index) => {
    const now = new Date();
    const monthNames = ["January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"];
    const month = monthNames[now.getMonth()];
    const day = now.getDate();
    const year = now.getFullYear();
    
    // Convert to 12-hour format
    let hour = now.getHours();
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12;
    hour = hour ? hour : 12;
    const minute = String(now.getMinutes()).padStart(2, '0');
    const second = String(now.getSeconds()).padStart(2, '0');
    
    return `nnjin_wedding_${month}_${day}_${year}_${hour}-${minute}-${second}-${ampm}_${username}_${index + 1}`;
  };

  // Upload single file directly to Cloudinary
  const uploadFileToCloudinary = async (file, index) => {
    const formData = new FormData();
    const isVideo = file.type.startsWith('video/');
    const uniqueId = generateUniqueId(index);

    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);
    formData.append('public_id', uniqueId);
    formData.append('folder', `${UPLOAD_PRESET}_${invitedLocation}`);
    formData.append('resource_type', isVideo ? 'video' : 'image');
    
    // Add image optimization settings for non-videos
    if (!isVideo) {
      formData.append('format', 'jpg');
      formData.append('quality', 'auto:good');
    }

    const response = await fetch(CLOUDINARY_UPLOAD_URL, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Cloudinary upload failed: ${errorData.error?.message || 'Unknown error'}`);
    }

    return await response.json();
  };

  // Save media metadata to your database
  const saveMediaMetadata = async (mediaItems) => {
    const response = await fetch('https://nick-and-tash-wedding.onrender.com/api/save-media-metadata', {
    // const response = await fetch('http://localhost:3003/api/save-media-metadata', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        media: mediaItems,
        location: invitedLocation || "Canada",
        username: username
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to save metadata: ${errorText}`);
    }

    return await response.json();
  };

  const handleFileSelect = async (event) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    if (files.length > 200) {
      setUploadError('You can only upload up to 200 files at a time.');
      return;
    }
    
    if (!UPLOAD_PRESET) {
      setUploadError('Upload configuration missing. Please contact Tristan Jin (tjin368@gmail.com).');
      return;
    }

    setIsUploading(true);
    setUploadError('');
    setUploadProgress('');

    const mediaItems = [];
    const uploadErrors = [];

    try {
      // Client-side validation
      const validFiles = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const isVideo = file.type.startsWith('video/');
        const isImage = file.type.startsWith('image/');
        
        if (!isVideo && !isImage) {
          uploadErrors.push({
            index: i + 1,
            filename: file.name,
            error: `Unsupported file type: ${file.type}`
          });
          continue;
        }

        // File size limits
        const maxSize = isVideo ? 2 * 1024 * 1024 * 1024 : 20 * 1024 * 1024; // 2GB for video, 20MB for image
        if (file.size > maxSize) {
          uploadErrors.push({
            index: i + 1,
            filename: file.name,
            error: `File too large. Max size: ${isVideo ? '2GB' : '20MB'}`
          });
          continue;
        }

        validFiles.push({ file, originalIndex: i });
      }

      const totalValidFiles = validFiles.length;

      // Process uploads function (moved outside loop to fix ESLint warning)
      const processUpload = async (fileData, fileIndex) => {
        try {
          const result = await uploadFileToCloudinary(fileData.file, fileData.originalIndex);
          const isVideo = fileData.file.type.startsWith('video/');
          
          const mediaItem = {
            url: result.secure_url,
            mediaType: isVideo ? 'video' : 'image',
            uploadedAt: new Date().toISOString(),
            uploadedBy: username || 'Guest'
          };
          
          mediaItems.push(mediaItem);
          setUploadProgress(`Uploaded ${mediaItems.length}/${totalValidFiles} files`);
          
          return { success: true, index: fileData.originalIndex, result: mediaItem };
        } catch (error) {
          console.error(`Upload error for file ${fileData.originalIndex + 1}:`, error);
          uploadErrors.push({
            index: fileData.originalIndex + 1,
            filename: fileData.file.name,
            error: error.message
          });
          return { success: false, index: fileData.originalIndex, error: error.message };
        }
      };

      // Process uploads with concurrency limit
      const concurrencyLimit = 3;
      const uploadPromises = [];
      
      for (let i = 0; i < validFiles.length; i++) {
        const uploadPromise = processUpload(validFiles[i], i);
        uploadPromises.push(uploadPromise);

        // Process in batches
        if (uploadPromises.length >= concurrencyLimit || i === validFiles.length - 1) {
          await Promise.allSettled(uploadPromises.splice(0, concurrencyLimit));
        }
      }

      // Save metadata to database
      if (mediaItems.length > 0) {
        setUploadProgress('Saving to database...');
        const savedResult = await saveMediaMetadata(mediaItems);
        
        // Update local state with new photos
        const newPhotoUrls = savedResult.media.map(mediaItem => mediaItem.url);
        setPhotos(prevPhotos => [...prevPhotos, ...newPhotoUrls]);
      }

      // Show results
      if (uploadErrors.length > 0) {
        setUploadError(`${uploadErrors.length} files failed to upload. ${mediaItems.length} files uploaded successfully.`);
        console.error('Upload errors:', uploadErrors);
      } else {
        setUploadProgress(`Successfully uploaded all ${mediaItems.length} files!`);
      }

      // Clear the file input
      event.target.value = '';

    } catch (error) {
      console.error('Upload error:', error);
      setUploadError('Failed to upload photos: ' + error.message);
    } finally {
      setIsUploading(false);
      // Clear progress message after delay
      setTimeout(() => {
        setUploadProgress('');
      }, 3000);
    }
  };

  return (
    <div className="photo-container">
      <p className='title'>Photos</p>
      <p style={{paddingBottom: '16px'}}>Please upload your photos from the wedding day to share with us!</p>
      
      <div className="upload-section">
        {uploadError && <p className="error">{uploadError}</p>}
        {uploadProgress && <p className="uploading">{uploadProgress}</p>}
        {isUploading && !uploadProgress && <p className="uploading">Uploading ...</p>}
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