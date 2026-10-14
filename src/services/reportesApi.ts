// src/services/reportesApi.ts
// API para Centralizador y Reportes - Conectado a Backend Laravel

import axios from "axios";
import { API_BASE } from "@/lib/config";
import type { Term } from "@/lib/types-admin";
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

export interface CentralizadorFilters {
  year: number;
  grado: string;
  seccion: string;
  term: Term;
}

export interface CentralizadorStudent {
  id: number;
  nombres: string;
  apellidos: string;
}

export interface CentralizadorMateria {
  id: number;
  nombre: string;
  nivel?: string;
}

export interface CentralizadorCelda {
  student_id: number;
  subject_id: number;
  t: number | null;
}

export interface CentralizadorPA {
  student_id: number;
  pa: number | null;
}

export interface CentralizadorResponse {
  alumnos: CentralizadorStudent[];
  materias: CentralizadorMateria[];
  celdas: CentralizadorCelda[];
  pa: CentralizadorPA[];
  meta: {
    year: number;
    grado: string;
    seccion: string;
    term: string;
  };
}

export interface StudentCentralizadorRow {
  materia_id: number;
  materia_nombre: string;
  t1: number | null;
  t2: number | null;
  t3: number | null;
  pa: number | null;
}

export interface StudentCentralizadorResponse {
  student: {
    id: number;
    nombres: string;
    apellidos: string;
  };
  year: number;
  rows: StudentCentralizadorRow[];
}

export interface CalculateCentralizadorRequest {
  year: number;
  grado: string;
  seccion: string;
  nivel: NivelKey;
}

export interface CalculateCentralizadorResponse {
  message: string;
  data: {
    year: number;
    grado: string;
    seccion: string;
    estudiantes_procesados: number;
    materias_procesadas: number;
    lineas_creadas: number;
  };
}

export interface ValidateCentralizadorResponse {
  listo_para_calcular: boolean;
  advertencias: string[];
  errores: string[];
  resumen: {
    total_actas_publicadas: number;
    actas_t1: number;
    actas_t2: number;
    actas_t3: number;
  };
}

// ===== FUNCIONES API =====

/**
 * Obtener centralizado por curso
 * GET /api/centralizador/course
 */
export async function getCentralizadorByCourse(
  filters: CentralizadorFilters
): Promise<CentralizadorResponse> {
  const response = await api.get("/centralizador/course", {
    params: {
      year: filters.year,
      grado: filters.grado,
      seccion: filters.seccion,
      term: filters.term.replace("T", ""), // Backend espera 1, 2, 3
    },
  });
  return response.data;
}

/**
 * Obtener centralizado de un estudiante
 * GET /api/centralizador/student/{student_id}
 */
export async function getCentralizadorByStudent(
  studentId: number,
  year: number
): Promise<StudentCentralizadorResponse> {
  const response = await api.get(`/centralizador/student/${studentId}`, {
    params: { year },
  });
  return response.data;
}

/**
 * Calcular/recalcular centralizado
 * POST /api/centralizador/calculate
 */
export async function calculateCentralizador(
  data: CalculateCentralizadorRequest
): Promise<CalculateCentralizadorResponse> {
  const response = await api.post("/centralizador/calculate", data);
  return response.data;
}

/**
 * Validar antes de calcular
 * POST /api/centralizador/validate
 */
export async function validateCentralizador(
  data: CalculateCentralizadorRequest
): Promise<ValidateCentralizadorResponse> {
  const response = await api.post("/centralizador/validate", data);
  return response.data;
}

/**
 * Exportar centralizado a PDF - abre descarga directa
 * GET /api/centralizador/export/pdf
 */
export async function exportCentralizadorPDF(
  year: number,
  grado: string,
  seccion: string
): Promise<Blob> {
  const response = await api.get("/centralizador/export/pdf", {
    params: { year, grado, seccion },
    responseType: "blob",
  });
  return response.data;
}

/**
 * Descargar blob como archivo
 */
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

// ===== HELPERS PARA EXPORTACIÓN CSV (Local) =====

/**
 * Convertir datos del centralizado a CSV
 */
export function centralizadorToCSV(data: CentralizadorResponse): string {
  const { alumnos, materias, celdas, pa, meta } = data;

  // Header
  const headers = ["Estudiante", ...materias.map((m) => m.nombre), "PA"];

  // Filas
  const rows = alumnos.map((alumno) => {
    const nombreCompleto = `${alumno.apellidos}, ${alumno.nombres}`;

    const notas = materias.map((materia) => {
      const celda = celdas.find(
        (c) => c.student_id === alumno.id && c.subject_id === materia.id
      );
      return celda?.t ?? "-";
    });

    const paValue = pa.find((p) => p.student_id === alumno.id)?.pa ?? "-";

    return [nombreCompleto, ...notas, paValue];
  });

  // Generar CSV
  const csvContent = [
    `# Centralizador ${meta.year} - ${meta.grado} ${meta.seccion} - Trimestre ${meta.term}`,
    headers.join(","),
    ...rows.map((row) => row.join(",")),
  ].join("\n");

  return csvContent;
}

/**
 * Descargar CSV
 */
export function downloadCSV(content: string, filename: string): void {
  const blob = new Blob(["\ufeff" + content], {
    type: "text/csv;charset=utf-8",
  });
  downloadBlob(blob, filename);
}

// ===== COLORES PARA UI =====

export function getNivelColor(nivel: NivelKey): string {
  const colors: Record<NivelKey, string> = {
    inicial: "bg-pink-100 text-pink-700",
    primaria: "bg-blue-100 text-blue-700",
    secundaria: "bg-purple-100 text-purple-700",
  };
  return colors[nivel] || "bg-gray-100 text-gray-700";
}

export function getTermLabel(term: Term): string {
  const labels: Record<Term, string> = {
    T1: "Primer Trimestre",
    T2: "Segundo Trimestre",
    T3: "Tercer Trimestre",
  };
  return labels[term] || term;
}
