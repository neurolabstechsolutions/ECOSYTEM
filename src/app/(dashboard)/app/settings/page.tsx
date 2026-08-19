"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Building2, Bell, Shield, Paintbrush, Save } from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
  const handleSave = () => {
    toast.success("Configuraciones guardadas correctamente.");
  };

  return (
    <div className="min-h-screen bg-white text-slate-800 p-6 pb-32 space-y-8 font-sans">
      <div>
        <h1 className="text-4xl font-black tracking-tight text-black font-serif flex items-center gap-3">
          <Settings className="h-8 w-8 text-blue-500" />
          Configuración
        </h1>
        <p className="text-sm text-slate-400 mt-2">
          Administra las preferencias de tu espacio de trabajo (Tenant), notificaciones y seguridad.
        </p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="bg-slate-50 border border-slate-200 p-1">
          <TabsTrigger value="general" className="data-[state=active]:bg-black text-white data-[state=active]:text-slate-900">
            <Building2 className="w-4 h-4 mr-2" />
            General
          </TabsTrigger>
          <TabsTrigger value="branding" className="data-[state=active]:bg-black text-white data-[state=active]:text-slate-900">
            <Paintbrush className="w-4 h-4 mr-2" />
            Branding
          </TabsTrigger>
          <TabsTrigger value="notifications" className="data-[state=active]:bg-black text-white data-[state=active]:text-slate-900">
            <Bell className="w-4 h-4 mr-2" />
            Notificaciones
          </TabsTrigger>
          <TabsTrigger value="security" className="data-[state=active]:bg-black text-white data-[state=active]:text-slate-900">
            <Shield className="w-4 h-4 mr-2" />
            Seguridad
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6 outline-none">
          <Card className="bg-white  border-slate-200">
            <CardHeader>
              <CardTitle className="text-slate-900">Perfil de la Empresa (Tenant)</CardTitle>
              <CardDescription className="text-slate-400">
                Información pública y configuración regional.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="companyName" className="text-slate-300">Nombre de la Empresa</Label>
                <Input id="companyName" defaultValue="Piloto Automotriz" className="bg-slate-50 border-slate-700 text-slate-900" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="industry" className="text-slate-300">Industria</Label>
                <Input id="industry" defaultValue="Automotriz" className="bg-slate-50 border-slate-700 text-slate-900" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="timezone" className="text-slate-300">Zona Horaria</Label>
                  <Input id="timezone" defaultValue="America/Mexico_City" className="bg-slate-50 border-slate-700 text-slate-900" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="currency" className="text-slate-300">Moneda por Defecto</Label>
                  <Input id="currency" defaultValue="MXN (Pesos Mexicanos)" className="bg-slate-50 border-slate-700 text-slate-900" />
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t border-slate-200 pt-6">
              <Button onClick={handleSave} className="bg-black text-white hover:bg-blue-700 text-slate-900">
                <Save className="w-4 h-4 mr-2" /> Guardar Cambios
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="branding" className="space-y-6 outline-none">
          <Card className="bg-white  border-slate-200">
            <CardHeader>
              <CardTitle className="text-slate-900">Personalización (White Label)</CardTitle>
              <CardDescription className="text-slate-400">
                Ajusta los colores y el logotipo para el portal de clientes y correos.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-2">
                <Label className="text-slate-300">Color Principal (Hex)</Label>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-md bg-black text-white border border-slate-700"></div>
                  <Input defaultValue="#2563EB" className="bg-slate-50 border-slate-700 text-slate-900 w-48" />
                </div>
              </div>
              <div className="grid gap-2">
                <Label className="text-slate-300">Logotipo de la Empresa</Label>
                <div className="border-2 border-dashed border-slate-700 rounded-lg p-8 flex flex-col items-center justify-center text-slate-500 bg-slate-50 hover:bg-slate-50 transition-colors cursor-pointer">
                  <Paintbrush className="w-8 h-8 mb-2 opacity-50" />
                  <p className="text-sm">Haz clic para subir un logotipo (PNG, JPG)</p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t border-slate-200 pt-6">
              <Button onClick={handleSave} className="bg-black text-white hover:bg-blue-700 text-slate-900">
                <Save className="w-4 h-4 mr-2" /> Guardar Branding
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6 outline-none">
          <Card className="bg-white  border-slate-200">
            <CardHeader>
              <CardTitle className="text-slate-900">Preferencias de Alertas</CardTitle>
              <CardDescription className="text-slate-400">
                Controla qué notificaciones recibes de la IA y el sistema.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base text-slate-900">Alertas de Leads Calientes</Label>
                  <p className="text-sm text-slate-400">Recibir notificación cuando la IA identifique un lead con intención de compra alta.</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base text-slate-900">Transferencias a Humano</Label>
                  <p className="text-sm text-slate-400">Notificar por email cuando un bot de WhatsApp no pueda resolver una duda.</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base text-slate-900">Resumen Semanal</Label>
                  <p className="text-sm text-slate-400">Envío de reporte en PDF con métricas de ventas y consumo de tokens.</p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6 outline-none">
          <Card className="bg-white  border-slate-200">
            <CardHeader>
              <CardTitle className="text-slate-900">Seguridad y Acceso</CardTitle>
              <CardDescription className="text-slate-400">
                Configura las políticas de acceso para tu Tenant.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base text-slate-900">Autenticación en 2 Pasos (2FA)</Label>
                  <p className="text-sm text-slate-400">Requerir código temporal en cada inicio de sesión de los administradores.</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="grid gap-2 pt-4 border-t border-slate-200">
                <Label className="text-slate-300">Cambiar Contraseña</Label>
                <div className="flex gap-4 max-w-sm">
                  <Input type="password" placeholder="Nueva contraseña" className="bg-slate-50 border-slate-700 text-slate-900" />
                  <Button variant="outline" className="border-slate-700 text-slate-900 hover:bg-white">Actualizar</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}


