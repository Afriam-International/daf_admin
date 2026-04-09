import apiClient from "./apiClient";

export const userService = {
  getProfile: () => apiClient.get("/user/profile"),
  updateProfile: (payload) => apiClient.patch("/user/profile", payload),
  getAllUsers: ({ page = 1, limit = 10, role = "", status = "", search = "" } = {}) =>
    apiClient.get("/user", {
      params: { page, limit, role, status, search },
    }),
  getAdmins: ({ page = 1, limit = 10, status = "", search = "" } = {}) =>
    apiClient.get("/user/admins", {
      params: { page, limit, status, search },
    }),
  getDeletionRequests: ({ page = 1, limit = 10, search = "" } = {}) =>
    apiClient.get("/user/deletion-requests", {
      params: { page, limit, search },
    }),
  getUserById: (id) => apiClient.get(`/user/${id}`),
  createUser: (payload) => apiClient.post("/user/users", payload),
  importUsers: (file, onUploadProgress) => {
    const formData = new FormData();
    formData.append("file", file);

    return apiClient.post("/user/import", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress,
    });
  },
  createAdmin: (payload) => apiClient.post("/user/admins", payload),
  updateUser: (id, payload) => apiClient.patch(`/user/${id}`, payload),
  updateUserStatus: (id, status) => apiClient.patch(`/user/${id}/status`, { status }),
  changeUserRole: (id, role) => apiClient.patch(`/user/${id}/role`, { role }),
  deleteUser: (id) => apiClient.delete(`/user/${id}`),
  getPermissions: () => apiClient.get("/user/permissions"),
  updatePermissions: (adminId, payload) => apiClient.patch(`/user/permissions/${adminId}`, payload),
  getActivityLogs: ({ page = 1, limit = 20, days = "" } = {}) =>
    apiClient.get("/user/activity-logs", {
      params: { page, limit, days },
    }),
};
