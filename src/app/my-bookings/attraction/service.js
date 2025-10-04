import apiMiddleware from "../../api/apiMiddleware";

const getAttractionBookings = async (page = 1) => {
  try {
    const response = await apiMiddleware.get(`/attraction-bookings?page=${page}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export { getAttractionBookings };
