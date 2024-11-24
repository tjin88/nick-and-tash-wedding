import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import './Faq.css';

const FAQItem = ({ question, answer, isOpen, onClick, location }) => {
  return (
    <div className="faq-item">
      <button 
        className="faq-question" 
        onClick={onClick}
        aria-expanded={isOpen}
      >
        <span>{question}</span>
        {isOpen ? (
          <ChevronUp className="faq-icon" />
        ) : (
          <ChevronDown className="faq-icon" />
        )}
      </button>
      
      <div className={`faq-answer ${isOpen ? 'open' : ''}`}>
        <p>{answer}</p>
        {location && isOpen && (
          <div className="map-container">
            <iframe
              title="Wedding Venue Location"
              src={`https://www.google.com/maps/embed/v1/place?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}&q=${encodeURIComponent(location)}`}
              width="100%"
              height="300"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
            <a 
              href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(location)}`}
              className="directions-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              Get Directions →
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

const FAQ = ({ invitedLocation }) => {
  const [openItems, setOpenItems] = useState(new Set());

  const locations = {
    canada: {
      venue: "Sheraton Toronto Airport Hotel & Conference Centre",
      address: "801 Dixon Road, Toronto, ON",
      date: "August 23, 2025",
      time: "[Canadian Time]",
      fullAddress: "Sheraton Toronto Airport Hotel & Conference Centre, 801 Dixon Road, Toronto, ON"
    },
    australia: {
      venue: "Tiffany’s Maleny",
      address: "409 Mountain View Road, Maleny Qld 4552",
      date: "October 11, 2025",
      time: "[Australian Time]",
      fullAddress: "Tiffany’s Maleny, 409 Mountain View Road, Maleny Qld 4552"
    }
  };

  const generateFAQData = () => {
    const commonFAQs = [
      {
        question: "Can I bring a plus one?",
        answer: "Your invitation will specify if you have been given a plus one. Please refer to the RSVP page for the exact number of guests included in your party."
      },
      {
        question: "What is the dress code?",
        answer: "The dress code for our wedding is semi-formal. Men are encouraged to wear suits, and women can wear cocktail dresses or elegant attire."
      },
      {
        question: "Children",
        answer: "[Some answer]"
      },
      {
        question: "Wheel Chair Access",
        answer: "[Some answer]"
      },
      {
        question: "Transport",
        answer: "[Some answer]"
      },
      {
        question: "Accommodation",
        answer: "[Some answer]"
      },
      {
        question: "Parking",
        answer: "[Some answer]"
      },
      {
        question: "Photos",
        answer: "[Some answer]"
      },
    ];

    if (invitedLocation === 'Both Australia and Canada') {
      return [
        {
          question: "When and where is the Australian wedding?",
          answer: `Our Australian wedding ceremony will take place on: ${locations.australia.date} at ${locations.australia.venue}, ${locations.australia.address}. The ceremony will begin at ${locations.australia.time}.`,
          location: locations.australia.fullAddress
        },
        {
          question: "When and where is the Canadian wedding?",
          answer: `Our Canadian wedding ceremony will take place on: ${locations.canada.date} at ${locations.canada.venue}, ${locations.canada.address}. The ceremony will begin at ${locations.canada.time}.`,
          location: locations.canada.fullAddress
        },
        {
          question: "Do I need to attend both ceremonies?",
          answer: "No, you're welcome to attend either or both ceremonies. Please RSVP for the celebration(s) you plan to attend."
        },
        ...commonFAQs
      ];
    }

    const locationInfo = invitedLocation === 'Canada' ? locations.canada : locations.australia;
    return [
      {
        question: "When and where is the wedding?",
        answer: `Our wedding ceremony will take place on ${locationInfo.date} at ${locationInfo.venue}, located at ${locationInfo.address}. The ceremony will begin promptly at ${locationInfo.time}.`,
        location: locationInfo.fullAddress
      },
      {
        question: "Will there be parking available?",
        answer: invitedLocation === 'Canada' 
          ? "Yes, both self-parking and valet services are available at the Sheraton Toronto Airport Hotel."
          : "Yes, parking is available at the venue. [Additional Australian parking details]"
      },
      ...commonFAQs
    ];
  };

  const toggleItem = (id) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(id)) {
      newOpenItems.delete(id);
    } else {
      newOpenItems.add(id);
    }
    setOpenItems(newOpenItems);
  };

  return (
    <div className="faq-container">
      <h2 className="faq-header">Frequently Asked Questions</h2>
      <div className="faq-list">
        {generateFAQData().map((item, index) => (
          <FAQItem
            key={index}
            question={item.question}
            answer={item.answer}
            isOpen={openItems.has(index)}
            onClick={() => toggleItem(index)}
            location={item.location}
          />
        ))}
      </div>
    </div>
  );
};

export default FAQ;