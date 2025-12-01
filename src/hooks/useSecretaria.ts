import { useState, useEffect } from 'react';
import { PreInscripcion, InscripcionEstado } from '@/lib/types-secretaria';
import { SecretariaService } from '@/services/secretariaService';

export function useSecretaria() {
  const [preInscripciones, setPreInscripciones] = useState<PreInscripcion[]>([]);
  const [estadisticas, setEstadisticas] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar pre-inscripciones
  const cargarPreInscripciones = async () => {
    try {
      const data = await SecretariaService.getPreInscripciones();
      setPreInscripciones(data);
      setError(null);
    } catch (e) {
      setError('Error al cargar pre-inscripciones');
      console.error(e);
    }
  };

  // Cargar estadísticas
  const cargarEstadisticas = async () => {
    try {
      const data = await SecretariaService.getEstadisticas();
      setEstadisticas(data);
      setError(null);
    } catch (e) {
      setError('Error al cargar estadísticas');
      console.error(e);
    }
  };

  // Actualizar estado de pre-inscripción
  const actualizarEstado = async (id: string, estado: InscripcionEstado, observaciones?: string) => {
    try {
      await SecretariaService.actualizarEstado(id, estado, observaciones);
      await cargarPreInscripciones(); // Recargar lista
      setError(null);
    } catch (e) {
      setError('Error al actualizar estado');
      console.error(e);
    }
  };

  // Generar código RUDE
  const generarRUDE = async (preInscripcionId: string, departamento: string, nivel: string) => {
    try {
      const codigo = await SecretariaService.generarCodigoRUDE(preInscripcionId, departamento, nivel);
      setError(null);
      return codigo;
    } catch (e) {
      setError('Error al generar código RUDE');
      console.error(e);
      return null;
    }
  };

  // Enviar notificación
  const enviarNotificacion = async (destinatarioId: string, mensaje: string, tipo: 'whatsapp' | 'email') => {
    try {
      await SecretariaService.enviarNotificacion(destinatarioId, mensaje, tipo);
      setError(null);
    } catch (e) {
      setError('Error al enviar notificación');
      console.error(e);
    }
  };

  // Cargar datos iniciales
  useEffect(() => {
    const inicializar = async () => {
      setLoading(true);
      await Promise.all([
        cargarPreInscripciones(),
        cargarEstadisticas()
      ]);
      setLoading(false);
    };

    inicializar();
  }, []);

  return {
    preInscripciones,
    estadisticas,
    loading,
    error,
    actualizarEstado,
    generarRUDE,
    enviarNotificacion,
    cargarPreInscripciones,
    cargarEstadisticas
  };
}