"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function HomePage() {
  const [selectedTrip, setSelectedTrip] = useState("Scheduled Trips");
  const [selectedLocation, setSelectedLocation] = useState("Kerala");

  return (
    <div className="min-h-screen bg-white mx-auto">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">

        <div className="bg-white relative">
            {/* Background Image */}
            <div className="md:h-[500px] h-[560px] rounded-2xl">
            <Image
                src="/home/banner-img.webp"
                alt="banner image"
                className="w-full h-full object-cover rounded-2xl"
                width={1920}
                height={1080}
            />
            </div>

            {/* Hero Content */}
            <div className="absolute inset-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32">
            <div className="max-w-3xl mx-auto text-center">
                <h1 className="text-4xl lg:text-7xl font-semibold text-white mb-2 leading-tight tracking-tighter">
                Pay Less, Book Direct
                </h1>
                <p className="text-xl text-white/90 mb-12">
                The new way to plan your trip!
                </p>

                {/* Search Box */}
                <div className="bg-white rounded-[32px] md:rounded-full shadow-lg  overflow-hidden p-4 md:p-2 max-w-[800px] mx-auto w-full">
                  <div className="flex flex-col md:flex-row gap-4">
                    {/* What you are looking for */}
                    <div className="flex-1 relative">
                      <label className="absolute top-2 left-4 text-sm text-gray-600">
                        What you are looking for?
                      </label>
                      <div className="relative">
                        <select 
                          className="w-full appearance-none bg-transparent rounded-2xl border-0 outline-none px-4 pt-8 pb-2 text-[15px] text-gray-800 font-medium cursor-pointer"
                        >
                          <option>Scheduled Trips</option>
                          <option>Packages</option>
                          <option>Activities</option>
                          <option>Attractions</option>
                          <option>Rentals</option>
                          <option>Events</option>
                        </select>
                        <div className="absolute right-4 top-1/2 pointer-events-none">
                          <i className="fi fi-rr-angle-small-down text-gray-800"></i>
                        </div>
                      </div>
                    </div>

                    {/* Where you want to start from */}
                    <div className="flex-1 relative">
                      <label className="absolute top-2 left-4 text-sm text-gray-600">
                        Where you want to start from?
                      </label>
                      <div className="relative">
                        <select 
                          className="w-full appearance-none bg-transparent rounded-2xl border-0 outline-none px-4 pt-8 pb-2 text-[15px] text-gray-800 font-medium cursor-pointer"
                        >
                          <option>Kerala</option>
                          <option>Tamil Nadu</option>
                          <option>Karnataka</option>
                        </select>
                        <div className="absolute right-4 top-1/2 pointer-events-none">
                          <i className="fi fi-rr-angle-small-down text-gray-800"></i>
                        </div>
                      </div>
                    </div>

                    {/* Search Button */}
                    <button className="w-full md:w-auto bg-primary-500 text-white rounded-full transition-colors hover:bg-primary-600 flex items-center justify-center gap-2 px-6 py-4 md:px-4 md:py-4">
                      <span className="text-base font-medium md:hidden">Search</span>
                      <Image src="/home/search-icon.svg" alt="search icon" width={20} height={20} className="md:w-7 md:h-7" />
                    </button>
                  </div>
                </div>
            </div>
            </div>

            {/* Navigation */}
            {/* <div className="bg-cyan-500 rounded-b-2xl">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <nav className="flex items-center gap-6">
                    <Link 
                        href="/scheduled-trips"
                        className="flex items-center gap-2 px-1 py-4 text-sm font-medium text-primary-600 border-b-2 border-primary-600"
                    >
                        <i className="fi fi-rr-calendar"></i>
                        <span>Scheduled Trips</span>
                    </Link>
                    <Link 
                        href="/packages"
                        className="flex items-center gap-2 px-1 py-4 text-sm font-medium text-gray-600 hover:text-gray-800"
                    >
                        <i className="fi fi-rr-apps"></i>
                        <span>Packages</span>
                    </Link>
                    <Link 
                        href="/activities"
                        className="flex items-center gap-2 px-1 py-4 text-sm font-medium text-gray-600 hover:text-gray-800"
                    >
                        <i className="fi fi-rr-hiking"></i>
                        <span>Activities</span>
                    </Link>
                    <Link 
                        href="/attractions"
                        className="flex items-center gap-2 px-1 py-4 text-sm font-medium text-gray-600 hover:text-gray-800"
                    >
                        <i className="fi fi-rr-building"></i>
                        <span>Attractions</span>
                    </Link>
                    <Link 
                        href="/rentals"
                        className="flex items-center gap-2 px-1 py-4 text-sm font-medium text-gray-600 hover:text-gray-800"
                    >
                        <i className="fi fi-rr-car-side"></i>
                        <span>Rentals</span>
                    </Link>
                    <Link 
                        href="/events"
                        className="flex items-center gap-2 px-1 py-4 text-sm font-medium text-gray-600 hover:text-gray-800"
                    >
                        <i className="fi fi-rr-ticket"></i>
                        <span>Events</span>
                    </Link>
                    </nav>
                </div>
            </div> */}
        </div>
        

        {/* Book without agency section */}
        <section className="relative overflow-hidden">
        {/* Decorative blurred circle background at the top */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] md:w-[600px] md:h-[600px] bg-primary-200 rounded-full blur-3xl opacity-40 md:opacity-30 z-0"></div>
           {/* Heading */}
           <div className="text-center flex flex-col items-center justify-center max-w-2xl mx-auto pt-20 pb-32 px-4 relative">
             <div className="inline-block relative">
               <Image
                 src="/home/star-light.png"
                 alt=""
                 width={100}
                 height={100}
                 className="absolute -left-8 -top-6 w-6 h-6"
               />
               <h2 className="text-3xl md:text-[42px] font-semibold text-gray-800 tracking-tighter mb-6 ">
                 Book your trip without<br />agency fee
               </h2>
               <Image
                 src="/home/star-dark.png"
                 alt=""
                 width={100}
                 height={100}
                 className="absolute -right-10 -bottom-4 w-10 h-10"
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
           <div className="">
            {/* left card */}
              <div className="">
                <div className="">
                  {/* image */}
                    <div>
                      <Image src="/home/left-img.webp" alt="" width={1000} height={1000} className="w-full h-full" />
                    </div>
                    {/* content */}
                    <div className="bg-gray-100 rounded-2xl p-4">
                      {/* content */}
                      <div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-2 tracking-tighter">
                          Save 20% on all bookings!
                        </h3>
                        <p className="text-gray-600 text-sm">
                          We offer the best deals on all bookings, so you can save more and travel more.
                        </p>
                      </div>
                      {/* icon */}
                      <div>
                        <i className="fi fi-rr-badge-percent text-pink-500 text-2xl"></i>
                      </div>
                    </div>
                </div>
              </div>
           </div>
         </section>
      </section>
    
    </div>
  );
}
