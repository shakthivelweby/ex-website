import axios from "axios";

/**
 * Base URL for Laravel (no trailing slash).
 * - Browser: prefers NEXT_PUBLIC_API_URL; falls back to relative /api/web only if unset (needs reverse proxy).
 * - Server (RSC): never use host-relative "/api/web" alone — that hits Next.js, not Laravel. Use INTERNAL_API_URL
 *   / LARAVEL_URL, or in non-production default to http://127.0.0.1:8000 for local XAMPP/Laravel.
 */
function resolveWebApiBaseUrl() {
  const explicit = (process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || "")
    .trim()
    .replace(/\/+$/, "");
  if (explicit) return explicit;

  if (typeof window === "undefined") {
    const internal = (process.env.INTERNAL_API_URL || process.env.LARAVEL_URL || "")
      .trim()
      .replace(/\/+$/, "");
    if (internal) return internal;
    if (process.env.NODE_ENV !== "production") {
      return "http://127.0.0.1:8000";
    }
  }

  return "";
}

const apiBase = resolveWebApiBaseUrl();

/** SSR / server fetches: Laravel on local XAMPP can exceed 10s on cold start; override with SERVER_API_TIMEOUT_MS. */
const serverApiTimeoutMs = (() => {
  const raw = process.env.SERVER_API_TIMEOUT_MS;
  const n = raw != null && raw !== "" ? Number.parseInt(String(raw), 10) : NaN;
  if (Number.isFinite(n) && n >= 1000) return n;
  return 45000;
})();

if (typeof window === "undefined" && !apiBase && process.env.NODE_ENV === "production") {
  console.error(
    "[ex-website] SSR: set NEXT_PUBLIC_API_URL or INTERNAL_API_URL so activity (and other) API calls reach Laravel."
  );
}

if (typeof window !== "undefined" && !apiBase) {
  console.warn(
    "[ex-website] NEXT_PUBLIC_API_URL is not set; API requests use /api/web on this host (needs a proxy or env)."
  );
}

const apiServerMiddleware = axios.create({
  baseURL: apiBase ? `${apiBase}/api/web` : "/api/web",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: serverApiTimeoutMs,
});

// Request interceptor
apiServerMiddleware.interceptors.request.use(
  async (config) => {
    config.headers["X-Server-Key"] = process.env.SERVER_API_KEY || "";

    // Attach auth token for protected web routes (client-side only)
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

// Response interceptor
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

    // Avoid console.error on routine 4xx (e.g. 404 "Activity not found") — Next/Turbopack treats it as a dev overlay error.
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
