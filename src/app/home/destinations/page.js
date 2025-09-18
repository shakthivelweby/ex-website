"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import DestinationCard from "@/components/DestinationCard";

export default function DestinationsPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = [
    { id: "all", name: "All Destinations", count: 20 },
    { id: "trending", name: "Trending", count: 8 },
    { id: "popular", name: "Popular", count: 12 },
    { id: "new", name: "New", count: 5 }
  ];

  const destinations = [
    { 
      name: "Uttar Pradesh", 
      description: "Discover amazing tour packages", 
      image: "https://images.unsplash.com/photo-1564507592333-c60657eea523?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", 
      packageCount: 2,
      trending: true,
      category: "trending"
    },
    { 
      name: "Delhi", 
      description: "Discover amazing tour packages", 
      image: "https://images.unsplash.com/photo-1587474260584-136574508ed4?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", 
      packageCount: 1,
      category: "trending"
    },
    { 
      name: "Himachal Pradesh", 
      description: "Discover amazing tour packages", 
      image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", 
      packageCount: 5,
      category: "trending"
    },
    { 
      name: "Gujarat", 
      description: "Discover amazing tour packages", 
      image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", 
      packageCount: 3,
      category: "trending"
    },
    { 
      name: "Rajasthan", 
      description: "Land of kings and palaces", 
      image: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", 
      packageCount: 4,
      category: "trending"
    },
    { 
      name: "Kerala", 
      description: "God's own country", 
      image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", 
      packageCount: 6,
      category: "trending"
    },
    { 
      name: "Maharashtra", 
      description: "Gateway to India", 
      image: "https://images.unsplash.com/photo-1564507592333-c60657eea523?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", 
      packageCount: 3,
      category: "trending"
    },
    { 
      name: "Tamil Nadu", 
      description: "Land of temples", 
      image: "https://images.unsplash.com/photo-1587474260584-136574508ed4?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", 
      packageCount: 4,
      category: "new"
    }
  ];

  const filteredDestinations = selectedCategory === "all" 
    ? destinations 
    : destinations.filter(dest => dest.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Destinations</h1>
              <p className="text-gray-600 mt-1">Explore amazing places around the world</p>
            </div>
            <Link 
              href="/home" 
              className="flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium"
            >
              <i className="fi fi-rr-arrow-left"></i>
              Back to Home
            </Link>
          </div>
        </div>
      </div>

      {/* Category Filters */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4 overflow-x-auto">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  selectedCategory === category.id
                    ? 'bg-primary-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.name} ({category.count})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Destinations Grid */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredDestinations.map((destination) => (
            <div key={destination.name} className="w-full">
              <DestinationCard destination={destination} />
            </div>
          ))}
        </div>

        {filteredDestinations.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">
              <i className="fi fi-rr-search"></i>
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">No destinations found</h3>
            <p className="text-gray-600">Try selecting a different category or check back later.</p>
          </div>
        )}
      </div>
    </div>
  );
}
