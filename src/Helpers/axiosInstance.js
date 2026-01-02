import axios from "axios";

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1";


const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const tempToken = localStorage.getItem('tempAuthToken');
    const authToken = localStorage.getItem('token');

    const token = tempToken || authToken;

    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      console.log("Authentication error detected");

      const isVerifying2FA = error.config.url.includes('verify-2fa');

      if (!isVerifying2FA) {
        localStorage.removeItem('token');
        localStorage.removeItem('data');
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('role');
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
