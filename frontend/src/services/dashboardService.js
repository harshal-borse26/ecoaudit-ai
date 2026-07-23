import api from "./api";

export const dashboardService = {
  getSummary: () => api.get("/dashboard/summary"),
  getMonthlyCarbonTrend: () => api.get("/dashboard/monthly-carbon"),
  getUtilityDistribution: () => api.get("/dashboard/utility-distribution"),
  getFacilityEmissions: () => api.get("/dashboard/facility-emissions"),
  getRecentBills: () => api.get("/dashboard/recent-bills"),
};
