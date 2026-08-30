"use client";

import React, { useState, useEffect } from "react";
import {
  Zap,
  Play,
  Pause,
  Plus,
  Trash2,
  Edit3,
  Settings,
  ArrowRight,
  ArrowDown,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Filter,
  Database,
  Send,
  MessageSquare,
  Webhook,
  Bot,
  Brain,
  RefreshCw,
  Layers,
  ChevronRight,
  ChevronDown,
  Search,
  Copy,
  Check,
  ExternalLink,
  Activity,
  BarChart3,
  Sliders,
  X,
  GitBranch,
  Save,
  Terminal,
  Download,
  Upload,
  Share2,
  Info,
  Shield,
  Code,
  Flame,
  CheckCheck,
  RotateCcw,
  Boxes,
  HelpCircle,
  MoreVertical,
  Maximize2,
  Minimize2,
  Eye,
  FileJson,
  Radio,
  Cpu,
  Mail,
  Workflow,
  ArrowUpRight
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

// ── Types ─────────────────────────────────────────────────────────────

export type StepType = "trigger" | "action" | "condition" | "ai" | "delay";

export interface WorkflowStep {
  id: string;
  name: string;
  type: StepType;
  provider: string;
  icon: string;
  color: string;
  badge: string;
  summary: string;
  config: {
    endpoint?: string;
    event?: string;
    model?: string;
    prompt?: string;
    condition?: string;
    channel?: string;
    recipient?: string;
    delayTime?: string;
    retries?: number;
    table?: string;
    action?: string;
    headers?: string;
    bodyTemplate?: string;
    [key: string]: any;
  };
  sampleOutput: Record<string, any>;
  status: "idle" | "running" | "success" | "error";
  latencyMs?: number;
}

export interface WorkflowItem {
  id: string;
  name: string;
  description: string;
  category: "Neuro & AI" | "Operations" | "Finance & Billing" | "CRM & Sales";
  isActive: boolean;
  version: string;
  lastRun: string;
  totalRuns: number;
  successRate: number;
  steps: WorkflowStep[];
  updatedAt: string;
}

export interface ExecutionLog {
  id: string;
  workflowId: string;
  workflowName: string;
  triggerEvent: string;
  status: "success" | "error" | "running";
  durationMs: number;
  timestamp: string;
  stepsExecuted: number;
  totalSteps: number;
  errorDetails?: string;
  payloadPreview: Record<string, any>;
}

// ── Mock Data ─────────────────────────────────────────────────────────

const INITIAL_STEPS: WorkflowStep[] = [
  {
    id: "step-1",
    name: "Mensaje Entrante de WhatsApp (Disparador)",
    type: "trigger",
    provider: "WhatsApp Cloud / QR Web Bridge",
    icon: "MessageSquare",
    color: "from-emerald-500 to-teal-600",
    badge: "Disparador en Tiempo Real",
    summary: "Escucha mensajes de clientes desde WhatsApp (Autos, Citas, Servicios o Consultas)",
    config: {
      event: "whatsapp.message.received",
      endpoint: "https://neurolabs-ecosystem.vercel.app/api/webhooks/whatsapp",
      bodyTemplate: '{"from": "{{message.from}}", "text": "{{message.text}}"}',
    },
    sampleOutput: {
      event: "whatsapp.message.received",
      senderPhone: "+573005765530",
      senderName: "Carlos Restrepo",
      messageText: "Hola, me interesa una cotización de servicios y agendar una cita",
      receivedAt: "2026-08-19T20:12:10.201Z",
    },
    status: "idle",
  },
  {
    id: "step-2",
    name: "NeuroCore Llama 120B Consultivo & Perfilamiento",
    type: "ai",
    provider: "Groq LPU Engine & NeuroLabs",
    icon: "Sparkles",
    color: "from-purple-500 to-indigo-600",
    badge: "Inferencia Neuronal",
    summary: "Analiza la intención de compra del cliente y perfila requerimientos automáticamente",
    config: {
      model: "openai/gpt-oss-120b",
      prompt:
        "Atiende cordialmente al cliente {{step1.senderName}}, clasifica su intención (ALTA, MEDIA, BAJA) y formula cotización técnica con opciones de catálogo.",
      temperature: 0.2,
      retries: 3,
    },
    sampleOutput: {
      classification: "INTENCION_COMPRA_ALTA",
      leadScore: 92,
      requiresIntervention: true,
      executiveSummary:
        "Cliente calificado con presupuesto confirmado. Requiere cierre formal y agenda de cita.",
      tokenCostUsd: 0.0004,
      latency: "135ms",
    },
    status: "idle",
  },
  {
    id: "step-3",
    name: "Enrutador de Negocio: Score > 80 (Cierre Inmediato)",
    type: "condition",
    provider: "Logic Router",
    icon: "GitBranch",
    color: "from-amber-500 to-orange-600",
    badge: "Bifurcación / Lógica",
    summary: "Evalúa `{{step2.leadScore}} >= 80` para despachar cierre automático y notificar al dueño",
    config: {
      condition: "step2.leadScore >= 80 && step2.requiresIntervention === true",
    },
    sampleOutput: {
      matched: true,
      branchSelected: "Rama A: Lead Calificado de Alto Valor",
      evaluatedAt: "2026-08-19T20:12:10.450Z",
    },
    status: "idle",
  },
  {
    id: "step-4",
    name: "Registro Automático de Prospecto en CRM",
    type: "action",
    provider: "Supabase Postgres CRM",
    icon: "Database",
    color: "from-blue-500 to-cyan-600",
    badge: "Base de Datos",
    summary: "Inserta el cliente y crea la tarjeta en el tablero Kanban en estado NUEVO / CALIFICADO",
    config: {
      table: "leads",
      action: "INSERT",
      bodyTemplate:
        '{"name": "{{step1.senderName}}", "phone": "{{step1.senderPhone}}", "score": {{step2.leadScore}}, "status": "QUALIFIED"}',
    },
    sampleOutput: {
      insertedRows: 1,
      recordId: "lead_crm_88921a",
      syncStatus: "SYNCHRONIZED",
      latencyMs: 24,
    },
    status: "idle",
  },
  {
    id: "step-5",
    name: "Alerta VIP al WhatsApp del Dueño de la Empresa",
    type: "action",
    provider: "WhatsApp Cloud / QR",
    icon: "Send",
    color: "from-emerald-500 to-teal-600",
    badge: "Notificación de Cierre",
    summary: "Envía un mensaje privado al WhatsApp de la gerencia (+57 323 5845145) con el contacto listo para cerrar",
    config: {
      recipient: "+573235845145",
      bodyTemplate:
        "🚀 *NUEVO LEAD CALIFICADO POR IA*\nCliente: `{{step1.senderName}}`\nTel: `{{step1.senderPhone}}`\nScore: `{{step2.leadScore}}%`\nInterés: *Listo para formalizar*",
    },
    sampleOutput: {
      messageId: "wamid_vip_alert_991823",
      deliveredAt: "2026-08-19T20:12:10.680Z",
    },
    status: "idle",
  },
];

const AVAILABLE_BLOCKS = [
  {
    category: "Triggers",
    items: [
      {
        name: "NeuroLabs Realtime Telemetry",
        provider: "NeuroLabs Stream",
        type: "trigger" as StepType,
        icon: "Brain",
        color: "from-cyan-500 to-blue-600",
        badge: "Biometric Event",
        summary: "Triggers on real-time neural frequency or cognitive load shifts",
        defaultConfig: { event: "eeg.anomaly.spike", threshold: 0.85 },
      },
      {
        name: "Incoming Webhook (HTTP POST)",
        provider: "Webhook Engine",
        type: "trigger" as StepType,
        icon: "Webhook",
        color: "from-violet-500 to-purple-600",
        badge: "API Gateway",
        summary: "Accepts JSON payload payloads from any third-party service",
        defaultConfig: { endpoint: "https://api.neurolabs.io/v1/hooks/wh_live" },
      },
      {
        name: "Scheduled Cron Interval",
        provider: "Scheduler Engine",
        type: "trigger" as StepType,
        icon: "Clock",
        color: "from-emerald-500 to-green-600",
        badge: "Schedule",
        summary: "Runs pipeline every 5m, hourly, daily, or on custom cron",
        defaultConfig: { cron: "0 * * * *" },
      },
      {
        name: "Stripe Payment Succeeded",
        provider: "Stripe Billing",
        type: "trigger" as StepType,
        icon: "Zap",
        color: "from-indigo-500 to-blue-700",
        badge: "Fintech",
        summary: "Fires when customer upgrades or subscribes to Enterprise",
        defaultConfig: { event: "invoice.payment_succeeded" },
      },
    ],
  },
  {
    category: "AI & Cognitive Intelligence",
    items: [
      {
        name: "NeuroCore GPT-4o Reasoning",
        provider: "OpenAI & NeuroLabs",
        type: "ai" as StepType,
        icon: "Sparkles",
        color: "from-purple-500 to-indigo-600",
        badge: "LLM / Triage",
        summary: "Contextual classification, natural language synthesis, and anomaly analysis",
        defaultConfig: { model: "gpt-4o", temperature: 0.2 },
      },
      {
        name: "Claude 3.5 Sonnet Deep Extractor",
        provider: "Anthropic",
        type: "ai" as StepType,
        icon: "Bot",
        color: "from-amber-500 to-red-600",
        badge: "Deep Reasoning",
        summary: "Extracts structured metadata, regulatory compliance reports, or legal docs",
        defaultConfig: { model: "claude-3-5-sonnet-20241022" },
      },
      {
        name: "Vector Neural Similarity Match",
        provider: "NeuroLabs Vector DB",
        type: "ai" as StepType,
        icon: "Cpu",
        color: "from-pink-500 to-rose-600",
        badge: "Embeddings",
        summary: "Compares current neural wave pattern with 10M+ baseline benchmark vectors",
        defaultConfig: { collection: "biometric_baselines_v3" },
      },
    ],
  },
  {
    category: "Logic, Flow & Control",
    items: [
      {
        name: "Conditional Branch Router (If/Else)",
        provider: "Logic Core",
        type: "condition" as StepType,
        icon: "GitBranch",
        color: "from-amber-500 to-orange-600",
        badge: "Decision",
        summary: "Splits execution path based on numerical or boolean expressions",
        defaultConfig: { condition: "score >= 0.80" },
      },
      {
        name: "Delay / Wait Timer",
        provider: "Flow Control",
        type: "delay" as StepType,
        icon: "Clock",
        color: "from-slate-500 to-slate-700",
        badge: "Timer",
        summary: "Pauses pipeline execution for seconds, hours, or until a webhook callback",
        defaultConfig: { delayTime: "15m" },
      },
      {
        name: "Custom JavaScript / Python Code",
        provider: "V8 Sandbox",
        type: "action" as StepType,
        icon: "Code",
        color: "from-yellow-500 to-amber-600",
        badge: "Code Exec",
        summary: "Executes custom sandboxed JS transformation script",
        defaultConfig: { code: "return { transformed: input.raw * 100 };" },
      },
    ],
  },
  {
    category: "Messaging & Ops",
    items: [
      {
        name: "Slack Enterprise Alert",
        provider: "Slack",
        type: "action" as StepType,
        icon: "MessageSquare",
        color: "from-emerald-500 to-teal-600",
        badge: "Chat Ops",
        summary: "Posts rich formatted blocks to team channels or direct messages",
        defaultConfig: { channel: "#general" },
      },
      {
        name: "Resend Transactional Email",
        provider: "Resend",
        type: "action" as StepType,
        icon: "Mail",
        color: "from-blue-500 to-indigo-600",
        badge: "Email",
        summary: "Dispatches HTML emails with dynamic tags and attachments",
        defaultConfig: { from: "alerts@neurolabs.io", to: "doctor@hospital.org" },
      },
      {
        name: "PagerDuty Incident Trigger",
        provider: "PagerDuty",
        type: "action" as StepType,
        icon: "Flame",
        color: "from-red-500 to-rose-700",
        badge: "On-Call",
        summary: "Triggers on-call engineer escalations with automated SLA policies",
        defaultConfig: { urgency: "high", service: "NeuroTelemetry-Core" },
      },
    ],
  },
  {
    category: "Data & Cloud Infrastructure",
    items: [
      {
        name: "Supabase / PostgreSQL Mutation",
        provider: "Supabase",
        type: "action" as StepType,
        icon: "Database",
        color: "from-blue-500 to-cyan-600",
        badge: "Database",
        summary: "Inserts, updates, or queries records with row-level security",
        defaultConfig: { table: "events", action: "INSERT" },
      },
      {
        name: "HubSpot CRM Lead Sync",
        provider: "HubSpot",
        type: "action" as StepType,
        icon: "Boxes",
        color: "from-orange-500 to-red-600",
        badge: "CRM",
        summary: "Creates deals, updates contacts, and assigns pipeline stages",
        defaultConfig: { object: "contact", action: "UPSERT" },
      },
      {
        name: "Custom REST API Request (HTTP)",
        provider: "HTTP Client",
        type: "action" as StepType,
        icon: "ArrowUpRight",
        color: "from-slate-500 to-zinc-700",
        badge: "REST / GraphQL",
        summary: "Calls any external endpoint with authentication and retry logic",
        defaultConfig: { method: "POST", url: "https://api.partner.com/v1" },
      },
    ],
  },
];

const MOCK_WORKFLOWS: WorkflowItem[] = [
  {
    id: "wf-1",
    name: "Calificación de Clientes por WhatsApp & Alerta de Cierre",
    description:
      "Atiende al cliente 24/7 en WhatsApp, ejecuta el perfilamiento con Llama 120B, crea el Lead en Supabase y notifica al dueño de la empresa.",
    category: "CRM & Sales",
    isActive: true,
    version: "v2.4",
    lastRun: "2 mins ago",
    totalRuns: 24819,
    successRate: 99.94,
    steps: INITIAL_STEPS,
    updatedAt: "2026-08-19 20:12",
  },
  {
    id: "wf-2",
    name: "Agendamiento Inteligente & Confirmación Automática",
    description:
      "Cuando el cliente solicita una cita o prueba de servicio, el Agente IA verifica disponibilidad y envía recordatorio por WhatsApp.",
    category: "Operations",
    isActive: true,
    version: "v1.8",
    lastRun: "18 mins ago",
    totalRuns: 1420,
    successRate: 100,
    steps: [INITIAL_STEPS[0], INITIAL_STEPS[1], INITIAL_STEPS[4]],
    updatedAt: "2026-08-19 19:40",
  },
  {
    id: "wf-3",
    name: "Nightly Financial Reconciliation & ERP Auto-Journal",
    description:
      "Syncs daily Stripe transactions with NeuroLabs PUC chart of accounts and generates balancing ledger entries.",
    category: "Finance & Billing",
    isActive: false,
    version: "v1.2",
    lastRun: "Yesterday at 23:59",
    totalRuns: 365,
    successRate: 98.6,
    steps: [INITIAL_STEPS[0], INITIAL_STEPS[4]],
    updatedAt: "2026-08-12 18:00",
  },
  {
    id: "wf-4",
    name: "Critical Medical Device Anomaly Escalation",
    description:
      "Auto-escalates high stress index measurements to on-call clinical neurologist via PagerDuty + Twilio.",
    category: "Operations",
    isActive: true,
    version: "v3.0",
    lastRun: "45 mins ago",
    totalRuns: 8940,
    successRate: 99.8,
    steps: INITIAL_STEPS,
    updatedAt: "2026-08-15 11:40",
  },
];

const MOCK_LOGS: ExecutionLog[] = [
  {
    id: "exec-9942a",
    workflowId: "wf-1",
    workflowName: "Realtime EEG Biometric Triage",
    triggerEvent: "eeg.anomaly.gamma_spike",
    status: "success",
    durationMs: 248,
    timestamp: "Just now",
    stepsExecuted: 5,
    totalSteps: 5,
    payloadPreview: {
      subjectId: "sub_884920",
      device: "NL-HELMET-X4",
      gammaPower: 92.4,
      severity: 0.91,
      alertDispatched: true,
    },
  },
  {
    id: "exec-9942b",
    workflowId: "wf-1",
    workflowName: "Realtime EEG Biometric Triage",
    triggerEvent: "eeg.anomaly.gamma_spike",
    status: "success",
    durationMs: 192,
    timestamp: "4 mins ago",
    stepsExecuted: 5,
    totalSteps: 5,
    payloadPreview: {
      subjectId: "sub_771203",
      device: "NL-HELMET-X4",
      gammaPower: 86.1,
      severity: 0.83,
      alertDispatched: true,
    },
  },
  {
    id: "exec-9942c",
    workflowId: "wf-2",
    workflowName: "Stripe VIP Customer AI Onboarding",
    triggerEvent: "invoice.payment_succeeded",
    status: "success",
    durationMs: 310,
    timestamp: "18 mins ago",
    stepsExecuted: 4,
    totalSteps: 4,
    payloadPreview: {
      customerId: "cus_99418a",
      plan: "Enterprise Annual ($48,000)",
      org: "AeroSpace Neuro Labs Inc",
    },
  },
  {
    id: "exec-9942d",
    workflowId: "wf-1",
    workflowName: "Realtime EEG Biometric Triage",
    triggerEvent: "eeg.anomaly.gamma_spike",
    status: "error",
    durationMs: 412,
    timestamp: "1 hour ago",
    stepsExecuted: 3,
    totalSteps: 5,
    errorDetails: "Slack Webhook Rate Limit Exceeded (429 Too Many Requests). Auto-retry scheduled.",
    payloadPreview: {
      subjectId: "sub_110948",
      gammaPower: 88.0,
      retryAttempt: 1,
    },
  },
  {
    id: "exec-9942e",
    workflowId: "wf-4",
    workflowName: "Critical Medical Device Anomaly",
    triggerEvent: "device.signal_loss",
    status: "success",
    durationMs: 165,
    timestamp: "2 hours ago",
    stepsExecuted: 5,
    totalSteps: 5,
    payloadPreview: {
      deviceId: "NL-HELMET-X1",
      hospitalUnit: "ICU-North-04",
      pagerSent: true,
    },
  },
];

// Helper to render icons dynamically
const renderStepIcon = (iconName: string, className = "h-5 w-5") => {
  switch (iconName) {
    case "Brain":
      return <Brain className={className} />;
    case "Sparkles":
      return <Sparkles className={className} />;
    case "GitBranch":
      return <GitBranch className={className} />;
    case "MessageSquare":
      return <MessageSquare className={className} />;
    case "Database":
      return <Database className={className} />;
    case "Webhook":
      return <Webhook className={className} />;
    case "Clock":
      return <Clock className={className} />;
    case "Zap":
      return <Zap className={className} />;
    case "Bot":
      return <Bot className={className} />;
    case "Cpu":
      return <Cpu className={className} />;
    case "Mail":
      return <Mail className={className} />;
    case "Flame":
      return <Flame className={className} />;
    case "Boxes":
      return <Boxes className={className} />;
    case "Code":
      return <Code className={className} />;
    default:
      return <Workflow className={className} />;
  }
};

// ── Main Component ────────────────────────────────────────────────────

export default function AutomationsPage() {
  const [activeTab, setActiveTab] = useState<"builder" | "workflows" | "logs">("builder");
  const [workflowsList, setWorkflowsList] = useState<WorkflowItem[]>(MOCK_WORKFLOWS);
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowItem>(MOCK_WORKFLOWS[0]);
  const [steps, setSteps] = useState<WorkflowStep[]>(INITIAL_STEPS);
  const [isLiveActive, setIsLiveActive] = useState<boolean>(true);
  const [selectedNode, setSelectedNode] = useState<WorkflowStep | null>(null);
  const [isInspectorOpen, setIsInspectorOpen] = useState<boolean>(false);
  const [isAddStepModalOpen, setIsAddStepModalOpen] = useState<boolean>(false);
  const [insertStepIndex, setInsertStepIndex] = useState<number | null>(null);
  const [isTestingRun, setIsTestingRun] = useState<boolean>(false);
  const [testRunStepIndex, setTestRunStepIndex] = useState<number>(-1);
  const [testResultModalOpen, setTestResultModalOpen] = useState<boolean>(false);
  const [executionLogs, setExecutionLogs] = useState<ExecutionLog[]>(MOCK_LOGS);

  // Auto-sync real-time workflow executions from Render WhatsApp Engine
  useEffect(() => {
    const syncRealLogs = async () => {
      try {
        const res = await fetch('/api/whatsapp/workflow-logs');
        if (res.ok) {
          const data = await res.json();
          if (data.logs && data.logs.length > 0) {
            setExecutionLogs((prev) => {
              const liveIds = new Set(data.logs.map((l: any) => l.id));
              const nonDuplicatePrev = prev.filter((l) => !liveIds.has(l.id));
              return [...data.logs, ...nonDuplicatePrev];
            });
          }
        }
      } catch (err) {
        console.log("Syncing workflow execution logs...");
      }
    };

    syncRealLogs();
    const interval = setInterval(syncRealLogs, 3500);
    return () => clearInterval(interval);
  }, []);

  const [searchBlockQuery, setSearchBlockQuery] = useState<string>("");
  const [selectedBlockCategory, setSelectedBlockCategory] = useState<string>("All");
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [searchWorkflowQuery, setSearchWorkflowQuery] = useState<string>("");
  const [workflowCategoryFilter, setWorkflowCategoryFilter] = useState<string>("All");

  // Keep steps synced when workflow changes
  useEffect(() => {
    setSteps(selectedWorkflow.steps);
    setIsLiveActive(selectedWorkflow.isActive);
  }, [selectedWorkflow]);

  // Handle Live Toggle
  const handleToggleLive = (checked: boolean) => {
    setIsLiveActive(checked);
    setWorkflowsList((prev) =>
      prev.map((wf) => (wf.id === selectedWorkflow.id ? { ...wf, isActive: checked } : wf))
    );
    if (checked) {
      toast.success("Workflow activated", {
        description: `"${selectedWorkflow.name}" is now live and processing events.`,
      });
    } else {
      toast.info("Workflow paused", {
        description: `"${selectedWorkflow.name}" is paused. No new events will be processed.`,
      });
    }
  };

  // Open Node Inspector
  const handleOpenInspector = (step: WorkflowStep) => {
    setSelectedNode(step);
    setIsInspectorOpen(true);
  };

  // Save Node Configuration
  const handleSaveNodeConfig = (updatedConfig: any) => {
    if (!selectedNode) return;
    const updatedSteps = steps.map((s) =>
      s.id === selectedNode.id ? { ...s, config: { ...s.config, ...updatedConfig } } : s
    );
    setSteps(updatedSteps);
    setIsInspectorOpen(false);
    toast.success("Step configured successfully", {
      description: `Updated configuration for "${selectedNode.name}"`,
    });
  };

  // Add Step Handlers
  const handleOpenAddStep = (indexAfter?: number) => {
    setInsertStepIndex(indexAfter !== undefined ? indexAfter : steps.length - 1);
    setIsAddStepModalOpen(true);
  };

  const handleSelectBlockToAdd = (block: any) => {
    const newStep: WorkflowStep = {
      id: `step-${Date.now()}`,
      name: block.name,
      type: block.type,
      provider: block.provider,
      icon: block.icon,
      color: block.color,
      badge: block.badge,
      summary: block.summary,
      config: { ...block.defaultConfig },
      sampleOutput: {
        status: "OK",
        timestamp: new Date().toISOString(),
        message: "Simulated step execution output payload",
      },
      status: "idle",
    };

    const targetIdx = insertStepIndex !== null ? insertStepIndex + 1 : steps.length;
    const newSteps = [...steps];
    newSteps.splice(targetIdx, 0, newStep);
    setSteps(newSteps);
    setIsAddStepModalOpen(false);

    toast.success("Added step to workflow", {
      description: `"${block.name}" placed at position #${targetIdx + 1}`,
    });

    // Auto open inspector for configuring new node
    setTimeout(() => {
      setSelectedNode(newStep);
      setIsInspectorOpen(true);
    }, 200);
  };

  // Delete Step
  const handleDeleteStep = (stepId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (steps.length <= 1) {
      toast.error("Cannot delete trigger", {
        description: "A workflow requires at least 1 starting node.",
      });
      return;
    }
    const updated = steps.filter((s) => s.id !== stepId);
    setSteps(updated);
    toast.info("Step removed from workflow");
  };

  // Duplicate Step
  const handleDuplicateStep = (step: WorkflowStep, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const index = steps.findIndex((s) => s.id === step.id);
    const duplicated: WorkflowStep = {
      ...step,
      id: `step-${Date.now()}`,
      name: `${step.name} (Copy)`,
      status: "idle",
    };
    const newSteps = [...steps];
    newSteps.splice(index + 1, 0, duplicated);
    setSteps(newSteps);
    toast.success("Step duplicated");
  };

  // Run Test Workflow Simulation
  const handleRunTestSimulation = () => {
    setIsTestingRun(true);
    setTestRunStepIndex(0);

    // Reset status on all steps
    setSteps((prev) => prev.map((s) => ({ ...s, status: "idle", latencyMs: undefined })));

    let currentIdx = 0;
    const interval = setInterval(() => {
      if (currentIdx < steps.length) {
        const stepToRun = steps[currentIdx];
        setTestRunStepIndex(currentIdx);
        setSteps((prev) =>
          prev.map((s, idx) =>
            idx === currentIdx
              ? { ...s, status: "running" }
              : idx < currentIdx
              ? { ...s, status: "success", latencyMs: Math.floor(Math.random() * 80) + 30 }
              : s
          )
        );

        setTimeout(() => {
          setSteps((prev) =>
            prev.map((s, idx) =>
              idx === currentIdx
                ? { ...s, status: "success", latencyMs: Math.floor(Math.random() * 90) + 40 }
                : s
            )
          );
        }, 400);

        currentIdx++;
      } else {
        clearInterval(interval);
        setIsTestingRun(false);
        setTestRunStepIndex(-1);
        setTestResultModalOpen(true);
        toast.success("Test run completed successfully!", {
          description: "All 5 nodes executed with 0 errors in 218ms.",
        });
      }
    }, 700);
  };

  // Filtered blocks for add modal
  const filteredBlocks = AVAILABLE_BLOCKS.map((category) => ({
    ...category,
    items: category.items.filter((item) => {
      const matchQuery =
        item.name.toLowerCase().includes(searchBlockQuery.toLowerCase()) ||
        item.summary.toLowerCase().includes(searchBlockQuery.toLowerCase()) ||
        item.provider.toLowerCase().includes(searchBlockQuery.toLowerCase());
      const matchCategory =
        selectedBlockCategory === "All" || category.category.includes(selectedBlockCategory);
      return matchQuery && matchCategory;
    }),
  })).filter((cat) => cat.items.length > 0);

  // Filtered workflows list
  const filteredWorkflows = workflowsList.filter((wf) => {
    const matchQuery =
      wf.name.toLowerCase().includes(searchWorkflowQuery.toLowerCase()) ||
      wf.description.toLowerCase().includes(searchWorkflowQuery.toLowerCase());
    const matchCategory =
      workflowCategoryFilter === "All" || wf.category === workflowCategoryFilter;
    return matchQuery && matchCategory;
  });

  const handleCopyJSON = () => {
    navigator.clipboard.writeText(JSON.stringify(steps, null, 2));
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
    toast.success("Workflow JSON definition copied to clipboard");
  };

  return (
    <div className="min-h-screen w-full bg-white text-slate-900 flex flex-col antialiased font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* ── Ambient Background Glows ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[20%] w-[550px] h-[550px] bg-cyan-600/10 rounded-full blur-[140px]" />
        <div className="absolute top-[30%] right-[10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[160px]" />
        <div className="absolute bottom-[-10%] left-[35%] w-[600px] h-[600px] bg-black text-white/10 rounded-full blur-[180px]" />
        {/* Subtle high-tech grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)`,
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      {/* ── Top Header Navigation Bar ── */}
      <header className="relative z-20 border-b border-slate-200 bg-white backdrop-blur-2xl px-4 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 shadow-xl shadow-black/20">
        {/* Left: Breadcrumbs & Workflow Title */}
        <div className="flex items-center gap-3.5">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 p-[1px] shadow-lg shadow-cyan-500/20 flex-shrink-0">
            <div className="h-full w-full bg-white rounded-[11px] flex items-center justify-center">
              <Zap className="h-5 w-5 text-cyan-400 animate-pulse" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
              <span className="hover:text-slate-800 cursor-pointer transition-colors">Dashboard</span>
              <ChevronRight className="h-3 w-3 text-slate-600" />
              <span className="text-slate-300">Automations</span>
              <ChevronRight className="h-3 w-3 text-slate-600" />
              <Badge
                variant="outline"
                className="bg-cyan-950/40 text-cyan-400 border-cyan-800/60 text-[10px] px-2 py-0.5 rounded-full font-mono"
              >
                {selectedWorkflow.category}
              </Badge>
            </div>

            <div className="flex items-center gap-3 mt-0.5">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="text-base lg:text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2 hover:text-cyan-300 transition-colors group">
                    <span>{selectedWorkflow.name}</span>
                    <ChevronDown className="h-4 w-4 text-slate-500 group-hover:text-cyan-400 transition-transform group-hover:translate-y-0.5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-80 bg-slate-50 border-slate-200 text-slate-800 shadow-md ">
                  <DropdownMenuGroup>
                    <DropdownMenuLabel className="text-xs uppercase tracking-wider text-slate-400">
                      Switch Active Workflow
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-white" />
                    {workflowsList.map((wf) => (
                      <DropdownMenuItem
                        key={wf.id}
                        onClick={() => setSelectedWorkflow(wf)}
                        className={`flex flex-col items-start gap-1 p-2.5 cursor-pointer rounded-md ${
                          selectedWorkflow.id === wf.id
                            ? "bg-cyan-950/50 text-cyan-300 border border-cyan-800/40"
                            : "hover:bg-white text-slate-300"
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="font-semibold text-xs text-slate-900">{wf.name}</span>
                          <Badge
                            variant="secondary"
                            className={
                              wf.isActive
                                ? "bg-emerald-950/60 text-emerald-400 text-[9px]"
                                : "bg-white text-slate-400 text-[9px]"
                            }
                          >
                            {wf.isActive ? "LIVE" : "DRAFT"}
                          </Badge>
                        </div>
                        <span className="text-[11px] text-slate-400 line-clamp-1">{wf.description}</span>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator className="bg-white" />
                  <DropdownMenuItem
                    onClick={() => {
                      const newWf: WorkflowItem = {
                        id: `wf-${Date.now()}`,
                        name: "Untitled Automation Workflow",
                        description: "New custom automated multi-step pipeline",
                        category: "Neuro & AI",
                        isActive: false,
                        version: "v1.0",
                        lastRun: "Never",
                        totalRuns: 0,
                        successRate: 100,
                        steps: [INITIAL_STEPS[0], INITIAL_STEPS[1]],
                        updatedAt: "Just now",
                      };
                      setWorkflowsList([newWf, ...workflowsList]);
                      setSelectedWorkflow(newWf);
                      toast.success("Created new workflow draft");
                    }}
                    className="text-cyan-400 font-medium text-xs flex items-center gap-2 cursor-pointer hover:bg-cyan-950/40 p-2.5"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Create New Workflow</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Badge
                variant="outline"
                className="hidden sm:inline-flex bg-slate-50 border-slate-700 text-slate-400 text-[10px] font-mono"
              >
                {selectedWorkflow.version}
              </Badge>
            </div>
          </div>
        </div>

        {/* Center: Main View Switcher Tabs */}
        <div className="flex items-center justify-center">
          <div className="bg-slate-50 p-1 rounded-xl border border-slate-200 flex items-center gap-1 shadow-inner">
            <button
              onClick={() => setActiveTab("builder")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "builder"
                  ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-slate-900 shadow-md shadow-cyan-600/30"
                  : "text-slate-400 hover:text-slate-800 hover:bg-white"
              }`}
            >
              <Workflow className="h-3.5 w-3.5" />
              <span>Canvas Builder</span>
            </button>

            <button
              onClick={() => setActiveTab("workflows")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "workflows"
                  ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-slate-900 shadow-md shadow-cyan-600/30"
                  : "text-slate-400 hover:text-slate-800 hover:bg-white"
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>All Workflows</span>
              <span className="bg-white text-slate-300 text-[10px] px-1.5 py-0.2 rounded-full">
                {workflowsList.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("logs")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "logs"
                  ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-slate-900 shadow-md shadow-cyan-600/30"
                  : "text-slate-400 hover:text-slate-800 hover:bg-white"
              }`}
            >
              <Activity className="h-3.5 w-3.5" />
              <span>Execution Logs</span>
            </button>
          </div>
        </div>

        {/* Right: Actions & Live State Toggle */}
        <div className="flex items-center gap-3 justify-end flex-wrap">
          {/* Active Live Switch with Glowing Indicator */}
          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200">
            <div className="relative flex items-center justify-center">
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  isLiveActive ? "bg-emerald-400" : "bg-slate-600"
                }`}
              />
              {isLiveActive && (
                <span className="absolute h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping opacity-75" />
              )}
            </div>
            <span className="text-xs font-semibold text-slate-300">
              {isLiveActive ? "Active" : "Paused"}
            </span>
            <Switch
              checked={isLiveActive}
              onCheckedChange={handleToggleLive}
              className="data-[state=checked]:bg-emerald-600"
            />
          </div>

          {/* Test Run Button */}
          <Button
            onClick={handleRunTestSimulation}
            disabled={isTestingRun}
            size="sm"
            className="bg-slate-50 hover:bg-white text-cyan-400 border border-cyan-800/60 shadow-lg shadow-cyan-950/40 text-xs font-semibold gap-1.5 transition-all hover:border-cyan-500"
          >
            {isTestingRun ? (
              <>
                <RefreshCw className="h-3.5 w-3.5 animate-spin text-cyan-400" />
                <span>Simulating...</span>
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5 fill-cyan-400 text-cyan-400" />
                <span>Test Run</span>
              </>
            )}
          </Button>

          {/* Export JSON Modal Trigger */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={handleCopyJSON}
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 bg-slate-50 border-slate-200 text-slate-300 hover:text-slate-900 hover:bg-white"
                >
                  {copiedCode ? (
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                  ) : (
                    <FileJson className="h-3.5 w-3.5" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-slate-50 border-slate-200 text-slate-800 text-xs">
                Export / Copy Workflow Schema
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Add Step Button */}
          <Button
            onClick={() => handleOpenAddStep()}
            size="sm"
            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-900 shadow-lg shadow-cyan-500/25 text-xs font-semibold gap-1.5"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add Step</span>
          </Button>
        </div>
      </header>

      {/* ── Main Body Content According to Active Tab ── */}
      <main className="relative z-10 flex-1 flex flex-col overflow-hidden">
        {/* ========================================================================= */}
        {/* TAB 1: VISUAL CANVAS BUILDER (ZAPIER / MAKE / N8N STYLE) */}
        {/* ========================================================================= */}
        {activeTab === "builder" && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Canvas Toolbar & Meta Bar */}
            <div className="bg-white border-b border-slate-200/60 px-6 py-2.5 flex items-center justify-between text-xs text-slate-400 backdrop-blur-md">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-300">Pipeline Length:</span>
                  <span className="font-mono text-cyan-400 font-bold">{steps.length} Steps</span>
                </div>
                <Separator orientation="vertical" className="h-4 bg-white" />
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-300">Avg Latency:</span>
                  <span className="font-mono text-emerald-400 font-bold">184ms</span>
                </div>
                <Separator orientation="vertical" className="h-4 bg-white hidden sm:block" />
                <div className="hidden sm:flex items-center gap-2">
                  <span className="font-semibold text-slate-300">Last Executed:</span>
                  <span className="text-slate-300">{selectedWorkflow.lastRun}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="bg-slate-50 border-slate-200 text-slate-300 text-[11px] gap-1.5"
                >
                  <Sparkles className="h-3 w-3 text-purple-400" />
                  <span>Auto-optimizations enabled</span>
                </Badge>
              </div>
            </div>

            {/* Interactive Flow Canvas Area */}
            <div className="flex-1 overflow-y-auto px-4 py-8 lg:py-12 custom-scrollbar">
              <div className="max-w-3xl mx-auto flex flex-col items-center">
                {/* Visual Builder Node Flow */}
                {steps.map((step, index) => {
                  const isFirst = index === 0;
                  const isLast = index === steps.length - 1;
                  const isCurrentSimulated = isTestingRun && testRunStepIndex === index;
                  const isSimulatedSuccess = isTestingRun && testRunStepIndex > index;

                  return (
                    <React.Fragment key={step.id}>
                      {/* Node Card Container */}
                      <div
                        onClick={() => handleOpenInspector(step)}
                        className={`group relative w-full rounded-2xl transition-all duration-300 cursor-pointer ${
                          isCurrentSimulated
                            ? "ring-2 ring-cyan-400 shadow-md shadow-cyan-500/40 scale-[1.02]"
                            : isSimulatedSuccess
                            ? "ring-1 ring-emerald-500/80 shadow-lg shadow-emerald-500/20"
                            : "hover:scale-[1.01] hover:shadow-md hover:shadow-cyan-950/30"
                        }`}
                      >
                        {/* Outer Glowing Border Effect */}
                        <div
                          className={`absolute -inset-[1px] rounded-2xl bg-gradient-to-r opacity-50 group-hover:opacity-100 transition-opacity duration-300 blur-[1px] ${
                            isCurrentSimulated
                              ? "from-cyan-400 via-blue-500 to-purple-600 opacity-100"
                              : isSimulatedSuccess
                              ? "from-emerald-400 to-teal-500 opacity-80"
                              : step.color
                          }`}
                        />

                        {/* Node Card Inner (Frosted Glassmorphism) */}
                        <div className="relative rounded-2xl bg-white  border border-slate-200 p-5 lg:p-6 text-slate-900 shadow-xl overflow-hidden">
                          {/* Top Ambient Glow Pill inside card */}
                          <div
                            className={`absolute top-0 right-0 w-48 h-24 bg-gradient-to-bl ${step.color} opacity-10 rounded-full blur-2xl pointer-events-none`}
                          />

                          {/* Node Header Row */}
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-center gap-3.5">
                              {/* Service / App Icon with Gradient Background */}
                              <div
                                className={`h-11 w-11 rounded-xl bg-gradient-to-br ${step.color} p-[1px] shadow-lg flex-shrink-0`}
                              >
                                <div className="h-full w-full bg-white rounded-[11px] flex items-center justify-center text-slate-900">
                                  {renderStepIcon(step.icon, "h-5 w-5")}
                                </div>
                              </div>

                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-[11px] font-bold font-mono tracking-wider uppercase text-cyan-400">
                                    Step #{index + 1} • {step.provider}
                                  </span>
                                  <Badge
                                    variant="outline"
                                    className="bg-slate-50 border-slate-700/60 text-slate-300 text-[10px] px-1.5 py-0"
                                  >
                                    {step.badge}
                                  </Badge>
                                </div>
                                <h3 className="text-base font-bold text-slate-900 tracking-tight mt-0.5 group-hover:text-cyan-300 transition-colors">
                                  {step.name}
                                </h3>
                              </div>
                            </div>

                            {/* Node Status & Action Toolbar */}
                            <div className="flex items-center gap-2">
                              {step.status === "running" || isCurrentSimulated ? (
                                <Badge className="bg-cyan-950 text-cyan-300 border-cyan-700 animate-pulse text-xs gap-1.5">
                                  <RefreshCw className="h-3 w-3 animate-spin" />
                                  <span>Executing...</span>
                                </Badge>
                              ) : step.status === "success" || isSimulatedSuccess ? (
                                <Badge className="bg-emerald-950/80 text-emerald-400 border-emerald-800 text-xs gap-1">
                                  <CheckCircle2 className="h-3 w-3" />
                                  <span>200 OK ({step.latencyMs || 64}ms)</span>
                                </Badge>
                              ) : (
                                <Badge
                                  variant="secondary"
                                  className="bg-slate-50 text-slate-400 border border-slate-200 text-[11px]"
                                >
                                  Ready
                                </Badge>
                              )}

                              {/* Action Menu */}
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <button
                                    onClick={(e) => e.stopPropagation()}
                                    className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-white rounded-lg transition-colors"
                                  >
                                    <MoreVertical className="h-4 w-4" />
                                  </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="bg-slate-50 border-slate-200 text-slate-800 shadow-md">
                                  <DropdownMenuItem
                                    onClick={() => handleOpenInspector(step)}
                                    className="gap-2 cursor-pointer"
                                  >
                                    <Sliders className="h-3.5 w-3.5 text-cyan-400" />
                                    <span>Configure Parameters</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={(e) => handleDuplicateStep(step, e)}
                                    className="gap-2 cursor-pointer"
                                  >
                                    <Copy className="h-3.5 w-3.5 text-blue-400" />
                                    <span>Duplicate Step</span>
                                  </DropdownMenuItem>
                                  {!isFirst && (
                                    <>
                                      <DropdownMenuSeparator className="bg-white" />
                                      <DropdownMenuItem
                                        onClick={(e) => handleDeleteStep(step.id, e)}
                                        className="gap-2 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 cursor-pointer"
                                      >
                                        <Trash2 className="h-3.5 w-3.5" />
                                        <span>Delete Step</span>
                                      </DropdownMenuItem>
                                    </>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>

                          {/* Node Summary Description */}
                          <div className="mt-3 text-xs text-slate-300 leading-relaxed bg-white rounded-xl p-3 border border-slate-200/60 font-mono">
                            <span className="text-slate-500 font-sans font-semibold mr-1">Summary:</span>
                            {step.summary}
                          </div>

                          {/* Key Config Badges */}
                          <div className="mt-3 flex items-center gap-2 flex-wrap text-[11px]">
                            {step.config.model && (
                              <span className="px-2 py-0.5 rounded-md bg-purple-950/40 border border-purple-800/50 text-purple-300 font-mono">
                                model: {step.config.model}
                              </span>
                            )}
                            {step.config.event && (
                              <span className="px-2 py-0.5 rounded-md bg-cyan-950/40 border border-cyan-800/50 text-cyan-300 font-mono">
                                event: {step.config.event}
                              </span>
                            )}
                            {step.config.condition && (
                              <span className="px-2 py-0.5 rounded-md bg-amber-950/40 border border-amber-800/50 text-amber-300 font-mono">
                                expr: {step.config.condition}
                              </span>
                            )}
                            {step.config.channel && (
                              <span className="px-2 py-0.5 rounded-md bg-emerald-950/40 border border-emerald-800/50 text-emerald-300 font-mono">
                                target: {step.config.channel}
                              </span>
                            )}
                            {step.config.table && (
                              <span className="px-2 py-0.5 rounded-md bg-blue-950/40 border border-blue-800/50 text-blue-300 font-mono">
                                table: {step.config.table}
                              </span>
                            )}
                          </div>

                          {/* Interactive Footer Action */}
                          <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-400">
                            <span className="flex items-center gap-1.5 text-cyan-400 font-medium group-hover:underline">
                              <Sliders className="h-3 w-3" />
                              <span>Click to inspect & edit step variables</span>
                            </span>
                            <span className="text-[11px] text-slate-500 font-mono">ID: {step.id}</span>
                          </div>
                        </div>
                      </div>

                      {/* Animated Connector Line & + Add Step Pill in Between */}
                      {!isLast && (
                        <div className="relative my-2 flex flex-col items-center justify-center group/connector">
                          {/* Vertical Connector Line with Pulsing Particle */}
                          <div className="w-0.5 h-12 bg-gradient-to-b from-slate-700 via-cyan-500 to-slate-700 relative">
                            {/* Pulsing signal dot */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-cyan-400 shadow-md shadow-cyan-400 animate-bounce" />
                          </div>

                          {/* Floating Add Step Pill */}
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                            <button
                              onClick={() => handleOpenAddStep(index)}
                              className="h-7 px-3 rounded-full bg-slate-50 border border-slate-700 text-slate-300 hover:text-slate-900 hover:border-cyan-400 hover:bg-white hover:shadow-lg hover:shadow-cyan-500/20 text-[11px] font-semibold flex items-center gap-1.5 transition-all transform hover:scale-105"
                            >
                              <Plus className="h-3.5 w-3.5 text-cyan-400" />
                              <span>Insert Step</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </React.Fragment>
                  );
                })}

                {/* Final End of Flow Node Indicator */}
                <div className="mt-6 flex flex-col items-center">
                  <div className="w-0.5 h-6 bg-gradient-to-b from-slate-700 to-emerald-500/40" />
                  <div className="px-4 py-2 rounded-full bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-400 flex items-center gap-2 shadow-lg">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    <span>Pipeline Termination (Success 200 OK)</span>
                  </div>

                  {/* Add Step to Bottom Button */}
                  <Button
                    onClick={() => handleOpenAddStep()}
                    variant="outline"
                    className="mt-6 bg-slate-50 border-dashed border-slate-700 hover:border-cyan-500 hover:text-cyan-400 text-slate-300 gap-2 text-xs font-semibold py-5 px-6 rounded-2xl shadow-xl transition-all"
                  >
                    <Plus className="h-4 w-4 text-cyan-400" />
                    <span>Append Action to End of Pipeline</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: ALL WORKFLOWS DIRECTORY */}
        {/* ========================================================================= */}
        {activeTab === "workflows" && (
          <div className="flex-1 overflow-y-auto px-4 lg:px-8 py-8 custom-scrollbar">
            <div className="max-w-7xl mx-auto space-y-6">
              {/* Directory Filter & Search Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50 p-4 lg:p-6 rounded-2xl border border-slate-200 ">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                    Enterprise Workflow Directory
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Manage, deploy, and monitor all automated triggers and intelligent pipelines.
                  </p>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  {/* Category Filter Pills */}
                  <div className="flex items-center bg-white p-1 rounded-xl border border-slate-200">
                    {["All", "Neuro & AI", "Operations", "Finance & Billing", "CRM & Sales"].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setWorkflowCategoryFilter(cat)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                          workflowCategoryFilter === cat
                            ? "bg-cyan-600 text-slate-900"
                            : "text-slate-400 hover:text-slate-800"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  {/* Search Input */}
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
                    <Input
                      placeholder="Search workflows..."
                      value={searchWorkflowQuery}
                      onChange={(e) => setSearchWorkflowQuery(e.target.value)}
                      className="pl-8 bg-white border-slate-200 text-xs text-slate-800 placeholder:text-slate-500 h-9"
                    />
                  </div>
                </div>
              </div>

              {/* Workflows Grid Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {filteredWorkflows.map((wf) => (
                  <Card
                    key={wf.id}
                    className="bg-white border-slate-200 hover:border-slate-700/90 transition-all duration-300 rounded-2xl shadow-xl  hover:shadow-md hover:shadow-sm flex flex-col justify-between group"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 p-[1px]">
                            <div className="h-full w-full bg-white rounded-[11px] flex items-center justify-center">
                              <Zap className="h-5 w-5 text-cyan-400" />
                            </div>
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <Badge
                                variant="outline"
                                className="bg-slate-50 border-slate-700 text-slate-300 text-[10px]"
                              >
                                {wf.category}
                              </Badge>
                              <Badge
                                variant="outline"
                                className="bg-slate-50 border-slate-200 text-slate-500 text-[10px] font-mono"
                              >
                                {wf.version}
                              </Badge>
                            </div>
                            <CardTitle className="text-base font-bold text-slate-900 mt-1 group-hover:text-cyan-300 transition-colors">
                              {wf.name}
                            </CardTitle>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <Badge
                          className={
                            wf.isActive
                              ? "bg-emerald-950/80 text-emerald-400 border-emerald-800"
                              : "bg-slate-50 text-slate-400 border-slate-200"
                          }
                        >
                          {wf.isActive ? "ACTIVE" : "PAUSED"}
                        </Badge>
                      </div>

                      <CardDescription className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                        {wf.description}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="py-2">
                      {/* Step Chips Visualization */}
                      <div className="bg-white p-3 rounded-xl border border-slate-200/60 space-y-2">
                        <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold">
                          <span>Pipeline Execution Flow</span>
                          <span className="font-mono text-cyan-400">{wf.steps.length} Steps</span>
                        </div>
                        <div className="flex items-center gap-1.5 overflow-x-auto py-1">
                          {wf.steps.map((step, idx) => (
                            <React.Fragment key={step.id}>
                              <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-slate-50 border border-slate-200 text-[10px] font-medium text-slate-300 whitespace-nowrap">
                                {renderStepIcon(step.icon, "h-3 w-3 text-cyan-400")}
                                <span>{step.provider}</span>
                              </div>
                              {idx < wf.steps.length - 1 && (
                                <ArrowRight className="h-3 w-3 text-slate-600 flex-shrink-0" />
                              )}
                            </React.Fragment>
                          ))}
                        </div>
                      </div>

                      {/* Performance KPIs */}
                      <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                        <div className="bg-white p-2 rounded-lg border border-slate-200/40">
                          <span className="text-[10px] text-slate-500 uppercase font-semibold block">
                            Total Runs
                          </span>
                          <span className="text-xs font-bold font-mono text-slate-800">
                            {wf.totalRuns.toLocaleString()}
                          </span>
                        </div>
                        <div className="bg-white p-2 rounded-lg border border-slate-200/40">
                          <span className="text-[10px] text-slate-500 uppercase font-semibold block">
                            Success Rate
                          </span>
                          <span className="text-xs font-bold font-mono text-emerald-400">
                            {wf.successRate}%
                          </span>
                        </div>
                        <div className="bg-white p-2 rounded-lg border border-slate-200/40">
                          <span className="text-[10px] text-slate-500 uppercase font-semibold block">
                            Last Run
                          </span>
                          <span className="text-xs font-bold text-slate-300">{wf.lastRun}</span>
                        </div>
                      </div>
                    </CardContent>

                    <CardFooter className="pt-3 border-t border-slate-200/60 flex items-center justify-between">
                      <span className="text-[11px] text-slate-500">Updated: {wf.updatedAt}</span>
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => {
                            setSelectedWorkflow(wf);
                            setActiveTab("builder");
                            toast.success(`Loaded "${wf.name}" onto canvas`);
                          }}
                          size="sm"
                          className="bg-slate-50 hover:bg-white text-cyan-400 border border-cyan-800/60 text-xs font-semibold gap-1.5"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                          <span>Open in Canvas</span>
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: LIVE EXECUTION LOGS & REAL-TIME ANALYTICS */}
        {/* ========================================================================= */}
        {activeTab === "logs" && (
          <div className="flex-1 overflow-y-auto px-4 lg:px-8 py-8 custom-scrollbar">
            <div className="max-w-7xl mx-auto space-y-6">
              {/* Metric KPI Overview Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-slate-50 border-slate-200 p-5 rounded-2xl shadow-xl ">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase text-slate-400">Total Runs (24h)</span>
                    <Activity className="h-4 w-4 text-cyan-400" />
                  </div>
                  <div className="text-2xl font-bold font-mono text-slate-900 mt-2">24,819</div>
                  <div className="flex items-center gap-1.5 text-xs text-emerald-400 mt-1 font-semibold">
                    <span>↑ 14.8% vs yesterday</span>
                  </div>
                </Card>

                <Card className="bg-slate-50 border-slate-200 p-5 rounded-2xl shadow-xl ">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase text-slate-400">Success Rate</span>
                    <CheckCheck className="h-4 w-4 text-emerald-400" />
                  </div>
                  <div className="text-2xl font-bold font-mono text-emerald-400 mt-2">99.94%</div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                    <span>14 failed auto-retries</span>
                  </div>
                </Card>

                <Card className="bg-slate-50 border-slate-200 p-5 rounded-2xl shadow-xl ">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase text-slate-400">Avg Execution Time</span>
                    <Clock className="h-4 w-4 text-purple-400" />
                  </div>
                  <div className="text-2xl font-bold font-mono text-purple-400 mt-2">184ms</div>
                  <div className="flex items-center gap-1.5 text-xs text-emerald-400 mt-1 font-semibold">
                    <span>Fast • P99: 340ms</span>
                  </div>
                </Card>

                <Card className="bg-slate-50 border-slate-200 p-5 rounded-2xl shadow-xl ">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase text-slate-400">Total AI Tokens</span>
                    <Brain className="h-4 w-4 text-blue-400" />
                  </div>
                  <div className="text-2xl font-bold font-mono text-blue-400 mt-2">1.42M</div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                    <span>Est. Cost: $4.18</span>
                  </div>
                </Card>
              </div>

              {/* Live Executions Table */}
              <Card className="bg-white border-slate-200 rounded-2xl shadow-md  overflow-hidden">
                <CardHeader className="border-b border-slate-200 px-6 py-4 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-bold text-slate-900">Live Execution Stream</CardTitle>
                    <CardDescription className="text-xs text-slate-400">
                      Real-time chronological events processed through the automation engine.
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="bg-white border-slate-200 text-cyan-400 text-xs font-mono">
                    <Radio className="h-3 w-3 animate-pulse text-cyan-400 mr-1.5" />
                    LIVE TELEMETRY
                  </Badge>
                </CardHeader>

                <div className="divide-y divide-slate-800/60">
                  {MOCK_LOGS.map((log) => (
                    <div
                      key={log.id}
                      className="p-4 lg:px-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-start gap-3.5">
                        <div className="mt-1">
                          {log.status === "success" ? (
                            <div className="h-8 w-8 rounded-lg bg-emerald-950/80 border border-emerald-800/80 flex items-center justify-center text-emerald-400">
                              <CheckCircle2 className="h-4 w-4" />
                            </div>
                          ) : (
                            <div className="h-8 w-8 rounded-lg bg-rose-950/80 border border-rose-800/80 flex items-center justify-center text-rose-400">
                              <AlertCircle className="h-4 w-4" />
                            </div>
                          )}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-slate-900">{log.id}</span>
                            <span className="text-xs text-slate-500">•</span>
                            <span className="text-xs font-semibold text-cyan-300">{log.workflowName}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge
                              variant="outline"
                              className="bg-white border-slate-200 text-slate-400 text-[10px] font-mono"
                            >
                              event: {log.triggerEvent}
                            </Badge>
                            <span className="text-[11px] text-slate-400">
                              Steps: {log.stepsExecuted}/{log.totalSteps}
                            </span>
                          </div>
                          {log.errorDetails && (
                            <p className="text-xs text-rose-400 mt-1 font-mono">{log.errorDetails}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-6 justify-between md:justify-end">
                        <div className="text-right font-mono text-xs">
                          <div className="font-bold text-slate-800">{log.durationMs}ms</div>
                          <div className="text-slate-500 text-[11px]">{log.timestamp}</div>
                        </div>

                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              className="bg-slate-50 border-slate-200 text-slate-300 hover:text-slate-900 hover:bg-white text-xs"
                            >
                              <Eye className="h-3.5 w-3.5 mr-1" />
                              <span>View Payload</span>
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="bg-slate-50 border-slate-200 text-slate-800 max-w-lg">
                            <DialogHeader>
                              <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                                <Terminal className="h-4 w-4 text-cyan-400" />
                                <span>Execution Payload: {log.id}</span>
                              </DialogTitle>
                              <DialogDescription className="text-xs text-slate-400">
                                Raw serialized JSON state at termination.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="bg-white p-4 rounded-xl border border-slate-200 font-mono text-xs text-cyan-300 overflow-x-auto max-h-72 custom-scrollbar">
                              <pre>{JSON.stringify(log.payloadPreview, null, 2)}</pre>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        )}
      </main>

      {/* ========================================================================= */}
      {/* SLIDE-OVER SHEET: NODE INSPECTOR & PARAMETER CONFIGURATOR */}
      {/* ========================================================================= */}
      <Sheet open={isInspectorOpen} onOpenChange={setIsInspectorOpen}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-xl bg-white border-l border-slate-200 text-slate-900 backdrop-blur-2xl p-0 flex flex-col shadow-md z-50 overflow-hidden"
        >
          {selectedNode && (
            <div className="flex-1 flex flex-col h-full overflow-hidden">
              {/* Sheet Header */}
              <div className="p-6 border-b border-slate-200 bg-slate-50 flex items-start justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div
                    className={`h-11 w-11 rounded-xl bg-gradient-to-br ${selectedNode.color} p-[1px] shadow-lg flex-shrink-0`}
                  >
                    <div className="h-full w-full bg-white rounded-[11px] flex items-center justify-center text-slate-900">
                      {renderStepIcon(selectedNode.icon, "h-5 w-5")}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase text-cyan-400 font-mono">
                        {selectedNode.provider}
                      </span>
                      <Badge
                        variant="outline"
                        className="bg-white border-slate-200 text-slate-300 text-[10px]"
                      >
                        {selectedNode.badge}
                      </Badge>
                    </div>
                    <SheetTitle className="text-lg font-bold text-slate-900 mt-0.5">
                      {selectedNode.name}
                    </SheetTitle>
                  </div>
                </div>
              </div>

              {/* Sheet Body with Tabs */}
              <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                <Tabs defaultValue="params" className="w-full">
                  <TabsList className="grid grid-cols-3 bg-slate-50 border border-slate-200 p-1 mb-6 rounded-xl">
                    <TabsTrigger value="params" className="text-xs font-semibold">
                      Parameters
                    </TabsTrigger>
                    <TabsTrigger value="variables" className="text-xs font-semibold">
                      Variables & Map
                    </TabsTrigger>
                    <TabsTrigger value="test" className="text-xs font-semibold">
                      Live Output
                    </TabsTrigger>
                  </TabsList>

                  {/* TAB 1: PARAMETERS */}
                  <TabsContent value="params" className="space-y-4">
                    {/* Node Display Name */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-slate-300">Step Label</Label>
                      <Input
                        defaultValue={selectedNode.name}
                        onChange={(e) => {
                          setSelectedNode({ ...selectedNode, name: e.target.value });
                        }}
                        className="bg-slate-50 border-slate-200 text-xs text-slate-900"
                      />
                    </div>

                    {/* Dynamic Fields Based on Step Type */}
                    {selectedNode.type === "trigger" && (
                      <>
                        <div className="space-y-1.5">
                          <Label className="text-xs font-semibold text-slate-300">
                            Event Subscription Topic
                          </Label>
                          <Input
                            defaultValue={selectedNode.config.event || "eeg.anomaly.gamma_spike"}
                            onChange={(e) =>
                              setSelectedNode({
                                ...selectedNode,
                                config: { ...selectedNode.config, event: e.target.value },
                              })
                            }
                            className="bg-slate-50 border-slate-200 text-xs font-mono text-cyan-300"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs font-semibold text-slate-300">
                            WebSocket Endpoint URI
                          </Label>
                          <Input
                            defaultValue={
                              selectedNode.config.endpoint || "wss://stream.neurolabs.io/v2/telemetry"
                            }
                            className="bg-slate-50 border-slate-200 text-xs font-mono text-slate-300"
                          />
                        </div>
                      </>
                    )}

                    {selectedNode.type === "ai" && (
                      <>
                        <div className="space-y-1.5">
                          <Label className="text-xs font-semibold text-slate-300">AI Model Engine</Label>
                          <Select
                            defaultValue={selectedNode.config.model || "gpt-4o-2024-08-06"}
                            onValueChange={(val) =>
                              setSelectedNode({
                                ...selectedNode,
                                config: { ...selectedNode.config, model: val || undefined },
                              })
                            }
                          >
                            <SelectTrigger className="bg-slate-50 border-slate-200 text-xs text-slate-900">
                              <SelectValue placeholder="Select Model" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-50 border-slate-200 text-slate-800">
                              <SelectItem value="gpt-4o-2024-08-06">GPT-4o (High Intelligence & Vision)</SelectItem>
                              <SelectItem value="gpt-4o-mini">GPT-4o Mini (Ultra-Fast & Cost-Efficient)</SelectItem>
                              <SelectItem value="claude-3-5-sonnet">Claude 3.5 Sonnet (Advanced Reasoning)</SelectItem>
                              <SelectItem value="neurolabs-cognitive-v2">NeuroLabs BioCore EEG Custom LLM</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-1.5">
                          <Label className="text-xs font-semibold text-slate-300">
                            System Prompt / Reasoning Instruction
                          </Label>
                          <Textarea
                            rows={4}
                            defaultValue={selectedNode.config.prompt || ""}
                            onChange={(e) =>
                              setSelectedNode({
                                ...selectedNode,
                                config: { ...selectedNode.config, prompt: e.target.value },
                              })
                            }
                            placeholder="Instruct the model how to parse telemetry and output structured JSON..."
                            className="bg-slate-50 border-slate-200 text-xs font-mono text-slate-800"
                          />
                          <p className="text-[10px] text-slate-500">
                            Tip: Reference previous steps like{" "}
                            <span className="text-cyan-400 font-mono">{"{{step1.subjectId}}"}</span>
                          </p>
                        </div>
                      </>
                    )}

                    {selectedNode.type === "condition" && (
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-slate-300">
                          JavaScript Boolean Expression
                        </Label>
                        <Input
                          defaultValue={
                            selectedNode.config.condition || "step2.severityScore >= 0.80"
                          }
                          onChange={(e) =>
                            setSelectedNode({
                              ...selectedNode,
                              config: { ...selectedNode.config, condition: e.target.value },
                            })
                          }
                          className="bg-slate-50 border-slate-200 text-xs font-mono text-amber-300"
                        />
                        <p className="text-[10px] text-slate-500">
                          If true, execution continues to downstream steps. If false, branch aborts or routes to fallback.
                        </p>
                      </div>
                    )}

                    {selectedNode.type === "action" && (
                      <>
                        {selectedNode.config.channel && (
                          <div className="space-y-1.5">
                            <Label className="text-xs font-semibold text-slate-300">Slack Destination Channel</Label>
                            <Input
                              defaultValue={selectedNode.config.channel}
                              className="bg-slate-50 border-slate-200 text-xs font-mono text-emerald-400"
                            />
                          </div>
                        )}

                        {selectedNode.config.table && (
                          <div className="space-y-1.5">
                            <Label className="text-xs font-semibold text-slate-300">Postgres Target Table</Label>
                            <Input
                              defaultValue={selectedNode.config.table}
                              className="bg-slate-50 border-slate-200 text-xs font-mono text-blue-400"
                            />
                          </div>
                        )}

                        <div className="space-y-1.5">
                          <Label className="text-xs font-semibold text-slate-300">Payload Template</Label>
                          <Textarea
                            rows={4}
                            defaultValue={selectedNode.config.bodyTemplate || ""}
                            className="bg-slate-50 border-slate-200 text-xs font-mono text-slate-800"
                          />
                        </div>
                      </>
                    )}

                    {/* Retry & Fault Tolerance Settings */}
                    <div className="pt-4 border-t border-slate-200 space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Reliability & Fault-Tolerance
                      </h4>
                      <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                        <div>
                          <span className="text-xs font-semibold text-slate-300 block">
                            Exponential Backoff Retry
                          </span>
                          <span className="text-[11px] text-slate-500">
                            Auto-retries 3 times on 5xx network timeout
                          </span>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </div>
                  </TabsContent>

                  {/* TAB 2: VARIABLES & MAP */}
                  <TabsContent value="variables" className="space-y-4">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                      <h4 className="text-xs font-bold text-slate-300">Available Upstream Variables</h4>
                      <p className="text-xs text-slate-400">
                        Click any token below to copy and paste it into your prompt or parameters.
                      </p>

                      <div className="space-y-2 pt-2">
                        {[
                          { token: "{{step1.subjectId}}", label: "Subject UUID (e.g. sub_884920)" },
                          { token: "{{step1.confidence}}", label: "Anomaly Signal Confidence (0.942)" },
                          { token: "{{step1.metrics.stressIndex}}", label: "Prefrontal Stress Index (0.89)" },
                          { token: "{{step2.severityScore}}", label: "AI Classification Severity Score (0.91)" },
                          { token: "{{step2.executiveSummary}}", label: "AI Clinical Summary Text" },
                          { token: "{{auth.tenantId}}", label: "NeuroLabs Org ID" },
                        ].map((v) => (
                          <div
                            key={v.token}
                            onClick={() => {
                              navigator.clipboard.writeText(v.token);
                              toast.success(`Copied variable ${v.token}`);
                            }}
                            className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-slate-200 hover:border-cyan-500 cursor-pointer transition-all group"
                          >
                            <span className="font-mono text-xs font-bold text-cyan-400 group-hover:text-cyan-300">
                              {v.token}
                            </span>
                            <span className="text-[11px] text-slate-400">{v.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                  {/* TAB 3: LIVE OUTPUT SCHEMA */}
                  <TabsContent value="test" className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-semibold text-slate-300">
                          Simulated Output Data Payload
                        </Label>
                        <Badge className="bg-emerald-950 text-emerald-400 border-emerald-800 text-[10px]">
                          200 OK
                        </Badge>
                      </div>

                      <div className="bg-white p-4 rounded-xl border border-slate-200 font-mono text-xs text-cyan-300 max-h-80 overflow-y-auto custom-scrollbar">
                        <pre>{JSON.stringify(selectedNode.sampleOutput, null, 2)}</pre>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>

              {/* Sheet Footer Actions */}
              <div className="p-5 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setIsInspectorOpen(false)}
                  className="bg-slate-50 border-slate-200 text-slate-300 hover:bg-white text-xs"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleSaveNodeConfig(selectedNode.config)}
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-900 text-xs font-semibold shadow-lg shadow-cyan-500/20"
                >
                  Save Configuration
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* ========================================================================= */}
      {/* MODAL: ADD NEW STEP / BLOCK CATALOGUE */}
      {/* ========================================================================= */}
      <Dialog open={isAddStepModalOpen} onOpenChange={setIsAddStepModalOpen}>
        <DialogContent className="bg-white border-slate-200 text-slate-900 max-w-3xl shadow-md backdrop-blur-2xl p-0 overflow-hidden">
          <DialogHeader className="p-6 pb-4 border-b border-slate-200 bg-slate-50">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Plus className="h-5 w-5 text-cyan-400" />
                  <span>Choose Action or Trigger Block</span>
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-400 mt-1">
                  Select a pre-built integration, AI model, router, or database adapter.
                </DialogDescription>
              </div>
            </div>

            {/* Category Filter Pills & Search */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-4">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
                <Input
                  placeholder="Search 50+ integrations & blocks..."
                  value={searchBlockQuery}
                  onChange={(e) => setSearchBlockQuery(e.target.value)}
                  className="pl-8 bg-white border-slate-200 text-xs text-slate-800 placeholder:text-slate-500 h-9"
                />
              </div>

              <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 overflow-x-auto w-full sm:w-auto">
                {["All", "Triggers", "AI", "Logic", "Messaging", "Data"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedBlockCategory(cat)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors whitespace-nowrap ${
                      selectedBlockCategory === cat
                        ? "bg-cyan-600 text-slate-900"
                        : "text-slate-400 hover:text-slate-800"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </DialogHeader>

          {/* Block Items Grid */}
          <div className="p-6 max-h-[460px] overflow-y-auto space-y-6 custom-scrollbar">
            {filteredBlocks.map((group) => (
              <div key={group.category} className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  {group.category}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {group.items.map((item) => (
                    <div
                      key={item.name}
                      onClick={() => handleSelectBlockToAdd(item)}
                      className="group p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-cyan-500/80 hover:bg-slate-50 transition-all cursor-pointer shadow-md hover:shadow-cyan-950/30 flex items-start gap-3"
                    >
                      <div
                        className={`h-10 w-10 rounded-xl bg-gradient-to-br ${item.color} p-[1px] shadow-md flex-shrink-0`}
                      >
                        <div className="h-full w-full bg-white rounded-[11px] flex items-center justify-center text-slate-900">
                          {renderStepIcon(item.icon, "h-5 w-5")}
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900 group-hover:text-cyan-300 transition-colors truncate">
                            {item.name}
                          </span>
                          <Badge
                            variant="outline"
                            className="bg-white border-slate-200 text-slate-400 text-[9px]"
                          >
                            {item.badge}
                          </Badge>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-tight">
                          {item.summary}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* MODAL: TEST RUN SUCCESSFUL RESULT SUMMARY */}
      {/* ========================================================================= */}
      <Dialog open={testResultModalOpen} onOpenChange={setTestResultModalOpen}>
        <DialogContent className="bg-white border-slate-200 text-slate-900 max-w-lg shadow-md">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-emerald-950/80 border border-emerald-800/80 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-slate-900">
                  Simulation Executed Successfully
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-400">
                  All pipeline nodes completed with exit status 200 OK.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-3 pt-2">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Total Duration</span>
                <span className="text-sm font-bold font-mono text-cyan-400">218ms</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Steps Passed</span>
                <span className="text-sm font-bold font-mono text-emerald-400">5 / 5</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Cost (Tokens)</span>
                <span className="text-sm font-bold font-mono text-purple-400">$0.0031</span>
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5 text-xs text-slate-300 font-mono">
              <div className="text-slate-500 font-sans font-semibold">Step Timeline:</div>
              <div className="flex items-center justify-between text-emerald-400">
                <span>1. EEG Gamma Anomaly Spike</span>
                <span>42ms</span>
              </div>
              <div className="flex items-center justify-between text-emerald-400">
                <span>2. GPT-4o Cognitive Triage</span>
                <span>114ms</span>
              </div>
              <div className="flex items-center justify-between text-emerald-400">
                <span>3. Condition (Severity &gt;= 0.80)</span>
                <span>2ms</span>
              </div>
              <div className="flex items-center justify-between text-emerald-400">
                <span>4. Slack Escalation Alert</span>
                <span>38ms</span>
              </div>
              <div className="flex items-center justify-between text-emerald-400">
                <span>5. Supabase ERP Audit Write</span>
                <span>22ms</span>
              </div>
            </div>
          </div>

          <DialogFooter className="pt-3">
            <Button
              onClick={() => setTestResultModalOpen(false)}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-900 text-xs font-semibold"
            >
              Done & Return to Builder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}


