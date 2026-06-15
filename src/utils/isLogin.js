/**
 * Utility functions for handling login state and redirect URLs
 */

// Check if user is logged in (requires a valid auth token)
const isLogin = () => {
  if (typeof window === "undefined") return false;
  return Boolean(localStorage.getItem("token") && localStorage.getItem("user"));
};

// Set redirect URL to be used after login
export const setRedirectAfterLogin = (url) => {
  localStorage.setItem("redirectAfterLogin", url);
};

// Get redirect URL that was set for after login
export const getRedirectAfterLogin = () => {
  return localStorage.getItem("redirectAfterLogin");
};

// Clear redirect URL from storage
export const clearRedirectAfterLogin = () => {
  localStorage.removeItem("redirectAfterLogin");
};

// Check and execute redirect if needed
  export const handleLoginRedirect = () => {
    const redirectUrl = getRedirectAfterLogin();
    if (redirectUrl) {
      clearRedirectAfterLogin();
      window.location.href = redirectUrl;
    return true;
  }
  return false;
};

export default isLogin;