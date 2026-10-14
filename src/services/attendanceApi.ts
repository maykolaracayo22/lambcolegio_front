// src/services/attendanceApi.ts
// API para gestión de asistencia

import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return {
    'Authorization': `Bearer ${token}`,
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  };
};

// Tipos
export interface AttendanceRecord {
  id: number;
  student_id: number;
  section_id: number;
  subject_id: number;
  teacher_id: number;
  fecha: string;
  estado: 'presente' | 'ausente' | 'tardanza' | 'justificado';
  observaciones?: string;
  created_at?: string;
  updated_at?: string;
  student?: {
    id: number;
    nombres: string;
    apellidos: string;
    codigo: string;
  };
  section?: {
    id: number;
    nivel: string;
    curso: string;
    paralelo: string;
  };
  subject?: {
    id: number;
    nombre: string;
    codigo: string;
  };
  teacher?: {
    id: number;
    nombres: string;
    apellidos: string;
  };
}

export interface AttendanceFormData {
  student_id: number;
  section_id: number;
  subject_id: number;
  teacher_id: number;
  fecha: string;
  estado: 'presente' | 'ausente' | 'tardanza' | 'justificado';
  observaciones?: string;
}

export interface BulkAttendanceData {
  section_id: number;
  subject_id: number;
  teacher_id: number;
  fecha: string;
  attendances: {
    student_id: number;
    estado: 'presente' | 'ausente' | 'tardanza' | 'justificado';
    observaciones?: string;
  }[];
}

export interface AttendanceFilters {
  section_id?: number;
  subject_id?: number;
  teacher_id?: number;
  student_id?: number;
  fecha?: string;
  page?: number;
  per_page?: number;
}

export interface StudentAttendanceReport {
  student: {
    id: number;
    nombres: string;
    apellidos: string;
    codigo: string;
  };
  attendances: AttendanceRecord[];
  summary: {
    total_clases: number;
    presentes: number;
    ausentes: number;
    tardanzas: number;
    justificados: number;
    porcentaje_asistencia: number;
  };
}

// Obtener lista de asistencias
export const getAttendances = async (filters: AttendanceFilters = {}) => {
  const response = await axios.get(`${API_URL}/attendance`, {
    headers: getAuthHeaders(),
    params: filters,
  });
  return response.data;
};

// Registrar asistencia individual
export const createAttendance = async (data: AttendanceFormData) => {
  const response = await axios.post(`${API_URL}/attendance`, data, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

// Registrar asistencia masiva (bulk)
export const bulkCreateAttendance = async (data: BulkAttendanceData) => {
  const response = await axios.post(`${API_URL}/attendance/bulk`, data, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

// Obtener reporte de asistencia de un estudiante
export const getStudentAttendanceReport = async (
  studentId: number, 
  fechaDesde?: string, 
  fechaHasta?: string
): Promise<StudentAttendanceReport> => {
  const response = await axios.get(`${API_URL}/attendance/report/${studentId}`, {
    headers: getAuthHeaders(),
    params: { fecha_desde: fechaDesde, fecha_hasta: fechaHasta },
  });
  return response.data;
};

// Colores para estados de asistencia
export const getEstadoColor = (estado: string) => {
  const colors: Record<string, string> = {
    presente: 'bg-green-100 text-green-800 border-green-300',
    ausente: 'bg-red-100 text-red-800 border-red-300',
    tardanza: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    justificado: 'bg-blue-100 text-blue-800 border-blue-300',
  };
  return colors[estado] || 'bg-gray-100 text-gray-800';
};

export const getEstadoLabel = (estado: string) => {
  const labels: Record<string, string> = {
    presente: 'Presente',
    ausente: 'Ausente',
    tardanza: 'Tardanza',
    justificado: 'Justificado',
  };
  return labels[estado] || estado;
};

export const estadoOptions = [
  { value: 'presente', label: 'Presente', color: 'text-green-600' },
  { value: 'ausente', label: 'Ausente', color: 'text-red-600' },
  { value: 'tardanza', label: 'Tardanza', color: 'text-yellow-600' },
  { value: 'justificado', label: 'Justificado', color: 'text-blue-600' },
];
