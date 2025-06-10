import apiMiddleware from "../api/apiMiddleware"

const checkoutData = async (params) => {
    const queryString = new URLSearchParams({
        package_id: params.package_id,
        stay_category_id: params.stay_category_id,
        booking_date: params.booking_date,
        adult_count: params.adult_count,
        child_count: params.child_count,
        infant_count: params.infant_count,
        package_price_rate_id: params.package_price_rate_id
    }).toString();

    const response = await apiMiddleware.get(`/package-checkout-data?${queryString}`);
    return response.data;
};

const book = async (data) => {
    try {
        const response = await apiMiddleware.post("/package-booking", data);
        return response.data;
    } catch (error) {
        throw error;
    }
};

const createOrder = async (data) => {
    try {
        const response = await apiMiddleware.post("/package-payment", data);
        return response.data;
    } catch (error) {
        throw error;
    }
};

const verifyPayment = async (data) => {
    try {
        alert('hi')
        const queryString = new URLSearchParams({
            order_id: data.razorpay_order_id,
            signature: data.razorpay_signature
        }).toString();
        const response = await apiMiddleware.post(`/package-payment-verify?${queryString}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export { checkoutData, book, createOrder, verifyPayment };