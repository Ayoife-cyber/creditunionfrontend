import api from "./axios.js";

export const loginAdmin = (email, password) =>
  api.post("/admin/login", { email, password }).then((res) => res.data);

export const logoutAdmin = () => api.post("/admin/logout").then((res) => res.data);

export const fetchAdminProfile = () => api.get("/admin/me").then((res) => res.data);

export const fetchDashboardStats = () =>
  api.get("/admin/dashboard-stats").then((res) => res.data);

// Designs
export const createDesign = (formData) =>
  api
    .post("/admin/designs", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then((res) => res.data);

export const updateDesign = (id, formData) =>
  api
    .patch(`/admin/designs/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then((res) => res.data);

export const deleteDesign = (id) => api.delete(`/admin/designs/${id}`).then((res) => res.data);

// Categories
export const createCategory = (payload) =>
  api.post("/admin/categories", payload).then((res) => res.data);

export const updateCategory = (id, payload) =>
  api.patch(`/admin/categories/${id}`, payload).then((res) => res.data);

export const deleteCategory = (id) =>
  api.delete(`/admin/categories/${id}`).then((res) => res.data);

// Requests
export const fetchAdminRequests = (params = {}) =>
  api.get("/admin/requests", { params }).then((res) => res.data);

export const fetchAdminRequestById = (id) =>
  api.get(`/admin/requests/${id}`).then((res) => res.data);

export const updateRequestStatus = (id, status) =>
  api.patch(`/admin/requests/${id}`, { status }).then((res) => res.data);
