"use client";

import React, { useState } from "react";
import { 
  Users, UserPlus, Shield, Key, Mail, Phone, Building2, CheckCircle2, 
  Search, Sliders, MoreHorizontal, UserCheck, ShieldAlert, Lock
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface SystemUser {
  id: string;
  name: string;
  email: string;
  role: "SUPER_ADMIN" | "AGENCY_EXECUTIVE" | "COMMERCIAL_LEAD" | "OPERATOR";
  status: "ACTIVO" | "INVITADO" | "SUSPENDIDO";
  tenant: string;
  lastLogin: string;
  twoFactorEnabled: boolean;
}

const SYSTEM_USERS: SystemUser[] = [
  {
    id: "usr-01",
    name: "Jafet Cantillo (Superadmin)",
    email: "neurolabstechsolutions@gmail.com",
    role: "SUPER_ADMIN",
    status: "ACTIVO",
    tenant: "NeuroLabs Tech Solutions S.A.S.",
    lastLogin: "En línea ahora",
    twoFactorEnabled: true,
  },
  {
    id: "usr-02",
    name: "Yury Jaramillo (Ejecutiva)",
    email: "admin@jytrinova.com",
    role: "AGENCY_EXECUTIVE",
    status: "ACTIVO",
    tenant: "JY Trinova S.A.S.",
    lastLogin: "Hace 15 mins",
    twoFactorEnabled: true,
  },
  {
    id: "usr-03",
    name: "Admin Piloto",
    email: "admin@automotriz.com",
    role: "COMMERCIAL_LEAD",
    status: "ACTIVO",
    tenant: "Piloto Automotriz",
    lastLogin: "Hace 1 hora",
    twoFactorEnabled: false,
  },
  {
    id: "usr-04",
    name: "Operador de Cierres & WhatsApp",
    email: "ventas@neurolabs.io",
    role: "OPERATOR",
    status: "ACTIVO",
    tenant: "NeuroLabs Tech Solutions S.A.S.",
    lastLogin: "Hace 3 horas",
    twoFactorEnabled: true,
  }
];

export default function UsersManagementPage() {
  const [users, setUsers] = useState<SystemUser[]>(SYSTEM_USERS);
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = users.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.tenant.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white text-slate-900 p-8 space-y-8 pb-32">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-950 font-serif flex items-center gap-3">
            <Users className="w-8 h-8 text-black" />
            Gestión de Usuarios & Accesos
          </h1>
          <p className="text-slate-500 mt-2 text-base">
            Administra roles, permisos ejecutivos, accesos multi-empresa y seguridad de tu organización.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button className="bg-slate-950 hover:bg-black text-white rounded-2xl shadow-md px-5 py-6 font-bold flex items-center gap-2">
            <UserPlus className="w-4 h-4" />
            <span>Invitar Usuario</span>
          </Button>
        </div>
      </div>

      {/* Security Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-slate-50 border-slate-200 rounded-3xl p-5">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-100 text-emerald-700 rounded-2xl">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase">Seguridad RBAC</p>
              <h4 className="text-xl font-bold text-slate-900">Control por Roles Activo</h4>
            </div>
          </div>
        </Card>

        <Card className="bg-slate-50 border-slate-200 rounded-3xl p-5">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 text-blue-700 rounded-2xl">
              <Key className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase">Autenticación 2FA</p>
              <h4 className="text-xl font-bold text-slate-900">Sesiones Seguras JWT</h4>
            </div>
          </div>
        </Card>

        <Card className="bg-slate-50 border-slate-200 rounded-3xl p-5">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 text-purple-700 rounded-2xl">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase">Empresas & Tenants</p>
              <h4 className="text-xl font-bold text-slate-900">Multi-Empresa Aislado</h4>
            </div>
          </div>
        </Card>
      </div>

      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <Input 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nombre, email o empresa..."
            className="pl-10 bg-white border-slate-200 rounded-xl text-sm"
          />
        </div>
      </div>

      {/* Users Table */}
      <Card className="bg-white border-slate-200 shadow-sm rounded-3xl overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase border-b border-slate-100">
                <tr>
                  <th className="p-4 font-bold">Usuario</th>
                  <th className="p-4 font-bold">Empresa / Tenant</th>
                  <th className="p-4 font-bold">Rol</th>
                  <th className="p-4 font-bold">Estado</th>
                  <th className="p-4 font-bold">Última Sesión</th>
                  <th className="p-4 text-right font-bold">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filtered.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-9 h-9 border border-slate-200">
                          <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} />
                          <AvatarFallback>{user.name.slice(0, 2)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-bold text-slate-900 text-sm">{user.name}</div>
                          <div className="text-[11px] text-slate-400">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-semibold text-slate-800">
                      {user.tenant}
                    </td>
                    <td className="p-4">
                      <Badge variant="outline" className={`text-[10px] font-bold ${
                        user.role === 'SUPER_ADMIN' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                        user.role === 'AGENCY_EXECUTIVE' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                        'bg-slate-100 text-slate-700 border-slate-200'
                      }`}>
                        {user.role}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] flex items-center gap-1 w-fit">
                        <CheckCircle2 className="w-3 h-3" /> {user.status}
                      </Badge>
                    </td>
                    <td className="p-4 text-slate-500 font-mono text-[11px]">
                      {user.lastLogin}
                    </td>
                    <td className="p-4 text-right">
                      <Button variant="outline" size="sm" className="rounded-xl text-xs font-bold border-slate-200">
                        Editar
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
