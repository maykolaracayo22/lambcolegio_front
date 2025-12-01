import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  PlusCircle,
  FileUp,
  Check,
  X,
  AlertCircle,
  Download,
  RefreshCw,
  FileText,
  Search,
} from "lucide-react";

// RFs cubiertos: RF-004, RF-005, RF-006
export default function RegistroPagos() {
  const [pagos] = useState([
    {
      id: "P-001",
      estudiante: "Ana Pérez",
      monto: 400,
      metodo: "Efectivo",
      fecha: "2025-02-10",
      tipo: "Mensual",
      estado: "verificado",
      comprobante: true,
    },
    {
      id: "P-002",
      estudiante: "Juan Gómez",
      monto: 200,
      metodo: "Transferencia",
      fecha: "2025-02-12",
      tipo: "Parcial",
      estado: "pendiente",
      comprobante: true,
    },
    {
      id: "P-003",
      estudiante: "María López",
      monto: 4000,
      metodo: "Transferencia",
      fecha: "2025-02-15",
      tipo: "Anual",
      estado: "verificado",
      comprobante: true,
    },
  ]);

  const [conciliacion] = useState([
    {
      fecha: "2025-02-10",
      referencia: "TRF-001",
      monto: 400,
      estado: "conciliado",
      origen: "Banco XYZ",
    },
    {
      fecha: "2025-02-12",
      referencia: "TRF-002",
      monto: 200,
      estado: "pendiente",
      origen: "Banco ABC",
    },
  ]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Registro y Gestión de Pagos</h2>
          <p className="text-muted-foreground">
            Registre y gestione todos los pagos del sistema
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Nuevo Pago
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Registrar Nuevo Pago</DialogTitle>
              <DialogDescription>
                Complete los datos del pago. Los campos con * son obligatorios.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="estudiante">Estudiante *</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione estudiante" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ana">Ana Pérez</SelectItem>
                    <SelectItem value="juan">Juan Gómez</SelectItem>
                    <SelectItem value="maria">María López</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="tipo">Tipo de Pago *</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mensual">Mensual (400 Bs)</SelectItem>
                    <SelectItem value="anual">Anual (con descuento)</SelectItem>
                    <SelectItem value="parcial">Pago Parcial</SelectItem>
                    <SelectItem value="matricula">Matrícula</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="monto">Monto (Bs) *</Label>
                <Input id="monto" type="number" placeholder="0.00" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="metodo">Método de Pago *</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione método" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="efectivo">Efectivo</SelectItem>
                    <SelectItem value="transferencia">Transferencia</SelectItem>
                    <SelectItem value="qr">Pago QR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Comprobante</Label>
                <Button variant="outline" className="w-full">
                  <FileUp className="mr-2 h-4 w-4" />
                  Subir Comprobante
                </Button>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline">Cancelar</Button>
              <Button>Registrar Pago</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="registro" className="w-full">
        <TabsList>
          <TabsTrigger value="registro">Registro de Pagos</TabsTrigger>
          <TabsTrigger value="conciliacion">Conciliación</TabsTrigger>
          <TabsTrigger value="configuracion">Configuración</TabsTrigger>
        </TabsList>

        {/* RF-004: Registro de Transacciones */}
        <TabsContent value="registro">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Transacciones Registradas</CardTitle>
                  <CardDescription>
                    Lista de todos los pagos registrados en el sistema
                  </CardDescription>
                </div>
                <Input
                  placeholder="Buscar transacción..."
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
                      <TableHead>ID</TableHead>
                      <TableHead>Estudiante</TableHead>
                      <TableHead>Monto</TableHead>
                      <TableHead>Método</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Comprobante</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pagos.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell className="font-mono">{p.id}</TableCell>
                        <TableCell>{p.estudiante}</TableCell>
                        <TableCell>{p.monto} Bs</TableCell>
                        <TableCell>{p.metodo}</TableCell>
                        <TableCell>{p.fecha}</TableCell>
                        <TableCell>{p.tipo}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              p.estado === "verificado" ? "default" : "secondary"
                            }
                          >
                            {p.estado}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {p.comprobante ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <X className="h-4 w-4 text-red-500" />
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon">
                              <Search className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
                              <FileText className="h-4 w-4" />
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

        {/* RF-006: Conciliación Bancaria */}
        <TabsContent value="conciliacion">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Conciliación Bancaria</CardTitle>
                  <CardDescription>
                    Concilie pagos con estados de cuenta bancarios
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline">
                    <FileUp className="mr-2 h-4 w-4" />
                    Importar Estado
                  </Button>
                  <Button variant="outline">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Auto-Conciliar
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Referencia</TableHead>
                      <TableHead>Monto</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Origen</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {conciliacion.map((c, i) => (
                      <TableRow key={i}>
                        <TableCell>{c.fecha}</TableCell>
                        <TableCell className="font-mono">{c.referencia}</TableCell>
                        <TableCell>{c.monto} Bs</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              c.estado === "conciliado" ? "default" : "secondary"
                            }
                          >
                            {c.estado}
                          </Badge>
                        </TableCell>
                        <TableCell>{c.origen}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            Vincular
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

        {/* RF-005: Tipos de Pago y Configuración */}
        <TabsContent value="configuracion">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Tipos de Pago</CardTitle>
                <CardDescription>
                  Configure los tipos de pago disponibles
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 border rounded-lg">
                    <div>
                      <h4 className="font-semibold">Pago Mensual</h4>
                      <p className="text-sm text-muted-foreground">
                        Mensualidad estándar
                      </p>
                    </div>
                    <Badge>400 Bs</Badge>
                  </div>
                  <div className="flex justify-between items-center p-4 border rounded-lg">
                    <div>
                      <h4 className="font-semibold">Pago Anual</h4>
                      <p className="text-sm text-muted-foreground">
                        Con 15% descuento
                      </p>
                    </div>
                    <Badge variant="secondary">3,400 Bs</Badge>
                  </div>
                  <div className="flex justify-between items-center p-4 border rounded-lg">
                    <div>
                      <h4 className="font-semibold">Pago Parcial</h4>
                      <p className="text-sm text-muted-foreground">
                        Mínimo 50% del total
                      </p>
                    </div>
                    <Badge variant="outline">Variable</Badge>
                  </div>
                  <Button className="w-full">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Agregar Tipo
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Métodos de Pago</CardTitle>
                <CardDescription>
                  Gestione los métodos de pago aceptados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div>
                        <h4 className="font-semibold">Efectivo</h4>
                        <p className="text-sm text-muted-foreground">
                          Pago en ventanilla
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline">Activo</Badge>
                  </div>
                  <div className="flex justify-between items-center p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div>
                        <h4 className="font-semibold">Transferencia</h4>
                        <p className="text-sm text-muted-foreground">
                          Banco XYZ - Cta: 1234567
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline">Activo</Badge>
                  </div>
                  <div className="flex justify-between items-center p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div>
                        <h4 className="font-semibold">QR</h4>
                        <p className="text-sm text-muted-foreground">
                          Pago con código QR
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary">Inactivo</Badge>
                  </div>
                  <Button className="w-full">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Agregar Método
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