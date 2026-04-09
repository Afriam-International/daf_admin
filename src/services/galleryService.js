import apiClient from "./apiClient";

export const galleryService = {
  getImages: () => apiClient.get("/gallery"),
  uploadImage: (file, onUploadProgress) => {
    const formData = new FormData();
    formData.append("image", file);

    return apiClient.post("/gallery", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress,
    });
  },
  deleteImage: (publicId) => apiClient.delete("/gallery", { data: { publicId } }),
};
