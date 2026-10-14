// src/pages/admin/Preinscripciones.tsx
// Módulo de Gestión de Preinscripciones - Solicitudes de nuevos estudiantes

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
  UserPlus,
  Search,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  User,
  Phone,
  Mail,
  MapPin,
  FileText,
  Download,
  Loader2,
  RefreshCw,
  Filter,
  Key,
  Copy,
  Users,
  Printer,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Preinscription,
  PreinscriptionFilters,
  getPreinscriptions,
  approvePreinscription,
  rejectPreinscription,
  downloadRude,
  getEstadoColor,
  getEstadoLabel,
  getNivelLabel,
  estadoOptions,
  nivelOptions,
} from '@/services/preinscriptionsApi';

const PreinscripcionesAdmin = () => {
  const { toast } = useToast();

  // Estados principales
  const [preinscriptions, setPreinscriptions] = useState<Preinscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);

  // Filtros
  const [filters, setFilters] = useState<PreinscriptionFilters>({
    year: new Date().getFullYear(),
  });
  const [searchTerm, setSearchTerm] = useState('');

  // Diálogos
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showCredentialsDialog, setShowCredentialsDialog] = useState(false);
  const [selectedPreinscription, setSelectedPreinscription] = useState<Preinscription | null>(null);
  const [motivoRechazo, setMotivoRechazo] = useState('');
  const [processing, setProcessing] = useState(false);
  
  // Credenciales generadas tras aprobar
  const [generatedCredentials, setGeneratedCredentials] = useState<{
    student: { codigo: string; usuario: string; password_temp: string };
    parent: { nombre: string; ci: string; es_nuevo: boolean; password_temp: string | null };
  } | null>(null);

  // Cargar datos
  useEffect(() => {
    loadPreinscriptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, currentPage]);

  const loadPreinscriptions = async () => {
    setLoading(true);
    try {
      const response = await getPreinscriptions({
        ...filters,
        q: searchTerm || undefined,
        page: currentPage,
      });
      
      if (response.data) {
        setPreinscriptions(response.data);
        setTotalPages(response.last_page || 1);
      } else {
        setPreinscriptions(Array.isArray(response) ? response : []);
      }
    } catch (error) {
      console.error('Error cargando preinscripciones:', error);
      const axiosError = error as { response?: { data?: { message?: string } } };
      toast({
        title: 'Error',
        description: axiosError.response?.data?.message || 'Error cargando preinscripciones',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    loadPreinscriptions();
  };

  const handleApprove = async (preinscription: Preinscription) => {
    setProcessing(true);
    try {
      const response = await approvePreinscription(preinscription.id);
      
      // Si el backend devuelve credenciales, mostrarlas
      if (response.student && response.parent) {
        setSelectedPreinscription(preinscription);
        setGeneratedCredentials({
          student: response.student,
          parent: response.parent,
        });
        setShowCredentialsDialog(true);
      }
      
      toast({
        title: '✅ Preinscripción Aprobada',
        description: `Estudiante ${preinscription.nombres} ${preinscription.apellidos} y tutor registrados exitosamente`,
      });
      loadPreinscriptions();
    } catch (error) {
      console.error('Error aprobando:', error);
      const axiosError = error as { response?: { data?: { message?: string } } };
      toast({
        title: 'Error',
        description: axiosError.response?.data?.message || 'Error al aprobar',
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedPreinscription || !motivoRechazo.trim()) {
      toast({
        title: 'Error',
        description: 'Debe indicar el motivo del rechazo',
        variant: 'destructive',
      });
      return;
    }

    setProcessing(true);
    try {
      await rejectPreinscription(selectedPreinscription.id, motivoRechazo);
      toast({
        title: 'Rechazada',
        description: `Preinscripción de ${selectedPreinscription.nombres} rechazada`,
      });
      setShowRejectDialog(false);
      setMotivoRechazo('');
      setSelectedPreinscription(null);
      loadPreinscriptions();
    } catch (error) {
      console.error('Error rechazando:', error);
      const axiosError = error as { response?: { data?: { message?: string } } };
      toast({
        title: 'Error',
        description: axiosError.response?.data?.message || 'Error al rechazar',
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleDownloadRude = async (preinscription: Preinscription) => {
    try {
      const blob = await downloadRude(preinscription.codigo_preinscripcion);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `RUDE_${preinscription.codigo_preinscripcion}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error descargando RUDE:', error);
      toast({
        title: 'Error',
        description: 'Error al descargar el documento RUDE',
        variant: 'destructive',
      });
    }
  };

  const openDetailDialog = (preinscription: Preinscription) => {
    setSelectedPreinscription(preinscription);
    setShowDetailDialog(true);
  };

  const openRejectDialog = (preinscription: Preinscription) => {
    setSelectedPreinscription(preinscription);
    setMotivoRechazo('');
    setShowRejectDialog(true);
  };

  // Estadísticas
  const stats = {
    total: preinscriptions.length,
    pendientes: preinscriptions.filter((p) => p.estado === 'pendiente').length,
    aprobadas: preinscriptions.filter((p) => p.estado === 'aprobado').length,
    rechazadas: preinscriptions.filter((p) => p.estado === 'rechazado').length,
  };

  if (loading && preinscriptions.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2">Cargando preinscripciones...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <UserPlus className="h-8 w-8 text-blue-600" />
            Preinscripciones
          </h1>
          <p className="text-gray-600 mt-1">
            Gestión de solicitudes de nuevos estudiantes
          </p>
        </div>
        <Button variant="outline" onClick={loadPreinscriptions} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
              <Clock className="h-8 w-8 text-yellow-600" />
              <div>
                <p className="text-sm text-gray-500">Pendientes</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pendientes}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-500">Aprobadas</p>
                <p className="text-2xl font-bold text-green-600">{stats.aprobadas}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <XCircle className="h-8 w-8 text-red-600" />
              <div>
                <p className="text-sm text-gray-500">Rechazadas</p>
                <p className="text-2xl font-bold text-red-600">{stats.rechazadas}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por nombre, apellido..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10"
              />
            </div>

            <Select
              value={filters.estado || 'all'}
              onValueChange={(val) => setFilters({ ...filters, estado: val === 'all' ? undefined : val as PreinscriptionFilters['estado'] })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                {estadoOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.nivel || 'all'}
              onValueChange={(val) => setFilters({ ...filters, nivel: val === 'all' ? undefined : val as PreinscriptionFilters['nivel'] })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Nivel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los niveles</SelectItem>
                {nivelOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button onClick={handleSearch}>
              <Search className="h-4 w-4 mr-2" />
              Buscar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabla */}
      <Card>
        <CardHeader>
          <CardTitle>Solicitudes de Preinscripción</CardTitle>
          <CardDescription>
            {preinscriptions.length} solicitud(es) encontrada(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Estudiante</TableHead>
                <TableHead>Nivel / Grado</TableHead>
                <TableHead>Tutor</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {preinscriptions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    No hay preinscripciones registradas
                  </TableCell>
                </TableRow>
              ) : (
                preinscriptions.map((preinscription) => (
                  <TableRow key={preinscription.id}>
                    <TableCell className="font-mono text-sm">
                      {preinscription.codigo_preinscripcion}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="font-medium">
                            {preinscription.nombres} {preinscription.apellidos}
                          </p>
                          <p className="text-xs text-gray-500">
                            {preinscription.sexo === 'M' ? 'Masculino' : 'Femenino'} • 
                            {preinscription.fecha_nac && new Date(preinscription.fecha_nac).toLocaleDateString('es-BO')}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {getNivelLabel(preinscription.nivel)} - {preinscription.grado}°
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm">{preinscription.tutor_nombre}</p>
                        <p className="text-xs text-gray-500">{preinscription.tutor_parentesco}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Calendar className="h-3 w-3" />
                        {preinscription.created_at && new Date(preinscription.created_at).toLocaleDateString('es-BO')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getEstadoColor(preinscription.estado)}>
                        {preinscription.estado === 'pendiente' && <Clock className="h-3 w-3 mr-1" />}
                        {preinscription.estado === 'aprobado' && <CheckCircle className="h-3 w-3 mr-1" />}
                        {preinscription.estado === 'rechazado' && <XCircle className="h-3 w-3 mr-1" />}
                        {getEstadoLabel(preinscription.estado)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDetailDialog(preinscription)}
                          title="Ver detalles"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {preinscription.estado === 'aprobado' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownloadRude(preinscription)}
                            title="Descargar RUDE"
                          >
                            <Download className="h-4 w-4 text-blue-600" />
                          </Button>
                        )}
                        {preinscription.estado === 'pendiente' && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleApprove(preinscription)}
                              disabled={processing}
                              title="Aprobar"
                            >
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openRejectDialog(preinscription)}
                              title="Rechazar"
                            >
                              <XCircle className="h-4 w-4 text-red-600" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                Anterior
              </Button>
              <span className="flex items-center px-3 text-sm text-gray-600">
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
        </CardContent>
      </Card>

      {/* Diálogo de detalle */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Detalle de Preinscripción
            </DialogTitle>
            <DialogDescription>
              Código: {selectedPreinscription?.codigo_preinscripcion}
            </DialogDescription>
          </DialogHeader>

          {selectedPreinscription && (
            <div className="space-y-6">
              {/* Estado */}
              <div className="flex justify-center">
                <Badge className={`text-lg px-4 py-2 ${getEstadoColor(selectedPreinscription.estado)}`}>
                  {getEstadoLabel(selectedPreinscription.estado)}
                </Badge>
              </div>

              {/* Datos del estudiante */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Datos del Estudiante
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label className="text-gray-500">Nombres</Label>
                    <p className="font-medium">{selectedPreinscription.nombres}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Apellidos</Label>
                    <p className="font-medium">{selectedPreinscription.apellidos}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">CI</Label>
                    <p>{selectedPreinscription.ci || 'No registrado'}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Sexo</Label>
                    <p>{selectedPreinscription.sexo === 'M' ? 'Masculino' : 'Femenino'}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Fecha de Nacimiento</Label>
                    <p>{selectedPreinscription.fecha_nac && new Date(selectedPreinscription.fecha_nac).toLocaleDateString('es-BO')}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Nacionalidad</Label>
                    <p>{selectedPreinscription.nacionalidad || 'No registrada'}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Nivel</Label>
                    <p>{getNivelLabel(selectedPreinscription.nivel)}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Grado</Label>
                    <p>{selectedPreinscription.grado}°</p>
                  </div>
                </CardContent>
              </Card>

              {/* Datos de contacto */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Contacto
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4 text-sm">
                  <div className="col-span-2">
                    <Label className="text-gray-500 flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> Dirección
                    </Label>
                    <p>{selectedPreinscription.direccion || 'No registrada'}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500 flex items-center gap-1">
                      <Phone className="h-3 w-3" /> Teléfono
                    </Label>
                    <p>{selectedPreinscription.telefono || 'No registrado'}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500 flex items-center gap-1">
                      <Mail className="h-3 w-3" /> Email
                    </Label>
                    <p>{selectedPreinscription.email || 'No registrado'}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Datos del tutor */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Datos del Tutor
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label className="text-gray-500">Nombre</Label>
                    <p className="font-medium">{selectedPreinscription.tutor_nombre}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Parentesco</Label>
                    <p>{selectedPreinscription.tutor_parentesco}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">CI</Label>
                    <p>{selectedPreinscription.tutor_ci || 'No registrado'}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Teléfono</Label>
                    <p>{selectedPreinscription.tutor_telefono || 'No registrado'}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Información adicional */}
              {(selectedPreinscription.pueblo_indigena || selectedPreinscription.discapacidad || selectedPreinscription.vulnerabilidad) && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Información Adicional (Ley 070)</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-4 text-sm">
                    {selectedPreinscription.pueblo_indigena && (
                      <div>
                        <Label className="text-gray-500">Pueblo Indígena</Label>
                        <p>{selectedPreinscription.pueblo_indigena}</p>
                      </div>
                    )}
                    <div>
                      <Label className="text-gray-500">Discapacidad</Label>
                      <p>{selectedPreinscription.discapacidad ? 'Sí' : 'No'}</p>
                    </div>
                    <div>
                      <Label className="text-gray-500">Situación de Vulnerabilidad</Label>
                      <p>{selectedPreinscription.vulnerabilidad ? 'Sí' : 'No'}</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Motivo de rechazo si aplica */}
              {selectedPreinscription.estado === 'rechazado' && (selectedPreinscription as any).motivo_rechazo && (
                <Card className="border-red-200 bg-red-50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-red-800">Motivo de Rechazo</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-red-700">{(selectedPreinscription as any).motivo_rechazo}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailDialog(false)}>
              Cerrar
            </Button>
            {selectedPreinscription?.estado === 'aprobado' && (
              <Button onClick={() => handleDownloadRude(selectedPreinscription)}>
                <Download className="h-4 w-4 mr-2" />
                Descargar RUDE
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de rechazo */}
      <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Rechazar Preinscripción</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Está seguro de rechazar la preinscripción de{' '}
              <strong>{selectedPreinscription?.nombres} {selectedPreinscription?.apellidos}</strong>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="py-4">
            <Label>Motivo del rechazo *</Label>
            <Textarea
              placeholder="Indique el motivo del rechazo..."
              value={motivoRechazo}
              onChange={(e) => setMotivoRechazo(e.target.value)}
              rows={3}
              className="mt-2"
            />
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReject}
              disabled={processing || !motivoRechazo.trim()}
              className="bg-red-600 hover:bg-red-700"
            >
              {processing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Rechazar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Diálogo de credenciales generadas */}
      <Dialog open={showCredentialsDialog} onOpenChange={setShowCredentialsDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-700">
              <CheckCircle className="h-6 w-6" />
              ¡Inscripción Aprobada Exitosamente!
            </DialogTitle>
            <DialogDescription>
              Se han generado las credenciales de acceso. Por favor, guárdelas o imprímelas.
            </DialogDescription>
          </DialogHeader>

          {generatedCredentials && selectedPreinscription && (
            <div className="space-y-6 py-4">
              {/* Credenciales del Estudiante */}
              <Card className="border-blue-200 bg-blue-50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2 text-blue-800">
                    <User className="h-4 w-4" />
                    Credenciales del Estudiante
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <Label className="text-gray-500">Nombre Completo</Label>
                      <p className="font-medium">{selectedPreinscription.nombres} {selectedPreinscription.apellidos}</p>
                    </div>
                    <div>
                      <Label className="text-gray-500">Código de Estudiante</Label>
                      <p className="font-mono font-bold text-blue-700">{generatedCredentials.student.codigo}</p>
                    </div>
                  </div>
                  <div className="bg-white p-3 rounded border border-blue-200">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-gray-500 flex items-center gap-1">
                          <Key className="h-3 w-3" /> Usuario
                        </Label>
                        <div className="flex items-center gap-2 mt-1">
                          <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                            {generatedCredentials.student.usuario}
                          </code>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              navigator.clipboard.writeText(generatedCredentials.student.usuario);
                              toast({ title: 'Copiado', description: 'Usuario copiado al portapapeles' });
                            }}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <div>
                        <Label className="text-gray-500 flex items-center gap-1">
                          <Key className="h-3 w-3" /> Contraseña Temporal
                        </Label>
                        <div className="flex items-center gap-2 mt-1">
                          <code className="bg-yellow-100 px-2 py-1 rounded text-sm font-mono font-bold">
                            {generatedCredentials.student.password_temp}
                          </code>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              navigator.clipboard.writeText(generatedCredentials.student.password_temp);
                              toast({ title: 'Copiado', description: 'Contraseña copiada al portapapeles' });
                            }}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Credenciales del Padre/Tutor */}
              <Card className={`border-purple-200 ${generatedCredentials.parent.es_nuevo ? 'bg-purple-50' : 'bg-gray-50'}`}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2 text-purple-800">
                    <Users className="h-4 w-4" />
                    Padre/Tutor {generatedCredentials.parent.es_nuevo ? '(Nuevo registro)' : '(Ya existente)'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <Label className="text-gray-500">Nombre</Label>
                      <p className="font-medium">{generatedCredentials.parent.nombre}</p>
                    </div>
                    <div>
                      <Label className="text-gray-500">CI</Label>
                      <p>{generatedCredentials.parent.ci || 'No registrado'}</p>
                    </div>
                  </div>
                  
                  {generatedCredentials.parent.es_nuevo && generatedCredentials.parent.password_temp && (
                    <div className="bg-white p-3 rounded border border-purple-200">
                      <Label className="text-gray-500 flex items-center gap-1">
                        <Key className="h-3 w-3" /> Contraseña Temporal del Tutor
                      </Label>
                      <div className="flex items-center gap-2 mt-1">
                        <code className="bg-yellow-100 px-2 py-1 rounded text-sm font-mono font-bold">
                          {generatedCredentials.parent.password_temp}
                        </code>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            if (generatedCredentials.parent.password_temp) {
                              navigator.clipboard.writeText(generatedCredentials.parent.password_temp);
                              toast({ title: 'Copiado', description: 'Contraseña del tutor copiada' });
                            }
                          }}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                      <p className="text-xs text-purple-600 mt-2">
                        * Este tutor ya aparece en el módulo de Padres/Tutores
                      </p>
                    </div>
                  )}
                  
                  {!generatedCredentials.parent.es_nuevo && (
                    <div className="bg-gray-100 p-3 rounded text-sm text-gray-600">
                      <p>Este padre/tutor ya estaba registrado en el sistema. Se ha vinculado automáticamente con el nuevo estudiante.</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Aviso importante */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-amber-800 text-sm font-medium">
                  ⚠️ Importante: Las contraseñas temporales deben ser cambiadas en el primer inicio de sesión.
                </p>
              </div>
            </div>
          )}

          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                // Crear texto para imprimir/copiar todo
                if (generatedCredentials && selectedPreinscription) {
                  const texto = `
CREDENCIALES DE ACCESO - ${selectedPreinscription.nombres} ${selectedPreinscription.apellidos}
=========================================

ESTUDIANTE:
- Código: ${generatedCredentials.student.codigo}
- Usuario: ${generatedCredentials.student.usuario}
- Contraseña: ${generatedCredentials.student.password_temp}

PADRE/TUTOR:
- Nombre: ${generatedCredentials.parent.nombre}
- CI: ${generatedCredentials.parent.ci || 'No registrado'}
${generatedCredentials.parent.es_nuevo ? `- Contraseña: ${generatedCredentials.parent.password_temp}` : '- (Ya tenía cuenta en el sistema)'}

IMPORTANTE: Cambiar las contraseñas temporales en el primer inicio de sesión.
                  `.trim();
                  navigator.clipboard.writeText(texto);
                  toast({ title: 'Copiado', description: 'Todas las credenciales copiadas al portapapeles' });
                }
              }}
            >
              <Copy className="h-4 w-4 mr-2" />
              Copiar Todo
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                window.print();
              }}
            >
              <Printer className="h-4 w-4 mr-2" />
              Imprimir
            </Button>
            <Button onClick={() => {
              setShowCredentialsDialog(false);
              setGeneratedCredentials(null);
            }}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PreinscripcionesAdmin;
