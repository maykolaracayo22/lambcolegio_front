// src/services/enrollmentsApi.ts
// API para gestión de Inscripciones/Matrículas

import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api';

// Tipos
export interface Enrollment {
  id: number;
  year: string;
  student_id: number;
  section_id: number;
  estado: 'PREINSCRITO' | 'INSCRITO' | 'BAJA_TEMP' | 'BAJA_DEF';
  fecha: string | null;
  code: string;
  student: EnrollmentStudent;
  section: EnrollmentSection;
  created_at: string;
  updated_at: string;
}

export interface EnrollmentStudent {
  id: number;
  nombres: string;
  apellidos: string;
  codigo: string;
  ci: string | null;
  nivel: string;
}

export interface EnrollmentSection {
  id: number;
  nivel: string;
  curso: string;
  paralelo: string;
  turno: string;
  year: number;
  capacidad: number;
}

export interface EnrollmentsResponse {
  data: Enrollment[];
  current_page: number;
  total: number;
  per_page: number;
  last_page: number;
}

export interface EnrollmentFormData {
  year: string;
  student_id: number;
  section_id: number;
  estado?: 'PREINSCRITO' | 'INSCRITO' | 'BAJA_TEMP' | 'BAJA_DEF';
  fecha?: string;
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

// Obtener todas las inscripciones
export const getEnrollments = async (params?: {
  year?: string;
  section_id?: number;
  estado?: string;
  page?: number;
  per_page?: number;
}): Promise<EnrollmentsResponse> => {
  const response = await axios.get(`${API_URL}/enrollments`, {
    headers: getAuthHeaders(),
    params,
  });
  return response.data;
};

// Obtener una inscripción por ID
export const getEnrollment = async (id: number): Promise<Enrollment> => {
  const response = await axios.get(`${API_URL}/enrollments/${id}`, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

// Crear nueva inscripción
export const createEnrollment = async (data: EnrollmentFormData): Promise<Enrollment> => {
  const response = await axios.post(`${API_URL}/enrollments`, data, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

// Actualizar inscripción
export const updateEnrollment = async (
  id: number, 
  data: Partial<EnrollmentFormData>
): Promise<Enrollment> => {
  const response = await axios.put(`${API_URL}/enrollments/${id}`, data, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

// Eliminar inscripción
export const deleteEnrollment = async (id: number): Promise<void> => {
  await axios.delete(`${API_URL}/enrollments/${id}`, {
    headers: getAuthHeaders(),
  });
};

// Helper para obtener color del estado
export const getEstadoColor = (estado: string): string => {
  const colors: Record<string, string> = {
    PREINSCRITO: 'bg-yellow-100 text-yellow-800',
    INSCRITO: 'bg-green-100 text-green-800',
    BAJA_TEMP: 'bg-orange-100 text-orange-800',
    BAJA_DEF: 'bg-red-100 text-red-800',
  };
  return colors[estado] || 'bg-gray-100 text-gray-800';
};

// Helper para obtener etiqueta del estado
export const getEstadoLabel = (estado: string): string => {
  const labels: Record<string, string> = {
    PREINSCRITO: 'Pre-inscrito',
    INSCRITO: 'Inscrito',
    BAJA_TEMP: 'Baja Temporal',
    BAJA_DEF: 'Baja Definitiva',
  };
  return labels[estado] || estado;
};

// Opciones de estado para selectores
export const estadoOptions = [
  { value: 'PREINSCRITO', label: 'Pre-inscrito' },
  { value: 'INSCRITO', label: 'Inscrito' },
  { value: 'BAJA_TEMP', label: 'Baja Temporal' },
  { value: 'BAJA_DEF', label: 'Baja Definitiva' },
];
