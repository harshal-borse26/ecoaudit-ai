import api from "./api";

export const billService = {
  getAll: () => api.get("/bills"),
  getById: (id) => api.get(`/bills/${id}`),
  create: (data) => api.post("/bills", data),
  update: (id, data) => api.put(`/bills/${id}`, data),
  delete: (id) => api.delete(`/bills/${id}`),
  process: (id) => api.post(`/bills/${id}/process`),
};
