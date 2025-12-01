// src/pages/SelectNivel.tsx
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import {
  BookOpenText,
  ClipboardList,
  Home,
  LogOut,
  LockKeyhole,
  ChevronRight,
  GraduationCap,
  School,
  User,
  Shield,
  Sparkles
} from "lucide-react";

// Importa tus assets
import fondo from "@/assets/fondo3.jpg";
import logoUpeu from "@/assets/logo.png";
import userPhoto from "@/assets/logo.png";

export default function SelectNivel() {
  const navigate = useNavigate();

  // Componente de Tile mejorado para los niveles
  const NivelTile = ({
    label,
    icon: IconComponent,
    onClick,
    description,
    accentColor = "from-blue-500 to-purple-600",
    textColor = "text-gray-800",
    delay = 0
  }: {
    label: string;
    icon: React.ElementType;
    onClick: () => void;
    description: string;
    accentColor?: string;
    textColor?: string;
    delay?: number;
  }) => (
    <Card
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
      className={`relative w-44 h-52 lg:w-52 lg:h-60 cursor-pointer
                  bg-white/95 backdrop-blur-xl rounded-2xl overflow-hidden
                  border border-gray-200/80 hover:border-gray-300 shadow-2xl hover:shadow-2xl
                  flex flex-col items-center justify-between p-6
                  transition-all duration-500 ease-out transform hover:-translate-y-2 hover:scale-105
                  group animate-fadeInUp`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Efecto de gradiente animado */}
      <div className={`absolute inset-0 bg-gradient-to-br ${accentColor} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
      
      {/* Patrón de puntos decorativo */}
      <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(circle_at_1px_1px,gray_1px,transparent_0)] bg-[length:20px_20px]" />
      
      {/* Icono con efecto mejorado */}
      <div className={`relative z-10 flex flex-col items-center justify-center flex-1`}>
        <div className={`p-4 rounded-2xl bg-gradient-to-br ${accentColor} shadow-lg group-hover:shadow-xl transition-all duration-500 mb-4`}>
          <IconComponent className="w-8 h-8 text-white" />
        </div>
        
        {/* Etiqueta del nivel */}
        <h3 className={`text-xl font-bold text-center mb-2 group-hover:${textColor} transition-colors duration-300 ${textColor}`}>
          {label}
        </h3>
        
        {/* Descripción */}
        <p className="text-sm text-gray-600 text-center leading-tight group-hover:text-gray-700 transition-colors duration-300">
          {description}
        </p>
      </div>

      {/* Indicador de hover */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300">
        <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${accentColor}`} />
      </div>

      {/* Borde animado */}
      <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${accentColor} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}>
        <div className="absolute inset-[2px] rounded-2xl bg-white/95" />
      </div>
    </Card>
  );

  return (
    <div
      className="min-h-screen flex relative overflow-hidden"
      style={{
        backgroundImage: `url(${fondo})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Overlay con gradiente mejorado */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/80 via-blue-900/70 to-indigo-900/80 backdrop-blur-[2px]" />

      {/* Elementos decorativos de fondo */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col lg:flex-row relative z-10">
        
        {/* Panel izquierdo - Niveles educativos */}
        <div className="flex-1 flex flex-col items-center justify-center min-h-screen p-8">
          
          {/* Header informativo */}
          <div className="text-center mb-12 animate-fadeInDown">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-2 bg-white/20 rounded-full backdrop-blur-sm">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold text-white">
                Selecciona tu Nivel
              </h1>
            </div>
            <p className="text-white/80 text-lg max-w-md mx-auto">
              Elige el nivel educativo para acceder al sistema de gestión académica
            </p>
          </div>

          {/* Grid de niveles mejorado */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto w-full">
            <NivelTile
              label="Inicial"
              icon={BookOpenText}
              onClick={() => navigate("/dashboard/inicial")}
              description="Educación temprana y desarrollo infantil integral"
              accentColor="from-yellow-400 to-orange-500"
              textColor="text-yellow-700"
              delay={0}
            />

            <NivelTile
              label="Primaria"
              icon={School}
              onClick={() => navigate("/dashboard/primaria")}
              description="Formación básica y desarrollo de competencias"
              accentColor="from-green-400 to-emerald-600"
              textColor="text-green-700"
              delay={150}
            />

            <NivelTile
              label="Secundaria"
              icon={ClipboardList}
              onClick={() => navigate("/dashboard/secundaria")}
              description="Educación media y preparación universitaria"
              accentColor="from-blue-400 to-indigo-600"
              textColor="text-blue-700"
              delay={300}
            />
          </div>

          {/* Información adicional */}
          <div className="mt-12 text-center animate-fadeInUp" style={{ animationDelay: '600ms' }}>
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 border border-white/30">
              <Sparkles className="w-4 h-4 text-yellow-300" />
              <span className="text-white text-sm font-medium">Sistema Educativo Boliviano 2025</span>
            </div>
          </div>
        </div>

        {/* Panel derecho - Perfil del usuario */}
        <aside className="w-full lg:w-96 xl:w-[420px] bg-gradient-to-b from-gray-900/95 to-black/90 p-8
                        flex flex-col items-center justify-between text-white relative
                        shadow-2xl border-l border-white/10 backdrop-blur-xl">
          
          {/* Efecto de borde decorativo */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent" />

          {/* Header del panel */}
          <div className="w-full">
            {/* Logo y título */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Shield className="w-5 h-5 text-blue-400" />
                </div>
                <span className="font-semibold text-white/80 text-sm">UEP BOLIVIA</span>
              </div>
              
              <div className="flex items-center gap-2">
                <img 
                  src={logoUpeu} 
                  alt="UPEU Logo" 
                  className="h-8 w-auto opacity-90 hover:opacity-100 transition-opacity"
                />
                <ChevronRight className="w-4 h-4 text-white/40 -rotate-180" />
              </div>
            </div>

            {/* Información del usuario mejorada */}
            <div className="flex flex-col items-center text-center mb-8 p-6 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
              {/* Avatar con efecto mejorado */}
              <div className="relative mb-4">
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-pulse blur-md opacity-50" />
                <img
                  src={userPhoto}
                  alt="Usuario"
                  className="relative w-24 h-24 rounded-full object-cover shadow-2xl border-4 border-white/20 z-10"
                />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-gray-900 z-20" />
              </div>

              {/* Información textual */}
              <h2 className="text-xl font-bold text-white mb-1">David Robert Yucra Mamani</h2>
              <p className="text-white/70 text-sm mb-2">Docente Titular</p>
              
              {/* Badge de institución */}
              <div className="inline-flex items-center gap-2 bg-blue-500/20 px-3 py-1 rounded-full border border-blue-500/30">
                <School className="w-3 h-3 text-blue-400" />
                <span className="text-blue-300 text-xs font-medium">UEP Técnico Humanístico Ebenezer</span>
              </div>
            </div>
          </div>

          {/* Sección de acciones del usuario */}
          <div className="w-full space-y-4">
            {/* Estadísticas rápidas */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="text-center p-3 bg-white/5 rounded-xl border border-white/10">
                <div className="text-lg font-bold text-green-400">3</div>
                <div className="text-xs text-white/60">Niveles</div>
              </div>
              <div className="text-center p-3 bg-white/5 rounded-xl border border-white/10">
                <div className="text-lg font-bold text-blue-400">12</div>
                <div className="text-xs text-white/60">Cursos</div>
              </div>
              <div className="text-center p-3 bg-white/5 rounded-xl border border-white/10">
                <div className="text-lg font-bold text-purple-400">A</div>
                <div className="text-xs text-white/60">Activo</div>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="space-y-3">
              {/* Botón Cerrar Sesión */}
              <Button
                variant="default"
                className="w-full bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 
                         text-white font-semibold py-3 rounded-xl flex items-center justify-center 
                         transition-all duration-300 group shadow-lg hover:shadow-xl hover:scale-105"
                onClick={() => {
                  localStorage.removeItem("nivel");
                  window.location.href = "/";
                }}
              >
                <LogOut className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform duration-200" />
                CERRAR SESIÓN
              </Button>

              {/* Botón Cambiar Contraseña */}
              <Button
                variant="outline"
                className="w-full bg-transparent border-white/20 hover:bg-white/5 hover:border-white/40
                         text-white font-medium py-3 rounded-xl flex items-center justify-center 
                         transition-all duration-300 group"
                onClick={() => console.log("Cambiar contraseña")}
              >
                <LockKeyhole className="w-4 h-4 mr-3 text-white/70 group-hover:text-white transition-colors duration-200" />
                Cambiar Contraseña
              </Button>
            </div>

            {/* Footer del panel */}
            <div className="pt-6 border-t border-white/10">
              <div className="text-center">
                <p className="text-white/50 text-xs">
                  Sistema Académico v2.0
                </p>
                <p className="text-white/40 text-xs mt-1">
                  © 2025 UEP Bolivia
                </p>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Efectos de partículas decorativas (opcional) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white/30 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${10 + Math.random() * 10}s`
            }}
          />
        ))}
      </div>
    </div>
  );
}