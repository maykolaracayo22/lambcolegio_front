import { useState, useEffect } from "react";
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
  Loader2,
  RefreshCw,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  getOverdueCharges,
  getFinanceSummary,
  formatCurrency,
  getMonthName,
  type AccountCharge,
  type StudentAccount,
  type FinanceSummary,
} from "@/services/finanzasApi";

// Tipo extendido para deudor
interface Deudor {
  student_id: number;
  student_name: string;
  nivel: string;
  total_adeudado: number;
  meses_adeudados: string[];
  dias_mora: number;
  status: string;
}

// RFs cubiertos: RF-010, RF-011, RF-012
export default function Morosidad() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [deudores, setDeudores] = useState<Deudor[]>([]);
  const [summary, setSummary] = useState<FinanceSummary | null>(null);

  useEffect(() => {
    // Verificar que hay token antes de hacer peticiones
    const token = localStorage.getItem('authToken');
    if (!token) {
      console.log('[Morosidad] Esperando autenticación...');
      setLoading(false);
      return;
    }
    
    const timer = setTimeout(() => {
      loadData();
    }, 500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadData() {
    // Doble verificación de token
    const token = localStorage.getItem('authToken');
    if (!token) return;
    
    try {
      setLoading(true);
      const [overdueData, summaryData] = await Promise.all([
        getOverdueCharges(),
        getFinanceSummary(),
      ]);

      setSummary(summaryData);

      // Agrupar cargos vencidos por estudiante
      const deudoresMap = new Map<number, Deudor>();
      
      overdueData.data.forEach((charge: AccountCharge & { studentAccount: StudentAccount }) => {
        const studentId = charge.studentAccount.student_id;
        const studentName = charge.studentAccount.student?.nombres + ' ' + charge.studentAccount.student?.apellidos;
        const nivel = charge.studentAccount.student?.nivel || 'N/A';
        
        if (!deudoresMap.has(studentId)) {
          deudoresMap.set(studentId, {
            student_id: studentId,
            student_name: studentName,
            nivel: nivel,
            total_adeudado: 0,
            meses_adeudados: [],
            dias_mora: 0,
            status: 'pendiente',
          });
        }

        const deudor = deudoresMap.get(studentId)!;
        deudor.total_adeudado += (charge.amount - charge.paid_amount);
        
        // Agregar mes si no existe
        const mesNombre = getMonthName(charge.month);
        if (!deudor.meses_adeudados.includes(mesNombre)) {
          deudor.meses_adeudados.push(mesNombre);
        }

        // Calcular días de mora
        const dueDate = new Date(charge.due_date);
        const today = new Date();
        const diasMora = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
        if (diasMora > deudor.dias_mora) {
          deudor.dias_mora = diasMora;
        }

        // Actualizar estado
        if (diasMora > 30) {
          deudor.status = 'vencido';
        }
      });

      setDeudores(Array.from(deudoresMap.values()));
    } catch (error) {
      console.error("Error cargando datos:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron cargar los datos de morosidad",
      });
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-2">Cargando datos de morosidad...</span>
      </div>
    );
  }

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
          <Button variant="outline" onClick={loadData}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Actualizar
          </Button>
          <Button variant="outline">
            <Mail className="mr-2 h-4 w-4" />
            Recordatorios
          </Button>
        </div>
      </div>

      {/* Tarjetas de Resumen */}
      {summary && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Estudiantes en Mora
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {summary.resumen_estados.en_mora}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Deuda
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(summary.resumen_financiero.total_pendiente)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Cargos Vencidos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {deudores.length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                % Recaudación
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {summary.resumen_financiero.porcentaje_recaudado}%
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="deudores" className="w-full">
        <TabsList>
          <TabsTrigger value="deudores">Deudores</TabsTrigger>
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
              </div>
            </CardHeader>
            <CardContent>
              {deudores.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No hay cargos vencidos</p>
                  <p className="text-sm">
                    Todos los estudiantes están al día
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Estudiante</TableHead>
                        <TableHead>Nivel</TableHead>
                        <TableHead className="text-right">Monto Adeudado</TableHead>
                        <TableHead>Meses</TableHead>
                        <TableHead>Días Mora</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {deudores.map((d) => (
                        <TableRow key={d.student_id}>
                          <TableCell className="font-medium">{d.student_name}</TableCell>
                          <TableCell className="capitalize">{d.nivel}</TableCell>
                          <TableCell className="text-right font-semibold text-red-600">
                            {formatCurrency(d.total_adeudado)}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {d.meses_adeudados.map((mes) => (
                                <Badge key={mes} variant="outline" className="text-xs">
                                  {mes}
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={d.dias_mora > 30 ? "destructive" : "secondary"}
                            >
                              {d.dias_mora} días
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                d.status === "vencido" ? "destructive" : "secondary"
                              }
                            >
                              {d.status === "vencido" ? "Vencido" : "Pendiente"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="icon" title="Enviar recordatorio">
                                <Send className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" title="Llamar">
                                <Phone className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
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
