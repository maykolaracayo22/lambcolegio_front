// src/pages/teacher/Tareas.tsx
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

// Importaciones de iconos
import {
  ClipboardList, BookOpen, User, Plus, Search, Filter, Calendar,
  SquarePen, Eye, ArrowRight, CheckCircle, AlertCircle, Hourglass,
  Users, Download, Upload, FileText, Clock, CheckSquare, XCircle,
  Send, Star, CalendarDays, Bookmark
} from 'lucide-react';

// --- Tipos de Datos ---
interface Alumno {
  id: number;
  nombre: string;
  apellido: string;
  grado: string;
  grupo: string;
  avatar?: string;
}

interface MateriaDocente {
  id: number;
  nombre: string;
  grado: string;
  grupo: string;
  docenteId: number;
}

interface TareaDetalle {
  id: number;
  materiaId: number;
  titulo: string;
  descripcion: string;
  fechaAsignacion: string;
  fechaEntrega: string;
  ponderacion: number;
  tipo: 'tarea' | 'examen' | 'proyecto';
  estado?: 'abierta' | 'cerrada';
  instrucciones?: string;
  archivosAdjuntos?: string[];
}

interface EntregaTarea {
  id: number;
  tareaId: number;
  alumnoId: number;
  fechaEntregaReal?: string;
  fechaCalificacion?: string;
  calificacion?: number;
  comentarios?: string;
  archivos?: string[];
  estado: 'entregado' | 'pendiente' | 'atrasado' | 'calificado';
  retroalimentacion?: string;
}

interface EntregaDetalle extends EntregaTarea {
  alumno: Alumno;
  tarea: TareaDetalle;
}

export default function TeacherTareas() {
  const [selectedMateriaGrupo, setSelectedMateriaGrupo] = useState<string>('1-A');
  const [filtroEstadoTarea, setFiltroEstadoTarea] = useState<string>('todos');
  const [busquedaTarea, setBusquedaTarea] = useState<string>('');
  const [tareaSeleccionada, setTareaSeleccionada] = useState<TareaDetalle | null>(null);
  const [modalEntregasAbierto, setModalEntregasAbierto] = useState(false);
  const [calificacionEditando, setCalificacionEditando] = useState<{ [key: number]: number }>({});
  const [comentariosEditando, setComentariosEditando] = useState<{ [key: number]: string }>({});
  const [filtroEstadoEntrega, setFiltroEstadoEntrega] = useState<string>('todos');

  // --- Datos de Ejemplo ---
  const alumnos: Alumno[] = useMemo(() => [
    { id: 101, nombre: 'Ana', apellido: 'Gómez', grado: '1', grupo: 'A' },
    { id: 102, nombre: 'Carlos', apellido: 'Ruiz', grado: '1', grupo: 'A' },
    { id: 103, nombre: 'Sofía', apellido: 'Martínez', grado: '1', grupo: 'A' },
    { id: 104, nombre: 'Juan', apellido: 'Pérez', grado: '1', grupo: 'A' },
    { id: 105, nombre: 'María', apellido: 'López', grado: '1', grupo: 'B' },
    { id: 106, nombre: 'Pedro', apellido: 'Sánchez', grado: '1', grupo: 'B' },
  ], []);

  const materiasDocente: MateriaDocente[] = useMemo(() => [
    { id: 1, nombre: 'Matemáticas', grado: '1', grupo: 'A', docenteId: 1 },
    { id: 2, nombre: 'Física', grado: '1', grupo: 'A', docenteId: 1 },
    { id: 3, nombre: 'Matemáticas', grado: '1', grupo: 'B', docenteId: 1 },
    { id: 4, nombre: 'Introducción a la Programación', grado: '2', grupo: 'C', docenteId: 1 },
  ], []);

  const tareas: TareaDetalle[] = useMemo(() => [
    {
      id: 1, materiaId: 1, titulo: 'Guía de Álgebra', 
      descripcion: 'Resolver ejercicios de álgebra lineal del capítulo 3.',
      fechaAsignacion: '2024-01-10', fechaEntrega: '2024-01-20', 
      ponderacion: 20, tipo: 'tarea', estado: 'cerrada',
      instrucciones: 'Resolver todos los ejercicios impares del capítulo 3. Mostrar procedimiento completo.',
      archivosAdjuntos: ['guia-algebra.pdf', 'ejemplos-solucion.docx']
    },
    {
      id: 2, materiaId: 1, titulo: 'Examen Unidad 1', 
      descripcion: 'Evaluación de los temas de la primera unidad.',
      fechaAsignacion: '2024-01-15', fechaEntrega: '2024-01-25', 
      ponderacion: 40, tipo: 'examen', estado: 'cerrada'
    },
    {
      id: 3, materiaId: 1, titulo: 'Proyecto Final', 
      descripcion: 'Desarrollar un proyecto aplicando los conceptos de todo el curso.',
      fechaAsignacion: '2024-02-01', fechaEntrega: '2024-02-15', 
      ponderacion: 40, tipo: 'proyecto', estado: 'abierta',
      instrucciones: 'Desarrollar una aplicación que resuelva un problema real usando los conceptos aprendidos.'
    },
  ], []);

  const entregas: EntregaTarea[] = useMemo(() => [
    { id: 1, tareaId: 1, alumnoId: 101, fechaEntregaReal: '2024-01-19', 
      calificacion: 85, estado: 'calificado', comentarios: 'Excelente trabajo, procedimiento claro.',
      archivos: ['ana-gomez-algebra.pdf'], retroalimentacion: 'Muy buen desarrollo en los ejercicios 3 y 5.' },
    { id: 2, tareaId: 1, alumnoId: 102, fechaEntregaReal: '2024-01-20', 
      calificacion: 70, estado: 'calificado', comentarios: 'Bien, pero falta desarrollar algunos pasos.',
      archivos: ['carlos-ruiz-algebra.docx'] },
    { id: 3, tareaId: 1, alumnoId: 103, estado: 'pendiente' },
    { id: 4, tareaId: 1, alumnoId: 104, fechaEntregaReal: '2024-01-18', 
      calificacion: 92, estado: 'calificado', comentarios: 'Excelente, muy detallado.',
      archivos: ['juan-perez-algebra.zip'], retroalimentacion: 'Perfecto en todos los ejercicios.' },

    { id: 5, tareaId: 2, alumnoId: 101, fechaEntregaReal: '2024-01-24', 
      calificacion: 90, estado: 'calificado', archivos: ['ana-gomez-examen.pdf'] },
    { id: 6, tareaId: 2, alumnoId: 102, fechaEntregaReal: '2024-01-25', 
      calificacion: 75, estado: 'calificado', archivos: ['carlos-ruiz-examen.docx'] },
    { id: 7, tareaId: 2, alumnoId: 103, fechaEntregaReal: '2024-01-26', 
      calificacion: 60, estado: 'atrasado', comentarios: 'Entregado fuera de plazo.',
      archivos: ['sofia-martinez-examen.pdf'] },
    { id: 8, tareaId: 2, alumnoId: 104, fechaEntregaReal: '2024-01-24', 
      calificacion: 88, estado: 'calificado', archivos: ['juan-perez-examen.zip'] },

    { id: 9, tareaId: 3, alumnoId: 101, estado: 'pendiente' },
    { id: 10, tareaId: 3, alumnoId: 102, estado: 'pendiente' },
    { id: 11, tareaId: 3, alumnoId: 103, estado: 'pendiente' },
    { id: 12, tareaId: 3, alumnoId: 104, estado: 'pendiente' },
  ], []);

  // --- Lógica de filtrado ---
  const currentMateria = useMemo(() => {
    const [grado, grupo] = selectedMateriaGrupo.split('-');
    return materiasDocente.find(m => m.grado === grado && m.grupo === grupo);
  }, [selectedMateriaGrupo, materiasDocente]);

  const alumnosInCurrentGroup = useMemo(() => {
    if (!currentMateria) return [];
    return alumnos.filter(a => a.grado === currentMateria.grado && a.grupo === currentMateria.grupo);
  }, [alumnos, currentMateria]);

  const tareasForCurrentMateria = useMemo(() => {
    if (!currentMateria) return [];
    
    const today = new Date();
    today.setHours(0,0,0,0);

    return tareas.filter(t => t.materiaId === currentMateria.id)
      .map(tarea => {
        const entregasDeTarea = entregas.filter(e => e.tareaId === tarea.id && 
          alumnosInCurrentGroup.some(a => a.id === e.alumnoId));
        const totalAlumnos = alumnosInCurrentGroup.length;
        const alumnosEntregaron = entregasDeTarea.filter(e => 
          e.estado === 'entregado' || e.estado === 'atrasado' || e.estado === 'calificado').length;
        const alumnosPendientes = totalAlumnos - alumnosEntregaron;
        const porcentajeEntregas = totalAlumnos > 0 ? Math.round((alumnosEntregaron / totalAlumnos) * 100) : 0;

        let estadoDisplay: 'activa' | 'pasada' | 'futura';
        const fechaEntrega = new Date(tarea.fechaEntrega);
        fechaEntrega.setHours(23,59,59,999);

        if (fechaEntrega < today) {
          estadoDisplay = 'pasada';
        } else {
          estadoDisplay = 'activa';
        }

        return {
          ...tarea,
          totalAlumnos,
          alumnosEntregaron,
          alumnosPendientes,
          porcentajeEntregas,
          estadoDisplay
        };
      })
      .filter(tarea => {
        const coincideBusqueda = tarea.titulo.toLowerCase().includes(busquedaTarea.toLowerCase()) ||
                                 tarea.descripcion.toLowerCase().includes(busquedaTarea.toLowerCase());
        const coincideEstado = filtroEstadoTarea === 'todos' ||
                               (filtroEstadoTarea === 'activa' && tarea.estadoDisplay === 'activa') ||
                               (filtroEstadoTarea === 'pasada' && tarea.estadoDisplay === 'pasada') ||
                               (filtroEstadoTarea === 'pendiente' && tarea.alumnosPendientes > 0);
        return coincideBusqueda && coincideEstado;
      })
      .sort((a, b) => new Date(b.fechaAsignacion).getTime() - new Date(a.fechaAsignacion).getTime());
  }, [tareas, currentMateria, alumnosInCurrentGroup, entregas, filtroEstadoTarea, busquedaTarea]);

  // --- Funciones para el Modal de Entregas ---
  const abrirModalEntregas = (tarea: TareaDetalle) => {
    setTareaSeleccionada(tarea);
    setModalEntregasAbierto(true);
    
    // Inicializar estados de edición
    const entregasTarea = obtenerEntregasDetalladas(tarea.id);
    const nuevasCalificaciones: { [key: number]: number } = {};
    const nuevosComentarios: { [key: number]: string } = {};
    
    entregasTarea.forEach(entrega => {
      if (entrega.calificacion !== undefined) {
        nuevasCalificaciones[entrega.id] = entrega.calificacion;
      }
      if (entrega.comentarios) {
        nuevosComentarios[entrega.id] = entrega.comentarios;
      }
    });
    
    setCalificacionEditando(nuevasCalificaciones);
    setComentariosEditando(nuevosComentarios);
  };

  const obtenerEntregasDetalladas = (tareaId: number): EntregaDetalle[] => {
    return entregas
      .filter(entrega => entrega.tareaId === tareaId)
      .map(entrega => {
        const alumno = alumnos.find(a => a.id === entrega.alumnoId);
        const tarea = tareas.find(t => t.id === tareaId);
        return {
          ...entrega,
          alumno: alumno!,
          tarea: tarea!
        };
      })
      .filter(entrega => entrega.alumno && entrega.tarea);
  };

  const entregasFiltradas = useMemo(() => {
    if (!tareaSeleccionada) return [];
    
    let entregas = obtenerEntregasDetalladas(tareaSeleccionada.id);
    
    // Aplicar filtro por estado
    if (filtroEstadoEntrega !== 'todos') {
      entregas = entregas.filter(entrega => {
        switch (filtroEstadoEntrega) {
          case 'entregado': return entrega.estado === 'entregado' || entrega.estado === 'calificado';
          case 'pendiente': return entrega.estado === 'pendiente';
          case 'atrasado': return entrega.estado === 'atrasado';
          default: return true;
        }
      });
    }
    
    return entregas;
  }, [tareaSeleccionada, filtroEstadoEntrega, entregas, alumnos, tareas]);

  const handleCalificar = (entregaId: number) => {
    const calificacion = calificacionEditando[entregaId];
    const comentarios = comentariosEditando[entregaId] || '';
    
    if (calificacion !== undefined && calificacion >= 0 && calificacion <= 100) {
      // En una aplicación real, aquí harías una llamada a la API
      console.log(`Calificando entrega ${entregaId}: ${calificacion} - ${comentarios}`);
      
      // Simular actualización
      const entregaIndex = entregas.findIndex(e => e.id === entregaId);
      if (entregaIndex !== -1) {
        // Esto es solo para demostración - en realidad necesitarías manejar el estado global
        console.log('Entrega calificada exitosamente');
      }
    } else {
      console.error('Calificación inválida');
    }
  };

  const handleDescargarTodo = () => {
    if (!tareaSeleccionada) return;
    
    // Simular descarga de todas las entregas
    console.log(`Descargando todas las entregas de: ${tareaSeleccionada.titulo}`);
    // En una aplicación real, aquí harías una llamada a la API para generar un ZIP
  };

  // --- Funciones auxiliares ---
  const formatFecha = (fechaStr: string) => {
    if (!fechaStr) return 'N/A';
    const [year, month, day] = fechaStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'entregado':
      case 'calificado':
        return <Badge variant="default" className="bg-emerald-100 text-emerald-800"><CheckCircle className="h-3 w-3 mr-1" /> Entregado</Badge>;
      case 'pendiente':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" /> Pendiente</Badge>;
      case 'atrasado':
        return <Badge variant="destructive"><AlertCircle className="h-3 w-3 mr-1" /> Atrasado</Badge>;
      default:
        return <Badge variant="outline">{estado}</Badge>;
    }
  };

  const getColorCalificacion = (calificacion?: number) => {
    if (!calificacion) return 'text-gray-500';
    if (calificacion >= 90) return 'text-emerald-600 font-bold';
    if (calificacion >= 70) return 'text-blue-600';
    if (calificacion >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6 p-4">
      {/* Header (se mantiene igual) */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <ClipboardList className="h-7 w-7 text-academic-blue-500" />
            Gestión de Tareas
          </h1>
          <p className="text-muted-foreground">
            Crea, asigna y revisa el progreso de las tareas para tus grupos.
          </p>
        </div>
        <Button variant="academic" className="bg-academic-blue-500 hover:bg-academic-blue-600">
          <Plus className="h-4 w-4 mr-2" />
          Crear Nueva Tarea
        </Button>
      </div>

      {/* Filtros (se mantiene igual) */}
      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <Label htmlFor="select-materia-grupo" className="flex-shrink-0 text-sm font-medium flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-muted-foreground" />
              Seleccionar Materia/Grupo:
            </Label>
            <Select value={selectedMateriaGrupo} onValueChange={setSelectedMateriaGrupo}>
              <SelectTrigger id="select-materia-grupo" className="w-full md:w-[250px]">
                <SelectValue placeholder="Materia y Grupo" />
              </SelectTrigger>
              <SelectContent>
                {materiasDocente.map(materia => (
                  <SelectItem key={`${materia.id}-${materia.grupo}`} value={`${materia.grado}-${materia.grupo}`}>
                    {materia.nombre} ({materia.grado}° {materia.grupo})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
            <div className="flex-1 relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar por título o descripción..."
                className="pl-10"
                value={busquedaTarea}
                onChange={(e) => setBusquedaTarea(e.target.value)}
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
              <Select value={filtroEstadoTarea} onValueChange={setFiltroEstadoTarea}>
                <SelectTrigger className="w-full sm:w-[150px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Estado de la Tarea" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todas</SelectItem>
                  <SelectItem value="activa">Activas</SelectItem>
                  <SelectItem value="pasada">Pasadas</SelectItem>
                  <SelectItem value="pendiente">Con Pendientes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Tareas (modificado el botón Ver Entregas) */}
      {currentMateria ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-6 w-6 text-academic-blue-500" />
              Tareas de {currentMateria.nombre} ({currentMateria.grado}° {currentMateria.grupo})
            </CardTitle>
            <CardDescription>
              Un total de {tareasForCurrentMateria.length} tareas encontradas.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {tareasForCurrentMateria.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <ClipboardList className="h-12 w-12 mx-auto mb-4" />
                <p>No hay tareas asignadas o no se encontraron con los filtros aplicados.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {tareasForCurrentMateria.map(tarea => (
                  <div key={tarea.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 mb-3">
                      <div className="flex items-start space-x-3 flex-grow">
                        {tarea.estadoDisplay === 'activa' && <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-1" />}
                        {tarea.estadoDisplay === 'pasada' && <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-1" />}

                        <div className="flex-grow">
                          <h3 className="font-semibold text-lg text-foreground mb-1">{tarea.titulo}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2">{tarea.descripcion}</p>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground mt-2">
                            <Badge variant="secondary">
                              <Calendar className="h-3 w-3 mr-1" /> Asignada: {formatFecha(tarea.fechaAsignacion)}
                            </Badge>
                            <Badge variant={tarea.estadoDisplay === 'pasada' ? 'destructive' : 'outline'}>
                              <Calendar className="h-3 w-3 mr-1" /> Entrega: {formatFecha(tarea.fechaEntrega)}
                            </Badge>
                            <Badge variant="default" className="bg-gray-200 text-gray-800">
                              <BookOpen className="h-3 w-3 mr-1" /> Tipo: {tarea.tipo.charAt(0).toUpperCase() + tarea.tipo.slice(1)}
                            </Badge>
                            <Badge variant="default" className="bg-blue-100 text-blue-800">
                              <Bookmark className="h-3 w-3 mr-1" /> Ponderación: {tarea.ponderacion}%
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex-shrink-0 flex items-center gap-2 mt-2 md:mt-0">
                         {tarea.estadoDisplay === 'activa' ? (
                           <Badge variant="default" className="bg-emerald-100 text-emerald-800">Activa</Badge>
                         ) : (
                           <Badge variant="destructive">Cerrada</Badge>
                         )}
                      </div>
                    </div>

                    <Separator className="my-3" />

                    <div className="flex flex-col md:flex-row items-center justify-between gap-3">
                        <div className="flex-grow">
                            <div className="flex justify-between text-xs text-muted-foreground mb-1">
                                <span className="flex items-center gap-1"><Users className="h-3 w-3" /> Entregas:</span>
                                <span>{tarea.alumnosEntregaron} de {tarea.totalAlumnos}</span>
                            </div>
                            <Progress value={tarea.porcentajeEntregas} className="h-2" />
                        </div>
                        <div className="flex flex-shrink-0 gap-2 mt-3 md:mt-0">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => abrirModalEntregas(tarea)}
                            >
                                <Eye className="h-4 w-4 mr-2" />
                                Ver Entregas ({tarea.alumnosEntregaron}/{tarea.totalAlumnos})
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                            >
                                <SquarePen className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card className="text-center py-12 text-muted-foreground">
          <BookOpen className="h-16 w-16 mx-auto mb-4 text-academic-blue-500" />
          <p className="text-lg font-medium">Selecciona una materia y grupo para gestionar sus tareas.</p>
          <p className="mt-2 text-sm">Usa el selector de arriba para comenzar.</p>
        </Card>
      )}

      {/* Modal de Entregas */}
      <Dialog open={modalEntregasAbierto} onOpenChange={setModalEntregasAbierto}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <ClipboardList className="h-6 w-6 text-academic-blue-500" />
              {tareaSeleccionada?.titulo} - Entregas de Estudiantes
            </DialogTitle>
            <DialogDescription>
              Revisa y califica las entregas de los estudiantes para esta tarea.
              {tareaSeleccionada && (
                <div className="mt-2 space-y-1 text-sm">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4" />
                    <span>Fecha de entrega: {formatFecha(tareaSeleccionada.fechaEntrega)}</span>
                  </div>
                  {tareaSeleccionada.instrucciones && (
                    <div className="flex items-start gap-2">
                      <FileText className="h-4 w-4 mt-0.5" />
                      <span>Instrucciones: {tareaSeleccionada.instrucciones}</span>
                    </div>
                  )}
                </div>
              )}
            </DialogDescription>
          </DialogHeader>

          {tareaSeleccionada && (
            <div className="space-y-6">
              {/* Header del Modal */}
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 p-4 bg-muted/50 rounded-lg">
                <div className="flex-1">
                  <h3 className="font-semibold">Resumen de Entregas</h3>
                  <div className="flex flex-wrap gap-4 mt-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-green-600" />
                      <span>Entregados: {entregasFiltradas.filter(e => e.estado === 'entregado' || e.estado === 'calificado').length}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-yellow-600" />
                      <span>Pendientes: {entregasFiltradas.filter(e => e.estado === 'pendiente').length}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <span>Atrasados: {entregasFiltradas.filter(e => e.estado === 'atrasado').length}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Select value={filtroEstadoEntrega} onValueChange={setFiltroEstadoEntrega}>
                    <SelectTrigger className="w-[180px]">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Filtrar por estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos los estados</SelectItem>
                      <SelectItem value="entregado">Entregados</SelectItem>
                      <SelectItem value="pendiente">Pendientes</SelectItem>
                      <SelectItem value="atrasado">Atrasados</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" onClick={handleDescargarTodo}>
                    <Download className="h-4 w-4 mr-2" />
                    Descargar Todo
                  </Button>
                </div>
              </div>

              {/* Lista de Entregas */}
              <div className="space-y-4">
                {entregasFiltradas.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4" />
                    <p>No hay entregas que coincidan con el filtro seleccionado.</p>
                  </div>
                ) : (
                  entregasFiltradas.map(entrega => (
                    <Card key={entrega.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
                          {/* Información del Estudiante */}
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="w-10 h-10 bg-academic-blue-100 rounded-full flex items-center justify-center">
                                <User className="h-5 w-5 text-academic-blue-600" />
                              </div>
                              <div>
                                <h4 className="font-semibold text-foreground">
                                  {entrega.alumno.nombre} {entrega.alumno.apellido}
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                  Estudiante • {entrega.alumno.grado}° {entrega.alumno.grupo}
                                </p>
                              </div>
                            </div>

                            {/* Estado y Fechas */}
                            <div className="flex flex-wrap items-center gap-4 text-sm">
                              {getEstadoBadge(entrega.estado)}
                              {entrega.fechaEntregaReal && (
                                <div className="flex items-center gap-1">
                                  <Send className="h-3 w-3 text-muted-foreground" />
                                  <span>Entregado: {formatFecha(entrega.fechaEntregaReal)}</span>
                                </div>
                              )}
                              {entrega.calificacion !== undefined && (
                                <div className="flex items-center gap-1">
                                  <Star className="h-3 w-3 text-yellow-500" />
                                  <span className={`font-medium ${getColorCalificacion(entrega.calificacion)}`}>
                                    Calificación: {entrega.calificacion}/100
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Archivos Adjuntos */}
                            {entrega.archivos && entrega.archivos.length > 0 && (
                              <div className="mt-2">
                                <p className="text-sm font-medium mb-1">Archivos entregados:</p>
                                <div className="flex flex-wrap gap-2">
                                  {entrega.archivos.map((archivo, index) => (
                                    <Badge key={index} variant="outline" className="cursor-pointer hover:bg-muted">
                                      <FileText className="h-3 w-3 mr-1" />
                                      {archivo}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Retroalimentación */}
                            {entrega.retroalimentacion && (
                              <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
                                <p className="font-medium text-blue-800">Retroalimentación:</p>
                                <p className="text-blue-700">{entrega.retroalimentacion}</p>
                              </div>
                            )}
                          </div>

                          {/* Panel de Calificación */}
                          <div className="w-full lg:w-80 space-y-3">
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <Label htmlFor={`calificacion-${entrega.id}`} className="text-sm">
                                  Calificación (0-100)
                                </Label>
                                <Input
                                  id={`calificacion-${entrega.id}`}
                                  type="number"
                                  min="0"
                                  max="100"
                                  value={calificacionEditando[entrega.id] ?? entrega.calificacion ?? ''}
                                  onChange={(e) => setCalificacionEditando(prev => ({
                                    ...prev,
                                    [entrega.id]: parseInt(e.target.value) || 0
                                  }))}
                                  className="w-full"
                                />
                              </div>
                              <div>
                                <Label htmlFor={`estado-${entrega.id}`} className="text-sm">
                                  Estado
                                </Label>
                                <Select 
                                  value={entrega.estado} 
                                  onValueChange={(value) => {
                                    // Aquí iría la lógica para actualizar el estado
                                    console.log(`Cambiando estado de entrega ${entrega.id} a: ${value}`);
                                  }}
                                >
                                  <SelectTrigger className="w-full">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="pendiente">Pendiente</SelectItem>
                                    <SelectItem value="entregado">Entregado</SelectItem>
                                    <SelectItem value="atrasado">Atrasado</SelectItem>
                                    <SelectItem value="calificado">Calificado</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>

                            <div>
                              <Label htmlFor={`comentarios-${entrega.id}`} className="text-sm">
                                Comentarios
                              </Label>
                              <Textarea
                                id={`comentarios-${entrega.id}`}
                                placeholder="Agrega comentarios para el estudiante..."
                                value={comentariosEditando[entrega.id] ?? entrega.comentarios ?? ''}
                                onChange={(e) => setComentariosEditando(prev => ({
                                  ...prev,
                                  [entrega.id]: e.target.value
                                }))}
                                rows={3}
                              />
                            </div>

                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                className="flex-1"
                                onClick={() => handleCalificar(entrega.id)}
                                disabled={!calificacionEditando[entrega.id] && entrega.calificacion === undefined}
                              >
                                <CheckSquare className="h-4 w-4 mr-2" />
                                {entrega.calificacion ? 'Actualizar' : 'Calificar'}
                              </Button>
                              <Button variant="outline" size="sm">
                                <Download className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}