// src/pages/parent/Reportes.tsx
// CONECTADO AL BACKEND - Consume API real
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import {
  getChildInfo,
  getChildGrades,
  getChildAttendance,
  getChildTasks
} from '@/services/parentPortalApi';
import {
  FileText,
  FileSpreadsheet,
  Download,
  ScrollText,
  CalendarDays,
  RefreshCw,
  Loader2
} from 'lucide-react';

export default function Reportes() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [childInfo, setChildInfo] = useState<{nombres: string; apellidos: string; codigo: string} | null>(null);
  
  const [reportType, setReportType] = useState<string>('calificaciones');
  const [reportFormat, setReportFormat] = useState<string>('pdf');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  useEffect(() => {
    const initFetch = async () => {
      const info = getChildInfo();
      if (info) {
        setChildInfo({
          nombres: info.nombres,
          apellidos: info.apellidos,
          codigo: info.codigo
        });
      }
      setLoading(false);
    };

    initFetch();
  }, []);

  const handleGenerateReport = async () => {
    setGenerating(true);
    
    try {
      let reportData: any = {};
      
      // Obtener datos según el tipo de reporte
      switch (reportType) {
        case 'calificaciones':
          reportData = await getChildGrades();
          break;
        case 'asistencia':
          reportData = await getChildAttendance();
          break;
        case 'tareas':
          reportData = await getChildTasks();
          break;
        case 'completo':
          const [grades, attendance, tasks] = await Promise.all([
            getChildGrades(),
            getChildAttendance(),
            getChildTasks()
          ]);
          reportData = { grades, attendance, tasks };
          break;
      }

      // Generar reporte (en producción esto iría al backend)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (reportFormat === 'pdf') {
        generatePDF(reportData, reportType);
      } else {
        generateExcel(reportData, reportType);
      }
      
      toast({
        title: "Reporte generado",
        description: `Se ha generado el reporte de ${reportType} en formato ${reportFormat.toUpperCase()}`,
      });
      
    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        title: "Error",
        description: "No se pudo generar el reporte",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const generatePDF = (data: any, type: string) => {
    // Simulación de generación de PDF
    const content = JSON.stringify(data, null, 2);
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte_${type}_${childInfo?.codigo || 'estudiante'}_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const generateExcel = (data: any, type: string) => {
    // Simulación de generación de CSV/Excel
    let csvContent = '';
    
    if (Array.isArray(data)) {
      if (data.length > 0) {
        const headers = Object.keys(data[0]).join(',');
        const rows = data.map(item => Object.values(item).join(',')).join('\n');
        csvContent = headers + '\n' + rows;
      }
    } else if (data.records) {
      const records = data.records;
      if (records.length > 0) {
        const headers = Object.keys(records[0]).join(',');
        const rows = records.map((item: any) => Object.values(item).join(',')).join('\n');
        csvContent = headers + '\n' + rows;
      }
    } else {
      csvContent = JSON.stringify(data, null, 2);
    }
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte_${type}_${childInfo?.codigo || 'estudiante'}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const quickReport = (type: string, format: string) => {
    setReportType(type);
    setReportFormat(format);
    setTimeout(() => handleGenerateReport(), 100);
  };

  if (loading) {
    return (
      <div className="space-y-6 p-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent className="space-y-6">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
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
            <Download className="h-7 w-7 text-primary" />
            Generador de Reportes
          </h1>
          <p className="text-muted-foreground">
            Crea y descarga informes detallados de {childInfo ? `${childInfo.nombres} ${childInfo.apellidos}` : 'tu hijo(a)'}
          </p>
        </div>
      </div>

      {/* Tarjeta principal para la generación de reportes */}
      <Card>
        <CardHeader>
          <CardTitle>Configurar Reporte</CardTitle>
          <CardDescription>Selecciona el tipo, formato y período del reporte a generar.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
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
                <SelectItem value="calificaciones">Reporte de Calificaciones</SelectItem>
                <SelectItem value="asistencia">Reporte de Asistencia</SelectItem>
                <SelectItem value="tareas">Reporte de Tareas</SelectItem>
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
                  <span className="flex items-center gap-2"><FileText className="h-4 w-4" /> PDF / JSON</span>
                </SelectItem>
                <SelectItem value="excel">
                  <span className="flex items-center gap-2"><FileSpreadsheet className="h-4 w-4" /> Excel / CSV</span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Rango de Fechas */}
          {reportType !== 'completo' && (
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
              <p className="text-xs text-muted-foreground mt-1">
                Deja vacío para incluir todo el historial disponible.
              </p>
            </div>
          )}

          {/* Botón para Generar Reporte */}
          <Button
            onClick={handleGenerateReport}
            className="w-full"
            disabled={generating}
          >
            {generating ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Generando...
              </>
            ) : (
              <>
                <Download className="h-5 w-5 mr-2" />
                Generar Reporte {reportFormat.toUpperCase()}
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Reportes Rápidos */}
      <Card>
        <CardHeader>
          <CardTitle>Reportes Rápidos</CardTitle>
          <CardDescription>Genera reportes comunes con un solo clic.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button 
            variant="outline" 
            onClick={() => quickReport('calificaciones', 'pdf')}
            disabled={generating}
          >
            <FileText className="h-4 w-4 mr-2" />
            Calificaciones (PDF)
          </Button>
          <Button 
            variant="outline" 
            onClick={() => quickReport('asistencia', 'excel')}
            disabled={generating}
          >
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Asistencia (Excel)
          </Button>
          <Button 
            variant="outline" 
            onClick={() => quickReport('tareas', 'excel')}
            disabled={generating}
          >
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Tareas (Excel)
          </Button>
          <Button 
            variant="outline" 
            onClick={() => quickReport('completo', 'pdf')}
            disabled={generating}
          >
            <FileText className="h-4 w-4 mr-2" />
            Completo (PDF)
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
