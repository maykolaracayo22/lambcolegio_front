// src/pages/admin/Asistencia.tsx
// Gestión de Asistencia Diaria - Sistema Escolar Bolivia

import { useState, useEffect, useMemo } from 'react';
import { 
  getAttendances,
  bulkCreateAttendance,
  getEstadoColor,
  getEstadoLabel,
  estadoOptions,
  AttendanceRecord,
  BulkAttendanceData
} from '@/services/attendanceApi';
import { listSections, getSectionStudents, Section } from '@/services/sectionsApi';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { 
  Calendar,
  Clock,
  Users,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Save,
  Loader2,
  ClipboardList,
  UserCheck,
  UserX,
  Filter
} from 'lucide-react';
import axios from 'axios';

// API para obtener materias
const API_URL = 'http://127.0.0.1:8000/api';
const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return {
    'Authorization': `Bearer ${token}`,
    'Accept': 'application/json',
  };
};

interface Subject {
  id: number;
  nombre: string;
  codigo: string;
}

interface StudentForAttendance {
  id: number;
  nombres: string;
  apellidos: string;
  codigo: string;
  estado?: 'presente' | 'ausente' | 'tardanza' | 'justificado';
  observaciones?: string;
}

const currentYear = new Date().getFullYear();

const Asistencia = () => {
  // Filtros
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [sectionId, setSectionId] = useState<string>('');
  const [subjectId, setSubjectId] = useState<string>('');
  
  // Datos
  const [sections, setSections] = useState<Section[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [students, setStudents] = useState<StudentForAttendance[]>([]);
  const [existingAttendance, setExistingAttendance] = useState<AttendanceRecord[]>([]);
  
  // Estados de carga
  const [loadingSections, setLoadingSections] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Estadísticas
  const stats = useMemo(() => {
    const total = students.length;
    const presentes = students.filter(s => s.estado === 'presente').length;
    const ausentes = students.filter(s => s.estado === 'ausente').length;
    const tardanzas = students.filter(s => s.estado === 'tardanza').length;
    const justificados = students.filter(s => s.estado === 'justificado').length;
    const sinMarcar = students.filter(s => !s.estado).length;
    
    return { total, presentes, ausentes, tardanzas, justificados, sinMarcar };
  }, [students]);

  const { toast } = useToast();

  // Cargar secciones
  useEffect(() => {
    const loadSections = async () => {
      setLoadingSections(true);
      try {
        const response = await listSections({ year: currentYear });
        setSections(response.data || []);
      } catch (error) {
        console.error('Error cargando secciones:', error);
        toast({
          title: 'Error',
          description: 'No se pudieron cargar las secciones',
          variant: 'destructive',
        });
      } finally {
        setLoadingSections(false);
      }
    };
    loadSections();
  }, [toast]);

  // Cargar materias cuando cambia la sección
  useEffect(() => {
    if (!sectionId) {
      setSubjects([]);
      return;
    }
    
    const loadSubjects = async () => {
      try {
        const response = await axios.get(`${API_URL}/subjects`, {
          headers: getAuthHeaders(),
          params: { per_page: 100 },
        });
        setSubjects(response.data.data || response.data || []);
      } catch (error) {
        console.error('Error cargando materias:', error);
      }
    };
    loadSubjects();
  }, [sectionId]);

  // Cargar estudiantes y asistencia existente cuando cambian los filtros
  useEffect(() => {
    if (!sectionId || !subjectId || !fecha) {
      setStudents([]);
      return;
    }

    const loadData = async () => {
      setLoadingStudents(true);
      try {
        // Cargar estudiantes de la sección
        const studentsData = await getSectionStudents(parseInt(sectionId));
        
        // Cargar asistencia existente para esta fecha/sección/materia
        const attendanceData = await getAttendances({
          section_id: parseInt(sectionId),
          subject_id: parseInt(subjectId),
          fecha: fecha,
        });
        
        setExistingAttendance(attendanceData.data || []);
        
        // Combinar estudiantes con su asistencia existente
        const studentsWithAttendance = (studentsData.estudiantes || []).map((student) => {
          const existing = (attendanceData.data || []).find(
            (a: AttendanceRecord) => a.student_id === student.id
          );
          return {
            id: student.id,
            nombres: student.nombres,
            apellidos: student.apellidos,
            codigo: student.codigo_estudiante,
            estado: existing?.estado || undefined,
            observaciones: existing?.observaciones || '',
          };
        });
        
        setStudents(studentsWithAttendance);
      } catch (error) {
        console.error('Error cargando datos:', error);
        toast({
          title: 'Error',
          description: 'No se pudieron cargar los estudiantes',
          variant: 'destructive',
        });
      } finally {
        setLoadingStudents(false);
      }
    };
    
    loadData();
  }, [sectionId, subjectId, fecha, toast]);

  // Marcar estado de un estudiante
  const handleEstadoChange = (studentId: number, estado: 'presente' | 'ausente' | 'tardanza' | 'justificado') => {
    setStudents(prev => prev.map(s => 
      s.id === studentId ? { ...s, estado } : s
    ));
  };

  // Cambiar observación de un estudiante
  const handleObservacionChange = (studentId: number, observaciones: string) => {
    setStudents(prev => prev.map(s => 
      s.id === studentId ? { ...s, observaciones } : s
    ));
  };

  // Marcar todos con un estado
  const handleMarcarTodos = (estado: 'presente' | 'ausente' | 'tardanza' | 'justificado') => {
    setStudents(prev => prev.map(s => ({ ...s, estado })));
  };

  // Guardar asistencia masiva
  const handleGuardar = async () => {
    if (!sectionId || !subjectId || !fecha) {
      toast({
        title: 'Error',
        description: 'Selecciona sección, materia y fecha',
        variant: 'destructive',
      });
      return;
    }

    const sinMarcar = students.filter(s => !s.estado);
    if (sinMarcar.length > 0) {
      toast({
        title: 'Advertencia',
        description: `Hay ${sinMarcar.length} estudiantes sin marcar asistencia`,
        variant: 'destructive',
      });
      return;
    }

    // Obtener teacher_id del usuario actual (asumimos que está en localStorage o contexto)
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    const teacherId = user?.teacherId || user?.teacher_id || 1; // Fallback

    setSaving(true);
    try {
      const bulkData: BulkAttendanceData = {
        section_id: parseInt(sectionId),
        subject_id: parseInt(subjectId),
        teacher_id: teacherId,
        fecha: fecha,
        attendances: students.map(s => ({
          student_id: s.id,
          estado: s.estado!,
          observaciones: s.observaciones || undefined,
        })),
      };

      await bulkCreateAttendance(bulkData);
      
      toast({
        title: 'Éxito',
        description: `Asistencia guardada para ${students.length} estudiantes`,
      });
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Error al guardar asistencia',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const selectedSection = sections.find(s => String(s.id) === sectionId);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ClipboardList className="h-6 w-6" />
            Control de Asistencia
          </h1>
          <p className="text-muted-foreground">
            Registro diario de asistencia por sección y materia
          </p>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Seleccionar Clase
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Fecha
              </Label>
              <Input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Sección
              </Label>
              <Select 
                value={sectionId} 
                onValueChange={(val) => {
                  setSectionId(val);
                  setSubjectId('');
                }}
                disabled={loadingSections}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar sección..." />
                </SelectTrigger>
                <SelectContent>
                  {sections.map((s) => (
                    <SelectItem key={s.id} value={String(s.id)}>
                      {s.nivel} - {s.curso}° "{s.paralelo}" ({s.turno})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Materia
              </Label>
              <Select 
                value={subjectId} 
                onValueChange={setSubjectId}
                disabled={!sectionId || subjects.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar materia..." />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((sub) => (
                    <SelectItem key={sub.id} value={String(sub.id)}>
                      {sub.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>&nbsp;</Label>
              <Button 
                onClick={handleGuardar} 
                disabled={saving || students.length === 0 || stats.sinMarcar > 0}
                className="w-full"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Guardar Asistencia
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estadísticas */}
      {students.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-xs text-muted-foreground">Total</div>
            </CardContent>
          </Card>
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-700">{stats.presentes}</div>
              <div className="text-xs text-green-600">Presentes</div>
            </CardContent>
          </Card>
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-700">{stats.ausentes}</div>
              <div className="text-xs text-red-600">Ausentes</div>
            </CardContent>
          </Card>
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-700">{stats.tardanzas}</div>
              <div className="text-xs text-yellow-600">Tardanzas</div>
            </CardContent>
          </Card>
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-700">{stats.justificados}</div>
              <div className="text-xs text-blue-600">Justificados</div>
            </CardContent>
          </Card>
          <Card className="border-gray-200 bg-gray-50">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-gray-700">{stats.sinMarcar}</div>
              <div className="text-xs text-gray-600">Sin marcar</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Acciones rápidas */}
      {students.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium mr-2">Marcar todos como:</span>
              <Button 
                variant="outline" 
                size="sm" 
                className="border-green-300 text-green-700 hover:bg-green-50"
                onClick={() => handleMarcarTodos('presente')}
              >
                <CheckCircle2 className="h-4 w-4 mr-1" />
                Presentes
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                className="border-red-300 text-red-700 hover:bg-red-50"
                onClick={() => handleMarcarTodos('ausente')}
              >
                <XCircle className="h-4 w-4 mr-1" />
                Ausentes
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                className="border-yellow-300 text-yellow-700 hover:bg-yellow-50"
                onClick={() => handleMarcarTodos('tardanza')}
              >
                <AlertCircle className="h-4 w-4 mr-1" />
                Tardanza
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de estudiantes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Lista de Estudiantes
            {selectedSection && (
              <Badge variant="secondary" className="ml-2">
                {selectedSection.nivel} - {selectedSection.curso}° "{selectedSection.paralelo}"
              </Badge>
            )}
          </CardTitle>
          {selectedSection && (
            <CardDescription>
              {fecha} - {subjects.find(s => String(s.id) === subjectId)?.nombre || 'Sin materia'}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          {loadingStudents ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : !sectionId || !subjectId ? (
            <div className="text-center py-12 text-muted-foreground">
              <ClipboardList className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Selecciona una sección y materia para ver los estudiantes</p>
            </div>
          ) : students.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay estudiantes en esta sección</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">#</TableHead>
                  <TableHead>Código</TableHead>
                  <TableHead>Estudiante</TableHead>
                  <TableHead className="text-center">Estado</TableHead>
                  <TableHead>Observaciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student, index) => (
                  <TableRow key={student.id} className={!student.estado ? 'bg-yellow-50' : ''}>
                    <TableCell className="font-medium">{index + 1}</TableCell>
                    <TableCell className="font-mono text-sm">{student.codigo}</TableCell>
                    <TableCell className="font-medium">
                      {student.apellidos}, {student.nombres}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-center gap-1">
                        {estadoOptions.map((opt) => (
                          <Button
                            key={opt.value}
                            variant={student.estado === opt.value ? 'default' : 'outline'}
                            size="sm"
                            className={`w-8 h-8 p-0 ${
                              student.estado === opt.value 
                                ? getEstadoColor(opt.value)
                                : ''
                            }`}
                            onClick={() => handleEstadoChange(
                              student.id, 
                              opt.value as 'presente' | 'ausente' | 'tardanza' | 'justificado'
                            )}
                            title={opt.label}
                          >
                            {opt.value === 'presente' && <UserCheck className="h-4 w-4" />}
                            {opt.value === 'ausente' && <UserX className="h-4 w-4" />}
                            {opt.value === 'tardanza' && <Clock className="h-4 w-4" />}
                            {opt.value === 'justificado' && <CheckCircle2 className="h-4 w-4" />}
                          </Button>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Textarea
                        value={student.observaciones || ''}
                        onChange={(e) => handleObservacionChange(student.id, e.target.value)}
                        placeholder="Observaciones..."
                        className="h-8 min-h-8 resize-none text-sm"
                        rows={1}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Asistencia;
