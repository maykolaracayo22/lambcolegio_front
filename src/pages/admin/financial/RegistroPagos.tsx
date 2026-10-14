import { useState, useEffect } from "react";
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
  Loader2,
  Receipt,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  getFinanceSummary,
  registerPayment,
  cancelPayment,
  getPaymentReceipt,
  getFeeConfigs,
  downloadBlob,
  formatCurrency,
  getPaymentMethodLabel,
  type FinanceSummary,
  type Payment,
  type PaymentMethod,
  type FeeConfig,
} from "@/services/finanzasApi";

// RFs cubiertos: RF-004, RF-005, RF-006
export default function RegistroPagos() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<FinanceSummary | null>(null);
  const [feeConfigs, setFeeConfigs] = useState<FeeConfig[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | "">("");
  const [paymentReference, setPaymentReference] = useState("");
  const [paymentNotes, setPaymentNotes] = useState("");

  // Lista de pagos recientes (de las cuentas cargadas)
  const [recentPayments, setRecentPayments] = useState<Array<{
    id: number;
    student_name: string;
    amount: number;
    method: PaymentMethod;
    date: string;
    receipt: string;
    status: string;
  }>>([]);

  useEffect(() => {
    // Verificar que hay token antes de hacer peticiones
    const token = localStorage.getItem('authToken');
    if (!token) {
      console.log('[RegistroPagos] Esperando autenticación...');
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
      const [summaryData, configs] = await Promise.all([
        getFinanceSummary(),
        getFeeConfigs().catch(() => []),
      ]);
      setSummary(summaryData);
      setFeeConfigs(configs);
    } catch (error) {
      console.error("Error cargando datos:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron cargar los datos financieros",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleRegisterPayment() {
    if (!selectedAccountId || !paymentAmount || !paymentMethod) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Por favor complete todos los campos obligatorios",
      });
      return;
    }

    try {
      setSubmitting(true);
      const response = await registerPayment({
        student_account_id: parseInt(selectedAccountId),
        amount: parseFloat(paymentAmount),
        payment_method: paymentMethod,
        reference: paymentReference || undefined,
        notes: paymentNotes || undefined,
      });

      toast({
        title: "Pago registrado",
        description: `Recibo: ${response.payment.receipt_number}`,
      });

      // Agregar a la lista de pagos recientes
      const cuenta = summary?.cuentas.find(
        (c) => c.student_id === parseInt(selectedAccountId)
      );
      if (cuenta) {
        setRecentPayments((prev) => [
          {
            id: response.payment.id,
            student_name: cuenta.student_name,
            amount: response.payment.amount,
            method: response.payment.payment_method,
            date: response.payment.payment_date,
            receipt: response.payment.receipt_number,
            status: "verificado",
          },
          ...prev,
        ]);
      }

      // Resetear formulario
      setDialogOpen(false);
      setSelectedAccountId("");
      setPaymentAmount("");
      setPaymentMethod("");
      setPaymentReference("");
      setPaymentNotes("");

      // Recargar datos
      loadData();
    } catch (error: unknown) {
      console.error("Error registrando pago:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error instanceof Error ? error.message : "No se pudo registrar el pago",
      });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDownloadReceipt(paymentId: number, receiptNumber: string) {
    try {
      const blob = await getPaymentReceipt(paymentId);
      downloadBlob(blob, `recibo_${receiptNumber}.pdf`);
      toast({
        title: "Recibo descargado",
        description: `${receiptNumber}.pdf`,
      });
    } catch (error) {
      console.error("Error descargando recibo:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo descargar el recibo",
      });
    }
  }

  async function handleCancelPayment(paymentId: number) {
    if (!confirm("¿Está seguro de anular este pago?")) return;

    try {
      await cancelPayment(paymentId);
      toast({
        title: "Pago anulado",
        description: "El pago ha sido anulado correctamente",
      });
      setRecentPayments((prev) =>
        prev.map((p) =>
          p.id === paymentId ? { ...p, status: "anulado" } : p
        )
      );
      loadData();
    } catch (error) {
      console.error("Error anulando pago:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo anular el pago",
      });
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-2">Cargando datos financieros...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Registro y Gestión de Pagos</h2>
          <p className="text-muted-foreground">
            Registre y gestione todos los pagos del sistema
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
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
                <Label htmlFor="estudiante">Cuenta del Estudiante *</Label>
                <Select
                  value={selectedAccountId}
                  onValueChange={setSelectedAccountId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione cuenta" />
                  </SelectTrigger>
                  <SelectContent>
                    {summary?.cuentas.map((cuenta) => (
                      <SelectItem
                        key={cuenta.student_id}
                        value={cuenta.student_id.toString()}
                      >
                        {cuenta.student_name} - Saldo: {formatCurrency(cuenta.saldo_pendiente)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="monto">Monto (Bs) *</Label>
                <Input
                  id="monto"
                  type="number"
                  placeholder="0.00"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="metodo">Método de Pago *</Label>
                <Select
                  value={paymentMethod}
                  onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione método" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EFECTIVO">Efectivo</SelectItem>
                    <SelectItem value="TRANSFERENCIA">Transferencia</SelectItem>
                    <SelectItem value="QR">Pago QR</SelectItem>
                    <SelectItem value="TARJETA">Tarjeta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="referencia">Referencia/Nro. Transferencia</Label>
                <Input
                  id="referencia"
                  placeholder="Opcional"
                  value={paymentReference}
                  onChange={(e) => setPaymentReference(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="notas">Notas</Label>
                <Input
                  id="notas"
                  placeholder="Notas adicionales"
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleRegisterPayment} disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  "Registrar Pago"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tarjetas de resumen */}
      {summary && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Recaudado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(summary.resumen_financiero.total_pagado)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pendiente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {formatCurrency(summary.resumen_financiero.total_pendiente)}
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
              <div className="text-2xl font-bold">
                {summary.resumen_financiero.porcentaje_recaudado}%
              </div>
            </CardContent>
          </Card>
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
        </div>
      )}

      <Tabs defaultValue="registro" className="w-full">
        <TabsList>
          <TabsTrigger value="registro">Registro de Pagos</TabsTrigger>
          <TabsTrigger value="cuentas">Cuentas de Estudiantes</TabsTrigger>
          <TabsTrigger value="configuracion">Configuración</TabsTrigger>
        </TabsList>

        {/* RF-004: Registro de Transacciones */}
        <TabsContent value="registro">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Pagos Registrados</CardTitle>
                  <CardDescription>
                    Lista de todos los pagos registrados en el sistema
                  </CardDescription>
                </div>
                <Button variant="outline" onClick={loadData}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Actualizar
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {recentPayments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Receipt className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No hay pagos registrados en esta sesión</p>
                  <p className="text-sm">
                    Los pagos registrados aparecerán aquí
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Estudiante</TableHead>
                        <TableHead>Monto</TableHead>
                        <TableHead>Método</TableHead>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Recibo</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentPayments.map((p) => (
                        <TableRow key={p.id}>
                          <TableCell className="font-mono">#{p.id}</TableCell>
                          <TableCell>{p.student_name}</TableCell>
                          <TableCell>{formatCurrency(p.amount)}</TableCell>
                          <TableCell>{getPaymentMethodLabel(p.method)}</TableCell>
                          <TableCell>{p.date}</TableCell>
                          <TableCell className="font-mono text-sm">
                            {p.receipt}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                p.status === "verificado"
                                  ? "default"
                                  : p.status === "anulado"
                                  ? "destructive"
                                  : "secondary"
                              }
                            >
                              {p.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                  handleDownloadReceipt(p.id, p.receipt)
                                }
                                title="Descargar recibo"
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                              {p.status !== "anulado" && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleCancelPayment(p.id)}
                                  title="Anular pago"
                                >
                                  <X className="h-4 w-4 text-red-500" />
                                </Button>
                              )}
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

        {/* Cuentas de Estudiantes */}
        <TabsContent value="cuentas">
          <Card>
            <CardHeader>
              <CardTitle>Cuentas de Estudiantes</CardTitle>
              <CardDescription>
                Estado de cuenta de todos los estudiantes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Estudiante</TableHead>
                      <TableHead className="text-right">Total Deuda</TableHead>
                      <TableHead className="text-right">Pagado</TableHead>
                      <TableHead className="text-right">Saldo</TableHead>
                      <TableHead>Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {summary?.cuentas.map((cuenta) => (
                      <TableRow key={cuenta.student_id}>
                        <TableCell className="font-medium">
                          {cuenta.student_name}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(cuenta.total_debt)}
                        </TableCell>
                        <TableCell className="text-right text-green-600">
                          {formatCurrency(cuenta.total_paid)}
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {formatCurrency(cuenta.saldo_pendiente)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              cuenta.status === "AL_DIA"
                                ? "default"
                                : cuenta.status === "MORA"
                                ? "destructive"
                                : "secondary"
                            }
                          >
                            {cuenta.status === "AL_DIA"
                              ? "Al día"
                              : cuenta.status === "MORA"
                              ? "En mora"
                              : "Pendiente"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* RF-005: Configuración */}
        <TabsContent value="configuracion">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Configuraciones de Cobro</CardTitle>
                <CardDescription>
                  Tipos de cobro definidos en el sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {feeConfigs.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">
                      No hay configuraciones de cobro
                    </p>
                  ) : (
                    feeConfigs.map((config) => (
                      <div
                        key={config.id}
                        className="flex justify-between items-center p-4 border rounded-lg"
                      >
                        <div>
                          <h4 className="font-semibold">{config.concepto}</h4>
                          <p className="text-sm text-muted-foreground">
                            {config.nivel}
                          </p>
                        </div>
                        <Badge
                          variant={config.activo ? "default" : "secondary"}
                        >
                          {formatCurrency(config.monto)}
                        </Badge>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Métodos de Pago</CardTitle>
                <CardDescription>
                  Métodos de pago aceptados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 border rounded-lg">
                    <div>
                      <h4 className="font-semibold">Efectivo</h4>
                      <p className="text-sm text-muted-foreground">
                        Pago en ventanilla
                      </p>
                    </div>
                    <Badge variant="outline">Activo</Badge>
                  </div>
                  <div className="flex justify-between items-center p-4 border rounded-lg">
                    <div>
                      <h4 className="font-semibold">Transferencia</h4>
                      <p className="text-sm text-muted-foreground">
                        Depósito bancario
                      </p>
                    </div>
                    <Badge variant="outline">Activo</Badge>
                  </div>
                  <div className="flex justify-between items-center p-4 border rounded-lg">
                    <div>
                      <h4 className="font-semibold">QR</h4>
                      <p className="text-sm text-muted-foreground">
                        Pago con código QR
                      </p>
                    </div>
                    <Badge variant="outline">Activo</Badge>
                  </div>
                  <div className="flex justify-between items-center p-4 border rounded-lg">
                    <div>
                      <h4 className="font-semibold">Tarjeta</h4>
                      <p className="text-sm text-muted-foreground">
                        Débito/Crédito
                      </p>
                    </div>
                    <Badge variant="outline">Activo</Badge>
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
