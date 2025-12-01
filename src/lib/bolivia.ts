// src/lib/bolivia.ts
export type NivelKey = "inicial" | "primaria" | "secundaria";

export type ReglaNumerica = {
  type: "NUMERIC";
  minNota: number;     // 0
  maxNota: number;     // 100
  aprobatoria: number; // 51
  decimales: number;   // 0 o 1
  asistenciaMin: number;
};

export type QualiCode = "EN_PROCESO"|"LOGRADO"|"DESTACADO"|"OTRO";
export type ReglaCualitativa = {
  type: "QUALITATIVE";
  niveles: Array<{ code: QualiCode; label: string; order: number }>;
  asistenciaMin: number;
};

export type ReglasPorNivel = Record<NivelKey, ReglaNumerica | ReglaCualitativa>;

export const BOLIVIA_DEFAULTS: ReglasPorNivel = {
  inicial: {
    type: "QUALITATIVE",
    niveles: [
      { code: "EN_PROCESO", label: "En proceso", order: 1 },
      { code: "LOGRADO", label: "Logrado", order: 2 },
      { code: "DESTACADO", label: "Destacado", order: 3 },
    ],
    asistenciaMin: 70,
  },
  primaria: { type: "NUMERIC", minNota: 0, maxNota: 100, aprobatoria: 51, decimales: 0, asistenciaMin: 70 },
  secundaria:{ type: "NUMERIC", minNota: 0, maxNota: 100, aprobatoria: 51, decimales: 0, asistenciaMin: 70 },
};

export function getNivel(): NivelKey {
  return (localStorage.getItem("nivel") as NivelKey) || "primaria";
}

export function getReglas(): ReglasPorNivel {
  try {
    const raw = localStorage.getItem("adm:rules:v2");
    if (raw) return JSON.parse(raw);
  } catch {}
  localStorage.setItem("adm:rules:v2", JSON.stringify(BOLIVIA_DEFAULTS));
  return BOLIVIA_DEFAULTS;
}

export function setReglas(r: ReglasPorNivel) {
  localStorage.setItem("adm:rules:v2", JSON.stringify(r));
}

export function estadoPromedio(prom: number, aprobatoria = 51) {
  return prom >= aprobatoria ? "Aprobado" : "Reprobado";
}
