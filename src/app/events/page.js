'use client';

import EventCard from "@/components/eventCard";
import EventFilters from "@/components/EventFilters/EventFilters";
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from "next/navigation";

const Events = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Sample categories for display
  const categories = [
    'Workshops', 'Comedy Shows', 'Music Shows', 'Performances', 'Kids',
    'Meetups', 'Talks', 'Screening', 'Exhibitions', 'Award shows',
    'Holi Celebrations', 'Spirituality'
  ];

  // Sample events data
  const events = [
    {
      id: 1,
      title: 'Raagas of Rafi by Javed Ali with 30 musicians',
      date: 'Thu, 31 Jul',
      venue: 'MMRDA Grounds, Mumbai',
      type: 'Concerts',
      image: '/images/events/card-1.jpg',
      price: '₹ 800 onwards',
      promoted: true
    },
    {
      id: 2,
      title: 'Poetry Painting (DIY workshop)',
      date: 'Thu, 24 Jul onwards',
      venue: 'Multiple Venues',
      type: 'Workshops',
      image: '/images/events/card-2.jpg',
      price: '₹ 450 onwards',
      promoted: true
    },
    {
      id: 3,
      title: 'Kisi Ko Batana Mat Ft. Anubhav Singh Bassi',
      date: 'Fri, 25 Jul onwards',
      venue: 'Sri Shanmukhananda Fine Arts',
      type: 'Stand up Comedy',
      image: '/images/events/card-3.jpg',
      price: '₹ 999 onwards'
    },
    {
      id: 4,
      title: 'Kal ki Chinta Nahi Karta ft. Ravi Gupta',
      date: 'Fri, 15 Aug',
      venue: 'Birla Matoshree Sabhagriha',
      type: 'Stand up Comedy',
      image: '/images/events/card-1.jpg',
      price: '₹ 799 onwards'
    },
    {
      id: 5,
      title: 'Kal ki Chinta Nahi Karta ft. Ravi Gupta',
      date: 'Fri, 15 Aug',
      venue: 'Birla Matoshree Sabhagriha',
      type: 'Stand up Comedy',
      image: '/images/events/card-2.jpg',
      price: '₹ 799 onwards'
    },
    {
      id: 6,
      title: 'Kal ki Chinta Nahi Karta ft. Ravi Gupta',
      date: 'Fri, 15 Aug',
      venue: 'Birla Matoshree Sabhagriha',
      type: 'Stand up Comedy',
      image: '/images/events/card-3.jpg',
      price: '₹ 799 onwards'
    },
    {
      id: 7,
      title: 'Kal ki Chinta Nahi Karta ft. Ravi Gupta',
      date: 'Fri, 15 Aug',
      venue: 'Birla Matoshree Sabhagriha',
      type: 'Stand up Comedy',
      image: '/images/events/card-1.jpg',
      price: '₹ 799 onwards'
    },
    {
      id: 8,
      title: 'Kal ki Chinta Nahi Karta ft. Ravi Gupta',
      date: 'Fri, 15 Aug',
      venue: 'Birla Matoshree Sabhagriha',
      type: 'Stand up Comedy',
      image: '/images/events/card-3.jpg',
      price: '₹ 799 onwards'
    }
  ];

  // Get initial filters from URL
  const initialFilters = {
    date: searchParams.get('date') || '',
    language: searchParams.get('language') || '',
    category: searchParams.get('category') || '',
    price_range_from: searchParams.get('price_range_from') || '',
    price_range_to: searchParams.get('price_range_to') || ''
  };

  // Function to update URL with filters
  const updateURL = (newFilters) => {
    const params = new URLSearchParams(searchParams);

    // Update or remove date parameter
    if (newFilters.date) {
      params.set('date', newFilters.date);
    } else {
      params.delete('date');
    }

    // Update or remove language parameter
    if (newFilters.language) {
      params.set('language', newFilters.language);
    } else {
      params.delete('language');
    }

    // Update or remove category parameter
    if (newFilters.category) {
      params.set('category', newFilters.category);
    } else {
      params.delete('category');
    }

    // Update or remove price range parameters
    if (newFilters.price_range_from && newFilters.price_range_to) {
      params.set('price_range_from', newFilters.price_range_from);
      params.set('price_range_to', newFilters.price_range_to);
    } else {
      params.delete('price_range_from');
      params.delete('price_range_to');
    }

    // Update the URL without refreshing the page
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <main className="min-h-screen bg-white">
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 mt-3 lg:mt-10">
        {/* Header */}
        <div className="max-w-3xl mb-8 sm:mb-12">
          <h1 className="text-2xl text-gray-900 md:text-4xl font-medium text-left tracking-tight mb-2 sm:mb-3">
            Events That Inspire & Excite
          </h1>
          <p className="text-sm sm:text-base text-gray-600 text-left text-left">
            Discover and book amazing events happening around you
          </p>
        </div>

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Filters Section - Desktop */}
          <div className="hidden lg:block lg:w-1/4 xl:w-1/5 shrink-0">
            <div className="sticky top-24">
              <EventFilters 
                initialFilters={initialFilters}
                onFilterChange={updateURL}
              />
            </div>
          </div>

          {/* Events Content */}
          <div className="flex-grow">
            {/* Top Bar */}
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <div className="flex items-center gap-3 sm:gap-4">
                <h2 className="text-sm sm:text-base font-medium text-gray-900">
                  All Events
                </h2>
                <span className="text-xs sm:text-sm text-gray-500">
                  {events.length} events available
                </span>
              </div>

              {/* Mobile Filter Button */}
              <div className="lg:hidden">
                <button
                  onClick={() => setIsFilterOpen(true)}
                  className="relative flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-900 text-white shadow-sm hover:bg-black transition-colors text-sm"
                >
                  <i className="fi fi-rr-settings-sliders text-[13px]"></i>
                  <span className="text-white">Filters</span>
                  {Object.values(initialFilters).some(value => value) && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-primary-500 rounded-full border-2 border-white"></span>
                  )}
                </button>
              </div>
            </div>

            {/* Category Pills - Scrollable on mobile */}
            <div className="relative mb-6 sm:mb-8">
              <div className="flex overflow-x-auto pb-2 sm:pb-0 sm:flex-wrap gap-2 hide-scrollbar">
                {categories.map((category, index) => (
                  <button
                    key={index}
                    className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-sm border whitespace-nowrap transition-all ${
                      initialFilters.category === category 
                      ? 'border-primary-600 bg-primary-50 text-primary-700' 
                      : 'border-primary-100 text-primary-600 hover:bg-primary-50'
                    }`}
                    onClick={() => updateURL({ ...initialFilters, category })}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Events Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-4 sm:gap-6">
              {events.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </div>
        </div>

        {/* Mobile Filters */}
        <EventFilters 
          isOpen={isFilterOpen} 
          onClose={() => setIsFilterOpen(false)} 
          isMobile 
          initialFilters={initialFilters}
          onFilterChange={updateURL}
        />
      </div>

      <style jsx global>{`
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </main>
  );
};

export default Events;
