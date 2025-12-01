// src/pages/teacher/Planificacion.tsx
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import {
  BookOpen,          // Icono principal para Planificación/Materia
  BookMarked,        // Para unidades o temas
  Calendar,          // Para fechas
  Plus,              // Para añadir
  Edit,              // Para editar
  Trash2,            // Para eliminar
  ChevronDown,       // Para expandir
  ChevronUp,         // Para colapsar
  Info,              // Para información
  Users,             // Para grupo
  FileText,          // Para tipo de recurso: documento
  Video,             // Para tipo de recurso: video
  Link,              // Para tipo de recurso: enlace
  Presentation,      // Para tipo de recurso: presentación
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';

// --- Tipos de Datos (idealmente en un archivo compartido) ---
interface MateriaDocente {
  id: number;
  nombre: string;
  grado: string;
  grupo: string;
  docenteId: number;
}

interface RecursoPlan {
  id: number;
  nombre: string;
  tipo: 'documento' | 'video' | 'enlace' | 'presentacion';
  url: string;
}

interface ActividadPlan {
  id: number;
  nombre: string;
  descripcion: string;
}

interface UnidadPlan {
  id: number;
  materiaId: number;
  titulo: string;
  descripcion: string;
  fechaInicio: string;
  fechaFin: string;
  objetivos: string[];
  recursos: RecursoPlan[];
  actividades: ActividadPlan[];
}


export default function TeacherPlanificacion() {
  const [selectedMateriaGrupo, setSelectedMateriaGrupo] = useState<string>('1-A'); // 'grado-grupo'
  const [expandedUnidad, setExpandedUnidad] = useState<number | null>(null);

  // --- Datos de Ejemplo para el Docente ---
  const materiasDocente: MateriaDocente[] = useMemo(() => [
    { id: 1, nombre: 'Matemáticas', grado: '1', grupo: 'A', docenteId: 1 },
    { id: 2, nombre: 'Física', grado: '1', grupo: 'A', docenteId: 1 },
    { id: 3, nombre: 'Matemáticas', grado: '1', grupo: 'B', docenteId: 1 },
    { id: 4, nombre: 'Introducción a la Programación', grado: '2', grupo: 'C', docenteId: 1 },
  ], []);

  const planificacion: UnidadPlan[] = useMemo(() => [
    {
      id: 1,
      materiaId: 1,
      titulo: 'Unidad 1: Fundamentos de Álgebra',
      descripcion: 'Introducción a los conceptos básicos del álgebra, incluyendo operaciones con polinomios y ecuaciones lineales.',
      fechaInicio: '2024-01-08',
      fechaFin: '2024-01-26',
      objetivos: ['Comprender las propiedades de los números reales.', 'Resolver ecuaciones de primer grado.', 'Simplificar expresiones algebraicas.'],
      recursos: [
        { id: 101, nombre: 'Libro de texto - Capítulo 1', tipo: 'documento', url: '#' },
        { id: 102, nombre: 'Video: Ecuaciones lineales', tipo: 'video', url: '#' },
      ],
      actividades: [
        { id: 201, nombre: 'Ejercicios de Práctica - Pág. 25', descripcion: 'Resolver problemas 1-15.' },
        { id: 202, nombre: 'Examen de la Unidad', descripcion: 'Evaluación final del tema.' },
      ]
    },
    {
      id: 2,
      materiaId: 1,
      titulo: 'Unidad 2: Funciones y Gráficos',
      descripcion: 'Análisis de diferentes tipos de funciones, su representación gráfica y propiedades.',
      fechaInicio: '2024-01-29',
      fechaFin: '2024-02-16',
      objetivos: ['Identificar funciones lineales y cuadráticas.', 'Graficar funciones en el plano cartesiano.', 'Determinar el dominio y rango de una función.'],
      recursos: [
        { id: 103, nombre: 'Presentación: Tipos de Funciones', tipo: 'presentacion', url: '#' },
        { id: 104, nombre: 'Enlace a GeoGebra', tipo: 'enlace', url: '#' },
      ],
      actividades: [
        { id: 203, nombre: 'Proyecto: Diseño de un Gráfico', descripcion: 'Crear un gráfico de una función compleja.' },
      ]
    },
    {
      id: 3,
      materiaId: 2,
      titulo: 'Unidad 1: Cinemática',
      descripcion: 'Estudio del movimiento de los cuerpos sin considerar las causas que lo provocan.',
      fechaInicio: '2024-01-15',
      fechaFin: '2024-02-05',
      objetivos: ['Diferenciar entre velocidad y aceleración.', 'Resolver problemas de movimiento rectilíneo uniforme.', 'Interpretar gráficos de posición-tiempo.'],
      recursos: [
        { id: 105, nombre: 'Simulador de Movimiento', tipo: 'enlace', url: '#' },
      ],
      actividades: [
        { id: 204, nombre: 'Laboratorio Virtual', descripcion: 'Simular el movimiento de un proyectil.' },
      ]
    },
  ], []);

  // --- Lógica de filtrado y cálculo ---
  const currentMateria = useMemo(() => {
    const [grado, grupo] = selectedMateriaGrupo.split('-');
    return materiasDocente.find(m => m.grado === grado && m.grupo === grupo);
  }, [selectedMateriaGrupo, materiasDocente]);

  const unidadesForCurrentMateria = useMemo(() => {
    if (!currentMateria) return [];
    return planificacion.filter(u => u.materiaId === currentMateria.id)
                        .sort((a, b) => new Date(a.fechaInicio).getTime() - new Date(b.fechaInicio).getTime());
  }, [planificacion, currentMateria]);

  // Función para formatear fechas
  const formatFecha = (fechaStr: string) => {
    const date = new Date(fechaStr);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const toggleExpand = (unidadId: number) => {
    setExpandedUnidad(expandedUnidad === unidadId ? null : unidadId);
  };

  const getRecursoIcon = (tipo: RecursoPlan['tipo']) => {
    switch (tipo) {
      case 'documento': return <FileText className="h-4 w-4 text-blue-500" />;
      case 'video': return <Video className="h-4 w-4 text-red-500" />;
      case 'enlace': return <Link className="h-4 w-4 text-purple-500" />;
      case 'presentacion': return <Presentation className="h-4 w-4 text-green-500" />;
      default: return <Info className="h-4 w-4 text-gray-500" />;
    }
  };


  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <BookOpen className="h-7 w-7 text-blue-600" /> {/* Ajustado color */}
            Planificación Académica
          </h1>
          <p className="text-muted-foreground">
            Organiza tus unidades de clase, objetivos, recursos y actividades.
          </p>
        </div>
        <Button variant="default" className="bg-blue-600 hover:bg-blue-700 text-white"> {/* Ajustado a variant="default" y colores directos */}
          <Plus className="h-4 w-4 mr-2" />
          Añadir Nueva Unidad
        </Button>
      </div>

      {/* Selector de Materia/Grupo */}
      <Card>
        <CardContent className="p-4 flex flex-col md:flex-row items-center gap-4">
          <Label htmlFor="select-materia-grupo" className="flex-shrink-0 text-sm font-medium flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            Seleccionar Materia/Grupo:
          </Label>
          <Select value={selectedMateriaGrupo} onValueChange={setSelectedMateriaGrupo}>
            <SelectTrigger id="select-materia-grupo" className="w-full md:w-[250px]">
              <SelectValue placeholder="Materia y Grupo" />
            </SelectTrigger>
            <SelectContent>
              {materiasDocente.map(materia => (
                <SelectItem key={`${materia.id}-${materia.grupo}`} value={`${materia.grado}-${materia.grupo}`}>
                  {materia.nombre} ({materia.grado}° {materia.grupo})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Lista de Unidades de Planificación */}
      {currentMateria ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookMarked className="h-6 w-6 text-blue-600" /> {/* Ajustado color */}
              Unidades de {currentMateria.nombre} ({currentMateria.grado}° {currentMateria.grupo})
            </CardTitle>
            <CardDescription>
              Un total de {unidadesForCurrentMateria.length} unidades planificadas para esta materia.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {unidadesForCurrentMateria.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Info className="h-12 w-12 mx-auto mb-4 text-gray-400" /> {/* Ajustado color */}
                <p>No hay unidades de planificación para esta materia. ¡Añade una para comenzar\! </p>
              </div>
            ) : (
              <div className="space-y-4">
                {unidadesForCurrentMateria.map(unidad => (
                  <div key={unidad.id} className="border rounded-lg p-4 bg-card text-card-foreground shadow-sm"> {/* Clase de card y shadow */}
                    <div className="flex justify-between items-start gap-4 cursor-pointer" onClick={() => toggleExpand(unidad.id)}>
                      <div className="flex-grow">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                          {unidad.titulo}
                          <Badge variant="secondary" className="font-normal text-xs bg-gray-100 text-gray-700"> {/* Ajustado a bg-gray-100 */}
                            <Calendar className="h-3 w-3 mr-1 text-gray-500" /> {/* Ajustado color */}
                            {formatFecha(unidad.fechaInicio)} - {formatFecha(unidad.fechaFin)}
                          </Badge>
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{unidad.descripcion}</p>
                      </div>
                      <div className="flex-shrink-0 flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:bg-gray-100 hover:text-blue-600" onClick={(e) => { e.stopPropagation(); console.log('Editar Unidad'); }}> {/* Ajustado color y hover */}
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:bg-gray-100 hover:text-red-500" onClick={(e) => { e.stopPropagation(); console.log('Eliminar Unidad'); }}> {/* Ajustado color y hover */}
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:bg-gray-100"> {/* Ajustado color y hover */}
                          {expandedUnidad === unidad.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>

                    {expandedUnidad === unidad.id && (
                      <div className="mt-4 space-y-4">
                        <Separator />
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {/* Objetivos */}
                          <div>
                            <h4 className="text-base font-semibold mb-2 flex items-center gap-2 text-blue-600"> {/* Ajustado color */}
                              <BookMarked className="h-4 w-4" />
                              Objetivos
                            </h4>
                            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                              {unidad.objetivos.map((obj, index) => (
                                <li key={index}>{obj}</li>
                              ))}
                            </ul>
                          </div>
                          {/* Recursos */}
                          <div>
                            <h4 className="text-base font-semibold mb-2 flex items-center gap-2 text-blue-600"> {/* Ajustado color */}
                              <Info className="h-4 w-4" />
                              Recursos
                            </h4>
                            <ul className="space-y-2">
                              {unidad.recursos.map(recurso => (
                                <li key={recurso.id} className="flex items-center gap-2 text-sm text-muted-foreground"> {/* Centrado de iconos */}
                                  <div className="p-1 border rounded-sm bg-gray-50"> {/* Fondo ligero para el icono */}
                                    {getRecursoIcon(recurso.tipo)}
                                  </div>
                                  <a href={recurso.url} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer"> {/* Ajustado color de enlace */}
                                    {recurso.nombre}
                                  </a>
                                </li>
                              ))}
                            </ul>
                          </div>
                          {/* Actividades */}
                          <div>
                            <h4 className="text-base font-semibold mb-2 flex items-center gap-2 text-blue-600"> {/* Ajustado color */}
                              <BookMarked className="h-4 w-4" />
                              Actividades
                            </h4>
                            <ul className="space-y-2">
                              {unidad.actividades.map(actividad => (
                                <li key={actividad.id} className="text-sm">
                                  <h5 className="font-medium text-foreground">{actividad.nombre}</h5>
                                  <p className="text-muted-foreground text-xs">{actividad.descripcion}</p>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card className="text-center py-12 text-muted-foreground">
          <BookOpen className="h-16 w-16 mx-auto mb-4 text-blue-500" /> {/* Ajustado color */}
          <p className="text-lg font-medium">Selecciona una materia y grupo para ver su planificación.</p>
          <p className="mt-2 text-sm">Usa el selector de arriba para comenzar.</p>
        </Card>
      )}
    </div>
  );
}