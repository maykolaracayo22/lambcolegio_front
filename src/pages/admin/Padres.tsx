// src/pages/admin/Padres.tsx
// Gestión de Padres de Familia / Tutores - Bolivia
// Integrado con Backend Laravel

import { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  getParents, 
  createParent, 
  updateParent, 
  deleteParent,
  Parent,
  ParentFormData,
  getRelationshipLabel,
  relationshipOptions
} from '@/services/parentsApi';
import axios from 'axios';
import { API_BASE } from '@/lib/config';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Search,
  Loader2,
  Users,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  UserMinus,
  Eye,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Copy,
  KeyRound,
  UserCheck,
  UserX
} from 'lucide-react';

// Tipos para estudiantes
interface StudentOption {
  id: number;
  nombres: string;
  apellidos: string;
  codigo: string;
  nivel?: string;
  curso?: string;
  paralelo?: string;
}

// Helper de autenticación
const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return {
    'Authorization': `Bearer ${token}`,
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  };
};

const Padres = () => {
  const { toast } = useToast();

  // Estados principales
  const [parents, setParents] = useState<Parent[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const perPage = 20;
  
  // Modal states
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isCredentialsDialogOpen, setIsCredentialsDialogOpen] = useState(false);
  const [editingParent, setEditingParent] = useState<Parent | null>(null);
  const [viewingParent, setViewingParent] = useState<Parent | null>(null);
  const [parentToDelete, setParentToDelete] = useState<Parent | null>(null);
  const [saving, setSaving] = useState(false);
  const [credentials, setCredentials] = useState<{ usuario: string; password: string } | null>(null);
  
  // Búsqueda de estudiantes
  const [students, setStudents] = useState<StudentOption[]>([]);
  const [studentSearch, setStudentSearch] = useState('');
  const [searchingStudents, setSearchingStudents] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<StudentOption[]>([]);
  
  // Form state
  const [formData, setFormData] = useState<ParentFormData>({
    nombre: '',
    apellidos: '',
    ci: '',
    email: '',
    phone: '',
    address: '',
    ocupacion: '',
    lugar_trabajo: '',
    student_ids: [],
    relationship: 'tutor',
  });

  // Cargar padres
  const loadParents = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getParents({ 
        search: search || undefined,
        per_page: perPage,
      });
      setParents(response.data || []);
      setTotal(response.total || response.data?.length || 0);
      setTotalPages(Math.ceil((response.total || response.data?.length || 0) / perPage));
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Error al cargar padres',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [search, toast]);

  // Buscar estudiantes
  const searchStudents = async (query: string) => {
    if (query.length < 2) {
      setStudents([]);
      return;
    }
    
    setSearchingStudents(true);
    try {
      const response = await axios.get(`${API_BASE}/students`, {
        headers: getAuthHeaders(),
        params: { q: query, per_page: 10 },
      });
      const data = response.data.data || response.data || [];
      setStudents(data);
    } catch (error) {
      console.error('Error buscando estudiantes:', error);
    } finally {
      setSearchingStudents(false);
    }
  };

  useEffect(() => {
    loadParents();
  }, [loadParents]);

  // Búsqueda con debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
      loadParents();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, loadParents]);

  // Debounce para búsqueda de estudiantes
  useEffect(() => {
    const timer = setTimeout(() => {
      searchStudents(studentSearch);
    }, 300);
    return () => clearTimeout(timer);
  }, [studentSearch]);

  // Estadísticas
  const stats = useMemo(() => {
    const totalEstudiantes = parents.reduce((acc, p) => acc + p.students.length, 0);
    const conHijos = parents.filter(p => p.students.length > 0).length;
    const sinHijos = parents.filter(p => p.students.length === 0).length;
    return { total, conHijos, sinHijos, totalEstudiantes };
  }, [parents, total]);

  // Abrir modal para crear
  const handleCreate = () => {
    setEditingParent(null);
    setFormData({
      nombre: '',
      apellidos: '',
      ci: '',
      email: '',
      phone: '',
      address: '',
      ocupacion: '',
      lugar_trabajo: '',
      student_ids: [],
      relationship: 'tutor',
    });
    setSelectedStudents([]);
    setStudentSearch('');
    setIsDialogOpen(true);
  };

  // Abrir modal para editar
  const handleEdit = (parent: Parent) => {
    setEditingParent(parent);
    const nameParts = parent.user.name.split(' ');
    setFormData({
      nombre: nameParts[0] || '',
      apellidos: nameParts.slice(1).join(' ') || '',
      ci: parent.ci,
      email: parent.user.email,
      phone: parent.phone,
      address: parent.address || '',
      ocupacion: parent.ocupacion || '',
      lugar_trabajo: parent.lugar_trabajo || '',
      student_ids: parent.students.map(s => s.id),
      relationship: (parent.students[0]?.pivot.relationship as 'padre' | 'madre' | 'tutor' | 'abuelo' | 'otro') || 'tutor',
    });
    setSelectedStudents(parent.students.map(s => ({
      id: s.id,
      nombres: s.nombres,
      apellidos: s.apellidos,
      codigo: s.codigo,
      nivel: s.nivel,
      curso: s.curso,
      paralelo: s.paralelo,
    })));
    setIsDialogOpen(true);
  };

  // Ver detalles
  const handleView = (parent: Parent) => {
    setViewingParent(parent);
    setIsViewDialogOpen(true);
  };

  // Guardar padre
  const handleSave = async () => {
    if (!formData.nombre || !formData.apellidos || !formData.ci || !formData.email || !formData.phone) {
      toast({
        title: 'Error',
        description: 'Completa todos los campos obligatorios',
        variant: 'destructive',
      });
      return;
    }

    // Validar CI boliviano (7-10 dígitos)
    if (!/^\d{7,10}$/.test(formData.ci.replace(/\D/g, ''))) {
      toast({
        title: 'Error',
        description: 'El CI debe tener entre 7 y 10 dígitos',
        variant: 'destructive',
      });
      return;
    }

    // Validar teléfono boliviano (8 dígitos)
    if (!/^\d{8}$/.test(formData.phone.replace(/\D/g, ''))) {
      toast({
        title: 'Error',
        description: 'El teléfono debe tener 8 dígitos',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      const dataToSend = {
        ...formData,
        student_ids: selectedStudents.map(s => s.id),
      };

      if (editingParent) {
        await updateParent(editingParent.id, dataToSend);
        toast({ title: '✅ Padre/tutor actualizado correctamente' });
      } else {
        const result = await createParent(dataToSend);
        // Mostrar credenciales si se crearon
        if (result && typeof result === 'object' && 'password_temp' in result) {
          const res = result as { user?: { email?: string }; password_temp?: string };
          setCredentials({
            usuario: res.user?.email || formData.email,
            password: res.password_temp || '',
          });
          setIsCredentialsDialogOpen(true);
        }
        toast({ title: '✅ Padre/tutor creado correctamente' });
      }
      setIsDialogOpen(false);
      loadParents();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Error al guardar',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  // Confirmar eliminación
  const handleDeleteConfirm = async () => {
    if (!parentToDelete) return;
    
    try {
      await deleteParent(parentToDelete.id);
      toast({ title: '✅ Padre/tutor eliminado correctamente' });
      setIsDeleteDialogOpen(false);
      setParentToDelete(null);
      loadParents();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Error al eliminar',
        variant: 'destructive',
      });
    }
  };

  // Agregar estudiante a la selección
  const addStudent = (student: StudentOption) => {
    if (!selectedStudents.find(s => s.id === student.id)) {
      setSelectedStudents([...selectedStudents, student]);
    }
    setStudentSearch('');
    setStudents([]);
  };

  // Quitar estudiante de la selección
  const removeStudent = (studentId: number) => {
    setSelectedStudents(selectedStudents.filter(s => s.id !== studentId));
  };

  // Copiar credenciales
  const copyCredentials = () => {
    if (!credentials) return;
    const text = `Usuario: ${credentials.usuario}\nContraseña: ${credentials.password}`;
    navigator.clipboard.writeText(text);
    toast({ title: '📋 Credenciales copiadas al portapapeles' });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6 text-blue-600" />
            Padres de Familia / Tutores
          </h1>
          <p className="text-muted-foreground">
            Gestión de padres, madres y tutores legales de estudiantes
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadParents} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Padre/Tutor
          </Button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Registrados</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
            <div className="p-2 bg-blue-100 rounded-full">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Con Hijos Vinculados</p>
              <p className="text-2xl font-bold text-green-600">{stats.conHijos}</p>
            </div>
            <div className="p-2 bg-green-100 rounded-full">
              <UserCheck className="h-5 w-5 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Sin Hijos Vinculados</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.sinHijos}</p>
            </div>
            <div className="p-2 bg-yellow-100 rounded-full">
              <UserX className="h-5 w-5 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Estudiantes Totales</p>
              <p className="text-2xl font-bold text-purple-600">{stats.totalEstudiantes}</p>
            </div>
            <div className="p-2 bg-purple-100 rounded-full">
              <GraduationCap className="h-5 w-5 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Búsqueda */}
      <Card>
        <CardContent className="pt-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre, CI o teléfono..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tabla */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <span className="ml-2 text-muted-foreground">Cargando...</span>
            </div>
          ) : parents.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium">No hay padres/tutores registrados</h3>
              <p className="text-muted-foreground">Agrega un padre o tutor para comenzar</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre Completo</TableHead>
                  <TableHead>CI</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="text-center">Hijos</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {parents.map((parent) => (
                  <TableRow key={parent.id}>
                    <TableCell className="font-medium">{parent.user.name}</TableCell>
                    <TableCell className="font-mono">{parent.ci}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {parent.phone}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Mail className="h-3 w-3" />
                        {parent.user.email}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={parent.students.length > 0 ? "default" : "outline"}>
                        {parent.students.length} estudiante(s)
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleView(parent)}
                          title="Ver detalles"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(parent)}
                          title="Editar"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-600"
                          onClick={() => {
                            setParentToDelete(parent);
                            setIsDeleteDialogOpen(true);
                          }}
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
                Página {currentPage} de {totalPages} ({total} registros)
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

      {/* Dialog Crear/Editar */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingParent ? 'Editar Padre/Tutor' : 'Nuevo Padre/Tutor'}
            </DialogTitle>
            <DialogDescription>
              Ingresa los datos del padre, madre o tutor legal
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            {/* Datos personales */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nombres *</Label>
                <Input
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value.toUpperCase() })}
                  placeholder="JUAN CARLOS"
                />
              </div>
              <div className="space-y-2">
                <Label>Apellidos *</Label>
                <Input
                  value={formData.apellidos}
                  onChange={(e) => setFormData({ ...formData, apellidos: e.target.value.toUpperCase() })}
                  placeholder="PÉREZ GARCÍA"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Carnet de Identidad *</Label>
                <Input
                  value={formData.ci}
                  onChange={(e) => setFormData({ ...formData, ci: e.target.value.replace(/\D/g, '') })}
                  placeholder="12345678"
                  maxLength={10}
                />
                <p className="text-xs text-muted-foreground">7-10 dígitos sin extensión</p>
              </div>
              <div className="space-y-2">
                <Label>Teléfono/Celular *</Label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })}
                  placeholder="77712345"
                  maxLength={8}
                />
                <p className="text-xs text-muted-foreground">8 dígitos</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Correo Electrónico *</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value.toLowerCase() })}
                placeholder="correo@ejemplo.com"
              />
            </div>

            <div className="space-y-2">
              <Label>Dirección</Label>
              <Input
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Calle, zona, ciudad"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Ocupación</Label>
                <Input
                  value={formData.ocupacion}
                  onChange={(e) => setFormData({ ...formData, ocupacion: e.target.value })}
                  placeholder="Profesión u oficio"
                />
              </div>
              <div className="space-y-2">
                <Label>Lugar de Trabajo</Label>
                <Input
                  value={formData.lugar_trabajo}
                  onChange={(e) => setFormData({ ...formData, lugar_trabajo: e.target.value })}
                  placeholder="Empresa o institución"
                />
              </div>
            </div>

            {/* Relación y estudiantes */}
            <div className="border-t pt-4 mt-2">
              <Label className="text-base font-semibold">Estudiantes a cargo</Label>
              
              <div className="grid grid-cols-2 gap-4 mt-3">
                <div className="space-y-2">
                  <Label>Relación</Label>
                  <Select 
                    value={formData.relationship} 
                    onValueChange={(v) => setFormData({ ...formData, relationship: v as 'padre' | 'madre' | 'tutor' | 'abuelo' | 'otro' })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {relationshipOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Búsqueda de estudiantes */}
              <div className="space-y-2 mt-3">
                <Label>Buscar estudiante para vincular</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nombre o código..."
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
                {searchingStudents && (
                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Buscando...
                  </div>
                )}
                {students.length > 0 && (
                  <div className="border rounded-md max-h-32 overflow-y-auto">
                    {students.map((student) => (
                      <div
                        key={student.id}
                        className="p-2 hover:bg-muted cursor-pointer border-b last:border-b-0"
                        onClick={() => addStudent(student)}
                      >
                        <div className="font-medium text-sm">
                          {student.apellidos}, {student.nombres}
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center gap-2">
                          <span className="font-mono">{student.codigo}</span>
                          {student.nivel && (
                            <Badge variant="outline" className="text-[10px]">
                              {student.nivel} {student.curso}° {student.paralelo}
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Estudiantes seleccionados */}
              {selectedStudents.length > 0 && (
                <div className="mt-3 space-y-2">
                  <Label className="text-sm">Estudiantes seleccionados ({selectedStudents.length}):</Label>
                  {selectedStudents.map((student) => (
                    <div
                      key={student.id}
                      className="flex items-center justify-between p-2 bg-muted rounded-md"
                    >
                      <div>
                        <span className="font-medium text-sm">
                          {student.apellidos}, {student.nombres}
                        </span>
                        <span className="text-xs text-muted-foreground ml-2">
                          ({student.codigo})
                        </span>
                        {student.nivel && (
                          <Badge variant="outline" className="ml-2 text-[10px]">
                            {student.nivel}
                          </Badge>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-red-600"
                        onClick={() => removeStudent(student.id)}
                      >
                        <UserMinus className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingParent ? 'Actualizar' : 'Crear'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Ver Detalles */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Detalles del Padre/Tutor</DialogTitle>
          </DialogHeader>
          
          {viewingParent && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">{viewingParent.user.name}</h3>
                  <p className="text-sm text-muted-foreground">CI: {viewingParent.ci}</p>
                </div>
              </div>

              <div className="grid gap-3">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{viewingParent.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{viewingParent.user.email}</span>
                </div>
                {viewingParent.address && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{viewingParent.address}</span>
                  </div>
                )}
                {viewingParent.ocupacion && (
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    <span>{viewingParent.ocupacion}</span>
                    {viewingParent.lugar_trabajo && (
                      <span className="text-muted-foreground">- {viewingParent.lugar_trabajo}</span>
                    )}
                  </div>
                )}
              </div>

              {viewingParent.students.length > 0 && (
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <GraduationCap className="h-4 w-4" />
                    Estudiantes a cargo ({viewingParent.students.length}):
                  </h4>
                  <div className="space-y-2">
                    {viewingParent.students.map((student) => (
                      <div key={student.id} className="flex items-center justify-between p-2 bg-muted rounded-md">
                        <div>
                          <div className="font-medium text-sm">
                            {student.apellidos}, {student.nombres}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {student.codigo} • {student.nivel} {student.curso}° "{student.paralelo}"
                          </div>
                        </div>
                        <Badge variant="outline">
                          {getRelationshipLabel(student.pivot.relationship)}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Credenciales */}
      <Dialog open={isCredentialsDialogOpen} onOpenChange={setIsCredentialsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <KeyRound className="h-5 w-5 text-blue-600" />
              Credenciales del Padre/Tutor
            </DialogTitle>
            <DialogDescription>
              Guarda estas credenciales. La contraseña temporal deberá ser cambiada en el primer inicio de sesión.
            </DialogDescription>
          </DialogHeader>

          {credentials && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Usuario (email):</span>
                  <span className="font-mono font-bold">{credentials.usuario}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Contraseña temporal:</span>
                  <span className="font-mono font-bold">{credentials.password}</span>
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

      {/* Dialog Confirmar Eliminación */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar padre/tutor?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará a <strong>{parentToDelete?.user.name}</strong> y su cuenta de usuario.
              Los estudiantes vinculados NO serán afectados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Padres;
