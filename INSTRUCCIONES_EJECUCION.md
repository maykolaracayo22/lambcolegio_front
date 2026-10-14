# 🚀 Guía para Ejecutar el Proyecto Completo

## **Requisitos Previos**
- Node.js 18+ instalado
- npm o bun como package manager

---

## **Paso 1: Instalar Dependencias**

```bash
npm install
# o si usas bun:
bun install
```

---

## **Paso 2: Iniciar el Servidor Backend Mock**

**En una NUEVA terminal (Terminal 1):**

```bash
npm run dev:server
```

**Esperado:**
```
✅ Servidor de desarrollo ejecutándose en http://127.0.0.1:3001
📡 APIs disponibles:
   - GET  /api/sections
   - GET  /api/calificaciones
   - POST /api/payments
```

---

## **Paso 3: Iniciar el Frontend (Vite)**

**En OTRA terminal (Terminal 2):**

```bash
npm run dev
```

**Esperado:**
```
VITE v5.x.x  ready in 234 ms

➜  Local:   http://localhost:5173/
➜  press h to show help
```

---

## **Paso 4: Abrir en el Navegador**

Abre: **http://localhost:5173/**

---

## **✅ Verificación**

### En la consola del navegador (F12):
- ✅ No debe haber errores de conexión `ERR_CONNECTION_REFUSED`
- ✅ Las llamadas a `/api/sections` deben funcionar
- ✅ Las notas deben sincronizarse entre `RegistroValoracion.tsx` y `Calificaciones.tsx`

### En la terminal del servidor (Terminal 1):
- ✅ Debe mostrar logs de las llamadas a `/api/sections`
- ✅ Ejemplo: `[Mock API] GET /api/sections - year: 2025, nivel: secundaria`

---

## **📁 Estructura de Puertos**

| Servicio | Puerto | URL |
|----------|--------|-----|
| **Frontend (Vite)** | 5173 | http://localhost:5173 |
| **Backend Mock** | 3001 | http://127.0.0.1:3001 |

---

## **🔧 Troubleshooting**

### ❌ "ERR_CONNECTION_REFUSED"
**Solución:** Asegúrate de que:
1. El servidor mock está corriendo en Terminal 1 (`npm run dev:server`)
2. El `.env` tiene: `VITE_API_BASE=http://127.0.0.1:3001/api`
3. Puerto 3001 no está bloqueado

### ❌ "Port 3001 is already in use"
**Solución:** Cambia el puerto en la Terminal 1:
```bash
PORT=3002 npm run dev:server
```

Luego actualiza `.env`:
```
VITE_API_BASE=http://127.0.0.1:3002/api
```

### ❌ "Las notas no se sincronizan"
**Solución:**
1. Abre la consola del navegador (F12)
2. Ve a pestaña "Application" → "Local Storage"
3. Verifica que existan keys como: `gradebook:calificaciones:2-B:3`
4. Intenta hacer clic en botón "Sincronizar" manualmente

---

## **📝 Notas Importantes**

- **Los datos son locales:** Todo se guarda en `localStorage` del navegador
- **No hay persistencia:** Si cierras el navegador, los datos se pierden
- **Para conectar a un backend real:** Cambia `VITE_API_BASE` en `.env`

---

## **🎯 Flujo de Trabajo Recomendado**

1. **Terminal 1:** `npm run dev:server` (dejar corriendo)
2. **Terminal 2:** `npm run dev` (dejar corriendo)
3. **Navegador:** http://localhost:5173
4. **Editar código** → Los cambios se reflejan automáticamente (HMR)

