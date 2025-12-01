// src/pages/parent/InformacionEstudiante.jsx
import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  User, GraduationCap, Phone, AtSign, FileText, Download, Filter, 
  Mail, Printer, QrCode, Upload, CheckCircle, Clock, AlertCircle,
  ChevronDown, ChevronUp, MessageCircle, BarChart3, CreditCard,
  Send, Camera
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

// --- helpers de datos mock ---
const ENTIDADES = ['Colegio Bolivia', 'Colegio ABC'];
const NIVELES = ['Inicial', 'Primaria', 'Secundaria'];
const ANIOS = ['2025', '2024', '2023'];
const TRIMESTRES = ['T1', 'T2', 'T3'];

const GRADOS = {
  Inicial: ['3 años', '4 años', '5 años'],
  Primaria: ['1°', '2°', '3°', '4°', '5°', '6°'],
  Secundaria: ['1°', '2°', '3°', '4°', '5°', '6°'],
};

const SECCIONES = {
  Inicial: ['A', 'B'],
  Primaria: ['A', 'B', 'C'],
  Secundaria: ['A', 'B'],
};

const ESTUDIANTE_BASE = {
  nombres: 'María',
  apellidos: 'Pérez González',
  codigo: '2025-0012',
  telefono: '944042223',
  responsable: 'Carlos Pérez',
  dniResponsable: '987654321',
  correo: 'maria.perez@colegio.edu',
  foto: 'https://via.placeholder.com/150',
  whatsapp: '+944042223'
};

// ==== Config mensualidad Bolivia ====
const MESES_BO = ['Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre'];
const MESES_PENSION = 10;
const MONTO_PENSION_BS = 400;

// Información bancaria y WhatsApp de finanzas
const COLEGIO_INFO = {
  bancos: {
    principal: {
      banco: 'BANCO UNIÓN',
      cuenta: '1234-567-890',
      tipo: 'Cuenta Corriente',
      beneficiario: 'COLEGIO BOLIVIA',
      nit: '123456789'
    },
    secundario: {
      banco: 'BNB',
      cuenta: '9876-543-210',
      tipo: 'Cuenta Ahorros',
      beneficiario: 'COLEGIO BOLIVIA',
      nit: '123456789'
    }
  },
  finanzas: {
    whatsapp: '+51944042223',
    horario: 'Lunes a Viernes 8:00 - 16:00',
    responsable: 'Lic. Ana Mendoza'
  }
};

export default function InformacionEstudiante() {
  const navigate = useNavigate();

  // --- estado de filtros ---
  const [entidad, setEntidad] = useState(ENTIDADES[0]);
  const [nivel, setNivel] = useState('Primaria');
  const [anio, setAnio] = useState('2025');
  const [trimestre, setTrimestre] = useState('T1');
  const [pagosPlegado, setPagosPlegado] = useState(false);

  const gradosDisponibles = useMemo(() => GRADOS[nivel] || [], [nivel]);
  const seccionesDisponibles = useMemo(() => SECCIONES[nivel] || [], [nivel]);

  const [grado, setGrado] = useState(gradosDisponibles[2] || gradosDisponibles[0] || '');
  const [seccion, setSeccion] = useState(seccionesDisponibles[0] || '');

  React.useEffect(() => {
    const g = GRADOS[nivel] || [];
    const s = SECCIONES[nivel] || [];
    setGrado(g[0] || '');
    setSeccion(s[0] || '');
  }, [nivel]);

  const [alumno, setAlumno] = useState(ESTUDIANTE_BASE);

  // ==== ESTADO MEJORADO DE PAGOS ====
  const STORAGE_KEY = React.useMemo(
    () => `parent:pagos:${alumno.codigo}:${anio}`,
    [alumno.codigo, anio]
  );

  const initialState = {
    mesesPagados: 3, // Cambié a 3 para mostrar progreso
    comprobantes: Array(MESES_PENSION).fill(null).map((_, index) => ({
      mes: MESES_BO[index],
      estado: index < 3 ? 'verificado' : 'pendiente',
      comprobanteUrl: null,
      fechaPago: index < 3 ? new Date(2025, index + 1, 5).toISOString() : null,
      fechaVerificacion: index < 3 ? new Date(2025, index + 1, 6).toISOString() : null,
      codigoPago: `PAGO-${anio}-${index + 1}-${alumno.codigo}`
    }))
  };

  const readPagos = (key) => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : initialState;
    } catch {
      return initialState;
    }
  };

  const [pagos, setPagos] = useState(() => readPagos(STORAGE_KEY));
  const [qrActivo, setQrActivo] = useState(null);
  const [comprobanteSubiendo, setComprobanteSubiendo] = useState(null);
  const [whatsappEnviando, setWhatsappEnviando] = useState(null);

  // Persistir cambios
  React.useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pagos));
  }, [STORAGE_KEY, pagos]);

  // Calcular totales y progreso
  const mesesVerificados = pagos.comprobantes.filter(c => c.estado === 'verificado').length;
  const mesesSubidos = pagos.comprobantes.filter(c => c.estado === 'subido').length;
  const totalPagado = mesesVerificados * MONTO_PENSION_BS;
  const totalPendiente = (MESES_PENSION - mesesVerificados - mesesSubidos) * MONTO_PENSION_BS;
  const progresoPorcentaje = (mesesVerificados / MESES_PENSION) * 100;
  const siguienteMesPendiente = pagos.comprobantes.find(c => c.estado === 'pendiente');

  // ==== FUNCIONES DE PAGO MEJORADAS ====
  const generarQRPago = (mesIndex) => {
    const mes = MESES_BO[mesIndex];
    const comprobante = pagos.comprobantes[mesIndex];
    
    setQrActivo({
      mesIndex,
      mes,
      codigo: comprobante.codigoPago,
      monto: MONTO_PENSION_BS,
      datosBanco: COLEGIO_INFO.bancos.principal
    });
  };

  const cerrarQR = () => {
    setQrActivo(null);
  };

  const simularPago = (mesIndex) => {
    alert(`💰 Simulación de Pago\n\nPor favor realice la transferencia de ${MONTO_PENSION_BS} Bs para ${MESES_BO[mesIndex]} usando el QR.\n\nNo olvide guardar el comprobante bancario.`);
  };

  const handleSubirComprobante = async (mesIndex, event) => {
    const file = event.target.files[0];
    if (!file) return;

    setComprobanteSubiendo(mesIndex);

    // Simular upload
    await new Promise(resolve => setTimeout(resolve, 1500));

    const nuevoComprobante = {
      ...pagos.comprobantes[mesIndex],
      estado: 'subido',
      comprobanteUrl: URL.createObjectURL(file),
      fechaPago: new Date().toISOString()
    };

    const nuevosComprobantes = [...pagos.comprobantes];
    nuevosComprobantes[mesIndex] = nuevoComprobante;

    setPagos(prev => ({
      ...prev,
      comprobantes: nuevosComprobantes
    }));

    setComprobanteSubiendo(null);
    
    // Enviar automáticamente por WhatsApp
    await enviarWhatsappComprobante(mesIndex, file.name);
  };

  const enviarWhatsappComprobante = async (mesIndex, nombreArchivo) => {
    setWhatsappEnviando(mesIndex);
    
    const mes = MESES_BO[mesIndex];
    const comprobante = pagos.comprobantes[mesIndex];
    
    const mensaje = `✅ COMPROBANTE SUBIDO AL SISTEMA
    
📅 Mes: ${mes} 2025
👨‍🎓 Estudiante: ${alumno.nombres} ${alumno.apellidos}
🎓 Código: ${alumno.codigo}
💰 Monto: ${MONTO_PENSION_BS} Bs
🔢 Código de Pago: ${comprobante.codigoPago}
📎 Archivo: ${nombreArchivo}

El comprobante ha sido subido al sistema y está en verificación.`;

    // Simular envío por WhatsApp
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // En producción, aquí integrarías con la API de WhatsApp
    const urlWhatsapp = `https://wa.me/${COLEGIO_INFO.finanzas.whatsapp}?text=${encodeURIComponent(mensaje)}`;
    window.open(urlWhatsapp, '_blank');
    
    setWhatsappEnviando(null);
    alert('✅ Comprobante subido y mensaje preparado para WhatsApp. Será verificado por el área de finanzas.');
  };

  const enviarWhatsappManual = (mesIndex) => {
    const mes = MESES_BO[mesIndex];
    const comprobante = pagos.comprobantes[mesIndex];
    
    const mensaje = `📋 CONSULTA DE PAGO - ${mes} 2025

👨‍🎓 Estudiante: ${alumno.nombres} ${alumno.apellidos}
🎓 Código: ${alumno.codigo}
📅 Mes: ${mes}
💰 Monto: ${MONTO_PENSION_BS} Bs
🔢 Código: ${comprobante.codigoPago}

Tengo una consulta sobre el estado de mi pago.`;

    const urlWhatsapp = `https://wa.me/${COLEGIO_INFO.finanzas.whatsapp}?text=${encodeURIComponent(mensaje)}`;
    window.open(urlWhatsapp, '_blank');
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'verificado': return 'bg-green-100 text-green-800 border-green-200';
      case 'subido': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'observado': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getEstadoIcon = (estado) => {
    switch (estado) {
      case 'verificado': return <CheckCircle className="h-4 w-4" />;
      case 'subido': return <Clock className="h-4 w-4" />;
      case 'observado': return <AlertCircle className="h-4 w-4" />;
      default: return <CreditCard className="h-4 w-4" />;
    }
  };

  // Funciones existentes...
  const filtrar = () => setAlumno((prev) => ({ ...prev }));

  const exportarPDF = () => {
    alert(`Exportando PDF de Información del Estudiante — ${alumno.apellidos}, ${alumno.nombres}`);
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

  return (
    <div className="space-y-6">
      {/* Sección de Filtros */}
      <Card className="bg-white p-4 rounded-lg shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 items-end">
          {/* ... mismos filtros que antes ... */}
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Entidad</p>
            <Select value={entidad} onValueChange={setEntidad}>
              <SelectTrigger><SelectValue placeholder="Selecciona entidad" /></SelectTrigger>
              <SelectContent>{ENTIDADES.map((e) => <SelectItem key={e} value={e}>{e}</SelectItem>)}</SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Nivel</p>
            <Select value={nivel} onValueChange={setNivel}>
              <SelectTrigger><SelectValue placeholder="Selecciona nivel" /></SelectTrigger>
              <SelectContent>{NIVELES.map((n) => <SelectItem key={n} value={n}>{n}</SelectItem>)}</SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Grado</p>
            <Select value={grado} onValueChange={setGrado}>
              <SelectTrigger><SelectValue placeholder="Selecciona grado" /></SelectTrigger>
              <SelectContent>{gradosDisponibles.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Sección</p>
            <Select value={seccion} onValueChange={setSeccion}>
              <SelectTrigger><SelectValue placeholder="Selecciona sección" /></SelectTrigger>
              <SelectContent>{seccionesDisponibles.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Año</p>
            <Select value={anio} onValueChange={setAnio}>
              <SelectTrigger><SelectValue placeholder="Selecciona año" /></SelectTrigger>
              <SelectContent>{ANIOS.map((y) => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Trimestre</p>
            <Select value={trimestre} onValueChange={setTrimestre}>
              <SelectTrigger><SelectValue placeholder="Selecciona trimestre" /></SelectTrigger>
              <SelectContent>{TRIMESTRES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Button variant="academicYellow" onClick={filtrar}>
            <Filter className="h-4 w-4 mr-2" /> FILTRAR
          </Button>
          <Button variant="outline" onClick={exportarPDF}><Download className="h-4 w-4 mr-2" />Exportar PDF</Button>
          <Button variant="outline" onClick={exportarCSV}><Download className="h-4 w-4 mr-2" />Exportar CSV</Button>
          <Button variant="outline" onClick={imprimir}><Printer className="h-4 w-4 mr-2" />Imprimir</Button>
          <div className="ml-auto flex gap-2">
            <Button variant="secondary" onClick={verFichaAcademica}><FileText className="h-4 w-4 mr-2" />Ver ficha académica</Button>
            <Button variant="secondary" onClick={contactar}><Mail className="h-4 w-4 mr-2" />Contactar</Button>
          </div>
        </div>
      </Card>

      {/* Información del Estudiante */}
      <Card>
        <CardHeader><CardTitle>Información del Estudiante</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <img src={alumno.foto} alt="Foto del Alumno" className="w-24 h-24 rounded-full border-2 border-primary object-cover" />
                <div>
                  <div className="flex items-center text-sm text-muted-foreground"><User className="h-4 w-4 mr-2" /><p className="font-semibold text-foreground">Alumno:</p><p className="ml-2">{alumno.nombres} {alumno.apellidos}</p></div>
                  <div className="flex items-center text-sm text-muted-foreground mt-1"><GraduationCap className="h-4 w-4 mr-2" /><p className="font-semibold text-foreground">Nivel / Grado / Sección:</p><p className="ml-2">{nivel} — {grado} {seccion}</p></div>
                  <div className="flex items-center text-sm text-muted-foreground mt-1"><FileText className="h-4 w-4 mr-2" /><p className="font-semibold text-foreground">Código:</p><p className="ml-2">{alumno.codigo}</p></div>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center text-sm text-muted-foreground"><Phone className="h-4 w-4 mr-2" /><p className="font-semibold text-foreground">Teléfono:</p><p className="ml-2">{alumno.telefono}</p></div>
              <div className="flex items-center text-sm text-muted-foreground"><User className="h-4 w-4 mr-2" /><p className="font-semibold text-foreground">Responsable:</p><p className="ml-2">{alumno.responsable}</p></div>
              <div className="flex items-center text-sm text-muted-foreground"><FileText className="h-4 w-4 mr-2" /><p className="font-semibold text-foreground">DNI R.F.:</p><p className="ml-2">{alumno.dniResponsable}</p></div>
              <div className="flex items-center text-sm text-muted-foreground"><AtSign className="h-4 w-4 mr-2" /><p className="font-semibold text-foreground">Correo:</p><p className="ml-2">{alumno.correo}</p></div>
              <div className="pt-2 text-xs text-muted-foreground">
                <p>Entidad: <span className="font-semibold text-foreground">{entidad}</span></p>
                <p>Año / Trimestre: <span className="font-semibold text-foreground">{anio} {trimestre}</span></p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* === SISTEMA DE PAGOS MEJORADO === */}
      <Card>
        <CardHeader className="cursor-pointer" onClick={() => setPagosPlegado(!pagosPlegado)}>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-6 w-6 text-blue-600" />
              <div>
                <div className="flex items-center gap-2">
                  <span>Sistema de Pagos de Mensualidades {anio}</span>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    {mesesVerificados}/{MESES_PENSION} meses
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground font-normal mt-1">
                  Gestione sus pagos mensuales con QR y seguimiento en tiempo real
                </p>
              </div>
            </div>
            <Button variant="ghost" size="sm">
              {pagosPlegado ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </Button>
          </CardTitle>
        </CardHeader>

        {!pagosPlegado && (
          <CardContent className="space-y-6">
            {/* Gráfico de Progreso */}
            <div className="bg-gradient-to-r from-blue-50 to-green-50 p-6 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                    Progreso de Pagos {anio}
                  </h3>
                  <p className="text-sm text-muted-foreground">Avance de sus mensualidades pagadas</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">{progresoPorcentaje.toFixed(0)}%</div>
                  <div className="text-sm text-muted-foreground">{mesesVerificados} de {MESES_PENSION} meses</div>
                </div>
              </div>
              
              <Progress value={progresoPorcentaje} className="h-3 mb-4" />
              
              <div className="grid grid-cols-5 gap-2 text-xs">
                {MESES_BO.map((mes, index) => (
                  <div key={mes} className={`text-center p-2 rounded ${
                    index < mesesVerificados 
                      ? 'bg-green-100 text-green-800 border border-green-300' 
                      : index < mesesVerificados + mesesSubidos
                      ? 'bg-blue-100 text-blue-800 border border-blue-300'
                      : 'bg-gray-100 text-gray-600 border border-gray-300'
                  }`}>
                    <div className="font-medium">{mes.substring(0, 3)}</div>
                    <div className={`w-3 h-3 rounded-full mx-auto mt-1 ${
                      index < mesesVerificados 
                        ? 'bg-green-500' 
                        : index < mesesVerificados + mesesSubidos
                        ? 'bg-blue-500'
                        : 'bg-gray-400'
                    }`} />
                  </div>
                ))}
              </div>
            </div>

            {/* Resumen Financiero */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <p className="text-sm font-medium text-green-600">Pagado y Verificado</p>
                </div>
                <p className="text-2xl font-bold text-green-700">{totalPagado.toLocaleString('es-BO')} Bs</p>
                <p className="text-xs text-green-600">{mesesVerificados} meses confirmados</p>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <p className="text-sm font-medium text-blue-600">En Verificación</p>
                </div>
                <p className="text-2xl font-bold text-blue-700">
                  {(mesesSubidos * MONTO_PENSION_BS).toLocaleString('es-BO')} Bs
                </p>
                <p className="text-xs text-blue-600">{mesesSubidos} comprobantes en revisión</p>
              </div>
              
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                <div className="flex items-center gap-2 mb-2">
                  <CreditCard className="h-5 w-5 text-orange-600" />
                  <p className="text-sm font-medium text-orange-600">Por Pagar</p>
                </div>
                <p className="text-2xl font-bold text-orange-700">{totalPendiente.toLocaleString('es-BO')} Bs</p>
                <p className="text-xs text-orange-600">{MESES_PENSION - mesesVerificados - mesesSubidos} meses pendientes</p>
              </div>
            </div>

            {/* Lista de Meses con WhatsApp */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-green-600" />
                Gestión de Pagos por Mes
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  WhatsApp Integrado
                </Badge>
              </h3>
              
              {pagos.comprobantes.map((comprobante, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:shadow-sm transition-shadow">
                  <div className="flex items-center gap-4 flex-1">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      comprobante.estado === 'verificado' ? 'bg-green-100 text-green-600' :
                      comprobante.estado === 'subido' ? 'bg-blue-100 text-blue-600' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      <span className="text-sm font-bold">{index + 1}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{comprobante.mes}</p>
                        <Badge variant="outline" className={getEstadoColor(comprobante.estado)}>
                          <span className="flex items-center gap-1">
                            {getEstadoIcon(comprobante.estado)}
                            {comprobante.estado.charAt(0).toUpperCase() + comprobante.estado.slice(1)}
                          </span>
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {MONTO_PENSION_BS} Bs • Vence 10/{String(index + 2).padStart(2, '0')} • {comprobante.codigoPago}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Botón de WhatsApp para consultas */}
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => enviarWhatsappManual(index)}
                      className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                    >
                      <MessageCircle className="h-4 w-4 mr-1" />
                      Consultar
                    </Button>

                    {comprobante.estado === 'pendiente' && (
                      <>
                        <Button onClick={() => generarQRPago(index)} size="sm">
                          <QrCode className="h-4 w-4 mr-1" />
                          Pagar con QR
                        </Button>
                        
                        <div className="relative">
                          <input
                            type="file"
                            accept="image/*,.pdf"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            onChange={(e) => handleSubirComprobante(index, e)}
                            disabled={comprobanteSubiendo === index}
                          />
                          <Button variant="outline" size="sm" disabled={comprobanteSubiendo === index}>
                            {comprobanteSubiendo === index ? (
                              <>
                                <Clock className="h-4 w-4 mr-1 animate-spin" />
                                Subiendo...
                              </>
                            ) : (
                              <>
                                <Camera className="h-4 w-4 mr-1" />
                                Subir
                              </>
                            )}
                          </Button>
                        </div>
                      </>
                    )}

                    {comprobante.estado === 'subido' && (
                      <Button variant="outline" size="sm" disabled>
                        {whatsappEnviando === index ? (
                          <>
                            <Send className="h-4 w-4 mr-1 animate-pulse" />
                            Enviando...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Enviado a Finanzas
                          </>
                        )}
                      </Button>
                    )}

                    {comprobante.estado === 'verificado' && (
                      <Button variant="outline" size="sm" disabled className="bg-green-50 text-green-700 border-green-200">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Verificado
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Información Bancaria y Contacto */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Información Bancaria
                </h4>
                <div className="space-y-2 text-sm">
                  <p><strong>Banco:</strong> {COLEGIO_INFO.bancos.principal.banco}</p>
                  <p><strong>Cuenta:</strong> {COLEGIO_INFO.bancos.principal.cuenta}</p>
                  <p><strong>Beneficiario:</strong> {COLEGIO_INFO.bancos.principal.beneficiario}</p>
                  <p><strong>NIT:</strong> {COLEGIO_INFO.bancos.principal.nit}</p>
                  <p><strong>Tipo:</strong> {COLEGIO_INFO.bancos.principal.tipo}</p>
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Soporte por WhatsApp
                </h4>
                <div className="space-y-2 text-sm">
                  <p><strong>Responsable:</strong> {COLEGIO_INFO.finanzas.responsable}</p>
                  <p><strong>WhatsApp:</strong> {COLEGIO_INFO.finanzas.whatsapp}</p>
                  <p><strong>Horario:</strong> {COLEGIO_INFO.finanzas.horario}</p>
                  <p><strong>Para:</strong> Consultas y verificación de pagos</p>
                </div>
                <Button 
                  className="w-full mt-3 bg-green-600 hover:bg-green-700"
                  onClick={() => window.open(`https://wa.me/${COLEGIO_INFO.finanzas.whatsapp}`, '_blank')}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Contactar por WhatsApp
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Modal de QR */}
      {qrActivo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">QR de Pago - {qrActivo.mes}</h3>
              <Button variant="ghost" onClick={cerrarQR} size="sm">×</Button>
            </div>
            
            <div className="text-center space-y-4">
              <div className="bg-gray-100 p-8 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <QrCode className="h-32 w-32 mx-auto text-gray-400" />
                  <p className="text-sm text-muted-foreground mt-2">[QR generado dinámicamente]</p>
                </div>
              </div>

              <div className="text-sm space-y-2 bg-blue-50 p-3 rounded">
                <p><strong>Banco:</strong> {qrActivo.datosBanco.banco}</p>
                <p><strong>Cuenta:</strong> {qrActivo.datosBanco.cuenta}</p>
                <p><strong>Beneficiario:</strong> {qrActivo.datosBanco.beneficiario}</p>
                <p><strong>Concepto:</strong> Mensualidad {qrActivo.mes} - {alumno.nombres} {alumno.apellidos}</p>
                <p><strong>Monto:</strong> <span className="font-bold text-green-600">{qrActivo.monto} Bs</span></p>
                <p><strong>Código:</strong> <code className="bg-gray-100 px-1 rounded">{qrActivo.codigo}</code></p>
              </div>

              <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
                <p className="text-sm text-yellow-800 font-medium">
                  ⚠️ Después de pagar, suba el comprobante al sistema
                </p>
              </div>

              <div className="flex gap-2">
                <Button onClick={() => simularPago(qrActivo.mesIndex)} className="flex-1">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Simular Pago Realizado
                </Button>
                <Button variant="outline" onClick={cerrarQR}>
                  Cerrar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}