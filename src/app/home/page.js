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
  const { scrollYProgress } = useScroll({
    target: targetRef,
  });

  const x = useTransform(scrollYProgress, [0, 1], ["1%", "-65%"]);

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
    <section ref={targetRef} className="relative h-[300vh] bg-gray-50">
      <div className="sticky top-0 flex h-screen items-center overflow-hidden z-10">
        <div className="container mx-auto px-4 absolute top-28 left-0 right-0 z-10 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2 font-handwriting">
            Captured Moments
          </h2>
          <p className="text-gray-600">
            Real stories from real travelers around the world
          </p>
        </div>

        <motion.div style={{ x }} className="flex gap-12 px-12 md:px-24">
          {memories.map((m, i) => (
            <div
              key={i}
              className="relative flex-shrink-0 w-[300px] h-[400px] bg-white p-4 shadow-xl transition-all duration-300 transform cursor-pointer group rounded-sm hover:z-10 hover:scale-105"
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

              <div className="w-full h-[85%] relative overflow-hidden bg-gray-100 mb-3 grayscale-[20%] group-hover:grayscale-0 transition-all duration-500">
                <Image
                  src={m.src}
                  alt={m.tag}
                  fill
                  className="object-cover transition-transform duration-700"
                />
              </div>
              <div className="text-center font-handwriting text-gray-600 text-xl group-hover:text-primary-600 transition-colors">
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

          // Transform horizontally based on scroll (reduced speed for smoother movement)
          const translateX = scrollProgress * 80 - 40; // Reduced from 200 to 80 for slower, smoother movement
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
                  className="text-5xl lg:text-8xl font-black text-white mb-6 leading-[0.9] tracking-tighter uppercase drop-shadow-lg"
                >
                  DISCOVER YOUR <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-white">
                    NEXT ADVENTURE
                  </span>
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

        {/* Platform Value Section */}
        {/* Platform Value Section - Refreshed */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="container mx-auto px-4 py-16 mt-8"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-12 bg-gradient-to-br from-gray-50 via-gray-50 to-primary-50/30 rounded-[40px] p-8 md:p-12 overflow-hidden relative">
            {/* Decorative background elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-100/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-100/30 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
            <div className="md:w-1/3">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-12 h-[2px] bg-primary-500"></div>
                <span className="text-xs tracking-[0.2em] uppercase text-primary-600 font-medium">
                  About The Platform
                </span>
              </div>
              <h2 className="text-3xl lg:text-4xl font-semibold text-gray-900 mb-4 tracking-tight leading-tight">
                Discover, Compare, <br />
                <span className="text-primary-600">Book Direct.</span>
              </h2>
              <p className="text-gray-600 text-base leading-relaxed mb-6">
                Your single discovery platform to easily find, compare, and book
                trips, activities, and rentals. Focusing on destination-based
                browsing and trust-driven design to offer you better pricing and
                transparency.
              </p>
              <button className="text-primary-600 font-medium flex items-center gap-2 hover:gap-3 transition-all">
                Learn more about us <i className="fi fi-rr-arrow-right"></i>
              </button>
            </div>

            <div className="md:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                {
                  icon: "fi fi-rr-search-alt",
                  title: "Search-First Discovery",
                  description: "Find exactly what you want",
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
                    <p className="text-gray-500 text-sm">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        <section ref={scrollSectionRef} className="relative overflow-hidden">
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
                <h2 className="text-3xl lg:text-3xl xl:text-4xl font-bold text-gray-900 mb-6 tracking-tight leading-tight">
                  What You Can Book
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
                    <div className="flex-1 relative h-[200px] lg:h-full overflow-hidden">
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

        {/* Explore by Destination Section */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="container mx-auto px-4 py-16 mt-8 bg-white"
        >
          <div className="flex items-end justify-between mb-12">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 mb-4">
                <Image
                  src="/home/star-light.png"
                  alt=""
                  width={24}
                  height={24}
                  className="w-6 h-6 animate-pulse"
                />
                <span className="text-xs tracking-[0.2em] uppercase text-gray-500 font-medium">
                  Popular Destinations
                </span>
              </div>
              <h2 className="text-3xl lg:text-[42px] font-semibold text-gray-900 mb-3 tracking-tight leading-none">
                Explore by Destination
              </h2>
              <p className="text-gray-600 text-lg font-light">
                Browse by destination to find curated trips, activities, and
                rentals.
              </p>
            </div>
            <Link
              href="/explore"
              className="hidden lg:flex items-center gap-2 px-6 py-3 rounded-full bg-gray-50 hover:bg-gray-100 text-gray-900 font-medium text-sm transition-colors"
            >
              View All
              <i className="fi fi-rr-arrow-right"></i>
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-auto lg:h-[600px] mx-auto max-w-7xl">
              <div className="flex items-center justify-center h-[600px]">
                <div className="text-gray-400">Loading destinations...</div>
              </div>
            </div>
          ) : destinations.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-auto lg:h-[600px] mx-auto max-w-7xl">
              {/* Left Column */}
              <div className="flex flex-col gap-4 min-h-[500px] lg:min-h-0">
                {destinations[0] && (
                  <div className="h-1/2">
                    <DestinationCard
                      destination={{
                        name: destinations[0].name,
                        image:
                          destinations[0].image ||
                          "https://images.unsplash.com/photo-1557750255-c76072a7bb56?q=80&w=1000",
                        packageCount: destinations[0].package_count || 0,
                        description: `${
                          destinations[0].package_count || 0
                        } Tour Packages`,
                        href: destinations[0].country_id
                          ? `/packages/${destinations[0].country_id}?state=${
                              destinations[0].state_id || ""
                            }&destination=${
                              destinations[0].destination_id || ""
                            }`
                          : `/explore`,
                      }}
                      className="h-full"
                    />
                  </div>
                )}
                {destinations[1] && (
                  <div className="h-1/2">
                    <DestinationCard
                      destination={{
                        name: destinations[1].name,
                        image:
                          destinations[1].image ||
                          "https://images.unsplash.com/photo-1596422846543-75c6a197f070?q=80&w=1000",
                        packageCount: destinations[1].package_count || 0,
                        description: `${
                          destinations[1].package_count || 0
                        } Tour Packages`,
                        href: destinations[1].country_id
                          ? `/packages/${destinations[1].country_id}?state=${
                              destinations[1].state_id || ""
                            }&destination=${
                              destinations[1].destination_id || ""
                            }`
                          : `/explore`,
                      }}
                      className="h-full"
                    />
                  </div>
                )}
              </div>

              {/* Middle Column */}
              {destinations[2] && (
                <div className="lg:col-span-2 min-h-[500px] lg:min-h-0">
                  <DestinationCard
                    destination={{
                      name: destinations[2].name,
                      image:
                        destinations[2].image ||
                        "https://images.unsplash.com/photo-1523482580672-01e6f2836647?q=80&w=1000",
                      packageCount: destinations[2].package_count || 0,
                      description: `${
                        destinations[2].package_count || 0
                      } Tour Packages`,
                      href: destinations[2].country_id
                        ? `/packages/${destinations[2].country_id}?state=${
                            destinations[2].state_id || ""
                          }&destination=${destinations[2].destination_id || ""}`
                        : `/explore`,
                    }}
                    className="h-full"
                  />
                </div>
              )}

              {/* Right Column */}
              <div className="flex flex-col gap-4 min-h-[500px] lg:min-h-0">
                {destinations[3] && (
                  <div className="h-1/2">
                    <DestinationCard
                      destination={{
                        name: destinations[3].name,
                        image:
                          destinations[3].image ||
                          "https://images.unsplash.com/photo-1516550893923-42d28e560348?q=80&w=1000",
                        packageCount: destinations[3].package_count || 0,
                        description: `${
                          destinations[3].package_count || 0
                        } Tour Packages`,
                        href: destinations[3].country_id
                          ? `/packages/${destinations[3].country_id}?state=${
                              destinations[3].state_id || ""
                            }&destination=${
                              destinations[3].destination_id || ""
                            }`
                          : `/explore`,
                      }}
                      className="h-full"
                    />
                  </div>
                )}
                {destinations[4] && (
                  <div className="h-1/2">
                    <DestinationCard
                      destination={{
                        name: destinations[4].name,
                        image:
                          destinations[4].image ||
                          "https://images.unsplash.com/photo-1591523447926-a0b2fd8936ac?q=80&w=1000",
                        packageCount: destinations[4].package_count || 0,
                        description: `${
                          destinations[4].package_count || 0
                        } Tour Packages`,
                        href: destinations[4].country_id
                          ? `/packages/${destinations[4].country_id}?state=${
                              destinations[4].state_id || ""
                            }&destination=${
                              destinations[4].destination_id || ""
                            }`
                          : `/explore`,
                      }}
                      className="h-full"
                    />
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-auto lg:h-[600px] mx-auto max-w-7xl">
              <div className="flex items-center justify-center h-[600px]">
                <div className="text-gray-400">No destinations available</div>
              </div>
            </div>
          )}

          <div className="flex justify-center mt-8 lg:hidden">
            <Link
              href="/explore"
              className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium text-sm"
            >
              View All Destinations
              <i className="fi fi-rr-arrow-right"></i>
            </Link>
          </div>
        </motion.section>

        {/* Popular on the Platform Section - Refreshed */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="container mx-auto px-4 py-16 mt-8 border-t border-gray-100"
        >
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-3xl lg:text-[42px] font-semibold text-gray-900 mb-4 tracking-tight">
              Trending Experiences
            </h2>
            <p className="text-gray-600 text-lg font-light max-w-2xl mx-auto">
              Highly rated for a reason. Book what everyone&apos;s talking
              about.
            </p>
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
          <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-3xl p-8 md:p-12 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl"></div>

            <div className="relative z-10 max-w-4xl mx-auto text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <div className="w-12 h-[2px] bg-white/50"></div>
                <span className="text-xs tracking-[0.2em] uppercase text-white/90 font-medium">
                  For Suppliers
                </span>
                <div className="w-12 h-[2px] bg-white/50"></div>
              </div>
              <h2 className="text-3xl lg:text-5xl font-bold mb-4 tracking-tight">
                Sell Directly to Travelers
              </h2>
              <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
                Join thousands of verified suppliers. List your experiences,
                reach more customers, and grow your business with our
                commission-based model.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/supplier/register"
                  className="bg-white text-primary-600 px-8 py-4 rounded-full font-semibold hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  List Your Experience
                </Link>
                <Link
                  href="/supplier/login"
                  className="bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white px-8 py-4 rounded-full font-semibold hover:bg-white/20 transition-all duration-300"
                >
                  Become a Supplier
                </Link>
              </div>
              <div className="mt-8 flex items-center justify-center gap-8 text-sm text-white/80">
                <div className="flex items-center gap-2">
                  <i className="fi fi-rr-check-circle"></i>
                  <span>No setup fees</span>
                </div>
                <div className="flex items-center gap-2">
                  <i className="fi fi-rr-check-circle"></i>
                  <span>Commission-based</span>
                </div>
                <div className="flex items-center gap-2">
                  <i className="fi fi-rr-check-circle"></i>
                  <span>Quick onboarding</span>
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
