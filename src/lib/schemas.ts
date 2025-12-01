// src/lib/schemas.ts
import { z } from "zod";

export const ciRegex = /^[0-9]{5,12}(-[A-Z]{1,2})?$/i; // ajusta según tu realidad
export const rudeRegex = /^[A-Z0-9\-]{8,20}$/i;        // RUDE lo genera el backend

export const EstudianteSchema = z.object({
  nombres: z.string().min(2),
  apellidos: z.string().min(2),
  ci: z.string().trim().optional().or(z.literal("")).refine(v => !v || ciRegex.test(v), "CI inválido"),
  fecha_nac: z.string().min(10), // "YYYY-MM-DD"
  sexo: z.enum(["M","F"]),
  nacionalidad: z.string().min(2),
  dep_nac: z.string().min(2),
  muni_nac: z.string().min(2),
  direccion: z.string().min(3),
  telefono: z.string().optional(),
  pueblo_indigena: z.string().optional(),
  discapacidad: z.string().optional(),
  idiomas: z.array(z.string()).optional(),
  vulnerabilidad: z.enum(["NINGUNA","DISCAPACIDAD","EMBARAZO","OTRA"]).optional(),

  // Responsable
  tutor_nombre: z.string().min(3),
  tutor_ci: z.string().trim().optional(),
  tutor_parentesco: z.string().min(3),
  tutor_telefono: z.string().optional(),

  // Matrícula
  year: z.number().int(),
  nivel: z.enum(["inicial","primaria","secundaria"]),
  grado: z.string().min(1),
  seccion: z.string().min(1),

  // RUDE (readonly): lo pone backend
  codigo_rude: z.string().regex(rudeRegex).optional(),
});

export const DocenteSchema = z.object({
  nombres: z.string().min(2),
  apellidos: z.string().min(2),
  ci: z.string().trim().regex(ciRegex, "CI inválido"),
  nro_rda: z.string().min(5), // requerido
  correo: z.string().email().optional(),
  telefono: z.string().optional(),
  formacion_titulo: z.string().optional(),
  especialidad: z.string().optional(),
  estado_rda: z.enum(["VIGENTE","OBSERVADO"]).default("VIGENTE"),
});
