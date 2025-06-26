import { Fragment, useEffect, useRef, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { useSpring, animated, config } from "@react-spring/web";
import { useDrag } from "@use-gesture/react";

// PopupHeader component
const PopupHeader = ({ title, onClose, showCloseButton, dragHandleProps = {}, isMobile, draggable }) => {
  if (!title && !showCloseButton) return null;
  
  return (
    <div className="sticky top-0 bg-white border-b border-gray-100 z-10">
      {/* Drag Handle for Mobile */}
      {isMobile && draggable && (
        <div 
          {...dragHandleProps}
          className="w-full flex justify-center items-center py-4 touch-none cursor-grab active:cursor-grabbing group"
        >
          <div className="w-12 h-1 rounded-full bg-gray-300 transition-colors duration-200 group-hover:bg-primary-400" />
        </div>
      )}
      <div className="flex items-center justify-between px-6 pb-4">
        {title && (
          <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
            {title}
          </Dialog.Title>
        )}
       
        {showCloseButton && (!isMobile || !draggable) && (
          
          <button
            onClick={onClose}
            className="text-gray-900 hover:text-gray-500 w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center"
            aria-label="Close"
          >
            <i className="fi fi-rr-cross-small text-lg"></i>
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

// Main Popup component
export default function Popup({
  isOpen,
  onClose,
  title,
  children,
  showCloseButton = true,
  pos = "center",
  height = "auto",
  overlayClassName = "bg-black/25",
  className = "",
  preventScroll = true,
  pannelStyle = "",
  draggable = false,
}) {
  const [isMobile, setIsMobile] = useState(false);

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

  // Overlay animation
  const overlayAnimation = useSpring({
    opacity: isOpen ? 1 : 0,
    config: { ...config.gentle, tension: 280, friction: 20 }
  });

  // Panel animation
  const panelAnimation = useSpring({
    transform: isOpen 
      ? 'translate3d(0px, 0px, 0px)' 
      : effectivePosition === 'bottom'
        ? 'translate3d(0px, 100%, 0px)'
        : effectivePosition === 'center'
          ? 'translate3d(0px, 20px, 0px)'
          : effectivePosition === 'right'
            ? 'translate3d(100%, 0px, 0px)'
            : 'translate3d(-100%, 0px, 0px)',
    opacity: isOpen ? 1 : 0,
    config: {
      ...config.gentle,
      tension: 280,
      friction: 24,
      clamp: true
    }
  });

  // Drag gesture spring
  const [{ y, opacity }, api] = useSpring(() => ({ y: 0, opacity: 1 }));

  // Set up drag gesture
  const bindDrag = useDrag(
    ({ down, movement: [, my], velocity: [, vy], direction: [, dy] }) => {
      if (!isMobile || !draggable) return;

      const dragY = Math.max(0, my);
      const currentOpacity = Math.max(0.2, 1 - (dragY / (window.innerHeight * 0.4)));
      
      if (!down) {
        if (dragY > window.innerHeight * 0.2 || (vy > 0.5 && dy > 0)) {
          api.start({ 
            y: window.innerHeight,
            opacity: 0,
            immediate: false,
            config: { ...config.gentle, velocity: vy * dy }
          });
          onClose();
        } else {
          api.start({ 
            y: 0,
            opacity: 1,
            immediate: false,
            config: config.gentle
          });
        }
      } else {
        api.start({ 
          y: dragY,
          opacity: currentOpacity,
          immediate: true
        });
      }
    },
    {
      from: () => [0, y.get()],
      filterTaps: true,
      bounds: { top: 0 },
      rubberband: true,
      enabled: isMobile && draggable
    }
  );

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
      <animated.div 
        style={overlayAnimation}
        className={`fixed inset-0 ${overlayClassName}`}
      />

      <div className="fixed inset-0 overflow-y-auto">
        <div className={`flex min-h-full ${effectivePosition === 'right' || effectivePosition === 'left' ? 'h-full' : ''} ${positionClasses.container}`}>
          <animated.div
            style={{
              ...panelAnimation,
              transform: (isMobile && draggable) 
                ? y.to(value => `translate3d(0px, ${value}px, 0px)`)
                : panelAnimation.transform,
              opacity: (isMobile && draggable) ? opacity : panelAnimation.opacity
            }}
            className={`
              ${positionClasses.panel}
              ${pannelStyle}
              bg-white text-left align-middle shadow-xl
              flex flex-col
              ${className}
            `}
          >
            <PopupHeader 
              title={title} 
              onClose={onClose} 
              showCloseButton={showCloseButton}
              dragHandleProps={(isMobile && draggable) ? bindDrag() : {}}
              isMobile={isMobile}
              draggable={draggable}
            />
            {children}
          </animated.div>
        </div>
      </div>
    </Dialog>
  );
}

// Export sub-components
Popup.Header = PopupHeader;
Popup.Content = PopupContent;
Popup.Footer = PopupFooter;
