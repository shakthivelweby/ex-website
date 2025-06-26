"use client";

import Link from "next/link";
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import Search from './Search/Search';
import Login from './Login/Login';
import Signup from './Login/Signup';
import Image from "next/image";

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
  const router = useRouter();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [loginFormData, setLoginFormData] = useState({
    email: '',
    password: ''
  });
  const [user, setUser] = useState(null);

  // Check if user is logged in on mount
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleClick = (href, name) => {
    if (name === "Search") {
      setIsSearchOpen(true);
      return;
    }
    if (name === "Profile") {
      const token = localStorage.getItem('token');
      if (!token) {
        setShowLogin(true);
        return;
      }
      router.push('/profile');
    }
  };

  const handleSignup = () => {
    setShowLogin(false);
    setShowSignup(true);
  };

  const handleLoginClick = () => {
    setShowSignup(false);
    setShowLogin(true);
  };

  const handleLoginSuccess = () => {
    setShowLogin(false);
    window.location.reload();
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
              
              if (name === "Profile" && user) {
                return (
                  <Link
                    key={name}
                    href={href}
                    className={`
                      relative flex flex-col items-center justify-center
                      ${isActive ? 'w-[120px] px-2' : 'w-[48px]'}
                      h-[44px] rounded-full transition-all duration-300
                      ${isActive ? 'bg-primary-50 text-primary-500' : 'hover:bg-gray-50 text-gray-500'}
                      focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/20
                    `}
                  >
                    <div className="flex items-center justify-center">
                      <div className="relative">
                        <div className="w-6 h-6 rounded-full bg-primary-50 flex items-center justify-center overflow-hidden">
                          {user.avatar ? (
                            <Image
                              src={user.avatar}
                              alt={user.name}
                              width={24}
                              height={24}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <i className={`${icon} text-sm`} />
                          )}
                        </div>
                        <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-green-500 border-2 border-white rounded-full"></div>
                      </div>
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
              }

              return (
                <Link
                  key={name}
                  href={href}
                  onClick={(e) => {
                    if (name === "Search" || name === "Profile") {
                      e.preventDefault();
                      handleClick(href, name);
                    }
                  }}
                  className={`
                    relative flex flex-col items-center justify-center
                    ${isActive ? 'w-[120px] px-2' : 'w-[48px]'}
                    h-[44px] rounded-full transition-all duration-300
                    ${isActive ? 'bg-primary-50 text-primary-500' : 'hover:bg-gray-50 text-gray-500'}
                    focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/20
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

      <Login
        show={showLogin}
        onClose={() => setShowLogin(false)}
        onSignupClick={handleSignup}
        loginFormData={loginFormData}
        setloginFormData={setLoginFormData}
        onLoginSuccess={handleLoginSuccess}
      />

      <Signup
        show={showSignup}
        onClose={() => setShowSignup(false)}
        onLoginClick={handleLoginClick}
        setloginFormData={setLoginFormData}
      />
    </>
  );
}
