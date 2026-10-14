export interface TeacherCreatedTask {
  id: number;
  materiaId: number;
  sectionId: number;
  teacherId: string;
  teacherName?: string;
  materiaNombre: string;
  grado: string;
  grupo: string;
  nivel: string;
  year: string;
  titulo: string;
  descripcion: string;
  fechaAsignacion: string;
  fechaEntrega: string;
  ponderacion: number;
  tipo: 'tarea' | 'examen' | 'proyecto' | 'investigación';
  estado: 'abierta' | 'cerrada';
  instrucciones?: string;
}

const storageKey = (teacherId: string) => `teacher:created-tasks:${teacherId}`;
export const TEACHER_TASKS_UPDATED = 'teacher-tasks-updated';

export function getTeacherCreatedTasks(teacherId: string): TeacherCreatedTask[] {
  try {
    const value = localStorage.getItem(storageKey(teacherId));
    const parsed: unknown = value ? JSON.parse(value) : [];
    return Array.isArray(parsed) ? parsed as TeacherCreatedTask[] : [];
  } catch {
    return [];
  }
}

/** Tareas guardadas por docentes en este navegador, para mostrarlas al alumnado. */
export function getAllTeacherCreatedTasks(): TeacherCreatedTask[] {
  const tasks: TeacherCreatedTask[] = [];
  try {
    for (let index = 0; index < localStorage.length; index += 1) {
      const key = localStorage.key(index);
      if (!key?.startsWith('teacher:created-tasks:')) continue;
      const parsed: unknown = JSON.parse(localStorage.getItem(key) || '[]');
      if (Array.isArray(parsed)) tasks.push(...parsed as TeacherCreatedTask[]);
    }
  } catch (error) {
    console.warn('No se pudieron leer las tareas guardadas en este navegador:', error);
  }
  return tasks;
}

export function saveTeacherCreatedTask(task: TeacherCreatedTask): void {
  const tasks = getTeacherCreatedTasks(task.teacherId);
  localStorage.setItem(storageKey(task.teacherId), JSON.stringify([task, ...tasks]));
  window.dispatchEvent(new CustomEvent(TEACHER_TASKS_UPDATED, { detail: { teacherId: task.teacherId } }));
}
