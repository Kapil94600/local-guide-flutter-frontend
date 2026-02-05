import axios from "axios";

const api = axios.create({
  baseURL: "http://31.97.227.108:8081/api",
  timeout: 10000,
});

export default api;
