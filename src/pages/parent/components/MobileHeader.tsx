import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';

export const MobileHeader: React.FC<{ title: string; subtitle?: string }> = ({ title, subtitle }) => {
  return (
    <div className="flex items-center justify-between gap-4 p-2 bg-white rounded-lg shadow-sm">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => (window.history.length > 1 ? window.history.back() : window.location.href = '/') }>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div>
          <div className="font-bold text-lg">{title}</div>
          {subtitle && <div className="text-sm text-muted-foreground">{subtitle}</div>}
        </div>
      </div>
      <div className="hidden sm:flex items-center gap-2">
        {/* espacio para acciones rápidas en pantallas grandes si se desea */}
      </div>
    </div>
  );
};

export default MobileHeader;
