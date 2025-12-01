import React from 'react';
export default function ProgressMini({ label, value = 0, color = 'indigo' }: { label: string; value?: number; color?: string }) {
  const colorClass = color === 'indigo' ? 'bg-indigo-500' : color === 'emerald' ? 'bg-emerald-500' : 'bg-sky-500';
  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium">{label}</div>
        <div className="text-sm font-semibold">{value}%</div>
      </div>
      <div className="mt-2 w-full bg-muted-foreground/10 h-2 rounded-full overflow-hidden">
        <div className={`${colorClass} h-2`} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
      </div>
    </div>
  );
}
