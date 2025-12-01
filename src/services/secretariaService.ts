import { PreInscripcion, InscripcionEstado, Documento } from "@/lib/types-secretaria";

export class SecretariaService {
  // Obtener lista de pre-inscripciones
  static async getPreInscripciones(): Promise<PreInscripcion[]> {
    // TODO: Implementar llamada real a API
    return [];
  }

  // Obtener detalles de una pre-inscripción
  static async getPreInscripcion(id: string): Promise<PreInscripcion | null> {
    // TODO: Implementar llamada real a API
    return null;
  }

  // Actualizar estado de pre-inscripción
  static async actualizarEstado(id: string, estado: InscripcionEstado, observaciones?: string): Promise<void> {
    // TODO: Implementar llamada real a API
  }

  // Generar código RUDE
  static async generarCodigoRUDE(preInscripcionId: string, departamento: string, nivel: string): Promise<string> {
    // TODO: Implementar lógica real de generación
    const gestion = new Date().getFullYear();
    const correlativo = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `${departamento}-${gestion}-${nivel}-${correlativo}`;
  }

  // Validar documento
  static async validarDocumento(documentoId: string, estado: 'completo' | 'observado', observaciones?: string): Promise<void> {
    // TODO: Implementar llamada real a API
  }

  // Enviar notificación
  static async enviarNotificacion(destinatarioId: string, mensaje: string, tipo: 'whatsapp' | 'email'): Promise<void> {
    // TODO: Implementar integración con servicios de mensajería
  }

  // Obtener estadísticas
  static async getEstadisticas() {
    // TODO: Implementar llamada real a API
    return {
      porNivel: {
        inicial: 0,
        primaria: 0,
        secundaria: 0
      },
      tiemposProcesamiento: {
        revisionInicial: 0,
        validacionCompleta: 0,
        generacionRUDE: 0
      },
      documentosPendientes: 0,
      preInscripcionesPendientes: 0
    };
  }

  // Validación de documentos RUDE
  static validarDocumentosRUDE(documentos: Documento[]): {
    completo: boolean;
    faltantes: string[];
    observaciones: string[];
  } {
    const documentosRequeridos = [
      "Certificado de Nacimiento",
      "Carnet de Identidad",
      "Libreta Escolar",
      "Certificado de Vacunas"
    ];

    const faltantes = documentosRequeridos.filter(
      req => !documentos.some(doc => doc.tipo === req)
    );

    const observaciones = documentos
      .filter(doc => doc.estado === "observado")
      .map(doc => `${doc.tipo}: ${doc.observaciones}`);

    return {
      completo: faltantes.length === 0 && observaciones.length === 0,
      faltantes,
      observaciones
    };
  }

  // Formatear número RUDE
  static formatearRUDE(codigo: string): string {
    // Formato: DEP-GESTION-NIVEL-CORRELATIVO
    const parts = codigo.split("-");
    if (parts.length !== 4) return codigo;

    return parts.join("-");
  }
}