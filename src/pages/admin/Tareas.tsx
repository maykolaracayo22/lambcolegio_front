// src/pages/admin/Tareas.tsx
// Gestión de Tareas/Evaluaciones por Niveles - Admin

import { useState, useEffect, useMemo } from 'react';
import {
  getActasConEvaluaciones,
  getTareasStats,
  getSectionsByNivel,
  getNivelColor,
  getNivelLabel,
  getStatusColor,
  getStatusLabel,
  formatDate,
  type Acta,
  type Evaluation,
  type TareaStats,
  type NivelKey,
} from '@/services/tareasApi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import {
  ClipboardList,
  BookOpen,
  GraduationCap,
  Baby,
  Users,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  Loader2,
  RefreshCw,
  BarChart3,
  FileText,
  Filter,
} from 'lucide-react';

const currentYear = new Date().getFullYear();

const nivelIcons: Record<NivelKey, React.ReactNode> = {
  inicial: <Baby className="h-5 w-5" />,
  primaria: <BookOpen className="h-5 w-5" />,
  secundaria: <GraduationCap className="h-5 w-5" />,
};

export default function TareasAdmin() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<NivelKey>('primaria');
  const [stats, setStats] = useState<TareaStats | null>(null);
  const [actas, setActas] = useState<Acta[]>([]);
  const [selectedYear] = useState(currentYear);

  // Cargar datos iniciales
  useEffect(() => {
    // Verificar que hay token antes de hacer peticiones
    const token = localStorage.getItem('authToken');
    if (!token) {
      console.log('[Tareas] Esperando autenticación...');
      setLoading(false);
      return;
    }
    
    const timer = setTimeout(() => {
      loadData();
    }, 500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedYear]);

  // Cargar actas cuando cambia el nivel
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) return;
    
    const timer = setTimeout(() => {
      loadActasByNivel(activeTab);
    }, 100);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, selectedYear]);

  async function loadData() {
    try {
      setLoading(true);
      const statsData = await getTareasStats(selectedYear);
      setStats(statsData);
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudieron cargar las estadísticas',
      });
    } finally {
      setLoading(false);
    }
  }

  async function loadActasByNivel(nivel: NivelKey) {
    try {
      const response = await getActasConEvaluaciones({
        nivel,
        year: selectedYear,
      });
      setActas(response.data);
    } catch (error) {
      console.error('Error cargando actas:', error);
    }
  }

  // Agrupar actas por sección
  const actasBySection = useMemo(() => {
    const grouped: Record<string, Acta[]> = {};
    actas.forEach((acta) => {
      const sectionKey = acta.section
        ? `${acta.section.grado}° "${acta.section.paralelo}"`
        : `Sección ${acta.section_id}`;
      if (!grouped[sectionKey]) {
        grouped[sectionKey] = [];
      }
      grouped[sectionKey].push(acta);
    });
    return grouped;
  }, [actas]);

  // Calcular total de evaluaciones por sección
  const getTotalEvaluaciones = (sectionActas: Acta[]) => {
    return sectionActas.reduce((sum, acta) => sum + (acta.evaluations?.length || 0), 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-2">Cargando tareas y evaluaciones...</span>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ClipboardList className="h-6 w-6" />
            Gestión de Tareas y Evaluaciones
          </h1>
          <p className="text-muted-foreground">
            Vista administrativa de evaluaciones por nivel educativo
          </p>
        </div>
        <Button variant="outline" onClick={loadData}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Actualizar
        </Button>
      </div>

      {/* Tarjetas de Resumen por Nivel */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-3">
          {stats.por_nivel.map((nivel) => (
            <Card key={nivel.nivel} className={`border-l-4 ${getNivelColor(nivel.nivel)}`}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  {nivelIcons[nivel.nivel as NivelKey]}
                  {getNivelLabel(nivel.nivel)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{nivel.cantidad}</div>
                <p className="text-xs text-muted-foreground">
                  evaluaciones registradas
                </p>
                <div className="mt-2 flex items-center gap-2 text-xs">
                  <span className="flex items-center gap-1 text-green-600">
                    <CheckCircle2 className="h-3 w-3" />
                    {nivel.completadas} completadas
                  </span>
                  <span className="flex items-center gap-1 text-yellow-600">
                    <Clock className="h-3 w-3" />
                    {nivel.pendientes} pendientes
                  </span>
                </div>
                {nivel.cantidad > 0 && (
                  <Progress
                    value={(nivel.completadas / nivel.cantidad) * 100}
                    className="mt-2 h-2"
                  />
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Tabs por Nivel */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as NivelKey)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="inicial" className="flex items-center gap-2">
            <Baby className="h-4 w-4" />
            Inicial
          </TabsTrigger>
          <TabsTrigger value="primaria" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Primaria
          </TabsTrigger>
          <TabsTrigger value="secundaria" className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4" />
            Secundaria
          </TabsTrigger>
        </TabsList>

        {/* Contenido por nivel */}
        {(['inicial', 'primaria', 'secundaria'] as NivelKey[]).map((nivel) => (
          <TabsContent key={nivel} value={nivel} className="space-y-4">
            {Object.keys(actasBySection).length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No hay evaluaciones registradas para {getNivelLabel(nivel)}</p>
                  <p className="text-sm">
                    Las evaluaciones aparecerán aquí cuando los docentes las creen en sus actas
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Accordion type="multiple" className="space-y-2">
                {Object.entries(actasBySection).map(([sectionName, sectionActas]) => (
                  <AccordionItem
                    key={sectionName}
                    value={sectionName}
                    className="border rounded-lg"
                  >
                    <AccordionTrigger className="px-4 hover:no-underline">
                      <div className="flex items-center justify-between w-full pr-4">
                        <div className="flex items-center gap-3">
                          <Users className="h-5 w-5 text-muted-foreground" />
                          <span className="font-medium">{sectionName}</span>
                          <Badge variant="secondary">
                            {getTotalEvaluaciones(sectionActas)} evaluaciones
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getNivelColor(nivel)}>
                            {getNivelLabel(nivel)}
                          </Badge>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4">
                      <div className="space-y-4">
                        {sectionActas.map((acta) => (
                          <Card key={acta.id} className="border">
                            <CardHeader className="py-3">
                              <div className="flex items-center justify-between">
                                <div>
                                  <CardTitle className="text-base flex items-center gap-2">
                                    <BookOpen className="h-4 w-4" />
                                    {acta.subject?.nombre || `Materia ${acta.subject_id}`}
                                  </CardTitle>
                                  <CardDescription className="text-xs">
                                    {acta.teacher
                                      ? `Prof. ${acta.teacher.nombres} ${acta.teacher.apellidos}`
                                      : 'Sin docente asignado'}
                                    {' • '}
                                    {acta.period?.name || `Período ${acta.period_id}`}
                                  </CardDescription>
                                </div>
                                <Badge className={getStatusColor(acta.status)}>
                                  {getStatusLabel(acta.status)}
                                </Badge>
                              </div>
                            </CardHeader>
                            <CardContent className="pt-0">
                              {acta.evaluations && acta.evaluations.length > 0 ? (
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead>Evaluación</TableHead>
                                      <TableHead className="text-center">Peso %</TableHead>
                                      <TableHead>Fecha</TableHead>
                                      <TableHead className="text-center">Notas</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {acta.evaluations.map((ev) => (
                                      <TableRow key={ev.id}>
                                        <TableCell className="font-medium">
                                          {ev.nombre}
                                        </TableCell>
                                        <TableCell className="text-center">
                                          <Badge variant="outline">{ev.peso}%</Badge>
                                        </TableCell>
                                        <TableCell>
                                          <span className="flex items-center gap-1 text-sm text-muted-foreground">
                                            <Calendar className="h-3 w-3" />
                                            {formatDate(ev.fecha)}
                                          </span>
                                        </TableCell>
                                        <TableCell className="text-center">
                                          {ev.notes && ev.notes.length > 0 ? (
                                            <Badge className="bg-green-100 text-green-700">
                                              <CheckCircle2 className="h-3 w-3 mr-1" />
                                              {ev.notes.length} registradas
                                            </Badge>
                                          ) : (
                                            <Badge variant="secondary">
                                              <AlertCircle className="h-3 w-3 mr-1" />
                                              Pendiente
                                            </Badge>
                                          )}
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              ) : (
                                <p className="text-sm text-muted-foreground text-center py-4">
                                  No hay evaluaciones creadas en esta acta
                                </p>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Resumen por Materia */}
      {stats && stats.por_materia.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Evaluaciones por Materia
            </CardTitle>
            <CardDescription>
              Top 10 materias con más evaluaciones registradas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.por_materia.map((item, index) => (
                <div key={item.materia} className="flex items-center gap-4">
                  <span className="w-6 text-center text-sm text-muted-foreground">
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{item.materia}</span>
                      <span className="text-sm text-muted-foreground">
                        {item.cantidad} evaluaciones
                      </span>
                    </div>
                    <Progress
                      value={
                        (item.cantidad / Math.max(...stats.por_materia.map((m) => m.cantidad))) *
                        100
                      }
                      className="h-2"
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
