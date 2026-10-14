import apiClient from "./apiClient";

export const mailerService = {
  getStatus: () => apiClient.get("/mailer/status"),
  sendBulk: (formData) =>
    apiClient.post("/mailer/send", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
};
