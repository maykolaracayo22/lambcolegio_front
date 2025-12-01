import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Settings, School, Bell, Lock, Users, Save, AlertTriangle, RefreshCw, Info, Trash2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

export default function AdminConfiguracion() {
  const [nombreInstitucion, setNombreInstitucion] = useState("Academia Innovadora");
  const [direccionInstitucion, setDireccionInstitucion] = useState("Av. Principal #123, Ciudad");
  const [telefonoInstitucion, setTelefonoInstitucion] = useState("555-9876");

  const [notificacionesEmail, setNotificacionesEmail] = useState(true);
  const [notificacionesSMS, setNotificacionesSMS] = useState(false);
  const [notificacionesPush, setNotificacionesPush] = useState(true);

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const handleSaveInstitucionInfo = () => {
    localStorage.setItem("adm:institucion", JSON.stringify({ nombreInstitucion, direccionInstitucion, telefonoInstitucion }));
    toast.success("Información de la institución guardada.");
  };

  const handleSaveNotificaciones = () => {
    localStorage.setItem("adm:notificaciones", JSON.stringify({ notificacionesEmail, notificacionesSMS, notificacionesPush }));
    toast.success("Ajustes de notificaciones guardados.");
  };

  const handleChangePassword = () => {
    if (newPassword !== confirmNewPassword) return toast.error("Las nuevas contraseñas no coinciden.");
    if (newPassword.length < 6) return toast.error("La nueva contraseña debe tener al menos 6 caracteres.");
    // Aquí iría la llamada real al backend
    toast.success("Contraseña cambiada exitosamente.");
    setOldPassword(""); setNewPassword(""); setConfirmNewPassword("");
  };

  const handleRunSystemCheck = () => {
    toast.info("Chequeo del sistema iniciado…");
    setTimeout(() => toast.success("Chequeo del sistema completado. ¡Todo OK!"), 1500);
  };

  return (
    <div className="space-y-6 p-4">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Settings className="h-7 w-7 text-blue-600" />
            Configuración del Sistema
          </h1>
          <p className="text-muted-foreground">Gestiona los ajustes generales de la plataforma y la institución.</p>
        </div>
      </div>

      <Separator className="my-6" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Institución */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-600">
              <School className="h-5 w-5" /> Información de la Institución
            </CardTitle>
            <CardDescription>Actualiza los datos básicos de la escuela o academia.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nombreInstitucion">Nombre de la Institución</Label>
              <Input id="nombreInstitucion" value={nombreInstitucion} onChange={(e) => setNombreInstitucion(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="direccionInstitucion">Dirección</Label>
              <Input id="direccionInstitucion" value={direccionInstitucion} onChange={(e) => setDireccionInstitucion(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="telefonoInstitucion">Teléfono</Label>
              <Input id="telefonoInstitucion" value={telefonoInstitucion} onChange={(e) => setTelefonoInstitucion(e.target.value)} />
            </div>
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white" onClick={handleSaveInstitucionInfo}>
              <Save className="h-4 w-4 mr-2" /> Guardar Información
            </Button>
          </CardContent>
        </Card>

        {/* Notificaciones */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-600">
              <Bell className="h-5 w-5" /> Ajustes de Notificaciones
            </CardTitle>
            <CardDescription>Configura cómo se envían las notificaciones a los usuarios.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="notificacionesEmail">Notificaciones por Email</Label>
              <Switch id="notificacionesEmail" checked={notificacionesEmail} onCheckedChange={setNotificacionesEmail} />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="notificacionesSMS">Notificaciones por SMS</Label>
              <Switch id="notificacionesSMS" checked={notificacionesSMS} onCheckedChange={setNotificacionesSMS} />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="notificacionesPush">Notificaciones Push (Web)</Label>
              <Switch id="notificacionesPush" checked={notificacionesPush} onCheckedChange={setNotificacionesPush} />
            </div>
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white" onClick={handleSaveNotificaciones}>
              <Save className="h-4 w-4 mr-2" /> Guardar Ajustes
            </Button>
          </CardContent>
        </Card>

        {/* Seguridad */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-600">
              <Lock className="h-5 w-5" /> Seguridad
            </CardTitle>
            <CardDescription>Cambia la contraseña de tu cuenta de administrador.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="oldPassword">Contraseña Actual</Label>
              <Input id="oldPassword" type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">Nueva Contraseña</Label>
              <Input id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmNewPassword">Confirmar Nueva Contraseña</Label>
              <Input id="confirmNewPassword" type="password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} />
            </div>
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white" onClick={handleChangePassword}>
              <Save className="h-4 w-4 mr-2" /> Cambiar Contraseña
            </Button>
          </CardContent>
        </Card>

        {/* Mantenimiento */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-600">
              <RefreshCw className="h-5 w-5" /> Mantenimiento del Sistema
            </CardTitle>
            <CardDescription>Chequeos y acciones de mantenimiento.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Ejecuta un chequeo de integridad o restablece valores si es necesario.
            </p>
            <Button variant="outline" className="w-full text-blue-600 border-blue-600 hover:bg-blue-50" onClick={handleRunSystemCheck}>
              <AlertTriangle className="h-4 w-4 mr-2 text-orange-500" />
              Ejecutar Chequeo del Sistema
            </Button>
            <Button variant="destructive" className="w-full mt-2" onClick={() => toast.error("Función no implementada")}>
              <Trash2 className="h-4 w-4 mr-2" />
              Restablecer Valores Predeterminados
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
