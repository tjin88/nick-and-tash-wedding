import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import './SeeAllRSVPs.css';

function SeeAllRSVPs({ invites = [], fetchAllInvites }) {
    const [visible, setVisible] = useState(false);
    
    useEffect(() => {
        fetchAllInvites();
        setVisible(true);
    }, []);

    // TODO: Adjust this filter. Currently it is based on last name only
    //       Need to change the filter to be based on the first person in the invite's last name
    //       Ex. If there is an invite where invite.guests = ["Test Jin", "Test Hew", "Test Bob"], 
    //       the invite should be sorted by the name "Jin"
    //       Thus, if there are three invites, with the invite.guests = ["Test Car", "Test Bill"], invite.guests = ["Test Toy", "Test Able"], invite.guests = ["Test Ace", "Test Zebra"]
    //       The final attendingGuests should be: attendingGuests = ["Test Ace", "Test Zebra", "Test Car", "Test Bill", "Test Toy", "Test Able"]
    const attendingGuests = (invites || [])
        .flatMap((invite, index) => 
            (invite.guests || [])
                .filter(guest => 
                    guest.attendingStatus === "Both Australia and Canada" || 
                    guest.attendingStatus === "Canada Only"
                )
                .map((guest, i) => ({
                    ...guest,
                    key: `${index}-${i}`
                }))
        )
        .sort((a, b) => {
            // Handle cases where lastName might be undefined
            const lastNameA = (a.lastName || '').toLowerCase();
            const lastNameB = (b.lastName || '').toLowerCase();

            if (lastNameA === lastNameB) {
                // If last names are same, sort by first name
                return (a.firstName || '').toLowerCase().localeCompare((b.firstName || '').toLowerCase());
            }
            return lastNameA.localeCompare(lastNameB);
        });

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