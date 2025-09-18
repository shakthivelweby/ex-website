"use client";
// src/services/apiMiddleware.js
import axios from "axios";

// Create axios instance with base config
const apiMiddleware = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL + "/api/web", // your API base URL
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // optional timeout
});

// Request interceptor to add auth token if exists
apiMiddleware.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for global error handling
apiMiddleware.interceptors.response.use(
  (response) => response,
  (error) => {
    // You can handle specific error statuses globally here
    if (error.response) {
      if (error.response.status === 401) {
        // e.g., redirect to login or clear tokens
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default apiMiddleware;
