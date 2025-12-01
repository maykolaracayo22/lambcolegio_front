// src/main.tsx
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { runLocalMigrations } from "@/lib/migration";
import { HAS_API } from "@/lib/config";
import { syncSectionsFromApi } from "@/lib/sections_sync";

// Ejecutar migraciones locales (reglas v1 -> v2, conversión de escalas, etc.)
runLocalMigrations();

// Instalar el mock server SOLO en desarrollo y cuando no hay API base configurada
if (import.meta.env.DEV && !(import.meta as any).env?.VITE_API_BASE) {
  import("@/services/mockServer").then((m) => m.installMock());
}

// 👉 Sincronizar secciones reales desde el backend (si hay API)
(async () => {
  try {
    const year = localStorage.getItem("adm:year") || String(new Date().getFullYear());
    if (HAS_API) {
      await syncSectionsFromApi(year);
    }
  } catch (e) {
    console.warn("[main] syncSectionsFromApi fallo", e);
  }
})();

// Montar la app
createRoot(document.getElementById("root")!).render(<App />);
