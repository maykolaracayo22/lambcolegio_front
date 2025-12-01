// src/services/mockAdmin.ts
// Mock centralizado para Admin (prototipo sin backend)
// Persiste en localStorage: reglas, asignaciones, actas y auditoría.
// Provee acciones: crear/validar/lock/publish (incluye bulk) y exportar CSV.

import { LS_KEYS, type Acta, type Assignment, type AuditEvent, type ActasFilter, type Term, type ReglasSistema } from "@/lib/types-admin";
import { validarActa } from "@/lib/validators";

// --- Helpers de almacenamiento ---
function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function writeJSON<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

// --- Audit ---
function logAudit(ev: Omit<AuditEvent, "id" | "ts">) {
  const list = readJSON<AuditEvent[]>(LS_KEYS.audit, []);
  const id = "AUD-" + Math.random().toString(36).slice(2, 10);
  const ts = new Date().toISOString();
  const complete: AuditEvent = { id, ts, ...ev };
  list.push(complete);
  writeJSON(LS_KEYS.audit, list);
}

// --- Generadores ---
function refOf(year: number, seccion: string, materiaId: string, term: Term) {
  return `${year}:${seccion}:${materiaId}:${term}`;
}

function nowISO() {
  return new Date().toISOString();
}

// --- Actas CRUD (localStorage) ---
function getActa(ref: string): Acta | null {
  const key = `adm:acta:${ref}`;
  const raw = localStorage.getItem(key);
  return raw ? (JSON.parse(raw) as Acta) : null;
}
function putActa(a: Acta) {
  const key = `adm:acta:${a.ref}`;
  writeJSON(key, a);
}
function hasActa(ref: string) {
  return localStorage.getItem(`adm:acta:${ref}`) !== null;
}

// --- API pública del mock ---

// Reglas (ya existen en bolivia.ts, pero centralizamos lectura/escritura aquí por admin)
export function getReglasSistema(): ReglasSistema | null {
  return readJSON<ReglasSistema | null>(LS_KEYS.rules, null);
}
export function setReglasSistema(user: { id: string; nombre: string }, reglas: ReglasSistema) {
  const before = getReglasSistema();
  writeJSON(LS_KEYS.rules, reglas);
  logAudit({
    userId: user.id,
    userNombre: user.nombre,
    accion: "SAVE",
    target: "REGLAS",
    ref: "rules:v2",
    before,
    after: reglas,
  });
}

// Asignaciones
export function getAsignaciones(year: number): Assignment[] {
  return readJSON<Assignment[]>(LS_KEYS.assign(year), []);
}
export function setAsignaciones(user: { id: string; nombre: string }, year: number, list: Assignment[]) {
  writeJSON(LS_KEYS.assign(year), list);
  logAudit({
    userId: user.id,
    userNombre: user.nombre,
    accion: "SAVE",
    target: "ASIGNACION",
    ref: `assign:${year}`,
    after: { count: list.length },
  });
}

// Crear actas faltantes a partir de asignaciones
export function createMissingActas(
  user: { id: string; nombre: string },
  year: number,
  term: Term,
  filtro?: { nivel?: Assignment["nivel"] }
): number {
  const reglas = getReglasSistema();
  if (!reglas) throw new Error("Reglas del sistema no configuradas.");

  const assigns = getAsignaciones(year).filter((a) =>
    filtro?.nivel ? a.nivel === filtro.nivel : true
  );

  let created = 0;
  for (const asg of assigns) {
    const ref = refOf(year, asg.seccion, asg.materiaId, term);
    if (hasActa(ref)) continue;

    const nueva: Acta = {
      ref,
      year,
      nivel: asg.nivel,
      grado: asg.grado,
      seccion: asg.seccion,
      term,
      materiaId: asg.materiaId,
      materiaNombre: asg.materiaNombre,
      docenteId: asg.docenteId,
      docenteNombre: asg.docenteNombre,
      status: "DRAFT",
      etag: 1,
      evaluaciones: [],
      notas: [],
      metrics: { pesosOK: false, sumaPesos: 0, pctNotas: 0, errores: [] },
      updatedAt: nowISO(),
      updatedBy: user.nombre,
    };
    putActa(nueva);
    logAudit({
      userId: user.id,
      userNombre: user.nombre,
      accion: "CREATE_ACTA",
      target: "ACTA",
      ref,
      after: { status: "DRAFT" },
    });
    created++;
  }
  return created;
}

// Listar actas (filtrado)
export function getActas(filter: ActasFilter = {}): Acta[] {
  // Escanear todas las claves adm:acta:...
  const acts: Acta[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i)!;
    if (!k.startsWith("adm:acta:")) continue;
    const a = readJSON<Acta | null>(k, null);
    if (!a) continue;
    acts.push(a);
  }
  return acts.filter((a) => {
    if (filter.year && a.year !== filter.year) return false;
    if (filter.nivel && a.nivel !== filter.nivel) return false;
    if (filter.grado && a.grado !== filter.grado) return false;
    if (filter.seccion && a.seccion !== filter.seccion) return false;
    if (filter.materiaId && a.materiaId !== filter.materiaId) return false;
    if (filter.docenteId && a.docenteId !== filter.docenteId) return false;
    if (filter.term && a.term !== filter.term) return false;
    if (filter.status && a.status !== filter.status) return false;
    return true;
  });
}

// Guardar cambios en acta (datos + recalcular validación)
export function saveActa(
  user: { id: string; nombre: string },
  incoming: Acta
): Acta {
  const current = getActa(incoming.ref);
  if (!current) throw new Error("Acta no existe.");
  if (current.status !== "DRAFT") throw new Error("Acta no editable (LOCKED/PUBLISHED).");
  // Simular ETag optimistic: incoming.etag debe coincidir
  if (incoming.etag !== current.etag) throw new Error("Conflicto de versión (ETag).");

  // Recalcular validación
  const reglas = getReglasSistema();
  if (!reglas) throw new Error("Reglas no disponibles.");
  const { metrics } = validarActa(incoming, reglas);

  const updated: Acta = {
    ...incoming,
    metrics,
    etag: current.etag + 1,
    updatedAt: nowISO(),
    updatedBy: user.nombre,
  };
  putActa(updated);

  logAudit({
    userId: user.id,
    userNombre: user.nombre,
    accion: "SAVE",
    target: "ACTA",
    ref: updated.ref,
    before: { etag: current.etag },
    after: { etag: updated.etag, metrics: updated.metrics },
  });

  return updated;
}

// Validar (sin guardar cambios de datos; solo recalcula metrics y sube etag)
export function validateActa(
  user: { id: string; nombre: string },
  ref: string
): Acta {
  const a = getActa(ref);
  if (!a) throw new Error("Acta no existe.");
  const reglas = getReglasSistema();
  if (!reglas) throw new Error("Reglas no disponibles.");

  const { metrics } = validarActa(a, reglas);
  const updated: Acta = { ...a, metrics, etag: a.etag + 1, updatedAt: nowISO(), updatedBy: user.nombre };
  putActa(updated);

  logAudit({
    userId: user.id,
    userNombre: user.nombre,
    accion: "VALIDATE",
    target: "ACTA",
    ref,
    after: { metrics },
  });

  return updated;
}

// Lock / Unlock
export function lockActa(user: { id: string; nombre: string }, ref: string): Acta {
  const a = getActa(ref);
  if (!a) throw new Error("Acta no existe.");
  if (a.status !== "DRAFT") throw new Error("Sólo se bloquea desde BORRADOR.");
  if (!a.metrics.pesosOK || a.metrics.errores.length > 0) {
    throw new Error("No se puede bloquear: validación pendiente o con errores.");
  }
  const updated: Acta = {
    ...a,
    status: "LOCKED",
    etag: a.etag + 1,
    lockedAt: nowISO(),
    lockedBy: user.nombre,
    updatedAt: nowISO(),
    updatedBy: user.nombre,
  };
  putActa(updated);
  logAudit({ userId: user.id, userNombre: user.nombre, accion: "LOCK", target: "ACTA", ref, after: { status: "LOCKED" } });
  return updated;
}

export function unlockActa(user: { id: string; nombre: string }, ref: string): Acta {
  const a = getActa(ref);
  if (!a) throw new Error("Acta no existe.");
  if (a.status !== "LOCKED") throw new Error("Sólo se desbloquea desde BLOQUEADA.");
  const updated: Acta = {
    ...a,
    status: "DRAFT",
    etag: a.etag + 1,
    updatedAt: nowISO(),
    updatedBy: user.nombre,
  };
  putActa(updated);
  logAudit({ userId: user.id, userNombre: user.nombre, accion: "UNLOCK", target: "ACTA", ref, after: { status: "DRAFT" } });
  return updated;
}

// Publish / Unpublish
export function publishActa(user: { id: string; nombre: string }, ref: string): Acta {
  const a = getActa(ref);
  if (!a) throw new Error("Acta no existe.");
  if (a.status !== "LOCKED") throw new Error("Sólo se publica desde BLOQUEADA.");
  if (!a.metrics.pesosOK || a.metrics.errores.length > 0) {
    throw new Error("No se puede publicar: validación pendiente o con errores.");
  }
  const updated: Acta = {
    ...a,
    status: "PUBLISHED",
    etag: a.etag + 1,
    publishedAt: nowISO(),
    publishedBy: user.nombre,
    updatedAt: nowISO(),
    updatedBy: user.nombre,
  };
  putActa(updated);
  logAudit({ userId: user.id, userNombre: user.nombre, accion: "PUBLISH", target: "ACTA", ref, after: { status: "PUBLISHED" } });
  return updated;
}

export function unpublishActa(user: { id: string; nombre: string }, ref: string): Acta {
  const a = getActa(ref);
  if (!a) throw new Error("Acta no existe.");
  if (a.status !== "PUBLISHED") throw new Error("Sólo se despublica desde PUBLICADA.");
  const updated: Acta = {
    ...a,
    status: "LOCKED",
    etag: a.etag + 1,
    updatedAt: nowISO(),
    updatedBy: user.nombre,
  };
  putActa(updated);
  logAudit({ userId: user.id, userNombre: user.nombre, accion: "UNPUBLISH", target: "ACTA", ref, after: { status: "LOCKED" } });
  return updated;
}

// Bulk helpers
export function validateBulk(user: { id: string; nombre: string }, refs: string[]) {
  let ok = 0, conErrores = 0;
  for (const r of refs) {
    const a = validateActa(user, r);
    if (a.metrics.errores.length === 0 && a.metrics.pesosOK) ok++;
    else conErrores++;
  }
  return { total: refs.length, ok, conErrores };
}
export function lockBulk(user: { id: string; nombre: string }, refs: string[]) {
  let locked = 0, fallidas = 0;
  for (const r of refs) {
    try { lockActa(user, r); locked++; } catch { fallidas++; }
  }
  return { locked, fallidas };
}
export function publishBulk(user: { id: string; nombre: string }, refs: string[]) {
  let published = 0, fallidas = 0;
  for (const r of refs) {
    try { publishActa(user, r); published++; } catch { fallidas++; }
  }
  return { published, fallidas };
}

// Exportaciones CSV (string) — el front puede descargar con Blob
function toCSV(rows: string[][]): string {
  return rows.map(r =>
    r.map(v => {
      const s = (v ?? "").toString();
      if (s.includes(",") || s.includes("\n") || s.includes("\"")) {
        return `"${s.replace(/"/g, '""')}"`;
      }
      return s;
    }).join(",")
  ).join("\n");
}

export function exportCentralizadorCSV(opts: {
  year: number; term: Term; seccion: string;
}) {
  const actas = getActas({ year: opts.year, term: opts.term, seccion: opts.seccion, status: "PUBLISHED" });
  const header = ["Sección", "Grado", "Materia", "Docente", "Estudiante", "Term", "Promedio/Nota"];
  const rows: string[][] = [header];

  for (const a of actas) {
    // Para prototipo, asumimos notas finales por estudiante en a.notas (NUM o QUAL)
    for (const n of a.notas) {
      const estudiante = n.matriculaId; // en backend real sería nombre/código
      const valor = n.tipo === "NUM" ? (n.valor ?? "") : (n.valor ?? "");
      rows.push([a.seccion, a.grado, a.materiaNombre, a.docenteNombre, estudiante, a.term, String(valor)]);
    }
  }
  const content = toCSV(rows);
  const filename = `centralizador_${opts.year}_${opts.seccion}_${opts.term}.csv`;
  logAudit({ userId: "admin", userNombre: "Administrador", accion: "EXPORT", target: "ACTA", ref: `centralizador:${opts.year}:${opts.seccion}:${opts.term}`, after: { rows: rows.length - 1 } });
  return { filename, mime: "text/csv;charset=utf-8", content };
}

export function exportBoletinesCSV(opts: {
  year: number; term: Term; seccion: string;
}) {
  // Agrupar por estudiante (matriculaId)
  const actas = getActas({ year: opts.year, term: opts.term, seccion: opts.seccion, status: "PUBLISHED" });

  const header = ["Estudiante", "Materia", "Term", "Nota/Concepto"];
  const rows: string[][] = [header];

  for (const a of actas) {
    for (const n of a.notas) {
      const estudiante = n.matriculaId;
      const valor = n.tipo === "NUM" ? (n.valor ?? "") : (n.valor ?? "");
      rows.push([estudiante, a.materiaNombre, a.term, String(valor)]);
    }
  }
  const content = toCSV(rows);
  const filename = `boletines_${opts.year}_${opts.seccion}_${opts.term}.csv`;
  logAudit({ userId: "admin", userNombre: "Administrador", accion: "EXPORT", target: "ACTA", ref: `boletines:${opts.year}:${opts.seccion}:${opts.term}`, after: { rows: rows.length - 1 } });
  return { filename, mime: "text/csv;charset=utf-8", content };
}
