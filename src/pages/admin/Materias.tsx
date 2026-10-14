// src/pages/admin/Materias.tsx
// Gestión de Materias - Conectado a localStorage y catálogo Bolivia
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Search, Plus, Edit, Trash2, BookOpen, RefreshCw, Download,
  CheckCircle, XCircle, Clock, BookText, School, Library, Sparkles
} from "lucide-react";
import { pushAudit } from "@/lib/audit";

// Importar catálogo unificado Bolivia
import {
  NIVELES,
  CURSOS_POR_NIVEL,
  AREAS_POR_NIVEL,
  MATERIAS_POR_NIVEL,
  type NivelKey,
  type MateriaBase,
} from "@/lib/catalogo-bolivia";

// ==========================================
// TIPOS
// ==========================================
interface Materia {
  id: number;
  codigo: string;
  nombre: string;
  descripcion: string;
  nivel: NivelKey;
  curso: string;           // "1ro Primaria", "2do Secundaria", etc.
  area: string;
  horasSemanales: number;
  activo: boolean;
  competencias: string[];
  fechaCreacion: string;
  fechaModificacion?: string;
}

const STORAGE_KEY = "adm:materias";

// ==========================================
// HELPERS
// ==========================================
function loadMaterias(): Materia[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveMaterias(materias: Materia[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(materias));
}

// Generar materias iniciales desde el catálogo
function generarMateriasIniciales(): Materia[] {
  const materias: Materia[] = [];
  let id = 1;
  const fecha = new Date().toISOString().split("T")[0];

  NIVELES.forEach(nivel => {
    const cursos = CURSOS_POR_NIVEL[nivel];
    const materiasBase = MATERIAS_POR_NIVEL[nivel];

    cursos.forEach(curso => {
      materiasBase.forEach(mb => {
        materias.push({
          id: id++,
          codigo: `${mb.codigo}-${curso.replace(/\s+/g, "").slice(0, 3).toUpperCase()}`,
          nombre: mb.nombre,
          descripcion: `${mb.nombre} para ${curso}`,
          nivel,
          curso,
          area: mb.area,
          horasSemanales: mb.horasSemanales,
          activo: true,
          competencias: [],
          fechaCreacion: fecha,
        });
      });
    });
  });

  return materias;
}

// Colores por nivel
const nivelColor: Record<NivelKey, string> = {
  inicial: "bg-pink-100 text-pink-700 border-pink-200",
  primaria: "bg-blue-100 text-blue-700 border-blue-200",
  secundaria: "bg-purple-100 text-purple-700 border-purple-200",
};

// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================
export default function AdminMaterias() {
  const year = localStorage.getItem("adm:year") || String(new Date().getFullYear());
  const nivelGlobal = (localStorage.getItem("adm:nivel") as NivelKey) || "primaria";

  // Estado
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterNivel, setFilterNivel] = useState<NivelKey | "todos">(nivelGlobal);
  const [filterCurso, setFilterCurso] = useState<string>("todos");
  const [filterArea, setFilterArea] = useState<string>("todos");
  const [filterActivo, setFilterActivo] = useState<"todos" | "activo" | "inactivo">("todos");

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Materia | null>(null);

  // Form
  const [form, setForm] = useState({
    codigo: "",
    nombre: "",
    descripcion: "",
    nivel: nivelGlobal as NivelKey,
    curso: CURSOS_POR_NIVEL[nivelGlobal][0],
    area: AREAS_POR_NIVEL[nivelGlobal][0],
    horasSemanales: 4,
    activo: true,
    competencias: [""],
  });

  // Cargar datos al montar
  useEffect(() => {
    let data = loadMaterias();
    if (data.length === 0) {
      // Generar datos iniciales desde catálogo Bolivia
      data = generarMateriasIniciales();
      saveMaterias(data);
      console.log("[Materias] Generadas materias iniciales:", data.length);
    }
    setMaterias(data);
  }, []);

  // Cursos disponibles según nivel seleccionado
  const cursosDisponibles = useMemo(() => {
    if (filterNivel === "todos") {
      return [...CURSOS_POR_NIVEL.inicial, ...CURSOS_POR_NIVEL.primaria, ...CURSOS_POR_NIVEL.secundaria];
    }
    return [...CURSOS_POR_NIVEL[filterNivel]];
  }, [filterNivel]);

  // Áreas disponibles según nivel del form
  const areasForm = useMemo(() => {
    return [...AREAS_POR_NIVEL[form.nivel]];
  }, [form.nivel]);

  const cursosForm = useMemo(() => {
    return [...CURSOS_POR_NIVEL[form.nivel]];
  }, [form.nivel]);

  // Áreas únicas de materias existentes
  const areasUnicas = useMemo(() => {
    return Array.from(new Set(materias.map(m => m.area))).sort();
  }, [materias]);

  // Filtrar materias
  const filtered = useMemo(() => {
    return materias.filter(m => {
      const matchQ = `${m.codigo} ${m.nombre} ${m.descripcion} ${m.area}`.toLowerCase().includes(searchTerm.toLowerCase());
      const matchNivel = filterNivel === "todos" || m.nivel === filterNivel;
      const matchCurso = filterCurso === "todos" || m.curso === filterCurso;
      const matchArea = filterArea === "todos" || m.area === filterArea;
      const matchActivo = filterActivo === "todos" || (filterActivo === "activo" ? m.activo : !m.activo);
      return matchQ && matchNivel && matchCurso && matchArea && matchActivo;
    });
  }, [materias, searchTerm, filterNivel, filterCurso, filterArea, filterActivo]);

  // Estadísticas
  const stats = useMemo(() => {
    const total = materias.length;
    const activas = materias.filter(m => m.activo).length;
    const porNivel = {
      inicial: materias.filter(m => m.nivel === "inicial").length,
      primaria: materias.filter(m => m.nivel === "primaria").length,
      secundaria: materias.filter(m => m.nivel === "secundaria").length,
    };
    const horasTotales = materias.filter(m => m.activo).reduce((sum, m) => sum + m.horasSemanales, 0);
    return { total, activas, inactivas: total - activas, porNivel, horasTotales };
  }, [materias]);

  // Handlers
  const save = (next: Materia[]) => {
    setMaterias(next);
    saveMaterias(next);
  };

  const openCreate = () => {
    setEditing(null);
    setForm({
      codigo: "",
      nombre: "",
      descripcion: "",
      nivel: filterNivel === "todos" ? "primaria" : filterNivel,
      curso: filterNivel === "todos" ? CURSOS_POR_NIVEL.primaria[0] : CURSOS_POR_NIVEL[filterNivel][0],
      area: filterNivel === "todos" ? AREAS_POR_NIVEL.primaria[0] : AREAS_POR_NIVEL[filterNivel][0],
      horasSemanales: 4,
      activo: true,
      competencias: [""],
    });
    setModalOpen(true);
  };

  const openEdit = (m: Materia) => {
    setEditing(m);
    setForm({
      codigo: m.codigo,
      nombre: m.nombre,
      descripcion: m.descripcion,
      nivel: m.nivel,
      curso: m.curso,
      area: m.area,
      horasSemanales: m.horasSemanales,
      activo: m.activo,
      competencias: m.competencias.length > 0 ? m.competencias : [""],
    });
    setModalOpen(true);
  };

  const handleNivelChange = (nivel: NivelKey) => {
    setForm({
      ...form,
      nivel,
      curso: CURSOS_POR_NIVEL[nivel][0],
      area: AREAS_POR_NIVEL[nivel][0],
    });
  };

  const addCompetencia = () => {
    setForm({ ...form, competencias: [...form.competencias, ""] });
  };

  const updateCompetencia = (idx: number, value: string) => {
    const next = [...form.competencias];
    next[idx] = value;
    setForm({ ...form, competencias: next });
  };

  const removeCompetencia = (idx: number) => {
    const next = form.competencias.filter((_, i) => i !== idx);
    setForm({ ...form, competencias: next.length > 0 ? next : [""] });
  };

  const onSubmit = () => {
    if (!form.nombre.trim()) {
      alert("El nombre es requerido");
      return;
    }

    const competenciasValidas = form.competencias.filter(c => c.trim() !== "");
    const fecha = new Date().toISOString().split("T")[0];

    if (editing) {
      const updated: Materia = {
        ...editing,
        ...form,
        competencias: competenciasValidas,
        fechaModificacion: fecha,
      };
      const next = materias.map(m => m.id === editing.id ? updated : m);
      save(next);
      pushAudit("materia:update", { id: editing.id, nombre: form.nombre });
    } else {
      const id = materias.length > 0 ? Math.max(...materias.map(m => m.id)) + 1 : 1;
      const codigo = form.codigo || `MAT-${form.nivel.toUpperCase().slice(0, 3)}-${String(id).padStart(3, "0")}`;
      const nuevo: Materia = {
        id,
        codigo,
        nombre: form.nombre,
        descripcion: form.descripcion,
        nivel: form.nivel,
        curso: form.curso,
        area: form.area,
        horasSemanales: form.horasSemanales,
        activo: form.activo,
        competencias: competenciasValidas,
        fechaCreacion: fecha,
      };
      save([nuevo, ...materias]);
      pushAudit("materia:create", { id, nombre: form.nombre });
    }
    setModalOpen(false);
  };

  const toggleActivo = (id: number) => {
    const next = materias.map(m => m.id === id ? { ...m, activo: !m.activo } : m);
    save(next);
    pushAudit("materia:toggle", { id });
  };

  const remove = (id: number) => {
    if (!confirm("¿Eliminar esta materia?")) return;
    const next = materias.filter(m => m.id !== id);
    save(next);
    pushAudit("materia:delete", { id });
  };

  const regenerar = () => {
    if (!confirm("¿Regenerar todas las materias desde el catálogo Bolivia?\nEsto eliminará las materias personalizadas.")) return;
    const data = generarMateriasIniciales();
    save(data);
    pushAudit("materia:regenerar", { count: data.length });
  };

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <BookOpen className="h-6 w-6 text-blue-600" />
        <h1 className="text-2xl font-bold">Materias — Gestión {year}</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-sm text-muted-foreground">Total</div>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-sm text-muted-foreground">Activas</div>
            <div className="text-2xl font-bold text-green-600">{stats.activas}</div>
          </CardContent>
        </Card>
        <Card className={nivelColor.inicial}>
          <CardContent className="pt-4">
            <div className="text-sm">Inicial</div>
            <div className="text-xl font-bold">{stats.porNivel.inicial}</div>
          </CardContent>
        </Card>
        <Card className={nivelColor.primaria}>
          <CardContent className="pt-4">
            <div className="text-sm">Primaria</div>
            <div className="text-xl font-bold">{stats.porNivel.primaria}</div>
          </CardContent>
        </Card>
        <Card className={nivelColor.secundaria}>
          <CardContent className="pt-4">
            <div className="text-sm">Secundaria</div>
            <div className="text-xl font-bold">{stats.porNivel.secundaria}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-4 flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-8 w-[220px]"
              placeholder="Buscar materia..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          <Select value={filterNivel} onValueChange={v => { setFilterNivel(v as any); setFilterCurso("todos"); }}>
            <SelectTrigger className="w-[140px]"><SelectValue placeholder="Nivel" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los niveles</SelectItem>
              {NIVELES.map(n => (
                <SelectItem key={n} value={n}>{n.charAt(0).toUpperCase() + n.slice(1)}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterCurso} onValueChange={setFilterCurso}>
            <SelectTrigger className="w-[160px]"><SelectValue placeholder="Curso" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los cursos</SelectItem>
              {cursosDisponibles.map(c => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterArea} onValueChange={setFilterArea}>
            <SelectTrigger className="w-[200px]"><SelectValue placeholder="Área" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todas las áreas</SelectItem>
              {areasUnicas.map(a => (
                <SelectItem key={a} value={a}>{a}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterActivo} onValueChange={v => setFilterActivo(v as any)}>
            <SelectTrigger className="w-[120px]"><SelectValue placeholder="Estado" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="activo">Activas</SelectItem>
              <SelectItem value="inactivo">Inactivas</SelectItem>
            </SelectContent>
          </Select>

          <div className="ml-auto flex gap-2">
            <Button variant="outline" onClick={regenerar} title="Regenerar desde catálogo Bolivia">
              <RefreshCw className="h-4 w-4 mr-1" /> Regenerar
            </Button>
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4 mr-1" /> Nueva Materia
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabla */}
      <Card>
        <CardHeader>
          <CardTitle>Listado de Materias ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Nivel</TableHead>
                <TableHead>Curso</TableHead>
                <TableHead>Área</TableHead>
                <TableHead>Horas/Sem</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(m => (
                <TableRow key={m.id}>
                  <TableCell className="font-mono text-xs">{m.codigo}</TableCell>
                  <TableCell className="font-medium">{m.nombre}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={nivelColor[m.nivel]}>
                      {m.nivel.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>{m.curso}</TableCell>
                  <TableCell className="text-sm max-w-[200px] truncate" title={m.area}>{m.area}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant="secondary">{m.horasSemanales}h</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={m.activo ? "default" : "outline"}
                      className={m.activo ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}
                    >
                      {m.activo ? "Activa" : "Inactiva"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button size="sm" variant="ghost" onClick={() => toggleActivo(m.id)} title="Cambiar estado">
                      {m.activo ? <XCircle className="h-4 w-4 text-red-500" /> : <CheckCircle className="h-4 w-4 text-green-500" />}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => openEdit(m)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => remove(m.id)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                    No hay materias que coincidan con los filtros
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modal Crear/Editar */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookText className="h-5 w-5" />
              {editing ? "Editar Materia" : "Nueva Materia"}
            </DialogTitle>
            <DialogDescription>
              {editing ? "Modifica los datos de la materia" : "Completa los datos para crear una nueva materia"}
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label>Código</Label>
              <Input
                placeholder="Auto-generado si se deja vacío"
                value={form.codigo}
                onChange={e => setForm({ ...form, codigo: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Nombre *</Label>
              <Input
                placeholder="Ej: Matemática, Comunicación..."
                value={form.nombre}
                onChange={e => setForm({ ...form, nombre: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Nivel Educativo *</Label>
              <Select value={form.nivel} onValueChange={v => handleNivelChange(v as NivelKey)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {NIVELES.map(n => (
                    <SelectItem key={n} value={n}>{n.charAt(0).toUpperCase() + n.slice(1)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Curso *</Label>
              <Select value={form.curso} onValueChange={v => setForm({ ...form, curso: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {cursosForm.map(c => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Área de Conocimiento *</Label>
              <Select value={form.area} onValueChange={v => setForm({ ...form, area: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {areasForm.map(a => (
                    <SelectItem key={a} value={a}>{a}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Horas Semanales</Label>
              <Input
                type="number"
                min={1}
                max={10}
                value={form.horasSemanales}
                onChange={e => setForm({ ...form, horasSemanales: parseInt(e.target.value) || 1 })}
              />
            </div>

            <div className="md:col-span-2 space-y-2">
              <Label>Descripción</Label>
              <Textarea
                placeholder="Descripción de la materia, objetivos..."
                value={form.descripcion}
                onChange={e => setForm({ ...form, descripcion: e.target.value })}
                rows={2}
              />
            </div>

            <div className="md:col-span-2 space-y-2">
              <div className="flex items-center justify-between">
                <Label>Competencias</Label>
                <Button type="button" variant="outline" size="sm" onClick={addCompetencia}>
                  <Plus className="h-3 w-3 mr-1" /> Agregar
                </Button>
              </div>
              <div className="space-y-2">
                {form.competencias.map((c, i) => (
                  <div key={i} className="flex gap-2">
                    <Input
                      placeholder={`Competencia ${i + 1}...`}
                      value={c}
                      onChange={e => updateCompetencia(i, e.target.value)}
                    />
                    {form.competencias.length > 1 && (
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeCompetencia(i)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Estado</Label>
              <div className="flex items-center gap-2 pt-2">
                <Switch
                  checked={form.activo}
                  onCheckedChange={checked => setForm({ ...form, activo: checked })}
                />
                <span className={form.activo ? "text-green-600" : "text-red-600"}>
                  {form.activo ? "Activa" : "Inactiva"}
                </span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button onClick={onSubmit}>{editing ? "Actualizar" : "Crear"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
