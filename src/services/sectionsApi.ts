import axios, { AxiosInstance } from "axios";
import { API_BASE } from "@/lib/config";

export type NivelKey = "inicial" | "primaria" | "secundaria";

// Tutor info embedded in Section response
export type TutorInfo = {
  id: number;
  nombres: string;
  apellidos: string;
  email?: string;
};

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
  tutor?: TutorInfo | null; // Eager loaded tutor info
  estudiantes_count?: number; // Conteo de estudiantes inscritos
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

const api: AxiosInstance = axios.create({
  baseURL: API_BASE,
  withCredentials: false,
  timeout: 15000,
  headers: { Accept: "application/json" },
});

// Interceptor para agregar token de autenticación
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
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
  getSectionStudents,
  duplicateSectionsYear,
};

// ---------- Nuevas funciones ----------

/** Estudiante inscrito en una sección */
export type SectionStudent = {
  enrollment_id: number;
  estado_matricula: string;
  fecha_inscripcion?: string;
  id: number;
  codigo_estudiante: string;
  nombres: string;
  apellidos: string;
  ci?: string;
  email?: string;
  telefono?: string;
};

/** Respuesta de estudiantes de una sección */
export type SectionStudentsResponse = {
  section: {
    id: number;
    curso: string;
    paralelo: string;
    capacidad: number | null;
  };
  total: number;
  estudiantes: SectionStudent[];
};

/** Obtener estudiantes de una sección */
export async function getSectionStudents(sectionId: number | string): Promise<SectionStudentsResponse> {
  console.groupCollapsed("[sectionsApi] GET /sections/" + sectionId + "/students");
  try {
    const res = await api.get<SectionStudentsResponse>(`/sections/${sectionId}/students`);
    console.log("✔ status", res.status, "total:", res.data?.total);
    return res.data;
  } catch (err) {
    console.error("✖ error", err);
    throw err;
  } finally {
    console.groupEnd();
  }
}

/** Respuesta de duplicación de secciones */
export type DuplicateYearResponse = {
  message: string;
  created: number;
  skipped: number;
  errors: string[];
};

/** Duplicar secciones de un año a otro */
export async function duplicateSectionsYear(
  sourceYear: string | number,
  targetYear: string | number,
  nivel?: NivelKey
): Promise<DuplicateYearResponse> {
  console.groupCollapsed("[sectionsApi] POST /sections/duplicate-year", { sourceYear, targetYear, nivel });
  try {
    const res = await api.post<DuplicateYearResponse>("/sections/duplicate-year", {
      source_year: String(sourceYear),
      target_year: String(targetYear),
      nivel: nivel || null,
    });
    console.log("✔ status", res.status, "created:", res.data?.created);
    return res.data;
  } catch (err) {
    console.error("✖ error", err);
    throw err;
  } finally {
    console.groupEnd();
  }
}
