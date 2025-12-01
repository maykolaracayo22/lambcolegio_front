// src/components/gradebook/Gradebook.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import TermBadge from "@/components/gradebook/TermBadge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getNivel, getReglas } from "@/lib/bolivia";

import {
  PlusCircle,
  UserPlus,
  FileDown,
  Printer,
  ClipboardPaste,
  Undo2,
  Redo2,
  Save,
  Info,
  Lock,
  Unlock,
  MessageSquare,
} from "lucide-react";

import * as XLSX from "xlsx";
import { FixedSizeList as List, ListChildComponentProps } from "react-window";

/** ===== Types ===== */
type TermId = "T1" | "T2" | "T3";
type Status = "draft" | "submitted" | "approved" | "published";

export type Student = { id: string; name: string };

export type Column = {
  id: string;
  title: string;
  weight: number;       // 0..1 (dentro del trimestre)
  termId: TermId;       // trimestre al que pertenece
  locked?: boolean;     // bloqueo por evaluación
  maxPoints?: number;   // tope por evaluación
  minRequired?: number; // mínimo exigido en la evaluación (opcional)
  recoveryFor?: string; // id de evaluación a recuperar (toma la mejor nota)
  categoryId?: string;  // categoría (p.ej. Tareas/Prácticas/Proyecto)
};

export type GradesMap = Record<string, number | null>;          // "S:C" => nota
export type CommentsMap = Record<string, string | undefined>;   // "S:C" => comentario
export type QualitativeMap = Record<string, string | undefined>; // "S:C" => code cualitativo

export type GradebookData = {
  minScore: number;
  maxScore: number;
  students: Student[];
  columns: Column[];
  grades: GradesMap;
  comments?: CommentsMap;
  qualitative?: QualitativeMap;
  locked?: boolean;                 // bloqueo global duro
  dropLowest?: boolean;             // omitir la más baja (opcional)

  // Trimestres
  terms?: { id: TermId; name: string; weight: number }[];
  currentTerm?: TermId;

  // Categorías por trimestre
  termCategories?: Record<TermId, { id: string; name: string; weight: number }[]>;

  // Control de flujo/periodo
  status?: Status;                  // draft|submitted|approved|published
  editWindow?: { start?: string; end?: string }; // ISO datetimes
};

type Props = {
  initial: GradebookData;
  onSave?: (payload: GradebookData) => Promise<void> | void;
};

/** ===== Helpers ===== */
const k = (s: string, c: string) => `${s}:${c}`;
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

const DEFAULT_TERMS: { id: TermId; name: string; weight: number }[] = [
  { id: "T1", name: "Trimestre 1", weight: 1 / 3 },
  { id: "T2", name: "Trimestre 2", weight: 1 / 3 },
  { id: "T3", name: "Trimestre 3", weight: 1 / 3 },
];

const DEFAULT_CATS: Record<TermId, { id: string; name: string; weight: number }[]> = {
  T1: [
    { id: "CAT_T1_TAR", name: "Tareas", weight: 0.3 },
    { id: "CAT_T1_PRA", name: "Prácticas", weight: 0.3 },
    { id: "CAT_T1_PRO", name: "Proyecto", weight: 0.4 },
  ],
  T2: [
    { id: "CAT_T2_TAR", name: "Tareas", weight: 0.3 },
    { id: "CAT_T2_PRA", name: "Prácticas", weight: 0.3 },
    { id: "CAT_T2_PRO", name: "Proyecto", weight: 0.4 },
  ],
  T3: [
    { id: "CAT_T3_TAR", name: "Tareas", weight: 0.3 },
    { id: "CAT_T3_PRA", name: "Prácticas", weight: 0.3 },
    { id: "CAT_T3_PRO", name: "Proyecto", weight: 0.4 },
  ],
};

/** ===== Component ===== */
export default function Gradebook({ initial, onSave }: Props) {
  // Merge defaults
const mergedInit: GradebookData = {
  ...initial,
  // fallbacks duros para evitar forEach/map sobre undefined
  minScore: initial?.minScore ?? 0,
  maxScore: initial?.maxScore ?? 100,
  students: initial?.students ?? [],       // ✅ importante
  columns: (initial?.columns ?? []).map((c) => ({ termId: initial?.currentTerm ?? "T1", ...c })), // ✅
  grades: initial?.grades ?? {},           // ✅ importante
  comments: initial?.comments ?? {},
  qualitative: initial?.qualitative ?? undefined,
  dropLowest: initial?.dropLowest ?? false,
  terms: initial?.terms?.length ? initial.terms : DEFAULT_TERMS,
  currentTerm: initial?.currentTerm ?? "T1",
  termCategories: initial?.termCategories ?? DEFAULT_CATS,
  status: initial?.status ?? "draft",
  editWindow: initial?.editWindow ?? {},
};




  const [data, setData] = useState<GradebookData>(mergedInit);

  // ➕ MODO BOLIVIA (lee el nivel y reglas)
  const nivel = getNivel(); // "inicial" | "primaria" | "secundaria"
  const reglas = getReglas();
  const cfg = reglas[nivel];
  const isQuali = (cfg as any)?.type === "QUALITATIVE";

  // Redondeo/decimales + umbral aprobación
  const [roundMode, setRoundMode] = useState<"none" | "round" | "floor" | "ceil">("none");
  const [decimals, setDecimals] = useState<number>(2);
  const [passMark, setPassMark] = useState<number>(11);

  // Forzar escala Bolivia en numérico (0–100) y aprobatoria 51. En cualitativo, inicializar contenedor.
  useEffect(() => {
    if (!isQuali) {
      setData((d) => ({ ...d, minScore: 0, maxScore: 100 }));
      setPassMark(51);
      setDecimals((cfg as any)?.decimales ?? 0);
    } else {
      setPassMark(51); // se ignora visualmente en Inicial
      setData((d) => ({ ...d, qualitative: d.qualitative ?? {} }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  const statusRef = useRef<HTMLSpanElement>(null);
  const pasteBox = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Undo/Redo
  const [undoStack, setUndoStack] = useState<GradebookData[]>([]);
  const [redoStack, setRedoStack] = useState<GradebookData[]>([]);

  // Foco actual (para limpiar con Delete)
  const focusRef = useRef<{ sid?: string; cid?: string }>({});

  // Comentarios en ref para mutaciones rápidas
  const commentsRef = useRef<CommentsMap>(data.comments ?? {});
  useEffect(() => {
    commentsRef.current = data.comments ?? {};
  }, [data.comments]);

  // Refresh ante cambios en initial
useEffect(() => {
  const next: GradebookData = {
    ...initial,
    minScore: initial?.minScore ?? 0,
    maxScore: initial?.maxScore ?? 100,
    students: initial?.students ?? [],       // ✅
    columns: (initial?.columns ?? []).map((c) => ({ termId: initial?.currentTerm ?? "T1", ...c })), // ✅
    grades: initial?.grades ?? {},           // ✅
    comments: initial?.comments ?? {},
    qualitative: initial?.qualitative ?? undefined,
    dropLowest: initial?.dropLowest ?? false,
    terms: initial?.terms?.length ? initial.terms : DEFAULT_TERMS,
    currentTerm: initial?.currentTerm ?? "T1",
    termCategories: initial?.termCategories ?? DEFAULT_CATS,
    status: initial?.status ?? "draft",
    editWindow: initial?.editWindow ?? {},
  };
  setData(next);
}, [initial]);


  // ¿Se puede editar?
  const isInsideWindow = useMemo(() => {
    const st = data.editWindow?.start ? new Date(data.editWindow.start).getTime() : -Infinity;
    const en = data.editWindow?.end ? new Date(data.editWindow.end).getTime() : Infinity;
    const n = Date.now();
    return n >= st && n <= en;
  }, [data.editWindow]);
  const isFlowEditable = (data.status ?? "draft") === "draft";
  const canEdit = !data.locked && isFlowEditable && isInsideWindow;

  /** Rounding */
  const applyRound = (n: number) => {
    if (roundMode === "none") return n;
    const f = Math.pow(10, decimals);
    if (roundMode === "round") return Math.round(n * f) / f;
    if (roundMode === "floor") return Math.floor(n * f) / f;
    if (roundMode === "ceil") return Math.ceil(n * f) / f;
    return n;
  };

  /** Recuperatorio: retorna la nota efectiva para esa columna */
  function getEffectiveScore(sid: string, col: Column): number | null {
    const base = data.grades[k(sid, col.id)];
    if (col.recoveryFor) {
      const rec = data.grades[k(sid, col.recoveryFor)];
      const b = base == null ? null : Number(base);
      const r = rec == null ? null : Number(rec);
      if (b == null && r == null) return null;
      return Math.max(Number(b ?? 0), Number(r ?? 0));
    }
    return base ?? null;
  }

  /** Promedio por estudiante en el trimestre visible (con categorías si existen) */
  const termAverages = useMemo(() => {
    const out: Record<string, number> = {};
    const termId = data.currentTerm ?? "T1";
    const cats = data.termCategories?.[termId];

    if (cats?.length) {
      data.students.forEach((s) => {
        let tTot = 0,
          tW = 0;
        for (const cat of cats) {
          let cTot = 0,
            cW = 0;
          data.columns.forEach((col) => {
            if (col.termId !== termId || col.categoryId !== cat.id) return;
            const v = getEffectiveScore(s.id, col);
            if (v != null) {
              cTot += v * col.weight;
              cW += col.weight;
            }
          });
          const catAvg = cW ? cTot / cW : 0;
          tTot += catAvg * cat.weight;
          tW += cat.weight;
        }
        out[s.id] = tW ? tTot / tW : 0;
      });
      return out;
    }

    // Sin categorías: promedio ponderado simple del término
    data.students.forEach((s) => {
      let tot = 0,
        w = 0;
      data.columns.forEach((c) => {
        if (c.termId !== termId) return;
        const v = getEffectiveScore(s.id, c);
        if (v != null) {
          tot += v * c.weight;
          w += c.weight;
        }
      });
      out[s.id] = w ? tot / w : 0;
    });
    return out;
  }, [data]);

  /** Promedio FINAL ponderando T1/T2/T3 */
  const finalAverages = useMemo(() => {
    const out: Record<string, number> = {};
    const terms = data.terms ?? [];
    data.students.forEach((s) => {
      let tot = 0,
        wsum = 0;
      terms.forEach((t) => {
        let avgTerm = 0;
        const cats = data.termCategories?.[t.id];
        if (cats?.length) {
          let tTot = 0,
            tW = 0;
          for (const cat of cats) {
            let cTot = 0,
              cW = 0;
            data.columns.forEach((col) => {
              if (col.termId !== t.id || col.categoryId !== cat.id) return;
              const v = getEffectiveScore(s.id, col);
              if (v != null) {
                cTot += v * col.weight;
                cW += col.weight;
              }
            });
            const catAvg = cW ? cTot / cW : 0;
            tTot += catAvg * cat.weight;
            tW += cat.weight;
          }
          avgTerm = tW ? tTot / tW : 0;
        } else {
          let tt = 0,
            tw = 0;
          data.columns.forEach((c) => {
            if (c.termId !== t.id) return;
            const v = getEffectiveScore(s.id, c);
            if (v != null) {
              tt += v * c.weight;
              tw += c.weight;
            }
          });
          avgTerm = tw ? tt / tw : 0;
        }
        tot += avgTerm * t.weight;
        wsum += t.weight;
      });
      out[s.id] = wsum ? tot / wsum : 0;
    });
    return out;
  }, [data]);

  /** Promedio por evaluación (para footer) */
  const columnAverages = useMemo(() => {
    const out: Record<string, number | ""> = {};
    data.columns.forEach((c) => {
      let sum = 0,
        cnt = 0;
      data.students.forEach((s) => {
        const v = getEffectiveScore(s.id, c);
        if (v != null && !Number.isNaN(v as number)) {
          sum += Number(v);
          cnt++;
        }
      });
      out[c.id] = cnt ? Number((sum / cnt).toFixed(decimals)) : "";
    });
    return out;
  }, [data.columns, data.students, data.grades, decimals]);

  /** Promedio por categoría (fila en footer) del término visible */
  const categoryAverages = useMemo(() => {
    const termId = data.currentTerm ?? "T1";
    const cats = data.termCategories?.[termId] ?? [];
    const result: { id: string; label: string; avg: number | "" }[] = [];
    for (const cat of cats) {
      let sum = 0,
        cnt = 0;
      data.students.forEach((s) => {
        let cTot = 0,
          cW = 0;
        data.columns.forEach((col) => {
          if (col.termId !== termId || col.categoryId !== cat.id) return;
          const v = getEffectiveScore(s.id, col);
          if (v != null) {
            cTot += v * col.weight;
            cW += col.weight;
          }
        });
        const avg = cW ? cTot / cW : 0;
        if (!Number.isNaN(avg)) {
          sum += avg;
          cnt++;
        }
      });
      result.push({ id: cat.id, label: cat.name, avg: cnt ? Number((sum / cnt).toFixed(decimals)) : "" });
    }
    return result;
  }, [data]);

  /** Autosave (debounce) */
  useEffect(() => {
    if (!dirty || !onSave) return;
    const t = setTimeout(async () => {
      try {
        setSaving(true);
        await onSave({ ...data, comments: commentsRef.current });
        if (statusRef.current) statusRef.current.textContent = "Cambios guardados";
      } catch {
        if (statusRef.current) statusRef.current.textContent = "No se pudo guardar (¿API apagada?)";
      } finally {
        setSaving(false);
        setDirty(false);
      }
    }, 800);
    return () => clearTimeout(t);
  }, [dirty, data, onSave]);

  /** Undo/Redo snapshots */
  function snapshot() {
    setUndoStack((st) => [...st, JSON.parse(JSON.stringify({ ...data, comments: commentsRef.current }))]);
    setRedoStack([]);
  }
  function undo() {
    if (!undoStack.length) return;
    const prev = undoStack[undoStack.length - 1];
    setUndoStack((st) => st.slice(0, -1));
    setRedoStack((st) => [...st, JSON.parse(JSON.stringify({ ...data, comments: commentsRef.current }))]);
    commentsRef.current = prev.comments ?? {};
    setData(prev);
    setDirty(true);
  }
  function redo() {
    if (!redoStack.length) return;
    const next = redoStack[redoStack.length - 1];
    setRedoStack((st) => st.slice(0, -1));
    setUndoStack((st) => [...st, JSON.parse(JSON.stringify({ ...data, comments: commentsRef.current }))]);
    commentsRef.current = next.comments ?? {};
    setData(next);
    setDirty(true);
  }

  /** Set nota (numérico) */
  function setScore(studentId: string, colId: string, raw: string) {
    if (!canEdit) return;
    const col = data.columns.find((c) => c.id === colId);
    if (col?.locked) return;

    const n = Number(raw);
    if (Number.isNaN(n)) return;

    const upper = col?.maxPoints != null ? Math.min(data.maxScore, col.maxPoints) : data.maxScore;
    const lower = col?.minRequired != null ? Math.max(data.minScore, col.minRequired) : data.minScore;
    const v = clamp(applyRound(n), lower, upper);

    snapshot();
    setData((d) => ({ ...d, grades: { ...d.grades, [k(studentId, colId)]: v } }));
    setDirty(true);
  }

  /** Set nivel cualitativo (Inicial) */
  function setQualiLevel(studentId: string, colId: string, code: string) {
    if (!canEdit) return;
    const col = data.columns.find((c) => c.id === colId);
    if (col?.locked) return;

    snapshot();
    setData((d) => {
      const nextQ = { ...(d.qualitative ?? {}) };
      nextQ[`${studentId}:${colId}`] = code || undefined;
      return { ...d, qualitative: nextQ };
    });
    setDirty(true);
  }

  /** Agregar evaluación en el trimestre activo (normaliza pesos en el término) */
  function addColumn() {
    if (!canEdit) return;
    const title = prompt("Nombre de la evaluación:", "Nueva");
    if (!title) return;
    const termId = data.currentTerm ?? "T1";
    snapshot();
    const nextAll = [...data.columns, { id: `C${Date.now()}`, title, weight: 1, termId }];
    const sameTerm = nextAll.filter((c) => c.termId === termId);
    sameTerm.forEach((c) => (c.weight = 1 / sameTerm.length));
    setData((d) => ({ ...d, columns: nextAll }));
    setDirty(true);
  }

  function duplicateColumn(colId: string) {
    if (!canEdit) return;
    const col = data.columns.find((c) => c.id === colId);
    if (!col) return;
    snapshot();
    const twin: Column = { ...col, id: `C${Date.now()}`, title: `${col.title} (copia)` };
    const list = [...data.columns];
    const idx = list.findIndex((c) => c.id === colId);
    list.splice(idx + 1, 0, twin);
    const same = list.filter((c) => c.termId === col.termId);
    same.forEach((c) => (c.weight = 1 / same.length));
    setData((d) => ({ ...d, columns: list }));
    setDirty(true);
  }
  function removeColumn(colId: string) {
    if (!canEdit) return;
    if (!confirm("¿Eliminar esta evaluación?")) return;
    const col = data.columns.find((c) => c.id === colId);
    if (!col) return;
    snapshot();
    const list = data.columns.filter((c) => c.id !== colId);
    const grades = { ...data.grades };
    Object.keys(grades).forEach((key) => {
      if (key.endsWith(`:${colId}`)) delete (grades as any)[key];
    });
    const same = list.filter((c) => c.termId === col.termId);
    if (same.length) same.forEach((c) => (c.weight = 1 / same.length));
    setData((d) => ({ ...d, columns: list, grades }));
    setDirty(true);
  }
  function moveColumn(colId: string, dir: "left" | "right") {
    if (!canEdit) return;
    const list = [...data.columns];
    const i = list.findIndex((c) => c.id === colId);
    if (i < 0) return;
    const term = list[i].termId;
    const indicesSame = list
      .map((c, idx) => ({ c, idx }))
      .filter((x) => x.c.termId === term)
      .map((x) => x.idx);
    const pos = indicesSame.indexOf(i);
    if (pos < 0) return;
    const targetPos = dir === "left" ? pos - 1 : pos + 1;
    if (targetPos < 0 || targetPos >= indicesSame.length) return;
    const j = indicesSame[targetPos];
    snapshot();
    [list[i], list[j]] = [list[j], list[i]];
    setData((d) => ({ ...d, columns: list }));
    setDirty(true);
  }

  /** Gestionar estudiantes */
  function addStudent() {
    if (!canEdit) return;
    const name = prompt("Nombre del estudiante:");
    if (!name) return;
    snapshot();
    const st = { id: `S${Date.now()}`, name: name.trim() };
    setData((d) => ({ ...d, students: [...d.students, st] }));
    setDirty(true);
  }
  function renameStudent(id: string) {
    if (!canEdit) return;
    const st = data.students.find((s) => s.id === id);
    if (!st) return;
    const name = prompt("Nuevo nombre:", st.name);
    if (!name) return;
    snapshot();
    setData((d) => ({ ...d, students: d.students.map((s) => (s.id === id ? { ...s, name: name.trim() } : s)) }));
    setDirty(true);
  }
  function removeStudent(id: string) {
    if (!canEdit) return;
    if (!confirm("¿Eliminar a este estudiante?")) return;
    snapshot();
    const students = data.students.filter((s) => s.id !== id);
    const grades = { ...data.grades };
    Object.keys(grades).forEach((key) => {
      if (key.startsWith(`${id}:`)) delete (grades as any)[key];
    });
    const comments = { ...(data.comments ?? {}) };
    Object.keys(comments).forEach((key) => {
      if (key.startsWith(`${id}:`)) delete (comments as any)[key];
    });
    commentsRef.current = comments;
    setData((d) => ({ ...d, students, grades, comments }));
    setDirty(true);
  }

  /** Export CSV/XLSX/Print */
  function exportCSV() {
    if (isQuali) {
      alert("Inicial (cualitativa): use Boletín/Acta para reportes, no planilla numérica.");
      return;
    }
    const headers = ["Estudiante", ...data.columns.map((c) => `${c.termId}-${c.title}`), "Prom. Trimestre", "Prom. Final"];
    const rows = data.students.map((s) => {
      const cells = data.columns.map((c) => getEffectiveScore(s.id, c) ?? "");
      const avgT = (termAverages[s.id] ?? 0).toFixed(decimals);
      const avgF = (finalAverages[s.id] ?? 0).toFixed(decimals);
      return [s.name, ...cells, avgT, avgF];
    });
    const csv = [headers, ...rows]
      .map((r) => r.map((x) => `"${String(x).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "libro_notas.csv";
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function exportXlsx() {
    if (isQuali) {
      alert("Inicial (cualitativa): use Boletín/Acta para reportes, no planilla numérica.");
      return;
    }
    const headers = ["Estudiante", ...data.columns.map((c) => `${c.termId}-${c.title}`), "Prom. Trimestre", "Prom. Final"];
    const rows = data.students.map((s) => {
      const cells = data.columns.map((c) => getEffectiveScore(s.id, c) ?? "");
      const avgT = (termAverages[s.id] ?? 0).toFixed(decimals);
      const avgF = (finalAverages[s.id] ?? 0).toFixed(decimals);
      return [s.name, ...cells, avgT, avgF];
    });
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    XLSX.utils.book_append_sheet(wb, ws, "Libro");
    XLSX.writeFile(wb, "libro_notas.xlsx");
  }

  function printSheet() {
    if (isQuali) {
      alert("Inicial (cualitativa): imprima desde el Boletín/Acta, no desde el libro numérico.");
      return;
    }

    const win = window.open("", "_blank");
    if (!win) return;
    const visibleCols = data.columns.filter((c) => c.termId === (data.currentTerm ?? "T1"));
    const head = `
      <style>
        body{font-family:system-ui,Segoe UI,Roboto,Helvetica,Arial,sans-serif;padding:16px}
        table{width:100%;border-collapse:collapse;font-size:12px}
        th,td{border:1px solid #ddd;padding:6px}
        thead{background:#f6f7f8}
        .ok{background:#eaf7ea}
        .bad{background:#ffecec}
      </style>`;
    const rows = data.students
      .map((s) => {
        const cells = visibleCols
          .map((c) => {
            const v = getEffectiveScore(s.id, c);
            const cls = v != null && v >= passMark ? "ok" : v != null ? "bad" : "";
            return `<td class="${cls}">${v ?? ""}</td>`;
          })
          .join("");
        const t = termAverages[s.id]?.toFixed(decimals) ?? "0";
        const f = finalAverages[s.id]?.toFixed(decimals) ?? "0";
        return `<tr><td>${s.name}</td>${cells}<td>${t}</td><td>${f}</td></tr>`;
      })
      .join("");
    const colsHead = visibleCols.map((c) => `<th>${c.title}</th>`).join("");
    win.document.write(`
      <html><head><meta charset="utf-8">${head}</head><body>
      <h3>Libro de notas — ${data.currentTerm}</h3>
      <table>
        <thead><tr><th>Estudiante</th>${colsHead}<th>Prom. T</th><th>Final</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
      <script>window.onload=()=>window.print()</script>
      </body></html>`);
    win.document.close();
  }

  /** Import XLSX/XLS/XLSM (multi-hoja con prefijos T1-/T2-/T3-) */
  function parseTermFromHeader(h: string): TermId {
    const m = /^T(1|2|3)\s*[-_:]\s*(.+)$/i.exec(h ?? "");
    if (m) return `T${m[1]}` as TermId;
    return data.currentTerm ?? "T1";
  }
  function cleanTitle(h: string) {
    const m = /^T(1|2|3)\s*[-_:]\s*(.+)$/i.exec(h ?? "");
    return m ? m[2].trim() : (h ?? "").trim();
  }
  function parseTermFromSheetName(name: string): TermId | null {
    const n = (name || "").toLowerCase();
    if (n.includes("t1") || n.includes("trim1") || n.includes("trimestre 1") || n.includes("primer")) return "T1";
    if (n.includes("t2") || n.includes("trim2") || n.includes("trimestre 2") || n.includes("segundo")) return "T2";
    if (n.includes("t3") || n.includes("trim3") || n.includes("trimestre 3") || n.includes("tercer")) return "T3";
    return null;
  }

  function handleImportXlsx(e: React.ChangeEvent<HTMLInputElement>) {
    if (isQuali) {
      alert("Inicial (cualitativa): la importación desde Excel está deshabilitada.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const wb = XLSX.read(reader.result, { type: "array" });
      let sheetNames = [...wb.SheetNames];
      if (!confirm(`Importar TODAS las hojas (${sheetNames.length})? Aceptar = todas, Cancelar = elegir.`)) {
        const input = prompt(
          `Escribe nombres de hojas separados por coma:\n${sheetNames.join(", ")}`,
          sheetNames.join(", ")
        );
        if (!input) return;
        const wanted = input.split(",").map((s) => s.trim());
        sheetNames = sheetNames.filter((n) => wanted.includes(n));
      }

      snapshot();
      let cols = [...data.columns];
      const students = [...data.students];
      const grades = { ...data.grades };

      for (const sheetName of sheetNames) {
        const ws = wb.Sheets[sheetName];
        const arr = XLSX.utils.sheet_to_json<string[]>(ws, { header: 1 }) as string[][];
        if (!arr.length) continue;

        const sheetTerm = parseTermFromSheetName(sheetName);

        const headers = arr.shift()!;
        const evals = headers.slice(1);

        // columnas
        evals.forEach((hRaw) => {
          const h = String(hRaw ?? "");
          const termId = sheetTerm ?? parseTermFromHeader(h);
          const title = sheetTerm ? h.trim() : cleanTitle(h);
          if (!cols.find((c) => c.title === title && c.termId === termId)) {
            cols.push({ id: `C${Date.now()}${Math.random()}`, title, weight: 1, termId });
          }
        });

        (["T1", "T2", "T3"] as TermId[]).forEach((tid) => {
          const group = cols.filter((c) => c.termId === tid);
          if (group.length) group.forEach((c) => (c.weight = 1 / group.length));
        });

        // filas
        arr.forEach((r) => {
          const name = r[0];
          if (!name) return;
          let st = students.find((s) => s.name === name);
          if (!st) {
            st = { id: `S${Date.now()}${Math.random()}`, name };
            students.push(st);
          }
          evals.forEach((hRaw, i) => {
            const h = String(hRaw ?? "");
            const termId = sheetTerm ?? parseTermFromHeader(h);
            const title = sheetTerm ? h.trim() : cleanTitle(h);
            const col = cols.find((c) => c.title === title && c.termId === termId);
            if (!col) return;
            const raw = r[i + 1];
            if (raw == null || raw === "") return;
            const n = Number(raw);
            if (!Number.isNaN(n)) {
              const upper = col.maxPoints != null ? Math.min(data.maxScore, col.maxPoints) : data.maxScore;
              grades[k(st.id, col.id)] = clamp(applyRound(n), data.minScore, upper);
            }
          });
        });
      }

      setData((d) => ({ ...d, columns: cols, students, grades }));
      setDirty(true);
      if (fileInputRef.current) fileInputRef.current.value = "";
    };
    reader.readAsArrayBuffer(file);
  }

  /** Pegar desde Excel via textarea (primera fila = headers) */
  function pasteFromExcel() {
    if (isQuali) {
      alert("Inicial (cualitativa): el pegado desde Excel está deshabilitado.");
      return;
    }
    if (!canEdit) return;
    const ta = pasteBox.current!;
    ta.classList.remove("hidden");
    ta.value = "";
    ta.focus();

    const handler = (e: KeyboardEvent) => {
      if (e.key !== "Enter") return;
      e.preventDefault();
      ta.classList.add("hidden");
      const lines = ta.value.trim().split(/\r?\n/).map((r) => r.split("\t"));
      if (!lines.length) return;

      const headers = lines.shift()!;
      const evals = headers.slice(1);

      snapshot();
      let cols = [...data.columns];
      evals.forEach((h) => {
        const termId = parseTermFromHeader(String(h));
        const title = cleanTitle(String(h));
        if (!cols.find((c) => c.title === title && c.termId === termId)) {
          cols.push({ id: `C${Date.now()}${Math.random()}`, title, weight: 1, termId });
        }
      });
      (["T1", "T2", "T3"] as TermId[]).forEach((tid) => {
        const group = cols.filter((c) => c.termId === tid);
        if (group.length) group.forEach((c) => (c.weight = 1 / group.length));
      });

      const students = [...data.students];
      const grades = { ...data.grades };
      lines.forEach((r) => {
        const name = r[0];
        if (!name) return;
        let st = students.find((s) => s.name === name);
        if (!st) {
          st = { id: `S${Date.now()}${Math.random()}`, name };
          students.push(st);
        }
        evals.forEach((h, i) => {
          const termId = parseTermFromHeader(String(h));
          const title = cleanTitle(String(h));
          const col = cols.find((c) => c.title === title && c.termId === termId);
          if (!col) return;
          const raw = r[i + 1];
          if (raw == null) return;
          const n = Number(raw);
          if (!Number.isNaN(n)) {
            const upper = col.maxPoints != null ? Math.min(data.maxScore, col.maxPoints) : data.maxScore;
            grades[k(st.id, col.id)] = clamp(applyRound(n), data.minScore, upper);
          }
        });
      });

      setData((d) => ({ ...d, columns: cols, students, grades }));
      setDirty(true);
      ta.removeEventListener("keydown", handler);
    };

    ta.addEventListener("keydown", handler);
  }

  /** Pegado directo (Ctrl+V) a partir de la celda enfocada */
  function handleDirectPaste(e: React.ClipboardEvent<HTMLDivElement>) {
    if (!canEdit) return;
    const text = e.clipboardData.getData("text");
    if (!text?.includes("\t") && !text?.includes("\n")) return;
    const active = document.activeElement as HTMLInputElement | null;
    const sid = active?.getAttribute("data-row");
    const cid = active?.getAttribute("data-col");
    if (!sid || !cid) return;

    e.preventDefault();
    const rows = text.split(/\r?\n/).filter(Boolean).map((r) => r.split("\t"));
    if (!rows.length) return;

    const startRow = data.students.findIndex((s) => s.id === sid);
    const startCol = data.columns.findIndex((c) => c.id === cid);

    snapshot();
    const grades = { ...data.grades };
    rows.forEach((r, i) => {
      r.forEach((raw, j) => {
        const rr = startRow + i;
        const cc = startCol + j;
        if (rr >= data.students.length || cc >= data.columns.length) return;
        const n = Number(raw);
        if (!Number.isNaN(n)) {
          const c = data.columns[cc];
          const upper = c.maxPoints != null ? Math.min(data.maxScore, c.maxPoints) : data.maxScore;
          const lower =
            c.minRequired != null ? Math.max(data.minScore, c.minRequired) : data.minScore;
          const v = clamp(applyRound(n), lower, upper);
          grades[`${data.students[rr].id}:${c.id}`] = v;
        }
      });
    });
    setData((d) => ({ ...d, grades }));
    setDirty(true);
  }

  /** Atajos globales: Ctrl+S, Ctrl+Z/Y, Delete limpia */
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const isCtrl = e.ctrlKey || e.metaKey;
      if (isCtrl && e.key.toLowerCase() === "s") {
        e.preventDefault();
        setDirty(true);
      } else if (isCtrl && e.key.toLowerCase() === "z") {
        e.preventDefault();
        undo();
      } else if (isCtrl && (e.key.toLowerCase() === "y" || (e.shiftKey && e.key.toLowerCase() === "z"))) {
        e.preventDefault();
        redo();
      } else if ((e.key === "Delete" || e.key === "Backspace") && focusRef.current.sid && focusRef.current.cid) {
        if (!canEdit) return;
        const { sid, cid } = focusRef.current;
        if (!sid || !cid) return;
        const col = data.columns.find((c) => c.id === cid);
        if (col?.locked) return;
        snapshot();
        setData((d) => {
          const next = { ...d.grades };
          next[k(sid, cid)] = null;
          return { ...d, grades: next };
        });
        setDirty(true);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [data, canEdit]);

  /** Navegación por teclado (flechas, Tab/Shift+Tab, Enter) */
  function handleGridKey(e: React.KeyboardEvent<HTMLInputElement>, sid: string, cid: string) {
    const cols = data.columns.length;
    const rows = data.students.length;
    const rowIdx = data.students.findIndex((s) => s.id === sid);
    const colIdx = data.columns.findIndex((c) => c.id === cid);

    let nextRow = rowIdx;
    let nextCol = colIdx;

    if (e.key === "ArrowRight" || (e.key === "Tab" && !e.shiftKey)) nextCol = Math.min(colIdx + 1, cols - 1);
    else if (e.key === "ArrowLeft" || (e.key === "Tab" && e.shiftKey)) nextCol = Math.max(colIdx - 1, 0);
    else if (e.key === "ArrowDown" || e.key === "Enter") nextRow = Math.min(rowIdx + 1, rows - 1);
    else if (e.key === "ArrowUp") nextRow = Math.max(rowIdx - 1, 0);
    else return;

    e.preventDefault();
    const next = document.querySelector<HTMLInputElement>(
      `td input[data-row="${data.students[nextRow].id}"][data-col="${data.columns[nextCol].id}"]`
    );
    next?.focus();
    next?.select();
  }

  const visibleTerm = data.currentTerm ?? "T1";
  const visibleCols = data.columns.filter((c) => c.termId === visibleTerm);
  const visibleCats = data.termCategories?.[visibleTerm] ?? [];

  /** === Celda NOTA === */
  type GradeCellProps = {
    s: Student; c: Column; val: number | ""; passMark: number; canEdit: boolean;
  };
  const GradeCell = ({ s, c, val, passMark, canEdit }: GradeCellProps) => {
    const commentKey = k(s.id, c.id);
    const comment = (data.comments ?? {})[commentKey];

    if (isQuali) {
      // Inicial (cualitativo)
      const qKey = `${s.id}:${c.id}`;
      const current = (data.qualitative ?? {})[qKey] ?? "";

      return (
        <div className="flex items-center gap-1">
          <Select
            value={current}
            onValueChange={(v) => setQualiLevel(s.id, c.id, v)}
            disabled={!canEdit || !!c.locked}
          >
            <SelectTrigger className="h-8 w-full min-w-[160px] text-xs" title="Nivel de logro">
              <SelectValue placeholder="Seleccionar nivel" />
            </SelectTrigger>
            <SelectContent>
              {(cfg as any).niveles
                ?.slice()
                ?.sort((a: any, b: any) => a.order - b.order)
                .map((n: any) => (
                  <SelectItem key={n.code} value={n.code}>{n.label}</SelectItem>
                ))}
            </SelectContent>
          </Select>

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                className="text-xs px-2 py-1 border rounded hover:bg-muted"
                onClick={() => {
                  const cur = comment ?? "";
                  const txt = prompt("Comentario / observación:", cur);
                  if (txt === null) return;
                  const next = txt || undefined;
                  snapshot();
                  const nextComments = { ...(data.comments ?? {}) };
                  nextComments[commentKey] = next;
                  commentsRef.current = nextComments;
                  setData((d) => ({ ...d, comments: nextComments }));
                  setDirty(true);
                }}
                title={comment ? `Comentario: ${comment}` : "Agregar comentario"}
              >
                <MessageSquare className="h-3.5 w-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              {comment ? `Comentario: ${comment}` : "Agregar comentario"}
            </TooltipContent>
          </Tooltip>
        </div>
      );
    }

    // Primaria/Secundaria (numérico)
    const exceeds = c.maxPoints != null && Number(val) > c.maxPoints;
    const passClass = val !== "" ? (Number(val) >= passMark ? "bg-emerald-50" : "bg-red-50") : "";

    const inputEl = (
      <Input
        type="number"
        value={val}
        onChange={(e) => setScore(s.id, c.id, e.target.value)}
        onKeyDown={(e) => handleGridKey(e, s.id, c.id)}
        onFocus={(e) => {
          focusRef.current = { sid: s.id, cid: c.id };
          (e.currentTarget as HTMLInputElement).select();
        }}
        data-row={s.id}
        data-col={c.id}
        disabled={!canEdit || !!c.locked}
        className={`h-8 ${exceeds ? "border border-destructive" : ""} ${passClass}`}
        title={exceeds ? `Supera el máximo (${c.maxPoints})` : undefined}
      />
    );

    return (
      <div className="flex items-center gap-1">
        {exceeds ? (
          <Tooltip>
            <TooltipTrigger asChild>{inputEl}</TooltipTrigger>
            <TooltipContent>Supera el máximo permitido ({c.maxPoints})</TooltipContent>
          </Tooltip>
        ) : (
          inputEl
        )}

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              className="text-xs px-2 py-1 border rounded hover:bg-muted"
              onClick={() => {
                const cur = comment ?? "";
                const txt = prompt("Comentario / observación:", cur);
                if (txt === null) return;
                const next = txt || undefined;
                snapshot();
                const nextComments = { ...(data.comments ?? {}) };
                nextComments[commentKey] = next;
                commentsRef.current = nextComments;
                setData((d) => ({ ...d, comments: nextComments }));
                setDirty(true);
              }}
              title={comment ? `Comentario: ${comment}` : "Agregar comentario"}
            >
              <MessageSquare className="h-3.5 w-3.5" />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            {comment ? `Comentario: ${comment}` : "Agregar comentario"}
          </TooltipContent>
        </Tooltip>
      </div>
    );
  };

  /** === Fila virtualizada === */
  const Row = ({ index, style }: ListChildComponentProps) => {
    const s = data.students[index];
    const avgT = termAverages[s.id] ?? 0;
    const avgF = finalAverages[s.id] ?? 0;
    const avgTClass = avgT >= passMark ? "text-emerald-700" : "text-red-600";
    const avgFClass = avgF >= passMark ? "text-emerald-700" : "text-red-600";

    return (
      <tr style={style as React.CSSProperties} className="border-t">
        <td className="p-2 font-medium whitespace-nowrap">
          <span
            title="Doble click para renombrar"
            onDoubleClick={() => renameStudent(s.id)}
            className={`cursor-text ${!canEdit ? "opacity-60" : ""}`}
          >
            {s.name}
          </span>
          {canEdit && (
            <Button
              variant="ghost"
              size="sm"
              className="ml-2"
              onClick={() => removeStudent(s.id)}
              title="Eliminar estudiante"
            >
              ✕
            </Button>
          )}
        </td>
        {visibleCols.map((c) => {
          const eff = getEffectiveScore(s.id, c);
          const val = (eff ?? "") as number | "";
          return (
            <td key={c.id} className="p-1">
              <GradeCell s={s} c={c} val={val} passMark={passMark} canEdit={canEdit} />
            </td>
          );
        })}
        {!isQuali && (
          <>
            <td className={`p-2 font-medium ${avgTClass}`}>{avgT.toFixed(decimals)}</td>
            <td className={`p-2 font-medium ${avgFClass}`}>{avgF.toFixed(decimals)}</td>
            <td className="p-2">
              {avgF >= passMark ? (
                <Badge variant="success">Aprobado</Badge>
              ) : (
                <Badge variant="destructive">Reprobado</Badge>
              )}
            </td>
          </>
        )}
      </tr>
    );
  };

  // Resumen global
  const total = data.students.length;
  const aprobadosFinal = useMemo(
    () => data.students.filter((s) => (finalAverages[s.id] ?? 0) >= passMark).length,
    [data.students, finalAverages, passMark]
  );

  return (
    <div className="space-y-4">
      {/* Alertas de estado */}
      {!canEdit && (
        <Alert variant="destructive">
          <Info className="h-4 w-4" />
          <AlertTitle>Libro bloqueado o fuera de ventana</AlertTitle>
          <AlertDescription>
            No puedes editar porque está publicado, aprobado o fuera del periodo de edición.
          </AlertDescription>
        </Alert>
      )}

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 rounded-md border bg-card/50 px-3 py-2">
        {/* Estado y ventana */}
        <div className="flex items-center gap-2 text-xs">
          <span className="font-medium">Estado:</span>
          <select
            className="border rounded px-2 py-1"
            value={data.status ?? "draft"}
            onChange={(e) => {
              snapshot();
              setData((d) => ({ ...d, status: e.target.value as Status }));
              setDirty(true);
            }}
          >
            <option value="draft">Borrador</option>
            <option value="submitted">Enviado</option>
            <option value="approved">Aprobado</option>
            <option value="published">Publicado</option>
          </select>
          <span className={`px-2 py-0.5 rounded ${canEdit ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
            {canEdit ? "Editable" : "Bloqueado"}
          </span>
        </div>

        <div className="h-6 w-px bg-border mx-1" />

        {/* Escala (modo Bolivia) */}
        {isQuali ? (
          <div className="flex items-center gap-2">
            <Badge variant="secondary">Inicial · Evaluación cualitativa</Badge>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <label className="text-sm">Escala</label>
            <Input type="number" value={0} disabled className="w-20" />
            <span>-</span>
            <Input type="number" value={100} disabled className="w-20" />
            <Badge variant="outline" className="ml-1">Aprobatoria: 51</Badge>
          </div>
        )}

        {/* Trimestre */}
        <div className="flex items-center gap-2">
          <label className="text-sm">Trimestre</label>
          <select
            className="border rounded px-2 py-1 text-sm"
            value={data.currentTerm}
            onChange={(e) => setData((d) => ({ ...d, currentTerm: e.target.value as TermId }))}
          >
            {(data.terms ?? DEFAULT_TERMS).map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        {/* Peso por trimestre */}
        <div className="flex items-center gap-2">
          <span className="text-sm">Peso T1/T2/T3</span>
          {(data.terms ?? DEFAULT_TERMS).map((t, i) => (
            <div key={t.id} className="flex items-center gap-1">
              <span className="text-xs w-6">{t.id}</span>
              <Input
                type="number"
                className="w-16"
                value={Math.round(t.weight * 100)}
                onChange={(e) => {
                  const pct = clamp(Number(e.target.value), 0, 100);
                  snapshot();
                  setData((d) => ({
                    ...d,
                    terms: (d.terms ?? []).map((tt, idx) => (idx === i ? { ...tt, weight: pct / 100 } : tt)),
                  }));
                  setDirty(true);
                }}
                title={`${t.name} (%) en el promedio final`}
              />
              <span className="text-xs">%</span>
            </div>
          ))}
        </div>

        {/* Redondeo/decimales/umbral (solo numérico) */}
        {!isQuali && (
          <div className="flex items-center gap-2">
            <label className="text-sm">Redondeo</label>
            <select
              className="border rounded px-2 py-1 text-sm"
              value={roundMode}
              onChange={(e) => setRoundMode(e.target.value as any)}
            >
              <option value="none">Ninguno</option>
              <option value="round">Redondear</option>
              <option value="floor">Truncar</option>
              <option value="ceil">Ceil</option>
            </select>
            <label className="text-sm">Decimales</label>
            <Input
              type="number"
              className="w-16"
              value={decimals}
              onChange={(e) => setDecimals(Math.max(0, Number(e.target.value)))}
            />
            <label className="text-sm">Aprobatorio</label>
            <Input type="number" className="w-16" value={51} disabled />
          </div>
        )}

        <div className="h-6 w-px bg-border mx-1" />

        {/* Undo/Redo + drop lowest */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="sm" onClick={undo} disabled={!undoStack.length}>
              <Undo2 className="h-4 w-4 mr-1" /> Deshacer
            </Button>
          </TooltipTrigger>
          <TooltipContent>Ctrl+Z</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="sm" onClick={redo} disabled={!redoStack.length}>
              <Redo2 className="h-4 w-4 mr-1" /> Rehacer
            </Button>
          </TooltipTrigger>
          <TooltipContent>Ctrl+Y / Shift+Ctrl+Z</TooltipContent>
        </Tooltip>

        <label className="flex items-center gap-2 ml-1">
          <input
            type="checkbox"
            checked={!!data.dropLowest}
            onChange={(e) => {
              snapshot();
              setData((d) => ({ ...d, dropLowest: e.target.checked }));
              setDirty(true);
            }}
          />
          <span className="text-sm">Omitir la más baja</span>
        </label>

        <div className="h-6 w-px bg-border mx-1" />

        {/* Acciones core */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="sm" onClick={addColumn} disabled={!canEdit}>
              <PlusCircle className="h-4 w-4 mr-1" /> Evaluación
            </Button>
          </TooltipTrigger>
          <TooltipContent>Agregar evaluación (término actual)</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="sm" onClick={addStudent} disabled={!canEdit}>
              <UserPlus className="h-4 w-4 mr-1" /> Estudiante
            </Button>
          </TooltipTrigger>
          <TooltipContent>Agregar estudiante</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="sm" onClick={exportCSV} disabled={isQuali}>
              <FileDown className="h-4 w-4 mr-1" /> CSV
            </Button>
          </TooltipTrigger>
          <TooltipContent>Exportar CSV</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="sm" onClick={exportXlsx} disabled={isQuali}>
              <FileDown className="h-4 w-4 mr-1" /> XLSX
            </Button>
          </TooltipTrigger>
          <TooltipContent>Exportar Excel</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="sm" onClick={printSheet} disabled={isQuali}>
              <Printer className="h-4 w-4 mr-1" /> Imprimir
            </Button>
          </TooltipTrigger>
          <TooltipContent>Vista de impresión</TooltipContent>
        </Tooltip>

        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls,.xlsm"
          onChange={handleImportXlsx}
          disabled={isQuali}
          className="text-xs"
          title="Importar desde Excel"
        />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="sm" onClick={pasteFromExcel} disabled={!canEdit || isQuali}>
              <ClipboardPaste className="h-4 w-4 mr-1" /> Pegar desde Excel
            </Button>
          </TooltipTrigger>
          <TooltipContent>Primera fila = encabezados</TooltipContent>
        </Tooltip>

        <div className="h-6 w-px bg-border mx-1" />

        {/* Guardar manual */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="sm"
              variant="academic"
              onClick={async () => {
                if (!onSave) return;
                try {
                  setSaving(true);
                  await onSave({ ...data, comments: commentsRef.current });
                  if (statusRef.current) statusRef.current.textContent = "Cambios guardados";
                } finally {
                  setSaving(false);
                }
              }}
            >
              <Save className="h-4 w-4 mr-1" /> Guardar
            </Button>
          </TooltipTrigger>
          <TooltipContent>Guardar cambios ahora</TooltipContent>
        </Tooltip>

        {/* Bloqueo/desbloqueo visual (solo UI) */}
        <div className="ml-auto flex items-center gap-2">
          <span ref={statusRef} className="text-xs text-muted-foreground">
            {saving ? "Guardando…" : ""}
          </span>
          {data.locked ? (
            <Badge variant="destructive" className="gap-1">
              <Lock className="h-3 w-3" /> Bloqueado
            </Badge>
          ) : (
            <Badge variant="secondary" className="gap-1">
              <Unlock className="h-3 w-3" /> Desbloqueado
            </Badge>
          )}
        </div>
      </div>

      {/* Tabla */}
      <div
        className="overflow-auto border rounded-md"
        onPaste={handleDirectPaste}
        onFocusCapture={(e) => {
          const t = e.target as HTMLInputElement;
          focusRef.current = { sid: t.getAttribute("data-row") ?? undefined, cid: t.getAttribute("data-col") ?? undefined };
        }}
      >
        <table className="min-w-[1300px] text-sm">
          <thead className="sticky top-0 bg-muted/30 z-10">
            <tr>
              <th className="p-2 text-left w-[260px]">Estudiante</th>
              {visibleCols.map((c) => (
                <th key={c.id} className="p-2 text-left align-bottom min-w-[240px]">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Term badge + título editable */}
                    <TermBadge term={c.termId as "T1" | "T2" | "T3"} />
                    <span
                      className={`font-medium underline decoration-dotted cursor-pointer ${!canEdit ? "opacity-60" : ""}`}
                      onDoubleClick={() => {
                        if (!canEdit) return;
                        const name = prompt("Renombrar evaluación:", c.title);
                        if (!name) return;
                        snapshot();
                        setData((d) => ({
                          ...d,
                          columns: d.columns.map((col) => (col.id === c.id ? { ...col, title: name.trim() } : col)),
                        }));
                        setDirty(true);
                      }}
                      title="Doble click para renombrar"
                    >
                      {c.title}
                    </span>

                    {/* Categoría */}
                    <select
                      className="border rounded px-1 py-0.5 text-xs"
                      value={c.categoryId ?? ""}
                      onChange={(e) => {
                        if (!canEdit) return;
                        const val = e.target.value || undefined;
                        snapshot();
                        setData((d) => ({
                          ...d,
                          columns: d.columns.map((col) => (col.id === c.id ? { ...col, categoryId: val } : col)),
                        }));
                        setDirty(true);
                      }}
                      title="Categoría"
                    >
                      <option value="">(Sin categoría)</option>
                      {visibleCats.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>

                    {/* Peso (%) */}
                    <div className="flex items-center gap-1">
                      <Input
                        type="number"
                        className="w-16"
                        value={Math.round(c.weight * 100)}
                        onChange={(e) => {
                          if (!canEdit) return;
                          const pct = clamp(Number(e.target.value), 0, 100);
                          snapshot();
                          setData((d) => {
                            const cols = d.columns.map((col) => (col.id === c.id ? { ...col, weight: pct / 100 } : col));
                            return { ...d, columns: cols };
                          });
                          setDirty(true);
                        }}
                        title="Peso (%) en el trimestre"
                      />
                      <span className="text-xs">%</span>
                    </div>

                    {/* Máx / Mín */}
                    <Input
                      type="number"
                      placeholder="Máx"
                      className="w-20"
                      value={c.maxPoints ?? ""}
                      onChange={(e) => {
                        if (!canEdit) return;
                        const val = e.target.value === "" ? undefined : Number(e.target.value);
                        snapshot();
                        setData((d) => ({
                          ...d,
                          columns: d.columns.map((col) => (col.id === c.id ? { ...col, maxPoints: val } : col)),
                        }));
                        setDirty(true);
                      }}
                      title="Puntaje máximo"
                    />
                    <Input
                      type="number"
                      placeholder="Mín"
                      className="w-20"
                      value={c.minRequired ?? ""}
                      onChange={(e) => {
                        if (!canEdit) return;
                        const val = e.target.value === "" ? undefined : Number(e.target.value);
                        snapshot();
                        setData((d) => ({
                          ...d,
                          columns: d.columns.map((col) => (col.id === c.id ? { ...col, minRequired: val } : col)),
                        }));
                        setDirty(true);
                      }}
                      title="Puntaje mínimo requerido"
                    />

                    {/* Recupera a: */}
                    <select
                      className="border rounded px-1 py-0.5 text-xs"
                      value={c.recoveryFor ?? ""}
                      onChange={(e) => {
                        if (!canEdit) return;
                        const val = e.target.value || undefined;
                        snapshot();
                        setData((d) => ({
                          ...d,
                          columns: d.columns.map((col) => (col.id === c.id ? { ...col, recoveryFor: val } : col)),
                        }));
                        setDirty(true);
                      }}
                      title="Recupera a (toma la mejor nota con la evaluación seleccionada)"
                    >
                      <option value="">(Sin recuperatorio)</option>
                      {visibleCols
                        .filter((x) => x.id !== c.id)
                        .map((x) => (
                          <option key={x.id} value={x.id}>
                            {x.title}
                          </option>
                        ))}
                    </select>

                    {/* Bloqueo por columna */}
                    <label className="flex items-center gap-1 text-xs">
                      <input
                        type="checkbox"
                        checked={!!c.locked}
                        onChange={(e) => {
                          if (!canEdit) return;
                          snapshot();
                          setData((d) => ({
                            ...d,
                            columns: d.columns.map((col) => (col.id === c.id ? { ...col, locked: e.target.checked } : col)),
                          }));
                          setDirty(true);
                        }}
                      />
                      Bloq.
                    </label>

                    {/* Mover/duplicar/eliminar */}
                    <div className="flex items-center gap-1">
                      <Button variant="outline" size="sm" onClick={() => moveColumn(c.id, "left")} title="Mover a la izquierda" disabled={!canEdit}>
                        ←
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => moveColumn(c.id, "right")} title="Mover a la derecha" disabled={!canEdit}>
                        →
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => duplicateColumn(c.id)} title="Duplicar" disabled={!canEdit}>
                        Duplicar
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => removeColumn(c.id)} title="Eliminar" disabled={!canEdit}>
                        Eliminar
                      </Button>
                    </div>
                  </div>
                </th>
              ))}
              {!isQuali && (
                <>
                  <th className="p-2 text-left w-[120px]">Promedio T</th>
                  <th className="p-2 text-left w-[120px]">Final</th>
                  <th className="p-2 text-left w-[120px]">Estado</th>
                </>
              )}
            </tr>
          </thead>

          {/* Body virtualizado */}
          <tbody>
            <tr>
              <td colSpan={visibleCols.length + 1 + (!isQuali ? 3 : 0)} className="p-0">
                <List
                  height={520}
                  itemCount={data.students.length}
                  itemSize={42}
                  width={"100%"}
                  outerElementType={"div"}
                  innerElementType={"div"}
                  style={{ overflowX: "hidden" }}
                >
                  {({ index, style }) => (
                    <table style={{ ...style, width: "100%", tableLayout: "fixed" }}>
                      <tbody>
                        <Row index={index} style={{}} data={undefined as any} />
                      </tbody>
                    </table>
                  )}
                </List>
              </td>
            </tr>
          </tbody>

          {/* Footer: promedio por evaluación y categorías (solo numérico) */}
          {!isQuali && (
            <tfoot>
              <tr>
                <td className="p-2 font-semibold bg-muted/30">Promedio por evaluación</td>
                {visibleCols.map((c) => {
                  const v = columnAverages[c.id];
                  const cls = v !== "" && (v as number) >= passMark ? "text-emerald-700" : "text-red-600";
                  return (
                    <td key={c.id} className={`p-2 bg-muted/30 ${v !== "" ? cls : ""}`}>
                      {v !== "" ? (v as number).toFixed(decimals) : ""}
                    </td>
                  );
                })}
                <td className="p-2 bg-muted/30"></td>
                <td className="p-2 bg-muted/30"></td>
                <td className="p-2 bg-muted/30"></td>
              </tr>

              {visibleCats.length > 0 && (
                <tr>
                  <td className="p-2 font-semibold bg-muted/30">Promedio por categoría</td>
                  {visibleCols.map((c) => {
                    const cat = visibleCats.find((x) => x.id === c.categoryId);
                    const firstColOfCat = visibleCols.find((x) => x.categoryId === c.categoryId)?.id === c.id;
                    if (!cat || !firstColOfCat) return <td key={c.id} className="p-2 bg-muted/30"></td>;
                    const item = categoryAverages.find((x) => x.id === cat.id);
                    return (
                      <td key={c.id} className="p-2 bg-muted/30 font-medium">
                        {item?.avg !== "" ? `${cat.name}: ${(item!.avg as number).toFixed(decimals)}` : ""}
                      </td>
                    );
                  })}
                  <td className="p-2 bg-muted/30"></td>
                  <td className="p-2 bg-muted/30"></td>
                  <td className="p-2 bg-muted/30"></td>
                </tr>
              )}
            </tfoot>
          )}
        </table>
      </div>

      {/* Resumen global + tips */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="text-sm flex items-center gap-2">
          {!isQuali ? (
            <>
              <Badge variant="success">{aprobadosFinal} Aprobados</Badge>
              <Badge variant="destructive">{total - aprobadosFinal} Reprobados</Badge>
            </>
          ) : (
            <Badge variant="secondary">Modo cualitativo (Inicial)</Badge>
          )}
          <span className="text-muted-foreground">· Total: {total}</span>
        </div>

        <div className="text-xs text-muted-foreground">
          Tips: <kbd className="px-1.5 py-0.5 rounded bg-muted border">Ctrl+S</kbd> guardar ·{" "}
          <kbd className="px-1.5 py-0.5 rounded bg-muted border">Ctrl+Z</kbd>/<kbd className="px-1.5 py-0.5 rounded bg-muted border">Ctrl+Y</kbd> deshacer/rehacer ·{" "}
          <kbd className="px-1.5 py-0.5 rounded bg-muted border">Delete</kbd> limpia celda · Doble click para renombrar evaluación o estudiante.
        </div>
      </div>

      <textarea ref={pasteBox} className="hidden absolute opacity-0" aria-hidden="true" />
    </div>
  );
}
