"use client";

import { useState } from "react";
import Link from "next/link";

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState("profile");

  const tabs = [
    { id: "profile", label: "Profile" },
    { id: "bookings", label: "Bookings" },
    { id: "saved", label: "Saved" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Profile Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-8">
            <div className="flex flex-col items-center gap-3">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-gray-200 overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1568602471122-7832951cc4c5?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80"
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="px-4 py-1.5 text-sm font-medium bg-white border border-gray-300 rounded-full hover:bg-gray-50 transition-colors inline-flex items-center gap-2">
                  <i className="fi fi-rr-upload text-gray-600"></i>
                  Upload picture
                </button>
                <button className="text-red-600 text-sm font-medium hover:text-red-700 transition-colors">
                  Delete
                </button>
              </div>
            </div>
      
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 text-sm font-medium border-b-2 ${
                  activeTab === tab.id
                    ? "border-primary-600 text-primary-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "profile" && (
          <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                  defaultValue="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                  defaultValue="john.doe@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                <input
                  type="tel"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                  defaultValue="+1 (555) 000-0000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                  defaultValue="New York, USA"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <button className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
                Save Changes
              </button>
            </div>
          </div>
        )}

        {activeTab === "bookings" && (
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-gray-900">Hotel Booking #1234</h3>
                  <p className="text-sm text-gray-600">Check-in: Jan 15, 2024</p>
                  <p className="text-sm text-gray-600">Check-out: Jan 20, 2024</p>
                </div>
                <span className="px-3 py-1 text-sm font-medium text-green-800 bg-green-100 rounded-full">
                  Confirmed
                </span>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-gray-900">Flight Booking #5678</h3>
                  <p className="text-sm text-gray-600">Departure: Jan 15, 2024</p>
                  <p className="text-sm text-gray-600">Return: Jan 20, 2024</p>
                </div>
                <span className="px-3 py-1 text-sm font-medium text-yellow-800 bg-yellow-100 rounded-full">
                  Pending
                </span>
              </div>
            </div>
          </div>
        )}

        {activeTab === "saved" && (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="aspect-w-16 aspect-h-9 bg-gray-200">
                <img
                  src="https://images.unsplash.com/photo-1566073771259-6a8506099945"
                  alt="Hotel"
                  className="object-cover w-full h-full"
                />
              </div>
              <div className="p-4">
                <h3 className="font-medium text-gray-900">Luxury Hotel</h3>
                <p className="text-sm text-gray-600">New York, USA</p>
                <div className="mt-2 flex items-center gap-2">
                  <i className="fi fi-rr-star text-yellow-400"></i>
                  <span className="text-sm text-gray-600">4.8 (120 reviews)</span>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="aspect-w-16 aspect-h-9 bg-gray-200">
                <img
                  src="https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9"
                  alt="Restaurant"
                  className="object-cover w-full h-full"
                />
              </div>
              <div className="p-4">
                <h3 className="font-medium text-gray-900">Fine Dining Restaurant</h3>
                <p className="text-sm text-gray-600">San Francisco, USA</p>
                <div className="mt-2 flex items-center gap-2">
                  <i className="fi fi-rr-star text-yellow-400"></i>
                  <span className="text-sm text-gray-600">4.9 (85 reviews)</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
