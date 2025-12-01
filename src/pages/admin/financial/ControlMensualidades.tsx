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
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Lock,
  Unlock,
  Edit,
  Save,
  Plus,
  Percent,
  FileText,
} from "lucide-react";

// RFs cubiertos: RF-001, RF-002, RF-003
export default function ControlMensualidades() {
  const [montoBase, setMontoBase] = useState({
    inicial: 400,
    primaria: 450,
    secundaria: 500,
  });

  const [descuentos, setDescuentos] = useState({
    hermanos: 10,
    pagoAnticipado: 15,
  });

  // Mock: 10 meses febrero-noviembre con estado
  const [meses, setMeses] = useState([
    {
      nombre: "Febrero",
      habilitado: true,
      fechaLimite: "2025-02-28",
      estado: "activo",
    },
    {
      nombre: "Marzo",
      habilitado: true,
      fechaLimite: "2025-03-31",
      estado: "activo",
    },
    {
      nombre: "Abril",
      habilitado: false,
      fechaLimite: "2025-04-30",
      estado: "pendiente",
    },
    // ... resto de meses
  ]);

  const [estudiantesMock] = useState([
    {
      id: "E001",
      nombre: "Ana García",
      nivel: "primaria",
      estado: "al día",
      mesesPagados: ["Febrero", "Marzo"],
      deuda: 0,
    },
    {
      id: "E002",
      nombre: "Luis Pérez",
      nivel: "secundaria",
      estado: "mora",
      mesesPagados: ["Febrero"],
      deuda: 500,
    },
  ]);

  return (
    <div className="space-y-6">
      <Tabs defaultValue="estructura" className="w-full">
        <TabsList>
          <TabsTrigger value="estructura">Estructura de Pagos</TabsTrigger>
          <TabsTrigger value="calendario">Calendario</TabsTrigger>
          <TabsTrigger value="estados">Estados de Cuenta</TabsTrigger>
        </TabsList>

        {/* RF-001: Gestión de Estructura de Pagos */}
        <TabsContent value="estructura">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Montos Base por Nivel</CardTitle>
                <CardDescription>
                  Configure los montos mensuales por nivel educativo
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div className="flex items-center justify-between">
                    <span>Inicial</span>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={montoBase.inicial}
                        onChange={(e) =>
                          setMontoBase({
                            ...montoBase,
                            inicial: Number(e.target.value),
                          })
                        }
                        className="w-24"
                      />
                      <span>Bs.</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Primaria</span>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={montoBase.primaria}
                        onChange={(e) =>
                          setMontoBase({
                            ...montoBase,
                            primaria: Number(e.target.value),
                          })
                        }
                        className="w-24"
                      />
                      <span>Bs.</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Secundaria</span>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={montoBase.secundaria}
                        onChange={(e) =>
                          setMontoBase({
                            ...montoBase,
                            secundaria: Number(e.target.value),
                          })
                        }
                        className="w-24"
                      />
                      <span>Bs.</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Descuentos y Variaciones</CardTitle>
                <CardDescription>
                  Configure descuentos por hermanos y pago anticipado
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div className="flex items-center justify-between">
                    <span>Descuento Hermanos</span>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={descuentos.hermanos}
                        onChange={(e) =>
                          setDescuentos({
                            ...descuentos,
                            hermanos: Number(e.target.value),
                          })
                        }
                        className="w-24"
                      />
                      <Percent className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Descuento Pago Anticipado</span>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={descuentos.pagoAnticipado}
                        onChange={(e) =>
                          setDescuentos({
                            ...descuentos,
                            pagoAnticipado: Number(e.target.value),
                          })
                        }
                        className="w-24"
                      />
                      <Percent className="h-4 w-4" />
                    </div>
                  </div>
                </div>

                <Button className="w-full mt-4">
                  <Save className="mr-2 h-4 w-4" /> Guardar Cambios
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* RF-003: Habilitación/Deshabilitación de Meses */}
        <TabsContent value="calendario">
          <Card>
            <CardHeader>
              <CardTitle>Calendario de Pagos 2025</CardTitle>
              <CardDescription>
                Gestione la habilitación de meses y fechas límite
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mes</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Fecha límite</TableHead>
                      <TableHead>Habilitado</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {meses.map((m) => (
                      <TableRow key={m.nombre}>
                        <TableCell>{m.nombre}</TableCell>
                        <TableCell>
                          <Badge
                            variant={m.estado === "activo" ? "default" : "secondary"}
                          >
                            {m.estado}
                          </Badge>
                        </TableCell>
                        <TableCell className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          {m.fechaLimite}
                        </TableCell>
                        <TableCell>
                          <Switch
                            checked={m.habilitado}
                            onCheckedChange={(checked) => {
                              const newMeses = [...meses];
                              const index = newMeses.findIndex(
                                (mes) => mes.nombre === m.nombre
                              );
                              newMeses[index].habilitado = checked;
                              setMeses(newMeses);
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                const newMeses = [...meses];
                                const index = newMeses.findIndex(
                                  (mes) => mes.nombre === m.nombre
                                );
                                newMeses[index].habilitado =
                                  !newMeses[index].habilitado;
                                setMeses(newMeses);
                              }}
                            >
                              {m.habilitado ? (
                                <Lock className="h-4 w-4" />
                              ) : (
                                <Unlock className="h-4 w-4" />
                              )}
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

        {/* RF-002: Registro de Estados de Cuenta */}
        <TabsContent value="estados">
          <Card>
            <CardHeader>
              <CardTitle>Estados de Cuenta</CardTitle>
              <CardDescription>
                Visualice y gestione estados de cuenta por estudiante
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Estudiante</TableHead>
                      <TableHead>Nivel</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Meses Pagados</TableHead>
                      <TableHead>Deuda</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {estudiantesMock.map((e) => (
                      <TableRow key={e.id}>
                        <TableCell>{e.nombre}</TableCell>
                        <TableCell className="capitalize">{e.nivel}</TableCell>
                        <TableCell>
                          <Badge
                            variant={e.estado === "al día" ? "default" : "destructive"}
                          >
                            {e.estado}
                          </Badge>
                        </TableCell>
                        <TableCell>{e.mesesPagados.join(", ")}</TableCell>
                        <TableCell>
                          {e.deuda > 0 ? `${e.deuda} Bs.` : "---"}
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            <FileText className="mr-2 h-4 w-4" />
                            Ver Detalle
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
      </Tabs>
    </div>
  );
}