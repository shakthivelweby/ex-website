"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import LocationSearchPopup from "@/components/LocationSearchPopup";
import Search from "@/components/Search/Search";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import EventCard from "@/components/eventCard";
import PackageCard from "@/components/PackageCard";
import DestinationCard from "@/components/DestinationCard";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, FreeMode, Autoplay } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/free-mode';


export default function HomePage() {
  const [selectedTrip, setSelectedTrip] = useState("Packages");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [isLocationPopupOpen, setIsLocationPopupOpen] = useState(false);
  const [locationCoordinates, setLocationCoordinates] = useState({
    latitude: "",
    longitude: "",
  });

  // Add state for destination
  const [destinationName, setDestinationName] = useState("");

  const router = useRouter();



  const locationText = {
    Packages: 'Where you want to explore?',
    Scheduled: 'Where you want to explore?',
    Activities: 'Where you want to do activity?',
    Attractions: 'Where you want to visit?',
    Rentals: 'Where you want to rent a vehicle?',
    Events: 'Where you want to attend an event?'
  }

  const redirects = {
    Packages: "/packages",
    Scheduled: "/scheduled",
    Activities: "/activities",
    Attractions: "/attractions",
    Rentals: "/rentals",
    Events: "/events"
  }

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const tripOptions = [
    { value: "Packages", label: "Packages", icon: "fi fi-rr-umbrella-beach" },
    { value: "Scheduled", label: "Scheduled Trips", icon: "fi fi-rr-calendar" }
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle destination selection
  const handleDestinationSelect = (destination) => {
    // Set the destination name in state
    setDestinationName(destination.name);
    setSelectedLocation(destination.name);

    // Create destination data object with proper structure
    const destinationData = {
      id: destination.id,
      name: destination.name,
      type: destination.type,
      country_id: destination.type === 'country' ? destination.id : destination.country_id,
      state_id: destination.type === 'state' ? destination.id : destination.state_id,
      destination_id: destination.type === 'destination' ? destination.id : null
    };

    // Store in localStorage
    localStorage.setItem("choosedDestination", JSON.stringify(destinationData));

    // Close the popup
    setIsLocationPopupOpen(false);

    // Navigate based on trip type
    if (selectedTrip === "Packages") {
      router.push(`/packages/${destinationData.country_id}?state=${destinationData.state_id}&destination=${destinationData.destination_id}`);
    } else {
      router.push('/scheduled');
    }
  };

  // Handle place selection from Google Autocomplete
  const handlePlaceSelect = (place) => {
    if (place.geometry && place.geometry.location) {
      const locationData = {
        name: place.name || place.formatted_address,
        latitude: place.geometry.location.lat(),
        longitude: place.geometry.location.lng(),
        formattedAddress: place.formatted_address,
      };

      // Update state with the location data
      setSelectedLocation(locationData.name);
      setLocationCoordinates({
        latitude: locationData.latitude,
        longitude: locationData.longitude,
      });

      // Save to localStorage
      localStorage.setItem("locationCoordinates", JSON.stringify({
        latitude: locationData.latitude,
        longitude: locationData.longitude,
      }));
      localStorage.setItem("startLocation", locationData.name);

      // Close popup
      setIsLocationPopupOpen(false);
    }
  };

  // Load destination from localStorage on mount
  useEffect(() => {
    const savedDestination = localStorage.getItem("choosedDestination");
    if (savedDestination) {
      const destination = JSON.parse(savedDestination);
      setDestinationName(destination.name);
      setSelectedLocation(destination.name);
    }
  }, []);

  // Handle search form submission
  const handleSearch = (e) => {
    e.preventDefault();

    const savedDestination = localStorage.getItem("choosedDestination");

    if (!savedDestination) {
      // If no destination is selected, open the destination popup
      setIsLocationPopupOpen(true);
      return;
    }

    const destination = JSON.parse(savedDestination);

    // Get the redirect URL for the selected trip type
    const tripType = selectedTrip.split(" ")[0];

    if (tripType === "Packages") {
      // For packages, include all necessary parameters
      let url = `/packages/${destination.country_id}`;
      if (destination.state_id) {
        url += `?state=${destination.state_id}`;
      }
      if (destination.destination_id) {
        url += `${destination.state_id ? '&' : '?'}destination=${destination.destination_id}`;
      }
      router.push(url);
    } else {
      // For scheduled trips, just go to the scheduled page
      router.push('/scheduled');
    }
  };

  // Inside the form, replace the existing dropdown with:
  const CustomDropdown = () => (
    <div className="flex-1 relative" ref={dropdownRef}>
      <label className="absolute top-1.5 left-4 text-xs text-gray-600 flex items-center gap-1.5">
        <i className="fi fi-rr-search text-[10px] relative top-[0px]"></i>
        What you are looking for?
      </label>
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="w-full appearance-none bg-transparent rounded-3xl border-0 outline-none px-4 pt-6 pb-1.5 text-[14px] text-gray-800 font-medium cursor-pointer h-[50px] hover:bg-black/5 transition-colors text-left flex items-center justify-between group"
        >
          <div className="flex items-center gap-2.5">
            <i className={`${tripOptions.find(opt => opt.value === selectedTrip)?.icon} text-gray-800 text-base transition-colors`}></i>
            <span className="text-base">{selectedTrip}</span>
          </div>
          <motion.i
            className="fi fi-rr-angle-small-down text-gray-800 text-sm group-hover:text-primary-500 transition-colors"
            animate={{ rotate: isDropdownOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          />
        </button>

        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{
            opacity: isDropdownOpen ? 1 : 0,
            y: isDropdownOpen ? 0 : -10,
            pointerEvents: isDropdownOpen ? "auto" : "none"
          }}
          transition={{ duration: 0.2 }}
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            left: 0,
            right: 0,
            zIndex: 1000
          }}
          className="mt-1 md:mt-2 bg-white/80 rounded-2xl shadow-xl border border-gray-100/50 backdrop-blur-xl overflow-hidden"
        >
          <div className="py-1.5">
            {tripOptions.map((option) => (
              <motion.button
                key={option.value}
                type="button"
                onClick={() => {
                  setSelectedTrip(option.value);
                  setIsDropdownOpen(false);
                }}
                className={`w-full px-5 py-3.5 text-left text-[14px] hover:bg-gray-50/80 transition-all flex items-center gap-3 group ${selectedTrip === option.value ? 'text-primary-500 font-medium bg-primary-50/50' : 'text-gray-700'
                  }`}
                whileHover={{ backgroundColor: "rgba(0,0,0,0.03)" }}
                whileTap={{ backgroundColor: "rgba(0,0,0,0.05)" }}
              >
                <i className={`${option.icon} text-lg ${selectedTrip === option.value ? 'text-primary-500' : 'text-gray-500 group-hover:text-primary-500 transition-colors'
                  }`}></i>
                <div>
                  <div className="font-medium">{option.label}</div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {option.value === "Packages" ? "Explore curated travel packages" : "Join scheduled group trips"}
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white mt-5">
      <div className="relative">
        {selectedTrip === "Packages" || selectedTrip === "Scheduled" ? (
          <Search
            isOpen={isLocationPopupOpen}
            onClose={() => setIsLocationPopupOpen(false)}
            type={selectedTrip === "Packages" ? "package" : "schedule"}
          />
        ) : (
          <LocationSearchPopup
            title={locationText[selectedTrip.split(" ")[0]]}
            isOpen={isLocationPopupOpen}
            onClose={() => setIsLocationPopupOpen(false)}
            onPlaceSelected={handlePlaceSelect}
            googleApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
          />
        )}
        <section className="container mx-auto px-4 py-4 lg:py-0 mt-4 ">
          <div className="bg-white relative z-10">
            {/* Background Image with Zoom Animation */}
            <div className="md:h-[500px] h-[470px] rounded-[32px] relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-transparent z-[1] rounded-[32px]"></div>
              <motion.div
                animate={{
                  scale: [1.3, 1],
                  opacity: [0.8, 1]
                }}
                transition={{
                  scale: {
                    duration: 10,
                    ease: "easeOut"
                  },
                  opacity: {
                    duration: 1,
                    ease: "linear"
                  }
                }}
                style={{
                  width: '100%',
                  height: '100%',
                  position: 'relative'
                }}
              >
                <Image
                  src="https://images.pexels.com/photos/2155749/pexels-photo-2155749.jpeg"
                  alt="banner image"
                  fill
                  className="object-cover rounded-[32px]"
                  priority
                  sizes="100vw"
                  style={{
                    objectFit: 'cover',
                    width: '100%',
                    height: '100%'
                  }}
                />
              </motion.div>
            </div>

            {/* Hero Content with Animation */}
            <div className="absolute inset-0 px-4 flex items-center z-[2]">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center w-full"
              >
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="text-4xl lg:text-6xl font-bold text-white mb-2 leading-tight tracking-tighter"
                >
                  Pay Less, Book Direct
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="text-xl text-white/90 mb-6 md:mb-12"
                >
                  The new way to plan your trip!
                </motion.p>

                {/* Search Box with Animation */}
                <motion.form
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  onSubmit={handleSearch}
                  className="backdrop-blur-md bg-white/60 rounded-[24px] md:rounded-full shadow-lg overflow-visible p-3 md:p-1.5 max-w-[650px] mx-auto w-full border border-white/20"
                >
                  <div className="flex flex-col md:flex-row gap-3">
                    <CustomDropdown />

                    {/* Where you want to start from */}
                    <div className="flex-1 relative">
                      <label className="absolute top-1.5 left-4 text-xs text-gray-600 z-10 flex items-center gap-1.5">
                        <i className="fi fi-rr-marker text-[10px] top-[0px]"></i>
                        {locationText[selectedTrip.split(" ")[0]]}
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={selectedLocation}
                          onClick={() => setIsLocationPopupOpen(true)}
                          readOnly
                          className="w-full appearance-none bg-transparent rounded-3xl border-0 outline-none px-4 pt-6 pb-1.5 text-[14px] text-gray-800 font-medium cursor-pointer h-[50px]"
                          placeholder="Enter location..."
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                          <i className="fi fi-rr-angle-small-down text-gray-800 text-sm"></i>
                        </div>
                      </div>
                    </div>

                    {/* Search Button */}
                    <button type="submit" className="w-full md:w-auto bg-primary-500 text-white rounded-full transition-colors hover:bg-primary-600 flex items-center justify-center gap-2 px-5 py-2.5 md:px-3.5 md:py-3.5 search-pulse lg:!search-pulse-none">
                      <span className="text-sm font-semibold md:hidden">Search</span>
                      <Image src="/home/search-icon.svg" alt="search icon" width={18} height={18} className="md:w-6 md:h-6" />
                    </button>
                  </div>
                </motion.form>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Featured Events Section */}
        <section className="px-4 lg:px-10 py-16 bg-gradient-to-br from-gray-50 to-blue-50 rounded-3xl hidden">
          <div className="container mx-auto flex flex-col items-start mb-10">
            <div className="flex items-center gap-2 mb-4 justify-start">
              <div className="w-12 h-[2px] bg-primary-500"></div>
              <span className="text-xs tracking-[0.2em] uppercase text-primary-600 font-medium">
                Global Events
              </span>
            </div>
            <div className="flex items-end justify-between w-full">
              <div>
                <h2 className="text-3xl lg:text-4xl font-normal text-gray-900 mb-3 tracking-tight">
                  Featured Events & Festivals
                </h2>
                <p className="text-gray-600 max-w-2xl text-base">
                  Travel with a twist – Experience global events. Plan your holiday around the world&apos;s most exciting festivals and celebrations.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-10 w-full">
              {[
                { title: "Oktoberfest, Germany", description: "Raise a toast in Munich", image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", date: "Sep 21 - Oct 6", price: "₹25,000" },
                { title: "Cherry Blossom Festival, Japan", description: "A pink wonderland", image: "https://images.unsplash.com/photo-1522383225653-ed111181a951?q=80&w=1176&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", date: "Mar 20 - Apr 10", price: "₹45,000" },
                { title: "La Tomatina, Spain", description: "The ultimate food fight", image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", date: "Aug 28", price: "₹35,000" },
                { title: "Dubai Shopping Festival", description: "Shopper's paradise", image: "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?q=80&w=686&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", date: "Dec 15 - Jan 15", price: "₹55,000" }
              ].map((event, index) => (
                <EventCard key={event.title} event={{
                  id: index + 1,
                  title: event.title,
                  date: event.date,
                  venue: event.description,
                  type: "Festival",
                  image: event.image,
                  price: event.price,
                  promoted: true,
                  interest_count: 150 + (index * 50)
                }} />
              ))}
          </div>
        </div>
        </section>
        
        {/* Duration-wise Packages Section */}
        <section className="container mx-auto px-4 py-16 hidden">
          <div className="flex flex-col items-start mb-10">
            <div className="flex items-center gap-2 mb-4 justify-start">
              <div className="w-12 h-[2px] bg-primary-500"></div>
              <span className="text-xs tracking-[0.2em] uppercase text-primary-600 font-medium">
                Trip Duration
              </span>
              </div>
            <div className="flex items-end justify-between w-full">
                <div>
                <h2 className="text-3xl lg:text-4xl font-normal text-gray-900 mb-3 tracking-tight">
                  Duration-wise Packages
                </h2>
                <p className="text-gray-600 max-w-2xl text-base">
                Designed for Medium-Length Journeys (5–14 Days)
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2  gap-6 mt-10 w-full ">
              {/* left side */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-[2/3]">
                {/* card 1 */}
                <div className="relative h-[300px] w-full rounded-[32px] overflow-hidden">

                <Image src="https://images.unsplash.com/photo-1612810436541-336b73fbcf9f?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="duration-1" fill className="object-cover" />
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent z-[1]"></div>
                
                    <div className="text-gray-100 text-sm font-medium mb-2 absolute top-0 left-4 z-10 mt-3 bg-primary-500 rounded-2xl py-1 px-2">
                      <i className="fi fi-rr-clock text-sm mr-2"></i>
                      5-10 Days
                    </div>
                <div> 
                <div className="absolute inset-0 z-10 flex items-end px-2 py-2 m-3">
                    
                  <div className="flex flex-col gap-2 justify-center items-start">
                    <h3 className="text-gray-100 text-base font-medium">Ahmedabad - Jaisalmer - Kashmir (VB) - Rishikesh - Delhi - Agra</h3>
                    <h3 className="text-gray-100 text-lg font-medium">₹ 16,500 <span className="text-white/90 text-sm font-normal">per person</span></h3>
                      </div>
                    </div>
                  </div>
                </div>
                {/* card 2 */}
                <div className="relative h-[300px] w-full rounded-[32px] overflow-hidden">

                <Image src="https://images.unsplash.com/photo-1588096344356-9b497caeeb64?q=80&w=784&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="duration-1" fill className="object-cover" />
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent z-[1]"></div>
                
                <div className="text-gray-100 text-sm font-medium mb-2 absolute top-0 left-4 z-10 mt-3 bg-primary-500 rounded-2xl py-1 px-2">
                      <i className="fi fi-rr-clock text-sm mr-2"></i>
                      5-10 Days
                  </div>
                <div className="absolute inset-0 z-10 flex items-end px-4 py-2 m-3">
                    
                  <div className="flex flex-col gap-2 justify-center items-start">
                    <h3 className="text-gray-100 text-base font-medium">Ahmedabad - Udaipur - Jaisalmer - Amritsar - Dharamshala - Delhi - Goa</h3>
                    <h3 className="text-gray-100 text-lg font-medium">₹ 14,000 <span className="text-white/90 text-sm font-normal">per person</span></h3>
              </div>
            </div>
                </div>
            
                {/* card 3 */}
                <div className="relative h-[300px] w-full rounded-[32px] overflow-hidden">

                  <Image src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="duration-1" fill className="object-cover" />
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent z-[1]"></div>
                
                <div className="text-gray-100 text-sm font-medium mb-2 absolute top-0 left-4 z-10 mt-3 bg-primary-500 rounded-2xl py-1 px-2">
                      <i className="fi fi-rr-clock text-sm mr-2"></i>
                    11-13 Days
                    </div>
                <div className="absolute inset-0 z-10 flex items-end px-2 py-2 m-3">
                    
                  <div className="flex flex-col gap-2 justify-center items-start">
                    <h3 className="text-gray-100 text-base font-medium">Ahmedabad - Jaisalmer - Amritsar - Manali - Delhi - Agra - Gangtok</h3>
                    <h3 className="text-gray-100 text-lg font-medium">₹ 22,500 <span className="text-white/90 text-sm font-normal">per person</span></h3>
                  </div>
            </div>
                </div>
            
                {/* card 4 */}
                <div className="relative h-[300px] w-full rounded-[32px] overflow-hidden">

                  <Image src="https://images.unsplash.com/photo-1650530777057-3a7dbc24bf6c?q=80&w=801&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="duration-1" fill className="object-cover" />
                  
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent z-[1]"></div>
                  
                  <div className="text-gray-100 text-sm font-medium mb-2 absolute top-0 left-4 z-10 mt-3 bg-primary-500 rounded-2xl py-1 px-2">
                        <i className="fi fi-rr-clock text-sm mr-2"></i>
                        1-5 Days
                      </div>
                  <div className="absolute inset-0 z-10 flex items-end px-2 py-2 m-3">
                      
                    <div className="flex flex-col gap-2 justify-center items-start">
                      <h3 className="text-gray-100 text-base font-medium">Ahmedabad - Jaisalmer - Jaipur - Amritsar - Manali - Delhi - Agra</h3>
                      <h3 className="text-gray-100 text-lg font-medium">₹ 10,000 <span className="text-white/90 text-sm font-normal">per person</span></h3>
                      </div>
                    </div>
                </div>

                </div>
              {/* right side */}
              <div className="w-[1/3]">
                <div className="relative h-full w-full rounded-[32px] overflow-hidden">

                    <Image src="https://images.unsplash.com/photo-1584732200355-486a95263014?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="duration-1" fill className="object-cover" />
                    
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent z-[1]"></div>
                    
                    <div className="text-gray-100 text-sm font-medium mb-2 absolute top-0 left-4 z-10 mt-3 bg-primary-500 rounded-2xl py-1 px-2">
                        <i className="fi fi-rr-clock text-sm mr-2"></i>
                        10-14 Days
              </div>
                    <div className="absolute inset-0 z-10 flex items-end px-2 py-2 m-3">

                    <div className="flex flex-col gap-2 justify-center items-start">
                      <h3 className="text-gray-100 text-base font-medium">Ahmedabad - Jaisalmer - Kashmir - Amritsar - Delhi - Agra</h3>
                      <h3 className="text-gray-100 text-lg font-medium">₹ 18000 <span className="text-white/90 text-sm font-normal">per person</span></h3>
            </div>
          </div>
        </div>
      </div>

            </div>
            <div className="text-center mt-8 w-full">
              <Link href="/packages" className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-semibold text-lg">
                Browse by Duration
                <i className="fi fi-rr-arrow-right"></i>
              </Link>
            </div>
          </div>
        </section>

        {/* Blog Section */}
        <section className="container mx-auto px-4 py-16 hidden">
          <div className="flex flex-col items-start mb-10">
            <div className="flex items-end justify-between w-full">
              <div>
              <div className="flex items-center gap-2 mb-4 justify-start">
              <div className="w-12 h-[2px] bg-primary-500"></div>
              <span className="text-xs tracking-[0.2em] uppercase text-primary-600 font-medium">
                Travel Blog
              </span>
            </div>
                <h2 className="text-3xl lg:text-4xl font-normal text-gray-900 mb-3 tracking-tight">
                  Latest Travel Stories & Tips
                </h2>
                <p className="text-gray-600 max-w-2xl text-base">
                  Discover hidden gems and expert travel tips from our community.
                </p>
              </div>
              <Link href="/blog" className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-semibold text-lg">
                View All Posts
                <i className="fi fi-rr-arrow-right"></i>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-10 w-full">
              {[
                {
                  title: "10 Hidden Gems in Himachal Pradesh",
                  excerpt: "Discover the lesser-known destinations that will make your Himachal trip unforgettable...",
                  image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                  readTime: "5 min read",
                  date: "Dec 15, 2024"
                },
                {
                  title: "Budget Travel: How to Explore India on ₹1000/Day",
                  excerpt: "Smart tips and tricks to make the most of your budget while exploring incredible destinations...",
                  image: "https://images.unsplash.com/photo-1564507592333-c60657eea523?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                  readTime: "8 min read",
                  date: "Dec 12, 2024"
                },
                {
                  title: "Festival Season Travel: Best Times to Visit",
                  excerpt: "Plan your trips around India's vibrant festivals for an authentic cultural experience...",
                  image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                  readTime: "6 min read",
                  date: "Dec 10, 2024"
                }
              ].map((blog, index) => (
                <div key={blog.title} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group cursor-pointer">
                  <div className="relative h-48 overflow-hidden">
                    <Image 
                      src={blog.image} 
                      alt={blog.title} 
                      fill 
                      className="object-cover group-hover:scale-105 transition-transform duration-300" 
                    />
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                      <span>{blog.date}</span>
                      <span>•</span>
                      <span>{blog.readTime}</span>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors duration-300">
                      {blog.title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed mb-4">
                      {blog.excerpt}
                    </p>
                    <div className="flex items-center gap-2 text-primary-600 font-medium text-sm group-hover:text-primary-700 transition-colors duration-300">
                      Read More
                      <i className="fi fi-rr-arrow-right text-xs group-hover:translate-x-1 transition-transform duration-300"></i>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="px-4 lg:px-10 py-16 bg-gradient-to-br from-gray-50 to-blue-50 rounded-3xl hidden">
          <div className="container mx-auto">
            <div className="text-center mb-16">
              <div className="flex items-center justify-center gap-2 mb-4">
                <div className="w-12 h-[2px] bg-primary-500"></div>
                <span className="text-xs tracking-[0.2em] uppercase text-primary-600 font-medium">
                  Customer Stories
                </span>
                <div className="w-12 h-[2px] bg-primary-500"></div>
              </div>
              <h2 className="text-3xl lg:text-4xl font-normal text-gray-900 mb-4 tracking-tight">
                What Our Travelers Say
              </h2>
                              <p className="text-gray-600 max-w-2xl mx-auto text-base">
                  Real experiences from real travelers who&apos;ve explored the world with us
                </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  name: "Priya Sharma",
                  location: "Mumbai, Maharashtra",
                  rating: 5,
                  image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                  testimonial: "Amazing experience! The Himachal package exceeded all expectations. The team was professional and every detail was perfectly planned.",
                  package: "Himachal Adventure Package"
                },
                {
                  name: "Rajesh Kumar",
                  location: "Delhi, NCR",
                  rating: 5,
                  image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                  testimonial: "Best decision to book through this platform. Got a luxury experience at budget prices. Will definitely recommend to friends!",
                  package: "Golden Triangle Luxury Tour"
                },
                {
                  name: "Anjali Patel",
                  location: "Ahmedabad, Gujarat",
                  rating: 5,
                  image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                  testimonial: "The Rajasthan tour was magical! From the desert safari to palace stays, everything was perfectly organized. Thank you for the memories!",
                  package: "Rajasthan Heritage Tour"
                }
              ].map((testimonial, index) => (
                <div key={testimonial.name} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="relative w-12 h-12 rounded-full overflow-hidden">
                      <Image 
                        src={testimonial.image} 
                        alt={testimonial.name} 
                        fill 
                        className="object-cover" 
                      />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                      <p className="text-sm text-gray-500">{testimonial.location}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1 mb-3">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <i key={i} className="fi fi-sr-star text-yellow-400 text-sm"></i>
                    ))}
                  </div>
                  
                                      <p className="text-gray-600 text-sm leading-relaxed mb-4">
                      &ldquo;{testimonial.testimonial}&rdquo;
                    </p>
                  
                  <div className="text-xs text-primary-600 font-medium">
                    {testimonial.package}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="text-center mt-12">
              <div className="inline-flex items-center gap-6 bg-white/80 backdrop-blur-sm rounded-2xl px-8 py-6 shadow-lg">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary-600 mb-1">10,000+</div>
                  <div className="text-sm text-gray-600">Happy Travelers</div>
                </div>
                <div className="w-px h-12 bg-gray-200"></div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary-600 mb-1">4.9/5</div>
                  <div className="text-sm text-gray-600">Average Rating</div>
                </div>
                <div className="w-px h-12 bg-gray-200"></div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary-600 mb-1">50+</div>
                  <div className="text-sm text-gray-600">Destinations</div>
                </div>
              </div>
            </div>
          </div>
        </section>



{/* NEW DESIGN SECTION */}
      {/* Book without agency section */}
        <section className="container mx-auto px-4 hidden">        
    
                <div className="relative overflow-hidden">
                {/* Decorative blurred circle background at the top */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] md:w-[600px] md:h-[600px] bg-primary-200 rounded-full blur-3xl opacity-40 md:opacity-30 z-0"></div>
                  {/* Heading */}
                  <div className="text-center flex flex-col items-center justify-center lg:max-w-2xl mx-auto pt-20 pb-20  relative">
                    <div className="inline-block relative">
                        <Image
                          src="/home/star-light.png"
                          alt=""
                          width={100}
                          height={100}
                          className="absolute -left-8 -top-6 w-6 h-6 animate-pulse"
                        />
                        <h2 className="text-3xl md:text-[42px] font-semibold text-gray-800 tracking-tighter mb-6 ">
                          Book your trip without<br />agency fee
                        </h2>
                        <Image
                          src="/home/star-dark.png"
                          alt=""
                          width={100}
                          height={100}
                          className="absolute -right-10 -bottom-4 w-10 h-10 animate-pulse"
                        />
                    </div>
                    <p className="text-gray-600 text-base">
                      we build the perfect solutions for travellers life easy
                    </p>
                    <div className="w-44 mt-6">
                      <Image src="/home/line.png" alt="" width={1000} height={1000} className="w-full h-full" />
                    </div>
                  </div>
                  {/* Cards */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 items-center gap-6">
                    {/* left card */}
                      <div className="">
                        <div className="flex flex-col gap-6">
                          {/* image */}
                            <div className="w-full h-[250px]">
                              <Image src="/home/left-img.webp" alt="" width={1000} height={1000} className="w-full h-full rounded-2xl border-[3px] border-primary-400" />
                            </div>
                            {/* content */}
                            <div className="bg-gray-100 rounded-2xl p-4 relative">
                              {/* content */}
                              <div>
                                <h3 className="text-xl font-semibold text-gray-800 mb-2 tracking-tighter leading-snug">
                                  Save 20% on all <br/> bookings!
                                </h3>
                                <p className="text-gray-600 text-sm mt-14">
                                  We offer the best deals on  all  bookings, so <br/> you can save more and travel more.
                                </p>
                              </div>
                              {/* icon */}
                              <div className="absolute bottom-0 right-0 bg-white">
                                <div className="w-14 h-14 bg-primary-50 border-[1px] border-primary-200 p-2 rounded-full flex items-center justify-center m-2">
                                  <i className="fi fi-rr-megaphone text-primary-500 text-2xl"></i>
                                </div>
                              </div>
                            </div>
                        </div>
                      </div>
                      {/* center card */}
                      <div className="">
                          {/* image */}
                          <div>
                            <Image src="/home/center-img.webp" alt="" width={1000} height={1000} className="w-full h-full rounded-2xl border-[3px] border-primary-400" />
                          </div>
                      </div>
                      {/* right card */}
                      <div className="">
                        <div className="flex flex-col gap-6">
                            {/* content */}
                            <div className="bg-gray-100 rounded-2xl p-4 relative">
                              {/* content */}
                              <div>
                                <h3 className="text-xl font-semibold text-gray-800 mb-2 tracking-tighter leading-snug">
                                Book direclty to <br/> local suppliers
                                </h3>
                                <p className="text-gray-600 text-sm mt-14">
                                We offer the best deals on  all  bookings, so <br/> you can save more and travel more.
                                </p>
                              </div>
                              {/* icon */}
                              <div className="absolute bottom-0 right-0 bg-white">
                                <div className="w-14 h-14 bg-primary-50 border-[1px] border-primary-200 p-2 rounded-full flex items-center justify-center m-2">
                                  <i className="fi fi-rr-check-circle text-primary-500 text-2xl"></i>
                                </div>
                              </div>
                            </div>
                          {/* image */}
                            <div className="w-full h-[250px]">
                              <Image src="/home/right-img.webp" alt="" width={1000} height={1000} className="w-full h-full rounded-2xl border-[3px] border-primary-400" />
                            </div>
                          
                        </div>
                      </div>
                  </div>
                </div>
              
                {/* What you can do section */}
                <div className="pt-32 relative overflow-hidden">
                  {/* Decorative blurred circle backgrounds */}
                  <div className="absolute top-0 right-0 translate-x-1 translate-y-1 w-[300px] h-[300px] md:w-[400px] md:h-[400px] bg-primary-200 rounded-full blur-3xl opacity-40 md:opacity-30 z-0"></div>
              
                  {/* Heading */}
                  <div className="max-w-lg relative mb-20 z-10">
                    <div className="relative">
                      <Image
                        src="/home/star-light.png"
                        alt=""
                        width={100}
                        height={100}
                        className="absolute -left-6 -top-6 w-6 h-6 animate-pulse"
                      />
                      <h2 className="text-3xl md:text-[42px] font-semibold text-gray-800 tracking-tighter leading-tight">
                        What you can do<br />with Exploreworld
                      </h2>
                      <Image
                        src="/home/star-dark.png"
                        alt=""
                        width={100}
                        height={100}
                        className="absolute -right-3 bottom-0 w-10 h-10 animate-pulse"
                      />
                    </div>
                    <p className="text-gray-600 text-base mt-4">
                      we build the perfect solutions for travellers life easy
                    </p>
                    <div className="w-44 mt-4">
                      <Image src="/home/line.png" alt="" width={1000} height={1000} className="w-full h-full" />
                    </div>
                  </div>

                  {/* Content Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
                    {/* Left Side Image */}
                    <div className="lg:col-span-1">
                      <div className="h-full rounded-3xl overflow-hidden">
                        <Image
                          src="/home/what-we-do.webp"
                          alt="Happy traveler"
                          width={400}
                          height={800}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>

                    {/* Services Grid */}
                    <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Scheduled Tours */}
                      <div className="bg-[#f5f5f5] rounded-3xl p-6 hover:shadow-lg transition-shadow">
                        <div className="mb-4">
                          <i className="fi fi-rr-calendar-clock text-primary-500 text-2xl"></i>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-3">Scheduled Tours</h3>
                        <p className="text-gray-600 text-sm mb-4">Fixed-date tours planned by trusted local suppliers. Just book and join no planning needed!</p>
                        <a href="#" className="inline-flex items-center text-primary-500 hover:text-primary-600 gap-2">
                          View all
                          <i className="fi fi-rr-arrow-small-right"></i>
                        </a>
                      </div>

                      {/* Packages */}
                      <div className="bg-[#f5f5f5] rounded-3xl p-6 hover:shadow-lg transition-shadow">
                        <div className="mb-4">
                          <i className="fi fi-rr-box text-primary-500 text-2xl"></i>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-3">Packages</h3>
                        <p className="text-gray-600 text-sm mb-4">Fixed-date tours planned by trusted local suppliers. Just book and join no planning needed!</p>
                        <Link href="/explore" className="inline-flex items-center text-primary-500 hover:text-primary-600 gap-2">
                          View all
                          <i className="fi fi-rr-arrow-small-right"></i>
                        </Link>
                      </div>

                      {/* Activity */}
                      <div className="bg-[#f5f5f5] rounded-3xl p-6 hover:shadow-lg transition-shadow">
                        <div className="mb-4">
                          <i className="fi fi-rr-hiking text-primary-500 text-2xl"></i>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-3">Activity</h3>
                        <p className="text-gray-600 text-sm mb-4">Fixed-date tours planned by trusted local suppliers. Just book and join no planning needed!</p>
                        <a href="#" className="inline-flex items-center text-primary-500 hover:text-primary-600 gap-2">
                          View all
                          <i className="fi fi-rr-arrow-small-right"></i>
                        </a>
                      </div>

                      {/* Attractions */}
                      <div className="bg-[#f5f5f5] rounded-3xl p-6 hover:shadow-lg transition-shadow">
                        <div className="mb-4">
                          <i className="fi fi-rr-ferris-wheel text-primary-500 text-2xl"></i>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-3">Attractions</h3>
                        <p className="text-gray-600 text-sm mb-4">Fixed-date tours planned by trusted local suppliers. Just book and join no planning needed!</p>
                        <a href="#" className="inline-flex items-center text-primary-500 hover:text-primary-600 gap-2">
                          View all
                          <i className="fi fi-rr-arrow-small-right"></i>
                        </a>
                      </div>

                      {/* Rentals */}
                      <div className="bg-[#f5f5f5] rounded-3xl p-6 hover:shadow-lg transition-shadow">
                        <div className="mb-4">
                          <i className="fi fi-rr-car-side text-primary-500 text-2xl"></i>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-3">Rentals</h3>
                        <p className="text-gray-600 text-sm mb-4">Fixed-date tours planned by trusted local suppliers. Just book and join no planning needed!</p>
                        <a href="#" className="inline-flex items-center text-primary-500 hover:text-primary-600 gap-2">
                          View all
                          <i className="fi fi-rr-arrow-small-right"></i>
                        </a>
                      </div>

                      {/* Events */}
                      <div className="bg-[#f5f5f5] rounded-3xl p-6 hover:shadow-lg transition-shadow">
                        <div className="mb-4">
                          <i className="fi fi-rr-ticket text-primary-500 text-2xl"></i>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-3">Events</h3>
                        <p className="text-gray-600 text-sm mb-4">Fixed-date tours planned by trusted local suppliers. Just book and join no planning needed!</p>
                        <Link href="/event" className="inline-flex items-center text-primary-500 hover:text-primary-600 gap-2">
                          View all
                          <i className="fi fi-rr-arrow-small-right"></i>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Popular Destinations */}
                <div className="px-4 lg:px-10 py-20 relative overflow-hidden">
                  {/* Decorative blurred circle backgrounds */}
                  <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] md:w-[400px] md:h-[400px] bg-primary-200 rounded-full blur-3xl opacity-40 md:opacity-30 z-0"></div>
                  
                  {/* Header with Navigation */}
                  <div className="flex items-end justify-between mb-16 relative z-10">
                    <div className="max-w-lg">
                      <div className="relative">
                        <Image
                          src="/home/star-light.png"
                          alt=""
                          width={100}
                          height={100}
                          className="absolute -left-6 -top-6 w-6 h-6 animate-pulse"
                        />
                        <h2 className="text-3xl md:text-[42px] font-semibold text-gray-800 tracking-tighter leading-tight">
                          Discover Amazing Places<br />to Visit
                        </h2>
                        <Image
                          src="/home/star-dark.png"
                          alt=""
                          width={100}
                          height={100}
                          className="absolute -right-3 bottom-0 w-10 h-10 animate-pulse"
                        />
                      </div>
                      <p className="text-gray-600 text-base mt-4">
                        we build the perfect solutions for travellers life easy
                      </p>
                      <div className="w-44 mt-4">
                        <Image src="/home/line.png" alt="" width={1000} height={1000} className="w-full h-full" />
                      </div>
                    </div>
                    
                    {/* Navigation Arrows */}
                    <div className="hidden md:flex items-center gap-3">
                      <button 
                        className="destinations-swiper-button-prev w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors group border border-gray-100"
                      >
                        <i className="fi fi-rr-angle-left text-gray-600 group-hover:text-primary-500 transition-colors"></i>
                      </button>
                      <button 
                        className="destinations-swiper-button-next w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors group border border-gray-100"
                      >
                        <i className="fi fi-rr-angle-right text-gray-600 group-hover:text-primary-500 transition-colors"></i>
                      </button>
                    </div>
                  </div>

                  {/* Destinations Swiper Carousel */}
                  <div className="relative z-10">
                    <Swiper
                      modules={[Navigation, FreeMode, Autoplay]}
                      spaceBetween={16}
                      slidesPerView={1.2}
                      freeMode={true}
                      navigation={{
                        prevEl: '.destinations-swiper-button-prev',
                        nextEl: '.destinations-swiper-button-next',
                      }}
                      autoplay={{
                        delay: 4000,
                        disableOnInteraction: false,
                        pauseOnMouseEnter: true,
                      }}
                      breakpoints={{
                        640: {
                          slidesPerView: 2,
                          spaceBetween: 16,
                        },
                        768: {
                          slidesPerView: 2.5,
                          spaceBetween: 16,
                        },
                        1024: {
                          slidesPerView: 3,
                          spaceBetween: 16,
                        },
                        1280: {
                          slidesPerView: 4,
                          spaceBetween: 16,
                        },
                      }}
                      className="pb-6"
                    >
                      {[
                        {
                          name: "Uttar Pradesh",
                          description: "Discover amazing tour packages",
                          image: "https://images.unsplash.com/photo-1564507592333-c60657eea523?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                          packageCount: 2
                        },
                        {
                          name: "Delhi",
                          description: "Discover amazing tour packages",
                          image: "https://images.unsplash.com/photo-1668342081577-9c568eb1d550?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                          packageCount: 1
                        },
                        {
                          name: "Himachal Pradesh",
                          description: "Discover amazing tour packages",
                          image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                          packageCount: 5
                        },
                        {
                          name: "Gujarat",
                          description: "Discover amazing tour packages",
                          image: "https://images.unsplash.com/photo-1585765687665-427ec8513a7b?q=80&w=627&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                          packageCount: 3
                        },
                        {
                          name: "Rajasthan",
                          description: "Discover amazing tour packages",
                          image: "https://images.unsplash.com/photo-1609920658906-8223bd289001?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                          packageCount: 7
                        },
                        {
                          name: "Kerala",
                          description: "Discover amazing tour packages",
                          image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                          packageCount: 4
                        },
                        {
                          name: "Goa",
                          description: "Discover amazing tour packages",
                          image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                          packageCount: 6
                        },
                        {
                          name: "Karnataka",
                          description: "Discover amazing tour packages",
                          image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                          packageCount: 3
                        }
                      ].map((destination, index) => (
                        <SwiperSlide key={destination.name}>
                          <div className="w-full h-full">
                            <DestinationCard destination={destination} />
                          </div>
                        </SwiperSlide>
                      ))}
                    </Swiper>
                  </div>

                  {/* Mobile Scroll Indicator */}
                  <div className="flex justify-center mt-8 md:hidden">
                    <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 text-sm text-gray-600">
                      <i className="fi fi-rr-arrow-left text-xs"></i>
                      <span>Swipe to explore destinations</span>
                      <i className="fi fi-rr-arrow-right text-xs"></i>
                    </div>
                  </div>

                  {/* Explore All Button */}
                  <div className="flex justify-center mt-12 relative z-20">
                    <Link href="/explore" className="bg-gray-900 text-white px-8 py-4 rounded-full flex items-center gap-3 hover:bg-gray-800 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105">
                      <span>Explore All Destinations</span>
                      <i className="fi fi-rr-arrow-right"></i>
                    </Link>
                  </div>
                </div>

                {/* Why Choose Explore World Section */}
                <div className="px-4 lg:px-10 py-20 relative overflow-hidden bg-[#f5f5f5] rounded-2xl relative">
                  {/* Decorative blurred circle backgrounds */}
                  <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] md:w-[400px] md:h-[400px] bg-primary-200 rounded-full blur-3xl opacity-40 md:opacity-30 z-0"></div>
                  {/* Multiple Decorative Elements */}
                  <div className="absolute right-0 top-1/4 w-[200px] h-[200px] md:w-[400px] md:h-[400px] bg-primary-200 rounded-full blur-3xl opacity-20 -z-10"></div>
                  <div className="absolute left-0 bottom-1/4 w-[150px] h-[150px] md:w-[300px] md:h-[300px] bg-blue-200 rounded-full blur-3xl opacity-15 -z-10"></div>
                  
                  {/* Heading */}
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center flex flex-col items-center justify-center max-w-3xl mx-auto pb-20 relative z-20"
                  >
                    <div className="inline-block relative">
                      <Image
                        src="/home/star-light.png"
                        alt=""
                        width={100}
                        height={100}
                        className="absolute -left-8 -top-6 w-6 h-6 animate-pulse"
                      />
                      <h2 className="text-3xl md:text-[46px] font-semibold text-gray-800 tracking-tighter mb-6 leading-tight">
                        Why Choose<br />Explore World?
                      </h2>
                      <Image
                        src="/home/star-dark.png"
                        alt=""
                        width={100}
                        height={100}
                        className="absolute -right-10 -bottom-4 w-10 h-10 animate-pulse"
                      />
                    </div>
                    <p className="text-gray-600 text-lg max-w-2xl leading-relaxed">
                      Join thousands of satisfied travelers who&apos;ve discovered the smarter way to explore the world
                    </p>
                    <div className="w-48 mt-8">
                      <Image src="/home/line.png" alt="" width={1000} height={1000} className="w-full h-full" />
                    </div>
                  </motion.div>

                  {/* Features Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-20 mb-16">
                    {[
                      {
                        icon: "fi fi-rr-diamond",
                        title: "Curated Experiences",
                        description: "Only the best packages & attractions",
                        detail: "Hand-picked destinations and verified local suppliers",
                        gradient: "bg-primary-50",
                        iconColor: "text-primary-400",
                        delay: 0.1
                      },
                      {
                        icon: "fi fi-rr-settings-sliders",
                        title: "Tailor-Made Itineraries",
                        description: "100% customizable trips",
                        detail: "Every journey crafted to match your preferences",
                        gradient: "bg-primary-50",
                        iconColor: "text-primary-400",
                        delay: 0.2
                      },
                      {
                        icon: "fi fi-rr-heart",
                        title: "Trusted by Travelers",
                        description: "Thousands of happy explorers",
                        detail: "Join our community of adventure seekers",
                        gradient: "bg-primary-50",
                        iconColor: "text-primary-400",
                        delay: 0.3
                      },
                      {
                        icon: "fi fi-rr-shield-check",
                        title: "Seamless Booking",
                        description: "Easy, transparent & secure",
                        detail: "Book with confidence, travel with peace of mind",
                        gradient: "bg-primary-50",
                        iconColor: "text-primary-400",
                        delay: 0.4
                      }
                    ].map((feature, index) => (
                      <motion.div
                        key={feature.title}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="bg-white rounded-3xl p-4 lg:p-8 hover:shadow-xl transition-all duration-500 border border-gray-100 group hover:border-gray-200 hover:-translate-y-2 relative overflow-hidden"
                      >
                        {/* Subtle gradient overlay on hover */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500 rounded-3xl`}></div>
                        
                        <div className="relative z-10">
                          <div className="lg:flex items-start gap-6">
                            <div className="flex-shrink-0">
                              <div className={`w-16 h-16 lg:w-20  lg:h-20 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center group-hover:scale-110 mb-3 lg:mb-0 transition-transform duration-300 shadow-sm`}>
                                <i className={`${feature.icon} ${feature.iconColor} text-2xl`}></i>
                              </div>
                            </div>
                            <div className="flex-1">
                              <h3 className="text-xl font-semibold text-gray-800 mb-2 tracking-tight group-hover:text-gray-900 transition-colors">
                                {feature.title}
                              </h3>
                              <p className="text-gray-600 text-sm leading-relaxed mb-3">
                                {feature.description}
                              </p>
                              <p className="text-gray-500 text-xs leading-relaxed">
                                {feature.detail}
                              </p>
                            </div>
                          </div>
                      
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Trust indicators */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="relative z-20"
                  >
                    <div className="text-center mb-8">
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">
                        Trusted by travelers worldwide
                      </h3>
                      <p className="text-gray-600 text-sm">
                        Join thousands who&apos;ve made their dream trips a reality
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      {[
                        { number: "15,000+", label: "Happy Travelers", icon: "fi fi-rr-users" },
                        { number: "50+", label: "Destinations", icon: "fi fi-rr-marker" },
                        { number: "4.9/5", label: "Average Rating", icon: "fi fi-rr-star" },
                        { number: "24/7", label: "Support", icon: "fi fi-rr-headset" }
                      ].map((stat, index) => (
                        <div key={stat.label} className="text-center group">
                          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mx-auto mb-3 shadow-sm group-hover:shadow-md transition-shadow">
                            <i className={`${stat.icon} text-primary-600 text-lg`}></i>
                          </div>
                          <div className="lg:text-2xl text-xl font-bold text-gray-800 mb-1">{stat.number}</div>
                          <div className="text-xs text-gray-600 font-medium">{stat.label}</div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                  {/* image */}
                  <div className="w-full h-[410px] mt-16 overflow-hidden rounded-2xl relative">
                    {/* Background Image */}
                    <Image 
                      src="/home/why-choose.webp" 
                      alt="Why Choose Explore World" 
                      fill
                      className="object-cover" 
                    />
                    
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-l from-black/70 via-black/30 to-transparent z-[1]"></div>
                    
                    {/* Content Overlay */}
                    <div className="absolute inset-0 flex items-center lg:justify-end justify-center z-[2] lg:pr-10 p-4">
                       <div className="text-right max-w-2xl">
                            <h3 className="text-4xl md:text-6xl font-bold text-white mb-4 tracking-tight leading-tight text-center lg:text-right">
                            Where Will Your Next <br/> Journey Take You?
                            </h3>
                            <p className="text-base md:text-lg font-medium text-white/90 leading-relaxed text-center lg:text-right">
                            From dream holidays to hidden gems, we make every trip unforgettable.
                            </p>
                       </div>
                    </div>
                  </div>
                </div>

                {/* Blog Section */}
                <div className="px-4 lg:px-10 py-20 relative overflow-hidden">
                  {/* Decorative background */}
                  <div className="absolute right-1/4 top-1/2 -translate-y-1/2 w-[300px] h-[300px] md:w-[500px] md:h-[500px] bg-purple-200 rounded-full blur-3xl opacity-20 -z-10"></div>
                  
                  {/* Header with Navigation */}
                  <div className="flex items-end justify-between mb-16 relative z-10">
                    <div className="max-w-lg">
                      <div className="relative">
                        <Image
                          src="/home/star-light.png"
                          alt=""
                          width={100}
                          height={100}
                          className="absolute -left-6 -top-6 w-6 h-6 animate-pulse"
                        />
                        <h2 className="text-3xl md:text-[42px] font-semibold text-gray-800 tracking-tighter leading-tight">
                          Latest Travel Stories<br />& Expert Tips
                        </h2>
                        <Image
                          src="/home/star-dark.png"
                          alt=""
                          width={100}
                          height={100}
                          className="absolute -right-3 bottom-0 w-10 h-10 animate-pulse"
                        />
                      </div>
                      <p className="text-gray-600 text-base mt-4">
                        Get inspired by real travel experiences and insider tips
                      </p>
                      <div className="w-44 mt-4">
                        <Image src="/home/line.png" alt="" width={1000} height={1000} className="w-full h-full" />
                      </div>
                    </div>
                    
                    {/* Navigation Arrows */}
                    <div className="hidden md:flex items-center gap-3">
                      <button 
                        className="blog-swiper-button-prev w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors group border border-gray-100"
                      >
                        <i className="fi fi-rr-angle-left text-gray-600 group-hover:text-primary-500 transition-colors"></i>
                      </button>
                      <button 
                        className="blog-swiper-button-next w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors group border border-gray-100"
                      >
                        <i className="fi fi-rr-angle-right text-gray-600 group-hover:text-primary-500 transition-colors"></i>
                      </button>
                    </div>
                  </div>

                  {/* Blog Swiper Carousel */}
                  <div className="relative z-10">
                    <Swiper
                      modules={[Navigation, FreeMode, Autoplay]}
                      spaceBetween={24}
                      slidesPerView={1.2}
                      freeMode={true}
                      navigation={{
                        prevEl: '.blog-swiper-button-prev',
                        nextEl: '.blog-swiper-button-next',
                      }}
                      autoplay={{
                        delay: 5000,
                        disableOnInteraction: false,
                        pauseOnMouseEnter: true,
                      }}
                      breakpoints={{
                        640: {
                          slidesPerView: 2,
                          spaceBetween: 24,
                        },
                        768: {
                          slidesPerView: 2.5,
                          spaceBetween: 24,
                        },
                        1024: {
                          slidesPerView: 3,
                          spaceBetween: 24,
                        },
                        1280: {
                          slidesPerView: 4,
                          spaceBetween: 24,
                        },
                      }}
                      className="pb-6"
                    >
                      {[
                        {
                          title: "Budget Travel Mastery",
                          description: "Learn how to explore India on just ₹1500 per day without compromising on experiences",
                          image: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                          category: "Budget Tips",
                          readTime: "8 min read",
                          date: "Dec 12, 2024",
                          author: "Rajesh Kumar"
                        },
                        {
                          title: "Festival Season Travel Guide",
                          description: "Plan your trips around India's most vibrant cultural celebrations and festivals",
                          image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                          category: "Culture",
                          readTime: "6 min read",
                          date: "Dec 10, 2024",
                          author: "Priya Sharma"
                        },
                        {
                          title: "Travel Photography Secrets",
                          description: "Professional techniques to capture stunning photos that tell your travel story",
                          image: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                          category: "Photography",
                          readTime: "4 min read",
                          date: "Dec 8, 2024",
                          author: "Amit Singh"
                        },
                        {
                          title: "Solo Travel Safety Guide",
                          description: "Essential safety tips for confident solo adventures across India and beyond",
                          image: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                          category: "Safety",
                          readTime: "7 min read",
                          date: "Dec 5, 2024",
                          author: "Anjali Patel"
                        },
                        {
                          title: "Local Food Adventures",
                          description: "Discover authentic regional cuisines and the best places to find them",
                          image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                          category: "Food",
                          readTime: "5 min read",
                          date: "Dec 3, 2024",
                          author: "Vikram Rao"
                        },
                        {
                          title: "Smart Packing Guide",
                          description: "Complete checklist and tips for hassle-free travel in any season",
                          image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                          category: "Tips",
                          readTime: "3 min read",
                          date: "Dec 1, 2024",
                          author: "Neha Gupta"
                        },
                        {
                          title: "Monsoon Travel Tips",
                          description: "Make the most of India's monsoon season with these essential travel strategies",
                          image: "https://images.unsplash.com/photo-1527004013197-933c4bb611b3?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                          category: "Seasonal",
                          readTime: "6 min read",
                          date: "Nov 28, 2024",
                          author: "Kavya Reddy"
                        },
                        {
                          title: "Adventure Sports Guide",
                          description: "Thrilling activities and adventure sports across India's diverse landscapes",
                          image: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                          category: "Adventure",
                          readTime: "9 min read",
                          date: "Nov 25, 2024",
                          author: "Arjun Mehta"
                        }
                      ].map((blog, index) => (
                        <SwiperSlide key={blog.title}>
                          <div className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 group cursor-pointer hover:-translate-y-2 h-full">
                            {/* Blog Image */}
                            <div className="relative h-48 overflow-hidden">
                              <Image 
                                src={blog.image} 
                                alt={blog.title} 
                                fill 
                                className="object-cover group-hover:scale-105 transition-transform duration-500" 
                              />
                              {/* Category Badge */}
                              <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-gray-800 px-3 py-1 rounded-full text-xs font-medium">
                                {blog.category}
                              </div>
                            </div>
                            
                            {/* Blog Content */}
                            <div className="p-6">
                              {/* Meta Info */}
                              <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                                <span>{blog.date.split(',')[0]}</span>
                                <span>•</span>
                                <span>{blog.readTime}</span>
                              </div>
                              
                              {/* Title */}
                              <h3 className="text-lg font-semibold text-gray-800 mb-3 leading-tight group-hover:text-primary-600 transition-colors">
                                {blog.title}
                              </h3>
                              
                              {/* Description */}
                              <p className="text-gray-600 text-sm mb-6 leading-relaxed line-clamp-2">
                                {blog.description}
                              </p>
                              
                              {/* Author & Read More */}
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                                    <i className="fi fi-rr-user text-primary-600 text-xs"></i>
                                  </div>
                                  <span className="text-sm font-medium text-gray-700">{blog.author}</span>
                                </div>
                                <div className="flex items-center gap-2 text-primary-600 font-medium text-sm group-hover:translate-x-1 transition-transform">
                                  <span>Read</span>
                                  <i className="fi fi-rr-arrow-small-right"></i>
                                </div>
                              </div>
                            </div>
                          </div>
                        </SwiperSlide>
                      ))}
                    </Swiper>
                  </div>

                  {/* Mobile Scroll Indicator */}
                  <div className="flex justify-center mt-8 md:hidden">
                    <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 text-sm text-gray-600">
                      <i className="fi fi-rr-arrow-left text-xs"></i>
                      <span>Swipe to explore more stories</span>
                      <i className="fi fi-rr-arrow-right text-xs"></i>
                    </div>
                  </div>

                  {/* View All Button */}
                  <div className="flex justify-center mt-12 relative z-10">
                    <Link href="/blog" className="bg-gradient-to-r from-gray-900 to-gray-800 text-white px-8 py-4 rounded-full flex items-center gap-3 hover:from-gray-800 hover:to-gray-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105">
                      <span>Explore All Stories</span>
                      <i className="fi fi-rr-arrow-right"></i>
                    </Link>
                  </div>
                </div>

                {/* Testimonials Section */}
                <div className="px-4 lg:px-10 py-20 overflow-hidden relative">
                   {/* Decorative blurred circle backgrounds */}
                   <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] md:w-[400px] md:h-[400px] bg-primary-200 rounded-full blur-3xl opacity-40 md:opacity-30 z-0"></div>
                  
                  {/* Header with Navigation */}
                  <div className="flex items-end justify-between mb-16 relative z-10">
                    <div className="max-w-lg">
                      <div className="relative">
                        <Image
                          src="/home/star-light.png"
                          alt=""
                          width={100}
                          height={100}
                          className="absolute -left-6 -top-6 w-6 h-6 animate-pulse"
                        />
                        <h2 className="text-3xl md:text-[42px] font-semibold text-gray-800 tracking-tighter leading-tight">
                          What Our Travelers<br />Say About Us
                        </h2>
                        <Image
                          src="/home/star-dark.png"
                          alt=""
                          width={100}
                          height={100}
                          className="absolute -right-3 bottom-0 w-10 h-10 animate-pulse"
                        />
                      </div>
                      <p className="text-gray-600 text-base mt-4">
                        Real experiences from real travelers who&apos;ve discovered the world with us
                      </p>
                      <div className="w-44 mt-4">
                        <Image src="/home/line.png" alt="" width={1000} height={1000} className="w-full h-full" />
                      </div>
                    </div>
                    
                    {/* Navigation Arrows */}
                    <div className="hidden md:flex items-center gap-3">
                      <button 
                        className="testimonials-swiper-button-prev w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors group border border-gray-100"
                      >
                        <i className="fi fi-rr-angle-left text-gray-600 group-hover:text-primary-500 transition-colors"></i>
                      </button>
                      <button 
                        className="testimonials-swiper-button-next w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors group border border-gray-100"
                      >
                        <i className="fi fi-rr-angle-right text-gray-600 group-hover:text-primary-500 transition-colors"></i>
                      </button>
                    </div>
                  </div>

                  {/* Testimonials Swiper Carousel */}
                  <div className="relative z-10">
                    <Swiper
                      modules={[Navigation, FreeMode, Autoplay]}
                      spaceBetween={32}
                      slidesPerView={1}
                      freeMode={true}
                      navigation={{
                        prevEl: '.testimonials-swiper-button-prev',
                        nextEl: '.testimonials-swiper-button-next',
                      }}
                      autoplay={{
                        delay: 6000,
                        disableOnInteraction: false,
                        pauseOnMouseEnter: true,
                      }}
                      breakpoints={{
                        640: {
                          slidesPerView: 1.5,
                          spaceBetween: 24,
                        },
                        768: {
                          slidesPerView: 2,
                          spaceBetween: 24,
                        },
                        1024: {
                          slidesPerView: 2.5,
                          spaceBetween: 32,
                        },
                        1280: {
                          slidesPerView: 3,
                          spaceBetween: 32,
                        },
                      }}
                      className="pb-6"
                    >
                      {[
                        {
                          name: "Priya Sharma",
                          location: "Mumbai, Maharashtra",
                          rating: 5,
                          image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                          testimonial: "Amazing experience! The Himachal package exceeded all expectations. Every detail was perfectly planned and the local guides were incredible.",
                          package: "Himachal Adventure Package",
                          date: "November 2024"
                        },
                        {
                          name: "Rajesh Kumar",
                          location: "Delhi, NCR",
                          rating: 5,
                          image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                          testimonial: "Best decision to book through Explore World. Got luxury experiences at budget prices. The team&apos;s support was outstanding throughout.",
                          package: "Golden Triangle Luxury Tour",
                          date: "October 2024"
                        },
                        {
                          name: "Anjali Patel",
                          location: "Ahmedabad, Gujarat",
                          rating: 5,
                          image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                          testimonial: "The Rajasthan tour was absolutely magical! From desert safaris to palace stays, everything was perfectly organized. Unforgettable memories!",
                          package: "Rajasthan Heritage Tour",
                          date: "September 2024"
                        },
                        {
                          name: "Vikram Singh",
                          location: "Bangalore, Karnataka",
                          rating: 5,
                          image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                          testimonial: "Solo traveler here! Felt completely safe and supported throughout my Kerala backwaters journey. Excellent local connections and authentic experiences.",
                          package: "Kerala Backwaters Solo Trip",
                          date: "December 2024"
                        },
                        {
                          name: "Meera Joshi",
                          location: "Pune, Maharashtra",
                          rating: 5,
                          image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                          testimonial: "Family vacation made stress-free! Kids loved the activities, adults enjoyed the culture. Perfect balance and amazing value for money.",
                          package: "Goa Family Package",
                          date: "August 2024"
                        },
                        {
                          name: "Arjun Reddy",
                          location: "Hyderabad, Telangana",
                          rating: 5,
                          image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                          testimonial: "Adventure seeker&apos;s dream come true! The Ladakh expedition was challenging yet safe. Professional guides and top-notch equipment.",
                          package: "Ladakh Adventure Expedition",
                          date: "July 2024"
                        },
                        {
                          name: "Kavya Nair",
                          location: "Chennai, Tamil Nadu",
                          rating: 5,
                          image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                          testimonial: "Honeymoon trip to Kashmir was beyond our dreams! The romantic settings, cozy accommodations, and personalized service made it truly special.",
                          package: "Kashmir Romantic Getaway",
                          date: "June 2024"
                        },
                        {
                          name: "Rohit Gupta",
                          location: "Kolkata, West Bengal",
                          rating: 5,
                          image: "https://images.unsplash.com/photo-1566492031773-4f4e44671d66?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                          testimonial: "Corporate retreat organized flawlessly! Team building activities in Manali brought our team closer. Excellent coordination and seamless execution.",
                          package: "Corporate Retreat Manali",
                          date: "May 2024"
                        }
                      ].map((testimonial, index) => (
                        <SwiperSlide key={testimonial.name}>
                          <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: index * 0.05 }}
                            className="bg-white rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all duration-500 group relative overflow-hidden h-full"
                          >
                            {/* Quote Icon */}
                            <div className="absolute top-6 right-6 text-primary-100 text-4xl">
                              <i className="fi fi-rr-quote-right"></i>
                            </div>
                            
                            {/* Rating */}
                            <div className="flex items-center gap-1 mb-4">
                              {[...Array(testimonial.rating)].map((_, i) => (
                                <i key={i} className="fi fi-sr-star text-yellow-400 text-sm"></i>
                              ))}
                              <span className="ml-2 text-sm text-gray-500 font-medium">({testimonial.rating}.0)</span>
                            </div>
                            
                            {/* Testimonial Text */}
                            <p className="text-gray-700 text-sm leading-relaxed mb-6 relative z-10">
                              &ldquo;{testimonial.testimonial}&rdquo;
                            </p>
                            
                            {/* Customer Info */}
                            <div className="flex items-center gap-4 mb-4">
                              <div className="relative w-12 h-12 rounded-full overflow-hidden ring-2 ring-primary-100">
                                <Image 
                                  src={testimonial.image} 
                                  alt={testimonial.name} 
                                  fill 
                                  className="object-cover" 
                                />
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-900 text-sm">{testimonial.name}</h4>
                                <p className="text-xs text-gray-500">{testimonial.location}</p>
                              </div>
                            </div>
                            
                            {/* Package Info */}
                            <div className="pt-4 border-t border-gray-100">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-xs text-primary-600 font-medium">{testimonial.package}</p>
                                  <p className="text-xs text-gray-400 mt-1">{testimonial.date}</p>
                                </div>
                                <div className="text-primary-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <i className="fi fi-rr-check-circle text-lg"></i>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        </SwiperSlide>
                      ))}
                    </Swiper>
                  </div>

                  {/* Mobile Scroll Indicator */}
                  <div className="flex justify-center mt-8 md:hidden">
                    <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 text-sm text-gray-600">
                      <i className="fi fi-rr-arrow-left text-xs"></i>
                      <span>Swipe to read more reviews</span>
                      <i className="fi fi-rr-arrow-right text-xs"></i>
                    </div>
                  </div>
                </div>
             
        </section>

      
 
       </div>
 
     </div>
   );
 }
