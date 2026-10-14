// src/services/parentsApi.ts
// API para gestión de Padres de Familia

import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api';

// Tipos
export interface Parent {
  id: number;
  user_id: number;
  ci: string;
  phone: string;
  address: string | null;
  ocupacion: string | null;
  lugar_trabajo: string | null;
  nombre_completo: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
  students: ParentStudent[];
  created_at: string;
  updated_at: string;
}

export interface ParentStudent {
  id: number;
  nombres: string;
  apellidos: string;
  codigo: string;
  nivel: string;
  curso: string;
  paralelo: string;
  pivot: {
    relationship: string;
  };
}

export interface ParentsResponse {
  data: Parent[];
  current_page?: number;
  total?: number;
  per_page?: number;
}

export interface ParentFormData {
  nombre: string;
  apellidos: string;
  ci: string;
  email: string;
  phone: string;
  address?: string;
  ocupacion?: string;
  lugar_trabajo?: string;
  student_ids?: number[];
  relationship?: 'padre' | 'madre' | 'tutor' | 'abuelo' | 'otro';
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

// Obtener todos los padres
export const getParents = async (params?: {
  search?: string;
  student_id?: number;
  per_page?: number;
}): Promise<ParentsResponse> => {
  const response = await axios.get(`${API_URL}/parents`, {
    headers: getAuthHeaders(),
    params,
  });
  return response.data;
};

// Buscar padres (para selector)
export const searchParents = async (query: string): Promise<ParentsResponse> => {
  const response = await axios.get(`${API_URL}/parents-search`, {
    headers: getAuthHeaders(),
    params: { q: query },
  });
  return response.data;
};

// Obtener un padre por ID
export const getParent = async (id: number): Promise<Parent> => {
  const response = await axios.get(`${API_URL}/parents/${id}`, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

// Crear nuevo padre
export const createParent = async (data: ParentFormData): Promise<Parent> => {
  const response = await axios.post(`${API_URL}/parents`, data, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

// Actualizar padre
export const updateParent = async (id: number, data: Partial<ParentFormData>): Promise<Parent> => {
  const response = await axios.put(`${API_URL}/parents/${id}`, data, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

// Eliminar padre
export const deleteParent = async (id: number): Promise<void> => {
  await axios.delete(`${API_URL}/parents/${id}`, {
    headers: getAuthHeaders(),
  });
};

// Vincular estudiante a padre
export const attachStudent = async (
  parentId: number, 
  studentId: number, 
  relationship: string
): Promise<Parent> => {
  const response = await axios.post(
    `${API_URL}/parents/${parentId}/attach-student`,
    { student_id: studentId, relationship },
    { headers: getAuthHeaders() }
  );
  return response.data.parent;
};

// Desvincular estudiante de padre
export const detachStudent = async (parentId: number, studentId: number): Promise<Parent> => {
  const response = await axios.delete(
    `${API_URL}/parents/${parentId}/detach-student/${studentId}`,
    { headers: getAuthHeaders() }
  );
  return response.data.parent;
};

// Helper para obtener etiqueta de relación
export const getRelationshipLabel = (relationship: string): string => {
  const labels: Record<string, string> = {
    padre: 'Padre',
    madre: 'Madre',
    tutor: 'Tutor Legal',
    abuelo: 'Abuelo/a',
    otro: 'Otro',
  };
  return labels[relationship] || relationship;
};

// Opciones de relación para selectores
export const relationshipOptions = [
  { value: 'padre', label: 'Padre' },
  { value: 'madre', label: 'Madre' },
  { value: 'tutor', label: 'Tutor Legal' },
  { value: 'abuelo', label: 'Abuelo/a' },
  { value: 'otro', label: 'Otro' },
];
