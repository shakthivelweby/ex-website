"use client";

import Link from "next/link";
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { useState } from 'react';
import Search from './Search/Search';

const navLinks = [
  {
    name: "Home",
    href: "/",
    icon: "fi fi-rr-home",
    matchPath: (path) => path === "/"
  },
  { 
    name: "Scheduled", 
    href: "/scheduled", 
    icon: "fi fi-rr-calendar",
    matchPath: (path) => path.startsWith("/scheduled")
  },
  { 
    name: "Packages", 
    href: "/explore", 
    icon: "fi fi-rr-umbrella-beach",
    matchPath: (path) => path === "/explore" || path.startsWith("/packages") || path.startsWith("/package")
  },
  { 
    name: "Search", 
    href: "#",
    icon: "fi fi-rr-search",
    matchPath: (path) => false
  },
  { 
    name: "Profile", 
    href: "/profile", 
    icon: "fi fi-rr-user",
    matchPath: (path) => path.startsWith("/profile")
  }
];

export default function MobileNav() {
  const pathname = usePathname();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const handleClick = (href, name) => {
    if (name === "Search") {
      setIsSearchOpen(true);
      return;
    }
  };

  return (
    <>
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 pointer-events-none">
        <motion.nav
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="w-full bg-white shadow-lg border-t border-gray-100 pointer-events-auto"
        >
          <div className="flex items-center justify-around py-2">
            {navLinks.map(({ name, href, icon, matchPath }) => {
              const isActive = matchPath(pathname);
              
              return (
                <Link
                  key={name}
                  href={href}
                  onClick={(e) => {
                    if (name === "Search") {
                      e.preventDefault();
                      handleClick(href, name);
                    }
                  }}
                  className={`
                    relative flex flex-col items-center justify-center
                    ${isActive ? 'w-[120px] px-2' : 'w-[48px]'}
                    h-[44px] rounded-full transition-all duration-300
                    ${isActive ? 'bg-primary-50 text-primary-500' : 'hover:bg-gray-50 text-gray-500'}
                  `}
                >
                  <div className="flex items-center justify-center">
                    <i className={`${icon} text-lg`} />
                    {isActive && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        className="ml-2.5 text-xs font-medium whitespace-nowrap overflow-hidden"
                      >
                        {name}
                      </motion.span>
                    )}
                  </div>
                  {!isActive && (
                    <span className="text-[9px] mt-0.5 text-gray-400 font-medium tracking-tight">
                      {name}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </motion.nav>
      </div>

      <Search 
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </>
  );
}
