import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { SocketProvider } from "./utils/SocketProvider";

// MongoDB ObjectID format: 24 hex characters (no server call; used to allow shared invite links)
function looksLikeMongoId(id) {
  return typeof id === 'string' && /^[a-fA-F0-9]{24}$/.test(id);
}

function ValidateInvite({ isWeddingSlideshow = false }) {
  const { inviteId } = useParams();

  let isValid = false;
  let isAdmin = false;
  let isPlaceholderGuest = '';

  if (inviteId === 'admin') {
    isValid = true;
    isAdmin = true;
  } else if (isWeddingSlideshow) {
    isValid = true;
    isPlaceholderGuest = 'Canada';
  } else if (inviteId === 'canada-post-wedding') {
    isValid = true;
    isPlaceholderGuest = 'Canada Post-Wedding';
  } else if (inviteId === 'canada-guest') {
    isValid = true;
    isPlaceholderGuest = 'Canada';
  } else if (inviteId === 'australia-guest') {
    isValid = true;
    isPlaceholderGuest = 'Australia';
  } else if (looksLikeMongoId(inviteId)) {
    isValid = true;
    // Generic invite from MongoDB; App no longer needs invite-specific data
  }

  return isValid ? (
    <SocketProvider>
      <App isAdmin={isAdmin} isPlaceholderGuest={isPlaceholderGuest} navOptionPlaceholder={isPlaceholderGuest === 'Canada Post-Wedding' ? 'photos' : 'rsvp'} />
    </SocketProvider>
  ) : (
    <Navigate to="/invalid-invite" replace />
  );
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
