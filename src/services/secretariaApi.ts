// src/services/secretariaApi.ts
// API para módulo de Secretaría - Preinscripciones y RUDE

import axios from "axios";
import { API_BASE } from "@/lib/config";
import type { NivelKey } from "@/lib/sections";

// Cliente HTTP
const api = axios.create({
  baseURL: API_BASE,
  withCredentials: false,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

// Agregar token si existe
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ===== TIPOS =====

export type PreinscriptionStatus = "pendiente" | "aprobada" | "rechazada";

export interface Preinscription {
  id: number;
  codigo_preinscripcion: string;
  nivel: NivelKey;
  grado: number;
  nombres: string;
  apellidos: string;
  sexo: "M" | "F";
  fecha_nac: string;
  ci?: string;
  nacionalidad?: string;
  dep_nac?: string;
  muni_nac?: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  pueblo_indigena?: string;
  discapacidad?: boolean;
  idiomas?: string[];
  vulnerabilidad?: boolean;
  tutor_nombre: string;
  tutor_ci?: string;
  tutor_parentesco: string;
  tutor_telefono?: string;
  comprobante_path?: string;
  estado: PreinscriptionStatus;
  observaciones?: string;
  created_at: string;
  updated_at: string;
}

export interface PreinscriptionFilters {
  year?: number;
  estado?: PreinscriptionStatus;
  nivel?: NivelKey;
  grado?: number;
  q?: string;
  page?: number;
  per_page?: number;
}

export interface PreinscriptionFormData {
  nivel: NivelKey;
  grado: number;
  nombres: string;
  apellidos: string;
  sexo: "M" | "F";
  fecha_nac: string;
  ci?: string;
  nacionalidad?: string;
  dep_nac?: string;
  muni_nac?: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  pueblo_indigena?: string;
  discapacidad?: boolean;
  idiomas?: string[];
  vulnerabilidad?: boolean;
  tutor_nombre: string;
  tutor_ci?: string;
  tutor_parentesco: string;
  tutor_telefono?: string;
  comprobante?: File;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface SecretariaStats {
  pendientes: number;
  en_revision: number;
  aprobados_hoy: number;
  rechazados_hoy: number;
  total_mes: number;
  por_nivel: {
    inicial: number;
    primaria: number;
    secundaria: number;
  };
}

// ===== FUNCIONES API =====

/**
 * Obtener lista de preinscripciones
 * GET /api/preinscriptions
 */
export async function getPreinscriptions(
  filters?: PreinscriptionFilters
): Promise<PaginatedResponse<Preinscription>> {
  const response = await api.get("/preinscriptions", { params: filters });
  return response.data;
}

/**
 * Obtener una preinscripción por código
 * GET /api/preinscriptions/{codigo}
 */
export async function getPreinscription(codigo: string): Promise<Preinscription> {
  const response = await api.get(`/preinscriptions/${codigo}`);
  return response.data;
}

/**
 * Crear preinscripción (público)
 * POST /api/preinscriptions
 */
export async function createPreinscription(
  data: PreinscriptionFormData
): Promise<Preinscription> {
  const formData = new FormData();
  
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (key === "idiomas" && Array.isArray(value)) {
        value.forEach((idioma, index) => {
          formData.append(`idiomas[${index}]`, idioma);
        });
      } else if (key === "comprobante" && value instanceof File) {
        formData.append("comprobante", value);
      } else {
        formData.append(key, String(value));
      }
    }
  });

  const response = await api.post("/preinscriptions", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
}

/**
 * Aprobar preinscripción
 * PATCH /api/preinscriptions/{id}/approve
 */
export async function approvePreinscription(
  id: number,
  data?: { seccion_id?: number; observaciones?: string }
): Promise<{ message: string; preinscription: Preinscription; student?: unknown }> {
  const response = await api.patch(`/preinscriptions/${id}/approve`, data);
  return response.data;
}

/**
 * Rechazar preinscripción
 * PATCH /api/preinscriptions/{id}/reject
 */
export async function rejectPreinscription(
  id: number,
  observaciones?: string
): Promise<{ message: string; preinscription: Preinscription }> {
  const response = await api.patch(`/preinscriptions/${id}/reject`, { observaciones });
  return response.data;
}

/**
 * Descargar RUDE en PDF
 * GET /api/preinscriptions/{codigo}/rude
 */
export async function downloadRude(codigo: string): Promise<Blob> {
  const response = await api.get(`/preinscriptions/${codigo}/rude`, {
    responseType: "blob",
  });
  return response.data;
}

/**
 * Obtener estadísticas de secretaría
 * Calculadas localmente desde las preinscripciones
 */
export async function getSecretariaStats(): Promise<SecretariaStats> {
  const currentYear = new Date().getFullYear();
  const today = new Date().toISOString().split("T")[0];
  
  // Obtener todas las preinscripciones del año
  const [pendientes, aprobadas, rechazadas] = await Promise.all([
    getPreinscriptions({ year: currentYear, estado: "pendiente", per_page: 1 }),
    getPreinscriptions({ year: currentYear, estado: "aprobada", per_page: 100 }),
    getPreinscriptions({ year: currentYear, estado: "rechazada", per_page: 100 }),
  ]);

  // Contar aprobados/rechazados hoy
  const aprobadosHoy = aprobadas.data.filter(
    (p) => p.updated_at.startsWith(today)
  ).length;
  const rechazadosHoy = rechazadas.data.filter(
    (p) => p.updated_at.startsWith(today)
  ).length;

  // Contar por nivel (pendientes)
  const allPendientes = await getPreinscriptions({ 
    year: currentYear, 
    estado: "pendiente", 
    per_page: 500 
  });

  const porNivel = {
    inicial: allPendientes.data.filter((p) => p.nivel === "inicial").length,
    primaria: allPendientes.data.filter((p) => p.nivel === "primaria").length,
    secundaria: allPendientes.data.filter((p) => p.nivel === "secundaria").length,
  };

  return {
    pendientes: pendientes.total,
    en_revision: 0, // No hay estado "en revisión" en el backend
    aprobados_hoy: aprobadosHoy,
    rechazados_hoy: rechazadosHoy,
    total_mes: pendientes.total + aprobadas.total + rechazadas.total,
    por_nivel: porNivel,
  };
}

// ===== HELPERS =====

export function downloadBlob(blob: Blob, filename: string): void {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

export function getStatusColor(status: PreinscriptionStatus): string {
  const colors: Record<PreinscriptionStatus, string> = {
    pendiente: "bg-yellow-100 text-yellow-700",
    aprobada: "bg-green-100 text-green-700",
    rechazada: "bg-red-100 text-red-700",
  };
  return colors[status] || "bg-gray-100 text-gray-700";
}

export function getStatusLabel(status: PreinscriptionStatus): string {
  const labels: Record<PreinscriptionStatus, string> = {
    pendiente: "Pendiente",
    aprobada: "Aprobada",
    rechazada: "Rechazada",
  };
  return labels[status] || status;
}

export function getNivelColor(nivel: NivelKey): string {
  const colors: Record<NivelKey, string> = {
    inicial: "bg-pink-100 text-pink-700",
    primaria: "bg-blue-100 text-blue-700",
    secundaria: "bg-purple-100 text-purple-700",
  };
  return colors[nivel] || "bg-gray-100 text-gray-700";
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("es-BO", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
