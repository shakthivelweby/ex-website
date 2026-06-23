import apiMiddleware from "@/app/api/apiMiddleware";

export const getActivityBookings = async (page = 1) => {
  const response = await apiMiddleware.get(`/activity-bookings?page=${page}`);
  return response.data;
};

export const getActivityTicket = async (bookingId) => {
  const response = await apiMiddleware.get(`/activity-booking/${bookingId}/ticket`);
  return response.data?.data ?? response.data;
};

export const downloadActivityTicketPdf = async (bookingId) => {
  const response = await apiMiddleware.get(`/activity-booking/${bookingId}/ticket/pdf`, {
    responseType: "blob",
    timeout: 60000,
  });
  return response.data;
};

export const verifyActivityTicketQr = async ({ reference, token }) => {
  const response = await apiMiddleware.get("/activity-ticket/verify", {
    params: { reference, token },
  });
  return response.data;
};
