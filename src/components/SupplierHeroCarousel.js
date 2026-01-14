"use client";

import Image from "next/image";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

export default function SupplierHeroCarousel() {
    const categories = [
        {
            title: "Tour Operators",
            desc: "Multi-day tours, day trips, and excursions.",
            icon: "fi-rr-map-location-track",
            image: "/skydive.avif",
            color: "blue"
        },
        {
            title: "Activity Providers",
            desc: "Workshops, classes, and outdoor adventures.",
            icon: "fi-rr-surfing",
            image: "/trekking.avif",
            color: "orange"
        },
        {
            title: "Attractions",
            desc: "Museums, theme parks, and landmarks.",
            icon: "fi-rr-ticket",
            image: "/safari.avif",
            color: "purple"
        },
        {
            title: "Event Organizers",
            desc: "Festivals, concerts, and cultural events.",
            icon: "fi-rr-calendar-star",
            image: "/event.avif",
            color: "pink"
        },
        {
            title: "Rental Providers",
            desc: "Car rentals, bike rentals, and equipment.",
            icon: "fi-rr-car-side",
            image: "/safari.avif",
            color: "emerald"
        }
    ];

    return (
        <div className="relative group/swiper">
            <Swiper
                modules={[Autoplay, Pagination, Navigation]}
                spaceBetween={24}
                slidesPerView={1.2}
                centeredSlides={true}
                loop={true}
                autoplay={{
                    delay: 3000,
                    disableOnInteraction: false,
                }}
                pagination={{
                    clickable: true,
                    dynamicBullets: true,
                }}
                navigation={{
                    nextEl: '.swiper-button-next-custom',
                    prevEl: '.swiper-button-prev-custom',
                }}
                breakpoints={{
                    640: {
                        slidesPerView: 2,
                        centeredSlides: false,
                    },
                    1024: {
                        slidesPerView: 3,
                        centeredSlides: false,
                    },
                }}
                className="pb-12 px-4 md:px-0"
            >
                {categories.map((category, idx) => (
                    <SwiperSlide key={idx} className="h-auto">
                        <div className="relative group h-[450px] rounded-3xl overflow-hidden cursor-pointer shadow-xl shadow-gray-200/50">
                            <Image
                                src={category.image}
                                alt={category.title}
                                fill
                                className="object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>

                            <div className="absolute bottom-0 left-0 p-8 w-full">
                                <div className={`w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white text-2xl mb-6 group-hover:bg-${category.color}-600 group-hover:border-${category.color}-500 transition-colors`}>
                                    <i className={`fi ${category.icon}`}></i>
                                </div>
                                <h3 className="text-3xl font-bold text-white mb-3">{category.title}</h3>
                                <p className="text-gray-300 text-lg leading-relaxed">
                                    {category.desc}
                                </p>
                            </div>
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>

            {/* Custom Navigation Arrows */}
            {/* Note: In Swiper string selectors, these must match class names. 
                Since they are inside this component, we don't need to change much, 
                but ensure 'relative' parent context is correct. */}
            <button className="swiper-button-prev-custom absolute left-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-800 shadow-lg hover:bg-white transition-all -ml-4 md:-ml-6 opacity-0 group-hover/swiper:opacity-100 disabled:opacity-30">
                <i className="fi fi-rr-angle-left text-xl"></i>
            </button>
            <button className="swiper-button-next-custom absolute right-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-800 shadow-lg hover:bg-white transition-all -mr-4 md:-mr-6 opacity-0 group-hover/swiper:opacity-100 disabled:opacity-30">
                <i className="fi fi-rr-angle-right text-xl"></i>
            </button>
        </div>
    );
}
