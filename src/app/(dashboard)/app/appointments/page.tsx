"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Phone,
  Video,
  Plus,
  MoreVertical
} from "lucide-react";

const MOCK_APPOINTMENTS = [
  {
    id: "apt-1",
    clientName: "Laura Gómez",
    date: new Date(),
    time: "10:00 AM",
    type: "videocall",
    status: "confirmed",
    topic: "Consultoría Inicial",
  },
  {
    id: "apt-2",
    clientName: "Carlos Ruiz",
    date: new Date(),
    time: "02:30 PM",
    type: "phone",
    status: "pending",
    topic: "Soporte Técnico",
  },
  {
    id: "apt-3",
    clientName: "Empresa XYZ (Ana)",
    date: new Date(new Date().setDate(new Date().getDate() + 1)),
    time: "11:00 AM",
    type: "videocall",
    status: "confirmed",
    topic: "Demo del Producto",
  }
];

export default function AppointmentsPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  
  return (
    <div className="min-h-screen bg-white text-slate-800 p-6 space-y-8 pb-32 overflow-x-hidden font-sans">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-black font-serif flex items-center gap-3">
            <CalendarIcon className="h-8 w-8 text-blue-500" />
            Citas y Agendamiento
          </h1>
          <p className="text-sm text-slate-400 mt-2">
            Gestiona tus reuniones, llamadas y demos agendadas por la IA o manualmente.
          </p>
        </div>
        <Button className="bg-black text-white hover:bg-blue-700 text-slate-900 font-medium shadow-lg shadow-blue-900/20">
          <Plus className="w-4 h-4 mr-2" />
          Nueva Cita Manual
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Calendar Side */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="bg-white  border-slate-200 shadow-md">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-blue-400" />
                Calendario
              </CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border border-slate-200/60 bg-slate-50 p-3 shadow-inner"
              />
            </CardContent>
          </Card>
        </div>

        {/* Appointments List Side */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="bg-white  border-slate-200 shadow-md">
            <CardHeader className="border-b border-slate-200/60 pb-4">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-lg font-bold text-slate-900">Próximas Citas</CardTitle>
                  <CardDescription className="text-slate-400">Reuniones programadas para hoy y los próximos días.</CardDescription>
                </div>
                <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20">
                  {MOCK_APPOINTMENTS.length} Pendientes
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-800/40">
                {MOCK_APPOINTMENTS.map((apt) => (
                  <div key={apt.id} className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors">
                    <div className="flex gap-4 items-start">
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-700/50 shadow-inner flex flex-col items-center justify-center min-w-[70px]">
                        <span className="text-xs text-slate-400 font-medium uppercase">{apt.date.toLocaleDateString('es-ES', { month: 'short' })}</span>
                        <span className="text-xl font-bold text-slate-900">{apt.date.getDate()}</span>
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <h4 className="text-base font-bold text-slate-900">{apt.clientName}</h4>
                          <Badge variant="outline" className={
                            apt.status === "confirmed" 
                              ? "border-emerald-500/30 text-emerald-400 bg-emerald-500/10 text-[10px]" 
                              : "border-amber-500/30 text-amber-400 bg-amber-500/10 text-[10px]"
                          }>
                            {apt.status === "confirmed" ? "Confirmada" : "Por Confirmar"}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-400 flex items-center gap-3">
                          <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {apt.time}</span>
                          <span className="flex items-center gap-1.5">
                            {apt.type === "videocall" ? <Video className="w-3.5 h-3.5" /> : <Phone className="w-3.5 h-3.5" />}
                            {apt.type === "videocall" ? "Videollamada" : "Llamada"}
                          </span>
                        </p>
                        <p className="text-xs text-blue-400/80 font-medium pt-1">Asunto: {apt.topic}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <Button variant="outline" size="sm" className="w-full sm:w-auto border-slate-700 hover:bg-white text-slate-300">
                        Reprogramar
                      </Button>
                      <Button size="sm" className="w-full sm:w-auto bg-white hover:bg-black text-white border-transparent transition-colors">
                        Unirse
                      </Button>
                      <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-900">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}


