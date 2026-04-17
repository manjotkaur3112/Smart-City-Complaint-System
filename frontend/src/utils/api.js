import axios from "axios";


const rawApiUrl = process.env.REACT_APP_API_URL?.trim();
const apiBaseURL = rawApiUrl
  ? rawApiUrl.match(/^https?:\/\//i)
    ? rawApiUrl.replace(/\/+$/, "")
    : `http://${rawApiUrl.replace(/\/+$/, "")}`
  : process.env.NODE_ENV === "development"
    ? "http://localhost:5000/api"
    : "/api";

const api = axios.create({
  baseURL: apiBaseURL,
});

if (process.env.NODE_ENV === "development") {
  console.debug("Axios API baseURL:", apiBaseURL);
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      console.error("Network error: backend is unreachable", {
        message: error.message,
        code: error.code,
        method: error.config?.method,
        url: error.config?.url,
        baseURL: error.config?.baseURL,
      });
    }
    return Promise.reject(error);
  }
);

export default api;
