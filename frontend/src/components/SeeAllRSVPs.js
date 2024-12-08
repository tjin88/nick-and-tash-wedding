import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import './SeeAllRSVPs.css';

function SeeAllRSVPs({ invites = [] }) {
    const [visible, setVisible] = useState(false);
    
    useEffect(() => {
        setVisible(true);
    }, []);

    const attendingGuests = (invites || []).flatMap((invite, index) => 
        (invite.guests || [])
            .filter(guest => 
                guest.attendingStatus === "Both Australia and Canada" || 
                guest.attendingStatus === "Canada Only"
            )
            .map((guest, i) => ({
                ...guest,
                key: `${index}-${i}`
            }))
    );

    return (
        <div className="rsvp-container">
            <div className={`fade-in ${visible ? 'visible' : ''}`}>
                <div className="rsvp-card">
                    <div className="rsvp-header">
                        <Heart className="heart-icon" size={24} />
                        <h2 className="rsvp-title">
                            Canadian Wedding Guest List
                        </h2>
                        <Heart className="heart-icon" size={24} />
                    </div>

                    <div className="guest-list">
                        {attendingGuests.map((guest, index) => (
                            <div
                                key={guest.key}
                                className={`guest-item slide-in ${visible ? 'visible' : ''}`}
                                style={{ transitionDelay: `${index * 100}ms` }}
                            >
                                <div className="guest-dot" />
                                <span className="guest-name">
                                    {guest.firstName} {guest.lastName}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SeeAllRSVPs;