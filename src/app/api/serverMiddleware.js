import axios from "axios";

const apiServerMiddleware = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL + "/api/web",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// Request interceptor
apiServerMiddleware.interceptors.request.use(
  async (config) => {
    config.headers["X-Server-Key"] = process.env.SERVER_API_KEY || "";
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
apiServerMiddleware.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Server Middleware Error:", error.response?.status);
    return Promise.reject(error);
  }
);

export default apiServerMiddleware;
