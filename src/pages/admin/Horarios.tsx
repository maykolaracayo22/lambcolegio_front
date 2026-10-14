import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table2, Clock, AlertTriangle, Calendar, RefreshCw, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";

// Importar desde el catálogo unificado
import { type NivelKey } from "@/lib/catalogo-bolivia";

const API_URL = 'http://127.0.0.1:8000/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return {
    'Authorization': `Bearer ${token}`,
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  };
};

// Tipos del backend
interface Section {
  id: number;
  nivel: string;
  grado: string;
  paralelo: string;
  turno?: string;
}

interface Subject {
  id: number;
  nombre: string;
}

interface Teacher {
  id: number;
  nombre: string;
  apellido: string;
}

interface Assignment {
  id: number;
  section_id: number;
  subject_id: number;
  teacher_id: number;
  dia?: string;
  inicio?: string;
  fin?: string;
  aula?: string;
  section?: Section;
  subject?: Subject;
  teacher?: Teacher;
}

// Colores por nivel
const nivelColor: Record<NivelKey, string> = {
  inicial: "bg-pink-100 text-pink-700",
  primaria: "bg-blue-100 text-blue-700",
  secundaria: "bg-purple-100 text-purple-700",
};

export default function HorariosAdmin() {
  const { toast } = useToast();
  const year = parseInt(localStorage.getItem("adm:year") || String(new Date().getFullYear()));
  const nivel = (localStorage.getItem("adm:nivel") as NivelKey) || "primaria";

  // Estados
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSection, setSelectedSection] = useState<number | null>(null);

  // Cargar datos
  useEffect(() => {
    loadData();
  }, [year, nivel]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [assignRes, sectionsRes] = await Promise.all([
        axios.get(`${API_URL}/assignments`, { headers: getAuthHeaders(), params: { year } }),
        axios.get(`${API_URL}/sections`, { headers: getAuthHeaders(), params: { year, nivel } }),
      ]);

      const secs = sectionsRes.data.data || sectionsRes.data || [];
      const filteredSecs = secs.filter((s: Section) => s.nivel === nivel);
      
      setAssignments(assignRes.data.data || assignRes.data || []);
      setSections(filteredSecs);

      // Seleccionar primera sección
      if (filteredSecs.length > 0 && !selectedSection) {
        setSelectedSection(filteredSecs[0].id);
      }
    } catch (error: any) {
      console.error("Error cargando datos:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Error al cargar horarios",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const dias = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"] as const;
  const horas = useMemo(() => {
    const out: string[] = [];
    for (let h = 7; h <= 17; h++) out.push(`${String(h).padStart(2, "0")}:00`);
    return out;
  }, []);

  // Filtrar asignaciones por sección seleccionada
  const bySection = useMemo(() => {
    if (!selectedSection) return [];
    return assignments.filter(a => a.section_id === selectedSection);
  }, [assignments, selectedSection]);

  // Sección actual
  const currentSection = useMemo(() => sections.find(s => s.id === selectedSection), [sections, selectedSection]);

  // Obtener clases en un slot de hora
  const getClasesEnSlot = (dia: string, hora: string) => {
    return bySection.filter(a => {
      if (a.dia !== dia) return false;
      if (!a.inicio || !a.fin) return false;
      const [hSlot] = hora.split(":").map(Number);
      const [hIni] = a.inicio.split(":").map(Number);
      const [hFin] = a.fin.split(":").map(Number);
      return hSlot >= hIni && hSlot < hFin;
    });
  };

  // Contar total de horas de clase
  const totalHoras = useMemo(() => {
    return bySection.reduce((sum, a) => {
      if (!a.inicio || !a.fin) return sum;
      const [hI, mI] = a.inicio.split(":").map(Number);
      const [hF, mF] = a.fin.split(":").map(Number);
      const mins = (hF * 60 + mF) - (hI * 60 + mI);
      return sum + (mins > 0 ? mins / 60 : 0);
    }, 0);
  }, [bySection]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2">Cargando horarios...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Table2 className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold">Horarios — {nivel.toUpperCase()} {year}</h1>
        </div>
        <Button variant="outline" onClick={loadData}>
          <RefreshCw className="h-4 w-4 mr-2" /> Actualizar
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Vista por Sección
          </CardTitle>
          <CardDescription>
            Selecciona una sección para ver el horario semanal
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <Select value={selectedSection?.toString() || ""} onValueChange={(v) => setSelectedSection(parseInt(v))}>
              <SelectTrigger className="w-[280px]"><SelectValue placeholder="Seleccionar sección..." /></SelectTrigger>
              <SelectContent>
                {sections.length === 0 ? (
                  <div className="px-3 py-2 text-sm text-muted-foreground flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" /> No hay secciones
                  </div>
                ) : (
                  sections.map(s => (
                    <SelectItem key={s.id} value={s.id.toString()}>
                      {s.grado} - Paralelo {s.paralelo} ({s.turno || "Mañana"})
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>

            <Badge variant="outline" className={nivelColor[nivel]}>
              {nivel.toUpperCase()}
            </Badge>

            <div className="ml-auto text-sm text-muted-foreground">
              <strong>{bySection.length}</strong> clases • <strong>{totalHoras.toFixed(1)}</strong> horas/semana
            </div>
          </div>

          {bySection.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No hay asignaciones para {currentSection ? `${currentSection.grado} - ${currentSection.paralelo}` : "esta sección"}</p>
              <p className="text-xs mt-1">Ve a <strong>Asignaciones</strong> para agregar clases</p>
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <table className="min-w-[900px] w-full text-sm">
                <thead>
                  <tr className="bg-muted">
                    <th className="p-2 text-left w-[80px]">
                      <Clock className="h-4 w-4 inline mr-1" /> Hora
                    </th>
                    {dias.map(d => (
                      <th key={d} className="p-2 text-center font-semibold">{d}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {horas.map(h => {
                    const hayClases = dias.some(d => getClasesEnSlot(d, h).length > 0);
                    if (!hayClases && parseInt(h) > 14) return null; // Ocultar horas vacías después de las 14:00
                    
                    return (
                      <tr key={h} className="border-t hover:bg-muted/30">
                        <td className="p-2 font-mono text-xs text-muted-foreground border-r">
                          {h}
                        </td>
                        {dias.map(d => {
                          const clases = getClasesEnSlot(d, h);
                          return (
                            <td key={d} className="p-1 align-top border-r last:border-r-0">
                              {clases.length === 0 ? (
                                <span className="text-muted-foreground/30 text-xs">—</span>
                              ) : (
                                clases.map((c, i) => (
                                  <div
                                    key={i}
                                    className={`text-xs p-1.5 rounded mb-1 ${nivelColor[nivel]} border`}
                                  >
                                    <div className="font-semibold truncate">{c.subject?.nombre}</div>
                                    <div className="text-[10px] opacity-80 truncate">
                                      {c.teacher?.nombre?.split(" ")[0]} • {c.aula || "—"}
                                    </div>
                                  </div>
                                ))
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <p className="text-xs text-muted-foreground">
            * Esta vista se alimenta de las <strong>Asignaciones</strong>. Para modificar bloques, ve a "Asignaciones".
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
