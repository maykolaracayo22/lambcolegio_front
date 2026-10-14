// src/pages/admin/Asignaciones.tsx
// Gestión de Asignaciones (Carga Horaria) para todos los niveles educativos de Bolivia
// Sistema Educativo Plurinacional - Ley 070

import { useEffect, useMemo, useState, useCallback } from "react";
import axios from "axios";
import { API_BASE } from "@/lib/config";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus, Search, Edit, Trash2, RefreshCw, Eye, Loader2, Users, 
  BookOpen, User, Clock, Calendar, School, Waypoints, 
  CheckCircle, AlertTriangle, GraduationCap, Building
} from "lucide-react";

// Tipos
interface Section {
  id: number;
  year: string;
  nivel: 'inicial' | 'primaria' | 'secundaria';
  grado: string;
  paralelo: string;
  turno?: string;
  aula?: string;
}

interface Subject {
  id: number;
  nombre: string;
  codigo?: string;
  nivel?: string;
  area?: string;
}

interface LocalSubject {
  nombre?: string;
  nivel?: string;
  area?: string;
  activo?: boolean;
}

interface Teacher {
  id: number;
  nombre: string;
  apellido: string;
  nombres?: string;
  apellidos?: string;
  email?: string;
  estado: string;
  nro_rda?: string;
  estado_rda?: string;
  rda_numero?: string;
  rda_estado?: string;
  especialidad?: string;
}

interface Assignment {
  id: number;
  section_id: number;
  subject_id: number;
  teacher_id: number;
  dia?: string;
  inicio?: string;
  fin?: string;
  aula?: string;
  estado: string;
  year?: string;
  section?: Section;
  subject?: Subject;
  teacher?: Teacher;
}

type NivelKey = 'inicial' | 'primaria' | 'secundaria';

const API_URL = API_BASE;
const YEAR_KEY = "adm:year";

const NIVELES: NivelKey[] = ['inicial', 'primaria', 'secundaria'];
const DIAS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];

const NIVEL_CONFIG: Record<NivelKey, { label: string; color: string; bgColor: string; icon: string }> = {
  inicial: { label: "Educación Inicial", color: "text-pink-700", bgColor: "bg-pink-50 border-pink-200", icon: "🎨" },
  primaria: { label: "Educación Primaria", color: "text-blue-700", bgColor: "bg-blue-50 border-blue-200", icon: "📚" },
  secundaria: { label: "Educación Secundaria", color: "text-green-700", bgColor: "bg-green-50 border-green-200", icon: "🎓" },
};

// Helper de autenticación
const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return {
    'Authorization': `Bearer ${token}`,
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  };
};

// Laravel devuelve docentes paginados como { data: [...] } y usa nombres/apellidos,
// mientras esta pantalla necesita nombre/apellido para sus tarjetas y selectores.
function normalizeTeachersResponse(payload: unknown): Teacher[] {
  let value: unknown = payload;
  for (let depth = 0; depth < 3 && !Array.isArray(value); depth++) {
    if (!value || typeof value !== "object") return [];
    value = (value as { data?: unknown }).data;
  }

  if (!Array.isArray(value)) return [];

  return value
    .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === "object")
    .map((item) => ({
      id: Number(item.id),
      nombre: String(item.nombres ?? item.nombre ?? ""),
      apellido: String(item.apellidos ?? item.apellido ?? ""),
      nombres: String(item.nombres ?? item.nombre ?? ""),
      apellidos: String(item.apellidos ?? item.apellido ?? ""),
      email: typeof item.email === "string" ? item.email : undefined,
      estado: String(item.estado ?? (item.activo === false ? "inactivo" : "activo")),
      nro_rda: String(item.rda_numero ?? item.nro_rda ?? ""),
      estado_rda: String(item.rda_estado ?? item.estado_rda ?? ""),
      rda_numero: String(item.rda_numero ?? item.nro_rda ?? ""),
      rda_estado: String(item.rda_estado ?? item.estado_rda ?? ""),
      especialidad: typeof item.especialidad === "string" ? item.especialidad : undefined,
    }))
    .filter((teacher) => Number.isFinite(teacher.id) && teacher.id > 0);
}

function normalizeSubjectsResponse(payload: unknown): Subject[] {
  let value: unknown = payload;
  for (let depth = 0; depth < 3 && !Array.isArray(value); depth++) {
    if (!value || typeof value !== "object") return [];
    value = (value as { data?: unknown }).data;
  }

  if (!Array.isArray(value)) return [];

  return value
    .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === "object")
    .map((item) => ({
      id: Number(item.id),
      nombre: String(item.nombre ?? item.name ?? "").trim(),
      codigo: typeof item.codigo === "string" ? item.codigo : undefined,
      nivel: typeof item.nivel === "string" ? item.nivel.toLowerCase() : undefined,
      area: typeof item.area === "string" ? item.area : undefined,
    }))
    .filter((subject) => Number.isFinite(subject.id) && subject.id > 0 && subject.nombre.length > 0);
}

function subjectKey(subject: { nombre: string; nivel?: string; area?: string | null }): string {
  return `${subject.nombre.trim().toLocaleLowerCase()}|${subject.nivel?.toLowerCase() ?? ""}|${subject.area?.trim().toLocaleLowerCase() ?? ""}`;
}

async function loadAndSyncSubjects(nivel: NivelKey, headers: ReturnType<typeof getAuthHeaders>): Promise<Subject[]> {
  const response = await axios.get(`${API_URL}/subjects`, { headers });
  let subjects = normalizeSubjectsResponse(response.data);

  let localSubjects: LocalSubject[] = [];
  try {
    const stored = localStorage.getItem("adm:materias");
    const parsed: unknown = stored ? JSON.parse(stored) : [];
    if (Array.isArray(parsed)) localSubjects = parsed as LocalSubject[];
  } catch (error) {
    console.warn("No se pudo leer el catálogo local de materias:", error);
  }

  const localForLevel = new Map<string, { nombre: string; nivel: string; area: string | null }>();
  for (const subject of localSubjects) {
    const name = subject.nombre?.trim();
    if (!name || subject.activo === false || subject.nivel?.toLowerCase() !== nivel) continue;
    const candidate = { nombre: name, nivel, area: subject.area?.trim() || null };
    const key = subjectKey(candidate);
    if (!localForLevel.has(key)) localForLevel.set(key, candidate);
  }

  const existingKeys = new Set(subjects.map(subjectKey));
  for (const [key, subject] of localForLevel) {
    if (existingKeys.has(key)) continue;
    await axios.post(`${API_URL}/subjects`, subject, { headers });
    existingKeys.add(key);
  }

  if (localForLevel.size > 0) {
    const refreshed = await axios.get(`${API_URL}/subjects`, { headers });
    subjects = normalizeSubjectsResponse(refreshed.data);
  }

  return subjects;
}

// Modal de Carga Docente
function CargaDocenteModal({ 
  teacher, 
  assignments, 
  onClose 
}: { 
  teacher: Teacher; 
  assignments: Assignment[]; 
  onClose: () => void;
}) {
  const teacherAssignments = assignments.filter(a => a.teacher_id === teacher.id);
  
  // Agrupar por día
  const horarioPorDia: Record<string, Assignment[]> = {};
  DIAS.forEach(d => horarioPorDia[d] = []);
  teacherAssignments.forEach(a => {
    if (a.dia && horarioPorDia[a.dia]) {
      horarioPorDia[a.dia].push(a);
    }
  });
  
  // Agrupar por nivel
  const porNivel: Record<NivelKey, Assignment[]> = { inicial: [], primaria: [], secundaria: [] };
  teacherAssignments.forEach(a => {
    const n = a.section?.nivel || 'primaria';
    if (porNivel[n]) porNivel[n].push(a);
  });
  
  // Calcular horas
  const horasTotales = teacherAssignments.reduce((acc, a) => {
    if (a.inicio && a.fin) {
      const [h1, m1] = a.inicio.split(':').map(Number);
      const [h2, m2] = a.fin.split(':').map(Number);
      return acc + ((h2 * 60 + m2) - (h1 * 60 + m1)) / 60;
    }
    return acc;
  }, 0);

  // Suprimir warning de onClose no usado
  void onClose;

  return (
    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Carga Horaria: {teacher.nombre} {teacher.apellido}
        </DialogTitle>
        <DialogDescription>
          Vista detallada de las asignaciones del docente en todos los niveles
        </DialogDescription>
      </DialogHeader>

      {/* Resumen */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-sm text-muted-foreground">RDA</div>
            <div className="text-lg font-semibold flex items-center gap-1">
              {teacher.nro_rda || "Sin RDA"}
              <Badge variant={teacher.estado_rda === "VIGENTE" ? "default" : "destructive"} className="ml-1">
                {teacher.estado_rda || "N/A"}
              </Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-sm text-muted-foreground">Materias Asignadas</div>
            <div className="text-2xl font-bold text-blue-600">{teacherAssignments.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-sm text-muted-foreground">Horas Semanales</div>
            <div className="text-2xl font-bold text-green-600">{horasTotales.toFixed(1)}h</div>
          </CardContent>
        </Card>
      </div>

      {/* Resumen por Nivel */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {NIVELES.map(nivel => {
          const asig = porNivel[nivel] || [];
          const config = NIVEL_CONFIG[nivel];
          return (
            <Card key={nivel} className={`border ${asig.length > 0 ? config.bgColor : "opacity-50"}`}>
              <CardContent className="pt-3 pb-3">
                <div className={`font-semibold text-sm ${config.color}`}>
                  {config.icon} {config.label}
                </div>
                <div className="text-xs">
                  {asig.length > 0 ? (
                    <span className="font-medium">{asig.length} asignación(es)</span>
                  ) : (
                    "Sin asignaciones"
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Horario Visual */}
      <div className="mb-4">
        <h4 className="font-medium mb-2 flex items-center gap-2">
          <Calendar className="h-4 w-4" /> Horario Semanal
        </h4>
        <div className="grid grid-cols-5 gap-2">
          {DIAS.map(dia => (
            <Card key={dia} className="min-h-[150px]">
              <CardHeader className="py-2 bg-muted">
                <CardTitle className="text-sm text-center">{dia}</CardTitle>
              </CardHeader>
              <CardContent className="p-2 space-y-2">
                {horarioPorDia[dia].length === 0 ? (
                  <div className="text-xs text-muted-foreground text-center py-4">Sin clases</div>
                ) : (
                  horarioPorDia[dia].map((a, i) => {
                    const config = NIVEL_CONFIG[a.section?.nivel || 'primaria'];
                    return (
                      <div 
                        key={i}
                        className={`text-xs p-2 rounded border ${config.bgColor}`}
                      >
                        <div className="font-semibold truncate">{a.subject?.nombre}</div>
                        <div className="flex items-center gap-1 text-[10px] mt-1">
                          <Clock className="h-3 w-3" />
                          {a.inicio}-{a.fin}
                        </div>
                        <div className="text-[10px] mt-1 truncate">
                          {a.section?.grado} {a.section?.paralelo}
                        </div>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Lista Detallada */}
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nivel</TableHead>
              <TableHead>Sección</TableHead>
              <TableHead>Materia</TableHead>
              <TableHead>Día</TableHead>
              <TableHead>Horario</TableHead>
              <TableHead>Aula</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {teacherAssignments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  Este docente no tiene asignaciones
                </TableCell>
              </TableRow>
            ) : (
              teacherAssignments.map((a) => {
                const config = NIVEL_CONFIG[a.section?.nivel || 'primaria'];
                return (
                  <TableRow key={a.id}>
                    <TableCell>
                      <Badge variant="outline" className={config.bgColor}>
                        {(a.section?.nivel || 'primaria').toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{a.section?.grado} {a.section?.paralelo}</TableCell>
                    <TableCell>{a.subject?.nombre}</TableCell>
                    <TableCell>{a.dia || "—"}</TableCell>
                    <TableCell>{a.inicio} - {a.fin}</TableCell>
                    <TableCell>{a.aula || "—"}</TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </DialogContent>
  );
}

export default function AsignacionesAdmin() {
  const { toast } = useToast();
  const year = localStorage.getItem(YEAR_KEY) || String(new Date().getFullYear());

  // Estados de datos
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [subjectsLoadError, setSubjectsLoadError] = useState<string | null>(null);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [teachersLoadError, setTeachersLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Tab de nivel activo
  const [activeNivel, setActiveNivel] = useState<NivelKey>('primaria');

  // Filtros
  const [selectedSection, setSelectedSection] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal crear/editar
  const [showDialog, setShowDialog] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    nivel: 'primaria' as NivelKey,
    section_id: 0,
    subject_id: 0,
    teacher_id: 0,
    dia: "Lunes",
    inicio: "08:00",
    fin: "09:30",
    aula: "",
  });

  // Modal carga docente
  const [showCargaDialog, setShowCargaDialog] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);

  // Cargar datos
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const results = await Promise.allSettled([
        axios.get(`${API_URL}/assignments`, { headers: getAuthHeaders(), params: { year } }),
        axios.get(`${API_URL}/sections`, { headers: getAuthHeaders(), params: { year } }),
        loadAndSyncSubjects(activeNivel, getAuthHeaders()),
        axios.get(`${API_URL}/teachers`, { headers: getAuthHeaders() }),
      ]);

      const [assignmentsResult, sectionsResult, subjectsResult, teachersResult] = results;
      if (assignmentsResult.status === "fulfilled") {
        setAssignments(assignmentsResult.value.data.data || assignmentsResult.value.data || []);
      }
      if (sectionsResult.status === "fulfilled") {
        setSections(sectionsResult.value.data.data || sectionsResult.value.data || []);
      }
      if (subjectsResult.status === "fulfilled") {
        setSubjects(subjectsResult.value);
        setSubjectsLoadError(null);
      } else {
        setSubjects([]);
        const error = subjectsResult.reason as { response?: { data?: { message?: string } }; message?: string };
        setSubjectsLoadError(error.response?.data?.message || error.message || "No se pudo consultar /api/subjects");
      }
      if (teachersResult.status === "fulfilled") {
        const normalizedTeachers = normalizeTeachersResponse(teachersResult.value.data);
        setTeachers(normalizedTeachers);
        setTeachersLoadError(null);
        if (normalizedTeachers.length === 0) {
          console.info("La API respondió correctamente, pero no devolvió docentes.", teachersResult.value.data);
        }
      } else {
        setTeachers([]);
        const error = teachersResult.reason as { response?: { data?: { message?: string } }; message?: string };
        const message = error.response?.data?.message || error.message || "No se pudo consultar /api/teachers";
        setTeachersLoadError(message);
        console.error("Error cargando docentes:", teachersResult.reason);
      }

      const failedResults = results.filter((result) => result.status === "rejected");
      if (failedResults.length > 0) {
        const firstError = failedResults[0].status === "rejected" ? failedResults[0].reason : null;
        const err = firstError as { response?: { data?: { message?: string } } } | null;
        toast({
          title: "No se pudieron cargar todos los datos",
          description: err?.response?.data?.message || "Revisa la conexión y los permisos de la API.",
          variant: "destructive",
        });
      }
    } catch (error: unknown) {
      console.error("Error cargando datos:", error);
      const err = error as { response?: { data?: { message?: string } } };
      toast({
        title: "Error",
        description: err.response?.data?.message || "Error al cargar los datos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [year, activeNivel, toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Filtrar secciones por nivel activo
  const filteredSections = useMemo(() => 
    sections.filter(s => s.nivel === activeNivel), 
    [sections, activeNivel]
  );

  // Auto-seleccionar primera sección cuando cambia el nivel
  useEffect(() => {
    if (filteredSections.length > 0) {
      setSelectedSection(filteredSections[0].id);
    } else {
      setSelectedSection(null);
    }
  }, [filteredSections]);

  // Filtrar asignaciones por sección y búsqueda
  const filteredAssignments = useMemo(() => {
    let result = assignments;
    if (selectedSection) {
      result = result.filter(a => a.section_id === selectedSection);
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(a =>
        a.teacher?.nombre?.toLowerCase().includes(term) ||
        a.teacher?.apellido?.toLowerCase().includes(term) ||
        a.subject?.nombre?.toLowerCase().includes(term) ||
        a.aula?.toLowerCase().includes(term)
      );
    }
    return result;
  }, [assignments, selectedSection, searchTerm]);

  // Docentes elegibles (no inactivos)
  const eligibleTeachers = useMemo(() => 
    teachers.filter(t => t.estado !== "inactivo"), 
    [teachers]
  );

  // Estadísticas por nivel
  const statsByNivel = useMemo(() => {
    const stats: Record<NivelKey, { sections: number; assignments: number; teachers: Set<number> }> = {
      inicial: { sections: 0, assignments: 0, teachers: new Set() },
      primaria: { sections: 0, assignments: 0, teachers: new Set() },
      secundaria: { sections: 0, assignments: 0, teachers: new Set() },
    };

    sections.forEach(s => {
      if (stats[s.nivel]) stats[s.nivel].sections++;
    });

    assignments.forEach(a => {
      const nivel = a.section?.nivel || 'primaria';
      if (stats[nivel]) {
        stats[nivel].assignments++;
        stats[nivel].teachers.add(a.teacher_id);
      }
    });

    return stats;
  }, [sections, assignments]);

  // Carga por docente
  const teacherLoads = useMemo(() => {
    const loads: Record<number, { total: number; porNivel: Record<NivelKey, number> }> = {};
    teachers.forEach(t => {
      loads[t.id] = { total: 0, porNivel: { inicial: 0, primaria: 0, secundaria: 0 } };
    });
    assignments.forEach(a => {
      if (loads[a.teacher_id]) {
        loads[a.teacher_id].total++;
        const nivelAsig = a.section?.nivel || 'primaria';
        if (loads[a.teacher_id].porNivel[nivelAsig] !== undefined) {
          loads[a.teacher_id].porNivel[nivelAsig]++;
        }
      }
    });
    return loads;
  }, [teachers, assignments]);

  // Sección actual
  const currentSection = useMemo(() => 
    filteredSections.find(s => s.id === selectedSection), 
    [filteredSections, selectedSection]
  );

  // Abrir crear
  const openCreateDialog = () => {
    setEditingId(null);
    setFormData({
      nivel: activeNivel,
      section_id: selectedSection || 0,
      subject_id: 0,
      teacher_id: 0,
      dia: "Lunes",
      inicio: "08:00",
      fin: "09:30",
      aula: "",
    });
    setShowDialog(true);
  };

  // Abrir editar
  const openEditDialog = (assignment: Assignment) => {
    setEditingId(assignment.id);
    setFormData({
      nivel: assignment.section?.nivel || activeNivel,
      section_id: assignment.section_id,
      subject_id: assignment.subject_id,
      teacher_id: assignment.teacher_id,
      dia: assignment.dia || "Lunes",
      inicio: assignment.inicio || "08:00",
      fin: assignment.fin || "09:30",
      aula: assignment.aula || "",
    });
    setShowDialog(true);
  };

  // Secciones filtradas para el formulario
  const formSections = useMemo(() => 
    sections.filter(s => s.nivel === formData.nivel),
    [sections, formData.nivel]
  );

  const formSubjects = useMemo(() =>
    subjects.filter(subject => !subject.nivel || subject.nivel === formData.nivel),
    [subjects, formData.nivel]
  );

  // Guardar
  const handleSave = async () => {
    if (!formData.section_id || !formData.subject_id || !formData.teacher_id) {
      toast({ title: "Campos incompletos", description: "Selecciona sección, materia y docente", variant: "destructive" });
      return;
    }

    const teacher = teachers.find(t => t.id === formData.teacher_id);
    if (teacher && teacher.estado_rda !== "VIGENTE") {
      toast({ title: "RDA no vigente", description: `El docente ${teacher.nombre} ${teacher.apellido} no tiene RDA vigente`, variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      const payload = { 
        year, 
        section_id: formData.section_id,
        subject_id: formData.subject_id,
        teacher_id: formData.teacher_id,
        dia: formData.dia,
        inicio: formData.inicio,
        fin: formData.fin,
        aula: formData.aula,
        estado: "ACTIVO" 
      };

      if (editingId) {
        await axios.put(`${API_URL}/assignments/${editingId}`, payload, { headers: getAuthHeaders() });
        toast({ title: "Actualizado", description: "Asignación actualizada correctamente" });
      } else {
        await axios.post(`${API_URL}/assignments`, payload, { headers: getAuthHeaders() });
        toast({ title: "Creado", description: "Asignación creada correctamente" });
      }

      setShowDialog(false);
      loadData();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast({ title: "Error", description: err.response?.data?.message || "Error al guardar", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  // Eliminar
  const handleDelete = async (id: number) => {
    if (!confirm("¿Eliminar esta asignación?")) return;
    try {
      await axios.delete(`${API_URL}/assignments/${id}`, { headers: getAuthHeaders() });
      toast({ title: "Eliminado", description: "Asignación eliminada" });
      loadData();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast({ title: "Error", description: err.response?.data?.message || "Error al eliminar", variant: "destructive" });
    }
  };

  // Ver carga docente
  const openCargaDocente = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setShowCargaDialog(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2">Cargando asignaciones...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Waypoints className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold">Asignaciones de Carga Horaria — Gestión {year}</h1>
        </div>
        <Button variant="outline" onClick={loadData}>
          <RefreshCw className="h-4 w-4 mr-2" /> Actualizar
        </Button>
      </div>

      {/* Resumen Global */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {NIVELES.map(nivel => {
          const config = NIVEL_CONFIG[nivel];
          const stats = statsByNivel[nivel];
          return (
            <Card 
              key={nivel} 
              className={`cursor-pointer transition-all hover:shadow-md ${activeNivel === nivel ? 'ring-2 ring-blue-500' : ''} ${config.bgColor}`}
              onClick={() => setActiveNivel(nivel)}
            >
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className={`font-semibold ${config.color}`}>
                      {config.icon} {config.label}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {stats.sections} secciones • {stats.assignments} asignaciones
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {stats.teachers.size} docentes asignados
                    </div>
                  </div>
                  <div className="text-right">
                    <GraduationCap className={`h-8 w-8 ${config.color} opacity-50`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Tabs por Nivel */}
      <Tabs value={activeNivel} onValueChange={(v) => setActiveNivel(v as NivelKey)}>
        <TabsList className="grid w-full grid-cols-3">
          {NIVELES.map(nivel => {
            const config = NIVEL_CONFIG[nivel];
            return (
              <TabsTrigger key={nivel} value={nivel} className="gap-2">
                <span>{config.icon}</span>
                <span className="hidden sm:inline">{config.label}</span>
                <span className="sm:hidden">{nivel.charAt(0).toUpperCase() + nivel.slice(1)}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {NIVELES.map(nivel => (
          <TabsContent key={nivel} value={nivel} className="space-y-4">
            {/* Filtros */}
            <Card>
              <CardContent className="p-4 flex flex-wrap gap-3 items-center">
                <Select 
                  value={selectedSection?.toString() || ""} 
                  onValueChange={(v) => setSelectedSection(parseInt(v))}
                >
                  <SelectTrigger className="w-[280px]">
                    <SelectValue placeholder="Seleccionar sección..." />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredSections.length === 0 ? (
                      <div className="px-3 py-2 text-sm text-muted-foreground flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" /> No hay secciones para {nivel}
                      </div>
                    ) : (
                      filteredSections.map((s) => (
                        <SelectItem key={s.id} value={s.id.toString()}>
                          {s.grado} - Paralelo {s.paralelo} ({s.turno || "Mañana"})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>

                <div className="relative flex-1 min-w-[200px]">
                  <Search className="h-4 w-4 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input 
                    className="pl-8" 
                    placeholder="Buscar docente, materia, aula..." 
                    value={searchTerm} 
                    onChange={(e) => setSearchTerm(e.target.value)} 
                  />
                </div>

                <Button onClick={openCreateDialog} disabled={!selectedSection}>
                  <Plus className="h-4 w-4 mr-2" /> Nueva Asignación
                </Button>
              </CardContent>
            </Card>

            {/* Panel Docentes */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Users className="h-5 w-5 text-blue-600" /> Docentes y Carga Horaria
                </CardTitle>
                <CardDescription>Click en "Ver Carga" para ver las asignaciones del docente en todos los niveles</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {eligibleTeachers.map(t => {
                    const carga = teacherLoads[t.id];
                    const tieneAsig = carga && carga.total > 0;
                    const rdaValido = t.estado_rda === "VIGENTE";
                    const tieneEnNivel = carga && carga.porNivel[nivel] > 0;

                    return (
                      <Card key={t.id} className={`border ${!rdaValido ? "border-yellow-300 bg-yellow-50" : ""} ${tieneEnNivel ? "ring-1 ring-blue-300" : ""}`}>
                        <CardContent className="p-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-sm truncate">{t.nombre} {t.apellido}</div>
                              <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                <span>RDA: {t.nro_rda || "Sin RDA"}</span>
                                <Badge 
                                  variant={rdaValido ? "default" : "outline"} 
                                  className={`text-[10px] px-1 ${!rdaValido ? "border-yellow-500 text-yellow-700" : "bg-green-100 text-green-700"}`}
                                >
                                  {t.estado_rda || "N/A"}
                                </Badge>
                              </div>
                              <div className="flex gap-1 mt-2 flex-wrap">
                                {NIVELES.map(n => (
                                  carga?.porNivel[n] > 0 && (
                                    <Badge 
                                      key={n} 
                                      variant="outline" 
                                      className={`text-[10px] px-1 ${NIVEL_CONFIG[n].bgColor}`}
                                    >
                                      {n.charAt(0).toUpperCase()}: {carga.porNivel[n]}
                                    </Badge>
                                  )
                                ))}
                                {!tieneAsig && <span className="text-xs text-muted-foreground">Sin asignaciones</span>}
                              </div>
                            </div>
                            <Button 
                              size="sm" 
                              variant={tieneAsig ? "default" : "outline"} 
                              className="text-xs ml-2" 
                              onClick={() => openCargaDocente(t)}
                            >
                              <Eye className="h-3 w-3 mr-1" /> Carga
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
                {eligibleTeachers.length === 0 && (
                  <div className="text-center text-muted-foreground py-8">
                    <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    {teachersLoadError ? (
                      <p>No se pudieron cargar los docentes: {teachersLoadError}</p>
                    ) : (
                      <p>No hay docentes activos. Ve a <strong>Docentes</strong> para agregar o activar uno.</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tabla Asignaciones */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <School className="h-5 w-5" />
                  Asignaciones: {currentSection ? `${currentSection.grado} - ${currentSection.paralelo}` : "Selecciona una sección"}
                </CardTitle>
                <CardDescription>{filteredAssignments.length} asignación(es) en esta sección</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Docente</TableHead>
                        <TableHead>Materia</TableHead>
                        <TableHead>Día</TableHead>
                        <TableHead>Horario</TableHead>
                        <TableHead>Aula</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAssignments.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                            {selectedSection ? "Sin asignaciones para esta sección" : "Selecciona una sección"}
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredAssignments.map((a) => (
                          <TableRow key={a.id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-gray-400" />
                                <span>{a.teacher?.nombre} {a.teacher?.apellido}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <BookOpen className="h-4 w-4 text-gray-400" />
                                <span>{a.subject?.nombre}</span>
                              </div>
                            </TableCell>
                            <TableCell><Badge variant="outline">{a.dia || "—"}</Badge></TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1 text-sm">
                                <Clock className="h-3 w-3" />
                                {a.inicio || "—"} - {a.fin || "—"}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Building className="h-3 w-3 text-gray-400" />
                                {a.aula || "—"}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={a.estado === "ACTIVO" ? "default" : "secondary"}>{a.estado}</Badge>
                            </TableCell>
                            <TableCell className="text-right space-x-1">
                              <Button variant="ghost" size="sm" onClick={() => openEditDialog(a)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" className="text-red-600" onClick={() => handleDelete(a.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Dialog Crear/Editar */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId ? "Editar Asignación" : "Nueva Asignación"}</DialogTitle>
            <DialogDescription>
              Asignar docente a una materia y sección específica
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nivel Educativo *</Label>
              <Select 
                value={formData.nivel} 
                onValueChange={(v) => setFormData({ ...formData, nivel: v as NivelKey, section_id: 0 })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {NIVELES.map(n => (
                    <SelectItem key={n} value={n}>
                      {NIVEL_CONFIG[n].icon} {NIVEL_CONFIG[n].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Sección *</Label>
              <Select 
                value={formData.section_id?.toString() || ""} 
                onValueChange={(v) => setFormData({ ...formData, section_id: parseInt(v) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar sección..." />
                </SelectTrigger>
                <SelectContent>
                  {formSections.length === 0 ? (
                    <div className="px-3 py-2 text-sm text-muted-foreground">
                      No hay secciones para este nivel
                    </div>
                  ) : (
                    formSections.map((s) => (
                      <SelectItem key={s.id} value={s.id.toString()}>
                        {s.grado} - Paralelo {s.paralelo}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Materia *</Label>
              <Select 
                value={formData.subject_id?.toString() || ""} 
                onValueChange={(v) => setFormData({ ...formData, subject_id: parseInt(v) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar materia..." />
                </SelectTrigger>
                <SelectContent>
                  {formSubjects.length === 0 ? (
                    <SelectItem value="no-subjects" disabled>
                      {subjectsLoadError ? "No se pudieron cargar las materias" : `No hay materias para ${formData.nivel}`}
                    </SelectItem>
                  ) : formSubjects.map((s) => (
                    <SelectItem key={s.id} value={s.id.toString()}>{s.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Docente *</Label>
              <Select 
                value={formData.teacher_id?.toString() || ""} 
                onValueChange={(v) => setFormData({ ...formData, teacher_id: parseInt(v) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar docente..." />
                </SelectTrigger>
                <SelectContent>
                  {eligibleTeachers.map((t) => (
                    <SelectItem key={t.id} value={t.id.toString()}>
                      {t.nombre} {t.apellido} — {t.nro_rda || "Sin RDA"} {t.estado_rda === "VIGENTE" ? "✅" : "⚠️"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Día</Label>
              <Select value={formData.dia} onValueChange={(v) => setFormData({ ...formData, dia: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DIAS.map((d) => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Hora Inicio</Label>
                <Input 
                  type="time" 
                  value={formData.inicio} 
                  onChange={(e) => setFormData({ ...formData, inicio: e.target.value })} 
                />
              </div>
              <div className="space-y-2">
                <Label>Hora Fin</Label>
                <Input 
                  type="time" 
                  value={formData.fin} 
                  onChange={(e) => setFormData({ ...formData, fin: e.target.value })} 
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Aula (opcional)</Label>
              <Input 
                placeholder="Ej: Aula 101" 
                value={formData.aula} 
                onChange={(e) => setFormData({ ...formData, aula: e.target.value })} 
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Guardando...</>
              ) : (
                <><CheckCircle className="h-4 w-4 mr-2" />{editingId ? "Actualizar" : "Crear"}</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Carga Docente */}
      <Dialog open={showCargaDialog} onOpenChange={setShowCargaDialog}>
        {selectedTeacher && (
          <CargaDocenteModal 
            teacher={selectedTeacher} 
            assignments={assignments}
            onClose={() => setShowCargaDialog(false)}
          />
        )}
      </Dialog>
    </div>
  );
}
