"use client";

import Link from "next/link";
import { usePathname } from 'next/navigation';

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
    name: "Bookings", 
    href: "/my-bookings", 
    icon: "fi fi-rr-ticket",
    matchPath: (path) => path.startsWith("/my-bookings")
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

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-50">
      <div className="flex justify-between px-2 py-1">
        {navLinks.map(({ name, href, icon, matchPath }) => {
          const isActive = matchPath(pathname);
          return (
            <Link
              key={name}
              href={href}
              className={`flex flex-col items-center py-1 px-2 min-w-[3.25rem] relative ${isActive ? "text-primary-600" : "text-gray-500 hover:text-gray-700"}`}
            >
              {isActive && <span className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-0.5 h-0.5 bg-primary-500 rounded-full" />}
              <i className={`${icon} text-base ${isActive ? "text-primary-600" : "text-gray-400 group-hover:text-gray-600"}`} />
              <span className={`text-[9px] font-medium leading-none mt-0.5`}>{name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
