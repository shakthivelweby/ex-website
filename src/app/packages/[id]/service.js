import apiServerMiddleware from "@/app/api/serverMiddleware";

const getPackages = async (id, destination) => {
    const response = await apiServerMiddleware.get('/packages', {
        params: {
            state_id: id,
            destination_id: destination
        }
    });
    return response.data;
};

const stateInfo = async (id) => {
    const response = await apiServerMiddleware.get(`/state-info/${id}`);
    return response.data;
};

const stateDestinations = async (id) => {
    const response = await apiServerMiddleware.get(`/state-destinations/${id}`);
    return response.data;
};

export { getPackages, stateInfo, stateDestinations };