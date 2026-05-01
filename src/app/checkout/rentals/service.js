import apiMiddleware from "../../api/apiMiddleware";

export const createOrder = async (data) => {
  const response = await apiMiddleware.post("/rental-payment", data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const reserveRentalSlot = async (payload) => {
  const response = await apiMiddleware.post("/rental-reserve", payload);
  return response.data;
};

export const verifyPayment = async (data) => {
  const response = await apiMiddleware.post("/rental-payment-verify", data, {
    timeout: 60000,
  });
  return response.data;
};

export const paymentFailure = async (rental_payment_id) => {
  const response = await apiMiddleware.post("/rental-payment-failed", {
    rental_payment_id,
  });
  return response.data;
};

