import apiMiddleware from "./api/apiMiddleware";

export const getDestinations = async () => {
    try {
        const response = await apiMiddleware.get("/state-destinations");
        console.log('API Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error fetching destinations:', error);
        // Return a consistent error format
        return {
            message: "Failed to fetch destinations",
            data: [],
            status: false
        };
    }
};


