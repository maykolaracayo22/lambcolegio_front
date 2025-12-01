// src/pages/teacher/Notas.tsx
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  CheckCircle2, 
  Lock, 
  Unlock, 
  Info, 
  CloudOff, 
  Cloud, 
  RefreshCw,
  BookOpen,
  Download,
  Upload,
  Shield,
  Calendar,
  Users
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

import Gradebook, { type GradebookData } from "@/components/gradebook/Gradebook";
import {
  getGradebook,
  saveGradebook,
  publishGradebook,
  unlockGradebook,
  syncGradebookQueue,
} from "@/services/gradebookApi";

import TermBadge from "@/components/gradebook/TermBadge";

export default function NotasTeacher() {
  const [data, setData] = useState<GradebookData | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [queueCount, setQueueCount] = useState<number>(0);
  const [syncing, setSyncing] = useState(false);
  const { toast } = useToast();

  // En la vida real lo tomas de selección del profesor / URL / estado global
  const sectionId = "SEC-3A-2025";

  // Helpers para leer info de cache local (último guardado y cola)
  function readQueueCount(): number {
    try {
      const raw = localStorage.getItem("gradebook:queue");
      if (!raw) return 0;
      const arr = JSON.parse(raw);
      return Array.isArray(arr) ? arr.length : 0;
    } catch {
      return 0;
    }
  }

  function readLastLocalSavedAt(): string | null {
    try {
      const raw = localStorage.getItem(`gradebook:${sectionId}`);
      if (!raw) return null;
      const env = JSON.parse(raw) as { updatedAt?: string };
      return env?.updatedAt ?? null;
    } catch {
      return null;
    }
  }

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setErrorMsg(null);
    getGradebook(sectionId)
      .then((res) => mounted && setData(res))
      .catch(() => {
        // Fallback para desarrollo / sin backend
        if (!mounted) return;
        setData({
          minScore: 0,
          maxScore: 100,
          locked: false,
          dropLowest: false,
          terms: [
            { id: "T1", name: "Trimestre 1", weight: 1 / 3 },
            { id: "T2", name: "Trimestre 2", weight: 1 / 3 },
            { id: "T3", name: "Trimestre 3", weight: 1 / 3 },
          ],
          currentTerm: "T1",
          students: [
            { id: "S1", name: "Ana Torres" },
            { id: "S2", name: "Bruno Díaz" },
            { id: "S3", name: "Carla Rojas" },
          ],
          columns: [
            { id: "C1", title: "PC1", weight: 0.5, termId: "T1" },
            { id: "C2", title: "Tarea 1", weight: 0.5, termId: "T1" },
            { id: "C3", title: "Examen T2", weight: 1, termId: "T2" },
            { id: "C4", title: "Proyecto T3", weight: 1, termId: "T3" },
          ],
          grades: {
            "S1:C1": 75, "S1:C2": 88, "S1:C3": 83, "S1:C4": 94,
            "S2:C1": 62, "S2:C2": 80, "S2:C3": 71, "S2:C4": 79,
            "S3:C1": 95, "S3:C2": 98, "S3:C3": 92, "S3:C4": 99,
          },
          comments: {},
        });
        setErrorMsg("No se pudo cargar desde la API. Se muestra un libro local de ejemplo.");
      })
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [sectionId]);

  // Actualiza contador de cola offline de forma periódica y ante cambios de conexión
  useEffect(() => {
    const updateQueue = () => setQueueCount(readQueueCount());
    updateQueue();

    const id = window.setInterval(updateQueue, 4000);
    const onOnline = async () => {
      // Al reconectar intentamos sincronizar automáticamente
      try {
        setSyncing(true);
        const res = await syncGradebookQueue();
        updateQueue();
        if (res.processed > 0) {
          toast({
            title: "Sincronización completada",
            description: `${res.processed} cambio(s) enviado(s). Pendientes: ${res.remaining}.`,
          });
          // volvemos a cargar para traer datos frescos del backend
          setLoading(true);
          getGradebook(sectionId)
            .then((r) => setData(r))
            .finally(() => setLoading(false));
        }
      } finally {
        setSyncing(false);
      }
    };

    window.addEventListener("online", onOnline);
    window.addEventListener("storage", updateQueue);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("storage", updateQueue);
      clearInterval(id);
    };
  }, [sectionId, toast]);

  const currentTerm = useMemo(
    () => data?.terms?.find((t) => t.id === data?.currentTerm),
    [data]
  );

  const handleSave = async (payload: GradebookData) => {
    await saveGradebook(sectionId, payload);
    const last = readLastLocalSavedAt();
    toast({
      title: "Cambios guardados",
      description: last ? `Último guardado local: ${new Date(last).toLocaleString()}` : "Guardado local actualizado.",
    });
    setQueueCount(readQueueCount());
  };

  const handlePublish = async () => {
    await publishGradebook(sectionId); // el servicio maneja offline/cola internamente
    setData((d) => (d ? { ...d, locked: true } : d));
    setQueueCount(readQueueCount());
    toast({
      title: "Libro publicado",
      description: navigator.onLine ? "Se bloqueó la edición para todos." : "Sin conexión: se enviará al reconectar.",
    });
  };

  const handleUnlock = async () => {
    await unlockGradebook(sectionId); // el servicio maneja offline/cola internamente
    setData((d) => (d ? { ...d, locked: false } : d));
    setQueueCount(readQueueCount());
    toast({
      title: "Libro desbloqueado",
      description: navigator.onLine ? "La edición vuelve a estar disponible." : "Sin conexión: se enviará al reconectar.",
    });
  };

  const handleManualSync = async () => {
    try {
      setSyncing(true);
      const res = await syncGradebookQueue();
      setQueueCount(readQueueCount());
      toast({
        title: "Sincronización",
        description: `Procesados: ${res.processed}. Pendientes: ${res.remaining}.`,
      });
      // si hubo cambios, recargar
      if (res.processed > 0) {
        setLoading(true);
        getGradebook(sectionId)
          .then((r) => setData(r))
          .finally(() => setLoading(false));
      }
    } finally {
      setSyncing(false);
    }
  };

  const lastSaved = readLastLocalSavedAt();

  return (
    <div className="space-y-6 p-6">
      {/* Header Mejorado */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BookOpen className="h-6 w-6 text-blue-700" />
            </div>
            Libro de Calificaciones
          </h1>
          <p className="text-muted-foreground mt-2 flex items-center gap-2">
            <Users className="h-4 w-4" />
            Gestión académica para <Badge variant="secondary" className="ml-1">{sectionId}</Badge>
          </p>
        </div>
        
        {/* Estado de conexión mejorado */}
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${
            navigator.onLine 
              ? "bg-green-50 border-green-200 text-green-700" 
              : "bg-red-50 border-red-200 text-red-700"
          }`}>
            {navigator.onLine ? (
              <Cloud className="h-4 w-4" />
            ) : (
              <CloudOff className="h-4 w-4" />
            )}
            <span className="text-sm font-medium">
              {navigator.onLine ? "Conectado" : "Sin conexión"}
            </span>
          </div>
        </div>
      </div>

      <Separator />

      {/* Tarjeta Principal Mejorada */}
      <Card className="border-l-4 border-l-blue-500 shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <CardTitle className="text-xl flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-600" />
                Control Académico
                {data?.currentTerm && <TermBadge term={data.currentTerm as "T1" | "T2" | "T3"} />}
              </CardTitle>

              {/* Estado del libro */}
              <Badge
                variant={data?.locked ? "destructive" : "success"}
                className="text-sm px-3 py-1"
              >
                {data?.locked ? (
                  <Lock className="h-3 w-3 mr-1" />
                ) : (
                  <Unlock className="h-3 w-3 mr-1" />
                )}
                {data?.locked ? "BLOQUEADO" : "EDITABLE"}
              </Badge>
            </div>

            {/* Acciones principales */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant="destructive"
                onClick={handlePublish}
                disabled={!!data?.locked || loading}
                className="flex items-center gap-2"
              >
                <Lock className="h-4 w-4" />
                Publicar
              </Button>
              <Button
                variant="outline"
                onClick={handleUnlock}
                disabled={!data?.locked || loading}
                className="flex items-center gap-2"
              >
                <Unlock className="h-4 w-4" />
                Desbloquear
              </Button>
            </div>
          </div>

          {/* Información adicional */}
          <div className="flex flex-wrap items-center gap-4 mt-4">
            {currentTerm && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>{currentTerm.name}</span>
                <Badge variant="outline" className="ml-1">
                  Peso {(currentTerm.weight * 100).toFixed(0)}%
                </Badge>
              </div>
            )}

            {lastSaved && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span>Último guardado: {new Date(lastSaved).toLocaleString()}</span>
              </div>
            )}

            {/* Sincronización */}
            <div className="flex items-center gap-2 ml-auto">
              <Button
                size="sm"
                variant="outline"
                onClick={handleManualSync}
                disabled={syncing || queueCount === 0}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
                {syncing ? "Sincronizando..." : "Sincronizar"}
              </Button>

              {queueCount > 0 && (
                <Badge 
                  variant="secondary" 
                  className="bg-orange-100 text-orange-700 border-orange-200"
                >
                  <Upload className="h-3 w-3 mr-1" />
                  {queueCount} pendiente{queueCount > 1 ? 's' : ''}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Alertas Mejoradas */}
          {errorMsg ? (
            <Alert variant="destructive" className="border-red-300 bg-red-50">
              <AlertTitle className="text-red-800 flex items-center gap-2">
                <CloudOff className="h-4 w-4" />
                Sin conexión a la API
              </AlertTitle>
              <AlertDescription className="text-red-700">
                {errorMsg}
              </AlertDescription>
            </Alert>
          ) : (
            <Alert className="bg-blue-50 border-blue-200">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertTitle className="text-blue-800">Consejos de uso</AlertTitle>
              <AlertDescription className="text-blue-700">
                Usa <strong>Ctrl+S</strong> para guardar, <strong>Ctrl+Z/Y</strong> para deshacer/rehacer y
                <strong> Delete</strong> para limpiar celdas.
              </AlertDescription>
            </Alert>
          )}

          {/* Estado de carga */}
          {loading && (
            <div className="flex items-center justify-center gap-3 py-8 text-muted-foreground">
              <div className="animate-spin">
                <RefreshCw className="h-5 w-5" />
              </div>
              <span className="text-lg">Cargando libro de calificaciones...</span>
            </div>
          )}

          {/* Gradebook */}
          {!loading && data && (
            <div className="border rounded-lg overflow-hidden">
              <Gradebook initial={data} onSave={handleSave} />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Panel de estadísticas (opcional) */}
      {!loading && data && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="text-center p-4 bg-green-50 border-green-200">
            <div className="text-2xl font-bold text-green-700">{data.students.length}</div>
            <div className="text-sm text-green-600">Estudiantes</div>
          </Card>
          <Card className="text-center p-4 bg-blue-50 border-blue-200">
            <div className="text-2xl font-bold text-blue-700">{data.columns.length}</div>
            <div className="text-sm text-blue-600">Actividades</div>
          </Card>
          <Card className="text-center p-4 bg-purple-50 border-purple-200">
            <div className="text-2xl font-bold text-purple-700">{data.terms.length}</div>
            <div className="text-sm text-purple-600">Periodos</div>
          </Card>
          <Card className="text-center p-4 bg-amber-50 border-amber-200">
            <div className="text-2xl font-bold text-amber-700">
              {data.locked ? "Sí" : "No"}
            </div>
            <div className="text-sm text-amber-600">Publicado</div>
          </Card>
        </div>
      )}
    </div>
  );
}