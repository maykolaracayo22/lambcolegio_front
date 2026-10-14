// src/App.tsx
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";

// Dashboards
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ParentDashboard from "./pages/ParentDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import ChangePasswordPage from "./pages/ChangePasswordPage";

// Subpáginas del dashboard de padres
import InformacionEstudiante from "./pages/parent/InformacionEstudiante";
import NotasAcademicas from "./pages/parent/NotasAcademicas";
import Conducta from "./pages/parent/Conducta";
import Tareas from "./pages/parent/Tareas";
import Progreso from "./pages/parent/Progreso";
import Reportes from "./pages/parent/Reportes";
import AsistenciaParent from "./pages/parent/Asistencia";
import LogrosParents from "./pages/parent/LogrosParents";

// Subpáginas del dashboard de estudiantes
import Informacion from "./pages/student/Informacion";
import Materias from "./pages/student/Materias";
import TareasStudent from "./pages/student/Tareas";
import NotasStudent from "./pages/student/Notas";
import Asistencia from "./pages/student/Asistencia";
import StudentHorario from "./pages/student/Horario";
import TeacherHorario from "./pages/teacher/Horario";
import ProgresoStudent from "./pages/student/Progreso";

// Subpáginas del dashboard de docentes
import InformacionDocente from "./pages/teacher/InformacionDocente";
import RegistroValoracion from "./pages/teacher/RegistroValoracion";
import Clases from "./pages/teacher/Clases";
import Calificaciones from "./pages/teacher/Calificaciones";
import TareasTeacher from "./pages/teacher/Tareas";
import Planificacion from "./pages/teacher/Planificacion";
import ReportesTeacher from "./pages/teacher/Reportes";
import NotasTeacher from "./pages/teacher/Notas";

// Selección de nivel + entradas por nivel
import SelectNivel from "./pages/SelectNivel";
import { InicialEntry, PrimariaEntry, SecundariaEntry } from "./pages/nivel/LevelEntries";

// Subpáginas del dashboard de administrador
import EstudiantesAdmin from "./pages/admin/Estudiantes";
import DocentesAdmin from "./pages/admin/Docentes";
import MateriasAdmin from "./pages/admin/Materias";
import PeriodosAdmin from "./pages/admin/Periodos";
import ConfiguracionAdmin from "./pages/admin/Configuracion";
import AsignacionesAdmin from "./pages/admin/Asignaciones";
import HorariosAdmin from "./pages/admin/Horarios";
import EvaluacionAdmin from "./pages/admin/Evaluacion";
import ImportExportAdmin from "./pages/admin/ImportExport";
import AuditoriaAdmin from "./pages/admin/Auditoria";
import ParametrosAdmin from "./pages/admin/Parametros";

// ➕ NUEVAS páginas Admin (Centro de Control)
import AdminOverview from "./pages/admin/Overview";
import AdminActas from "./pages/admin/Actas";
import AdminReportes from "./pages/admin/Reportes";
import SeccionesAdmin from "./pages/admin/Secciones";
import FinancialModule from "./pages/admin/FinancialModule";
import ComunicadosAdmin from "./pages/admin/Comunicados";

// ➕ NUEVOS módulos Admin (Cursos, Inscripciones, Padres, Asistencia, Conducta, Preinscripciones)
import CursosAdmin from "./pages/admin/Cursos";
import InscripcionesAdmin from "./pages/admin/Inscripciones";
import PadresAdmin from "./pages/admin/Padres";
import AsistenciaAdmin from "./pages/admin/Asistencia";
import ConductaAdmin from "./pages/admin/Conducta";
import PreinscripcionesAdmin from "./pages/admin/Preinscripciones";
import TareasAdmin from "./pages/admin/Tareas";
import JustificacionesAdmin from "./pages/admin/Justificaciones";

// Módulo de Secretaría
import SecretariaDashboard from "@/pages/admin/secretaria";
import GeneradorRUDE from "@/pages/admin/secretaria/generador-rude";
import VisorRUDE from "@/pages/admin/secretaria/visor/RudeViewer";
import Comunicaciones from "@/pages/admin/secretaria/comunicaciones";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            
            {/* Cambio de contraseña obligatorio */}
            <Route path="/cambiar-password" element={<ChangePasswordPage />} />

            {/* Selección de nivel (post-login estudiantes) */}
            <Route path="/seleccionar-nivel" element={<SelectNivel />} />
          {/* Entradas por nivel: guardan el nivel y redirigen al dashboard del estudiante */}
          <Route path="/dashboard/inicial" element={<InicialEntry />} />
          <Route path="/dashboard/primaria" element={<PrimariaEntry />} />
          <Route path="/dashboard/secundaria" element={<SecundariaEntry />} />

          {/* Rutas del Dashboard de Padres */}
          <Route path="/dashboard/parent" element={<ParentDashboard />}>
            <Route path="informacion-estudiante" element={<InformacionEstudiante />} />
            <Route path="notas-academicas" element={<NotasAcademicas />} />
            <Route path="conducta" element={<Conducta />} />
            <Route path="tareas" element={<Tareas />} />
            <Route path="progreso" element={<Progreso />} />
            <Route path="reportes" element={<Reportes />} />
            <Route path="asistencia" element={<AsistenciaParent />} />
            <Route path="logrosparents" element={<LogrosParents />} />
          </Route>

          {/* Rutas del Dashboard de Estudiantes */}
          <Route path="/dashboard/student" element={<StudentDashboard />}>
            <Route path="materias" element={<Materias />} />
            <Route path="tareas" element={<TareasStudent />} />
            <Route path="notas" element={<NotasStudent />} />
            <Route path="asistencia" element={<Asistencia />} />
            <Route path="horario" element={<StudentHorario />} />
            <Route path="progreso" element={<ProgresoStudent />} />
            <Route path="informacion" element={<Informacion />} />
          </Route>

          {/* Rutas del Dashboard de Docentes */}
          <Route path="/dashboard/teacher" element={<TeacherDashboard />}>
            <Route path="clases" element={<Clases />} />
            <Route path="calificaciones" element={<Calificaciones />} />
            <Route path="tareas" element={<TareasTeacher />} />
            <Route path="planificacion" element={<Planificacion />} />
            <Route path="reportes" element={<ReportesTeacher />} />
            <Route path="notas" element={<NotasTeacher />} />
            <Route path="horario" element={<TeacherHorario />} />
            <Route path="informacion-docente" element={<InformacionDocente />} />
            <Route path="registro-valoracion" element={<RegistroValoracion />} />
  
          </Route>

          {/* Rutas del Dashboard de Administrador */}
          <Route path="/dashboard/admin" element={<AdminDashboard />}>
            {/* Centro de Control */}
            <Route path="overview" element={<AdminOverview />} />
            <Route path="actas" element={<AdminActas />} />
            <Route path="reportes" element={<AdminReportes />} />
            <Route path="secciones" element={<SeccionesAdmin />} />
            <Route path="financial" element={<FinancialModule />} />
            <Route path="comunicados" element={<ComunicadosAdmin />} />

            {/* NUEVOS módulos */}
            <Route path="cursos" element={<CursosAdmin />} />
            <Route path="inscripciones" element={<InscripcionesAdmin />} />
            <Route path="padres" element={<PadresAdmin />} />
            <Route path="asistencia" element={<AsistenciaAdmin />} />
            <Route path="conducta" element={<ConductaAdmin />} />
            <Route path="preinscripciones" element={<PreinscripcionesAdmin />} />
            <Route path="tareas" element={<TareasAdmin />} />
            <Route path="justificaciones" element={<JustificacionesAdmin />} />

            {/* Módulo de Secretaría */}
            <Route path="secretaria" element={<SecretariaDashboard />} />
            <Route path="secretaria/generador-rude" element={<GeneradorRUDE />} />
            <Route path="secretaria/visor/:rudeId" element={<VisorRUDE />} />
            <Route path="secretaria/comunicaciones" element={<Comunicaciones />} />

            {/* Módulos existentes */}
            <Route path="estudiantes" element={<EstudiantesAdmin />} />
            <Route path="docentes" element={<DocentesAdmin />} />
            <Route path="materias" element={<MateriasAdmin />} />
            <Route path="periodos" element={<PeriodosAdmin />} />
            <Route path="asignaciones" element={<AsignacionesAdmin />} />
            <Route path="horarios" element={<HorariosAdmin />} />
            <Route path="evaluacion" element={<EvaluacionAdmin />} />
            <Route path="import-export" element={<ImportExportAdmin />} />
            <Route path="auditoria" element={<AuditoriaAdmin />} />
            <Route path="parametros" element={<ParametrosAdmin />} />
            <Route path="configuracion" element={<ConfiguracionAdmin />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </AuthProvider>
  </QueryClientProvider>
);

export default App;
