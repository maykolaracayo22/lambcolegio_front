// src/services/studentPortalApi.ts
// API para el portal del estudiante - datos propios del estudiante logueado

import axios, { AxiosInstance } from 'axios';
import { API_BASE } from '@/lib/config';
import { getAllTeacherCreatedTasks } from '@/services/teacherTasksStore';

// ==================== INTERFACES ====================

export interface StudentProfile {
  id: number;
  codigo: string;
  nombres: string;
  apellidos: string;
  nivel: 'inicial' | 'primaria' | 'secundaria';
  curso: string;
  paralelo: string;
  email?: string | null;
  fecha_nac?: string | null;
  telefono?: string | null;
  direccion?: string | null;
  sexo?: 'M' | 'F' | null;
  anio_ingreso: string;
  rude?: string | null;
  ci?: string | null;
  direccion?: string | null;
  tutor_nombre?: string | null;
  tutor_telefono?: string | null;
  activo: boolean;
}

export interface StudentGrade {
  id: number;
  materia: string;
  materia_id: number;
  docente: string;
  evaluacion: string;
  nota: number;
  fecha: string;
  bimestre: number;
  tipo: 'tarea' | 'examen' | 'proyecto' | 'participacion';
  comentarios?: string;
}

export interface StudentSubjectGrades {
  materia_id: number;
  materia: string;
  docente: string;
  color?: string;
  calificaciones: StudentGrade[];
  promedio: number | null;
  bimestres: {
    bimestre: number;
    promedio: number | null;
    estado: 'aprobado' | 'reprobado' | 'pendiente';
  }[];
}

export interface AttendanceRecord {
  id: number;
  fecha: string;
  materia: string;
  materia_id?: number;
  estado: 'asistencia' | 'falta' | 'retardo' | 'justificado' | 'licencia';
  observaciones?: string;
}

export interface AttendanceStats {
  total_clases: number;
  asistencias: number;
  faltas: number;
  retardos: number;
  justificados: number;
  porcentaje: number;
}

export interface StudentTask {
  id: number;
  titulo: string;
  descripcion?: string;
  materia: string;
  materia_id: number;
  docente: string;
  fecha_asignacion: string;
  fecha_entrega: string;
  estado: 'pendiente' | 'entregado' | 'calificado' | 'vencido';
  prioridad: 'baja' | 'media' | 'alta';
  nota?: number;
  comentarios_docente?: string;
}

export interface ScheduleClass {
  id: number;
  materia: string;
  materia_id: number;
  docente: string;
  aula: string;
  dia: 'Lunes' | 'Martes' | 'Miércoles' | 'Jueves' | 'Viernes' | 'Sábado';
  hora_inicio: string;
  hora_fin: string;
  color?: string;
}

export interface StudentDashboardStats {
  promedio_general: number;
  tareas_pendientes: number;
  proximas_evaluaciones: number;
  asistencia_porcentaje: number;
  materias_total: number;
  promedios_bimestrales: {
    bimestre: number;
    promedio: number;
    estado: 'aprobado' | 'reprobado' | 'pendiente';
  }[];
  areas_desempeno: {
    cosmos: number;
    vida: number;
    ciencia: number;
    comunidad: number;
  };
  proximas_tareas: StudentTask[];
  proximas_clases: ScheduleClass[];
}

// ==================== INSTANCIA AXIOS ====================

const api: AxiosInstance = axios.create({
  baseURL: API_BASE,
  withCredentials: false,
  timeout: 15000,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ==================== FUNCIONES API ====================

// Obtener el studentId del usuario logueado desde localStorage
function getStudentId(): number | null {
  const userStr = localStorage.getItem('authUser') || localStorage.getItem('user');
  if (!userStr) return null;
  try {
    const user = JSON.parse(userStr);
    return user.studentId || user.student?.id || null;
  } catch {
    return null;
  }
}

// ---------- PERFIL ----------

// Obtener perfil del estudiante logueado
export async function getMyProfile(): Promise<StudentProfile> {
  const studentId = getStudentId();
  if (!studentId) throw new Error('No se encontró el ID del estudiante');
  const response = await api.get<{ student_id: number; student: StudentProfile }>('/student/context');
  if (Number(response.data.student_id) !== studentId || !response.data.student) {
    throw new Error('La sesión no está vinculada al perfil de este estudiante');
  }
  return response.data.student;
}

// Actualizar perfil del estudiante (campos editables)
export async function updateMyProfile(data: Partial<StudentProfile>): Promise<StudentProfile> {
  const studentId = getStudentId();
  if (!studentId) throw new Error('No se encontró el ID del estudiante');
  const response = await api.put<StudentProfile>(`/students/${studentId}`, data);
  return response.data;
}

// ---------- CALIFICACIONES ----------

// Obtener calificaciones del estudiante por centralizador
export async function getMyGrades(): Promise<StudentSubjectGrades[]> {
  const studentId = getStudentId();
  if (!studentId) throw new Error('No se encontró el ID del estudiante');
  
  try {
    // Intentar con centralizador
    const response = await api.get(`/centralizador/student/${studentId}`);
    return transformCentralizadorToGrades(response.data);
  } catch {
    // Fallback: devolver array vacío si no hay datos
    return [];
  }
}

// Transformar datos del centralizador a formato de calificaciones
function transformCentralizadorToGrades(data: any): StudentSubjectGrades[] {
  if (!data || !data.materias) return [];
  
  return data.materias.map((materia: any) => ({
    materia_id: materia.id,
    materia: materia.nombre,
    docente: materia.docente || 'Sin asignar',
    color: getSubjectColor(materia.nombre),
    calificaciones: (materia.notas || []).map((nota: any) => ({
      id: nota.id,
      materia: materia.nombre,
      materia_id: materia.id,
      docente: materia.docente || 'Sin asignar',
      evaluacion: nota.evaluacion || 'Evaluación',
      nota: nota.nota,
      fecha: nota.fecha,
      bimestre: nota.bimestre || 1,
      tipo: nota.tipo || 'examen',
      comentarios: nota.comentarios,
    })),
    promedio: materia.promedio || null,
    bimestres: materia.bimestres || [
      { bimestre: 1, promedio: null, estado: 'pendiente' },
      { bimestre: 2, promedio: null, estado: 'pendiente' },
      { bimestre: 3, promedio: null, estado: 'pendiente' },
      { bimestre: 4, promedio: null, estado: 'pendiente' },
    ],
  }));
}

// ---------- ASISTENCIA ----------

// Obtener reporte de asistencia del estudiante
export async function getMyAttendance(): Promise<{ records: AttendanceRecord[]; stats: AttendanceStats }> {
  const response = await api.get('/attendance/me');
  return transformAttendanceData(response.data);
}

// Transformar datos de asistencia del backend
function transformAttendanceData(data: any): { records: AttendanceRecord[]; stats: AttendanceStats } {
  const records: AttendanceRecord[] = (data.attendances || data.registros || data.records || []).map((r: any) => ({
    id: r.id,
    fecha: String(r.date || r.fecha || '').slice(0, 10),
    materia: r.subject?.nombre || r.subject?.name || r.materia || 'General',
    materia_id: r.subject_id || r.materia_id,
    estado: mapAttendanceStatus(r.status || r.estado),
    observaciones: r.observations || r.observaciones,
  }));

  const summary = data.summary || {};
  const stats: AttendanceStats = {
    total_clases: summary.total_clases ?? data.total ?? records.length,
    asistencias: summary.presentes ?? data.present ?? records.filter(r => r.estado === 'asistencia').length,
    faltas: summary.ausentes ?? data.absent ?? records.filter(r => r.estado === 'falta').length,
    retardos: summary.tardanzas ?? data.late ?? records.filter(r => r.estado === 'retardo').length,
    justificados: summary.justificados ?? data.justified ?? records.filter(r => r.estado === 'justificado').length,
    porcentaje: summary.porcentaje_asistencia ?? data.percentage ?? calculateAttendancePercentage(records),
  };

  return { records, stats };
}

function mapAttendanceStatus(status: string): AttendanceRecord['estado'] {
  const statusMap: Record<string, AttendanceRecord['estado']> = {
    'present': 'asistencia',
    'absent': 'falta',
    'late': 'retardo',
    'justified': 'justificado',
    'excused': 'licencia',
    'asistencia': 'asistencia',
    'falta': 'falta',
    'retardo': 'retardo',
    'justificado': 'justificado',
    'licencia': 'licencia',
  };
  return statusMap[status?.toLowerCase()] || 'asistencia';
}

function calculateAttendancePercentage(records: AttendanceRecord[]): number {
  if (records.length === 0) return 0;
  const asistencias = records.filter(r => r.estado === 'asistencia').length;
  const justificados = records.filter(r => r.estado === 'justificado').length;
  const total = records.length - justificados;
  return total > 0 ? Math.round((asistencias / total) * 100) : 0;
}

// ---------- TAREAS ----------

// Obtener tareas asignadas al estudiante
export async function getMyTasks(filters?: { estado?: string; materia_id?: number }): Promise<StudentTask[]> {
  const studentId = getStudentId();
  if (!studentId) throw new Error('No se encontró el ID del estudiante');
  
  try {
    const response = await api.get<{ student_id: number; section_id: number | null; year: string }>('/student/context');
    const context = response.data;
    if (Number(context.student_id) !== studentId || !context.section_id) return [];

    const tasks = getAllTeacherCreatedTasks()
      .filter((task) => Number(task.sectionId) === Number(context.section_id) && String(task.year) === String(context.year))
      .map((task) => ({
        id: task.id,
        titulo: task.titulo,
        descripcion: task.descripcion,
        materia: task.materiaNombre,
        materia_id: task.materiaId,
        docente: task.teacherName || 'Docente asignado',
        fecha_asignacion: task.fechaAsignacion,
        fecha_entrega: task.fechaEntrega,
        estado: mapTaskStatus(task.estado === 'cerrada' ? 'cerrada' : 'pendiente', task.fechaEntrega),
        prioridad: 'media' as const,
      }));

    return tasks.filter((task) =>
      (!filters?.estado || task.estado === filters.estado) &&
      (!filters?.materia_id || task.materia_id === filters.materia_id)
    );
  } catch {
    return [];
  }
}

function mapTaskStatus(status: string, dueDate?: string): StudentTask['estado'] {
  if (status === 'graded' || status === 'calificado') return 'calificado';
  if (status === 'submitted' || status === 'entregado') return 'entregado';
  if (dueDate) {
    const [year, month, day] = dueDate.split('-').map(Number);
    const deadline = new Date(year, month - 1, day, 23, 59, 59, 999);
    if (Number.isFinite(deadline.getTime()) && deadline < new Date()) return 'vencido';
  }
  return 'pendiente';
}

// ---------- HORARIO ----------

// Obtener horario del estudiante
export async function getMySchedule(): Promise<ScheduleClass[]> {
  const studentId = getStudentId();
  if (!studentId) throw new Error('No se encontró el ID del estudiante');
  
  try {
    // Intentar obtener horario desde enrollments/secciones
    const response = await api.get('/sections', {
      params: { student_id: studentId },
    });
    return transformScheduleData(response.data);
  } catch {
    return [];
  }
}

function transformScheduleData(data: any): ScheduleClass[] {
  const sections = Array.isArray(data) ? data : data.data || [];
  const schedule: ScheduleClass[] = [];
  
  sections.forEach((section: any) => {
    if (section.horario) {
      section.horario.forEach((h: any) => {
        schedule.push({
          id: h.id || Math.random(),
          materia: section.subject?.name || section.materia || 'Sin materia',
          materia_id: section.subject_id || section.materia_id,
          docente: section.teacher?.name || section.docente || 'Sin asignar',
          aula: h.classroom || h.aula || 'Sin asignar',
          dia: h.day || h.dia,
          hora_inicio: h.start_time || h.hora_inicio,
          hora_fin: h.end_time || h.hora_fin,
          color: getSubjectColor(section.subject?.name || section.materia),
        });
      });
    }
  });
  
  return schedule;
}

// ---------- DASHBOARD ----------

// Obtener estadísticas para el dashboard del estudiante
export async function getMyDashboardStats(): Promise<StudentDashboardStats> {
  const studentId = getStudentId();
  if (!studentId) throw new Error('No se encontró el ID del estudiante');
  
  try {
    // Obtener datos en paralelo
    const [gradesResponse, attendanceResponse, tasksResponse] = await Promise.allSettled([
      getMyGrades(),
      getMyAttendance(),
      getMyTasks({ estado: 'pendiente' }),
    ]);

    const grades = gradesResponse.status === 'fulfilled' ? gradesResponse.value : [];
    const attendance = attendanceResponse.status === 'fulfilled' ? attendanceResponse.value : { stats: { porcentaje: 0 } };
    const tasks = tasksResponse.status === 'fulfilled' ? tasksResponse.value : [];

    // Calcular promedio general
    const promedios = grades.map(g => g.promedio).filter((p): p is number => p !== null);
    const promedioGeneral = promedios.length > 0
      ? Math.round(promedios.reduce((a, b) => a + b, 0) / promedios.length)
      : 0;

    return {
      promedio_general: promedioGeneral,
      tareas_pendientes: tasks.filter(t => t.estado === 'pendiente').length,
      proximas_evaluaciones: 0, // TODO: Implementar cuando exista endpoint
      asistencia_porcentaje: attendance.stats.porcentaje,
      materias_total: grades.length,
      promedios_bimestrales: calculateBimestrePromedios(grades),
      areas_desempeno: {
        cosmos: 0,
        vida: 0,
        ciencia: 0,
        comunidad: 0,
      },
      proximas_tareas: tasks.slice(0, 5),
      proximas_clases: [],
    };
  } catch {
    return {
      promedio_general: 0,
      tareas_pendientes: 0,
      proximas_evaluaciones: 0,
      asistencia_porcentaje: 0,
      materias_total: 0,
      promedios_bimestrales: [],
      areas_desempeno: { cosmos: 0, vida: 0, ciencia: 0, comunidad: 0 },
      proximas_tareas: [],
      proximas_clases: [],
    };
  }
}

function calculateBimestrePromedios(grades: StudentSubjectGrades[]) {
  const bimestres = [1, 2, 3, 4];
  return bimestres.map(bim => {
    const promediosBim = grades
      .map(g => g.bimestres.find(b => b.bimestre === bim)?.promedio)
      .filter((p): p is number => p !== null && p !== undefined);
    
    const promedio = promediosBim.length > 0
      ? Math.round(promediosBim.reduce((a, b) => a + b, 0) / promediosBim.length)
      : 0;
    
    return {
      bimestre: bim,
      promedio,
      estado: promedio === 0 ? 'pendiente' as const : promedio >= 51 ? 'aprobado' as const : 'reprobado' as const,
    };
  });
}

// ---------- UTILIDADES ----------

function getSubjectColor(materia?: string): string {
  const colors: Record<string, string> = {
    'Matemáticas': 'bg-indigo-100 text-indigo-800',
    'Lenguaje': 'bg-blue-100 text-blue-800',
    'Español': 'bg-blue-100 text-blue-800',
    'Ciencias Naturales': 'bg-emerald-100 text-emerald-800',
    'Ciencias': 'bg-emerald-100 text-emerald-800',
    'Ciencias Sociales': 'bg-purple-100 text-purple-800',
    'Historia': 'bg-purple-100 text-purple-800',
    'Inglés': 'bg-yellow-100 text-yellow-800',
    'Educación Física': 'bg-orange-100 text-orange-800',
    'Artes': 'bg-pink-100 text-pink-800',
    'Música': 'bg-rose-100 text-rose-800',
    'Religión': 'bg-amber-100 text-amber-800',
    'Valores': 'bg-teal-100 text-teal-800',
    'Técnica Tecnológica': 'bg-cyan-100 text-cyan-800',
  };
  return colors[materia || ''] || 'bg-gray-100 text-gray-800';
}

export {
  getStudentId,
  getSubjectColor,
};
