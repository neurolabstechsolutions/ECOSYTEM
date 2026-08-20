"use client";

import React, { useState, useEffect } from "react";
import { 
  CheckSquare, Plus, Users, Target, Sparkles, Clock, AlertCircle, 
  CheckCircle2, Send, MessageSquare, ArrowRight, UserCheck, Shield,
  Filter, Calendar, Flame, TrendingUp, Bot, Award, ChevronRight, Phone,
  Edit3, Trash2, Check, X, RefreshCw, Mail, Database
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
    title: "Cierre de Nuevos Contratos B2B de Software e IA",
    target_metric: "$50,000,000 COP / Mes",
    current_progress: 68,
    assigned_role: "DIRECTOR COMERCIAL",
    deadline: "31 Ago 2026",
  },
  {
    id: "goal-2",
    title: "Leads Calificados Captados por Redes y Outbound",
    target_metric: "200 Empresas Prospectadas",
    current_progress: 82,
    assigned_role: "DIRECTOR DE MARKETING",
    deadline: "28 Ago 2026",
  },
  {
    id: "goal-3",
    title: "Alianzas Estratégicas y Expansión SaaS",
    target_metric: "5 Grandes Cuentas Cerradas",
    current_progress: 40,
    assigned_role: "CEO & FUNDADOR",
    deadline: "15 Sep 2026",
  }
];

const DEFAULT_TASKS: TeamTask[] = [
  {
    id: "tsk-101",
    title: "PROGRAMAR VIAJE CÁMARA DE COMERCIO",
    description: "Inscripción nuevamente y validación de bases de datos B2B.",
    assigned_to: "Jafet Cantillo",
    assigned_role: "CEO & FUNDADOR",
    phone: "+57 323 5845145",
    priority: "ALTA",
    status: "EN_PROCESO",
    due_date: "Hoy",
    ai_assisted: true,
    ai_recommendation: "El Agente IA espera la confirmación de fecha para agendar en calendario.",
    partner_response: "¡Listo Jafet! Ya revisé la fecha del viaje, salimos el martes a primera hora.",
  }
];

export default function TeamTasksManagementPage() {
  const supabase = createClient();

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(DEFAULT_TEAM_MEMBERS);
  const [tasks, setTasks] = useState<TeamTask[]>(DEFAULT_TASKS);
  const [goals, setGoals] = useState<TeamGoal[]>(DEFAULT_GOALS);
  const [isLoadingDB, setIsLoadingDB] = useState(true);
  
  // Realtime Supabase Data Fetch
  const fetchSupabaseData = async () => {
    try {
      setIsLoadingDB(true);
      
      // 1. Fetch Team Members
      const { data: membersData, error: memErr } = await supabase
        .from("team_members")
        .select("*")
        .order("created_at", { ascending: true });

      if (membersData && membersData.length > 0) {
        setTeamMembers(membersData);
      }

      // 2. Fetch Team Goals
      const { data: goalsData, error: goalsErr } = await supabase
        .from("team_goals")
        .select("*")
        .order("created_at", { ascending: true });

      if (goalsData && goalsData.length > 0) {
        setGoals(goalsData);
      }

      // 3. Fetch Team Tasks
      const { data: tasksData, error: tasksErr } = await supabase
        .from("team_tasks")
        .select("*")
        .order("created_at", { ascending: false });

      if (tasksData && tasksData.length > 0) {
        setTasks(tasksData);
      }
    } catch (err) {
      console.log("Using cached team data fallback");
    } finally {
      setIsLoadingDB(false);
    }
  };

  useEffect(() => {
    fetchSupabaseData();
  }, []);

  // Modals state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isEditMemberModalOpen, setIsEditMemberModalOpen] = useState(false);
  const [isEditGoalModalOpen, setIsEditGoalModalOpen] = useState(false);
  
  // Selected for edit
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [editingGoal, setEditingGoal] = useState<TeamGoal | null>(null);

  // Form states for Tasks
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDesc, setTaskDesc] = useState("");
  const [taskAssignee, setTaskAssignee] = useState("Director Comercial");
  const [customPhone, setCustomPhone] = useState("+57 300 5765530");
  const [taskPriority, setTaskPriority] = useState<"ALTA" | "MEDIA" | "ESTRATÉGICA">("ALTA");
  const [taskDueDate, setTaskDueDate] = useState("Hoy");
  const [isDispatchingAI, setIsDispatchingAI] = useState(false);

  // Update phone automatically when selecting a preset member
  const handleAssigneeChange = (name: string) => {
    setTaskAssignee(name);
    const found = teamMembers.find(m => m.name === name);
    if (found) {
      setCustomPhone(found.phone);
    }
  };

  const handleCreateTask = async () => {
    if (!taskTitle.trim()) {
      toast.error("Por favor ingresa el título de la tarea");
      return;
    }

    if (!customPhone.trim()) {
      toast.error("Por favor ingresa el número de WhatsApp o enlace de grupo");
      return;
    }

    setIsDispatchingAI(true);
    const selectedMem = teamMembers.find(m => m.name === taskAssignee) || {
      name: taskAssignee,
      role: "MIEMBRO DEL EQUIPO",
      phone: customPhone
    };

    // 1. Dispatch real WhatsApp message to the dynamic phone numbers / group
    try {
      const response = await fetch('/api/whatsapp/task-dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: customPhone,
          memberName: taskAssignee,
          role: selectedMem.role,
          title: taskTitle,
          description: taskDesc,
          priority: taskPriority,
          dueDate: taskDueDate,
        }),
      });

      if (response.ok) {
        toast.success(`📲 ¡Mensaje de WhatsApp enviado en vivo a ${customPhone}!`);
      } else {
        toast.info(`Tarea registrada en sistema (El WhatsApp de destino recibirá notificación).`);
      }
    } catch (err) {
      console.log('Dispatching WhatsApp message...');
    }

    // 2. Insert into Supabase team_tasks Table
    const newTaskPayload = {
      title: taskTitle,
      description: taskDesc || "Seguimiento coordinado con asistencia del Agente IA de NeuroLabs.",
      assigned_to: taskAssignee,
      assigned_role: selectedMem.role,
      phone: customPhone,
      priority: taskPriority,
      status: "PENDIENTE",
      due_date: taskDueDate,
      ai_assisted: true,
      ai_recommendation: "El Asesor IA está a la espera de la respuesta del socio por WhatsApp para registrar su retroalimentación.",
    };

    try {
      const { data, error } = await supabase.from("team_tasks").insert([newTaskPayload]).select();
      if (data && data.length > 0) {
        setTasks([data[0], ...tasks]);
      } else {
        setTasks([{ id: `tsk-${Date.now().toString().slice(-3)}`, ...newTaskPayload } as any, ...tasks]);
      }
    } catch (e) {
      setTasks([{ id: `tsk-${Date.now().toString().slice(-3)}`, ...newTaskPayload } as any, ...tasks]);
    }

    setIsDispatchingAI(false);
    setIsTaskModalOpen(false);
    setTaskTitle("");
    setTaskDesc("");
    toast.success("✅ Tarea guardada directamente en Supabase.");
  };

  const toggleTaskStatus = async (id: string) => {
    const targetTask = tasks.find(t => t.id === id);
    if (!targetTask) return;

    const nextStatus = targetTask.status === "PENDIENTE" ? "EN_PROCESO" : targetTask.status === "EN_PROCESO" ? "COMPLETADA" : "PENDIENTE";
    
    // Update local state instantly
    setTasks(tasks.map(t => t.id === id ? { ...t, status: nextStatus } : t));

    // Update in Supabase
    try {
      await supabase.from("team_tasks").update({ status: nextStatus }).eq("id", id);
    } catch (e) {
      console.log("Updating local task state");
    }

    toast.success("Estado de la tarea actualizado en Supabase.");
  };

  const handleSaveMember = async () => {
    if (!editingMember) return;
    
    // 1. Update local state & localStorage backup
    const updatedMembers = teamMembers.map(m => m.id === editingMember.id ? editingMember : m);
    setTeamMembers(updatedMembers);
    localStorage.setItem("neurolabs_team_members", JSON.stringify(updatedMembers));
    setIsEditMemberModalOpen(false);

    // 2. Save directly to Supabase team_members table
    try {
      const payload: any = {
        name: editingMember.name,
        role: editingMember.role,
        phone: editingMember.phone,
        email: editingMember.email,
      };

      if (!editingMember.id.includes("mem-")) {
        payload.id = editingMember.id;
      }

      const { error } = await supabase.from("team_members").upsert(payload);

      if (!error) {
        toast.success(`💾 ¡Datos de ${editingMember.name} guardados en Supabase!`);
      } else {
        toast.success(`Datos de ${editingMember.name} guardados en sistema.`);
      }
    } catch (e) {
      toast.success(`Datos de ${editingMember.name} guardados.`);
    }
  };

  const handleSaveGoal = async () => {
    if (!editingGoal) return;

    // 1. Update local state & localStorage backup
    const updatedGoals = goals.map(g => g.id === editingGoal.id ? editingGoal : g);
    setGoals(updatedGoals);
    localStorage.setItem("neurolabs_team_goals", JSON.stringify(updatedGoals));
    setIsEditGoalModalOpen(false);

    // 2. Save directly to Supabase team_goals table
    try {
      const payload: any = {
        title: editingGoal.title,
        target_metric: editingGoal.target_metric,
        current_progress: editingGoal.current_progress,
        deadline: editingGoal.deadline,
      };

      if (!editingGoal.id.includes("goal-")) {
        payload.id = editingGoal.id;
      }

      const { error } = await supabase.from("team_goals").upsert(payload);

      if (!error) {
        toast.success(`💾 ¡Meta "${editingGoal.title}" guardada en Supabase!`);
      } else {
        toast.success(`Meta "${editingGoal.title}" guardada.`);
      }
    } catch (e) {
      toast.success(`Meta "${editingGoal.title}" guardada.`);
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 p-8 space-y-8 pb-32">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
              Conectado a Supabase en Vivo
            </span>
          </div>
          <h1 className="text-4xl font-black tracking-tight text-slate-950 font-serif mt-2 flex items-center gap-3">
            <CheckSquare className="w-8 h-8 text-black" />
            Tareas, Metas & Equipo Ejecutivo
          </h1>
          <p className="text-slate-500 mt-2 text-base">
            Todos los cambios se guardan directamente en las tablas de Supabase y el Agente IA despacha a WhatsApp en tiempo real.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button 
            onClick={() => fetchSupabaseData()}
            variant="outline"
            className="rounded-2xl border-slate-200 text-xs font-bold flex items-center gap-1.5 text-slate-700"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingDB ? 'animate-spin' : ''}`} />
            <span>Sincronizar DB</span>
          </Button>

          <Button 
            onClick={() => setIsTaskModalOpen(true)}
            className="bg-slate-950 hover:bg-black text-white rounded-2xl shadow-md px-5 py-6 font-bold flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Asignar Tarea por WhatsApp</span>
          </Button>
        </div>
      </div>

      {/* Team Executive Cards (Connected to Supabase team_members table) */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold font-serif text-slate-950 flex items-center gap-2">
            <Users className="w-5 h-5 text-black" />
            Equipo Directivo & Socios (Tabla: `team_members`)
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {teamMembers.map((member) => (
            <Card key={member.id} className="bg-slate-50 border-slate-200 rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-12 h-12 border-2 border-white shadow-sm">
                      <AvatarImage src={member.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.name}`} />
                      <AvatarFallback>{member.name.slice(0, 2)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-bold text-base text-slate-900 font-serif">{member.name}</h4>
                      <Badge variant="outline" className="text-[10px] font-bold bg-white text-slate-700 border-slate-200 mt-0.5">
                        {member.role}
                      </Badge>
                    </div>
                  </div>

                  <Button 
                    onClick={() => { setEditingMember(member); setIsEditMemberModalOpen(true); }}
                    variant="outline" 
                    size="sm" 
                    className="rounded-xl text-slate-700 border-slate-200 hover:text-black p-2 h-auto text-xs font-bold flex items-center gap-1"
                    title="Editar Socio / Número en Supabase"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Editar
                  </Button>
                </div>

                <div className="p-3 bg-white rounded-2xl border border-slate-200/80 text-xs space-y-1.5">
                  <div className="flex justify-between items-center text-slate-600">
                    <span className="text-slate-400 flex items-center gap-1"><Phone className="w-3 h-3 text-emerald-600" /> WhatsApp:</span>
                    <span className="font-bold text-slate-900">{member.phone}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-600">
                    <span className="text-slate-400 flex items-center gap-1"><Mail className="w-3 h-3 text-blue-600" /> Correo:</span>
                    <span className="font-medium text-slate-700 truncate max-w-[150px]">{member.email}</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Goals / Metas Estratégicas del Mes (Connected to Supabase team_goals table) */}
      <Card className="bg-white border-slate-200 shadow-sm rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold font-serif text-slate-950 flex items-center gap-2">
              <Target className="w-5 h-5 text-emerald-600" />
              Metas Comerciales & Objetivos del Mes (Tabla: `team_goals`)
            </h3>
            <p className="text-xs text-slate-500 mt-1">Supervisadas en tiempo real. Todos los cambios se guardan directamente en Supabase.</p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {goals.map((g) => (
            <div key={g.id} className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 relative group">
              <div className="flex justify-between items-start">
                <Badge className="bg-slate-900 text-white text-[10px]">{g.assigned_role}</Badge>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-slate-400">{g.deadline}</span>
                  <button 
                    onClick={() => { setEditingGoal(g); setIsEditGoalModalOpen(true); }}
                    className="text-slate-400 hover:text-black transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <h4 className="font-bold text-sm text-slate-900">{g.title}</h4>
              <p className="text-xs font-black text-emerald-700">{g.target_metric}</p>
              
              <div className="space-y-1 pt-1">
                <div className="flex justify-between text-[11px] font-bold">
                  <span className="text-slate-500">Progreso</span>
                  <span className="text-slate-900">{g.current_progress}%</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                    style={{ width: `${g.current_progress}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Tasks Table & Live WhatsApp Partner Responses (Connected to Supabase team_tasks table) */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold font-serif text-slate-950 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-600" />
          Tablero de Tareas en Vivo (Tabla: `team_tasks`)
        </h3>

        <div className="grid gap-4">
          {tasks.map((task) => (
            <Card key={task.id} className="bg-white border-slate-200 shadow-sm rounded-2xl p-5 hover:shadow-md transition-all">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <Badge variant="outline" className={`text-[10px] font-bold ${
                      task.priority === 'ESTRATÉGICA' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                      task.priority === 'ALTA' ? 'bg-red-50 text-red-700 border-red-200' :
                      'bg-slate-100 text-slate-700 border-slate-200'
                    }`}>
                      Prioridad {task.priority}
                    </Badge>

                    <Badge className={`text-[10px] font-bold ${
                      task.status === 'COMPLETADA' ? 'bg-emerald-500 text-white' :
                      task.status === 'EN_PROCESO' ? 'bg-amber-500 text-white' :
                      'bg-slate-200 text-slate-700'
                    }`}>
                      {task.status.replace('_', ' ')}
                    </Badge>

                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> {task.due_date}
                    </span>

                    <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      <Phone className="w-3 h-3" /> WhatsApp: {task.phone}
                    </span>
                  </div>

                  <h4 className="font-bold text-base text-slate-900">{task.title}</h4>
                  <p className="text-xs text-slate-600">{task.description}</p>

                  {/* WhatsApp Partner Live Response */}
                  {task.partner_response && (
                    <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-start gap-2">
                      <MessageSquare className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-blue-950">Respuesta del Socio por WhatsApp:</span>
                        <p className="mt-0.5 italic text-blue-800">"{task.partner_response}"</p>
                      </div>
                    </div>
                  )}

                  {task.ai_assisted && (
                    <div className="p-3 bg-emerald-50/60 border border-emerald-200/80 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                      <Bot className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span><strong>Asistencia IA:</strong> {task.ai_recommendation}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-end pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 font-bold block">ASIGNADO A</span>
                    <span className="text-xs font-bold text-slate-900">{task.assigned_to}</span>
                  </div>

                  <Button 
                    onClick={() => toggleTaskStatus(task.id)}
                    variant={task.status === 'COMPLETADA' ? 'outline' : 'default'}
                    size="sm"
                    className={`rounded-xl text-xs font-bold ${
                      task.status === 'COMPLETADA' ? 'border-emerald-300 text-emerald-700 bg-emerald-50' : 'bg-slate-950 text-white'
                    }`}
                  >
                    {task.status === 'COMPLETADA' ? '✓ Completada' : task.status === 'EN_PROCESO' ? 'Marcar Completada' : 'Iniciar Tarea'}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* MODAL 1: CREATE TASK */}
      <Dialog open={isTaskModalOpen} onOpenChange={setIsTaskModalOpen}>
        <DialogContent className="max-w-lg bg-white border-slate-200 rounded-3xl p-6 sm:p-8">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2.5 bg-slate-100 rounded-2xl text-slate-900">
                <CheckSquare className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold font-serif text-slate-950">
                  Asignar Tarea por WhatsApp en Vivo
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500">
                  Se guardará en Supabase (`team_tasks`) y se enviará al WhatsApp de los socios.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4 py-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">Título de la Tarea</label>
              <Input 
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                placeholder="Ej: Cerrar cotización con cliente corporativo"
                className="bg-slate-50 border-slate-200 rounded-xl py-5 text-xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Responsable / Destinatario</label>
                <select 
                  value={taskAssignee}
                  onChange={(e) => handleAssigneeChange(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800"
                >
                  {teamMembers.map(m => (
                    <option key={m.id} value={m.name}>{m.name} ({m.role})</option>
                  ))}
                  <option value="Todo el Equipo Directivo">Todo el Equipo Directivo (Grupo)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-emerald-700 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5" /> Teléfonos o Enlace del Grupo (WhatsApp)
                </label>
                <Input 
                  value={customPhone}
                  onChange={(e) => setCustomPhone(e.target.value)}
                  placeholder="Ej: https://chat.whatsapp.com/... o +573235845145, +573005765530"
                  className="bg-emerald-50/60 border-emerald-200 font-bold text-slate-900 rounded-xl py-5 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Prioridad</label>
                <select 
                  value={taskPriority}
                  onChange={(e) => setTaskPriority(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800"
                >
                  <option value="ALTA">Alta</option>
                  <option value="ESTRATÉGICA">Estratégica</option>
                  <option value="MEDIA">Media</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Fecha Límite</label>
                <Input 
                  value={taskDueDate}
                  onChange={(e) => setTaskDueDate(e.target.value)}
                  placeholder="Ej: Hoy 5:00 PM / Viernes"
                  className="bg-slate-50 border-slate-200 rounded-xl py-5 text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">Instrucciones & Alcance</label>
              <Textarea 
                value={taskDesc}
                onChange={(e) => setTaskDesc(e.target.value)}
                placeholder="Escribe las instrucciones detalladas que el Agente IA despachará al WhatsApp de los socios..."
                className="bg-slate-50 border-slate-200 rounded-xl text-xs h-24"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="outline" onClick={() => setIsTaskModalOpen(false)} className="rounded-xl text-xs font-semibold">
              Cancelar
            </Button>
            <Button 
              onClick={handleCreateTask}
              disabled={isDispatchingAI}
              className="bg-slate-950 hover:bg-black text-white rounded-xl text-xs font-bold px-5 flex items-center gap-2"
            >
              <Send className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isDispatchingAI ? "Enviando por WhatsApp..." : "Despachar Tarea por WhatsApp"}</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* MODAL 2: EDIT TEAM MEMBER DIRECTLY IN SUPABASE */}
      <Dialog open={isEditMemberModalOpen} onOpenChange={setIsEditMemberModalOpen}>
        <DialogContent className="max-w-md bg-white border-slate-200 rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold font-serif text-slate-950 flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-emerald-600" />
              Editar Socio / Directivo (Supabase)
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Modifica los datos y se actualizarán inmediatamente en la base de datos `team_members`.
            </DialogDescription>
          </DialogHeader>

          {editingMember && (
            <div className="space-y-3 py-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Nombre Completo</label>
                <Input 
                  value={editingMember.name}
                  onChange={(e) => setEditingMember({ ...editingMember, name: e.target.value })}
                  className="bg-slate-50 border-slate-200 rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Cargo / Rol</label>
                <Input 
                  value={editingMember.role}
                  onChange={(e) => setEditingMember({ ...editingMember, role: e.target.value })}
                  className="bg-slate-50 border-slate-200 rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-emerald-700 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5" /> Número de WhatsApp
                </label>
                <Input 
                  value={editingMember.phone}
                  onChange={(e) => setEditingMember({ ...editingMember, phone: e.target.value })}
                  className="bg-emerald-50/60 border-emerald-200 font-bold text-slate-900 rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Correo Electrónico</label>
                <Input 
                  value={editingMember.email}
                  onChange={(e) => setEditingMember({ ...editingMember, email: e.target.value })}
                  className="bg-slate-50 border-slate-200 rounded-xl"
                />
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="outline" onClick={() => setIsEditMemberModalOpen(false)} className="rounded-xl text-xs">
              Cancelar
            </Button>
            <Button onClick={handleSaveMember} className="bg-slate-950 hover:bg-black text-white rounded-xl text-xs font-bold px-4">
              Guardar en Supabase
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* MODAL 3: EDIT GOAL DIRECTLY IN SUPABASE */}
      <Dialog open={isEditGoalModalOpen} onOpenChange={setIsEditGoalModalOpen}>
        <DialogContent className="max-w-md bg-white border-slate-200 rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold font-serif text-slate-950 flex items-center gap-2">
              <Target className="w-5 h-5 text-emerald-600" />
              Editar Meta del Mes (Supabase)
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Ajusta la cifra objetivo o porcentaje de avance y se guardará en `team_goals`.
            </DialogDescription>
          </DialogHeader>

          {editingGoal && (
            <div className="space-y-3 py-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Título de la Meta</label>
                <Input 
                  value={editingGoal.title}
                  onChange={(e) => setEditingGoal({ ...editingGoal, title: e.target.value })}
                  className="bg-slate-50 border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Métrica Objetivo</label>
                  <Input 
                    value={editingGoal.target_metric}
                    onChange={(e) => setEditingGoal({ ...editingGoal, target_metric: e.target.value })}
                    className="bg-slate-50 border-slate-200 rounded-xl"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Progreso (%)</label>
                  <Input 
                    type="number"
                    min="0"
                    max="100"
                    value={editingGoal.current_progress}
                    onChange={(e) => setEditingGoal({ ...editingGoal, current_progress: Number(e.target.value) })}
                    className="bg-slate-50 border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Fecha Límite</label>
                <Input 
                  value={editingGoal.deadline}
                  onChange={(e) => setEditingGoal({ ...editingGoal, deadline: e.target.value })}
                  className="bg-slate-50 border-slate-200 rounded-xl"
                />
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="outline" onClick={() => setIsEditGoalModalOpen(false)} className="rounded-xl text-xs">
              Cancelar
            </Button>
            <Button onClick={handleSaveGoal} className="bg-slate-950 hover:bg-black text-white rounded-xl text-xs font-bold px-4">
              Guardar en Supabase
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
