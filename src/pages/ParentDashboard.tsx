// src/pages/ParentDashboard.tsx
import { useState } from "react";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BookOpen, User, TrendingUp, Calendar, FileText, 
  Star, CheckCircle, MessageSquare, AlertCircle,
  Download, Bell, WhatsApp 
} from "lucide-react";
import NivelBadge from '@/pages/parent/components/NivelBadge';
import QuickAction from '@/pages/parent/components/QuickAction';
import React, { Suspense } from 'react';
const PaymentQR = React.lazy(() => import('@/pages/parent/components/PaymentQR'));
import ProgressMini from '@/pages/parent/components/ProgressMini';

// Pequeño componente local para anillos de progreso accesibles (sin deps)
function ProgressRing({ value = 0, size = 64, stroke = 8, color = '#4f46e5', label = '' }: { value?: number; size?: number; stroke?: number; color?: string; label?: string }) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.max(0, Math.min(100, value)) / 100) * circumference;
  return (
    <figure className="flex flex-col items-center" aria-label={label} role="img">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="block">
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="#e6e6e6" strokeWidth={stroke} fill="none" />
        <circle cx={size / 2} cy={size / 2} r={radius} stroke={color} strokeWidth={stroke} fill="none" strokeLinecap="round" strokeDasharray={`${circumference} ${circumference}`} strokeDashoffset={offset} transform={`rotate(-90 ${size / 2} ${size / 2})`} />
        <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fontSize={size * 0.23} fill="#111" className="pointer-events-none font-semibold">{value}%</text>
      </svg>
      {label && <figcaption className="sr-only">{label}: {value}%</figcaption>}
    </figure>
  );
}

const ParentDashboard = () => {
  const [selectedStudent] = useState("Juan Pérez Martínez");
  const navigate = useNavigate();
  const location = useLocation();

  // 🔹 Sidebar personalizado para padres
  const sidebarContent = (
    <div className="space-y-2">
      <Button
        variant="ghost"
        className="w-full justify-start"
        onClick={() => navigate("/dashboard/parent/informacion-estudiante")}
      >
        <User className="h-4 w-4 mr-2" /> Información del Estudiante
      </Button>

      <Button
        variant="ghost"
        className="w-full justify-start"
        onClick={() => navigate("/dashboard/parent/notas-academicas")}
      >
        <BookOpen className="h-4 w-4 mr-2" /> Notas Académicas
      </Button>

      <Button
        variant="ghost"
        className="w-full justify-start"
        onClick={() => navigate("/dashboard/parent/conducta")}
      >
        <Star className="h-4 w-4 mr-2" /> Conducta
      </Button>

      <Button
        variant="ghost"
        className="w-full justify-start"
        onClick={() => navigate("/dashboard/parent/tareas")}
      >
        <Calendar className="h-4 w-4 mr-2" /> Tareas
      </Button>

      <Button
        variant="ghost"
        className="w-full justify-start"
        onClick={() => navigate("/dashboard/parent/progreso")}
      >
        <TrendingUp className="h-4 w-4 mr-2" /> Progreso
      </Button>

      <Button
        variant="ghost"
        className="w-full justify-start"
        onClick={() => navigate("/dashboard/parent/reportes")}
      >
        <FileText className="h-4 w-4 mr-2" /> Reportes
      </Button>

      {/* ➕ NUEVO: botón Asistencia (padres) */}
      <Button
        variant="ghost"
        className="w-full justify-start"
        onClick={() => navigate("/dashboard/parent/asistencia")}
      >
        <CheckCircle className="h-4 w-4 mr-2" /> Asistencia
      </Button>
      <Button
        variant="ghost"
        className="w-full justify-start"
        onClick={() => navigate("/dashboard/parent/logrosparents")}
      >
        <CheckCircle className="h-4 w-4 mr-2" /> Logros
      </Button>
    </div>
  );

  return (
    <DashboardLayout
      userType="parent"
      userName="María González"
      userInfo="Madre de Juan Pérez"
      sidebarContent={sidebarContent}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Panel de Padres</h1>
            <p className="text-muted-foreground">
              Seguimiento académico de:{" "}
              <span className="font-semibold text-foreground">{selectedStudent}</span>
            </p>
          </div>
          <Button variant="academicYellow" onClick={() => alert("Generando reporte PDF…")}>
            <Download className="h-4 w-4 mr-2" />
            Generar Reporte
          </Button>
        </div>

        {/* Outlet para páginas internas */}
        <Outlet />

        {/* Si estamos exactamente en /dashboard/parent (sin subruta), mostramos bienvenida mejorada */}
        {location.pathname === "/dashboard/parent" && (
          <section aria-labelledby="welcome-title">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle id="welcome-title">Bienvenida</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Usa el menú lateral para navegar por la información de tu hijo.</p>
                  <div className="mt-3">
                    <div className="font-medium">Nivel:</div>
                    <div className="mt-2"><NivelBadge nivel="Primaria" /></div>
                  </div>
                  <div className="mt-4">
                    <div className="font-medium">Contacto rápido</div>
                    <div className="flex gap-2 mt-2">
                      <Button onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`Hola, soy la madre de ${selectedStudent} y tengo una consulta.`)}`, '_blank')} aria-label="Contactar por WhatsApp" className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" /> WhatsApp
                      </Button>
                      <Button variant="outline" onClick={() => window.location.href = `sms:?body=${encodeURIComponent(`Hola, soy la madre de ${selectedStudent} y tengo una consulta.`)}`} aria-label="Enviar SMS">
                        SMS
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Accesos rápidos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2">
                    <QuickAction id="qa-notas" label="Notas" icon={BookOpen} color="indigo" onClick={() => navigate('/dashboard/parent/notas-academicas')} />
                    <QuickAction id="qa-asistencia" label="Asistencia" icon={CheckCircle} color="emerald" onClick={() => navigate('/dashboard/parent/asistencia')} />
                    <QuickAction id="qa-tareas" label="Tareas" icon={Calendar} color="yellow" onClick={() => navigate('/dashboard/parent/tareas')} />
                    <QuickAction id="qa-progreso" label="Progreso" icon={TrendingUp} color="sky" onClick={() => navigate('/dashboard/parent/progreso')} />
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Pago rápido</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">Paga desde tu celular escaneando el QR con la app del banco o compartiendo el código al cobro.</p>
                      <div className="mt-3">
                        <Suspense fallback={<div className="text-sm text-muted-foreground">Cargando pago…</div>}>
                          {/* @ts-ignore lazy-loaded component */}
                          <PaymentQR bank="Banco Unión" amount={250} reference="COLE-2025-001" />
                        </Suspense>
                      </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Resumen Rápido</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div>
                          <div className="text-sm text-muted-foreground">Promedio</div>
                          <div className="font-semibold text-lg">78 / 100</div>
                        </div>
                      </div>
                      <ProgressRing value={78} size={72} stroke={8} color="#4f46e5" label="Promedio general" />
                    </div>
                    <div className="mt-4">
                      <ProgressMini label="Asistencia" value={92} color="emerald" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ParentDashboard;
