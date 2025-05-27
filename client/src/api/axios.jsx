// src/api.js
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;
const API_URL_LAN = import.meta.env.VITE_API_URL_LAN;

const currentAPI =
  window.location.hostname === "localhost" ? API_URL : API_URL_LAN;

const api = axios.create({
  baseURL: `${currentAPI}/api`,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add response interceptor to handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
