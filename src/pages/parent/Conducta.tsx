// src/pages/parent/Conducta.tsx
// CONECTADO AL BACKEND - Consume API real
import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { 
  getChildConduct, 
  getChildInfo,
  ConductRecord,
  ConductStats 
} from '@/services/parentPortalApi';
import {
  Search,
  Download,
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  Calendar,
  RefreshCw,
  X,
  Minus,
  Award,
  User
} from 'lucide-react';

interface LocationState {
  courseId?: number;
  courseTitle?: string;
}

export default function Conducta() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { courseId, courseTitle } = (location.state || {}) as LocationState;

  // Estado de carga
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Datos del backend
  const [records, setRecords] = useState<ConductRecord[]>([]);
  const [stats, setStats] = useState<ConductStats>({
    puntosPositivos: 0,
    puntosNegativos: 0,
    puntosNetos: 0,
    totalRegistros: 0
  });
  
  // Info del hijo
  const [childInfo, setChildInfo] = useState<{nombres: string; apellidos: string; curso: string} | null>(null);

  // Filtros
  const [filtroTipo, setFiltroTipo] = useState<string>('todos');
  const [filtroCategoria, setFiltroCategoria] = useState<string>('todas');
  const [busqueda, setBusqueda] = useState<string>('');

  // Obtener datos del backend
  const fetchConduct = async () => {
    try {
      const data = await getChildConduct();
      setRecords(data.records);
      setStats(data.stats);
      
      // Obtener info del hijo
      const info = getChildInfo();
      if (info) {
        setChildInfo({
          nombres: info.nombres,
          apellidos: info.apellidos,
          curso: `${info.curso} ${info.paralelo}`
        });
      }
      
    } catch (error) {
      console.error('Error fetching conduct:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los registros de conducta",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    const initFetch = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500));
      await fetchConduct();
      setLoading(false);
    };
    initFetch();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchConduct();
    setRefreshing(false);
    toast({
      title: "Actualizado",
      description: "Registros de conducta actualizados",
    });
  };

  // Opciones de categorías (extraídas de los datos)
  const categoriasOpts = useMemo(() => {
    const cats = new Set(records.map(r => r.categoria).filter(Boolean));
    return [
      { value: 'todas', label: 'Todas las categorías' },
      ...Array.from(cats).map(cat => ({ value: cat.toLowerCase(), label: cat }))
    ];
  }, [records]);

  // Aplicar filtro de materia si viene desde notas
  useEffect(() => {
    if (!courseTitle) return;
    const match = categoriasOpts.find(
      (c) => c.label.toLowerCase() === courseTitle.toLowerCase()
    );
    if (match) setFiltroCategoria(match.value);
  }, [courseTitle, categoriasOpts]);

  // Filtrar registros
  const registrosFiltrados = useMemo(() => {
    const term = busqueda.trim().toLowerCase();
    return records.filter(registro => {
      const coincideTipo = filtroTipo === 'todos' || registro.tipo === filtroTipo;
      const coincideCategoria =
        filtroCategoria === 'todas' || 
        (registro.categoria && registro.categoria.toLowerCase() === filtroCategoria);
      const coincideBusqueda =
        term.length === 0 ||
        registro.descripcion.toLowerCase().includes(term) ||
        registro.docente.toLowerCase().includes(term) ||
        (registro.categoria && registro.categoria.toLowerCase().includes(term));

      return coincideTipo && coincideCategoria && coincideBusqueda;
    });
  }, [records, filtroTipo, filtroCategoria, busqueda]);

  // Calcular tendencia
  const tendencia = useMemo(() => {
    if (stats.totalRegistros === 0) return 'estable';
    if (stats.puntosNetos > 0) return 'mejorando';
    if (stats.puntosNetos < 0) return 'empeorando';
    return 'estable';
  }, [stats]);

  // Helpers de UI
  const getIconoTipo = (tipo: string) => {
    switch (tipo) {
      case 'positivo': return <CheckCircle className="h-4 w-4" />;
      case 'negativo': return <AlertCircle className="h-4 w-4" />;
      case 'neutral': return <Minus className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getColorTipo = (tipo: string) => {
    switch (tipo) {
      case 'positivo': return 'text-green-600 bg-green-100';
      case 'negativo': return 'text-red-600 bg-red-100';
      case 'neutral': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getColorPuntos = (puntos?: number) => {
    if (!puntos) return 'text-gray-600';
    if (puntos > 0) return 'text-green-600';
    if (puntos < 0) return 'text-red-600';
    return 'text-yellow-600';
  };

  const getIconoTendencia = () => {
    switch (tendencia) {
      case 'mejorando': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'empeorando': return <TrendingDown className="h-4 w-4 text-red-500" />;
      default: return <Minus className="h-4 w-4 text-gray-400" />;
    }
  };

  // Acciones
  const limpiarFiltros = () => {
    setFiltroTipo('todos');
    setFiltroCategoria('todas');
    setBusqueda('');
  };

  const exportarCSV = () => {
    const header = ['ID', 'Fecha', 'Tipo', 'Categoría', 'Descripción', 'Docente', 'Puntos'];
    const rows = registrosFiltrados.map(r => [
      r.id,
      r.fecha,
      r.tipo,
      r.categoria || '',
      `"${r.descripcion.replace(/"/g, '""')}"`,
      r.docente,
      r.puntos ?? ''
    ].join(','));
    const blob = new Blob([header.join(',') + '\n' + rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const curso = courseTitle ? `_${courseTitle.replace(/\s+/g, '_')}` : '';
    a.download = `conducta${curso}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({
      title: "Exportado",
      description: "Archivo CSV descargado exitosamente",
    });
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="flex gap-4">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-10 w-40" />
        </div>
        
        <div className="space-y-3">
          {[1,2,3,4,5].map(i => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Registro de Conducta</h1>
          <p className="text-muted-foreground">
            Seguimiento del comportamiento de {childInfo ? `${childInfo.nombres} ${childInfo.apellidos}` : 'Mi hijo(a)'}
          </p>

          {/* Curso seleccionado (si viene desde Notas) */}
          {courseTitle && (
            <div className="mt-3 flex items-center gap-2 flex-wrap">
              <Badge variant="secondary" className="text-sm">
                Filtrado por: {courseTitle}
              </Badge>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
          <Button variant="outline" onClick={limpiarFiltros}>
            <X className="h-4 w-4 mr-2" />
            Limpiar filtros
          </Button>
          <Button onClick={exportarCSV}>
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
                <p className="text-2xl font-bold text-foreground">{stats.totalRegistros}</p>
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
                <p className="text-sm text-muted-foreground">Puntos Positivos</p>
                <p className="text-2xl font-bold text-green-600">+{stats.puntosPositivos}</p>
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
                <p className="text-sm text-muted-foreground">Puntos Negativos</p>
                <p className="text-2xl font-bold text-red-600">-{stats.puntosNegativos}</p>
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
                <p className="text-sm text-muted-foreground">Balance Total</p>
                <p className={`text-2xl font-bold ${getColorPuntos(stats.puntosNetos)}`}>
                  {stats.puntosNetos > 0 ? '+' : ''}{stats.puntosNetos}
                </p>
              </div>
              <div className="p-2 bg-purple-100 rounded-full">
                {getIconoTendencia()}
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1 capitalize">
              Tendencia: {tendencia}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por descripción, docente o categoría..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={filtroTipo} onValueChange={setFiltroTipo}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos los tipos</SelectItem>
            <SelectItem value="positivo">Positivo</SelectItem>
            <SelectItem value="negativo">Negativo</SelectItem>
            <SelectItem value="neutral">Neutral</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Categoría" />
          </SelectTrigger>
          <SelectContent>
            {categoriasOpts.map(opt => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Lista de registros */}
      <div className="space-y-3">
        {registrosFiltrados.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Sin registros de conducta</h3>
              <p className="text-muted-foreground">
                {records.length === 0 
                  ? "Aún no hay registros de conducta para mostrar"
                  : "No hay registros que coincidan con los filtros aplicados"}
              </p>
            </CardContent>
          </Card>
        ) : (
          registrosFiltrados.map((registro) => (
            <Card key={registro.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                  {/* Icono y tipo */}
                  <div className={`flex items-center justify-center w-12 h-12 rounded-full shrink-0 ${getColorTipo(registro.tipo)}`}>
                    {getIconoTipo(registro.tipo)}
                  </div>
                  
                  {/* Contenido principal */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <Badge variant={
                        registro.tipo === 'positivo' ? 'default' :
                        registro.tipo === 'negativo' ? 'destructive' : 'secondary'
                      } className="capitalize">
                        {registro.tipo}
                      </Badge>
                      {registro.categoria && (
                        <Badge variant="outline">{registro.categoria}</Badge>
                      )}
                    </div>
                    
                    <p className="text-foreground">{registro.descripcion}</p>
                    
                    <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {registro.docente}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(registro.fecha).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                  
                  {/* Puntos */}
                  {registro.puntos !== undefined && (
                    <div className="flex items-center justify-center shrink-0">
                      <span className={`text-2xl font-bold ${getColorPuntos(registro.puntos)}`}>
                        {registro.puntos > 0 ? '+' : ''}{registro.puntos}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Información adicional */}
      {records.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Award className="h-5 w-5 text-purple-500" />
              ¿Cómo mejorar la conducta?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="space-y-2">
                <h3 className="font-medium text-green-600">Conducta Positiva</h3>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Participar activamente en clase</li>
                  <li>• Ayudar a compañeros</li>
                  <li>• Cumplir con tareas a tiempo</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h3 className="font-medium text-blue-600">Respeto y Valores</h3>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Respetar a docentes y compañeros</li>
                  <li>• Mantener el orden en el aula</li>
                  <li>• Ser puntual</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h3 className="font-medium text-purple-600">Compromiso</h3>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Prestar atención en clase</li>
                  <li>• Cuidar el material escolar</li>
                  <li>• Colaborar en actividades grupales</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
