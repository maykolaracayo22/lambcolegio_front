// src/pages/admin/Inscripciones.tsx
// Gestión de Inscripciones/Matrículas de estudiantes

import { useState, useEffect } from 'react';
import { 
  getEnrollments, 
  createEnrollment, 
  updateEnrollment, 
  deleteEnrollment,
  Enrollment,
  EnrollmentFormData,
  getEstadoColor,
  getEstadoLabel,
  estadoOptions
} from '@/services/enrollmentsApi';
import { listSections, Section } from '@/services/sectionsApi';
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
  FileText,
  Loader2,
  UserPlus,
  Calendar,
  Filter
} from 'lucide-react';
import axios from 'axios';

// API para buscar estudiantes
const API_URL = 'http://127.0.0.1:8000/api';
const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return {
    'Authorization': `Bearer ${token}`,
    'Accept': 'application/json',
  };
};

interface StudentOption {
  id: number;
  nombres: string;
  apellidos: string;
  codigo: string;
}

const Inscripciones = () => {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [students, setStudents] = useState<StudentOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Filtros
  const [filterYear, setFilterYear] = useState<string>(new Date().getFullYear().toString());
  const [filterEstado, setFilterEstado] = useState<string>('');
  const [filterSection, setFilterSection] = useState<string>('');
  
  // Modal states
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingEnrollment, setEditingEnrollment] = useState<Enrollment | null>(null);
  const [enrollmentToDelete, setEnrollmentToDelete] = useState<Enrollment | null>(null);
  const [saving, setSaving] = useState(false);
  const [searchingStudents, setSearchingStudents] = useState(false);
  const [studentSearch, setStudentSearch] = useState('');
  
  // Form state
  const [formData, setFormData] = useState<EnrollmentFormData>({
    year: new Date().getFullYear().toString(),
    student_id: 0,
    section_id: 0,
    estado: 'INSCRITO',
    fecha: new Date().toISOString().split('T')[0],
  });

  const { toast } = useToast();

  // Cargar inscripciones
  const loadEnrollments = async () => {
    setLoading(true);
    try {
      const response = await getEnrollments({
        year: filterYear || undefined,
        estado: filterEstado || undefined,
        section_id: filterSection ? parseInt(filterSection) : undefined,
        page: currentPage,
        per_page: 20,
      });
      setEnrollments(response.data);
      setTotalPages(response.last_page);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Error al cargar inscripciones',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Cargar secciones para filtros y formulario
  const loadSections = async () => {
    try {
      const response = await listSections({ year: parseInt(filterYear) });
      setSections(response.data);
    } catch (error) {
      console.error('Error cargando secciones:', error);
    }
  };

  // Buscar estudiantes
  const searchStudents = async (query: string) => {
    if (query.length < 2) {
      setStudents([]);
      return;
    }
    
    setSearchingStudents(true);
    try {
      const response = await axios.get(`${API_URL}/students`, {
        headers: getAuthHeaders(),
        params: { q: query, per_page: 10 },
      });
      setStudents(response.data.data || []);
    } catch (error) {
      console.error('Error buscando estudiantes:', error);
    } finally {
      setSearchingStudents(false);
    }
  };

  useEffect(() => {
    loadEnrollments();
    loadSections();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterYear, filterEstado, filterSection, currentPage]);

  // Debounce para búsqueda de estudiantes
  useEffect(() => {
    const timer = setTimeout(() => {
      searchStudents(studentSearch);
    }, 300);
    return () => clearTimeout(timer);
  }, [studentSearch]);

  // Abrir modal para crear
  const handleCreate = () => {
    setEditingEnrollment(null);
    setFormData({
      year: filterYear,
      student_id: 0,
      section_id: 0,
      estado: 'INSCRITO',
      fecha: new Date().toISOString().split('T')[0],
    });
    setStudentSearch('');
    setStudents([]);
    setIsDialogOpen(true);
  };

  // Abrir modal para editar
  const handleEdit = (enrollment: Enrollment) => {
    setEditingEnrollment(enrollment);
    setFormData({
      year: enrollment.year,
      student_id: enrollment.student_id,
      section_id: enrollment.section_id,
      estado: enrollment.estado,
      fecha: enrollment.fecha || new Date().toISOString().split('T')[0],
    });
    setStudentSearch(`${enrollment.student.nombres} ${enrollment.student.apellidos}`);
    setIsDialogOpen(true);
  };

  // Guardar inscripción
  const handleSave = async () => {
    if (!formData.student_id || !formData.section_id) {
      toast({
        title: 'Error',
        description: 'Selecciona un estudiante y una sección',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      if (editingEnrollment) {
        await updateEnrollment(editingEnrollment.id, {
          section_id: formData.section_id,
          estado: formData.estado,
          fecha: formData.fecha,
        });
        toast({ title: 'Éxito', description: 'Inscripción actualizada correctamente' });
      } else {
        await createEnrollment(formData);
        toast({ title: 'Éxito', description: 'Estudiante inscrito correctamente' });
      }
      setIsDialogOpen(false);
      loadEnrollments();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Error al guardar inscripción',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  // Confirmar eliminación
  const handleDeleteConfirm = async () => {
    if (!enrollmentToDelete) return;
    
    try {
      await deleteEnrollment(enrollmentToDelete.id);
      toast({ title: 'Éxito', description: 'Inscripción eliminada correctamente' });
      setIsDeleteDialogOpen(false);
      setEnrollmentToDelete(null);
      loadEnrollments();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Error al eliminar inscripción',
        variant: 'destructive',
      });
    }
  };

  // Años disponibles para filtro
  const currentYear = new Date().getFullYear();
  const years = [currentYear + 1, currentYear, currentYear - 1, currentYear - 2];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <UserPlus className="h-6 w-6" />
            Inscripciones / Matrículas
          </h1>
          <p className="text-muted-foreground">
            Gestión de matrículas de estudiantes por gestión escolar
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Inscripción
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex flex-col md:flex-row gap-4 p-4 bg-muted/50 rounded-lg">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Filtros:</span>
        </div>
        
        <Select value={filterYear} onValueChange={setFilterYear}>
          <SelectTrigger className="w-[140px]">
            <Calendar className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Año" />
          </SelectTrigger>
          <SelectContent>
            {years.map((y) => (
              <SelectItem key={y} value={String(y)}>{y}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterEstado || 'all'} onValueChange={(val) => setFilterEstado(val === 'all' ? '' : val)}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Todos los estados" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            {estadoOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterSection || 'all'} onValueChange={(val) => setFilterSection(val === 'all' ? '' : val)}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Todas las secciones" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las secciones</SelectItem>
            {sections.map((s) => (
              <SelectItem key={s.id} value={String(s.id)}>
                {s.nivel} - {s.curso}° "{s.paralelo}"
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tabla */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código Mat.</TableHead>
              <TableHead>Estudiante</TableHead>
              <TableHead>CI</TableHead>
              <TableHead>Sección</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead className="text-center">Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : enrollments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No hay inscripciones para los filtros seleccionados
                </TableCell>
              </TableRow>
            ) : (
              enrollments.map((enrollment) => (
                <TableRow key={enrollment.id}>
                  <TableCell className="font-mono text-xs">
                    {enrollment.code}
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {enrollment.student.apellidos}, {enrollment.student.nombres}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {enrollment.student.codigo}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{enrollment.student.ci || '-'}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {enrollment.section.nivel} - {enrollment.section.curso}° "{enrollment.section.paralelo}"
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Turno: {enrollment.section.turno}
                    </div>
                  </TableCell>
                  <TableCell>
                    {enrollment.fecha 
                      ? new Date(enrollment.fecha).toLocaleDateString('es-BO')
                      : '-'}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge className={getEstadoColor(enrollment.estado)}>
                      {getEstadoLabel(enrollment.estado)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(enrollment)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEnrollmentToDelete(enrollment);
                          setIsDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            Anterior
          </Button>
          <span className="flex items-center px-4 text-sm">
            Página {currentPage} de {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Siguiente
          </Button>
        </div>
      )}

      {/* Dialog Crear/Editar */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingEnrollment ? 'Editar Inscripción' : 'Nueva Inscripción'}
            </DialogTitle>
            <DialogDescription>
              {editingEnrollment 
                ? 'Modifica los datos de la inscripción'
                : 'Inscribe un estudiante en una sección'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            {/* Búsqueda de estudiante */}
            {!editingEnrollment && (
              <div className="space-y-2">
                <Label>Buscar Estudiante *</Label>
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
                  <div className="text-sm text-muted-foreground">Buscando...</div>
                )}
                {students.length > 0 && (
                  <div className="border rounded-md max-h-40 overflow-y-auto">
                    {students.map((student) => (
                      <div
                        key={student.id}
                        className={`p-2 hover:bg-muted cursor-pointer ${
                          formData.student_id === student.id ? 'bg-muted' : ''
                        }`}
                        onClick={() => {
                          setFormData({ ...formData, student_id: student.id });
                          setStudentSearch(`${student.nombres} ${student.apellidos}`);
                          setStudents([]);
                        }}
                      >
                        <div className="font-medium">
                          {student.apellidos}, {student.nombres}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {student.codigo}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {editingEnrollment && (
              <div className="p-3 bg-muted rounded-lg">
                <div className="font-medium">
                  {editingEnrollment.student.apellidos}, {editingEnrollment.student.nombres}
                </div>
                <div className="text-sm text-muted-foreground">
                  {editingEnrollment.student.codigo}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Gestión *</Label>
                <Select 
                  value={formData.year} 
                  onValueChange={(v) => setFormData({ ...formData, year: v })}
                  disabled={!!editingEnrollment}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((y) => (
                      <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Fecha de Inscripción</Label>
                <Input
                  type="date"
                  value={formData.fecha}
                  onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Sección *</Label>
              <Select 
                value={formData.section_id ? String(formData.section_id) : undefined} 
                onValueChange={(v) => setFormData({ ...formData, section_id: parseInt(v) })}
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
              <Label>Estado</Label>
              <Select 
                value={formData.estado} 
                onValueChange={(v) => setFormData({ ...formData, estado: v as 'PREINSCRITO' | 'INSCRITO' | 'BAJA_TEMP' | 'BAJA_DEF' })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {estadoOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingEnrollment ? 'Actualizar' : 'Inscribir'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Confirmar Eliminación */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar inscripción?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará la inscripción de{' '}
              <strong>
                {enrollmentToDelete?.student.apellidos}, {enrollmentToDelete?.student.nombres}
              </strong>{' '}
              en la sección {enrollmentToDelete?.section.curso}° "{enrollmentToDelete?.section.paralelo}".
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

export default Inscripciones;
