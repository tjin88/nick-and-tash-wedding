import React, { useState } from 'react';
import CanadaSeating from '../images/canada_seat_chart.png';
import './Seating.css';

function Seating() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setError('Failed to load seating chart. Please try refreshing the page.');
  };

  return (
    <div className="seating-container">
      <div className="title">Seating</div>
      
      <div className="seating-content">
        {isLoading && (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading seating chart...</p>
          </div>
        )}
        
        {error && (
          <div className="error-container">
            <p className="error-message">{error}</p>
            <button 
              className="retry-button"
              onClick={() => {
                setIsLoading(true);
                setError(null);
                // Force reload by changing the key
                window.location.reload();
              }}
            >
              Try Again
            </button>
          </div>
        )}
        
        <div className="seating-image-container">
          <img
            src={CanadaSeating}
            alt="Canadian Wedding Seating Chart - Find your assigned table for the reception"
            className="seating-image"
            onLoad={handleLoad}
            onError={handleError}
            style={{ display: isLoading ? 'none' : 'block' }}
          />
        </div>
        
        <div className="seating-instructions">
          <div className="download-section">
            <p>Having trouble viewing the seating chart?</p>
            <a 
              href="/canada_seat_chart.png" 
              target="_blank" 
              rel="noopener noreferrer"
              className="download-link"
            >
              Open Seating Chart in New Tab
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Seating;
