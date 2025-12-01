// src/pages/admin/Actas.tsx
// Supervisión de Actas: tabla con filtros y acciones Lock/Publish/Validate

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

import type { Acta, ActasFilter, Term } from "@/lib/types-admin";
import { getActas, validateActa, lockActa, unlockActa, publishActa, unpublishActa } from "@/services/mockAdmin";

const USER_ADMIN = { id: "admin", nombre: "Administrador" };

export default function AdminActas() {
  const years = useMemo(() => [new Date().getFullYear(), new Date().getFullYear() - 1], []);
  const [filter, setFilter] = useState<ActasFilter>({ year: years[0], term: "T1" });

  const data = useMemo(() => getActas(filter), [filter]);

  const onValidate = (ref: string) => {
    const a = validateActa(USER_ADMIN, ref);
    if (a.metrics.errores.length === 0 && a.metrics.pesosOK) toast.success("Acta válida.");
    else toast.error("Validación con observaciones.");
    setFilter({ ...filter });
  };
  const onLock = (ref: string) => { try { lockActa(USER_ADMIN, ref); toast.success("Acta bloqueada."); } catch (e:any) { toast.error(e.message); } setFilter({ ...filter }); };
  const onUnlock = (ref: string) => { try { unlockActa(USER_ADMIN, ref); toast.message("Acta desbloqueada."); } catch (e:any) { toast.error(e.message); } setFilter({ ...filter }); };
  const onPublish = (ref: string) => { try { publishActa(USER_ADMIN, ref); toast.success("Acta publicada."); } catch (e:any) { toast.error(e.message); } setFilter({ ...filter }); };
  const onUnpublish = (ref: string) => { try { unpublishActa(USER_ADMIN, ref); toast.message("Publicación revertida."); } catch (e:any) { toast.error(e.message); } setFilter({ ...filter }); };

  return (
    <div className="space-y-6 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="text-2xl font-bold">Supervisión de Actas</h1>

        <div className="ml-auto flex flex-wrap gap-2">
          <Select value={String(filter.year)} onValueChange={(v) => setFilter({ ...filter, year: Number(v) })}>
            <SelectTrigger className="w-[120px]"><SelectValue placeholder="Año" /></SelectTrigger>
            <SelectContent>
              {years.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filter.term as Term} onValueChange={(v) => setFilter({ ...filter, term: v as Term })}>
            <SelectTrigger className="w-[100px]"><SelectValue placeholder="Trimestre" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="T1">T1</SelectItem>
              <SelectItem value="T2">T2</SelectItem>
              <SelectItem value="T3">T3</SelectItem>
            </SelectContent>
          </Select>
          <Select value={(filter.nivel || "todos") as any} onValueChange={(v) => setFilter({ ...filter, nivel: v === "todos" ? undefined : (v as any) })}>
            <SelectTrigger className="w-[140px]"><SelectValue placeholder="Nivel" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="inicial">Inicial</SelectItem>
              <SelectItem value="primaria">Primaria</SelectItem>
              <SelectItem value="secundaria">Secundaria</SelectItem>
            </SelectContent>
          </Select>
          <Input placeholder="Grado" value={filter.grado || ""} onChange={(e) => setFilter({ ...filter, grado: e.target.value || undefined })} className="w-[110px]" />
          <Input placeholder="Sección" value={filter.seccion || ""} onChange={(e) => setFilter({ ...filter, seccion: e.target.value || undefined })} className="w-[110px]" />
          <Input placeholder="Materia ID" value={filter.materiaId || ""} onChange={(e) => setFilter({ ...filter, materiaId: e.target.value || undefined })} className="w-[140px]" />
          <Input placeholder="Docente ID" value={filter.docenteId || ""} onChange={(e) => setFilter({ ...filter, docenteId: e.target.value || undefined })} className="w-[140px]" />
          <Select value={(filter.status || "todos") as any} onValueChange={(v) => setFilter({ ...filter, status: v === "todos" ? undefined : (v as any) })}>
            <SelectTrigger className="w-[140px]"><SelectValue placeholder="Estado" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="DRAFT">Borrador</SelectItem>
              <SelectItem value="LOCKED">Bloqueada</SelectItem>
              <SelectItem value="PUBLISHED">Publicada</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Actas ({data.length})</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ref</TableHead>
                <TableHead>Nivel</TableHead>
                <TableHead>Grado/Sección</TableHead>
                <TableHead>Materia</TableHead>
                <TableHead>Docente</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Suma Pesos</TableHead>
                <TableHead>% Notas</TableHead>
                <TableHead>Errores</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((a: Acta) => (
                <TableRow key={a.ref}>
                  <TableCell className="font-mono text-xs">{a.ref}</TableCell>
                  <TableCell className="capitalize">{a.nivel}</TableCell>
                  <TableCell>{a.grado} {a.seccion}</TableCell>
                  <TableCell>{a.materiaNombre}</TableCell>
                  <TableCell>{a.docenteNombre}</TableCell>
                  <TableCell>
                    {a.status === "DRAFT" && <Badge variant="secondary">Borrador</Badge>}
                    {a.status === "LOCKED" && <Badge>Bloqueada</Badge>}
                    {a.status === "PUBLISHED" && <Badge variant="outline">Publicada</Badge>}
                  </TableCell>
                  <TableCell>{a.metrics.sumaPesos} {a.metrics.pesosOK ? "✅" : "❌"}</TableCell>
                  <TableCell>{a.metrics.pctNotas}%</TableCell>
                  <TableCell className="max-w-[260px] truncate" title={a.metrics.errores.join(" | ")}>
                    {a.metrics.errores.length ? a.metrics.errores.join(" | ") : "—"}
                  </TableCell>
                  <TableCell className="space-x-1 whitespace-nowrap">
                    <Button size="sm" variant="outline" onClick={() => onValidate(a.ref)}>Validar</Button>
                    {a.status === "DRAFT" && <Button size="sm" onClick={() => onLock(a.ref)}>Lock</Button>}
                    {a.status === "LOCKED" && <>
                      <Button size="sm" variant="outline" onClick={() => onUnlock(a.ref)}>Unlock</Button>
                      <Button size="sm" onClick={() => onPublish(a.ref)}>Publish</Button>
                    </>}
                    {a.status === "PUBLISHED" && <Button size="sm" variant="destructive" onClick={() => onUnpublish(a.ref)}>Unpublish</Button>}
                  </TableCell>
                </TableRow>
              ))}
              {data.length === 0 && (
                <TableRow><TableCell colSpan={10} className="text-center text-sm text-muted-foreground">No hay actas con estos filtros.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
