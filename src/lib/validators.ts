// src/lib/validators.ts
// Validadores y utilidades de cálculo para actas

import type {
  Acta,
  ActaMetrics,
  NotaNum,
  NotaQual,
  ReglasSistema,
  ReglaNivel,
} from "@/lib/types-admin";
import { estadoPromedio } from "@/lib/bolivia";

// --- Utilidades ---
export function roundTo(n: number, decimals = 0) {
  const f = Math.pow(10, decimals);
  return Math.round(n * f) / f;
}

function countNotasLlenas(notas: Array<NotaNum | NotaQual>) {
  let llenas = 0;
  let total = 0;
  for (const n of notas) {
    total++;
    if (n.tipo === "NUM") {
      if (typeof n.valor === "number") llenas++;
    } else {
      if (n.valor) llenas++;
    }
  }
  return { llenas, total, pct: total ? (llenas / total) * 100 : 0 };
}

function sumaPesos(evals: Acta["evaluaciones"]) {
  return evals.reduce((acc, e) => acc + (Number(e.peso) || 0), 0);
}

function decimalsCount(x: number) {
  const s = String(x);
  const i = s.indexOf(".");
  return i >= 0 ? s.length - i - 1 : 0;
}

// --- Validación principal ---
export function validarActa(
  acta: Acta,
  reglasSistema: ReglasSistema
): { ok: boolean; errores: string[]; metrics: ActaMetrics } {
  const errores: string[] = [];

  // 1) Reglas de nivel
  const reglaNivel: ReglaNivel = (reglasSistema as any)[acta.nivel];

  // 2) Suma de pesos
  const sum = roundTo(sumaPesos(acta.evaluaciones), 2);
  const pesosOK = sum === 100;
  if (!pesosOK) {
    errores.push(`La suma de pesos es ${sum} y debe ser exactamente 100.`);
  }

  // 3) Validación de notas según tipo de regla
  if ((reglaNivel as any).type === "NUMERIC") {
    const r = reglaNivel as any; // ReglaNumerica
    const decPermitidos = r.decimales ?? 0;

    for (const n of acta.notas) {
      if (n.tipo !== "NUM") {
        errores.push("Acta numérica no puede contener notas cualitativas.");
        continue;
      }
      if (n.valor == null) continue; // se permite nulo en borrador
      if (typeof n.valor !== "number" || Number.isNaN(n.valor)) {
        errores.push("Hay valores de nota no numéricos.");
        continue;
      }
      if (n.valor < r.minNota || n.valor > r.maxNota) {
        errores.push(
          `Una nota (${n.valor}) está fuera de rango [${r.minNota}..${r.maxNota}].`
        );
      }
      if (decimalsCount(n.valor) > decPermitidos) {
        errores.push(
          `Una nota (${n.valor}) tiene más de ${decPermitidos} decimales.`
        );
      }
    }
  } else {
    // Cualitativo (Inicial)
    for (const n of acta.notas) {
      if (n.tipo !== "QUAL") {
        errores.push("Acta cualitativa no puede contener notas numéricas.");
        continue;
      }
      // valor puede ser null mientras está en borrador
      if (n.valor && !["EN_PROCESO", "LOGRADO", "DESTACADO", "OTRO"].includes(n.valor)) {
        errores.push(`Valor cualitativo inválido: ${n.valor}`);
      }
    }
  }

  // 4) Métricas de completitud
  const fill = countNotasLlenas(acta.notas);
  const metrics: ActaMetrics = {
    pesosOK,
    sumaPesos: sum,
    pctNotas: roundTo(fill.pct, 1),
    errores,
  };

  return { ok: errores.length === 0, errores, metrics };
}

// --- Cálculo de promedio ponderado (numérico) ---
export function promedioPonderado(
  acta: Acta
): { matriculaId: string; promedio: number | null; estado?: "Aprobado" | "Reprobado" }[] {
  const isNumeric = acta.notas.some((n) => n.tipo === "NUM");
  if (!isNumeric) return [];

  // Mapear: matriculaId -> notas por evaluación (asumimos una nota por evaluación)
  // En el prototipo, acta.notas suele contener una nota por alumno por evaluación,
  // o bien una nota final por alumno. Si manejas por evaluación, adapta aquí.
  // Para demo: tomamos la NOTA como el resultado final (si existe).
  const alumnos = new Map<string, number | null>();
  for (const n of acta.notas) {
    if (n.tipo !== "NUM") continue;
    // aquí podrías combinar por evaluación y peso si guardas n por evaluación
    // para demo, usamos el valor tal cual:
    alumnos.set(n.matriculaId, typeof n.valor === "number" ? n.valor : null);
  }

  return Array.from(alumnos.entries()).map(([matriculaId, valor]) => {
    if (valor == null) return { matriculaId, promedio: null };
    const prom = roundTo(valor, 1);
    return {
      matriculaId,
      promedio: prom,
      estado: estadoPromedio(prom, 51) as "Aprobado" | "Reprobado",
    };
  });
}
