import React from 'react';
import { MOCK_METRICS } from '@/lib/mocks';
import { 
  Users, MessageSquare, Target, Clock, Calendar, CheckCircle2, 
  ArrowUpRight, TrendingUp, ShieldCheck, Phone, ArrowRight,
  Car, Home, Layers
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { WhatsAppQRButton } from '@/components/whatsapp-qr-button';

export default function DashboardPage() {
  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      {/* ─── Compact Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-zinc-200/80">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 tracking-tight">Centro de Control & Operaciones</h1>
          <p className="text-xs text-zinc-500 mt-0.5">NeuroLabs Tech Solutions S.A.S. · Monitoreo y automatización en tiempo real</p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[11px] font-semibold">
            ● Agente IA 24/7 En Línea
          </Badge>
          <span className="text-zinc-400 font-mono text-[11px] hidden sm:inline">{new Date().toLocaleDateString('es-CO', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
        </div>
      </div>

      {/* ─── Dedicated WhatsApp Admin Linking Banner (Render Microservice) ─── */}
      <WhatsAppQRButton variant="banner" />

      {/* ─── 4 Compact KPI Stat Pills ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
        {/* Conversaciones Hoy */}
        <div className="bg-white border border-zinc-200/90 rounded-xl p-3 shadow-xs space-y-1 hover:border-zinc-300 transition-all">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Conversaciones Hoy</span>
            <div className="p-1 rounded-md bg-blue-50 text-blue-600">
              <MessageSquare className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between pt-0.5">
            <span className="text-xl font-black text-zinc-900 font-mono">{MOCK_METRICS.todayConversations}</span>
            <span className="text-[11px] font-semibold text-emerald-600 flex items-center">
              +12% <TrendingUp className="h-2.5 w-2.5 ml-0.5" />
            </span>
          </div>
          <p className="text-[10px] text-zinc-400 truncate">Atención continua por WhatsApp</p>
        </div>

        {/* Leads Nuevos */}
        <div className="bg-white border border-zinc-200/90 rounded-xl p-3 shadow-xs space-y-1 hover:border-zinc-300 transition-all">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Leads Nuevos</span>
            <div className="p-1 rounded-md bg-emerald-50 text-emerald-600">
              <Users className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between pt-0.5">
            <span className="text-xl font-black text-zinc-900 font-mono">{MOCK_METRICS.newLeads}</span>
            <span className="text-[11px] font-semibold text-emerald-600">+5 en 24h</span>
          </div>
          <p className="text-[10px] text-zinc-400 truncate">Vehículos, motos e inmuebles</p>
        </div>

        {/* Tasa de Cierre */}
        <div className="bg-white border border-zinc-200/90 rounded-xl p-3 shadow-xs space-y-1 hover:border-zinc-300 transition-all">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Tasa de Conversión</span>
            <div className="p-1 rounded-md bg-purple-50 text-purple-600">
              <Target className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between pt-0.5">
            <span className="text-xl font-black text-zinc-900 font-mono">{MOCK_METRICS.closingRate}%</span>
            <span className="text-[11px] font-semibold text-emerald-600 flex items-center">
              +3.1% <TrendingUp className="h-2.5 w-2.5 ml-0.5" />
            </span>
          </div>
          <p className="text-[10px] text-zinc-400 truncate">Test drives y visitas agendadas</p>
        </div>

        {/* Tiempo de Respuesta */}
        <div className="bg-white border border-zinc-200/90 rounded-xl p-3 shadow-xs space-y-1 hover:border-zinc-300 transition-all">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Tiempo Respuesta</span>
            <div className="p-1 rounded-md bg-amber-50 text-amber-600">
              <Clock className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between pt-0.5">
            <span className="text-xl font-black text-zinc-900 font-mono">{MOCK_METRICS.avgResponseTime}</span>
            <span className="text-[11px] font-semibold text-zinc-500 font-mono">Inmediato</span>
          </div>
          <p className="text-[10px] text-zinc-400 truncate">Modelo Llama 3.3 / GPT-4o Mini</p>
        </div>
      </div>

      {/* ─── Compact Operational Breakdown ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 items-start">
        {/* Col 1 & 2: Recent Activity Table */}
        <div className="lg:col-span-2 bg-white border border-zinc-200/90 rounded-xl p-3.5 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-bold text-zinc-900 uppercase tracking-wide">Últimas Conversaciones Activas</h2>
              <span className="text-[10px] font-bold text-zinc-600 font-mono px-1.5 py-0.2 bg-zinc-100 rounded">3 en cola</span>
            </div>
            <Link href="/app/conversations" className="text-xs font-semibold text-zinc-600 hover:text-zinc-900 flex items-center gap-0.5">
              <span>Bandeja WhatsApp</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="space-y-2">
            {[
              { name: "Carlos Mendoza", phone: "+57 318 4509988", interest: "Toyota Fortuner GR-S 2024", time: "Hace 4m", status: "IA Respondiendo", badge: "bg-emerald-50 text-emerald-700 border-emerald-200" },
              { name: "Carolina Gómez", phone: "+57 301 2293400", interest: "Penthouse Alto Prado 240m²", time: "Hace 12m", status: "Cita Agendada", badge: "bg-blue-50 text-blue-700 border-blue-200" },
              { name: "David Silva", phone: "+57 320 8941122", interest: "Yamaha MT-09 SP 2024", time: "Hace 35m", status: "Interés Alto", badge: "bg-purple-50 text-purple-700 border-purple-200" },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-zinc-50/70 hover:bg-zinc-100/70 transition-colors text-xs border border-zinc-100">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-full bg-zinc-200 flex items-center justify-center text-[11px] font-bold text-zinc-700 shrink-0">
                    {item.name.slice(0, 2)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-zinc-900 truncate">{item.name}</span>
                      <span className="text-[10px] text-zinc-400 font-mono hidden sm:inline">{item.phone}</span>
                    </div>
                    <p className="text-[11px] text-zinc-500 truncate">{item.interest}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] text-zinc-400 font-mono hidden md:inline">{item.time}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${item.badge}`}>
                    {item.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Col 3: Quick Operational Links */}
        <div className="bg-white border border-zinc-200/90 rounded-xl p-3.5 shadow-xs space-y-3">
          <div className="pb-2 border-b border-zinc-100">
            <h2 className="text-xs font-bold text-zinc-900 uppercase tracking-wide">Acciones Inmediatas</h2>
          </div>

          <div className="space-y-1.5 text-xs">
            <Link 
              href="/app/inventory" 
              className="flex items-center justify-between p-2 rounded-lg bg-zinc-50 hover:bg-zinc-100 text-zinc-800 font-medium transition-colors border border-zinc-100"
            >
              <div className="flex items-center gap-2">
                <Car className="h-4 w-4 text-zinc-600" />
                <span>Gestionar Inventario (Supabase)</span>
              </div>
              <ArrowRight className="h-3.5 w-3.5 text-zinc-400" />
            </Link>

            <Link 
              href="/app/leads" 
              className="flex items-center justify-between p-2 rounded-lg bg-zinc-50 hover:bg-zinc-100 text-zinc-800 font-medium transition-colors border border-zinc-100"
            >
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-zinc-600" />
                <span>Ver Pipeline de Ventas</span>
              </div>
              <ArrowRight className="h-3.5 w-3.5 text-zinc-400" />
            </Link>

            <Link 
              href="/app/contracts" 
              className="flex items-center justify-between p-2 rounded-lg bg-zinc-50 hover:bg-zinc-100 text-zinc-800 font-medium transition-colors border border-zinc-100"
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-zinc-600" />
                <span>Contratos & Mandatos SHA-256</span>
              </div>
              <ArrowRight className="h-3.5 w-3.5 text-zinc-400" />
            </Link>

            <Link 
              href="/app/integrations" 
              className="flex items-center justify-between p-2 rounded-lg bg-zinc-50 hover:bg-zinc-100 text-zinc-800 font-medium transition-colors border border-zinc-100"
            >
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-emerald-600" />
                <span>Configuración de WhatsApp QR</span>
              </div>
              <ArrowRight className="h-3.5 w-3.5 text-zinc-400" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
