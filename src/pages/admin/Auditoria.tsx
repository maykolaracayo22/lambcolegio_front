import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShieldQuestion, Trash2, Search } from "lucide-react";

type Log = { id: number; date: string; action: string; meta?: Record<string, any> };

export default function AuditoriaAdmin() {
  const [rows, setRows] = useState<Log[]>([]);
  const [q, setQ] = useState("");

  const load = () => setRows(JSON.parse(localStorage.getItem("adm:audit") || "[]"));
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    return rows.filter(r => `${r.action} ${JSON.stringify(r.meta || {})}`.toLowerCase().includes(q.toLowerCase()));
  }, [rows, q]);

  const clear = () => {
    if (!confirm("¿Borrar registro de auditoría?")) return;
    localStorage.removeItem("adm:audit");
    load();
  };

  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center gap-2">
        <ShieldQuestion className="h-6 w-6 text-blue-600" />
        <h1 className="text-2xl font-bold">Auditoría</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Eventos del sistema</CardTitle>
          <CardDescription>Acciones recientes (alta/baja, cambios de configuración, etc.).</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input className="pl-7 w-[260px]" placeholder="Buscar acción o meta…" value={q} onChange={(e) => setQ(e.target.value)} />
            </div>
            <Button variant="destructive" onClick={clear}><Trash2 className="h-4 w-4 mr-2" /> Limpiar</Button>
            <Button variant="outline" onClick={load}>Recargar</Button>
          </div>

          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Acción</TableHead>
                  <TableHead>Meta</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-mono text-xs">{new Date(r.date).toLocaleString()}</TableCell>
                    <TableCell className="font-medium">{r.action}</TableCell>
                    <TableCell className="text-xs">
                      <pre className="whitespace-pre-wrap break-all">{JSON.stringify(r.meta || {}, null, 2)}</pre>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground">Sin eventos…</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
