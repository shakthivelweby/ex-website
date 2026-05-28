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
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white rounded-lg shadow-sm">
                    {/* Header */}
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
                        <p className="text-gray-600 mt-2">Manage and view all your travel bookings</p>
                    </div>

                    {/* Tabs */}
                    <div className="border-b border-gray-200">
                        <nav className="flex space-x-8 px-6" aria-label="Tabs">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => {
                                        setActiveTab(tab.id);
                                        router.replace(`/my-bookings?tab=${tab.id}`, { scroll: false });
                                    }}
                                    className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
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
                    <div className="min-h-[400px]">
                        {renderTabContent()}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MyBookings;