"use client";

import React, { useState } from "react";
import {
  Workflow, Zap, Play, Pause, Plus, Trash2, Edit3, Settings,
  ArrowRight, CheckCircle2, Clock, Filter, Database, Send,
  MessageSquare, Webhook, Bot, RefreshCw, Search, Activity
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface WorkflowItem {
  id: string;
  name: string;
  trigger: string;
  action: string;
  executionsCount: number;
  successRate: string;
  status: "ACTIVO" | "PAUSADO";
  lastRun: string;
}

const INITIAL_WORKFLOWS: WorkflowItem[] = [
  {
    id: "wf-1",
    name: "Captación WhatsApp -> Lead en Supabase",
    trigger: "Mensaje entrante de WhatsApp",
    action: "Crear contacto, extraer presupuesto COP y notificar",
    executionsCount: 1420,
    successRate: "99.4%",
    status: "ACTIVO",
    lastRun: "Hace 2 minutos"
  },
  {
    id: "wf-2",
    name: "Firma de Contrato -> PDF Notarial SHA-256",
    trigger: "Formulario de corretaje completado",
    action: "Generar sello criptográfico y enviar copia a mandante",
    executionsCount: 89,
    successRate: "100%",
    status: "ACTIVO",
    lastRun: "Hace 15 minutos"
  },
  {
    id: "wf-3",
    name: "Calificación Alta Intención -> Alerta Asesor",
    trigger: "Lead Score > 90%",
    action: "Despachar tarea de llamada en vivo al director comercial",
    executionsCount: 312,
    successRate: "98.1%",
    status: "ACTIVO",
    lastRun: "Hace 1 hora"
  }
];

export default function AutomationsPage() {
  const [workflows, setWorkflows] = useState<WorkflowItem[]>(INITIAL_WORKFLOWS);
  const [searchQuery, setSearchQuery] = useState("");
  const [isNewWorkflowOpen, setIsNewWorkflowOpen] = useState(false);
  const [newWfName, setNewWfName] = useState("");
  const [newTrigger, setNewTrigger] = useState("Mensaje de WhatsApp");
  const [newAction, setNewAction] = useState("Notificar al equipo");

  const toggleWorkflow = (id: string) => {
    setWorkflows(prev => prev.map(w => {
      if (w.id === id) {
        const nextStatus = w.status === "ACTIVO" ? "PAUSADO" : "ACTIVO";
        return { ...w, status: nextStatus };
      }
      return w;
    }));
    toast.success("Estado del flujo de automatización actualizado");
  };

  const handleCreateWorkflow = () => {
    if (!newWfName.trim()) {
      toast.error("Ingrese el nombre del flujo");
      return;
    }

    const created: WorkflowItem = {
      id: `wf-${Date.now().toString(36)}`,
      name: newWfName,
      trigger: newTrigger,
      action: newAction,
      executionsCount: 0,
      successRate: "100%",
      status: "ACTIVO",
      lastRun: "Nunca"
    };

    setWorkflows([created, ...workflows]);
    setIsNewWorkflowOpen(false);
    setNewWfName("");
    toast.success("Flujo de automatización creado");
  };

  const filteredWorkflows = workflows.filter(w => 
    w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.trigger.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* ─── Compact Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-zinc-200/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-zinc-900 tracking-tight">Automatizaciones & Workflows</h1>
            <Badge variant="outline" className="text-xs bg-zinc-100 text-zinc-700 font-semibold rounded-md border-zinc-200">
              {filteredWorkflows.length} Flujos
            </Badge>
          </div>
          <p className="text-xs text-zinc-500 mt-0.5">Integración autónoma entre WhatsApp, Supabase Cloud, Webhooks y el Marketplace</p>
        </div>

        <Button 
          onClick={() => setIsNewWorkflowOpen(true)}
          size="sm"
          className="h-8 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold rounded-lg px-3 gap-1.5 shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Nuevo Flujo</span>
        </Button>
      </div>

      {/* ─── Search ─── */}
      <div className="relative max-w-sm">
        <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-zinc-400" />
        <Input 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar flujo o disparador..."
          className="h-8 pl-8 text-xs border-zinc-200 bg-white rounded-lg focus-visible:ring-zinc-900"
        />
      </div>

      {/* ─── Compact Table View ─── */}
      <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-semibold">
              <tr>
                <th className="py-2.5 px-3">Flujo de Trabajo</th>
                <th className="py-2.5 px-3">Disparador (Trigger)</th>
                <th className="py-2.5 px-3">Acción Ejecutada</th>
                <th className="py-2.5 px-3">Ejecuciones</th>
                <th className="py-2.5 px-3">Tasa Éxito</th>
                <th className="py-2.5 px-3">Estado</th>
                <th className="py-2.5 px-3 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filteredWorkflows.map(w => (
                <tr key={w.id} className="hover:bg-zinc-50/80 transition-colors">
                  <td className="py-2.5 px-3">
                    <div className="font-semibold text-zinc-900">{w.name}</div>
                    <div className="text-[10px] text-zinc-400">Última: {w.lastRun}</div>
                  </td>
                  <td className="py-2.5 px-3 text-zinc-700">
                    <Badge variant="outline" className="text-[10px] bg-zinc-50 text-zinc-700 border-zinc-200 font-normal">
                      {w.trigger}
                    </Badge>
                  </td>
                  <td className="py-2.5 px-3 text-zinc-600 text-[11px]">
                    {w.action}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-[11px] text-zinc-800 font-bold">
                    {w.executionsCount}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="text-[10px] font-bold font-mono px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {w.successRate}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      w.status === 'ACTIVO' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-zinc-100 text-zinc-600'
                    }`}>
                      {w.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <Button 
                      onClick={() => toggleWorkflow(w.id)}
                      variant="outline" 
                      size="sm" 
                      className="h-7 text-[11px] border-zinc-200 px-2"
                    >
                      {w.status === 'ACTIVO' ? 'Pausar' : 'Activar'}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── Modal: Crear Flujo ─── */}
      <Dialog open={isNewWorkflowOpen} onOpenChange={setIsNewWorkflowOpen}>
        <DialogContent className="max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-zinc-900">
              Crear Nuevo Flujo de Automatización
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-500">
              Define las reglas de ejecución entre módulos.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 pt-2 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-zinc-700">Nombre del Flujo *</label>
              <Input 
                value={newWfName}
                onChange={(e) => setNewWfName(e.target.value)}
                placeholder="Ej. Registro de vehículo -> Notificación WhatsApp"
                className="h-9 text-xs"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-zinc-700">Disparador (Trigger)</label>
              <Input 
                value={newTrigger}
                onChange={(e) => setNewTrigger(e.target.value)}
                placeholder="Ej. Formulario completado"
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-zinc-700">Acción</label>
              <Input 
                value={newAction}
                onChange={(e) => setNewAction(e.target.value)}
                placeholder="Ej. Enviar mensaje de confirmación"
                className="h-9 text-xs"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsNewWorkflowOpen(false)} className="h-8 text-xs">
                Cancelar
              </Button>
              <Button onClick={handleCreateWorkflow} size="sm" className="h-8 bg-zinc-900 text-white text-xs font-semibold">
                Guardar Flujo
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
