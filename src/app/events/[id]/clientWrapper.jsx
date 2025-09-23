"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Button from "@/components/common/Button";
import Accordion from "@/components/Accordion";
import Popup from "@/components/Popup";
import Form from "./Form";
import ImageViewer from "@/components/ImageViewer/ImageViewer";

const EventDetailPage = ({ eventDetails }) => {
  const router = useRouter();
  const [showMobileForm, setShowMobileForm] = useState(false);
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);
  const enquireOnly = false;

  const handleMobileBooking = () => {
    if (!enquireOnly) {
      router.push(`/events/${eventDetails.id}/booking`);
    } else {
      setShowMobileForm(true);
    }
  };

  console.log("Gallery Data clientWrapper :", eventDetails);

  return (
    <main className="min-h-screen">
      <ImageViewer
        images={
          eventDetails.gallery?.map((img) => ({
            image_url: img.image,
            image_name: `Event gallery image`,
          })) || []
        }
        isOpen={isImageViewerOpen}
        onClose={() => setIsImageViewerOpen(false)}
      />

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
        <div className="flex-1 overflow-y-auto p-4">
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
                {eventDetails.image ? (
                  <Image
                    src={eventDetails.image}
                    alt={eventDetails.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    priority
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <i className="fi fi-rr-image text-gray-400 text-4xl"></i>
                  </div>
                )}
              </div>

              {/* Event Details Sections */}
              <div>
                {/* About Section */}
                <div className="bg-white rounded-xl mb-14">
                  <h2 className="text-base font-medium text-gray-700 mb-4 tracking-tight">
                    About the Event
                  </h2>
                  <div className="text-gray-700 leading-relaxed text-sm">
                    <div
                      dangerouslySetInnerHTML={{
                        __html: eventDetails.description,
                      }}
                    />
                  </div>
                </div>

                {/* Gallery Section */}
                {eventDetails.gallery && eventDetails.gallery.length > 0 && (
                  <div className="bg-white rounded-xl mb-14">
                    <h2 className="text-base font-medium text-gray-700 mb-6 tracking-tight">
                      Event Gallery
                    </h2>
                    {/* Exact 2x4 Grid Layout - 8 identical square images */}
                    <div className="grid grid-cols-4 gap-3">
                      {eventDetails.gallery.slice(0, 8).map((image, index) => (
                        <div
                          key={index}
                          className="relative aspect-square rounded-lg overflow-hidden group cursor-pointer"
                          onClick={() => setIsImageViewerOpen(true)}
                        >
                          <Image
                            src={image.image}
                            alt={`Event gallery image ${index + 1}`}
                            fill
                            className="object-cover group-hover:scale-105 transition-all duration-300"
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
                          />
                          {/* Overlay on hover */}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              <i className="fi fi-rr-zoom-in text-white text-xl"></i>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Show all photos button if more than 8 images */}
                    {eventDetails.gallery.length > 8 && (
                      <div className="mt-4 text-center">
                        <button
                          onClick={() => setIsImageViewerOpen(true)}
                          className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
                        >
                          View All {eventDetails.gallery.length} Photos
                        </button>
                      </div>
                    )}
                  </div>
                )}

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
                {eventDetails.highlights.length > 0 && (
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
                )}

                {/* FAQ Section */}
                {eventDetails.faqs.length > 0 && (
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
                )}

                {/* Terms & Conditions Section */}
                {eventDetails.terms && (
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
                )}
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
