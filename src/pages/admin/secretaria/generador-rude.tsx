import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function GeneradorRUDE() {
  const [gestion] = useState(new Date().getFullYear());
  const [departamento, setDepartamento] = useState("");
  const [nivel, setNivel] = useState("");

  const generarCodigoRUDE = () => {
    // TODO: Implementar lógica real de generación RUDE
    // Formato: DEP-GESTION-NIVEL-CORRELATIVO
    console.log("Generando código RUDE...");
  };

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold">Generador de Códigos RUDE</h1>

      <Card>
        <CardHeader>
          <CardTitle>Configuración de Generación</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Gestión</Label>
              <Input value={gestion} disabled />
            </div>

            <div className="space-y-2">
              <Label>Departamento</Label>
              <Select value={departamento} onValueChange={setDepartamento}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione departamento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LP">La Paz</SelectItem>
                  <SelectItem value="CB">Cochabamba</SelectItem>
                  <SelectItem value="SC">Santa Cruz</SelectItem>
                  <SelectItem value="OR">Oruro</SelectItem>
                  <SelectItem value="PT">Potosí</SelectItem>
                  <SelectItem value="TJ">Tarija</SelectItem>
                  <SelectItem value="CH">Chuquisaca</SelectItem>
                  <SelectItem value="BE">Beni</SelectItem>
                  <SelectItem value="PD">Pando</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Nivel</Label>
              <Select value={nivel} onValueChange={setNivel}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione nivel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INI">Inicial</SelectItem>
                  <SelectItem value="PRI">Primaria</SelectItem>
                  <SelectItem value="SEC">Secundaria</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="pt-4">
            <Button 
              onClick={generarCodigoRUDE}
              disabled={!departamento || !nivel}
            >
              Generar Nuevo Código RUDE
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Códigos Generados Recientemente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* TODO: Implementar lista de códigos recientes */}
            <div className="text-sm text-muted-foreground">
              Los códigos generados aparecerán aquí
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}