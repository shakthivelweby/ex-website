import apiServerMiddleware from "../api/serverMiddleware";


const getExploreData = async () => {
    const response = await apiServerMiddleware.get("/countries-and-states");
    return response.data;
};


const getFeaturedDestinations = async () => {
    const response = await apiServerMiddleware.get(`/featured-destinations`);
    return response.data;
};

// Get actual package count for a country
const getPackageCount = async (countryId) => {
    try {
        const response = await apiServerMiddleware.get('/packages', {
            params: {
                country_id: countryId
            }
        });
        // Handle different response structures
        // If response.data is an array, use its length
        if (Array.isArray(response.data)) {
            return response.data.length;
        }
        // If response.data.data is an array, use its length
        if (Array.isArray(response.data?.data)) {
            return response.data.data.length;
        }
        // If there's a total or count field, use it
        if (response.data?.total !== undefined) {
            return response.data.total;
        }
        if (response.data?.count !== undefined) {
            return response.data.count;
        }
        return 0;
    } catch (error) {
        console.error(`Error fetching package count for country ${countryId}:`, error);
        return 0;
    }
};

export { getExploreData, getFeaturedDestinations, getPackageCount };