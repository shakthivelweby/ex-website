'use client';

import EventCard from "@/components/eventCard";
import EventFilters from "@/components/EventFilters/EventFilters";
import LocationSearchPopup from "@/components/LocationSearchPopup";
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from "next/navigation";

const ClientWrapper = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);

  // Categories with icons
  const categories = [
    { id: 'workshops', name: 'Workshops', icon: 'fi fi-rr-graduation-cap' },
    { id: 'comedy', name: 'Comedy Shows', icon: 'fi fi-rr-grin-beam' },
    { id: 'music', name: 'Music Shows', icon: 'fi fi-rr-music' },
    { id: 'performances', name: 'Performances', icon: 'fi fi-rr-theater-masks' },
    { id: 'kids', name: 'Kids', icon: 'fi fi-rr-baby' },
    { id: 'meetups', name: 'Meetups', icon: 'fi fi-rr-users' },
    { id: 'talks', name: 'Talks', icon: 'fi fi-rr-microphone' },
    { id: 'screening', name: 'Screening', icon: 'fi fi-rr-film' },
    { id: 'exhibitions', name: 'Exhibitions', icon: 'fi fi-rr-gallery' },
    { id: 'awards', name: 'Award shows', icon: 'fi fi-rr-trophy' },
    { id: 'holi', name: 'Holi Celebrations', icon: 'fi fi-rr-confetti' },
    { id: 'spirituality', name: 'Spirituality', icon: 'fi fi-rr-lotus' }
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
      promoted: true,
      interest_count: 245
    },
    {
      id: 2,
      title: 'Poetry Painting (DIY workshop)',
      date: 'Thu, 24 Jul onwards',
      venue: 'Multiple Venues',
      type: 'Workshops',
      image: '/images/events/card-2.jpg',
      price: '₹ 450 onwards',
      promoted: true,
      interest_count: 120
    },
    {
      id: 3,
      title: 'Kisi Ko Batana Mat Ft. Anubhav Singh Bassi',
      date: 'Fri, 25 Jul onwards',
      venue: 'Sri Shanmukhananda Fine Arts',
      type: 'Stand up Comedy',
      image: '/images/events/card-3.jpg',
      price: '₹ 999 onwards',
      interest_count: 430
    },
    {
      id: 4,
      title: 'Kal ki Chinta Nahi Karta ft. Ravi Gupta',
      date: 'Fri, 15 Aug',
      venue: 'Birla Matoshree Sabhagriha',
      type: 'Stand up Comedy',
      image: '/images/events/card-1.jpg',
      price: '₹ 799 onwards',
      interest_count: 35
    },
    {
      id: 5,
      title: 'Kal ki Chinta Nahi Karta ft. Ravi Gupta',
      date: 'Fri, 15 Aug',
      venue: 'Birla Matoshree Sabhagriha',
      type: 'Stand up Comedy',
      image: '/images/events/card-2.jpg',
      price: '₹ 799 onwards',
      interest_count: 180
    },
    {
      id: 6,
      title: 'Kal ki Chinta Nahi Karta ft. Ravi Gupta',
      date: 'Fri, 15 Aug',
      venue: 'Birla Matoshree Sabhagriha',
      type: 'Stand up Comedy',
      image: '/images/events/card-3.jpg',
      price: '₹ 799 onwards',
      interest_count: 75
    },
    {
      id: 7,
      title: 'Kal ki Chinta Nahi Karta ft. Ravi Gupta',
      date: 'Fri, 15 Aug',
      venue: 'Birla Matoshree Sabhagriha',
      type: 'Stand up Comedy',
      image: '/images/events/card-1.jpg',
      price: '₹ 799 onwards',
      interest_count: 290
    },
    {
      id: 8,
      title: 'Kal ki Chinta Nahi Karta ft. Ravi Gupta',
      date: 'Fri, 15 Aug',
      venue: 'Birla Matoshree Sabhagriha',
      type: 'Stand up Comedy',
      image: '/images/events/card-3.jpg',
      price: '₹ 799 onwards',
      interest_count: 145
    }
  ];

  // Get initial filters from URL
  const initialFilters = {
    date: searchParams.get('date') || '',
    language: searchParams.get('language') || '',
    category: searchParams.get('category') || '',
    price_range_from: searchParams.get('price_range_from') || '',
    price_range_to: searchParams.get('price_range_to') || '',
    location: searchParams.get('location') || ''
  };

  useEffect(() => {
    if (initialFilters.location) {
      setSelectedLocation(initialFilters.location);
    }
  }, [initialFilters.location]);

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

    // Update or remove location parameter
    if (newFilters.location) {
      params.set('location', newFilters.location);
    } else {
      params.delete('location');
    }

    // Update the URL without refreshing the page
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  // Handle location selection
  const handlePlaceSelected = (place) => {
    if (place) {
      const locationName = place.name;
      setSelectedLocation(locationName);
      updateURL({ ...initialFilters, location: locationName });
      setIsLocationOpen(false);
    }
  };

  return (
    <main className="min-h-screen bg-white">
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 mt-3 lg:mt-10">


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
                  Events in <span className="text-primary-600">{selectedLocation || 'Mumbai'}</span>
                </h2>
                <span className="text-xs sm:text-sm text-gray-500">
                  {events.length} events available
                </span>
              </div>

              {/* Location and Filter Buttons */}
              <div className="flex items-center gap-2 lg:gap-3">
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
            </div>

            {/* Category Grid */}
            <div className="mb-8">
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-12 gap-4">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => updateURL({ ...initialFilters, category: category.name })}
                    className={`flex flex-col items-center gap-2 group ${initialFilters.category === category.name
                      ? 'text-primary-600'
                      : 'text-gray-600 hover:text-primary-600'
                      }`}
                  >
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center transition-colors ${initialFilters.category === category.name
                      ? 'bg-primary-50'
                      : 'bg-gray-50 group-hover:bg-primary-50'
                      }`}>
                      <i className={`${category.icon} text-xl`}></i>
                    </div>
                    <span className="text-xs font-medium text-center">
                      {category.name}
                    </span>
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

        {/* Location Picker Popup */}
        <LocationSearchPopup
          isOpen={isLocationOpen}
          onClose={() => setIsLocationOpen(false)}
          onPlaceSelected={handlePlaceSelected}
          googleApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
          title="Choose Location"
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

export default ClientWrapper;
