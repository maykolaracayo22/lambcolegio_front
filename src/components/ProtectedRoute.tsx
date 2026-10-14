// src/components/ProtectedRoute.tsx
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  redirectTo?: string;
}

/**
 * Componente que protege rutas requiriendo autenticación
 * Opcionalmente puede restringir por roles específicos
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowedRoles,
  redirectTo = '/'
}) => {
  const { isAuthenticated, isLoading, user, mustChangePassword } = useAuth();
  const location = useLocation();

  // Mostrar loading mientras se verifica la autenticación
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  // Si no está autenticado, redirigir al login
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Si debe cambiar contraseña, redirigir a esa página
  if (mustChangePassword && location.pathname !== '/cambiar-password') {
    return <Navigate to="/cambiar-password" replace />;
  }

  // Si hay roles permitidos y el usuario no tiene uno de ellos
  // Admin y director_general tienen acceso a TODAS las rutas
  if (allowedRoles && allowedRoles.length > 0 && user) {
    const isAdmin = user.role === 'admin' || user.role === 'director_general';
    const hasWildcardAbility = user.abilities?.includes('*');
    
    // Si es admin o tiene permiso wildcard, permitir acceso
    if (isAdmin || hasWildcardAbility) {
      return <>{children}</>;
    }
    
    const hasAllowedRole = allowedRoles.includes(user.role);
    if (!hasAllowedRole) {
      // Redirigir al dashboard correspondiente según su rol
      const dashboardPath = getRoleDashboard(user.role);
      return <Navigate to={dashboardPath} replace />;
    }
  }

  return <>{children}</>;
};

/**
 * Obtiene la ruta del dashboard según el rol del usuario
 */
function getRoleDashboard(role: string): string {
  switch (role) {
    case 'student':
      return '/dashboard/student';
    case 'teacher':
      return '/seleccionar-nivel';
    case 'parent':
      return '/dashboard/parent';
    case 'admin':
    case 'director_general':
    case 'director_academico':
    case 'secretaria':
    case 'regente':
    case 'finanzas':
      return '/dashboard/admin';
    default:
      return '/';
  }
}

export default ProtectedRoute;
