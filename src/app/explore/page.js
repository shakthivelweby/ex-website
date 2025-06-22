"use client";

import Image from "next/image";
import Link from "next/link";
import { getExploreData } from "./service";
import { useState, useEffect } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

export default function Explore() {
  const [mounted, setMounted] = useState(false);
  const [countries, setCountries] = useState([]);
  const [activeCountry, setActiveCountry] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  // Featured destinations data
  const featuredDestinations = [
    {
      id: 1,
      name: "Mumbai",
      description: "The Mountain of Dreams",
      image: "https://images.unsplash.com/photo-1591089101324-2280d9260000?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      packages: 12
    },
    {
      id: 2,
      name: "Agra",
      description: "The City of Dreams",
      image: "https://images.unsplash.com/photo-1564507592333-c60657eea523?q=80&w=2071&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      packages: 15
    },
    {
      id: 3,
      name: "Alappuzha",
      description: "The Backwaters of Kerala",
      image: "https://images.unsplash.com/photo-1677700436033-92179d16a25f?q=80&w=1099&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      packages: 10
    },
    {
      id: 4,
      name: "Goa",
      description: "Pearl of the Orient",
      image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=2074&auto=format&fit=crop",
      packages: 8
    }
  ];

  const featuredSliderSettings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 3.2,
    slidesToScroll: 1,
    arrows: false,
    autoplay: false,
    draggable: true,
    swipe: true,
    swipeToSlide: true,
    touchThreshold: 10,
    beforeChange: () => setIsDragging(true),
    afterChange: () => setIsDragging(false),
    responsive: [
      {
        breakpoint: 1280,
        settings: {
          slidesToShow: 2.5,
        }
      },
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2.2,
        }
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1.5,
        }
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 1.2,
          centerMode: true,
          centerPadding: "20px",
        }
      }
    ]
  };

  useEffect(() => {
    const fetchData = async () => {
      const response = await getExploreData();
      setCountries(response.data);
      setMounted(true);
    };
    fetchData();
  }, []);

  const sliderSettings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 2.2,
    slidesToScroll: 1,
    arrows: false,
    autoplay: false,
    pauseOnHover: true,
    draggable: true,
    swipe: true,
    swipeToSlide: true,
    touchThreshold: 10,
    beforeChange: () => setIsDragging(true),
    afterChange: () => setIsDragging(false),
    responsive: [
      {
        breakpoint: 1536,
        settings: {
          slidesToShow: 3.2,
          slidesToScroll: 1,
        }
      },
      {
        breakpoint: 1280,
        settings: {
          slidesToShow: 1.8,
          slidesToScroll: 1,
        }
      },
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 1.5,
          slidesToScroll: 1,
        }
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 1.2,
          slidesToScroll: 1,
          centerMode: true,
          centerPadding: "20px",
        }
      }
    ]
  };

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative h-[75vh] w-full overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1437846972679-9e6e537be46e?q=80&w=2071&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="Explore Destinations"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/70" />
        </div>
        <div className="relative h-full container mx-auto px-4 flex flex-col justify-end pb-32">
          <div className="max-w-3xl space-y-6">
            <span className="inline-block text-xs tracking-[0.2em] uppercase text-white/80 font-light">
              Start Your Journey
            </span>
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-light text-white leading-[1.1]">
              Explore Amazing Destinations
            </h1>
            <p className="text-base sm:text-lg text-white/80 font-light max-w-xl leading-relaxed">
              Discover breathtaking locations and unforgettable experiences across India
            </p>
           
          </div>
        </div>
        {/* Scroll Indicator */}
        <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2">
          <div className="flex flex-col items-center gap-2">
            <span className="text-white/60 text-xs tracking-widest uppercase">Scroll</span>
            <div className="w-[1px] h-8 bg-white/20"></div>
          </div>
        </div>
      </div>


      {/* Countries Navigation */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-100">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-8 overflow-x-auto py-4 scrollbar-hide">
            <button
              onClick={() => setActiveCountry(0)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm whitespace-nowrap ${
                activeCountry === 0
                ? 'bg-gray-900 text-white' 
                : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span>All</span>
              <span className="text-xs opacity-60">({countries.length})</span>
            </button>
            {countries.map((country, index) => (
              <button
                key={country.id}
                onClick={() => setActiveCountry(index)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm whitespace-nowrap ${
                  activeCountry === 6 
                  ? 'bg-gray-900 text-white' 
                  : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span>{country.name}</span>
                <span className="text-xs opacity-60">({country.state.length})</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Countries and their states */}
      <div className="py-10 space-y-20" id="destinations">
        {countries.map((country, countryIndex) => (
          <section 
            key={country.id} 
            className="px-4"
          >
            <div className="container mx-auto">
              {/* Country Header */}
              <div className="flex flex-col items-start mb-12">
                <span className="text-xs tracking-[0.2em] uppercase text-primary-600 mb-4">
                  Featured Destinations
                </span>
                <div className="flex items-end justify-between w-full">
                  <div>
                    <h2 className="text-3xl font-light text-gray-900 mb-3">
                      Explore {country.name}
                    </h2>
                    <p className="text-gray-600 max-w-2xl">
                      From majestic mountains to serene beaches, discover the diverse landscapes and rich cultural heritage of {country.name}
                    </p>
                  </div>
                </div>
              </div>

              {/* States Carousel */}
              <div className="relative overflow-hidden mx-0">
                <div className="destination-slider cursor-grab active:cursor-grabbing">
                  <Slider {...sliderSettings}>
                    {country.state.map((state) => (
                      <div key={`${country.id}-${state.id}`} className="px-2 select-none">
                        <Link
                          href={`/packages/${state.id}`}
                          className={`group block ${isDragging ? 'pointer-events-none' : ''}`}
                          onClick={(e) => isDragging && e.preventDefault()}
                          draggable="false"
                        >
                          <div 
                            className="relative aspect-[4/3] overflow-hidden rounded-2xl select-none"
                            onDragStart={(e) => e.preventDefault()}
                          >
                            <div className="absolute inset-0 select-none">
                              <Image
                                src={state.cover_image_url}
                                alt={state.name}
                                fill
                                className="object-cover select-none"
                                draggable="false"
                                onDragStart={(e) => e.preventDefault()}
                                style={{ pointerEvents: 'none' }}
                              />
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent pointer-events-none" />
                            
                            <div className="absolute bottom-0 left-0 right-0 p-6 pointer-events-none">
                              <div>
                                <h3 className="text-2xl font-light text-white mb-2">
                                  {state.name}
                                </h3>
                                <div className="flex items-center gap-2 text-white/80">
                                  <i className="fi fi-rr-map-marker-alt text-sm"></i>
                                  <span className="text-sm">Explore {state.name}</span>
                                </div>
                              </div>
                            </div>

                            <div className="absolute top-4 right-4 w-8 h-8 bg-white/90 rounded-full items-center justify-center hidden group-hover:flex pointer-events-none">
                              <i className="fi fi-rr-arrow-right text-gray-800 text-sm"></i>
                            </div>
                          </div>
                        </Link>
                      </div>
                    ))}
                  </Slider>
                </div>
              </div>
            </div>
          </section>
        ))}
      </div>


      {/* Featured Destinations */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-start mb-12">
            <span className="text-xs tracking-[0.2em] uppercase text-primary-600 mb-4">
              Popular Choices
            </span>
            <div className="flex items-end justify-between w-full">
              <div>
                <h2 className="text-3xl font-light text-gray-900 mb-3">
                  Featured Destinations
                </h2>
                <p className="text-gray-600 max-w-2xl">
                  Discover our handpicked selection of India's most beloved travel destinations
                </p>
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden">
            <div className="featured-slider cursor-grab active:cursor-grabbing">
              <Slider {...featuredSliderSettings}>
                {featuredDestinations.map((destination) => (
                  <div key={destination.id} className="px-2 select-none">
                    <Link
                      href={`/packages/${destination.id}`}
                      className={`group block ${isDragging ? 'pointer-events-none' : ''}`}
                      onClick={(e) => isDragging && e.preventDefault()}
                      draggable="false"
                    >
                      <div
                        className="relative aspect-[3/4] overflow-hidden rounded-2xl select-none bg-gray-200"
                        onDragStart={(e) => e.preventDefault()}
                      >
                        <div className="absolute inset-0 select-none">
                          <Image
                            src={destination.image}
                            alt={destination.name}
                            fill
                            className="object-cover select-none transition-transform duration-500 group-hover:scale-105"
                            draggable="false"
                            onDragStart={(e) => e.preventDefault()}
                            style={{ pointerEvents: 'none' }}
                          />
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />

                        <div className="absolute bottom-0 left-0 right-0 p-6 pointer-events-none">
                          <div>
                            <span className="text-sm text-white/80 mb-2 block">
                              {destination.packages} Packages
                            </span>
                            <h3 className="text-2xl font-light text-white mb-2">
                              {destination.name}
                            </h3>
                            <div className="flex items-center gap-2 text-white/80">
                              <span className="text-sm">{destination.description}</span>
                            </div>
                          </div>
                        </div>

                        <div className="absolute top-4 right-4 w-8 h-8 bg-white/90 rounded-full items-center justify-center hidden group-hover:flex pointer-events-none">
                          <i className="fi fi-rr-arrow-right text-gray-800 text-sm"></i>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </Slider>
            </div>
          </div>
        </div>
      </section>

      {/* Custom Slider Styles */}
      <style jsx global>{`
        .destination-slider .slick-track {
          display: flex !important;
          margin-left: 0;
        }
        .destination-slider .slick-slide {
          height: inherit !important;
          user-select: none;
          -webkit-user-select: none;
          -webkit-touch-callout: none;
        }
        .destination-slider .slick-list {
          cursor: grab;
          overflow: hidden !important;
          touch-action: pan-y pinch-zoom;
        }
        .destination-slider .slick-list:active {
          cursor: grabbing;
        }
        .destination-slider img {
          pointer-events: none !important;
          user-select: none !important;
          -webkit-user-select: none !important;
          -webkit-touch-callout: none !important;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .slick-list {
          padding: 0 !important;
        }
        .featured-slider .slick-track {
          display: flex !important;
          margin-left: 0;
        }
        .featured-slider .slick-slide {
          height: inherit !important;
          user-select: none;
          -webkit-user-select: none;
          -webkit-touch-callout: none;
        }
        .featured-slider .slick-list {
          cursor: grab;
          overflow: hidden !important;
          touch-action: pan-y pinch-zoom;
          padding: 0 !important;
        }
        .featured-slider .slick-list:active {
          cursor: grabbing;
        }
        .featured-slider img {
          pointer-events: none !important;
          user-select: none !important;
          -webkit-user-select: none !important;
          -webkit-touch-callout: none !important;
        }
      `}</style>
    </main>
  );
}
