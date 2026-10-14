/**
 * Módulo de Justificaciones de Asistencia por Niveles
 * Vista administrativa para gestionar justificaciones de ausencias y tardanzas
 */

import { useState, useEffect, useCallback } from "react";
import {
  Baby,
  BookOpen,
  GraduationCap,
  FileCheck,
  Clock,
  AlertCircle,
  CheckCircle2,
  Search,
  Filter,
  Calendar,
  User,
  RefreshCw,
  FileText,
  Building2,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { toast } from "sonner";
import {
  type NivelKey,
  type AttendanceRecord,
  type JustificacionStats,
  type Section,
  getAttendanceByNivel,
  getPendingJustifications,
  getJustifiedRecords,
  justifyAttendance,
  getJustificacionStats,
  getSectionsByNivel,
  getNivelColor,
  getNivelLabel,
  getEstadoColor,
  formatDate,
  getDaysDifference,
} from "@/services/justificacionesApi";

// Configuración de niveles con íconos
const nivelesConfig = {
  inicial: {
    label: "Inicial",
    icon: Baby,
    color: "pink",
    description: "Kinder y Pre-kinder",
  },
  primaria: {
    label: "Primaria",
    icon: BookOpen,
    color: "blue",
    description: "1° a 6° de Primaria",
  },
  secundaria: {
    label: "Secundaria",
    icon: GraduationCap,
    color: "purple",
    description: "1° a 6° de Secundaria",
  },
};

export default function JustificacionesAdmin() {
  // Estado principal
  const [activeNivel, setActiveNivel] = useState<NivelKey>("primaria");
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<JustificacionStats[]>([]);
  const [pendingRecords, setPendingRecords] = useState<AttendanceRecord[]>([]);
  const [justifiedRecords, setJustifiedRecords] = useState<AttendanceRecord[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSection, setSelectedSection] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("");
  const [viewMode, setViewMode] = useState<"pending" | "justified">("pending");
  
  // Dialog para justificar
  const [justifyDialogOpen, setJustifyDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);
  const [justificationReason, setJustificationReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Cargar datos iniciales
  const loadData = useCallback(async () => {
    // Verificar que hay token antes de hacer peticiones
    const token = localStorage.getItem('authToken');
    if (!token) {
      console.log('[Justificaciones] Esperando autenticación...');
      return;
    }

    setLoading(true);
    try {
      // Cargar estadísticas generales
      const statsData = await getJustificacionStats();
      setStats(statsData);

      // Cargar secciones del nivel activo
      const sectionsData = await getSectionsByNivel(activeNivel);
      setSections(sectionsData);

      // Cargar registros según modo de vista
      if (viewMode === "pending") {
        const pending = await getPendingJustifications(activeNivel);
        setPendingRecords(pending.data || []);
      } else {
        const justified = await getJustifiedRecords(activeNivel);
        setJustifiedRecords(justified.data || []);
      }
    } catch (error) {
      console.error("Error cargando datos:", error);
      toast.error("Error al cargar los datos de justificaciones");
    } finally {
      setLoading(false);
    }
  }, [activeNivel, viewMode]);

  useEffect(() => {
    // Pequeño delay para asegurar que el token esté disponible después del login
    const timer = setTimeout(() => {
      loadData();
    }, 500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeNivel, viewMode]);

  // Manejar justificación
  const handleJustify = async () => {
    if (!selectedRecord || !justificationReason.trim()) {
      toast.error("Debe ingresar el motivo de la justificación");
      return;
    }

    setSubmitting(true);
    try {
      await justifyAttendance(selectedRecord.id, justificationReason);
      toast.success("Asistencia justificada exitosamente");
      setJustifyDialogOpen(false);
      setSelectedRecord(null);
      setJustificationReason("");
      loadData();
    } catch (error) {
      console.error("Error al justificar:", error);
      toast.error("Error al procesar la justificación");
    } finally {
      setSubmitting(false);
    }
  };

  // Abrir dialog de justificación
  const openJustifyDialog = (record: AttendanceRecord) => {
    setSelectedRecord(record);
    setJustificationReason(record.observaciones || "");
    setJustifyDialogOpen(true);
  };

  // Filtrar registros
  const filterRecords = (records: AttendanceRecord[]) => {
    return records.filter((record) => {
      const studentName = record.student?.user?.name?.toLowerCase() || "";
      const matchesSearch = !searchTerm || studentName.includes(searchTerm.toLowerCase());
      const matchesSection = selectedSection === "all" || 
        record.section_id?.toString() === selectedSection;
      const matchesDate = !dateFilter || record.fecha === dateFilter;
      
      return matchesSearch && matchesSection && matchesDate;
    });
  };

  // Obtener registros actuales según modo
  const currentRecords = viewMode === "pending" ? pendingRecords : justifiedRecords;
  const filteredRecords = filterRecords(currentRecords);

  // Agrupar registros por sección
  const groupedBySection = filteredRecords.reduce((acc, record) => {
    const sectionKey = record.section_id?.toString() || "sin-seccion";
    const sectionLabel = record.section
      ? `${record.section.grado}° "${record.section.paralelo}"`
      : "Sin Sección";
    
    if (!acc[sectionKey]) {
      acc[sectionKey] = {
        label: sectionLabel,
        nivel: record.section?.nivel || "",
        records: [],
      };
    }
    acc[sectionKey].records.push(record);
    return acc;
  }, {} as Record<string, { label: string; nivel: string; records: AttendanceRecord[] }>);

  // Obtener estadísticas del nivel activo
  const currentStats = stats.find((s) => s.nivel === activeNivel) || {
    nivel: activeNivel,
    total_registros: 0,
    justificados: 0,
    pendientes_justificar: 0,
    porcentaje_justificacion: 0,
  };

  return (
    <div className="container mx-auto py-6 px-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FileCheck className="h-8 w-8 text-blue-600" />
            Justificaciones de Asistencia
          </h1>
          <p className="text-muted-foreground mt-1">
            Gestión de justificaciones por niveles educativos
          </p>
        </div>
        <Button onClick={loadData} disabled={loading} variant="outline">
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Actualizar
        </Button>
      </div>

      {/* Tabs por Nivel */}
      <Tabs
        value={activeNivel}
        onValueChange={(v) => setActiveNivel(v as NivelKey)}
        className="space-y-4"
      >
        <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
          {Object.entries(nivelesConfig).map(([key, config]) => {
            const Icon = config.icon;
            const nivelStats = stats.find((s) => s.nivel === key);
            return (
              <TabsTrigger
                key={key}
                value={key}
                className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{config.label}</span>
                {nivelStats && nivelStats.pendientes_justificar > 0 && (
                  <Badge variant="destructive" className="ml-1 h-5 px-1.5 text-xs">
                    {nivelStats.pendientes_justificar}
                  </Badge>
                )}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {/* Contenido de cada nivel */}
        {Object.keys(nivelesConfig).map((nivel) => (
          <TabsContent key={nivel} value={nivel} className="space-y-6">
            {/* Tarjetas de resumen */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Total Registros
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold">
                        {currentStats.total_registros}
                      </span>
                      <Calendar className="h-8 w-8 text-gray-400" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 delay-100">
                <Card className="border-red-200 bg-red-50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-red-700">
                      Pendientes de Justificar
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-red-700">
                        {currentStats.pendientes_justificar}
                      </span>
                      <AlertCircle className="h-8 w-8 text-red-400" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 delay-200">
                <Card className="border-green-200 bg-green-50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-green-700">
                      Justificados
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-green-700">
                        {currentStats.justificados}
                      </span>
                      <CheckCircle2 className="h-8 w-8 text-green-400" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 delay-300">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      % Justificación
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold">
                          {currentStats.porcentaje_justificacion}%
                        </span>
                        <TrendingUp className="h-8 w-8 text-blue-400" />
                      </div>
                      <Progress value={currentStats.porcentaje_justificacion} />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Filtros y controles */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row gap-4">
                  {/* Búsqueda */}
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar estudiante..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  {/* Filtro por sección */}
                  <Select value={selectedSection} onValueChange={setSelectedSection}>
                    <SelectTrigger className="w-full md:w-48">
                      <Building2 className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Sección" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas las secciones</SelectItem>
                      {sections.map((section) => (
                        <SelectItem key={section.id} value={section.id.toString()}>
                          {section.grado}° "{section.paralelo}"
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Filtro por fecha */}
                  <div className="relative">
                    <Input
                      type="date"
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value)}
                      className="w-full md:w-44"
                    />
                  </div>

                  {/* Toggle de vista */}
                  <div className="flex gap-2">
                    <Button
                      variant={viewMode === "pending" ? "default" : "outline"}
                      onClick={() => setViewMode("pending")}
                      size="sm"
                    >
                      <Clock className="h-4 w-4 mr-1" />
                      Pendientes
                    </Button>
                    <Button
                      variant={viewMode === "justified" ? "default" : "outline"}
                      onClick={() => setViewMode("justified")}
                      size="sm"
                    >
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                      Justificados
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Lista de registros agrupados por sección */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  {viewMode === "pending" ? "Ausencias Pendientes de Justificar" : "Registros Justificados"}
                  <Badge variant="secondary" className="ml-2">
                    {filteredRecords.length} registro(s)
                  </Badge>
                </CardTitle>
                <CardDescription>
                  {viewMode === "pending"
                    ? "Seleccione un registro para agregar justificación"
                    : "Historial de justificaciones procesadas"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : filteredRecords.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No hay registros {viewMode === "pending" ? "pendientes" : "justificados"}</p>
                  </div>
                ) : (
                  <Accordion type="multiple" className="space-y-2">
                    {Object.entries(groupedBySection).map(([key, group]) => (
                      <AccordionItem
                        key={key}
                        value={key}
                        className="border rounded-lg px-4"
                      >
                        <AccordionTrigger className="hover:no-underline">
                          <div className="flex items-center gap-3">
                            <Badge className={getNivelColor(group.nivel)}>
                              {getNivelLabel(group.nivel)}
                            </Badge>
                            <span className="font-semibold">{group.label}</span>
                            <Badge variant="outline">
                              {group.records.length} registro(s)
                            </Badge>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Estudiante</TableHead>
                                <TableHead>Fecha</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead>Materia</TableHead>
                                <TableHead>Días</TableHead>
                                <TableHead>Observaciones</TableHead>
                                {viewMode === "pending" && (
                                  <TableHead className="text-right">Acción</TableHead>
                                )}
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {group.records.map((record) => (
                                <TableRow key={record.id}>
                                  <TableCell>
                                    <div className="flex items-center gap-2">
                                      <User className="h-4 w-4 text-muted-foreground" />
                                      <span className="font-medium">
                                        {record.student?.user?.name || "N/A"}
                                      </span>
                                    </div>
                                  </TableCell>
                                  <TableCell>{formatDate(record.fecha)}</TableCell>
                                  <TableCell>
                                    <Badge className={getEstadoColor(record.estado)}>
                                      {record.estado.charAt(0).toUpperCase() + record.estado.slice(1)}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    {record.subject?.nombre || "N/A"}
                                  </TableCell>
                                  <TableCell>
                                    <Badge variant="outline">
                                      {getDaysDifference(record.fecha)} día(s)
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="max-w-48 truncate">
                                    {record.observaciones || "-"}
                                  </TableCell>
                                  {viewMode === "pending" && (
                                    <TableCell className="text-right">
                                      <Button
                                        size="sm"
                                        onClick={() => openJustifyDialog(record)}
                                      >
                                        <FileCheck className="h-4 w-4 mr-1" />
                                        Justificar
                                      </Button>
                                    </TableCell>
                                  )}
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                )}
              </CardContent>
            </Card>

            {/* Resumen general de todos los niveles */}
            <Card>
              <CardHeader>
                <CardTitle>Resumen General por Nivel</CardTitle>
                <CardDescription>
                  Comparativa de justificaciones entre niveles educativos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {stats.map((stat) => {
                    const config = nivelesConfig[stat.nivel as NivelKey];
                    const Icon = config?.icon || BookOpen;
                    return (
                      <Card
                        key={stat.nivel}
                        className={`cursor-pointer transition-all hover:shadow-md ${
                          stat.nivel === activeNivel ? "ring-2 ring-primary" : ""
                        }`}
                        onClick={() => setActiveNivel(stat.nivel as NivelKey)}
                      >
                        <CardContent className="pt-4">
                          <div className="flex items-center gap-3 mb-3">
                            <div className={`p-2 rounded-lg ${getNivelColor(stat.nivel)}`}>
                              <Icon className="h-5 w-5" />
                            </div>
                            <div>
                              <h4 className="font-semibold">{getNivelLabel(stat.nivel)}</h4>
                              <p className="text-xs text-muted-foreground">
                                {config?.description}
                              </p>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Pendientes:</span>
                              <Badge variant="destructive">
                                {stat.pendientes_justificar}
                              </Badge>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Justificados:</span>
                              <Badge variant="secondary">{stat.justificados}</Badge>
                            </div>
                            <Progress
                              value={stat.porcentaje_justificacion}
                              className="h-2"
                            />
                            <p className="text-xs text-center text-muted-foreground">
                              {stat.porcentaje_justificacion}% justificado
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Dialog para justificar */}
      <Dialog open={justifyDialogOpen} onOpenChange={setJustifyDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileCheck className="h-5 w-5 text-blue-600" />
              Justificar Ausencia
            </DialogTitle>
            <DialogDescription>
              Registre el motivo de la justificación para esta falta
            </DialogDescription>
          </DialogHeader>

          {selectedRecord && (
            <div className="space-y-4">
              {/* Información del registro */}
              <div className="bg-muted p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Estudiante:</span>
                  <span className="font-medium">
                    {selectedRecord.student?.user?.name || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Fecha:</span>
                  <span>{formatDate(selectedRecord.fecha)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Estado actual:</span>
                  <Badge className={getEstadoColor(selectedRecord.estado)}>
                    {selectedRecord.estado}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Materia:</span>
                  <span>{selectedRecord.subject?.nombre || "N/A"}</span>
                </div>
              </div>

              {/* Textarea para motivo */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Motivo de la justificación *
                </label>
                <Textarea
                  placeholder="Ej: Certificado médico presentado, cita médica programada, emergencia familiar..."
                  value={justificationReason}
                  onChange={(e) => setJustificationReason(e.target.value)}
                  rows={4}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setJustifyDialogOpen(false)}
              disabled={submitting}
            >
              Cancelar
            </Button>
            <Button onClick={handleJustify} disabled={submitting || !justificationReason.trim()}>
              {submitting ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Procesando...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Confirmar Justificación
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
