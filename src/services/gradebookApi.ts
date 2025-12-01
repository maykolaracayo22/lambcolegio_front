// src/services/gradebookApi.ts
import type { GradebookData } from "@/components/gradebook/Gradebook";

const API = (import.meta as any).env?.VITE_API_BASE || "";
const TIMEOUT_MS = 8000;
const RETRIES = 1; // reintentos (además del intento inicial)

type QueueItem =
  | { type: "save"; sectionId: string; payload: GradebookData; ts: number }
  | { type: "lock"; sectionId: string; locked: boolean; ts: number };

type CacheEnvelope = {
  sectionId: string;
  data: GradebookData;
  updatedAt: string;      // ISO
  etag?: string | null;   // ETag/versión del servidor si viene en headers
};

// ==== Storage helpers ====
const cacheKey = (sectionId: string) => `gradebook:${sectionId}`;
const queueKey = () => `gradebook:queue`;

// Leer envoltorio de caché
function readCache(sectionId: string): CacheEnvelope | null {
  try {
    const raw = localStorage.getItem(cacheKey(sectionId));
    return raw ? (JSON.parse(raw) as CacheEnvelope) : null;
  } catch {
    return null;
  }
}

// Escribir envoltorio en caché
function writeCache(sectionId: string, env: CacheEnvelope) {
  try {
    localStorage.setItem(cacheKey(sectionId), JSON.stringify(env));
  } catch {
    // noop
  }
}

function getQueue(): QueueItem[] {
  try {
    const raw = localStorage.getItem(queueKey());
    return raw ? (JSON.parse(raw) as QueueItem[]) : [];
  } catch {
    return [];
  }
}

function setQueue(items: QueueItem[]) {
  try {
    localStorage.setItem(queueKey(), JSON.stringify(items));
  } catch {
    // noop
  }
}

function pushQueue(it: QueueItem) {
  const q = getQueue();
  q.push(it);
  // límite de seguridad (evitar crecimiento infinito)
  while (q.length > 50) q.shift();
  setQueue(q);
}

// ==== Fetch utils ====
async function fetchWithTimeout(input: RequestInfo, init?: RequestInit, timeout = TIMEOUT_MS) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(id);
  }
}

async function fetchWithRetry(input: RequestInfo, init?: RequestInit, retries = RETRIES) {
  let lastErr: unknown = null;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const r = await fetchWithTimeout(input, init);
      return r;
    } catch (e) {
      lastErr = e;
      if (attempt === retries) throw e;
      await new Promise((res) => setTimeout(res, 400 * (attempt + 1)));
    }
  }
  throw lastErr;
}

// ==== API ====

// Obtiene el gradebook. Usa If-None-Match si tenemos ETag cacheado.
// Si la red falla o devuelve error, intenta la caché; si no hay, lanza error.
export async function getGradebook(sectionId: string): Promise<GradebookData> {
  const url = `${API}/api/gradebook?section_id=${encodeURIComponent(sectionId)}`;
  const cached = readCache(sectionId);
  const headers: Record<string, string> = {};
  if (cached?.etag) headers["If-None-Match"] = cached.etag;

  try {
    const r = await fetchWithRetry(url, { headers });

    // 304: no ha cambiado. Devolvemos la caché.
    if (r.status === 304 && cached) {
      return cached.data;
    }

    if (!r.ok) {
      // si el server respondió algo no-ok, intenta caché
      if (cached) return cached.data;
      throw new Error(`HTTP ${r.status}`);
    }

    const data = (await r.json()) as GradebookData;
    const etag = r.headers.get("ETag");
    const env: CacheEnvelope = {
      sectionId,
      data,
      updatedAt: new Date().toISOString(),
      etag,
    };
    writeCache(sectionId, env);
    return data;
  } catch (err) {
    // fallo de red/timeout: usa caché si existe
    if (cached) return cached.data;
    throw new Error("No se pudo cargar el libro (ni backend ni caché).");
  }
}

// Guarda el gradebook. Incluye If-Match si tenemos ETag para control de concurrencia.
// Si falla, guarda en caché y encola para sincronizar luego.
export async function saveGradebook(sectionId: string, payload: GradebookData): Promise<void> {
  const url = `${API}/api/grades/save`;
  const cached = readCache(sectionId);
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (cached?.etag) headers["If-Match"] = cached.etag;

  try {
    const r = await fetchWithRetry(url, {
      method: "POST",
      headers,
      body: JSON.stringify({ sectionId, ...payload }),
    });

    if (!r.ok) {
      // conflicto (409/412) u otro error
      if (r.status === 409 || r.status === 412) {
        throw new Error("Conflicto de versión: el libro cambió en el servidor.");
      }
      throw new Error(`HTTP ${r.status}`);
    }

    // éxito → actualiza caché con potencial nuevo ETag
    const etag = r.headers.get("ETag") || cached?.etag || null;
    const env: CacheEnvelope = {
      sectionId,
      data: payload,
      updatedAt: new Date().toISOString(),
      etag,
    };
    writeCache(sectionId, env);
  } catch (err) {
    // Offline/fallo → persistimos en caché y encolamos
    const env: CacheEnvelope = {
      sectionId,
      data: payload,
      updatedAt: new Date().toISOString(),
      etag: cached?.etag ?? null,
    };
    writeCache(sectionId, env);
    pushQueue({ type: "save", sectionId, payload, ts: Date.now() });
  }
}

// Publicar/bloquear el libro (lock = true)
export async function publishGradebook(sectionId: string) {
  return lockToggle(sectionId, true);
}

// Desbloquear (lock = false)
export async function unlockGradebook(sectionId: string) {
  return lockToggle(sectionId, false);
}

async function lockToggle(sectionId: string, locked: boolean) {
  const url = `${API}/api/grades/lock`;
  try {
    const r = await fetchWithRetry(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sectionId, locked }),
    });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);

    // si hay caché, reflejar el estado de lock
    const cached = readCache(sectionId);
    if (cached) {
      const next = { ...cached, data: { ...cached.data, locked } as GradebookData, updatedAt: new Date().toISOString() };
      writeCache(sectionId, next);
    }
  } catch {
    // offline → reflejar en caché y encolar
    const cached = readCache(sectionId);
    if (cached) {
      const next = { ...cached, data: { ...cached.data, locked } as GradebookData, updatedAt: new Date().toISOString() };
      writeCache(sectionId, next);
    }
    pushQueue({ type: "lock", sectionId, locked, ts: Date.now() });
  }
}

// Fuerza la sincronización de la cola offline (por ejemplo, al reconectar)
export async function syncGradebookQueue(): Promise<{ processed: number; remaining: number }> {
  const q = getQueue();
  if (!q.length) return { processed: 0, remaining: 0 };

  let processed = 0;
  const remaining: QueueItem[] = [];

  for (const item of q) {
    try {
      if (item.type === "save") {
        await saveGradebookOnline(item.sectionId, item.payload);
      } else if (item.type === "lock") {
        await lockToggleOnline(item.sectionId, item.locked);
      }
      processed++;
    } catch {
      // no se pudo procesar → lo dejamos encolado
      remaining.push(item);
    }
  }

  setQueue(remaining);
  return { processed, remaining: remaining.length };
}

// ==== Online helpers (sin encolar en caso de error) ====
async function saveGradebookOnline(sectionId: string, payload: GradebookData) {
  const url = `${API}/api/grades/save`;
  const cached = readCache(sectionId);
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (cached?.etag) headers["If-Match"] = cached.etag;

  const r = await fetchWithRetry(url, {
    method: "POST",
    headers,
    body: JSON.stringify({ sectionId, ...payload }),
  });
  if (!r.ok) {
    if (r.status === 409 || r.status === 412) {
      throw new Error("Conflicto de versión al sincronizar.");
    }
    throw new Error(`HTTP ${r.status}`);
  }
  const etag = r.headers.get("ETag") || cached?.etag || null;
  const env: CacheEnvelope = {
    sectionId,
    data: payload,
    updatedAt: new Date().toISOString(),
    etag,
  };
  writeCache(sectionId, env);
}

async function lockToggleOnline(sectionId: string, locked: boolean) {
  const url = `${API}/api/grades/lock`;
  const r = await fetchWithRetry(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sectionId, locked }),
  });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);

  const cached = readCache(sectionId);
  if (cached) {
    const next = { ...cached, data: { ...cached.data, locked } as GradebookData, updatedAt: new Date().toISOString() };
    writeCache(sectionId, next);
  }
}

// ==== Utilidades extra (opcionales) ====

// Devuelve el gradebook cacheado si existe (sin tocar la red)
export function getCachedGradebook(sectionId: string): GradebookData | null {
  const c = readCache(sectionId);
  return c?.data ?? null;
}

// Limpia caché de una sección
export function clearGradebookCache(sectionId: string) {
  try {
    localStorage.removeItem(cacheKey(sectionId));
  } catch {
    // noop
  }
}
