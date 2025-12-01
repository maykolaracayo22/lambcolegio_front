// src/pages/admin/AdminDashboard.tsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users,
  GraduationCap,
  BookOpen,
  CalendarDays,
  Settings,
  Download,
  Layers,
  Calendar,
  Waypoints,
  ClipboardList,
  Table2,
  Share,
  ShieldQuestion,
  Cloud,
  CloudOff,
  RefreshCw,
  Building2,
  Wallet,
} from "lucide-react";
import { syncGradebookQueue } from "@/services/gradebookApi";
import { useToast } from "@/hooks/use-toast";

const NIVELES = ["inicial", "primaria", "secundaria"] as const;
type NivelKey = (typeof NIVELES)[number];

// Lee tamaño de la cola offline global del gradebook
const readQueueCount = (): number => {
  try {
    const raw = localStorage.getItem("gradebook:queue");
    if (!raw) return 0;
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.length : 0;
  } catch {
    return 0;
  }
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(path + "/");

  const currentYear = new Date().getFullYear();
  const yearOptions = useMemo(
    () => [currentYear, currentYear - 1, currentYear - 2].map(String),
    [currentYear]
  );
  const termOptions = ["T1", "T2", "T3"];
  const structureOptions = ["trimestres", "bimestres", "mensual"];

  const [year, setYear] = useState<string>(
    localStorage.getItem("adm:year") || String(currentYear)
  );
  const [term, setTerm] = useState<string>(
    localStorage.getItem("adm:term") || "T1"
  );
  const [nivel, setNivel] = useState<NivelKey>(
    (localStorage.getItem("adm:nivel") as NivelKey) || "primaria"
  );
  const [structure, setStructure] = useState<string>(
    localStorage.getItem("adm:structure") || "trimestres"
  );

  // Estado de sincronización / cola offline
  const [queueCount, setQueueCount] = useState<number>(readQueueCount());
  const [syncing, setSyncing] = useState<boolean>(false);

  useEffect(() => {
    localStorage.setItem("adm:year", year);
  }, [year]);
  useEffect(() => {
    localStorage.setItem("adm:term", term);
  }, [term]);
  useEffect(() => {
    localStorage.setItem("adm:nivel", nivel);
  }, [nivel]);
  useEffect(() => {
    localStorage.setItem("adm:structure", structure);
  }, [structure]);

  // Mantener contador de cola y auto-sync al reconectar
  useEffect(() => {
    const tick = () => setQueueCount(readQueueCount());
    tick();
    const id = window.setInterval(tick, 4000);

    const onOnline = async () => {
      try {
        setSyncing(true);
        const res = await syncGradebookQueue();
        setQueueCount(readQueueCount());
        if (res.processed > 0) {
          toast({
            title: "Sincronización completada",
            description: `${res.processed} cambio(s) enviado(s). Pendientes: ${res.remaining}.`,
          });
        }
      } finally {
        setSyncing(false);
      }
    };

    window.addEventListener("online", onOnline);
    window.addEventListener("storage", tick);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("storage", tick);
      clearInterval(id);
    };
  }, [toast]);

  const handleManualSync = async () => {
    try {
      setSyncing(true);
      const res = await syncGradebookQueue();
      setQueueCount(readQueueCount());
      toast({
        title: "Sincronización",
        description: `Procesados: ${res.processed}. Pendientes: ${res.remaining}.`,
      });
    } finally {
      setSyncing(false);
    }
  };

  const sidebarContent = (
    <div className="space-y-2">
      {/* Secciones (Paralelos) */}
      <Button
        variant={isActive("/dashboard/admin/secciones") ? "secondary" : "ghost"}
        className="w-full justify-start"
        onClick={() => navigate("/dashboard/admin/secciones")}
      >
        <Building2 className="h-4 w-4 mr-2" /> Secciones
      </Button>

      {/* Centro de Control */}
      <Button
        variant={isActive("/dashboard/admin/overview") ? "secondary" : "ghost"}
        className="w-full justify-start"
        onClick={() => navigate("/dashboard/admin/overview")}
      >
        <Layers className="h-4 w-4 mr-2" /> Centro de Control
      </Button>
      <Button
        variant={isActive("/dashboard/admin/actas") ? "secondary" : "ghost"}
        className="w-full justify-start"
        onClick={() => navigate("/dashboard/admin/actas")}
      >
        <ClipboardList className="h-4 w-4 mr-2" /> Actas
      </Button>
      <Button
        variant={isActive("/dashboard/admin/reportes") ? "secondary" : "ghost"}
        className="w-full justify-start"
        onClick={() => navigate("/dashboard/admin/reportes")}
      >
        <Download className="h-4 w-4 mr-2" /> Reportes
      </Button>

      {/* Catálogos */}
      <Button
        variant={isActive("/dashboard/admin/estudiantes") ? "secondary" : "ghost"}
        className="w-full justify-start"
        onClick={() => navigate("/dashboard/admin/estudiantes")}
      >
        <Users className="h-4 w-4 mr-2" /> Estudiantes
      </Button>
      <Button
        variant={isActive("/dashboard/admin/docentes") ? "secondary" : "ghost"}
        className="w-full justify-start"
        onClick={() => navigate("/dashboard/admin/docentes")}
      >
        <GraduationCap className="h-4 w-4 mr-2" /> Docentes
      </Button>
      <Button
        variant={isActive("/dashboard/admin/materias") ? "secondary" : "ghost"}
        className="w-full justify-start"
        onClick={() => navigate("/dashboard/admin/materias")}
      >
        <BookOpen className="h-4 w-4 mr-2" /> Materias
      </Button>
      <Button
        variant={isActive("/dashboard/admin/periodos") ? "secondary" : "ghost"}
        className="w-full justify-start"
        onClick={() => navigate("/dashboard/admin/periodos")}
      >
        <CalendarDays className="h-4 w-4 mr-2" /> Períodos
      </Button>

      {/* Secretaría */}
      <Button
        variant={isActive("/dashboard/admin/secretaria") ? "secondary" : "ghost"}
        className="w-full justify-start"
        onClick={() => navigate("/dashboard/admin/secretaria")}
      >
        <Users className="h-4 w-4 mr-2" /> Secretaría
      </Button>

      {/* Operación */}
      <Button
        variant={isActive("/dashboard/admin/asignaciones") ? "secondary" : "ghost"}
        className="w-full justify-start"
        onClick={() => navigate("/dashboard/admin/asignaciones")}
      >
        <Waypoints className="h-4 w-4 mr-2" /> Asignaciones
      </Button>
      <Button
        variant={isActive("/dashboard/admin/horarios") ? "secondary" : "ghost"}
        className="w-full justify-start"
        onClick={() => navigate("/dashboard/admin/horarios")}
      >
        <Table2 className="h-4 w-4 mr-2" /> Horarios
      </Button>
      <Button
        variant={isActive("/dashboard/admin/evaluacion") ? "secondary" : "ghost"}
        className="w-full justify-start"
        onClick={() => navigate("/dashboard/admin/evaluacion")}
      >
        <ClipboardList className="h-4 w-4 mr-2" /> Estructura de Evaluación
      </Button>
      <Button
        variant={isActive("/dashboard/admin/import-export") ? "secondary" : "ghost"}
        className="w-full justify-start"
        onClick={() => navigate("/dashboard/admin/import-export")}
      >
        <Share className="h-4 w-4 mr-2" /> Importar/Exportar
      </Button>
      <Button
        variant={isActive("/dashboard/admin/auditoria") ? "secondary" : "ghost"}
        className="w-full justify-start"
        onClick={() => navigate("/dashboard/admin/auditoria")}
      >
        <ShieldQuestion className="h-4 w-4 mr-2" /> Auditoría
      </Button>

      {/* Módulo Financiero */}
      <Button
        variant={isActive("/dashboard/admin/financial") ? "secondary" : "ghost"}
        className="w-full justify-start"
        onClick={() => navigate("/dashboard/admin/financial")}
      >
        <Wallet className="h-4 w-4 mr-2" /> Módulo Financiero
      </Button>

      <Button
        variant={isActive("/dashboard/admin/configuracion") ? "secondary" : "ghost"}
        className="w-full justify-start"
        onClick={() => navigate("/dashboard/admin/configuracion")}
      >
        <Settings className="h-4 w-4 mr-2" /> Configuración
      </Button>
    </div>
  );

  return (
    <DashboardLayout
      userType="admin"
      userName="Administrador"
      userInfo="Gestión del sistema académico"
      sidebarContent={sidebarContent}
    >
      <div className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Panel del Administrador</h1>
            <p className="text-muted-foreground">
              Administra estudiantes, docentes, materias, períodos y los nuevos módulos.
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="gap-1">
                <Layers className="h-3.5 w-3.5" />
                Nivel: {nivel.toUpperCase()}
              </Badge>
              <Badge variant="outline" className="gap-1">
                <Calendar className="h-3.5 w-3.5" />
                Año: {year} • {term}
              </Badge>
              <Badge variant="outline">Estructura: {structure}</Badge>

              {/* Estado de conexión */}
              <Badge
                variant={navigator.onLine ? "success" : "destructive"}
                className="ml-2 flex items-center gap-1"
                title={navigator.onLine ? "Conectado" : "Sin conexión"}
              >
                {navigator.onLine ? (
                  <Cloud className="h-3.5 w-3.5" />
                ) : (
                  <CloudOff className="h-3.5 w-3.5" />
                )}
                {navigator.onLine ? "Online" : "Offline"}
              </Badge>

              {/* Cola de sincronización (global) */}
              {queueCount > 0 && (
                <Badge variant="secondary" title="Cambios pendientes por enviar">
                  Pendientes: {queueCount}
                </Badge>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            <Select value={String(year)} onValueChange={setYear}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Año" />
              </SelectTrigger>
              <SelectContent>
                {yearOptions.map((y) => (
                  <SelectItem key={y} value={y}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={term} onValueChange={setTerm}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Trimestre" />
              </SelectTrigger>
              <SelectContent>
                {termOptions.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={nivel} onValueChange={(v) => setNivel(v as NivelKey)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Nivel" />
              </SelectTrigger>
              <SelectContent>
                {NIVELES.map((n) => (
                  <SelectItem key={n} value={n}>
                    {n[0].toUpperCase() + n.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={structure} onValueChange={setStructure}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Estructura" />
              </SelectTrigger>
              <SelectContent>
                {structureOptions.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Sincronizar cola global */}
            <Button
              variant="outline"
              onClick={handleManualSync}
              disabled={syncing || queueCount === 0}
              title="Enviar cambios pendientes"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? "animate-spin" : ""}`} />
              {syncing ? "Sincronizando…" : "Sincronizar"}
            </Button>

            <Button variant="academicYellow" onClick={() => window.print()}>
              <Download className="h-4 w-4 mr-2" /> Exportar Datos
            </Button>
          </div>
        </div>

        <Outlet />

        {location.pathname === "/dashboard/admin" && (
          <Card>
            <CardHeader>
              <CardTitle>Bienvenido Administrador</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Usa el menú lateral. Los filtros globales se guardan como{" "}
                <code>adm:*</code> en <strong>localStorage</strong>. Además, verás aquí el
                estado de conexión y la cantidad de cambios en cola para sincronizar cuando
                vuelva la conexión.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;