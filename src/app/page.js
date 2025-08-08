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
            googleApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
          />
        )}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">

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


          {/* Book without agency section */}
          <div className="relative overflow-hidden hidden">
            {/* Decorative blurred circle background at the top */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] md:w-[600px] md:h-[600px] bg-primary-200 rounded-full blur-3xl opacity-40 md:opacity-30 !z-0"></div>
            {/* Heading */}
            <div className="text-center flex flex-col items-center justify-center lg:max-w-2xl mx-auto pt-20 md:pb-20 pb-10  relative">
              <div className="inline-block relative">
                <Image
                  src="/home/star-light.png"
                  alt=""
                  width={100}
                  height={100}
                  className="absolute left-0 lg:-left-8 -top-6 w-6 h-6"
                />
                <h2 className="text-3xl md:text-[42px] font-semibold text-gray-800 tracking-tighter mb-6 ">
                  Book your trip without<br />agency fee
                </h2>
                <Image
                  src="/home/star-dark.png"
                  alt=""
                  width={100}
                  height={100}
                  className="absolute right-0 lg:-right-10 bottom-0 lg:-bottom-4 w-10 h-10"
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
              <div className="z-10">
                <div className="flex flex-col gap-6">
                  {/* image */}
                  <div className="w-full h-[250px]">
                    <Image src="/home/left-img.webp" alt="" width={1000} height={1000} className="w-full h-full rounded-3xl border-[3px] border-gray-800" />
                  </div>
                  {/* content */}
                  <div className="bg-gray-100 rounded-3xl">
                    {/* content */}
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800 mb-2 tracking-tighter leading-snug p-4">
                        Save 20% on all <br /> bookings!
                      </h3>
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-gray-600 text-sm mt-6 pl-4">
                          We offer the best deals on  all  bookings, so you can save more and travel more.
                        </p>
                        {/* icon */}
                        <div className="bg-white p-2 w-16 h-16 !mt-12 flex justify-center items-center rounded-tl-2xl">
                          <div className="w-10 h-10 bg-primary-50 border-[1px] border-primary-200 p-2 rounded-full flex items-center justify-center m-2">
                            <i className="fi fi-rr-megaphone text-primary-500 text-xl"></i>
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
              {/* center card */}
              <div className="">
                {/* image */}
                <div>
                  <Image src="/home/center-img.webp" alt="" width={1000} height={1000} className="w-full h-full rounded-3xl border-[3px] border-gray-800" />
                </div>
              </div>
              {/* right card */}
              <div className="">
                <div className="flex flex-col gap-6">
                  {/* content */}
                  <div className="bg-gray-100 rounded-3xl">
                    {/* content */}
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800 mb-2 tracking-tighter leading-snug p-4">
                        Book direclty to <br /> local suppliers
                      </h3>
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-gray-600 text-sm mt-6 pl-4">
                          We offer the best deals on  all  bookings, so you can save more and travel more.
                        </p>
                        {/* icon */}
                        <div className="bg-white p-2 w-16 h-16 !mt-12 flex justify-center items-center rounded-tl-2xl">
                          <div className="w-10 h-10 bg-primary-50 border-[1px] border-primary-200 p-2 rounded-full flex items-center justify-center">
                            <i className="fi fi-rr-check-circle text-primary-500 text-xl"></i>
                          </div>
                        </div>
                      </div>

                    </div>

                  </div>
                  {/* image */}
                  <div className="w-full h-[250px]">
                    <Image src="/home/right-img.webp" alt="" width={1000} height={1000} className="w-full h-full rounded-3xl border-[3px] border-gray-800" />
                  </div>

                </div>
              </div>
            </div>
          </div>


          {/* Popular Destinations */}
          <div className="container mx-auto py-20 relative hidden">
            {/* Decorative blurred circle background at the top */}
            <div className="absolute left-0 bottom-22 w-[300px] h-[300px] md:w-[600px] md:h-[600px] bg-primary-200 rounded-full blur-3xl opacity-40 md:opacity-30 z-0"></div>

            {/* Heading */}
            <div className="text-center flex flex-col items-center justify-center max-w-2xl mx-auto pt-20 md:pb-20 pb-10 px-4 relative">
              <div className="inline-block relative">
                <Image
                  src="/home/star-light.png"
                  alt=""
                  width={100}
                  height={100}
                  className="absolute -left-8 -top-6 w-6 h-6"
                />
                <h2 className="text-3xl md:text-[42px] font-semibold text-gray-800 tracking-tighter mb-6 ">
                  Discover Amazing Places <br /> to Visit
                </h2>
                <Image
                  src="/home/star-dark.png"
                  alt=""
                  width={100}
                  height={100}
                  className="absolute -right-7 lg:-right-10 -bottom-4 w-10 h-10"
                />
              </div>
              <p className="text-gray-600 text-base">
                we build the perfect solutions for travellers life easy
              </p>
              <div className="w-44 mt-6">
                <Image src="/home/line.png" alt="" width={1000} height={1000} className="w-full h-full" />
              </div>

            </div>
            {/* Grid of destination cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 relative">
              {/* Destination Card */}
              <a href="#" className="relative group overflow-hidden rounded-3xl h-[350px] z-10">
                <Image
                  src="/home/destination-1.webp"
                  alt="Rajasthan"
                  width={400}
                  height={350}
                  className="w-full h-full object-cover rounded-3xl border-[3px] border-gray-800"
                />
                {/* Gradient Overlay - only at bottom */}
                <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/80 to-transparent"></div>
                {/* Arrow Button */}
                <div className="absolute top-4 right-4 w-8 h-8 bg-white/90 rounded-full !flex !items-center !justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <i className="fi fi-bs-arrow-up-right text-gray-800 text-sm"></i>
                </div>
                {/* Location Name */}
                <div className="absolute bottom-6 left-6">
                  <h3 className="text-white text-xl font-medium">Rajasthan</h3>
                </div>
              </a>

              {/* Destination Card */}
              <a href="#" className="relative group overflow-hidden rounded-3xl h-[350px] z-10">
                <Image
                  src="/home/destination-2.webp"
                  alt="Kerala"
                  width={400}
                  height={350}
                  className="w-full h-full object-cover rounded-3xl border-[3px] border-gray-800"
                />
                {/* Gradient Overlay - only at bottom */}
                <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/80 to-transparent"></div>
                {/* arrow Button */}
                <div className="absolute top-4 right-4 w-8 h-8 bg-white/90 rounded-full !flex !items-center !justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <i className="fi fi-bs-arrow-up-right text-gray-800 text-sm"></i>
                </div>
                {/* Location Name */}
                <div className="absolute bottom-6 left-6">
                  <h3 className="text-white text-xl font-medium">Kerala</h3>
                </div>
              </a>

              {/* Destination Card */}
              <a href="#" className="relative group overflow-hidden rounded-3xl h-[350px] z-10">
                <Image
                  src="/home/destination-3.webp"
                  alt="Agra"
                  width={400}
                  height={350}
                  className="w-full h-full object-cover rounded-3xl border-[3px] border-gray-800"
                />
                {/* Gradient Overlay - only at bottom */}
                <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/80 to-transparent"></div>
                {/* Arrow Button */}
                <div className="absolute top-4 right-4 w-8 h-8 bg-white/90 rounded-full !flex !items-center !justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <i className="fi fi-bs-arrow-up-right text-gray-800 text-sm"></i>
                </div>
                {/* Location Name */}
                <div className="absolute bottom-6 left-6">
                  <h3 className="text-white text-xl font-medium">Agra</h3>
                </div>
              </a>

              {/* Destination Card */}
              <a href="#" className="relative group overflow-hidden rounded-3xl h-[350px] z-10">
                <Image
                  src="/home/destination-4.webp"
                  alt="Dubai"
                  width={400}
                  height={350}
                  className="w-full h-full object-cover rounded-3xl border-[3px] border-gray-800"
                />
                {/* Gradient Overlay - only at bottom */}
                <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/80 to-transparent"></div>
                {/* Arrow Button */}
                <div className="absolute top-4 right-4 w-8 h-8 bg-white/90 rounded-full !flex !items-center !justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <i className="fi fi-bs-arrow-up-right text-gray-800 text-sm"></i>
                </div>
                {/* Location Name */}
                <div className="absolute bottom-6 left-6">
                  <h3 className="text-white text-xl font-medium">Kashmir</h3>
                </div>
              </a>

            </div>

            {/* Explore All Button */}
            <div className="flex justify-center mt-12">
              <button className="bg-gray-900 text-white px-6 py-3 rounded-full flex items-center gap-2 hover:bg-gray-800 transition-colors z-10">
                Explore All
                <i className="fi fi-rr-arrow-right"></i>
              </button>
            </div>
          </div>


          {/* What you can do section */}
          <div className="container mx-auto py-20 relative hidden">


            {/* Content Grid */}
            <div className="flex flex-col lg:flex-row justify-between gap-6">
              {/* Left Side Image */}
              <div className="lg:w-[45%] z-10">
                {/* Heading */}
                <div className="max-w-lg relative mb-10 md:mb-20">
                  <div className="relative">
                    <Image
                      src="/home/star-light.png"
                      alt=""
                      width={100}
                      height={100}
                      className="absolute left-0 lg:-left-6 -top-6 w-6 h-6"
                    />
                    <h2 className="text-3xl md:text-[42px] font-semibold text-gray-800 tracking-tighter leading-tight">
                      What you can do<br />with Exploreworld
                    </h2>
                    <Image
                      src="/home/star-dark.png"
                      alt=""
                      width={100}
                      height={100}
                      className="absolute right-0 lg:-right-6 bottom-0 w-8 h-8"
                    />
                  </div>
                  <p className="text-gray-600 text-base mt-4">
                    we build the perfect solutions for travellers life easy
                  </p>
                  <div className="w-44 mt-4">
                    <Image src="/home/line.png" alt="" width={1000} height={1000} className="w-full h-full" />
                  </div>
                </div>
                <div className="h-fit rounded-3xl overflow-hidden">
                  <Image
                    src="/home/what-we-do.webp"
                    alt="Happy traveler"
                    width={1000}
                    height={1000}
                    className="w-full h-full object-cover rounded-3xl border-[3px] border-gray-800"
                  />
                </div>
              </div>

              {/* Right Services Grid */}
              <div className="lg:w-[55%] grid grid-cols-1 md:grid-cols-2 gap-6 z-10">

                {/* card */}
                <div className="bg-gray-100 lg:bg-white rounded-3xl h-fit">
                  {/* content */}
                  <div className="relative z-10 p-4">
                    <div className="mb-4">
                      <i className="fi fi-rr-pending text-primary-500 text-3xl"></i>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2 tracking-tighter leading-snug">Scheduled Tours</h3>
                    <p className="text-gray-600 text-sm mb-4 leading-tight">Fixed-date tours by trusted local suppliers. Just book and join!</p>

                  </div>
                  {/* view all button */}
                  <div className="bg-white lg:bg-[#ffd9e5] p-2 w-fit rounded-tr-2xl">
                    <a href="#" className="text-sm text-gray-800 bg-gray-100 lg:bg-white rounded-full px-4 py-2 flex items-center gap-2  hover:bg-primary-500 hover:text-white transition-all duration-300 w-fit">View all
                      <i className="fi fi-bs-arrow-up-right ml-1 text-[10px]"></i>
                    </a>
                  </div>
                </div>

                {/* card */}
                <div className="bg-gray-100 lg:bg-white rounded-3xl h-fit">
                  {/* content */}
                  <div className="relative z-10 p-4">
                    <div className="mb-4">
                      <i className="fi fi-rr-umbrella-beach text-primary-500 text-3xl"></i>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2 tracking-tighter leading-snug">Packages</h3>
                    <p className="text-gray-600 text-sm mb-4 leading-tight"> All-in-one travel deals with stay, transport, and activities.</p>
                  </div>
                  {/* view all button */}
                  <div className="bg-white lg:bg-[#ffd9e5] p-2 w-fit rounded-tr-2xl">
                    <a href="#" className="text-sm text-gray-800 bg-gray-100 lg:bg-white rounded-full px-4 py-2 flex items-center gap-2  hover:bg-primary-500 hover:text-white transition-all duration-300 w-fit">View all
                      <i className="fi fi-bs-arrow-up-right ml-1 text-[10px]"></i>
                    </a>
                  </div>



                </div>

                {/* card */}
                <div className="bg-gray-100 lg:bg-white rounded-3xl h-fit">
                  {/* content */}
                  <div className="relative z-10 p-4">
                    <div className="mb-4">
                      <i className="fi fi-rr-snowboarding text-primary-500 text-3xl"></i>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2 tracking-tighter leading-snug">Activity</h3>
                    <p className="text-gray-600 text-sm mb-4 leading-tight">Exciting things to do adventures, workshops, and more.</p>
                  </div>
                  {/* view all button */}
                  <div className="bg-white lg:bg-[#ffd9e5] p-2 w-fit rounded-tr-2xl">
                    <a href="#" className="text-sm text-gray-800 bg-gray-100 lg:bg-white rounded-full px-4 py-2 flex items-center gap-2  hover:bg-primary-500 hover:text-white transition-all duration-300 w-fit">View all
                      <i className="fi fi-bs-arrow-up-right ml-1 text-[10px]"></i>
                    </a>
                  </div>


                </div>

                {/* card */}
                <div className="bg-gray-100 lg:bg-white rounded-3xl h-fit">
                  {/* content */}
                  <div className="relative z-10 p-4">
                    <div className="mb-4">
                      <i className="fi fi-rr-binoculars text-primary-500 text-3xl"></i>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2 tracking-tighter leading-snug">Attraction</h3>
                    <p className="text-gray-600 text-sm mb-4 leading-tight">Must-see places and landmarks worth exploring.</p>
                  </div>
                  {/* view all button */}
                  <div className="bg-white lg:bg-[#ffd9e5] p-2 w-fit rounded-tr-2xl">
                    <a href="#" className="text-sm text-gray-800 bg-gray-100 lg:bg-white rounded-full px-4 py-2 flex items-center gap-2  hover:bg-primary-500 hover:text-white transition-all duration-300 w-fit">View all
                      <i className="fi fi-bs-arrow-up-right ml-1 text-[10px]"></i>
                    </a>
                  </div>

                </div>

                {/* card */}
                <div className="bg-gray-100 lg:bg-white rounded-3xl h-fit">
                  {/* content */}
                  <div className="relative z-10 p-4">
                    <div className="mb-4">
                      <i className="fi fi-rr-biking text-primary-500 text-3xl"></i>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2 tracking-tighter leading-snug">Rentals</h3>
                    <p className="text-gray-600 text-sm mb-4 leading-tight">Convenient rentals for vehicles and travel gear.</p>

                  </div>
                  {/* view all button */}
                  <div className="bg-white lg:bg-[#ffd9e5] p-2 w-fit rounded-tr-2xl">
                    <a href="#" className="text-sm text-gray-800 bg-gray-100 lg:bg-white rounded-full px-4 py-2 flex items-center gap-2  hover:bg-primary-500 hover:text-white transition-all duration-300 w-fit">View all
                      <i className="fi fi-bs-arrow-up-right ml-1 text-[10px]"></i>
                    </a>
                  </div>


                </div>

                {/* card */}
                <div className="bg-gray-100 lg:bg-white rounded-3xl h-fit">
                  {/* content */}
                  <div className="relative z-10 p-4">
                    <div className="mb-4">
                      <i className="fi fi-rr-glass-cheers text-primary-500 text-3xl"></i>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2 tracking-tighter leading-snug">Events</h3>
                    <p className="text-gray-600 text-sm mb-4 leading-tight">Join local festivals, shows, and cultural happenings.</p>
                  </div>
                  {/* view all button */}
                  <div className="bg-white lg:bg-[#ffd9e5] p-2 w-fit rounded-tr-2xl">
                    <a href="#" className="text-sm text-gray-800 bg-gray-100 lg:bg-white rounded-full px-4 py-2 flex items-center gap-2  hover:bg-primary-500 hover:text-white transition-all duration-300 w-fit">View all
                      <i className="fi fi-bs-arrow-up-right ml-1 text-[10px]"></i>
                    </a>
                  </div>





                </div>

              </div>
            </div>
            {/* Decorative blurred circle background at the top */}
            <div className="absolute right-0 top-0 bottom-0 w-[300px] h-[300px] md:w-[700px] md:h-[700px] lg:w-[1000px] lg:h-[1000px] bg-primary-200 lg:rounded-full blur-3xl opacity-40 lg:opacity-30 z-0"></div>
          </div>

          {/* blog section */}
          <div className="container mx-auto  relative hidden">
            {/* Decorative blurred circle background at the top */}
            <div className="absolute left-0 bottom-0 w-[300px] h-[300px] md:w-[600px] md:h-[600px] bg-primary-200 rounded-full blur-3xl opacity-40 md:opacity-30 z-0"></div>

            {/* Heading */}
            <div className="text-center flex flex-col items-center justify-center max-w-2xl mx-auto pt-20 md:pb-20 pb-10 px-4 relative">
              <div className="inline-block relative">
                <Image
                  src="/home/star-light.png"
                  alt=""
                  width={100}
                  height={100}
                  className="absolute left-0 lg:-left-8 -top-6 w-6 h-6"
                />
                <h2 className="text-3xl md:text-[42px] font-semibold text-gray-800 tracking-tighter mb-6">
                  From Our Travel Journal
                </h2>
                <Image
                  src="/home/star-dark.png"
                  alt=""
                  width={100}
                  height={100}
                  className="absolute -right-3 -bottom-2 lg:-right-10 lg:bottom-0 md:-bottom-4 w-10 h-10"
                />
              </div>
              <p className="text-gray-600 text-base">
                Inspiration, guides, and insider tips - all in one place
              </p>
              <div className="w-44 mt-6">
                <Image src="/home/line.png" alt="" width={1000} height={1000} className="w-full h-full" />
              </div>
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
              <button className="bg-gray-900 text-white px-6 py-3 rounded-full flex items-center gap-2 hover:bg-gray-800 transition-colors z-10">
                View All Posts
                <i className="fi fi-rr-arrow-right"></i>
              </button>
            </div>
          </div>

          {/* testimonials */}
          <div className="container mx-auto py-20 relative hidden">
            {/* Decorative blurred circle background */}
            <div className="absolute right-0 top-0 w-[300px] h-[300px] md:w-[600px] md:h-[600px] bg-primary-200 rounded-full blur-3xl opacity-40 md:opacity-30 z-0"></div>

            {/* Heading */}
            <div className="text-center flex flex-col items-center justify-center max-w-2xl mx-auto pt-20 md:pb-20 pb-10 px-4 relative">
              <div className="inline-block relative">
                <Image
                  src="/home/star-light.png"
                  alt=""
                  width={100}
                  height={100}
                  className="absolute -left-8 -top-6 w-6 h-6"
                />
                <h2 className="text-3xl md:text-[42px] font-semibold text-gray-800 tracking-tighter mb-6">
                  Voices from the Journey
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
            </div>
          </div>

        </section>
      </div>

    </div>
  );
}
