import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

type NivelKey = "inicial" | "primaria" | "secundaria";

const NIVEL_LABEL: Record<NivelKey, string> = {
  inicial: "Inicial",
  primaria: "Primaria",
  secundaria: "Secundaria",
};

const sanitizeId = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");

const getTeacherId = () => {
  if (typeof window === "undefined") return "teacher";
  return localStorage.getItem("teacherId") || sanitizeId(localStorage.getItem("teacherName") || "docente");
};

function LevelEntry({ nivel }: { nivel: NivelKey }) {
  const navigate = useNavigate();

  useEffect(() => {
    const teacherId = getTeacherId();

    try {
      // Guardado con scope por docente
      localStorage.setItem(`tt:${teacherId}:nivel`, nivel);
      localStorage.setItem(`tt:${teacherId}:nivelLabel`, NIVEL_LABEL[nivel]);

      // Compatibilidad: global (por si algún módulo viejo lo usa)
      localStorage.setItem("nivel", nivel);
      localStorage.setItem("nivelLabel", NIVEL_LABEL[nivel]);
    } catch {}

    // Redirigir al dashboard docente
    navigate("/dashboard/teacher", { replace: true });
  }, [nivel, navigate]);

  return <div className="p-6 text-muted-foreground">Redirigiendo…</div>;
}

export const InicialEntry = () => <LevelEntry nivel="inicial" />;
export const PrimariaEntry = () => <LevelEntry nivel="primaria" />;
export const SecundariaEntry = () => <LevelEntry nivel="secundaria" />;
