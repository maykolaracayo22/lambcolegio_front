import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertTriangle,
  Calendar,
  FileText,
  Mail,
  Phone,
  PlusCircle,
  Search,
  Send,
} from "lucide-react";

// RFs cubiertos: RF-010, RF-011, RF-012
export default function Morosidad() {
  const [deudores] = useState([
    {
      id: "E-001",
      nombre: "María Lopez",
      nivel: "Secundaria",
      adeudado: 1200,
      mesesAdeudados: ["Enero", "Febrero", "Marzo"],
      estado: "vencido",
      diasMora: 45,
      planPago: false,
    },
    {
      id: "E-002",
      nombre: "Pedro Ruiz",
      nivel: "Primaria",
      adeudado: 400,
      mesesAdeudados: ["Marzo"],
      estado: "pendiente",
      diasMora: 15,
      planPago: true,
    },
  ]);

  const [planesPago] = useState([
    {
      id: "PP-001",
      estudiante: "Pedro Ruiz",
      montoTotal: 400,
      cuotas: 2,
      montoCuota: 200,
      fechaInicio: "2025-03-15",
      estado: "activo",
    },
  ]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gestión de Deudas y Morosidad</h2>
          <p className="text-muted-foreground">
            Control de deudas, planes de pago e intereses
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Mail className="mr-2 h-4 w-4" />
            Recordatorios
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Nuevo Plan de Pago
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Crear Plan de Pago</DialogTitle>
                <DialogDescription>
                  Configure un plan de pagos personalizado
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Estudiante</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione estudiante" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="maria">María Lopez</SelectItem>
                      <SelectItem value="pedro">Pedro Ruiz</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Monto Total Adeudado</Label>
                  <Input disabled value="1,200 Bs" />
                </div>
                <div className="grid gap-2">
                  <Label>Número de Cuotas</Label>
                  <Input type="number" placeholder="Ej: 3" />
                </div>
                <div className="grid gap-2">
                  <Label>Fecha Primera Cuota</Label>
                  <Input type="date" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline">Cancelar</Button>
                <Button>Crear Plan</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="deudores" className="w-full">
        <TabsList>
          <TabsTrigger value="deudores">Deudores</TabsTrigger>
          <TabsTrigger value="planes">Planes de Pago</TabsTrigger>
          <TabsTrigger value="configuracion">Intereses</TabsTrigger>
        </TabsList>

        {/* RF-010: Seguimiento de Deudas */}
        <TabsContent value="deudores">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Lista de Deudores</CardTitle>
                  <CardDescription>
                    Estudiantes con pagos pendientes o vencidos
                  </CardDescription>
                </div>
                <Input
                  placeholder="Buscar deudor..."
                  className="max-w-xs"
                  type="search"
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Estudiante</TableHead>
                      <TableHead>Nivel</TableHead>
                      <TableHead>Monto Adeudado</TableHead>
                      <TableHead>Meses</TableHead>
                      <TableHead>Días Mora</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Plan de Pago</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {deudores.map((d) => (
                      <TableRow key={d.id}>
                        <TableCell>{d.nombre}</TableCell>
                        <TableCell>{d.nivel}</TableCell>
                        <TableCell>{d.adeudado} Bs</TableCell>
                        <TableCell>{d.mesesAdeudados.join(", ")}</TableCell>
                        <TableCell>
                          <Badge
                            variant={d.diasMora > 30 ? "destructive" : "secondary"}
                          >
                            {d.diasMora} días
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              d.estado === "vencido" ? "destructive" : "default"
                            }
                          >
                            {d.estado}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {d.planPago ? (
                            <Badge variant="default">Activo</Badge>
                          ) : (
                            <Badge variant="outline">No tiene</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon">
                              <Send className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
                              <Phone className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* RF-011: Planes de Pago */}
        <TabsContent value="planes">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Planes de Pago Activos</CardTitle>
                  <CardDescription>
                    Seguimiento de planes de pago personalizados
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID Plan</TableHead>
                      <TableHead>Estudiante</TableHead>
                      <TableHead>Monto Total</TableHead>
                      <TableHead>Cuotas</TableHead>
                      <TableHead>Monto Cuota</TableHead>
                      <TableHead>Inicio</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {planesPago.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell className="font-mono">{p.id}</TableCell>
                        <TableCell>{p.estudiante}</TableCell>
                        <TableCell>{p.montoTotal} Bs</TableCell>
                        <TableCell>{p.cuotas}</TableCell>
                        <TableCell>{p.montoCuota} Bs</TableCell>
                        <TableCell>{p.fechaInicio}</TableCell>
                        <TableCell>
                          <Badge variant="default">{p.estado}</Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            <FileText className="mr-2 h-4 w-4" />
                            Ver Plan
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* RF-012: Gestión de Intereses y Recargos */}
        <TabsContent value="configuracion">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Configuración de Intereses</CardTitle>
                <CardDescription>
                  Configure los intereses por mora y recargos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-semibold">Interés por Mora</h4>
                      <p className="text-sm text-muted-foreground">
                        Aplicado después de 30 días
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        defaultValue="2"
                        className="w-20"
                      />
                      <span>%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-semibold">Recargo por Retraso</h4>
                      <p className="text-sm text-muted-foreground">
                        Monto fijo por pago tardío
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        defaultValue="50"
                        className="w-20"
                      />
                      <span>Bs</span>
                    </div>
                  </div>
                  <Button className="w-full">Guardar Cambios</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Alertas y Recordatorios</CardTitle>
                <CardDescription>
                  Configure las alertas automáticas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <Calendar className="h-8 w-8 text-muted-foreground" />
                      <div>
                        <h4 className="font-semibold">5 días antes</h4>
                        <p className="text-sm text-muted-foreground">
                          Recordatorio preventivo
                        </p>
                      </div>
                    </div>
                    <Badge>Email</Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <AlertTriangle className="h-8 w-8 text-muted-foreground" />
                      <div>
                        <h4 className="font-semibold">1 día después</h4>
                        <p className="text-sm text-muted-foreground">
                          Notificación de vencimiento
                        </p>
                      </div>
                    </div>
                    <Badge>SMS + Email</Badge>
                  </div>
                  <Button variant="outline" className="w-full">
                    Configurar Notificaciones
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}