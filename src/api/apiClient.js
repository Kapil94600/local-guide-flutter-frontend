import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const api = axios.create({
  baseURL: "http://31.97.227.108:8081/api/",
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// 🔐 REQUEST INTERCEPTOR (TOKEN + SMART HEADERS)
api.interceptors.request.use(
  async (config) => {
    // 🚫 Login / Register pe token nahi bhejna
    const noAuthUrls = ["/user/login", "/user/register"];

    if (!noAuthUrls.some((url) => config.url.includes(url))) {
      const token = await AsyncStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    /**
     * 🔥 IMPORTANT
     * Agar FormData hai (image upload),
     * to Content-Type ko axios khud set karega
     */
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ❗ RESPONSE INTERCEPTOR (SAFE)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem("token");
      console.log("Session expired, please login again");
    }

    // 🔍 GLOBAL API ERROR LOG
    console.log(
      "API ERROR 👉",
      error?.response?.data || error.message
    );

    return Promise.reject(error);
  }
);

export default api;
