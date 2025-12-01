// src/pages/parent/Reportes.tsx
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  FileText,    // Icono para PDF
  FileSpreadsheet, // Icono para Excel
  Download,      // Icono para el botón principal
  ScrollText,  // Icono para tipo de reporte
  CalendarDays // Para seleccionar fechas
} from 'lucide-react';

export default function Reportes() {
  const [reportType, setReportType] = useState<string>('tareas'); // 'tareas', 'calificaciones', 'asistencia'
  const [reportFormat, setReportFormat] = useState<string>('pdf'); // 'pdf', 'excel'
  const [startDate, setStartDate] = useState<string>(''); // Para reportes por rango de fechas
  const [endDate, setEndDate] = useState<string>('');

  // Función dummy para simular la generación de reporte
  const handleGenerateReport = () => {
    console.log(`Generando reporte de tipo: ${reportType}, formato: ${reportFormat}`);
    console.log(`Rango de fechas: ${startDate} a ${endDate}`);
    // Aquí iría la lógica real para generar y descargar el reporte.
    // Podrías mostrar un toast o una notificación de éxito/descarga.
    alert(`Generando reporte de ${reportType} en formato ${reportFormat} para el período ${startDate} a ${endDate || 'hoy'}.`);
  };

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Download className="h-7 w-7 text-academic-blue-500" />
            Generador de Reportes
          </h1>
          <p className="text-muted-foreground">
            Crea y descarga informes detallados del progreso y actividades académicas.
          </p>
        </div>
        {/* Opcional: Un botón para ver reportes históricos si los hubiera */}
        {/* <Button variant="outline">
          <ScrollText className="h-4 w-4 mr-2" />
          Ver Reportes Anteriores
        </Button> */}
      </div>

      {/* Tarjeta principal para la generación de reportes */}
      <Card>
        <CardHeader>
          <CardTitle>Configurar Reporte</CardTitle>
          <CardDescription>Selecciona el tipo, formato y período del reporte a generar.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6"> {/* Más espacio entre secciones */}
          {/* Tipo de Reporte */}
          <div>
            <Label htmlFor="report-type" className="mb-2 flex items-center gap-2">
              <ScrollText className="h-4 w-4 text-muted-foreground" />
              Tipo de Reporte
            </Label>
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger id="report-type" className="w-full md:w-[300px]">
                <SelectValue placeholder="Seleccionar tipo de reporte" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tareas">Reporte de Tareas</SelectItem>
                <SelectItem value="calificaciones">Reporte de Calificaciones</SelectItem>
                <SelectItem value="asistencia">Reporte de Asistencia</SelectItem>
                <SelectItem value="completo">Reporte Académico Completo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Formato de Salida */}
          <div>
            <Label htmlFor="report-format" className="mb-2 flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              Formato de Salida
            </Label>
            <Select value={reportFormat} onValueChange={setReportFormat}>
              <SelectTrigger id="report-format" className="w-full md:w-[200px]">
                <SelectValue placeholder="Seleccionar formato" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">
                  <span className="flex items-center gap-2"><FileText className="h-4 w-4" /> PDF</span>
                </SelectItem>
                <SelectItem value="excel">
                  <span className="flex items-center gap-2"><FileSpreadsheet className="h-4 w-4" /> Excel</span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Rango de Fechas (Opcional, con lógica condicional) */}
          {reportType !== 'completo' && ( // "Reporte Académico Completo" podría no necesitar rango de fechas
            <div>
              <Label className="mb-2 flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
                Rango de Fechas (Opcional)
              </Label>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    placeholder="Fecha de inicio"
                    className="w-full"
                  />
                </div>
                <div className="flex-1">
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    placeholder="Fecha de fin"
                    className="w-full"
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Deja vacío para incluir todo el historial (si aplica al tipo de reporte).</p>
            </div>
          )}

          {/* Botón para Generar Reporte */}
          <Button
            onClick={handleGenerateReport}
            className="w-full bg-academic-blue-500 hover:bg-academic-blue-600 text-white"
          >
            <Download className="h-5 w-5 mr-2" />
            Generar Reporte {reportFormat.toUpperCase()}
          </Button>
        </CardContent>
      </Card>

      {/* Opcional: Una sección para "Reportes Rápidos" o "Sugerencias" */}
      <Card>
        <CardHeader>
          <CardTitle>Reportes Rápidos</CardTitle>
          <CardDescription>Genera reportes comunes con un solo click.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Button variant="outline" onClick={() => { setReportType('calificaciones'); setReportFormat('pdf'); handleGenerateReport(); }}>
            <FileText className="h-4 w-4 mr-2" />
            Calificaciones (PDF)
          </Button>
          <Button variant="outline" onClick={() => { setReportType('tareas'); setReportFormat('excel'); handleGenerateReport(); }}>
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Tareas (Excel)
          </Button>
        </CardContent>
      </Card>

    </div>
  );
}