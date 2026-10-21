import api from "./axios.js";

export const fetchDesigns = (params = {}) =>
  api.get("/designs", { params }).then((res) => res.data);

export const fetchDesignByIdOrSlug = (idOrSlug) =>
  api.get(`/designs/${idOrSlug}`).then((res) => res.data);

export const fetchCategories = () => api.get("/categories").then((res) => res.data);
