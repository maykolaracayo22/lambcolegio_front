// src/services/http.ts
import axios from "axios";
import { API_BASE } from "@/lib/config";

export const http = axios.create({
  baseURL: API_BASE || "/",
  withCredentials: false, // Cambia a true si luego usas Sanctum + cookies
  headers: { 
    "Content-Type": "application/json",
    "Accept": "application/json"
  },
});

// Interceptor de request - agregar token de autenticación
http.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  if (import.meta.env.DEV) {
    console.debug("[HTTP] ->", config.method?.toUpperCase(), config.baseURL + config.url, config.params || config.data);
  }
  return config;
});

// Interceptor de response - manejar errores de autenticación
http.interceptors.response.use(
  (res) => res,
  (err) => {
    if (import.meta.env.DEV) {
      console.error("[HTTP ERROR]", err?.response?.status, err?.response?.data || err.message);
    }
    
    // Si es error 401 (no autorizado), limpiar sesión
    if (err?.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('authUser');
      
      // Redirigir a login si no estamos ya ahí
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/')) {
        window.location.href = '/';
      }
    }
    
    // Si es error 403 con código must_change_password
    if (err?.response?.status === 403 && err?.response?.data?.code === 'must_change_password') {
      window.location.href = '/cambiar-password';
    }
    
    return Promise.reject(err);
  }
);
