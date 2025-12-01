// src/pages/student/Asistencia.tsx
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import {
  CalendarDays,   // Icono principal para asistencia
  CheckCircle,    // Asistencia
  XCircle,        // Falta
  MinusCircle,    // Retardo / Justificado
  BookOpen,       // Para materias
  Users,          // Para docentes
  Info,           // Para tooltips
  ClipboardList   // Para ver historial completo
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Tipos de datos para asistencia (nuevos para esta página)
interface AsistenciaRegistro {
  fecha: string; // YYYY-MM-DD
  materia: string;
  estado: 'asistencia' | 'falta' | 'retardo' | 'justificado';
  observaciones?: string;
}

interface MateriaInfo {
  id: number;
  nombre: string;
  docente: string;
  color: string; // Clases de Tailwind para el color del badge
}

export default function StudentAsistencia() {

  // Datos de ejemplo para materias (reutilizados)
  const materiasInfo: MateriaInfo[] = useMemo(() => [
    { id: 1, nombre: 'Matemáticas', docente: 'Prof. García', color: 'bg-indigo-100 text-indigo-800' },
    { id: 2, nombre: 'Español', docente: 'Prof. López', color: 'bg-blue-100 text-blue-800' },
    { id: 3, nombre: 'Ciencias', docente: 'Prof. Martín', color: 'bg-emerald-100 text-emerald-800' },
    { id: 4, nombre: 'Historia', docente: 'Prof. Rodríguez', color: 'bg-purple-100 text-purple-800' },
    { id: 5, nombre: 'Inglés', docente: 'Prof. Smith', color: 'bg-yellow-100 text-yellow-800' }
  ], []);

  // Registros de asistencia de ejemplo para el estudiante
  const registrosAsistencia: AsistenciaRegistro[] = useMemo(() => [
    { fecha: '2024-01-08', materia: 'Matemáticas', estado: 'asistencia' },
    { fecha: '2024-01-08', materia: 'Español', estado: 'asistencia' },
    { fecha: '2024-01-09', materia: 'Ciencias', estado: 'asistencia' },
    { fecha: '2024-01-09', materia: 'Historia', estado: 'falta', observaciones: 'Por enfermedad' },
    { fecha: '2024-01-10', materia: 'Inglés', estado: 'asistencia' },
    { fecha: '2024-01-10', materia: 'Matemáticas', estado: 'retardo', observaciones: 'Llegó 15 min tarde' },
    { fecha: '2024-01-11', materia: 'Español', estado: 'asistencia' },
    { fecha: '2024-01-11', materia: 'Ciencias', estado: 'justificado', observaciones: 'Cita médica' },
    { fecha: '2024-01-12', materia: 'Historia', estado: 'asistencia' },
    { fecha: '2024-01-15', materia: 'Matemáticas', estado: 'asistencia' },
    { fecha: '2024-01-15', materia: 'Español', estado: 'falta' },
    { fecha: '2024-01-16', materia: 'Ciencias', estado: 'asistencia' },
  ], []);

  // --- Lógica para calcular estadísticas de asistencia ---

  // Progreso general de asistencia
  const generalAttendance = useMemo(() => {
    const totalClases = registrosAsistencia.length;
    if (totalClases === 0) return { porcentaje: 0, asistencias: 0, faltas: 0, retardos: 0, justificados: 0 };

    const asistencias = registrosAsistencia.filter(r => r.estado === 'asistencia').length;
    const faltas = registrosAsistencia.filter(r => r.estado === 'falta').length;
    const retardos = registrosAsistencia.filter(r => r.estado === 'retardo').length;
    const justificados = registrosAsistencia.filter(r => r.estado === 'justificado').length;

    // Puedes decidir cómo ponderar los estados. Aquí, las justificaciones no bajan el porcentaje.
    // O podrías hacer (asistencias + justificados) / total
    const porcentaje = (asistencias / (totalClases - justificados)) * 100; // Porcentaje de asistencia efectiva
    
    return {
      porcentaje: Math.round(isNaN(porcentaje) ? 0 : porcentaje), // Manejar NaN si totalClases - justificados es 0
      asistencias,
      faltas,
      retardos,
      justificados,
      totalClases
    };
  }, [registrosAsistencia]);

  // Asistencia por materia
  const attendanceByMateria = useMemo(() => {
    return materiasInfo.map(materia => {
      const registrosMateria = registrosAsistencia.filter(r => r.materia === materia.nombre);
      const totalClasesMateria = registrosMateria.length;

      const asistencias = registrosMateria.filter(r => r.estado === 'asistencia').length;
      const faltas = registrosMateria.filter(r => r.estado === 'falta').length;
      const retardos = registrosMateria.filter(r => r.estado === 'retardo').length;
      const justificados = registrosMateria.filter(r => r.estado === 'justificado').length;

      const porcentaje = (asistencias / (totalClasesMateria - justificados)) * 100;

      return {
        ...materia,
        totalClases: totalClasesMateria,
        asistencias,
        faltas,
        retardos,
        justificados,
        porcentaje: Math.round(isNaN(porcentaje) ? 0 : porcentaje)
      };
    });
  }, [registrosAsistencia, materiasInfo]);

  // Función para obtener el color de la barra de progreso
  const getProgressColor = (value: number) => {
    if (value < 70) return 'bg-red-500'; // Menos del 70% es crítico
    if (value < 85) return 'bg-yellow-500'; // Entre 70-85% es aceptable
    return 'bg-emerald-500'; // Más del 85% es bueno
  };

  const getBadgeColor = (estado: AsistenciaRegistro['estado']) => {
    switch(estado) {
        case 'asistencia': return 'bg-emerald-100 text-emerald-800';
        case 'falta': return 'bg-red-100 text-red-800';
        case 'retardo': return 'bg-yellow-100 text-yellow-800';
        case 'justificado': return 'bg-blue-100 text-blue-800';
        default: return 'bg-gray-100 text-gray-800';
    }
  }

  const getEstadoIcon = (estado: AsistenciaRegistro['estado']) => {
    switch(estado) {
        case 'asistencia': return <CheckCircle className="h-4 w-4" />;
        case 'falta': return <XCircle className="h-4 w-4" />;
        case 'retardo': return <MinusCircle className="h-4 w-4" />;
        case 'justificado': return <Info className="h-4 w-4" />;
        default: return null;
    }
  }

  return (
    <div className="space-y-8 p-4">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <CalendarDays className="h-7 w-7 text-academic-blue-500" />
            Mi Asistencia
          </h1>
          <p className="text-muted-foreground">
            Revisa tu historial de asistencia y porcentaje de presencia en clases.
          </p>
        </div>
        <Button variant="outline" className="bg-academic-blue-500 hover:bg-academic-blue-600 text-white hover:text-white">
          <ClipboardList className="h-4 w-4 mr-2" />
          Ver Historial Completo
        </Button>
      </div>

      {/* Tarjeta de Resumen General */}
      <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl font-bold">Asistencia General</CardTitle>
          <CalendarDays className="h-6 w-6 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-5xl font-extrabold text-center py-4 text-academic-blue-500">
            {generalAttendance.porcentaje}%
          </div>
          <Progress value={generalAttendance.porcentaje} className="h-3 w-full" indicatorClassName={getProgressColor(generalAttendance.porcentaje)} />
          <p className="text-sm text-muted-foreground text-center mt-2">
            Porcentaje de asistencia en todas las clases.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 border-t pt-4">
            <div className="text-center">
              <CheckCircle className="h-6 w-6 mx-auto mb-1 text-emerald-500" />
              <p className="font-semibold text-lg">{generalAttendance.asistencias}</p>
              <p className="text-xs text-muted-foreground">Asistencias</p>
            </div>
            <div className="text-center">
              <XCircle className="h-6 w-6 mx-auto mb-1 text-red-500" />
              <p className="font-semibold text-lg">{generalAttendance.faltas}</p>
              <p className="text-xs text-muted-foreground">Faltas</p>
            </div>
            <div className="text-center">
              <MinusCircle className="h-6 w-6 mx-auto mb-1 text-yellow-500" />
              <p className="font-semibold text-lg">{generalAttendance.retardos}</p>
              <p className="text-xs text-muted-foreground">Retardos</p>
            </div>
            <div className="text-center">
              <Info className="h-6 w-6 mx-auto mb-1 text-blue-500" />
              <p className="font-semibold text-lg">{generalAttendance.justificados}</p>
              <p className="text-xs text-muted-foreground">Justificados</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator className="my-8" />

      {/* Asistencia por Materia */}
      <h2 className="text-2xl font-bold text-foreground mb-4">Detalle por Asignatura</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {attendanceByMateria.map(materia => (
          <Card key={materia.id} className="group hover:shadow-md transition-shadow duration-200">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between mb-2">
                <CardTitle className="text-xl font-semibold flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-academic-blue-500" />
                  {materia.nombre}
                </CardTitle>
                <Badge className={`px-3 py-1 text-sm font-medium ${materia.color}`}>
                  {materia.totalClases} Clases
                </Badge>
              </div>
              <CardDescription className="flex items-center gap-2 text-muted-foreground">
                <Users className="h-4 w-4" />
                {materia.docente}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {materia.totalClases > 0 ? (
                <>
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-muted-foreground mb-1">
                      <span>Porcentaje de Asistencia</span>
                      <span className="font-semibold text-foreground">{materia.porcentaje}%</span>
                    </div>
                    <Progress value={materia.porcentaje} className="h-2" indicatorClassName={getProgressColor(materia.porcentaje)} />
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-center border-t pt-4 mt-4">
                    <div>
                      <CheckCircle className="h-5 w-5 mx-auto mb-1 text-emerald-500" />
                      <p className="font-semibold text-lg">{materia.asistencias}</p>
                      <p className="text-xs text-muted-foreground">Asistencias</p>
                    </div>
                    <div>
                      <XCircle className="h-5 w-5 mx-auto mb-1 text-red-500" />
                      <p className="font-semibold text-lg">{materia.faltas}</p>
                      <p className="text-xs text-muted-foreground">Faltas</p>
                    </div>
                    {/* Retardos y Justificados pueden ir aquí o agruparse */}
                    <div className="col-span-2 flex justify-around mt-2">
                        <div className="text-center">
                            <MinusCircle className="h-5 w-5 mx-auto mb-1 text-yellow-500" />
                            <p className="font-semibold text-lg">{materia.retardos}</p>
                            <p className="text-xs text-muted-foreground">Retardos</p>
                        </div>
                        <div className="text-center">
                            <Info className="h-5 w-5 mx-auto mb-1 text-blue-500" />
                            <p className="font-semibold text-lg">{materia.justificados}</p>
                            <p className="text-xs text-muted-foreground">Justificadas</p>
                        </div>
                    </div>
                  </div>

                  <Button variant="link" className="w-full mt-4 text-academic-blue-500 hover:text-academic-blue-600">
                    Ver Registro de {materia.nombre}
                    <ClipboardList className="ml-2 h-4 w-4" />
                  </Button>
                </>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <CalendarDays className="h-10 w-10 mx-auto mb-3" />
                  <p>Aún no hay registros de asistencia para esta materia.</p>
                  <Button variant="link" className="mt-2 text-academic-blue-500">Ver Calendario</Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}