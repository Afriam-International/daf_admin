import apiClient from "./apiClient";

export const notificationService = {
  broadcast: (payload) => apiClient.post("/notifications/broadcast", payload),
  sendToUser: (payload) => apiClient.post("/notifications/send-to-user", payload),
  sendToUsers: (payload) => apiClient.post("/notifications/send-to-users", payload),
  getRecipients: ({ page = 1, limit = 20, search = "", status = "" } = {}) =>
    apiClient.get("/notifications/recipients", {
      params: { page, limit, search, status },
    }),
  getAnalytics: ({ days = 7 } = {}) =>
    apiClient.get("/notifications/analytics", {
      params: { days },
    }),
  test: (payload) => apiClient.post("/notifications/test", payload),
};
