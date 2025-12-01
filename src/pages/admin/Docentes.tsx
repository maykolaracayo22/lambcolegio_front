// src/pages/admin/Docentes.tsx
import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus, Edit, Trash2, Users, Info, Mail, Phone, Building, CheckCircle, XCircle, BookOpen, Filter, Shield } from "lucide-react";
import CrudFormDialog from "@/pages/admin/CrudFormDialog";
import { pushAudit } from "@/lib/audit";

type EstadoDoc = "VIGENTE" | "OBSERVADO";
type Estado = "activo" | "licencia" | "inactivo";

interface Docente {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  departamento: string;
  estado: Estado;
  // nuevos campos clave Bolivia
  ci: string;
  nro_rda: string;
  estado_rda: EstadoDoc;
}

const STORAGE_KEY = "adm:teachers";
const SEED_OLD = [
  { 
    id: 1, 
    nombre: "WILMA", 
    apellido: "BECERRA ROJAS", 
    email: "wbecerra@uepebenezer.edu.bo", 
    telefono: "591-71234567", 
    departamento: "Lenguaje", 
    estado: "activo",
    ci: "12345678",
    nro_rda: "RDA-001-2024",
    estado_rda: "VIGENTE"
  },
  { 
    id: 2, 
    nombre: "JHOSELIN", 
    apellido: "RAMOS CALLISAYA", 
    email: "jramos@uepebenezer.edu.bo", 
    telefono: "591-71234568", 
    departamento: "Ciencias Sociales", 
    estado: "activo",
    ci: "12345679",
    nro_rda: "RDA-002-2024",
    estado_rda: "VIGENTE"
  },
  { 
    id: 3, 
    nombre: "MARIA EUGENIA", 
    apellido: "MARISCAL ALCOCER", 
    email: "mmariscal@uepebenezer.edu.bo", 
    telefono: "591-71234569", 
    departamento: "Artes Plásticas Visuales", 
    estado: "activo",
    ci: "12345680",
    nro_rda: "RDA-003-2024",
    estado_rda: "VIGENTE"
  },
  { 
    id: 4, 
    nombre: "JHOSELIN", 
    apellido: "RAMOS CALLIZAYA", 
    email: "jramosc@uepebenezer.edu.bo", 
    telefono: "591-71234570", 
    departamento: "Ciencias Naturales", 
    estado: "activo",
    ci: "12345681",
    nro_rda: "RDA-004-2024",
    estado_rda: "VIGENTE"
  },
  { 
    id: 5, 
    nombre: "DANIELA", 
    apellido: "ANGULO MONTALVO", 
    email: "dangulo@uepebenezer.edu.bo", 
    telefono: "591-71234571", 
    departamento: "Técnica Tecnología", 
    estado: "activo",
    ci: "12345682",
    nro_rda: "RDA-005-2024",
    estado_rda: "VIGENTE"
  },
  { 
    id: 6, 
    nombre: "MARIA EUGENIA", 
    apellido: "MARISCAL ALCOCER", 
    email: "mmariscal.religion@uepebenezer.edu.bo", 
    telefono: "591-71234569", 
    departamento: "Religión", 
    estado: "activo",
    ci: "12345680",
    nro_rda: "RDA-006-2024",
    estado_rda: "VIGENTE"
  }
];
const migrate = (list: any[]): Docente[] => {
  return list.map((d, i) => ({
    id: Number(d.id ?? i + 1),
    nombre: d.nombre ?? d.nombres ?? "Nombre",
    apellido: d.apellido ?? d.apellidos ?? "Apellido",
    email: d.email ?? "",
    telefono: d.telefono ?? "",
    departamento: d.departamento ?? "General",
    estado: (d.estado as Estado) ?? "activo",
    ci: d.ci ?? "",
    nro_rda: d.nro_rda ?? "",
    estado_rda: (d.estado_rda as EstadoDoc) ?? "VIGENTE",
  }));
};

export default function AdminDocentes() {
  const [rows, setRows] = useState<Docente[]>([]);
  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) setRows(migrate(JSON.parse(raw)));
    else {
      const seeded = migrate(SEED_OLD);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
      setRows(seeded);
    }
  }, []);

  const save = (next: Docente[]) => {
    setRows(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const [searchTerm, setSearchTerm] = useState("");
  const [filterDepartamento, setFilterDepartamento] = useState("todos");
  const [filterEstado, setFilterEstado] = useState<Estado | "todos">("todos");
  const [filterRDA, setFilterRDA] = useState<EstadoDoc | "todos">("todos");

  const uniqueDepartamentos = useMemo(
    () => Array.from(new Set(rows.map((d) => d.departamento))).sort(),
    [rows]
  );

  const filtered = useMemo(() => {
    return rows.filter((d) => {
      const matchesQ = `${d.nombre} ${d.apellido} ${d.email} ${d.departamento} ${d.ci} ${d.nro_rda}`.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDep = filterDepartamento === "todos" || d.departamento === filterDepartamento;
      const matchesEstado = filterEstado === "todos" || d.estado === filterEstado;
      const matchesRDA = filterRDA === "todos" || d.estado_rda === filterRDA;
      return matchesQ && matchesDep && matchesEstado && matchesRDA;
    });
  }, [rows, searchTerm, filterDepartamento, filterEstado, filterRDA]);

  const stats = useMemo(() => {
    const total = rows.length;
    const activos = rows.filter((d) => d.estado === "activo").length;
    const licencia = rows.filter((d) => d.estado === "licencia").length;
    const inactivos = rows.filter((d) => d.estado === "inactivo").length;
    const rdaVig = rows.filter((d) => d.estado_rda === "VIGENTE").length;
    const rdaObs = rows.filter((d) => d.estado_rda === "OBSERVADO").length;
    return { total, activos, licencia, inactivos, rdaVig, rdaObs };
  }, [rows]);

  const getEstadoBadgeColors = (estado: Estado) => {
    switch (estado) {
      case "activo": return "bg-green-100 text-green-700";
      case "licencia": return "bg-orange-100 text-orange-700";
      case "inactivo": return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  // ---------- CRUD ----------
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Docente | null>(null);

  const openCreate = () => { setEditing(null); setOpen(true); };
  const openEdit = (row: Docente) => { setEditing(row); setOpen(true); };

  const fields = [
    { type: "text", name: "nombre", label: "Nombre", required: true },
    { type: "text", name: "apellido", label: "Apellido", required: true },
    { type: "text", name: "ci", label: "CI", required: true },
    { type: "text", name: "nro_rda", label: "RDA", required: true, note: "Obligatorio para asignaciones" },
    { type: "email", name: "email", label: "Email", required: true },
    { type: "text", name: "telefono", label: "Teléfono", required: true },
    { type: "text", name: "departamento", label: "Departamento", required: true },
    { type: "select", name: "estado_rda", label: "Estado RDA", options: [
      { value: "VIGENTE", label: "VIGENTE" },
      { value: "OBSERVADO", label: "OBSERVADO" },
    ]},
    { type: "select", name: "estado", label: "Estado", options: [
      { value: "activo", label: "Activo" },
      { value: "licencia", label: "En Licencia" },
      { value: "inactivo", label: "Inactivo" },
    ]},
  ] as const;

  const onSubmit = (vals: any) => {
    if (!vals.nombre?.trim() || !vals.apellido?.trim() || !vals.email?.trim() || !vals.ci?.trim() || !vals.nro_rda?.trim()) {
      alert("Completa Nombre, Apellido, CI, RDA y Email");
      return;
    }
    if (editing) {
      const next = rows.map(r => r.id === editing.id ? { ...editing, ...vals } : r);
      save(next); pushAudit("teacher:update", { id: editing.id, vals });
    } else {
      const id = rows.length ? Math.max(...rows.map(r => r.id)) + 1 : 1;
      const next = [{ id, ...vals } as Docente, ...rows];
      save(next); pushAudit("teacher:create", { id, vals });
    }
    setOpen(false);
  };

  const remove = (id: number) => {
    if (!confirm("¿Eliminar docente?")) return;
    const next = rows.filter(r => r.id !== id);
    save(next); pushAudit("teacher:delete", { id });
  };

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <BookOpen className="h-7 w-7 text-blue-600" />
            Gestión de Docentes
          </h1>
          <p className="text-muted-foreground">
            Administra la información del personal docente (CI, RDA y estado).
          </p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Añadir Nuevo Docente
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <Card><CardContent className="p-4 flex items-center justify-between">
          <div><p className="text-sm text-muted-foreground">Total de Docentes</p><p className="text-2xl font-bold">{stats.total}</p></div>
          <div className="p-2 bg-blue-100 rounded-full"><Users className="h-5 w-5 text-blue-600" /></div>
        </CardContent></Card>

        <Card><CardContent className="p-4 flex items-center justify-between">
          <div><p className="text-sm text-muted-foreground">Activos</p><p className="text-2xl font-bold text-green-600">{stats.activos}</p></div>
          <div className="p-2 bg-green-100 rounded-full"><CheckCircle className="h-5 w-5 text-green-600" /></div>
        </CardContent></Card>

        <Card><CardContent className="p-4 flex items-center justify-between">
          <div><p className="text-sm text-muted-foreground">En Licencia</p><p className="text-2xl font-bold text-orange-600">{stats.licencia}</p></div>
          <div className="p-2 bg-orange-100 rounded-full"><Info className="h-5 w-5 text-orange-600" /></div>
        </CardContent></Card>

        <Card><CardContent className="p-4 flex items-center justify-between">
          <div><p className="text-sm text-muted-foreground">Inactivos</p><p className="text-2xl font-bold text-red-600">{stats.inactivos}</p></div>
          <div className="p-2 bg-red-100 rounded-full"><XCircle className="h-5 w-5 text-red-600" /></div>
        </CardContent></Card>

        <Card><CardContent className="p-4 flex items-center justify-between">
          <div><p className="text-sm text-muted-foreground">RDA Vigentes</p><p className="text-2xl font-bold">{stats.rdaVig}</p></div>
          <div className="p-2 bg-purple-100 rounded-full"><Shield className="h-5 w-5 text-purple-700" /></div>
        </CardContent></Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full md:w-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar por nombre, email, CI, RDA o departamento…"
                className="pl-10 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
              <Select value={filterDepartamento} onValueChange={setFilterDepartamento}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <Building className="h-4 w-4 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="Departamento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los departamentos</SelectItem>
                  {uniqueDepartamentos.map((dep) => (
                    <SelectItem key={dep} value={dep}>{dep}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterEstado} onValueChange={(v) => setFilterEstado(v as Estado | "todos")}>
                <SelectTrigger className="w-full sm:w-[150px]">
                  <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="activo">Activo</SelectItem>
                  <SelectItem value="licencia">En Licencia</SelectItem>
                  <SelectItem value="inactivo">Inactivo</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterRDA} onValueChange={(v) => setFilterRDA(v as EstadoDoc | "todos")}>
                <SelectTrigger className="w-full sm:w-[170px]">
                  <Shield className="h-4 w-4 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="Estado RDA" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="VIGENTE">RDA Vigente</SelectItem>
                  <SelectItem value="OBSERVADO">RDA Observado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla */}
      <Card>
        <CardHeader>
          <CardTitle>Listado de Docentes</CardTitle>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Info className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>No se encontraron docentes que coincidan con los filtros.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>CI</TableHead>
                    <TableHead>RDA</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Teléfono</TableHead>
                    <TableHead>Departamento</TableHead>
                    <TableHead>RDA</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((d) => (
                    <TableRow key={d.id}>
                      <TableCell className="font-medium">{d.nombre} {d.apellido}</TableCell>
                      <TableCell className="font-mono text-xs">{d.ci}</TableCell>
                      <TableCell className="font-mono text-xs">{d.nro_rda}</TableCell>
                      <TableCell>
                        <a className="text-blue-600 hover:underline flex items-center gap-1" href={`mailto:${d.email}`}>
                          <Mail className="h-4 w-4" /> {d.email}
                        </a>
                      </TableCell>
                      <TableCell>
                        <a className="text-blue-600 hover:underline flex items-center gap-1" href={`tel:${d.telefono}`}>
                          <Phone className="h-4 w-4" /> {d.telefono}
                        </a>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="bg-gray-100 text-gray-700">
                          <Building className="h-3 w-3 mr-1" /> {d.departamento}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={d.estado_rda === "VIGENTE" ? "bg-purple-100 text-purple-700" : "bg-yellow-100 text-yellow-700"}>
                          {d.estado_rda}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getEstadoBadgeColors(d.estado)}>
                          {d.estado === "licencia" ? "En Licencia" : d.estado.charAt(0).toUpperCase() + d.estado.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" className="mr-1" onClick={() => openEdit(d)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => remove(d.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogo Crear/Editar */}
      <CrudFormDialog
        open={open}
        onOpenChange={setOpen}
        title={editing ? "Editar Docente" : "Nuevo Docente"}
        description="Completa la información del docente."
        fields={fields as any}
        initialValues={editing ?? { nombre:"", apellido:"", ci:"", nro_rda:"", email:"", telefono:"", departamento:"", estado:"activo", estado_rda:"VIGENTE" }}
        onSubmit={onSubmit}
        submitLabel={editing ? "Actualizar" : "Crear"}
      />
    </div>
  );
}
