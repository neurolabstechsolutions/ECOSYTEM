"use client";

import React, { useEffect, useRef, useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bot, Send, User, Sparkles, AlertCircle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import { useChat } from '@ai-sdk/react';

export default function PlaygroundPage() {
  const { messages, sendMessage, status, error } = useChat({
    api: '/api/chat',
    maxSteps: 5,
  });
  
  const isLoading = status === 'streaming' || status === 'submitted';
  const [localInput, setLocalInput] = useState('');
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  return (
    <div className="min-h-screen bg-white text-slate-900 p-8 pb-32">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center mb-10">
          <h1 className="text-5xl font-black tracking-tight text-black font-serif flex items-center justify-center gap-3">
            <Sparkles className="h-10 w-10 text-black" />
            Centro de IA Interactiva
          </h1>
          <p className="text-lg text-slate-500 mt-4 max-w-2xl mx-auto font-light">
            Experimenta la capacidad de nuestro agente automatizado de ventas corporativas.
          </p>
        </div>

        {error && (
          <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-900 rounded-2xl">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error de Conexión</AlertTitle>
            <AlertDescription>
              {error?.message ?? String(error)}
            </AlertDescription>
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
                          
                          {/* Render Tool Invocations gracefully */}
                          {m.parts && Array.isArray(m.parts) ? (
                            m.parts.map((part: any, i: number) => {
                              const isTool = part.type?.startsWith('tool-') || part.type === 'dynamic-tool' || part.type === 'tool' || part.toolName;
                              if (isTool) {
                                const name = part.toolName || part.title || part.type?.replace(/^tool-/, '');
                                const inputData = part.input || part.args;
                                return (
                                  <div key={i} className="mt-3 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200 text-slate-600 shadow-sm">
                                    <div className="text-black font-semibold mb-2 flex items-center gap-1">
                                      <Sparkles className="w-3 h-3 text-slate-500" /> Herramienta: {name}
                                    </div>
                                    {inputData && (
                                      <div className="bg-white p-2 rounded-lg border border-slate-100 font-mono text-[10px] text-slate-500 break-all">
                                        {JSON.stringify(inputData)}
                                      </div>
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
                                  <Sparkles className="w-3 h-3 text-slate-500" /> Ejecutando Herramienta: {tool.toolName}
                                </div>
                                <div className="bg-white p-2 rounded-lg border border-slate-100 font-mono text-[10px] text-slate-500 break-all">{JSON.stringify(tool.args)}</div>
                                {tool.state === 'result' && (
                                  <div className="text-black font-medium mt-2 flex items-center gap-1">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div> Terminado con éxito
                                  </div>
                                )}
                              </div>
                            ))
                          )}
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
                      <span className="w-2 h-2 rounded-full bg-slate-300 animate-bounce"></span>
                      <span className="w-2 h-2 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="w-2 h-2 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
          
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
                placeholder="Escribe tu requerimiento aquí..."
                className="flex-1 bg-slate-50 border border-slate-200 text-slate-800 focus-visible:ring-slate-300 focus-visible:outline-none rounded-full px-6 py-6 text-base"
              />
              <Button 
                type="submit"
                disabled={isLoading || !localInput.trim()} 
                className="bg-slate-800 hover:bg-slate-700 text-white rounded-full h-auto px-8 transition-all active:scale-95"
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


