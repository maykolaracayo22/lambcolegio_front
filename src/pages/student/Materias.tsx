// src/pages/student/Materias.tsx
import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  ChevronLeft,
  ChevronRight,
  FileText,
  CheckCircle,
  Star,
  TrendingUp,
  Download,
  Pencil,
  Save,
  X,
  Award,
  BookOpen,
  Calculator,
  User,
} from 'lucide-react';

// ------------------------------
// Helpers de datos por NIVEL
// ------------------------------
const buildCoursesByLevel = (nivel, grado, grupo) => {
  // Materias reales según el centralizador del docente
  if (nivel === 'Inicial') {
    return [
      { id: 101, title: 'Comunicación', teacher: 'Ms. Ana', info: 'Inicial 5 años', place: 'Aula I-1', term: 'T1' },
      { id: 102, title: 'Psicomotricidad', teacher: 'Ms. Carla', info: 'Inicial 5 años', place: 'Patio', term: 'T1' },
      { id: 103, title: 'Arte y Juego', teacher: 'Ms. Sofía', info: 'Inicial 5 años', place: 'Aula I-2', term: 'T1' },
    ];
  }
  if (nivel === 'Primaria') {
    // 1°B Primaria - Materias del estudiante ARIA MICHELLE
    if (grado === '1' && grupo === 'B') {
      return [
        { id: 1001, title: 'Religión', teacher: 'Prof. ANGULO MONTALVO DANIELA', info: '1° B Primaria', place: 'Aula 1-B', term: 'T1', codigo: 'RELI' },
        { id: 1002, title: 'Matemáticas', teacher: 'Prof. ANGULO MONTALVO DANIELA', info: '1° B Primaria', place: 'Aula 1-B', term: 'T1', codigo: 'MATE' },
        { id: 1003, title: 'Lenguaje y Comunicación', teacher: 'Prof. ANGULO MONTALVO DANIELA', info: '1° B Primaria', place: 'Aula 1-B', term: 'T1', codigo: 'LC1' },
        { id: 1004, title: 'Ciencias Naturales', teacher: 'Prof. Martínez', info: '1° B Primaria', place: 'Laboratorio', term: 'T1', codigo: 'CNT' },
        { id: 1005, title: 'Ciencias Sociales', teacher: 'Prof. Torres', info: '1° B Primaria', place: 'Aula 1-B', term: 'T1', codigo: 'CSO' },
        { id: 1006, title: 'Educación Física', teacher: 'Prof. Vega', info: '1° B Primaria', place: 'Cancha', term: 'T1', codigo: 'EFI' },
        { id: 1007, title: 'Artes Plásticas', teacher: 'Prof. Díaz', info: '1° B Primaria', place: 'Sala de Arte', term: 'T1', codigo: 'APV' },
        { id: 1008, title: 'Música', teacher: 'Prof. León', info: '1° B Primaria', place: 'Sala de Música', term: 'T1', codigo: 'EMU' },
      ];
    }
    // 2°B Primaria
    if (grado === '2' && grupo === 'B') {
      return [
        { id: 1, title: 'Lenguaje y Comunicación 1', teacher: 'Prof. García', info: '2° B Primaria', place: 'Aula 2-B', term: 'T1', codigo: 'LC1' },
        { id: 2, title: 'Inglés', teacher: 'Miss Smith', info: '2° B Primaria', place: 'Aula de Idiomas', term: 'T1', codigo: 'ING' },
        { id: 3, title: 'Lectoescritura 1', teacher: 'Prof. García', info: '2° B Primaria', place: 'Aula 2-B', term: 'T1', codigo: 'LE-1' },
        { id: 4, title: 'Ciencias Sociales', teacher: 'Prof. Torres', info: '2° B Primaria', place: 'Aula 2-B', term: 'T1', codigo: 'CSO' },
        { id: 5, title: 'Educación Física', teacher: 'Prof. Vega', info: '2° B Primaria', place: 'Cancha', term: 'T1', codigo: 'EFI' },
        { id: 6, title: 'Expresión Musical', teacher: 'Prof. León', info: '2° B Primaria', place: 'Sala de Música', term: 'T1', codigo: 'EMU' },
        { id: 7, title: 'Artes Plásticas Visuales', teacher: 'Prof. Díaz', info: '2° B Primaria', place: 'Sala de Arte', term: 'T1', codigo: 'APV' },
        { id: 8, title: 'Matemáticas', teacher: 'Prof. López', info: '2° B Primaria', place: 'Aula 2-B', term: 'T1', codigo: 'MATE' },
        { id: 9, title: 'Tecnología y Técnica', teacher: 'Prof. Ramírez', info: '2° B Primaria', place: 'Taller', term: 'T1', codigo: 'TTE' },
        { id: 10, title: 'Computación', teacher: 'Prof. Sánchez', info: '2° B Primaria', place: 'Lab. Computo', term: 'T1', codigo: 'COMP' },
        { id: 11, title: 'Técnica Especialidad', teacher: 'Prof. Ramírez', info: '2° B Primaria', place: 'Taller', term: 'T1', codigo: 'TE-C' },
        { id: 12, title: 'Ciencias Naturales', teacher: 'Prof. Martínez', info: '2° B Primaria', place: 'Laboratorio', term: 'T1', codigo: 'CNT' },
        { id: 13, title: 'Religión', teacher: 'Prof. Morales', info: '2° B Primaria', place: 'Aula 2-B', term: 'T1', codigo: 'RELI' },
      ];
    }
    // 4°A Primaria
    if (grado === '4' && grupo === 'A') {
      return [
        { id: 14, title: 'Lenguaje y Comunicación', teacher: 'Prof. García', info: '4° A Primaria', place: 'Aula 4-A', term: 'T1', codigo: 'LC1' },
        { id: 15, title: 'Inglés', teacher: 'Miss Brown', info: '4° A Primaria', place: 'Aula de Idiomas', term: 'T1', codigo: 'ING' },
        { id: 16, title: 'Matemáticas', teacher: 'Prof. López', info: '4° A Primaria', place: 'Aula 4-A', term: 'T1', codigo: 'MATE' },
        { id: 17, title: 'Ciencias Sociales', teacher: 'Prof. Torres', info: '4° A Primaria', place: 'Aula 4-A', term: 'T1', codigo: 'CSO' },
        { id: 18, title: 'Ciencias Naturales', teacher: 'Prof. Martínez', info: '4° A Primaria', place: 'Laboratorio', term: 'T1', codigo: 'CNT' },
        { id: 19, title: 'Educación Física', teacher: 'Prof. Vega', info: '4° A Primaria', place: 'Cancha', term: 'T1', codigo: 'EFI' },
        { id: 20, title: 'Computación', teacher: 'Prof. Sánchez', info: '4° A Primaria', place: 'Lab. Computo', term: 'T1', codigo: 'COMP' },
        { id: 21, title: 'Tecnología y Técnica', teacher: 'Prof. Ramírez', info: '4° A Primaria', place: 'Taller', term: 'T1', codigo: 'TTE' },
        { id: 22, title: 'Artes Plásticas', teacher: 'Prof. Díaz', info: '4° A Primaria', place: 'Sala de Arte', term: 'T1', codigo: 'APV' },
        { id: 23, title: 'Música', teacher: 'Prof. León', info: '4° A Primaria', place: 'Sala de Música', term: 'T1', codigo: 'EMU' },
        { id: 24, title: 'Religión', teacher: 'Prof. Morales', info: '4° A Primaria', place: 'Aula 4-A', term: 'T1', codigo: 'RELI' },
      ];
    }
    // Por defecto para primaria
    return [
      { id: 201, title: 'Comunicación', teacher: 'Prof. García', info: '3° Primaria', place: 'Aula P-3A', term: 'T1' },
      { id: 202, title: 'Matemática', teacher: 'Prof. López', info: '3° Primaria', place: 'Aula P-3A', term: 'T1' },
    ];
  }
  // Secundaria
  return [
    { id: 301, title: 'Comunicación', teacher: 'Prof. Rojas', info: '1° Secundaria', place: 'Aula S-1A', term: 'T1' },
    { id: 302, title: 'Matemática', teacher: 'Prof. Castro', info: '1° Secundaria', place: 'Aula S-1A', term: 'T1' },
    { id: 303, title: 'Ciencia y Tecnología', teacher: 'Prof. Medina', info: '1° Secundaria', place: 'Laboratorio', term: 'T1' },
    { id: 304, title: 'Historia, Geografía y Economía', teacher: 'Prof. Quispe', info: '1° Secundaria', place: 'Aula S-1A', term: 'T1' },
    { id: 305, title: 'Inglés', teacher: 'Miss Brown', info: '1° Secundaria', place: 'Aula de Idiomas', term: 'T1' },
    { id: 306, title: 'Educación Física', teacher: 'Prof. Manco', info: '1° Secundaria', place: 'Cancha', term: 'T1' },
    { id: 307, title: 'Arte y Cultura', teacher: 'Prof. León', info: '1° Secundaria', place: 'Sala de Arte', term: 'T1' },
  ];
};

// Datos “mock” para Nota 0 por curso
const nota0DataSeed = {
  default: [
    { id: 'EV-01', nombre: 'Diagnóstico', tipo: 'Práctica', peso: 10, nota: 15 },
    { id: 'EV-02', nombre: 'Trabajo 1',   tipo: 'Tarea',    peso: 20, nota: 17 },
    { id: 'EV-03', nombre: 'Quiz 1',      tipo: 'Prueba',   peso: 20, nota: 14 },
    { id: 'EV-04', nombre: 'Parcial',     tipo: 'Examen',   peso: 50, nota: 13 },
  ],
};
// Datos del estudiante actual (esto vendría del contexto de autenticación)
const estudianteActual = {
  id: 101,
  nombre: 'ARIA MICHELLE',
  apellido: 'ABASTO LIMACHI',
  grado: '1',
  grupo: 'B',
  curso: '1-B',
};

// Función para obtener las materias según el curso del estudiante
const getMateriasDelCurso = (grado: string, grupo: string) => {
  // 1°B Primaria
  if (grado === '1' && grupo === 'B') {
    return [
      { id: 1001, nombre: 'Religión', codigo: 'RELI' },
      { id: 1002, nombre: 'Matemáticas', codigo: 'MATE' },
      { id: 1003, nombre: 'Lenguaje y Comunicación', codigo: 'LC1' },
      { id: 1004, nombre: 'Ciencias Naturales', codigo: 'CNT' },
      { id: 1005, nombre: 'Ciencias Sociales', codigo: 'CSO' },
      { id: 1006, nombre: 'Educación Física', codigo: 'EFI' },
      { id: 1007, nombre: 'Artes Plásticas', codigo: 'APV' },
      { id: 1008, nombre: 'Música', codigo: 'EMU' },
    ];
  }
  // 2°B Primaria
  if (grado === '2' && grupo === 'B') {
    return [
      { id: 1, nombre: 'Lenguaje y Comunicación 1', codigo: 'LC1' },
      { id: 2, nombre: 'Inglés', codigo: 'ING' },
      { id: 3, nombre: 'Lectoescritura 1', codigo: 'LE-1' },
      { id: 4, nombre: 'Ciencias Sociales', codigo: 'CSO' },
      { id: 5, nombre: 'Educación Física', codigo: 'EFI' },
      { id: 6, nombre: 'Expresión Musical', codigo: 'EMU' },
      { id: 7, nombre: 'Artes Plásticas Visuales', codigo: 'APV' },
      { id: 8, nombre: 'Matemáticas', codigo: 'MATE' },
      { id: 9, nombre: 'Tecnología y Técnica', codigo: 'TTE' },
      { id: 10, nombre: 'Computación', codigo: 'COMP' },
      { id: 11, nombre: 'Técnica Especialidad', codigo: 'TE-C' },
      { id: 12, nombre: 'Ciencias Naturales', codigo: 'CNT' },
      { id: 13, nombre: 'Religión', codigo: 'RELI' },
    ];
  }
  // 4°A Primaria
  if (grado === '4' && grupo === 'A') {
    return [
      { id: 14, nombre: 'Lenguaje y Comunicación', codigo: 'LC1' },
      { id: 15, nombre: 'Inglés', codigo: 'ING' },
      { id: 16, nombre: 'Matemáticas', codigo: 'MATE' },
      { id: 17, nombre: 'Ciencias Sociales', codigo: 'CSO' },
      { id: 18, nombre: 'Ciencias Naturales', codigo: 'CNT' },
      { id: 19, nombre: 'Educación Física', codigo: 'EFI' },
      { id: 20, nombre: 'Computación', codigo: 'COMP' },
      { id: 21, nombre: 'Tecnología y Técnica', codigo: 'TTE' },
      { id: 22, nombre: 'Artes Plásticas', codigo: 'APV' },
      { id: 23, nombre: 'Música', codigo: 'EMU' },
      { id: 24, nombre: 'Religión', codigo: 'RELI' },
    ];
  }
  // Default
  return [
    { id: 1001, nombre: 'Religión', codigo: 'RELI' },
    { id: 1002, nombre: 'Matemáticas', codigo: 'MATE' },
    { id: 1003, nombre: 'Lenguaje y Comunicación', codigo: 'LC1' },
  ];
};

// Materias del curso del estudiante (inicialización)
const materiasDelCurso = getMateriasDelCurso(estudianteActual.grado, estudianteActual.grupo);

// Interface para CalificacionFinal
interface CalificacionFinal {
  alumnoId: number;
  alumnoNombre: string;
  materiaId: number;
  materiaNombre: string;
  trimestre: number;
  promedioSer: number;
  promedioSaber: number;
  promedioHacer: number;
  promedioDecidir: number;
  autoevaluacion: number;
  tspe: number;
  pruebaEscrita: number;
  notaTrimestre: number;
  promedioAnual: number | null;
  estado: 'APROBADO' | 'REPROBADO' | 'EN_PROCESO';
  fechaActualizacion: string;
}
export default function NotasAcademicas() {
  const navigate = useNavigate();

  // -----------------------
  // Selectores globales (Nivel / Año / Trimestre)
  // -----------------------
  const niveles = useMemo(() => ['Inicial', 'Primaria', 'Secundaria'], []);
  const trimestres = useMemo(() => ['T1', 'T2', 'T3'], []);
  const years = useMemo(() => ['2025', '2024'], []);

  const [nivel, setNivel] = useState('Primaria');
  const [year, setYear] = useState('2025');
  const [globalTerm, setGlobalTerm] = useState('T1');

  // -----------------------
  // Cursos por nivel + edición de trimestre
  // -----------------------
  const [courses, setCourses] = useState(() =>
    buildCoursesByLevel(nivel, estudianteActual.grado, estudianteActual.grupo).map(c => ({ ...c, _edit: false, _draftTerm: c.term }))
  );

  // Si cambia el nivel o el año, reiniciamos la lista (puedes cambiar a caching si quieres)
  useEffect(() => {
    const next = buildCoursesByLevel(nivel, estudianteActual.grado, estudianteActual.grupo).map(c => ({ ...c, _edit: false, _draftTerm: c.term }));
    setCourses(next);
  }, [nivel, year]);

  const applyGlobalTerm = () => {
    setCourses(prev => prev.map(c => ({ ...c, term: globalTerm, _draftTerm: globalTerm })));
    alert(`Trimestre ${globalTerm} aplicado a todos los cursos de ${nivel} ${year}`);
  };

  const toggleEdit = (id, v) => {
    setCourses(prev => prev.map(c => (c.id === id ? { ...c, _edit: v, _draftTerm: c.term } : c)));
  };

  const updateDraftTerm = (id, term) => {
    setCourses(prev => prev.map(c => (c.id === id ? { ...c, _draftTerm: term } : c)));
  };

  const saveTerm = (id) => {
    setCourses(prev => prev.map(c => (c.id === id ? { ...c, term: c._draftTerm, _edit: false } : c)));
    const saved = courses.find(c => c.id === id);
    alert(`Curso "${saved?.title}" actualizado a ${saved?._draftTerm || 'T1'}`);
    // TODO: persistir en backend (fetch/axios/react-query) usando id, nivel, year, term
  };

  const cancelEdit = (id) => {
    setCourses(prev => prev.map(c => (c.id === id ? { ...c, _edit: false, _draftTerm: c.term } : c)));
  };

  // -----------------------
  // Nota 0 (modal) - Centralizador del Alumno
  // -----------------------
  const [nota0Open, setNota0Open] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [docenteNota, setDocenteNota] = useState(null);
  const [calificacionesCentralizador, setCalificacionesCentralizador] = useState<CalificacionFinal[]>([]);

  // Funciones de cálculo (copiadas de RegistroValoracion)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const calcularPromedioCategoria = (notasAlumno: any, categoria: string): number => {
    if (!notasAlumno || !notasAlumno[categoria]) return 0;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const valores = Object.values(notasAlumno[categoria]).filter((v: any) => v !== null) as number[];
    if (valores.length === 0) return 0;
    const suma = valores.reduce((acc: number, val: number) => acc + val, 0);
    return Math.round(suma / valores.length);
  };
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const calcularTsPE = (notasAlumno: any) => {
    const ser = calcularPromedioCategoria(notasAlumno, 'ser');
    const saber = calcularPromedioCategoria(notasAlumno, 'saber');
    const hacer = calcularPromedioCategoria(notasAlumno, 'hacer');
    const decidir = calcularPromedioCategoria(notasAlumno, 'decidir');
    const auto = notasAlumno?.autoevaluacion || 0;
    return ser + saber + hacer + decidir + auto;
  };
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const calcularSegundoTrimestre = (notasAlumno: any) => {
    const tspe = calcularTsPE(notasAlumno);
    const pe = 0; // Prueba escrita no implementada por defecto
    return tspe + pe;
  };

  // Función para obtener el color de la nota
  const getGradeColor = (nota: number | null) => {
    if (nota === null || nota === 0) return 'gray';
    if (nota < 51) return 'red';
    if (nota < 81) return 'yellow';
    return 'emerald';
  };

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

  // Cargar notas del centralizador (desde localStorage como lo hace el docente)
  const cargarCalificacionesCentralizador = React.useCallback(() => {
    const calificaciones: CalificacionFinal[] = [];
    const trimestreNum = parseInt(globalTerm.replace('T', ''));
    
    // Cargar desde gradebook:calificaciones (formato que usa el docente)
    const storageKey = `gradebook:calificaciones:${estudianteActual.curso}:${trimestreNum}`;
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        // Filtrar solo las calificaciones del estudiante actual
        if (Array.isArray(parsed)) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          parsed.forEach((item: any) => {
            if (item.alumnoId === estudianteActual.id) {
              calificaciones.push(item);
            }
          });
        }
      }
    } catch (e) {
      console.error('Error al cargar calificaciones:', e);
    }

    // También buscar en formato NotaFinal simple
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].nota !== undefined) {
          // Es formato NotaFinal
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          parsed.forEach((item: any) => {
            if (item.alumnoId === estudianteActual.id) {
              const materia = materiasDelCurso.find(m => m.id === item.materiaId);
              calificaciones.push({
                alumnoId: item.alumnoId,
                alumnoNombre: `${estudianteActual.nombre} ${estudianteActual.apellido}`,
                materiaId: item.materiaId,
                materiaNombre: materia?.nombre || 'Materia',
                trimestre: trimestreNum,
                promedioSer: 0,
                promedioSaber: 0,
                promedioHacer: 0,
                promedioDecidir: 0,
                autoevaluacion: 0,
                tspe: 0,
                pruebaEscrita: 0,
                notaTrimestre: item.nota || 0,
                promedioAnual: null,
                estado: (item.nota || 0) >= 51 ? 'APROBADO' : 'REPROBADO',
                fechaActualizacion: new Date().toISOString(),
              });
            }
          });
        }
      }
    } catch (e) {
      console.error('Error:', e);
    }

    setCalificacionesCentralizador(calificaciones);
  }, [globalTerm]);
  
  // Cargar nota del docente (de localStorage) cuando se abre el modal
  useEffect(() => {
    if (nota0Open && selectedCourse) {
      const key = `registro-valoracion:${selectedCourse.id}:${selectedCourse.term?.replace(/^T/, '')}`;
      try {
        const raw = localStorage.getItem(key);
        if (raw) {
          const parsed = JSON.parse(raw);
          // Buscar la nota del estudiante actual
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const notaEstudiante = parsed?.find((n: any) => n.alumnoId === estudianteActual.id);
          setDocenteNota(notaEstudiante || null);
        } else {
          setDocenteNota(null);
        }
      } catch (e) {
        setDocenteNota(null);
        console.error('Error al cargar registro docente:', e);
      }
    }
  }, [nota0Open, selectedCourse]);

  // Cargar centralizador cuando cambia el trimestre
  useEffect(() => {
    cargarCalificacionesCentralizador();
  }, [globalTerm, cargarCalificacionesCentralizador]);

  // Obtener nota de una materia específica del centralizador
  const getNotaMateria = (materiaId: number): number | null => {
    const cal = calificacionesCentralizador.find(c => c.materiaId === materiaId);
    return cal?.notaTrimestre || null;
  };

  // Calcular promedio general del alumno
  const getPromedioGeneral = (): number | null => {
    const notasValidas = calificacionesCentralizador.filter(c => c.notaTrimestre > 0);
    if (notasValidas.length === 0) return null;
    const suma = notasValidas.reduce((acc, c) => acc + c.notaTrimestre, 0);
    return Math.round(suma / notasValidas.length);
  };

  const nota0DataByCourseId = useMemo(() => {
    // Puedes diferenciar por nivel/curso si quieres variación
    const out = {};
    for (const c of courses) out[c.id] = nota0DataSeed.default;
    return out;
  }, [courses]);

  const exportCSV = () => {
    // Si no hay curso seleccionado, exportar centralizador
    if (!selectedCourse) {
      const header = ['Nro', 'Materia', 'Código', 'Nota', 'Estado'];
      const csvRows = [
        header.join(','),
        ...materiasDelCurso.map((m, i) => {
          const nota = getNotaMateria(m.id);
          const estado = nota !== null && nota >= 51 ? 'APROBADO' : nota !== null ? 'REPROBADO' : 'SIN NOTA';
          return [i + 1, m.nombre, m.codigo, nota || 0, estado].join(',');
        }),
      ];
      const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `centralizador_${estudianteActual.id}_${year}_${globalTerm}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      return;
    }
    const rows = nota0DataByCourseId[selectedCourse.id] || [];
    const header = ['ID', 'Evaluación', 'Tipo', 'Peso (%)', 'Nota'];
    const csvRows = [
      header.join(','),
      ...rows.map(r => [r.id, r.nombre, r.tipo, r.peso, r.nota].join(',')),
    ];
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nota0_${selectedCourse.id}_${year}_${selectedCourse.term}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportXLSX = () => {
    // Si no hay curso seleccionado, exportar centralizador
    if (!selectedCourse) {
      const header = ['Nro', 'Materia', 'Código', 'Nota', 'Estado'];
      const csvRows = [
        header.join(','),
        ...materiasDelCurso.map((m, i) => {
          const nota = getNotaMateria(m.id);
          const estado = nota !== null && nota >= 51 ? 'APROBADO' : nota !== null ? 'REPROBADO' : 'SIN NOTA';
          return [i + 1, m.nombre, m.codigo, nota || 0, estado].join(',');
        }),
      ];
      const blob = new Blob([csvRows.join('\n')], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `centralizador_${estudianteActual.id}_${year}_${globalTerm}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
      return;
    }
    const rows = nota0DataByCourseId[selectedCourse.id] || [];
    const header = ['ID', 'Evaluación', 'Tipo', 'Peso (%)', 'Nota'];
    const csvRows = [
      header.join(','),
      ...rows.map(r => [r.id, r.nombre, r.tipo, r.peso, r.nota].join(',')),
    ];
    const blob = new Blob([csvRows.join('\n')], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nota0_${selectedCourse.id}_${year}_${selectedCourse.term}.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const descargarBoletin = () => {
    alert(`Descargando boletín PDF de ${estudianteActual.nombre} ${estudianteActual.apellido} — ${nivel} ${year} ${globalTerm}`);
  };

  // -----------------------
  // Acciones por curso
  // -----------------------
  const handleNota0 = (course) => {
    setSelectedCourse(course);
    setNota0Open(true);
  };

  // Abrir centralizador general (sin curso específico)
  const handleVerCentralizador = () => {
    setSelectedCourse(null);
    setNota0Open(true);
  };
  const handleConducta = (course) => {
    navigate('/dashboard/parent/conducta', { state: { courseId: course.id, courseTitle: course.title } });
  };
  const handleProgreso = (course) => {
    navigate('/dashboard/parent/progreso', { state: { courseId: course.id, courseTitle: course.title } });
  };
  const handleAsistencia = (course) => {
    navigate('/dashboard/parent/asistencia', { state: { courseId: course.id, courseTitle: course.title } });
  };

  


  // -----------------------
  // Calendario "dummy"
  // -----------------------
  const schedule = [
    { day: 'lunes', hour: 1, duration: 2, color: 'bg-emerald-400', label: 'Com' },
    { day: 'martes', hour: 2, duration: 2, color: 'bg-sky-400', label: 'Mat' },
    { day: 'miércoles', hour: 4, duration: 2, color: 'bg-amber-400', label: 'CyT' },
    { day: 'jueves', hour: 3, duration: 2, color: 'bg-pink-400', label: 'Ing' },
    { day: 'viernes', hour: 1, duration: 2, color: 'bg-violet-400', label: 'Arte' },
  ];
  const hours = [...Array(12)].map((_, i) => `${7 + i}:00`);
  const days = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

  return (
    <div className="space-y-6 p-4">

      {/* Barra superior: Nivel, Año, Trimestre global y Regresar */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center p-4 bg-white rounded-lg shadow-sm gap-4">
        <h1 className="text-xl font-bold">Mis Cursos</h1>

        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-2 w-full lg:w-auto">
          {/* Nivel */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Nivel:</span>
            <Select value={nivel} onValueChange={setNivel}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Nivel" />
              </SelectTrigger>
              <SelectContent>
                {niveles.map(n => <SelectItem key={n} value={n}>{n}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* Año */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Año:</span>
            <Select value={year} onValueChange={setYear}>
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="Año" />
              </SelectTrigger>
              <SelectContent>
                {years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* Trimestre global */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Trimestre:</span>
            <Select value={globalTerm} onValueChange={setGlobalTerm}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Trimestre" />
              </SelectTrigger>
              <SelectContent>
                {trimestres.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button variant="secondary" size="sm" onClick={applyGlobalTerm}>
              Aplicar a todos
            </Button>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <Button
              variant="outline"
              className="flex items-center"
              onClick={() => window.history.length > 1 ? navigate(-1) : navigate('/dashboard/parent')}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              REGRESAR
            </Button>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="flex flex-col lg:flex-row gap-6">

        {/* Lista de cursos */}
        <div className="lg:w-2/5 space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">
                {nivel} — {year}
              </CardTitle>
              {/* Botón para ver centralizador general */}
              <Button 
                onClick={handleVerCentralizador}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
              >
                <Award className="h-4 w-4" />
                Ver Mis Notas
              </Button>
            </CardHeader>
          </Card>

          {courses.map((course) => (
            <Card key={course.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="space-y-2">
                {/* Título + trimestre visible */}
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-bold">
                    {course.title}
                  </CardTitle>

                  {/* Ver/Editar trimestre por curso */}
                  {!course._edit ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Trimestre:</span>
                      <span className="text-xs font-semibold">{course.term}</span>
                      <Button variant="ghost" size="sm" onClick={() => toggleEdit(course.id, true)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Select value={course._draftTerm} onValueChange={(v) => updateDraftTerm(course.id, v)}>
                        <SelectTrigger className="w-[110px] h-8">
                          <SelectValue placeholder="Trim." />
                        </SelectTrigger>
                        <SelectContent>
                          {trimestres.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <Button size="sm" onClick={() => saveTerm(course.id)}>
                        <Save className="h-4 w-4 mr-1" /> Guardar
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => cancelEdit(course.id)}>
                        <X className="h-4 w-4 mr-1" /> Cancelar
                      </Button>
                    </div>
                  )}
                </div>

                {/* Acciones por curso */}
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center justify-start text-muted-foreground hover:text-foreground hover:bg-muted"
                    onClick={() => handleNota0(course)}
                  >
                    <Award className="h-4 w-4" />
                    <span className="ml-1">Ver Nota</span>
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center justify-start text-muted-foreground hover:text-foreground hover:bg-muted"
                    onClick={() => handleConducta(course)}
                  >
                    <Star className="h-4 w-4" />
                    <span className="ml-1">Conducta</span>
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center justify-start text-muted-foreground hover:text-foreground hover:bg-muted"
                    onClick={() => handleProgreso(course)}
                  >
                    <TrendingUp className="h-4 w-4" />
                    <span className="ml-1">Progreso</span>
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center justify-start text-muted-foreground hover:text-foreground hover:bg-muted"
                    onClick={() => handleAsistencia(course)}
                  >
                    <CheckCircle className="h-4 w-4" />
                    <span className="ml-1">Asistencia</span>
                  </Button>
                </div>
              </CardHeader>

              <CardContent>
                <div className="text-sm text-muted-foreground mb-2 space-y-1">
                  <p className="font-medium text-foreground">Docente: {course.teacher}</p>
                  <p>{course.info}</p>
                  <p className="text-xs">Ambiente: {course.place}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Calendario */}
        <div className="lg:w-3/5">
          <Card className="h-full">
              <CardHeader className="p-0">
                <div className="bg-primary text-primary-foreground p-4 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-2 rounded-t-lg">
                  <h3 className="text-lg font-bold">Horario de Clases</h3>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="ghost" size="sm" className="bg-white/20 hover:bg-white/30 text-white">
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="bg-white/20 hover:bg-white/30 text-white">Atrás</Button>
                    <Button variant="ghost" size="sm" className="bg-white/20 hover:bg-white/30 text-white">Hoy</Button>
                    <Button variant="ghost" size="sm" className="bg-white/20 hover:bg-white/30 text-white">Siguiente</Button>
                    <Button variant="ghost" size="sm" className="bg-white/20 hover:bg-white/30 text-white">
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-4 gap-2">
                  <h4 className="text-lg font-semibold">{nivel} — Semana ejemplo ({year} {globalTerm})</h4>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">Mes</Button>
                    <Button variant="default" size="sm">Semana</Button>
                    <Button variant="outline" size="sm">Día</Button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <div className="grid grid-cols-8 text-center text-sm min-w-[800px]">
                    <div className="text-center font-normal text-muted-foreground p-2 border-b"></div>
                    {days.map((day, index) => (
                      <div key={day} className={`p-2 border-b-2 font-bold ${day === 'viernes' ? 'text-primary' : 'text-foreground'}`}>
                        {day.charAt(0).toUpperCase() + day.slice(1, 3)}
                      </div>
                    ))}

                    {hours.map((hour, i) => (
                      <React.Fragment key={i}>
                        <div className="text-xs text-muted-foreground p-2 border-b text-right pr-3">
                          {hour}
                        </div>
                        {[...Array(7)].map((_, j) => (
                          <div key={j} className="h-12 border-b relative"></div>
                        ))}
                      </React.Fragment>
                    ))}
                  </div>

                  {/* Bloques de ejemplo */}
                  <div className="relative min-w-[800px]">
                    {schedule.map((block, index) => {
                      const dayIndex = days.indexOf(block.day);
                      const hourIndex = block.hour - 1; // arranque visual
                      if (dayIndex === -1 || hourIndex < 0) return null;

                      const top = hourIndex * 48;
                      const height = block.duration * 48;
                      const left = (dayIndex + 1) * (100/8);

                      return (
                        <div
                          key={index}
                          style={{ position: 'absolute', top: `${top}px`, left: `${left}%`, width: `${100/8}%`, height: `${height}px` }}
                          className={`${block.color} rounded-md text-white text-xs flex items-center justify-center m-1 p-1 border border-white/20`}
                        >
                          <div className="text-center">
                            <div className="font-bold">{block.label}</div>
                            <div className="text-[10px] opacity-90">Bloque</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
        </div>
      </div>

      {/* Modal Nota 0 - Centralizador del Alumno o Detalle por Materia */}
      <Dialog open={nota0Open} onOpenChange={setNota0Open}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Award className="h-6 w-6 text-blue-500" />
              {selectedCourse 
                ? `Detalle de Nota - ${selectedCourse.title}`
                : `Centralizador de Notas - ${estudianteActual.nombre} ${estudianteActual.apellido}`
              }
            </DialogTitle>
            <DialogDescription>
              {selectedCourse 
                ? `${selectedCourse.info} — Docente: ${selectedCourse.teacher} — ${globalTerm}`
                : `${nivel} — ${estudianteActual.grado}° ${estudianteActual.grupo} — Gestión ${year} — ${globalTerm}`
              }
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* === VISTA ESPECÍFICA DE UNA MATERIA === */}
            {selectedCourse ? (
              <>
                {/* Información de la materia */}
                <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="h-14 w-14 rounded-full bg-indigo-500 flex items-center justify-center">
                        <BookOpen className="h-7 w-7 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-xl text-indigo-800">{selectedCourse.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {selectedCourse.info} | {selectedCourse.place}
                        </p>
                        <p className="text-sm font-medium text-indigo-600">
                          Docente: {selectedCourse.teacher}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground mb-1">Nota del Trimestre</p>
                        <Badge className={`text-2xl px-4 py-2 ${getGradeClasses(getNotaMateria(selectedCourse.id))}`}>
                          {getNotaMateria(selectedCourse.id) !== null ? getNotaMateria(selectedCourse.id) : '--'}
                        </Badge>
                        <p className="text-xs mt-1">
                          {getNotaMateria(selectedCourse.id) !== null && getNotaMateria(selectedCourse.id)! >= 51 
                            ? <span className="text-green-600 font-medium">APROBADO</span>
                            : getNotaMateria(selectedCourse.id) !== null 
                              ? <span className="text-red-600 font-medium">REPROBADO</span>
                              : <span className="text-gray-500">SIN NOTA</span>
                          }
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Detalle de valoración por dimensiones (si existe) */}
                {docenteNota ? (
                  <Card className="border-blue-200">
                    <CardHeader>
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Star className="h-4 w-4 text-yellow-500" />
                        Valoración por Dimensiones - {selectedCourse.title}
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Calificación registrada por el docente según criterios SER/SABER/HACER/DECIDIR
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg text-center">
                          <p className="text-xs text-muted-foreground mb-1">SER (5 pts)</p>
                          <div className="text-2xl font-bold text-blue-600">{calcularPromedioCategoria(docenteNota, 'ser')}</div>
                          <Progress value={calcularPromedioCategoria(docenteNota, 'ser') * 20} className="mt-2 h-2" />
                        </div>
                        <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg text-center">
                          <p className="text-xs text-muted-foreground mb-1">SABER (45 pts)</p>
                          <div className="text-2xl font-bold text-green-600">{calcularPromedioCategoria(docenteNota, 'saber')}</div>
                          <Progress value={calcularPromedioCategoria(docenteNota, 'saber') * 2.22} className="mt-2 h-2" />
                        </div>
                        <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg text-center">
                          <p className="text-xs text-muted-foreground mb-1">HACER (40 pts)</p>
                          <div className="text-2xl font-bold text-orange-600">{calcularPromedioCategoria(docenteNota, 'hacer')}</div>
                          <Progress value={calcularPromedioCategoria(docenteNota, 'hacer') * 2.5} className="mt-2 h-2" />
                        </div>
                        <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg text-center">
                          <p className="text-xs text-muted-foreground mb-1">DECIDIR (5 pts)</p>
                          <div className="text-2xl font-bold text-purple-600">{calcularPromedioCategoria(docenteNota, 'decidir')}</div>
                          <Progress value={calcularPromedioCategoria(docenteNota, 'decidir') * 20} className="mt-2 h-2" />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
                        <div className="p-4 bg-gradient-to-br from-sky-50 to-sky-100 rounded-lg">
                          <p className="text-xs text-muted-foreground">TsPE (Total sin Prueba Escrita)</p>
                          <div className="text-3xl font-bold text-sky-600">{calcularTsPE(docenteNota)}</div>
                          <Progress value={calcularTsPE(docenteNota)} className="mt-2" />
                        </div>
                        <div className="p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg">
                          <p className="text-xs text-muted-foreground">Nota del Trimestre</p>
                          <div className="text-3xl font-bold text-emerald-600">{calcularSegundoTrimestre(docenteNota)}</div>
                          <Progress value={calcularSegundoTrimestre(docenteNota)} className="mt-2" />
                        </div>
                        <div className="p-4 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg">
                          <p className="text-xs text-muted-foreground">Autoevaluación</p>
                          <div className="text-3xl font-bold text-indigo-600">{docenteNota?.autoevaluacion || 0}</div>
                          <Progress value={(docenteNota?.autoevaluacion || 0) * 20} className="mt-2" />
                        </div>
                      </div>

                      {/* Promedio acumulado */}
                      <div className="mt-4 p-4 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg border border-amber-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-amber-800">Promedio Acumulado</p>
                            <p className="text-xs text-muted-foreground">1er Trimestre + 2do Trimestre</p>
                          </div>
                          <div className="text-right">
                            {(() => {
                              const t1 = docenteNota?.primerTrimestre || 0;
                              const t2 = calcularSegundoTrimestre(docenteNota);
                              const pa = Math.round(((t1 || 0) + (t2 || 0)) / ((t1 ? 1 : 0) + (t2 ? 1 : 0) || 1));
                              return (
                                <Badge className={`text-2xl px-4 py-2 ${getGradeClasses(pa)}`}>{pa}</Badge>
                              );
                            })()}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="border-gray-200">
                    <CardContent className="p-8 text-center">
                      <BookOpen className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                      <h3 className="text-lg font-medium text-gray-600">Sin calificaciones detalladas</h3>
                      <p className="text-sm text-muted-foreground mt-2">
                        El docente aún no ha registrado las calificaciones detalladas por dimensiones para esta materia.
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* Botón para ver centralizador completo */}
                <div className="flex justify-center">
                  <Button 
                    variant="outline" 
                    onClick={() => setSelectedCourse(null)}
                    className="flex items-center gap-2"
                  >
                    <Award className="h-4 w-4" />
                    Ver Centralizador Completo
                  </Button>
                </div>
              </>
            ) : (
              /* === VISTA DEL CENTRALIZADOR COMPLETO === */
              <>
                {/* Información del estudiante */}
                <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-blue-500 flex items-center justify-center">
                        <User className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">{estudianteActual.apellido} {estudianteActual.nombre}</h3>
                        <p className="text-sm text-muted-foreground">
                          {estudianteActual.grado}° {estudianteActual.grupo} - {nivel} | Gestión {year}
                        </p>
                      </div>
                      <div className="ml-auto flex items-center gap-2">
                        <Calculator className="h-5 w-5 text-blue-500" />
                        <span className="text-sm font-medium">Promedio General:</span>
                        <Badge className={`text-lg ${getGradeClasses(getPromedioGeneral())}`}>
                          {getPromedioGeneral() !== null ? getPromedioGeneral() : '--'}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Botones de exportación */}
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="secondary" onClick={exportCSV}>
                    <Download className="h-4 w-4 mr-2" /> Exportar CSV
                  </Button>
                  <Button size="sm" variant="secondary" onClick={exportXLSX}>
                    <Download className="h-4 w-4 mr-2" /> Exportar XLSX
                  </Button>
                  <Button size="sm" variant="outline" onClick={descargarBoletin}>
                    <FileText className="h-4 w-4 mr-2" /> Descargar Boletín
                  </Button>
                </div>

                {/* Tabla Centralizador de Notas por Materia */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <BookOpen className="h-5 w-5 text-blue-500" />
                      MIS CALIFICACIONES - {globalTerm.toUpperCase()}° TRIMESTRE
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm border-collapse border">
                        <thead>
                          <tr className="bg-muted/50">
                            <th className="border p-2 text-center font-bold w-12">Nro</th>
                            <th className="border p-2 text-left font-bold">MATERIA</th>
                            <th className="border p-2 text-center font-bold w-20">CÓDIGO</th>
                            <th className="border p-2 text-center font-bold w-24 bg-blue-50">NOTA</th>
                            <th className="border p-2 text-center font-bold w-28">ESTADO</th>
                            <th className="border p-2 text-center font-bold w-24">ACCIÓN</th>
                          </tr>
                        </thead>
                        <tbody>
                          {materiasDelCurso.map((materia, index) => {
                            const nota = getNotaMateria(materia.id);
                            const estado = nota !== null && nota >= 51 ? 'APROBADO' : nota !== null ? 'REPROBADO' : 'SIN NOTA';
                            // Buscar el curso correspondiente para ver detalle
                            const cursoMateria = courses.find(c => c.id === materia.id);
                            return (
                              <tr key={materia.id} className="hover:bg-muted/30 transition-colors">
                                <td className="border p-2 text-center font-medium">{index + 1}</td>
                                <td className="border p-2 font-medium">
                                  <div className="flex items-center gap-2">
                                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                                    {materia.nombre}
                                  </div>
                                </td>
                                <td className="border p-2 text-center">
                                  <Badge variant="outline">{materia.codigo}</Badge>
                                </td>
                                <td className="border p-2 text-center">
                                  <Badge className={`${getGradeClasses(nota)} font-bold text-base`}>
                                    {nota !== null ? nota : '--'}
                                  </Badge>
                                </td>
                                <td className="border p-2 text-center">
                                  <Badge 
                                    variant={estado === 'APROBADO' ? 'default' : estado === 'REPROBADO' ? 'destructive' : 'outline'}
                                    className={estado === 'APROBADO' ? 'bg-green-500' : ''}
                                  >
                                    {estado}
                                  </Badge>
                                </td>
                                <td className="border p-2 text-center">
                                  {cursoMateria && (
                                    <Button 
                                      size="sm" 
                                      variant="ghost"
                                      onClick={() => {
                                        setSelectedCourse(cursoMateria);
                                      }}
                                      className="text-blue-600 hover:text-blue-800"
                                    >
                                      Ver detalle
                                    </Button>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                          {/* Fila de promedio */}
                          <tr className="bg-blue-50 font-bold">
                            <td className="border p-2" colSpan={3} />
                            <td className="border p-2 text-center">
                              <Badge className={`${getGradeClasses(getPromedioGeneral())} text-lg`}>
                                {getPromedioGeneral() !== null ? getPromedioGeneral() : '--'}
                              </Badge>
                            </td>
                            <td className="border p-2 text-center text-sm">PROMEDIO GENERAL</td>
                            <td className="border p-2" />
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {/* Leyenda */}
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex flex-wrap items-center gap-4 text-xs">
                <span className="font-medium">Leyenda:</span>
                <div className="flex items-center gap-1">
                  <div className="w-4 h-4 bg-emerald-100 border border-emerald-300 rounded"></div>
                  <span>≥81 Excelente</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-4 h-4 bg-yellow-100 border border-yellow-300 rounded"></div>
                  <span>51-80 Aprobado</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-4 h-4 bg-red-100 border border-red-300 rounded"></div>
                  <span>&lt;51 Reprobado</span>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
