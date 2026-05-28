import apiMiddleware from "@/app/api/apiMiddleware";

export const getRentalBookings = async (page = 1) => {
  try {
    const response = await apiMiddleware.get(`/rental-bookings?page=${page}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createRentalBalanceOrder = async (payload) => {
  const response = await apiMiddleware.post(`/rental-payment-balance`, payload);
  return response.data;
};

export const verifyRentalPayment = async (payload) => {
  const response = await apiMiddleware.post(`/rental-payment-verify`, payload, {
    timeout: 60000,
  });
  return response.data;
};

export const rentalPaymentFailure = async (rental_payment_id) => {
  const response = await apiMiddleware.post(`/rental-payment-failed`, {
    rental_payment_id,
  });
  return response.data;
};

