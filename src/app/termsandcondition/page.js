"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import "@flaticon/flaticon-uicons/css/all/all.css";

export default function TermsAndConditions() {
  const scrollContainerRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  useEffect(() => {
    const handleTabClick = (e) => {
      if (e.target.closest('a[href^="#"]')) {
        e.preventDefault();
        const link = e.target.closest('a[href^="#"]');
        const targetId = link.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
          const offset = 80; // Adjust this value based on your header height
          const targetPosition = targetElement.getBoundingClientRect().top + window.scrollY - offset;
          
          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
          
          // Update active state of tabs
          const allTabs = document.querySelectorAll('.nav-tab');
          allTabs.forEach(tab => {
            if (tab.getAttribute('href') === targetId) {
              tab.classList.add('text-primary-600', 'bg-primary-50');
              tab.classList.remove('text-gray-600', 'hover:bg-gray-50');
            } else {
              tab.classList.remove('text-primary-600', 'bg-primary-50');
              tab.classList.add('text-gray-600', 'hover:bg-gray-50');
            }
          });
        }
      }
    };

    // Check scroll position of tabs container
    const checkScroll = () => {
      if (scrollContainerRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
        setShowLeftArrow(scrollLeft > 0);
        setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
      }
    };

    // Add scroll event listener to tabs container
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', checkScroll);
    }

    document.addEventListener('click', handleTabClick);

    // Initial check
    checkScroll();

    return () => {
      document.removeEventListener('click', handleTabClick);
      if (scrollContainer) {
        scrollContainer.removeEventListener('scroll', checkScroll);
      }
    };
  }, []);

  const scrollTabs = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = 200;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4 tracking-tighter">Terms and Conditions</h1>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 md:py-9 py-6">
        <div className="bg-white rounded-3xl shadow-sm">
          {/* Navigation Sidebar - Desktop */}
          <div className="lg:grid lg:grid-cols-[300px,1fr] divide-x divide-gray-100">
            <div className="p-6 border-b md:border-b-0 lg:block hidden">
              <nav className="space-y-2 sticky top-6">
                <a href="#payment-terms" className="nav-tab block px-4 py-2 text-primary-600 bg-primary-50 rounded-full font-medium tracking-tighter transition-all duration-200">Payment Terms</a>
                <a href="#cancellation" className="nav-tab block px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-full tracking-tighter transition-all duration-200">Cancellation & Refunds</a>
                <a href="#pricing" className="nav-tab block px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-full tracking-tighter transition-all duration-200">Pricing & Fees</a>
                <a href="#payment-methods" className="nav-tab block px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-full tracking-tighter transition-all duration-200">Payment Methods</a>
                <a href="#security" className="nav-tab block px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-full tracking-tighter transition-all duration-200">Payment Security</a>
                <a href="#disputes" className="nav-tab block px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-full tracking-tighter transition-all duration-200">Disputes & Resolutions</a>
              </nav>
            </div>

            {/* Mobile Navigation - Horizontal Scrolling Tabs */}
            <div className="lg:hidden relative">
              {/* Left Arrow */}
              {showLeftArrow && (
                <button 
                  onClick={() => scrollTabs('left')}
                  className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-white shadow-lg rounded-full border border-gray-100 p-2 !flex !items-center !justify-center"
                >
                  <i className="fi fi-rr-angle-small-left text-xl text-gray-600 flex items-center justify-center"></i>
                </button>
              )}

              {/* Right Arrow */}
              {showRightArrow && (
                <button 
                  onClick={() => scrollTabs('right')}
                  className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-white shadow-lg rounded-full border border-gray-100 p-2 !flex !items-center !justify-center"
                >
                  <i className="fi fi-rr-angle-small-right text-xl text-gray-600 flex items-center justify-center"></i>
                </button>
              )}

              {/* Scrollable Tabs */}
              <div className="relative overflow-hidden">
                <div 
                  ref={scrollContainerRef}
                  className="overflow-x-auto scrollbar-hide"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  <nav className="flex whitespace-nowrap p-4 gap-4">
                    <a href="#payment-terms" className="nav-tab px-4 py-2 text-primary-600 bg-primary-50 rounded-full font-medium tracking-tighter transition-all duration-200 flex-shrink-0">Payment Terms</a>
                    <a href="#cancellation" className="nav-tab px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-full tracking-tighter transition-all duration-200 flex-shrink-0">Cancellation</a>
                    <a href="#pricing" className="nav-tab px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-full tracking-tighter transition-all duration-200 flex-shrink-0">Pricing</a>
                    <a href="#payment-methods" className="nav-tab px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-full tracking-tighter transition-all duration-200 flex-shrink-0">Payment Methods</a>
                    <a href="#security" className="nav-tab px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-full tracking-tighter transition-all duration-200 flex-shrink-0">Security</a>
                    <a href="#disputes" className="nav-tab px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-full tracking-tighter transition-all duration-200 flex-shrink-0">Disputes</a>
                  </nav>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="md:p-8 p-4">
              {/* Payment Terms Section */}
              <section id="payment-terms" className="mb-12">
                <h2 className="md:text-2xl text-xl font-bold text-gray-800 mb-6 tracking-tighter">Payment Terms</h2>
                <div className="prose prose-gray max-w-none">
                  <p className="text-gray-600 mb-4">
                    By making a booking through our platform, you agree to the following payment terms:
                  </p>
                  <ul className="space-y-4 text-gray-600">
                    <li className="flex items-start gap-3">
                      <i className="fi fi-rr-check text-primary-500 text-base"></i>
                      <span>A minimum of 25% advance payment is required to confirm your booking.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <i className="fi fi-rr-check text-primary-500 text-base"></i>
                      <span>The remaining balance must be paid at least 30 days before the trip start date.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <i className="fi fi-rr-check text-primary-500 text-base"></i>
                      <span>For bookings made within 30 days of the trip start date, full payment is required at the time of booking.</span>
                    </li>
                  </ul>
                </div>
              </section>

              {/* Cancellation Section */}
              <section id="cancellation" className="mb-12">
                <h2 className="md:text-2xl text-xl font-bold text-gray-800 mb-6 tracking-tighter">Cancellation & Refunds</h2>
                <div className="prose prose-gray max-w-none">
                  <div className="grid gap-6">
                    <div className="bg-gray-50 rounded-xl p-6">
                      <h3 className="font-semibold text-gray-700 mb-4 tracking-tighter">Cancellation Timeline</h3>
                      <ul className="space-y-4 text-gray-600">
                        <li className="flex items-start gap-3">
                          <i className="fi fi-rr-rhombus text-primary-500 mt-1"></i>
                          <div>
                            <span className="font-medium">30+ days before trip:</span>
                            <p className="text-sm mt-1">Full refund minus processing fees</p>
                          </div>
                        </li>
                        <li className="flex items-start gap-3">
                          <i className="fi fi-rr-rhombus text-primary-500 mt-1 text-base"></i>
                          <div>
                            <span className="font-medium">15-29 days before trip:</span>
                            <p className="text-sm mt-1">50% refund minus processing fees</p>
                          </div>
                        </li>
                        <li className="flex items-start gap-3">
                          <i className="fi fi-rr-rhombus text-primary-500 mt-1 text-base"></i>
                          <div>
                            <span className="font-medium">0-14 days before trip:</span>
                            <p className="text-sm mt-1">No refund available</p>
                          </div>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </section>

              {/* Pricing Section */}
              <section id="pricing" className="mb-12">
                <h2 className="md:text-2xl text-xl font-bold text-gray-800 mb-6 tracking-tighter">Pricing & Fees</h2>
                <div className="prose prose-gray max-w-none">
                  <div className="bg-gray-50 rounded-xl p-6">
                    <ul className="space-y-4 text-gray-600">
                      <li className="flex items-start gap-3">
                        <i className="fi fi-rr-money-bill-wave text-primary-500 mt-1 text-base"></i>
                        <div>
                          <span className="font-medium">Base Price</span>
                          <p className="text-sm mt-1">All prices are listed in INR and include applicable taxes</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <i className="fi fi-rr-receipt text-primary-500 mt-1 text-base"></i>
                        <div>
                          <span className="font-medium">Processing Fees</span>
                          <p className="text-sm mt-1">A small processing fee may apply to cover payment gateway charges</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <i className="fi fi-rr-info text-primary-500 mt-1 text-base"></i>
                        <div>
                          <span className="font-medium">Price Changes</span>
                          <p className="text-sm mt-1">We reserve the right to modify prices due to market conditions or errors</p>
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Payment Methods Section */}
              <section id="payment-methods" className="mb-12">
                <h2 className="md:text-2xl text-xl font-bold text-gray-800 mb-6 tracking-tighter">Payment Methods</h2>
                <div className="prose prose-gray max-w-none">
                  <p className="text-gray-600 mb-6">We accept the following payment methods:</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                      <i className="fi fi-rr-credit-card text-primary-500 text-base"></i>
                      <div>
                        <h4 className="font-medium text-gray-800">Credit/Debit Cards</h4>
                        <p className="text-sm text-gray-600">Visa, MasterCard, American Express</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                      <i className="fi fi-rr-bank text-primary-500 text-base"></i>
                      <div>
                        <h4 className="font-medium text-gray-800">Net Banking</h4>
                        <p className="text-sm text-gray-600">All major Indian banks supported</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                      <i className="fi fi-rr-mobile text-primary-500 text-base"></i>
                      <div>
                        <h4 className="font-medium text-gray-800">UPI</h4>
                        <p className="text-sm text-gray-600">Google Pay, PhonePe, Paytm</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                      <i className="fi fi-rr-wallet text-primary-500 text-base"></i>
                      <div>
                        <h4 className="font-medium text-gray-800">Digital Wallets</h4>
                        <p className="text-sm text-gray-600">PayPal and other e-wallets</p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Security Section */}
              <section id="security" className="mb-12">
                <h2 className="md:text-2xl text-xl font-bold text-gray-800 mb-6 tracking-tighter">Payment Security</h2>
                <div className="prose prose-gray max-w-none">
                  <div className="bg-gray-50 rounded-xl p-6">
                    <ul className="space-y-4 text-gray-600">
                      <li className="flex items-start gap-3">
                        <i className="fi fi-rr-shield-check text-primary-500 mt-1 text-base"></i>
                        <div>
                          <span className="font-medium">Secure Transactions</span>
                          <p className="text-sm mt-1">All payments are processed through secure SSL encryption</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <i className="fi fi-rr-lock text-primary-500 mt-1 text-base"></i>
                        <div>
                          <span className="font-medium">PCI Compliance</span>
                          <p className="text-sm mt-1">We adhere to strict PCI DSS requirements for handling payment data</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <i className="fi fi-rr-user-shield text-primary-500 mt-1 text-base"></i>
                        <div>
                          <span className="font-medium">Data Protection</span>
                          <p className="text-sm mt-1">Your payment information is never stored on our servers</p>
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Disputes Section */}
              <section id="disputes" className="mb-12">
                <h2 className="md:text-2xl text-xl font-bold text-gray-800 mb-6 tracking-tighter">Disputes & Resolutions</h2>
                <div className="prose prose-gray max-w-none">
                  <p className="text-gray-600 mb-6">
                    In case of any payment-related disputes, please follow these steps:
                  </p>
                  <div className="space-y-6">
                    <div className="flex items-start gap-4 p-6 bg-gray-50 rounded-xl">
                      <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-primary-600 font-medium">1</span>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-800 mb-2">Contact Support</h4>
                        <p className="text-gray-600 text-sm">
                          Reach out to our customer support team with your booking reference number and issue details.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4 p-6 bg-gray-50 rounded-xl">
                      <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-primary-600 font-medium">2</span>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-800 mb-2">Documentation</h4>
                        <p className="text-gray-600 text-sm">
                          Provide any relevant documentation or evidence to support your claim.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4 p-6 bg-gray-50 rounded-xl">
                      <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-primary-600 font-medium">3</span>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-800 mb-2">Resolution Timeline</h4>
                        <p className="text-gray-600 text-sm">
                          We aim to resolve all payment disputes within 7-10 business days.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
