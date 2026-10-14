// src/services/notasService.ts
/**
 * Servicio centralizado para gestión de notas del sistema educativo boliviano
 * Maneja cálculos, sincronización, validación y auditoría
 */

// ===========================
// TIPOS E INTERFACES
// ===========================

export interface NotasAlumno {
  alumnoId: number;
  ser: { [key: string]: number | null };
  saber: { [key: string]: number | null };
  hacer: { [key: string]: number | null };
  decidir: { [key: string]: number | null };
  autoevaluacion: number | null;
  primerTrimestre: number | null;
}

export interface CalificacionFinal {
  alumnoId: number;
  alumnoNombre: string;
  materiaId: number;
  materiaNombre: string;
  trimestre: number;
  promedioSer: number;
  promedioSaber: number;
  promedioHacer: number;
  promedioDecidir: number;
  autoevaluacion: number;
  tspe: number; // Total sin Prueba Escrita
  pruebaEscrita: number;
  notaTrimestre: number;
  promedioAnual: number | null;
  estado: 'APROBADO' | 'REPROBADO' | 'EN_PROCESO';
  fechaActualizacion: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  docenteId: number;
  docenteNombre: string;
  accion: 'CREAR' | 'MODIFICAR' | 'ELIMINAR' | 'PUBLICAR';
  entidad: 'NOTA' | 'CALIFICACION' | 'CRITERIO';
  alumnoId: number;
  materiaId: number;
  trimestre: number;
  valoresAnteriores: any;
  valoresNuevos: any;
  descripcion: string;
}

export interface ValidationResult {
  valido: boolean;
  errores: string[];
  advertencias: string[];
}

// ===========================
// CLASE PRINCIPAL
// ===========================

export class NotasService {
  
  // ===========================
  // CÁLCULOS BOLIVIANOS
  // ===========================
  
  /**
   * Calcula el promedio de una dimensión (SER/SABER/HACER/DECIDIR)
   */
  static calcularPromedioDimension(
    notas: { [key: string]: number | null },
    maxPuntaje: number
  ): number {
    const valores = Object.values(notas).filter(v => v !== null) as number[];
    if (valores.length === 0) return 0;
    
    const suma = valores.reduce((acc, val) => acc + val, 0);
    const promedio = suma / valores.length;
    
    // No debe exceder el máximo
    return Math.min(Math.round(promedio), maxPuntaje);
  }

  /**
   * Calcula TsPE (Total sin Prueba Escrita)
   * TsPE = SER + SABER + HACER + DECIDIR + AUTOEVALUACIÓN
   */
  static calcularTsPE(notasAlumno: NotasAlumno): number {
    const ser = this.calcularPromedioDimension(notasAlumno.ser, 5);
    const saber = this.calcularPromedioDimension(notasAlumno.saber, 45);
    const hacer = this.calcularPromedioDimension(notasAlumno.hacer, 40);
    const decidir = this.calcularPromedioDimension(notasAlumno.decidir, 5);
    const auto = notasAlumno.autoevaluacion || 0;
    
    return ser + saber + hacer + decidir + auto;
  }

  /**
   * Calcula la nota del trimestre actual
   */
  static calcularNotaTrimestre(
    notasAlumno: NotasAlumno,
    pruebaEscrita: number = 0
  ): number {
    const tspe = this.calcularTsPE(notasAlumno);
    return Math.min(tspe + pruebaEscrita, 100);
  }

  /**
   * Calcula el promedio anual (PA)
   */
  static calcularPromedioAnual(
    nota1T: number,
    nota2T: number,
    nota3T: number
  ): number {
    const trimestresConNotas = [nota1T, nota2T, nota3T].filter(t => t > 0);
    if (trimestresConNotas.length === 0) return 0;
    
    const suma = trimestresConNotas.reduce((acc, val) => acc + val, 0);
    return Math.round(suma / trimestresConNotas.length);
  }

  /**
   * Determina el estado según la nota
   */
  static determinarEstado(nota: number): 'APROBADO' | 'REPROBADO' | 'EN_PROCESO' {
    if (nota === 0) return 'EN_PROCESO';
    if (nota >= 51) return 'APROBADO';
    return 'REPROBADO';
  }

  // ===========================
  // VALIDACIÓN
  // ===========================

  /**
   * Valida que las notas estén completas antes de guardar
   */
  static validarNotasCompletas(
    notasAlumnos: NotasAlumno[],
    trimestre: string
  ): ValidationResult {
    const errores: string[] = [];
    const advertencias: string[] = [];

    notasAlumnos.forEach((nota, index) => {
      const alumnoNum = index + 1;
      
      // Verificar SER
      const serCompleto = Object.values(nota.ser).some(v => v !== null);
      if (!serCompleto) {
        advertencias.push(`Alumno ${alumnoNum}: No tiene notas en dimensión SER`);
      }

      // Verificar SABER
      const saberCompleto = Object.values(nota.saber).some(v => v !== null);
      if (!saberCompleto) {
        advertencias.push(`Alumno ${alumnoNum}: No tiene notas en dimensión SABER`);
      }

      // Verificar HACER
      const hacerCompleto = Object.values(nota.hacer).some(v => v !== null);
      if (!hacerCompleto) {
        advertencias.push(`Alumno ${alumnoNum}: No tiene notas en dimensión HACER`);
      }

      // Verificar DECIDIR
      const decidirCompleto = Object.values(nota.decidir).some(v => v !== null);
      if (!decidirCompleto) {
        advertencias.push(`Alumno ${alumnoNum}: No tiene notas en dimensión DECIDIR`);
      }

      // Verificar AUTOEVALUACIÓN
      if (nota.autoevaluacion === null) {
        advertencias.push(`Alumno ${alumnoNum}: Falta autoevaluación`);
      }

      // Para trimestre 2 y 3, verificar que exista nota del trimestre anterior
      if (trimestre === '2' && (nota.primerTrimestre === null || nota.primerTrimestre === 0)) {
        advertencias.push(`Alumno ${alumnoNum}: Falta nota del Primer Trimestre`);
      }
    });

    return {
      valido: errores.length === 0,
      errores,
      advertencias
    };
  }

  /**
   * Valida rangos de notas
   */
  static validarRangosNotas(notasAlumno: NotasAlumno): ValidationResult {
    const errores: string[] = [];
    const advertencias: string[] = [];

    // Validar SER (0-5)
    Object.entries(notasAlumno.ser).forEach(([key, valor]) => {
      if (valor !== null && (valor < 0 || valor > 5)) {
        errores.push(`SER ${key}: Valor ${valor} fuera de rango (0-5)`);
      }
    });

    // Validar SABER (0-45)
    Object.entries(notasAlumno.saber).forEach(([key, valor]) => {
      if (valor !== null && (valor < 0 || valor > 45)) {
        errores.push(`SABER ${key}: Valor ${valor} fuera de rango (0-45)`);
      }
    });

    // Validar HACER (0-40)
    Object.entries(notasAlumno.hacer).forEach(([key, valor]) => {
      if (valor !== null && (valor < 0 || valor > 40)) {
        errores.push(`HACER ${key}: Valor ${valor} fuera de rango (0-40)`);
      }
    });

    // Validar DECIDIR (0-5)
    Object.entries(notasAlumno.decidir).forEach(([key, valor]) => {
      if (valor !== null && (valor < 0 || valor > 5)) {
        errores.push(`DECIDIR ${key}: Valor ${valor} fuera de rango (0-5)`);
      }
    });

    // Validar AUTOEVALUACIÓN (0-5)
    if (notasAlumno.autoevaluacion !== null && 
        (notasAlumno.autoevaluacion < 0 || notasAlumno.autoevaluacion > 5)) {
      errores.push(`Autoevaluación: Valor ${notasAlumno.autoevaluacion} fuera de rango (0-5)`);
    }

    return {
      valido: errores.length === 0,
      errores,
      advertencias
    };
  }

  // ===========================
  // SINCRONIZACIÓN
  // ===========================

  /**
   * Sincroniza notas desde RegistroValoracion hacia Calificaciones
   */
  static sincronizarCalificaciones(
    notasAlumnos: NotasAlumno[],
    materiaId: number,
    materiaNombre: string,
    trimestre: string,
    cursoId: string,
    alumnos: Array<{ id: number; nombre: string; apellido: string }>
  ): void {
    const trimestreNum = parseInt(trimestre);
    const calificaciones: CalificacionFinal[] = [];

    notasAlumnos.forEach(notasAlumno => {
      const alumno = alumnos.find(a => a.id === notasAlumno.alumnoId);
      if (!alumno) return;

      const ser = this.calcularPromedioDimension(notasAlumno.ser, 5);
      const saber = this.calcularPromedioDimension(notasAlumno.saber, 45);
      const hacer = this.calcularPromedioDimension(notasAlumno.hacer, 40);
      const decidir = this.calcularPromedioDimension(notasAlumno.decidir, 5);
      const auto = notasAlumno.autoevaluacion || 0;
      const tspe = this.calcularTsPE(notasAlumno);
      const pe = 0; // Por implementar
      const notaTrimestre = this.calcularNotaTrimestre(notasAlumno, pe);

      // Calcular PA si tenemos notas de trimestres anteriores
      let pa: number | null = null;
      if (trimestreNum >= 2) {
        const nota1T = notasAlumno.primerTrimestre || 0;
        const nota2T = trimestreNum >= 2 ? notaTrimestre : 0;
        const nota3T = 0; // Por implementar
        pa = this.calcularPromedioAnual(nota1T, nota2T, nota3T);
      }

      const calificacion: CalificacionFinal = {
        alumnoId: notasAlumno.alumnoId,
        alumnoNombre: `${alumno.apellido} ${alumno.nombre}`,
        materiaId,
        materiaNombre,
        trimestre: trimestreNum,
        promedioSer: ser,
        promedioSaber: saber,
        promedioHacer: hacer,
        promedioDecidir: decidir,
        autoevaluacion: auto,
        tspe,
        pruebaEscrita: pe,
        notaTrimestre,
        promedioAnual: pa,
        estado: this.determinarEstado(notaTrimestre),
        fechaActualizacion: new Date().toISOString()
      };

      calificaciones.push(calificacion);
    });

    // Guardar en el storage key de Calificaciones
    const storageKey = `gradebook:calificaciones:${cursoId}:${trimestre}`;
    try {
      const existing = localStorage.getItem(storageKey);
      let allCalificaciones: CalificacionFinal[] = existing ? JSON.parse(existing) : [];

      // Actualizar o agregar calificaciones de esta materia
      allCalificaciones = allCalificaciones.filter(c => c.materiaId !== materiaId);
      allCalificaciones.push(...calificaciones);

      localStorage.setItem(storageKey, JSON.stringify(allCalificaciones));
      console.log(`✅ Sincronizado ${calificaciones.length} calificaciones en ${storageKey}`);
    } catch (error) {
      console.error('❌ Error al sincronizar calificaciones:', error);
      throw error;
    }
  }

  // ===========================
  // AUDITORÍA
  // ===========================

  /**
   * Registra un cambio en el sistema de auditoría
   */
  static registrarAuditoria(
    docenteId: number,
    docenteNombre: string,
    accion: AuditLog['accion'],
    entidad: AuditLog['entidad'],
    alumnoId: number,
    materiaId: number,
    trimestre: number,
    valoresAnteriores: any,
    valoresNuevos: any,
    descripcion: string
  ): void {
    const auditLog: AuditLog = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      docenteId,
      docenteNombre,
      accion,
      entidad,
      alumnoId,
      materiaId,
      trimestre,
      valoresAnteriores,
      valoresNuevos,
      descripcion
    };

    try {
      const storageKey = `audit:notas:${materiaId}:${trimestre}`;
      const existing = localStorage.getItem(storageKey);
      const logs: AuditLog[] = existing ? JSON.parse(existing) : [];
      logs.push(auditLog);

      // Mantener solo los últimos 100 registros por materia/trimestre
      if (logs.length > 100) {
        logs.shift();
      }

      localStorage.setItem(storageKey, JSON.stringify(logs));
      console.log(`📝 Auditoría registrada: ${descripcion}`);
    } catch (error) {
      console.error('❌ Error al registrar auditoría:', error);
    }
  }

  /**
   * Obtiene el historial de auditoría
   */
  static obtenerHistorialAuditoria(
    materiaId: number,
    trimestre: number
  ): AuditLog[] {
    try {
      const storageKey = `audit:notas:${materiaId}:${trimestre}`;
      const existing = localStorage.getItem(storageKey);
      return existing ? JSON.parse(existing) : [];
    } catch (error) {
      console.error('❌ Error al obtener auditoría:', error);
      return [];
    }
  }

  // ===========================
  // PERSISTENCIA Y CARGA
  // ===========================

  /**
   * Guarda notas con validación, sincronización y auditoría
   */
  static guardarNotas(
    notasAlumnos: NotasAlumno[],
    materiaId: number,
    materiaNombre: string,
    trimestre: string,
    cursoId: string,
    docenteId: number,
    docenteNombre: string,
    alumnos: Array<{ id: number; nombre: string; apellido: string }>,
    criteriosEditables: { [key: string]: string },
    fechasEvaluacion: { [key: string]: string }
  ): { success: boolean; errores: string[]; advertencias: string[] } {
    
    // 1. Validar notas completas
    const validacionCompleta = this.validarNotasCompletas(notasAlumnos, trimestre);
    
    // 2. Validar rangos
    const erroresRango: string[] = [];
    notasAlumnos.forEach((nota, index) => {
      const validacionRango = this.validarRangosNotas(nota);
      if (!validacionRango.valido) {
        validacionRango.errores.forEach(err => {
          erroresRango.push(`Alumno ${index + 1}: ${err}`);
        });
      }
    });

    if (erroresRango.length > 0) {
      return {
        success: false,
        errores: erroresRango,
        advertencias: []
      };
    }

    try {
      // 3. Guardar notas en RegistroValoracion
      const storageKey = `registro-valoracion:${materiaId}:${trimestre}`;
      const criteriosKey = `criterios:${materiaId}`;
      const fechasKey = `fechas:${materiaId}:${trimestre}`;
      
      // Cargar valores anteriores para auditoría
      const notasAnteriores = localStorage.getItem(storageKey);

      localStorage.setItem(storageKey, JSON.stringify(notasAlumnos));
      localStorage.setItem(criteriosKey, JSON.stringify(criteriosEditables));
      localStorage.setItem(fechasKey, JSON.stringify(fechasEvaluacion));

      // 4. Sincronizar con Calificaciones
      this.sincronizarCalificaciones(
        notasAlumnos,
        materiaId,
        materiaNombre,
        trimestre,
        cursoId,
        alumnos
      );

      // 5. Registrar auditoría
      notasAlumnos.forEach(nota => {
        this.registrarAuditoria(
          docenteId,
          docenteNombre,
          notasAnteriores ? 'MODIFICAR' : 'CREAR',
          'NOTA',
          nota.alumnoId,
          materiaId,
          parseInt(trimestre),
          notasAnteriores ? JSON.parse(notasAnteriores) : null,
          nota,
          `${notasAnteriores ? 'Modificación' : 'Creación'} de notas - Trimestre ${trimestre}`
        );
      });

      return {
        success: true,
        errores: [],
        advertencias: validacionCompleta.advertencias
      };
    } catch (error) {
      return {
        success: false,
        errores: [`Error al guardar: ${error}`],
        advertencias: []
      };
    }
  }

  /**
   * Carga notas desde localStorage
   */
  static cargarNotas(
    materiaId: number,
    trimestre: string
  ): NotasAlumno[] | null {
    try {
      const storageKey = `registro-valoracion:${materiaId}:${trimestre}`;
      const raw = localStorage.getItem(storageKey);
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      console.error('❌ Error al cargar notas:', error);
      return null;
    }
  }

  // ===========================
  // PREPARACIÓN PARA API REST
  // ===========================

  /**
   * Convierte NotasAlumno a formato DTO para API
   */
  static toDTO(notasAlumno: NotasAlumno, materiaId: number, trimestre: number): any {
    return {
      alumno_id: notasAlumno.alumnoId,
      materia_id: materiaId,
      trimestre,
      dimensiones: {
        ser: notasAlumno.ser,
        saber: notasAlumno.saber,
        hacer: notasAlumno.hacer,
        decidir: notasAlumno.decidir
      },
      autoevaluacion: notasAlumno.autoevaluacion,
      primer_trimestre: notasAlumno.primerTrimestre,
      calculos: {
        promedio_ser: this.calcularPromedioDimension(notasAlumno.ser, 5),
        promedio_saber: this.calcularPromedioDimension(notasAlumno.saber, 45),
        promedio_hacer: this.calcularPromedioDimension(notasAlumno.hacer, 40),
        promedio_decidir: this.calcularPromedioDimension(notasAlumno.decidir, 5),
        tspe: this.calcularTsPE(notasAlumno),
        nota_trimestre: this.calcularNotaTrimestre(notasAlumno)
      }
    };
  }

  /**
   * Convierte DTO de API a NotasAlumno
   */
  static fromDTO(dto: any): NotasAlumno {
    return {
      alumnoId: dto.alumno_id,
      ser: dto.dimensiones.ser,
      saber: dto.dimensiones.saber,
      hacer: dto.dimensiones.hacer,
      decidir: dto.dimensiones.decidir,
      autoevaluacion: dto.autoevaluacion,
      primerTrimestre: dto.primer_trimestre
    };
  }
}

export default NotasService;
