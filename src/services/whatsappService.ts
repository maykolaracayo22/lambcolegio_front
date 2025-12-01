export interface WhatsAppMessage {
  to: string;
  template?: {
    name: string;
    language: {
      code: string;
    };
    components: Array<{
      type: string;
      parameters: Array<{
        type: string;
        text?: string;
        currency?: {
          fallback_value: string;
          code: string;
          amount_1000: number;
        };
        date_time?: {
          fallback_value: string;
          timestamp: string;
        };
      }>;
    }>;
  };
  text?: {
    body: string;
  };
}

export interface NotificationRecipient {
  id: string;
  nombre: string;
  telefono: string;
  email?: string;
  preferencia?: 'whatsapp' | 'email' | 'ambos';
}

export class WhatsAppService {
  private static API_URL = import.meta.env.VITE_WHATSAPP_API_URL;
  private static API_TOKEN = import.meta.env.VITE_WHATSAPP_API_TOKEN;

  // Plantillas predefinidas
  private static TEMPLATES = {
    documentosFaltantes: "documentos_faltantes",
    inscripcionAprobada: "inscripcion_aprobada",
    recordatorio: "recordatorio_documentos",
    resumenProgreso: "resumen_progreso",
    alertaCalificacion: "alerta_calificacion",
    recordatorioTarea: "recordatorio_tarea"
  };

  private static validarConfiguracion(): boolean {
    if (!this.API_URL || !this.API_TOKEN) {
      console.error(
        "Error: Variables de entorno de WhatsApp no configuradas. " +
        "Asegúrese de configurar VITE_WHATSAPP_API_URL y VITE_WHATSAPP_API_TOKEN en el archivo .env"
      );
      return false;
    }
    return true;
  }

  static async enviarMensaje(message: WhatsAppMessage): Promise<boolean> {
    try {
      if (!this.validarConfiguracion()) {
        throw new Error("Configuración de WhatsApp incompleta");
      }

      if (import.meta.env.DEV) {
        // En desarrollo, solo simulamos el envío
        console.log("Simulando envío de mensaje WhatsApp:", message);
        return true;
      }

      const response = await fetch(this.API_URL + "/messages", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(message),
      });

      if (!response.ok) {
        throw new Error(`Error al enviar mensaje: ${response.statusText}`);
      }

      const result = await response.json();
      return true;
    } catch (error) {
      console.error("Error al enviar mensaje WhatsApp:", error);
      return false;
    }
  }

  static async enviarNotificacionDocumentosFaltantes(
    recipient: NotificationRecipient,
    documentosFaltantes: string[]
  ): Promise<boolean> {
    const message: WhatsAppMessage = {
      to: recipient.telefono,
      template: {
        name: this.TEMPLATES.documentosFaltantes,
        language: { code: "es" },
        components: [
          {
            type: "body",
            parameters: [
              { type: "text", text: recipient.nombre },
              { 
                type: "text", 
                text: documentosFaltantes.join(", ")
              }
            ]
          }
        ]
      }
    };

    return this.enviarMensaje(message);
  }

  static async enviarNotificacionInscripcionAprobada(
    recipient: NotificationRecipient,
    codigoRUDE: string
  ): Promise<boolean> {
    const message: WhatsAppMessage = {
      to: recipient.telefono,
      template: {
        name: this.TEMPLATES.inscripcionAprobada,
        language: { code: "es" },
        components: [
          {
            type: "body",
            parameters: [
              { type: "text", text: recipient.nombre },
              { type: "text", text: codigoRUDE }
            ]
          }
        ]
      }
    };

    return this.enviarMensaje(message);
  }

  static async enviarResumenProgreso(
    recipient: NotificationRecipient,
    datos: {
      promedioGeneral: number;
      materiaDestacada: string;
      tareasCompletadas: number;
      proximasEntregas: number;
    }
  ): Promise<boolean> {
    const message: WhatsAppMessage = {
      to: recipient.telefono,
      template: {
        name: "resumen_progreso",
        language: { code: "es" },
        components: [
          {
            type: "body",
            parameters: [
              { type: "text", text: recipient.nombre },
              { type: "text", text: datos.promedioGeneral.toString() },
              { type: "text", text: datos.materiaDestacada },
              { type: "text", text: datos.tareasCompletadas.toString() },
              { type: "text", text: datos.proximasEntregas.toString() }
            ]
          }
        ]
      }
    };

    return this.enviarMensaje(message);
  }

  static async enviarAlertaCalificacion(
    recipient: NotificationRecipient,
    datos: {
      materia: string;
      calificacion: number;
      fecha: string;
    }
  ): Promise<boolean> {
    const message: WhatsAppMessage = {
      to: recipient.telefono,
      template: {
        name: "alerta_calificacion",
        language: { code: "es" },
        components: [
          {
            type: "body",
            parameters: [
              { type: "text", text: recipient.nombre },
              { type: "text", text: datos.materia },
              { type: "text", text: datos.calificacion.toString() },
              { type: "text", text: datos.fecha }
            ]
          }
        ]
      }
    };

    return this.enviarMensaje(message);
  }

  static async enviarRecordatorioTarea(
    recipient: NotificationRecipient,
    datos: {
      tarea: string;
      materia: string;
      fechaEntrega: string;
    }
  ): Promise<boolean> {
    const message: WhatsAppMessage = {
      to: recipient.telefono,
      template: {
        name: "recordatorio_tarea",
        language: { code: "es" },
        components: [
          {
            type: "body",
            parameters: [
              { type: "text", text: recipient.nombre },
              { type: "text", text: datos.tarea },
              { type: "text", text: datos.materia },
              { type: "text", text: datos.fechaEntrega }
            ]
          }
        ]
      }
    };

    return this.enviarMensaje(message);
  }

  static async enviarRecordatorio(
    recipient: NotificationRecipient,
    fechaLimite: Date
  ): Promise<boolean> {
    const message: WhatsAppMessage = {
      to: recipient.telefono,
      template: {
        name: this.TEMPLATES.recordatorio,
        language: { code: "es" },
        components: [
          {
            type: "body",
            parameters: [
              { type: "text", text: recipient.nombre },
              {
                type: "date_time",
                date_time: {
                  fallback_value: fechaLimite.toLocaleDateString(),
                  timestamp: fechaLimite.toISOString()
                }
              }
            ]
          }
        ]
      }
    };

    return this.enviarMensaje(message);
  }

  static async enviarMensajePersonalizado(
    recipient: NotificationRecipient,
    mensaje: string
  ): Promise<boolean> {
    const message: WhatsAppMessage = {
      to: recipient.telefono,
      text: {
        body: mensaje
      }
    };

    return this.enviarMensaje(message);
  }
}