// src/pages/student/Progreso.tsx
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  BarChart2, // Icono principal para el progreso
  TrendingUp, // Para el progreso general o ir a historial
  BookOpen,   // Para materias
  CheckCircle, // Para completadas
  Clock,      // Para pendientes
  AlertCircle, // Para atrasadas
  Award,      // Para logros/promedio alto
  Flame,      // Para streak o esfuerzo
  Users // Para docentes en materias
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Definiciones de tipos (idealmente en un archivo compartido como types.ts)
interface Tarea {
  id: number;
  titulo: string;
  materia: string;
  docente: string;
  fechaAsignacion: string;
  fechaEntrega: string;
  estado: 'pendiente' | 'completado' | 'atrasado';
  prioridad: 'alta' | 'media' | 'baja';
  descripcion: string;
  archivosAdjuntos?: number;
  progreso?: number;
  calificacion?: number;
}

interface MateriaInfo { // Renombrado de Materia a MateriaInfo para evitar conflicto si Materia ya existe en otro lado
  id: number;
  nombre: string;
  docente: string;
  color: string; // Clases de Tailwind para el color del badge
}

export default function StudentProgreso() {

  // --- Datos de ejemplo (reutilizados y ligeramente ajustados) ---
  const materiasInfo: MateriaInfo[] = useMemo(() => [
    { id: 1, nombre: 'Matemáticas', docente: 'Prof. García', color: 'bg-indigo-100 text-indigo-800' },
    { id: 2, nombre: 'Español', docente: 'Prof. López', color: 'bg-blue-100 text-blue-800' },
    { id: 3, nombre: 'Ciencias', docente: 'Prof. Martín', color: 'bg-emerald-100 text-emerald-800' },
    { id: 4, nombre: 'Historia', docente: 'Prof. Rodríguez', color: 'bg-purple-100 text-purple-800' },
    { id: 5, nombre: 'Inglés', docente: 'Prof. Smith', color: 'bg-yellow-100 text-yellow-800' }
  ], []);

  const studentTasks: Tarea[] = useMemo(() => [
    {
      id: 1,
      titulo: 'Ejercicios de álgebra',
      materia: 'Matemáticas',
      docente: 'Prof. García',
      fechaAsignacion: '2024-01-15',
      fechaEntrega: '2024-01-20',
      estado: 'completado',
      prioridad: 'alta',
      descripcion: 'Resolver los ejercicios de la página 45 a 48 del libro de texto.',
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
      descripcion: 'Escribir un ensayo de 1000 palabras sobre la influencia de la literatura contemporánea.',
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
      descripcion: 'Crear una maqueta del sistema solar.',
      progreso: 60
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
      descripcion: 'Investigar sobre las causas y consecuencias de la revolución industrial en Europa.',
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
      descripcion: 'Preparar una presentación sobre los verbos irregulares en inglés.',
      progreso: 90
    },
    {
      id: 6,
      titulo: 'Problemas de física',
      materia: 'Ciencias',
      docente: 'Prof. Martín',
      fechaAsignacion: '2024-01-14',
      fechaEntrega: '2024-01-21',
      estado: 'completado',
      prioridad: 'alta',
      descripcion: 'Resolver los problemas de física de las páginas 78-82 sobre cinemática.',
      calificacion: 78
    },
    {
      id: 7,
      titulo: 'Lectura comprensiva: "El Quijote"',
      materia: 'Español',
      docente: 'Prof. López',
      fechaAsignacion: '2024-01-01',
      fechaEntrega: '2024-01-10',
      estado: 'atrasado',
      prioridad: 'media',
      descripcion: 'Leer los primeros capítulos de "El Quijote" y hacer un análisis.',
    }
  ], []);

  // --- CÁLCULOS PARA ESTADÍSTICAS Y PROGRESO GENERAL ---
  const generalProgress = useMemo(() => {
    const totalConsideredTasks = studentTasks.length;
    if (totalConsideredTasks === 0) return 0;

    const completedTasksCount = studentTasks.filter(t => t.estado === 'completado').length;
    const percentageCompleted = (completedTasksCount / totalConsideredTasks) * 100;

    return Math.round(percentageCompleted);
  }, [studentTasks]);

  // Progreso por materia
  const progressByMateria = useMemo(() => {
    return materiasInfo.map(materia => {
      const tareasMateria = studentTasks.filter(t => t.materia === materia.nombre);
      const completadas = tareasMateria.filter(t => t.estado === 'completado').length;
      const pendientes = tareasMateria.filter(t => t.estado === 'pendiente').length;
      const atrasadas = tareasMateria.filter(t => t.estado === 'atrasado').length;
      const totalTareas = tareasMateria.length;

      const porcentaje = totalTareas > 0 ? (completadas / totalTareas) * 100 : 0;

      const calificaciones = tareasMateria
        .filter(t => t.estado === 'completado' && t.calificacion !== undefined)
        .map(t => t.calificacion as number);

      const promedioCalificaciones = calificaciones.length > 0
        ? calificaciones.reduce((sum, score) => sum + score, 0) / calificaciones.length
        : null;

      return {
        ...materia,
        totalTareas,
        completadas,
        pendientes,
        atrasadas,
        porcentaje: Math.round(porcentaje),
        promedioCalificaciones: promedioCalificaciones ? Math.round(promedioCalificaciones) : 'N/A'
      };
    });
  }, [studentTasks, materiasInfo]);

  // Contadores rápidos para el resumen
  const totalTareasEstudiante = studentTasks.length;
  const tareasCompletadasEstudiante = studentTasks.filter(t => t.estado === 'completado').length;
  const tareasPendientesEstudiante = studentTasks.filter(t => t.estado === 'pendiente').length;
  const tareasAtrasadasEstudiante = studentTasks.filter(t => t.estado === 'atrasado').length;


  const getProgressColor = (value: number) => {
    if (value < 30) return 'bg-red-500';
    if (value < 70) return 'bg-yellow-500';
    return 'bg-emerald-500';
  };

  return (
    <div className="space-y-8 p-4">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <BarChart2 className="h-7 w-7 text-academic-blue-500" />
            Mi Progreso Académico
          </h1>
          <p className="text-muted-foreground">
            Un resumen de tu desempeño y avance en todas tus materias. ¡Sigue así!
          </p>
        </div>
        <Button variant="outline" className="bg-academic-blue-500 hover:bg-academic-blue-600 text-white hover:text-white">
          <TrendingUp className="h-4 w-4 mr-2" />
          Ver Historial Detallado
        </Button>
      </div>

      {/* Progreso General */}
      <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl font-bold">Progreso General</CardTitle>
          <Award className="h-6 w-6 text-yellow-500" /> {/* Icono de logro */}
        </CardHeader>
        <CardContent>
          <div className="text-5xl font-extrabold text-center py-4 text-academic-blue-500">
            {generalProgress}%
          </div>
          <Progress value={generalProgress} className="h-3 w-full" indicatorClassName={getProgressColor(generalProgress)} />
          <p className="text-sm text-muted-foreground text-center mt-2">
            Basado en tus tareas completadas. ¡Un gran esfuerzo!
          </p>
        </CardContent>
      </Card>

      {/* Resumen Rápido de Tareas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Tareas</p>
              <p className="text-2xl font-bold text-foreground">{totalTareasEstudiante}</p>
            </div>
            <BookOpen className="h-5 w-5 text-gray-500" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Completadas</p>
              <p className="text-2xl font-bold text-emerald-600">{tareasCompletadasEstudiante}</p>
            </div>
            <CheckCircle className="h-5 w-5 text-emerald-500" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Pendientes</p>
              <p className="text-2xl font-bold text-blue-600">{tareasPendientesEstudiante}</p>
            </div>
            <Clock className="h-5 w-5 text-blue-500" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Atrasadas</p>
              <p className="text-2xl font-bold text-red-600">{tareasAtrasadasEstudiante}</p>
            </div>
            <AlertCircle className="h-5 w-5 text-red-500" />
          </CardContent>
        </Card>
      </div>

      <Separator className="my-8" />

      {/* Progreso Detallado por Materia */}
      <h2 className="text-2xl font-bold text-foreground mb-4">Progreso por Materia</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {progressByMateria.map(materia => (
          <Card key={materia.id} className="group hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between mb-2">
                <CardTitle className="text-xl font-semibold flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-academic-blue-500" />
                  {materia.nombre}
                </CardTitle>
                <Badge className={`px-3 py-1 text-sm font-medium ${materia.color}`}>
                  {materia.totalTareas} Tareas
                </Badge>
              </div>
              <CardDescription className="flex items-center gap-2 text-muted-foreground">
                <Users className="h-4 w-4" />
                {materia.docente}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {materia.totalTareas > 0 ? (
                <>
                  {/* Barra de Progreso por Materia */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-muted-foreground mb-1">
                      <span>Progreso en {materia.nombre}</span>
                      <span className="font-semibold text-foreground">{materia.porcentaje}%</span>
                    </div>
                    <Progress value={materia.porcentaje} className="h-2" indicatorClassName={getProgressColor(materia.porcentaje)} />
                  </div>

                  {/* Detalle de Tareas */}
                  <div className="grid grid-cols-3 gap-2 text-center border-t pt-4 mt-4">
                    <div>
                      <CheckCircle className="h-5 w-5 mx-auto mb-1 text-emerald-500" />
                      <p className="font-semibold text-foreground text-lg">{materia.completadas}</p>
                      <p className="text-xs text-muted-foreground">Completadas</p>
                    </div>
                    <div>
                      <Clock className="h-5 w-5 mx-auto mb-1 text-blue-500" />
                      <p className="font-semibold text-foreground text-lg">{materia.pendientes}</p>
                      <p className="text-xs text-muted-foreground">Pendientes</p>
                    </div>
                    <div>
                      <AlertCircle className="h-5 w-5 mx-auto mb-1 text-red-500" />
                      <p className="font-semibold text-foreground text-lg">{materia.atrasadas}</p>
                      <p className="text-xs text-muted-foreground">Vencidas</p>
                    </div>
                  </div>

                  {/* Promedio de Calificaciones */}
                  {materia.promedioCalificaciones !== 'N/A' && (
                    <div className="mt-4 pt-4 border-t text-sm flex justify-between items-center">
                      <span className="text-muted-foreground">Promedio Calificaciones:</span>
                      <Badge variant="secondary" className="text-base font-semibold bg-blue-100 text-blue-800 hover:bg-blue-200">
                        {materia.promedioCalificaciones}/100
                      </Badge>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <BookOpen className="h-10 w-10 mx-auto mb-3" />
                  <p>Aún no hay tareas registradas para esta materia.</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}