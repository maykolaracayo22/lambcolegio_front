# Frontend — Colegio Bolivia

La guía completa de instalación del sistema (frontend, API Laravel, MySQL, migraciones y ejecución local) está en el [README principal](../../../README.md).

## Inicio rápido

Requiere Node.js 18 o superior y npm. Desde esta carpeta:

```powershell
npm ci
npm run dev
```

Vite sirve la interfaz en `http://localhost:8080`. Para que cargue datos reales, también debe estar iniciado el backend Laravel en `http://127.0.0.1:8000` y configurada la base MySQL. La URL del API está en `src/lib/config.ts`.

## Otros comandos

```powershell
npm run build
npm run lint
```
