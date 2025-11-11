"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Button from "@/components/common/Button";
import Accordion from "@/components/Accordion";
import Popup from "@/components/Popup";
import Form from "./Form";
import ImageViewer from "@/components/ImageViewer/ImageViewer";

const ActivityDetailPage = ({ activityDetails }) => {
  const router = useRouter();
  const [showMobileForm, setShowMobileForm] = useState(false);
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);
  const [expandedTicketType, setExpandedTicketType] = useState(null);
  const [showMoreFeatures, setShowMoreFeatures] = useState({});
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showTicketDetailsPopup, setShowTicketDetailsPopup] = useState(false);
  const [selectedTicketForDetails, setSelectedTicketForDetails] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const enquireOnly = false;

  // Combine main image with gallery images
  const allImages = activityDetails.gallery && activityDetails.gallery.length > 0
    ? [{ image: activityDetails.image }, ...activityDetails.gallery]
    : [{ image: activityDetails.image }];

  const currentImage = allImages[selectedImageIndex]?.image || activityDetails.image;

  // Dummy content functions
  const getDummyBriefDetails = (ticket) => {
    const briefDetails = {
      "Standard Rafting Package": `<p>Our standard rafting package is perfect for first-time rafters and adventure enthusiasts. This comprehensive package includes all essential safety equipment, professional guidance, and basic refreshments to ensure a safe and enjoyable experience.</p>
        <p>You'll navigate through exciting rapids while our certified guides ensure your safety throughout the journey. The package is designed to provide maximum fun with complete safety measures in place.</p>`,
      "Premium Rafting Package": `<p>Upgrade to our premium package for an extended and enhanced rafting adventure. This package includes everything from the standard package plus GoPro video recording, premium refreshments, extended duration, and lunch.</p>
        <p>Perfect for those seeking the ultimate rafting experience with professional documentation and premium amenities.</p>`,
      "Group Rafting Package": `<p>Ideal for groups of 6 or more people, this package offers special group rates and dedicated services. Enjoy team-building activities, group photography, and flexible timing options.</p>
        <p>Great for corporate outings, family gatherings, or friend groups looking for an adventurous group activity.</p>`,
      "Tandem Paragliding Flight": `<p>Experience the thrill of flying with our certified tandem pilot. This package includes all safety equipment, video recording, and a certificate of your flight experience.</p>
        <p>No prior experience needed - our expert pilot handles all technical aspects while you enjoy the breathtaking views.</p>`,
      "Extended Flight Package": `<p>For the ultimate paragliding experience, choose our extended flight package. Enjoy longer flight duration, professional video editing, and premium GoPro footage.</p>
        <p>Priority takeoff and refreshments are included to make your experience even more special.</p>`,
      "Discover Scuba Diving": `<p>Perfect for first-time divers! Our PADI certified instructors will guide you through a safe and memorable underwater experience with all equipment provided.</p>
        <p>No certification required - this is a discovery program designed to introduce you to the amazing world beneath the waves.</p>`,
      "Advanced Scuba Diving": `<p>For certified divers seeking more adventure. Explore deeper dive sites with extended dive times and multiple locations throughout the day.</p>
        <p>Professional video documentation and lunch are included in this comprehensive package.</p>`,
      "Snorkeling Package": `<p>Perfect for those who want to explore the underwater world without scuba certification. Includes all snorkeling equipment and expert guidance.</p>
        <p>Visit multiple snorkel sites and enjoy underwater photography of your experience.</p>`
    };
    return briefDetails[ticket.type || ticket.name] || `<p>This package offers an amazing experience with professional guidance and all necessary equipment. Perfect for adventure enthusiasts looking for a memorable activity.</p>`;
  };

  const getDummyInclusion = (ticket) => {
    const inclusions = {
      "Standard Rafting Package": [
        "All safety equipment (helmet, life jacket, paddle)",
        "Certified professional guide",
        "Safety briefing and instruction",
        "Basic refreshments after activity",
        "Certificate of completion",
        "Insurance coverage",
        "Photography service"
      ],
      "Premium Rafting Package": [
        "All standard inclusions",
        "GoPro video recording",
        "Premium refreshments",
        "Extended duration (4-5 hours)",
        "Lunch included",
        "Priority booking",
        "Professional video editing"
      ],
      "Group Rafting Package": [
        "All standard inclusions",
        "Group discount (10% off)",
        "Dedicated group guide",
        "Group photography",
        "Team building activities",
        "Flexible timing options"
      ],
      "Tandem Paragliding Flight": [
        "Certified tandem pilot",
        "All safety gear included",
        "Video recording",
        "GoPro footage",
        "Certificate of flight",
        "Insurance coverage"
      ],
      "Extended Flight Package": [
        "All standard inclusions",
        "Extended flight duration (20+ minutes)",
        "Professional video editing",
        "Premium GoPro footage",
        "Priority takeoff",
        "Refreshments included"
      ],
      "Discover Scuba Diving": [
        "PADI certified instructor",
        "All equipment provided (BCD, regulator, mask, fins, wetsuit)",
        "Underwater photography",
        "Safety briefing",
        "Certificate of experience",
        "Insurance coverage"
      ],
      "Advanced Scuba Diving": [
        "All beginner inclusions",
        "Deeper dive sites access",
        "Extended dive time",
        "Multiple dive locations",
        "Professional video",
        "Lunch included"
      ],
      "Snorkeling Package": [
        "Snorkeling equipment (mask, fins, snorkel)",
        "Expert guide",
        "Multiple snorkel sites",
        "Underwater photography",
        "Refreshments",
        "No certification required"
      ]
    };
    return inclusions[ticket.type || ticket.name] || [
      "Professional guide",
      "Safety equipment",
      "Basic refreshments",
      "Certificate of participation"
    ];
  };

  const getDummyExclusion = (ticket) => {
    const exclusions = {
      "Standard Rafting Package": [
        "Transportation to/from activity location",
        "Personal expenses",
        "Meals (except refreshments)",
        "Video recording (available as add-on)",
        "Alcoholic beverages"
      ],
      "Premium Rafting Package": [
        "Transportation to/from activity location",
        "Personal expenses",
        "Alcoholic beverages"
      ],
      "Group Rafting Package": [
        "Transportation to/from activity location",
        "Personal expenses",
        "Meals (except refreshments)",
        "Alcoholic beverages"
      ],
      "Tandem Paragliding Flight": [
        "Transportation to/from takeoff point",
        "Personal expenses",
        "Meals",
        "Additional video editing"
      ],
      "Extended Flight Package": [
        "Transportation to/from takeoff point",
        "Personal expenses",
        "Meals (except refreshments)"
      ],
      "Discover Scuba Diving": [
        "Transportation to/from dive site",
        "Personal expenses",
        "Meals",
        "Additional dive sessions"
      ],
      "Advanced Scuba Diving": [
        "Transportation to/from dive sites",
        "Personal expenses",
        "Dive certification (must be certified)"
      ],
      "Snorkeling Package": [
        "Transportation to/from snorkel sites",
        "Personal expenses",
        "Meals",
        "Additional snorkel sessions"
      ]
    };
    return exclusions[ticket.type || ticket.name] || [
      "Transportation",
      "Personal expenses",
      "Meals",
      "Additional services"
    ];
  };

  const getDummyItinerary = (ticket) => {
    const itineraries = {
      "Standard Rafting Package": `<div class="space-y-4">
        <div class="flex gap-4">
          <div class="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
            <span class="text-primary-600 font-semibold text-sm">1</span>
          </div>
          <div>
            <h4 class="font-semibold text-gray-800 mb-1">Arrival & Registration (9:00 AM)</h4>
            <p class="text-sm text-gray-600">Arrive at the rafting base camp, complete registration, and receive your safety equipment.</p>
          </div>
        </div>
        <div class="flex gap-4">
          <div class="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
            <span class="text-primary-600 font-semibold text-sm">2</span>
          </div>
          <div>
            <h4 class="font-semibold text-gray-800 mb-1">Safety Briefing (9:30 AM)</h4>
            <p class="text-sm text-gray-600">Comprehensive safety briefing covering paddling techniques, safety protocols, and emergency procedures.</p>
          </div>
        </div>
        <div class="flex gap-4">
          <div class="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
            <span class="text-primary-600 font-semibold text-sm">3</span>
          </div>
          <div>
            <h4 class="font-semibold text-gray-800 mb-1">Rafting Adventure (10:00 AM - 12:00 PM)</h4>
            <p class="text-sm text-gray-600">Navigate through Grade III and IV rapids, enjoy scenic stretches, and experience the thrill of white water rafting.</p>
          </div>
        </div>
        <div class="flex gap-4">
          <div class="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
            <span class="text-primary-600 font-semibold text-sm">4</span>
          </div>
          <div>
            <h4 class="font-semibold text-gray-800 mb-1">Refreshments & Certificate (12:30 PM)</h4>
            <p class="text-sm text-gray-600">Enjoy refreshments, receive your certificate of completion, and view photos from your adventure.</p>
          </div>
        </div>
      </div>`,
      "Tandem Paragliding Flight": `<div class="space-y-4">
        <div class="flex gap-4">
          <div class="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
            <span class="text-primary-600 font-semibold text-sm">1</span>
          </div>
          <div>
            <h4 class="font-semibold text-gray-800 mb-1">Arrival & Briefing (7:00 AM)</h4>
            <p class="text-sm text-gray-600">Arrive at the takeoff point, meet your pilot, and receive safety briefing and equipment.</p>
          </div>
        </div>
        <div class="flex gap-4">
          <div class="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
            <span class="text-primary-600 font-semibold text-sm">2</span>
          </div>
          <div>
            <h4 class="font-semibold text-gray-800 mb-1">Takeoff & Flight (7:30 AM)</h4>
            <p class="text-sm text-gray-600">Take off from the launch site and enjoy a 15-20 minute flight with panoramic views of the mountains.</p>
          </div>
        </div>
        <div class="flex gap-4">
          <div class="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
            <span class="text-primary-600 font-semibold text-sm">3</span>
          </div>
          <div>
            <h4 class="font-semibold text-gray-800 mb-1">Landing & Video Review (8:00 AM)</h4>
            <p class="text-sm text-gray-600">Land safely, review your flight video, receive certificate, and collect GoPro footage.</p>
          </div>
        </div>
      </div>`,
      "Discover Scuba Diving": `<div class="space-y-4">
        <div class="flex gap-4">
          <div class="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
            <span class="text-primary-600 font-semibold text-sm">1</span>
          </div>
          <div>
            <h4 class="font-semibold text-gray-800 mb-1">Arrival & Equipment Fitting (10:00 AM)</h4>
            <p class="text-sm text-gray-600">Arrive at the dive center, get fitted with all scuba equipment, and meet your instructor.</p>
          </div>
        </div>
        <div class="flex gap-4">
          <div class="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
            <span class="text-primary-600 font-semibold text-sm">2</span>
          </div>
          <div>
            <h4 class="font-semibold text-gray-800 mb-1">Theory & Pool Session (10:30 AM - 11:30 AM)</h4>
            <p class="text-sm text-gray-600">Learn basic scuba theory and practice essential skills in a controlled pool environment.</p>
          </div>
        </div>
        <div class="flex gap-4">
          <div class="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
            <span class="text-primary-600 font-semibold text-sm">3</span>
          </div>
          <div>
            <h4 class="font-semibold text-gray-800 mb-1">Open Water Dive (12:00 PM - 1:00 PM)</h4>
            <p class="text-sm text-gray-600">Experience your first open water dive with your instructor, explore marine life and coral reefs.</p>
          </div>
        </div>
        <div class="flex gap-4">
          <div class="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
            <span class="text-primary-600 font-semibold text-sm">4</span>
          </div>
          <div>
            <h4 class="font-semibold text-gray-800 mb-1">Debrief & Certificate (1:30 PM)</h4>
            <p class="text-sm text-gray-600">Review your dive experience, receive certificate, and view underwater photos.</p>
          </div>
        </div>
      </div>`
    };
    return itineraries[ticket.type || ticket.name] || `<div class="space-y-4">
      <p>Detailed itinerary will be provided upon booking confirmation. The activity includes briefing, main activity session, and wrap-up with refreshments.</p>
    </div>`;
  };

  const getDummyCancellationPolicy = (ticket) => {
    return `<div class="space-y-3">
      <div class="">
        <ul class="space-y-2 text-sm text-gray-600">
          <li class="flex items-start gap-2">
            <i class="fi fi-rr-check flex items-center justify-center text-green-600 flex-shrink-0"></i>
            <span><strong>48+ hours before:</strong> Full refund (100%)</span>
          </li>
          <li class="flex items-start gap-2">
            <i class="fi fi-rr-check flex items-center justify-center text-green-600 flex-shrink-0"></i>
            <span><strong>24-48 hours before:</strong> 50% refund</span>
          </li>
          <li class="flex items-start  gap-2">
            <i class="fi fi-rr-cross flex items-center justify-center text-red-600 mt-1"></i>
            <span><strong>Less than 24 hours:</strong> No refund</span>
          </li>
        </ul>
      </div>
    
    </div>`;
  };

  const handleMobileBooking = () => {
    if (!enquireOnly) {
      router.push(`/activities/${activityDetails.id}/booking`);
    } else {
      setShowMobileForm(true);
    }
  };

  return (
    <main className="min-h-screen">
      <ImageViewer
        images={
          activityDetails.gallery?.map((img) => ({
            image_url: img.image,
            image_name: `Activity gallery image`,
          })) || []
        }
        isOpen={isImageViewerOpen}
        onClose={() => setIsImageViewerOpen(false)}
      />

      {/* Mobile Form Popup */}
      <Popup
        isOpen={showMobileForm}
        onClose={() => setShowMobileForm(false)}
        title="Book Your Activity"
        pos="bottom"
        draggable={true}
        className="lg:hidden w-full rounded-t-3xl"
        pannelStyle="h-[75vh]"
      >
        <div className="flex-1 overflow-y-auto p-4">
          <Form
            activityDetails={activityDetails}
            isMobilePopup={true}
            enquireOnly={enquireOnly}
            selectedTicket={
              activityDetails.ticketOptions?.find(
                ticket => ticket.id === expandedTicketType
              ) || null
            }
          />
        </div>
      </Popup>

      {/* Ticket Details Popup */}
      <Popup
        isOpen={showTicketDetailsPopup}
        onClose={() => {
          setShowTicketDetailsPopup(false);
          setSelectedTicketForDetails(null);
        }}
        title={selectedTicketForDetails?.type || selectedTicketForDetails?.name || "Ticket Details"}
        pos="center"
        draggable={false}
        className="w-full max-w-[800px] rounded-2xl"
        pannelStyle="max-h-[90vh]"
      >
        <div className="flex flex-col h-full relative">
          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-6 pb-24">
            {selectedTicketForDetails && (
              <div className="space-y-6">
                {/* Brief Details */}
                <div className="border-b border-gray-200 pb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <i className="fi fi-rr-info text-primary-600"></i>
                    Brief Details
                  </h3>
                  <div
                    className="text-sm text-gray-600 leading-relaxed"
                    dangerouslySetInnerHTML={{
                      __html: selectedTicketForDetails.briefDetails || getDummyBriefDetails(selectedTicketForDetails),
                    }}
                  />
                </div>

                {/* Inclusion */}
                <div className="border-b border-gray-200 pb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <i className="fi fi-rr-check-circle text-green-600"></i>
                    Inclusion
                  </h3>
                  <ul className="space-y-2">
                    {(selectedTicketForDetails.inclusion || getDummyInclusion(selectedTicketForDetails)).map((item, index) => (
                      <li key={index} className="flex items-start gap-3 text-sm text-gray-600">
                        <i className="fi fi-rr-check flex items-center justify-center text-green-600 flex-shrink-0"></i>
                        <span>{typeof item === 'string' ? item : item.name || item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Exclusion */}
                <div className="border-b border-gray-200 pb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <i className="fi fi-rr-cross-circle text-red-600"></i>
                    Exclusion
                  </h3>
                  <ul className="space-y-2">
                    {(selectedTicketForDetails.exclusion || getDummyExclusion(selectedTicketForDetails)).map((item, index) => (
                      <li key={index} className="flex items-start gap-3 text-sm text-gray-600">
                        <i className="fi fi-rr-cross flex items-center justify-center text-red-600 flex-shrink-0"></i>
                        <span>{typeof item === 'string' ? item : item.name || item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Itinerary */}
                <div className=" border-b border-gray-200 pb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <i className="fi fi-rr-calendar-check text-primary-600"></i>
                    Itinerary
                  </h3>
                  <div
                    className="text-sm text-gray-600 leading-relaxed"
                    dangerouslySetInnerHTML={{
                      __html: selectedTicketForDetails.itinerary || getDummyItinerary(selectedTicketForDetails),
                    }}
                  />
                </div>

                {/* Cancellation Policy */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <i className="fi fi-rr-shield-exclamation text-orange-600"></i>
                    Cancellation Policy
                  </h3>
                  <div
                    className="text-sm text-gray-600 leading-relaxed"
                    dangerouslySetInnerHTML={{
                      __html: selectedTicketForDetails.cancellationPolicy || getDummyCancellationPolicy(selectedTicketForDetails),
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Fixed Bottom Section - Price and Select Button */}
          {selectedTicketForDetails && (
            <div className="sticky bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg z-10 rounded-b-2xl">
              <div className="flex items-center justify-between gap-4">
                {/* Price */}
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-gray-900">
                    ₹{selectedTicketForDetails.price || selectedTicketForDetails.adult_price || 0}
                  </span>
                  {selectedTicketForDetails.originalPrice && selectedTicketForDetails.originalPrice > selectedTicketForDetails.price && (
                    <span className="text-sm text-gray-500 line-through">
                      ₹{selectedTicketForDetails.originalPrice}
                    </span>
                  )}
                  {selectedTicketForDetails.rateType === "pax" && (
                    <span className="text-xs text-gray-500">per person</span>
                  )}
                </div>

                {/* Select Button */}
                <button
                  onClick={() => {
                    if (expandedTicketType === selectedTicketForDetails.id) {
                      setExpandedTicketType(null);
                    } else {
                      setExpandedTicketType(selectedTicketForDetails.id);
                    }
                    setShowTicketDetailsPopup(false);
                  }}
                  className={`px-8 py-3 rounded-full font-medium text-sm transition-all duration-200 ${
                    expandedTicketType === selectedTicketForDetails.id
                      ? "bg-primary-600 text-white hover:bg-primary-700"
                      : "bg-primary-500 text-white hover:bg-primary-600"
                  }`}
                >
                  {expandedTicketType === selectedTicketForDetails.id ? "Selected" : "Select"}
                </button>
              </div>
            </div>
          )}
        </div>
      </Popup>

      {/* Hero Section */}
      <div className="w-full bg-white">
        <div className="max-w-7xl mx-auto px-4 py-6 mt-10">
          {/* Image Gallery */}
          <div className="w-full mb-8">
            {/* Mobile Carousel - Hidden on desktop */}
            <div className="lg:hidden relative">
              <div className="relative h-[400px] rounded-xl overflow-hidden">
                <div 
                  className="flex transition-transform duration-500 ease-out h-full"
                  style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                >
                  {allImages.map((image, index) => (
                    <div
                      key={index}
                      className="min-w-full h-full relative cursor-pointer"
                      onClick={() => {
                        setSelectedImageIndex(index);
                        setIsImageViewerOpen(true);
                      }}
                    >
                      <Image
                        src={image.image}
                        alt={`${activityDetails.title} - Image ${index + 1}`}
                        fill
                        className="object-cover"
                        sizes="100vw"
                        priority={index === 0}
                      />
                    </div>
                  ))}
                </div>

                {/* Navigation Arrows */}
                {allImages.length > 1 && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentSlide((prev) => 
                          prev === 0 ? allImages.length - 1 : prev - 1
                        );
                      }}
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white shadow-lg flex items-center justify-center transition-all z-10"
                    >
                      <i className="fi fi-rr-angle-left text-gray-800"></i>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentSlide((prev) => 
                          prev === allImages.length - 1 ? 0 : prev + 1
                        );
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white shadow-lg flex items-center justify-center transition-all z-10"
                    >
                      <i className="fi fi-rr-angle-right text-gray-800"></i>
                    </button>
                  </>
                )}


                {/* Image Counter */}
                <div className="absolute top-4 right-5 bg-black/50 text-white px-3 py-1 rounded-full text-sm z-10">
                  {currentSlide + 1} / {allImages.length}
                </div>

                {/* Show All Photos Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsImageViewerOpen(true);
                  }}
                  className="absolute bottom-3 right-3 bg-white hover:bg-gray-100 text-gray-800 px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 text-sm font-medium transition-all z-10"
                >
                  <i className="fi fi-rr-apps"></i>
                  <span>Show all photos</span>
                </button>
              </div>
            </div>

            {/* Desktop Grid - Hidden on mobile */}
            <div className="hidden lg:grid grid-cols-3 gap-2 h-[600px]">
              {/* Main Large Image - Left Side (2/3 width) */}
              <div 
                className="relative col-span-2 rounded-l-xl overflow-hidden cursor-pointer group"
                onClick={() => {
                  setSelectedImageIndex(0);
                  setIsImageViewerOpen(true);
                }}
              >
                {allImages[0]?.image ? (
                  <>
                    <Image
                      src={allImages[0].image}
                      alt={activityDetails.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="66vw"
                      priority
                    />
                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <i className="fi fi-rr-zoom-in text-white text-3xl"></i>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <i className="fi fi-rr-image text-gray-400 text-4xl"></i>
                  </div>
                )}
              </div>

              {/* Right Side Grid - 1/3 width */}
              <div className="grid grid-cols-1 grid-rows-2 gap-2">
                {/* Top Right Image */}
                {allImages[1]?.image && (
                  <div
                    className="relative rounded-tr-xl overflow-hidden cursor-pointer group"
                    onClick={() => {
                      setSelectedImageIndex(1);
                      setIsImageViewerOpen(true);
                    }}
                  >
                    <Image
                      src={allImages[1].image}
                      alt={`${activityDetails.title} - Image 2`}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="33vw"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <i className="fi fi-rr-zoom-in text-white text-2xl"></i>
                      </div>
                    </div>
                  </div>
                )}
                {/* Bottom Right Image with Show All overlay */}
                {allImages[2]?.image && (
                  <div
                    className="relative rounded-br-xl overflow-hidden cursor-pointer group"
                    onClick={() => {
                      setSelectedImageIndex(2);
                      setIsImageViewerOpen(true);
                    }}
                  >
                    <Image
                      src={allImages[2].image}
                      alt={`${activityDetails.title} - Image 3`}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="33vw"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <i className="fi fi-rr-zoom-in text-white text-2xl"></i>
                      </div>
                    </div>
                    {/* Show All Button - If more than 3 images */}
                    {allImages.length > 3 && (
                      <div
                        className="absolute inset-0 bg-black/60 hover:bg-black/70 transition-all duration-300 flex items-center justify-center cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsImageViewerOpen(true);
                        }}
                      >
                        <div className="text-center text-white">
                          <div className="text-3xl font-bold mb-1">
                            +{allImages.length - 3}
                          </div>
                          <div className="text-sm font-medium">
                            Show all photos
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Activity Details and Form in Flex Layout */}
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Column - Content */}
            <div className="w-full lg:w-2/3 space-y-8">
              {/* Activity Details Sections */}
              <div>
                {/* About Section */}
                <div className="bg-white rounded-xl mb-14">
                  <h2 className="text-base font-medium text-gray-700 mb-4 tracking-tight">
                    About the Activity
                  </h2>
                  <div className="text-gray-700 leading-relaxed text-sm">
                    {activityDetails.description ? (
                      <div
                        dangerouslySetInnerHTML={{
                          __html: activityDetails.description,
                        }}
                      />
                    ) : (
                      <p>No description available.</p>
                    )}
                  </div>
                </div>

                {/* Gallery Section */}
                {activityDetails.gallery && activityDetails.gallery.length > 0 && (
                  <div className="bg-white rounded-xl mb-14 hidden">
                    <h2 className="text-base font-medium text-gray-700 mb-6 tracking-tight">
                      Activity Gallery
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {activityDetails.gallery.map((image, index) => {
                        // Create a dynamic layout with fixed heights for better object-cover
                        const getImageClass = () => {
                          if (index === 0) return "col-span-2 row-span-2"; // Large featured image
                          if (index === 1) return "col-span-1 row-span-1"; // Regular size
                          if (index === 2) return "col-span-1 row-span-1"; // Regular size
                          if (index === 3) return "col-span-2 row-span-1"; // Wide image
                          if (index === 4) return "col-span-1 row-span-1"; // Regular size
                          if (index === 5) return "col-span-1 row-span-2"; // Tall image
                          if (index === 6) return "col-span-1 row-span-1"; // Regular size
                          return "col-span-1 row-span-1"; // Default for remaining images
                        };

                        const getHeight = () => {
                          if (index === 0) return "h-[300px] md:h-[400px]"; // Large featured
                          if (index === 3) return "h-[150px] md:h-[200px]"; // Wide
                          if (index === 5) return "h-[300px] md:h-[400px]"; // Tall
                          return "h-[150px] md:h-[200px]"; // Default regular
                        };

                        return (
                          <div
                            key={index}
                            className={`relative ${getImageClass()} ${getHeight()} rounded-xl overflow-hidden group cursor-pointer`}
                            onClick={() => setIsImageViewerOpen(true)}
                          >
                            <Image
                              src={image.image}
                              alt={`Activity gallery image ${index + 1}`}
                              fill
                              className="object-cover group-hover:scale-105 transition-all duration-500 ease-out"
                              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                            />
                            {/* Overlay on hover */}
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <i className="fi fi-rr-zoom-in text-white text-2xl"></i>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Activity Guide */}
                <div className="bg-white mb-12 border-b border-gray-200 pb-8">
                  <h2 className="text-base font-medium text-gray-700 mb-4 tracking-tight">
                    Activity Guide
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start gap-4">
                      <i className="fi fi-rr-clock text-xl text-primary-500"></i>
                      <div>
                        <p className="text-sm text-gray-500">Duration</p>
                        <p className="font-medium text-sm text-gray-700">
                          {activityDetails.activityGuide.duration}
                        </p>
                      </div>
                    </div>

                    {activityDetails.location && (
                      <div className="flex items-start gap-4">
                        <i className="fi fi-rr-marker text-xl text-primary-500"></i>
                        <div>
                          <p className="text-sm text-gray-500">Location</p>
                          <p className="font-medium text-sm text-gray-700">
                            {activityDetails.location}
                          </p>
                        </div>
                      </div>
                    )}
                    {activityDetails.address && (
                      <div className="flex items-start gap-4">
                        <i className="fi fi-rr-map text-xl text-primary-500"></i>
                        <div>
                          <p className="text-sm text-gray-500">Address</p>
                          <p className="font-medium text-sm text-gray-700">
                            {activityDetails.address}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Activity Tickets Options Section */}
                {activityDetails.ticketOptions && activityDetails.ticketOptions.length > 0 && (
                  <div className="bg-[#f5f5f5] p-4 rounded-xl mb-14">
                    <h2 className="text-base font-medium text-gray-700 mb-6 tracking-tight">
                      Activity Tickets Options
                    </h2>
                    <div className="space-y-3">
                      {activityDetails.ticketOptions.map((ticket, index) => {
                        const isSelected = expandedTicketType === ticket.id;
                        const displayedFeatures = ticket.features?.slice(0, 3) || [];

                        return (
                          <div 
                            key={ticket.id || index} 
                            className={`border border-gray-200 rounded-2xl p-4 transition-all duration-200 ${
                              isSelected ? "bg-gray-50 border-primary-300" : "bg-white hover:bg-gray-50"
                            }`}
                          >
                            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center w-full">
                              {/* Left Side - Main Heading */}
                              <div className="flex-1 w-full lg:w-auto">
                                <h3 className="text-base font-semibold text-gray-800 mb-3">
                                  {ticket.type || ticket.name}
                                </h3>
                                <div className="flex flex-wrap gap-2 mb-3">
                                  {displayedFeatures.map((feature, featureIndex) => (
                                    <span
                                      key={featureIndex}
                                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white border border-gray-200 text-xs font-medium text-gray-700"
                                    >
                                      <i className="fi fi-rr-check text-primary-600 text-xs"></i>
                                      {typeof feature === 'string' ? feature : feature.name || feature}
                                    </span>
                                  ))}
                                </div>

                                {/* Show More Button */}
                                {ticket.features && ticket.features.length > 3 && (
                                  <button
                                    onClick={() => {
                                      setSelectedTicketForDetails(ticket);
                                      setShowTicketDetailsPopup(true);
                                    }}
                                    className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1 transition-colors"
                                  >
                                    <span>Show More</span>
                                    <i className="fi fi-br-angle-small-right text-xs"></i>
                                  </button>
                                )}
                              </div>

                              {/* Right Side - Price and Select Button */}
                              <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end gap-3 w-full lg:w-auto lg:min-w-[180px]">
                                {/* Price */}
                                <div className="text-right">
                                  <div className="flex items-baseline gap-1">
                                    <span className="text-2xl font-bold text-gray-900">
                                      ₹{ticket.price || ticket.adult_price || 0}
                                    </span>
                                    {ticket.originalPrice && ticket.originalPrice > ticket.price && (
                                      <span className="text-sm text-gray-500 line-through ml-1">
                                        ₹{ticket.originalPrice}
                                      </span>
                                    )}
                                  </div>
                                  {ticket.rateType === "pax" && (
                                    <span className="text-xs text-gray-500">per person</span>
                                  )}
                                </div>

                                {/* Select Button */}
                                <button
                                  onClick={() => {
                                    if (isSelected) {
                                      setExpandedTicketType(null);
                                    } else {
                                      setExpandedTicketType(ticket.id);
                                    }
                                  }}
                                  className={`w-full sm:w-auto lg:w-full px-6 py-2.5 rounded-full font-medium text-sm transition-all duration-200 cursor-pointer ${
                                    isSelected
                                      ? "bg-primary-500 text-white hover:bg-primary-600"
                                      : "bg-primary-50 border border-primary-600 text-primary-600 hover:bg-primary-50"
                                  }`}
                                >
                                  {isSelected ? "Selected" : "Select"}
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* FAQ Section */}
                {activityDetails.faqs && activityDetails.faqs.length > 0 && (
                  <div className="bg-white mb-14 border-t border-gray-200 pt-8">
                    <h2 className="text-base font-medium text-gray-700 mb-4 tracking-tight">
                      Frequently Asked Questions
                    </h2>
                    <div className="space-y-2">
                      {activityDetails.faqs.map((faq, index) => (
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
                {activityDetails.terms && (
                  <div className="bg-white rounded-xl mb-14">
                    <h2 className="text-base font-medium text-gray-700 mb-4 tracking-tight">
                      Terms & Conditions
                    </h2>
                    <Accordion
                      title="Activity Terms & Conditions"
                      defaultOpen={true}
                    >
                      <div className="space-y-3">
                        <div
                          className="text-gray-600 text-sm"
                          dangerouslySetInnerHTML={{
                            __html: activityDetails.terms,
                          }}
                        />
                      </div>
                    </Accordion>
                  </div>
                )}
              </div>
            </div>

            {/* Desktop Right Column - Activity Details */}
            <div className="w-full lg:w-1/3 hidden lg:block">
              <div className="lg:sticky lg:top-20">
                <Form 
                  activityDetails={activityDetails} 
                  enquireOnly={enquireOnly}
                  selectedTicket={
                    activityDetails.ticketOptions?.find(
                      ticket => ticket.id === expandedTicketType
                    ) || null
                  }
                />
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
            <span className="text-sm font-bold">
              {(() => {
                const selectedTicket = activityDetails.ticketOptions?.find(
                  ticket => ticket.id === expandedTicketType
                );
                if (selectedTicket) {
                  return `₹${selectedTicket.price || selectedTicket.adult_price || 0}`;
                }
                return activityDetails.price;
              })()}
            </span>
            <i className="fi fi-rr-ticket ml-2 text-sm"></i>
          </div>
        </button>
      </div>
    </main>
  );
};

export default ActivityDetailPage;

