'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  Building2, FileText, Users, Car, DollarSign, TrendingUp,
  ShieldCheck, Download, Search, Eye, CheckCircle2, Clock,
  ExternalLink, MapPin, Phone, Mail, UserCheck, CreditCard,
  Receipt, Scale, ArrowUpRight, Check, Copy, SlidersHorizontal,
  ChevronRight, ArrowRight, Briefcase, Layers, QrCode,
  Smartphone, RefreshCw, MessageSquare, Unplug, Shield
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
  DialogFooter
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { WhatsAppQRButton } from '@/components/whatsapp-qr-button'

interface BrokerageContract {
  id: string
  code: string
  providerName: string
  providerType: 'Persona Jurídica' | 'Persona Natural'
  legalName: string
  taxId: string
  city: string
  commissionRate: number
  vehicleCount: number
  totalAssetValueCop: number
  signedAt: string
  status: 'VIGENTE' | 'EN_REVISION'
  signatureHash: string
  signerName: string
  signerRole: string
  signerEmail: string
  signerPhone: string
}

interface ClientSaleContract {
  id: string
  code: string
  buyerName: string
  buyerId: string
  buyerAddress: string
  buyerPhone: string
  buyerEmail: string
  vehicleName: string
  vehicleSku: string
  agreedPriceCop: number
  depositAmountCop: number
  commissionAmountCop: number
  commissionPercentage: number
  signedAt: string
  status: 'PAGADO_Y_CERRADO' | 'ANTICIPO_DEPOSITADO' | 'EN_FIRMA'
  paymentMethod: string
  signatureHash: string
}

const MOCK_BROKERAGE: BrokerageContract[] = [
  {
    id: 'cnt-101',
    code: 'TRN-CORR-2026-001',
    providerName: 'Carlos Mendoza Restrepo (Particular)',
    providerType: 'Persona Natural',
    legalName: 'Carlos Mendoza Restrepo',
    taxId: 'CC 1.143.829.401',
    city: 'Barranquilla, Atlántico',
    commissionRate: 3.5,
    vehicleCount: 1,
    totalAssetValueCop: 310000000,
    signedAt: '01/09/2026',
    status: 'VIGENTE',
    signatureHash: 'sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    signerName: 'Carlos Mendoza',
    signerRole: 'Propietario Particular',
    signerEmail: 'c.mendoza@gmail.com',
    signerPhone: '+57 318 4509988'
  },
  {
    id: 'cnt-102',
    code: 'TRN-CORR-2026-002',
    providerName: 'Carolina Gómez V. (Inmueble)',
    providerType: 'Persona Natural',
    legalName: 'Carolina Gómez Villa',
    taxId: 'CC 32.890.112',
    city: 'Barranquilla, Atlántico',
    commissionRate: 3.0,
    vehicleCount: 1,
    totalAssetValueCop: 850000000,
    signedAt: '31/08/2026',
    status: 'VIGENTE',
    signatureHash: 'sha256:88d4266fd4e6338d13b845fcf289579d209c897823b9217da3e161936f031589',
    signerName: 'Carolina Gómez',
    signerRole: 'Propietaria Inmueble',
    signerEmail: 'caro.gomez@empresa.co',
    signerPhone: '+57 301 2293400'
  },
  {
    id: 'cnt-103',
    code: 'TRN-CORR-2026-003',
    providerName: 'David Silva R. (Moto)',
    providerType: 'Persona Natural',
    legalName: 'David Silva Rodríguez',
    taxId: 'CC 1.045.789.231',
    city: 'Barranquilla, Atlántico',
    commissionRate: 4.0,
    vehicleCount: 1,
    totalAssetValueCop: 68500000,
    signedAt: '30/08/2026',
    status: 'VIGENTE',
    signatureHash: 'sha256:4918237198237192837bcda192837192837192837bcda192837192837bcda192',
    signerName: 'David Silva',
    signerRole: 'Propietario Moto',
    signerEmail: 'david.silva@outlook.com',
    signerPhone: '+57 320 8941122'
  }
]

const MOCK_SALES: ClientSaleContract[] = [
  {
    id: 'cli-cnt-201',
    code: 'CV-TRN-2026-089',
    buyerName: 'Ing. Mauricio Cantillo',
    buyerId: 'CC 1.140.892.110',
    buyerAddress: 'Calle 85 # 51B - 32, Barranquilla, Atlántico',
    buyerPhone: '+57 300 5765530',
    buyerEmail: 'mauricio.cantillo@constructora.co',
    vehicleName: 'Toyota Fortuner GR-S 2024 (Placa LMN-456)',
    vehicleSku: 'TOY-FTN-2024',
    agreedPriceCop: 310000000,
    depositAmountCop: 20000000,
    commissionAmountCop: 10850000,
    commissionPercentage: 3.5,
    signedAt: '01/09/2026 11:20:45',
    status: 'ANTICIPO_DEPOSITADO',
    paymentMethod: 'Transferencia Bancaria Bancolombia',
    signatureHash: 'sha256:7c9e0d11f92e8a716c5b91b920e817bc16298ef918237ca0291937e28918274a'
  },
  {
    id: 'cli-cnt-202',
    code: 'CV-TRN-2026-090',
    buyerName: 'Dra. Patricia Ortiz',
    buyerId: 'CC 55.491.233',
    buyerAddress: 'Carrera 58 # 84 - 120, Barranquilla',
    buyerPhone: '+57 310 4492011',
    buyerEmail: 'patricia.ortiz@salud.org',
    vehicleName: 'Penthouse Dúplex Alto Prado 240m²',
    vehicleSku: 'INM-PRD-240',
    agreedPriceCop: 850000000,
    depositAmountCop: 85000000,
    commissionAmountCop: 25500000,
    commissionPercentage: 3.0,
    signedAt: '31/08/2026 16:45:10',
    status: 'EN_FIRMA',
    paymentMethod: 'Crédito Hipotecario Aprobado',
    signatureHash: 'sha256:9281938a19283bc9192837192837192837bcda192837192837192837bcda1928'
  }
]

export default function TrinovaDedicatedAdminPage() {
  const params = useParams()
  const domain = (params?.domain as string) || 'yjdtrinova'
  const [activeTab, setActiveTab] = useState('whatsapp')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSale, setSelectedSale] = useState<ClientSaleContract | null>(null)
  const [selectedBrokerage, setSelectedBrokerage] = useState<BrokerageContract | null>(null)

  // WhatsApp Live QR State from Render Service
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<'SCAN_QR' | 'CONNECTED' | 'LOADING'>('LOADING')
  const [connectedNumber, setConnectedNumber] = useState<string | null>(null)
  const [isLoadingQR, setIsLoadingQR] = useState(false)

  const RENDER_SERVICE_URL = "https://ecosytem.onrender.com"

  const checkStatusAndQR = async () => {
    try {
      // 1. Direct status check
      const statusRes = await fetch(`${RENDER_SERVICE_URL}/status`, { cache: 'no-store' })
      if (statusRes.ok) {
        const statusData = await statusRes.json()
        if (statusData.connected) {
          setConnectionStatus("CONNECTED")
          setConnectedNumber(statusData.number || "573235845145")
          return
        }
      }

      // 2. Fetch live QR Code
      setIsLoadingQR(true)
      const qrRes = await fetch(`${RENDER_SERVICE_URL}/qr`, { cache: 'no-store' })
      if (qrRes.ok) {
        const qrData = await qrRes.json()
        if (qrData.qr) {
          setQrDataUrl(qrData.qr.startsWith('data:') ? qrData.qr : `data:image/png;base64,${qrData.qr}`)
          setConnectionStatus("SCAN_QR")
        }
      }
    } catch (err) {
      try {
        const proxyRes = await fetch('/api/whatsapp/qr', { cache: 'no-store' })
        if (proxyRes.ok) {
          const proxyData = await proxyRes.json()
          if (proxyData.phone) {
            setConnectedNumber(proxyData.phone)
            setConnectionStatus("CONNECTED")
          } else if (proxyData.qr) {
            setQrDataUrl(proxyData.qr.startsWith('data:') ? proxyData.qr : `data:image/png;base64,${proxyData.qr}`)
            setConnectionStatus("SCAN_QR")
          }
        }
      } catch (e) {}
    } finally {
      setIsLoadingQR(false)
    }
  }

  useEffect(() => {
    checkStatusAndQR()
    const interval = setInterval(checkStatusAndQR, 5000)
    return () => clearInterval(interval)
  }, [])

  const handleDisconnect = async () => {
    if (!window.confirm("¿Seguro que deseas desvincular la línea actual de WhatsApp de Render?")) return
    try {
      await fetch(`${RENDER_SERVICE_URL}/disconnect`, { method: "POST" })
      setConnectionStatus("SCAN_QR")
      setConnectedNumber(null)
      setQrDataUrl(null)
      toast.success("WhatsApp desvinculado. Listo para escanear nuevo código.")
      checkStatusAndQR()
    } catch (e) {
      toast.error("Error al desvincular")
    }
  }

  const totalCommissionsCop = MOCK_SALES.reduce((acc, s) => acc + s.commissionAmountCop, 0)
  const totalAssetsConsignedCop = MOCK_BROKERAGE.reduce((acc, b) => acc + b.totalAssetValueCop, 0)

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 flex flex-col font-sans">
      {/* ─── Top Navbar Dedicado para YJD TRINOVA S.A.S. ─── */}
      <header className="bg-white border-b border-zinc-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              YT
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-zinc-900 text-sm tracking-tight">YJD TRINOVA S.A.S.</span>
                <span className="text-[10px] font-mono text-zinc-500 font-bold bg-zinc-100 px-1.5 py-0.2 rounded">NIT 902.095.222-8</span>
              </div>
              <p className="text-[10px] text-zinc-400">Portal de Administración & Control Comercial</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <WhatsAppQRButton variant="header" />

            <Link href="/" className="text-zinc-600 hover:text-zinc-900 font-medium flex items-center gap-1 bg-zinc-100 hover:bg-zinc-200 px-2.5 py-1 rounded-lg transition-colors text-xs">
              <ExternalLink className="w-3 h-3" />
              <span className="hidden sm:inline">Ver Marketplace</span>
            </Link>

            <Link href="/app" className="bg-zinc-900 hover:bg-zinc-800 text-white font-semibold px-2.5 py-1 rounded-lg transition-colors text-xs flex items-center gap-1">
              <span>Superadmin</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </header>

      {/* ─── Main Content ─── */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-4 md:p-6 space-y-4">
        {/* ─── Compact Metrics Bar ─── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
          <div className="bg-white border border-zinc-200 rounded-xl p-3 shadow-xs space-y-1">
            <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Estado WhatsApp (Render)</span>
            <div className="flex items-baseline justify-between">
              <span className={`text-base font-black font-mono ${connectionStatus === 'CONNECTED' ? 'text-emerald-700' : 'text-amber-600'}`}>
                {connectionStatus === 'CONNECTED' ? 'ONLINE 24/7' : 'ESPERANDO QR'}
              </span>
              <span className={`w-2 h-2 rounded-full ${connectionStatus === 'CONNECTED' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`} />
            </div>
            <p className="text-[10px] text-zinc-400 font-mono">+{connectedNumber || '573235845145'}</p>
          </div>

          <div className="bg-white border border-zinc-200 rounded-xl p-3 shadow-xs space-y-1">
            <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Mandatos de Corretaje</span>
            <div className="flex items-baseline justify-between">
              <span className="text-xl font-black text-zinc-900 font-mono">{MOCK_BROKERAGE.length}</span>
              <span className="text-[11px] font-semibold text-emerald-600">Firmados</span>
            </div>
            <p className="text-[10px] text-zinc-400">Validez mercantil notarial</p>
          </div>

          <div className="bg-white border border-zinc-200 rounded-xl p-3 shadow-xs space-y-1">
            <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Bienes en Consignación</span>
            <div className="flex items-baseline justify-between">
              <span className="text-xl font-black text-zinc-900 font-mono">${(totalAssetsConsignedCop / 1000000).toFixed(0)}M</span>
              <span className="text-[11px] font-semibold text-zinc-500">COP</span>
            </div>
            <p className="text-[10px] text-zinc-400">Autos, motos e inmuebles</p>
          </div>

          <div className="bg-white border border-zinc-200 rounded-xl p-3 shadow-xs space-y-1">
            <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Comisiones Pactadas</span>
            <div className="flex items-baseline justify-between">
              <span className="text-xl font-black text-emerald-700 font-mono">${(totalCommissionsCop / 1000000).toFixed(1)}M</span>
              <span className="text-[11px] font-semibold text-emerald-600 font-mono">COP</span>
            </div>
            <p className="text-[10px] text-zinc-400">3.0% a 4.0% por intermediación</p>
          </div>
        </div>

        {/* ─── Tabs Navigation ─── */}
        <Tabs defaultValue="whatsapp" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="bg-white border border-zinc-200 p-1 rounded-xl h-auto flex flex-wrap gap-1">
            <TabsTrigger value="whatsapp" className="data-[state=active]:bg-zinc-900 data-[state=active]:text-white text-xs py-1.5 px-3 rounded-lg gap-1.5 font-semibold">
              <QrCode className="w-3.5 h-3.5" />
              <span>WhatsApp Render (QR Fijo)</span>
            </TabsTrigger>
            <TabsTrigger value="brokerage" className="data-[state=active]:bg-zinc-900 data-[state=active]:text-white text-xs py-1.5 px-3 rounded-lg gap-1.5 font-semibold">
              <FileText className="w-3.5 h-3.5" />
              <span>Contratos de Corretaje ({MOCK_BROKERAGE.length})</span>
            </TabsTrigger>
            <TabsTrigger value="sales" className="data-[state=active]:bg-zinc-900 data-[state=active]:text-white text-xs py-1.5 px-3 rounded-lg gap-1.5 font-semibold">
              <Receipt className="w-3.5 h-3.5" />
              <span>Contratos de Compraventa ({MOCK_SALES.length})</span>
            </TabsTrigger>
            <TabsTrigger value="clients" className="data-[state=active]:bg-zinc-900 data-[state=active]:text-white text-xs py-1.5 px-3 rounded-lg gap-1.5 font-semibold">
              <Users className="w-3.5 h-3.5" />
              <span>Clientes & Contactos</span>
            </TabsTrigger>
          </TabsList>

          {/* ════ TAB 1: WHATSAPP QR FIJO (RENDER SERVICE) ════ */}
          <TabsContent value="whatsapp" className="space-y-4 outline-none">
            <div className="bg-white border border-zinc-200 rounded-xl p-4 sm:p-6 shadow-xs">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-zinc-100">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-zinc-900">Integración Fija de WhatsApp (Render Socket $7/mes)</h2>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      connectionStatus === 'CONNECTED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {connectionStatus === 'CONNECTED' ? 'CONECTADO 24/7' : 'REQUIERE ESCANEO'}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 mt-1">
                    La administradora titular (Yury Jaramillo) escanea este código desde su WhatsApp para mantener la IA atendiendo y cotizando sin interrupciones.
                  </p>
                </div>

                <Button 
                  onClick={checkStatusAndQR}
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs border-zinc-200 gap-1.5 shrink-0"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingQR ? 'animate-spin' : ''}`} />
                  <span>Actualizar Conexión</span>
                </Button>
              </div>

              {/* QR Scanner Display Box */}
              <div className="py-6 flex flex-col md:flex-row items-center justify-center gap-8">
                {connectionStatus !== 'CONNECTED' ? (
                  <>
                    <div className="p-3 bg-white border-2 border-emerald-500 rounded-2xl shadow-md text-center">
                      {qrDataUrl ? (
                        <img 
                          src={qrDataUrl} 
                          alt="Código QR WhatsApp" 
                          className="w-56 h-56 rounded-xl mx-auto"
                        />
                      ) : (
                        <div className="w-56 h-56 bg-zinc-50 rounded-xl flex flex-col items-center justify-center space-y-2">
                          <RefreshCw className="w-8 h-8 animate-spin text-emerald-600" />
                          <p className="text-xs text-zinc-500 font-medium">Generando QR en Render...</p>
                        </div>
                      )}
                      <span className="text-[10px] text-zinc-400 font-mono mt-2 block">Actualización automática cada 5s</span>
                    </div>

                    <div className="max-w-md space-y-3 text-xs">
                      <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-200 space-y-2">
                        <p className="font-bold text-zinc-900 flex items-center gap-1.5 text-xs">
                          <Smartphone className="w-4 h-4 text-emerald-600" />
                          Instrucciones para escanear desde el celular:
                        </p>
                        <ol className="list-decimal pl-4 space-y-1 text-zinc-600 leading-relaxed">
                          <li>Abre WhatsApp en el celular donde tienes la línea de Trinova.</li>
                          <li>Ve a <strong>Ajustes / Configuración ⚙️</strong> (en iPhone) o los <strong>tres puntos ⋮</strong> (en Android).</li>
                          <li>Toca en <strong>Dispositivos vinculados</strong>.</li>
                          <li>Selecciona <strong>Vincular un dispositivo</strong> y apunta tu cámara al código QR de la izquierda.</li>
                        </ol>
                      </div>

                      <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-800 text-[11px] flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Servidor activo en Render (`ecosytem.onrender.com`). El agente responderá automáticamente cotizaciones y fotos.</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="max-w-md w-full bg-zinc-50 p-6 rounded-2xl border border-zinc-200 text-center space-y-4">
                    <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-xs">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-zinc-900">¡Línea Oficial WhatsApp Conectada!</h3>
                      <p className="text-xs text-zinc-500">El Agente IA de Trinova está operando 24/7.</p>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-zinc-200 text-left text-xs space-y-1.5 font-mono text-[11px]">
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Número Activo:</span>
                        <span className="font-bold text-zinc-900">+{connectedNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Servidor Render:</span>
                        <span className="text-zinc-800 font-semibold">ecosytem.onrender.com ($7 Plan)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Estado:</span>
                        <span className="text-emerald-700 font-bold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Online Activo
                        </span>
                      </div>
                    </div>

                    <Button
                      onClick={handleDisconnect}
                      variant="outline"
                      size="sm"
                      className="w-full h-8 border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold gap-1.5"
                    >
                      <Unplug className="w-3.5 h-3.5" />
                      <span>Desvincular y Escanear Otra Línea</span>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* ════ TAB 2: CONTRATOS DE CORRETAJE ════ */}
          <TabsContent value="brokerage" className="space-y-4 outline-none">
            <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-xs">
              <div className="p-3 bg-zinc-50 border-b border-zinc-200 flex items-center justify-between">
                <h2 className="text-xs font-bold text-zinc-900 uppercase tracking-wide">Mandatos de Corretaje Firmados Digitalmente</h2>
                <Badge variant="outline" className="text-[10px] bg-white text-zinc-700">{MOCK_BROKERAGE.length} Activos</Badge>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-50/50 border-b border-zinc-200 text-zinc-500 font-semibold">
                    <tr>
                      <th className="py-2.5 px-3">Código</th>
                      <th className="py-2.5 px-3">Propietario / Mandante</th>
                      <th className="py-2.5 px-3">Identificación</th>
                      <th className="py-2.5 px-3">Valor Bien (COP)</th>
                      <th className="py-2.5 px-3">Comisión Pactada</th>
                      <th className="py-2.5 px-3">Sello SHA-256</th>
                      <th className="py-2.5 px-3 text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {MOCK_BROKERAGE.map(b => (
                      <tr key={b.id} className="hover:bg-zinc-50/80 transition-colors">
                        <td className="py-2.5 px-3 font-mono font-bold text-zinc-900">{b.code}</td>
                        <td className="py-2.5 px-3 font-semibold text-zinc-800">{b.providerName}</td>
                        <td className="py-2.5 px-3 font-mono text-[11px] text-zinc-500">{b.taxId}</td>
                        <td className="py-2.5 px-3 font-mono font-bold text-zinc-900 text-[11px]">
                          ${b.totalAssetValueCop.toLocaleString('es-CO')} COP
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[11px] text-emerald-700 font-bold">
                          {b.commissionRate}%
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="text-[10px] font-mono text-zinc-500 bg-zinc-100 px-1.5 py-0.5 rounded border border-zinc-200">
                            {b.signatureHash.substring(0, 16)}...
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <Button 
                            onClick={() => { setSelectedBrokerage(b); }}
                            variant="outline" 
                            size="sm" 
                            className="h-7 text-[11px] border-zinc-200 px-2"
                          >
                            Ver Ficha
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* ════ TAB 3: CONTRATOS DE COMPRAVENTA ════ */}
          <TabsContent value="sales" className="space-y-4 outline-none">
            <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-xs">
              <div className="p-3 bg-zinc-50 border-b border-zinc-200 flex items-center justify-between">
                <h2 className="text-xs font-bold text-zinc-900 uppercase tracking-wide">Promesas de Compraventa & Cierres</h2>
                <Badge variant="outline" className="text-[10px] bg-white text-zinc-700">{MOCK_SALES.length} Registradas</Badge>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-50/50 border-b border-zinc-200 text-zinc-500 font-semibold">
                    <tr>
                      <th className="py-2.5 px-3">Nº Contrato</th>
                      <th className="py-2.5 px-3">Comprador</th>
                      <th className="py-2.5 px-3">Bien Negociado</th>
                      <th className="py-2.5 px-3">Precio Acordado COP</th>
                      <th className="py-2.5 px-3">Comisión Trinova</th>
                      <th className="py-2.5 px-3">Estado</th>
                      <th className="py-2.5 px-3 text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {MOCK_SALES.map(s => (
                      <tr key={s.id} className="hover:bg-zinc-50/80 transition-colors">
                        <td className="py-2.5 px-3 font-mono font-bold text-zinc-900">{s.code}</td>
                        <td className="py-2.5 px-3 font-semibold text-zinc-800">{s.buyerName}</td>
                        <td className="py-2.5 px-3 text-zinc-700">{s.vehicleName}</td>
                        <td className="py-2.5 px-3 font-mono font-bold text-zinc-900 text-[11px]">
                          ${s.agreedPriceCop.toLocaleString('es-CO')} COP
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[11px] text-emerald-700 font-bold">
                          ${s.commissionAmountCop.toLocaleString('es-CO')} COP ({s.commissionPercentage}%)
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {s.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <Button 
                            onClick={() => setSelectedSale(s)}
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
          </TabsContent>

          {/* ════ TAB 4: CLIENTES & CONTACTOS ════ */}
          <TabsContent value="clients" className="space-y-4 outline-none">
            <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-xs">
              <div className="p-3 bg-zinc-50 border-b border-zinc-200">
                <h2 className="text-xs font-bold text-zinc-900 uppercase tracking-wide">Directorio de Clientes y Compradores Calificados</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-50/50 border-b border-zinc-200 text-zinc-500 font-semibold">
                    <tr>
                      <th className="py-2.5 px-3">Nombre</th>
                      <th className="py-2.5 px-3">Cédula / NIT</th>
                      <th className="py-2.5 px-3">Teléfono / WhatsApp</th>
                      <th className="py-2.5 px-3">Correo</th>
                      <th className="py-2.5 px-3">Interés Principal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    <tr className="hover:bg-zinc-50/80 transition-colors">
                      <td className="py-2.5 px-3 font-semibold text-zinc-900">Ing. Mauricio Cantillo</td>
                      <td className="py-2.5 px-3 font-mono text-zinc-500">CC 1.140.892.110</td>
                      <td className="py-2.5 px-3 font-mono text-emerald-600">+57 300 5765530</td>
                      <td className="py-2.5 px-3 text-zinc-600">mauricio.cantillo@constructora.co</td>
                      <td className="py-2.5 px-3">Toyota Fortuner 2024</td>
                    </tr>
                    <tr className="hover:bg-zinc-50/80 transition-colors">
                      <td className="py-2.5 px-3 font-semibold text-zinc-900">Dra. Patricia Ortiz</td>
                      <td className="py-2.5 px-3 font-mono text-zinc-500">CC 55.491.233</td>
                      <td className="py-2.5 px-3 font-mono text-emerald-600">+57 310 4492011</td>
                      <td className="py-2.5 px-3 text-zinc-600">patricia.ortiz@salud.org</td>
                      <td className="py-2.5 px-3">Penthouse Alto Prado</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* ─── Modal de Detalle de Corretaje ─── */}
      <Dialog open={!!selectedBrokerage} onOpenChange={() => setSelectedBrokerage(null)}>
        <DialogContent className="max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-zinc-900">
              Mandato de Corretaje {selectedBrokerage?.code}
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-500">
              Mandante: {selectedBrokerage?.providerName}
            </DialogDescription>
          </DialogHeader>

          {selectedBrokerage && (
            <div className="space-y-3 pt-2 text-xs">
              <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-200 font-mono text-[11px] space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Valor del Bien:</span>
                  <span className="font-bold text-zinc-900">${selectedBrokerage.totalAssetValueCop.toLocaleString('es-CO')} COP</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Comisión Pactada:</span>
                  <span className="font-bold text-emerald-700">{selectedBrokerage.commissionRate}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Fecha de Firma:</span>
                  <span className="text-zinc-900">{selectedBrokerage.signedAt}</span>
                </div>
              </div>

              <div className="p-2 bg-zinc-100 rounded text-[10px] font-mono break-all text-zinc-600">
                <span className="font-bold block text-zinc-800">Sello SHA-256:</span>
                {selectedBrokerage.signatureHash}
              </div>

              <DialogFooter className="pt-2">
                <Button size="sm" onClick={() => setSelectedBrokerage(null)} className="h-8 text-xs bg-zinc-900 text-white">
                  Cerrar
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
