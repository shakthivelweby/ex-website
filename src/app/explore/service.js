import apiServerMiddleware from "../api/serverMiddleware";


const getExploreData = async () => {
    const response = await apiServerMiddleware.get("/countries-and-states");
    return response.data;
};


const getFeaturedDestinations = async () => {
    const response = await apiServerMiddleware.get(`/featured-destinations`);
    return response.data;
};

export { getExploreData, getFeaturedDestinations };