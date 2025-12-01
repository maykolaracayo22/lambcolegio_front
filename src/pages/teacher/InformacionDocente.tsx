// src/pages/teacher/InformacionDocente.jsx
import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  User, 
  GraduationCap, 
  Phone, 
  AtSign, 
  FileText, 
  Download, 
  Filter, 
  Mail, 
  Printer, 
  BookOpen,
  Clock,
  Users,
  Calendar,
  Building,
  Shield,
  Star,
  Award,
  BookMarked,
  MapPin,
  IdCard,
  Badge,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// --- Datos específicos para Bolivia ---
const ENTIDADES = ['UEP Técnico Humanístico Ebenezer'];
const NIVELES = ['Inicial', 'Primaria', 'Secundaria'];
const ANIOS = ['2025', '2024', '2023'];
const TRIMESTRES = ['T1', 'T2', 'T3'];
const TURNOS = ['Mañana', 'Tarde', 'Noche'];

// Grados por nivel según sistema educativo boliviano
const GRADOS = {
  Inicial: ['3 años', '4 años', '5 años'],
  Primaria: ['1°', '2°', '3°', '4°', '5°', '6°'],
  Secundaria: ['1°', '2°', '3°', '4°', '5°', '6°'],
};

// Secciones por nivel
const SECCIONES = {
  Inicial: ['A', 'B'],
  Primaria: ['A', 'B', 'C'],
  Secundaria: ['A', 'B'],
};

// Cursos por nivel - Adaptados a currículo boliviano
const CURSOS = {
  Inicial: ['Comunicación y Lenguaje', 'Matemática', 'Exploración del Medio', 'Expresión Artística'],
  Primaria: [
    'Lenguaje y Comunicación', 
    'Matemática', 
    'Ciencias Naturales', 
    'Ciencias Sociales', 
    'Valores Espirituales y Religiosos',
    'Educación Física y Deportes',
    'Arte y Cultura'
  ],
  Secundaria: [
    'Lenguaje y Comunicación',
    'Matemática',
    'Ciencias Naturales',
    'Ciencias Sociales',
    'Educación Física y Deportes',
    'Arte y Cultura',
    'Valores Espirituales y Religiosos',
    'Tecnología y Producción',
    'Idiomas Extranjeros'
  ],
};

// Datos mock del docente adaptado a Bolivia
const DOCENTE_BASE = {
  nombres: 'María Elena',
  apellidos: 'García Rodríguez',
  codigo: 'DOC-2024-001',
  ci: '87654321',
  telefono: '+591 76543210',
  correo: 'maria.garcia@uepthe.edu.bo',
  direccion: 'Av. Educación 123, Juliaca - Puno',
  especialidad: 'Educación Primaria',
  titulo: 'Licenciada en Educación',
  añosExperiencia: 8,
  fechaIngreso: '15/03/2018',
  estado: 'Activo',
  tipoContrato: 'Contratado',
  nro_rda: 'RDA-2024-001',
  estado_rda: 'VIGENTE',
  foto: 'https://via.placeholder.com/150',
  cursosAsignados: ['Lenguaje y Comunicación', 'Matemática'],
  horario: '07:30 AM - 01:30 PM',
  turno: 'Mañana',
  departamento: 'Primaria'
};

export default function InformacionDocente() {
  const navigate = useNavigate();

  // --- estado de filtros ---
  const [entidad, setEntidad] = useState(ENTIDADES[0]);
  const [nivel, setNivel] = useState('Primaria');
  const [anio, setAnio] = useState('2025');
  const [trimestre, setTrimestre] = useState('T1');
  const [turno, setTurno] = useState('Mañana');

  // Grado, sección y cursos dependen del nivel seleccionado
  const gradosDisponibles = useMemo(() => GRADOS[nivel] || [], [nivel]);
  const seccionesDisponibles = useMemo(() => SECCIONES[nivel] || [], [nivel]);
  const cursosDisponibles = useMemo(() => CURSOS[nivel] || [], [nivel]);

  const [grado, setGrado] = useState(gradosDisponibles[2] || gradosDisponibles[0] || '');
  const [seccion, setSeccion] = useState(seccionesDisponibles[0] || '');
  const [curso, setCurso] = useState(cursosDisponibles[0] || '');

  // Al cambiar de nivel, re-seleccionamos grado, sección y curso por defecto
  React.useEffect(() => {
    const g = GRADOS[nivel] || [];
    const s = SECCIONES[nivel] || [];
    const c = CURSOS[nivel] || [];
    setGrado(g[0] || '');
    setSeccion(s[0] || '');
    setCurso(c[0] || '');
  }, [nivel]);

  // --- estado del docente ---
  const [docente, setDocente] = useState(DOCENTE_BASE);

  // --- acciones ---
  const filtrar = () => {
    // Aquí podrías llamar a tu backend con los filtros
    // Simulamos actualización del docente
    setDocente((prev) => ({ 
      ...prev,
      cursosAsignados: [curso, ...cursosDisponibles.slice(0, 1)] // Mock de cursos asignados
    }));
  };

  const exportarPDF = () => {
    alert(`Exportando PDF de Información del Docente — ${docente.apellidos}, ${docente.nombres}
${entidad} • ${nivel} • ${grado} ${seccion} • ${anio} ${trimestre} • ${turno}`);
  };

  const exportarCSV = () => {
    const header = ['Docente', 'Código', 'CI', 'RDA', 'Estado RDA', 'Especialidad', 'Título', 'Años Experiencia', 'Entidad', 'Nivel', 'Grado', 'Sección', 'Curso', 'Año', 'Trimestre', 'Turno', 'Teléfono', 'Correo', 'Estado'];
    const row = [
      `${docente.apellidos}, ${docente.nombres}`,
      docente.codigo,
      docente.ci,
      docente.nro_rda,
      docente.estado_rda,
      docente.especialidad,
      docente.titulo,
      docente.añosExperiencia,
      entidad,
      nivel,
      grado,
      seccion,
      curso,
      anio,
      trimestre,
      turno,
      docente.telefono,
      docente.correo,
      docente.estado,
    ];
    const csv = header.join(',') + '\n' + row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `info_docente_${docente.codigo}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const imprimir = () => {
    window.print();
  };

  const verHorario = () => {
    navigate('/dashboard/teacher/horario', {
      state: { nivel, anio, grado, seccion, trimestre, turno }
    });
  };

  const verListaEstudiantes = () => {
    navigate('/dashboard/teacher/lista-estudiantes', {
      state: { nivel, anio, grado, seccion, trimestre, curso }
    });
  };

  const contactarAdministracion = () => {
    window.location.href = `mailto:administracion@uepthe.edu.bo?subject=Consulta%20Docente%20${encodeURIComponent(docente.codigo)}`;
  };

  // Estadísticas mock del docente
  const estadisticas = {
    totalEstudiantes: 35,
    promedioAsistencia: 92.5,
    cursosActivos: docente.cursosAsignados.length,
    evaluacionesPendientes: 3
  };

  return (
    <div className="space-y-6">
      {/* Sección de Filtros */}
      <Card className="bg-white p-4 rounded-lg shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-4 items-end">
          {/* Entidad */}
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Entidad</p>
            <Select value={entidad} onValueChange={setEntidad}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona entidad" />
              </SelectTrigger>
              <SelectContent>
                {ENTIDADES.map((e) => (
                  <SelectItem key={e} value={e}>{e}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Nivel */}
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Nivel</p>
            <Select value={nivel} onValueChange={setNivel}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona nivel" />
              </SelectTrigger>
              <SelectContent>
                {NIVELES.map((n) => (
                  <SelectItem key={n} value={n}>{n}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Grado */}
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Grado</p>
            <Select value={grado} onValueChange={setGrado}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona grado" />
              </SelectTrigger>
              <SelectContent>
                {gradosDisponibles.map((g) => (
                  <SelectItem key={g} value={g}>{g}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sección */}
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Sección</p>
            <Select value={seccion} onValueChange={setSeccion}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona sección" />
              </SelectTrigger>
              <SelectContent>
                {seccionesDisponibles.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Curso */}
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Curso</p>
            <Select value={curso} onValueChange={setCurso}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona curso" />
              </SelectTrigger>
              <SelectContent>
                {cursosDisponibles.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Año */}
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Año</p>
            <Select value={anio} onValueChange={setAnio}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona año" />
              </SelectTrigger>
              <SelectContent>
                {ANIOS.map((y) => (
                  <SelectItem key={y} value={y}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Trimestre */}
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Trimestre</p>
            <Select value={trimestre} onValueChange={setTrimestre}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona trimestre" />
              </SelectTrigger>
              <SelectContent>
                {TRIMESTRES.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Segunda fila de filtros */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end mt-4">
          {/* Turno */}
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Turno</p>
            <Select value={turno} onValueChange={setTurno}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona turno" />
              </SelectTrigger>
              <SelectContent>
                {TURNOS.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Button variant="academicYellow" onClick={filtrar}>
            <Filter className="h-4 w-4 mr-2" />
            FILTRAR
          </Button>
          <Button variant="outline" onClick={exportarPDF}>
            <Download className="h-4 w-4 mr-2" />
            Exportar PDF
          </Button>
          <Button variant="outline" onClick={exportarCSV}>
            <Download className="h-4 w-4 mr-2" />
            Exportar CSV
          </Button>
          <Button variant="outline" onClick={imprimir}>
            <Printer className="h-4 w-4 mr-2" />
            Imprimir
          </Button>
          <div className="ml-auto flex gap-2">
            <Button variant="secondary" onClick={verHorario}>
              <Calendar className="h-4 w-4 mr-2" />
              Ver horario
            </Button>
            <Button variant="secondary" onClick={verListaEstudiantes}>
              <Users className="h-4 w-4 mr-2" />
              Lista de estudiantes
            </Button>
            <Button variant="secondary" onClick={contactarAdministracion}>
              <Mail className="h-4 w-4 mr-2" />
              Contactar administración
            </Button>
          </div>
        </div>
      </Card>

      {/* Estadísticas Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Estudiantes</p>
                <p className="text-2xl font-bold text-blue-800">{estadisticas.totalEstudiantes}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Asistencia Promedio</p>
                <p className="text-2xl font-bold text-green-800">{estadisticas.promedioAsistencia}%</p>
              </div>
              <Clock className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Cursos Activos</p>
                <p className="text-2xl font-bold text-purple-800">{estadisticas.cursosActivos}</p>
              </div>
              <BookOpen className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Evaluaciones Pendientes</p>
                <p className="text-2xl font-bold text-orange-800">{estadisticas.evaluacionesPendientes}</p>
              </div>
              <FileText className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sección de Información del Docente */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Información Personal */}
        <Card>
          <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100">
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" />
              Información Personal
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <img
                  src={docente.foto}
                  alt="Foto del Docente"
                  className="w-20 h-20 rounded-full border-2 border-primary object-cover"
                />
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-foreground">{docente.nombres} {docente.apellidos}</h3>
                  <p className="text-sm text-muted-foreground">Código: {docente.codigo}</p>
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium text-green-600">{docente.estado}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex items-center text-muted-foreground">
                    <IdCard className="h-4 w-4 mr-2" />
                    <span className="font-semibold text-foreground">CI:</span>
                    <span className="ml-2 font-mono">{docente.ci}</span>
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <Shield className="h-4 w-4 mr-2" />
                    <span className="font-semibold text-foreground">RDA:</span>
                    <span className="ml-2 font-mono">{docente.nro_rda}</span>
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <Phone className="h-4 w-4 mr-2" />
                    <span className="font-semibold text-foreground">Teléfono:</span>
                    <span className="ml-2">{docente.telefono}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center text-muted-foreground">
                    <AtSign className="h-4 w-4 mr-2" />
                    <span className="font-semibold text-foreground">Correo:</span>
                    <span className="ml-2">{docente.correo}</span>
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span className="font-semibold text-foreground">Dirección:</span>
                    <span className="ml-2 text-xs">{docente.direccion}</span>
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <Clock className="h-4 w-4 mr-2" />
                    <span className="font-semibold text-foreground">Horario:</span>
                    <span className="ml-2">{docente.horario}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Información Profesional */}
        <Card>
          <CardHeader className="bg-gradient-to-r from-green-50 to-green-100">
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-green-600" />
              Información Profesional
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex items-center text-muted-foreground">
                    <BookOpen className="h-4 w-4 mr-2" />
                    <span className="font-semibold text-foreground">Especialidad:</span>
                    <span className="ml-2">{docente.especialidad}</span>
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <Award className="h-4 w-4 mr-2" />
                    <span className="font-semibold text-foreground">Título:</span>
                    <span className="ml-2">{docente.titulo}</span>
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <Star className="h-4 w-4 mr-2" />
                    <span className="font-semibold text-foreground">Años Exp.:</span>
                    <span className="ml-2">{docente.añosExperiencia}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center text-muted-foreground">
                    <Building className="h-4 w-4 mr-2" />
                    <span className="font-semibold text-foreground">Tipo Contrato:</span>
                    <span className="ml-2">{docente.tipoContrato}</span>
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span className="font-semibold text-foreground">Ingreso:</span>
                    <span className="ml-2">{docente.fechaIngreso}</span>
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <BookMarked className="h-4 w-4 mr-2" />
                    <span className="font-semibold text-foreground">Cursos Asignados:</span>
                    <span className="ml-2">{docente.cursosAsignados.length}</span>
                  </div>
                </div>
              </div>

              {/* Estado RDA */}
              <div className="pt-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground">Estado RDA:</span>
                  <Badge className={docente.estado_rda === "VIGENTE" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}>
                    {docente.estado_rda}
                  </Badge>
                </div>
              </div>

              {/* Cursos Asignados */}
              <div className="pt-4">
                <h4 className="font-semibold text-foreground mb-2">Cursos Asignados:</h4>
                <div className="flex flex-wrap gap-2">
                  {docente.cursosAsignados.map((curso, index) => (
                    <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                      {curso}
                    </span>
                  ))}
                </div>
              </div>

              {/* Metadatos del filtro activos */}
              <div className="pt-4 border-t border-gray-200">
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>Entidad: <span className="font-semibold text-foreground">{entidad}</span></p>
                  <p>Nivel / Grado / Sección: <span className="font-semibold text-foreground">{nivel} — {grado} {seccion}</span></p>
                  <p>Año / Trimestre / Turno: <span className="font-semibold text-foreground">{anio} {trimestre} • {turno}</span></p>
                  <p>Curso seleccionado: <span className="font-semibold text-foreground">{curso}</span></p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}