// src/pages/admin/Docentes.tsx
// Gestión de Docentes conectado a Backend Laravel

import { useEffect, useMemo, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { 
  Search, Plus, Edit, Trash2, Users, Mail, Phone, CheckCircle, XCircle,
  BookOpen, Shield, Loader2, RefreshCw, ChevronLeft, ChevronRight, KeyRound, Copy
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { 
  listTeachers, createTeacher, updateTeacher, deleteTeacher,
  Teacher, TeacherFormData, TeacherFilters, PaginatedResponse
} from "@/services/teachersApi";

type EstadoRDA = "VIGENTE" | "OBSERVADO" | "VENCIDO";
type Estado = "activo" | "licencia" | "inactivo";

export default function AdminDocentes() {
  const { toast } = useToast();

  // Estado de datos
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);

  // Filtros
  const [searchQuery, setSearchQuery] = useState("");
  const [filterEstado, setFilterEstado] = useState<Estado | "todos">("todos");
  const [filterRDA, setFilterRDA] = useState<EstadoRDA | "todos">("todos");

  // Modales
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isCredentialsDialogOpen, setIsCredentialsDialogOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [newCredentials, setNewCredentials] = useState<{ usuario: string; password: string } | null>(null);

  // Formulario
  const [formData, setFormData] = useState<TeacherFormData>({
    nombres: "",
    apellidos: "",
    ci: "",
    email: "",
    telefono: "",
    rda_numero: "",
    rda_estado: "VIGENTE",
    estado: "activo",
    anio_ingreso: String(new Date().getFullYear()),
    mes_ingreso: String(new Date().getMonth() + 1).padStart(2, "0"),
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  // Cargar docentes
  const loadTeachers = useCallback(async () => {
    setLoading(true);
    try {
      const filters: TeacherFilters = {
        page: currentPage,
        per_page: 25,
      };
      if (searchQuery) filters.q = searchQuery;
      if (filterEstado !== "todos") filters.estado = filterEstado;
      if (filterRDA !== "todos") filters.rda_estado = filterRDA;

      const response: PaginatedResponse<Teacher> = await listTeachers(filters);
      setTeachers(response.data);
      setTotalPages(response.last_page);
      setTotal(response.total);
    } catch (error: any) {
      console.error("Error cargando docentes:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "No se pudieron cargar los docentes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchQuery, filterEstado, filterRDA, toast]);

  useEffect(() => {
    loadTeachers();
  }, [loadTeachers]);

  // Estadísticas
  const stats = useMemo(() => ({
    total,
    activos: teachers.filter(d => d.estado === "activo").length,
    licencia: teachers.filter(d => d.estado === "licencia").length,
    inactivos: teachers.filter(d => d.estado === "inactivo").length,
    rdaVig: teachers.filter(d => d.rda_estado === "VIGENTE").length,
    rdaObs: teachers.filter(d => d.rda_estado === "OBSERVADO" || d.rda_estado === "VENCIDO").length,
  }), [teachers, total]);

  const getEstadoBadgeColors = (activo: boolean) => {
    return activo ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700";
  };

  // Abrir modal crear
  const openCreate = () => {
    setSelectedTeacher(null);
    setFormData({
      nombres: "",
      apellidos: "",
      ci: "",
      email: "",
      telefono: "",
      rda_numero: "",
      rda_estado: "VIGENTE",
      estado: "activo",
      anio_ingreso: String(new Date().getFullYear()),
      mes_ingreso: String(new Date().getMonth() + 1).padStart(2, "0"),
    });
    setFormErrors({});
    setIsDialogOpen(true);
  };

  // Abrir modal editar
  const openEdit = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setFormData({
      nombres: teacher.nombres,
      apellidos: teacher.apellidos,
      ci: teacher.ci || "",
      email: teacher.email || "",
      telefono: teacher.telefono || "",
      rda_numero: teacher.rda_numero || "",
      rda_estado: teacher.rda_estado || "VIGENTE",
      estado: teacher.estado || "activo",
      anio_ingreso: teacher.anio_ingreso || String(new Date().getFullYear()),
      mes_ingreso: teacher.mes_ingreso || String(new Date().getMonth() + 1).padStart(2, "0"),
    });
    setFormErrors({});
    setIsDialogOpen(true);
  };

  // Validar formulario
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.nombres.trim()) errors.nombres = "Nombres requeridos";
    if (!formData.apellidos.trim()) errors.apellidos = "Apellidos requeridos";
    if (!formData.ci.trim()) errors.ci = "CI requerido";
    if (!formData.rda_numero.trim()) errors.rda_numero = "Nro. RDA requerido";
    if (!formData.email.trim()) errors.email = "Email requerido";
    if (!/^\d{4}$/.test(formData.anio_ingreso)) errors.anio_ingreso = "Ingresa el año con 4 dígitos";
    if (!/^\d{2}$/.test(formData.mes_ingreso) || Number(formData.mes_ingreso) < 1 || Number(formData.mes_ingreso) > 12) errors.mes_ingreso = "Ingresa el mes entre 01 y 12";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Guardar docente
  const handleSave = async () => {
    if (!validateForm()) return;
    setSaving(true);
    try {
      if (selectedTeacher) {
        // Actualizar
        await updateTeacher(selectedTeacher.id, formData);
        toast({ title: "✅ Docente actualizado" });
      } else {
        // Crear
        const result = await createTeacher(formData);
        setNewCredentials({
          usuario: result.teacher.usuario || "",
          password: result.password_temp,
        });
        setIsCredentialsDialogOpen(true);
        toast({ title: "✅ Docente creado exitosamente" });
      }
      setIsDialogOpen(false);
      loadTeachers();
    } catch (error: any) {
      console.error("Error guardando:", error);
      const validationErrors = error.response?.data?.errors as Record<string, string[]> | undefined;
      if (validationErrors) {
        setFormErrors(Object.fromEntries(Object.entries(validationErrors).map(([field, messages]) => [field, messages[0]])));
      }
      toast({
        title: "Error",
        description: error.response?.data?.message || Object.values(validationErrors || {}).flat()[0] || "No se pudo guardar el docente",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Eliminar docente
  const handleDelete = async () => {
    if (!selectedTeacher) return;
    try {
      await deleteTeacher(selectedTeacher.id);
      toast({ title: "✅ Docente eliminado" });
      setIsDeleteDialogOpen(false);
      loadTeachers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "No se pudo eliminar",
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

  // Ver credenciales de docente existente
  const showCredentials = (teacher: Teacher) => {
    setNewCredentials({
      usuario: teacher.usuario || `DOC-${teacher.id}`,
      password: teacher.password_temp || "********",
    });
    setIsCredentialsDialogOpen(true);
  };

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <BookOpen className="h-7 w-7 text-blue-600" />
            Gestión de Docentes
          </h1>
          <p className="text-muted-foreground">
            Administra la información del personal docente (CI, RDA y estado).
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadTeachers} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Actualizar
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={openCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Docente
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <Card><CardContent className="p-4 flex items-center justify-between">
          <div><p className="text-sm text-muted-foreground">Total de Docentes</p><p className="text-2xl font-bold">{stats.total}</p></div>
          <div className="p-2 bg-blue-100 rounded-full"><Users className="h-5 w-5 text-blue-600" /></div>
        </CardContent></Card>

        <Card><CardContent className="p-4 flex items-center justify-between">
          <div><p className="text-sm text-muted-foreground">Activos</p><p className="text-2xl font-bold text-green-600">{stats.activos}</p></div>
          <div className="p-2 bg-green-100 rounded-full"><CheckCircle className="h-5 w-5 text-green-600" /></div>
        </CardContent></Card>

        <Card><CardContent className="p-4 flex items-center justify-between">
          <div><p className="text-sm text-muted-foreground">Inactivos</p><p className="text-2xl font-bold text-red-600">{stats.inactivos}</p></div>
          <div className="p-2 bg-red-100 rounded-full"><XCircle className="h-5 w-5 text-red-600" /></div>
        </CardContent></Card>

        <Card><CardContent className="p-4 flex items-center justify-between">
          <div><p className="text-sm text-muted-foreground">RDA Vigentes</p><p className="text-2xl font-bold text-purple-700">{stats.rdaVig}</p></div>
          <div className="p-2 bg-purple-100 rounded-full"><Shield className="h-5 w-5 text-purple-700" /></div>
        </CardContent></Card>

        <Card><CardContent className="p-4 flex items-center justify-between">
          <div><p className="text-sm text-muted-foreground">RDA Observados</p><p className="text-2xl font-bold text-yellow-600">{stats.rdaObs}</p></div>
          <div className="p-2 bg-yellow-100 rounded-full"><Shield className="h-5 w-5 text-yellow-600" /></div>
        </CardContent></Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="md:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar por nombre, email, CI o RDA…"
                className="pl-10 w-full"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              />
            </div>
            <Select value={filterEstado} onValueChange={(v) => { setFilterEstado(v as Estado | "todos"); setCurrentPage(1); }}>
              <SelectTrigger>
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="activo">Activo</SelectItem>
                <SelectItem value="licencia">Licencia</SelectItem>
                <SelectItem value="inactivo">Inactivo</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterRDA} onValueChange={(v) => { setFilterRDA(v as EstadoRDA | "todos"); setCurrentPage(1); }}>
              <SelectTrigger>
                <Shield className="h-4 w-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Estado RDA" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="VIGENTE">RDA Vigente</SelectItem>
                <SelectItem value="OBSERVADO">RDA Observado</SelectItem>
                <SelectItem value="VENCIDO">RDA Vencido</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabla */}
      <Card>
        <CardHeader>
          <CardTitle>Listado de Docentes</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <span className="ml-2 text-muted-foreground">Cargando docentes...</span>
            </div>
          ) : teachers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium">No hay docentes</h3>
              <p className="text-muted-foreground">Agrega docentes o ajusta los filtros</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Docente</TableHead>
                    <TableHead>CI</TableHead>
                    <TableHead>RDA</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Teléfono</TableHead>
                    <TableHead>Estado RDA</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teachers.map((teacher) => (
                    <TableRow key={teacher.id}>
                      <TableCell className="font-medium">
                        <div>
                          <div>{teacher.nombres}</div>
                          <div className="text-sm text-muted-foreground">{teacher.apellidos}</div>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs">{teacher.ci || "-"}</TableCell>
                      <TableCell className="font-mono text-xs">{teacher.rda_numero || "-"}</TableCell>
                      <TableCell>
                        {teacher.email ? (
                          <a className="text-blue-600 hover:underline flex items-center gap-1" href={`mailto:${teacher.email}`}>
                            <Mail className="h-4 w-4" /> {teacher.email}
                          </a>
                        ) : "-"}
                      </TableCell>
                      <TableCell>
                        {teacher.telefono ? (
                          <a className="text-blue-600 hover:underline flex items-center gap-1" href={`tel:${teacher.telefono}`}>
                            <Phone className="h-4 w-4" /> {teacher.telefono}
                          </a>
                        ) : "-"}
                      </TableCell>
                      <TableCell>
                        <Badge className={
                          teacher.rda_estado === "VIGENTE" ? "bg-purple-100 text-purple-700" : 
                          teacher.rda_estado === "VENCIDO" ? "bg-red-100 text-red-700" :
                          "bg-yellow-100 text-yellow-700"
                        }>
                          {teacher.rda_estado || "N/A"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getEstadoBadgeColors(teacher.estado === "activo")}>
                          {teacher.estado === "activo" ? "Activo" : teacher.estado === "licencia" ? "Licencia" : "Inactivo"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button size="sm" variant="ghost" onClick={() => showCredentials(teacher)} title="Ver credenciales">
                            <KeyRound className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => openEdit(teacher)} title="Editar">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="text-red-600"
                            onClick={() => { setSelectedTeacher(teacher); setIsDeleteDialogOpen(true); }}
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
            </div>
          )}

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t">
              <p className="text-sm text-muted-foreground">
                Página {currentPage} de {totalPages} ({total} docentes)
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
              {selectedTeacher ? "Editar Docente" : "Nuevo Docente"}
            </DialogTitle>
            <DialogDescription>
              {selectedTeacher 
                ? "Modifica los datos del docente" 
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
              <Label>Cédula de Identidad (CI) *</Label>
              <Input
                value={formData.ci}
                onChange={(e) => setFormData({ ...formData, ci: e.target.value })}
                placeholder="12345678"
                className={formErrors.ci ? "border-red-500" : ""}
              />
              {formErrors.ci && <p className="text-xs text-red-500">{formErrors.ci}</p>}
            </div>

            <div className="space-y-2">
              <Label>Nro. RDA *</Label>
              <Input
                value={formData.rda_numero}
                onChange={(e) => setFormData({ ...formData, rda_numero: e.target.value })}
                placeholder="RDA-001-2024"
                className={formErrors.rda_numero ? "border-red-500" : ""}
              />
              {formErrors.rda_numero && <p className="text-xs text-red-500">{formErrors.rda_numero}</p>}
            </div>

            <div className="space-y-2">
              <Label>Email *</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="docente@colegio.edu.bo"
                className={formErrors.email ? "border-red-500" : ""}
              />
              {formErrors.email && <p className="text-xs text-red-500">{formErrors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label>Teléfono</Label>
              <Input
                value={formData.telefono}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                placeholder="591-71234567"
              />
            </div>

            <div className="space-y-2">
              <Label>Estado RDA</Label>
              <Select 
                value={formData.rda_estado} 
                onValueChange={(v) => setFormData({ ...formData, rda_estado: v as EstadoRDA })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="VIGENTE">VIGENTE</SelectItem>
                  <SelectItem value="OBSERVADO">OBSERVADO</SelectItem>
                  <SelectItem value="VENCIDO">VENCIDO</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Estado del docente *</Label>
              <Select value={formData.estado} onValueChange={(v) => setFormData({ ...formData, estado: v as Estado })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="activo">Activo</SelectItem>
                  <SelectItem value="licencia">Licencia</SelectItem>
                  <SelectItem value="inactivo">Inactivo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Año de ingreso *</Label>
              <Input inputMode="numeric" maxLength={4} value={formData.anio_ingreso} onChange={(e) => setFormData({ ...formData, anio_ingreso: e.target.value.replace(/\D/g, "").slice(0, 4) })} />
              {formErrors.anio_ingreso && <p className="text-xs text-red-500">{formErrors.anio_ingreso}</p>}
            </div>

            <div className="space-y-2">
              <Label>Mes de ingreso *</Label>
              <Input inputMode="numeric" maxLength={2} placeholder="01–12" value={formData.mes_ingreso} onChange={(e) => setFormData({ ...formData, mes_ingreso: e.target.value.replace(/\D/g, "").slice(0, 2) })} />
              {formErrors.mes_ingreso && <p className="text-xs text-red-500">{formErrors.mes_ingreso}</p>}
            </div>

          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {selectedTeacher ? "Actualizar" : "Crear Docente"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Eliminar */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar docente?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente a{" "}
              <strong>{selectedTeacher?.nombres} {selectedTeacher?.apellidos}</strong>.
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
              Credenciales del Docente
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
