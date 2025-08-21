import React, { useState, useEffect } from 'react';
// TODO: May remove if using AWS instead of Cloudinary
import imageCompression from 'browser-image-compression';
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

function Photos({ isAdmin, photos, setPhotos, fetchPhotos, username, invitedLocation }) {
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [uploadError, setUploadError] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [deletingPhotoId, setDeletingPhotoId] = useState(null);
  // const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  // const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}/auto/upload`;
  const UPLOAD_PRESET = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET;

  useEffect(() => {
    fetchPhotos();
  }, []);

  const getOptimizedImageUrl = (url) => {
    if (url.includes('/upload/f_jpg') || videoRegex.test(url)) {
      return url;
    }
    return url.replace('/upload/', '/upload/f_jpg,q_auto/');
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

  // Generate unique ID
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

  const uploadFileToCloudinary = async (file, index) => {
    const formData = new FormData();
    const uniqueId = generateUniqueId(index);

    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);
    formData.append('public_id', uniqueId);

    console.log(`Uploading file: ${file.name}, Type: ${file.type}, Size: ${(file.size / 1024 / 1024).toFixed(2)}MB`);

    const response = await fetch(CLOUDINARY_UPLOAD_URL, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Cloudinary error response:', errorData);
      throw new Error(`Cloudinary upload failed: ${errorData.error?.message || 'Unknown error'}`);
    }

    const result = await response.json();
    console.log('Cloudinary upload success:', result.public_id, result.format);
    return result;
  };

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

  const deletePhoto = async (photoId) => {
    if (!isAdmin) {
      console.error('Only admins can delete photos');
      return;
    }

    if (!photoId) {
      console.error('No photo ID provided for deletion');
      setUploadError('Cannot delete photo: missing photo ID');
      return;
    }

    setDeletingPhotoId(photoId);
    try {
      const response = await fetch(`https://nick-and-tash-wedding.onrender.com/api/photos/${photoId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete photo');
      }

      // Remove the photo from the local state
      setPhotos(prevPhotos => prevPhotos.filter(photo => {
        if (typeof photo === 'string') {
          return true; // Keep string photos (they don't have IDs)
        }
        return photo._id !== photoId;
      }));
    } catch (error) {
      console.error('Error deleting photo:', error);
      setUploadError('Failed to delete photo. Please try again.');
    } finally {
      setDeletingPhotoId(null);
    }
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

    const uploadErrors = [];
    const mediaItems = [];

    try {
      // Step 1: Pre-process files (convert large images) and validate them.
      const processingPromises = Array.from(files).map(async (originalFile, index) => {
        let file = originalFile;
        let fileInfo = getFileTypeInfo(file);

        // --- 2. Convert large images to JPG before validation and upload ---
        const MAX_IMAGE_SIZE_FOR_CONVERSION = 20 * 1024 * 1024; // 20MB threshold
        if (fileInfo.type === 'image' && file.size > MAX_IMAGE_SIZE_FOR_CONVERSION) {
          try {
            console.log(`Compressing ${file.name} because it's over 20MB...`);
            const options = {
              maxSizeMB: 10,
              maxWidthOrHeight: 1920,
              useWebWorker: true,
              fileType: 'image/jpeg', // Force output to JPEG
            };
            const compressedBlob = await imageCompression(file, options);
            const newFileName = `${file.name.split('.').slice(0, -1).join('.')}.jpg`;
            file = new File([compressedBlob], newFileName, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            console.log(`Compression complete for ${newFileName}. New size: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
          } catch (error) {
            return {
              status: 'error',
              index: index + 1,
              filename: originalFile.name,
              error: `Image too large. Please contact Tristan Jin (tjin368@gmail.com) to manually upload the image.`
            };
          }
        }

        // Re-evaluate fileInfo after potential conversion and validate size.
        fileInfo = getFileTypeInfo(file);
        
        if (!fileInfo.isSupported) {
          return { status: 'error', index: index + 1, filename: originalFile.name, error: `Unsupported file type.` };
        }

        // File size limits
        const maxSize = fileInfo.type === 'video' ? 2 * 1024 * 1024 * 1024 : 20 * 1024 * 1024; // 2GB for video, 20MB for image
        if (file.size > maxSize) {
          return { status: 'error', index: index + 1, filename: originalFile.name, error: `File too large (max ${fileInfo.type === 'video' ? '2GB' : '20MB'}).` };
        }
        
        return { status: 'valid', data: { file, originalIndex: index, fileInfo } };
      });

      const processedFiles = await Promise.all(processingPromises);

      const validFiles = processedFiles.filter(p => p.status === 'valid').map(p => p.data);
      const initialErrors = processedFiles.filter(p => p.status === 'error');
      uploadErrors.push(...initialErrors);
      
      const totalValidFiles = validFiles.length;

      // Step 2: Process uploads with a concurrency limit.
      if (totalValidFiles > 0) {
        setUploadProgress(`Uploading 0/${totalValidFiles} files...`);

        const processUpload = async (fileData) => {
          try {
            const result = await uploadFileToCloudinary(fileData.file, fileData.originalIndex);
            return {
              success: true,
              result: {
                url: result.secure_url,
                mediaType: fileData.fileInfo.type,
                uploadedAt: new Date().toISOString(),
                uploadedBy: username || 'Guest'
              }
            };
          } catch (error) {
            uploadErrors.push({ index: fileData.originalIndex + 1, filename: fileData.file.name, error: error.message });
            return { success: false };
          }
        };

        const concurrencyLimit = 3;
        let completedCount = 0;
        const queue = [...validFiles];

        const worker = async () => {
          while (queue.length > 0) {
            const task = queue.shift();
            if (task) {
              const res = await processUpload(task);
              if (res.success) {
                mediaItems.push(res.result);
              }
              completedCount++;
              setUploadProgress(`Uploaded ${completedCount}/${totalValidFiles} files`);
            }
          }
        };
        
        const workers = Array(concurrencyLimit).fill(null).map(() => worker());
        await Promise.all(workers);
      }

      // Step 3: Save metadata to your database.
      if (mediaItems.length > 0) {
        setUploadProgress('Saving to database...');
        const savedResult = await saveMediaMetadata(mediaItems);

        // Removing this as we're already retrieving the photos through socket.io
        // const newPhotoUrls = savedResult.media.map(mediaItem => mediaItem.url);
        // setPhotos(prevPhotos => [...newPhotoUrls, ...prevPhotos]);
      }

      // Step 4: Show final results.
      if (uploadErrors.length > 0) {
        setUploadError(`${uploadErrors.length} files failed. ${mediaItems.length} files succeeded.`);
        console.error('Upload errors:', uploadErrors);
      } else if (mediaItems.length > 0) {
        setUploadProgress(`Successfully uploaded all ${mediaItems.length} files!`);
      } else {
        setUploadProgress('No valid files were uploaded.');
      }

      event.target.value = '';

    } catch (error) {
      console.error('Upload process error:', error);
      setUploadError('A critical error occurred: ' + error.message);
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(''), 5000);
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
          accept={ACCEPT_FILE_TYPES}
          multiple 
          onChange={handleFileSelect} 
          id="file-upload" 
          style={{ display: 'none' }} 
          disabled={isUploading}
        />
        <label htmlFor="file-upload" className={`upload-option ${isUploading ? 'disabled' : ''}`}>
          {isUploading ? 'Uploading...' : 'Upload Photos / Videos'}
        </label>
      </div>
      <div className="photo-gallery">
        {photos.map((photo, index) => {
          const photoUrl = typeof photo === 'string' ? photo : photo.url;
          const photoId = photo._id;
          const isVideo = videoRegex.test(photoUrl);
          
          return (
            <div key={photoId || index} className="photo-item-container">
              {isVideo ? (
                <video src={photoUrl} className="photo-item" controls onClick={() => setSelectedPhoto(photoUrl)} />
              ) : (
                <img src={getOptimizedImageUrl(photoUrl)} alt={`Gallery item ${index}`} className="photo-item" onClick={() => setSelectedPhoto(getOptimizedImageUrl(photoUrl))} />
              )}
              {isAdmin && photoId && (
                <button
                  className="delete-photo-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm('Are you sure you want to delete this photo?')) {
                      deletePhoto(photoId);
                    }
                  }}
                  disabled={deletingPhotoId === photoId}
                >
                  {deletingPhotoId === photoId ? 'Deleting...' : '×'}
                </button>
              )}
            </div>
          );
        })}
      </div>
      {selectedPhoto && (
        <div className="photo-modal" onClick={() => setSelectedPhoto(null)}>
          {videoRegex.test(selectedPhoto) ? (
            <video src={selectedPhoto} className="modal-content" controls autoPlay />
          ) : (
            <img src={getOptimizedImageUrl(selectedPhoto)} alt="Enlarged view" className="modal-content"/>
          )}
          <span className="close-modal" onClick={() => setSelectedPhoto(null)}>&times;</span>
        </div>
      )}
    </div>
  );
}

export default Photos;