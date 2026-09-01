"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  Bot, User, Send, Search, 
  CheckCheck, Clock, RefreshCw, MessageSquare, 
  Smartphone, ShieldCheck, UserCheck, Phone
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export interface LiveContact {
  id: string;
  name: string;
  phone: string;
  avatar: string;
  tenant: string;
  email: string;
}

export interface LiveChatMessage {
  id: string;
  conversationId: string;
  sender: "customer" | "ai" | "agent";
  text: string;
  timestamp: string;
  status?: "sent" | "delivered" | "read";
}

export interface LiveConversation {
  id: string;
  contact: LiveContact;
  lastMessage: {
    id: string;
    sender: string;
    text: string;
    timestamp: string;
  };
  handlingStatus: "AI_HANDLING" | "HUMAN_NEEDED";
  unreadCount: number;
}

const DEFAULT_CONVERSATIONS: LiveConversation[] = [
  {
    id: "conv-1",
    contact: {
      id: "cnt-1",
      name: "Carlos Mendoza",
      phone: "+57 318 4509988",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos",
      tenant: "YJD TRINOVA",
      email: "c.mendoza@gmail.com"
    },
    lastMessage: {
      id: "msg-1",
      sender: "customer",
      text: "¿Tienen disponible la Toyota Fortuner 2024 blanca?",
      timestamp: "10:24 AM"
    },
    handlingStatus: "AI_HANDLING",
    unreadCount: 1
  },
  {
    id: "conv-2",
    contact: {
      id: "cnt-2",
      name: "Carolina Gómez",
      phone: "+57 301 2293400",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Carolina",
      tenant: "YJD TRINOVA",
      email: "caro.gomez@empresa.co"
    },
    lastMessage: {
      id: "msg-2",
      sender: "ai",
      text: "Con gusto. Te agendé la visita al Penthouse para mañana a las 10:30 AM.",
      timestamp: "09:45 AM"
    },
    handlingStatus: "AI_HANDLING",
    unreadCount: 0
  },
  {
    id: "conv-3",
    contact: {
      id: "cnt-3",
      name: "David Silva",
      phone: "+57 320 8941122",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=David",
      tenant: "YJD TRINOVA",
      email: "david.silva@outlook.com"
    },
    lastMessage: {
      id: "msg-3",
      sender: "customer",
      text: "Deseo negociar el valor de la Yamaha MT-09.",
      timestamp: "Ayer"
    },
    handlingStatus: "HUMAN_NEEDED",
    unreadCount: 2
  }
];

const DEFAULT_MESSAGES: Record<string, LiveChatMessage[]> = {
  "conv-1": [
    { id: "m-1-1", conversationId: "conv-1", sender: "customer", text: "Buenos días, vi el inventario en la página web.", timestamp: "10:22 AM" },
    { id: "m-1-2", conversationId: "conv-1", sender: "ai", text: "¡Hola Carlos! Bienvenido a YJD TRINOVA S.A.S. ¿En qué vehículo podemos ayudarte hoy?", timestamp: "10:22 AM" },
    { id: "m-1-3", conversationId: "conv-1", sender: "customer", text: "¿Tienen disponible la Toyota Fortuner 2024 blanca?", timestamp: "10:24 AM" },
    { id: "m-1-4", conversationId: "conv-1", sender: "ai", text: "Sí, tenemos la Toyota Fortuner GR-S 2024 en $310.000.000 COP con peritaje certificado de 150 puntos. ¿Te gustaría agendar un test drive?", timestamp: "10:24 AM" }
  ],
  "conv-2": [
    { id: "m-2-1", conversationId: "conv-2", sender: "customer", text: "Hola, me interesa el Penthouse en Alto Prado.", timestamp: "09:40 AM" },
    { id: "m-2-2", conversationId: "conv-2", sender: "ai", text: "Con gusto. Te agendé la visita al Penthouse para mañana a las 10:30 AM.", timestamp: "09:45 AM" }
  ],
  "conv-3": [
    { id: "m-3-1", conversationId: "conv-3", sender: "customer", text: "Deseo negociar el valor de la Yamaha MT-09.", timestamp: "Ayer" }
  ]
};

export default function ConversationsInboxPage() {
  const [conversations, setConversations] = useState<LiveConversation[]>(DEFAULT_CONVERSATIONS);
  const [selectedConvId, setSelectedConvId] = useState<string>("conv-1");
  const [messagesMap, setMessagesMap] = useState<Record<string, LiveChatMessage[]>>(DEFAULT_MESSAGES);
  const [filterMode, setFilterMode] = useState<"ALL" | "AI_HANDLING" | "HUMAN_NEEDED">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [inputText, setInputText] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messagesMap, selectedConvId]);

  const activeConversation = useMemo(() => {
    return conversations.find(c => c.id === selectedConvId) || conversations[0];
  }, [conversations, selectedConvId]);

  const currentMessages = useMemo(() => {
    return messagesMap[activeConversation?.id] || [];
  }, [messagesMap, activeConversation]);

  const filteredConversations = useMemo(() => {
    return conversations.filter(c => {
      const matchesSearch = 
        c.contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.contact.phone.includes(searchQuery);
      const matchesFilter = filterMode === "ALL" || c.handlingStatus === filterMode;
      return matchesSearch && matchesFilter;
    });
  }, [conversations, searchQuery, filterMode]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeConversation) return;

    const newMsg: LiveChatMessage = {
      id: `msg-${Date.now()}`,
      conversationId: activeConversation.id,
      sender: "agent",
      text: inputText.trim(),
      timestamp: new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }),
      status: "delivered"
    };

    setMessagesMap(prev => ({
      ...prev,
      [activeConversation.id]: [...(prev[activeConversation.id] || []), newMsg]
    }));

    setInputText("");
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      {/* ─── Compact Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-zinc-200/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-zinc-900 tracking-tight">Bandeja de Entrada WhatsApp</h1>
            <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-700 font-semibold rounded-md border-emerald-200">
              ● En Vivo
            </Badge>
          </div>
          <p className="text-xs text-zinc-500 mt-0.5">Supervisión en tiempo real de chats atendidos por el Agente IA y transferencias</p>
        </div>

        <div className="flex items-center gap-1 bg-zinc-100 p-0.5 rounded-lg border border-zinc-200 text-xs">
          {[
            { id: "ALL", label: "Todos" },
            { id: "AI_HANDLING", label: "Atendiendo IA" },
            { id: "HUMAN_NEEDED", label: "Requiere Asesor" },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilterMode(f.id as any)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${filterMode === f.id ? 'bg-white text-zinc-900 shadow-xs' : 'text-zinc-500 hover:text-zinc-900'}`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Compact WhatsApp Split View ─── */}
      <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-xs grid grid-cols-1 md:grid-cols-12 h-[620px]">
        {/* Left Column: Chat List (5 cols) */}
        <div className="md:col-span-4 border-r border-zinc-200 flex flex-col h-full bg-zinc-50/50">
          <div className="p-2.5 border-b border-zinc-200 bg-white">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-zinc-400" />
              <Input 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar conversación..."
                className="h-8 pl-8 text-xs border-zinc-200 bg-zinc-50 rounded-lg focus-visible:ring-zinc-900"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-zinc-100">
            {filteredConversations.map(conv => {
              const isSelected = conv.id === activeConversation?.id;
              return (
                <div
                  key={conv.id}
                  onClick={() => setSelectedConvId(conv.id)}
                  className={`p-3 cursor-pointer transition-colors text-xs flex gap-2.5 items-start ${
                    isSelected ? 'bg-white shadow-xs' : 'hover:bg-zinc-100/60'
                  }`}
                >
                  <Avatar className="w-8 h-8 border border-zinc-200 shrink-0">
                    <AvatarImage src={conv.contact.avatar} />
                    <AvatarFallback className="text-[10px] bg-zinc-100">{conv.contact.name.slice(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-0.5">
                      <span className="font-bold text-zinc-900 truncate">{conv.contact.name}</span>
                      <span className="text-[10px] text-zinc-400 font-mono">{conv.lastMessage.timestamp}</span>
                    </div>
                    <p className="text-[11px] text-zinc-500 truncate">{conv.lastMessage.text}</p>
                    <div className="mt-1 flex items-center gap-1.5">
                      <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                        conv.handlingStatus === 'AI_HANDLING' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                      }`}>
                        {conv.handlingStatus === 'AI_HANDLING' ? 'IA Activa' : 'Asesor'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Chat History & Input (7 cols) */}
        <div className="md:col-span-8 flex flex-col h-full bg-white">
          {activeConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-3 border-b border-zinc-200 bg-zinc-50 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <Avatar className="w-8 h-8 border border-zinc-200">
                    <AvatarImage src={activeConversation.contact.avatar} />
                    <AvatarFallback className="text-[10px]">{activeConversation.contact.name.slice(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-bold text-zinc-900">{activeConversation.contact.name}</div>
                    <div className="text-[10px] text-zinc-500 font-mono">{activeConversation.contact.phone}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px] bg-white text-zinc-700 border-zinc-200">
                    {activeConversation.handlingStatus === 'AI_HANDLING' ? '🤖 Agente IA Respondiendo' : '👤 Asesor al Mando'}
                  </Badge>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2.5 text-xs bg-zinc-50/30">
                {currentMessages.map(msg => (
                  <div
                    key={msg.id}
                    className={`flex flex-col max-w-[80%] ${
                      msg.sender === 'customer' ? 'mr-auto items-start' : 'ml-auto items-end'
                    }`}
                  >
                    <div
                      className={`p-2.5 rounded-xl text-xs leading-relaxed ${
                        msg.sender === 'customer'
                          ? 'bg-white border border-zinc-200 text-zinc-900 shadow-xs'
                          : msg.sender === 'ai'
                          ? 'bg-emerald-50 border border-emerald-200 text-emerald-950'
                          : 'bg-zinc-900 text-white'
                      }`}
                    >
                      {msg.text}
                    </div>
                    <span className="text-[9px] text-zinc-400 font-mono mt-0.5 px-1">{msg.timestamp}</span>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Form */}
              <form onSubmit={handleSendMessage} className="p-2.5 border-t border-zinc-200 bg-white flex gap-2">
                <Input 
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Escribe un mensaje o toma el control de la conversación..."
                  className="flex-1 h-8 text-xs border-zinc-200 focus-visible:ring-zinc-900"
                />
                <Button type="submit" size="sm" className="h-8 px-3 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold gap-1">
                  <Send className="w-3 h-3" />
                  <span>Enviar</span>
                </Button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-xs text-zinc-400">
              Selecciona una conversación
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
