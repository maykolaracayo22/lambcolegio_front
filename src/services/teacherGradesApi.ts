import axios from 'axios';
import { API_BASE } from '@/lib/config';
import type { TeacherAssignedSection, TeacherSectionStudent } from '@/services/teachersApi';

const api = axios.create({
  baseURL: API_BASE,
  headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export interface TeacherGradeActa {
  id: number;
  year: number;
  nivel: string;
  grado: string | number;
  seccion: string;
  materia_id: number;
  materia_nombre: string;
  term: string;
  status: 'DRAFT' | 'LOCKED' | 'PUBLISHED';
  evaluations?: Array<{ id: number; nombre: string; peso: number; notes?: Array<{ student_id: number; valor: number | string | null }> }>;
  term_totals?: Array<{ student_id: number; tn: number | null }>;
}

export interface TeacherPeriod {
  id: number;
  year: number;
  code: string;
  estado: string;
}

export async function getTeacherGradeSections(year: number, nivel: string) {
  const response = await api.get('/teacher/sections', { params: { year, nivel, per_page: 200 } });
  return (response.data.data || []) as TeacherAssignedSection[];
}

export async function getTeacherGradeStudents(sectionId: number) {
  const response = await api.get(`/teacher/sections/${sectionId}/students`);
  return (response.data.estudiantes || []) as TeacherSectionStudent[];
}

export async function getTeacherActas(params: { year: number; nivel: string; grado: number; seccion: string; term: string }) {
  const response = await api.get('/teacher/gradebook/actas', { params: { ...params, per_page: 200 } });
  return (response.data.data || []) as TeacherGradeActa[];
}

export async function getTeacherActa(id: number) {
  const response = await api.get(`/teacher/gradebook/actas/${id}`);
  return response.data as TeacherGradeActa;
}

export async function getTeacherPeriods(year: number) {
  const response = await api.get('/teacher/periods', { params: { year } });
  return response.data as TeacherPeriod[];
}

export async function createTeacherActa(payload: { year: number; assignment_id: number; section_id: number; period_id: number }) {
  const response = await api.post('/actas', payload);
  return response.data as TeacherGradeActa;
}

export async function createActaEvaluation(payload: { acta_id: number; nombre: string; peso: number }) {
  const response = await api.post('/acta-evaluations', payload);
  return response.data as { id: number };
}

export async function saveTeacherActaNotes(actaId: number, notes: Array<{ student_id: number; evaluation_id: number; valor: number | null }>) {
  await api.put(`/actas/${actaId}/items`, { notes });
}
