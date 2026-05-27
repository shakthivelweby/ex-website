"use client";
// src/services/apiMiddleware.js
import axios from "axios";

const getApiBaseUrl = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) return null;
  return `${apiUrl.replace(/\/$/, "")}/api/web`;
};

const apiMiddleware = axios.create({
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

apiMiddleware.interceptors.request.use(
  (config) => {
    const baseURL = getApiBaseUrl();
    if (!baseURL) {
      return Promise.reject(new Error("NEXT_PUBLIC_API_URL is not configured"));
    }
    config.baseURL = baseURL;

    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
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
