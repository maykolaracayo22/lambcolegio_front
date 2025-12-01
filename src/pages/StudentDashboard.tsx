/**
 * @file StudentDashboard.tsx
 * @description Panel principal para estudiantes que proporciona acceso a todas las
 * funcionalidades académicas incluyendo materias, tareas, notas y progreso.
 */

import { useNavigate, Outlet, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  BookOpen,
  ClipboardList,
  FileText,
  CalendarCheck,
  Clock,
  TrendingUp,
  Download,
  Bell,
  Award,
  BrainCircuit,
  Target,
  GraduationCap,
  UserCircle,
  History
} from "lucide-react";

// Tipos e interfaces
interface StudentStats {
  promedio: number;
  tareasPendientes: number;
  proximasEvaluaciones: number;
  asistencia: number;
  logros: number;
  // Campos específicos para sistema boliviano
  promediosBimestrales: {
    bimestre: number;
    promedio: number;
    estado: 'aprobado' | 'reprobado' | 'pendiente';
  }[];
  areasDesempenio: {
    cosmos: number;
    vida: number;
    ciencia: number;
    comunidad: number;
  };
  actividadesComplementarias: {
    nombre: string;
    fecha: string;
    tipo: 'feria' | 'olimpiada' | 'evento';
  }[];
}

interface MenuItem {
  path: string;
  icon: React.ElementType;
  label: string;
  description?: string;
  badge?: {
    count: number;
    variant: 'default' | 'destructive' | 'secondary';
  };
}

const StudentDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Estado para estadísticas del estudiante
  const [stats, setStats] = useState<StudentStats>({
    promedio: 85,
    tareasPendientes: 3,
    proximasEvaluaciones: 2,
    asistencia: 95,
    logros: 8,
    promediosBimestrales: [
      { bimestre: 1, promedio: 87, estado: 'aprobado' },
      { bimestre: 2, promedio: 85, estado: 'aprobado' },
      { bimestre: 3, promedio: 0, estado: 'pendiente' },
      { bimestre: 4, promedio: 0, estado: 'pendiente' }
    ],
    areasDesempenio: {
      cosmos: 88,
      vida: 85,
      ciencia: 83,
      comunidad: 89
    },
    actividadesComplementarias: [
      { nombre: 'Feria Científica', fecha: '2025-11-15', tipo: 'feria' },
      { nombre: 'Olimpiada de Matemáticas', fecha: '2025-11-20', tipo: 'olimpiada' },
      { nombre: 'Festival Cultural', fecha: '2025-12-05', tipo: 'evento' }
    ]
  });

  // Menú items con badges y descripciones
  const menuItems: MenuItem[] = [
    {
      path: "/dashboard/student/informacion",
      icon: UserCircle,
      label: "Mi Información",
      description: "Perfil y datos personales"
    },
    {
      path: "/dashboard/student/materias",
      icon: BookOpen,
      label: "Mis Materias",
      description: "Lista de cursos y contenido"
    },
    {
      path: "/dashboard/student/tareas",
      icon: ClipboardList,
      label: "Mis Tareas",
      description: "Tareas pendientes y completadas",
      badge: {
        count: stats.tareasPendientes,
        variant: stats.tareasPendientes > 0 ? 'destructive' : 'default'
      }
    },
    {
      path: "/dashboard/student/notas",
      icon: FileText,
      label: "Mis Notas",
      description: "Calificaciones y evaluaciones",
      badge: {
        count: stats.proximasEvaluaciones,
        variant: 'secondary'
      }
    },
    {
      path: "/dashboard/student/asistencia",
      icon: CalendarCheck,
      label: "Mi Asistencia",
      description: "Registro de asistencia",
      badge: {
        count: stats.asistencia,
        variant: 'default'
      }
    },
    {
      path: "/dashboard/student/horario",
      icon: Clock,
      label: "Mi Horario",
      description: "Horario de clases"
    },
    {
      path: "/dashboard/student/progreso",
      icon: TrendingUp,
      label: "Mi Progreso",
      description: "Seguimiento académico"
    },
    {
      path: "/dashboard/student/logros",
      icon: Award,
      label: "Mis Logros",
      description: "Logros y reconocimientos",
      badge: {
        count: stats.logros,
        variant: 'secondary'
      }
    }
  ];

  // 🔹 Sidebar personalizado para estudiantes
  const sidebarContent = (
    <div className="space-y-4">
      {/* Perfil rápido */}
      <Card className="bg-primary/5 border-none">
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-medium">5to Secundaria</h3>
              <p className="text-xs text-muted-foreground">2do Bimestre 2025</p>
            </div>
          </div>
          <Progress value={75} className="h-2" />
          <p className="text-xs text-muted-foreground mt-2">75% del bimestre completado</p>
        </CardContent>
      </Card>

      {/* Menú principal */}
      <div className="space-y-2">
        {menuItems.map((item) => (
          <Button
            key={item.path}
            variant={location.pathname === item.path ? "default" : "ghost"}
            className="w-full justify-start relative"
            onClick={() => navigate(item.path)}
          >
            <item.icon className="h-4 w-4 mr-2" />
            <span>{item.label}</span>
            {item.badge && (
              <Badge 
                variant={item.badge.variant}
                className="absolute right-2 top-1/2 -translate-y-1/2"
              >
                {item.badge.count}
              </Badge>
            )}
          </Button>
        ))}
      </div>

      {/* Accesos rápidos */}
      <Card className="bg-muted/50 border-none">
        <CardContent className="p-4 space-y-2">
          <h4 className="text-sm font-medium mb-2">Accesos Rápidos</h4>
          <Button variant="outline" size="sm" className="w-full justify-start">
            <History className="h-4 w-4 mr-2" />
            Historial Académico
          </Button>
          <Button variant="outline" size="sm" className="w-full justify-start">
            <Bell className="h-4 w-4 mr-2" />
            Notificaciones
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <DashboardLayout
      userType="student"
      userName="Carlos Ramírez"
      userInfo="Estudiante de 5to Secundaria"
      sidebarContent={sidebarContent}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Panel del Estudiante
            </h1>
            <p className="text-muted-foreground">
              Bienvenido al sistema académico, revisa tus materias, tareas y
              progreso.
            </p>
          </div>
          <Button variant="academicYellow">
            <Download className="h-4 w-4 mr-2" />
            Descargar Reporte
          </Button>
        </div>

        {/* Outlet para subpáginas */}
        <Outlet />

        {/* Dashboard principal */}
        {location.pathname === "/dashboard/student" && (
          <div className="grid gap-6">
            {/* Cards de resumen */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Promedio General</p>
                      <p className="text-3xl font-bold text-blue-600">{stats.promedio}</p>
                    </div>
                    <div className="p-2 bg-blue-200 rounded-full">
                      <BrainCircuit className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                  <Progress value={stats.promedio} className="mt-4" />
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-amber-50 to-amber-100">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Tareas Pendientes</p>
                      <p className="text-3xl font-bold text-amber-600">{stats.tareasPendientes}</p>
                    </div>
                    <div className="p-2 bg-amber-200 rounded-full">
                      <ClipboardList className="h-5 w-5 text-amber-600" />
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground mt-4">
                    Próximo vencimiento: 5 Nov
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Asistencia</p>
                      <p className="text-3xl font-bold text-emerald-600">{stats.asistencia}%</p>
                    </div>
                    <div className="p-2 bg-emerald-200 rounded-full">
                      <CalendarCheck className="h-5 w-5 text-emerald-600" />
                    </div>
                  </div>
                  <Progress value={stats.asistencia} className="mt-4" />
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Logros</p>
                      <p className="text-3xl font-bold text-purple-600">{stats.logros}</p>
                    </div>
                    <div className="p-2 bg-purple-200 rounded-full">
                      <Award className="h-5 w-5 text-purple-600" />
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground mt-4">
                    ¡2 nuevos esta semana!
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Rendimiento por Áreas */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BrainCircuit className="h-5 w-5 text-primary" />
                  Rendimiento por Áreas
                </CardTitle>
                <CardDescription>
                  Desempeño en las áreas principales del modelo educativo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(stats.areasDesempenio).map(([area, valor]) => (
                    <div key={area} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="capitalize">{area}</span>
                        <span className="font-medium">{valor}%</span>
                      </div>
                      <Progress 
                        value={valor} 
                        className={`h-2 ${
                          valor >= 85 ? 'bg-emerald-500' :
                          valor >= 70 ? 'bg-amber-500' :
                          'bg-red-500'
                        }`}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Seguimiento Bimestral */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Seguimiento Bimestral
                </CardTitle>
                <CardDescription>
                  Progreso académico por bimestre
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {stats.promediosBimestrales.map((bimestre) => (
                    <div key={bimestre.bimestre} className="p-4 rounded-lg bg-muted">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">{bimestre.bimestre}° Bimestre</span>
                        <Badge variant={
                          bimestre.estado === 'aprobado' ? 'default' :
                          bimestre.estado === 'reprobado' ? 'destructive' :
                          'secondary'
                        }>
                          {bimestre.estado}
                        </Badge>
                      </div>
                      <div className="text-2xl font-bold">
                        {bimestre.promedio || '-'}
                      </div>
                      <Progress 
                        value={bimestre.promedio} 
                        className="mt-2 h-1"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Próximas actividades y recordatorios */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    Próximas Evaluaciones
                  </CardTitle>
                  <CardDescription>
                    Prepárate para tus siguientes exámenes
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { materia: "Matemáticas", tipo: "Parcial", fecha: "Nov 10", urgente: true },
                    { materia: "Historia", tipo: "Práctica", fecha: "Nov 15", urgente: false },
                  ].map((evaluacion, index) => (
                    <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-muted">
                      <div>
                        <p className="font-medium">{evaluacion.materia}</p>
                        <p className="text-sm text-muted-foreground">{evaluacion.tipo}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant={evaluacion.urgente ? "destructive" : "secondary"}>
                          {evaluacion.fecha}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Bell className="h-5 w-5 text-primary" />
                    Recordatorios
                  </CardTitle>
                  <CardDescription>
                    No olvides estas actividades importantes
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { texto: "Entregar proyecto de Ciencias", fecha: "Hoy", tipo: "warning" },
                    { texto: "Traer materiales de Arte", fecha: "Mañana", tipo: "info" },
                    { texto: "Reunión con el tutor", fecha: "Nov 8", tipo: "default" },
                  ].map((reminder, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`h-2 w-2 rounded-full ${
                          reminder.tipo === 'warning' ? 'bg-red-500' :
                          reminder.tipo === 'info' ? 'bg-blue-500' : 'bg-green-500'
                        }`} />
                        <span className="text-sm">{reminder.texto}</span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {reminder.fecha}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;
