// src/services/actasApi.ts
// Servicio API para Actas - Conectado a Backend Laravel

import axios from 'axios';
import { API_BASE } from '@/lib/config';

// ==========================================
// TIPOS
// ==========================================

export type ActaStatus = 'DRAFT' | 'LOCKED' | 'PUBLISHED';
export type Term = 'T1' | 'T2' | 'T3';
export type NivelKey = 'inicial' | 'primaria' | 'secundaria';

export interface Acta {
  id: number;
  ref: string;
  year: number;
  nivel: NivelKey;
  grado: number;
  seccion: string;
  term: Term;
  materia_id: number;
  materia_nombre: string;
  docente_id: number;
  docente_nombre: string;
  status: ActaStatus;
  etag?: string;
  edit_window_ends?: string;
  locked_at?: string;
  locked_by?: number;
  published_at?: string;
  published_by?: number;
  created_at: string;
  updated_at: string;
}

export interface ActaFilters {
  year?: number;
  nivel?: NivelKey;
  grado?: string;
  seccion?: string;
  term?: Term;
  materia_id?: number;
  docente_id?: number;
  status?: ActaStatus;
  page?: number;
  per_page?: number;
}

export interface ActaValidation {
  ref: string;
  status: ActaStatus;
  valido: boolean;
  errores: string[];
  advertencias: string[];
  estadisticas: {
    evaluaciones: number;
    suma_pesos: number;
    estudiantes: number;
    notas_esperadas: number;
    notas_registradas: number;
    completitud_porcentaje: number;
    estudiantes_sin_tn: number;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

// ==========================================
// HELPERS
// ==========================================

const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return {
    'Authorization': `Bearer ${token}`,
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  };
};

// ==========================================
// API FUNCTIONS
// ==========================================

/**
 * Obtener lista de actas con filtros
 */
export async function getActas(filters: ActaFilters = {}): Promise<PaginatedResponse<Acta>> {
  const params = new URLSearchParams();
  
  if (filters.year) params.append('year', String(filters.year));
  if (filters.nivel) params.append('nivel', filters.nivel);
  if (filters.grado) params.append('grado', filters.grado);
  if (filters.seccion) params.append('seccion', filters.seccion);
  if (filters.term) params.append('term', filters.term);
  if (filters.materia_id) params.append('materia_id', String(filters.materia_id));
  if (filters.docente_id) params.append('docente_id', String(filters.docente_id));
  if (filters.status) params.append('status', filters.status);
  if (filters.page) params.append('page', String(filters.page));
  if (filters.per_page) params.append('per_page', String(filters.per_page));

  const response = await axios.get(`${API_BASE}/actas?${params.toString()}`, {
    headers: getAuthHeaders(),
  });
  
  return response.data;
}

/**
 * Obtener detalle de un acta
 */
export async function getActa(id: number): Promise<Acta> {
  const response = await axios.get(`${API_BASE}/actas/${id}`, {
    headers: getAuthHeaders(),
  });
  return response.data;
}

/**
 * Crear nueva acta
 */
export async function createActa(data: {
  year: number;
  assignment_id: number;
  section_id: number;
  period_id: number;
}): Promise<Acta> {
  const response = await axios.post(`${API_BASE}/actas`, data, {
    headers: getAuthHeaders(),
  });
  return response.data;
}

/**
 * Validar acta (verificar completitud)
 */
export async function validateActa(id: number): Promise<ActaValidation> {
  const response = await axios.post(`${API_BASE}/actas/${id}/validate`, {}, {
    headers: getAuthHeaders(),
  });
  return response.data;
}

/**
 * Bloquear acta (DRAFT -> LOCKED)
 */
export async function lockActa(id: number): Promise<Acta> {
  const response = await axios.post(`${API_BASE}/actas/${id}/lock`, {}, {
    headers: getAuthHeaders(),
  });
  return response.data;
}

/**
 * Desbloquear acta (requiere permisos especiales - admin)
 * Nota: Esto podría requerir un endpoint adicional en el backend
 */
export async function unlockActa(id: number): Promise<Acta> {
  // Workaround: Actualizar status directamente si el backend lo permite
  const response = await axios.put(`${API_BASE}/actas/${id}`, 
    { status: 'DRAFT' },
    { headers: getAuthHeaders() }
  );
  return response.data;
}

/**
 * Publicar acta (LOCKED -> PUBLISHED)
 */
export async function publishActa(id: number): Promise<Acta> {
  const response = await axios.post(`${API_BASE}/actas/${id}/publish`, {}, {
    headers: getAuthHeaders(),
  });
  return response.data;
}

/**
 * Despublicar acta (requiere permisos especiales - admin/director)
 * Nota: Esto podría requerir un endpoint adicional en el backend
 */
export async function unpublishActa(id: number): Promise<Acta> {
  // Workaround: Actualizar status directamente si el backend lo permite
  const response = await axios.put(`${API_BASE}/actas/${id}`, 
    { status: 'LOCKED' },
    { headers: getAuthHeaders() }
  );
  return response.data;
}

/**
 * Recalcular totales del acta
 */
export async function recomputeActa(id: number): Promise<{ message: string }> {
  const response = await axios.post(`${API_BASE}/actas/${id}/recompute`, {}, {
    headers: getAuthHeaders(),
  });
  return response.data;
}

/**
 * Eliminar acta (solo DRAFT y admin)
 */
export async function deleteActa(id: number): Promise<void> {
  await axios.delete(`${API_BASE}/actas/${id}`, {
    headers: getAuthHeaders(),
  });
}

/**
 * Guardar notas en lote
 */
export async function saveActaItems(
  id: number, 
  data: {
    notes?: Array<{ student_id: number; evaluation_id: number; valor: number | null }>;
    auto?: Array<{ student_id: number; valor: number | null }>;
    pe?: Array<{ student_id: number; valor: number | null }>;
  }
): Promise<{ message: string }> {
  const response = await axios.put(`${API_BASE}/actas/${id}/items`, data, {
    headers: getAuthHeaders(),
  });
  return response.data;
}

// ==========================================
// HELPERS DE UI
// ==========================================

export function getStatusColor(status: ActaStatus): string {
  switch (status) {
    case 'DRAFT':
      return 'bg-gray-100 text-gray-700';
    case 'LOCKED':
      return 'bg-yellow-100 text-yellow-700';
    case 'PUBLISHED':
      return 'bg-green-100 text-green-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
}

export function getStatusLabel(status: ActaStatus): string {
  switch (status) {
    case 'DRAFT':
      return 'Borrador';
    case 'LOCKED':
      return 'Bloqueada';
    case 'PUBLISHED':
      return 'Publicada';
    default:
      return status;
  }
}

export function getNivelColor(nivel: NivelKey): string {
  switch (nivel) {
    case 'inicial':
      return 'bg-pink-100 text-pink-700';
    case 'primaria':
      return 'bg-blue-100 text-blue-700';
    case 'secundaria':
      return 'bg-purple-100 text-purple-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
}
