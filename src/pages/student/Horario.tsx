// src/pages/student/Horario.tsx
import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  CalendarDays,  // Icono principal para horario/calendario
  Clock,         // Para horas de clase
  BookOpen,      // Para materias
  User,          // Para docentes
  MapPin,        // Para ubicaciones/salones
  ArrowLeft, ArrowRight // Para navegar entre semanas o días
} from 'lucide-react';
import { format, startOfWeek, addDays, isSameDay, parseISO } from 'date-fns';
import { es } from 'date-fns/locale'; // Para fechas en español

// --- Tipos de Datos (Idealmente en un archivo compartido como types.ts) ---
interface Clase {
  id: number;
  materia: string;
  docente: string;
  salon: string;
  dia: 'Lunes' | 'Martes' | 'Miércoles' | 'Jueves' | 'Viernes' | 'Sábado' | 'Domingo';
  horaInicio: string; // Ejemplo: "08:00"
  horaFin: string;    // Ejemplo: "09:30"
  color: string;      // Clase de Tailwind para el color de la materia
}

interface MateriaInfo {
  id: number;
  nombre: string;
  docente: string;
  color: string; // Clases de Tailwind para el color del badge
}

export default function StudentHorario() {
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(startOfWeek(new Date(), { weekStartsOn: 1 })); // Lunes como inicio de semana

  // --- Datos de Ejemplo (pueden venir de una API) ---
  const materiasInfo: MateriaInfo[] = useMemo(() => [
    { id: 1, nombre: 'Matemáticas', docente: 'Prof. García', color: 'bg-indigo-100 text-indigo-800' },
    { id: 2, nombre: 'Español', docente: 'Prof. López', color: 'bg-blue-100 text-blue-800' },
    { id: 3, nombre: 'Ciencias', docente: 'Prof. Martín', color: 'bg-emerald-100 text-emerald-800' },
    { id: 4, nombre: 'Historia', docente: 'Prof. Rodríguez', color: 'bg-purple-100 text-purple-800' },
    { id: 5, nombre: 'Inglés', docente: 'Prof. Smith', color: 'bg-yellow-100 text-yellow-800' }
  ], []);

  const horarioClases: Clase[] = useMemo(() => [
    { id: 1, materia: 'Matemáticas', docente: 'Prof. García', salon: 'Aula 101', dia: 'Lunes', horaInicio: '08:00', horaFin: '09:30', color: materiasInfo.find(m => m.nombre === 'Matemáticas')?.color || 'bg-gray-100 text-gray-800' },
    { id: 2, materia: 'Español', docente: 'Prof. López', salon: 'Aula 102', dia: 'Lunes', horaInicio: '09:30', horaFin: '11:00', color: materiasInfo.find(m => m.nombre === 'Español')?.color || 'bg-gray-100 text-gray-800' },
    { id: 3, materia: 'Ciencias', docente: 'Prof. Martín', salon: 'Lab C', dia: 'Martes', horaInicio: '10:00', horaFin: '11:30', color: materiasInfo.find(m => m.nombre === 'Ciencias')?.color || 'bg-gray-100 text-gray-800' },
    { id: 4, materia: 'Historia', docente: 'Prof. Rodríguez', salon: 'Aula 201', dia: 'Miércoles', horaInicio: '14:00', horaFin: '15:30', color: materiasInfo.find(m => m.nombre === 'Historia')?.color || 'bg-gray-100 text-gray-800' },
    { id: 5, materia: 'Inglés', docente: 'Prof. Smith', salon: 'Lab Idiomas', dia: 'Jueves', horaInicio: '09:00', horaFin: '10:30', color: materiasInfo.find(m => m.nombre === 'Inglés')?.color || 'bg-gray-100 text-gray-800' },
    { id: 6, materia: 'Matemáticas', docente: 'Prof. García', salon: 'Aula 101', dia: 'Viernes', horaInicio: '08:00', horaFin: '09:30', color: materiasInfo.find(m => m.nombre === 'Matemáticas')?.color || 'bg-gray-100 text-gray-800' },
    { id: 7, materia: 'Español', docente: 'Prof. López', salon: 'Aula 102', dia: 'Viernes', horaInicio: '09:30', horaFin: '11:00', color: materiasInfo.find(m => m.nombre === 'Español')?.color || 'bg-gray-100 text-gray-800' },
    { id: 8, materia: 'Ciencias', docente: 'Prof. Martín', salon: 'Lab C', dia: 'Viernes', horaInicio: '11:00', horaFin: '12:30', color: materiasInfo.find(m => m.nombre === 'Ciencias')?.color || 'bg-gray-100 text-gray-800' },
  ], [materiasInfo]);

  // Nombres de los días en español (para usar con date-fns)
  const daysOfWeek = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

  // Generar las fechas para la semana actual
  const weekDates = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => addDays(currentWeekStart, i));
  }, [currentWeekStart]);

  // Navegación de semana
  const goToPreviousWeek = () => {
    setCurrentWeekStart(prev => addDays(prev, -7));
  };

  const goToNextWeek = () => {
    setCurrentWeekStart(prev => addDays(prev, 7));
  };

  const goToCurrentWeek = () => {
    setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }));
  };

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <CalendarDays className="h-7 w-7 text-academic-blue-500" />
            Mi Horario
          </h1>
          <p className="text-muted-foreground">
            Consulta tus clases programadas para esta semana y las próximas.
          </p>
        </div>
        <Button variant="outline" onClick={goToCurrentWeek} className="bg-academic-blue-500 hover:bg-academic-blue-600 text-white hover:text-white">
          <CalendarDays className="h-4 w-4 mr-2" />
          Semana Actual
        </Button>
      </div>

      {/* Navegación de Semanas */}
      <Card>
        <CardContent className="p-4 flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={goToPreviousWeek}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="text-center">
            <h2 className="text-lg font-semibold">
              {format(currentWeekStart, 'dd MMMM yyyy', { locale: es })} - {format(addDays(currentWeekStart, 6), 'dd MMMM yyyy', { locale: es })}
            </h2>
            <p className="text-sm text-muted-foreground">
              Semana {format(currentWeekStart, 'w', { locale: es })}
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={goToNextWeek}>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>

      {/* Horario Semanal */}
      <Card>
        <CardHeader>
          <CardTitle>Clases Semanales</CardTitle>
          <CardDescription>Aquí puedes ver el detalle de tus asignaturas día por día.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4"> {/* Adaptado para 5 días laborales o 7 */}
            {daysOfWeek.map((dayName, index) => {
              const currentDayDate = weekDates[index];
              const classesForDay = horarioClases.filter(clase => clase.dia === dayName)
                                                  .sort((a, b) => a.horaInicio.localeCompare(b.horaInicio)); // Ordenar por hora

              return (
                <div key={dayName} className={`border rounded-lg p-4 ${isSameDay(currentDayDate, new Date()) ? 'bg-academic-blue-50 border-academic-blue-300 shadow-md' : 'bg-card'}`}>
                  <h3 className="font-bold text-lg mb-3 flex items-center justify-between">
                    <span>{dayName}</span>
                    <span className="text-sm font-normal text-muted-foreground">{format(currentDayDate, 'dd/MM', { locale: es })}</span>
                  </h3>
                  {classesForDay.length > 0 ? (
                    <div className="space-y-4">
                      {classesForDay.map(clase => (
                        <div key={clase.id} className="border-l-4 pl-3 py-1" style={{ borderColor: clase.color.split(' ')[0].replace('bg-', '#') || 'gray' }}> {/* Color dinámico basado en la clase de Tailwind */}
                          <p className="font-semibold text-foreground text-base mb-1 flex items-center gap-2">
                            <BookOpen className="h-4 w-4 text-academic-blue-500" />
                            {clase.materia}
                          </p>
                          <div className="text-sm text-muted-foreground space-y-1">
                            <p className="flex items-center gap-2">
                              <Clock className="h-3 w-3" />
                              {clase.horaInicio} - {clase.horaFin}
                            </p>
                            <p className="flex items-center gap-2">
                              <User className="h-3 w-3" />
                              {clase.docente}
                            </p>
                            <p className="flex items-center gap-2">
                              <MapPin className="h-3 w-3" />
                              {clase.salon}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-muted-foreground">
                      <CalendarDays className="h-10 w-10 mx-auto mb-3" />
                      <p>No hay clases programadas.</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}