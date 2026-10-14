// src/services/authService.ts
import { http } from "./http";

/**
 * Interfaces de autenticación - Sincronizadas con el backend Laravel
 */
export interface LoginCredentials {
  username: string;  // Puede ser username o email
  password: string;
}

// Payload que se envía al backend (acepta ambos formatos)
interface LoginPayload {
  username?: string;
  email?: string;
  password: string;
}

export interface TeacherInfo {
  id: number;
  nombre: string;
  apellido: string;
  especialidad?: string;
}

export interface StudentInfo {
  id: number;
  nombre: string;
  apellido: string;
  codigo: string;
}

// Roles del sistema escolar boliviano
export type UserRole = 
  | 'student' 
  | 'teacher' 
  | 'parent' 
  | 'admin' 
  | 'director_general' 
  | 'director_academico' 
  | 'secretaria' 
  | 'regente' 
  | 'finanzas';

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  username: string;
  role: UserRole;
  abilities: string[];
  teacherId?: number | null;
  studentId?: number | null;
  teacher?: TeacherInfo | null;
  student?: StudentInfo | null;
}

// Respuesta del endpoint /login
export interface LoginApiResponse {
  success: boolean;
  token: string;
  user: AuthUser;
  mustChangePassword: boolean;
  message?: string;
}

// Respuesta normalizada para el contexto
export interface LoginResponse {
  success: boolean;
  token: string;
  user: AuthUser;
  mustChangePassword: boolean;
  error?: string;
}

export interface ChangePasswordRequest {
  password: string;
  password_confirmation: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
}

// Respuesta del endpoint /me
export interface MeApiResponse {
  success: boolean;
  user: AuthUser;
}

// Keys para localStorage
const AUTH_TOKEN_KEY = 'authToken';
const AUTH_USER_KEY = 'authUser';

// Respuesta del endpoint /parent/lookup
export interface ParentLookupResponse {
  success: boolean;
  token: string;
  mustChangePassword: boolean;
  user: AuthUser;
  student?: {
    id: number;
    codigo: string;
    nombres: string;
    apellidos: string;
    nivel: string;
    curso: string;
    paralelo: string;
    tutor_nombre?: string;
    tutor_telefono?: string;
  };
  message?: string;
}

/**
 * Servicio de Autenticación
 * Conecta con el backend Laravel de colegio-api
 */
class AuthService {
  /**
   * Iniciar sesión con username/email y contraseña
   * Endpoint: POST /api/login
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    // Detectar si es email o username y enviar en el formato correcto
    const isEmail = credentials.username.includes('@');
    const payload: LoginPayload = {
      password: credentials.password,
      ...(isEmail 
        ? { email: credentials.username } 
        : { username: credentials.username }
      ),
    };

    const response = await http.post<LoginApiResponse>('/login', payload);
    
    if (response.data.success && response.data.token) {
      // Guardar token y usuario en localStorage
      this.setToken(response.data.token);
      this.setUser(response.data.user);
      
      // Configurar token en headers para futuras peticiones
      this.setAuthHeader(response.data.token);
      
      return {
        success: true,
        token: response.data.token,
        user: response.data.user,
        mustChangePassword: response.data.mustChangePassword
      };
    }
    
    return {
      success: false,
      token: '',
      user: {} as AuthUser,
      mustChangePassword: false
    };
  }

  /**
   * Consulta de padres/tutores con código del estudiante
   * Endpoint: POST /api/parent/lookup
   */
  async parentLookup(studentCode: string): Promise<LoginResponse> {
    try {
      const response = await http.post<ParentLookupResponse>('/parent/lookup', {
        student_code: studentCode
      });
      
      if (response.data.success && response.data.token) {
        // Guardar token y usuario en localStorage
        this.setToken(response.data.token);
        this.setUser(response.data.user);
        
        // Guardar datos del estudiante para consultas
        if (response.data.student) {
          localStorage.setItem('parentStudent', JSON.stringify(response.data.student));
        }
        
        return {
          success: true,
          token: response.data.token,
          user: response.data.user,
          mustChangePassword: false
        };
      }
      
      return {
        success: false,
        token: '',
        user: {} as AuthUser,
        mustChangePassword: false,
        error: response.data.message || 'Estudiante no encontrado'
      };
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      const message = err?.response?.data?.message || 'Estudiante no encontrado';
      return {
        success: false,
        token: '',
        user: {} as AuthUser,
        mustChangePassword: false,
        error: message
      };
    }
  }

  /**
   * Cerrar sesión
   * Endpoint: POST /api/logout
   */
  async logout(): Promise<void> {
    try {
      await http.post('/logout');
    } catch (error) {
      console.warn('Error al cerrar sesión en el servidor:', error);
    } finally {
      this.clearAuth();
    }
  }

  /**
   * Cambiar contraseña (obligatorio en primer login)
   * Endpoint: POST /api/change-password
   */
  async changePassword(data: ChangePasswordRequest): Promise<ApiResponse> {
    const response = await http.post<ApiResponse>('/change-password', data);
    return response.data;
  }

  /**
   * Obtener información del usuario autenticado
   * Endpoint: GET /api/me
   */
  async me(): Promise<AuthUser | null> {
    try {
      const response = await http.get<MeApiResponse>('/me');
      if (response.data.success && response.data.user) {
        this.setUser(response.data.user);
        return response.data.user;
      }
      return null;
    } catch (error) {
      console.error('Error al obtener usuario:', error);
      return null;
    }
  }

  /**
   * Verificar si hay una sesión activa válida
   */
  async verifySession(): Promise<boolean> {
    const token = this.getToken();
    if (!token) return false;

    try {
      this.setAuthHeader(token);
      const user = await this.me();
      return !!user;
    } catch {
      this.clearAuth();
      return false;
    }
  }

  /**
   * Guardar token en localStorage
   */
  setToken(token: string): void {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  }

  /**
   * Obtener token de localStorage
   */
  getToken(): string | null {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  }

  /**
   * Guardar usuario en localStorage
   */
  setUser(user: AuthUser): void {
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  }

  /**
   * Obtener usuario de localStorage
   */
  getUser(): AuthUser | null {
    const userStr = localStorage.getItem(AUTH_USER_KEY);
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  /**
   * Configurar header de autorización en axios
   */
  setAuthHeader(token: string): void {
    http.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  /**
   * Limpiar todos los datos de autenticación
   */
  clearAuth(): void {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
    delete http.defaults.headers.common['Authorization'];
  }

  /**
   * Verificar si el usuario está autenticado (solo local)
   */
  isAuthenticated(): boolean {
    return !!this.getToken() && !!this.getUser();
  }

  /**
   * Inicializar autenticación al cargar la app
   * Restaura el token si existe
   */
  initialize(): AuthUser | null {
    const token = this.getToken();
    const user = this.getUser();
    
    if (token && user) {
      this.setAuthHeader(token);
      return user;
    }
    
    return null;
  }

  /**
   * Verificar si el usuario tiene un permiso específico
   */
  hasAbility(ability: string): boolean {
    const user = this.getUser();
    if (!user?.abilities) return false;
    
    // Wildcard = todos los permisos
    if (user.abilities.includes('*')) return true;
    
    return user.abilities.includes(ability);
  }

  /**
   * Verificar si el usuario tiene alguno de los roles especificados
   */
  hasRole(...roles: string[]): boolean {
    const user = this.getUser();
    if (!user?.role) return false;
    return roles.includes(user.role);
  }
}

// Exportar instancia singleton
export const authService = new AuthService();
export default authService;
