// src/pages/teacher/Clases.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getMyTeacherSections, getMyTeacherSectionStudents, type TeacherAssignedSection } from '@/services/teachersApi';
import { getTeacherCreatedTasks, saveTeacherCreatedTask, type TeacherCreatedTask } from '@/services/teacherTasksStore';
import { getClassAttendance, saveClassAttendance, type AttendanceStatus } from '@/services/teacherAttendanceApi';

// Importaciones de Shadcn UI
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

// Importaciones de iconos de lucide-react
import {
  BookOpen, User, Award, ClipboardList, CalendarDays, Users, Info, AlertCircle,
  Loader2, WifiOff, FileText, BarChart3, MessageSquare, MoreVertical, CheckCircle,
  XCircle, Clock, Eye, Plus, Edit, Trash2, Download, Search, Filter, MapPin,
  GraduationCap, School, BookMarked, Target, ArrowRight
} from 'lucide-react';

// --- Tipos de Datos ---
interface Alumno {
  id: number;
  nombre: string;
  apellido: string;
  grado: string;
  grupo: string;
  asistencia: number;
  promedio: number;
}

interface MateriaDocente {
  id: number;
  sectionId: number;
  nombre: string;
  grado: string;
  grupo: string;
  docenteId: number;
  horario: string;
  aula: string;
  cicloEscolar: string;
  area: string;
}

type TareaDetalle = TeacherCreatedTask;

interface EntregaTarea {
  id: number;
  tareaId: number;
  alumnoId: number;
  fechaEntregaReal?: string;
  calificacion?: number;
  estado: 'entregado' | 'pendiente' | 'atrasado';
  archivoUrl?: string;
  comentarioDocente?: string;
}

interface ClaseResumen extends MateriaDocente {
  subjectId: number;
  numAlumnos: number;
  totalActividades: number;
  actividadesPendientes: number;
  actividadesAtrasadas: number;
  promedioGeneral: number;
  promedioAsistencia: number;
  alumnosEnRiesgo: number;
  datosAcademicosDisponibles: boolean;
}

// --- Componentes de Modales ---
const ModalCalificaciones = ({ clase, alumnos, entregas, onClose }: { 
  clase: ClaseResumen; 
  alumnos: Alumno[];
  entregas: EntregaTarea[];
  onClose: () => void;
}) => {
  const [calificaciones, setCalificaciones] = useState<Record<number, number>>({});
  const [comentarios, setComentarios] = useState<Record<number, string>>({});

  // Inicializar calificaciones existentes
  useEffect(() => {
    const califs: Record<number, number> = {};
    const coments: Record<number, string> = {};
    
    alumnos.forEach(alumno => {
      const entrega = entregas.find(e => e.alumnoId === alumno.id && e.calificacion !== undefined);
      if (entrega) {
        califs[alumno.id] = entrega.calificacion!;
        if (entrega.comentarioDocente) {
          coments[alumno.id] = entrega.comentarioDocente;
        }
      }
    });
    setCalificaciones(califs);
    setComentarios(coments);
  }, [alumnos, entregas]);

  const handleCalificacionChange = (alumnoId: number, valor: string) => {
    const numValor = parseInt(valor);
    setCalificaciones(prev => ({
      ...prev,
      [alumnoId]: isNaN(numValor) ? 0 : Math.max(0, Math.min(100, numValor))
    }));
  };

  const handleComentarioChange = (alumnoId: number, valor: string) => {
    setComentarios(prev => ({
      ...prev,
      [alumnoId]: valor
    }));
  };

  const guardarCalificaciones = () => {
    alert('Las calificaciones aún no se guardaron: este módulo todavía no está conectado al servicio de notas.');
  };

  const exportarCalificaciones = () => {
    const data = alumnos.map(alumno => ({
      estudiante: `${alumno.nombre} ${alumno.apellido}`,
      calificacion: calificaciones[alumno.id] || 'Sin calificar',
      comentario: comentarios[alumno.id] || '',
      asistencia: 'Sin datos'
    }));
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + ["Estudiante,Calificación,Comentario,Asistencia", ...data.map(d => 
          `"${d.estudiante}",${d.calificacion},"${d.comentario}",${d.asistencia}`
        )].join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `calificaciones-${clase.nombre}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Award className="h-6 w-6 text-green-600" />
            Gestión de Calificaciones - {clase.nombre}
          </DialogTitle>
          <DialogDescription>
            {clase.grado}° {clase.grupo} - {alumnos.length} estudiantes
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="text-center p-2 bg-blue-50 rounded">
                <div className="font-bold text-blue-600">{clase.datosAcademicosDisponibles ? clase.promedioGeneral : 'Sin datos'}</div>
                <div>Promedio General</div>
              </div>
              <div className="text-center p-2 bg-green-50 rounded">
                <div className="font-bold text-green-600">
                  {entregas.length ? alumnos.filter(a => (calificaciones[a.id] || a.promedio) >= 70).length : 'Sin datos'}
                </div>
                <div>Aprobados</div>
              </div>
              <div className="text-center p-2 bg-red-50 rounded">
                <div className="font-bold text-red-600">
                  {entregas.length ? alumnos.filter(a => (calificaciones[a.id] || a.promedio) < 70).length : 'Sin datos'}
                </div>
                <div>En Riesgo</div>
              </div>
            </div>
            <Button onClick={exportarCalificaciones} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>

          <div className="space-y-3">
            {alumnos.map(alumno => (
              <Card key={alumno.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold">{alumno.nombre} {alumno.apellido}</h4>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>Asistencia: Sin datos</span>
                            <span>Promedio Actual: Sin datos</span>
                          </div>
                        </div>
                      </div>
                      
                      <Textarea
                        placeholder="Agregar comentario para el estudiante..."
                        value={comentarios[alumno.id] || ''}
                        onChange={(e) => handleComentarioChange(alumno.id, e.target.value)}
                        className="mt-2 text-sm"
                        rows={2}
                      />
                    </div>
                    
                    <div className="flex items-center gap-3 ml-4">
                      <div className="text-right">
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={calificaciones[alumno.id] || ''}
                          onChange={(e) => handleCalificacionChange(alumno.id, e.target.value)}
                          className="w-20 text-center"
                          placeholder="0-100"
                        />
                        <div className="text-xs text-muted-foreground mt-1">
                          {calificaciones[alumno.id] ? `${calificaciones[alumno.id]}%` : 'Sin calificar'}
                        </div>
                      </div>
                      <Badge className={!entregas.length ? 'bg-gray-100 text-gray-700' : (
                        (calificaciones[alumno.id] || alumno.promedio) >= 80 ? 'bg-green-100 text-green-700' :
                        (calificaciones[alumno.id] || alumno.promedio) >= 70 ? 'bg-yellow-100 text-yellow-700' : 
                        'bg-red-100 text-red-700'
                      )}>
                        {!entregas.length ? 'Sin notas' : ((calificaciones[alumno.id] || alumno.promedio) >= 70 ? 'Aprobado' : 'En Riesgo')}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={guardarCalificaciones}>Guardar Todas las Calificaciones</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const ModalTareas = ({ clase, tareas, teacherId, teacherName, onCreate, onClose }: {
  clase: ClaseResumen;
  tareas: TareaDetalle[];
  teacherId: string;
  teacherName: string;
  onCreate: (task: TeacherCreatedTask) => void;
  onClose: () => void;
}) => {
  const [nuevaTarea, setNuevaTarea] = useState({
    titulo: '',
    descripcion: '',
    fechaEntrega: '',
    tipo: 'tarea' as 'tarea' | 'examen' | 'proyecto' | 'investigación',
    ponderacion: 0,
    instrucciones: ''
  });

  const tareasClase = tareas.filter(t => t.materiaId === clase.id);

  const handleCrearTarea = () => {
    if (!nuevaTarea.titulo || !nuevaTarea.fechaEntrega) {
      alert('Por favor completa los campos requeridos');
      return;
    }

    const today = new Date();
    const fechaAsignacion = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    onCreate({
      id: Date.now(),
      materiaId: clase.id,
      sectionId: clase.sectionId,
      teacherId,
      teacherName,
      materiaNombre: clase.nombre,
      grado: clase.grado,
      grupo: clase.grupo,
      nivel: localStorage.getItem('nivel') || '',
      year: clase.cicloEscolar,
      ...nuevaTarea,
      fechaAsignacion,
      estado: 'abierta',
    });
    alert('Tarea creada correctamente. Ya aparece en Mis tareas.');
    setNuevaTarea({ titulo: '', descripcion: '', fechaEntrega: '', tipo: 'tarea', ponderacion: 0, instrucciones: '' });
  };

  const getEstadoBadge = (estado: string) => {
    return estado === 'abierta' 
      ? <Badge className="bg-green-100 text-green-700">Activa</Badge>
      : <Badge variant="secondary">Cerrada</Badge>;
  };

  const getTipoBadge = (tipo: string) => {
    const config = {
      tarea: { color: 'bg-blue-100 text-blue-700', icon: '📝' },
      examen: { color: 'bg-red-100 text-red-700', icon: '📋' },
      proyecto: { color: 'bg-purple-100 text-purple-700', icon: '💼' },
      investigación: { color: 'bg-orange-100 text-orange-700', icon: '🔍' }
    };
    const { color, icon } = config[tipo as keyof typeof config] || config.tarea;
    return <Badge className={color}>{icon} {tipo.charAt(0).toUpperCase() + tipo.slice(1)}</Badge>;
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ClipboardList className="h-6 w-6 text-blue-600" />
            Gestión de Tareas - {clase.nombre}
          </DialogTitle>
          <DialogDescription>
            {clase.grado}° {clase.grupo} - Crear y gestionar actividades
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Formulario de Nueva Tarea */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Crear Nueva Tarea
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Título de la Tarea *</label>
                <Input
                  placeholder="Ej: Guía de Ejercicios de Álgebra"
                  value={nuevaTarea.titulo}
                  onChange={(e) => setNuevaTarea({...nuevaTarea, titulo: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Descripción</label>
                <Textarea
                  placeholder="Describe la tarea..."
                  value={nuevaTarea.descripcion}
                  onChange={(e) => setNuevaTarea({...nuevaTarea, descripcion: e.target.value})}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Instrucciones</label>
                <Textarea
                  placeholder="Instrucciones específicas para los estudiantes..."
                  value={nuevaTarea.instrucciones}
                  onChange={(e) => setNuevaTarea({...nuevaTarea, instrucciones: e.target.value})}
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Fecha de Entrega *</label>
                  <Input
                    type="date"
                    value={nuevaTarea.fechaEntrega}
                    onChange={(e) => setNuevaTarea({...nuevaTarea, fechaEntrega: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Ponderación</label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    placeholder="0-100"
                    value={nuevaTarea.ponderacion}
                    onChange={(e) => setNuevaTarea({...nuevaTarea, ponderacion: Number(e.target.value)})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Tipo de Tarea</label>
                <Select value={nuevaTarea.tipo} onValueChange={(value: any) => setNuevaTarea({...nuevaTarea, tipo: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tarea">Tarea</SelectItem>
                    <SelectItem value="examen">Examen</SelectItem>
                    <SelectItem value="proyecto">Proyecto</SelectItem>
                    <SelectItem value="investigación">Investigación</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button className="w-full" onClick={handleCrearTarea}>
                <Plus className="h-4 w-4 mr-2" />
                Crear Tarea
              </Button>
            </CardContent>
          </Card>

          {/* Lista de Tareas Existentes */}
          <Card>
            <CardHeader>
              <CardTitle>Tareas Asignadas</CardTitle>
              <CardDescription>
                {tareasClase.length} tareas en total
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {!tareasClase.length && <p className="text-sm text-muted-foreground">No hay actividades registradas para esta materia.</p>}
                {tareasClase.map(tarea => (
                  <div key={tarea.id} className="flex items-start justify-between p-4 border rounded-lg">
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`w-3 h-3 rounded-full mt-2 ${
                        tarea.estado === 'abierta' ? 'bg-green-500' : 'bg-gray-500'
                      }`} />
                      <div className="flex-1">
                        <h4 className="font-semibold">{tarea.titulo}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{tarea.descripcion}</p>
                        {tarea.instrucciones && (
                          <p className="text-xs text-blue-600 mt-1">{tarea.instrucciones}</p>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          {getTipoBadge(tarea.tipo)}
                          <span>Entrega: {new Date(tarea.fechaEntrega).toLocaleDateString('es-BO')}</span>
                          <span>Ponderación: {tarea.ponderacion}%</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      {getEstadoBadge(tarea.estado)}
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cerrar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const ModalAsistencia = ({ clase, alumnos, teacherId, onClose }: {
  clase: ClaseResumen;
  alumnos: Alumno[];
  teacherId: number;
  onClose: () => void;
}) => {
  const [asistencias, setAsistencias] = useState<Record<number, AttendanceStatus>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fecha, setFecha] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  });

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getClassAttendance(clase.sectionId, clase.subjectId, fecha)
      .then((records) => { if (!cancelled) setAsistencias(Object.fromEntries(records.map((record) => [record.student_id, record.estado]))); })
      .catch((error) => { console.error('No se pudo cargar la asistencia de esta clase:', error); if (!cancelled) setAsistencias({}); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [clase.sectionId, clase.subjectId, fecha]);

  const marcarAsistencia = (alumnoId: number, estado: AttendanceStatus) => {
    setAsistencias(prev => ({
      ...prev,
      [alumnoId]: estado
    }));
  };

  const guardarAsistencia = async () => {
    const faltantes = alumnos.filter((alumno) => !asistencias[alumno.id]).length;
    if (faltantes) { alert(`Marca la asistencia de todos los estudiantes. Faltan ${faltantes}.`); return; }
    if (!teacherId) { alert('No se encontró el docente de esta sesión. Vuelve a iniciar sesión.'); return; }
    setSaving(true);
    try {
      await saveClassAttendance({ section_id: clase.sectionId, subject_id: clase.subjectId, teacher_id: teacherId, fecha, attendances: alumnos.map((alumno) => ({ student_id: alumno.id, estado: asistencias[alumno.id] })) });
      alert('La asistencia se guardó correctamente.');
      onClose();
    } catch (error: any) {
      console.error('No se pudo guardar la asistencia:', error);
      alert(error.response?.data?.message || 'No se pudo guardar la asistencia. Revisa tus permisos y vuelve a intentar.');
    } finally { setSaving(false); }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'presente': return 'text-green-600 bg-green-50 border-green-200';
      case 'ausente': return 'text-red-600 bg-red-50 border-red-200';
      case 'tardanza': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const estadisticas = useMemo(() => {
    const total = alumnos.length;
    const presentes = Object.values(asistencias).filter(e => e === 'presente').length;
    const ausentes = Object.values(asistencias).filter(e => e === 'ausente').length;
    const tardanzas = Object.values(asistencias).filter(e => e === 'tardanza').length;
    
    return { total, presentes, ausentes, tardanzas };
  }, [asistencias, alumnos]);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-6 w-6 text-blue-600" />
            Registro de Asistencia - {clase.nombre}
          </DialogTitle>
          <DialogDescription>
            {clase.grado}° {clase.grupo} · {clase.nombre}
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-3"><label htmlFor="attendance-date" className="text-sm font-medium">Fecha</label><Input id="attendance-date" type="date" value={fecha} onChange={(event) => setFecha(event.target.value)} max={new Date().toISOString().slice(0, 10)} className="w-auto" /></div>

        {/* Estadísticas Rápidas */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{estadisticas.total}</div>
            <div className="text-sm text-blue-700">Total</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{estadisticas.presentes}</div>
            <div className="text-sm text-green-700">Presentes</div>
          </div>
          <div className="text-center p-3 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">{estadisticas.tardanzas}</div>
            <div className="text-sm text-yellow-700">Tardanzas</div>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">{estadisticas.ausentes}</div>
            <div className="text-sm text-red-700">Ausentes</div>
          </div>
        </div>

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {loading ? <p className="py-5 text-center text-sm text-muted-foreground">Cargando asistencias guardadas...</p> : alumnos.map(alumno => (
            <div key={alumno.id} className={`flex items-center justify-between p-3 border rounded-lg transition-colors ${
              getEstadoColor(asistencias[alumno.id] || '')
            }`}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-gray-600" />
                </div>
                <span className="font-medium">{alumno.nombre} {alumno.apellido}</span>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={asistencias[alumno.id] === 'presente' ? 'default' : 'outline'}
                  onClick={() => marcarAsistencia(alumno.id, 'presente')}
                  className="border-green-600 text-green-600 hover:bg-green-50"
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Presente
                </Button>
                <Button
                  size="sm"
                  variant={asistencias[alumno.id] === 'tardanza' ? 'default' : 'outline'}
                  onClick={() => marcarAsistencia(alumno.id, 'tardanza')}
                  className="border-yellow-600 text-yellow-600 hover:bg-yellow-50"
                >
                  <Clock className="h-4 w-4 mr-1" />
                  Tardanza
                </Button>
                <Button
                  size="sm"
                  variant={asistencias[alumno.id] === 'ausente' ? 'default' : 'outline'}
                  onClick={() => marcarAsistencia(alumno.id, 'ausente')}
                  className="border-red-600 text-red-600 hover:bg-red-50"
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Ausente
                </Button>
                <Button size="sm" variant={asistencias[alumno.id] === 'justificado' ? 'default' : 'outline'} onClick={() => marcarAsistencia(alumno.id, 'justificado')}>Justificado</Button>
              </div>
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>Cancelar</Button>
          <Button onClick={guardarAsistencia} disabled={loading || saving || alumnos.length === 0}>{saving ? 'Guardando...' : 'Guardar Asistencia'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const ModalEstadisticas = ({ clase, alumnos, tareas, entregas, onClose }: {
  clase: ClaseResumen;
  alumnos: Alumno[];
  tareas: TareaDetalle[];
  entregas: EntregaTarea[];
  onClose: () => void;
}) => {
  const tareasClase = tareas.filter(t => t.materiaId === clase.id);
  
  const estadisticasDetalladas = useMemo(() => {
    const entregasClase = entregas.filter(e => 
      tareasClase.some(t => t.id === e.tareaId) && 
      alumnos.some(a => a.id === e.alumnoId)
    );

    const calificaciones = entregasClase
      .filter(e => e.calificacion !== undefined)
      .map(e => e.calificacion!);

    const promedioCalificaciones = calificaciones.length > 0 
      ? Math.round(calificaciones.reduce((a, b) => a + b, 0) / calificaciones.length)
      : 0;

    const tareasCompletadas = tareasClase.filter(t => t.estado === 'cerrada').length;
    const tareasPendientes = tareasClase.filter(t => t.estado === 'abierta').length;

    return {
      promedioCalificaciones,
      tareasCompletadas,
      tareasPendientes,
      totalEntregas: entregasClase.length,
      entregasPendientes: alumnos.length * tareasPendientes - entregasClase.length
    };
  }, [clase, alumnos, tareas, entregas]);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-purple-600" />
            Estadísticas Detalladas - {clase.nombre}
          </DialogTitle>
          <DialogDescription>
            Análisis completo del rendimiento académico
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Resumen General */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{clase.numAlumnos}</div>
                <div className="text-sm text-muted-foreground">Estudiantes</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">Sin datos</div>
                <div className="text-sm text-muted-foreground">Promedio General</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">Sin datos</div>
                <div className="text-sm text-muted-foreground">Asistencia</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-orange-600">Sin datos</div>
                <div className="text-sm text-muted-foreground">En Riesgo</div>
              </CardContent>
            </Card>
          </div>

          {/* Distribución de Calificaciones */}
          <Card>
            <CardHeader>
              <CardTitle>Distribución de Calificaciones</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {!entregas.length && <p className="text-sm text-muted-foreground">No hay calificaciones registradas para mostrar.</p>}
                {alumnos.map(alumno => {
                  const calificacionesAlumno = entregas
                    .filter(e => e.alumnoId === alumno.id && e.calificacion !== undefined)
                    .map(e => e.calificacion!);
                  
                  const promedioAlumno = calificacionesAlumno.length > 0
                    ? Math.round(calificacionesAlumno.reduce((a, b) => a + b, 0) / calificacionesAlumno.length)
                    : 0;

                  return (
                    <div key={alumno.id} className="flex items-center justify-between">
                      <span className="font-medium">{alumno.nombre} {alumno.apellido}</span>
                      <div className="flex items-center gap-4">
                        <Progress 
                          value={promedioAlumno} 
                          className="w-32" 
                        />
                        <Badge className="bg-gray-100 text-gray-700">
                          {calificacionesAlumno.length ? promedioAlumno : 'Sin notas'}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Información de la Clase */}
          <Card>
            <CardHeader>
              <CardTitle>Información de la Clase</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>Aula: {clase.aula}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>Horario: {clase.horario}</span>
                </div>
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-muted-foreground" />
                  <span>Área: {clase.area}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-muted-foreground" />
                  <span>Ciclo: {clase.cicloEscolar}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cerrar</Button>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Exportar Reporte
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// --- Componente Principal ---
export default function TeacherClases() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [clases, setClases] = useState<ClaseResumen[]>([]);
  const [alumnosPorSeccion, setAlumnosPorSeccion] = useState<Record<number, Alumno[]>>({});
  const [modalAbierto, setModalAbierto] = useState<'calificaciones' | 'tareas' | 'asistencia' | 'estadisticas' | null>(null);
  const [claseSeleccionada, setClaseSeleccionada] = useState<ClaseResumen | null>(null);
  const [filtroGrado, setFiltroGrado] = useState('todos');
  const [busqueda, setBusqueda] = useState('');
  const nivel = String(localStorage.getItem('nivel') || '').toLowerCase();
  const year = String(new Date().getFullYear());
  const teacherName = [user?.teacher?.nombre, user?.teacher?.apellido].filter(Boolean).join(' ') || user?.name || 'Docente';

  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        if (!nivel) throw new Error('Selecciona un nivel desde el panel docente para ver tus clases.');
        const response = await getMyTeacherSections(year, nivel);
        const sections = response.data || [];
        const studentResults = await Promise.all(sections.map(async (section) => {
          const students = await getMyTeacherSectionStudents(section.id);
          return [section.id, students.map((student) => ({
            id: student.id,
            nombre: student.nombres || '',
            apellido: student.apellidos || '',
            grado: String(section.curso),
            grupo: section.paralelo,
            asistencia: 0,
            promedio: 0,
          }))] as const;
        }));
        if (cancelled) return;
        const studentsBySection: Record<number, Alumno[]> = {};
        studentResults.forEach(([sectionId, students]) => { studentsBySection[sectionId] = students; });
        setAlumnosPorSeccion(studentsBySection);
        const actualClasses = sections.flatMap((section: TeacherAssignedSection) =>
          section.assignments.map((assignment) => ({
            id: assignment.id,
            subjectId: assignment.subject_id,
            sectionId: section.id,
            nombre: assignment.subject?.nombre || 'Materia',
            grado: String(section.curso),
            grupo: section.paralelo,
            docenteId: Number(user?.teacherId ?? user?.id ?? 0),
            horario: 'Horario no registrado',
            aula: section.aula || 'Sin aula asignada',
            cicloEscolar: String(section.year),
            area: assignment.subject?.area || 'Área no registrada',
            numAlumnos: (studentResults.find(([sectionId]) => sectionId === section.id)?.[1] || []).length,
            totalActividades: 0,
            actividadesPendientes: 0,
            actividadesAtrasadas: 0,
            promedioGeneral: 0,
            promedioAsistencia: 0,
            alumnosEnRiesgo: 0,
            datosAcademicosDisponibles: false,
          } as ClaseResumen))
        );
        setClases(actualClasses);
      } catch (err: any) {
        if (!cancelled) setError(err.response?.data?.message || err.message || 'No se pudieron cargar tus clases.');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    fetchData();
    return () => { cancelled = true; };
  }, [nivel, year, user?.id, user?.teacherId]);

  // --- Lógica para resumen de clases ---
  const resumenClases = useMemo(() => {
    if (isLoading || error) return [];

    let clasesFiltradas = clases;

    // Aplicar filtros
    if (filtroGrado !== 'todos') {
      clasesFiltradas = clasesFiltradas.filter(m => m.grado === filtroGrado);
    }

    if (busqueda) {
      clasesFiltradas = clasesFiltradas.filter(m => 
        m.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        m.grupo.toLowerCase().includes(busqueda.toLowerCase()) ||
        m.area.toLowerCase().includes(busqueda.toLowerCase())
      );
    }

    return clasesFiltradas;
  }, [clases, isLoading, error, filtroGrado, busqueda]);

  const teacherId = String(user?.teacherId ?? user?.id ?? 'teacher');
  const [tareas, setTareas] = useState<TareaDetalle[]>(() => getTeacherCreatedTasks(teacherId));
  useEffect(() => {
    const refresh = () => setTareas(getTeacherCreatedTasks(teacherId));
    window.addEventListener('teacher-tasks-updated', refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener('teacher-tasks-updated', refresh);
      window.removeEventListener('storage', refresh);
    };
  }, [teacherId]);
  const crearTarea = (task: TeacherCreatedTask) => {
    saveTeacherCreatedTask(task);
    setTareas(getTeacherCreatedTasks(teacherId));
  };
  const entregas: EntregaTarea[] = [];
  const alumnosDeClase = (clase: ClaseResumen | null) => clase ? (alumnosPorSeccion[clase.sectionId] || []) : [];

  // --- Handlers para modales ---
  const abrirModal = (tipo: 'calificaciones' | 'tareas' | 'asistencia' | 'estadisticas', clase: ClaseResumen) => {
    setClaseSeleccionada(clase);
    setModalAbierto(tipo);
  };

  const cerrarModal = () => {
    setModalAbierto(null);
    setClaseSeleccionada(null);
  };

  // --- Renderizado ---
  if (error) {
    return (
      <div className="p-6 text-center text-red-800 bg-red-50 border border-red-300 rounded-lg m-4 space-y-4">
        <WifiOff className="h-16 w-16 mx-auto text-red-600" />
        <h2 className="text-2xl font-bold">Error de Conexión</h2>
        <p className="text-red-700">{error}</p>
        <Button onClick={() => window.location.reload()} variant="destructive">
          <Loader2 className="mr-2 h-4 w-4" />
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <BookOpen className="h-7 w-7 text-blue-600" />
            Mis Clases - UE Privada Técnico Humanistico Ebenezer

          </h1>
          <p className="text-muted-foreground">
            Gestión académica para el ciclo escolar {year} · {nivel.charAt(0).toUpperCase() + nivel.slice(1)}
            <span className="block text-sm mt-1">Docente: {teacherName}</span>
          </p>
        </div>
      </div>

      {/* Filtros y Búsqueda */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar por materia, grupo o área..."
                className="pl-10"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select value={filtroGrado} onValueChange={setFiltroGrado}>
                <SelectTrigger className="w-[140px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filtrar por grado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los grados</SelectItem>
                  {Array.from(new Set(clases.map(m => m.grado))).sort().map(grado => (
                    <SelectItem key={grado} value={grado}>{grado}°</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator className="my-6" />

      {/* Lista de Clases */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="h-60">
              <CardHeader>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-10 w-full mt-4" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : resumenClases.length === 0 ? (
        <Card className="text-center py-12 text-muted-foreground">
          <Info className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <p className="text-lg font-medium">{clases.length === 0 ? `No tienes cursos asignados para ${nivel || 'este nivel'} en ${year}.` : 'No se encontraron clases con los filtros aplicados.'}</p>
          <p className="mt-2 text-sm">{clases.length === 0 ? 'Solicita a administración que revise tus asignaciones.' : 'Intenta ajustar los criterios de búsqueda.'}</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resumenClases.map(clase => (
            <Card key={`${clase.id}-${clase.grupo}`} className="group hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between mb-2">
                  <CardTitle className="text-xl font-semibold flex items-center gap-2">
                    <BookOpen className="h-6 w-6 text-blue-600" />
                    {clase.nombre}
                  </CardTitle>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                    <Users className="h-3 w-3 mr-1" />
                    {clase.grado}° {clase.grupo}
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <CardDescription className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {clase.numAlumnos} Estudiantes
                  </CardDescription>
                  <CardDescription className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Aula {clase.aula}
                  </CardDescription>
                  <CardDescription className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {clase.horario}
                  </CardDescription>
                </div>
              </CardHeader>

              <CardContent>
                {/* Estadísticas Rápidas */}
                <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Promedio</span>
                      <span className={`font-bold ${
                        !clase.datosAcademicosDisponibles ? 'text-muted-foreground' :
                        clase.promedioGeneral >= 80 ? 'text-green-600' : 
                        clase.promedioGeneral >= 70 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {clase.datosAcademicosDisponibles ? clase.promedioGeneral : 'Sin datos'}
                      </span>
                    </div>
                    <Progress value={clase.datosAcademicosDisponibles ? clase.promedioGeneral : 0} className="h-1" />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Asistencia</span>
                      <span className="font-bold text-blue-600">Sin datos</span>
                    </div>
                    <Progress value={0} className="h-1" />
                  </div>
                </div>

                {/* Indicadores de Tareas */}
                <div className="flex justify-between items-center text-xs text-muted-foreground mb-4">
                  <span>Actividades y resultados: sin datos registrados</span>
                </div>

                {/* Menú de Acciones Mejorado */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full">
                      <MoreVertical className="h-4 w-4 mr-2" />
                      Acciones
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-64">
                    <DropdownMenuItem onClick={() => abrirModal('calificaciones', clase)}>
                      <Award className="h-4 w-4 mr-2 text-green-600" />
                      Gestión de Calificaciones
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => abrirModal('tareas', clase)}>
                      <ClipboardList className="h-4 w-4 mr-2 text-blue-600" />
                      Gestión de Tareas
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => abrirModal('asistencia', clase)}>
                      <User className="h-4 w-4 mr-2 text-orange-600" />
                      Tomar Asistencia
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => abrirModal('estadisticas', clase)}>
                      <BarChart3 className="h-4 w-4 mr-2 text-purple-600" />
                      Ver Estadísticas
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <MessageSquare className="h-4 w-4 mr-2 text-gray-600" />
                      Comunicar a Padres
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Download className="h-4 w-4 mr-2 text-gray-600" />
                      Exportar Reportes
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modales */}
      {modalAbierto === 'calificaciones' && claseSeleccionada && (
        <ModalCalificaciones
          clase={claseSeleccionada}
          alumnos={alumnosDeClase(claseSeleccionada)}
          entregas={entregas}
          onClose={cerrarModal}
        />
      )}

      {modalAbierto === 'tareas' && claseSeleccionada && (
        <ModalTareas
          clase={claseSeleccionada}
          tareas={tareas}
          teacherId={teacherId}
          teacherName={user?.name || 'Docente'}
          onCreate={crearTarea}
          onClose={cerrarModal}
        />
      )}

      {modalAbierto === 'asistencia' && claseSeleccionada && (
        <ModalAsistencia
          clase={claseSeleccionada}
          alumnos={alumnosDeClase(claseSeleccionada)}
          teacherId={Number(user?.teacherId ?? user?.teacher?.id ?? 0)}
          onClose={cerrarModal}
        />
      )}

      {modalAbierto === 'estadisticas' && claseSeleccionada && (
        <ModalEstadisticas
          clase={claseSeleccionada}
          alumnos={alumnosDeClase(claseSeleccionada)}
          tareas={tareas}
          entregas={entregas}
          onClose={cerrarModal}
        />
      )}
    </div>
  );
}
