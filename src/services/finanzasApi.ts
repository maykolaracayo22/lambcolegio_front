// src/services/finanzasApi.ts
// API para módulo financiero - Conectado a Backend Laravel

import axios from "axios";
import { API_BASE } from "@/lib/config";

// Cliente HTTP
const api = axios.create({
  baseURL: API_BASE,
  withCredentials: false,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

// Agregar token si existe
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ===== TIPOS =====

export type PaymentMethod = "EFECTIVO" | "TRANSFERENCIA" | "QR" | "TARJETA";
export type ChargeStatus = "PENDING" | "PARTIAL" | "PAID" | "CANCELLED";
export type AccountStatus = "AL_DIA" | "PENDIENTE" | "MORA";
export type ChargeConcept = "MATRICULA" | "MENSUALIDAD" | "OTRO";

export interface StudentAccount {
  id: number;
  student_id: number;
  year: number;
  total_debt: number;
  total_paid: number;
  saldo_pendiente?: number;
  status: AccountStatus;
  student?: {
    id: number;
    nombres: string;
    apellidos: string;
    nivel?: string;
    curso?: string;
    paralelo?: string;
  };
  accountCharges?: AccountCharge[];
  payments?: Payment[];
}

export interface AccountCharge {
  id: number;
  student_account_id: number;
  concept: ChargeConcept;
  description: string;
  amount: number;
  paid_amount: number;
  due_date: string;
  month: number;
  year: number;
  status: ChargeStatus;
  created_at?: string;
}

export interface Payment {
  id: number;
  student_account_id: number;
  amount: number;
  payment_method: PaymentMethod;
  receipt_number: string;
  reference?: string;
  payment_date: string;
  notes?: string;
  status?: string;
  paymentItems?: PaymentItem[];
}

export interface PaymentItem {
  id: number;
  payment_id: number;
  account_charge_id: number;
  amount_applied: number;
  accountCharge?: AccountCharge;
}

export interface EstadoCuenta {
  total_deuda: number;
  total_pagado: number;
  saldo_pendiente: number;
  cargos_pendientes: number;
  cargos_vencidos: number;
  ultimo_pago?: string;
  estado: AccountStatus;
}

export interface FinanceSummary {
  year: number;
  total_estudiantes: number;
  resumen_financiero: {
    total_deuda: number;
    total_pagado: number;
    total_pendiente: number;
    porcentaje_recaudado: number;
  };
  resumen_estados: {
    en_mora: number;
    al_dia: number;
    pendientes: number;
  };
  cuentas: Array<{
    student_id: number;
    student_name: string;
    total_debt: number;
    total_paid: number;
    saldo_pendiente: number;
    status: AccountStatus;
  }>;
}

export interface RegisterPaymentRequest {
  student_account_id: number;
  amount: number;
  payment_method: PaymentMethod;
  reference?: string;
  payment_date?: string;
  notes?: string;
}

export interface RegisterPaymentResponse {
  message: string;
  payment: Payment;
  items_aplicados: PaymentItem[];
  estado_cuenta: EstadoCuenta;
}

export interface GenerateFeesRequest {
  year: number;
  nivel?: string;
  grado?: number;
  paralelo?: string;
  mes?: string;
  fee_config_id: number;
  preview?: boolean;
}

export interface GenerateFeesResponse {
  message: string;
  year: number;
  nivel: string;
  total_estudiantes: number;
  charges_created?: number;
  charges_skipped?: number;
  monto_por_estudiante?: number;
  monto_total_teorico?: number;
}

export interface FeeConfig {
  id: number;
  nivel: string;
  concepto: string;
  monto: number;
  mes?: string;
  vence_el?: string;
  activo: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

// ===== FUNCIONES API =====

/**
 * Obtener estado de cuenta de un estudiante
 * GET /api/fees/{studentId}
 */
export async function getStudentLedger(
  studentId: number,
  year?: number
): Promise<{
  student: { id: number; nombres: string; apellidos: string };
  account: StudentAccount;
  estado_cuenta: EstadoCuenta;
  year: number;
}> {
  const response = await api.get(`/fees/${studentId}`, {
    params: { year },
  });
  return response.data;
}

/**
 * Registrar un pago
 * POST /api/fees/pagos
 */
export async function registerPayment(
  data: RegisterPaymentRequest
): Promise<RegisterPaymentResponse> {
  const response = await api.post("/fees/pagos", data);
  return response.data;
}

/**
 * Anular un pago
 * PATCH /api/fees/{paymentId}/cancel
 */
export async function cancelPayment(paymentId: number): Promise<{
  message: string;
  payment: Payment;
}> {
  const response = await api.patch(`/fees/${paymentId}/cancel`);
  return response.data;
}

/**
 * Obtener resumen financiero del año
 * GET /api/finance/reports/summary
 */
export async function getFinanceSummary(year?: number): Promise<FinanceSummary> {
  const response = await api.get("/finance/reports/summary", {
    params: { year },
  });
  return response.data;
}

/**
 * Generar reporte central PDF
 * GET /api/fees/reports/central
 */
export async function getCentralReportPDF(year?: number): Promise<Blob> {
  const response = await api.get("/fees/reports/central", {
    params: { year },
    responseType: "blob",
  });
  return response.data;
}

/**
 * Obtener cargos pendientes
 * GET /api/finance/charges/pending
 */
export async function getPendingCharges(
  year?: number
): Promise<PaginatedResponse<AccountCharge & { studentAccount: StudentAccount }>> {
  const response = await api.get("/finance/charges/pending", {
    params: { year },
  });
  return response.data;
}

/**
 * Obtener cargos vencidos
 * GET /api/finance/charges/overdue
 */
export async function getOverdueCharges(
  year?: number
): Promise<PaginatedResponse<AccountCharge & { studentAccount: StudentAccount }>> {
  const response = await api.get("/finance/charges/overdue", {
    params: { year },
  });
  return response.data;
}

/**
 * Generar cargos masivos
 * POST /api/fees/generate
 */
export async function generateFees(
  data: GenerateFeesRequest
): Promise<GenerateFeesResponse> {
  const response = await api.post("/fees/generate", data);
  return response.data;
}

/**
 * Generar recibo de pago PDF
 * GET /api/finance/payments/{paymentId}/receipt
 */
export async function getPaymentReceipt(paymentId: number): Promise<Blob> {
  const response = await api.get(`/finance/payments/${paymentId}/receipt`, {
    responseType: "blob",
  });
  return response.data;
}

/**
 * Obtener configuraciones de cobro
 * GET /api/fee-configs
 */
export async function getFeeConfigs(): Promise<FeeConfig[]> {
  const response = await api.get("/fee-configs");
  return response.data;
}

// ===== HELPERS =====

export function downloadBlob(blob: Blob, filename: string): void {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

export function getStatusColor(status: AccountStatus): string {
  const colors: Record<AccountStatus, string> = {
    AL_DIA: "bg-green-100 text-green-700",
    PENDIENTE: "bg-yellow-100 text-yellow-700",
    MORA: "bg-red-100 text-red-700",
  };
  return colors[status] || "bg-gray-100 text-gray-700";
}

export function getStatusLabel(status: AccountStatus): string {
  const labels: Record<AccountStatus, string> = {
    AL_DIA: "Al día",
    PENDIENTE: "Pendiente",
    MORA: "En mora",
  };
  return labels[status] || status;
}

export function getChargeStatusColor(status: ChargeStatus): string {
  const colors: Record<ChargeStatus, string> = {
    PENDING: "bg-yellow-100 text-yellow-700",
    PARTIAL: "bg-blue-100 text-blue-700",
    PAID: "bg-green-100 text-green-700",
    CANCELLED: "bg-gray-100 text-gray-700",
  };
  return colors[status] || "bg-gray-100 text-gray-700";
}

export function getChargeStatusLabel(status: ChargeStatus): string {
  const labels: Record<ChargeStatus, string> = {
    PENDING: "Pendiente",
    PARTIAL: "Parcial",
    PAID: "Pagado",
    CANCELLED: "Anulado",
  };
  return labels[status] || status;
}

export function getPaymentMethodLabel(method: PaymentMethod): string {
  const labels: Record<PaymentMethod, string> = {
    EFECTIVO: "Efectivo",
    TRANSFERENCIA: "Transferencia",
    QR: "QR",
    TARJETA: "Tarjeta",
  };
  return labels[method] || method;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("es-BO", {
    style: "currency",
    currency: "BOB",
    minimumFractionDigits: 2,
  }).format(amount);
}

export function getConceptLabel(concept: ChargeConcept): string {
  const labels: Record<ChargeConcept, string> = {
    MATRICULA: "Matrícula",
    MENSUALIDAD: "Mensualidad",
    OTRO: "Otro",
  };
  return labels[concept] || concept;
}

export function getMonthName(month: number): string {
  const months = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];
  return months[month - 1] || `Mes ${month}`;
}
