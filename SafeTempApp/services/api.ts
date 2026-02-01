import axios from "axios";
import * as SecureStore from 'expo-secure-store';
import { Notification } from "../src/utils/types/notifications";

const api = axios.create({
//  baseURL: `https://st-api.up.railway.app/api/`,
baseURL: `http://192.168.15.5:3000/api/`,
  withCredentials: true
});

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getNotifications = () => api.get<Notification[]>('notifications/list');
export const markNotificationsAsRead = () => api.patch('notifications/read');

export default api;