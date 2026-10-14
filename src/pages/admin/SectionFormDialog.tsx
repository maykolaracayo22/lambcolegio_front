// src/pages/admin/SectionFormDialog.tsx
import * as React from "react";
import { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TeacherSelector } from "@/components/TeacherSelector";
import type { Teacher } from "@/services/teachersApi";
import type { Section, NivelKey } from "@/services/sectionsApi";
import { niveles, turnos, cursosPorNivel, paralelosSugeridos } from "@/lib/sections";

// Capacidades máximas según normativa boliviana Ley 070
const capacidadMaximaPorNivel: Record<NivelKey, number> = {
  inicial: 25,
  primaria: 30,
  secundaria: 35,
};

interface SectionFormDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editing: Section | null;
  defaultYear: string;
  defaultNivel: NivelKey;
  onSubmit: (values: Partial<Section>) => Promise<void>;
}

export default function SectionFormDialog({
  open,
  onOpenChange,
  editing,
  defaultYear,
  defaultNivel,
  onSubmit,
}: SectionFormDialogProps) {
  const [year, setYear] = useState(defaultYear);
  const [nivel, setNivel] = useState<NivelKey>(defaultNivel);
  const [curso, setCurso] = useState("");
  const [paralelo, setParalelo] = useState("A");
  const [turno, setTurno] = useState<"Mañana" | "Tarde" | "Noche">("Mañana");
  const [aula, setAula] = useState("");
  const [capacidad, setCapacidad] = useState<number | "">("");
  const [tutorId, setTutorId] = useState<number | null>(null);
  const [tutorName, setTutorName] = useState<string>("");
  const [estado, setEstado] = useState<"ACTIVA" | "CERRADA">("ACTIVA");
  const [submitting, setSubmitting] = useState(false);
  const [capacidadError, setCapacidadError] = useState<string>("");

  const cursoOptions = useMemo(() => cursosPorNivel[nivel], [nivel]);
  const maxCapacidad = capacidadMaximaPorNivel[nivel];

  // Reset form when opening
  useEffect(() => {
    if (open) {
      if (editing) {
        setYear(String(editing.year));
        setNivel(editing.nivel);
        setCurso(editing.curso);
        setParalelo(editing.paralelo);
        setTurno(editing.turno);
        setAula(editing.aula || "");
        setCapacidad(editing.capacidad ?? "");
        setTutorId(editing.tutor_id ?? null);
        setTutorName(editing.tutor ? `${editing.tutor.nombres} ${editing.tutor.apellidos}` : "");
        setEstado(editing.estado);
      } else {
        setYear(defaultYear);
        setNivel(defaultNivel);
        setCurso(cursosPorNivel[defaultNivel][0] || "");
        setParalelo("A");
        setTurno("Mañana");
        setAula("");
        setCapacidad("");
        setTutorId(null);
        setTutorName("");
        setEstado("ACTIVA");
      }
      setCapacidadError("");
    }
  }, [open, editing, defaultYear, defaultNivel]);

  // Update curso options when nivel changes
  useEffect(() => {
    if (!editing && cursoOptions.length > 0) {
      setCurso(cursoOptions[0]);
    }
  }, [nivel, cursoOptions, editing]);

  // Validate capacidad
  useEffect(() => {
    if (capacidad !== "" && Number(capacidad) > maxCapacidad) {
      setCapacidadError(`Según Ley 070, máximo ${maxCapacidad} estudiantes para nivel ${nivel}`);
    } else {
      setCapacidadError("");
    }
  }, [capacidad, maxCapacidad, nivel]);

  const handleTutorChange = (teacherId: number | null, teacher: Teacher | null) => {
    setTutorId(teacherId);
    setTutorName(teacher ? `${teacher.nombres} ${teacher.apellidos}` : "");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate capacidad
    if (capacidad !== "" && Number(capacidad) > maxCapacidad) {
      return; // Don't submit if capacity exceeds limit
    }

    setSubmitting(true);
    try {
      await onSubmit({
        year,
        nivel,
        curso,
        paralelo,
        turno,
        aula: aula || null,
        capacidad: capacidad !== "" ? Number(capacidad) : null,
        tutor_id: tutorId,
        estado,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editing ? "Editar Sección (Paralelo)" : "Nueva Sección (Paralelo)"}
          </DialogTitle>
          <DialogDescription>
            Define Año, Nivel, Curso (año de escolaridad) y Paralelo. El Turno es Mañana/Tarde/Noche.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Año */}
          <div className="space-y-2">
            <Label>Año de gestión</Label>
            <Input type="number" value={year} disabled className="bg-muted" />
          </div>

          {/* Nivel */}
          <div className="space-y-2">
            <Label>Nivel</Label>
            <Select value={nivel} onValueChange={(v) => setNivel(v as NivelKey)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {niveles.map((n) => (
                  <SelectItem key={n} value={n}>
                    {n[0].toUpperCase() + n.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Curso */}
          <div className="space-y-2">
            <Label>Curso (año de escolaridad)</Label>
            <Select value={curso} onValueChange={setCurso}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {cursoOptions.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Paralelo */}
          <div className="space-y-2">
            <Label>Paralelo</Label>
            <Select value={paralelo} onValueChange={setParalelo}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {paralelosSugeridos.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Turno */}
          <div className="space-y-2">
            <Label>Turno</Label>
            <Select value={turno} onValueChange={(v) => setTurno(v as "Mañana" | "Tarde" | "Noche")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {turnos.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Aula */}
          <div className="space-y-2">
            <Label>Aula (opcional)</Label>
            <Input
              type="text"
              value={aula}
              onChange={(e) => setAula(e.target.value)}
              placeholder="Ej: Aula 101"
            />
          </div>

          {/* Capacidad con validación Bolivia */}
          <div className="space-y-2">
            <Label>
              Capacidad (máx. {maxCapacidad} para {nivel} según Ley 070)
            </Label>
            <Input
              type="number"
              value={capacidad}
              onChange={(e) => setCapacidad(e.target.value ? Number(e.target.value) : "")}
              min={1}
              max={maxCapacidad}
              placeholder={`Máximo ${maxCapacidad} estudiantes`}
              className={capacidadError ? "border-red-500" : ""}
            />
            {capacidadError && (
              <p className="text-sm text-red-500">{capacidadError}</p>
            )}
          </div>

          {/* Tutor selector con búsqueda */}
          <div className="space-y-2">
            <Label>Docente Tutor</Label>
            <TeacherSelector
              value={tutorId}
              onChange={handleTutorChange}
              placeholder="Buscar y seleccionar tutor..."
            />
            {tutorName && (
              <p className="text-sm text-muted-foreground">
                Tutor seleccionado: {tutorName}
              </p>
            )}
          </div>

          {/* Estado */}
          <div className="space-y-2">
            <Label>Estado</Label>
            <Select value={estado} onValueChange={(v) => setEstado(v as "ACTIVA" | "CERRADA")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIVA">ACTIVA</SelectItem>
                <SelectItem value="CERRADA">CERRADA</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={submitting || !!capacidadError}>
              {submitting ? "Guardando..." : editing ? "Actualizar" : "Crear"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
