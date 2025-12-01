// src/pages/admin/Reportes.tsx
// Exportación de Centralizador y Boletines en CSV por Año/Trimestre/Sección

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

import type { Term } from "@/lib/types-admin";
import { exportBoletinesCSV, exportCentralizadorCSV, getActas } from "@/services/mockAdmin";
import { DownloadButton } from "@/components/admin/DownloadButton";


export default function AdminReportes() {
  const years = useMemo(() => [new Date().getFullYear(), new Date().getFullYear() - 1], []);
  const [year, setYear] = useState<number>(years[0]);
  const [term, setTerm] = useState<Term>("T1");
  const [seccion, setSeccion] = useState<string>("A");

  // Ayuda visual: cuántas actas publicadas hay en ese filtro
  const publicadas = useMemo(
    () => getActas({ year, term, seccion, status: "PUBLISHED" }).length,
    [year, term, seccion]
  );

  const onCentralizador = async () => {
    const { filename, mime, content } = exportCentralizadorCSV({ year, term, seccion });
    if (content.split("\n").length <= 1) {
      toast.warning("No hay actas publicadas para exportar.");
    }
    return { filename, mime, content };
  };

  const onBoletines = async () => {
    const { filename, mime, content } = exportBoletinesCSV({ year, term, seccion });
    if (content.split("\n").length <= 1) {
      toast.warning("No hay datos publicados para emitir boletines.");
    }
    return { filename, mime, content };
  };

  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-bold">Reportes — Exportaciones</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Parámetros</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
            <SelectTrigger className="w-[140px]"><SelectValue placeholder="Año" /></SelectTrigger>
            <SelectContent>
              {years.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
            </SelectContent>
          </Select>

          <Select value={term} onValueChange={(v) => setTerm(v as Term)}>
            <SelectTrigger className="w-[120px]"><SelectValue placeholder="Trimestre" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="T1">T1</SelectItem>
              <SelectItem value="T2">T2</SelectItem>
              <SelectItem value="T3">T3</SelectItem>
            </SelectContent>
          </Select>

          <Input
            className="w-[140px]"
            placeholder="Sección (p.ej. A)"
            value={seccion}
            onChange={(e) => setSeccion(e.target.value)}
          />
        </CardContent>
      </Card>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>Centralizador & Boletines</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-3">
          <div className="text-sm text-muted-foreground">
            Actas <b>PUBLICADAS</b> encontradas: {publicadas}
          </div>

          <DownloadButton label="Exportar Centralizador CSV" action={onCentralizador} />
          <DownloadButton label="Exportar Boletines CSV" action={onBoletines} />
        </CardContent>
      </Card>
    </div>
  );
}
