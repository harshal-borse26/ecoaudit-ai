import api from "./api";

export const billService = {
  getAll: () => api.get("/bills"),
  getById: (id) => api.get(`/bills/${id}`),
  getFileUrl: (id, mode = "preview") => api.get(`/bills/${id}/file-url?mode=${mode}`),
  create: (data) =>
    api.post("/bills", data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),
  update: (id, data) => api.put(`/bills/${id}`, data),
  delete: (id) => api.delete(`/bills/${id}`),
  process: (id) => api.post(`/bills/${id}/process`),
};
