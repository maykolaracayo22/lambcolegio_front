// src/pages/student/Asistencia.tsx
// CONECTADO AL BACKEND - Consume API real
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import {
  CalendarDays,
  CheckCircle,
  XCircle,
  MinusCircle,
  BookOpen,
  Info,
  ClipboardList,
  RefreshCw
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { getMyAttendance, AttendanceRecord, AttendanceStats } from '@/services/studentPortalApi';

export default function StudentAsistencia() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [stats, setStats] = useState<AttendanceStats>({
    total_clases: 0,
    asistencias: 0,
    faltas: 0,
    retardos: 0,
    justificados: 0,
    porcentaje: 0,
  });

  const formatAttendanceDate = (value: string) => {
    const [year, month, day] = value.slice(0, 10).split('-').map(Number);
    if (!year || !month || !day) return value;
    return new Date(year, month - 1, day).toLocaleDateString('es-BO', {
      weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
    });
  };

  // Cargar asistencia desde el backend
  const fetchAttendance = async (showToast = false) => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      if (showToast) setRefreshing(true);
      
      const data = await getMyAttendance();
      setRecords(data.records);
      setStats(data.stats);
      setLoadError(null);

      if (showToast) {
        toast({
          title: "Asistencia actualizada",
          description: "Se han cargado los registros más recientes",
        });
      }
    } catch (error) {
      console.error('Error cargando asistencia:', error);
      const apiError = error as { response?: { data?: { message?: string } }; message?: string };
      setLoadError(apiError.response?.data?.message || apiError.message || 'No se pudieron cargar tus asistencias.');
      if (showToast) {
        toast({
          title: "Error",
          description: apiError.response?.data?.message || "No se pudo cargar la asistencia",
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
      fetchAttendance();
    } else {
      const timer = setTimeout(() => fetchAttendance(), 500);
      return () => clearTimeout(timer);
    }
  }, []);

  // Agrupar por materia
  const attendanceByMateria = React.useMemo(() => {
    const materias = new Map<string, {
      nombre: string;
      total: number;
      asistencias: number;
      faltas: number;
      retardos: number;
      justificados: number;
      porcentaje: number;
    }>();

    records.forEach(r => {
      const key = r.materia || 'General';
      if (!materias.has(key)) {
        materias.set(key, {
          nombre: key,
          total: 0,
          asistencias: 0,
          faltas: 0,
          retardos: 0,
          justificados: 0,
          porcentaje: 0,
        });
      }
      const m = materias.get(key)!;
      m.total++;
      if (r.estado === 'asistencia') m.asistencias++;
      else if (r.estado === 'falta') m.faltas++;
      else if (r.estado === 'retardo') m.retardos++;
      else if (r.estado === 'justificado') m.justificados++;
    });

    materias.forEach(m => {
      const totalEfectivo = m.total - m.justificados;
      m.porcentaje = totalEfectivo > 0 ? Math.round((m.asistencias / totalEfectivo) * 100) : 0;
    });

    return Array.from(materias.values());
  }, [records]);

  const getProgressColor = (value: number) => {
    if (value < 70) return 'bg-red-500';
    if (value < 85) return 'bg-yellow-500';
    return 'bg-emerald-500';
  };

  const getBadgeColor = (estado: AttendanceRecord['estado']) => {
    switch(estado) {
      case 'asistencia': return 'bg-emerald-100 text-emerald-800';
      case 'falta': return 'bg-red-100 text-red-800';
      case 'retardo': return 'bg-yellow-100 text-yellow-800';
      case 'justificado': return 'bg-blue-100 text-blue-800';
      case 'licencia': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEstadoIcon = (estado: AttendanceRecord['estado']) => {
    switch(estado) {
      case 'asistencia': return <CheckCircle className="h-4 w-4" />;
      case 'falta': return <XCircle className="h-4 w-4" />;
      case 'retardo': return <MinusCircle className="h-4 w-4" />;
      case 'justificado': return <Info className="h-4 w-4" />;
      default: return null;
    }
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
            <div className="grid grid-cols-4 gap-4 mt-6">
              {[1, 2, 3, 4].map(i => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-4">
      {loadError && <Card className="border-red-300 bg-red-50"><CardContent className="flex flex-wrap items-center justify-between gap-3 p-4 text-sm text-red-800"><span>No se pudo cargar tu asistencia: {loadError}</span><Button size="sm" variant="outline" onClick={() => fetchAttendance(true)} disabled={refreshing}>Reintentar</Button></CardContent></Card>}
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
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => fetchAttendance(true)}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
          <Button variant="outline" className="bg-academic-blue-500 hover:bg-academic-blue-600 text-white hover:text-white">
            <ClipboardList className="h-4 w-4 mr-2" />
            Ver Historial Completo
          </Button>
        </div>
      </div>

      {/* Tarjeta de Resumen General */}
      <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl font-bold">Asistencia General</CardTitle>
          <CalendarDays className="h-6 w-6 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-5xl font-extrabold text-center py-4 text-academic-blue-500">
            {stats.porcentaje}%
          </div>
          <Progress value={stats.porcentaje} className="h-3 w-full" indicatorClassName={getProgressColor(stats.porcentaje)} />
          <p className="text-sm text-muted-foreground text-center mt-2">
            {stats.total_clases > 0 
              ? `Basado en ${stats.total_clases} clases registradas`
              : 'Sin registros de asistencia aún'
            }
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 border-t pt-4">
            <div className="text-center">
              <CheckCircle className="h-6 w-6 mx-auto mb-1 text-emerald-500" />
              <p className="font-semibold text-lg">{stats.asistencias}</p>
              <p className="text-xs text-muted-foreground">Asistencias</p>
            </div>
            <div className="text-center">
              <XCircle className="h-6 w-6 mx-auto mb-1 text-red-500" />
              <p className="font-semibold text-lg">{stats.faltas}</p>
              <p className="text-xs text-muted-foreground">Faltas</p>
            </div>
            <div className="text-center">
              <MinusCircle className="h-6 w-6 mx-auto mb-1 text-yellow-500" />
              <p className="font-semibold text-lg">{stats.retardos}</p>
              <p className="text-xs text-muted-foreground">Retardos</p>
            </div>
            <div className="text-center">
              <Info className="h-6 w-6 mx-auto mb-1 text-blue-500" />
              <p className="font-semibold text-lg">{stats.justificados}</p>
              <p className="text-xs text-muted-foreground">Justificados</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator className="my-8" />

      {/* Asistencia por Materia */}
      <h2 className="text-2xl font-bold text-foreground mb-4">Detalle por Asignatura</h2>
      
      {attendanceByMateria.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <CalendarDays className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">Sin registros</h3>
            <p className="text-muted-foreground">
              Aún no tienes registros de asistencia en el sistema.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {attendanceByMateria.map((materia, idx) => (
            <Card key={idx} className="group hover:shadow-md transition-shadow duration-200">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between mb-2">
                  <CardTitle className="text-xl font-semibold flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-academic-blue-500" />
                    {materia.nombre}
                  </CardTitle>
                  <Badge className="px-3 py-1 text-sm font-medium bg-gray-100 text-gray-800">
                    {materia.total} Clases
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
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
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Historial reciente */}
      {records.length > 0 && (
        <>
          <Separator className="my-8" />
          <h2 className="text-2xl font-bold text-foreground mb-4">Registros Recientes</h2>
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-3">
                {records.slice(0, 10).map((record, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      {getEstadoIcon(record.estado)}
                      <div>
                        <p className="font-medium">{record.materia}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatAttendanceDate(record.fecha)}
                        </p>
                      </div>
                    </div>
                    <Badge className={getBadgeColor(record.estado)}>
                      {record.estado === 'asistencia' ? 'Presente' : 
                       record.estado === 'falta' ? 'Falta' :
                       record.estado === 'retardo' ? 'Retardo' :
                       record.estado === 'justificado' ? 'Justificado' : record.estado}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
