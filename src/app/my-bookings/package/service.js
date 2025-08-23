import apiMiddleware from "@/app/api/apiMiddleware";

export const getBookings = async (page = 1) => {
    try {
        const response = await apiMiddleware.get(
            `/package-bookings?page=${page}`
        );
        return response.data;
    }
    catch (error) {
        throw error;
    }
}
