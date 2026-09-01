"use client";

import React, { useState, useMemo } from 'react';
import { 
  Plus, Search, Filter, LayoutGrid, List, Phone, Mail, 
  DollarSign, Target, User, ChevronRight, CheckCircle2, 
  Clock, ArrowRight, Building2, Car, Home, Layers, Sparkles,
  MoreVertical, RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface LeadItem {
  id: string;
  name: string;
  phone: string;
  email?: string;
  productInterest: string;
  category: 'VEHICULO' | 'MOTO' | 'INMUEBLE' | 'SOFTWARE';
  budget: string;
  score: number;
  intent: 'ALTA' | 'MEDIA' | 'CALIFICADA';
  assignedTo: string;
  status: 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'NEGOTIATION' | 'WON';
  source: string;
  createdAt: string;
}

const INITIAL_LEADS: LeadItem[] = [
  {
    id: 'lead-101',
    name: 'Carlos Mendoza',
    phone: '+57 318 4509988',
    email: 'c.mendoza@gmail.com',
    productInterest: 'Toyota Fortuner GR-S 2024',
    category: 'VEHICULO',
    budget: '$310.000.000 COP',
    score: 95,
    intent: 'ALTA',
    assignedTo: 'Asesor Comercial Trinova',
    status: 'NEGOTIATION',
    source: 'WhatsApp Cloud API',
    createdAt: 'Hace 2 horas'
  },
  {
    id: 'lead-102',
    name: 'Carolina Gómez',
    phone: '+57 301 2293400',
    email: 'caro.gomez@empresa.co',
    productInterest: 'Penthouse Dúplex Alto Prado',
    category: 'INMUEBLE',
    budget: '$850.000.000 COP',
    score: 92,
    intent: 'CALIFICADA',
    assignedTo: 'Gerencia Inmobiliaria',
    status: 'QUALIFIED',
    source: 'Marketplace Web',
    createdAt: 'Hace 4 horas'
  },
  {
    id: 'lead-103',
    name: 'David Silva',
    phone: '+57 320 8941122',
    email: 'david.silva@outlook.com',
    productInterest: 'Yamaha MT-09 SP 890cc',
    category: 'MOTO',
    budget: '$68.500.000 COP',
    score: 88,
    intent: 'ALTA',
    assignedTo: 'Asesor Comercial Trinova',
    status: 'CONTACTED',
    source: 'WhatsApp Cloud API',
    createdAt: 'Hace 6 horas'
  },
  {
    id: 'lead-104',
    name: 'Inversiones Bolívar S.A.S.',
    phone: '+57 300 7891234',
    email: 'contacto@inversionesbolivar.com',
    productInterest: 'Desarrollo SaaS & Agente IA',
    category: 'SOFTWARE',
    budget: '$4.500 USD',
    score: 90,
    intent: 'ALTA',
    assignedTo: 'NeuroLabs Tech Solutions',
    status: 'NEW',
    source: 'Formulario Web',
    createdAt: 'Hace 1 día'
  },
  {
    id: 'lead-105',
    name: 'Andrés Felipe Restrepo',
    phone: '+57 315 6789012',
    email: 'andres.restrepo@gmail.com',
    productInterest: 'Mazda CX-30 Grand Touring 2023',
    category: 'VEHICULO',
    budget: '$115.000.000 COP',
    score: 98,
    intent: 'ALTA',
    assignedTo: 'Asesor Comercial Trinova',
    status: 'WON',
    source: 'Cierre Corretaje',
    createdAt: 'Hace 2 días'
  }
];

const STAGES = [
  { id: 'NEW', title: 'Nuevos', color: 'bg-blue-500' },
  { id: 'CONTACTED', title: 'Contactados', color: 'bg-indigo-500' },
  { id: 'QUALIFIED', title: 'Calificados', color: 'bg-amber-500' },
  { id: 'NEGOTIATION', title: 'En Negociación', color: 'bg-purple-500' },
  { id: 'WON', title: 'Cerrados', color: 'bg-emerald-500' },
];

export default function LeadsPipelinePage() {
  const [leads, setLeads] = useState<LeadItem[]>(INITIAL_LEADS);
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [activeMobileStage, setActiveMobileStage] = useState<string>('NEW');
  const [isNewLeadOpen, setIsNewLeadOpen] = useState(false);

  // New Lead Form State
  const [newLeadForm, setNewLeadForm] = useState({
    name: '',
    phone: '',
    email: '',
    productInterest: '',
    category: 'VEHICULO' as LeadItem['category'],
    budget: '',
    intent: 'ALTA' as LeadItem['intent'],
    status: 'NEW' as LeadItem['status']
  });

  // Filtered Leads
  const filteredLeads = useMemo(() => {
    return leads.filter(item => {
      const matchesSearch = 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.phone.includes(searchQuery) ||
        item.productInterest.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = categoryFilter === 'ALL' || item.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [leads, searchQuery, categoryFilter]);

  // Stage Move Handler
  const handleMoveStage = (leadId: string, nextStatus: LeadItem['status']) => {
    setLeads(prev => prev.map(lead => lead.id === leadId ? { ...lead, status: nextStatus } : lead));
    toast.success(`Lead actualizado a estado: ${STAGES.find(s => s.id === nextStatus)?.title}`);
  };

  // Add Lead Handler
  const handleCreateLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeadForm.name || !newLeadForm.phone) {
      toast.error('Ingrese al menos el nombre y teléfono del cliente');
      return;
    }

    const created: LeadItem = {
      id: `lead-${Date.now().toString(36)}`,
      name: newLeadForm.name,
      phone: newLeadForm.phone,
      email: newLeadForm.email || undefined,
      productInterest: newLeadForm.productInterest || 'Interés General',
      category: newLeadForm.category,
      budget: newLeadForm.budget || 'A convenir',
      score: 85,
      intent: newLeadForm.intent,
      assignedTo: 'Asesor Comercial',
      status: newLeadForm.status,
      source: 'Ingreso Manual',
      createdAt: 'Justo ahora'
    };

    setLeads([created, ...leads]);
    setIsNewLeadOpen(false);
    setNewLeadForm({
      name: '',
      phone: '',
      email: '',
      productInterest: '',
      category: 'VEHICULO',
      budget: '',
      intent: 'ALTA',
      status: 'NEW'
    });
    toast.success('Lead registrado exitosamente en el Pipeline');
  };

  return (
    <div className="space-y-4">
      {/* ─── Compact Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-zinc-200/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-zinc-900 tracking-tight">Pipeline de Ventas & Leads</h1>
            <Badge variant="outline" className="text-xs bg-zinc-100 text-zinc-700 font-semibold rounded-md border-zinc-200">
              {filteredLeads.length} Activos
            </Badge>
          </div>
          <p className="text-xs text-zinc-500 mt-0.5">Control de prospectos, cotizaciones y cierres comerciales</p>
        </div>

        {/* View Switcher & Action Buttons */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-zinc-100 p-0.5 rounded-lg border border-zinc-200">
            <Button
              type="button"
              size="sm"
              variant={viewMode === 'kanban' ? 'default' : 'ghost'}
              onClick={() => setViewMode('kanban')}
              className={`h-7 px-2.5 text-xs font-medium rounded-md ${viewMode === 'kanban' ? 'bg-white text-zinc-900 shadow-xs' : 'text-zinc-600 hover:text-zinc-900'}`}
            >
              <LayoutGrid className="h-3.5 w-3.5 mr-1" />
              <span>Tablero</span>
            </Button>
            <Button
              type="button"
              size="sm"
              variant={viewMode === 'table' ? 'default' : 'ghost'}
              onClick={() => setViewMode('table')}
              className={`h-7 px-2.5 text-xs font-medium rounded-md ${viewMode === 'table' ? 'bg-white text-zinc-900 shadow-xs' : 'text-zinc-600 hover:text-zinc-900'}`}
            >
              <List className="h-3.5 w-3.5 mr-1" />
              <span>Lista Compacta</span>
            </Button>
          </div>

          <Dialog open={isNewLeadOpen} onOpenChange={setIsNewLeadOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="h-8 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold rounded-lg px-3 gap-1.5 shadow-xs">
                <Plus className="h-3.5 w-3.5" />
                <span>Nuevo Lead</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md bg-white">
              <DialogHeader>
                <DialogTitle className="text-base font-bold text-zinc-900">Registrar Nuevo Prospecto (Lead)</DialogTitle>
                <DialogDescription className="text-xs text-zinc-500">
                  Ingrese los datos para incorporar el cliente al embudo de ventas.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateLead} className="space-y-3 pt-2 text-xs">
                <div className="space-y-1">
                  <Label htmlFor="leadName" className="text-xs font-semibold text-zinc-700">Nombre del Cliente *</Label>
                  <Input
                    id="leadName"
                    placeholder="Ej. Roberto Durán"
                    value={newLeadForm.name}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, name: e.target.value })}
                    className="h-9 text-xs"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label htmlFor="leadPhone" className="text-xs font-semibold text-zinc-700">Teléfono / WhatsApp *</Label>
                    <Input
                      id="leadPhone"
                      placeholder="+57 300 1234567"
                      value={newLeadForm.phone}
                      onChange={(e) => setNewLeadForm({ ...newLeadForm, phone: e.target.value })}
                      className="h-9 text-xs font-mono"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="leadCategory" className="text-xs font-semibold text-zinc-700">Categoría</Label>
                    <select
                      id="leadCategory"
                      value={newLeadForm.category}
                      onChange={(e) => setNewLeadForm({ ...newLeadForm, category: e.target.value as any })}
                      className="w-full h-9 rounded-lg border border-zinc-200 px-2 text-xs bg-white text-zinc-800 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                    >
                      <option value="VEHICULO">Carro / Camioneta</option>
                      <option value="MOTO">Moto / Ciclomotor</option>
                      <option value="INMUEBLE">Inmueble Venta / Renta</option>
                      <option value="SOFTWARE">Software & Soluciones</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="leadInterest" className="text-xs font-semibold text-zinc-700">Bien o Producto de Interés</Label>
                  <Input
                    id="leadInterest"
                    placeholder="Ej. Toyota TX-L 2023 o Apartamento Chicó"
                    value={newLeadForm.productInterest}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, productInterest: e.target.value })}
                    className="h-9 text-xs"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label htmlFor="leadBudget" className="text-xs font-semibold text-zinc-700">Presupuesto Estimado</Label>
                    <Input
                      id="leadBudget"
                      placeholder="Ej. $180.000.000 COP"
                      value={newLeadForm.budget}
                      onChange={(e) => setNewLeadForm({ ...newLeadForm, budget: e.target.value })}
                      className="h-9 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="leadStage" className="text-xs font-semibold text-zinc-700">Etapa Inicial</Label>
                    <select
                      id="leadStage"
                      value={newLeadForm.status}
                      onChange={(e) => setNewLeadForm({ ...newLeadForm, status: e.target.value as any })}
                      className="w-full h-9 rounded-lg border border-zinc-200 px-2 text-xs bg-white text-zinc-800 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                    >
                      <option value="NEW">Nuevo</option>
                      <option value="CONTACTED">Contactado</option>
                      <option value="QUALIFIED">Calificado</option>
                      <option value="NEGOTIATION">En Negociación</option>
                      <option value="WON">Cerrado / Ganado</option>
                    </select>
                  </div>
                </div>
                <DialogFooter className="pt-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => setIsNewLeadOpen(false)} className="h-8 text-xs">
                    Cancelar
                  </Button>
                  <Button type="submit" size="sm" className="h-8 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold">
                    Guardar Lead
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* ─── Compact Search & Category Filters ─── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 text-xs">
        <div className="relative flex-1 max-w-sm">
          <Search className="h-3.5 w-3.5 absolute left-2.5 top-2.5 text-zinc-400" />
          <Input
            placeholder="Buscar por cliente, teléfono, vehículo o casa..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8 pl-8 text-xs border-zinc-200 bg-white rounded-lg focus-visible:ring-zinc-900"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'ALL', label: 'Todos' },
            { id: 'VEHICULO', label: 'Carros' },
            { id: 'MOTO', label: 'Motos' },
            { id: 'INMUEBLE', label: 'Inmuebles' },
            { id: 'SOFTWARE', label: 'Tech' },
          ].map(cat => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategoryFilter(cat.id)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium whitespace-nowrap transition-colors ${categoryFilter === cat.id ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'}`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Mobile Stage Selector (Switches columns on phone cleanly) ─── */}
      <div className="sm:hidden flex items-center gap-1 overflow-x-auto p-1 bg-zinc-100 rounded-lg border border-zinc-200">
        {STAGES.map(stage => {
          const count = filteredLeads.filter(l => l.status === stage.id).length;
          const isActive = activeMobileStage === stage.id;
          return (
            <button
              key={stage.id}
              type="button"
              onClick={() => setActiveMobileStage(stage.id)}
              className={`flex-1 py-1.5 px-2 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 whitespace-nowrap transition-all ${isActive ? 'bg-white text-zinc-900 shadow-xs' : 'text-zinc-500'}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${stage.color}`} />
              <span>{stage.title}</span>
              <span className="text-[10px] px-1 rounded bg-zinc-200 text-zinc-700 font-bold">{count}</span>
            </button>
          );
        })}
      </div>

      {/* ─── VIEW 1: COMPACT KANBAN BOARD ─── */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 items-start">
          {STAGES.map(stage => {
            const columnLeads = filteredLeads.filter(l => l.status === stage.id);
            const isMobileHidden = activeMobileStage !== stage.id;

            return (
              <div 
                key={stage.id} 
                className={`flex flex-col bg-zinc-50/70 border border-zinc-200/80 rounded-xl p-2.5 min-h-[350px] ${isMobileHidden ? 'hidden sm:flex' : 'flex'}`}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-200">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${stage.color}`} />
                    <h3 className="text-xs font-bold text-zinc-800">{stage.title}</h3>
                  </div>
                  <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-full bg-zinc-200/70 text-zinc-600">
                    {columnLeads.length}
                  </span>
                </div>

                {/* Lead Cards List */}
                <div className="space-y-2 flex-1">
                  {columnLeads.map(lead => (
                    <div
                      key={lead.id}
                      className="bg-white border border-zinc-200/90 rounded-lg p-2.5 shadow-xs hover:border-zinc-400 transition-all text-xs space-y-1.5"
                    >
                      {/* Name & Score */}
                      <div className="flex items-start justify-between gap-1">
                        <div className="font-bold text-zinc-900 leading-snug line-clamp-1">
                          {lead.name}
                        </div>
                        <span className="text-[10px] font-bold font-mono px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                          {lead.score}%
                        </span>
                      </div>

                      {/* Product Interest */}
                      <div className="flex items-center gap-1 text-[11px] text-zinc-600 font-medium line-clamp-1">
                        {lead.category === 'VEHICULO' && <Car className="h-3 w-3 text-zinc-400 shrink-0" />}
                        {lead.category === 'MOTO' && <Layers className="h-3 w-3 text-zinc-400 shrink-0" />}
                        {lead.category === 'INMUEBLE' && <Home className="h-3 w-3 text-zinc-400 shrink-0" />}
                        {lead.category === 'SOFTWARE' && <Sparkles className="h-3 w-3 text-purple-400 shrink-0" />}
                        <span className="truncate">{lead.productInterest}</span>
                      </div>

                      {/* Phone & Budget */}
                      <div className="flex items-center justify-between text-[11px] pt-1 text-zinc-500 font-mono">
                        <span className="text-zinc-700 font-semibold">{lead.budget}</span>
                        <a 
                          href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="flex items-center gap-0.5 text-emerald-600 hover:underline text-[10px]"
                        >
                          <Phone className="h-2.5 w-2.5" />
                          <span>WhatsApp</span>
                        </a>
                      </div>

                      {/* Quick Move Action */}
                      <div className="pt-1.5 border-t border-zinc-100 flex items-center justify-between text-[10px] text-zinc-400">
                        <span>{lead.source}</span>
                        <div className="flex items-center gap-1">
                          {stage.id !== 'WON' && (
                            <button
                              type="button"
                              onClick={() => {
                                const currentIndex = STAGES.findIndex(s => s.id === stage.id);
                                if (currentIndex < STAGES.length - 1) {
                                  handleMoveStage(lead.id, STAGES[currentIndex + 1].id as any);
                                }
                              }}
                              className="text-zinc-600 hover:text-zinc-900 font-medium px-1.5 py-0.5 bg-zinc-100 hover:bg-zinc-200 rounded flex items-center gap-0.5"
                            >
                              <span>Avanzar</span>
                              <ChevronRight className="h-2.5 w-2.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {columnLeads.length === 0 && (
                    <div className="py-8 text-center text-zinc-400 text-xs border border-dashed border-zinc-200 rounded-lg">
                      Sin prospectos
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ─── VIEW 2: COMPACT LIST / TABLE VIEW (ULTRA CLEAN) ─── */}
      {viewMode === 'table' && (
        <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-semibold">
                <tr>
                  <th className="py-2.5 px-3">Cliente</th>
                  <th className="py-2.5 px-3">Contacto</th>
                  <th className="py-2.5 px-3">Interés / Bien</th>
                  <th className="py-2.5 px-3">Presupuesto</th>
                  <th className="py-2.5 px-3">Score</th>
                  <th className="py-2.5 px-3">Estado</th>
                  <th className="py-2.5 px-3 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredLeads.map(lead => {
                  const currentStage = STAGES.find(s => s.id === lead.status);
                  return (
                    <tr key={lead.id} className="hover:bg-zinc-50/80 transition-colors">
                      <td className="py-2.5 px-3 font-semibold text-zinc-900">
                        {lead.name}
                      </td>
                      <td className="py-2.5 px-3 text-zinc-600 font-mono text-[11px]">
                        <a 
                          href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="text-emerald-600 hover:underline flex items-center gap-1"
                        >
                          <Phone className="h-3 w-3" />
                          <span>{lead.phone}</span>
                        </a>
                      </td>
                      <td className="py-2.5 px-3 text-zinc-700 font-medium">
                        {lead.productInterest}
                      </td>
                      <td className="py-2.5 px-3 font-bold font-mono text-zinc-800 text-[11px]">
                        {lead.budget}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="text-[10px] font-bold font-mono px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {lead.score}%
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-zinc-700">
                          <span className={`w-1.5 h-1.5 rounded-full ${currentStage?.color}`} />
                          <span>{currentStage?.title}</span>
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <select
                          value={lead.status}
                          onChange={(e) => handleMoveStage(lead.id, e.target.value as any)}
                          className="h-7 px-1.5 rounded border border-zinc-200 text-[11px] bg-white text-zinc-700 focus:outline-none"
                        >
                          {STAGES.map(s => (
                            <option key={s.id} value={s.id}>{s.title}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}


