import apiMiddleware from "../../api/apiMiddleware";

async function postRentalPayment(path, data) {
  try {
    const response = await apiMiddleware.post(path, data, {
      transformRequest: [
        (payload, headers) => {
          if (payload instanceof FormData) {
            delete headers["Content-Type"];
          }
          return payload;
        },
      ],
    });
    return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      throw new Error("Your session expired. Please sign in again.");
    }
    const message = error.response?.data?.message;
    if (message) {
      throw new Error(message);
    }
    throw error;
  }
}

export const createOrder = async (data) => postRentalPayment("/rental-payment", data);

export const reserveRentalSlot = async (payload) => {
  const response = await apiMiddleware.post("/rental-reserve", payload);
  return response.data;
};

export const cancelRentalReservation = async (rentalBookingId) => {
  const response = await apiMiddleware.post("/rental-reserve-cancel", {
    rental_booking_id: Number(rentalBookingId),
  });
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

