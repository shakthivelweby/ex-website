import apiMiddleware from "@/app/api/apiMiddleware";

export const getEventBookings = async (page = 1) => {
    try {
        const response = await apiMiddleware.get(
            `/event-bookings?page=${page}`
        );
        return response.data;
    }
    catch (error) {
        throw error;
    }
}

export const getEventTicket = async (bookingId) => {
  const response = await apiMiddleware.get(`/event-booking/${bookingId}/ticket`);
  return response.data?.data ?? response.data;
};

export const downloadEventTicketPdf = async (bookingId) => {
  const response = await apiMiddleware.get(`/event-booking/${bookingId}/ticket/pdf`, {
    responseType: "blob",
    timeout: 60000,
  });
  return response.data;
};

