// src/components/auth/UserMenu.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  User, 
  LogOut, 
  Settings, 
  Key, 
  Shield,
  BookOpen,
  GraduationCap,
  Users
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

/**
 * Menú de usuario con información y opciones
 */
const UserMenu: React.FC = () => {
  const { user, logout, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);

  if (!user) return null;

  // Obtener iniciales del nombre
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Obtener icono según el rol
  const getRoleIcon = () => {
    switch (user.role) {
      case 'admin':
      case 'director_general':
      case 'director_academico':
        return <Shield className="h-4 w-4" />;
      case 'teacher':
        return <BookOpen className="h-4 w-4" />;
      case 'student':
        return <GraduationCap className="h-4 w-4" />;
      case 'parent':
        return <Users className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  // Obtener nombre del rol en español
  const getRoleName = () => {
    const roleNames: Record<string, string> = {
      admin: 'Administrador',
      director_general: 'Director General',
      director_academico: 'Director Académico',
      teacher: 'Docente',
      student: 'Estudiante',
      parent: 'Padre/Tutor',
      secretaria: 'Secretaría',
      regente: 'Regente',
      finanzas: 'Finanzas',
    };
    return roleNames[user.role] || user.role;
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión correctamente",
      });
      navigate('/');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      toast({
        title: "Error",
        description: "No se pudo cerrar la sesión",
        variant: "destructive",
      });
    }
  };

  const handleChangePassword = () => {
    setIsOpen(false);
    navigate('/cambiar-password');
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-primary text-primary-foreground">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email || user.username}
            </p>
            <div className="flex items-center gap-1 mt-1">
              {getRoleIcon()}
              <span className="text-xs text-muted-foreground">{getRoleName()}</span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={() => navigate('/perfil')} disabled>
          <User className="mr-2 h-4 w-4" />
          <span>Mi Perfil</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={handleChangePassword}>
          <Key className="mr-2 h-4 w-4" />
          <span>Cambiar Contraseña</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => navigate('/configuracion')} disabled>
          <Settings className="mr-2 h-4 w-4" />
          <span>Configuración</span>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={handleLogout}
          disabled={isLoading}
          className="text-red-600 focus:text-red-600"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Cerrar Sesión</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserMenu;
