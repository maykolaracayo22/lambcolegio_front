import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Share, Download, UploadCloud, FileSpreadsheet, FileJson } from "lucide-react";

const downloadBlob = (content: string, filename: string, type: string) => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
};

export default function ImportExportAdmin() {
  const [lastImport, setLastImport] = useState<string | null>(localStorage.getItem("adm:import:last") || null);

  const dlTemplate = (kind: "estudiantes" | "docentes" | "materias") => {
    const headers: Record<string, string[]> = {
      estudiantes: ["codigo","nombres","apellidos","nivel","grado","seccion","correo","activo"],
      docentes: ["nombre","apellido","email","telefono","departamento","estado"],
      materias: ["id","nombre","descripcion","gradoSugerido","creditos","activo"],
    };
    downloadBlob(headers[kind].join(",") + "\n", `${kind}_plantilla.csv`, "text/csv;charset=utf-8");
  };

  const exportJSON = () => {
    const keys = Object.keys(localStorage).filter(k => k.startsWith("adm:"));
    const dump: Record<string, any> = {};
    keys.forEach(k => { try { dump[k] = JSON.parse(localStorage.getItem(k) || "null"); } catch { dump[k] = localStorage.getItem(k); } });
    downloadBlob(JSON.stringify(dump, null, 2), "export_admin.json", "application/json");
  };

  const onImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result as string;
      localStorage.setItem("adm:import:last", text.slice(0, 500)); // demo: guardamos preview
      setLastImport(text.slice(0, 500));
      alert(`Importación cargada (${file.name}). Conecta aquí tu parser real.`);
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center gap-2">
        <Share className="h-6 w-6 text-blue-600" />
        <h1 className="text-2xl font-bold">Importar / Exportar</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Descargar plantillas</CardTitle>
          <CardDescription>Úsalas para cargar datos en masa.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button onClick={() => dlTemplate("estudiantes")}><FileSpreadsheet className="h-4 w-4 mr-2" /> Estudiantes CSV</Button>
          <Button onClick={() => dlTemplate("docentes")}><FileSpreadsheet className="h-4 w-4 mr-2" /> Docentes CSV</Button>
          <Button onClick={() => dlTemplate("materias")}><FileSpreadsheet className="h-4 w-4 mr-2" /> Materias CSV</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Importar archivos</CardTitle>
          <CardDescription>CSV/XLSX (demo: sólo vista previa y almacenamiento simple).</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-3">
          <Input type="file" accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" onChange={onImport} />
          <UploadCloud className="h-5 w-5 text-muted-foreground" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Exportar todo</CardTitle>
          <CardDescription>Descarga un JSON con todas las claves <code>adm:*</code>.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={exportJSON}><FileJson className="h-4 w-4 mr-2" /> Exportar JSON</Button>
          {lastImport && (
            <p className="text-xs text-muted-foreground mt-3">
              Último import (preview 500 chars): <br />
              <code className="break-all">{lastImport}</code>
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
