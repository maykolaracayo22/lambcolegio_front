// src/pages/admin/StudentsModal.tsx
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Users, Loader2 } from "lucide-react";
import {
  getSectionStudents,
  type Section,
  type SectionStudent,
} from "@/services/sectionsApi";

interface StudentsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  section: Section | null;
}

export default function StudentsModal({
  open,
  onOpenChange,
  section,
}: StudentsModalProps) {
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState<SectionStudent[]>([]);
  const [total, setTotal] = useState(0);
  const [capacidad, setCapacidad] = useState<number | null>(null);

  useEffect(() => {
    if (open && section) {
      loadStudents();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, section]);

  const loadStudents = async () => {
    if (!section) return;
    setLoading(true);
    try {
      const data = await getSectionStudents(section.id);
      setStudents(data.estudiantes);
      setTotal(data.total);
      setCapacidad(data.section.capacidad);
    } catch (err) {
      console.error("Error cargando estudiantes:", err);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  if (!section) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Estudiantes de {section.curso} "{section.paralelo}"
          </DialogTitle>
          <DialogDescription>
            {total} estudiantes inscritos
            {capacidad && ` de ${capacidad} de capacidad`}
            {capacidad && total >= capacidad && (
              <Badge variant="destructive" className="ml-2">
                Capacidad completa
              </Badge>
            )}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Cargando...</span>
          </div>
        ) : students.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No hay estudiantes inscritos en esta seccion.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Codigo</TableHead>
                <TableHead>Nombres</TableHead>
                <TableHead>Apellidos</TableHead>
                <TableHead>CI</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((est, idx) => (
                <TableRow key={est.id}>
                  <TableCell className="text-muted-foreground">
                    {idx + 1}
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {est.codigo_estudiante}
                  </TableCell>
                  <TableCell>{est.nombres}</TableCell>
                  <TableCell>{est.apellidos}</TableCell>
                  <TableCell>{est.ci || "-"}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        est.estado_matricula === "INSCRITO"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {est.estado_matricula}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </DialogContent>
    </Dialog>
  );
}
