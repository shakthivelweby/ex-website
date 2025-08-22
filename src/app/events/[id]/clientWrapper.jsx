"use client";

import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import Button from "@/components/common/Button";
import Accordion from "@/components/Accordion";
import Popup from "@/components/Popup";
import Form from "./Form";

const EventDetailPage = ({ eventDetails }) => {
  const { id } = useParams();
  const router = useRouter();
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
          behavior: "smooth",
        });

        // Scroll back up after another delay
        setTimeout(() => {
          container.scrollTo({
            top: 0,
            behavior: "smooth",
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
      document.body.style.position = "fixed";
      document.body.style.width = "100%";
      document.body.style.top = `-${scrollY}px`;
    } else {
      // Restore scroll position
      const scrollY = document.body.style.top;
      document.body.style.position = "";
      document.body.style.width = "";
      document.body.style.top = "";
      window.scrollTo(0, parseInt(scrollY || "0", 10) * -1);
    }

    // Cleanup function
    return () => {
      document.body.style.position = "";
      document.body.style.width = "";
      document.body.style.top = "";
    };
  }, [showMobileForm]);

  const handleMobileBooking = () => {
    if (!enquireOnly) {
      // Redirect to booking page instead of opening popup
      router.push(`/events/${id}/booking`);
    } else {
      setShowMobileForm(true);
    }
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
                  <h2 className="text-base font-medium text-gray-700 mb-4 tracking-tight">
                    About the Event
                  </h2>
                  <p className="text-gray-700 leading-relaxed text-sm">
                    <div
                      dangerouslySetInnerHTML={{
                        __html: eventDetails.description,
                      }}
                    />
                  </p>
                </div>

                {/* Event Guide */}
                <div className="bg-white rounded-xl mb-14">
                  <h2 className="text-base font-medium text-gray-700 mb-4 tracking-tight">
                    Event Guide
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-start gap-4 mb-4 md:mb-0">
                      <i className="fi fi-rr-clock text-xl text-primary-500"></i>
                      <div>
                        <p className="text-sm text-gray-500">Duration</p>
                        <p className="font-medium text-sm text-gray-700">
                          {eventDetails.eventGuide.duration}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <i className="fi fi-rr-ticket text-xl text-primary-500"></i>
                      <div>
                        <p className="text-sm text-gray-500">
                          Tickets Needed For
                        </p>
                        <p className="font-medium text-sm text-gray-700">
                          {eventDetails.eventGuide.ticketsNeeded}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <i className="fi fi-rr-users-alt text-xl text-primary-500"></i>
                      <div>
                        <p className="text-sm text-gray-500">
                          Entry Allowed For
                        </p>
                        <p className="font-medium text-sm text-gray-700">
                          {eventDetails.eventGuide.entryAllowed}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <i className="fi fi-rr-comments text-xl text-primary-500"></i>
                      <div>
                        <p className="text-sm text-gray-500">Language</p>
                        <p className="font-medium text-sm text-gray-700">
                          {eventDetails.eventGuide.language}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <i className="fi fi-rr-map text-xl text-primary-500"></i>
                      <div>
                        <p className="text-sm text-gray-500">Layout</p>
                        <p className="font-medium text-sm text-gray-700">
                          {eventDetails.eventGuide.layout}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <i className="fi fi-rr-chair text-xl text-primary-500"></i>
                      <div>
                        <p className="text-sm text-gray-500">Seating</p>
                        <p className="font-medium text-sm text-gray-700">
                          {eventDetails.eventGuide.seatingArrangement}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <i className="fi fi-rr-baby text-xl text-primary-500"></i>
                      <div>
                        <p className="text-sm text-gray-500">Kids Friendly</p>
                        <p className="font-medium text-sm text-gray-700">
                          {eventDetails.eventGuide.kidsFriendly}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <i className="fi fi-rr-paw text-xl text-primary-500"></i>
                      <div>
                        <p className="text-sm text-gray-500">Pets Friendly</p>
                        <p className="font-medium text-sm text-gray-700">
                          {eventDetails.eventGuide.petsFriendly}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Highlights */}
                <div className="bg-white rounded-xl mb-14">
                  <h2 className="text-base font-medium text-gray-700 mb-4 tracking-tight">
                    Highlights
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {eventDetails.highlights.map((highlight, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <i className="fi fi-rr-check text-sm text-primary-600"></i>
                        <span className="text-gray-600 text-sm">
                          {highlight}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* FAQ Section */}
                <div className="bg-white rounded-xl mb-14">
                  <h2 className="text-base font-medium text-gray-700 mb-4 tracking-tight">
                    Frequently Asked Questions
                  </h2>
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
                  <h2 className="text-base font-medium text-gray-700 mb-4 tracking-tight">
                    Terms & Conditions
                  </h2>
                  <Accordion
                    title="Event Terms & Conditions"
                    defaultOpen={true}
                  >
                    <div className="space-y-3">
                      <div
                        className="text-gray-600 text-sm"
                        dangerouslySetInnerHTML={{
                          __html: eventDetails.terms,
                        }}
                      />
                    </div>
                  </Accordion>
                </div>
              </div>
            </div>

            {/* Desktop Right Column - Event Details */}
            <div className="w-full lg:w-1/3 hidden lg:block">
              <div className="lg:sticky lg:top-20">
                <Form eventDetails={eventDetails} enquireOnly={enquireOnly} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Mobile Booking Button */}
      <div className="fixed bottom-16 left-4 right-4 lg:hidden z-40">
        <button
          onClick={handleMobileBooking}
          className="w-full bg-primary-500 text-white py-3 px-6 rounded-full font-medium flex items-center justify-between shadow-lg"
        >
          <div className="flex items-center">
            <span className="text-sm">
              {enquireOnly ? "Send Enquiry" : "Book Now"}
            </span>
          </div>
          <div className="flex items-center">
            <span className="text-sm font-bold">{eventDetails.price}</span>
            <i className="fi fi-rr-ticket ml-2 text-sm"></i>
          </div>
        </button>
      </div>
    </main>
  );
};

export default EventDetailPage;
