import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function EstadisticasPanel() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Pre-inscripciones por Nivel</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Inicial</span>
              <span className="font-bold">15</span>
            </div>
            <div className="flex justify-between">
              <span>Primaria</span>
              <span className="font-bold">28</span>
            </div>
            <div className="flex justify-between">
              <span>Secundaria</span>
              <span className="font-bold">22</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tiempo Promedio de Procesamiento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Revisión inicial</span>
              <span className="font-bold">2.3 días</span>
            </div>
            <div className="flex justify-between">
              <span>Validación completa</span>
              <span className="font-bold">4.5 días</span>
            </div>
            <div className="flex justify-between">
              <span>Generación RUDE</span>
              <span className="font-bold">1.2 días</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}