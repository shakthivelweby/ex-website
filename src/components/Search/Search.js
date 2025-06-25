import { useState, useEffect } from 'react';
import Image from 'next/image';
import Popup from '../Popup';
import { useSearch } from '@/app/search/query';
import { useFeaturedDestinations } from '@/app/search/query';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { 
    opacity: 0,
    y: 20
  },
  show: { 
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24
    }
  }
};

export default function Search({ 
  isOpen, 
  onClose,
  type // Remove default value to handle undefined case
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [mounted, setMounted] = useState(false);
  const [selectedType, setSelectedType] = useState(type || 'package');
  const router = useRouter();

  const { data: searchResults, isLoading } = useSearch(searchQuery);
  const { data: featuredData } = useFeaturedDestinations();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Reset selected type when type prop changes
  useEffect(() => {
    if (type) {
      setSelectedType(type);
    }
  }, [type]);

  const handleSelect = (item) => {
    // Save destination data to localStorage with proper structure for both types
    const destinationData = {
      id: item.id,
      name: item.name,
      type: item.type,
      country_id: item.type === 'country' ? item.id : item.country_id,
      state_id: item.type === 'state' ? item.id : item.state_id,
      destination_id: item.type === 'destination' ? item.id : null
    };
    localStorage.setItem("choosedDestination", JSON.stringify(destinationData));

    if (selectedType === 'package') {
      let url;
      
      if (item.type === 'country') {
        url = `/packages/${item.id}`;
      } else if (item.type === 'state') {
        url = `/packages/${item.country_id}?state=${item.id}`;
      } else if (item.type === 'destination') {
        url = `/packages/${item.country_id}?state=${item.state_id}&destination=${item.id}`;
      }
      
      if (url) {
        router.push(url);
        onClose();
      } else {
        console.error('Invalid item type:', item);
      }
    } else if (selectedType === 'schedule') {
      // Use router.replace to update URL without full page refresh
      router.replace('/scheduled', { scroll: false });
      onClose();
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'country':
        return 'fi-rr-globe';
      case 'state':
        return 'fi-rr-map';
      case 'destination':
        return 'fi-rr-map-marker';
      default:
        return 'fi-rr-map-marker';
    }
  };

  return (
    <Popup
      isOpen={isOpen}
      onClose={onClose}
      title="Search"
      pos="right"
      className="w-full max-w-lg h-[80vh] md:h-auto"
      draggable={true}
    >
      <div className="flex flex-col h-full overflow-hidden">
        {/* Search Input */}
        <div className="p-4 flex-shrink-0">
          {/* Type Selection - Only show when type is not passed as prop */}
          {!type && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-3"
            >
              <div className="flex gap-2 bg-gray-50/80 p-1 rounded-xl">
                <button
                  onClick={() => setSelectedType('package')}
                  className={`flex-1 flex items-center px-3 py-2 rounded-lg transition-all duration-200 ${
                    selectedType === 'package'
                      ? 'bg-primary-500'
                      : 'hover:bg-white/50'
                  }`}
                >
                  <div className={`flex items-center justify-center w-7 h-7 rounded-md ${
                    selectedType === 'package' ? 'bg-white' : 'bg-white border border-gray-200'
                  }`}>
                    <i className={`fi fi-rr-umbrella-beach ${
                      selectedType === 'package' ? 'text-primary-500' : 'text-gray-500'
                    }`}></i>
                  </div>
                  <span className={`ml-2 text-sm font-medium ${
                    selectedType === 'package' ? 'text-white' : 'text-gray-600'
                  }`}>Packages</span>
                </button>

                <button
                  onClick={() => setSelectedType('schedule')}
                  className={`flex-1 flex items-center px-3 py-2 rounded-lg transition-all duration-200 ${
                    selectedType === 'schedule'
                      ? 'bg-primary-500'
                      : 'hover:bg-white/50'
                  }`}
                >
                  <div className={`flex items-center justify-center w-7 h-7 rounded-md ${
                    selectedType === 'schedule' ? 'bg-white' : 'bg-white border border-gray-200'
                  }`}>
                    <i className={`fi fi-rr-calendar ${
                      selectedType === 'schedule' ? 'text-primary-500' : 'text-gray-500'
                    }`}></i>
                  </div>
                  <span className={`ml-2 text-sm font-medium ${
                    selectedType === 'schedule' ? 'text-white' : 'text-gray-600'
                  }`}>Schedule</span>
                </button>
              </div>
            </motion.div>
          )}

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative"
          >
            <div className="absolute inset-y-0 left-0 flex items-center pl-4">
              <i className="fi fi-rr-search text-gray-400 text-base"></i>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search locations..."
              className="block w-full h-12 bg-gray-50/80 rounded-2xl pl-11 pr-4 text-[15px] text-gray-900 
                placeholder:text-gray-400 focus:outline-none border border-transparent focus:bg-white 
                focus:border-gray-200 focus:shadow-sm transition-all duration-200"
            />
          </motion.div>
        </div>

        {/* Results Area */}
        <div className="flex-1 overflow-y-auto px-4">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-12"
              >
                <div className="w-16 h-16 rounded-full border-4 border-primary-100 border-t-primary-500 animate-spin"></div>
                <p className="mt-4 text-gray-500">Searching...</p>
              </motion.div>
            ) : searchQuery ? (
              !searchResults?.data?.data || !Array.isArray(searchResults?.data?.data) || searchResults.data.data.length === 0 ? (
                <motion.div
                  key="no-results"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="text-center py-8"
                >
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                    <i className="fi fi-rr-map-marker-cross text-gray-400 text-2xl"></i>
                  </div>
                  <p className="text-gray-500">No results found</p>
                  <p className="text-sm text-gray-400 mt-1">Try a different search term</p>
                </motion.div>
              ) : (
                <motion.div
                  key="search-results"
                  variants={containerVariants}
                  initial="hidden"
                  animate="show"
                  className="space-y-2 pb-4"
                >
                  {searchResults.data.data.map((item) => (
                    <motion.button
                      key={`${item.type}-${item.id}`}
                      variants={itemVariants}
                      onClick={() => handleSelect(item)}
                      className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-2xl group transition-colors"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="w-12 h-12 rounded-xl overflow-hidden relative bg-gray-100 flex-shrink-0">
                        {item.image && item.image !== "http://192.168.1.38:8000/images/destination" ? (
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover"
                            sizes="48px"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-100">
                            <i className={`fi ${getIcon(item.type)} text-gray-500 text-xl z-10`}></i>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 text-left">
                        <h3 className="text-gray-900 font-medium group-hover:text-primary-600 transition-colors">
                          {item.name}
                        </h3>
                        <p className="text-sm text-gray-500 capitalize">
                          {item.type}
                        </p>
                      </div>
                      <div className="w-8 h-8 rounded-full flex items-center justify-center group-hover:bg-primary-50">
                        <i className="fi fi-rr-arrow-small-right text-gray-400 group-hover:text-primary-600"></i>
                      </div>
                    </motion.button>
                  ))}
                </motion.div>
              )
            ) : (
              <motion.div
                key="featured"
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="space-y-6"
              >
                <motion.div variants={itemVariants} className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">Featured Destinations</h3>
                </motion.div>
                <div className="grid grid-cols-1 gap-4">
                  {featuredData?.data?.map((destination) => (
                    <motion.button
                      key={destination.id}
                      variants={itemVariants}
                      onClick={() => handleSelect({
                        id: destination.id,
                        type: 'destination',
                        name: destination.name,
                        state_id: destination.state_id,
                        country_id: 1
                      })}
                      className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-2xl group transition-colors"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="w-12 h-12 rounded-xl overflow-hidden relative bg-gray-100 flex-shrink-0">
                        {destination.thumb_image_url && destination.thumb_image_url !== "http://192.168.1.38:8000/images/destination" ? (
                          <Image
                            src={destination.thumb_image_url}
                            alt={destination.name}
                            fill
                            className="object-cover"
                            sizes="48px"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-100">
                            <i className="fi fi-rr-map-marker text-gray-500 text-xl z-10"></i>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 text-left">
                        <h3 className="text-gray-900 font-medium group-hover:text-primary-600 transition-colors">
                          {destination.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Featured Destination
                        </p>
                      </div>
                      <div className="w-8 h-8 rounded-full flex items-center justify-center group-hover:bg-primary-50">
                        <i className="fi fi-rr-arrow-small-right text-gray-400 group-hover:text-primary-600"></i>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Tips Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-4 flex-shrink-0 bg-white border-t border-gray-100"
        >
          <div className="px-4 py-3.5 bg-gray-50 rounded-2xl border border-gray-100">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-gray-900 rounded-lg flex items-center justify-center flex-shrink-0">
                <i className="fi fi-rr-bulb text-white text-xs"></i>
              </div>
              <div>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Search for countries, states, or destinations to explore available packages.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </Popup>
  );
} 