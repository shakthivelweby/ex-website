"use client";

import PackageCard from "@/components/PackageCard";
import Image from "next/image";
import { useState, useEffect } from "react";
import RangeSlider from "@/components/RangeSlider/RangeSlider";
import Dropdown from "@/components/Dropdown/Dropdown";
import Link from "next/link";

const ClientWrapper = ({ packages, stateInfo, stateDestinations, isDestination, destinationId }) => {

    

    const [coverImage, setCoverImage] = useState(stateInfo.cover_image_url);
    const [coverName, setCoverName] = useState(stateInfo.name);
    const [selectedDestination, setSelectedDestination] = useState('all');

 

    // Filter states
    const [filters, setFilters] = useState({
        tourType: "",
        priceRange: "",
        suitableFor: "",
        sortBy: "",
        destination: ""
    });


    useEffect(() => {
        if (isDestination) {

            const destination = stateDestinations.destinations.find(dest => dest.id === parseInt(destinationId));
            const cover = destination.cover_image_url;
            const name = destination.name;
            setCoverImage(cover);
            setCoverName(name);

            setFilters(prev => ({
                ...prev,
                destination: {
                    value: name,
                    label: name
                }
            }));
         
            setSelectedDestination(destinationId);
        } else {
            setCoverImage(stateInfo.cover_image_url);
            setCoverName(stateInfo.name);
        }
    }, [isDestination, destinationId]);

    // Selected destination state
   

    // Reset key for filter components
    const [resetKey, setResetKey] = useState(0);

    // Format destinations for dropdown
    const destinationOptions = stateDestinations.destinations.map(dest => ({
        value: dest.id.toString(),
        label: dest.name
    }));

    // Tour type options
    const tourTypeOptions = [

        { value: "scheduled", label: "Scheduled Tours" },
        { value: "package", label: "Private Packages" }
    ];

    // Suitable for options
    const suitableForOptions = [
        { value: "", label: "All" },
        { value: "family", label: "Family" },
        { value: "friends", label: "Friends" },
        { value: "couple", label: "Couple" },
        { value: "solo", label: "Solo" }
    ];

    // Sort options
    const sortOptions = [
        { value: "", label: "Default" },
        { value: "price_low", label: "Price: Low to High" },
        { value: "price_high", label: "Price: High to Low" },
        { value: "duration_short", label: "Duration: Shortest First" },
        { value: "duration_long", label: "Duration: Longest First" }
    ];

    // Update individual filter values
    const updateFilter = (name, value) => {
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Clear all filters
    const clearAllFilters = () => {
        setFilters({
            tourType: "",
            priceRange: "",
            suitableFor: "",
            sortBy: "",
            destination: ""
        });
        setResetKey(prev => prev + 1);
    };

    // Apply filters
    const applyFilters = () => {
        // Create a clean filters object without empty values
        const cleanFilters = Object.entries(filters).reduce((acc, [key, value]) => {
            if (value) {
                acc[key] = value;
            }
            return acc;
        }, {});

        // Here you would typically make an API call with the filters
        console.log('Applied filters:', cleanFilters);
    };

    return (
        <main className="min-h-screen bg-white">
            {/* Modern Minimalist Banner */}
            <div className="relative h-[60vh] w-full overflow-hidden">
                {/* Background Image with Modern Overlay */}
                <div className="absolute inset-0">
                    <Image
                        src={coverImage}
                        alt={coverName}
                        fill
                        className="object-cover"
                        priority
                    />
                    {/* Subtle Modern Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/60" />
                </div>

                {/* Minimalist Content Layout */}
                <div className="relative h-full container mx-auto px-4">
                    <div className="absolute bottom-[15%] max-w-3xl">
                        <div className="space-y-6">
                            <span className="inline-block text-xs tracking-[0.2em] uppercase text-white/80 font-light">
                                Welcome to {coverName}
                            </span>
                            <h1 className="text-4xl sm:text-6xl md:text-6xl font-light text-white leading-[1.1]">
                                Explore {coverName}
                            </h1>
                            <p className="text-base sm:text-lg text-white/80 font-light max-w-xl leading-relaxed">
                                Discover the perfect blend of tranquil backwaters, misty mountains, and golden beaches in God's Own Country.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Scroll Indicator */}
                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
                    <div className="flex flex-col items-center gap-2">
                        <span className="text-white/60 text-xs tracking-widest uppercase">Scroll</span>
                        <div className="w-[1px] h-8 bg-white/20"></div>
                    </div>
                </div>
            </div>

            {/* Destinations Scroll Section */}
            <div className="container mx-auto px-4 py-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-base font-medium text-gray-900">
                            Popular Destinations
                            <span className="text-sm font-normal text-gray-500 ml-2">
                                in {stateInfo.name}
                            </span>
                        </h3>
                    </div>
                </div>
                <div className="relative">
                    <div className="overflow-x-auto scrollbar-hide">
                        <div className="flex gap-3 pb-2" style={{ minWidth: 'min-content' }}>
                            {/* All Destinations Button */}
                            <Link
                                href={`/packages/${stateInfo.id}`}
                                className="group flex-shrink-0"
                                onClick={() => setSelectedDestination('all')}
                            >
                                <div className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all ${
                                    selectedDestination === 'all' 
                                    ? 'bg-primary-50 border-primary-500' 
                                    : 'bg-white border-gray-200 hover:border-primary-500 hover:bg-primary-50'
                                }`}>
                                    <div className={`w-6 h-6 rounded-full overflow-hidden relative flex items-center justify-center ${
                                        selectedDestination === 'all' 
                                        ? 'bg-primary-100' 
                                        : 'bg-gray-100'
                                    }`}>
                                        <i className={`fi fi-rr-apps text-[10px] ${
                                            selectedDestination === 'all' 
                                            ? 'text-primary-600' 
                                            : 'text-gray-500'
                                        }`}></i>
                                    </div>
                                    <span className={`text-sm font-medium whitespace-nowrap ${
                                        selectedDestination === 'all' 
                                        ? 'text-primary-600' 
                                        : 'text-gray-700 group-hover:text-primary-600'
                                    }`}>
                                        All
                                    </span>
                                </div>
                            </Link>

                            {stateDestinations.destinations.map((destination) => (
                                <Link
                                    key={destination.id}
                                    href={`/packages/${stateInfo.id}?destination=${destination.id}`}
                                    className="group flex-shrink-0"
                                    onClick={() => setSelectedDestination(destination.id)}
                                >
                                    <div className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all ${
                                        selectedDestination == destination.id 
                                        ? 'bg-primary-50 border-primary-500' 
                                        : 'bg-white border-gray-200 hover:border-primary-500 hover:bg-primary-50'
                                    }`}>
                                        <div className="w-6 h-6 rounded-full overflow-hidden relative">
                                            <Image
                                                src={destination.thumb_image_url}
                                                alt={destination.name}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                        <span className={`text-sm font-medium whitespace-nowrap ${
                                            selectedDestination == destination.id 
                                            ? 'text-primary-600' 
                                            : 'text-gray-700 group-hover:text-primary-600'
                                        }`}>
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

            {/* Filters Section */}
            <div className="container mx-auto px-4 py-2">
                {/* Heading Section */}
                <div className="mb-6">
                    <div className="flex flex-col md:flex-row md:items-end md:justify-between">
                        <div>
                            <h2 className="text-xl md:text-2xl font-medium text-gray-900 mb-1">
                                Available Tour Packages
                                <span className="text-primary-600 ml-2 text-lg md:text-xl">({packages.length})</span>
                            </h2>
                            <p className="text-gray-500 text-xs md:text-sm">
                                Handpicked experiences to make your Kerala journey unforgettable
                            </p>
                        </div>
                        
                    </div>
                </div>

                {/* Main Content Layout */}
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Filters Sidebar */}
                    <div className="lg:w-1/4">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6 sticky top-4">
                            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                                <h3 className="font-medium text-gray-900">Filters</h3>
                                <button
                                    onClick={clearAllFilters}
                                    className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                                >
                                    Clear All
                                </button>
                            </div>

                            {/* Where you like to go Filter */}
                            <div className="space-y-2 relative">
                                <label className="text-sm font-medium text-gray-700">Where you like to go?</label>
                                {filters.destination && (
                                    <span className="absolute top-2 right-0 w-2 h-2 bg-primary-500 rounded-full"></span>
                                )}
                                <Dropdown
                                    key={`destination-${resetKey}`}
                                    options={destinationOptions}
                                    value={filters.destination}
                                    onChange={(option) => updateFilter("destination", option)}
                                    placeholder="Select destination"
                                    className={filters.destination ? "border-b-1 border-primary-500" : ""}
                                />
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
                                    initialValue={filters.priceRange}
                                    onChange={(value) => updateFilter("priceRange", value)}
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
                                onClick={applyFilters}
                                className="w-full py-2.5 px-4 rounded-lg bg-primary-500 text-white text-sm font-medium hover:bg-primary-600 transition-colors"
                            >
                                Apply Filters
                            </button>
                        </div>
                    </div>

                    {/* Packages Grid */}
                    <div className="lg:w-3/4">
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {packages.map((pkg) => (
                                <PackageCard
                                    key={pkg.id}
                                    packageId={pkg.id}
                                    imageSrc={pkg.images[0].image_url}
                                    imageAlt={pkg.name}
                                    title={pkg.name}
                                    // startingFrom={}
                                    duration={`${pkg.total_days}D ${pkg.total_nights}N`}
                                    price={parseFloat(pkg.adult_price)}
                                    slotsAvailable={null}
                                    isCertified={false}
                                    date={new Date().toISOString().split("T")[0]}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default ClientWrapper;