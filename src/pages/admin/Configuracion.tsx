/**
 * Módulo de Configuración del Sistema
 * Conectado al backend Laravel para gestionar configuraciones
 */

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Settings,
  School,
  Bell,
  Lock,
  Save,
  RefreshCw,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  Database,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import { toast } from "sonner";
import {
  getCurrentUser,
  changePassword,
  saveSystemConfig,
  getSystemStats,
} from "@/services/sistemaApi";

export default function AdminConfiguracion() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Información del usuario actual
  const [currentUser, setCurrentUser] = useState<{
    id: number;
    name: string;
    email: string;
    roles: string[];
  } | null>(null);

  // Información de la institución
  const [institucion, setInstitucion] = useState({
    nombre: "Unidad Educativa",
    direccion: "",
    telefono: "",
    email: "",
    director: "",
    gestion: new Date().getFullYear().toString(),
  });

  // Configuración de notificaciones
  const [notificaciones, setNotificaciones] = useState({
    email: true,
    sms: false,
    push: true,
    recordatoriosPago: true,
    alertasAsistencia: true,
    reportesAutomaticos: false,
  });

  // Configuración académica
  const [academico, setAcademico] = useState({
    escalaNotas: "100",
    notaMinima: "51",
    decimales: "0",
    periodos: "3",
    turno: "mañana",
  });

  // Cambio de contraseña
  const [passwordForm, setPasswordForm] = useState({
    current: "",
    new: "",
    confirm: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // Estadísticas del sistema
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalSections: 0,
  });

  // Cargar datos
  const loadData = useCallback(async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      console.log('[Configuracion] Esperando autenticación...');
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Cargar usuario actual
      const user = await getCurrentUser().catch(() => null);
      if (user) {
        setCurrentUser({
          id: user.id,
          name: user.name,
          email: user.email,
          roles: user.roles || [],
        });
      }

      // Cargar estadísticas
      const statsData = await getSystemStats();
      setStats(statsData);

      // Cargar configuración guardada localmente
      const savedInstitucion = localStorage.getItem('config:institucion');
      if (savedInstitucion) {
        setInstitucion(JSON.parse(savedInstitucion));
      }

      const savedNotificaciones = localStorage.getItem('config:notificaciones');
      if (savedNotificaciones) {
        setNotificaciones(JSON.parse(savedNotificaciones));
      }

      const savedAcademico = localStorage.getItem('config:academico');
      if (savedAcademico) {
        setAcademico(JSON.parse(savedAcademico));
      }
    } catch (error) {
      console.error("Error cargando configuración:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 500);
    return () => clearTimeout(timer);
  }, [loadData]);

  // Guardar información de institución
  const handleSaveInstitucion = async () => {
    setSaving(true);
    try {
      localStorage.setItem('config:institucion', JSON.stringify(institucion));
      await saveSystemConfig({
        key: 'institucion',
        value: institucion,
        group: 'general',
      });
      toast.success("Información de la institución guardada");
    } catch (error) {
      console.error("Error guardando:", error);
      toast.error("Error al guardar la configuración");
    } finally {
      setSaving(false);
    }
  };

  // Guardar notificaciones
  const handleSaveNotificaciones = async () => {
    setSaving(true);
    try {
      localStorage.setItem('config:notificaciones', JSON.stringify(notificaciones));
      await saveSystemConfig({
        key: 'notificaciones',
        value: notificaciones,
        group: 'notifications',
      });
      toast.success("Configuración de notificaciones guardada");
    } catch (error) {
      console.error("Error guardando:", error);
      toast.error("Error al guardar la configuración");
    } finally {
      setSaving(false);
    }
  };

  // Guardar configuración académica
  const handleSaveAcademico = async () => {
    setSaving(true);
    try {
      localStorage.setItem('config:academico', JSON.stringify(academico));
      await saveSystemConfig({
        key: 'academico',
        value: academico,
        group: 'academic',
      });
      toast.success("Configuración académica guardada");
    } catch (error) {
      console.error("Error guardando:", error);
      toast.error("Error al guardar la configuración");
    } finally {
      setSaving(false);
    }
  };

  // Cambiar contraseña
  const handleChangePassword = async () => {
    if (!passwordForm.current || !passwordForm.new || !passwordForm.confirm) {
      toast.error("Complete todos los campos de contraseña");
      return;
    }

    if (passwordForm.new !== passwordForm.confirm) {
      toast.error("Las contraseñas nuevas no coinciden");
      return;
    }

    if (passwordForm.new.length < 8) {
      toast.error("La contraseña debe tener al menos 8 caracteres");
      return;
    }

    setSaving(true);
    try {
      await changePassword({
        current_password: passwordForm.current,
        password: passwordForm.new,
        password_confirmation: passwordForm.confirm,
      });
      toast.success("Contraseña cambiada exitosamente");
      setPasswordForm({ current: "", new: "", confirm: "" });
    } catch (error) {
      console.error("Error cambiando contraseña:", error);
      toast.error("Error al cambiar la contraseña. Verifique la contraseña actual.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-2">Cargando configuración...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="flex items-center gap-2">
          <Settings className="h-7 w-7 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold">Configuración del Sistema</h1>
            <p className="text-muted-foreground">
              Gestiona los ajustes generales de la plataforma
            </p>
          </div>
        </div>
        <Button variant="outline" onClick={loadData}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Recargar
        </Button>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Estudiantes</p>
                <p className="text-2xl font-bold">{stats.totalStudents}</p>
              </div>
              <User className="h-8 w-8 text-blue-500 opacity-80" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Docentes</p>
                <p className="text-2xl font-bold">{stats.totalTeachers}</p>
              </div>
              <User className="h-8 w-8 text-green-500 opacity-80" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Secciones</p>
                <p className="text-2xl font-bold">{stats.totalSections}</p>
              </div>
              <Database className="h-8 w-8 text-purple-500 opacity-80" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Gestión</p>
                <p className="text-2xl font-bold">{institucion.gestion}</p>
              </div>
              <Calendar className="h-8 w-8 text-orange-500 opacity-80" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Información de la Institución */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <School className="h-5 w-5 text-blue-600" />
              Información de la Institución
            </CardTitle>
            <CardDescription>
              Datos básicos de la unidad educativa
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre de la Institución</Label>
              <Input
                id="nombre"
                value={institucion.nombre}
                onChange={(e) => setInstitucion({ ...institucion, nombre: e.target.value })}
                placeholder="Nombre completo de la institución"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="director">Director(a)</Label>
              <Input
                id="director"
                value={institucion.director}
                onChange={(e) => setInstitucion({ ...institucion, director: e.target.value })}
                placeholder="Nombre del director"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="telefono">
                  <Phone className="h-3 w-3 inline mr-1" />
                  Teléfono
                </Label>
                <Input
                  id="telefono"
                  value={institucion.telefono}
                  onChange={(e) => setInstitucion({ ...institucion, telefono: e.target.value })}
                  placeholder="Número de teléfono"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">
                  <Mail className="h-3 w-3 inline mr-1" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={institucion.email}
                  onChange={(e) => setInstitucion({ ...institucion, email: e.target.value })}
                  placeholder="correo@institucion.edu"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="direccion">
                <MapPin className="h-3 w-3 inline mr-1" />
                Dirección
              </Label>
              <Input
                id="direccion"
                value={institucion.direccion}
                onChange={(e) => setInstitucion({ ...institucion, direccion: e.target.value })}
                placeholder="Dirección completa"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gestion">Gestión Actual</Label>
              <Select
                value={institucion.gestion}
                onValueChange={(value) => setInstitucion({ ...institucion, gestion: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[2024, 2025, 2026].map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleSaveInstitucion} disabled={saving} className="w-full">
              {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              Guardar Información
            </Button>
          </CardContent>
        </Card>

        {/* Configuración Académica */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-purple-600" />
              Configuración Académica
            </CardTitle>
            <CardDescription>
              Parámetros del sistema de calificaciones
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Escala de Notas</Label>
                <Select
                  value={academico.escalaNotas}
                  onValueChange={(value) => setAcademico({ ...academico, escalaNotas: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="100">0 - 100</SelectItem>
                    <SelectItem value="70">0 - 70</SelectItem>
                    <SelectItem value="10">0 - 10</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Nota Mínima Aprobatoria</Label>
                <Input
                  type="number"
                  value={academico.notaMinima}
                  onChange={(e) => setAcademico({ ...academico, notaMinima: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Decimales en Notas</Label>
                <Select
                  value={academico.decimales}
                  onValueChange={(value) => setAcademico({ ...academico, decimales: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Sin decimales</SelectItem>
                    <SelectItem value="1">1 decimal</SelectItem>
                    <SelectItem value="2">2 decimales</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Períodos por Año</Label>
                <Select
                  value={academico.periodos}
                  onValueChange={(value) => setAcademico({ ...academico, periodos: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">2 (Semestral)</SelectItem>
                    <SelectItem value="3">3 (Trimestral)</SelectItem>
                    <SelectItem value="4">4 (Bimestral)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Turno Principal</Label>
              <Select
                value={academico.turno}
                onValueChange={(value) => setAcademico({ ...academico, turno: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mañana">Mañana</SelectItem>
                  <SelectItem value="tarde">Tarde</SelectItem>
                  <SelectItem value="noche">Noche</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleSaveAcademico} disabled={saving} className="w-full">
              {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              Guardar Configuración
            </Button>
          </CardContent>
        </Card>

        {/* Notificaciones */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-amber-600" />
              Notificaciones
            </CardTitle>
            <CardDescription>
              Configura cómo se envían las notificaciones
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Notificaciones por Email</Label>
                  <p className="text-xs text-muted-foreground">Enviar notificaciones por correo</p>
                </div>
                <Switch
                  checked={notificaciones.email}
                  onCheckedChange={(checked) => setNotificaciones({ ...notificaciones, email: checked })}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label>Notificaciones SMS</Label>
                  <p className="text-xs text-muted-foreground">Enviar mensajes de texto</p>
                </div>
                <Switch
                  checked={notificaciones.sms}
                  onCheckedChange={(checked) => setNotificaciones({ ...notificaciones, sms: checked })}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label>Notificaciones Push</Label>
                  <p className="text-xs text-muted-foreground">Notificaciones en navegador</p>
                </div>
                <Switch
                  checked={notificaciones.push}
                  onCheckedChange={(checked) => setNotificaciones({ ...notificaciones, push: checked })}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label>Recordatorios de Pago</Label>
                  <p className="text-xs text-muted-foreground">Alertas de cuotas pendientes</p>
                </div>
                <Switch
                  checked={notificaciones.recordatoriosPago}
                  onCheckedChange={(checked) => setNotificaciones({ ...notificaciones, recordatoriosPago: checked })}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label>Alertas de Asistencia</Label>
                  <p className="text-xs text-muted-foreground">Notificar ausencias</p>
                </div>
                <Switch
                  checked={notificaciones.alertasAsistencia}
                  onCheckedChange={(checked) => setNotificaciones({ ...notificaciones, alertasAsistencia: checked })}
                />
              </div>
            </div>
            <Button onClick={handleSaveNotificaciones} disabled={saving} className="w-full">
              {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              Guardar Notificaciones
            </Button>
          </CardContent>
        </Card>

        {/* Seguridad */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-red-600" />
              Seguridad
            </CardTitle>
            <CardDescription>
              Cambiar contraseña y configuración de seguridad
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {currentUser && (
              <div className="p-3 bg-muted rounded-lg mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{currentUser.name}</span>
                </div>
                <p className="text-sm text-muted-foreground">{currentUser.email}</p>
                <div className="flex gap-1 mt-2">
                  {currentUser.roles.map((role) => (
                    <Badge key={role} variant="secondary" className="text-xs">
                      {role}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label>Contraseña Actual</Label>
              <div className="relative">
                <Input
                  type={showPasswords.current ? "text" : "password"}
                  value={passwordForm.current}
                  onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                  placeholder="••••••••"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                >
                  {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Nueva Contraseña</Label>
              <div className="relative">
                <Input
                  type={showPasswords.new ? "text" : "password"}
                  value={passwordForm.new}
                  onChange={(e) => setPasswordForm({ ...passwordForm, new: e.target.value })}
                  placeholder="••••••••"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                >
                  {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Confirmar Nueva Contraseña</Label>
              <div className="relative">
                <Input
                  type={showPasswords.confirm ? "text" : "password"}
                  value={passwordForm.confirm}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                  placeholder="••••••••"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                >
                  {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {passwordForm.new && passwordForm.new.length < 8 && (
              <div className="flex items-center gap-2 text-amber-600 text-sm">
                <AlertCircle className="h-4 w-4" />
                La contraseña debe tener al menos 8 caracteres
              </div>
            )}

            {passwordForm.new && passwordForm.confirm && passwordForm.new === passwordForm.confirm && (
              <div className="flex items-center gap-2 text-green-600 text-sm">
                <CheckCircle2 className="h-4 w-4" />
                Las contraseñas coinciden
              </div>
            )}

            <Button 
              onClick={handleChangePassword} 
              disabled={saving || !passwordForm.current || !passwordForm.new || passwordForm.new !== passwordForm.confirm}
              className="w-full"
            >
              {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Lock className="h-4 w-4 mr-2" />}
              Cambiar Contraseña
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
