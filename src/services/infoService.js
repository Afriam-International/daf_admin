import apiClient from "./apiClient";

const toFormData = (payload = {}) => {
  const formData = new FormData();

  Object.entries(payload).forEach(([key, value]) => {
    if (key === "images" && Array.isArray(value)) {
      value.forEach((file) => {
        if (file) formData.append("images", file);
      });
      return;
    }

    if (key === "retainedImages" && Array.isArray(value)) {
      formData.append("retainedImages", JSON.stringify(value));
      return;
    }

    if (value !== undefined && value !== null && value !== "") {
      formData.append(key, value);
    }
  });

  return formData;
};

export const infoService = {
  getInfos: () => apiClient.get("/info"),
  createInfo: (payload) =>
    apiClient.post("/info", toFormData(payload), {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  updateInfo: (id, payload) =>
    apiClient.patch(`/info/${id}`, toFormData(payload), {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  deleteInfo: (id) => apiClient.delete(`/info/${id}`),
};
