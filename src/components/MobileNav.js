"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import Search from "./Search/Search";
import Login from "./Login/Login";
import Signup from "./Login/Signup";
import Image from "next/image";
import UserMenu from "./UserMenu/UserMenu";

const exploreModules = [
  {
    name: "Packages",
    href: "/explore",
    icon: "fi fi-rr-umbrella-beach",
    iconBg: "bg-primary-50",
    iconColor: "text-primary-600",
    matchPath: (path) =>
      path === "/explore" ||
      path.startsWith("/packages") ||
      path.startsWith("/package"),
  },
  {
    name: "Scheduled",
    href: "/scheduled",
    icon: "fi fi-rr-calendar",
    iconBg: "bg-sky-50",
    iconColor: "text-sky-600",
    matchPath: (path) => path.startsWith("/scheduled"),
  },
  {
    name: "Activities",
    href: "/activities",
    icon: "fi fi-rr-hiking",
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
    matchPath: (path) =>
      path.startsWith("/activities") || path.startsWith("/activity"),
  },
  {
    name: "Events",
    href: "/events",
    icon: "fi fi-rr-glass-cheers",
    iconBg: "bg-rose-50",
    iconColor: "text-rose-600",
    matchPath: (path) => path.startsWith("/events"),
  },
  {
    name: "Attractions",
    href: "/attractions",
    icon: "fi fi-rr-ferris-wheel",
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
    matchPath: (path) =>
      path.startsWith("/attractions") || path.startsWith("/attraction"),
  },
  {
    name: "Rentals",
    href: "/rentals",
    icon: "fi fi-rr-car-side",
    iconBg: "bg-indigo-50",
    iconColor: "text-indigo-600",
    matchPath: (path) => path.startsWith("/rentals"),
  },
];

function isExploreActive(pathname) {
  return exploreModules.some((module) => module.matchPath(pathname));
}

const primaryNavItems = [
  {
    id: "home",
    name: "Home",
    href: "/home",
    icon: "fi fi-rr-home",
    matchPath: (path) => path === "/" || path === "/home",
  },
  {
    id: "explore",
    name: "Explore",
    icon: "fi fi-rr-compass-alt",
    matchPath: isExploreActive,
    action: "explore",
  },
  {
    id: "search",
    name: "Search",
    icon: "fi fi-rr-search",
    matchPath: () => false,
    action: "search",
  },
  {
    id: "profile",
    name: "Profile",
    href: "/profile",
    icon: "fi fi-rr-user",
    matchPath: (path) => path.startsWith("/profile"),
    action: "profile",
  },
];

function ExploreSheet({ open, onClose, pathname }) {
  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.button
            type="button"
            aria-label="Close explore menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-black/40 lg:hidden"
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
            className="fixed bottom-0 left-0 right-0 z-[70] rounded-t-2xl bg-white shadow-[0_-8px_40px_rgba(0,0,0,0.12)] lg:hidden"
            style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
          >
            <div className="mx-auto max-w-lg px-4 pb-4 pt-3">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-medium leading-tight tracking-tight text-[#222222]">
                    Six ways to travel
                  </h2>
                  <p className="mt-1 text-sm text-[#717171]">
                    What do you want to book?
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F7F7F7] text-[#717171]"
                  aria-label="Close"
                >
                  <i className="fi fi-rr-cross text-xs" />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                {exploreModules.map((module) => {
                  const isActive = module.matchPath(pathname);
                  return (
                    <Link
                      key={module.name}
                      href={module.href}
                      onClick={onClose}
                      className={`flex flex-col items-center gap-2 rounded-xl border p-3 text-center transition-colors ${
                        isActive
                          ? "border-primary-200 bg-primary-50"
                          : "border-[#EBEBEB] bg-[#FAFAFA] hover:bg-white"
                      }`}
                    >
                      <span
                        className={`flex h-10 w-10 items-center justify-center rounded-xl ${module.iconBg}`}
                      >
                        <i className={`${module.icon} text-base ${module.iconColor}`} />
                      </span>
                      <span className="text-[11px] font-medium leading-tight text-[#222222]">
                        {module.name}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}

export default function MobileNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showExplore, setShowExplore] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [loginFormData, setLoginFormData] = useState({
    email: "",
    password: "",
  });
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  useEffect(() => {
    setShowExplore(false);
  }, [pathname]);

  const handlePrimaryClick = (item) => {
    if (item.action === "search") {
      setShowExplore(false);
      setIsSearchOpen(true);
      return;
    }

    if (item.action === "explore") {
      setShowExplore((open) => !open);
      return;
    }

    if (item.action === "profile") {
      setShowExplore(false);
      const token = localStorage.getItem("token");
      if (!token) {
        setShowLogin(true);
        return;
      }
      if (user) {
        setShowUserMenu(true);
      } else {
        router.push("/profile");
      }
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

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    window.location.reload();
  };

  return (
    <>
      <ExploreSheet
        open={showExplore}
        onClose={() => setShowExplore(false)}
        pathname={pathname}
      />

      <div className="pointer-events-none fixed bottom-0 left-0 right-0 z-50 lg:hidden">
        <motion.nav
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="pointer-events-auto w-full border-t border-gray-100 bg-white pb-[env(safe-area-inset-bottom)]"
        >
          <div className="flex items-stretch justify-around px-1 py-1.5">
            {primaryNavItems.map((item) => {
              const isActive =
                item.id === "explore"
                  ? showExplore || item.matchPath(pathname)
                  : item.matchPath(pathname);
              const itemClassName = `
                relative flex flex-1 flex-col items-center justify-center gap-0.5
                min-h-[52px] rounded-xl px-1 py-1.5 transition-all duration-200
                ${isActive ? "bg-primary-50 text-primary-600" : "text-gray-500"}
                focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/20
              `;

              if (item.id === "profile" && user) {
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handlePrimaryClick(item)}
                    className={itemClassName}
                  >
                    <div className="relative">
                      <div className="flex h-6 w-6 items-center justify-center overflow-hidden rounded-full bg-primary-50">
                        {user.avatar ? (
                          <Image
                            src={user.avatar}
                            alt={user.name}
                            width={24}
                            height={24}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <i className={`${item.icon} text-sm`} />
                        )}
                      </div>
                      <div className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border-2 border-white bg-green-500" />
                    </div>
                    <span className="text-[10px] font-medium leading-none">
                      {item.name}
                    </span>
                  </button>
                );
              }

              if (item.action) {
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handlePrimaryClick(item)}
                    className={itemClassName}
                  >
                    <i className={`${item.icon} text-lg`} />
                    <span className="text-[10px] font-medium leading-none">
                      {item.name}
                    </span>
                  </button>
                );
              }

              return (
                <Link key={item.id} href={item.href} className={itemClassName}>
                  <i className={`${item.icon} text-lg`} />
                  <span className="text-[10px] font-medium leading-none">
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </div>
        </motion.nav>
      </div>

      <Search isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

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

      <AnimatePresence>
        {showUserMenu && user ? (
          <UserMenu
            user={user}
            onClose={() => setShowUserMenu(false)}
            handleLogout={handleLogout}
            isMobileNav={true}
          />
        ) : null}
      </AnimatePresence>
    </>
  );
}
