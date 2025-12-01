// src/pages/teacher/Reportes.tsx
import React, { useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  LineChart,
  BookOpen,
  Users,
  Award,
  ClipboardList,
  Calendar,
  Download,
  Info,
  CheckCircle,
  AlertCircle,
  User as UserIcon,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

/** ===== Tipos ===== */
interface Alumno {
  id: number;
  nombre: string;
  apellido: string;
  grado: string;
  grupo: string;
}

interface MateriaDocente {
  id: number;
  nombre: string;
  grado: string;
  grupo: string;
  docenteId: number;
}

interface TareaDetalle {
  id: number;
  materiaId: number;
  titulo: string;
  fechaEntrega: string; // ISO
  ponderacion: number; // 0..100
  tipo: "tarea" | "examen" | "proyecto";
}

interface Calificacion {
  id: number;
  alumnoId: number;
  tareaId: number;
  calificacion: number | null; // 0..100
  comentarios?: string;
}

/** ===== Utilidades ===== */
function gradeToBadgeClasses(grade: number | null): string {
  if (grade === null) return "bg-gray-100 text-gray-800";
  if (grade < 60) return "bg-red-100 text-red-800";
  if (grade < 80) return "bg-yellow-100 text-yellow-800";
  return "bg-emerald-100 text-emerald-800";
}

function downloadText(filename: string, text: string, mime = "text/csv;charset=utf-8") {
  const blob = new Blob([text], { type: mime });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

/** ===== Componente principal ===== */
export default function TeacherReportes() {
  /** Datos de ejemplo (memos) */
  const alumnos: Alumno[] = useMemo(
    () => [
      { id: 101, nombre: "Ana", apellido: "Gómez", grado: "1", grupo: "A" },
      { id: 102, nombre: "Carlos", apellido: "Ruiz", grado: "1", grupo: "A" },
      { id: 103, nombre: "Sofía", apellido: "Martínez", grado: "1", grupo: "A" },
      { id: 104, nombre: "Juan", apellido: "Pérez", grado: "1", grupo: "A" },
      { id: 105, nombre: "María", apellido: "López", grado: "1", grupo: "B" },
      { id: 106, nombre: "Pedro", apellido: "Sánchez", grado: "1", grupo: "B" },
    ],
    []
  );

  const materiasDocente: MateriaDocente[] = useMemo(
    () => [
      { id: 1, nombre: "Matemáticas", grado: "1", grupo: "A", docenteId: 1 },
      { id: 2, nombre: "Física", grado: "1", grupo: "A", docenteId: 1 },
      { id: 3, nombre: "Matemáticas", grado: "1", grupo: "B", docenteId: 1 },
      { id: 4, nombre: "Introducción a la Programación", grado: "2", grupo: "C", docenteId: 1 },
    ],
    []
  );

  const tareas: TareaDetalle[] = useMemo(
    () => [
      { id: 1, materiaId: 1, titulo: "Guía de Álgebra", fechaEntrega: "2024-01-20", ponderacion: 20, tipo: "tarea" },
      { id: 2, materiaId: 1, titulo: "Examen Unidad 1", fechaEntrega: "2024-01-25", ponderacion: 40, tipo: "examen" },
      { id: 3, materiaId: 1, titulo: "Proyecto Final", fechaEntrega: "2024-02-15", ponderacion: 40, tipo: "proyecto" },
      { id: 4, materiaId: 2, titulo: "Cuestionario Cinemática", fechaEntrega: "2024-01-30", ponderacion: 30, tipo: "tarea" },
      { id: 5, materiaId: 3, titulo: "Ejercicios de Geometría", fechaEntrega: "2024-01-22", ponderacion: 20, tipo: "tarea" },
      { id: 6, materiaId: 3, titulo: "Exposición de Temas", fechaEntrega: "2024-02-01", ponderacion: 30, tipo: "proyecto" },
    ],
    []
  );

  const calificacionesData: Calificacion[] = useMemo(
    () => [
      { id: 1, alumnoId: 101, tareaId: 1, calificacion: 85, comentarios: "Buen trabajo" },
      { id: 2, alumnoId: 102, tareaId: 1, calificacion: 70 },
      { id: 3, alumnoId: 103, tareaId: 1, calificacion: null },
      { id: 4, alumnoId: 104, tareaId: 1, calificacion: 92 },

      { id: 5, alumnoId: 101, tareaId: 2, calificacion: 90 },
      { id: 6, alumnoId: 102, tareaId: 2, calificacion: 75 },
      { id: 7, alumnoId: 103, tareaId: 2, calificacion: 60 },
      { id: 8, alumnoId: 104, tareaId: 2, calificacion: 88 },

      { id: 9, alumnoId: 101, tareaId: 3, calificacion: null },
      { id: 10, alumnoId: 102, tareaId: 3, calificacion: null },
      { id: 11, alumnoId: 103, tareaId: 3, calificacion: null },
      { id: 12, alumnoId: 104, tareaId: 3, calificacion: null },

      // Grupo B (materiaId 3)
      { id: 13, alumnoId: 105, tareaId: 5, calificacion: 78 },
      { id: 14, alumnoId: 106, tareaId: 5, calificacion: 95 },
      { id: 15, alumnoId: 105, tareaId: 6, calificacion: null },
      { id: 16, alumnoId: 106, tareaId: 6, calificacion: null },
    ],
    []
  );

  /** Estado */
  const [selectedMateriaId, setSelectedMateriaId] = useState<number>(
    materiasDocente[0]?.id ?? 0
  );
  const [reporteSeleccionado, setReporteSeleccionado] = useState<string>("calificaciones-alumnos");

  /** Lógica de filtrado */
  const currentMateria = useMemo(
    () => materiasDocente.find((m) => m.id === selectedMateriaId) ?? null,
    [selectedMateriaId, materiasDocente]
  );

  const alumnosInCurrentGroup = useMemo(() => {
    if (!currentMateria) return [];
    return alumnos.filter(
      (a) => a.grado === currentMateria.grado && a.grupo === currentMateria.grupo
    );
  }, [alumnos, currentMateria]);

  const tareasForCurrentMateria = useMemo(() => {
    if (!currentMateria) return [];
    return tareas
      .filter((t) => t.materiaId === currentMateria.id)
      .sort(
        (a, b) =>
          new Date(a.fechaEntrega).getTime() - new Date(b.fechaEntrega).getTime()
      );
  }, [tareas, currentMateria]);

  /** Procesamiento de datos para reportes */

  // Reporte 1: Calificaciones por Alumno (ponderado por tarea)
  const reporteCalificaciones = useMemo(() => {
    if (!currentMateria || alumnosInCurrentGroup.length === 0 || tareasForCurrentMateria.length === 0) return null;

    return alumnosInCurrentGroup.map((alumno) => {
      let totalPonderacionCalificada = 0; // suma de ponderaciones con calificación
      let scoreAcumulado = 0; // suma de calificación * ponderación (en %)
      let tieneTareasPendientes = false;

      const calificacionesPorTarea: Record<number, number | "N/A"> = {};

      tareasForCurrentMateria.forEach((tarea) => {
        const calificacionEntry = calificacionesData.find(
          (c) => c.alumnoId === alumno.id && c.tareaId === tarea.id
        );

        if (calificacionEntry && calificacionEntry.calificacion !== null) {
          calificacionesPorTarea[tarea.id] = calificacionEntry.calificacion;
          scoreAcumulado += (calificacionEntry.calificacion * tarea.ponderacion) / 100;
          totalPonderacionCalificada += tarea.ponderacion;
        } else {
          calificacionesPorTarea[tarea.id] = "N/A";
          tieneTareasPendientes = true;
        }
      });

      const promedioFinal =
        totalPonderacionCalificada > 0
          ? Math.round((scoreAcumulado / totalPonderacionCalificada) * 100)
          : null; // null si no hay nada calificado

      return {
        alumno,
        calificacionesPorTarea,
        promedioFinal: promedioFinal ?? (tieneTareasPendientes ? null : null),
      };
    });
  }, [
    currentMateria,
    alumnosInCurrentGroup,
    tareasForCurrentMateria,
    calificacionesData,
  ]);

  // Reporte 2: Avance de Tareas
  const reporteAvanceTareas = useMemo(() => {
    if (!currentMateria || alumnosInCurrentGroup.length === 0 || tareasForCurrentMateria.length === 0) return null;

    return tareasForCurrentMateria.map((tarea) => {
      const entregasDeTarea = calificacionesData.filter(
        (c) =>
          c.tareaId === tarea.id &&
          alumnosInCurrentGroup.some((a) => a.id === c.alumnoId)
      );
      const totalAlumnos = alumnosInCurrentGroup.length;
      const entregados = entregasDeTarea.filter((e) => e.calificacion !== null)
        .length;
      const pendientes = totalAlumnos - entregados;
      const porcentajeEntregas =
        totalAlumnos > 0 ? Math.round((entregados / totalAlumnos) * 100) : 0;

      return {
        tarea,
        totalAlumnos,
        entregados,
        pendientes,
        porcentajeEntregas,
      };
    });
  }, [currentMateria, alumnosInCurrentGroup, tareasForCurrentMateria, calificacionesData]);

  // Reporte 3: Asistencia (simulada)
  const reporteAsistencia = useMemo(() => {
    if (!currentMateria || alumnosInCurrentGroup.length === 0) return null;
    return alumnosInCurrentGroup.map((alumno) => ({
      alumno,
      porcentajeAsistencia: Math.round(Math.random() * (100 - 80) + 80),
      faltas: Math.round(Math.random() * 5),
    }));
  }, [currentMateria, alumnosInCurrentGroup]);

  /** Descarga de reporte (CSV) */
  const handleDownloadReport = () => {
    if (!currentMateria) return;

    if (reporteSeleccionado === "calificaciones-alumnos" && reporteCalificaciones) {
      // CSV: Alumno, ...tareas, Promedio
      const headers = [
        "Alumno",
        ...tareasForCurrentMateria.map((t) => `${t.titulo} (${t.ponderacion}%)`),
        "Promedio",
      ];
      const rows = reporteCalificaciones.map((rep) => [
        `${rep.alumno.nombre} ${rep.alumno.apellido}`,
        ...tareasForCurrentMateria.map((t) =>
          rep.calificacionesPorTarea[t.id] === "N/A"
            ? "N/A"
            : String(rep.calificacionesPorTarea[t.id])
        ),
        rep.promedioFinal === null ? "Pendiente" : String(rep.promedioFinal),
      ]);
      const csv = [headers, ...rows]
        .map((r) => r.map((x) => `"${String(x).replace(/"/g, '""')}"`).join(","))
        .join("\n");
      downloadText(
        `calificaciones_${currentMateria.nombre}_${currentMateria.grado}${currentMateria.grupo}.csv`,
        csv
      );
      return;
    }

    if (reporteSeleccionado === "avance-tareas" && reporteAvanceTareas) {
      const headers = [
        "Tarea",
        "Fecha de entrega",
        "Total alumnos",
        "Entregados",
        "Pendientes",
        "% Completado",
      ];
      const rows = reporteAvanceTareas.map((rep) => [
        rep.tarea.titulo,
        new Date(rep.tarea.fechaEntrega).toLocaleDateString("es-ES"),
        String(rep.totalAlumnos),
        String(rep.entregados),
        String(rep.pendientes),
        `${rep.porcentajeEntregas}%`,
      ]);
      const csv = [headers, ...rows]
        .map((r) => r.map((x) => `"${String(x).replace(/"/g, '""')}"`).join(","))
        .join("\n");
      downloadText(
        `avance_tareas_${currentMateria.nombre}_${currentMateria.grado}${currentMateria.grupo}.csv`,
        csv
      );
      return;
    }

    if (reporteSeleccionado === "asistencia" && reporteAsistencia) {
      const headers = ["Alumno", "Asistencia %", "Faltas"];
      const rows = reporteAsistencia.map((rep) => [
        `${rep.alumno.nombre} ${rep.alumno.apellido}`,
        `${rep.porcentajeAsistencia}%`,
        String(rep.faltas),
      ]);
      const csv = [headers, ...rows]
        .map((r) => r.map((x) => `"${String(x).replace(/"/g, '""')}"`).join(","))
        .join("\n");
      downloadText(
        `asistencia_${currentMateria.nombre}_${currentMateria.grado}${currentMateria.grupo}.csv`,
        csv
      );
      return;
    }
  };

  /** Render */
  const downloadDisabled =
    !currentMateria ||
    (reporteSeleccionado === "calificaciones-alumnos" && !reporteCalificaciones) ||
    (reporteSeleccionado === "avance-tareas" && !reporteAvanceTareas) ||
    (reporteSeleccionado === "asistencia" && !reporteAsistencia);

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <LineChart className="h-7 w-7 text-academic-blue-500" />
            Reportes Académicos
          </h1>
          <p className="text-muted-foreground">
            Genera informes detallados sobre el progreso de tus estudiantes.
          </p>
        </div>
        <Button
          variant="academic"
          className="bg-academic-blue-500 hover:bg-academic-blue-600"
          onClick={handleDownloadReport}
          disabled={downloadDisabled}
        >
          <Download className="h-4 w-4 mr-2" />
          Descargar Reporte
        </Button>
      </div>

      {/* Selector de Materia/Grupo y Tipo de Reporte */}
      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <Label
              htmlFor="select-materia-grupo"
              className="flex-shrink-0 text-sm font-medium flex items-center gap-2"
            >
              <Users className="h-4 w-4 text-muted-foreground" />
              Seleccionar Materia/Grupo:
            </Label>
            <Select
              value={String(selectedMateriaId)}
              onValueChange={(v) => setSelectedMateriaId(parseInt(v, 10))}
            >
              <SelectTrigger id="select-materia-grupo" className="w-full md:w-[320px]">
                <SelectValue placeholder="Materia y Grupo" />
              </SelectTrigger>
              <SelectContent>
                {materiasDocente.map((materia) => (
                  <SelectItem key={materia.id} value={String(materia.id)}>
                    {materia.nombre} ({materia.grado}° {materia.grupo})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-4">
            <Label
              htmlFor="select-tipo-reporte"
              className="flex-shrink-0 text-sm font-medium flex items-center gap-2"
            >
              <LineChart className="h-4 w-4 text-muted-foreground" />
              Tipo de Reporte:
            </Label>
            <Select
              value={reporteSeleccionado}
              onValueChange={setReporteSeleccionado}
            >
              <SelectTrigger id="select-tipo-reporte" className="w-full md:w-[250px]">
                <SelectValue placeholder="Selecciona un reporte" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="calificaciones-alumnos">
                  Calificaciones por Alumno
                </SelectItem>
                <SelectItem value="avance-tareas">Avance de Tareas</SelectItem>
                <SelectItem value="asistencia">Asistencia (Simulado)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Rango de fechas opcional si más adelante se requiere */}
          {/* <div className="flex items-center gap-4">
            <Label className="flex-shrink-0 text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              Rango de Fechas:
            </Label>
            <Input type="date" className="w-full md:w-[150px]" />
            <span> - </span>
            <Input type="date" className="w-full md:w-[150px]" />
          </div> */}
        </CardContent>
      </Card>

      <Separator className="my-6" />

      {/* Área de visualización */}
      {currentMateria ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {reporteSeleccionado === "calificaciones-alumnos" && (
                <Award className="h-6 w-6 text-academic-blue-500" />
              )}
              {reporteSeleccionado === "avance-tareas" && (
                <ClipboardList className="h-6 w-6 text-academic-blue-500" />
              )}
              {reporteSeleccionado === "asistencia" && (
                <Calendar className="h-6 w-6 text-academic-blue-500" />
              )}
              Reporte de{" "}
              {reporteSeleccionado === "calificaciones-alumnos"
                ? "Calificaciones por Alumno"
                : reporteSeleccionado === "avance-tareas"
                ? "Avance de Tareas"
                : reporteSeleccionado === "asistencia"
                ? "Asistencia (Simulado)"
                : "Reporte"}
            </CardTitle>
            <CardDescription>
              Para {currentMateria.nombre} ({currentMateria.grado}° {currentMateria.grupo}).
            </CardDescription>
          </CardHeader>
          <CardContent>
            {reporteSeleccionado === "calificaciones-alumnos" && (
              reporteCalificaciones && reporteCalificaciones.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[800px] text-sm">
                    <thead>
                      <tr className="border-b text-left text-muted-foreground">
                        <th className="p-3 w-[180px]">Alumno</th>
                        {tareasForCurrentMateria.map((tarea) => (
                          <th key={tarea.id} className="p-3">
                            {tarea.titulo}{" "}
                            <Badge variant="secondary" className="font-normal ml-1">
                              ({tarea.ponderacion}%)
                            </Badge>
                          </th>
                        ))}
                        <th className="p-3 w-[100px] text-center font-bold text-foreground">
                          Promedio
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {reporteCalificaciones.map((rep) => (
                        <tr
                          key={rep.alumno.id}
                          className="border-b hover:bg-muted/50 transition-colors"
                        >
                          <td className="p-3 font-medium flex items-center gap-2">
                            <UserIcon className="h-4 w-4 text-muted-foreground" />
                            {rep.alumno.nombre} {rep.alumno.apellido}
                          </td>
                          {tareasForCurrentMateria.map((tarea) => {
                            const val = rep.calificacionesPorTarea[tarea.id];
                            const isNA = val === "N/A";
                            return (
                              <td key={tarea.id} className="p-3">
                                {isNA ? (
                                  <Badge variant="outline" className="text-gray-500 border-gray-200">
                                    N/A
                                  </Badge>
                                ) : (
                                  <Badge className={`${gradeToBadgeClasses(Number(val))} font-semibold`}>
                                    {val}
                                  </Badge>
                                )}
                              </td>
                            );
                          })}
                          <td className="p-3 text-center font-bold text-lg">
                            {rep.promedioFinal !== null ? (
                              <Badge className={`${gradeToBadgeClasses(rep.promedioFinal)} font-semibold`}>
                                {rep.promedioFinal}
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-gray-500">
                                Pendiente
                              </Badge>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Info className="h-12 w-12 mx-auto mb-4" />
                  <p>No hay datos de calificaciones disponibles para este reporte.</p>
                </div>
              )
            )}

            {reporteSeleccionado === "avance-tareas" && (
              reporteAvanceTareas && reporteAvanceTareas.length > 0 ? (
                <div className="space-y-4">
                  {reporteAvanceTareas.map((rep) => (
                    <div
                      key={rep.tarea.id}
                      className="border rounded-lg p-4 flex flex-col md:flex-row items-center justify-between gap-4"
                    >
                      <div className="flex-grow">
                        <h3 className="font-semibold text-lg">{rep.tarea.titulo}</h3>
                        <p className="text-sm text-muted-foreground">
                          Fecha de Entrega:{" "}
                          {new Date(rep.tarea.fechaEntrega).toLocaleDateString("es-ES")}
                        </p>
                      </div>
                      <div className="flex items-center gap-4 text-sm flex-shrink-0">
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <CheckCircle className="h-3 w-3 text-emerald-500" />
                          Entregados: {rep.entregados}
                        </Badge>
                        <Badge variant="destructive" className="flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          Pendientes: {rep.pendientes}
                        </Badge>
                        <Badge className="bg-academic-blue-100 text-academic-blue-800 font-semibold">
                          {rep.porcentajeEntregas}% Completado
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Info className="h-12 w-12 mx-auto mb-4" />
                  <p>No hay datos de avance de tareas disponibles para este reporte.</p>
                </div>
              )
            )}

            {reporteSeleccionado === "asistencia" && (
              reporteAsistencia && reporteAsistencia.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[500px] text-sm">
                    <thead>
                      <tr className="border-b text-left text-muted-foreground">
                        <th className="p-3 w-[200px]">Alumno</th>
                        <th className="p-3 text-center">Asistencia %</th>
                        <th className="p-3 text-center">Faltas Totales</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reporteAsistencia.map((rep) => (
                        <tr
                          key={rep.alumno.id}
                          className="border-b hover:bg-muted/50 transition-colors"
                        >
                          <td className="p-3 font-medium flex items-center gap-2">
                            <UserIcon className="h-4 w-4 text-muted-foreground" />
                            {rep.alumno.nombre} {rep.alumno.apellido}
                          </td>
                          <td className="p-3 text-center">
                            <Badge className="bg-academic-blue-100 text-academic-blue-800 font-semibold">
                              {rep.porcentajeAsistencia}%
                            </Badge>
                          </td>
                          <td className="p-3 text-center">
                            <Badge variant={rep.faltas > 2 ? "destructive" : "secondary"}>
                              {rep.faltas}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Info className="h-12 w-12 mx-auto mb-4" />
                  <p>No hay datos de asistencia disponibles para este reporte (simulado).</p>
                </div>
              )
            )}

            {/* Mensaje fallback si no hay selección */}
            {(!reporteSeleccionado || !currentMateria) && (
              <div className="text-center py-8 text-muted-foreground">
                <LineChart className="h-12 w-12 mx-auto mb-4" />
                <p>Selecciona una materia/grupo y un tipo de reporte para ver los datos.</p>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card className="text-center py-12 text-muted-foreground">
          <BookOpen className="h-16 w-16 mx-auto mb-4 text-academic-blue-500" />
          <p className="text-lg font-medium">
            Selecciona una materia y grupo para generar reportes.
          </p>
          <p className="mt-2 text-sm">Usa los selectores de arriba para comenzar.</p>
        </Card>
      )}
    </div>
  );
}
