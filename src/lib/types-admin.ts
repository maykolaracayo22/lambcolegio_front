// src/lib/types-admin.ts
// Tipos centrales para el módulo de Administración (prototipo)

import type {
  NivelKey,
  ReglaNumerica,
  ReglaCualitativa,
  ReglasPorNivel,
} from "@/lib/bolivia";

// --- Trimestres ---
export type Term = "T1" | "T2" | "T3";

// --- Estados de Acta ---
export type ActaStatus = "DRAFT" | "LOCKED" | "PUBLISHED";

// --- Asignación Docente–Materia–Sección ---
export type Assignment = {
  id: string;
  year: number;
  nivel: NivelKey;
  grado: string;         // p.ej. "1ro", "2do", "6to"
  seccion: string;       // p.ej. "A", "B"
  materiaId: string;
  materiaNombre: string;
  docenteId: string;
  docenteNombre: string;
};

// --- Evaluación (componente con peso) ---
export type Evaluacion = {
  id: string;
  nombre: string;        // p.ej. "Examen 1"
  peso: number;          // 0..100 (suma total 100 en el acta)
  fecha?: string;        // ISO
};

// --- Nota numérica o cualitativa ---
export type NotaNum = {
  tipo: "NUM";
  matriculaId: string;   // vínculo a estudiante matriculado en la sección
  valor: number | null;  // null si faltante
};

export type QualiCode = "EN_PROCESO" | "LOGRADO" | "DESTACADO" | "OTRO";
export type NotaQual = {
  tipo: "QUAL";
  matriculaId: string;
  valor: QualiCode | null;
};

// --- Métricas de validación/calidad del acta ---
export type ActaMetrics = {
  pesosOK: boolean;      // true si sumaPesos === 100
  sumaPesos: number;     // suma de los pesos
  pctNotas: number;      // porcentaje de celdas con nota (0..100)
  errores: string[];     // mensajes agregados por validadores
};

// --- Acta (Sección + Materia + Trimestre) ---
export type Acta = {
  ref: string;           // `${year}:${seccion}:${materiaId}:${term}`
  year: number;
  nivel: NivelKey;
  grado: string;
  seccion: string;
  term: Term;

  materiaId: string;
  materiaNombre: string;

  docenteId: string;
  docenteNombre: string;

  status: ActaStatus;
  etag: number;          // versionado para conflictos optimistic

  evaluaciones: Evaluacion[];
  notas: Array<NotaNum | NotaQual>;

  metrics: ActaMetrics;

  lockedAt?: string;
  lockedBy?: string;
  publishedAt?: string;
  publishedBy?: string;

  updatedAt: string;
  updatedBy: string;     // userId o nombre
};

// --- Auditoría ---
export type AuditAction =
  | "CREATE_ACTA"
  | "SAVE"
  | "VALIDATE"
  | "LOCK"
  | "UNLOCK"
  | "PUBLISH"
  | "UNPUBLISH"
  | "EXPORT";

export type AuditEvent = {
  id: string;
  userId: string;
  userNombre: string;
  accion: AuditAction;
  target: "ACTA" | "REGLAS" | "ASIGNACION";
  ref: string;           // `${year}:${seccion}:${materiaId}:${term}` o id de reglas
  before?: any;
  after?: any;
  ts: string;            // ISO
  ip?: string;
  ua?: string;
};

// --- Reglas (importadas) ---
export type ReglasSistema = ReglasPorNivel;
export type ReglaNivel = ReglaNumerica | ReglaCualitativa;

// --- Filtrado de actas para Admin ---
export type ActasFilter = {
  year?: number;
  nivel?: NivelKey;
  grado?: string;
  seccion?: string;
  materiaId?: string;
  docenteId?: string;
  term?: Term;
  status?: ActaStatus;
};

// --- Filas de Centralizador (para exportar) ---
export type CentralizadorRow = {
  codigoEstudiante: string;
  nombreEstudiante: string;
  grado: string;
  seccion: string;
  materia: string;
  term: Term;
  // dinámico: columnas por evaluación + promedio
  // se genera en tiempo de exportación
};

// --- KPI para overview ---
export type AdminKPI = {
  totalActas: number;
  draft: number;
  locked: number;
  published: number;
  pesosOkPct: number;
  notasCompletasPct: number;
};

// --- Claves de almacenamiento local (prototipo centralizado) ---
export const LS_KEYS = {
  rules: "adm:rules:v2",
  assign: (year: number) => `adm:assign:${year}`,
  acta: (year: number, seccion: string, materiaId: string, term: Term) =>
    `adm:acta:${year}:${seccion}:${materiaId}:${term}`,
  audit: "adm:audit",
} as const;
