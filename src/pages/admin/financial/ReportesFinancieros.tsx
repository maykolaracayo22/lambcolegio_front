import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { Download, FileSpreadsheet } from "lucide-react";
import { FaFilePdf } from "react-icons/fa";

// Datos mock para los gráficos
const ingresosPorNivel = [
  { mes: "Feb", inicial: 12000, primaria: 24000, secundaria: 18000 },
  { mes: "Mar", inicial: 11500, primaria: 23500, secundaria: 17800 },
  { mes: "Abr", inicial: 12200, primaria: 24200, secundaria: 18200 },
  // ... más datos
];

const morosidadData = [
  { nivel: "Inicial", total: 45000, mora: 3500, tasa: 7.8 },
  { nivel: "Primaria", total: 85000, mora: 5200, tasa: 6.1 },
  { nivel: "Secundaria", total: 65000, mora: 4800, tasa: 7.4 },
];

// RFs cubiertos: RF-013, RF-014, RF-015, RF-016
export default function ReportesFinancieros() {
  const [periodo, setPeriodo] = useState("2025");
  const [nivel, setNivel] = useState("todos");

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Reportes Financieros</h2>
        <div className="flex gap-2">
          <Select value={periodo} onValueChange={setPeriodo}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2025">2025</SelectItem>
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="2023">2023</SelectItem>
            </SelectContent>
          </Select>
          <Select value={nivel} onValueChange={setNivel}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Nivel" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="inicial">Inicial</SelectItem>
              <SelectItem value="primaria">Primaria</SelectItem>
              <SelectItem value="secundaria">Secundaria</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="ingresos" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="ingresos">Ingresos</TabsTrigger>
          <TabsTrigger value="morosidad">Morosidad</TabsTrigger>
          <TabsTrigger value="estudiantes">Por Estudiante</TabsTrigger>
          <TabsTrigger value="legal">Legal/MINEDU</TabsTrigger>
        </TabsList>

        {/* RF-013: Reportes de Ingresos */}
        <TabsContent value="ingresos">
          <Card>
            <CardHeader>
              <CardTitle>Ingresos por Nivel Educativo</CardTitle>
              <CardDescription>
                Comparativa mensual de ingresos y proyecciones
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={ingresosPorNivel}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mes" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="inicial" stroke="#8884d8" />
                    <Line type="monotone" dataKey="primaria" stroke="#82ca9d" />
                    <Line type="monotone" dataKey="secundaria" stroke="#ffc658" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <Button variant="outline" size="sm">
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Excel
                </Button>
                <Button variant="outline" size="sm">
                  <FaFilePdf className="mr-2 h-4 w-4 text-red-500" />

                  PDF
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* RF-014: Reportes de Morosidad */}
        <TabsContent value="morosidad">
          <Card>
            <CardHeader>
              <CardTitle>Estado de Morosidad</CardTitle>
              <CardDescription>
                Análisis de cartera vencida por nivel
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={morosidadData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="nivel" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="total" fill="#8884d8" name="Total" />
                    <Bar dataKey="mora" fill="#82ca9d" name="En Mora" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4">
                <h4 className="font-semibold mb-2">Resumen de Morosidad</h4>
                <div className="grid grid-cols-3 gap-4">
                  {morosidadData.map((item) => (
                    <Card key={item.nivel}>
                      <CardContent className="pt-6">
                        <p className="text-sm font-medium">{item.nivel}</p>
                        <p className="text-2xl font-bold">{item.tasa}%</p>
                        <p className="text-xs text-muted-foreground">
                          Tasa de morosidad
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* RF-015: Reportes por Estudiante */}
        <TabsContent value="estudiantes">
          <Card>
            <CardHeader>
              <CardTitle>Reportes por Estudiante</CardTitle>
              <CardDescription>
                Estados de cuenta y documentación
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Aquí iría una tabla o lista de estudiantes con sus estados financieros */}
                <p className="text-muted-foreground">
                  Seleccione un estudiante para ver su estado de cuenta detallado
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* RF-016: Reportes Legales MINEDU */}
        <TabsContent value="legal">
          <Card>
            <CardHeader>
              <CardTitle>Documentación Legal y MINEDU</CardTitle>
              <CardDescription>
                Reportes oficiales y documentación para auditorías
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" className="h-24 flex flex-col items-center justify-center">
                  <Download className="h-8 w-8 mb-2" />
                  Formularios RUDE
                </Button>
                <Button variant="outline" className="h-24 flex flex-col items-center justify-center">
                  <Download className="h-8 w-8 mb-2" />
                  Reporte de Matrícula
                </Button>
                <Button variant="outline" className="h-24 flex flex-col items-center justify-center">
                  <Download className="h-8 w-8 mb-2" />
                  Estadísticas
                </Button>
                <Button variant="outline" className="h-24 flex flex-col items-center justify-center">
                  <Download className="h-8 w-8 mb-2" />
                  Doc. Auditoría
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}