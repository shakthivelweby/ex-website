"use client";

import Image from "next/image";
import Link from "next/link";
import { getExploreData, getFeaturedDestinations } from "./service";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/free-mode';

export default function Explore() {
  const [mounted, setMounted] = useState(false);
  const [countries, setCountries] = useState([]);
  const [activeCountry, setActiveCountry] = useState(0);

  const { data: featuredDestinationsData } = useQuery({
    queryKey: ['featuredDestinations'],
    queryFn: getFeaturedDestinations
  });

  const featuredDestinations = featuredDestinationsData?.data || [];

  useEffect(() => {
    const fetchData = async () => {
      const response = await getExploreData();
      setCountries(response.data);
      setMounted(true);
    };
    fetchData();
  }, []);

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative h-[60vh] md:h-[80vh] w-full overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1437846972679-9e6e537be46e?q=80&w=2071&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="Explore Destinations"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80" />
        </div>
        <div className="relative h-full container mx-auto px-4 flex flex-col justify-end pb-16">
          <div className="max-w-3xl space-y-6">
            <span className="inline-block text-xs tracking-[0.2em] uppercase text-white/90 font-medium">
              Start Your Journey
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-light text-white leading-[1.1]">
              Explore Amazing Destinations
            </h1>
          </div>
        </div>
      </div>

      {/* Countries Navigation */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-100 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 overflow-x-auto py-3 scrollbar-hide">
            <button
              onClick={() => setActiveCountry(0)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                activeCountry === 0
                ? 'bg-gray-900 text-white shadow-md' 
                : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span>All</span>
              <span className="text-xs opacity-80">({countries.length})</span>
            </button>
            {countries.map((country, index) => (
              <button
                key={country.id}
                onClick={() => setActiveCountry(index + 1)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  activeCountry === index + 1
                  ? 'bg-gray-900 text-white shadow-md' 
                  : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span>{country.name}</span>
                <span className="text-xs opacity-80">({country.state.length})</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Countries and their states */}
      <div className="py-16 space-y-24" id="destinations">
        {countries.map((country, countryIndex) => (
          <section key={country.id} className="px-4">
            <div className="container mx-auto">
              {/* Country Header */}
              <div className="flex flex-col items-start mb-10">
                <span className="text-xs tracking-[0.2em] uppercase text-primary-600 font-medium mb-4">
                  Featured Destinations
                </span>
                <div className="flex items-end justify-between w-full">
                  <div>
                    <h2 className="text-3xl font-light text-gray-900 mb-3">
                      Explore {country.name}
                    </h2>
                    <p className="text-gray-600 max-w-2xl text-base">
                      Discover the diverse landscapes and rich cultural heritage of {country.name}
                    </p>
                  </div>
                </div>
              </div>

              {/* States Carousel */}
              <Swiper
                modules={[FreeMode]}
                spaceBetween={20}
                slidesPerView={1.2}
                freeMode={true}
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
                    slidesPerView: 3.5,
                    spaceBetween: 24,
                  },
                }}
                className="w-full"
              >
                {country.state.map((state) => (
                  <SwiperSlide key={`${country.id}-${state.id}`}>
                    <Link
                      href={`/packages/${state.id}`}
                      className="group block h-full"
                    >
                      <div className="relative w-full aspect-[4/3] overflow-hidden rounded-2xl bg-gray-100">
                        <div className="absolute inset-0">
                          <Image
                            src={state.cover_image_url}
                            alt={state.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          />
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                        
                        <div className="absolute bottom-0 left-0 right-0 p-6">
                          <div>
                            <h3 className="text-2xl font-light text-white mb-2">
                              {state.name}
                            </h3>
                            <div className="flex items-center gap-2 text-white/90">
                              <i className="fi fi-rr-map-marker-alt text-sm"></i>
                              <span className="text-sm font-medium">Explore {state.name}</span>
                            </div>
                          </div>
                        </div>

                        <div className="absolute top-4 right-4 w-9 h-9 bg-white/90 backdrop-blur-md rounded-full items-center justify-center hidden group-hover:flex transition-all duration-300 shadow-lg">
                          <i className="fi fi-rr-arrow-right text-gray-800 text-sm"></i>
                        </div>
                      </div>
                    </Link>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </section>
        ))}
      </div>

      {/* Featured Destinations */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-start mb-10">
            <span className="text-xs tracking-[0.2em] uppercase text-primary-600 font-medium mb-4">
              Popular Choices
            </span>
            <div className="flex items-end justify-between w-full">
              <div>
                <h2 className="text-3xl font-light text-gray-900 mb-3">
                  Featured Destinations
                </h2>
                <p className="text-gray-600 max-w-2xl text-base">
                  Discover our handpicked selection of India's most beloved travel destinations
                </p>
              </div>
            </div>
          </div>

          {featuredDestinations.length > 0 ? (
            <Swiper
              modules={[FreeMode]}
              spaceBetween={20}
              slidesPerView={1.2}
              freeMode={true}
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
              className="w-full"
            >
              {featuredDestinations.map((destination) => (
                <SwiperSlide key={destination.id}>
                  <Link
                    href={`/packages/${destination.state_id}?destination=${destination.id}`}
                    className="group block h-full"
                  >
                    <div className="relative w-full aspect-[3/4] overflow-hidden rounded-2xl bg-gray-100">
                      <div className="absolute inset-0">
                        <Image
                          src={destination.cover_image_url}
                          alt={destination.name}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                      <div className="absolute bottom-0 left-0 right-0 p-6">
                        <div>
                          <h3 className="text-2xl font-light text-white mb-2">
                            {destination.name}
                          </h3>
                          <div className="flex items-center gap-2 text-white/90">
                            <i className="fi fi-rr-map-marker-alt text-sm"></i>
                            <span className="text-sm font-medium">Explore {destination.name}</span>
                          </div>
                        </div>
                      </div>

                      <div className="absolute top-4 right-4 w-9 h-9 bg-white/90 backdrop-blur-md rounded-full items-center justify-center hidden group-hover:flex transition-all duration-300 shadow-lg">
                        <i className="fi fi-rr-arrow-right text-gray-800 text-sm"></i>
                      </div>
                    </div>
                  </Link>
                </SwiperSlide>
              ))}
            </Swiper>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">No featured destinations available at the moment.</p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
