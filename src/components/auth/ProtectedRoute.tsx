// src/components/auth/ProtectedRoute.tsx
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** Roles permitidos para acceder a esta ruta */
  allowedRoles?: UserRole[];
  /** Si es true, redirige a cambiar contraseña si mustChangePassword es true */
  requirePasswordChange?: boolean;
}

/**
 * Componente que protege rutas requiriendo autenticación
 * Opcionalmente puede requerir roles específicos
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowedRoles,
  requirePasswordChange = true 
}) => {
  const { isAuthenticated, isLoading, user, mustChangePassword } = useAuth();
  const location = useLocation();

  // Mostrar loading mientras se verifica la sesión
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  // Si no está autenticado, redirigir al login
  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Si debe cambiar contraseña y no estamos ya en esa página
  if (requirePasswordChange && mustChangePassword && location.pathname !== '/cambiar-password') {
    return <Navigate to="/cambiar-password" replace />;
  }

  // Verificar roles si se especificaron
  // Admin y director_general tienen acceso a TODAS las rutas
  if (allowedRoles && allowedRoles.length > 0 && user) {
    const isAdmin = user.role === 'admin' || user.role === 'director_general';
    const hasWildcardAbility = user.abilities?.includes('*');
    
    // Si es admin o tiene permiso wildcard, permitir acceso
    if (isAdmin || hasWildcardAbility) {
      return <>{children}</>;
    }
    
    const hasRequiredRole = allowedRoles.includes(user.role);
    
    if (!hasRequiredRole) {
      // Redirigir al dashboard correspondiente según su rol
      const roleRedirects: Record<UserRole, string> = {
        student: '/dashboard/student',
        teacher: '/seleccionar-nivel',
        parent: '/dashboard/parent',
        admin: '/dashboard/admin',
        director_general: '/dashboard/admin',
        director_academico: '/dashboard/admin',
        secretaria: '/dashboard/admin',
        regente: '/dashboard/admin',
        finanzas: '/dashboard/admin',
      };
      
      return <Navigate to={roleRedirects[user.role] || '/'} replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;

/**
 * HOC para proteger rutas fácilmente
 */
export const withAuth = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  allowedRoles?: UserRole[]
) => {
  return function WithAuthComponent(props: P) {
    return (
      <ProtectedRoute allowedRoles={allowedRoles}>
        <WrappedComponent {...props} />
      </ProtectedRoute>
    );
  };
};
