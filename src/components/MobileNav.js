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
    description: "Curated trips",
    iconBg: "bg-primary-50",
    iconColor: "text-primary-600",
    activeCard: "border-primary-200 bg-primary-50",
    matchPath: (path) =>
      path === "/explore" ||
      path.startsWith("/packages") ||
      path.startsWith("/package"),
  },
  {
    name: "Scheduled",
    href: "/scheduled",
    icon: "fi fi-rr-calendar",
    description: "Fixed departures",
    iconBg: "bg-sky-50",
    iconColor: "text-sky-600",
    activeCard: "border-sky-200 bg-sky-50",
    matchPath: (path) => path.startsWith("/scheduled"),
  },
  {
    name: "Activities",
    href: "/activities",
    icon: "fi fi-rr-hiking",
    description: "Tours & experiences",
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
    activeCard: "border-emerald-200 bg-emerald-50",
    matchPath: (path) =>
      path.startsWith("/activities") || path.startsWith("/activity"),
  },
  {
    name: "Events",
    href: "/events",
    icon: "fi fi-rr-glass-cheers",
    description: "Tickets & shows",
    iconBg: "bg-rose-50",
    iconColor: "text-rose-600",
    activeCard: "border-rose-200 bg-rose-50",
    matchPath: (path) => path.startsWith("/events"),
  },
  {
    name: "Attractions",
    href: "/attractions",
    icon: "fi fi-rr-ferris-wheel",
    description: "Places to visit",
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
    activeCard: "border-amber-200 bg-amber-50",
    matchPath: (path) =>
      path.startsWith("/attractions") || path.startsWith("/attraction"),
  },
  {
    name: "Rentals",
    href: "/rentals",
    icon: "fi fi-rr-car-side",
    description: "Cars & gear",
    iconBg: "bg-indigo-50",
    iconColor: "text-indigo-600",
    activeCard: "border-indigo-200 bg-indigo-50",
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

function NavItem({ isActive, icon, label, children, ...props }) {
  return (
    <button
      type="button"
      className="group relative flex min-w-[4.5rem] flex-1 flex-col items-center justify-center gap-1 py-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/30 focus-visible:ring-offset-2"
      {...props}
    >
      {isActive ? (
        <motion.span
          layoutId="mobile-nav-indicator"
          className="absolute inset-x-3 top-0 h-0.5 rounded-full bg-primary-600"
          transition={{ type: "spring", stiffness: 500, damping: 35 }}
        />
      ) : null}
      <span
        className={`fi-box h-7 w-7 text-[17px] transition-colors ${
          isActive ? "text-primary-600" : "text-[#717171] group-active:text-[#222222]"
        }`}
      >
        {children ?? <i className={icon} />}
      </span>
      <span
        className={`text-[10px] font-semibold leading-none tracking-wide transition-colors ${
          isActive ? "text-primary-600" : "text-[#717171] group-active:text-[#222222]"
        }`}
      >
        {label}
      </span>
    </button>
  );
}

function ExploreSheet({ open, onClose, pathname }) {
  useEffect(() => {
    if (!open) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

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
            className="fixed inset-0 z-[60] bg-[#222222]/50 backdrop-blur-[2px] lg:hidden"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Explore travel options"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 400, damping: 36 }}
            className="fixed bottom-0 left-0 right-0 z-[70] max-h-[min(85vh,560px)] overflow-hidden rounded-t-[1.75rem] bg-white shadow-[0_-12px_48px_rgba(0,0,0,0.14)] lg:hidden"
          >
            <div
              className="flex max-h-[min(85vh,560px)] flex-col"
              style={{ paddingBottom: "calc(4rem + env(safe-area-inset-bottom))" }}
            >
              <div className="shrink-0 px-5 pb-4 pt-3">
                <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-[#EBEBEB]" />
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-medium tracking-tight text-[#222222]">
                      Six ways to travel
                    </h2>
                    <p className="mt-0.5 text-sm text-[#717171]">
                      What do you want to book?
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#EBEBEB] text-[#717171] transition-colors hover:bg-[#F7F7F7] hover:text-[#222222]"
                    aria-label="Close"
                  >
                    <i className="fi fi-rr-cross text-xs" />
                  </button>
                </div>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <div className="grid grid-cols-2 gap-2.5">
                  {exploreModules.map((module) => {
                    const isActive = module.matchPath(pathname);
                    return (
                      <Link
                        key={module.name}
                        href={module.href}
                        onClick={onClose}
                        className={`flex items-center gap-3 rounded-2xl border px-3.5 py-3.5 transition-all active:scale-[0.98] ${
                          isActive
                            ? module.activeCard
                            : "border-[#EBEBEB] bg-white hover:border-[#DDDDDD] hover:bg-[#FAFAFA]"
                        }`}
                      >
                        <span
                          className={`fi-box h-10 w-10 shrink-0 rounded-xl text-base ${module.iconBg} ${module.iconColor}`}
                        >
                          <i className={module.icon} />
                        </span>
                        <span className="min-w-0 text-left">
                          <span className="block text-sm font-medium leading-tight text-[#222222]">
                            {module.name}
                          </span>
                          <span className="mt-0.5 block truncate text-[11px] text-[#717171]">
                            {module.description}
                          </span>
                        </span>
                      </Link>
                    );
                  })}
                </div>
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

  const renderNavItem = (item) => {
    const isActive =
      item.id === "explore"
        ? showExplore || item.matchPath(pathname)
        : item.matchPath(pathname);

    if (item.id === "profile" && user) {
      return (
        <NavItem
          key={item.id}
          isActive={isActive}
          label={item.name}
          onClick={() => handlePrimaryClick(item)}
        >
          <span className="relative flex h-7 w-7 items-center justify-center overflow-hidden rounded-full ring-2 ring-white">
            {user.avatar ? (
              <Image
                src={user.avatar}
                alt={user.name}
                width={28}
                height={28}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="flex h-full w-full items-center justify-center bg-primary-50 text-primary-600">
                <i className={`${item.icon} text-sm`} />
              </span>
            )}
            <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border-2 border-white bg-emerald-500" />
          </span>
        </NavItem>
      );
    }

    if (item.action) {
      return (
        <NavItem
          key={item.id}
          isActive={isActive}
          icon={item.icon}
          label={item.name}
          onClick={() => handlePrimaryClick(item)}
        />
      );
    }

    return (
      <Link
        key={item.id}
        href={item.href}
        className="group relative flex min-w-[4.5rem] flex-1 flex-col items-center justify-center gap-1 py-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/30 focus-visible:ring-offset-2"
      >
        {isActive ? (
          <motion.span
            layoutId="mobile-nav-indicator"
            className="absolute inset-x-3 top-0 h-0.5 rounded-full bg-primary-600"
            transition={{ type: "spring", stiffness: 500, damping: 35 }}
          />
        ) : null}
        <span
          className={`fi-box h-7 w-7 text-[17px] transition-colors ${
            isActive ? "text-primary-600" : "text-[#717171] group-active:text-[#222222]"
          }`}
        >
          <i className={item.icon} />
        </span>
        <span
          className={`text-[10px] font-semibold leading-none tracking-wide transition-colors ${
            isActive ? "text-primary-600" : "text-[#717171] group-active:text-[#222222]"
          }`}
        >
          {item.name}
        </span>
      </Link>
    );
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
          transition={{ type: "spring", stiffness: 300, damping: 28 }}
          aria-label="Mobile navigation"
          className="pointer-events-auto border-t border-[#EBEBEB] bg-white pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_24px_rgba(0,0,0,0.06)]"
        >
          <div className="flex h-16 items-stretch justify-around px-1">
            {primaryNavItems.map(renderNavItem)}
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
