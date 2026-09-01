"use client";

import React, { useState, useMemo } from "react";
import { 
  Users, Search, Plus, Building2, ShieldCheck, ShieldAlert, AlertTriangle, 
  ExternalLink, Phone, Mail, FileText, CheckCircle2, Sliders, Database, 
  Download, ArrowUpRight, Lock
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

interface B2BContact {
  id: string;
  name: string;
  companyName: string;
  nit: string;
  chamberOfCommerceStatus: "ACTIVA_VERIFICADA" | "EN_REVISION" | "ALERTA_SUSPENDIDA";
  phone: string;
  email: string;
  industry: string;
  fraudRiskScore: number;
  riskTier: "BAJO" | "MEDIO" | "ALTO";
  source: string;
  tags: string[];
}

const INITIAL_CONTACTS: B2BContact[] = [
  {
    id: "cnt-001",
    name: "Jesús Cantillo",
    companyName: "Soluciones Digitales del Caribe S.A.S.",
    nit: "901.482.119-4",
    chamberOfCommerceStatus: "ACTIVA_VERIFICADA",
    phone: "+57 300 5765530",
    email: "gerencia@solucionescaribe.com",
    industry: "Desarrollo & Tecnología",
    fraudRiskScore: 4,
    riskTier: "BAJO",
    source: "WhatsApp Direct",
    tags: ["Cliente Verificado", "VIP"]
  },
  {
    id: "cnt-002",
    name: "Yury Jaramillo",
    companyName: "YJD Trinova S.A.S.",
    nit: "902.095.222-8",
    chamberOfCommerceStatus: "ACTIVA_VERIFICADA",
    phone: "+57 323 5845145",
    email: "dondeblanca15@gmail.com",
    industry: "Automotriz & Corretaje",
    fraudRiskScore: 2,
    riskTier: "BAJO",
    source: "Portal Trinova",
    tags: ["Administradora", "Corretaje Oficial"]
  },
  {
    id: "cnt-003",
    name: "Richard Acosta",
    companyName: "Inversiones Inmobiliarias Prime",
    nit: "900.812.334-8",
    chamberOfCommerceStatus: "ACTIVA_VERIFICADA",
    phone: "+57 310 4492011",
    email: "racosta@inversionesprime.co",
    industry: "Inmobiliario",
    fraudRiskScore: 12,
    riskTier: "BAJO",
    source: "Prospección",
    tags: ["Propietario", "B2B"]
  }
];

export default function ContactsPage() {
  const [contacts, setContacts] = useState<B2BContact[]>(INITIAL_CONTACTS);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedContact, setSelectedContact] = useState<B2BContact | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isNewContactOpen, setIsNewContactOpen] = useState(false);

  // Form State
  const [newName, setNewName] = useState("");
  const [newCompany, setNewCompany] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newNit, setNewNit] = useState("");
  const [newIndustry, setNewIndustry] = useState("Automotriz");

  const filteredContacts = useMemo(() => {
    return contacts.filter(c => 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery)
    );
  }, [contacts, searchQuery]);

  const handleCreateContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newPhone) {
      toast.error("Ingrese al menos el nombre y teléfono");
      return;
    }

    const created: B2BContact = {
      id: `cnt-${Date.now().toString(36)}`,
      name: newName,
      companyName: newCompany || "Persona Natural",
      nit: newNit || "N/A",
      chamberOfCommerceStatus: "ACTIVA_VERIFICADA",
      phone: newPhone,
      email: newEmail || "N/A",
      industry: newIndustry,
      fraudRiskScore: 5,
      riskTier: "BAJO",
      source: "Manual",
      tags: ["Nuevo Contacto"]
    };

    setContacts([created, ...contacts]);
    setIsNewContactOpen(false);
    setNewName("");
    setNewCompany("");
    setNewPhone("");
    setNewEmail("");
    toast.success("Contacto guardado correctamente");
  };

  return (
    <div className="space-y-4">
      {/* ─── Compact Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-zinc-200/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-zinc-900 tracking-tight">Contactos B2B & Clientes</h1>
            <Badge variant="outline" className="text-xs bg-zinc-100 text-zinc-700 font-semibold rounded-md border-zinc-200">
              {filteredContacts.length} Registros
            </Badge>
          </div>
          <p className="text-xs text-zinc-500 mt-0.5">Directorio verificado de personas naturales, jurídicas y propietarios</p>
        </div>

        <Button 
          onClick={() => setIsNewContactOpen(true)}
          size="sm"
          className="h-8 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold rounded-lg px-3 gap-1.5 shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Nuevo Contacto</span>
        </Button>
      </div>

      {/* ─── Compact Search ─── */}
      <div className="relative max-w-sm">
        <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-zinc-400" />
        <Input 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar por nombre, empresa o teléfono..."
          className="h-8 pl-8 text-xs border-zinc-200 bg-white rounded-lg focus-visible:ring-zinc-900"
        />
      </div>

      {/* ─── Compact Table View ─── */}
      <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-semibold">
              <tr>
                <th className="py-2.5 px-3">Nombre / Contacto</th>
                <th className="py-2.5 px-3">Empresa / Razón Social</th>
                <th className="py-2.5 px-3">Teléfono / WhatsApp</th>
                <th className="py-2.5 px-3">Sector</th>
                <th className="py-2.5 px-3">Verificación RUES</th>
                <th className="py-2.5 px-3 text-right">Detalle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filteredContacts.map(c => (
                <tr key={c.id} className="hover:bg-zinc-50/80 transition-colors">
                  <td className="py-2.5 px-3">
                    <div className="font-semibold text-zinc-900">{c.name}</div>
                    <div className="text-[11px] text-zinc-400">{c.email}</div>
                  </td>
                  <td className="py-2.5 px-3 text-zinc-700 text-[11px]">
                    <div className="font-medium">{c.companyName}</div>
                    <div className="text-[10px] text-zinc-400 font-mono">NIT: {c.nit}</div>
                  </td>
                  <td className="py-2.5 px-3">
                    <a 
                      href={`https://wa.me/${c.phone.replace(/[^0-9]/g, '')}`} 
                      target="_blank" 
                      rel="noreferrer"
                      className="text-emerald-600 font-mono text-[11px] hover:underline flex items-center gap-1"
                    >
                      <Phone className="h-2.5 w-2.5" />
                      <span>{c.phone}</span>
                    </a>
                  </td>
                  <td className="py-2.5 px-3">
                    <Badge variant="outline" className="text-[10px] font-medium bg-zinc-100 text-zinc-700 border-zinc-200">
                      {c.industry}
                    </Badge>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      <ShieldCheck className="h-3 w-3 text-emerald-600" />
                      <span>Verificado</span>
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <Button 
                      onClick={() => { setSelectedContact(c); setIsDetailOpen(true); }}
                      variant="outline" 
                      size="sm" 
                      className="h-7 text-[11px] border-zinc-200 px-2"
                    >
                      Ver Ficha
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── Modal: Detalle de Contacto ─── */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-sm bg-white">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-zinc-900">
              {selectedContact?.name}
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-500">
              {selectedContact?.companyName} · NIT {selectedContact?.nit}
            </DialogDescription>
          </DialogHeader>

          {selectedContact && (
            <div className="space-y-2.5 pt-2 text-xs">
              <div className="p-2.5 rounded-lg bg-zinc-50 border border-zinc-200 space-y-1">
                <div className="flex justify-between text-zinc-600">
                  <span>Teléfono:</span>
                  <span className="font-mono font-bold text-zinc-900">{selectedContact.phone}</span>
                </div>
                <div className="flex justify-between text-zinc-600">
                  <span>Correo:</span>
                  <span className="text-zinc-900">{selectedContact.email}</span>
                </div>
                <div className="flex justify-between text-zinc-600">
                  <span>Origen:</span>
                  <span className="text-zinc-900">{selectedContact.source}</span>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button size="sm" onClick={() => setIsDetailOpen(false)} className="h-8 text-xs bg-zinc-900 text-white">
                  Cerrar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ─── Modal: Crear Contacto ─── */}
      <Dialog open={isNewContactOpen} onOpenChange={setIsNewContactOpen}>
        <DialogContent className="max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-zinc-900">
              Nuevo Contacto B2B / Propietario
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-500">
              Agrega un cliente al directorio centralizado.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateContact} className="space-y-3 pt-2 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-zinc-700">Nombre Completo *</label>
              <Input 
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Ej. Roberto Durán"
                className="h-9 text-xs"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="font-semibold text-zinc-700">Empresa / Razón Social</label>
                <Input 
                  value={newCompany}
                  onChange={(e) => setNewCompany(e.target.value)}
                  placeholder="Ej. Distribuciones del Norte"
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-zinc-700">NIT o Cédula</label>
                <Input 
                  value={newNit}
                  onChange={(e) => setNewNit(e.target.value)}
                  placeholder="901.123.456-7"
                  className="h-9 text-xs font-mono"
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
                <label className="font-semibold text-zinc-700">Correo Electrónico</label>
                <Input 
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="cliente@correo.com"
                  className="h-9 text-xs"
                />
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsNewContactOpen(false)} className="h-8 text-xs">
                Cancelar
              </Button>
              <Button type="submit" size="sm" className="h-8 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold">
                Guardar Contacto
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
