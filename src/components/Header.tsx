// src/components/Header.tsx

import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Menu,
  X,
  ChevronDown,
  Facebook,
  Instagram,
  Youtube,
  Phone,
  Mail,
  MapPin,
} from "lucide-react";
import logo from "@/assets/logo.png";
import LoginModal from "./LoginModal";
import AdmisionesModal from "./AdmisionesModal"; 

const INSTITUCION = {
  nombreCorto: "UEP Técnico Humanístico",
  nombreLargo: "Unidad Educativa Privada Técnico Humanístico Ebenezer",
  telefono: "+591 65317080",
  email: "LuisFredy@uepth.edu",
  direccion: "Av. Educación 123, Bolivia",
  redes: {
    facebook: "#",
    instagram: "#",
    youtube: "#"
  }
};

const HEADER_HEIGHT_FULL = "h-[100px]"; 
const HEADER_HEIGHT_SCROLLED = "h-[65px]"; 

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isAdmisionesModalOpen, setIsAdmisionesModalOpen] = useState(false);
  const location = useLocation();

  const navLinks = useMemo(
    () => [
      { label: "Nosotros", hash: "#about", isDropdown: false },
      { label: "Niveles", hash: "#niveles", isDropdown: true }, 
      { label: "Admisiones", hash: "#admisiones", isDropdown: false },
      { label: "Noticias", hash: "#noticias", isDropdown: false },
      { label: "Contacto", hash: "#contact", isDropdown: false },
    ],
    []
  );

  const isActiveHash = (hash: string) => location.hash === hash;

  // Control del scroll - Umbral de 50px
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 50); 
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname, location.hash]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsMenuOpen(false);
        setIsLoginModalOpen(false);
        setIsAdmisionesModalOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const openLoginModal = () => {
    setIsLoginModalOpen(true);
    setIsMenuOpen(false);
  };

  const openAdmisionesModal = () => {
    setIsAdmisionesModalOpen(true);
    setIsMenuOpen(false);
  };

  const closeLoginModal = () => setIsLoginModalOpen(false);
  const closeAdmisionesModal = () => setIsAdmisionesModalOpen(false);


  return (
    <>
      {/* Header Principal */}
      <header
        // Aplicamos font-serif y el estilo CSS para Times New Roman
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 font-serif ${ 
          isScrolled  
            ? "bg-blue-900 shadow-xl" 
            : "bg-white/95 backdrop-blur-sm border-b border-gray-200"
        }`}
        style={{ fontFamily: "'Times New Roman', serif" }} 
      >
        <div className="container mx-auto px-4">
          
          {/* Barra superior con contacto y redes sociales (OCULTA CON SCROLL) */}
          <div 
            className={`transition-all duration-300 overflow-hidden ${
              isScrolled ? "max-h-0 py-0" : "max-h-20 border-b border-gray-200 py-2"
            }`}
            aria-hidden={isScrolled}
          >
            <div className="flex flex-col md:flex-row justify-between items-center gap-2 text-sm text-gray-600">
              
              {/* Información de contacto */}
              <div className="flex flex-wrap items-center gap-4 justify-center md:justify-start">
                <a 
                  href={`tel:${INSTITUCION.telefono.replace(/\s+/g, "")}`}
                  className="flex items-center gap-1 hover:text-blue-600 transition-colors"
                >
                  <Phone className="h-3 w-3" />
                  {INSTITUCION.telefono}
                </a>
                <a 
                  href={`mailto:${INSTITUCION.email}`}
                  className="flex items-center gap-1 hover:text-blue-600 transition-colors"
                >
                  <Mail className="h-3 w-3" />
                  {INSTITUCION.email}
                </a>
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {INSTITUCION.direccion}
                </span>
              </div>

              {/* ✅ Redes sociales (Estilo Circular) */}
              <div className="flex items-center gap-3">
                
                {/* Tik Tok (Añadido basado en tu imagen) */}
                <a 
                  href={INSTITUCION.redes.instagram} // Usamos Instagram por defecto para el enlace
                  className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-400 bg-white group hover:border-pink-600 transition-all"
                  aria-label="TikTok"
                >
                  {/* Ícono SVG de TikTok (Si no tienes el componente, usa este SVG) */}
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-pink-600 group-hover:scale-110 transition-transform"><path d="M21 8a2 2 0 0 0-2-2h-5v5h4a2 2 0 0 0 2-2zM12 2v20h4V14a4 4 0 0 0-4-4h-4V2z"></path></svg>
                </a>

                {/* Facebook */}
                <a 
                  href={INSTITUCION.redes.facebook} 
                  className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-400 bg-white group hover:border-blue-600 transition-all"
                  aria-label="Facebook"
                >
                  <Facebook className="h-4 w-4 text-blue-600 group-hover:scale-110 transition-transform" />
                </a>

                {/* Instagram */}
                <a 
                  href={INSTITUCION.redes.instagram} 
                  className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-400 bg-white group hover:border-pink-500 transition-all"
                  aria-label="Instagram"
                >
                  <Instagram className="h-4 w-4 text-pink-500 group-hover:scale-110 transition-transform" />
                </a>

                {/* YouTube */}
                <a 
                  href={INSTITUCION.redes.youtube} 
                  className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-400 bg-white group hover:border-red-600 transition-all"
                  aria-label="YouTube"
                >
                  <Youtube className="h-4 w-4 text-red-600 group-hover:scale-110 transition-transform" />
                </a>
              </div>
            </div>
          </div>

          {/* Navegación principal */}
          <div className="py-3">
            <div className="flex items-center justify-between">
              
              {/* Logo y nombre (CON ANIMACIÓN AL SCROLL) */}
              <Link 
                to="/" 
                className="flex items-center gap-3 group"
                aria-label="Ir al inicio"
              >
                <img
                  src={logo}
                  alt={`${INSTITUCION.nombreCorto} - Logo`}
                  className={`h-10 w-auto object-contain transition-all duration-300 ${
                      isScrolled ? "h-8" : "h-10" 
                    }`}
                />
                <div className={`hidden md:block transition-all duration-300 ${
                  isScrolled ? "text-white" : "text-gray-900"
                }`}>
                  <h1 className="text-lg font-bold leading-tight">
                    {INSTITUCION.nombreCorto}
                  </h1>
                  <p className={`text-xs leading-none transition-all duration-300 ${
                    isScrolled ? "text-blue-200 opacity-0 max-h-0" : "text-gray-600 opacity-100 max-h-5"
                  }`}>
                    {INSTITUCION.nombreLargo}
                  </p>
                </div>
              </Link>

              {/* Navegación desktop */}
              <nav className="hidden lg:flex items-center gap-1">
                {navLinks.map((link) => (
                  <div key={link.hash} className={link.isDropdown ? "relative group" : ""}>
                    <a 
                      href={link.isDropdown ? undefined : link.hash} 
                      aria-current={isActiveHash(link.hash) ? "page" : undefined}
                    >
                      <div 
                        className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 cursor-pointer inline-flex items-center ${
                          isScrolled
                            ? "text-white hover:bg-blue-800"
                            : "text-gray-700 hover:bg-gray-100"
                        } ${
                          isActiveHash(link.hash) 
                            ? isScrolled 
                              ? "bg-blue-800 text-white" 
                              : "bg-blue-50 text-blue-700"
                            : ""
                        }`}
                        aria-haspopup={link.isDropdown ? "menu" : undefined}
                        aria-expanded="false"
                      >
                        {link.label}
                        {link.isDropdown && <ChevronDown className="ml-1 h-4 w-4" />}
                      </div>
                    </a>
                    
                    {/* Contenido del Dropdown de Niveles */}
                    {link.isDropdown && (
                      <Card 
                        className="absolute left-0 mt-2 hidden group-hover:block z-50 w-44 p-2" 
                        role="menu" 
                        aria-label="Niveles educativos"
                      >
                        <a href="#nivel-inicial" className="block px-3 py-2 rounded-md hover:bg-gray-100 text-gray-700">
                          Inicial
                        </a>
                        <a href="#nivel-primaria" className="block px-3 py-2 rounded-md hover:bg-gray-100 text-gray-700">
                          Primaria
                        </a>
                        <a href="#nivel-secundaria" className="block px-3 py-2 rounded-md hover:bg-gray-100 text-gray-700">
                          Secundaria
                        </a>
                      </Card>
                    )}
                  </div>
                ))}
              </nav>

              {/* Botones CTA */}
              <div className="hidden lg:flex items-center gap-2">
                <Button
                  onClick={openLoginModal}
                  variant={isScrolled ? "secondary" : "outline"}
                  size="sm"
                  // Ajuste de color para el fondo oscuro
                  className={isScrolled ? "bg-white text-blue-900 hover:bg-gray-100" : ""}
                >
                  Ingresar
                </Button>
                <Button
                  onClick={openAdmisionesModal}
                  size="sm"
                  className={isScrolled ? "bg-yellow-400 text-gray-900 hover:bg-yellow-300" : "bg-blue-600 text-white hover:bg-blue-700"}
                >
                  Matrícula en línea
                </Button>
              </div>

              {/* Botón menú móvil */}
              <button
                onClick={() => setIsMenuOpen((v) => !v)}
                className={`lg:hidden p-2 rounded-lg transition-colors ${
                  isScrolled 
                    ? "text-white hover:bg-blue-800" 
                    : "text-gray-700 hover:bg-gray-100"
                }`}
                aria-label="Abrir menú"
                aria-expanded={isMenuOpen}
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Menú móvil */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 bg-white shadow-lg">
            <nav className="container mx-auto px-4 py-4">
              <div className="space-y-2">
                {navLinks.map((link) => (
                  <div key={link.hash}>
                    {link.isDropdown ? (
                      // Sección para Niveles en móvil
                      <div className="py-2 border-b border-gray-100">
                        <p className="px-4 py-3 font-bold text-gray-700">{link.label}</p>
                        <a 
                          href="#nivel-inicial" 
                          onClick={() => setIsMenuOpen(false)}
                          className="block pl-8 pr-4 py-2 text-gray-600 hover:bg-blue-50/50"
                        >
                          Inicial
                        </a>
                        <a 
                          href="#nivel-primaria" 
                          onClick={() => setIsMenuOpen(false)}
                          className="block pl-8 pr-4 py-2 text-gray-600 hover:bg-blue-50/50"
                        >
                          Primaria
                        </a>
                        <a 
                          href="#nivel-secundaria" 
                          onClick={() => setIsMenuOpen(false)}
                          className="block pl-8 pr-4 py-2 text-gray-600 hover:bg-blue-50/50"
                        >
                          Secundaria
                        </a>
                      </div>
                    ) : (
                      // Enlaces regulares
                      <a
                        href={link.hash}
                        onClick={() => setIsMenuOpen(false)}
                        className={`block px-4 py-3 rounded-lg font-medium transition-colors font-serif ${
                          isActiveHash(link.hash)
                            ? "bg-blue-50 text-blue-700 border-l-4 border-blue-700"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        {link.label}
                      </a>
                    )}
                  </div>
                ))}
                
                <div className="pt-4 border-t border-gray-200 space-y-2">
                  <Button
                    onClick={openLoginModal}
                    variant="outline"
                    className="w-full justify-center"
                  >
                    Ingresar
                  </Button>
                  <Button
                    onClick={openAdmisionesModal}
                    className="w-full justify-center bg-blue-600 text-white hover:bg-blue-700"
                  >
                    Matrícula en línea
                  </Button>
                </div>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Espacio para el header fijo - Mantiene el espaciado correcto */}
      <div 
        className={`transition-all duration-300 ${isScrolled ? HEADER_HEIGHT_SCROLLED : HEADER_HEIGHT_FULL}`}
      />

      {/* Modales */}
      <LoginModal isOpen={isLoginModalOpen} onClose={closeLoginModal} />
      <AdmisionesModal isOpen={isAdmisionesModalOpen} onClose={closeAdmisionesModal} />
    </>
  );
};

export default Header;