"use client";

import apiMiddleware from "../api/apiMiddleware";

export const checkRentalAvailability = async (rentalItemId, payload) => {
  const response = await apiMiddleware.get(`/rental-availability/${rentalItemId}`, {
    params: payload,
  });
  return response.data;
};

export const getRentalUnavailableDates = async (rentalItemId, params = {}) => {
  const response = await apiMiddleware.get(`/rental-unavailable-dates/${rentalItemId}`, {
    params,
  });
  return response.data;
};

