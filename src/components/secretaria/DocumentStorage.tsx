import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DocumentUploader } from "./DocumentUploader";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Documento } from "@/lib/types-secretaria";
import { DocumentValidator, REGLAS_DOCUMENTOS } from "@/lib/validators";

interface DocumentStorageProps {
  estudiante: {
    nombre: string;
    apellidos: string;
    nivel: string;
  };
  documentos: Documento[];
  onDocumentUpdate: (documentos: Documento[]) => void;
}

export function DocumentStorage({ estudiante, documentos, onDocumentUpdate }: DocumentStorageProps) {
  const [activeTab, setActiveTab] = useState("pendientes");
  const [validaciones, setValidaciones] = useState<Record<string, any>>({});

  useEffect(() => {
    const resultados = DocumentValidator.validarTodosLosDocumentos(documentos);
    setValidaciones(resultados);
  }, [documentos]);

  const handleUploadComplete = (tipo: string, url: string) => {
    const nuevoDocumento: Documento = {
      id: crypto.randomUUID(),
      tipo,
      nombre: `${tipo}_${estudiante.nombre}.pdf`,
      url,
      estado: "pendiente",
      fechaSubida: new Date()
    };

    onDocumentUpdate([...documentos, nuevoDocumento]);
  };

  const documentosPendientes = Object.entries(REGLAS_DOCUMENTOS)
    .filter(([_, regla]) => {
      return !documentos.some(doc => doc.tipo === regla.tipoDocumento);
    });

  const documentosSubidos = documentos.filter(doc => 
    doc.estado === "completo" || doc.estado === "pendiente"
  );

  const documentosObservados = documentos.filter(doc => 
    doc.estado === "observado"
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Documentos de {estudiante.nombre} {estudiante.apellidos}</span>
          <Badge>{estudiante.nivel}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="pendientes">
              Pendientes ({documentosPendientes.length})
            </TabsTrigger>
            <TabsTrigger value="subidos">
              Subidos ({documentosSubidos.length})
            </TabsTrigger>
            <TabsTrigger value="observados">
              Observados ({documentosObservados.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pendientes">
            <div className="space-y-4">
              {documentosPendientes.map(([key, regla]) => (
                <div key={key} className="border p-4 rounded-lg">
                  <DocumentUploader
                    tipoDocumento={regla.tipoDocumento}
                    onUploadComplete={(url) => handleUploadComplete(regla.tipoDocumento, url)}
                    maxSize={regla.tamanoMaximoMB}
                    allowedTypes={regla.tiposPermitidos}
                  />
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="subidos">
            <div className="space-y-4">
              {documentosSubidos.map(doc => (
                <div key={doc.id} className="flex justify-between items-center p-4 border rounded-lg">
                  <div>
                    <div className="font-medium">{doc.tipo}</div>
                    <div className="text-sm text-muted-foreground">
                      Subido el {doc.fechaSubida.toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <a href={doc.url} target="_blank" rel="noopener noreferrer">
                        Ver
                      </a>
                    </Button>
                    <Button variant="outline" size="sm">
                      Reemplazar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="observados">
            <div className="space-y-4">
              {documentosObservados.map(doc => (
                <div key={doc.id} className="border p-4 rounded-lg space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">{doc.tipo}</div>
                      <div className="text-sm text-muted-foreground">
                        {doc.observaciones}
                      </div>
                    </div>
                    <Badge variant="destructive">Observado</Badge>
                  </div>
                  <DocumentUploader
                    tipoDocumento={doc.tipo}
                    onUploadComplete={(url) => handleUploadComplete(doc.tipo, url)}
                    maxSize={REGLAS_DOCUMENTOS[doc.tipo]?.tamanoMaximoMB || 5}
                    allowedTypes={REGLAS_DOCUMENTOS[doc.tipo]?.tiposPermitidos || []}
                  />
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}