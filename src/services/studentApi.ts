// src/services/studentApi.ts
// API para gestión de estudiantes

import axios, { AxiosInstance } from 'axios';
import { API_BASE } from '@/lib/config';

export interface Student {
  id: number;
  codigo: string;
  nombres: string;
  apellidos: string;
  nivel: 'inicial' | 'primaria' | 'secundaria';
  curso: string;
  paralelo: string;
  email?: string | null;
  fecha_nac?: string | null;
  sexo?: 'M' | 'F' | null;
  anio_ingreso: string;
  mes_ingreso?: string;
  usuario?: string;
  password_temp?: string;
  activo: boolean;
  // Campos adicionales Bolivia
  rude?: string | null;
  ci?: string | null;
  direccion?: string | null;
  tutor_nombre?: string | null;
  tutor_telefono?: string | null;
  tutor_ci?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface StudentFormData {
  nombres: string;
  apellidos: string;
  nivel: 'inicial' | 'primaria' | 'secundaria';
  curso: string;
  paralelo: string;
  email?: string;
  fecha_nac?: string;
  sexo?: 'M' | 'F';
  anio_ingreso: string;
  mes_ingreso: string;
  activo?: boolean;
}

export interface StudentFilters {
  nivel?: string;
  curso?: string;
  paralelo?: string;
  activo?: boolean | string;
  q?: string;
  per_page?: number;
  page?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

// Crear instancia de axios
const api: AxiosInstance = axios.create({
  baseURL: API_BASE,
  withCredentials: false,
  timeout: 15000,
  headers: { 
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Obtener lista de estudiantes paginada
export async function getStudents(filters: StudentFilters = {}): Promise<PaginatedResponse<Student>> {
  const response = await api.get<PaginatedResponse<Student>>('/students', { params: filters });
  return response.data;
}

// Obtener un estudiante por ID
export async function getStudent(id: number): Promise<Student> {
  const response = await api.get<Student>(`/students/${id}`);
  return response.data;
}

// Crear estudiante (backend genera código, usuario y password)
export async function createStudent(data: StudentFormData): Promise<{ student: Student; user: { id: number; name: string; email: string }; password_temp: string }> {
  const response = await api.post('/students', data);
  return response.data;
}

// Actualizar estudiante
export async function updateStudent(id: number, data: Partial<StudentFormData>): Promise<Student> {
  const response = await api.put(`/students/${id}`, data);
  return response.data;
}

// Eliminar estudiante
export async function deleteStudent(id: number): Promise<void> {
  await api.delete(`/students/${id}`);
}

// Buscar estudiantes (para selectores)
export async function searchStudents(query: string, limit: number = 20): Promise<Student[]> {
  const response = await api.get<PaginatedResponse<Student>>('/students', {
    params: { q: query, per_page: limit, activo: true },
  });
  return response.data.data;
}
