import apiServerMiddleware from "../api/serverMiddleware";

// Mock/Dummy Activities Data for testing
const mockActivities = [
  {
    id: 1,
    name: "River Rafting Adventure",
    description: "Experience the thrill of white water rafting in the pristine rivers. Perfect for adventure enthusiasts seeking an adrenaline rush.",
    location: "jammu and kashmir",
    city: "jammu and kashmir",
    category: "Adventure",
    activity_category_master: { name: "Adventure Sports", slug: "adventure-sports" },
    image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800",
    thumb_image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800",
    cover_image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800",
    price: {
      rate_type: "pax",
      adult_price: 2500,
      full_rate: 2500
    },
    rating: 4.8,
    review_count: 342,
    start_time: "09:00:00",
    best_time_to_visit: "Morning",
    features: ["Safety Equipment", "Expert Guide", "Photography"],
    promoted: true,
    popular: "1",
    recommended: "0",
    interest_count: 156,
    opening_hours: "9:00 AM - 6:00 PM",
    address: "jammu and kashmir, India",
    latitude: 30.0869,
    longitude: 78.2676
  },
  {
    id: 2,
    name: "Paragliding Experience",
    description: "Soar through the skies with breathtaking views of the mountains. A once-in-a-lifetime experience for thrill seekers.",
    location: "Bir Billing",
    city: "Bir Billing",
    category: "Adventure",
    activity_category_master: { name: "Adventure Sports", slug: "adventure-sports" },
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
    thumb_image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
    cover_image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
    price: {
      rate_type: "pax",
      adult_price: 600,
      full_rate: 600
    },
    rating: 4.9,
    review_count: 521,
    start_time: "07:00:00",
    best_time_to_visit: "Morning",
    features: ["Certified Instructor", "Safety Gear", "Video Recording"],
    promoted: false,
    popular: "1",
    recommended: "1",
    interest_count: 289,
    opening_hours: "7:00 AM - 5:00 PM",
    address: "Bir Billing, Himachal Pradesh",
    latitude: 32.0621,
    longitude: 76.7460
  },
  {
    id: 3,
    name: "Scuba Diving Session",
    description: "Explore the underwater world with professional scuba diving. Discover marine life and coral reefs.",
    location: "Andaman Islands",
    city: "Port Blair",
    category: "Water Sports",
    activity_category_master: { name: "Water Sports", slug: "water-sports" },
    image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800",
    thumb_image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800",
    cover_image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800",
    price: {
      rate_type: "pax",
      adult_price: 4500,
      full_rate: 4500
    },
    rating: 4.7,
    review_count: 234,
    start_time: "10:00:00",
    best_time_to_visit: "Morning",
    features: ["PADI Certified", "Equipment Included", "Underwater Photography"],
    promoted: true,
    popular: "0",
    recommended: "1",
    interest_count: 178,
    opening_hours: "10:00 AM - 4:00 PM",
    address: "Port Blair, Andaman Islands",
    latitude: 11.6234,
    longitude: 92.7265
  },
  {
    id: 4,
    name: "Hot Air Balloon Ride",
    description: "Float above the scenic landscape in a hot air balloon. Perfect for romantic outings and special occasions.",
    location: "Jaipur",
    city: "Jaipur",
    category: "Leisure",
    activity_category_master: { name: "Leisure Activities", slug: "leisure-activities" },
    image: "https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=800",
    thumb_image: "https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=800",
    cover_image: "https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=800",
    price: {
      rate_type: "pax",
      adult_price: 1200,
      full_rate: 1200
    },
    rating: 4.6,
    review_count: 189,
    start_time: "06:00:00",
    best_time_to_visit: "Morning",
    features: ["Sunrise View", "Champagne", "Certificate"],
    promoted: false,
    popular: "0",
    recommended: "0",
    interest_count: 95,
    opening_hours: "6:00 AM - 8:00 AM",
    address: "Jaipur, Rajasthan",
    latitude: 26.9124,
    longitude: 75.7873
  },
  {
    id: 5,
    name: "Rock Climbing Course",
    description: "Learn rock climbing from expert instructors. Suitable for beginners and intermediate climbers.",
    location: "Manali",
    city: "Manali",
    category: "Adventure",
    activity_category_master: { name: "Adventure Sports", slug: "adventure-sports" },
    image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800",
    thumb_image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800",
    cover_image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800",
    price: {
      rate_type: "full",
      full_rate: 3200
    },
    rating: 4.5,
    review_count: 156,
    start_time: "08:00:00",
    best_time_to_visit: "Morning",
    features: ["Equipment Provided", "Certified Trainer", "Safety First"],
    promoted: false,
    popular: "1",
    recommended: "0",
    interest_count: 123,
    opening_hours: "8:00 AM - 6:00 PM",
    address: "Manali, Himachal Pradesh",
    latitude: 32.2396,
    longitude: 77.1887
  },
  {
    id: 6,
    name: "Yoga & Meditation Retreat",
    description: "Rejuvenate your mind and body with yoga and meditation sessions in a serene environment.",
    location: "Rishikesh",
    city: "Rishikesh",
    category: "Wellness",
    activity_category_master: { name: "Wellness", slug: "wellness" },
    image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800",
    thumb_image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800",
    cover_image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800",
    price: {
      rate_type: "full",
      full_rate: 1500
    },
    rating: 4.9,
    review_count: 456,
    start_time: "06:30:00",
    best_time_to_visit: "Morning",
    features: ["Expert Instructor", "Peaceful Environment", "Healthy Meals"],
    promoted: true,
    popular: "0",
    recommended: "1",
    interest_count: 312,
    opening_hours: "6:30 AM - 8:00 PM",
    address: "Rishikesh, Uttarakhand",
    latitude: 30.0869,
    longitude: 78.2676
  },
  {
    id: 7,
    name: "Bungee Jumping",
    description: "Experience the ultimate adrenaline rush with bungee jumping from great heights.",
    location: "Rishikesh",
    city: "Rishikesh",
    category: "Adventure",
    activity_category_master: { name: "Adventure Sports", slug: "adventure-sports" },
    image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800",
    thumb_image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800",
    cover_image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800", 
    price: {
      rate_type: "pax",
      adult_price: 850,
      full_rate: 850
    },
    rating: 4.8,
    review_count: 678,
    start_time: "09:30:00",
    best_time_to_visit: "Morning",
    features: ["Safety Certified", "Professional Setup", "Video Recording"],
    promoted: true,
    popular: "1",
    recommended: "1",
    interest_count: 445,
    opening_hours: "9:30 AM - 5:00 PM",
    address: "Rishikesh, Uttarakhand",
    latitude: 30.0869,
    longitude: 78.2676
  },
  {
    id: 8,
    name: "Camel Safari",
    description: "Explore the desert on a camel safari. Experience the traditional way of desert travel.",
    location: "Jaisalmer",
    city: "Jaisalmer",
    category: "Cultural",
    activity_category_master: { name: "Cultural Activities", slug: "cultural-activities" },
    image: "https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=800",
    thumb_image: "https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=800",
    cover_image: "https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=800",
    price: {
      rate_type: "pax",
      adult_price: 1800,
      full_rate: 1800
    },
    rating: 4.4,
    review_count: 234,
    start_time: "16:00:00",
    best_time_to_visit: "Evening",
    features: ["Sunset View", "Traditional Experience", "Cultural Music"],
    promoted: false,
    popular: "1",
    recommended: "0",
    interest_count: 167,
    opening_hours: "4:00 PM - 7:00 PM",
    address: "Jaisalmer, Rajasthan",
    latitude: 26.9157,
    longitude: 70.9083
  },
  {
    id: 9,
    name: "Zip Lining Adventure",
    description: "Fly through the air on a zip line with stunning views of the valley below.",
    location: "Manali",
    city: "Manali",
    category: "Adventure",
    activity_category_master: { name: "Adventure Sports", slug: "adventure-sports" },
    image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800",
    thumb_image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800",
    cover_image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800", 
    price: {
      rate_type: "pax",
      adult_price: 2200,
      full_rate: 2200
    },
    rating: 4.6,
    review_count: 189,
    start_time: "10:00:00",
    best_time_to_visit: "Morning",
    features: ["Safety Equipment", "Multiple Lines", "Professional Guide"],
    promoted: false,
    popular: "0",
    recommended: "1",
    interest_count: 134,
    opening_hours: "10:00 AM - 5:00 PM",
    address: "Manali, Himachal Pradesh",
    latitude: 32.2396,
    longitude: 77.1887
  },
  {
    id: 10,
    name: "Cooking Class - Local Cuisine",
    description: "Learn to cook authentic local dishes from expert chefs. A hands-on culinary experience.",
    location: "Udaipur",
    city: "Udaipur",
    category: "Cultural",
    activity_category_master: { name: "Cultural Activities", slug: "cultural-activities" },
    image: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800",
    thumb_image: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800",
    cover_image: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800",
    price: {
      rate_type: "full",
      full_rate: 2000
    },
    rating: 4.7,
    review_count: 267,
    start_time: "11:00:00",
    best_time_to_visit: "Morning",
    features: ["Recipe Book", "Ingredients Included", "Group Activity"],
    promoted: false,
    popular: "0",
    recommended: "0",
    interest_count: 98,
    opening_hours: "11:00 AM - 2:00 PM",
    address: "Udaipur, Rajasthan",
    latitude: 24.5854,
    longitude: 73.7125
  }
];

// get all activity categories
export const getActivityCategories = async () => {
  try {
    const response = await apiServerMiddleware.get("/activity-categories");  
    return response.data;
  } catch (error) {
     return {
      data: [],
      success: false,
      message: "Failed to fetch activity categories"
    };
  }
}




// get all locations
export const getActivityLocations = async () => {
  /*
  // For now, return mock data. Later replace with actual API call
  return {
    data: mockLocations,
    success: true,
    message: "Locations fetched successfully"
  };
  
  // Uncomment when API is ready
  // const response = await apiServerMiddleware.get("/activity-locations");
  // return response.data;
  */
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

// Filter activities based on criteria
const filterActivities = (activities, filters) => {
  return activities.filter(activity => {
    // Category filter
    if (filters.category && activity.activity_category_master?.slug !== filters.category) {
      return false;
    }
    
    // Location filter (by city)
    if (filters.location && activity.city.toLowerCase() !== filters.location.toLowerCase()) {
      return false;
    }
    
    // Rating filter
    if (filters.rating && activity.rating < parseFloat(filters.rating)) {
      return false;
    }
    
    // Price range filter
    if (filters.price_from && activity.price < parseFloat(filters.price_from)) {
      return false;
    }
    if (filters.price_to && activity.price > parseFloat(filters.price_to)) {
      return false;
    }
    
    // Coordinates filter (for nearby activities)
    if (filters.longitude && filters.latitude) {
      // Simple distance calculation (you might want to implement proper geolocation filtering)
      const distance = Math.sqrt(
        Math.pow(activity.latitude - parseFloat(filters.latitude), 2) +
        Math.pow(activity.longitude - parseFloat(filters.longitude), 2)
      );
      // Filter activities within 0.1 degrees (roughly 11km)
      if (distance > 0.1) {
        return false;
      }
    }
    
    return true;
  });
};

// get activities with filters
export const list = async (filters = {}) => {
  /*
  // For now, return mock data with filtering. Later replace with actual API call
  const filteredActivities = filterActivities(mockActivities, filters);
  
  return {
    data: filteredActivities,
    success: true,
    message: "Activities fetched successfully",
    total: filteredActivities.length
  };*/
  
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
  // const url = queryString ? `/activities?${queryString}` : "/activities";
  // const response = await apiServerMiddleware.get(url);   
  // return response.data; 
}

// Client-side price filtering function
const applyClientSidePriceFilter = (responseData, filters) => {
  if (!responseData?.data?.data) return responseData;
  
  const priceFrom = parseFloat(filters.price_from) || 0;
  const priceTo = parseFloat(filters.price_to) || Infinity;
  
  const filteredActivities = responseData.data.data.filter(activity => {
    // Get activity price from various possible fields
    let activityPrice = 0;
    
    if (activity.price?.rate_type === "full") {
      activityPrice = parseFloat(activity.price?.full_rate) || 0;
    } else if (activity.price?.rate_type === "pax") {
      activityPrice = parseFloat(activity.price?.adult_price) || 0;
    } else {
      activityPrice = parseFloat(activity.price?.full_rate || activity.price || 0);
    }
    
    return activityPrice >= priceFrom && activityPrice <= priceTo;
  });

  
  
  return {
    ...responseData,
    data: {
      ...responseData.data,
      data: filteredActivities
    }
  };
};

// get activities with filters
export const getActivities = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    
    // Add only basic filters that are likely supported by backend
    if (filters.location && filters.location.trim()) {
      params.append("location", filters.location.trim());
    }
    if (filters.category && filters.category.trim()) {
      params.append("category", filters.category.trim());
    }
    
    // Temporarily disable price filtering until backend supports it
    // if (filters.price_from && !isNaN(filters.price_from) && filters.price_from !== "0") {
    //   params.append("price_from", filters.price_from);
    // }
    // if (filters.price_to && !isNaN(filters.price_to) && filters.price_to !== "1000") {
    //   params.append("price_to", filters.price_to);
    // }
    
    // Temporarily disable other filters until backend supports them
    // if (filters.rating && filters.rating.trim()) {
    //   params.append("rating", filters.rating.trim());
    // }

    if (filters.longitude && !isNaN(filters.longitude)) {
      params.append("longitude", filters.longitude);
    }
    if (filters.latitude && !isNaN(filters.latitude)) {
      params.append("latitude", filters.latitude);
    }
    
    // Parse and add date parameter
    if (filters.date && filters.date.trim()) {
      const parsedDate = parseDateParameter(filters.date);
      if (parsedDate) {
        params.append("date", parsedDate);
      }
    }
    
    const queryString = params.toString();
    const url = queryString ? `/activities?${queryString}` : "/activities";
    

    
    // Check if we're sending unsupported parameters
    const supportedParams = ['location', 'category', 'date'];
    const unsupportedParams = Object.keys(filters).filter(key => 
      filters[key] && !supportedParams.includes(key) && key !== 'price_from' && key !== 'price_to'
    );
    
    if (unsupportedParams.length > 0) {
      console.warn("⚠️ Potentially unsupported parameters:", unsupportedParams);
    }
    
    const response = await apiServerMiddleware.get(url);
    
    
    // Apply client-side price filtering if needed
    let filteredData = response.data;
    if (filters.price_from || filters.price_to) {
      filteredData = applyClientSidePriceFilter(response.data, filters);
    }
    
    return filteredData;
  } catch (error) {
    console.log("API call failed, returning mock data for testing");
    
    // Return mock data when API fails (for testing)
    const filteredMockActivities = filterActivities(mockActivities, filters);
    
    // Apply client-side price filtering if needed
    let filteredData = {
      data: {
        data: filteredMockActivities
      },
      success: true,
      message: "Mock activities data loaded"
    };
    
    if (filters.price_from || filters.price_to) {
      filteredData = applyClientSidePriceFilter(filteredData, filters);
    }
    
    return filteredData;
  }
}

// get activity details by id
export const getActivityDetails = async (activityId) => {
  try {
    const response = await apiServerMiddleware.get(`/activity-details/${activityId}`);
     return response.data;
  } catch (error) {
      return {
      data: null,
      success: false,
      message: "Failed to fetch activity details"
    };
  }
}

// get activity gallery by id
export const getActivityGallery = async (activityId) => {
  try {
    const response = await apiServerMiddleware.get(`/activity-gallery/${activityId}`);
     return response.data;
  } catch (error) {
     return {
      data: [],
      success: false,
      message: "Failed to fetch activity gallery"
    };
  }
}

