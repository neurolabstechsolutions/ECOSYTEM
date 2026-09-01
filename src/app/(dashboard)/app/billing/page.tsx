"use client";

import React, { useState } from "react";
import { CreditCard, Download, ShieldCheck, Check, Plus, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface InvoiceItem {
  id: string;
  invoiceNumber: string;
  concept: string;
  amountCop: string;
  date: string;
  status: "PAGADA" | "PENDIENTE";
}

const INVOICES: InvoiceItem[] = [
  { id: "inv-1", invoiceNumber: "FE-2026-089", concept: "Plan Imperio Enterprise · YJD TRINOVA S.A.S.", amountCop: "$1.800.000 COP", date: "01/08/2026", status: "PAGADA" },
  { id: "inv-2", invoiceNumber: "FE-2026-074", concept: "Plan Business Growth · Inmobiliaria del Norte", amountCop: "$1.290.000 COP", date: "01/08/2026", status: "PAGADA" },
  { id: "inv-3", invoiceNumber: "FE-2026-058", concept: "Plan Starter PYME · Sonrisas VIP", amountCop: "$490.000 COP", date: "01/08/2026", status: "PAGADA" },
];

export default function BillingPage() {
  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      {/* ─── Compact Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-zinc-200/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-zinc-900 tracking-tight">Facturación & Suscripciones SaaS</h1>
            <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-700 font-semibold rounded-md border-emerald-200">
              ● Facturación Electrónica DIAN
            </Badge>
          </div>
          <p className="text-xs text-zinc-500 mt-0.5">Control de cobros recurrentes en COP, pasarela Wompi/Stripe y facturas generadas</p>
        </div>

        <Button 
          onClick={() => toast.success("Enlace de pago PSE / Wompi generado")}
          size="sm"
          className="h-8 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold rounded-lg px-3 gap-1.5 shadow-xs"
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span>Generar Cobro PSE</span>
        </Button>
      </div>

      {/* ─── 3 Compact Plan Tiers ─── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
        <div className="bg-white border border-zinc-200/90 rounded-xl p-3 shadow-xs space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-zinc-800">Plan Starter PYME</span>
            <Badge variant="outline" className="text-[10px] bg-zinc-100 text-zinc-600">Local</Badge>
          </div>
          <div className="text-lg font-black text-zinc-900 font-mono">$490.000 <span className="text-xs font-normal text-zinc-500">COP/mes</span></div>
          <p className="text-[11px] text-zinc-500">Agente 24/7 en WhatsApp hasta 1.000 chats/mes.</p>
        </div>

        <div className="bg-zinc-900 text-white rounded-xl p-3 shadow-xs space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-white">Business Growth</span>
            <span className="text-[10px] font-bold bg-emerald-500 text-zinc-950 px-1.5 py-0.5 rounded">Recomendado</span>
          </div>
          <div className="text-lg font-black text-white font-mono">$1.290.000 <span className="text-xs font-normal text-zinc-400">COP/mes</span></div>
          <p className="text-[11px] text-zinc-300">Cotizaciones en PDF al vuelo y notas de voz.</p>
        </div>

        <div className="bg-white border border-zinc-200/90 rounded-xl p-3 shadow-xs space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-purple-700">Imperio Enterprise</span>
            <Badge variant="outline" className="text-[10px] bg-purple-50 text-purple-700 border-purple-200">Corporativo</Badge>
          </div>
          <div className="text-lg font-black text-zinc-900 font-mono">$1.800.000 <span className="text-xs font-normal text-zinc-500">COP/mes</span></div>
          <p className="text-[11px] text-zinc-500">Chats ilimitados, firma digital de mandatos y ERP.</p>
        </div>
      </div>

      {/* ─── Compact Invoices Table ─── */}
      <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-xs">
        <div className="p-3 bg-zinc-50 border-b border-zinc-200">
          <h2 className="text-xs font-bold text-zinc-900 uppercase tracking-wide">Historial de Facturación</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-semibold">
              <tr>
                <th className="py-2.5 px-3">Nº Factura</th>
                <th className="py-2.5 px-3">Empresa / Concepto</th>
                <th className="py-2.5 px-3">Fecha</th>
                <th className="py-2.5 px-3">Monto COP</th>
                <th className="py-2.5 px-3">Estado</th>
                <th className="py-2.5 px-3 text-right">Comprobante</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {INVOICES.map(inv => (
                <tr key={inv.id} className="hover:bg-zinc-50/80 transition-colors">
                  <td className="py-2.5 px-3 font-mono font-bold text-zinc-900">
                    {inv.invoiceNumber}
                  </td>
                  <td className="py-2.5 px-3 text-zinc-700 font-medium">
                    {inv.concept}
                  </td>
                  <td className="py-2.5 px-3 text-zinc-500 font-mono text-[11px]">
                    {inv.date}
                  </td>
                  <td className="py-2.5 px-3 font-mono font-bold text-zinc-900 text-[11px]">
                    {inv.amountCop}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {inv.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <Button 
                      onClick={() => toast.success(`Descargando factura ${inv.invoiceNumber}`)}
                      variant="outline" 
                      size="sm" 
                      className="h-7 text-[11px] border-zinc-200 px-2 gap-1"
                    >
                      <Download className="h-3 w-3" />
                      <span>PDF</span>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
