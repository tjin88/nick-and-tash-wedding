import React, { useState, useEffect } from 'react';
import './Photos.css';

const VIDEO_FILE_TYPES = ['mp4', 'webm', 'ogg', 'mov', 'avi', 'mkv', 'flv', 'wmv'];
const IMAGE_FILE_TYPES = [
  'jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'tiff', 'tif', 'svg', 'ico',
  'dng', 'cr2', 'nef', 'arw', 'raf', 'orf', 'rw2'
];

const videoRegex = new RegExp(`\\.(${VIDEO_FILE_TYPES.join('|')})$`, 'i');
const imageRegex = new RegExp(`\\.(${IMAGE_FILE_TYPES.join('|')})$`, 'i');
const ACCEPT_FILE_TYPES = [
  'image/*',
  'video/*',
  ...IMAGE_FILE_TYPES.map(ext => `.${ext}`),
  ...VIDEO_FILE_TYPES.map(ext => `.${ext}`),
].join(',');

function Photos({ photos, setPhotos, fetchPhotos, username, invitedLocation }) {
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [uploadError, setUploadError] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://nick-and-tash-wedding.onrender.com';

  useEffect(() => {
    fetchPhotos();
  }, []);

  const getOptimizedImageUrl = (url) => {
    // Since we're using S3, images are already optimized during upload
    return url;
  };

  const getFileTypeInfo = (file) => {
    const fileName = file.name.toLowerCase();
    const mimeType = file.type.toLowerCase();
    
    if (mimeType.startsWith('video/') || videoRegex.test(fileName)) {
      return { type: 'video', isSupported: true };
    }
    
    if (mimeType.startsWith('image/') || imageRegex.test(fileName)) {
      return { type: 'image', isSupported: true };
    }
    
    return { type: 'unknown', isSupported: false };
  };

  const uploadFilesToServer = async (files) => {
    const formData = new FormData();
    
    // Add all files to FormData
    Array.from(files).forEach((file) => {
      formData.append('files', file);
    });
    
    // Add metadata
    formData.append('username', username || 'Guest');
    formData.append('location', invitedLocation || 'Canada');

    console.log(`Uploading ${files.length} files to server for processing...`);

    const response = await fetch(`${API_BASE_URL}/api/upload-media`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Server upload failed: ${errorData.message || 'Unknown error'}`);
    }

    const result = await response.json();
    console.log('Server upload result:', result);
    return result;
  };

  const handleFileSelect = async (event) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    if (files.length > 200) {
      setUploadError('You can only upload up to 200 files at a time.');
      return;
    }

    setIsUploading(true);
    setUploadError('');
    setUploadProgress('');

    try {
      // Step 1: Validate files before upload
      const validFiles = [];
      const errors = [];

      Array.from(files).forEach((file, index) => {
        const fileInfo = getFileTypeInfo(file);
        
        if (!fileInfo.isSupported) {
          errors.push(`${file.name}: Unsupported file type`);
          return;
        }

        // More generous file size limits since server will handle processing
        const maxSize = fileInfo.type === 'video' ? 2 * 1024 * 1024 * 1024 : 100 * 1024 * 1024; // 2GB for video, 100MB for images
        if (file.size > maxSize) {
          errors.push(`${file.name}: File too large (max ${fileInfo.type === 'video' ? '2GB' : '100MB'})`);
          return;
        }

        validFiles.push(file);
      });

      if (errors.length > 0) {
        setUploadError(`${errors.length} files were invalid: ${errors.slice(0, 3).join(', ')}${errors.length > 3 ? '...' : ''}`);
      }

      if (validFiles.length === 0) {
        setUploadError('No valid files to upload.');
        return;
      }

      // Step 2: Upload files to server
      setUploadProgress(`Uploading ${validFiles.length} files to server for processing...`);
      
      const result = await uploadFilesToServer(validFiles);

      // Step 3: Handle results
      if (result.success > 0) {
        setUploadProgress(`Processing complete! ${result.success} files uploaded successfully.`);
        
        // Add new photos to the gallery
        const newPhotoUrls = result.media.map(mediaItem => mediaItem.url);
        setPhotos(prevPhotos => [...newPhotoUrls, ...prevPhotos]);
        
        // Show additional info about processing
        if (result.media.some(item => item.originalName.toLowerCase().includes('.dng'))) {
          setUploadProgress(prev => prev + ' DNG files were converted to JPEG.');
        }
      }

      if (result.failed > 0) {
        const errorMessage = `${result.failed} files failed to process. ${result.success || 0} files succeeded.`;
        if (result.errors) {
          console.error('Upload errors:', result.errors);
        }
        if (result.success > 0) {
          setUploadProgress(errorMessage);
        } else {
          setUploadError(errorMessage);
        }
      }

      event.target.value = '';

    } catch (error) {
      console.error('Upload process error:', error);
      setUploadError('Upload failed: ' + error.message);
    } finally {
      setIsUploading(false);
      setTimeout(() => {
        setUploadProgress('');
      }, 8000); // Show success message longer
    }
  };

  return (
    <div className="photo-container">
      <p className='title'>Photos</p>
      <p style={{paddingBottom: '16px'}}>
        Please upload your photos from the wedding day to share with us! 
        RAW files (DNG, CR2, NEF, etc.) will be automatically converted to JPEG.
      </p>
      
      <div className="upload-section">
        {uploadError && <p className="error">{uploadError}</p>}
        {uploadProgress && <p className="uploading">{uploadProgress}</p>}
        {isUploading && !uploadProgress && <p className="uploading">Processing files...</p>}
        <input 
          type="file" 
          accept={ACCEPT_FILE_TYPES}
          multiple 
          onChange={handleFileSelect} 
          id="file-upload" 
          style={{ display: 'none' }} 
          disabled={isUploading}
        />
        <label htmlFor="file-upload" className={`upload-option ${isUploading ? 'disabled' : ''}`}>
          {isUploading ? 'Processing...' : 'Upload Photos / Videos'}
        </label>
      </div>
      
      <div className="photo-gallery">
        {photos.map((photo, index) => {
          const isVideo = videoRegex.test(photo);
          return isVideo ? (
            <video 
              key={index} 
              src={photo} 
              className="photo-item" 
              controls 
              onClick={() => setSelectedPhoto(photo)} 
            />
          ) : (
            <img 
              key={index} 
              src={getOptimizedImageUrl(photo)} 
              alt={`Gallery item ${index}`} 
              className="photo-item" 
              onClick={() => setSelectedPhoto(getOptimizedImageUrl(photo))} 
              loading="lazy"
            />
          );
        })}
      </div>
      
      {selectedPhoto && (
        <div className="photo-modal" onClick={() => setSelectedPhoto(null)}>
          {videoRegex.test(selectedPhoto) ? (
            <video 
              src={selectedPhoto} 
              className="modal-content" 
              controls 
              autoPlay 
            />
          ) : (
            <img 
              src={getOptimizedImageUrl(selectedPhoto)} 
              alt="Enlarged view" 
              className="modal-content"
            />
          )}
          <span className="close-modal" onClick={() => setSelectedPhoto(null)}>&times;</span>
        </div>
      )}
    </div>
  );
}

export default Photos;