// src/services/http.ts
import axios from "axios";
import { API_BASE } from "@/lib/config";

export const http = axios.create({
  baseURL: API_BASE || "/",
  withCredentials: false, // Cambia a true si luego usas Sanctum + cookies
  headers: { "Content-Type": "application/json" },
});

// Interceptores opcionales (logs simples en dev)
http.interceptors.request.use((cfg) => {
  if (import.meta.env.DEV) console.debug("[HTTP] ->", cfg.method?.toUpperCase(), cfg.baseURL + cfg.url, cfg.params || cfg.data);
  return cfg;
});
http.interceptors.response.use(
  (res) => res,
  (err) => {
    if (import.meta.env.DEV) console.error("[HTTP ERROR]", err?.response?.status, err?.response?.data || err.message);
    return Promise.reject(err);
  }
);
