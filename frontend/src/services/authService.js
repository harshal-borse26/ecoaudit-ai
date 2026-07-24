import api from "./api";

export const authService = {
  signup: (data) => api.post("/auth/signup", data),
  login: (data) => api.post("/auth/login", data),
  getMe: () => api.get("/auth/me"),
  getProfile: () => api.get("/auth/profile"),
  changePassword: (data) => api.put("/auth/change-password", data),
};
