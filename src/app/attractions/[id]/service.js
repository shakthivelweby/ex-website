import apiServerMiddleware from "../../api/serverMiddleware";
import apiMiddleware from "../../api/apiMiddleware";


// Get attraction details by ID
export const attractionInfo = async (id) => {
  try {
    const response = await apiServerMiddleware.get(`/attraction-details/${id}`);     
    return response.data;
  } catch (error) {
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
    return response.data;
  } catch (error) {
    return {
      data: [],
      success: false,
      message: "Failed to fetch attraction gallery"
    };
  }
};

// Get attraction booking details (for ticket selection)
export const getDetailsForBooking = async (id) => {
  try {
    const response = await apiMiddleware.get(`/attraction-booking-details/${id}`);

    return response.data;
  } catch (error) {
    console.error("Error fetching booking details:", error);
    return {
      data: null,
      success: false,
      message: "Failed to fetch booking details"
    };
  }
};




// Get attraction ticket prices for specific date (Client-side)
export const getTicketPricesForDate = async (attractionId, date) => {
  try {
    const response = await apiMiddleware.get(`/attraction-ticket-prices/${attractionId}?date=${date}`);  
    return response.data;
  } catch (error) {
    return {
      data: null,
      success: false,
      message: "Failed to fetch ticket prices for date"
    };
  }
};



// Get attraction ticket prices for specific date (Server-side)
export const getTicketPricesForDateServer = async (attractionId, date) => {
  try {
    const response = await apiServerMiddleware.get(`/attraction-ticket-prices/${attractionId}?date=${date}`);
    return response.data;
  } catch (error) {  
    return {
      data: null,
      success: false,
      message: "Failed to fetch ticket prices for date"
    };
  }
};
