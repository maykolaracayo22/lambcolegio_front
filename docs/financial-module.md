# Módulo Financiero — Resumen

Este documento describe la implementación inicial (skeleton) del Módulo Financiero dentro de la sección `admin`.

Estructura creada:

- `src/pages/admin/FinancialModule.tsx` — Página principal con pestañas para cada submódulo.
- `src/pages/admin/financial/` — Carpeta con componentes skeleton para submódulos:
  - `ControlMensualidades.tsx` — RF-001, RF-002, RF-003
  - `RegistroPagos.tsx` — RF-004, RF-005, RF-006
  - `Facturacion.tsx` — RF-007, RF-008, RF-009
  - `Morosidad.tsx` — RF-010, RF-011, RF-012
  - `ReportesFinancieros.tsx` — RF-013, RF-014, RF-015, RF-016
  - `ConfiguracionFinanciera.tsx` — RF-017, RF-018, RF-019
  - `Comunicaciones.tsx` — RF-020, RF-021
  - `Integraciones.tsx` — RF-022, RF-023
- `src/services/financialMock.ts` — Datos mock y constantes para desarrollo.

Notas y próximos pasos recomendados:

1. Integrar la ruta a `FinancialModule` desde el menú/sidepanel admin (`Header` o `DashboardLayout`).
2. Implementar servicios en `src/services` (API real) y enlazar con `services/financialMock.ts` durante desarrollo.
3. Añadir formularios reactivos para: definición de montos por nivel, registro de pagos, creación de facturas (PDF), conciliación bancaria.
4. Implementar permisos: restringir acceso a roles Finanzas/Director/Secretaría (ver `src/lib/types-admin` y autenticación existente).
5. Tests: agregar pruebas unitarias y una prueba E2E mínima (opcional).

Cómo probar localmente (desarrollo):

1. Ejecutar el servidor de desarrollo (ej: `pnpm dev` o `npm run dev` según el proyecto).
2. Navegar a la ruta admin (según la app) y buscar "Módulo Financiero" en el panel — si no aparece, agregar enlace temporal en `src/pages/admin/Overview.tsx`.

Si quieres, implemento ahora:

- Enlace en el menú admin para acceder al módulo.
- Formulario de configuración de montos por nivel y persistencia en mock.
- Exportadores de PDF/CSV básicos para facturas y reportes.
