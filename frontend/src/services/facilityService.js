import api from "./api";

export const facilityService = {
  getAll: () => api.get("/facilities"),
  getById: (id) => api.get(`/facilities/${id}`),
  create: (data) => api.post("/facilities", data),
  update: (id, data) => api.put(`/facilities/${id}`, data),
  delete: (id) => api.delete(`/facilities/${id}`),
};
