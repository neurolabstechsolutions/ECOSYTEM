import { MOCK_LEADS } from '@/lib/mocks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Plus, MoreHorizontal, User, DollarSign, Target } from 'lucide-react'

// Kanban Columns based on the prompt phases
const COLUMNS = [
  { id: 'NEW', title: 'Nuevos' },
  { id: 'CONTACTED', title: 'Contactados' },
  { id: 'QUALIFIED', title: 'Calificados' },
  { id: 'NEGOTIATION', title: 'En Negociación' },
  { id: 'WON', title: 'Cerrados' },
]

export default async function LeadsPage() {
  return (
    <div className="h-full flex flex-col space-y-6 fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-black font-serif">Pipeline de Ventas</h1>
          <p className="text-slate-500 mt-2 text-lg">Arrastra y suelta los leads a través del embudo comercial.</p>
        </div>
        <Button className="bg-black hover:bg-slate-800 text-white rounded-full px-6">
          <Plus className="mr-2 h-4 w-4" /> Nuevo Lead
        </Button>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 flex gap-6 overflow-x-auto pb-4">
        {COLUMNS.map(column => {
          const columnLeads = MOCK_LEADS.filter(lead => lead.status === column.id)
          
          return (
            <div key={column.id} className="flex flex-col flex-shrink-0 w-80">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-black font-serif uppercase tracking-wider text-sm">{column.title}</h3>
                <Badge variant="outline" className="bg-white border-slate-200 text-slate-500 rounded-full">
                  {columnLeads.length}
                </Badge>
              </div>

              <div className="flex-1 space-y-4 min-h-[200px] rounded-2xl bg-slate-50/80 border border-slate-100 p-3">
                {columnLeads.map(lead => (
                  <Card key={lead.id} className="bg-white border-slate-200 shadow-sm rounded-xl cursor-grab hover:border-black hover:shadow-md transition-all">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <div className="font-bold text-black font-serif">{lead.name}</div>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400 hover:text-slate-900">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="text-sm text-slate-500 font-medium">
                        {lead.productInterest}
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" /> {lead.budget}
                        </div>
                        <div className="flex items-center gap-1 text-purple-400">
                          <Target className="h-3 w-3" /> {lead.score} pts
                        </div>
                      </div>

                      <div className="pt-2 mt-2 border-t border-slate-200 flex items-center justify-between">
                        <Badge className="bg-slate-100 text-slate-600 text-[10px] rounded-sm uppercase font-semibold">
                          {lead.intent}
                        </Badge>
                        <div className="flex items-center gap-1 text-xs text-slate-400 font-medium">
                          <User className="h-3 w-3" /> {lead.assignedTo}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {columnLeads.length === 0 && (
                  <div className="h-full flex items-center justify-center text-sm text-zinc-600 border-2 border-dashed border-slate-200 rounded-lg py-8">
                    Sin leads
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}


