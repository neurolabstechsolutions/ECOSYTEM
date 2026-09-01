"use client";

import React, { useState } from "react";
import { Settings, Building2, Bell, Shield, Paintbrush, Save } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

export default function SettingsPage() {
  const [companyName, setCompanyName] = useState("NeuroLabs Tech Solutions S.A.S.");
  const [taxId, setTaxId] = useState("901.482.119-4");
  const [city, setCity] = useState("Barranquilla, Colombia");
  const [whatsappNotifications, setWhatsappNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [twoFactorAuth, setTwoFactorAuth] = useState(true);

  const handleSave = () => {
    toast.success("Configuraciones guardadas y sincronizadas exitosamente");
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      {/* ─── Compact Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-zinc-200/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-zinc-900 tracking-tight">Configuración del Sistema</h1>
            <Badge variant="outline" className="text-xs bg-zinc-100 text-zinc-700 font-semibold rounded-md border-zinc-200">
              Producción Activa
            </Badge>
          </div>
          <p className="text-xs text-zinc-500 mt-0.5">Preferencias del tenant, reglas de notificación y seguridad de accesos</p>
        </div>

        <Button 
          onClick={handleSave}
          size="sm"
          className="h-8 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold rounded-lg px-3 gap-1.5 shadow-xs"
        >
          <Save className="w-3.5 h-3.5" />
          <span>Guardar Cambios</span>
        </Button>
      </div>

      {/* ─── Compact Form Sections ─── */}
      <div className="bg-white border border-zinc-200 rounded-xl divide-y divide-zinc-100 shadow-xs text-xs">
        {/* Section 1: Empresa */}
        <div className="p-4 space-y-3">
          <div>
            <h2 className="text-xs font-bold text-zinc-900 uppercase tracking-wide">Perfil de la Organización</h2>
            <p className="text-[11px] text-zinc-400">Información fiscal y regional del tenant principal.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-zinc-700">Razón Social</Label>
              <Input 
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="h-8 text-xs bg-zinc-50 border-zinc-200"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-zinc-700">NIT / Identificación Fiscal</Label>
              <Input 
                value={taxId}
                onChange={(e) => setTaxId(e.target.value)}
                className="h-8 text-xs bg-zinc-50 border-zinc-200 font-mono"
              />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <Label className="text-xs font-semibold text-zinc-700">Ciudad y Sede</Label>
              <Input 
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="h-8 text-xs bg-zinc-50 border-zinc-200"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Notificaciones */}
        <div className="p-4 space-y-3">
          <div>
            <h2 className="text-xs font-bold text-zinc-900 uppercase tracking-wide">Notificaciones & Alertas</h2>
            <p className="text-[11px] text-zinc-400">Canales para recibir avisos de nuevos leads y contratos.</p>
          </div>

          <div className="space-y-2.5 pt-1">
            <div className="flex items-center justify-between p-2.5 bg-zinc-50 rounded-lg border border-zinc-200/60">
              <div>
                <span className="font-semibold text-zinc-800">Alertas Inmediatas por WhatsApp</span>
                <p className="text-[11px] text-zinc-500">Notificar al asesor cuando un cliente califique con alta intención.</p>
              </div>
              <Switch checked={whatsappNotifications} onCheckedChange={setWhatsappNotifications} />
            </div>

            <div className="flex items-center justify-between p-2.5 bg-zinc-50 rounded-lg border border-zinc-200/60">
              <div>
                <span className="font-semibold text-zinc-800">Resumen Diario por Correo</span>
                <p className="text-[11px] text-zinc-500">Enviar reporte de métricas y ventas a la dirección general.</p>
              </div>
              <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
            </div>
          </div>
        </div>

        {/* Section 3: Seguridad */}
        <div className="p-4 space-y-3">
          <div>
            <h2 className="text-xs font-bold text-zinc-900 uppercase tracking-wide">Seguridad & Cifrado</h2>
            <p className="text-[11px] text-zinc-400">Políticas de autenticación y protección de datos.</p>
          </div>

          <div className="space-y-2.5 pt-1">
            <div className="flex items-center justify-between p-2.5 bg-zinc-50 rounded-lg border border-zinc-200/60">
              <div>
                <span className="font-semibold text-zinc-800">Autenticación de Dos Factores (2FA)</span>
                <p className="text-[11px] text-zinc-500">Requerir confirmación biométrica o SMS al iniciar sesión.</p>
              </div>
              <Switch checked={twoFactorAuth} onCheckedChange={setTwoFactorAuth} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
