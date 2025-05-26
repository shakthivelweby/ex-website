"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Accordion from "@/components/Accordion";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { createGlobalStyle } from "styled-components";




// Add GlobalStyle component for the carousel
const GlobalCarouselStyle = createGlobalStyle`
  // ... existing code ...
  
  /* Fixed booking button styles */
  .fixed-booking-btn {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: white;
    border-top: 1px solid #e5e7eb;
    box-shadow: 0 -4px 10px rgba(0, 0, 0, 0.05);
    padding: 12px 16px;
    z-index: 50;
    transition: all 0.3s ease;
  }
  
  .mobile-booking-drawer {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: white;
    z-index: 49;
    border-top-left-radius: 16px;
    border-top-right-radius: 16px;
    box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.15);
    transform: translateY(100%);
    transition: transform 0.3s ease;
    max-height: 85vh;
    overflow-y: auto;
  }
  
  .mobile-booking-drawer.open {
    transform: translateY(0);
  }
  
  .drawer-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 48;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.3s ease;
  }
  
  .drawer-overlay.open {
    opacity: 1;
    pointer-events: auto;
  }
`;

export default function PackageDetailPage() {
  const searchParams = useSearchParams();
  const packageId = searchParams.get("id") || "default-package";
  const [selectedDate, setSelectedDate] = useState(null);
  const [adultCount, setAdultCount] = useState(2);
  const [childCount, setChildCount] = useState(0);
  const [infantCount, setInfantCount] = useState(0);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const router = useRouter();
  const [additionalInfoOpen, setAdditionalInfoOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState(1);
  const [activeTab, setActiveTab] = useState("details");
  const [selectedDuration, setSelectedDuration] = useState("12n13d"); // Default to 12 nights option
  const [selectedStayCategory, setSelectedStayCategory] = useState("standard"); // Default to standard stay option
  const [isBookingDrawerOpen, setIsBookingDrawerOpen] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const reviewsEndRef = useRef(null);

  // Additional sample reviews for when "Show more" is clicked
  const additionalReviews = [
    {
      initials: "VP",
      name: "Vikram Patel",
      date: "November 2022",
      rating: 5,
      text: "The trip was meticulously planned with attention to every detail. The accommodations were excellent, particularly the heritage hotels in Rajasthan. We got to experience both luxury and authentic local culture throughout the journey. The guides were knowledgeable and patient with our endless questions. The Taj Mahal at sunrise was a magical experience that will stay with us forever.",
      tags: ["Heritage Hotels", "Local Guides", "Taj Mahal"],
    },
    {
      initials: "LW",
      name: "Lisa Wong",
      date: "October 2022",
      rating: 4,
      text: "I traveled solo on this trip and felt completely safe and well taken care of throughout. The tour provided a good balance between organized activities and free time to explore. Meeting other travelers in the group was a highlight as we shared these amazing experiences together. My only suggestion would be to have more time in Jaisalmer, as the desert experience was truly spectacular and I would have loved an extra day there.",
      tags: ["Solo Travel", "Desert", "Group Experience"],
    },
    {
      initials: "DK",
      name: "David Kumar",
      date: "September 2022",
      rating: 5,
      text: "As a photographer, this tour was perfect! The diversity of landscapes from the Thar Desert to the Kashmir Valley provided endless photo opportunities. The cultural experiences were equally remarkable - from the intricate architecture of temples and palaces to the vibrant local markets. What really impressed me was how well the tour handled transitions between such different environments.",
      tags: ["Photography", "Landscapes", "Architecture"],
    },
  ];

  // Sample package data (in a real app, you'd fetch this from an API)
  const packageData = {
    id: "raj-jais-kash-amr-del-agra",
    title: "Rajasthan - Jaisalmer - Kashmir - Amritsar - Delhi - Agra",
    price: 20500,
    duration: {
      days: 12,
      nights: 11,
    },
    startingLocation: "Kochi",
    pickupPoint: "Rajasthan",
    pickupTime: "6:30 am",
    dropOffPoint: "Agra",
    dropOffTime: "10:30 pm",
    packageType: "Standard Stay",
    isCertified: true,
    nights: 12,
    days: 13,
    images: [
      "https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", // Hawa Mahal, Rajasthan
      "https://images.unsplash.com/photo-1598190895998-62696125f1c1?q=80&w=3164&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", // Jaisalmer Fort
      "https://images.unsplash.com/photo-1603262110263-fb0112e7cc33?q=80&w=2942&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", // Kashmir mountains
      "https://images.unsplash.com/photo-1709620220232-12ecd7ca33a8?q=80&w=2952&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", // Golden Temple, Amritsar
      "https://images.unsplash.com/photo-1590770542366-7e77ea949cba?q=80&w=3075&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", // Humayun's Tomb, Delhi
    ],
  };

  // Handle booking
  const handleBookNow = () => {
    if (!selectedDate) {
      alert("Please select a starting date");
      return;
    }

    // In a real app, you'd call your booking API here
    console.log("Booking details:", {
      packageId: packageData.id,
      startDate: selectedDate,
      adults: adultCount,
      children: childCount,
      infants: infantCount,
      totalAmount: packageData.price * (adultCount + childCount * 0.7),
    });

    // Redirect to confirmation page or show confirmation modal
    alert("Booking successful!");
  };

  // Handle download itinerary
  const handleDownloadItinerary = () => {
    // In a real app, you'd generate/download a PDF here
    console.log("Downloading itinerary...");
  };

  // Handle date selection
  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  // Add this handler function
  const handleDurationChange = (duration) => {
    setSelectedDuration(duration);

    // Update package details based on the duration selected
    console.log(`Selected duration: ${duration}`);

    // Update package nights and days based on selection
    if (duration === "11n12d") {
      // Update for 11 nights package
      packageData.nights = 11;
      packageData.days = 12;
      // Example: setPricePerPerson(18500);
    } else if (duration === "12n13d") {
      // Update for 12 nights package
      packageData.nights = 12;
      packageData.days = 13;
      // Example: setPricePerPerson(20500);
    }
  };

  // Toggle mobile booking drawer
  const toggleBookingDrawer = () => {
    setIsBookingDrawerOpen(!isBookingDrawerOpen);
    // If drawer is being closed, prevent scrolling of background
    document.body.style.overflow = !isBookingDrawerOpen ? "hidden" : "";
  };

  // Close drawer when clicking overlay
  const closeDrawer = () => {
    setIsBookingDrawerOpen(false);
    document.body.style.overflow = "";
  };

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // Toggle show all reviews with smooth scroll
  const toggleShowAllReviews = () => {
    const newState = !showAllReviews;
    setShowAllReviews(newState);

    // When toggling to show more reviews, we'll let the ref handle scrolling
    // When toggling to show fewer, scroll to the top of reviews section
    if (!newState && activeTab === "reviews") {
      setTimeout(() => {
        const reviewsSection = document.querySelector(".reviews-section");
        if (reviewsSection) {
          reviewsSection.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
    }
  };

  // Add this handler function for stay category selection
  const handleStayCategoryChange = (category) => {
    setSelectedStayCategory(category);

    // Update package prices based on stay category
    console.log(`Selected stay category: ${category}`);

    // If you need to update package prices based on selection:
    if (category === "budget") {
      // Update for budget stay package
      // Example: setPricePerPerson(18000);
    } else if (category === "standard") {
      // Update for standard stay package
      // Example: setPricePerPerson(20500);
    } else if (category === "luxury") {
      // Update for luxury stay package
      // Example: setPricePerPerson(25000);
    }
  };

  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
    const tabContent = document.querySelector('.tab-content');
    if (tabContent) {
      const offset = 80; // Adjust this value based on your sticky header height
      const elementPosition = tabContent.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <>
      <GlobalCarouselStyle />
      <main className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left content section - takes up 2/3 on desktop */}
            <div className="w-full lg:w-2/3">
              {/* Image Gallery */}
              <div className="mb-3">
                {/* Desktop grid view - hidden on mobile */}
                <div className="hidden md:grid grid-cols-4 gap-4">
                  {/* Main large image */}
                  <div className="col-span-4 md:col-span-2 lg:col-span-2 relative rounded-tl-2xl rounded-bl-2xl overflow-hidden">
                    <div className="relative aspect-[3/2] h-full w-full">
                      <Image
                        src={packageData.images[0]}
                        alt={packageData.title}
                        fill
                        className="object-cover"
                        blurDataURL="/blur.webp"
                        placeholder="blur"
                        priority
                      />
                      {packageData.isCertified && (
                        <span className="absolute top-4 left-4 bg-white text-gray-800 border border-gray-200 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 shadow-sm">
                          <i className="fi fi-br-badge-check"></i>
                          Certified
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Small images */}
                  <div className="col-span-2 md:col-span-1 lg:col-span-1 grid grid-rows-2 gap-4">
                    <div className="relative overflow-hidden aspect-square">
                      <Image
                        src={packageData.images[1]}
                        alt={`${packageData.title} - image 2`}
                        fill
                        blurDataURL="/blur.webp"
                        placeholder="blur"
                        className="object-cover"
                      />
                    </div>
                    <div className="relative overflow-hidden aspect-square">
                      <Image
                        src={packageData.images[2]}
                        alt={`${packageData.title} - image 3`}
                        fill
                        blurDataURL="/blur.webp"
                        placeholder="blur"
                        className="object-cover"
                      />
                    </div>
                  </div>

                  {/* Another set of small images */}
                  <div className="col-span-2 md:col-span-1 lg:col-span-1 grid grid-rows-2 gap-4">
                    <div className="relative rounded-tr-2xl overflow-hidden aspect-square">
                      <Image
                        src={packageData.images[3]}
                        alt={`${packageData.title} - image 4`}
                        fill
                        blurDataURL="/blur.webp"
                        placeholder="blur"
                        className="object-cover"
                      />
                    </div>
                    <div className="relative rounded-br-2xl overflow-hidden aspect-square">
                      <Image
                        src={packageData.images[4]}
                        alt={`${packageData.title} - image 5`}
                        fill
                        blurDataURL="/blur.webp"
                        placeholder="blur"
                        className="object-cover"
                        sizes="(max-width: 768px) 50vw, 25vw"
                      />
                      <div className="absolute bottom-4 left-0 right-3 flex justify-end">
                        <button
                          className="bg-white bg-opacity-50 w-[85%] h-8 rounded-full flex items-center justify-center text-gray-800 text-sm font-medium cursor-pointer"
                          onClick={() => setIsGalleryOpen(true)}
                        >
                          <span>See all photos (10)</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mobile carousel view - visible only on mobile */}
                <div className="md:hidden">
                  <Slider
                    dots={false}
                    infinite={true}
                    speed={500}
                    slidesToShow={1}
                    slidesToScroll={1}
                    autoplay={true}
                    autoplaySpeed={4000}
                    pauseOnHover={true}
                    arrows={false}
                    centerMode={true}
                    centerPadding="20px"
                    className="gallery-slider !px-0"
                  >
                    {packageData.images.map((image, index) => (
                      <div
                        key={index}
                        className="relative h-[250px] sm:h-[350px] px-2"
                      >
                        <div className="h-full w-full relative overflow-hidden rounded-lg">
                          <Image
                            src={image}
                            alt={`${packageData.title} - image ${index + 1}`}
                            fill
                            sizes="(max-width: 640px) 100vw, 640px"
                            className="object-cover"
                            priority={index === 0}
                            blurDataURL="/blur.webp"
                            placeholder="blur"
                          />
                          {index === 0 && packageData.isCertified && (
                            <span className="absolute top-4 left-4 bg-white text-gray-800 border border-gray-200 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 z-10">
                              <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M21.5 12C21.5 17.2467 17.2467 21.5 12 21.5C6.75329 21.5 2.5 17.2467 2.5 12C2.5 6.75329 6.75329 2.5 12 2.5C17.2467 2.5 21.5 6.75329 21.5 12Z"
                                  stroke="#10B981"
                                  strokeWidth="1.5"
                                />
                                <path
                                  d="M16 9L10.5 14.5L8 12"
                                  stroke="#10B981"
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                              Certified
                            </span>
                          )}
                          {index === packageData.images.length - 1 && (
                            <div className="absolute bottom-4 left-0 right-0 flex justify-center z-10">
                              <button
                                className="bg-black bg-opacity-50 w-[70%] h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                                onClick={() => setIsGalleryOpen(true)}
                              >
                                <span>See More (10)</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </Slider>
                </div>
              </div>

              {/* Package title */}
              <h1 className="text-2xl md:text-3xl tracking-tight font-semibold text-gray-800 mb-6">
                {packageData.title}
              </h1>

              {/* Choose Trip Duration */}
              <div className="mb-8">
                <h3 className="text-base font-semibold text-gray-800 mb-4">
                  Choose Trip Duration
                </h3>
                <div className="flex flex-wrap gap-3">
                  {/* 11 Nights / 12 Days option */}
                  <button
                    className={`flex items-center justify-center border rounded-full py-1 px-2 text-sm cursor-pointer transition-all ${
                      selectedDuration === "11n12d"
                        ? "border-gray-500 bg-gray-50 text-gray-800 border-2 shadow-sm"
                        : "border-gray-200 text-gray-700 hover:bg-gray-50 border-2 hover:border-gray-300"
                    }`}
                    onClick={() => handleDurationChange("11n12d")}
                  >
                    <div className="w-6 h-6 md:w-8 md:h-8 rounded-full overflow-hidden mr-3 shadow-sm">
                      <Image
                        src="https://images.unsplash.com/photo-1523478482487-1eed2b3d9939?q=80&w=1100&auto=format&fit=crop"
                        alt="11 Nights"
                        width={32}
                        height={32}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <span
                      className={`${
                        selectedDuration === "11n12d" ? "font-bold" : ""
                      } whitespace-nowrap`}
                    >
                      11 N / 12 D
                    </span>
                  </button>

                  {/* 12 Nights / 13 Days option */}
                  <button
                    className={`flex items-center justify-center border rounded-full py-1 px-2 text-sm cursor-pointer transition-all ${
                      selectedDuration === "12n13d"
                        ? "border-gray-500 bg-gray-50 text-gray-800 border-2 shadow-sm"
                        : "border-gray-200 text-gray-700 hover:bg-gray-50 border-2 hover:border-gray-300"
                    }`}
                    onClick={() => handleDurationChange("12n13d")}
                  >
                    <div className="w-6 h-6 md:w-8 md:h-8 rounded-full overflow-hidden mr-3 shadow-sm">
                      <Image
                        src="https://images.unsplash.com/photo-1490077476659-095159692ab5?q=80&w=1100&auto=format&fit=crop"
                        alt="12 Nights"
                        width={32}
                        height={32}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <span
                      className={`${
                        selectedDuration === "12n13d" ? "font-bold" : ""
                      } whitespace-nowrap`}
                    >
                      12 N / 13 D
                    </span>
                  </button>
                </div>
              </div>

              {/* Choose Stay Category */}
              <div className="mb-8">
                <h3 className="text-base font-semibold text-gray-800 mb-4">
                  Choose Stay Category
                </h3>
                <div className="flex flex-wrap gap-4">
                  {/* Budget Stay option */}
                  <label className={`bg-[#F7F7F7] flex items-center border rounded-full py-2 px-2 text-sm cursor-pointer transition-all ${
                    selectedStayCategory === "budget"
                      ? "border-gray-100 bg-[#dfeeff] text-[#0057C9] border-1 font-medium"
                      : "border-gray-200 text-gray-700 hover:bg-gray-50 border-1 hover:border-gray-300 font-medium"
                  }`}>
                    <input
                      type="radio"
                      name="stayCategory"
                      value="budget"
                      checked={selectedStayCategory === "budget"}
                      onChange={() => handleStayCategoryChange("budget")}
                      className="sr-only" // Hide the actual radio input
                    />
                    <div className="flex items-center">
                      <div className={`w-4 h-4 rounded-full border flex-shrink-0 flex justify-center items-center mr-2 ${
                        selectedStayCategory === "budget" 
                          ? "border-[#0057C9] bg-white" 
                          : "border-gray-400 bg-white"
                      }`}>
                        {selectedStayCategory === "budget" && (
                          <div className="w-2 h-2 rounded-full bg-[#0057C9] m-auto flex items-center justify-center"></div>
                        )}
                      </div>
                      <span className={`font-medium ${
                        selectedStayCategory === "budget" ? "font-medium" : ""
                      } whitespace-nowrap`}>
                        Budget Stay
                      </span>
                    </div>
                  </label>

                  {/* Standard Stay option */}
                  <label className={`bg-[#F7F7F7] flex items-center border rounded-full py-2 px-2 text-sm cursor-pointer transition-all ${
                    selectedStayCategory === "standard"
                      ? "border-gray-100 bg-[#dfeeff] text-[#0057C9] border-1 font-medium"
                      : "border-gray-200 text-gray-700 hover:bg-gray-50 border-1 hover:border-gray-300 font-medium"
                  }`}>
                    <input
                      type="radio"
                      name="stayCategory"
                      value="standard"
                      checked={selectedStayCategory === "standard"}
                      onChange={() => handleStayCategoryChange("standard")}
                      className="sr-only" // Hide the actual radio input
                    />
                    <div className="flex items-center">
                      <div className={`w-4 h-4 rounded-full border flex-shrink-0 flex justify-center items-center mr-2 ${
                        selectedStayCategory === "standard" 
                          ? "border-[#0057C9] bg-white" 
                          : "border-gray-400 bg-white"
                      }`}>
                        {selectedStayCategory === "standard" && (
                          <div className="w-2 h-2 rounded-full bg-[#0057C9] m-auto flex items-center justify-center"></div>
                        )}
                      </div>
                      <span className={`${
                        selectedStayCategory === "standard" ? "font-medium" : ""
                      } whitespace-nowrap`}>
                        Standard Stay
                      </span>
                    </div>
                  </label>

                  {/* Luxury Stay option */}
                  <label className={`bg-[#F7F7F7] flex items-center border rounded-full py-2 px-4 text-sm cursor-pointer transition-all ${
                    selectedStayCategory === "luxury"
                      ? "border-gray-100 bg-[#dfeeff] text-[#0057C9] border-1 font-medium"
                      : "border-gray-200 text-gray-700 hover:bg-gray-50 border-1 hover:border-gray-300 font-medium"
                  }`}>
                    <input
                      type="radio"
                      name="stayCategory"
                      value="luxury"
                      checked={selectedStayCategory === "luxury"}
                      onChange={() => handleStayCategoryChange("luxury")}
                      className="sr-only" // Hide the actual radio input
                    />
                    <div className="flex items-center">
                      <div className={`w-4 h-4 rounded-full border flex-shrink-0 flex justify-center items-center mr-2 ${
                        selectedStayCategory === "luxury" 
                          ? "border-[#0057C9] bg-white" 
                          : "border-gray-400 bg-white"
                      }`}>
                        {selectedStayCategory === "luxury" && (
                          <div className="w-2 h-2 rounded-full bg-[#0057C9] m-auto flex items-center justify-center"></div>
                        )}
                      </div>
                      <span className={`${
                        selectedStayCategory === "luxury" ? "font-medium" : ""
                      } whitespace-nowrap`}>
                        Luxury Stay
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Trip Details */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 py-6 border-t  border-gray-200 my-7 mb-0">
                <div className="flex items-center">
                  <i className="fi fi-rr-bus text-primary-500 text-lg mt-0.5 mr-3 flex-shrink-0"></i>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Transportation</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <i className="fi fi-rr-building text-primary-500 text-lg mt-0.5 mr-3 flex-shrink-0"></i>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Accommodation</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <i className="fi fi-rr-restaurant text-primary-500 text-lg mt-0.5 mr-3 flex-shrink-0"></i>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Food</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <i className="fi fi-rr-ticket text-primary-500 text-lg mt-0.5 mr-3 flex-shrink-0"></i>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Entry Ticket</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <i className="fi fi-rr-user text-primary-500 text-lg mt-0.5 mr-3 flex-shrink-0"></i>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Guide</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <i className="fi fi-rr-car-side text-primary-500 text-lg mt-0.5 mr-3 flex-shrink-0"></i>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Jeep Safari</p>
                  </div>
                </div>
              </div>

              {/* Tabs Navigation - Sticky */}
              <div className="sticky top-0 bg-white z-20 border-b border-gray-200 mb-8">
                <div className="relative">
                  <nav className="flex overflow-x-auto -mb-px space-x-4 py-4 scrollbar-hide no-scrollbar pr-12">
                    <button
                      className={`whitespace-nowrap text-sm font-medium cursor-pointer ${
                        activeTab === "details"
                          ? "bg-gray-900 text-white rounded-full px-4 py-2 font-medium"
                          : "text-gray-500 hover:bg-gray-100 hover:text-gray-700 px-4 py-2 rounded-full font-medium"
                      }`}
                      onClick={() => {
                        setActiveTab("details");
                        // Scroll to tab content
                        const tabContent = document.querySelector('.tab-content');
                        if (tabContent) {
                          tabContent.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                      }}
                    >
                      Details
                    </button>
                    <button
                      className={`whitespace-nowrap text-sm font-medium cursor-pointer ${
                        activeTab === "itinerary"
                          ? "bg-gray-900 text-white rounded-full px-4 py-2 font-medium"
                          : "text-gray-500 hover:bg-gray-100 hover:text-gray-700 px-4 py-2 rounded-full font-medium"
                      }`}
                      onClick={() => {
                        setActiveTab("itinerary");
                        // Scroll to tab content
                        const tabContent = document.querySelector('.tab-content');
                        if (tabContent) {
                          tabContent.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                      }}
                    >
                      Itinerary
                    </button>
                    <button
                      className={`whitespace-nowrap text-sm font-medium cursor-pointer ${
                        activeTab === "stay"
                          ? "bg-gray-900 text-white rounded-full px-4 py-2 font-medium"
                          : "text-gray-500 hover:bg-gray-100 hover:text-gray-700 px-4 py-2 rounded-full font-medium"
                      }`}
                      onClick={() => {
                        setActiveTab("stay");
                        // Scroll to tab content
                        const tabContent = document.querySelector('.tab-content');
                        if (tabContent) {
                          tabContent.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                      }}
                    >
                      Stay
                    </button>
                    <button
                      className={`whitespace-nowrap text-sm font-medium cursor-pointer ${
                        activeTab === "inclusion"
                          ? "bg-gray-900 text-white rounded-full px-4 py-2 font-medium"
                          : "text-gray-500 hover:bg-gray-100 hover:text-gray-700 px-4 py-2 rounded-full font-medium"
                      }`}
                      onClick={() => {
                        setActiveTab("inclusion");
                        // Scroll to tab content
                        const tabContent = document.querySelector('.tab-content');
                        if (tabContent) {
                          tabContent.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                      }}
                    >
                      Inclusion & Exclusion
                    </button>
                    <button
                      className={`whitespace-nowrap text-sm font-medium cursor-pointer ${
                        activeTab === "terms"
                          ? "bg-gray-900 text-white rounded-full px-4 py-2 font-medium"
                          : "text-gray-500 hover:bg-gray-100 hover:text-gray-700 px-4 py-2 rounded-full font-medium"
                      }`}
                      onClick={() => {
                        setActiveTab("terms");
                        // Scroll to tab content
                        const tabContent = document.querySelector('.tab-content');
                        if (tabContent) {
                          tabContent.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                      }}
                    >
                      Terms and Conditions
                    </button>
                    <button
                      className={`whitespace-nowrap text-sm font-medium cursor-pointer ${
                        activeTab === "cancellation"
                          ? "bg-gray-900 text-white rounded-full px-4 py-2 font-medium"
                          : "text-gray-500 hover:bg-gray-100 hover:text-gray-700 px-4 py-2 rounded-full font-medium"
                      }`}
                      onClick={() => {
                        setActiveTab("cancellation");
                        // Scroll to tab content
                        const tabContent = document.querySelector('.tab-content');
                        if (tabContent) {
                          tabContent.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                      }}
                    >
                      Cancellation Policy
                    </button>
                    <button
                      className={`whitespace-nowrap text-sm font-medium cursor-pointer ${
                        activeTab === "reviews"
                          ? "bg-gray-900 text-white rounded-full px-4 py-2 font-medium"
                          : "text-gray-500 hover:bg-gray-100 hover:text-gray-700 px-4 py-2 rounded-full font-medium"
                      }`}
                      onClick={() => {
                        setActiveTab("reviews");
                        // Scroll to tab content
                        const tabContent = document.querySelector('.tab-content');
                        if (tabContent) {
                          tabContent.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                      }}
                    >
                      Reviews
                    </button>
                  </nav>

                  <button
                    className="absolute right-0 top-1/2 -translate-y-1/2 h-8 w-8 bg-white text-gray-800 border border-gray-200 rounded-full flex items-center justify-center shadow-md z-10"
                    onClick={() => {
                      const container =
                        document.querySelector(".overflow-x-auto");
                      container.scrollBy({ left: 200, behavior: "smooth" });
                    }}
                  >
                    <i className="fi fi-rr-angle-small-right relative top-[2px]"></i>
                  </button>
                </div>
              </div>

              {/* Tab Content */}
              <div className="tab-content pt-4 text-sm">
                {activeTab === "details" && (
                  <div className="prose max-w-none text-gray-800">
                    {/* Main description */}
                    <p className="text-gray-800 leading-relaxed">
                      Embark on a 12-day, 13-night journey through India&apos;s most
                      iconic destinations. Experience the royal heritage of
                      Rajasthan, the golden desert landscapes of Jaisalmer, and
                      the serene valleys of Kashmir. Visit Amritsar to witness
                      the peaceful beauty of the Golden Temple, explore the rich
                      history of Delhi, and marvel at the Taj Mahal in Agra.
                      This tour blends history, culture, and natural beauty for
                      an unforgettable experience. Perfect for history buffs,
                      nature lovers, and those seeking spiritual enrichment,
                      this journey will leave you with lasting memories.
                    </p>

                    <h3 className="text-base font-semibold text-gray-800 mt-6 mb-4">
                      Highlights of this trip
                    </h3>

                    <ul className="space-y-4 text-gray-800">
                      <li className="flex items-start">
                        <span className="text-primary-500 mr-2 font-bold">
                          •
                        </span>
                        <div>
                          <span className="font-medium text-gray-800">
                            Explore Iconic Destinations:
                          </span>{' '}
                          Visit the royal heritage of Rajasthan, the golden
                          desert of Jaisalmer, the serene landscapes of Kashmir,
                          and the historic landmarks of Delhi and Agra.
                        </div>
                      </li>
                      <li className="flex items-start">
                        <span className="text-primary-500 mr-2 font-bold">
                          •
                        </span>
                        <div>
                          <span className="font-medium text-gray-800">
                            Cultural & Spiritual Immersion:
                          </span>{' '}
                          Experience the spiritual serenity of Amritsar&apos;s Golden
                          Temple and discover India&apos;s rich history and culture
                          throughout the journey.
                        </div>
                      </li>
                      <li className="flex items-start">
                        <span className="text-primary-500 mr-2 font-bold">
                          •
                        </span>
                        <div>
                          <span className="font-medium text-gray-800">
                            Natural Beauty:
                          </span>{' '}
                          Witness diverse landscapes from desert dunes to
                          mountain valleys, providing breathtaking views and
                          photography opportunities.
                        </div>
                      </li>
                      <li className="flex items-start">
                        <span className="text-primary-500 mr-2 font-bold">
                          •
                        </span>
                        <div>
                          <span className="font-medium text-gray-800">
                            Historical Significance:
                          </span>{' '}
                          Explore UNESCO World Heritage sites, ancient forts,
                          and monuments that tell the story of India&apos;s
                          fascinating past.
                        </div>
                      </li>
                    </ul>

                    {/* Trip details in pill layout with fixed icons */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6 py-6 border-t border-b border-gray-200 my-8">
                      <div className="flex items-start">
                        <i className="fi fi-rr-time-quarter-past text-primary-500 text-lg mt-0.5 mr-3 flex-shrink-0"></i>
                        <div>
                          <p className="text-sm text-gray-500">Duration</p>
                          <p className="font-medium text-gray-800">
                            12 Days 11 Nights
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start">
                        <i className="fi fi-rr-marker text-primary-500 text-lg mt-0.5 mr-3 flex-shrink-0"></i>
                        <div>
                          <p className="text-sm text-gray-500">
                            Starting Location
                          </p>
                          <p className="font-medium text-gray-800">Kochi</p>
                        </div>
                      </div>

                      <div className="flex items-start">
                        <i className="fi fi-rr-car-side text-primary-500 text-lg mt-0.5 mr-3 flex-shrink-0"></i>
                        <div>
                          <p className="text-sm text-gray-500">Pickup Point</p>
                          <p className="font-medium text-gray-800">Rajasthan</p>
                        </div>
                      </div>

                      <div className="flex items-start">
                        <i className="fi fi-rr-alarm-clock text-primary-500 text-lg mt-0.5 mr-3 flex-shrink-0"></i>
                        <div>
                          <p className="text-sm text-gray-500">Pickup Time</p>
                          <p className="font-medium text-gray-800">6:30 am</p>
                        </div>
                      </div>

                      <div className="flex items-start">
                        <i className="fi fi-rr-map-marker text-primary-500 text-lg mt-0.5 mr-3 flex-shrink-0"></i>
                        <div>
                          <p className="text-sm text-gray-500">
                            Drop Off Point
                          </p>
                          <p className="font-medium text-gray-800">Agra</p>
                        </div>
                      </div>

                      <div className="flex items-start">
                        <i className="fi fi-rr-alarm-clock text-primary-500 text-lg mt-0.5 mr-3 flex-shrink-0"></i>
                        <div>
                          <p className="text-sm text-gray-500">Drop Off Time</p>
                          <p className="font-medium text-gray-800">10:30 pm</p>
                        </div>
                      </div>
                    </div>

                    {/* Additional Information Section as Accordion */}
                    <Accordion
                      title="Additional information"
                      defaultOpen={false}
                    >
                      <ul className="space-y-4">
                        <li className="flex items-start">
                          <span className="text-primary-500 mr-2 font-bold">
                            •
                          </span>
                          <p className="text-gray-800">
                            Booking Confirmation: You will receive a
                            confirmation email with all travel details upon
                            successful booking.
                          </p>
                        </li>

                        <li className="flex items-start">
                          <span className="text-primary-500 mr-2 font-bold">
                            •
                          </span>
                          <p className="text-gray-800">
                            Group Size: This is a group tour with a limited
                            number of participants to ensure comfort and
                            personal attention.
                          </p>
                        </li>

                        <li className="flex items-start">
                          <span className="text-primary-500 mr-2 font-bold">
                            •
                          </span>
                          <p className="text-gray-800">
                            Guide Services: Experienced English-speaking guides
                            will accompany you at major destinations for
                            sightseeing and assistance.
                          </p>
                        </li>

                        <li className="flex items-start">
                          <span className="text-primary-500 mr-2 font-bold">
                            •
                          </span>
                          <p className="text-gray-800">
                            Luggage Policy: One medium-sized suitcase and one
                            hand luggage per person is allowed. Please travel
                            light for ease of movement.
                          </p>
                        </li>

                        <li className="flex items-start">
                          <span className="text-primary-500 mr-2 font-bold">
                            •
                          </span>
                          <p className="text-gray-800">
                            Child Policy: Children below a certain age may
                            travel at discounted rates or free. Please check age
                            limits before booking.
                          </p>
                        </li>

                        <li className="flex items-start">
                          <span className="text-primary-500 mr-2 font-bold">
                            •
                          </span>
                          <p className="text-gray-800">
                            Airport Transfers: Complimentary airport pickup and
                            drop included as per the itinerary.
                          </p>
                        </li>

                        <li className="flex items-start">
                          <span className="text-primary-500 mr-2 font-bold">
                            •
                          </span>
                          <p className="text-gray-800">
                            Emergency Support: 24/7 on-tour assistance provided
                            for any medical or logistical concerns.
                          </p>
                        </li>

                        <li className="flex items-start">
                          <span className="text-primary-500 mr-2 font-bold">
                            •
                          </span>
                          <p className="text-gray-800">
                            Custom Requests: Special requests such as early
                            check-in, dietary needs, or wheelchair access can be
                            arranged upon prior notice.
                          </p>
                        </li>
                      </ul>
                    </Accordion>

                    {/* Frequently Asked Questions */}
                    <h3 className="text-base font-semibold text-gray-800 mt-8 mb-4">
                      Frequently Asked Questions
                    </h3>

                    <Accordion
                      title="What is the best time to take this tour?"
                      defaultOpen={false}
                    >
                      <p className="text-gray-800">
                        The ideal time to take this tour is from October to
                        March, when the weather is cool and comfortable. This
                        season is perfect for exploring destinations like
                        Rajasthan and Kashmir, which are at their scenic best.
                      </p>
                    </Accordion>

                    <Accordion
                      title="Are meals included in the package?"
                      defaultOpen={false}
                    >
                      <p className="text-gray-800">
                        Yes, most meals are included. The package includes daily
                        breakfast at all hotels, lunch during sightseeing days,
                        and dinner at select locations. Some meals may be at
                        your own expense to allow you to explore local cuisine
                        on your own.
                      </p>
                    </Accordion>

                    <Accordion
                      title="Is this trip suitable for children or elderly travelers?"
                      defaultOpen={false}
                    >
                      <p className="text-gray-800">
                        This tour is suitable for children above 5 years and
                        adults up to 70 years who are in good health. Some
                        destinations involve walking on uneven terrain and
                        stairs. For elderly travelers or those with mobility
                        concerns, we can customize the itinerary to ensure
                        comfort.
                      </p>
                    </Accordion>

                    <Accordion
                      title="How do I book the tour?"
                      defaultOpen={false}
                    >
                      <p className="text-gray-800">
                        Booking is simple! You can book directly through our website by selecting your preferred dates and number of travelers, then following the checkout process. Alternatively, you can contact our customer service team by phone or email for assistance with your booking. A 25% deposit is required to confirm your reservation, with the balance due 30 days before departure.
                      </p>
                    </Accordion>
                  </div>
                )}

                {activeTab === "stay" && (
                  <div className="prose max-w-none text-gray-800">
                    {/* Rajasthan Section */}
                    <div className="mb-10">
                      <div className="flex items-center justify-between pb-2">
                        <div className="flex items-center bg-gray-100 rounded-full p-2">
                          <i className="fi fi-rr-marker text-gray-800 mr-2 text-sm"></i>
                          <h3 className="text-sm font-medium text-gray-800 mb-0">
                            Rajasthan
                          </h3>
                        </div>
                        <div className="border-t border-dashed border-gray-400 my-2 flex-1 mx-4"></div>
                        <div className="flex items-center justify-center text-gray-700 bg-gray-100 rounded-full p-2">
                          <i className="fi fi-rr-moon text-gray-800 mr-1 text-sm"></i>
                          <span className="font-medium text-sm">3 Nights</span>
                        </div>
                      </div>

                      {/* Hotels in Rajasthan */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
                        {/* Hotel 1 */}
                        <div className="flex gap-4 bg-[#f7f7f7] p-2 rounded-2xl">
                          <div className="relative flex-shrink-0 w-28 h-32">
                            <div className="bg-white absolute z-10 px-2.5 py-0.5 rounded-full text-xs font-medium top-2 left-2">
                              2 N
                            </div>
                            <Image
                              src="https://images.unsplash.com/photo-1661016630713-67e36bfc2285?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                              alt="Udaipur Palace"
                              className="w-full h-full object-cover rounded-2xl"
                              width={112}
                              height={112}
                              blurDataURL="/blur.webp"
                              placeholder="blur"
                            />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-base font-medium text-gray-800 mb-2">
                             Udaipur City Palace Hotel
                            </h4>
                            <div className="mb-2">
                              <div>
                                <div className="flex items-center mb-1">
                                  <i className="fi fi-rr-marker text-gray-700 mr-2 flex-shrink-0 text-sm"></i>
                                  <p className="text-gray-800 text-xs font-medium mb-0">Location</p>
                                </div>
                                <p className="text-gray-800 text-sm font-medium">Udaipur, Rajasthan</p>
                              </div>
                            </div>
                            <div className="mt-2">
                              <div className="flex items-center mb-1">
                                <i className="fi fi-rr-globe text-gray-800 mr-2 flex-shrink-0 text-sm"></i>
                                <p className="text-gray-700 text-xs font-medium mb-0">Website</p>
                              </div>
                              <a
                                href="https://hoteludaipurpalace.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-800 flex items-center text-sm font-medium"
                              >
                                hoteludaipurpalace.com
                                <i className="fi fi-rr-arrow-up-right-from-square text-gray-800 ml-1 text-xs"></i>
                              </a>
                            </div>
                          </div>
                        </div>

                        {/* Hotel 2 */}
                        <div className="flex gap-4 bg-[#f7f7f7] p-2 rounded-2xl">
                          <div className="relative flex-shrink-0 w-28 h-32">
                            <div className="bg-white absolute z-10 px-2.5 py-0.5 rounded-full text-xs font-medium top-2 left-2">
                              1 N
                            </div>
                            <Image
                              src="https://images.unsplash.com/photo-1565170594519-25087a51737f?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTl8fGhvdGVsJTIwb3V0c2lkZXxlbnwwfHwwfHx8MA%3D%3D"
                              alt="Chokhi Dhani"
                              className="w-full h-full object-cover rounded-2xl"
                              width={112}
                              height={112}
                              blurDataURL="/blur.webp"
                              placeholder="blur"
                            />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-base font-medium text-gray-800 mb-2">
                              Chokhi Dhani
                            </h4>
                            <div className="mb-2">
                              <div>
                                <div className="flex items-center mb-1">
                                  <i className="fi fi-rr-marker text-gray-800 mr-2 flex-shrink-0 text-sm"></i>
                                  <p className="text-gray-700 text-xs font-medium mb-0">Location</p>
                                </div>
                                <p className="text-gray-800 text-sm font-medium">Jaipur, Rajasthan</p>
                              </div>
                            </div>
                            <div className="mt-2">
                              <div className="flex items-center mb-1">
                                <i className="fi fi-rr-globe text-gray-800 mr-2 flex-shrink-0 text-sm"></i>
                                <p className="text-gray-700 text-xs font-medium mb-0">Website</p>
                              </div>
                              <a
                                href="https://palacechokhidhani.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-800 flex items-center text-sm font-medium"
                              >
                                palacechokhidhani.com
                                <i className="fi fi-rr-arrow-up-right-from-square text-gray-800 ml-1 text-xs"></i>
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Jaisalmer Section */}
                    <div className="mb-10">
                      <div className="flex items-center justify-between pb-2">
                        <div className="flex items-center bg-gray-100 rounded-full p-2">
                          <i className="fi fi-rr-marker text-gray-800 mr-2 text-sm"></i>
                          <h3 className="text-sm font-medium text-gray-800 mb-0">
                            Jaisalmer
                          </h3>
                        </div>
                        <div className="border-t border-dashed border-gray-400 my-2 flex-1 mx-4"></div>
                        <div className="flex items-center justify-center text-gray-700 bg-gray-100 rounded-full p-2">
                          <i className="fi fi-rr-moon text-gray-800 mr-1 text-sm"></i>
                          <span className="font-medium text-sm">2 Nights</span>
                        </div>
                      </div>

                      {/* Hotels in Jaisalmer */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
                        {/* Hotel 1 */}
                        <div className="flex gap-4 bg-[#f7f7f7] p-2 rounded-2xl">
                          <div className="relative flex-shrink-0 w-28 h-32">
                            <div className="bg-white absolute z-10 px-2.5 py-0.5 rounded-full text-xs font-medium top-2 left-2">
                              1 N
                            </div>
                            <Image
                              src="https://images.unsplash.com/photo-1675881884422-daa17f8fbf37?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                              alt="Lal Garh Fort"
                              className="w-full h-full object-cover rounded-2xl"
                              width={112}
                              height={112}
                              blurDataURL="/blur.webp"
                              placeholder="blur"
                            />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-base font-medium text-gray-800 mb-2">
                              Lal Garh Fort
                            </h4>
                            <div className="mb-2">
                              <div>
                                <div className="flex items-center mb-1">
                                  <i className="fi fi-rr-marker text-gray-800 mr-2 flex-shrink-0 text-sm"></i>
                                  <p className="text-gray-700 text-xs font-medium mb-0">Location</p>
                                </div>
                                <p className="text-gray-800 text-sm font-medium">Jaisalmer, Rajasthan</p>
                              </div>
                            </div>
                            <div className="mt-2">
                              <div className="flex items-center mb-1">
                                <i className="fi fi-rr-globe text-gray-800 mr-2 flex-shrink-0 text-sm"></i>
                                <p className="text-gray-700 text-xs font-medium mb-0">Website</p>
                              </div>
                              <a
                                href="https://lalgarhfortpalace.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-800 flex items-center text-sm font-medium"
                              >
                                lalgarhfortpalace.com
                                <i className="fi fi-rr-arrow-up-right-from-square text-gray-800 ml-1 text-xs"></i>
                              </a>
                            </div>
                          </div>
                        </div>

                        {/* Hotel 2 */}
                        <div className="flex gap-4 bg-[#f7f7f7] p-2 rounded-2xl">
                          <div className="relative flex-shrink-0 w-28 h-32">
                            <div className="bg-white absolute z-10 px-2.5 py-0.5 rounded-full text-xs font-medium top-2 left-2">
                              2 N
                            </div>
                            <Image
                              src="https://images.unsplash.com/photo-1694825429050-9d47ca454c7c?q=80&w=3083&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                              alt="Golden Haveli"
                              className="w-full h-full object-cover rounded-2xl"
                              width={112}
                              height={112}
                              blurDataURL="/blur.webp"
                              placeholder="blur"
                            />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-base font-medium text-gray-800 mb-2">
                              Golden Haveli
                            </h4>
                            <div className="mb-2">
                              <div>
                                <div className="flex items-center mb-1">
                                  <i className="fi fi-rr-marker text-gray-800 mr-2 flex-shrink-0 text-sm"></i>
                                  <p className="text-gray-700 text-xs font-medium mb-0">Location</p>
                                </div>
                                <p className="text-gray-800 text-sm font-medium">Jaisalmer, Rajasthan</p>
                              </div>
                            </div>
                            <div className="mt-2">
                              <div className="flex items-center mb-1">
                                <i className="fi fi-rr-globe text-gray-800 mr-2 flex-shrink-0 text-sm"></i>
                                <p className="text-gray-700 text-xs font-medium mb-0">Website</p>
                              </div>
                              <a
                                href="https://goldenhaveli.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-800 flex items-center text-sm font-medium"
                              >
                                goldenhaveli.com
                                <i className="fi fi-rr-arrow-up-right-from-square text-gray-800 ml-1 text-xs"></i>
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "itinerary" && (
                  <div className="prose max-w-none text-gray-800">
                    <h3 className="text-base font-semibold text-gray-800 mb-4">
                      Day by Day Itinerary
                    </h3>

                    <Accordion title="Day 01 - Rajasthan" defaultOpen={true}>
                      <div className="">
                        <h4 className="text-[15px] font-semibold text-gray-800 mb-3">
                          <i className="fi fi-br-map-marker-check text-primary-500 mr-2"></i>
                          Attraction / Activity
                        </h4>

                        {/* Carousel for attractions */}
                        <div className="mb-8 w-full">
                          <Slider
                            dots={true}
                            infinite={true}
                            speed={500}
                            slidesToShow={3}
                            slidesToScroll={1}
                            autoplay={true}
                            autoplaySpeed={3000}
                            centerMode={true}
                            variableWidth={false}
                            arrows={false}
                            responsive={[
                              {
                                breakpoint: 1024,
                                settings: {
                                  slidesToShow: 2,
                                  slidesToScroll: 1,
                                  infinite: true,
                                  dots: true,
                                  arrows: false,
                                },
                              },
                              {
                                breakpoint: 768,
                                settings: {
                                  slidesToShow: 1,
                                  slidesToScroll: 1,
                                  initialSlide: 0,
                                  centerMode: true,
                                  arrows: false,
                                  centerPadding: "20px",
                                },
                              },
                            ]}
                            className="attraction-slider !px-0"
                          >
                            <div className="px-1 w-full">
                              <div className="flex flex-col h-full">
                                <div className="relative h-40 rounded-lg overflow-hidden mb-2">
                                  <Image
                                    src="https://images.unsplash.com/photo-1638904998527-a451c1fbd1cb?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                                    alt="Birla Mandir"
                                    fill
                                    blurDataURL="/blur.webp"
                                    placeholder="blur"
                                    className="object-cover"
                                  />
                                </div>
                                <p className="font-medium text-gray-800">
                                  Birla Mandir
                                </p>
                              </div>
                            </div>

                            <div className="px-1 w-full">
                              <div className="flex flex-col h-full">
                                <div className="relative h-40 rounded-lg overflow-hidden mb-2">
                                  <Image
                                    src="https://images.unsplash.com/photo-1671727337717-d2c641eda1d8?q=80&w=3087&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                                    alt="Amber Palace"
                                    fill
                                    blurDataURL="/blur.webp"
                                    placeholder="blur"
                                    className="object-cover"
                                  />
                                </div>
                                <p className="font-medium text-gray-800">
                                  Amber Palace
                                </p>
                              </div>
                            </div>

                            <div className="px-1 w-full">
                              <div className="flex flex-col h-full">
                                <div className="relative h-40 rounded-lg overflow-hidden mb-2">
                                  <Image
                                    src="https://images.unsplash.com/photo-1667849357640-c5d7cf5ba96e?q=80&w=2942&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                                    alt="Lake Pichola"
                                    fill
                                    blurDataURL="/blur.webp"
                                    placeholder="blur"
                                    className="object-cover"
                                  />
                                </div>
                                <p className="font-medium text-gray-800">
                                  Lake Pichola
                                </p>
                              </div>
                            </div>

                            <div className="px-1 w-full">
                              <div className="flex flex-col h-full">
                                <div className="relative h-40 rounded-lg overflow-hidden mb-2">
                                  <Image
                                    src="https://images.unsplash.com/photo-1570638013975-fa2b3c9525b2?q=80&w=1000&auto=format&fit=crop"
                                    alt="City Palace"
                                    fill
                                    blurDataURL="/blur.webp"
                                    placeholder="blur"
                                    className="object-cover"
                                  />
                                </div>
                                <p className="font-medium text-gray-800">
                                  City Palace
                                </p>
                              </div>
                            </div>
                          </Slider>
                        </div>

                        <h4 className="text-[15px] font-semibold mb-3 flex items-center">
                          <i className="fi fi-br-marker text-primary-500 mr-2"></i>
                          Arrival & Rajasthan City Tour
                        </h4>

                        <div className="mb-4">
                          <h5 className="font-medium text-gray-800 mb-1">
                            Morning Arrival
                          </h5>
                          <p className="text-gray-800">
                            Reach Rajasthan and meet our representative for a
                            smooth hotel transfer and freshen-up.
                          </p>
                        </div>

                        <div className="mb-4">
                          <h5 className="font-medium text-gray-800 mb-1">
                            Temple Visit
                          </h5>
                          <p className="text-gray-800">
                            Begin your day with a visit to the majestic
                            Akshardham Temple, celebrated for its exquisite
                            architecture and serene spiritual atmosphere.
                          </p>
                        </div>

                        <div className="mb-4">
                          <h5 className="font-medium text-gray-800 mb-1">
                            Cultural Exploration
                          </h5>
                          <p className="text-gray-800">
                            In the afternoon, discover the intricately designed
                            Adalaj Stepwell, followed by a visit to Sabarmati
                            Ashram, the residence of Mahatma Gandhi that
                            reflects India&apos;s freedom struggle.
                          </p>
                        </div>

                        <div className="mb-4">
                          <h5 className="font-medium text-gray-800 mb-1">
                            Leisure Walk
                          </h5>
                          <p className="text-gray-800">
                            Enjoy a peaceful stroll along the Sabarmati
                            Riverfront, offering scenic views and a relaxing
                            vibe.
                          </p>
                        </div>

                        <div className="mb-4">
                          <h5 className="font-medium text-gray-800 mb-1">
                            Evening Drop
                          </h5>
                          <p className="text-gray-800">
                            At 9:00 PM, you&apos;ll be dropped off at Sabarmati BG
                            Railway Station.
                          </p>
                        </div>

                        <div>
                          <h5 className="font-medium text-gray-800 mb-1">
                            Overnight Train Journey
                          </h5>
                          <p className="text-gray-800">
                            Depart for Jaisalmer at 10:15 PM by SBIB JSM Express
                            (20492).
                          </p>
                        </div>
                        
                        {/* Meal Inclusion Display */}
                        <div className="grid grid-cols-2 md:grid-cols-3 rounded-lg overflow-hidden mt-6 bg-[#f7f7f7] p-2">
                          <div className="flex-1 py-1 px-1 md:py-3 md:px-4 flex  items-start lg:items-center  md:border-r border-gray-200">
                            {/* icon */}
                            <div className="">
                              <i className="fi fi-rr-sandwich text-primary-500 mr-2 text-lg"></i>
                            </div>
                            {/* content */}
                            <div className="mb-1">
                              <div className="font-medium text-sm">Breakfast</div>
                              <div className="text-sm text-gray-600">Included</div>
                            </div>

                          </div>
                          
                          <div className="flex-1 py-1 px-1 md:py-3 md:px-4 flex flex-col items-start lg:items-center md:border-r border-gray-200">
                            <div className="flex items-start md:items-center mb-1">
                              <i className="fi fi-rr-utensils text-primary-500 mr-2 text-lg"></i>
                              <span className="font-medium text-sm">Lunch</span>
                            </div>
                            <span className="text-sm text-gray-600">Not Included</span>
                          </div>
                          
                          <div className="flex-1 py-1 px-1 md:py-3 md:px-4 flex flex-col items-start lg:items-center text-lg">
                            <div className="flex items-start md:items-center mb-1">
                              <i className="fi fi-rr-room-service text-primary-500 mr-2"></i>
                              <span className="font-medium text-sm">Dinner</span>
                            </div>
                            <span className="text-sm text-gray-600">Included</span>
                          </div>
                        </div>
                      </div>
                    </Accordion>

                    <Accordion title="Day 02 - Jaisalmer" defaultOpen={false}>
                      <div className="">
                        <h4 className="text-[15px] font-semibold text-gray-800 mb-3">
                          Attraction / Activity
                        </h4>

                        {/* Carousel for Jaisalmer attractions */}
                        <div className="mb-8 w-full">
                          <Slider
                            dots={true}
                            infinite={true}
                            speed={500}
                            slidesToShow={3}
                            slidesToScroll={1}
                            autoplay={true}
                            autoplaySpeed={3000}
                            centerMode={true}
                            variableWidth={false}
                            arrows={false}
                            responsive={[
                              {
                                breakpoint: 1024,
                                settings: {
                                  slidesToShow: 2,
                                  slidesToScroll: 1,
                                  infinite: true,
                                  dots: true,
                                  arrows: false,
                                },
                              },
                              {
                                breakpoint: 768,
                                settings: {
                                  slidesToShow: 1,
                                  slidesToScroll: 1,
                                  initialSlide: 0,
                                  centerMode: true,
                                  arrows: false,
                                  centerPadding: "20px",
                                },
                              },
                            ]}
                            className="attraction-slider !px-0"
                          >
                            <div className="px-1 w-full">
                              <div className="flex flex-col h-full">
                                <div className="relative h-40 rounded-lg overflow-hidden mb-2">
                                  <Image
                                    src="https://images.unsplash.com/photo-1638904998527-a451c1fbd1cb?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                                    alt="Birla Mandir"
                                    fill
                                    blurDataURL="/blur.webp"
                                    placeholder="blur"
                                    className="object-cover"
                                  />
                                </div>
                                <p className="font-medium text-gray-800">
                                  Birla Mandir
                                </p>
                              </div>
                            </div>

                            <div className="px-1 w-full">
                              <div className="flex flex-col h-full">
                                <div className="relative h-40 rounded-lg overflow-hidden mb-2">
                                  <Image
                                    src="https://images.unsplash.com/photo-1671727337717-d2c641eda1d8?q=80&w=3087&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                                    alt="Amber Palace"
                                    fill
                                    blurDataURL="/blur.webp"
                                    placeholder="blur"
                                    className="object-cover"
                                  />
                                </div>
                                <p className="font-medium text-gray-800">
                                  Amber Palace
                                </p>
                              </div>
                            </div>

                            <div className="px-1 w-full">
                              <div className="flex flex-col h-full">
                                <div className="relative h-40 rounded-lg overflow-hidden mb-2">
                                  <Image
                                    src="https://images.unsplash.com/photo-1667849357640-c5d7cf5ba96e?q=80&w=2942&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                                    alt="Lake Pichola"
                                    fill
                                    blurDataURL="/blur.webp"
                                    placeholder="blur"
                                    className="object-cover"
                                  />
                                </div>
                                <p className="font-medium text-gray-800">
                                  Lake Pichola
                                </p>
                              </div>
                            </div>

                            <div className="px-1 w-full">
                              <div className="flex flex-col h-full">
                                <div className="relative h-40 rounded-lg overflow-hidden mb-2">
                                  <Image
                                    src="https://images.unsplash.com/photo-1570638013975-fa2b3c9525b2?q=80&w=1000&auto=format&fit=crop"
                                    alt="City Palace"
                                    fill
                                    blurDataURL="/blur.webp"
                                    placeholder="blur"
                                    className="object-cover"
                                  />
                                </div>
                                <p className="font-medium text-gray-800">
                                  City Palace
                                </p>
                              </div>
                            </div>
                          </Slider>
                        </div>

                        <h4 className="text-[15px] font-semibold mb-3 flex items-center">
                          <i className="fi fi-rr-marker text-red-500 mr-2"></i>
                          Arrival & Desert Adventure
                        </h4>
                        <p className="text-gray-800">
                          Arrive in Jaisalmer in the morning. After check-in and
                          freshening up, explore the magnificent Jaisalmer Fort,
                          known as the "Golden Fort". In the afternoon, visit
                          Patwon Ki Haveli and Gadisar Lake. Evening will be at
                          Sam Sand Dunes for a camel safari and cultural program
                          followed by dinner under the stars.
                        </p>
                        {/* Meal Inclusion Display */}
                        <div className="grid grid-cols-1 md:grid-cols-3 rounded-lg overflow-hidden mt-6 bg-[#f7f7f7] p-2">
                          <div className="flex-1 py-3 px-4 flex flex-col items-center md:border-r border-gray-200">
                            <div className="flex items-center mb-1">
                              <i className="fi fi-rr-sandwich text-primary-500 mr-2 text-lg"></i>
                              <span className="font-medium text-sm">Breakfast</span>
                            </div>
                            <span className="text-sm text-gray-600">Included</span>
                          </div>
                          
                          <div className="flex-1 py-3 px-4 flex flex-col items-center md:border-r border-gray-200">
                            <div className="flex items-center mb-1">
                              <i className="fi fi-rr-utensils text-primary-500 mr-2 text-lg"></i>
                              <span className="font-medium text-sm">Lunch</span>
                            </div>
                            <span className="text-sm text-gray-600">Not Included</span>
                          </div>
                          
                          <div className="flex-1 py-3 px-4 flex flex-col items-center text-lg">
                            <div className="flex items-center mb-1">
                              <i className="fi fi-rr-room-service text-primary-500 mr-2"></i>
                              <span className="font-medium text-sm">Dinner</span>
                            </div>
                            <span className="text-sm text-gray-600">Included</span>
                          </div>
                        </div>
                      </div>
                    </Accordion>

                    <Accordion
                      title="Day 03 - Jaisalmer to Kashmir"
                      defaultOpen={false}
                    >
                      <div className="">
                        <h4 className="text-[15px] font-semibold text-gray-800 mb-3">
                          Attraction / Activity
                        </h4>

                        {/* Carousel for Kashmir attractions */}
                        <div className="mb-8 w-full">
                          <Slider
                            dots={true}
                            infinite={true}
                            speed={500}
                            slidesToShow={3}
                            slidesToScroll={1}
                            autoplay={true}
                            autoplaySpeed={3000}
                            centerMode={true}
                            variableWidth={false}
                            arrows={false}
                            responsive={[
                              {
                                breakpoint: 1024,
                                settings: {
                                  slidesToShow: 2,
                                  slidesToScroll: 1,
                                  infinite: true,
                                  dots: true,
                                  arrows: false,
                                },
                              },
                              {
                                breakpoint: 768,
                                settings: {
                                  slidesToShow: 1,
                                  slidesToScroll: 1,
                                  initialSlide: 0,
                                  centerMode: true,
                                  arrows: false,
                                  centerPadding: "20px",
                                },
                              },
                            ]}
                            className="attraction-slider !px-0"
                          >
                            <div className="px-1 w-full">
                              <div className="flex flex-col h-full">
                                <div className="relative h-40 rounded-lg overflow-hidden mb-2">
                                  <Image
                                    src="https://images.unsplash.com/photo-1638904998527-a451c1fbd1cb?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                                    alt="Birla Mandir"
                                    fill
                                    blurDataURL="/blur.webp"
                                    placeholder="blur"
                                    className="object-cover"
                                  />
                                </div>
                                <p className="font-medium text-gray-800">
                                  Birla Mandir
                                </p>
                              </div>
                            </div>

                            <div className="px-1 w-full">
                              <div className="flex flex-col h-full">
                                <div className="relative h-40 rounded-lg overflow-hidden mb-2">
                                  <Image
                                    src="https://images.unsplash.com/photo-1671727337717-d2c641eda1d8?q=80&w=3087&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                                    alt="Amber Palace"
                                    fill
                                    blurDataURL="/blur.webp"
                                    placeholder="blur"
                                    className="object-cover"
                                  />
                                </div>
                                <p className="font-medium text-gray-800">
                                  Amber Palace
                                </p>
                              </div>
                            </div>

                            <div className="px-1 w-full">
                              <div className="flex flex-col h-full">
                                <div className="relative h-40 rounded-lg overflow-hidden mb-2">
                                  <Image
                                    src="https://images.unsplash.com/photo-1667849357640-c5d7cf5ba96e?q=80&w=2942&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                                    alt="Lake Pichola"
                                    fill
                                    blurDataURL="/blur.webp"
                                    placeholder="blur"
                                    className="object-cover"
                                  />
                                </div>
                                <p className="font-medium text-gray-800">
                                  Lake Pichola
                                </p>
                              </div>
                            </div>

                            <div className="px-1 w-full">
                              <div className="flex flex-col h-full">
                                <div className="relative h-40 rounded-lg overflow-hidden mb-2">
                                  <Image
                                    src="https://images.unsplash.com/photo-1570638013975-fa2b3c9525b2?q=80&w=1000&auto=format&fit=crop"
                                    alt="City Palace"
                                    fill
                                    blurDataURL="/blur.webp"
                                    placeholder="blur"
                                    className="object-cover"
                                  />
                                </div>
                                <p className="font-medium text-gray-800">
                                  City Palace
                                </p>
                              </div>
                            </div>
                          </Slider>
                        </div>

                        <h4 className="text-[15px] font-semibold text-gray-800 mb-3 flex items-center">
                          <i className="fi fi-rr-marker text-red-500 mr-2"></i>
                          Travel Day
                        </h4>
                        <p className="text-gray-800">
                          Morning free for leisure or shopping in Jaisalmer.
                          Afternoon flight to Delhi and connecting flight to
                          Srinagar. Arrival at Srinagar by evening, transfer to
                          houseboat on Dal Lake. Dinner and overnight stay on
                          the houseboat.
                        </p>
                        {/* Meal Inclusion Display */}
                        <div className="grid grid-cols-1 md:grid-cols-3 rounded-lg overflow-hidden mt-6 bg-[#f7f7f7] p-2">
                          <div className="flex-1 py-3 px-4 flex flex-col items-center md:border-r border-gray-200">
                            <div className="flex items-center mb-1">
                              <i className="fi fi-rr-sandwich text-primary-500 mr-2 text-lg"></i>
                              <span className="font-medium text-sm">Breakfast</span>
                            </div>
                            <span className="text-sm text-gray-600">Included</span>
                          </div>
                          
                          <div className="flex-1 py-3 px-4 flex flex-col items-center md:border-r border-gray-200">
                            <div className="flex items-center mb-1">
                              <i className="fi fi-rr-utensils text-primary-500 mr-2 text-lg"></i>
                              <span className="font-medium text-sm">Lunch</span>
                            </div>
                            <span className="text-sm text-gray-600">Not Included</span>
                          </div>
                          
                          <div className="flex-1 py-3 px-4 flex flex-col items-center text-lg">
                            <div className="flex items-center mb-1">
                              <i className="fi fi-rr-room-service text-primary-500 mr-2"></i>
                              <span className="font-medium text-sm">Dinner</span>
                            </div>
                            <span className="text-sm text-gray-600">Included</span>
                          </div>
                        </div>
                      </div>
                    </Accordion>

                    <Accordion title="Day 04 - Srinagar" defaultOpen={false}>
                      <div className="">
                        <h4 className="text-[15px] font-semibold text-gray-800 mb-3">
                          Attraction / Activity
                        </h4>

                        {/* Carousel for Srinagar attractions */}
                        <div className="mb-8 w-full">
                          <Slider
                            dots={true}
                            infinite={true}
                            speed={500}
                            slidesToShow={3}
                            slidesToScroll={1}
                            autoplay={true}
                            autoplaySpeed={3000}
                            centerMode={true}
                            variableWidth={false}
                            arrows={false}
                            responsive={[
                              {
                                breakpoint: 1024,
                                settings: {
                                  slidesToShow: 2,
                                  slidesToScroll: 1,
                                  infinite: true,
                                  dots: true,
                                  arrows: false,
                                },
                              },
                              {
                                breakpoint: 768,
                                settings: {
                                  slidesToShow: 1,
                                  slidesToScroll: 1,
                                  initialSlide: 0,
                                  centerMode: true,
                                  arrows: false,
                                  centerPadding: "20px",
                                },
                              },
                            ]}
                            className="attraction-slider !px-0"
                          >
                            <div className="px-1 w-full">
                              <div className="flex flex-col h-full">
                                <div className="relative h-40 rounded-lg overflow-hidden mb-2">
                                  <Image
                                    src="https://images.unsplash.com/photo-1638904998527-a451c1fbd1cb?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                                    alt="Birla Mandir"
                                    fill
                                    blurDataURL="/blur.webp"
                                    placeholder="blur"
                                    className="object-cover"
                                  />
                                </div>
                                <p className="font-medium text-gray-800">
                                  Birla Mandir
                                </p>
                              </div>
                            </div>

                            <div className="px-1 w-full">
                              <div className="flex flex-col h-full">
                                <div className="relative h-40 rounded-lg overflow-hidden mb-2">
                                  <Image
                                    src="https://images.unsplash.com/photo-1671727337717-d2c641eda1d8?q=80&w=3087&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                                    alt="Amber Palace"
                                    fill
                                    blurDataURL="/blur.webp"
                                    placeholder="blur"
                                    className="object-cover"
                                  />
                                </div>
                                <p className="font-medium text-gray-800">
                                  Amber Palace
                                </p>
                              </div>
                            </div>

                            <div className="px-1 w-full">
                              <div className="flex flex-col h-full">
                                <div className="relative h-40 rounded-lg overflow-hidden mb-2">
                                  <Image
                                    src="https://images.unsplash.com/photo-1667849357640-c5d7cf5ba96e?q=80&w=2942&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                                    alt="Lake Pichola"
                                    fill
                                    blurDataURL="/blur.webp"
                                    placeholder="blur"
                                    className="object-cover"
                                  />
                                </div>
                                <p className="font-medium text-gray-800">
                                  Lake Pichola
                                </p>
                              </div>
                            </div>

                            <div className="px-1 w-full">
                              <div className="flex flex-col h-full">
                                <div className="relative h-40 rounded-lg overflow-hidden mb-2">
                                  <Image
                                    src="https://images.unsplash.com/photo-1570638013975-fa2b3c9525b2?q=80&w=1000&auto=format&fit=crop"
                                    alt="City Palace"
                                    fill
                                    blurDataURL="/blur.webp"
                                    placeholder="blur"
                                    className="object-cover"
                                  />
                                </div>
                                <p className="font-medium text-gray-800">
                                  City Palace
                                </p>
                              </div>
                            </div>
                          </Slider>
                        </div>

                        <h4 className="text-[15px] font-semibold text-gray-800 mb-3 flex items-center">
                          <i className="fi fi-rr-marker text-red-500 mr-2"></i>
                          Kashmir Valley Exploration
                        </h4>
                        <p className="text-gray-800">
                          After breakfast, enjoy a shikara ride on Dal Lake.
                          Visit Mughal Gardens including Nishat Bagh, Shalimar
                          Bagh, and Chashme Shahi. Afternoon visit to local
                          craft markets for shopping. Evening return to
                          houseboat for dinner and overnight stay.
                        </p>
                        {/* Meal Inclusion Display */}
                        <div className="grid grid-cols-1 md:grid-cols-3 rounded-lg overflow-hidden mt-6 bg-[#f7f7f7] p-2">
                          <div className="flex-1 py-3 px-4 flex flex-col items-center md:border-r border-gray-200">
                            <div className="flex items-center mb-1">
                              <i className="fi fi-rr-sandwich text-primary-500 mr-2 text-lg"></i>
                              <span className="font-medium text-sm">Breakfast</span>
                            </div>
                            <span className="text-sm text-gray-600">Included</span>
                          </div>
                          
                          <div className="flex-1 py-3 px-4 flex flex-col items-center md:border-r border-gray-200">
                            <div className="flex items-center mb-1">
                              <i className="fi fi-rr-utensils text-primary-500 mr-2 text-lg"></i>
                              <span className="font-medium text-sm">Lunch</span>
                            </div>
                            <span className="text-sm text-gray-600">Not Included</span>
                          </div>
                          
                          <div className="flex-1 py-3 px-4 flex flex-col items-center text-lg">
                            <div className="flex items-center mb-1">
                              <i className="fi fi-rr-room-service text-primary-500 mr-2"></i>
                              <span className="font-medium text-sm">Dinner</span>
                            </div>
                            <span className="text-sm text-gray-600">Included</span>
                          </div>
                        </div>
                      </div>
                    </Accordion>

                    <Accordion
                      title="Day 05 - Gulmarg Day Trip"
                      defaultOpen={false}
                    >
                      <div className="">
                        <h4 className="text-[15px] font-semibold text-gray-800 mb-3">
                          Attraction / Activity
                        </h4>

                        {/* Carousel for Gulmarg attractions */}
                        <div className="mb-8 w-full">
                          <Slider
                            dots={true}
                            infinite={true}
                            speed={500}
                            slidesToShow={3}
                            slidesToScroll={1}
                            autoplay={true}
                            autoplaySpeed={3000}
                            centerMode={true}
                            variableWidth={false}
                            arrows={false}
                            responsive={[
                              {
                                breakpoint: 1024,
                                settings: {
                                  slidesToShow: 2,
                                  slidesToScroll: 1,
                                  infinite: true,
                                  dots: true,
                                  arrows: false,
                                },
                              },
                              {
                                breakpoint: 768,
                                settings: {
                                  slidesToShow: 1,
                                  slidesToScroll: 1,
                                  initialSlide: 0,
                                  centerMode: true,
                                  arrows: false,
                                  centerPadding: "20px",
                                },
                              },
                            ]}
                            className="attraction-slider !px-0"
                          >
                            <div className="px-1 w-full">
                              <div className="flex flex-col h-full">
                                <div className="relative h-40 rounded-lg overflow-hidden mb-2">
                                  <Image
                                    src="https://images.unsplash.com/photo-1638904998527-a451c1fbd1cb?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                                    alt="Birla Mandir"
                                    fill
                                    blurDataURL="/blur.webp"
                                    placeholder="blur"
                                    className="object-cover"
                                  />
                                </div>
                                <p className="font-medium text-gray-800">
                                  Birla Mandir
                                </p>
                              </div>
                            </div>

                            <div className="px-1 w-full">
                              <div className="flex flex-col h-full">
                                <div className="relative h-40 rounded-lg overflow-hidden mb-2">
                                  <Image
                                    src="https://images.unsplash.com/photo-1671727337717-d2c641eda1d8?q=80&w=3087&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                                    alt="Amber Palace"
                                    fill
                                    blurDataURL="/blur.webp"
                                    placeholder="blur"
                                    className="object-cover"
                                  />
                                </div>
                                <p className="font-medium text-gray-800">
                                  Amber Palace
                                </p>
                              </div>
                            </div>

                            <div className="px-1 w-full">
                              <div className="flex flex-col h-full">
                                <div className="relative h-40 rounded-lg overflow-hidden mb-2">
                                  <Image
                                    src="https://images.unsplash.com/photo-1667849357640-c5d7cf5ba96e?q=80&w=2942&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                                    alt="Lake Pichola"
                                    fill
                                    blurDataURL="/blur.webp"
                                    placeholder="blur"
                                    className="object-cover"
                                  />
                                </div>
                                <p className="font-medium text-gray-800">
                                  Lake Pichola
                                </p>
                              </div>
                            </div>

                            <div className="px-1 w-full">
                              <div className="flex flex-col h-full">
                                <div className="relative h-40 rounded-lg overflow-hidden mb-2">
                                  <Image
                                    src="https://images.unsplash.com/photo-1570638013975-fa2b3c9525b2?q=80&w=1000&auto=format&fit=crop"
                                    alt="City Palace"
                                    fill
                                    blurDataURL="/blur.webp"
                                    placeholder="blur"
                                    className="object-cover"
                                  />
                                </div>
                                <p className="font-medium text-gray-800">
                                  City Palace
                                </p>
                              </div>
                            </div>
                          </Slider>
                        </div>

                        <h4 className="text-[15px] font-semibold text-gray-800 mb-3 flex items-center">
                          <i className="fi fi-rr-marker text-red-500 mr-2"></i>
                          Mountain Adventure
                        </h4>
                        <p className="text-gray-800">
                          Full day excursion to Gulmarg, the "Meadow of
                          Flowers". Experience Gondola ride to phase 1 with
                          stunning views of snow-capped mountains. Optional
                          activities like horse riding or skiing (as per
                          season). Return to Srinagar by evening for dinner and
                           overnight stay.
                        </p>
                      {/* Meal Inclusion Display */}
                      <div className="grid grid-cols-1 md:grid-cols-3 rounded-lg overflow-hidden mt-6 bg-[#f7f7f7] p-2">
                          <div className="flex-1 py-3 px-4 flex flex-col items-center md:border-r border-gray-200">
                            <div className="flex items-center mb-1">
                              <i className="fi fi-rr-sandwich text-primary-500 mr-2 text-lg"></i>
                              <span className="font-medium text-sm">Breakfast</span>
                            </div>
                            <span className="text-sm text-gray-600">Included</span>
                          </div>
                          
                          <div className="flex-1 py-3 px-4 flex flex-col items-center md:border-r border-gray-200">
                            <div className="flex items-center mb-1">
                              <i className="fi fi-rr-utensils text-primary-500 mr-2 text-lg"></i>
                              <span className="font-medium text-sm">Lunch</span>
                            </div>
                            <span className="text-sm text-gray-600">Not Included</span>
                          </div>
                          
                          <div className="flex-1 py-3 px-4 flex flex-col items-center text-lg">
                            <div className="flex items-center mb-1">
                              <i className="fi fi-rr-room-service text-primary-500 mr-2"></i>
                              <span className="font-medium text-sm">Dinner</span>
                            </div>
                            <span className="text-sm text-gray-600">Included</span>
                          </div>
                        </div>
                      </div>
                    </Accordion>

                    <Accordion title="Day 06 - Pahalgam" defaultOpen={false}>
                      <div className="">
                        <h4 className="text-[15px] font-semibold text-gray-800 mb-3">
                          Attraction / Activity
                        </h4>

                        {/* Carousel for Pahalgam attractions */}
                        <div className="mb-8 w-full">
                          <Slider
                            dots={true}
                            infinite={true}
                            speed={500}
                            slidesToShow={3}
                            slidesToScroll={1}
                            autoplay={true}
                            autoplaySpeed={3000}
                            centerMode={true}
                            variableWidth={false}
                            arrows={false}
                            responsive={[
                              {
                                breakpoint: 1024,
                                settings: {
                                  slidesToShow: 2,
                                  slidesToScroll: 1,
                                  infinite: true,
                                  dots: true,
                                  arrows: false,
                                },
                              },
                              {
                                breakpoint: 768,
                                settings: {
                                  slidesToShow: 1,
                                  slidesToScroll: 1,
                                  initialSlide: 0,
                                  centerMode: true,
                                  arrows: false,
                                  centerPadding: "20px",
                                },
                              },
                            ]}
                            className="attraction-slider !px-0"
                          >
                            <div className="px-1 w-full">
                              <div className="flex flex-col h-full">
                                <div className="relative h-40 rounded-lg overflow-hidden mb-2">
                                  <Image
                                    src="https://images.unsplash.com/photo-1638904998527-a451c1fbd1cb?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                                    alt="Birla Mandir"
                                    fill
                                    blurDataURL="/blur.webp"
                                    placeholder="blur"
                                    className="object-cover"
                                  />
                                </div>
                                <p className="font-medium text-gray-800">
                                  Birla Mandir
                                </p>
                              </div>
                            </div>

                            <div className="px-1 w-full">
                              <div className="flex flex-col h-full">
                                <div className="relative h-40 rounded-lg overflow-hidden mb-2">
                                  <Image
                                    src="https://images.unsplash.com/photo-1671727337717-d2c641eda1d8?q=80&w=3087&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                                    alt="Amber Palace"
                                    fill
                                    blurDataURL="/blur.webp"
                                    placeholder="blur"
                                    className="object-cover"
                                  />
                                </div>
                                <p className="font-medium text-gray-800">
                                  Amber Palace
                                </p>
                              </div>
                            </div>

                            <div className="px-1 w-full">
                              <div className="flex flex-col h-full">
                                <div className="relative h-40 rounded-lg overflow-hidden mb-2">
                                  <Image
                                    src="https://images.unsplash.com/photo-1667849357640-c5d7cf5ba96e?q=80&w=2942&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                                    alt="Lake Pichola"
                                    fill
                                    blurDataURL="/blur.webp"
                                    placeholder="blur"
                                    className="object-cover"
                                  />
                                </div>
                                <p className="font-medium text-gray-800">
                                  Lake Pichola
                                </p>
                              </div>
                            </div>

                            <div className="px-1 w-full">
                              <div className="flex flex-col h-full">
                                <div className="relative h-40 rounded-lg overflow-hidden mb-2">
                                  <Image
                                    src="https://images.unsplash.com/photo-1570638013975-fa2b3c9525b2?q=80&w=1000&auto=format&fit=crop"
                                    alt="City Palace"
                                    fill
                                    blurDataURL="/blur.webp"
                                    placeholder="blur"
                                    className="object-cover"
                                  />
                                </div>
                                <p className="font-medium text-gray-800">
                                  City Palace
                                </p>
                              </div>
                            </div>
                          </Slider>
                        </div>

                        <h4 className="text-base font-medium text-gray-800 mb-3 flex items-center">
                          <i className="fi fi-rr-marker text-red-500 mr-2"></i>
                          Valley of Shepherds
                        </h4>
                        <p className="text-gray-800">
                          After breakfast, drive to Pahalgam. En route visit
                          Avantipura Ruins and Saffron fields. Afternoon explore
                          Betaab Valley and Chandanwari. Evening at leisure to
                          enjoy the natural beauty of Pahalgam. Overnight stay
                          in Pahalgam.
                        </p>
                        {/* Meal Inclusion Display */}
                        <div className="grid grid-cols-1 md:grid-cols-3 rounded-lg overflow-hidden mt-6 bg-[#f7f7f7] p-2">
                          <div className="flex-1 py-3 px-4 flex flex-col items-center md:border-r border-gray-200">
                            <div className="flex items-center mb-1">
                              <i className="fi fi-rr-sandwich text-primary-500 mr-2 text-lg"></i>
                              <span className="font-medium text-sm">Breakfast</span>
                            </div>
                            <span className="text-sm text-gray-600">Included</span>
                          </div>
                          
                          <div className="flex-1 py-3 px-4 flex flex-col items-center md:border-r border-gray-200">
                            <div className="flex items-center mb-1">
                              <i className="fi fi-rr-utensils text-primary-500 mr-2 text-lg"></i>
                              <span className="font-medium text-sm">Lunch</span>
                            </div>
                            <span className="text-sm text-gray-600">Not Included</span>
                          </div>
                          
                          <div className="flex-1 py-3 px-4 flex flex-col items-center text-lg">
                            <div className="flex items-center mb-1">
                              <i className="fi fi-rr-room-service text-primary-500 mr-2"></i>
                              <span className="font-medium text-sm">Dinner</span>
                            </div>
                            <span className="text-sm text-gray-600">Included</span>
                          </div>
                        </div>
                      </div>
                    </Accordion>
                  </div>
                )}

                {activeTab === "inclusion" && (
                  <div className="prose max-w-none text-gray-800">
                    <Accordion title="Included Services" defaultOpen={true}>
                      <ul className="space-y-3 m-0">
                        <li className="flex items-center">
                          <i className="fi fi-rr-check-circle text-green-500 text-base mt-0.5 mr-3 flex-shrink-0"></i>
                          <span className="text-gray-800">
                            3 nights non-AC stay in Srinagar.
                          </span>
                        </li>
                        <li className="flex items-center">
                          <i className="fi fi-rr-check-circle text-green-500 text-base mt-0.5 mr-3 flex-shrink-0"></i>
                          <span className="text-gray-800">
                            3 night Shikara Ride on Dal Lake.
                          </span>
                        </li>
                        <li className="flex items-center">
                          <i className="fi fi-rr-check-circle text-green-500 text-base mt-0.5 mr-3 flex-shrink-0"></i>
                          <span className="text-gray-800">
                            Gondola Ride (Phase 1) in Gulmarg.
                          </span>
                        </li>
                        <li className="flex items-center">
                          <i className="fi fi-rr-check-circle text-green-500 text-base mt-0.5 mr-3 flex-shrink-0"></i>
                          <span className="text-gray-800">
                            1 night AC stay in Amritsar.
                          </span>
                        </li>
                        <li className="flex items-center">
                          <i className="fi fi-rr-check-circle text-green-500 text-base mt-0.5 mr-3 flex-shrink-0"></i>
                          <span className="text-gray-800">
                            1 night non-AC stay in Pahalgam.
                          </span>
                        </li>
                        <li className="flex items-center">
                          <i className="fi fi-rr-check-circle text-green-500 text-base mt-0.5 mr-3 flex-shrink-0"></i>
                          <span className="text-gray-800">
                            Interconnecting sleeper train tickets are included
                            for seamless travel between destinations, subject to
                            seat availability at the time of booking.
                          </span>
                        </li>
                        <li className="flex items-center">
                          <i className="fi fi-rr-check-circle text-green-500 text-base mt-0.5 mr-3 flex-shrink-0"></i>
                          <span className="text-gray-800">
                            Comfortable AC vehicles for all travel in plains and
                            urban areas.
                          </span>
                        </li>
                        <li className="flex items-center">
                          <i className="fi fi-rr-check-circle text-green-500 text-base mt-0.5 mr-3 flex-shrink-0"></i>
                          <span className="text-gray-800">
                            1 night camp stay in Jaisalmer with a swimming pool,
                            offering a unique desert experience.
                          </span>
                        </li>
                      </ul>
                    </Accordion>

                    <Accordion title="Excluded Services" defaultOpen={false}>
                      <ul className="space-y-3 m-0">
                        <li className="flex items-center">
                          <i className="fi fi-rr-cross-circle text-red-500 text-base mt-0.5 mr-3 flex-shrink-0"></i>
                          <span className="text-gray-800">
                            Flight and train fare (To & From).
                          </span>
                        </li>
                        <li className="flex items-center">
                          <i className="fi fi-rr-cross-circle text-red-500 text-base mt-0.5 mr-3 flex-shrink-0"></i>
                          <span className="text-gray-800">
                            Any personal expenses like shopping, tips, laundry,
                            etc.
                          </span>
                        </li>
                        <li className="flex items-center">
                          <i className="fi fi-rr-cross-circle text-red-500 text-base mt-0.5 mr-3 flex-shrink-0"></i>
                          <span className="text-gray-800">
                            Entry fees to monuments and attractions not
                            mentioned in inclusions.
                          </span>
                        </li>
                        <li className="flex items-center">
                          <i className="fi fi-rr-cross-circle text-red-500 text-base mt-0.5 mr-3 flex-shrink-0"></i>
                          <span className="text-gray-800">
                            Optional activities and excursions.
                          </span>
                        </li>
                        <li className="flex items-center">
                          <i className="fi fi-rr-cross-circle text-red-500 text-base mt-0.5 mr-3 flex-shrink-0"></i>
                          <span className="text-gray-800">
                            Travel insurance.
                          </span>
                        </li>
                        <li className="flex items-center">
                          <i className="fi fi-rr-cross-circle text-red-500 text-base mt-0.5 mr-3 flex-shrink-0"></i>
                          <span className="text-gray-800">
                            Any unforeseen expenses due to delays, natural
                            calamities, or political disturbances.
                          </span>
                        </li>
                        <li className="flex items-center">
                          <i className="fi fi-rr-cross-circle text-red-500 text-base mt-0.5 mr-3 flex-shrink-0"></i>
                          <span className="text-gray-800">
                            Meals not mentioned in the inclusions.
                          </span>
                        </li>
                        <li className="flex items-center">
                          <i className="fi fi-rr-cross-circle text-red-500 text-base mt-0.5 mr-3 flex-shrink-0"></i>
                          <span className="text-gray-800">
                            Any additional transportation not mentioned in
                            inclusions.
                          </span>
                        </li>
                      </ul>
                    </Accordion>

                    <Accordion title="Things to Carry" defaultOpen={false}>
                      <ul className="space-y-3 m-0">
                        <li className="flex items-start">
                          
                            <i className="fi fi-rr-angle-circle-right text-violet-500 text-base mt-0.5 mr-3 flex-shrink-0"></i>
                   
                          <div>
                            <span className="font-medium text-gray-800">
                              Others:
                            </span>
                            <span className="text-gray-800">
                              {" "}
                              Small backpack, water bottle, snacks, plastic bags
                              for wet/dirty clothes
                            </span>
                          </div>
                        </li>
                        <li className="flex items-start">
                            <i className="fi fi-rr-angle-circle-right text-violet-500 text-base mt-0.5 mr-3 flex-shrink-0"></i>
                          <div>
                            <span className="font-medium text-gray-800">
                              Personal Care:
                            </span>
                            <span className="text-gray-800">
                              {" "}
                              Toiletries, towel, hand sanitizer, wet wipes,
                              sunscreen, lip balm.
                            </span>
                          </div>
                        </li>
                        <li className="flex items-start">
                          <i className="fi fi-rr-angle-circle-right text-violet-500 text-base mt-0.5 mr-3 flex-shrink-0"></i>
                          <div>
                            <span className="font-medium text-gray-800">
                              Health & Safety:
                            </span>
                            <span className="text-gray-800">
                              {" "}
                              Personal medicines, basic first-aid kit, mask,
                              ORS, motion sickness tablets.
                            </span>
                          </div>
                        </li>
                        <li className="flex items-start">
                          <i className="fi fi-rr-angle-circle-right text-violet-500 text-base mt-0.5 mr-3 flex-shrink-0"></i>
                          <div>
                            <span className="font-medium text-gray-800">
                              Gadgets:
                            </span>
                            <span className="text-gray-800">
                              {" "}
                              Mobile, charger, power bank, camera (if needed).
                            </span>
                          </div>
                        </li>
                        <li className="flex items-start">
                          <i className="fi fi-rr-angle-circle-right text-violet-500 text-base mt-0.5 mr-3 flex-shrink-0"></i>
                         
                          <div>
                            <span className="font-medium text-gray-800">
                              Documents:
                            </span>
                            <span className="text-gray-800">
                              {" "}
                              Valid ID proof (Aadhar Card, Passport etc.) and
                              Printed tickets (Train/Flight/Bus)
                            </span>
                          </div>
                        </li>
                        <li className="flex items-start">
                          <i className="fi fi-rr-angle-circle-right text-violet-500 text-base mt-0.5 mr-3 flex-shrink-0"></i>
                          <div>
                            <span className="font-medium text-gray-800">
                              Clothing:
                            </span>
                            <span className="text-gray-800">
                              {" "}
                              Comfortable clothes, thermals for cold regions,
                              warm wear for hill stations, walking shoes,
                              sunglasses & cap.
                            </span>
                          </div>
                        </li>
                      </ul>
                    </Accordion>
                  </div>
                )}

                {activeTab === "terms" && (
                  <div className="prose max-w-none text-gray-800">
                    <h3 className="text-base font-semibold text-gray-800 mb-6">
                      Terms and Conditions
                    </h3>

                    <div className="mb-8">
                      <h4 className="text-sm font-semibold text-gray-800 mb-4">
                        1. Booking & Payment
                      </h4>
                      <ul className="space-y-3">
                        <li className="flex items-start">
                          <span className="text-primary-500 mr-2 font-bold">
                            •
                          </span>
                          <span className="text-gray-800">
                            A minimum advance payment is required to confirm
                            your booking.
                          </span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-primary-500 mr-2 font-bold">
                            •
                          </span>
                          <span className="text-gray-800">
                            The remaining amount must be settled before the tour
                            commencement.
                          </span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-primary-500 mr-2 font-bold">
                            •
                          </span>
                          <span className="text-gray-800">
                            All payments made are non-transferable.
                          </span>
                        </li>
                      </ul>
                    </div>

                    <div className="mb-8">
                      <h4 className="text-sm font-semibold text-gray-800 mb-4">
                        2. Itinerary Changes
                      </h4>
                      <ul className="space-y-3">
                        <li className="flex items-start">
                          <span className="text-primary-500 mr-2 font-bold">
                            •
                          </span>
                          <span className="text-gray-800">
                            The itinerary is subject to change due to unforeseen
                            circumstances such as weather conditions, traffic
                            delays, or operational issues.
                          </span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-primary-500 mr-2 font-bold">
                            •
                          </span>
                          <span className="text-gray-800">
                            The company reserves the right to alter or cancel
                            any part of the tour if necessary, in the interest
                            of safety or smooth operation.
                          </span>
                        </li>
                      </ul>
                    </div>

                    <div className="mb-8">
                      <h4 className="text-sm font-semibold text-gray-800 mb-4">
                        3. Travel Documents
                      </h4>
                      <ul className="space-y-3">
                        <li className="flex items-start">
                          <span className="text-primary-500 mr-2 font-bold">
                            •
                          </span>
                          <span className="text-gray-800">
                            Travelers must carry valid government-issued ID
                            proofs at all times.
                          </span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-primary-500 mr-2 font-bold">
                            •
                          </span>
                          <span className="text-gray-800">
                            The company is not responsible for any inconvenience
                            caused due to missing or invalid documentation.
                          </span>
                        </li>
                      </ul>
                    </div>

                    <div className="mb-8">
                      <h4 className="text-sm font-semibold text-gray-800 mb-4">
                        4. Health & Safety
                      </h4>
                      <ul className="space-y-3">
                        <li className="flex items-start">
                          <span className="text-primary-500 mr-2 font-bold">
                            •
                          </span>
                          <span className="text-gray-800">
                            Participants should be in good health to undertake
                            the journey and are advised to inform the tour
                            manager of any pre-existing medical conditions.
                          </span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-primary-500 mr-2 font-bold">
                            •
                          </span>
                          <span className="text-gray-800">
                            While we take necessary precautions, the company is
                            not liable for injuries, health issues, or accidents
                            during the tour.
                          </span>
                        </li>
                      </ul>
                    </div>

                    <div className="mb-8">
                      <h4 className="text-sm font-semibold text-gray-800 mb-4">
                        5. Accommodation & Transport
                      </h4>
                      <ul className="space-y-3">
                        <li className="flex items-start">
                          <span className="text-primary-500 mr-2 font-bold">
                            •
                          </span>
                          <span className="text-gray-800">
                            Accommodation will be provided on a
                            twin/triple-sharing basis, unless specified
                            otherwise.
                          </span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-primary-500 mr-2 font-bold">
                            •
                          </span>
                          <span className="text-gray-800">
                            Transportation will be arranged as per the
                            itinerary. Any deviation or special request may
                            attract additional charges.
                          </span>
                        </li>
                      </ul>
                    </div>

                    <div className="mb-8">
                      <h4 className="text-sm font-semibold text-gray-800 mb-4">
                        6. Code of Conduct
                      </h4>
                      <ul className="space-y-3">
                        <li className="flex items-start">
                          <span className="text-primary-500 mr-2 font-bold">
                            •
                          </span>
                          <span className="text-gray-800">
                            All guests are expected to behave respectfully
                            toward fellow travelers, staff, and local culture.
                          </span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-primary-500 mr-2 font-bold">
                            •
                          </span>
                          <span className="text-gray-800">
                            Any form of misconduct may result in immediate
                            exclusion from the tour without any refund.
                          </span>
                        </li>
                      </ul>
                    </div>

                    <div className="mb-8">
                        <h4 className="text-sm font-semibold text-gray-800 mb-4">
                        7. Liability Disclaimer
                      </h4>
                      <ul className="space-y-3">
                        <li className="flex items-start">
                          <span className="text-primary-500 mr-2 font-bold">
                            •
                          </span>
                          <span className="text-gray-800">
                            The company shall not be held responsible for loss,
                            theft, or damage of personal belongings.
                          </span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-primary-500 mr-2 font-bold">
                            •
                          </span>
                          <span className="text-gray-800">
                            We act only as a facilitator for hotels, transport,
                            and third-party vendors and are not liable for
                            service delays or shortcomings caused by these
                            service providers.
                          </span>
                        </li>
                      </ul>
                    </div>
                  </div>
                )}

                {activeTab === "reviews" && (
                  <div className="prose max-w-none text-gray-800 reviews-section">
                    <h3 className="text-base font-semibold text-gray-800 mb-6">
                      Customer Reviews
                    </h3>

                    <div className="flex flex-col md:flex-row items-start gap-8 mb-10">
                      <div className="w-full md:w-1/3 bg-gray-50 rounded-xl p-6 text-center sticky top-24">
                        <div className="mb-3">
                          <span className="text-5xl font-bold text-gray-800">
                            4.8
                          </span>
                          <span className="text-gray-500 text-sm ml-1">/5</span>
                        </div>

                        <div className="flex justify-center mb-4">
                          <div className="flex items-center">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <i
                                key={star}
                                className={`fi ${
                                  star <= 4.8
                                    ? "fi-sr-star text-yellow-400"
                                    : "fi-rr-star text-gray-300"
                                } text-lg mx-0.5`}
                              ></i>
                            ))}
                          </div>
                        </div>

                        <p className="text-gray-500 mb-6">
                          Based on 176 reviews
                        </p>

                        {/* Rating breakdown */}
                        <div className="space-y-3">
                          <div className="flex items-center">
                            <span className="text-sm text-gray-700 w-10">
                              5 ★
                            </span>
                            <div className="flex-1 mx-3 h-2 rounded-full bg-gray-200 overflow-hidden">
                              <div
                                className="bg-yellow-400 h-full rounded-full"
                                style={{ width: "72%" }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-700 w-8">
                              72%
                            </span>
                          </div>

                          <div className="flex items-center">
                            <span className="text-sm text-gray-700 w-10">
                              4 ★
                            </span>
                            <div className="flex-1 mx-3 h-2 rounded-full bg-gray-200 overflow-hidden">
                              <div
                                className="bg-yellow-400 h-full rounded-full"
                                style={{ width: "20%" }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-700 w-8">
                              20%
                            </span>
                          </div>

                          <div className="flex items-center">
                            <span className="text-sm text-gray-700 w-10">
                              3 ★
                            </span>
                            <div className="flex-1 mx-3 h-2 rounded-full bg-gray-200 overflow-hidden">
                              <div
                                className="bg-yellow-400 h-full rounded-full"
                                style={{ width: "5%" }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-700 w-8">
                              5%
                            </span>
                          </div>

                          <div className="flex items-center">
                            <span className="text-sm text-gray-700 w-10">
                              2 ★
                            </span>
                            <div className="flex-1 mx-3 h-2 rounded-full bg-gray-200 overflow-hidden">
                              <div
                                className="bg-yellow-400 h-full rounded-full"
                                style={{ width: "2%" }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-700 w-8">
                              2%
                            </span>
                          </div>

                          <div className="flex items-center">
                            <span className="text-sm text-gray-700 w-10">
                              1 ★
                            </span>
                            <div className="flex-1 mx-3 h-2 rounded-full bg-gray-200 overflow-hidden">
                              <div
                                className="bg-yellow-400 h-full rounded-full"
                                style={{ width: "1%" }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-700 w-8">
                              1%
                            </span>
                          </div>
                        </div>
                      </div>

                      <div
                        className="w-full md:w-2/3 space-y-6 reviews-container"
                        ref={reviewsEndRef}
                      >
                        {/* Individual reviews */}
                        <div className="border-b border-gray-200 pb-6">
                          <div className="flex justify-between mb-3">
                            <div className="flex items-center">
                              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium mr-3">
                                RS
                              </div>
                              <div>
                                <h4 className="text-base font-medium text-gray-800">
                                  Rahul Singh
                                </h4>
                                <p className="text-sm text-gray-500">
                                  April 2023
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <i
                                  key={star}
                                  className={`fi ${
                                    star <= 5
                                      ? "fi-sr-star text-yellow-400"
                                      : "fi-rr-star text-gray-300"
                                  } text-sm mx-0.5`}
                                ></i>
                              ))}
                            </div>
                          </div>
                          <p className="text-gray-800">
                            Our trip to Kashmir was absolutely magical! The
                            houseboat stay on Dal Lake was the highlight of our
                            journey. The tour was well organized with the
                            perfect balance of activities and free time. Our
                            guide Farooq was extremely knowledgeable about the
                            history and culture of each place. The Gondola ride
                            in Gulmarg offered breathtaking views of snow-capped
                            mountains. Highly recommend this tour!
                          </p>
                          <div className="mt-4 flex flex-wrap gap-2">
                            <span className="bg-gray-100 text-gray-800 text-xs px-2.5 py-1 rounded">
                              Kashmir
                            </span>
                            <span className="bg-gray-100 text-gray-800 text-xs px-2.5 py-1 rounded">
                              Houseboat
                            </span>
                            <span className="bg-gray-100 text-gray-800 text-xs px-2.5 py-1 rounded">
                              Gondola Ride
                            </span>
                          </div>
                        </div>

                        <div className="border-b border-gray-200 pb-6">
                          <div className="flex justify-between mb-3">
                            <div className="flex items-center">
                              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-medium mr-3">
                                AM
                              </div>
                              <div>
                                <h4 className="text-base font-medium text-gray-800">
                                  Anita Mehta
                                </h4>
                                <p className="text-sm text-gray-500">
                                  March 2023
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <i
                                  key={star}
                                  className={`fi ${
                                    star <= 4
                                      ? "fi-sr-star text-yellow-400"
                                      : "fi-rr-star text-gray-300"
                                  } text-sm mx-0.5`}
                                ></i>
                              ))}
                            </div>
                          </div>
                          <p className="text-gray-800">
                            The Rajasthan portion of the tour was incredible -
                            the forts, palaces, and desert experience in
                            Jaisalmer were unforgettable. The accommodations
                            were comfortable and had authentic charm. However,
                            there was a slight hiccup with one of our train
                            connections which caused some stress. The company
                            handled it professionally though and quickly
                            arranged alternative transport. The camel safari and
                            cultural program in the desert were excellent
                            experiences!
                          </p>
                          <div className="mt-4 flex flex-wrap gap-2">
                            <span className="bg-gray-100 text-gray-800 text-xs px-2.5 py-1 rounded">
                              Rajasthan
                            </span>
                            <span className="bg-gray-100 text-gray-800 text-xs px-2.5 py-1 rounded">
                              Desert Safari
                            </span>
                            <span className="bg-gray-100 text-gray-800 text-xs px-2.5 py-1 rounded">
                              Accommodation
                            </span>
                          </div>
                        </div>

                        <div className="border-b border-gray-200 pb-6">
                          <div className="flex justify-between mb-3">
                            <div className="flex items-center">
                              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-medium mr-3">
                                PT
                              </div>
                              <div>
                                <h4 className="text-base font-medium text-gray-800">
                                  Priya Thomas
                                </h4>
                                <p className="text-sm text-gray-500">
                                  February 2023
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <i
                                  key={star}
                                  className={`fi ${
                                    star <= 5
                                      ? "fi-sr-star text-yellow-400"
                                      : "fi-rr-star text-gray-300"
                                  } text-sm mx-0.5`}
                                ></i>
                              ))}
                            </div>
                          </div>
                          <p className="text-gray-800">
                            This journey through India was everything we hoped
                            for and more! The Golden Temple in Amritsar was
                            spiritually moving, and the evening Aarti ceremony
                            is something I&apos;ll never forget. The accommodations
                            exceeded our expectations, especially the houseboat
                            in Kashmir and the heritage haveli in Jaipur. Our
                            tour guide Ravi went above and beyond to make our
                            experience special. The food everywhere was
                            delicious, and we appreciated the balance of guided
                            tours and free time to explore on our own. Worth
                            every penny!
                          </p>
                          <div className="mt-4 flex flex-wrap gap-2">
                            <span className="bg-gray-100 text-gray-800 text-xs px-2.5 py-1 rounded">
                              Golden Temple
                            </span>
                            <span className="bg-gray-100 text-gray-800 text-xs px-2.5 py-1 rounded">
                              Guide
                            </span>
                            <span className="bg-gray-100 text-gray-800 text-xs px-2.5 py-1 rounded">
                              Food
                            </span>
                          </div>
                        </div>

                        <div className="border-b border-gray-200 pb-6">
                          <div className="flex justify-between mb-3">
                            <div className="flex items-center">
                              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-medium mr-3">
                                SK
                              </div>
                              <div>
                                <h4 className="text-base font-medium text-gray-800">
                                  Sunil Kumar
                                </h4>
                                <p className="text-sm text-gray-500">
                                  January 2023
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <i
                                  key={star}
                                  className={`fi ${
                                    star <= 4
                                      ? "fi-sr-star text-yellow-400"
                                      : "fi-rr-star text-gray-300"
                                  } text-sm mx-0.5`}
                                ></i>
                              ))}
                            </div>
                          </div>
                          <p className="text-gray-800">
                            Overall a great experience covering so many diverse
                            regions of India in one trip. The Taj Mahal was even
                            more impressive in person than in photos. The
                            overnight train journeys were an adventure in
                            themselves! The only improvement would be slightly
                            more time in Delhi to explore the historic sites.
                            The shopping opportunities were excellent - we
                            brought back beautiful souvenirs from each region.
                            Highly recommend for anyone wanting to experience
                            the cultural diversity of North India.
                          </p>
                          <div className="mt-4 flex flex-wrap gap-2">
                            <span className="bg-gray-100 text-gray-800 text-xs px-2.5 py-1 rounded">
                              Taj Mahal
                            </span>
                            <span className="bg-gray-100 text-gray-800 text-xs px-2.5 py-1 rounded">
                              Train Journey
                            </span>
                            <span className="bg-gray-100 text-gray-800 text-xs px-2.5 py-1 rounded">
                              Shopping
                            </span>
                          </div>
                        </div>

                        <div className="border-b border-gray-200 pb-6">
                          <div className="flex justify-between mb-3">
                            <div className="flex items-center">
                              <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600 font-medium mr-3">
                                MK
                              </div>
                              <div>
                                <h4 className="text-base font-medium text-gray-800">
                                  Michael Khan
                                </h4>
                                <p className="text-sm text-gray-500">
                                  December 2022
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <i
                                  key={star}
                                  className={`fi ${
                                    star <= 5
                                      ? "fi-sr-star text-yellow-400"
                                      : "fi-rr-star text-gray-300"
                                  } text-sm mx-0.5`}
                                ></i>
                              ))}
                            </div>
                          </div>
                          <p className="text-gray-800">
                            As an international traveler, I was impressed by how
                            well this tour catered to diverse needs. The company
                            was extremely responsive during booking and
                            addressed all our questions. The itinerary provided
                            the perfect introduction to Northern India. The
                            transportation was comfortable and always on time.
                            We particularly enjoyed the local cuisine
                            experiences arranged throughout the journey. The
                            beauty of Kashmir exceeded our expectations
                            completely. This tour provides excellent value for
                            money and I&apos;ve already recommended it to several
                            friends.
                          </p>
                          <div className="mt-4 flex flex-wrap gap-2">
                            <span className="bg-gray-100 text-gray-800 text-xs px-2.5 py-1 rounded">
                              International
                            </span>
                            <span className="bg-gray-100 text-gray-800 text-xs px-2.5 py-1 rounded">
                              Transportation
                            </span>
                            <span className="bg-gray-100 text-gray-800 text-xs px-2.5 py-1 rounded">
                              Cuisine
                            </span>
                          </div>
                        </div>

                        {/* Show more button */}
                        <div className="flex justify-center pt-4">
                          <button
                            className="text-primary-600 font-medium flex items-center hover:text-primary-700"
                            onClick={toggleShowAllReviews}
                          >
                            {showAllReviews
                              ? "Show fewer reviews"
                              : "Show more reviews"}
                            <i
                              className={`fi ${
                                showAllReviews
                                  ? "fi-rr-angle-small-up"
                                  : "fi-rr-angle-small-down"
                              } ml-1`}
                            ></i>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Additional reviews that appear when "Show more" is clicked */}
                    {showAllReviews && (
                      <div className="space-y-6 mt-6">
                        {additionalReviews.map((review, index) => (
                          <div
                            key={index}
                            className="border-b border-gray-200 pb-6"
                            ref={index === 0 ? reviewsEndRef : null} // Add ref to the first additional review
                          >
                            <div className="flex justify-between mb-3">
                              <div className="flex items-center">
                                <div
                                  className={`w-10 h-10 rounded-full ${
                                    index === 0
                                      ? "bg-orange-100 text-orange-600"
                                      : index === 1
                                      ? "bg-teal-100 text-teal-600"
                                      : "bg-indigo-100 text-indigo-600"
                                  } flex items-center justify-center font-medium mr-3`}
                                >
                                  {review.initials}
                                </div>
                                <div>
                                  <h4 className="text-base font-medium text-gray-800">
                                    {review.name}
                                  </h4>
                                  <p className="text-sm text-gray-500">
                                    {review.date}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <i
                                    key={star}
                                    className={`fi ${
                                      star <= review.rating
                                        ? "fi-sr-star text-yellow-400"
                                        : "fi-rr-star text-gray-300"
                                    } text-sm mx-0.5`}
                                  ></i>
                                ))}
                              </div>
                            </div>
                            <p className="text-gray-800">{review.text}</p>
                            <div className="mt-4 flex flex-wrap gap-2">
                              {review.tags.map((tag, tagIndex) => (
                                <span
                                  key={tagIndex}
                                  className="bg-gray-100 text-gray-800 text-xs px-2.5 py-1 rounded"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Other tabs */}
              </div>
            </div>

            {/* Right side - Booking form - Hidden on mobile */}
            <div className="w-full lg:w-1/3 hidden lg:block">
              <div className="sticky top-6 bg-[#f7f7f7] rounded-xl p-3  shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <span className="text-3xl font-bold text-gray-800">
                      ₹ {packageData.price.toLocaleString()}
                    </span>
                    <span className="text-gray-700 text-sm font-medium ml-1">/ Person</span>
                  </div>
                  <div className="bg-gray-800 text-white text-xs px-3 py-1 rounded-full">
                    {packageData.nights} N &nbsp; {packageData.days} D
                  </div>
                </div>

                {/* Stay Category Badge */}
                <div className="mb-4">
                  <span className="bg-[#dfeeff] text-[#0057c9] text-xs font-medium px-2.5 py-1 rounded-full">
                    {selectedStayCategory === "budget"
                      ? "Budget Stay"
                      : selectedStayCategory === "standard"
                      ? "Standard Stay"
                      : "Luxury Stay"}
                  </span>
 
                </div>

                {/* Starting Date */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-800 mb-2">
                    Starting Date
                  </label>
                  <div className="relative">
                    <DatePicker
                      selected={selectedDate}
                      onChange={(date) => setSelectedDate(date)}
                      minDate={new Date()} // Prevents selecting dates in the past
                      placeholderText="Choose Date"
                      className="w-full h-11 px-4 pr-10 border text-gray-800 border-gray-300 bg-white rounded-full focus:outline-none focus:ring-none  focus:border-primary-500 cursor-pointer"
                      dateFormat="dd/MM/yyyy"
                      // inline
                      popperPlacement="bottom-start"
                      popperModifiers={[
                        {
                          name: "offset",
                          options: {
                            offset: [0, 2],
                          },
                        },
                        {
                          name: "preventOverflow",
                          options: {
                            rootBoundary: "viewport",
                            tether: false,
                            altAxis: true,
                          },
                        },
                      ]}
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-500">
                      <i className="fi fi-rr-calendar text-lg"></i>
                    </div>
                  </div>
                </div>

                {/* No. of Tickets */}
                <div className="mb-6 bg-white rounded-xl p-4">
                  <label className="block text-sm font-medium text-gray-800 mb-4">
                    No. of Tickets
                  </label>

                  {/* Adults */}
                  <div className="flex items-center justify-between mb-4 border-b border-gray-200 pb-2">
                    <div>
                      <p className="font-medium text-gray-800">Adult</p>
                      <p className="text-xs text-gray-500">Over 18+</p>
                    </div>
                    <div className="flex items-center">
                      <button
                        className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 text-gray-500 hover:bg-gray-50 cursor-pointer"
                        onClick={() =>
                          setAdultCount(Math.max(1, adultCount - 1))
                        }
                      >
                        <i className="fi fi-rr-minus text-xs"></i>
                      </button>
                      <span className="mx-4 w-6 text-center text-gray-800">
                        {adultCount}
                      </span>
                      <button
                        className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 text-gray-500 hover:bg-gray-50 cursor-pointer"
                        onClick={() => setAdultCount(adultCount + 1)}
                      >
                        <i className="fi fi-rr-plus text-xs"></i>
                      </button>
                    </div>
                  </div>

                  {/* Children */}
                  <div className="flex items-center justify-between mb-4 border-b border-gray-200 pb-2">
                    <div>
                      <p className="font-medium text-gray-800">Child</p>
                      <p className="text-xs text-gray-500">Ages 2-17</p>
                    </div>
                    <div className="flex items-center">
                      <button
                        className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 text-gray-500 hover:bg-gray-50 cursor-pointer"
                        onClick={() =>
                          setChildCount(Math.max(0, childCount - 1))
                        }
                      >
                        <i className="fi fi-rr-minus text-xs"></i>
                      </button>
                      <span className="mx-4 w-6 text-center text-gray-800">
                        {childCount}
                      </span>
                      <button
                        className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 text-gray-500 hover:bg-gray-50 cursor-pointer"
                        onClick={() => setChildCount(childCount + 1)}
                      >
                        <i className="fi fi-rr-plus text-xs"></i>
                      </button>
                    </div>
                  </div>

                  {/* Infants */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-800">Infants</p>
                      <p className="text-xs text-gray-500">Under 2</p>
                    </div>
                    <div className="flex items-center">
                      <button
                        className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 text-gray-500 hover:bg-gray-50 cursor-pointer"
                        onClick={() =>
                          setInfantCount(Math.max(0, infantCount - 1))
                        }
                      >
                        <i className="fi fi-rr-minus text-xs"></i>
                      </button>
                      <span className="mx-4 w-6 text-center text-gray-800">
                        {infantCount}
                      </span>
                      <button
                        className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 text-gray-500 hover:bg-gray-50 cursor-pointer"
                        onClick={() => setInfantCount(infantCount + 1)}
                      >
                        <i className="fi fi-rr-plus text-xs"></i>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Book Now Button */}
                <button
                  onClick={handleBookNow}
                  className="w-full h-12 bg-primary-600 text-white font-medium rounded-full flex items-center justify-center mb-3 hover:bg-primary-700 transition duration-150 cursor-pointer"
                >
                  Book Now
                  <i className="fi fi-rr-arrow-right ml-2"></i>
                </button>

                {/* Download Itinerary */}
                <button
                  onClick={handleDownloadItinerary}
                  className="w-full h-12 text-center text-gray-800 flex items-center bg-white rounded-full justify-center hover:text-gray-800 cursor-pointer"
                >
                  Download Itinerary
                  <i className="fi fi-rr-download ml-2"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Fixed booking button on mobile */}
      <div className="fixed-booking-btn lg:hidden flex items-center justify-between">
        <div className="flex flex-col">
          <div className="flex items-center">
            <span className="text-xl font-bold text-gray-800">
              ₹ {packageData.price.toLocaleString()}
            </span>
            <span className="text-gray-500 text-xs ml-1">/ Person</span>
          </div>
          <span className="text-xs text-gray-500">
            {packageData.nights}N {packageData.days}D •{" "}
            {selectedStayCategory === "budget"
              ? "Budget"
              : selectedStayCategory === "standard"
              ? "Standard"
              : "Luxury"}{" "}
            Stay
          </span>
        </div>
        <button
          onClick={toggleBookingDrawer}
          className="bg-primary-600 text-white rounded-full px-6 py-3 flex items-center hover:bg-primary-700 transition duration-150"
        >
          Book Now
          <i className="fi fi-rr-arrow-right ml-2"></i>
        </button>
      </div>

      {/* Mobile booking drawer overlay */}
      <div
        className={`drawer-overlay ${isBookingDrawerOpen ? "open" : ""}`}
        onClick={closeDrawer}
      ></div>

      {/* Mobile booking drawer */}
      <div
        className={`mobile-booking-drawer ${isBookingDrawerOpen ? "open" : ""} !z-[100]`}
      >
        {/* Sticky header */}
        <div className="sticky top-0 bg-white p-4 border-b border-gray-200 z-10">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-800">
              Complete Booking
            </h3>
            <button
              className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500"
              onClick={closeDrawer}
            >
              <i className="fi fi-rr-cross-small"></i>
            </button>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="p-4 pb-[140px]">
          <div className="border-b border-gray-200 pb-4 mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-700">{packageData.title}</span>
              <div className="bg-gray-900 text-white text-xs px-2 py-1 rounded-full w-[100px] text-center">
                {packageData.nights}N {packageData.days}D
              </div>
            </div>
            <div className="flex items-center mb-2">
              <span className="text-2xl font-bold text-gray-800">
                ₹ {packageData.price.toLocaleString()}
              </span>
              <span className="text-gray-500 text-sm ml-1">/ Person</span>
            </div>
            <span className="bg-[#dfeeff] text-[#0057c9] text-xs font-medium px-2.5 py-1 rounded-full">
              {selectedStayCategory === "budget"
                ? "Budget Stay"
                : selectedStayCategory === "standard"
                ? "Standard Stay"
                : "Luxury Stay"}
            </span>
          </div>

        

          {/* Starting Date */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-800 mb-2">
              Starting Date
            </label>
            <div className="relative">
              <DatePicker
                selected={selectedDate}
                onChange={(date) => setSelectedDate(date)}
                minDate={new Date()} // Prevents selecting dates in the past
                placeholderText="Choose Date"
                className="w-full h-11 px-4 pr-10 border text-gray-800 border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent cursor-pointer"
                dateFormat="dd/MM/yyyy"
                popperPlacement="top-start"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-500">
                <i className="fi fi-rr-calendar text-lg"></i>
              </div>
            </div>
          </div>

          {/* No. of Tickets */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-800 mb-4">
              No. of Tickets
            </label>

            {/* Adults */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="font-medium text-gray-800">Adult</p>
                <p className="text-xs text-gray-500">Over 18+</p>
              </div>
              <div className="flex items-center">
                <button
                  className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 text-gray-500 hover:bg-gray-50 cursor-pointer"
                  onClick={() => setAdultCount(Math.max(1, adultCount - 1))}
                >
                  <i className="fi fi-rr-minus text-xs"></i>
                </button>
                <span className="mx-4 w-6 text-center text-gray-800">
                  {adultCount}
                </span>
                <button
                  className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 text-gray-500 hover:bg-gray-50 cursor-pointer"
                  onClick={() => setAdultCount(adultCount + 1)}
                >
                  <i className="fi fi-rr-plus text-xs"></i>
                </button>
              </div>
            </div>

            {/* Children */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="font-medium text-gray-800">Child</p>
                <p className="text-xs text-gray-500">Ages 2-17</p>
              </div>
              <div className="flex items-center">
                <button
                  className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 text-gray-500 hover:bg-gray-50 hover:border-primary-300 cursor-pointer"
                  onClick={() => setChildCount(Math.max(0, childCount - 1))}
                >
                  <i className="fi fi-rr-minus text-xs"></i>
                </button>
                <span className="mx-4 w-6 text-center text-gray-800">
                  {childCount}
                </span>
                <button
                  className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 text-gray-500 hover:bg-gray-50 cursor-pointer"
                  onClick={() => setChildCount(childCount + 1)}
                >
                  <i className="fi fi-rr-plus text-xs"></i>
                </button>
              </div>
            </div>

            {/* Infants */}
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-800">Infants</p>
                <p className="text-xs text-gray-500">Under 2</p>
              </div>
              <div className="flex items-center">
                <button
                  className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 text-gray-500 hover:bg-gray-50 cursor-pointer"
                  onClick={() => setInfantCount(Math.max(0, infantCount - 1))}
                >
                  <i className="fi fi-rr-minus text-xs"></i>
                </button>
                <span className="mx-4 w-6 text-center text-gray-800">
                  {infantCount}
                </span>
                <button
                  className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 text-gray-500 hover:bg-gray-50 cursor-pointer"
                  onClick={() => setInfantCount(infantCount + 1)}
                >
                  <i className="fi fi-rr-plus text-xs"></i>
                </button>
              </div>
            </div>
          </div>

          {/* Total Price Calculation */}
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">
                Adults ({adultCount} × ₹{packageData.price.toLocaleString()})
              </span>
              <span className="text-gray-800">
                ₹{(adultCount * packageData.price).toLocaleString()}
              </span>
            </div>
            {childCount > 0 && (
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">
                  Children ({childCount} × ₹
                  {(packageData.price * 0.7).toLocaleString()})
                </span>
                <span className="text-gray-800">
                  ₹{(childCount * packageData.price * 0.7).toLocaleString()}
                </span>
              </div>
            )}
            <div className="border-t border-gray-200 my-2 pt-2 flex justify-between font-medium">
              <span className="text-gray-800">Total Amount</span>
              <span className="text-gray-800">
                ₹
                {(
                  adultCount * packageData.price +
                  childCount * packageData.price * 0.7
                ).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Download Itinerary */}
          <button
            onClick={handleDownloadItinerary}
            className="hidden lg:flex w-full text-center text-gray-700  items-center justify-center hover:text-gray-800 cursor-pointer"
          >
            Download Itinerary
            <i className="fi fi-rr-document-arrow-down ml-2"></i>
          </button>
        </div>

        {/* Sticky Book Now Button at bottom */}
        <div className="sticky bottom-0 bg-white p-4 border-t border-gray-200">
          <button
            onClick={handleBookNow}
            className="w-full h-12 bg-primary-600 text-white rounded-lg flex items-center justify-center hover:bg-primary-700 transition duration-150 cursor-pointer"
          >
            Checkout
            <i className="fi fi-rr-arrow-right ml-2"></i>
          </button>
        </div>
      </div>
    </>
  );
}
