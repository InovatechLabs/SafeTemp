import axios from "axios";

const api = axios.create({
  baseURL: `https://safetemp-backend.onrender.com/api/`,
  withCredentials: true
});

export default api;