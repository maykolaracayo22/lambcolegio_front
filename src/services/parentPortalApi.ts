// src/services/parentPortalApi.ts
// Servicio API para Portal de Padres/Tutores
// CONECTADO AL BACKEND - Consume API real

import apiClient from './api';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

// ============= INTERFACES =============

export interface ChildInfo {
  id: number;
  codigo: string;
  nombres: string;
  apellidos: string;
  nivel: string;
  curso: string;
  paralelo: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  fechaNacimiento?: string;
  foto?: string;
  ci?: string;
  rude?: string;
  codigoRude?: string;
  sexo?: string;
  nacionalidad?: string;
  departamentoNacimiento?: string;
  municipioNacimiento?: string;
  anioIngreso?: string;
  mesIngreso?: string;
  tutorNombre?: string;
  tutorCi?: string;
  tutorParentesco?: string;
  tutorTelefono?: string;
}

export interface ChildGrade {
  materia: string;
  docente: string;
  bimestre1?: number;
  bimestre2?: number;
  bimestre3?: number;
  bimestre4?: number;
  promedioAnual?: number;
  aprobado: boolean;
}

export interface ChildSubjectGrades {
  materia: string;
  docente: string;
  notas: {
    bimestre: number;
    nota: number;
    porcentajeAsistencia?: number;
  }[];
  promedioAnual: number;
  aprobado: boolean;
}

export interface ChildAttendanceRecord {
  id: number;
  fecha: string;
  materia: string;
  estado: 'presente' | 'ausente' | 'tardanza' | 'justificado';
  observacion?: string;
}

export interface ChildAttendanceStats {
  totalClases: number;
  presentes: number;
  ausentes: number;
  tardanzas: number;
  justificados: number;
  porcentajeAsistencia: number;
}

export interface ChildTask {
  id: number;
  titulo: string;
  descripcion?: string;
  materia: string;
  docente: string;
  fecha_asignacion: string;
  fecha_entrega: string;
  estado: 'pendiente' | 'entregado' | 'calificado' | 'vencido';
  prioridad: 'baja' | 'media' | 'alta';
  nota?: number;
}

export interface ConductRecord {
  id: number;
  fecha: string;
  tipo: 'positivo' | 'negativo' | 'neutral';
  categoria: string;
  descripcion: string;
  docente: string;
  puntos?: number;
}

export interface ConductStats {
  puntosPositivos: number;
  puntosNegativos: number;
  puntosNetos: number;
  totalRegistros: number;
}

export interface Achievement {
  id: number;
  titulo: string;
  descripcion: string;
  categoria: string;
  fecha: string;
  nivel: 'bronce' | 'plata' | 'oro' | 'platino';
  icono?: string;
}

export interface ParentDashboardStats {
  promedio_general: number;
  porcentaje_asistencia: number;
  tareas_pendientes: number;
  tareas_completadas: number;
  puntos_conducta: number;
  logros_totales: number;
  proximas_entregas: ChildTask[];
  alertas: Array<{
    tipo: string;
    mensaje: string;
    fecha: string;
  }>;
}

// ============= HELPERS =============

/**
 * Obtiene el studentId del hijo asociado al padre desde localStorage
 */
export function getChildStudentId(): number | null {
  try {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      // El padre tiene el studentId del hijo en el campo 'studentId'
      if (user.studentId) {
        return user.studentId;
      }
      // También puede estar en user.student.id
      if (user.student?.id) {
        return user.student.id;
      }
    }
  } catch (error) {
    console.error('Error al obtener studentId del hijo:', error);
  }
  return null;
}

/**
 * Obtiene la información del hijo almacenada en localStorage
 */
export function getChildInfo(): ChildInfo | null {
  try {
    const parentStudentStr = localStorage.getItem('parentStudent');
    if (parentStudentStr) {
      const student = JSON.parse(parentStudentStr);
      if (student?.id) {
        return mapChildInfo(student);
      }
    }

    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user.student) {
        return mapChildInfo(user.student);
      }
    }
  } catch (error) {
    console.error('Error al obtener info del hijo:', error);
  }
  return null;
}

function mapChildInfo(student: any): ChildInfo {
  return {
    id: Number(student.id),
    codigo: student.codigo || student.usuario || '',
    nombres: student.nombres || student.nombre || student.name || '',
    apellidos: student.apellidos || student.apellido || '',
    nivel: student.nivel || '',
    curso: student.curso || '',
    paralelo: student.paralelo || '',
    email: student.email || '',
    telefono: student.telefono || '',
    direccion: student.direccion || '',
    fechaNacimiento: student.fecha_nac || student.fecha_nacimiento || student.fechaNacimiento || '',
    foto: student.foto || '',
    ci: student.ci || '',
    rude: student.rude || '',
    codigoRude: student.codigo_rude || student.codigoRude || '',
    sexo: student.sexo || '',
    nacionalidad: student.nacionalidad || '',
    departamentoNacimiento: student.dep_nac || student.departamentoNacimiento || '',
    municipioNacimiento: student.muni_nac || student.municipioNacimiento || '',
    anioIngreso: student.anio_ingreso || student.anioIngreso || '',
    mesIngreso: student.mes_ingreso || student.mesIngreso || '',
    tutorNombre: student.tutor_nombre || student.tutorNombre || '',
    tutorCi: student.tutor_ci || student.tutorCi || '',
    tutorParentesco: student.tutor_parentesco || student.tutorParentesco || '',
    tutorTelefono: student.tutor_telefono || student.tutorTelefono || '',
  };
}

// ============= API FUNCTIONS =============

/**
 * Obtiene el perfil completo del estudiante hijo
 */
export async function getChildProfile(): Promise<ChildInfo> {
  // El acceso de padres devuelve un token de consulta temporal, no un token
  // Sanctum. Usar el perfil completo que se guardó al validar el código.
  const parentProfile = getChildInfo();
  if (parentProfile) {
    return parentProfile;
  }

  const studentId = getChildStudentId();
  
  // Si no hay studentId, intentamos obtener desde localStorage
  if (!studentId) {
    const cachedInfo = getChildInfo();
    if (cachedInfo) {
      return cachedInfo;
    }
    throw new Error('No se encontró información del estudiante');
  }

  try {
    const response = await apiClient.get(`/students/${studentId}`);
    const student = response.data.data || response.data;
    
    return {
      id: student.id,
      codigo: student.codigo || student.usuario || '',
      nombres: student.nombres || student.name || '',
      apellidos: student.apellidos || '',
      nivel: student.nivel || '',
      curso: student.curso || '',
      paralelo: student.paralelo || '',
      email: student.email || '',
      telefono: student.telefono || '',
      direccion: student.direccion || '',
      fechaNacimiento: student.fecha_nacimiento || '',
      foto: student.foto || '',
    };
  } catch (error) {
    // Fallback a datos de localStorage
    const cachedInfo = getChildInfo();
    if (cachedInfo) {
      return cachedInfo;
    }
    throw error;
  }
}

/**
 * Obtiene las notas del estudiante hijo
 */
export async function getChildGrades(): Promise<ChildSubjectGrades[]> {
  const studentId = getChildStudentId();
  
  if (!studentId) {
    console.warn('No se encontró studentId para obtener notas');
    return [];
  }

  try {
    const response = await apiClient.get(`/centralizador/student/${studentId}`);
    const data = response.data;
    
    // Transformar los datos del centralizador al formato esperado
    const gradesMap = new Map<string, ChildSubjectGrades>();
    
    if (Array.isArray(data.data)) {
      data.data.forEach((item: any) => {
        const materia = item.subject_name || item.materia || 'Sin materia';
        
        if (!gradesMap.has(materia)) {
          gradesMap.set(materia, {
            materia,
            docente: item.teacher_name || item.docente || 'Sin docente',
            notas: [],
            promedioAnual: 0,
            aprobado: true
          });
        }
        
        const subjectGrades = gradesMap.get(materia)!;
        
        // Agregar nota por bimestre
        const bimestre = item.bimester || item.bimestre || 1;
        const nota = item.final_grade || item.nota || 0;
        
        subjectGrades.notas.push({
          bimestre,
          nota,
          porcentajeAsistencia: item.attendance_percentage
        });
      });
    }
    
    // Calcular promedios
    gradesMap.forEach(subject => {
      if (subject.notas.length > 0) {
        const sum = subject.notas.reduce((acc, n) => acc + n.nota, 0);
        subject.promedioAnual = Math.round(sum / subject.notas.length);
        subject.aprobado = subject.promedioAnual >= 51; // Bolivia: 51 es aprobatorio
      }
    });
    
    return Array.from(gradesMap.values());
  } catch (error) {
    console.error('Error obteniendo notas del hijo:', error);
    return [];
  }
}

/**
 * Obtiene el registro de asistencia del estudiante hijo
 */
export async function getChildAttendance(): Promise<{ stats: ChildAttendanceStats; records: ChildAttendanceRecord[] }> {
  const studentId = getChildStudentId();
  
  if (!studentId) {
    return {
      stats: {
        totalClases: 0,
        presentes: 0,
        ausentes: 0,
        tardanzas: 0,
        justificados: 0,
        porcentajeAsistencia: 0
      },
      records: []
    };
  }

  try {
    const response = await apiClient.get(`/attendance/report/${studentId}`);
    const data = response.data.data || response.data;
    
    // Transformar los datos
    const records: ChildAttendanceRecord[] = [];
    let presentes = 0, ausentes = 0, tardanzas = 0, justificados = 0;
    
    if (Array.isArray(data.records || data)) {
      const rawRecords = data.records || data;
      rawRecords.forEach((item: any, index: number) => {
        const estado = item.status || item.estado || 'presente';
        
        records.push({
          id: item.id || index,
          fecha: item.date || item.fecha || '',
          materia: item.subject_name || item.materia || '',
          estado: estado as ChildAttendanceRecord['estado'],
          observacion: item.observation || item.observacion || ''
        });
        
        // Contar estadísticas
        switch (estado) {
          case 'presente': case 'present': presentes++; break;
          case 'ausente': case 'absent': ausentes++; break;
          case 'tardanza': case 'late': tardanzas++; break;
          case 'justificado': case 'justified': justificados++; break;
        }
      });
    }
    
    const totalClases = records.length;
    const porcentajeAsistencia = totalClases > 0 
      ? Math.round((presentes + justificados) / totalClases * 100) 
      : 100;
    
    return {
      stats: {
        totalClases,
        presentes,
        ausentes,
        tardanzas,
        justificados,
        porcentajeAsistencia
      },
      records
    };
  } catch (error) {
    console.error('Error obteniendo asistencia del hijo:', error);
    return {
      stats: { totalClases: 0, presentes: 0, ausentes: 0, tardanzas: 0, justificados: 0, porcentajeAsistencia: 0 },
      records: []
    };
  }
}

/**
 * Obtiene las tareas del estudiante hijo
 */
export async function getChildTasks(): Promise<ChildTask[]> {
  const studentId = getChildStudentId();
  
  if (!studentId) {
    return [];
  }

  try {
    const response = await apiClient.get('/assignments', {
      params: { student_id: studentId }
    });
    
    const data = response.data.data || response.data;
    
    if (!Array.isArray(data)) {
      return [];
    }
    
    return data.map((item: any) => ({
      id: item.id,
      titulo: item.title || item.titulo || 'Sin título',
      descripcion: item.description || item.descripcion || '',
      materia: item.subject_name || item.materia || '',
      docente: item.teacher_name || item.docente || '',
      fecha_asignacion: item.assigned_date || item.fecha_asignacion || '',
      fecha_entrega: item.due_date || item.fecha_entrega || '',
      estado: mapTaskStatus(item.status || item.estado),
      prioridad: item.priority || item.prioridad || 'media',
      nota: item.grade || item.nota
    }));
  } catch (error) {
    console.error('Error obteniendo tareas del hijo:', error);
    return [];
  }
}

function mapTaskStatus(status: string): ChildTask['estado'] {
  const statusMap: Record<string, ChildTask['estado']> = {
    'pending': 'pendiente',
    'submitted': 'entregado',
    'graded': 'calificado',
    'overdue': 'vencido',
    'late': 'vencido'
  };
  return statusMap[status] || (status as ChildTask['estado']) || 'pendiente';
}

/**
 * Obtiene el registro de conducta del estudiante
 */
export async function getChildConduct(): Promise<{ stats: ConductStats; records: ConductRecord[] }> {
  const studentId = getChildStudentId();
  
  if (!studentId) {
    return {
      stats: { puntosPositivos: 0, puntosNegativos: 0, puntosNetos: 0, totalRegistros: 0 },
      records: []
    };
  }

  try {
    // Intentar obtener de endpoint de conducta
    const response = await apiClient.get(`/conduct/${studentId}`);
    const data = response.data.data || response.data;
    
    let puntosPositivos = 0, puntosNegativos = 0;
    const records: ConductRecord[] = [];
    
    if (Array.isArray(data)) {
      data.forEach((item: any, index: number) => {
        const tipo = item.type || item.tipo || 'neutral';
        const puntos = item.points || item.puntos || 0;
        
        records.push({
          id: item.id || index,
          fecha: item.date || item.fecha || '',
          tipo: tipo as ConductRecord['tipo'],
          categoria: item.category || item.categoria || '',
          descripcion: item.description || item.descripcion || '',
          docente: item.teacher_name || item.docente || '',
          puntos
        });
        
        if (tipo === 'positivo' || tipo === 'positive') puntosPositivos += puntos;
        if (tipo === 'negativo' || tipo === 'negative') puntosNegativos += Math.abs(puntos);
      });
    }
    
    return {
      stats: {
        puntosPositivos,
        puntosNegativos,
        puntosNetos: puntosPositivos - puntosNegativos,
        totalRegistros: records.length
      },
      records
    };
  } catch (error) {
    console.error('Error obteniendo conducta del hijo:', error);
    return {
      stats: { puntosPositivos: 0, puntosNegativos: 0, puntosNetos: 0, totalRegistros: 0 },
      records: []
    };
  }
}

/**
 * Obtiene los logros del estudiante
 */
export async function getChildAchievements(): Promise<Achievement[]> {
  const studentId = getChildStudentId();
  
  if (!studentId) {
    return [];
  }

  try {
    const response = await apiClient.get(`/achievements/student/${studentId}`);
    const data = response.data.data || response.data;
    
    if (!Array.isArray(data)) {
      return [];
    }
    
    return data.map((item: any) => ({
      id: item.id,
      titulo: item.title || item.titulo || '',
      descripcion: item.description || item.descripcion || '',
      categoria: item.category || item.categoria || '',
      fecha: item.date || item.fecha || '',
      nivel: item.level || item.nivel || 'bronce',
      icono: item.icon || item.icono || ''
    }));
  } catch (error) {
    console.error('Error obteniendo logros del hijo:', error);
    return [];
  }
}

/**
 * Obtiene las estadísticas del dashboard del padre
 */
export async function getParentDashboardStats(): Promise<ParentDashboardStats> {
  const studentId = getChildStudentId();
  
  const defaultStats: ParentDashboardStats = {
    promedio_general: 0,
    porcentaje_asistencia: 0,
    tareas_pendientes: 0,
    tareas_completadas: 0,
    puntos_conducta: 0,
    logros_totales: 0,
    proximas_entregas: [],
    alertas: []
  };

  if (!studentId) {
    return defaultStats;
  }

  try {
    // Obtener datos en paralelo
    const [grades, attendance, tasks, conduct, achievements] = await Promise.allSettled([
      getChildGrades(),
      getChildAttendance(),
      getChildTasks(),
      getChildConduct(),
      getChildAchievements()
    ]);

    let promedio_general = 0;
    let porcentaje_asistencia = 0;
    let tareas_pendientes = 0;
    let tareas_completadas = 0;
    let puntos_conducta = 0;
    let logros_totales = 0;
    let proximas_entregas: ChildTask[] = [];
    const alertas: ParentDashboardStats['alertas'] = [];

    // Procesar notas
    if (grades.status === 'fulfilled' && grades.value.length > 0) {
      const sum = grades.value.reduce((acc, g) => acc + g.promedioAnual, 0);
      promedio_general = Math.round(sum / grades.value.length);
      
      // Alertas por materias reprobadas
      grades.value.forEach(g => {
        if (!g.aprobado) {
          alertas.push({
            tipo: 'notas',
            mensaje: `${g.materia} tiene promedio bajo (${g.promedioAnual})`,
            fecha: new Date().toISOString()
          });
        }
      });
    }

    // Procesar asistencia
    if (attendance.status === 'fulfilled') {
      porcentaje_asistencia = attendance.value.stats.porcentajeAsistencia;
      
      if (porcentaje_asistencia < 80) {
        alertas.push({
          tipo: 'asistencia',
          mensaje: `La asistencia está en ${porcentaje_asistencia}%. Se requiere mejorar.`,
          fecha: new Date().toISOString()
        });
      }
    }

    // Procesar tareas
    if (tasks.status === 'fulfilled') {
      tareas_pendientes = tasks.value.filter(t => t.estado === 'pendiente').length;
      tareas_completadas = tasks.value.filter(t => t.estado === 'entregado' || t.estado === 'calificado').length;
      
      // Próximas entregas (próximos 7 días)
      const hoy = new Date();
      const en7dias = new Date();
      en7dias.setDate(en7dias.getDate() + 7);
      
      proximas_entregas = tasks.value
        .filter(t => {
          const fechaEntrega = new Date(t.fecha_entrega);
          return t.estado === 'pendiente' && fechaEntrega >= hoy && fechaEntrega <= en7dias;
        })
        .sort((a, b) => new Date(a.fecha_entrega).getTime() - new Date(b.fecha_entrega).getTime())
        .slice(0, 5);
      
      // Alertas por tareas vencidas
      const vencidas = tasks.value.filter(t => t.estado === 'vencido').length;
      if (vencidas > 0) {
        alertas.push({
          tipo: 'tareas',
          mensaje: `Hay ${vencidas} tarea(s) vencida(s) sin entregar`,
          fecha: new Date().toISOString()
        });
      }
    }

    // Procesar conducta
    if (conduct.status === 'fulfilled') {
      puntos_conducta = conduct.value.stats.puntosNetos;
      
      if (puntos_conducta < 0) {
        alertas.push({
          tipo: 'conducta',
          mensaje: `El balance de conducta es negativo (${puntos_conducta} pts)`,
          fecha: new Date().toISOString()
        });
      }
    }

    // Procesar logros
    if (achievements.status === 'fulfilled') {
      logros_totales = achievements.value.length;
    }

    return {
      promedio_general,
      porcentaje_asistencia,
      tareas_pendientes,
      tareas_completadas,
      puntos_conducta,
      logros_totales,
      proximas_entregas,
      alertas
    };
  } catch (error) {
    console.error('Error obteniendo estadísticas del dashboard:', error);
    return defaultStats;
  }
}
