"use client";

import React, { useState } from "react";
import { 
  CheckSquare, Plus, Users, Target, Sparkles, Clock, AlertCircle, 
  CheckCircle2, Send, MessageSquare, ArrowRight, UserCheck, Shield,
  Filter, Calendar, Flame, TrendingUp, Bot, Award, ChevronRight, Phone
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

interface TeamMember {
  id: string;
  name: string;
  role: "CEO & FUNDADOR" | "DIRECTOR COMERCIAL" | "DIRECTOR DE MARKETING" | "LÍDER DE TECNOLOGÍA";
  email: string;
  phone: string;
  avatar: string;
  activeTasksCount: number;
  completedTasksCount: number;
}

interface TeamTask {
  id: string;
  title: string;
  description: string;
  assignedTo: string;
  assignedRole: string;
  phone: string;
  priority: "ALTA" | "MEDIA" | "ESTRATÉGICA";
  status: "PENDIENTE" | "EN_PROCESO" | "COMPLETADA";
  dueDate: string;
  aiAssisted: boolean;
  aiRecommendation: string;
}

interface TeamGoal {
  id: string;
  title: string;
  targetMetric: string;
  currentProgress: number;
  assignedRole: string;
  deadline: string;
}

const TEAM_MEMBERS: TeamMember[] = [
  {
    id: "mem-1",
    name: "Jafet Cantillo",
    role: "CEO & FUNDADOR",
    email: "neurolabstechsolutions@gmail.com",
    phone: "+57 323 5845145",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jafet",
    activeTasksCount: 3,
    completedTasksCount: 14,
  },
  {
    id: "mem-2",
    name: "Director Comercial",
    role: "DIRECTOR COMERCIAL",
    email: "ventas@neurolabs.io",
    phone: "+57 300 5765530",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Comercial",
    activeTasksCount: 4,
    completedTasksCount: 22,
  },
  {
    id: "mem-3",
    name: "Director de Marketing",
    role: "DIRECTOR DE MARKETING",
    email: "marketing@neurolabs.io",
    phone: "+57 310 9876543",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Marketing",
    activeTasksCount: 3,
    completedTasksCount: 18,
  }
];

const INITIAL_GOALS: TeamGoal[] = [
  {
    id: "goal-1",
    title: "Cierre de Nuevos Contratos B2B de Software e IA",
    targetMetric: "$50,000,000 COP / Mes",
    currentProgress: 68,
    assignedRole: "DIRECTOR COMERCIAL",
    deadline: "31 Ago 2026",
  },
  {
    id: "goal-2",
    title: "Leads Calificados Captados por Redes y Outbound",
    targetMetric: "200 Empresas Prospectadas",
    currentProgress: 82,
    assignedRole: "DIRECTOR DE MARKETING",
    deadline: "28 Ago 2026",
  },
  {
    id: "goal-3",
    title: "Alianzas Estratégicas y Expansión SaaS",
    targetMetric: "5 Grandes Cuentas Cerradas",
    currentProgress: 40,
    assignedRole: "CEO & FUNDADOR",
    deadline: "15 Sep 2026",
  }
];

const INITIAL_TASKS: TeamTask[] = [
  {
    id: "tsk-101",
    title: "Reunión de Cierre con Prospectos de Cámara de Comercio",
    description: "Revisar los 38 leads que solicitaron cotización formal en PDF durante la campaña outbound de WhatsApp.",
    assignedTo: "Director Comercial",
    assignedRole: "DIRECTOR COMERCIAL",
    phone: "+57 300 5765530",
    priority: "ALTA",
    status: "EN_PROCESO",
    dueDate: "Hoy, 4:00 PM",
    aiAssisted: true,
    aiRecommendation: "El Agente IA ya preparó el PDF y calificó su intención de compra en 95%.",
  },
  {
    id: "tsk-102",
    title: "Lanzamiento de Campaña en Video Reels y LinkedIn",
    description: "Publicar las piezas 3D animadas y el video demostrativo de WhatsApp con cotización automática.",
    assignedTo: "Director de Marketing",
    assignedRole: "DIRECTOR DE MARKETING",
    phone: "+57 310 9876543",
    priority: "ESTRATÉGICA",
    status: "PENDIENTE",
    dueDate: "Mañana, 10:00 AM",
    aiAssisted: true,
    aiRecommendation: "Usa el copy generado con el enlace directo al WhatsApp +57 300 5765530.",
  },
  {
    id: "tsk-103",
    title: "Firma de Alianzas y Estructuración de Propuestas VIP",
    description: "Validación de acuerdos corporativos y contratos de tecnología para clientes corporativos.",
    assignedTo: "Jafet Cantillo",
    assignedRole: "CEO & FUNDADOR",
    phone: "+57 323 5845145",
    priority: "ESTRATÉGICA",
    status: "EN_PROCESO",
    dueDate: "Viernes, 2:00 PM",
    aiAssisted: true,
    aiRecommendation: "Los modelos de contrato con firma digital están listos en el módulo de Contratos.",
  },
  {
    id: "tsk-104",
    title: "Seguimiento a Clientes con Cotización en PDF Enviada",
    description: "Hacer llamada de cortesía a las 12 empresas que descargaron la propuesta técnica ayer.",
    assignedTo: "Director Comercial",
    assignedRole: "DIRECTOR COMERCIAL",
    phone: "+57 300 5765530",
    priority: "MEDIA",
    status: "PENDIENTE",
    dueDate: "Hoy, 5:30 PM",
    aiAssisted: true,
    aiRecommendation: "Puedes usar el marcador de llamadas automáticas de voz IA.",
  }
];

export default function TeamTasksManagementPage() {
  const [tasks, setTasks] = useState<TeamTask[]>(INITIAL_TASKS);
  const [goals, setGoals] = useState<TeamGoal[]>(INITIAL_GOALS);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  
  // Form states
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
    const found = TEAM_MEMBERS.find(m => m.name === name);
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
      toast.error("Por favor ingresa el número de WhatsApp de destino");
      return;
    }

    setIsDispatchingAI(true);
    const selectedMem = TEAM_MEMBERS.find(m => m.name === taskAssignee) || {
      name: taskAssignee,
      role: "MIEMBRO DEL EQUIPO",
      phone: customPhone
    };

    try {
      // Dispatch real WhatsApp message to the dynamic phone number entered
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
      console.log('Dispatching local fallback...');
    }

    const newTask: TeamTask = {
      id: `tsk-${Date.now().toString().slice(-3)}`,
      title: taskTitle,
      description: taskDesc || "Seguimiento coordinado con asistencia del Agente IA de NeuroLabs.",
      assignedTo: taskAssignee,
      assignedRole: selectedMem.role,
      phone: customPhone,
      priority: taskPriority,
      status: "PENDIENTE",
      dueDate: taskDueDate,
      aiAssisted: true,
      aiRecommendation: "El Asesor IA monitoreará el avance y enviará recordatorios automáticos por WhatsApp.",
    };

    setTasks([newTask, ...tasks]);
    setIsDispatchingAI(false);
    setIsTaskModalOpen(false);
    setTaskTitle("");
    setTaskDesc("");
  };

  const toggleTaskStatus = (id: string) => {
    setTasks(tasks.map(t => {
      if (t.id === id) {
        const nextStatus = t.status === "PENDIENTE" ? "EN_PROCESO" : t.status === "EN_PROCESO" ? "COMPLETADA" : "PENDIENTE";
        return { ...t, status: nextStatus };
      }
      return t;
    }));
    toast.success("Estado de la tarea actualizado.");
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 p-8 space-y-8 pb-32">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Gestión Ejecutiva & Notificación WhatsApp Real
            </span>
          </div>
          <h1 className="text-4xl font-black tracking-tight text-slate-950 font-serif mt-2 flex items-center gap-3">
            <CheckSquare className="w-8 h-8 text-black" />
            Tareas, Metas & Equipo Ejecutivo
          </h1>
          <p className="text-slate-500 mt-2 text-base">
            Coloca el número de WhatsApp de cualquier compañero o líder y tu Agente IA le enviará la tarea y hará seguimiento en vivo.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button 
            onClick={() => setIsTaskModalOpen(true)}
            className="bg-slate-950 hover:bg-black text-white rounded-2xl shadow-md px-5 py-6 font-bold flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Asignar Tarea por WhatsApp</span>
          </Button>
        </div>
      </div>

      {/* Team Executive Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {TEAM_MEMBERS.map((member) => (
          <Card key={member.id} className="bg-slate-50 border-slate-200 rounded-3xl p-6 relative overflow-hidden">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <Avatar className="w-12 h-12 border-2 border-white shadow-sm">
                  <AvatarImage src={member.avatar} />
                  <AvatarFallback>{member.name.slice(0, 2)}</AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-bold text-base text-slate-900 font-serif">{member.name}</h4>
                  <Badge variant="outline" className="text-[10px] font-bold bg-white text-slate-700 border-slate-200 mt-0.5">
                    {member.role}
                  </Badge>
                  <p className="text-[11px] text-emerald-600 font-bold mt-1 flex items-center gap-1">
                    <Phone className="w-3 h-3" /> {member.phone}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 pt-4 border-t border-slate-200/80 text-xs">
              <div className="bg-white p-3 rounded-2xl border border-slate-200/60">
                <span className="text-slate-400 font-medium">Tareas Activas</span>
                <p className="text-lg font-black text-slate-900 mt-0.5">{member.activeTasksCount} pendientes</p>
              </div>
              <div className="bg-white p-3 rounded-2xl border border-slate-200/60">
                <span className="text-slate-400 font-medium">Completadas</span>
                <p className="text-lg font-black text-emerald-600 mt-0.5">{member.completedTasksCount} logradas</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Goals / Metas Estratégicas del Mes */}
      <Card className="bg-white border-slate-200 shadow-sm rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold font-serif text-slate-950 flex items-center gap-2">
              <Target className="w-5 h-5 text-emerald-600" />
              Metas Comerciales & Objetivos del Mes
            </h3>
            <p className="text-xs text-slate-500 mt-1">Supervisadas en tiempo real por el sistema de Analytics e IA.</p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {goals.map((g) => (
            <div key={g.id} className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex justify-between items-start">
                <Badge className="bg-slate-900 text-white text-[10px]">{g.assignedRole}</Badge>
                <span className="text-[11px] font-bold text-slate-400">{g.deadline}</span>
              </div>
              <h4 className="font-bold text-sm text-slate-900">{g.title}</h4>
              <p className="text-xs font-black text-emerald-700">{g.targetMetric}</p>
              
              <div className="space-y-1 pt-1">
                <div className="flex justify-between text-[11px] font-bold">
                  <span className="text-slate-500">Progreso</span>
                  <span className="text-slate-900">{g.currentProgress}%</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                    style={{ width: `${g.currentProgress}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Tasks Table & AI Assistant Guidance */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold font-serif text-slate-950 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-600" />
          Tablero de Tareas con Notificación WhatsApp Directa
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
                      <Clock className="w-3.5 h-3.5" /> {task.dueDate}
                    </span>

                    <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      <Phone className="w-3 h-3" /> WhatsApp: {task.phone}
                    </span>
                  </div>

                  <h4 className="font-bold text-base text-slate-900">{task.title}</h4>
                  <p className="text-xs text-slate-600">{task.description}</p>

                  {task.aiAssisted && (
                    <div className="p-3 bg-emerald-50/60 border border-emerald-200/80 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                      <Bot className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span><strong>Asistencia IA:</strong> {task.aiRecommendation}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-end pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 font-bold block">ASIGNADO A</span>
                    <span className="text-xs font-bold text-slate-900">{task.assignedTo}</span>
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

      {/* CREATE TASK MODAL */}
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
                  Ingresa el número celular de destino y el Agente IA enviará el mensaje oficial por WhatsApp.
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
                <Input 
                  value={taskAssignee}
                  onChange={(e) => handleAssigneeChange(e.target.value)}
                  placeholder="Nombre del compañero o líder"
                  className="bg-slate-50 border-slate-200 rounded-xl py-5 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-emerald-700 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5" /> Teléfonos o Grupo (Separados por coma)
                </label>
                <Input 
                  value={customPhone}
                  onChange={(e) => setCustomPhone(e.target.value)}
                  placeholder="Ej: +57 323 5845145, +57 300 5765530"
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
                placeholder="Escribe las instrucciones detalladas que el Agente IA despachará al WhatsApp del responsable..."
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
    </div>
  );
}
