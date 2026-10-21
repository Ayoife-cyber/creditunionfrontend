import axios from "axios";

// In dev, Vite proxies /api to the backend (see vite.config.js).
// In production, set VITE_API_BASE_URL to the deployed backend URL.
const baseURL = import.meta.env.VITE_API_BASE_URL || "/api";

const api = axios.create({
  baseURL,
  withCredentials: true, // send the httpOnly admin cookie when present
});

export default api;
