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
                spaceBetween={16}
                slidesPerView={1.15}
                centeredSlides={true}
                loop={true}
                autoplay={{
                    delay: 3500,
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
                        slidesPerView: 1.5,
                        centeredSlides: false,
                    },
                    1024: {
                        slidesPerView: 2,
                        centeredSlides: false,
                    },
                }}
                className="pb-8 !px-0"
            >
                {categories.map((category, idx) => (
                    <SwiperSlide key={idx} className="h-auto">
                        <div className="relative group h-[280px] sm:h-[300px] rounded-2xl overflow-hidden cursor-pointer shadow-lg shadow-gray-200/60 border border-white/60">
                            <Image
                                src={category.image}
                                alt={category.title}
                                fill
                                className="object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent"></div>

                            <div className="absolute bottom-0 left-0 p-5 w-full">
                                <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white text-lg mb-3">
                                    <i className={`fi ${category.icon}`}></i>
                                </div>
                                <h3 className="text-xl font-bold text-white mb-1.5">{category.title}</h3>
                                <p className="text-gray-300 text-sm leading-relaxed line-clamp-2">
                                    {category.desc}
                                </p>
                            </div>
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>

            <button className="swiper-button-prev-custom absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-800 shadow-md hover:bg-white transition-all -ml-2 opacity-0 group-hover/swiper:opacity-100 disabled:opacity-30">
                <i className="fi fi-rr-angle-left text-lg"></i>
            </button>
            <button className="swiper-button-next-custom absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-800 shadow-md hover:bg-white transition-all -mr-2 opacity-0 group-hover/swiper:opacity-100 disabled:opacity-30">
                <i className="fi fi-rr-angle-right text-lg"></i>
            </button>
        </div>
    );
}
