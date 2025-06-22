import apiServerMiddleware from "../api/serverMiddleware";


const getExploreData = async () => {
    const response = await apiServerMiddleware.get("/countries-and-states");
    return response.data;
};

export { getExploreData };