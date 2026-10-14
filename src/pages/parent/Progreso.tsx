// src/pages/parent/Progreso.tsx
// CONECTADO AL BACKEND - Consume API real
import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import {
  getChildGrades,
  getChildAttendance,
  getChildTasks,
  getChildInfo,
  ChildSubjectGrades,
  ChildAttendanceStats,
  ChildTask
} from '@/services/parentPortalApi';
import {
  BookOpen,
  CheckCircle,
  AlertCircle,
  Clock,
  TrendingUp,
  Target,
  Award,
  Calendar,
  RefreshCw,
  Share2,
  Download,
  MessageCircle
} from 'lucide-react';

export default function Progreso() {
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Estado de carga
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Datos del backend
  const [grades, setGrades] = useState<ChildSubjectGrades[]>([]);
  const [attendanceStats, setAttendanceStats] = useState<ChildAttendanceStats | null>(null);
  const [tasks, setTasks] = useState<ChildTask[]>([]);
  const [childInfo, setChildInfo] = useState<{nombres: string; apellidos: string; curso: string; paralelo: string} | null>(null);

  // Fetch datos
  const fetchProgress = async () => {
    try {
      // Obtener datos en paralelo
      const [gradesData, attendanceData, tasksData] = await Promise.all([
        getChildGrades(),
        getChildAttendance(),
        getChildTasks()
      ]);

      setGrades(gradesData);
      setAttendanceStats(attendanceData.stats);
      setTasks(tasksData);
      
      // Info del hijo
      const info = getChildInfo();
      if (info) {
        setChildInfo({
          nombres: info.nombres,
          apellidos: info.apellidos,
          curso: info.curso,
          paralelo: info.paralelo
        });
      }
      
    } catch (error) {
      console.error('Error fetching progress:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos de progreso",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    const initFetch = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500));
      await fetchProgress();
      setLoading(false);
    };
    initFetch();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchProgress();
    setRefreshing(false);
    toast({
      title: "Actualizado",
      description: "Progreso actualizado correctamente",
    });
  };

  // Calcular estadísticas
  const stats = useMemo(() => {
    // Promedio general de notas
    const promedioGeneral = grades.length > 0
      ? Math.round(grades.reduce((sum, g) => sum + g.promedioAnual, 0) / grades.length)
      : 0;

    // Materias aprobadas
    const materiasAprobadas = grades.filter(g => g.aprobado).length;
    const totalMaterias = grades.length;

    // Tareas
    const tareasCompletadas = tasks.filter(t => t.estado === 'calificado' || t.estado === 'entregado').length;
    const tareasPendientes = tasks.filter(t => t.estado === 'pendiente').length;
    const tareasVencidas = tasks.filter(t => t.estado === 'vencido').length;
    const totalTareas = tasks.length;

    // Porcentaje de progreso general
    const progresoGeneral = totalTareas > 0
      ? Math.round((tareasCompletadas / totalTareas) * 100)
      : 0;

    return {
      promedioGeneral,
      materiasAprobadas,
      totalMaterias,
      tareasCompletadas,
      tareasPendientes,
      tareasVencidas,
      totalTareas,
      progresoGeneral
    };
  }, [grades, tasks]);

  // Progreso por materia
  const progressByMateria = useMemo(() => {
    return grades.map(materia => {
      const tareasMateria = tasks.filter(t => t.materia === materia.materia);
      const completadas = tareasMateria.filter(t => t.estado === 'calificado' || t.estado === 'entregado').length;
      const total = tareasMateria.length;
      const progresoTareas = total > 0 ? Math.round((completadas / total) * 100) : 100;

      // Calcular promedio de calificaciones de tareas
      const tareasConNota = tareasMateria.filter(t => t.nota !== undefined);
      const promedioTareas = tareasConNota.length > 0
        ? Math.round(tareasConNota.reduce((sum, t) => sum + (t.nota || 0), 0) / tareasConNota.length)
        : null;

      return {
        nombre: materia.materia,
        docente: materia.docente,
        promedioNotas: materia.promedioAnual,
        promedioTareas,
        progresoTareas,
        completadas,
        total,
        aprobado: materia.aprobado
      };
    });
  }, [grades, tasks]);

  // Próximas entregas
  const proximasEntregas = useMemo(() => {
    const hoy = new Date();
    return tasks
      .filter(t => t.estado === 'pendiente' && new Date(t.fecha_entrega) >= hoy)
      .sort((a, b) => new Date(a.fecha_entrega).getTime() - new Date(b.fecha_entrega).getTime())
      .slice(0, 5);
  }, [tasks]);

  // Compartir progreso
  const compartirProgreso = () => {
    const mensaje = `📊 Progreso de ${childInfo?.nombres || 'mi hijo(a)'}:
    
📚 Promedio General: ${stats.promedioGeneral}%
✅ Tareas Completadas: ${stats.tareasCompletadas}/${stats.totalTareas}
📅 Asistencia: ${attendanceStats?.porcentajeAsistencia || 0}%`;
    
    if (navigator.share) {
      navigator.share({ title: 'Progreso Escolar', text: mensaje });
    } else {
      navigator.clipboard.writeText(mensaje);
      toast({
        title: "Copiado",
        description: "Resumen copiado al portapapeles",
      });
    }
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-28" />
            <Skeleton className="h-10 w-28" />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
        
        <Card>
          <CardContent className="pt-6">
            <Skeleton className="h-60 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <TrendingUp className="h-8 w-8 text-primary" />
            Progreso Académico
          </h1>
          <p className="text-muted-foreground">
            Seguimiento de {childInfo ? `${childInfo.nombres} ${childInfo.apellidos}` : 'mi hijo(a)'} - {childInfo?.curso} "{childInfo?.paralelo}"
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
          <Button variant="outline" onClick={compartirProgreso}>
            <Share2 className="h-4 w-4 mr-2" />
            Compartir
          </Button>
        </div>
      </div>

      {/* Estadísticas generales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-muted-foreground">Promedio General</p>
                <p className="text-3xl font-bold">{stats.promedioGeneral}</p>
                <p className="text-xs text-muted-foreground mt-1">de 100 puntos</p>
              </div>
              <div className={`p-2 rounded-full ${stats.promedioGeneral >= 51 ? 'bg-green-100' : 'bg-red-100'}`}>
                <Award className={`h-5 w-5 ${stats.promedioGeneral >= 51 ? 'text-green-600' : 'text-red-600'}`} />
              </div>
            </div>
            <Progress value={stats.promedioGeneral} className="mt-3" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-muted-foreground">Asistencia</p>
                <p className="text-3xl font-bold">{attendanceStats?.porcentajeAsistencia || 0}%</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {attendanceStats?.presentes || 0} de {attendanceStats?.totalClases || 0} clases
                </p>
              </div>
              <div className="p-2 bg-blue-100 rounded-full">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <Progress value={attendanceStats?.porcentajeAsistencia || 0} className="mt-3" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-muted-foreground">Tareas Completadas</p>
                <p className="text-3xl font-bold">{stats.tareasCompletadas}</p>
                <p className="text-xs text-muted-foreground mt-1">de {stats.totalTareas} tareas</p>
              </div>
              <div className="p-2 bg-green-100 rounded-full">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
            </div>
            <Progress value={stats.progresoGeneral} className="mt-3" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-muted-foreground">Materias Aprobadas</p>
                <p className="text-3xl font-bold">{stats.materiasAprobadas}</p>
                <p className="text-xs text-muted-foreground mt-1">de {stats.totalMaterias} materias</p>
              </div>
              <div className="p-2 bg-purple-100 rounded-full">
                <BookOpen className="h-5 w-5 text-purple-600" />
              </div>
            </div>
            <Progress 
              value={stats.totalMaterias > 0 ? (stats.materiasAprobadas / stats.totalMaterias) * 100 : 0} 
              className="mt-3" 
            />
          </CardContent>
        </Card>
      </div>

      {/* Alertas */}
      {(stats.tareasVencidas > 0 || stats.tareasPendientes > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stats.tareasVencidas > 0 && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="pt-4 flex items-center gap-3">
                <AlertCircle className="h-6 w-6 text-red-600" />
                <div>
                  <p className="font-medium text-red-800">Tareas Vencidas</p>
                  <p className="text-sm text-red-600">
                    Hay {stats.tareasVencidas} tarea(s) que no se entregaron a tiempo
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
          {stats.tareasPendientes > 0 && (
            <Card className="border-yellow-200 bg-yellow-50">
              <CardContent className="pt-4 flex items-center gap-3">
                <Clock className="h-6 w-6 text-yellow-600" />
                <div>
                  <p className="font-medium text-yellow-800">Tareas Pendientes</p>
                  <p className="text-sm text-yellow-600">
                    Hay {stats.tareasPendientes} tarea(s) por entregar
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Progreso por materia */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Progreso por Materia
          </CardTitle>
          <CardDescription>
            Rendimiento detallado en cada materia
          </CardDescription>
        </CardHeader>
        <CardContent>
          {progressByMateria.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay datos de materias disponibles</p>
            </div>
          ) : (
            <div className="space-y-4">
              {progressByMateria.map((materia, index) => (
                <div key={index} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{materia.nombre}</h4>
                        <Badge variant={materia.aprobado ? 'default' : 'destructive'}>
                          {materia.aprobado ? 'Aprobado' : 'En riesgo'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{materia.docente}</p>
                    </div>
                    
                    <div className="flex items-center gap-6 text-sm">
                      <div className="text-center">
                        <p className="text-muted-foreground">Promedio</p>
                        <p className={`text-xl font-bold ${materia.promedioNotas >= 51 ? 'text-green-600' : 'text-red-600'}`}>
                          {materia.promedioNotas}
                        </p>
                      </div>
                      
                      <div className="text-center">
                        <p className="text-muted-foreground">Tareas</p>
                        <p className="text-xl font-bold">
                          {materia.completadas}/{materia.total}
                        </p>
                      </div>
                      
                      <div className="w-24">
                        <p className="text-muted-foreground text-center mb-1">{materia.progresoTareas}%</p>
                        <Progress value={materia.progresoTareas} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Próximas entregas */}
      {proximasEntregas.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Próximas Entregas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {proximasEntregas.map(tarea => (
                <div key={tarea.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium">{tarea.titulo}</p>
                    <p className="text-sm text-muted-foreground">{tarea.materia}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant={
                      new Date(tarea.fecha_entrega).getTime() - Date.now() < 86400000 * 2
                        ? 'destructive' 
                        : 'secondary'
                    }>
                      {new Date(tarea.fecha_entrega).toLocaleDateString('es-ES', {
                        day: 'numeric',
                        month: 'short'
                      })}
                    </Badge>
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
