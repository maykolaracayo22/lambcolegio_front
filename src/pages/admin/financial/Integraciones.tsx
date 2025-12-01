import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

// RFs cubiertos: RF-022, RF-023
export default function Integraciones() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Integraciones</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm mb-2">Sincronización con módulo académico y opciones para conciliación bancaria.</p>
        </CardContent>
      </Card>
    </div>
  );
}