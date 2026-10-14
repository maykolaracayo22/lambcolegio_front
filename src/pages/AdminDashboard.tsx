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
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
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
  ClipboardCheck,
  Table2,
  Share,
  ShieldQuestion,
  Cloud,
  CloudOff,
  RefreshCw,
  Building2,
  Wallet,
  UserPlus,
  Users2,
  School,
  Shield,
  ChevronDown,
  LayoutDashboard,
  FolderOpen,
  Cog,
  FileText,
  FileCheck,
  Megaphone,
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

  // Estados para grupos colapsables del sidebar
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    academico: true,
    personas: true,
    operacion: false,
    sistema: false,
  });

  const toggleGroup = (group: string) => {
    setOpenGroups(prev => ({ ...prev, [group]: !prev[group] }));
  };

  // Componente de grupo colapsable
  const SidebarGroup = ({ 
    id, 
    title, 
    icon: Icon, 
    children 
  }: { 
    id: string; 
    title: string; 
    icon: React.ElementType; 
    children: React.ReactNode;
  }) => (
    <Collapsible open={openGroups[id]} onOpenChange={() => toggleGroup(id)}>
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          className="w-full justify-between font-semibold text-sm bg-muted/50 hover:bg-muted mb-1"
        >
          <span className="flex items-center gap-2">
            <Icon className="h-4 w-4" />
            {title}
          </span>
          <ChevronDown className={`h-4 w-4 transition-transform ${openGroups[id] ? 'rotate-180' : ''}`} />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="pl-2 space-y-1 mb-2">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );

  // Botón de navegación del sidebar
  const NavButton = ({ path, icon: Icon, label }: { path: string; icon: React.ElementType; label: string }) => (
    <Button
      variant={isActive(path) ? "secondary" : "ghost"}
      className="w-full justify-start text-sm h-9"
      onClick={() => navigate(path)}
    >
      <Icon className="h-4 w-4 mr-2" /> {label}
    </Button>
  );

  const sidebarContent = (
    <div className="space-y-1">
      {/* Dashboard Principal */}
      <NavButton path="/dashboard/admin/overview" icon={LayoutDashboard} label="Panel Principal" />

      {/* GRUPO: Gestión Académica */}
      <SidebarGroup id="academico" title="Gestión Académica" icon={GraduationCap}>
        <NavButton path="/dashboard/admin/cursos" icon={School} label="Cursos/Grados" />
        <NavButton path="/dashboard/admin/secciones" icon={Building2} label="Secciones" />
        <NavButton path="/dashboard/admin/materias" icon={BookOpen} label="Materias" />
        <NavButton path="/dashboard/admin/periodos" icon={CalendarDays} label="Períodos" />
        <NavButton path="/dashboard/admin/preinscripciones" icon={FileText} label="Preinscripciones" />
        <NavButton path="/dashboard/admin/inscripciones" icon={UserPlus} label="Inscripciones" />
        <NavButton path="/dashboard/admin/asistencia" icon={ClipboardCheck} label="Asistencia" />
        <NavButton path="/dashboard/admin/justificaciones" icon={FileCheck} label="Justificaciones" />
        <NavButton path="/dashboard/admin/tareas" icon={ClipboardList} label="Tareas" />
        <NavButton path="/dashboard/admin/conducta" icon={Shield} label="Conducta" />
        <NavButton path="/dashboard/admin/evaluacion" icon={ClipboardList} label="Evaluación" />
      </SidebarGroup>

      {/* GRUPO: Personas */}
      <SidebarGroup id="personas" title="Personas" icon={Users}>
        <NavButton path="/dashboard/admin/estudiantes" icon={Users} label="Estudiantes" />
        <NavButton path="/dashboard/admin/docentes" icon={GraduationCap} label="Docentes" />
        <NavButton path="/dashboard/admin/padres" icon={Users2} label="Padres/Tutores" />
        <NavButton path="/dashboard/admin/asignaciones" icon={Waypoints} label="Asignaciones" />
      </SidebarGroup>

      {/* GRUPO: Operación */}
      <SidebarGroup id="operacion" title="Operación" icon={Cog}>
        <NavButton path="/dashboard/admin/comunicados" icon={Megaphone} label="Comunicados y Noticias" />
        <NavButton path="/dashboard/admin/horarios" icon={Table2} label="Horarios" />
        <NavButton path="/dashboard/admin/actas" icon={FileText} label="Actas" />
        <NavButton path="/dashboard/admin/reportes" icon={Download} label="Reportes" />
        <NavButton path="/dashboard/admin/secretaria" icon={FolderOpen} label="Secretaría" />
        <NavButton path="/dashboard/admin/financial" icon={Wallet} label="Finanzas" />
      </SidebarGroup>

      {/* GRUPO: Sistema */}
      <SidebarGroup id="sistema" title="Sistema" icon={Settings}>
        <NavButton path="/dashboard/admin/import-export" icon={Share} label="Importar/Exportar" />
        <NavButton path="/dashboard/admin/auditoria" icon={ShieldQuestion} label="Auditoría" />
        <NavButton path="/dashboard/admin/configuracion" icon={Settings} label="Configuración" />
      </SidebarGroup>
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
                variant={navigator.onLine ? "secondary" : "destructive"}
                className={`ml-2 flex items-center gap-1 ${navigator.onLine ? 'bg-green-100 text-green-800' : ''}`}
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
