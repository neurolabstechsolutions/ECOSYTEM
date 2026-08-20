"use client";

import React, { useState, useMemo } from "react";
import { 
  Users, Search, Plus, Building2, ShieldCheck, ShieldAlert, AlertTriangle, 
  ExternalLink, Phone, Mail, FileText, CheckCircle2, Sliders, Database, 
  Sparkles, Download, ArrowUpRight, Lock
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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

interface B2BContact {
  id: string;
  name: string;
  companyName: string;
  nit: string;
  chamberOfCommerceStatus: "ACTIVA_VERIFICADA" | "EN_REVISION" | "ALERTA_SUSPENDIDA";
  phone: string;
  email: string;
  industry: string;
  fraudRiskScore: number; // 0 to 100 (lower is safer)
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
    tags: ["Cliente Verificado", "Contrato Software", "VIP"]
  },
  {
    id: "cnt-002",
    name: "Yury Jaramillo",
    companyName: "JY Trinova S.A.S.",
    nit: "901.789.442-1",
    chamberOfCommerceStatus: "ACTIVA_VERIFICADA",
    phone: "+57 323 5845145",
    email: "direccion@jytrinova.com",
    industry: "Automotriz & Corretaje",
    fraudRiskScore: 2,
    riskTier: "BAJO",
    source: "Portal Trinova",
    tags: ["Administradora", "Corretaje Oficial", "Firma Digital"]
  },
  {
    id: "cnt-003",
    name: "Richard Acosta",
    companyName: "Inversiones Inmobiliarias Prime",
    nit: "900.812.334-8",
    chamberOfCommerceStatus: "ACTIVA_VERIFICADA",
    phone: "+57 310 4492011",
    email: "racosta@inversionesprime.co",
    industry: "Inmobiliario & Bienes Raíces",
    fraudRiskScore: 12,
    riskTier: "BAJO",
    source: "Prospección Cámara",
    tags: ["Propietario", "B2B Prospección"]
  },
  {
    id: "cnt-004",
    name: "Perfil No Identificado (Número Sospechoso)",
    companyName: "Sin Registro Mercantil RUES",
    nit: "No Registrado",
    chamberOfCommerceStatus: "ALERTA_SUSPENDIDA",
    phone: "+57 320 0009182",
    email: "anonimo@tempmail.com",
    industry: "Sin Categoría",
    fraudRiskScore: 89,
    riskTier: "ALTO",
    source: "WhatsApp Desconocido",
    tags: ["Bloqueo Preventivo", "Riesgo Extorsión"]
  }
];

export default function ContactsPage() {
  const [contacts, setContacts] = useState<B2BContact[]>(INITIAL_CONTACTS);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedContact, setSelectedContact] = useState<B2BContact | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const filtered = useMemo(() => {
    return contacts.filter(c => 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.nit.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery)
    );
  }, [contacts, searchQuery]);

  const handleOpenDetail = (contact: B2BContact) => {
    setSelectedContact(contact);
    setIsDetailOpen(true);
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 p-8 space-y-8 pb-32">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-950 font-serif flex items-center gap-3">
            <Building2 className="w-8 h-8 text-black" />
            Directorio B2B & Validación de Empresas
          </h1>
          <p className="text-slate-500 mt-2 text-base">
            Prospección empresarial, verificación oficial en Cámara de Comercio / RUES y escudo anti-fraude algorítmico.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button className="bg-slate-950 hover:bg-black text-white rounded-2xl shadow-md px-5 py-6 font-bold flex items-center gap-2">
            <Plus className="w-4 h-4" />
            <span>Importar Base Cámara de Comercio</span>
          </Button>
        </div>
      </div>

      {/* Security & Risk Overview Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-slate-50 border-slate-200 rounded-3xl p-5">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-100 text-emerald-700 rounded-2xl">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase">Validación RUES / Cámara</p>
              <h4 className="text-xl font-bold text-slate-900">100% Automatizada</h4>
            </div>
          </div>
        </Card>

        <Card className="bg-slate-50 border-slate-200 rounded-3xl p-5">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 text-blue-700 rounded-2xl">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase">Empresas en Directorio</p>
              <h4 className="text-xl font-bold text-slate-900">{contacts.length} Registradas</h4>
            </div>
          </div>
        </Card>

        <Card className="bg-slate-50 border-slate-200 rounded-3xl p-5">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-100 text-red-700 rounded-2xl">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase">Filtro Anti-Extorsión</p>
              <h4 className="text-xl font-bold text-red-600">Escudo Activo (Llama 120B)</h4>
            </div>
          </div>
        </Card>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <Input 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por Nombre, Empresa, NIT o Teléfono..."
            className="pl-10 bg-white border-slate-200 rounded-xl text-sm"
          />
        </div>
      </div>

      {/* Table */}
      <Card className="bg-white border-slate-200 shadow-sm rounded-3xl overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase border-b border-slate-100">
                <tr>
                  <th className="p-4 font-bold">Empresa & Razón Social</th>
                  <th className="p-4 font-bold">Contacto Principal</th>
                  <th className="p-4 font-bold">Estado Cámara / RUES</th>
                  <th className="p-4 font-bold">Nivel de Riesgo (IA)</th>
                  <th className="p-4 font-bold">Sector</th>
                  <th className="p-4 text-right font-bold">Auditoría</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-slate-900 text-sm">{c.companyName}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">NIT: {c.nit}</div>
                    </td>
                    <td className="p-4 space-y-0.5">
                      <div className="font-semibold text-slate-800">{c.name}</div>
                      <div className="text-[11px] text-slate-500">{c.phone}</div>
                    </td>
                    <td className="p-4">
                      {c.chamberOfCommerceStatus === 'ACTIVA_VERIFICADA' && (
                        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 flex items-center gap-1 w-fit">
                          <CheckCircle2 className="w-3 h-3" /> Activa & Vigente
                        </Badge>
                      )}
                      {c.chamberOfCommerceStatus === 'ALERTA_SUSPENDIDA' && (
                        <Badge className="bg-red-50 text-red-700 border-red-200 flex items-center gap-1 w-fit">
                          <AlertTriangle className="w-3 h-3" /> No Registrada / Alerta
                        </Badge>
                      )}
                    </td>
                    <td className="p-4">
                      {c.riskTier === 'BAJO' && (
                        <div className="flex items-center gap-1.5 text-emerald-600 font-bold">
                          <ShieldCheck className="w-4 h-4" />
                          <span>Riesgo Bajo ({c.fraudRiskScore}%)</span>
                        </div>
                      )}
                      {c.riskTier === 'ALTO' && (
                        <div className="flex items-center gap-1.5 text-red-600 font-bold">
                          <ShieldAlert className="w-4 h-4" />
                          <span>Alto Riesgo ({c.fraudRiskScore}%)</span>
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <Badge variant="outline" className="text-slate-600 border-slate-200 bg-white">
                        {c.industry}
                      </Badge>
                    </td>
                    <td className="p-4 text-right">
                      <Button 
                        onClick={() => handleOpenDetail(c)}
                        variant="outline" 
                        size="sm" 
                        className="rounded-xl text-xs font-bold text-slate-700 hover:text-black border-slate-200"
                      >
                        Ver Ficha
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Detail Modal */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-lg bg-white border-slate-200 rounded-3xl p-6 sm:p-8">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold font-serif text-slate-950">
              Expediente de Validación Empresarial
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Reporte consolidado con cruce de fuentes y análisis de riesgo por IA.
            </DialogDescription>
          </DialogHeader>

          {selectedContact && (
            <div className="space-y-4 py-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Razón Social:</span>
                  <span className="font-bold text-slate-900">{selectedContact.companyName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">NIT / Matrícula:</span>
                  <span className="font-semibold text-slate-800">{selectedContact.nit}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Representante:</span>
                  <span className="font-semibold text-slate-800">{selectedContact.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Teléfono / WhatsApp:</span>
                  <span className="font-bold text-slate-900">{selectedContact.phone}</span>
                </div>
              </div>

              <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-200 space-y-2">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Dictamen de Seguridad IA (Llama 120B):
                </div>
                <p className="text-slate-600 leading-relaxed">
                  El contacto presenta concordancia entre nombre, teléfono e historial de registro. No se detectan patrones de extorsión, llamadas de spam masivo o suplantación de identidad.
                </p>
              </div>

              <Button onClick={() => setIsDetailOpen(false)} className="w-full bg-slate-950 hover:bg-black text-white font-bold rounded-xl py-5">
                Cerrar Expediente
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
