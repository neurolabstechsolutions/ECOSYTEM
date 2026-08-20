"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  Bot, User, Sparkles, Send, Search, 
  CheckCheck, Clock, RefreshCw, MessageSquare, 
  Smartphone, ShieldCheck, UserCheck
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

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
  messages: any[];
}

export default function ConversationsInboxPage() {
  const [conversations, setConversations] = useState<LiveConversation[]>([]);
  const [selectedConvId, setSelectedConvId] = useState<string>("");
  const [messagesMap, setMessagesMap] = useState<Record<string, LiveChatMessage[]>>({});
  const [filterMode, setFilterMode] = useState<"ALL" | "AI_HANDLING" | "HUMAN_NEEDED">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-sync real-time WhatsApp conversations from Render Bridge (Zero Mocks)
  useEffect(() => {
    const syncLiveChats = async () => {
      try {
        const res = await fetch('/api/whatsapp/conversations');
        if (res.ok) {
          const data = await res.json();
          if (data.conversations) {
            setConversations(data.conversations);

            if (!selectedConvId && data.conversations.length > 0) {
              setSelectedConvId(data.conversations[0].id);
            }

            const updatedMap: Record<string, LiveChatMessage[]> = {};
            data.conversations.forEach((c: any) => {
              if (c.messages && c.messages.length > 0) {
                updatedMap[c.id] = c.messages.map((m: any) => ({
                  id: m.id,
                  conversationId: c.id,
                  sender: m.sender === 'user' ? 'customer' : 'ai',
                  text: m.text,
                  timestamp: new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  status: 'read',
                }));
              }
            });
            setMessagesMap(updatedMap);
          }
        }
      } catch (err) {
        console.log('Syncing WhatsApp inbox...');
      } finally {
        setIsLoading(false);
      }
    };

    syncLiveChats();
    const interval = setInterval(syncLiveChats, 3000);
    return () => clearInterval(interval);
  }, [selectedConvId]);

  const activeConversation = useMemo(() => {
    return conversations.find((c) => c.id === selectedConvId) || conversations[0];
  }, [conversations, selectedConvId]);

  const activeMessages = useMemo(() => {
    return (selectedConvId && messagesMap[selectedConvId]) || [];
  }, [messagesMap, selectedConvId]);

  const filteredConversations = useMemo(() => {
    return conversations.filter((conv) => {
      const matchesSearch = conv.contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            conv.contact.phone.includes(searchQuery);
      if (!matchesSearch) return false;
      if (filterMode === "AI_HANDLING") return conv.handlingStatus === "AI_HANDLING";
      if (filterMode === "HUMAN_NEEDED") return conv.handlingStatus === "HUMAN_NEEDED";
      return true;
    });
  }, [conversations, searchQuery, filterMode]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeMessages]);

  const toggleHandlingStatus = (convId: string) => {
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === convId) {
          const newStatus = c.handlingStatus === "AI_HANDLING" ? "HUMAN_NEEDED" : "AI_HANDLING";
          return { ...c, handlingStatus: newStatus };
        }
        return c;
      })
    );
  };

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col md:flex-row bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
      {/* Sidebar: Real-Time WhatsApp Chats */}
      <div className="w-full md:w-96 border-r border-slate-200 flex flex-col bg-slate-50/50">
        <div className="p-4 border-b border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold font-serif text-slate-900 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-emerald-600" />
              Bandeja WhatsApp en Vivo
            </h2>
            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Socket Online
            </Badge>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <Input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar cliente real..."
              className="pl-9 bg-white border-slate-200 rounded-xl text-xs"
            />
          </div>

          <div className="flex gap-1">
            <Button 
              size="sm" 
              variant={filterMode === "ALL" ? "default" : "outline"}
              onClick={() => setFilterMode("ALL")}
              className={`rounded-lg text-xs h-7 px-3 ${filterMode === "ALL" ? "bg-slate-900 text-white" : "border-slate-200 text-slate-600"}`}
            >
              Todos ({conversations.length})
            </Button>
            <Button 
              size="sm" 
              variant={filterMode === "AI_HANDLING" ? "default" : "outline"}
              onClick={() => setFilterMode("AI_HANDLING")}
              className={`rounded-lg text-xs h-7 px-3 ${filterMode === "AI_HANDLING" ? "bg-emerald-600 text-white" : "border-slate-200 text-slate-600"}`}
            >
              IA Activa
            </Button>
          </div>
        </div>

        {/* Conversation List */}
        <ScrollArea className="flex-1">
          {conversations.length === 0 ? (
            <div className="p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                <Smartphone className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-slate-700">Esperando mensajes entrantes...</p>
              <p className="text-xs text-slate-400">
                Cuando un cliente te escriba a WhatsApp (+57 300 5765530), el chat aparecerá aquí en vivo.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredConversations.map((conv) => {
                const isSelected = conv.id === selectedConvId;
                return (
                  <div
                    key={conv.id}
                    onClick={() => setSelectedConvId(conv.id)}
                    className={`p-4 cursor-pointer transition-colors flex items-start gap-3 ${
                      isSelected ? "bg-white border-l-4 border-emerald-600 shadow-sm" : "hover:bg-slate-100/70"
                    }`}
                  >
                    <Avatar className="w-10 h-10 border border-slate-200 shrink-0">
                      <AvatarImage src={conv.contact.avatar} />
                      <AvatarFallback className="bg-slate-200 text-slate-700 text-xs font-bold">
                        {conv.contact.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-1">
                        <h4 className="text-xs font-bold text-slate-900 truncate">
                          {conv.contact.name}
                        </h4>
                        <span className="text-[10px] text-slate-400 shrink-0">
                          {new Date(conv.lastMessage.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 truncate">
                        {conv.lastMessage.text}
                      </p>
                      <div className="mt-2 flex items-center gap-1.5">
                        <Badge variant="outline" className="text-[9px] bg-emerald-50 text-emerald-700 border-emerald-200">
                          {conv.handlingStatus === "AI_HANDLING" ? "🤖 Asesor IA" : "👤 Humano"}
                        </Badge>
                        <span className="text-[10px] text-slate-400">{conv.contact.phone}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Main Chat View */}
      <div className="flex-1 flex flex-col bg-white">
        {activeConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/30">
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10 border border-slate-200">
                  <AvatarImage src={activeConversation.contact.avatar} />
                  <AvatarFallback>{activeConversation.contact.name.slice(0, 2)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">{activeConversation.contact.name}</h3>
                  <p className="text-xs text-slate-500 flex items-center gap-1.5">
                    <span>{activeConversation.contact.phone}</span>
                    <span>•</span>
                    <span className="text-emerald-600 font-medium">WhatsApp Direct</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button 
                  onClick={() => toggleHandlingStatus(activeConversation.id)}
                  variant="outline" 
                  size="sm" 
                  className={`rounded-xl text-xs font-bold border-slate-200 ${
                    activeConversation.handlingStatus === "AI_HANDLING" 
                      ? "text-emerald-700 hover:text-emerald-800 bg-emerald-50/50" 
                      : "text-amber-700 hover:text-amber-800 bg-amber-50/50"
                  }`}
                >
                  {activeConversation.handlingStatus === "AI_HANDLING" ? (
                    <>
                      <Sparkles className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                      Pausar IA & Tomar Control
                    </>
                  ) : (
                    <>
                      <Bot className="w-3.5 h-3.5 mr-1 text-amber-600" />
                      Activar Asesor IA
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Chat History */}
            <ScrollArea className="flex-1 p-6 space-y-4 bg-slate-50/20">
              <div className="space-y-4 max-w-3xl mx-auto">
                {activeMessages.map((msg) => {
                  const isUser = msg.sender === "customer";
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isUser ? "items-start" : "items-end"}`}
                    >
                      <span className="text-[10px] text-slate-400 mb-1 px-1">
                        {isUser ? activeConversation.contact.name : "NeuroLabs Asesor IA"}
                      </span>
                      <div
                        className={`p-4 rounded-3xl max-w-lg text-xs leading-relaxed shadow-sm ${
                          isUser
                            ? "bg-white text-slate-900 border border-slate-200 rounded-tl-sm"
                            : "bg-slate-900 text-white rounded-tr-sm"
                        }`}
                      >
                        <p className="whitespace-pre-line">{msg.text}</p>
                        <div className={`mt-2 text-[9px] flex items-center justify-end gap-1 ${isUser ? "text-slate-400" : "text-slate-400"}`}>
                          <span>{msg.timestamp}</span>
                          {!isUser && <CheckCheck className="w-3 h-3 text-emerald-400" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Message Input Box */}
            <div className="p-4 border-t border-slate-200 bg-white">
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!inputText.trim()) return;
                  // Handle Manual Agent Intervene Reply
                  setMessagesMap((prev) => ({
                    ...prev,
                    [activeConversation.id]: [
                      ...(prev[activeConversation.id] || []),
                      {
                        id: Date.now().toString(),
                        conversationId: activeConversation.id,
                        sender: "agent",
                        text: inputText,
                        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        status: 'read'
                      }
                    ]
                  }));
                  setInputText("");
                }}
                className="flex items-center gap-2 max-w-3xl mx-auto"
              >
                <Input 
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={`Responder a ${activeConversation.contact.name} como asesor humano...`}
                  className="rounded-2xl border-slate-200 bg-slate-50 text-xs py-5"
                />
                <Button type="submit" className="bg-slate-950 hover:bg-black text-white rounded-2xl p-5 shrink-0">
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-3">
            <MessageSquare className="w-10 h-10 text-slate-300" />
            <h3 className="font-bold text-slate-700">Sin conversación seleccionada</h3>
            <p className="text-xs text-slate-400 max-w-xs">
              Selecciona un chat en la barra lateral para ver los mensajes y responder en vivo.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
