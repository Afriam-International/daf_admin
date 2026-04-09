import apiClient from "./apiClient";

export const feedService = {
  getFeeds: () => apiClient.get("/feed"),
  createFeed: (payload) => {
    const formData = new FormData();
    Object.entries(payload).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        formData.append(key, value);
      }
    });

    return apiClient.post("/feed", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
  updateFeed: (id, payload) => {
    const formData = new FormData();
    Object.entries(payload).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value);
      }
    });

    return apiClient.patch(`/feed/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
  deleteFeed: (id) => apiClient.delete(`/feed/${id}`),
};
