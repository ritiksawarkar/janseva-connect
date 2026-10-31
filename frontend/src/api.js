import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

export const serviceApi = {
  getAll: (params) => apiClient.get("/services", { params }),
  getById: (id) => apiClient.get(`/services/${id}`),
  getCategories: () => apiClient.get("/services/categories"),
  getDepartments: () => apiClient.get("/services/departments"),
};

export const schemeApi = {
  getAll: (params) => apiClient.get("/schemes", { params }),
  getFeatured: (limit = 4) => apiClient.get("/schemes/featured", { params: { limit } }),
  getById: (id) => apiClient.get(`/schemes/${id}`),
  getCategories: () => apiClient.get("/schemes/categories"),
};

export const eligibilityApi = {
  check: (payload) => apiClient.post("/eligibility/check", payload),
};

export const contactApi = {
  submit: (payload) => apiClient.post("/contact", payload),
};

export const statsApi = {
  getOverview: () => apiClient.get("/stats"),
};

export default apiClient;
