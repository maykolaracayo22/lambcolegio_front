// src/pages/student/Notas.tsx
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  NotebookPen,     // Icono principal para Notas
  BookOpen,        // Para materias
  CheckCircle,     // Para indicar una calificación aprobatoria
  XCircle,         // Para indicar una calificación reprobatoria
  Award,           // Para promedios o logros
  Star,            // Para destacar alguna nota
  TrendingUp,      // Para ver el historial de notas
  Scale,           // Para el rango de calificación
  CalendarDays     // Para la fecha de la calificación
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'; // Para expandir/colapsar detalles por materia
import { Progress } from '@/components/ui/progress';

// Tipos de datos (se pueden mover a un archivo compartido)
interface Calificacion {
  id: number;
  tareaTitulo: string;
  materia: string;
  docente: string;
  fechaCalificacion: string; // Formato 'YYYY-MM-DD'
  puntaje: number; // Por ejemplo, de 0 a 100
  pesoEnMateria?: number; // Opcional: el porcentaje que esta tarea aporta a la nota final de la materia
  comentarios?: string;
}

interface MateriaInfo {
  id: number;
  nombre: string;
  docente: string;
  color: string; // Clases de Tailwind para el color del badge
}

export default function StudentNotas() {

  // --- Datos de ejemplo ---
  const materiasInfo: MateriaInfo[] = useMemo(() => [
    { id: 1, nombre: 'Matemáticas', docente: 'Prof. García', color: 'bg-indigo-100 text-indigo-800' },
    { id: 2, nombre: 'Español', docente: 'Prof. López', color: 'bg-blue-100 text-blue-800' },
    { id: 3, nombre: 'Ciencias', docente: 'Prof. Martín', color: 'bg-emerald-100 text-emerald-800' },
    { id: 4, nombre: 'Historia', docente: 'Prof. Rodríguez', color: 'bg-purple-100 text-purple-800' },
    { id: 5, nombre: 'Inglés', docente: 'Prof. Smith', color: 'bg-yellow-100 text-yellow-800' }
  ], []);

  const calificaciones: Calificacion[] = useMemo(() => [
    {
      id: 1,
      tareaTitulo: 'Ejercicios de álgebra',
      materia: 'Matemáticas',
      docente: 'Prof. García',
      fechaCalificacion: '2024-01-22',
      puntaje: 85,
      pesoEnMateria: 20,
      comentarios: 'Buen manejo de las ecuaciones, pero revisa los signos en el problema 3.'
    },
    {
      id: 2,
      tareaTitulo: 'Ensayo sobre literatura contemporánea',
      materia: 'Español',
      docente: 'Prof. López',
      fechaCalificacion: '2024-01-20',
      puntaje: 95,
      pesoEnMateria: 30,
      comentarios: 'Excelente análisis y estructura del ensayo. Muy bien referenciado.'
    },
    {
      id: 3,
      tareaTitulo: 'Examen corto de biología',
      materia: 'Ciencias',
      docente: 'Prof. Martín',
      fechaCalificacion: '2024-01-24',
      puntaje: 70,
      pesoEnMateria: 25,
      comentarios: 'Respondiste correctamente, pero algunos conceptos necesitan más profundidad.'
    },
    {
      id: 4,
      tareaTitulo: 'Investigación sobre la revolución industrial',
      materia: 'Historia',
      docente: 'Prof. Rodríguez',
      fechaCalificacion: '2024-01-15',
      puntaje: 60, // Nota más baja para mostrar feedback visual
      pesoEnMateria: 40,
      comentarios: 'La investigación fue superficial, falta analizar las fuentes y profundizar en las causas.'
    },
    {
      id: 5,
      tareaTitulo: 'Presentación sobre verbos irregulares',
      materia: 'Inglés',
      docente: 'Prof. Smith',
      fechaCalificacion: '2024-01-26',
      puntaje: 88,
      pesoEnMateria: 20,
      comentarios: 'Presentación dinámica y clara, los ejemplos fueron muy útiles.'
    },
    {
      id: 6,
      tareaTitulo: 'Problemas de física',
      materia: 'Ciencias',
      docente: 'Prof. Martín',
      fechaCalificacion: '2024-01-23',
      puntaje: 78,
      pesoEnMateria: 30,
      comentarios: 'Procedimientos correctos, pero errores de cálculo en el último problema.'
    },
    {
      id: 7,
      tareaTitulo: 'Control de lectura: "La Odisea"',
      materia: 'Español',
      docente: 'Prof. López',
      fechaCalificacion: '2024-01-27',
      puntaje: 75,
      pesoEnMateria: 20,
      comentarios: 'Demostraste buena comprensión general, pero algunos detalles de la trama no fueron precisos.'
    }
  ], []);

  // --- Lógica de cálculo de promedios y estado por materia ---
  const promediosPorMateria = useMemo(() => {
    return materiasInfo.map(materia => {
      const calificacionesDeMateria = calificaciones.filter(c => c.materia === materia.nombre);
      
      let sumaPuntajes = 0;
      let sumaPesos = 0;
      let promedioPonderado: number | null = null;
      let promedioSimple: number | null = null;

      if (calificacionesDeMateria.length > 0) {
        // Calcular promedio simple
        const totalPuntajes = calificacionesDeMateria.reduce((sum, c) => sum + c.puntaje, 0);
        promedioSimple = totalPuntajes / calificacionesDeMateria.length;

        // Calcular promedio ponderado si todas tienen peso
        if (calificacionesDeMateria.every(c => c.pesoEnMateria !== undefined)) {
            sumaPuntajes = calificacionesDeMateria.reduce((sum, c) => sum + (c.puntaje * (c.pesoEnMateria || 0)), 0);
            sumaPesos = calificacionesDeMateria.reduce((sum, c) => sum + (c.pesoEnMateria || 0), 0);
            if (sumaPesos > 0) {
                promedioPonderado = sumaPuntajes / sumaPesos;
            }
        }
      }

      const promedioFinal = promedioPonderado !== null ? promedioPonderado : promedioSimple;

      return {
        ...materia,
        calificaciones: calificacionesDeMateria,
        promedioFinal: promedioFinal !== null ? Math.round(promedioFinal) : 'N/A',
        promedioEsPonderado: promedioPonderado !== null
      };
    });
  }, [materiasInfo, calificaciones]);

  // Cálculo del promedio general (ponderado o simple)
  const promedioGeneral = useMemo(() => {
    let totalPuntajes = 0;
    let totalItems = 0;
    let totalPonderadoPuntos = 0;
    let totalPonderadoPesos = 0;
    let hayPesosEnTodas = calificaciones.every(c => c.pesoEnMateria !== undefined);

    if (calificaciones.length === 0) return 'N/A';

    if (hayPesosEnTodas) {
        calificaciones.forEach(c => {
            totalPonderadoPuntos += c.puntaje * (c.pesoEnMateria || 0);
            totalPonderadoPesos += (c.pesoEnMateria || 0);
        });
        return Math.round(totalPonderadoPuntos / totalPonderadoPesos);
    } else {
        // Promedio simple si no todas tienen peso
        calificaciones.forEach(c => {
            totalPuntajes += c.puntaje;
            totalItems++;
        });
        return Math.round(totalPuntajes / totalItems);
    }
  }, [calificaciones]);

  const getPuntajeColor = (puntaje: number) => {
    if (puntaje < 60) return 'text-red-500 bg-red-50'; // Reprobado
    if (puntaje < 75) return 'text-orange-500 bg-orange-50'; // Suficiente
    if (puntaje < 90) return 'text-blue-600 bg-blue-50'; // Bueno
    return 'text-emerald-600 bg-emerald-50'; // Excelente
  };

  const getProgressColor = (value: number) => { // Reutilizado de Materias.tsx
    if (value < 60) return 'bg-red-500';
    if (value < 75) return 'bg-orange-500';
    return 'bg-emerald-500';
  };

  return (
    <div className="space-y-8 p-4">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <NotebookPen className="h-7 w-7 text-academic-blue-500" />
            Mis Notas
          </h1>
          <p className="text-muted-foreground">
            Consulta tus calificaciones, promedios y comentarios de tus tareas y exámenes.
          </p>
        </div>
        {/* Un botón para "Ver historial de calificaciones" */}
        <Button variant="outline" className="bg-academic-blue-500 hover:bg-academic-blue-600 text-white hover:text-white">
          <TrendingUp className="h-4 w-4 mr-2" />
          Historial de Calificaciones
        </Button>
      </div>

      {/* Promedio General */}
      <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl font-bold">Promedio General</CardTitle>
          <Award className="h-6 w-6 text-academic-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-5xl font-extrabold text-center py-4 text-academic-blue-500">
            {promedioGeneral !== 'N/A' ? `${promedioGeneral}%` : promedioGeneral}
          </div>
          <Progress value={promedioGeneral === 'N/A' ? 0 : promedioGeneral as number} className="h-3 w-full" indicatorClassName={getProgressColor(promedioGeneral === 'N/A' ? 0 : promedioGeneral as number)} />
          <p className="text-sm text-muted-foreground text-center mt-2">
            Basado en tus calificaciones registradas en todas las materias.
          </p>
        </CardContent>
      </Card>

      <Separator className="my-8" />

      {/* Notas por Materia (Accordion) */}
      <h2 className="text-2xl font-bold text-foreground mb-4">Detalle por Materia</h2>
      <Accordion type="single" collapsible className="w-full space-y-4">
        {promediosPorMateria.map(materia => (
          <Card key={materia.id}>
            <AccordionItem value={`item-${materia.id}`} className="border-b-0">
              <AccordionTrigger className="px-4 py-3 hover:no-underline"> {/* Quitar underline al pasar mouse */}
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-3">
                    <BookOpen className="h-5 w-5 text-academic-blue-500" />
                    <span className="font-semibold text-lg text-foreground">{materia.nombre}</span>
                    <Badge className={`px-2 py-1 text-xs font-medium ${materia.color}`}>
                      {materia.calificaciones.length} Calificaciones
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xl text-academic-blue-500">
                      {materia.promedioFinal !== 'N/A' ? `${materia.promedioFinal}%` : 'N/A'}
                    </span>
                    {materia.promedioEsPonderado && (
                        <Badge variant="outline" className="text-xs">Ponderado</Badge>
                    )}
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 pt-0 border-t bg-muted/20">
                {materia.calificaciones.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground">
                    <NotebookPen className="h-10 w-10 mx-auto mb-3" />
                    <p>No hay calificaciones registradas para esta materia.</p>
                  </div>
                ) : (
                  <div className="space-y-4 pt-4">
                    {materia.calificaciones
                      .sort((a, b) => new Date(b.fechaCalificacion).getTime() - new Date(a.fechaCalificacion).getTime()) // Más reciente primero
                      .map(calif => (
                        <div key={calif.id} className="border rounded-md p-3 bg-card shadow-sm">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-base">{calif.tareaTitulo}</h4>
                            <div className="flex items-center gap-2">
                              {calif.puntaje >= 60 ? ( // Asumiendo 60 como nota mínima para aprobar
                                <CheckCircle className="h-4 w-4 text-emerald-500" />
                              ) : (
                                <XCircle className="h-4 w-4 text-red-500" />
                              )}
                              <Badge className={`text-base font-bold ${getPuntajeColor(calif.puntaje)}`}>
                                {calif.puntaje}%
                              </Badge>
                            </div>
                          </div>
                          <div className="text-sm text-muted-foreground grid grid-cols-2 gap-y-1">
                            <span className="flex items-center gap-1">
                                <CalendarDays className="h-3 w-3" />
                                Calificada: {new Date(calif.fechaCalificacion).toLocaleDateString()}
                            </span>
                            {calif.pesoEnMateria !== undefined && (
                              <span className="flex items-center gap-1">
                                <Scale className="h-3 w-3" />
                                Peso: {calif.pesoEnMateria}%
                              </span>
                            )}
                            {calif.comentarios && (
                              <p className="col-span-2 mt-2 text-xs border-t pt-2 italic">
                                "{calif.comentarios}"
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
          </Card>
        ))}
      </Accordion>
    </div>
  );
}