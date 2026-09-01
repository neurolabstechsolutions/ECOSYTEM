"use client";

import React, { useState } from "react";
import { Users, UserPlus, Shield, Key, Mail, Phone, Building2, CheckCircle2, Search, Lock } from "lucide-react";
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

interface SystemUser {
  id: string;
  name: string;
  email: string;
  role: "SUPER_ADMIN" | "AGENCY_EXECUTIVE" | "COMMERCIAL_LEAD" | "OPERATOR";
  status: "ACTIVO" | "INVITADO" | "SUSPENDIDO";
  tenant: string;
  lastLogin: string;
}

const SYSTEM_USERS: SystemUser[] = [
  {
    id: "usr-01",
    name: "Dirección General (Superadmin)",
    email: "neurolabstechsolutions@gmail.com",
    role: "SUPER_ADMIN",
    status: "ACTIVO",
    tenant: "NeuroLabs Tech Solutions S.A.S.",
    lastLogin: "En línea ahora",
  },
  {
    id: "usr-02",
    name: "Yury Jaramillo (Ejecutiva)",
    email: "dondeblanca15@gmail.com",
    role: "AGENCY_EXECUTIVE",
    status: "ACTIVO",
    tenant: "YJD Trinova S.A.S.",
    lastLogin: "Hace 15 mins",
  },
  {
    id: "usr-03",
    name: "Director Comercial",
    email: "ventas@neurolabs.io",
    role: "COMMERCIAL_LEAD",
    status: "ACTIVO",
    tenant: "NeuroLabs Tech",
    lastLogin: "Hace 1 hora",
  }
];

export default function UsersPage() {
  const [users, setUsers] = useState<SystemUser[]>(SYSTEM_USERS);
  const [searchQuery, setSearchQuery] = useState("");
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<SystemUser["role"]>("COMMERCIAL_LEAD");

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName || !inviteEmail) {
      toast.error("Ingrese nombre y correo");
      return;
    }

    const newUser: SystemUser = {
      id: `usr-${Date.now().toString(36)}`,
      name: inviteName,
      email: inviteEmail,
      role: inviteRole,
      status: "ACTIVO",
      tenant: "NeuroLabs Tech",
      lastLogin: "Recién invitado"
    };

    setUsers([...users, newUser]);
    setIsInviteOpen(false);
    setInviteName("");
    setInviteEmail("");
    toast.success(`Usuario ${inviteEmail} invitado exitosamente`);
  };

  const filtered = users.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      {/* ─── Compact Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-zinc-200/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-zinc-900 tracking-tight">Usuarios & Permisos de Acceso</h1>
            <Badge variant="outline" className="text-xs bg-zinc-100 text-zinc-700 font-semibold rounded-md border-zinc-200">
              {filtered.length} Usuarios
            </Badge>
          </div>
          <p className="text-xs text-zinc-500 mt-0.5">Control de roles (RBAC), credenciales ejecutivas y sesiones activas</p>
        </div>

        <Button 
          onClick={() => setIsInviteOpen(true)}
          size="sm"
          className="h-8 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold rounded-lg px-3 gap-1.5 shadow-xs"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>Invitar Usuario</span>
        </Button>
      </div>

      {/* ─── Search ─── */}
      <div className="relative max-w-sm">
        <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-zinc-400" />
        <Input 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar por nombre o correo..."
          className="h-8 pl-8 text-xs border-zinc-200 bg-white rounded-lg focus-visible:ring-zinc-900"
        />
      </div>

      {/* ─── Compact Table View ─── */}
      <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-semibold">
              <tr>
                <th className="py-2.5 px-3">Usuario</th>
                <th className="py-2.5 px-3">Correo</th>
                <th className="py-2.5 px-3">Rol</th>
                <th className="py-2.5 px-3">Organización</th>
                <th className="py-2.5 px-3">Última Sesión</th>
                <th className="py-2.5 px-3">Estado</th>
                <th className="py-2.5 px-3 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filtered.map(u => (
                <tr key={u.id} className="hover:bg-zinc-50/80 transition-colors">
                  <td className="py-2.5 px-3 font-semibold text-zinc-900">
                    {u.name}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-zinc-600 text-[11px]">
                    {u.email}
                  </td>
                  <td className="py-2.5 px-3">
                    <Badge variant="outline" className="text-[10px] bg-zinc-100 text-zinc-700 border-zinc-200 font-normal">
                      {u.role.replace('_', ' ')}
                    </Badge>
                  </td>
                  <td className="py-2.5 px-3 text-zinc-600 text-[11px]">
                    {u.tenant}
                  </td>
                  <td className="py-2.5 px-3 text-zinc-400 font-mono text-[10px]">
                    {u.lastLogin}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      {u.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <Button variant="outline" size="sm" className="h-7 text-[11px] border-zinc-200 px-2">
                      Editar
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── Modal: Invitar Usuario ─── */}
      <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
        <DialogContent className="max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-zinc-900">
              Invitar Nuevo Usuario al Panel
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-500">
              Se enviarán las credenciales de acceso al correo electrónico.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleInvite} className="space-y-3 pt-2 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-zinc-700">Nombre Completo *</label>
              <Input 
                value={inviteName}
                onChange={(e) => setInviteName(e.target.value)}
                placeholder="Ej. Andrés Restrepo"
                className="h-9 text-xs"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-zinc-700">Correo Electrónico *</label>
              <Input 
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="usuario@empresa.com"
                className="h-9 text-xs font-mono"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-zinc-700">Rol de Acceso</label>
              <select 
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as any)}
                className="w-full h-9 rounded-lg border border-zinc-200 px-2 text-xs bg-white text-zinc-800 focus:outline-none focus:ring-1 focus:ring-zinc-900"
              >
                <option value="SUPER_ADMIN">Super Administrador</option>
                <option value="AGENCY_EXECUTIVE">Ejecutivo de Cuenta</option>
                <option value="COMMERCIAL_LEAD">Líder Comercial</option>
                <option value="OPERATOR">Operador WhatsApp</option>
              </select>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsInviteOpen(false)} className="h-8 text-xs">
                Cancelar
              </Button>
              <Button type="submit" size="sm" className="h-8 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold">
                Enviar Invitación
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
