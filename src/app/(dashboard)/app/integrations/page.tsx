"use client";

import React, { useState, useMemo } from "react";
import { 
  MOCK_INTEGRATIONS, 
  Integration, 
  IntegrationStatus, 
  IntegrationCategory 
} from "@/lib/mocks";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Plug, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  Sliders, 
  Search, 
  ExternalLink, 
  Copy, 
  Check, 
  Eye, 
  EyeOff, 
  Sparkles, 
  CreditCard, 
  MessageSquare, 
  Database, 
  GitBranch, 
  Radio, 
  Activity, 
  ShieldCheck, 
  Zap, 
  ArrowUpRight,
  Clock,
  Layers
} from "lucide-react";
// import { toast } from "sonner"; // Assuming sonner might not be installed, using console for now if missing

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<Integration[]>(MOCK_INTEGRATIONS as Integration[]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<IntegrationCategory>("All");
  const [selectedStatus, setSelectedStatus] = useState<"ALL" | "CONNECTED" | "DISCONNECTED">("ALL");
  
  // Dialog State
  const [activeIntegration, setActiveIntegration] = useState<Integration | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [isSyncingAll, setIsSyncingAll] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Filtered Integrations
  const filteredIntegrations = useMemo(() => {
    return integrations.filter((item) => {
      const matchesSearch = 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
      const matchesStatus = selectedStatus === "ALL" || item.status === selectedStatus;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [integrations, searchQuery, selectedCategory, selectedStatus]);

  // Statistics
  const totalIntegrations = integrations.length;
  const connectedCount = integrations.filter(i => i.status === "CONNECTED").length;
  const totalEventsToday = integrations.reduce((acc, curr) => acc + (curr.metrics?.eventsProcessed || 0), 0);

  // Handlers
  const handleOpenConfig = (integration: Integration) => {
    setActiveIntegration(integration);
    const initialValues: Record<string, string> = {};
    integration.configFields.forEach(field => {
      initialValues[field.key] = field.value;
    });
    setFormValues(initialValues);
    setShowSecrets({});
    setIsDialogOpen(true);
  };

  const handleToggleConnection = (id: string, newStatus: IntegrationStatus) => {
    setIntegrations(prev => prev.map(item => {
      if (item.id === id) {
        return {
          ...item,
          status: newStatus,
          lastSync: newStatus === "CONNECTED" ? "Just now" : item.lastSync
        };
      }
      return item;
    }));

    if (activeIntegration && activeIntegration.id === id) {
      setActiveIntegration(prev => prev ? { ...prev, status: newStatus, lastSync: newStatus === "CONNECTED" ? "Just now" : prev.lastSync } : null);
    }
  };

  const handleSaveConfig = () => {
    if (!activeIntegration) return;

    setIntegrations(prev => prev.map(item => {
      if (item.id === activeIntegration.id) {
        const updatedFields = item.configFields.map(field => ({
          ...field,
          value: formValues[field.key] ?? field.value
        }));
        return {
          ...item,
          configFields: updatedFields,
          lastSync: "Just now"
        };
      }
      return item;
    }));

    setIsDialogOpen(false);
  };

  const handleTestConnection = async () => {
    if (!activeIntegration) return;
    setIsTestingConnection(true);
    await new Promise(resolve => setTimeout(resolve, 1200));
    setIsTestingConnection(false);
  };

  const handleSyncAll = async () => {
    setIsSyncingAll(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIntegrations(prev => prev.map(item => item.status === "CONNECTED" ? { ...item, lastSync: "Just now" } : item));
    setIsSyncingAll(false);
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(label);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const renderProviderIcon = (type: string) => {
    switch (type) {
      case "whatsapp": return <MessageSquare className="h-6 w-6 text-emerald-400" />;
      case "openai": return <Sparkles className="h-6 w-6 text-teal-400" />;
      case "stripe": return <CreditCard className="h-6 w-6 text-indigo-400" />;
      case "slack": return <Zap className="h-6 w-6 text-amber-400" />;
      case "supabase": return <Database className="h-6 w-6 text-emerald-400" />;
      case "github": return <GitBranch className="h-6 w-6 text-purple-400" />;
      default: return <Plug className="h-6 w-6 text-slate-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 p-6 md:p-10 font-sans fade-in">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/10 border border-indigo-500/30 text-indigo-400">
                <Layers className="h-6 w-6" />
              </div>
              <h1 className="text-4xl font-black tracking-tight text-black font-serif">Integrations & APIs</h1>
            </div>
            <p className="text-sm text-slate-500 mt-1 max-w-2xl">Connect and manage external services, AI reasoning engines, webhooks, and billing infrastructure.</p>
          </div>
          <Button variant="outline" onClick={handleSyncAll} disabled={isSyncingAll} className="border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800">
            <RefreshCw className={`h-4 w-4 mr-2 ${isSyncingAll ? "animate-spin text-indigo-400" : ""}`} />
            {isSyncingAll ? "Syncing..." : "Sync All Active"}
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-slate-50 border-slate-200 backdrop-blur-md">
            <CardContent className="p-5 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Connected Services</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-slate-900">{connectedCount}</span>
                  <span className="text-xs text-slate-400">/ {totalIntegrations}</span>
                </div>
              </div>
              <div className="h-10 w-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400"><CheckCircle2 className="h-5 w-5" /></div>
            </CardContent>
          </Card>
          <Card className="bg-slate-50 border-slate-200 backdrop-blur-md">
            <CardContent className="p-5 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">API Health Status</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-emerald-400">100%</span>
                </div>
              </div>
              <div className="h-10 w-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400"><ShieldCheck className="h-5 w-5" /></div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200">
          <div className="relative flex-1 max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input type="text" placeholder="Search provider..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 bg-slate-50 border-slate-200 text-slate-800" />
          </div>
          <Tabs value={selectedStatus} onValueChange={(val) => setSelectedStatus(val as any)} className="w-auto">
            <TabsList className="bg-slate-50 border border-slate-200">
              <TabsTrigger value="ALL" className="text-xs">All</TabsTrigger>
              <TabsTrigger value="CONNECTED" className="text-xs text-emerald-400">Connected</TabsTrigger>
              <TabsTrigger value="DISCONNECTED" className="text-xs text-slate-500">Disconnected</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredIntegrations.map((item) => {
            const isConnected = item.status === "CONNECTED";
            return (
              <Card key={item.id} className="group relative flex flex-col justify-between bg-slate-50 border-slate-200 hover:border-slate-200/80 transition-all overflow-hidden">
                <div className={`absolute top-0 left-0 right-0 h-1 ${isConnected ? "bg-gradient-to-r from-emerald-500 to-teal-400" : "bg-slate-100"}`} />
                <div>
                  <CardHeader className="p-6 pb-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className={`p-3 rounded-xl border ${item.colorScheme.bg} ${item.colorScheme.border} flex items-center justify-center`}>
                        {renderProviderIcon(item.iconType)}
                      </div>
                      <Badge variant="outline" className={`px-2 py-1 text-[10px] font-semibold uppercase ${isConnected ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400" : "border-slate-200 bg-slate-100 text-slate-500"}`}>
                        {item.status}
                      </Badge>
                    </div>
                    <div className="mt-4">
                      <CardTitle className="text-lg font-bold text-slate-900 group-hover:text-indigo-300 transition-colors">{item.name}</CardTitle>
                      <span className="text-xs font-medium text-slate-400">{item.provider} &bull; {item.category}</span>
                    </div>
                    <CardDescription className="text-xs text-slate-500 mt-2 line-clamp-3">{item.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="px-6 py-3 border-y border-slate-200 bg-white/30">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center gap-1.5 text-slate-500"><Clock className="h-3.5 w-3.5" /> <strong className="text-slate-700">{item.lastSync}</strong></div>
                      <div className="flex items-center gap-1.5 text-slate-500 justify-end"><Zap className="h-3.5 w-3.5" /> <strong className="text-slate-700">{item.authType}</strong></div>
                    </div>
                  </CardContent>
                </div>
                <CardFooter className="p-6 pt-4">
                  <Button variant={isConnected ? "outline" : "default"} onClick={() => handleOpenConfig(item)} className={`w-full text-xs font-semibold ${isConnected ? "border-slate-200 bg-slate-50 text-slate-800" : "bg-indigo-600 hover:bg-indigo-500 text-slate-900"}`}>
                    {isConnected ? <><Sliders className="h-3.5 w-3.5 mr-2" /> Configure Settings</> : <><Plug className="h-3.5 w-3.5 mr-2" /> Connect Integration</>}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-xl bg-white border-slate-200 text-slate-900">
            {activeIntegration && (
              <>
                <DialogHeader>
                  <DialogTitle className="text-xl text-slate-900">{activeIntegration.name}</DialogTitle>
                  <DialogDescription className="text-slate-500">Manage settings and authentication tokens.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <span className="text-sm">Status</span>
                    <Button variant={activeIntegration.status === "CONNECTED" ? "destructive" : "default"} size="sm" onClick={() => handleToggleConnection(activeIntegration.id, activeIntegration.status === "CONNECTED" ? "DISCONNECTED" : "CONNECTED")} className="text-xs">
                      {activeIntegration.status === "CONNECTED" ? "Disconnect" : "Connect"}
                    </Button>
                  </div>
                  {activeIntegration.configFields.map((field) => (
                    <div key={field.key} className="space-y-1.5">
                      <Label className="text-xs text-slate-700">{field.label}</Label>
                      <Input type={field.type === "password" && !showSecrets[field.key] ? "password" : "text"} value={formValues[field.key] || ""} onChange={(e) => setFormValues({ ...formValues, [field.key]: e.target.value })} className="bg-slate-50 border-slate-200 text-slate-800 text-xs" />
                    </div>
                  ))}
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="bg-slate-50 border-slate-200 text-slate-700">Cancel</Button>
                  <Button onClick={handleSaveConfig} className="bg-indigo-600 hover:bg-indigo-500 text-slate-900">Save Configuration</Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>

      </div>
    </div>
  );
}


