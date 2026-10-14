// src/pages/student/Tareas.tsx
// CONECTADO AL BACKEND - Consume API real
import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { 
  CalendarDays, BookOpen, Clock, Search, Filter, Download,
  CheckCircle, Loader, XCircle, AlertTriangle, ListTodo, RefreshCw,
  Paperclip, Link as LinkIcon, Youtube, Send, FileText
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { getMyTasks, getMyProfile, StudentProfile, StudentTask } from '@/services/studentPortalApi';
import { saveTaskSubmission, deleteTaskSubmission, listTaskSubmissions, type TaskAttachment, type TaskAttachmentKind, type TaskSubmission } from '@/services/taskSubmissionsStore';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

export default function Tareas() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tasks, setTasks] = useState<StudentTask[]>([]);
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null);
  const [submissions, setSubmissions] = useState<TaskSubmission[]>([]);
  const [taskToSubmit, setTaskToSubmit] = useState<StudentTask | null>(null);
  const [attachmentKind, setAttachmentKind] = useState<TaskAttachmentKind>('archivo');
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [attachments, setAttachments] = useState<TaskAttachment[]>([]);
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [sending, setSending] = useState(false);
  const [submissionToCancel, setSubmissionToCancel] = useState<TaskSubmission | null>(null);
  const [canceling, setCanceling] = useState(false);
  const [filterCourse, setFilterCourse] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Cargar tareas desde el backend
  const fetchTasks = async (showToast = false) => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      if (showToast) setRefreshing(true);
      
      const [data, profile] = await Promise.all([getMyTasks(), getMyProfile()]);
      const sent = await listTaskSubmissions(data.map((task) => task.id));
      const ownSubmissions = sent.filter((submission) => submission.studentId === profile.id);
      const sentTaskIds = new Set(ownSubmissions.map((submission) => submission.taskId));
      setStudentProfile(profile);
      setSubmissions(ownSubmissions);
      setTasks(data.map((task) => sentTaskIds.has(task.id) ? { ...task, estado: 'entregado' } : task));

      if (showToast) {
        toast({
          title: "Tareas actualizadas",
          description: "Se han cargado las tareas más recientes",
        });
      }
    } catch (error) {
      console.error('Error cargando tareas:', error);
      if (showToast) {
        toast({
          title: "Error",
          description: "No se pudieron cargar las tareas",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      fetchTasks();
    } else {
      const timer = setTimeout(() => fetchTasks(), 500);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    const refresh = () => { void fetchTasks(); };
    window.addEventListener('task-submissions-updated', refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener('task-submissions-updated', refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);

  useEffect(() => {
    const refresh = () => { void fetchTasks(); };
    window.addEventListener('teacher-tasks-updated', refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener('teacher-tasks-updated', refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);

  const availableCourses = useMemo(() => {
    const courses = new Set(tasks.map(t => t.materia));
    return ['all', ...Array.from(courses)];
  }, [tasks]);

  // Filtrar tareas
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesCourse = filterCourse === 'all' || task.materia === filterCourse;
      const matchesStatus = filterStatus === 'all' || task.estado === filterStatus;
      const matchesSearch = 
        (task.titulo?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
        (task.descripcion?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
        (task.materia?.toLowerCase().includes(searchQuery.toLowerCase()) || false);
      return matchesCourse && matchesStatus && matchesSearch;
    }).sort((a, b) => {
      const pendingOrder = Number(b.estado === 'pendiente') - Number(a.estado === 'pendiente');
      return pendingOrder || new Date(a.fecha_entrega).getTime() - new Date(b.fecha_entrega).getTime();
    });
  }, [tasks, filterCourse, filterStatus, searchQuery]);

  // Estadísticas
  const taskStatistics = useMemo(() => ({
    totalTasks: tasks.length,
    pending: tasks.filter(t => t.estado === 'pendiente').length,
    completed: tasks.filter(t => t.estado === 'entregado' || t.estado === 'calificado').length,
    overdue: tasks.filter(t => t.estado === 'vencido').length,
    highPriority: tasks.filter(t => t.prioridad === 'alta' && t.estado === 'pendiente').length,
  }), [tasks]);

  const isSubmissionOpen = (task: StudentTask) => {
    const [year, month, day] = task.fecha_entrega.split('-').map(Number);
    const deadline = new Date(year, month - 1, day, 23, 59, 59, 999);
    return Number.isFinite(deadline.getTime()) && Date.now() <= deadline.getTime();
  };

  const openSubmissionDialog = (task: StudentTask) => {
    setTaskToSubmit(task);
    setAttachmentKind('archivo');
    setPendingFiles([]);
    setAttachments([]);
    setAttachmentUrl('');
  };

  const handleSubmitTask = async () => {
    if (!taskToSubmit || !studentProfile) return;
    if (!isSubmissionOpen(taskToSubmit)) {
      toast({ title: 'Plazo vencido', description: 'El tiempo para enviar esta tarea se ha acabado.', variant: 'destructive' });
      return;
    }

    const newAttachments: TaskAttachment[] = [];
    if (attachmentKind === 'archivo') {
      newAttachments.push(...pendingFiles.map((file) => ({ id: crypto.randomUUID(), kind: 'archivo' as const, name: file.name, file })));
    }
    if (attachmentKind !== 'archivo' && attachmentUrl.trim()) {
      try {
        const parsed = new URL(attachmentUrl.trim());
        if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('URL inválida');
        const host = parsed.hostname.toLowerCase();
        const isYoutube = host === 'youtu.be' || host === 'youtube.com' || host.endsWith('.youtube.com');
        if (attachmentKind === 'youtube' && !isYoutube) throw new Error('URL de YouTube inválida');
        newAttachments.push({ id: crypto.randomUUID(), kind: attachmentKind, url: parsed.toString() });
      } catch {
        toast({ title: 'Enlace inválido', description: attachmentKind === 'youtube' ? 'Ingresa un enlace válido de YouTube.' : 'Ingresa una URL completa que comience con https://', variant: 'destructive' });
        return;
      }
    }

    const allAttachments = [...attachments, ...newAttachments];
    if (!allAttachments.length) {
      toast({ title: 'Adjunta tu trabajo', description: 'Agrega uno o varios archivos o enlaces antes de enviar.', variant: 'destructive' });
      return;
    }

    setSending(true);
    try {
      const submission: TaskSubmission = {
        id: `${studentProfile.id}:${taskToSubmit.id}`,
        taskId: taskToSubmit.id,
        studentId: studentProfile.id,
        studentName: `${studentProfile.nombres} ${studentProfile.apellidos}`,
        submittedAt: new Date().toISOString(),
        attachments: allAttachments,
      };
      await saveTaskSubmission(submission);
      setSubmissions((current) => [submission, ...current.filter((item) => item.id !== submission.id)]);
      setTasks((current) => current.map((item) => item.id === taskToSubmit.id ? { ...item, estado: 'entregado' } : item));
      setTaskToSubmit(null);
      toast({ title: 'Tarea enviada', description: 'Tu entrega quedó registrada para el docente.' });
    } catch (error) {
      console.error('No se pudo guardar la entrega:', error);
      toast({ title: 'No se pudo enviar', description: 'Revisa el espacio disponible del navegador e inténtalo de nuevo.', variant: 'destructive' });
    } finally {
      setSending(false);
    }
  };

  const handleCancelSubmission = async () => {
    if (!submissionToCancel) return;
    const task = tasks.find((item) => item.id === submissionToCancel.taskId);
    const canResend = task ? isSubmissionOpen(task) : false;
    setCanceling(true);
    try {
      await deleteTaskSubmission(submissionToCancel.id);
      setSubmissions((current) => current.filter((item) => item.id !== submissionToCancel.id));
      if (task) setTasks((current) => current.map((item) => item.id === task.id ? { ...item, estado: isSubmissionOpen(task) ? 'pendiente' : 'vencido' } : item));
      toast({ title: 'Envío cancelado', description: canResend ? 'Puedes corregirlo y volver a enviar mientras el plazo siga abierto.' : 'El plazo ya venció; no podrás volver a enviar esta tarea.' });
      setSubmissionToCancel(null);
    } catch (error) {
      console.error('No se pudo cancelar el envío:', error);
      toast({ title: 'No se pudo cancelar', description: 'Inténtalo de nuevo.', variant: 'destructive' });
    } finally {
      setCanceling(false);
    }
  };

  const formatDueDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('es-BO', { 
      weekday: 'short', 
      day: 'numeric', 
      month: 'short',
      year: 'numeric'
    });
  };

  const formatSubmittedAt = (dateStr: string) => new Date(dateStr).toLocaleString('es-BO', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });

  const getStatusBadge = (status: StudentTask['estado']) => {
    switch (status) {
      case 'pendiente': return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Pendiente</Badge>;
      case 'entregado': return <Badge variant="default" className="bg-yellow-100 text-yellow-800">Entregada</Badge>;
      case 'calificado': return <Badge variant="default" className="bg-green-100 text-green-800">Calificada</Badge>;
      case 'vencido': return <Badge variant="destructive" className="bg-red-100 text-red-800">Vencida</Badge>;
      default: return <Badge variant="outline">Desconocido</Badge>;
    }
  };

  const getPriorityBadge = (priority: StudentTask['prioridad']) => {
    switch (priority) {
      case 'baja': return <Badge variant="outline" className="text-gray-600 border-gray-300">Baja</Badge>;
      case 'media': return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Media</Badge>;
      case 'alta': return <Badge variant="destructive" className="bg-orange-100 text-orange-800">Alta</Badge>;
      default: return null;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 p-4">
        <div className="flex justify-between items-center">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-6 w-24 mb-2" />
                <Skeleton className="h-8 w-12" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-6 w-full mb-2" />
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Mis Tareas</h1>
          <p className="text-muted-foreground">
            Revisa y gestiona tus tareas asignadas.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button 
            variant="outline"
            onClick={() => fetchTasks(true)}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button variant="default">
            <ListTodo className="h-4 w-4 mr-2" />
            Completadas
          </Button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total de Tareas</p>
              <p className="text-2xl font-bold">{taskStatistics.totalTasks}</p>
            </div>
            <ListTodo className="h-6 w-6 text-gray-500" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Pendientes</p>
              <p className="text-2xl font-bold text-blue-600">{taskStatistics.pending}</p>
            </div>
            <Loader className="h-6 w-6 text-blue-500" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Vencidas</p>
              <p className="text-2xl font-bold text-red-600">{taskStatistics.overdue}</p>
            </div>
            <AlertTriangle className="h-6 w-6 text-red-500" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Prioridad Alta</p>
              <p className="text-2xl font-bold text-orange-600">{taskStatistics.highPriority}</p>
            </div>
            <XCircle className="h-6 w-6 text-orange-500" />
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-4">
        <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center">
            <div className="flex-1 relative w-full min-w-0">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar tarea..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full lg:w-auto">
              <Select value={filterCourse} onValueChange={setFilterCourse}>
                <SelectTrigger className="w-full sm:min-w-[180px]">
                  <BookOpen className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Materia" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las Materias</SelectItem>
                  {availableCourses.filter(c => c !== 'all').map(course => (
                    <SelectItem key={course} value={course}>
                      {course}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full sm:min-w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los Estados</SelectItem>
                  <SelectItem value="pendiente">Pendientes</SelectItem>
                  <SelectItem value="entregado">Entregadas</SelectItem>
                  <SelectItem value="calificado">Calificadas</SelectItem>
                  <SelectItem value="vencido">Vencidas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Tareas */}
      <h2 className="text-xl font-semibold text-foreground mt-6">
        {filterStatus === 'pendiente' ? 'Tareas Pendientes' : 
         filterStatus === 'entregado' ? 'Tareas Entregadas' :
         filterStatus === 'calificado' ? 'Tareas Calificadas' :
         filterStatus === 'vencido' ? 'Tareas Vencidas' : 'Todas las Tareas'}
      </h2>

      {filteredTasks.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <ListTodo className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">Sin tareas</h3>
            <p className="text-muted-foreground">
              {tasks.length === 0 
                ? 'No tienes tareas asignadas aún.'
                : 'No hay tareas que coincidan con los filtros.'
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 items-stretch">
          {filteredTasks.map((task) => (
            <Card 
              key={task.id} 
              className={`relative min-w-0 overflow-hidden group border-2 shadow-sm hover:shadow-md transition-shadow duration-200 h-full flex flex-col
                ${task.estado === 'vencido' ? 'border-rose-500 bg-rose-50/20' :
                  task.estado === 'entregado' ? 'border-emerald-500 bg-emerald-50/20' :
                  task.estado === 'calificado' ? 'border-green-500 bg-green-50/20' :
                  task.prioridad === 'alta' ? 'border-orange-500 bg-orange-50/20' : 'border-blue-400'}
              `}
            >
              <div className="min-w-0">
                <CardHeader className="pb-0 min-w-0">
                  <CardTitle className="min-w-0 whitespace-normal break-words text-base font-semibold text-foreground border-b border-muted-foreground/20 pb-2 mb-1">
                    {task.materia}
                  </CardTitle>
                  <CardDescription className="flex items-start min-w-0 whitespace-normal break-words text-xs text-muted-foreground mb-2">
                    <Clock className="h-3 w-3 mr-1" />
                    {task.docente}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-0 min-w-0">
                  <h4 className="font-medium text-sm mb-1 break-words">{task.titulo}</h4>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2 break-words">
                    {task.descripcion || 'Sin descripción'}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    {getStatusBadge(task.estado)}
                    {getPriorityBadge(task.prioridad)}
                    {task.nota !== undefined && (
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-700">
                        Nota: {task.nota}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </div>

              <div 
                className={`flex flex-wrap items-center justify-center gap-x-1 p-3 text-center text-white text-xs font-medium mt-auto
                  ${task.estado === 'vencido' ? 'bg-red-500' : 
                    task.prioridad === 'alta' && task.estado === 'pendiente' ? 'bg-orange-500' : 
                    task.estado === 'calificado' ? 'bg-emerald-500' : 'bg-purple-600'}
                `}
              >
                <CalendarDays className="h-3 w-3 mr-1" />
                <span>Entrega: {formatDueDate(task.fecha_entrega)}</span>
              </div>
              <div className="p-3 pt-2 min-w-0">
                {submissions.some((submission) => submission.taskId === task.id) ? (
                  <div className="flex flex-col items-stretch gap-3">
                    <div className="flex min-w-0 flex-col gap-1">
                      <Badge className="bg-green-100 text-green-800">Trabajo enviado</Badge>
                      <span className="text-xs text-muted-foreground break-words">Enviado: {formatSubmittedAt(submissions.find((submission) => submission.taskId === task.id)!.submittedAt)}</span>
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      <Button className="w-full whitespace-normal" variant="outline" size="sm" onClick={() => openSubmissionDialog(task)}><Paperclip className="h-4 w-4 mr-2 shrink-0" />{isSubmissionOpen(task) ? 'Reenviar' : 'Ver entrega'}</Button>
                      <Button className="w-full whitespace-normal" variant="destructive" size="sm" onClick={() => setSubmissionToCancel(submissions.find((submission) => submission.taskId === task.id) || null)}><XCircle className="h-4 w-4 mr-1 shrink-0" />Cancelar envío</Button>
                    </div>
                  </div>
                ) : isSubmissionOpen(task) ? (
                  <Button className="w-full" onClick={() => openSubmissionDialog(task)}>
                    <Paperclip className="h-4 w-4 mr-2" /> Adjuntar y enviar
                  </Button>
                ) : (
                  <p className="text-xs font-medium text-red-600">El tiempo para enviar este trabajo se ha acabado.</p>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={Boolean(taskToSubmit)} onOpenChange={(open) => { if (!open && !sending) setTaskToSubmit(null); }}>
        <DialogContent className="w-[calc(100vw-1.5rem)] max-h-[90dvh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Enviar tarea</DialogTitle>
            <DialogDescription>
              {taskToSubmit?.titulo} · Fecha límite: {taskToSubmit ? formatDueDate(taskToSubmit.fecha_entrega) : ''}
            </DialogDescription>
          </DialogHeader>

          {taskToSubmit && !isSubmissionOpen(taskToSubmit) && (
            <p className="rounded-md bg-red-50 p-3 text-sm font-medium text-red-700">
              El tiempo para enviar este trabajo se ha acabado. Ya no se aceptan nuevas entregas.
            </p>
          )}

          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-2">Adjuntar como</p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                <Button type="button" variant={attachmentKind === 'archivo' ? 'default' : 'outline'} onClick={() => setAttachmentKind('archivo')}>
                  <FileText className="h-4 w-4 mr-1" /> Archivo
                </Button>
                <Button type="button" variant={attachmentKind === 'enlace' ? 'default' : 'outline'} onClick={() => setAttachmentKind('enlace')}>
                  <LinkIcon className="h-4 w-4 mr-1" /> Enlace
                </Button>
                <Button type="button" variant={attachmentKind === 'youtube' ? 'default' : 'outline'} onClick={() => setAttachmentKind('youtube')}>
                  <Youtube className="h-4 w-4 mr-1" /> YouTube
                </Button>
              </div>
            </div>

            {attachmentKind === 'archivo' ? (
              <div className="space-y-2">
                <label htmlFor="student-task-file" className="text-sm font-medium">Selecciona el archivo</label>
                <Input id="student-task-file" type="file" multiple onChange={(event) => setPendingFiles(Array.from(event.target.files || []))} />
                {!!pendingFiles.length && <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:justify-between"><p className="text-xs text-muted-foreground">{pendingFiles.length} archivo(s) seleccionado(s)</p><Button className="w-full sm:w-auto" type="button" size="sm" variant="outline" onClick={() => { setAttachments((current) => [...current, ...pendingFiles.map((file) => ({ id: crypto.randomUUID(), kind: 'archivo' as const, name: file.name, file }))]); setPendingFiles([]); const input = document.getElementById('student-task-file') as HTMLInputElement | null; if (input) input.value = ''; }}>Agregar archivos</Button></div>}
              </div>
            ) : (
              <div className="space-y-2">
                <label htmlFor="student-task-url" className="text-sm font-medium">
                  {attachmentKind === 'youtube' ? 'Enlace del video de YouTube' : 'Enlace del trabajo'}
                </label>
                <Input
                  id="student-task-url"
                  type="url"
                  value={attachmentUrl}
                  onChange={(event) => setAttachmentUrl(event.target.value)}
                  placeholder={attachmentKind === 'youtube' ? 'https://youtu.be/...' : 'https://...'}
                />
                <Button className="w-full sm:w-auto" type="button" variant="outline" size="sm" disabled={!attachmentUrl.trim()} onClick={() => { try { const parsed = new URL(attachmentUrl.trim()); if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error(); const host = parsed.hostname.toLowerCase(); const youtube = host === 'youtu.be' || host === 'youtube.com' || host.endsWith('.youtube.com'); if (attachmentKind === 'youtube' && !youtube) throw new Error(); setAttachments((current) => [...current, { id: crypto.randomUUID(), kind: attachmentKind, url: parsed.toString() }]); setAttachmentUrl(''); } catch { toast({ title: 'Enlace inválido', description: attachmentKind === 'youtube' ? 'Ingresa un enlace válido de YouTube.' : 'Ingresa una URL completa que comience con https://', variant: 'destructive' }); } }}>Agregar enlace</Button>
              </div>
            )}
            {attachments.length > 0 && <div className="space-y-2"><p className="text-sm font-medium">Adjuntos para enviar ({attachments.length})</p>{attachments.map((attachment) => <div key={attachment.id} className="flex min-w-0 items-start justify-between gap-2 rounded border p-2 text-sm"><span className="min-w-0 break-all">{attachment.kind === 'archivo' ? attachment.name : attachment.url}</span><Button className="shrink-0" type="button" size="icon" variant="ghost" aria-label="Quitar adjunto" onClick={() => setAttachments((current) => current.filter((item) => item.id !== attachment.id))}><XCircle className="h-4 w-4" /></Button></div>)}</div>}
          </div>

          <DialogFooter className="flex-col-reverse sm:flex-row">
            <Button className="w-full sm:w-auto" type="button" variant="outline" onClick={() => setTaskToSubmit(null)} disabled={sending}>Cancelar</Button>
            <Button className="w-full sm:w-auto" type="button" onClick={handleSubmitTask} disabled={sending || !taskToSubmit || !isSubmissionOpen(taskToSubmit)}>
              <Send className="h-4 w-4 mr-2" />{sending ? 'Enviando...' : 'Enviar trabajo'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <AlertDialog open={Boolean(submissionToCancel)} onOpenChange={(open) => { if (!open && !canceling) setSubmissionToCancel(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>¿Cancelar este envío?</AlertDialogTitle><AlertDialogDescription>Se quitará la entrega de la vista del docente. {submissionToCancel && tasks.find((task) => task.id === submissionToCancel.taskId) && !isSubmissionOpen(tasks.find((task) => task.id === submissionToCancel.taskId)!) ? 'El plazo ya venció, así que no podrás volver a enviarla.' : 'Podrás corregirla y enviarla de nuevo mientras el plazo siga abierto.'}</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel disabled={canceling}>Volver</AlertDialogCancel><AlertDialogAction onClick={(event) => { event.preventDefault(); void handleCancelSubmission(); }} disabled={canceling}>{canceling ? 'Cancelando...' : 'Sí, cancelar envío'}</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
