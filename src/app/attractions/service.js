import apiServerMiddleware from "../api/serverMiddleware";




// get all attraction categories
export const getAttractionCategories = async () => {
  try {
    const response = await apiServerMiddleware.get("/attraction-categories");  
    console.log("Attraction categories data:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching attraction categories:", error);
    return {
      data: [],
      success: false,
      message: "Failed to fetch attraction categories"
    };
  }
}






// get all locations
export const getAttractionLocations = async () => {
  /*
  // For now, return mock data. Later replace with actual API call
  return {
    data: mockLocations,
    success: true,
    message: "Locations fetched successfully"
  };
  
  // Uncomment when API is ready
  // const response = await apiServerMiddleware.get("/attraction-locations");
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
  /*
  // For now, return mock data with filtering. Later replace with actual API call
  const filteredAttractions = filterAttractions(mockAttractions, filters);
  
  return {
    data: filteredAttractions,
    success: true,
    message: "Attractions fetched successfully",
    total: filteredAttractions.length
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
  // const url = queryString ? `/attractions?${queryString}` : "/attractions";
  // const response = await apiServerMiddleware.get(url);   
  // return response.data; 
}

// get attractions with filters
export const getAttractions = async (filters = {}) => {
  try {
    // Just fetch all attractions without any filters
    const response = await apiServerMiddleware.get("/attractions");
    console.log("Response data:", response.data);    
    return response.data;
  } catch (error) {
    console.error("Error fetching attractions:", error);
    return {
      data: [],
      success: false,
      message: "Failed to fetch attractions"
    };
  }
}

// get attraction details by id
export const getAttractionDetails = async (attractionId) => {
  try {
    const response = await apiServerMiddleware.get(`/attraction-details/${attractionId}`);
    console.log("Attraction details response checking for akshay:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching attraction details:", error);
    return {
      data: null,
      success: false,
      message: "Failed to fetch attraction details"
    };
  }
}

// get attraction gallery by id
export const getAttractionGallery = async (attractionId) => {
  try {
    const response = await apiServerMiddleware.get(`/attraction-gallery/${attractionId}`);
    console.log("Attraction gallery response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching attraction gallery:", error);
    return {
      data: [],
      success: false,
      message: "Failed to fetch attraction gallery"
    };
  }
}
