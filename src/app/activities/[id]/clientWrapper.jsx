"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/common/Button";
import Accordion from "@/components/Accordion";
import Popup from "@/components/Popup";
import Form from "./Form";
import ImageViewer from "@/components/ImageViewer/ImageViewer";
import RichTextContent from "@/components/common/RichTextContent";
import DetailPageLayout from "@/components/layout/DetailPageLayout";
import DetailSubHeader, { DETAIL_SIDEBAR_STICKY_TOP } from "@/components/layout/DetailSubHeader";

function SectionCard({ title, children, className = "" }) {
  return (
    <section
      className={`overflow-hidden rounded-2xl border border-gray-200/80 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] sm:p-6 ${className}`}
    >
      {title ? (
        <h2 className="mb-3 text-base font-semibold tracking-tight text-gray-900">{title}</h2>
      ) : null}
      {children}
    </section>
  );
}

function GuideItem({ icon, label, value }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-gray-100 bg-gray-50/60 p-3.5">
      <span className="fi-box h-9 w-9 shrink-0 rounded-lg border border-gray-200 bg-white text-primary-600">
        <i className={`${icon} text-sm`} aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-medium text-gray-500">{label}</p>
        <p className="mt-0.5 text-sm font-semibold text-gray-900">{value}</p>
      </div>
    </div>
  );
}

function formatTicketPrice(ticket) {
  const base = Number(ticket?.price || ticket?.adult_price || 0);
  if (!Number.isFinite(base) || base <= 0) return null;
  return Math.round(base * 100) / 100;
}

function TicketTabButton({ active, onClick, icon, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-2 text-xs font-semibold transition-colors ${
        active
          ? "bg-white text-gray-900 shadow-sm"
          : "text-gray-500 hover:text-gray-800"
      }`}
    >
      <span className="fi-box h-4 w-4 shrink-0">
        <i className={`${icon} text-[11px]`} aria-hidden="true" />
      </span>
      <span className="leading-none">{label}</span>
    </button>
  );
}

const ActivityDetailPage = ({ activityDetails }) => {
  const router = useRouter();
  const [showMobileForm, setShowMobileForm] = useState(false);
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);
  // selectedTicketId = ticket chosen for booking/price
  // expandedTicketId = ticket whose details panel is open (tabs)
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [expandedTicketId, setExpandedTicketId] = useState(null);
  const [ticketTabs, setTicketTabs] = useState({});
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

  const getActiveTicketTab = (ticketId) => ticketTabs[ticketId] || "inclusions";

  const setActiveTicketTab = (ticketId, tab) => {
    setTicketTabs((prev) => ({ ...prev, [ticketId]: tab }));
  };

  // By default, select the first ticket option (so booking can proceed)
  useEffect(() => {
    const options = activityDetails?.ticketOptions || [];
    if (!Array.isArray(options) || options.length === 0) return;

    // Auto-select the lowest BASE priced ticket (e.g. 1200) by default.
    // Admin/discount are applied later in the side form; keep base for selection.
    const lowest = options.reduce((acc, t) => {
      const base = Number(t?.price || t?.adult_price || 0);
      if (!Number.isFinite(base) || base <= 0) return acc;
      if (!acc) return t;
      const accBase = Number(acc?.price || acc?.adult_price || 0);
      return base < accBase ? t : acc;
    }, null);

    const idToSelect = lowest?.id ?? options?.[0]?.id;
    if (!idToSelect) return;
    setSelectedTicketId((prev) => prev ?? idToSelect);
  }, [activityDetails?.ticketOptions]);

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

  const handleMobileBooking = () => setShowMobileForm(true);

  const handleShare = async () => {
    const shareData = {
      title: activityDetails.title,
      text: activityDetails.description?.replace(/<[^>]+>/g, "").slice(0, 120),
      url: window.location.href,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        /* cancelled */
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  const galleryImages = activityDetails.gallery || [];

  return (
    <main className="min-h-screen bg-[#f8f9fb] pb-28 lg:pb-12">
      <ImageViewer
        images={allImages.map((img, index) => ({
          image_url: img.image,
          image_name: `${activityDetails.title} - ${index + 1}`,
        }))}
        isOpen={isImageViewerOpen}
        onClose={() => setIsImageViewerOpen(false)}
      />

      {/* Mobile Form Popup */}
      <Popup
        isOpen={showMobileForm}
        onClose={() => setShowMobileForm(false)}
        title="Book your activity"
        pos="bottom"
        draggable
        className="lg:hidden w-full rounded-t-3xl"
        pannelStyle="h-[78vh]"
      >
        <div className="flex-1 overflow-y-auto p-4">
          <Form
            activityDetails={activityDetails}
            isMobilePopup={true}
            enquireOnly={enquireOnly}
            selectedTicket={
              activityDetails.ticketOptions?.find(
                ticket => ticket.id === selectedTicketId
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
                  <RichTextContent
                    html={
                      selectedTicketForDetails.briefDetails ||
                      getDummyBriefDetails(selectedTicketForDetails)
                    }
                    className="text-gray-600"
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
                  <RichTextContent
                    html={
                      selectedTicketForDetails.itinerary ||
                      getDummyItinerary(selectedTicketForDetails)
                    }
                    className="text-gray-600"
                  />
                </div>

                {/* Cancellation Policy */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <i className="fi fi-rr-shield-exclamation text-orange-600"></i>
                    Cancellation Policy
                  </h3>
                  <RichTextContent
                    html={
                      selectedTicketForDetails.cancellationPolicy ||
                      getDummyCancellationPolicy(selectedTicketForDetails)
                    }
                    className="text-gray-600"
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
                    ₹
                    {(() => {
                      const base =
                        Number(selectedTicketForDetails.price || 0) ||
                        Number(selectedTicketForDetails.adult_price || 0);
                      return (Math.round(base * 100) / 100).toFixed(0);
                    })()}
                  </span>
                  {selectedTicketForDetails.rateType === "pax" && (
                    <span className="text-xs text-gray-500">per person</span>
                  )}
                </div>

                {/* Select Button */}
                <button
                  onClick={() => {
                    setSelectedTicketId(selectedTicketForDetails.id);
                    setShowTicketDetailsPopup(false);
                  }}
                  className={`px-8 py-3 rounded-full font-medium text-sm transition-all duration-200 ${
                    selectedTicketId === selectedTicketForDetails.id
                      ? "bg-primary-600 text-white hover:bg-primary-700"
                      : "bg-primary-500 text-white hover:bg-primary-600"
                  }`}
                >
                  {selectedTicketId === selectedTicketForDetails.id ? "Selected" : "Select"}
                </button>
              </div>
            </div>
          )}
        </div>
      </Popup>

      <DetailSubHeader
        backLabel="Activities"
        onBack={() => router.back()}
        onShare={handleShare}
        shareAriaLabel="Share activity"
      />

      <DetailPageLayout
        containerClassName="mt-6"
        stickyTop={DETAIL_SIDEBAR_STICKY_TOP}
        sidebar={
          <Form
            activityDetails={activityDetails}
            enquireOnly={enquireOnly}
            selectedTicket={
              activityDetails.ticketOptions?.find((ticket) => ticket.id === selectedTicketId) || null
            }
          />
        }
      >
        <div className="space-y-6 lg:space-y-8">
          <div className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <div className="w-full">
              <div className="lg:hidden relative">
                <div className="relative h-[min(52vw,320px)] overflow-hidden">
                  <div
                    className="flex h-full transition-transform duration-500 ease-out"
                    style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                  >
                    {allImages.map((image, index) => (
                      <button
                        key={index}
                        type="button"
                        className="relative block h-full min-w-full"
                        onClick={() => {
                          setSelectedImageIndex(index);
                          setIsImageViewerOpen(true);
                        }}
                      >
                        <Image
                          src={image.image}
                          alt={`${activityDetails.title} - ${index + 1}`}
                          fill
                          className="object-cover"
                          sizes="100vw"
                          priority={index === 0}
                        />
                      </button>
                    ))}
                  </div>
                  {allImages.length > 1 ? (
                    <>
                      <button
                        type="button"
                        onClick={() =>
                          setCurrentSlide((prev) => (prev === 0 ? allImages.length - 1 : prev - 1))
                        }
                        className="absolute left-2 top-1/2 z-10 -translate-y-1/2 fi-box h-9 w-9 rounded-full bg-white/95 text-gray-800 shadow-md"
                      >
                        <i className="fi fi-rr-angle-left text-sm" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setCurrentSlide((prev) => (prev === allImages.length - 1 ? 0 : prev + 1))
                        }
                        className="absolute right-2 top-1/2 z-10 -translate-y-1/2 fi-box h-9 w-9 rounded-full bg-white/95 text-gray-800 shadow-md"
                      >
                        <i className="fi fi-rr-angle-right text-sm" aria-hidden="true" />
                      </button>
                      <span className="absolute right-3 top-3 rounded-full bg-black/50 px-2.5 py-0.5 text-xs text-white">
                        {currentSlide + 1}/{allImages.length}
                      </span>
                    </>
                  ) : null}
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900/70 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-left pointer-events-none">
                    {(activityDetails.popular || activityDetails.recommended) && (
                      <div className="mb-2 flex flex-wrap gap-1.5">
                        {activityDetails.popular ? (
                          <span className="rounded-full border border-white/20 bg-white/15 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm">
                            Popular
                          </span>
                        ) : null}
                        {activityDetails.recommended ? (
                          <span className="rounded-full border border-white/20 bg-white/15 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm">
                            Recommended
                          </span>
                        ) : null}
                      </div>
                    )}
                    <h1 className="text-xl font-bold leading-tight text-white">
                      {activityDetails.title}
                    </h1>
                    {activityDetails.location ? (
                      <p className="fi-inline mt-1 text-sm text-white/90">
                        <i className="fi fi-rr-marker text-xs" aria-hidden="true" />
                        <span>{activityDetails.location}</span>
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="hidden lg:grid grid-cols-3 gap-1.5 p-1.5 h-[420px]">
                <button
                  type="button"
                  className="relative col-span-2 overflow-hidden rounded-l-xl"
                  onClick={() => {
                    setSelectedImageIndex(0);
                    setIsImageViewerOpen(true);
                  }}
                >
                  {allImages[0]?.image ? (
                    <Image
                      src={allImages[0].image}
                      alt={activityDetails.title}
                      fill
                      className="object-cover transition-transform duration-300 hover:scale-105"
                      sizes="50vw"
                      priority
                    />
                  ) : null}
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900/75 via-gray-900/10 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-5 text-left">
                    {activityDetails.categoryName || activityDetails.categories?.[0] ? (
                      <span className="mb-2 inline-flex rounded-full border border-white/20 bg-white/15 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-white backdrop-blur-sm">
                        {activityDetails.categoryName || activityDetails.categories[0]}
                      </span>
                    ) : null}
                    <h1 className="text-2xl font-bold leading-tight text-white sm:text-3xl">
                      {activityDetails.title}
                    </h1>
                    {activityDetails.location ? (
                      <p className="fi-inline mt-2 text-sm text-white/90">
                        <i className="fi fi-rr-marker text-xs" aria-hidden="true" />
                        <span>{activityDetails.location}</span>
                      </p>
                    ) : null}
                  </div>
                </button>
                <div className="grid grid-rows-2 gap-1.5">
                  {allImages[1]?.image ? (
                    <button
                      type="button"
                      className="relative overflow-hidden rounded-tr-xl"
                      onClick={() => {
                        setSelectedImageIndex(1);
                        setIsImageViewerOpen(true);
                      }}
                    >
                      <Image src={allImages[1].image} alt="" fill className="object-cover hover:scale-105 transition-transform" sizes="25vw" />
                    </button>
                  ) : null}
                  {allImages[2]?.image ? (
                    <button
                      type="button"
                      className="relative overflow-hidden rounded-br-xl"
                      onClick={() => {
                        setSelectedImageIndex(allImages.length > 3 ? 0 : 2);
                        setIsImageViewerOpen(true);
                      }}
                    >
                      <Image src={allImages[2].image} alt="" fill className="object-cover hover:scale-105 transition-transform" sizes="25vw" />
                      {allImages.length > 3 ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/55 text-white">
                          <span className="text-2xl font-bold">+{allImages.length - 3}</span>
                          <span className="text-xs font-medium">Show all</span>
                        </div>
                      ) : null}
                    </button>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 border-t border-gray-100 p-4 sm:grid-cols-3 sm:p-5">
              <GuideItem
                icon="fi fi-rr-clock"
                label="Duration"
                value={activityDetails.activityGuide?.duration || "TBD"}
              />
              {(activityDetails.categories || []).length > 0 ? (
                <GuideItem
                  icon="fi fi-rr-apps"
                  label="Category"
                  value={(activityDetails.categories || []).join(", ")}
                />
              ) : null}
              {activityDetails.activityGuide?.layout ? (
                <GuideItem
                  icon="fi fi-rr-home"
                  label="Setting"
                  value={activityDetails.activityGuide.layout}
                />
              ) : null}
            </div>
          </div>

          {activityDetails.description ? (
            <SectionCard title="About this activity">
              <RichTextContent html={activityDetails.description} />
            </SectionCard>
          ) : null}

          {galleryImages.length > 0 ? (
            <SectionCard title="Gallery">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3">
                {galleryImages.slice(0, 6).map((image, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => {
                      setSelectedImageIndex(index + 1);
                      setIsImageViewerOpen(true);
                    }}
                    className="group relative aspect-square overflow-hidden rounded-xl bg-gray-100"
                  >
                    <Image
                      src={image.image}
                      alt={`Gallery ${index + 1}`}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 640px) 50vw, 25vw"
                    />
                  </button>
                ))}
              </div>
            </SectionCard>
          ) : null}

          {activityDetails.ticketOptions && activityDetails.ticketOptions.length > 0 ? (
            <SectionCard title="Choose your ticket">
                    <div className="space-y-2.5">
                      {activityDetails.ticketOptions.map((ticket, index) => {
                        const isSelected = selectedTicketId === ticket.id;
                        const isExpanded = expandedTicketId === ticket.id;
                        const activeTab = getActiveTicketTab(ticket.id);
                        const hasInclusions = Array.isArray(ticket.inclusions) && ticket.inclusions.length > 0;
                        const hasExclusions = Array.isArray(ticket.exclusions) && ticket.exclusions.length > 0;
                        const hasItinerary = Array.isArray(ticket.itineraries) && ticket.itineraries.length > 0;
                        const unitPrice = formatTicketPrice(ticket);
                        const showStrikePrice =
                          Number(ticket.originalPrice) > 0 &&
                          Number(ticket.originalPrice) > Number(ticket.price || 0);
                        const hasDetails = hasInclusions || hasExclusions || hasItinerary;
                        const inclusionPreview = (ticket.inclusions || []).slice(0, 3);
                        const ticketDescription = String(
                          ticket.description || ticket.briefDetails || ""
                        ).trim();

                        return (
                          <article
                            key={ticket.id || index}
                            className={`overflow-hidden rounded-xl border transition-all ${
                              isSelected
                                ? "border-primary-500 bg-primary-50/30 ring-1 ring-primary-500/20"
                                : "border-gray-200 bg-white hover:border-gray-300"
                            }`}
                          >
                            <div className="p-4">
                              <div className="flex items-start gap-3">
                                <button
                                  type="button"
                                  onClick={() => setSelectedTicketId(ticket.id)}
                                  className={`fi-box mt-0.5 h-5 w-5 shrink-0 rounded-full border transition-colors ${
                                    isSelected
                                      ? "border-primary-600 bg-primary-600 text-white"
                                      : "border-gray-300 bg-white text-transparent hover:border-primary-400"
                                  }`}
                                  aria-label={isSelected ? "Selected ticket" : "Select ticket"}
                                  aria-pressed={isSelected}
                                >
                                  {isSelected ? (
                                    <i className="fi fi-rr-check text-[10px]" aria-hidden="true" />
                                  ) : null}
                                </button>

                                <div className="min-w-0 flex-1">
                                  <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div className="min-w-0">
                                      <h3 className="text-base font-semibold text-gray-900">
                                        {ticket.type || ticket.name}
                                      </h3>
                                      {!isExpanded && hasDetails ? (
                                        <p className="mt-1 text-xs text-gray-500">
                                          {[
                                            hasInclusions
                                              ? `${ticket.inclusions.length} inclusion${ticket.inclusions.length === 1 ? "" : "s"}`
                                              : null,
                                            hasExclusions
                                              ? `${ticket.exclusions.length} exclusion${ticket.exclusions.length === 1 ? "" : "s"}`
                                              : null,
                                            hasItinerary
                                              ? `${ticket.itineraries.length} stop${ticket.itineraries.length === 1 ? "" : "s"}`
                                              : null,
                                          ]
                                            .filter(Boolean)
                                            .join(" · ")}
                                        </p>
                                      ) : null}
                                    </div>
                                    <div className="shrink-0 text-right">
                                      {unitPrice != null ? (
                                        <>
                                          <p className="text-xl font-bold tabular-nums text-gray-900">
                                            ₹{unitPrice.toFixed(0)}
                                          </p>
                                          {showStrikePrice ? (
                                            <p className="text-xs text-gray-400 line-through">
                                              ₹{Number(ticket.originalPrice).toFixed(0)}
                                            </p>
                                          ) : null}
                                          <p className="text-[11px] text-gray-500">
                                            {ticket.rateType === "full" ? "per ticket" : "per person"}
                                          </p>
                                        </>
                                      ) : (
                                        <p className="text-sm font-medium text-gray-500">Price on request</p>
                                      )}
                                    </div>
                                  </div>

                                  {!isExpanded && ticketDescription ? (
                                    <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-gray-600">
                                      {ticketDescription.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()}
                                    </p>
                                  ) : null}

                                  {!isExpanded && inclusionPreview.length > 0 ? (
                                    <div className="mt-3 flex flex-wrap gap-1.5">
                                      {inclusionPreview.map((item, i) => (
                                        <span
                                          key={i}
                                          className="inline-flex max-w-full items-center gap-1 rounded-full border border-gray-200 bg-white px-2 py-0.5 text-[11px] text-gray-600"
                                        >
                                          <span className="fi-box h-3.5 w-3.5 shrink-0 text-primary-600">
                                            <i className="fi fi-rr-check text-[9px]" aria-hidden="true" />
                                          </span>
                                          <span className="truncate">{item}</span>
                                        </span>
                                      ))}
                                      {ticket.inclusions.length > 3 ? (
                                        <span className="text-[11px] font-medium text-gray-400">
                                          +{ticket.inclusions.length - 3} more
                                        </span>
                                      ) : null}
                                    </div>
                                  ) : null}

                                  {hasDetails ? (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setExpandedTicketId((prev) => (prev === ticket.id ? null : ticket.id));
                                      }}
                                      className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary-700 hover:text-primary-800"
                                    >
                                      <span>{isExpanded ? "Hide details" : "View inclusions & itinerary"}</span>
                                      <span className="fi-box h-4 w-4 shrink-0">
                                        <i
                                          className={`fi fi-rr-angle-small-${isExpanded ? "up" : "down"} text-sm`}
                                          aria-hidden="true"
                                        />
                                      </span>
                                    </button>
                                  ) : null}
                                </div>
                              </div>
                            </div>

                            {isExpanded ? (
                              <div className="border-t border-gray-200/80 bg-white px-4 pb-4 pt-3">
                                <div className="mb-3 grid grid-cols-3 gap-1 rounded-lg bg-gray-100 p-1">
                                  <TicketTabButton
                                    active={activeTab === "inclusions"}
                                    onClick={() => setActiveTicketTab(ticket.id, "inclusions")}
                                    icon="fi fi-rr-check"
                                    label="Includes"
                                  />
                                  <TicketTabButton
                                    active={activeTab === "exclusions"}
                                    onClick={() => setActiveTicketTab(ticket.id, "exclusions")}
                                    icon="fi fi-rr-cross-small"
                                    label="Excludes"
                                  />
                                  <TicketTabButton
                                    active={activeTab === "itinerary"}
                                    onClick={() => setActiveTicketTab(ticket.id, "itinerary")}
                                    icon="fi fi-rr-route"
                                    label="Itinerary"
                                  />
                                </div>

                                {activeTab === "inclusions" ? (
                                  hasInclusions ? (
                                    <ul className="grid gap-2 sm:grid-cols-2">
                                      {ticket.inclusions.map((item, i) => (
                                        <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                                          <span className="fi-box h-5 w-5 shrink-0 rounded-full border border-primary-100 bg-primary-50 text-primary-700">
                                            <i className="fi fi-rr-check text-[9px]" aria-hidden="true" />
                                          </span>
                                          <span className="leading-snug">{item}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  ) : (
                                    <p className="text-sm text-gray-500">No inclusions listed for this ticket.</p>
                                  )
                                ) : null}

                                {activeTab === "exclusions" ? (
                                  hasExclusions ? (
                                    <ul className="grid gap-2 sm:grid-cols-2">
                                      {ticket.exclusions.map((item, i) => (
                                        <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                                          <span className="fi-box h-5 w-5 shrink-0 rounded-full border border-red-100 bg-red-50 text-red-600">
                                            <i className="fi fi-rr-cross-small text-[9px]" aria-hidden="true" />
                                          </span>
                                          <span className="leading-snug">{item}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  ) : (
                                    <p className="text-sm text-gray-500">No exclusions listed for this ticket.</p>
                                  )
                                ) : null}

                                {activeTab === "itinerary" ? (
                                  hasItinerary ? (
                                    <ol className="space-y-3">
                                      {ticket.itineraries.map((step, i) => (
                                        <li key={i} className="flex items-start gap-3">
                                          <span className="fi-box mt-0.5 h-7 w-7 shrink-0 rounded-full border border-gray-200 bg-gray-50 text-xs font-bold leading-none text-gray-700">
                                            {step.step_number ?? i + 1}
                                          </span>
                                          <div className="min-w-0">
                                            <p className="text-sm font-semibold text-gray-900">
                                              {step.title || "Step"}
                                              {step.time ? (
                                                <span className="ml-1.5 text-xs font-normal text-gray-500">
                                                  ({step.time})
                                                </span>
                                              ) : null}
                                            </p>
                                            {step.description ? (
                                              <p className="mt-0.5 text-sm leading-relaxed text-gray-600">
                                                {step.description}
                                              </p>
                                            ) : null}
                                          </div>
                                        </li>
                                      ))}
                                    </ol>
                                  ) : (
                                    <p className="text-sm text-gray-500">No itinerary provided for this ticket.</p>
                                  )
                                ) : null}

                                {ticket.features && ticket.features.length > 3 ? (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSelectedTicketForDetails(ticket);
                                      setShowTicketDetailsPopup(true);
                                    }}
                                    className="mt-4 text-xs font-semibold text-primary-700 hover:underline"
                                  >
                                    View full ticket details
                                  </button>
                                ) : null}
                              </div>
                            ) : null}
                          </article>
                        );
                      })}
                    </div>
            </SectionCard>
          ) : null}

          {(activityDetails.location || activityDetails.address) ? (
            <SectionCard title="Location">
              <div className="space-y-4">
                <p className="text-sm leading-relaxed text-gray-700">
                  {activityDetails.address || activityDetails.location}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    if (activityDetails.mapLink) {
                      window.open(activityDetails.mapLink, "_blank");
                    } else if (activityDetails.latitude && activityDetails.longitude) {
                      window.open(
                        `https://www.google.com/maps/search/?api=1&query=${activityDetails.latitude},${activityDetails.longitude}`,
                        "_blank"
                      );
                    } else {
                      const address = encodeURIComponent(
                        activityDetails.address || activityDetails.location || ""
                      );
                      window.open(
                        `https://www.google.com/maps/search/?api=1&query=${address}`,
                        "_blank"
                      );
                    }
                  }}
                  className="fi-inline rounded-full border border-primary-200 bg-primary-50 px-4 py-2 text-sm font-semibold text-primary-700 transition-colors hover:bg-primary-100"
                >
                  <span>Get directions</span>
                  <i className="fi fi-rr-arrow-right text-xs" aria-hidden="true" />
                </button>
              </div>
            </SectionCard>
          ) : null}

          {activityDetails.faqs && activityDetails.faqs.length > 0 ? (
            <SectionCard title="Frequently asked questions">
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
            </SectionCard>
          ) : null}

          {activityDetails.terms ? (
            <SectionCard title="Terms & conditions">
                    <Accordion title="Activity terms & conditions" defaultOpen>
                      <RichTextContent html={activityDetails.terms} className="text-sm text-gray-600" />
                    </Accordion>
            </SectionCard>
          ) : null}
        </div>
      </DetailPageLayout>

      <div className="fixed bottom-16 left-4 right-4 z-40 lg:hidden">
        <Button
          onClick={handleMobileBooking}
          size="lg"
          className="w-full !justify-between !rounded-2xl px-5 shadow-lg"
        >
          <span className="text-sm font-semibold">Book now</span>
          <span className="text-sm font-bold tabular-nums">
            {(() => {
              const selectedTicket = activityDetails.ticketOptions?.find(
                (ticket) => ticket.id === selectedTicketId
              );
              if (selectedTicket) {
                return `₹${selectedTicket.price || selectedTicket.adult_price || 0}`;
              }
              return activityDetails.price;
            })()}
          </span>
        </Button>
      </div>
    </main>
  );
};

export default ActivityDetailPage;

