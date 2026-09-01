"use client";

import React, { useState, useMemo } from "react";
import { 
  MOCK_INTEGRATIONS, 
  Integration, 
  IntegrationCategory 
} from "@/lib/mocks";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  CheckCircle, RefreshCw, Database, Copy, ExternalLink, Zap
} from "lucide-react";
import { toast } from "sonner";

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<Integration[]>(MOCK_INTEGRATIONS as Integration[]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<IntegrationCategory>("All");
  
  const [activeIntegration, setActiveIntegration] = useState<Integration | null>(null);
  const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);

  const filteredIntegrations = useMemo(() => {
    return integrations.filter(item => {
      const matchesSearch = 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [integrations, searchQuery, selectedCategory]);

  const toggleConnection = (id: string) => {
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
          <p className="text-xs text-zinc-500 mt-0.5">Meta WhatsApp Cloud, OpenAI, Supabase DB, Stripe y Webhooks</p>
        </div>

        <Button 
          onClick={() => setIsQRModalOpen(true)}
          size="sm"
          className="h-8 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold rounded-lg px-3 gap-1.5 shadow-xs"
        >
          <QrCode className="w-3.5 h-3.5" />
          <span>Vincular WhatsApp QR</span>
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
                <th className="py-2.5 px-3">Última Sincronización</th>
                <th className="py-2.5 px-3">Estado</th>
                <th className="py-2.5 px-3 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filteredIntegrations.map(item => (
                <tr key={item.id} className="hover:bg-zinc-50/80 transition-colors">
                  <td className="py-2.5 px-3 font-semibold text-zinc-900">
                    <div className="flex items-center gap-2">
                      <Plug className="h-4 w-4 text-zinc-500" />
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
                    {item.lastSync ? new Date(item.lastSync).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      item.status === 'CONNECTED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-zinc-100 text-zinc-500'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${item.status === 'CONNECTED' ? 'bg-emerald-500' : 'bg-zinc-400'}`} />
                      <span>{item.status}</span>
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        onClick={() => {
                          setActiveIntegration(item);
                          setIsConfigDialogOpen(true);
                        }}
                        variant="outline"
                        size="sm"
                        className="h-7 text-[11px] border-zinc-200 px-2"
                      >
                        Ajustes
                      </Button>
                      <Button
                        onClick={() => toggleConnection(item.id)}
                        variant={item.status === 'CONNECTED' ? 'ghost' : 'default'}
                        size="sm"
                        className={`h-7 text-[11px] px-2 ${item.status === 'CONNECTED' ? 'text-zinc-600 hover:text-red-600' : 'bg-zinc-900 text-white'}`}
                      >
                        {item.status === 'CONNECTED' ? 'Desconectar' : 'Conectar'}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── Modal: Configuración de Integración ─── */}
      <Dialog open={isConfigDialogOpen} onOpenChange={setIsConfigDialogOpen}>
        <DialogContent className="max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-zinc-900">
              Configurar {activeIntegration?.name}
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-500">
              Ingresa tus credenciales o variables de entorno para activar la sincronización.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 pt-2 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-zinc-700">API Key / Token</label>
              <Input 
                type="password"
                defaultValue="••••••••••••••••••••••••"
                className="h-9 text-xs font-mono"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-zinc-700">Webhook URL</label>
              <Input 
                readOnly
                value={`https://yjdtrinova.neurolabs.com.co/api/webhooks/${activeIntegration?.id || 'whatsapp'}`}
                className="h-9 text-xs font-mono bg-zinc-50 text-zinc-600"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsConfigDialogOpen(false)} className="h-8 text-xs">
                Cancelar
              </Button>
              <Button 
                onClick={() => {
                  toast.success("Credenciales guardadas y validadas con éxito");
                  setIsConfigDialogOpen(false);
                }} 
                size="sm" 
                className="h-8 bg-zinc-900 text-white text-xs font-semibold"
              >
                Guardar Conexión
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* ─── Modal: WhatsApp QR ─── */}
      <Dialog open={isQRModalOpen} onOpenChange={setIsQRModalOpen}>
        <DialogContent className="max-w-sm bg-white text-center">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-zinc-900">
              Vincular WhatsApp Oficial
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-500">
              Escanea desde WhatsApp &gt; Dispositivos Vinculados
            </DialogDescription>
          </DialogHeader>

          <div className="py-6 flex flex-col items-center justify-center space-y-3">
            <div className="p-3 bg-zinc-100 rounded-xl border border-zinc-200">
              <QrCode className="w-36 h-36 text-zinc-800" />
            </div>
            <p className="text-xs text-zinc-600 font-medium">Línea: +57 300 5765530</p>
          </div>

          <DialogFooter>
            <Button onClick={() => setIsQRModalOpen(false)} size="sm" className="w-full h-8 bg-zinc-900 text-white text-xs font-semibold">
              Listo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
