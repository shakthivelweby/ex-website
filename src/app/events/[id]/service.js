import apiServerMiddleware from "@/app/api/serverMiddleware";

// get event info
export const eventInfo = async (event_id) => {
  const response = await apiServerMiddleware.get(`/event-details/${event_id}`);
  return response.data;
};

