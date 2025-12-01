
// src/pages/parent/Asistencia.tsx
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar } from '@/components/ui/calendar';
import { 
  Download, FileText, MessageSquare, Check, X, 
  Clock, AlertCircle, Calendar as CalendarIcon, 
  Filter, ChevronRight, Phone
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import NivelBadge from '@/pages/parent/components/NivelBadge';
import QuickAction from '@/pages/parent/components/QuickAction';

interface Asistencia {
  id: number;
  fecha: string;
  curso: string;
  estado: 'Asistió' | 'Falta' | 'Tarde' | 'Permiso';
  justificada: boolean;
  horaLlegada?: string;
  horaSalida?: string;
  observacion?: string;
}

export default function Asistencia() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedMes, setSelectedMes] = useState('noviembre');
  
  // Datos de ejemplo
  const asistencias: Asistencia[] = [
    { 
      id: 1, 
      fecha: '2025-11-02', 
      curso: 'Matemáticas', 
      estado: 'Falta', 
      justificada: false,
      observacion: 'No se presentó a clases'
    },
    { 
      id: 2, 
      fecha: '2025-11-05', 
      curso: 'Lenguaje', 
      estado: 'Tarde', 
      justificada: true,
      horaLlegada: '08:15',
      observacion: 'Tráfico en la ciudad'
    },
    { 
      id: 3, 
      fecha: '2025-11-10', 
      curso: 'Ciencias Naturales', 
      estado: 'Asistió', 
      justificada: true,
      horaLlegada: '07:45',
      horaSalida: '13:30'
    },
    { 
      id: 4, 
      fecha: '2025-11-11', 
      curso: 'Educación Física', 
      estado: 'Permiso', 
      justificada: true,
      observacion: 'Cita médica programada'
    },
  ];

  // Calcular estadísticas
  const totalDias = asistencias.length;
  const asistencias_ok = asistencias.filter(a => a.estado === 'Asistió').length;
  const faltas = asistencias.filter(a => a.estado === 'Falta').length;
  const tardanzas = asistencias.filter(a => a.estado === 'Tarde').length;
  const permisos = asistencias.filter(a => a.estado === 'Permiso').length;
  
  const porcentajeAsistencia = (asistencias_ok / totalDias) * 100;

  const justificar = (id: number) => {
    // Aquí iría la lógica para subir justificación
    window.open('https://wa.me/59112345678', '_blank');
  };
  
  const verDetalle = (id: number) => {
    // Aquí iría la lógica para mostrar modal con detalles
    alert(`Ver detalle de asistencia #${id}`);
  };
  
  const contactar = () => {
    // Aquí iría la lógica para contactar al tutor
    window.open('https://wa.me/59112345678', '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <header className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <NivelBadge nivel="Primaria" size="lg" />
            <div>
              <h1 className="text-2xl font-bold">Control de Asistencia</h1>
              <p className="text-muted-foreground">Juan Pérez - 4to Primaria "A"</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button size="lg" variant="outline" onClick={() => window.open('https://wa.me/59112345678', '_blank')}>
              <Phone className="h-5 w-5 mr-2" />
              Justificar por WhatsApp
            </Button>
            <Button size="lg" variant="outline">
              <Download className="h-5 w-5 mr-2" />
              Descargar Reporte
            </Button>
          </div>
        </div>
      </header>

      {/* Resumen de Asistencia */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className={porcentajeAsistencia >= 85 ? 'border-green-500' : 'border-yellow-500'}>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm text-muted-foreground">Asistencia Total</p>
              <Check className={`h-5 w-5 ${porcentajeAsistencia >= 85 ? 'text-green-500' : 'text-yellow-500'}`} />
            </div>
            <p className="text-3xl font-bold mb-1">{porcentajeAsistencia.toFixed(1)}%</p>
            <Progress value={porcentajeAsistencia} className="h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm text-muted-foreground">Faltas</p>
              <X className="h-5 w-5 text-red-500" />
            </div>
            <p className="text-3xl font-bold">{faltas}</p>
            <p className="text-sm text-muted-foreground">Sin justificar: {asistencias.filter(a => !a.justificada).length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm text-muted-foreground">Tardanzas</p>
              <Clock className="h-5 w-5 text-yellow-500" />
            </div>
            <p className="text-3xl font-bold">{tardanzas}</p>
            <p className="text-sm text-muted-foreground">Este mes</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm text-muted-foreground">Permisos</p>
              <CalendarIcon className="h-5 w-5 text-blue-500" />
            </div>
            <p className="text-3xl font-bold">{permisos}</p>
            <p className="text-sm text-muted-foreground">Justificados</p>
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
                <SelectItem value="noviembre">Noviembre 2025</SelectItem>
                <SelectItem value="octubre">Octubre 2025</SelectItem>
                <SelectItem value="septiembre">Septiembre 2025</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="hidden md:table-cell">Curso</TableHead>
                  <TableHead className="hidden md:table-cell">Horario</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {asistencias.map(a => (
                  <TableRow key={a.id}>
                    <TableCell>{new Date(a.fecha).toLocaleDateString('es-ES', {
                      weekday: 'short',
                      day: 'numeric',
                      month: 'short'
                    })}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {a.estado === 'Asistió' && <Check className="h-4 w-4 text-green-500" />}
                        {a.estado === 'Falta' && <X className="h-4 w-4 text-red-500" />}
                        {a.estado === 'Tarde' && <Clock className="h-4 w-4 text-yellow-500" />}
                        {a.estado === 'Permiso' && <CalendarIcon className="h-4 w-4 text-blue-500" />}
                        <span>{a.estado}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{a.curso}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      {a.horaLlegada && (
                        <span>{a.horaLlegada} - {a.horaSalida || '13:30'}</span>
                      )}
                    </TableCell>
                    <TableCell className="space-x-2">
                      {!a.justificada && a.estado !== 'Asistió' && (
                        <Button size="sm" variant="default" onClick={() => justificar(a.id)}>
                          Justificar
                        </Button>
                      )}
                      <Button size="sm" variant="outline" onClick={() => verDetalle(a.id)}>
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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
                1. Haga clic en el botón "Justificar"
                2. Envíe el certificado o nota por WhatsApp
                3. El tutor revisará y aprobará la justificación
              </p>
            </div>
            <div className="space-y-2">
              <p className="font-medium">Horario de Clases</p>
              <p className="text-muted-foreground">
                Entrada: 7:45 AM
                Tolerancia: hasta 8:00 AM
                Salida: 13:30 PM
              </p>
            </div>
            <div className="space-y-2">
              <p className="font-medium">Contactos</p>
              <p className="text-muted-foreground">
                Secretaría: 2-2334455
                WhatsApp: +591 12345678
                Horario: 7:30 - 14:00
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
