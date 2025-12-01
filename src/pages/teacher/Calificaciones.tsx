// src/pages/teacher/Calificaciones.tsx
import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Award,
  User,
  BookOpen,
  Save,
  Download,
  Upload,
  Calculator,
  School,
  Filter,
  Bookmark
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// --- Tipos de Datos ---
interface Alumno {
  id: number;
  nombre: string;
  apellido: string;
  grado: string;
  grupo: string;
}

interface Materia {
  id: number;
  nombre: string;
  codigo: string;
  grado: string;
  grupo: string;
}

interface NotaFinal {
  alumnoId: number;
  materiaId: number;
  nota: number | null;
}

interface DocenteCurso {
  docenteId: number;
  curso: string; // "2-B", "4-A", etc.
  materias: string[]; // Códigos de materias que enseña: ["MATE", "COMP", etc.]
}

export default function TeacherCalificaciones() {
  const [trimestre, setTrimestre] = useState<string>('3');
  const [selectedCurso, setSelectedCurso] = useState<string>('');
  const [notas, setNotas] = useState<NotaFinal[]>([]);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  const { toast } = useToast();

  // --- PERFIL DEL DOCENTE ACTUAL ---
  const docenteId = 1; // Esto vendría del contexto de autenticación
  const docenteCursos: DocenteCurso[] = useMemo(() => [
    {
      docenteId: 1,
      curso: '2-B',
      materias: ['MATE', 'COMP'] // Este docente enseña Matemáticas y Computación a 2°B
    },
    {
      docenteId: 1,
      curso: '4-A', 
      materias: ['COMP', 'TTE'] // Este docente enseña Computación y Tecnología a 4°A
    }
  ], []);

  // --- DATOS COMPLETOS DEL SISTEMA ---
  const alumnos: Alumno[] = useMemo(() => [
    // 2°B Primaria
    { id: 1, nombre: 'THIAGO SEBASTIAN', apellido: 'ACUÑA INCA', grado: '2', grupo: 'B' },
    { id: 2, nombre: 'CARLOS SAMIR', apellido: 'AGUILAR AGREDA', grado: '2', grupo: 'B' },
    { id: 3, nombre: 'ADIEL EMANUEL', apellido: 'ANTONIO ROMERO', grado: '2', grupo: 'B' },
    
    // 4°A Primaria
    { id: 4, nombre: 'MARÍA FERNANDA', apellido: 'GUTIÉRREZ LÓPEZ', grado: '4', grupo: 'A' },
    { id: 5, nombre: 'JOSÉ LUIS', apellido: 'PÉREZ MARTÍNEZ', grado: '4', grupo: 'A' },
    { id: 6, nombre: 'ANA SOFÍA', apellido: 'RODRÍGUEZ GARCÍA', grado: '4', grupo: 'A' },
  ], []);

  const todasLasMaterias: Materia[] = useMemo(() => [
    // Materias para 2°B
    { id: 1, nombre: 'Lenguaje y Comunicación 1', codigo: 'LC1', grado: '2', grupo: 'B' },
    { id: 2, nombre: 'Inglés', codigo: 'ING', grado: '2', grupo: 'B' },
    { id: 3, nombre: 'Lectoescritura 1', codigo: 'LE-1', grado: '2', grupo: 'B' },
    { id: 4, nombre: 'Ciencias Sociales', codigo: 'CSO', grado: '2', grupo: 'B' },
    { id: 5, nombre: 'Educación Física', codigo: 'EFI', grado: '2', grupo: 'B' },
    { id: 6, nombre: 'Expresión Musical', codigo: 'EMU', grado: '2', grupo: 'B' },
    { id: 7, nombre: 'Artes Plásticas Visuales', codigo: 'APV', grado: '2', grupo: 'B' },
    { id: 8, nombre: 'Matemáticas', codigo: 'MATE', grado: '2', grupo: 'B' },
    { id: 9, nombre: 'Tecnología y Técnica', codigo: 'TTE', grado: '2', grupo: 'B' },
    { id: 10, nombre: 'Computación', codigo: 'COMP', grado: '2', grupo: 'B' },
    { id: 11, nombre: 'Técnica Especialidad', codigo: 'TE-C', grado: '2', grupo: 'B' },
    { id: 12, nombre: 'Ciencias Naturales', codigo: 'CNT', grado: '2', grupo: 'B' },
    { id: 13, nombre: 'Religión', codigo: 'RELI', grado: '2', grupo: 'B' },

    // Materias para 4°A
    { id: 14, nombre: 'Lenguaje y Comunicación', codigo: 'LC1', grado: '4', grupo: 'A' },
    { id: 15, nombre: 'Inglés', codigo: 'ING', grado: '4', grupo: 'A' },
    { id: 16, nombre: 'Matemáticas', codigo: 'MATE', grado: '4', grupo: 'A' },
    { id: 17, nombre: 'Ciencias Sociales', codigo: 'CSO', grado: '4', grupo: 'A' },
    { id: 18, nombre: 'Ciencias Naturales', codigo: 'CNT', grado: '4', grupo: 'A' },
    { id: 19, nombre: 'Educación Física', codigo: 'EFI', grado: '4', grupo: 'A' },
    { id: 20, nombre: 'Computación', codigo: 'COMP', grado: '4', grupo: 'A' },
    { id: 21, nombre: 'Tecnología y Técnica', codigo: 'TTE', grado: '4', grupo: 'A' },
    { id: 22, nombre: 'Artes Plásticas', codigo: 'APV', grado: '4', grupo: 'A' },
    { id: 23, nombre: 'Música', codigo: 'EMU', grado: '4', grupo: 'A' },
    { id: 24, nombre: 'Religión', codigo: 'RELI', grado: '4', grupo: 'A' },
  ], []);

  // --- FILTRADO SEGÚN PERFIL DEL DOCENTE ---
  const cursosDisponibles = useMemo(() => {
    return docenteCursos.filter(dc => dc.docenteId === docenteId);
  }, [docenteCursos]);

  const materiasDelDocente = useMemo(() => {
    if (!selectedCurso) return [];
    const cursoDocente = cursosDisponibles.find(dc => dc.curso === selectedCurso);
    if (!cursoDocente) return [];
    
    return todasLasMaterias.filter(materia => {
      const [grado, grupo] = selectedCurso.split('-');
      return materia.grado === grado && 
             materia.grupo === grupo && 
             cursoDocente.materias.includes(materia.codigo);
    });
  }, [selectedCurso, cursosDisponibles, todasLasMaterias]);

  const todasLasMateriasDelCurso = useMemo(() => {
    if (!selectedCurso) return [];
    const [grado, grupo] = selectedCurso.split('-');
    return todasLasMaterias.filter(m => m.grado === grado && m.grupo === grupo);
  }, [selectedCurso, todasLasMaterias]);

  const alumnosDelCurso = useMemo(() => {
    if (!selectedCurso) return [];
    const [grado, grupo] = selectedCurso.split('-');
    return alumnos.filter(a => a.grado === grado && a.grupo === grupo);
  }, [selectedCurso, alumnos]);

  // Inicializar notas vacías
  React.useEffect(() => {
    if (selectedCurso && alumnosDelCurso.length > 0 && todasLasMateriasDelCurso.length > 0) {
      const storageKey = `gradebook:calificaciones:${selectedCurso}:${trimestre}`;
      // si hay guardado en localStorage, cargarlo
      try {
        const raw = localStorage.getItem(storageKey);
        if (raw) {
          const parsed = JSON.parse(raw) as NotaFinal[];
          // asegurarse de que tenga las notas para las materias/alumnos actuales
          setNotas(parsed);
          return;
        }
      } catch {}

      const initialNotas: NotaFinal[] = [];
      alumnosDelCurso.forEach(alumno => {
        todasLasMateriasDelCurso.forEach(materia => {
          initialNotas.push({
            alumnoId: alumno.id,
            materiaId: materia.id,
            nota: null
          });
        });
      });
      setNotas(initialNotas);
    }
  }, [selectedCurso, alumnosDelCurso, todasLasMateriasDelCurso]);

  // Obtener nota de un alumno en una materia
  const getNota = (alumnoId: number, materiaId: number): number | null => {
    const nota = notas.find(n => n.alumnoId === alumnoId && n.materiaId === materiaId);
    return nota ? nota.nota : null;
  };

  // Verificar si el docente puede editar esta materia
  const puedeEditarMateria = (materiaId: number): boolean => {
    if (!selectedCurso) return false;
    const materia = todasLasMaterias.find(m => m.id === materiaId);
    if (!materia) return false;
    
    return materiasDelDocente.some(md => md.id === materiaId);
  };

  // Actualizar nota
  const updateNota = (alumnoId: number, materiaId: number, nuevaNota: number | null) => {
    if (!puedeEditarMateria(materiaId)) return;
    
    setNotas(prev => prev.map(nota => 
      nota.alumnoId === alumnoId && nota.materiaId === materiaId 
        ? { ...nota, nota: nuevaNota }
        : nota
    ));
  };

  // Calcular promedio por alumno
  const getPromedioAlumno = (alumnoId: number): number | null => {
    const notasAlumno = notas.filter(n => n.alumnoId === alumnoId && n.nota !== null);
    if (notasAlumno.length === 0) return null;
    
    const suma = notasAlumno.reduce((total, nota) => total + (nota.nota || 0), 0);
    return Math.round(suma / notasAlumno.length);
  };

  // Estadísticas por materia: promedio (ignora valores nulos y <= 0) y cantidad de aplazos (<51)
  const materiaStats = useMemo(() => {
    const stats: Record<number, { promedio: number; aplazos: number; disponibles: number }> = {};
    todasLasMateriasDelCurso.forEach((m) => {
      const notasMateria = notas
        .filter((n) => n.materiaId === m.id && n.nota !== null && (n.nota as number) > 0)
        .map((n) => n.nota as number);

      const aplazos = notas
        .filter((n) => n.materiaId === m.id && n.nota !== null && (n.nota as number) < 51)
        .length;

      const promedio = notasMateria.length > 0 ? Math.round(notasMateria.reduce((a, b) => a + b, 0) / notasMateria.length) : 0;

      stats[m.id] = { promedio, aplazos, disponibles: notasMateria.length };
    });
    return stats;
  }, [notas, todasLasMateriasDelCurso]);

  // Función para obtener el color de la nota
  const getGradeColor = (nota: number | null) => {
    if (nota === null) return 'gray';
    if (nota < 51) return 'red';
    if (nota < 81) return 'yellow';
    return 'emerald';
  };

  // Mapear color lógico a clases Tailwind estáticas (no usar plantillas dinámicas)
  const getGradeClasses = (nota: number | null) => {
    const color = getGradeColor(nota);
    switch (color) {
      case 'red':
        return 'bg-red-100 text-red-800';
      case 'yellow':
        return 'bg-yellow-100 text-yellow-800';
      case 'emerald':
        return 'bg-emerald-100 text-emerald-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleSave = () => {
    // Aquí iría la lógica para guardar en la base de datos
    console.log('Guardando notas:', notas);
    setIsEditing(false);
    // Mostrar mensaje de éxito
    try {
      if (selectedCurso) {
        const storageKey = `gradebook:calificaciones:${selectedCurso}:${trimestre}`;
        localStorage.setItem(storageKey, JSON.stringify(notas));
        toast({ title: 'Notas guardadas', description: 'Las notas se guardaron localmente.' });
      }
    } catch (e) {
      toast({ title: 'Error al guardar', description: 'No fue posible guardar localmente.' });
    }
  };

  // Obtener nombre del curso para mostrar
  const getCursoDisplayName = (curso: string) => {
    const [grado, grupo] = curso.split('-');
    return `${grado}° ${grupo} - Primaria`;
  };

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Award className="h-7 w-7 text-academic-blue-500" />
            Centralizador de Notas - Docente
          </h1>
          <p className="text-muted-foreground">
            Sistema de registro de notas finales - {trimestre}° Trimestre
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Exportar Excel
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Importar
          </Button>
          {isEditing ? (
            <Button onClick={handleSave} className="flex items-center gap-2 bg-green-600 hover:bg-green-700">
              <Save className="h-4 w-4" />
              Guardar Cambios
            </Button>
          ) : (
            <Button 
              onClick={() => setIsEditing(true)} 
              disabled={!selectedCurso}
              className="flex items-center gap-2"
            >
              <School className="h-4 w-4" />
              Editar Notas
            </Button>
          )}
        </div>
      </div>

      {/* Selectores */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <Label htmlFor="trimestre" className="text-sm font-medium mb-2 block">
              <Filter className="h-4 w-4 inline mr-2" />
              Trimestre
            </Label>
            <Select value={trimestre} onValueChange={setTrimestre}>
              <SelectTrigger id="trimestre">
                <SelectValue placeholder="Seleccionar trimestre" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1° Trimestre</SelectItem>
                <SelectItem value="2">2° Trimestre</SelectItem>
                <SelectItem value="3">3° Trimestre</SelectItem>
                <SelectItem value="4">4° Trimestre</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <Label htmlFor="curso" className="text-sm font-medium mb-2 block">
              <Bookmark className="h-4 w-4 inline mr-2" />
              Curso Asignado
            </Label>
            <Select value={selectedCurso} onValueChange={setSelectedCurso}>
              <SelectTrigger id="curso">
                <SelectValue placeholder="Seleccionar curso" />
              </SelectTrigger>
              <SelectContent>
                {cursosDisponibles.map((curso) => (
                  <SelectItem key={curso.curso} value={curso.curso}>
                    {getCursoDisplayName(curso.curso)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedCurso && (
              <p className="text-xs text-muted-foreground mt-2">
                Materias que enseña: {materiasDelDocente.map(m => m.codigo).join(', ')}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center justify-center h-full">
            <div className="text-center">
              <Calculator className="h-8 w-8 text-academic-blue-500 mx-auto mb-2" />
              <p className="text-sm font-medium">Gestión 2025</p>
              <p className="text-xs text-muted-foreground">UEP Técnico Humanístico Ebenezer</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de Notas */}
      {selectedCurso ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-academic-blue-500" />
              CURSO: {getCursoDisplayName(selectedCurso).toUpperCase()} - {trimestre}° TRIMESTRE
            </CardTitle>
            <CardDescription>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <span className="text-green-600 font-medium">
                  Materias de su responsabilidad: {materiasDelDocente.map(m => m.codigo).join(', ')}
                </span>
                <div className="text-sm text-muted-foreground flex flex-wrap gap-3 mt-2 sm:mt-0">
                  {materiasDelDocente.map((m) => (
                    <span key={m.id} className="inline-flex items-center gap-2 px-2 py-1 bg-gray-50 rounded">
                      <strong className="text-foreground">{m.codigo}</strong>
                      <span>Prom: {materiaStats[m.id]?.promedio ?? 0}</span>
                      <span>Apl: {materiaStats[m.id]?.aplazos ?? 0}</span>
                    </span>
                  ))}
                </div>
              </div>
            </CardDescription>
          </CardHeader>
          <CardContent>
              <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse border">
                <thead>
                  <tr className="bg-muted/50 sticky top-0 z-10">
                    <th className="border p-2 text-center font-bold w-12">Nro</th>
                    <th className="border p-2 text-left font-bold min-w-48">APELLIDOS Y NOMBRES</th>
                    {todasLasMateriasDelCurso.map(materia => (
                      <th 
                        key={materia.id} 
                        className={`border p-2 text-center font-bold w-20 ${
                          puedeEditarMateria(materia.id) ? 'bg-green-50 border-green-200' : 'bg-gray-50'
                        }`}
                        title={materia.nombre}
                      >
                        <div className="flex flex-col items-center">
                          <span>{materia.codigo}</span>
                          {puedeEditarMateria(materia.id) && (
                            <BookOpen className="h-3 w-3 text-green-600 mt-1" />
                          )}
                        </div>
                      </th>
                    ))}
                    <th className="border p-2 text-center font-bold w-24 bg-academic-blue-100">
                      PROMEDIO
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {alumnosDelCurso.map((alumno, index) => (
                    <tr key={alumno.id} className="hover:bg-muted/30 transition-colors">
                      <td className="border p-2 text-center font-medium">
                        {index + 1}
                      </td>
                      <td className="border p-2 font-medium">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          {alumno.apellido} {alumno.nombre}
                        </div>
                      </td>
                      {todasLasMateriasDelCurso.map(materia => {
                        const puedeEditar = puedeEditarMateria(materia.id);
                        return (
                          <td key={materia.id} className="border p-1 text-center">
                            {isEditing && puedeEditar ? (
                              <Input
                                type="number"
                                min="0"
                                max="100"
                                value={getNota(alumno.id, materia.id) || ''}
                                onChange={(e) => updateNota(
                                  alumno.id, 
                                  materia.id, 
                                  e.target.value ? parseInt(e.target.value) : null
                                )}
                                className="w-16 h-8 text-center mx-auto border-green-300 focus:border-green-500"
                                placeholder="--"
                              />
                            ) : (
                                <Badge 
                                  variant={getNota(alumno.id, materia.id) === null ? "outline" : "default"}
                                  className={`${getNota(alumno.id, materia.id) !== null ? getGradeClasses(getNota(alumno.id, materia.id)) : ''} font-semibold ${
                                    puedeEditar ? 'border-green-300' : ''
                                  }`}
                                >
                                  {getNota(alumno.id, materia.id) !== null ? getNota(alumno.id, materia.id) : '--'}
                                </Badge>
                            )}
                          </td>
                        );
                      })}
                      <td className="border p-2 text-center font-bold">
                        <Badge 
                          variant={getPromedioAlumno(alumno.id) === null ? "outline" : "default"}
                            className={`${getPromedioAlumno(alumno.id) !== null ? getGradeClasses(getPromedioAlumno(alumno.id)) : ''} text-lg`}
                        >
                          {getPromedioAlumno(alumno.id) !== null ? getPromedioAlumno(alumno.id) : '--'}
                        </Badge>
                      </td>
                    </tr>
                  ))}

                    {/* Fila de PROMEDIOS POR ASIGNATURA */}
                    <tr className="bg-gray-50">
                      <td className="border p-2" />
                      <td className="border p-2 font-semibold">PROMEDIOS POR ASIGNATURA</td>
                      {todasLasMateriasDelCurso.map((m) => (
                        <td key={`prom-${m.id}`} className="border p-2 text-center font-bold">
                          <span className={`${getGradeClasses(materiaStats[m.id]?.promedio ?? null)} px-2 py-1 rounded`}>{materiaStats[m.id]?.promedio ?? 0}</span>
                        </td>
                      ))}
                      <td className="border p-2" />
                    </tr>

                    {/* Fila de APLAZOS POR ASIGNATURA */}
                    <tr className="bg-gray-50">
                      <td className="border p-2" />
                      <td className="border p-2 font-semibold">APLAZOS POR ASIGNATURA</td>
                      {todasLasMateriasDelCurso.map((m) => (
                        <td key={`apl-${m.id}`} className="border p-2 text-center font-bold text-red-700">
                          {materiaStats[m.id]?.aplazos ?? 0}
                        </td>
                      ))}
                      <td className="border p-2" />
                    </tr>
                </tbody>
              </table>
            </div>

            {/* Leyenda */}
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-green-600" />
                  <span>Materias de su responsabilidad</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-100 border border-gray-300 rounded"></div>
                  <span>Otras materias (solo lectura)</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="text-center py-12">
          <CardContent>
            <Filter className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">Selecciona un curso</h3>
            <p className="text-muted-foreground">
              Elige uno de tus cursos asignados para ver y gestionar las calificaciones
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}