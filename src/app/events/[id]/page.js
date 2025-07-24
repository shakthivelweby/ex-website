'use client';

import Image from 'next/image';
import { useParams } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import Button from '@/components/common/Button';
import Accordion from '@/components/Accordion';
import Popup from '@/components/Popup';
import Form from './Form';

const EventDetailPage = () => {
  const { id } = useParams();
  const [showMobileForm, setShowMobileForm] = useState(false);
  const enquireOnly = false;
  const scrollContainerRef = useRef(null);

  // Handle scroll animation when popup opens
  useEffect(() => {
    if (showMobileForm && scrollContainerRef.current) {
      const container = scrollContainerRef.current;

      // Initial scroll down after a short delay
      const timeoutId = setTimeout(() => {
        container.scrollTo({
          top: 300,
          behavior: 'smooth'
        });

        // Scroll back up after another delay
        setTimeout(() => {
          container.scrollTo({
            top: 0,
            behavior: 'smooth'
          });
        }, 600);
      }, 500);

      return () => clearTimeout(timeoutId);
    }
  }, [showMobileForm]);

  // Handle body scroll lock
  useEffect(() => {
    if (showMobileForm) {
      // Save current scroll position and add styles
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.top = `-${scrollY}px`;
    } else {
      // Restore scroll position
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.top = '';
      window.scrollTo(0, parseInt(scrollY || '0', 10) * -1);
    }

    // Cleanup function
    return () => {
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.top = '';
    };
  }, [showMobileForm]);

  // Mock data for design purposes
  const eventDetails = {
    id: 1,
    title: 'Enrique Iglesias Live in Concert',
    subtitle: 'Global Indoor Theme Park',
    tagline: '100+ REAL LIFE ROLE-PLAY PROFESSIONS',
    categories: ['Music Shows', 'Concerts'],
    date: '23 Jul - 31 Jul',
    time: '10:00 PM onwards',
    venue: 'MMRDA Grounds',
    venueAddress: '3V98+PQC, Bandra Kurla Complex Rd, G Block BKC, MMRDA Area, Kalina, Bandra East, Mumbai, Maharashtra 400051, India',
    price: '₹ 6,500',
    image: '/images/events/event-details/card.jpg',
    offer: 'Get 50% off up to ₹500',
    description: `Enrique Iglesias is a Spanish singer-songwriter and producer who has been active in the music industry for over three decades. He is known for his romantic ballads and pop songs, which have been popular worldwide. Iglesias has sold over 200 million records worldwide, making him one of the best-selling music artists of all time. He has won numerous awards, including multiple Grammy Awards and Billboard Music Awards. Iglesias is also known for his philanthropic work, including supporting various charities and organizations.With over 180 million records sold, 40 billion streams, and an unmatched legacy of 154 #1 hits, Enrique continues to reign as one of the most influential artists in modern music. Known for unforgettable anthems like Hero, Bailamos, and Tonight, his music has transcended borders, generations, and genres.
    Having performed for over 15 million fans worldwide, Enrique is all set to ignite Mumbai with an experience packed with iconic moments, powerful vocals, and magnetic stage presence.
    The legend is back after 13 years and you sure don't wanna miss it!
    This night will be epic!
    If you are an international customer, please email events@district.in to book tickets, as wristband delivery outside India is unavailable.`,
    eventGuide: {
      duration: '3 Hours',
      ticketsNeeded: '5 yrs & above',
      entryAllowed: '5 yrs & above',
      language: 'English',
      genres: 'Pop, Rock, Latin'
    },
    highlights: [
      'Interactive role-playing activities',
      'Safe and supervised environment',
      'Educational and fun experience',
      'Professional staff and mentors',
      'State-of-the-art facilities',
      'Real-life work environments'
    ],
    faqs: [
      {
        question: 'What time should I arrive at the venue?',
        answer: 'We recommend arriving at least 45 minutes before the show time to allow time for security checks and finding your seats.'
      },
      {
        question: 'Is there a dress code?',
        answer: 'There is no strict dress code, but we recommend smart casual attire. Please wear comfortable shoes as you may be standing or dancing.'
      },
      {
        question: 'Are cameras allowed?',
        answer: 'Professional cameras and recording equipment are not permitted. Mobile phones can be used for personal photos without flash.'
      },
      {
        question: 'What items are prohibited?',
        answer: 'Prohibited items include outside food and beverages, professional cameras, weapons, and illegal substances. A full list will be sent with your tickets.'
      }
    ],
    terms: [
      'Tickets once purchased cannot be exchanged or refunded.',
      'Entry will be denied to anyone appearing to be under the influence of alcohol or drugs.',
      'The organizer reserves the right to change the lineup without prior notice.',
      'Photography is allowed for personal use only. Professional photography equipment is not permitted.',
      'By purchasing a ticket, you agree to follow all venue and event rules.',
      'The organizer is not responsible for any lost or stolen items during the event.'
    ]
  };

  return (
    <main className="min-h-screen">
      {/* Mobile Form Popup */}
      <Popup
        isOpen={showMobileForm}
        onClose={() => setShowMobileForm(false)}
        title="Book Your Event"
        pos="bottom"
        draggable={true}
        className="lg:hidden w-full rounded-t-3xl"
        pannelStyle="h-[75vh]"
      >
        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-4">
          <Form 
            eventDetails={eventDetails}
            isMobilePopup={true}
            enquireOnly={enquireOnly}
          />
        </div>
      </Popup>

      {/* Hero Section */}
      <div className="w-full bg-white">
        <div className="max-w-7xl mx-auto px-4 py-6 mt-10">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Column - Content */}
            <div className="w-full lg:w-2/3 space-y-8">
              {/* Image */}
              <div className="relative aspect-[4/3] w-full h-[500px] rounded-xl overflow-hidden">
                <Image
                  src={eventDetails.image}
                  alt={eventDetails.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  priority
                />
              </div>

              {/* Event Details Sections */}
              <div>
                {/* About Section */}
                <div className="bg-white rounded-xl mb-14">
                  <h2 className="text-base font-medium text-gray-700 mb-4 tracking-tight">About the Event</h2>
                  <p className="text-gray-700 leading-relaxed text-sm">{eventDetails.description}</p>
                </div>

                {/* Event Guide */}
                <div className="bg-white rounded-xl mb-14">
                  <h2 className="text-base font-medium text-gray-700 mb-4 tracking-tight">Event Guide</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-start gap-4 mb-4 md:mb-0">
                      <i className="fi fi-rr-clock text-xl text-primary-500"></i>
                      <div>
                        <p className="text-sm text-gray-500">Duration</p>
                        <p className="font-medium text-sm text-gray-700">{eventDetails.eventGuide.duration}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                        <i className="fi fi-rr-ticket text-xl text-primary-500"></i>
                      <div>
                        <p className="text-sm text-gray-500">Tickets Needed For</p>
                        <p className="font-medium text-sm text-gray-700">{eventDetails.eventGuide.ticketsNeeded}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                        <i className="fi fi-rr-users-alt text-xl text-primary-500"></i>
                      <div>
                        <p className="text-sm text-gray-500">Entry Allowed For</p>
                        <p className="font-medium text-sm text-gray-700">{eventDetails.eventGuide.entryAllowed}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                        <i className="fi fi-rr-comments text-xl text-primary-500"></i>
                      <div>
                        <p className="text-sm text-gray-500">Language</p>
                        <p className="font-medium text-sm text-gray-700">{eventDetails.eventGuide.language}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                        <i className="fi fi-rr-theater-masks text-xl text-primary-500"></i>
                      <div>
                        <p className="text-sm text-gray-500">Genres</p>
                        <p className="font-medium text-sm text-gray-700">{eventDetails.eventGuide.genres}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Highlights */}
                <div className="bg-white rounded-xl mb-14">
                  <h2 className="text-base font-medium text-gray-700 mb-4 tracking-tight">Highlights</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {eventDetails.highlights.map((highlight, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <i className="fi fi-rr-check text-sm text-primary-600"></i>
                        <span className="text-gray-600 text-sm">{highlight}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* FAQ Section */}
                <div className="bg-white rounded-xl mb-14">
                  <h2 className="text-base font-medium text-gray-700 mb-4 tracking-tight">Frequently Asked Questions</h2>
                  <div className="space-y-2">
                    {eventDetails.faqs.map((faq, index) => (
                      <Accordion 
                        key={index} 
                        title={faq.question}
                        defaultOpen={index === 0}
                      >
                        <p className="text-gray-600 text-sm">{faq.answer}</p>
                      </Accordion>
                    ))}
                  </div>
                </div>

                {/* Terms & Conditions Section */}
                <div className="bg-white rounded-xl mb-14">
                  <h2 className="text-base font-medium text-gray-700 mb-4 tracking-tight">Terms & Conditions</h2>
                  <Accordion 
                    title="Event Terms & Conditions" 
                    defaultOpen={true}
                  >
                    <div className="space-y-3">
                      {eventDetails.terms.map((term, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <i className="fi fi-rr-info text-sm text-primary-600 mt-0.5"></i>
                          <p className="text-gray-600 text-sm">{term}</p>
                        </div>
                      ))}
                    </div>
                  </Accordion>
                </div>
              </div>
            </div>

            {/* Desktop Right Column - Event Details */}
            <div className="w-full lg:w-1/3 hidden lg:block">
              <div className="lg:sticky lg:top-20">
                <Form 
                  eventDetails={eventDetails}
                  enquireOnly={enquireOnly}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Mobile Booking Button */}
      <div className="fixed bottom-16 left-4 right-4 lg:hidden z-40">
        <button
          onClick={() => setShowMobileForm(true)}
          className="w-full bg-primary-500 text-white py-3 px-6 rounded-full font-medium flex items-center justify-between shadow-lg"
        >
          <div className="flex items-center">
            <span className="text-sm">{enquireOnly ? 'Send Enquiry' : 'Book Now'}</span>
          </div>
          <div className="flex items-center">
            <span className="text-sm font-bold">{eventDetails.price}</span>
            <i className={`${enquireOnly ? 'fi fi-rr-envelope' : ''} ml-2 text-sm`}></i>
          </div>
        </button>
      </div>

    </main>
  );
};

export default EventDetailPage; 