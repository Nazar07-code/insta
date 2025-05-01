import axios from "axios";

const Api_Base_Url = "http://127.0.0.1:8000/api/v1";

const instance = axios.create({
  baseURL: Api_Base_Url,
  headers: {
    "Content-Type": "application/json",
  },
});

instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});
export default instance;
