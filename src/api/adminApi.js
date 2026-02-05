import api from "./apiClient";

export const getAdminDashboard = () =>
  api.post("/main/admin_dashboard");

export const getSettings = () =>
  api.post("/settings/get");

export const updateSettings = (data) =>
  api.post("/settings/update", data);
