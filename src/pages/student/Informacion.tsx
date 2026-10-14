// src/pages/student/Informacion.tsx
// CONECTADO AL BACKEND - Consume API real
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { 
  User, GraduationCap, Phone, AtSign, FileText, Download, 
  Mail, Printer, RefreshCw, Calendar, MapPin 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getMyProfile, StudentProfile } from '@/services/studentPortalApi';

// Config mensualidad (Bolivia)
const MESES_PENSION = 10;        // Feb–Nov
const MONTO_PENSION_BS = 400;    // fijo

export default function InformacionEstudiante() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [profile, setProfile] = useState<StudentProfile | null>(null);

  // Cargar perfil desde el backend
  const fetchProfile = async (showToast = false) => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      if (showToast) setRefreshing(true);
      
      const data = await getMyProfile();
      setProfile(data);

      if (showToast) {
        toast({
          title: "Información actualizada",
          description: "Se ha cargado la información más reciente",
        });
      }
    } catch (error) {
      console.error('Error cargando perfil:', error);
      if (showToast) {
        toast({
          title: "Error",
          description: "No se pudo cargar la información del estudiante",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      fetchProfile();
    } else {
      const timer = setTimeout(() => fetchProfile(), 500);
      return () => clearTimeout(timer);
    }
  }, []);

  // ================================
  // MENSUALIDAD — vista mínima
  // ================================
  const anio = new Date().getFullYear().toString();
  const STORAGE_KEY = useMemo(
    () => `student:pagos:${profile?.codigo || 'unknown'}:${anio}:mesesPagados`,
    [profile?.codigo, anio]
  );

  const readMeses = (key: string) => {
    const raw = localStorage.getItem(key);
    const n = Number(raw);
    return Number.isFinite(n) ? Math.min(Math.max(n, 0), MESES_PENSION) : 0;
  };

  const [mesesPagados, setMesesPagados] = useState(() => readMeses(STORAGE_KEY));

  useEffect(() => {
    if (profile?.codigo) {
      setMesesPagados(readMeses(STORAGE_KEY));
    }
  }, [STORAGE_KEY, profile?.codigo]);

  useEffect(() => {
    if (profile?.codigo) {
      localStorage.setItem(STORAGE_KEY, String(mesesPagados));
    }
  }, [STORAGE_KEY, mesesPagados, profile?.codigo]);

  const adeudados = MESES_PENSION - mesesPagados;
  const totalDebe = adeudados * MONTO_PENSION_BS;

  const marcarUnPago = () => setMesesPagados((n) => (n < MESES_PENSION ? n + 1 : n));
  const deshacerUnPago = () => setMesesPagados((n) => (n > 0 ? n - 1 : n));

  // --- acciones ---
  const exportarPDF = () => {
    if (!profile) return;
    alert(`Exportando PDF de Información del Estudiante — ${profile.apellidos}, ${profile.nombres}`);
  };

  const exportarCSV = () => {
    if (!profile) return;
    const header = ['Alumno', 'Código', 'Nivel', 'Curso', 'Paralelo', 'Teléfono', 'Correo'];
    const row = [
      `${profile.apellidos}, ${profile.nombres}`,
      profile.codigo,
      profile.nivel,
      profile.curso,
      profile.paralelo,
      profile.telefono,
      profile.email,
    ];
    const csv = header.join(',') + '\n' + row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `info_estudiante_${profile.codigo}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const imprimir = () => window.print();

  const verFichaAcademica = () => {
    navigate('/dashboard/student/notas');
  };

  const contactar = () => {
    if (!profile) return;
    window.location.href = `mailto:support@colegio.edu?subject=Consulta%20de%20${encodeURIComponent(profile.nombres)}%20${encodeURIComponent(profile.apellidos)}`;
  };

  if (loading) {
    return (
      <div className="space-y-6 p-4">
        <div className="flex justify-between items-center">
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-6">
              <Skeleton className="h-24 w-24 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map(i => (
                <Skeleton key={i} className="h-6 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="space-y-6 p-4">
        <Card>
          <CardContent className="p-12 text-center">
            <User className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">Sin información</h3>
            <p className="text-muted-foreground">
              No se pudo cargar la información del estudiante.
            </p>
            <Button onClick={() => fetchProfile(true)} className="mt-4">
              Reintentar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Mi Información</h1>
          <p className="text-muted-foreground">
            Consulta tu información personal y académica.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline"
            onClick={() => fetchProfile(true)}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Actualizar
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
        </div>
      </div>

      {/* Sección de Información del Estudiante */}
      <Card>
        <CardHeader>
          <CardTitle>Información Personal</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
            {/* Columna Izquierda */}
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-24 h-24 rounded-full border-2 border-primary bg-primary/10 flex items-center justify-center">
                  <User className="h-12 w-12 text-primary" />
                </div>
                <div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <User className="h-4 w-4 mr-2" />
                    <p className="font-semibold text-foreground">Alumno:</p>
                    <p className="ml-2">{profile.nombres} {profile.apellidos}</p>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground mt-1">
                    <GraduationCap className="h-4 w-4 mr-2" />
                    <p className="font-semibold text-foreground">Nivel / Grado / Sección:</p>
                    <p className="ml-2">{profile.nivel} — {profile.curso} {profile.paralelo}</p>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground mt-1">
                    <FileText className="h-4 w-4 mr-2" />
                    <p className="font-semibold text-foreground">Código:</p>
                    <p className="ml-2">{profile.codigo}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Columna Derecha */}
            <div className="space-y-3">
              <div className="flex items-center text-sm text-muted-foreground">
                <Phone className="h-4 w-4 mr-2" />
                <p className="font-semibold text-foreground">Teléfono:</p>
                <p className="ml-2">{profile.telefono || 'No registrado'}</p>
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <AtSign className="h-4 w-4 mr-2" />
                <p className="font-semibold text-foreground">Correo:</p>
                <p className="ml-2">{profile.email || 'No registrado'}</p>
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 mr-2" />
                <p className="font-semibold text-foreground">Dirección:</p>
                <p className="ml-2">{profile.direccion || 'No registrado'}</p>
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="h-4 w-4 mr-2" />
                <p className="font-semibold text-foreground">Fecha Nacimiento:</p>
                <p className="ml-2">{profile.fecha_nac || 'No registrado'}</p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex gap-2">
            <Button variant="secondary" onClick={verFichaAcademica}>
              <FileText className="h-4 w-4 mr-2" />
              Ver ficha académica
            </Button>
            <Button variant="secondary" onClick={contactar}>
              <Mail className="h-4 w-4 mr-2" />
              Contactar soporte
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* === MENSUALIDAD (Bolivia) — Vista mínima === */}
      <Card>
        <CardHeader>
          <CardTitle>Mensualidad {anio}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-sm text-muted-foreground">Total adeudado</p>
            <div className="text-3xl font-extrabold">
              {totalDebe.toLocaleString('es-BO')} Bs
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            Pagados: <span className="font-semibold">{mesesPagados}</span> / {MESES_PENSION} ·{' '}
            Pendientes: <span className="font-semibold">{adeudados}</span> ·{' '}
            Monto por mes: <span className="font-semibold">{MONTO_PENSION_BS} Bs</span>
          </p>

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
