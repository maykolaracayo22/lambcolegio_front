// src/lib/config.ts

/**
 * Configuración de la API del backend
 * El backend Laravel corre en: http://127.0.0.1:8000/api
 */

// ⚠️ URL FIJA - NO CAMBIAR - El backend Laravel usa puerto 8000
export const API_BASE = "http://127.0.0.1:8000/api";
export const HAS_API = true;

// Debug: mostrar qué URL se está usando
if (import.meta.env.DEV) {
  console.log("[config] API_BASE =", API_BASE);
}

// Tiempo de expiración del token (en milisegundos) - 24 horas
export const TOKEN_EXPIRY = 24 * 60 * 60 * 1000;

// Configuración del colegio
export const SCHOOL_CONFIG = {
  name: 'Colegio Bolivia',
  year: new Date().getFullYear(),
  levels: ['inicial', 'primaria', 'secundaria'] as const,
  terms: ['T1', 'T2', 'T3'] as const,
};
