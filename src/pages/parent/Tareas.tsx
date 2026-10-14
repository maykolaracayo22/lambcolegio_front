// src/pages/parent/Tareas.tsx
// CONECTADO AL BACKEND - Consume API real
import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import {
  Search, Filter, Download, Calendar, Clock, CheckCircle,
  AlertCircle, FileText, BookOpen, User, ChevronDown, ChevronUp,
  Eye, AlarmClockOff, RefreshCw
} from 'lucide-react';
import { getChildTasks, getChildInfo, ChildTask } from '@/services/parentPortalApi';

export default function Tareas() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tareas, setTareas] = useState<ChildTask[]>([]);
  
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');
  const [filtroMateria, setFiltroMateria] = useState<string>('todas');
  const [filtroPrioridad, setFiltroPrioridad] = useState<string>('todas');
  const [busqueda, setBusqueda] = useState<string>('');
  const [tareaExpandida, setTareaExpandida] = useState<number | null>(null);

  // Info del estudiante
  const childInfo = getChildInfo();

  // Cargar tareas desde el backend
  const fetchTasks = async (showToast = false) => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      if (showToast) setRefreshing(true);
      
      const data = await getChildTasks();
      setTareas(data);

      if (showToast) {
        toast({
          title: "Tareas actualizadas",
          description: "Se han cargado las tareas más recientes",
        });
      }
    } catch (error) {
      console.error('Error cargando tareas:', error);
      if (showToast) {
        toast({
          title: "Error",
          description: "No se pudieron cargar las tareas",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      fetchTasks();
    } else {
      const timer = setTimeout(() => fetchTasks(), 500);
      return () => clearTimeout(timer);
    }
  }, []);

  // Obtener materias únicas
  const materiasUnicas = useMemo(() => {
    const materias = new Set(tareas.map(t => t.materia));
    return Array.from(materias);
  }, [tareas]);

  // Estadísticas
  const estadisticas = useMemo(() => ({
    total: tareas.length,
    pendientes: tareas.filter(t => t.estado === 'pendiente').length,
    completadas: tareas.filter(t => t.estado === 'entregado' || t.estado === 'calificado').length,
    atrasadas: tareas.filter(t => t.estado === 'vencido').length,
    prioridadAlta: tareas.filter(t => t.prioridad === 'alta' && t.estado === 'pendiente').length
  }), [tareas]);

  // Filtrar tareas
  const tareasFiltradas = useMemo(() => {
    return tareas.filter(tarea => {
      const estadoMap: Record<string, ChildTask['estado'][]> = {
        'pendiente': ['pendiente'],
        'completado': ['entregado', 'calificado'],
        'atrasado': ['vencido']
      };
      
      const coincideEstado = filtroEstado === 'todos' || 
        (estadoMap[filtroEstado]?.includes(tarea.estado));
      const coincideMateria = filtroMateria === 'todas' || tarea.materia === filtroMateria;
      const coincidePrioridad = filtroPrioridad === 'todas' || tarea.prioridad === filtroPrioridad;
      const coincideBusqueda = 
        tarea.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
        (tarea.descripcion?.toLowerCase().includes(busqueda.toLowerCase()) || false) ||
        tarea.materia.toLowerCase().includes(busqueda.toLowerCase()) ||
        tarea.docente.toLowerCase().includes(busqueda.toLowerCase());

      return coincideEstado && coincideMateria && coincidePrioridad && coincideBusqueda;
    });
  }, [tareas, filtroEstado, filtroMateria, filtroPrioridad, busqueda]);

  const getColorEstado = (estado: ChildTask['estado']) => {
    switch (estado) {
      case 'calificado': return 'text-emerald-600 bg-emerald-100';
      case 'entregado': return 'text-blue-600 bg-blue-100';
      case 'pendiente': return 'text-yellow-600 bg-yellow-100';
      case 'vencido': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getIconoEstado = (estado: ChildTask['estado']) => {
    switch (estado) {
      case 'calificado': return <CheckCircle className="h-4 w-4" />;
      case 'entregado': return <Clock className="h-4 w-4" />;
      case 'pendiente': return <Clock className="h-4 w-4" />;
      case 'vencido': return <AlertCircle className="h-4 w-4" />;
      default: return null;
    }
  };

  const getLabelEstado = (estado: ChildTask['estado']) => {
    switch (estado) {
      case 'calificado': return 'Calificada';
      case 'entregado': return 'Entregada';
      case 'pendiente': return 'Pendiente';
      case 'vencido': return 'Atrasada';
      default: return estado;
    }
  };

  const getVariantPrioridad = (prioridad: ChildTask['prioridad']) => {
    switch (prioridad) {
      case 'alta': return 'destructive';
      case 'media': return 'secondary';
      case 'baja': return 'outline';
      default: return 'default';
    }
  };

  const formatFecha = (fechaStr: string) => {
    const date = new Date(fechaStr);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const diasRestantes = (fechaEntregaStr: string) => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const entrega = new Date(fechaEntregaStr);
    entrega.setHours(0, 0, 0, 0);
    const diffTime = entrega.getTime() - hoy.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  if (loading) {
    return (
      <div className="space-y-6 p-4">
        <div className="flex justify-between items-center">
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-6 w-24 mb-2" />
                <Skeleton className="h-10 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-6 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Tareas y Proyectos</h1>
          <p className="text-muted-foreground">
            {childInfo 
              ? `Gestión de tareas de ${childInfo.nombres} ${childInfo.apellidos}`
              : 'Gestión de tareas asignadas'
            }
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={() => fetchTasks(true)}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Descargar Reporte
          </Button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Tareas</p>
              <p className="text-2xl font-bold">{estadisticas.total}</p>
            </div>
            <FileText className="h-6 w-6 text-gray-500" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Pendientes</p>
              <p className="text-2xl font-bold text-yellow-600">{estadisticas.pendientes}</p>
            </div>
            <Clock className="h-6 w-6 text-yellow-500" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Completadas</p>
              <p className="text-2xl font-bold text-emerald-600">{estadisticas.completadas}</p>
            </div>
            <CheckCircle className="h-6 w-6 text-emerald-500" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Atrasadas</p>
              <p className="text-2xl font-bold text-red-600">{estadisticas.atrasadas}</p>
            </div>
            <AlarmClockOff className="h-6 w-6 text-red-500" />
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar tarea..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={filtroEstado} onValueChange={setFiltroEstado}>
              <SelectTrigger className="w-full md:w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los estados</SelectItem>
                <SelectItem value="pendiente">Pendientes</SelectItem>
                <SelectItem value="completado">Completadas</SelectItem>
                <SelectItem value="atrasado">Atrasadas</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filtroMateria} onValueChange={setFiltroMateria}>
              <SelectTrigger className="w-full md:w-[180px]">
                <BookOpen className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Materia" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas las materias</SelectItem>
                {materiasUnicas.map(materia => (
                  <SelectItem key={materia} value={materia}>{materia}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filtroPrioridad} onValueChange={setFiltroPrioridad}>
              <SelectTrigger className="w-full md:w-[180px]">
                <AlertCircle className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Prioridad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas las prioridades</SelectItem>
                <SelectItem value="alta">Alta</SelectItem>
                <SelectItem value="media">Media</SelectItem>
                <SelectItem value="baja">Baja</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Tareas */}
      {tareasFiltradas.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">Sin tareas</h3>
            <p className="text-muted-foreground">
              {tareas.length === 0 
                ? 'No hay tareas asignadas aún.'
                : 'No hay tareas que coincidan con los filtros.'
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {tareasFiltradas.map(tarea => {
            const dias = diasRestantes(tarea.fecha_entrega);
            const isExpandida = tareaExpandida === tarea.id;
            
            return (
              <Card 
                key={tarea.id} 
                className={`cursor-pointer transition-all hover:shadow-md ${
                  tarea.estado === 'vencido' ? 'border-red-300' : ''
                }`}
                onClick={() => setTareaExpandida(isExpandida ? null : tarea.id)}
              >
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">{tarea.titulo}</h3>
                        <Badge className={getColorEstado(tarea.estado)}>
                          {getIconoEstado(tarea.estado)}
                          <span className="ml-1">{getLabelEstado(tarea.estado)}</span>
                        </Badge>
                        <Badge variant={getVariantPrioridad(tarea.prioridad) as any}>
                          {tarea.prioridad}
                        </Badge>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <BookOpen className="h-4 w-4" />
                          {tarea.materia}
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          {tarea.docente}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Entrega: {formatFecha(tarea.fecha_entrega)}
                        </span>
                        {tarea.estado === 'pendiente' && dias >= 0 && (
                          <span className={`flex items-center gap-1 ${dias <= 2 ? 'text-red-500' : ''}`}>
                            <Clock className="h-4 w-4" />
                            {dias === 0 ? 'Hoy' : dias === 1 ? 'Mañana' : `${dias} días`}
                          </span>
                        )}
                        {tarea.nota !== undefined && (
                          <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                            Nota: {tarea.nota}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {isExpandida ? (
                        <ChevronUp className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                  </div>

                  {isExpandida && (
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-sm text-muted-foreground mb-4">
                        {tarea.descripcion || 'Sin descripción disponible.'}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 mr-1" />
                          Ver detalles
                        </Button>
                        {tarea.estado === 'pendiente' && (
                          <Button size="sm" variant="default">
                            Marcar como entregada
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
