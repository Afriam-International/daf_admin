import apiClient from "./apiClient";

export const analyticsService = {
  getDashboardStats: () => apiClient.get("/analytics/dashboard"),
  getUserStats: () => apiClient.get("/analytics/users"),
  getDonationStats: () => apiClient.get("/analytics/donations"),
};
