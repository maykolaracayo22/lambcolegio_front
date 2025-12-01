// src/lib/sections_sync.ts
import { listSections, type Section as SectionApi } from "@/services/sectionsApi";
import { niveles, type NivelKey, type Section } from "@/lib/sections";

const STORAGE = "adm:sections";

function readSections(): Section[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE) || "[]");
  } catch {
    return [];
  }
}

function writeSections(list: Section[]) {
  localStorage.setItem(STORAGE, JSON.stringify(list));
}

/** Backend → Front (normaliza una fila del API al tipo Section local) */
function mapApiToLocal(s: SectionApi): Section {
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
    tutorNombre: "", // El API aún no envía el nombre; se puede ampliar luego
    estado: s.estado,
  };
}

/**
 * Descarga secciones para un nivel dado (pide 1 sola página grande)
 */
async function fetchLevel(year: string, nivel: NivelKey): Promise<Section[]> {
  console.groupCollapsed("[sections_sync] fetchLevel", { year, nivel });
  try {
    const page = await listSections({ year, nivel, page: 1, per_page: 200 });
    const rows: SectionApi[] = Array.isArray(page?.data) ? page.data : [];
    console.log("API items:", rows.length);
    return rows.map(mapApiToLocal);
  } catch (e) {
    console.error("[sections_sync] error fetchLevel", { year, nivel }, e);
    throw e;
  } finally {
    console.groupEnd();
  }
}

/**
 * Sincroniza desde el backend todas las secciones de la gestión indicada y
 * las guarda en localStorage para que el resto de pantallas lean la misma fuente.
 * Devuelve la cantidad total guardada.
 */
export async function syncSectionsFromApi(year: string) {
  console.groupCollapsed("[sections_sync] syncSectionsFromApi", { year });
  const acc: Section[] = [];
  for (const nivel of niveles as NivelKey[]) {
    try {
      const list = await fetchLevel(year, nivel);
      acc.push(...list);
    } catch (e) {
      // Si falla un nivel, continuamos con los demás
      console.warn("[sections_sync] fallo nivel", nivel, e);
    }
  }

  if (acc.length > 0) {
    // (opcional) de-duplicar por year+nivel+curso+paralelo
    const seen = new Set<string>();
    const uniq: Section[] = [];
    for (const s of acc) {
      const key = `${s.year}::${s.nivel}::${s.curso}::${s.paralelo}`;
      if (!seen.has(key)) {
        seen.add(key);
        uniq.push(s);
      }
    }
    writeSections(uniq);
    console.log("[sections_sync] guardado en localStorage:", uniq.length);
  } else {
    console.log("[sections_sync] nada que guardar (0 filas)");
  }

  console.groupEnd();
  return acc.length;
}
