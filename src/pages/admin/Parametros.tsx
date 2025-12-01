// src/pages/admin/Parametros.tsx
import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings2, Save, Plus, Trash2, GripVertical } from "lucide-react";

import {
  BOLIVIA_DEFAULTS,
  getReglas,
  setReglas,
  type ReglasPorNivel,
  type NivelKey,
  type ReglaCualitativa,
  type ReglaNumerica,
} from "@/lib/bolivia";

export default function ParametrosAdmin() {
  // Nivel seleccionado (se apoya en el mismo valor que ya guarda tu app)
  const [nivel, setNivel] = useState<NivelKey>(() => (localStorage.getItem("nivel") as NivelKey) || "primaria");

  // Cargar reglas v2 (o defaults de Bolivia si no existen)
  const [reglas, setLocal] = useState<ReglasPorNivel>(() => getReglas());
  const cfg = reglas[nivel];

  const isQuali = (cfg as any).type === "QUALITATIVE";
  const titulo = useMemo(
    () => (isQuali ? "Evaluación cualitativa (Inicial)" : "Evaluación numérica (Primaria/Secundaria)"),
    [isQuali]
  );

  const guardar = () => {
    // Normalizaciones mínimas antes de guardar
    if (!isQuali) {
      const c = cfg as ReglaNumerica;
      // Forzar cumplimiento Bolivia para Primaria/Secundaria
      const fixed: ReglaNumerica = {
        ...c,
        minNota: 0,
        maxNota: 100,
        aprobatoria: 51,
        decimales: Math.max(0, Math.min(1, c.decimales ?? 0)), // 0 o 1
      };
      const next: ReglasPorNivel = { ...reglas, [nivel]: fixed };
      setReglas(next);
      setLocal(next);
      alert("Parámetros guardados (modo Bolivia: 0–100, aprobatoria 51).");
      return;
    }

    // Cualitativo: validar que existan niveles
    const c = cfg as ReglaCualitativa;
    if (!c.niveles?.length) {
      alert("Debe existir al menos un nivel de logro.");
      return;
    }
    const next: ReglasPorNivel = { ...reglas, [nivel]: c };
    setReglas(next);
    setLocal(next);
    alert("Parámetros guardados.");
  };

  const resetToDefaults = () => {
    const next: ReglasPorNivel = { ...reglas, [nivel]: BOLIVIA_DEFAULTS[nivel] };
    setReglas(next);
    setLocal(next);
  };

  // Handlers para UI cualitativa (Inicial)
  const addNivel = () => {
    if (!isQuali) return;
    const c = cfg as ReglaCualitativa;
    const order = (c.niveles?.[c.niveles.length - 1]?.order || 0) + 1;
    const nuevo = { code: "OTRO" as const, label: "Otro", order };
    const next: ReglasPorNivel = {
      ...reglas,
      [nivel]: { ...c, niveles: [...(c.niveles || []), nuevo] },
    };
    setLocal(next);
  };

  const delNivel = (order: number) => {
    if (!isQuali) return;
    const c = cfg as ReglaCualitativa;
    const nextLevels = (c.niveles || []).filter((n) => n.order !== order);
    const next: ReglasPorNivel = { ...reglas, [nivel]: { ...c, niveles: nextLevels } };
    setLocal(next);
  };

  const renameNivel = (order: number, label: string) => {
    if (!isQuali) return;
    const c = cfg as ReglaCualitativa;
    const nextLevels = (c.niveles || []).map((n) => (n.order === order ? { ...n, label } : n));
    const next: ReglasPorNivel = { ...reglas, [nivel]: { ...c, niveles: nextLevels } };
    setLocal(next);
  };

  const moveNivel = (order: number, dir: "up" | "down") => {
    if (!isQuali) return;
    const c = cfg as ReglaCualitativa;
    const list = [...(c.niveles || [])].sort((a, b) => a.order - b.order);
    const idx = list.findIndex((n) => n.order === order);
    if (idx === -1) return;
    const swapIdx = dir === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= list.length) return;
    // Intercambiar 'order'
    const a = list[idx], b = list[swapIdx];
    const tmp = a.order;
    a.order = b.order;
    b.order = tmp;
    const next: ReglasPorNivel = { ...reglas, [nivel]: { ...c, niveles: list } };
    setLocal(next);
  };

  // Handlers para UI numérica (Primaria/Secundaria) – mostramos bloqueado 0–100/51
  const setDecimales = (val: number) => {
    const c = cfg as ReglaNumerica;
    const next: ReglasPorNivel = {
      ...reglas,
      [nivel]: { ...c, decimales: Math.max(0, Math.min(1, Number(val) || 0)) },
    };
    setLocal(next);
  };

  const setAsistencia = (val: number) => {
    if (isQuali) {
      const c = cfg as ReglaCualitativa;
      const next: ReglasPorNivel = { ...reglas, [nivel]: { ...c, asistenciaMin: Number(val) || 0 } };
      setLocal(next);
    } else {
      const c = cfg as ReglaNumerica;
      const next: ReglasPorNivel = { ...reglas, [nivel]: { ...c, asistenciaMin: Number(val) || 0 } };
      setLocal(next);
    }
  };

  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center gap-2">
        <Settings2 className="h-6 w-6 text-blue-600" />
        <h1 className="text-2xl font-bold">Parámetros del Sistema (Bolivia)</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Configuración por nivel</CardTitle>
          <CardDescription>
            {titulo}. Los valores se guardan en <code>adm:rules:v2</code>.
          </CardDescription>
        </CardHeader>

        <CardContent className="grid grid-cols-1 gap-4">
          {/* Selector de nivel */}
          <div className="max-w-xs">
            <Label>Nivel</Label>
            <Select value={nivel} onValueChange={(v: NivelKey) => setNivel(v)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecciona nivel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="inicial">Inicial</SelectItem>
                <SelectItem value="primaria">Primaria</SelectItem>
                <SelectItem value="secundaria">Secundaria</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Panel cualitativo (Inicial) */}
          {isQuali && (
            <div className="space-y-4">
              <div>
                <Label className="mb-2 block">Niveles de logro (ordenados)</Label>
                <div className="space-y-2">
                  {[...(cfg as ReglaCualitativa).niveles].sort((a, b) => a.order - b.order).map((n) => (
                    <div key={n.order} className="flex items-center gap-2">
                      <button
                        type="button"
                        className="p-2 rounded border hover:bg-muted"
                        onClick={() => moveNivel(n.order, "up")}
                        title="Subir"
                      >
                        <GripVertical className="h-4 w-4" />
                      </button>
                      <Input
                        value={n.label}
                        onChange={(e) => renameNivel(n.order, e.target.value)}
                        className="max-w-sm"
                      />
                      <span className="text-xs text-muted-foreground">({n.code})</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => delNivel(n.order)}
                        title="Eliminar"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <Button variant="secondary" onClick={addNivel}>
                    <Plus className="h-4 w-4 mr-2" /> Agregar nivel
                  </Button>
                  <Button variant="ghost" onClick={resetToDefaults}>Restaurar niveles por defecto</Button>
                </div>
              </div>

              <div className="max-w-xs">
                <Label>% Asistencia mínima</Label>
                <Input
                  type="number"
                  value={(cfg as ReglaCualitativa).asistenciaMin}
                  onChange={(e) => setAsistencia(Number(e.target.value))}
                />
              </div>
            </div>
          )}

          {/* Panel numérico (Primaria/Secundaria) */}
          {!isQuali && (
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <Label>Mín. Nota</Label>
                <Input type="number" value={(cfg as ReglaNumerica).minNota} disabled />
                <p className="text-xs text-muted-foreground mt-1">Fijado por normativa: 0</p>
              </div>
              <div>
                <Label>Máx. Nota</Label>
                <Input type="number" value={(cfg as ReglaNumerica).maxNota} disabled />
                <p className="text-xs text-muted-foreground mt-1">Fijado por normativa: 100</p>
              </div>
              <div>
                <Label>Aprobatoria</Label>
                <Input type="number" value={(cfg as ReglaNumerica).aprobatoria} disabled />
                <p className="text-xs text-muted-foreground mt-1">Fijado por normativa: 51</p>
              </div>
              <div>
                <Label>Decimales</Label>
                <Input
                  type="number"
                  min={0}
                  max={1}
                  value={(cfg as ReglaNumerica).decimales ?? 0}
                  onChange={(e) => setDecimales(Number(e.target.value))}
                />
                <p className="text-xs text-muted-foreground mt-1">0 ó 1</p>
              </div>
              <div>
                <Label>% Asistencia mín.</Label>
                <Input
                  type="number"
                  value={(cfg as ReglaNumerica).asistenciaMin}
                  onChange={(e) => setAsistencia(Number(e.target.value))}
                />
              </div>
            </div>
          )}

          <div className="pt-2">
            <Button onClick={guardar}>
              <Save className="h-4 w-4 mr-2" /> Guardar
            </Button>
            {!isQuali && (
              <span className="ml-3 text-xs text-muted-foreground">
                * En modo Bolivia, la escala se fija a 0–100 y la aprobatoria a 51.
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
