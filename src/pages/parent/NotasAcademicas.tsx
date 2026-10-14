// src/pages/parent/NotasAcademicas.tsx
// CONECTADO AL BACKEND - Consume API real
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import {
  getChildGrades,
  getChildInfo,
  ChildSubjectGrades
} from '@/services/parentPortalApi';
import {
  ChevronLeft,
  FileText,
  CheckCircle,
  Star,
  TrendingUp,
  Download,
  RefreshCw,
  BookOpen,
  User,
  Award,
  AlertCircle,
  Calendar
} from 'lucide-react';

type Trimestre = 'T1' | 'T2' | 'T3' | 'Todos';

export default function NotasAcademicas() {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Estado de carga
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Datos del backend
  const [grades, setGrades] = useState<ChildSubjectGrades[]>([]);
  const [childInfo, setChildInfo] = useState<{
    nombres: string; 
    apellidos: string; 
    nivel: string;
    curso: string; 
    paralelo: string
  } | null>(null);

  // Filtros
  const [trimestre, setTrimestre] = useState<Trimestre>('Todos');
  const [selectedSubject, setSelectedSubject] = useState<ChildSubjectGrades | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  // Fetch datos
  const fetchGrades = async () => {
    try {
      const gradesData = await getChildGrades();
      setGrades(gradesData);
      
      const info = getChildInfo();
      if (info) {
        setChildInfo({
          nombres: info.nombres,
          apellidos: info.apellidos,
          nivel: info.nivel,
          curso: info.curso,
          paralelo: info.paralelo
        });
      }
      
    } catch (error) {
      console.error('Error fetching grades:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las calificaciones",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    const initFetch = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500));
      await fetchGrades();
      setLoading(false);
    };
    initFetch();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchGrades();
    setRefreshing(false);
    toast({
      title: "Actualizado",
      description: "Calificaciones actualizadas correctamente",
    });
  };

  // Calcular estadísticas generales
  const stats = useMemo(() => {
    if (grades.length === 0) return { promedio: 0, aprobadas: 0, reprobadas: 0, total: 0 };
    
    const promedio = Math.round(grades.reduce((sum, g) => sum + g.promedioAnual, 0) / grades.length);
    const aprobadas = grades.filter(g => g.aprobado).length;
    const reprobadas = grades.filter(g => !g.aprobado).length;
    
    return { promedio, aprobadas, reprobadas, total: grades.length };
  }, [grades]);

  // Filtrar notas por trimestre
  const filteredGrades = useMemo(() => {
    if (trimestre === 'Todos') return grades;
    
    const trimNum = parseInt(trimestre.replace('T', ''));
    return grades.map(subject => ({
      ...subject,
      notas: subject.notas.filter(n => n.bimestre === trimNum)
    })).filter(subject => subject.notas.length > 0);
  }, [grades, trimestre]);

  // Helpers
  const getNotaColor = (nota: number) => {
    if (nota >= 80) return 'text-green-600 bg-green-100';
    if (nota >= 51) return 'text-blue-600 bg-blue-100';
    return 'text-red-600 bg-red-100';
  };

  const getAprobadoBadge = (aprobado: boolean) => {
    return aprobado 
      ? <Badge className="bg-green-100 text-green-800">Aprobado</Badge>
      : <Badge className="bg-red-100 text-red-800">En Riesgo</Badge>;
  };

  // Exportar CSV
  const exportarCSV = () => {
    const header = ['Materia', 'Docente', 'B1', 'B2', 'B3', 'B4', 'Promedio', 'Estado'];
    const rows = grades.map(g => {
      const notasPorBim = [1, 2, 3, 4].map(bim => {
        const nota = g.notas.find(n => n.bimestre === bim);
        return nota ? nota.nota : '-';
      });
      return [
        g.materia,
        g.docente,
        ...notasPorBim,
        g.promedioAnual,
        g.aprobado ? 'Aprobado' : 'Reprobado'
      ].join(',');
    });
    
    const csv = [header.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `notas_${childInfo?.nombres || 'estudiante'}_2025.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Exportado",
      description: "Archivo CSV descargado exitosamente",
    });
  };

  // Ver detalle de materia
  const handleVerDetalle = (subject: ChildSubjectGrades) => {
    setSelectedSubject(subject);
    setDetailOpen(true);
  };

  // Navegar a otras secciones
  const handleConducta = () => navigate('/dashboard/parent/conducta');
  const handleProgreso = () => navigate('/dashboard/parent/progreso');
  const handleAsistencia = () => navigate('/dashboard/parent/asistencia');

  // Loading skeleton
  if (loading) {
    return (
      <div className="space-y-6 p-4">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
        
        <Card>
          <CardContent className="pt-6">
            <Skeleton className="h-80 w-full" />
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
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BookOpen className="h-8 w-8 text-primary" />
            Notas Académicas
          </h1>
          <p className="text-muted-foreground">
            {childInfo ? `${childInfo.nombres} ${childInfo.apellidos} - ${childInfo.nivel} ${childInfo.curso} "${childInfo.paralelo}"` : 'Cargando...'}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
          <Button variant="outline" onClick={exportarCSV}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Regresar
          </Button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">Promedio General</p>
                <p className={`text-3xl font-bold ${stats.promedio >= 51 ? 'text-green-600' : 'text-red-600'}`}>
                  {stats.promedio}
                </p>
              </div>
              <div className={`p-2 rounded-full ${stats.promedio >= 51 ? 'bg-green-100' : 'bg-red-100'}`}>
                <Award className={`h-5 w-5 ${stats.promedio >= 51 ? 'text-green-600' : 'text-red-600'}`} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">Materias Aprobadas</p>
                <p className="text-3xl font-bold text-green-600">{stats.aprobadas}</p>
              </div>
              <div className="p-2 bg-green-100 rounded-full">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">En Riesgo</p>
                <p className="text-3xl font-bold text-red-600">{stats.reprobadas}</p>
              </div>
              <div className="p-2 bg-red-100 rounded-full">
                <AlertCircle className="h-5 w-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">Total Materias</p>
                <p className="text-3xl font-bold">{stats.total}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-full">
                <BookOpen className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtro y acciones */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-4 bg-muted/50 rounded-lg">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Bimestre:</span>
            <Select value={trimestre} onValueChange={(v: Trimestre) => setTrimestre(v)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Bimestre" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Todos">Todos</SelectItem>
                <SelectItem value="T1">Bimestre 1</SelectItem>
                <SelectItem value="T2">Bimestre 2</SelectItem>
                <SelectItem value="T3">Bimestre 3</SelectItem>
                <SelectItem value="T4">Bimestre 4</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={handleConducta}>
            <Star className="h-4 w-4 mr-1" />
            Conducta
          </Button>
          <Button variant="outline" size="sm" onClick={handleProgreso}>
            <TrendingUp className="h-4 w-4 mr-1" />
            Progreso
          </Button>
          <Button variant="outline" size="sm" onClick={handleAsistencia}>
            <Calendar className="h-4 w-4 mr-1" />
            Asistencia
          </Button>
        </div>
      </div>

      {/* Tabla de notas */}
      <Card>
        <CardHeader>
          <CardTitle>Calificaciones por Materia</CardTitle>
          <CardDescription>
            Notas del año académico 2025 - {trimestre === 'Todos' ? 'Todos los bimestres' : `Bimestre ${trimestre.replace('T', '')}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredGrades.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Sin calificaciones</h3>
              <p className="text-muted-foreground">
                No hay calificaciones disponibles para mostrar
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">Materia</TableHead>
                    <TableHead>Docente</TableHead>
                    <TableHead className="text-center">B1</TableHead>
                    <TableHead className="text-center">B2</TableHead>
                    <TableHead className="text-center">B3</TableHead>
                    <TableHead className="text-center">B4</TableHead>
                    <TableHead className="text-center">Promedio</TableHead>
                    <TableHead className="text-center">Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredGrades.map((subject, index) => {
                    const notasPorBim: (number | null)[] = [1, 2, 3, 4].map(bim => {
                      const nota = subject.notas.find(n => n.bimestre === bim);
                      return nota ? nota.nota : null;
                    });

                    return (
                      <TableRow key={index} className="hover:bg-muted/50">
                        <TableCell className="font-medium">{subject.materia}</TableCell>
                        <TableCell className="text-muted-foreground">{subject.docente}</TableCell>
                        {notasPorBim.map((nota, i) => (
                          <TableCell key={i} className="text-center">
                            {nota !== null ? (
                              <span className={`inline-flex items-center justify-center w-10 h-8 rounded ${getNotaColor(nota)}`}>
                                {nota}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                        ))}
                        <TableCell className="text-center">
                          <span className={`inline-flex items-center justify-center w-12 h-8 rounded font-bold ${getNotaColor(subject.promedioAnual)}`}>
                            {subject.promedioAnual}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          {getAprobadoBadge(subject.aprobado)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleVerDetalle(subject)}
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Leyenda */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <span className="font-medium">Escala de Calificación (Bolivia):</span>
            <div className="flex items-center gap-2">
              <span className="inline-block w-4 h-4 rounded bg-green-100"></span>
              <span>80-100: Excelente</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block w-4 h-4 rounded bg-blue-100"></span>
              <span>51-79: Aprobado</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block w-4 h-4 rounded bg-red-100"></span>
              <span>0-50: Reprobado</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal de detalle */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              {selectedSubject?.materia}
            </DialogTitle>
            <DialogDescription>
              Docente: {selectedSubject?.docente}
            </DialogDescription>
          </DialogHeader>
          
          {selectedSubject && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-muted/50 rounded-lg text-center">
                  <p className="text-sm text-muted-foreground">Promedio Anual</p>
                  <p className={`text-3xl font-bold ${selectedSubject.promedioAnual >= 51 ? 'text-green-600' : 'text-red-600'}`}>
                    {selectedSubject.promedioAnual}
                  </p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg text-center">
                  <p className="text-sm text-muted-foreground">Estado</p>
                  <p className="mt-2">
                    {getAprobadoBadge(selectedSubject.aprobado)}
                  </p>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-3">Detalle por Bimestre</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Bimestre</TableHead>
                      <TableHead className="text-center">Nota</TableHead>
                      <TableHead className="text-center">Asistencia</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedSubject.notas.map((nota, i) => (
                      <TableRow key={i}>
                        <TableCell>Bimestre {nota.bimestre}</TableCell>
                        <TableCell className="text-center">
                          <span className={`inline-flex items-center justify-center w-10 h-8 rounded ${getNotaColor(nota.nota)}`}>
                            {nota.nota}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          {nota.porcentajeAsistencia !== undefined ? `${nota.porcentajeAsistencia}%` : '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setDetailOpen(false)}>
                  Cerrar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
