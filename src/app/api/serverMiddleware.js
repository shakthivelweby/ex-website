import axios from "axios";

/**
 * Web API client for Next.js.
 * - SSR: calls Laravel directly (127.0.0.1:8000 or env).
 * - Browser: uses same-origin /api/web (proxied by next.config rewrites).
 */
function resolveWebApiBaseUrl() {
  if (typeof window === "undefined") {
    const internal = (
      process.env.INTERNAL_API_URL ||
      process.env.LARAVEL_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      ""
    )
      .trim()
      .replace(/\/+$/, "");
    return internal || "http://127.0.0.1:8000";
  }

  // Browser must use relative URL so localhost:3000 and LAN IP both work via rewrites.
  return "";
}

const apiBase = resolveWebApiBaseUrl();

const serverApiTimeoutMs = (() => {
  const raw = process.env.SERVER_API_TIMEOUT_MS;
  const n = raw != null && raw !== "" ? Number.parseInt(String(raw), 10) : NaN;
  if (Number.isFinite(n) && n >= 1000) return n;
  return 45000;
})();

const apiServerMiddleware = axios.create({
  baseURL: apiBase ? `${apiBase}/api/web` : "/api/web",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: serverApiTimeoutMs,
});

apiServerMiddleware.interceptors.request.use(
  async (config) => {
    config.headers["X-Server-Key"] = process.env.SERVER_API_KEY || "";

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

function normalizeErrorMessage(error) {
  const raw =
    error.response?.data?.message ?? error.response?.data?.error ?? error.message;
  if (typeof raw === "string" && raw.trim()) return raw.trim();
  if (raw != null && typeof raw === "object") {
    try {
      return JSON.stringify(raw);
    } catch {
      return String(raw);
    }
  }
  if (error.code) return `Network: ${error.code}`;
  return "Request failed";
}

apiServerMiddleware.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const base = error.config?.baseURL ?? "";
    const path = error.config?.url ?? "";
    const url =
      path && (String(path).startsWith("http") ? path : `${base}${path}`) || "(unknown url)";
    const message = normalizeErrorMessage(error);

    const payload = {
      status: status ?? "no-response",
      message,
      url,
      code: error.code ?? null,
    };

    const code = error.code ?? null;
    const msgLower = String(message || "").toLowerCase();
    const isLikelyNetworkOrTimeout =
      !error.response &&
      (code === "ECONNABORTED" ||
        code === "ETIMEDOUT" ||
        code === "ECONNREFUSED" ||
        code === "ENOTFOUND" ||
        msgLower.includes("timeout"));

    if (!error.response || !Number.isFinite(status) || status >= 500) {
      const line = `API Server Middleware Error: ${JSON.stringify(payload)}`;
      if (isLikelyNetworkOrTimeout) {
        console.warn(line);
      } else {
        console.error(line);
      }
    }

    return Promise.reject(error);
  }
);

export default apiServerMiddleware;
