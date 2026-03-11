import React from 'react';
import './Start.css';

const PHOTOS_DRIVE_URL = 'https://drive.google.com/drive/folders/1enjDWFWVlLMTKgu_ydixuVa2fKLPb0ZV?usp=sharing';

function GuestStart() {
  return (
    <div className="startInvitation">
      <div className="background-image"></div>
      <div className="background-image-mobile"></div>
      <div className="content">
        <p>Thanks for attending our wedding!</p>
        <p>If you would like to relive the memories, please go to the Google Drive link below.</p>
        <div className="navbar-options">
          <a
            href={PHOTOS_DRIVE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="photos-link-button"
          >
            Photos
          </a>
        </div>
      </div>
    </div>
  );
}

export default GuestStart;
