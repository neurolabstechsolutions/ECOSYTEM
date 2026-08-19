'use client'

import { useState } from 'react'
import { useChat } from '@ai-sdk/react'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Send, Bot, User, Cpu, AlertCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export default function AgentSimulatorPage() {
  const { messages, sendMessage, status } = useChat({
    api: '/api/chat',
    maxSteps: 5,
  })

  const isLoading = status === 'streaming' || status === 'submitted';
  const [localInput, setLocalInput] = useState('');

  return (
    <div className="h-full flex flex-col space-y-6 fade-in">
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
          
          <ScrollArea className="flex-1 p-6">
            <div className="space-y-6">
              {messages.length === 0 && (
                <div className="text-center text-slate-400 mt-20">
                  <Bot className="w-16 h-16 mx-auto mb-4 opacity-20 text-slate-800" />
                  <p className="font-serif text-lg text-slate-600">Envía un mensaje para iniciar la simulación.</p>
                  <p className="text-sm mt-2 opacity-60">Ej: "Hola, busco una SUV roja para mi familia"</p>
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
                    <div className={`p-4 rounded-3xl text-[15px] leading-relaxed shadow-sm ${
                      m.role === 'user' 
                        ? 'bg-slate-100 text-slate-800 rounded-tr-sm border border-slate-200/60' 
                        : 'bg-white text-slate-800 border border-slate-200 rounded-tl-sm'
                    }`}>
                      <div className="whitespace-pre-wrap">
                        {m.parts && Array.isArray(m.parts) 
                          ? m.parts.map((part: any, i: number) => {
                              if (part.type === 'text') {
                                return <span key={i}>{part.text}</span>;
                              }
                              if (part.type === 'reasoning') {
                                return <span key={i} className="text-xs text-slate-400 italic block mb-1">{part.text}</span>;
                              }
                              return null;
                            })
                          : m.content || ''
                        }
                      </div>
                      
                      {/* Mostrar las herramientas invocadas */}
                      {m.parts && Array.isArray(m.parts) ? (
                        m.parts.map((part: any, i: number) => {
                          const isTool = part.type?.startsWith('tool-') || part.type === 'dynamic-tool' || part.type === 'tool' || part.toolName;
                          if (isTool) {
                            const name = part.toolName || part.title || part.type?.replace(/^tool-/, '');
                            const inputData = part.input || part.args;
                            return (
                              <div key={i} className="mt-3 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200 text-slate-600 shadow-sm">
                                <div className="text-black font-semibold mb-2 flex items-center gap-1">
                                  <Cpu className="w-3 h-3 text-slate-500" /> Herramienta: {name}
                                </div>
                                {inputData && (
                                  <div className="bg-white p-2 rounded-lg border border-slate-100 font-mono text-[10px] text-slate-500 break-all">{JSON.stringify(inputData)}</div>
                                )}
                                {part.state === 'output-available' || part.state === 'result' ? (
                                  <div className="text-black font-medium mt-2 flex items-center gap-1">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div> Completado
                                  </div>
                                ) : null}
                              </div>
                            );
                          }
                          return null;
                        })
                      ) : (
                        m.toolInvocations?.map(tool => (
                          <div key={tool.toolCallId} className="mt-3 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200 text-slate-600 shadow-sm">
                            <div className="text-black font-semibold mb-2 flex items-center gap-1">
                              <Cpu className="w-3 h-3 text-slate-500" /> Ejecutando: {tool.toolName}
                            </div>
                            <div className="bg-white p-2 rounded-lg border border-slate-100 font-mono text-[10px] text-slate-500">{JSON.stringify(tool.args)}</div>
                            {tool.state === 'result' && (
                              <div className="text-black font-medium mt-2 flex items-center gap-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div> Completado
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-slate-50 border border-slate-200 px-5 py-3 rounded-3xl rounded-tl-sm shadow-sm flex items-center gap-2">
                     <span className="w-2 h-2 rounded-full bg-slate-300 animate-bounce"></span>
                     <span className="w-2 h-2 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                     <span className="w-2 h-2 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <CardFooter className="p-5 border-t border-slate-100 bg-white">
            <form onSubmit={(e) => {
              e.preventDefault();
              if (!localInput.trim()) return;
              sendMessage({ role: 'user', content: localInput });
              setLocalInput('');
            }} className="flex w-full gap-3">
              <input 
                type="text"
                value={localInput}
                onChange={(e) => setLocalInput(e.target.value)}
                placeholder="Escribe un mensaje como si fueras un cliente..." 
                className="flex-1 bg-slate-50 border border-slate-200 text-slate-800 focus-visible:ring-slate-300 focus-visible:outline-none rounded-full px-6 py-6 text-base"
              />
              <Button type="submit" disabled={isLoading || !localInput.trim()} className="bg-slate-800 hover:bg-slate-700 text-white rounded-full h-auto px-8 transition-all active:scale-95">
                <Send className="w-5 h-5" />
              </Button>
            </form>
          </CardFooter>
        </Card>

        {/* Debug Panel */}
        <Card className="bg-white border-slate-200 shadow-sm rounded-3xl h-fit">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm text-slate-400 flex items-center gap-2 font-medium uppercase tracking-widest">
              <AlertCircle className="w-4 h-4 text-black" /> Panel de Estado
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="text-xs text-slate-400 mb-2 font-medium uppercase tracking-wider">Modelo Activo</div>
              <Badge variant="outline" className="text-black border-slate-200 bg-slate-50 rounded-full px-4 py-1">GPT-OSS 120B (Groq)</Badge>
            </div>
            <div>
              <div className="text-xs text-slate-400 mb-2 font-medium uppercase tracking-wider">Herramientas Habilitadas</div>
              <div className="space-y-2">
                <div className="text-sm bg-slate-50 p-3 rounded-xl border border-slate-200 text-black font-mono shadow-sm">
                  searchInventory()
                </div>
                <div className="text-sm bg-slate-50 p-3 rounded-xl border border-slate-200 text-black font-mono shadow-sm">
                  createLead()
                </div>
              </div>
            </div>
            <div className="pt-6 border-t border-slate-100">
              <p className="text-[13px] text-slate-500 leading-relaxed">
                Este panel de testing intercepta las llamadas de herramienta en tiempo real para auditar el <span className="font-semibold text-black">Function Calling</span> de tu agente corporativo.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


