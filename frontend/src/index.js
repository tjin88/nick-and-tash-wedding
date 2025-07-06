import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import reportWebVitals from './reportWebVitals';

function ValidateInvite() {
  const { inviteId } = useParams();

  const [isValid, setIsValid] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isPlaceholderGuest, setIsPlaceholderGuest] = useState("");

  useEffect(() => {
    const checkValidity = async () => {
      try {
        const response = await fetch(`https://nick-and-tash-wedding.onrender.com/api/check-invite/${encodeURIComponent(inviteId)}`);
        // const response = await fetch(`http://localhost:3003/api/check-invite/${encodeURIComponent(inviteId)}`);
        const data = await response.json();
        setIsValid(data.isValid);
      } catch (error) {
        console.error('Error checking invite validity:', error);
      } finally {
        setLoading(false);
      }
    };

    if (inviteId === 'admin') {
      setIsValid(true);
      setIsAdmin(true);
      setLoading(false);
    } else if (inviteId === 'canada-guest') {
      setIsValid(true);
      setIsPlaceholderGuest("Canada");
      setLoading(false);
    } else if (inviteId === 'australia-guest') {
      setIsValid(true);
      setIsPlaceholderGuest("Australia");
      setLoading(false);
    } else {
      checkValidity();
    }
  }, [inviteId]);

  if (loading) {
    return <p>Loading...</p>;
  }

  return isValid ? <App isAdmin={isAdmin} isPlaceholderGuest={isPlaceholderGuest} /> : <Navigate to="/invalid-invite" replace />;
}

function InvalidInvite() {
  return <p>Hey! Welcome to the site. Looks like this is an invalid invite.</p>;
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/invite/:inviteId" element={<ValidateInvite />} />
        <Route path="/invalid-invite" element={<InvalidInvite />} />
        <Route path="*" element={<Navigate to="/invalid-invite" replace />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);

reportWebVitals();