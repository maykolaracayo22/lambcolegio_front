import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getMyTeacherSections, type TeacherAssignedSection } from "@/services/teachersApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, CalendarDays, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

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

const COLORS = ["bg-sky-500", "bg-emerald-500", "bg-violet-500", "bg-amber-500", "bg-rose-500", "bg-indigo-500"];

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

const normalizeDay = (day?: string | null): DayKey | null => {
  const normalized = (day || "").trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const aliases: Record<string, DayKey> = {
    lunes: "lunes", martes: "martes", miercoles: "miércoles", jueves: "jueves", viernes: "viernes",
    monday: "lunes", tuesday: "martes", wednesday: "miércoles", thursday: "jueves", friday: "viernes",
  };
  return aliases[normalized] || null;
};

const parseTime = (value?: string | null): number | null => {
  if (!value) return null;
  const match = value.match(/^(\d{1,2}):(\d{2})/);
  if (!match) return null;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (hour > 23 || minute > 59) return null;
  return hour + minute / 60;
};

const formatTime = (time: number) => {
  const hour = Math.floor(time);
  const minute = Math.round((time - hour) * 60);
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
};

export default function Horario() {
  const { user } = useAuth();
  const teacherId = String(user?.teacherId ?? user?.id ?? getTeacherId());
  const storedLevel = scopedGet(teacherId, "nivel") || localStorage.getItem("nivel");
  const nivel = (["inicial", "primaria", "secundaria"].includes(String(storedLevel).toLowerCase())
    ? String(storedLevel).toLowerCase()
    : null) as NivelKey | null;
  const nivelLabel = scopedGet(teacherId, "nivelLabel") || localStorage.getItem("nivelLabel") || (nivel ? nivel[0].toUpperCase() + nivel.slice(1) : "—");
  const year = scopedGet(teacherId, "year") || localStorage.getItem("year") || new Date().getFullYear().toString();
  const term = scopedGet(teacherId, "term") || localStorage.getItem("term") || "T1";
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [assignedCount, setAssignedCount] = useState(0);

  useEffect(() => {
    if (!nivel) {
      setBlocks([]);
      setAssignedCount(0);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);
    getMyTeacherSections(year, nivel)
      .then((response) => {
        if (cancelled) return;
        const sections = response.data || [];
        const assignments = sections.flatMap((section: TeacherAssignedSection) =>
          section.assignments.map((assignment) => ({ section, assignment }))
        );
        setAssignedCount(assignments.length);
        const actualBlocks = assignments.flatMap(({ section, assignment }, index) => {
          const day = normalizeDay(assignment.dia);
          const start = parseTime(assignment.inicio);
          const end = parseTime(assignment.fin);
          if (!day || start === null || end === null || end <= start) return [];
          return [{
            day,
            start,
            end,
            subject: assignment.subject?.nombre || "Materia",
            room: assignment.aula || section.aula || undefined,
            grade: `${section.curso}° ${section.paralelo}`,
            color: COLORS[index % COLORS.length],
          }];
        });
        setBlocks(actualBlocks);
      })
      .catch((requestError: any) => {
        if (!cancelled) {
          setBlocks([]);
          setError(requestError.response?.data?.message || requestError.message || "No se pudo cargar tu horario.");
        }
      })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [nivel, year, teacherId]);

  const firstHour = blocks.length ? Math.min(startHour, Math.floor(Math.min(...blocks.map((block) => block.start)))) : startHour;
  const lastHour = blocks.length ? Math.max(endHour, Math.ceil(Math.max(...blocks.map((block) => block.end)))) : endHour;
  const hours = useMemo(() => {
    const hs: string[] = [];
    for (let h = firstHour; h <= lastHour; h++) hs.push(`${String(h).padStart(2, "0")}:00`);
    return hs;
  }, [firstHour, lastHour]);

  const exportCSV = () => {
    const header = ["Día", "Inicio", "Fin", "Asignatura", "Grado", "Aula"];
    const rows = blocks.map((b) => [
      b.day,
      formatTime(b.start),
      formatTime(b.end),
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
              <span className="font-semibold">{nivelLabel} — Horario semanal</span>
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
            {loading && <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Cargando horario asignado...</div>}
            {error && <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
            {!loading && !error && blocks.length === 0 && (
              <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                {assignedCount === 0
                  ? `No tienes materias asignadas para ${nivelLabel} en ${year}.`
                  : `Tienes ${assignedCount} materia(s) asignada(s), pero todavía no tienen día y horario registrados. Pide a administración que complete esos datos en Asignaciones.`}
              </div>
            )}
            <div className="overflow-x-auto">
              {/* grid base */}
              <div className="relative min-w-[760px]">
              <div className="grid grid-cols-6 text-sm">
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
              <div className="absolute inset-0 pointer-events-none">
                {blocks.map((b, idx) => {
                  const dayIndex = days.indexOf(b.day);
                  if (dayIndex < 0 || b.end <= firstHour || b.start >= lastHour) return null;

                  const visibleStart = Math.max(b.start, firstHour);
                  const visibleEnd = Math.min(b.end, lastHour);
                  const top = 36 + (visibleStart - firstHour) * rowHeight;
                  const height = Math.max((visibleEnd - visibleStart) * rowHeight, rowHeight * 0.9);
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
                          {formatTime(b.start)}–{formatTime(b.end)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
