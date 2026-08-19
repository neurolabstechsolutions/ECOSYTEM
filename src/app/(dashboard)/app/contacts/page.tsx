import { MOCK_CONTACTS } from '@/lib/mocks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Search, Plus, MoreHorizontal } from 'lucide-react'
import { Input } from '@/components/ui/input'

export default async function ContactsPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-8 fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-black font-serif font-serif">Contactos</h1>
          <p className="text-slate-500 mt-1">Directorio de todos los prospectos y clientes interactuando con tu empresa.</p>
        </div>
        <Button className="bg-black text-white hover:bg-slate-800 text-slate-900">
          <Plus className="mr-2 h-4 w-4" /> Nuevo Contacto
        </Button>
      </div>

      <Card className="bg-slate-50 border-slate-200 shadow-lg">
        <CardHeader className="border-b border-slate-200 pb-4">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="Buscar por nombre, teléfono o email..." 
                className="pl-9 bg-white border-slate-200 text-slate-900 placeholder:text-zinc-600"
              />
            </div>
            <Button variant="outline" className="border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-100">
              Filtros
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50 text-xs text-slate-400 uppercase">
                <tr>
                  <th className="px-6 py-4 font-medium">Nombre</th>
                  <th className="px-6 py-4 font-medium">Contacto</th>
                  <th className="px-6 py-4 font-medium">Fuente</th>
                  <th className="px-6 py-4 font-medium">Etiquetas</th>
                  <th className="px-6 py-4 font-medium">Estado</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {MOCK_CONTACTS.map((contact) => (
                  <tr key={contact.id} className="hover:bg-slate-100 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">{contact.name}</div>
                      <div className="text-xs text-slate-400 mt-0.5">ID: {contact.id}</div>
                    </td>
                    <td className="px-6 py-4 space-y-1">
                      <div className="text-slate-700">{contact.phone}</div>
                      <div className="text-xs text-slate-400">{contact.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="outline" className="bg-slate-100 text-slate-500 border-slate-200">
                        {contact.source}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2 flex-wrap">
                        {contact.tags.map(tag => (
                          <Badge key={tag} className="bg-blue-900/20 text-blue-400 border border-blue-800/50 hover:bg-blue-900/40 text-[10px]">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge className={
                        contact.status === 'ACTIVO' 
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                          : 'bg-slate-100 text-slate-500 border-slate-200'
                      }>
                        {contact.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="ghost" size="icon" className="text-slate-500 hover:text-slate-900 hover:bg-slate-100">
                        <MoreHorizontal className="h-4 w-4" />
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
  )
}


