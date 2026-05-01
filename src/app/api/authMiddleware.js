import axios from "axios";

const apiAuthMiddleware = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL + "/api/web",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

apiAuthMiddleware.interceptors.request.use(
  (config) => {
    // Attach token only in browser context
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiAuthMiddleware.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      try {
        localStorage.removeItem("token");
        window.dispatchEvent(new CustomEvent("showLogin"));
      } catch (_) {
        // ignore
      }
    }
    return Promise.reject(error);
  }
);

export default apiAuthMiddleware;

