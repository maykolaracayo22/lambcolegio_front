// src/services/assignmentsApi.ts
// API para gestión de Asignaciones (Docente - Materia - Sección - Horario)

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

export interface Assignment {
  id: number;
  year: number;
  gestion?: string;
  section_id: number;
  subject_id: number;
  teacher_id: number;
  dia?: string;
  inicio?: string;
  fin?: string;
  aula?: string;
  titular?: boolean;
  estado: 'ACTIVO' | 'INACTIVO';
  created_at?: string;
  updated_at?: string;
  // Relaciones cargadas
  section?: {
    id: number;
    nivel: string;
    grado: string;
    paralelo: string;
    turno?: string;
  };
  subject?: {
    id: number;
    nombre: string;
    codigo?: string;
    area?: string;
  };
  teacher?: {
    id: number;
    nombre: string;
    apellido: string;
    ci?: string;
    nro_rda?: string;
    estado_rda?: string;
  };
}

export interface AssignmentFilters {
  year?: number;
  gestion?: string;
  section_id?: number;
  subject_id?: number;
  teacher_id?: number;
  estado?: 'ACTIVO' | 'INACTIVO';
}

export interface CreateAssignmentData {
  year: number;
  gestion?: string;
  section_id: number;
  subject_id: number;
  teacher_id: number;
  dia?: string;
  inicio?: string;
  fin?: string;
  aula?: string;
  titular?: boolean;
  estado?: 'ACTIVO' | 'INACTIVO';
}

// Obtener lista de asignaciones
export const getAssignments = async (filters: AssignmentFilters = {}): Promise<Assignment[]> => {
  const response = await axios.get(`${API_URL}/assignments`, {
    headers: getAuthHeaders(),
    params: filters,
  });
  return response.data.data || response.data;
};

// Obtener asignación por ID
export const getAssignment = async (id: number): Promise<Assignment> => {
  const response = await axios.get(`${API_URL}/assignments/${id}`, {
    headers: getAuthHeaders(),
  });
  return response.data.data || response.data;
};

// Crear asignación
export const createAssignment = async (data: CreateAssignmentData): Promise<Assignment> => {
  const response = await axios.post(`${API_URL}/assignments`, data, {
    headers: getAuthHeaders(),
  });
  return response.data.data || response.data;
};

// Actualizar asignación
export const updateAssignment = async (id: number, data: Partial<CreateAssignmentData>): Promise<Assignment> => {
  const response = await axios.put(`${API_URL}/assignments/${id}`, data, {
    headers: getAuthHeaders(),
  });
  return response.data.data || response.data;
};

// Eliminar asignación
export const deleteAssignment = async (id: number): Promise<void> => {
  await axios.delete(`${API_URL}/assignments/${id}`, {
    headers: getAuthHeaders(),
  });
};

// Obtener asignaciones por sección
export const getAssignmentsBySection = async (sectionId: number, year?: number): Promise<Assignment[]> => {
  const params: AssignmentFilters = { section_id: sectionId };
  if (year) params.year = year;
  return getAssignments(params);
};

// Obtener asignaciones por docente
export const getAssignmentsByTeacher = async (teacherId: number, year?: number): Promise<Assignment[]> => {
  const params: AssignmentFilters = { teacher_id: teacherId };
  if (year) params.year = year;
  return getAssignments(params);
};

// Helpers para validación de conflictos
export const checkTeacherConflict = (
  assignments: Assignment[],
  teacherId: number,
  dia: string,
  inicio: string,
  fin: string,
  excludeId?: number
): Assignment | null => {
  const teacherAssignments = assignments.filter(
    a => a.teacher_id === teacherId && a.dia === dia && a.id !== excludeId
  );
  
  for (const a of teacherAssignments) {
    if (a.inicio && a.fin && timeOverlaps(inicio, fin, a.inicio, a.fin)) {
      return a;
    }
  }
  return null;
};

export const checkSectionConflict = (
  assignments: Assignment[],
  sectionId: number,
  dia: string,
  inicio: string,
  fin: string,
  excludeId?: number
): Assignment | null => {
  const sectionAssignments = assignments.filter(
    a => a.section_id === sectionId && a.dia === dia && a.id !== excludeId
  );
  
  for (const a of sectionAssignments) {
    if (a.inicio && a.fin && timeOverlaps(inicio, fin, a.inicio, a.fin)) {
      return a;
    }
  }
  return null;
};

// Verificar si dos rangos de tiempo se solapan
function timeOverlaps(start1: string, end1: string, start2: string, end2: string): boolean {
  const toMinutes = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  };
  
  const s1 = toMinutes(start1);
  const e1 = toMinutes(end1);
  const s2 = toMinutes(start2);
  const e2 = toMinutes(end2);
  
  return s1 < e2 && s2 < e1;
}

// Días de la semana
export const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'] as const;
export const diasCortos = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie'] as const;

// Convertir día corto a largo y viceversa
export const diaCortoALargo = (corto: string): string => {
  const map: Record<string, string> = {
    'Lun': 'Lunes',
    'Mar': 'Martes',
    'Mié': 'Miércoles',
    'Jue': 'Jueves',
    'Vie': 'Viernes',
  };
  return map[corto] || corto;
};

export const diaLargoACorto = (largo: string): string => {
  const map: Record<string, string> = {
    'Lunes': 'Lun',
    'Martes': 'Mar',
    'Miércoles': 'Mié',
    'Jueves': 'Jue',
    'Viernes': 'Vie',
  };
  return map[largo] || largo;
};
