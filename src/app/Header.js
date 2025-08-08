import Link from "next/link";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import Button from "./common/Button";
import { usePathname } from 'next/navigation';
import Search from './Search/Search';
import { useRouter } from 'next/navigation';
import Login from "./Login/Login";
import Signup from "./Login/Signup";
import Popup from "./Popup";
import ShareOptions from "./ShareOptions/ShareOptions";
import { motion, AnimatePresence } from "framer-motion";

export default function Header() {
  const pathname = usePathname();
  // ... other existing states ...

  // Check if current page is a package detail page
  const isPackageDetailPage = pathname.startsWith('/package/');

  return (
    <>
      <header className="w-full bg-white z-50 fixed top-0 left-0 right-0">
        <div className="container mx-auto flex items-center justify-between py-2 px-3">
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
            {/* Share Button - Only show on package detail pages */}
            {isPackageDetailPage && (
              <div className="hidden lg:block">
                <ShareOptions url={typeof window !== 'undefined' ? window.location.href : ''} title="Check out this amazing package!" />
              </div>
            )}

            {/* Search Button - Desktop */}
            <button
              onClick={() => setShowSearch(true)}
              className="hidden lg:flex items-center gap-2 px-4 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-full transition-all duration-200 group h-9"
            >
              <i className="fi fi-rr-search text-gray-700 group-hover:text-gray-900 transition-colors"></i>
              <span>Search</span>
              <div className="hidden sm:flex items-center gap-1 ml-1 pl-2 border-l border-gray-200">
                <kbd className="text-[10px] font-medium bg-white/80 px-1.5 py-0.5 rounded shadow-sm">⌘</kbd>
                <kbd className="text-[10px] font-medium bg-white/80 px-1.5 py-0.5 rounded shadow-sm">K</kbd>
              </div>
            </button>

            {/* Share Button - Mobile (Only show on package detail pages) */}
            {isPackageDetailPage && (
              <div className="lg:hidden">
                <ShareOptions url={typeof window !== 'undefined' ? window.location.href : ''} title="Check out this amazing package!" />
              </div>
            )}

            {/* Search Button - Mobile */}
            <button
              onClick={() => setShowSearch(true)}
              className="lg:hidden flex items-center justify-center w-9 h-9 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-full transition-all duration-200"
            >
              <i className="fi fi-rr-search text-gray-700"></i>
            </button>

            {/* Rest of the existing code ... */}
          </div>
        </div>
      </header>
    </>
  );
} 