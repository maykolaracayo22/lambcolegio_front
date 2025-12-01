import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";

type NivelKey = "inicial" | "primaria" | "secundaria";
type DayKey = "lunes" | "martes" | "miércoles" | "jueves" | "viernes";

type Block = {
  day: DayKey;
  start: number; // 8 = 08:00
  end: number;   // 10 = 10:00
  subject: string;
  room?: string;
  grade?: string;
  color: string; // tailwind bg-*
};

const rowHeight = 48;
const startHour = 7;
const endHour = 18;
const days: DayKey[] = ["lunes", "martes", "miércoles", "jueves", "viernes"];

const sanitizeId = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");

const getTeacherId = () => {
  if (typeof window === "undefined") return "teacher";
  return localStorage.getItem("teacherId") || sanitizeId(localStorage.getItem("teacherName") || "docente");
};

const scopedGet = (teacherId: string, key: string, def: string | null = null) => {
  if (typeof window === "undefined") return def;
  return localStorage.getItem(`tt:${teacherId}:${key}`) ?? def;
};

// Horarios por nivel (ejemplo)
const SCHEDULES: Record<NivelKey, Block[]> = {
  inicial: [
    { day: "lunes", start: 8, end: 9, subject: "Psicomotricidad", room: "Patio", grade: "5 años", color: "bg-rose-400" },
    { day: "lunes", start: 9, end: 10, subject: "Comunicación", room: "Aula I-2", grade: "5 años", color: "bg-emerald-400" },
    { day: "martes", start: 8, end: 9, subject: "Arte y Juego", room: "Sala de Arte", grade: "5 años", color: "bg-violet-400" },
    { day: "martes", start: 9, end: 10, subject: "Matemática Inicial", room: "Aula I-2", grade: "5 años", color: "bg-amber-400" },
    { day: "jueves", start: 8, end: 10, subject: "Exploración del Entorno", room: "Patio", grade: "5 años", color: "bg-sky-400" },
    { day: "viernes", start: 9, end: 10, subject: "Comunicación", room: "Aula I-1", grade: "5 años", color: "bg-emerald-400" },
  ],
  primaria: [
    { day: "lunes", start: 8, end: 9, subject: "Comunicación", room: "P-3A", grade: "3°A", color: "bg-emerald-400" },
    { day: "lunes", start: 9, end: 10, subject: "Matemática", room: "P-3A", grade: "3°A", color: "bg-sky-400" },
    { day: "martes", start: 10, end: 12, subject: "CyT", room: "Lab", grade: "3°A", color: "bg-amber-400" },
    { day: "miércoles", start: 8, end: 9, subject: "Personal Social", room: "P-3A", grade: "3°A", color: "bg-rose-400" },
    { day: "jueves", start: 9, end: 10, subject: "Inglés", room: "Idiomas", grade: "3°A", color: "bg-violet-400" },
    { day: "viernes", start: 11, end: 12, subject: "Educación Física", room: "Cancha", grade: "3°A", color: "bg-green-500" },
  ],
  secundaria: [
    { day: "lunes", start: 8, end: 10, subject: "Matemática", room: "S-1A", grade: "1°A", color: "bg-sky-400" },
    { day: "martes", start: 10, end: 11, subject: "Comunicación", room: "S-1A", grade: "1°A", color: "bg-emerald-400" },
    { day: "miércoles", start: 9, end: 10, subject: "CyT", room: "Lab", grade: "1°A", color: "bg-amber-400" },
    { day: "jueves", start: 8, end: 9, subject: "HGE", room: "S-1A", grade: "1°A", color: "bg-rose-400" },
    { day: "jueves", start: 9, end: 10, subject: "Inglés", room: "Idiomas", grade: "1°A", color: "bg-violet-400" },
    { day: "viernes", start: 11, end: 12, subject: "Educación Física", room: "Cancha", grade: "1°A", color: "bg-green-500" },
  ],
};

export default function Horario() {
  const teacherId = getTeacherId();

  const nivel = (scopedGet(teacherId, "nivel") as NivelKey) ||
                (typeof window !== "undefined" ? (localStorage.getItem("nivel") as NivelKey) : null);
  const nivelLabel =
    (scopedGet(teacherId, "nivelLabel") as string) ||
    (typeof window !== "undefined" ? (localStorage.getItem("nivelLabel") as string) : "—");
  const year =
    (scopedGet(teacherId, "year") as string) ||
    (typeof window !== "undefined" ? localStorage.getItem("year") : null) ||
    new Date().getFullYear().toString();
  const term =
    (scopedGet(teacherId, "term") as string) ||
    (typeof window !== "undefined" ? localStorage.getItem("term") : null) ||
    "T1";

  const blocks = useMemo<Block[]>(() => {
    if (!nivel) return [];
    return SCHEDULES[nivel] || [];
  }, [nivel]);

  const hours = useMemo(() => {
    const hs: string[] = [];
    for (let h = startHour; h <= endHour; h++) hs.push(`${String(h).padStart(2, "0")}:00`);
    return hs;
  }, []);

  const colCount = 6; // horas + 5 días

  const exportCSV = () => {
    const header = ["Día", "Inicio", "Fin", "Asignatura", "Grado", "Aula"];
    const rows = blocks.map((b) => [
      b.day,
      `${String(b.start).padStart(2, "0")}:00`,
      `${String(b.end).padStart(2, "0")}:00`,
      b.subject,
      b.grade || "",
      b.room || "",
    ]);
    const csv =
      header.join(",") +
      "\n" +
      rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `horario_${nivelLabel}_${year}_${term}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <CalendarDays className="h-6 w-6" />
            Mi Horario
          </h2>
          <p className="text-sm text-muted-foreground">
            {`Nivel: ${nivelLabel || "—"} • Año: ${year} • Trimestre: ${term}`}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportCSV}>
            <Download className="h-4 w-4 mr-2" /> Exportar CSV
          </Button>
          <Button variant="outline" onClick={() => window.print()}>
            Imprimir
          </Button>
        </div>
      </div>

      {!nivel ? (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle>Selecciona un nivel para ver el horario</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Ve a <strong>“Cambiar nivel”</strong> desde el encabezado del Dashboard Docente.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="p-0">
            <div className="bg-primary/90 text-primary-foreground rounded-t-lg p-4 flex items-center justify-between">
              <span className="font-semibold">{nivelLabel} — Semana de ejemplo</span>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="bg-white/20 hover:bg-white/30 text-white">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="bg-white/20 hover:bg-white/30 text-white">
                  Hoy
                </Button>
                <Button variant="ghost" size="sm" className="bg-white/20 hover:bg-white/30 text-white">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <div className="overflow-x-auto">
              {/* grid base */}
              <div className="grid grid-cols-6 min-w-[760px] text-sm">
                <div className="p-2"></div>
                {days.map((d) => (
                  <div key={d} className="p-2 text-center font-semibold border-b">
                    {d.charAt(0).toUpperCase() + d.slice(1)}
                  </div>
                ))}

                {hours.map((h) => (
                  <React.Fragment key={h}>
                    <div className="p-2 pr-4 text-right text-xs text-muted-foreground border-b">
                      {h}
                    </div>
                    {days.map((d) => (
                      <div key={`${d}-${h}`} className="h-12 border-b relative"></div>
                    ))}
                  </React.Fragment>
                ))}
              </div>

              {/* overlay de bloques */}
              <div className="relative min-w-[760px]">
                {blocks.map((b, idx) => {
                  const dayIndex = days.indexOf(b.day);
                  if (dayIndex < 0) return null;

                  const top = (b.start - startHour) * rowHeight;
                  const height = Math.max((b.end - b.start) * rowHeight, rowHeight * 0.9);
                  const leftPct = ((dayIndex + 1) * 100) / 6;
                  const widthPct = 100 / 6;

                  return (
                    <div
                      key={`${b.day}-${b.start}-${idx}`}
                      className={`${b.color} text-white m-1 p-2 rounded-md shadow-sm border border-white/20`}
                      style={{
                        position: "absolute",
                        top,
                        left: `${leftPct}%`,
                        width: `${widthPct}%`,
                        height,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                      title={`${b.subject} ${b.grade ? "• " + b.grade : ""} ${b.room ? "• " + b.room : ""}`}
                    >
                      <div className="text-center leading-tight">
                        <div className="text-xs font-bold">{b.subject}</div>
                        {b.grade && <div className="text-[10px] opacity-90">{b.grade}</div>}
                        {b.room && <div className="text-[10px] opacity-90">{b.room}</div>}
                        <div className="text-[10px] opacity-90">
                          {String(b.start).padStart(2, "0")}:00–{String(b.end).padStart(2, "0")}:00
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
