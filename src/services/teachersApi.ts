// src/services/teachersApi.ts
import axios, { AxiosInstance } from "axios";
import { API_BASE } from "@/lib/config";

export interface Teacher {
  id: number;
  nombres: string;
  apellidos: string;
  email: string;
  telefono?: string | null;
  ci: string;
  rda_numero: string;
  rda_estado: "VIGENTE" | "OBSERVADO" | "VENCIDO";
  estado: "activo" | "licencia" | "inactivo";
  activo?: boolean;
  anio_ingreso: string;
  mes_ingreso?: string;
  usuario?: string;
  password_temp?: string;
  created_at?: string;
  updated_at?: string;
}

export interface TeacherFormData {
  nombres: string;
  apellidos: string;
  email: string;
  telefono?: string;
  ci: string;
  rda_numero: string;
  rda_estado: "VIGENTE" | "OBSERVADO" | "VENCIDO";
  estado: "activo" | "licencia" | "inactivo";
  anio_ingreso: string;
  mes_ingreso: string;
}

export interface TeacherFilters {
  activo?: boolean | string;
  q?: string;
  estado?: string;
  per_page?: number;
  page?: number;
}

export interface TeacherPortalProfile {
  id: number;
  nombres: string;
  apellidos: string;
  email: string;
  ci?: string | null;
  telefono?: string | null;
  rda_numero?: string | null;
  rda_estado?: string | null;
  estado?: string;
  especialidad?: string | null;
  nivel_formacion?: string | null;
  turno?: string | null;
  fecha_ingreso?: string | null;
  anio_ingreso?: string | null;
  mes_ingreso?: string | null;
  rda_vencimiento?: string | null;
  usuario?: string | null;
  allowed_levels?: string[];
  assignments_count: number;
}

export interface TeacherAssignedSection {
  id: number;
  year: string | number;
  nivel: string;
  curso: string;
  paralelo: string;
  turno?: string | null;
  aula?: string | null;
  assignments: Array<{
    id: number;
    subject_id: number;
    dia?: string | null;
    inicio?: string | null;
    fin?: string | null;
    aula?: string | null;
    subject?: { id: number; nombre: string; nivel?: string; area?: string | null } | null;
  }>;
}

export interface TeacherSectionStudent {
  id: number;
  enrollment_id: number;
  estado_matricula: string;
  fecha_inscripcion?: string | null;
  nombres: string;
  apellidos: string;
  ci?: string | null;
  email?: string | null;
  telefono?: string | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

const api: AxiosInstance = axios.create({
  baseURL: API_BASE,
  withCredentials: false,
  timeout: 15000,
  headers: { Accept: "application/json" },
});

// Interceptor para agregar token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/**
 * Lista docentes con paginación y búsqueda
 */
export async function listTeachers(params?: TeacherFilters): Promise<PaginatedResponse<Teacher>> {
  const res = await api.get<PaginatedResponse<Teacher>>("/teachers", { params });
  return res.data;
}

/**
 * Buscar docentes por nombre/apellido para selector
 */
export async function searchTeachers(query: string): Promise<Teacher[]> {
  const res = await api.get<PaginatedResponse<Teacher>>("/teachers", {
    params: { q: query, per_page: 20, activo: true },
  });
  return res.data.data;
}

/**
 * Obtener un docente por ID
 */
export async function getTeacher(id: number | string): Promise<Teacher> {
  const res = await api.get<Teacher>(`/teachers/${id}`);
  return res.data;
}

/** Perfil del docente asociado al usuario autenticado. */
export async function getMyTeacherProfile(year?: string | number): Promise<TeacherPortalProfile> {
  const res = await api.get<TeacherPortalProfile>("/teachers/me", { params: year ? { year } : undefined });
  return res.data;
}

/** Secciones y materias activas asignadas al docente autenticado. */
export async function getMyTeacherSections(
  year: string | number,
  nivel: string,
): Promise<PaginatedResponse<TeacherAssignedSection>> {
  const res = await api.get<PaginatedResponse<TeacherAssignedSection>>("/teacher/sections", {
    params: { year, nivel, per_page: 200 },
  });
  return res.data;
}

/** Alumnos de una sección solo cuando está asignada al docente autenticado. */
export async function getMyTeacherSectionStudents(sectionId: number | string): Promise<TeacherSectionStudent[]> {
  const res = await api.get<{ estudiantes: TeacherSectionStudent[] }>(`/teacher/sections/${sectionId}/students`);
  return res.data.estudiantes || [];
}

/**
 * Crear docente (backend genera usuario y password)
 */
export async function createTeacher(data: TeacherFormData): Promise<{ teacher: Teacher; user: { id: number; name: string; email: string }; password_temp: string }> {
  const res = await api.post("/teachers", data);
  return res.data;
}

/**
 * Actualizar docente
 */
export async function updateTeacher(id: number, data: Partial<TeacherFormData>): Promise<Teacher> {
  const res = await api.put(`/teachers/${id}`, data);
  return res.data;
}

/**
 * Eliminar docente
 */
export async function deleteTeacher(id: number): Promise<void> {
  await api.delete(`/teachers/${id}`);
}
