import apiServerMiddleware from "@/app/api/serverMiddleware";

const getPackages = async (id, destination, filters = {}) => {
    const { 
        tour_type, 
        suitable_id, 
        sort_by_price,
        price_range_from,
        price_range_to
    } = filters;
    
    const response = await apiServerMiddleware.get('/packages', {
        params: {
            state_id: id,
            destination_id: destination,
            tour_type: tour_type || undefined,
            suitable_id: suitable_id || undefined,
            sort_by_price: sort_by_price || undefined,
            price_range_from: price_range_from || undefined,
            price_range_to: price_range_to || undefined
        }
    });
    console.log(response)
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

const suitableFor = async () => {
    const response = await apiServerMiddleware.get(`/suitable-masters`);
    return response.data;
};


export { getPackages, stateInfo, stateDestinations, suitableFor };