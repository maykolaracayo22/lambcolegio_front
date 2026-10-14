/**
 * API Service para módulos de Sistema (Auditoría, Import/Export, Configuración)
 * Consume endpoints del backend Laravel
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

// ============ TIPOS ============

// Evento de auditoría
export interface AuditEvent {
  id: number;
  user_id?: number;
  user_nombre?: string;
  accion: string;
  target?: string;
  ref?: string;
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  ip?: string;
  ua?: string;
  ts: string;
  created_at: string;
  updated_at: string;
}

// Filtros para auditoría
export interface AuditFilters {
  user_id?: number;
  accion?: string;
  target?: string;
  from?: string;
  to?: string;
  q?: string;
  page?: number;
}

// Respuesta paginada
export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

// Configuración del sistema
export interface SystemConfig {
  id?: number;
  key: string;
  value: string | boolean | number | Record<string, unknown>;
  group?: string;
  description?: string;
}

// Usuario del sistema
export interface SystemUser {
  id: number;
  name: string;
  email: string;
  roles: string[];
  created_at: string;
  last_login?: string;
}

// Estadísticas de importación
export interface ImportStats {
  total: number;
  success: number;
  failed: number;
  errors: string[];
}

// ============ AUDITORÍA API ============

/**
 * Obtiene lista de eventos de auditoría con filtros
 */
export async function getAuditEvents(filters: AuditFilters = {}): Promise<PaginatedResponse<AuditEvent>> {
  const params = new URLSearchParams();
  
  if (filters.user_id) params.append('user_id', filters.user_id.toString());
  if (filters.accion) params.append('accion', filters.accion);
  if (filters.target) params.append('target', filters.target);
  if (filters.from) params.append('from', filters.from);
  if (filters.to) params.append('to', filters.to);
  if (filters.q) params.append('q', filters.q);
  if (filters.page) params.append('page', filters.page.toString());
  
  const response = await api.get(`/audit-events?${params.toString()}`);
  return response.data;
}

/**
 * Crea un evento de auditoría
 */
export async function createAuditEvent(event: {
  accion: string;
  target?: string;
  ref?: string;
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
}): Promise<AuditEvent> {
  const response = await api.post('/audit-events', event);
  return response.data;
}

/**
 * Obtiene acciones únicas para filtros
 */
export async function getAuditActions(): Promise<string[]> {
  try {
    const response = await getAuditEvents({ page: 1 });
    const actions = new Set<string>();
    response.data.forEach(event => {
      if (event.accion) actions.add(event.accion);
    });
    return Array.from(actions);
  } catch {
    return [];
  }
}

/**
 * Obtiene targets únicos para filtros
 */
export async function getAuditTargets(): Promise<string[]> {
  try {
    const response = await getAuditEvents({ page: 1 });
    const targets = new Set<string>();
    response.data.forEach(event => {
      if (event.target) targets.add(event.target);
    });
    return Array.from(targets);
  } catch {
    return [];
  }
}

// ============ IMPORT/EXPORT API ============

/**
 * Importa estudiantes desde CSV/Excel
 */
export async function importStudents(file: File): Promise<ImportStats> {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await api.post('/students/import', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
}

/**
 * Importa docentes desde CSV/Excel
 */
export async function importTeachers(file: File): Promise<ImportStats> {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await api.post('/teachers/import', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
}

/**
 * Exporta estudiantes a Excel
 */
export async function exportStudents(filters?: { nivel?: string; year?: number }): Promise<Blob> {
  const params = new URLSearchParams();
  if (filters?.nivel) params.append('nivel', filters.nivel);
  if (filters?.year) params.append('year', filters.year.toString());
  
  const response = await api.get(`/students/export?${params.toString()}`, {
    responseType: 'blob',
  });
  return response.data;
}

/**
 * Exporta docentes a Excel
 */
export async function exportTeachers(): Promise<Blob> {
  const response = await api.get('/teachers/export', {
    responseType: 'blob',
  });
  return response.data;
}

/**
 * Obtiene plantilla de importación
 */
export async function getImportTemplate(type: 'students' | 'teachers' | 'subjects'): Promise<Blob> {
  const response = await api.get(`/templates/${type}`, {
    responseType: 'blob',
  });
  return response.data;
}

/**
 * Obtiene lista de estudiantes para exportación
 */
export async function getStudentsForExport(filters?: { nivel?: string; year?: number }) {
  const params = new URLSearchParams();
  if (filters?.nivel) params.append('nivel', filters.nivel);
  if (filters?.year) params.append('year', filters.year.toString());
  params.append('per_page', '1000'); // Obtener todos
  
  const response = await api.get(`/students?${params.toString()}`);
  return response.data;
}

/**
 * Obtiene lista de docentes para exportación
 */
export async function getTeachersForExport() {
  const response = await api.get('/teachers?per_page=1000');
  return response.data;
}

/**
 * Obtiene lista de materias para exportación
 */
export async function getSubjectsForExport() {
  const response = await api.get('/subjects?per_page=1000');
  return response.data;
}

// ============ CONFIGURACIÓN API ============

/**
 * Obtiene todas las configuraciones del sistema
 */
export async function getSystemConfigs(): Promise<SystemConfig[]> {
  try {
    const response = await api.get('/system/configs');
    return response.data;
  } catch {
    // Si no existe el endpoint, retornar configuración local
    const localConfig = localStorage.getItem('system:config');
    return localConfig ? JSON.parse(localConfig) : [];
  }
}

/**
 * Guarda una configuración del sistema
 */
export async function saveSystemConfig(config: SystemConfig): Promise<SystemConfig> {
  try {
    const response = await api.post('/system/configs', config);
    return response.data;
  } catch {
    // Guardar localmente si no hay endpoint
    const configs = await getSystemConfigs();
    const existingIndex = configs.findIndex(c => c.key === config.key);
    if (existingIndex >= 0) {
      configs[existingIndex] = config;
    } else {
      configs.push(config);
    }
    localStorage.setItem('system:config', JSON.stringify(configs));
    return config;
  }
}

/**
 * Cambia la contraseña del usuario actual
 */
export async function changePassword(data: {
  current_password: string;
  password: string;
  password_confirmation: string;
}): Promise<{ message: string }> {
  const response = await api.post('/auth/change-password', data);
  return response.data;
}

/**
 * Obtiene información del usuario actual
 */
export async function getCurrentUser(): Promise<SystemUser> {
  const response = await api.get('/user');
  return response.data;
}

/**
 * Actualiza perfil del usuario
 */
export async function updateProfile(data: {
  name?: string;
  email?: string;
}): Promise<SystemUser> {
  const response = await api.put('/user/profile', data);
  return response.data;
}

/**
 * Obtiene estadísticas del sistema
 */
export async function getSystemStats() {
  try {
    const [students, teachers, sections] = await Promise.all([
      api.get('/students?per_page=1'),
      api.get('/teachers?per_page=1'),
      api.get('/sections?per_page=1'),
    ]);
    
    return {
      totalStudents: students.data.total || 0,
      totalTeachers: teachers.data.total || 0,
      totalSections: sections.data.total || 0,
    };
  } catch {
    return {
      totalStudents: 0,
      totalTeachers: 0,
      totalSections: 0,
    };
  }
}

// ============ HELPERS ============

/**
 * Descarga un blob como archivo
 */
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Formatea fecha para mostrar
 */
export function formatDateTime(dateString: string): string {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleString('es-BO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Obtiene color según la acción de auditoría
 */
export function getActionColor(action: string): string {
  const lowerAction = action.toLowerCase();
  if (lowerAction.includes('crear') || lowerAction.includes('create') || lowerAction.includes('store')) {
    return 'bg-green-100 text-green-800';
  }
  if (lowerAction.includes('eliminar') || lowerAction.includes('delete') || lowerAction.includes('destroy')) {
    return 'bg-red-100 text-red-800';
  }
  if (lowerAction.includes('editar') || lowerAction.includes('update') || lowerAction.includes('modificar')) {
    return 'bg-yellow-100 text-yellow-800';
  }
  if (lowerAction.includes('login') || lowerAction.includes('logout')) {
    return 'bg-blue-100 text-blue-800';
  }
  return 'bg-gray-100 text-gray-800';
}

/**
 * Obtiene ícono según el target de auditoría
 */
export function getTargetIcon(target: string): string {
  const lowerTarget = target?.toLowerCase() || '';
  if (lowerTarget.includes('student')) return '👨‍🎓';
  if (lowerTarget.includes('teacher')) return '👨‍🏫';
  if (lowerTarget.includes('section')) return '🏫';
  if (lowerTarget.includes('subject')) return '📚';
  if (lowerTarget.includes('acta')) return '📋';
  if (lowerTarget.includes('note') || lowerTarget.includes('nota')) return '📝';
  if (lowerTarget.includes('attendance') || lowerTarget.includes('asistencia')) return '✅';
  if (lowerTarget.includes('payment') || lowerTarget.includes('pago')) return '💰';
  if (lowerTarget.includes('user')) return '👤';
  return '📄';
}
