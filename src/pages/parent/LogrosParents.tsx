// src/pages/parent/Logros.tsx
import React, { useState, useMemo, useEffect, createContext, useContext } from 'react';

// Importaciones de shadcn/ui
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton'; // Para skeleton loading
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from '@/components/ui/dialog'; // Para el modal de detalles
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";


// Importaciones de iconos de lucide-react
import {
  Search,           // Para la barra de búsqueda
  Award,            // Icono principal para logros, y para logros académicos
  Trophy,           // Para logros deportivos
  Star,             // Para logros disciplinarios o de honor
  Sparkles,         // Para logros artísticos
  CalendarDays,     // Para fechas y filtrar por período
  Filter,           // Para el filtro general
  Info,             // Para mensajes de "no resultados"
  Users,            // Para logros comunitarios
  Eye,              // Para ver detalles
  Crown,            // Nuevo icono para 'trono'
  BadgeCheck,       // Nuevo icono para 'bien hecho'
  ThumbsUp,         // Nuevo icono para 'regular' (o un buen intento)
  CircleDot          // Para 'estrella' (más general que Star si ya se usa para disciplinario)
} from 'lucide-react';

// --- Tipos de Datos ---

// Nuevo Enum para niveles de reconocimiento
type ReconocimientoNivel = 'excelente' | 'notable' | 'satisfactorio' | 'requiere_mejora';

interface Logro {
  id: number;
  estudianteId: number;
  titulo: string;
  descripcion: string;
  fecha: string; // YYYY-MM-DD
  tipo: 'academico' | 'deportivo' | 'artistico' | 'comunitario' | 'disciplinario' | 'otro';
  nivelReconocimiento: ReconocimientoNivel; // Nuevo campo
  entidadEmisora: string; // Quien otorga el logro (ej: "Departamento de Matemáticas", "Club de Atletismo")
  periodoId?: number;
}

interface EstudianteInfo {
  id: number;
  nombre: string;
  apellido: string;
}

interface PeriodoInfo {
  id: number;
  nombre: string;
}

// --- Contexto de Estudiante (Simulación) ---
interface EstudianteContextType {
  estudianteActual: EstudianteInfo | null;
  loadingEstudiante: boolean;
}
const EstudianteContext = createContext<EstudianteContextType>({
  estudianteActual: null,
  loadingEstudiante: true,
});

// Componente Proveedor de Contexto (Solo para simular en este archivo)
const EstudianteProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [estudianteActual, setEstudianteActual] = useState<EstudianteInfo | null>(null);
  const [loadingEstudiante, setLoadingEstudiante] = useState(true);
  const ID_SIMULADO_ESTUDIANTE = 101; // ID del estudiante para el que se verán los logros

  useEffect(() => {
    // Simular una llamada a API para obtener datos del estudiante
    setTimeout(() => {
      setEstudianteActual({ id: ID_SIMULADO_ESTUDIANTE, nombre: 'Sofía', apellido: 'García' });
      setLoadingEstudiante(false);
    }, 1000); // Retraso de 1 segundo
  }, []);

  return (
    <EstudianteContext.Provider value={{ estudianteActual, loadingEstudiante }}>
      {children}
    </EstudianteContext.Provider>
  );
};

// --- Datos de Ejemplo (Fuera del componente para evitar re-creación) ---
const ALL_LOGROS_DATA: Logro[] = [
  { id: 1, estudianteId: 101, titulo: 'Mejor Promedio Matemáticas', descripcion: 'Obtuvo la calificación más alta en Matemáticas I durante el Ciclo 2023-2024, demostrando una comprensión excepcional de conceptos avanzados y resolución de problemas.', fecha: '2024-07-20', tipo: 'academico', nivelReconocimiento: 'excelente', entidadEmisora: 'Departamento de Matemáticas', periodoId: 2 },
  { id: 2, estudianteId: 101, titulo: 'Participación en Olimpiada Científica', descripcion: 'Representó a la institución en la olimpiada de ciencias a nivel regional, obteniendo una mención especial por su proyecto de energía renovable.', fecha: '2024-05-15', tipo: 'academico', nivelReconocimiento: 'notable', entidadEmisora: 'Club de Ciencias', periodoId: 2 },
  { id: 3, estudianteId: 102, titulo: 'Campeón Torneo de Ajedrez', descripcion: 'Ganador del torneo interno de ajedrez escolar, demostrando estrategia y habilidad táctica superiores.', fecha: '2024-06-10', tipo: 'deportivo', nivelReconocimiento: 'excelente', entidadEmisora: 'Club de Ajedrez', periodoId: 2 },
  { id: 4, estudianteId: 101, titulo: 'Reconocimiento por Servicio Comunitario', descripcion: 'Lideró la iniciativa de reciclaje en la escuela durante el semestre, logrando una reducción del 30% en residuos plásticos.', fecha: '2023-12-01', tipo: 'comunitario', nivelReconocimiento: 'notable', entidadEmisora: 'Consejo Estudiantil', periodoId: 1 },
  { id: 5, estudianteId: 101, titulo: 'Mención Honorífica Arte', descripcion: 'Por su destacada pintura surrealista "El Sueño del Colibrí" en la exposición anual de arte escolar, recibiendo elogios por su creatividad y técnica.', fecha: '2024-04-25', tipo: 'artistico', nivelReconocimiento: 'excelente', entidadEmisora: 'Taller de Artes Plásticas', periodoId: 2 },
  { id: 6, estudianteId: 102, titulo: 'Mejor Deportista del Año', descripcion: 'Reconocimiento por su excelencia y espíritu deportivo en múltiples disciplinas, siendo un ejemplo para sus compañeros.', fecha: '2024-07-25', tipo: 'deportivo', nivelReconocimiento: 'excelente', entidadEmisora: 'Dirección Deportiva', periodoId: 2 },
  { id: 7, estudianteId: 101, titulo: 'Excelencia en Comportamiento', descripcion: 'Ejemplo de conducta, respeto y liderazgo positivo en el aula y en la escuela durante todo el ciclo académico.', fecha: '2024-07-20', tipo: 'disciplinario', nivelReconocimiento: 'excelente', entidadEmisora: 'Comité de Convivencia', periodoId: 2 },
  { id: 8, estudianteId: 101, titulo: 'Premio a la Creatividad Literaria', descripcion: 'Ganador del concurso de cuentos cortos con su obra "El Viaje del Pequeño Explorador".', fecha: '2024-03-10', tipo: 'artistico', nivelReconocimiento: 'notable', entidadEmisora: 'Círculo de Lectura', periodoId: 2 },
  { id: 9, estudianteId: 101, titulo: 'Reconocimiento al Esfuerzo Académico', descripcion: 'Por su notable mejora y dedicación en el área de Ciencias Sociales.', fecha: '2023-11-20', tipo: 'academico', nivelReconocimiento: 'satisfactorio', entidadEmisora: 'Jefatura de Estudios', periodoId: 1 },
  { id: 10, estudianteId: 101, titulo: 'Voluntario Destacado', descripcion: 'Contribuyó activamente en la campaña de reforestación urbana en el parque local.', fecha: '2024-02-05', tipo: 'comunitario', nivelReconocimiento: 'satisfactorio', entidadEmisora: 'Junta Vecinal', periodoId: 2 },
  { id: 11, estudianteId: 101, titulo: 'Participación en Club de Robótica', descripcion: 'Asistencia y contribución regular en las actividades semanales del club de robótica.', fecha: '2024-01-15', tipo: 'otro', nivelReconocimiento: 'satisfactorio', entidadEmisora: 'Club de Robótica', periodoId: 2 },
  { id: 12, estudianteId: 101, titulo: 'Entrega de Proyectos a Tiempo', descripcion: 'Cumplimiento constante con todas las entregas de proyectos en el área de Lenguaje.', fecha: '2024-06-01', tipo: 'academico', nivelReconocimiento: 'requiere_mejora', entidadEmisora: 'Departamento de Lenguaje', periodoId: 2 },
];

const PERIODOS_DATA: PeriodoInfo[] = [
  { id: 1, nombre: 'Ciclo Escolar 2022-2023' },
  { id: 2, nombre: 'Ciclo Escolar 2023-2024' },
  { id: 3, nombre: 'Verano 2024' },
];

const TIPOS_LOGRO_ENUM = ['academico', 'deportivo', 'artistico', 'comunitario', 'disciplinario', 'otro'];
const RECONOCIMIENTO_NIVELES_ENUM: ReconocimientoNivel[] = ['excelente', 'notable', 'satisfactorio', 'requiere_mejora'];

// --- Componente principal ---
export default function ParentLogrosWrapper() {
  return (
    <EstudianteProvider>
      <ParentLogrosContent />
    </EstudianteProvider>
  );
}

function ParentLogrosContent() {
  const { estudianteActual, loadingEstudiante } = useContext(EstudianteContext);
  const ID_ESTUDIANTE_ACTUAL = estudianteActual?.id;

  const [isLoadingLogros, setIsLoadingLogros] = useState(true);
  const [logrosData, setLogrosData] = useState<Logro[]>([]);

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterTipo, setFilterTipo] = useState<string>('todos');
  const [filterPeriodo, setFilterPeriodo] = useState<string>('todos');
  const [filterNivelReconocimiento, setFilterNivelReconocimiento] = useState<string>('todos'); // Nuevo estado para el filtro de nivel

  // Estado para el modal de detalles
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedLogro, setSelectedLogro] = useState<Logro | null>(null);

  // Estado para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6; // Mostrar 6 logros por página

  useEffect(() => {
    if (ID_ESTUDIANTE_ACTUAL !== undefined) {
      setIsLoadingLogros(true);
      // Simular una llamada a API para obtener logros
      setTimeout(() => {
        const filtered = ALL_LOGROS_DATA.filter(logro => logro.estudianteId === ID_ESTUDIANTE_ACTUAL);
        setLogrosData(filtered);
        setIsLoadingLogros(false);
      }, 1500); // Retraso de 1.5 segundos
    }
  }, [ID_ESTUDIANTE_ACTUAL]);

  // Lógica de Filtrado y Búsqueda (actualizada para incluir el nuevo filtro)
  const filteredLogros = useMemo(() => {
    return logrosData.filter(logro => {
      const matchesSearch = `${logro.titulo} ${logro.descripcion} ${logro.entidadEmisora}`.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTipo = filterTipo === 'todos' || logro.tipo === filterTipo;
      const matchesPeriodo = filterPeriodo === 'todos' || (logro.periodoId && logro.periodoId.toString() === filterPeriodo);
      const matchesNivel = filterNivelReconocimiento === 'todos' || logro.nivelReconocimiento === filterNivelReconocimiento;
      return matchesSearch && matchesTipo && matchesPeriodo && matchesNivel;
    });
  }, [logrosData, searchTerm, filterTipo, filterPeriodo, filterNivelReconocimiento]);

  // Lógica de Paginación
  const totalPages = Math.ceil(filteredLogros.length / itemsPerPage);
  const currentLogros = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredLogros.slice(startIndex, endIndex);
  }, [filteredLogros, currentPage, itemsPerPage]);

  const handlePageChange = (page: number) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // --- Funciones auxiliares para estilos e iconos ---
  const getTipoBadgeColors = (tipo: Logro['tipo']) => {
    switch (tipo) {
      case 'academico': return 'bg-blue-100 text-blue-700';
      case 'deportivo': return 'bg-green-100 text-green-700';
      case 'artistico': return 'bg-purple-100 text-purple-700';
      case 'comunitario': return 'bg-orange-100 text-orange-700';
      case 'disciplinario': return 'bg-red-100 text-red-700';
      case 'otro': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getNivelBadgeColors = (nivel: ReconocimientoNivel) => {
    switch (nivel) {
      case 'excelente': return 'bg-yellow-100 text-yellow-700 border border-yellow-300'; // Trono/Estrella
      case 'notable': return 'bg-blue-100 text-blue-700 border border-blue-300'; // Bien Hecho
      case 'satisfactorio': return 'bg-green-100 text-green-700 border border-green-300'; // Regular
      case 'requiere_mejora': return 'bg-red-100 text-red-700 border border-red-300'; // Necesita mejorar
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getTipoIcon = (tipo: Logro['tipo']) => {
    switch (tipo) {
      case 'academico': return <Award className="h-4 w-4 mr-1" />;
      case 'deportivo': return <Trophy className="h-4 w-4 mr-1" />;
      case 'artistico': return <Sparkles className="h-4 w-4 mr-1" />;
      case 'comunitario': return <Users className="h-4 w-4 mr-1" />;
      case 'disciplinario': return <Star className="h-4 w-4 mr-1" />;
      case 'otro': return <Info className="h-4 w-4 mr-1" />;
      default: return <Info className="h-4 w-4 mr-1" />;
    }
  };

  // Mapeo de los nuevos "niveles" a los términos "trono", "estrella", "bien hecho", "regular"
  const getNivelReconocimientoDisplay = (nivel: ReconocimientoNivel) => {
    switch (nivel) {
      case 'excelente': return 'Trono / Estrella';
      case 'notable': return 'Bien Hecho';
      case 'satisfactorio': return 'Satisfactorio';
      case 'requiere_mejora': return 'Requiere Mejora';
      default: return 'Desconocido';
    }
  };

  const getNivelReconocimientoIcon = (nivel: ReconocimientoNivel) => {
    switch (nivel) {
      case 'excelente': return <Crown className="h-4 w-4 ml-1 text-yellow-500" />;
      case 'notable': return <BadgeCheck className="h-4 w-4 ml-1 text-blue-500" />;
      case 'satisfactorio': return <ThumbsUp className="h-4 w-4 ml-1 text-green-500" />;
      case 'requiere_mejora': return <CircleDot className="h-4 w-4 ml-1 text-red-500" />;
      default: return null;
    }
  }


  const openDetailModal = (logro: Logro) => {
    setSelectedLogro(logro);
    setIsDetailModalOpen(true);
  };

  const nombreCompletoEstudiante = estudianteActual ? `${estudianteActual.nombre} ${estudianteActual.apellido}` : 'Estudiante';


  // --- Renderizado ---
  if (loadingEstudiante || isLoadingLogros) {
    return (
      <div className="space-y-6 p-4">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <Skeleton className="h-9 w-[300px] mb-2" />
            <Skeleton className="h-5 w-[400px]" />
          </div>
        </div>
        <Separator className="my-6" />
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <Skeleton className="h-10 w-full md:w-[300px]" />
              <Skeleton className="h-10 w-full sm:w-[160px]" />
              <Skeleton className="h-10 w-full sm:w-[200px]" />
              <Skeleton className="h-10 w-full sm:w-[200px]" /> {/* Añadido skeleton para el nuevo filtro */}
            </div>
          </CardContent>
        </Card>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(itemsPerPage)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-[80%]" />
                <Skeleton className="h-5 w-[100px]" />
                <Skeleton className="h-5 w-[120px]" /> {/* Skeleton para el badge de nivel */}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      {/* Header de la Sección */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Award className="h-7 w-7 text-yellow-600" />
            Logros de {nombreCompletoEstudiante}
          </h1>
          <p className="text-muted-foreground">
            Una mirada a los reconocimientos y hitos importantes de tu hijo/a.
          </p>
        </div>
      </div>

      <Separator className="my-6" />

      {/* Sección de Filtros y Búsqueda */}
      <Card className="shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full md:w-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar por título, descripción o emisor..."
                className="pl-10 w-full focus-visible:ring-blue-300"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1); // Resetear paginación al buscar
                }}
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
              <Select value={filterTipo} onValueChange={(value) => {
                setFilterTipo(value);
                setCurrentPage(1); // Resetear paginación al filtrar
              }}>
                <SelectTrigger className="w-full sm:w-[160px] focus:ring-blue-300">
                  <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="Filtrar por tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los tipos</SelectItem>
                  {TIPOS_LOGRO_ENUM.map(tipo => (
                    <SelectItem key={tipo} value={tipo}>
                      {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {/* Nuevo filtro para Nivel de Reconocimiento */}
              <Select value={filterNivelReconocimiento} onValueChange={(value) => {
                setFilterNivelReconocimiento(value);
                setCurrentPage(1); // Resetear paginación al filtrar
              }}>
                <SelectTrigger className="w-full sm:w-[200px] focus:ring-blue-300">
                  <Star className="h-4 w-4 mr-2 text-muted-foreground" /> {/* Usamos Star como icono general para nivel */}
                  <SelectValue placeholder="Filtrar por nivel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los niveles</SelectItem>
                  {RECONOCIMIENTO_NIVELES_ENUM.map(nivel => (
                    <SelectItem key={nivel} value={nivel}>
                      {getNivelReconocimientoDisplay(nivel)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterPeriodo} onValueChange={(value) => {
                setFilterPeriodo(value);
                setCurrentPage(1); // Resetear paginación al filtrar
              }}>
                <SelectTrigger className="w-full sm:w-[200px] focus:ring-blue-300">
                  <CalendarDays className="h-4 w-4 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="Filtrar por período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los períodos</SelectItem>
                  {PERIODOS_DATA.map(periodo => (
                    <SelectItem key={periodo.id} value={periodo.id.toString()}>
                      {periodo.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Listado de Logros */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {currentLogros.length === 0 ? (
          <Card className="lg:col-span-3 text-center animate-fadeIn">
            <CardContent className="p-4 py-12 text-muted-foreground">
              <Info className="h-16 w-16 mx-auto mb-6 text-gray-400" />
              <p className="text-xl font-semibold mb-3">¡No hay logros que mostrar aquí!</p>
              <p className="text-base mb-4">
                Tu hijo/a aún no tiene logros registrados que coincidan con los filtros aplicados.
              </p>
              <p className="text-sm">
                ¡Esperamos ver grandes éxitos reflejados pronto!
              </p>
            </CardContent>
          </Card>
        ) : (
          currentLogros.map(logro => (
            <Card
              key={logro.id}
              className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 ease-in-out transform hover:-translate-y-1 border-l-4 border-blue-500 hover:border-blue-600 animate-fadeIn"
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2 text-blue-800 font-semibold group-hover:text-blue-900 transition-colors duration-200">
                  {getTipoIcon(logro.tipo)} {logro.titulo}
                </CardTitle>
                <CardDescription className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                  <CalendarDays className="h-3 w-3 mr-1" /> {logro.fecha}
                </CardDescription>
                <Badge variant="secondary" className="mt-2 text-gray-700 bg-gray-100 group-hover:bg-gray-200 transition-colors duration-200">
                  {logro.entidadEmisora}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-gray-700">
                <p className="line-clamp-2">{logro.descripcion}</p> {/* Limitar a 2 líneas */}
                <div className="flex items-center gap-2">
                  <Badge className={getTipoBadgeColors(logro.tipo)}>
                    {logro.tipo.charAt(0).toUpperCase() + logro.tipo.slice(1)}
                  </Badge>
                  {/* Nuevo Badge para el Nivel de Reconocimiento */}
                  <Badge className={`${getNivelBadgeColors(logro.nivelReconocimiento)} flex items-center`}>
                    {getNivelReconocimientoDisplay(logro.nivelReconocimiento)}
                    {getNivelReconocimientoIcon(logro.nivelReconocimiento)}
                  </Badge>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end p-4 pt-0">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => openDetailModal(logro)}
                  className="text-blue-600 hover:bg-blue-50 transition-colors duration-200"
                >
                  <Eye className="h-4 w-4 mr-1" /> Ver más
                </Button>
              </CardFooter>
            </Card>
          ))
        )}
      </div>

      {/* Paginación */}
      {filteredLogros.length > itemsPerPage && (
        <Pagination className="mt-8 animate-fadeInUp">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => handlePageChange(currentPage - 1)}
                isActive={currentPage > 1}
              />
            </PaginationItem>
            {[...Array(totalPages)].map((_, index) => (
              <PaginationItem key={index}>
                <PaginationLink
                  onClick={() => handlePageChange(index + 1)}
                  isActive={currentPage === index + 1}
                >
                  {index + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                onClick={() => handlePageChange(currentPage + 1)}
                isActive={currentPage < totalPages}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      {/* Modal de Detalles del Logro */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="sm:max-w-[425px] md:max-w-[600px] animate-scaleIn">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl text-blue-700">
              {selectedLogro && getTipoIcon(selectedLogro.tipo)} {selectedLogro?.titulo}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground flex items-center gap-1 text-sm mt-1">
              <CalendarDays className="h-3 w-3 mr-1" /> Fecha: {selectedLogro?.fecha}
              <Badge variant="secondary" className="ml-2 bg-gray-100 text-gray-700">
                {selectedLogro?.entidadEmisora}
              </Badge>
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <p className="text-gray-800 leading-relaxed">{selectedLogro?.descripcion}</p>
            {selectedLogro?.periodoId && (
              <p className="text-sm text-muted-foreground">
                Período: <span className="font-medium text-gray-700">
                  {PERIODOS_DATA.find(p => p.id === selectedLogro?.periodoId)?.nombre}
                </span>
              </p>
            )}
            <div className="flex items-center gap-2">
              <Badge className={selectedLogro ? getTipoBadgeColors(selectedLogro.tipo) : 'bg-gray-100 text-gray-700'}>
                {selectedLogro?.tipo.charAt(0).toUpperCase() + selectedLogro?.tipo.slice(1)}
              </Badge>
              {/* Nuevo Badge para el Nivel de Reconocimiento en el modal */}
              {selectedLogro && (
                <Badge className={`${getNivelBadgeColors(selectedLogro.nivelReconocimiento)} flex items-center`}>
                  {getNivelReconocimientoDisplay(selectedLogro.nivelReconocimiento)}
                  {getNivelReconocimientoIcon(selectedLogro.nivelReconocimiento)}
                </Badge>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}