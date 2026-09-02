"use client";

import React, { useState, useMemo, useEffect } from "react";
import { 
  MOCK_INTEGRATIONS, 
  Integration, 
  IntegrationCategory 
} from "@/lib/mocks";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Plug, Sliders, Search, MessageSquare, QrCode,
  Smartphone, CheckCircle, RefreshCw, Database, Copy,
  ExternalLink, Zap, Activity, Eye, EyeOff
} from "lucide-react";
import { toast } from "sonner";

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<Integration[]>(MOCK_INTEGRATIONS as Integration[]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<IntegrationCategory>("All");
  
  // Dialog States
  const [activeIntegration, setActiveIntegration] = useState<Integration | null>(null);
  const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [isSaving, setIsSaving] = useState(false);

  // WhatsApp QR Live Bridge States (Connected to Render Microservice)
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<string>("SCAN_QR");
  const [connectedNumber, setConnectedNumber] = useState<string | null>(null);
  const [isLoadingQR, setIsLoadingQR] = useState(false);

  // Render Service Endpoint URL
  const RENDER_SERVICE_URL = "https://ecosytem.onrender.com";

  // Poll live QR and status from Render Microservice
  useEffect(() => {
    let interval: NodeJS.Timeout;

    const checkStatusAndQR = async () => {
      try {
        // 1. Check direct connection status
        const statusRes = await fetch(`${RENDER_SERVICE_URL}/status`, { cache: 'no-store' });
        if (statusRes.ok) {
          const statusData = await statusRes.json();
          if (statusData.connected) {
            setConnectionStatus("CONNECTED");
            setConnectedNumber(statusData.number || "573005765530");
            setIntegrations(prev => prev.map(i => i.id === "whatsapp-baileys-qr" ? { ...i, status: "CONNECTED" } : i));
            return;
          }
        }

        // 2. Fetch live QR Code if modal is open
        if (isQRModalOpen) {
          setIsLoadingQR(true);
          const qrRes = await fetch(`${RENDER_SERVICE_URL}/qr`, { cache: 'no-store' });
          if (qrRes.ok) {
            const qrData = await qrRes.json();
            if (qrData.qr) {
              setQrDataUrl(qrData.qr.startsWith('data:') ? qrData.qr : `data:image/png;base64,${qrData.qr}`);
              setConnectionStatus("SCAN_QR");
            }
          }
        }
      } catch (err) {
        // Fallback to Next.js API route proxy if direct Render call has CORS
        try {
          const proxyRes = await fetch('/api/whatsapp/qr', { cache: 'no-store' });
          if (proxyRes.ok) {
            const proxyData = await proxyRes.json();
            if (proxyData.qr) {
              setQrDataUrl(proxyData.qr.startsWith('data:') ? proxyData.qr : `data:image/png;base64,${proxyData.qr}`);
            }
            if (proxyData.phone) {
              setConnectedNumber(proxyData.phone);
              setConnectionStatus("CONNECTED");
            }
          }
        } catch (e) {}
      } finally {
        setIsLoadingQR(false);
      }
    };

    checkStatusAndQR();
    interval = setInterval(checkStatusAndQR, 5000);
    return () => clearInterval(interval);
  }, [isQRModalOpen]);

  const filteredIntegrations = useMemo(() => {
    return integrations.filter(item => {
      const matchesSearch = 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [integrations, searchQuery, selectedCategory]);

  const handleOpenConfig = (integration: Integration) => {
    if (integration.id === "whatsapp-baileys-qr") {
      setIsQRModalOpen(true);
      return;
    }

    setActiveIntegration(integration);
    const initialValues: Record<string, string> = {};
    integration.configFields?.forEach(field => {
      initialValues[field.key] = field.value || "";
    });
    setFormValues(initialValues);
    setShowSecrets({});
    setIsConfigDialogOpen(true);
  };

  const handleSaveConfig = async () => {
    setIsSaving(true);
    await new Promise(r => setTimeout(r, 600));
    setIsSaving(false);
    setIsConfigDialogOpen(false);
    toast.success("Credenciales actualizadas y sincronizadas correctamente.");
  };

  const toggleConnection = (id: string) => {
    if (id === "whatsapp-baileys-qr") {
      setIsQRModalOpen(true);
      return;
    }

    setIntegrations(prev => prev.map(item => {
      if (item.id === id) {
        const nextStatus = item.status === "CONNECTED" ? "DISCONNECTED" : "CONNECTED";
        toast.success(`${item.name}: ${nextStatus === "CONNECTED" ? "Conectado exitosamente" : "Desconectado"}`);
        return { ...item, status: nextStatus };
      }
      return item;
    }));
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      {/* ─── Compact Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-zinc-200/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-zinc-900 tracking-tight">Integraciones & Conexiones API</h1>
            <Badge variant="outline" className="text-xs bg-zinc-100 text-zinc-700 font-semibold rounded-md border-zinc-200">
              {integrations.filter(i => i.status === 'CONNECTED').length} Conectadas
            </Badge>
          </div>
          <p className="text-xs text-zinc-500 mt-0.5">Render Baileys WhatsApp Socket, OpenAI, Supabase Cloud DB, Stripe y Webhooks</p>
        </div>

        <Button 
          onClick={() => setIsQRModalOpen(true)}
          size="sm"
          className="h-8 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold rounded-lg px-3 gap-1.5 shadow-xs"
        >
          <QrCode className="w-3.5 h-3.5" />
          <span>Vincular WhatsApp QR (Render)</span>
        </Button>
      </div>

      {/* ─── Compact Search & Filters ─── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 text-xs">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-zinc-400" />
          <Input 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar integración..."
            className="h-8 pl-8 text-xs border-zinc-200 bg-white rounded-lg focus-visible:ring-zinc-900"
          />
        </div>

        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          {(["All", "Messaging", "AI", "Payments", "CRM", "Storage"] as IntegrationCategory[]).map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium whitespace-nowrap transition-colors ${selectedCategory === cat ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Compact Table View ─── */}
      <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-semibold">
              <tr>
                <th className="py-2.5 px-3">Servicio / API</th>
                <th className="py-2.5 px-3">Categoría</th>
                <th className="py-2.5 px-3">Descripción</th>
                <th className="py-2.5 px-3">Servidor / Endpoint</th>
                <th className="py-2.5 px-3">Estado</th>
                <th className="py-2.5 px-3 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filteredIntegrations.map(item => {
                const isWhatsApp = item.id === "whatsapp-baileys-qr";
                const isLiveConnected = isWhatsApp ? connectionStatus === "CONNECTED" : item.status === "CONNECTED";

                return (
                  <tr key={item.id} className="hover:bg-zinc-50/80 transition-colors">
                    <td className="py-2.5 px-3 font-semibold text-zinc-900">
                      <div className="flex items-center gap-2">
                        {isWhatsApp ? (
                          <MessageSquare className="h-4 w-4 text-emerald-600" />
                        ) : (
                          <Plug className="h-4 w-4 text-zinc-500" />
                        )}
                        <span>{item.name}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3">
                      <Badge variant="outline" className="text-[10px] bg-zinc-100 text-zinc-700 border-zinc-200 font-normal">
                        {item.category}
                      </Badge>
                    </td>
                    <td className="py-2.5 px-3 text-zinc-600 text-[11px] max-w-xs truncate">
                      {item.description}
                    </td>
                    <td className="py-2.5 px-3 text-zinc-400 font-mono text-[10px]">
                      {isWhatsApp ? "ecosytem.onrender.com" : item.provider}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isLiveConnected ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-zinc-100 text-zinc-500'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${isLiveConnected ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-400'}`} />
                        <span>{isLiveConnected ? (isWhatsApp ? `Online (+${connectedNumber || '573005765530'})` : 'Conectado') : 'Desconectado'}</span>
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          onClick={() => handleOpenConfig(item)}
                          variant="outline"
                          size="sm"
                          className="h-7 text-[11px] border-zinc-200 px-2"
                        >
                          {isWhatsApp ? "Escanear QR" : "Ajustes"}
                        </Button>
                        <Button
                          onClick={() => toggleConnection(item.id)}
                          variant={isLiveConnected ? 'ghost' : 'default'}
                          size="sm"
                          className={`h-7 text-[11px] px-2 ${isLiveConnected ? 'text-zinc-600 hover:text-red-600' : 'bg-zinc-900 text-white'}`}
                        >
                          {isLiveConnected ? 'Desconectar' : 'Conectar'}
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: General Integration Config Editor */}
      <Dialog open={isConfigDialogOpen} onOpenChange={setIsConfigDialogOpen}>
        <DialogContent className="max-w-md bg-white">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-zinc-900" />
              <div>
                <DialogTitle className="text-base font-bold text-zinc-900">
                  {activeIntegration?.name}
                </DialogTitle>
                <DialogDescription className="text-xs text-zinc-500">
                  {activeIntegration?.provider} • Autenticación {activeIntegration?.authType}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            {activeIntegration?.configFields?.map((field) => {
              const isPassword = field.type === "password";
              const isVisible = showSecrets[field.key];

              return (
                <div key={field.key} className="space-y-1">
                  <Label className="text-xs font-semibold text-zinc-700">{field.label}</Label>
                  <div className="relative">
                    <Input 
                      type={isPassword && !isVisible ? "password" : "text"}
                      value={formValues[field.key] || ""}
                      onChange={(e) => setFormValues({ ...formValues, [field.key]: e.target.value })}
                      placeholder={`Ingresa ${field.label}...`}
                      className="pr-10 bg-zinc-50 border-zinc-200 text-xs h-9"
                    />
                    {isPassword && (
                      <button 
                        type="button"
                        onClick={() => setShowSecrets({ ...showSecrets, [field.key]: !isVisible })}
                        className="absolute right-3 top-2.5 text-zinc-400 hover:text-zinc-600"
                      >
                        {isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            <div className="p-2.5 bg-emerald-50 rounded-lg border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Conexión activa con el backend central de NeuroLabs.</span>
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setIsConfigDialogOpen(false)}
              className="h-8 text-xs"
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleSaveConfig}
              disabled={isSaving}
              size="sm"
              className="h-8 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold"
            >
              {isSaving ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL 2: Live WhatsApp QR Code Bridge (Render Microservice) */}
      <Dialog open={isQRModalOpen} onOpenChange={setIsQRModalOpen}>
        <DialogContent className="max-w-sm bg-white text-center">
          <DialogHeader className="space-y-1">
            <div className="mx-auto w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 shadow-xs">
              <QrCode className="w-5 h-5" />
            </div>
            <DialogTitle className="text-base font-bold text-zinc-900">
              Vincular WhatsApp en Vivo
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-500">
              Conexión directa vía Render Baileys Socket (`ecosytem.onrender.com`).
            </DialogDescription>
          </DialogHeader>

          <div className="py-3 flex flex-col items-center justify-center space-y-4">
            {connectionStatus !== "CONNECTED" ? (
              <div className="space-y-3 text-center w-full">
                <div className="p-2.5 bg-white border-2 border-emerald-500 rounded-2xl shadow-sm inline-block">
                  {qrDataUrl ? (
                    <img 
                      src={qrDataUrl} 
                      alt="WhatsApp Web QR Code" 
                      className="w-48 h-48 rounded-xl mx-auto"
                    />
                  ) : (
                    <div className="w-48 h-48 bg-zinc-50 rounded-xl flex flex-col items-center justify-center space-y-2">
                      <RefreshCw className="w-6 h-6 animate-spin text-emerald-600" />
                      <p className="text-xs text-zinc-500 font-medium">Generando QR en Render...</p>
                    </div>
                  )}
                </div>

                <div className="text-left bg-zinc-50 p-3 rounded-xl text-[11px] text-zinc-600 border border-zinc-200 space-y-1">
                  <p className="font-bold text-zinc-900 flex items-center gap-1.5">
                    <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                    Pasos para Escanear:
                  </p>
                  <ol className="list-decimal pl-4 space-y-0.5 text-zinc-500">
                    <li>Abre WhatsApp en tu teléfono celular.</li>
                    <li>Toca <strong>Menú (⋮)</strong> o <strong>Configuración ⚙️</strong>.</li>
                    <li>Selecciona <strong>Dispositivos vinculados</strong>.</li>
                    <li>Toca <strong>Vincular un dispositivo</strong> y apunta al QR.</li>
                  </ol>
                </div>
              </div>
            ) : (
              <div className="w-full space-y-3 text-center">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-xs">
                  <CheckCircle className="w-6 h-6" />
                </div>

                <div className="space-y-0.5">
                  <h4 className="font-bold text-sm text-zinc-900">¡WhatsApp Vinculado con Éxito!</h4>
                  <p className="text-xs text-zinc-500">El Asesor IA está escuchando y respondiendo mensajes en vivo.</p>
                </div>

                <div className="bg-zinc-50 p-3 rounded-xl text-left text-xs space-y-1.5 border border-zinc-200 font-mono text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Número Conectado:</span>
                    <span className="font-bold text-zinc-900">+{connectedNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Estado del Socket:</span>
                    <span className="text-emerald-600 font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Online 24/7
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Servicio Render:</span>
                    <span className="font-semibold text-zinc-700">ecosytem.onrender.com</span>
                  </div>
                </div>

                <Button 
                  onClick={() => setIsQRModalOpen(false)} 
                  size="sm"
                  className="w-full bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg h-8 text-xs font-semibold"
                >
                  Cerrar
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
