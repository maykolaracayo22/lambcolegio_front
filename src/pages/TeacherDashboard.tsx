// src/pages/teacher/TeacherDashboard.tsx
import { useEffect, useState, useMemo } from "react";
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
  BookOpen,
  FileText,
  ClipboardList,
  CalendarCheck,
  BarChart3,
  Download,
  NotebookPen,
  Layers,
  CalendarDays,
  CloudOff,
  Cloud,
  RefreshCw,
  User,
} from "lucide-react";
import { syncGradebookQueue } from "@/services/gradebookApi";
import { useToast } from "@/hooks/use-toast";

// Helpers para crear claves con scope por docente
const sanitizeId = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");

const getTeacherId = (fallbackName = "Docente") => {
  if (typeof window === "undefined") return "teacher";
  const byLogin = localStorage.getItem("teacherId"); // si lo seteas en el login
  if (byLogin) return byLogin;
  return sanitizeId(fallbackName); // fallback por nombre mostrado
};

const scopedGet = (teacherId: string, key: string, def: string | null = null) => {
  if (typeof window === "undefined") return def;
  return localStorage.getItem(`tt:${teacherId}:${key}`) ?? def;
};
const scopedSet = (teacherId: string, key: string, val: string) => {
  try {
    localStorage.setItem(`tt:${teacherId}:${key}`, val);
  } catch {}
};

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

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  // ⚠️ Ajusta estos dos si luego vienen de tu auth real:
  const teacherDisplayName = "María López";
  const teacherId = getTeacherId(teacherDisplayName);

  // Nivel elegido (lo guarda SelectNivel/LevelEntries de forma scoped)
  const [nivelLabel, setNivelLabel] = useState<string | null>(null);

  const currentYear = new Date().getFullYear().toString();
  const [year, setYear] = useState<string>(
    (scopedGet(teacherId, "year", currentYear) as string) || currentYear
  );
  const [term, setTerm] = useState<string>(
    (scopedGet(teacherId, "term", "T1") as string) || "T1"
  );

  // Estado de conexión/sincronización
  const [queueCount, setQueueCount] = useState<number>(readQueueCount());
  const [syncing, setSyncing] = useState<boolean>(false);

  const yearOptions = useMemo(() => {
    const y = parseInt(currentYear, 10);
    return [y.toString(), (y - 1).toString(), (y - 2).toString()];
  }, [currentYear]);
  const termOptions = ["T1", "T2", "T3"];

  // Cargar nivelLabel con scope; si no existe, intenta el global (compat)
  useEffect(() => {
    const scoped = scopedGet(teacherId, "nivelLabel");
    const fallback = typeof window !== "undefined" ? localStorage.getItem("nivelLabel") : null;
    setNivelLabel((scoped as string) ?? (fallback as string) ?? null);
  }, [teacherId]);

  // Persistir selecciones (scope docente)
  useEffect(() => {
    scopedSet(teacherId, "year", year);
  }, [teacherId, year]);
  useEffect(() => {
    scopedSet(teacherId, "term", term);
  }, [teacherId, term]);

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

  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(path + "/");

  const sidebarContent = (
    <div className="space-y-2">
      <Button
        variant="ghost"
        className="w-full justify-start"
        onClick={() => navigate("/dashboard/teacher/informacion-docente")}
      >
        <User className="h-4 w-4 mr-2" /> Información del Docente
      </Button>
      <Button
        variant={isActive("/dashboard/teacher/clases") ? "secondary" : "ghost"}
        className="w-full justify-start"
        onClick={() => navigate("/dashboard/teacher/clases")}
      >
        <BookOpen className="h-4 w-4 mr-2" /> Mis Clases
      </Button>
      <Button
        variant={isActive("/dashboard/teacher/calificaciones") ? "secondary" : "ghost"}
        className="w-full justify-start"
        onClick={() => navigate("/dashboard/teacher/calificaciones")}
      >
        <FileText className="h-4 w-4 mr-2" /> Mis Calificaciones
      </Button>
      <Button
        variant={isActive("/dashboard/teacher/tareas") ? "secondary" : "ghost"}
        className="w-full justify-start"
        onClick={() => navigate("/dashboard/teacher/tareas")}
      >
        <ClipboardList className="h-4 w-4 mr-2" /> Mis Tareas
      </Button>
      <Button
        variant={isActive("/dashboard/teacher/planificacion") ? "secondary" : "ghost"}
        className="w-full justify-start"
        onClick={() => navigate("/dashboard/teacher/planificacion")}
      >
        <CalendarCheck className="h-4 w-4 mr-2" /> Planificación
      </Button>
      <Button
        variant={isActive("/dashboard/teacher/horario") ? "secondary" : "ghost"}
        className="w-full justify-start"
        onClick={() => navigate("/dashboard/teacher/horario")}
      >
        <CalendarDays className="h-4 w-4 mr-2" /> Mi Horario
      </Button>
      <Button
        variant={isActive("/dashboard/teacher/reportes") ? "secondary" : "ghost"}
        className="w-full justify-start"
        onClick={() => navigate("/dashboard/teacher/reportes")}
      >
        <BarChart3 className="h-4 w-4 mr-2" /> Mis Reportes
      </Button>
      <Button
        variant={isActive("/dashboard/teacher/notas") ? "secondary" : "ghost"}
        className="w-full justify-start"
        onClick={() => navigate("/dashboard/teacher/notas")}
      >
        <NotebookPen className="h-4 w-4 mr-2" /> Notas
      </Button>
      <Button
        variant={isActive("/dashboard/teacher/registro-valoracion") ? "secondary" : "ghost"}
        className="w-full justify-start"
        onClick={() => navigate("/dashboard/teacher/registro-valoracion")}
      >
        <CalendarCheck className="h-4 w-4 mr-2" /> Registro de Valoracion
      </Button>
    </div>
  );

  return (
    <DashboardLayout
      userType="teacher"
      userName={teacherDisplayName}
      userInfo={`Docente de Matemática${nivelLabel ? ` • Nivel: ${nivelLabel}` : ""}`}
      sidebarContent={sidebarContent}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Panel del Docente</h1>
            <p className="text-muted-foreground">
              Gestiona tus clases, calificaciones, tareas, planificación, horario y reportes.
            </p>

            {/* Chips de contexto (scope docente) */}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="gap-1">
                <Layers className="h-3.5 w-3.5" />
                Nivel: {nivelLabel ?? "—"}
              </Badge>
              <Badge variant="outline">Año: {year}</Badge>
              <Badge variant="outline">Trimestre: {term}</Badge>

              <Button
                variant="link"
                className="px-1"
                onClick={() => navigate("/seleccionar-nivel")}
              >
                Cambiar nivel
              </Button>
            </div>
          </div>

          {/* Controles rápidos: Año / Trimestre (scope docente) + Estado conexión/sync */}
          <div className="flex flex-wrap gap-2 items-center">
            <Select value={year} onValueChange={setYear}>
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

            {/* Estado de conexión */}
            <Badge
              variant={navigator.onLine ? "success" : "destructive"}
              className="flex items-center gap-1"
              title={navigator.onLine ? "Conectado" : "Sin conexión"}
            >
              {navigator.onLine ? <Cloud className="h-3.5 w-3.5" /> : <CloudOff className="h-3.5 w-3.5" />}
              {navigator.onLine ? "Online" : "Offline"}
            </Badge>

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

            {queueCount > 0 && (
              <Badge variant="secondary" title="Cambios pendientes por enviar">
                Pendientes: {queueCount}
              </Badge>
            )}

            <Button variant="outline" onClick={() => window.print()}>
              <Download className="h-4 w-4 mr-2" />
              Descargar Reporte
            </Button>
          </div>
        </div>

        {/* Aviso si no hay nivel seleccionado */}
        {!nivelLabel && (
          <Card className="border-dashed">
            <CardHeader>
              <CardTitle>Selecciona un nivel para continuar</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <p className="text-muted-foreground">
                Aún no has seleccionado un nivel (Inicial, Primaria o Secundaria).
              </p>
              <Button onClick={() => navigate("/seleccionar-nivel")}>
                Elegir nivel
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Subpáginas renderizadas aquí */}
        <Outlet />

        {/* Bienvenida si estamos exactamente en /dashboard/teacher */}
        {location.pathname === "/dashboard/teacher" && (
          <Card>
            <CardHeader>
              <CardTitle>Bienvenido</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Usa el menú lateral para gestionar tus clases, calificaciones, tareas,
                planificación, <strong>horario</strong> y reportes. Los filtros de{" "}
                <strong>Año</strong> y <strong>Trimestre</strong> quedan guardados para tu usuario.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default TeacherDashboard;
