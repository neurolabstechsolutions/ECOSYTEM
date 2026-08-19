"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import {
  Check,
  Zap,
  Sparkles,
  ShieldCheck,
  Download,
  Plus,
  Trash2,
  ExternalLink,
  FileText,
  Calendar,
  Building,
  CreditCard,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  MoreVertical,
  Search,
  Receipt,
  Server,
  Users,
  HardDrive,
  Cpu,
  Lock,
  Flame,
  HelpCircle,
  RefreshCw,
  Mail,
  MapPin,
  FileCheck,
  AlertCircle,
  Copy,
  Printer,
  ChevronDown,
} from "lucide-react";

// --- TYPES ---
interface PlanFeature {
  text: string;
  included: boolean;
  highlight?: boolean;
}

interface PricingPlan {
  id: string;
  name: string;
  badge?: string;
  tagline: string;
  monthlyPrice: number;
  annualPrice: number;
  isPopular?: boolean;
  features: PlanFeature[];
  quota: {
    tokens: string;
    seats: string;
    storage: string;
    sla: string;
  };
}

interface PaymentMethod {
  id: string;
  type: "visa" | "mastercard" | "amex";
  last4: string;
  brand: string;
  expMonth: string;
  expYear: string;
  holderName: string;
  isDefault: boolean;
  funding: "Credit" | "Debit" | "Corporate";
  colorGradient: string;
}

interface Invoice {
  id: string;
  number: string;
  date: string;
  dueDate: string;
  period: string;
  description: string;
  amount: number;
  status: "paid" | "pending" | "refunded";
  cardLast4: string;
  cardBrand: "Visa" | "Mastercard";
  downloadUrl?: string;
  items: {
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }[];
  subtotal: number;
  tax: number;
}

interface BillingInfo {
  companyName: string;
  taxId: string;
  billingEmail: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  currency: string;
}

// --- MOCK DATA ---
const INITIAL_PLANS: PricingPlan[] = [
  {
    id: "starter",
    name: "Starter",
    tagline: "Essential neural analytics for developers & small prototypes.",
    monthlyPrice: 29,
    annualPrice: 24,
    features: [
      { text: "Up to 25,000 Neural Queries / mo", included: true },
      { text: "3 Active Team Collaborators", included: true },
      { text: "10 GB Cloud Vector Storage", included: true },
      { text: "Standard Latency Inference (120ms)", included: true },
      { text: "Community & Email Support", included: true },
      { text: "Custom Fine-tuned Weights", included: false },
      { text: "Dedicated Private GPU Endpoints", included: false },
      { text: "Enterprise 99.99% SLA & BAA", included: false },
    ],
    quota: {
      tokens: "25K / mo",
      seats: "3 Seats",
      storage: "10 GB",
      sla: "Standard",
    },
  },
  {
    id: "pro",
    name: "Pro",
    badge: "MOST POPULAR",
    tagline: "High-throughput cognitive pipelines for scaling businesses.",
    monthlyPrice: 79,
    annualPrice: 63,
    isPopular: true,
    features: [
      { text: "Up to 100,000 Neural Queries / mo", included: true, highlight: true },
      { text: "10 Active Team Seats included", included: true },
      { text: "50 GB High-Speed Vector Storage", included: true },
      { text: "Ultra-Low Latency Inference (<45ms)", included: true, highlight: true },
      { text: "Priority 24/7 Support via Slack & Email", included: true },
      { text: "Automated Weekly Model Re-evaluations", included: true },
      { text: "Custom Fine-tuned Weights", included: true },
      { text: "Dedicated Private GPU Endpoints", included: false },
    ],
    quota: {
      tokens: "100K / mo",
      seats: "10 Seats",
      storage: "50 GB",
      sla: "99.9% Uptime",
    },
  },
  {
    id: "enterprise",
    name: "Enterprise",
    badge: "CUSTOM SCALE",
    tagline: "Dedicated clusters, custom neuromorphic chips & maximum security.",
    monthlyPrice: 249,
    annualPrice: 199,
    features: [
      { text: "Unlimited High-Velocity Inferences", included: true, highlight: true },
      { text: "Unlimited Team Seats & Roles (SSO/SAML)", included: true },
      { text: "1 TB+ Dedicated NVMe Vector Fabric", included: true },
      { text: "Sub-15ms Dedicated GPU / NPU Farm", included: true, highlight: true },
      { text: "Dedicated Machine Learning Architect", included: true },
      { text: "Custom Quantization & On-Premises Option", included: true },
      { text: "Custom Security Audits, SOC2 & HIPAA BAA", included: true },
      { text: "Guaranteed 99.99% Enterprise SLA", included: true },
    ],
    quota: {
      tokens: "Unlimited",
      seats: "Unlimited",
      storage: "1 TB+",
      sla: "99.99% SLA",
    },
  },
];

const INITIAL_PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: "pm_visa_4242",
    type: "visa",
    last4: "4242",
    brand: "Visa",
    expMonth: "12",
    expYear: "2028",
    holderName: "ALEXANDER VANCE",
    isDefault: true,
    funding: "Corporate",
    colorGradient: "from-slate-900 via-indigo-950 to-blue-900",
  },
  {
    id: "pm_mc_8891",
    type: "mastercard",
    last4: "8891",
    brand: "Mastercard",
    expMonth: "09",
    expYear: "2027",
    holderName: "NEUROMETRIC LABS INC",
    isDefault: false,
    funding: "Credit",
    colorGradient: "from-zinc-900 via-neutral-900 to-amber-950",
  },
];

const INITIAL_INVOICES: Invoice[] = [
  {
    id: "inv_008",
    number: "INV-2026-008",
    date: "Aug 01, 2026",
    dueDate: "Aug 01, 2026",
    period: "Aug 01, 2026 – Aug 31, 2026",
    description: "Pro Plan — Monthly Subscription (10 Seats)",
    amount: 79.0,
    status: "paid",
    cardLast4: "4242",
    cardBrand: "Visa",
    items: [
      { description: "Pro Plan Base Subscription", quantity: 1, unitPrice: 79.0, total: 79.0 },
      { description: "High-Speed Vector Storage (50GB)", quantity: 1, unitPrice: 0.0, total: 0.0 },
      { description: "Active Team Seats (8/10 active)", quantity: 8, unitPrice: 0.0, total: 0.0 },
    ],
    subtotal: 79.0,
    tax: 0.0,
  },
  {
    id: "inv_007",
    number: "INV-2026-007",
    date: "Jul 01, 2026",
    dueDate: "Jul 01, 2026",
    period: "Jul 01, 2026 – Jul 31, 2026",
    description: "Pro Plan — Monthly Subscription (10 Seats)",
    amount: 79.0,
    status: "paid",
    cardLast4: "4242",
    cardBrand: "Visa",
    items: [
      { description: "Pro Plan Base Subscription", quantity: 1, unitPrice: 79.0, total: 79.0 },
    ],
    subtotal: 79.0,
    tax: 0.0,
  },
  {
    id: "inv_006",
    number: "INV-2026-006",
    date: "Jun 01, 2026",
    dueDate: "Jun 01, 2026",
    period: "Jun 01, 2026 – Jun 30, 2026",
    description: "Pro Plan — Monthly Subscription + Compute Burst Addon",
    amount: 119.0,
    status: "paid",
    cardLast4: "8891",
    cardBrand: "Mastercard",
    items: [
      { description: "Pro Plan Base Subscription", quantity: 1, unitPrice: 79.0, total: 79.0 },
      { description: "Extra Neural Compute Burst Pack (50k tokens)", quantity: 1, unitPrice: 40.0, total: 40.0 },
    ],
    subtotal: 119.0,
    tax: 0.0,
  },
  {
    id: "inv_005",
    number: "INV-2026-005",
    date: "May 01, 2026",
    dueDate: "May 01, 2026",
    period: "May 01, 2026 – May 31, 2026",
    description: "Pro Plan — Monthly Subscription (10 Seats)",
    amount: 79.0,
    status: "paid",
    cardLast4: "4242",
    cardBrand: "Visa",
    items: [
      { description: "Pro Plan Base Subscription", quantity: 1, unitPrice: 79.0, total: 79.0 },
    ],
    subtotal: 79.0,
    tax: 0.0,
  },
  {
    id: "inv_004",
    number: "INV-2026-004",
    date: "Apr 01, 2026",
    dueDate: "Apr 01, 2026",
    period: "Apr 01, 2026 – Apr 30, 2026",
    description: "Starter Plan Upgrade to Pro Plan (Prorated)",
    amount: 54.2,
    status: "paid",
    cardLast4: "4242",
    cardBrand: "Visa",
    items: [
      { description: "Starter Plan to Pro Upgrade Adjustment", quantity: 1, unitPrice: 54.2, total: 54.2 },
    ],
    subtotal: 54.2,
    tax: 0.0,
  },
];

const INITIAL_BILLING_INFO: BillingInfo = {
  companyName: "Neurometric Insights Inc.",
  taxId: "US-EIN 84-9382104",
  billingEmail: "finance@neurometric.ai",
  phone: "+1 (415) 890-2341",
  addressLine1: "548 Market Street, Suite 7200",
  addressLine2: "Floor 7",
  city: "San Francisco",
  state: "CA",
  postalCode: "94104",
  country: "United States",
  currency: "USD ($)",
};

export default function BillingSubscriptionsPage() {
  // State management
  const [isAnnual, setIsAnnual] = useState(false);
  const [currentPlanId, setCurrentPlanId] = useState<string>("pro");
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(INITIAL_PAYMENT_METHODS);
  const [invoices, setInvoices] = useState<Invoice[]>(INITIAL_INVOICES);
  const [billingInfo, setBillingInfo] = useState<BillingInfo>(INITIAL_BILLING_INFO);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "paid" | "pending" | "refunded">("all");
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [isAddCardOpen, setIsAddCardOpen] = useState(false);
  const [isEditBillingOpen, setIsEditBillingOpen] = useState(false);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [targetPlan, setTargetPlan] = useState<PricingPlan | null>(null);

  // New Card Form State
  const [newCardNumber, setNewCardNumber] = useState("");
  const [newCardHolder, setNewCardHolder] = useState("");
  const [newCardExp, setNewCardExp] = useState("");
  const [newCardCvc, setNewCardCvc] = useState("");
  const [newCardBrand, setNewCardBrand] = useState<"visa" | "mastercard">("visa");
  const [newCardSetDefault, setNewCardSetDefault] = useState(true);

  // Filtered Invoices
  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.date.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" ? true : inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Active Plan Object
  const currentPlan = INITIAL_PLANS.find((p) => p.id === currentPlanId) || INITIAL_PLANS[1];

  // Actions
  const handleSelectPlan = (plan: PricingPlan) => {
    if (plan.id === currentPlanId) {
      toast.info(`You are already subscribed to the ${plan.name} Plan.`);
      return;
    }
    setTargetPlan(plan);
    setIsPlanModalOpen(true);
  };

  const handleConfirmPlanChange = () => {
    if (!targetPlan) return;
    setCurrentPlanId(targetPlan.id);
    setIsPlanModalOpen(false);
    toast.success(`Successfully switched to the ${targetPlan.name} Plan!`, {
      description: `Your new billing cycle will reflect on your next renewal date.`,
    });
  };

  const handleSetDefaultCard = (cardId: string) => {
    setPaymentMethods((prev) =>
      prev.map((card) => ({
        ...card,
        isDefault: card.id === cardId,
      }))
    );
    toast.success("Default payment method updated.");
  };

  const handleDeleteCard = (cardId: string) => {
    if (paymentMethods.length <= 1) {
      toast.error("Cannot delete the only payment method on file.");
      return;
    }
    const cardToDelete = paymentMethods.find((c) => c.id === cardId);
    if (cardToDelete?.isDefault) {
      toast.error("Please set another card as default before deleting this one.");
      return;
    }
    setPaymentMethods((prev) => prev.filter((c) => c.id !== cardId));
    toast.success("Payment card removed successfully.");
  };

  const handleAddCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCardNumber || !newCardHolder || !newCardExp) {
      toast.error("Please fill in all card details.");
      return;
    }

    const cleanNumber = newCardNumber.replace(/\s+/g, "");
    const last4 = cleanNumber.slice(-4) || "9921";
    const [month, year] = newCardExp.split("/");

    const newMethod: PaymentMethod = {
      id: `pm_${Date.now()}`,
      type: newCardBrand,
      last4,
      brand: newCardBrand === "visa" ? "Visa" : "Mastercard",
      expMonth: month || "08",
      expYear: year ? (year.length === 2 ? `20${year}` : year) : "2029",
      holderName: newCardHolder.toUpperCase(),
      isDefault: newCardSetDefault || paymentMethods.length === 0,
      funding: "Credit",
      colorGradient:
        newCardBrand === "visa"
          ? "from-slate-900 via-indigo-950 to-blue-900"
          : "from-zinc-900 via-neutral-900 to-amber-950",
    };

    if (newMethod.isDefault) {
      setPaymentMethods((prev) => [
        ...prev.map((c) => ({ ...c, isDefault: false })),
        newMethod,
      ]);
    } else {
      setPaymentMethods((prev) => [...prev, newMethod]);
    }

    setIsAddCardOpen(false);
    setNewCardNumber("");
    setNewCardHolder("");
    setNewCardExp("");
    setNewCardCvc("");
    toast.success("New payment method added successfully!", {
      description: `${newMethod.brand} •••• ${newMethod.last4} is now available.`,
    });
  };

  const handleDownloadInvoice = (inv: Invoice) => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1000)),
      {
        loading: `Generating PDF for ${inv.number}...`,
        success: `Downloaded ${inv.number}.pdf to your device.`,
        error: "Failed to download invoice.",
      }
    );
  };

  const handleSaveBillingInfo = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditBillingOpen(false);
    toast.success("Billing & Tax information updated successfully.");
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-indigo-500/30 font-sans pb-24">
      {/* Dynamic Ambient Background Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 left-1/4 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[140px]" />
        <div className="absolute top-1/3 -right-40 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[140px]" />
        <div className="absolute -bottom-40 left-1/3 w-[600px] h-[600px] bg-black text-white/10 rounded-full blur-[160px]" />
        <div className="absolute inset-0 " />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-10">
        {/* Top Breadcrumb & Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-mono text-indigo-400">
              <span>ORGANIZATION SETTINGS</span>
              <span>/</span>
              <span className="text-slate-400">BILLING & USAGE</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-400">
              Subscription & Billing
            </h1>
            <p className="text-sm text-slate-400 max-w-2xl">
              Manage your plan subscription tier, real-time AI quota consumption, corporate payment cards, and tax invoices.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.info("Syncing latest usage and invoice data with Stripe...")}
              className="bg-slate-50 border-white/10 text-slate-300 hover:bg-white hover:text-slate-900 transition-all backdrop-blur-sm"
            >
              <RefreshCw className="w-3.5 h-3.5 mr-2 text-indigo-400" />
              Sync Stripe Data
            </Button>
            <Button
              size="sm"
              onClick={() => {
                const el = document.getElementById("pricing-section");
                el?.scrollIntoView({ behavior: "smooth" });
              }}
              className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-slate-900 shadow-lg shadow-indigo-600/25 border-0 font-medium transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 mr-2" />
              Upgrade Plan
            </Button>
          </div>
        </div>

        {/* SECTION 1: Active Subscription & Resource Quota Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Current Plan Overview Card */}
          <Card className="lg:col-span-5 bg-gradient-to-b from-slate-900/90 via-slate-900/60 to-slate-950/80 border-white/10  shadow-md relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />

            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <Badge
                  variant="outline"
                  className="bg-indigo-500/10 border-indigo-500/30 text-indigo-300 px-3 py-1 font-mono text-xs flex items-center gap-1.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  CURRENT ACTIVE PLAN
                </Badge>
                <span className="text-xs text-slate-400 font-mono">Renews on Sept 15, 2026</span>
              </div>
              <div className="mt-4 flex items-baseline justify-between">
                <div>
                  <CardTitle className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                    {currentPlan.name} Team Plan
                    <Badge className="bg-indigo-600/80 text-slate-900 hover:bg-indigo-600 text-[10px] uppercase font-bold tracking-wider">
                      Active
                    </Badge>
                  </CardTitle>
                  <CardDescription className="text-slate-400 mt-1 text-xs">
                    {currentPlan.tagline}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4 pt-0">
              <div className="p-4 rounded-xl bg-black/40 border border-white/[0.06] flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-400 uppercase font-mono">Current Billing Rate</div>
                  <div className="text-2xl font-extrabold text-slate-900 flex items-baseline gap-1 mt-0.5">
                    ${isAnnual ? currentPlan.annualPrice : currentPlan.monthlyPrice}
                    <span className="text-xs font-normal text-slate-400">/ month</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-emerald-400 flex items-center gap-1 justify-end font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Auto-Renewal ON
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">Primary: Visa •••• 4242</div>
                </div>
              </div>

              <div className="space-y-2 pt-1 text-xs text-slate-300">
                <div className="flex items-center justify-between py-1 border-b border-white/[0.04]">
                  <span className="text-slate-400 flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-indigo-400" /> Team Seats Limit
                  </span>
                  <span className="font-semibold text-slate-900">8 / 10 Active Seats</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-white/[0.04]">
                  <span className="text-slate-400 flex items-center gap-2">
                    <Cpu className="w-3.5 h-3.5 text-purple-400" /> Model Inference Latency
                  </span>
                  <span className="font-semibold text-emerald-400">&lt;45ms Ultra-Fast</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-white/[0.04]">
                  <span className="text-slate-400 flex items-center gap-2">
                    <Lock className="w-3.5 h-3.5 text-blue-400" /> Security & Compliance
                  </span>
                  <span className="font-semibold text-slate-900">SOC-2 Type II Certified</span>
                </div>
              </div>
            </CardContent>

            <CardFooter className="pt-2 border-t border-white/[0.06] flex items-center justify-between gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  toast.warning("Subscription cancellation request opened. Our retention specialist will assist you.")
                }
                className="text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 p-0 h-auto"
              >
                Cancel Subscription
              </Button>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditBillingOpen(true)}
                  className="text-xs bg-white/5 border-white/10 hover:bg-white/10 text-slate-800"
                >
                  Manage Billing
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    const el = document.getElementById("pricing-section");
                    el?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="text-xs bg-indigo-600 hover:bg-indigo-500 text-slate-900 font-medium shadow-md shadow-indigo-600/30"
                >
                  Change Plan
                </Button>
              </div>
            </CardFooter>
          </Card>

          {/* Real-time Resource Usage Meters */}
          <Card className="lg:col-span-7 bg-slate-50 border-white/10  shadow-xl flex flex-col justify-between">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Server className="w-4 h-4 text-indigo-400" />
                    Monthly Quotas & Compute Consumption
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-400 mt-0.5">
                    Billing cycle: Aug 01 – Aug 31, 2026 (18 days remaining)
                  </CardDescription>
                </div>
                <Badge
                  variant="outline"
                  className="bg-emerald-500/10 text-emerald-300 border-emerald-500/20 text-[11px] font-mono"
                >
                  SYSTEM OPTIMAL
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-5">
              {/* Meter 1: Neural AI Inferences */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-slate-800 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-400" /> Neural Model Inferences
                  </span>
                  <span className="font-mono text-slate-300">
                    <strong className="text-slate-900">84,250</strong> / 100,000 queries{" "}
                    <span className="text-amber-400 font-semibold">(84.2%)</span>
                  </span>
                </div>
                <div className="relative h-2 w-full bg-white rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-amber-500 rounded-full transition-all duration-500"
                    style={{ width: "84.2%" }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-slate-400 pt-0.5">
                  <span>Standard quota resets Sept 01</span>
                  <span className="text-amber-400/90 font-mono">15,750 queries left</span>
                </div>
              </div>

              {/* Meter 2: Vector DB Storage */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-slate-800 flex items-center gap-1.5">
                    <HardDrive className="w-3.5 h-3.5 text-cyan-400" /> Vector Database Storage
                  </span>
                  <span className="font-mono text-slate-300">
                    <strong className="text-slate-900">38.4 GB</strong> / 50 GB{" "}
                    <span className="text-cyan-400 font-semibold">(76.8%)</span>
                  </span>
                </div>
                <div className="relative h-2 w-full bg-white rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-500"
                    style={{ width: "76.8%" }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-slate-400 pt-0.5">
                  <span>Fast NVMe persistent vector indices</span>
                  <span className="text-slate-300 font-mono">11.6 GB available</span>
                </div>
              </div>

              {/* Meter 3: Active Team Seats */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-slate-800 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-indigo-400" /> Team Seats Allocated
                  </span>
                  <span className="font-mono text-slate-300">
                    <strong className="text-slate-900">8</strong> / 10 seats{" "}
                    <span className="text-indigo-400 font-semibold">(80%)</span>
                  </span>
                </div>
                <div className="relative h-2 w-full bg-white rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                    style={{ width: "80%" }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-slate-400 pt-0.5">
                  <span>2 invite slots open for developers</span>
                  <button
                    onClick={() => toast.info("Navigate to Workspace -> Members to invite new team members.")}
                    className="text-indigo-400 hover:text-indigo-300 underline text-[11px]"
                  >
                    Manage Members
                  </button>
                </div>
              </div>
            </CardContent>

            <CardFooter className="pt-3 border-t border-white/[0.06] bg-black/20 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-1.5 text-slate-400">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span>Running close to monthly query threshold? Add compute pack.</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => toast.success("Compute Burst Pack (+50,000 queries for $25) added to next invoice.")}
                className="h-7 text-xs bg-indigo-950/40 border-indigo-500/30 text-indigo-300 hover:bg-indigo-900/60"
              >
                + Add 50k Tokens ($25)
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* SECTION 2: Pricing Plans & Tiers (Starter, Pro, Enterprise) */}
        <div id="pricing-section" className="space-y-6 pt-4 scroll-mt-6">
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <Badge
              variant="outline"
              className="bg-indigo-500/10 border-indigo-500/30 text-indigo-400 px-3 py-1 font-mono text-xs"
            >
              FLEXIBLE SCALING FOR EVERY STAGE
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Select the Plan Tailored to Your Growth
            </h2>
            <p className="text-sm text-slate-400">
              Upgrade, downgrade, or customize your computational throughput anytime. Transparent, predictable pricing.
            </p>

            {/* Monthly / Annual Toggle Switch */}
            <div className="flex items-center justify-center gap-3 pt-2">
              <span
                className={`text-xs font-semibold cursor-pointer transition-colors ${
                  !isAnnual ? "text-slate-900" : "text-slate-400 hover:text-slate-800"
                }`}
                onClick={() => setIsAnnual(false)}
              >
                Monthly Billing
              </span>

              <div className="flex items-center gap-2">
                <Switch
                  checked={isAnnual}
                  onCheckedChange={setIsAnnual}
                  className="data-[state=checked]:bg-indigo-600"
                />
              </div>

              <div
                className="flex items-center gap-1.5 cursor-pointer"
                onClick={() => setIsAnnual(true)}
              >
                <span
                  className={`text-xs font-semibold transition-colors ${
                    isAnnual ? "text-slate-900" : "text-slate-400 hover:text-slate-800"
                  }`}
                >
                  Annual Billing
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 text-emerald-300">
                  SAVE 20% + 2 MO FREE
                </span>
              </div>
            </div>
          </div>

          {/* Pricing Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
            {INITIAL_PLANS.map((plan) => {
              const isCurrent = plan.id === currentPlanId;
              const price = isAnnual ? plan.annualPrice : plan.monthlyPrice;

              return (
                <div
                  key={plan.id}
                  className={`relative rounded-2xl transition-all duration-300 flex flex-col ${
                    plan.isPopular
                      ? "bg-gradient-to-b from-indigo-950/60 via-slate-900/90 to-slate-950 border-2 border-indigo-500/60 shadow-md shadow-indigo-950/50 scale-[1.02] z-10"
                      : "bg-slate-50 border border-white/10 hover:border-white/20 hover:bg-slate-50 shadow-lg"
                  }  overflow-hidden`}
                >
                  {/* Top highlight gradient glow for popular card */}
                  {plan.isPopular && (
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
                  )}

                  <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Badge / Header */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                          {plan.name}
                          {isCurrent && (
                            <Badge
                              variant="outline"
                              className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-[10px] font-mono uppercase"
                            >
                              Current
                            </Badge>
                          )}
                        </h3>

                        {plan.badge && (
                          <span className="px-2.5 py-0.5 text-[10px] font-extrabold tracking-wider uppercase rounded-full bg-indigo-500 text-slate-900 shadow-sm shadow-indigo-500/40">
                            {plan.badge}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-400 min-h-[36px]">{plan.tagline}</p>

                      {/* Price Section */}
                      <div className="my-6 pb-6 border-b border-white/[0.08]">
                        <div className="flex items-baseline gap-1">
                          <span className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
                            ${price}
                          </span>
                          <span className="text-slate-400 text-xs font-medium">
                            / user / month
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-1 font-mono">
                          {isAnnual
                            ? `Billed annually ($${price * 12}/yr)`
                            : "Billed on a monthly basis"}
                        </div>
                      </div>

                      {/* Key Quota Badges */}
                      <div className="grid grid-cols-2 gap-2 mb-6 text-[11px] font-mono text-slate-300">
                        <div className="p-2 rounded-lg bg-black/40 border border-white/[0.04]">
                          <span className="text-slate-400 block text-[10px]">INFERENCES</span>
                          <span className="font-semibold text-slate-900">{plan.quota.tokens}</span>
                        </div>
                        <div className="p-2 rounded-lg bg-black/40 border border-white/[0.04]">
                          <span className="text-slate-400 block text-[10px]">STORAGE</span>
                          <span className="font-semibold text-slate-900">{plan.quota.storage}</span>
                        </div>
                        <div className="p-2 rounded-lg bg-black/40 border border-white/[0.04]">
                          <span className="text-slate-400 block text-[10px]">TEAM SEATS</span>
                          <span className="font-semibold text-slate-900">{plan.quota.seats}</span>
                        </div>
                        <div className="p-2 rounded-lg bg-black/40 border border-white/[0.04]">
                          <span className="text-slate-400 block text-[10px]">SLA GUARANTEE</span>
                          <span className="font-semibold text-emerald-400">{plan.quota.sla}</span>
                        </div>
                      </div>

                      {/* Feature Checklist */}
                      <div className="space-y-3 pt-2">
                        <div className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400">
                          Included Capabilities:
                        </div>
                        <ul className="space-y-2.5 text-xs">
                          {plan.features.map((feature, i) => (
                            <li key={i} className="flex items-start gap-2.5">
                              {feature.included ? (
                                <div className="mt-0.5 rounded-full p-0.5 bg-indigo-500/20 text-indigo-400 flex-shrink-0">
                                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                                </div>
                              ) : (
                                <div className="mt-0.5 rounded-full p-0.5 bg-white text-slate-600 flex-shrink-0">
                                  <span className="block w-3.5 h-3.5 text-center leading-[14px] text-[10px]">
                                    —
                                  </span>
                                </div>
                              )}
                              <span
                                className={`${
                                  feature.included
                                    ? feature.highlight
                                      ? "text-slate-900 font-medium"
                                      : "text-slate-300"
                                    : "text-slate-500 line-through"
                                }`}
                              >
                                {feature.text}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* CTA Button */}
                    <div className="pt-8">
                      <Button
                        onClick={() => handleSelectPlan(plan)}
                        disabled={isCurrent}
                        className={`w-full py-5 text-xs font-semibold rounded-xl transition-all duration-200 ${
                          isCurrent
                            ? "bg-white text-slate-400 border border-white/10 cursor-default"
                            : plan.isPopular
                            ? "bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-slate-900 shadow-xl shadow-indigo-600/30 border-0"
                            : "bg-white/10 hover:bg-white/20 text-slate-900 border border-white/10"
                        }`}
                      >
                        {isCurrent ? (
                          <span className="flex items-center justify-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            Current Active Plan
                          </span>
                        ) : plan.id === "enterprise" ? (
                          <span className="flex items-center justify-center gap-1.5">
                            Upgrade to Enterprise <ArrowUpRight className="w-4 h-4" />
                          </span>
                        ) : (
                          `Switch to ${plan.name}`
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* SECTION 3: Payment Methods (Visa, Mastercard) & Billing Address */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-4">
          {/* Payment Methods Cards */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-indigo-400" />
                  Saved Payment Methods
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Securely stored via Stripe Vault PCI-DSS Level 1 compliant encryption.
                </p>
              </div>

              {/* Add Card Button */}
              <Dialog open={isAddCardOpen} onOpenChange={setIsAddCardOpen}>
                <DialogTrigger asChild>
                  <Button
                    size="sm"
                    className="bg-indigo-600/90 hover:bg-indigo-500 text-slate-900 text-xs font-medium shadow-md shadow-indigo-600/20"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1.5" />
                    Add Payment Method
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-slate-50 border-white/10 text-slate-900 max-w-md backdrop-blur-2xl">
                  <DialogHeader>
                    <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-indigo-400" />
                      Add Corporate Payment Card
                    </DialogTitle>
                    <DialogDescription className="text-xs text-slate-400">
                      Enter your credit or debit card details for recurring SaaS charges.
                    </DialogDescription>
                  </DialogHeader>

                  <form onSubmit={handleAddCard} className="space-y-4 pt-2">
                    {/* Live Preview Card */}
                    <div className="p-4 rounded-xl bg-gradient-to-tr from-slate-950 via-indigo-950 to-blue-900 border border-white/20 text-slate-900 shadow-xl relative overflow-hidden">
                      <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-2">
                          <div className="w-9 h-6 rounded bg-amber-300/30 border border-amber-300/60 flex items-center justify-center">
                            <div className="w-6 h-4 rounded-sm border border-amber-200/50" />
                          </div>
                          <span className="text-[10px] font-mono tracking-widest text-slate-400">
                            CORPORATE
                          </span>
                        </div>
                        <span className="font-bold font-mono tracking-wider text-sm">
                          {newCardBrand.toUpperCase()}
                        </span>
                      </div>

                      <div className="font-mono text-base tracking-widest text-slate-900 mb-4">
                        {newCardNumber || "•••• •••• •••• ••••"}
                      </div>

                      <div className="flex justify-between items-end text-[11px] font-mono">
                        <div>
                          <div className="text-slate-400 text-[9px] uppercase">CARDHOLDER</div>
                          <div className="font-medium truncate max-w-[180px]">
                            {newCardHolder || "FULL NAME"}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-slate-400 text-[9px] uppercase">EXPIRES</div>
                          <div className="font-medium">{newCardExp || "MM/YY"}</div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 text-xs">
                      <div>
                        <Label className="text-slate-300 text-xs">Card Brand Type</Label>
                        <div className="grid grid-cols-2 gap-2 mt-1">
                          <button
                            type="button"
                            onClick={() => setNewCardBrand("visa")}
                            className={`p-2 rounded-lg border text-center font-medium transition-all ${
                              newCardBrand === "visa"
                                ? "bg-indigo-600/30 border-indigo-500 text-slate-900"
                                : "bg-black/30 border-white/10 text-slate-400"
                            }`}
                          >
                            Visa Card
                          </button>
                          <button
                            type="button"
                            onClick={() => setNewCardBrand("mastercard")}
                            className={`p-2 rounded-lg border text-center font-medium transition-all ${
                              newCardBrand === "mastercard"
                                ? "bg-indigo-600/30 border-indigo-500 text-slate-900"
                                : "bg-black/30 border-white/10 text-slate-400"
                            }`}
                          >
                            Mastercard
                          </button>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="cardNumber" className="text-slate-300 text-xs">
                          Card Number
                        </Label>
                        <Input
                          id="cardNumber"
                          placeholder="4242 •••• •••• 4242"
                          value={newCardNumber}
                          onChange={(e) => setNewCardNumber(e.target.value)}
                          className="bg-black/40 border-white/10 text-slate-900 font-mono mt-1 text-xs"
                          maxLength={19}
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="cardHolder" className="text-slate-300 text-xs">
                          Name on Card
                        </Label>
                        <Input
                          id="cardHolder"
                          placeholder="e.g. ALEXANDER VANCE"
                          value={newCardHolder}
                          onChange={(e) => setNewCardHolder(e.target.value)}
                          className="bg-black/40 border-white/10 text-slate-900 mt-1 text-xs uppercase"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor="cardExp" className="text-slate-300 text-xs">
                            Expiration (MM/YY)
                          </Label>
                          <Input
                            id="cardExp"
                            placeholder="12/28"
                            value={newCardExp}
                            onChange={(e) => setNewCardExp(e.target.value)}
                            className="bg-black/40 border-white/10 text-slate-900 font-mono mt-1 text-xs"
                            maxLength={5}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="cardCvc" className="text-slate-300 text-xs">
                            Security CVC
                          </Label>
                          <Input
                            id="cardCvc"
                            type="password"
                            placeholder="•••"
                            value={newCardCvc}
                            onChange={(e) => setNewCardCvc(e.target.value)}
                            className="bg-black/40 border-white/10 text-slate-900 font-mono mt-1 text-xs"
                            maxLength={4}
                            required
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <Switch
                          id="setDefaultSwitch"
                          checked={newCardSetDefault}
                          onCheckedChange={setNewCardSetDefault}
                        />
                        <Label htmlFor="setDefaultSwitch" className="text-xs text-slate-300 cursor-pointer">
                          Set as primary default payment method
                        </Label>
                      </div>
                    </div>

                    <DialogFooter className="pt-2">
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setIsAddCardOpen(false)}
                        className="text-xs text-slate-400 hover:text-slate-900"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        className="bg-indigo-600 hover:bg-indigo-500 text-slate-900 text-xs font-semibold"
                      >
                        Authorize & Save Card
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {/* List of Physical Styled Metallic Glassmorphic Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {paymentMethods.map((method) => (
                <div
                  key={method.id}
                  className={`relative rounded-2xl p-5 border transition-all duration-300 overflow-hidden flex flex-col justify-between h-[210px] ${
                    method.isDefault
                      ? "bg-gradient-to-br from-slate-900 via-indigo-950/80 to-slate-950 border-indigo-500/40 shadow-xl shadow-indigo-950/40 ring-1 ring-indigo-500/30"
                      : "bg-slate-50 border-white/10 hover:border-white/20 shadow-md"
                  } `}
                >
                  {/* Subtle Card Reflective Overlay */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/[0.03] rounded-full blur-2xl pointer-events-none" />

                  {/* Card Top: Chip & Brand */}
                  <div className="flex items-center justify-between z-10">
                    <div className="flex items-center gap-2.5">
                      {/* Metallic EMV Chip Visual */}
                      <div className="w-8 h-6 rounded-md bg-gradient-to-tr from-amber-400/40 via-amber-200/50 to-amber-500/30 border border-amber-300/40 flex items-center justify-center p-1">
                        <div className="w-full h-full border border-amber-400/40 rounded-sm grid grid-cols-2 gap-0.5" />
                      </div>
                      <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase">
                        {method.funding}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {method.isDefault && (
                        <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 text-[10px] font-mono px-2 py-0.5">
                          DEFAULT
                        </Badge>
                      )}

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 rounded-full text-slate-400 hover:text-slate-900 hover:bg-white/10"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="bg-slate-50 border-white/10 text-slate-800 text-xs"
                        >
                          <DropdownMenuGroup>
                            <DropdownMenuLabel className="text-[11px] text-slate-400">
                              Card Options ({method.brand} •••• {method.last4})
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-white/10" />
                            {!method.isDefault && (
                              <DropdownMenuItem
                                onClick={() => handleSetDefaultCard(method.id)}
                                className="cursor-pointer hover:bg-indigo-600/30 focus:bg-indigo-600/30"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5 mr-2 text-emerald-400" />
                                Set as Default
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              onClick={() =>
                                toast.info(`Card ${method.brand} ending in ${method.last4} is active and verified.`)
                              }
                              className="cursor-pointer"
                            >
                              <ShieldCheck className="w-3.5 h-3.5 mr-2 text-blue-400" />
                              Verify PCI-3DS Status
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-white/10" />
                            <DropdownMenuItem
                              onClick={() => handleDeleteCard(method.id)}
                              className="text-rose-400 cursor-pointer hover:bg-rose-950/40 focus:bg-rose-950/40"
                            >
                              <Trash2 className="w-3.5 h-3.5 mr-2" />
                              Remove Card
                            </DropdownMenuItem>
                          </DropdownMenuGroup>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  {/* Card Middle: Masked Number */}
                  <div className="z-10 my-2">
                    <div className="text-[10px] text-slate-400 font-mono tracking-wider">
                      CARD NUMBER
                    </div>
                    <div className="font-mono text-base tracking-widest text-slate-900 font-semibold flex items-center gap-2 mt-0.5">
                      <span>••••</span>
                      <span>••••</span>
                      <span>••••</span>
                      <span className="text-indigo-300 font-bold">{method.last4}</span>
                    </div>
                  </div>

                  {/* Card Bottom: Holder Name, Expiry & Brand Logo */}
                  <div className="flex items-end justify-between z-10 pt-2 border-t border-white/[0.08]">
                    <div className="max-w-[130px]">
                      <div className="text-[9px] text-slate-400 font-mono">CARDHOLDER</div>
                      <div className="text-xs font-semibold text-slate-800 truncate">
                        {method.holderName}
                      </div>
                    </div>

                    <div>
                      <div className="text-[9px] text-slate-400 font-mono">EXPIRES</div>
                      <div className="text-xs font-semibold font-mono text-slate-800">
                        {method.expMonth}/{method.expYear.slice(-2)}
                      </div>
                    </div>

                    <div className="text-right">
                      {method.type === "visa" ? (
                        <span className="font-black italic text-lg tracking-wider text-blue-400 font-serif">
                          VISA
                        </span>
                      ) : (
                        <div className="flex items-center -space-x-2">
                          <div className="w-5 h-5 rounded-full bg-rose-500 opacity-90" />
                          <div className="w-5 h-5 rounded-full bg-amber-400 opacity-90" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Invoicing & Tax Details Card */}
          <div className="lg:col-span-5">
            <Card className="bg-slate-50 border-white/10  shadow-xl h-full flex flex-col justify-between">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Building className="w-4 h-4 text-indigo-400" />
                    Invoicing & Tax Profile
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditBillingOpen(true)}
                    className="text-xs text-indigo-400 hover:text-indigo-300 hover:bg-white/5 h-7 px-2"
                  >
                    Edit Details
                  </Button>
                </div>
                <CardDescription className="text-xs text-slate-400">
                  These details will appear on all past and future PDF tax receipts.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-3.5 text-xs text-slate-300">
                <div className="p-3 rounded-xl bg-black/30 border border-white/[0.06] space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Company Name:</span>
                    <span className="font-semibold text-slate-900">{billingInfo.companyName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Tax ID / VAT:</span>
                    <span className="font-mono text-indigo-300 font-medium">{billingInfo.taxId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Billing Email:</span>
                    <span className="text-slate-800">{billingInfo.billingEmail}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Invoice Currency:</span>
                    <span className="font-mono text-emerald-400 font-semibold">{billingInfo.currency}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-slate-400 text-[11px] block uppercase font-mono">
                    Registered Tax Address:
                  </span>
                  <div className="text-slate-300 leading-relaxed text-xs p-2.5 rounded-lg bg-black/20 border border-white/[0.04]">
                    <div>{billingInfo.addressLine1}</div>
                    {billingInfo.addressLine2 && <div>{billingInfo.addressLine2}</div>}
                    <div>
                      {billingInfo.city}, {billingInfo.state} {billingInfo.postalCode}
                    </div>
                    <div>{billingInfo.country}</div>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  E-Invoicing Compliant (EU / US)
                </span>
                <button
                  onClick={() => toast.info("VAT reverse-charge exemption rules applied automatically where valid.")}
                  className="hover:text-slate-800 underline"
                >
                  Tax Rules & Exemption
                </button>
              </CardFooter>
            </Card>
          </div>
        </div>

        {/* SECTION 4: Past Invoices & Billing History Table */}
        <div className="space-y-4 pt-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Receipt className="w-5 h-5 text-indigo-400" />
                Invoice & Billing History
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Review, search, and download official PDF tax invoices for accounting reconciliations.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Search Bar */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Search invoice or date..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-8 pl-8 text-xs bg-slate-50 border-white/10 text-slate-900 w-48 sm:w-56"
                />
              </div>

              {/* Status Filter Tabs */}
              <div className="flex items-center bg-slate-50 border border-white/10 p-0.5 rounded-lg text-xs">
                {(["all", "paid", "pending"] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-2.5 py-1 rounded-md capitalize font-medium transition-all ${
                      statusFilter === st
                        ? "bg-indigo-600 text-slate-900 shadow-sm"
                        : "text-slate-400 hover:text-slate-900"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              {/* Export Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  toast.success("Consolidated 2026 Invoices CSV report emailed to finance@neurometric.ai")
                }
                className="h-8 text-xs bg-slate-50 border-white/10 text-slate-300 hover:bg-white"
              >
                <Download className="w-3.5 h-3.5 mr-1.5" />
                Export CSV
              </Button>
            </div>
          </div>

          {/* Invoices Table Card */}
          <Card className="bg-slate-50 border-white/10  shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-black/30 border-b border-white/[0.08]">
                  <TableRow className="border-b border-white/[0.08] hover:bg-transparent">
                    <TableHead className="text-slate-400 text-xs font-mono">INVOICE #</TableHead>
                    <TableHead className="text-slate-400 text-xs font-mono">BILLING DATE</TableHead>
                    <TableHead className="text-slate-400 text-xs font-mono">DESCRIPTION</TableHead>
                    <TableHead className="text-slate-400 text-xs font-mono">PAID WITH</TableHead>
                    <TableHead className="text-slate-400 text-xs font-mono">AMOUNT</TableHead>
                    <TableHead className="text-slate-400 text-xs font-mono">STATUS</TableHead>
                    <TableHead className="text-right text-slate-400 text-xs font-mono">ACTIONS</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvoices.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-32 text-center text-slate-400 text-xs">
                        No invoices match your search query or filter.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredInvoices.map((invoice) => (
                      <TableRow
                        key={invoice.id}
                        className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors"
                      >
                        {/* Invoice Number */}
                        <TableCell className="font-mono text-xs font-semibold text-slate-900">
                          <button
                            onClick={() => {
                              setSelectedInvoice(invoice);
                              setIsReceiptOpen(true);
                            }}
                            className="hover:text-indigo-400 transition-colors flex items-center gap-1.5"
                          >
                            <FileText className="w-3.5 h-3.5 text-indigo-400" />
                            {invoice.number}
                          </button>
                        </TableCell>

                        {/* Date */}
                        <TableCell className="text-xs text-slate-300">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-slate-500" />
                            {invoice.date}
                          </div>
                        </TableCell>

                        {/* Description */}
                        <TableCell className="text-xs text-slate-800 font-medium">
                          {invoice.description}
                        </TableCell>

                        {/* Payment Method */}
                        <TableCell className="text-xs font-mono text-slate-400">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-black/40 border border-white/[0.04]">
                            {invoice.cardBrand} •••• {invoice.cardLast4}
                          </span>
                        </TableCell>

                        {/* Amount */}
                        <TableCell className="text-xs font-bold font-mono text-slate-900">
                          ${invoice.amount.toFixed(2)} USD
                        </TableCell>

                        {/* Status Badge */}
                        <TableCell>
                          {invoice.status === "paid" ? (
                            <Badge
                              variant="outline"
                              className="bg-emerald-500/10 text-emerald-300 border-emerald-500/30 text-[10px] font-mono px-2 py-0.5 flex items-center gap-1 w-fit"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                              PAID
                            </Badge>
                          ) : invoice.status === "pending" ? (
                            <Badge
                              variant="outline"
                              className="bg-amber-500/10 text-amber-300 border-amber-500/30 text-[10px] font-mono px-2 py-0.5 flex items-center gap-1 w-fit"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                              PENDING
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="bg-slate-500/10 text-slate-400 border-slate-500/30 text-[10px] font-mono px-2 py-0.5 w-fit"
                            >
                              REFUNDED
                            </Badge>
                          )}
                        </TableCell>

                        {/* Actions */}
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDownloadInvoice(invoice)}
                                    className="h-7 w-7 p-0 rounded-md text-slate-300 hover:text-slate-900 hover:bg-white/10"
                                  >
                                    <Download className="w-3.5 h-3.5" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent className="bg-slate-50 border-white/10 text-xs">
                                  Download PDF
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>

                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedInvoice(invoice);
                                      setIsReceiptOpen(true);
                                    }}
                                    className="h-7 w-7 p-0 rounded-md text-slate-300 hover:text-indigo-400 hover:bg-white/10"
                                  >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent className="bg-slate-50 border-white/10 text-xs">
                                  View Itemized Receipt
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Table Footer Summary */}
            <div className="p-4 bg-black/40 border-t border-white/[0.08] flex flex-wrap items-center justify-between text-xs text-slate-400 gap-3">
              <div>
                Showing <strong className="text-slate-900">{filteredInvoices.length}</strong> invoices for calendar year 2026.
              </div>
              <div className="flex items-center gap-4 font-mono">
                <span>
                  Total Billed YTD:{" "}
                  <strong className="text-slate-900">
                    ${invoices.reduce((sum, i) => sum + i.amount, 0).toFixed(2)} USD
                  </strong>
                </span>
                <span>
                  Next Expected Invoice:{" "}
                  <strong className="text-indigo-400">Sept 01, 2026 ($79.00)</strong>
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* SECTION 5: FAQ & Enterprise Billing Assistance */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-white/10  flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-indigo-400" />
              Need custom invoicing, wire transfers, or PO billing?
            </h3>
            <p className="text-xs text-slate-400 max-w-xl">
              For annual commitments exceeding $5,000/yr, we provide ACH / SEPA wire invoices, net-30 payment terms, and vendor onboarding assistance.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.info("Opening Neurometric Procurement Guide (PDF)...")}
              className="bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 text-xs"
            >
              Vendor W-9 & W-8BEN Form
            </Button>
            <Button
              size="sm"
              onClick={() => toast.success("Enterprise representative assigned. Check your email shortly.")}
              className="bg-indigo-600 hover:bg-indigo-500 text-slate-900 text-xs font-semibold"
            >
              Contact Billing Specialist
            </Button>
          </div>
        </div>
      </div>

      {/* DIALOG 1: Itemized Invoice & Receipt Viewer Modal */}
      <Dialog open={isReceiptOpen} onOpenChange={setIsReceiptOpen}>
        <DialogContent className="bg-slate-50 border-white/10 text-slate-900 max-w-xl backdrop-blur-2xl">
          {selectedInvoice && (
            <div className="space-y-5">
              <DialogHeader className="border-b border-white/[0.08] pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <DialogTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
                      <Receipt className="w-5 h-5 text-indigo-400" />
                      Invoice {selectedInvoice.number}
                    </DialogTitle>
                    <DialogDescription className="text-xs text-slate-400 mt-0.5">
                      Issued on {selectedInvoice.date} • Period: {selectedInvoice.period}
                    </DialogDescription>
                  </div>
                  <Badge
                    variant="outline"
                    className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-mono text-xs uppercase"
                  >
                    PAID IN FULL
                  </Badge>
                </div>
              </DialogHeader>

              {/* Company & Client Grid */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="space-y-1 p-3 rounded-lg bg-black/30 border border-white/[0.04]">
                  <div className="text-[10px] text-slate-400 font-mono uppercase">ISSUED BY</div>
                  <div className="font-bold text-slate-900">Neurometric Insights Inc.</div>
                  <div className="text-slate-400">548 Market Street, Suite 7200</div>
                  <div className="text-slate-400">San Francisco, CA 94104</div>
                  <div className="text-indigo-400 font-mono text-[11px]">EIN: 84-2938491</div>
                </div>

                <div className="space-y-1 p-3 rounded-lg bg-black/30 border border-white/[0.04]">
                  <div className="text-[10px] text-slate-400 font-mono uppercase">BILLED TO</div>
                  <div className="font-bold text-slate-900">{billingInfo.companyName}</div>
                  <div className="text-slate-400">{billingInfo.addressLine1}</div>
                  <div className="text-slate-400">{billingInfo.city}, {billingInfo.state} {billingInfo.postalCode}</div>
                  <div className="text-indigo-400 font-mono text-[11px]">{billingInfo.taxId}</div>
                </div>
              </div>

              {/* Line Items Table */}
              <div className="border border-white/[0.08] rounded-lg overflow-hidden">
                <Table>
                  <TableHeader className="bg-black/40">
                    <TableRow className="border-b border-white/[0.08] hover:bg-transparent">
                      <TableHead className="text-slate-400 text-xs">ITEM DESCRIPTION</TableHead>
                      <TableHead className="text-center text-slate-400 text-xs">QTY</TableHead>
                      <TableHead className="text-right text-slate-400 text-xs">UNIT PRICE</TableHead>
                      <TableHead className="text-right text-slate-400 text-xs">TOTAL</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedInvoice.items.map((item, index) => (
                      <TableRow key={index} className="border-b border-white/[0.04]">
                        <TableCell className="text-xs font-medium text-slate-800">
                          {item.description}
                        </TableCell>
                        <TableCell className="text-center text-xs font-mono text-slate-400">
                          {item.quantity}
                        </TableCell>
                        <TableCell className="text-right text-xs font-mono text-slate-400">
                          ${item.unitPrice.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right text-xs font-mono font-semibold text-slate-900">
                          ${item.total.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Financial Totals */}
              <div className="space-y-1.5 text-xs text-right pt-2 border-t border-white/[0.08]">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal</span>
                  <span className="font-mono">${selectedInvoice.subtotal.toFixed(2)} USD</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Estimated Tax / VAT (0.00%)</span>
                  <span className="font-mono">$0.00 USD</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-slate-900 pt-1 border-t border-white/[0.06]">
                  <span>Total Paid</span>
                  <span className="font-mono text-emerald-400">
                    ${selectedInvoice.amount.toFixed(2)} USD
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 pt-1">
                  Charged to {selectedInvoice.cardBrand} ending in {selectedInvoice.cardLast4}
                </div>
              </div>

              <DialogFooter className="pt-3 border-t border-white/[0.08] flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    window.print();
                  }}
                  className="bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 text-xs"
                >
                  <Printer className="w-3.5 h-3.5 mr-1.5" />
                  Print Receipt
                </Button>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleDownloadInvoice(selectedInvoice)}
                    className="bg-indigo-600 hover:bg-indigo-500 text-slate-900 text-xs font-medium"
                  >
                    <Download className="w-3.5 h-3.5 mr-1.5" />
                    Download PDF Invoice
                  </Button>
                </div>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* DIALOG 2: Edit Invoicing & Tax Profile Modal */}
      <Dialog open={isEditBillingOpen} onOpenChange={setIsEditBillingOpen}>
        <DialogContent className="bg-slate-50 border-white/10 text-slate-900 max-w-lg backdrop-blur-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Building className="w-5 h-5 text-indigo-400" />
              Edit Company & Invoicing Information
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              Update legal tax identification numbers and invoicing dispatch email addresses.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveBillingInfo} className="space-y-3.5 pt-2 text-xs">
            <div>
              <Label className="text-slate-300">Legal Entity / Company Name</Label>
              <Input
                value={billingInfo.companyName}
                onChange={(e) =>
                  setBillingInfo({ ...billingInfo, companyName: e.target.value })
                }
                className="bg-black/40 border-white/10 text-slate-900 mt-1 text-xs"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-slate-300">Tax ID / VAT / EIN Number</Label>
                <Input
                  value={billingInfo.taxId}
                  onChange={(e) =>
                    setBillingInfo({ ...billingInfo, taxId: e.target.value })
                  }
                  className="bg-black/40 border-white/10 text-slate-900 font-mono mt-1 text-xs"
                  required
                />
              </div>
              <div>
                <Label className="text-slate-300">Billing Notification Email</Label>
                <Input
                  type="email"
                  value={billingInfo.billingEmail}
                  onChange={(e) =>
                    setBillingInfo({ ...billingInfo, billingEmail: e.target.value })
                  }
                  className="bg-black/40 border-white/10 text-slate-900 mt-1 text-xs"
                  required
                />
              </div>
            </div>

            <div>
              <Label className="text-slate-300">Address Line 1</Label>
              <Input
                value={billingInfo.addressLine1}
                onChange={(e) =>
                  setBillingInfo({ ...billingInfo, addressLine1: e.target.value })
                }
                className="bg-black/40 border-white/10 text-slate-900 mt-1 text-xs"
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <Label className="text-slate-300">City</Label>
                <Input
                  value={billingInfo.city}
                  onChange={(e) =>
                    setBillingInfo({ ...billingInfo, city: e.target.value })
                  }
                  className="bg-black/40 border-white/10 text-slate-900 mt-1 text-xs"
                  required
                />
              </div>
              <div>
                <Label className="text-slate-300">State / Region</Label>
                <Input
                  value={billingInfo.state}
                  onChange={(e) =>
                    setBillingInfo({ ...billingInfo, state: e.target.value })
                  }
                  className="bg-black/40 border-white/10 text-slate-900 mt-1 text-xs"
                  required
                />
              </div>
              <div>
                <Label className="text-slate-300">Postal Code</Label>
                <Input
                  value={billingInfo.postalCode}
                  onChange={(e) =>
                    setBillingInfo({ ...billingInfo, postalCode: e.target.value })
                  }
                  className="bg-black/40 border-white/10 text-slate-900 font-mono mt-1 text-xs"
                  required
                />
              </div>
            </div>

            <div>
              <Label className="text-slate-300">Country</Label>
              <Input
                value={billingInfo.country}
                onChange={(e) =>
                  setBillingInfo({ ...billingInfo, country: e.target.value })
                }
                className="bg-black/40 border-white/10 text-slate-900 mt-1 text-xs"
                required
              />
            </div>

            <DialogFooter className="pt-3 border-t border-white/[0.08]">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsEditBillingOpen(false)}
                className="text-xs text-slate-400 hover:text-slate-900"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-500 text-slate-900 text-xs font-semibold"
              >
                Save Invoicing Profile
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* DIALOG 3: Plan Upgrade / Downgrade Confirmation Modal */}
      <Dialog open={isPlanModalOpen} onOpenChange={setIsPlanModalOpen}>
        <DialogContent className="bg-slate-50 border-white/10 text-slate-900 max-w-md backdrop-blur-2xl">
          {targetPlan && (
            <div className="space-y-4">
              <DialogHeader>
                <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-400" />
                  Confirm Plan Migration to {targetPlan.name}
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-400">
                  Review your updated subscription terms and immediate quota provisioning.
                </DialogDescription>
              </DialogHeader>

              <div className="p-4 rounded-xl bg-black/40 border border-white/[0.08] space-y-3 text-xs">
                <div className="flex justify-between items-center pb-2 border-b border-white/[0.06]">
                  <span className="text-slate-400">Target Subscription:</span>
                  <span className="font-bold text-slate-900 text-sm">{targetPlan.name} Plan</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-white/[0.06]">
                  <span className="text-slate-400">New Price Rate:</span>
                  <span className="font-mono font-bold text-emerald-400 text-sm">
                    ${isAnnual ? targetPlan.annualPrice : targetPlan.monthlyPrice} / mo
                  </span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-white/[0.06]">
                  <span className="text-slate-400">New Query Limit:</span>
                  <span className="font-mono text-slate-900">{targetPlan.quota.tokens}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Prorated Adjustment Today:</span>
                  <span className="font-mono text-slate-800">$0.00 (Applies next cycle)</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed">
                By confirming, your card ending in <strong>4242</strong> will be billed on the next renewal date. You can cancel or switch anytime.
              </p>

              <DialogFooter className="pt-2">
                <Button
                  variant="ghost"
                  onClick={() => setIsPlanModalOpen(false)}
                  className="text-xs text-slate-400 hover:text-slate-900"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirmPlanChange}
                  className="bg-indigo-600 hover:bg-indigo-500 text-slate-900 text-xs font-semibold shadow-lg shadow-indigo-600/30"
                >
                  Confirm & Provision Tier
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}


