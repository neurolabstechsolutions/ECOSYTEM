"use client";

import React, { useState, useMemo, useEffect } from "react";
import { 
  MOCK_INTEGRATIONS, 
  Integration, 
  IntegrationStatus, 
  IntegrationCategory 
} from "@/lib/mocks";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Plug, 
  Sliders, 
  Search, 
  Sparkles, 
  CreditCard, 
  MessageSquare, 
  QrCode,
  Smartphone,
  CheckCircle,
  RefreshCw
} from "lucide-react";

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<Integration[]>(MOCK_INTEGRATIONS as Integration[]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<IntegrationCategory>("All");
  const [selectedStatus, setSelectedStatus] = useState<"ALL" | "CONNECTED" | "DISCONNECTED">("ALL");
  
  // Dialog States
  const [activeIntegration, setActiveIntegration] = useState<Integration | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formValues, setFormValues] = useState<Record<string, string>>({});

  // WhatsApp QR Live Bridge States (Connected to Render Microservice)
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<string>("SCAN_QR");
  const [connectedNumber, setConnectedNumber] = useState<string | null>(null);
  const [isLoadingQR, setIsLoadingQR] = useState(false);

  // Render Service Endpoint URL
  const RENDER_SERVICE_URL = "https://ecosystem.onrender.com";

  // Poll live QR and status from Render
  useEffect(() => {
    let interval: NodeJS.Timeout;

    const fetchLiveQR = async () => {
      try {
        const res = await fetch(`${RENDER_SERVICE_URL}/qr`);
        if (res.ok) {
          const data = await res.json();
          setConnectionStatus(data.status);
          if (data.qr) setQrDataUrl(data.qr);
          if (data.phone) setConnectedNumber(data.phone);
        }
      } catch (err) {
        console.log("Render service waking up...");
      }
    };

    if (isQRModalOpen) {
      setIsLoadingQR(true);
      fetchLiveQR().finally(() => setIsLoadingQR(false));
      interval = setInterval(fetchLiveQR, 3000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isQRModalOpen]);

  // Filtered Integrations
  const filteredIntegrations = useMemo(() => {
    return integrations.filter((item) => {
      const matchesSearch = 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
      const matchesStatus = selectedStatus === "ALL" || item.status === selectedStatus;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [integrations, searchQuery, selectedCategory, selectedStatus]);

  const totalIntegrations = integrations.length;
  const connectedCount = integrations.filter(i => i.status === "CONNECTED").length;

  const handleOpenConfig = (integration: Integration) => {
    setActiveIntegration(integration);
    const initialValues: Record<string, string> = {};
    integration.configFields.forEach(field => {
      initialValues[field.key] = field.value;
    });
    setFormValues(initialValues);
    setIsDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 p-8 space-y-8 pb-32">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-950 font-serif flex items-center gap-3">
            <Plug className="w-8 h-8 text-black" />
            Centro de Integraciones & Conexiones
          </h1>
          <p className="text-slate-500 mt-2 text-base">
            Conecta WhatsApp directo, bases de datos y pasarelas de cobro para operar en piloto automático.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button 
            onClick={() => setIsQRModalOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl shadow-lg hover:shadow-emerald-600/30 px-5 py-6 font-bold flex items-center gap-2.5 transition-all"
          >
            <QrCode className="w-5 h-5" />
            <span>Vincular WhatsApp Directo (QR)</span>
          </Button>
        </div>
      </div>

      {/* Hero Banner: WhatsApp Direct QR Bridge */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-white rounded-3xl p-8 border border-slate-800 shadow-2xl">
        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Microservicio en Vivo (Render Baileys Engine)
              </span>
              <Badge variant="outline" className="text-xs text-slate-300 border-slate-700">Multi-Empresa</Badge>
            </div>
            <h2 className="text-2xl lg:text-3xl font-bold font-serif">
              WhatsApp Web Direct Bridge
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              Escanea el código QR oficial generado por tu microservicio en Render. El Asesor IA responderá de inmediato todos los chats de tu empresa 24/7 sin Meta ni costos adicionales.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <Button 
              onClick={() => setIsQRModalOpen(true)}
              className="w-full sm:w-auto bg-white hover:bg-slate-100 text-slate-950 font-bold rounded-2xl px-6 py-6 shadow-md transition-all flex items-center gap-2"
            >
              <Smartphone className="w-5 h-5 text-emerald-600" />
              {connectionStatus === "CONNECTED" ? "Ver Dispositivo Vinculado" : "Escanear Código QR Real"}
            </Button>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <Input 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar integración..."
            className="pl-10 bg-white border-slate-200 rounded-xl text-sm"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Badge variant="outline" className="text-xs bg-white text-slate-700 border-slate-200 px-3 py-1">
            Total: {totalIntegrations}
          </Badge>
          <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200 px-3 py-1">
            Conectadas: {connectedCount}
          </Badge>
        </div>
      </div>

      {/* Grid of Integrations */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredIntegrations.map((item) => (
          <Card key={item.id} className="bg-white border-slate-200 shadow-sm rounded-3xl overflow-hidden hover:shadow-md transition-all flex flex-col justify-between">
            <CardHeader className="p-6 pb-4">
              <div className="flex justify-between items-start">
                <div className="p-3 bg-slate-100 rounded-2xl border border-slate-200">
                  {item.type === 'whatsapp' ? <MessageSquare className="w-6 h-6 text-emerald-600" /> : <Sparkles className="w-6 h-6 text-slate-800" />}
                </div>
                <Badge variant={item.status === 'CONNECTED' ? 'default' : 'secondary'} className={item.status === 'CONNECTED' ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-600'}>
                  {item.status === 'CONNECTED' ? 'Conectado' : 'Disponible'}
                </Badge>
              </div>

              <CardTitle className="text-lg font-bold font-serif text-slate-900 mt-4">{item.name}</CardTitle>
              <CardDescription className="text-xs text-slate-500 line-clamp-2 mt-1">{item.description}</CardDescription>
            </CardHeader>

            <CardContent className="p-6 pt-0 space-y-3">
              <div className="p-3 bg-slate-50 rounded-2xl text-xs space-y-1">
                <div className="flex justify-between text-slate-500">
                  <span>Proveedor:</span>
                  <span className="font-semibold text-slate-800">{item.provider}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Autenticación:</span>
                  <span className="font-semibold text-slate-800">{item.authType}</span>
                </div>
              </div>
            </CardContent>

            <CardFooter className="p-6 pt-0 border-t border-slate-100 flex gap-2">
              <Button 
                onClick={() => handleOpenConfig(item)}
                variant="outline" 
                className="w-full rounded-xl border-slate-200 text-xs font-semibold text-slate-700 hover:text-black"
              >
                <Sliders className="w-3.5 h-3.5 mr-1.5" /> Configurar
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* MODAL: Live WhatsApp QR Code Bridge (Render Microservice) */}
      <Dialog open={isQRModalOpen} onOpenChange={setIsQRModalOpen}>
        <DialogContent className="max-w-md bg-white border-slate-200 rounded-3xl p-6 sm:p-8">
          <DialogHeader className="text-center space-y-2">
            <div className="mx-auto w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm">
              <QrCode className="w-6 h-6" />
            </div>
            <DialogTitle className="text-xl font-bold font-serif text-slate-950">
              Vincular WhatsApp en Vivo
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Conexión directa vía Render Baileys Socket.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 flex flex-col items-center justify-center space-y-6">
            {connectionStatus !== "CONNECTED" ? (
              <div className="space-y-4 text-center w-full">
                <div className="relative p-3 bg-white border-2 border-emerald-500 rounded-3xl shadow-lg inline-block">
                  {qrDataUrl ? (
                    <img 
                      src={qrDataUrl} 
                      alt="WhatsApp Web QR Code" 
                      className="w-56 h-56 rounded-2xl mx-auto shadow-inner"
                    />
                  ) : (
                    <div className="w-56 h-56 bg-slate-100 rounded-2xl flex flex-col items-center justify-center space-y-3">
                      <RefreshCw className="w-8 h-8 animate-spin text-emerald-600" />
                      <p className="text-xs text-slate-500 font-medium">Generando QR en Render...</p>
                    </div>
                  )}
                </div>

                <div className="space-y-2 text-left bg-slate-50 p-4 rounded-2xl text-xs text-slate-600 border border-slate-200">
                  <p className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4 text-emerald-600" />
                    Pasos para Escanear:
                  </p>
                  <ol className="list-decimal pl-4 space-y-1 text-slate-500">
                    <li>Abre WhatsApp en tu teléfono celular.</li>
                    <li>Toca <strong>Menú (⋮)</strong> o <strong>Configuración ⚙️</strong>.</li>
                    <li>Selecciona <strong>Dispositivos vinculados</strong>.</li>
                    <li>Toca <strong>Vincular un dispositivo</strong> y apunta al QR.</li>
                  </ol>
                </div>
              </div>
            ) : (
              <div className="w-full space-y-5 text-center">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle className="w-8 h-8" />
                </div>

                <div className="space-y-1">
                  <h4 className="font-bold text-lg text-slate-900">¡WhatsApp Vinculado con Éxito!</h4>
                  <p className="text-xs text-slate-500">El Asesor IA está escuchando y respondiendo mensajes en vivo.</p>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl text-left text-xs space-y-2 border border-slate-200">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Número Conectado:</span>
                    <span className="font-bold text-slate-900">+{connectedNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Estado del Socket:</span>
                    <span className="text-emerald-600 font-bold flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Online 24/7
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Servicio Render:</span>
                    <span className="font-semibold text-slate-700">ecosystem.onrender.com</span>
                  </div>
                </div>

                <Button 
                  onClick={() => setIsQRModalOpen(false)} 
                  className="w-full bg-slate-950 hover:bg-black text-white rounded-2xl py-6 text-xs font-bold"
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
