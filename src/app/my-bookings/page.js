'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from "next/navigation";
import PackageBookings from './package/PackageBookings';
import EventBookings from './event/EventBookings';
import AttractionBookings from './attraction/AttractionBookings';
import ActivityBookings from './activity/ActivityBookings';
import RentalBookings from './rental/RentalBookings';

const ALLOWED_TABS = ['packages', 'events', 'attractions', 'activities', 'rentals'];

const MyBookings = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const tabFromUrl = searchParams.get("tab");
    const initialTab = ALLOWED_TABS.includes(tabFromUrl) ? tabFromUrl : "packages";
    const [activeTab, setActiveTab] = useState(initialTab);

    useEffect(() => {
        const t = searchParams.get("tab");
        if (t && ALLOWED_TABS.includes(t)) setActiveTab(t);
    }, [searchParams]);

    const tabs = [
        { id: 'packages', label: 'Packages' },
        { id: 'events', label: 'Events' },
        { id: 'attractions', label: 'Attractions' },
        { id: 'activities', label: 'Activities' },
        { id: 'rentals', label: 'Rentals' },
    ];

    const renderTabContent = () => {
        switch (activeTab) {
            case 'packages':
                return <PackageBookings />;
            case 'events':
                return <EventBookings />;
            case 'attractions':
                return <AttractionBookings />;
            case 'activities':
                return <ActivityBookings />;
            case 'rentals':
                return <RentalBookings />;
            default:
                return <PackageBookings />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-4 sm:pb-8">
            <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
                <div className="bg-white rounded-xl sm:rounded-lg shadow-sm overflow-hidden">
                    {/* Header */}
                    <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
                        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">My Bookings</h1>
                        <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">
                            Manage and view all your travel bookings
                        </p>
                    </div>

                    {/* Tabs */}
                    <div className="border-b border-gray-200">
                        <nav
                            className="flex gap-0.5 sm:gap-2 overflow-x-auto px-3 sm:px-6 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                            aria-label="Tabs"
                        >
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => {
                                        setActiveTab(tab.id);
                                        router.replace(`/my-bookings?tab=${tab.id}`, { scroll: false });
                                    }}
                                    className={`shrink-0 py-3 sm:py-4 px-3 sm:px-4 border-b-2 font-medium text-xs sm:text-sm transition-colors duration-200 whitespace-nowrap ${
                                        activeTab === tab.id
                                            ? 'border-blue-500 text-blue-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* Tab Content */}
                    <div className="min-h-[280px] sm:min-h-[400px]">
                        {renderTabContent()}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MyBookings;
