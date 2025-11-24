import axios from "axios";

const BASE_URL = `https://safetemp-backend.onrender.com/api/`; 

const monitorApi = axios.create({
  baseURL: BASE_URL,
});

export default monitorApi;