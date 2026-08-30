"use client";

import React, { useState, useMemo } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
  ComposedChart,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Zap,
  Target,
  ArrowUpRight,
  Sparkles,
  Clock,
  Bot,
  MessageSquare,
  PhoneCall,
  Mail,
  Activity,
  Download,
  Share2,
  Calendar,
  Filter,
  CheckCircle2,
  Cpu,
  BarChart3,
  Flame,
  ShieldCheck,
  RefreshCw,
  Sliders,
  Globe2,
  ChevronRight,
  Lightbulb,
  Radio,
} from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

// ==========================================
// MOCK DATASETS & ANALYTICS MODEL
// ==========================================

// Timeline Data: Revenue, ROI %, Lead Volume, and AI Latency (ms)
const monthlyTrendsData = [
  { month: "Jan", leads: 4200, qualified: 1150, revenue: 142000, aiCost: 3200, roi: 443, latency: 580, conversion: 14.2 },
  { month: "Feb", leads: 5100, qualified: 1420, revenue: 178000, aiCost: 3400, roi: 523, latency: 520, conversion: 15.1 },
  { month: "Mar", leads: 6400, qualified: 1890, revenue: 215000, aiCost: 3800, roi: 565, latency: 490, conversion: 16.4 },
  { month: "Apr", leads: 7900, qualified: 2310, revenue: 260000, aiCost: 4100, roi: 634, latency: 460, conversion: 17.0 },
  { month: "May", leads: 9800, qualified: 2950, revenue: 310000, aiCost: 4400, roi: 704, latency: 430, conversion: 17.9 },
  { month: "Jun", leads: 11600, qualified: 3480, revenue: 368000, aiCost: 4650, roi: 791, latency: 410, conversion: 18.2 },
  { month: "Jul", leads: 13200, qualified: 3910, revenue: 412000, aiCost: 4850, roi: 849, latency: 395, conversion: 18.5 },
  { month: "Aug", leads: 14892, qualified: 4420, revenue: 485000, aiCost: 5100, roi: 950, latency: 385, conversion: 19.1 },
];

const daily30DaysData = [
  { day: "D1", leads: 380, qualified: 110, latency: 440, bookings: 22, roiDaily: 12400 },
  { day: "D4", leads: 410, qualified: 125, latency: 420, bookings: 27, roiDaily: 14100 },
  { day: "D7", leads: 460, qualified: 140, latency: 410, bookings: 31, roiDaily: 16200 },
  { day: "D10", leads: 490, qualified: 155, latency: 395, bookings: 34, roiDaily: 17800 },
  { day: "D13", leads: 520, qualified: 168, latency: 390, bookings: 38, roiDaily: 19500 },
  { day: "D16", leads: 580, qualified: 182, latency: 385, bookings: 42, roiDaily: 21200 },
  { day: "D19", leads: 610, qualified: 195, latency: 380, bookings: 46, roiDaily: 23400 },
  { day: "D22", leads: 645, qualified: 210, latency: 375, bookings: 49, roiDaily: 24800 },
  { day: "D25", leads: 690, qualified: 228, latency: 370, bookings: 53, roiDaily: 27100 },
  { day: "D28", leads: 740, qualified: 245, latency: 365, bookings: 58, roiDaily: 29800 },
  { day: "D30", leads: 785, qualified: 262, latency: 360, bookings: 62, roiDaily: 32000 },
];

// Lead Volume by Acquisition Channels
const channelBreakdown = [
  { name: "WhatsApp Business AI", value: 7743, percentage: 52, color: "#10B981", growth: "+34.2%" },
  { name: "Web Conversational Widget", value: 3872, percentage: 26, color: "#6366F1", growth: "+19.8%" },
  { name: "Autonomous Inbound Voice AI", value: 2085, percentage: 14, color: "#06B6D4", growth: "+44.1%" },
  { name: "SDR Email Copilot", value: 1192, percentage: 8, color: "#F59E0B", growth: "+12.5%" },
];

// AI Latency Distribution by Hour (Traffic Load vs Latency)
const latencyHourlyData = [
  { hour: "00:00", p50: 310, p95: 520, reqPerMin: 140 },
  { hour: "03:00", p50: 290, p95: 480, reqPerMin: 85 },
  { hour: "06:00", p50: 320, p95: 540, reqPerMin: 220 },
  { hour: "09:00", p50: 380, p95: 690, reqPerMin: 890 },
  { hour: "12:00", p50: 410, p95: 750, reqPerMin: 1150 },
  { hour: "15:00", p50: 420, p95: 780, reqPerMin: 1320 },
  { hour: "18:00", p50: 390, p95: 710, reqPerMin: 980 },
  { hour: "21:00", p50: 340, p95: 590, reqPerMin: 450 },
];

// Conversion Funnel Stages
const conversionFunnelData = [
  { stage: "1. Inbound Inquiries", count: 24500, dropoff: "0%", rate: "100%", color: "#6366F1" },
  { stage: "2. AI Engaged (<1s)", count: 23150, dropoff: "-5.5%", rate: "94.5%", color: "#8B5CF6" },
  { stage: "3. Qualified Leads (MQL)", count: 14892, dropoff: "-35.7%", rate: "60.8%", color: "#06B6D4" },
  { stage: "4. Demo / Meeting Booked", count: 4120, dropoff: "-72.3%", rate: "27.6%", color: "#10B981" },
  { stage: "5. Closed Deals (Won)", count: 1435, dropoff: "-65.2%", rate: "9.6%", color: "#F59E0B" },
];

// High Value Recent AI Conversions / Live Feed
const recentConversions = [
  {
    id: "LEAD-9428",
    leadName: "Valentina Morales",
    company: "Fintech Horizon Corp",
    channel: "WhatsApp Business AI",
    latency: "340ms",
    intentScore: 98,
    dealEstimate: "$48,000",
    status: "Demo Scheduled",
    time: "2m ago",
  },
  {
    id: "LEAD-9427",
    leadName: "Marcus Vance",
    company: "Nexus Logistics Global",
    channel: "Web Widget",
    latency: "395ms",
    intentScore: 94,
    dealEstimate: "$32,500",
    status: "Contract Sent",
    time: "7m ago",
  },
  {
    id: "LEAD-9426",
    leadName: "Elena Rostova",
    company: "AeroTech Dynamics",
    channel: "Inbound Voice AI",
    latency: "510ms",
    intentScore: 91,
    dealEstimate: "$75,000",
    status: "Qualified SQL",
    time: "14m ago",
  },
  {
    id: "LEAD-9425",
    leadName: "David Chen",
    company: "Apex Cloud Systems",
    channel: "WhatsApp Business AI",
    latency: "320ms",
    intentScore: 99,
    dealEstimate: "$110,000",
    status: "Demo Scheduled",
    time: "21m ago",
  },
];

// Persona A/B Test Variations
const abTestResults = [
  { variant: "Persona Alpha (Direct Challenger)", conversion: "21.4%", avgLatency: "375ms", csat: "4.9/5", roiLift: "+32%" },
  { variant: "Persona Beta (Consultative Expert)", conversion: "18.6%", avgLatency: "410ms", csat: "4.7/5", roiLift: "+19%" },
  { variant: "Persona Gamma (Friendly Empath)", conversion: "15.2%", avgLatency: "440ms", csat: "4.5/5", roiLift: "+8%" },
];

// ==========================================
// CUSTOM RECHARTS TOOLTIP (GLASSMORPHIC)
// ==========================================
const GlassTooltip = ({ active, payload, label, prefix = "", suffix = "" }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-slate-700/80 bg-white p-3 shadow-md  transition-all">
        <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</p>
        <div className="space-y-1">
          {payload.map((item: any, idx: number) => (
            <div key={idx} className="flex items-center gap-2 text-xs">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color || item.fill }} />
              <span className="text-slate-300 font-medium">{item.name}:</span>
              <span className="font-bold text-slate-900 font-mono">
                {prefix}
                {typeof item.value === "number" ? item.value.toLocaleString() : item.value}
                {suffix}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export default function AnalyticsDashboardPage() {
  // Filters & State
  const [timeRange, setTimeRange] = useState<string>("30d");
  const [activeChannel, setActiveChannel] = useState<string>("all");
  const [isLiveSyncing, setIsLiveSyncing] = useState<boolean>(true);
  const [simLeads, setSimLeads] = useState<number>(15000);
  const [simDealValue, setSimDealValue] = useState<number>(4500);
  const [simResolutionRate, setSimResolutionRate] = useState<number>(88);

  // Live Real-Time Socket Connection Metrics from Render Bridge
  const [liveWhatsAppCount, setLiveWhatsAppCount] = useState<number>(7743);
  const [connectedNumber, setConnectedNumber] = useState<string>("+57 300 5765530");
  const [bridgeStatus, setBridgeStatus] = useState<string>("Online (Socket Activo)");

  React.useEffect(() => {
    const syncRealData = async () => {
      try {
        const res = await fetch('/api/whatsapp/conversations');
        if (res.ok) {
          const data = await res.json();
          if (data.total !== undefined) {
            setLiveWhatsAppCount(7743 + data.total);
            if (data.phone) setConnectedNumber(`+${data.phone}`);
            if (data.status) setBridgeStatus(data.status === 'CONNECTED' ? 'Online (Socket Activo)' : 'Conectando...');
          }
        }
      } catch (e) {
        // Fallback
      }
    };
    syncRealData();
    const interval = setInterval(syncRealData, 4000);
    return () => clearInterval(interval);
  }, []);

  // Dynamic ROI Simulator Calculations
  const calculatedSavings = useMemo(() => {
    // Human cost per lead handle ~ $4.80 vs AI handle ~ $0.22 + base platform
    const humanCost = simLeads * 4.8;
    const aiCost = simLeads * 0.22 + 499;
    const rawSavings = Math.max(0, humanCost - aiCost);
    // Estimated converted pipeline
    const qualifiedLeads = Math.round(simLeads * (simResolutionRate / 100) * 0.28);
    const estimatedDeals = Math.round(qualifiedLeads * 0.18);
    const addedRevenue = estimatedDeals * simDealValue;
    const totalEconomicValue = rawSavings + addedRevenue;
    const calculatedRoiPercentage = Math.round((totalEconomicValue / aiCost) * 100);

    return {
      humanCost: Math.round(humanCost),
      aiCost: Math.round(aiCost),
      rawSavings: Math.round(rawSavings),
      addedRevenue,
      totalEconomicValue,
      calculatedRoiPercentage,
      estimatedDeals,
    };
  }, [simLeads, simDealValue, simResolutionRate]);

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-cyan-500/30 selection:text-cyan-900">
      {/* Dynamic Background Glow Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 left-1/4 h-96 w-96 rounded-full bg-violet-600/10 blur-[130px]" />
        <div className="absolute top-1/3 right-10 h-96 w-96 rounded-full bg-cyan-500/10 blur-[140px]" />
        <div className="absolute -bottom-20 left-1/3 h-96 w-96 rounded-full bg-emerald-500/10 blur-[150px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        
        {/* ======================================================== */}
        {/* HEADER & CONTROLS */}
        {/* ======================================================== */}
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-slate-200/60 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Badge variant="outline" className="border-cyan-500/30 bg-cyan-500/10 text-cyan-400 gap-1.5 py-0.5 px-2.5 backdrop-blur-md">
                <Radio className="h-3 w-3 animate-pulse text-cyan-400" />
                Live Telemetry 2.4 GHz
              </Badge>
              <span className="text-xs text-slate-400">|</span>
              <span className="text-xs text-slate-400 font-mono">Synced: Just now (3ms)</span>
            </div>
            <h1 className="text-4xl font-black tracking-tight text-black font-serif sm:text-4xl flex items-center gap-3">
              Analytics & Intelligence Hub
              <span className="inline-flex items-center justify-center p-1 rounded-lg bg-gradient-to-tr from-cyan-500/20 to-violet-500/20 border border-white/10">
                <Sparkles className="h-5 w-5 text-cyan-300" />
              </span>
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Real-time enterprise telemetry monitoring ROI multipliers, lead pipeline velocity, and AI latency.
            </p>
          </div>

          {/* Quick Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Timeframe Select */}
            <Select value={timeRange} onValueChange={(val) => val && setTimeRange(val)}>
              <SelectTrigger className="w-[140px] bg-slate-50 border-slate-700/70 text-slate-800 backdrop-blur-md text-xs h-9">
                <Calendar className="mr-1.5 h-3.5 w-3.5 text-cyan-400" />
                <SelectValue placeholder="Select Range" />
              </SelectTrigger>
              <SelectContent className="bg-slate-50 border-slate-200 text-slate-800">
                <SelectItem value="7d">Last 7 Days</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
                <SelectItem value="90d">Last Quarter</SelectItem>
                <SelectItem value="ytd">Year to Date</SelectItem>
              </SelectContent>
            </Select>

            {/* Channel Filter */}
            <Select value={activeChannel} onValueChange={(val) => val && setActiveChannel(val)}>
              <SelectTrigger className="w-[170px] bg-slate-50 border-slate-700/70 text-slate-800 backdrop-blur-md text-xs h-9">
                <Filter className="mr-1.5 h-3.5 w-3.5 text-violet-400" />
                <SelectValue placeholder="All Channels" />
              </SelectTrigger>
              <SelectContent className="bg-slate-50 border-slate-200 text-slate-800">
                <SelectItem value="all">Omnichannel (All)</SelectItem>
                <SelectItem value="whatsapp">WhatsApp Business AI</SelectItem>
                <SelectItem value="web">Web Chat Widget</SelectItem>
                <SelectItem value="voice">Inbound Voice AI</SelectItem>
                <SelectItem value="email">SDR Email Copilot</SelectItem>
              </SelectContent>
            </Select>

            {/* Live Sync Toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsLiveSyncing(!isLiveSyncing)}
              className={`h-9 border-slate-700/70 text-xs gap-1.5 transition-all ${
                isLiveSyncing
                  ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/20"
                  : "bg-slate-50 text-slate-400 hover:text-slate-900"
              }`}
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLiveSyncing ? "animate-spin text-emerald-400" : ""}`} />
              {isLiveSyncing ? "Live Stream ON" : "Paused"}
            </Button>

            {/* Export Report */}
            <Button size="sm" className="h-9 bg-gradient-to-r from-cyan-500 to-violet-600 text-slate-900 font-medium text-xs hover:from-cyan-400 hover:to-violet-500 shadow-lg shadow-cyan-500/20 border border-white/10 gap-1.5">
              <Download className="h-3.5 w-3.5" />
              Export Report
            </Button>
          </div>
        </header>

        {/* ======================================================== */}
        {/* EXECUTIVE 4-PILLAR KPI CARDS (GLOW + GLASS) */}
        {/* ======================================================== */}
        <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          
          {/* Card 1: ROI Multiplier */}
          <Card className="relative overflow-hidden border-slate-200 bg-white shadow-sm transition-all duration-300 hover:border-violet-500/50 hover:shadow-violet-500/10 group">
            <div className="absolute top-0 right-0 h-28 w-28 translate-x-8 -translate-y-8 rounded-full bg-violet-500/10 blur-2xl group-hover:bg-violet-500/20 transition-all" />
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Return on Investment</span>
              <div className="rounded-lg bg-violet-500/10 p-2 text-violet-400 border border-violet-500/20">
                <DollarSign className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline justify-between">
                <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tracking-tight">$485,000</div>
                <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 gap-0.5 text-xs font-semibold">
                  <ArrowUpRight className="h-3 w-3" />
                  +950% ROI
                </Badge>
              </div>
              <p className="mt-2 text-xs text-slate-400 flex items-center justify-between">
                <span>AI Operating Cost: <strong className="text-slate-300 font-mono">$5,100/mo</strong></span>
                <span className="text-emerald-400 font-medium">9.5x Multiplier</span>
              </p>
              <div className="mt-3">
                <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                  <span>Human SDR Eq. Savings</span>
                  <span className="text-slate-800 font-mono">$42,900/mo</span>
                </div>
                <Progress value={92} className="h-1.5 bg-white [&>div]:bg-gradient-to-r [&>div]:from-violet-500 [&>div]:to-indigo-400" />
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Lead Volume */}
          <Card className="relative overflow-hidden border-slate-200 bg-white shadow-sm transition-all duration-300 hover:border-cyan-500/50 hover:shadow-cyan-500/10 group">
            <div className="absolute top-0 right-0 h-28 w-28 translate-x-8 -translate-y-8 rounded-full bg-cyan-500/10 blur-2xl group-hover:bg-cyan-500/20 transition-all" />
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Lead Volume</span>
              <div className="rounded-lg bg-cyan-500/10 p-2 text-cyan-400 border border-cyan-500/20">
                <Users className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline justify-between">
                <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tracking-tight">14,892</div>
                <Badge className="bg-cyan-500/15 text-cyan-400 border-cyan-500/30 gap-0.5 text-xs font-semibold">
                  <ArrowUpRight className="h-3 w-3" />
                  +28.4% MoM
                </Badge>
              </div>
              <p className="mt-2 text-xs text-slate-400 flex items-center justify-between">
                <span>AI Qualified (MQL): <strong className="text-slate-300 font-mono">4,420 (29.6%)</strong></span>
                <span className="text-cyan-400 font-medium">496 leads/day</span>
              </p>
              <div className="mt-3">
                <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                  <span>WhatsApp Dominance</span>
                  <span className="text-slate-800 font-mono">52% Share</span>
                </div>
                <Progress value={52} className="h-1.5 bg-white [&>div]:bg-gradient-to-r [&>div]:from-cyan-500 [&>div]:to-blue-400" />
              </div>
            </CardContent>
          </Card>

          {/* Card 3: AI Response Times */}
          <Card className="relative overflow-hidden border-slate-200 bg-white shadow-sm transition-all duration-300 hover:border-emerald-500/50 hover:shadow-emerald-500/10 group">
            <div className="absolute top-0 right-0 h-28 w-28 translate-x-8 -translate-y-8 rounded-full bg-emerald-500/10 blur-2xl group-hover:bg-emerald-500/20 transition-all" />
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">AI Response Latency</span>
              <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-400 border border-emerald-500/20">
                <Clock className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline justify-between">
                <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tracking-tight">385ms</div>
                <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 gap-0.5 text-xs font-semibold">
                  <Zap className="h-3 w-3" />
                  -85ms Faster
                </Badge>
              </div>
              <p className="mt-2 text-xs text-slate-400 flex items-center justify-between">
                <span>p95 Latency: <strong className="text-slate-300 font-mono">710ms</strong></span>
                <span className="text-emerald-400 font-medium">99.98% Uptime</span>
              </p>
              <div className="mt-3">
                <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                  <span>Sub-second Resolution</span>
                  <span className="text-slate-800 font-mono">94.8%</span>
                </div>
                <Progress value={94.8} className="h-1.5 bg-white [&>div]:bg-gradient-to-r [&>div]:from-emerald-500 [&>div]:to-teal-400" />
              </div>
            </CardContent>
          </Card>

          {/* Card 4: Conversion Rates */}
          <Card className="relative overflow-hidden border-slate-200 bg-white shadow-sm transition-all duration-300 hover:border-amber-500/50 hover:shadow-amber-500/10 group">
            <div className="absolute top-0 right-0 h-28 w-28 translate-x-8 -translate-y-8 rounded-full bg-amber-500/10 blur-2xl group-hover:bg-amber-500/20 transition-all" />
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Conversion Rate (MQL to Demo)</span>
              <div className="rounded-lg bg-amber-500/10 p-2 text-amber-400 border border-amber-500/20">
                <Target className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline justify-between">
                <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tracking-tight">19.1%</div>
                <Badge className="bg-amber-500/15 text-amber-400 border-amber-500/30 gap-0.5 text-xs font-semibold">
                  <ArrowUpRight className="h-3 w-3" />
                  +4.2% vs Base
                </Badge>
              </div>
              <p className="mt-2 text-xs text-slate-400 flex items-center justify-between">
                <span>Demo to Close: <strong className="text-slate-300 font-mono">34.8%</strong></span>
                <span className="text-amber-400 font-medium">1,435 Won Deals</span>
              </p>
              <div className="mt-3">
                <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                  <span>Top Persona (Alpha)</span>
                  <span className="text-slate-800 font-mono">21.4% Rate</span>
                </div>
                <Progress value={68} className="h-1.5 bg-white [&>div]:bg-gradient-to-r [&>div]:from-amber-500 [&>div]:to-orange-400" />
              </div>
            </CardContent>
          </Card>

        </section>

        {/* ======================================================== */}
        {/* SMART AI INSIGHTS NOTIFICATION BANNER */}
        {/* ======================================================== */}
        <div className="rounded-2xl border border-cyan-500/30 bg-gradient-to-r from-cyan-50 via-white to-violet-50 p-4 sm:p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="rounded-xl bg-gradient-to-br from-cyan-500 to-violet-600 p-2.5 shadow-sm text-white shrink-0">
              <Lightbulb className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-slate-900 tracking-wide">Autonomous AI Diagnostic & Copilot Insights</h4>
                <Badge className="bg-cyan-500/20 text-cyan-700 border-cyan-400/30 text-[10px] py-0 px-2 font-mono">NEW</Badge>
              </div>
              <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                WhatsApp AI response latency dropped to <span className="text-emerald-600 font-semibold font-mono">340ms</span> after edge warmup. Lead qualification conversion in High-Intent Enterprise cohort grew <span className="text-cyan-700 font-semibold">+18.2%</span> over the last 14 days.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
            <Button variant="ghost" size="sm" className="text-xs text-slate-300 hover:text-slate-900 hover:bg-white h-8">
              Dismiss
            </Button>
            <Button size="sm" className="bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-semibold h-8 gap-1">
              Apply Optimization
              <ChevronRight className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* MAIN INTERACTIVE TABS */}
        {/* ======================================================== */}
        <Tabs defaultValue="overview" className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-3">
            <TabsList className="bg-slate-50 border border-slate-200 p-1 rounded-xl backdrop-blur-md">
              <TabsTrigger value="overview" className="text-xs data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500/20 data-[state=active]:to-violet-500/20 data-[state=active]:text-slate-900 data-[state=active]:border data-[state=active]:border-cyan-500/30 rounded-lg px-3.5 py-1.5">
                <BarChart3 className="mr-1.5 h-3.5 w-3.5 text-cyan-400" />
                Overview & Multi-Trend
              </TabsTrigger>
              <TabsTrigger value="leads" className="text-xs data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500/20 data-[state=active]:to-violet-500/20 data-[state=active]:text-slate-900 data-[state=active]:border data-[state=active]:border-cyan-500/30 rounded-lg px-3.5 py-1.5">
                <Users className="mr-1.5 h-3.5 w-3.5 text-indigo-400" />
                Lead Acquisition
              </TabsTrigger>
              <TabsTrigger value="latency" className="text-xs data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500/20 data-[state=active]:to-violet-500/20 data-[state=active]:text-slate-900 data-[state=active]:border data-[state=active]:border-cyan-500/30 rounded-lg px-3.5 py-1.5">
                <Clock className="mr-1.5 h-3.5 w-3.5 text-emerald-400" />
                AI Latency & Engine
              </TabsTrigger>
              <TabsTrigger value="conversion" className="text-xs data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500/20 data-[state=active]:to-violet-500/20 data-[state=active]:text-slate-900 data-[state=active]:border data-[state=active]:border-cyan-500/30 rounded-lg px-3.5 py-1.5">
                <Target className="mr-1.5 h-3.5 w-3.5 text-amber-400" />
                Conversion Funnel & ROI Sim
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Telemetry Node: <strong>US-East-1 (Primary)</strong></span>
            </div>
          </div>

          {/* ======================================================== */}
          {/* TAB 1: OVERVIEW & EXECUTIVE MULTI-TREND */}
          {/* ======================================================== */}
          <TabsContent value="overview" className="space-y-6 mt-0">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              
              {/* Main Trend: Revenue vs Lead Volume vs ROI */}
              <Card className="lg:col-span-2 border-slate-200 bg-slate-50  shadow-md">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div>
                    <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      Revenue Generated vs Lead Velocity
                      <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-[10px]">
                        +241% YoY
                      </Badge>
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-400">
                      Monthly progression of closed revenue ($) and total inbound lead volume.
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-full bg-cyan-400" />
                      <span className="text-slate-300">Revenue ($)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-full bg-violet-400" />
                      <span className="text-slate-300">Lead Volume</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="h-[320px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={monthlyTrendsData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#06B6D4" stopOpacity={0.0} />
                          </linearGradient>
                          <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                        <XAxis dataKey="month" stroke="#64748B" fontSize={12} tickLine={false} />
                        <YAxis yAxisId="left" stroke="#64748B" fontSize={11} tickFormatter={(val) => `$${val / 1000}k`} tickLine={false} axisLine={false} />
                        <YAxis yAxisId="right" orientation="right" stroke="#64748B" fontSize={11} tickFormatter={(val) => `${val / 1000}k`} tickLine={false} axisLine={false} />
                        <RechartsTooltip content={<GlassTooltip />} />
                        <Area yAxisId="left" type="monotone" dataKey="revenue" name="Revenue ($)" stroke="#06B6D4" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRevenue)" />
                        <Line yAxisId="right" type="monotone" dataKey="leads" name="Total Leads" stroke="#8B5CF6" strokeWidth={3} dot={{ r: 4, fill: "#8B5CF6", strokeWidth: 2, stroke: "#0F172A" }} />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Channel Distribution Donut */}
              <Card className="border-slate-200 bg-slate-50  shadow-md flex flex-col justify-between">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-bold text-slate-900 flex items-center justify-between">
                    <span>Lead Channels</span>
                    <Badge variant="outline" className="border-slate-700 bg-white text-slate-300 text-[10px]">
                      14.8k Total
                    </Badge>
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-400">
                    Distribution of incoming conversations across channels.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-2 flex-1 flex flex-col justify-between">
                  <div className="h-[180px] w-full relative flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={channelBreakdown}
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={80}
                          paddingAngle={4}
                          dataKey="value"
                        >
                          {channelBreakdown.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} stroke="#0B0F17" strokeWidth={3} />
                          ))}
                        </Pie>
                        <RechartsTooltip content={<GlassTooltip suffix=" leads" />} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute flex flex-col items-center pointer-events-none">
                      <span className="text-xl font-extrabold font-mono text-slate-900">52%</span>
                      <span className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider">WhatsApp</span>
                    </div>
                  </div>

                  <div className="space-y-2 mt-3">
                    {channelBreakdown.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-slate-200/50 last:border-0">
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                          <span className="text-slate-300 font-medium">{item.name}</span>
                        </div>
                        <div className="flex items-center gap-2 font-mono">
                          <span className="text-slate-800 font-semibold">{item.percentage}%</span>
                          <span className="text-emerald-400 text-[11px] font-sans">{item.growth}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

            </div>

            {/* Sub-row: 30-Day Daily Velocity & AI Latency Correlation */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              
              {/* Daily Velocity Chart */}
              <Card className="border-slate-200 bg-slate-50  shadow-md">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                        Daily Inbound & Qualified Velocity
                      </CardTitle>
                      <CardDescription className="text-xs text-slate-400">
                        Daily progression of captured leads vs high-intent MQL conversions.
                      </CardDescription>
                    </div>
                    <Badge className="bg-cyan-500/10 text-cyan-400 border-cyan-500/30 text-xs">
                      Daily Peak: 785
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="h-[240px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={daily30DaysData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                        <XAxis dataKey="day" stroke="#64748B" fontSize={11} tickLine={false} />
                        <YAxis stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} />
                        <RechartsTooltip content={<GlassTooltip />} />
                        <Bar dataKey="leads" name="Total Inbound" fill="#6366F1" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="qualified" name="Qualified (MQL)" fill="#06B6D4" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Latency vs Conversion Correlation */}
              <Card className="border-slate-200 bg-slate-50  shadow-md">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                        Response Speed vs Meeting Conversion
                      </CardTitle>
                      <CardDescription className="text-xs text-slate-400">
                        Demonstrating how sub-500ms AI latency directly drives higher meeting bookings.
                      </CardDescription>
                    </div>
                    <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-xs">
                      r = -0.94 Correlation
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="h-[240px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={monthlyTrendsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                        <XAxis dataKey="month" stroke="#64748B" fontSize={11} tickLine={false} />
                        <YAxis yAxisId="left" stroke="#64748B" fontSize={11} tickFormatter={(v) => `${v}%`} tickLine={false} axisLine={false} />
                        <YAxis yAxisId="right" orientation="right" stroke="#64748B" fontSize={11} tickFormatter={(v) => `${v}ms`} tickLine={false} axisLine={false} />
                        <RechartsTooltip content={<GlassTooltip />} />
                        <Line yAxisId="left" type="monotone" dataKey="conversion" name="Conversion %" stroke="#10B981" strokeWidth={3} dot={{ r: 3, fill: "#10B981" }} />
                        <Line yAxisId="right" type="monotone" dataKey="latency" name="Latency (ms)" stroke="#F43F5E" strokeWidth={2} strokeDasharray="4 4" dot={{ r: 3, fill: "#F43F5E" }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

            </div>
          </TabsContent>

          {/* ======================================================== */}
          {/* TAB 2: LEAD ACQUISITION & PIPELINE */}
          {/* ======================================================== */}
          <TabsContent value="leads" className="space-y-6 mt-0">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              
              {/* Channel Performance Deep Dive */}
              <Card className="lg:col-span-2 border-slate-200 bg-slate-50  shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-slate-900 flex items-center justify-between">
                    <span>Channel Pipeline & Conversion Velocity</span>
                    <Badge variant="outline" className="border-cyan-500/30 text-cyan-400 text-xs">
                      All Omnichannel Endpoints
                    </Badge>
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-400">
                    Lead generation throughput, qualification rate, and estimated generated pipeline per channel.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-5">
                    {[
                      {
                        name: "WhatsApp Business AI",
                        icon: MessageSquare,
                        color: "text-emerald-400",
                        bgColor: "bg-emerald-500/10 border-emerald-500/20",
                        leads: 7743,
                        mqlRate: 64.2,
                        pipeline: "$248,000",
                        avgHandle: "1.2 min",
                      },
                      {
                        name: "Web Conversational Widget",
                        icon: Globe2,
                        color: "text-indigo-400",
                        bgColor: "bg-indigo-500/10 border-indigo-500/20",
                        leads: 3872,
                        mqlRate: 58.6,
                        pipeline: "$124,000",
                        avgHandle: "48 sec",
                      },
                      {
                        name: "Inbound Voice AI Agent",
                        icon: PhoneCall,
                        color: "text-cyan-400",
                        bgColor: "bg-cyan-500/10 border-cyan-500/20",
                        leads: 2085,
                        mqlRate: 71.4,
                        pipeline: "$82,500",
                        avgHandle: "2.4 min",
                      },
                      {
                        name: "Autonomous SDR Email Copilot",
                        icon: Mail,
                        color: "text-amber-400",
                        bgColor: "bg-amber-500/10 border-amber-500/20",
                        leads: 1192,
                        mqlRate: 49.0,
                        pipeline: "$30,500",
                        avgHandle: "Instant",
                      },
                    ].map((ch, idx) => (
                      <div key={idx} className="rounded-xl border border-slate-200 bg-white p-4 transition-all hover:border-slate-700">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                          <div className="flex items-center gap-3">
                            <div className={`p-2.5 rounded-lg border ${ch.bgColor} ${ch.color}`}>
                              <ch.icon className="h-4 w-4" />
                            </div>
                            <div>
                              <h4 className="text-sm font-semibold text-slate-900">{ch.name}</h4>
                              <p className="text-xs text-slate-400">Avg Resolution: {ch.avgHandle}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-6 font-mono text-xs">
                            <div>
                              <span className="text-slate-400 block text-[10px] uppercase font-sans">Leads Captured</span>
                              <strong className="text-slate-900 text-sm">{ch.leads.toLocaleString()}</strong>
                            </div>
                            <div>
                              <span className="text-slate-400 block text-[10px] uppercase font-sans">MQL Qual. Rate</span>
                              <strong className="text-emerald-400 text-sm">{ch.mqlRate}%</strong>
                            </div>
                            <div>
                              <span className="text-slate-400 block text-[10px] uppercase font-sans">Pipeline Generated</span>
                              <strong className="text-cyan-400 text-sm">{ch.pipeline}</strong>
                            </div>
                          </div>
                        </div>
                        <Progress value={ch.mqlRate} className="h-1.5 bg-white" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Geographic & Audience Cohort */}
              <Card className="border-slate-200 bg-slate-50  shadow-md">
                <CardHeader>
                  <CardTitle className="text-base font-bold text-slate-900 flex items-center justify-between">
                    <span>Geographic Distribution</span>
                    <Globe2 className="h-4 w-4 text-cyan-400" />
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-400">
                    Lead traffic origins and language localization performance.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { region: "Latin America (ES/PT)", share: 44, volume: "6,552 leads", growth: "+38%" },
                      { region: "North America (EN)", share: 36, volume: "5,361 leads", growth: "+22%" },
                      { region: "Europe (EN/FR/DE)", share: 14, volume: "2,084 leads", growth: "+15%" },
                      { region: "Asia-Pacific (APAC)", share: 6, volume: "895 leads", growth: "+49%" },
                    ].map((geo, idx) => (
                      <div key={idx} className="space-y-1.5">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-300 font-medium">{geo.region}</span>
                          <span className="text-slate-400 font-mono">{geo.volume} ({geo.share}%)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Progress value={geo.share} className="h-1.5 flex-1 bg-white" />
                          <span className="text-[11px] font-semibold text-emerald-400 font-mono w-10 text-right">{geo.growth}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator className="my-5 bg-white" />

                  <div className="rounded-xl bg-white border border-slate-200 p-3.5 space-y-1">
                    <div className="flex items-center gap-1.5 text-xs text-amber-400 font-semibold">
                      <Flame className="h-3.5 w-3.5" />
                      Highest Growth Market
                    </div>
                    <p className="text-xs text-slate-300">
                      Mexico & Colombia WhatsApp campaigns exhibit the lowest acquisition cost at <strong className="text-slate-900 font-mono">$1.42/qualified lead</strong>.
                    </p>
                  </div>
                </CardContent>
              </Card>

            </div>
          </TabsContent>

          {/* ======================================================== */}
          {/* TAB 3: AI LATENCY & ENGINE TELEMETRY */}
          {/* ======================================================== */}
          <TabsContent value="latency" className="space-y-6 mt-0">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              
              {/* Hourly Traffic & Latency Percentiles */}
              <Card className="lg:col-span-2 border-slate-200 bg-slate-50  shadow-md">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        24-Hour AI Response Latency Percentiles
                      </CardTitle>
                      <CardDescription className="text-xs text-slate-400">
                        Tracking p50 (Median) and p95 latencies against real-time request volume.
                      </CardDescription>
                    </div>
                    <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-xs">
                      Edge Cache Hit: 89.4%
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-2">
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={latencyHourlyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorP95" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.0} />
                          </linearGradient>
                          <linearGradient id="colorP50" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                        <XAxis dataKey="hour" stroke="#64748B" fontSize={11} tickLine={false} />
                        <YAxis stroke="#64748B" fontSize={11} tickFormatter={(v) => `${v}ms`} tickLine={false} axisLine={false} />
                        <RechartsTooltip content={<GlassTooltip suffix="ms" />} />
                        <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
                        <Area type="monotone" dataKey="p95" name="p95 Tail Latency" stroke="#F59E0B" strokeWidth={2} fillOpacity={1} fill="url(#colorP95)" />
                        <Area type="monotone" dataKey="p50" name="p50 Median Latency" stroke="#10B981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorP50)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* AI Engine Specs & Telemetry Health */}
              <Card className="border-slate-200 bg-slate-50  shadow-md">
                <CardHeader>
                  <CardTitle className="text-base font-bold text-slate-900 flex items-center justify-between">
                    <span>Engine Infrastructure</span>
                    <Cpu className="h-4 w-4 text-emerald-400" />
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-400">
                    Active cluster capacity and speculative decoding health.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-slate-200 bg-white p-3">
                      <span className="text-[11px] text-slate-400">Model Pipeline</span>
                      <p className="text-sm font-bold text-slate-900 font-mono mt-0.5">Gemini 2.0 Flash</p>
                      <span className="text-[10px] text-emerald-400 font-semibold">Sub-second Stream</span>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white p-3">
                      <span className="text-[11px] text-slate-400">Token Efficiency</span>
                      <p className="text-sm font-bold text-slate-900 font-mono mt-0.5">2,840 t/sec</p>
                      <span className="text-[10px] text-cyan-400 font-semibold">Cached Warm</span>
                    </div>
                  </div>

                  <div className="space-y-3 pt-2">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-300">Autonomous Resolution</span>
                        <span className="text-emerald-400 font-mono font-semibold">89.2%</span>
                      </div>
                      <Progress value={89.2} className="h-1.5 bg-white [&>div]:bg-emerald-400" />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-300">Human SDR Escalations</span>
                        <span className="text-amber-400 font-mono font-semibold">10.8%</span>
                      </div>
                      <Progress value={10.8} className="h-1.5 bg-white [&>div]:bg-amber-400" />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-300">Edge Cache Hit Ratio</span>
                        <span className="text-cyan-400 font-mono font-semibold">91.4%</span>
                      </div>
                      <Progress value={91.4} className="h-1.5 bg-white [&>div]:bg-cyan-400" />
                    </div>
                  </div>

                  <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 flex items-center gap-3">
                    <ShieldCheck className="h-5 w-5 text-emerald-400 shrink-0" />
                    <div className="text-xs">
                      <span className="font-semibold text-slate-900">SLA Compliance: 99.99%</span>
                      <p className="text-slate-400 text-[11px]">Zero downtime incidents in 180 days.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

            </div>
          </TabsContent>

          {/* ======================================================== */}
          {/* TAB 4: CONVERSION FUNNEL & INTERACTIVE ROI SIMULATOR */}
          {/* ======================================================== */}
          <TabsContent value="conversion" className="space-y-6 mt-0">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              
              {/* Funnel Stage Breakdown */}
              <Card className="lg:col-span-2 border-slate-200 bg-slate-50  shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-slate-900 flex items-center justify-between">
                    <span>Full-Funnel AI Conversion Pipeline</span>
                    <Badge variant="outline" className="border-amber-500/30 text-amber-400 text-xs">
                      9.6% End-to-End Win Rate
                    </Badge>
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-400">
                    Step-by-step conversion from anonymous visitor touchpoint down to closed-won enterprise deal.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3.5">
                    {conversionFunnelData.map((stage, idx) => (
                      <div key={idx} className="relative rounded-xl border border-slate-200 bg-white p-3.5">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-slate-900">{stage.stage}</span>
                          </div>
                          <div className="flex items-center gap-4 text-xs font-mono">
                            <span className="text-slate-400">Volume: <strong className="text-slate-900">{stage.count.toLocaleString()}</strong></span>
                            <span className="text-cyan-400 font-semibold">Stage Rate: {stage.rate}</span>
                            {stage.dropoff !== "0%" && (
                              <span className="text-rose-400 text-[11px]">Drop: {stage.dropoff}</span>
                            )}
                          </div>
                        </div>
                        <Progress
                          value={(stage.count / 24500) * 100}
                          className="h-2 bg-white"
                        />
                      </div>
                    ))}
                  </div>

                  {/* A/B Prompt Persona Comparison */}
                  <div className="mt-6 rounded-xl border border-slate-200 bg-white p-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                      <Bot className="h-4 w-4 text-cyan-400" />
                      AI Persona Prompt A/B Test Benchmark
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {abTestResults.map((ab, idx) => (
                        <div key={idx} className={`rounded-lg border p-3 ${idx === 0 ? "border-cyan-500/40 bg-cyan-500/5" : "border-slate-200 bg-slate-50"}`}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-bold text-slate-900">{ab.variant.split(" ")[1]}</span>
                            {idx === 0 && <Badge className="bg-cyan-500/20 text-cyan-300 text-[9px] py-0">WINNER</Badge>}
                          </div>
                          <p className="text-[11px] text-slate-400 mb-2">{ab.variant}</p>
                          <div className="space-y-1 text-xs font-mono">
                            <div className="flex justify-between text-slate-300">
                              <span>Conversion:</span>
                              <strong className="text-emerald-400">{ab.conversion}</strong>
                            </div>
                            <div className="flex justify-between text-slate-400">
                              <span>Avg Latency:</span>
                              <span>{ab.avgLatency}</span>
                            </div>
                            <div className="flex justify-between text-slate-400">
                              <span>CSAT Score:</span>
                              <span>{ab.csat}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Dynamic Interactive ROI Calculator */}
              <Card className="border-slate-200 bg-gradient-to-b from-slate-900/90 via-slate-900/60 to-slate-950/90  shadow-md">
                <CardHeader>
                  <CardTitle className="text-base font-bold text-slate-900 flex items-center justify-between">
                    <span>Interactive ROI Simulator</span>
                    <Sliders className="h-4 w-4 text-violet-400" />
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-400">
                    Adjust lead volume and deal parameters to project net economic ROI.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  {/* Slider 1: Monthly Leads */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-300 font-medium">Monthly Inbound Leads</span>
                      <span className="font-mono text-cyan-400 font-bold">{simLeads.toLocaleString()}</span>
                    </div>
                    <input
                      type="range"
                      min="2000"
                      max="50000"
                      step="1000"
                      value={simLeads}
                      onChange={(e) => setSimLeads(Number(e.target.value))}
                      className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-white rounded-lg appearance-none"
                    />
                  </div>

                  {/* Slider 2: Average ACV / Deal Value */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-300 font-medium">Average Deal Value (ACV)</span>
                      <span className="font-mono text-violet-400 font-bold">${simDealValue.toLocaleString()}</span>
                    </div>
                    <input
                      type="range"
                      min="1000"
                      max="25000"
                      step="500"
                      value={simDealValue}
                      onChange={(e) => setSimDealValue(Number(e.target.value))}
                      className="w-full accent-violet-400 cursor-pointer h-1.5 bg-white rounded-lg appearance-none"
                    />
                  </div>

                  {/* Slider 3: AI Autonomous Handling Rate */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-300 font-medium">AI Autonomous Resolution Rate</span>
                      <span className="font-mono text-emerald-400 font-bold">{simResolutionRate}%</span>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="98"
                      step="1"
                      value={simResolutionRate}
                      onChange={(e) => setSimResolutionRate(Number(e.target.value))}
                      className="w-full accent-emerald-400 cursor-pointer h-1.5 bg-white rounded-lg appearance-none"
                    />
                  </div>

                  <Separator className="bg-white" />

                  {/* Output ROI Result Cards */}
                  <div className="rounded-xl border border-violet-500/30 bg-violet-500/10 p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs uppercase font-semibold text-violet-300">Projected Net ROI</span>
                      <span className="text-2xl font-extrabold font-mono text-slate-900">
                        +{calculatedSavings.calculatedRoiPercentage}%
                      </span>
                    </div>
                    <div className="text-xs space-y-1 font-mono pt-1">
                      <div className="flex justify-between text-slate-300">
                        <span>Operational Cost Saved:</span>
                        <span className="text-emerald-400 font-bold">${calculatedSavings.rawSavings.toLocaleString()}/mo</span>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span>New Closed Pipeline:</span>
                        <span className="text-cyan-300 font-bold">${calculatedSavings.addedRevenue.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-slate-400 text-[11px]">
                        <span>Est. Monthly Deals Closed:</span>
                        <span>{calculatedSavings.estimatedDeals} deals</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

            </div>
          </TabsContent>
        </Tabs>

        {/* ======================================================== */}
        {/* LIVE INBOUND ACTIVITY & HIGH-INTENT CONVERSIONS FEED */}
        {/* ======================================================== */}
        <Card className="border-slate-200 bg-slate-50  shadow-md">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 gap-2">
            <div>
              <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Activity className="h-5 w-5 text-cyan-400" />
                Live Inbound Intelligence Feed
                <Badge className="bg-cyan-500/10 text-cyan-400 border-cyan-500/30 text-[10px]">
                  Real-Time Capture
                </Badge>
              </CardTitle>
              <CardDescription className="text-xs text-slate-400">
                High-intent enterprise prospects currently being qualified and scheduled by AI SDRs.
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" className="h-8 border-slate-700 bg-white text-xs text-slate-300 hover:text-slate-900">
              View All Stream Logs
            </Button>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                    <th className="pb-3 pl-2">Lead / Prospect</th>
                    <th className="pb-3">Channel</th>
                    <th className="pb-3">Latency</th>
                    <th className="pb-3">Intent Score</th>
                    <th className="pb-3">Est. Value</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 pr-2 text-right">Activity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {recentConversions.map((lead, idx) => (
                    <tr key={idx} className="hover:bg-white transition-colors group">
                      <td className="py-3 pl-2">
                        <div className="font-semibold text-slate-900">{lead.leadName}</div>
                        <div className="text-[11px] text-slate-400">{lead.company} • {lead.id}</div>
                      </td>
                      <td className="py-3">
                        <span className="inline-flex items-center gap-1 text-slate-300">
                          {lead.channel.includes("WhatsApp") ? (
                            <MessageSquare className="h-3.5 w-3.5 text-emerald-400" />
                          ) : lead.channel.includes("Voice") ? (
                            <PhoneCall className="h-3.5 w-3.5 text-cyan-400" />
                          ) : (
                            <Globe2 className="h-3.5 w-3.5 text-indigo-400" />
                          )}
                          {lead.channel}
                        </span>
                      </td>
                      <td className="py-3 font-mono text-slate-300">{lead.latency}</td>
                      <td className="py-3">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-emerald-400 font-mono">{lead.intentScore}/100</span>
                          <span className="text-[10px] text-slate-400">🔥 Hot</span>
                        </div>
                      </td>
                      <td className="py-3 font-mono font-semibold text-slate-900">{lead.dealEstimate}</td>
                      <td className="py-3">
                        <Badge
                          className={`text-[10px] font-semibold ${
                            lead.status === "Demo Scheduled"
                              ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                              : lead.status === "Contract Sent"
                              ? "bg-cyan-500/15 text-cyan-400 border-cyan-500/30"
                              : "bg-violet-500/15 text-violet-400 border-violet-500/30"
                          }`}
                        >
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          {lead.status}
                        </Badge>
                      </td>
                      <td className="py-3 pr-2 text-right text-slate-400 font-mono text-[11px]">
                        {lead.time}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}


