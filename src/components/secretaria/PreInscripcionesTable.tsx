import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DocumentUploader } from "./DocumentUploader";
import { PreInscripcion, InscripcionEstado } from "@/lib/types-secretaria";
import { WhatsAppService } from "@/services/whatsappService";

const estadoBadgeColor: Record<InscripcionEstado, string> = {
  PENDIENTE: "bg-yellow-500",
  EN_REVISION: "bg-blue-500",
  OBSERVADO: "bg-red-500",
  APROBADO: "bg-green-500",
  RECHAZADO: "bg-gray-500",
};

export function PreInscripcionesTable() {
  const [selectedInscripcion, setSelectedInscripcion] = useState<PreInscripcion | null>(null);
  const [showUploader, setShowUploader] = useState(false);
  const [preInscripciones] = useState<PreInscripcion[]>([
    {
      id: "1",
      estudiante: {
        nombre: "María",
        apellidos: "Pérez",
        nivel: "Inicial",
      },
      documentos: [
        { id: "1", tipo: "dni", nombre: "DNI.pdf", url: "#", estado: "completo", fechaSubida: new Date() },
        { id: "2", tipo: "nacimiento", nombre: "Nacimiento.pdf", url: "#", estado: "faltante", fechaSubida: new Date() },
      ],
      estado: "PENDIENTE",
      fechaPreInscripcion: new Date(),
    },
    // Add more mock data as needed
  ]);

  const handleVerDocumentos = (inscripcion: PreInscripcion) => {
    setSelectedInscripcion(inscripcion);
    setShowUploader(true);
  };

  const handleCloseUploader = () => {
    setShowUploader(false);
    setSelectedInscripcion(null);
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Estudiante</TableHead>
            <TableHead>Nivel</TableHead>
            <TableHead>Documentos</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {preInscripciones.map((inscripcion) => (
            <TableRow key={inscripcion.id}>
              <TableCell>
                {inscripcion.estudiante.nombre} {inscripcion.estudiante.apellidos}
              </TableCell>
              <TableCell>{inscripcion.estudiante.nivel}</TableCell>
              <TableCell>
                {inscripcion.documentos.filter(d => d.estado === "completo").length}/
                {inscripcion.documentos.length}
              </TableCell>
              <TableCell>
                <Badge className={estadoBadgeColor[inscripcion.estado]}>
                  {inscripcion.estado}
                </Badge>
              </TableCell>
              <TableCell>
                {inscripcion.fechaPreInscripcion.toLocaleDateString()}
              </TableCell>
              <TableCell>
                <div className="space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleVerDocumentos(inscripcion)}
                  >
                    Ver Documentos
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={showUploader} onOpenChange={handleCloseUploader}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              Documentos de {selectedInscripcion?.estudiante.nombre} {selectedInscripcion?.estudiante.apellidos}
            </DialogTitle>
          </DialogHeader>
          {selectedInscripcion && (
            <div className="space-y-4">
              <DocumentUploader
                tipoDocumento="Certificado de Nacimiento"
                onUploadComplete={(url) => {
                  console.log("Documento subido:", url);
                }}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}