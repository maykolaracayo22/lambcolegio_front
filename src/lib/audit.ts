// src/lib/audit.ts
export type AuditEvent = {
  ts: number;              // timestamp (ms)
  action: string;          // ej: "student:create"
  payload?: any;           // datos asociados
  user?: string;           // opcional (admin actual)
};

const KEY = "adm:audit";

export function pushAudit(action: string, payload?: any, user = "admin") {
  try {
    const raw = localStorage.getItem(KEY);
    const arr: AuditEvent[] = raw ? JSON.parse(raw) : [];
    arr.unshift({ ts: Date.now(), action, payload, user });
    // guarda las últimas 500
    localStorage.setItem(KEY, JSON.stringify(arr.slice(0, 500)));
  } catch {
    // silencio, para no romper la UI si storage falla
  }
}

export function getAudit(limit = 100): AuditEvent[] {
  try {
    const raw = localStorage.getItem(KEY);
    const arr: AuditEvent[] = raw ? JSON.parse(raw) : [];
    return arr.slice(0, limit);
  } catch {
    return [];
  }
}
