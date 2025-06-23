"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import Button from "./common/Button";
import { usePathname } from 'next/navigation';

const navLinks = [
  {
    name: "Scheduled Trips",
    href: "/scheduled",
    icon: "fi fi-rr-pending",
    matchPath: (path) => path === "/scheduled"
  },
  { 
    name: "Packages", 
    href: "/explore", 
    icon: "fi fi-rr-umbrella-beach",
    matchPath: (path) => path === "/explore" || path.startsWith("/packages") || path.startsWith("/package")
  },
  // { 
  //   name: "Activities", 
  //   href: "#", 
  //   icon: "fi fi-rr-hiking",
  //   matchPath: (path) => path === "/activities"
  // },
  // { 
  //   name: "Attractions", 
  //   href: "#", 
  //   icon: "fi fi-rr-binoculars",
  //   matchPath: (path) => path === "/attractions"
  // },
  // { 
  //   name: "Rentals", 
  //   href: "#", 
  //   icon: "fi fi-rr-biking",
  //   matchPath: (path) => path === "/rentals"
  // },
  // { 
  //   name: "Events", 
  //   href: "#", 
  //   icon: "fi fi-rr-glass-cheers",
  //   matchPath: (path) => path === "/events"
  // },
];

export default function Header({setShowLogin}) {
  const pathname = usePathname();
  const [activeIndex, setActiveIndex] = useState(0);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileNav, setShowMobileNav] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef(null);
  const userMenuRef = useRef(null);
  const mobileNavRef = useRef(null);

  // Set active index based on current path
  useEffect(() => {
    const index = navLinks.findIndex(link => link.matchPath(pathname));
    if (index !== -1) {
      setActiveIndex(index);
    }
  }, [pathname]);

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }

    // Close menu when clicking outside
    const handleClickOutside = (event) => {
      if (mobileNavRef.current && !mobileNavRef.current.contains(event.target)) {
        setShowMobileNav(false);
      }
    };

    if (showMobileNav) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMobileNav]);

  const handleLinkClick = (index) => {
    setActiveIndex(index);
    setShowMobileNav(false);
  };

  const handleLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      setShowLogin(true);
      setIsLoading(false);
      setShowMobileNav(false);
    }, 300);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setShowMobileNav(false);
    window.location.reload();
  };

  const handleMobileMenuToggle = () => {
    setShowMobileNav(!showMobileNav);
  };

  return (
    <header className="w-full bg-white shadow-sm  z-50 fixed top-0 left-0 right-0">
      <div className="container mx-auto flex items-center justify-between py-4 px-3">
        {/* Logo */}
        <div className="flex items-center">
          <Link href="/" onClick={() => setShowMobileNav(false)}>
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
          {navLinks.map((link, index) => {
            const isActive = link.matchPath(pathname);
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`flex items-center text-sm font-medium mr-4 ${
                  isActive
                    ? "text-primary-600"
                    : "text-gray-700 hover:text-gray-900"
                }`}
                onClick={() => handleLinkClick(index)}
              >
                <i
                  className={`${link.icon} text-sm mr-2 ${
                    isActive ? "text-primary-600" : "text-gray-500"
                  }`}
                ></i>
                {link.name}
                {isActive && (
                  <div className="ml-1.5 h-1 w-1 bg-primary-500 rounded-full"></div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Mobile Menu and User Menu */}
        <div className="flex items-center gap-3">
          <button 
            type="button"
            className="lg:hidden flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-50"
            onClick={() => setShowMobileNav(prev => !prev)}
          >
            <i className={`fi ${showMobileNav ? 'fi-rr-cross' : 'fi-rr-menu-burger'} text-gray-700`}></i>
          </button>

          {/* User Menu */}
          <div className="relative" ref={userMenuRef}>
            {user ? (
              <button 
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center"
              >
                {/* Mobile Avatar Only */}
                <div className="lg:hidden relative flex items-center justify-center">
                  <div className="w-9 h-9 rounded-full bg-primary-50 flex items-center justify-center overflow-hidden">
                    {user.avatar ? (
                      <Image
                        src={user.avatar}
                        alt={user.name}
                        width={36}
                        height={36}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <i className="fi fi-rr-user text-primary-600 text-base"></i>
                    )}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                </div>

                {/* Desktop Full Menu */}
                <div className="hidden lg:flex items-center gap-3 pl-2 pr-3 py-1.5 rounded-full bg-white hover:bg-gray-50 border border-gray-200 transition-all duration-200 group">
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
                    </div>
                    <i className={`fi fi-rr-angle-small-down text-gray-400 transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`}></i>
                  </div>
                </div>
              </button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogin}
                icon={<i className="fi fi-rr-user"></i>}
                isLoading={isLoading}
                className="hidden lg:flex"
              >
                Sign in
              </Button>
            )}

            {/* User Dropdown Menu */}
            {showUserMenu && user && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-100 py-2 transform opacity-100 scale-100 transition-all duration-200 origin-top-right z-50">
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
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      <div 
        ref={mobileNavRef}
        className={`lg:hidden fixed inset-0 top-[72px] bg-white shadow-lg border-t border-gray-100 transition-all duration-300 ease-in-out transform ${
          showMobileNav ? 'translate-y-0 opacity-100 visible' : 'translate-y-full opacity-0 invisible'
        }`}
      >
        <div className="h-full overflow-y-auto">
          <nav className="flex flex-col divide-y divide-gray-100">
            {navLinks.map((link, index) => {
              const isActive = link.matchPath(pathname);
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`flex items-center px-6 py-4 transition-all ${
                    isActive
                      ? "bg-primary-50/50 text-primary-600"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                  onClick={() => handleLinkClick(index)}
                >
                  <i
                    className={`${link.icon} text-sm mr-4 ${
                      isActive ? "text-primary-600" : "text-gray-500"
                    }`}
                  ></i>
                  <span className="font-medium text-base">{link.name}</span>
                  {isActive && (
                    <div className="ml-auto">
                      <i className="fi fi-rr-check text-primary-600"></i>
                    </div>
                  )}
                </Link>
              );
            })}

            {!user && (
              <button
                onClick={() => {
                  handleLogin();
                  setShowMobileNav(false);
                }}
                className="flex items-center px-6 py-4 text-primary-600 hover:bg-primary-50 transition-all lg:hidden"
              >
                <i className="fi fi-rr-user text-xl mr-4"></i>
                <span className="font-medium text-base">Sign in</span>
              </button>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
