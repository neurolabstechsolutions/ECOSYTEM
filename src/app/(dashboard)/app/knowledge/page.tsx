"use client";

import React, { useState } from "react";
import { FileText, Upload, CheckCircle2, Clock, AlertCircle, RefreshCw, Database, Layers, Filter, Search, Eye, Download, Trash2, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MOCK_KNOWLEDGE, KnowledgeDocument } from "@/lib/mocks";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";

export default function KnowledgePage() {
  const [documents, setDocuments] = useState<KnowledgeDocument[]>(MOCK_KNOWLEDGE as any);
  const [searchTerm, setSearchTerm] = useState("");
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  const filteredDocs = documents.filter(d => d.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-4">
      {/* ─── Compact Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-zinc-200/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-zinc-900 tracking-tight">Base de Conocimiento & RAG</h1>
            <Badge variant="outline" className="text-xs bg-zinc-100 text-zinc-700 font-semibold rounded-md border-zinc-200">
              {filteredDocs.length} Documentos
            </Badge>
          </div>
          <p className="text-xs text-zinc-500 mt-0.5">Repositorio semántico para entrenamiento del Agente IA y respuestas comerciales</p>
        </div>

        <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="h-8 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold rounded-lg px-3 gap-1.5 shadow-xs">
              <Plus className="w-3.5 h-3.5" />
              <span>Subir Documento</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md bg-white">
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-zinc-900">Subir Archivo de Entrenamiento</DialogTitle>
              <DialogDescription className="text-xs text-zinc-500">Agrega un PDF o documento para indexar en la base de datos.</DialogDescription>
            </DialogHeader>
            <div className="py-8 text-center border-2 border-dashed border-zinc-200 rounded-lg text-xs text-zinc-500">
              <Upload className="w-8 h-8 text-zinc-400 mx-auto mb-2" />
              <p className="font-medium">Arrastra y suelta tu archivo PDF aquí o haz clic para examinar</p>
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsUploadOpen(false)} className="h-8 text-xs">
                Cancelar
              </Button>
              <Button 
                onClick={() => {
                  toast.success("Documento indexado con éxito en la base de datos");
                  setIsUploadOpen(false);
                }} 
                size="sm" 
                className="h-8 bg-zinc-900 text-white text-xs font-semibold"
              >
                Iniciar Indexación
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* ─── Search Bar ─── */}
      <div className="relative max-w-sm">
        <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-zinc-400" />
        <Input 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar documento o manual..."
          className="h-8 pl-8 text-xs border-zinc-200 bg-white rounded-lg focus-visible:ring-zinc-900"
        />
      </div>

      {/* ─── Compact Table View ─── */}
      <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-semibold">
              <tr>
                <th className="py-2.5 px-3">Documento</th>
                <th className="py-2.5 px-3">Formato</th>
                <th className="py-2.5 px-3">Tamaño</th>
                <th className="py-2.5 px-3">Última Indexación</th>
                <th className="py-2.5 px-3">Estado RAG</th>
                <th className="py-2.5 px-3 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filteredDocs.map((doc, idx) => (
                <tr key={idx} className="hover:bg-zinc-50/80 transition-colors">
                  <td className="py-2.5 px-3 font-semibold text-zinc-900">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-zinc-400" />
                      <span>{doc.name}</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-3 font-mono text-[11px] text-zinc-600">
                    {doc.type}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-[11px] text-zinc-600">
                    {doc.size}
                  </td>
                  <td className="py-2.5 px-3 text-zinc-500 text-[11px]">
                    {new Date(doc.updatedAt).toLocaleDateString('es-CO')}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                      <span>PROCESADO</span>
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <Button variant="outline" size="sm" className="h-7 text-[11px] border-zinc-200 px-2">
                      Ver Chunks
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
