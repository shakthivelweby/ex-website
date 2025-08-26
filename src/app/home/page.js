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
      <label className="absolute top-1.5 left-4 text-xs text-white/80 flex items-center gap-1.5">
        <i className="fi fi-rr-search text-[10px] relative top-[0px]"></i>
        What you are looking for?
      </label>
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="w-full appearance-none bg-transparent rounded-3xl border-0 outline-none px-4 pt-6 pb-1.5 text-[14px] text-white font-medium cursor-pointer h-[50px] hover:bg-black/5 transition-colors text-left flex items-center justify-between group"
        >
          <div className="flex items-center gap-2.5">
            <i className={`${tripOptions.find(opt => opt.value === selectedTrip)?.icon} text-white text-base transition-colors`}></i>
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
        <section className="container mx-auto px-4 py-4 mt-4">
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
                  className="text-4xl lg:text-6xl font-normal text-white mb-2 leading-tight tracking-tighter"
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

        {/* Trending Destinations Section */}
        <section className="container mx-auto px-4 py-16">
          <div className="flex flex-col items-start mb-10">
              <div className="flex items-center gap-2 mb-4 justify-start">
                  <div className="w-12 h-[2px] bg-primary-500"></div>
                  <span className="text-xs tracking-[0.2em] uppercase text-primary-600 font-medium">
                    Trending Destinations
                  </span>
              </div>
              <div className="flex items-end justify-between w-full">
                <div>
                  <h2 className="text-3xl lg:text-4xl font-normal text-gray-900 mb-3 tracking-tight">
                  Top Trending Destinations Right Now
                  </h2>
                  <p className="text-gray-600 max-w-2xl text-base">
                  From beaches to mountains to city breaks, discover destinations everyone&apos;s talking about
                  </p>
                </div>
                <Link 
                  href="/home/destinations" 
                  className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-semibold text-lg"
                >
                  View All Destinations
                  <i className="fi fi-rr-arrow-right"></i>
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-10 w-full">
                {[
                  { 
                    name: "Uttar Pradesh", 
                    description: "Discover amazing tour packages", 
                    image: "https://images.unsplash.com/photo-1564507592333-c60657eea523?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", 
                    packageCount: 2,
                    trending: true 
                  },
                  { 
                    name: "Delhi", 
                    description: "Discover amazing tour packages", 
                    image: "https://images.unsplash.com/photo-1587474260584-136574508ed4?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", 
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
                    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", 
                    packageCount: 3
                  }
                  ].map((destination, index) => (
                    <div key={destination.name} className="w-full">
                      <DestinationCard destination={destination} />
                    </div>
                  ))}
              </div>
          </div>
        </section>
        {/* Featured Events Section */}
        <section className="px-4 lg:px-10 py-16 bg-gradient-to-br from-gray-50 to-blue-50 rounded-3xl">
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
        <section className="container mx-auto px-4 py-16">
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
            {/* holiday budget */}
            {/* <section className=" lg:px-10 py-16 bg-primary-50 mt-16">
              <div className="container mx-auto px-4 flex flex-col items-start mb-10">
                <div className="flex items-center gap-2 mb-4 justify-start">
                  <div className="w-12 h-[2px] bg-primary-500"></div>
                  <span className="text-xs tracking-[0.2em] uppercase text-primary-600 font-medium">
                    Holiday Budget
                  </span>
                </div>
                <div className="flex items-end justify-between w-full">
                  <div>
                    <h2 className="text-3xl lg:text-4xl font-normal text-gray-900 mb-3 tracking-tight">
                      Holidays for Every Budget
                    </h2>
                    <p className="text-gray-600 max-w-2xl text-base">
                      Dream vacations that fit your pocket. From luxury escapes to smart getaways, we&apos;ve designed packages for every traveler and every budget.
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 px-20 mt-10 w-full">
                  {[
                    { title: "Budget Trips", description: "Great memories, low cost", color: "bg-blue-100", borderColor: "border-blue-300", border: "border-[1px]", textColor: "text-blue-700" },
                    { title: "Standard Packages", description: "Comfort & convenience", color: "bg-green-100", borderColor: "border-green-300",  border: "border-[1px]", textColor: "text-green-700" },
                    { title: "Luxury Holidays", description: "Indulge in the finest experiences", color: "bg-purple-100", borderColor: "border-purple-300", border: "border-[1px]", textColor: "text-purple-700" }
                  ].map((item, index) => (
                    <div key={item.title} className={`${item.color} ${item.borderColor} border-2 rounded-2xl p-6 hover:shadow-md transition-all duration-300 cursor-pointer group`}>
                      <div className="text-center">
                        <h3 className={`${item.textColor} font-semibold text-lg mb-2`}>{item.title}</h3>
                        <p className="text-gray-600 text-sm">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="text-center mt-8 w-full">
                  <Link href="/packages" className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-semibold text-lg">
                    Find Your Perfect Holiday
                    <i className="fi fi-rr-arrow-right"></i>
                  </Link>
                                 </div>
               </div>
           </section> */}

        {/* Blog Section */}
        <section className="container mx-auto px-4 py-16">
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
                  Get inspired by travel stories, discover hidden gems, and learn insider tips from our travel experts and community.
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
        <section className="px-4 lg:px-10 py-16 bg-gradient-to-br from-gray-50 to-blue-50 rounded-3xl">
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
      </div>
 
     </div>
   );
 }
