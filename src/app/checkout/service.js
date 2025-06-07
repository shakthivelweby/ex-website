import apiMiddleware from "../api/apiMiddleware"
const checkoutData = async () => {
    const response = await apiMiddleware.post("/package-checkout-data?package_id=1&stay_category_id=2&package_stay_category_id=40&adult_count=3&child_count=2&infant_count=0&package_price_rate_id=3&booking_date=2025-06-07", data);
    return response.data;
}

export { checkoutData };