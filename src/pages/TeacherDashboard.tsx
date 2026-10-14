// src/pages/teacher/TeacherDashboard.tsx
import { useEffect, useState, useMemo } from "react";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
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
import { getMyTeacherProfile, getMyTeacherSections, type TeacherAssignedSection, type TeacherPortalProfile } from "@/services/teachersApi";
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
  const { user } = useAuth();

  const teacherDisplayName = [user?.teacher?.nombre, user?.teacher?.apellido].filter(Boolean).join(" ") || user?.name || "Docente";
  const teacherId = String(user?.teacherId ?? user?.id ?? getTeacherId(teacherDisplayName));
  const routeState = location.state as { nivel?: string; nivelLabel?: string } | null;
  const requestedNivel = routeState?.nivel?.toLowerCase();
  const validLevels = ["inicial", "primaria", "secundaria"];

  // El nivel seleccionado se guarda en el espacio del docente autenticado.
  const [nivel, setNivel] = useState<string | null>(
    requestedNivel && validLevels.includes(requestedNivel)
      ? requestedNivel
      : scopedGet(teacherId, "nivel") || null
  );
  const nivelLabel = nivel ? nivel.charAt(0).toUpperCase() + nivel.slice(1) : null;
  const [teacherProfile, setTeacherProfile] = useState<TeacherPortalProfile | null>(null);
  const [assignedSections, setAssignedSections] = useState<TeacherAssignedSection[]>([]);
  const [assignmentsLoading, setAssignmentsLoading] = useState(false);
  const [assignmentsError, setAssignmentsError] = useState<string | null>(null);

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

  // Aplicar una selección nueva enviada por SelectNivel.
  useEffect(() => {
    if (requestedNivel && validLevels.includes(requestedNivel)) setNivel(requestedNivel);
  }, [requestedNivel]);

  useEffect(() => {
    if (!nivel) return;
    scopedSet(teacherId, "nivel", nivel);
    scopedSet(teacherId, "nivelLabel", nivelLabel || nivel);
    localStorage.setItem("teacherId", teacherId);
    localStorage.setItem("teacherName", teacherDisplayName);
    localStorage.setItem("nivel", nivel);
    localStorage.setItem("nivelLabel", nivelLabel || nivel);
  }, [teacherId, teacherDisplayName, nivel, nivelLabel]);

  useEffect(() => {
    let cancelled = false;
    getMyTeacherProfile(year)
      .then((profile) => { if (!cancelled) setTeacherProfile(profile); })
      .catch((error: unknown) => {
        console.error("No se pudo cargar el perfil docente:", error);
      });
    return () => { cancelled = true; };
  }, [year]);

  useEffect(() => {
    if (!nivel) {
      setAssignedSections([]);
      return;
    }

    let cancelled = false;
    setAssignmentsLoading(true);
    setAssignmentsError(null);
    getMyTeacherSections(year, nivel)
      .then((response) => {
        if (!cancelled) setAssignedSections(response.data || []);
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        const err = error as { response?: { data?: { message?: string } }; message?: string };
        setAssignedSections([]);
        setAssignmentsError(err.response?.data?.message || err.message || "No se pudieron cargar tus cursos asignados.");
      })
      .finally(() => { if (!cancelled) setAssignmentsLoading(false); });
    return () => { cancelled = true; };
  }, [year, nivel]);

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

  const assignedSubjectCount = assignedSections.reduce((count, section) => count + section.assignments.length, 0);
  const assignedSectionsCount = assignedSections.length;
  const hasAssignedCourses = assignedSectionsCount > 0 && assignedSubjectCount > 0;
  const sectionTitle = (section: TeacherAssignedSection) => `${section.curso}° ${section.paralelo ? `“${section.paralelo}”` : ""}`.trim();

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
      userInfo={`${teacherProfile?.especialidad || "Docente"}${nivelLabel ? ` • Nivel: ${nivelLabel}` : ""}`}
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

        {/* Elegir nivel si no hay contexto seleccionado */}
        {!nivel && (
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

        {nivel && assignmentsLoading && (
          <Card><CardContent className="flex items-center gap-3 py-8 text-muted-foreground"><RefreshCw className="h-5 w-5 animate-spin" />Cargando cursos y materias asignadas para {nivelLabel}…</CardContent></Card>
        )}

        {nivel && !assignmentsLoading && assignmentsError && (
          <Card className="border-destructive/40"><CardHeader><CardTitle className="flex items-center gap-2"><CloudOff className="h-5 w-5" />No se pudieron cargar tus asignaciones</CardTitle></CardHeader><CardContent className="text-muted-foreground">{assignmentsError}</CardContent></Card>
        )}

        {nivel && !assignmentsLoading && !assignmentsError && !hasAssignedCourses && (
          <Card className="border-amber-300 bg-amber-50/50">
            <CardHeader><CardTitle className="flex items-center gap-2"><BookOpen className="h-5 w-5 text-amber-600" />Sin cursos asignados para {nivelLabel}</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <p className="text-muted-foreground">No tienes cursos ni materias asignados en este nivel para el año {year}. El administrador debe asignarte secciones y materias antes de que puedas ingresar a sus módulos.</p>
              <Button variant="outline" onClick={() => navigate("/seleccionar-nivel")}>Cambiar nivel</Button>
            </CardContent>
          </Card>
        )}

        {nivel && !assignmentsLoading && !assignmentsError && hasAssignedCourses && (
          <>
            {location.pathname === "/dashboard/teacher" && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Nivel</p><p className="text-2xl font-bold">{nivelLabel}</p></CardContent></Card>
                  <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Cursos asignados</p><p className="text-2xl font-bold">{assignedSectionsCount}</p></CardContent></Card>
                  <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Materias asignadas</p><p className="text-2xl font-bold">{assignedSubjectCount}</p></CardContent></Card>
                </div>
                <Card>
                  <CardHeader><CardTitle>Mis cursos de {nivelLabel}</CardTitle></CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                    {assignedSections.map((section) => (
                      <Card key={section.id} className="border">
                        <CardHeader className="pb-2"><CardTitle className="text-base">{sectionTitle(section)}</CardTitle></CardHeader>
                        <CardContent className="space-y-2">
                          <p className="text-xs text-muted-foreground">{section.turno || "Turno no indicado"}{section.aula ? ` · Aula ${section.aula}` : ""}</p>
                          <div className="flex flex-wrap gap-1">
                            {section.assignments.map((assignment) => (
                              <Badge key={assignment.id} variant="secondary">{assignment.subject?.nombre || "Materia"}</Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </CardContent>
                </Card>
              </>
            )}
            <Outlet context={{ teacher: teacherProfile, nivel, year, sections: assignedSections }} />
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default TeacherDashboard;
