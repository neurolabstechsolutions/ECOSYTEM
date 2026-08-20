'use client'

import React, { useState, useRef, useEffect } from 'react'
import {
  X,
  Send,
  Minimize2,
  Maximize2,
  RefreshCw
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

export function GlobalAICopilot() {
  const [isOpen, setIsOpen] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isOpen])

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: textToSend.trim()
    }

    const updatedMessages = [...messages, userMsg]
    setMessages(updatedMessages)
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages.map(m => ({ role: m.role, content: m.content }))
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      if (!response.body) {
        throw new Error('Response body is null')
      }

      const assistantMsgId = (Date.now() + 1).toString()
      setMessages(prev => [...prev, { id: assistantMsgId, role: 'assistant', content: '' }])

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let accumulatedContent = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        accumulatedContent += chunk

        setMessages(prev => 
          prev.map(msg => 
            msg.id === assistantMsgId ? { ...msg, content: accumulatedContent } : msg
          )
        )
      }
    } catch (err: any) {
      console.error('Error streaming chat message:', err)
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: 'Lo siento, ocurrió un error al procesar tu solicitud. Por favor intenta de nuevo.'
        }
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSendMessage(input)
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Botón Flotante con Logo Oficial de NeuroLabs */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-3 bg-slate-950 hover:bg-black text-white px-4 py-2.5 rounded-full shadow-2xl hover:shadow-slate-900/40 transition-all duration-300 transform hover:scale-105 border border-slate-800"
        >
          {/* Indicador de pulso activo */}
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>

          <div className="flex items-center gap-2.5">
            <div className="size-7 rounded-lg overflow-hidden bg-white p-0.5 shrink-0 border border-slate-700">
              <img src="/neurolabs-logo.jpg" alt="NeuroLabs Logo" className="w-full h-full object-contain" />
            </div>
            <div className="text-left">
              <p className="text-xs font-bold tracking-wider uppercase leading-none">NeuroLabs AI</p>
              <p className="text-[9px] text-emerald-400 mt-0.5 leading-none font-medium">Asesor Comercial 24/7</p>
            </div>
          </div>
        </button>
      )}

      {/* Ventana flotante interactiva */}
      {isOpen && (
        <div
          className={`flex flex-col bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden transition-all duration-300 ${
            isExpanded
              ? 'w-[650px] h-[750px]'
              : 'w-[400px] sm:w-[440px] h-[580px]'
          }`}
        >
          {/* Cabecera del Copilot con Logo Oficial */}
          <div className="bg-slate-950 text-white p-4 flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-2xl bg-white p-0.5 flex items-center justify-center border border-slate-700 shadow-sm shrink-0">
                <img src="/neurolabs-logo.jpg" alt="NeuroLabs Logo" className="w-full h-full object-contain" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm font-serif text-white">NeuroLabs Copilot</h3>
                  <Badge variant="outline" className="text-[9px] bg-emerald-500/10 text-emerald-400 border-emerald-500/30 px-1.5 py-0">
                    Online 24/7
                  </Badge>
                </div>
                <p className="text-[10px] text-slate-400">Innovación sin Límites • NeuroLabs Tech Solutions S.A.S.</p>
              </div>
            </div>

            <div className="flex items-center gap-1 text-slate-400">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1.5 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                title={isExpanded ? "Reducir tamaño" : "Expandir tamaño"}
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                title="Minimizar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Área de Mensajes */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/50 text-xs">
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4 text-slate-500">
                <div className="size-16 rounded-3xl bg-white border border-slate-200 shadow-sm flex items-center justify-center p-2">
                  <img src="/neurolabs-logo.jpg" alt="NeuroLabs" className="w-full h-full object-contain" />
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-sm font-serif">¡Hola! Soy tu Asesor NeuroLabs</p>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs leading-relaxed">
                    Estoy conectado en vivo a los servicios de software, IA, cotizaciones y clientes de tu empresa. ¿En qué te ayudo hoy?
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-2 w-full pt-2">
                  <button
                    onClick={() => handleSendMessage('¿Cuáles son los paquetes y servicios de desarrollo que ofrecemos?')}
                    className="p-2.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-left font-medium text-slate-700 hover:text-black transition-colors"
                  >
                    💻 Ver servicios de software e IA
                  </button>
                  <button
                    onClick={() => handleSendMessage('¿Cómo va el estado de las conversaciones y clientes hoy?')}
                    className="p-2.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-left font-medium text-slate-700 hover:text-black transition-colors"
                  >
                    📊 Resumen de clientes y cotizaciones
                  </button>
                </div>
              </div>
            )}

            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2.5 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.role === 'assistant' && (
                  <div className="size-7 rounded-lg bg-white border border-slate-200 p-0.5 shrink-0 mt-0.5 shadow-xs flex items-center justify-center">
                    <img src="/neurolabs-logo.jpg" alt="NeuroLabs" className="w-full h-full object-contain" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 leading-relaxed text-xs shadow-xs ${
                    m.role === 'user'
                      ? 'bg-slate-950 text-white rounded-br-none'
                      : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none font-sans whitespace-pre-wrap'
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center gap-2 text-slate-400 text-xs italic pl-9">
                <RefreshCw className="w-3 h-3 animate-spin text-emerald-600" />
                <span>NeuroLabs AI formulando respuesta...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Formulario de Entrada */}
          <form onSubmit={handleSubmit} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribe tu consulta para NeuroLabs..."
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-slate-900"
            />
            <Button
              type="submit"
              size="sm"
              disabled={!input.trim() || isLoading}
              className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl h-8 px-3"
            >
              <Send className="w-3.5 h-3.5" />
            </Button>
          </form>
        </div>
      )}
    </div>
  )
}
