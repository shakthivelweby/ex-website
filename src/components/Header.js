"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import Button from "./common/Button";
import { usePathname } from 'next/navigation';
import Search from './Search/Search';
import Login from "./Login/Login";
import Signup from "./Login/Signup";
import ShareOptions from "./ShareOptions/ShareOptions";
import { motion, AnimatePresence } from "framer-motion";
import UserMenu from './UserMenu/UserMenu';

export default function Header() {
  const pathname = usePathname();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [loginFormData, setLoginFormData] = useState({
    email: '',
    password: ''
  });
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const menuRef = useRef(null);
  const [currentUrl, setCurrentUrl] = useState('');

  // Check if current page is a package detail page
  const isPackageDetailPage = pathname.startsWith('/package/');

  useEffect(() => {
    const syncUser = () => {
      const nextToken = localStorage.getItem("token");
      const nextUser = localStorage.getItem("user");
      if (nextToken && nextUser) {
        setUser(JSON.parse(nextUser));
      } else {
        if (nextUser && !nextToken) {
          localStorage.removeItem("user");
        }
        setUser(null);
      }
    };

    syncUser();

    window.addEventListener("auth:logout", syncUser);
    window.addEventListener("auth:login", syncUser);
    window.addEventListener("storage", syncUser);

    return () => {
      window.removeEventListener("auth:logout", syncUser);
      window.removeEventListener("auth:login", syncUser);
      window.removeEventListener("storage", syncUser);
    };
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    // Update URL whenever pathname changes
    if (typeof window !== 'undefined') {
      setCurrentUrl(window.location.href);
    }
  }, [pathname]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearch(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      setShowLogin(true);
      setIsLoading(false);
    }, 300);
  };

  const handleSignup = () => {
    setShowLogin(false);
    setShowSignup(true);
  };

  const handleLoginClick = () => {
    setShowSignup(false);
    setShowLogin(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    window.location.reload();
  };

  return (
    <>
      <header className="w-full bg-white shadow-sm  z-50 fixed top-0 left-0 right-0">
        <div className="container mx-auto flex items-center justify-between py-2 px-3">
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

          <div className="flex items-center gap-3 ml-auto">
            {/* Share Button - Only show on package detail pages */}
            {isPackageDetailPage && (
              <div className="hidden lg:block">
                <ShareOptions url={currentUrl} title="Check out this amazing package!" />
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
                <ShareOptions url={currentUrl} title="Check out this amazing package!" />
              </div>
            )}

            {/* Search Button - Mobile */}
            <button
              onClick={() => setShowSearch(true)}
              className="lg:hidden flex items-center justify-center w-9 h-9 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-full transition-all duration-200"
            >
              <i className="fi fi-rr-search text-gray-700"></i>
            </button>

            {/* Sign In Button */}
            {!user && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogin}
                icon={<i className="fi fi-rr-user"></i>}
                isLoading={isLoading}
              >
                Sign in
              </Button>
            )}

            {/* User Menu */}
            <div className="relative" ref={menuRef}>
              {user && (
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
                      <motion.i
                        animate={{ rotate: showUserMenu ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                        className={`fi fi-rr-angle-small-down text-gray-400`}
                      />
                    </div>
                  </div>
                </button>
              )}

              <AnimatePresence mode="wait">
                {showUserMenu && user && (
                  <UserMenu
                    user={user}
                    onClose={() => setShowUserMenu(false)}
                    handleLogout={handleLogout}
                    isMobileNav={false}
                    menuRef={menuRef}
                  />
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Search Popup */}
        <Search
          isOpen={showSearch}
          onClose={() => setShowSearch(false)}
        />

        {/* Login Popup */}
        <Login
          show={showLogin}
          onClose={() => setShowLogin(false)}
          onSignupClick={handleSignup}
          loginFormData={loginFormData}
          setloginFormData={setLoginFormData}
          onLoginSuccess={() => {
            setShowLogin(false);
            window.location.reload();
          }}
        />

        {/* Signup Popup */}
        <Signup
          show={showSignup}
          onClose={() => setShowSignup(false)}
          onLoginClick={handleLoginClick}
          setloginFormData={setLoginFormData}
        />

      </header>
    </>
  );
}
