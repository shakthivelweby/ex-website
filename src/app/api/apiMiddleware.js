"use client";
import axios from "axios";
import { getApiErrorMessage } from "./getApiErrorMessage";

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
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiMiddleware.interceptors.response.use(
  (response) => response,
  (error) => {
    error.userMessage = getApiErrorMessage(error);

    if (error.response?.status === 401) {
      try {
        localStorage.setItem("redirectAfterLogin", window.location.href);
        window.dispatchEvent(new CustomEvent("showLogin"));
      } catch (_) {
        // ignore
      }
    }

    return Promise.reject(error);
  }
);

export default apiMiddleware;
