import { useMemo, useState } from "react";
import {
  GraduationCap,
  Mail,
  Phone,
  MapPin,
  CalendarDays,
  Clock,
  ShieldCheck,
  ExternalLink,
  FileText,
  BookOpen,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

const INSTITUCION = {
  nombreCorto: "UEP Técnico Humanístico",
  nombreLargo: "Unidad Educativa Privada Técnico Humanístico Ebenezer",
  telefono: "+591 65317080",
  email: "LuisFredy@uepth.edu",
  direccion: "Av. Educación 123, Bolivia",
  horario: "Lun–Vie 07:30 – 15:30",
  ruc: "NIT 20XXXXXXXXX",
};

const Footer = () => {
  const [email, setEmail] = useState("");
  const year = useMemo(() => new Date().getFullYear(), []);

  const submitNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return alert("Ingresa un correo válido.");
    // Aquí integrarías tu backend o servicio (Mailchimp, SendGrid, etc.)
    alert(`¡Gracias! Te enviaremos novedades a: ${email}`);
    setEmail("");
  };

  return (
    <footer id="contact" className="w-full bg-primary text-primary-foreground mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Identidad */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-primary-foreground/10 rounded-lg">
                <GraduationCap className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold">{INSTITUCION.nombreLargo}</h3>
                <p className="text-xs opacity-80">{INSTITUCION.ruc}</p>
              </div>
            </div>
            <p className="opacity-90 text-sm leading-relaxed mb-4">
              Formación integral con enfoque <span className="font-semibold">técnico humanístico</span>,
              valores sólidos y acompañamiento constante entre <em>familia–escuela</em>.
              Nuestra plataforma digital asegura transparencia, trazabilidad y comunicación efectiva.
            </p>

            <div className="flex flex-wrap gap-2 text-xs">
              <span className="bg-primary-foreground/10 px-3 py-1 rounded-full">Gestión Académica</span>
              <span className="bg-primary-foreground/10 px-3 py-1 rounded-full">Evaluación por Trimestres</span>
              <span className="bg-primary-foreground/10 px-3 py-1 rounded-full">Reportes y Asistencia</span>
              <span className="bg-primary-foreground/10 px-3 py-1 rounded-full">Seguridad y Privacidad</span>
            </div>

            {/* Newsletter */}
            <Card className="mt-5 bg-primary-foreground/5 border-primary-foreground/20">
              <form onSubmit={submitNewsletter} className="p-4">
                <p className="text-sm mb-2 font-medium">Suscríbete a nuestras novedades</p>
                <div className="flex gap-2">
                  <Input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
                    placeholder="Tu correo institucional o personal"
                    className="bg-white text-foreground"
                  />
                  <Button type="submit" variant="secondary">Suscribirme</Button>
                </div>
                <p className="text-[11px] mt-2 opacity-70">
                  Al suscribirte aceptas recibir comunicaciones institucionales. Podrás darte de baja cuando quieras.
                </p>
              </form>
            </Card>
          </div>

          {/* Enlaces */}
          <div>
            <h4 className="font-semibold mb-4">Enlaces útiles</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <a className="flex items-center gap-2 hover:opacity-90" href="#admisiones">
                  <FileText className="h-4 w-4" /> Admisiones y matrícula
                </a>
              </li>
              <li>
                <a className="flex items-center gap-2 hover:opacity-90" href="#nivel-inicial">
                  <Users className="h-4 w-4" /> Niveles: Inicial
                </a>
              </li>
              <li>
                <a className="flex items-center gap-2 hover:opacity-90" href="#nivel-primaria">
                  <Users className="h-4 w-4" /> Niveles: Primaria
                </a>
              </li>
              <li>
                <a className="flex items-center gap-2 hover:opacity-90" href="#nivel-secundaria">
                  <Users className="h-4 w-4" /> Niveles: Secundaria
                </a>
              </li>
              <li>
                <a className="flex items-center gap-2 hover:opacity-90" href="#noticias">
                  <BookOpen className="h-4 w-4" /> Noticias y comunicados
                </a>
              </li>
              <li>
                <a className="flex items-center gap-2 hover:opacity-90" href="#soporte">
                  <ShieldCheck className="h-4 w-4" /> Soporte a familias
                </a>
              </li>
              <li>
                <a className="flex items-center gap-2 hover:opacity-90" href="#manual">
                  <ExternalLink className="h-4 w-4" /> Manual de usuario (PDF)
                </a>
              </li>
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h4 className="font-semibold mb-4">Contacto</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5" />
                <span>{INSTITUCION.direccion}</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <a href={`tel:${INSTITUCION.telefono}`} className="hover:opacity-90">
                  {INSTITUCION.telefono}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <a href={`mailto:${INSTITUCION.email}`} className="hover:opacity-90">
                  {INSTITUCION.email}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />
                <span>Calendario escolar trimestral</span>
              </li>
              <li className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>Horario de atención: {INSTITUCION.horario}</span>
              </li>
            </ul>

            <div className="mt-5 space-y-2">
              <a
                href={`mailto:${INSTITUCION.email}?subject=Solicitud%20de%20información%20-%20${encodeURIComponent(
                  INSTITUCION.nombreCorto
                )}`}
              >
                <Button className="w-full" variant="secondary">Solicitar información</Button>
              </a>
              <a href="#admisiones">
                <Button className="w-full" variant="outline">Ir a Admisiones</Button>
              </a>
            </div>
          </div>
        </div>

        {/* Divider + legal */}
        <div className="border-t border-primary-foreground/20 mt-10 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-2 text-sm opacity-80">
            <p>© {year} {INSTITUCION.nombreLargo}. Todos los derechos reservados.</p>
            <p className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" />
              Datos protegidos — Política de Privacidad & Términos
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
