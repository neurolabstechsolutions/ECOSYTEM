"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  Bot, User, Sparkles, AlertTriangle, Send, Paperclip, Search, MoreVertical, 
  Phone, Video, CheckCheck, Check, Clock, Filter, ShieldCheck, UserCheck, 
  Zap, RefreshCw, Smile, FileText, Building2, Mail, ChevronRight, Download, 
  Info, SlidersHorizontal, CircleDot, Radio, Share2
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  MOCK_CONVERSATIONS,
  MOCK_MESSAGES,
  Conversation,
  ChatMessage,
  HandlingStatus,
} from "@/lib/mocks";

export default function ConversationsInboxPage() {
  const [conversations, setConversations] = useState<Conversation[]>(MOCK_CONVERSATIONS as any[]);
  const [selectedConvId, setSelectedConvId] = useState<string>(MOCK_CONVERSATIONS[0]?.id || "");
  const [messagesMap, setMessagesMap] = useState<Record<string, ChatMessage[]>>(MOCK_MESSAGES as any);
  const [filterMode, setFilterMode] = useState<"ALL" | "AI_HANDLING" | "HUMAN_NEEDED" | "UNREAD">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [inputText, setInputText] = useState("");
  const [isAiGenerating, setIsAiGenerating] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeConversation = useMemo(() => {
    return conversations.find((c) => c.id === selectedConvId) || conversations[0];
  }, [conversations, selectedConvId]);

  const activeMessages = useMemo(() => {
    return (selectedConvId && messagesMap[selectedConvId]) || [];
  }, [messagesMap, selectedConvId]);

  const filteredConversations = useMemo(() => {
    return conversations.filter((conv) => {
      const matchesSearch = conv.contact.name.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;
      if (filterMode === "AI_HANDLING") return conv.handlingStatus === "AI_HANDLING";
      if (filterMode === "HUMAN_NEEDED") return conv.handlingStatus === "HUMAN_NEEDED";
      if (filterMode === "UNREAD") return conv.unreadCount > 0;
      return true;
    });
  }, [conversations, searchQuery, filterMode]);

  // Auto-sync real-time WhatsApp conversations from Render Bridge
  useEffect(() => {
    const syncLiveChats = async () => {
      try {
        const res = await fetch('/api/whatsapp/conversations');
        if (res.ok) {
          const data = await res.json();
          if (data.conversations && data.conversations.length > 0) {
            setConversations((prev) => {
              const liveIds = new Set(data.conversations.map((c: any) => c.id));
              const nonDuplicatePrev = prev.filter((c) => !liveIds.has(c.id));
              return [...data.conversations, ...nonDuplicatePrev];
            });

            // Update messages map
            setMessagesMap((prev) => {
              const updated = { ...prev };
              data.conversations.forEach((c: any) => {
                if (c.messages && c.messages.length > 0) {
                  updated[c.id] = c.messages.map((m: any) => ({
                    id: m.id,
                    conversationId: c.id,
                    sender: m.sender === 'user' ? 'customer' : 'ai',
                    text: m.text,
                    timestamp: new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    status: 'read',
                  }));
                }
              });
              return updated;
            });
          }
        }
      } catch (err) {
        console.log('Syncing WhatsApp inbox...');
      }
    };

    syncLiveChats();
    const interval = setInterval(syncLiveChats, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeMessages, isAiGenerating]);

  const toggleHandlingStatus = (convId: string) => {
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === convId) {
          const newStatus: HandlingStatus = c.handlingStatus === "AI_HANDLING" ? "HUMAN_NEEDED" : "AI_HANDLING";
          return { ...c, handlingStatus: newStatus };
        }
        return c;
      })
    );
  };

  const handleSendMessage = () => {
    if (!inputText.trim() || !selectedConvId) return;

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      conversationId: selectedConvId,
      sender: "agent",
      senderName: "Tú",
      text: inputText,
      timestamp: "Ahora",
      status: "delivered",
    };

    setMessagesMap((prev) => ({
      ...prev,
      [selectedConvId]: [...(prev[selectedConvId] || []), newMsg],
    }));

    setInputText("");
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] w-full overflow-hidden bg-white text-slate-900 font-sans border-t border-slate-200 fade-in">
      
      {/* LEFT SIDEBAR */}
      <aside className="flex flex-col w-full md:w-[380px] border-r border-slate-200 bg-slate-50 shrink-0">
        <div className="p-4 border-b border-slate-200/70 space-y-3">
          <h1 className="text-base font-semibold text-slate-900 flex items-center gap-2"><Bot className="w-5 h-5 text-indigo-400" /> Bandeja de Conversaciones</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <Input type="text" placeholder="Buscar chat..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 bg-slate-50 border-slate-200 text-xs h-9 text-slate-900" />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto text-xs">
            <button onClick={() => setFilterMode("ALL")} className={`px-3 py-1 rounded-md ${filterMode === "ALL" ? "bg-slate-100 text-slate-900" : "text-slate-500"}`}>Todos</button>
            <button onClick={() => setFilterMode("AI_HANDLING")} className={`px-3 py-1 rounded-md ${filterMode === "AI_HANDLING" ? "bg-indigo-500/20 text-indigo-300" : "text-slate-500"}`}>IA</button>
            <button onClick={() => setFilterMode("HUMAN_NEEDED")} className={`px-3 py-1 rounded-md ${filterMode === "HUMAN_NEEDED" ? "bg-rose-500/20 text-rose-300" : "text-slate-500"}`}>Humanos</button>
          </div>
        </div>

        <ScrollArea className="flex-1 divide-y divide-zinc-800/40">
          {filteredConversations.map((conv) => (
            <div key={conv.id} onClick={() => setSelectedConvId(conv.id)} className={`p-4 flex gap-3 cursor-pointer transition-all border-l-2 ${conv.id === selectedConvId ? "bg-slate-100 border-l-indigo-500" : "border-l-transparent hover:bg-slate-100"}`}>
              <Avatar className="w-10 h-10 border border-slate-200/80 bg-slate-100 shrink-0">
                <AvatarFallback className="bg-indigo-900 text-indigo-200 text-xs font-bold">{conv.contact.name.substring(0,2)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-xs text-slate-900 truncate">{conv.contact.name}</span>
                  <span className="text-[10px] text-slate-400">{conv.lastMessage.timestamp}</span>
                </div>
                <p className="text-xs text-slate-500 truncate">{conv.lastMessage.text}</p>
                <div className="mt-2 flex gap-1">
                  {conv.handlingStatus === "AI_HANDLING" ? (
                    <Badge variant="outline" className="px-2 py-0.5 text-[9px] bg-indigo-500/10 text-indigo-300 border-indigo-500/30">AI_HANDLING</Badge>
                  ) : (
                    <Badge variant="outline" className="px-2 py-0.5 text-[9px] bg-rose-500/15 text-rose-300 border-rose-500/40">HUMAN_NEEDED</Badge>
                  )}
                </div>
              </div>
            </div>
          ))}
        </ScrollArea>
      </aside>

      {/* RIGHT CHAT AREA */}
      {activeConversation && (
        <main className="flex-1 flex flex-col h-full bg-white relative">
          <header className="h-16 px-6 border-b border-slate-200 bg-slate-50 flex items-center justify-between z-10">
            <div className="flex items-center gap-3">
              <h2 className="text-sm font-semibold text-slate-900">{activeConversation.contact.name}</h2>
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px]">WhatsApp</Badge>
            </div>
            <Button size="sm" variant="outline" onClick={() => toggleHandlingStatus(activeConversation.id)} className={`text-xs h-8 ${activeConversation.handlingStatus === "AI_HANDLING" ? "bg-indigo-500/15 text-indigo-300 border-indigo-500/30" : "bg-rose-500/20 text-rose-300 border-rose-500/40"}`}>
              {activeConversation.handlingStatus === "AI_HANDLING" ? "Pilot IA Activo (Pausar)" : "Humano (Activar IA)"}
            </Button>
          </header>

          <ScrollArea className="flex-1 px-4 lg:px-8 py-6">
            <div className="max-w-3xl mx-auto space-y-4 pb-4">
              {activeMessages.map((msg) => {
                const isUser = msg.sender === "user";
                return (
                  <div key={msg.id} className={`flex flex-col max-w-[75%] ${isUser ? "items-start self-start" : "items-end self-end ml-auto"}`}>
                    <div className="text-[10px] text-slate-400 mb-1 px-1">{isUser ? activeConversation.contact.name : msg.senderName || "Asesor"}</div>
                    <div className={`px-4 py-3 rounded-2xl text-sm shadow-md ${isUser ? "bg-slate-50 border border-slate-200 text-slate-900 rounded-bl-sm" : "bg-emerald-950/70 border border-emerald-600/40 text-emerald-50 rounded-br-sm"}`}>
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                      <div className="text-right mt-1 text-[9px] text-slate-500 opacity-70">{msg.timestamp}</div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          <footer className="p-4 border-t border-slate-200 bg-slate-50">
            <div className="max-w-3xl mx-auto flex items-center gap-2 bg-white p-2 rounded-xl border border-slate-200">
              <Input value={inputText} onChange={(e) => setInputText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} placeholder="Escribe un mensaje al cliente..." className="border-0 bg-transparent focus-visible:ring-0 text-sm h-10" />
              <Button onClick={handleSendMessage} className="h-10 w-10 shrink-0 bg-emerald-600 hover:bg-emerald-500 rounded-lg"><Send className="w-4 h-4" /></Button>
            </div>
          </footer>
        </main>
      )}
    </div>
  );
}


