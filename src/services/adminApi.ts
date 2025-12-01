// src/services/adminApi.ts
import type { EstudianteCreateDTO, EstudianteDTO, DocenteCreateDTO, DocenteDTO } from "@/lib/dtos";

const BASE = (import.meta as any).env?.VITE_API_BASE || "";

async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const r = await fetch(BASE + url, {
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
    credentials: "include",
    ...init,
  });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json() as Promise<T>;
}

// ESTUDIANTES
export const AdminStudent = {
  list: (q = "") => api<EstudianteDTO[]>(`/admin/students?${q}`),
  get: (id: string) => api<EstudianteDTO>(`/admin/students/${id}`),
  create: (payload: EstudianteCreateDTO) => api<EstudianteDTO>(`/admin/students`, { method: "POST", body: JSON.stringify(payload) }),
  update: (id: string, payload: Partial<EstudianteCreateDTO>) => api<EstudianteDTO>(`/admin/students/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  // Generación RUDE la hace el backend al crear; también puedes refrescar:
  regenRUDE: (id: string) => api<{ codigo_rude: string }>(`/admin/students/${id}/rude`, { method: "POST" }),
};

// DOCENTES
export const AdminTeacher = {
  list: (q = "") => api<DocenteDTO[]>(`/admin/teachers?${q}`),
  get: (id: string) => api<DocenteDTO>(`/admin/teachers/${id}`),
  create: (payload: DocenteCreateDTO) => api<DocenteDTO>(`/admin/teachers`, { method: "POST", body: JSON.stringify(payload) }),
  update: (id: string, payload: Partial<DocenteCreateDTO>) => api<DocenteDTO>(`/admin/teachers/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
};
