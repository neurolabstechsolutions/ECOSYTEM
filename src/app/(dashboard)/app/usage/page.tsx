"use client";

import React, { useState } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, ResponsiveContainer
} from "recharts";
import {
  Coins, Cpu, MessageSquare, Zap, Activity, Clock,
  ArrowUpRight, AlertCircle, ShieldCheck
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const USAGE_DATA = [
  { day: "01 Ago", tokens: 12400, cost: 0.12 },
  { day: "05 Ago", tokens: 18900, cost: 0.18 },
  { day: "10 Ago", tokens: 25400, cost: 0.25 },
  { day: "15 Ago", tokens: 21000, cost: 0.21 },
  { day: "20 Ago", tokens: 34500, cost: 0.34 },
  { day: "25 Ago", tokens: 28900, cost: 0.28 },
  { day: "30 Ago", tokens: 31200, cost: 0.31 },
];

const MODEL_BREAKDOWN = [
  { model: "GPT-4o Mini (Meta WhatsApp)", tokens: "840.200", costUsd: "$1.26 USD", percentage: "72%" },
  { model: "Text Embedding 3 (Knowledge RAG)", tokens: "210.400", costUsd: "$0.04 USD", percentage: "18%" },
  { model: "ElevenLabs Neural Voice", tokens: "15.000 chars", costUsd: "$0.45 USD", percentage: "10%" },
];

export default function UsagePage() {
  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      {/* ─── Compact Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-zinc-200/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-zinc-900 tracking-tight">Consumo de Tokens & Costos de IA</h1>
            <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-700 font-semibold rounded-md border-emerald-200">
              ● Costo Eficiente: $1.75 USD
            </Badge>
          </div>
          <p className="text-xs text-zinc-500 mt-0.5">Control en tiempo real de tokens consumidos, llamadas a la API y costo operativo</p>
        </div>
      </div>

      {/* ─── 3 Compact KPI Stats ─── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
        <div className="bg-white border border-zinc-200/90 rounded-xl p-3 shadow-xs space-y-1">
          <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Gasto Total Acumulado</span>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-black text-zinc-900 font-mono">$1.75 USD</span>
            <span className="text-[11px] font-semibold text-zinc-500 font-mono">~$7.200 COP</span>
          </div>
          <p className="text-[10px] text-emerald-600 font-semibold">98.5% de margen sobre el plan</p>
        </div>

        <div className="bg-white border border-zinc-200/90 rounded-xl p-3 shadow-xs space-y-1">
          <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Tokens Totales</span>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-black text-zinc-900 font-mono">1.065.600</span>
            <span className="text-[11px] font-semibold text-zinc-500">Tokens</span>
          </div>
          <p className="text-[10px] text-zinc-400">Promedio: 540 tokens / conversación</p>
        </div>

        <div className="bg-white border border-zinc-200/90 rounded-xl p-3 shadow-xs space-y-1">
          <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Límite de Seguridad</span>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-black text-zinc-900 font-mono">$50.00 USD</span>
            <span className="text-[11px] font-semibold text-emerald-600">3.5% Usado</span>
          </div>
          <p className="text-[10px] text-zinc-400">Protección automática contra sobrecostos</p>
        </div>
      </div>

      {/* ─── Compact Table View ─── */}
      <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-xs">
        <div className="p-3 bg-zinc-50 border-b border-zinc-200">
          <h2 className="text-xs font-bold text-zinc-900 uppercase tracking-wide">Desglose de Modelos y Costos</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-semibold">
              <tr>
                <th className="py-2.5 px-3">Modelo / Servicio</th>
                <th className="py-2.5 px-3">Volumen Procesado</th>
                <th className="py-2.5 px-3">Costo USD</th>
                <th className="py-2.5 px-3">% del Consumo</th>
                <th className="py-2.5 px-3 text-right">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {MODEL_BREAKDOWN.map((m, idx) => (
                <tr key={idx} className="hover:bg-zinc-50/80 transition-colors">
                  <td className="py-2.5 px-3 font-semibold text-zinc-900">
                    {m.model}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-zinc-700 text-[11px]">
                    {m.tokens}
                  </td>
                  <td className="py-2.5 px-3 font-mono font-bold text-zinc-900 text-[11px]">
                    {m.costUsd}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-zinc-600 text-[11px]">
                    {m.percentage}
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      Óptimo
                    </span>
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
