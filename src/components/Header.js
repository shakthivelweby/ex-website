"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";

const navLinks = [
  {
    name: "Scheduled Trips",
    href: "/",
    icon: "fi fi-rr-pending",
    active: true,
  },
  { name: "Packages", href: "#", icon: "fi fi-rr-umbrella-beach" },
  { name: "Activities", href: "#", icon: "fi fi-rr-person-climbing" },
  { name: "Attractions", href: "#", icon: "fi fi-rr-binoculars" },
  { name: "Rentals", href: "#", icon: "fi fi-rr-biking" },
  { name: "Events", href: "#", icon: "fi fi-rr-glass-cheers" },
];

export default function Header() {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef(null);

  // Handle active link selection
  const handleLinkClick = (index) => {
    setActiveIndex(index);
    if (scrollRef.current) {
      const linkElement = scrollRef.current.children[index];
      const scrollLeft =
        linkElement.offsetLeft -
        scrollRef.current.clientWidth / 2 +
        linkElement.clientWidth / 2;
      scrollRef.current.scrollTo({
        left: scrollLeft,
        behavior: "smooth",
      });
    }
  };

  // Scroll to active link on mount
  useEffect(() => {
    if (scrollRef.current) {
      const activeIndex = navLinks.findIndex((link) => link.active);
      if (activeIndex >= 0) {
        const activeElement = scrollRef.current.children[activeIndex];
        setTimeout(() => {
          const scrollLeft =
            activeElement.offsetLeft -
            scrollRef.current.clientWidth / 2 +
            activeElement.clientWidth / 2;
          scrollRef.current.scrollLeft = scrollLeft;
        }, 100);
      }
    }
  }, []);

  return (
    <header className="w-full bg-white shadow-sm relative z-50">
      <div className="container mx-auto flex items-center justify-between py-4 px-3">
        {/* Logo */}
        <div className="flex items-center">
          <Link href="/">
            <Image
              src="/exploreworld-logo.png"
              alt="Logo"
              width={100}
              height={28}
              className="w-[120px] md:w-[150px]"
            />
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-5">
          {navLinks.map((link, index) => (
            <Link
              key={link.name}
              href={link.href}
              className={`flex items-center text-sm font-medium mr-4 ${
                link.active
                  ? "text-primary-600"
                  : "text-gray-700 hover:text-gray-900"
              }`}
            >
              <i
                className={`${link.icon} text-sm mr-2 ${
                  link.active ? "text-primary-600" : "text-gray-500"
                }`}
              ></i>
              {link.name}
              {link.active && (
                <div className="ml-1.5 h-1 w-1 bg-primary-500 rounded-full"></div>
              )}
            </Link>
          ))}
        </nav>

        {/* User Icon */}
        <div className="flex items-center">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary-100">
            <i className="fi fi-rr-user text-primary-600 text-sm"></i>
          </span>
        </div>
      </div>

      {/* Minimal Horizontal Navigation */}
      <div className="lg:hidden relative border-t border-gray-100 bg-white">
        {/* Scroll indicators */}
        <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-white to-transparent pointer-events-none z-10"></div>
        <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-white to-transparent pointer-events-none z-10"></div>

        {/* Small arrow indicator */}
        <div className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 animate-pulse z-20">
          <i className="fi fi-rr-angle-circle-right text-xs"></i>
        </div>

        <style jsx>{`
          .hide-scrollbar::-webkit-scrollbar {
            display: none;
          }
          .hide-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }

          @keyframes scroll-hint {
            0% {
              transform: translateX(0);
            }
            50% {
              transform: translateX(3px);
            }
            100% {
              transform: translateX(0);
            }
          }

          .scroll-hint {
            animation: scroll-hint 1.5s ease-in-out infinite;
          }
        `}</style>

        <div
          ref={scrollRef}
          className="flex w-full py-2 px-3 overflow-x-auto snap-x snap-mandatory scroll-smooth hide-scrollbar"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {navLinks.map((link, index) => (
            <Link
              key={link.name}
              href={link.href}
              className={`flex items-center px-3 py-1 mx-1 min-w-[auto] snap-center rounded-full transition-all text-xs font-medium whitespace-nowrap ${
                index === activeIndex
                  ? "text-primary-600 bg-primary-50"
                  : "text-gray-600"
              } ${index > 0 && index < 3 ? "scroll-hint" : ""}`}
              onClick={(e) => {
                e.preventDefault();
                handleLinkClick(index);
              }}
            >
              <i
                className={`${link.icon} text-sm mr-2.5 ${
                  index === activeIndex ? "text-primary-600" : "text-gray-500"
                }`}
              ></i>
              {link.name}
              {index === activeIndex && (
                <div className="ml-1.5 h-1 w-1 bg-primary-500 rounded-full"></div>
              )}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}
