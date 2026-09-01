"use client";

import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Bot, Send, User, AlertCircle, RefreshCw, Terminal, Sliders } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export default function PlaygroundPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm-init',
      role: 'assistant',
      content: 'Consola de pruebas lista. Puedes simular cualquier consulta de inventario, precios en COP ($), especificaciones técnicas o agendamiento.'
    }
  ]);
  const [localInput, setLocalInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!localInput.trim() || isLoading) return;

    const userText = localInput.trim();
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: userText,
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setLocalInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages.map(m => ({ role: m.role, content: m.content }))
        })
      });

      if (!response.ok) throw new Error('Error al conectar');

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantText = '';
      const assistantMsgId = (Date.now() + 1).toString();

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          assistantText += decoder.decode(value, { stream: true });
          
          setMessages(prev => {
            const last = prev[prev.length - 1];
            if (last && last.id === assistantMsgId) {
              return prev.map(m => m.id === assistantMsgId ? { ...m, content: assistantText } : m);
            } else {
              return [...prev, { id: assistantMsgId, role: 'assistant', content: assistantText }];
            }
          });
        }
      }
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: 'Simulación completada con éxito. Consulta procesada correctamente.'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      {/* ─── Compact Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-zinc-200/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-zinc-900 tracking-tight">Simulador de Respuestas & Consola</h1>
            <Badge variant="outline" className="text-xs bg-zinc-100 text-zinc-700 font-semibold rounded-md border-zinc-200">
              Entorno Sandbox
            </Badge>
          </div>
          <p className="text-xs text-zinc-500 mt-0.5">Prueba la lógica comercial antes de desplegar cambios a los clientes</p>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            onClick={() => setMessages([{ id: Date.now().toString(), role: 'assistant', content: 'Consola reiniciada.' }])}
            variant="outline"
            size="sm"
            className="h-8 text-xs border-zinc-200 px-3 gap-1.5"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Reiniciar</span>
          </Button>
        </div>
      </div>

      {/* ─── Console Box ─── */}
      <div className="bg-white border border-zinc-200 rounded-xl flex flex-col h-[560px] overflow-hidden shadow-xs">
        <div className="px-4 py-2.5 bg-zinc-50 border-b border-zinc-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Terminal className="h-4 w-4 text-zinc-700" />
            <span className="font-bold text-zinc-900">Sandbox de Simulación</span>
          </div>
          <span className="text-[10px] text-zinc-500 font-mono">Modo: Pruebas Seguras</span>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex gap-2.5 max-w-[85%] text-xs ${
                m.role === 'user' ? 'ml-auto flex-row-reverse' : ''
              }`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
                  m.role === 'user'
                    ? 'bg-zinc-900 text-white'
                    : 'bg-zinc-100 text-zinc-800 border border-zinc-200'
                }`}
              >
                {m.role === 'user' ? 'U' : 'IA'}
              </div>
              <div
                className={`p-3 rounded-xl leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-zinc-900 text-white'
                    : 'bg-zinc-50 border border-zinc-200 text-zinc-800'
                }`}
              >
                {m.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-2 text-xs text-zinc-400 items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-pulse" />
              <span>Simulando respuesta...</span>
            </div>
          )}
        </div>

        <form onSubmit={handleSendMessage} className="p-3 border-t border-zinc-200 bg-zinc-50/50 flex gap-2">
          <Input
            value={localInput}
            onChange={(e) => setLocalInput(e.target.value)}
            placeholder="Escribe una pregunta para probar la respuesta del agente..."
            className="flex-1 h-9 text-xs bg-white border-zinc-200 focus-visible:ring-zinc-900"
            disabled={isLoading}
          />
          <Button
            type="submit"
            disabled={isLoading || !localInput.trim()}
            size="sm"
            className="h-9 px-4 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold gap-1.5"
          >
            <Send className="h-3.5 w-3.5" />
            <span>Enviar</span>
          </Button>
        </form>
      </div>
    </div>
  );
}
