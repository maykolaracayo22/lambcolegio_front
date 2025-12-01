// src/pages/admin/Overview.tsx
// Resumen del Trimestre: KPIs, pendientes por docente y acciones masivas

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

import type { Acta, AdminKPI, Term } from "@/lib/types-admin";
import { getActas, validateBulk, lockBulk, publishBulk, createMissingActas } from "@/services/mockAdmin";

const USER_ADMIN = { id: "admin", nombre: "Administrador" };

export default function AdminOverview() {
  const years = useMemo(() => [new Date().getFullYear(), new Date().getFullYear() - 1], []);
  const [year, setYear] = useState<number>(years[0]);
  const [term, setTerm] = useState<Term>("T1");
  const [nivel, setNivel] = useState<"inicial" | "primaria" | "secundaria" | "todos">("todos");

  const actas = useMemo(() => {
    const f = nivel === "todos" ? {} : { nivel };
    return getActas({ year, term, ...(f as any) });
  }, [year, term, nivel]);

  const kpi: AdminKPI = useMemo(() => {
    const total = actas.length;
    const draft = actas.filter(a => a.status === "DRAFT").length;
    const locked = actas.filter(a => a.status === "LOCKED").length;
    const published = actas.filter(a => a.status === "PUBLISHED").length;
    const pesosOk = actas.filter(a => a.metrics.pesosOK).length;
    const notasFull = actas.filter(a => a.metrics.pctNotas >= 100).length;
    return {
      totalActas: total,
      draft,
      locked,
      published,
      pesosOkPct: total ? Math.round((pesosOk / total) * 100) : 0,
      notasCompletasPct: total ? Math.round((notasFull / total) * 100) : 0,
    };
  }, [actas]);

  // construir “pendientes por docente”
  const pendientes = useMemo(() => {
    // definimos pendiente: (no pesos OK) o (errores > 0) o (pctNotas < 100) y estado !== PUBLISHED
    return actas
      .filter(a => a.status !== "PUBLISHED" && (!a.metrics.pesosOK || a.metrics.errores.length > 0 || a.metrics.pctNotas < 100))
      .sort((a, b) => a.docenteNombre.localeCompare(b.docenteNombre));
  }, [actas]);

  // acciones masivas
  const refsSeleccion = useMemo(() => actas.map(a => a.ref), [actas]);

  const doCreateActas = () => {
    const created = createMissingActas(USER_ADMIN, year, term, nivel === "todos" ? undefined : { nivel: nivel as any });
    toast.success(`Actas creadas: ${created}`);
  };
  const doValidate = () => {
    const res = validateBulk(USER_ADMIN, refsSeleccion);
    toast.message("Validación masiva", { description: `OK: ${res.ok} / Con errores: ${res.conErrores}` });
  };
  const doLock = () => {
    const res = lockBulk(USER_ADMIN, refsSeleccion);
    toast.message("Bloqueo masivo", { description: `Bloqueadas: ${res.locked} / Fallidas: ${res.fallidas}` });
  };
  const doPublish = () => {
    const res = publishBulk(USER_ADMIN, refsSeleccion);
    toast.message("Publicación masiva", { description: `Publicadas: ${res.published} / Fallidas: ${res.fallidas}` });
  };

  return (
    <div className="space-y-6 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="text-2xl font-bold">Centro de Control — Resumen</h1>
        <div className="ml-auto flex gap-2">
          <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
            <SelectTrigger className="w-[120px]"><SelectValue placeholder="Año" /></SelectTrigger>
            <SelectContent>
              {years.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={term} onValueChange={(v) => setTerm(v as Term)}>
            <SelectTrigger className="w-[100px]"><SelectValue placeholder="Trimestre" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="T1">T1</SelectItem>
              <SelectItem value="T2">T2</SelectItem>
              <SelectItem value="T3">T3</SelectItem>
            </SelectContent>
          </Select>
          <Select value={nivel} onValueChange={(v) => setNivel(v as any)}>
            <SelectTrigger className="w-[140px]"><SelectValue placeholder="Nivel" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="inicial">Inicial</SelectItem>
              <SelectItem value="primaria">Primaria</SelectItem>
              <SelectItem value="secundaria">Secundaria</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card><CardHeader><CardTitle>Actas</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold">{kpi.totalActas}</div></CardContent></Card>
        <Card><CardHeader><CardTitle>Borrador</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold">{kpi.draft}</div></CardContent></Card>
        <Card><CardHeader><CardTitle>Bloqueadas</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold">{kpi.locked}</div></CardContent></Card>
        <Card><CardHeader><CardTitle>Publicadas</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold">{kpi.published}</div></CardContent></Card>
        <Card><CardHeader><CardTitle>Calidad</CardTitle></CardHeader><CardContent>
          <div className="text-sm">Pesos OK: <b>{kpi.pesosOkPct}%</b></div>
          <div className="text-sm">Notas completas: <b>{kpi.notasCompletasPct}%</b></div>
        </CardContent></Card>
      </div>

      {/* Acciones masivas */}
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={doCreateActas}>Crear actas faltantes</Button>
        <Button onClick={doValidate}>Validar todas</Button>
        <Button onClick={doLock}>Bloquear válidas</Button>
        <Button onClick={doPublish}>Publicar válidas</Button>
      </div>

      <Separator />

      {/* Pendientes por docente */}
      <Card>
        <CardHeader>
          <CardTitle>Pendientes por docente</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Docente</TableHead>
                <TableHead>Sección</TableHead>
                <TableHead>Materia</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Suma Pesos</TableHead>
                <TableHead>% Notas</TableHead>
                <TableHead>Errores</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendientes.map((a: Acta) => (
                <TableRow key={a.ref}>
                  <TableCell>{a.docenteNombre}</TableCell>
                  <TableCell>{a.grado} {a.seccion}</TableCell>
                  <TableCell>{a.materiaNombre}</TableCell>
                  <TableCell>
                    {a.status === "DRAFT" && <Badge variant="secondary">Borrador</Badge>}
                    {a.status === "LOCKED" && <Badge>Bloqueada</Badge>}
                    {a.status === "PUBLISHED" && <Badge variant="outline">Publicada</Badge>}
                  </TableCell>
                  <TableCell>{a.metrics.sumaPesos} {a.metrics.pesosOK ? "✅" : "❌"}</TableCell>
                  <TableCell>{a.metrics.pctNotas}%</TableCell>
                  <TableCell>{a.metrics.errores.length > 0 ? a.metrics.errores.join(" | ") : "—"}</TableCell>
                </TableRow>
              ))}
              {pendientes.length === 0 && (
                <TableRow><TableCell colSpan={7} className="text-center text-sm text-muted-foreground">Sin pendientes en estos filtros.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
