import axios from "axios";
import { storage } from "./storage";

const apiBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
const isNgrokApi = /ngrok-free\.app/i.test(apiBaseUrl);

const apiClient = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    "Content-Type": "application/json",
    ...(isNgrokApi ? { "ngrok-skip-browser-warning": "true" } : {}),
  },
});

apiClient.interceptors.request.use((config) => {
  const token = storage.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (isNgrokApi) {
    config.headers["ngrok-skip-browser-warning"] = "true";
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      storage.clearSession();
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;
