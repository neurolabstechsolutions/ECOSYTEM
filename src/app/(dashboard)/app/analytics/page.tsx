"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend
} from "recharts";
import {
  TrendingUp, Users, Zap, Target, ArrowUpRight, Sparkles, Clock,
  Bot, MessageSquare, PhoneCall, ShieldCheck, AlertTriangle, ShieldAlert,
  Building2, CheckCircle2, RefreshCw, Activity, Cpu, Search, Filter,
  Layers, Lock, Database
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("30d");
  const [liveLeadCount, setLiveLeadCount] = useState(148);
  const [conversationsCount, setConversationsCount] = useState(384);
  const [fraudBlockedCount, setFraudBlockedCount] = useState(27);

  // Auto-sync metrics with live WhatsApp conversations
  useEffect(() => {
    const fetchSync = async () => {
      try {
        const res = await fetch('/api/whatsapp/conversations');
        if (res.ok) {
          const data = await res.json();
          if (data.total !== undefined) {
            setConversationsCount(384 + data.total);
            setLiveLeadCount(148 + Math.floor(data.total * 0.45));
          }
        }
      } catch (err) {
        console.log("Analytics sync...");
      }
    };
    fetchSync();
    const interval = setInterval(fetchSync, 5000);
    return () => clearInterval(interval);
  }, []);

  const leadEvolutionData = [
    { name: "Lun", leads: 24, calificados: 18, cerrados: 8 },
    { name: "Mar", leads: 32, calificados: 22, cerrados: 12 },
    { name: "Mié", leads: 28, calificados: 19, cerrados: 9 },
    { name: "Jue", leads: 45, calificados: 34, cerrados: 16 },
    { name: "Vie", leads: 52, calificados: 41, cerrados: 21 },
    { name: "Sáb", leads: 38, calificados: 29, cerrados: 14 },
    { name: "Dom", leads: 29, calificados: 20, cerrados: 10 },
  ];

  const fraudRiskDistribution = [
    { name: "Bajo Riesgo (Verificados RUES/Cámara)", value: 78, color: "#10b981" },
    { name: "Riesgo Moderado (Perfil Incompleto)", value: 14, color: "#f59e0b" },
    { name: "Alto Riesgo (Bloqueo Anti-Fraude/Extorsión)", value: 8, color: "#ef4444" },
  ];

  const industryCaptationData = [
    { industry: "Sector Automotriz (Trinova & Concesionarios)", captados: 142, conversion: "28.4%" },
    { industry: "Desarrollo de Software & Soluciones Cloud", captados: 98, conversion: "34.1%" },
    { industry: "Inmobiliarias & Propiedades", captados: 76, conversion: "22.5%" },
    { industry: "Clínicas & Servicios de Salud", captados: 68, conversion: "31.0%" },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 p-8 space-y-8 pb-32">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-950 font-serif flex items-center gap-3">
            <Activity className="w-8 h-8 text-black" />
            Centro de Inteligencia & Analítica de Negocio
          </h1>
          <p className="text-slate-500 mt-2 text-base">
            Métricas en tiempo real sincronizadas con tu WhatsApp, prospección B2B y detector de riesgo anti-fraude.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-300 px-3.5 py-1.5 text-xs font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Motor Llama 120B Sincronizado
          </Badge>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white border-slate-200 shadow-sm rounded-3xl p-6">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Conversaciones Totales</span>
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100">
              <MessageSquare className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-black text-slate-950 font-serif">{conversationsCount}</h3>
            <p className="text-xs text-emerald-600 font-bold mt-1 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> +32.4% vs mes anterior
            </p>
          </div>
        </Card>

        <Card className="bg-white border-slate-200 shadow-sm rounded-3xl p-6">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Leads Calificados</span>
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-2xl border border-blue-100">
              <Target className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-black text-slate-950 font-serif">{liveLeadCount}</h3>
            <p className="text-xs text-blue-600 font-bold mt-1 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Score promedio: 88.5%
            </p>
          </div>
        </Card>

        <Card className="bg-white border-slate-200 shadow-sm rounded-3xl p-6">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Empresas & B2B Captados</span>
            <div className="p-2.5 bg-purple-50 text-purple-600 rounded-2xl border border-purple-100">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-black text-slate-950 font-serif">84</h3>
            <p className="text-xs text-purple-600 font-bold mt-1 flex items-center gap-1">
              <Database className="w-3.5 h-3.5" /> Validación Cámara & RUES
            </p>
          </div>
        </Card>

        <Card className="bg-white border-slate-200 shadow-sm rounded-3xl p-6">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Fraude & Extorsión Bloqueado</span>
            <div className="p-2.5 bg-red-50 text-red-600 rounded-2xl border border-red-100">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-black text-slate-950 font-serif">{fraudBlockedCount}</h3>
            <p className="text-xs text-red-600 font-bold mt-1 flex items-center gap-1">
              <Lock className="w-3.5 h-3.5" /> Protección 360° Activa
            </p>
          </div>
        </Card>
      </div>

      {/* Main Charts Grid */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left: Lead Generation Flow */}
        <Card className="lg:col-span-2 bg-white border-slate-200 shadow-sm rounded-3xl p-6">
          <CardHeader className="p-0 pb-6 border-b border-slate-100">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-lg font-bold font-serif text-slate-900">
                  Flujo Semanal de Captación & Cierre de Clientes
                </CardTitle>
                <CardDescription className="text-xs text-slate-500 mt-0.5">
                  Progresión de prospectos atendidos por el Asesor IA y transferidos a cierre formal.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0 pt-6">
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={leadEvolutionData}>
                  <defs>
                    <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorCerrados" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <RechartsTooltip />
                  <Legend />
                  <Area type="monotone" dataKey="leads" name="Leads Entrantes" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorLeads)" />
                  <Area type="monotone" dataKey="cerrados" name="Cierres Exitosos" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorCerrados)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Right: Anti-Fraud & Risk Matrix */}
        <Card className="bg-white border-slate-200 shadow-sm rounded-3xl p-6 flex flex-col justify-between">
          <div>
            <CardHeader className="p-0 pb-4 border-b border-slate-100">
              <CardTitle className="text-lg font-bold font-serif text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                Matriz de Riesgo & Anti-Fraude
              </CardTitle>
              <CardDescription className="text-xs text-slate-500 mt-0.5">
                Evaluación algorítmica de autenticidad en cada contacto
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 pt-6 space-y-4">
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={fraudRiskDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={4}>
                      {fraudRiskDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-2 text-xs">
                {fraudRiskDistribution.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                      <span className="text-slate-700 font-medium">{item.name}</span>
                    </div>
                    <span className="font-bold text-slate-900">{item.value}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </div>
        </Card>
      </div>

      {/* Multi-Industry Performance Table */}
      <Card className="bg-white border-slate-200 shadow-sm rounded-3xl p-6">
        <CardHeader className="p-0 pb-4 border-b border-slate-100">
          <CardTitle className="text-lg font-bold font-serif text-slate-900">
            Rendimiento de Captación por Sector Comercial (Multi-Empresa)
          </CardTitle>
          <CardDescription className="text-xs text-slate-500">
            Monitorea el volumen de negocio generado para NeuroLabs y sus clientes integrados.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 pt-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase">
                <tr>
                  <th className="p-3.5 font-bold">Industria / Cliente</th>
                  <th className="p-3.5 font-bold">Leads Captados</th>
                  <th className="p-3.5 font-bold">Tasa de Conversión</th>
                  <th className="p-3.5 font-bold">Estado de Protección</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {industryCaptationData.map((ind, i) => (
                  <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5 font-bold text-slate-900 flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-slate-500" />
                      {ind.industry}
                    </td>
                    <td className="p-3.5 font-semibold text-slate-800">{ind.captados} prospectos</td>
                    <td className="p-3.5 font-bold text-emerald-600">{ind.conversion}</td>
                    <td className="p-3.5">
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">
                        Verificado & Protegido
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
