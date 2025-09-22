"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Form from "./Form";
import TicketSelectionPopup from "./TicketSelectionPopup";
import Button from "@/components/common/Button";
import Accordion from "@/components/Accordion";
import ImageViewer from "@/components/ImageViewer/ImageViewer";
import ShareOptions from "@/components/ShareOptions/ShareOptions";

const AttractionDetailClient = ({ attractionDetails }) => {
  const router = useRouter();
  const [selectedTickets, setSelectedTickets] = useState({});
  const [totalPrice, setTotalPrice] = useState(0);
  const [isTicketPopupOpen, setIsTicketPopupOpen] = useState(false);
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleTicketSelection = (tickets, price) => {
    setSelectedTickets(tickets);
    setTotalPrice(price);
    setIsTicketPopupOpen(false);
  };

  const openImageViewer = (index) => {
    setSelectedImageIndex(index);
    setIsImageViewerOpen(true);
  };

  const handleBackClick = () => {
    router.back();
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: attractionDetails.title,
        text: attractionDetails.description,
        url: window.location.href,
      });
    } else {
      // Fallback to copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  const formatRating = (rating) => {
    return rating ? rating.toFixed(1) : "N/A";
  };

  const handleMobileBooking = () => {
    router.push(`/attractions/${attractionDetails.id}/booking`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="mt-5 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <button
                onClick={handleBackClick}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <i className="fi fi-rr-arrow-left text-base text-gray-800"></i>
              </button>
              <h1 className="text-base font-medium text-gray-800 truncate">
                back 
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleShare}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <i className="fi fi-rr-share text-xl text-gray-600"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero Image */}
            <div className="relative">
              <div className="aspect-video rounded-2xl overflow-hidden bg-gray-200">
                <Image
                  src={attractionDetails.image}
                  alt={attractionDetails.title}
                  width={800}
                  height={450}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute top-4 right-4 hidden">
                <button
                  onClick={handleShare}
                  className="p-3 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-colors"
                >
                  <i className="fi fi-rr-share text-xl text-gray-700"></i>
                </button>
              </div>
            </div>

          
            {/* Description */}
            <div className="space-y-4">
              <h2 className="text-base font-medium text-gray-700 mb-4 tracking-tight">About</h2>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 leading-relaxed text-sm">
                  {attractionDetails.description}
                </p>
              </div>
            </div>

              {/* Gallery */}
              {attractionDetails.gallery && attractionDetails.gallery.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-base font-medium text-gray-700 mb-4 tracking-tight">Gallery</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {attractionDetails.gallery.slice(0, 6).map((image, index) => (
                    <div
                      key={index}
                      className="aspect-square rounded-lg overflow-hidden bg-gray-200 cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => openImageViewer(index)}
                    >
                      <Image
                        src={image.image_url || image}
                        alt={image.alt_text || `Gallery image ${index + 1}`}
                        width={300}
                        height={300}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
                {attractionDetails.gallery.length > 6 && (
                  <button
                    onClick={() => openImageViewer(0)}
                    className="w-full py-3 text-primary-600 font-medium hover:text-primary-700 transition-colors"
                  >
                    View All {attractionDetails.gallery.length} Photos
                  </button>
                )}
              </div>
            )}


            {/* Attraction Guide */}
            <div className="space-y-4">
              <h2 className="text-base font-medium text-gray-700 mb-4 tracking-tight">Attraction Guide</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center">
                      <i className="fi fi-rr-clock text-lg text-primary-500"></i>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Duration</p>
                      <p className="font-medium text-gray-900">{attractionDetails.attractionGuide.duration}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center">
                      <i className="fi fi-rr-sun text-lg text-primary-500"></i>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Best Time to Visit</p>
                      <p className="font-medium text-gray-900">{attractionDetails.attractionGuide.bestTimeToVisit}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-200 hidden">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center">
                      <i className="fi fi-rr-star text-lg text-primary-500"></i>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Rating</p>
                      <p className="font-medium text-gray-900">
                        {formatRating(attractionDetails.attractionGuide.rating)} 
                        ({attractionDetails.attractionGuide.reviewCount} reviews)
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Features */}
            {attractionDetails.attractionGuide.features && attractionDetails.attractionGuide.features.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-base font-medium text-gray-700 mb-4 tracking-tight">Features</h2>
                <div className="flex flex-wrap gap-2">
                  {attractionDetails.attractionGuide.features.map((feature, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-50 text-primary-700"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Location */}
            <div className="space-y-4">
              <h2 className="text-base font-medium text-gray-700 mb-4 tracking-tight">Location</h2>
              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <div className="flex flex-col space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center flex-shrink-0">
                      <i className="fi fi-rr-marker text-lg text-primary-500"></i>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-500 mb-1">Address</p>
                      <p className="text-gray-700 font-medium leading-relaxed">
                        {attractionDetails.address || attractionDetails.location || 'Address not available'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {/* <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center flex-shrink-0">
                      <i className="fi fi-rr-navigation text-lg text-primary-500"></i>
                    </div> */}
                    <div className="flex-1">
                      <button
                        onClick={() => {
                          if (attractionDetails.mapLink) {
                            window.open(attractionDetails.mapLink, "_blank");
                          } else {
                            const address = encodeURIComponent(
                              attractionDetails.address || attractionDetails.location || ''
                            );
                            window.open(
                              `https://www.google.com/maps/search/?api=1&query=${address}`,
                              "_blank"
                            );
                          }
                        }}
                        className="inline-flex items-center gap-2 bg-primary-50 border border-primary-200 rounded-full px-2 py-1 text-primary-600 hover:text-primary-700 font-medium text-sm transition-colors cursor-pointer"
                      >
                      
                        Get Directions
                        <i className="fi fi-rr-arrow-right text-xs"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* FAQs */}
            {attractionDetails.faqs && attractionDetails.faqs.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-base font-medium text-gray-700 mb-4 tracking-tight">Frequently Asked Questions</h2>
                <Accordion items={attractionDetails.faqs} />
              </div>
            )}

            {/* Terms and Conditions */}
            {attractionDetails.terms && (
              <div className="space-y-4">
                <h2 className="text-base font-medium text-gray-700 mb-4 tracking-tight">Terms & Conditions</h2>
                <Accordion items={[{
                  question: "Attraction Terms & Conditions",
                  answer: attractionDetails.terms
                }]} />
              </div>
            )}
          </div>

          {/* Sidebar - Booking Form */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <Form
                attractionDetails={attractionDetails}
                selectedTickets={selectedTickets}
                totalPrice={totalPrice}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Ticket Selection Popup */}
      <TicketSelectionPopup
        isOpen={isTicketPopupOpen}
        onClose={() => setIsTicketPopupOpen(false)}
        attractionId={attractionDetails.id}
        onContinue={handleTicketSelection}
      />

      {/* Image Viewer */}
      {attractionDetails.gallery && attractionDetails.gallery.length > 0 && (
        <ImageViewer
          isOpen={isImageViewerOpen}
          onClose={() => setIsImageViewerOpen(false)}
          images={attractionDetails.gallery.map(img => ({
            src: img.image_url || img,
            alt: img.alt_text || attractionDetails.title
          }))}
          initialIndex={selectedImageIndex}
        />
      )}

      {/* Fixed Mobile Booking Button */}
      <div className="fixed bottom-16 left-4 right-4 lg:hidden z-40">
        <button
          onClick={handleMobileBooking}
          className="w-full bg-primary-500 text-white py-3 px-6 rounded-full font-medium flex items-center justify-between shadow-lg"
        >
          <div className="flex items-center">
            <span className="text-sm">Book Now</span>
          </div>
          <div className="flex items-center">
            <span className="text-sm font-bold">{attractionDetails.price}</span>
            <i className="fi fi-rr-ticket ml-2 text-sm"></i>
          </div>
        </button>
      </div>
    </div>
  );
};

export default AttractionDetailClient;
