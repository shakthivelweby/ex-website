"use client";
// src/services/apiMiddleware.js
import axios from "axios";

// Same-origin /api/web is proxied to Laravel via next.config.mjs rewrites.
const apiMiddleware = axios.create({
  baseURL: "/api/web",
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
