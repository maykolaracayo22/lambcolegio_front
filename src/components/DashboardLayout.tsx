// src/components/DashboardLayout.tsx
import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { GraduationCap, Menu, X, LogOut, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DashboardLayoutProps {
  children?: React.ReactNode;
  userType: 'parent' | 'student' | 'teacher' | 'admin';
  userName: string;
  userInfo?: string;
  sidebarContent?: React.ReactNode; // opcional si quieres pasar un sidebar personalizado
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  userType,
  userName,
  userInfo,
  sidebarContent,
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const getUserTypeLabel = () => {
    const labels = {
      parent: 'Padre/Tutor',
      student: 'Estudiante',
      teacher: 'Docente',
      admin: 'Administrador',
    };
    return labels[userType];
  };

  const getUserTypeColor = () => {
    const colors = {
      parent: 'bg-accent',
      student: 'bg-secondary',
      teacher: 'bg-primary',
      admin: 'bg-destructive',
    };
    return colors[userType];
  };

  // rutas por tipo de usuario (usa slugs amigables)
  const menuConfig: Record<string, { icon: JSX.Element; label: string; path: string }[]> = {
    parent: [
      { icon: <svg />, label: 'Información del Estudiante', path: '/dashboard/parent/informacion-estudiante' },
      { icon: <svg />, label: 'Notas Académicas', path: '/dashboard/parent/notas-academicas' },
      { icon: <svg />, label: 'Conducta', path: '/dashboard/parent/conducta' },
      { icon: <svg />, label: 'Tareas', path: '/dashboard/parent/tareas' },
      { icon: <svg />, label: 'Progreso', path: '/dashboard/parent/progreso' },
      { icon: <svg />, label: 'Reportes', path: '/dashboard/parent/reportes' },
      { icon: <svg />, label: 'Logros', path: '/dashboard/parent/logrosparents' },
    ],
    student: [
      { icon: <svg />, label: 'Mis Materias', path: '/dashboard/student/materias' },
      { icon: <svg />, label: 'Mis Tareas', path: '/dashboard/student/tareas' },
      { icon: <svg />, label: 'Mis Notas', path: '/dashboard/student/notas' },
      { icon: <svg />, label: 'Mi Asistencia', path: '/dashboard/student/asistencia' },
      { icon: <svg />, label: 'Mi Horario', path: '/dashboard/student/horario' },
      { icon: <svg />, label: 'Mi Progreso', path: '/dashboard/student/progreso' },
      { icon: <svg />, label: 'Mi Informacion', path: '/dashboard/student/informacion' },
    ],

    teacher: [
      { icon: <svg />, label: 'Mis Clases', path: '/dashboard/teacher/clases' },
      { icon: <svg />, label: 'Mis Calificaciones', path: '/dashboard/teacher/calificaciones' }, // minúsculas
      { icon: <svg />, label: 'Mis Tareas', path: '/dashboard/teacher/tareas' },                 // minúsculas
      { icon: <svg />, label: 'Mis Planificación', path: '/dashboard/teacher/planificacion' },   // sin tilde en path
      { icon: <svg />, label: 'Mis Reportes', path: '/dashboard/teacher/reportes' },             // minúsculas
      { icon: <svg />, label: 'Notas', path: '/dashboard/teacher/notas' }, 
      { icon: <svg />, label: 'Informacion Docente', path: '/dashboard/teacher/informacion-docente' },
      { icon: <svg />, label: 'Resgistro Valoracion', path: '/dashboard/teacher/registro-valoracion' },
    ],
    admin: [
      { icon: <svg />, label: 'Estudiantes', path: '/dashboard/admin/estudiantes' },
      { icon: <svg />, label: 'Docentes', path: '/dashboard/admin/docentes' },
      { icon: <svg />, label: 'Materias', path: '/dashboard/admin/materias' },
      { icon: <svg />, label: 'Períodos', path: '/dashboard/admin/periodos' },
      { icon: <svg />, label: 'Configuración', path: '/dashboard/admin/configuracion' },
    ],
  };

  // helper para crear clase activa en NavLink
  const navClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center w-full px-3 gap-2 py-2 rounded-md transition-all ${
      isActive ? 'bg-primary/10 text-primary font-semibold' : 'text-muted-foreground hover:bg-muted'
    }`;

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50 w-64 bg-card border-r transform transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-gradient-primary rounded-lg">
                <GraduationCap className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h2 className="font-bold text-foreground font-inter">Plataforma Académica</h2>
                <p className="text-xs text-muted-foreground">Sistema Escolar</p>
              </div>
            </div>

            {/* User Info */}
            <div className="bg-muted/50 rounded-lg p-3">
              <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white mb-2 ${getUserTypeColor()}`}>
                {getUserTypeLabel()}
              </div>
              <div className="font-medium text-sm text-foreground">{userName}</div>
              {userInfo && <div className="text-xs text-muted-foreground">{userInfo}</div>}
            </div>
          </div>

          {/* Menu */}
          <nav className="flex-1 p-4 overflow-y-auto space-y-2">
            {sidebarContent ? (
              // si el dashboard pasó contenido personalizado, lo usamos
              sidebarContent
            ) : (
              // si no, generamos enlaces desde menuConfig (asegúrate de tener iconos)
              (menuConfig[userType] || []).map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={(state) => navClass(state)}
                  onClick={() => setIsSidebarOpen(false)} // cerrar en móvil
                >
                  {item.icon}
                  <span>{item.label}</span>
                </NavLink>
              ))
            )}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t">
            <Button variant="ghost" className="w-full justify-start mb-2" onClick={() => navigate('/')}>
              <Home className="h-4 w-4 mr-2" />
              Inicio
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => {
                localStorage.removeItem('nivel'); // por si lo usas en más vistas
                navigate('/');
              }}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 lg:ml-0">
        {/* Mobile top bar */}
        <div className="lg:hidden bg-card border-b p-4">
          <div className="flex items-center justify-between">
            <button onClick={() => setIsSidebarOpen((s) => !s)} className="p-2 text-foreground hover:bg-muted rounded-md">
              {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
            <div className="flex items-center space-x-2">
              <GraduationCap className="h-6 w-6 text-primary" />
              <span className="font-semibold text-foreground">Plataforma Académica</span>
            </div>
          </div>
        </div>

        <main className="p-4 lg:p-6">
          {/* Soportamos children directo o rutas anidadas con Outlet */}
          {children ?? <Outlet />}
        </main>
      </div>

      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}
    </div>
  );
};

export default DashboardLayout;
