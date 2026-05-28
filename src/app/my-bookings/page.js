'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from "next/navigation";
import PackageBookings from './package/PackageBookings';
import EventBookings from './event/EventBookings';
import AttractionBookings from './attraction/AttractionBookings';
import ActivityBookings from './activity/ActivityBookings';
import RentalBookings from './rental/RentalBookings';

const ALLOWED_TABS = ['packages', 'events', 'attractions', 'activities', 'rentals'];

const tabs = [
    { id: 'packages', label: 'Packages', icon: 'fi fi-rr-backpack', hint: 'Trips & getaways' },
    { id: 'events', label: 'Events', icon: 'fi fi-rr-calendar-star', hint: 'Shows & festivals' },
    { id: 'attractions', label: 'Attractions', icon: 'fi fi-rr-map-marker', hint: 'Places to visit' },
    { id: 'activities', label: 'Activities', icon: 'fi fi-rr-hiking', hint: 'Adventures' },
    { id: 'rentals', label: 'Rentals', icon: 'fi fi-rr-car', hint: 'Cars & rides' },
];

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

    const switchTab = (tabId) => {
        setActiveTab(tabId);
        router.replace(`/my-bookings?tab=${tabId}`, { scroll: false });
    };

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

    const activeMeta = tabs.find((t) => t.id === activeTab);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header band — home typography, no hero image */}
            <section className="relative overflow-hidden bg-white border-b border-gray-100">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-50/70 via-white to-white pointer-events-none" />
                <div className="absolute -top-20 right-0 w-64 h-64 bg-primary-400/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-10 left-0 w-48 h-48 bg-primary-500/5 rounded-full blur-3xl pointer-events-none" />

                <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-8 md:pt-12 md:pb-10">
                    <div className="max-w-3xl">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="w-8 h-[2px] bg-primary-500 rounded-full" />
                            <span className="text-xs tracking-[0.2em] uppercase text-primary-600 font-medium">
                                Your trips
                            </span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-semibold text-gray-900 tracking-tight leading-tight">
                            My{' '}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-400">
                                Bookings
                            </span>
                        </h1>
                        <p className="text-gray-600 mt-3 text-sm md:text-base leading-relaxed max-w-xl">
                            Track payments, view details, and manage everything you&apos;ve booked with Explore World.
                        </p>
                    </div>

                    {/* Category picker — home feature-card style, no photos */}
                    <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                        {tabs.map((tab) => {
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => switchTab(tab.id)}
                                    className={`text-left rounded-2xl p-4 transition-all duration-300 border ${
                                        isActive
                                            ? 'bg-primary-50/80 border-primary-200 shadow-md shadow-primary-500/10 ring-1 ring-primary-500/15'
                                            : 'bg-white/70 backdrop-blur-sm border-gray-100 hover:border-primary-100 hover:shadow-md hover:shadow-primary-500/5'
                                    }`}
                                >
                                    <div
                                        className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 border transition-colors ${
                                            isActive
                                                ? 'bg-primary-500 text-white border-primary-500'
                                                : 'bg-white text-primary-600 border-gray-100 shadow-sm'
                                        }`}
                                    >
                                        <i className={`${tab.icon} text-base`} />
                                    </div>
                                    <p className={`text-sm font-semibold ${isActive ? 'text-primary-800' : 'text-gray-900'}`}>
                                        {tab.label}
                                    </p>
                                    <p className="text-[11px] text-gray-500 mt-0.5 leading-snug">{tab.hint}</p>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Content */}
            <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
                <div className="rounded-[28px] bg-white border border-gray-100 shadow-sm overflow-hidden">
                    {activeMeta ? (
                        <div className="flex items-center gap-3 px-5 sm:px-7 py-5 border-b border-gray-100 bg-gray-50/50">
                            <div className="w-11 h-11 rounded-xl bg-primary-500 text-white flex items-center justify-center shadow-sm shadow-primary-500/20 shrink-0">
                                <i className={`${activeMeta.icon} text-lg`} />
                            </div>
                            <div className="min-w-0">
                                <h2 className="text-base sm:text-lg font-semibold text-gray-900 tracking-tight">
                                    {activeMeta.label}
                                </h2>
                                <p className="text-xs sm:text-sm text-gray-500">
                                    {activeMeta.hint} · all your bookings in one place
                                </p>
                            </div>
                        </div>
                    ) : null}

                    <div className="p-5 sm:p-6 md:p-8 min-h-[380px]">
                        {renderTabContent()}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default MyBookings;
