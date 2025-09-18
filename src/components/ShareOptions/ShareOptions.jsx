import { useState, useEffect } from 'react';
import Toast from '../Toast/Toast';
import { motion, AnimatePresence } from 'framer-motion';

const menuVariants = {
  hidden: {
    opacity: 0,
    y: 10,
    scale: 0.95
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.25,
      ease: [0.215, 0.61, 0.355, 1],
      staggerChildren: 0.08,
      delayChildren: 0.3
    }
  },
  exit: {
    opacity: 0,
    y: 5,
    scale: 0.95,
    transition: {
      duration: 0.15,
      ease: 'easeIn'
    }
  }
};

const buttonVariants = {
  hidden: {
    opacity: 1,
    y: 0
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1
    }
  },
  hover: {
    scale: 1.05,
    transition: {
      duration: 0.2,
      ease: 'easeInOut'
    }
  },
  tap: {
    scale: 0.95
  }
};

const iconVariants = {
  hidden: {
    opacity: 0,
    y: 15,
    scale: 0.8
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: [0.215, 0.61, 0.355, 1]
    }
  }
};

const textVariants = {
  hidden: {
    opacity: 0,
    y: 8
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.2,
      ease: [0.215, 0.61, 0.355, 1]
    }
  }
};

export default function ShareOptions({ url, title }) {
  const [showMenu, setShowMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ horizontal: 'right-0' });
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [currentUrl, setCurrentUrl] = useState(url);

  // Update currentUrl when url prop changes
  useEffect(() => {
    setCurrentUrl(url);
    // Close menu when URL changes
    setShowMenu(false);
  }, [url]);

  useEffect(() => {
    if (showMenu) {
      const handlePosition = () => {
        const button = document.activeElement;
        if (button) {
          const rect = button.getBoundingClientRect();
          const spaceOnRight = window.innerWidth - rect.right;
          const spaceOnLeft = rect.left;
          const menuWidth = 260;
          const isMobile = window.innerWidth <= 640;

          let horizontal;
          if (isMobile) {
            // On mobile, position relative to screen edges
            const screenPadding = 16; // 1rem
            if (window.innerWidth <= menuWidth + (screenPadding * 2)) {
              // If screen is too narrow, center it
              horizontal = 'left-1/2 -translate-x-1/2';
            } else {
              // Position near the button but ensure it stays within screen bounds
              const idealLeftPosition = Math.max(
                screenPadding,
                Math.min(
                  rect.left - (menuWidth / 2) + (rect.width / 2),
                  window.innerWidth - menuWidth - screenPadding
                )
              );
              horizontal = `left-[${idealLeftPosition}px]`;
            }
          } else {
            // Desktop behavior
            if (spaceOnRight < menuWidth) {
              horizontal = 'right-0';
            } else {
              horizontal = 'left-0';
            }
          }

          setMenuPosition({ horizontal });
        }
      };

      handlePosition();
      window.addEventListener('resize', handlePosition);
      return () => window.removeEventListener('resize', handlePosition);
    }
  }, [showMenu]);

  const showToastMessage = (message) => {
    setToastMessage(message);
    setShowToast(true);
  };

  const handleShare = async (platform) => {
    const shareUrl = currentUrl; // Use the current URL
    switch (platform) {
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(`${title}\n${shareUrl}`)}`, '_blank');
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
        break;
      case 'instagram':
        try {
          await navigator.clipboard.writeText(shareUrl);
          showToastMessage('Link copied! You can now paste it in your Instagram story or post');
          window.open('https://instagram.com', '_blank');
        } catch (err) {
          showToastMessage('Please copy the link manually and share it on Instagram');
        }
        break;
      case 'copy':
        try {
          await navigator.clipboard.writeText(shareUrl);
          showToastMessage('Link copied to clipboard!');
        } catch (err) {
          showToastMessage('Failed to copy link. Please try again.');
        }
        break;
      default:
        if (navigator.share) {
          try {
            await navigator.share({
              title: title,
              url: shareUrl
            });
          } catch (err) {
            console.error('Share failed:', err);
          }
        }
    }
    setShowMenu(false);
  };

  return (
    <div className="relative inline-block">
      {/* Desktop button */}
      <motion.button
        onClick={() => setShowMenu(!showMenu)}
        className="hidden lg:flex items-center gap-2 px-4 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-full transition-all duration-200 group h-9"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <i className="fi fi-rr-share text-gray-700 group-hover:text-gray-900 transition-colors"></i>
        <span>Share</span>
      </motion.button>

      {/* Mobile button */}
      <motion.button
        onClick={() => setShowMenu(!showMenu)}
        className="lg:hidden flex items-center justify-center w-9 h-9 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-full transition-all duration-200"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <i className="fi fi-rr-share text-gray-700"></i>
      </motion.button>

      <AnimatePresence>
        {showMenu && (
          <>
            {/* Mobile overlay */}
            <motion.div
              className="lg:hidden fixed inset-0 bg-black/20 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMenu(false)}
            />

            {/* Share menu */}
            <motion.div
              className={`fixed w-[260px] bg-white rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.15)] z-50 p-2
                lg:absolute lg:mt-2
                ${menuPosition.horizontal}
                top-[52px] sm:top-[60px]
                mx-auto left-0 right-0 lg:mx-0 lg:left-auto lg:right-auto
              `}
              style={{
                maxWidth: 'min(calc(100vw - 2rem), 260px)',
                transformOrigin: 'top center'
              }}
              variants={menuVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <motion.div className="grid grid-cols-2 gap-2">
                <motion.button
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  onClick={() => handleShare('whatsapp')}
                  className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-gray-50 transition-all duration-300"
                >
                  <motion.div
                    variants={iconVariants}
                    className="w-8 h-8 flex items-center justify-center bg-[#25D366]/10 rounded-full"
                  >
                    <i className="fi fi-brands-whatsapp text-lg text-[#25D366]"></i>
                  </motion.div>
                  <motion.span
                    variants={textVariants}
                    className="text-[10px] font-medium text-gray-700"
                  >
                    WhatsApp
                  </motion.span>
                </motion.button>

                <motion.button
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  onClick={() => handleShare('facebook')}
                  className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-gray-50 transition-all duration-300"
                >
                  <motion.div
                    variants={iconVariants}
                    className="w-8 h-8 flex items-center justify-center bg-[#1877F2]/10 rounded-full"
                  >
                    <i className="fi fi-brands-facebook text-lg text-[#1877F2]"></i>
                  </motion.div>
                  <motion.span
                    variants={textVariants}
                    className="text-[10px] font-medium text-gray-700"
                  >
                    Facebook
                  </motion.span>
                </motion.button>

                <motion.button
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  onClick={() => handleShare('instagram')}
                  className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-gray-50 transition-all duration-300"
                >
                  <motion.div
                    variants={iconVariants}
                    className="w-8 h-8 flex items-center justify-center bg-[#E4405F]/10 rounded-full"
                  >
                    <i className="fi fi-brands-instagram text-lg text-[#E4405F]"></i>
                  </motion.div>
                  <motion.span
                    variants={textVariants}
                    className="text-[10px] font-medium text-gray-700"
                  >
                    Instagram
                  </motion.span>
                </motion.button>

                <motion.button
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  onClick={() => handleShare('copy')}
                  className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-gray-50 transition-all duration-300"
                >
                  <motion.div
                    variants={iconVariants}
                    className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full"
                  >
                    <i className="fi fi-rr-copy text-lg text-gray-600"></i>
                  </motion.div>
                  <motion.span
                    variants={textVariants}
                    className="text-[10px] font-medium text-gray-700"
                  >
                    Copy Link
                  </motion.span>
                </motion.button>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showToast && (
          <Toast
            message={toastMessage}
            onClose={() => setShowToast(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
} 