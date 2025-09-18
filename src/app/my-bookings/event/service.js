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
