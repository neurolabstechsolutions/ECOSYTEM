import { MOCK_METRICS } from '@/lib/mocks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users, MessageSquare, Target, Clock, Calendar, CheckCircle2 } from 'lucide-react'

export default async function DashboardPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-8 fade-in">
      <div>
        <h1 className="text-4xl font-black tracking-tight text-black font-serif font-serif">Resumen General</h1>
        <p className="text-slate-500 mt-1">Métricas en tiempo real de tu organización.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Conversaciones Hoy */}
        <Card className="bg-slate-50 border-slate-200 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              Conversaciones Hoy
            </CardTitle>
            <MessageSquare className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 font-serif">{MOCK_METRICS.todayConversations}</div>
            <p className="text-xs text-slate-400 mt-1">
              <span className="text-emerald-400">+12%</span> respecto a ayer
            </p>
          </CardContent>
        </Card>

        {/* Leads Nuevos */}
        <Card className="bg-slate-50 border-slate-200 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              Leads Nuevos
            </CardTitle>
            <Users className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 font-serif">{MOCK_METRICS.newLeads}</div>
            <p className="text-xs text-slate-400 mt-1">
              <span className="text-emerald-400">+5</span> en las últimas 24h
            </p>
          </CardContent>
        </Card>

        {/* Tasa de Conversión */}
        <Card className="bg-slate-50 border-slate-200 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              Tasa de Conversión
            </CardTitle>
            <Target className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 font-serif">{MOCK_METRICS.conversionRate}</div>
            <p className="text-xs text-slate-400 mt-1">
              <span className="text-emerald-400">+2.1%</span> vs semana anterior
            </p>
          </CardContent>
        </Card>

        {/* Tiempo de Respuesta */}
        <Card className="bg-slate-50 border-slate-200 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              Tiempo de Respuesta
            </CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 font-serif">{MOCK_METRICS.avgResponseTime}</div>
            <p className="text-xs text-slate-400 mt-1">
              Promedio de atención por Agente IA
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 bg-slate-50 border-slate-200 shadow-lg">
          <CardHeader>
            <CardTitle className="text-slate-900 font-serif">Desempeño Operativo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="flex items-center">
              <div className="flex items-center justify-center h-10 w-10 rounded-full bg-blue-900/30 text-blue-500 border border-blue-800">
                <CheckCircle2 size={20} />
              </div>
              <div className="ml-4 space-y-1">
                <p className="text-sm font-medium text-slate-800">Atendidas por IA Automática</p>
                <p className="text-xs text-slate-400">Completadas sin intervención humana.</p>
              </div>
              <div className="ml-auto font-medium text-slate-900 font-serif">
                {MOCK_METRICS.aiHandled} consultas
              </div>
            </div>
            
            <div className="flex items-center">
              <div className="flex items-center justify-center h-10 w-10 rounded-full bg-amber-900/30 text-amber-500 border border-amber-800">
                <Users size={20} />
              </div>
              <div className="ml-4 space-y-1">
                <p className="text-sm font-medium text-slate-800">Transferidas a Asesor (Humano)</p>
                <p className="text-xs text-slate-400">Requieren cierre manual o negociación.</p>
              </div>
              <div className="ml-auto font-medium text-slate-900 font-serif">
                {MOCK_METRICS.humanTransferred} consultas
              </div>
            </div>

            <div className="flex items-center">
              <div className="flex items-center justify-center h-10 w-10 rounded-full bg-purple-900/30 text-purple-500 border border-purple-800">
                <Calendar size={20} />
              </div>
              <div className="ml-4 space-y-1">
                <p className="text-sm font-medium text-slate-800">Citas Agendadas Hoy</p>
                <p className="text-xs text-slate-400">Visitantes listos para el concesionario.</p>
              </div>
              <div className="ml-auto font-medium text-slate-900 font-serif">
                {MOCK_METRICS.appointments} visitas
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3 bg-slate-50 border-slate-200 shadow-lg">
          <CardHeader>
            <CardTitle className="text-slate-900 font-serif">Estado de Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Calificados de alta intención</span>
                <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 hover:bg-emerald-500/30">{MOCK_METRICS.qualifiedLeads}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Pendientes de seguimiento</span>
                <Badge className="bg-amber-500/20 text-amber-400 border border-amber-500/50 hover:bg-amber-500/30">12</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Conversaciones huérfanas</span>
                <Badge className="bg-red-500/20 text-red-400 border border-red-500/50 hover:bg-red-500/30">3</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


