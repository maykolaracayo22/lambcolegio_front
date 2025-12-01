import React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import ControlMensualidades from "./financial/ControlMensualidades";
import RegistroPagos from "./financial/RegistroPagos";
import Facturacion from "./financial/Facturacion";
import Morosidad from "./financial/Morosidad";
import ReportesFinancieros from "./financial/ReportesFinancieros";
import ConfiguracionFinanciera from "./financial/ConfiguracionFinanciera";
import Comunicaciones from "./financial/Comunicaciones";
import Integraciones from "./financial/Integraciones";

export default function FinancialModule() {
  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center">
        <h1 className="text-2xl font-bold">Módulo Financiero — Gestión Financiera</h1>
      </div>

      <Tabs defaultValue="control">
        <TabsList>
          <TabsTrigger value="control">Control Mensualidades</TabsTrigger>
          <TabsTrigger value="registro">Registro y Pagos</TabsTrigger>
          <TabsTrigger value="facturacion">Facturación</TabsTrigger>
          <TabsTrigger value="morosidad">Gestión de Deudas</TabsTrigger>
          <TabsTrigger value="reportes">Reportes</TabsTrigger>
          <TabsTrigger value="config">Configuración</TabsTrigger>
          <TabsTrigger value="coms">Comunicaciones</TabsTrigger>
          <TabsTrigger value="int">Integraciones</TabsTrigger>
        </TabsList>

        <TabsContent value="control">
          <ControlMensualidades />
        </TabsContent>
        <TabsContent value="registro">
          <RegistroPagos />
        </TabsContent>
        <TabsContent value="facturacion">
          <Facturacion />
        </TabsContent>
        <TabsContent value="morosidad">
          <Morosidad />
        </TabsContent>
        <TabsContent value="reportes">
          <ReportesFinancieros />
        </TabsContent>
        <TabsContent value="config">
          <ConfiguracionFinanciera />
        </TabsContent>
        <TabsContent value="coms">
          <Comunicaciones />
        </TabsContent>
        <TabsContent value="int">
          <Integraciones />
        </TabsContent>
      </Tabs>
    </div>
  );
}
