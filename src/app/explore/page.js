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
      <div className="relative h-[35vh] md:h-[58vh] w-full overflow-hidden">
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
            <h1 className="text-4xl lg:text-6xl font-semibold text-white leading-[1.1] tracking-tight">
              Explore Amazing Destinations
            </h1>
          </div>
        </div>
      </div>

      {/* Countries Navigation */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-100 shadow-sm hidden">
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
            {console.log(countries)}
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
      <div className="py-0 " id="destinations">
        {countries.map((country, countryIndex) => (
          <section key={country.id} className="px-4 my-16">
            <div className="container mx-auto">
              {/* Country Header */}
              <div className="flex flex-col items-start mb-10">
              
                <div className="flex items-end justify-between w-full">
                  <div className="space-y-3">
                    <h2 className="text-3xl font-light text-gray-900 tracking-tight">
                      Explore {country.name}
                    </h2>
                    <p className="text-gray-600 max-w-2xl">
                      {country.state.length} States • {country.state.reduce((total, state) => total + (state.package_count || 0), 0)} Packages Available
                    </p>
                  </div>
                </div>
              </div>

              {/* States Carousel */}
              <Swiper
                modules={[FreeMode]}
                spaceBetween={24}
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
                      href={`/packages/${country.id}?state=${state.id}`}
                      className="group block h-full"
                    >
                      <div className="relative w-full aspect-[3/4] bg-gray-100 rounded-2xl overflow-hidden">
                        {/* Main Image */}
                        <div className="absolute inset-0">
                          <Image
                            src={state.thumb_image_url}
                            alt={state.name}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          />
                        </div>

                        {/* Overlay with split design */}
                        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/90" />
                        
                        {/* Content Wrapper */}
                        <div className="relative h-full flex flex-col">
                          {/* Top Content */}
                          <div className="p-6">
                            <div className="inline-block bg-black/30 backdrop-blur-md rounded-lg px-4 py-1.5 text-white/90">
                              <span className="text-sm font-medium tracking-wide">
                                {state.package_count || 0} Tour Packages
                              </span>
                            </div>
                          </div>

                          {/* Bottom Content */}
                          <div className="mt-auto p-6">
                            <div className="relative">
                              {/* Main Content */}
                              <div className="space-y-4">
                                <div className="space-y-2">
                                  <h3 className="text-2xl sm:text-3xl font-medium text-white tracking-tight">
                                    {state.name}
                                  </h3>
                                  <p className="text-white/80 text-sm">
                                    Discover amazing tour packages
                                  </p>
                                </div>

                                {/* Action Button */}
                                <button className="relative w-full group/btn">
                                  <div className="absolute inset-0 bg-white/20 rounded-xl blur-xl group-hover/btn:bg-primary-500/40 transition-all duration-300"></div>
                                  <div className="relative bg-white/20 backdrop-blur-sm border border-white/10 rounded-xl px-6 py-3 group-hover/btn:bg-primary-500 transition-all duration-300">
                                    <div className="flex items-center justify-between">
                                      <span className="text-white font-medium">View Packages</span>
                                      <span className="text-white transform group-hover/btn:translate-x-1 transition-transform duration-300">
                                        →
                                      </span>
                                    </div>
                                  </div>
                                </button>
                              </div>
                            </div>
                          </div>
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
              {/* <div className="flex items-center gap-2 mb-4 justify-start">
                  <div className="w-12 h-[2px] bg-primary-500"></div>
                  <span className="text-xs tracking-[0.2em] uppercase text-primary-600 font-medium">
                    Popular Choices
                  </span>
              </div> */}
            <div className="flex items-end justify-between w-full">
              <div className="inline-block relative">
              <Image
                          src="/home/star-light.png"
                          alt=""
                          width={100}
                          height={100}
                          className="absolute -left-8 -top-6 w-6 h-6 animate-pulse"
                        />
                <h2 className="text-3xl md:text-[42px] font-semibold text-gray-800 tracking-tighter mb-3">
                  Featured Destinations
                </h2>
                <Image
                          src="/home/star-dark.png"
                          alt=""
                          width={100}
                          height={100}
                          className="absolute top-0 -right-5 -bottom-4 w-10 h-10 animate-pulse"
                        />
                <p className="text-gray-600 max-w-2xl text-base">
                  Discover our handpicked selection of India&apos;s most beloved travel destinations
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
                    href={`/packages/${destination.state.country_id}?state=${destination.state_id}&destination=${destination.id}`}
                    className="group block h-full"
                  >
                    <div className="relative w-full aspect-[3/4] bg-gray-100 rounded-2xl overflow-hidden">
                      {/* Main Image */}
                      <div className="absolute inset-0">
                        <Image
                          src={destination.cover_image_url}
                          alt={destination.name}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-110"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        />
                      </div>

                      {/* Gradient Overlays */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

                      {/* Content Container */}
                      <div className="relative h-full flex flex-col">
                        {/* Top Badge */}
                        <div className="p-5">
                          <div className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-md rounded-full pl-2 pr-3 py-1">
                            <div className="w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center">
                              <span className="text-[10px] font-semibold text-white">{destination.package_count || 0}</span>
                            </div>
                            <span className="text-xs font-medium text-white">Tour Packages</span>
                          </div>
                        </div>

                        {/* Bottom Content */}
                        <div className="mt-auto p-5 space-y-6">
                          {/* Title */}
                          <div>
                            <h3 className="text-2xl font-medium text-white mb-1">
                              {destination.name}
                            </h3>
                            <div className="flex items-center gap-2">
                              <div className="h-px w-5 bg-primary-500"></div>
                              <span className="text-xs font-medium text-white/70 uppercase tracking-wider">Featured Destination</span>
                            </div>
                          </div>

                          {/* Action Button */}
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

