import apiMiddleware from "@/app/api/apiMiddleware";

 export const getBookings = async () => {
    try {
        const response = await apiMiddleware.get(
            "/booked-packages"
        );
        return response.data;
    }
    catch (error) {
        throw error;
    }
 }
