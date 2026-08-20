'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Send, Bot, User, Cpu, Sparkles, RefreshCw } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

export default function AgentSimulatorPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [localInput, setLocalInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isLoading])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!localInput.trim() || isLoading) return

    const userText = localInput.trim()
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: userText
    }

    const updatedMessages = [...messages, userMsg]
    setMessages(updatedMessages)
    setLocalInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages.map(m => ({ role: m.role, content: m.content }))
        })
      })

      if (!response.ok) throw new Error('Error al conectar con el servidor')
      if (!response.body) return

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let assistantText = ''

      const assistantMsgId = (Date.now() + 1).toString()
      setMessages(prev => [...prev, { id: assistantMsgId, role: 'assistant', content: '' }])

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        assistantText += chunk
        setMessages(prev =>
          prev.map(m => (m.id === assistantMsgId ? { ...m, content: assistantText } : m))
        )
      }
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: `⚠️ Error en la simulación: ${err.message}`
        }
      ])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="h-full flex flex-col space-y-6 fade-in pb-12">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-black font-serif">Simulador IA (Testing)</h1>
          <p className="text-slate-500 mt-2 text-lg">Prueba la lógica de ventas, persuasión y function-calling del Agente antes de conectarlo a WhatsApp.</p>
        </div>
        <Badge className="bg-slate-100 text-slate-800 border-slate-200 rounded-full px-4 py-1">
          <Cpu className="w-4 h-4 mr-2" /> GPT-OSS 120B (Groq) Activo
        </Badge>
      </div>

      <div className="flex-1 grid md:grid-cols-3 gap-6 h-[600px]">
        {/* Chat Interface */}
        <Card className="md:col-span-2 bg-white border-slate-200 flex flex-col shadow-sm rounded-3xl overflow-hidden">
          <CardHeader className="border-b border-slate-100 pb-5 bg-slate-50/50">
            <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-2 font-serif">
              <Bot className="w-6 h-6 text-slate-700" />
              Agente Automotriz
            </CardTitle>
          </CardHeader>
          
          <ScrollArea className="flex-1 p-6" ref={scrollRef}>
            <div className="space-y-6">
              {messages.length === 0 && (
                <div className="text-center text-slate-400 mt-20">
                  <Bot className="w-16 h-16 mx-auto mb-4 opacity-20 text-slate-800" />
                  <p className="font-serif text-lg text-slate-600">Envía un mensaje para iniciar la simulación.</p>
                  <p className="text-sm mt-2 opacity-60">Ej: "Hola, busco una SUV para mi familia"</p>
                </div>
              )}
              
              {messages.map(m => (
                <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex gap-4 max-w-[85%] ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className="flex-shrink-0">
                      {m.role === 'user' 
                        ? <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center shadow-sm"><User className="w-5 h-5" /></div>
                        : <div className="w-10 h-10 rounded-full bg-slate-50 text-slate-700 flex items-center justify-center shadow-sm border border-slate-200"><Bot className="w-5 h-5" /></div>
                      }
                    </div>
                    <div className={`p-4 rounded-3xl text-sm leading-relaxed shadow-sm ${
                      m.role === 'user' 
                        ? 'bg-slate-100 text-slate-800 rounded-tr-sm border border-slate-200/60' 
                        : 'bg-white text-slate-800 border border-slate-200 rounded-tl-sm font-sans whitespace-pre-wrap'
                    }`}>
                      {m.content}
                    </div>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex items-center gap-2 text-slate-400 text-xs italic pl-4">
                  <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
                  <span>Agente pensando...</span>
                </div>
              )}
            </div>
          </ScrollArea>

          <CardFooter className="p-4 border-t border-slate-100 bg-white">
            <form onSubmit={handleSendMessage} className="flex w-full gap-3">
              <input
                value={localInput}
                onChange={e => setLocalInput(e.target.value)}
                placeholder="Simula un mensaje de cliente..."
                className="flex-1 bg-slate-50 border border-slate-200 rounded-full px-5 py-3 text-sm text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-slate-900"
              />
              <Button type="submit" disabled={isLoading || !localInput.trim()} className="bg-slate-900 hover:bg-black text-white rounded-full px-6">
                <Send className="w-4 h-4 mr-2" /> Enviar
              </Button>
            </form>
          </CardFooter>
        </Card>

        {/* Panel de Configuración & Parámetros */}
        <Card className="bg-white border-slate-200 shadow-sm rounded-3xl p-6 flex flex-col justify-between">
          <div className="space-y-6">
            <div>
              <h3 className="font-bold text-lg text-slate-900 font-serif">Ajustes del Modelo</h3>
              <p className="text-xs text-slate-500 mt-1">Configuración del Agente en Producción</p>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                <span className="font-bold text-slate-700">Modelo LPU:</span>
                <p className="text-slate-500">openai/gpt-oss-120b (Groq Supercharged)</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                <span className="font-bold text-slate-700">Herramientas Conectadas:</span>
                <p className="text-slate-500">• searchInventory (Inventario Supabase)<br/>• createLead (CRM Pipeline)</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                <span className="font-bold text-slate-700">Velocidad Promedio:</span>
                <p className="text-emerald-600 font-bold font-mono">~135 ms por respuesta</p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 text-center">
            <Badge variant="outline" className="text-emerald-600 border-emerald-300 bg-emerald-50">
              Sincronizado con WhatsApp Cloud API
            </Badge>
          </div>
        </Card>
      </div>
    </div>
  )
}
