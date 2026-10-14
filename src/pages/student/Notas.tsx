// src/pages/student/Notas.tsx
// CONECTADO AL BACKEND - Consume API real
import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import {
  NotebookPen,
  BookOpen,
  CheckCircle,
  XCircle,
  Award,
  TrendingUp,
  Scale,
  CalendarDays,
  RefreshCw
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Progress } from '@/components/ui/progress';
import { getMyGrades, StudentSubjectGrades, getSubjectColor } from '@/services/studentPortalApi';

export default function StudentNotas() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [materias, setMaterias] = useState<StudentSubjectGrades[]>([]);

  // Cargar calificaciones desde el backend
  const fetchGrades = async (showToast = false) => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      if (showToast) setRefreshing(true);
      
      const data = await getMyGrades();
      setMaterias(data);

      if (showToast) {
        toast({
          title: "Calificaciones actualizadas",
          description: "Se han cargado las calificaciones más recientes",
        });
      }
    } catch (error) {
      console.error('Error cargando calificaciones:', error);
      if (showToast) {
        toast({
          title: "Error",
          description: "No se pudieron cargar las calificaciones",
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
      fetchGrades();
    } else {
      const timer = setTimeout(() => fetchGrades(), 500);
      return () => clearTimeout(timer);
    }
  }, []);

  // Cálculo del promedio general
  const promedioGeneral = useMemo(() => {
    const promedios = materias
      .map(m => m.promedio)
      .filter((p): p is number => p !== null && p !== undefined);
    
    if (promedios.length === 0) return null;
    return Math.round(promedios.reduce((a, b) => a + b, 0) / promedios.length);
  }, [materias]);

  const getPuntajeColor = (puntaje: number) => {
    if (puntaje < 51) return 'text-red-500 bg-red-50';
    if (puntaje < 70) return 'text-orange-500 bg-orange-50';
    if (puntaje < 85) return 'text-blue-600 bg-blue-50';
    return 'text-emerald-600 bg-emerald-50';
  };

  const getProgressColor = (value: number) => {
    if (value < 51) return 'bg-red-500';
    if (value < 70) return 'bg-orange-500';
    return 'bg-emerald-500';
  };

  if (loading) {
    return (
      <div className="space-y-8 p-4">
        <div className="flex justify-between items-center">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-40" />
        </div>
        <Card>
          <CardContent className="pt-6">
            <Skeleton className="h-16 w-32 mx-auto mb-4" />
            <Skeleton className="h-3 w-full" />
          </CardContent>
        </Card>
        {[1, 2, 3].map(i => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="flex justify-between">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-6 w-20" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

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
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => fetchGrades(true)}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
          <Button variant="outline" className="bg-academic-blue-500 hover:bg-academic-blue-600 text-white hover:text-white">
            <TrendingUp className="h-4 w-4 mr-2" />
            Historial
          </Button>
        </div>
      </div>

      {/* Promedio General */}
      <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl font-bold">Promedio General</CardTitle>
          <Award className="h-6 w-6 text-academic-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-5xl font-extrabold text-center py-4 text-academic-blue-500">
            {promedioGeneral !== null ? promedioGeneral : 'N/A'}
          </div>
          <Progress 
            value={promedioGeneral || 0} 
            className="h-3 w-full" 
            indicatorClassName={getProgressColor(promedioGeneral || 0)} 
          />
          <p className="text-sm text-muted-foreground text-center mt-2">
            {materias.length > 0 
              ? `Basado en ${materias.length} materias registradas`
              : 'Sin calificaciones registradas aún'
            }
          </p>
        </CardContent>
      </Card>

      {/* Promedios por Bimestre */}
      {materias.length > 0 && materias[0].bimestres && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Promedios por Bimestre</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(bim => {
                const promBim = materias
                  .map(m => m.bimestres?.find(b => b.bimestre === bim)?.promedio)
                  .filter((p): p is number => p !== null && p !== undefined);
                const promedio = promBim.length > 0 
                  ? Math.round(promBim.reduce((a, b) => a + b, 0) / promBim.length) 
                  : null;
                
                return (
                  <div key={bim} className="p-4 rounded-lg bg-muted text-center">
                    <p className="text-sm text-muted-foreground mb-1">{bim}° Bimestre</p>
                    <p className={`text-2xl font-bold ${promedio && promedio >= 51 ? 'text-emerald-600' : promedio ? 'text-red-500' : 'text-muted-foreground'}`}>
                      {promedio !== null ? promedio : '-'}
                    </p>
                    {promedio !== null && (
                      <Badge variant={promedio >= 51 ? 'default' : 'destructive'} className="mt-2">
                        {promedio >= 51 ? 'Aprobado' : 'Reprobado'}
                      </Badge>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <Separator className="my-8" />

      {/* Notas por Materia */}
      <h2 className="text-2xl font-bold text-foreground mb-4">Detalle por Materia</h2>
      
      {materias.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <NotebookPen className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">Sin calificaciones</h3>
            <p className="text-muted-foreground">
              Aún no tienes calificaciones registradas en el sistema.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Accordion type="single" collapsible className="w-full space-y-4">
          {materias.map((materia, index) => (
            <Card key={materia.materia_id || index}>
              <AccordionItem value={`item-${materia.materia_id || index}`} className="border-b-0">
                <AccordionTrigger className="px-4 py-3 hover:no-underline">
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-3">
                      <BookOpen className="h-5 w-5 text-academic-blue-500" />
                      <span className="font-semibold text-lg text-foreground">{materia.materia}</span>
                      <Badge className={`px-2 py-1 text-xs font-medium ${materia.color || getSubjectColor(materia.materia)}`}>
                        {materia.calificaciones.length} Notas
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`font-bold text-xl ${materia.promedio && materia.promedio >= 51 ? 'text-emerald-600' : materia.promedio ? 'text-red-500' : 'text-muted-foreground'}`}>
                        {materia.promedio !== null ? materia.promedio : 'N/A'}
                      </span>
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
                      {materia.bimestres && (
                        <div className="grid grid-cols-4 gap-2 mb-4">
                          {materia.bimestres.map(b => (
                            <div key={b.bimestre} className="text-center p-2 bg-background rounded">
                              <p className="text-xs text-muted-foreground">Bim {b.bimestre}</p>
                              <p className={`font-bold ${b.promedio && b.promedio >= 51 ? 'text-emerald-600' : b.promedio ? 'text-red-500' : 'text-muted-foreground'}`}>
                                {b.promedio || '-'}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                      {materia.calificaciones
                        .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
                        .map(calif => (
                          <div key={calif.id} className="border rounded-md p-3 bg-card shadow-sm">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium text-base">{calif.evaluacion}</h4>
                              <div className="flex items-center gap-2">
                                {calif.nota >= 51 ? (
                                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                                ) : (
                                  <XCircle className="h-4 w-4 text-red-500" />
                                )}
                                <Badge className={`text-base font-bold ${getPuntajeColor(calif.nota)}`}>
                                  {calif.nota}
                                </Badge>
                              </div>
                            </div>
                            <div className="text-sm text-muted-foreground grid grid-cols-2 gap-y-1">
                              <span className="flex items-center gap-1">
                                <CalendarDays className="h-3 w-3" />
                                {new Date(calif.fecha).toLocaleDateString()}
                              </span>
                              <span className="flex items-center gap-1">
                                <Scale className="h-3 w-3" />
                                Bimestre {calif.bimestre}
                              </span>
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
      )}
    </div>
  );
}