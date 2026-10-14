// src/services/coursesApi.ts
// API para gestión de Cursos/Grados (Ley 070 Bolivia)

import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api';

// Tipos
export interface Course {
  id: number;
  nombre: string;
  codigo: string;
  nivel: 'inicial' | 'primaria' | 'secundaria';
  grado: number;
  orden: number;
  descripcion: string | null;
  activo: boolean;
  sections_count?: number;
  created_at: string;
  updated_at: string;
}

export interface NivelInfo {
  value: string;
  label: string;
  max_grados: number;
}

export interface CoursesResponse {
  data: Course[];
  niveles: NivelInfo[];
}

export interface CourseFormData {
  nombre: string;
  codigo: string;
  nivel: 'inicial' | 'primaria' | 'secundaria';
  grado: number;
  orden?: number;
  descripcion?: string;
  activo?: boolean;
}

// Helper para obtener el token
const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return {
    'Authorization': `Bearer ${token}`,
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  };
};

// Obtener todos los cursos
export const getCourses = async (params?: {
  nivel?: string;
  activo?: boolean;
  search?: string;
}): Promise<CoursesResponse> => {
  const response = await axios.get(`${API_URL}/courses`, {
    headers: getAuthHeaders(),
    params,
  });
  return response.data;
};

// Obtener un curso por ID
export const getCourse = async (id: number): Promise<Course> => {
  const response = await axios.get(`${API_URL}/courses/${id}`, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

// Crear nuevo curso
export const createCourse = async (data: CourseFormData): Promise<Course> => {
  const response = await axios.post(`${API_URL}/courses`, data, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

// Actualizar curso
export const updateCourse = async (id: number, data: Partial<CourseFormData>): Promise<Course> => {
  const response = await axios.put(`${API_URL}/courses/${id}`, data, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

// Eliminar curso
export const deleteCourse = async (id: number): Promise<void> => {
  await axios.delete(`${API_URL}/courses/${id}`, {
    headers: getAuthHeaders(),
  });
};

// Generar cursos estándar de Bolivia
export const generarCursosEstandar = async (): Promise<{ message: string; data: Course[] }> => {
  const response = await axios.post(`${API_URL}/courses/generar-estandar`, {}, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

// Helper para obtener nombre descriptivo del nivel
export const getNivelLabel = (nivel: string): string => {
  const labels: Record<string, string> = {
    inicial: 'Nivel Inicial',
    primaria: 'Nivel Primario',
    secundaria: 'Nivel Secundario',
  };
  return labels[nivel] || nivel;
};

// Helper para obtener color del nivel
export const getNivelColor = (nivel: string): string => {
  const colors: Record<string, string> = {
    inicial: 'bg-green-100 text-green-800',
    primaria: 'bg-blue-100 text-blue-800',
    secundaria: 'bg-purple-100 text-purple-800',
  };
  return colors[nivel] || 'bg-gray-100 text-gray-800';
};
