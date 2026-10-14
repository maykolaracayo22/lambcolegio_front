// src/services/conductApi.ts
// API para gestión de Conducta/Incidentes de comportamiento

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
export interface ConductIncident {
  id: number;
  student_id: number;
  tipo: 'positiva' | 'negativa';
  descripcion: string;
  fecha: string;
  severidad: 'leve' | 'moderada' | 'grave';
  acciones_tomadas?: string;
  reported_by: number;
  aprobado_por?: number;
  aprobado_at?: string;
  created_at?: string;
  updated_at?: string;
  student?: {
    id: number;
    nombres: string;
    apellidos: string;
    codigo: string;
    nivel?: string;
    curso?: string;
    paralelo?: string;
  };
  reported_by_user?: {
    id: number;
    name: string;
  };
  aprobado_por_user?: {
    id: number;
    name: string;
  };
}

export interface ConductFormData {
  student_id: number;
  tipo: 'positiva' | 'negativa';
  descripcion: string;
  fecha: string;
  severidad: 'leve' | 'moderada' | 'grave';
  acciones_tomadas?: string;
}

export interface ConductFilters {
  student_id?: number;
  tipo?: 'positiva' | 'negativa';
  severidad?: 'leve' | 'moderada' | 'grave';
  page?: number;
  per_page?: number;
}

// Obtener lista de incidentes de conducta
export const getConductIncidents = async (filters: ConductFilters = {}) => {
  const response = await axios.get(`${API_URL}/conduct`, {
    headers: getAuthHeaders(),
    params: filters,
  });
  return response.data;
};

// Crear nuevo incidente
export const createConductIncident = async (data: ConductFormData) => {
  const response = await axios.post(`${API_URL}/conduct`, data, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

// Ver detalle de un incidente
export const getConductIncident = async (id: number) => {
  const response = await axios.get(`${API_URL}/conduct/${id}`, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

// Actualizar incidente
export const updateConductIncident = async (id: number, data: Partial<ConductFormData>) => {
  const response = await axios.put(`${API_URL}/conduct/${id}`, data, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

// Aprobar incidente
export const approveConductIncident = async (id: number) => {
  const response = await axios.patch(`${API_URL}/conduct/${id}/approve`, {}, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

// Eliminar incidente
export const deleteConductIncident = async (id: number) => {
  const response = await axios.delete(`${API_URL}/conduct/${id}`, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

// Colores para tipos de conducta
export const getTipoColor = (tipo: string) => {
  const colors: Record<string, string> = {
    positiva: 'bg-green-100 text-green-800 border-green-300',
    negativa: 'bg-red-100 text-red-800 border-red-300',
  };
  return colors[tipo] || 'bg-gray-100 text-gray-800';
};

export const getTipoLabel = (tipo: string) => {
  const labels: Record<string, string> = {
    positiva: 'Positiva',
    negativa: 'Negativa',
  };
  return labels[tipo] || tipo;
};

// Colores para severidad
export const getSeveridadColor = (severidad: string) => {
  const colors: Record<string, string> = {
    leve: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    moderada: 'bg-orange-100 text-orange-800 border-orange-300',
    grave: 'bg-red-100 text-red-800 border-red-300',
  };
  return colors[severidad] || 'bg-gray-100 text-gray-800';
};

export const getSeveridadLabel = (severidad: string) => {
  const labels: Record<string, string> = {
    leve: 'Leve',
    moderada: 'Moderada',
    grave: 'Grave',
  };
  return labels[severidad] || severidad;
};

export const tipoOptions = [
  { value: 'positiva', label: 'Positiva (Reconocimiento)', color: 'text-green-600' },
  { value: 'negativa', label: 'Negativa (Incidente)', color: 'text-red-600' },
];

export const severidadOptions = [
  { value: 'leve', label: 'Leve' },
  { value: 'moderada', label: 'Moderada' },
  { value: 'grave', label: 'Grave' },
];
