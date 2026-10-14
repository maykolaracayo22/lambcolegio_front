import axios from 'axios';
import { API_BASE } from '@/lib/config';

export type AttendanceStatus = 'presente' | 'ausente' | 'tardanza' | 'justificado';

export interface AttendanceEntry {
  id: number;
  student_id: number;
  section_id: number;
  subject_id: number;
  teacher_id: number;
  fecha: string;
  estado: AttendanceStatus;
  observaciones?: string | null;
}

const api = axios.create({ baseURL: API_BASE, headers: { Accept: 'application/json' } });
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export async function getClassAttendance(sectionId: number, subjectId: number, fecha: string): Promise<AttendanceEntry[]> {
  const response = await api.get('/attendance', { params: { section_id: sectionId, subject_id: subjectId, fecha, per_page: 500 } });
  const rows = response.data?.data ?? response.data;
  return Array.isArray(rows) ? rows : [];
}

export async function saveClassAttendance(data: {
  section_id: number;
  subject_id: number;
  teacher_id: number;
  fecha: string;
  attendances: { student_id: number; estado: AttendanceStatus }[];
}): Promise<void> {
  await api.post('/attendance/bulk', data);
}
