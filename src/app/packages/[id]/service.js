import apiServerMiddleware from "@/app/api/serverMiddleware";

const getPackages = async (filters = {}) => {
    const { 
        tour_type, 
        suitable_id, 
        sort_by_price,
        price_range_from,
        price_range_to
    } = filters;
    
    const response = await apiServerMiddleware.get('/packages', {
        params: {
            country_id: filters.country_id || undefined,
            state_id: filters.state_id || undefined,
            destination_id: filters.destination_id || undefined,
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

const countryInfo = async (id) => {
    const response = await apiServerMiddleware.get(`/country-info?id=${id}`);
    return response.data;
};

const getStates = async (id) => {
    const response = await apiServerMiddleware.get(`/states-under-country?id=${id}`);
    return response.data;
};


export { getPackages, stateInfo, stateDestinations, suitableFor, countryInfo, getStates };