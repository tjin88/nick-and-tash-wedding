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
        <div dangerouslySetInnerHTML={{ __html: answer }} />
        {location && isOpen && (
          <div className="map-container">
            <iframe
              title="Wedding Venue Location"
              src={`https://www.google.com/maps/embed/v1/place?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}&q=${encodeURIComponent(location)}`}
              width="100%"
              height="300"
              style={{ border: 0, display: 'block' }}
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

const FAQ = ({ invitedLocation, locations }) => {
  const [openItems, setOpenItems] = useState(new Set());

  const generateFAQData = () => {
    const canadaFAQs = [
      {
        question: "Is there a group rate for the Sheraton Parkway Toronto North Hotel & Suites?",
        answer: "YES :) Our event has a special group rate at the Sheraton Parkway Toronto North Hotel & Suites (at Hwy 7 and Leslie Street) for $209 CAD per night.<br /><br />Room type: Run of the House. Meaning guests will receive a room with either 1 King with sofa bed or 2 Queens. Room types will be assigned at the discretion of the Hotel approximately 1 week prior to arrival. Hotel reserves the right to reassign rooms prior to attendee check-in.<br /><br />If interested, please use this link to make your reservation: <a href='https://www.marriott.com/event-reservations/reservation-link.mi?id=1721334039054&key=GRP&app=resvlink' target=”_blank”>Book your group rate for Natasha & Nicholas Wedding Reception</a><br /><br />FYI: The wedding party, including parents will be staying at the Sheraton:<br />Checking-in: Friday, August 22, 2025<br />Checking-out: Sunday, August 24, 2025<br /><br />Please note that the last day to book at this group rate is Wednesday, July 23, 2025"
      },
      {
        question: "Will there be a ceremony followed by the reception?",
        answer: "Nick and Tash will be married in a private civil service on Friday, August 22, 2025.<br /><br />We hope you can join us in Toronto for this wedding reception (supper, speeches and dancing) so that we can begin our lives together surrounded by all those who we love."
      },
      {
        question: "I would like to bring a “plus one”. How do I RSVP for my “plus one”?",
        answer: "Please email Susie Jin. Invitations are intended for family and friends of Nick and Natasha, including spouses and established partners of family and friends. If we missed your significant other, please email 2tennisbums@gmail.com to let us know you have a plus one that we missed 😳"
      },
      {
        question: "Will there be parking available?",
        answer: "Yes, there will be plenty of parking available. Parking will be free for all guests attending the wedding reception."
      },
      {
        question: "What is the dress code?",
        answer: "The dress code for our wedding is semi-formal. Elegant attire such as suits or cocktail dresses are suggested. The entire Canadian wedding reception is expected to take place indoors of the Sheraton ballroom. Thus, inclement weather should not be an issue."
      },
      {
        question: "Can I bring my kids?",
        answer: "Kids are welcome. Some kids are fine with the regular 10-course meal with dessert. However, please let us know if we could be helpful by making arrangements for anything like a booster chair (or high-chair) or a kids meal. Please email 2tennisbums@gmail.com with any questions."
      },
      {
        question: "What if I have a dietary requirement?",
        answer: "The menu is a traditional 10-course with dessert Chinese wedding reception meal. Please take a look at the “menu” tab. If you have any dietary requirements, please make a note when you RSVP so that we are able to accommodate for you."
      },
      {
        question: "Wheelchair and accessibility access",
        answer: "The hotel is equipped for accessibility. If you choose to let us know (via email to 2tennisbums@gmail.com), we will do what we can to make your night with us as comfortable and enjoyable as possible."
      },
      {
        question: "Do you have a gift registry?",
        answer: "Hugs are THE BEST present !! However, if you really feel it necessary to give beyond a hug, a small gift can be sent via e-transfer to nnjin22@gmail.com. We will also have a decorated box at the reception to collect cards and well wishes."
      },
      {
        question: "Where can I find the photos afterward?",
        answer: "Photos taken by the professional photographer will be available on this website shortly after the celebration"
      },
      {
        question: "Who should I contact if I have questions about the wedding?",
        answer: "Please reach out to Susie Jin: 2tennisbums@gmail.com."
      },
    ];

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
    ];

    if (invitedLocation === 'Both Australia and Canada' || invitedLocation === 'Canada') {
      return canadaFAQs;
      // return [
      //   {
      //     question: "When and where is the Australian wedding?",
      //     answer: `Our Australian wedding ceremony will take place on: ${locations.australia.date} at ${locations.australia.venue}, ${locations.australia.address}. The ceremony will begin at ${locations.australia.time}.`,
      //     location: locations.australia.fullAddress
      //   },
      //   {
      //     question: "When and where is the Canadian wedding?",
      //     answer: `Our Canadian wedding ceremony will take place on: ${locations.canada.date} at ${locations.canada.venue}, ${locations.canada.address}. The ceremony will begin at ${locations.canada.time}.`,
      //     location: locations.canada.fullAddress
      //   },
      //   {
      //     question: "Do I need to attend both ceremonies?",
      //     answer: "No, you're welcome to attend either or both ceremonies. Please RSVP for the celebration(s) you plan to attend."
      //   },
      //   {
      //     question: "Photos",
      //     answer: "[Some answer]"
      //   },
      //   ...commonFAQs
      // ];
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
      invitedLocation === 'Canada' 
        ? {}
        : {
            question: "Photos",
            answer: "[Some answer]"
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
    <div className='faq-wrapper'>
      <div className="faq-container">
        <h2 className="title">Frequently Asked Questions</h2>
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
    </div>
  );
};

export default FAQ;