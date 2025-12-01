// src/services/api.ts
import axios from "axios";

/**
 * Cliente HTTP para el backend (Laravel).
 * Asegúrate de tener VITE_API_BASE en tu .env del front, ej:
 * VITE_API_BASE=http://127.0.0.1:8000/api
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000/api",
  withCredentials: false, // 👈 importante para CORS simple
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});


export default api;
