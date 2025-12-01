// src/pages/parent/InformacionEstudiante.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, GraduationCap, Phone, AtSign, FileText, Download, Filter, Mail, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// --- helpers de datos mock (ajusta con tu backend) ---
const ENTIDADES = ['Colegio ABC', 'Colegio XYZ'];
const NIVELES = ['Inicial', 'Primaria', 'Secundaria'];
const ANIOS = ['2025', '2024', '2023'];
const TRIMESTRES = ['T1', 'T2', 'T3'];

// Grados por nivel
const GRADOS = {
  Inicial: ['3 años', '4 años', '5 años'],
  Primaria: ['1°', '2°', '3°', '4°', '5°', '6°'],
  Secundaria: ['1°', '2°', '3°', '4°', '5°', '6°'],
};

// Secciones por nivel (mock)
const SECCIONES = {
  Inicial: ['A', 'B'],
  Primaria: ['A', 'B', 'C'],
  Secundaria: ['A', 'B'],
};

// Datos mock del estudiante (podrías cargar por API según filtros)
const ESTUDIANTE_BASE = {
  nombres: 'Juan',
  apellidos: 'Pérez Martínez',
  codigo: '2024-0001',
  telefono: '999-999-999',
  responsable: 'Pedro Armas',
  dniResponsable: '123456789',
  correo: 'juan.perez@colegio.edu',
  foto: 'https://via.placeholder.com/150',
};

// Config mensualidad (Bolivia)
const MESES_PENSION = 10;        // Feb–Nov
const MONTO_PENSION_BS = 400;    // fijo, cambia si tu colegio usa otro

export default function InformacionEstudiante() {
  const navigate = useNavigate();

  // --- estado de filtros ---
  const [entidad, setEntidad] = useState(ENTIDADES[0]);
  const [nivel, setNivel] = useState('Primaria');
  const [anio, setAnio] = useState('2025');
  const [trimestre, setTrimestre] = useState('T1');

  // Grado y sección dependen del nivel seleccionado
  const gradosDisponibles = useMemo(() => GRADOS[nivel] || [], [nivel]);
  const seccionesDisponibles = useMemo(() => SECCIONES[nivel] || [], [nivel]);

  const [grado, setGrado] = useState(gradosDisponibles[2] || gradosDisponibles[0] || ''); // default
  const [seccion, setSeccion] = useState(seccionesDisponibles[0] || '');

  useEffect(() => {
    const g = GRADOS[nivel] || [];
    const s = SECCIONES[nivel] || [];
    setGrado(g[0] || '');
    setSeccion(s[0] || '');
  }, [nivel]);

  // --- estado de “resultado” (como si hubiéramos consultado) ---
  const [alumno, setAlumno] = useState(ESTUDIANTE_BASE);

  // --- acciones ---
  const filtrar = () => {
    // Aquí podrías llamar a tu backend con {entidad, nivel, anio, trimestre, grado, seccion}
    setAlumno((prev) => ({ ...prev }));
  };

  const exportarPDF = () => {
    alert(`Exportando PDF de Información del Estudiante — ${alumno.apellidos}, ${alumno.nombres}
${entidad} • ${nivel} • ${grado} ${seccion} • ${anio} ${trimestre}`);
  };

  const exportarCSV = () => {
    const header = ['Alumno', 'Código', 'Entidad', 'Nivel', 'Grado', 'Sección', 'Año', 'Trimestre', 'Teléfono', 'Responsable', 'DNI Responsable', 'Correo'];
    const row = [
      `${alumno.apellidos}, ${alumno.nombres}`,
      alumno.codigo,
      entidad,
      nivel,
      grado,
      seccion,
      anio,
      trimestre,
      alumno.telefono,
      alumno.responsable,
      alumno.dniResponsable,
      alumno.correo,
    ];
    const csv = header.join(',') + '\n' + row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `info_estudiante_${alumno.codigo}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const imprimir = () => window.print();

  const verFichaAcademica = () => {
    navigate('/dashboard/parent/notas-academicas', {
      state: { nivel, anio, grado, seccion, trimestre }
    });
  };

  const contactar = () => {
    window.location.href = `mailto:${alumno.correo}?subject=Consulta%20sobre%20${encodeURIComponent(alumno.apellidos)}%2C%20${encodeURIComponent(alumno.nombres)}`;
  };

  // ================================
  // MENSUALIDAD — vista mínima
  // Guardamos solo "mesesPagados" (0..10) por alumno + año
  // ================================
  const STORAGE_KEY = useMemo(
    () => `parent:pagos:${alumno.codigo}:${anio}:mesesPagados`,
    [alumno.codigo, anio]
  );

  // cargar inicial
  const readMeses = (key) => {
    const raw = localStorage.getItem(key);
    const n = Number(raw);
    return Number.isFinite(n) ? Math.min(Math.max(n, 0), MESES_PENSION) : 0;
  };

  const [mesesPagados, setMesesPagados] = useState(() => readMeses(STORAGE_KEY));

  // cuando cambie alumno/año, recargar
  useEffect(() => {
    setMesesPagados(readMeses(STORAGE_KEY));
  }, [STORAGE_KEY]);

  // persistir
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, String(mesesPagados));
  }, [STORAGE_KEY, mesesPagados]);

  const adeudados = MESES_PENSION - mesesPagados;
  const totalDebe = adeudados * MONTO_PENSION_BS;

  const marcarUnPago = () => setMesesPagados((n) => (n < MESES_PENSION ? n + 1 : n));
  const deshacerUnPago = () => setMesesPagados((n) => (n > 0 ? n - 1 : n));

  return (
    <div className="space-y-6">
      {/* Sección de Filtros */}
      <Card className="bg-white p-4 rounded-lg shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 items-end">
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
            <Button variant="secondary" onClick={verFichaAcademica}>
              <FileText className="h-4 w-4 mr-2" />
              Ver ficha académica
            </Button>
            <Button variant="secondary" onClick={contactar}>
              <Mail className="h-4 w-4 mr-2" />
              Contactar
            </Button>
          </div>
        </div>
      </Card>

      {/* Sección de Información del Estudiante */}
      <Card>
        <CardHeader>
          <CardTitle>Información del Estudiante</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
            {/* Columna Izquierda */}
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <img
                  src={alumno.foto}
                  alt="Foto del Alumno"
                  className="w-24 h-24 rounded-full border-2 border-primary object-cover"
                />
                <div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <User className="h-4 w-4 mr-2" />
                    <p className="font-semibold text-foreground">Alumno:</p>
                    <p className="ml-2">{alumno.nombres} {alumno.apellidos}</p>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground mt-1">
                    <GraduationCap className="h-4 w-4 mr-2" />
                    <p className="font-semibold text-foreground">Nivel / Grado / Sección:</p>
                    <p className="ml-2">{nivel} — {grado} {seccion}</p>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground mt-1">
                    <FileText className="h-4 w-4 mr-2" />
                    <p className="font-semibold text-foreground">Código:</p>
                    <p className="ml-2">{alumno.codigo}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Columna Derecha */}
            <div className="space-y-3">
              <div className="flex items-center text-sm text-muted-foreground">
                <Phone className="h-4 w-4 mr-2" />
                <p className="font-semibold text-foreground">Teléfono de Contacto:</p>
                <p className="ml-2">{alumno.telefono}</p>
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <User className="h-4 w-4 mr-2" />
                <p className="font-semibold text-foreground">Responsable Financiero:</p>
                <p className="ml-2">{alumno.responsable}</p>
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <FileText className="h-4 w-4 mr-2" />
                <p className="font-semibold text-foreground">DNI R.F.:</p>
                <p className="ml-2">{alumno.dniResponsable}</p>
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <AtSign className="h-4 w-4 mr-2" />
                <p className="font-semibold text-foreground">Correo:</p>
                <p className="ml-2">{alumno.correo}</p>
              </div>

              {/* Metadatos del filtro activos */}
              <div className="pt-2 text-xs text-muted-foreground">
                <p>Entidad: <span className="font-semibold text-foreground">{entidad}</span></p>
                <p>Año / Trimestre: <span className="font-semibold text-foreground">{anio} {trimestre}</span></p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* === MENSUALIDAD (Bolivia) — Vista mínima: solo total adeudado === */}
      <Card>
        <CardHeader>
          <CardTitle>Mensualidad {anio}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Total adeudado grande */}
          <div>
            <p className="text-sm text-muted-foreground">Total adeudado</p>
            <div className="text-3xl font-extrabold">
              {totalDebe.toLocaleString('es-BO')} Bs
            </div>
          </div>

          {/* Resumen ultra-corto */}
          <p className="text-sm text-muted-foreground">
            Pagados: <span className="font-semibold">{mesesPagados}</span> / {MESES_PENSION} ·{' '}
            Pendientes: <span className="font-semibold">{adeudados}</span> ·{' '}
            Monto por mes: <span className="font-semibold">{MONTO_PENSION_BS} Bs</span>
          </p>

          {/* Botones mínimos (si no los quieres, elimina este bloque) */}
          <div className="flex gap-2">
            <Button onClick={marcarUnPago} disabled={mesesPagados >= MESES_PENSION}>
              Marcar 1 mes pagado
            </Button>
            <Button variant="outline" onClick={deshacerUnPago} disabled={mesesPagados <= 0}>
              Deshacer 1
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
