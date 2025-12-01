import React from 'react';
import { Button } from '@/components/ui/button';

type QuickActionProps = {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  color?: string; // tailwind color key like 'indigo', 'emerald'
  onClick?: () => void;
};

export default function QuickAction({ id, label, icon: Icon, color = 'indigo', onClick }: QuickActionProps) {
  const bg = {
    indigo: 'bg-indigo-50 text-indigo-700',
    emerald: 'bg-emerald-50 text-emerald-700',
    yellow: 'bg-yellow-50 text-yellow-700',
    pink: 'bg-pink-50 text-pink-700',
    sky: 'bg-sky-50 text-sky-700',
  }[color] || 'bg-gray-50 text-gray-700';

  return (
    <Button
      id={id}
      onClick={onClick}
      className={`flex items-center gap-3 p-3 rounded-lg justify-start text-left ${bg} shadow-sm`}>
      <div className="p-2 rounded-md bg-white/70">
        <Icon className="w-6 h-6" />
      </div>
      <div className="flex-1">
        <div className="font-semibold">{label}</div>
        <div className="text-xs text-muted-foreground">Toca para ver</div>
      </div>
    </Button>
  );
}
