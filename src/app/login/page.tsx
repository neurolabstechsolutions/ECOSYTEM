import { login } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { BrainCircuit, ShieldCheck, Lock, Mail } from 'lucide-react'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const resolvedSearchParams = await searchParams;

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-950 px-4 py-12">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-8 sm:p-10 shadow-2xl space-y-8">
        <div className="text-center space-y-3">
          <div className="mx-auto size-20 bg-white border border-slate-200 rounded-3xl p-2 flex items-center justify-center shadow-lg">
            <img src="/neurolabs-logo.jpg" alt="NeuroLabs Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-serif text-slate-950 tracking-tight">NeuroLabs Tech Solutions S.A.S.</h1>
            <p className="text-xs text-emerald-600 font-serif italic mt-0.5">Innovación sin Límites</p>
            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider mt-1">Acceso Ejecutivo • Panel Central</p>
          </div>
        </div>

        {resolvedSearchParams?.error && (
          <div className="rounded-2xl bg-red-50 p-4 text-xs font-medium text-red-700 border border-red-200 flex items-center gap-2">
            <Lock className="w-4 h-4 text-red-500 shrink-0" />
            <span>{resolvedSearchParams.error}</span>
          </div>
        )}

        <form action={login} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Correo Corporativo
            </Label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="neurolabstechsolutions@gmail.com"
                defaultValue="neurolabstechsolutions@gmail.com"
                required
                className="pl-10 h-11 bg-slate-50 border-slate-200 rounded-xl text-slate-900 text-sm focus:ring-1 focus:ring-slate-900"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Contraseña
            </Label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <Input
                id="password"
                name="password"
                type="password"
                required
                placeholder="••••••••"
                className="pl-10 h-11 bg-slate-50 border-slate-200 rounded-xl text-slate-900 text-sm focus:ring-1 focus:ring-slate-900"
              />
            </div>
          </div>

          <Button type="submit" className="w-full h-11 bg-slate-950 hover:bg-black text-white font-bold rounded-xl text-sm transition-all shadow-md">
            Iniciar Sesión
          </Button>
        </form>

        <div className="pt-4 border-t border-slate-100 text-center space-y-2">
          <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Autenticación Cifrada con Sesión Activa</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Credenciales de acceso: <strong>neurolabstechsolutions@gmail.com</strong> (Pass: <strong>admin2026</strong>)
          </p>
        </div>
      </div>
    </div>
  )
}
