export function getApiErrorMessage(error, fallback = "Request failed") {
  const data = error?.response?.data;
  const message = data?.message ?? data?.error ?? error?.message;
  if (typeof message === "string" && message.trim()) return message.trim();
  if (message != null && typeof message === "object") {
    try {
      return JSON.stringify(message);
    } catch {
      return fallback;
    }
  }
  return fallback;
}
