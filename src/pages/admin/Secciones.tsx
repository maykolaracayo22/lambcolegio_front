// src/pages/admin/Secciones.tsx
import { useEffect, useMemo, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit, Trash2, Search, School } from "lucide-react";
import CrudFormDialog, { Field } from "@/pages/admin/CrudFormDialog";
import { pushAudit } from "@/lib/audit";

// Catálogos locales (solo para selects y fallback)
import { niveles, turnos, cursosPorNivel, paralelosSugeridos } from "@/lib/sections";
import type { NivelKey } from "@/lib/sections";

// API de secciones (Laravel)
import {
  listSections,
  createSection,
  updateSection,
  deleteSection,
  type Section,
} from "@/services/sectionsApi";

export default function SeccionesAdmin() {
  const [year, setYear] = useState<string>(localStorage.getItem("adm:year") || String(new Date().getFullYear()));
  const [q, setQ] = useState("");
  const [nivel, setNivel] = useState<NivelKey>(
    ((localStorage.getItem("adm:nivel") as NivelKey) || "primaria")
  );
  const [rows, setRows] = useState<Section[]>([]);
  const [page, setPage] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);
  const [lastPage, setLastPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);

  const refresh = async (p = 1) => {
    console.groupCollapsed("[Secciones] refresh", { year, nivel, page: p });
    setLoading(true);
    try {
      const res = await listSections({ year, nivel, page: p });
      setRows(res.data);
      setTotal(res.total);
      setLastPage(res.last_page);
      setPage(res.current_page);
      console.log("✔ loaded", { count: res.data.length, total: res.total });
    } catch (e: unknown) {
      console.error("✖ error refresh", e);
      alert((e as Error)?.message || "Error cargando secciones");
    } finally {
      setLoading(false);
      console.groupEnd();
    }
  };

  useEffect(() => {
    refresh(1);
    // persist selected year to localStorage so other admin pages reuse it
    try { localStorage.setItem("adm:year", year); } catch (err: unknown) { console.warn("Could not persist adm:year", err); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year, nivel]);

  // Filtrado por búsqueda simple en front
  const filtered = useMemo(() => {
    return rows
      .filter(s =>
        (`${s.curso} ${s.paralelo} ${s.aula || ""}`.toLowerCase().includes(q.toLowerCase()))
      )
      .sort((a, b) => a.curso.localeCompare(b.curso,"es") || a.paralelo.localeCompare(b.paralelo,"es"));
  }, [rows, q]);

  // ---- CRUD dialog
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Section | null>(null);

  const cursoOptions = useMemo(() => cursosPorNivel[nivel], [nivel]);

  const fields: Field[] = [
    { type: "text", name: "year", label: "Año de gestión", required: true, disabled: true },
    { type: "select", name: "nivel", label: "Nivel", options: niveles.map(n => ({ value: n, label: n[0].toUpperCase()+n.slice(1) })), required: true },
    { type: "select", name: "curso", label: "Curso (año de escolaridad)", options: cursoOptions.map(c => ({ value: c, label: c })), required: true },
    { type: "select", name: "paralelo", label: "Paralelo", options: paralelosSugeridos.map(p => ({ value: p, label: p })), required: true },
    { type: "select", name: "turno", label: "Turno", options: turnos.map(t => ({ value: t, label: t })), required: true },
    { type: "text", name: "aula", label: "Aula (opcional)" },
    { type: "number", name: "capacidad", label: "Capacidad (opcional)" },
    { type: "select", name: "estado", label: "Estado", options: [{ value: "ACTIVA", label: "ACTIVA" }, { value: "CERRADA", label: "CERRADA" }], required: true },
  ];

  const openCreate = () => { setEditing(null); setOpen(true); };
  const openEdit = (s: Section) => { setEditing(s); setOpen(true); };

  const onSubmit = async (vals: Record<string, unknown>) => {
    const payload = {
      year: String(vals.year),
      nivel: vals.nivel as NivelKey,
      curso: vals.curso as string,
      paralelo: vals.paralelo as string,
      turno: vals.turno as Section["turno"],
      aula: vals.aula ? String(vals.aula) : null,
      capacidad: vals.capacidad ? Number(vals.capacidad) : null,
      tutor_id: vals.tutor_id ? Number(vals.tutor_id) : null,
      estado: vals.estado as "ACTIVA" | "CERRADA",
    };

    console.groupCollapsed("[Secciones] submit", { editing: !!editing, payload });
    try {
      if (editing) {
        await updateSection(editing.id, payload);
        pushAudit("section:update", { id: editing.id, ...payload });
      } else {
        await createSection(payload);
        pushAudit("section:create", payload);
      }
      await refresh(page);
      setOpen(false);
      console.log("✔ guardado");
    } catch (e: unknown) {
      console.error("✖ error submit", e);
      alert((e as Error)?.message || "Error guardando la sección");
    } finally {
      console.groupEnd();
    }
  };

  const remove = async (id: number | string) => {
    if (!confirm("¿Eliminar sección (paralelo)?")) return;
    console.groupCollapsed("[Secciones] delete", { id });
    try {
      await deleteSection(id);
      pushAudit("section:delete", { id });
      await refresh(page);
      console.log("✔ eliminado");
    } catch (e: unknown) {
      console.error("✖ error delete", e);
      alert((e as Error)?.message || "Error eliminando");
    } finally {
      console.groupEnd();
    }
  };

  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center gap-2">
        <School className="h-6 w-6 text-blue-600" />
        <h1 className="text-2xl font-bold">Secciones / Paralelos — {year}</h1>
      </div>

      <Card>
        <CardContent className="p-4 flex flex-wrap items-center gap-2">
          <div className="w-[120px]">
            <Input type="number" className="w-full" value={year} onChange={(e) => setYear(e.target.value)} />
          </div>

          <Select value={nivel} onValueChange={(v) => setNivel(v as NivelKey)}>
            <SelectTrigger className="w-[160px]"><SelectValue placeholder="Nivel" /></SelectTrigger>
            <SelectContent>{niveles.map(n => <SelectItem key={n} value={n}>{n[0].toUpperCase()+n.slice(1)}</SelectItem>)}</SelectContent>
          </Select>

          <div className="relative">
            <Search className="h-4 w-4 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-8 w-[280px]" placeholder="Buscar por curso / paralelo / aula" value={q} onChange={e => setQ(e.target.value)} />
          </div>

          <Button onClick={openCreate} disabled={loading}>
            <Plus className="h-4 w-4 mr-2" /> Nueva Sección
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Listado {loading ? "(cargando…)" : ""}</CardTitle></CardHeader>
        <CardContent className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nivel</TableHead>
                <TableHead>Curso (año)</TableHead>
                <TableHead>Paralelo</TableHead>
                <TableHead>Turno</TableHead>
                <TableHead>Aula</TableHead>
                <TableHead>Cap.</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(s => (
                <TableRow key={s.id}>
                  <TableCell className="capitalize">{s.nivel}</TableCell>
                  <TableCell>{s.curso}</TableCell>
                  <TableCell>{s.paralelo}</TableCell>
                  <TableCell>{s.turno}</TableCell>
                  <TableCell>{s.aula || "—"}</TableCell>
                  <TableCell>{s.capacidad ?? "—"}</TableCell>
                  <TableCell>{s.estado}</TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button size="sm" variant="outline" onClick={() => openEdit(s)}><Edit className="h-4 w-4" /></Button>
                    <Button size="sm" variant="destructive" onClick={() => remove(s.id)}><Trash2 className="h-4 w-4" /></Button>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && !loading && (
                <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-6">
                  No hay secciones en este nivel/año. Crea una con “Nueva Sección”.
                </TableCell></TableRow>
              )}
            </TableBody>
          </Table>

          {/* Paginación simple */}
          {lastPage > 1 && (
            <div className="flex items-center justify-between mt-3">
              <div className="text-sm text-muted-foreground">
                Página {page} de {lastPage} • {total} registros
              </div>
              <div className="space-x-2">
                <Button variant="outline" size="sm" disabled={page <= 1 || loading} onClick={() => refresh(page - 1)}>Anterior</Button>
                <Button variant="outline" size="sm" disabled={page >= lastPage || loading} onClick={() => refresh(page + 1)}>Siguiente</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <CrudFormDialog
        open={open}
        onOpenChange={setOpen}
        title={editing ? "Editar Sección (Paralelo)" : "Nueva Sección (Paralelo)"}
        description="Define Año, Nivel, Curso (año de escolaridad) y Paralelo. El Turno es Mañana/Tarde/Noche."
  fields={fields}
        initialValues={editing ?? {
          year,
          nivel,
          curso: cursosPorNivel[nivel][0],
          paralelo: "A",
          turno: "Mañana",
          aula: "",
          capacidad: undefined,
          tutor_id: "",
          estado: "ACTIVA",
        }}
        onSubmit={onSubmit}
        submitLabel={editing ? "Actualizar" : "Crear"}
      />
    </div>
  );
}
