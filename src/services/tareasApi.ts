// src/services/tareasApi.ts
// API para gestión de tareas/evaluaciones por niveles

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

// ===== TIPOS =====

export type NivelKey = 'inicial' | 'primaria' | 'secundaria';

export interface Acta {
  id: number;
  section_id: number;
  subject_id: number;
  teacher_id: number;
  period_id: number;
  year: number;
  status: 'DRAFT' | 'LOCKED' | 'PUBLISHED';
  created_at: string;
  updated_at: string;
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
    codigo: string;
  };
  teacher?: {
    id: number;
    nombres: string;
    apellidos: string;
  };
  period?: {
    id: number;
    name: string;
    type: string;
  };
  evaluations?: Evaluation[];
}

export interface Evaluation {
  id: number;
  acta_id: number;
  nombre: string;
  peso: number;
  fecha?: string;
  created_at?: string;
  updated_at?: string;
  notes?: Note[];
  acta?: Acta;
}

export interface Note {
  id: number;
  evaluation_id: number;
  student_id: number;
  score?: number;
  qualitative_value?: string;
  created_at?: string;
  updated_at?: string;
  student?: {
    id: number;
    nombres: string;
    apellidos: string;
    codigo: string;
  };
}

export interface TareaStats {
  total_evaluaciones: number;
  por_nivel: {
    nivel: string;
    cantidad: number;
    completadas: number;
    pendientes: number;
  }[];
  por_materia: {
    materia: string;
    cantidad: number;
  }[];
}

export interface TareaFilters {
  nivel?: NivelKey;
  year?: number;
  period_id?: number;
  subject_id?: number;
  teacher_id?: number;
  section_id?: number;
  status?: string;
}

// ===== FUNCIONES API =====

/**
 * Obtener todas las actas (con evaluaciones) filtradas
 * GET /api/actas
 */
export async function getActasConEvaluaciones(filters: TareaFilters = {}): Promise<{
  data: Acta[];
  total: number;
}> {
  const response = await axios.get(`${API_URL}/actas`, {
    headers: getAuthHeaders(),
    params: {
      ...filters,
      with_evaluations: true,
    },
  });
  return {
    data: response.data.data || response.data,
    total: response.data.total || response.data.length,
  };
}

/**
 * Obtener evaluaciones de un acta específica
 * GET /api/actas/{actaId}
 */
export async function getActaEvaluaciones(actaId: number): Promise<Acta> {
  const response = await axios.get(`${API_URL}/actas/${actaId}`, {
    headers: getAuthHeaders(),
  });
  return response.data;
}

/**
 * Crear nueva evaluación (tarea)
 * POST /api/acta-evaluations
 */
export async function createEvaluacion(data: {
  acta_id: number;
  nombre: string;
  peso: number;
  fecha?: string;
}): Promise<Evaluation> {
  const response = await axios.post(`${API_URL}/acta-evaluations`, data, {
    headers: getAuthHeaders(),
  });
  return response.data;
}

/**
 * Actualizar evaluación (tarea)
 * PUT /api/acta-evaluations/{id}
 */
export async function updateEvaluacion(
  evaluationId: number,
  data: {
    nombre?: string;
    peso?: number;
    fecha?: string;
  }
): Promise<Evaluation> {
  const response = await axios.put(`${API_URL}/acta-evaluations/${evaluationId}`, data, {
    headers: getAuthHeaders(),
  });
  return response.data;
}

/**
 * Eliminar evaluación (tarea)
 * DELETE /api/acta-evaluations/{id}
 */
export async function deleteEvaluacion(evaluationId: number): Promise<void> {
  await axios.delete(`${API_URL}/acta-evaluations/${evaluationId}`, {
    headers: getAuthHeaders(),
  });
}

/**
 * Obtener estadísticas de tareas por nivel
 */
export async function getTareasStats(year?: number): Promise<TareaStats> {
  // Obtener todas las actas del año
  const response = await getActasConEvaluaciones({ year: year || new Date().getFullYear() });
  const actas = response.data;

  // Calcular estadísticas por nivel
  const porNivel: Record<string, { cantidad: number; completadas: number; pendientes: number }> = {
    inicial: { cantidad: 0, completadas: 0, pendientes: 0 },
    primaria: { cantidad: 0, completadas: 0, pendientes: 0 },
    secundaria: { cantidad: 0, completadas: 0, pendientes: 0 },
  };

  const porMateria: Record<string, number> = {};
  let totalEvaluaciones = 0;

  actas.forEach((acta) => {
    const nivel = acta.section?.nivel?.toLowerCase() || 'primaria';
    const materia = acta.subject?.nombre || 'Sin materia';
    const evaluaciones = acta.evaluations || [];

    totalEvaluaciones += evaluaciones.length;

    if (porNivel[nivel]) {
      porNivel[nivel].cantidad += evaluaciones.length;
      
      evaluaciones.forEach((ev) => {
        // Consideramos completada si tiene notas
        if (ev.notes && ev.notes.length > 0) {
          porNivel[nivel].completadas++;
        } else {
          porNivel[nivel].pendientes++;
        }
      });
    }

    porMateria[materia] = (porMateria[materia] || 0) + evaluaciones.length;
  });

  return {
    total_evaluaciones: totalEvaluaciones,
    por_nivel: Object.entries(porNivel).map(([nivel, data]) => ({
      nivel,
      ...data,
    })),
    por_materia: Object.entries(porMateria)
      .map(([materia, cantidad]) => ({ materia, cantidad }))
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 10),
  };
}

/**
 * Obtener secciones por nivel
 * GET /api/sections
 */
export async function getSectionsByNivel(nivel: NivelKey, year?: number): Promise<{
  id: number;
  nivel: string;
  grado: string;
  paralelo: string;
  turno?: string;
}[]> {
  const response = await axios.get(`${API_URL}/sections`, {
    headers: getAuthHeaders(),
    params: {
      nivel,
      year: year || new Date().getFullYear(),
    },
  });
  return response.data.data || response.data;
}

// ===== HELPERS =====

export function getNivelColor(nivel: string): string {
  const colors: Record<string, string> = {
    inicial: 'bg-pink-100 text-pink-700 border-pink-300',
    primaria: 'bg-blue-100 text-blue-700 border-blue-300',
    secundaria: 'bg-purple-100 text-purple-700 border-purple-300',
  };
  return colors[nivel.toLowerCase()] || 'bg-gray-100 text-gray-700';
}

export function getNivelLabel(nivel: string): string {
  const labels: Record<string, string> = {
    inicial: 'Inicial',
    primaria: 'Primaria',
    secundaria: 'Secundaria',
  };
  return labels[nivel.toLowerCase()] || nivel;
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    DRAFT: 'bg-yellow-100 text-yellow-700',
    LOCKED: 'bg-orange-100 text-orange-700',
    PUBLISHED: 'bg-green-100 text-green-700',
  };
  return colors[status] || 'bg-gray-100 text-gray-700';
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    DRAFT: 'Borrador',
    LOCKED: 'Bloqueado',
    PUBLISHED: 'Publicado',
  };
  return labels[status] || status;
}

export function formatDate(date: string | undefined): string {
  if (!date) return 'Sin fecha';
  return new Date(date).toLocaleDateString('es-BO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
