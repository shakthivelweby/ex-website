import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

const menuVariants = {
  initial: (isMobileNav) => ({
    opacity: 0,
    y: isMobileNav ? 20 : -5,
  }),
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.2,
      ease: "easeOut",
      staggerChildren: 0.05,
    },
  },
  exit: (isMobileNav) => ({
    opacity: 0,
    y: isMobileNav ? 20 : -5,
    transition: {
      duration: 0.2,
      ease: "easeIn",
    },
  }),
};

const itemVariants = {
  initial: { opacity: 0, x: -5 },
  animate: {
    opacity: 1,
    x: 0,
  },
};

const overlayVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export default function UserMenu({
  user,
  onClose,
  handleLogout,
  isMobileNav = false,
  menuRef = null,
}) {
  const menuClassName = isMobileNav
    ? "fixed left-0 right-0 bottom-[60px] w-full bg-white border-t border-gray-100 py-2 z-50 rounded-t-2xl shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]"
    : "fixed lg:absolute right-0 lg:right-0 top-[60px] lg:top-full lg:mt-2 w-full lg:w-64 bg-white lg:rounded-xl shadow-lg border border-gray-100 py-2 z-50";

  const overlayClassName = isMobileNav
    ? "fixed inset-0 bottom-[60px] bg-black/20 z-40"
    : "lg:hidden fixed inset-x-0 top-[60px] bottom-0 bg-black/20 z-40";

  return (
    <>
      {/* Overlay - only show on mobile or non-desktop view */}
      {(isMobileNav || window.innerWidth < 1024) && (
        <motion.div
          key="overlay"
          className={overlayClassName}
          variants={overlayVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          onClick={onClose}
        />
      )}

      <motion.div
        key="menu"
        className={menuClassName}
        custom={isMobileNav}
        variants={menuVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        <motion.div
          variants={itemVariants}
          className="px-4 py-3 border-b border-gray-100"
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center overflow-hidden">
                {user.avatar ? (
                  <Image
                    src={user.avatar}
                    alt={user.name}
                    width={40}
                    height={40}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <i className="fi fi-rr-user text-primary-600 text-lg"></i>
                )}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">{user.name}</p>
              <p className="text-xs text-gray-500 mt-0.5">{user.email}</p>
            </div>
          </div>
        </motion.div>

        <div className="py-1">
          <motion.div variants={itemVariants}>
            <Link
              href="/profile"
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary-600 transition-colors group"
              onClick={onClose}
            >
              <i className="fi fi-rr-user text-gray-400 group-hover:text-primary-600 transition-colors"></i>
              <div>
                <span className="font-medium">Profile</span>
                <p className="text-xs text-gray-500 mt-0.5">
                  Manage your account settings
                </p>
              </div>
            </Link>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Link
              href="/my-bookings"
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary-600 transition-colors group"
              onClick={onClose}
            >
              <i className="fi fi-rr-ticket text-gray-400 group-hover:text-primary-600 transition-colors"></i>
              <div>
                <span className="font-medium">My Bookings</span>
                <p className="text-xs text-gray-500 mt-0.5">
                  View your trip history
                </p>
              </div>
            </Link>
          </motion.div>
        </div>

        <motion.div
          variants={itemVariants}
          className="border-t border-gray-100 mt-1 pt-1"
        >
          <button
            onClick={() => {
              handleLogout();
              onClose();
            }}
            className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 w-full text-left transition-colors group"
          >
            <i className="fi fi-rr-sign-out text-red-400 group-hover:text-red-600 transition-colors"></i>
            <div>
              <span className="font-medium">Logout</span>
              <p className="text-xs text-red-400 mt-0.5">
                Sign out of your account
              </p>
            </div>
          </button>
        </motion.div>
      </motion.div>
    </>
  );
}
