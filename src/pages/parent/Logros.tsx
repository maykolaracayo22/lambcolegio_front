import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import {
  Award, Star, Trophy, Medal, Crown,
  Rocket, Heart, BookOpen, Target,
  Share2, Download, MessageSquare
} from 'lucide-react';
import NivelBadge from '@/components/ui/badge';

interface Logro {
  id: number;
  titulo: string;
  descripcion: string;
  categoria: string;
  progreso: number;
  total: number;
  fechaObtencion?: string;
  icon: typeof Star;
  color: string;
}

export default function Logros() {
  const [categoriaActiva, setCategoriaActiva] = useState('todos');

  const logros: Logro[] = [
    {
      id: 1,
      titulo: 'Asistencia Perfecta',
      descripcion: '100% de asistencia durante un mes',
      categoria: 'asistencia',
      progreso: 28,
      total: 30,
      icon: Star,
      color: 'text-yellow-500'
    },
    {
      id: 2,
      titulo: 'Excelencia Académica',
      descripcion: 'Promedio superior a 90 en todas las materias',
      categoria: 'academico',
      progreso: 85,
      total: 100,
      icon: Trophy,
      color: 'text-purple-500'
    },
    {
      id: 3,
      titulo: 'Lector Ávido',
      descripcion: 'Lee 10 libros en el bimestre',
      categoria: 'lectura',
      progreso: 7,
      total: 10,
      icon: BookOpen,
      color: 'text-blue-500'
    },
    {
      id: 4,
      titulo: 'Compañero Ejemplar',
      descripcion: 'Ayuda constantemente a sus compañeros',
      categoria: 'social',
      progreso: 100,
      total: 100,
      fechaObtencion: '2025-10-15',
      icon: Heart,
      color: 'text-pink-500'
    }
  ];

  const categorias = [
    { id: 'todos', label: 'Todos', icon: Crown },
    { id: 'academico', label: 'Académicos', icon: BookOpen },
    { id: 'asistencia', label: 'Asistencia', icon: Target },
    { id: 'social', label: 'Social', icon: Heart },
    { id: 'lectura', label: 'Lectura', icon: BookOpen }
  ];

  const logrosFiltrados = categoriaActiva === 'todos' 
    ? logros 
    : logros.filter(l => l.categoria === categoriaActiva);

  const logrosObtenidos = logros.filter(l => l.progreso === l.total).length;
  const proximosLogros = logros.filter(l => l.progreso >= l.total * 0.7 && l.progreso < l.total).length;

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <header className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <NivelBadge nivel="Primaria" />
            <div>
              <h1 className="text-2xl font-bold">Logros y Medallas</h1>
              <p className="text-muted-foreground">Juan Pérez - 4to Primaria "A"</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="lg">
              <Share2 className="h-5 w-5 mr-2" />
              Compartir
            </Button>
            <Button variant="outline" size="lg">
              <Download className="h-5 w-5 mr-2" />
              Descargar
            </Button>
          </div>
        </div>
      </header>

      {/* Resumen de Logros */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm text-muted-foreground">Logros Obtenidos</p>
              <Trophy className="h-5 w-5 text-yellow-500" />
            </div>
            <p className="text-3xl font-bold">{logrosObtenidos}</p>
            <p className="text-sm text-muted-foreground mt-1">
              de {logros.length} totales
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm text-muted-foreground">Próximos a Alcanzar</p>
              <Rocket className="h-5 w-5 text-purple-500" />
            </div>
            <p className="text-3xl font-bold">{proximosLogros}</p>
            <p className="text-sm text-muted-foreground mt-1">¡Casi allí!</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm text-muted-foreground">Posición en la Clase</p>
              <Medal className="h-5 w-5 text-blue-500" />
            </div>
            <p className="text-3xl font-bold">#3</p>
            <p className="text-sm text-muted-foreground mt-1">
              de 25 estudiantes
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {logrosFiltrados.map(logro => {
          const Icon = logro.icon;
          const porcentaje = (logro.progreso / logro.total) * 100;
          const completado = porcentaje === 100;

          return (
            <Card key={logro.id} className={completado ? 'border-green-500' : ''}>
              <CardContent className="pt-6">
                <div className="flex justify-between items-center mb-4">
                  <div className={`p-2 rounded-full ${completado ? 'bg-green-100' : 'bg-gray-100'}`}>
                    <Icon className={`h-6 w-6 ${completado ? 'text-green-500' : logro.color}`} />
                  </div>
                  <Badge variant={completado ? 'default' : 'outline'}>
                    {porcentaje.toFixed(0)}%
                  </Badge>
                </div>

                <h3 className="font-medium mb-1">{logro.titulo}</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  {logro.descripcion}
                </p>

                <div className="space-y-2">
                  <Progress value={porcentaje} />
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {logro.progreso} de {logro.total}
                    </span>
                    {logro.fechaObtencion && (
                      <span className="text-green-600">
                        ¡Obtenido el {new Date(logro.fechaObtencion).toLocaleDateString('es-ES')}!
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

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
              <h3 className="font-medium">Asistencia</h3>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Llegar puntual a clases</li>
                <li>• Mantener asistencia regular</li>
                <li>• Participar en actividades</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium">Académico</h3>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Completar todas las tareas</li>
                <li>• Participar en clase</li>
                <li>• Mantener buenas notas</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium">Social</h3>
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