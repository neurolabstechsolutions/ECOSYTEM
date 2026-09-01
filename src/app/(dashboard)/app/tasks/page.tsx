"use client";

import React, { useState, useEffect } from "react";
import { 
  CheckSquare, Plus, Users, Target, Clock, AlertCircle, 
  CheckCircle2, Send, MessageSquare, ArrowRight, UserCheck, Shield,
  Filter, Calendar, Flame, TrendingUp, Bot, Award, ChevronRight, Phone,
  Edit3, Trash2, Check, X, RefreshCw, Mail, Database
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  avatar_url?: string;
}

interface TeamTask {
  id: string;
  title: string;
  description: string;
  assigned_to: string;
  assigned_role: string;
  phone: string;
  priority: "ALTA" | "MEDIA" | "ESTRATÉGICA";
  status: "PENDIENTE" | "EN_PROCESO" | "COMPLETADA";
  due_date: string;
  ai_assisted: boolean;
  ai_recommendation: string;
  partner_response?: string;
}

interface TeamGoal {
  id: string;
  title: string;
  target_metric: string;
  current_progress: number;
  assigned_role: string;
  deadline: string;
}

const DEFAULT_TEAM_MEMBERS: TeamMember[] = [
  {
    id: "mem-1",
    name: "Jafet Cantillo",
    role: "CEO & FUNDADOR",
    email: "neurolabstechsolutions@gmail.com",
    phone: "+57 323 5845145",
    avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jafet",
  },
  {
    id: "mem-2",
    name: "Director Comercial",
    role: "DIRECTOR COMERCIAL",
    email: "ventas@neurolabs.io",
    phone: "+57 300 5765530",
    avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Comercial",
  },
  {
    id: "mem-3",
    name: "Director de Marketing",
    role: "DIRECTOR DE MARKETING",
    email: "marketing@neurolabs.io",
    phone: "+57 310 9876543",
    avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Marketing",
  }
];

const DEFAULT_GOALS: TeamGoal[] = [
  {
    id: "goal-1",
    title: "Cierre Contratos B2B Software & IA",
    target_metric: "$50.000.000 COP/mes",
    current_progress: 68,
    assigned_role: "DIRECTOR COMERCIAL",
    deadline: "31 Ago 2026",
  },
  {
    id: "goal-2",
    title: "Leads Calificados Outbound",
    target_metric: "200 Empresas",
    current_progress: 82,
    assigned_role: "DIRECTOR DE MARKETING",
    deadline: "28 Ago 2026",
  },
  {
    id: "goal-3",
    title: "Expansión y Grandes Cuentas",
    target_metric: "5 Cuentas VIP",
    current_progress: 40,
    assigned_role: "CEO & FUNDADOR",
    deadline: "15 Sep 2026",
  }
];

const DEFAULT_TASKS: TeamTask[] = [
  {
    id: "tsk-101",
    title: "Programar Viaje Cámara de Comercio",
    description: "Inscripción nuevamente y validación de bases de datos B2B.",
    assigned_to: "Jafet Cantillo",
    assigned_role: "CEO & FUNDADOR",
    phone: "+57 323 5845145",
    priority: "ALTA",
    status: "EN_PROCESO",
    due_date: "Hoy",
    ai_assisted: true,
    ai_recommendation: "El Agente IA espera la confirmación de fecha para agendar en calendario.",
    partner_response: "Ya revisé la fecha del viaje, salimos el martes a primera hora.",
  }
];

export default function TeamTasksManagementPage() {
  const supabase = createClient();

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(DEFAULT_TEAM_MEMBERS);
  const [tasks, setTasks] = useState<TeamTask[]>(DEFAULT_TASKS);
  const [goals, setGoals] = useState<TeamGoal[]>(DEFAULT_GOALS);
  const [isLoadingDB, setIsLoadingDB] = useState(false);
  
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDesc, setTaskDesc] = useState("");
  const [taskAssignee, setTaskAssignee] = useState("Director Comercial");
  const [customPhone, setCustomPhone] = useState("+57 300 5765530");
  const [taskPriority, setTaskPriority] = useState<"ALTA" | "MEDIA" | "ESTRATÉGICA">("ALTA");
  const [taskDueDate, setTaskDueDate] = useState("Hoy");

  const handleAssigneeChange = (name: string) => {
    setTaskAssignee(name);
    const found = teamMembers.find(m => m.name === name);
    if (found) {
      setCustomPhone(found.phone);
    }
  };

  const handleCreateTask = async () => {
    if (!taskTitle.trim() || !customPhone.trim()) {
      toast.error("Ingrese el título de la tarea y el WhatsApp");
      return;
    }

    const newTask: TeamTask = {
      id: `tsk-${Date.now().toString(36)}`,
      title: taskTitle,
      description: taskDesc,
      assigned_to: taskAssignee,
      assigned_role: "MIEMBRO",
      phone: customPhone,
      priority: taskPriority,
      status: "PENDIENTE",
      due_date: taskDueDate,
      ai_assisted: true,
      ai_recommendation: "Recordatorio agendado por WhatsApp.",
    };

    setTasks([newTask, ...tasks]);
    setIsTaskModalOpen(false);
    setTaskTitle("");
    setTaskDesc("");
    toast.success(`Tarea asignada a ${taskAssignee} y notificada por WhatsApp.`);
  };

  const toggleTaskStatus = (id: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        const nextStatus = t.status === "PENDIENTE" ? "EN_PROCESO" : t.status === "EN_PROCESO" ? "COMPLETADA" : "PENDIENTE";
        return { ...t, status: nextStatus };
      }
      return t;
    }));
    toast.success("Estado de la tarea actualizado.");
  };

  return (
    <div className="space-y-4">
      {/* ─── Compact Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-zinc-200/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-zinc-900 tracking-tight">Tareas & Metas del Equipo</h1>
            <Badge variant="outline" className="text-xs bg-zinc-100 text-zinc-700 font-semibold rounded-md border-zinc-200">
              {tasks.length} Tareas Activas
            </Badge>
          </div>
          <p className="text-xs text-zinc-500 mt-0.5">Asignación, supervisión y despacho automático vía WhatsApp</p>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            onClick={() => setIsTaskModalOpen(true)}
            size="sm"
            className="h-8 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold rounded-lg px-3 gap-1.5 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Asignar Tarea</span>
          </Button>
        </div>
      </div>

      {/* ─── Compact Goals Ribbon ─── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
        {goals.map(g => (
          <div key={g.id} className="bg-white border border-zinc-200/90 rounded-xl p-3 shadow-xs space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{g.assigned_role}</span>
              <span className="text-[10px] font-semibold text-zinc-500">{g.deadline}</span>
            </div>
            <div className="font-bold text-xs text-zinc-900 line-clamp-1">{g.title}</div>
            <div className="flex items-center justify-between text-xs font-mono pt-1">
              <span className="font-bold text-zinc-800">{g.target_metric}</span>
              <span className="font-bold text-emerald-600">{g.current_progress}%</span>
            </div>
            <div className="w-full bg-zinc-100 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-emerald-500 h-full rounded-full transition-all" 
                style={{ width: `${g.current_progress}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* ─── Compact Tasks Table ─── */}
      <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-semibold">
              <tr>
                <th className="py-2.5 px-3">Tarea / Objetivo</th>
                <th className="py-2.5 px-3">Asignado a</th>
                <th className="py-2.5 px-3">Prioridad</th>
                <th className="py-2.5 px-3">Vencimiento</th>
                <th className="py-2.5 px-3">Estado</th>
                <th className="py-2.5 px-3 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {tasks.map(task => (
                <tr key={task.id} className="hover:bg-zinc-50/80 transition-colors">
                  <td className="py-2.5 px-3">
                    <div className="font-semibold text-zinc-900">{task.title}</div>
                    <div className="text-[11px] text-zinc-500 line-clamp-1">{task.description}</div>
                    {task.partner_response && (
                      <div className="text-[10px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded mt-1 inline-block">
                        WhatsApp: "{task.partner_response}"
                      </div>
                    )}
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="font-medium text-zinc-800">{task.assigned_to}</div>
                    <a 
                      href={`https://wa.me/${task.phone.replace(/[^0-9]/g, '')}`} 
                      target="_blank" 
                      rel="noreferrer"
                      className="text-[11px] text-emerald-600 font-mono hover:underline flex items-center gap-1"
                    >
                      <Phone className="h-2.5 w-2.5" />
                      <span>{task.phone}</span>
                    </a>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      task.priority === 'ESTRATÉGICA' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                      task.priority === 'ALTA' ? 'bg-red-50 text-red-700 border border-red-200' :
                      'bg-zinc-100 text-zinc-700'
                    }`}>
                      {task.priority}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-zinc-500 font-medium text-[11px]">
                    {task.due_date}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      task.status === 'COMPLETADA' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                      task.status === 'EN_PROCESO' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                      'bg-zinc-100 text-zinc-600'
                    }`}>
                      {task.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <Button 
                      onClick={() => toggleTaskStatus(task.id)}
                      variant="outline" 
                      size="sm" 
                      className="h-7 text-[11px] border-zinc-200 px-2"
                    >
                      {task.status === 'COMPLETADA' ? 'Reabrir' : task.status === 'EN_PROCESO' ? 'Completar' : 'Iniciar'}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── Modal: Asignar Tarea ─── */}
      <Dialog open={isTaskModalOpen} onOpenChange={setIsTaskModalOpen}>
        <DialogContent className="max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-zinc-900">
              Asignar Tarea al Equipo Directivo
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-500">
              Se notificará al socio en tiempo real por WhatsApp.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 pt-2 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-zinc-700">Título de la Tarea *</label>
              <Input 
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                placeholder="Ej. Revisar inventario consignado"
                className="h-9 text-xs"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-zinc-700">Descripción / Instrucciones</label>
              <Textarea 
                value={taskDesc}
                onChange={(e) => setTaskDesc(e.target.value)}
                placeholder="Detalla los puntos a ejecutar..."
                className="text-xs min-h-[70px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="font-semibold text-zinc-700">Asignar a</label>
                <select 
                  value={taskAssignee}
                  onChange={(e) => handleAssigneeChange(e.target.value)}
                  className="w-full h-9 rounded-lg border border-zinc-200 px-2 text-xs bg-white text-zinc-800 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                >
                  {teamMembers.map(m => (
                    <option key={m.id} value={m.name}>{m.name} ({m.role})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-zinc-700">Prioridad</label>
                <select 
                  value={taskPriority}
                  onChange={(e) => setTaskPriority(e.target.value as any)}
                  className="w-full h-9 rounded-lg border border-zinc-200 px-2 text-xs bg-white text-zinc-800 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                >
                  <option value="ALTA">Alta</option>
                  <option value="ESTRATÉGICA">Estratégica</option>
                  <option value="MEDIA">Media</option>
                </select>
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsTaskModalOpen(false)} className="h-8 text-xs">
                Cancelar
              </Button>
              <Button onClick={handleCreateTask} size="sm" className="h-8 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold">
                Despachar por WhatsApp
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
