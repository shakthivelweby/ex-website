"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import LocationSearchPopup from "@/components/LocationSearchPopup";
import Search from "@/components/Search/Search";
import { useRouter } from "next/navigation";
import { motion, useScroll, useTransform } from "framer-motion";
import EventCard from "@/components/eventCard";
import PackageCard from "@/components/PackageCard";
import DestinationCard from "@/components/DestinationCard";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, FreeMode, Autoplay } from "swiper/modules";
import {
  getPopularDestinations,
  getTrendingPackages,
  getTrendingEvents,
  getTrendingAttractions,
  getHomeData,
} from "../service";
import Footer from "@/components/Footer/Footer";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/free-mode";

const TravelMemories = () => {
  const targetRef = useRef(null);
  const contentRef = useRef(null);
  const lastCardRef = useRef(null);
  const [scrollRange, setScrollRange] = useState(0);

  useEffect(() => {
    const updateScrollRange = () => {
      if (contentRef.current && lastCardRef.current) {
        const viewportWidth = window.innerWidth;

        // Get the last card's left edge position relative to viewport (when x = 0, initial state)
        const lastCardRect = lastCardRef.current.getBoundingClientRect();
        const lastCardLeftViewport = lastCardRect.left;

        // Calculate range so that when scrollYProgress = 1, last card's left edge appears at viewport right edge
        // When we apply x = -range, the last card moves left by 'range' pixels
        // We want: lastCardLeftViewport - range = viewportWidth
        // Therefore: range = lastCardLeftViewport - viewportWidth
        const range = lastCardLeftViewport - viewportWidth;
        setScrollRange(Math.max(0, range));
      }
    };

    // Initial update with a small delay to ensure DOM is ready
    const timeoutId = setTimeout(updateScrollRange, 100);

    // Update on resize
    window.addEventListener("resize", updateScrollRange);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("resize", updateScrollRange);
    };
  }, []);

  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end end"],
  });

  const x = useTransform(scrollYProgress, [0, 1], ["0px", `-${scrollRange}px`]);

  const memories = [
    {
      src: "https://images.pexels.com/photos/237272/pexels-photo-237272.jpeg?auto=compress&cs=tinysrgb&w=600",
      tag: "Wanderlust",
    },
    {
      src: "https://images.pexels.com/photos/1271619/pexels-photo-1271619.jpeg?auto=compress&cs=tinysrgb&w=600",
      tag: "Adventure",
    },
    {
      src: "https://images.pexels.com/photos/210186/pexels-photo-210186.jpeg?auto=compress&cs=tinysrgb&w=600",
      tag: "Serenity",
    },
    {
      src: "https://images.pexels.com/photos/3278215/pexels-photo-3278215.jpeg?auto=compress&cs=tinysrgb&w=600",
      tag: "Explore",
    },
    {
      src: "https://images.pexels.com/photos/450441/pexels-photo-450441.jpeg?auto=compress&cs=tinysrgb&w=600",
      tag: "Journey",
    },
    {
      src: "https://images.pexels.com/photos/1267697/pexels-photo-1267697.jpeg?auto=compress&cs=tinysrgb&w=600",
      tag: "Memories",
    },
    {
      src: "https://images.pexels.com/photos/1371360/pexels-photo-1371360.jpeg?auto=compress&cs=tinysrgb&w=600",
      tag: "Escapade",
    },
    {
      src: "https://images.pexels.com/photos/210243/pexels-photo-210243.jpeg?auto=compress&cs=tinysrgb&w=600",
      tag: "Sunset",
    },
  ];

  return (
    <section
      ref={targetRef}
      className="relative h-[150vh] md:h-[200vh] lg:h-[300vh] bg-gray-50"
    >
      <div className="sticky top-0 flex flex-col h-screen justify-center items-center overflow-hidden z-10 pt-20 pb-10">
        <div className="container mx-auto px-4 text-center mb-8 lg:mb-12 shrink-0">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2 font-handwriting">
            Captured Moments
          </h2>
          <p className="text-gray-600">
            Real stories from real travelers around the world
          </p>
        </div>

        <motion.div
          ref={contentRef}
          style={{ x }}
          className="flex gap-8 lg:gap-12 px-4 md:px-24 items-center"
        >
          {memories.map((m, i) => (
            <div
              key={i}
              ref={i === memories.length - 1 ? lastCardRef : null}
              className="relative flex-shrink-0 w-[150px] h-[200px] lg:w-[300px] lg:h-[400px] bg-white p-2 lg:p-4 shadow-xl transition-all duration-300 transform cursor-pointer group rounded-sm hover:z-10 hover:scale-105"
              style={{
                transform: `rotate(${i % 2 === 0 ? "-2deg" : "2deg"})`,
              }}
            >
              {/* Realistic Pin */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
                <div className="w-8 h-8 rounded-full bg-red-500 shadow-md border-2 border-white/30 flex items-center justify-center">
                  <div className="w-2 h-2 bg-red-700/50 rounded-full"></div>
                </div>
              </div>

              <div className="w-full h-[80%] lg:h-[85%] relative overflow-hidden bg-gray-100 mb-3 grayscale-[20%] group-hover:grayscale-0 transition-all duration-500">
                <Image
                  src={m.src}
                  alt={m.tag}
                  fill
                  className="object-cover transition-transform duration-700"
                />
              </div>
              <div className="text-center font-handwriting text-gray-600 text-sm lg:text-xl group-hover:text-primary-600 transition-colors">
                #{m.tag}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

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

  // State for dynamic content
  const [destinations, setDestinations] = useState([]);
  const [trendingPackages, setTrendingPackages] = useState([]);
  const [trendingEvents, setTrendingEvents] = useState([]);
  const [trendingAttractions, setTrendingAttractions] = useState([]);
  const [categoryCounts, setCategoryCounts] = useState({
    packages: "500+",
    scheduled: "50+",
    attractions: "120+",
    events: "80+",
    rentals: "200+",
    activities: "300+",
  });
  const [loading, setLoading] = useState(true);

  // State for scroll-based horizontal animation
  const [scrollX, setScrollX] = useState(0);
  const [imageParallax, setImageParallax] = useState(0);
  const scrollSectionRef = useRef(null);
  const destinationScrollRef = useRef(null);

  const scrollDestinations = (direction) => {
    if (destinationScrollRef.current) {
      const scrollAmount = 350;
      destinationScrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const router = useRouter();

  const locationText = {
    Packages: "Where you want to explore?",
    Scheduled: "Where you want to explore?",
    Activities: "Where you want to do activity?",
    Attractions: "Where you want to visit?",
    Rentals: "Where you want to rent a vehicle?",
    Events: "Where you want to attend an event?",
  };

  const redirects = {
    Packages: "/packages",
    Scheduled: "/scheduled",
    Activities: "/activities",
    Attractions: "/attractions",
    Rentals: "/rentals",
    Events: "/events",
  };

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const tripOptions = [
    { value: "Packages", label: "Packages", icon: "fi fi-rr-umbrella-beach" },
    { value: "Scheduled", label: "Scheduled Trips", icon: "fi fi-rr-calendar" },
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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
      country_id:
        destination.type === "country"
          ? destination.id
          : destination.country_id,
      state_id:
        destination.type === "state" ? destination.id : destination.state_id,
      destination_id:
        destination.type === "destination" ? destination.id : null,
    };

    // Store in localStorage
    localStorage.setItem("choosedDestination", JSON.stringify(destinationData));

    // Close the popup
    setIsLocationPopupOpen(false);

    // Navigate based on trip type
    if (selectedTrip === "Packages") {
      router.push(
        `/packages/${destinationData.country_id}?state=${destinationData.state_id}&destination=${destinationData.destination_id}`
      );
    } else {
      router.push("/scheduled");
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
      localStorage.setItem(
        "locationCoordinates",
        JSON.stringify({
          latitude: locationData.latitude,
          longitude: locationData.longitude,
        })
      );
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

  // Fetch dynamic content on mount
  useEffect(() => {
    const fetchHomeData = async () => {
      setLoading(true);
      try {
        // Fetch all data in parallel
        const [
          destinationsRes,
          packagesRes,
          eventsRes,
          attractionsRes,
          homeDataRes,
        ] = await Promise.all([
          getPopularDestinations(),
          getTrendingPackages(),
          getTrendingEvents(),
          getTrendingAttractions(),
          getHomeData(),
        ]);

        if (destinationsRes.status && destinationsRes.data) {
          setDestinations(destinationsRes.data);
        }

        if (packagesRes.status && packagesRes.data) {
          setTrendingPackages(packagesRes.data);
        }

        if (eventsRes.status && eventsRes.data) {
          setTrendingEvents(eventsRes.data);
        }

        if (attractionsRes.status && attractionsRes.data) {
          setTrendingAttractions(attractionsRes.data);
        }

        if (homeDataRes.status && homeDataRes.data) {
          setCategoryCounts({
            packages: `${homeDataRes.data.packages_count || 0}+`,
            scheduled: `${homeDataRes.data.scheduled_count || 0}+`,
            attractions: `${homeDataRes.data.attractions_count || 0}+`,
            events: `${homeDataRes.data.events_count || 0}+`,
            rentals: "200+", // Keep static for now
            activities: "300+", // Keep static for now
          });
        }
      } catch (error) {
        console.error("Error fetching home data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  // Handle scroll-based horizontal animation
  useEffect(() => {
    const handleScroll = () => {
      if (scrollSectionRef.current) {
        const rect = scrollSectionRef.current.getBoundingClientRect();
        const windowHeight = window.innerHeight;

        // Calculate when section enters viewport
        const sectionTop = rect.top;
        const sectionHeight = rect.height;

        // Start animation when section is in view
        if (sectionTop < windowHeight && sectionTop + sectionHeight > 0) {
          // Calculate scroll progress (0 to 1)
          const scrollProgress = Math.max(
            0,
            Math.min(
              1,
              (windowHeight - sectionTop) / (windowHeight + sectionHeight)
            )
          );

          // Transform horizontally based on scroll - from right to left
          const translateX = 100 - scrollProgress * 200; // Starts at 100% (right) and moves to -100% (left)
          setScrollX(translateX);

          // Parallax effect for image (moves slower than scroll, creating depth)
          const parallaxY = (scrollProgress - 0.5) * 50; // Moves at 50% speed for parallax effect
          setImageParallax(parallaxY);
        }
      }
    };

    // Use requestAnimationFrame for smoother scroll handling
    let ticking = false;
    const optimizedScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", optimizedScroll, { passive: true });
    handleScroll(); // Initial call

    return () => window.removeEventListener("scroll", optimizedScroll);
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
        url += `${destination.state_id ? "&" : "?"}destination=${
          destination.destination_id
        }`;
      }
      router.push(url);
    } else {
      // For scheduled trips, just go to the scheduled page
      router.push("/scheduled");
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
            <i
              className={`${
                tripOptions.find((opt) => opt.value === selectedTrip)?.icon
              } text-gray-800 text-base transition-colors`}
            ></i>
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
            pointerEvents: isDropdownOpen ? "auto" : "none",
          }}
          transition={{ duration: 0.2 }}
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            left: 0,
            right: 0,
            zIndex: 1000,
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
                  selectedTrip === option.value
                    ? "text-primary-500 font-medium bg-primary-50/50"
                    : "text-gray-700"
                }`}
                whileHover={{ backgroundColor: "rgba(0,0,0,0.03)" }}
                whileTap={{ backgroundColor: "rgba(0,0,0,0.05)" }}
              >
                <i
                  className={`${option.icon} text-lg ${
                    selectedTrip === option.value
                      ? "text-primary-500"
                      : "text-gray-500 group-hover:text-primary-500 transition-colors"
                  }`}
                ></i>
                <div>
                  <div className="font-medium">{option.label}</div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {option.value === "Packages"
                      ? "Explore curated travel packages"
                      : "Join scheduled group trips"}
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
                  opacity: [0.8, 1],
                }}
                transition={{
                  scale: {
                    duration: 10,
                    ease: "easeOut",
                  },
                  opacity: {
                    duration: 1,
                    ease: "linear",
                  },
                }}
                style={{
                  width: "100%",
                  height: "100%",
                  position: "relative",
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
                    objectFit: "cover",
                    width: "100%",
                    height: "100%",
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
                  className="text-xl md:text-2xl text-white/90 mb-8 md:mb-12 font-light max-w-2xl mx-auto"
                >
                  Explore the world&#39;s best experiences at the best prices.
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
                    <button
                      type="submit"
                      className="w-full md:w-auto bg-primary-500 text-white rounded-full transition-colors hover:bg-primary-600 flex items-center justify-center gap-2 px-5 py-2.5 md:px-3.5 md:py-3.5 search-pulse lg:!search-pulse-none"
                    >
                      <span className="text-sm font-semibold md:hidden">
                        Search
                      </span>
                      <Image
                        src="/home/search-icon.svg"
                        alt="search icon"
                        width={18}
                        height={18}
                        className="md:w-6 md:h-6"
                      />
                    </button>
                  </div>
                </motion.form>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Feature Cards Row Section */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="container mx-auto px-4 py-8 mt-8"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: "fi fi-rr-search-alt",
                title: "Discover Destinations",
                description: "Explore amazing places worldwide",
              },
              {
                icon: "fi fi-rr-hand-holding-usd",
                title: "Direct Booking",
                description: "Zero middleman fees",
              },
              {
                icon: "fi fi-rr-shield-check",
                title: "Verified Suppliers",
                description: "100% trusted partners",
              },
              {
                icon: "fi fi-rr-gem",
                title: "Experience Driven",
                description: "Curated local experiences",
              },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white/60 backdrop-blur-md rounded-2xl p-6 shadow-sm hover:shadow-xl hover:shadow-primary-500/10 transition-all duration-300 flex items-start gap-4 border border-white/50 hover:border-primary-100"
              >
                <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center flex-shrink-0 text-primary-600 border border-gray-100">
                  <i className={`${feature.icon} text-xl`}></i>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900 mb-1">
                    {feature.title}
                  </h3>
                  <p className="text-gray-500 text-sm">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* What You Can Book Section - Stacking Cards */}
        {/* What You Can Book Section - Stacking Cards */}
        <section className="container mx-auto px-4 py-24" id="booking-section">
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-start">
            {/* Sticky Header Side */}
            <div className="lg:w-1/3 lg:sticky lg:top-32 h-fit mb-12 lg:mb-0">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="text-left"
              >
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-8 h-[2px] bg-primary-500"></span>
                  <span className="text-xs tracking-[0.2em] uppercase text-primary-600 font-medium">
                    Curated For You
                  </span>
                </div>
                <h2 className="text-3xl lg:text-4xl font-semibold text-gray-900 mb-4 tracking-tight leading-tight">
                  What You{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-400">
                    Can Book
                  </span>
                </h2>
                <p className="text-base text-gray-600 leading-relaxed text-left">
                  Discover a world of possibilities. From curated packages to
                  thrilling activities, everything you need for the perfect
                  journey. We bring you the best options to make your travel
                  experience seamless and memorable.
                </p>
              </motion.div>
            </div>

            {/* Stacking Cards Side */}
            <div className="lg:w-2/3 relative flex flex-col gap-4 lg:gap-8 w-full">
              {[
                {
                  name: "Packages",
                  count: categoryCounts.packages,
                  icon: "fi fi-rr-umbrella-beach",
                  href: "/explore",
                  description:
                    "All-inclusive vacation packages tailored for relaxation and adventure. We handle the details, you enjoy the trip.",
                  image:
                    "https://images.pexels.com/photos/1450353/pexels-photo-1450353.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
                  color: "from-blue-500 to-blue-600",
                  shadow: "shadow-blue-500/20",
                  accent: "text-blue-600",
                  bg: "bg-blue-50",
                },
                {
                  name: "Scheduled Trips",
                  count: categoryCounts.scheduled,
                  icon: "fi fi-rr-calendar",
                  href: "/scheduled",
                  description:
                    "Join organized group tours with fixed departure dates. Meet new people and explore destinations together.",
                  image:
                    "https://images.pexels.com/photos/1365425/pexels-photo-1365425.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
                  color: "from-purple-500 to-purple-600",
                  shadow: "shadow-purple-500/20",
                  accent: "text-purple-600",
                  bg: "bg-purple-50",
                },
                {
                  name: "Attractions",
                  count: categoryCounts.attractions,
                  icon: "fi fi-rr-ferris-wheel",
                  href: "/attractions",
                  description:
                    "Visit top-rated tourist attractions, museums, and theme parks. Skip the line and make memories.",
                  image:
                    "https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
                  color: "from-green-500 to-green-600",
                  shadow: "shadow-green-500/20",
                  accent: "text-green-600",
                  bg: "bg-green-50",
                },
                {
                  name: "Events",
                  count: categoryCounts.events,
                  icon: "fi fi-rr-glass-cheers",
                  href: "/events",
                  description:
                    "Get tickets to concerts, festivals, theater, and sports events happening around the globe.",
                  image:
                    "https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
                  color: "from-red-500 to-red-600",
                  shadow: "shadow-red-500/20",
                  accent: "text-red-600",
                  bg: "bg-red-50",
                },
                {
                  name: "Rentals",
                  count: categoryCounts.rentals,
                  icon: "fi fi-rr-car-side",
                  href: "#",
                  description:
                    "Rent cars, bikes, or boats. Freedom to explore at your own pace with our reliable rental partners.",
                  image:
                    "https://images.pexels.com/photos/120049/pexels-photo-120049.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
                  color: "from-orange-500 to-orange-600",
                  shadow: "shadow-orange-500/20",
                  accent: "text-orange-600",
                  bg: "bg-orange-50",
                },
                {
                  name: "Activities",
                  count: categoryCounts.activities,
                  icon: "fi fi-rr-hiking",
                  href: "#",
                  description:
                    "Book outdoor adventures, workshops, and local experiences to make your trip truly unique.",
                  image:
                    "https://images.pexels.com/photos/847393/pexels-photo-847393.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
                  color: "from-teal-500 to-teal-600",
                  shadow: "shadow-teal-500/20",
                  accent: "text-teal-600",
                  bg: "bg-teal-50",
                },
              ].map((category, index) => (
                <motion.div
                  key={category.name}
                  initial={{ opacity: 0, y: 50, scale: 0.95 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, margin: "-10%" }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="sticky top-24 lg:top-32"
                >
                  <div
                    className={`
                    bg-white rounded-2xl overflow-hidden shadow-xl border border-gray-100 
                    flex flex-col ${
                      index % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"
                    } 
                    min-h-[350px] lg:h-[400px] relative transition-all duration-300
                    hover:shadow-2xl transform
                  `}
                    style={{
                      boxShadow: "0 20px 40px -12px rgba(0, 0, 0, 0.1)",
                    }}
                  >
                    <div
                      className={`absolute top-0 left-0 w-full h-full bg-gradient-to-br ${category.color} opacity-[0.03] z-0`}
                    ></div>

                    {/* Content Side */}
                    <div className="flex-1 p-6 lg:p-10 flex flex-col justify-center relative z-10">
                      <div className="flex items-center gap-3 mb-4">
                        <div
                          className={`w-12 h-12 rounded-xl ${category.bg} ${category.accent} flex items-center justify-center text-xl shadow-sm`}
                        >
                          <i className={category.icon}></i>
                        </div>
                        <span
                          className={`text-xs font-bold tracking-wider uppercase ${category.accent} bg-white px-3 py-1 rounded-full shadow-sm border border-gray-100`}
                        >
                          {category.count} Items
                        </span>
                      </div>

                      <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-3 leading-tight">
                        {category.name}
                      </h3>

                      <p className="text-gray-600 text-sm leading-relaxed mb-6 font-normal">
                        {category.description}
                      </p>

                      <Link href={category.href}>
                        <button
                          className={`
                        group flex items-center gap-2 px-6 py-3 rounded-full 
                        bg-gray-900 text-white text-sm font-medium transition-all duration-300
                        hover:bg-primary-600 hover:gap-3 hover:shadow-lg hover:shadow-primary-500/25
                      `}
                        >
                          Explore Now
                          <i className="fi fi-rr-arrow-right transition-transform group-hover:translate-x-1"></i>
                        </button>
                      </Link>
                    </div>

                    {/* Image Side */}
                    <div className="flex-none lg:flex-1 relative h-[220px] lg:h-full overflow-hidden">
                      <div className="absolute inset-0 bg-gray-900/10 z-10 transition-opacity hover:opacity-0"></div>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.7 }}
                        className="w-full h-full"
                      >
                        <Image
                          src={category.image}
                          alt={category.name}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 50vw"
                        />
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Explore by Destination Section - Horizontal Scroll */}
        <section className="py-24 bg-gray-50 relative overflow-hidden">
          <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
              {/* Left Control Panel (Sticky on Desktop) */}
              <div className="lg:w-1/3 flex flex-col justify-center lg:sticky lg:top-32 h-fit z-10">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <span className="w-12 h-[2px] bg-primary-500"></span>
                    <span className="text-xs tracking-[0.2em] uppercase text-primary-600 font-medium">
                      Destinations
                    </span>
                  </div>
                  <h2 className="text-3xl lg:text-4xl font-semibold text-gray-900 mb-4 tracking-tight leading-tight">
                    Escape to the <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-400">
                      Extraordinary
                    </span>
                  </h2>
                  <p className="text-gray-500 text-lg mb-8 leading-relaxed max-w-md">
                    Explore our curated list of top-rated destinations. From
                    sandy beaches to snowy mountains, find the perfect spot for
                    your next vacation.
                  </p>

                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => scrollDestinations("left")}
                      className="w-14 h-14 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-black hover:text-white hover:border-black transition-all duration-300 group"
                      aria-label="Scroll left"
                    >
                      <i className="fi fi-rr-arrow-left text-xl group-hover:-translate-x-1 transition-transform"></i>
                    </button>
                    <button
                      onClick={() => scrollDestinations("right")}
                      className="w-14 h-14 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-black hover:text-white hover:border-black transition-all duration-300 group"
                      aria-label="Scroll right"
                    >
                      <i className="fi fi-rr-arrow-right text-xl group-hover:translate-x-1 transition-transform"></i>
                    </button>
                  </div>

                  <div className="mt-12">
                    <Link
                      href="/explore"
                      className="text-primary-600 font-semibold inline-flex items-center gap-2 hover:gap-4 transition-all"
                    >
                      View All Destinations
                      <i className="fi fi-rr-arrow-right"></i>
                    </Link>
                  </div>
                </motion.div>
              </div>

              {/* Right Scrollable Panel */}
              <div className="lg:w-2/3 min-w-0">
                {" "}
                {/* min-w-0 prevents flex child from overflowing */}
                {loading ? (
                  <div className="flex gap-6 overflow-hidden">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="min-w-[300px] h-[450px] bg-white rounded-[32px] animate-pulse"
                      ></div>
                    ))}
                  </div>
                ) : destinations.length > 0 ? (
                  <div
                    ref={destinationScrollRef}
                    className="flex gap-6 overflow-x-auto pb-8 pt-4 snap-x snap-mandatory scrollbar-hide -mr-4 pr-4 lg:pr-0 lg:mr-0"
                    style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                  >
                    {/* Intro Card / Call to action card if desired, else just destinations */}
                    {destinations.map((dest, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: idx * 0.1, duration: 0.5 }}
                        className="min-w-[280px] md:min-w-[340px] h-[450px] md:h-[500px] snap-start"
                      >
                        <DestinationCard
                          destination={{
                            name: dest.name,
                            image:
                              dest.image ||
                              "https://images.unsplash.com/photo-1596422846543-75c6a197f070?q=80&w=1000",
                            packageCount: dest.package_count || 0,
                            description:
                              dest.description ||
                              `${dest.package_count || 0} Tours available`,
                            trending: idx < 2, // First 2 are trending
                            href: dest.country_id
                              ? `/packages/${dest.country_id}?state=${
                                  dest.state_id || ""
                                }&destination=${dest.destination_id || ""}`
                              : `/explore`,
                          }}
                          className="h-full shadow-lg hover:shadow-xl transition-shadow duration-300"
                        />
                      </motion.div>
                    ))}

                    {/* "See More" End Card */}
                    <div className="min-w-[200px] md:min-w-[250px] h-[450px] md:h-[500px] snap-start flex items-center justify-center">
                      <Link
                        href="/explore"
                        className="group flex flex-col items-center gap-4 text-center"
                      >
                        <div className="w-20 h-20 rounded-full border-2 border-primary-100 flex items-center justify-center group-hover:bg-primary-50 transition-colors">
                          <i className="fi fi-rr-arrow-right text-3xl text-primary-500 group-hover:translate-x-1 transition-transform"></i>
                        </div>
                        <span className="font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
                          Browse All <br /> Destinations
                        </span>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-[400px] text-gray-400 bg-white rounded-[32px]">
                    No destinations available
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <section
          ref={scrollSectionRef}
          className="relative overflow-hidden h-[550px] md:h-[600px] lg:h-[700px]"
        >
          <Image
            className="w-full h-full object-cover"
            src="/cover.jpg"
            alt="banner image"
            width={1000}
            height={1000}
            style={{
              transform: `translateY(${imageParallax}%) scale(1.1)`,
              willChange: "transform",
              transition: "transform 0.1s ease-out",
            }}
          />
          <p
            className="absolute top-1/2 left-0 text-white text-7xl font-bold z-10 whitespace-nowrap"
            style={{
              transform: `translateX(${scrollX}%) translateY(-50%)`,
              willChange: "transform",
            }}
          >
            DISCOVER YOUR NEXT ADVENTURE • EXPLORE THE WORLD • CREATE MEMORIES •
            DISCOVER YOUR NEXT ADVENTURE • EXPLORE THE WORLD • CREATE MEMORIES
          </p>
        </section>

        {/* Popular on the Platform Section - Refreshed */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="container mx-auto px-4 py-24 relative"
        >
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
            <div className="max-w-2xl text-left">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-8 h-[2px] bg-primary-500"></span>
                <span className="text-xs tracking-[0.2em] uppercase text-primary-600 font-medium">
                  Trending Now
                </span>
              </div>
              <h2 className="ext-3xl lg:text-4xl font-semibold text-gray-900 mb-4 tracking-tight leading-tight">
                Travel Trends <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-400">
                  You’ll Love
                </span>
              </h2>
            </div>

            <div className="flex flex-col items-start md:items-end gap-6">
              <p className="text-gray-500 text-lg max-w-md md:text-right leading-relaxed">
                Discover the most booked and highest rated activities by
                travelers like you this week.
              </p>
              <Link
                href="/explore"
                className="text-primary-600 font-semibold inline-flex items-center gap-2 hover:gap-4 transition-all"
              >
                <span className="font-medium">View All Trending</span>
                <i className="fi fi-rr-arrow-right group-hover:translate-x-1 transition-transform"></i>
              </Link>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
              <div className="flex items-center justify-center h-[400px]">
                <div className="text-gray-400">
                  Loading trending experiences...
                </div>
              </div>
            </div>
          ) : (
            (() => {
              // Combine packages, events, and attractions
              const trendingItems = [];

              // Add packages
              trendingPackages.slice(0, 2).forEach((pkg) => {
                trendingItems.push({
                  type: "Package",
                  id: pkg.id,
                  title: pkg.name,
                  location: pkg.starting_location || "Location TBA",
                  price: pkg.price || 0,
                  rating: 4.8,
                  image:
                    pkg.images && pkg.images.length > 0
                      ? `${process.env.NEXT_PUBLIC_API_URL}/images/packages/${pkg.images[0].image_name}`
                      : "https://images.unsplash.com/photo-1564507592333-c60657eea523?q=80&w=1000&auto=format&fit=crop",
                  href: `/package/${pkg.id}`,
                });
              });

              // Add events
              trendingEvents.slice(0, 2).forEach((event) => {
                trendingItems.push({
                  type: "Event",
                  id: event.id,
                  title: event.name,
                  location: event.location || "Location TBA",
                  price: 0, // Events may need separate pricing logic
                  rating: 4.9,
                  image:
                    event.cover_image ||
                    event.thumb_image ||
                    "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?q=80&w=1170&auto=format&fit=crop",
                  href: `/events/${event.id}`,
                });
              });

              // Add attractions
              trendingAttractions.slice(0, 2).forEach((attraction) => {
                trendingItems.push({
                  type: "Attraction",
                  id: attraction.id,
                  title: attraction.name,
                  location: attraction.location || "Location TBA",
                  price: 0, // Attractions may need separate pricing logic
                  rating: 4.7,
                  image:
                    attraction.cover_image ||
                    attraction.thumb_image ||
                    "https://images.unsplash.com/photo-1564507592333-c60657eea523?q=80&w=1000&auto=format&fit=crop",
                  href: `/attractions/${attraction.id}`,
                });
              });

              return trendingItems.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                  {trendingItems.map((item, index) => (
                    <Link key={index} href={item.href}>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                        className="group relative h-[400px] w-full rounded-3xl overflow-hidden cursor-pointer shadow-md hover:shadow-xl transition-all duration-500"
                      >
                        <Image
                          src={item.image}
                          alt={item.title}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-700"
                        />

                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                        {/* Top Badges */}
                        <div className="absolute top-4 left-4 flex gap-2">
                          <span className="bg-white/20 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-full border border-white/10">
                            {item.type}
                          </span>
                        </div>
                        <div className="absolute top-4 right-4">
                          <div className="flex items-center gap-1 bg-white rounded-full px-2 py-1 shadow-sm">
                            <i className="fi fi-sr-star text-yellow-400 text-xs"></i>
                            <span className="text-xs font-bold text-gray-900">
                              {item.rating}
                            </span>
                          </div>
                        </div>

                        {/* Bottom Content */}
                        <div className="absolute bottom-0 left-0 right-0 p-6 text-white translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                          <h3 className="text-xl font-bold mb-2 leading-snug">
                            {item.title}
                          </h3>
                          <div className="flex items-center gap-2 text-white/80 text-sm mb-4">
                            <i className="fi fi-rr-marker text-xs"></i>
                            <span className="line-clamp-1">
                              {item.location}
                            </span>
                          </div>

                          <div className="flex items-center justify-between pt-4 border-t border-white/20">
                            <div className="flex flex-col">
                              <span className="text-xs text-white/60 uppercase tracking-wider">
                                Prices from
                              </span>
                              <span className="text-lg font-bold">
                                {item.price > 0
                                  ? `₹${item.price.toLocaleString()}`
                                  : "Price TBA"}
                              </span>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-white text-gray-900 flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all duration-300">
                              <i className="fi fi-rr-arrow-right"></i>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                  <div className="flex items-center justify-center h-[400px]">
                    <div className="text-gray-400">
                      No trending experiences available
                    </div>
                  </div>
                </div>
              );
            })()
          )}
        </motion.section>

        {/* How It Works Section */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="container mx-auto px-4 py-16 mt-8"
        >
          <div className="max-w-4xl mx-auto text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-12 h-[2px] bg-primary-500"></div>
              <span className="text-xs tracking-[0.2em] uppercase text-primary-600 font-medium">
                Simple Process
              </span>
              <div className="w-12 h-[2px] bg-primary-500"></div>
            </div>
            <h2 className="text-3xl lg:text-4xl font-semibold text-gray-900 mb-4 tracking-tight">
              How It Works
            </h2>
            <p className="text-gray-600 text-base max-w-2xl mx-auto">
              Three simple steps to your perfect travel experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                step: "01",
                icon: "fi fi-rr-search",
                title: "Discover",
                description:
                  "Browse thousands of experiences from verified suppliers",
              },
              {
                step: "02",
                icon: "fi fi-rr-credit-card",
                title: "Book Direct",
                description:
                  "Book directly with suppliers and save on every booking",
              },
              {
                step: "03",
                icon: "fi fi-rr-smile",
                title: "Enjoy",
                description:
                  "Experience authentic travel moments and create memories",
              },
            ].map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                className="text-center relative"
              >
                {index < 2 && (
                  <div className="hidden md:block absolute top-16 left-[60%] w-[80%] h-0.5 bg-gray-200 z-0">
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-primary-500 rounded-full"></div>
                  </div>
                )}
                <div className="relative z-10">
                  <div className="w-20 h-20 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-6 group">
                    <i className={`${step.icon} text-primary-600 text-3xl`}></i>
                  </div>
                  <div className="text-primary-600 font-bold text-sm mb-2">
                    STEP {step.step}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed max-w-xs mx-auto">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Travel Memories Section - Visual Appeal */}
        <TravelMemories />

        {/* Supplier Call-to-Action Section */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="container mx-auto px-4 py-16 mt-8"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Main CTA Card */}
            <div className="lg:col-span-7 xl:col-span-8 bg-gray-900 rounded-[32px] p-8 md:p-12 relative overflow-hidden flex flex-col justify-between min-h-[400px] border border-gray-800">
              {/* Background Accents */}
              <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary-500/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3"></div>

              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 backdrop-blur-md mb-6">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                  <span className="text-xs font-medium text-white/90 tracking-wide uppercase">
                    Submit your list
                  </span>
                </div>

                <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-[1.1]">
                  Expand your reach <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-white">
                    Worldwide.
                  </span>
                </h2>

                <p className="text-gray-400 text-lg max-w-lg mb-8 leading-relaxed">
                  Connect with millions of travelers planning their next
                  adventure. Simple onboarding, powerful tools, and 24/7
                  support.
                </p>
              </div>

              <div className="relative z-10 flex flex-wrap gap-4">
                <a
                  href="https://supplier.exploreworld.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-8 py-4 bg-white text-gray-900 rounded-full font-bold hover:bg-gray-100 transition-all flex items-center gap-2 group"
                >
                  Become a Partner
                  <i className="fi fi-rr-arrow-right group-hover:translate-x-1 transition-transform"></i>
                </a>
                <a
                  href="https://supplier.exploreworld.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-8 py-4 bg-transparent border border-gray-700 text-white rounded-full font-medium hover:bg-white/5 transition-all"
                >
                  <span className="opacity-80">Log In</span>
                </a>
              </div>
            </div>

            {/* Side Feature Cards */}
            <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-6">
              {/* Feature 1 */}
              <div className="bg-primary-50 rounded-[32px] p-8 flex-1 flex flex-col justify-center border border-primary-100/50 hover:shadow-lg transition-shadow duration-300">
                <div className="w-12 h-12 rounded-2xl bg-primary-100 text-primary-600 flex items-center justify-center text-2xl mb-4">
                  <i className="fi fi-rr-wallet"></i>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Maximized Earnings
                </h3>
                <p className="text-gray-600">
                  Competitive commission rates and zero listing fees. Keep more
                  of what you earn.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-primary-600 rounded-[32px] p-8 flex-1 flex flex-col justify-center text-white relative overflow-hidden group hover:shadow-lg transition-shadow duration-300">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700"></div>
                <div className="relative z-10">
                  <h3 className="text-xl font-bold mb-2">Instant Visibility</h3>
                  <p className="text-primary-100 mb-4">
                    Your experiences go live immediately after verification.
                    Start getting bookings today.
                  </p>
                  <div className="flex -space-x-3">
                    {[
                      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop",
                      "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop",
                      "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=100&h=100&fit=crop",
                      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
                    ].map((src, i) => (
                      <div
                        key={i}
                        className="w-8 h-8 rounded-full border-2 border-primary-600 bg-gray-300 relative overflow-hidden"
                      >
                        <Image
                          src={src}
                          fill
                          alt="user"
                          className="object-cover"
                        />
                      </div>
                    ))}
                    <div className="w-8 h-8 rounded-full border-2 border-primary-600 bg-white text-primary-700 flex items-center justify-center text-[10px] font-bold z-10">
                      1k+
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.section>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
