import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Award, User, BookOpen, Save, Download, Upload, Calculator, School, Filter, Bookmark, RefreshCw, AlertCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getMyTeacherProfile, type TeacherAssignedSection, type TeacherSectionStudent } from '@/services/teachersApi';
import {
  createActaEvaluation,
  createTeacherActa,
  getTeacherActa,
  getTeacherActas,
  getTeacherGradeSections,
  getTeacherGradeStudents,
  getTeacherPeriods,
  saveTeacherActaNotes,
  type TeacherGradeActa,
} from '@/services/teacherGradesApi';

type GradeMap = Record<string, number | null>;
type GradeAssignment = TeacherAssignedSection['assignments'][number];

const gradeKey = (studentId: number, assignmentId: number) => `${studentId}:${assignmentId}`;
const levelOptions = [
  { value: 'inicial', label: 'Inicial' },
  { value: 'primaria', label: 'Primaria' },
  { value: 'secundaria', label: 'Secundaria' },
];

function parseCsvLine(line: string): string[] {
  const values: string[] = [];
  let value = '';
  let quoted = false;
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"' && line[i + 1] === '"' && quoted) { value += '"'; i += 1; }
    else if (char === '"') quoted = !quoted;
    else if (char === ',' && !quoted) { values.push(value); value = ''; }
    else value += char;
  }
  values.push(value);
  return values;
}

function csvCell(value: string | number | null) {
  const text = value === null ? '' : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

export default function TeacherCalificaciones() {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(String(currentYear));
  const [nivel, setNivel] = useState(() => {
    const saved = (localStorage.getItem('nivel') || localStorage.getItem('nivelLabel') || 'primaria').toLowerCase();
    return saved.includes('inicial') ? 'inicial' : saved.includes('secundaria') ? 'secundaria' : 'primaria';
  });
  const [term, setTerm] = useState('T1');
  const [sections, setSections] = useState<TeacherAssignedSection[]>([]);
  const [selectedSectionId, setSelectedSectionId] = useState('');
  const [students, setStudents] = useState<TeacherSectionStudent[]>([]);
  const [actas, setActas] = useState<Record<number, TeacherGradeActa>>({});
  const [savedGrades, setSavedGrades] = useState<GradeMap>({});
  const [draftGrades, setDraftGrades] = useState<GradeMap>({});
  const [teacherName, setTeacherName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');
  const fileInput = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const selectedSection = sections.find((section) => String(section.id) === selectedSectionId) || null;
  const assignments = useMemo(
    () => (selectedSection?.assignments || []).filter((assignment) => assignment.subject),
    [selectedSection],
  );
  const dirtyAssignments = useMemo(() => assignments.filter((assignment) =>
    students.some((student) => savedGrades[gradeKey(student.id, assignment.id)] !== draftGrades[gradeKey(student.id, assignment.id)])
  ), [assignments, students, savedGrades, draftGrades]);

  const loadSections = useCallback(async (keepSelection = true) => {
    setLoading(true);
    setError('');
    try {
      const response = await getTeacherGradeSections(Number(year), nivel);
      setSections(response);
      setSelectedSectionId((current) => {
        if (keepSelection && response.some((section) => String(section.id) === current)) return current;
        return response[0] ? String(response[0].id) : '';
      });
    } catch (requestError: any) {
      setSections([]);
      setSelectedSectionId('');
      setError(requestError.response?.data?.message || 'No se pudieron cargar tus cursos asignados.');
    } finally {
      setLoading(false);
    }
  }, [year, nivel]);

  useEffect(() => {
    getMyTeacherProfile(year)
      .then((profile) => setTeacherName(`${profile.nombres} ${profile.apellidos}`.trim()))
      .catch(() => setTeacherName(''));
    loadSections(false);
  }, [loadSections, year]);

  const loadSelectedGradebook = useCallback(async () => {
    if (!selectedSection) {
      setStudents([]);
      setActas({});
      setSavedGrades({});
      setDraftGrades({});
      return;
    }

    setLoading(true);
    setError('');
    try {
      const [enrolledStudents, actaList] = await Promise.all([
        getTeacherGradeStudents(selectedSection.id),
        getTeacherActas({
          year: Number(year),
          nivel: selectedSection.nivel,
          grado: Number.parseInt(String(selectedSection.curso), 10) || 0,
          seccion: selectedSection.paralelo,
          term,
        }),
      ]);
      const entries = await Promise.all(actaList.map(async (acta) => {
        try { return await getTeacherActa(acta.id); }
        catch { return acta; }
      }));
      const nextActas: Record<number, TeacherGradeActa> = {};
      const nextGrades: GradeMap = {};
      entries.forEach((acta) => {
        nextActas[acta.materia_id] = acta;
        (acta.term_totals || []).forEach((total) => {
          assignments.filter((assignment) => assignment.subject_id === acta.materia_id).forEach((assignment) => {
            nextGrades[gradeKey(total.student_id, assignment.id)] = total.tn === null ? null : Number(total.tn);
          });
        });
      });
      enrolledStudents.forEach((student) => assignments.forEach((assignment) => {
        const key = gradeKey(student.id, assignment.id);
        if (!(key in nextGrades)) nextGrades[key] = null;
      }));
      setStudents(enrolledStudents);
      setActas(nextActas);
      setSavedGrades(nextGrades);
      setDraftGrades(nextGrades);
      setIsEditing(false);
    } catch (requestError: any) {
      setStudents([]);
      setActas({});
      setSavedGrades({});
      setDraftGrades({});
      setError(requestError.response?.data?.message || 'No se pudieron cargar las calificaciones de esta sección.');
    } finally {
      setLoading(false);
    }
  }, [selectedSection, year, term, assignments]);

  useEffect(() => { loadSelectedGradebook(); }, [loadSelectedGradebook]);

  const updateGrade = (studentId: number, assignmentId: number, rawValue: string) => {
    const value = rawValue === '' ? null : Number(rawValue);
    if (value !== null && (!Number.isFinite(value) || value < 0 || value > 100)) return;
    setDraftGrades((current) => ({ ...current, [gradeKey(studentId, assignmentId)]: value }));
  };

  const saveGrades = async () => {
    if (!selectedSection || dirtyAssignments.length === 0) {
      setIsEditing(false);
      return;
    }
    setSaving(true);
    let savedCount = 0;
    try {
      let periods = await getTeacherPeriods(Number(year));
      const period = periods.find((item) => item.code.toUpperCase() === term);
      for (const assignment of dirtyAssignments) {
        let acta = actas[assignment.subject_id];
        if (acta && acta.status !== 'DRAFT') {
          throw new Error(`El acta de ${assignment.subject?.nombre || 'la materia'} está ${acta.status.toLowerCase()} y ya no admite cambios.`);
        }
        if (!acta) {
          if (!period) throw new Error(`No existe el período ${term} para la gestión ${year}. Solicita a administración que lo configure.`);
          if (period.estado !== 'ABIERTO') throw new Error(`El período ${term} está cerrado.`);
          acta = await createTeacherActa({
            year: Number(year),
            assignment_id: assignment.id,
            section_id: selectedSection.id,
            period_id: period.id,
          });
        } else {
          acta = await getTeacherActa(acta.id);
        }
        let evaluation = acta.evaluations?.[0];
        if (!evaluation) {
          evaluation = await createActaEvaluation({ acta_id: acta.id, nombre: `Nota ${term}`, peso: 100 });
        }
        const notes = students.map((student) => ({
          student_id: student.id,
          evaluation_id: evaluation!.id,
          valor: draftGrades[gradeKey(student.id, assignment.id)],
        }));
        await saveTeacherActaNotes(acta.id, notes);
        savedCount += 1;
      }
      toast({ title: 'Calificaciones guardadas', description: `Se guardaron las notas de ${savedCount} materia(s) en el sistema.` });
      await loadSelectedGradebook();
    } catch (saveError: any) {
      const message = saveError.response?.data?.message || saveError.message || 'No se pudieron guardar las calificaciones.';
      setError(message);
      toast({ title: savedCount ? 'Guardado parcial' : 'No se guardaron las notas', description: message, variant: 'destructive' });
      if (savedCount) await loadSelectedGradebook();
    } finally {
      setSaving(false);
    }
  };

  const cancelEditing = () => {
    setDraftGrades(savedGrades);
    setIsEditing(false);
  };

  const gradeFor = (studentId: number, assignmentId: number) => draftGrades[gradeKey(studentId, assignmentId)] ?? null;
  const averageForStudent = (studentId: number) => {
    const grades = assignments.map((assignment) => gradeFor(studentId, assignment.id)).filter((grade): grade is number => grade !== null);
    return grades.length ? Math.round(grades.reduce((sum, grade) => sum + grade, 0) / grades.length) : null;
  };
  const averageForAssignment = (assignmentId: number) => {
    const grades = students.map((student) => gradeFor(student.id, assignmentId)).filter((grade): grade is number => grade !== null && grade > 0);
    return grades.length ? Math.round(grades.reduce((sum, grade) => sum + grade, 0) / grades.length) : null;
  };
  const failsForAssignment = (assignmentId: number) => students.filter((student) => {
    const grade = gradeFor(student.id, assignmentId);
    return grade !== null && grade < 51;
  }).length;
  const gradeClass = (grade: number | null) => {
    if (grade === null) return 'bg-gray-100 text-gray-800';
    if (grade < 51) return 'bg-red-100 text-red-800';
    if (grade < 81) return 'bg-yellow-100 text-yellow-800';
    return 'bg-emerald-100 text-emerald-800';
  };

  const exportGrades = () => {
    if (!selectedSection) return;
    const headers = ['student_id', 'estudiante', ...assignments.map((assignment) => `${assignment.id}:${assignment.subject?.nombre || 'Materia'}`)];
    const rows = students.map((student) => [
      student.id,
      `${student.apellidos} ${student.nombres}`,
      ...assignments.map((assignment) => gradeFor(student.id, assignment.id)),
    ]);
    const csv = [headers, ...rows].map((row) => row.map(csvCell).join(',')).join('\n');
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `calificaciones_${selectedSection.nivel}_${selectedSection.curso}_${selectedSection.paralelo}_${year}_${term}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const importGrades = async (file?: File) => {
    if (!file || !students.length || !assignments.length) return;
    try {
      const text = (await file.text()).replace(/^\uFEFF/, '');
      const rows = text.split(/\r?\n/).filter(Boolean).map(parseCsvLine);
      if (rows.length < 2) throw new Error('El archivo no contiene filas de calificaciones.');
      const headers = rows[0];
      const studentColumn = headers.indexOf('student_id');
      if (studentColumn < 0) throw new Error('El CSV debe incluir la columna student_id exportada por este módulo.');
      const assignmentColumns = assignments.map((assignment) => ({
        assignment,
        column: headers.findIndex((header) => header.startsWith(`${assignment.id}:`)),
      })).filter((item) => item.column >= 0);
      if (!assignmentColumns.length) throw new Error('El archivo no contiene materias asignadas de esta sección.');
      const studentIds = new Set(students.map((student) => student.id));
      setDraftGrades((current) => {
        const next = { ...current };
        rows.slice(1).forEach((row) => {
          const studentId = Number(row[studentColumn]);
          if (!studentIds.has(studentId)) return;
          assignmentColumns.forEach(({ assignment, column }) => {
            const raw = row[column]?.trim() || '';
            const grade = raw === '' ? null : Number(raw);
            if (grade === null || (Number.isFinite(grade) && grade >= 0 && grade <= 100)) {
              next[gradeKey(studentId, assignment.id)] = grade;
            }
          });
        });
        return next;
      });
      setIsEditing(true);
      toast({ title: 'Archivo cargado', description: 'Revisa las notas importadas y pulsa Guardar Cambios para registrarlas.' });
    } catch (importError: any) {
      toast({ title: 'No se pudo importar', description: importError.message || 'Revisa el formato del CSV.', variant: 'destructive' });
    } finally {
      if (fileInput.current) fileInput.current.value = '';
    }
  };

  const sectionLabel = (section: TeacherAssignedSection) => `${section.curso} ${section.paralelo} · ${section.nivel}`;

  return (
    <div className="space-y-6 p-4">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Award className="h-7 w-7 text-academic-blue-500" />
            Centralizador de Notas - Docente
          </h1>
          <p className="text-muted-foreground">
            Calificaciones reales de {teacherName || 'tu perfil docente'} · {term} · Gestión {year}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={exportGrades} disabled={!students.length}>
            <Download className="h-4 w-4 mr-2" /> Exportar CSV
          </Button>
          <Button variant="outline" onClick={() => fileInput.current?.click()} disabled={!students.length || saving}>
            <Upload className="h-4 w-4 mr-2" /> Importar CSV
          </Button>
          <input ref={fileInput} type="file" accept=".csv,text/csv" className="hidden" onChange={(event) => importGrades(event.target.files?.[0])} />
          <Button variant="outline" onClick={loadSelectedGradebook} disabled={!selectedSection || loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Actualizar
          </Button>
          {isEditing ? (
            <>
              <Button variant="outline" onClick={cancelEditing} disabled={saving}>Cancelar</Button>
              <Button onClick={saveGrades} disabled={saving || dirtyAssignments.length === 0} className="bg-green-600 hover:bg-green-700">
                {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                Guardar Cambios
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)} disabled={!selectedSection || !assignments.length || loading}>
              <School className="h-4 w-4 mr-2" /> Editar Notas
            </Button>
          )}
        </div>
      </div>

      {error && (
        <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertDescription>{error}</AlertDescription></Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card><CardContent className="p-4">
          <Label htmlFor="term" className="mb-2 block"><Filter className="inline h-4 w-4 mr-2" />Trimestre</Label>
          <Select value={term} onValueChange={setTerm}>
            <SelectTrigger id="term"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="T1">1° Trimestre</SelectItem>
              <SelectItem value="T2">2° Trimestre</SelectItem>
              <SelectItem value="T3">3° Trimestre</SelectItem>
            </SelectContent>
          </Select>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <Label htmlFor="section" className="mb-2 block"><Bookmark className="inline h-4 w-4 mr-2" />Curso Asignado</Label>
          <Select value={selectedSectionId} onValueChange={setSelectedSectionId}>
            <SelectTrigger id="section"><SelectValue placeholder="Seleccionar curso" /></SelectTrigger>
            <SelectContent>
              {sections.map((section) => <SelectItem key={section.id} value={String(section.id)}>{sectionLabel(section)}</SelectItem>)}
            </SelectContent>
          </Select>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="level" className="text-xs text-muted-foreground">Nivel</Label>
              <Select value={nivel} onValueChange={setNivel}>
                <SelectTrigger id="level" className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>{levelOptions.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="year" className="text-xs text-muted-foreground">Gestión</Label>
              <Select value={year} onValueChange={setYear}>
                <SelectTrigger id="year" className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>{Array.from(new Set([currentYear, currentYear - 1, currentYear - 2])).map((item) => <SelectItem key={item} value={String(item)}>{item}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
        </CardContent></Card>
        <Card><CardContent className="p-4 flex items-center justify-center h-full">
          <div className="text-center">
            <Calculator className="h-8 w-8 text-academic-blue-500 mx-auto mb-2" />
            <p className="text-sm font-medium">{selectedSection ? sectionLabel(selectedSection) : 'Sin sección seleccionada'}</p>
            <p className="text-xs text-muted-foreground">{students.length} estudiante(s) · {assignments.length} materia(s)</p>
          </div>
        </CardContent></Card>
      </div>

      {loading ? (
        <Card><CardContent className="p-12 text-center text-muted-foreground"><Loader2 className="inline h-5 w-5 mr-2 animate-spin" />Cargando calificaciones...</CardContent></Card>
      ) : !selectedSection ? (
        <Card className="text-center py-12"><CardContent>
          <Filter className="h-14 w-14 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">No tienes cursos asignados</h3>
          <p className="text-muted-foreground">No hay secciones con materias asignadas para {nivel} en la gestión {year}.</p>
        </CardContent></Card>
      ) : !students.length ? (
        <Card className="text-center py-12"><CardContent>
          <User className="h-14 w-14 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">La sección no tiene estudiantes inscritos</h3>
          <p className="text-muted-foreground">Las notas aparecerán aquí cuando existan matrículas para esta sección.</p>
        </CardContent></Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <span className="flex items-center gap-2"><BookOpen className="h-5 w-5 text-academic-blue-500" />CURSO: {sectionLabel(selectedSection).toUpperCase()} - {term}</span>
              <Badge variant="outline">{assignments.length} materia(s) asignada(s)</Badge>
            </CardTitle>
            <div className="text-sm text-muted-foreground">
              {assignments.map((assignment) => assignment.subject?.nombre).filter(Boolean).join(' · ') || 'Sin materias asignadas'}
            </div>
          </CardHeader>
          <CardContent>
            {!assignments.some((assignment) => actas[assignment.subject_id]) && (
              <Alert className="mb-4 border-blue-200 bg-blue-50">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">Aún no hay actas para este trimestre. Al guardar las primeras notas se creará el acta usando el período académico configurado.</AlertDescription>
              </Alert>
            )}
            {assignments.some((assignment) => actas[assignment.subject_id]?.status !== 'DRAFT') && (
              <Alert className="mb-4 border-amber-200 bg-amber-50">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-800">Las actas bloqueadas o publicadas se muestran en modo de solo lectura.</AlertDescription>
              </Alert>
            )}
            <div className="overflow-x-auto rounded-md border">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-muted/50 sticky top-0 z-10">
                    <th className="border p-2 text-center font-bold w-12">Nro</th>
                    <th className="border p-2 text-left font-bold min-w-56">APELLIDOS Y NOMBRES</th>
                    {assignments.map((assignment) => {
                      const acta = actas[assignment.subject_id];
                      const editable = !acta || acta.status === 'DRAFT';
                      return <th key={assignment.id} className={`border p-2 text-center font-bold min-w-28 ${editable ? 'bg-green-50 border-green-200' : 'bg-gray-50'}`} title={assignment.subject?.nombre || ''}>
                        <div className="flex flex-col items-center gap-1">
                          <span>{assignment.subject?.nombre || 'Materia'}</span>
                          <span className="text-[10px] font-normal text-muted-foreground">{acta?.status || 'Sin acta'}</span>
                          {editable && <BookOpen className="h-3 w-3 text-green-600" />}
                        </div>
                      </th>;
                    })}
                    <th className="border p-2 text-center font-bold w-24 bg-academic-blue-100">PROMEDIO</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student, index) => (
                    <tr key={student.id} className="hover:bg-muted/30">
                      <td className="border p-2 text-center font-medium">{index + 1}</td>
                      <td className="border p-2 font-medium"><div className="flex items-center gap-2"><User className="h-4 w-4 text-muted-foreground" />{student.apellidos} {student.nombres}</div></td>
                      {assignments.map((assignment) => {
                        const value = gradeFor(student.id, assignment.id);
                        const editable = (!actas[assignment.subject_id] || actas[assignment.subject_id].status === 'DRAFT') && isEditing;
                        return <td key={assignment.id} className="border p-1 text-center">
                          {editable ? (
                            <Input type="number" min="0" max="100" step="1" value={value ?? ''} onChange={(event) => updateGrade(student.id, assignment.id, event.target.value)} className="w-20 h-8 text-center mx-auto border-green-300 focus:border-green-500" placeholder="--" aria-label={`Nota de ${student.nombres} en ${assignment.subject?.nombre}`} />
                          ) : <Badge variant={value === null ? 'outline' : 'default'} className={`${value !== null ? gradeClass(value) : ''} font-semibold`}>{value ?? '--'}</Badge>}
                        </td>;
                      })}
                      <td className="border p-2 text-center font-bold"><Badge variant={averageForStudent(student.id) === null ? 'outline' : 'default'} className={`${averageForStudent(student.id) !== null ? gradeClass(averageForStudent(student.id)) : ''} text-base`}>{averageForStudent(student.id) ?? '--'}</Badge></td>
                    </tr>
                  ))}
                  <tr className="bg-gray-50">
                    <td className="border p-2" /><td className="border p-2 font-semibold">PROMEDIO POR MATERIA</td>
                    {assignments.map((assignment) => <td key={`avg-${assignment.id}`} className="border p-2 text-center font-bold"><span className={`${gradeClass(averageForAssignment(assignment.id))} px-2 py-1 rounded`}>{averageForAssignment(assignment.id) ?? '--'}</span></td>)}
                    <td className="border p-2" />
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border p-2" /><td className="border p-2 font-semibold">ESTUDIANTES CON NOTA MENOR A 51</td>
                    {assignments.map((assignment) => <td key={`fails-${assignment.id}`} className="border p-2 text-center font-bold text-red-700">{failsForAssignment(assignment.id)}</td>)}
                    <td className="border p-2" />
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
                <div className="flex items-center gap-2"><BookOpen className="h-4 w-4 text-green-600" /><span>Materias asignadas al docente</span></div>
                <div className="flex items-center gap-2"><span className="w-4 h-4 bg-gray-100 border border-gray-300 rounded" /><span>Actas bloqueadas o publicadas: solo lectura</span></div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
