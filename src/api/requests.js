import api from "./axios.js";

// formData should be a FormData instance built by the request form
export const submitRequest = (formData) =>
  api
    .post("/requests", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then((res) => res.data);
