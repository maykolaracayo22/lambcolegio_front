// src/pages/teacher/Boletin.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getNivel, getReglas, estadoPromedio } from "@/lib/bolivia";

export default function BoletinDocente() {
  const nivel = getNivel();
  const reglas = getReglas();
  const cfg = reglas[nivel];

  // TODO: reemplazar con data real de API/gradebook
  const materias = [{ id:1, nombre:"Lenguaje" }, { id:2, nombre:"Matemática" }];
  const t = (mId:number)=>({ T1: 60, T2: 55, T3: 70 }); // ejemplo

  return (
    <Card>
      <CardHeader><CardTitle>Boletín — {nivel.toUpperCase()}</CardTitle></CardHeader>
      <CardContent>
        {cfg.type === "NUMERIC" ? (
          <table className="w-full text-sm">
            <thead><tr><th>Asignatura</th><th>T1</th><th>T2</th><th>T3</th><th>Promedio</th><th>Estado</th></tr></thead>
            <tbody>
              {materias.map(m=>{
                const notas = t(m.id);
                const prom = Math.round((notas.T1 + notas.T2 + notas.T3)/3);
                return (
                  <tr key={m.id}>
                    <td>{m.nombre}</td><td>{notas.T1}</td><td>{notas.T2}</td><td>{notas.T3}</td>
                    <td>{prom}</td><td>{estadoPromedio(prom, (cfg as any).aprobatoria)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">Inicial (cualitativa): mostrar matriz por áreas y nivel de logro, sin promedios numéricos.</div>
            {/* TODO: Renderizar areas Cognitiva / Socioemocional / Motriz / Expresión con selects de logro */}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
