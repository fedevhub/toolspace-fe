import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://127.0.0.1:3000/api",
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url ?? "";
    if (error.response?.status === 401 && !url.includes("/auth/login")) {
      localStorage.removeItem("token");
      localStorage.removeItem("isLogin");
      localStorage.removeItem("user");
      if (window.location.pathname !== "/login")
        window.location.assign("/login");
    }
    return Promise.reject(error);
  },
);

export default api;
