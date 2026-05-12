"use client";
// src/services/apiMiddleware.js
import axios from "axios";

const apiBase = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "");
if (typeof window !== "undefined" && !apiBase) {
  console.warn(
    "[ex-website] NEXT_PUBLIC_API_URL is not set; API requests may fail."
  );
}

// Create axios instance with base config
const apiMiddleware = axios.create({
  baseURL: apiBase ? `${apiBase}/api/web` : "/api/web", // your API base URL
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
        // Trigger login UI (do NOT eagerly clear token; some 401s can be transient / racey).
        // Login will overwrite token on success.
        try {
          // Preserve current page so login can return user here.
          localStorage.setItem("redirectAfterLogin", window.location.href);
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
