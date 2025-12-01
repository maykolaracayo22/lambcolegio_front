// src/services/mockServer.ts
// Interceptor de fetch para prototipo sin backend.
// Atiende rutas /admin/* y /gradebook/* usando el almacenamiento local
// provisto por src/services/mockAdmin.ts

import {
  getReglasSistema,
  setReglasSistema,
  getAsignaciones,
  setAsignaciones,
  createMissingActas,
  getActas,
  saveActa,
  validateActa,
  validateBulk,
  lockActa,
  unlockActa,
  lockBulk,
  publishActa,
  unpublishActa,
  publishBulk,
} from "@/services/mockAdmin";
import type { Acta, ActasFilter, Assignment, ReglasSistema } from "@/lib/types-admin";

// Util: leer body JSON de Request
async function readJSON<T = any>(req: Request): Promise<T> {
  const text = await req.text();
  if (!text) return {} as T;
  try { return JSON.parse(text) as T; } catch { return {} as T; }
}
// Util: parsear querystring
function parseQuery(url: string): Record<string, string> {
  const u = new URL(url, location.origin);
  const out: Record<string, string> = {};
  u.searchParams.forEach((v, k) => { out[k] = v; });
  return out;
}
// Respuestas cortas
function json(data: any, init?: ResponseInit) {
  return new Response(JSON.stringify(data), {
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
    status: init?.status ?? 200,
  });
}

export function installMock() {
  const orig = window.fetch;
  // Evitar doble instalación
  // @ts-ignore
  if (window.__ADM_MOCK_INSTALLED__) return;
  // @ts-ignore
  window.__ADM_MOCK_INSTALLED__ = true;

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === "string" ? input : input.toString();
    const method = (init?.method || "GET").toUpperCase();

    try {
      // Solo interceptamos si no hay VITE_API_BASE o la URL es relativa
      const isRelative = !/^https?:\/\//i.test(url);
      if (!isRelative) return orig(input as any, init);

      // ------------ ADMIN ------------
      if (url.startsWith("/admin/")) {
        // RUTAS:
        // GET  /admin/rules
        // POST /admin/rules
        // GET  /admin/assign?year=2025
        // POST /admin/assign (body: {year, list})
        // POST /admin/create-actas (body: {year, term, nivel?})
        // GET  /admin/actas?[filtros]
        // POST /admin/actas/validate (body:{ref})
        // POST /admin/actas/lock     (body:{ref})
        // POST /admin/actas/unlock   (body:{ref})
        // POST /admin/actas/publish  (body:{ref})
        // POST /admin/actas/unpublish(body:{ref})
        // POST /admin/actas/validate-bulk (body:{refs:[]})
        // POST /admin/actas/lock-bulk     (body:{refs:[]})
        // POST /admin/actas/publish-bulk  (body:{refs:[]})

        if (url === "/admin/rules" && method === "GET") {
          const r = getReglasSistema();
          return json({ ok: true, data: r });
        }
        if (url === "/admin/rules" && method === "POST") {
          const body = await readJSON<{ user: { id: string; nombre: string }, reglas: ReglasSistema }>(new Request(url, init));
          setReglasSistema(body.user, body.reglas);
          return json({ ok: true });
        }
        if (url.startsWith("/admin/assign") && method === "GET") {
          const q = parseQuery(url);
          const year = Number(q.year);
          const list = getAsignaciones(year);
          return json({ ok: true, data: list });
        }
        if (url === "/admin/assign" && method === "POST") {
          const body = await readJSON<{ user: { id: string; nombre: string }, year: number, list: Assignment[] }>(new Request(url, init));
          setAsignaciones(body.user, body.year, body.list);
          return json({ ok: true });
        }
        if (url === "/admin/create-actas" && method === "POST") {
          const body = await readJSON<{ user: { id: string; nombre: string }, year: number, term: "T1"|"T2"|"T3", nivel?: "inicial"|"primaria"|"secundaria" }>(new Request(url, init));
          const count = createMissingActas(body.user, body.year, body.term, body.nivel ? { nivel: body.nivel } : undefined);
          return json({ ok: true, created: count });
        }
        if (url.startsWith("/admin/actas") && method === "GET") {
          const q = parseQuery(url);
          const filter: ActasFilter = {
            year: q.year ? Number(q.year) : undefined,
            nivel: q.nivel as any,
            grado: q.grado,
            seccion: q.seccion,
            materiaId: q.materiaId,
            docenteId: q.docenteId,
            term: q.term as any,
            status: q.status as any,
          };
          const data = getActas(filter);
          return json({ ok: true, data });
        }
        if (url === "/admin/actas/validate" && method === "POST") {
          const body = await readJSON<{ user:{id:string;nombre:string}, ref:string }>(new Request(url, init));
          const a = validateActa(body.user, body.ref);
          return json({ ok: true, data: a });
        }
        if (url === "/admin/actas/lock" && method === "POST") {
          const body = await readJSON<{ user:{id:string;nombre:string}, ref:string }>(new Request(url, init));
          const a = lockActa(body.user, body.ref);
          return json({ ok: true, data: a });
        }
        if (url === "/admin/actas/unlock" && method === "POST") {
          const body = await readJSON<{ user:{id:string;nombre:string}, ref:string }>(new Request(url, init));
          const a = unlockActa(body.user, body.ref);
          return json({ ok: true, data: a });
        }
        if (url === "/admin/actas/publish" && method === "POST") {
          const body = await readJSON<{ user:{id:string;nombre:string}, ref:string }>(new Request(url, init));
          const a = publishActa(body.user, body.ref);
          return json({ ok: true, data: a });
        }
        if (url === "/admin/actas/unpublish" && method === "POST") {
          const body = await readJSON<{ user:{id:string;nombre:string}, ref:string }>(new Request(url, init));
          const a = unpublishActa(body.user, body.ref);
          return json({ ok: true, data: a });
        }
        if (url === "/admin/actas/validate-bulk" && method === "POST") {
          const body = await readJSON<{ user:{id:string;nombre:string}, refs:string[] }>(new Request(url, init));
          const res = validateBulk(body.user, body.refs);
          return json({ ok: true, data: res });
        }
        if (url === "/admin/actas/lock-bulk" && method === "POST") {
          const body = await readJSON<{ user:{id:string;nombre:string}, refs:string[] }>(new Request(url, init));
          const res = lockBulk(body.user, body.refs);
          return json({ ok: true, data: res });
        }
        if (url === "/admin/actas/publish-bulk" && method === "POST") {
          const body = await readJSON<{ user:{id:string;nombre:string}, refs:string[] }>(new Request(url, init));
          const res = publishBulk(body.user, body.refs);
          return json({ ok: true, data: res });
        }

        // Si no coincide, caemos a fetch original
        return orig(input as any, init);
      }

      // ------------ GRADEBOOK (para docente/estudiante/padre) ------------
      if (url.startsWith("/gradebook")) {
        // GET /gradebook?sectionId=SEC-A&subjectId=MAT-1&term=T1&year=2025
        // POST /gradebook/save
        // POST /gradebook/lock
        // POST /gradebook/publish
        if (url.startsWith("/gradebook") && method === "GET") {
          const q = parseQuery(url);
          const sectionId = q.sectionId;
          const subjectId = q.subjectId;
          const term = q.term as "T1"|"T2"|"T3";
          const year = Number(q.year || new Date().getFullYear());
          const ref = `${year}:${sectionId}:${subjectId}:${term}`;
          const all = getActas({}); // usamos API mock para obtener acta
          const found = all.find(a => a.ref === ref);
          if (!found) return json({ ok: false, error: "Acta no encontrada." }, { status: 404 });
          // simulamos respuesta de gradebook
          return json({
            ok: true,
            data: {
              header: {
                sectionId,
                subjectId,
                term,
                year,
                status: found.status,
                etag: found.etag,
                docente: found.docenteNombre,
                materia: found.materiaNombre,
                seccion: found.seccion,
                grado: found.grado,
                nivel: found.nivel,
              },
              evaluations: found.evaluaciones,
              grades: found.notas,
            }
          });
        }
        if (url === "/gradebook/save" && method === "POST") {
          const body = await readJSON<{ user:{id:string;nombre:string}, acta: Acta }>(new Request(url, init));
          const saved = saveActa(body.user, body.acta);
          return json({ ok: true, data: { etag: saved.etag } });
        }
        if (url === "/gradebook/lock" && method === "POST") {
          const body = await readJSON<{ user:{id:string;nombre:string}, ref:string }>(new Request(url, init));
          const a = lockActa(body.user, body.ref);
          return json({ ok: true, data: { status: a.status, etag: a.etag } });
        }
        if (url === "/gradebook/publish" && method === "POST") {
          const body = await readJSON<{ user:{id:string;nombre:string}, ref:string }>(new Request(url, init));
          const a = publishActa(body.user, body.ref);
          return json({ ok: true, data: { status: a.status, etag: a.etag } });
        }
      }

      // Por defecto, comportamiento normal
      return orig(input as any, init);
    } catch (e: any) {
      return json({ ok: false, error: e?.message || "Mock error" }, { status: 500 });
    }
  };
}
