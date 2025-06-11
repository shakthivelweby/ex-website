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

        <div className="bg-white relative z-10">
            {/* Background Image */}
            <div className="md:h-[500px] h-[470px] rounded-[32px]">
            <Image
                src="/home/banner-img.webp"
                alt="banner image"
                className="w-full h-full object-cover rounded-[32px]"
                width={1920}
                height={1080}
            />
            </div>

            {/* Hero Content */}
            <div className="absolute inset-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 md:pt-32">
            <div className="max-w-3xl mx-auto text-center">
                <h1 className="text-4xl lg:text-7xl font-bold md:font-semibold text-white mb-2 leading-tight tracking-tighter">
                Pay Less, Book Direct
                </h1>
                <p className="text-xl text-white/90 mb-6 md:mb-12">
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
                          className="w-full appearance-none bg-transparent rounded-3xl border-0 outline-none px-4 pt-8 pb-2 text-[15px] text-gray-800 font-medium cursor-pointer"
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
                     {/* line */}
                     <div className=" md:hidden h-[1px] bg-gray-100 w-full"></div>
                    {/* Where you want to start from */}
                    <div className="flex-1 relative">
                      <label className="absolute top-2 left-4 text-sm text-gray-600">
                        Where you want to start from?
                      </label>
                      <div className="relative">
                        <select 
                          className="w-full appearance-none bg-transparent rounded-3xl border-0 outline-none px-4 pt-8 pb-2 text-[15px] text-gray-800 font-medium cursor-pointer"
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
                    <button className="w-full md:w-auto bg-primary-500 text-white rounded-full transition-colors hover:bg-primary-600 flex items-center justify-center gap-2 px-6 py-4 md:px-4 md:py-4 search-pulse lg:!search-pulse-none">
                      <span className="text-base font-semibold md:hidden">Search</span>
                      <Image src="/home/search-icon.svg" alt="search icon" width={20} height={20} className="md:w-7 md:h-7" />
                    </button>
                  </div>
                </div>
            </div>
            </div>

            {/* <style jsx global>{`
              .search-pulse {
                transition: 0.3s;
                transform: translateY(0px);
                opacity: 1;
                visibility: visible;
                animation: borderPulse 2000ms infinite ease-out;
              }
              
              .search-pulse-none {
                animation: none!important;
              }

              @keyframes borderPulse {
                0%,
                45% {
                  box-shadow: 0px 0px 0px 0px rgba(163, 163, 163, 0.815);
                }
                100% {
                  box-shadow: 0px 0px 0px 15px rgba(167, 167, 167, 0);
                }
              }
            `}</style> */}

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
                          Save 20% on all <br/> bookings!
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
                          Book direclty to <br/> local suppliers
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
         <div className="container mx-auto py-20 relative">
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
         <div className="container mx-auto py-20 relative">
          

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
         <div className="container mx-auto  relative">
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

            {/* Blog Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
              {/* Blog Card 1 */}
              <a href="#" className="overflow-hidden group">
                <div className="relative">
                  <div className="aspect-[4/3] overflow-hidden rounded-3xl">
                    <Image
                      src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2073&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                      alt="Beach"
                      width={400}
                      height={300}
                      className="w-full h-full object-cover  rounded-3xl border-[3px] border-gray-800 group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <div className="absolute top-4 right-4 bg-white rounded-full px-2 py-1 text-sm text-gray-800">
                  <i className="fi fi-rr-calendar mr-2"></i>
                    Aug 20, 2025
                  </div>
                </div>
                <div className="mt-4">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2 tracking-tighter leading-snug">
                    Top 10 Hidden Beaches to Visit in Southeast Asia
                  </h3>
                  <p className="text-gray-600 text-sm mb-2">
                    Discover serene, crowd-free beaches with our top offbeat coastal picks.
                  </p>
                  <a href="#" className="text-sm text-gray-800 font-medium flex items-center gap-2 hover:text-primary-500">
                    Read More
                    <i className="fi fi-bs-arrow-up-right text-xs"></i>
                  </a>
                </div>
              </a>
              {/* Blog Card 2 */}
              <a href="#" className="overflow-hidden group">
                <div className="relative">
                  <div className="aspect-[4/3] overflow-hidden rounded-3xl">
                    <Image
                      src="https://images.unsplash.com/photo-1569668443977-367a489241ef?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                      alt="Beach"
                      width={400}
                      height={300}
                      className="w-full h-full object-cover  rounded-3xl border-[3px] border-gray-800 group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <div className="absolute top-4 right-4 bg-white rounded-full px-2 py-1 text-sm text-gray-800">
                  <i className="fi fi-rr-calendar mr-2"></i>
                    Aug 14, 2025
                  </div>
                </div>
                <div className="mt-4">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2 tracking-tighter leading-snug">
                    Experience the Real Dubai with Hidden Gems and Local Life
                  </h3>
                  <p className="text-gray-600 text-sm mb-2">
                    Discover serene, crowd-free beaches with our top offbeat coastal picks.
                  </p>
                  <a href="#" className="text-sm text-gray-800 font-medium flex items-center gap-2 hover:text-primary-500">
                    Read More
                    <i className="fi fi-bs-arrow-up-right text-xs"></i>
                  </a>
                </div>
              </a>
              {/* Blog Card 3 */}
              <a href="#" className="overflow-hidden group">
                <div className="relative">
                  <div className="aspect-[4/3] overflow-hidden rounded-3xl">
                    <Image
                      src="https://images.unsplash.com/photo-1502301197179-65228ab57f78?q=80&w=1970&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                      alt="Beach"
                      width={400}
                      height={300}
                      className="w-full h-full object-cover  rounded-3xl border-[3px] border-gray-800 group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <div className="absolute top-4 right-4 bg-white rounded-full px-2 py-1 text-sm text-gray-800">
                  <i className="fi fi-rr-calendar mr-2"></i>
                    Aug 5, 2025
                  </div>
                </div>
                <div className="mt-4">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2 tracking-tighter leading-snug">
                    Packing Smart Essentials for Every Type of Traveler
                  </h3>
                  <p className="text-gray-600 text-sm mb-2">
                    Discover serene, crowd-free beaches with our top offbeat coastal picks.
                  </p>
                  <a href="#" className="text-sm text-gray-800 font-medium flex items-center gap-2 hover:text-primary-500">
                    Read More
                    <i className="fi fi-bs-arrow-up-right text-xs"></i>
                  </a>
                </div>
              </a>

          
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
         <div className="container mx-auto py-20 relative">
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
                <Image
                  src="/home/star-dark.png"
                  alt=""
                  width={100}
                  height={100}
                  className="absolute right-0 lg:-right-10 bottom-0 md:-bottom-4 w-10 h-10"
                />
              </div>
              <p className="text-gray-600 text-base">
                See what real explorers have to say
              </p>
              <div className="w-44 mt-6">
                <Image src="/home/line.png" alt="" width={1000} height={1000} className="w-full h-full" />
              </div>
            </div>

            {/* Testimonials Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
              {/* Testimonial Card 1 */}
              <div className="bg-white rounded-3xl p-8 border border-gray-300 lg:border-gray-100 transition-all duration-300 h-full flex flex-col">
                <div className="flex gap-1 mb-6">
                  <i className="fi fi-ss-star text-primary-500 text-lg"></i>
                  <i className="fi fi-ss-star text-primary-500 text-lg"></i>
                  <i className="fi fi-ss-star text-primary-500 text-lg"></i>
                  <i className="fi fi-ss-star text-primary-500 text-lg"></i>
                  <i className="fi fi-ss-star text-primary-500 text-lg"></i>
                </div>
                <div className="flex-grow">
                  <p className="text-gray-800 text-sm leading-relaxed">
                    Website design did exactly what you said it does. Just what I was looking for. Nice work on your website design.
                  </p>
                </div>
                <div className="flex items-center gap-4 mt-8 pt-6 border-t border-gray-100">
                  <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                    <i className="fi fi-sr-user text-primary-500"></i>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800 text-sm">Kyle Roberts DVM</h4>
                    <p className="text-gray-500 text-xs mt-0.5">Customer Care Consultant</p>
                  </div>
                </div>
              </div>

              {/* Testimonial Card 2 */}
              <div className="bg-white rounded-3xl p-8 border border-gray-300 lg:border-gray-100 transition-all duration-300 h-full flex flex-col">
                <div className="flex gap-1 mb-6">
                  <i className="fi fi-ss-star text-primary-500 text-lg"></i>
                  <i className="fi fi-ss-star text-primary-500 text-lg"></i>
                  <i className="fi fi-ss-star text-primary-500 text-lg"></i>
                  <i className="fi fi-ss-star text-primary-500 text-lg"></i>
                  <i className="fi fi-ss-star text-primary-500 text-lg"></i>
                </div>
                <div className="flex-grow">
                  <p className="text-gray-800 text-sm leading-relaxed">
                    Very easy to use and intuitive interface. Since I started using this platform, my travel planning has become so much more efficient. I&apos;m really impressed with the quality of service!
                  </p>
                </div>
                <div className="flex items-center gap-4 mt-8 pt-6 border-t border-gray-100">
                  <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                    <i className="fi fi-sr-user text-primary-500"></i>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800 text-sm">Sophia Anderson</h4>
                    <p className="text-gray-500 text-xs mt-0.5">Internal Implementation Officer</p>
                  </div>
                </div>
              </div>

              {/* Testimonial Card 3 */}
              <div className="bg-white rounded-3xl p-8 border border-gray-300 lg:border-gray-100 transition-all duration-300 h-full flex flex-col">
                <div className="flex gap-1 mb-6">
                  <i className="fi fi-ss-star text-primary-500 text-lg"></i>
                  <i className="fi fi-ss-star text-primary-500 text-lg"></i>
                  <i className="fi fi-ss-star text-primary-500 text-lg"></i>
                  <i className="fi fi-ss-star text-primary-500 text-lg"></i>
                  <i className="fi fi-ss-star text-primary-500 text-lg"></i>
                </div>
                <div className="flex-grow">
                  <p className="text-gray-800 text-sm leading-relaxed">
                    If you want real marketing that works and effective implementation, this platform has got you covered. The results speak for themselves.
                  </p>
                </div>
                <div className="flex items-center gap-4 mt-8 pt-6 border-t border-gray-100">
                  <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                    <i className="fi fi-sr-user text-primary-500"></i>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800 text-sm">Stephen Brekke</h4>
                    <p className="text-gray-500 text-xs mt-0.5">Global Integration Producer</p>
                  </div>
                </div>
              </div>
            </div>
         </div>

      </section>
    
    </div>
  );
}
