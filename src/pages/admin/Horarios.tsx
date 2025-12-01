import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Table2, Clock } from "lucide-react";

type NivelKey = "inicial" | "primaria" | "secundaria";
type Assignment = {
  id: string; docente: string; materia: string; grado: string; seccion: string;
  dia: "Lun" | "Mar" | "Mié" | "Jue" | "Vie"; inicio: string; fin: string; aula?: string;
};

const GRADOS: Record<NivelKey, string[]> = {
  inicial: ["3 años", "4 años", "5 años"],
  primaria: ["1°","2°","3°","4°","5°","6°"],
  secundaria: ["1°","2°","3°","4°","5°"],
};
const SECCIONES: Record<NivelKey, string[]> = {
  inicial: ["A","B"], primaria: ["A","B","C"], secundaria: ["A","B"],
};
const storageKey = (year: string, nivel: NivelKey) => `adm:assignments:${year}:${nivel}`;

export default function HorariosAdmin() {
  const year = localStorage.getItem("adm:year") || String(new Date().getFullYear());
  const nivel = (localStorage.getItem("adm:nivel") as NivelKey) || "primaria";

  const [grado, setGrado] = useState(GRADOS[nivel][0]);
  const [seccion, setSeccion] = useState(SECCIONES[nivel][0]);
  const [rows, setRows] = useState<Assignment[]>([]);

  useEffect(() => {
    const raw = localStorage.getItem(storageKey(year, nivel));
    setRows(raw ? JSON.parse(raw) : []);
  }, [year, nivel]);

  const dias: Assignment["dia"][] = ["Lun","Mar","Mié","Jue","Vie"];
  const horas = useMemo(() => {
    // generar slots cada 60 min de 07:00 a 14:00
    const out: string[] = [];
    for (let h = 7; h <= 14; h++) out.push(`${String(h).padStart(2,"0")}:00`);
    return out;
  }, []);

  const bySection = rows.filter(r => r.grado === grado && r.seccion === seccion);

  // Para vista de celda mostramos texto concatenado si se solapan
  const cellText = (dia: Assignment["dia"], hora: string) => {
    const inSlot = bySection.filter(r => r.dia === dia && r.inicio <= hora && r.fin > hora);
    if (inSlot.length === 0) return "";
    return inSlot.map(r => `${r.materia} (${r.docente.split(" ")[0]})`).join(" • ");
  };

  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center gap-2">
        <Table2 className="h-6 w-6 text-blue-600" />
        <h1 className="text-2xl font-bold">Horarios — {nivel.toUpperCase()} {year}</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Vista por Sección</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Select value={grado} onValueChange={setGrado}>
              <SelectTrigger className="w-[140px]"><SelectValue placeholder="Grado" /></SelectTrigger>
              <SelectContent>{GRADOS[nivel].map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={seccion} onValueChange={setSeccion}>
              <SelectTrigger className="w-[120px]"><SelectValue placeholder="Sección" /></SelectTrigger>
              <SelectContent>{SECCIONES[nivel].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
          </div>

          <div className="rounded-md border overflow-x-auto">
            <table className="min-w-[900px] w-full text-sm">
              <thead>
                <tr className="bg-muted">
                  <th className="p-2 text-left"><Clock className="h-4 w-4 inline mr-1" /> Hora</th>
                  {dias.map(d => <th key={d} className="p-2 text-left">{d}</th>)}
                </tr>
              </thead>
              <tbody>
                {horas.map(h => (
                  <tr key={h} className="border-t">
                    <td className="p-2 font-mono text-xs text-muted-foreground">{h}</td>
                    {dias.map(d => (
                      <td key={d} className="p-2 align-top">
                        {cellText(d, h) || <span className="text-muted-foreground/60">—</span>}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-xs text-muted-foreground">
            * Esta vista se alimenta de las <strong>Asignaciones</strong>. Para modificar bloques, ve a “Asignaciones”.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
