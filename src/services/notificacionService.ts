import { WhatsAppService, NotificationRecipient } from "./whatsappService";

export class NotificacionService {
  static async enviarNotificacionDocumentosPendientes(
    recipient: NotificationRecipient,
    documentosFaltantes: string[]
  ): Promise<boolean> {
    try {
      // Enviar por WhatsApp
      if (recipient.preferencia !== 'email') {
        const enviado = await WhatsAppService.enviarNotificacionDocumentosFaltantes(
          recipient,
          documentosFaltantes
        );
        
        if (!enviado && recipient.preferencia === 'whatsapp') {
          console.error('Error al enviar notificación WhatsApp');
          return false;
        }
      }

      // TODO: Implementar envío por email como respaldo
      if (recipient.email && (recipient.preferencia === 'email' || recipient.preferencia === 'ambos')) {
        // Implementar envío de email
      }

      return true;
    } catch (error) {
      console.error('Error al enviar notificación:', error);
      return false;
    }
  }

  static async enviarNotificacionInscripcionAprobada(
    recipient: NotificationRecipient,
    codigoRUDE: string
  ): Promise<boolean> {
    try {
      if (recipient.preferencia !== 'email') {
        const enviado = await WhatsAppService.enviarNotificacionInscripcionAprobada(
          recipient,
          codigoRUDE
        );

        if (!enviado && recipient.preferencia === 'whatsapp') {
          console.error('Error al enviar notificación WhatsApp');
          return false;
        }
      }

      // TODO: Implementar envío por email
      return true;
    } catch (error) {
      console.error('Error al enviar notificación:', error);
      return false;
    }
  }

  static async enviarRecordatorio(
    recipient: NotificationRecipient,
    fechaLimite: Date
  ): Promise<boolean> {
    try {
      if (recipient.preferencia !== 'email') {
        const enviado = await WhatsAppService.enviarRecordatorio(
          recipient,
          fechaLimite
        );

        if (!enviado && recipient.preferencia === 'whatsapp') {
          console.error('Error al enviar recordatorio WhatsApp');
          return false;
        }
      }

      // TODO: Implementar envío por email
      return true;
    } catch (error) {
      console.error('Error al enviar recordatorio:', error);
      return false;
    }
  }

  // Programar recordatorios automáticos
  static async programarRecordatoriosAutomaticos(
    recipient: NotificationRecipient,
    fechaLimite: Date,
    intervaloDias: number = 3
  ): Promise<void> {
    const hoy = new Date();
    const diasRestantes = Math.ceil((fechaLimite.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));

    if (diasRestantes <= 0) {
      return;
    }

    // Calcular fechas de recordatorio
    const fechasRecordatorio = [];
    for (let dias = diasRestantes; dias > 0; dias -= intervaloDias) {
      const fecha = new Date(fechaLimite);
      fecha.setDate(fecha.getDate() - dias);
      fechasRecordatorio.push(fecha);
    }

    // Programar recordatorios
    for (const fecha of fechasRecordatorio) {
      const timeout = fecha.getTime() - hoy.getTime();
      if (timeout > 0) {
        setTimeout(() => {
          this.enviarRecordatorio(recipient, fechaLimite);
        }, timeout);
      }
    }
  }

  // Seguimiento de notificaciones enviadas
  private static notificacionesEnviadas: Array<{
    recipientId: string;
    tipo: string;
    fecha: Date;
    exitoso: boolean;
  }> = [];

  static registrarNotificacion(
    recipientId: string,
    tipo: string,
    exitoso: boolean
  ): void {
    this.notificacionesEnviadas.push({
      recipientId,
      tipo,
      fecha: new Date(),
      exitoso
    });
  }

  static obtenerHistorialNotificaciones(recipientId: string): Array<{
    tipo: string;
    fecha: Date;
    exitoso: boolean;
  }> {
    return this.notificacionesEnviadas
      .filter(n => n.recipientId === recipientId)
      .map(({ tipo, fecha, exitoso }) => ({ tipo, fecha, exitoso }));
  }
}