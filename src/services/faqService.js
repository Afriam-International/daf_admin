import apiClient from "./apiClient";

export const faqService = {
  getFaqs: () => apiClient.get("/faq"),
  createFaq: (payload) => apiClient.post("/faq", payload),
  updateFaq: (id, payload) => apiClient.patch(`/faq/${id}`, payload),
  deleteFaq: (id) => apiClient.delete(`/faq/${id}`),
};
