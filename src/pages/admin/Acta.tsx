// src/pages/admin/Acta.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getReglas, getNivel, estadoPromedio } from "@/lib/bolivia";

export default function ActaAdmin() {
  const nivel = getNivel();
  const cfg = getReglas()[nivel];

  // TODO: Data real por sección/materia
  const estudiantes = [{ id:1, nombre:"Ana" }, { id:2, nombre:"Luis" }];

  return (
    <Card>
      <CardHeader><CardTitle>Acta de Calificaciones — {nivel.toUpperCase()}</CardTitle></CardHeader>
      <CardContent>
        {cfg.type === "NUMERIC" ? (
          <table className="w-full text-sm">
            <thead><tr><th>Estudiante</th><th>T1</th><th>T2</th><th>T3</th><th>Promedio</th><th>Estado</th></tr></thead>
            <tbody>
              {estudiantes.map(e=>{
                const T1=58, T2=67, T3=73;
                const prom = Math.round((T1+T2+T3)/3);
                return <tr key={e.id}><td>{e.nombre}</td><td>{T1}</td><td>{T2}</td><td>{T3}</td><td>{prom}</td><td>{estadoPromedio(prom, (cfg as any).aprobatoria)}</td></tr>;
              })}
            </tbody>
          </table>
        ) : (
          <div className="text-sm text-muted-foreground">Inicial: listado cualitativo por áreas; sin promedios.</div>
        )}
      </CardContent>
    </Card>
  );
}
