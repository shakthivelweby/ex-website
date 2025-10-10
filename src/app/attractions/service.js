import apiServerMiddleware from "../api/serverMiddleware";

// get all attraction categories
export const getAttractionCategories = async () => {
    // const response = await apiServerMiddleware.get("/attraction-categories");
    // return response.data;
    return {
        data: [
            { id: 1, name: "Museums", slug: "museums", image: null },
            { id: 2, name: "Theme Parks", slug: "theme-parks", image: null },
            { id: 3, name: "Historical Sites", slug: "historical-sites", image: null },
            { id: 4, name: "Nature Parks", slug: "nature-parks", image: null },
        ]
    };
}

//  get all languages
export const getLanguages = async () => {
    // const response = await apiServerMiddleware.get("/attraction-language");
    // return response.data;
    return {
        data: [
            { id: 1, name: "English", slug: "english" },
            { id: 2, name: "Hindi", slug: "hindi" },
            { id: 3, name: "Spanish", slug: "spanish" },
            { id: 4, name: "French", slug: "french" },
        ]
    };
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

// get attractions with filters
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
    
    // const queryString = params.toString();
    // const url = queryString ? `/attractions?${queryString}` : "/attractions";
    
    // const response = await apiServerMiddleware.get(url);
    // return response.data;
    return {
        data: [
            {
                id: 1,
                name: "Gateway of India",
                location: "Mumbai, Maharashtra",
                opening_date: "2024-01-01",
                attraction_category_master: { name: "Historical Sites" },
                thumb_image: "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?q=80&w=1000&auto=format&fit=crop",
                cover_image: "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?q=80&w=1000&auto=format&fit=crop",
                attraction_prices: [
                    { price: "100", available_slots: 50 },
                    { price: "150", available_slots: 30 }
                ],
                duration: "2-3 hours",
                rating: 4.5
            },
            {
                id: 2,
                name: "Red Fort",
                location: "Delhi, NCR",
                opening_date: "2024-01-01",
                attraction_category_master: { name: "Historical Sites" },
                thumb_image: "https://images.unsplash.com/photo-1564507592333-c60657eea523?q=80&w=1000&auto=format&fit=crop",
                cover_image: "https://images.unsplash.com/photo-1564507592333-c60657eea523?q=80&w=1000&auto=format&fit=crop",
                attraction_prices: [
                    { price: "50", available_slots: 100 },
                    { price: "80", available_slots: 75 }
                ],
                duration: "3-4 hours",
                rating: 4.7
            },
            {
                id: 3,
                name: "Wonderla Amusement Park",
                location: "Bangalore, Karnataka",
                opening_date: "2024-01-01",
                attraction_category_master: { name: "Theme Parks" },
                thumb_image: "https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?q=80&w=1000&auto=format&fit=crop",
                cover_image: "https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?q=80&w=1000&auto=format&fit=crop",
                attraction_prices: [
                    { price: "800", available_slots: 200 },
                    { price: "1200", available_slots: 150 }
                ],
                duration: "Full Day",
                rating: 4.3
            },
            {
                id: 4,
                name: "National Museum",
                location: "New Delhi, NCR",
                opening_date: "2024-01-01",
                attraction_category_master: { name: "Museums" },
                thumb_image: "https://images.unsplash.com/photo-1566127992631-137a642a90f4?q=80&w=1000&auto=format&fit=crop",
                cover_image: "https://images.unsplash.com/photo-1566127992631-137a642a90f4?q=80&w=1000&auto=format&fit=crop",
                attraction_prices: [
                    { price: "20", available_slots: 80 },
                    { price: "50", available_slots: 40 }
                ],
                duration: "2-3 hours",
                rating: 4.2
            }
        ]
    }; 
}
