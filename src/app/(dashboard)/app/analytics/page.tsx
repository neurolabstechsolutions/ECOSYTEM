"use client";

import React, { useState } from "react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, ResponsiveContainer
} from "recharts";
import {
  TrendingUp, DollarSign, Users, Target, ArrowUpRight,
  Clock, Bot, MessageSquare, Activity, BarChart3, ShieldCheck
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const CONVERSATION_DATA = [
  { day: "Lun", total: 110, ai: 95, human: 15 },
  { day: "Mar", total: 145, ai: 125, human: 20 },
  { day: "Mie", total: 180, ai: 160, human: 20 },
  { day: "Jue", total: 165, ai: 140, human: 25 },
  { day: "Vie", total: 210, ai: 185, human: 25 },
  { day: "Sab", total: 190, ai: 170, human: 20 },
  { day: "Dom", total: 130, ai: 115, human: 15 },
];

const CATEGORY_DATA = [
  { name: "Carros & SUV", leads: 85, conversion: "18%" },
  { name: "Motos", leads: 42, conversion: "22%" },
  { name: "Inmuebles Venta", leads: 28, conversion: "14%" },
  { name: "Inmuebles Renta", leads: 35, conversion: "19%" },
  { name: "Software & SaaS", leads: 15, conversion: "33%" },
];

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("7D");

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      {/* ─── Compact Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-zinc-200/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-zinc-900 tracking-tight">Analytics & Business Intelligence</h1>
            <Badge variant="outline" className="text-xs bg-zinc-100 text-zinc-700 font-semibold rounded-md border-zinc-200">
              Datos en Vivo
            </Badge>
          </div>
          <p className="text-xs text-zinc-500 mt-0.5">Rendimiento de atención IA, volumen de leads y efectividad comercial</p>
        </div>

        <div className="flex items-center gap-1 bg-zinc-100 p-0.5 rounded-lg border border-zinc-200 text-xs">
          {["24H", "7D", "30D", "YTD"].map(range => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${timeRange === range ? 'bg-white text-zinc-900 shadow-xs' : 'text-zinc-500 hover:text-zinc-900'}`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* ─── 4 Compact KPI Stats ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
        <div className="bg-white border border-zinc-200/90 rounded-xl p-3 shadow-xs space-y-1">
          <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Conversaciones</span>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-black text-zinc-900 font-mono">1.130</span>
            <span className="text-[11px] font-semibold text-emerald-600">+14.2%</span>
          </div>
          <p className="text-[10px] text-zinc-400">88% resueltas por IA</p>
        </div>

        <div className="bg-white border border-zinc-200/90 rounded-xl p-3 shadow-xs space-y-1">
          <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Leads Generados</span>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-black text-zinc-900 font-mono">205</span>
            <span className="text-[11px] font-semibold text-emerald-600">+28</span>
          </div>
          <p className="text-[10px] text-zinc-400">Calificados en CRM</p>
        </div>

        <div className="bg-white border border-zinc-200/90 rounded-xl p-3 shadow-xs space-y-1">
          <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Tasa Conversión</span>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-black text-zinc-900 font-mono">18.1%</span>
            <span className="text-[11px] font-semibold text-emerald-600">+2.4%</span>
          </div>
          <p className="text-[10px] text-zinc-400">Visita a concesionario</p>
        </div>

        <div className="bg-white border border-zinc-200/90 rounded-xl p-3 shadow-xs space-y-1">
          <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Volumen Estimado</span>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-black text-zinc-900 font-mono">$1.420M</span>
            <span className="text-[11px] font-semibold text-zinc-500 font-mono">COP</span>
          </div>
          <p className="text-[10px] text-zinc-400">Valor de pipeline activo</p>
        </div>
      </div>

      {/* ─── Compact Chart + Breakdown Grid ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 items-start">
        <div className="lg:col-span-2 bg-white border border-zinc-200/90 rounded-xl p-3.5 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
            <h2 className="text-xs font-bold text-zinc-900 uppercase tracking-wide">Volumen de Atención Semanal</h2>
            <div className="flex items-center gap-3 text-[11px] text-zinc-500">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-zinc-900" /> Total</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Agente IA</span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={CONVERSATION_DATA}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#71717a' }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#71717a' }} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#18181b', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '11px' }}
                />
                <Area type="monotone" dataKey="total" stroke="#18181b" fill="#f4f4f5" strokeWidth={2} />
                <Area type="monotone" dataKey="ai" stroke="#10b981" fill="#ecfdf5" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white border border-zinc-200/90 rounded-xl p-3.5 shadow-xs space-y-3">
          <div className="pb-2 border-b border-zinc-100">
            <h2 className="text-xs font-bold text-zinc-900 uppercase tracking-wide">Efectividad por Categoría</h2>
          </div>

          <div className="space-y-2 text-xs">
            {CATEGORY_DATA.map((cat, i) => (
              <div key={i} className="p-2 rounded-lg bg-zinc-50 border border-zinc-200/60 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-zinc-800">{cat.name}</div>
                  <div className="text-[10px] text-zinc-400 font-mono">{cat.leads} leads</div>
                </div>
                <span className="text-[11px] font-bold font-mono px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {cat.conversion}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
