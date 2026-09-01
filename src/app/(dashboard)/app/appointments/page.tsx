"use client";

import React, { useState } from "react";
import { 
  Calendar as CalendarIcon, Clock, Users, Plus, CheckCircle2, 
  Bot, Phone, Video, MessageSquare, AlertCircle, 
  ChevronRight, ArrowRight, Shield, RefreshCw, Send, Trash2, Edit3
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface AppointmentItem {
  id: string;
  clientName: string;
  clientPhone: string;
  assetTitle: string;
  category: "VEHICULO" | "MOTO" | "INMUEBLE" | "SOFTWARE";
  date: string;
  timeSlot: string;
  advisor: string;
  type: "TEST_DRIVE" | "VISITA_INMUEBLE" | "REUNION_COMERCIAL";
  status: "CONFIRMADA" | "EN_CURSO" | "COMPLETADA";
}

const INITIAL_APPOINTMENTS: AppointmentItem[] = [
  {
    id: "app-1",
    clientName: "Carlos Mendoza",
    clientPhone: "+57 318 4509988",
    assetTitle: "Toyota Fortuner GR-S 2024",
    category: "VEHICULO",
    date: "Hoy",
    timeSlot: "03:00 PM",
    advisor: "Asesor Comercial Trinova",
    type: "TEST_DRIVE",
    status: "CONFIRMADA"
  },
  {
    id: "app-2",
    clientName: "Carolina Gómez",
    clientPhone: "+57 301 2293400",
    assetTitle: "Penthouse Dúplex Alto Prado",
    category: "INMUEBLE",
    date: "Mañana",
    timeSlot: "10:30 AM",
    advisor: "Gerencia Inmobiliaria",
    type: "VISITA_INMUEBLE",
    status: "CONFIRMADA"
  },
  {
    id: "app-3",
    clientName: "David Silva",
    clientPhone: "+57 320 8941122",
    assetTitle: "Yamaha MT-09 SP 890cc",
    category: "MOTO",
    date: "03/09/2026",
    timeSlot: "04:00 PM",
    advisor: "Asesor Comercial Trinova",
    type: "TEST_DRIVE",
    status: "CONFIRMADA"
  }
];

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<AppointmentItem[]>(INITIAL_APPOINTMENTS);
  const [isNewOpen, setIsNewOpen] = useState(false);
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [assetTitle, setAssetTitle] = useState("");
  const [category, setCategory] = useState<AppointmentItem["category"]>("VEHICULO");
  const [date, setDate] = useState("Hoy");
  const [timeSlot, setTimeSlot] = useState("03:00 PM");

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !clientPhone) {
      toast.error("Ingrese al menos el nombre y teléfono");
      return;
    }

    const created: AppointmentItem = {
      id: `app-${Date.now().toString(36)}`,
      clientName,
      clientPhone,
      assetTitle: assetTitle || "Interés General",
      category,
      date,
      timeSlot,
      advisor: "Asesor Asignado",
      type: "TEST_DRIVE",
      status: "CONFIRMADA"
    };

    setAppointments([created, ...appointments]);
    setIsNewOpen(false);
    setClientName("");
    setClientPhone("");
    setAssetTitle("");
    toast.success("Cita agendada y confirmada con el cliente");
  };

  const toggleStatus = (id: string) => {
    setAppointments(prev => prev.map(a => {
      if (a.id === id) {
        const next = a.status === "CONFIRMADA" ? "COMPLETADA" : "CONFIRMADA";
        return { ...a, status: next };
      }
      return a;
    }));
    toast.success("Estado de cita actualizado");
  };

  return (
    <div className="space-y-4">
      {/* ─── Compact Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-zinc-200/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-zinc-900 tracking-tight">Agenda & Citas Comerciales</h1>
            <Badge variant="outline" className="text-xs bg-zinc-100 text-zinc-700 font-semibold rounded-md border-zinc-200">
              {appointments.length} Citas Programadas
            </Badge>
          </div>
          <p className="text-xs text-zinc-500 mt-0.5">Test drives, visitas a inmuebles y reuniones agendadas por WhatsApp</p>
        </div>

        <Button 
          onClick={() => setIsNewOpen(true)}
          size="sm"
          className="h-8 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold rounded-lg px-3 gap-1.5 shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Agendar Cita</span>
        </Button>
      </div>

      {/* ─── Compact Table View ─── */}
      <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-semibold">
              <tr>
                <th className="py-2.5 px-3">Cliente / Teléfono</th>
                <th className="py-2.5 px-3">Bien de Interés</th>
                <th className="py-2.5 px-3">Tipo de Cita</th>
                <th className="py-2.5 px-3">Fecha & Hora</th>
                <th className="py-2.5 px-3">Asesor</th>
                <th className="py-2.5 px-3">Estado</th>
                <th className="py-2.5 px-3 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {appointments.map(app => (
                <tr key={app.id} className="hover:bg-zinc-50/80 transition-colors">
                  <td className="py-2.5 px-3">
                    <div className="font-semibold text-zinc-900">{app.clientName}</div>
                    <a 
                      href={`https://wa.me/${app.clientPhone.replace(/[^0-9]/g, '')}`} 
                      target="_blank" 
                      rel="noreferrer"
                      className="text-emerald-600 font-mono text-[11px] hover:underline flex items-center gap-1"
                    >
                      <Phone className="h-2.5 w-2.5" />
                      <span>{app.clientPhone}</span>
                    </a>
                  </td>
                  <td className="py-2.5 px-3 text-zinc-800 font-medium">
                    {app.assetTitle}
                  </td>
                  <td className="py-2.5 px-3">
                    <Badge variant="outline" className="text-[10px] font-medium bg-zinc-100 text-zinc-700 border-zinc-200">
                      {app.type.replace(/_/g, ' ')}
                    </Badge>
                  </td>
                  <td className="py-2.5 px-3 font-mono text-[11px] text-zinc-700">
                    <span className="font-bold text-zinc-900">{app.date}</span> · {app.timeSlot}
                  </td>
                  <td className="py-2.5 px-3 text-zinc-600 text-[11px]">
                    {app.advisor}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      app.status === 'COMPLETADA' ? 'bg-zinc-100 text-zinc-600' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}>
                      {app.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <Button 
                      onClick={() => toggleStatus(app.id)}
                      variant="outline" 
                      size="sm" 
                      className="h-7 text-[11px] border-zinc-200 px-2"
                    >
                      {app.status === 'COMPLETADA' ? 'Reabrir' : 'Completar'}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── Modal: Agendar Cita ─── */}
      <Dialog open={isNewOpen} onOpenChange={setIsNewOpen}>
        <DialogContent className="max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-zinc-900">
              Agendar Cita / Prueba de Manejo
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-500">
              Registra una visita para el cliente en vitrina o inmueble.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreate} className="space-y-3 pt-2 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-zinc-700">Nombre del Cliente *</label>
              <Input 
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Ej. Roberto Durán"
                className="h-9 text-xs"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="font-semibold text-zinc-700">Teléfono / WhatsApp *</label>
                <Input 
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  placeholder="+57 300 1234567"
                  className="h-9 text-xs font-mono"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-zinc-700">Categoría</label>
                <select 
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full h-9 rounded-lg border border-zinc-200 px-2 text-xs bg-white text-zinc-800 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                >
                  <option value="VEHICULO">Vehículo</option>
                  <option value="MOTO">Moto</option>
                  <option value="INMUEBLE">Inmueble</option>
                  <option value="SOFTWARE">Software</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-zinc-700">Bien o Vehículo de Interés</label>
              <Input 
                value={assetTitle}
                onChange={(e) => setAssetTitle(e.target.value)}
                placeholder="Ej. Toyota TX-L 2023"
                className="h-9 text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="font-semibold text-zinc-700">Fecha</label>
                <Input 
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  placeholder="Hoy / 02/09/2026"
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-zinc-700">Hora</label>
                <Input 
                  value={timeSlot}
                  onChange={(e) => setTimeSlot(e.target.value)}
                  placeholder="03:00 PM"
                  className="h-9 text-xs font-mono"
                />
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsNewOpen(false)} className="h-8 text-xs">
                Cancelar
              </Button>
              <Button type="submit" size="sm" className="h-8 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold">
                Confirmar Cita
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
