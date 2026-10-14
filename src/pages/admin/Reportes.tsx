// src/pages/admin/Reportes.tsx
// Exportación de Centralizador y Boletines - Conectado a Backend Laravel

import { useEffect, useMemo, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  FileSpreadsheet, 
  Download, 
  RefreshCw, 
  Calculator, 
  CheckCircle,
  AlertTriangle,
  FileText,
  Loader2,
  Eye
} from "lucide-react";

import type { Term } from "@/lib/types-admin";
import { NIVELES, CURSOS_POR_NIVEL, PARALELOS, type NivelKey } from "@/lib/catalogo-bolivia";
import { cursosDisponibles, paralelosDeCurso } from "@/lib/sections";
import {
  getCentralizadorByCourse,
  calculateCentralizador,
  validateCentralizador,
  exportCentralizadorPDF,
  downloadBlob,
  centralizadorToCSV,
  downloadCSV,
  getNivelColor,
  type CentralizadorResponse,
  type ValidateCentralizadorResponse,
} from "@/services/reportesApi";

export default function AdminReportes() {
  const { toast } = useToast();
  const years = useMemo(() => [new Date().getFullYear(), new Date().getFullYear() - 1, new Date().getFullYear() - 2], []);
  
  // Estados de filtros
  const [year, setYear] = useState<number>(years[0]);
  const [term, setTerm] = useState<Term>("T1");
  const [nivel, setNivel] = useState<NivelKey>("primaria");
  
  // Cursos disponibles
  const cursos = useMemo(() => {
    const fromSections = cursosDisponibles(String(year), nivel);
    return fromSections.length > 0 ? fromSections : [...CURSOS_POR_NIVEL[nivel]];
  }, [year, nivel]);

  const [curso, setCurso] = useState<string>(cursos[0] || "1°");
  
  // Paralelos disponibles
  const paralelos = useMemo(() => {
    if (!curso) return [...PARALELOS].slice(0, 3);
    const fromSections = paralelosDeCurso(String(year), nivel, curso);
    return fromSections.length > 0 ? fromSections : ["A", "B", "C"];
  }, [year, nivel, curso]);

  const [paralelo, setParalelo] = useState<string>(paralelos[0] || "A");

  // Estados de datos
  const [centralizador, setCentralizador] = useState<CentralizadorResponse | null>(null);
  const [validation, setValidation] = useState<ValidateCentralizadorResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [exporting, setExporting] = useState(false);
  
  // Modal de validación
  const [validationDialog, setValidationDialog] = useState(false);

  // Cargar centralizado
  const loadCentralizador = useCallback(async () => {
    if (!curso || !paralelo) return;
    
    setLoading(true);
    try {
      const data = await getCentralizadorByCourse({
        year,
        grado: curso,
        seccion: paralelo,
        term,
      });
      setCentralizador(data);
    } catch (error: unknown) {
      console.error("Error cargando centralizado:", error);
      setCentralizador(null);
      const err = error as { response?: { status?: number; data?: { message?: string } } };
      if (err?.response?.status !== 404) {
        toast({
          title: "Error",
          description: err?.response?.data?.message || "No se pudo cargar el centralizado",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  }, [year, curso, paralelo, term, toast]);

  useEffect(() => {
    loadCentralizador();
  }, [loadCentralizador]);

  // Validar antes de calcular
  const handleValidate = async () => {
    setLoading(true);
    try {
      const result = await validateCentralizador({
        year,
        grado: curso,
        seccion: paralelo,
        nivel,
      });
      setValidation(result);
      setValidationDialog(true);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast({
        title: "Error de validación",
        description: err?.response?.data?.message || "No se pudo validar",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Calcular centralizado
  const handleCalculate = async () => {
    setCalculating(true);
    try {
      const result = await calculateCentralizador({
        year,
        grado: curso,
        seccion: paralelo,
        nivel,
      });
      toast({
        title: "✅ Centralizado calculado",
        description: `${result.data.estudiantes_procesados} estudiantes, ${result.data.materias_procesadas} materias`,
      });
      setValidationDialog(false);
      loadCentralizador();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast({
        title: "Error al calcular",
        description: err?.response?.data?.message || "No se pudo calcular el centralizado",
        variant: "destructive",
      });
    } finally {
      setCalculating(false);
    }
  };

  // Exportar CSV
  const handleExportCSV = async () => {
    if (!centralizador) {
      toast({
        title: "Sin datos",
        description: "No hay datos para exportar",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const csv = centralizadorToCSV(centralizador);
      downloadCSV(csv, `centralizador_${year}_${curso}_${paralelo}_${term}.csv`);
      toast({ title: "📥 CSV descargado" });
    } catch (error) {
      console.error("Error exportando CSV:", error);
      toast({
        title: "Error",
        description: "No se pudo exportar el CSV",
        variant: "destructive",
      });
    }
  };

  // Exportar PDF
  const handleExportPDF = async () => {
    setExporting(true);
    try {
      const blob = await exportCentralizadorPDF(year, curso, paralelo);
      downloadBlob(blob, `centralizador_${year}_${curso}_${paralelo}.pdf`);
      toast({ title: "📥 PDF descargado" });
    } catch (error: unknown) {
      console.error("Error exportando PDF:", error);
      const err = error as { response?: { data?: { message?: string } } };
      toast({
        title: "Error",
        description: err?.response?.data?.message || "No se pudo generar el PDF",
        variant: "destructive",
      });
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <FileSpreadsheet className="h-7 w-7 text-blue-600" />
            Reportes — Centralizador
          </h1>
          <p className="text-muted-foreground">
            Genera y exporta el centralizador de notas por curso
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadCentralizador} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Parámetros de Consulta</CardTitle>
          <CardDescription>Selecciona el año, trimestre, nivel y curso</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3 items-center">
          <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
            <SelectTrigger className="w-[120px]"><SelectValue placeholder="Año" /></SelectTrigger>
            <SelectContent>
              {years.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
            </SelectContent>
          </Select>

          <Select value={term} onValueChange={(v) => setTerm(v as Term)}>
            <SelectTrigger className="w-[140px]"><SelectValue placeholder="Trimestre" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="T1">Trimestre 1</SelectItem>
              <SelectItem value="T2">Trimestre 2</SelectItem>
              <SelectItem value="T3">Trimestre 3</SelectItem>
            </SelectContent>
          </Select>

          <Select value={nivel} onValueChange={(v) => { setNivel(v as NivelKey); setCurso(cursos[0] || ""); }}>
            <SelectTrigger className="w-[140px]"><SelectValue placeholder="Nivel" /></SelectTrigger>
            <SelectContent>
              {NIVELES.map(n => (
                <SelectItem key={n} value={n}>{n.charAt(0).toUpperCase() + n.slice(1)}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={curso || "__none__"} onValueChange={(v) => setCurso(v === "__none__" ? "" : v)}>
            <SelectTrigger className="w-[140px]"><SelectValue placeholder="Curso" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__">Seleccionar</SelectItem>
              {cursos.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>

          <Select value={paralelo || "__none__"} onValueChange={(v) => setParalelo(v === "__none__" ? "" : v)}>
            <SelectTrigger className="w-[130px]"><SelectValue placeholder="Paralelo" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__">Seleccionar</SelectItem>
              {paralelos.map(p => <SelectItem key={p} value={p}>Paralelo {p}</SelectItem>)}
            </SelectContent>
          </Select>

          <Badge variant="outline" className={getNivelColor(nivel)}>
            {nivel.toUpperCase()}
          </Badge>
        </CardContent>
      </Card>

      <Separator />

      {/* Acciones */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Calcular y Exportar
          </CardTitle>
          <CardDescription>
            Valida, calcula y exporta el centralizador de {curso} - {paralelo}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-3">
          <Button onClick={handleValidate} disabled={loading || !curso || !paralelo}>
            <Eye className="h-4 w-4 mr-2" />
            Validar Actas
          </Button>
          
          <Separator orientation="vertical" className="h-8" />
          
          <Button 
            variant="outline" 
            onClick={handleExportCSV} 
            disabled={!centralizador || centralizador.alumnos.length === 0}
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar CSV
          </Button>
          
          <Button 
            variant="outline" 
            onClick={handleExportPDF} 
            disabled={exporting || !centralizador || centralizador.alumnos.length === 0}
          >
            {exporting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <FileText className="h-4 w-4 mr-2" />
            )}
            Exportar PDF
          </Button>
        </CardContent>
      </Card>

      {/* Tabla de Centralizado */}
      <Card>
        <CardHeader>
          <CardTitle>
            Vista Previa del Centralizador
            {centralizador && (
              <Badge variant="secondary" className="ml-2">
                {centralizador.alumnos.length} estudiantes
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <span className="ml-2 text-muted-foreground">Cargando centralizado...</span>
            </div>
          ) : !centralizador || centralizador.alumnos.length === 0 ? (
            <div className="text-center py-12">
              <FileSpreadsheet className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium">Sin datos</h3>
              <p className="text-muted-foreground">
                No hay centralizado calculado para este curso. Valida las actas y calcula.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="sticky left-0 bg-background">Estudiante</TableHead>
                    {centralizador.materias.map((m) => (
                      <TableHead key={m.id} className="text-center min-w-[80px]" title={m.nombre}>
                        {m.nombre.length > 12 ? m.nombre.slice(0, 10) + "..." : m.nombre}
                      </TableHead>
                    ))}
                    <TableHead className="text-center font-bold">PA</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {centralizador.alumnos.map((alumno) => {
                    const paValue = centralizador.pa.find(p => p.student_id === alumno.id)?.pa;
                    return (
                      <TableRow key={alumno.id}>
                        <TableCell className="sticky left-0 bg-background font-medium">
                          {alumno.apellidos}, {alumno.nombres}
                        </TableCell>
                        {centralizador.materias.map((materia) => {
                          const celda = centralizador.celdas.find(
                            c => c.student_id === alumno.id && c.subject_id === materia.id
                          );
                          return (
                            <TableCell key={materia.id} className="text-center">
                              {celda?.t ?? "-"}
                            </TableCell>
                          );
                        })}
                        <TableCell className="text-center font-bold">
                          {paValue ?? "-"}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Validación */}
      <Dialog open={validationDialog} onOpenChange={setValidationDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {validation?.listo_para_calcular ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
              )}
              Validación de Actas
            </DialogTitle>
            <DialogDescription>
              {curso} - Paralelo {paralelo} | {year} - {term}
            </DialogDescription>
          </DialogHeader>

          {validation && (
            <div className="space-y-4">
              {/* Estado general */}
              <div className={`p-4 rounded-lg ${validation.listo_para_calcular ? 'bg-green-50' : 'bg-yellow-50'}`}>
                <p className={`font-semibold ${validation.listo_para_calcular ? 'text-green-700' : 'text-yellow-700'}`}>
                  {validation.listo_para_calcular 
                    ? "✅ Listo para calcular el centralizador"
                    : "⚠️ Hay observaciones pendientes"
                  }
                </p>
              </div>

              {/* Resumen */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-xs text-muted-foreground">Total Actas</p>
                  <p className="text-lg font-bold">{validation.resumen.total_actas_publicadas}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-xs text-muted-foreground">T1</p>
                  <p className="text-lg font-bold">{validation.resumen.actas_t1}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-xs text-muted-foreground">T2</p>
                  <p className="text-lg font-bold">{validation.resumen.actas_t2}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-xs text-muted-foreground">T3</p>
                  <p className="text-lg font-bold">{validation.resumen.actas_t3}</p>
                </div>
              </div>

              {/* Advertencias */}
              {validation.advertencias.length > 0 && (
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-yellow-700 mb-2">⚠️ Advertencias ({validation.advertencias.length})</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-yellow-600 max-h-40 overflow-auto">
                    {validation.advertencias.map((warn, i) => (
                      <li key={i}>{warn}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Errores */}
              {validation.errores.length > 0 && (
                <div className="bg-red-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-red-700 mb-2">❌ Errores ({validation.errores.length})</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-red-600 max-h-40 overflow-auto">
                    {validation.errores.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Botón calcular */}
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setValidationDialog(false)}>
                  Cerrar
                </Button>
                <Button 
                  onClick={handleCalculate} 
                  disabled={calculating || validation.resumen.total_actas_publicadas === 0}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {calculating ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Calculator className="h-4 w-4 mr-2" />
                  )}
                  Calcular Centralizador
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
