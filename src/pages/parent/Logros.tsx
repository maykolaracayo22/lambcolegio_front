// src/pages/parent/Logros.tsx
// CONECTADO AL BACKEND - Consume API real
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { 
  getChildAchievements, 
  getChildInfo,
  Achievement 
} from '@/services/parentPortalApi';
import {
  Award, Star, Trophy, Medal, Crown,
  Rocket, Heart, BookOpen, Target,
  Share2, Download, MessageSquare,
  RefreshCw
} from 'lucide-react';

export default function Logros() {
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Estado de carga
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Datos del backend
  const [logros, setLogros] = useState<Achievement[]>([]);
  const [childInfo, setChildInfo] = useState<{nombres: string; apellidos: string; curso: string; paralelo: string} | null>(null);
  
  // Filtro de categoría
  const [categoriaActiva, setCategoriaActiva] = useState('todos');

  // Obtener datos del backend
  const fetchAchievements = async () => {
    try {
      const data = await getChildAchievements();
      setLogros(data);
      
      // Obtener info del hijo
      const info = getChildInfo();
      if (info) {
        setChildInfo({
          nombres: info.nombres,
          apellidos: info.apellidos,
          curso: info.curso,
          paralelo: info.paralelo
        });
      }
      
    } catch (error) {
      console.error('Error fetching achievements:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los logros",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    const initFetch = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500));
      await fetchAchievements();
      setLoading(false);
    };
    initFetch();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAchievements();
    setRefreshing(false);
    toast({
      title: "Actualizado",
      description: "Logros actualizados correctamente",
    });
  };

  // Categorías disponibles
  const categorias = [
    { id: 'todos', label: 'Todos', icon: Crown },
    { id: 'academico', label: 'Académicos', icon: BookOpen },
    { id: 'asistencia', label: 'Asistencia', icon: Target },
    { id: 'social', label: 'Social', icon: Heart },
    { id: 'lectura', label: 'Lectura', icon: BookOpen },
    { id: 'deportes', label: 'Deportes', icon: Trophy },
  ];

  // Filtrar logros por categoría
  const logrosFiltrados = categoriaActiva === 'todos' 
    ? logros 
    : logros.filter(l => l.categoria.toLowerCase() === categoriaActiva);

  // Estadísticas de logros
  const logrosObtenidos = logros.length;
  const logrosPorNivel = {
    bronce: logros.filter(l => l.nivel === 'bronce').length,
    plata: logros.filter(l => l.nivel === 'plata').length,
    oro: logros.filter(l => l.nivel === 'oro').length,
    platino: logros.filter(l => l.nivel === 'platino').length,
  };

  // Helpers de UI
  const getNivelColor = (nivel: Achievement['nivel']) => {
    switch (nivel) {
      case 'bronce': return 'text-amber-700 bg-amber-100 border-amber-300';
      case 'plata': return 'text-gray-600 bg-gray-100 border-gray-300';
      case 'oro': return 'text-yellow-600 bg-yellow-100 border-yellow-400';
      case 'platino': return 'text-purple-600 bg-purple-100 border-purple-400';
      default: return 'text-gray-500 bg-gray-100';
    }
  };

  const getIconoLogro = (categoria: string) => {
    switch (categoria.toLowerCase()) {
      case 'academico': return BookOpen;
      case 'asistencia': return Target;
      case 'social': return Heart;
      case 'lectura': return BookOpen;
      case 'deportes': return Trophy;
      default: return Star;
    }
  };

  // Compartir logros
  const compartirLogros = () => {
    const mensaje = `¡Mi hijo(a) ${childInfo?.nombres || ''} ha obtenido ${logrosObtenidos} logros! 🏆`;
    if (navigator.share) {
      navigator.share({ title: 'Logros Escolares', text: mensaje });
    } else {
      navigator.clipboard.writeText(mensaje);
      toast({
        title: "Copiado",
        description: "Mensaje copiado al portapapeles",
      });
    }
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-28" />
            <Skeleton className="h-10 w-28" />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1,2,3].map(i => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="flex gap-2">
          {[1,2,3,4,5].map(i => (
            <Skeleton key={i} className="h-10 w-24" />
          ))}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-32 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <header className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="text-sm">
              {childInfo?.curso} "{childInfo?.paralelo}"
            </Badge>
            <div>
              <h1 className="text-2xl font-bold">Logros y Medallas</h1>
              <p className="text-muted-foreground">
                {childInfo ? `${childInfo.nombres} ${childInfo.apellidos}` : 'Mi hijo(a)'}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button 
              variant="outline" 
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>
            <Button variant="outline" onClick={compartirLogros}>
              <Share2 className="h-5 w-5 mr-2" />
              Compartir
            </Button>
          </div>
        </div>
      </header>

      {/* Resumen de Logros */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm text-muted-foreground">Total de Logros</p>
              <Trophy className="h-5 w-5 text-yellow-500" />
            </div>
            <p className="text-3xl font-bold">{logrosObtenidos}</p>
            <p className="text-sm text-muted-foreground mt-1">
              logros obtenidos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm text-muted-foreground">Medallas de Oro</p>
              <Medal className="h-5 w-5 text-yellow-500" />
            </div>
            <p className="text-3xl font-bold">{logrosPorNivel.oro}</p>
            <p className="text-sm text-muted-foreground mt-1">
              máximo reconocimiento
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm text-muted-foreground">Medallas de Plata</p>
              <Medal className="h-5 w-5 text-gray-400" />
            </div>
            <p className="text-3xl font-bold">{logrosPorNivel.plata}</p>
            <p className="text-sm text-muted-foreground mt-1">
              excelente desempeño
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm text-muted-foreground">Medallas de Bronce</p>
              <Medal className="h-5 w-5 text-amber-700" />
            </div>
            <p className="text-3xl font-bold">{logrosPorNivel.bronce}</p>
            <p className="text-sm text-muted-foreground mt-1">
              buen inicio
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros de Categoría */}
      <div className="flex flex-wrap gap-2">
        {categorias.map(cat => {
          const Icon = cat.icon;
          return (
            <Button
              key={cat.id}
              variant={categoriaActiva === cat.id ? 'default' : 'outline'}
              onClick={() => setCategoriaActiva(cat.id)}
              className="flex items-center gap-2"
            >
              <Icon className="h-4 w-4" />
              {cat.label}
            </Button>
          );
        })}
      </div>

      {/* Lista de Logros */}
      {logrosFiltrados.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Sin logros todavía</h3>
            <p className="text-muted-foreground">
              {logros.length === 0 
                ? "Aún no hay logros registrados. ¡Sigue esforzándote!"
                : "No hay logros en esta categoría"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {logrosFiltrados.map(logro => {
            const Icon = getIconoLogro(logro.categoria);

            return (
              <Card key={logro.id} className="hover:shadow-lg transition-shadow border-2 border-transparent hover:border-primary/20">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-center mb-4">
                    <div className={`p-3 rounded-full ${getNivelColor(logro.nivel)}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <Badge className={`${getNivelColor(logro.nivel)} capitalize`}>
                      {logro.nivel}
                    </Badge>
                  </div>

                  <h3 className="font-semibold text-lg mb-1">{logro.titulo}</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    {logro.descripcion}
                  </p>

                  <div className="flex items-center justify-between text-sm">
                    <Badge variant="outline">{logro.categoria}</Badge>
                    <span className="text-muted-foreground">
                      {new Date(logro.fecha).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Guía y Ayuda */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-blue-500" />
            ¿Cómo obtener más logros?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="space-y-2">
              <h3 className="font-medium flex items-center gap-2">
                <Target className="h-4 w-4 text-green-500" />
                Asistencia
              </h3>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Llegar puntual a clases</li>
                <li>• Mantener asistencia regular</li>
                <li>• Participar en actividades</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-blue-500" />
                Académico
              </h3>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Completar todas las tareas</li>
                <li>• Participar activamente en clase</li>
                <li>• Mantener buenas calificaciones</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium flex items-center gap-2">
                <Heart className="h-4 w-4 text-pink-500" />
                Social
              </h3>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Ayudar a compañeros</li>
                <li>• Participar en grupos</li>
                <li>• Mostrar buen comportamiento</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
