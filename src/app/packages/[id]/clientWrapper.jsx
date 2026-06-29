"use client";

import PackageCard from "@/components/PackageCard";
import PackageFilters from "@/components/PackageFilters/PackageFilters";
import Image from "next/image";
import ChipThumbImage from "@/components/common/ChipThumbImage";
import ListingsEmptyState from "@/components/common/ListingsEmptyState";
import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { suitableFor } from "./service";
import { useQuery } from "@tanstack/react-query";
import PropTypes from "prop-types";
import Popup from "@/components/Popup";

const ClientWrapper = ({ packages, stateInfo, stateDestinations, type, destinationId, initialFilters, featuredDestinations, countryInfo, statesData, fallbackImage }) => {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [coverImage, setCoverImage] = useState(
        type === "destination" ? stateDestinations?.destinations?.find(d => d.id === parseInt(destinationId))?.cover_image_url :
        type === "state" ? stateInfo?.cover_image_url :
        countryInfo?.image_url || fallbackImage.fallbackL
    );
    const [coverName, setCoverName] = useState('');
    const [selectedDestination, setSelectedDestination] = useState("all");

    const { data: suitableForData, isLoading: isSuitableForLoading } = useQuery({
        queryKey: ["suitableFor", stateInfo?.id],
        queryFn: () => suitableFor(stateInfo.id),
        enabled: Boolean(stateInfo?.id),
    });

    const suitableForOptions = useMemo(() => {
        if (!suitableForData?.data) return [];
        return suitableForData.data.map((item) => ({
            value: item.id.toString(),
            label: item.name,
        }));
    }, [suitableForData]);

    const destinationOptions = useMemo(() => {
        if (!stateDestinations?.destinations) return [];
        return stateDestinations.destinations.map((dest) => ({
            value: dest.id.toString(),
            label: dest.name,
        }));
    }, [stateDestinations?.destinations]);

    const buildInitialFilters = () => ({
        tour_type: initialFilters?.tourType || "",
        price_from: initialFilters?.price_range_from || "",
        price_to: initialFilters?.price_range_to || "",
        suitable_id: initialFilters?.suitableFor || "",
        sort_by_price: initialFilters?.sortBy || "",
        destination: "",
    });

    const [filters, setFilters] = useState(buildInitialFilters);

    // set cover image and name based on type
    useEffect(() => {
        switch (type) {
            case "country":
                if (countryInfo) {
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

    useEffect(() => {
        const destinationParam = searchParams.get("destination");
        setFilters((prev) => ({
            ...prev,
            destination: destinationParam || "",
        }));
    }, [searchParams]);

    // Keep selected destination in sync with URL
    useEffect(() => {
        const destinationParam = searchParams.get('destination');
        if (destinationParam) {
            setSelectedDestination(parseInt(destinationParam));
        } else {
            setSelectedDestination('all');
        }
    }, [searchParams]);

    const updateURL = (newFilters) => {
        const params = new URLSearchParams(searchParams);

        if (type === "state") {
            params.set("state", stateInfo?.id.toString());
        }
        if (type === "destination" && destinationId) {
            params.set("state", stateInfo?.id.toString());
            params.set("destination", destinationId);
        }

        if (newFilters.tour_type) {
            params.set("tour_type", newFilters.tour_type);
        } else {
            params.delete("tour_type");
        }

        if (newFilters.suitable_id) {
            params.set("suitable_id", newFilters.suitable_id);
        } else {
            params.delete("suitable_id");
        }

        if (newFilters.sort_by_price) {
            params.set("sort_by_price", newFilters.sort_by_price);
        } else {
            params.delete("sort_by_price");
        }

        if (newFilters.price_from && newFilters.price_to) {
            params.set("price_range_from", newFilters.price_from);
            params.set("price_range_to", newFilters.price_to);
        } else {
            params.delete("price_range_from");
            params.delete("price_range_to");
        }

        if (type === "state") {
            if (newFilters.destination) {
                params.set("destination", newFilters.destination);
            } else {
                params.delete("destination");
            }
        }

        router.push(`${pathname}?${params.toString()}`, { scroll: false });
    };

    const handleFilterChange = (newFilters) => {
        setFilters(newFilters);
        updateURL(newFilters);
    };

    const clearAllFilters = () => {
        const cleared = buildInitialFilters();
        setFilters(cleared);
        updateURL(cleared);
    };

    const hasActiveFilters = () =>
        Object.entries(filters).some(([key, value]) => {
            if (type !== "state" && key === "destination") return false;
            return Boolean(value);
        });

    const toggleFilter = () => {
        setIsFilterOpen(!isFilterOpen);
        document.body.style.overflow = !isFilterOpen ? "hidden" : "unset";
    };

    const closeFilter = () => {
        setIsFilterOpen(false);
        document.body.style.overflow = "unset";
    };

    const handleDestinationSelect = (destinationId) => {
        setSelectedDestination(destinationId);
        // Update URL with the selected destination
        const params = new URLSearchParams(searchParams);

        // Set the state ID instead of 'true'
        if (stateInfo?.id) {
            params.set('state', stateInfo.id.toString());
        }

        if (destinationId === "all") {
            params.delete("destination");
            setFilters((prev) => ({ ...prev, destination: "" }));
        } else {
            params.set("destination", destinationId);
            setFilters((prev) => ({
                ...prev,
                destination: destinationId.toString(),
            }));
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
                                        <ChipThumbImage
                                            src={state.thumb_image_url}
                                            filename={state.thumb_image}
                                            alt={state.name}
                                            iconClass="fi fi-rr-map"
                                        />
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
                                        <ChipThumbImage
                                            src={destination.thumb_image_url}
                                            filename={destination.thumb_image}
                                            alt={destination.name}
                                            iconClass="fi fi-rr-map-marker"
                                        />
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
            <div className="relative h-[50vh] md:h-[58vh] w-full overflow-hidden">
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
                    {type !== "destination" && (
                        <>
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
                        </>
                        )}

                   

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
            <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
                <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
                    <div className="hidden lg:block w-full lg:w-[300px] xl:w-[320px] shrink-0">
                        <div className="sticky top-24">
                            <PackageFilters
                                layout="sidebar"
                                initialFilters={filters}
                                onFilterChange={handleFilterChange}
                                suitableForOptions={suitableForOptions}
                                destinationOptions={destinationOptions}
                                showDestination={type === "state"}
                                suitableForLoading={isSuitableForLoading}
                            />
                        </div>
                    </div>

                    <div className="flex-grow min-w-0">
                        <div className="flex items-center justify-between mb-4 sm:mb-6">
                            <div className="flex items-center gap-3 flex-wrap">
                                <h2 className="text-sm sm:text-base font-medium text-gray-900">
                                    All Packages
                                </h2>
                                <span className="text-xs sm:text-sm text-gray-500">
                                    {packages?.length || 0}{" "}
                                    {(packages?.length || 0) === 1 ? "package" : "packages"} available
                                </span>
                            </div>

                            <div className="lg:hidden shrink-0">
                                <button
                                    type="button"
                                    onClick={toggleFilter}
                                    className="relative flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-900 text-white shadow-sm hover:bg-black transition-colors text-sm"
                                >
                                    <i className="fi fi-rr-settings-sliders text-[13px]" />
                                    <span>Filters</span>
                                    {hasActiveFilters() ? (
                                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-primary-500 rounded-full border-2 border-white" />
                                    ) : null}
                                </button>
                            </div>
                        </div>

                        <Popup
                            isOpen={isFilterOpen}
                            onClose={closeFilter}
                            title="Filters"
                            pos="right"
                            className="lg:hidden"
                            draggable
                        >
                            <div className="p-6">
                                <PackageFilters
                                    layout="mobile"
                                    initialFilters={filters}
                                    onFilterChange={handleFilterChange}
                                    suitableForOptions={suitableForOptions}
                                    destinationOptions={destinationOptions}
                                    showDestination={type === "state"}
                                    suitableForLoading={isSuitableForLoading}
                                    onClose={closeFilter}
                                />
                            </div>
                        </Popup>

                        {packages && packages.length > 0 ? (
                            <div className="grid grid-cols-1 items-stretch gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-2 xl:grid-cols-3">
                                {packages.map((pkg) => (
                                    <PackageCard
                                        key={pkg.id}
                                        package={{
                                            id: pkg.id,
                                            title: pkg.name,
                                            image: pkg.images?.[0]?.image_url,
                                            totalDays: pkg.total_days,
                                            totalNights: pkg.total_nights,
                                            price: parseFloat(pkg.final_adult_price),
                                            childPrice: parseFloat(pkg.final_child_price),
                                            startingFrom: pkg.starting_location,
                                            pickupPoint: pkg.pickup_point,
                                            tourType: pkg.tour_type,
                                            minMembers: pkg.minimum_members,
                                            maxMembers: pkg.maximum_members,
                                            date: new Date().toISOString().split("T")[0],
                                        }}
                                    />
                                ))}
                            </div>
                        ) : (
                            <ListingsEmptyState
                                icon="fi fi-rr-umbrella-beach"
                                title="No packages found"
                                hasActiveFilters={hasActiveFilters()}
                                onClearFilters={clearAllFilters}
                                description={
                                    hasActiveFilters()
                                        ? "Try adjusting your filters or explore other destinations."
                                        : "We couldn't find packages for this destination yet."
                                }
                            />
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