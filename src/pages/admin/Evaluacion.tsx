import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  ClipboardList, Save, RefreshCw, AlertTriangle, Plus, Trash2, Edit, 
  BookOpen, CheckCircle, Info, Settings, GraduationCap, Star, Heart, 
  Lightbulb, Hand, Target, Baby, School, Building, Copy, ChevronRight
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type NivelKey = "inicial" | "primaria" | "secundaria";

// Estructura de niveles y sub-niveles del sistema boliviano
interface SubNivel {
  id: string;
  nombre: string;
  descripcion: string;
}

interface NivelEducativo {
  id: NivelKey;
  nombre: string;
  descripcion: string;
  icon: React.ReactNode;
  color: string;
  subNiveles: SubNivel[];
}

// Sistema de evaluación boliviano Ley 070
interface DimensionEvaluacion {
  id: string;
  nombre: string;
  descripcion: string;
  pesoMax: number;
  color: string;
  icon: string;
}

interface CriterioEvaluacion {
  id: string;
  dimension: string;
  nombre: string;
  descripcion: string;
  puntajeMax: number;
  activo: boolean;
}

interface ConfiguracionEvaluacion {
  year: number;
  nivel: NivelKey;
  subNivel: string;
  trimestre: string;
  dimensiones: DimensionEvaluacion[];
  criterios: CriterioEvaluacion[];
  autoevaluacionPeso: number;
  escalaAprobacion: number;
}

// Niveles educativos del sistema boliviano
const NIVELES_EDUCATIVOS: NivelEducativo[] = [
  {
    id: "inicial",
    nombre: "Educación Inicial",
    descripcion: "Educación en Familia Comunitaria",
    icon: <Baby className="h-5 w-5" />,
    color: "bg-pink-100 text-pink-700 border-pink-300",
    subNiveles: [
      { id: "1ra_seccion", nombre: "1ra Sección (4 años)", descripcion: "Primera sección de educación inicial" },
      { id: "2da_seccion", nombre: "2da Sección (5 años)", descripcion: "Segunda sección de educación inicial" },
    ]
  },
  {
    id: "primaria",
    nombre: "Educación Primaria",
    descripcion: "Educación Comunitaria Vocacional",
    icon: <School className="h-5 w-5" />,
    color: "bg-blue-100 text-blue-700 border-blue-300",
    subNiveles: [
      { id: "1ro_primaria", nombre: "1° de Primaria", descripcion: "Primer año de primaria" },
      { id: "2do_primaria", nombre: "2° de Primaria", descripcion: "Segundo año de primaria" },
      { id: "3ro_primaria", nombre: "3° de Primaria", descripcion: "Tercer año de primaria" },
      { id: "4to_primaria", nombre: "4° de Primaria", descripcion: "Cuarto año de primaria" },
      { id: "5to_primaria", nombre: "5° de Primaria", descripcion: "Quinto año de primaria" },
      { id: "6to_primaria", nombre: "6° de Primaria", descripcion: "Sexto año de primaria" },
    ]
  },
  {
    id: "secundaria",
    nombre: "Educación Secundaria",
    descripcion: "Educación Comunitaria Productiva",
    icon: <Building className="h-5 w-5" />,
    color: "bg-green-100 text-green-700 border-green-300",
    subNiveles: [
      { id: "1ro_secundaria", nombre: "1° de Secundaria", descripcion: "Primer año de secundaria" },
      { id: "2do_secundaria", nombre: "2° de Secundaria", descripcion: "Segundo año de secundaria" },
      { id: "3ro_secundaria", nombre: "3° de Secundaria", descripcion: "Tercer año de secundaria" },
      { id: "4to_secundaria", nombre: "4° de Secundaria", descripcion: "Cuarto año de secundaria" },
      { id: "5to_secundaria", nombre: "5° de Secundaria", descripcion: "Quinto año de secundaria" },
      { id: "6to_secundaria", nombre: "6° de Secundaria", descripcion: "Sexto año de secundaria" },
    ]
  }
];

// Dimensiones del sistema boliviano Ley 070
const DIMENSIONES_BOLIVIA: DimensionEvaluacion[] = [
  { 
    id: "SER", 
    nombre: "SER", 
    descripcion: "Desarrollo de principios, valores, identidad y espiritualidad",
    pesoMax: 5, 
    color: "bg-blue-100 text-blue-700 border-blue-300",
    icon: "Heart"
  },
  { 
    id: "SABER", 
    nombre: "SABER", 
    descripcion: "Desarrollo de conocimientos teóricos y saberes",
    pesoMax: 45, 
    color: "bg-purple-100 text-purple-700 border-purple-300",
    icon: "BookOpen"
  },
  { 
    id: "HACER", 
    nombre: "HACER", 
    descripcion: "Desarrollo de capacidades, habilidades y destrezas",
    pesoMax: 40, 
    color: "bg-orange-100 text-orange-700 border-orange-300",
    icon: "Hand"
  },
  { 
    id: "DECIDIR", 
    nombre: "DECIDIR", 
    descripcion: "Desarrollo de responsabilidad social y toma de decisiones",
    pesoMax: 5, 
    color: "bg-pink-100 text-pink-700 border-pink-300",
    icon: "Target"
  },
];

// Criterios por defecto para cada dimensión
const CRITERIOS_DEFAULT: CriterioEvaluacion[] = [
  // SER (5 puntos)
  { id: "ser_1", dimension: "SER", nombre: "Puntualidad y asistencia", descripcion: "Asiste puntualmente a clases", puntajeMax: 1, activo: true },
  { id: "ser_2", dimension: "SER", nombre: "Respeto y convivencia", descripcion: "Muestra respeto hacia compañeros y docentes", puntajeMax: 1, activo: true },
  { id: "ser_3", dimension: "SER", nombre: "Responsabilidad", descripcion: "Cumple con tareas y compromisos", puntajeMax: 1, activo: true },
  { id: "ser_4", dimension: "SER", nombre: "Valores culturales", descripcion: "Practica valores culturales bolivianos", puntajeMax: 1, activo: true },
  { id: "ser_5", dimension: "SER", nombre: "Identidad", descripcion: "Muestra identidad y pertenencia", puntajeMax: 1, activo: true },
  
  // SABER (45 puntos)
  { id: "saber_1", dimension: "SABER", nombre: "Participación en clase", descripcion: "Participa activamente en diálogos", puntajeMax: 10, activo: true },
  { id: "saber_2", dimension: "SABER", nombre: "Comprensión de contenidos", descripcion: "Demuestra comprensión de temas", puntajeMax: 10, activo: true },
  { id: "saber_3", dimension: "SABER", nombre: "Investigación", descripcion: "Realiza investigaciones complementarias", puntajeMax: 10, activo: true },
  { id: "saber_4", dimension: "SABER", nombre: "Examen trimestral", descripcion: "Evaluación escrita trimestral", puntajeMax: 15, activo: true },
  
  // HACER (40 puntos)
  { id: "hacer_1", dimension: "HACER", nombre: "Trabajos prácticos", descripcion: "Realiza trabajos prácticos", puntajeMax: 15, activo: true },
  { id: "hacer_2", dimension: "HACER", nombre: "Exposiciones", descripcion: "Presenta exposiciones", puntajeMax: 10, activo: true },
  { id: "hacer_3", dimension: "HACER", nombre: "Proyectos", descripcion: "Desarrolla proyectos educativos", puntajeMax: 10, activo: true },
  { id: "hacer_4", dimension: "HACER", nombre: "Aplicación práctica", descripcion: "Aplica conocimientos en la práctica", puntajeMax: 5, activo: true },
  
  // DECIDIR (5 puntos)
  { id: "decidir_1", dimension: "DECIDIR", nombre: "Autoevaluación", descripcion: "Capacidad de autoevaluarse", puntajeMax: 2, activo: true },
  { id: "decidir_2", dimension: "DECIDIR", nombre: "Solidaridad", descripcion: "Muestra solidaridad con compañeros", puntajeMax: 1, activo: true },
  { id: "decidir_3", dimension: "DECIDIR", nombre: "Compromiso social", descripcion: "Participa en actividades sociales", puntajeMax: 1, activo: true },
  { id: "decidir_4", dimension: "DECIDIR", nombre: "Iniciativa", descripcion: "Toma iniciativas para mejorar", puntajeMax: 1, activo: true },
];

// Criterios especiales para inicial (más simples)
const CRITERIOS_INICIAL: CriterioEvaluacion[] = [
  // SER (5 puntos)
  { id: "ser_1", dimension: "SER", nombre: "Asistencia", descripcion: "Asiste regularmente", puntajeMax: 2, activo: true },
  { id: "ser_2", dimension: "SER", nombre: "Comportamiento", descripcion: "Muestra buen comportamiento", puntajeMax: 3, activo: true },
  
  // SABER (45 puntos)
  { id: "saber_1", dimension: "SABER", nombre: "Reconocimiento de colores", descripcion: "Identifica colores básicos", puntajeMax: 15, activo: true },
  { id: "saber_2", dimension: "SABER", nombre: "Reconocimiento de formas", descripcion: "Identifica formas geométricas", puntajeMax: 15, activo: true },
  { id: "saber_3", dimension: "SABER", nombre: "Expresión oral", descripcion: "Se comunica oralmente", puntajeMax: 15, activo: true },
  
  // HACER (40 puntos)
  { id: "hacer_1", dimension: "HACER", nombre: "Motricidad fina", descripcion: "Desarrolla habilidades motrices finas", puntajeMax: 20, activo: true },
  { id: "hacer_2", dimension: "HACER", nombre: "Motricidad gruesa", descripcion: "Desarrolla habilidades motrices gruesas", puntajeMax: 20, activo: true },
  
  // DECIDIR (5 puntos)
  { id: "decidir_1", dimension: "DECIDIR", nombre: "Socialización", descripcion: "Interactúa con compañeros", puntajeMax: 3, activo: true },
  { id: "decidir_2", dimension: "DECIDIR", nombre: "Autonomía", descripcion: "Muestra independencia", puntajeMax: 2, activo: true },
];

const keyEval = (year: string, nivel: NivelKey, subNivel: string, term: string) => 
  `adm:eval:${year}:${nivel}:${subNivel}:${term}`;

export default function EvaluacionAdmin() {
  const { toast } = useToast();
  const year = localStorage.getItem("adm:year") || String(new Date().getFullYear());
  const [nivel, setNivel] = useState<NivelKey>((localStorage.getItem("adm:nivel") as NivelKey) || "primaria");
  const [subNivel, setSubNivel] = useState<string>("");
  const [term, setTerm] = useState(localStorage.getItem("adm:term") || "T1");
  const [activeTab, setActiveTab] = useState("niveles");

  // Estado de configuración
  const [dimensiones, setDimensiones] = useState<DimensionEvaluacion[]>(DIMENSIONES_BOLIVIA);
  const [criterios, setCriterios] = useState<CriterioEvaluacion[]>([]);
  const [autoevaluacionPeso, setAutoevaluacionPeso] = useState(5);
  const [escalaAprobacion, setEscalaAprobacion] = useState(51);

  // Modal para editar criterio
  const [showCriterioDialog, setShowCriterioDialog] = useState(false);
  const [editingCriterio, setEditingCriterio] = useState<CriterioEvaluacion | null>(null);
  const [criterioForm, setCriterioForm] = useState({
    dimension: "SER",
    nombre: "",
    descripcion: "",
    puntajeMax: 1,
  });

  // Modal para copiar configuración
  const [showCopyDialog, setShowCopyDialog] = useState(false);
  const [copyTarget, setCopyTarget] = useState({ nivel: "primaria" as NivelKey, subNivel: "" });

  // Obtener nivel actual
  const nivelActual = useMemo(() => 
    NIVELES_EDUCATIVOS.find(n => n.id === nivel), [nivel]);

  // Obtener subniveles del nivel seleccionado
  const subNivelesDisponibles = useMemo(() => 
    nivelActual?.subNiveles || [], [nivelActual]);

  // Inicializar subNivel cuando cambia el nivel
  useEffect(() => {
    if (subNivelesDisponibles.length > 0 && !subNivel) {
      setSubNivel(subNivelesDisponibles[0].id);
    }
  }, [subNivelesDisponibles, subNivel]);

  // Cargar configuración
  useEffect(() => {
    if (!subNivel) return;
    
    const raw = localStorage.getItem(keyEval(year, nivel, subNivel, term));
    if (raw) {
      try {
        const config: ConfiguracionEvaluacion = JSON.parse(raw);
        setDimensiones(config.dimensiones || DIMENSIONES_BOLIVIA);
        setCriterios(config.criterios || (nivel === "inicial" ? CRITERIOS_INICIAL : CRITERIOS_DEFAULT));
        setAutoevaluacionPeso(config.autoevaluacionPeso ?? 5);
        setEscalaAprobacion(config.escalaAprobacion ?? 51);
      } catch {
        setCriterios(nivel === "inicial" ? CRITERIOS_INICIAL : CRITERIOS_DEFAULT);
      }
    } else {
      // Usar criterios por defecto según el nivel
      setCriterios(nivel === "inicial" ? CRITERIOS_INICIAL : CRITERIOS_DEFAULT);
    }
  }, [year, nivel, subNivel, term]);

  // Calcular totales por dimensión
  const totalesPorDimension = useMemo(() => {
    const totales: Record<string, number> = {};
    dimensiones.forEach(d => { totales[d.id] = 0; });
    criterios.filter(c => c.activo).forEach(c => {
      if (totales[c.dimension] !== undefined) {
        totales[c.dimension] += c.puntajeMax;
      }
    });
    return totales;
  }, [criterios, dimensiones]);

  const totalGeneral = useMemo(() => {
    return Object.values(totalesPorDimension).reduce((a, b) => a + b, 0) + autoevaluacionPeso;
  }, [totalesPorDimension, autoevaluacionPeso]);

  const is100 = totalGeneral === 100;

  // Guardar configuración
  const guardar = () => {
    if (!is100) {
      toast({
        title: "Error",
        description: "El total debe ser exactamente 100 puntos",
        variant: "destructive",
      });
      return;
    }

    if (!subNivel) {
      toast({
        title: "Error",
        description: "Selecciona un grado/sección",
        variant: "destructive",
      });
      return;
    }

    const config: ConfiguracionEvaluacion = {
      year: parseInt(year),
      nivel,
      subNivel,
      trimestre: term,
      dimensiones,
      criterios,
      autoevaluacionPeso,
      escalaAprobacion,
    };

    localStorage.setItem(keyEval(year, nivel, subNivel, term), JSON.stringify(config));
    
    // Auditoría
    const auditKey = "adm:audit";
    const log = JSON.parse(localStorage.getItem(auditKey) || "[]");
    log.unshift({ 
      id: Date.now(), 
      date: new Date().toISOString(), 
      action: "eval:save", 
      meta: { year, nivel, subNivel, term, totalGeneral } 
    });
    localStorage.setItem(auditKey, JSON.stringify(log));

    toast({
      title: "✅ Configuración guardada",
      description: `Estructura de evaluación para ${nivelActual?.nombre} - ${subNivelesDisponibles.find(s => s.id === subNivel)?.nombre} ${term} guardada correctamente`,
    });
  };

  // Restablecer valores por defecto
  const reset = () => {
    setDimensiones(DIMENSIONES_BOLIVIA);
    setCriterios(nivel === "inicial" ? CRITERIOS_INICIAL : CRITERIOS_DEFAULT);
    setAutoevaluacionPeso(5);
    setEscalaAprobacion(51);
    toast({
      title: "Restablecido",
      description: "Se han restaurado los valores por defecto del sistema boliviano",
    });
  };

  // Copiar configuración a otro nivel/grado
  const copiarConfiguracion = () => {
    if (!copyTarget.subNivel) {
      toast({ title: "Error", description: "Selecciona el grado destino", variant: "destructive" });
      return;
    }

    const config: ConfiguracionEvaluacion = {
      year: parseInt(year),
      nivel: copyTarget.nivel,
      subNivel: copyTarget.subNivel,
      trimestre: term,
      dimensiones,
      criterios,
      autoevaluacionPeso,
      escalaAprobacion,
    };

    localStorage.setItem(keyEval(year, copyTarget.nivel, copyTarget.subNivel, term), JSON.stringify(config));
    
    const targetNivel = NIVELES_EDUCATIVOS.find(n => n.id === copyTarget.nivel);
    const targetSubNivel = targetNivel?.subNiveles.find(s => s.id === copyTarget.subNivel);
    
    toast({
      title: "✅ Configuración copiada",
      description: `Configuración copiada a ${targetNivel?.nombre} - ${targetSubNivel?.nombre}`,
    });
    
    setShowCopyDialog(false);
  };

  // Abrir dialog para nuevo criterio
  const openNewCriterio = (dimension: string) => {
    setEditingCriterio(null);
    setCriterioForm({
      dimension,
      nombre: "",
      descripcion: "",
      puntajeMax: 1,
    });
    setShowCriterioDialog(true);
  };

  // Abrir dialog para editar criterio
  const openEditCriterio = (criterio: CriterioEvaluacion) => {
    setEditingCriterio(criterio);
    setCriterioForm({
      dimension: criterio.dimension,
      nombre: criterio.nombre,
      descripcion: criterio.descripcion,
      puntajeMax: criterio.puntajeMax,
    });
    setShowCriterioDialog(true);
  };

  // Guardar criterio
  const saveCriterio = () => {
    if (!criterioForm.nombre.trim()) {
      toast({ title: "Error", description: "El nombre es requerido", variant: "destructive" });
      return;
    }

    if (editingCriterio) {
      setCriterios(prev => prev.map(c => 
        c.id === editingCriterio.id 
          ? { ...c, ...criterioForm }
          : c
      ));
    } else {
      const newCriterio: CriterioEvaluacion = {
        id: `${criterioForm.dimension.toLowerCase()}_${Date.now()}`,
        ...criterioForm,
        activo: true,
      };
      setCriterios(prev => [...prev, newCriterio]);
    }

    setShowCriterioDialog(false);
    toast({ title: "Criterio guardado" });
  };

  // Eliminar criterio
  const deleteCriterio = (id: string) => {
    if (!confirm("¿Eliminar este criterio?")) return;
    setCriterios(prev => prev.filter(c => c.id !== id));
  };

  // Toggle activo
  const toggleCriterio = (id: string) => {
    setCriterios(prev => prev.map(c => 
      c.id === id ? { ...c, activo: !c.activo } : c
    ));
  };

  // Actualizar puntaje de criterio
  const updatePuntaje = (id: string, value: number) => {
    setCriterios(prev => prev.map(c => 
      c.id === id ? { ...c, puntajeMax: Math.max(0, Math.min(50, value)) } : c
    ));
  };

  // Icono por dimensión
  const getDimensionIcon = (iconName: string) => {
    switch (iconName) {
      case "Heart": return <Heart className="h-5 w-5" />;
      case "BookOpen": return <BookOpen className="h-5 w-5" />;
      case "Hand": return <Hand className="h-5 w-5" />;
      case "Target": return <Target className="h-5 w-5" />;
      default: return <Star className="h-5 w-5" />;
    }
  };

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ClipboardList className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold">Estructura de Evaluación — Gestión {year}</h1>
        </div>
        <Badge variant="outline" className="text-sm">
          <GraduationCap className="h-4 w-4 mr-1" />
          Sistema Educativo Boliviano - Ley 070
        </Badge>
      </div>

      {/* Info del sistema boliviano */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-blue-800">Sistema de Evaluación Holístico</h4>
              <p className="text-sm text-blue-700 mt-1">
                La evaluación integral se basa en las 4 dimensiones: <strong>SER</strong> (valores), 
                <strong> SABER</strong> (conocimientos), <strong> HACER</strong> (habilidades) y 
                <strong> DECIDIR</strong> (responsabilidad). Total: 100 puntos. Mínimo aprobatorio: {escalaAprobacion} puntos.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs principales */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="niveles">
            <School className="h-4 w-4 mr-2" /> Niveles y Grados
          </TabsTrigger>
          <TabsTrigger value="dimensiones" disabled={!subNivel}>
            <Settings className="h-4 w-4 mr-2" /> Dimensiones
          </TabsTrigger>
          <TabsTrigger value="criterios" disabled={!subNivel}>
            <ClipboardList className="h-4 w-4 mr-2" /> Criterios
          </TabsTrigger>
        </TabsList>

        {/* Tab: Selección de Niveles */}
        <TabsContent value="niveles">
          <div className="space-y-6">
            {/* Selector de Nivel Educativo */}
            <Card>
              <CardHeader>
                <CardTitle>Selecciona el Nivel Educativo</CardTitle>
                <CardDescription>
                  Elige el nivel y grado para configurar la estructura de evaluación
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {NIVELES_EDUCATIVOS.map(niv => (
                    <Card 
                      key={niv.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        nivel === niv.id 
                          ? `ring-2 ring-blue-500 ${niv.color}` 
                          : 'hover:border-gray-400'
                      }`}
                      onClick={() => {
                        setNivel(niv.id);
                        setSubNivel("");
                      }}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`p-2 rounded-full ${niv.color}`}>
                            {niv.icon}
                          </div>
                          <div>
                            <h3 className="font-semibold">{niv.nombre}</h3>
                            <p className="text-xs text-muted-foreground">{niv.descripcion}</p>
                          </div>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {niv.subNiveles.length} grados/secciones
                        </Badge>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Selector de Sub-Nivel/Grado */}
            {nivelActual && (
              <Card>
                <CardHeader className={nivelActual.color}>
                  <CardTitle className="flex items-center gap-2">
                    {nivelActual.icon}
                    {nivelActual.nombre} - Selecciona el Grado
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                    {subNivelesDisponibles.map(sub => (
                      <Card
                        key={sub.id}
                        className={`cursor-pointer transition-all hover:shadow-md text-center ${
                          subNivel === sub.id 
                            ? 'ring-2 ring-blue-500 bg-blue-50' 
                            : 'hover:border-gray-400'
                        }`}
                        onClick={() => setSubNivel(sub.id)}
                      >
                        <CardContent className="p-3">
                          <div className="font-medium text-sm">{sub.nombre}</div>
                          {subNivel === sub.id && (
                            <CheckCircle className="h-4 w-4 text-blue-600 mx-auto mt-1" />
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Selector de Trimestre */}
                  <div className="mt-6 flex flex-wrap gap-4 items-center border-t pt-4">
                    <div className="flex items-center gap-2">
                      <Label>Trimestre:</Label>
                      <Select value={term} onValueChange={setTerm}>
                        <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="T1">1er Trimestre</SelectItem>
                          <SelectItem value="T2">2do Trimestre</SelectItem>
                          <SelectItem value="T3">3er Trimestre</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center gap-2">
                      <Label>Mínimo aprobatorio:</Label>
                      <Input 
                        type="number" 
                        min={1} 
                        max={100} 
                        value={escalaAprobacion} 
                        onChange={(e) => setEscalaAprobacion(parseInt(e.target.value) || 51)} 
                        className="w-[80px]"
                      />
                      <span className="text-sm text-muted-foreground">puntos</span>
                    </div>

                    {subNivel && (
                      <div className="ml-auto flex gap-2">
                        <Button variant="outline" onClick={() => setShowCopyDialog(true)}>
                          <Copy className="h-4 w-4 mr-2" /> Copiar a otro grado
                        </Button>
                        <Button onClick={() => setActiveTab("dimensiones")}>
                          Configurar Evaluación <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Resumen de configuraciones existentes */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Resumen de Configuraciones</CardTitle>
                <CardDescription>Estado de las configuraciones por nivel y grado</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {NIVELES_EDUCATIVOS.map(niv => (
                    <div key={niv.id} className="border rounded-lg p-3">
                      <div className={`flex items-center gap-2 mb-2 ${niv.color} p-2 rounded`}>
                        {niv.icon}
                        <span className="font-semibold">{niv.nombre}</span>
                      </div>
                      <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                        {niv.subNiveles.map(sub => {
                          const hasConfig = localStorage.getItem(keyEval(year, niv.id, sub.id, term)) !== null;
                          return (
                            <div 
                              key={sub.id} 
                              className={`text-xs p-2 rounded text-center ${
                                hasConfig 
                                  ? 'bg-green-100 text-green-700 border border-green-300' 
                                  : 'bg-gray-100 text-gray-500'
                              }`}
                            >
                              {sub.nombre.replace(' de Primaria', '').replace(' de Secundaria', '').replace(' Sección', '')}
                              {hasConfig && <CheckCircle className="h-3 w-3 mx-auto mt-1" />}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab: Dimensiones */}
        <TabsContent value="dimensiones">
          {subNivel ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Distribución de Puntajes por Dimensión</CardTitle>
                    <CardDescription>
                      {nivelActual?.nombre} - {subNivelesDisponibles.find(s => s.id === subNivel)?.nombre} - {term}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={reset}>
                      <RefreshCw className="h-4 w-4 mr-2" /> Restablecer
                    </Button>
                    <Button onClick={guardar} disabled={!is100}>
                      <Save className="h-4 w-4 mr-2" /> Guardar
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {dimensiones.map(dim => {
                  const totalDim = totalesPorDimension[dim.id] || 0;
                  const criteriosDim = criterios.filter(c => c.dimension === dim.id && c.activo);
                  const isValid = totalDim === dim.pesoMax;

                  return (
                    <Card key={dim.id} className={`border-2 ${dim.color}`}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {getDimensionIcon(dim.icon)}
                            <span className="font-bold text-lg">{dim.nombre}</span>
                          </div>
                          <Badge variant={isValid ? "default" : "destructive"}>
                            {totalDim} / {dim.pesoMax} pts
                          </Badge>
                        </div>
                        <p className="text-sm opacity-80 mb-3">{dim.descripcion}</p>
                        <div className="text-xs">
                          <span className="font-medium">{criteriosDim.length} criterios activos</span>
                          {!isValid && (
                            <span className="text-red-600 ml-2">
                              ⚠️ Ajustar {totalDim < dim.pesoMax ? "+" : "-"}{Math.abs(dim.pesoMax - totalDim)} pts
                            </span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Autoevaluación */}
              <Card className="border-green-300 bg-green-50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Lightbulb className="h-5 w-5 text-green-600" />
                      <span className="font-bold">Autoevaluación</span>
                      <span className="text-sm text-muted-foreground">(El estudiante evalúa su propio desempeño)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input 
                        type="number" 
                        min={0} 
                        max={10} 
                        value={autoevaluacionPeso} 
                        onChange={(e) => setAutoevaluacionPeso(parseInt(e.target.value) || 0)} 
                        className="w-[80px]"
                      />
                      <span className="text-sm">puntos</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Total */}
              <div className="mt-6 p-4 rounded-lg bg-gray-100">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-lg">TOTAL GENERAL</span>
                  <span className={`text-2xl font-bold ${is100 ? "text-green-600" : "text-red-600"}`}>
                    {totalGeneral} / 100 puntos
                  </span>
                </div>
                {!is100 && (
                  <div className="flex items-center gap-2 text-red-600 text-sm mt-2">
                    <AlertTriangle className="h-4 w-4" />
                    Ajusta los puntajes hasta sumar exactamente 100 puntos
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          ) : (
            <Card className="text-center py-12">
              <CardContent>
                <School className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium mb-2">Selecciona un grado</h3>
                <p className="text-muted-foreground">
                  Primero selecciona el nivel y grado en la pestaña "Niveles y Grados"
                </p>
                <Button className="mt-4" onClick={() => setActiveTab("niveles")}>
                  Ir a Niveles y Grados
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Tab: Criterios */}
        <TabsContent value="criterios">
          {subNivel ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold">Criterios de Evaluación</h3>
                <p className="text-sm text-muted-foreground">
                  {nivelActual?.nombre} - {subNivelesDisponibles.find(s => s.id === subNivel)?.nombre} - {term}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={reset}>
                  <RefreshCw className="h-4 w-4 mr-2" /> Restablecer
                </Button>
                <Button onClick={guardar} disabled={!is100}>
                  <Save className="h-4 w-4 mr-2" /> Guardar
                </Button>
              </div>
            </div>
            {dimensiones.map(dim => {
              const criteriosDim = criterios.filter(c => c.dimension === dim.id);
              const totalDim = criteriosDim.filter(c => c.activo).reduce((s, c) => s + c.puntajeMax, 0);

              return (
                <Card key={dim.id}>
                  <CardHeader className={`${dim.color} rounded-t-lg`}>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        {getDimensionIcon(dim.icon)}
                        {dim.nombre} - {dim.descripcion}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{totalDim} / {dim.pesoMax} pts</Badge>
                        <Button size="sm" variant="secondary" onClick={() => openNewCriterio(dim.id)}>
                          <Plus className="h-4 w-4 mr-1" /> Agregar
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[50px]">Activo</TableHead>
                          <TableHead>Criterio</TableHead>
                          <TableHead>Descripción</TableHead>
                          <TableHead className="w-[100px] text-right">Puntaje</TableHead>
                          <TableHead className="w-[80px]">Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {criteriosDim.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center text-muted-foreground py-4">
                              No hay criterios. Agrega uno.
                            </TableCell>
                          </TableRow>
                        ) : (
                          criteriosDim.map(c => (
                            <TableRow key={c.id} className={!c.activo ? "opacity-50" : ""}>
                              <TableCell>
                                <input 
                                  type="checkbox" 
                                  checked={c.activo} 
                                  onChange={() => toggleCriterio(c.id)}
                                  className="w-4 h-4"
                                />
                              </TableCell>
                              <TableCell className="font-medium">{c.nombre}</TableCell>
                              <TableCell className="text-sm text-muted-foreground">{c.descripcion}</TableCell>
                              <TableCell className="text-right">
                                <Input 
                                  type="number" 
                                  min={0} 
                                  max={50}
                                  value={c.puntajeMax}
                                  onChange={(e) => updatePuntaje(c.id, parseInt(e.target.value) || 0)}
                                  className="w-[70px] ml-auto"
                                  disabled={!c.activo}
                                />
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-1">
                                  <Button size="sm" variant="ghost" onClick={() => openEditCriterio(c)}>
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button size="sm" variant="ghost" className="text-red-600" onClick={() => deleteCriterio(c.id)}>
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          ) : (
            <Card className="text-center py-12">
              <CardContent>
                <School className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium mb-2">Selecciona un grado</h3>
                <p className="text-muted-foreground">
                  Primero selecciona el nivel y grado en la pestaña "Niveles y Grados"
                </p>
                <Button className="mt-4" onClick={() => setActiveTab("niveles")}>
                  Ir a Niveles y Grados
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialog para copiar configuración */}
      <Dialog open={showCopyDialog} onOpenChange={setShowCopyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Copiar Configuración a Otro Grado</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nivel destino</Label>
              <Select 
                value={copyTarget.nivel} 
                onValueChange={(v) => setCopyTarget({ nivel: v as NivelKey, subNivel: "" })}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {NIVELES_EDUCATIVOS.map(n => (
                    <SelectItem key={n.id} value={n.id}>{n.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Grado destino</Label>
              <Select 
                value={copyTarget.subNivel} 
                onValueChange={(v) => setCopyTarget(prev => ({ ...prev, subNivel: v }))}
              >
                <SelectTrigger><SelectValue placeholder="Seleccionar grado" /></SelectTrigger>
                <SelectContent>
                  {NIVELES_EDUCATIVOS.find(n => n.id === copyTarget.nivel)?.subNiveles.map(s => (
                    <SelectItem key={s.id} value={s.id}>{s.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded p-3 text-sm">
              <AlertTriangle className="h-4 w-4 text-amber-600 inline mr-2" />
              Esto sobrescribirá la configuración existente del grado destino para el {term}.
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCopyDialog(false)}>Cancelar</Button>
            <Button onClick={copiarConfiguracion}>
              <Copy className="h-4 w-4 mr-2" /> Copiar Configuración
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para crear/editar criterio */}
      <Dialog open={showCriterioDialog} onOpenChange={setShowCriterioDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCriterio ? "Editar Criterio" : "Nuevo Criterio"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Dimensión</Label>
              <Select 
                value={criterioForm.dimension} 
                onValueChange={(v) => setCriterioForm(prev => ({ ...prev, dimension: v }))}
                disabled={!!editingCriterio}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {dimensiones.map(d => (
                    <SelectItem key={d.id} value={d.id}>{d.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Nombre del criterio *</Label>
              <Input 
                value={criterioForm.nombre}
                onChange={(e) => setCriterioForm(prev => ({ ...prev, nombre: e.target.value }))}
                placeholder="Ej: Participación en clase"
              />
            </div>

            <div className="space-y-2">
              <Label>Descripción</Label>
              <Textarea 
                value={criterioForm.descripcion}
                onChange={(e) => setCriterioForm(prev => ({ ...prev, descripcion: e.target.value }))}
                placeholder="Descripción del criterio de evaluación"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label>Puntaje máximo</Label>
              <Input 
                type="number"
                min={1}
                max={50}
                value={criterioForm.puntajeMax}
                onChange={(e) => setCriterioForm(prev => ({ ...prev, puntajeMax: parseInt(e.target.value) || 1 }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCriterioDialog(false)}>Cancelar</Button>
            <Button onClick={saveCriterio}>
              <CheckCircle className="h-4 w-4 mr-2" />
              {editingCriterio ? "Actualizar" : "Crear"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
