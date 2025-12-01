// src/components/LoginModal.tsx
import {
  ParentLoginCard,
  StudentLoginCard,
  TeacherLoginCard,
  AdminLoginCard,
} from "@/components/LoginCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, HelpCircle } from "lucide-react";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LoginModal = ({ isOpen, onClose }: LoginModalProps) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative bg-background rounded-xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden border">
        {/* Header del Modal */}
        <div className="sticky top-0 bg-background border-b px-8 py-6 flex items-center justify-between z-10">
          <div className="flex-1">
            <h2 className="text-3xl font-bold text-foreground mb-2">
              Accede a tu Panel
            </h2>
            <p className="text-lg text-muted-foreground">
              Selecciona tu tipo de usuario para ingresar a la plataforma educativa
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-10 w-10 rounded-full hover:bg-muted"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Contenido Principal */}
        <div className="overflow-y-auto max-h-[calc(95vh-140px)]">
          <div className="p-8">
            {/* Cards de Login */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              <div className="flex flex-col h-full">
                <ParentLoginCard />
              </div>
              <div className="flex flex-col h-full">
                <StudentLoginCard />
              </div>
              <div className="flex flex-col h-full">
                <TeacherLoginCard />
              </div>
              <div className="flex flex-col h-full">
                <AdminLoginCard />
              </div>
            </div>

            {/* Información de Soporte */}
            <div className="text-center">
              <Card className="max-w-4xl mx-auto bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800">
                <CardContent className="p-8">
                  <div className="flex items-center justify-center mb-4">
                    <HelpCircle className="h-8 w-8 text-blue-600 mr-3" />
                    <h3 className="text-2xl font-semibold text-foreground">
                      ¿Primera vez en la plataforma?
                    </h3>
                  </div>
                  <p className="text-muted-foreground text-lg mb-6 max-w-2xl mx-auto">
                    Si es tu primera vez accediendo al sistema o tienes problemas con tus credenciales, 
                    contacta con la administración de tu institución educativa para obtener acceso.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button 
                      variant="academic" 
                      size="lg"
                      className="px-8 py-3 text-base"
                    >
                      Contactar Soporte Técnico
                    </Button>
                    <Button 
                      variant="outline" 
                      size="lg"
                      className="px-8 py-3 text-base"
                    >
                      Ver Guía de Usuario
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Información Adicional */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-center text-sm text-muted-foreground">
              <div className="space-y-2">
                <div className="font-semibold text-foreground">📱 Acceso 24/7</div>
                <p>Disponible desde cualquier dispositivo con internet</p>
              </div>
              <div className="space-y-2">
                <div className="font-semibold text-foreground">🔒 Plataforma Segura</div>
                <p>Tus datos están protegidos con encriptación avanzada</p>
              </div>
              <div className="space-y-2">
                <div className="font-semibold text-foreground">⚡ Tiempo Real</div>
                <p>Información actualizada instantáneamente</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;