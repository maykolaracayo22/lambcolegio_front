/**
 * Módulo de Auditoría del Sistema
 * Consume eventos de auditoría del backend Laravel
 */

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  ShieldQuestion,
  Search,
  RefreshCw,
  Calendar,
  User,
  Activity,
  Filter,
  Eye,
  ChevronLeft,
  ChevronRight,
  Clock,
  Globe,
  Monitor,
  FileText,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import {
  type AuditEvent,
  type AuditFilters,
  getAuditEvents,
  getAuditActions,
  getAuditTargets,
  formatDateTime,
  getActionColor,
  getTargetIcon,
} from "@/services/sistemaApi";

export default function AuditoriaAdmin() {
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  
  // Filtros
  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [targetFilter, setTargetFilter] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  
  // Opciones de filtros
  const [availableActions, setAvailableActions] = useState<string[]>([]);
  const [availableTargets, setAvailableTargets] = useState<string[]>([]);

  // Cargar datos iniciales
  const loadData = useCallback(async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      console.log('[Auditoria] Esperando autenticación...');
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const filters: AuditFilters = {
        page: currentPage,
      };
      
      if (searchQuery) filters.q = searchQuery;
      if (actionFilter && actionFilter !== 'all') filters.accion = actionFilter;
      if (targetFilter && targetFilter !== 'all') filters.target = targetFilter;
      if (dateFrom) filters.from = dateFrom;
      if (dateTo) filters.to = dateTo;

      const response = await getAuditEvents(filters);
      setEvents(response.data || []);
      setTotalPages(response.last_page || 1);
      setTotal(response.total || 0);

      // Cargar opciones de filtros
      const [actions, targets] = await Promise.all([
        getAuditActions(),
        getAuditTargets(),
      ]);
      setAvailableActions(actions);
      setAvailableTargets(targets);
    } catch (error) {
      console.error("Error cargando auditoría:", error);
      toast.error("Error al cargar los eventos de auditoría");
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchQuery, actionFilter, targetFilter, dateFrom, dateTo]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  // Buscar con debounce
  const handleSearch = () => {
    setCurrentPage(1);
    loadData();
  };

  // Limpiar filtros
  const clearFilters = () => {
    setSearchQuery("");
    setActionFilter("all");
    setTargetFilter("all");
    setDateFrom("");
    setDateTo("");
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="flex items-center gap-2">
          <ShieldQuestion className="h-7 w-7 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold">Auditoría del Sistema</h1>
            <p className="text-muted-foreground">
              Registro de todas las acciones realizadas en el sistema
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Eventos</p>
                <p className="text-2xl font-bold">{total}</p>
              </div>
              <Activity className="h-8 w-8 text-blue-500 opacity-80" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Acciones Únicas</p>
                <p className="text-2xl font-bold">{availableActions.length}</p>
              </div>
              <FileText className="h-8 w-8 text-green-500 opacity-80" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Módulos</p>
                <p className="text-2xl font-bold">{availableTargets.length}</p>
              </div>
              <Monitor className="h-8 w-8 text-purple-500 opacity-80" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Página</p>
                <p className="text-2xl font-bold">{currentPage} / {totalPages}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-500 opacity-80" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros de Búsqueda
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="pl-9"
                  placeholder="Buscar en eventos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
            </div>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Acción" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las acciones</SelectItem>
                {availableActions.map((action) => (
                  <SelectItem key={action} value={action}>{action}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={targetFilter} onValueChange={setTargetFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Módulo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los módulos</SelectItem>
                {availableTargets.map((target) => (
                  <SelectItem key={target} value={target}>{target}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="date"
              placeholder="Desde"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
            <Input
              type="date"
              placeholder="Hasta"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>
          <div className="flex gap-2 mt-4">
            <Button onClick={handleSearch}>
              <Search className="h-4 w-4 mr-2" />
              Buscar
            </Button>
            <Button variant="outline" onClick={clearFilters}>
              Limpiar filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de eventos */}
      <Card>
        <CardHeader>
          <CardTitle>Eventos del Sistema</CardTitle>
          <CardDescription>
            Mostrando {events.length} de {total} eventos registrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <span className="ml-2">Cargando eventos...</span>
            </div>
          ) : (
            <>
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[180px]">Fecha/Hora</TableHead>
                      <TableHead>Usuario</TableHead>
                      <TableHead>Acción</TableHead>
                      <TableHead>Módulo</TableHead>
                      <TableHead>Referencia</TableHead>
                      <TableHead>IP</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {events.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          No se encontraron eventos de auditoría
                        </TableCell>
                      </TableRow>
                    ) : (
                      events.map((event) => (
                        <TableRow key={event.id}>
                          <TableCell className="font-mono text-xs">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDateTime(event.ts || event.created_at)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">
                                {event.user_nombre || `Usuario #${event.user_id}` || 'Sistema'}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getActionColor(event.accion)}>
                              {event.accion}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="flex items-center gap-1">
                              <span>{getTargetIcon(event.target || '')}</span>
                              {event.target || '-'}
                            </span>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {event.ref || '-'}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Globe className="h-3 w-3" />
                              {event.ip || '-'}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>Detalle del Evento</DialogTitle>
                                  <DialogDescription>
                                    ID: {event.id} | {formatDateTime(event.ts || event.created_at)}
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <p className="text-sm font-medium text-muted-foreground">Usuario</p>
                                      <p className="font-semibold">
                                        {event.user_nombre || `Usuario #${event.user_id}` || 'Sistema'}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium text-muted-foreground">Acción</p>
                                      <Badge className={getActionColor(event.accion)}>
                                        {event.accion}
                                      </Badge>
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium text-muted-foreground">Módulo</p>
                                      <p>{event.target || '-'}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium text-muted-foreground">Referencia</p>
                                      <p>{event.ref || '-'}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium text-muted-foreground">IP</p>
                                      <p className="font-mono text-sm">{event.ip || '-'}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium text-muted-foreground">User Agent</p>
                                      <p className="text-xs truncate" title={event.ua}>
                                        {event.ua?.substring(0, 50) || '-'}...
                                      </p>
                                    </div>
                                  </div>
                                  
                                  {event.before && Object.keys(event.before).length > 0 && (
                                    <div>
                                      <p className="text-sm font-medium text-muted-foreground mb-2">
                                        Estado Anterior
                                      </p>
                                      <pre className="bg-red-50 dark:bg-red-900/20 p-3 rounded text-xs overflow-auto max-h-40">
                                        {JSON.stringify(event.before, null, 2)}
                                      </pre>
                                    </div>
                                  )}
                                  
                                  {event.after && Object.keys(event.after).length > 0 && (
                                    <div>
                                      <p className="text-sm font-medium text-muted-foreground mb-2">
                                        Estado Nuevo
                                      </p>
                                      <pre className="bg-green-50 dark:bg-green-900/20 p-3 rounded text-xs overflow-auto max-h-40">
                                        {JSON.stringify(event.after, null, 2)}
                                      </pre>
                                    </div>
                                  )}
                                </div>
                              </DialogContent>
                            </Dialog>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Paginación */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Página {currentPage} de {totalPages} ({total} eventos)
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Anterior
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Siguiente
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
