// src/pages/teacher/RegistroValoracion.tsx
import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  BookOpen,
  Save,
  Download,
  Upload,
  User,
  Edit,
  XCircle,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// --- Tipos de Datos ---
interface Alumno {
  id: number;
  nombre: string;
  apellido: string;
  grado: string;
  grupo: string;
}

interface Materia {
  id: number;
  nombre: string;
  codigo: string;
  grado: string;
  grupo: string;
  criteriosPersonalizados?: CriterioPersonalizado[];
  fechaEvaluacion?: string;
}

interface CriterioPersonalizado {
  id: string;
  categoria: 'SER' | 'SABER' | 'HACER' | 'DECIDIR';
  texto: string;
}
interface CriterioEvaluacion {
  id: string;
  nombre: string;
  categoria: 'SER' | 'SABER' | 'HACER' | 'DECIDIR';
  puntaje: number;
}

interface NotasAlumno {
  alumnoId: number;
  ser: { [key: string]: number | null };
  saber: { [key: string]: number | null };
  hacer: { [key: string]: number | null };
  decidir: { [key: string]: number | null };
  autoevaluacion: number | null;
  primerTrimestre: number | null;
}

export default function RegistroValoracion() {
  
  const [trimestre, setTrimestre] = useState<string>('2');
  const [selectedMateria, setSelectedMateria] = useState<string>('');
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [notasAlumnos, setNotasAlumnos] = useState<NotasAlumno[]>([]);
  const [criteriosEditables, setCriteriosEditables] = useState<{[key: string]: string}>({});
  const [fechasEvaluacion, setFechasEvaluacion] = useState<{[key: string]: string}>({});
  const [editandoCriterios, setEditandoCriterios] = useState<boolean>(false);
  const { toast } = useToast();

  // --- DATOS SIMULADOS ---
  const docenteId = 1;
  const gestionActual = '2025';

  const alumnos: Alumno[] = useMemo(() => [
    { id: 1, nombre: 'ARIA MICHELLE', apellido: 'ABASTO LIMACHI', grado: '1', grupo: 'B' },
    { id: 2, nombre: 'AILEEN', apellido: 'ARCANGEL PACO', grado: '1', grupo: 'B' },
    { id: 3, nombre: 'EMIR SAID', apellido: 'BAUTISTA PRIETO', grado: '1', grupo: 'B' },
    { id: 4, nombre: 'LEANDRO JULIAN', apellido: 'CALLE ARANDIA', grado: '1', grupo: 'B' },
    { id: 5, nombre: 'JHESLIE', apellido: 'CASTRO PEREZ', grado: '1', grupo: 'B' },
    { id: 6, nombre: 'WARA CIELO', apellido: 'CESPEDES ARANCIBIA', grado: '1', grupo: 'B' },
    { id: 7, nombre: 'ABEL GUILLERMO', apellido: 'ENCINAS AGREDA', grado: '1', grupo: 'B' },
    { id: 8, nombre: 'ARIANA', apellido: 'ENCINAS ZEBALLOS', grado: '1', grupo: 'B' },
    { id: 9, nombre: 'CRISTHIAN LEONARDO', apellido: 'GALVEZ QUINTEROS', grado: '1', grupo: 'B' },
  ], []);

  const materias: Materia[] = useMemo(() => [
    { id: 1, nombre: 'RELIGIÓN', codigo: 'RELI', grado: '1', grupo: 'B' },
    { id: 2, nombre: 'MATEMÁTICAS', codigo: 'MATE', grado: '1', grupo: 'B' },
    { id: 3, nombre: 'LENGUAJE', codigo: 'LC1', grado: '1', grupo: 'B' },
  ], []);

  // Criterios de evaluación por categoría
  const criterios: CriterioEvaluacion[] = useMemo(() => [
    // SER (5 puntos) - 4 criterios
    { id: 'ser_1', nombre: 'Es puntual', categoria: 'SER', puntaje: 5 },
    { id: 'ser_2', nombre: 'Competencias y preferencia', categoria: 'SER', puntaje: 5 },
    { id: 'ser_3', nombre: 'Responsabiliza...', categoria: 'SER', puntaje: 5 },
    { id: 'ser_4', nombre: 'Sigue instrucciones', categoria: 'SER', puntaje: 5 },
    
    // SABER (45 puntos) - 7 criterios
    { id: 'saber_1', nombre: 'Editar', categoria: 'SABER', puntaje: 45 },
    { id: 'saber_2', nombre: 'Participa en los diálogos institu...', categoria: 'SABER', puntaje: 45 },
    { id: 'saber_3', nombre: 'Practica en la cotidad del centro', categoria: 'SABER', puntaje: 45 },
    { id: 'saber_4', nombre: 'Ex-men trimestral', categoria: 'SABER', puntaje: 45 },
    { id: 'saber_5', nombre: 'PROM. (5 puntos)', categoria: 'SABER', puntaje: 45 },
    
    // HACER (40 puntos) - 4 criterios
    { id: 'hacer_1', nombre: 'Trabaja en el texto', categoria: 'HACER', puntaje: 40 },
    { id: 'hacer_2', nombre: 'Participa en la exposición de los temas institu...', categoria: 'HACER', puntaje: 40 },
    { id: 'hacer_3', nombre: 'Valora en la escuela de padres', categoria: 'HACER', puntaje: 40 },
    { id: 'hacer_4', nombre: 'PROM. (5 puntos)', categoria: 'HACER', puntaje: 40 },
    
    // DECIDIR (5 puntos) - 4 criterios
    { id: 'decidir_1', nombre: 'Aut. (5 puntos)', categoria: 'DECIDIR', puntaje: 5 },
    { id: 'decidir_2', nombre: 'Es solidario', categoria: 'DECIDIR', puntaje: 5 },
    { id: 'decidir_3', nombre: 'Es empático', categoria: 'DECIDIR', puntaje: 5 },
    { id: 'decidir_4', nombre: 'Co-valúa en otras labores', categoria: 'DECIDIR', puntaje: 5 },
  ], []);

  const criteriosSer = useMemo(() => criterios.filter(c => c.categoria === 'SER'), [criterios]);
  const criteriosSaber = useMemo(() => criterios.filter(c => c.categoria === 'SABER'), [criterios]);
  const criteriosHacer = useMemo(() => criterios.filter(c => c.categoria === 'HACER'), [criterios]);
  const criteriosDecidir = useMemo(() => criterios.filter(c => c.categoria === 'DECIDIR'), [criterios]);

  // Inicializar notas vacías
  // Inicializar notas vacías
  useEffect(() => {
    if (selectedMateria && alumnos.length > 0) {
      const storageKey = `registro-valoracion:${selectedMateria}:${trimestre}`;
      const criteriosKey = `criterios:${selectedMateria}`;
      const fechasKey = `fechas:${selectedMateria}:${trimestre}`;
      
      // Cargar o inicializar notas
      try {
        const raw = localStorage.getItem(storageKey);
        if (raw) {
          const parsed = JSON.parse(raw) as NotasAlumno[];
          setNotasAlumnos(parsed);
        } else {
          const initialNotas: NotasAlumno[] = alumnos.map(alumno => ({
            alumnoId: alumno.id,
            ser: Object.fromEntries(criteriosSer.map(c => [c.id, null])),
            saber: Object.fromEntries(criteriosSaber.map(c => [c.id, null])),
            hacer: Object.fromEntries(criteriosHacer.map(c => [c.id, null])),
            decidir: Object.fromEntries(criteriosDecidir.map(c => [c.id, null])),
            autoevaluacion: null,
            primerTrimestre: trimestre === '2' ? Math.floor(Math.random() * 40) + 60 : null,
          }));
          setNotasAlumnos(initialNotas);
        }
      } catch {}

      // Cargar o inicializar criterios editables
      try {
        const savedCriterios = localStorage.getItem(criteriosKey);
        if (savedCriterios) {
          setCriteriosEditables(JSON.parse(savedCriterios));
        } else {
          // Inicializar con nombres por defecto
          const defaultCriterios: {[key: string]: string} = {};
          criterios.forEach(c => {
            defaultCriterios[c.id] = c.nombre;
          });
          setCriteriosEditables(defaultCriterios);
        }
      } catch {}

      // Cargar o inicializar fechas
      try {
        const savedFechas = localStorage.getItem(fechasKey);
        if (savedFechas) {
          setFechasEvaluacion(JSON.parse(savedFechas));
        } else {
          // Inicializar fechas vacías
          const defaultFechas: {[key: string]: string} = {};
          criterios.forEach(c => {
            defaultFechas[c.id] = '';
          });
          setFechasEvaluacion(defaultFechas);
        }
      } catch {}
    }
  }, [selectedMateria, trimestre, alumnos, criteriosSer, criteriosSaber, criteriosHacer, criteriosDecidir, criterios]);

  // Obtener notas de un alumno
  const getNotasAlumno = (alumnoId: number): NotasAlumno | undefined => {
    return notasAlumnos.find(n => n.alumnoId === alumnoId);
  };

  // Actualizar nota específica
  const updateNota = (alumnoId: number, categoria: string, criterioId: string, valor: number | null) => {
    setNotasAlumnos(prev => prev.map(nota => {
      if (nota.alumnoId === alumnoId) {
        return {
          ...nota,
          [categoria]: { ...nota[categoria as keyof NotasAlumno] as any, [criterioId]: valor }
        };
      }
      return nota;
    }));
  };

  // Actualizar autoevaluación
  const updateAutoevaluacion = (alumnoId: number, valor: number | null) => {
    setNotasAlumnos(prev => prev.map(nota => 
      nota.alumnoId === alumnoId ? { ...nota, autoevaluacion: valor } : nota
    ));
  };
  // Actualizar nombre de criterio
  const updateCriterio = (criterioId: string, nuevoNombre: string) => {
    setCriteriosEditables(prev => ({
      ...prev,
      [criterioId]: nuevoNombre
    }));
  };

  // Actualizar fecha de evaluación
  const updateFecha = (criterioId: string, fecha: string) => {
    setFechasEvaluacion(prev => ({
      ...prev,
      [criterioId]: fecha
    }));
  };

  // Calcular PROMEDIO SER (máximo 5 puntos)
  const calcularPromedioSer = (alumnoId: number): number => {
    const notasAlumno = getNotasAlumno(alumnoId);
    if (!notasAlumno) return 0;
    
    const valores = Object.values(notasAlumno.ser).filter(v => v !== null) as number[];
    if (valores.length === 0) return 0;
    
    const suma = valores.reduce((acc, val) => acc + val, 0);
    const promedio = suma / valores.length;
    return Math.round(promedio);
  };

  // Calcular PROMEDIO SABER (máximo 45 puntos)
  const calcularPromedioSaber = (alumnoId: number): number => {
    const notasAlumno = getNotasAlumno(alumnoId);
    if (!notasAlumno) return 0;
    
    const valores = Object.values(notasAlumno.saber).filter(v => v !== null) as number[];
    if (valores.length === 0) return 0;
    
    const suma = valores.reduce((acc, val) => acc + val, 0);
    const promedio = suma / valores.length;
    return Math.round(promedio);
  };

  // Calcular PROMEDIO HACER (máximo 40 puntos)
  const calcularPromedioHacer = (alumnoId: number): number => {
    const notasAlumno = getNotasAlumno(alumnoId);
    if (!notasAlumno) return 0;
    
    const valores = Object.values(notasAlumno.hacer).filter(v => v !== null) as number[];
    if (valores.length === 0) return 0;
    
    const suma = valores.reduce((acc, val) => acc + val, 0);
    const promedio = suma / valores.length;
    return Math.round(promedio);
  };

  // Calcular PROMEDIO DECIDIR (máximo 5 puntos)
  const calcularPromedioDecidir = (alumnoId: number): number => {
    const notasAlumno = getNotasAlumno(alumnoId);
    if (!notasAlumno) return 0;
    
    const valores = Object.values(notasAlumno.decidir).filter(v => v !== null) as number[];
    if (valores.length === 0) return 0;
    
    const suma = valores.reduce((acc, val) => acc + val, 0);
    const promedio = suma / valores.length;
    return Math.round(promedio);
  };

  // Calcular AUTOEVALUACIÓN (5 puntos)
  const getAutoevaluacion = (alumnoId: number): number => {
    const notasAlumno = getNotasAlumno(alumnoId);
    return notasAlumno?.autoevaluacion || 0;
  };

  // Calcular 1T (Primer Trimestre) - Solo en 2T
  const getPrimerTrimestre = (alumnoId: number): number => {
    if (trimestre !== '2') return 0;
    const notasAlumno = getNotasAlumno(alumnoId);
    return notasAlumno?.primerTrimestre || 0;
  };

  // Calcular TsPE (Total sin Prueba Escrita)
  const calcularTsPE = (alumnoId: number): number => {
    const ser = calcularPromedioSer(alumnoId);
    const saber = calcularPromedioSaber(alumnoId);
    const hacer = calcularPromedioHacer(alumnoId);
    const decidir = calcularPromedioDecidir(alumnoId);
    const auto = getAutoevaluacion(alumnoId);
    
    return ser + saber + hacer + decidir + auto;
  };

  // Calcular PE (Prueba Escrita) - Se ingresa manualmente o se calcula
  const getPruebaEscrita = (alumnoId: number): number => {
    // Esto debería venir de un campo editable separado
    // Por ahora retornamos 0
    return 0;
  };

  // Calcular 2T (Segundo Trimestre)
  const calcularSegundoTrimestre = (alumnoId: number): number => {
    const tspe = calcularTsPE(alumnoId);
    const pe = getPruebaEscrita(alumnoId);
    return tspe + pe;
  };

  // Calcular 3T (Tercer Trimestre) - placeholder
  const calcularTercerTrimestre = (alumnoId: number): number => {
    return 0; // Se calculará en el tercer trimestre
  };

  // Calcular PA (Promedio Anual)
  const calcularPromedioAnual = (alumnoId: number): number => {
    const t1 = getPrimerTrimestre(alumnoId);
    const t2 = calcularSegundoTrimestre(alumnoId);
    const t3 = calcularTercerTrimestre(alumnoId);
    
    const trimestresConNotas = [t1, t2, t3].filter(t => t > 0);
    if (trimestresConNotas.length === 0) return 0;
    
    const suma = trimestresConNotas.reduce((acc, val) => acc + val, 0);
    return Math.round(suma / trimestresConNotas.length);
  };

  // Función para obtener el color según la nota
  const getGradeColor = (nota: number | null, max: number) => {
    if (nota === null || nota === 0) return 'gray';
    const porcentaje = (nota / max) * 100;
    if (porcentaje < 51) return 'red';
    if (porcentaje < 81) return 'yellow';
    return 'emerald';
  };

  const getGradeClasses = (nota: number | null, max: number = 100) => {
    const color = getGradeColor(nota, max);
    switch (color) {
      case 'red': return 'bg-red-100 text-red-800 border-red-300';
      case 'yellow': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'emerald': return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      default: return 'bg-gray-100 text-gray-600 border-gray-300';
    }
  };

  const handleSave = () => {
    try {
      if (selectedMateria) {
        const storageKey = `registro-valoracion:${selectedMateria}:${trimestre}`;
        const criteriosKey = `criterios:${selectedMateria}`;
        const fechasKey = `fechas:${selectedMateria}:${trimestre}`;
        
        localStorage.setItem(storageKey, JSON.stringify(notasAlumnos));
        localStorage.setItem(criteriosKey, JSON.stringify(criteriosEditables));
        localStorage.setItem(fechasKey, JSON.stringify(fechasEvaluacion));
        
        toast({ 
          title: 'Registro guardado', 
          description: 'El registro de valoración se guardó correctamente.' 
        });
        setIsEditing(false);
        setEditandoCriterios(false);
      }
    } catch (e) {
      toast({ 
        title: 'Error al guardar', 
        description: 'No fue posible guardar el registro.',
        variant: 'destructive'
      });
    }
  };

  const materiaSeleccionada = materias.find(m => m.id.toString() === selectedMateria);

  // Contar aprobados y reprobados
  const contarEstadisticas = () => {
    let aprobados = 0;
    let reprobados = 0;
    
    alumnos.forEach(alumno => {
      const nota = calcularSegundoTrimestre(alumno.id);
      if (nota >= 51) aprobados++;
      else if (nota > 0) reprobados++;
    });
    
    return { aprobados, reprobados };
  };

  const stats = contarEstadisticas();

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <BookOpen className="h-7 w-7 text-blue-600" />
            Registro de Valoración - Gestión {gestionActual}
          </h1>
          <p className="text-muted-foreground mt-1">
            U.E. TÉCNICO HUMANÍSTICO EBENEZER
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Exportar
          </Button>
          {isEditing ? (
            <>
              <Button 
                onClick={() => setIsEditing(false)} 
                variant="outline"
                className="flex items-center gap-2"
              >
                <XCircle className="h-4 w-4" />
                Cancelar
              </Button>
              <Button 
                onClick={handleSave} 
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
              >
                <Save className="h-4 w-4" />
                Guardar Cambios
              </Button>
              <Button 
                onClick={() => setEditandoCriterios(!editandoCriterios)} 
                disabled={!selectedMateria}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Edit className="h-4 w-4" />
                {editandoCriterios ? 'Finalizar Edición Criterios' : 'Editar Criterios'}
              </Button>
            </>
          ) :
           (
            
            <Button 
              onClick={() => setIsEditing(true)} 
              disabled={!selectedMateria}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
            >
              <Edit className="h-4 w-4" />
              Editar Registro
            </Button>
          )}
        </div>
      </div>

      {/* Selectores */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <Label htmlFor="curso" className="text-sm font-medium mb-2 block">
              Curso
            </Label>
            <Select value="1-B" disabled>
              <SelectTrigger id="curso">
                <SelectValue placeholder="1°B - PRIMARIA" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1-B">1°B - PRIMARIA</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <Label htmlFor="materia" className="text-sm font-medium mb-2 block">
              Área/Materia
            </Label>
            <Select value={selectedMateria} onValueChange={setSelectedMateria}>
              <SelectTrigger id="materia">
                <SelectValue placeholder="Seleccionar materia" />
              </SelectTrigger>
              <SelectContent>
                {materias.map(materia => (
                  <SelectItem key={materia.id} value={materia.id.toString()}>
                    {materia.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <Label htmlFor="trimestre" className="text-sm font-medium mb-2 block">
              Trimestre
            </Label>
            <Select value={trimestre} onValueChange={setTrimestre}>
              <SelectTrigger id="trimestre">
                <SelectValue placeholder="Seleccionar trimestre" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">PRIMER TRIMESTRE</SelectItem>
                <SelectItem value="2">SEGUNDO TRIMESTRE</SelectItem>
                <SelectItem value="3">TERCER TRIMESTRE</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </div>

      {/* Estadísticas */}
      {selectedMateria && (
        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-green-50 border-green-300">
            <CardContent className="p-4 text-center">
              <div className="text-4xl font-bold text-green-700">{stats.aprobados}</div>
              <div className="text-sm text-green-600 font-medium">APROBADOS</div>
            </CardContent>
          </Card>
          <Card className="bg-red-50 border-red-300">
            <CardContent className="p-4 text-center">
              <div className="text-4xl font-bold text-red-700">{stats.reprobados}</div>
              <div className="text-sm text-red-600 font-medium">REPROBADOS</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabla de Registro */}
      {selectedMateria ? (
        <Card>
          <CardHeader className="bg-green-600 text-white">
            <CardTitle className="text-center text-lg">
              REGISTRO DE VALORACIÓN - GESTIÓN {gestionActual}
              <div className="text-sm font-normal mt-1">
                {trimestre === '1' && 'PRIMER TRIMESTRE'}
                {trimestre === '2' && 'SEGUNDO TRIMESTRE'}
                {trimestre === '3' && 'TERCER TRIMESTRE'}
              </div>
              <div className="text-sm font-normal">
                MAESTRA/O: ANGULO MONTALVO DANIELA
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto overflow-y-visible max-w-full" style={{ maxHeight: 'calc(100vh - 400px)' }}>
              <div className="min-w-max">
                <table className="w-full text-xs border-collapse">
                <thead>
                  {/* Fila 3: Nombres de criterios editables */}
                  <tr className="bg-white text-[8px]">
                    <th colSpan={2} className="border border-gray-400 p-0.5 bg-gray-200 text-left font-semibold text-[9px]">
                      CRITERIOS
                    </th>
                    {criteriosSer.map(c => (
                      <th key={`nombre-${c.id}`} className="border border-gray-400 p-0.5 bg-blue-50 max-h-12">
                        {editandoCriterios ? (
                          <Input
                            type="text"
                            value={criteriosEditables[c.id] || c.nombre}
                            onChange={(e) => updateCriterio(c.id, e.target.value)}
                            className="w-full h-6 text-[8px] p-0.5 border-blue-400"
                            placeholder="Criterio"
                          />
                        ) : (
                          <div className="max-w-[60px] max-h-10 overflow-hidden text-[7px] leading-tight" title={criteriosEditables[c.id] || c.nombre}>
                            {criteriosEditables[c.id] || c.nombre}
                          </div>
                        )}
                      </th>
                    ))}
                    {criteriosSaber.map(c => (
                      <th key={`nombre-${c.id}`} className="border border-gray-400 p-0.5 bg-purple-50 max-h-12">
                        {editandoCriterios ? (
                          <Input
                            type="text"
                            value={criteriosEditables[c.id] || c.nombre}
                            onChange={(e) => updateCriterio(c.id, e.target.value)}
                            className="w-full h-6 text-[8px] p-0.5 border-purple-400"
                            placeholder="Criterio"
                          />
                        ) : (
                          <div className="max-w-[60px] max-h-10 overflow-hidden text-[7px] leading-tight" title={criteriosEditables[c.id] || c.nombre}>
                            {criteriosEditables[c.id] || c.nombre}
                          </div>
                        )}
                      </th>
                    ))}
                    {criteriosHacer.map(c => (
                      <th key={`nombre-${c.id}`} className="border border-gray-400 p-0.5 bg-orange-50 max-h-12">
                        {editandoCriterios ? (
                          <Input
                            type="text"
                            value={criteriosEditables[c.id] || c.nombre}
                            onChange={(e) => updateCriterio(c.id, e.target.value)}
                            className="w-full h-6 text-[8px] p-0.5 border-orange-400"
                            placeholder="Criterio"
                          />
                        ) : (
                          <div className="max-w-[60px] max-h-10 overflow-hidden text-[7px] leading-tight" title={criteriosEditables[c.id] || c.nombre}>
                            {criteriosEditables[c.id] || c.nombre}
                          </div>
                        )}
                      </th>
                    ))}
                    {criteriosDecidir.map(c => (
                      <th key={`nombre-${c.id}`} className="border border-gray-400 p-0.5 bg-pink-50 max-h-12">
                        {editandoCriterios ? (
                          <Input
                            type="text"
                            value={criteriosEditables[c.id] || c.nombre}
                            onChange={(e) => updateCriterio(c.id, e.target.value)}
                            className="w-full h-6 text-[8px] p-0.5 border-pink-400"
                            placeholder="Criterio"
                          />
                        ) : (
                          <div className="max-w-[60px] max-h-10 overflow-hidden text-[7px] leading-tight" title={criteriosEditables[c.id] || c.nombre}>
                            {criteriosEditables[c.id] || c.nombre}
                          </div>
                        )}
                      </th>
                    ))}
                    <th colSpan={7} className="border border-gray-400 p-0.5 bg-gray-100"></th>
                  </tr>
                  {/* Fila 4: Fechas de evaluación */}
                  <tr className="bg-gray-50 text-[8px]">
                    <th colSpan={2} className="border border-gray-400 p-0.5 bg-gray-200 text-left font-semibold text-[9px]">
                      FECHA (dd-mm)
                    </th>
                    {criteriosSer.map(c => (
                      <th key={`fecha-${c.id}`} className="border border-gray-400 p-0.5 bg-blue-50">
                        {editandoCriterios ? (
                          <Input
                            type="text"
                            value={fechasEvaluacion[c.id] || ''}
                            onChange={(e) => updateFecha(c.id, e.target.value)}
                            className="w-full h-5 text-[8px] p-0.5 border-blue-300 text-center"
                            placeholder="dd-mm"
                            maxLength={5}
                          />
                        ) : (
                          <div className="text-gray-600 text-[8px]">
                            {fechasEvaluacion[c.id] || '-'}
                          </div>
                        )}
                      </th>
                    ))}
                    {criteriosSaber.map(c => (
                      <th key={`fecha-${c.id}`} className="border border-gray-400 p-0.5 bg-purple-50">
                        {editandoCriterios ? (
                          <Input
                            type="text"
                            value={fechasEvaluacion[c.id] || ''}
                            onChange={(e) => updateFecha(c.id, e.target.value)}
                            className="w-full h-5 text-[8px] p-0.5 border-purple-300 text-center"
                            placeholder="dd-mm"
                            maxLength={5}
                          />
                        ) : (
                          <div className="text-gray-600 text-[8px]">
                            {fechasEvaluacion[c.id] || '-'}
                          </div>
                        )}
                      </th>
                    ))}
                    {criteriosHacer.map(c => (
                      <th key={`fecha-${c.id}`} className="border border-gray-400 p-0.5 bg-orange-50">
                        {editandoCriterios ? (
                          <Input
                            type="text"
                            value={fechasEvaluacion[c.id] || ''}
                            onChange={(e) => updateFecha(c.id, e.target.value)}
                            className="w-full h-5 text-[8px] p-0.5 border-orange-300 text-center"
                            placeholder="dd-mm"
                            maxLength={5}
                          />
                        ) : (
                          <div className="text-gray-600 text-[8px]">
                            {fechasEvaluacion[c.id] || '-'}
                          </div>
                        )}
                      </th>
                    ))}
                    {criteriosDecidir.map(c => (
                      <th key={`fecha-${c.id}`} className="border border-gray-400 p-0.5 bg-pink-50">
                        {editandoCriterios ? (
                          <Input
                            type="text"
                            value={fechasEvaluacion[c.id] || ''}
                            onChange={(e) => updateFecha(c.id, e.target.value)}
                            className="w-full h-5 text-[8px] p-0.5 border-pink-300 text-center"
                            placeholder="dd-mm"
                            maxLength={5}
                          />
                        ) : (
                          <div className="text-gray-600 text-[8px]">
                            {fechasEvaluacion[c.id] || '-'}
                          </div>
                        )}
                      </th>
                    ))}
                    <th colSpan={7} className="border border-gray-400 p-0.5 bg-gray-100"></th>
                  </tr>
                  {/* Fila 1: Categorías principales */}
                  <tr className="bg-gray-200">
                    <th rowSpan={2} className="border border-gray-400 p-1 w-10 bg-yellow-100">N°</th>
                    <th rowSpan={2} className="border border-gray-400 p-2 min-w-[200px] bg-yellow-100">
                      APELLIDOS Y NOMBRES
                    </th>
                    <th colSpan={criteriosSer.length} className="border border-gray-400 p-1 bg-blue-100">
                      SER/5
                    </th>
                    <th colSpan={criteriosSaber.length} className="border border-gray-400 p-1 bg-purple-100">
                      SABER/45
                    </th>
                    <th colSpan={criteriosHacer.length} className="border border-gray-400 p-1 bg-orange-100">
                      HACER/40
                    </th>
                    <th colSpan={criteriosDecidir.length} className="border border-gray-400 p-1 bg-pink-100">
                      DECIDIR/5
                    </th>
                    <th rowSpan={2} className="border border-gray-400 p-1 w-12 bg-green-100">Au</th>
                    <th rowSpan={2} className="border border-gray-400 p-1 w-12 bg-gray-100">1T</th>
                    <th rowSpan={2} className="border border-gray-400 p-1 w-12 bg-yellow-200">TsPE</th>
                    <th rowSpan={2} className="border border-gray-400 p-1 w-12 bg-yellow-200">PE</th>
                    <th rowSpan={2} className="border border-gray-400 p-1 w-12 bg-blue-200">2T</th>
                    <th rowSpan={2} className="border border-gray-400 p-1 w-12 bg-green-200">3T</th>
                    <th rowSpan={2} className="border border-gray-400 p-1 w-12 bg-red-200">PA</th>
                  </tr>
                  {/* Fila 2: Criterios específicos */}
                  <tr className="bg-gray-100 text-[10px]">
                    {criteriosSer.map((c, i) => (
                      <th key={c.id} className="border border-gray-400 p-1 w-12 bg-blue-50 rotate-0 max-w-[40px]">
                        <div className="truncate" title={c.nombre}>
                          {i + 1}
                        </div>
                      </th>
                    ))}
                    {criteriosSaber.map((c, i) => (
                      <th key={c.id} className="border border-gray-400 p-1 w-12 bg-purple-50">
                        <div className="truncate" title={c.nombre}>
                          {i + 1}
                        </div>
                      </th>
                    ))}
                    {criteriosHacer.map((c, i) => (
                      <th key={c.id} className="border border-gray-400 p-1 w-12 bg-orange-50">
                        <div className="truncate" title={c.nombre}>
                          {i + 1}
                        </div>
                      </th>
                    ))}
                    {criteriosDecidir.map((c, i) => (
                      <th key={c.id} className="border border-gray-400 p-1 w-12 bg-pink-50">
                        <div className="truncate" title={c.nombre}>
                          {i + 1}
                        </div>
                      </th>
                    ))}
                  </tr>
  
                </thead>
                
                <tbody>
                  {alumnos.map((alumno, index) => {
                    const notasAlumno = getNotasAlumno(alumno.id);
                    const promedioSer = calcularPromedioSer(alumno.id);
                    const promedioSaber = calcularPromedioSaber(alumno.id);
                    const promedioHacer = calcularPromedioHacer(alumno.id);
                    const promedioDecidir = calcularPromedioDecidir(alumno.id);
                    const auto = getAutoevaluacion(alumno.id);
                    const t1 = getPrimerTrimestre(alumno.id);
                    const tspe = calcularTsPE(alumno.id);
                    const pe = getPruebaEscrita(alumno.id);
                    const t2 = calcularSegundoTrimestre(alumno.id);
                    const t3 = calcularTercerTrimestre(alumno.id);
                    const pa = calcularPromedioAnual(alumno.id);
                    
                    return (
                      <tr key={alumno.id} className="hover:bg-gray-50">
                        <td className="border border-gray-400 p-1 text-center font-medium bg-yellow-50">
                          {index + 1}
                        </td>
                        
                        <td className="border border-gray-400 p-2 font-medium text-xs">
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3 text-gray-400" />
                            {alumno.apellido} {alumno.nombre}
                          </div>
                        </td>
                        
                        {/* SER */}
                        {criteriosSer.map(criterio => (
                          <td key={criterio.id} className="border border-gray-400 p-0.5 text-center bg-blue-50">
                            {isEditing ? (
                              <Input
                                type="number"
                                min="0"
                                max="5"
                                value={notasAlumno?.ser[criterio.id] ?? ''}
                                onChange={(e) => updateNota(
                                  alumno.id, 
                                  'ser', 
                                  criterio.id, 
                                  e.target.value ? parseInt(e.target.value) : null
                                )}
                                className="w-10 h-7 text-center text-xs p-0 border-red-300"
                              />
                            ) : (
                              <span className={`inline-block px-1 py-0.5 rounded text-xs font-semibold ${getGradeClasses(notasAlumno?.ser[criterio.id] ?? null, 5)}`}>
                                {notasAlumno?.ser[criterio.id] ?? ''}
                              </span>
                            )}
                          </td>
                        ))}
                        
                        {/* SABER */}
                        {criteriosSaber.map(criterio => (
                          <td key={criterio.id} className="border border-gray-400 p-0.5 text-center bg-purple-50">
                            {isEditing ? (
                              <Input
                                type="number"
                                min="0"
                                max="45"
                                value={notasAlumno?.saber[criterio.id] ?? ''}
                                onChange={(e) => updateNota(
                                  alumno.id, 
                                  'saber', 
                                  criterio.id, 
                                  e.target.value ? parseInt(e.target.value) : null
                                )}
                                className="w-10 h-7 text-center text-xs p-0 border-red-300"
                              />
                            ) : (
                              <span className={`inline-block px-1 py-0.5 rounded text-xs font-semibold ${getGradeClasses(notasAlumno?.saber[criterio.id] ?? null, 45)}`}>
                                {notasAlumno?.saber[criterio.id] ?? ''}
                              </span>
                            )}
                          </td>
                        ))}
                        
                        {/* HACER */}
                        {criteriosHacer.map(criterio => (
                          <td key={criterio.id} className="border border-gray-400 p-0.5 text-center bg-orange-50">
                            {isEditing ? (
                              <Input
                                type="number"
                                min="0"
                                max="40"
                                value={notasAlumno?.hacer[criterio.id] ?? ''}
                                onChange={(e) => updateNota(
                                  alumno.id, 
                                  'hacer', 
                                  criterio.id, 
                                  e.target.value ? parseInt(e.target.value) : null
                                )}
                                className="w-10 h-7 text-center text-xs p-0 border-red-300"
                              />
                            ) : (
                              <span className={`inline-block px-1 py-0.5 rounded text-xs font-semibold ${getGradeClasses(notasAlumno?.hacer[criterio.id] ?? null, 40)}`}>
                                {notasAlumno?.hacer[criterio.id] ?? ''}
                              </span>
                            )}
                          </td>
                        ))}
                        
                        {/* DECIDIR */}
                        {criteriosDecidir.map(criterio => (
                          <td key={criterio.id} className="border border-gray-400 p-0.5 text-center bg-pink-50">
                            {isEditing ? (
                              <Input
                                type="number"
                                min="0"
                                max="5"
                                value={notasAlumno?.decidir[criterio.id] ?? ''}
                                onChange={(e) => updateNota(
                                  alumno.id, 
                                  'decidir', 
                                  criterio.id, 
                                  e.target.value ? parseInt(e.target.value) : null
                                )}
                                className="w-10 h-7 text-center text-xs p-0 border-red-300"
                              />
                            ) : (
                              <span className={`inline-block px-1 py-0.5 rounded text-xs font-semibold ${getGradeClasses(notasAlumno?.decidir[criterio.id] ?? null, 5)}`}>
                                {notasAlumno?.decidir[criterio.id] ?? ''}
                              </span>
                            )}
                          </td>
                        ))}
                        
                        {/* AUTOEVALUACIÓN */}
                        <td className="border border-gray-400 p-0.5 text-center bg-green-50">
                          {isEditing ? (
                            <Input
                              type="number"
                              min="0"
                              max="5"
                              value={notasAlumno?.autoevaluacion ?? ''}
                              onChange={(e) => updateAutoevaluacion(
                                alumno.id,
                                e.target.value ? parseInt(e.target.value) : null
                              )}
                              className="w-10 h-7 text-center text-xs p-0 border-red-300"
                            />
                          ) : (
                            <span className={`inline-block px-1 py-0.5 rounded text-xs font-semibold ${getGradeClasses(auto, 5)}`}>
                              {auto || ''}
                            </span>
                          )}
                        </td>
                        
                        {/* 1T (Primer Trimestre) */}
                        <td className="border border-gray-400 p-1 text-center bg-gray-50">
                          <span className={`inline-block px-1 py-0.5 rounded text-xs font-semibold ${getGradeClasses(t1, 100)}`}>
                            {t1 || ''}
                          </span>
                        </td>
                        
                        {/* TsPE (Total sin Prueba Escrita) */}
                        <td className="border border-gray-400 p-1 text-center bg-yellow-100">
                          <span className={`inline-block px-1 py-0.5 rounded text-xs font-bold ${getGradeClasses(tspe, 100)}`}>
                            {tspe}
                          </span>
                        </td>
                        
                        {/* PE (Prueba Escrita) */}
                        <td className="border border-gray-400 p-1 text-center bg-yellow-100">
                          <span className="text-xs font-semibold text-gray-600">
                            {pe}
                          </span>
                        </td>
                        
                        {/* 2T (Segundo Trimestre) */}
                        <td className="border border-gray-400 p-1 text-center bg-blue-100">
                          <Badge className={`text-xs font-bold ${getGradeClasses(t2, 100)}`}>
                            {t2}
                          </Badge>
                        </td>
                        
                        {/* 3T (Tercer Trimestre) */}
                        <td className="border border-gray-400 p-1 text-center bg-green-100">
                          <span className="text-xs font-semibold text-gray-600">
                            {t3 || ''}
                          </span>
                        </td>
                        
                        {/* PA (Promedio Anual) */}
                        <td className="border border-gray-400 p-1 text-center bg-red-100">
                          <Badge className={`text-xs font-bold ${getGradeClasses(pa, 100)}`}>
                            {pa || ''}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              </div>
            </div>

            {/* Leyenda de colores simplificada */}
            <div className="p-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                <div className="flex items-center gap-2 bg-emerald-50 p-2 rounded border border-emerald-300">
                  <div className="w-4 h-4 bg-emerald-100 border-2 border-emerald-300 rounded"></div>
                  <span className="text-emerald-800 font-medium">81-100: Excelente</span>
                </div>
                <div className="flex items-center gap-2 bg-yellow-50 p-2 rounded border border-yellow-300">
                  <div className="w-4 h-4 bg-yellow-100 border-2 border-yellow-300 rounded"></div>
                  <span className="text-yellow-800 font-medium">51-80: Aprobado</span>
                </div>
                <div className="flex items-center gap-2 bg-red-50 p-2 rounded border border-red-300">
                  <div className="w-4 h-4 bg-red-100 border-2 border-red-300 rounded"></div>
                  <span className="text-red-800 font-medium">0-50: Reprobado</span>
                </div>
                <div className="flex items-center gap-2 bg-gray-50 p-2 rounded border border-gray-300">
                  <div className="w-4 h-4 bg-gray-100 border-2 border-gray-300 rounded"></div>
                  <span className="text-gray-800 font-medium">Sin calificar</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="text-center py-12">
          <CardContent>
            <BookOpen className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium mb-2">Selecciona una materia</h3>
            <p className="text-muted-foreground">
              Elige una materia para comenzar a registrar las valoraciones
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}