export function clearAuthSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.dispatchEvent(new CustomEvent("auth:logout"));
}

export function hasValidAuthSession() {
  if (typeof window === "undefined") return false;
  return Boolean(localStorage.getItem("token") && localStorage.getItem("user"));
}
