// src/pages/admin/Secciones.tsx
import { useEffect, useMemo, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit, Trash2, Search, School, Users, Copy } from "lucide-react";
import SectionFormDialog from "@/pages/admin/SectionFormDialog";
import StudentsModal from "@/pages/admin/StudentsModal";
import { pushAudit } from "@/lib/audit";

// Catalogos locales (solo para selects y fallback)
import { niveles } from "@/lib/sections";
import type { NivelKey } from "@/lib/sections";

// API de secciones (Laravel)
import {
  listSections,
  createSection,
  updateSection,
  deleteSection,
  duplicateSectionsYear,
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
      console.log("OK loaded", { count: res.data.length, total: res.total });
    } catch (e: unknown) {
      console.error("Error refresh", e);
      alert((e as Error)?.message || "Error cargando secciones");
    } finally {
      setLoading(false);
      console.groupEnd();
    }
  };

  useEffect(() => {
    refresh(1);
    try { localStorage.setItem("adm:year", year); } catch (err: unknown) { console.warn("Could not persist adm:year", err); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year, nivel]);

  // Filtrado por busqueda simple en front
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

  // ---- Modal de estudiantes
  const [studentsModalOpen, setStudentsModalOpen] = useState(false);
  const [selectedSectionForStudents, setSelectedSectionForStudents] = useState<Section | null>(null);

  const openStudentsModal = (s: Section) => {
    setSelectedSectionForStudents(s);
    setStudentsModalOpen(true);
  };

  // ---- Duplicar secciones
  const [duplicating, setDuplicating] = useState(false);

  const handleDuplicateFromLastYear = async () => {
    const sourceYear = String(Number(year) - 1);
    const confirmMsg = `Duplicar secciones de ${sourceYear} a ${year}?\n\nSe copiaran todas las secciones del nivel "${nivel}" (sin estudiantes ni tutor).`;
    if (!confirm(confirmMsg)) return;

    setDuplicating(true);
    try {
      const result = await duplicateSectionsYear(sourceYear, year, nivel);
      alert(result.message);
      pushAudit("section:duplicate", { sourceYear, targetYear: year, nivel, ...result });
      await refresh(1);
    } catch (e: unknown) {
      console.error("Error duplicando:", e);
      alert((e as Error)?.message || "Error al duplicar secciones");
    } finally {
      setDuplicating(false);
    }
  };

  const openCreate = () => { setEditing(null); setOpen(true); };
  const openEdit = (s: Section) => { setEditing(s); setOpen(true); };

  const onSubmit = async (vals: Partial<Section>) => {
    const payload = {
      year: String(vals.year),
      nivel: vals.nivel as NivelKey,
      curso: vals.curso as string,
      paralelo: vals.paralelo as string,
      turno: vals.turno as Section["turno"],
      aula: vals.aula ? String(vals.aula) : null,
      capacidad: vals.capacidad ? Number(vals.capacidad) : null,
      tutor_id: vals.tutor_id ?? null,
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
      console.log("OK guardado");
    } catch (e: unknown) {
      console.error("Error submit", e);
      alert((e as Error)?.message || "Error guardando la seccion");
    }
  };

  const remove = async (id: number | string) => {
    if (!confirm("Eliminar seccion (paralelo)?")) return;
    console.groupCollapsed("[Secciones] delete", { id });
    try {
      await deleteSection(id);
      pushAudit("section:delete", { id });
      await refresh(page);
      console.log("OK eliminado");
    } catch (e: unknown) {
      console.error("Error delete", e);
      alert((e as Error)?.message || "Error eliminando");
    } finally {
      console.groupEnd();
    }
  };

  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center gap-2">
        <School className="h-6 w-6 text-blue-600" />
        <h1 className="text-2xl font-bold">Secciones / Paralelos - {year}</h1>
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
            <Plus className="h-4 w-4 mr-2" /> Nueva Seccion
          </Button>

          <Button variant="outline" onClick={handleDuplicateFromLastYear} disabled={loading || duplicating}>
            <Copy className="h-4 w-4 mr-2" /> Copiar de {Number(year) - 1}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Listado {loading ? "(cargando...)" : ""}</CardTitle></CardHeader>
        <CardContent className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nivel</TableHead>
                <TableHead>Curso (anio)</TableHead>
                <TableHead>Paralelo</TableHead>
                <TableHead>Turno</TableHead>
                <TableHead>Aula</TableHead>
                <TableHead>Estudiantes</TableHead>
                <TableHead>Tutor</TableHead>
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
                  <TableCell>{s.aula || "-"}</TableCell>
                  <TableCell>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-auto p-1 font-normal"
                      onClick={() => openStudentsModal(s)}
                    >
                      <Users className="h-3 w-3 mr-1" />
                      <span className={
                        s.capacidad && (s.estudiantes_count ?? 0) >= s.capacidad 
                          ? "text-red-600 font-semibold" 
                          : ""
                      }>
                        {s.estudiantes_count ?? 0}/{s.capacidad ?? "-"}
                      </span>
                    </Button>
                  </TableCell>
                  <TableCell>{s.tutor ? `${s.tutor.nombres} ${s.tutor.apellidos}` : "-"}</TableCell>
                  <TableCell>{s.estado}</TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button size="sm" variant="outline" onClick={() => openEdit(s)}><Edit className="h-4 w-4" /></Button>
                    <Button size="sm" variant="destructive" onClick={() => remove(s.id)}><Trash2 className="h-4 w-4" /></Button>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && !loading && (
                <TableRow><TableCell colSpan={9} className="text-center text-muted-foreground py-6">
                  No hay secciones en este nivel/anio. Usa "Nueva Seccion" o "Copiar de {Number(year) - 1}".
                </TableCell></TableRow>
              )}
            </TableBody>
          </Table>

          {/* Paginacion simple */}
          {lastPage > 1 && (
            <div className="flex items-center justify-between mt-3">
              <div className="text-sm text-muted-foreground">
                Pagina {page} de {lastPage} - {total} registros
              </div>
              <div className="space-x-2">
                <Button variant="outline" size="sm" disabled={page <= 1 || loading} onClick={() => refresh(page - 1)}>Anterior</Button>
                <Button variant="outline" size="sm" disabled={page >= lastPage || loading} onClick={() => refresh(page + 1)}>Siguiente</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <SectionFormDialog
        open={open}
        onOpenChange={setOpen}
        editing={editing}
        defaultYear={year}
        defaultNivel={nivel}
        onSubmit={onSubmit}
      />

      <StudentsModal
        open={studentsModalOpen}
        onOpenChange={setStudentsModalOpen}
        section={selectedSectionForStudents}
      />
    </div>
  );
}
