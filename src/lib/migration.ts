// src/lib/migration.ts
export function runLocalMigrations() {
  const FLAG = "adm:migrated:v2025";
  if (localStorage.getItem(FLAG) === "true") return;

  // Migrar reglas v1 -> v2
  try {
    const v1 = JSON.parse(localStorage.getItem("adm:rules") || "null");
    if (v1) {
      const v2 = {
        inicial: {
          type: "QUALITATIVE",
          niveles: [
            { code: "EN_PROCESO", label: "En proceso", order: 1 },
            { code: "LOGRADO", label: "Logrado", order: 2 },
            { code: "DESTACADO", label: "Destacado", order: 3 },
          ],
          asistenciaMin: v1.asistenciaMin ?? 70,
        },
        primaria: { type: "NUMERIC", minNota: 0, maxNota: 100, aprobatoria: 51, decimales: v1.decimales ?? 0, asistenciaMin: v1.asistenciaMin ?? 70 },
        secundaria:{ type: "NUMERIC", minNota: 0, maxNota: 100, aprobatoria: 51, decimales: v1.decimales ?? 0, asistenciaMin: v1.asistenciaMin ?? 70 },
      };
      localStorage.setItem("adm:rules:v2", JSON.stringify(v2));
    }
  } catch {}

  // TODO: Si guardas notas en localStorage, convertir 0–20 -> 0–100 aquí.
  // Ejemplo: const x20 = JSON.parse(localStorage.getItem("grades")||"[]").map(n=>n*5) ...

  localStorage.setItem(FLAG, "true");
}
