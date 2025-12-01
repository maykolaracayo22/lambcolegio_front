import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Users, User, BookOpen, Shield, ChevronRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface LoginCardProps {
  type: 'parent' | 'student' | 'teacher' | 'admin';
  icon: React.ReactNode;
  title: string;
  description: string;
}

const LoginCard: React.FC<LoginCardProps> = ({ type, icon, title, description }) => {
  const [formData, setFormData] = useState({
    identifier: '',
    password: '',
    studentCode: ''
  });
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones
    if (type === 'parent' && !formData.studentCode.trim()) {
      toast({ title: "Error de validación", description: "Ingresa el código o nombre del estudiante.", variant: "destructive" });
      return;
    }
    if (type !== 'parent' && (!formData.identifier.trim() || !formData.password.trim())) {
      toast({ title: "Error de validación", description: "Por favor completa todos los campos.", variant: "destructive" });
      return;
    }

    // Éxito (mock)
    toast({ title: "Acceso exitoso", description: `Bienvenido, ${title}.` });

    // Redirección correcta según tipo
    setTimeout(() => {
      switch (type) {
        case 'student':
          navigate('/dashboard/student');
          break;
        case 'teacher':
          // El docente elige el nivel
          navigate('/seleccionar-nivel', { state: { role: 'teacher' } });
          break;
        case 'parent':
          navigate('/dashboard/parent');
          break;
        case 'admin':
          navigate('/dashboard/admin');
          break;
        default:
          navigate('/');
      }
    }, 400);
  };

  const renderForm = () => {
    if (type === 'parent') {
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="studentCode">Código o Nombre del Estudiante</Label>
            <Input
              id="studentCode"
              placeholder="Ej: EST-2025-001 o Juan Pérez"
              value={formData.studentCode}
              onChange={(e) => setFormData({ ...formData, studentCode: e.target.value })}
              className="font-inter"
            />
          </div>
        </div>
      );
    }
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="identifier">
            {type === 'student' ? 'Código de Estudiante' : type === 'teacher' ? 'Usuario Docente' : 'Usuario Administrador'}
          </Label>
          <Input
            id="identifier"
            placeholder={type === 'student' ? 'Ej: EST-2025-001' : 'Ingresa tu usuario'}
            value={formData.identifier}
            onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
            className="font-inter"
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
          />
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
          <Button type="submit" className="w-full" variant={getButtonVariant()} size="lg">
            <span>Ingresar</span>
            <ChevronRight className="h-4 w-4" />
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

// Cards preconfiguradas
export const ParentLoginCard = () => (
  <LoginCard type="parent" icon={<Users className="h-6 w-6 text-primary-foreground" />} title="Padres/Tutores" description="Consulta la información académica de tu hijo" />
);
export const StudentLoginCard = () => (
  <LoginCard type="student" icon={<User className="h-6 w-6 text-primary-foreground" />} title="Estudiantes" description="Revisa tus notas, tareas y avances" />
);
export const TeacherLoginCard = () => (
  <LoginCard type="teacher" icon={<BookOpen className="h-6 w-6 text-primary-foreground" />} title="Docentes" description="Gestiona notas, tareas y observaciones" />
);
export const AdminLoginCard = () => (
  <LoginCard type="admin" icon={<Shield className="h-6 w-6 text-primary-foreground" />} title="Administrador" description="Administra el sistema académico" />
);

export default LoginCard;
