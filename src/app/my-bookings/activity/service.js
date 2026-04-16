import apiMiddleware from "@/app/api/apiMiddleware";

export const getActivityBookings = async (page = 1) => {
  const response = await apiMiddleware.get(`/activity-bookings?page=${page}`);
  return response.data;
};

