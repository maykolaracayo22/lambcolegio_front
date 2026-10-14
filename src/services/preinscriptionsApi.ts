// src/services/preinscriptionsApi.ts
// API para gestión de Preinscripciones

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

export interface Preinscription {
  id: number;
  codigo_preinscripcion: string;
  nivel: 'inicial' | 'primaria' | 'secundaria';
  grado: number;
  nombres: string;
  apellidos: string;
  sexo: 'M' | 'F';
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
  estado: 'pendiente' | 'aprobado' | 'rechazado';
  comprobante_path?: string;
  observaciones?: string;
  aprobado_por?: number;
  aprobado_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface PreinscriptionFilters {
  year?: number;
  estado?: 'pendiente' | 'aprobado' | 'rechazado';
  nivel?: 'inicial' | 'primaria' | 'secundaria';
  grado?: number;
  q?: string;
  page?: number;
  per_page?: number;
}

// Obtener lista de preinscripciones (admin/secretaria)
export const getPreinscriptions = async (filters: PreinscriptionFilters = {}) => {
  const response = await axios.get(`${API_URL}/preinscriptions`, {
    headers: getAuthHeaders(),
    params: filters,
  });
  return response.data;
};

// Ver detalle de una preinscripción (por código)
export const getPreinscription = async (codigo: string) => {
  const response = await axios.get(`${API_URL}/preinscriptions/${codigo}`, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

// Aprobar preinscripción
export const approvePreinscription = async (id: number) => {
  const response = await axios.patch(`${API_URL}/preinscriptions/${id}/approve`, {}, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

// Rechazar preinscripción
export const rejectPreinscription = async (id: number, motivo: string) => {
  const response = await axios.patch(`${API_URL}/preinscriptions/${id}/reject`, { motivo }, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

// Descargar RUDE de una preinscripción
export const downloadRude = async (codigo: string) => {
  const response = await axios.get(`${API_URL}/preinscriptions/${codigo}/rude`, {
    headers: getAuthHeaders(),
    responseType: 'blob',
  });
  return response.data;
};

// Colores por estado
export const getEstadoColor = (estado: string) => {
  const colors: Record<string, string> = {
    pendiente: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    aprobado: 'bg-green-100 text-green-800 border-green-300',
    rechazado: 'bg-red-100 text-red-800 border-red-300',
  };
  return colors[estado] || 'bg-gray-100 text-gray-800';
};

export const getEstadoLabel = (estado: string) => {
  const labels: Record<string, string> = {
    pendiente: 'Pendiente',
    aprobado: 'Aprobado',
    rechazado: 'Rechazado',
  };
  return labels[estado] || estado;
};

export const getNivelLabel = (nivel: string) => {
  const labels: Record<string, string> = {
    inicial: 'Inicial',
    primaria: 'Primaria',
    secundaria: 'Secundaria',
  };
  return labels[nivel] || nivel;
};

export const estadoOptions = [
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'aprobado', label: 'Aprobado' },
  { value: 'rechazado', label: 'Rechazado' },
];

export const nivelOptions = [
  { value: 'inicial', label: 'Inicial' },
  { value: 'primaria', label: 'Primaria' },
  { value: 'secundaria', label: 'Secundaria' },
];
