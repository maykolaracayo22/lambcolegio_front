// src/pages/admin/Estudiantes.tsx
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, Edit, Trash2, RefreshCw, KeyRound, Info, Clipboard, AlertTriangle } from "lucide-react";
import CrudFormDialog from "@/pages/admin/CrudFormDialog";
import { pushAudit } from "@/lib/audit";

// Catálogo local (fallback) y tipo de nivel
import { cursosPorNivel } from "@/lib/sections";
import type { NivelKey } from "@/lib/sections";

// API: cursos/paralelos reales desde Laravel
import { getCursos, getParalelos } from "@/services/sectionsApi";

const DEBUG = true;

type Estudiante = {
  id: number;
  nombres: string;
  apellidos: string;
  nivel: NivelKey;     // inicial | primaria | secundaria
  curso: string;       // p.ej. "3ro Primaria"
  paralelo: string;    // p.ej. "A"
  activo: boolean;
  correo: string;
  // RUDE/código interno (provisional: lo reemplaza el backend real)
  codigo: string;
  // credenciales
  usuario: string;
  passwordTemp: string;
  anioIngreso: string; // "2025"
  // datos opcionales
  fechaNac?: string;
  sexo?: "M" | "F";
};

const STORAGE_KEY = "adm:students";
const YEAR_KEY = "adm:year";
const TERM_KEY = "adm:term";
const NIVEL_KEY = "adm:nivel";

// ---------- helpers ----------
const stripAccents = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}\s'-]/gu, "");

const firstToken = (s: string) => stripAccents(s).trim().split(/\s+|-/)[0] || "";

const toSlug = (s: string) =>
  stripAccents(s)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ".")
    .replace(/(^\.)|(\.$)/g, "");

function buildUsername(baseApellido: string, baseNombre: string, existing: string[]): string {
  const base = `${firstToken(baseApellido)}.${firstToken(baseNombre)}`.toLowerCase();
  const core = toSlug(base);
  if (!core) return `user${existing.length + 1}`;
  let candidate = core;
  let i = 2;
  while (existing.includes(candidate)) {
    candidate = `${core}.${i}`;
    i++;
  }
  return candidate;
}
const pad6 = (n: number | string) => String(n).slice(-6).padStart(6, "0");
const yearFromCodigo = (codigo: string) => {
  const m = codigo.match(/EST-(\d{4})-/);
  return m ? m[1] : String(new Date().getFullYear());
};

// ---------- componente ----------
export default function AdminEstudiantes() {
  // Año/Nivel vivos (escuchan cambios del panel Admin)
  const [year, setYear] = useState<string>(
    localStorage.getItem(YEAR_KEY) || String(new Date().getFullYear())
  );
  const globalTerm = localStorage.getItem(TERM_KEY) || "T1";
  const [nivel, setNivel] = useState<NivelKey>(
    ((localStorage.getItem(NIVEL_KEY) as NivelKey) || "primaria")
  );

  // Sincronizar cuando cambie localStorage (otra pestaña) o al volver el foco
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === YEAR_KEY && e.newValue && e.newValue !== year) setYear(e.newValue);
      if (e.key === NIVEL_KEY && e.newValue && e.newValue !== nivel) setNivel(e.newValue as NivelKey);
    };
    const onFocus = () => {
      const y = localStorage.getItem(YEAR_KEY);
      if (y && y !== year) setYear(y);
      const nv = localStorage.getItem(NIVEL_KEY) as NivelKey | null;
      if (nv && nv !== nivel) setNivel(nv);
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener("focus", onFocus);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", onFocus);
    };
  }, [year, nivel]);

  // Cursos/paralelos desde API (fallback al catálogo local si aún no hay secciones reales)
  const [cursosDispon, setCursosDispon] = useState<string[]>([]);
  const [paralelosDispon, setParalelosDispon] = useState<string[]>([]);

  // Cargar cursos reales por año+nivel
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        DEBUG && console.groupCollapsed("[API] list cursos");
        DEBUG && console.log("→ GET /api/sections (distinct cursos)", { year, nivel });
        const cursos = await getCursos(year, nivel);
        if (!alive) return;
        setCursosDispon(cursos.length ? cursos : cursosPorNivel[nivel]);
        DEBUG && console.log("✔ cursos (desde DB):", cursos);
        if (!cursos.length) {
          DEBUG && console.log("⚠ fallback catálogo local:", cursosPorNivel[nivel]);
        }
        DEBUG && console.groupEnd();
      } catch (err) {
        DEBUG && console.groupCollapsed("[API] list cursos — ERROR");
        DEBUG && console.error(err);
        setCursosDispon(cursosPorNivel[nivel]);
        DEBUG && console.log("⚠ fallback catálogo local:", cursosPorNivel[nivel]);
        DEBUG && console.groupEnd();
      }
    })();
    return () => { alive = false; };
  }, [year, nivel]);

  // curso/paralelo seleccionados
  const [curso, setCurso] = useState<string>("");
  useEffect(() => {
    if (cursosDispon.length) {
      setCurso(cursosDispon[0]);
      DEBUG && console.log("[UI] curso seleccionado por defecto:", cursosDispon[0]);
    }
  }, [cursosDispon]);

  // Cargar paralelos reales por año+nivel+curso
  useEffect(() => {
    let alive = true;
    (async () => {
      if (!curso) { setParalelosDispon([]); return; }
      try {
        DEBUG && console.groupCollapsed("[API] list paralelos");
        DEBUG && console.log("→ GET /api/sections (paralelos)", { year, nivel, curso });
        const paralelos = await getParalelos(year, nivel, curso);
        if (!alive) return;
        setParalelosDispon(paralelos.length ? paralelos : ["A","B","C"]);
        DEBUG && console.log("✔ paralelos (desde DB):", paralelos);
        if (!paralelos.length) {
          DEBUG && console.log("⚠ fallback ['A','B','C']");
        }
        DEBUG && console.groupEnd();
      } catch (err) {
        DEBUG && console.groupCollapsed("[API] list paralelos — ERROR");
        DEBUG && console.error(err);
        setParalelosDispon(["A","B","C"]);
        DEBUG && console.log("⚠ fallback ['A','B','C']");
        DEBUG && console.groupEnd();
      }
    })();
    return () => { alive = false; };
  }, [year, nivel, curso]);

  const [paralelo, setParalelo] = useState<string>("");
  useEffect(() => {
    if (paralelosDispon.length) {
      setParalelo(paralelosDispon[0]);
      DEBUG && console.log("[UI] paralelo seleccionado por defecto:", paralelosDispon[0]);
    }
  }, [paralelosDispon]);

  const [q, setQ] = useState("");

  // datos (localStorage por ahora)
  const [rows, setRows] = useState<Estudiante[]>([]);

  // carga + migración (grado/seccion → curso/paralelo) + credenciales
  useEffect(() => {
    DEBUG && console.groupCollapsed("[DATA] carga inicial estudiantes");
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      DEBUG && console.log("↳ desde localStorage", { key: STORAGE_KEY });
      const parsed = JSON.parse(raw) as Partial<Estudiante | any>[];
      const fixed = ensureCredentialsAndMigrate(parsed);
      setRows(fixed);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(fixed));
      DEBUG && console.log("✔ normalizados:", fixed);
    } else {
      DEBUG && console.log("↳ sin datos: seeding de prueba");
      const seed: Partial<Estudiante>[] = [
        { id: 1, nombres: "Juan",  apellidos: "Pérez Martínez", nivel: "primaria", curso: "3ro Primaria", paralelo: "A", activo: true, correo: "juan@colegio.edu",  codigo: "EST-2025-001", fechaNac: "2014-05-09", sexo:"M" },
        { id: 2, nombres: "María", apellidos: "Gómez Quispe",   nivel: "primaria", curso: "3ro Primaria", paralelo: "B", activo: true, correo: "maria@colegio.edu", codigo: "EST-2025-002", fechaNac: "2014-01-20", sexo:"F" },
        { id: 3, nombres: "Luis",  apellidos: "Rojas",           nivel: "secundaria", curso: "1ro Secundaria", paralelo: "A", activo: true, correo: "luis@colegio.edu",  codigo: "EST-2025-003", fechaNac: "2011-11-03", sexo:"M" },
      ];
      const seeded = ensureCredentialsAndMigrate(seed);
      setRows(seeded);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
      DEBUG && console.log("✔ seeded:", seeded);
    }
    DEBUG && console.groupEnd();
  }, []);

  const save = (next: Estudiante[]) => {
    setRows(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    DEBUG && console.log("[DATA] save localStorage:", { key: STORAGE_KEY, count: next.length });
  };

  const list = useMemo(() => {
    const out = rows.filter((r) =>
      (!nivel || r.nivel === nivel) &&
      (!curso || r.curso === curso) &&
      (!paralelo || r.paralelo === paralelo) &&
      (`${r.nombres} ${r.apellidos} ${r.codigo} ${r.usuario}`.toLowerCase().includes(q.toLowerCase()))
    );
    DEBUG && console.log("[UI] filtro lista", { nivel, curso, paralelo, q, resultados: out.length });
    return out;
  }, [rows, nivel, curso, paralelo, q]);

  // ---------- CRUD ----------
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Estudiante | null>(null);

  const openCreate = () => { setEditing(null); setOpen(true); DEBUG && console.log("[UI] abrir diálogo crear"); };
  const openEdit = (row: Estudiante) => { setEditing(row); setOpen(true); DEBUG && console.log("[UI] abrir diálogo editar", row); };

  const nextId = () => rows.length ? Math.max(...rows.map(r => r.id)) + 1 : 1;
  const makeCodigo = (id: number, yearX: string) => `EST-${yearX}-${String(id).padStart(3, "0")}`;

  const onSubmit = (vals: any) => {
    const nv: NivelKey = nivel; // bloqueado por filtro superior
    const cursoVal = (vals.curso && cursosDispon.includes(vals.curso))
      ? vals.curso
      : (cursosDispon[0] || cursosPorNivel[nv][0]);

    // Paralelos válidos (de API si hay; si no, catálogo "A/B/C")
    const paralelosValidos = paralelosDispon.length ? paralelosDispon : ["A","B","C"];
    const paraleloVal = paralelosValidos.includes(vals.paralelo) ? vals.paralelo : paralelosValidos[0];

    const anioIngreso = String(vals.anioIngreso || year);

    if (!vals.nombres?.trim() || !vals.apellidos?.trim() || !vals.correo?.trim()) {
      alert("Completa Nombres, Apellidos y Correo.");
      return;
    }
    if (vals.fechaNac && !/^\d{4}-\d{2}-\d{2}$/.test(vals.fechaNac)) {
      alert("Fecha de nacimiento inválida (usa YYYY-MM-DD).");
      return;
    }
    if (vals.sexo && !["M","F"].includes(vals.sexo)) {
      alert("Sexo inválido (M/F).");
      return;
    }

    if (editing) {
      const payload = { ...editing, ...vals, nivel: nv, curso: cursoVal, paralelo: paraleloVal, anioIngreso };
      DEBUG && console.groupCollapsed("[CRUD] actualizar estudiante (LOCAL)");
      DEBUG && console.log("payload:", payload);
      const updated = rows.map(r => r.id === editing.id ? payload : r);
      save(updated);
      pushAudit("student:update", { id: editing.id, vals });
      DEBUG && console.log("✔ actualizado (localStorage)");
      DEBUG && console.groupEnd();
    } else {
      const id = nextId();
      const codigo = makeCodigo(id, anioIngreso); // RUDE real lo dará tu backend
      const existingUsers = rows.map(r => r.usuario);
      const usuario = buildUsername(vals.apellidos, vals.nombres, existingUsers);
      const numeroReg6 = pad6(id);
      const passwordTemp = `${anioIngreso}${numeroReg6}`;

      const nuevo: Estudiante = {
        id,
        nombres: vals.nombres,
        apellidos: vals.apellidos,
        correo: vals.correo,
        nivel: nv,
        curso: cursoVal,
        paralelo: paraleloVal,
        activo: Boolean(vals.activo ?? true),
        codigo,
        usuario,
        passwordTemp,
        anioIngreso,
        fechaNac: vals.fechaNac || undefined,
        sexo: vals.sexo || undefined,
      };

      DEBUG && console.groupCollapsed("[CRUD] crear estudiante (LOCAL)");
      DEBUG && console.log("payload:", nuevo);
      const next = [nuevo, ...rows];
      save(next);
      pushAudit("student:create", { id, usuario });
      DEBUG && console.log("✔ creado (localStorage)");
      DEBUG && console.groupEnd();

      // Si ya tienes endpoint Laravel para estudiantes, aquí podrías hacer:
      // try {
      //   DEBUG && console.groupCollapsed("[API] POST /api/students");
      //   const res = await apiCreateStudent(nuevo);
      //   DEBUG && console.log("✔ creado en DB:", res);
      //   DEBUG && console.groupEnd();
      // } catch (err) {
      //   DEBUG && console.error("✖ error creando en DB:", err);
      // }
      navigator.clipboard?.writeText(`Usuario: ${usuario}\nContraseña: ${passwordTemp}`).catch(() => {});
      alert(`Estudiante creado.\n\nUsuario: ${usuario}\nContraseña temporal: ${passwordTemp}\n\n(Se copió al portapapeles si el navegador lo permite)`);
    }
    setOpen(false);
  };

  const toggleActivo = (id: number) => {
    DEBUG && console.groupCollapsed("[CRUD] toggle activo (LOCAL)");
    const next = rows.map(r => r.id === id ? ({ ...r, activo: !r.activo }) : r);
    save(next);
    pushAudit("student:toggle", { id });
    DEBUG && console.log("✔ toggled id:", id);
    DEBUG && console.groupEnd();
  };

  const resetPass = (id: number) => {
    const s = rows.find(r => r.id === id);
    if (!s) return;
    const numeroReg6 = pad6(s.id);
    const newPass = `${s.anioIngreso || yearFromCodigo(s.codigo)}${numeroReg6}`;
    const next = rows.map(r => r.id === id ? ({ ...r, passwordTemp: newPass }) : r);
    save(next);
    pushAudit("student:resetpass", { id });
    DEBUG && console.log("[CRUD] reset pass (LOCAL)", { id, newPass });

    navigator.clipboard?.writeText(`Usuario: ${s.usuario}\nNueva contraseña: ${newPass}`).catch(() => {});
    alert(`Contraseña regenerada.\n\nUsuario: ${s.usuario}\nNueva contraseña: ${newPass}\n\n(Se copió al portapapeles si el navegador lo permite)`);
  };

  const showCreds = (id: number) => {
    const s = rows.find(r => r.id === id);
    if (!s) return;
    DEBUG && console.log("[UI] mostrar credenciales", { id, usuario: s.usuario, passwordTemp: s.passwordTemp });
    navigator.clipboard?.writeText(`Usuario: ${s.usuario}\nContraseña: ${s.passwordTemp}`).catch(() => {});
    alert(`Credenciales:\n\nUsuario: ${s.usuario}\nContraseña temporal: ${s.passwordTemp}\n\n(Se copió al portapapeles si el navegador lo permite)`);
  };

  const remove = (id: number) => {
    if (!confirm("¿Eliminar estudiante?")) return;
    DEBUG && console.groupCollapsed("[CRUD] eliminar estudiante (LOCAL)");
    const next = rows.filter(r => r.id !== id);
    save(next);
    pushAudit("student:delete", { id });
    DEBUG && console.log("✔ eliminado id:", id);
    DEBUG && console.groupEnd();
  };

  // Campos del diálogo
  const dialogFields = [
    { type: "text", name: "nombres", label: "Nombres", required: true },
    { type: "text", name: "apellidos", label: "Apellidos", required: true },
    { type: "email", name: "correo", label: "Correo", required: true },
    { type: "date", name: "fechaNac", label: "Fecha de nacimiento (opcional)" },
    { type: "select", name: "sexo", label: "Sexo (opcional)", options: [{ value:"M", label:"Masculino" }, { value:"F", label:"Femenino" }] },
    { type: "select", name: "nivel", label: "Nivel (usa el filtro superior)", options: (["inicial","primaria","secundaria"] as NivelKey[]).map(n => ({ value: n, label: n[0].toUpperCase()+n.slice(1) })), disabled: true },
    { type: "select", name: "curso", label: "Curso (año de escolaridad)", options: cursosDispon.map(c => ({ value: c, label: c })) },
    { type: "select", name: "paralelo", label: "Paralelo", options: paralelosDispon.map(p => ({ value: p, label: p })) },
    { type: "text", name: "anioIngreso", label: "Año de ingreso", required: true, note: "Usado para generar la contraseña temporal" },
    { type: "switch", name: "activo", label: "Activo", note: "Habilita el acceso del estudiante" },
  ] as const;

  // Nota si no existen secciones reales (API vacía)
  const sinSeccionesReales = useMemo(() => {
    const flag = cursosDispon.length === 0 || (cursosDispon[0] && cursosPorNivel[nivel].includes(cursosDispon[0]));
    DEBUG && console.log("[UI] sinSeccionesReales:", flag, { year, nivel, cursosDispon });
    return flag;
  }, [cursosDispon, nivel]);

  return (
    <div className="space-y-6 p-4">
      <Card>
        <CardHeader>
          <CardTitle>Estudiantes — {year} {globalTerm}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={nivel}
              onValueChange={(v) => {
                const nv = v as NivelKey;
                setNivel(nv);
                localStorage.setItem(NIVEL_KEY, nv);
                DEBUG && console.log("[UI] cambio nivel:", nv);
              }}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Nivel" />
              </SelectTrigger>
              <SelectContent>
                {(["inicial","primaria","secundaria"] as NivelKey[]).map((n) => (
                  <SelectItem key={n} value={n}>
                    {n[0].toUpperCase() + n.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={curso} onValueChange={(v)=>{ setCurso(v); DEBUG && console.log("[UI] cambio curso:", v); }}>
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder="Curso (año)" />
              </SelectTrigger>
              <SelectContent>
                {cursosDispon.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={paralelo} onValueChange={(v)=>{ setParalelo(v); DEBUG && console.log("[UI] cambio paralelo:", v); }}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Paralelo" />
              </SelectTrigger>
              <SelectContent>
                {paralelosDispon.map((p) => (
                  <SelectItem key={p} value={p}>{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="relative">
              <Search className="h-4 w-4 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-8 w-[280px]"
                placeholder="Buscar por nombre, código o usuario"
                value={q}
                onChange={(e) => { setQ(e.target.value); DEBUG && console.log("[UI] cambio query:", e.target.value); }}
              />
            </div>

            <Button variant="secondary" onClick={openCreate}>
              <Plus className="h-4 w-4 mr-2" /> Nuevo
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                DEBUG && console.groupCollapsed("[DATA] Reset seeds (LOCAL)");
                const seed: Partial<Estudiante>[] = [
                  { id: 1, nombres: "Juan",  apellidos: "Pérez Martínez", nivel: "primaria", curso: "3ro Primaria", paralelo: "A", activo: true, correo: "juan@colegio.edu",  codigo: "EST-2025-001" },
                  { id: 2, nombres: "María", apellidos: "Gómez Quispe",   nivel: "primaria", curso: "3ro Primaria", paralelo: "B", activo: true, correo: "maria@colegio.edu", codigo: "EST-2025-002" },
                  { id: 3, nombres: "Luis",  apellidos: "Rojas",           nivel: "secundaria", curso: "1ro Secundaria", paralelo: "A", activo: true, correo: "luis@colegio.edu",  codigo: "EST-2025-003" },
                ];
                const seeded = ensureCredentialsAndMigrate(seed);
                save(seeded);
                DEBUG && console.log("✔ seeded:", seeded);
                DEBUG && console.groupEnd();
              }}
            >
              <RefreshCw className="h-4 w-4 mr-2" /> Reset
            </Button>
          </div>

          {sinSeccionesReales && (
            <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-2">
              <AlertTriangle className="h-4 w-4" />
              Sugerencia: crea secciones reales en <strong className="mx-1">Admin → Secciones</strong> para que los
              <em className="mx-1">cursos/paralelos</em> se basen en la gestión {year}.
            </div>
          )}

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>RUDE/Código</TableHead>
                  <TableHead>Estudiante</TableHead>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Nivel</TableHead>
                  <TableHead>Curso</TableHead>
                  <TableHead>Paralelo</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-mono text-xs">{r.codigo}</TableCell>
                    <TableCell>
                      {r.apellidos}, {r.nombres}
                      <div className="text-xs text-muted-foreground">{r.correo}</div>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{r.usuario}</TableCell>
                    <TableCell className="capitalize">{r.nivel}</TableCell>
                    <TableCell>{r.curso}</TableCell>
                    <TableCell>{r.paralelo}</TableCell>
                    <TableCell>
                      <span className={`text-xs px-2 py-1 rounded ${r.activo ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                        {r.activo ? "Activo" : "Inactivo"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right space-x-1 whitespace-nowrap">
                      <Button size="sm" variant="outline" onClick={() => openEdit(r)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => showCreds(r.id)}>
                        <Clipboard className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="secondary" onClick={() => resetPass(r.id)}>
                        <KeyRound className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => toggleActivo(r.id)}>
                        {r.activo ? "Desactivar" : "Activar"}
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => remove(r.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {list.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground">
                      <div className="flex items-center gap-2 justify-center py-6">
                        <Info className="h-4 w-4" /> Sin resultados…
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Diálogo Crear/Editar */}
      <CrudFormDialog
        open={open}
        onOpenChange={setOpen}
        title={editing ? "Editar Estudiante" : "Nuevo Estudiante"}
        description={editing ? "Actualiza los datos del estudiante." : "Al crear, se generarán usuario y contraseña temporal."}
        fields={dialogFields as any}
        initialValues={editing ?? {
          nombres: "",
          apellidos: "",
          correo: "",
          fechaNac: "",
          sexo: undefined,
          nivel,                       // nivel del filtro (bloqueado en el diálogo)
          curso: cursosDispon[0] || "",
          paralelo: paralelosDispon[0] || "",
          anioIngreso: year,           // usa la gestión viva
          activo: true
        }}
        onSubmit={onSubmit}
        submitLabel={editing ? "Actualizar" : "Crear"}
      />
    </div>
  );
}

// ---------- migración + credenciales ----------
function ensureCredentialsAndMigrate(items: Partial<Estudiante | any>[]): Estudiante[] {
  const result: Estudiante[] = [];
  const existingUsers: string[] = [];
  for (const raw of items) {
    const id = Number(raw.id ?? (result.length ? Math.max(...result.map(r => r.id)) + 1 : 1));
    const anio = (raw.anioIngreso && String(raw.anioIngreso)) || (raw.codigo ? yearFromCodigo(raw.codigo) : String(new Date().getFullYear()));
    const codigo = raw.codigo ?? `EST-${anio}-${String(id).padStart(3, "0")}`;

    // Migración: si vienen "grado"/"seccion", mapear a "curso"/"paralelo"
    let nivel: NivelKey = (raw.nivel as NivelKey) || "primaria";
    let curso = String(
      raw.curso ??
      raw.grado ??
      (nivel === "inicial" ? "1ro Inicial" : nivel === "primaria" ? "1ro Primaria" : "1ro Secundaria")
    );
    let paralelo = String(raw.paralelo ?? raw.seccion ?? "A");

    // Normalizar a catálogos conocidos (fallback)
    const catalogoCursos = cursosPorNivel[nivel];
    if (!catalogoCursos.includes(curso)) {
      const m = String(curso).match(/^(\d+)/);
      if (m) {
        const n = Number(m[1]);
        if (nivel === "primaria" && n >= 1 && n <= 6) curso = `${n}ro Primaria`.replace("2ro","2do").replace("4ro","4to").replace("5ro","5to").replace("6ro","6to");
        if (nivel === "secundaria" && n >= 1 && n <= 6) curso = `${n}ro Secundaria`.replace("2ro","2do").replace("4ro","4to").replace("5ro","5to").replace("6ro","6to");
        if (nivel === "inicial" && (n === 1 || n === 2)) curso = `${n}ro Inicial`;
      }
      if (!catalogoCursos.includes(curso)) curso = catalogoCursos[0];
    }

    // usuario
    let usuario = raw.usuario;
    if (!usuario) {
      const u = buildUsername(String(raw.apellidos || ""), String(raw.nombres || ""), existingUsers);
      usuario = u || `user${id}`;
    }
    if (existingUsers.includes(usuario)) {
      let i = 2, cand = `${usuario}.${i}`;
      while (existingUsers.includes(cand)) { i++; cand = `${usuario}.${i}`; }
      usuario = cand;
    }
    existingUsers.push(usuario);

    const pass = raw.passwordTemp ?? `${anio}${pad6(id)}`;

    result.push({
      id,
      nombres: String(raw.nombres || "Nombre"),
      apellidos: String(raw.apellidos || "Apellido"),
      nivel,
      curso,
      paralelo,
      activo: raw.activo ?? true,
      correo: String(raw.correo || `user${id}@colegio.edu`),
      codigo,
      usuario,
      passwordTemp: pass,
      anioIngreso: anio,
      fechaNac: raw.fechaNac,
      sexo: raw.sexo,
    });
  }
  DEBUG && console.log("[DATA] ensureCredentialsAndMigrate result:", result.length);
  return result;
}
