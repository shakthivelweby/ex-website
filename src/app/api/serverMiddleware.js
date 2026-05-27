import axios from "axios";

const getApiBaseUrl = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) {
    console.error(
      "NEXT_PUBLIC_API_URL is not set. Add it to .env.local (e.g. http://127.0.0.1:8000 or http://localhost/explore-world-api/public)"
    );
    return null;
  }
  return `${apiUrl.replace(/\/$/, "")}/api/web`;
};

const apiServerMiddleware = axios.create({
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

apiServerMiddleware.interceptors.request.use(
  async (config) => {
    const baseURL = getApiBaseUrl();
    if (!baseURL) {
      return Promise.reject(new Error("NEXT_PUBLIC_API_URL is not configured"));
    }
    config.baseURL = baseURL;
    config.headers["X-Server-Key"] = process.env.SERVER_API_KEY || "";
    return config;
  },
  (error) => Promise.reject(error)
);

apiServerMiddleware.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Server Middleware Error:", {
      status: error.response?.status ?? "no response",
      url: error.config?.baseURL
        ? `${error.config.baseURL}${error.config.url ?? ""}`
        : error.config?.url,
      message: error.message,
      code: error.code,
    });
    return Promise.reject(error);
  }
);

export default apiServerMiddleware;
