import apiServerMiddleware from "@/app/api/serverMiddleware";

// get event info
export const eventInfo = async (event_id) => {
  const response = await apiServerMiddleware.get(`/event-details/${event_id}`);
  return response.data;
};

export const getDetailsForBooking = async (event_id) => {
  const response = await apiServerMiddleware.get(`/event-booking-details/${event_id}`);
  return response.data;
};

export const getEventGallery = async (event_id) => {
  const response = await apiServerMiddleware.get(`/event-details/${event_id}`);
  return response.data;
};

