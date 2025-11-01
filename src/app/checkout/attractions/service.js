import apiMiddleware from "../../api/apiMiddleware"

const book = async (data) => {
    try {
        const response = await apiMiddleware.post("/create-attraction-booking", data);
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
        const response = await apiMiddleware.post("/attraction-payment", data);
        return response.data;
    } catch (error) {
        throw error;
    }
};

const verifyPayment = async (data) => {
    try {
        const response = await apiMiddleware.post("/attraction-payment-verify", data, {
            timeout: 60000, // 60 seconds timeout specifically for payment verification
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

const paymentFailure = async (attraction_payment_id) => {
    try {
        const response = await apiMiddleware.post("/attraction-payment-failed", {
            attraction_payment_id: attraction_payment_id
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export { book, createOrder, verifyPayment, paymentFailure };
