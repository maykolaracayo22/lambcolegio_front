// src/pages/parent/Conducta.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import {
  Search,
  Filter,
  Download,
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  Calendar,
  User,
  X
} from 'lucide-react';

// Tipos de datos
interface ConductaRecord {
  id: number;
  fecha: string;
  tipo: 'positiva' | 'negativa' | 'neutral';
  descripcion: string;
  docente: string;
  materia: string;
  gravedad?: 'leve' | 'moderada' | 'grave';
  puntos: number;
}

interface EstadisticasConducta {
  totalRegistros: number;
  positivas: number;
  negativas: number;
  neutrales: number;
  promedioPuntos: number;
  tendencia: 'mejorando' | 'empeorando' | 'estable';
}

// Estado que esperamos recibir desde NotasAcademicas.jsx
interface LocationState {
  courseId?: number;
  courseTitle?: string;
}

export default function Conducta() {
  const location = useLocation();
  const { courseId, courseTitle } = (location.state || {}) as LocationState;

  const [filtroTipo, setFiltroTipo] = useState<string>('todos');
  const [filtroMateria, setFiltroMateria] = useState<string>('todas');
  const [busqueda, setBusqueda] = useState<string>('');

  // Mapeo de materias válidas para el filtro (valor y etiqueta)
  const materiasOpts = useMemo(
    () => [
      { value: 'todas', label: 'Todas' },
      { value: 'matemáticas', label: 'Matemáticas' },
      { value: 'español', label: 'Español' },
      { value: 'ciencias', label: 'Ciencias' },
      { value: 'historia', label: 'Historia' },
      { value: 'inglés', label: 'Inglés' },
    ],
    []
  );

  // Si venimos con courseTitle y coincide con alguna materia, filtramos automáticamente
  useEffect(() => {
    if (!courseTitle) return;
    const match = materiasOpts.find(
      (m) => m.label.toLowerCase() === courseTitle.toLowerCase()
    );
    if (match) setFiltroMateria(match.value);
  }, [courseTitle, materiasOpts]);

  // Datos de ejemplo
  const registrosConducta: ConductaRecord[] = [
    {
      id: 1,
      fecha: '2024-01-15',
      tipo: 'positiva',
      descripcion: 'Excelente participación en clase de matemáticas',
      docente: 'Prof. García',
      materia: 'Matemáticas',
      puntos: 5
    },
    {
      id: 2,
      fecha: '2024-01-12',
      tipo: 'neutral',
      descripcion: 'Llegó 5 minutos tarde a clase',
      docente: 'Prof. López',
      materia: 'Español',
      gravedad: 'leve',
      puntos: -1
    },
    {
      id: 3,
      fecha: '2024-01-10',
      tipo: 'positiva',
      descripcion: 'Ayudó a compañeros con dificultades en el proyecto',
      docente: 'Prof. Martín',
      materia: 'Ciencias',
      puntos: 3
    },
    {
      id: 4,
      fecha: '2024-01-08',
      tipo: 'negativa',
      descripcion: 'No completó la tarea asignada',
      docente: 'Prof. Rodríguez',
      materia: 'Historia',
      gravedad: 'moderada',
      puntos: -2
    },
    {
      id: 5,
      fecha: '2024-01-05',
      tipo: 'positiva',
      descripcion: 'Participación destacada en debate de clase',
      docente: 'Prof. Smith',
      materia: 'Inglés',
      puntos: 4
    },
    {
      id: 6,
      fecha: '2024-01-03',
      tipo: 'negativa',
      descripcion: 'Comportamiento disruptivo durante la clase',
      docente: 'Prof. García',
      materia: 'Matemáticas',
      gravedad: 'grave',
      puntos: -5
    }
  ];

  const estadisticas: EstadisticasConducta = useMemo(() => {
    const total = registrosConducta.length;
    const positivas = registrosConducta.filter(r => r.tipo === 'positiva').length;
    const negativas = registrosConducta.filter(r => r.tipo === 'negativa').length;
    const neutrales = registrosConducta.filter(r => r.tipo === 'neutral').length;
    const promedioPuntos = total > 0
      ? registrosConducta.reduce((sum, r) => sum + r.puntos, 0) / total
      : 0;

    // Tendencia “mock”: si promedio >= 0.5 mejorando, <= -0.5 empeorando, si no estable
    const tendencia: EstadisticasConducta['tendencia'] =
      promedioPuntos >= 0.5 ? 'mejorando' :
      promedioPuntos <= -0.5 ? 'empeorando' : 'estable';

    return { totalRegistros: total, positivas, negativas, neutrales, promedioPuntos, tendencia };
  }, []);

  // Filtrar registros
  const registrosFiltrados = useMemo(() => {
    const term = busqueda.trim().toLowerCase();
    return registrosConducta.filter(registro => {
      const coincideTipo = filtroTipo === 'todos' || registro.tipo === filtroTipo;
      const coincideMateria =
        filtroMateria === 'todas' || registro.materia.toLowerCase() === filtroMateria;
      const coincideBusqueda =
        term.length === 0 ||
        registro.descripcion.toLowerCase().includes(term) ||
        registro.docente.toLowerCase().includes(term) ||
        registro.materia.toLowerCase().includes(term);

      return coincideTipo && coincideMateria && coincideBusqueda;
    });
  }, [registrosConducta, filtroTipo, filtroMateria, busqueda]);

  const getIconoTipo = (tipo: string) => {
    switch (tipo) {
      case 'positiva': return <CheckCircle className="h-4 w-4" />;
      case 'negativa': return <AlertCircle className="h-4 w-4" />;
      case 'neutral': return <Clock className="h-4 w-4" />;
      default: return null;
    }
  };

  const getColorTipo = (tipo: string) => {
    switch (tipo) {
      case 'positiva': return 'text-green-600 bg-green-100';
      case 'negativa': return 'text-red-600 bg-red-100';
      case 'neutral': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getColorPuntos = (puntos: number) => {
    if (puntos > 0) return 'text-green-600';
    if (puntos < 0) return 'text-red-600';
    return 'text-yellow-600';
  };

  const getIconoTendencia = (tendencia: EstadisticasConducta['tendencia']) => {
    switch (tendencia) {
      case 'mejorando': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'empeorando': return <TrendingDown className="h-4 w-4 text-red-500" />;
      default: return <div className="h-4 w-4 bg-gray-300 rounded-full" />;
    }
  };

  // Acciones
  const limpiarFiltros = () => {
    setFiltroTipo('todos');
    setFiltroMateria('todas');
    setBusqueda('');
  };

  const exportarCSV = () => {
    const header = ['ID', 'Fecha', 'Tipo', 'Descripción', 'Docente', 'Materia', 'Gravedad', 'Puntos'];
    const rows = registrosFiltrados.map(r => [
      r.id,
      r.fecha,
      r.tipo,
      `"${r.descripcion.replace(/"/g, '""')}"`,
      r.docente,
      r.materia,
      r.gravedad ?? '',
      r.puntos
    ].join(','));
    const blob = new Blob([header.join(',') + '\n' + rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const curso = courseTitle ? `_${courseTitle.replace(/\s+/g, '_')}` : '';
    a.download = `conducta${curso}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Registro de Conducta</h1>
          <p className="text-muted-foreground">
            Seguimiento del comportamiento de Juan Pérez Martínez
          </p>

          {/* Curso seleccionado (si viene desde Notas) */}
          {courseTitle && (
            <div className="mt-3 flex items-center gap-2 flex-wrap">
              <Badge variant="secondary" className="text-sm">
                Curso seleccionado: {courseTitle}
              </Badge>
              {/* Mostrar si aplicamos filtro automático por materia */}
              {materiasOpts.some(m => m.label.toLowerCase() === courseTitle.toLowerCase()) ? (
                <Badge variant="outline" className="text-xs">Filtro por materia aplicado</Badge>
              ) : (
                <Badge variant="outline" className="text-xs">
                  (No coincide con materias — sin filtro auto)
                </Badge>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={limpiarFiltros}>
            <X className="h-4 w-4 mr-2" />
            Limpiar filtros
          </Button>
          <Button variant="academicYellow" onClick={exportarCSV}>
            <Download className="h-4 w-4 mr-2" />
            Exportar CSV
          </Button>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total de Registros</p>
                <p className="text-2xl font-bold text-foreground">{estadisticas.totalRegistros}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-full">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Conductas Positivas</p>
                <p className="text-2xl font-bold text-green-600">{estadisticas.positivas}</p>
              </div>
              <div className="p-2 bg-green-100 rounded-full">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Conductas Negativas</p>
                <p className="text-2xl font-bold text-red-600">{estadisticas.negativas}</p>
              </div>
              <div className="p-2 bg-red-100 rounded-full">
                <AlertCircle className="h-5 w-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Puntos Promedio</p>
                <div className="flex items-center space-x-1">
                  <p className={`text-2xl font-bold ${getColorPuntos(estadisticas.promedioPuntos)}`}>
                    {estadisticas.promedioPuntos > 0 ? '+' : ''}{estadisticas.promedioPuntos.toFixed(1)}
                  </p>
                  {getIconoTendencia(estadisticas.tendencia)}
                </div>
              </div>
              <div className="p-2 bg-purple-100 rounded-full">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros y búsqueda */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar en registros de conducta..."
                className="pl-10"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
              <Select value={filtroTipo} onValueChange={setFiltroTipo}>
                <SelectTrigger className="w-full sm:w-[170px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los tipos</SelectItem>
                  <SelectItem value="positiva">Positivas</SelectItem>
                  <SelectItem value="negativa">Negativas</SelectItem>
                  <SelectItem value="neutral">Neutrales</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filtroMateria} onValueChange={setFiltroMateria}>
                <SelectTrigger className="w-full sm:w-[170px]">
                  <SelectValue placeholder="Materia" />
                </SelectTrigger>
                <SelectContent>
                  {materiasOpts.map(m => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de registros */}
      <Card>
        <CardHeader>
          <CardTitle>Historial de Conducta</CardTitle>
        </CardHeader>
        <CardContent>
          {registrosFiltrados.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No se encontraron registros con los filtros aplicados.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {registrosFiltrados.map((registro) => (
                <div key={registro.id} className="flex items-start space-x-4 p-4 border rounded-lg">
                  <div className={`p-2 rounded-full ${getColorTipo(registro.tipo)}`}>
                    {getIconoTipo(registro.tipo)}
                  </div>

                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <h4 className="font-medium text-foreground">{registro.descripcion}</h4>
                      <div className="flex items-center space-x-2">
                        <Badge variant={registro.tipo === 'positiva' ? 'default' : registro.tipo === 'negativa' ? 'destructive' : 'secondary'}>
                          {registro.tipo}
                        </Badge>
                        <span className={`text-sm font-medium ${getColorPuntos(registro.puntos)}`}>
                          {registro.puntos > 0 ? '+' : ''}{registro.puntos} pts
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <User className="h-3 w-3 mr-1" />
                        {registro.docente}
                      </div>
                      <div className="hidden sm:block">•</div>
                      <div>{registro.materia}</div>
                      <div className="hidden sm:block">•</div>
                      <div>{new Date(registro.fecha).toLocaleDateString()}</div>
                    </div>

                    {registro.gravedad && registro.tipo === 'negativa' && (
                      <div className="mt-2">
                        <Badge variant="outline" className="text-xs">
                          Gravedad: {registro.gravedad}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resumen mensual (dummy) */}
      <Card>
        <CardHeader>
          <CardTitle>Resumen Mensual</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-green-600">8</p>
              <p className="text-sm text-muted-foreground">Conductas positivas este mes</p>
            </div>

            <div className="text-center p-4 bg-red-50 rounded-lg">
              <AlertCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-red-600">2</p>
              <p className="text-sm text-muted-foreground">Conductas negativas este mes</p>
            </div>

            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <TrendingUp className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-blue-600">+12</p>
              <p className="text-sm text-muted-foreground">Puntos acumulados</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
