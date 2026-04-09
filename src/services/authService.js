import apiClient from "./apiClient";

export const authService = {
  login: (payload) => apiClient.post("/auth/login", payload),
  forgotPassword: (email) => apiClient.post("/auth/forgot-password", { email }),
  resetPassword: ({ token, newPassword }) =>
    apiClient.post("/auth/reset-password", { token, newPassword }),
  changePassword: ({ newPassword }) => apiClient.post("/auth/change-password", { newPassword }),
  signup: (payload) => apiClient.post("/auth/signup", payload),
};
