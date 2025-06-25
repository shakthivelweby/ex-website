import apiMiddleware from "../api/apiMiddleware";



export const searchService = {
  search: async (query) => {
    try {
      const response = await apiMiddleware(`search?search=${query}`);
      return response;
    } catch (error) {
      throw error;
    }
  }
}; 