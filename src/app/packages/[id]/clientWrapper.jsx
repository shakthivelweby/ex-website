"use client";

import PackageCard from "@/components/PackageCard";
import Image from "next/image";
import { useState, useEffect, useMemo } from "react";
import RangeSlider from "@/components/RangeSlider/RangeSlider";
import Dropdown from "@/components/Dropdown/Dropdown";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { suitableFor } from "./service";
import { useQuery } from "@tanstack/react-query";
import PropTypes from 'prop-types';

const ClientWrapper = ({ packages, stateInfo, stateDestinations, type, destinationId, initialFilters, featuredDestinations, countryInfo, statesData, fallbackImage }) => {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [mobileLayout, setMobileLayout] = useState('list'); // 'list' or 'grid'
    const [coverImage, setCoverImage] = useState(
        type === "destination" ? stateDestinations?.destinations?.find(d => d.id === parseInt(destinationId))?.cover_image_url :
        type === "state" ? stateInfo?.cover_image_url :
        countryInfo?.image_url || fallbackImage.fallbackL
    );
    const [coverName, setCoverName] = useState('');
    const [selectedDestination, setSelectedDestination] = useState('all');

    console.log(countryInfo)
    const { data: suitableForData, isLoading: isSuitableForLoading } = useQuery({
        queryKey: ['suitableFor', stateInfo.id],
        queryFn: () => suitableFor(stateInfo.id)
    });

    // Define options first
    const tourTypeOptions = [
        { value: "fixed_departure", label: "Scheduled Tours" },
        { value: "private", label: "Private Packages" }
    ];

    // Format suitable for options from API data using useMemo
    const suitableForOptions = useMemo(() => {
        if (!suitableForData?.data) return [];
        return [
            { value: "", label: "All" },
            ...suitableForData.data.map(item => ({
                value: item.id.toString(),
                label: item.name
            }))
        ];
    }, [suitableForData]);

    const sortOptions = [
        { value: "", label: "Default" },
        { value: "asc", label: "Price: Low to High" },
        { value: "desc", label: "Price: High to Low" }
    ];

    // set cover image and name based on type
    useEffect(() => {
        switch (type) {
            case "country":
                if (countryInfo) {
                    console.log("countryInfo", countryInfo)
                    setCoverImage(countryInfo.image_url);
                    setCoverName(countryInfo.name);
                }
                break;
            case "state":
                if (stateInfo) {
                    setCoverImage(stateInfo.cover_image_url);
                    setCoverName(stateInfo.name);
                }
                break;
            case "destination":
                if (stateDestinations?.destinations && destinationId) {
                    const destination = stateDestinations.destinations.find(
                        dest => dest.id === parseInt(destinationId)
                    );
                    if (destination) {
                        setCoverImage(destination.cover_image_url);
                        setCoverName(destination.name);
                    } else {
                        // Fallback to state info if destination not found
                        setCoverImage(stateInfo.cover_image_url);
                        setCoverName(stateInfo.name);
                    }
                }
                break;
            default:
                // Default fallback
                if (stateInfo) {
                    setCoverImage(stateInfo.cover_image_url);
                    setCoverName(stateInfo.name);
                }
        }
    }, [type, countryInfo, stateInfo, stateDestinations, destinationId]);

    // Initialize filters with useMemo
    const initialFilterState = useMemo(() => {
        return {
            tourType: initialFilters?.tourType ? {
                value: initialFilters.tourType,
                label: initialFilters.tourType === "scheduled" ? "Scheduled Tours" : "Private Packages"
            } : "",
            priceRange: initialFilters?.price_range_from && initialFilters?.price_range_to ? {
                from: parseInt(initialFilters.price_range_from),
                to: parseInt(initialFilters.price_range_to)
            } : "",
            suitableFor: "",
            sortBy: initialFilters?.sortBy ? {
                value: initialFilters.sortBy,
                label: sortOptions.find(opt => opt.value === initialFilters.sortBy)?.label || ""
            } : ""
        };
    }, [initialFilters]);

    const [filters, setFilters] = useState(initialFilterState);

    // Listen to URL changes and update filters accordingly
    useEffect(() => {
        const destinationParam = searchParams.get('destination');
        if (destinationParam) {
            const destId = parseInt(destinationParam);
            const selectedDest = stateDestinations?.destinations?.find(
                dest => dest.id === destId
            );
            if (selectedDest) {
                setFilters(prev => ({
                    ...prev,
                    destination: {
                        value: destId.toString(),
                        label: selectedDest.name
                    }
                }));
            }
        } else {
            setFilters(prev => ({
                ...prev,
                destination: ""
            }));
        }
    }, [searchParams, stateDestinations?.destinations]);

    // Update filters when suitableForData loads
    useEffect(() => {
        if (suitableForData?.data) {
            // Always update options when data loads
            if (initialFilters?.suitableFor) {
                const matchedOption = suitableForData.data.find(
                    item => item.id.toString() === initialFilters.suitableFor
                );
                if (matchedOption) {
                    setFilters(prev => ({
                        ...prev,
                        suitableFor: {
                            value: matchedOption.id.toString(),
                            label: matchedOption.name
                        }
                    }));
                }
            }
        }
    }, [suitableForData, initialFilters?.suitableFor]);

    // Keep selected destination in sync with URL
    useEffect(() => {
        const destinationParam = searchParams.get('destination');
        if (destinationParam) {
            setSelectedDestination(parseInt(destinationParam));
        } else {
            setSelectedDestination('all');
        }
    }, [searchParams]);

    // Function to update URL with current filters
    const updateURL = (newFilters) => {
        const params = new URLSearchParams(searchParams);

        // Preserve type parameters
        if (type === "state") {
            params.set('state', 'true');
        }
        if (type === "destination" && destinationId) {
            params.set('state', 'true');
            params.set('destination', destinationId);
        }

        // Update or remove tour_type parameter
        if (newFilters.tourType?.value) {
            params.set('tour_type', newFilters.tourType.value);
        } else {
            params.delete('tour_type');
        }

        // Update or remove suitable_id parameter
        if (newFilters.suitableFor?.value) {
            params.set('suitable_id', newFilters.suitableFor.value);
        } else {
            params.delete('suitable_id');
        }

        // Update or remove sort_by_price parameter
        if (newFilters.sortBy?.value) {
            params.set('sort_by_price', newFilters.sortBy.value);
        } else {
            params.delete('sort_by_price');
        }

        // Update or remove price range parameters
        if (newFilters.priceRange) {
            params.set('price_range_from', newFilters.priceRange.from.toString());
            params.set('price_range_to', newFilters.priceRange.to.toString());
        } else {
            params.delete('price_range_from');
            params.delete('price_range_to');
        }

        // Update or remove destination parameter only if we're in state view
        if (type === "state" && newFilters.destination?.value) {
            params.set('destination', newFilters.destination.value);
        } else if (type === "state") {
            params.delete('destination');
        }

        // Update the URL without refreshing the page
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
    };

    // Function to generate URLs for navigation
    const generateURL = (params = {}) => {
        const urlParams = new URLSearchParams();

        // Add type-specific parameters
        if (params.state) {
            urlParams.set('state', 'true');
        }
        if (params.destination) {
            urlParams.set('state', 'true');
            urlParams.set('destination', params.destination);
        }

        // Preserve current filters if keepFilters is true
        if (params.keepFilters) {
            if (filters.tourType?.value) {
                urlParams.set('tour_type', filters.tourType.value);
            }
            if (filters.suitableFor?.value) {
                urlParams.set('suitable_id', filters.suitableFor.value);
            }
            if (filters.sortBy?.value) {
                urlParams.set('sort_by_price', filters.sortBy.value);
            }
            if (filters.priceRange) {
                urlParams.set('price_range_from', filters.priceRange.from.toString());
                urlParams.set('price_range_to', filters.priceRange.to.toString());
            }
        }

        return `${params.baseUrl || pathname}?${urlParams.toString()}`;
    };

    // Reset key for filter components
    const [resetKey, setResetKey] = useState(0);

    // Format destinations for dropdown
    const destinationOptions = useMemo(() => {
        if (!stateDestinations?.destinations) return [];
        return stateDestinations.destinations.map(dest => ({
            value: dest.id.toString(),
            label: dest.name
        }));
    }, [stateDestinations?.destinations]);

    // Update individual filter values
    const updateFilter = (name, value) => {
        const newFilters = {
            ...filters,
            [name]: value
        };
        setFilters(newFilters);
        updateURL(newFilters);
    };

    // Clear all filters
    const clearAllFilters = () => {
        const newFilters = {
            tourType: "",
            priceRange: "",
            suitableFor: "",
            sortBy: "",
            destination: ""
        };
        setFilters(newFilters);
        updateURL(newFilters);
        setResetKey(prev => prev + 1);
    };

    // Apply filters
    const applyFilters = () => {
        updateURL(filters);
        // Here you would typically make an API call with the filters
        console.log('Applied filters:', filters);
    };

    // Handle price range change
    const handlePriceRangeChange = (value) => {
        const newFilters = {
            ...filters,
            priceRange: {
                from: value,
                to: value + 10000 // Assuming 10000 is your range step
            }
        };
        setFilters(newFilters);
        updateURL(newFilters);
    };

    // Function to toggle filter popup
    const toggleFilter = () => {
        setIsFilterOpen(!isFilterOpen);
        // Prevent body scroll when filter is open
        if (!isFilterOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    };

    // Close filter when applying filters
    const handleApplyFilters = () => {
        applyFilters();
        setIsFilterOpen(false);
        document.body.style.overflow = 'unset';
    };

    // Close filter when clearing all
    const handleClearAllFilters = () => {
        clearAllFilters();
        setIsFilterOpen(false);
        document.body.style.overflow = 'unset';
    };

    const handleDestinationSelect = (destinationId) => {
        setSelectedDestination(destinationId);
        // Update URL with the selected destination
        const params = new URLSearchParams(searchParams);

        // Set the state ID instead of 'true'
        if (stateInfo?.id) {
            params.set('state', stateInfo.id.toString());
        }

        if (destinationId === 'all') {
            params.delete('destination');
            // Clear the destination filter
            setFilters(prev => ({
                ...prev,
                destination: ""
            }));
        } else {
            params.set('destination', destinationId);
            // Find the destination details and update the filter
            const selectedDest = stateDestinations?.destinations?.find(
                dest => dest.id === destinationId
            );
            if (selectedDest) {

                setFilters(prev => ({
                    ...prev,
                    destination: {
                        value: destinationId.toString(),
                        label: selectedDest.name
                    }
                }));
            }
        }
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
    };

    const handleImageError = () => {
        setCoverImage(fallbackImage.fallbackL);
    };

   

    const stateSuggestions = (options = { all: true, type: 'suggestions', restrictedId : null }) => {
        const { all = true, type = 'suggestions', restrictedId = null } = options;
        return (
            <div className="container mx-auto px-4 pt-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-base font-medium text-gray-900">
                            {type === 'suggestions' ? 'Explore Other States' : 'Popular States'}
                            <span className="text-sm font-normal text-gray-500 ml-2">
                                in {countryInfo?.name || ''}
                            </span>
                        </h3>
                    </div>
                </div>
                <div className="relative">
                    <div className="overflow-x-auto scrollbar-hide">
                        <div className="flex gap-3 pb-2" style={{ minWidth: 'min-content' }}>
                            {/* All States Button */}
                            {all && (
                                <Link
                                    href={`/packages/${countryInfo?.id}`}
                                    className="group flex-shrink-0"
                                >
                                    <div className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all 
                                        bg-white border-gray-200 hover:border-primary-500 hover:bg-primary-50`}>
                                        <div className="w-6 h-6 rounded-full overflow-hidden relative flex items-center justify-center bg-gray-100">
                                            <i className="fi fi-rr-apps text-[10px] text-gray-500"></i>
                                        </div>
                                        <span className="text-sm font-medium whitespace-nowrap text-gray-700 group-hover:text-primary-600">
                                            All
                                        </span>
                                    </div>
                                </Link>
                            )}

                            {statesData.map((state) => (
                                <Link
                                    key={state.id}
                                    href={`/packages/${countryInfo?.id}?state=${state.id}`}
                                    className="group flex-shrink-0"
                                >
                                    <div className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all 
                                            bg-white border-gray-200 hover:border-primary-500 hover:bg-primary-50`}>
                                        <div className="w-6 h-6 rounded-full overflow-hidden relative">
                                            <Image
                                                src={state.thumb_image_url}
                                                alt={state.name}
                                                fill
                                                className="object-cover"
                                              
                                            />
                                        </div>
                                        <span className="text-sm font-medium whitespace-nowrap text-gray-700 group-hover:text-primary-600">
                                            {state.name}
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Gradient Fades */}
                    <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent pointer-events-none"></div>
                    <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent pointer-events-none"></div>
                </div>
            </div>
        )
    }

    const destinationSuggestions = () => {
        return (
            <div className="container mx-auto px-4 pt-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-base font-medium text-gray-900">
                            Popular Destinations
                            <span className="text-sm font-normal text-gray-500 ml-2">
                                in {stateInfo?.name || ''}
                            </span>
                        </h3>
                    </div>
                </div>
                <div className="relative">
                    <div className="overflow-x-auto scrollbar-hide">
                        <div className="flex gap-3 pb-2" style={{ minWidth: 'min-content' }}>
                            {/* All Destinations Button */}
                            <Link
                                href={`/packages/${countryInfo?.id}?state=${stateInfo?.id}`}
                                className="group flex-shrink-0"
                                onClick={(e) => {
                                    e.preventDefault();
                                    handleDestinationSelect('all');
                                }}
                            >
                                <div className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all 
                                        bg-white border-gray-200 hover:border-primary-500 hover:bg-primary-50 ${selectedDestination === 'all' ? 'border-primary-500 bg-primary-50' : ''
                                    }`}>
                                    <div className="w-6 h-6 rounded-full overflow-hidden relative flex items-center justify-center bg-gray-100">
                                        <i className="fi fi-rr-apps text-[10px] text-gray-500"></i>
                                    </div>
                                    <span className={`text-sm font-medium whitespace-nowrap ${selectedDestination === 'all' ? 'text-primary-600' : 'text-gray-700'
                                        } group-hover:text-primary-600`}>
                                        All
                                    </span>
                                </div>
                            </Link>

                            {stateDestinations.destinations.map((destination) => (
                                <Link
                                    key={destination.id}
                                    href={`/packages/${countryInfo?.id}?state=${stateInfo?.id}&destination=${destination.id}`}
                                    className="group flex-shrink-0"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handleDestinationSelect(destination.id);
                                    }}
                                >
                                    <div className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all 
                                            bg-white border-gray-200 hover:border-primary-500 hover:bg-primary-50 ${selectedDestination === destination.id ? 'border-primary-500 bg-primary-50' : ''
                                        }`}>
                                        <div className="w-6 h-6 rounded-full overflow-hidden relative">
                                            <Image
                                                src={destination.thumb_image_url}
                                                alt={destination.name}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                        <span className={`text-sm font-medium whitespace-nowrap ${selectedDestination === destination.id ? 'text-primary-600' : 'text-gray-700'
                                            } group-hover:text-primary-600`}>
                                            {destination.name}
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Gradient Fades */}
                    <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent pointer-events-none"></div>
                    <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent pointer-events-none"></div>
                </div>
            </div>
        )
    }


    return (
        <main className="min-h-screen bg-white">
            {/* Modern Minimalist Banner */}
            <div className="relative h-[50vh] md:h-[65vh] w-full overflow-hidden">
                {/* Background Image with Modern Overlay */}
                <div className="absolute inset-0">
                    {coverImage ? (
                        <Image
                            src={coverImage}
                            alt={coverName || 'Cover Image'}
                            fill
                            className="object-cover"
                            priority
                            onError={handleImageError}
                        />
                    ) : (
                        <Image
                            src={fallbackImage.fallbackL}
                            alt="Cover Image"
                            fill
                            className="object-cover"
                            priority
                        />
                    )}
                    {/* Subtle Modern Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/60" />
                </div>

                {/* Minimalist Content Layout */}
                <div className="relative h-full container mx-auto px-4">
                    <div className="absolute bottom-[15%] max-w-3xl">
                        <div className="space-y-2">
                            <span className="inline-block text-xs tracking-[0.2em] uppercase text-white/80 font-light">
                                {coverName ? `Welcome to ${coverName}` : 'Welcome'}
                            </span>
                            <h1 className="text-4xl sm:text-6xl md:text-6xl font-light text-white leading-[1.1]">
                                {coverName ? `Explore ${coverName}` : ''}
                            </h1>
                        </div>
                    </div>
                </div>
            </div>

            {/* Breadcrumb Navigation */}
            <div className="container mx-auto px-4 py-4 border-b border-gray-100 ">
                <nav className="flex items-center space-x-2 text-sm">
                    <Link
                        href="/"
                        className="text-gray-600 hover:text-primary-600 transition-colors flex items-center"
                    >
                      
                        Home
                    </Link>

                    {/* Separator */}
                    <span className="text-gray-400">
                        <i className="fi fi-rr-angle-right text-xs"></i>
                    </span>

                    {/* Country Link */}
                    {type === "country" ? (
                        <span className="text-primary-600 font-medium">
                            {countryInfo?.name || ''}
                        </span>
                    ) : (
                        <>
                            <Link
                                href={`/packages/${countryInfo?.id || ''}`}
                                className="text-gray-600 hover:text-primary-600 transition-colors"
                            >
                                {countryInfo?.name || ''}
                            </Link>

                            {/* Separator */}
                            <span className="text-gray-400">
                                <i className="fi fi-rr-angle-right text-xs"></i>
                            </span>

                            {/* State Link or Text */}
                            {type === "state" ? (
                                <span className="text-primary-600 font-medium">
                                    {stateInfo?.name || ''}
                                </span>
                            ) : (
                                <>
                                    <Link
                                        href={`/packages/${countryInfo?.id}?state=${stateInfo?.id}`}
                                        className="text-gray-600 hover:text-primary-600 transition-colors"
                                    >
                                        {stateInfo?.name || ''}
                                    </Link>

                                    {/* Separator */}
                                    <span className="text-gray-400">
                                        <i className="fi fi-rr-angle-right text-xs"></i>
                                    </span>

                                    {/* Destination (final level) */}
                                    {type === "destination" && (
                                        <span className="text-primary-600 font-medium">
                                            {stateDestinations?.destinations?.find(
                                                dest => dest.id === parseInt(destinationId)
                                            )?.name || ''}
                                        </span>
                                    )}
                                </>
                            )}
                        </>
                    )}
                </nav>
            </div>

            {/* States Scroll Section - Show only on country page */}
            {type === "country" && Array.isArray(statesData) && statesData.length > 0 && (
                stateSuggestions()
            )}

            {/* Destinations Scroll Section - Show only on state page */}
            {(type === "state" || type === "destination") && stateDestinations?.destinations && stateDestinations.destinations.length > 0 && (
                destinationSuggestions()
            )}

            {/* Filters Section */}
            <div className="container mx-auto px-4 pt-6">
                {/* Heading Section */}
                {packages && packages.length > 0 ? (
                    <div className="mb-2">
                        <div className="flex items-center justify-between">
                            {/* Package Count */}
                            <div className="flex items-center">
                                <h2 className="text-base font-medium text-gray-900">
                                    All Packages
                                </h2>
                            </div>

                            {/* Mobile View Controls */}
                            <div className="lg:hidden flex items-center gap-2">
                                {/* Layout Toggle */}
                                <div className="flex items-center bg-white rounded-full p-0.5 border border-gray-100 shadow-sm">
                                    <button
                                        onClick={() => setMobileLayout('list')}
                                        className={`flex items-center justify-center w-7 h-7 rounded-full transition-all ${mobileLayout === 'list'
                                            ? 'bg-gray-900 text-white shadow-sm scale-[1.02]'
                                            : 'text-gray-400 hover:text-gray-600'
                                            }`}
                                        aria-label="List view"
                                    >
                                        <i className={`fi fi-rr-list text-[13px] transition-transform ${mobileLayout === 'list' ? 'scale-110' : ''
                                            }`}></i>
                                    </button>
                                    <button
                                        onClick={() => setMobileLayout('grid')}
                                        className={`flex items-center justify-center w-7 h-7 rounded-full transition-all ${mobileLayout === 'grid'
                                            ? 'bg-gray-900 text-white shadow-sm scale-[1.02]'
                                            : 'text-gray-400 hover:text-gray-600'
                                            }`}
                                        aria-label="Grid view"
                                    >
                                        <i className={`fi fi-rr-apps text-[13px] transition-transform ${mobileLayout === 'grid' ? 'scale-110' : ''
                                            }`}></i>
                                    </button>
                                </div>

                                {/* Filter Button */}
                                <button
                                    onClick={toggleFilter}
                                    className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-900 text-white shadow-sm hover:bg-black transition-colors text-sm"
                                >
                                    <i className="fi fi-rr-settings-sliders text-[13px]"></i>
                                    <span className="font-medium">Filters</span>
                                </button>
                            </div>


                        </div>
                    </div>
                ) : (
                    ""
                )}

                {/* Main Content Layout */}
                <div className="flex flex-col lg:flex-row gap-8">

                    {packages && packages.length > 0 ? (
                        <>
                            {/* Filters Sidebar - Desktop */}
                            <div className="hidden lg:block lg:w-1/4">
                                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6 sticky top-4">
                                    <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                                        <h3 className="font-medium text-gray-900">Filters</h3>
                                        <button
                                            onClick={handleClearAllFilters}
                                            className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                                        >
                                            Clear All
                                        </button>
                                    </div>

                                    {/* Tour Type Filter */}
                                    <div className="space-y-2 relative">
                                        <label className="text-sm font-medium text-gray-700">Tour Type</label>
                                        {filters.tourType && (
                                            <span className="absolute top-2 right-0 w-2 h-2 bg-primary-500 rounded-full"></span>
                                        )}
                                        <Dropdown
                                            key={`tourType-${resetKey}`}
                                            options={tourTypeOptions}
                                            value={filters.tourType}
                                            onChange={(option) => updateFilter("tourType", option)}
                                            placeholder="Select tour type"
                                            className={filters.tourType ? "border-b-1 border-primary-500" : ""}
                                        />
                                    </div>

                                    {/* Price Range Filter */}
                                    <div className="space-y-2 relative">
                                        <label className="text-sm font-medium text-gray-700">Price Range</label>
                                        {filters.priceRange && (
                                            <span className="absolute top-2 right-0 w-2 h-2 bg-primary-500 rounded-full"></span>
                                        )}
                                        <RangeSlider
                                            key={`price-${resetKey}`}
                                            min={1000}
                                            max={50000}
                                            step={1000}
                                            initialValue={filters.priceRange ? filters.priceRange.from : undefined}
                                            onChange={handlePriceRangeChange}
                                            formatDisplay={(val) => {
                                                if (!val) return "Select price range";
                                                return `₹${val.toLocaleString()} - ₹${(val + 10000).toLocaleString()}`;
                                            }}
                                            className={filters.priceRange ? "border-b-2 border-primary-500" : ""}
                                        />
                                    </div>

                                    {/* Suitable For Filter */}
                                    <div className="space-y-2 relative">
                                        <label className="text-sm font-medium text-gray-700">Suitable For</label>
                                        {filters.suitableFor && (
                                            <span className="absolute top-2 right-0 w-2 h-2 bg-primary-500 rounded-full"></span>
                                        )}
                                        <Dropdown
                                            key={`suitable-${resetKey}`}
                                            options={suitableForOptions}
                                            value={filters.suitableFor}
                                            onChange={(option) => updateFilter("suitableFor", option)}
                                            placeholder="Select group type"
                                            isLoading={isSuitableForLoading}
                                            className={filters.suitableFor ? "border-b-1 border-primary-500" : ""}
                                        />
                                    </div>

                                    {/* Sort By */}
                                    <div className="space-y-2 relative">
                                        <label className="text-sm font-medium text-gray-700">Sort By</label>
                                        {filters.sortBy && (
                                            <span className="absolute top-2 right-0 w-2 h-2 bg-primary-500 rounded-full"></span>
                                        )}
                                        <Dropdown
                                            key={`sort-${resetKey}`}
                                            options={sortOptions}
                                            value={filters.sortBy}
                                            onChange={(option) => updateFilter("sortBy", option)}
                                            placeholder="Select sorting"
                                            className={filters.sortBy ? "border-b-1 border-primary-500" : ""}
                                        />
                                    </div>

                                    {/* Apply Button */}
                                    <button
                                        onClick={handleApplyFilters}
                                        className="w-full py-2.5 px-4 rounded-lg bg-primary-500 text-white text-sm font-medium hover:bg-primary-600 transition-colors"
                                    >
                                        Apply Filters
                                    </button>
                                </div>
                            </div>

                            {/* Filter Popup - Mobile */}
                            <div className={`lg:hidden fixed inset-0 bg-black/50 z-[100] transition-opacity ${isFilterOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                                <div className={`absolute left-0 top-0 h-full w-full  bg-white transform transition-transform ${isFilterOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                                    <div className="p-6 space-y-6 overflow-y-auto" style={{ height: 'calc(100vh - 80px)' }}>


                                        {/* Filter Content */}
                                        <div className="flex items-center justify-between  ">
                                            <span className="text-gray-900 font-medium text-lg">Filters</span>
                                            <button onClick={toggleFilter} className="p-2 hover:bg-gray-100 rounded-full text-gray-700">
                                                <i className="fi fi-rr-cross text-lg"></i>
                                            </button>
                                        </div>


                                        {/* Tour Type Filter */}
                                        <div className="space-y-2 relative">
                                            <label className="text-sm font-medium text-gray-700">Tour Type</label>
                                            {filters.tourType && (
                                                <span className="absolute top-2 right-0 w-2 h-2 bg-primary-500 rounded-full"></span>
                                            )}
                                            <Dropdown
                                                key={`tourType-${resetKey}`}
                                                options={tourTypeOptions}
                                                value={filters.tourType}
                                                onChange={(option) => updateFilter("tourType", option)}
                                                placeholder="Select tour type"
                                                className={filters.tourType ? "border-b-1 border-primary-500" : ""}
                                            />
                                        </div>

                                        {/* Price Range Filter */}
                                        <div className="space-y-2 relative">
                                            <label className="text-sm font-medium text-gray-700">Price Range</label>
                                            {filters.priceRange && (
                                                <span className="absolute top-2 right-0 w-2 h-2 bg-primary-500 rounded-full"></span>
                                            )}
                                            <RangeSlider
                                                key={`price-${resetKey}`}
                                                min={1000}
                                                max={50000}
                                                step={1000}
                                                initialValue={filters.priceRange ? filters.priceRange.from : undefined}
                                                onChange={handlePriceRangeChange}
                                                formatDisplay={(val) => {
                                                    if (!val) return "Select price range";
                                                    return `₹${val.toLocaleString()} - ₹${(val + 10000).toLocaleString()}`;
                                                }}
                                                className={filters.priceRange ? "border-b-2 border-primary-500" : ""}
                                            />
                                        </div>

                                        {/* Suitable For Filter */}
                                        <div className="space-y-2 relative">
                                            <label className="text-sm font-medium text-gray-700">Suitable For</label>
                                            {filters.suitableFor && (
                                                <span className="absolute top-2 right-0 w-2 h-2 bg-primary-500 rounded-full"></span>
                                            )}
                                            <Dropdown
                                                key={`suitable-${resetKey}`}
                                                options={suitableForOptions}
                                                value={filters.suitableFor}
                                                onChange={(option) => updateFilter("suitableFor", option)}
                                                placeholder="Select group type"
                                                isLoading={isSuitableForLoading}
                                                className={filters.suitableFor ? "border-b-1 border-primary-500" : ""}
                                            />
                                        </div>

                                        {/* Sort By */}
                                        <div className="space-y-2 relative">
                                            <label className="text-sm font-medium text-gray-700">Sort By</label>
                                            {filters.sortBy && (
                                                <span className="absolute top-2 right-0 w-2 h-2 bg-primary-500 rounded-full"></span>
                                            )}
                                            <Dropdown
                                                key={`sort-${resetKey}`}
                                                options={sortOptions}
                                                value={filters.sortBy}
                                                onChange={(option) => updateFilter("sortBy", option)}
                                                placeholder="Select sorting"
                                                className={filters.sortBy ? "border-b-1 border-primary-500" : ""}
                                            />
                                        </div>
                                    </div>
                                    {/* Bottom Buttons */}
                                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t">
                                        <div className="flex gap-3">
                                            <button
                                                onClick={handleClearAllFilters}
                                                className="flex-1 py-2.5 px-4 rounded-lg border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
                                            >
                                                Clear Filters
                                            </button>
                                            <button
                                                onClick={handleApplyFilters}
                                                className="flex-1 py-2.5 px-4 rounded-lg bg-primary-500 text-white text-sm font-medium hover:bg-primary-600 transition-colors"
                                            >
                                                Apply Now
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        ""
                    )}

                    {/* Packages Grid */}
                    <div className={` ${packages && packages.length > 0 ? 'lg:w-3/4' : 'w-full'}`}>
                        {packages && packages.length > 0 ? (
                            <div className={`grid gap-4 ${mobileLayout === 'grid'
                                    ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'
                                    : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'
                                }`}>
                                {packages.map((pkg) => (
                                    <PackageCard
                                        key={pkg.id}
                                        packageId={pkg.id}
                                        imageSrc={pkg.images[0].image_url}
                                        imageAlt={pkg.name}
                                        title={pkg.name}
                                        duration={`${pkg.total_days}D ${pkg.total_nights}N`}
                                        price={parseFloat(pkg.final_adult_price)}
                                        slotsAvailable={null}
                                        isCertified={false}
                                        date={new Date().toISOString().split("T")[0]}
                                        mobileLayout={mobileLayout}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-16 px-0 text-center  rounded-xl border border-gray-100">
                                <div className="w-16 h-16 mb-4 flex items-center justify-center rounded-full bg-gray-100">
                                    <i className="fi fi-rr-search text-2xl text-gray-400"></i>
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    No Packages Found
                                </h3>
                                <p className="text-gray-500 max-w-md mb-6">
                                    We couldn't find any packages matching your current filters.
                                    {Object.keys(filters).some(key => filters[key]) ? 
                                        "Try adjusting your filters or explore other destinations."
                                     : null}
                                </p>
                                {!Object.keys(filters).some(key => filters[key]) && (
                                    type === "country" ? null : type === "state" ? stateSuggestions({ all: false, type: 'suggestions', restrictedId : stateInfo?.id }) : null
                                )}
                                {Object.keys(filters).some(key => filters[key]) ? (
                                    <button
                                        onClick={clearAllFilters}
                                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                                    >
                                        Clear All Filters
                                    </button>
                                ) : (
                                    ""
                                )}
                            </div>
                        )}
                    </div>




                </div>
            </div>
        </main>
    );
};

ClientWrapper.propTypes = {
    packages: PropTypes.array,
    stateInfo: PropTypes.object,
    stateDestinations: PropTypes.object,
    type: PropTypes.oneOf(['country', 'state', 'destination']).isRequired,
    destinationId: PropTypes.string,
    initialFilters: PropTypes.object,
    featuredDestinations: PropTypes.array,
    countryInfo: PropTypes.object,
    statesData: PropTypes.array,
    fallbackImage: PropTypes.string
};

export default ClientWrapper;