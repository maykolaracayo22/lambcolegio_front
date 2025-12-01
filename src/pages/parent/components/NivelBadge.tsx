import React from 'react';
import { Badge } from '@/components/ui/badge';

const colorsByNivel: Record<string, string> = {
  Inicial: 'bg-orange-50 text-orange-700',
  Primaria: 'bg-indigo-50 text-indigo-700',
  Secundaria: 'bg-emerald-50 text-emerald-700',
};

export default function NivelBadge({ nivel }: { nivel: string }) {
  const classes = colorsByNivel[nivel] || 'bg-gray-50 text-gray-700';
  return (
    <Badge className={`px-2 py-1 rounded-md ${classes}`} aria-label={`Nivel ${nivel}`}>
      {nivel}
    </Badge>
  );
}
