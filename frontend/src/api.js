import axios from "axios";

const apiBase = (process.env.REACT_APP_API_URL || window.location.origin)
  .replace(/\/api$/, "")
  .replace(/\/$/, "");

const API = axios.create({
  baseURL: apiBase,
});

// ✅ attach token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// ✅ handle expired token globally
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default API;