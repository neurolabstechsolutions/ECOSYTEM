"use client";

import React, { useState } from "react";
import { 
  Megaphone, PhoneCall, Send, MessageSquare, Play, Pause, Plus, 
  Users, Building2, Sparkles, CheckCircle2, Clock, AlertTriangle, 
  FileText, ArrowUpRight, BarChart3, Filter, Download, Zap, Radio
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
    targetIndustry: "Sector Automotriz (Cámara de Comercio)",
    totalContacts: 250,
    sentCount: 184,
    answeredCount: 142,
    interestedCount: 38,
    conversionRate: "26.7%",
    status: "ACTIVA",
    scriptSummary: "El Agente saluda al Gerente Comercial, presenta la plataforma de consignación digital Trinova y ofrece agendar demostración técnica.",
  },
  {
    id: "cmp-002",
    name: "Llamadas de Voz IA: Propietarios Inmobiliarios",
    type: "LLAMADAS_VOZ_AI",
    targetIndustry: "Inmobiliarias & Desarrolladores",
    totalContacts: 120,
    sentCount: 88,
    answeredCount: 64,
    interestedCount: 19,
    conversionRate: "29.6%",
    status: "ACTIVA",
    scriptSummary: "Llamada automatizada por voz natural ofreciendo software de gestión y agente de ventas 24/7.",
  },
  {
    id: "cmp-003",
    name: "WhatsApp Masivo: Oferta SaaS & Agentes IA para PYMES",
    type: "WHATSAPP_MASIVO",
    targetIndustry: "Empresas de Servicios & Comercio",
    totalContacts: 500,
    sentCount: 500,
    answeredCount: 340,
    interestedCount: 85,
    conversionRate: "25.0%",
    status: "COMPLETADA",
    scriptSummary: "Envío consultivo con generación instantánea de PDF oficial y agenda de llamada con NeuroLabs Tech.",
  }
];

export default function OutboundCampaignsPage() {
  const [campaigns, setCampaigns] = useState<OutboundCampaign[]>(INITIAL_CAMPAIGNS);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [campaignName, setCampaignName] = useState("");
  const [campaignType, setCampaignType] = useState<"WHATSAPP_MASIVO" | "LLAMADAS_VOZ_AI" | "OMNICANAL">("OMNICANAL");
  const [targetIndustry, setTargetIndustry] = useState("Empresas de Tecnología & PYMES");
  const [promptScript, setPromptScript] = useState("");
  const [isLaunching, setIsLaunching] = useState(false);

  const handleLaunchCampaign = async () => {
    if (!campaignName.trim()) {
      toast.error("Por favor ingresa un nombre para la campaña");
      return;
    }

    setIsLaunching(true);
    await new Promise(r => setTimeout(r, 1200));

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
      scriptSummary: promptScript || "Prospección autónoma inteligente con envío de cotización en PDF y llamadas de cierre.",
    };

    setCampaigns([newCamp, ...campaigns]);
    setIsLaunching(false);
    setIsCreateModalOpen(false);
    setCampaignName("");
    setPromptScript("");
    toast.success("🚀 ¡Campaña de Prospección y Llamadas IA lanzada con éxito!");
  };

  const toggleStatus = (id: string) => {
    setCampaigns(campaigns.map(c => {
      if (c.id === id) {
        const nextStatus = c.status === "ACTIVA" ? "PAUSADA" : "ACTIVA";
        return { ...c, status: nextStatus };
      }
      return c;
    }));
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 p-8 space-y-8 pb-32">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-950 font-serif flex items-center gap-3">
            <Megaphone className="w-8 h-8 text-black" />
            Campañas Outbound & Marketing de Prospección IA
          </h1>
          <p className="text-slate-500 mt-2 text-base">
            Tu Agente de IA prospecta empresas, escribe por WhatsApp, realiza llamadas de voz y agenda reuniones comerciales.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button 
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-slate-950 hover:bg-black text-white rounded-2xl shadow-md px-5 py-6 font-bold flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Crear Campaña Outbound</span>
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-slate-50 border-slate-200 rounded-3xl p-5">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold uppercase text-slate-500">Contactados en Frío</span>
            <div className="p-2 bg-blue-100 text-blue-700 rounded-2xl">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black text-slate-900">772 Empresas</h3>
            <p className="text-xs text-blue-600 font-bold mt-0.5">Bases RUES & Cámara</p>
          </div>
        </Card>

        <Card className="bg-slate-50 border-slate-200 rounded-3xl p-5">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold uppercase text-slate-500">Llamadas de Voz Realizadas</span>
            <div className="p-2 bg-purple-100 text-purple-700 rounded-2xl">
              <PhoneCall className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black text-slate-900">208 Llamadas</h3>
            <p className="text-xs text-purple-600 font-bold mt-0.5">Voz Neural Llama 120B</p>
          </div>
        </Card>

        <Card className="bg-slate-50 border-slate-200 rounded-3xl p-5">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold uppercase text-slate-500">Respuestas & Citas</span>
            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-2xl">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black text-slate-900">142 Prospectos</h3>
            <p className="text-xs text-emerald-600 font-bold mt-0.5">26.8% Tasa de Interés</p>
          </div>
        </Card>

        <Card className="bg-slate-50 border-slate-200 rounded-3xl p-5">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold uppercase text-slate-500">PDFs Enviados</span>
            <div className="p-2 bg-slate-200 text-slate-800 rounded-2xl">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black text-slate-900">89 Cotizaciones</h3>
            <p className="text-xs text-slate-600 font-bold mt-0.5">Generadas al Vuelo</p>
          </div>
        </Card>
      </div>

      {/* Campaigns Grid */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold font-serif text-slate-900">Campañas Activas de Prospección</h3>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((camp) => (
            <Card key={camp.id} className="bg-white border-slate-200 shadow-sm rounded-3xl overflow-hidden hover:shadow-md transition-all flex flex-col justify-between p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <Badge variant="outline" className={`text-xs font-bold ${
                    camp.type === 'OMNICANAL' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                    camp.type === 'LLAMADAS_VOZ_AI' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                    'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}>
                    {camp.type === 'OMNICANAL' ? 'Omnicanal (Voz + WhatsApp)' :
                     camp.type === 'LLAMADAS_VOZ_AI' ? 'Llamadas de Voz IA' : 'WhatsApp Masivo'}
                  </Badge>

                  <Badge className={`text-[10px] ${
                    camp.status === 'ACTIVA' ? 'bg-emerald-500 text-white' :
                    camp.status === 'PAUSADA' ? 'bg-amber-500 text-white' : 'bg-slate-300 text-slate-800'
                  }`}>
                    {camp.status}
                  </Badge>
                </div>

                <div>
                  <h4 className="font-bold text-base text-slate-900 font-serif">{camp.name}</h4>
                  <p className="text-xs text-slate-500 mt-1">{camp.targetIndustry}</p>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-2xl text-xs space-y-2 border border-slate-100">
                  <div className="flex justify-between text-slate-600">
                    <span>Contactos Objetivo:</span>
                    <span className="font-bold text-slate-900">{camp.totalContacts}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Enviados / Marcados:</span>
                    <span className="font-bold text-slate-900">{camp.sentCount}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Interesados Reales:</span>
                    <span className="font-bold text-emerald-600">{camp.interestedCount} ({camp.conversionRate})</span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 italic bg-slate-50/50 p-2.5 rounded-xl border border-slate-100">
                  "{camp.scriptSummary}"
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex gap-2">
                <Button 
                  onClick={() => toggleStatus(camp.id)}
                  variant="outline" 
                  size="sm" 
                  className="w-full rounded-xl text-xs font-bold border-slate-200 text-slate-700"
                >
                  {camp.status === 'ACTIVA' ? (
                    <>
                      <Pause className="w-3.5 h-3.5 mr-1 text-amber-600" /> Pausar
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 mr-1 text-emerald-600" /> Reanudar
                    </>
                  )}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* CREATE CAMPAIGN MODAL */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-lg bg-white border-slate-200 rounded-3xl p-6 sm:p-8">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2.5 bg-slate-100 rounded-2xl text-slate-900">
                <Megaphone className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold font-serif text-slate-950">
                  Nueva Campaña de Marketing Outbound
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500">
                  Configura el guion de tu Agente IA para captar clientes en frío.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4 py-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">Nombre de la Campaña</label>
              <Input 
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
                placeholder="Ej: Captación de Concesionarios y Clientes PYME"
                className="bg-slate-50 border-slate-200 rounded-xl py-5 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">Canal de Prospección</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setCampaignType("OMNICANAL")}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    campaignType === "OMNICANAL" ? "bg-slate-900 text-white border-slate-900 font-bold" : "bg-slate-50 text-slate-600 border-slate-200"
                  }`}
                >
                  Omnicanal (Ambos)
                </button>
                <button
                  type="button"
                  onClick={() => setCampaignType("WHATSAPP_MASIVO")}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    campaignType === "WHATSAPP_MASIVO" ? "bg-slate-900 text-white border-slate-900 font-bold" : "bg-slate-50 text-slate-600 border-slate-200"
                  }`}
                >
                  WhatsApp Masivo
                </button>
                <button
                  type="button"
                  onClick={() => setCampaignType("LLAMADAS_VOZ_AI")}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    campaignType === "LLAMADAS_VOZ_AI" ? "bg-slate-900 text-white border-slate-900 font-bold" : "bg-slate-50 text-slate-600 border-slate-200"
                  }`}
                >
                  Llamadas de Voz IA
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">Sector Objetivo / Base de Datos</label>
              <Input 
                value={targetIndustry}
                onChange={(e) => setTargetIndustry(e.target.value)}
                placeholder="Ej: Directorio Cámara de Comercio / Automotriz / Inmobiliario"
                className="bg-slate-50 border-slate-200 rounded-xl py-5 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">Guion y Objetivo del Asesor IA</label>
              <Textarea 
                value={promptScript}
                onChange={(e) => setPromptScript(e.target.value)}
                placeholder="Instrucciones: Saludar cordialmente al representante, explicar la propuesta de valor de NeuroLabs, ofrecer envío de cotización en PDF y solicitar agendamiento de videollamada comercial..."
                className="bg-slate-50 border-slate-200 rounded-xl text-xs h-24"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)} className="rounded-xl text-xs font-semibold">
              Cancelar
            </Button>
            <Button 
              onClick={handleLaunchCampaign}
              disabled={isLaunching}
              className="bg-slate-950 hover:bg-black text-white rounded-xl text-xs font-bold px-5"
            >
              {isLaunching ? "Lanzando Agentes..." : "Lanzar Campaña Ahora"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
