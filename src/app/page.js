"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import LocationSearchPopup from "@/components/LocationSearchPopup";
import Search from "@/components/Search/Search";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import EventCard from "@/components/eventCard";


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

  // Google API Key
  const googleApiKey = "AIzaSyDaNPqSBObLDby0rpTvEUbQ8Ek9kxAABK0";

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
    if(selectedTrip === "Packages") {
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
            className="fi fi-rr-angle-small-down text-white text-sm transition-colors"
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
                className={`w-full px-5 py-3.5 text-left text-[14px] hover:bg-gray-50/80 transition-all flex items-center gap-3 group ${
                  selectedTrip === option.value ? 'text-primary-500 font-medium bg-primary-50/50' : 'text-gray-700'
                }`}
                whileHover={{ backgroundColor: "rgba(0,0,0,0.03)" }}
                whileTap={{ backgroundColor: "rgba(0,0,0,0.05)" }}
              >
                <i className={`${option.icon} text-lg ${
                  selectedTrip === option.value ? 'text-primary-500' : 'text-gray-500 group-hover:text-primary-500 transition-colors'
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
    <div className="min-h-screen bg-white">
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
            googleApiKey={googleApiKey}
          />
        )}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">

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
          <div className="absolute inset-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center z-[2]">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-3xl mx-auto text-center w-full"
            >
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-4xl lg:text-5xl font-bold md:font-semibold text-white mb-2 leading-tight tracking-tighter"
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
                className="relative backdrop-blur-lg bg-white/10 rounded-[24px] md:rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] overflow-visible p-3 md:p-1.5 max-w-[650px] mx-auto w-full border border-white/20"
              >
                <div className="flex flex-col md:flex-row gap-3">
                  <CustomDropdown />

                  {/* Where you want to start from */}
                  <div className="flex-1 relative">
                    <label className="absolute top-1.5 left-4 text-xs text-white/80 z-10 flex items-center gap-1.5">
                      <i className="fi fi-rr-marker text-[10px] top-[0px]"></i>
                      {locationText[selectedTrip.split(" ")[0]]}
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={selectedLocation}
                        onClick={() => setIsLocationPopupOpen(true)}
                        readOnly
                        className="w-full appearance-none bg-transparent rounded-3xl border-0 outline-none px-4 pt-6 pb-1.5 text-[14px] text-white font-medium cursor-pointer h-[50px] hover:bg-white/5 transition-colors"
                        placeholder="Enter location..."
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                        <i className="fi fi-rr-angle-small-down text-white text-sm"></i>
                      </div>
                    </div>
                  </div>

                  {/* Search Button */}
                  <button 
                    type="submit" 
                    className="w-full md:w-auto bg-primary-500 hover:bg-primary-600 text-white rounded-full transition-all flex items-center justify-center gap-2 px-5 py-2.5 md:px-3.5 md:py-3.5 search-pulse lg:!search-pulse-none backdrop-blur-sm"
                  >
                    <span className="text-sm font-semibold md:hidden">Search</span>
                    <Image src="/home/search-icon.svg" alt="search icon" width={18} height={18} className="md:w-6 md:h-6" />
                  </button>
                </div>
              </motion.form>
            </motion.div>
          </div>
        </div>
        



        </section>

        {/* Featured Destinations Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            {/* Section Header */}
            <div className="mb-8">
             <div className="flex items-center gap-2 mb-4 justify-start">
                  <div className="w-12 h-[2px] bg-primary-500"></div>
                  <span className="text-xs tracking-[0.2em] uppercase text-primary-600 font-medium">
                    Popular Choices
                  </span>
              </div>
              <h2 className="text-3xl text-gray-900 font-normal tracking-tight mt-4">
                Featured Destinations
              </h2>
              <p className="text-gray-600 text-base mt-2">
                Discover our handpicked selection of India&apos;s most beloved travel destinations
              </p>
            </div>

            {/* Destinations Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  id: 1,
                  name: "Manali",
                  image: "https://images.unsplash.com/photo-1609920658906-8223bd289001?q=80&w=601&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                  packageCount: 3,
                  type: "FEATURED DESTINATION"
                },
                {
                  id: 2,
                  name: "Jaisalmer",
                  image: "https://images.unsplash.com/photo-1741759223244-9c0456c12eb7?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                  packageCount: 12,
                  type: "FEATURED DESTINATION"
                },
                {
                  id: 3,
                  name: "Srinagar",
                  image: "https://images.unsplash.com/photo-1595815771614-ade9d652a65d?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                  packageCount: 8,
                  type: "FEATURED DESTINATION"
                },
                {
                  id: 4,
                  name: "Amritsar",
                  image: "https://images.unsplash.com/photo-1588096344356-9b497caeeb64?q=80&w=784&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                  packageCount: 10,
                  type: "FEATURED DESTINATION"
                }
              ].map((destination) => (
                <div key={destination.id} className="group relative rounded-[20px] overflow-hidden">
                  {/* Background Image */}
                  <div className="relative aspect-[3/4] w-full">
                    <Image
                      src={destination.image}
                      alt={destination.name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent"></div>
                  </div>

                  {/* Package Count Badge */}
                  <div className="absolute top-4 left-4 z-10">
                    <div className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-md rounded-full pl-2 pr-3 py-1">
                      <div className="w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center">
                        <span className="text-[10px] font-semibold text-white">{destination.packageCount}</span>
                      </div>
                      <span className="text-xs font-medium text-white">Tour Packages</span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    {/* Title and Type */}
                    <div className="mb-6">
                      <h3 className="text-2xl font-medium text-white mb-2">
                        {destination.name}
                      </h3>
                      <div className="flex items-center gap-2">
                        <div className="h-px w-5 bg-primary-500"></div>
                        <span className="text-xs font-medium text-white/70 uppercase tracking-wider">
                          {destination.type}
                        </span>
                      </div>
                    </div>

                    {/* View All Button */}
                    <button className="w-full group/btn">
                      <div className="relative overflow-hidden bg-white/10 hover:bg-primary-500 backdrop-blur-sm rounded-xl p-3.5 transition-all duration-300">
                        <div className="relative z-10 flex items-center justify-between">
                          <span className="text-sm font-medium text-white">View All Packages</span>
                          <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                            <span className="text-white transform group-hover/btn:translate-x-0.5 transition-transform duration-300">
                              →
                            </span>
                          </div>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Events Section */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 bg-gradient-to-br from-white to-primary-50 lg:rounded-3xl mt-10">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="flex items-center gap-2 mb-4 justify-center">
              <div className="w-12 h-[2px] bg-primary-500"></div>
              <span className="text-sm tracking-[0.2em] uppercase text-primary-600 font-medium">
                Upcoming Events
              </span>
            </div>
            <h2 className="text-3xl font-normal text-gray-900 mb-4 tracking-tight">
              Events That Inspire & Excite
            </h2>
            <p className="text-gray-600 text-lg">
              Join amazing events and create memories that last a lifetime
            </p>
          </div>

          {/* Category Pills */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex overflow-x-auto pb-4 mb-12 gap-3 hide-scrollbar"
          >
            {[
              'All Events', 'Music', 'Comedy', 'Theatre', 'Food', 'Sports', 'Arts'
            ].map((category, index) => (
              <button
                key={category}
                className={`px-6 py-3 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                  index === 0 
                  ? 'bg-gray-900 text-white shadow-lg shadow-gray-900/20' 
                  : 'bg-white text-gray-600 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </motion.div>

          {/* Events Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                id: 1,
                title: 'Enrique Iglesias Live in Concert',
                date: 'Thu, 31 Jul',
                venue: 'MMRDA Grounds, Mumbai',
                type: 'Concerts',
                image: '/images/events/card-1.jpg',
                price: '₹ 800 onwards',
                promoted: true
              },
              {
                id: 2,
                title: 'Poetry Painting (DIY workshop)',
                date: 'Thu, 24 Jul onwards',
                venue: 'Multiple Venues',
                type: 'Workshops',
                image: '/images/events/card-2.jpg',
                price: '₹ 450 onwards',
                promoted: true
              },
              {
                id: 3,
                title: 'Kisi Ko Batana Mat Ft. Anubhav Singh Bassi',
                date: 'Fri, 25 Jul onwards',
                venue: 'Sri Shanmukhananda Fine Arts',
                type: 'Stand up Comedy',
                image: '/images/events/card-3.jpg',
                price: '₹ 999 onwards',
                promoted: false
              },
              {
                id: 4,
                title: 'Sunburn Arena ft. DJ Snake',
                date: 'Sat, 26 Jul',
                venue: 'Mahalaxmi Race Course, Mumbai',
                type: 'Music Festival',
                image: '/images/events/card-1.jpg',
                price: '₹ 1499 onwards',
                promoted: true
              }
            ].map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>

          {/* View All Button */}
          <div className="flex justify-center mt-12">
            <Link 
              href="/events"
              className="bg-gray-900 text-white px-8 py-4 rounded-full text-sm font-medium hover:bg-primary-500 transition-colors duration-300 flex items-center gap-2"
            >
              View All Events
              <i className="fi fi-rr-arrow-right text-sm"></i>
            </Link>
          </div>
        </section>

        {/* Blog Section */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 mt-10">
          {/* Section Header */}
          <div className="mb-16">
            <div className="flex items-center gap-2 mb-4 justify-start">
              <div className="w-12 h-[2px] bg-primary-500"></div>
              <span className="text-xs tracking-[0.2em] uppercase text-primary-600 font-medium">
                Travel Stories
              </span>
            </div>
            <h2 className="text-3xl font-normal text-gray-900 mb-4 tracking-tight">
              Latest From Our Blog
            </h2>
            <p className="text-gray-600 text-lg">
              Get inspired with travel guides and stories from fellow travelers
            </p>
          </div>

          {/* Blog Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                id: 1,
                title: "10 Hidden Gems in Kerala's Backwaters",
                excerpt: "Discover secret spots and authentic experiences in God's own country",
                image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944",
                category: "Travel Guide",
                readTime: "5 min read",
                date: "June 15, 2024",
                author: {
                  name: "Sarah Johnson",
                  avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330"
                }
              },
              {
                id: 2,
                title: "A Complete Guide to Ladakh's Monasteries",
                excerpt: "Exploring the spiritual and cultural heritage of the Himalayan kingdom",
                image: "https://images.unsplash.com/photo-1619837374214-f5b9eb80876d?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                category: "Culture",
                readTime: "8 min read",
                date: "June 12, 2024",
                author: {
                  name: "Mike Chen",
                  avatar: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944"
                }
              },
              {
                id: 3,
                title: "Best Street Food Tours in Delhi",
                excerpt: "A culinary journey through the vibrant streets of Old Delhi",
                image: "https://images.unsplash.com/photo-1624858020896-4a558c5d7042?q=80&w=736&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                category: "Food & Travel",
                readTime: "6 min read",
                date: "June 10, 2024",
                author: {
                  name: "Priya Sharma",
                  avatar: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944"
                }
              }
            ].map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.id}`}
                className="group block bg-white rounded-[24px] overflow-hidden hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-300 border border-gray-100"
              >
                {/* Image Container */}
                <div className="relative aspect-video overflow-hidden">
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                  <div className="absolute top-4 left-4">
                    <span className="inline-block px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium text-primary-500">
                      {post.category}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-primary-500 transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  
                  <p className="text-gray-600 text-sm mb-6 line-clamp-2">
                    {post.excerpt}
                  </p>

                  <div className="flex items-center justify-between">
                    {/* Author Info */}
                    <div className="flex items-center gap-3">
                      <div className="relative w-8 h-8 rounded-full overflow-hidden">
                        <Image
                          src={post.author.avatar}
                          alt={post.author.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{post.author.name}</p>
                        <p className="text-xs text-gray-500">{post.date}</p>
                      </div>
                    </div>

                    {/* Read Time */}
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <i className="fi fi-rr-clock text-[10px]"></i>
                      {post.readTime}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* View All Button */}
          <div className="flex justify-center mt-12">
            <Link 
              href="/blog"
              className="group bg-gray-900 text-white px-8 py-4 rounded-full text-sm font-medium hover:bg-primary-500 transition-all duration-300 flex items-center gap-3 hover:gap-4"
            >
              View All Posts
              <i className="fi fi-rr-arrow-right text-sm"></i>
            </Link>
          </div>
        </section>

        {/* What you can do Section */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 bg-gradient-to-br from-white to-primary-50 lg:rounded-3xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Left Column */}
            <div>
              <div className="relative">
                <h2 className="text-3xl font-normal text-gray-900 mb-4 tracking-tight">
                  What you can do 
                  with Exploreworld
                </h2>
                <p className="text-gray-600 mb-6">
                  We build the perfect solutions for travellers like easy
                </p>
              </div>
              <div className="mt-8 relative rounded-3xl overflow-hidden">
                <Image
                  src="/home/what-we-do.webp"
                  alt="Traveler enjoying view"
                  width={500}
                  height={400}
                  className="w-full object-cover rounded-3xl"
                />
              </div>
            </div>

            {/* Right Column - Services Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                {
                  icon: "fi fi-rr-calendar-clock",
                  title: "Scheduled Tours",
                  description: "Fixed-date tours planned by trusted local suppliers. Just book and join no planning needed!",
                  link: "/scheduled"
                },
                {
                  icon: "fi fi-rr-briefcase",
                  title: "Packages",
                  description: "Fixed-date tours planned by trusted local suppliers. Just book and join no planning needed!",
                  link: "/packages"
                },
                {
                  icon: "fi fi-rr-hiking",
                  title: "Activity",
                  description: "Fixed-date tours planned by trusted local suppliers. Just book and join no planning needed!",
                  link: "/activities"
                },
                {
                  icon: "fi fi-rr-building",
                  title: "Attractions",
                  description: "Fixed-date tours planned by trusted local suppliers. Just book and join no planning needed!",
                  link: "/attractions"
                },
                {
                  icon: "fi fi-rr-car-side",
                  title: "Rentals",
                  description: "Fixed-date tours planned by trusted local suppliers. Just book and join no planning needed!",
                  link: "/rentals"
                },
                {
                  icon: "fi fi-rr-ticket",
                  title: "Events",
                  description: "Fixed-date tours planned by trusted local suppliers. Just book and join no planning needed!",
                  link: "/events"
                }
              ].map((service) => (
                <Link
                  key={service.title}
                  href={service.link}
                  className="group p-6 bg-white rounded-3xl border border-gray-100 hover:border-primary-100 hover:shadow-lg hover:shadow-primary-500/5 transition-all duration-300"
                >
                  <div className="flex flex-col h-full">
                    <div className="mb-4">
                      <i className={`${service.icon} text-2xl text-primary-500`}></i>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {service.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4 flex-grow">
                      {service.description}
                    </p>
                    <div className="flex items-center text-primary-500 text-sm font-medium group-hover:gap-2 transition-all">
                      View all
                      <i className="fi fi-rr-arrow-right text-xs ml-1"></i>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 bg-gradient-to-br from-white to-primary-50 lg:rounded-3xl">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="flex items-center gap-2 mb-4 justify-center">
              <div className="w-12 h-[2px] bg-primary-500"></div>
              <span className="text-xs tracking-[0.2em] uppercase text-primary-600 font-medium">
                Testimonials
              </span>
              <div className="w-12 h-[2px] bg-primary-500"></div>
            </div>
            <h2 className="text-3xl font-normal text-gray-900 mb-4 tracking-tight">
              What Our Travelers Say
            </h2>
            <p className="text-gray-600 text-lg">
              Real stories from real travelers who experienced the magic of India with us
            </p>
          </div>

          {/* Testimonials Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Mitchell",
                location: "London, UK",
                image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
                rating: 5,
                review: "The Rajasthan tour was absolutely magical! Every detail was perfectly planned, from the palace stays to the desert safari. Our guide was incredibly knowledgeable and made the experience unforgettable.",
                tourType: "Heritage Tour",
                destination: "Rajasthan"
              },
              {
                name: "David Chen",
                location: "Singapore",
                image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e",
                rating: 5,
                review: "Kerala's backwaters exceeded all expectations. The houseboat experience was serene, and the local food was amazing. Exploreworld made everything seamless and stress-free.",
                tourType: "Nature Retreat",
                destination: "Kerala"
              },
              {
                name: "Emma Thompson",
                location: "Sydney, Australia",
                image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80",
                rating: 5,
                review: "Trekking in Ladakh was a life-changing experience. The team's attention to safety and comfort, while maintaining the adventure aspect, was impressive. Will definitely book again!",
                tourType: "Adventure Trek",
                destination: "Ladakh"
              }
            ].map((testimonial, index) => (
              <div 
                key={testimonial.name}
                className="bg-white rounded-3xl p-8 border border-gray-100 hover:shadow-lg transition-all duration-300"
              >
                {/* Rating */}
                <div className="flex items-center gap-1 mb-6">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <i key={i} className="fi fi-ss-star text-yellow-400 text-sm"></i>
                  ))}
                </div>

                {/* Review Text */}
                <p className="text-gray-600 mb-8 text-lg leading-relaxed">
                  "{testimonial.review}"
                </p>

                {/* Tour Type Tag */}
                <div className="flex items-center gap-2 mb-6">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-50 text-primary-600 text-sm">
                    <i className="fi fi-rr-map-marker text-xs"></i>
                    {testimonial.destination}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-50 text-gray-600 text-sm">
                    {testimonial.tourType}
                  </span>
                </div>

                {/* Author Info */}
                <div className="flex items-center gap-4">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden">
                    <Image
                      src={testimonial.image}
                      alt={testimonial.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="text-gray-900 font-medium">{testimonial.name}</h4>
                    <p className="text-gray-500 text-sm">{testimonial.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* CTA Button */}
          <div className="flex justify-center mt-12">
            <Link 
              href="/reviews"
              className="group bg-gray-900 text-white px-8 py-4 rounded-full text-sm font-medium hover:bg-primary-500 transition-all duration-300 flex items-center gap-3 hover:gap-4"
            >
              Read More Reviews
              <i className="fi fi-rr-arrow-right text-sm"></i>
            </Link>
          </div>
        </section>


      </div>
    </div>
  );
}
