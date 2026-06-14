/**
 * Centralized API configuration.
 * ALL API calls in this project must use API_BASE_URL from this file.
 */
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://event-booking-backend-pt7n.onrender.com/api";

export const API_ORIGIN = API_BASE_URL.replace(/\/api$/, "");
