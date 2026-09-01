import React from 'react';
import { MOCK_METRICS } from '@/lib/mocks';
import { 
  Users, MessageSquare, Target, Clock, Calendar, CheckCircle2, 
  ArrowUpRight, Sparkles, TrendingUp, ShieldCheck, Phone, ArrowRight,
  Car, Home, Layers
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

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

        {/* Tasa de Conversión */}
        <div className="bg-white border border-zinc-200/90 rounded-xl p-3 shadow-xs space-y-1 hover:border-zinc-300 transition-all">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Conversión</span>
            <div className="p-1 rounded-md bg-purple-50 text-purple-600">
              <Target className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between pt-0.5">
            <span className="text-xl font-black text-zinc-900 font-mono">{MOCK_METRICS.conversionRate}</span>
            <span className="text-[11px] font-semibold text-emerald-600">+2.1%</span>
          </div>
          <p className="text-[10px] text-zinc-400 truncate">Efectividad de cierre</p>
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
            <span className="text-[11px] font-semibold text-zinc-500 font-mono">IA Instantánea</span>
          </div>
          <p className="text-[10px] text-zinc-400 truncate">Sin tiempos de espera</p>
        </div>
      </div>

      {/* ─── 2-Column Responsive Operational Grid ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 items-start">
        {/* Left: Desempeño Operativo (2 cols) */}
        <div className="lg:col-span-2 bg-white border border-zinc-200/90 rounded-xl p-3.5 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-zinc-700" />
              <h2 className="text-xs font-bold text-zinc-900 uppercase tracking-wide">Desempeño Operativo & Automatización</h2>
            </div>
            <Link href="/app/analytics" className="text-xs text-zinc-500 hover:text-zinc-900 flex items-center gap-0.5 font-medium">
              <span>Ver Métricas</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="space-y-2.5 text-xs">
            {/* Metric 1 */}
            <div className="p-2.5 rounded-lg bg-zinc-50 border border-zinc-200/60 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-md bg-blue-100/80 text-blue-700 shrink-0">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-bold text-zinc-800">Atendidas por IA Automática</p>
                  <p className="text-[11px] text-zinc-500">Resueltas 100% sin intervención humana</p>
                </div>
              </div>
              <div className="text-right">
                <span className="font-bold font-mono text-zinc-900 text-sm">{MOCK_METRICS.aiHandled}</span>
                <p className="text-[10px] text-emerald-600 font-semibold">82% del total</p>
              </div>
            </div>

            {/* Metric 2 */}
            <div className="p-2.5 rounded-lg bg-zinc-50 border border-zinc-200/60 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-md bg-amber-100/80 text-amber-700 shrink-0">
                  <Users className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-bold text-zinc-800">Transferidas a Asesor Humano</p>
                  <p className="text-[11px] text-zinc-500">Cierres de corretaje y negociación personalizada</p>
                </div>
              </div>
              <div className="text-right">
                <span className="font-bold font-mono text-zinc-900 text-sm">{MOCK_METRICS.humanTransferred}</span>
                <p className="text-[10px] text-zinc-500 font-semibold">18% del total</p>
              </div>
            </div>

            {/* Metric 3 */}
            <div className="p-2.5 rounded-lg bg-zinc-50 border border-zinc-200/60 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-md bg-purple-100/80 text-purple-700 shrink-0">
                  <Calendar className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-bold text-zinc-800">Citas & Test Drives Programados</p>
                  <p className="text-[11px] text-zinc-500">Visitas confirmadas en vitrina e inmuebles</p>
                </div>
              </div>
              <div className="text-right">
                <span className="font-bold font-mono text-zinc-900 text-sm">{MOCK_METRICS.appointments}</span>
                <p className="text-[10px] text-purple-600 font-semibold">Hoy</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Acciones Rápidas & Estado del Pipeline (1 col) */}
        <div className="bg-white border border-zinc-200/90 rounded-xl p-3.5 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
            <h2 className="text-xs font-bold text-zinc-900 uppercase tracking-wide">Acceso a Módulos</h2>
            <Badge variant="outline" className="text-[10px] bg-zinc-100 text-zinc-600 font-semibold">
              Directos
            </Badge>
          </div>

          <div className="space-y-1.5 text-xs">
            <Link 
              href="/app/leads" 
              className="flex items-center justify-between p-2 rounded-lg hover:bg-zinc-50 border border-transparent hover:border-zinc-200 transition-all"
            >
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-purple-500" />
                <span className="font-semibold text-zinc-800">Pipeline de Leads</span>
              </div>
              <span className="text-[11px] font-mono text-zinc-500">{MOCK_METRICS.qualifiedLeads} Activos &rarr;</span>
            </Link>

            <Link 
              href="/app/inventory" 
              className="flex items-center justify-between p-2 rounded-lg hover:bg-zinc-50 border border-transparent hover:border-zinc-200 transition-all"
            >
              <div className="flex items-center gap-2">
                <Car className="h-4 w-4 text-blue-500" />
                <span className="font-semibold text-zinc-800">Inventario Central</span>
              </div>
              <span className="text-[11px] font-mono text-zinc-500">Gestión &rarr;</span>
            </Link>

            <Link 
              href="/app/contracts" 
              className="flex items-center justify-between p-2 rounded-lg hover:bg-zinc-50 border border-transparent hover:border-zinc-200 transition-all"
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                <span className="font-semibold text-zinc-800">Contratos Digitales</span>
              </div>
              <span className="text-[11px] font-mono text-zinc-500">SHA-256 &rarr;</span>
            </Link>

            <Link 
              href="/app/conversations" 
              className="flex items-center justify-between p-2 rounded-lg hover:bg-zinc-50 border border-transparent hover:border-zinc-200 transition-all"
            >
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-indigo-500" />
                <span className="font-semibold text-zinc-800">Bandeja WhatsApp</span>
              </div>
              <span className="text-[11px] font-mono text-zinc-500">En Vivo &rarr;</span>
            </Link>
          </div>

          <div className="pt-2 border-t border-zinc-100">
            <div className="p-2.5 rounded-lg bg-zinc-900 text-white space-y-1">
              <p className="text-[11px] font-bold">Portal Público Activo</p>
              <p className="text-[10px] text-zinc-400">yjdtrinova.neurolabs.com.co</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


