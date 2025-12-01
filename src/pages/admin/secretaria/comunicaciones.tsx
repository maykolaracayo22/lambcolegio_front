import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

const PLANTILLAS = [
  {
    id: "docs-faltantes",
    titulo: "Documentos Faltantes",
    contenido: "Estimado(a) [NOMBRE_PADRE], le informamos que faltan los siguientes documentos para completar la inscripción de [NOMBRE_ESTUDIANTE]: [DOCUMENTOS_FALTANTES]. Por favor, envíelos lo antes posible.",
  },
  {
    id: "inscripcion-aprobada",
    titulo: "Inscripción Aprobada",
    contenido: "Felicitaciones [NOMBRE_PADRE], la inscripción de [NOMBRE_ESTUDIANTE] ha sido aprobada. El código RUDE asignado es: [CODIGO_RUDE].",
  },
  {
    id: "recordatorio",
    titulo: "Recordatorio de Documentos",
    contenido: "Recordatorio: Aún estamos esperando los documentos solicitados para la inscripción de [NOMBRE_ESTUDIANTE]. Por favor, envíelos antes del [FECHA_LIMITE].",
  },
];

export default function Comunicaciones() {
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [messageContent, setMessageContent] = useState("");

  const cargarPlantilla = (id: string) => {
    const plantilla = PLANTILLAS.find(p => p.id === id);
    if (plantilla) {
      setMessageContent(plantilla.contenido);
      setSelectedTemplate(id);
    }
  };

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold">Centro de Comunicaciones</h1>

      <Tabs defaultValue="individual" className="space-y-4">
        <TabsList>
          <TabsTrigger value="individual">Mensaje Individual</TabsTrigger>
          <TabsTrigger value="masivo">Mensaje Masivo</TabsTrigger>
          <TabsTrigger value="plantillas">Plantillas</TabsTrigger>
        </TabsList>

        <TabsContent value="individual">
          <div className="grid gap-4 grid-cols-12">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Destinatario</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 border rounded">
                  <div className="font-medium">María Pérez</div>
                  <div className="text-sm text-muted-foreground">Inicial</div>
                  <Badge className="mt-2">PENDIENTE</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-8">
              <CardHeader>
                <CardTitle>Mensaje</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Plantillas Rápidas</label>
                  <div className="flex gap-2">
                    {PLANTILLAS.map(plantilla => (
                      <Button
                        key={plantilla.id}
                        variant="outline"
                        size="sm"
                        onClick={() => cargarPlantilla(plantilla.id)}
                      >
                        {plantilla.titulo}
                      </Button>
                    ))}
                  </div>
                </div>

                <Textarea
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  placeholder="Escriba su mensaje aquí..."
                  className="min-h-[200px]"
                />

                <div className="flex justify-end space-x-2">
                  <Button variant="outline">Vista Previa</Button>
                  <Button>Enviar</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="masivo">
          <Card>
            <CardHeader>
              <CardTitle>Mensaje Masivo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                Herramienta de mensajes masivos próximamente disponible.
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="plantillas">
          <Card>
            <CardHeader>
              <CardTitle>Gestión de Plantillas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {PLANTILLAS.map(plantilla => (
                  <div key={plantilla.id} className="p-4 border rounded space-y-2">
                    <div className="font-medium">{plantilla.titulo}</div>
                    <div className="text-sm text-muted-foreground">
                      {plantilla.contenido}
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" size="sm">Editar</Button>
                      <Button variant="outline" size="sm">Eliminar</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}