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
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Calendar,
  Lock,
  Save,
  Settings,
  Shield,
  UserCheck,
  Users,
} from "lucide-react";

// RFs cubiertos: RF-017, RF-018, RF-019
export default function ConfiguracionFinanciera() {
  const [permisos] = useState([
    {
      rol: "Director",
      permisos: [
        "Gestión completa",
        "Reportes financieros",
        "Configuración del sistema",
      ],
      usuarios: 2,
      estado: "activo",
    },
    {
      rol: "Finanzas",
      permisos: [
        "Registro de pagos",
        "Gestión de deudas",
        "Reportes básicos",
      ],
      usuarios: 3,
      estado: "activo",
    },
    {
      rol: "Secretaría",
      permisos: ["Registro de pagos", "Consultas básicas"],
      usuarios: 5,
      estado: "activo",
    },
  ]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Configuración Financiera</h2>
          <p className="text-muted-foreground">
            Configure los parámetros del sistema financiero
          </p>
        </div>
        <Button onClick={() => window.print()}>
          <Save className="mr-2 h-4 w-4" />
          Guardar Cambios
        </Button>
      </div>

      <Tabs defaultValue="parametros" className="w-full">
        <TabsList>
          <TabsTrigger value="parametros">Parámetros</TabsTrigger>
          <TabsTrigger value="permisos">Permisos</TabsTrigger>
          <TabsTrigger value="academico">Año Académico</TabsTrigger>
        </TabsList>

        {/* RF-017: Parámetros del Sistema */}
        <TabsContent value="parametros">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Parámetros Generales</CardTitle>
                <CardDescription>
                  Configure los parámetros básicos del sistema
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label>Año Académico Actual</Label>
                  <Input value="2025" disabled />
                </div>
                <div className="grid gap-2">
                  <Label>Día de Vencimiento</Label>
                  <Input type="number" placeholder="Ej: 10" defaultValue={10} />
                </div>
                <div className="grid gap-2">
                  <Label>Días Gracia</Label>
                  <Input type="number" placeholder="Ej: 5" defaultValue={5} />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Bloqueo Automático</Label>
                    <p className="text-sm text-muted-foreground">
                      Bloquear acceso por mora
                    </p>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Conceptos de Cobro</CardTitle>
                <CardDescription>
                  Defina los conceptos y montos adicionales
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-semibold">Materiales</h4>
                    <p className="text-sm text-muted-foreground">
                      Cargo anual por nivel
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      defaultValue="200"
                      className="w-24"
                    />
                    <span>Bs</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-semibold">Actividades</h4>
                    <p className="text-sm text-muted-foreground">
                      Cargo mensual
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      defaultValue="50"
                      className="w-24"
                    />
                    <span>Bs</span>
                  </div>
                </div>
                <Button variant="outline" className="w-full">
                  <Settings className="mr-2 h-4 w-4" />
                  Agregar Concepto
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* RF-018: Perfiles y Permisos */}
        <TabsContent value="permisos">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Gestión de Perfiles</CardTitle>
                  <CardDescription>
                    Configure roles y permisos del sistema
                  </CardDescription>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <Shield className="mr-2 h-4 w-4" />
                      Nuevo Rol
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Crear Nuevo Rol</DialogTitle>
                      <DialogDescription>
                        Defina un nuevo rol y sus permisos
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label>Nombre del Rol</Label>
                        <Input placeholder="Ej: Asistente Financiero" />
                      </div>
                      <div className="grid gap-2">
                        <Label>Descripción</Label>
                        <Input placeholder="Describa el propósito del rol" />
                      </div>
                      <div className="grid gap-2">
                        <Label>Permisos Base</Label>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <input type="checkbox" id="reg-pagos" />
                            <label htmlFor="reg-pagos">Registro de Pagos</label>
                          </div>
                          <div className="flex items-center gap-2">
                            <input type="checkbox" id="reportes" />
                            <label htmlFor="reportes">Ver Reportes</label>
                          </div>
                          <div className="flex items-center gap-2">
                            <input type="checkbox" id="config" />
                            <label htmlFor="config">Configuración</label>
                          </div>
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline">Cancelar</Button>
                      <Button>Crear Rol</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rol</TableHead>
                    <TableHead>Permisos</TableHead>
                    <TableHead>Usuarios</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {permisos.map((p) => (
                    <TableRow key={p.rol}>
                      <TableCell className="font-medium">{p.rol}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {p.permisos.map((permiso) => (
                            <Badge
                              key={permiso}
                              variant="secondary"
                              className="text-xs"
                            >
                              {permiso}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {p.usuarios}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{p.estado}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            <UserCheck className="mr-2 h-4 w-4" />
                            Usuarios
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Settings className="mr-2 h-4 w-4" />
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

        {/* RF-019: Año Académico */}
        <TabsContent value="academico">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Control de Año Académico</CardTitle>
                <CardDescription>
                  Gestione el ciclo académico-financiero
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 border rounded-lg space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-semibold">Año Actual: 2025</h4>
                      <p className="text-sm text-muted-foreground">
                        En curso (Marzo)
                      </p>
                    </div>
                    <Badge variant="default">Activo</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Button variant="outline" className="w-full">
                      <Lock className="mr-2 h-4 w-4" />
                      Cerrar Mes
                    </Button>
                    <Button variant="outline" className="w-full">
                      <Calendar className="mr-2 h-4 w-4" />
                      Nuevo Año
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Cierre Automático</Label>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-semibold">Cierre Mensual</h4>
                      <p className="text-sm text-muted-foreground">
                        Día 5 del siguiente mes
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Historial de Operaciones</CardTitle>
                <CardDescription>
                  Registro de cambios en el sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 border rounded-lg">
                    <Calendar className="h-8 w-8 text-muted-foreground" />
                    <div>
                      <h4 className="font-semibold">Cierre Febrero 2025</h4>
                      <p className="text-sm text-muted-foreground">
                        05/03/2025 - Automático
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 border rounded-lg">
                    <Calendar className="h-8 w-8 text-muted-foreground" />
                    <div>
                      <h4 className="font-semibold">Apertura Año 2025</h4>
                      <p className="text-sm text-muted-foreground">
                        15/01/2025 - Manual
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 border rounded-lg">
                    <Calendar className="h-8 w-8 text-muted-foreground" />
                    <div>
                      <h4 className="font-semibold">Cierre Año 2024</h4>
                      <p className="text-sm text-muted-foreground">
                        31/12/2024 - Automático
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}