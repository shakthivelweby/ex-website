"use client";
// src/services/apiMiddleware.js
import axios from "axios";

// Create axios instance with base config
const apiMiddleware = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL + "/api/web", // your API base URL
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000, // increased to 30 seconds for payment verification
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
        // Clear token and trigger login UI (site uses modal, not /login route)
        localStorage.removeItem("token");
        try {
          window.dispatchEvent(new CustomEvent("showLogin"));
        } catch (_) {
          // ignore
        }
      }
    }
    return Promise.reject(error);
  }
);

export default apiMiddleware;
