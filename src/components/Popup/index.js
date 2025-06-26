"use client";

import { Dialog } from "@headlessui/react";
import { useEffect, useState } from "react";
import { motion, AnimatePresence, useDragControls } from "framer-motion";

// PopupHeader component
const PopupHeader = ({ title, onClose, showCloseButton, isMobile, draggable, dragControls }) => {
  if (!title && !showCloseButton) return null;
  
  const startDragging = (event) => {
    dragControls.start(event);
  };
  
  return (
    <div className="sticky top-0 bg-white border-b border-gray-100 z-10">
      {/* Drag Handle for Mobile */}
      {isMobile && draggable && (
        <div 
          className="w-full flex justify-center items-center py-4 touch-none cursor-grab active:cursor-grabbing group"
          onPointerDown={startDragging}
        >
          <div className="w-12 h-1 rounded-full bg-gray-300 transition-colors duration-200 group-hover:bg-primary-400" />
        </div>
      )}
      <div className="flex items-center justify-between px-6 pb-4">
        {title && (
          <div className="flex-1">
            {typeof title === "string" ? (
              <h3 className="text-lg font-medium text-gray-800">{title}</h3>
            ) : (
              title
            )}
          </div>
        )}
        {showCloseButton && (!isMobile || !draggable) && (
          <button
            type="button"
            className="rounded-full p-2 hover:bg-gray-100 transition-colors duration-200"
            onClick={onClose}
          >
            <i className="fi fi-rr-cross text-lg text-gray-500"></i>
          </button>
        )}
      </div>
    </div>
  );
};

// PopupContent component
const PopupContent = ({ children, className = "" }) => (
  <div className={`flex-1 overflow-y-auto ${className}`}>
    <div className="p-6">
      {children}
    </div>
  </div>
);

// PopupFooter component
const PopupFooter = ({ children, className = "" }) => {
  if (!children) return null;
  
  return (
    <div className={`sticky bottom-0 bg-white py-4 border-t border-gray-100 mt-auto ${className}`}>
      {children}
    </div>
  );
};

const overlayVariants = {
  hidden: { 
    opacity: 0
  },
  visible: { 
    opacity: 1,
    transition: {
      duration: 0.2
    }
  }
};

const panelVariants = {
  hidden: (pos) => {
    switch(pos) {
      case "bottom":
        return { y: "100%" };
      case "right":
        return { x: "100%" };
      case "left":
        return { x: "-100%" };
      default:
        return { y: 20, opacity: 0 };
    }
  },
  visible: {
    x: 0,
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.25,
      ease: [0.16, 1, 0.3, 1]
    }
  },
  exit: (pos) => {
    switch(pos) {
      case "bottom":
        return { y: "100%" };
      case "right":
        return { x: "100%" };
      case "left":
        return { x: "-100%" };
      default:
        return { y: 20, opacity: 0 };
    }
  }
};

// Main Popup component
export default function Popup({
  isOpen,
  onClose,
  title,
  children,
  showCloseButton = true,
  pos = "center",
  height = "auto",
  overlayClassName = "bg-black/20 backdrop-blur-xs",
  className = "",
  preventScroll = true,
  pannelStyle = "",
  draggable = false,
}) {
  const [isMobile, setIsMobile] = useState(false);
  const dragControls = useDragControls();

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Get effective position based on mobile state
  const effectivePosition = isMobile && (pos === 'right' || pos === 'left') ? 'bottom' : pos;

  // Get position classes based on current position and mobile state
  const getPositionClasses = () => {
    const baseClasses = {
      container: '',
      panel: ''
    };

    // Mobile overrides for right/left positions
    if (isMobile && (pos === 'right' || pos === 'left')) {
      return {
        container: 'items-end justify-center',
        panel: 'w-full rounded-t-[32px] max-h-[85vh] overflow-hidden'
      };
    }

    switch (effectivePosition) {
      case 'center':
        return {
          container: 'items-center justify-center p-4',
          panel: isMobile ? 'w-full rounded-[32px] max-w-lg transform overflow-hidden' : 'w-full max-w-lg transform overflow-hidden'
        };
      case 'bottom':
        return {
          container: 'items-end justify-center',
          panel: isMobile ? 'w-full rounded-t-[32px] max-h-[80vh] overflow-hidden' : 'w-full max-h-[90vh] overflow-hidden'
        };
      case 'right':
        return {
          container: 'items-stretch justify-end min-h-screen h-full',
          panel: isMobile ? 'h-[80vh] w-full rounded-tl-[32px] max-w-lg overflow-hidden' : 'min-h-screen h-full w-full max-w-lg overflow-hidden'
        };
      case 'left':
        return {
          container: 'items-stretch justify-start min-h-screen h-full',
          panel: isMobile ? 'h-[80vh] w-full rounded-tr-[32px] max-w-lg overflow-hidden' : 'min-h-screen h-full w-full max-w-lg overflow-hidden'
        };
      default:
        return baseClasses;
    }
  };

  // Get current position classes
  const positionClasses = getPositionClasses();

  // Handle body scroll locking
  useEffect(() => {
    if (!preventScroll) return;

    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, preventScroll]);

  if (!isOpen) return null;

  return (
    <Dialog 
      as="div" 
      className="relative z-50" 
      onClose={onClose} 
      open={isOpen}
    >
      <AnimatePresence mode="wait">
        {isOpen && (
          <>
            <motion.div 
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={overlayVariants}
              className={`fixed inset-0 backdrop-blur-sm ${overlayClassName}`}
            />

            <div className="fixed inset-0 overflow-y-auto">
              <div className={`flex min-h-full ${effectivePosition === 'right' || effectivePosition === 'left' ? 'h-full' : ''} ${positionClasses.container}`}>
                <motion.div
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  variants={panelVariants}
                  custom={effectivePosition}
                  drag={draggable && isMobile ? "y" : false}
                  dragControls={dragControls}
                  dragListener={false}
                  dragConstraints={{ top: 0 }}
                  dragElastic={0.4}
                  dragTransition={{ bounceStiffness: 300, bounceDamping: 20 }}
                  onDragEnd={(e, { offset, velocity }) => {
                    const swipeThreshold = 100;
                    if (offset.y > swipeThreshold || velocity.y > 50) {
                      onClose();
                    }
                  }}
                  style={{
                    willChange: "transform",
                    translateZ: 0,
                  }}
                  className={`
                    ${positionClasses.panel}
                    ${pannelStyle}
                    bg-white text-left align-middle shadow-xl
                    flex flex-col transform-gpu
                    ${className}
                  `}
                >
                  <PopupHeader 
                    title={title} 
                    onClose={onClose} 
                    showCloseButton={showCloseButton}
                    isMobile={isMobile}
                    draggable={draggable}
                    dragControls={dragControls}
                  />
                  <div className="flex-1 overflow-y-auto overscroll-contain">
                    {children}
                  </div>
                </motion.div>
              </div>
            </div>
          </>
        )}
      </AnimatePresence>
    </Dialog>
  );
}

// Export sub-components
Popup.Header = PopupHeader;
Popup.Content = PopupContent;
Popup.Footer = PopupFooter;
