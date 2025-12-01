import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Bell,
  Mail,
  MessageSquare,
  Phone,
  Save,
  Settings2,
  User,
  Users,
} from "lucide-react";

// RFs cubiertos: RF-020, RF-021
export default function Comunicaciones() {
  const [notificaciones] = useState([
    {
      tipo: "Recordatorio de Pago",
      canal: "Email",
      disparador: "5 días antes",
      estado: "activo",
      ultimoEnvio: "2025-02-25",
      destinatarios: 150,
    },
    {
      tipo: "Vencimiento",
      canal: "SMS + Email",
      disparador: "Día del vencimiento",
      estado: "activo",
      ultimoEnvio: "2025-02-28",
      destinatarios: 45,
    },
    {
      tipo: "Mora",
      canal: "SMS",
      disparador: "1 día después",
      estado: "inactivo",
      ultimoEnvio: "-",
      destinatarios: 0,
    },
  ]);

  const [mensajesRecientes] = useState([
    {
      padre: "Juan Pérez",
      asunto: "Consulta sobre factura",
      fecha: "2025-02-28",
      estado: "respondido",
    },
    {
      padre: "María García",
      asunto: "Plan de pagos",
      fecha: "2025-02-27",
      estado: "pendiente",
    },
  ]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Comunicaciones</h2>
          <p className="text-muted-foreground">
            Gestión de notificaciones y comunicación con padres
          </p>
        </div>
        <Button onClick={() => window.print()}>
          <Save className="mr-2 h-4 w-4" />
          Guardar Cambios
        </Button>
      </div>

      <Tabs defaultValue="notificaciones" className="w-full">
        <TabsList>
          <TabsTrigger value="notificaciones">Notificaciones</TabsTrigger>
          <TabsTrigger value="portal">Portal de Padres</TabsTrigger>
          <TabsTrigger value="configuracion">Configuración</TabsTrigger>
        </TabsList>

        {/* RF-020: Notificaciones Automáticas */}
        <TabsContent value="notificaciones">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Notificaciones Automáticas</CardTitle>
                  <CardDescription>
                    Gestione las notificaciones del sistema
                  </CardDescription>
                </div>
                <Button variant="outline">
                  <Bell className="mr-2 h-4 w-4" />
                  Nueva Notificación
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Canal</TableHead>
                    <TableHead>Disparador</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Último Envío</TableHead>
                    <TableHead>Destinatarios</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {notificaciones.map((n, i) => (
                    <TableRow key={i}>
                      <TableCell>{n.tipo}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{n.canal}</Badge>
                      </TableCell>
                      <TableCell>{n.disparador}</TableCell>
                      <TableCell>
                        <Badge
                          variant={n.estado === "activo" ? "default" : "secondary"}
                        >
                          {n.estado}
                        </Badge>
                      </TableCell>
                      <TableCell>{n.ultimoEnvio}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {n.destinatarios}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            Enviar
                          </Button>
                          <Button variant="ghost" size="sm">
                            Editar
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* RF-021: Comunicación con Padres */}
        <TabsContent value="portal">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Portal para Padres</CardTitle>
                <CardDescription>
                  Estado del portal y mensajes recientes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <User className="h-8 w-8 text-muted-foreground" />
                    <div>
                      <h4 className="font-semibold">Portal Activo</h4>
                      <p className="text-sm text-muted-foreground">
                        245 padres registrados
                      </p>
                    </div>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold">Mensajes Recientes</h4>
                  {mensajesRecientes.map((m, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{m.padre}</p>
                        <p className="text-sm text-muted-foreground">
                          {m.asunto}
                        </p>
                        <p className="text-xs text-muted-foreground">{m.fecha}</p>
                      </div>
                      <Badge
                        variant={
                          m.estado === "respondido" ? "default" : "secondary"
                        }
                      >
                        {m.estado}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Opciones del Portal</CardTitle>
                <CardDescription>
                  Configure las funcionalidades disponibles
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Estados de Cuenta</Label>
                      <p className="text-sm text-muted-foreground">
                        Permitir consulta de estados
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Descarga de Comprobantes</Label>
                      <p className="text-sm text-muted-foreground">
                        Acceso a facturas y recibos
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Mensajería Interna</Label>
                      <p className="text-sm text-muted-foreground">
                        Comunicación directa
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Pagos en Línea</Label>
                      <p className="text-sm text-muted-foreground">
                        Próximamente
                      </p>
                    </div>
                    <Switch disabled />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Configuración de Comunicaciones */}
        <TabsContent value="configuracion">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Configuración de Email</CardTitle>
                <CardDescription>
                  Configure los parámetros de correo
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label>Servidor SMTP</Label>
                  <Input placeholder="smtp.servidor.com" />
                </div>
                <div className="grid gap-2">
                  <Label>Puerto</Label>
                  <Input placeholder="587" type="number" />
                </div>
                <div className="grid gap-2">
                  <Label>Email Remitente</Label>
                  <Input placeholder="finanzas@colegio.edu" />
                </div>
                <Button className="w-full">
                  <Mail className="mr-2 h-4 w-4" />
                  Probar Conexión
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Configuración de SMS</CardTitle>
                <CardDescription>
                  Configure el servicio de mensajería
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label>Proveedor SMS</Label>
                  <Input placeholder="API Key del proveedor" />
                </div>
                <div className="grid gap-2">
                  <Label>Número Remitente</Label>
                  <Input placeholder="+591..." />
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Confirmación de Lectura</Label>
                      <p className="text-sm text-muted-foreground">
                        Rastrear entregas
                      </p>
                    </div>
                    <Switch />
                  </div>
                </div>
                <Button className="w-full">
                  <Phone className="mr-2 h-4 w-4" />
                  Probar SMS
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}