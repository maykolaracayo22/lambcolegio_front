// src/pages/admin/Cursos.tsx
// Gestión de Cursos/Grados según Ley 070 Bolivia

import { useState, useEffect } from 'react';
import { 
  getCourses, 
  createCourse, 
  updateCourse, 
  deleteCourse,
  generarCursosEstandar,
  Course, 
  CourseFormData,
  getNivelColor,
  getNivelLabel,
  NivelInfo
} from '@/services/coursesApi';
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
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Search,
  BookOpen,
  Wand2,
  Loader2,
  GraduationCap
} from 'lucide-react';

const Cursos = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [niveles, setNiveles] = useState<NivelInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterNivel, setFilterNivel] = useState<string>('');
  
  // Modal states
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);
  const [saving, setSaving] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState<CourseFormData>({
    nombre: '',
    codigo: '',
    nivel: 'primaria',
    grado: 1,
    descripcion: '',
    activo: true,
  });

  const { toast } = useToast();

  // Cargar cursos
  const loadCourses = async () => {
    setLoading(true);
    try {
      const response = await getCourses({
        nivel: filterNivel || undefined,
        search: search || undefined,
      });
      setCourses(response.data);
      setNiveles(response.niveles);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Error al cargar cursos',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterNivel]);

  // Búsqueda con debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      loadCourses();
    }, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  // Abrir modal para crear
  const handleCreate = () => {
    setEditingCourse(null);
    setFormData({
      nombre: '',
      codigo: '',
      nivel: 'primaria',
      grado: 1,
      descripcion: '',
      activo: true,
    });
    setIsDialogOpen(true);
  };

  // Abrir modal para editar
  const handleEdit = (course: Course) => {
    setEditingCourse(course);
    setFormData({
      nombre: course.nombre,
      codigo: course.codigo,
      nivel: course.nivel,
      grado: course.grado,
      descripcion: course.descripcion || '',
      activo: course.activo,
    });
    setIsDialogOpen(true);
  };

  // Guardar curso
  const handleSave = async () => {
    if (!formData.nombre || !formData.codigo || !formData.nivel) {
      toast({
        title: 'Error',
        description: 'Completa todos los campos obligatorios',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      if (editingCourse) {
        await updateCourse(editingCourse.id, formData);
        toast({ title: 'Éxito', description: 'Curso actualizado correctamente' });
      } else {
        await createCourse(formData);
        toast({ title: 'Éxito', description: 'Curso creado correctamente' });
      }
      setIsDialogOpen(false);
      loadCourses();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Error al guardar curso',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  // Confirmar eliminación
  const handleDeleteConfirm = async () => {
    if (!courseToDelete) return;
    
    try {
      await deleteCourse(courseToDelete.id);
      toast({ title: 'Éxito', description: 'Curso eliminado correctamente' });
      setIsDeleteDialogOpen(false);
      setCourseToDelete(null);
      loadCourses();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Error al eliminar curso',
        variant: 'destructive',
      });
    }
  };

  // Generar cursos estándar de Bolivia
  const handleGenerarEstandar = async () => {
    setSaving(true);
    try {
      const response = await generarCursosEstandar();
      toast({ 
        title: 'Éxito', 
        description: response.message 
      });
      loadCourses();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Error al generar cursos',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  // Auto-generar nombre y código
  const handleNivelGradoChange = (field: 'nivel' | 'grado', value: string | number) => {
    const newData = { ...formData, [field]: value };
    
    if (newData.nivel && newData.grado) {
      const nivelCapitalized = newData.nivel.charAt(0).toUpperCase() + newData.nivel.slice(1);
      newData.nombre = `${newData.grado}° de ${nivelCapitalized}`;
      
      const prefijos: Record<string, string> = {
        inicial: 'I',
        primaria: 'P', 
        secundaria: 'S'
      };
      newData.codigo = `${newData.grado}${prefijos[newData.nivel]}`;
    }
    
    setFormData(newData);
  };

  // Obtener máximo de grados para el nivel seleccionado
  const getMaxGrados = () => {
    const nivel = niveles.find(n => n.value === formData.nivel);
    return nivel?.max_grados || 6;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <GraduationCap className="h-6 w-6" />
            Cursos / Grados
          </h1>
          <p className="text-muted-foreground">
            Gestión de años de escolaridad según Ley 070 Avelino Siñani
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleGenerarEstandar} disabled={saving}>
            <Wand2 className="h-4 w-4 mr-2" />
            Generar Estándar Bolivia
          </Button>
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Curso
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre o código..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterNivel || 'all'} onValueChange={(v) => setFilterNivel(v === 'all' ? '' : v)}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Todos los niveles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los niveles</SelectItem>
            <SelectItem value="inicial">Nivel Inicial</SelectItem>
            <SelectItem value="primaria">Nivel Primario</SelectItem>
            <SelectItem value="secundaria">Nivel Secundario</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tabla */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Nivel</TableHead>
              <TableHead>Grado</TableHead>
              <TableHead className="text-center">Secciones</TableHead>
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
            ) : courses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No hay cursos registrados. Usa "Generar Estándar Bolivia" para crear los cursos de Ley 070.
                </TableCell>
              </TableRow>
            ) : (
              courses.map((course) => (
                <TableRow key={course.id}>
                  <TableCell className="font-mono font-bold">{course.codigo}</TableCell>
                  <TableCell className="font-medium">{course.nombre}</TableCell>
                  <TableCell>
                    <Badge className={getNivelColor(course.nivel)}>
                      {getNivelLabel(course.nivel)}
                    </Badge>
                  </TableCell>
                  <TableCell>{course.grado}°</TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline">
                      <BookOpen className="h-3 w-3 mr-1" />
                      {course.sections_count || 0}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={course.activo ? 'default' : 'secondary'}>
                      {course.activo ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(course)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setCourseToDelete(course);
                          setIsDeleteDialogOpen(true);
                        }}
                        disabled={(course.sections_count || 0) > 0}
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

      {/* Dialog Crear/Editar */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingCourse ? 'Editar Curso' : 'Nuevo Curso'}
            </DialogTitle>
            <DialogDescription>
              {editingCourse 
                ? 'Modifica los datos del curso seleccionado'
                : 'Ingresa los datos del nuevo curso según Ley 070'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nivel">Nivel *</Label>
                <Select 
                  value={formData.nivel} 
                  onValueChange={(v) => handleNivelGradoChange('nivel', v as 'inicial' | 'primaria' | 'secundaria')}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="inicial">Inicial (2 años)</SelectItem>
                    <SelectItem value="primaria">Primaria (6 años)</SelectItem>
                    <SelectItem value="secundaria">Secundaria (6 años)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="grado">Grado *</Label>
                <Select 
                  value={String(formData.grado)} 
                  onValueChange={(v) => handleNivelGradoChange('grado', parseInt(v))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: getMaxGrados() }, (_, i) => i + 1).map((g) => (
                      <SelectItem key={g} value={String(g)}>{g}°</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre *</Label>
                <Input
                  id="nombre"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  placeholder="Ej: 1° de Primaria"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="codigo">Código *</Label>
                <Input
                  id="codigo"
                  value={formData.codigo}
                  onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                  placeholder="Ej: 1P"
                  className="font-mono"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción</Label>
              <Textarea
                id="descripcion"
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                placeholder="Descripción opcional del curso..."
                rows={2}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="activo">Curso Activo</Label>
              <Switch
                id="activo"
                checked={formData.activo}
                onCheckedChange={(checked) => setFormData({ ...formData, activo: checked })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingCourse ? 'Actualizar' : 'Crear'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Confirmar Eliminación */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar curso?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará el curso "{courseToDelete?.nombre}" permanentemente.
              Esta acción no se puede deshacer.
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

export default Cursos;
