"use client";

import React, { useEffect, useRef, useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bot, Send, User, Sparkles, AlertCircle, RefreshCw } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export default function PlaygroundPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [localInput, setLocalInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
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
    setError(null);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages.map(m => ({ role: m.role, content: m.content }))
        })
      });

      if (!response.ok) {
        throw new Error('No se pudo conectar con el servidor de IA.');
      }

      if (!response.body) return;

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantText = '';

      const assistantMsgId = (Date.now() + 1).toString();
      setMessages(prev => [...prev, { id: assistantMsgId, role: 'assistant', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        assistantText += chunk;
        setMessages(prev =>
          prev.map(m => (m.id === assistantMsgId ? { ...m, content: assistantText } : m))
        );
      }
    } catch (err: any) {
      setError(err.message || 'Error en la simulación.');
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: `⚠️ Disculpa, ocurrió un error en la simulación: ${err.message}`
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 p-8 pb-32">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center mb-10">
          <h1 className="text-5xl font-black tracking-tight text-black font-serif flex items-center justify-center gap-3">
            <Sparkles className="h-10 w-10 text-black" />
            Centro de IA Interactiva
          </h1>
          <p className="text-lg text-slate-500 mt-4 max-w-2xl mx-auto font-light">
            Experimenta la capacidad de nuestro agente automatizado de ventas corporativas con Llama 120B.
          </p>
        </div>

        {error && (
          <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-900 rounded-2xl">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error de Conexión</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card className="bg-white border-slate-200 shadow-sm rounded-3xl flex flex-col h-[60vh] overflow-hidden">
          <CardHeader className="border-b border-slate-100 pb-5 bg-slate-50/50">
            <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-2 font-serif">
              <Bot className="w-6 h-6 text-slate-700" />
              Simulador Piloto Automotriz
            </CardTitle>
            <CardDescription className="text-slate-500 text-sm">
              Escribe como un cliente buscando un vehículo corporativo o personal.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="flex-1 overflow-hidden p-0 relative bg-white">
            <ScrollArea className="h-full p-6" ref={scrollRef}>
              <div className="space-y-6">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 mt-20 space-y-4">
                    <Bot className="w-16 h-16 opacity-20" />
                    <p className="font-serif text-lg">Inicia la simulación</p>
                    <p className="text-sm opacity-60">Ej: "Buscamos una flotilla de SUVs para nuestra empresa"</p>
                  </div>
                ) : (
                  messages.map(m => (
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
                            : 'bg-white text-slate-800 border border-slate-200 rounded-tl-sm font-sans whitespace-pre-wrap'
                        }`}>
                          {m.content}
                        </div>
                      </div>
                    </div>
                  ))
                )}
                {isLoading && (
                  <div className="flex gap-4 max-w-[85%]">
                    <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 text-black flex items-center justify-center shrink-0 shadow-sm">
                      <Bot className="w-5 h-5 animate-pulse" />
                    </div>
                    <div className="p-5 rounded-3xl bg-white border border-slate-200 rounded-tl-sm flex items-center gap-2 shadow-sm">
                      <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce"></span>
                      <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
          
          <CardFooter className="p-5 border-t border-slate-100 bg-white">
            <form onSubmit={handleSendMessage} className="flex w-full gap-3">
              <input 
                type="text"
                value={localInput}
                onChange={(e) => setLocalInput(e.target.value)}
                placeholder="Escribe tu requerimiento aquí..."
                className="flex-1 bg-slate-50 border border-slate-200 text-slate-800 focus-visible:ring-slate-300 focus-visible:outline-none rounded-full px-6 py-6 text-base"
              />
              <Button 
                type="submit" 
                disabled={isLoading || !localInput.trim()} 
                className="bg-slate-900 hover:bg-black text-white rounded-full h-auto px-8 transition-all active:scale-95"
              >
                <Send className="w-5 h-5" />
              </Button>
            </form>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
