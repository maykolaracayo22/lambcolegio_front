// Utilities to validate assignments (overlaps, conflicts, basic business rules)
// Local lightweight types to avoid circular imports with UI pages
export type Assignment = {
  id: string;
  docenteId: number;
  docenteNombre?: string;
  materia: string;
  curso: string;
  paralelo: string;
  dia: "Lun" | "Mar" | "Mié" | "Jue" | "Vie";
  inicio: string; // HH:MM
  fin: string; // HH:MM
  aula?: string;
};

export type DocenteT = {
  id: number;
  nombre: string;
  apellido?: string;
  ci?: string;
  nro_rda?: string;
  estado_rda?: "VIGENTE" | "OBSERVADO";
  estado?: string;
};

function timeToMinutes(t: string) {
  const m = t.match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return NaN;
  return Number(m[1]) * 60 + Number(m[2]);
}

export function overlaps(aStart: string, aEnd: string, bStart: string, bEnd: string) {
  const aS = timeToMinutes(aStart);
  const aE = timeToMinutes(aEnd);
  const bS = timeToMinutes(bStart);
  const bE = timeToMinutes(bEnd);
  if ([aS, aE, bS, bE].some(Number.isNaN)) return false;
  return aS < bE && bS < aE; // standard overlap test
}

export function findConflicts(assign: Assignment, existing: Assignment[]) {
  return existing.filter((e) => e.docenteId === assign.docenteId && e.dia === assign.dia && overlaps(e.inicio, e.fin, assign.inicio, assign.fin));
}

export function findAssignmentsForTeacher(docenteId: number, existing: Assignment[]) {
  return existing.filter((e) => e.docenteId === docenteId).sort((x, y) => {
    if (x.dia === y.dia) return x.inicio.localeCompare(y.inicio);
    return x.dia.localeCompare(y.dia);
  });
}

export function validateAssignment(assign: Assignment, existing: Assignment[], docentes: DocenteT[] = [], options?: { allowOverlap?: boolean }) {
  const errors: string[] = [];
  const conflicts = findConflicts(assign, existing);

  const docente = docentes.find((d) => d.id === assign.docenteId);
  if (!docente) errors.push("Docente no encontrado");
  else if (docente.estado_rda !== "VIGENTE") errors.push("RDA no vigente");

  // basic time format check
  if (isNaN(timeToMinutes(assign.inicio)) || isNaN(timeToMinutes(assign.fin))) errors.push("Horario inválido");
  else if (timeToMinutes(assign.inicio) >= timeToMinutes(assign.fin)) errors.push("Rango de horario inválido (inicio >= fin)");

  const ok = errors.length === 0 && (conflicts.length === 0 || options?.allowOverlap === true);
  return { ok, errors, conflicts };
}

export default {
  overlaps,
  findConflicts,
  findAssignmentsForTeacher,
  validateAssignment,
};
