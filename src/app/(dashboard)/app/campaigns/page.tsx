"use client";

import React, { useState } from "react";
import { 
  Megaphone, PhoneCall, Send, MessageSquare, Play, Pause, Plus, 
  Users, Building2, CheckCircle2, Clock, AlertTriangle, 
  FileText, ArrowUpRight, BarChart3, Filter, Download, Zap, Radio
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface OutboundCampaign {
  id: string;
  name: string;
  type: "WHATSAPP_MASIVO" | "LLAMADAS_VOZ_AI" | "OMNICANAL";
  targetIndustry: string;
  totalContacts: number;
  sentCount: number;
  answeredCount: number;
  interestedCount: number;
  conversionRate: string;
  status: "ACTIVA" | "PAUSADA" | "COMPLETADA";
  scriptSummary: string;
}

const INITIAL_CAMPAIGNS: OutboundCampaign[] = [
  {
    id: "cmp-001",
    name: "Prospección B2B: Concesionarios & Flotas Automotrices",
    type: "OMNICANAL",
    targetIndustry: "Sector Automotriz",
    totalContacts: 250,
    sentCount: 184,
    answeredCount: 142,
    interestedCount: 38,
    conversionRate: "26.7%",
    status: "ACTIVA",
    scriptSummary: "El Agente saluda al Gerente Comercial y presenta la plataforma Trinova.",
  },
  {
    id: "cmp-002",
    name: "Llamadas de Voz: Propietarios Inmobiliarios",
    type: "LLAMADAS_VOZ_AI",
    targetIndustry: "Inmobiliarias & Desarrolladores",
    totalContacts: 120,
    sentCount: 88,
    answeredCount: 64,
    interestedCount: 19,
    conversionRate: "29.6%",
    status: "ACTIVA",
    scriptSummary: "Llamada automatizada por voz natural ofreciendo software y agente 24/7.",
  },
  {
    id: "cmp-003",
    name: "WhatsApp Masivo: Oferta SaaS para PYMES",
    type: "WHATSAPP_MASIVO",
    targetIndustry: "Empresas de Servicios & Comercio",
    totalContacts: 500,
    sentCount: 500,
    answeredCount: 340,
    interestedCount: 85,
    conversionRate: "25.0%",
    status: "COMPLETADA",
    scriptSummary: "Envío consultivo con cotización en PDF y agenda de llamada.",
  }
];

export default function OutboundCampaignsPage() {
  const [campaigns, setCampaigns] = useState<OutboundCampaign[]>(INITIAL_CAMPAIGNS);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [campaignName, setCampaignName] = useState("");
  const [campaignType, setCampaignType] = useState<"WHATSAPP_MASIVO" | "LLAMADAS_VOZ_AI" | "OMNICANAL">("OMNICANAL");
  const [targetIndustry, setTargetIndustry] = useState("Empresas de Tecnología & PYMES");
  const [promptScript, setPromptScript] = useState("");

  const handleLaunchCampaign = () => {
    if (!campaignName.trim()) {
      toast.error("Por favor ingresa un nombre para la campaña");
      return;
    }

    const newCamp: OutboundCampaign = {
      id: `cmp-00${campaigns.length + 1}`,
      name: campaignName,
      type: campaignType,
      targetIndustry: targetIndustry,
      totalContacts: 150,
      sentCount: 1,
      answeredCount: 1,
      interestedCount: 1,
      conversionRate: "100%",
      status: "ACTIVA",
      scriptSummary: promptScript || "Prospección autónoma inteligente.",
    };

    setCampaigns([newCamp, ...campaigns]);
    setIsCreateModalOpen(false);
    setCampaignName("");
    setPromptScript("");
    toast.success("Campaña de prospección lanzada con éxito");
  };

  const toggleStatus = (id: string) => {
    setCampaigns(campaigns.map(c => {
      if (c.id === id) {
        const nextStatus = c.status === "ACTIVA" ? "PAUSADA" : "ACTIVA";
        return { ...c, status: nextStatus };
      }
      return c;
    }));
    toast.success("Estado de campaña actualizado");
  };

  return (
    <div className="space-y-4">
      {/* ─── Compact Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-zinc-200/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-zinc-900 tracking-tight">Campañas & Outbound</h1>
            <Badge variant="outline" className="text-xs bg-zinc-100 text-zinc-700 font-semibold rounded-md border-zinc-200">
              {campaigns.length} Campañas
            </Badge>
          </div>
          <p className="text-xs text-zinc-500 mt-0.5">Automatización de mensajes, llamadas y prospección B2B</p>
        </div>

        <Button 
          onClick={() => setIsCreateModalOpen(true)}
          size="sm"
          className="h-8 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold rounded-lg px-3 gap-1.5 shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Nueva Campaña</span>
        </Button>
      </div>

      {/* ─── Compact Table View ─── */}
      <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-semibold">
              <tr>
                <th className="py-2.5 px-3">Campaña</th>
                <th className="py-2.5 px-3">Canal</th>
                <th className="py-2.5 px-3">Audiencia</th>
                <th className="py-2.5 px-3">Enviados / Respondidos</th>
                <th className="py-2.5 px-3">Conversión</th>
                <th className="py-2.5 px-3">Estado</th>
                <th className="py-2.5 px-3 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {campaigns.map(camp => (
                <tr key={camp.id} className="hover:bg-zinc-50/80 transition-colors">
                  <td className="py-2.5 px-3">
                    <div className="font-semibold text-zinc-900">{camp.name}</div>
                    <div className="text-[11px] text-zinc-500 line-clamp-1">{camp.scriptSummary}</div>
                  </td>
                  <td className="py-2.5 px-3">
                    <Badge variant="outline" className="text-[10px] font-medium bg-zinc-100 text-zinc-700 border-zinc-200">
                      {camp.type.replace(/_/g, ' ')}
                    </Badge>
                  </td>
                  <td className="py-2.5 px-3 text-zinc-600 text-[11px]">
                    {camp.targetIndustry}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-[11px] text-zinc-700">
                    <span className="font-bold text-zinc-900">{camp.sentCount}</span> / {camp.totalContacts} ({camp.answeredCount} respuestas)
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="text-[10px] font-bold font-mono px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {camp.conversionRate}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      camp.status === 'ACTIVA' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                      camp.status === 'COMPLETADA' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                      'bg-zinc-100 text-zinc-600'
                    }`}>
                      {camp.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <Button 
                      onClick={() => toggleStatus(camp.id)}
                      variant="outline" 
                      size="sm" 
                      className="h-7 text-[11px] border-zinc-200 px-2"
                    >
                      {camp.status === 'ACTIVA' ? 'Pausar' : 'Reanudar'}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── Modal: Crear Campaña ─── */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-zinc-900">
              Crear Campaña Outbound
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-500">
              Configura los parámetros para prospección automatizada.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 pt-2 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-zinc-700">Nombre de la Campaña *</label>
              <Input 
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
                placeholder="Ej. Prospección Concesionarios Barranquilla"
                className="h-9 text-xs"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="font-semibold text-zinc-700">Canal</label>
                <select 
                  value={campaignType}
                  onChange={(e) => setCampaignType(e.target.value as any)}
                  className="w-full h-9 rounded-lg border border-zinc-200 px-2 text-xs bg-white text-zinc-800 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                >
                  <option value="OMNICANAL">Omnicanal (WhatsApp + Voz)</option>
                  <option value="WHATSAPP_MASIVO">WhatsApp Masivo</option>
                  <option value="LLAMADAS_VOZ_AI">Llamadas de Voz</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-zinc-700">Sector Objetivo</label>
                <Input 
                  value={targetIndustry}
                  onChange={(e) => setTargetIndustry(e.target.value)}
                  placeholder="Sector Automotriz"
                  className="h-9 text-xs"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-zinc-700">Instrucciones del Script</label>
              <Textarea 
                value={promptScript}
                onChange={(e) => setPromptScript(e.target.value)}
                placeholder="Mensaje o guion de prospección..."
                className="text-xs min-h-[70px]"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsCreateModalOpen(false)} className="h-8 text-xs">
                Cancelar
              </Button>
              <Button onClick={handleLaunchCampaign} size="sm" className="h-8 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold">
                Lanzar Campaña
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
