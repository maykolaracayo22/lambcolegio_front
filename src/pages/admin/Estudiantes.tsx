// src/pages/admin/Estudiantes.tsx
// Gestión de Estudiantes conectado a Backend Laravel

import { useEffect, useMemo, useState, useCallback, Component, ErrorInfo, ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { 
  Plus, Search, Edit, Trash2, RefreshCw, KeyRound, 
  Loader2, Users, GraduationCap, UserCheck, UserX, ChevronLeft, ChevronRight, Copy, AlertTriangle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { 
  getStudents, createStudent, updateStudent, deleteStudent,
  Student, StudentFormData, StudentFilters, PaginatedResponse
} from "@/services/studentApi";
import { getCursos, getParalelos } from "@/services/sectionsApi";
import { cursosPorNivel } from "@/lib/sections";
import type { NivelKey } from "@/lib/sections";

// Error Boundary para capturar errores
interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Error capturado por ErrorBoundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 text-center">
          <AlertTriangle className="h-16 w-16 mx-auto text-red-500 mb-4" />
          <h2 className="text-xl font-bold text-red-600 mb-2">Error en el módulo</h2>
          <p className="text-gray-600 mb-4">Algo salió mal al cargar los estudiantes.</p>
          <pre className="bg-red-50 text-red-800 p-4 rounded text-left text-sm overflow-auto max-h-40">
            {this.state.error?.message}
          </pre>
          <Button 
            className="mt-4" 
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            Intentar de nuevo
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

const YEAR_KEY = "adm:year";
const NIVEL_KEY = "adm:nivel";

function EstudiantesContent() {
  const { toast } = useToast();
  
  // Configuración global
  const [year, setYear] = useState<string>(localStorage.getItem(YEAR_KEY) || String(new Date().getFullYear()));
  const [nivel, setNivel] = useState<NivelKey>((localStorage.getItem(NIVEL_KEY) as NivelKey) || "primaria");

  // Estado de datos
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);

  // Filtros
  const [curso, setCurso] = useState<string>("");
  const [paralelo, setParalelo] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterActivo, setFilterActivo] = useState<string>("todos");

  // Catálogos
  const [cursosDisponibles, setCursosDisponibles] = useState<string[]>([]);
  const [paralelosDisponibles, setParalelosDisponibles] = useState<string[]>([]);

  // Modales
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isCredentialsDialogOpen, setIsCredentialsDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [newCredentials, setNewCredentials] = useState<{ usuario: string; password: string } | null>(null);

  // Formulario
  const [formData, setFormData] = useState<StudentFormData>({
    nombres: "",
    apellidos: "",
    nivel: "primaria",
    curso: "",
    paralelo: "",
    email: "",
    fecha_nac: "",
    sexo: undefined,
    anio_ingreso: year,
    mes_ingreso: String(new Date().getMonth() + 1).padStart(2, "0"),
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  // Sincronizar año/nivel con localStorage
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === YEAR_KEY && e.newValue) setYear(e.newValue);
      if (e.key === NIVEL_KEY && e.newValue) setNivel(e.newValue as NivelKey);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Cargar cursos disponibles
  useEffect(() => {
    const loadCursos = async () => {
      try {
        const cursos = await getCursos(year, nivel);
        setCursosDisponibles(cursos.length ? cursos : cursosPorNivel[nivel] || []);
      } catch (error) {
        console.error("Error cargando cursos:", error);
        setCursosDisponibles(cursosPorNivel[nivel] || []);
      }
    };
    loadCursos();
  }, [year, nivel]);

  // Cargar paralelos disponibles
  useEffect(() => {
    if (!curso) {
      setParalelosDisponibles([]);
      return;
    }
    const loadParalelos = async () => {
      try {
        const paralelos = await getParalelos(year, nivel, curso);
        setParalelosDisponibles(paralelos.length ? paralelos : ["A", "B", "C"]);
      } catch (error) {
        console.error("Error cargando paralelos:", error);
        setParalelosDisponibles(["A", "B", "C"]);
      }
    };
    loadParalelos();
  }, [year, nivel, curso]);

  // Cargar estudiantes
  const loadStudents = useCallback(async () => {
    setLoading(true);
    try {
      const filters: StudentFilters = {
        nivel,
        page: currentPage,
        per_page: 25,
      };
      if (curso) filters.curso = curso;
      if (paralelo) filters.paralelo = paralelo;
      if (searchQuery) filters.q = searchQuery;
      if (filterActivo !== "todos") filters.activo = filterActivo === "activos";

      const response: PaginatedResponse<Student> = await getStudents(filters);
      setStudents(response?.data || []);
      setTotalPages(response?.last_page || 1);
      setTotal(response?.total || 0);
    } catch (error: unknown) {
      console.error("Error cargando estudiantes:", error);
      // No bloquear la UI, mostrar lista vacía
      setStudents([]);
      setTotalPages(1);
      setTotal(0);
      const err = error as { response?: { data?: { message?: string } } };
      toast({
        title: "Error",
        description: err?.response?.data?.message || "No se pudieron cargar los estudiantes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [nivel, curso, paralelo, searchQuery, filterActivo, currentPage, toast]);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  // Estadísticas
  const stats = useMemo(() => ({
    total,
    activos: students.filter(s => s.activo).length,
    inactivos: students.filter(s => !s.activo).length,
  }), [students, total]);

  // Abrir modal crear
  const openCreate = () => {
    setSelectedStudent(null);
    setFormData({
      nombres: "",
      apellidos: "",
      nivel,
      curso: curso || cursosDisponibles[0] || "",
      paralelo: paralelo || paralelosDisponibles[0] || "A",
      email: "",
      fecha_nac: "",
      sexo: undefined,
      anio_ingreso: year,
      mes_ingreso: String(new Date().getMonth() + 1).padStart(2, "0"),
    });
    setFormErrors({});
    setIsDialogOpen(true);
  };

  // Abrir modal editar
  const openEdit = (student: Student) => {
    setSelectedStudent(student);
    setFormData({
      nombres: student.nombres,
      apellidos: student.apellidos,
      nivel: student.nivel,
      curso: student.curso,
      paralelo: student.paralelo,
      email: student.email || "",
      fecha_nac: student.fecha_nac || "",
      sexo: student.sexo || undefined,
      anio_ingreso: student.anio_ingreso,
      mes_ingreso: student.mes_ingreso || "01",
      activo: student.activo,
    });
    setFormErrors({});
    setIsDialogOpen(true);
  };

  // Validar formulario
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.nombres.trim()) errors.nombres = "Nombres requeridos";
    if (!formData.apellidos.trim()) errors.apellidos = "Apellidos requeridos";
    if (!formData.curso) errors.curso = "Selecciona un curso";
    if (!formData.paralelo) errors.paralelo = "Selecciona un paralelo";
    if (!formData.anio_ingreso) errors.anio_ingreso = "Año de ingreso requerido";
    if (!formData.mes_ingreso) errors.mes_ingreso = "Mes de ingreso requerido";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Guardar estudiante
  const handleSave = async () => {
    if (!validateForm()) return;
    setSaving(true);
    try {
      if (selectedStudent) {
        // Actualizar
        await updateStudent(selectedStudent.id, formData);
        toast({ title: "✅ Estudiante actualizado" });
      } else {
        // Crear
        const result = await createStudent(formData);
        setNewCredentials({
          usuario: result.student.usuario || "",
          password: result.password_temp,
        });
        setIsCredentialsDialogOpen(true);
        toast({ title: "✅ Estudiante creado exitosamente" });
      }
      setIsDialogOpen(false);
      loadStudents();
    } catch (error: unknown) {
      console.error("Error guardando:", error);
      const err = error as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } };
      const emailAlreadyUsed = Boolean(err.response?.data?.errors?.email?.length);
      if (emailAlreadyUsed) {
        setFormErrors((current) => ({
          ...current,
          email: "Este correo ya está registrado. Ingresa otro correo.",
        }));
      }
      toast({
        title: "Error",
        description: emailAlreadyUsed
          ? "Ese correo ya está registrado en otra cuenta. Usa otro correo o deja el campo vacío."
          : err.response?.data?.message || "No se pudo guardar el estudiante",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Eliminar estudiante
  const handleDelete = async () => {
    if (!selectedStudent) return;
    try {
      await deleteStudent(selectedStudent.id);
      toast({ title: "✅ Estudiante eliminado" });
      setIsDeleteDialogOpen(false);
      loadStudents();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast({
        title: "Error",
        description: err.response?.data?.message || "No se pudo eliminar",
        variant: "destructive",
      });
    }
  };

  // Copiar credenciales
  const copyCredentials = () => {
    if (!newCredentials) return;
    const text = `Usuario: ${newCredentials.usuario}\nContraseña: ${newCredentials.password}`;
    navigator.clipboard.writeText(text);
    toast({ title: "📋 Credenciales copiadas al portapapeles" });
  };

  // Ver credenciales de estudiante existente
  const showCredentials = (student: Student) => {
    setNewCredentials({
      usuario: student.usuario || student.codigo,
      password: student.password_temp || "********",
    });
    setIsCredentialsDialogOpen(true);
  };

  return (
    <div className="space-y-6 p-4 min-h-screen bg-background">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <GraduationCap className="h-7 w-7 text-blue-600" />
            Gestión de Estudiantes — {nivel.toUpperCase()} {year}
          </h1>
          <p className="text-muted-foreground">
            Administra la información de los estudiantes del colegio
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadStudents} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Actualizar
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={openCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Estudiante
          </Button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Estudiantes</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
            <div className="p-2 bg-blue-100 rounded-full">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Activos</p>
              <p className="text-2xl font-bold text-green-600">{stats.activos}</p>
            </div>
            <div className="p-2 bg-green-100 rounded-full">
              <UserCheck className="h-5 w-5 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Inactivos</p>
              <p className="text-2xl font-bold text-red-600">{stats.inactivos}</p>
            </div>
            <div className="p-2 bg-red-100 rounded-full">
              <UserX className="h-5 w-5 text-red-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">En esta página</p>
              <p className="text-2xl font-bold">{students.length}</p>
            </div>
            <div className="p-2 bg-purple-100 rounded-full">
              <GraduationCap className="h-5 w-5 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <Select value={nivel} onValueChange={(v) => { setNivel(v as NivelKey); localStorage.setItem(NIVEL_KEY, v); setCurso(""); setParalelo(""); setCurrentPage(1); }}>
              <SelectTrigger>
                <SelectValue placeholder="Nivel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="inicial">Inicial</SelectItem>
                <SelectItem value="primaria">Primaria</SelectItem>
                <SelectItem value="secundaria">Secundaria</SelectItem>
              </SelectContent>
            </Select>
            <Select value={curso || "__all__"} onValueChange={(v) => { setCurso(v === "__all__" ? "" : v); setParalelo(""); setCurrentPage(1); }}>
              <SelectTrigger>
                <SelectValue placeholder="Todos los cursos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">Todos los cursos</SelectItem>
                {cursosDisponibles.map(c => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={paralelo || "__all__"} onValueChange={(v) => { setParalelo(v === "__all__" ? "" : v); setCurrentPage(1); }}>
              <SelectTrigger>
                <SelectValue placeholder="Todos los paralelos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">Todos los paralelos</SelectItem>
                {paralelosDisponibles.map(p => (
                  <SelectItem key={p} value={p}>{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterActivo} onValueChange={(v) => { setFilterActivo(v); setCurrentPage(1); }}>
              <SelectTrigger>
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="activos">Activos</SelectItem>
                <SelectItem value="inactivos">Inactivos</SelectItem>
              </SelectContent>
            </Select>
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre, apellido o código..."
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <span className="ml-2 text-muted-foreground">Cargando estudiantes...</span>
            </div>
          ) : students.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium">No hay estudiantes</h3>
              <p className="text-muted-foreground">Agrega estudiantes o ajusta los filtros</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Estudiante</TableHead>
                  <TableHead>Curso</TableHead>
                  <TableHead>Paralelo</TableHead>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-mono text-sm">{student.codigo}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{student.apellidos}</div>
                        <div className="text-sm text-muted-foreground">{student.nombres}</div>
                      </div>
                    </TableCell>
                    <TableCell>{student.curso}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{student.paralelo}</Badge>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{student.usuario || "-"}</TableCell>
                    <TableCell>
                      <Badge className={student.activo ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>
                        {student.activo ? "Activo" : "Inactivo"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button size="sm" variant="ghost" onClick={() => showCredentials(student)} title="Ver credenciales">
                          <KeyRound className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => openEdit(student)} title="Editar">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="text-red-600" 
                          onClick={() => { setSelectedStudent(student); setIsDeleteDialogOpen(true); }}
                          title="Eliminar"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t">
              <p className="text-sm text-muted-foreground">
                Página {currentPage} de {totalPages} ({total} estudiantes)
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal Crear/Editar */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedStudent ? "Editar Estudiante" : "Nuevo Estudiante"}
            </DialogTitle>
            <DialogDescription>
              {selectedStudent 
                ? "Modifica los datos del estudiante" 
                : "El sistema generará automáticamente el código, usuario y contraseña temporal"}
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nombres *</Label>
              <Input
                value={formData.nombres}
                onChange={(e) => setFormData({ ...formData, nombres: e.target.value.toUpperCase() })}
                placeholder="JUAN CARLOS"
                className={formErrors.nombres ? "border-red-500" : ""}
              />
              {formErrors.nombres && <p className="text-xs text-red-500">{formErrors.nombres}</p>}
            </div>

            <div className="space-y-2">
              <Label>Apellidos *</Label>
              <Input
                value={formData.apellidos}
                onChange={(e) => setFormData({ ...formData, apellidos: e.target.value.toUpperCase() })}
                placeholder="PÉREZ GARCÍA"
                className={formErrors.apellidos ? "border-red-500" : ""}
              />
              {formErrors.apellidos && <p className="text-xs text-red-500">{formErrors.apellidos}</p>}
            </div>

            <div className="space-y-2">
              <Label>Curso *</Label>
              <Select 
                value={formData.curso} 
                onValueChange={(v) => setFormData({ ...formData, curso: v })}
              >
                <SelectTrigger className={formErrors.curso ? "border-red-500" : ""}>
                  <SelectValue placeholder="Seleccionar curso" />
                </SelectTrigger>
                <SelectContent>
                  {cursosDisponibles.map(c => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Paralelo *</Label>
              <Select 
                value={formData.paralelo} 
                onValueChange={(v) => setFormData({ ...formData, paralelo: v })}
              >
                <SelectTrigger className={formErrors.paralelo ? "border-red-500" : ""}>
                  <SelectValue placeholder="Seleccionar paralelo" />
                </SelectTrigger>
                <SelectContent>
                  {(paralelosDisponibles.length ? paralelosDisponibles : ["A", "B", "C"]).map(p => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value });
                  if (formErrors.email) setFormErrors((current) => ({ ...current, email: "" }));
                }}
                placeholder="estudiante@colegio.edu.bo"
                className={formErrors.email ? "border-red-500" : ""}
              />
              {formErrors.email && <p className="text-xs text-red-500">{formErrors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label>Fecha de Nacimiento</Label>
              <Input
                type="date"
                value={formData.fecha_nac}
                onChange={(e) => setFormData({ ...formData, fecha_nac: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Sexo</Label>
              <Select 
                value={formData.sexo || "__none__"} 
                onValueChange={(v) => setFormData({ ...formData, sexo: v === "__none__" ? undefined : v as 'M' | 'F' })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Sin especificar</SelectItem>
                  <SelectItem value="M">Masculino</SelectItem>
                  <SelectItem value="F">Femenino</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Año de Ingreso *</Label>
              <Input
                value={formData.anio_ingreso}
                onChange={(e) => setFormData({ ...formData, anio_ingreso: e.target.value })}
                placeholder="2025"
                maxLength={4}
                className={formErrors.anio_ingreso ? "border-red-500" : ""}
              />
            </div>

            <div className="space-y-2">
              <Label>Mes de Ingreso *</Label>
              <Select 
                value={formData.mes_ingreso} 
                onValueChange={(v) => setFormData({ ...formData, mes_ingreso: v })}
              >
                <SelectTrigger className={formErrors.mes_ingreso ? "border-red-500" : ""}>
                  <SelectValue placeholder="Mes" />
                </SelectTrigger>
                <SelectContent>
                  {["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"].map(m => (
                    <SelectItem key={m} value={m}>
                      {new Date(2000, parseInt(m) - 1).toLocaleString('es', { month: 'long' })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedStudent && (
              <div className="space-y-2">
                <Label>Estado</Label>
                <Select 
                  value={formData.activo ? "true" : "false"} 
                  onValueChange={(v) => setFormData({ ...formData, activo: v === "true" })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Activo</SelectItem>
                    <SelectItem value="false">Inactivo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {selectedStudent ? "Actualizar" : "Crear Estudiante"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Eliminar */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar estudiante?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente a{" "}
              <strong>{selectedStudent?.nombres} {selectedStudent?.apellidos}</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modal Credenciales */}
      <Dialog open={isCredentialsDialogOpen} onOpenChange={setIsCredentialsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <KeyRound className="h-5 w-5 text-blue-600" />
              Credenciales del Estudiante
            </DialogTitle>
            <DialogDescription>
              Guarda estas credenciales. La contraseña temporal deberá ser cambiada en el primer inicio de sesión.
            </DialogDescription>
          </DialogHeader>

          {newCredentials && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Usuario:</span>
                  <span className="font-mono font-bold">{newCredentials.usuario}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Contraseña temporal:</span>
                  <span className="font-mono font-bold">{newCredentials.password}</span>
                </div>
              </div>

              <Button onClick={copyCredentials} className="w-full">
                <Copy className="h-4 w-4 mr-2" />
                Copiar Credenciales
              </Button>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCredentialsDialogOpen(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Exportar con ErrorBoundary
export default function AdminEstudiantes() {
  return (
    <ErrorBoundary>
      <EstudiantesContent />
    </ErrorBoundary>
  );
}
