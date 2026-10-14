/**
 * API Service para Justificaciones de Asistencia por Niveles
 * Consume endpoints del AttendanceController del backend Laravel
 */

import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Interceptor para agregar token de autenticación
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Tipos para niveles educativos
export type NivelKey = 'inicial' | 'primaria' | 'secundaria';

// Tipos de estados de asistencia
export type EstadoAsistencia = 'presente' | 'ausente' | 'tardanza' | 'justificado';

// Interfaz para registro de asistencia
export interface AttendanceRecord {
  id: number;
  student_id: number;
  section_id: number;
  subject_id: number;
  teacher_id: number;
  fecha: string;
  estado: EstadoAsistencia;
  observaciones?: string;
  created_at: string;
  updated_at: string;
  student?: {
    id: number;
    codigo_rude?: string;
    user?: {
      id: number;
      name: string;
      email: string;
    };
  };
  section?: {
    id: number;
    nivel: string;
    grado: number;
    paralelo: string;
  };
  subject?: {
    id: number;
    nombre: string;
    codigo: string;
  };
  teacher?: {
    id: number;
    especialidad?: string;
    user?: {
      name: string;
    };
  };
}

// Interfaz para sección
export interface Section {
  id: number;
  nivel: string;
  grado: number;
  paralelo: string;
  turno?: string;
  aula?: string;
  students_count?: number;
}

// Interfaz para estadísticas de justificaciones
export interface JustificacionStats {
  nivel: string;
  total_registros: number;
  justificados: number;
  pendientes_justificar: number; // ausentes + tardanzas sin justificar
  porcentaje_justificacion: number;
}

// Interfaz para filtros
export interface JustificacionFilters {
  nivel?: NivelKey;
  section_id?: number;
  student_id?: number;
  fecha_desde?: string;
  fecha_hasta?: string;
  estado?: EstadoAsistencia;
  page?: number;
  per_page?: number;
}

// Interfaz para solicitud de justificación
export interface JustificacionRequest {
  attendance_id: number;
  motivo: string;
  documento_adjunto?: string;
}

// ============ API FUNCTIONS ============

/**
 * Obtiene todos los registros de asistencia con filtros
 */
export async function getAttendanceRecords(filters: JustificacionFilters = {}) {
  const params = new URLSearchParams();
  
  if (filters.section_id) params.append('section_id', filters.section_id.toString());
  if (filters.student_id) params.append('student_id', filters.student_id.toString());
  if (filters.fecha_desde) params.append('fecha', filters.fecha_desde);
  if (filters.estado) params.append('estado', filters.estado);
  
  const response = await api.get(`/attendance?${params.toString()}`);
  return response.data;
}

/**
 * Obtiene registros de asistencia filtrados por nivel educativo
 */
export async function getAttendanceByNivel(nivel: NivelKey, filters: JustificacionFilters = {}) {
  // Primero obtenemos las secciones del nivel
  const sectionsResponse = await api.get('/sections', {
    params: { nivel, year: new Date().getFullYear() }
  });
  
  const sections = sectionsResponse.data.data || sectionsResponse.data || [];
  const sectionIds = sections.map((s: Section) => s.id);
  
  if (sectionIds.length === 0) {
    return { data: [], total: 0 };
  }
  
  // Luego obtenemos las asistencias de esas secciones
  const attendancePromises = sectionIds.map((sectionId: number) =>
    api.get('/attendance', {
      params: {
        section_id: sectionId,
        fecha: filters.fecha_desde,
        ...filters
      }
    }).catch(() => ({ data: { data: [] } }))
  );
  
  const responses = await Promise.all(attendancePromises);
  const allAttendances = responses.flatMap(r => r.data.data || r.data || []);
  
  // Filtrar por estado si es necesario
  let filtered = allAttendances;
  if (filters.estado) {
    filtered = allAttendances.filter((a: AttendanceRecord) => a.estado === filters.estado);
  }
  
  return { data: filtered, total: filtered.length, sections };
}

/**
 * Obtiene solo los registros que requieren justificación (ausentes y tardanzas)
 */
export async function getPendingJustifications(nivel?: NivelKey, filters: JustificacionFilters = {}) {
  const baseFilters = { ...filters };
  
  if (nivel) {
    const result = await getAttendanceByNivel(nivel, baseFilters);
    // Filtrar solo ausentes y tardanzas (los que necesitan justificación)
    const pending = result.data.filter(
      (a: AttendanceRecord) => a.estado === 'ausente' || a.estado === 'tardanza'
    );
    return { data: pending, total: pending.length, sections: result.sections };
  }
  
  const response = await getAttendanceRecords(baseFilters);
  const all = response.data || [];
  const pending = all.filter(
    (a: AttendanceRecord) => a.estado === 'ausente' || a.estado === 'tardanza'
  );
  return { data: pending, total: pending.length };
}

/**
 * Obtiene los registros ya justificados
 */
export async function getJustifiedRecords(nivel?: NivelKey, filters: JustificacionFilters = {}) {
  const baseFilters = { ...filters, estado: 'justificado' as EstadoAsistencia };
  
  if (nivel) {
    return await getAttendanceByNivel(nivel, baseFilters);
  }
  
  return await getAttendanceRecords(baseFilters);
}

/**
 * Actualiza un registro de asistencia para marcarlo como justificado
 */
export async function justifyAttendance(
  attendanceId: number, 
  observaciones: string
) {
  const response = await api.put(`/attendance/${attendanceId}`, {
    estado: 'justificado',
    observaciones
  });
  return response.data;
}

/**
 * Obtiene el reporte de asistencia de un estudiante
 */
export async function getStudentAttendanceReport(
  studentId: number,
  fechaDesde?: string,
  fechaHasta?: string
) {
  const params = new URLSearchParams();
  if (fechaDesde) params.append('fecha_desde', fechaDesde);
  if (fechaHasta) params.append('fecha_hasta', fechaHasta);
  
  const response = await api.get(`/attendance/report/${studentId}?${params.toString()}`);
  return response.data;
}

/**
 * Obtiene secciones filtradas por nivel
 */
export async function getSectionsByNivel(nivel: NivelKey, year?: number) {
  const response = await api.get('/sections', {
    params: { 
      nivel, 
      year: year || new Date().getFullYear() 
    }
  });
  return response.data.data || response.data || [];
}

/**
 * Obtiene estadísticas de justificaciones por nivel
 */
export async function getJustificacionStats(year?: number): Promise<JustificacionStats[]> {
  const niveles: NivelKey[] = ['inicial', 'primaria', 'secundaria'];
  const currentYear = year || new Date().getFullYear();
  
  const statsPromises = niveles.map(async (nivel) => {
    try {
      const result = await getAttendanceByNivel(nivel, {
        fecha_desde: `${currentYear}-01-01`,
        fecha_hasta: `${currentYear}-12-31`
      });
      
      const data = result.data || [];
      const total = data.length;
      const justificados = data.filter((a: AttendanceRecord) => a.estado === 'justificado').length;
      const pendientes = data.filter(
        (a: AttendanceRecord) => a.estado === 'ausente' || a.estado === 'tardanza'
      ).length;
      
      return {
        nivel,
        total_registros: total,
        justificados,
        pendientes_justificar: pendientes,
        porcentaje_justificacion: total > 0 ? Math.round((justificados / total) * 100) : 0
      };
    } catch {
      return {
        nivel,
        total_registros: 0,
        justificados: 0,
        pendientes_justificar: 0,
        porcentaje_justificacion: 0
      };
    }
  });
  
  return await Promise.all(statsPromises);
}

// ============ HELPERS ============

/**
 * Obtiene el color según el nivel educativo
 */
export function getNivelColor(nivel: string): string {
  const colors: Record<string, string> = {
    inicial: 'bg-pink-100 text-pink-800 border-pink-200',
    primaria: 'bg-blue-100 text-blue-800 border-blue-200',
    secundaria: 'bg-purple-100 text-purple-800 border-purple-200'
  };
  return colors[nivel?.toLowerCase()] || 'bg-gray-100 text-gray-800 border-gray-200';
}

/**
 * Obtiene la etiqueta del nivel
 */
export function getNivelLabel(nivel: string): string {
  const labels: Record<string, string> = {
    inicial: 'Inicial',
    primaria: 'Primaria',
    secundaria: 'Secundaria'
  };
  return labels[nivel?.toLowerCase()] || nivel;
}

/**
 * Obtiene el color según el estado de asistencia
 */
export function getEstadoColor(estado: EstadoAsistencia): string {
  const colors: Record<EstadoAsistencia, string> = {
    presente: 'bg-green-100 text-green-800',
    ausente: 'bg-red-100 text-red-800',
    tardanza: 'bg-yellow-100 text-yellow-800',
    justificado: 'bg-blue-100 text-blue-800'
  };
  return colors[estado] || 'bg-gray-100 text-gray-800';
}

/**
 * Obtiene el ícono según el estado
 */
export function getEstadoIcon(estado: EstadoAsistencia): string {
  const icons: Record<EstadoAsistencia, string> = {
    presente: '✓',
    ausente: '✗',
    tardanza: '⏰',
    justificado: '📋'
  };
  return icons[estado] || '?';
}

/**
 * Formatea una fecha
 */
export function formatDate(dateString: string): string {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('es-BO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

/**
 * Calcula días de diferencia
 */
export function getDaysDifference(dateString: string): number {
  const date = new Date(dateString);
  const today = new Date();
  const diffTime = Math.abs(today.getTime() - date.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}
