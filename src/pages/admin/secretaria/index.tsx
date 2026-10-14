import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, Loader2, Clock, CheckCircle, XCircle, FileText, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PreInscripcionesTable } from "@/components/secretaria/PreInscripcionesTable";
import { EstadisticasPanel } from "@/components/secretaria/EstadisticasPanel";
import { getSecretariaStats, type SecretariaStats } from "@/services/secretariaApi";

export default function SecretariaDashboard() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<SecretariaStats | null>(null);

  const loadStats = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getSecretariaStats();
      setStats(data);
    } catch (error: unknown) {
      console.error("Error cargando estadísticas:", error);
      // No bloquear, usar valores por defecto
      setStats({
        pendientes: 0,
        en_revision: 0,
        aprobados_hoy: 0,
        rechazados_hoy: 0,
        total_mes: 0,
        por_nivel: { inicial: 0, primaria: 0, secundaria: 0 },
      });
      const err = error as { response?: { data?: { message?: string } } };
      toast({
        title: "Aviso",
        description: err?.response?.data?.message || "No se pudieron cargar las estadísticas",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return (
    <div className="space-y-4 p-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard de Secretaría</h1>
        <Button variant="outline" onClick={loadStats} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Actualizar
        </Button>
      </div>
      
      {loading && !stats ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-muted-foreground">Cargando estadísticas...</span>
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Pendientes
                </CardTitle>
                <Clock className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{stats?.pendientes ?? 0}</div>
                <p className="text-xs text-muted-foreground">Preinscripciones por revisar</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Aprobados Hoy
                </CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats?.aprobados_hoy ?? 0}</div>
                <p className="text-xs text-muted-foreground">Estudiantes matriculados</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Rechazados Hoy
                </CardTitle>
                <XCircle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{stats?.rechazados_hoy ?? 0}</div>
                <p className="text-xs text-muted-foreground">Con observaciones</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total del Mes
                </CardTitle>
                <Users className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.total_mes ?? 0}</div>
                <p className="text-xs text-muted-foreground">Preinscripciones recibidas</p>
              </CardContent>
            </Card>
          </div>

          {/* Resumen por nivel */}
          {stats && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Pendientes por Nivel</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-pink-100 text-pink-700">Inicial</Badge>
                    <span className="font-bold">{stats.por_nivel.inicial}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-blue-100 text-blue-700">Primaria</Badge>
                    <span className="font-bold">{stats.por_nivel.primaria}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-purple-100 text-purple-700">Secundaria</Badge>
                    <span className="font-bold">{stats.por_nivel.secundaria}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Tabs defaultValue="cola" className="space-y-4">
            <TabsList>
              <TabsTrigger value="cola">Cola de Validación</TabsTrigger>
              <TabsTrigger value="estadisticas">Estadísticas</TabsTrigger>
            </TabsList>
            <TabsContent value="cola" className="space-y-4">
              <PreInscripcionesTable />
            </TabsContent>
            <TabsContent value="estadisticas">
              <EstadisticasPanel />
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}