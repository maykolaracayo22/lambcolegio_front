// src/services/api.ts
import axios from "axios";
import { API_BASE } from "@/lib/config";

/**
 * Cliente HTTP para el backend Laravel.
 * Configuración centralizada en lib/config.ts
 * VITE_API_BASE=http://127.0.0.1:8000/api
 */
const api = axios.create({
  baseURL: API_BASE,
  withCredentials: false,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

// Interceptor para agregar token de autenticación
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
