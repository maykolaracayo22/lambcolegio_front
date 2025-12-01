export type DocumentoEstado = 'pendiente' | 'completo' | 'faltante' | 'observado';
export type InscripcionEstado = 'PENDIENTE' | 'EN_REVISION' | 'OBSERVADO' | 'APROBADO' | 'RECHAZADO';

export interface Documento {
  id: string;
  tipo: string;
  nombre: string;
  url: string;
  estado: DocumentoEstado;
  observaciones?: string;
  fechaSubida: Date;
}

export interface PreInscripcion {
  id: string;
  estudiante: {
    nombre: string;
    apellidos: string;
    nivel: string;
  };
  documentos: Documento[];
  estado: InscripcionEstado;
  fechaPreInscripcion: Date;
  codigoRUDE?: string;
  observaciones?: string;
}