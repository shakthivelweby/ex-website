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
           <div className="grid grid-cols-1 lg:grid-cols-3 items-center gap-6">
            {/* left card */}
              <div className="">
                <div className="flex flex-col gap-6">
                  {/* image */}
                    <div className="w-full h-[250px]">
                      <Image src="/home/left-img.webp" alt="" width={1000} height={1000} className="w-full h-full rounded-2xl border-[3px] border-gray-800" />
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
                    <Image src="/home/center-img.webp" alt="" width={1000} height={1000} className="w-full h-full rounded-2xl border-[3px] border-gray-800" />
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
                      <Image src="/home/right-img.webp" alt="" width={1000} height={1000} className="w-full h-full rounded-2xl border-[3px] border-gray-800" />
                    </div>
                  
                </div>
              </div>
           </div>
         </div>


         {/* Popular Destinations */}
         <div className="container mx-auto py-20">

          {/* Heading */}
          <div className="text-center flex flex-col items-center justify-center max-w-2xl mx-auto pt-20 pb-20 px-4 relative">
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
           {/* Grid of destination cards */}
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 relative">
             {/* Destination Card */}
             <a href="#" className="relative group overflow-hidden rounded-3xl h-[350px] z-10">
               <Image
                 src="/home/destination-1.webp"
                 alt="Rajasthan"
                 width={400}
                 height={350}
                 className="w-full h-full object-cover"
               />
               {/* Gradient Overlay */}
               <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/60"></div>
               {/* Arrow Button */}
               <div className="absolute top-4 right-4 w-8 h-8 bg-white/90 rounded-full !flex !items-center !justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                 <i className="fi fi-rr-arrow-small-right text-gray-800 text-xl -rotate-45"></i>
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
                 className="w-full h-full object-cover"
               />
               {/* Gradient Overlay */}
               <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/60"></div>
               {/* arrow Button */}
               <div className="absolute top-4 right-4 w-8 h-8 bg-white/90 rounded-full !flex !items-center !justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                 <i className="fi fi-rr-arrow-small-right text-gray-800 text-xl -rotate-45"></i>
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
                 className="w-full h-full object-cover"
               />
               {/* Gradient Overlay */}
               <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/60"></div>
               {/* Arrow Button */}
               <div className="absolute top-4 right-4 w-8 h-8 bg-white/90 rounded-full !flex !items-center !justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                 <i className="fi fi-rr-arrow-small-right text-gray-800 text-xl -rotate-45"></i>
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
                 className="w-full h-full object-cover"
               />
               {/* Gradient Overlay */}
               <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/60"></div>
               {/* Arrow Button */}
               <div className="absolute top-4 right-4 w-8 h-8 bg-white/90 rounded-full !flex !items-center !justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                 <i className="fi fi-rr-arrow-small-right text-gray-800 text-xl -rotate-45"></i>
               </div>
               {/* Location Name */}
               <div className="absolute bottom-6 left-6">
                 <h3 className="text-white text-xl font-medium">Dubai</h3>
               </div>
             </a>
              {/* Decorative blurred circle background at the top */}
              <div className="absolute left-2 top-0 bottom-0 w-[300px] h-[300px] md:w-[600px] md:h-[600px] bg-primary-200 rounded-full blur-3xl opacity-40 md:opacity-30 z-0"></div>
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
         <div className="container mx-auto py-20">
           {/* Heading */}
           <div className="max-w-lg relative mb-20">
             <div className="relative">
               <Image
                 src="/home/star-light.png"
                 alt=""
                 width={100}
                 height={100}
                 className="absolute -left-6 -top-6 w-4 h-4"
               />
               <h2 className="text-3xl md:text-[42px] font-semibold text-gray-800 tracking-tighter leading-tight">
                 What you can do<br />with Exploreworld
               </h2>
               <Image
                 src="/home/star-dark.png"
                 alt=""
                 width={100}
                 height={100}
                 className="absolute -right-6 bottom-0 w-8 h-8"
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
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
               <div className="bg-white rounded-3xl p-6 hover:shadow-lg transition-shadow">
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
               <div className="bg-white rounded-3xl p-6 hover:shadow-lg transition-shadow">
                 <div className="mb-4">
                   <i className="fi fi-rr-box text-primary-500 text-2xl"></i>
                 </div>
                 <h3 className="text-xl font-semibold text-gray-800 mb-3">Packages</h3>
                 <p className="text-gray-600 text-sm mb-4">Fixed-date tours planned by trusted local suppliers. Just book and join no planning needed!</p>
                 <a href="#" className="inline-flex items-center text-primary-500 hover:text-primary-600 gap-2">
                   View all
                   <i className="fi fi-rr-arrow-small-right"></i>
                 </a>
               </div>

               {/* Activity */}
               <div className="bg-white rounded-3xl p-6 hover:shadow-lg transition-shadow">
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
               <div className="bg-white rounded-3xl p-6 hover:shadow-lg transition-shadow">
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
               <div className="bg-white rounded-3xl p-6 hover:shadow-lg transition-shadow">
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
               <div className="bg-white rounded-3xl p-6 hover:shadow-lg transition-shadow">
                 <div className="mb-4">
                   <i className="fi fi-rr-ticket text-primary-500 text-2xl"></i>
                 </div>
                 <h3 className="text-xl font-semibold text-gray-800 mb-3">Events</h3>
                 <p className="text-gray-600 text-sm mb-4">Fixed-date tours planned by trusted local suppliers. Just book and join no planning needed!</p>
                 <a href="#" className="inline-flex items-center text-primary-500 hover:text-primary-600 gap-2">
                   View all
                   <i className="fi fi-rr-arrow-small-right"></i>
                 </a>
               </div>
             </div>
           </div>
         </div>

      </section>
    
    </div>
  );
}
