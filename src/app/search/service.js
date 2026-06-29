import apiMiddleware from "../api/apiMiddleware";



export const searchService = {
  search: async (query) => {
    try {
      const response = await apiMiddleware(`search?search=${query}`);
      return response;
    } catch (error) {
      throw error;
    }
  },
  getAllDestinations: async () => {
    const response = await apiMiddleware.get("/state-destinations");
    return response.data;
  },
  getSuitableMasters: async () => {
    const response = await apiMiddleware.get("/suitable-masters");
    return response.data;
  },
  getEventCategories: async () => {
    const response = await apiMiddleware.get("/event-categories");
    return response.data;
  },
  getEventLanguages: async () => {
    const response = await apiMiddleware.get("/event-language");
    return response.data;
  },
  getAttractionCategories: async () => {
    const response = await apiMiddleware.get("/attraction-categories");
    return response.data;
  },
  getActivityCategories: async () => {
    const response = await apiMiddleware.get("/activity-categories");
    return response.data;
  },
  getRentalCategories: async () => {
    const response = await apiMiddleware.get("/rental-categories");
    return response.data;
  },
};