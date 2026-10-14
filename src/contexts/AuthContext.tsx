// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { authService, AuthUser, LoginCredentials, ChangePasswordRequest, UserRole } from '@/services/authService';

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  mustChangePassword: boolean;
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; mustChangePassword?: boolean; error?: string }>;
  parentLookup: (studentCode: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  changePassword: (data: ChangePasswordRequest) => Promise<{ success: boolean; error?: string }>;
  hasAbility: (ability: string) => boolean;
  hasRole: (...roles: UserRole[]) => boolean;
  hasAnyRole: (...roles: UserRole[]) => boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mustChangePassword, setMustChangePassword] = useState(false);

  // Inicializar autenticación al cargar la app
  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      try {
        const savedUser = authService.initialize();
        if (savedUser) {
          // Verificar que la sesión siga siendo válida con el backend
          const isValid = await authService.verifySession();
          if (isValid) {
            setUser(authService.getUser());
          } else {
            setUser(null);
          }
        }
      } catch (error) {
        console.error('Error inicializando auth:', error);
        authService.clearAuth();
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    setIsLoading(true);
    try {
      const response = await authService.login(credentials);
      
      if (response.success) {
        setUser(response.user);
        setMustChangePassword(response.mustChangePassword);
        
        return { 
          success: true, 
          mustChangePassword: response.mustChangePassword 
        };
      }
      
      return { success: false, error: 'Credenciales inválidas' };
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      const message = err.response?.data?.message || 'Error de conexión con el servidor';
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Login especial para padres/tutores con código del estudiante
  const parentLookup = useCallback(async (studentCode: string) => {
    setIsLoading(true);
    try {
      const response = await authService.parentLookup(studentCode);
      
      if (response.success) {
        setUser(response.user);
        setMustChangePassword(false);
        return { success: true };
      }
      
      return { success: false, error: response.error || 'Estudiante no encontrado' };
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      const message = err.response?.data?.message || 'Estudiante no encontrado';
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await authService.logout();
    } finally {
      setUser(null);
      setMustChangePassword(false);
      setIsLoading(false);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const updatedUser = await authService.me();
      if (updatedUser) {
        setUser(updatedUser);
      }
    } catch (error) {
      console.error('Error refrescando usuario:', error);
    }
  }, []);

  const changePassword = useCallback(async (data: ChangePasswordRequest) => {
    try {
      const response = await authService.changePassword(data);
      
      if (response.success) {
        setMustChangePassword(false);
        // Refrescar datos del usuario
        const updatedUser = await authService.me();
        if (updatedUser) {
          setUser(updatedUser);
        }
        return { success: true };
      }
      
      return { success: false, error: response.message || 'Error al cambiar contraseña' };
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      const message = err.response?.data?.message || 'Error al cambiar contraseña';
      return { success: false, error: message };
    }
  }, []);

  /**
   * Verificar si el usuario tiene un permiso/ability específico
   */
  const hasAbility = useCallback((ability: string) => {
    return authService.hasAbility(ability);
  }, []);

  /**
   * Verificar si el usuario tiene TODOS los roles especificados
   */
  const hasRole = useCallback((...roles: UserRole[]) => {
    return authService.hasRole(...roles);
  }, []);

  /**
   * Verificar si el usuario tiene AL MENOS UNO de los roles especificados
   */
  const hasAnyRole = useCallback((...roles: UserRole[]) => {
    const user = authService.getUser();
    if (!user?.role) return false;
    return roles.includes(user.role);
  }, []);

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      isLoading,
      mustChangePassword,
      login,
      parentLookup,
      logout,
      changePassword,
      hasAbility,
      hasRole,
      hasAnyRole,
      refreshUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider');
  }
  return context;
};

// Re-exportar tipos útiles
export type { AuthUser, UserRole } from '@/services/authService';
