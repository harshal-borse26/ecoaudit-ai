import api from "./api";

export const reportService = {
  // Fetch JSON report payload for in-browser preview
  preview: (filters) => api.post("/reports/preview", filters),

  // Generate & download PDF report blob
  downloadPDF: (filters) =>
    api.post("/reports/generate", filters, {
      responseType: "blob",
    }),
};
