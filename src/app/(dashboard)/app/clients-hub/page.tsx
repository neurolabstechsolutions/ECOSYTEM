"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  Building2, Users, Shield, Plus, CheckCircle2, 
  Search, Filter, Globe, Database, ArrowRight, DollarSign, 
  BarChart3, Settings2, Edit3, Trash2, Phone, Mail, Award, Check,
  ExternalLink
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface ClientTenant {
  id: string;
  companyName: string;
  taxId?: string;
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
    id: "cl-trinova",
    companyName: "YJD TRINOVA S.A.S.",
    taxId: "902.095.222-8",
    industry: "CONCESIONARIO",
    contactPerson: "Gerencia Comercial YJD",
    phone: "+57 300 5765530",
    email: "dondeblanca15@gmail.com",
    city: "Barranquilla (Atlántico)",
    planTier: "IMPERIO_ENTERPRISE",
    monthlyFeeCop: "$1.800.000 COP/mes",
    whatsappStatus: "ONLINE_24_7",
    totalConversations: 1940,
    pdfQuotesGenerated: 382,
    features: ["Agente IA WhatsApp 24/7", "Cotización en PDF", "Corretaje Digital", "Subdominio Oficial"],
  },
  {
    id: "cl-1",
    companyName: "Inmobiliaria & Constructora del Norte",
    taxId: "901.782.441-2",
    industry: "INMOBILIARIA",
    contactPerson: "Carlos Mendoza",
    phone: "+57 310 4567890",
    email: "ventas@inmometropolitana.com",
    city: "Barranquilla",
    planTier: "BUSINESS_GROWTH",
    monthlyFeeCop: "$1.290.000 COP/mes",
    whatsappStatus: "ONLINE_24_7",
    totalConversations: 840,
    pdfQuotesGenerated: 145,
    features: ["Agente IA WhatsApp 24/7", "Envío de Brochures", "Calificación de Ingresos"],
  },
  {
    id: "cl-2",
    companyName: "AutoPremier Concesionario B2B",
    industry: "CONCESIONARIO",
    contactPerson: "Andrea Vargas",
    phone: "+57 320 8901234",
    email: "gerencia@autopremier.co",
    city: "Bogotá D.C.",
    planTier: "IMPERIO_ENTERPRISE",
    monthlyFeeCop: "$1.800.000 COP/mes",
    whatsappStatus: "ONLINE_24_7",
    totalConversations: 1620,
    pdfQuotesGenerated: 310,
    features: ["Cotización en PDF", "Cálculo de Cuotas", "Conexión a ERP"],
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
    monthlyFeeCop: "$490.000 COP/mes",
    whatsappStatus: "ONLINE_24_7",
    totalConversations: 430,
    pdfQuotesGenerated: 42,
    features: ["Agendamiento de Citas IA", "Recordatorios por WhatsApp"],
  }
];

export default function ClientsHubCentralizedPage() {
  const [clients, setClients] = useState<ClientTenant[]>(INITIAL_CLIENTS);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState("TODOS");
  const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false);

  const [newCompanyName, setNewCompanyName] = useState("");
  const [newIndustry, setNewIndustry] = useState<any>("INMOBILIARIA");
  const [newContact, setNewContact] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newCity, setNewCity] = useState("Barranquilla");
  const [newPlan, setNewPlan] = useState<any>("BUSINESS_GROWTH");

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

    const fee = newPlan === "STARTER_PYME" ? "$490.000 COP/mes" : newPlan === "BUSINESS_GROWTH" ? "$1.290.000 COP/mes" : "$1.800.000 COP/mes";
    const features = newPlan === "STARTER_PYME" 
      ? ["Agente IA WhatsApp 24/7", "Dashboard de Leads"]
      : newPlan === "BUSINESS_GROWTH"
      ? ["Agente IA 24/7", "Cotizaciones PDF", "Campañas Outbound"]
      : ["Agente IA Ilimitado", "Integración ERP", "Firma Digital", "Soporte VIP"];

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
    toast.success(`Empresa "${newCompanyName}" registrada en el Centro de Clientes.`);
  };

  const filteredClients = useMemo(() => {
    return clients.filter(c => {
      const matchesSearch = c.companyName.toLowerCase().includes(searchQuery.toLowerCase()) || c.city.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesIndustry = selectedIndustry === "TODOS" || c.industry === selectedIndustry;
      return matchesSearch && matchesIndustry;
    });
  }, [clients, searchQuery, selectedIndustry]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-zinc-200/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-zinc-900 tracking-tight">Centro de Clientes & SaaS Multi-Tenant</h1>
            <Badge variant="outline" className="text-xs bg-zinc-100 text-zinc-700 font-semibold rounded-md border-zinc-200">
              {filteredClients.length} Empresas
            </Badge>
          </div>
          <p className="text-xs text-zinc-500 mt-0.5">Gestión de instancias de Agentes IA, contratos y facturación recurrente</p>
        </div>

        <Button 
          onClick={() => setIsAddClientModalOpen(true)}
          size="sm"
          className="h-8 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold rounded-lg px-3 gap-1.5 shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Registrar Empresa</span>
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 text-xs">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-zinc-400" />
          <Input 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por empresa o ciudad..."
            className="h-8 pl-8 text-xs border-zinc-200 bg-white rounded-lg focus-visible:ring-zinc-900"
          />
        </div>

        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: "TODOS", label: "Todas" },
            { id: "CONCESIONARIO", label: "Automotriz" },
            { id: "INMOBILIARIA", label: "Inmobiliarias" },
            { id: "SALUD_CLINICA", label: "Salud & Clínicas" },
            { id: "SERVICIOS_B2B", label: "Servicios B2B" },
          ].map(ind => (
            <button
              key={ind.id}
              type="button"
              onClick={() => setSelectedIndustry(ind.id)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium whitespace-nowrap transition-colors ${selectedIndustry === ind.id ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'}`}
            >
              {ind.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-semibold">
              <tr>
                <th className="py-2.5 px-3">Empresa Cliente</th>
                <th className="py-2.5 px-3">Contacto / Teléfono</th>
                <th className="py-2.5 px-3">Sector</th>
                <th className="py-2.5 px-3">Plan Activo</th>
                <th className="py-2.5 px-3">Facturación</th>
                <th className="py-2.5 px-3">WhatsApp 24/7</th>
                <th className="py-2.5 px-3 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filteredClients.map(client => (
                <tr key={client.id} className="hover:bg-zinc-50/80 transition-colors">
                  <td className="py-2.5 px-3">
                    <div className="font-semibold text-zinc-900">{client.companyName}</div>
                    <div className="text-[11px] text-zinc-400">{client.city} {client.taxId ? `· NIT ${client.taxId}` : ''}</div>
                  </td>
                  <td className="py-2.5 px-3 text-zinc-600 text-[11px]">
                    <div>{client.contactPerson}</div>
                    <a 
                      href={`https://wa.me/${client.phone.replace(/[^0-9]/g, '')}`} 
                      target="_blank" 
                      rel="noreferrer"
                      className="text-emerald-600 font-mono hover:underline flex items-center gap-1"
                    >
                      <Phone className="h-2.5 w-2.5" />
                      <span>{client.phone}</span>
                    </a>
                  </td>
                  <td className="py-2.5 px-3">
                    <Badge variant="outline" className="text-[10px] bg-zinc-100 text-zinc-700 font-medium border-zinc-200">
                      {client.industry}
                    </Badge>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      client.planTier === 'IMPERIO_ENTERPRISE' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                      client.planTier === 'BUSINESS_GROWTH' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                      'bg-zinc-100 text-zinc-700'
                    }`}>
                      {client.planTier.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-bold font-mono text-zinc-800 text-[11px]">
                    {client.monthlyFeeCop}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span>En Línea</span>
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <Button variant="outline" size="sm" className="h-7 text-[11px] border-zinc-200 px-2">
                      Gestionar
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={isAddClientModalOpen} onOpenChange={setIsAddClientModalOpen}>
        <DialogContent className="max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-zinc-900">
              Registrar Empresa Cliente (Multi-Tenant)
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-500">
              Asigna un plan y activa una instancia de Agente IA para la empresa.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 pt-2 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-zinc-700">Nombre de la Empresa *</label>
              <Input 
                value={newCompanyName}
                onChange={(e) => setNewCompanyName(e.target.value)}
                placeholder="Ej. Inmobiliaria del Norte S.A.S."
                className="h-9 text-xs"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="font-semibold text-zinc-700">Sector</label>
                <select 
                  value={newIndustry}
                  onChange={(e) => setNewIndustry(e.target.value as any)}
                  className="w-full h-9 rounded-lg border border-zinc-200 px-2 text-xs bg-white text-zinc-800 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                >
                  <option value="INMOBILIARIA">Inmobiliaria</option>
                  <option value="CONCESIONARIO">Concesionario</option>
                  <option value="SALUD_CLINICA">Salud & Clínicas</option>
                  <option value="ECOMMERCE">E-Commerce</option>
                  <option value="SERVICIOS_B2B">Servicios B2B</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-zinc-700">Ciudad</label>
                <Input 
                  value={newCity}
                  onChange={(e) => setNewCity(e.target.value)}
                  placeholder="Barranquilla"
                  className="h-9 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="font-semibold text-zinc-700">Teléfono / WhatsApp *</label>
                <Input 
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="+57 300 1234567"
                  className="h-9 text-xs font-mono"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-zinc-700">Plan</label>
                <select 
                  value={newPlan}
                  onChange={(e) => setNewPlan(e.target.value as any)}
                  className="w-full h-9 rounded-lg border border-zinc-200 px-2 text-xs bg-white text-zinc-800 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                >
                  <option value="STARTER_PYME">Starter ($490.000 COP/mes)</option>
                  <option value="BUSINESS_GROWTH">Growth ($1.290.000 COP/mes)</option>
                  <option value="IMPERIO_ENTERPRISE">Enterprise ($1.800.000 COP/mes)</option>
                </select>
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsAddClientModalOpen(false)} className="h-8 text-xs">
                Cancelar
              </Button>
              <Button onClick={handleCreateClient} size="sm" className="h-8 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold">
                Guardar Empresa
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
