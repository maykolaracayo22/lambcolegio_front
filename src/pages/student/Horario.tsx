// src/pages/student/Horario.tsx
// CONECTADO AL BACKEND - Consume API real
import React, { useMemo, useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import {
  CalendarDays, Clock, BookOpen, User, MapPin, 
  ArrowLeft, ArrowRight, RefreshCw
} from 'lucide-react';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { getMySchedule, ScheduleClass } from '@/services/studentPortalApi';

// Mapeo de colores para materias
const materiaColors: Record<string, string> = {
  'Matemáticas': 'bg-indigo-100 text-indigo-800 border-indigo-400',
  'Español': 'bg-blue-100 text-blue-800 border-blue-400',
  'Lenguaje': 'bg-blue-100 text-blue-800 border-blue-400',
  'Ciencias': 'bg-emerald-100 text-emerald-800 border-emerald-400',
  'Ciencias Naturales': 'bg-emerald-100 text-emerald-800 border-emerald-400',
  'Historia': 'bg-purple-100 text-purple-800 border-purple-400',
  'Ciencias Sociales': 'bg-purple-100 text-purple-800 border-purple-400',
  'Inglés': 'bg-yellow-100 text-yellow-800 border-yellow-400',
  'Educación Física': 'bg-orange-100 text-orange-800 border-orange-400',
  'Música': 'bg-pink-100 text-pink-800 border-pink-400',
  'Arte': 'bg-rose-100 text-rose-800 border-rose-400',
  'Computación': 'bg-cyan-100 text-cyan-800 border-cyan-400',
  'Religión': 'bg-amber-100 text-amber-800 border-amber-400',
  'default': 'bg-gray-100 text-gray-800 border-gray-400'
};

const getMateriaColor = (materia: string): string => {
  for (const [key, color] of Object.entries(materiaColors)) {
    if (materia.toLowerCase().includes(key.toLowerCase())) {
      return color;
    }
  }
  return materiaColors['default'];
};

export default function StudentHorario() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [schedule, setSchedule] = useState<ScheduleClass[]>([]);
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(startOfWeek(new Date(), { weekStartsOn: 1 }));

  // Cargar horario desde el backend
  const fetchSchedule = async (showToast = false) => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      if (showToast) setRefreshing(true);
      
      const data = await getMySchedule();
      setSchedule(data);

      if (showToast) {
        toast({
          title: "Horario actualizado",
          description: "Se ha cargado el horario más reciente",
        });
      }
    } catch (error) {
      console.error('Error cargando horario:', error);
      if (showToast) {
        toast({
          title: "Error",
          description: "No se pudo cargar el horario",
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
      fetchSchedule();
    } else {
      const timer = setTimeout(() => fetchSchedule(), 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const daysOfWeek = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

  const weekDates = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => addDays(currentWeekStart, i));
  }, [currentWeekStart]);

  const goToPreviousWeek = () => {
    setCurrentWeekStart(prev => addDays(prev, -7));
  };

  const goToNextWeek = () => {
    setCurrentWeekStart(prev => addDays(prev, 7));
  };

  const goToCurrentWeek = () => {
    setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }));
  };

  // Transformar schedule al formato esperado por día
  const getClassesForDay = (dayName: string): ScheduleClass[] => {
    return schedule
      .filter(clase => clase.dia === dayName)
      .sort((a, b) => a.horaInicio.localeCompare(b.horaInicio));
  };

  if (loading) {
    return (
      <div className="space-y-6 p-4">
        <div className="flex justify-between items-center">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-40" />
        </div>
        <Card>
          <CardContent className="p-4">
            <Skeleton className="h-12 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="border rounded-lg p-4">
                  <Skeleton className="h-6 w-24 mb-4" />
                  <Skeleton className="h-24 w-full mb-2" />
                  <Skeleton className="h-24 w-full" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

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
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={() => fetchSchedule(true)}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
          <Button variant="outline" onClick={goToCurrentWeek} className="bg-academic-blue-500 hover:bg-academic-blue-600 text-white hover:text-white">
            <CalendarDays className="h-4 w-4 mr-2" />
            Semana Actual
          </Button>
        </div>
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
          <CardDescription>
            {schedule.length > 0 
              ? 'Aquí puedes ver el detalle de tus asignaturas día por día.'
              : 'No hay clases programadas para mostrar.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {schedule.length === 0 ? (
            <div className="text-center py-12">
              <CalendarDays className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">Sin horario</h3>
              <p className="text-muted-foreground">
                No tienes clases asignadas aún. Contacta a tu institución.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {daysOfWeek.slice(0, 5).map((dayName, index) => {
                const currentDayDate = weekDates[index];
                const classesForDay = getClassesForDay(dayName);

                return (
                  <div 
                    key={dayName} 
                    className={`border rounded-lg p-4 ${isSameDay(currentDayDate, new Date()) ? 'bg-academic-blue-50 border-academic-blue-300 shadow-md' : 'bg-card'}`}
                  >
                    <h3 className="font-bold text-lg mb-3 flex items-center justify-between">
                      <span>{dayName}</span>
                      <span className="text-sm font-normal text-muted-foreground">
                        {format(currentDayDate, 'dd/MM', { locale: es })}
                      </span>
                    </h3>
                    {classesForDay.length > 0 ? (
                      <div className="space-y-4">
                        {classesForDay.map((clase, idx) => {
                          const colorClass = getMateriaColor(clase.materia);
                          const borderColor = colorClass.split(' ').find(c => c.startsWith('border-'))?.replace('border-', '') || 'gray-400';
                          
                          return (
                            <div 
                              key={`${clase.materia}-${idx}`} 
                              className={`border-l-4 pl-3 py-1 border-${borderColor}`}
                            >
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
                          );
                        })}
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}