// src/pages/admin/Asignaciones.tsx
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, Search, Waypoints, Save, AlertTriangle } from "lucide-react";
import { cursosDisponibles, paralelosDeCurso, NivelKey } from "@/lib/sections";
import { validateAssignment, findAssignmentsForTeacher } from "@/lib/assignments";

type Assignment = {
  id: string;
  docenteId: number;
  docenteNombre: string;
  materia: string;
  curso: string;     // p.ej. "3ro Primaria"
  paralelo: string;  // p.ej. "A"
  dia: "Lun" | "Mar" | "Mié" | "Jue" | "Vie";
  inicio: string;
  fin: string;
  aula?: string;
};

type Docente = {
  id: number;
  nombre: string;
  apellido: string;
  ci: string;
  nro_rda: string;
  estado_rda: "VIGENTE" | "OBSERVADO";
  estado: "activo" | "licencia" | "inactivo";
};

const storageKey = (year: string, nivel: NivelKey) => `adm:assignments:${year}:${nivel}`;
const teacherKey = "adm:teachers";

// Auditoría local simple
const pushAudit = (action: string, meta: Record<string, unknown> = {}) => {
  const k = "adm:audit";
  const log = JSON.parse(localStorage.getItem(k) || "[]");
  log.unshift({ id: Date.now(), date: new Date().toISOString(), action, meta });
  localStorage.setItem(k, JSON.stringify(log));
};

// Migración: asignaciones antiguas {grado,seccion} -> {curso,paralelo}
function migrateAssignments(rows: unknown[] | null | undefined): Assignment[] {
  const arr = Array.isArray(rows) ? rows : [];
  return arr.map((r: Record<string, unknown>) => {
    const rr = r;
    const toStr = (k: string, fallback = "") => {
      const v = rr[k];
      return v === undefined || v === null ? fallback : String(v);
    };
    const toNum = (k: string, fallback = 0) => {
      const v = rr[k];
      const n = Number(v as unknown);
      return Number.isNaN(n) ? fallback : n;
    };

    return {
      id: toStr("id", String(Date.now())),
      docenteId: toNum("docenteId", 0),
      docenteNombre: toStr("docenteNombre", toStr("docente", "")),
      materia: toStr("materia", ""),
      curso: toStr("curso", toStr("grado", "")),
      paralelo: toStr("paralelo", toStr("seccion", "")),
      dia: (toStr("dia", "Lun") as Assignment["dia"]),
      inicio: toStr("inicio", "08:00"),
      fin: toStr("fin", "09:30"),
      aula: toStr("aula", ""),
    } as Assignment;
  });
}

export default function AsignacionesAdmin() {
  const year = localStorage.getItem("adm:year") || String(new Date().getFullYear());
  const nivel = (localStorage.getItem("adm:nivel") as NivelKey) || "primaria";

  // Docentes (desde módulo Docentes)
  const [docentes, setDocentes] = useState<Docente[]>([]);
  useEffect(() => {
    const raw = localStorage.getItem(teacherKey);
    setDocentes(raw ? JSON.parse(raw) : []);
  }, []);

  // ####### cursos/paralelos dinámicos desde Secciones #######
  const cursos = useMemo(() => cursosDisponibles(year, nivel), [year, nivel]);
  const [curso, setCurso] = useState<string>(cursos[0]);
  useEffect(() => { setCurso(cursos[0]); }, [cursos]);

  const paralelos = useMemo(() => (curso ? paralelosDeCurso(year, nivel, curso) : []), [year, nivel, curso]);
  const [paralelo, setParalelo] = useState<string>(paralelos[0]);
  useEffect(() => { setParalelo(paralelos[0]); }, [paralelos]);

  const [q, setQ] = useState("");

  // Cargar/migrar asignaciones
  const [rows, setRows] = useState<Assignment[]>(() => {
    const raw = localStorage.getItem(storageKey(year, nivel));
    return migrateAssignments(raw ? JSON.parse(raw) : []);
  });
  useEffect(() => {
    const raw = localStorage.getItem(storageKey(year, nivel));
    setRows(migrateAssignments(raw ? JSON.parse(raw) : []));
  }, [year, nivel]);

  // Borrador de alta rápida
  const [draft, setDraft] = useState<Assignment>({
    id: "",
    docenteId: 0,
    docenteNombre: "",
    materia: "",
    curso: "",
    paralelo: "",
    dia: "Lun",
    inicio: "08:00",
    fin: "09:30",
    aula: "",
  });
  useEffect(() => setDraft((d) => ({ ...d, curso: curso || "", paralelo: paralelo || "" })), [curso, paralelo]);

  const docentesElegibles = useMemo(
    () => docentes.filter(d => d.estado !== "inactivo"),
    [docentes]
  );

  const list = useMemo(() => {
    return rows.filter((r) =>
      r.curso === curso &&
      r.paralelo === paralelo &&
      (`${r.docenteNombre} ${r.materia} ${r.aula || ""}`.toLowerCase().includes(q.toLowerCase()))
    );
  }, [rows, curso, paralelo, q]);

  const add = () => {
    if (!curso || !paralelo) { alert("Primero crea/selecciona Secciones en Admin → Secciones."); return; }
    if (!draft.docenteId) return alert("Selecciona un Docente");
    if (!draft.materia) return alert("Completa Materia");

    const doc = docentes.find(d => d.id === draft.docenteId);
    if (!doc) return alert("Docente no encontrado");
    if (!doc.nro_rda || doc.estado_rda !== "VIGENTE") {
      alert(`No se puede asignar. El docente ${doc.nombre} ${doc.apellido} no tiene RDA vigente.`);
      return;
    }

    const id = `${Date.now()}`;
    const row: Assignment = {
      ...draft,
      id,
      docenteNombre: `${doc.nombre} ${doc.apellido}`,
    };

    // Validación centralizada
    const { ok, errors, conflicts } = validateAssignment(row, rows, docentes);
    if (errors.length) return alert(`No se puede asignar: ${errors.join("; ")}`);
    if (conflicts.length) {
      const msg = `Conflicto de horario con ${conflicts.length} asignación(es) existentes. Ver detalles en consola. Forzar?`;
      if (!confirm(msg)) return;
    }
    const next = [row, ...rows];
    setRows(next);
    localStorage.setItem(storageKey(year, nivel), JSON.stringify(next));
    pushAudit("asignacion:create", { year, nivel, row });
    setDraft((d) => ({ ...d, docenteId: 0, docenteNombre: "", materia: "", aula: "" }));
  };

  const remove = (id: string) => {
    if (!confirm("¿Eliminar asignación?")) return;
    const next = rows.filter((r) => r.id !== id);
    setRows(next);
    localStorage.setItem(storageKey(year, nivel), JSON.stringify(next));
    pushAudit("asignacion:delete", { year, nivel, id });
  };

  const saveAll = () => {
    if (!curso || !paralelo) { alert("No hay Secciones activas. Crea una en Admin → Secciones."); return; }
    // Validar todas las asignaciones antes de guardar
    for (const a of rows) {
      const d = docentes.find(x => x.id === a.docenteId);
      if (!d || !d.nro_rda || d.estado_rda !== "VIGENTE") {
        alert(`No se puede guardar: asignación inválida para docente ${a.docenteNombre} (RDA no vigente).`);
        return;
      }
      const { errors, conflicts } = validateAssignment(a, rows.filter(r => r.id !== a.id), docentes);
      if (errors.length) { alert(`Asignación inválida (${a.docenteNombre}): ${errors.join("; ")}`); return; }
      if (conflicts.length) {
        // bloqueamos saveAll si hay solapes — requiere revisión manual
        alert(`Hay conflictos de horario detectados en las asignaciones. Revisa antes de guardar.`);
        return;
      }
    }
    localStorage.setItem(storageKey(year, nivel), JSON.stringify(rows));
    alert("Asignaciones guardadas");
  };

  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center gap-2">
        <Waypoints className="h-6 w-6 text-blue-600" />
        <h1 className="text-2xl font-bold">Asignaciones — {nivel.toUpperCase()} {year}</h1>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-4 flex flex-wrap gap-2 items-center">
          <Select value={curso || ""} onValueChange={setCurso}>
            <SelectTrigger className="w-[200px]"><SelectValue placeholder="Curso (año)" /></SelectTrigger>
            <SelectContent>
              {cursos.length === 0
                ? <div className="px-3 py-2 text-sm text-muted-foreground flex items-center gap-2"><AlertTriangle className="h-4 w-4" />No hay cursos. Crea secciones.</div>
                : cursos.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)
              }
            </SelectContent>
          </Select>

          <Select value={paralelo || ""} onValueChange={setParalelo} disabled={!curso || paralelos.length === 0}>
            <SelectTrigger className="w-[140px]"><SelectValue placeholder="Paralelo" /></SelectTrigger>
            <SelectContent>
              {paralelos.length === 0
                ? <div className="px-3 py-2 text-sm text-muted-foreground flex items-center gap-2"><AlertTriangle className="h-4 w-4" />No hay paralelos.</div>
                : paralelos.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)
              }
            </SelectContent>
          </Select>

          <div className="relative">
            <Search className="h-4 w-4 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-7 w-[260px]" placeholder="Buscar docente/materia/aula" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>

          <Button onClick={saveAll}><Save className="h-4 w-4 mr-2" /> Guardar</Button>
        </CardContent>
      </Card>

      {/* Alta rápida */}
      <Card>
        <CardHeader><CardTitle>Nueva Asignación</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-7 gap-2">
          {/* Docente */}
          <Select
            value={draft.docenteId ? String(draft.docenteId) : ""}
            onValueChange={(v) => setDraft({ ...draft, docenteId: Number(v) })}
          >
            <SelectTrigger><SelectValue placeholder="Docente" /></SelectTrigger>
            <SelectContent>
              {docentesElegibles.map(d => (
                <SelectItem key={d.id} value={String(d.id)}>
                  {d.nombre} {d.apellido} — {d.nro_rda || "sin RDA"} {d.estado_rda === "VIGENTE" ? "✅" : "⚠️"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Materia / Día / Horario / Aula */}
          <Input placeholder="Materia" value={draft.materia} onChange={(e) => setDraft({ ...draft, materia: e.target.value })} />
          <Select value={draft.dia} onValueChange={(v) => setDraft({ ...draft, dia: v as Assignment["dia"] })}>
            <SelectTrigger><SelectValue placeholder="Día" /></SelectTrigger>
            <SelectContent>{["Lun","Mar","Mié","Jue","Vie"].map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
          </Select>
          <Input type="time" value={draft.inicio} onChange={(e) => setDraft({ ...draft, inicio: e.target.value })} />
          <Input type="time" value={draft.fin} onChange={(e) => setDraft({ ...draft, fin: e.target.value })} />
          <Input placeholder="Aula (opcional)" value={draft.aula} onChange={(e) => setDraft({ ...draft, aula: e.target.value })} />
          <Button onClick={add} disabled={!curso || !paralelo}><Plus className="h-4 w-4 mr-2" /> Agregar</Button>
        </CardContent>
      </Card>

      {/* Tabla */}
      <Card>
        <CardHeader><CardTitle>Listado</CardTitle></CardHeader>
        <CardContent className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Docente</TableHead>
                <TableHead>Materia</TableHead>
                <TableHead>Día</TableHead>
                <TableHead>Inicio</TableHead>
                <TableHead>Fin</TableHead>
                <TableHead>Aula</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>{r.docenteNombre}</TableCell>
                  <TableCell>{r.materia}</TableCell>
                  <TableCell>{r.dia}</TableCell>
                  <TableCell>{r.inicio}</TableCell>
                  <TableCell>{r.fin}</TableCell>
                  <TableCell>{r.aula || "—"}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="destructive" size="sm" onClick={() => remove(r.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {list.length === 0 && (
                <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground">Sin asignaciones…</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
