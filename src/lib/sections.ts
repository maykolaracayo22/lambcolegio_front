// src/lib/sections.ts
// Modelo de Secciones (Paralelos) alineado a Bolivia (Regular)
// Re-exporta desde el catálogo unificado para compatibilidad

import {
  NIVELES,
  CURSOS_INICIAL,
  CURSOS_PRIMARIA,
  CURSOS_SECUNDARIA,
  CURSOS_POR_NIVEL,
  PARALELOS,
  TURNOS,
  type NivelKey as NivelKeyBase,
  type Turno as TurnoBase,
} from "@/lib/catalogo-bolivia";

// Re-exportar tipos para compatibilidad
export const niveles = NIVELES;
export type NivelKey = NivelKeyBase;
export type Turno = TurnoBase;

export type Section = {
  id: string;
  year: string;              // Año de gestión (p.ej. "2025")
  nivel: NivelKey;           // inicial | primaria | secundaria
  curso: string;             // "1ra Sección", "4to Primaria", "3ro Secundaria"
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

// Catálogos (desde catálogo unificado Bolivia)
export const cursosInicial = [...CURSOS_INICIAL];
export const cursosPrimaria = [...CURSOS_PRIMARIA];
export const cursosSecundaria = [...CURSOS_SECUNDARIA];

export const cursosPorNivel: Record<NivelKey, string[]> = {
  inicial: cursosInicial,
  primaria: cursosPrimaria,
  secundaria: cursosSecundaria,
};

export const paralelosSugeridos = [...PARALELOS];
export const turnos: Turno[] = [...TURNOS];

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
