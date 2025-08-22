import apiMiddleware from "../../api/apiMiddleware"

const createEventBooking = async (data) => {
    try {
        const response = await apiMiddleware.post("/create-event-booking", data);
        return response.data;
    } catch (error) {
        if (error.response?.status === 401) {
            throw new Error("Authentication failed. Please log in again.");
        }
        throw error;
    }
};

const createOrder = async (data) => {
    try {
        const response = await apiMiddleware.post("/event-payment", data);
        return response.data;
    } catch (error) {
        throw error;
    }
};

const verifyPayment = async (data) => {
    try {
        const response = await apiMiddleware.post("/event-payment-verify", data);
        return response.data;
    } catch (error) {
        throw error;
    }
};

const failedBooking = async (data) => {
    try {
        const response = await apiMiddleware.post("/event-payment-failed", data);
        return response.data;
    } catch (error) {
        throw error;
    }
};
export { createEventBooking, createOrder, verifyPayment, failedBooking };

    