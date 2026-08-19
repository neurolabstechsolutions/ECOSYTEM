import { login } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const resolvedSearchParams = await searchParams;

  return (
    <div className="flex h-screen w-full items-center justify-center bg-zinc-950">
      <div className="w-full max-w-sm rounded-xl bg-zinc-900 p-8 shadow-2xl border border-zinc-800">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-50">NeuroLabs</h1>
          <p className="text-zinc-400 mt-2">Inicia sesión en tu cuenta SaaS</p>
        </div>

        {resolvedSearchParams?.error && (
          <div className="mb-4 rounded bg-red-900/50 p-3 text-sm text-red-400 border border-red-800">
            {resolvedSearchParams.error}
          </div>
        )}

        <form action={login} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-zinc-300">Correo Electrónico</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="admin@automotriz.com"
              required
              className="bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-500"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-zinc-300">Contraseña</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              placeholder="••••••••"
              className="bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-500"
            />
          </div>
          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium">
            Entrar
          </Button>
        </form>
        <div className="mt-6 text-center text-xs text-zinc-500">
          Usa superadmin@neurolabs.ai o admin@automotriz.com (pwd: password123)
        </div>
      </div>
    </div>
  )
}
