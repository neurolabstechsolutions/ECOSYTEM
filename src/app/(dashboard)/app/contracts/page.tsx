'use client'

import React, { useState, useMemo } from 'react'
import {
  FileText, Building2, CheckCircle2, Clock, Download, Search,
  ShieldCheck, Eye, SlidersHorizontal, FileCheck2, DollarSign,
  Calendar, ExternalLink, Filter, Check, Copy, AlertCircle,
  Users, Car, MapPin, Phone, Mail, UserCheck, Scale
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'

interface ContractItem {
  id: string
  contractNumber: string
  clientName: string
  clientNit: string
  clientType: 'PERSONA_NATURAL' | 'PERSONA_JURIDICA'
  assetTitle: string
  assetCategory: 'VEHICULO' | 'MOTO' | 'INMUEBLE' | 'SOFTWARE'
  assetPriceCop: string
  commissionRate: string
  commissionCop: string
  brokerageAgency: string
  signedAt: string
  sha256Hash: string
  status: 'VIGENTE' | 'PENDIENTE_FIRMA' | 'LIQUIDADO'
  city: string
}

const INITIAL_CONTRACTS: ContractItem[] = [
  {
    id: 'ct-001',
    contractNumber: 'CT-2026-089',
    clientName: 'Carlos Mendoza Restrepo',
    clientNit: 'CC 1.143.829.401',
    clientType: 'PERSONA_NATURAL',
    assetTitle: 'Toyota Fortuner GR-S 2024 (Placa LMN-456)',
    assetCategory: 'VEHICULO',
    assetPriceCop: '$310.000.000 COP',
    commissionRate: '3.5%',
    commissionCop: '$10.850.000 COP',
    brokerageAgency: 'YJD TRINOVA S.A.S. (NIT 902.095.222-8)',
    signedAt: '01/09/2026 · 10:14 AM',
    sha256Hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    status: 'VIGENTE',
    city: 'Barranquilla'
  },
  {
    id: 'ct-002',
    contractNumber: 'CT-2026-088',
    clientName: 'Carolina Gómez V.',
    clientNit: 'CC 32.890.112',
    clientType: 'PERSONA_NATURAL',
    assetTitle: 'Penthouse Dúplex Alto Prado 240m²',
    assetCategory: 'INMUEBLE',
    assetPriceCop: '$850.000.000 COP',
    commissionRate: '3.0%',
    commissionCop: '$25.500.000 COP',
    brokerageAgency: 'YJD TRINOVA S.A.S. (NIT 902.095.222-8)',
    signedAt: '31/08/2026 · 04:30 PM',
    sha256Hash: 'a8f5f167f44f4964e6c998dee827110c',
    status: 'VIGENTE',
    city: 'Barranquilla'
  },
  {
    id: 'ct-003',
    contractNumber: 'CT-2026-087',
    clientName: 'David Silva R.',
    clientNit: 'CC 1.045.789.231',
    clientType: 'PERSONA_NATURAL',
    assetTitle: 'Yamaha MT-09 SP 890cc 2024',
    assetCategory: 'MOTO',
    assetPriceCop: '$68.500.000 COP',
    commissionRate: '4.0%',
    commissionCop: '$2.740.000 COP',
    brokerageAgency: 'YJD TRINOVA S.A.S. (NIT 902.095.222-8)',
    signedAt: '30/08/2026 · 11:20 AM',
    sha256Hash: 'b4c9e8312015f629c488a032d8b19e2f',
    status: 'LIQUIDADO',
    city: 'Barranquilla'
  }
];

export default function ContractsManagementPage() {
  const [contracts, setContracts] = useState<ContractItem[]>(INITIAL_CONTRACTS)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [selectedContract, setSelectedContract] = useState<ContractItem | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  const filteredContracts = useMemo(() => {
    return contracts.filter(item => {
      const matchesSearch = 
        item.contractNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.assetTitle.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [contracts, searchQuery, statusFilter])

  return (
    <div className="space-y-4">
      {/* ─── Compact Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-zinc-200/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-zinc-900 tracking-tight">Contratos & Mandatos de Corretaje</h1>
            <Badge variant="outline" className="text-xs bg-zinc-100 text-zinc-700 font-semibold rounded-md border-zinc-200">
              {filteredContracts.length} Contratos
            </Badge>
          </div>
          <p className="text-xs text-zinc-500 mt-0.5">Sello notarial digital SHA-256 con validez jurídica mercantil</p>
        </div>
      </div>

      {/* ─── Compact Search & Filters ─── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 text-xs">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-zinc-400" />
          <Input 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar contrato, propietario o vehículo..."
            className="h-8 pl-8 text-xs border-zinc-200 bg-white rounded-lg focus-visible:ring-zinc-900"
          />
        </div>

        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: "ALL", label: "Todos" },
            { id: "VIGENTE", label: "Vigentes" },
            { id: "LIQUIDADO", label: "Liquidados" },
            { id: "PENDIENTE_FIRMA", label: "Pendientes" },
          ].map(st => (
            <button
              key={st.id}
              type="button"
              onClick={() => setStatusFilter(st.id)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium whitespace-nowrap transition-colors ${statusFilter === st.id ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'}`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Compact Table View ─── */}
      <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-semibold">
              <tr>
                <th className="py-2.5 px-3">Nº Contrato</th>
                <th className="py-2.5 px-3">Propietario / Mandante</th>
                <th className="py-2.5 px-3">Bien en Consignación</th>
                <th className="py-2.5 px-3">Precio COP</th>
                <th className="py-2.5 px-3">Comisión</th>
                <th className="py-2.5 px-3">Sello SHA-256</th>
                <th className="py-2.5 px-3">Estado</th>
                <th className="py-2.5 px-3 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filteredContracts.map(c => (
                <tr key={c.id} className="hover:bg-zinc-50/80 transition-colors">
                  <td className="py-2.5 px-3 font-mono font-bold text-zinc-900">
                    {c.contractNumber}
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="font-semibold text-zinc-800">{c.clientName}</div>
                    <div className="text-[10px] text-zinc-400 font-mono">{c.clientNit}</div>
                  </td>
                  <td className="py-2.5 px-3 text-zinc-700">
                    <div className="font-medium line-clamp-1">{c.assetTitle}</div>
                    <div className="text-[10px] text-zinc-400">{c.city}</div>
                  </td>
                  <td className="py-2.5 px-3 font-mono font-bold text-zinc-900 text-[11px]">
                    {c.assetPriceCop}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-[11px] text-emerald-700 font-semibold">
                    {c.commissionCop} ({c.commissionRate})
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      <ShieldCheck className="h-3 w-3 text-emerald-600" />
                      <span>{c.sha256Hash.substring(0, 10)}...</span>
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      c.status === 'VIGENTE' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                      c.status === 'LIQUIDADO' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                      'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <Button 
                      onClick={() => { setSelectedContract(c); setIsDetailOpen(true); }}
                      variant="outline" 
                      size="sm" 
                      className="h-7 text-[11px] border-zinc-200 px-2"
                    >
                      Ver PDF
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── Modal: Ver Detalle del Contrato ─── */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-zinc-900">
              Contrato {selectedContract?.contractNumber}
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-500">
              Certificado de corretaje mercantil firmado digitalmente
            </DialogDescription>
          </DialogHeader>

          {selectedContract && (
            <div className="space-y-3 pt-2 text-xs">
              <div className="p-3 rounded-lg bg-zinc-50 border border-zinc-200 space-y-1.5 font-mono text-[11px]">
                <div className="flex justify-between text-zinc-600">
                  <span>Propietario:</span>
                  <span className="font-bold text-zinc-900">{selectedContract.clientName}</span>
                </div>
                <div className="flex justify-between text-zinc-600">
                  <span>Bien:</span>
                  <span className="text-zinc-900">{selectedContract.assetTitle}</span>
                </div>
                <div className="flex justify-between text-zinc-600">
                  <span>Precio de Venta:</span>
                  <span className="font-bold text-zinc-900">{selectedContract.assetPriceCop}</span>
                </div>
                <div className="flex justify-between text-zinc-600">
                  <span>Comisión Pactada:</span>
                  <span className="text-emerald-700 font-bold">{selectedContract.commissionCop}</span>
                </div>
                <div className="flex justify-between text-zinc-600">
                  <span>Fecha de Firma:</span>
                  <span className="text-zinc-900">{selectedContract.signedAt}</span>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-zinc-100 border border-zinc-200 text-[10px] font-mono break-all text-zinc-600 space-y-1">
                <span className="font-bold text-zinc-800 block">Firma Criptográfica SHA-256:</span>
                <span>{selectedContract.sha256Hash}</span>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button size="sm" variant="outline" onClick={() => setIsDetailOpen(false)} className="h-8 text-xs">
                  Cerrar
                </Button>
                <Button 
                  size="sm" 
                  onClick={() => toast.success("Descargando PDF del Contrato firmado...")}
                  className="h-8 text-xs bg-zinc-900 text-white gap-1.5"
                >
                  <Download className="h-3 w-3" />
                  <span>Descargar Copia Legal</span>
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
