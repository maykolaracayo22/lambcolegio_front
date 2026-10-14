// src/components/LoginCard.tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Users, User, BookOpen, Shield, ChevronRight, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import type { UserRole } from '@/services/authService';

interface LoginCardProps {
  type: 'parent' | 'student' | 'teacher' | 'admin';
  icon: React.ReactNode;
  title: string;
  description: string;
  onMustChangePassword?: () => void;
}

/**
 * Obtiene la ruta de redirección según el rol del usuario
 */
const getRedirectPath = (role: UserRole): string => {
  const routes: Record<UserRole, string> = {
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
  return routes[role] || '/';
};

const LoginCard: React.FC<LoginCardProps> = ({ type, icon, title, description, onMustChangePassword }) => {
  const [formData, setFormData] = useState({
    identifier: '',
    password: '',
    studentCode: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { login, parentLookup } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones según tipo de usuario
    if (type === 'parent' && !formData.studentCode.trim()) {
      toast({ title: "Error de validación", description: "Ingresa el código o nombre del estudiante.", variant: "destructive" });
      return;
    }
    if (type !== 'parent' && (!formData.identifier.trim() || !formData.password.trim())) {
      toast({ title: "Error de validación", description: "Por favor completa todos los campos.", variant: "destructive" });
      return;
    }

    setIsLoading(true);

    try {
      let result;
      
      if (type === 'parent') {
        // Para padres: usar endpoint especial con código del estudiante
        result = await parentLookup(formData.studentCode);
      } else {
        // Para otros usuarios: login tradicional
        const credentials = {
          username: formData.identifier,
          password: formData.password,
        };
        result = await login(credentials);
      }

      if (result.success) {
        // Verificar si debe cambiar contraseña (primer login)
        if (result.mustChangePassword) {
          toast({ 
            title: "Cambio de contraseña requerido", 
            description: "Por seguridad, debes cambiar tu contraseña temporal.",
            variant: "default"
          });
          
          if (onMustChangePassword) {
            onMustChangePassword();
          } else {
            navigate('/cambiar-password');
          }
          return;
        }

        // Login exitoso
        toast({ 
          title: "¡Bienvenido!", 
          description: `Has iniciado sesión como ${title}.`,
        });

        // Redirección según el rol real del usuario (del backend)
        setTimeout(() => {
          // Si tenemos el rol del usuario, usarlo para la redirección
          const redirectPath = getRedirectPath(type as UserRole);
          navigate(redirectPath, { state: { role: type } });
        }, 300);
      } else {
        toast({ 
          title: "Error de acceso", 
          description: result.error || "Usuario o contraseña incorrectos",
          variant: "destructive" 
        });
      }
    } catch (error) {
      console.error('Error en login:', error);
      toast({ 
        title: "Error de conexión", 
        description: "No se pudo conectar con el servidor. Verifica tu conexión a internet.",
        variant: "destructive" 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderForm = () => {
    if (type === 'parent') {
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="studentCode">Código del Estudiante</Label>
            <Input
              id="studentCode"
              placeholder="Ej: EST-2025-001"
              value={formData.studentCode}
              onChange={(e) => setFormData({ ...formData, studentCode: e.target.value })}
              className="font-inter"
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">
              Ingresa el código de tu hijo para consultar su información
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="identifier">
            {type === 'student' ? 'Usuario o Código' : type === 'teacher' ? 'Usuario Docente' : 'Usuario'}
          </Label>
          <Input
            id="identifier"
            placeholder={type === 'student' ? 'Ej: garcia.juan' : 'Ingresa tu usuario'}
            value={formData.identifier}
            onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
            className="font-inter"
            disabled={isLoading}
            autoComplete="username"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Contraseña</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="font-inter"
            disabled={isLoading}
            autoComplete="current-password"
          />
          {type === 'student' && (
            <p className="text-xs text-muted-foreground">
              Primera vez? Tu contraseña es: E + año + mes + número (Ej: E202401001)
            </p>
          )}
          {type === 'teacher' && (
            <p className="text-xs text-muted-foreground">
              Primera vez? Tu contraseña es: D + año + mes + número (Ej: D202401001)
            </p>
          )}
        </div>
      </div>
    );
  };

  const getButtonVariant = () => {
    switch (type) {
      case 'parent': return 'academicYellow';
      case 'student': return 'secondary';
      case 'teacher': return 'academic';
      case 'admin': return 'default';
      default: return 'default';
    }
  };

  return (
    <Card className="w-full max-w-md hover:shadow-academic transition-all duration-300 bg-card/95 backdrop-blur-sm">
      <CardHeader className="text-center pb-4">
        <div className="mx-auto mb-4 p-3 bg-gradient-primary rounded-full w-fit">
          {icon}
        </div>
        <CardTitle className="text-xl font-semibold text-foreground font-inter">
          {title}
        </CardTitle>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {renderForm()}
          <Button 
            type="submit" 
            className="w-full" 
            variant={getButtonVariant()} 
            size="lg"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span>Verificando...</span>
              </>
            ) : (
              <>
                <span>Ingresar</span>
                <ChevronRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
          {type !== 'parent' && (
            <div className="text-center">
              <Button variant="link" size="sm" className="text-muted-foreground">
                ¿Olvidaste tu contraseña?
              </Button>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
};

// Cards preconfiguradas para cada tipo de usuario
export const ParentLoginCard = () => (
  <LoginCard 
    type="parent" 
    icon={<Users className="h-6 w-6 text-primary-foreground" />} 
    title="Padres/Tutores" 
    description="Consulta la información académica de tu hijo" 
  />
);

export const StudentLoginCard = () => (
  <LoginCard 
    type="student" 
    icon={<User className="h-6 w-6 text-primary-foreground" />} 
    title="Estudiantes" 
    description="Revisa tus notas, tareas y avances" 
  />
);

export const TeacherLoginCard = () => (
  <LoginCard 
    type="teacher" 
    icon={<BookOpen className="h-6 w-6 text-primary-foreground" />} 
    title="Docentes" 
    description="Gestiona notas, tareas y observaciones" 
  />
);

export const AdminLoginCard = () => (
  <LoginCard 
    type="admin" 
    icon={<Shield className="h-6 w-6 text-primary-foreground" />} 
    title="Administración" 
    description="Administra el sistema académico" 
  />
);

export default LoginCard;
