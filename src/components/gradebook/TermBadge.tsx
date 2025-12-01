// src/components/gradebook/TermBadge.tsx
export default function TermBadge({ term }: { term: "T1"|"T2"|"T3" }) {
  const map = { T1: "bg-emerald-100 text-emerald-700", T2: "bg-amber-100 text-amber-700", T3: "bg-sky-100 text-sky-700" };
  return <span className={`text-[10px] px-2 py-0.5 rounded ${map[term]}`}>{term}</span>;
}
