// src/pages/parent/Tareas.tsx
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
  Search,
  Filter,
  Download,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle, // Usado para estado "atrasado"
  FileText, // Usado para total tareas y descripción en empty state
  BookOpen, // Usado para filtro de materia
  User,
  ChevronDown,
  ChevronUp,
  Plus, // No se usa directamente en tu código, pero mantenido
  Eye,
  AlarmClockOff // Nuevo icono para tareas vencidas en estadísticas
} from 'lucide-react';

// Tipos de datos
interface Tarea {
  id: number;
  titulo: string;
  materia: string;
  docente: string;
  fechaAsignacion: string; // Formato 'YYYY-MM-DD'
  fechaEntrega: string;     // Formato 'YYYY-MM-DD'
  estado: 'pendiente' | 'completado' | 'atrasado';
  prioridad: 'alta' | 'media' | 'baja';
  descripcion: string;
  archivosAdjuntos?: number;
  progreso?: number; // 0-100 para tareas pendientes
  calificacion?: number; // 0-100 para tareas completadas
}

interface Materia {
  id: number;
  nombre: string;
  docente: string;
  color: string; // Clases de Tailwind para el color del badge de materia
}

export default function Tareas() {
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');
  const [filtroMateria, setFiltroMateria] = useState<string>('todas');
  const [filtroPrioridad, setFiltroPrioridad] = useState<string>('todas');
  const [busqueda, setBusqueda] = useState<string>('');
  const [tareaExpandida, setTareaExpandida] = useState<number | null>(null);

  // Datos de ejemplo
  const materias: Materia[] = useMemo(() => [
    { id: 1, nombre: 'Matemáticas', docente: 'Prof. García', color: 'bg-indigo-100 text-indigo-800' },
    { id: 2, nombre: 'Español', docente: 'Prof. López', color: 'bg-blue-100 text-blue-800' },
    { id: 3, nombre: 'Ciencias', docente: 'Prof. Martín', color: 'bg-emerald-100 text-emerald-800' },
    { id: 4, nombre: 'Historia', docente: 'Prof. Rodríguez', color: 'bg-purple-100 text-purple-800' },
    { id: 5, nombre: 'Inglés', docente: 'Prof. Smith', color: 'bg-yellow-100 text-yellow-800' }
  ], []);

  const tareas: Tarea[] = useMemo(() => [
    {
      id: 1,
      titulo: 'Ejercicios de álgebra',
      materia: 'Matemáticas',
      docente: 'Prof. García',
      fechaAsignacion: '2024-01-15',
      fechaEntrega: '2024-01-20',
      estado: 'pendiente',
      prioridad: 'alta',
      descripcion: 'Resolver los ejercicios de la página 45 a 48 del libro de texto. Incluir procedimiento completo y mostrar los pasos detallados para cada solución. Presentar en formato PDF.',
      archivosAdjuntos: 2,
      progreso: 75
    },
    {
      id: 2,
      titulo: 'Ensayo sobre literatura contemporánea',
      materia: 'Español',
      docente: 'Prof. López',
      fechaAsignacion: '2024-01-10',
      fechaEntrega: '2024-01-18',
      estado: 'completado',
      prioridad: 'media',
      descripcion: 'Escribir un ensayo de 1000 palabras sobre la influencia de la literatura contemporánea en la sociedad actual. Incluir al menos 3 fuentes bibliográficas.',
      calificacion: 95
    },
    {
      id: 3,
      titulo: 'Proyecto del sistema solar',
      materia: 'Ciencias',
      docente: 'Prof. Martín',
      fechaAsignacion: '2024-01-05',
      fechaEntrega: '2024-01-25',
      estado: 'pendiente',
      prioridad: 'media',
      descripcion: 'Crear una maqueta del sistema solar incluyendo todos los planetas y sus características principales. Se valorará la creatividad y la precisión científica.',
      archivosAdjuntos: 1,
      progreso: 30
    },
    {
      id: 4,
      titulo: 'Investigación sobre la revolución industrial',
      materia: 'Historia',
      docente: 'Prof. Rodríguez',
      fechaAsignacion: '2024-01-08',
      fechaEntrega: '2024-01-12', // Esta fecha ya pasó
      estado: 'atrasado',
      prioridad: 'alta',
      descripcion: 'Investigar sobre las causas y consecuencias de la revolución industrial en Europa, con un enfoque en el impacto social y económico. Se requiere una bibliografía de 5 fuentes.',
      archivosAdjuntos: 3
    },
    {
      id: 5,
      titulo: 'Presentación sobre verbos irregulares',
      materia: 'Inglés',
      docente: 'Prof. Smith',
      fechaAsignacion: '2024-01-12',
      fechaEntrega: '2024-01-19',
      estado: 'pendiente',
      prioridad: 'baja',
      descripcion: 'Preparar una presentación sobre los verbos irregulares en inglés con ejemplos de uso y ejercicios interactivos para la clase.',
      progreso: 90
    },
    {
      id: 6,
      titulo: 'Problemas de física',
      materia: 'Ciencias',
      docente: 'Prof. Martín',
      fechaAsignacion: '2024-01-14',
      fechaEntrega: '2024-01-21',
      estado: 'pendiente',
      prioridad: 'alta',
      descripcion: 'Resolver los problemas de física de las páginas 78-82 sobre cinemática. Mostrar todos los cálculos y unidades.',
      archivosAdjuntos: 1,
      progreso: 50
    },
    {
      id: 7,
      titulo: 'Lectura comprensiva: "Cien años de soledad"',
      materia: 'Español',
      docente: 'Prof. López',
      fechaAsignacion: '2024-01-01',
      fechaEntrega: '2024-01-10', // Esta fecha ya pasó
      estado: 'atrasado',
      prioridad: 'media',
      descripcion: 'Leer el libro "Cien años de soledad" y preparar un resumen crítico de los primeros 5 capítulos. Enfocarse en los personajes principales y el contexto histórico-literario.',
      archivosAdjuntos: 0 // Ejemplo sin adjuntos
    }
  ], []);

  // Estadísticas (usando useMemo para optimización)
  const estadisticas = useMemo(() => ({
    total: tareas.length,
    pendientes: tareas.filter(t => t.estado === 'pendiente').length,
    completadas: tareas.filter(t => t.estado === 'completado').length,
    atrasadas: tareas.filter(t => t.estado === 'atrasado').length,
    prioridadAlta: tareas.filter(t => t.prioridad === 'alta' && t.estado === 'pendiente').length // Solo pendientes de alta prioridad
  }), [tareas]);

  // Filtrar tareas (usando useMemo para optimización)
  const tareasFiltradas = useMemo(() => {
    return tareas.filter(tarea => {
      const coincideEstado = filtroEstado === 'todos' || tarea.estado === filtroEstado;
      const coincideMateria = filtroMateria === 'todas' || tarea.materia === filtroMateria;
      const coincidePrioridad = filtroPrioridad === 'todas' || tarea.prioridad === filtroPrioridad;
      const coincideBusqueda = tarea.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
                               tarea.descripcion.toLowerCase().includes(busqueda.toLowerCase()) ||
                               tarea.materia.toLowerCase().includes(busqueda.toLowerCase()) ||
                               tarea.docente.toLowerCase().includes(busqueda.toLowerCase());

      return coincideEstado && coincideMateria && coincidePrioridad && coincideBusqueda;
    });
  }, [tareas, filtroEstado, filtroMateria, filtroPrioridad, busqueda]);

  const getColorEstado = (estado: Tarea['estado']) => {
    switch (estado) {
      case 'completado': return 'text-emerald-600 bg-emerald-100';
      case 'pendiente': return 'text-blue-600 bg-blue-100';
      case 'atrasado': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getIconoEstado = (estado: Tarea['estado']) => {
    switch (estado) {
      case 'completado': return <CheckCircle className="h-4 w-4" />;
      case 'pendiente': return <Clock className="h-4 w-4" />;
      case 'atrasado': return <AlertCircle className="h-4 w-4" />;
      default: return null;
    }
  };

  const getVariantPrioridadBadge = (prioridad: Tarea['prioridad']) => {
    switch (prioridad) {
      case 'alta': return 'destructive'; // Shadcn variant
      case 'media': return 'secondary'; // Shadcn variant
      case 'baja': return 'outline'; // Shadcn variant
      default: return 'default';
    }
  };

  const getLabelPrioridad = (prioridad: Tarea['prioridad']) => {
    switch (prioridad) {
        case 'alta': return 'Prioridad Alta';
        case 'media': return 'Prioridad Media';
        case 'baja': return 'Prioridad Baja';
        default: return 'Prioridad';
    }
  }

  const formatFecha = (fechaStr: string) => {
    const [year, month, day] = fechaStr.split('-').map(Number);
    const date = new Date(year, month - 1, day); // Month is 0-indexed
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const diasRestantes = (fechaEntregaStr: string) => {
    const hoy = new Date();
    // Normalizar a inicio del día para una comparación justa
    hoy.setHours(0, 0, 0, 0);

    const [year, month, day] = fechaEntregaStr.split('-').map(Number);
    const entrega = new Date(year, month - 1, day);
    entrega.setHours(0, 0, 0, 0);

    const diffTime = entrega.getTime() - hoy.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="space-y-6 p-4"> {/* Añadido p-4 para padding general */}
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Tareas y Proyectos</h1>
          <p className="text-muted-foreground">
            Gestión de tareas asignadas a Juan Pérez Martínez
          </p>
        </div>
        <Button variant="outline" className="bg-academic-blue-500 hover:bg-academic-blue-600 text-white hover:text-white"> {/* Estilo de botón para que no se vea por defecto */}
          <Download className="h-4 w-4 mr-2" />
          Exportar Reporte
        </Button>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Tareas</p>
              <p className="text-2xl font-bold text-foreground">{estadisticas.total}</p>
            </div>
            <div className="p-2 bg-blue-100 rounded-full">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Pendientes</p>
              <p className="text-2xl font-bold text-blue-600">{estadisticas.pendientes}</p>
            </div>
            <div className="p-2 bg-blue-100 rounded-full">
              <Clock className="h-5 w-5 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Completadas</p>
              <p className="text-2xl font-bold text-emerald-600">{estadisticas.completadas}</p>
            </div>
            <div className="p-2 bg-emerald-100 rounded-full">
              <CheckCircle className="h-5 w-5 text-emerald-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Atrasadas</p>
              <p className="text-2xl font-bold text-red-600">{estadisticas.atrasadas}</p>
            </div>
            <div className="p-2 bg-red-100 rounded-full">
              <AlarmClockOff className="h-5 w-5 text-red-600" /> {/* Icono más específico para atrasadas */}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros y búsqueda */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
            <div className="flex-1 relative w-full"> {/* w-full para que ocupe todo el ancho en móviles */}
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar tareas, descripción, materia o docente..."
                className="pl-10"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
              <Select value={filtroEstado} onValueChange={setFiltroEstado}>
                <SelectTrigger className="w-full sm:w-[150px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="pendiente">Pendientes</SelectItem>
                  <SelectItem value="completado">Completadas</SelectItem>
                  <SelectItem value="atrasado">Atrasadas</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filtroMateria} onValueChange={setFiltroMateria}>
                <SelectTrigger className="w-full sm:w-[150px]">
                  <BookOpen className="h-4 w-4 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="Materia" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas las materias</SelectItem>
                  {materias.map(materia => (
                    <SelectItem key={materia.id} value={materia.nombre}>
                      {materia.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filtroPrioridad} onValueChange={setFiltroPrioridad}>
                <SelectTrigger className="w-full sm:w-[150px]">
                  <SelectValue placeholder="Prioridad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas</SelectItem>
                  <SelectItem value="alta">Alta</SelectItem>
                  <SelectItem value="media">Media</SelectItem>
                  <SelectItem value="baja">Baja</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de tareas */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Lista de Tareas</CardTitle>
          <span className="text-sm text-muted-foreground">
            {tareasFiltradas.length} tarea{tareasFiltradas.length !== 1 ? 's' : ''} encontrada{tareasFiltradas.length !== 1 ? 's' : ''}
          </span>
        </CardHeader>
        <CardContent>
          {tareasFiltradas.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No se encontraron tareas con los filtros aplicados.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tareasFiltradas.map((tarea) => (
                <div key={tarea.id} className="border rounded-lg shadow-sm bg-card text-card-foreground"> {/* Usar bg-card para coherencia */}
                  {/* Sección visible de la tarea (siempre visible) */}
                  <div 
                    className="p-4 cursor-pointer hover:bg-muted/50 transition-colors duration-200" 
                    onClick={() => setTareaExpandida(tareaExpandida === tarea.id ? null : tarea.id)}
                  >
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                      <div className="flex items-start space-x-3 flex-grow">
                        <div className={`p-2 rounded-full flex-shrink-0 ${getColorEstado(tarea.estado)}`}>
                          {getIconoEstado(tarea.estado)}
                        </div>
                        <div className="flex-grow">
                          <h4 className="font-medium text-base text-foreground mb-1">{tarea.titulo}</h4>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                            {/* Badge de Materia */}
                            <Badge className={`px-2 py-1 rounded-full text-xs font-medium ${materias.find(m => m.nombre === tarea.materia)?.color}`}>
                              <BookOpen className="h-3 w-3 mr-1" />
                              {tarea.materia}
                            </Badge>
                            {/* Docente */}
                            <span className="flex items-center">
                              <User className="h-3 w-3 mr-1" />
                              {tarea.docente}
                            </span>
                            {/* Fecha de Entrega */}
                            <span className={`flex items-center ${tarea.estado === 'atrasado' ? 'text-red-600 font-medium' : ''}`}>
                              <Calendar className="h-3 w-3 mr-1" />
                              Entrega: {formatFecha(tarea.fechaEntrega)}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3 flex-shrink-0 mt-2 md:mt-0">
                        {/* Badge de Prioridad */}
                        <Badge variant={getVariantPrioridadBadge(tarea.prioridad)}>
                          {getLabelPrioridad(tarea.prioridad)}
                        </Badge>
                        {/* Botón de expandir/contraer */}
                        {tareaExpandida === tarea.id ? (
                          <ChevronUp className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    </div>

                    {/* Información adicional debajo del header, visible siempre para el estado/progreso/días restantes */}
                    <div className="mt-3 flex flex-col sm:flex-row sm:items-center gap-2">
                        {tarea.estado === 'pendiente' && tarea.progreso !== undefined && (
                            <div className="flex-1">
                                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                                    <span>Progreso</span>
                                    <span>{tarea.progreso}%</span>
                                </div>
                                <Progress value={tarea.progreso} className="h-2" />
                            </div>
                        )}

                        {tarea.estado === 'pendiente' && (
                            <Badge 
                                variant={diasRestantes(tarea.fechaEntrega) <= 2 && diasRestantes(tarea.fechaEntrega) >= 0 ? 'destructive' : 'secondary'}
                                className="sm:ml-4 flex-shrink-0"
                            >
                                {diasRestantes(tarea.fechaEntrega) > 0 
                                ? `${diasRestantes(tarea.fechaEntrega)} día${diasRestantes(tarea.fechaEntrega) !== 1 ? 's' : ''} restante${diasRestantes(tarea.fechaEntrega) !== 1 ? 's' : ''}`
                                : diasRestantes(tarea.fechaEntrega) === 0 ? '¡Hoy es la entrega!' : '¡Vencida!'
                                }
                            </Badge>
                        )}
                        {tarea.estado === 'completado' && tarea.calificacion !== undefined && (
                            <Badge variant="default" className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 sm:ml-4 flex-shrink-0">
                                Calificación: {tarea.calificacion}/100
                            </Badge>
                        )}
                    </div>
                  </div>

                  {/* Sección expandible de la tarea */}
                  {tareaExpandida === tarea.id && (
                    <div className="p-4 bg-muted/30 border-t">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h5 className="font-medium text-sm mb-2">Descripción</h5>
                          <p className="text-sm text-muted-foreground leading-relaxed">{tarea.descripcion}</p>
                          
                          {tarea.archivosAdjuntos !== undefined && tarea.archivosAdjuntos > 0 && (
                            <div className="mt-4">
                              <p className="text-sm font-medium mb-2">Archivos adjuntos ({tarea.archivosAdjuntos})</p>
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4 mr-2" />
                                Ver archivos
                              </Button>
                            </div>
                          )}
                        </div>
                        
                        <div>
                          <h5 className="font-medium text-sm mb-2">Detalles Adicionales</h5>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Asignada:</span>
                              <span>{formatFecha(tarea.fechaAsignacion)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Entrega:</span>
                              <span className={tarea.estado === 'atrasado' ? 'text-red-600 font-medium' : ''}>
                                {formatFecha(tarea.fechaEntrega)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Estado:</span>
                              <Badge variant={tarea.estado === 'completado' ? 'default' : tarea.estado === 'pendiente' ? 'secondary' : 'destructive'}>
                                {tarea.estado.charAt(0).toUpperCase() + tarea.estado.slice(1)} {/* Capitalizar */}
                              </Badge>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Prioridad:</span>
                              <Badge variant={getVariantPrioridadBadge(tarea.prioridad)}>
                                {tarea.prioridad.charAt(0).toUpperCase() + tarea.prioridad.slice(1)} {/* Capitalizar */}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resumen por materias */}
      <Card>
        <CardHeader>
          <CardTitle>Resumen por Materias</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {materias.map(materia => {
              const tareasMateria = tareas.filter(t => t.materia === materia.nombre);
              const completadas = tareasMateria.filter(t => t.estado === 'completado').length;
              const porcentaje = tareasMateria.length > 0 ? (completadas / tareasMateria.length) * 100 : 0;

              return (
                <div key={materia.id} className="border rounded-lg p-4 bg-card text-card-foreground shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-foreground">{materia.nombre}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${materia.color}`}>
                      {tareasMateria.length} tarea{tareasMateria.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <Progress value={porcentaje} className="h-2 mb-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{completadas} de {tareasMateria.length} completadas</span>
                    <span>{Math.round(porcentaje)}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}