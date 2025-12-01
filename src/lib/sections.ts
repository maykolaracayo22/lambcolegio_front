// src/lib/sections.ts
// Modelo de Secciones (Paralelos) alineado a Bolivia (Regular)

export const niveles = ["inicial", "primaria", "secundaria"] as const;
export type NivelKey = typeof niveles[number];
export type Turno = "Mañana" | "Tarde" | "Noche";

export type Section = {
  id: string;
  year: string;              // Año de gestión (p.ej. "2025")
  nivel: NivelKey;           // inicial | primaria | secundaria
  curso: string;             // "1ro Inicial", "4to Primaria", "3ro Secundaria"
  paralelo: string;          // A, B, C...
  turno: Turno;
  aula?: string;
  capacidad?: number;
  tutorId?: string;
  tutorNombre?: string;
  estado: "ACTIVA" | "CERRADA";
};

// Storage
const STORAGE = "adm:sections";

// Catálogos (Regular)
export const cursosInicial = ["1ro Inicial", "2do Inicial"];
export const cursosPrimaria = [
  "1ro Primaria","2do Primaria","3ro Primaria","4to Primaria","5to Primaria","6to Primaria",
];
export const cursosSecundaria = [
  "1ro Secundaria","2do Secundaria","3ro Secundaria","4to Secundaria","5to Secundaria","6to Secundaria",
];

export const cursosPorNivel: Record<NivelKey, string[]> = {
  inicial: cursosInicial,
  primaria: cursosPrimaria,
  secundaria: cursosSecundaria,
};

export const paralelosSugeridos = ["A","B","C","D","E","F"];
export const turnos: Turno[] = ["Mañana","Tarde","Noche"];

// Helpers
export function getSections(): Section[] {
  try { return JSON.parse(localStorage.getItem(STORAGE) || "[]"); } catch { return []; }
}
export function saveSections(list: Section[]) {
  localStorage.setItem(STORAGE, JSON.stringify(list));
}
export function uniqKeyFor(s: Pick<Section,"year"|"nivel"|"curso"|"paralelo">) {
  return `${s.year}::${s.nivel}::${s.curso}::${s.paralelo}`;
}

// Consultas para otras pantallas (Asignaciones, etc.)
export function sectionsByYearNivel(year: string, nivel: NivelKey) {
  return getSections().filter(s => s.year === year && s.nivel === nivel && s.estado === "ACTIVA");
}

/** Cursos (años de escolaridad) disponibles por año/nivel, p.ej. ["1ro Primaria","2do Primaria", ...] */
export function cursosDisponibles(year: string, nivel: NivelKey) {
  const set = new Set(sectionsByYearNivel(year, nivel).map(s => s.curso));
  return Array.from(set).sort((a,b)=>a.localeCompare(b,"es"));
}

/** Paralelos disponibles de un curso dado, p.ej. ["A","B"] */
export function paralelosDeCurso(year: string, nivel: NivelKey, curso: string) {
  return sectionsByYearNivel(year, nivel)
    .filter(s => s.curso === curso)
    .map(s => s.paralelo)
    .sort((a,b)=>a.localeCompare(b,"es"));
}
