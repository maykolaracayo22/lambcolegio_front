// src/pages/Index.tsx
import { useState } from "react";
import { IdCard } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect } from "react";
import {
  ParentLoginCard,
  StudentLoginCard,
  TeacherLoginCard,
  AdminLoginCard,
} from "@/components/LoginCard";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

// ====================================================================
// ✅ IMPORTACIÓN DEL COMPONENTE TypewriterText
import TypewriterText from "@/components/ui/TypewriterText"; 
// ====================================================================

import {
  BookOpen,
  Users,
  TrendingUp,
  Shield,
  CheckCircle,
  Star,
  Clock,
  BarChart3,
  Sparkles,
  GraduationCap,
  ShieldCheck,
  Baby,
  School,
  Library,
  CalendarDays,
  Megaphone,
  Mail,
  Phone,
  MapPin,
  ArrowRight,
  FileText,
  Send,
  Trash2,
  HeartHandshake,
  User,
  Zap, 
} from "lucide-react";
import { toast } from "sonner";

import heroImage from "@/assets/fondo4.jpg";
import fondo3 from "@/assets/fondo3.jpg";
import fondo4 from "@/assets/fondo4.jpg";
import fondo5 from "@/assets/fondo5.jpg";
import fondo6 from "@/assets/fondo6.jpg";


const Index = () => {
  const [activeTab, setActiveTab] = useState<"login" | "features">("features");

  // ------------ HERO CAROUSEL DATA & STATES ------------
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedLevel, setSelectedLevel] = useState('inicial');
  const slides = [
    {
      image: fondo3,
      title: "Educación de Calidad",
      subtitle: "Formamos estudiantes integrales",
    },
    {
      image: fondo4,
      title: "Seguimiento Continuo",
      subtitle: "Monitoreo académico por trimestres",
    },
    {
      image: fondo5,
      title: "Tecnología Educativa",
      subtitle: "Plataforma moderna y accesible",
    },
    {
      image: fondo6,
      title: "Comunicación Efectiva",
      subtitle: "Padres y docentes conectados",
    },
  ];

  // Estados para el intercambio de imágenes de Misión/Visión
  const [misionMainImg, setMisionMainImg] = useState(fondo3);
  const [misionSecondaryImg, setMisionSecondaryImg] = useState(fondo4);

  const [visionMainImg, setVisionMainImg] = useState(fondo5);
  const [visionSecondaryImg, setVisionSecondaryImg] = useState(fondo6);

  const [compromisoMainImg, setCompromisoMainImg] = useState(fondo3);
  const [compromisoSecondaryImg, setCompromisoSecondaryImg] = useState(fondo4);

  // Función para intercambiar imágenes
  const swapImages = (section: 'mision' | 'vision' | 'compromiso') => {
    if (section === 'mision') {
      const temp = misionMainImg;
      setMisionMainImg(misionSecondaryImg);
      setMisionSecondaryImg(temp);
    } else if (section === 'vision') {
      const temp = visionMainImg;
      setVisionMainImg(visionSecondaryImg);
      setVisionSecondaryImg(temp);
    } else if (section === 'compromiso') {
      const temp = compromisoMainImg;
      setCompromisoMainImg(compromisoSecondaryImg);
      setCompromisoSecondaryImg(temp);
    }
  };

  // Función para cambiar de slide
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  // Auto-play del carrusel (5 segundos)
  useEffect(() => {
    const timer = setInterval(nextSlide, 8000);
    return () => clearInterval(timer);
  }, []); // El carrusel cambia automáticamente

  // Auto-cambio de imágenes Misión/Visión cada 8 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      swapImages('mision');
      
      setTimeout(() => {
        swapImages('vision');
      }, 2500);
      
      setTimeout(() => {
        swapImages('compromiso');
      }, 5000);
      
    }, 8000);

    return () => clearInterval(interval);
  }, [misionMainImg, misionSecondaryImg, visionMainImg, visionSecondaryImg, compromisoMainImg, compromisoSecondaryImg]);
  
  // ------------ RESTO DE DATA ------------
  const features = [
    {
      icon: <BookOpen className="h-8 w-8 text-secondary" />,
      title: "Gestión Académica",
      description: "Notas, tareas y evaluaciones con cortes trimestrales.",
    },
    {
      icon: <Users className="h-8 w-8 text-secondary" />,
      title: "Comunicación Integrada",
      description: "Padres, estudiantes y docentes en un solo lugar.",
    },
    {
      icon: <TrendingUp className="h-8 w-8 text-secondary" />,
      title: "Reportes Avanzados",
      description: "Informes descargables y progreso por curso.",
    },
    {
      icon: <Shield className="h-8 w-8 text-secondary" />,
      title: "Seguridad Garantizada",
      description: "Privacidad y protección de datos institucionales.",
    },
  ];

  const stats = [
    {
      number: "98%",
      label: "Satisfacción de Padres",
      icon: <Star className="h-5 w-5" />,
    },
    {
      number: "45min",
      label: "Tiempo Ahorrado/Semana",
      icon: <Clock className="h-5 w-5" />,
    },
    {
      number: "100%",
      label: "Transparencia Académica",
      icon: <CheckCircle className="h-5 w-5" />,
    },
    { number: "24/7", label: "Disponibilidad", icon: <BarChart3 className="h-5 w-5" /> },
  ];

  // ------------ FORM: ADMISIONES ------------
  const [admNombre, setAdmNombre] = useState("");
  const [admCiEstudiante, setAdmCiEstudiante] = useState("");
  const [admNivel, setAdmNivel] = useState<"" | "inicial" | "primaria" | "secundaria">("");
  const [admNombreTutor, setAdmNombreTutor] = useState("");
  const [admCiTutor, setAdmCiTutor] = useState("");
  const [admCorreo, setAdmCorreo] = useState("");
  const [admTelefono, setAdmTelefono] = useState("");
  const [admMensaje, setAdmMensaje] = useState("");

  const handleAdmision = (e: React.FormEvent) => {
    e.preventDefault();
    if (!admNombre || !admCiEstudiante || !admNivel || !admNombreTutor || !admCiTutor || !admCorreo || !admTelefono) {
      toast.error("Completa todos los campos obligatorios para continuar.");
      return;
    }
    toast.success("Solicitud de pre-inscripción enviada. Te contactaremos pronto.");
    // Limpiar formulario
    setAdmNombre("");
    setAdmCiEstudiante("");
    setAdmNivel("");
    setAdmNombreTutor("");
    setAdmCiTutor("");
    setAdmCorreo("");
    setAdmTelefono("");
    setAdmMensaje("");
  };

  // ------------ FORM: CONTACTO ------------
  const [ctNombre, setCtNombre] = useState("");
  const [ctCorreo, setCtCorreo] = useState("");
  const [ctMensaje, setCtMensaje] = useState("");

  const handleContacto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ctNombre || !ctCorreo || !ctMensaje) {
      toast.error("Completa nombre, correo y mensaje.");
      return;
    }
    toast.success("Mensaje enviado. ¡Gracias por escribirnos!");
    setCtNombre("");
    setCtCorreo("");
    setCtMensaje("");
  };

  // ====================================================================
  // COMIENZA EL RENDERIZADO DEL COMPONENTE
  // ====================================================================

  return (
    <div className="min-h-screen flex flex-col bg-background font-inter">
      <Header />

      <main className="flex-1">
        {/* ===================== HERO CAROUSEL ===================== */}
        <section className="bg-white">
          <div className="w-full">
            
            {/* Main Carousel */}
            <div className="relative h-[550px] lg:h-[650px] overflow-hidden"> 
              {/* Carousel Slides */}
              <div className="absolute inset-0">
                {slides.map((slide, index) => (
                  <div
                    key={index}
                    className={`absolute inset-0 transition-opacity duration-1000 ${
                      index === currentSlide ? "opacity-100" : "opacity-0"
                    }`}
                  >
                    <div
                      className="absolute inset-0 bg-cover bg-center"
                      style={{ backgroundImage: `url(${slide.image})` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-950/95 via-blue-900/75 to-blue-800/30" />
                  </div>
                ))}
              </div>

              {/* Content */}
              <div className="relative h-full flex items-center px-8 lg:px-16">
                <div className="max-w-2xl">
                  <Badge
                    variant="secondary"
                    className="mb-6 text-white bg-white/15 border-white/25 backdrop-blur-md px-4 py-2"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    <span style={{ fontFamily: "'Times New Roman', serif" }}>
                      U.E.P. Técnico Humanístico
                    </span>
                  </Badge>

                  {/* ✅ USO DEL TypewriterText EN EL TÍTULO SOLAMENTE (DURACIÓN 2s) */}
                  <h1
                    className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white leading-tight"
                    style={{ fontFamily: "'Times New Roman', serif" }}
                  >
                    <TypewriterText 
                      // ✅ Usamos currentSlide como KEY para forzar la animación de caída
                      key={currentSlide} 
                      text={slides[currentSlide].title} 
                      duration={4} 
                      className="block" 
                    />
                  </h1>

                  {/* ❌ SUBTÍTULO VUELVE A SER TEXTO ESTÁTICO (SIN ANIMACIÓN) */}
                  <p
                    className="text-lg md:text-xl lg:text-2xl mb-8 text-white/95 leading-relaxed"
                    style={{ fontFamily: "'Times New Roman', serif" }}
                  >
                    {slides[currentSlide].subtitle}
                  </p>

                  <div className="flex flex-wrap gap-4">
                    <a href="#login">
                      <Button
                        variant={"default"} 
                        size="lg"
                        className="px-8 py-6 text-base shadow-lg hover:shadow-xl transition-all bg-yellow-400 text-gray-900 hover:bg-yellow-300"
                        style={{ fontFamily: "'Times New Roman', serif" }}
                      >
                        Acceder Ahora
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                    </a>
                    <a href="#about">
                      <Button
                        variant="outline"
                        size="lg"
                        className="px-8 py-6 text-base bg-white/15 border-white/30 text-white hover:bg-white hover:text-primary backdrop-blur-md shadow-lg hover:shadow-xl transition-all"
                        style={{ fontFamily: "'Times New Roman', serif" }}
                      >
                        Conocer Más
                      </Button>
                    </a>
                  </div>
                </div>
              </div>

              {/* Navigation Arrows */}
              <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/25 hover:bg-white/40 backdrop-blur-md text-white p-3 rounded-full transition-all z-10 shadow-lg hover:scale-110 hidden lg:flex items-center justify-center"
                aria-label="Anterior"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/25 hover:bg-white/40 backdrop-blur-md text-white p-3 rounded-full transition-all z-10 shadow-lg hover:scale-110 hidden lg:flex items-center justify-center"
                aria-label="Siguiente"
              >
                <ChevronRight className="h-5 w-5" />
              </button>

              {/* Dots Indicator */}
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-10 bg-black/30 backdrop-blur-md px-6 py-3 rounded-full">
                {slides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`h-2.5 rounded-full transition-all ${
                      index === currentSlide
                        ? "w-10 bg-white"
                        : "w-2.5 bg-white/60 hover:bg-white/80"
                    }`}
                    aria-label={`Ir a slide ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ===================== NOSOTROS ===================== */}
<section id="about" className="py-20 bg-white relative overflow-hidden" style={{ scrollMarginTop: 120 }}>
  {/* Fondo animado con partículas */}
  <div className="absolute inset-0 z-0">
    <div className="absolute inset-0">
      {[...Array(15)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-gradient-to-r from-blue-200 to-purple-200 opacity-20 animate-float"
          style={{
            width: `${Math.random() * 20 + 5}px`,
            height: `${Math.random() * 20 + 5}px`,
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${Math.random() * 10 + 10}s`,
          }}
        />
      ))}
    </div>
    
    <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-blue-50/30 to-transparent" />
    <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-purple-50/30 to-transparent" />
  </div>

  <div className="container mx-auto px-4 relative z-10">
    
    <div className="space-y-24 max-w-6xl mx-auto mt-20">
      
      {/* Bloque 1: MISIÓN - Texto Izquierda, Imagen Derecha */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        
        {/* Contenido de Texto - Izquierda */}
        <div className="md:pr-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-4">
            <BookOpen className="h-4 w-4" />
            <span style={{ fontFamily: "'Times New Roman', serif" }}>01 - Nuestra Esencia</span>
          </div>
          <h3 
            className="text-3xl font-bold text-slate-800 mb-4"
            style={{ fontFamily: "'Times New Roman', serif" }}
          >
            Misión
          </h3>
          <p 
            className="text-lg text-slate-600 leading-relaxed"
            style={{ fontFamily: "'Times New Roman', serif" }}
          >
            Educar personas críticas y creativas que resuelvan problemas reales con ética, ciencia y tecnología. Nuestro compromiso es formar estudiantes integrales capaces de enfrentar los desafíos del mundo moderno con valores sólidos y competencias técnicas de excelencia.
          </p>
        </div>
        
        {/* Contenido Visual - Derecha (Círculo con efecto 3D de moneda) */}
        <div className="relative flex justify-center md:justify-end">
          <div className="w-full max-w-sm aspect-square relative">
            {/* Círculo contenedor grande */}
            <div 
              key={`mision-ring-${misionMainImg}`}
              className="absolute inset-0 rounded-full bg-blue-500/20 animate-spin-slow" 
            />
            
            {/* Contenedor 3D para el efecto de moneda */}
            <div className="absolute inset-4 perspective-1000">
              {/* Imagen principal con efecto 3D de moneda - SOLO LA IMAGEN */}
              <div className="relative w-full h-full preserve-3d coin-spin-container">
                <div className="absolute inset-0 backface-hidden rounded-full overflow-hidden shadow-2xl">
                  <img
                    key={`mision-main-${misionMainImg}`}
                    src={misionMainImg}
                    alt="Misión institucional"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
            
            {/* Imagen secundaria CLICKEABLE */}
            <button
              onClick={() => swapImages('mision')}
              key={`mision-btn-${misionSecondaryImg}`}
              className="absolute -bottom-4 -left-4 w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow-xl transition-all duration-300 hover:scale-125 hover:z-20 cursor-pointer focus:outline-none focus:ring-4 focus:ring-blue-300 animate-secondary-pop"
              aria-label="Cambiar imagen de misión"
            >
              <img 
                src={misionSecondaryImg}
                alt="Cambiar imagen" 
                className="w-full h-full object-cover"
              />
            </button>
          </div>
        </div>
      </div>
      
      {/* Separador visual */}
      <hr className="border-t border-purple-100/50 max-w-4xl mx-auto" />

      {/* Bloque 2: VISIÓN - Imagen Izquierda, Texto Derecha */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        
        {/* Contenido Visual - Izquierda (Círculo con efecto 3D de moneda) */}
        <div className="relative flex justify-center md:justify-start order-2 md:order-1">
          <div className="w-full max-w-sm aspect-square relative">
            {/* Círculo contenedor grande */}
            <div 
              key={`vision-ring-${visionMainImg}`}
              className="absolute inset-0 rounded-full bg-green-500/20 animate-spin-slow-reverse" 
            />
            
            {/* Contenedor 3D para el efecto de moneda */}
            <div className="absolute inset-4 perspective-1000">
              {/* Imagen principal con efecto 3D de moneda - SOLO LA IMAGEN */}
              <div className="relative w-full h-full preserve-3d coin-spin-container">
                <div className="absolute inset-0 backface-hidden rounded-full overflow-hidden shadow-2xl">
                  <img
                    key={`vision-main-${visionMainImg}`}
                    src={visionMainImg}
                    alt="Visión institucional"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
            
            {/* Imagen secundaria CLICKEABLE */}
            <button
              onClick={() => swapImages('vision')}
              key={`vision-btn-${visionSecondaryImg}`}
              className="absolute -top-4 -right-4 w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow-xl transition-all duration-300 hover:scale-125 hover:z-20 cursor-pointer focus:outline-none focus:ring-4 focus:ring-green-300 animate-secondary-pop"
              aria-label="Cambiar imagen de visión"
            >
              <img 
                src={visionSecondaryImg}
                alt="Cambiar imagen" 
                className="w-full h-full object-cover"
              />
            </button>
          </div>
        </div>

        {/* Contenido de Texto - Derecha */}
        <div className="md:pl-12 order-1 md:order-2">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium mb-4">
            <GraduationCap className="h-4 w-4" />
            <span style={{ fontFamily: "'Times New Roman', serif" }}>02 - Nuestro Futuro</span>
          </div>
          <h3 
            className="text-3xl font-bold text-slate-800 mb-4"
            style={{ fontFamily: "'Times New Roman', serif" }}
          >
            Visión
          </h3>
          <p 
            className="text-lg text-slate-600 leading-relaxed"
            style={{ fontFamily: "'Times New Roman', serif" }}
          >
            Ser referentes por innovación, inclusión y logros académicos sostenidos. Aspiramos a convertirnos en una institución líder reconocida por su excelencia educativa, preparando estudiantes que marquen la diferencia en la sociedad del siglo XXI.
          </p>
        </div>
      </div>

      {/* Separador visual */}
      <hr className="border-t border-purple-100/50 max-w-4xl mx-auto" />

      {/* Bloque 3: COMPROMISO - Texto Izquierda, Imagen Derecha */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        
        {/* Contenido de Texto - Izquierda */}
        <div className="md:pr-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-700 rounded-full text-sm font-medium mb-4">
            <ShieldCheck className="h-4 w-4" />
            <span style={{ fontFamily: "'Times New Roman', serif" }}>03 - Nuestra Promesa</span>
          </div>
          <h3 
            className="text-3xl font-bold text-slate-800 mb-4"
            style={{ fontFamily: "'Times New Roman', serif" }}
          >
            Compromiso
          </h3>
          <p 
            className="text-lg text-slate-600 leading-relaxed"
            style={{ fontFamily: "'Times New Roman', serif" }}
          >
            Procesos transparentes, evaluación formativa y comunicación permanente con las familias. Garantizamos un acompañamiento continuo en el desarrollo académico y personal de cada estudiante, manteniendo siempre informados a padres y tutores sobre su progreso.
          </p>
        </div>
        
        {/* Contenido Visual - Derecha (Círculo con efecto 3D de moneda) */}
        <div className="relative flex justify-center md:justify-end">
          <div className="w-full max-w-sm aspect-square relative">
            {/* Círculo contenedor grande */}
            <div 
              key={`compromiso-ring-${compromisoMainImg}`}
              className="absolute inset-0 rounded-full bg-orange-500/20 animate-spin-slow" 
            />
            
            {/* Contenedor 3D para el efecto de moneda */}
            <div className="absolute inset-4 perspective-1000">
              {/* Imagen principal con efecto 3D de moneda - SOLO LA IMAGEN */}
              <div className="relative w-full h-full preserve-3d coin-spin-container">
                <div className="absolute inset-0 backface-hidden rounded-full overflow-hidden shadow-2xl">
                  <img
                    key={`compromiso-main-${compromisoMainImg}`}
                    src={compromisoMainImg}
                    alt="Compromiso institucional"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
            
            {/* Imagen secundaria CLICKEABLE */}
            <button
              onClick={() => swapImages('compromiso')}
              key={`compromiso-btn-${compromisoSecondaryImg}`}
              className="absolute -bottom-4 -left-4 w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow-xl transition-all duration-300 hover:scale-125 hover:z-20 cursor-pointer focus:outline-none focus:ring-4 focus:ring-orange-300 animate-secondary-pop"
              aria-label="Cambiar imagen de compromiso"
            >
              <img 
                src={compromisoSecondaryImg}
                alt="Cambiar imagen" 
                className="w-full h-full object-cover"
              />
            </button>
          </div>
        </div>
      </div>
      
    </div>
  </div>
</section>

        {/* ===================== FEATURES ===================== */}
        {activeTab === "features" && (
          <section id="features" className="py-20 bg-gradient-to-br from-slate-50 to-blue-50 relative overflow-hidden" style={{ scrollMarginTop: 120 }}>
            {/* Fondo animado similar a las otras secciones */}
            <div className="absolute inset-0 z-0">
              {/* Grid de puntos suaves */}
              <div className="absolute inset-0 opacity-10">
                <div 
                  className="w-full h-full" 
                  style={{
                    backgroundImage: 'radial-gradient(circle, #3b82f6 1px, transparent 1px)',
                    backgroundSize: '50px 50px'
                  }}
                />
              </div>
              
              {/* Gradientes suaves animados */}
              <div className="absolute -top-20 -left-20 w-60 h-60 bg-purple-300/20 rounded-full blur-3xl animate-blob" />
              <div className="absolute -top-20 -right-20 w-60 h-60 bg-blue-300/20 rounded-full blur-3xl animate-blob animation-delay-2000" />
              <div className="absolute -bottom-20 left-1/3 w-60 h-60 bg-pink-300/20 rounded-full blur-3xl animate-blob animation-delay-4000" />
            </div>

            <div className="container mx-auto px-4 relative z-10">
              {/* Título principal con el mismo estilo */}
              <div className="max-w-4xl mx-auto text-center mb-16">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-4 hover:scale-105 transition-transform duration-300 cursor-default group">
                  <Sparkles className="h-4 w-4 group-hover:rotate-12 transition-transform duration-300" />
                  <span style={{ fontFamily: "'Times New Roman', serif" }}>Características Principales</span>
                </div>
                
                <h2 
                  className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-800 to-purple-700 bg-clip-text text-transparent hover:from-blue-600 hover:to-purple-600 transition-all duration-500"
                  style={{ fontFamily: "'Times New Roman', serif" }}
                >
                  Plataforma Integral
                </h2>
                
                <p 
                  className="text-xl text-slate-600 leading-relaxed hover:text-slate-800 transition-colors duration-300"
                  style={{ fontFamily: "'Times New Roman', serif" }}
                >
                  Todo lo que tu institución necesita para una gestión académica moderna y eficiente.
                </p>
              </div>

              {/* Features Grid con diseño circular similar a Nosotros */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
                {features.map((feature, index) => (
                  <div
                    key={index}
                    className="relative group text-center cursor-pointer"
                  >
                    {/* Círculo de fondo animado */}
                    <div className="absolute inset-0 rounded-full bg-blue-500/10 scale-0 group-hover:scale-100 transition-all duration-500 animate-spin-slow" />
                    
                    {/* Card principal */}
                    <Card className="relative overflow-hidden border-2 border-transparent group-hover:border-blue-200/50 transition-all duration-500 group-hover:shadow-2xl bg-white/80 backdrop-blur-sm">
                      <CardContent className="p-8 relative z-10">
                        {/* Icono con animación circular */}
                        <div className="mb-6 flex justify-center">
                          <div className="relative">
                            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 scale-0 group-hover:scale-100 transition-transform duration-500" />
                            <div className="relative p-4 rounded-full bg-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                              {feature.icon}
                            </div>
                          </div>
                        </div>
                        
                        <h3 
                          className="text-xl font-bold mb-4 text-slate-800 group-hover:text-blue-700 transition-colors duration-300"
                          style={{ fontFamily: "'Times New Roman', serif" }}
                        >
                          {feature.title}
                        </h3>
                        <p 
                          className="text-slate-600 leading-relaxed group-hover:text-slate-700 transition-colors duration-300"
                          style={{ fontFamily: "'Times New Roman', serif" }}
                        >
                          {feature.description}
                        </p>
                      </CardContent>
                      
                      {/* Efecto de brillo al hover */}
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" />
                    </Card>
                  </div>
                ))}
              </div>

              {/* Benefits Section con diseño intercalado */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto mb-16">
                
                {/* Card para Padres - Estilo similar a Nosotros */}
                <div className="relative group">
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-pink-500/10 to-pink-300/5 scale-0 group-hover:scale-100 transition-all duration-500" />
                  <Card className="relative overflow-hidden border border-pink-200/30 bg-white/80 backdrop-blur-sm hover:border-pink-300/50 transition-all duration-500">
                    <CardContent className="p-8">
                      <div className="flex items-center mb-6">
                        <div className="relative p-3 bg-pink-100 rounded-2xl mr-4 group-hover:scale-110 transition-transform duration-300">
                          <Users className="h-6 w-6 text-pink-600" />
                          <div className="absolute inset-0 rounded-2xl bg-pink-200/30 scale-0 group-hover:scale-100 transition-transform duration-500" />
                        </div>
                        <h3 
                          className="text-2xl font-bold text-slate-800"
                          style={{ fontFamily: "'Times New Roman', serif" }}
                        >
                          Para Padres y Tutores
                        </h3>
                      </div>
                      <ul className="space-y-4 text-slate-600">
                        {[
                          "Consulta de notas y conducta en tiempo real",
                          "Calendario de tareas y evaluaciones",
                          "Reportes trimestrales descargables",
                          "Comunicación directa con docentes"
                        ].map((item, index) => (
                          <li 
                            key={index}
                            className="flex items-center space-x-3 group-hover:translate-x-2 transition-transform duration-300"
                            style={{ fontFamily: "'Times New Roman', serif" }}
                          >
                            <div className="flex-shrink-0">
                              <CheckCircle className="h-5 w-5 text-pink-500" />
                            </div>
                            <span className="group-hover:text-slate-700 transition-colors duration-300">
                              {item}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>

                {/* Card para Docentes */}
                <div className="relative group">
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/10 to-blue-300/5 scale-0 group-hover:scale-100 transition-all duration-500" />
                  <Card className="relative overflow-hidden border border-blue-200/30 bg-white/80 backdrop-blur-sm hover:border-blue-300/50 transition-all duration-500">
                    <CardContent className="p-8">
                      <div className="flex items-center mb-6">
                        <div className="relative p-3 bg-blue-100 rounded-2xl mr-4 group-hover:scale-110 transition-transform duration-300">
                          <BookOpen className="h-6 w-6 text-blue-600" />
                          <div className="absolute inset-0 rounded-2xl bg-blue-200/30 scale-0 group-hover:scale-100 transition-transform duration-500" />
                        </div>
                        <h3 
                          className="text-2xl font-bold text-slate-800"
                          style={{ fontFamily: "'Times New Roman', serif" }}
                        >
                          Para Docentes
                        </h3>
                      </div>
                      <ul className="space-y-4 text-slate-600">
                        {[
                          "Registro de calificaciones y asistencia",
                          "Planificación por nivel: inicial, primaria, secundaria",
                          "Observaciones y boletines automáticos",
                          "Herramientas de análisis de rendimiento"
                        ].map((item, index) => (
                          <li 
                            key={index}
                            className="flex items-center space-x-3 group-hover:translate-x-2 transition-transform duration-300"
                            style={{ fontFamily: "'Times New Roman', serif" }}
                          >
                            <div className="flex-shrink-0">
                              <CheckCircle className="h-5 w-5 text-blue-500" />
                            </div>
                            <span className="group-hover:text-slate-700 transition-colors duration-300">
                              {item}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </div>

            </div>
          </section>
        )}

        {/* ===================== NIVELES ===================== */}
        <section id="niveles" className="py-20 bg-gradient-to-br from-slate-50 to-blue-50 relative overflow-hidden" style={{ scrollMarginTop: 120 }}>
          {/* Fondo animado ELEGANTE Y SUTIL */}
          <div className="absolute inset-0 z-0">
            {/* Grid de puntos suaves */}
            <div className="absolute inset-0 opacity-10">
              <div 
                className="w-full h-full" 
                style={{
                  backgroundImage: 'radial-gradient(circle, #3b82f6 1px, transparent 1px)',
                  backgroundSize: '40px 40px'
                }}
              />
            </div>
            
            {/* Gradientes suaves animados */}
            <div className="absolute top-0 -left-40 w-80 h-80 bg-purple-300/20 rounded-full blur-3xl animate-blob" />
            <div className="absolute top-0 -right-40 w-80 h-80 bg-blue-300/20 rounded-full blur-3xl animate-blob animation-delay-2000" />
            <div className="absolute -bottom-40 left-40 w-80 h-80 bg-pink-300/20 rounded-full blur-3xl animate-blob animation-delay-4000" />
            
            {/* Líneas diagonales sutiles */}
            <div className="absolute inset-0 opacity-5">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="absolute h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent"
                  style={{
                    top: `${(i + 1) * 15}%`,
                    left: 0,
                    right: 0,
                    transform: `rotate(-3deg)`,
                  }}
                />
              ))}
            </div>
          </div>

          <div className="container mx-auto px-4 relative z-10">
            {/* Título principal */}
        <div className="max-w-4xl mx-auto text-center mb-16">
          
          
          <h2 
            className="text-5xl md:text-6xl font-bold text-slate-800 mb-8 leading-tight"
            style={{ fontFamily: "'Times New Roman', serif" }}
          >
            Niveles de <br /> ENSEÑANZA
          </h2>
        </div>

            {/* ===================== CONTENIDO PRINCIPAL INTERACTIVO ===================== */}
            <div className="max-w-7xl mx-auto mt-16 flex flex-col lg:flex-row items-center justify-center gap-8">
              
              {/* Columna Izquierda: Botones de Selección */}
        <div className="lg:w-1/5 text-center lg:text-left mb-8 lg:mb-0">
          {/* Botones de selección de nivel con imágenes - SUPERPUESTOS VERTICALMENTE */}
          <div className="flex lg:flex-col justify-center lg:justify-start items-center lg:items-start">
            {[
              { key: 'inicial', img: fondo3, color: 'pink' },
              { key: 'primaria', img: fondo4, color: 'emerald' },
              { key: 'secundaria', img: fondo5, color: 'indigo' }
            ].map((level, index) => (
              <button
                key={level.key}
                onClick={() => setSelectedLevel(level.key)}
                className={`
                  relative w-24 h-24 lg:w-28 lg:h-28 rounded-full overflow-hidden border-4 cursor-pointer 
                  transition-all duration-500 ease-out z-10
                  ${selectedLevel === level.key 
                    ? `border-${level.color}-500 transform scale-110 shadow-2xl ring-4 ring-${level.color}-200 z-20` 
                    : 'border-gray-300 opacity-60 grayscale hover:opacity-100 hover:scale-105 hover:border-gray-400'
                  }
                  ${index > 0 ? 'lg:-mt-6' : ''} /* Superposición: cada botón se superpone 6px al anterior */
                `}
                style={{
                  marginTop: index > 0 ? '-24px' : '0' // Para versión móvil también
                }}
              >
                <img 
                  src={level.img} 
                  alt={`Nivel ${level.key}`} 
                  className="w-full h-full object-cover" 
                />
                
                {/* Indicador de selección más visible */}
                {selectedLevel === level.key && (
                  <div className={`absolute inset-0 rounded-full border-2 border-white animate-pulse`} />
                )}
              </button>
            ))}
          </div>
        </div>

              {/* Columna Central: Imagen Principal del Nivel Actual - MÁS GRANDE */}
              <div className="lg:w-2/5 flex justify-center items-center relative">
                <div className="w-full max-w-lg aspect-square relative">
                  {/* Círculo de fondo dinámico con animación */}
                  <div 
                    key={`bg-${selectedLevel}`}
                    className={`absolute inset-0 rounded-full transition-all duration-700 animate-scale-in ${
                      selectedLevel === 'inicial' ? 'bg-pink-300/30' :
                      selectedLevel === 'primaria' ? 'bg-emerald-300/30' :
                      'bg-indigo-300/30'
                    }`} 
                  />
                  
                  {/* Imagen principal con animación de entrada */}
                  <div 
                    key={`img-${selectedLevel}`}
                    className="absolute inset-4 rounded-full overflow-hidden shadow-2xl animate-fade-in-scale"
                  >
                    <img
                      src={
                        selectedLevel === 'inicial' ? fondo3 :
                        selectedLevel === 'primaria' ? fondo4 :
                        fondo5
                      }
                      alt={`Imagen principal del nivel ${selectedLevel}`}
                      className="w-full h-full object-cover transition-all duration-700 hover:scale-105"
                    />
                  </div>

                  {/* Indicador de edad flotante */}
                  <div 
                    key={`age-${selectedLevel}`}
                    className={`absolute -bottom-6 -right-6 px-6 py-3 rounded-full text-white font-bold shadow-xl animate-bounce-in ${
                      selectedLevel === 'inicial' ? 'bg-pink-500' :
                      selectedLevel === 'primaria' ? 'bg-emerald-500' :
                      'bg-indigo-500'
                    }`}
                    style={{ fontFamily: "'Times New Roman', serif" }}
                  >
                    {selectedLevel === 'inicial' ? '3-5' :
                    selectedLevel === 'primaria' ? '6-11' :
                    '12-16'} años
                  </div>
                </div>
              </div>

              {/* Columna Derecha: Contenido Dinámico - CON ANIMACIONES */}
              <div 
                key={`content-${selectedLevel}`}
                className="lg:w-2/5 text-center lg:text-left animate-slide-in-right"
              >
                <div 
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-3 ${
                    selectedLevel === 'inicial' ? 'bg-pink-100 text-pink-700' :
                    selectedLevel === 'primaria' ? 'bg-emerald-100 text-emerald-700' :
                    'bg-indigo-100 text-indigo-700'
                  }`}
                >
                  {selectedLevel === 'inicial' ? <Baby className="h-3 w-3" /> :
                  selectedLevel === 'primaria' ? <School className="h-3 w-3" /> :
                  <Library className="h-3 w-3" />}
                  <span style={{ fontFamily: "'Times New Roman', serif" }}>
                    {selectedLevel === 'inicial' ? '💫 Creatividad' :
                    selectedLevel === 'primaria' ? '🔬 Exploración' :
                    '🚀 Innovación'}
                  </span>
                </div>
                
                <h3 
                  className={`text-2xl md:text-3xl font-bold mb-3 leading-tight ${
                    selectedLevel === 'inicial' ? 'text-pink-700' :
                    selectedLevel === 'primaria' ? 'text-emerald-700' :
                    'text-indigo-700'
                  }`}
                  style={{ fontFamily: "'Times New Roman', serif" }}
                >
                  Nivel {selectedLevel === 'inicial' ? 'Inicial' :
                        selectedLevel === 'primaria' ? 'Primaria' :
                        'Secundaria'}
                </h3>
                
                <p 
                  className="text-base text-slate-600 leading-relaxed mb-5"
                  style={{ fontFamily: "'Times New Roman', serif" }}
                >
                  {selectedLevel === 'inicial' ? 
                    'Enfoque en psicomotricidad, pre-matemática y lenguaje a través de juegos y arte. Colaboración activa con las familias y evaluación formativa amistosa.' :
                  selectedLevel === 'primaria' ? 
                    'Fomentamos la comunicación, matemática, ciencia y arte. Introducción a proyectos STEAM, desarrollando el pensamiento lógico y la creatividad.' :
                    'Profundización científica y humanística. Proyectos técnicos y de emprendimiento para aplicar conocimientos en la vida real.'}
                </p>
                
                {/* Lista de características */}
                <ul className="space-y-2 text-slate-600 mb-5">
                  {(selectedLevel === 'inicial' ? [
                    'Psicomotricidad, pre-matemática y lenguaje',
                    'Juegos, arte y trabajo con familias',
                    'Evaluación formativa amistosa'
                  ] : selectedLevel === 'primaria' ? [
                    'Comunicación, Matemática, Ciencia y Arte',
                    'Proyectos STEAM iniciales',
                    'Hábitos y ciudadanía digital'
                  ] : [
                    'Profundización científica y humanística',
                    'Proyectos técnicos y emprendimiento',
                    'Orientación vocacional'
                  ]).map((feature, index) => (
                    <li 
                      key={index} 
                      className="flex items-start space-x-2 text-sm animate-fade-in"
                      style={{ 
                        fontFamily: "'Times New Roman', serif",
                        animationDelay: `${index * 100}ms`
                      }}
                    >
                      <CheckCircle className={`h-4 w-4 mt-0.5 flex-shrink-0 ${
                        selectedLevel === 'inicial' ? 'text-pink-500' :
                        selectedLevel === 'primaria' ? 'text-emerald-500' :
                        'text-indigo-500'
                      }`} />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            {/* ===================== FIN CONTENIDO PRINCIPAL INTERACTIVO ===================== */}

          </div>
        </section>
        
        {/* ===================== NOTICIAS ===================== */}
        <section id="noticias" className="py-20 bg-gradient-to-br from-purple-50 to-pink-50" style={{ scrollMarginTop: 120 }}>
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-medium mb-4">
                <Megaphone className="h-4 w-4" />
                Novedades
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-purple-700 to-pink-600 bg-clip-text text-transparent">
                Comunicados y Novedades
              </h2>
              <p className="text-xl text-slate-600 leading-relaxed">
                Información para familias y comunidad educativa.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {[
                {
                  t: "Celebración del Día de la Madre 2025",
                  d: "Nos unimos para celebrar el amor, la dedicación y la ternura de todas las madres en su día.",
                  imagen: "/src/assets/fondo4.jpg",
                  fecha: "09 Mayo 2025"
                },
                {
                  t: "Feria de Ciencia y Tecnología", 
                  d: "Participa con tu proyecto STEAM. Inscripciones abiertas.",
                  imagen: "/src/assets/fondo5.jpg",
                  fecha: "20 Sep 2024"
                },
                {
                  t: "Escuela para Padres",
                  d: "Talleres sobre hábitos saludables y ciudadanía digital.",
                  imagen: "/src/assets/fondo6.jpg",
                  fecha: "18 Sep 2024"
                },
              ].map((n, i) => (
                <div key={i} className="group cursor-pointer">
                  {/* Tarjeta con efecto hover */}
                  <div className="relative h-96 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500">
                    {/* Imagen de fondo */}
                    <img
                      src={n.imagen}
                      alt={n.t}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    
                    {/* Contenido normal - Badge inferior */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 bg-white/90 backdrop-blur-sm transform translate-y-0 group-hover:-translate-y-full opacity-100 group-hover:opacity-0 transition-all duration-500">
                      <div className="flex items-start gap-3">
                        <div className="bg-purple-600 text-white px-3 py-2 rounded-lg text-center min-w-16">
                          <div className="text-xs font-bold uppercase">MAYO</div>
                          <div className="text-lg font-bold">09</div>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-slate-800 mb-1 line-clamp-2">
                            {n.t}
                          </h3>
                          <Button variant="ghost" size="sm" className="text-purple-600 hover:text-purple-700 p-0 h-auto font-semibold">
                            Ver más...
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Overlay que aparece al hover - Se despliega desde abajo hacia arriba */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-blue/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500">
                      <div className="absolute bottom-0 left-0 right-0 p-6 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                        <div className="mb-3">
                          <span className="text-sm text-white/80 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                            {n.fecha}
                          </span>
                        </div>
                        <h3 className="text-2xl font-bold mb-3">
                          {n.t}
                        </h3>
                        <p className="text-white/90 leading-relaxed mb-4">
                          {n.d}
                        </p>
                        <Button className="bg-white/20 hover:bg-white/30 text-white border-white/30 hover:border-white/50 backdrop-blur-sm transition-all duration-300 group/btn">
                          <span>Ver más...</span>
                          <ArrowRight className="h-4 w-4 ml-2 group-hover/btn:translate-x-1 transition-transform duration-300" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Botón para ver más noticias */}
            <div className="text-center mt-12">
              <Button className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl px-8 py-6 transition-all duration-300 group">
                <span className="mr-2">Ver todas las noticias</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
              </Button>
            </div>
          </div>
        </section>

        {/* ===================== CONTACTO ===================== */}
        <section id="contact" className="py-20 bg-white" style={{ scrollMarginTop: 120 }}>
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-4">
                <Mail className="h-4 w-4" />
                Contáctanos
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                Hablemos
              </h2>
              <p className="text-xl text-slate-600 leading-relaxed">
                Escríbenos y con gusto te respondemos.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
              <Card className="border-0 shadow-xl rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-slate-800">Envíanos un Mensaje</CardTitle>
                </CardHeader>
                <CardContent>
                  <form className="space-y-4" onSubmit={handleContacto}>
                    <Input
                      placeholder="Nombre y Apellidos"
                      value={ctNombre}
                      onChange={(e) => setCtNombre(e.target.value)}
                      className="rounded-xl py-3"
                    />
                    <Input
                      placeholder="Correo electrónico"
                      type="email"
                      value={ctCorreo}
                      onChange={(e) => setCtCorreo(e.target.value)}
                      className="rounded-xl py-3"
                    />
                    <Textarea
                      placeholder="Tu mensaje"
                      value={ctMensaje}
                      onChange={(e) => setCtMensaje(e.target.value)}
                      className="rounded-xl min-h-[120px]"
                    />
                    <div className="flex gap-3">
                      <Button type="submit" className="rounded-xl flex-1 bg-blue-600 hover:bg-blue-700">
                        Enviar Mensaje
                      </Button>
                      <a href="mailto:contacto@uepth.edu.pe">
                        <Button type="button" variant="outline" className="rounded-xl">
                          Abrir Correo
                        </Button>
                      </a>
                    </div>
                  </form>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-xl bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl">
                <CardContent className="p-8 space-y-6">
                  <h3 className="text-xl font-bold text-slate-800">Información de Contacto</h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-slate-700">
                      <div className="p-2 bg-white rounded-xl shadow-sm">
                        <MapPin className="h-5 w-5 text-blue-600" />
                      </div>
                      <span>Av. Educación 123, Bolivia</span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-700">
                      <div className="p-2 bg-white rounded-xl shadow-sm">
                        <Phone className="h-5 w-5 text-blue-600" />
                      </div>
                      <a className="hover:text-blue-600 hover:underline transition-colors" href="tel:+51900000000">
                        + 900 000 000
                      </a>
                    </div>
                    <div className="flex items-center gap-3 text-slate-700">
                      <div className="p-2 bg-white rounded-xl shadow-sm">
                        <Mail className="h-5 w-5 text-blue-600" />
                      </div>
                      <a className="hover:text-blue-600 hover:underline transition-colors" href="mailto:contacto@uepth.edu.pe">
                        contacto@uepth.edu
                      </a>
                    </div>
                    <div className="flex items-center gap-3 text-slate-700">
                      <div className="p-2 bg-white rounded-xl shadow-sm">
                        <CalendarDays className="h-5 w-5 text-blue-600" />
                      </div>
                      <span>Atención: Lun–Vie 07:30 – 15:30</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* ===================== SOPORTE ===================== */}
        <section id="support" className="py-16 bg-gradient-to-r from-blue-600 to-purple-700 text-white">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 max-w-6xl mx-auto">
              <div className="text-center md:text-left">
                <h3 className="text-2xl font-bold mb-2">¿Necesitas Ayuda?</h3>
                <p className="text-blue-100 text-lg">
                  Visita nuestro centro de soporte o escríbenos.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <a href="#about">
                  <Button variant="secondary" className="rounded-xl bg-white text-blue-700 hover:bg-blue-50">
                    Manual de Usuario
                  </Button>
                </a>
                <a href="#contact">
                  <Button variant="outline" className="rounded-xl border-white text-white hover:bg-white/10">
                    Contactar Soporte
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
