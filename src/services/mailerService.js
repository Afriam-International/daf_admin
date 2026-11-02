import apiClient from "./apiClient";

export const mailerService = {
  getStatus: () => apiClient.get("/mailer/status"),
  getHistory: (params = {}) =>
    apiClient.get("/mailer/history", {
      params,
    }),
  sendBulk: (formData) =>
    apiClient.post("/mailer/send", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
};
