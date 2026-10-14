// src/components/ChangePasswordModal.tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock, Eye, EyeOff, CheckCircle2, XCircle, Loader2, ShieldCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onSuccess?: () => void;
  onCancel?: () => void;
  isFirstLogin?: boolean;
}

interface PasswordRequirement {
  label: string;
  test: (password: string) => boolean;
}

const passwordRequirements: PasswordRequirement[] = [
  { label: 'Mínimo 8 caracteres', test: (p) => p.length >= 8 },
  { label: 'Al menos una mayúscula', test: (p) => /[A-Z]/.test(p) },
  { label: 'Al menos una minúscula', test: (p) => /[a-z]/.test(p) },
  { label: 'Al menos un número', test: (p) => /[0-9]/.test(p) },
];

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ 
  isOpen, 
  onSuccess, 
  onCancel,
  isFirstLogin = false 
}) => {
  const [formData, setFormData] = useState({
    password: '',
    password_confirmation: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { toast } = useToast();
  const { changePassword } = useAuth();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar que las contraseñas coincidan
    if (formData.password !== formData.password_confirmation) {
      toast({ 
        title: "Error", 
        description: "Las contraseñas no coinciden",
        variant: "destructive" 
      });
      return;
    }

    // Validar requisitos de contraseña
    const allRequirementsMet = passwordRequirements.every(req => req.test(formData.password));
    if (!allRequirementsMet) {
      toast({ 
        title: "Contraseña débil", 
        description: "Tu contraseña no cumple con todos los requisitos de seguridad",
        variant: "destructive" 
      });
      return;
    }

    setIsLoading(true);

    try {
      const result = await changePassword(formData);

      if (result.success) {
        toast({ 
          title: "¡Contraseña actualizada!", 
          description: "Tu nueva contraseña ha sido guardada correctamente",
        });
        
        setFormData({ password: '', password_confirmation: '' });
        
        if (onSuccess) {
          onSuccess();
        }
      } else {
        toast({ 
          title: "Error", 
          description: result.error || "No se pudo cambiar la contraseña",
          variant: "destructive" 
        });
      }
    } catch (error) {
      console.error('Error cambiando contraseña:', error);
      toast({ 
        title: "Error de conexión", 
        description: "No se pudo conectar con el servidor",
        variant: "destructive" 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const passwordsMatch = formData.password === formData.password_confirmation && formData.password_confirmation.length > 0;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isFirstLogin && onCancel) {
          onCancel();
        }
      }}
    >
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-4 p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full w-fit">
            <ShieldCheck className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">
            {isFirstLogin ? 'Configura tu Contraseña' : 'Cambiar Contraseña'}
          </CardTitle>
          <CardDescription>
            {isFirstLogin 
              ? 'Por seguridad, debes crear una contraseña personal para tu cuenta'
              : 'Ingresa tu nueva contraseña'
            }
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nueva contraseña */}
            <div className="space-y-2">
              <Label htmlFor="password">Nueva Contraseña</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="pl-10 pr-10"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Requisitos de contraseña */}
            {formData.password.length > 0 && (
              <div className="space-y-2 p-3 bg-muted/50 rounded-lg">
                <p className="text-xs font-medium text-muted-foreground mb-2">Requisitos:</p>
                {passwordRequirements.map((req, index) => {
                  const met = req.test(formData.password);
                  return (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      {met ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className={met ? 'text-green-600' : 'text-muted-foreground'}>
                        {req.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Confirmar contraseña */}
            <div className="space-y-2">
              <Label htmlFor="password_confirmation">Confirmar Contraseña</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password_confirmation"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={formData.password_confirmation}
                  onChange={(e) => setFormData({ ...formData, password_confirmation: e.target.value })}
                  className="pl-10 pr-10"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {formData.password_confirmation.length > 0 && (
                <div className="flex items-center gap-2 text-sm mt-1">
                  {passwordsMatch ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span className="text-green-600">Las contraseñas coinciden</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 text-red-500" />
                      <span className="text-red-600">Las contraseñas no coinciden</span>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Botones */}
            <div className="flex gap-3">
              {!isFirstLogin && onCancel && (
                <Button 
                  type="button" 
                  variant="outline" 
                  className="flex-1"
                  onClick={onCancel}
                  disabled={isLoading}
                >
                  Cancelar
                </Button>
              )}
              <Button 
                type="submit" 
                className="flex-1"
                disabled={isLoading || !passwordsMatch || !passwordRequirements.every(req => req.test(formData.password))}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Guardando...
                  </>
                ) : (
                  'Guardar Contraseña'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChangePasswordModal;
