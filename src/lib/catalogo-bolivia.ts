// src/lib/catalogo-bolivia.ts
// Catálogo Unificado del Sistema Educativo Plurinacional de Bolivia
// Basado en la Ley 070 Avelino Siñani - Elizardo Pérez

// ==========================================
// NIVELES EDUCATIVOS
// ==========================================
export const NIVELES = ['inicial', 'primaria', 'secundaria'] as const;
export type NivelKey = typeof NIVELES[number];

export const NIVELES_INFO: Record<NivelKey, { nombre: string; edadMin: number; edadMax: number }> = {
  inicial: { nombre: "Educación Inicial en Familia Comunitaria", edadMin: 4, edadMax: 5 },
  primaria: { nombre: "Educación Primaria Comunitaria Vocacional", edadMin: 6, edadMax: 11 },
  secundaria: { nombre: "Educación Secundaria Comunitaria Productiva", edadMin: 12, edadMax: 17 },
};

// ==========================================
// CURSOS POR NIVEL (Bolivia - Sistema Regular)
// ==========================================
export const CURSOS_INICIAL = [
  "1ra Sección",  // 4 años
  "2da Sección",  // 5 años
] as const;

export const CURSOS_PRIMARIA = [
  "1ro Primaria",
  "2do Primaria", 
  "3ro Primaria",
  "4to Primaria",
  "5to Primaria",
  "6to Primaria",
] as const;

export const CURSOS_SECUNDARIA = [
  "1ro Secundaria",
  "2do Secundaria",
  "3ro Secundaria",
  "4to Secundaria",
  "5to Secundaria",
  "6to Secundaria",
] as const;

export const CURSOS_POR_NIVEL: Record<NivelKey, readonly string[]> = {
  inicial: CURSOS_INICIAL,
  primaria: CURSOS_PRIMARIA,
  secundaria: CURSOS_SECUNDARIA,
};

// Alias cortos para mostrar en UI
export const CURSOS_ALIAS: Record<string, string> = {
  "1ra Sección": "1ra Sec.",
  "2da Sección": "2da Sec.",
  "1ro Primaria": "1° Prim.",
  "2do Primaria": "2° Prim.",
  "3ro Primaria": "3° Prim.",
  "4to Primaria": "4° Prim.",
  "5to Primaria": "5° Prim.",
  "6to Primaria": "6° Prim.",
  "1ro Secundaria": "1° Sec.",
  "2do Secundaria": "2° Sec.",
  "3ro Secundaria": "3° Sec.",
  "4to Secundaria": "4° Sec.",
  "5to Secundaria": "5° Sec.",
  "6to Secundaria": "6° Sec.",
};

// ==========================================
// PARALELOS
// ==========================================
export const PARALELOS = ['A', 'B', 'C', 'D', 'E', 'F'] as const;
export type Paralelo = typeof PARALELOS[number];

// ==========================================
// TURNOS
// ==========================================
export const TURNOS = ['Mañana', 'Tarde', 'Noche'] as const;
export type Turno = typeof TURNOS[number];

// ==========================================
// ÁREAS DE CONOCIMIENTO (Currículum Bolivia)
// ==========================================
export const CAMPOS_SABERES = [
  "Cosmos y Pensamiento",
  "Comunidad y Sociedad", 
  "Vida Tierra Territorio",
  "Ciencia Tecnología y Producción",
] as const;

// Áreas por nivel según currículum boliviano
export const AREAS_INICIAL = [
  "Identidad y Autonomía Personal",
  "Comunicación y Lenguajes",
  "Ciencias de la Naturaleza",
  "Ciencias Sociales",
  "Matemática",
  "Expresión y Creatividad",
  "Educación Física y Deportes",
] as const;

export const AREAS_PRIMARIA = [
  "Comunicación y Lenguajes",
  "Lengua Originaria",
  "Lengua Extranjera",
  "Ciencias Sociales",
  "Educación Física y Deportes",
  "Educación Musical",
  "Artes Plásticas y Visuales",
  "Ciencias Naturales",
  "Matemática",
  "Técnica Tecnológica",
  "Valores Espiritualidad y Religiones",
] as const;

export const AREAS_SECUNDARIA = [
  "Comunicación y Lenguajes",
  "Lengua Originaria",
  "Lengua Extranjera",
  "Ciencias Sociales",
  "Educación Física y Deportes",
  "Educación Musical",
  "Artes Plásticas y Visuales",
  "Ciencias Naturales: Biología-Geografía",
  "Ciencias Naturales: Física-Química",
  "Matemática",
  "Técnica Tecnológica General",
  "Técnica Tecnológica Especializada",
  "Cosmovisiones Filosofía y Psicología",
  "Valores Espiritualidad y Religiones",
] as const;

export const AREAS_POR_NIVEL: Record<NivelKey, readonly string[]> = {
  inicial: AREAS_INICIAL,
  primaria: AREAS_PRIMARIA,
  secundaria: AREAS_SECUNDARIA,
};

// ==========================================
// MATERIAS PREDEFINIDAS POR NIVEL Y CURSO
// ==========================================
export interface MateriaBase {
  codigo: string;
  nombre: string;
  area: string;
  horasSemanales: number;
}

// Materias de INICIAL (comunes a todas las secciones)
export const MATERIAS_INICIAL: MateriaBase[] = [
  { codigo: "INI-COM", nombre: "Comunicación y Lenguajes", area: "Comunicación y Lenguajes", horasSemanales: 5 },
  { codigo: "INI-MAT", nombre: "Matemática", area: "Matemática", horasSemanales: 4 },
  { codigo: "INI-NAT", nombre: "Ciencias de la Naturaleza", area: "Ciencias de la Naturaleza", horasSemanales: 3 },
  { codigo: "INI-SOC", nombre: "Ciencias Sociales", area: "Ciencias Sociales", horasSemanales: 3 },
  { codigo: "INI-EXP", nombre: "Expresión y Creatividad", area: "Expresión y Creatividad", horasSemanales: 4 },
  { codigo: "INI-EFI", nombre: "Educación Física", area: "Educación Física y Deportes", horasSemanales: 3 },
  { codigo: "INI-IDE", nombre: "Identidad y Autonomía", area: "Identidad y Autonomía Personal", horasSemanales: 2 },
];

// Materias de PRIMARIA
export const MATERIAS_PRIMARIA: MateriaBase[] = [
  { codigo: "PRI-COM", nombre: "Comunicación y Lenguajes", area: "Comunicación y Lenguajes", horasSemanales: 6 },
  { codigo: "PRI-LOA", nombre: "Lengua Originaria Aimara", area: "Lengua Originaria", horasSemanales: 2 },
  { codigo: "PRI-ING", nombre: "Lengua Extranjera (Inglés)", area: "Lengua Extranjera", horasSemanales: 2 },
  { codigo: "PRI-CSO", nombre: "Ciencias Sociales", area: "Ciencias Sociales", horasSemanales: 4 },
  { codigo: "PRI-EFI", nombre: "Educación Física y Deportes", area: "Educación Física y Deportes", horasSemanales: 2 },
  { codigo: "PRI-MUS", nombre: "Educación Musical", area: "Educación Musical", horasSemanales: 2 },
  { codigo: "PRI-ART", nombre: "Artes Plásticas y Visuales", area: "Artes Plásticas y Visuales", horasSemanales: 2 },
  { codigo: "PRI-CNA", nombre: "Ciencias Naturales", area: "Ciencias Naturales", horasSemanales: 4 },
  { codigo: "PRI-MAT", nombre: "Matemática", area: "Matemática", horasSemanales: 6 },
  { codigo: "PRI-TEC", nombre: "Técnica Tecnológica", area: "Técnica Tecnológica", horasSemanales: 2 },
  { codigo: "PRI-VAL", nombre: "Valores Espiritualidad y Religiones", area: "Valores Espiritualidad y Religiones", horasSemanales: 2 },
];

// Materias de SECUNDARIA
export const MATERIAS_SECUNDARIA: MateriaBase[] = [
  { codigo: "SEC-COM", nombre: "Comunicación y Lenguajes", area: "Comunicación y Lenguajes", horasSemanales: 5 },
  { codigo: "SEC-LOA", nombre: "Lengua Originaria", area: "Lengua Originaria", horasSemanales: 2 },
  { codigo: "SEC-ING", nombre: "Lengua Extranjera (Inglés)", area: "Lengua Extranjera", horasSemanales: 3 },
  { codigo: "SEC-CSO", nombre: "Ciencias Sociales", area: "Ciencias Sociales", horasSemanales: 4 },
  { codigo: "SEC-EFI", nombre: "Educación Física y Deportes", area: "Educación Física y Deportes", horasSemanales: 2 },
  { codigo: "SEC-MUS", nombre: "Educación Musical", area: "Educación Musical", horasSemanales: 2 },
  { codigo: "SEC-ART", nombre: "Artes Plásticas y Visuales", area: "Artes Plásticas y Visuales", horasSemanales: 2 },
  { codigo: "SEC-BIO", nombre: "Biología-Geografía", area: "Ciencias Naturales: Biología-Geografía", horasSemanales: 4 },
  { codigo: "SEC-FIS", nombre: "Física-Química", area: "Ciencias Naturales: Física-Química", horasSemanales: 4 },
  { codigo: "SEC-MAT", nombre: "Matemática", area: "Matemática", horasSemanales: 6 },
  { codigo: "SEC-TEC", nombre: "Técnica Tecnológica General", area: "Técnica Tecnológica General", horasSemanales: 2 },
  { codigo: "SEC-TES", nombre: "Técnica Tecnológica Especializada", area: "Técnica Tecnológica Especializada", horasSemanales: 3 },
  { codigo: "SEC-FIL", nombre: "Cosmovisiones Filosofía y Psicología", area: "Cosmovisiones Filosofía y Psicología", horasSemanales: 2 },
  { codigo: "SEC-VAL", nombre: "Valores Espiritualidad y Religiones", area: "Valores Espiritualidad y Religiones", horasSemanales: 2 },
];

export const MATERIAS_POR_NIVEL: Record<NivelKey, MateriaBase[]> = {
  inicial: MATERIAS_INICIAL,
  primaria: MATERIAS_PRIMARIA,
  secundaria: MATERIAS_SECUNDARIA,
};

// ==========================================
// DIMENSIONES DE EVALUACIÓN (Currículo Bolivia)
// ==========================================
export const DIMENSIONES = ['SER', 'SABER', 'HACER', 'DECIDIR'] as const;
export type Dimension = typeof DIMENSIONES[number];

export const DIMENSIONES_INFO: Record<Dimension, { nombre: string; descripcion: string; peso: number }> = {
  SER: { 
    nombre: "Ser", 
    descripcion: "Principios, valores, identidad, sentimientos", 
    peso: 10 
  },
  SABER: { 
    nombre: "Saber", 
    descripcion: "Teoría, conocimiento, comprensión", 
    peso: 35 
  },
  HACER: { 
    nombre: "Hacer", 
    descripcion: "Práctica, procedimientos, habilidades", 
    peso: 35 
  },
  DECIDIR: { 
    nombre: "Decidir", 
    descripcion: "Impacto social, aplicación, compromiso", 
    peso: 20 
  },
};

// ==========================================
// ESCALAS DE CALIFICACIÓN
// ==========================================
export const ESCALA_NUMERICA = {
  min: 1,
  max: 100,
  aprobatorio: 51,
};

export const ESCALA_CUALITATIVA_INICIAL = [
  { codigo: "ED", nombre: "En Desarrollo", descripcion: "El estudiante está en proceso de desarrollar la competencia" },
  { codigo: "DA", nombre: "Desarrollo Aceptable", descripcion: "El estudiante demuestra avance significativo" },
  { codigo: "DO", nombre: "Desarrollo Óptimo", descripcion: "El estudiante alcanzó la competencia esperada" },
  { codigo: "DP", nombre: "Desarrollo Pleno", descripcion: "El estudiante supera la competencia esperada" },
] as const;

// ==========================================
// HELPERS
// ==========================================

/** Obtener cursos disponibles para un nivel */
export function getCursos(nivel: NivelKey): readonly string[] {
  return CURSOS_POR_NIVEL[nivel] || [];
}

/** Obtener áreas de conocimiento para un nivel */
export function getAreas(nivel: NivelKey): readonly string[] {
  return AREAS_POR_NIVEL[nivel] || [];
}

/** Obtener materias base para un nivel */
export function getMaterias(nivel: NivelKey): MateriaBase[] {
  return MATERIAS_POR_NIVEL[nivel] || [];
}

/** Obtener alias corto de un curso */
export function getCursoAlias(curso: string): string {
  return CURSOS_ALIAS[curso] || curso;
}

/** Verificar si un curso pertenece a un nivel */
export function cursoEnNivel(curso: string, nivel: NivelKey): boolean {
  return CURSOS_POR_NIVEL[nivel].includes(curso);
}

/** Obtener el nivel de un curso */
export function getNivelDeCurso(curso: string): NivelKey | null {
  for (const nivel of NIVELES) {
    if (CURSOS_POR_NIVEL[nivel].includes(curso)) {
      return nivel;
    }
  }
  return null;
}

/** Generar clave única para una sección */
export function getClaveSeccion(year: string, nivel: NivelKey, curso: string, paralelo: string): string {
  return `${year}::${nivel}::${curso}::${paralelo}`;
}

/** Validar que un paralelo sea válido */
export function paraleloValido(paralelo: string): boolean {
  return PARALELOS.includes(paralelo as Paralelo);
}

/** Obtener nombre completo del nivel */
export function getNombreNivel(nivel: NivelKey): string {
  return NIVELES_INFO[nivel]?.nombre || nivel;
}

/** Calcular promedio ponderado por dimensiones */
export function calcularPromedio(notas: Partial<Record<Dimension, number>>): number {
  let suma = 0;
  let pesoTotal = 0;
  
  for (const dim of DIMENSIONES) {
    const nota = notas[dim];
    if (nota !== undefined && nota !== null) {
      suma += nota * DIMENSIONES_INFO[dim].peso;
      pesoTotal += DIMENSIONES_INFO[dim].peso;
    }
  }
  
  return pesoTotal > 0 ? Math.round(suma / pesoTotal) : 0;
}

/** Verificar si una nota es aprobatoria */
export function esAprobado(nota: number): boolean {
  return nota >= ESCALA_NUMERICA.aprobatorio;
}

/** Obtener valoración cualitativa de una nota */
export function getValoracionCualitativa(nota: number): string {
  if (nota >= 90) return "Desarrollo Pleno";
  if (nota >= 70) return "Desarrollo Óptimo";
  if (nota >= 51) return "Desarrollo Aceptable";
  return "En Desarrollo";
}

/** Obtener color de badge según nota */
export function getColorNota(nota: number): string {
  if (nota >= 90) return "bg-green-100 text-green-800";
  if (nota >= 70) return "bg-blue-100 text-blue-800";
  if (nota >= 51) return "bg-yellow-100 text-yellow-800";
  return "bg-red-100 text-red-800";
}
