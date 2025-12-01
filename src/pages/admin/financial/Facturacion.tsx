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

// 👇 REEMPLAZA ESTA SECCIÓN:
import {
  FileText,
  Download,
  Printer,
  PlusCircle,
  Search,
  Upload,
  Check,
  AlertCircle,
} from "lucide-react";
// 👇 AGREGA ESTA LÍNEA NUEVA:
import { FaFilePdf } from "react-icons/fa";


// RFs cubiertos: RF-007, RF-008, RF-009
export default function Facturacion() {
  const [facturas] = useState([
    {
      numero: "F-001-2025",
      estudiante: "Ana Pérez",
      monto: 400,
      fecha: "2025-02-10",
      concepto: "Mensualidad Febrero",
      estado: "emitida",
    },
    {
      numero: "F-002-2025",
      estudiante: "Juan Gómez",
      monto: 4000,
      fecha: "2025-02-12",
      concepto: "Matrícula Anual",
      estado: "pendiente",
    },
  ]);

  const [documentos] = useState([
    {
      estudiante: "Ana Pérez",
      tipo: "Certificado de Nacimiento",
      estado: "completo",
      fecha: "2025-01-15",
    },
    {
      estudiante: "Juan Gómez",
      tipo: "Certificado de Vacunas",
      estado: "pendiente",
      fecha: "-",
    },
  ]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Facturación y Documentación</h2>
          <p className="text-muted-foreground">
            Gestione facturas, documentos y comprobantes
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Nueva Factura
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Emitir Nueva Factura</DialogTitle>
              <DialogDescription>
                Complete los datos para generar una nueva factura
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Número de Factura</Label>
                <Input disabled value="F-003-2025" />
              </div>
              <div className="grid gap-2">
                <Label>NIT/CI</Label>
                <Input placeholder="Ingrese NIT o CI" />
              </div>
              <div className="grid gap-2">
                <Label>Nombre/Razón Social</Label>
                <Input placeholder="Nombre completo" />
              </div>
              <div className="grid gap-2">
                <Label>Monto (Bs)</Label>
                <Input type="number" placeholder="0.00" />
              </div>
              <div className="grid gap-2">
                <Label>Concepto</Label>
                <Input placeholder="Detalle de la factura" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline">Vista Previa</Button>
              <Button>Emitir Factura</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="facturas" className="w-full">
        <TabsList>
          <TabsTrigger value="facturas">Facturas</TabsTrigger>
          <TabsTrigger value="documentos">Documentos</TabsTrigger>
          <TabsTrigger value="comprobantes">Comprobantes</TabsTrigger>
        </TabsList>

        {/* RF-007: Generación de Facturas Oficiales */}
        <TabsContent value="facturas">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Facturas Emitidas</CardTitle>
                  <CardDescription>
                    Gestione las facturas del sistema
                  </CardDescription>
                </div>
                <Input
                  placeholder="Buscar factura..."
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
                      <TableHead>Número</TableHead>
                      <TableHead>Estudiante</TableHead>
                      <TableHead>Monto</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Concepto</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {facturas.map((f) => (
                      <TableRow key={f.numero}>
                        <TableCell className="font-mono">{f.numero}</TableCell>
                        <TableCell>{f.estudiante}</TableCell>
                        <TableCell>{f.monto} Bs</TableCell>
                        <TableCell>{f.fecha}</TableCell>
                        <TableCell>{f.concepto}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              f.estado === "emitida" ? "default" : "secondary"
                            }
                          >
                            {f.estado}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
<Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center">
  <FaFilePdf className="h-6 w-6 mb-2 text-red-500" />
  Certificado de Pago
</Button>

                            <Button variant="ghost" size="icon">
                              <Printer className="h-4 w-4" />
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

        {/* RF-008: Control Documental */}
        <TabsContent value="documentos">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Control Documental</CardTitle>
                  <CardDescription>
                    Gestione los documentos requeridos por estudiante
                  </CardDescription>
                </div>
                <Button variant="outline">
                  <Upload className="mr-2 h-4 w-4" />
                  Subir Documento
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Estudiante</TableHead>
                      <TableHead>Tipo de Documento</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Fecha Carga</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {documentos.map((d, i) => (
                      <TableRow key={i}>
                        <TableCell>{d.estudiante}</TableCell>
                        <TableCell>{d.tipo}</TableCell>
                        <TableCell>
                          {d.estado === "completo" ? (
                            <Badge variant="default">
                              <Check className="mr-1 h-3 w-3" />
                              Completo
                            </Badge>
                          ) : (
                            <Badge variant="destructive">
                              <AlertCircle className="mr-1 h-3 w-3" />
                              Pendiente
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>{d.fecha}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm">
                              Ver
                            </Button>
                            <Button variant="ghost" size="sm">
                              Actualizar
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

        {/* RF-009: Comprobantes y Recibos */}
        <TabsContent value="comprobantes">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Generar Comprobantes</CardTitle>
                <CardDescription>
                  Emita diferentes tipos de comprobantes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Button className="w-full h-20 flex flex-col items-center justify-center">
                    <FileText className="h-6 w-6 mb-2" />
                    Recibo de Pago
                  </Button>
                  <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center">
                    <Download className="h-6 w-6 mb-2" />
                    Constancia de Solvencia
                  </Button>
                  <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center">
                     <FaFilePdf className="h-6 w-6 mb-2 text-red-500" />
                    Certificado de Pago
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Histórico de Comprobantes</CardTitle>
                <CardDescription>
                  Comprobantes emitidos recientemente
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">Recibo #R-001</p>
                      <p className="text-sm text-muted-foreground">
                        Ana Pérez - Febrero 2025
                      </p>
                    </div>
                    <Button variant="ghost" size="icon">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">Constancia #C-002</p>
                      <p className="text-sm text-muted-foreground">
                        Juan Gómez - Matrícula 2025
                      </p>
                    </div>
                    <Button variant="ghost" size="icon">
                      <Download className="h-4 w-4" />
                    </Button>
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