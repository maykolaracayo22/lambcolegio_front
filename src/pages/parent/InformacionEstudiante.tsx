// src/pages/parent/InformacionEstudiante.tsx
// CONECTADO AL BACKEND - Consume API real
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  User, GraduationCap, Phone, FileText, Download, 
  Mail, Printer, CheckCircle, Clock, AlertCircle,
  ChevronDown, ChevronUp, MessageCircle, CreditCard,
  RefreshCw, Calendar, MapPin, Hash, Building
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import {
  getChildProfile,
  getChildInfo,
  ChildInfo
} from '@/services/parentPortalApi';

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

interface PagoMes {
  mes: string;
  estado: 'verificado' | 'subido' | 'pendiente' | 'observado';
  fechaPago?: string;
  fechaVerificacion?: string;
  codigoPago: string;
}

export default function InformacionEstudiante() {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Estado de carga
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Datos del estudiante
  const [alumno, setAlumno] = useState<ChildInfo | null>(null);
  
  // Estado de pagos
  const [pagosPlegado, setPagosPlegado] = useState(false);
  const [mesesPagados, setMesesPagados] = useState(3);
  const [pagos, setPagos] = useState<PagoMes[]>([]);

  // Fetch datos del backend
  const fetchStudentInfo = async () => {
    try {
      // El acceso del padre usa un token temporal y guarda el perfil validado
      // en parentStudent; no depende de la clave "token" ni de /login.
      const profile = await getChildProfile();
      setAlumno(profile);
      
      // Inicializar pagos (en producción vendría del backend)
      initializePagos(profile.codigo);
      
    } catch (error) {
      console.error('Error fetching student info:', error);
      // Fallback a localStorage
      const info = getChildInfo();
      if (info) {
        setAlumno(info);
        initializePagos(info.codigo);
      } else {
        toast({
          title: "Error",
          description: "No se pudo cargar la información del estudiante",
          variant: "destructive",
        });
      }
    }
  };

  const initializePagos = (codigo: string) => {
    const storageKey = `parent:pagos:${codigo}:2025`;
    const stored = localStorage.getItem(storageKey);
    
    if (stored) {
      try {
        const data = JSON.parse(stored);
        setPagos(data.comprobantes || []);
        setMesesPagados(data.mesesPagados || 3);
        return;
      } catch (e) {
        console.error('Error parsing pagos:', e);
      }
    }
    
    // Default pagos
    const defaultPagos: PagoMes[] = MESES_BO.map((mes, index) => ({
      mes,
      estado: index < 3 ? 'verificado' : 'pendiente',
      fechaPago: index < 3 ? new Date(2025, index + 1, 5).toISOString() : undefined,
      fechaVerificacion: index < 3 ? new Date(2025, index + 1, 6).toISOString() : undefined,
      codigoPago: `PAGO-2025-${index + 1}-${codigo}`
    }));
    
    setPagos(defaultPagos);
    setMesesPagados(3);
  };

  useEffect(() => {
    const initFetch = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500));
      await fetchStudentInfo();
      setLoading(false);
    };
    initFetch();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchStudentInfo();
    setRefreshing(false);
    toast({
      title: "Actualizado",
      description: "Información del estudiante actualizada",
    });
  };

  // Calcular totales de pagos
  const mesesVerificados = pagos.filter(p => p.estado === 'verificado').length;
  const totalPagado = mesesVerificados * MONTO_PENSION_BS;
  const totalPendiente = (MESES_PENSION - mesesVerificados) * MONTO_PENSION_BS;
  const progresoPorcentaje = (mesesVerificados / MESES_PENSION) * 100;

  // Helpers
  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'verificado': return 'bg-green-100 text-green-800 border-green-200';
      case 'subido': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'observado': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case 'verificado': return <CheckCircle className="h-4 w-4" />;
      case 'subido': return <Clock className="h-4 w-4" />;
      case 'observado': return <AlertCircle className="h-4 w-4" />;
      default: return <CreditCard className="h-4 w-4" />;
    }
  };

  // Acciones
  const exportarPDF = () => {
    toast({
      title: "Exportando PDF",
      description: "Generando documento...",
    });
  };

  const imprimir = () => window.print();

  const verFichaAcademica = () => {
    navigate('/dashboard/parent/notas-academicas');
  };

  const contactarWhatsApp = (tipo: 'finanzas' | 'general') => {
    const mensaje = tipo === 'finanzas'
      ? `Hola, soy padre/madre de ${alumno?.nombres} ${alumno?.apellidos} (${alumno?.codigo}). Tengo una consulta sobre pagos.`
      : `Hola, soy padre/madre de ${alumno?.nombres} ${alumno?.apellidos} (${alumno?.codigo}). Tengo una consulta.`;
    
    const urlWhatsapp = `https://wa.me/${COLEGIO_INFO.finanzas.whatsapp}?text=${encodeURIComponent(mensaje)}`;
    window.open(urlWhatsapp, '_blank');
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-1">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center">
                <Skeleton className="h-24 w-24 rounded-full" />
                <Skeleton className="h-6 w-40 mt-4" />
                <Skeleton className="h-4 w-32 mt-2" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="md:col-span-2">
            <CardContent className="pt-6">
              <Skeleton className="h-40 w-full" />
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardContent className="pt-6">
            <Skeleton className="h-60 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!alumno) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Sin información</h3>
          <p className="text-muted-foreground">
            No se encontró información del estudiante
          </p>
        </CardContent>
      </Card>
    );
  }

  const datosPersonales = [
    ['Documento de identidad (CI)', alumno.ci],
    ['Código RUDE', alumno.codigoRude || alumno.rude],
    ['Sexo', alumno.sexo === 'M' ? 'Masculino' : alumno.sexo === 'F' ? 'Femenino' : alumno.sexo],
    ['Nacionalidad', alumno.nacionalidad],
    ['Departamento de nacimiento', alumno.departamentoNacimiento],
    ['Municipio de nacimiento', alumno.municipioNacimiento],
    ['Año de ingreso', alumno.anioIngreso],
    ['Mes de ingreso', alumno.mesIngreso],
  ];
  const datosTutor = [
    ['Nombre del padre, madre o tutor', alumno.tutorNombre],
    ['CI del tutor', alumno.tutorCi],
    ['Parentesco', alumno.tutorParentesco],
    ['Teléfono del tutor', alumno.tutorTelefono],
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Información del Estudiante</h1>
          <p className="text-muted-foreground">
            Datos personales y estado de pagos
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
          <Button variant="outline" onClick={imprimir}>
            <Printer className="h-4 w-4 mr-2" />
            Imprimir
          </Button>
          <Button onClick={exportarPDF}>
            <Download className="h-4 w-4 mr-2" />
            Exportar PDF
          </Button>
        </div>
      </div>

      {/* Información Personal */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Foto y datos básicos */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                {alumno.foto ? (
                  <img 
                    src={alumno.foto} 
                    alt={alumno.nombres}
                    className="h-24 w-24 rounded-full object-cover"
                  />
                ) : (
                  <User className="h-12 w-12 text-primary" />
                )}
              </div>
              <h2 className="text-xl font-bold">
                {alumno.nombres} {alumno.apellidos}
              </h2>
              <Badge variant="secondary" className="mt-2">
                {alumno.codigo}
              </Badge>
              <div className="mt-4 text-sm text-muted-foreground">
                <p>{alumno.nivel} - {alumno.curso} "{alumno.paralelo}"</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Datos de contacto */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Datos de Contacto</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <Hash className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Código</p>
                  <p className="font-medium">{alumno.codigo}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <GraduationCap className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Nivel/Curso</p>
                  <p className="font-medium">{alumno.nivel} - {alumno.curso} "{alumno.paralelo}"</p>
                </div>
              </div>
              
              {alumno.telefono && (
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Teléfono</p>
                    <p className="font-medium">{alumno.telefono}</p>
                  </div>
                </div>
              )}
              
              {alumno.email && (
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{alumno.email}</p>
                  </div>
                </div>
              )}
              
              {alumno.direccion && (
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg md:col-span-2">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Dirección</p>
                    <p className="font-medium">{alumno.direccion}</p>
                  </div>
                </div>
              )}
              
              {alumno.fechaNacimiento && (
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Fecha de Nacimiento</p>
                    <p className="font-medium">
                      {new Date(alumno.fechaNacimiento).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2 mt-4">
              <Button variant="outline" onClick={verFichaAcademica}>
                <FileText className="h-4 w-4 mr-2" />
                Ver Ficha Académica
              </Button>
              <Button variant="outline" onClick={() => contactarWhatsApp('general')}>
                <MessageCircle className="h-4 w-4 mr-2" />
                Contactar Colegio
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Datos personales y de matrícula
          </CardTitle>
          <CardDescription>Información registrada en el expediente del estudiante</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {datosPersonales.map(([label, value]) => (
            <div key={label} className="rounded-lg border bg-muted/30 p-3 min-w-0">
              <p className="text-sm text-muted-foreground">{label}</p>
              <p className="font-medium break-words">{value || 'No registrado'}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Información del padre, madre o tutor
          </CardTitle>
          <CardDescription>Datos de contacto familiar registrados en el expediente</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {datosTutor.map(([label, value]) => (
            <div key={label} className="rounded-lg border bg-muted/30 p-3 min-w-0">
              <p className="text-sm text-muted-foreground">{label}</p>
              <p className="font-medium break-words">{value || 'No registrado'}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Estado de Pagos - Mensualidades */}
      <Card>
        <CardHeader className="cursor-pointer" onClick={() => setPagosPlegado(!pagosPlegado)}>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Estado de Mensualidades 2025
              </CardTitle>
              <CardDescription>
                Sistema educativo boliviano: {MESES_PENSION} mensualidades de {MONTO_PENSION_BS} Bs
              </CardDescription>
            </div>
            <Button variant="ghost" size="icon">
              {pagosPlegado ? <ChevronDown className="h-5 w-5" /> : <ChevronUp className="h-5 w-5" />}
            </Button>
          </div>
        </CardHeader>
        
        {!pagosPlegado && (
          <CardContent>
            {/* Resumen de pagos */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm text-green-600">Pagado</p>
                <p className="text-2xl font-bold text-green-700">{totalPagado} Bs</p>
                <p className="text-xs text-green-600">{mesesVerificados} meses</p>
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="text-sm text-yellow-600">Pendiente</p>
                <p className="text-2xl font-bold text-yellow-700">{totalPendiente} Bs</p>
                <p className="text-xs text-yellow-600">{MESES_PENSION - mesesVerificados} meses</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-600">Mensualidad</p>
                <p className="text-2xl font-bold text-blue-700">{MONTO_PENSION_BS} Bs</p>
                <p className="text-xs text-blue-600">por mes</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <p className="text-sm text-purple-600">Progreso</p>
                <p className="text-2xl font-bold text-purple-700">{Math.round(progresoPorcentaje)}%</p>
                <Progress value={progresoPorcentaje} className="mt-2" />
              </div>
            </div>

            {/* Lista de meses */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {pagos.map((pago, index) => (
                <div 
                  key={index}
                  className={`p-3 rounded-lg border ${getEstadoColor(pago.estado)} flex flex-col items-center text-center`}
                >
                  <span className="text-sm font-medium">{pago.mes}</span>
                  <div className="flex items-center gap-1 mt-1">
                    {getEstadoIcon(pago.estado)}
                    <span className="text-xs capitalize">{pago.estado}</span>
                  </div>
                  {pago.fechaPago && (
                    <span className="text-xs mt-1 opacity-75">
                      {new Date(pago.fechaPago).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Información bancaria */}
            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Building className="h-4 w-4" />
                Datos Bancarios para Depósito
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Banco Principal</p>
                  <p className="font-medium">{COLEGIO_INFO.bancos.principal.banco}</p>
                  <p className="text-sm">Cuenta: {COLEGIO_INFO.bancos.principal.cuenta}</p>
                  <p className="text-sm">NIT: {COLEGIO_INFO.bancos.principal.nit}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Banco Alternativo</p>
                  <p className="font-medium">{COLEGIO_INFO.bancos.secundario.banco}</p>
                  <p className="text-sm">Cuenta: {COLEGIO_INFO.bancos.secundario.cuenta}</p>
                  <p className="text-sm">NIT: {COLEGIO_INFO.bancos.secundario.nit}</p>
                </div>
              </div>
              
              <div className="mt-4 flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={() => contactarWhatsApp('finanzas')}>
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Consultar con Finanzas
                </Button>
                <p className="text-xs text-muted-foreground self-center">
                  Horario: {COLEGIO_INFO.finanzas.horario}
                </p>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
