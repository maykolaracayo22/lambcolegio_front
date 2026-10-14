// src/pages/parent/Asistencia.tsx
// CONECTADO AL BACKEND - Consume API real
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar } from '@/components/ui/calendar';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { 
  Download, Check, X, Clock, AlertCircle, Calendar as CalendarIcon, 
  Filter, ChevronRight, Phone, RefreshCw
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { 
  getChildAttendance, getChildInfo, 
  ChildAttendanceRecord, ChildAttendanceStats 
} from '@/services/parentPortalApi';

export default function Asistencia() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedMes, setSelectedMes] = useState('todos');
  
  const [stats, setStats] = useState<ChildAttendanceStats>({
    totalClases: 0,
    presentes: 0,
    ausentes: 0,
    tardanzas: 0,
    justificados: 0,
    porcentajeAsistencia: 0
  });
  const [records, setRecords] = useState<ChildAttendanceRecord[]>([]);
  
  // Info del estudiante
  const childInfo = getChildInfo();

  // Cargar asistencia desde el backend
  const fetchAttendance = async (showToast = false) => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      if (showToast) setRefreshing(true);
      
      const data = await getChildAttendance();
      setStats(data.stats);
      setRecords(data.records);

      if (showToast) {
        toast({
          title: "Asistencia actualizada",
          description: "Se han cargado los datos más recientes",
        });
      }
    } catch (error) {
      console.error('Error cargando asistencia:', error);
      if (showToast) {
        toast({
          title: "Error",
          description: "No se pudo cargar la asistencia",
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

  // Filtrar registros por mes
  const filteredRecords = records.filter(record => {
    if (selectedMes === 'todos') return true;
    const recordDate = new Date(record.fecha);
    const month = recordDate.getMonth();
    const monthMap: Record<string, number> = {
      'enero': 0, 'febrero': 1, 'marzo': 2, 'abril': 3,
      'mayo': 4, 'junio': 5, 'julio': 6, 'agosto': 7,
      'septiembre': 8, 'octubre': 9, 'noviembre': 10, 'diciembre': 11
    };
    return month === monthMap[selectedMes];
  });

  const justificar = (id: number) => {
    window.open('https://wa.me/59112345678', '_blank');
  };
  
  const verDetalle = (id: number) => {
    const record = records.find(r => r.id === id);
    if (record) {
      alert(`Detalle de asistencia:\n\nFecha: ${record.fecha}\nMateria: ${record.materia}\nEstado: ${record.estado}\nObservación: ${record.observacion || 'Sin observación'}`);
    }
  };

  const getEstadoIcon = (estado: ChildAttendanceRecord['estado']) => {
    switch (estado) {
      case 'presente': return <Check className="h-4 w-4 text-green-500" />;
      case 'ausente': return <X className="h-4 w-4 text-red-500" />;
      case 'tardanza': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'justificado': return <CalendarIcon className="h-4 w-4 text-blue-500" />;
      default: return null;
    }
  };

  const getEstadoLabel = (estado: ChildAttendanceRecord['estado']) => {
    switch (estado) {
      case 'presente': return 'Asistió';
      case 'ausente': return 'Falta';
      case 'tardanza': return 'Tarde';
      case 'justificado': return 'Justificado';
      default: return estado;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 p-4">
        <div className="flex justify-between items-center">
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-6 w-24 mb-2" />
                <Skeleton className="h-10 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
          <Card className="lg:col-span-2">
            <CardContent className="p-6">
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      {/* Encabezado */}
      <header className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Control de Asistencia</h1>
            <p className="text-muted-foreground">
              {childInfo 
                ? `${childInfo.nombres} ${childInfo.apellidos} - ${childInfo.curso} ${childInfo.nivel} "${childInfo.paralelo}"`
                : 'Cargando información del estudiante...'
              }
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button 
              variant="outline"
              onClick={() => fetchAttendance(true)}
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>
            <Button variant="outline" onClick={() => window.open('https://wa.me/59112345678', '_blank')}>
              <Phone className="h-5 w-5 mr-2" />
              Justificar por WhatsApp
            </Button>
            <Button variant="outline">
              <Download className="h-5 w-5 mr-2" />
              Descargar Reporte
            </Button>
          </div>
        </div>
      </header>

      {/* Resumen de Asistencia */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className={stats.porcentajeAsistencia >= 85 ? 'border-green-500' : 'border-yellow-500'}>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm text-muted-foreground">Asistencia Total</p>
              <Check className={`h-5 w-5 ${stats.porcentajeAsistencia >= 85 ? 'text-green-500' : 'text-yellow-500'}`} />
            </div>
            <p className="text-3xl font-bold mb-1">{stats.porcentajeAsistencia.toFixed(1)}%</p>
            <Progress value={stats.porcentajeAsistencia} className="h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm text-muted-foreground">Faltas</p>
              <X className="h-5 w-5 text-red-500" />
            </div>
            <p className="text-3xl font-bold">{stats.ausentes}</p>
            <p className="text-sm text-muted-foreground">Total de inasistencias</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm text-muted-foreground">Tardanzas</p>
              <Clock className="h-5 w-5 text-yellow-500" />
            </div>
            <p className="text-3xl font-bold">{stats.tardanzas}</p>
            <p className="text-sm text-muted-foreground">Este período</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm text-muted-foreground">Justificados</p>
              <CalendarIcon className="h-5 w-5 text-blue-500" />
            </div>
            <p className="text-3xl font-bold">{stats.justificados}</p>
            <p className="text-sm text-muted-foreground">Con permiso</p>
          </CardContent>
        </Card>
      </div>

      {/* Calendario y Listado */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendario */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Calendario
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border"
            />
          </CardContent>
        </Card>

        {/* Listado de Asistencias */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Registros de Asistencia</CardTitle>
            <Select value={selectedMes} onValueChange={setSelectedMes}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Seleccionar mes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los meses</SelectItem>
                <SelectItem value="noviembre">Noviembre</SelectItem>
                <SelectItem value="octubre">Octubre</SelectItem>
                <SelectItem value="septiembre">Septiembre</SelectItem>
                <SelectItem value="agosto">Agosto</SelectItem>
                <SelectItem value="julio">Julio</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            {filteredRecords.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CalendarIcon className="h-12 w-12 mx-auto mb-4" />
                <p>No hay registros de asistencia para mostrar</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="hidden md:table-cell">Materia</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.map(record => (
                    <TableRow key={record.id}>
                      <TableCell>
                        {new Date(record.fecha).toLocaleDateString('es-ES', {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'short'
                        })}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getEstadoIcon(record.estado)}
                          <span>{getEstadoLabel(record.estado)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">{record.materia}</TableCell>
                      <TableCell className="space-x-2">
                        {record.estado === 'ausente' && (
                          <Button size="sm" variant="default" onClick={() => justificar(record.id)}>
                            Justificar
                          </Button>
                        )}
                        <Button size="sm" variant="outline" onClick={() => verDetalle(record.id)}>
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Ayuda Rápida */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-blue-500" />
            Información Importante
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            <div className="space-y-2">
              <p className="font-medium">¿Cómo justificar una falta?</p>
              <p className="text-muted-foreground">
                1. Haga clic en el botón "Justificar"<br />
                2. Envíe el certificado o nota por WhatsApp<br />
                3. El tutor revisará y aprobará la justificación
              </p>
            </div>
            <div className="space-y-2">
              <p className="font-medium">Horario de Clases</p>
              <p className="text-muted-foreground">
                Entrada: 7:45 AM<br />
                Tolerancia: hasta 8:00 AM<br />
                Salida: 13:30 PM
              </p>
            </div>
            <div className="space-y-2">
              <p className="font-medium">Contactos</p>
              <p className="text-muted-foreground">
                Secretaría: 2-2334455<br />
                WhatsApp: +591 12345678<br />
                Horario: 7:30 - 14:00
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
