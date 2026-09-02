"use client";

import React, { useState, useEffect } from "react";
import { 
  QrCode, MessageSquare, Smartphone, CheckCircle, 
  RefreshCw, Radio, X, Unplug, ShieldCheck
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export function WhatsAppQRButton({ 
  variant = "header", 
  label = "WhatsApp QR" 
}: { 
  variant?: "header" | "banner" | "button"; 
  label?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<"SCAN_QR" | "CONNECTED" | "LOADING">("LOADING");
  const [connectedNumber, setConnectedNumber] = useState<string | null>(null);
  const [isLoadingQR, setIsLoadingQR] = useState(false);

  const RENDER_SERVICE_URL = "https://ecosytem.onrender.com";

  const checkStatusAndQR = async () => {
    try {
      // 1. Direct Render status check
      const statusRes = await fetch(`${RENDER_SERVICE_URL}/status`, { cache: 'no-store' });
      if (statusRes.ok) {
        const statusData = await statusRes.json();
        if (statusData.connected) {
          setConnectionStatus("CONNECTED");
          setConnectedNumber(statusData.number || "573235845145");
          return;
        }
      }

      // 2. Fetch QR if open
      if (isOpen) {
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
      // Fallback to internal API route
      try {
        const proxyRes = await fetch('/api/whatsapp/qr', { cache: 'no-store' });
        if (proxyRes.ok) {
          const proxyData = await proxyRes.json();
          if (proxyData.phone) {
            setConnectedNumber(proxyData.phone);
            setConnectionStatus("CONNECTED");
          } else if (proxyData.qr) {
            setQrDataUrl(proxyData.qr.startsWith('data:') ? proxyData.qr : `data:image/png;base64,${proxyData.qr}`);
            setConnectionStatus("SCAN_QR");
          }
        }
      } catch (e) {}
    } finally {
      setIsLoadingQR(false);
    }
  };

  useEffect(() => {
    checkStatusAndQR();
    const interval = setInterval(checkStatusAndQR, 6000);
    return () => clearInterval(interval);
  }, [isOpen]);

  const handleDisconnect = async () => {
    if (!window.confirm("¿Deseas desvincular la línea actual de WhatsApp de Render?")) return;
    try {
      await fetch(`${RENDER_SERVICE_URL}/disconnect`, { method: "POST" });
      setConnectionStatus("SCAN_QR");
      setConnectedNumber(null);
      setQrDataUrl(null);
      toast.success("WhatsApp desvinculado. Puedes escanear un nuevo código.");
      checkStatusAndQR();
    } catch (e) {
      toast.error("Error al desvincular");
    }
  };

  return (
    <>
      {variant === "header" && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all border ${
            connectionStatus === "CONNECTED"
              ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
              : "bg-zinc-900 text-white border-zinc-900 hover:bg-zinc-800 shadow-xs"
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">
            {connectionStatus === "CONNECTED" ? `WhatsApp Conectado (+${connectedNumber || 'Trinova'})` : "Vincular WhatsApp (QR)"}
          </span>
          <span className="sm:hidden">
            {connectionStatus === "CONNECTED" ? "WhatsApp" : "Vincular"}
          </span>
          <span className={`w-2 h-2 rounded-full ${connectionStatus === "CONNECTED" ? "bg-emerald-500 animate-pulse" : "bg-amber-400"}`} />
        </button>
      )}

      {variant === "banner" && (
        <div className="p-3 bg-zinc-900 text-white rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white">Línea Oficial WhatsApp Trinova</span>
                <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                  connectionStatus === "CONNECTED" ? "bg-emerald-500 text-zinc-950" : "bg-amber-500 text-zinc-950"
                }`}>
                  {connectionStatus === "CONNECTED" ? "ONLINE 24/7" : "ESPERANDO ESCANEO"}
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">
                {connectionStatus === "CONNECTED"
                  ? `Conectado al número +${connectedNumber || 'Oficial Trinova'} vía Render ($7/mes Activo)`
                  : "Escanea el código QR desde el WhatsApp de la administradora para activar las respuestas automáticas."}
              </p>
            </div>
          </div>

          <Button
            onClick={() => setIsOpen(true)}
            size="sm"
            className="h-8 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs rounded-lg px-3 gap-1.5 shrink-0"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>{connectionStatus === "CONNECTED" ? "Ver Estado / QR" : "Escanear Código QR"}</span>
          </Button>
        </div>
      )}

      {variant === "button" && (
        <Button
          onClick={() => setIsOpen(true)}
          size="sm"
          className="h-8 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold rounded-lg px-3 gap-1.5 shadow-xs"
        >
          <QrCode className="w-3.5 h-3.5" />
          <span>{label}</span>
        </Button>
      )}

      {/* ─── Modal de Escaneo QR ─── */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-sm bg-white text-center">
          <DialogHeader className="space-y-1">
            <div className="mx-auto w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 shadow-xs">
              <QrCode className="w-5 h-5" />
            </div>
            <DialogTitle className="text-base font-bold text-zinc-900">
              Vincular WhatsApp de la Administradora
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-500">
              Servicio Render Baileys Socket (`ecosytem.onrender.com`)
            </DialogDescription>
          </DialogHeader>

          <div className="py-2 flex flex-col items-center justify-center space-y-3">
            {connectionStatus !== "CONNECTED" ? (
              <div className="space-y-3 text-center w-full">
                <div className="p-2.5 bg-white border-2 border-emerald-500 rounded-2xl shadow-sm inline-block">
                  {qrDataUrl ? (
                    <img 
                      src={qrDataUrl} 
                      alt="WhatsApp QR Code" 
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
                    Pasos para que la administradora escanee:
                  </p>
                  <ol className="list-decimal pl-4 space-y-0.5 text-zinc-500">
                    <li>Abre WhatsApp en tu teléfono celular.</li>
                    <li>Toca <strong>Menú (⋮)</strong> o <strong>Configuración ⚙️</strong>.</li>
                    <li>Selecciona <strong>Dispositivos vinculados</strong>.</li>
                    <li>Toca <strong>Vincular un dispositivo</strong> y apunta la cámara a este código.</li>
                  </ol>
                </div>

                <div className="flex justify-center gap-2 pt-1">
                  <Button 
                    onClick={checkStatusAndQR}
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs border-zinc-200 gap-1"
                  >
                    <RefreshCw className="h-3 w-3" />
                    <span>Actualizar QR</span>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="w-full space-y-3 text-center">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-xs">
                  <CheckCircle className="w-6 h-6" />
                </div>

                <div className="space-y-0.5">
                  <h4 className="font-bold text-sm text-zinc-900">¡WhatsApp Vinculado con Éxito!</h4>
                  <p className="text-xs text-zinc-500">El Agente IA de Trinova está listo y respondiendo clientes.</p>
                </div>

                <div className="bg-zinc-50 p-3 rounded-xl text-left text-xs space-y-1.5 border border-zinc-200 font-mono text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Número Conectado:</span>
                    <span className="font-bold text-zinc-900">+{connectedNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Estado del Socket:</span>
                    <span className="text-emerald-600 font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Online 24/7 (Render)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Servicio Render:</span>
                    <span className="font-semibold text-zinc-700">ecosytem.onrender.com</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button 
                    onClick={handleDisconnect}
                    variant="outline"
                    size="sm"
                    className="flex-1 h-8 border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold gap-1"
                  >
                    <Unplug className="h-3 w-3" />
                    <span>Desvincular</span>
                  </Button>
                  <Button 
                    onClick={() => setIsOpen(false)} 
                    size="sm"
                    className="flex-1 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg h-8 text-xs font-semibold"
                  >
                    Cerrar
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
