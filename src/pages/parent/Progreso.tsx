// Inicio del archivo
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { WhatsAppService, NotificationRecipient } from '@/services/whatsappService';
import { useToast } from '@/hooks/use-toast';
import {
  LineChart, 
  BookOpen,
  CheckCircle,
  AlertCircle,
  Clock,
  LayoutDashboard,
  TrendingUp,
  Users,
  Info,
  Calendar,
  Sparkles,
  Target,
  Award,
  BookMarked,
  DollarSign,
  Bell,
  FileText,
  Download,
  Share2
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';


// Definiciones de tipos (reutilizadas de Tareas.tsx, puedes moverlas a un archivo común si hay muchos componentes que las comparten)
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

export default function Progreso() {
  const { toast } = useToast();
  const [notificacionesActivas, setNotificacionesActivas] = useState(false);

  // Datos del estudiante (esto debería venir de un contexto o props)
  const estudiante: NotificationRecipient = {
    id: 'EST123',
    nombre: 'Juan Pérez Martínez',
    telefono: '944042223',
    preferencia: 'whatsapp'
  };

  const enviarResumenWhatsApp = async () => {
    try {
      const materiaDestacada = progressByMateria.reduce((prev, current) => 
        current.promedioCalificaciones > prev.promedioCalificaciones ? current : prev
      );

      const exito = await WhatsAppService.enviarResumenProgreso(estudiante, {
        promedioGeneral: generalProgress,
        materiaDestacada: materiaDestacada.nombre,
        tareasCompletadas: tareas.filter(t => t.estado === 'completado').length,
        proximasEntregas: upcomingPendingTasks.length
      });

      if (exito) {
        toast({
          title: "Resumen enviado",
          description: "Se ha enviado el resumen de progreso a tu WhatsApp",
          variant: "default",
        });
      } else {
        throw new Error("Error al enviar el mensaje");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo enviar el resumen. Intente nuevamente.",
        variant: "destructive",
      });
    }
  };

  // Datos de ejemplo (reutilizados de Tareas.tsx)
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
      estado: 'completado', // Cambiado a completado para simular progreso
      prioridad: 'alta',
      descripcion: 'Resolver los ejercicios de la página 45 a 48 del libro de texto. Incluir procedimiento completo y mostrar los pasos detallados para cada solución. Presentar en formato PDF.',
      archivosAdjuntos: 2,
      progreso: 100,
      calificacion: 85
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
      estado: 'completado', // Cambiado a completado
      prioridad: 'alta',
      descripcion: 'Resolver los problemas de física de las páginas 78-82 sobre cinemática. Mostrar todos los cálculos y unidades.',
      archivosAdjuntos: 1,
      progreso: 100,
      calificacion: 78
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
    },
    {
      id: 8,
      titulo: 'Laboratorio de Química Inorgánica',
      materia: 'Ciencias',
      docente: 'Prof. Martín',
      fechaAsignacion: '2024-01-20',
      fechaEntrega: '2024-02-05',
      estado: 'pendiente',
      prioridad: 'alta',
      descripcion: 'Realizar el experimento de titulación ácido-base. Incluir reporte de materiales, procedimiento, resultados y conclusiones.',
      archivosAdjuntos: 0,
      progreso: 10
    }
  ], []);


  // CÁLCULOS PARA ESTADÍSTICAS Y PROGRESO GENERAL
  const generalProgress = useMemo(() => {
    // Calculamos un "progreso" basado en tareas completadas vs. total de tareas con calificación (o progreso si está pendiente)
    const totalConsideredTasks = tareas.length;
    if (totalConsideredTasks === 0) return 0;

    const completedTasksPoints = tareas.filter(t => t.estado === 'completado').length * 100;
    const pendingTasksProgressPoints = tareas
      .filter(t => t.estado === 'pendiente' && t.progreso !== undefined)
      .reduce((sum, task) => sum + (task.progreso || 0), 0);
    // Tareas atrasadas podrían contar como 0 o un puntaje negativo dependiendo de la lógica.
    // Por simplicidad, las atrasadas no contribuyen positivamente aquí, o se cuentan como 0 progreso.
    
    // Una forma simple: (Completadas * 100 + Progreso de pendientes) / Total de Tareas.
    // O si solo se consideran las completadas:
    const percentageCompleted = (tareas.filter(t => t.estado === 'completado').length / totalConsideredTasks) * 100;
    return Math.round(percentageCompleted);

    // O una media más compleja:
    // const totalScore = tareas.reduce((acc, tarea) => {
    //   if (tarea.estado === 'completado' && tarea.calificacion !== undefined) {
    //     return acc + tarea.calificacion; // Suma la calificación si está completada
    //   } else if (tarea.estado === 'pendiente' && tarea.progreso !== undefined) {
    //     return acc + tarea.progreso * 0.5; // O un porcentaje del progreso si aún no está calificada
    //   }
    //   return acc;
    // }, 0);
    // return Math.round(totalScore / totalConsideredTasks);

  }, [tareas]);

  // Progreso por materia
  const progressByMateria = useMemo(() => {
    return materias.map(materia => {
      const tareasMateria = tareas.filter(t => t.materia === materia.nombre);
      const completadas = tareasMateria.filter(t => t.estado === 'completado').length;
      const porcentaje = tareasMateria.length > 0 ? (completadas / tareasMateria.length) * 100 : 0;
      const pendientes = tareasMateria.filter(t => t.estado === 'pendiente').length;
      const atrasadas = tareasMateria.filter(t => t.estado === 'atrasado').length;
      const promedioCalificaciones = tareasMateria
        .filter(t => t.estado === 'completado' && t.calificacion !== undefined)
        .reduce((sum, t) => sum + (t.calificacion || 0), 0) / (completadas || 1); // Evitar división por cero

      return {
        ...materia,
        totalTareas: tareasMateria.length,
        completadas,
        pendientes,
        atrasadas,
        porcentaje: Math.round(porcentaje),
        promedioCalificaciones: Math.round(promedioCalificaciones)
      };
    });
  }, [tareas, materias]);

  // Tareas pendientes, las 3 próximas
  const upcomingPendingTasks = useMemo(() => {
    return tareas
      .filter(t => t.estado === 'pendiente')
      .sort((a, b) => new Date(a.fechaEntrega).getTime() - new Date(b.fechaEntrega).getTime())
      .slice(0, 3);
  }, [tareas]);

  const overdueTasksCount = useMemo(() => {
    return tareas.filter(t => t.estado === 'atrasado').length;
  }, [tareas]);

  const getProgressColor = (value: number): string => {
    if (value < 30) return 'text-red-500 bg-red-500/20';
    if (value < 70) return 'text-yellow-500 bg-yellow-500/20';
    return 'text-emerald-500 bg-emerald-500/20';
  };

  return (
    <div className="space-y-8 p-4"> {/* Aumentado el padding y espaciado */}
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <LayoutDashboard className="h-7 w-7 text-academic-blue-500" />
            Tablero de Progreso Académico
          </h1>
          <p className="text-muted-foreground">
            Visualiza el avance general y por materia de Juan Pérez Martínez.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="bg-academic-blue-500 hover:bg-academic-blue-600 text-white hover:text-white">
            <TrendingUp className="h-4 w-4 mr-2" />
            Ver Historial
          </Button>
          <Button variant="outline">
            <FileText className="h-4 w-4 mr-2" />
            Boletín
          </Button>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" className="relative">
                  <Bell className="h-4 w-4" />
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-[10px] text-white flex items-center justify-center">
                    3
                  </span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>3 notificaciones nuevas</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Notificaciones Recientes */}
      <Card className="mb-8">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-semibold">Notificaciones Recientes</CardTitle>
          <Bell className="h-5 w-5 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-2 rounded-lg bg-blue-50">
              <div className="h-2 w-2 rounded-full bg-blue-500" />
              <div className="flex-1">
                <p className="font-medium">Nuevo boletín disponible</p>
                <p className="text-sm text-muted-foreground">El boletín del 2do bimestre está listo para descargar</p>
              </div>
              <Badge variant="outline" className="text-xs">Hoy</Badge>
            </div>
            <div className="flex items-center gap-4 p-2 rounded-lg bg-yellow-50">
              <div className="h-2 w-2 rounded-full bg-yellow-500" />
              <div className="flex-1">
                <p className="font-medium">Recordatorio de pago</p>
                <p className="text-sm text-muted-foreground">La mensualidad de Noviembre vence en 7 días</p>
              </div>
              <Badge variant="outline" className="text-xs">1d</Badge>
            </div>
            <div className="flex items-center gap-4 p-2 rounded-lg bg-green-50">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <div className="flex-1">
                <p className="font-medium">¡Nuevo logro desbloqueado!</p>
                <p className="text-sm text-muted-foreground">Tu hijo ha completado todas las tareas de Matemáticas</p>
              </div>
              <Badge variant="outline" className="text-xs">2d</Badge>
            </div>
          </div>
          <div className="flex flex-col gap-2 mt-4">
            <Button variant="link" className="w-full">Ver todas las notificaciones</Button>
            <div className="flex items-center justify-between p-2 rounded-lg bg-green-50">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Recibir notificaciones por WhatsApp</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Recibirás actualizaciones sobre tareas, calificaciones y eventos importantes</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Button 
                variant={notificacionesActivas ? "default" : "outline"}
                onClick={() => setNotificacionesActivas(!notificacionesActivas)}
                className={notificacionesActivas ? "bg-green-500 hover:bg-green-600" : ""}
              >
                {notificacionesActivas ? "Activadas" : "Activar"}
              </Button>
            </div>
            <Button 
              variant="outline" 
              className="w-full flex items-center gap-2"
              onClick={enviarResumenWhatsApp}
            >
              <Share2 className="h-4 w-4" />
              Enviar resumen por WhatsApp
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Progreso General */}
      <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl font-bold">Progreso General</CardTitle>
          <LineChart className="h-6 w-6 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-5xl font-extrabold text-center py-4 text-academic-blue-500">
            {generalProgress}%
          </div>
          <Progress value={generalProgress} className={`h-3 w-full ${getProgressColor(generalProgress)}`} />
          <p className="text-sm text-muted-foreground text-center mt-2">
            Basado en tus tareas completadas y el avance de las pendientes.
          </p>
        </CardContent>
      </Card>

      {/* Resumen de Tareas Pendientes y Atrasadas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-semibold">Próximas Tareas Pendientes</CardTitle>
            <Clock className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingPendingTasks.length > 0 ? (
              upcomingPendingTasks.map(tarea => (
                <div key={tarea.id} className="flex items-center justify-between border-b last:border-b-0 pb-2 last:pb-0">
                  <div>
                    <p className="font-medium">{tarea.titulo}</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <BookOpen className="h-3 w-3" />
                      {tarea.materia} &bull; Entrega: {new Date(tarea.fechaEntrega).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {tarea.progreso || 0}%
                  </Badge>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-center py-4">No hay tareas pendientes próximas.</p>
            )}
            <Button variant="link" className="w-full text-academic-blue-500">Ver todas las tareas</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-semibold">
              Tareas Vencidas
              {overdueTasksCount > 0 && <Badge variant="destructive" className="ml-2 text-base">{overdueTasksCount}</Badge>}
            </CardTitle>
            <AlertCircle className="h-5 w-5 text-red-500" />
          </CardHeader>
          <CardContent>
            {overdueTasksCount > 0 ? (
              <p className="text-red-600 font-medium">
                ¡Tienes {overdueTasksCount} tarea{overdueTasksCount !== 1 ? 's' : ''} vencida{overdueTasksCount !== 1 ? 's' : ''}!
                Considera contactar a tus docentes.
              </p>
            ) : (
              <p className="text-muted-foreground text-center py-4">¡Excelente! No tienes tareas vencidas.</p>
            )}
            <Button variant="link" className="w-full text-academic-blue-500">Ir a Tareas Vencidas</Button>
          </CardContent>
        </Card>
      </div>


      {/* Estado Financiero */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-500" />
            Estado Financiero
          </CardTitle>
          <CardDescription>
            Resumen de pagos y mensualidades del periodo actual
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Mensualidad Actual</p>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">Bs. 150</span>
                <Badge variant="outline" className="bg-green-50">Noviembre 2025</Badge>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Estado</p>
              <Badge variant="default" className="bg-emerald-500">Al día</Badge>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Próximo Vencimiento</p>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>10 de Noviembre, 2025</span>
              </div>
            </div>
          </div>
          <Separator className="my-4" />
          <Button className="w-full bg-green-500 hover:bg-green-600">
            Realizar Pago
          </Button>
        </CardContent>
      </Card>

      {/* Hitos y Logros */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-semibold">Logros Obtenidos</CardTitle>
            <Award className="h-5 w-5 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-500 mb-2">8</div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-yellow-500" />
              <span className="text-sm text-muted-foreground">3 nuevos esta semana</span>
            </div>
            <Button variant="link" className="w-full mt-4 text-yellow-500">Ver Todos los Logros</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-semibold">Próximos Objetivos</CardTitle>
            <Target className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Mejorar en Matemáticas</span>
                <Badge variant="outline">80%</Badge>
              </div>
              <Progress value={80} className="h-2" />
              <Button variant="link" className="w-full text-blue-500">Ver Más Objetivos</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-semibold">Calendario Académico</CardTitle>
            <Calendar className="h-5 w-5 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Próximos eventos:</p>
              <div className="flex items-center gap-2 text-sm">
                <Badge variant="outline" className="bg-purple-50">18 Feb</Badge>
                <span>Entrega de boletines</span>
              </div>
            </div>
            <Button variant="link" className="w-full mt-4 text-purple-500">Ver Calendario</Button>
          </CardContent>
        </Card>
      </div>

      <Separator className="my-8" />

      {/* Progreso por Materia */}
      <h2 className="text-2xl font-bold text-foreground mb-4">Progreso por Materia</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {progressByMateria.map(materia => (
          <Card key={materia.id} className="group hover:shadow-md transition-shadow duration-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                  {materia.nombre}
                </span>
                <Badge className={`px-2 py-1 rounded-full text-xs font-medium ${materia.color}`}>
                  {materia.totalTareas} tareas
                </Badge>
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground flex items-center gap-1">
                <Users className="h-3 w-3" />
                {materia.docente}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Progress value={materia.porcentaje} className={`h-2 mb-2 ${getProgressColor(materia.porcentaje)}`} />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{materia.completadas} de {materia.totalTareas} completadas</span>
                <span className="font-medium text-foreground">{materia.porcentaje}%</span>
              </div>
              <div className="grid grid-cols-3 text-center text-xs text-muted-foreground mt-3 pt-3 border-t">
                <div>
                  <p className="font-semibold text-foreground">{materia.completadas}</p>
                  <p>Completadas</p>
                </div>
                <div>
                  <p className="font-semibold text-blue-600">{materia.pendientes}</p>
                  <p>Pendientes</p>
                </div>
                <div>
                  <p className="font-semibold text-red-600">{materia.atrasadas}</p>
                  <p>Vencidas</p>
                </div>
              </div>
              {materia.completadas > 0 && (
                <div className="mt-4 text-sm text-muted-foreground flex items-center justify-between">
                    <span>Promedio Calificaciones:</span>
                    <span className="font-medium text-foreground">{materia.promedioCalificaciones}/100</span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Promedio de calificaciones en tareas completadas de esta materia.</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Consejos y Recursos para Padres */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookMarked className="h-5 w-5 text-academic-blue-500" />
            Recursos y Consejos para Padres
          </CardTitle>
          <CardDescription>
            Herramientas y consejos para ayudar a su hijo/a en su desarrollo académico
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Rutinas de Estudio</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Establecer horarios fijos
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Crear espacio de estudio
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Limitar distracciones
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Material de Apoyo</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-blue-500" />
                  Videos educativos
                </li>
                <li className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-blue-500" />
                  Ejercicios prácticos
                </li>
                <li className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-blue-500" />
                  Guías descargables
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Comunicación</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-purple-500" />
                  Reuniones con docentes
                </li>
                <li className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-purple-500" />
                  Grupos de apoyo
                </li>
                <li className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-purple-500" />
                  Talleres para padres
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-6 flex justify-center">
            <Button className="bg-academic-blue-500 hover:bg-academic-blue-600">
              Explorar Más Recursos
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}