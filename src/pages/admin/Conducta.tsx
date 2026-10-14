// src/pages/admin/Conducta.tsx
// Módulo de Gestión de Conducta - Control de comportamiento estudiantil

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  AlertTriangle,
  Award,
  Plus,
  Search,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Calendar,
  User,
  FileText,
  ThumbsUp,
  ThumbsDown,
  Shield,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  ConductIncident,
  ConductFormData,
  ConductFilters,
  getConductIncidents,
  createConductIncident,
  updateConductIncident,
  approveConductIncident,
  deleteConductIncident,
  getTipoColor,
  getTipoLabel,
  getSeveridadColor,
  getSeveridadLabel,
  tipoOptions,
  severidadOptions,
} from '@/services/conductApi';
import { getStudents, Student } from '@/services/studentApi';

const ConductaAdmin = () => {
  const { toast } = useToast();

  // Estados principales
  const [incidents, setIncidents] = useState<ConductIncident[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Filtros
  const [filters, setFilters] = useState<ConductFilters>({});
  const [searchTerm, setSearchTerm] = useState('');

  // Diálogos
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<ConductIncident | null>(null);

  // Formulario
  const [formData, setFormData] = useState<ConductFormData>({
    student_id: 0,
    tipo: 'negativa',
    descripcion: '',
    fecha: new Date().toISOString().split('T')[0],
    severidad: 'leve',
    acciones_tomadas: '',
  });

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [incidentsRes, studentsRes] = await Promise.all([
        getConductIncidents(filters),
        getStudents(),
      ]);

      setIncidents(Array.isArray(incidentsRes.data) ? incidentsRes.data : incidentsRes.data?.data || []);
      setStudents(Array.isArray(studentsRes.data) ? studentsRes.data : studentsRes.data?.data || []);
    } catch (error) {
      console.error('Error cargando datos:', error);
      const axiosError = error as { response?: { data?: { message?: string } } };
      toast({
        title: 'Error',
        description: axiosError.response?.data?.message || 'Error cargando datos de conducta',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadIncidents = async () => {
    try {
      const response = await getConductIncidents(filters);
      setIncidents(Array.isArray(response.data) ? response.data : response.data?.data || []);
    } catch (error) {
      console.error('Error cargando incidentes:', error);
    }
  };

  // Cargar datos iniciales
  useEffect(() => {
    loadInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Recargar cuando cambian los filtros
  useEffect(() => {
    loadIncidents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const resetForm = () => {
    setFormData({
      student_id: 0,
      tipo: 'negativa',
      descripcion: '',
      fecha: new Date().toISOString().split('T')[0],
      severidad: 'leve',
      acciones_tomadas: '',
    });
  };

  const handleCreateIncident = async () => {
    if (!formData.student_id || !formData.descripcion) {
      toast({
        title: 'Error',
        description: 'Seleccione un estudiante y describa el incidente',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      await createConductIncident(formData);
      toast({
        title: 'Éxito',
        description: 'Incidente registrado correctamente',
      });
      setShowCreateDialog(false);
      resetForm();
      loadIncidents();
    } catch (error) {
      console.error('Error creando incidente:', error);
      const axiosError = error as { response?: { data?: { message?: string } } };
      toast({
        title: 'Error',
        description: axiosError.response?.data?.message || 'Error al registrar incidente',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleEditIncident = async () => {
    if (!selectedIncident) return;

    setSaving(true);
    try {
      await updateConductIncident(selectedIncident.id, {
        descripcion: formData.descripcion,
        severidad: formData.severidad,
        acciones_tomadas: formData.acciones_tomadas,
      });
      toast({
        title: 'Éxito',
        description: 'Incidente actualizado correctamente',
      });
      setShowEditDialog(false);
      setSelectedIncident(null);
      loadIncidents();
    } catch (error) {
      console.error('Error actualizando:', error);
      const axiosError = error as { response?: { data?: { message?: string } } };
      toast({
        title: 'Error',
        description: axiosError.response?.data?.message || 'Error al actualizar',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleApproveIncident = async (incident: ConductIncident) => {
    try {
      await approveConductIncident(incident.id);
      toast({
        title: 'Éxito',
        description: 'Incidente aprobado/autorizado',
      });
      loadIncidents();
    } catch (error) {
      console.error('Error aprobando:', error);
      const axiosError = error as { response?: { data?: { message?: string } } };
      toast({
        title: 'Error',
        description: axiosError.response?.data?.message || 'Error al aprobar',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteIncident = async () => {
    if (!selectedIncident) return;

    try {
      await deleteConductIncident(selectedIncident.id);
      toast({
        title: 'Éxito',
        description: 'Incidente eliminado',
      });
      setShowDeleteDialog(false);
      setSelectedIncident(null);
      loadIncidents();
    } catch (error) {
      console.error('Error eliminando:', error);
      const axiosError = error as { response?: { data?: { message?: string } } };
      toast({
        title: 'Error',
        description: axiosError.response?.data?.message || 'Error al eliminar',
        variant: 'destructive',
      });
    }
  };

  const openEditDialog = (incident: ConductIncident) => {
    setSelectedIncident(incident);
    setFormData({
      student_id: incident.student_id,
      tipo: incident.tipo,
      descripcion: incident.descripcion,
      fecha: incident.fecha,
      severidad: incident.severidad,
      acciones_tomadas: incident.acciones_tomadas || '',
    });
    setShowEditDialog(true);
  };

  const openDeleteDialog = (incident: ConductIncident) => {
    setSelectedIncident(incident);
    setShowDeleteDialog(true);
  };

  // Filtrar incidentes localmente por búsqueda
  const filteredIncidents = incidents.filter((inc) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    const studentName = `${inc.student?.nombres || ''} ${inc.student?.apellidos || ''}`.toLowerCase();
    return (
      studentName.includes(search) ||
      inc.descripcion.toLowerCase().includes(search) ||
      inc.student?.codigo?.toLowerCase().includes(search)
    );
  });

  // Estadísticas
  const stats = {
    total: incidents.length,
    positivas: incidents.filter((i) => i.tipo === 'positiva').length,
    negativas: incidents.filter((i) => i.tipo === 'negativa').length,
    pendientes: incidents.filter((i) => !i.aprobado_por).length,
    graves: incidents.filter((i) => i.severidad === 'grave').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2">Cargando módulo de conducta...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Shield className="h-8 w-8 text-blue-600" />
            Gestión de Conducta
          </h1>
          <p className="text-gray-600 mt-1">
            Control de comportamiento y registros disciplinarios (Ley 070)
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadIncidents}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
          <Button onClick={() => { resetForm(); setShowCreateDialog(true); }}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Registro
          </Button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-500">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <ThumbsUp className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-500">Positivas</p>
                <p className="text-2xl font-bold text-green-600">{stats.positivas}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <ThumbsDown className="h-8 w-8 text-red-600" />
              <div>
                <p className="text-sm text-gray-500">Negativas</p>
                <p className="text-2xl font-bold text-red-600">{stats.negativas}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-sm text-gray-500">Graves</p>
                <p className="text-2xl font-bold text-orange-600">{stats.graves}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <XCircle className="h-8 w-8 text-yellow-600" />
              <div>
                <p className="text-sm text-gray-500">Pendientes</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pendientes}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtros de Búsqueda</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por estudiante..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select
              value={filters.tipo || 'all'}
              onValueChange={(val) => setFilters({ ...filters, tipo: val === 'all' ? undefined : val as ConductFormData['tipo'] })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                <SelectItem value="positiva">Positiva</SelectItem>
                <SelectItem value="negativa">Negativa</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.severidad || 'all'}
              onValueChange={(val) => setFilters({ ...filters, severidad: val === 'all' ? undefined : val as ConductFormData['severidad'] })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Severidad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="leve">Leve</SelectItem>
                <SelectItem value="moderada">Moderada</SelectItem>
                <SelectItem value="grave">Grave</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => {
                setFilters({});
                setSearchTerm('');
              }}
            >
              Limpiar filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de incidentes */}
      <Card>
        <CardHeader>
          <CardTitle>Registros de Conducta</CardTitle>
          <CardDescription>
            {filteredIncidents.length} registro(s) encontrado(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Estudiante</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Severidad</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredIncidents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    No hay registros de conducta
                  </TableCell>
                </TableRow>
              ) : (
                filteredIncidents.map((incident) => (
                  <TableRow key={incident.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        {new Date(incident.fecha).toLocaleDateString('es-BO')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="font-medium">
                            {incident.student?.nombres} {incident.student?.apellidos}
                          </p>
                          <p className="text-xs text-gray-500">
                            {incident.student?.codigo}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getTipoColor(incident.tipo)}>
                        {incident.tipo === 'positiva' ? (
                          <Award className="h-3 w-3 mr-1" />
                        ) : (
                          <AlertTriangle className="h-3 w-3 mr-1" />
                        )}
                        {getTipoLabel(incident.tipo)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getSeveridadColor(incident.severidad)}>
                        {getSeveridadLabel(incident.severidad)}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <p className="truncate" title={incident.descripcion}>
                        {incident.descripcion}
                      </p>
                    </TableCell>
                    <TableCell>
                      {incident.aprobado_por ? (
                        <Badge variant="outline" className="bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Aprobado
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                          <XCircle className="h-3 w-3 mr-1" />
                          Pendiente
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        {!incident.aprobado_por && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleApproveIncident(incident)}
                            title="Aprobar"
                          >
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(incident)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDeleteDialog(incident)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Diálogo de crear */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Nuevo Registro de Conducta
            </DialogTitle>
            <DialogDescription>
              Registre un incidente de comportamiento (positivo o negativo)
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Estudiante *</Label>
              <Select
                value={formData.student_id ? String(formData.student_id) : undefined}
                onValueChange={(val) => setFormData({ ...formData, student_id: parseInt(val) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione estudiante" />
                </SelectTrigger>
                <SelectContent>
                  {students.map((student) => (
                    <SelectItem key={student.id} value={String(student.id)}>
                      {student.nombres} {student.apellidos} ({student.codigo})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Tipo *</Label>
                <Select
                  value={formData.tipo}
                  onValueChange={(val) => setFormData({ ...formData, tipo: val as ConductFormData['tipo'] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {tipoOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        <span className={opt.color}>{opt.label}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Severidad *</Label>
                <Select
                  value={formData.severidad}
                  onValueChange={(val) => setFormData({ ...formData, severidad: val as ConductFormData['severidad'] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {severidadOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Fecha *</Label>
              <Input
                type="date"
                value={formData.fecha}
                onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
              />
            </div>

            <div>
              <Label>Descripción del incidente *</Label>
              <Textarea
                placeholder="Describa detalladamente el comportamiento observado..."
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                rows={3}
              />
            </div>

            <div>
              <Label>Acciones tomadas</Label>
              <Textarea
                placeholder="Medidas correctivas o reconocimientos aplicados..."
                value={formData.acciones_tomadas}
                onChange={(e) => setFormData({ ...formData, acciones_tomadas: e.target.value })}
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateIncident} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Registrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de editar */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              Editar Registro
            </DialogTitle>
            <DialogDescription>
              Modifique los datos del incidente
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Severidad</Label>
              <Select
                value={formData.severidad}
                onValueChange={(val) => setFormData({ ...formData, severidad: val as ConductFormData['severidad'] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {severidadOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Descripción</Label>
              <Textarea
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                rows={3}
              />
            </div>

            <div>
              <Label>Acciones tomadas</Label>
              <Textarea
                value={formData.acciones_tomadas}
                onChange={(e) => setFormData({ ...formData, acciones_tomadas: e.target.value })}
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleEditIncident} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Guardar Cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de eliminar */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar registro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el registro de conducta de{' '}
              <strong>{selectedIncident?.student?.nombres} {selectedIncident?.student?.apellidos}</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteIncident}
              className="bg-red-600 hover:bg-red-700"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ConductaAdmin;
