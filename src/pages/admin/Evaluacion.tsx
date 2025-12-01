import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ClipboardList, Save, RefreshCw, AlertTriangle } from "lucide-react";

type NivelKey = "inicial" | "primaria" | "secundaria";
type Row = { id: string; nombre: string; peso: number };

const DEFAULT_CATS: Row[] = [
  { id: "tareas", nombre: "Tareas", peso: 20 },
  { id: "pruebas", nombre: "Pruebas", peso: 25 },
  { id: "proyectos", nombre: "Proyectos", peso: 15 },
  { id: "examen", nombre: "Examen Trimestral", peso: 40 },
];

const keyEval = (year: string, nivel: NivelKey, term: string) => `adm:eval:${year}:${nivel}:${term}`;

const pushAudit = (action: string, meta: Record<string, any> = {}) => {
  const k = "adm:audit";
  const log = JSON.parse(localStorage.getItem(k) || "[]");
  log.unshift({ id: Date.now(), date: new Date().toISOString(), action, meta });
  localStorage.setItem(k, JSON.stringify(log));
};

export default function EvaluacionAdmin() {
  const year = localStorage.getItem("adm:year") || String(new Date().getFullYear());
  const nivel = (localStorage.getItem("adm:nivel") as NivelKey) || "primaria";
  const [term, setTerm] = useState(localStorage.getItem("adm:term") || "T1");

  const [rows, setRows] = useState<Row[]>(() => {
    const raw = localStorage.getItem(keyEval(year, nivel, term));
    return raw ? JSON.parse(raw) : DEFAULT_CATS;
  });

  useEffect(() => {
    const raw = localStorage.getItem(keyEval(year, nivel, term));
    setRows(raw ? JSON.parse(raw) : DEFAULT_CATS);
  }, [year, nivel, term]);

  const total = useMemo(() => rows.reduce((s, r) => s + (Number(r.peso) || 0), 0), [rows]);
  const is100 = total === 100;

  const updatePeso = (id: string, v: string) => {
    const n = Math.max(0, Math.min(100, Number(v)));
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, peso: n } : r)));
  };

  const guardar = () => {
    if (!is100) return alert("El total debe ser 100%");
    localStorage.setItem(keyEval(year, nivel, term), JSON.stringify(rows));
    pushAudit("eval:save", { year, nivel, term, rows });
    alert("Estructura guardada");
  };

  const reset = () => setRows(DEFAULT_CATS);

  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center gap-2">
        <ClipboardList className="h-6 w-6 text-blue-600" />
        <h1 className="text-2xl font-bold">Estructura de Evaluación — {nivel.toUpperCase()} {year}</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pesos por categoría</CardTitle>
          <CardDescription>Selecciona el término y ajusta los pesos. El total debe ser 100%.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2 items-center">
            <span className="text-sm text-muted-foreground">Trimestre:</span>
            <Select value={term} onValueChange={setTerm}>
              <SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger>
              <SelectContent>{["T1","T2","T3"].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
            </Select>
            <Button variant="outline" onClick={reset}><RefreshCw className="h-4 w-4 mr-2" /> Restablecer</Button>
            <Button onClick={guardar}><Save className="h-4 w-4 mr-2" /> Guardar</Button>
          </div>

          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Categoría</TableHead>
                  <TableHead className="text-right w-[140px]">Peso (%)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>{r.nombre}</TableCell>
                    <TableCell className="text-right">
                      <Input type="number" min={0} max={100} value={r.peso} onChange={(e) => updatePeso(r.id, e.target.value)} className="w-[120px] ml-auto" />
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell className="font-semibold">Total</TableCell>
                  <TableCell className={`text-right font-semibold ${is100 ? "text-green-600" : "text-red-600"}`}>{total}%</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          {!is100 && (
            <div className="flex items-center gap-2 text-red-600 text-sm">
              <AlertTriangle className="h-4 w-4" /> Ajusta los pesos hasta sumar 100%.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
