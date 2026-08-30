"use client";

import React, { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import {
  Activity,
  BarChart3,
  Calendar,
  Clock,
  Copy,
  Cpu,
  Database,
  DollarSign,
  Download,
  Flame,
  Gauge,
  Key,
  PieChart as PieChartIcon,
  RefreshCw,
  Search,
  ShieldCheck,
  Sliders,
  Sparkles,
  TrendingUp,
  Zap,
} from "lucide-react";

// ==========================================
// MOCK DATA & CONSTANTS
// ==========================================

const PRICING_RATES = {
  "gpt-4o": {
    inputPerMillion: 5.0,
    cachedInputPerMillion: 2.5,
    outputPerMillion: 15.0,
    badgeColor: "bg-indigo-500/10 text-indigo-400 border-indigo-500/30",
  },
  "gpt-4o-mini": {
    inputPerMillion: 0.15,
    cachedInputPerMillion: 0.075,
    outputPerMillion: 0.6,
    badgeColor: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
  },
  "text-embedding-3-large": {
    inputPerMillion: 0.13,
    cachedInputPerMillion: 0.13,
    outputPerMillion: 0.0,
    badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  },
  "gpt-4o-realtime": {
    inputPerMillion: 5.0,
    cachedInputPerMillion: 2.5,
    outputPerMillion: 20.0,
    badgeColor: "bg-purple-500/10 text-purple-400 border-purple-500/30",
  },
};

// 15-Day Daily Consumption Breakdown
const DAILY_USAGE_DATA = [
  { day: "Aug 01", gpt4oInput: 2.4, gpt4oOutput: 1.1, gpt4oCached: 0.9, miniTokens: 0.8, cost: 36.5 },
  { day: "Aug 02", gpt4oInput: 2.8, gpt4oOutput: 1.3, gpt4oCached: 1.1, miniTokens: 0.9, cost: 42.1 },
  { day: "Aug 03", gpt4oInput: 3.1, gpt4oOutput: 1.4, gpt4oCached: 1.4, miniTokens: 1.1, cost: 46.8 },
  { day: "Aug 04", gpt4oInput: 2.2, gpt4oOutput: 0.9, gpt4oCached: 0.8, miniTokens: 0.6, cost: 31.4 },
  { day: "Aug 05", gpt4oInput: 1.9, gpt4oOutput: 0.8, gpt4oCached: 0.7, miniTokens: 0.5, cost: 27.2 },
  { day: "Aug 06", gpt4oInput: 3.4, gpt4oOutput: 1.6, gpt4oCached: 1.5, miniTokens: 1.2, cost: 52.0 },
  { day: "Aug 07", gpt4oInput: 3.8, gpt4oOutput: 1.8, gpt4oCached: 1.8, miniTokens: 1.4, cost: 58.4 },
  { day: "Aug 08", gpt4oInput: 4.2, gpt4oOutput: 1.9, gpt4oCached: 2.0, miniTokens: 1.6, cost: 63.2 },
  { day: "Aug 09", gpt4oInput: 3.9, gpt4oOutput: 1.7, gpt4oCached: 1.9, miniTokens: 1.5, cost: 57.8 },
  { day: "Aug 10", gpt4oInput: 3.5, gpt4oOutput: 1.5, gpt4oCached: 1.6, miniTokens: 1.3, cost: 51.5 },
  { day: "Aug 11", gpt4oInput: 2.1, gpt4oOutput: 0.9, gpt4oCached: 0.9, miniTokens: 0.7, cost: 30.6 },
  { day: "Aug 12", gpt4oInput: 2.0, gpt4oOutput: 0.8, gpt4oCached: 0.8, miniTokens: 0.6, cost: 28.5 },
  { day: "Aug 13", gpt4oInput: 4.5, gpt4oOutput: 2.1, gpt4oCached: 2.2, miniTokens: 1.7, cost: 69.4 },
  { day: "Aug 14", gpt4oInput: 4.8, gpt4oOutput: 2.3, gpt4oCached: 2.5, miniTokens: 1.9, cost: 74.8 },
  { day: "Aug 15", gpt4oInput: 4.1, gpt4oOutput: 1.8, gpt4oCached: 2.1, miniTokens: 1.5, cost: 61.2 },
];

// Hourly Velocity (Last 24 Hours)
const HOURLY_VELOCITY = [
  { hour: "00:00", tokens: 142000, tpm: 120000, cost: 1.9 },
  { hour: "02:00", tokens: 98000, tpm: 85000, cost: 1.3 },
  { hour: "04:00", tokens: 76000, tpm: 60000, cost: 0.9 },
  { hour: "06:00", tokens: 185000, tpm: 140000, cost: 2.4 },
  { hour: "08:00", tokens: 490000, tpm: 280000, cost: 6.8 },
  { hour: "10:00", tokens: 680000, tpm: 342000, cost: 9.4 },
  { hour: "12:00", tokens: 590000, tpm: 310000, cost: 8.1 },
  { hour: "14:00", tokens: 740000, tpm: 395000, cost: 10.8 },
  { hour: "16:00", tokens: 620000, tpm: 330000, cost: 8.6 },
  { hour: "18:00", tokens: 450000, tpm: 240000, cost: 6.1 },
  { hour: "20:00", tokens: 310000, tpm: 190000, cost: 4.2 },
  { hour: "22:00", tokens: 220000, tpm: 150000, cost: 2.9 },
];

// Cumulative Cost vs Budget Projection
const CUMULATIVE_COST_DATA = [
  { day: "Aug 01", actual: 36.5, projected: 36.5, budgetLimit: 2000 },
  { day: "Aug 03", actual: 125.4, projected: 125.4, budgetLimit: 2000 },
  { day: "Aug 06", actual: 236.0, projected: 236.0, budgetLimit: 2000 },
  { day: "Aug 09", actual: 415.4, projected: 415.4, budgetLimit: 2000 },
  { day: "Aug 12", actual: 526.0, projected: 526.0, budgetLimit: 2000 },
  { day: "Aug 15", actual: 731.4, projected: 731.4, budgetLimit: 2000 },
  { day: "Aug 18", actual: null, projected: 890.0, budgetLimit: 2000 },
  { day: "Aug 21", actual: null, projected: 1060.0, budgetLimit: 2000 },
  { day: "Aug 24", actual: null, projected: 1240.0, budgetLimit: 2000 },
  { day: "Aug 27", actual: null, projected: 1420.0, budgetLimit: 2000 },
  { day: "Aug 31", actual: null, projected: 1680.5, budgetLimit: 2000 },
];

// Model Distribution
const MODEL_SHARE_DATA = [
  { name: "GPT-4o (Standard)", value: 78.4, cost: 1120.5, color: "#6366f1" },
  { name: "GPT-4o (Cached Prompt)", value: 14.2, cost: 202.8, color: "#8b5cf6" },
  { name: "GPT-4o-mini", value: 5.6, cost: 79.9, color: "#06b6d4" },
  { name: "Text Embeddings 3", value: 1.8, cost: 25.45, color: "#10b981" },
];

// Granular Logs Mock Data
const LIVE_REQUEST_LOGS = [
  {
    id: "req_9984dfa1",
    timestamp: "2 mins ago",
    model: "gpt-4o",
    service: "neural-agent-executor",
    inputTokens: 3840,
    cachedTokens: 2560,
    outputTokens: 642,
    totalTokens: 4482,
    latency: "340ms",
    cost: "$0.0254",
    status: "200 OK",
  },
  {
    id: "req_8873bb02",
    timestamp: "4 mins ago",
    model: "gpt-4o",
    service: "doc-rag-pipeline",
    inputTokens: 8192,
    cachedTokens: 6144,
    outputTokens: 1240,
    totalTokens: 9432,
    latency: "620ms",
    cost: "$0.0442",
    status: "200 OK",
  },
  {
    id: "req_7762cc19",
    timestamp: "7 mins ago",
    model: "gpt-4o-mini",
    service: "sentiment-classifier",
    inputTokens: 512,
    cachedTokens: 0,
    outputTokens: 48,
    totalTokens: 560,
    latency: "110ms",
    cost: "$0.0001",
    status: "200 OK",
  },
  {
    id: "req_6651ee44",
    timestamp: "12 mins ago",
    model: "gpt-4o",
    service: "code-synthesis-bot",
    inputTokens: 14200,
    cachedTokens: 8900,
    outputTokens: 3100,
    totalTokens: 17300,
    latency: "1480ms",
    cost: "$0.0952",
    status: "200 OK",
  },
  {
    id: "req_5540ff31",
    timestamp: "18 mins ago",
    model: "text-embedding-3-large",
    service: "vector-search-indexer",
    inputTokens: 124000,
    cachedTokens: 0,
    outputTokens: 0,
    totalTokens: 124000,
    latency: "280ms",
    cost: "$0.0161",
    status: "200 OK",
  },
  {
    id: "req_4439aa88",
    timestamp: "24 mins ago",
    model: "gpt-4o",
    service: "crm-email-enricher",
    inputTokens: 4200,
    cachedTokens: 0,
    outputTokens: 850,
    totalTokens: 5050,
    latency: "510ms",
    cost: "$0.0337",
    status: "200 OK",
  },
  {
    id: "req_3328bb77",
    timestamp: "31 mins ago",
    model: "gpt-4o",
    service: "neural-agent-executor",
    inputTokens: 5900,
    cachedTokens: 4100,
    outputTokens: 910,
    totalTokens: 6810,
    latency: "440ms",
    cost: "$0.0328",
    status: "200 OK",
  },
];

export default function UsagePage() {
  // State
  const [selectedPeriod, setSelectedPeriod] = useState("aug-cycle");
  const [selectedKey, setSelectedKey] = useState("all-keys");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hardCapEnabled, setHardCapEnabled] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [modelFilter, setModelFilter] = useState("all");

  // Interactive Simulator State
  const [simInputTokensM, setSimInputTokensM] = useState<number>(10);
  const [simOutputTokensM, setSimOutputTokensM] = useState<number>(3);
  const [simCachedRatio, setSimCachedRatio] = useState<number>(50);

  // Quota Metrics
  const monthlyBudgetLimit = 2000;
  const currentTotalSpent = 1428.65;
  const spendPercentage = Math.min(100, Math.round((currentTotalSpent / monthlyBudgetLimit) * 100));

  const totalTokensConsumedM = 142.85;
  const tokenMonthlyCapM = 200.0;
  const tokenPercentage = Math.round((totalTokensConsumedM / tokenMonthlyCapM) * 100);

  const tpmLimit = 500000;
  const currentTPM = 342000;
  const tpmPercentage = Math.round((currentTPM / tpmLimit) * 100);

  const rpmLimit = 5000;
  const currentRPM = 3120;
  const rpmPercentage = Math.round((currentRPM / rpmLimit) * 100);

  const cachedTokensTotalM = 38.2;
  const totalSavingsUSD = 348.5;

  // Simulator Calculations
  const simCalculations = useMemo(() => {
    const cachedTokens = simInputTokensM * (simCachedRatio / 100);
    const uncachedTokens = simInputTokensM - cachedTokens;

    // GPT-4o Cost
    const gpt4oUncachedInputCost = uncachedTokens * PRICING_RATES["gpt-4o"].inputPerMillion;
    const gpt4oCachedInputCost = cachedTokens * PRICING_RATES["gpt-4o"].cachedInputPerMillion;
    const gpt4oOutputCost = simOutputTokensM * PRICING_RATES["gpt-4o"].outputPerMillion;
    const gpt4oTotal = gpt4oUncachedInputCost + gpt4oCachedInputCost + gpt4oOutputCost;

    // GPT-4o-mini Cost
    const miniUncachedInputCost = uncachedTokens * PRICING_RATES["gpt-4o-mini"].inputPerMillion;
    const miniCachedInputCost = cachedTokens * PRICING_RATES["gpt-4o-mini"].cachedInputPerMillion;
    const miniOutputCost = simOutputTokensM * PRICING_RATES["gpt-4o-mini"].outputPerMillion;
    const miniTotal = miniUncachedInputCost + miniCachedInputCost + miniOutputCost;

    // Savings
    const gpt4oWithoutCacheCost =
      simInputTokensM * PRICING_RATES["gpt-4o"].inputPerMillion + gpt4oOutputCost;
    const cacheSavings = gpt4oWithoutCacheCost - gpt4oTotal;

    return {
      gpt4oTotal: gpt4oTotal.toFixed(2),
      miniTotal: miniTotal.toFixed(2),
      cacheSavings: cacheSavings.toFixed(2),
      gpt4oUncachedInputCost: gpt4oUncachedInputCost.toFixed(2),
      gpt4oCachedInputCost: gpt4oCachedInputCost.toFixed(2),
      gpt4oOutputCost: gpt4oOutputCost.toFixed(2),
    };
  }, [simInputTokensM, simOutputTokensM, simCachedRatio]);

  // Filtered Logs
  const filteredLogs = useMemo(() => {
    return LIVE_REQUEST_LOGS.filter((log) => {
      const matchesSearch =
        log.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.service.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.model.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesModel = modelFilter === "all" || log.model === modelFilter;
      return matchesSearch && matchesModel;
    });
  }, [searchQuery, modelFilter]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success("Telemetry & Quotas Refreshed", {
        description: "Latest token counters synced with OpenAI live billing streams.",
      });
    }, 700);
  };

  const handleExportCSV = () => {
    toast.success("Usage Report Generated", {
      description: "Downloading neurometric_usage_aug2026.csv...",
    });
  };

  const handleCopySnippet = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.info("Copied to Clipboard", {
      description: text,
    });
  };

  return (
    <div className="relative min-h-screen bg-white text-slate-900 antialiased selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Dynamic Ambient Background Elements */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-40 left-1/4 h-[550px] w-[550px] rounded-full bg-indigo-600/10 blur-[130px]" />
        <div className="absolute top-1/3 -right-20 h-[500px] w-[500px] rounded-full bg-purple-600/10 blur-[140px]" />
        <div className="absolute bottom-10 left-1/3 h-[450px] w-[450px] rounded-full bg-emerald-600/08 blur-[120px]" />
        <div className="absolute inset-0 " />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* ========================================================================= */}
        {/* TOP BAR / NAVIGATION HEADER */}
        {/* ========================================================================= */}
        <div className="flex flex-col gap-6 border-b border-slate-200 pb-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-medium tracking-wide text-slate-500 uppercase">
              <span className="flex items-center gap-1 text-indigo-400">
                <Cpu className="h-3.5 w-3.5" /> Core Telemetry
              </span>
              <span>/</span>
              <span>Billing & Consumption</span>
              <span>/</span>
              <span className="text-slate-800">GPT-4o Engine</span>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-4xl font-black tracking-tight text-black font-serif md:text-4xl">
                Token Usage & Costs
              </h1>
              <Badge
                variant="outline"
                className="border-emerald-500/30 bg-emerald-500/10 text-emerald-400 font-mono text-xs px-2.5 py-0.5 flex items-center gap-1.5"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Sync Active
              </Badge>
              <Badge
                variant="outline"
                className="border-indigo-500/30 bg-indigo-500/10 text-indigo-300 font-mono text-xs"
              >
                Tier 5 Enterprise
              </Badge>
            </div>
            <p className="text-sm text-slate-500 max-w-2xl">
              Track real-time token volume for <span className="text-slate-800 font-medium">GPT-4o</span>, monitor Prompt Caching efficiency, inspect request velocity, and manage organization spend limits.
            </p>
          </div>

          {/* Header Action Controls */}
          <div className="flex flex-wrap items-center gap-3">
            <Select value={selectedKey} onValueChange={(val) => val && setSelectedKey(val)}>
              <SelectTrigger className="w-[190px] bg-slate-50 border-slate-200 text-xs text-slate-800 hover:bg-slate-100 focus:ring-indigo-500">
                <Key className="mr-2 h-3.5 w-3.5 text-slate-500" />
                <SelectValue placeholder="Select API Key" />
              </SelectTrigger>
              <SelectContent className="bg-slate-50 border-slate-200 text-slate-800">
                <SelectItem value="all-keys">All Keys (Aggregated)</SelectItem>
                <SelectItem value="prod-backend">prod-backend-cluster</SelectItem>
                <SelectItem value="rag-pipeline">doc-rag-pipeline</SelectItem>
                <SelectItem value="agent-swarm">neural-agent-swarm</SelectItem>
                <SelectItem value="dev-sandbox">dev-eval-sandbox</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedPeriod} onValueChange={(val) => val && setSelectedPeriod(val)}>
              <SelectTrigger className="w-[180px] bg-slate-50 border-slate-200 text-xs text-slate-800 hover:bg-slate-100 focus:ring-indigo-500">
                <Calendar className="mr-2 h-3.5 w-3.5 text-slate-500" />
                <SelectValue placeholder="Billing Cycle" />
              </SelectTrigger>
              <SelectContent className="bg-slate-50 border-slate-200 text-slate-800">
                <SelectItem value="aug-cycle">Current (Aug 1 - Aug 31)</SelectItem>
                <SelectItem value="last-7d">Last 7 Days</SelectItem>
                <SelectItem value="last-24h">Last 24 Hours</SelectItem>
                <SelectItem value="jul-cycle">Previous (July 2026)</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              className="bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100 hover:text-slate-900"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin text-indigo-400" : ""}`} />
            </Button>

            <Button
              size="sm"
              onClick={handleExportCSV}
              className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-slate-900 shadow-lg shadow-indigo-600/20 border-0 flex items-center gap-1.5"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export CSV</span>
            </Button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* HERO KPI CARDS WITH PROGRESS & GLASSMORPHISM */}
        {/* ========================================================================= */}
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {/* Card 1: Total Cost in USD */}
          <Card className="relative overflow-hidden border-slate-200 bg-slate-50  shadow-xl hover:border-slate-200/80 transition-all duration-200 group">
            <div className="absolute top-0 right-0 h-24 w-24 translate-x-6 -translate-y-6 rounded-full bg-emerald-500/10 blur-2xl group-hover:bg-emerald-500/20 transition-all" />
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Total Accrued Cost
              </span>
              <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-400 border border-emerald-500/20">
                <DollarSign className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-black tracking-tight text-slate-900">
                  ${currentTotalSpent.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </span>
                <span className="text-xs font-medium text-emerald-400 flex items-center">
                  <TrendingUp className="h-3.5 w-3.5 mr-0.5" />
                  +12.4% MoM
                </span>
              </div>

              {/* Progress toward Monthly Budget Limit */}
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Spend vs ${monthlyBudgetLimit.toLocaleString()} Cap</span>
                  <span className="font-mono font-semibold text-slate-800">{spendPercentage}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full transition-all duration-500 ${
                      spendPercentage > 85
                        ? "bg-gradient-to-r from-amber-500 to-rose-500"
                        : "bg-gradient-to-r from-emerald-500 to-cyan-500"
                    }`}
                    style={{ width: `${spendPercentage}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-slate-200 pt-2.5 text-xs text-slate-500">
                <span>Run-rate: <strong className="text-slate-700 font-mono">$46.08/day</strong></span>
                <span>Est. Total: <strong className="text-indigo-400 font-mono">$1,894.10</strong></span>
              </div>
            </CardContent>
          </Card>

          {/* Card 2: GPT-4o Total Tokens Consumed */}
          <Card className="relative overflow-hidden border-slate-200 bg-slate-50  shadow-xl hover:border-slate-200/80 transition-all duration-200 group">
            <div className="absolute top-0 right-0 h-24 w-24 translate-x-6 -translate-y-6 rounded-full bg-indigo-500/10 blur-2xl group-hover:bg-indigo-500/20 transition-all" />
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                GPT-4o Tokens Consumed
              </span>
              <div className="rounded-lg bg-indigo-500/10 p-2 text-indigo-400 border border-indigo-500/20">
                <Cpu className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-black tracking-tight text-slate-900">
                  {totalTokensConsumedM}M
                </span>
                <Badge variant="outline" className="border-indigo-500/30 text-indigo-400 bg-indigo-500/10 text-[10px]">
                  Prompt + Output
                </Badge>
              </div>

              {/* Progress toward Monthly Token Quota */}
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Quota Consumed ({tokenMonthlyCapM}M Cap)</span>
                  <span className="font-mono font-semibold text-indigo-300">{tokenPercentage}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-500"
                    style={{ width: `${tokenPercentage}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-slate-200 pt-2.5 text-xs text-slate-500">
                <span>Input: <strong className="text-slate-700 font-mono">98.4M</strong></span>
                <span>Output: <strong className="text-slate-700 font-mono">44.4M</strong></span>
              </div>
            </CardContent>
          </Card>

          {/* Card 3: Prompt Caching Savings */}
          <Card className="relative overflow-hidden border-slate-200 bg-slate-50  shadow-xl hover:border-slate-200/80 transition-all duration-200 group">
            <div className="absolute top-0 right-0 h-24 w-24 translate-x-6 -translate-y-6 rounded-full bg-cyan-500/10 blur-2xl group-hover:bg-cyan-500/20 transition-all" />
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Prompt Cache Discount
              </span>
              <div className="rounded-lg bg-cyan-500/10 p-2 text-cyan-400 border border-cyan-500/20">
                <Sparkles className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-black tracking-tight text-cyan-400">
                  ${totalSavingsUSD.toFixed(2)}
                </span>
                <span className="text-xs font-mono font-semibold text-emerald-400">
                  50% Off Input
                </span>
              </div>

              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Cache Hit Ratio</span>
                  <span className="font-mono font-semibold text-cyan-300">64.2%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-teal-400 transition-all duration-500"
                    style={{ width: "64.2%" }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-slate-200 pt-2.5 text-xs text-slate-500">
                <span>Cached Tokens: <strong className="text-cyan-300 font-mono">{cachedTokensTotalM}M</strong></span>
                <span>Latency: <strong className="text-emerald-400 font-mono">-420ms</strong></span>
              </div>
            </CardContent>
          </Card>

          {/* Card 4: TPM & RPM Rate Limits Status */}
          <Card className="relative overflow-hidden border-slate-200 bg-slate-50  shadow-xl hover:border-slate-200/80 transition-all duration-200 group">
            <div className="absolute top-0 right-0 h-24 w-24 translate-x-6 -translate-y-6 rounded-full bg-purple-500/10 blur-2xl group-hover:bg-purple-500/20 transition-all" />
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Real-Time Rate Limits
              </span>
              <div className="rounded-lg bg-purple-500/10 p-2 text-purple-400 border border-purple-500/20">
                <Activity className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-3xl font-black tracking-tight text-slate-900">
                    {Math.round(currentTPM / 1000)}k
                  </span>
                  <span className="text-xs text-slate-500 ml-1">TPM</span>
                </div>
                <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 bg-emerald-500/10 text-[10px] flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3" /> Safe Zone
                </Badge>
              </div>

              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between text-xs text-slate-500">
                  <span>TPM Cap (500k Tier Limit)</span>
                  <span className="font-mono font-semibold text-purple-300">{tpmPercentage}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-500"
                    style={{ width: `${tpmPercentage}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-slate-200 pt-2.5 text-xs text-slate-500">
                <span>RPM: <strong className="text-slate-700 font-mono">{currentRPM} / {rpmLimit} ({rpmPercentage}%)</strong></span>
                <span>Throttles: <strong className="text-emerald-400 font-mono">0 (0.00%)</strong></span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ========================================================================= */}
        {/* COMPREHENSIVE LIMITS & SAFEGUARDS SECTION */}
        {/* ========================================================================= */}
        <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-6  shadow-md">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-slate-200 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <Gauge className="h-5 w-5 text-indigo-400" />
                <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                  Budget Safeguards & Quota Progress
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Automated circuit breakers, spend limits, and multi-tier throttle alerts for OpenAI API workloads.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center space-x-2 rounded-lg bg-slate-100 px-3 py-1.5 border border-slate-200/50">
                <Switch
                  id="hard-cap"
                  checked={hardCapEnabled}
                  onCheckedChange={(checked) => {
                    setHardCapEnabled(checked);
                    toast.info(`Hard Spend Cap ${checked ? "Enabled" : "Disabled"}`, {
                      description: checked
                        ? "API calls will pause if monthly limit is reached."
                        : "Spend overflow allowed with notification alerts.",
                    });
                  }}
                />
                <label
                  htmlFor="hard-cap"
                  className="text-xs font-medium leading-none text-slate-800 cursor-pointer"
                >
                  Auto Hard Stop at 100% Limit
                </label>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="bg-slate-100 border-slate-200 text-xs text-slate-800 hover:bg-zinc-700"
                onClick={() => {
                  toast.success("Quota Request Submitted", {
                    description: "Tier 6 expansion request sent to OpenAI Enterprise account manager.",
                  });
                }}
              >
                Request Limit Increase
              </Button>
            </div>
          </div>

          {/* Multi-Progress Bars Grid */}
          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
            {/* Limit Bar 1: Monthly Spend */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-emerald-400" />
                  <span className="text-xs font-bold uppercase text-slate-700">Monthly Budget Cap</span>
                </div>
                <Badge variant="outline" className="text-[11px] font-mono border-emerald-500/30 text-emerald-300 bg-emerald-500/10">
                  {spendPercentage}% Used
                </Badge>
              </div>
              <div className="space-y-1">
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100 p-0.5">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 transition-all duration-700"
                    style={{ width: `${spendPercentage}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] font-mono text-slate-500 pt-1">
                  <span>${currentTotalSpent.toFixed(2)} Incurred</span>
                  <span>${monthlyBudgetLimit.toFixed(2)} Limit</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-200 pt-2">
                <span>Alert Trigger: 80% ($1,600)</span>
                <span className="text-emerald-400 font-medium">$571.35 Available</span>
              </div>
            </div>

            {/* Limit Bar 2: GPT-4o TPM Quota */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-indigo-400" />
                  <span className="text-xs font-bold uppercase text-slate-700">GPT-4o TPM Ceiling</span>
                </div>
                <Badge variant="outline" className="text-[11px] font-mono border-indigo-500/30 text-indigo-300 bg-indigo-500/10">
                  {tpmPercentage}% Peak
                </Badge>
              </div>
              <div className="space-y-1">
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100 p-0.5">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-700"
                    style={{ width: `${tpmPercentage}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] font-mono text-slate-500 pt-1">
                  <span>{currentTPM.toLocaleString()} TPM Current</span>
                  <span>{tpmLimit.toLocaleString()} TPM Max</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-200 pt-2">
                <span>Concurrency: 48 Workers</span>
                <span className="text-indigo-400 font-medium">158,000 TPM Headroom</span>
              </div>
            </div>

            {/* Limit Bar 3: Daily Soft Spend Limit */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Flame className="h-4 w-4 text-amber-400" />
                  <span className="text-xs font-bold uppercase text-slate-700">Daily Soft Target</span>
                </div>
                <Badge variant="outline" className="text-[11px] font-mono border-amber-500/30 text-amber-300 bg-amber-500/10">
                  64.6% Used
                </Badge>
              </div>
              <div className="space-y-1">
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100 p-0.5">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-500 via-orange-400 to-rose-500 transition-all duration-700"
                    style={{ width: "64.6%" }}
                  />
                </div>
                <div className="flex justify-between text-[11px] font-mono text-slate-500 pt-1">
                  <span>$48.50 Today</span>
                  <span>$75.00 Soft Cap</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-200 pt-2">
                <span>Resets in 8h 12m</span>
                <span className="text-amber-400 font-medium">$26.50 Remaining</span>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* MAIN TAB NAVIGATION: CHARTS, MODELS, SIMULATOR & LOGS */}
        {/* ========================================================================= */}
        <div className="mt-8">
          <Tabs defaultValue="overview" className="w-full space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-3">
              <TabsList className="bg-slate-50 border border-slate-200 p-1 rounded-xl">
                <TabsTrigger
                  value="overview"
                  className="data-[state=active]:bg-indigo-600 data-[state=active]:text-slate-900 text-xs font-medium px-4 py-2 rounded-lg transition-all"
                >
                  <BarChart3 className="h-3.5 w-3.5 mr-1.5" />
                  Consumption Velocity
                </TabsTrigger>
                <TabsTrigger
                  value="models"
                  className="data-[state=active]:bg-indigo-600 data-[state=active]:text-slate-900 text-xs font-medium px-4 py-2 rounded-lg transition-all"
                >
                  <PieChartIcon className="h-3.5 w-3.5 mr-1.5" />
                  Model Breakdown
                </TabsTrigger>
                <TabsTrigger
                  value="simulator"
                  className="data-[state=active]:bg-indigo-600 data-[state=active]:text-slate-900 text-xs font-medium px-4 py-2 rounded-lg transition-all"
                >
                  <Sliders className="h-3.5 w-3.5 mr-1.5" />
                  Cost Calculator
                </TabsTrigger>
                <TabsTrigger
                  value="logs"
                  className="data-[state=active]:bg-indigo-600 data-[state=active]:text-slate-900 text-xs font-medium px-4 py-2 rounded-lg transition-all"
                >
                  <Database className="h-3.5 w-3.5 mr-1.5" />
                  Live Request Logs
                </TabsTrigger>
              </TabsList>

              <div className="text-xs text-slate-500 flex items-center gap-1.5 font-mono">
                <Clock className="h-3.5 w-3.5 text-slate-400" />
                Realtime Sync: Active
              </div>
            </div>

            {/* --------------------------------------------------------------------- */}
            {/* TAB 1: CONSUMPTION & ACCRUED COST CHARTS */}
            {/* --------------------------------------------------------------------- */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                {/* Area Chart: Token Volume Breakdown */}
                <Card className="lg:col-span-8 border-slate-200 bg-slate-50  shadow-xl">
                  <CardHeader className="flex flex-row items-center justify-between pb-4">
                    <div>
                      <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                        <span>Daily GPT-4o Token Consumption</span>
                        <Badge variant="outline" className="border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-[10px]">
                          Millions / Day
                        </Badge>
                      </CardTitle>
                      <CardDescription className="text-xs text-slate-500 mt-1">
                        Breakdown between standard prompt tokens, cached input tokens, and completion output.
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[320px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={DAILY_USAGE_DATA}
                          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                        >
                          <defs>
                            <linearGradient id="colorOutput" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#ec4899" stopOpacity={0.4} />
                              <stop offset="95%" stopColor="#ec4899" stopOpacity={0.0} />
                            </linearGradient>
                            <linearGradient id="colorInput" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                              <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                            </linearGradient>
                            <linearGradient id="colorCached" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                              <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                          <XAxis dataKey="day" stroke="#71717a" fontSize={11} tickLine={false} />
                          <YAxis stroke="#71717a" fontSize={11} tickLine={false} unit="M" />
                          <RechartsTooltip
                            contentStyle={{
                              backgroundColor: "#18181b",
                              borderColor: "#3f3f46",
                              borderRadius: "0.75rem",
                              fontSize: "12px",
                              color: "#f4f4f5",
                              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.5)",
                            }}
                          />
                          <Legend
                            wrapperStyle={{ fontSize: "12px", paddingTop: "12px" }}
                            iconType="circle"
                          />
                          <Area
                            type="monotone"
                            dataKey="gpt4oInput"
                            name="Uncached Input (M)"
                            stroke="#6366f1"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorInput)"
                            stackId="1"
                          />
                          <Area
                            type="monotone"
                            dataKey="gpt4oCached"
                            name="Prompt Cache Hit (M)"
                            stroke="#06b6d4"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorCached)"
                            stackId="1"
                          />
                          <Area
                            type="monotone"
                            dataKey="gpt4oOutput"
                            name="Completion Output (M)"
                            stroke="#ec4899"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorOutput)"
                            stackId="1"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Line Chart: Cumulative Cost & Forecast */}
                <Card className="lg:col-span-4 border-slate-200 bg-slate-50  shadow-xl">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-base font-bold text-slate-900 flex items-center justify-between">
                      <span>Cumulative Cost Curve</span>
                      <span className="font-mono text-xs font-normal text-emerald-400">$1,428.65 Actual</span>
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-500">
                      Actual spend path vs forecasted trend against $2,000 threshold.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[320px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={CUMULATIVE_COST_DATA}
                          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                          <XAxis dataKey="day" stroke="#71717a" fontSize={10} tickLine={false} />
                          <YAxis stroke="#71717a" fontSize={10} tickLine={false} unit="$" />
                          <RechartsTooltip
                            contentStyle={{
                              backgroundColor: "#18181b",
                              borderColor: "#3f3f46",
                              borderRadius: "0.75rem",
                              fontSize: "12px",
                              color: "#f4f4f5",
                            }}
                          />
                          <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }} />
                          <Line
                            type="monotone"
                            dataKey="actual"
                            name="Actual Cost ($)"
                            stroke="#10b981"
                            strokeWidth={3}
                            dot={{ r: 4, fill: "#10b981" }}
                          />
                          <Line
                            type="monotone"
                            dataKey="projected"
                            name="Forecast ($)"
                            stroke="#818cf8"
                            strokeWidth={2}
                            strokeDasharray="4 4"
                            dot={false}
                          />
                          <Line
                            type="monotone"
                            dataKey="budgetLimit"
                            name="Budget Limit ($)"
                            stroke="#f43f5e"
                            strokeWidth={1.5}
                            strokeDasharray="2 2"
                            dot={false}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Hourly Velocity Sub-Card */}
              <Card className="border-slate-200 bg-slate-50  shadow-xl">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div>
                    <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Clock className="h-4 w-4 text-indigo-400" />
                      Hourly Request Velocity & Peak TPM Concurrency (Last 24 Hours)
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-500">
                      Identifies surge hours to help schedule batch processing during off-peak discount windows.
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="border-slate-200 bg-slate-100 text-slate-700 font-mono text-xs">
                    Peak: 395k TPM @ 14:00
                  </Badge>
                </CardHeader>
                <CardContent>
                  <div className="h-[200px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={HOURLY_VELOCITY} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                        <XAxis dataKey="hour" stroke="#71717a" fontSize={11} tickLine={false} />
                        <YAxis stroke="#71717a" fontSize={11} tickLine={false} />
                        <RechartsTooltip
                          contentStyle={{
                            backgroundColor: "#18181b",
                            borderColor: "#3f3f46",
                            borderRadius: "0.75rem",
                            fontSize: "12px",
                            color: "#f4f4f5",
                          }}
                        />
                        <Bar
                          dataKey="tokens"
                          name="Tokens Processed"
                          fill="#6366f1"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* --------------------------------------------------------------------- */}
            {/* TAB 2: MODEL BREAKDOWN & UNIT PRICING */}
            {/* --------------------------------------------------------------------- */}
            <TabsContent value="models" className="space-y-6">
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                {/* Donut Chart */}
                <Card className="lg:col-span-5 border-slate-200 bg-slate-50  shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-base font-bold text-slate-900">
                      Spend Share by Model Tier
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-500">
                      GPT-4o accounts for 92.6% of overall API expenditure.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center justify-center">
                    <div className="h-[260px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={MODEL_SHARE_DATA}
                            cx="50%"
                            cy="50%"
                            innerRadius={65}
                            outerRadius={95}
                            paddingAngle={4}
                            dataKey="value"
                          >
                            {MODEL_SHARE_DATA.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} stroke="#18181b" strokeWidth={2} />
                            ))}
                          </Pie>
                          <RechartsTooltip
                            formatter={(value: any, name: any) => [`${value}% ($${MODEL_SHARE_DATA.find(d => d.name === name)?.cost})`, name]}
                            contentStyle={{
                              backgroundColor: "#18181b",
                              borderColor: "#3f3f46",
                              borderRadius: "0.75rem",
                              fontSize: "12px",
                              color: "#f4f4f5",
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="w-full space-y-2 pt-2">
                      {MODEL_SHARE_DATA.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs border-b border-slate-200 pb-1.5 last:border-0">
                          <div className="flex items-center gap-2">
                            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                            <span className="text-slate-700 font-medium">{item.name}</span>
                          </div>
                          <div className="flex items-center gap-3 font-mono">
                            <span className="text-slate-500">{item.value}%</span>
                            <span className="text-slate-900 font-bold">${item.cost.toFixed(2)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Model Catalog & Unit Economics Cards */}
                <div className="lg:col-span-7 space-y-4">
                  {Object.entries(PRICING_RATES).map(([modelKey, rate]) => (
                    <div
                      key={modelKey}
                      className="rounded-xl border border-slate-200 bg-slate-50 p-4 backdrop-blur-md hover:border-slate-200 transition-all space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <Badge variant="outline" className={`${rate.badgeColor} font-mono text-xs font-bold px-2.5 py-1`}>
                            {modelKey}
                          </Badge>
                          {modelKey === "gpt-4o" && (
                            <Badge className="bg-indigo-600 text-slate-900 text-[10px]">Primary Production Engine</Badge>
                          )}
                        </div>
                        <span className="text-xs text-slate-500 font-mono">Context: 128k Tokens</span>
                      </div>

                      <div className="grid grid-cols-3 gap-3 rounded-lg bg-slate-50 p-3 text-xs">
                        <div>
                          <span className="text-slate-400 block">Prompt Input</span>
                          <span className="text-slate-800 font-mono font-bold text-sm">
                            ${rate.inputPerMillion.toFixed(2)}
                          </span>
                          <span className="text-[10px] text-slate-400 block">per 1M tokens</span>
                        </div>
                        <div>
                          <span className="text-cyan-400/90 block flex items-center gap-1">
                            <Sparkles className="h-3 w-3" /> Cached Input
                          </span>
                          <span className="text-cyan-300 font-mono font-bold text-sm">
                            ${rate.cachedInputPerMillion.toFixed(2)}
                          </span>
                          <span className="text-[10px] text-emerald-400 block">50% discount</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block">Output / Completion</span>
                          <span className="text-slate-800 font-mono font-bold text-sm">
                            ${rate.outputPerMillion.toFixed(2)}
                          </span>
                          <span className="text-[10px] text-slate-400 block">per 1M tokens</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Cost-Optimization Insights */}
              <div className="rounded-xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/40 via-purple-950/20 to-zinc-900/60 p-5 ">
                <div className="flex items-start gap-3.5">
                  <div className="rounded-lg bg-indigo-500/20 p-2.5 text-indigo-400 border border-indigo-500/40">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div className="space-y-1.5 flex-1">
                    <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      Autonomous Cost Optimization Opportunities
                      <Badge className="bg-emerald-500/20 text-emerald-300 text-[10px] border-emerald-500/30">
                        ~$277/mo Potential Savings
                      </Badge>
                    </h4>
                    <p className="text-xs text-slate-700 leading-relaxed">
                      1. <strong className="text-indigo-300">Prompt Prefix Static Alignment:</strong> Group system prompts in the <code className="text-slate-800 bg-slate-100 px-1 py-0.5 rounded">doc-rag-pipeline</code> to trigger OpenAI automatic 50% cached discounts for identical blocks {'>'} 1024 tokens.
                    </p>
                    <p className="text-xs text-slate-700 leading-relaxed">
                      2. <strong className="text-indigo-300">Model Cascading:</strong> Routing lightweight sentiment & JSON tagging tasks from <code className="text-slate-800 bg-slate-100 px-1 py-0.5 rounded">gpt-4o</code> to <code className="text-cyan-300 bg-slate-100 px-1 py-0.5 rounded">gpt-4o-mini</code> reduces token expenditure by ~97% with negligible quality loss.
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* --------------------------------------------------------------------- */}
            {/* TAB 3: REAL-TIME COST CALCULATOR & SIMULATOR */}
            {/* --------------------------------------------------------------------- */}
            <TabsContent value="simulator" className="space-y-6">
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                {/* Sliders Form Card */}
                <Card className="lg:col-span-6 border-slate-200 bg-slate-50  shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <Sliders className="h-4 w-4 text-indigo-400" />
                      Workload Cost Simulator
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-500">
                      Adjust token volume parameters to compute estimated OpenAI invoice lines.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Prompt Tokens Slider */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <label className="font-semibold text-slate-700">Input / Prompt Volume</label>
                        <span className="font-mono font-bold text-indigo-400">{simInputTokensM} Million Tokens</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="100"
                        step="1"
                        value={simInputTokensM}
                        onChange={(e) => setSimInputTokensM(Number(e.target.value))}
                        className="w-full accent-indigo-500 cursor-pointer bg-slate-100 h-2 rounded-lg"
                      />
                      <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                        <span>1M</span>
                        <span>50M</span>
                        <span>100M</span>
                      </div>
                    </div>

                    {/* Completion Tokens Slider */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <label className="font-semibold text-slate-700">Output / Completion Volume</label>
                        <span className="font-mono font-bold text-pink-400">{simOutputTokensM} Million Tokens</span>
                      </div>
                      <input
                        type="range"
                        min="0.5"
                        max="30"
                        step="0.5"
                        value={simOutputTokensM}
                        onChange={(e) => setSimOutputTokensM(Number(e.target.value))}
                        className="w-full accent-pink-500 cursor-pointer bg-slate-100 h-2 rounded-lg"
                      />
                      <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                        <span>0.5M</span>
                        <span>15M</span>
                        <span>30M</span>
                      </div>
                    </div>

                    {/* Prompt Cache Hit Ratio Slider */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <label className="font-semibold text-slate-700 flex items-center gap-1.5">
                          <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
                          Prompt Cache Hit Ratio
                        </label>
                        <span className="font-mono font-bold text-cyan-400">{simCachedRatio}% Hit Rate</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="90"
                        step="5"
                        value={simCachedRatio}
                        onChange={(e) => setSimCachedRatio(Number(e.target.value))}
                        className="w-full accent-cyan-400 cursor-pointer bg-slate-100 h-2 rounded-lg"
                      />
                      <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                        <span>0% (Cold)</span>
                        <span>50%</span>
                        <span>90% (Ultra Warm)</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Simulation Output Comparison Card */}
                <Card className="lg:col-span-6 border-slate-200 bg-slate-50  shadow-xl flex flex-col justify-between">
                  <CardHeader>
                    <CardTitle className="text-base font-bold text-slate-900 flex items-center justify-between">
                      <span>Projected Invoice Impact</span>
                      <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs">
                        ${simCalculations.cacheSavings} Saved via Caching
                      </Badge>
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-500">
                      Comparison between flagship GPT-4o and cost-efficient companion tiers.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* GPT-4o Projected Box */}
                    <div className="rounded-xl border border-indigo-500/30 bg-indigo-950/20 p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-indigo-300 uppercase tracking-wide">
                          GPT-4o Estimated Cost
                        </span>
                        <span className="text-2xl font-black text-slate-900 font-mono">
                          ${simCalculations.gpt4oTotal} <span className="text-xs font-normal text-slate-500">USD</span>
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-[11px] font-mono text-slate-500 pt-1 border-t border-indigo-900/40">
                        <div>Uncached In: <strong className="text-slate-800">${simCalculations.gpt4oUncachedInputCost}</strong></div>
                        <div>Cached In: <strong className="text-cyan-300">${simCalculations.gpt4oCachedInputCost}</strong></div>
                        <div>Output: <strong className="text-pink-300">${simCalculations.gpt4oOutputCost}</strong></div>
                      </div>
                    </div>

                    {/* GPT-4o-mini Projected Box */}
                    <div className="rounded-xl border border-cyan-500/30 bg-cyan-950/20 p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-cyan-300 uppercase tracking-wide">
                          GPT-4o-mini Estimated Cost
                        </span>
                        <span className="text-2xl font-black text-cyan-300 font-mono">
                          ${simCalculations.miniTotal} <span className="text-xs font-normal text-slate-500">USD</span>
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Provides a <strong className="text-emerald-400 font-bold">~93% reduction</strong> in cost. Ideal for summarization, entity extraction, and evaluation tasks.
                      </p>
                    </div>
                  </CardContent>
                  <CardFooter className="border-t border-slate-200 pt-4">
                    <Button
                      onClick={() => handleCopySnippet(`Estimated GPT-4o: $${simCalculations.gpt4oTotal} USD (${simInputTokensM}M input, ${simOutputTokensM}M output)`)}
                      className="w-full bg-slate-100 hover:bg-zinc-700 text-slate-800 text-xs flex items-center justify-center gap-1.5"
                    >
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copy Estimate Summary</span>
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </TabsContent>

            {/* --------------------------------------------------------------------- */}
            {/* TAB 4: LIVE REQUEST LOGS & TELEMETRY AUDIT */}
            {/* --------------------------------------------------------------------- */}
            <TabsContent value="logs" className="space-y-4">
              <Card className="border-slate-200 bg-slate-50  shadow-xl">
                <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4">
                  <div>
                    <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <Database className="h-4 w-4 text-indigo-400" />
                      Real-Time Token Usage Stream
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-500">
                      Live audit log of incoming API calls, model routing, cached ratios, and execution cost.
                    </CardDescription>
                  </div>

                  {/* Search and Filters */}
                  <div className="flex items-center gap-3">
                    <div className="relative w-48 sm:w-64">
                      <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                      <Input
                        placeholder="Search service, request ID..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-8 bg-slate-50 border-slate-200 text-xs text-slate-800 h-9"
                      />
                    </div>

                    <Select value={modelFilter} onValueChange={(val) => val && setModelFilter(val)}>
                      <SelectTrigger className="w-[140px] bg-slate-50 border-slate-200 text-xs text-slate-800 h-9">
                        <SelectValue placeholder="All Models" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-50 border-slate-200 text-slate-800">
                        <SelectItem value="all">All Models</SelectItem>
                        <SelectItem value="gpt-4o">gpt-4o</SelectItem>
                        <SelectItem value="gpt-4o-mini">gpt-4o-mini</SelectItem>
                        <SelectItem value="text-embedding-3-large">embeddings</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader className="bg-slate-50 border-slate-200">
                        <TableRow className="border-slate-200 hover:bg-transparent text-slate-500 text-xs">
                          <TableHead className="font-semibold text-slate-700">Request ID & Time</TableHead>
                          <TableHead className="font-semibold text-slate-700">Model</TableHead>
                          <TableHead className="font-semibold text-slate-700">Service / Agent</TableHead>
                          <TableHead className="font-semibold text-slate-700 text-right">Prompt Tokens</TableHead>
                          <TableHead className="font-semibold text-slate-700 text-right">Cached Input</TableHead>
                          <TableHead className="font-semibold text-slate-700 text-right">Completion</TableHead>
                          <TableHead className="font-semibold text-slate-700 text-right">Latency</TableHead>
                          <TableHead className="font-semibold text-slate-700 text-right">Est. Cost</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredLogs.map((log) => (
                          <TableRow
                            key={log.id}
                            className="border-slate-200 text-xs hover:bg-slate-100 transition-colors"
                          >
                            <TableCell className="font-mono font-medium text-slate-800">
                              <div className="flex items-center gap-1.5">
                                <span className="text-indigo-400">{log.id}</span>
                                <span className="text-[10px] text-slate-400">({log.timestamp})</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={`text-[10px] font-mono ${
                                  log.model.includes("mini")
                                    ? "border-cyan-500/30 text-cyan-400 bg-cyan-500/10"
                                    : log.model.includes("embedding")
                                    ? "border-emerald-500/30 text-emerald-400 bg-emerald-500/10"
                                    : "border-indigo-500/30 text-indigo-400 bg-indigo-500/10"
                                }`}
                              >
                                {log.model}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-slate-700 font-mono">
                              {log.service}
                            </TableCell>
                            <TableCell className="text-right font-mono text-slate-700">
                              {log.inputTokens.toLocaleString()}
                            </TableCell>
                            <TableCell className="text-right font-mono">
                              {log.cachedTokens > 0 ? (
                                <span className="text-cyan-400 font-semibold flex items-center justify-end gap-1">
                                  <Sparkles className="h-3 w-3" />
                                  {log.cachedTokens.toLocaleString()}
                                </span>
                              ) : (
                                <span className="text-zinc-600">—</span>
                              )}
                            </TableCell>
                            <TableCell className="text-right font-mono text-pink-300">
                              {log.outputTokens > 0 ? log.outputTokens.toLocaleString() : "—"}
                            </TableCell>
                            <TableCell className="text-right font-mono text-slate-500">
                              {log.latency}
                            </TableCell>
                            <TableCell className="text-right font-mono font-bold text-slate-900">
                              {log.cost}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
                <CardFooter className="flex items-center justify-between border-t border-slate-200 p-4 text-xs text-slate-500">
                  <span>Showing {filteredLogs.length} live requests</span>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" disabled className="bg-white border-slate-200 text-zinc-600 text-xs h-7">
                      Previous
                    </Button>
                    <Button variant="outline" size="sm" className="bg-white border-slate-200 text-slate-700 hover:bg-slate-100 text-xs h-7">
                      Next
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}


