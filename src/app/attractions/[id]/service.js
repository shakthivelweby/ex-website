import apiServerMiddleware from "../../api/serverMiddleware";


// Get attraction details by ID
export const attractionInfo = async (id) => {
  try {
    const response = await apiServerMiddleware.get(`/attraction-details/${id}`);
  
    
    return response.data;
  } catch (error) {
    console.error("Error fetching attraction details:", error);
    return {
      data: null,
      success: false,
      message: "Failed to fetch attraction details"
    };
  }
};

// Get attraction gallery images
export const getAttractionGallery = async (id) => {
  try {
    const response = await apiServerMiddleware.get(`/attraction-gallery/${id}`);
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
};

// Get attraction booking details (for ticket selection)
export const getDetailsForBooking = async (id) => {
  
};

// Get attraction tickets for booking
export const getAttractionTickets = async (id) => {
  
};