// src/lib/dtos.ts
export type EstudianteCreateDTO = {
  // persona
  nombres: string; apellidos: string; ci?: string | null;
  fecha_nac: string; sexo: "M"|"F"; nacionalidad: string;
  dep_nac: string; muni_nac: string; direccion: string; telefono?: string;
  pueblo_indigena?: string | null; discapacidad?: string | null;
  idiomas?: string[]; vulnerabilidad?: "NINGUNA"|"DISCAPACIDAD"|"EMBARAZO"|"OTRA";
  // responsable
  tutor_nombre: string; tutor_ci?: string | null; tutor_parentesco: string; tutor_telefono?: string | null;
  // matrícula
  year: number; nivel: "inicial"|"primaria"|"secundaria"; grado: string; seccion: string;
};

export type EstudianteDTO = EstudianteCreateDTO & {
  id: string; codigo_rude: string; created_at: string; updated_at: string;
};

export type DocenteCreateDTO = {
  nombres: string; apellidos: string; ci: string;
  nro_rda: string; correo?: string; telefono?: string;
  formacion_titulo?: string; especialidad?: string;
  estado_rda: "VIGENTE"|"OBSERVADO";
};

export type DocenteDTO = DocenteCreateDTO & {
  id: string; created_at: string; updated_at: string;
};
