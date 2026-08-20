"use client";

import React, { useState, useEffect } from "react";
import { 
  Building2, Users, Shield, Plus, CheckCircle2, Zap, Sparkles, 
  Search, Filter, Globe, Database, ArrowRight, DollarSign, 
  BarChart3, Settings2, Edit3, Trash2, Phone, Mail, Award, Check
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

interface ClientTenant {
  id: string;
  companyName: string;
  industry: "INMOBILIARIA" | "CONCESIONARIO" | "SALUD_CLINICA" | "ECOMMERCE" | "SERVICIOS_B2B";
  contactPerson: string;
  phone: string;
  email: string;
  city: string;
  planTier: "STARTER_PYME" | "BUSINESS_GROWTH" | "IMPERIO_ENTERPRISE";
  monthlyFeeCop: string;
  whatsappStatus: "ONLINE_24_7" | "CONFIGURANDO" | "PAUSADO";
  totalConversations: number;
  pdfQuotesGenerated: number;
  features: string[];
}

const INITIAL_CLIENTS: ClientTenant[] = [
  {
    id: "cl-1",
    companyName: "Inmobiliaria & Constructora del Norte",
    industry: "INMOBILIARIA",
    contactPerson: "Carlos Mendoza (Gerente Comercial)",
    phone: "+57 310 4567890",
    email: "ventas@inmometropolitana.com",
    city: "Barranquilla",
    planTier: "BUSINESS_GROWTH",
    monthlyFeeCop: "$1.290.000 COP / mes",
    whatsappStatus: "ONLINE_24_7",
    totalConversations: 840,
    pdfQuotesGenerated: 145,
    features: ["Agente IA WhatsApp 24/7", "Envío de Brochures y PDFs", "Voz Neural ElevenLabs", "Calificación de Ingresos"],
  },
  {
    id: "cl-2",
    companyName: "AutoPremier Concesionario B2B",
    industry: "CONCESIONARIO",
    contactPerson: "Andrea Vargas (Directora de Ventas)",
    phone: "+57 320 8901234",
    email: "gerencia@autopremier.co",
    city: "Bogotá",
    planTier: "IMPERIO_ENTERPRISE",
    monthlyFeeCop: "$1.800.000 COP / mes",
    whatsappStatus: "ONLINE_24_7",
    totalConversations: 1620,
    pdfQuotesGenerated: 310,
    features: ["Cotización en PDF Instantánea", "Cálculo de Cuotas en Vivo", "Multi-Agente Asignado", "Conexión a ERP / Inventario"],
  },
  {
    id: "cl-3",
    companyName: "Clínica Odontológica Sonrisas VIP",
    industry: "SALUD_CLINICA",
    contactPerson: "Dra. Marcela Silva",
    phone: "+57 301 2345678",
    email: "citas@sonrisasvip.com",
    city: "Medellín",
    planTier: "STARTER_PYME",
    monthlyFeeCop: "$490.000 COP / mes",
    whatsappStatus: "ONLINE_24_7",
    totalConversations: 430,
    pdfQuotesGenerated: 42,
    features: ["Agendamiento de Citas IA", "Recordatorios por WhatsApp", "Base de Conocimiento 24/7"],
  }
];

export default function ClientsHubCentralizedPage() {
  const [clients, setClients] = useState<ClientTenant[]>(INITIAL_CLIENTS);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState("TODOS");
  const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false);

  // Form states for new client
  const [newCompanyName, setNewCompanyName] = useState("");
  const [newIndustry, setNewIndustry] = useState<any>("INMOBILIARIA");
  const [newContact, setNewContact] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newCity, setNewCity] = useState("Bogotá");
  const [newPlan, setNewPlan] = useState<any>("BUSINESS_GROWTH");

  // Load from local storage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("neurolabs_client_tenants");
      if (saved) setClients(JSON.parse(saved));
    } catch (e) {}
  }, []);

  const handleCreateClient = () => {
    if (!newCompanyName.trim() || !newPhone.trim()) {
      toast.error("Por favor completa el nombre de la empresa y el teléfono");
      return;
    }

    const fee = newPlan === "STARTER_PYME" ? "$490.000 COP / mes" : newPlan === "BUSINESS_GROWTH" ? "$1.290.000 COP / mes" : "$1.800.000 COP / mes";
    const features = newPlan === "STARTER_PYME" 
      ? ["Agente IA WhatsApp 24/7", "Dashboard de Leads", "Base de Conocimiento"]
      : newPlan === "BUSINESS_GROWTH"
      ? ["Agente IA 24/7", "Cotizaciones PDF al vuelo", "Voz Neural ElevenLabs", "Campañas Outbound"]
      : ["Agente IA Ilimitado", "Cotizaciones PDF", "Integración ERP / Siigo", "Firma Digital", "Soporte VIP"];

    const newClientObj: ClientTenant = {
      id: `cl-${Date.now().toString().slice(-4)}`,
      companyName: newCompanyName,
      industry: newIndustry,
      contactPerson: newContact || "Directivo",
      phone: newPhone,
      email: newEmail || `contacto@${newCompanyName.toLowerCase().replace(/\s+/g, '')}.co`,
      city: newCity,
      planTier: newPlan,
      monthlyFeeCop: fee,
      whatsappStatus: "ONLINE_24_7",
      totalConversations: 0,
      pdfQuotesGenerated: 0,
      features,
    };

    const updated = [newClientObj, ...clients];
    setClients(updated);
    localStorage.setItem("neurolabs_client_tenants", JSON.stringify(updated));
    setIsAddClientModalOpen(false);
    setNewCompanyName("");
    setNewPhone("");
    setNewContact("");
    toast.success(`🎉 Empresa "${newCompanyName}" registrada en el Centro de Clientes.`);
  };

  const filteredClients = clients.filter(c => {
    const matchesSearch = c.companyName.toLowerCase().includes(searchQuery.toLowerCase()) || c.city.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesIndustry = selectedIndustry === "TODOS" || c.industry === selectedIndustry;
    return matchesSearch && matchesIndustry;
  });

  return (
    <div className="min-h-screen bg-white text-slate-900 p-8 space-y-8 pb-32 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-emerald-600" />
              Arquitectura Multi-Tenant • Centro de Clientes
            </span>
          </div>
          <h1 className="text-4xl font-black tracking-tight text-slate-950 font-serif mt-2 flex items-center gap-3">
            <Building2 className="w-8 h-8 text-black" />
            Centro Centralizado de Clientes & Planes SaaS
          </h1>
          <p className="text-slate-500 mt-2 text-base">
            Gestiona cada empresa cliente, su industria, su instancia de Agente IA de WhatsApp y su plan de facturación mensual recurrente.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button 
            onClick={() => setIsAddClientModalOpen(true)}
            className="bg-slate-950 hover:bg-black text-white rounded-2xl shadow-md px-5 py-6 font-bold flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Registrar Nueva Empresa Cliente</span>
          </Button>
        </div>
      </div>

      {/* 3 PLANES DIFERENCIALES ESTÁNDAR B2B (MERCADO COLOMBIA) */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold font-serif text-slate-950 flex items-center gap-2">
            <Award className="w-5 h-5 text-emerald-600" />
            Estructura Oficial de Planes según el Tipo de Empresa
          </h3>
          <span className="text-xs font-bold text-slate-400">Precios Competitivos Colombia 2026</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Plan 1: Starter */}
          <Card className="bg-slate-50 border-slate-200 rounded-3xl p-6 relative flex flex-col justify-between hover:shadow-md transition-all">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Badge variant="outline" className="bg-white text-slate-700 font-bold text-xs">
                  🥉 PLAN STARTER PYME
                </Badge>
                <span className="text-xs text-slate-400 font-bold">Clínicas / Tiendas</span>
              </div>

              <div>
                <span className="text-3xl font-black text-slate-950 font-serif">$490.000</span>
                <span className="text-xs text-slate-500 font-bold"> COP / mes</span>
                <p className="text-xs text-slate-500 mt-1">Para negocios locales y consultorios que buscan atención 24/7.</p>
              </div>

              <div className="space-y-2 pt-3 border-t border-slate-200 text-xs">
                <div className="flex items-center gap-2 text-slate-700">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Agente IA 24/7 en WhatsApp (Sin caídas)</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Respuestas Humanizadas & Agendamiento de Citas</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Base de Conocimiento de la Empresa</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Hasta 1.000 conversaciones al mes</span>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <Badge className="w-full justify-center bg-slate-200 text-slate-700 py-1.5 rounded-xl font-bold text-xs">
                Margen Neto: 88.5%
              </Badge>
            </div>
          </Card>

          {/* Plan 2: Business Growth (Recomendado) */}
          <Card className="bg-slate-950 text-white rounded-3xl p-6 relative flex flex-col justify-between shadow-xl border-2 border-emerald-500/50 hover:scale-[1.01] transition-all">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Badge className="bg-emerald-500 text-slate-950 font-black text-xs">
                  🥈 BUSINESS GROWTH (MÁS VENDIDO)
                </Badge>
                <span className="text-xs text-emerald-400 font-bold">Inmobiliarias / Concesionarios</span>
              </div>

              <div>
                <span className="text-3xl font-black text-white font-serif">$1.290.000</span>
                <span className="text-xs text-slate-400 font-bold"> COP / mes</span>
                <p className="text-xs text-slate-400 mt-1">Para empresas de ticket alto que requieren cotizar en PDF y notas de voz.</p>
              </div>

              <div className="space-y-2 pt-3 border-t border-slate-800 text-xs">
                <div className="flex items-center gap-2 text-slate-200">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span><strong>Todo lo del Plan Starter</strong></span>
                </div>
                <div className="flex items-center gap-2 text-slate-200">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span><strong>Cotizaciones en PDF automáticas</strong> en 1.5s</span>
                </div>
                <div className="flex items-center gap-2 text-slate-200">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span><strong>Voz Neural Humana con ElevenLabs</strong></span>
                </div>
                <div className="flex items-center gap-2 text-slate-200">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Campañas Outbound y Prospección Fría</span>
                </div>
                <div className="flex items-center gap-2 text-slate-200">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Hasta 5.000 conversaciones al mes</span>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <Badge className="w-full justify-center bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 py-1.5 rounded-xl font-bold text-xs">
                Margen Neto: 97.7%
              </Badge>
            </div>
          </Card>

          {/* Plan 3: Imperio Enterprise */}
          <Card className="bg-slate-50 border-slate-200 rounded-3xl p-6 relative flex flex-col justify-between hover:shadow-md transition-all">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Badge variant="outline" className="bg-white text-purple-700 border-purple-200 font-bold text-xs">
                  🥇 PLAN IMPERIO ENTERPRISE
                </Badge>
                <span className="text-xs text-slate-400 font-bold">Corporativos / Grandes Cuentas</span>
              </div>

              <div>
                <span className="text-3xl font-black text-slate-950 font-serif">$1.800.000</span>
                <span className="text-xs text-slate-500 font-bold"> COP / mes + Setup</span>
                <p className="text-xs text-slate-500 mt-1">Para corporaciones que requieren conexión a su ERP (Siigo) y firma digital.</p>
              </div>

              <div className="space-y-2 pt-3 border-t border-slate-200 text-xs">
                <div className="flex items-center gap-2 text-slate-700">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span><strong>Todo lo del Plan Business Growth</strong></span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span><strong>Integración directa con ERP / Siigo / CRM</strong></span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Firma digital de contratos comerciales</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Multi-Agentes & Asistente Ejecutivo</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Conversaciones y PDFs Ilimitados</span>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <Badge className="w-full justify-center bg-purple-100 text-purple-800 py-1.5 rounded-xl font-bold text-xs">
                Margen Neto: 98.4%
              </Badge>
            </div>
          </Card>
        </div>
      </div>

      {/* SEARCH & FILTERS BAR */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <Input 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por empresa o ciudad..."
            className="pl-9 bg-white border-slate-200 rounded-xl text-xs"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Industria:
          </span>
          <select 
            value={selectedIndustry}
            onChange={(e) => setSelectedIndustry(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl p-2 text-xs font-medium text-slate-800"
          >
            <option value="TODOS">Todas las Industrias</option>
            <option value="INMOBILIARIA">Inmobiliarias</option>
            <option value="CONCESIONARIO">Concesionarios</option>
            <option value="SALUD_CLINICA">Salud & Clínicas</option>
            <option value="ECOMMERCE">E-Commerce</option>
            <option value="SERVICIOS_B2B">Servicios B2B</option>
          </select>
        </div>
      </div>

      {/* CLIENTS LIST / MULTI-TENANT CARDS */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold font-serif text-slate-950 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-black" />
          Empresas Clientes Activas ({filteredClients.length})
        </h3>

        <div className="grid gap-4">
          {filteredClients.map((client) => (
            <Card key={client.id} className="bg-white border-slate-200 shadow-sm rounded-2xl p-6 hover:shadow-md transition-all">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <Badge className="bg-slate-950 text-white text-[10px] font-bold">
                      {client.industry}
                    </Badge>

                    <Badge variant="outline" className={`text-[10px] font-bold ${
                      client.planTier === 'IMPERIO_ENTERPRISE' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                      client.planTier === 'BUSINESS_GROWTH' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                      'bg-slate-100 text-slate-700 border-slate-200'
                    }`}>
                      {client.planTier.replace('_', ' ')}
                    </Badge>

                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      WhatsApp: {client.whatsappStatus}
                    </span>

                    <span className="text-xs text-slate-400 font-medium">📍 {client.city}, Colombia</span>
                  </div>

                  <div>
                    <h4 className="text-lg font-bold text-slate-950 font-serif">{client.companyName}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Contacto: <strong className="text-slate-800">{client.contactPerson}</strong> • {client.phone} • {client.email}
                    </p>
                  </div>

                  {/* Feature Tags */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {client.features.map((feat, idx) => (
                      <span key={idx} className="px-2.5 py-1 bg-slate-50 border border-slate-200/80 rounded-lg text-[10px] font-semibold text-slate-600">
                        ✓ {feat}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end justify-between gap-3 w-full lg:w-auto pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                  <div className="text-left lg:text-right">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">FACTURACIÓN MENSUAL</span>
                    <span className="text-base font-black text-emerald-700 font-serif">{client.monthlyFeeCop}</span>
                    <p className="text-[10px] text-slate-400 mt-0.5">{client.totalConversations} chats • {client.pdfQuotesGenerated} PDFs</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="rounded-xl text-xs font-bold border-slate-200">
                      Ver Instancia
                    </Button>
                    <Button size="sm" className="bg-slate-950 hover:bg-black text-white rounded-xl text-xs font-bold">
                      Gestionar Agente
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* MODAL: REGISTRAR NUEVA EMPRESA CLIENTE */}
      <Dialog open={isAddClientModalOpen} onOpenChange={setIsAddClientModalOpen}>
        <DialogContent className="max-w-lg bg-white border-slate-200 rounded-3xl p-6 sm:p-8">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2.5 bg-slate-100 rounded-2xl text-slate-900">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold font-serif text-slate-950">
                  Registrar Nueva Empresa Cliente (Multi-Tenant)
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500">
                  Asigna un plan y activa una instancia de Agente IA para la empresa.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4 py-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">Nombre de la Empresa</label>
              <Input 
                value={newCompanyName}
                onChange={(e) => setNewCompanyName(e.target.value)}
                placeholder="Ej: Inmobiliaria & Constructora del Valle"
                className="bg-slate-50 border-slate-200 rounded-xl py-5 text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Sector / Industria</label>
                <select 
                  value={newIndustry}
                  onChange={(e) => setNewIndustry(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800"
                >
                  <option value="INMOBILIARIA">Inmobiliaria & Construcción</option>
                  <option value="CONCESIONARIO">Concesionario de Vehículos</option>
                  <option value="SALUD_CLINICA">Salud & Clínicas Estéticas</option>
                  <option value="ECOMMERCE">E-Commerce & Mayorista</option>
                  <option value="SERVICIOS_B2B">Servicios B2B & Consultoría</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Plan Asignado</label>
                <select 
                  value={newPlan}
                  onChange={(e) => setNewPlan(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800"
                >
                  <option value="STARTER_PYME">Starter ($490.000 COP/m)</option>
                  <option value="BUSINESS_GROWTH">Business Growth ($1.290.000 COP/m)</option>
                  <option value="IMPERIO_ENTERPRISE">Imperio Enterprise ($1.800.000 COP/m)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Persona de Contacto</label>
                <Input 
                  value={newContact}
                  onChange={(e) => setNewContact(e.target.value)}
                  placeholder="Ej: Laura Gómez (Gerente)"
                  className="bg-slate-50 border-slate-200 rounded-xl py-5 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Ciudad</label>
                <Input 
                  value={newCity}
                  onChange={(e) => setNewCity(e.target.value)}
                  placeholder="Ej: Bogotá, Medellín, Barranquilla"
                  className="bg-slate-50 border-slate-200 rounded-xl py-5 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">WhatsApp de la Empresa</label>
                <Input 
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="+57 300..."
                  className="bg-slate-50 border-slate-200 rounded-xl py-5 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Correo Corporativo</label>
                <Input 
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="contacto@empresa.com"
                  className="bg-slate-50 border-slate-200 rounded-xl py-5 text-xs"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="outline" onClick={() => setIsAddClientModalOpen(false)} className="rounded-xl text-xs">
              Cancelar
            </Button>
            <Button onClick={handleCreateClient} className="bg-slate-950 hover:bg-black text-white rounded-xl text-xs font-bold px-5">
              Crear Instancia & Activar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
