// src/pages/parent/Tareas.tsx
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { 
  ChevronRight, CalendarDays, BookOpen, Clock, Search, Filter, Download,
  CheckCircle, Loader, XCircle, AlertTriangle, ListTodo
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// Tipos de datos
interface Task {
  id: number;
  course: string;
  description: string;
  dueDate: Date;
  assignedDate: Date;
  status: 'pending' | 'completed' | 'overdue';
  priority: 'low' | 'medium' | 'high';
}

interface TaskStatistics {
  totalTasks: number;
  pending: number;
  completed: number;
  overdue: number;
  highPriority: number;
}

export default function Tareas() {
  const [filterCourse, setFilterCourse] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all'); // Cambiado a 'all' por defecto para ver todas las tareas
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Datos de ejemplo
  const allTasks: Task[] = useMemo(() => [
    {
      id: 1,
      course: 'Inteligencia de Negocios',
      description: 'Realiza un informe detallado de un proceso ETL y sus aplicaciones en la toma de decisiones. Incluye ejemplos prácticos.',
      dueDate: new Date('2025-09-23T11:55:00'),
      assignedDate: new Date('2025-09-15T09:00:00'),
      status: 'pending',
      priority: 'high',
    },
    {
      id: 2,
      course: 'Cloud Computing',
      description: 'Investiga y presenta un caso de estudio sobre la implementación de servicios Serverless en AWS o Google Cloud.',
      dueDate: new Date('2025-09-20T14:00:00'), 
      assignedDate: new Date('2025-09-10T10:00:00'),
      status: 'overdue',
      priority: 'high',
    },
    {
      id: 3,
      course: 'Inteligencia Artificial',
      description: 'Desarrolla un algoritmo de clasificación usando Python y la librería Scikit-learn para un dataset proporcionado.',
      dueDate: new Date('2025-09-28T23:59:00'),
      assignedDate: new Date('2025-09-20T11:00:00'),
      status: 'pending',
      priority: 'medium',
    },
    {
      id: 4,
      course: 'Investigación III',
      description: 'Envía el borrador final del marco teórico de tu proyecto de investigación. Asegúrate de incluir al menos 10 referencias académicas y analiza críticamente la literatura existente.',
      dueDate: new Date('2025-10-02T10:00:00'),
      assignedDate: new Date('2025-09-22T09:30:00'),
      status: 'pending',
      priority: 'high',
    },
    {
      id: 5,
      course: 'Programación Avanzada',
      description: 'Implementa un sistema de gestión de inventario utilizando una base de datos relacional y un ORM de tu elección. Debe incluir interfaz de usuario.',
      dueDate: new Date('2025-10-05T18:30:00'),
      assignedDate: new Date('2025-09-25T14:00:00'),
      status: 'pending',
      priority: 'medium',
    },
    {
      id: 6,
      course: 'Cloud Computing',
      description: 'Prepara una presentación sobre la seguridad en entornos de Cloud Híbrido. Incluye recomendaciones de buenas prácticas.',
      dueDate: new Date('2025-09-18T17:00:00'),
      assignedDate: new Date('2025-09-10T09:00:00'),
      status: 'completed',
      priority: 'low',
    },
    {
      id: 7,
      course: 'Inteligencia de Negocios',
      description: 'Analiza un conjunto de datos empresariales y extrae insights clave para la optimización de procesos y toma de decisiones estratégicas.',
      dueDate: new Date('2025-10-10T09:00:00'),
      assignedDate: new Date('2025-09-29T08:00:00'),
      status: 'pending',
      priority: 'medium',
    },
    {
      id: 8,
      course: 'Historia Mundial',
      description: 'Escribe un ensayo crítico sobre las causas y consecuencias de la Primera Guerra Mundial, enfatizando el impacto en la sociedad moderna.',
      dueDate: new Date('2025-09-10T23:59:00'),
      assignedDate: new Date('2025-09-01T09:00:00'),
      status: 'overdue',
      priority: 'high',
    },
  ].sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime()), []);

  const availableCourses = useMemo(() => ['all', ...Array.from(new Set(allTasks.map(task => task.course)))], [allTasks]);

  // Filtrar y buscar tareas
  const filteredTasks = useMemo(() => {
    return allTasks.filter(task => {
      const matchesCourse = filterCourse === 'all' || task.course === filterCourse;
      const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
      const matchesSearch = task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            task.course.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCourse && matchesStatus && matchesSearch;
    });
  }, [allTasks, filterCourse, filterStatus, searchQuery]);

  // Estadísticas
  const taskStatistics: TaskStatistics = useMemo(() => ({
    totalTasks: allTasks.length,
    pending: allTasks.filter(task => task.status === 'pending').length,
    completed: allTasks.filter(task => task.status === 'completed').length,
    overdue: allTasks.filter(task => task.status === 'overdue').length,
    highPriority: allTasks.filter(task => task.priority === 'high' && task.status === 'pending').length,
  }), [allTasks]);

  // Función para formatear la fecha como en la imagen
  const formatDueDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = { weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: 'numeric', hour12: true };
    const formatted = new Intl.DateTimeFormat('es-ES', options).format(date);
    return formatted
            .replace(/\./g, '')
            .replace('Septiembre', 'Sep')
            .replace('a. m.', 'AM')
            .replace('p. m.', 'PM')
            .replace('mar ', 'Mar ')
            .replace('jue ', 'Jue ')
            .replace('dom ', 'Dom ')
            .replace('lun ', 'Lun ')
            .replace('mié ', 'Mié ')
            .replace('vie ', 'Vie ')
            .replace('sáb ', 'Sáb ');
  };

  const getStatusBadge = (status: Task['status']) => {
    switch (status) {
      case 'pending': return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Pendiente</Badge>;
      case 'completed': return <Badge variant="default" className="bg-green-100 text-green-800">Completada</Badge>;
      case 'overdue': return <Badge variant="destructive" className="bg-red-100 text-red-800">Vencida</Badge>;
      default: return <Badge variant="outline">Desconocido</Badge>;
    }
  };

  const getPriorityBadge = (priority: Task['priority']) => {
    switch (priority) {
      case 'low': return <Badge variant="outline" className="text-gray-600 border-gray-300">Baja</Badge>;
      case 'medium': return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Media</Badge>;
      case 'high': return <Badge variant="destructive" className="bg-orange-100 text-orange-800">Alta</Badge>;
      default: return null;
    }
  };

  return (
    <div className="space-y-6 p-4">

      {/* Header y Opciones Generales */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Mis Tareas</h1>
          <p className="text-muted-foreground">
            Revisa el estado de las tareas asignadas a Juan Pérez Martínez.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar Reporte
          </Button>
          <Button variant="default">
            <ListTodo className="h-4 w-4 mr-2" />
            Tareas Completadas
          </Button>
        </div>
      </div>

      {/* Estadísticas Rápidas de Tareas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total de Tareas</p>
              <p className="text-2xl font-bold">{taskStatistics.totalTasks}</p>
            </div>
            <ListTodo className="h-6 w-6 text-gray-500" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Tareas Pendientes</p>
              <p className="text-2xl font-bold text-blue-600">{taskStatistics.pending}</p>
            </div>
            <Loader className="h-6 w-6 text-blue-500" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Tareas Vencidas</p>
              <p className="text-2xl font-bold text-red-600">{taskStatistics.overdue}</p>
            </div>
            <AlertTriangle className="h-6 w-6 text-red-500" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Prioridad Alta (Pend.)</p>
              <p className="text-2xl font-bold text-orange-600">{taskStatistics.highPriority}</p>
            </div>
            <XCircle className="h-6 w-6 text-orange-500" />
          </CardContent>
        </Card>
      </div>

      {/* Filtros y Búsqueda */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            <div className="flex-1 relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar tarea o curso..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
              <Select value={filterCourse} onValueChange={setFilterCourse}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <BookOpen className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Materia" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las Materias</SelectItem>
                  {availableCourses.filter(c => c !== 'all').map(course => (
                    <SelectItem key={course} value={course}>
                      {course}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los Estados</SelectItem>
                  <SelectItem value="pending">Pendientes</SelectItem>
                  <SelectItem value="completed">Completadas</SelectItem>
                  <SelectItem value="overdue">Vencidas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Tareas Filtradas */}
      <h2 className="text-xl font-semibold text-foreground mt-6">
        {filterStatus === 'pending' ? 'Tareas Pendientes' : 
         filterStatus === 'completed' ? 'Tareas Completadas' : 
         filterStatus === 'overdue' ? 'Tareas Vencidas' : 'Todas las Tareas'}
      </h2>
      {filteredTasks.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            No se encontraron tareas con los filtros aplicados.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredTasks.map((task) => (
            <Card 
              key={task.id} 
              // min-h-[220px] para dar una altura mínima a las tarjetas y que se vean más uniformes
              className={`relative overflow-hidden group hover:shadow-lg transition-shadow duration-300 ease-in-out min-h-[220px] flex flex-col justify-between
                ${task.status === 'overdue' ? 'border-red-400 ring-1 ring-red-400' : 
                  task.status === 'pending' && task.priority === 'high' ? 'border-orange-400 ring-1 ring-orange-400' : ''}
              `}
            >
              <div> {/* Contenedor para Header y Content, excluyendo el footer */}
                <CardHeader className="pb-0">
                  <CardTitle className="text-base font-semibold text-foreground border-b border-muted-foreground/20 pb-2 mb-1">
                    {task.course}
                  </CardTitle>
                  <CardDescription className="flex items-center text-xs text-muted-foreground mb-2">
                    <Clock className="h-3 w-3 mr-1" />
                    Asignada: {task.assignedDate.toLocaleDateString('es-ES')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-0"> {/* Eliminado el pt-2 extra aquí */}
                  <p className="text-sm text-foreground mb-3 line-clamp-3">
                    {task.description}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 text-xs"> {/* flex-wrap para badges */}
                    {getStatusBadge(task.status)}
                    {getPriorityBadge(task.priority)}
                  </div>
                </CardContent>
              </div>

              {/* Footer con la fecha de entrega, ahora se posiciona en la parte inferior de la tarjeta */}
              <div 
                className={`flex items-center justify-center p-3 text-white text-xs font-medium rounded-b-lg mt-auto
                  ${task.status === 'overdue' ? 'bg-red-500' : 
                    task.priority === 'high' && task.status === 'pending' ? 'bg-orange-500' : 'bg-purple-600'}
                `}
              >
                <CalendarDays className="h-3 w-3 mr-1" />
                <span>Para: {formatDueDate(task.dueDate)}</span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}