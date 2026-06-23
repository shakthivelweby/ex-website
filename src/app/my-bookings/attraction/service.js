import apiMiddleware from "../../api/apiMiddleware";

const getAttractionBookings = async (page = 1) => {
  try {
    const response = await apiMiddleware.get(`/attraction-bookings?page=${page}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const getAttractionTicket = async (bookingId) => {
  const response = await apiMiddleware.get(`/attraction-booking/${bookingId}/ticket`);
  return response.data?.data ?? response.data;
};

const downloadAttractionTicketPdf = async (bookingId) => {
  const response = await apiMiddleware.get(`/attraction-booking/${bookingId}/ticket/pdf`, {
    responseType: "blob",
    timeout: 60000,
  });
  return response.data;
};

export { getAttractionBookings, getAttractionTicket, downloadAttractionTicketPdf };
