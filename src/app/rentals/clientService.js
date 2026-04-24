"use client";

import apiMiddleware from "../api/apiMiddleware";

export const checkRentalAvailability = async (rentalItemId, payload) => {
  const response = await apiMiddleware.get(`/rental-availability/${rentalItemId}`, {
    params: payload,
  });
  return response.data;
};

