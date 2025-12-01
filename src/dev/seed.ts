// src/dev/seed.ts
import { setAsignaciones, createMissingActas, getActas, saveActa } from "@/services/mockAdmin";
const ADMIN = { id: "admin", nombre: "Administrador" };

export function seed() {
  if (localStorage.getItem("adm:seed")) return;
  const year = new Date().getFullYear();

  // Asignaciones demo
  setAsignaciones(ADMIN, year, [
    { id:"asg1", year, nivel:"primaria", grado:"6to", seccion:"A", materiaId:"MAT-ESP", materiaNombre:"Lenguaje", docenteId:"DOC-1", docenteNombre:"Prof. García" },
    { id:"asg2", year, nivel:"primaria", grado:"6to", seccion:"A", materiaId:"MAT-MAT", materiaNombre:"Matemática", docenteId:"DOC-2", docenteNombre:"Prof. Pérez" }
  ]);

  // Crear actas T1
  createMissingActas(ADMIN, year, "T1", { nivel:"primaria" });

  // Cargar una acta con evaluaciones y notas ejemplo
  const acta = getActas({ year, term:"T1", seccion:"A", materiaId:"MAT-MAT" })[0];
  if (acta) {
    acta.evaluaciones = [
      { id:"ev1", nombre:"Examen 1", peso:50 },
      { id:"ev2", nombre:"Proyecto", peso:50 }
    ];
    acta.notas = [
      { tipo:"NUM", matriculaId:"STU-001", valor:75 },
      { tipo:"NUM", matriculaId:"STU-002", valor:90 },
      { tipo:"NUM", matriculaId:"STU-003", valor:55 },
      { tipo:"NUM", matriculaId:"STU-004", valor:null }
    ];
    saveActa(ADMIN, acta);
  }

  localStorage.setItem("adm:seed", "1");
}
