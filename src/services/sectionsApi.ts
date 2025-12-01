import axios, { AxiosInstance } from "axios";

export type NivelKey = "inicial" | "primaria" | "secundaria";

export type Section = {
  id: number | string;
  year: string | number;
  nivel: NivelKey;
  curso: string;
  paralelo: string;
  turno: "Mañana" | "Tarde" | "Noche";
  aula?: string | null;
  capacidad?: number | null;
  tutor_id?: number | null;
  estado: "ACTIVA" | "CERRADA";
  created_at?: string;
  updated_at?: string;
};

type Paginated<T> = {
  data: T[];
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
};

const API_BASE =
  (import.meta as any).env?.VITE_API_BASE?.replace(/\/+$/, "") ||
  "http://127.0.0.1:8000/api";

const api: AxiosInstance = axios.create({
  baseURL: API_BASE,
  withCredentials: false,
  timeout: 15000,
  headers: { Accept: "application/json" },
});

// ---------- helpers ----------
function buildQuery(params: Record<string, any>) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") qs.set(k, String(v));
  });
  const s = qs.toString();
  return s ? `?${s}` : "";
}

// ---------- API CRUD ----------
/** Lista paginada de secciones con filtros opcionales */
export async function listSections(filter: {
  year?: string | number;
  nivel?: NivelKey | string;
  curso?: string;
  page?: number;
  per_page?: number;
} = {}) {
  const url = `/sections${buildQuery(filter)}`;
  console.groupCollapsed("[sectionsApi] GET", url);
  try {
    const res = await api.get<Paginated<Section>>(url);
    console.log(
      "✔ status",
      res.status,
      "items:",
      Array.isArray(res.data?.data) ? res.data.data.length : "(sin data)"
    );
    return res.data;
  } catch (err) {
    console.error("✖ error", err);
    throw err;
  } finally {
    console.groupEnd();
  }
}

/** Crear sección */
export async function createSection(payload: {
  year: string | number;
  nivel: NivelKey;
  curso: string;
  paralelo: string;
  turno: "Mañana" | "Tarde" | "Noche";
  aula?: string | null;
  capacidad?: number | null;
  tutor_id?: number | null;
  estado: "ACTIVA" | "CERRADA";
}) {
  console.groupCollapsed("[sectionsApi] POST /sections", payload);
  try {
    const res = await api.post<Section>("/sections", payload);
    console.log("✔ status", res.status, "id:", res.data?.id);
    return res.data;
  } catch (err) {
    console.error("✖ error", err);
    throw err;
  } finally {
    console.groupEnd();
  }
}

/** Actualizar sección */
export async function updateSection(
  id: number | string,
  payload: Partial<{
    year: string | number;
    nivel: NivelKey;
    curso: string;
    paralelo: string;
    turno: "Mañana" | "Tarde" | "Noche";
    aula?: string | null;
    capacidad?: number | null;
    tutor_id?: number | null;
    estado: "ACTIVA" | "CERRADA";
  }>
) {
  console.groupCollapsed("[sectionsApi] PUT /sections/" + id, payload);
  try {
    const res = await api.put<Section>(`/sections/${id}`, payload);
    console.log("✔ status", res.status, "id:", res.data?.id);
    return res.data;
  } catch (err) {
    console.error("✖ error", err);
    throw err;
  } finally {
    console.groupEnd();
  }
}

/** Eliminar sección */
export async function deleteSection(id: number | string) {
  console.groupCollapsed("[sectionsApi] DELETE /sections/" + id);
  try {
    const res = await api.delete(`/sections/${id}`);
    console.log("✔ status", res.status);
    return true;
  } catch (err) {
    console.error("✖ error", err);
    throw err;
  } finally {
    console.groupEnd();
  }
}

// ---------- Helpers para UI ----------
/** Cursos únicos para {year, nivel} */
export async function getCursos(
  year: string | number,
  nivel: NivelKey
): Promise<string[]> {
  const page = await listSections({ year, nivel, page: 1, per_page: 200 });
  const set = new Set<string>();
  (page.data || []).forEach((s) => s?.curso && set.add(String(s.curso)));
  return Array.from(set).sort((a, b) => a.localeCompare(b, "es"));
}

/** Paralelos únicos para {year, nivel, curso} */
export async function getParalelos(
  year: string | number,
  nivel: NivelKey,
  curso: string
): Promise<string[]> {
  const page = await listSections({ year, nivel, curso, page: 1, per_page: 200 });
  const set = new Set<string>();
  (page.data || [])
    .filter((s) => s.curso === curso)
    .forEach((s) => s?.paralelo && set.add(String(s.paralelo)));
  return Array.from(set).sort((a, b) => a.localeCompare(b, "es"));
}

export default {
  listSections,
  createSection,
  updateSection,
  deleteSection,
  getCursos,
  getParalelos,
};
