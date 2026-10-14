import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Download, FileSpreadsheet, RefreshCw, Loader2, DollarSign, Users, AlertTriangle, CheckCircle } from "lucide-react";
import { FaFilePdf } from "react-icons/fa";
import { useToast } from "@/hooks/use-toast";
import {
  getFinanceSummary,
  getCentralReportPDF,
  downloadBlob,
  formatCurrency,
  getStatusColor,
  getStatusLabel,
  type FinanceSummary,
} from "@/services/finanzasApi";

const COLORS = ["#22c55e", "#eab308", "#ef4444"];

export default function ReportesFinancieros() {
  const { toast } = useToast();
  const currentYear = new Date().getFullYear();
  const [periodo, setPeriodo] = useState(String(currentYear));
  const [nivel, setNivel] = useState("todos");
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [summary, setSummary] = useState<FinanceSummary | null>(null);

  const loadSummary = useCallback(async () => {
    // Verificar que hay token antes de hacer peticiones
    const token = localStorage.getItem('authToken');
    if (!token) {
      console.log('[ReportesFinancieros] Esperando autenticación...');
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      const data = await getFinanceSummary(Number(periodo));
      setSummary(data);
    } catch (error: unknown) {
      console.error("Error cargando resumen:", error);
      const err = error as { response?: { data?: { message?: string } } };
      toast({
        title: "Error",
        description: err?.response?.data?.message || "No se pudo cargar el resumen financiero",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [periodo, toast]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadSummary();
    }, 500);
    return () => clearTimeout(timer);
  }, [loadSummary]);

  const handleExportPDF = async () => {
    setExporting(true);
    try {
      const blob = await getCentralReportPDF(Number(periodo));
      downloadBlob(blob, `consolidado_financiero_${periodo}.pdf`);
      toast({ title: "📥 PDF descargado" });
    } catch (error: unknown) {
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

  // Datos para gráfico de pie
  const pieData = summary ? [
    { name: "Al día", value: summary.resumen_estados.al_dia, color: "#22c55e" },
    { name: "Pendientes", value: summary.resumen_estados.pendientes, color: "#eab308" },
    { name: "En mora", value: summary.resumen_estados.en_mora, color: "#ef4444" },
  ] : [];

  // Filtrar cuentas por nivel si aplica
  const cuentasFiltradas = summary?.cuentas.filter(c => {
    if (nivel === "todos") return true;
    // Aquí se podría filtrar por nivel si la API lo soportara
    return true;
  }) || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Reportes Financieros</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadSummary} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Actualizar
          </Button>
          <Select value={periodo} onValueChange={setPeriodo}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={String(currentYear)}>{currentYear}</SelectItem>
              <SelectItem value={String(currentYear - 1)}>{currentYear - 1}</SelectItem>
              <SelectItem value={String(currentYear - 2)}>{currentYear - 2}</SelectItem>
            </SelectContent>
          </Select>
          <Select value={nivel} onValueChange={setNivel}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Nivel" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="inicial">Inicial</SelectItem>
              <SelectItem value="primaria">Primaria</SelectItem>
              <SelectItem value="secundaria">Secundaria</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Resumen en Cards */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-muted-foreground">Cargando datos financieros...</span>
        </div>
      ) : summary ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Deuda</p>
                  <p className="text-xl font-bold">{formatCurrency(summary.resumen_financiero.total_deuda)}</p>
                </div>
                <div className="p-2 bg-blue-100 rounded-full">
                  <DollarSign className="h-5 w-5 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Pagado</p>
                  <p className="text-xl font-bold text-green-600">{formatCurrency(summary.resumen_financiero.total_pagado)}</p>
                </div>
                <div className="p-2 bg-green-100 rounded-full">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pendiente</p>
                  <p className="text-xl font-bold text-yellow-600">{formatCurrency(summary.resumen_financiero.total_pendiente)}</p>
                </div>
                <div className="p-2 bg-yellow-100 rounded-full">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">% Recaudado</p>
                  <p className="text-xl font-bold">{summary.resumen_financiero.porcentaje_recaudado}%</p>
                </div>
                <div className="p-2 bg-purple-100 rounded-full">
                  <Users className="h-5 w-5 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="resumen" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="resumen">Resumen</TabsTrigger>
              <TabsTrigger value="morosidad">Morosidad</TabsTrigger>
              <TabsTrigger value="estudiantes">Por Estudiante</TabsTrigger>
              <TabsTrigger value="exportar">Exportar</TabsTrigger>
            </TabsList>

            {/* Resumen General */}
            <TabsContent value="resumen">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Distribución de Estados</CardTitle>
                    <CardDescription>Estado de cuentas de estudiantes</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={5}
                            dataKey="value"
                            label={({ name, value }) => `${name}: ${value}`}
                          >
                            {pieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex justify-center gap-4 mt-4">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500" />
                        <span className="text-sm">Al día ({summary.resumen_estados.al_dia})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-yellow-500" />
                        <span className="text-sm">Pendientes ({summary.resumen_estados.pendientes})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500" />
                        <span className="text-sm">En mora ({summary.resumen_estados.en_mora})</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Estadísticas {periodo}</CardTitle>
                    <CardDescription>Resumen del año académico</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <span>Total Estudiantes</span>
                      <Badge variant="secondary">{summary.total_estudiantes}</Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded">
                      <span>Estudiantes al día</span>
                      <Badge className="bg-green-100 text-green-700">{summary.resumen_estados.al_dia}</Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-yellow-50 rounded">
                      <span>Con pagos pendientes</span>
                      <Badge className="bg-yellow-100 text-yellow-700">{summary.resumen_estados.pendientes}</Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-red-50 rounded">
                      <span>En mora</span>
                      <Badge className="bg-red-100 text-red-700">{summary.resumen_estados.en_mora}</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Morosidad */}
            <TabsContent value="morosidad">
              <Card>
                <CardHeader>
                  <CardTitle>Análisis de Morosidad</CardTitle>
                  <CardDescription>Estudiantes con pagos vencidos</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Estudiante</TableHead>
                        <TableHead className="text-right">Total Deuda</TableHead>
                        <TableHead className="text-right">Pagado</TableHead>
                        <TableHead className="text-right">Pendiente</TableHead>
                        <TableHead>Estado</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cuentasFiltradas
                        .filter(c => c.status === "MORA")
                        .slice(0, 20)
                        .map((cuenta) => (
                          <TableRow key={cuenta.student_id}>
                            <TableCell className="font-medium">{cuenta.student_name}</TableCell>
                            <TableCell className="text-right">{formatCurrency(cuenta.total_debt)}</TableCell>
                            <TableCell className="text-right text-green-600">{formatCurrency(cuenta.total_paid)}</TableCell>
                            <TableCell className="text-right text-red-600">{formatCurrency(cuenta.saldo_pendiente)}</TableCell>
                            <TableCell>
                              <Badge className={getStatusColor(cuenta.status)}>
                                {getStatusLabel(cuenta.status)}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      {cuentasFiltradas.filter(c => c.status === "MORA").length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                            No hay estudiantes en mora 🎉
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Por Estudiante */}
            <TabsContent value="estudiantes">
              <Card>
                <CardHeader>
                  <CardTitle>Estados de Cuenta</CardTitle>
                  <CardDescription>Listado de todos los estudiantes</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Estudiante</TableHead>
                        <TableHead className="text-right">Total Deuda</TableHead>
                        <TableHead className="text-right">Pagado</TableHead>
                        <TableHead className="text-right">Pendiente</TableHead>
                        <TableHead>Estado</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cuentasFiltradas.slice(0, 50).map((cuenta) => (
                        <TableRow key={cuenta.student_id}>
                          <TableCell className="font-medium">{cuenta.student_name}</TableCell>
                          <TableCell className="text-right">{formatCurrency(cuenta.total_debt)}</TableCell>
                          <TableCell className="text-right text-green-600">{formatCurrency(cuenta.total_paid)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(cuenta.saldo_pendiente)}</TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(cuenta.status)}>
                              {getStatusLabel(cuenta.status)}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Exportar */}
            <TabsContent value="exportar">
              <Card>
                <CardHeader>
                  <CardTitle>Exportar Reportes</CardTitle>
                  <CardDescription>Descarga reportes en diferentes formatos</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <Button 
                      variant="outline" 
                      className="h-24 flex flex-col items-center justify-center"
                      onClick={handleExportPDF}
                      disabled={exporting}
                    >
                      {exporting ? (
                        <Loader2 className="h-8 w-8 mb-2 animate-spin" />
                      ) : (
                        <FaFilePdf className="h-8 w-8 mb-2 text-red-500" />
                      )}
                      Consolidado PDF
                    </Button>
                    <Button variant="outline" className="h-24 flex flex-col items-center justify-center">
                      <FileSpreadsheet className="h-8 w-8 mb-2 text-green-600" />
                      Exportar Excel
                    </Button>
                    <Button variant="outline" className="h-24 flex flex-col items-center justify-center">
                      <Download className="h-8 w-8 mb-2" />
                      Reporte MINEDU
                    </Button>
                    <Button variant="outline" className="h-24 flex flex-col items-center justify-center">
                      <Download className="h-8 w-8 mb-2" />
                      Doc. Auditoría
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <AlertTriangle className="h-12 w-12 mx-auto text-yellow-500 mb-4" />
            <p className="text-muted-foreground">No se pudieron cargar los datos financieros</p>
            <Button className="mt-4" onClick={loadSummary}>
              Reintentar
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
