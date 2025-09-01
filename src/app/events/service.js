import apiServerMiddleware from "../api/serverMiddleware";

// get all categories
export const getEventCategories = async () => {
    const response = await apiServerMiddleware.get("/event-categories");
    console.log("Event categories :", response.data);
    return response.data;
}

//  get all languages
export const getLanguages = async () => {
    const response = await apiServerMiddleware.get("/event-language");
    return response.data;
}

// Helper function to parse date parameter
const parseDateParameter = (dateParam) => {
    if (!dateParam) return null;
    
    const today = new Date();
    
    switch (dateParam) {
        case "today":
            const todayDate = today.toISOString().split('T')[0];
            return todayDate;
        case "tomorrow":
            const tomorrow = new Date(today);
            tomorrow.setDate(today.getDate() + 1);
            const tomorrowDate = tomorrow.toISOString().split('T')[0];
            return tomorrowDate;
        case "weekend":
            // Find next Saturday
            const daysUntilSaturday = (6 - today.getDay() + 7) % 7;
            const weekend = new Date(today);
            weekend.setDate(today.getDate() + daysUntilSaturday);
            const weekendDate = weekend.toISOString().split('T')[0];
            return weekendDate;
        default:
            // If it's a custom date (YYYY-MM-DD format), return as is
            if (/^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
                return dateParam;
            }
            return null;
    }
};

// get events with filters
export const list = async (filters = {}) => {
    const params = new URLSearchParams();
    
    // Add filters to query parameters
    if (filters.language) params.append("language", filters.language);
    if (filters.category) params.append("category", filters.category);
    
    // Parse and add date parameter
    if (filters.date) {
        const parsedDate = parseDateParameter(filters.date);
        if (parsedDate) {
            params.append("date", parsedDate);
        }
    }
    
    if (filters.longitude) params.append("longitude", filters.longitude);
    if (filters.latitude) params.append("latitude", filters.latitude);
    if (filters.price_from) params.append("price_from", filters.price_from);
    if (filters.price_to) params.append("price_to", filters.price_to);
    
    const queryString = params.toString();
    const url = queryString ? `/events?${queryString}` : "/events";

    console.log("Events list url :", url);
    const response = await apiServerMiddleware.get(url);
    console.log("Events list :", response.data);
    return response.data; 
}