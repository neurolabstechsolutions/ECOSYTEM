"use client";

import React, { useState } from "react";
import { FileText, Upload, CheckCircle2, Clock, AlertCircle, RefreshCw, Database, Layers, Sparkles, Filter, Search, Eye, Download, Trash2, MoreVertical } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MOCK_KNOWLEDGE, KnowledgeDocument } from "@/lib/mocks";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

export default function KnowledgePage() {
  const [documents, setDocuments] = useState<KnowledgeDocument[]>(MOCK_KNOWLEDGE as any);
  const [searchTerm, setSearchTerm] = useState("");
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  const filteredDocs = documents.filter(d => d.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PROCESSED": return <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30">PROCESSED</Badge>;
      case "PROCESSING": return <Badge className="bg-cyan-500/15 text-cyan-400 border-cyan-500/30 animate-pulse">PROCESSING</Badge>;
      default: return <Badge className="bg-slate-500/15 text-slate-400 border-slate-500/30">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 p-6 md:p-10 font-sans fade-in">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <div className="flex justify-between items-center bg-slate-50 p-8 rounded-2xl border border-slate-200 shadow-md">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
              Knowledge Base <Sparkles className="w-6 h-6 text-cyan-400" />
            </h1>
            <p className="text-slate-400 text-sm mt-2">Centralized semantic repository for multi-agent reasoning and RAG.</p>
          </div>
          <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
            <DialogTrigger asChild>
              <Button className="bg-cyan-600 hover:bg-cyan-500 text-slate-900 font-semibold">
                <Upload className="w-4 h-4 mr-2" /> Upload Document
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white border-slate-200 text-slate-900">
              <DialogHeader>
                <DialogTitle>Upload Knowledge Document</DialogTitle>
                <DialogDescription>Add a PDF or DOCX to train the AI.</DialogDescription>
              </DialogHeader>
              <div className="py-8 text-center border-2 border-dashed border-slate-200 rounded-lg">
                <Upload className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                <p className="text-sm text-slate-400">Drag & Drop files here</p>
              </div>
              <DialogFooter>
                <Button variant="outline" className="border-slate-200 bg-slate-50">Cancel</Button>
                <Button className="bg-cyan-600">Start Ingestion</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-slate-50 border-slate-200">
            <CardHeader className="pb-2"><CardTitle className="text-xs text-slate-400 uppercase">Indexed Docs</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold">{documents.length}</div></CardContent>
          </Card>
          <Card className="bg-slate-50 border-slate-200">
            <CardHeader className="pb-2"><CardTitle className="text-xs text-slate-400 uppercase">Vector Chunks</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold">12,450</div></CardContent>
          </Card>
        </div>

        <Card className="bg-white border-slate-200">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">Documents List</CardTitle>
              <div className="relative w-72">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <Input value={searchTerm} onChange={(e)=>setSearchTerm(e.target.value)} placeholder="Search..." className="pl-9 bg-slate-50 border-slate-200 text-sm" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader className="bg-slate-50 border-slate-200">
                <TableRow>
                  <TableHead className="text-slate-400">Document Name</TableHead>
                  <TableHead className="text-slate-400">Category</TableHead>
                  <TableHead className="text-slate-400">Status</TableHead>
                  <TableHead className="text-slate-400 text-center">Chunks</TableHead>
                  <TableHead className="text-slate-400">Uploaded</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDocs.map(doc => (
                  <TableRow key={doc.id} className="border-slate-200/50 hover:bg-slate-50">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-rose-400" />
                        <div>
                          <p className="font-semibold text-sm">{doc.name}</p>
                          <p className="text-xs text-slate-500">{doc.size}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell><Badge variant="outline" className="border-slate-700 text-xs">{doc.category}</Badge></TableCell>
                    <TableCell>{getStatusBadge(doc.status)}</TableCell>
                    <TableCell className="text-center font-mono text-xs">{doc.chunksCount}</TableCell>
                    <TableCell className="text-xs text-slate-400">{doc.uploadedAt}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}


