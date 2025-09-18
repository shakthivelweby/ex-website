import apiServerMiddleware from "../api/serverMiddleware";

// Mock data for attractions
const mockAttractions = [
  {
    id: 1,
    name: "Gateway of India",
    description: "An iconic monument and tourist attraction in Mumbai, built during the British Raj.",
    location: "Apollo Bandar, Colaba, Mumbai",
    city: "Mumbai",
    latitude: 18.9220,
    longitude: 72.8347,
    price: 1500,
    rating: 4.5,
    review_count: 1250,
    duration: "1-2 hours",
    best_time_to_visit: "Evening",
    features: ["Historical", "Photography", "Free Entry"],
    promoted: true,
    interest_count: 500,
    opening_hours: "24/7",
    address: "Apollo Bandar, Colaba, Mumbai, Maharashtra 400001",
    attraction_category_master: {
      id: 1,
      name: "Historical Monuments",
      slug: "historical-monuments"
    },
    thumb_image: "/images/attractions/card-img.jpg",
    cover_image: "/images/attractions/card-img.jpg"
  },
  {
    id: 2,
    name: "Marine Drive",
    description: "A 3.6 km long boulevard in South Mumbai, known for its scenic beauty and sea view.",
    location: "Marine Drive, Mumbai",
    city: "Mumbai",
    latitude: 18.9440,
    longitude: 72.8230,
    price: 1500,
    rating: 4.7,
    review_count: 2100,
    duration: "2-3 hours",
    best_time_to_visit: "Evening",
    features: ["Scenic View", "Walking", "Free Entry"],
    promoted: true,
    interest_count: 750,
    opening_hours: "24/7",
    address: "Marine Drive, Mumbai, Maharashtra 400020",
    attraction_category_master: {
      id: 2,
      name: "Scenic Spots",
      slug: "scenic-spots"
    },
    thumb_image: "/images/attractions/card-img.jpg",
    cover_image: "/images/attractions/card-img.jpg"
  },
  {
    id: 3,
    name: "Elephanta Caves",
    description: "Ancient rock-cut caves dedicated to Lord Shiva, a UNESCO World Heritage Site.",
    location: "Elephanta Island, Mumbai",
    city: "Mumbai",
    latitude: 18.9583,
    longitude: 72.9306,
    price: 40,
    rating: 4.3,
    review_count: 890,
    duration: "4-5 hours",
    best_time_to_visit: "Morning",
    features: ["Historical", "Boat Ride", "UNESCO Site"],
    promoted: false,
    interest_count: 320,
    opening_hours: "9:00 AM - 5:30 PM",
    address: "Elephanta Island, Mumbai, Maharashtra 400001",
    attraction_category_master: {
      id: 1,
      name: "Historical Monuments",
      slug: "historical-monuments"
    },
    thumb_image: "/images/attractions/card-img.jpg",
    cover_image: "/images/attractions/card-img.jpg"
  },
  {
    id: 4,
    name: "Chhatrapati Shivaji Maharaj Terminus",
    description: "One of Mumbai's most popular beaches, known for street food and sunset views.",
    location: "Juhu, Mumbai",
    city: "Mumbai",
    latitude: 19.1077,
    longitude: 72.8263,
    price: 1500,
    rating: 4.1,
    review_count: 1800,
    duration: "2-3 hours",
    best_time_to_visit: "Evening",
    features: ["Beach", "Street Food", "Free Entry"],
    promoted: false,
    interest_count: 450,
    opening_hours: "24/7",
    address: "Juhu Beach, Juhu, Mumbai, Maharashtra 400049",
    attraction_category_master: {
      id: 3,
      name: "Beaches",
      slug: "beaches"
    },
    thumb_image: "/images/attractions/card-img.jpg",
    cover_image: "/images/attractions/card-img.jpg"
  },
  {
    id: 5,
    name: "Siddhivinayak Temple",
    description: "One of the most famous Hindu temples dedicated to Lord Ganesha.",
    location: "Prabhadevi, Mumbai",
    city: "Mumbai",
    latitude: 19.0160,
    longitude: 72.8300,
    price: 1500,
    rating: 4.6,
    review_count: 3200,
    duration: "1-2 hours",
    best_time_to_visit: "Morning",
    features: ["Religious", "Spiritual", "Free Entry"],
    promoted: true,
    interest_count: 1200,
    opening_hours: "5:30 AM - 10:00 PM",
    address: "Siddhivinayak Temple, Prabhadevi, Mumbai, Maharashtra 400028",
    attraction_category_master: {
      id: 4,
      name: "Religious Sites",
      slug: "religious-sites"
    },
    thumb_image: "/images/attractions/card-img.jpg",
    cover_image: "/images/attractions/card-img.jpg"
  },
  {
    id: 6,
    name: "Sanjay Gandhi National Park",
    description: "A large protected area in Mumbai, home to diverse flora and fauna including leopards.",
    location: "Borivali East, Mumbai",
    city: "Mumbai",
    latitude: 19.2307,
    longitude: 72.9117,
    price: 58,
    rating: 4.2,
    review_count: 650,
    duration: "4-6 hours",
    best_time_to_visit: "Morning",
    features: ["Wildlife", "Nature", "Trekking"],
    promoted: false,
    interest_count: 280,
    opening_hours: "7:30 AM - 6:30 PM",
    address: "Sanjay Gandhi National Park, Borivali East, Mumbai, Maharashtra 400066",
    attraction_category_master: {
      id: 5,
      name: "Nature & Wildlife",
      slug: "nature-wildlife"
    },
    thumb_image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=2000&auto=format&fit=crop",
    cover_image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=2000&auto=format&fit=crop"
  },
  {
    id: 7,
    name: "Chhatrapati Shivaji Maharaj Vastu Sangrahalaya",
    description: "Formerly Prince of Wales Museum, this is Mumbai's premier museum showcasing art and history.",
    location: "Fort, Mumbai",
    city: "Mumbai",
    latitude: 18.9269,
    longitude: 72.8324,
    price: 70,
    rating: 4.4,
    review_count: 1200,
    duration: "2-3 hours",
    best_time_to_visit: "Morning",
    features: ["Museum", "Art", "History"],
    promoted: false,
    interest_count: 380,
    opening_hours: "10:15 AM - 6:00 PM",
    address: "159-161, Mahatma Gandhi Road, Fort, Mumbai, Maharashtra 400023",
    attraction_category_master: {
      id: 6,
      name: "Museums",
      slug: "museums"
    },
    thumb_image: "https://images.unsplash.com/photo-1555529902-1b0a18b8c6b8?q=80&w=2000&auto=format&fit=crop",
    cover_image: "https://images.unsplash.com/photo-1555529902-1b0a18b8c6b8?q=80&w=2000&auto=format&fit=crop"
  },
  {
    id: 8,
    name: "Essel World",
    description: "Mumbai's largest amusement park with thrilling rides and entertainment for all ages.",
    location: "Gorai, Mumbai",
    city: "Mumbai",
    latitude: 19.2307,
    longitude: 72.9117,
    price: 1200,
    rating: 4.0,
    review_count: 2100,
    duration: "6-8 hours",
    best_time_to_visit: "Morning",
    features: ["Amusement Park", "Rides", "Entertainment"],
    promoted: true,
    interest_count: 890,
    opening_hours: "10:00 AM - 8:00 PM",
    address: "Essel World, Gorai, Mumbai, Maharashtra 400091",
    attraction_category_master: {
      id: 7,
      name: "Entertainment",
      slug: "entertainment"
    },
    thumb_image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=2000&auto=format&fit=crop",
    cover_image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=2000&auto=format&fit=crop"
  },
  {
    id: 9,
    name: "Powai Lake",
    description: "A man-made lake surrounded by lush greenery, perfect for morning walks and bird watching.",
    location: "Powai, Mumbai",
    city: "Mumbai",
    latitude: 19.1176,
    longitude: 72.9060,
    price: 0,
    rating: 4.1,
    review_count: 450,
    duration: "1-2 hours",
    best_time_to_visit: "Morning",
    features: ["Lake", "Nature", "Free Entry"],
    promoted: false,
    interest_count: 150,
    opening_hours: "24/7",
    address: "Powai Lake, Powai, Mumbai, Maharashtra 400076",
    attraction_category_master: {
      id: 2,
      name: "Scenic Spots",
      slug: "scenic-spots"
    },
    thumb_image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=2000&auto=format&fit=crop",
    cover_image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=2000&auto=format&fit=crop"
  },
  {
    id: 10,
    name: "Bandra-Worli Sea Link",
    description: "An architectural marvel connecting Bandra and Worli, offering stunning views of the Arabian Sea.",
    location: "Bandra to Worli, Mumbai",
    city: "Mumbai",
    latitude: 19.0400,
    longitude: 72.8200,
    price: 0,
    rating: 4.6,
    review_count: 1800,
    duration: "30 minutes",
    best_time_to_visit: "Evening",
    features: ["Architecture", "Scenic Drive", "Free Entry"],
    promoted: true,
    interest_count: 650,
    opening_hours: "24/7",
    address: "Bandra-Worli Sea Link, Mumbai, Maharashtra",
    attraction_category_master: {
      id: 2,
      name: "Scenic Spots",
      slug: "scenic-spots"
    },
    thumb_image: "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?q=80&w=2000&auto=format&fit=crop",
    cover_image: "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?q=80&w=2000&auto=format&fit=crop"
  },
  {
    id: 11,
    name: "Haji Ali Dargah",
    description: "A famous mosque and dargah located on an islet off the coast of Worli in Mumbai.",
    location: "Worli, Mumbai",
    city: "Mumbai",
    latitude: 19.0250,
    longitude: 72.8200,
    price: 0,
    rating: 4.3,
    review_count: 2800,
    duration: "1-2 hours",
    best_time_to_visit: "Evening",
    features: ["Religious", "Architecture", "Free Entry"],
    promoted: false,
    interest_count: 420,
    opening_hours: "5:30 AM - 10:00 PM",
    address: "Haji Ali Dargah, Worli, Mumbai, Maharashtra 400018",
    attraction_category_master: {
      id: 4,
      name: "Religious Sites",
      slug: "religious-sites"
    },
    thumb_image: "https://images.unsplash.com/photo-1587474260584-136574528ed5?q=80&w=2000&auto=format&fit=crop",
    cover_image: "https://images.unsplash.com/photo-1587474260584-136574528ed5?q=80&w=2000&auto=format&fit=crop"
  },
  {
    id: 12,
    name: "Versova Beach",
    description: "A clean and peaceful beach in Mumbai, perfect for sunset views and beach activities.",
    location: "Versova, Mumbai",
    city: "Mumbai",
    latitude: 19.1234,
    longitude: 72.8123,
    price: 0,
    rating: 4.2,
    review_count: 950,
    duration: "2-3 hours",
    best_time_to_visit: "Evening",
    features: ["Beach", "Sunset", "Free Entry"],
    promoted: false,
    interest_count: 280,
    opening_hours: "24/7",
    address: "Versova Beach, Versova, Mumbai, Maharashtra 400061",
    attraction_category_master: {
      id: 3,
      name: "Beaches",
      slug: "beaches"
    },
    thumb_image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2000&auto=format&fit=crop",
    cover_image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2000&auto=format&fit=crop"
  },
  {
    id: 13,
    name: "Adventure Island",
    description: "Thrilling adventure park with water rides, roller coasters, and family entertainment.",
    location: "Rohini, Delhi",
    city: "Delhi",
    latitude: 28.7041,
    longitude: 77.1025,
    price: 1500,
    rating: 4.1,
    review_count: 3200,
    duration: "6-8 hours",
    best_time_to_visit: "Morning",
    features: ["Adventure", "Water Rides", "Thrills"],
    promoted: true,
    interest_count: 1200,
    opening_hours: "10:00 AM - 7:00 PM",
    address: "Adventure Island, Rohini, Delhi, 110085",
    attraction_category_master: {
      id: 8,
      name: "Adventure",
      slug: "adventure"
    },
    thumb_image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=2000&auto=format&fit=crop",
    cover_image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=2000&auto=format&fit=crop"
  },
  {
    id: 14,
    name: "Red Fort",
    description: "A historic fort complex in Delhi, built by Mughal emperor Shah Jahan, now a UNESCO World Heritage Site.",
    location: "Old Delhi, Delhi",
    city: "Delhi",
    latitude: 28.6562,
    longitude: 77.2410,
    price: 35,
    rating: 4.5,
    review_count: 4500,
    duration: "2-3 hours",
    best_time_to_visit: "Morning",
    features: ["Historical", "UNESCO Site", "Architecture"],
    promoted: true,
    interest_count: 1800,
    opening_hours: "9:30 AM - 4:30 PM",
    address: "Red Fort, Netaji Subhash Marg, Lal Qila, Old Delhi, Delhi 110006",
    attraction_category_master: {
      id: 1,
      name: "Historical Monuments",
      slug: "historical-monuments"
    },
    thumb_image: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?q=80&w=2000&auto=format&fit=crop",
    cover_image: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?q=80&w=2000&auto=format&fit=crop"
  },
  {
    id: 15,
    name: "Lotus Temple",
    description: "A Bahá'í House of Worship known for its flowerlike architecture, open to all religions.",
    location: "Kalkaji, Delhi",
    city: "Delhi",
    latitude: 28.5535,
    longitude: 77.2588,
    price: 0,
    rating: 4.4,
    review_count: 3200,
    duration: "1-2 hours",
    best_time_to_visit: "Morning",
    features: ["Religious", "Architecture", "Free Entry"],
    promoted: false,
    interest_count: 750,
    opening_hours: "9:00 AM - 7:00 PM",
    address: "Lotus Temple, Kalkaji, New Delhi, Delhi 110019",
    attraction_category_master: {
      id: 4,
      name: "Religious Sites",
      slug: "religious-sites"
    },
    thumb_image: "https://images.unsplash.com/photo-1587474260584-136574528ed5?q=80&w=2000&auto=format&fit=crop",
    cover_image: "https://images.unsplash.com/photo-1587474260584-136574528ed5?q=80&w=2000&auto=format&fit=crop"
  }
];

const mockCategories = [
  {
    id: 1,
    name: "Historical Monuments",
    slug: "historical-monuments",
    icon: "fi fi-rr-castle"
  },
  {
    id: 2,
    name: "Scenic Spots",
    slug: "scenic-spots",
    icon: "fi fi-rr-mountain"
  },
  {
    id: 3,
    name: "Beaches",
    slug: "beaches",
    icon: "fi fi-rr-beach"
  },
  {
    id: 4,
    name: "Religious Sites",
    slug: "religious-sites",
    icon: "fi fi-rr-church"
  },
  {
    id: 5,
    name: "Nature & Wildlife",
    slug: "nature-wildlife",
    icon: "fi fi-rr-tree"
  },
  {
    id: 6,
    name: "Museums",
    slug: "museums",
    icon: "fi fi-rr-museum"
  },
  {
    id: 7,
    name: "Adventure",
    slug: "adventure",
    icon: "fi fi-rr-rocket"
  },
  {
    id: 8,
    name: "Entertainment",
    slug: "entertainment",
    icon: "fi fi-rr-music"
  }
];

const mockLocations = [
  {
    id: 1,
    name: "Mumbai",
    slug: "mumbai",
    latitude: 19.0760,
    longitude: 72.8777
  },
  {
    id: 2,
    name: "Delhi",
    slug: "delhi",
    latitude: 28.7041,
    longitude: 77.1025
  },
  {
    id: 3,
    name: "Bangalore",
    slug: "bangalore",
    latitude: 12.9716,
    longitude: 77.5946
  },
  {
    id: 4,
    name: "Chennai",
    slug: "chennai",
    latitude: 13.0827,
    longitude: 80.2707
  },
  {
    id: 5,
    name: "Kolkata",
    slug: "kolkata",
    latitude: 22.5726,
    longitude: 88.3639
  },
  {
    id: 6,
    name: "Pune",
    slug: "pune",
    latitude: 18.5204,
    longitude: 73.8567
  }
];

// get all attraction categories
export const getAttractionCategories = async () => {
  // For now, return mock data. Later replace with actual API call
  return {
    data: mockCategories,
    success: true,
    message: "Categories fetched successfully"
  };
  
  // Uncomment when API is ready
  // const response = await apiServerMiddleware.get("/attraction-categories");
  // console.log("Attraction categories :", response.data);
  // return response.data;
}

// get all locations
export const getAttractionLocations = async () => {
  // For now, return mock data. Later replace with actual API call
  return {
    data: mockLocations,
    success: true,
    message: "Locations fetched successfully"
  };
  
  // Uncomment when API is ready
  // const response = await apiServerMiddleware.get("/attraction-locations");
  // return response.data;
}

// Helper function to parse date parameter
const parseDateParameter = (dateParam) => {
  if (!dateParam) return null;
  
  const today = new Date();
  
  switch (dateParam) {
    case "today":
      const todayDate = today.toISOString().split('T')[0];
      return todayDate;
    case "tomorrow":
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      const tomorrowDate = tomorrow.toISOString().split('T')[0];
      return tomorrowDate;
    case "weekend":
      // Find next Saturday
      const daysUntilSaturday = (6 - today.getDay() + 7) % 7;
      const weekend = new Date(today);
      weekend.setDate(today.getDate() + daysUntilSaturday);
      const weekendDate = weekend.toISOString().split('T')[0];
      return weekendDate;
    default:
      // If it's a custom date (YYYY-MM-DD format), return as is
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
        return dateParam;
      }
      return null;
  }
};

// Filter attractions based on criteria
const filterAttractions = (attractions, filters) => {
  return attractions.filter(attraction => {
    // Category filter
    if (filters.category && attraction.attraction_category_master?.slug !== filters.category) {
      return false;
    }
    
    // Location filter (by city)
    if (filters.location && attraction.city.toLowerCase() !== filters.location.toLowerCase()) {
      return false;
    }
    
    // Rating filter
    if (filters.rating && attraction.rating < parseFloat(filters.rating)) {
      return false;
    }
    
    // Price range filter
    if (filters.price_from && attraction.price < parseFloat(filters.price_from)) {
      return false;
    }
    if (filters.price_to && attraction.price > parseFloat(filters.price_to)) {
      return false;
    }
    
    // Coordinates filter (for nearby attractions)
    if (filters.longitude && filters.latitude) {
      // Simple distance calculation (you might want to implement proper geolocation filtering)
      const distance = Math.sqrt(
        Math.pow(attraction.latitude - parseFloat(filters.latitude), 2) +
        Math.pow(attraction.longitude - parseFloat(filters.longitude), 2)
      );
      // Filter attractions within 0.1 degrees (roughly 11km)
      if (distance > 0.1) {
        return false;
      }
    }
    
    return true;
  });
};

// get attractions with filters
export const list = async (filters = {}) => {
  // For now, return mock data with filtering. Later replace with actual API call
  const filteredAttractions = filterAttractions(mockAttractions, filters);
  
  return {
    data: filteredAttractions,
    success: true,
    message: "Attractions fetched successfully",
    total: filteredAttractions.length
  };
  
  // Uncomment when API is ready
  // const params = new URLSearchParams();
  
  // // Add filters to query parameters
  // if (filters.location) params.append("location", filters.location);
  // if (filters.category) params.append("category", filters.category);
  // if (filters.rating) params.append("rating", filters.rating);
  
  // // Parse and add date parameter
  // if (filters.date) {
  //   const parsedDate = parseDateParameter(filters.date);
  //   if (parsedDate) {
  //     params.append("date", parsedDate);
  //   }
  // }
  
  // if (filters.longitude) params.append("longitude", filters.longitude);
  // if (filters.latitude) params.append("latitude", filters.latitude);
  // if (filters.price_from) params.append("price_from", filters.price_from);
  // if (filters.price_to) params.append("price_to", filters.price_to);
  
  // const queryString = params.toString();
  // const url = queryString ? `/attractions?${queryString}` : "/attractions";
  // const response = await apiServerMiddleware.get(url);   
  // return response.data; 
}
