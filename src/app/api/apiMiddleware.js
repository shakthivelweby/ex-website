"use client";
// src/services/apiMiddleware.js
import axios from "axios";
import { clearAuthSession } from "@/utils/authSession";

// Same-origin /api/web is proxied to Laravel via next.config.mjs rewrites.
const apiMiddleware = axios.create({
  baseURL: "/api/web",
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
        clearAuthSession();
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
