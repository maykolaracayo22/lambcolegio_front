// src/pages/admin/Actas.tsx
// Supervisión de Actas - Conectado a Backend Laravel

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter 
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  FileText, 
  RefreshCw, 
  Lock, 
  Unlock, 
  Send, 
  CheckCircle, 
  AlertTriangle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Eye
} from "lucide-react";

import {
  getActas,
  validateActa,
  lockActa,
  unlockActa,
  publishActa,
  unpublishActa,
  getStatusColor,
  getStatusLabel,
  getNivelColor,
  type Acta,
  type ActaFilters,
  type ActaStatus,
  type Term,
  type NivelKey,
  type ActaValidation,
  type PaginatedResponse,
} from "@/services/actasApi";

export default function AdminActas() {
  const { toast } = useToast();
  const currentYear = new Date().getFullYear();
  const years = [currentYear, currentYear - 1, currentYear - 2];

  // Estados
  const [actas, setActas] = useState<Acta[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);

  // Filtros
  const [filterYear, setFilterYear] = useState<number>(currentYear);
  const [filterTerm, setFilterTerm] = useState<Term>("T1");
  const [filterNivel, setFilterNivel] = useState<NivelKey | "">("");
  const [filterGrado, setFilterGrado] = useState("");
  const [filterSeccion, setFilterSeccion] = useState("");
  const [filterStatus, setFilterStatus] = useState<ActaStatus | "">("");

  // Modal de validación
  const [validationDialog, setValidationDialog] = useState(false);
  const [validationResult, setValidationResult] = useState<ActaValidation | null>(null);
  const [selectedActa, setSelectedActa] = useState<Acta | null>(null);

  // Cargar actas
  const loadActas = useCallback(async () => {
    setLoading(true);
    try {
      const filters: ActaFilters = {
        year: filterYear,
        term: filterTerm,
        page: currentPage,
        per_page: 20,
      };
      
      if (filterNivel) filters.nivel = filterNivel;
      if (filterGrado) filters.grado = filterGrado;
      if (filterSeccion) filters.seccion = filterSeccion;
      if (filterStatus) filters.status = filterStatus;

      const response: PaginatedResponse<Acta> = await getActas(filters);
      setActas(response.data || []);
      setTotalPages(response.last_page || 1);
      setTotal(response.total || 0);
    } catch (error: unknown) {
      console.error("Error cargando actas:", error);
      setActas([]);
      const err = error as { response?: { data?: { message?: string } } };
      toast({
        title: "Error",
        description: err?.response?.data?.message || "No se pudieron cargar las actas",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [filterYear, filterTerm, filterNivel, filterGrado, filterSeccion, filterStatus, currentPage, toast]);

  useEffect(() => {
    loadActas();
  }, [loadActas]);

  // Validar acta
  const handleValidate = async (acta: Acta) => {
    setActionLoading(acta.id);
    try {
      const result = await validateActa(acta.id);
      setSelectedActa(acta);
      setValidationResult(result);
      setValidationDialog(true);
      
      if (result.valido) {
        toast({ title: "✅ Acta válida", description: "Cumple todos los requisitos" });
      } else {
        toast({ 
          title: "⚠️ Validación con observaciones", 
          description: `${result.errores.length} errores encontrados`,
          variant: "destructive"
        });
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast({
        title: "Error al validar",
        description: err?.response?.data?.message || "No se pudo validar el acta",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  // Bloquear acta
  const handleLock = async (acta: Acta) => {
    setActionLoading(acta.id);
    try {
      await lockActa(acta.id);
      toast({ title: "🔒 Acta bloqueada", description: "Ya no puede ser editada por el docente" });
      loadActas();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast({
        title: "Error al bloquear",
        description: err?.response?.data?.message || "No se pudo bloquear el acta",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  // Desbloquear acta
  const handleUnlock = async (acta: Acta) => {
    setActionLoading(acta.id);
    try {
      await unlockActa(acta.id);
      toast({ title: "🔓 Acta desbloqueada", description: "Vuelve a estado borrador" });
      loadActas();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast({
        title: "Error al desbloquear",
        description: err?.response?.data?.message || "No se pudo desbloquear el acta",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  // Publicar acta
  const handlePublish = async (acta: Acta) => {
    setActionLoading(acta.id);
    try {
      await publishActa(acta.id);
      toast({ title: "📢 Acta publicada", description: "Las notas son visibles para estudiantes y padres" });
      loadActas();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string; errores?: string[] } } };
      toast({
        title: "Error al publicar",
        description: err?.response?.data?.message || "No se pudo publicar el acta",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  // Despublicar acta
  const handleUnpublish = async (acta: Acta) => {
    setActionLoading(acta.id);
    try {
      await unpublishActa(acta.id);
      toast({ title: "⏪ Publicación revertida", description: "El acta vuelve a estado bloqueado" });
      loadActas();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast({
        title: "Error al despublicar",
        description: err?.response?.data?.message || "No se pudo revertir la publicación",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  // Resetear filtros
  const resetFilters = () => {
    setFilterNivel("");
    setFilterGrado("");
    setFilterSeccion("");
    setFilterStatus("");
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <FileText className="h-7 w-7 text-blue-600" />
            Supervisión de Actas
          </h1>
          <p className="text-muted-foreground">
            Valida, bloquea y publica actas de calificaciones
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadActas} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3 items-center">
            <Select value={String(filterYear)} onValueChange={(v) => { setFilterYear(Number(v)); setCurrentPage(1); }}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Año" />
              </SelectTrigger>
              <SelectContent>
                {years.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={filterTerm} onValueChange={(v) => { setFilterTerm(v as Term); setCurrentPage(1); }}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Trimestre" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="T1">Trimestre 1</SelectItem>
                <SelectItem value="T2">Trimestre 2</SelectItem>
                <SelectItem value="T3">Trimestre 3</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterNivel || "__all__"} onValueChange={(v) => { setFilterNivel(v === "__all__" ? "" : v as NivelKey); setCurrentPage(1); }}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Nivel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">Todos los niveles</SelectItem>
                <SelectItem value="inicial">Inicial</SelectItem>
                <SelectItem value="primaria">Primaria</SelectItem>
                <SelectItem value="secundaria">Secundaria</SelectItem>
              </SelectContent>
            </Select>

            <Input 
              placeholder="Grado" 
              value={filterGrado} 
              onChange={(e) => { setFilterGrado(e.target.value); setCurrentPage(1); }} 
              className="w-[100px]" 
            />

            <Input 
              placeholder="Sección" 
              value={filterSeccion} 
              onChange={(e) => { setFilterSeccion(e.target.value); setCurrentPage(1); }} 
              className="w-[100px]" 
            />

            <Select value={filterStatus || "__all__"} onValueChange={(v) => { setFilterStatus(v === "__all__" ? "" : v as ActaStatus); setCurrentPage(1); }}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">Todos los estados</SelectItem>
                <SelectItem value="DRAFT">Borrador</SelectItem>
                <SelectItem value="LOCKED">Bloqueada</SelectItem>
                <SelectItem value="PUBLISHED">Publicada</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="ghost" size="sm" onClick={resetFilters}>
              Limpiar filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabla */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Actas ({total})</span>
            <Badge variant="outline">{filterYear} - {filterTerm}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <span className="ml-2 text-muted-foreground">Cargando actas...</span>
            </div>
          ) : actas.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium">No hay actas</h3>
              <p className="text-muted-foreground">No se encontraron actas con los filtros seleccionados</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ref</TableHead>
                    <TableHead>Nivel</TableHead>
                    <TableHead>Grado/Sección</TableHead>
                    <TableHead>Materia</TableHead>
                    <TableHead>Docente</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Actualizado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {actas.map((acta) => (
                    <TableRow key={acta.id}>
                      <TableCell className="font-mono text-xs">{acta.ref}</TableCell>
                      <TableCell>
                        <Badge className={getNivelColor(acta.nivel)}>
                          {acta.nivel}
                        </Badge>
                      </TableCell>
                      <TableCell>{acta.grado}° {acta.seccion}</TableCell>
                      <TableCell className="max-w-[200px] truncate" title={acta.materia_nombre}>
                        {acta.materia_nombre}
                      </TableCell>
                      <TableCell className="max-w-[150px] truncate" title={acta.docente_nombre}>
                        {acta.docente_nombre}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(acta.status)}>
                          {getStatusLabel(acta.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(acta.updated_at).toLocaleDateString('es-BO')}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          {/* Validar */}
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleValidate(acta)}
                            disabled={actionLoading === acta.id}
                            title="Validar acta"
                          >
                            {actionLoading === acta.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>

                          {/* DRAFT -> LOCKED */}
                          {acta.status === "DRAFT" && (
                            <Button 
                              size="sm" 
                              onClick={() => handleLock(acta)}
                              disabled={actionLoading === acta.id}
                              title="Bloquear acta"
                            >
                              <Lock className="h-4 w-4 mr-1" />
                              Lock
                            </Button>
                          )}

                          {/* LOCKED -> DRAFT o PUBLISHED */}
                          {acta.status === "LOCKED" && (
                            <>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleUnlock(acta)}
                                disabled={actionLoading === acta.id}
                                title="Desbloquear acta"
                              >
                                <Unlock className="h-4 w-4 mr-1" />
                                Unlock
                              </Button>
                              <Button 
                                size="sm" 
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() => handlePublish(acta)}
                                disabled={actionLoading === acta.id}
                                title="Publicar acta"
                              >
                                <Send className="h-4 w-4 mr-1" />
                                Publish
                              </Button>
                            </>
                          )}

                          {/* PUBLISHED -> LOCKED */}
                          {acta.status === "PUBLISHED" && (
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => handleUnpublish(acta)}
                              disabled={actionLoading === acta.id}
                              title="Revertir publicación"
                            >
                              Unpublish
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t">
              <p className="text-sm text-muted-foreground">
                Página {currentPage} de {totalPages} ({total} actas)
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Validación */}
      <Dialog open={validationDialog} onOpenChange={setValidationDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {validationResult?.valido ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
              )}
              Resultado de Validación
            </DialogTitle>
            <DialogDescription>
              Acta: {selectedActa?.ref} — {selectedActa?.materia_nombre}
            </DialogDescription>
          </DialogHeader>

          {validationResult && (
            <div className="space-y-4">
              {/* Estado general */}
              <div className={`p-4 rounded-lg ${validationResult.valido ? 'bg-green-50' : 'bg-yellow-50'}`}>
                <p className={`font-semibold ${validationResult.valido ? 'text-green-700' : 'text-yellow-700'}`}>
                  {validationResult.valido 
                    ? "✅ El acta cumple todos los requisitos para publicación"
                    : "⚠️ El acta tiene observaciones pendientes"
                  }
                </p>
              </div>

              {/* Estadísticas */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-xs text-muted-foreground">Evaluaciones</p>
                  <p className="text-lg font-bold">{validationResult.estadisticas.evaluaciones}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-xs text-muted-foreground">Suma Pesos</p>
                  <p className="text-lg font-bold">{validationResult.estadisticas.suma_pesos}%</p>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-xs text-muted-foreground">Estudiantes</p>
                  <p className="text-lg font-bold">{validationResult.estadisticas.estudiantes}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-xs text-muted-foreground">Completitud</p>
                  <p className="text-lg font-bold">{validationResult.estadisticas.completitud_porcentaje}%</p>
                </div>
              </div>

              {/* Errores */}
              {validationResult.errores.length > 0 && (
                <div className="bg-red-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-red-700 mb-2">❌ Errores ({validationResult.errores.length})</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-red-600">
                    {validationResult.errores.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Advertencias */}
              {validationResult.advertencias.length > 0 && (
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-yellow-700 mb-2">⚠️ Advertencias ({validationResult.advertencias.length})</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-yellow-600">
                    {validationResult.advertencias.map((warn, i) => (
                      <li key={i}>{warn}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setValidationDialog(false)}>
              Cerrar
            </Button>
            {validationResult?.valido && selectedActa?.status === "LOCKED" && (
              <Button 
                className="bg-green-600 hover:bg-green-700"
                onClick={() => {
                  setValidationDialog(false);
                  if (selectedActa) handlePublish(selectedActa);
                }}
              >
                <Send className="h-4 w-4 mr-2" />
                Publicar Acta
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
