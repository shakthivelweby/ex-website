"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import Button from "./common/Button";

const navLinks = [
  {
    name: "Scheduled Trips",
    href: "/scheduled",
    icon: "fi fi-rr-pending",
    active: true,
  },
  { name: "Packages", href: "#", icon: "fi fi-rr-umbrella-beach" },
  { name: "Activities", href: "#", icon: "fi fi-rr-person-climbing" },
  { name: "Attractions", href: "#", icon: "fi fi-rr-binoculars" },
  { name: "Rentals", href: "#", icon: "fi fi-rr-biking" },
  { name: "Events", href: "#", icon: "fi fi-rr-glass-cheers" },
];

export default function Header({setShowLogin}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef(null);
  const userMenuRef = useRef(null);

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }

    // Close menu when clicking outside
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  const handleLogin = () => {
    setIsLoading(true);
    // Simulate a small delay before showing the login modal
    setTimeout(() => {
      setShowLogin(true);
      setIsLoading(false);
    }, 300);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setShowUserMenu(false);
    // You might want to redirect to home page or refresh the page here
    window.location.reload();
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

        {/* User Menu */}
        <div className="flex items-center relative" ref={userMenuRef}>
          {user ? (
            <>
              <button 
                className="inline-flex items-center justify-center gap-3 pl-2 pr-3 py-1.5 rounded-full bg-white hover:bg-gray-50 border border-gray-200 transition-all duration-200 group"
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                <div className="relative">
                  <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center overflow-hidden">
                    {user.avatar ? (
                      <Image
                        src={user.avatar}
                        alt={user.name}
                        width={32}
                        height={32}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <i className="fi fi-rr-user text-primary-600 text-sm"></i>
                    )}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors line-clamp-1">{user.name}</p>
                    {/* <p className="text-xs text-gray-500 line-clamp-1">{user.email}</p> */}
                  </div>
                  <i className={`fi fi-rr-angle-small-down text-gray-400 transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`}></i>
                </div>
              </button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-100 py-2 transform opacity-100 scale-100 transition-all duration-200 origin-top-right">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{user.email}</p>
                  </div>
                  <div className="py-1">
                    <Link 
                      href="/profile" 
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary-600 transition-colors group"
                    >
                      <i className="fi fi-rr-user text-gray-400 group-hover:text-primary-600 transition-colors"></i>
                      <div>
                        <span className="font-medium">Profile</span>
                        <p className="text-xs text-gray-500 mt-0.5">Manage your account settings</p>
                      </div>
                    </Link>
                    <Link 
                      href="/bookings" 
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary-600 transition-colors group"
                    >
                      <i className="fi fi-rr-ticket text-gray-400 group-hover:text-primary-600 transition-colors"></i>
                      <div>
                        <span className="font-medium">My Bookings</span>
                        <p className="text-xs text-gray-500 mt-0.5">View your trip history</p>
                      </div>
                    </Link>
                  </div>
                  <div className="border-t border-gray-100 mt-1 pt-1">
                    <button 
                      onClick={handleLogout}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 w-full text-left transition-colors group"
                    >
                      <i className="fi fi-rr-sign-out text-red-400 group-hover:text-red-600 transition-colors"></i>
                      <div>
                        <span className="font-medium">Logout</span>
                        <p className="text-xs text-red-400 mt-0.5">Sign out of your account</p>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogin}
                icon={<i className="fi fi-rr-user"></i>}
                isLoading={isLoading}
              >
                Sign in
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Navigation */}
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
