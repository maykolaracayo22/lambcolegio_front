// src/services/sections_sync.ts
import { listSections } from "@/services/sectionsApi";
import type { NivelKey } from "@/lib/sections";

/**
 * Tipo que devuelve el backend (Laravel) para una sección
 */
export type SectionApi = {
  id: number | string;
  year: string | number;
  nivel: "inicial" | "primaria" | "secundaria";
  curso: string;
  paralelo: string;
  turno: "Mañana" | "Tarde" | "Noche";
  aula?: string | null;
  capacidad?: number | null;
  tutor_id?: number | null;
  estado: "ACTIVA" | "CERRADA";
};

/**
 * La librería front usa esta forma:
 * export type Section = {
 *   id: string;
 *   year: string;
 *   nivel: NivelKey;
 *   curso: string;
 *   paralelo: string;
 *   turno: "Mañana" | "Tarde" | "Noche";
 *   aula?: string;
 *   capacidad?: number;
 *   tutorId?: string;
 *   tutorNombre?: string;
 *   estado: "ACTIVA" | "CERRADA";
 * };
 *
 * Storage key: "adm:sections"
 */

const STORAGE_KEY = "adm:sections";

export type SectionFront = {
  id: string;
  year: string;
  nivel: NivelKey;
  curso: string;
  paralelo: string;
  turno: "Mañana" | "Tarde" | "Noche";
  aula?: string;
  capacidad?: number;
  tutorId?: string;
  tutorNombre?: string;
  estado: "ACTIVA" | "CERRADA";
};

function readLocal(): SectionFront[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function writeLocal(list: SectionFront[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

/** Mapea la fila del backend → formato local usado por lib/sections.ts */
function mapApiToFront(s: SectionApi): SectionFront {
  return {
    id: String(s.id),
    year: String(s.year),
    nivel: s.nivel as NivelKey,
    curso: s.curso,
    paralelo: s.paralelo,
    turno: s.turno,
    aula: s.aula || "",
    capacidad: s.capacidad ?? undefined,
    tutorId: s.tutor_id != null ? String(s.tutor_id) : "",
    tutorNombre: "", // El backend no está enviando nombre del tutor (aún)
    estado: s.estado,
  };
}

/**
 * Descarga secciones (por year+nivel) y las fusiona en localStorage,
 * reemplazando las que coinciden en ese scope (year+nivel) para mantener consistencia.
 */
export async function syncSectionsFor(year: string, nivel: NivelKey) {
  console.groupCollapsed("[sections_sync] syncSectionsFor", { year, nivel });
  try {
    // Traemos 1 página con per_page alto
    const page1 = await listSections({ year, nivel, page: 1, per_page: 200 });
    const fetchedApi: SectionApi[] = Array.isArray(page1?.data) ? page1.data : [];
    console.log("API rows:", fetchedApi.length);

    const fetched = fetchedApi.map(mapApiToFront);
    const prev = readLocal();

    // limpiamos scope year+nivel
    const rest = prev.filter((x) => !(x.year === year && x.nivel === nivel));
    const next = [...fetched, ...rest];

    writeLocal(next);
    console.log("local total:", next.length, "added/updated:", fetched.length);
    return { added: fetched.length, total: next.length };
  } catch (e) {
    console.error("[sections_sync] error", e);
    throw e;
  } finally {
    console.groupEnd();
  }
}

/** Full sync: trae por cada nivel, útil si quieres cargar todo en memoria local. */
export async function syncAllSections(year: string) {
  const niveles: NivelKey[] = ["inicial", "primaria", "secundaria"];
  let totalAdded = 0;
  for (const n of niveles) {
    const res = await syncSectionsFor(year, n);
    totalAdded += res.added;
  }
  return { totalAdded, totalLocal: readLocal().length };
}

/**
 * Opcional: auto-sync si quieres llamarlo en tu App bootstrap (ej. en App.tsx / useEffect)
 *  - Lee year de localStorage (adm:year) y sincroniza todos los niveles.
 */
export async function runSectionsStartupSync() {
  const y = localStorage.getItem("adm:year") || String(new Date().getFullYear());
  try {
    const res = await syncAllSections(y);
    console.log("[sections_sync] startup OK:", res);
  } catch (e) {
    // silenciar para no romper UI si el backend no está arriba
    console.warn("Sections sync failed:", e);
  }
}
