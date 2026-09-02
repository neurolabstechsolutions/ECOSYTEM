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
  Smartphone, RefreshCw, MessageSquare, Unplug, Shield, Menu,
  X, Database, Activity, Terminal
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
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

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
    signatureHash: 'sha256:4918237198237192837bcda192837192837bcda192837192837bcda192837bcda192',
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
  const [activeTab, setActiveTab] = useState<'whatsapp' | 'brokerage' | 'sales' | 'inventory' | 'clients'>('whatsapp')
  const [selectedSale, setSelectedSale] = useState<ClientSaleContract | null>(null)
  const [selectedBrokerage, setSelectedBrokerage] = useState<BrokerageContract | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Real Supabase Inventory
  const supabase = createClient()
  const [dbItems, setDbItems] = useState<any[]>([])
  const [isLoadingInventory, setIsLoadingInventory] = useState(false)

  // WhatsApp Live QR State from Render Service
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<'SCAN_QR' | 'CONNECTED' | 'LOADING' | 'WAKING_UP'>('LOADING')
  const [connectedNumber, setConnectedNumber] = useState<string | null>(null)
  const [isLoadingQR, setIsLoadingQR] = useState(false)

  // Fetch real items from Supabase
  const loadSupabaseInventory = async () => {
    setIsLoadingInventory(true)
    try {
      const { data } = await supabase
        .from('inventory_items')
        .select('*, tenants(name, slug)')
        .order('created_at', { ascending: false })
      if (data) setDbItems(data)
    } catch (e) {
    } finally {
      setIsLoadingInventory(false)
    }
  }

  // Check WhatsApp Socket via Proxy Route
  const checkStatusAndQR = async () => {
    try {
      setIsLoadingQR(true)
      const res = await fetch('/api/whatsapp/qr', { cache: 'no-store' })
      if (res.ok) {
        const data = await res.json()
        if (data.phone || data.status === 'CONNECTED') {
          setConnectionStatus("CONNECTED")
          setConnectedNumber(data.phone || "573235845145")
          return
        }

        if (data.qr) {
          setQrDataUrl(data.qr.startsWith('data:') ? data.qr : `data:image/png;base64,${data.qr}`)
          setConnectionStatus("SCAN_QR")
        } else if (data.status === 'WAKING_UP' || data.status === 'CONNECTING') {
          setConnectionStatus("WAKING_UP")
        } else {
          setConnectionStatus("SCAN_QR")
        }
      }
    } catch (err) {
      setConnectionStatus("SCAN_QR")
    } finally {
      setIsLoadingQR(false)
    }
  }

  useEffect(() => {
    checkStatusAndQR()
    loadSupabaseInventory()
    const interval = setInterval(checkStatusAndQR, 6000)
    return () => clearInterval(interval)
  }, [])

  const handleDisconnect = async () => {
    if (!window.confirm("¿Seguro que deseas desvincular la línea de WhatsApp de Render?")) return
    try {
      await fetch('https://ecosytem.onrender.com/disconnect', { method: "POST" })
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

  const navMenuItems = [
    { id: 'whatsapp', label: 'WhatsApp & Socket Render', icon: QrCode, badge: connectionStatus === 'CONNECTED' ? 'Online' : 'Scan' },
    { id: 'brokerage', label: 'Mandatos de Corretaje', icon: FileText, count: MOCK_BROKERAGE.length },
    { id: 'sales', label: 'Promesas de Compraventa', icon: Receipt, count: MOCK_SALES.length },
    { id: 'inventory', label: 'Inventario en Consignación', icon: Car, count: dbItems.length || 3 },
    { id: 'clients', label: 'Clientes & Compradores', icon: Users, count: 2 },
  ]

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 flex font-sans">
      {/* ─── Left Sidebar (Desktop & Mobile Slide-Over) ─── */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-zinc-200 flex flex-col transition-transform duration-200 ease-in-out
        md:translate-x-0 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-zinc-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              YT
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-zinc-900 text-xs tracking-tight">YJD TRINOVA S.A.S.</span>
              </div>
              <span className="text-[10px] text-zinc-400 font-mono">NIT 902.095.222-8</span>
            </div>
          </div>

          <button 
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            className="md:hidden p-1 text-zinc-400 hover:text-zinc-700 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Sidebar Navigation Links */}
        <div className="flex-1 p-3 space-y-1 overflow-y-auto">
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider px-2 block mb-2">
            Módulos de Gestión
          </span>

          {navMenuItems.map(item => {
            const Icon = item.icon
            const isActive = activeTab === item.id

            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id as any)
                  setMobileMenuOpen(false)
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-zinc-900 text-white shadow-xs'
                    : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </div>

                {item.badge && (
                  <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                    item.badge === 'Online'
                      ? (isActive ? 'bg-emerald-400 text-zinc-950' : 'bg-emerald-50 text-emerald-700 border border-emerald-200')
                      : (isActive ? 'bg-amber-400 text-zinc-950' : 'bg-amber-50 text-amber-700 border border-amber-200')
                  }`}>
                    {item.badge}
                  </span>
                )}

                {item.count !== undefined && !item.badge && (
                  <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                    isActive ? 'bg-zinc-800 text-zinc-300' : 'bg-zinc-100 text-zinc-500'
                  }`}>
                    {item.count}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-zinc-200 space-y-1.5 bg-zinc-50/50">
          <Link
            href="/"
            className="flex items-center justify-between p-2 rounded-lg text-xs text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 font-medium transition-colors"
          >
            <div className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
              <span>Ver Marketplace</span>
            </div>
          </Link>

          <Link
            href="/app"
            className="flex items-center justify-between p-2 rounded-lg text-xs bg-zinc-900 hover:bg-zinc-800 text-white font-semibold shadow-xs transition-colors"
          >
            <div className="flex items-center gap-2">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span>Torre de Control</span>
            </div>
            <ArrowRight className="w-3 h-3 text-zinc-400" />
          </Link>
        </div>
      </aside>

      {/* Backdrop for mobile menu */}
      {mobileMenuOpen && (
        <div 
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/30 z-40 md:hidden backdrop-blur-xs" 
        />
      )}

      {/* ─── Main Content Area on the Right (Offset on Desktop) ─── */}
      <div className="flex-1 md:pl-64 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-14 bg-white border-b border-zinc-200 sticky top-0 z-30 px-3 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-1.5 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg"
              title="Abrir Menú"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div>
              <span className="font-bold text-xs sm:text-sm text-zinc-900">
                {navMenuItems.find(m => m.id === activeTab)?.label}
              </span>
              <p className="text-[10px] text-zinc-400 hidden sm:block">Panel de Administración Trinova</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-semibold ${
              connectionStatus === 'CONNECTED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}>
              <span className={`w-2 h-2 rounded-full ${connectionStatus === 'CONNECTED' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`} />
              <span className="hidden sm:inline">
                {connectionStatus === 'CONNECTED' ? `WhatsApp Online (+${connectedNumber || 'Trinova'})` : 'WhatsApp Pendiente'}
              </span>
              <span className="sm:hidden">
                {connectionStatus === 'CONNECTED' ? 'Online' : 'QR'}
              </span>
            </div>
          </div>
        </header>

        {/* Page Body */}
        <main className="flex-1 p-3 sm:p-5 max-w-6xl w-full mx-auto space-y-4">
          {/* Micro-Metrics Bar */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
            <div className="bg-white border border-zinc-200/90 rounded-xl p-3 shadow-xs space-y-1">
              <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Socket WhatsApp</span>
              <div className="flex items-baseline justify-between">
                <span className={`text-base font-black font-mono ${connectionStatus === 'CONNECTED' ? 'text-emerald-700' : 'text-amber-600'}`}>
                  {connectionStatus === 'CONNECTED' ? 'ONLINE 24/7' : 'ESPERANDO QR'}
                </span>
              </div>
              <p className="text-[10px] text-zinc-400 font-mono">+{connectedNumber || '573235845145'}</p>
            </div>

            <div className="bg-white border border-zinc-200/90 rounded-xl p-3 shadow-xs space-y-1">
              <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Mandatos Corretaje</span>
              <div className="flex items-baseline justify-between">
                <span className="text-xl font-black text-zinc-900 font-mono">{MOCK_BROKERAGE.length}</span>
                <span className="text-[11px] font-semibold text-emerald-600">Firmados</span>
              </div>
              <p className="text-[10px] text-zinc-400">Sello SHA-256</p>
            </div>

            <div className="bg-white border border-zinc-200/90 rounded-xl p-3 shadow-xs space-y-1">
              <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Portafolio Consignado</span>
              <div className="flex items-baseline justify-between">
                <span className="text-xl font-black text-zinc-900 font-mono">${(totalAssetsConsignedCop / 1000000).toFixed(0)}M</span>
                <span className="text-[11px] font-semibold text-zinc-500 font-mono">COP</span>
              </div>
              <p className="text-[10px] text-zinc-400">Autos, motos e inmuebles</p>
            </div>

            <div className="bg-white border border-zinc-200/90 rounded-xl p-3 shadow-xs space-y-1">
              <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Comisiones Pactadas</span>
              <div className="flex items-baseline justify-between">
                <span className="text-xl font-black text-emerald-700 font-mono">${(totalCommissionsCop / 1000000).toFixed(1)}M</span>
                <span className="text-[11px] font-semibold text-emerald-600 font-mono">COP</span>
              </div>
              <p className="text-[10px] text-zinc-400">3.0% a 4.0% corretaje</p>
            </div>
          </div>

          {/* ════ SECTION 1: WHATSAPP QR FIJO (RENDER SOCKET) ════ */}
          {activeTab === 'whatsapp' && (
            <div className="bg-white border border-zinc-200/90 rounded-xl p-4 sm:p-5 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-zinc-100">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-wide">
                      Línea Oficial WhatsApp Trinova · Socket Render 24/7
                    </h2>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      connectionStatus === 'CONNECTED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {connectionStatus === 'CONNECTED' ? 'ONLINE 24/7' : 'ESPERANDO ESCANEO'}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Conectado directamente a la Torre de Control de NeuroLabs. Las consultas de los clientes se atienden con el inventario real en Pesos COP ($).
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

              {/* QR Scanner Display Area */}
              <div className="py-4 flex flex-col md:flex-row items-center justify-center gap-6">
                {connectionStatus !== 'CONNECTED' ? (
                  <>
                    <div className="p-3 bg-white border-2 border-emerald-500 rounded-2xl shadow-sm text-center">
                      {qrDataUrl ? (
                        <img 
                          src={qrDataUrl} 
                          alt="Código QR WhatsApp" 
                          className="w-52 h-52 rounded-xl mx-auto"
                        />
                      ) : (
                        <div className="w-52 h-52 bg-zinc-50 rounded-xl flex flex-col items-center justify-center space-y-2">
                          <RefreshCw className="w-8 h-8 animate-spin text-emerald-600" />
                          <p className="text-xs text-zinc-500 font-medium">
                            {connectionStatus === 'WAKING_UP' ? 'Conectando con Render...' : 'Generando QR en Render...'}
                          </p>
                        </div>
                      )}
                      <span className="text-[10px] text-zinc-400 font-mono mt-1.5 block">Permanece fijo con Render Activo ($7/mes)</span>
                    </div>

                    <div className="max-w-md space-y-2.5 text-xs">
                      <div className="bg-zinc-50 p-3.5 rounded-xl border border-zinc-200 space-y-1.5">
                        <p className="font-bold text-zinc-900 flex items-center gap-1.5 text-xs">
                          <Smartphone className="w-4 h-4 text-emerald-600" />
                          Pasos para escanear desde tu WhatsApp:
                        </p>
                        <ol className="list-decimal pl-4 space-y-1 text-zinc-600 leading-relaxed text-[11px]">
                          <li>Abre WhatsApp en tu teléfono celular corporativo.</li>
                          <li>Ve a <strong>Ajustes / Configuración ⚙️</strong> (o menú ⋮).</li>
                          <li>Toca en <strong>Dispositivos vinculados</strong>.</li>
                          <li>Selecciona <strong>Vincular un dispositivo</strong> y apunta tu cámara al código QR.</li>
                        </ol>
                      </div>

                      <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-800 text-[11px] flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Al vincular, todos los chats entrarán a la Torre de Control y el Agente responderá cotizaciones y fotos automáticamente.</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="max-w-md w-full bg-zinc-50 p-5 rounded-2xl border border-zinc-200 text-center space-y-3">
                    <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-xs">
                      <CheckCircle2 className="w-7 h-7" />
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-zinc-900">¡Línea Oficial WhatsApp Conectada!</h3>
                      <p className="text-xs text-zinc-500">El Agente IA de Trinova está operando 24/7 sin interrupciones.</p>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-zinc-200 text-left text-xs space-y-1 font-mono text-[11px]">
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Línea Vinculada:</span>
                        <span className="font-bold text-zinc-900">+{connectedNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Servidor Render:</span>
                        <span className="text-zinc-800 font-semibold">ecosytem.onrender.com ($7/mes)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Estado de Socket:</span>
                        <span className="text-emerald-700 font-bold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Online 24/7
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
          )}

          {/* ════ SECTION 2: MANDATOS DE CORRETAJE ════ */}
          {activeTab === 'brokerage' && (
            <div className="bg-white border border-zinc-200/90 rounded-xl overflow-hidden shadow-xs">
              <div className="p-3 bg-zinc-50 border-b border-zinc-200 flex items-center justify-between text-xs">
                <h2 className="font-bold text-zinc-900 uppercase tracking-wide">Mandatos de Corretaje Firmados Digitalmente (SHA-256)</h2>
                <span className="font-semibold text-zinc-500">{MOCK_BROKERAGE.length} Registros</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-50/60 border-b border-zinc-200 text-zinc-500 font-semibold">
                    <tr>
                      <th className="py-2.5 px-3">Código</th>
                      <th className="py-2.5 px-3">Propietario / Mandante</th>
                      <th className="py-2.5 px-3">Identificación</th>
                      <th className="py-2.5 px-3">Valor del Bien (COP)</th>
                      <th className="py-2.5 px-3">Comisión</th>
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
                            onClick={() => setSelectedBrokerage(b)}
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
          )}

          {/* ════ SECTION 3: PROMESAS DE COMPRAVENTA ════ */}
          {activeTab === 'sales' && (
            <div className="bg-white border border-zinc-200/90 rounded-xl overflow-hidden shadow-xs">
              <div className="p-3 bg-zinc-50 border-b border-zinc-200 flex items-center justify-between text-xs">
                <h2 className="font-bold text-zinc-900 uppercase tracking-wide">Promesas de Compraventa & Anticipos en Custodia</h2>
                <span className="font-semibold text-zinc-500">{MOCK_SALES.length} Registros</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-50/60 border-b border-zinc-200 text-zinc-500 font-semibold">
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
          )}

          {/* ════ SECTION 4: INVENTARIO CENTRAL SUPABASE ════ */}
          {activeTab === 'inventory' && (
            <div className="bg-white border border-zinc-200/90 rounded-xl overflow-hidden shadow-xs">
              <div className="p-3 bg-zinc-50 border-b border-zinc-200 flex items-center justify-between text-xs">
                <h2 className="font-bold text-zinc-900 uppercase tracking-wide">Inventario Activo en Base de Datos Real (Supabase Cloud)</h2>
                <Link href="/app/inventory" className="text-xs font-semibold text-zinc-700 hover:text-black flex items-center gap-1">
                  <span>Ir al Módulo Central</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-50/60 border-b border-zinc-200 text-zinc-500 font-semibold">
                    <tr>
                      <th className="py-2.5 px-3">Título / Bien</th>
                      <th className="py-2.5 px-3">Categoría</th>
                      <th className="py-2.5 px-3">Precio COP</th>
                      <th className="py-2.5 px-3">Ciudad / Placa</th>
                      <th className="py-2.5 px-3">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {dbItems.length > 0 ? (
                      dbItems.map(item => (
                        <tr key={item.id} className="hover:bg-zinc-50/80 transition-colors">
                          <td className="py-2.5 px-3 font-semibold text-zinc-900">{item.title}</td>
                          <td className="py-2.5 px-3"><Badge variant="outline" className="text-[10px]">{item.category_type}</Badge></td>
                          <td className="py-2.5 px-3 font-mono font-bold">${Number(item.price_cop || 0).toLocaleString('es-CO')} COP</td>
                          <td className="py-2.5 px-3 text-zinc-600">{item.city} {item.license_plate ? `· Placa: ${item.license_plate}` : ''}</td>
                          <td className="py-2.5 px-3"><span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">{item.status}</span></td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-zinc-400 text-xs">
                          {isLoadingInventory ? 'Cargando datos desde Supabase...' : '0 vehículos en base de datos. Los autos e inmuebles cargados por proveedores aparecerán aquí automáticamente.'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ════ SECTION 5: CLIENTES & CONTACTOS ════ */}
          {activeTab === 'clients' && (
            <div className="bg-white border border-zinc-200/90 rounded-xl overflow-hidden shadow-xs">
              <div className="p-3 bg-zinc-50 border-b border-zinc-200">
                <h2 className="font-bold text-zinc-900 uppercase tracking-wide">Directorio de Clientes & Contactos de WhatsApp</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-50/60 border-b border-zinc-200 text-zinc-500 font-semibold">
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
          )}
        </main>
      </div>

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
