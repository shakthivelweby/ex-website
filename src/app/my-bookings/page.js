'use client';

import { useState } from 'react';
import PackageBookings from './package/PackageBookings';
import EventBookings from './event/EventBookings';
import AttractionBookings from './attraction/AttractionBookings';

const MyBookings = () => {
    const [activeTab, setActiveTab] = useState('packages');

    const tabs = [
        { id: 'packages', label: 'Packages' },
        { id: 'events', label: 'Events' },
        { id: 'attractions', label: 'Attractions' }
    ];

    const renderTabContent = () => {
        switch (activeTab) {
            case 'packages':
                return <PackageBookings />;
            case 'events':
                return <EventBookings />;
            case 'attractions':
                return <AttractionBookings />;
            default:
                return null;
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
                                    onClick={() => setActiveTab(tab.id)}
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