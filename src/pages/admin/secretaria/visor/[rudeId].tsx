import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

export default function VisorRUDE() {
  const { rudeId } = useParams();

  // TODO: Fetch real data based on rudeId
  const inscripcion = {
    id: rudeId,
    estudiante: {
      nombre: "María",
      apellidos: "Pérez",
      fechaNacimiento: "2018-05-15",
      lugarNacimiento: "La Paz",
      genero: "F",
    },
    documentos: [
      { tipo: "Certificado de Nacimiento", estado: "completo" },
      { tipo: "Carnet de Vacunas", estado: "faltante" },
      { tipo: "Fotografía", estado: "completo" },
      { tipo: "CI Padres", estado: "completo" },
    ],
    estado: "EN_REVISION",
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">
          Pre-inscripción: {inscripcion.estudiante.nombre} {inscripcion.estudiante.apellidos}
        </h1>
        <Badge className="ml-2">{inscripcion.estado}</Badge>
      </div>

      <Tabs defaultValue="datos" className="space-y-4">
        <TabsList>
          <TabsTrigger value="datos">Datos RUDE</TabsTrigger>
          <TabsTrigger value="documentos">Documentos</TabsTrigger>
          <TabsTrigger value="historial">Historial</TabsTrigger>
        </TabsList>

        <TabsContent value="datos">
          <Card>
            <CardHeader>
              <CardTitle>Datos del Estudiante</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Nombres</label>
                  <div>{inscripcion.estudiante.nombre}</div>
                </div>
                <div>
                  <label className="text-sm font-medium">Apellidos</label>
                  <div>{inscripcion.estudiante.apellidos}</div>
                </div>
                <div>
                  <label className="text-sm font-medium">Fecha de Nacimiento</label>
                  <div>{inscripcion.estudiante.fechaNacimiento}</div>
                </div>
                <div>
                  <label className="text-sm font-medium">Lugar de Nacimiento</label>
                  <div>{inscripcion.estudiante.lugarNacimiento}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documentos">
          <Card>
            <CardHeader>
              <CardTitle>Documentos Requeridos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {inscripcion.documentos.map((doc, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded">
                    <div>
                      <span className="font-medium">{doc.tipo}</span>
                      <Badge className={
                        doc.estado === "completo" ? "bg-green-500 ml-2" : "bg-red-500 ml-2"
                      }>
                        {doc.estado}
                      </Badge>
                    </div>
                    <Button variant="outline" size="sm">Ver</Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="historial">
          <Card>
            <CardHeader>
              <CardTitle>Historial de Cambios</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* TODO: Implement history timeline */}
                <p className="text-muted-foreground">Historial de cambios será implementado próximamente.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end space-x-4">
        <Button variant="outline">Rechazar</Button>
        <Button variant="outline">Solicitar Documentos</Button>
        <Button>Aprobar</Button>
      </div>
    </div>
  );
}