"use client";

import React, { useState, useEffect } from "react";
import { 
  Calendar as CalendarIcon, Clock, Users, Plus, CheckCircle2, 
  Sparkles, Bot, Phone, Video, MessageSquare, AlertCircle, 
  ChevronRight, ArrowRight, Shield, RefreshCw, Send, Trash2, Edit3
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
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

interface AgendaResponsibility {
  id: string;
  title: string;
  assignedTo: string;
  role: string;
  timeSlot: string;
  date: string;
  type: "REUNIÓN_VENTAS" | "DESARROLLO_SOFTWARE" | "CAMPAÑA_MARKETING" | "CÁMARA_COMERCIO" | "LLAMADA_CIERRE";
  status: "CONFIRMADO_WHATSAPP" | "EN_EJECUCION" | "COMPLETADO" | "ESPERANDO_RESPUESTA";
  whatsappFeedback: string;
  aiSuggestedNextStep: string;
}

const DEFAULT_RESPONSIBILITIES: AgendaResponsibility[] = [
  {
    id: "resp-1",
    title: "Trámite de Registro en Cámara de Comercio",
    assignedTo: "Jesús David Cantillo Parejo",
    role: "CEO & FUNDADOR",
    timeSlot: "10:00 AM - 12:00 PM",
    date: "Mañana",
    type: "CÁMARA_COMERCIO",
    status: "CONFIRMADO_WHATSAPP",
    whatsappFeedback: "Jesús David Cantillo (CEO): 'LISTO MAÑANA A LAS 10 AM'",
    aiSuggestedNextStep: "El Agente IA ya tiene los documentos listos para radicar a las 10:00 AM.",
  },
  {
    id: "resp-2",
    title: "Llamadas de Cierre a 38 Leads Calificados (Outbound)",
    assignedTo: "Richard Nixon Acosta Almarales",
    role: "DIRECTOR COMERCIAL",
    timeSlot: "02:00 PM - 04:30 PM",
    date: "Hoy",
    type: "LLAMADA_CIERRE",
    status: "CONFIRMADO_WHATSAPP",
    whatsappFeedback: "Recibido. Estoy llamando a los primeros 5 clientes de la lista.",
    aiSuggestedNextStep: "Generar cotización técnica en PDF para los que soliciten propuesta formal.",
  },
  {
    id: "resp-3",
    title: "Publicación de Creativos 3D & Pauta en Redes Sociales",
    assignedTo: "Jafet Asaf Navarro",
    role: "DIRECTOR DE MARKETING",
    timeSlot: "10:00 AM - 12:00 PM",
    date: "Mañana",
    type: "CAMPAÑA_MARKETING",
    status: "ESPERANDO_RESPUESTA",
    whatsappFeedback: "Mensaje despachado al grupo. Esperando confirmación de hora de pauta.",
    aiSuggestedNextStep: "Verificar pixel de Meta y enlace de WhatsApp en la biografía.",
  }
];

export default function AppointmentsAndAgendaPage() {
  const supabase = createClient();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [responsibilities, setResponsibilities] = useState<AgendaResponsibility[]>(DEFAULT_RESPONSIBILITIES);
  const [isNewEventModalOpen, setIsNewEventModalOpen] = useState(false);

  // Form states
  const [eventTitle, setEventTitle] = useState("");
  const [eventAssignee, setEventAssignee] = useState("Jafet Cantillo");
  const [eventRole, setEventRole] = useState("CEO & FUNDADOR");
  const [eventTime, setEventTime] = useState("09:00 AM - 10:30 AM");
  const [eventType, setEventType] = useState<any>("REUNIÓN_VENTAS");
  const [eventDate, setEventDate] = useState("Hoy");

  // Load from local storage or DB
  useEffect(() => {
    try {
      const saved = localStorage.getItem("neurolabs_agenda_responsibilities");
      if (saved) setResponsibilities(JSON.parse(saved));
    } catch (e) {}
  }, []);

  const handleCreateResponsibility = () => {
    if (!eventTitle.trim()) {
      toast.error("Por favor ingresa el título de la actividad");
      return;
    }

    const newResp: AgendaResponsibility = {
      id: `resp-${Date.now().toString().slice(-3)}`,
      title: eventTitle,
      assignedTo: eventAssignee,
      role: eventRole,
      timeSlot: eventTime,
      date: eventDate,
      type: eventType,
      status: "ESPERANDO_RESPUESTA",
      whatsappFeedback: "Agendado por el CEO. Notificación despachada al grupo de WhatsApp.",
      aiSuggestedNextStep: "El Agente IA monitoreará la confirmación de asistencia por WhatsApp.",
    };

    const updated = [newResp, ...responsibilities];
    setResponsibilities(updated);
    localStorage.setItem("neurolabs_agenda_responsibilities", JSON.stringify(updated));
    setIsNewEventModalOpen(false);
    setEventTitle("");
    toast.success(`📅 Responsabilidad agendada para ${eventAssignee} y registrada en la Agenda IA.`);
  };

  const handleToggleStatus = (id: string) => {
    const updated = responsibilities.map(r => {
      if (r.id === id) {
        const nextStatus: any = r.status === "ESPERANDO_RESPUESTA" ? "CONFIRMADO_WHATSAPP" : r.status === "CONFIRMADO_WHATSAPP" ? "EN_EJECUCION" : r.status === "EN_EJECUCION" ? "COMPLETADO" : "ESPERANDO_RESPUESTA";
        return { ...r, status: nextStatus };
      }
      return r;
    });
    setResponsibilities(updated);
    localStorage.setItem("neurolabs_agenda_responsibilities", JSON.stringify(updated));
    toast.success("Estado de la agenda actualizado.");
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 p-8 space-y-8 pb-32">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-1.5">
              <Bot className="w-3.5 h-3.5 text-purple-600" />
              Organización Autónoma con Agente IA
            </span>
          </div>
          <h1 className="text-4xl font-black tracking-tight text-slate-950 font-serif mt-2 flex items-center gap-3">
            <CalendarIcon className="w-8 h-8 text-black" />
            Agenda Ejecutiva & Responsabilidades del Equipo
          </h1>
          <p className="text-slate-500 mt-2 text-base">
            Tu Agente IA organiza los compromisos de cada socio a partir de las tareas despachadas y sus respuestas en WhatsApp.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button 
            onClick={() => setIsNewEventModalOpen(true)}
            className="bg-slate-950 hover:bg-black text-white rounded-2xl shadow-md px-5 py-6 font-bold flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Agendar Nueva Responsabilidad</span>
          </Button>
        </div>
      </div>

      {/* Main Grid: Calendar & AI Daily Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Interactive Calendar & Quick Stats */}
        <div className="space-y-6">
          <Card className="bg-white border-slate-200 shadow-sm rounded-3xl p-4">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-base font-bold font-serif text-slate-950 flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-emerald-600" />
                Calendario de Operaciones
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2 flex justify-center">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-2xl border-0"
              />
            </CardContent>
          </Card>

          {/* AI Coordination Card */}
          <Card className="bg-slate-950 text-white rounded-3xl p-6 shadow-md border-0 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-2xl border border-emerald-500/30">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-sm">Coordinador IA de NeuroLabs</h4>
                <p className="text-xs text-slate-400">Sincronización en vivo con WhatsApp</p>
              </div>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              "Cada vez que envías una tarea al grupo o a un socio, estructuro su horario, registro su confirmación por WhatsApp y bloqueo el espacio en la agenda."
            </p>
            <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-[11px] font-bold text-emerald-400">
              <span>● {responsibilities.length} Compromisos Activos</span>
              <span>100% Sincronizado</span>
            </div>
          </Card>
        </div>

        {/* Right Column: Detailed Timeline / Agenda of Responsibilities */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold font-serif text-slate-950 flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-600" />
              Cronograma de Responsabilidades & Respuestas de Socios
            </h3>
          </div>

          <div className="space-y-4">
            {responsibilities.map((item) => (
              <Card key={item.id} className="bg-white border-slate-200 shadow-sm rounded-3xl p-6 hover:shadow-md transition-all">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className="bg-slate-950 text-white text-[10px] font-bold">
                        {item.role}
                      </Badge>

                      <Badge variant="outline" className={`text-[10px] font-bold ${
                        item.status === 'COMPLETADO' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        item.status === 'EN_EJECUCION' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        item.status === 'CONFIRMADO_WHATSAPP' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                        'bg-purple-50 text-purple-700 border-purple-200'
                      }`}>
                        {item.status.replace('_', ' ')}
                      </Badge>

                      <span className="text-xs text-slate-500 font-bold flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" /> {item.timeSlot} • {item.date}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-base font-bold text-slate-950">{item.title}</h4>
                      <p className="text-xs font-semibold text-slate-500 mt-0.5">Responsable: <strong className="text-slate-900">{item.assignedTo}</strong></p>
                    </div>

                    {/* WhatsApp Response from Partner */}
                    <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-2xl text-xs text-blue-900 flex items-start gap-2">
                      <MessageSquare className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-blue-950">Respuesta / Confirmación en WhatsApp:</span>
                        <p className="mt-0.5 italic text-blue-800">"{item.whatsappFeedback}"</p>
                      </div>
                    </div>

                    {/* AI Suggested Action */}
                    <div className="p-3 bg-emerald-50/60 border border-emerald-200/80 rounded-2xl text-xs text-emerald-800 flex items-center gap-2">
                      <Bot className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span><strong>Siguiente paso IA:</strong> {item.aiSuggestedNextStep}</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 w-full md:w-auto">
                    <Button 
                      onClick={() => handleToggleStatus(item.id)}
                      size="sm"
                      className={`rounded-xl text-xs font-bold ${
                        item.status === 'COMPLETADO' ? 'bg-emerald-50 border border-emerald-300 text-emerald-700' :
                        item.status === 'EN_EJECUCION' ? 'bg-amber-500 text-white' : 'bg-slate-950 text-white'
                      }`}
                    >
                      {item.status === 'COMPLETADO' ? '✓ Completado' : item.status === 'EN_EJECUCION' ? 'Marcar Listo' : 'Iniciar Actividad'}
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* CREATE NEW RESPONSIBILITY MODAL */}
      <Dialog open={isNewEventModalOpen} onOpenChange={setIsNewEventModalOpen}>
        <DialogContent className="max-w-md bg-white border-slate-200 rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold font-serif text-slate-950 flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-emerald-600" />
              Agendar Responsabilidad Ejecutiva
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              El Agente IA bloqueará el horario y notificará al responsable por WhatsApp.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-3 text-xs">
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Título de la Actividad / Compromiso</label>
              <Input 
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                placeholder="Ej: Reunión con cliente corporativo"
                className="bg-slate-50 border-slate-200 rounded-xl"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Responsable</label>
                <select 
                  value={eventAssignee}
                  onChange={(e) => {
                    setEventAssignee(e.target.value);
                    if (e.target.value === "Jafet Cantillo") setEventRole("CEO & FUNDADOR");
                    else if (e.target.value === "Director Comercial") setEventRole("DIRECTOR COMERCIAL");
                    else setEventRole("DIRECTOR DE MARKETING");
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800"
                >
                  <option value="Jafet Cantillo">Jafet Cantillo (CEO)</option>
                  <option value="Director Comercial">Director Comercial</option>
                  <option value="Director de Marketing">Director de Marketing</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Tipo de Compromiso</label>
                <select 
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800"
                >
                  <option value="REUNIÓN_VENTAS">Reunión de Ventas</option>
                  <option value="CÁMARA_COMERCIO">Cámara de Comercio</option>
                  <option value="LLAMADA_CIERRE">Llamada de Cierre</option>
                  <option value="DESARROLLO_SOFTWARE">Desarrollo de Software</option>
                  <option value="CAMPAÑA_MARKETING">Campaña de Marketing</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Horario (Franja)</label>
                <Input 
                  value={eventTime}
                  onChange={(e) => setEventTime(e.target.value)}
                  placeholder="Ej: 09:00 AM - 10:30 AM"
                  className="bg-slate-50 border-slate-200 rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Fecha</label>
                <Input 
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  placeholder="Ej: Hoy / Mañana / Viernes"
                  className="bg-slate-50 border-slate-200 rounded-xl"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="outline" onClick={() => setIsNewEventModalOpen(false)} className="rounded-xl text-xs">
              Cancelar
            </Button>
            <Button onClick={handleCreateResponsibility} className="bg-slate-950 hover:bg-black text-white rounded-xl text-xs font-bold px-4">
              Agendar en la Agenda IA
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
