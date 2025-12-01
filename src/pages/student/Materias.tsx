// src/pages/student/Materias.tsx
import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
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
} from 'lucide-react';

// ------------------------------
// Helpers de datos por NIVEL
// ------------------------------
const buildCoursesByLevel = (nivel) => {
  // Por simplicidad, mismos docentes; ajusta con tu data real
  if (nivel === 'Inicial') {
    return [
      { id: 101, title: 'Comunicación', teacher: 'Ms. Ana', info: 'Inicial 5 años', place: 'Aula I-1', term: 'T1' },
      { id: 102, title: 'Psicomotricidad', teacher: 'Ms. Carla', info: 'Inicial 5 años', place: 'Patio', term: 'T1' },
      { id: 103, title: 'Arte y Juego', teacher: 'Ms. Sofía', info: 'Inicial 5 años', place: 'Aula I-2', term: 'T1' },
    ];
  }
  if (nivel === 'Primaria') {
    return [
      { id: 201, title: 'Comunicación', teacher: 'Prof. García', info: '3° Primaria', place: 'Aula P-3A', term: 'T1' },
      { id: 202, title: 'Matemática', teacher: 'Prof. López', info: '3° Primaria', place: 'Aula P-3A', term: 'T1' },
      { id: 203, title: 'Ciencia y Tecnología', teacher: 'Prof. Martín', info: '3° Primaria', place: 'Laboratorio', term: 'T1' },
      { id: 204, title: 'Personal Social', teacher: 'Prof. Torres', info: '3° Primaria', place: 'Aula P-3A', term: 'T1' },
      { id: 205, title: 'Inglés', teacher: 'Miss Smith', info: '3° Primaria', place: 'Aula de Idiomas', term: 'T1' },
      { id: 206, title: 'Arte y Cultura', teacher: 'Prof. Díaz', info: '3° Primaria', place: 'Sala de Arte', term: 'T1' },
      { id: 207, title: 'Educación Física', teacher: 'Prof. Vega', info: '3° Primaria', place: 'Cancha', term: 'T1' },
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
    buildCoursesByLevel(nivel).map(c => ({ ...c, _edit: false, _draftTerm: c.term }))
  );

  // Si cambia el nivel o el año, reiniciamos la lista (puedes cambiar a caching si quieres)
  useEffect(() => {
    const next = buildCoursesByLevel(nivel).map(c => ({ ...c, _edit: false, _draftTerm: c.term }));
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
  // Nota 0 (modal)
  // -----------------------
  const [nota0Open, setNota0Open] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [docenteNota, setDocenteNota] = useState(null);

  // Funciones de cálculo (copiadas de RegistroValoracion)
  const calcularPromedioCategoria = (notasAlumno: any, categoria: string): number => {
    if (!notasAlumno || !notasAlumno[categoria]) return 0;
    const valores = Object.values(notasAlumno[categoria]).filter((v: any) => v !== null) as number[];
    if (valores.length === 0) return 0;
    const suma = valores.reduce((acc: number, val: number) => acc + val, 0);
    return Math.round(suma / valores.length);
  };
  
  const calcularTsPE = (notasAlumno: any) => {
    const ser = calcularPromedioCategoria(notasAlumno, 'ser');
    const saber = calcularPromedioCategoria(notasAlumno, 'saber');
    const hacer = calcularPromedioCategoria(notasAlumno, 'hacer');
    const decidir = calcularPromedioCategoria(notasAlumno, 'decidir');
    const auto = notasAlumno?.autoevaluacion || 0;
    return ser + saber + hacer + decidir + auto;
  };
  
  const calcularSegundoTrimestre = (notasAlumno: any) => {
    const tspe = calcularTsPE(notasAlumno);
    const pe = 0; // Prueba escrita no implementada por defecto
    return tspe + pe;
  };
  
  // Cargar nota del docente (de localStorage) cuando se abre el modal
  useEffect(() => {
    if (nota0Open && selectedCourse) {
      const key = `registro-valoracion:${selectedCourse.id}:${selectedCourse.term?.replace(/^T/, '')}`;
      try {
        const raw = localStorage.getItem(key);
        if (raw) {
          const parsed = JSON.parse(raw);
          setDocenteNota(parsed?.[0] || null); // tomamos primera entrada (propio alumno)
        } else {
          setDocenteNota(null);
        }
      } catch (e) {
        setDocenteNota(null);
        console.error('Error al cargar registro docente:', e);
      }
    }
  }, [nota0Open, selectedCourse]);

  const nota0DataByCourseId = useMemo(() => {
    // Puedes diferenciar por nivel/curso si quieres variación
    const out = {};
    for (const c of courses) out[c.id] = nota0DataSeed.default;
    return out;
  }, [courses]);

  const exportCSV = () => {
    if (!selectedCourse) return;
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
    if (!selectedCourse) return;
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
    alert(`Descargando boletín PDF de ${selectedCourse?.title} — ${nivel} ${year} ${selectedCourse?.term}`);
  };

  const verDetalleCurso = () => {
    navigate('/dashboard/parent/notas-academicas#nota0');
  };

  // -----------------------
  // Acciones por curso
  // -----------------------
  const handleNota0 = (course) => {
    setSelectedCourse(course);
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
            <CardHeader>
              <CardTitle className="text-lg">
                {nivel} — {year}
              </CardTitle>
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
                    <FileText className="h-4 w-4" />
                    <span className="ml-1">Nota 0</span>
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center justify-start text-muted-foreground hover:text-foreground hover:bg-muted"
                    disabled
                  >
                    {/* Centralizador eliminado - usar Nota 0 para ver evaluaciones por trimestre */}
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

      {/* Modal Nota 0 */}
      <Dialog open={nota0Open} onOpenChange={setNota0Open}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              Nota 0 {selectedCourse ? `— ${selectedCourse.title} (${nivel} ${year} ${selectedCourse.term})` : ''}
            </DialogTitle>
            <DialogDescription>
              Resumen de evaluaciones (peso y notas registradas).
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="secondary" onClick={exportCSV}>
                <Download className="h-4 w-4 mr-2" /> Exportar CSV
              </Button>
              <Button size="sm" variant="secondary" onClick={exportXLSX}>
                <Download className="h-4 w-4 mr-2" /> Exportar XLSX
              </Button>
              <Button size="sm" variant="outline" onClick={descargarBoletin}>
                <FileText className="h-4 w-4 mr-2" /> Descargar boletín
              </Button>
              <Button size="sm" onClick={verDetalleCurso}>
                Ver detalle
              </Button>
            </div>

            {/* Resumen de calificaciones docentes si existen */}
            {docenteNota && (
              <Card className="mb-4">
                <CardHeader>
                  <CardTitle className="text-sm">Calificación registrada por docente</CardTitle>
                  <CardDescription className="text-xs">
                    Promedios calculados según criterios SER/SABER/HACER/DECIDIR
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-gradient-to-br from-sky-50 to-sky-100 rounded-md">
                      <p className="text-sm text-muted-foreground">TsPE (Ser/Saber/Hacer/Decidir)</p>
                      <div className="text-2xl font-bold text-sky-600">{calcularTsPE(docenteNota)}</div>
                      <Progress value={calcularTsPE(docenteNota)} className="mt-2" />
                    </div>
                    <div className="p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-md">
                      <p className="text-sm text-muted-foreground">Segundo Trimestre</p>
                      <div className="text-2xl font-bold text-emerald-600">{calcularSegundoTrimestre(docenteNota)}</div>
                      <Progress value={calcularSegundoTrimestre(docenteNota)} className="mt-2" />
                    </div>
                    <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-md">
                      <p className="text-sm text-muted-foreground">Promedio Acumulado</p>
                      {(() => {
                        const t1 = docenteNota?.primerTrimestre || 0;
                        const t2 = calcularSegundoTrimestre(docenteNota);
                        const pa = Math.round(((t1 || 0) + (t2 || 0)) / ((t1 ? 1 : 0) + (t2 ? 1 : 0) || 1));
                        return (
                          <>
                            <div className="text-2xl font-bold text-purple-600">{pa}</div>
                            <Progress value={pa} className="mt-2" />
                          </>
                        );
                      })()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Evaluación</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Peso (%)</TableHead>
                    <TableHead>Nota</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(selectedCourse ? (nota0DataByCourseId[selectedCourse.id] || []) : []).map((ev) => (
                    <TableRow key={ev.id}>
                      <TableCell>{ev.id}</TableCell>
                      <TableCell>{ev.nombre}</TableCell>
                      <TableCell>{ev.tipo}</TableCell>
                      <TableCell>{ev.peso}</TableCell>
                      <TableCell>{ev.nota}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
