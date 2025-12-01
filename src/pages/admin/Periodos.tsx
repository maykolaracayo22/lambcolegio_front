// src/pages/admin/Periodos.tsx
import { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Plus,
  Save,
  Trash2,
  CalendarDays,
  Play,
  ListTodo,
  CheckCircle,
  Info,
  RefreshCw,
  Filter,
  ArrowUpDown,
  Sparkles,
} from "lucide-react";

type NivelKey = "inicial" | "primaria" | "secundaria";
type Estado = "proximo" | "activo" | "finalizado";

type Periodo = {
  id: string; // T1, T2, T3 o custom
  nombre: string; // "Trimestre 1"
  inicio: string; // YYYY-MM-DD
  fin: string; // YYYY-MM-DD
  estado: Estado; // proximo | activo | finalizado
};

const storageKey = (year: string, nivel: NivelKey) => `adm:periods:${year}:${nivel}`;

const defaultTrimestres = (year: string): Periodo[] => [
  { id: "T1", nombre: "Trimestre 1", inicio: `${year}-03-01`, fin: `${year}-05-31`, estado: "activo" },
  { id: "T2", nombre: "Trimestre 2", inicio: `${year}-06-01`, fin: `${year}-08-31`, estado: "proximo" },
  { id: "T3", nombre: "Trimestre 3", inicio: `${year}-09-01`, fin: `${year}-12-15`, estado: "proximo" },
];

export default function AdminPeriodos() {
  /** ===== Preferencias globales (nivel/año) ===== */
  const nowYear = String(new Date().getFullYear());
  const [nivel, setNivel] = useState<NivelKey>("primaria");
  const [year, setYear] = useState<string>(nowYear);

  // Cargar preferencias guardadas al montar
  useEffect(() => {
    try {
      const savedYear = localStorage.getItem("adm:year");
      const savedNivel = localStorage.getItem("adm:nivel") as NivelKey | null;
      if (savedYear) setYear(savedYear);
      if (savedNivel) setNivel(savedNivel);
    } catch {}
  }, []);

  // Persistir cambios de año/nivel
  useEffect(() => {
    try {
      localStorage.setItem("adm:year", year);
      localStorage.setItem("adm:nivel", nivel);
    } catch {}
  }, [year, nivel]);

  /** ===== Filtros/search ===== */
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEstado, setFilterEstado] = useState<Estado | "todos">("todos");

  /** ===== Periodos (por nivel/año) ===== */
  const [periodos, setPeriodos] = useState<Periodo[]>(() => defaultTrimestres(year));

  // Recargar periodos al cambiar año/nivel
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey(year, nivel));
      setPeriodos(raw ? JSON.parse(raw) : defaultTrimestres(year));
    } catch {
      setPeriodos(defaultTrimestres(year));
    }
  }, [year, nivel]);

  /** ===== Acciones ===== */
  const guardar = () => {
    try {
      localStorage.setItem(storageKey(year, nivel), JSON.stringify(periodos));
      localStorage.setItem("adm:year", year);
      localStorage.setItem("adm:nivel", nivel);
      alert(`Períodos guardados para ${nivel.toUpperCase()} ${year}`);
    } catch {
      alert("No se pudo guardar en localStorage.");
    }
  };

  const agregar = () => {
    const idx = periodos.length + 1;
    setPeriodos((prev) => [
      ...prev,
      {
        id: `C${idx}`,
        nombre: `Custom ${idx}`,
        inicio: `${year}-01-01`,
        fin: `${year}-01-31`,
        estado: "proximo",
      },
    ]);
  };

  const eliminar = (id: string) => {
    if (!confirm("¿Eliminar período?")) return;
    setPeriodos((prev) => prev.filter((p) => p.id !== id));
  };

  const resetTrimestres = () => {
    if (!confirm("¿Restablecer a trimestres por defecto?")) return;
    setPeriodos(defaultTrimestres(year));
  };

  const ordenarPorInicio = () => {
    setPeriodos((prev) =>
      [...prev].sort((a, b) => new Date(a.inicio).getTime() - new Date(b.inicio).getTime())
    );
  };

  const autocalcularEstados = () => {
    const today = new Date().getTime();
    setPeriodos((prev) => {
      const next = prev.map((p) => {
        const ini = new Date(p.inicio).getTime();
        const fin = new Date(p.fin).getTime();
        if (Number.isNaN(ini) || Number.isNaN(fin)) return { ...p, estado: p.estado };
        if (ini <= today && today <= fin) return { ...p, estado: "activo" };
        if (today < ini) return { ...p, estado: "proximo" };
        return { ...p, estado: "finalizado" };
      });

      // Exclusividad: si hay varios "activo", mantener solo el de rango más cercano (o el primero)
      const activos = next.filter((p) => p.estado === "activo");
      if (activos.length > 1) {
        const firstActiveId = activos[0].id;
        return next.map((p) => (p.id !== firstActiveId && p.estado === "activo" ? { ...p, estado: "proximo" } : p));
      }
      return next;
    });
  };

  /** ===== Filtro de tabla ===== */
  const filtered = useMemo(() => {
    return periodos.filter((p) => {
      const matchesQ = `${p.id} ${p.nombre} ${p.inicio} ${p.fin}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesEstado = filterEstado === "todos" || p.estado === filterEstado;
      return matchesQ && matchesEstado;
    });
  }, [periodos, searchTerm, filterEstado]);

  /** ===== Estadísticas ===== */
  const stats = useMemo(() => {
    const total = periodos.length;
    const activos = periodos.filter((p) => p.estado === "activo").length;
    const proximos = periodos.filter((p) => p.estado === "proximo").length;
    const finalizados = periodos.filter((p) => p.estado === "finalizado").length;
    return { total, activos, proximos, finalizados };
  }, [periodos]);

  /** ===== Validaciones ===== */
  const getEstadoBadgeColors = (estado: Estado) => {
    switch (estado) {
      case "activo":
        return "bg-green-100 text-green-700";
      case "proximo":
        return "bg-yellow-100 text-yellow-700";
      case "finalizado":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getEstadoIcon = (estado: Estado) => {
    switch (estado) {
      case "activo":
        return <Play className="h-4 w-4 mr-1" />;
      case "proximo":
        return <ListTodo className="h-4 w-4 mr-1" />;
      case "finalizado":
        return <CheckCircle className="h-4 w-4 mr-1" />;
      default:
        return <Info className="h-4 w-4 mr-1" />;
    }
  };

  // Solapes de fechas
  const colisiones = useMemo(() => {
    const overlaps: string[] = [];
    const toNum = (s: string) => new Date(s).getTime();
    for (let i = 0; i < periodos.length; i++) {
      for (let j = i + 1; j < periodos.length; j++) {
        const a = periodos[i],
          b = periodos[j];
        const ai = toNum(a.inicio),
          af = toNum(a.fin),
          bi = toNum(b.inicio),
          bf = toNum(b.fin);
        if ([ai, af, bi, bf].some(Number.isNaN)) continue;
        if (ai <= bf && bi <= af) {
          overlaps.push(`${a.id} ↔ ${b.id}`);
        }
      }
    }
    return overlaps;
  }, [periodos]);

  const isInvalidRange = (ini: string, fin: string) => {
    const a = new Date(ini).getTime();
    const b = new Date(fin).getTime();
    return Number.isNaN(a) || Number.isNaN(b) || a > b;
  };

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <CalendarDays className="h-7 w-7 text-blue-600" />
            Gestión de Períodos
          </h1>
          <p className="text-muted-foreground">
            Administra los ciclos/períodos académicos por nivel y año (valores
            globales del Admin).
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={agregar}>
            <Plus className="h-4 w-4 mr-2" />
            Añadir Período
          </Button>
          <Button variant="outline" onClick={ordenarPorInicio}>
            <ArrowUpDown className="h-4 w-4 mr-2" />
            Ordenar por inicio
          </Button>
          <Button variant="outline" onClick={autocalcularEstados}>
            <Sparkles className="h-4 w-4 mr-2" />
            Autocalcular estados
          </Button>
          <Button variant="outline" onClick={resetTrimestres}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Trimestres por defecto
          </Button>
          <Button onClick={guardar}>
            <Save className="h-4 w-4 mr-2" />
            Guardar
          </Button>
        </div>
      </div>

      {/* Preferencias: Nivel / Año */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Año lectivo</span>
              <Input
                type="number"
                className="w-[120px]"
                value={year}
                onChange={(e) => setYear(e.target.value || nowYear)}
                min="2000"
                max="2100"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Nivel</span>
              <Select value={nivel} onValueChange={(v) => setNivel(v as NivelKey)}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="inicial">Inicial</SelectItem>
                  <SelectItem value="primaria">Primaria</SelectItem>
                  <SelectItem value="secundaria">Secundaria</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total de Períodos</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
            <div className="p-2 bg-blue-100 rounded-full">
              <CalendarDays className="h-5 w-5 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Activos</p>
              <p className="text-2xl font-bold text-green-600">{stats.activos}</p>
            </div>
            <div className="p-2 bg-green-100 rounded-full">
              <Play className="h-5 w-5 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Próximos</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.proximos}</p>
            </div>
            <div className="p-2 bg-yellow-100 rounded-full">
              <ListTodo className="h-5 w-5 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Finalizados</p>
              <p className="text-2xl font-bold text-blue-600">{stats.finalizados}</p>
            </div>
            <div className="p-2 bg-blue-100 rounded-full">
              <CheckCircle className="h-5 w-5 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full md:w-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar por nombre o fechas…"
                className="pl-10 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex w-full md:w-auto">
              <Select
                value={filterEstado}
                onValueChange={(v) => setFilterEstado(v as Estado | "todos")}
              >
                <SelectTrigger className="w-full sm:w-[180px]">
                  <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="activo">Activo</SelectItem>
                  <SelectItem value="proximo">Próximo</SelectItem>
                  <SelectItem value="finalizado">Finalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla */}
      <Card>
        <CardHeader>
          <CardTitle>Listado de Períodos — {year} ({nivel.toUpperCase()})</CardTitle>
          <CardDescription>
            Mostrando {filtered.length} de {periodos.length} períodos académicos.
            {colisiones.length > 0 && (
              <span className="ml-2 text-red-600">
                • ⚠️ Fechas superpuestas: {colisiones.join(", ")}
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Info className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>No se encontraron períodos con los filtros actuales.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">ID</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Inicio</TableHead>
                    <TableHead>Fin</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((p) => {
                    const idx = periodos.findIndex((x) => x.id === p.id);
                    const invalid = isInvalidRange(p.inicio, p.fin);
                    return (
                      <TableRow key={p.id}>
                        <TableCell className="font-mono text-xs">{p.id}</TableCell>
                        <TableCell>
                          <Input
                            value={p.nombre}
                            onChange={(e) => {
                              const v = e.target.value;
                              setPeriodos((prev) =>
                                prev.map((x, i) => (i === idx ? { ...x, nombre: v } : x))
                              );
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="date"
                            value={p.inicio}
                            onChange={(e) => {
                              const v = e.target.value;
                              setPeriodos((prev) =>
                                prev.map((x, i) => (i === idx ? { ...x, inicio: v } : x))
                              );
                            }}
                            className={invalid ? "border-red-500" : undefined}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="date"
                            value={p.fin}
                            onChange={(e) => {
                              const v = e.target.value;
                              setPeriodos((prev) =>
                                prev.map((x, i) => (i === idx ? { ...x, fin: v } : x))
                              );
                            }}
                            className={invalid ? "border-red-500" : undefined}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 text-xs rounded ${getEstadoBadgeColors(p.estado)}`}>
                              <span className="inline-flex items-center">
                                {getEstadoIcon(p.estado)}
                                {p.estado.toUpperCase()}
                              </span>
                            </span>
                            <Select
                              value={p.estado}
                              onValueChange={(v) =>
                                setPeriodos((prev) => {
                                  const nextEstado = v as Estado;
                                  // Exclusividad: si se marca ACTIVO, todo lo demás pasa a PROXIMO
                                  if (nextEstado === "activo") {
                                    return prev.map((x, i) =>
                                      i === idx
                                        ? { ...x, estado: "activo" }
                                        : { ...x, estado: x.estado === "activo" ? "proximo" : x.estado }
                                    );
                                  }
                                  return prev.map((x, i) =>
                                    i === idx ? { ...x, estado: nextEstado } : x
                                  );
                                })
                              }
                            >
                              <SelectTrigger className="w-[140px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="activo">Activo</SelectItem>
                                <SelectItem value="proximo">Próximo</SelectItem>
                                <SelectItem value="finalizado">Finalizado</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => eliminar(p.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
