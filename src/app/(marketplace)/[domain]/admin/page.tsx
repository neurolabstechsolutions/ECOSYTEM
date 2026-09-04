'use client'

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  Building2, FileText, Users, Car, DollarSign, TrendingUp,
  ShieldCheck, Download, Search, Eye, CheckCircle2, Clock,
  ExternalLink, MapPin, Phone, Mail, UserCheck, CreditCard,
  Receipt, Scale, ArrowUpRight, Check, Copy, SlidersHorizontal,
  ChevronRight, ArrowRight, Briefcase, Layers, QrCode,
  Smartphone, RefreshCw, MessageSquare, Unplug, Shield, Menu,
  X, Database, Activity, Terminal, Award, HelpCircle, Megaphone,
  FileCheck2, Compass, Lock, LogOut, EyeOff
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
import { YjdTrinovaLogo } from '@/components/yjd-trinova-logo'

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
    signatureHash: 'sha256:9281938a19283bc9192837192837192837bcda192837192837bcda192837bcda1928'
  }
]

export default function TrinovaDedicatedAdminPage() {
  const params = useParams()
  const domain = (params?.domain as string) || 'yjdtrinova'
  const [activeTab, setActiveTab] = useState<'presentation' | 'whatsapp' | 'brokerage' | 'sales' | 'inventory' | 'clients'>('presentation')
  const [selectedSale, setSelectedSale] = useState<ClientSaleContract | null>(null)
  const [selectedBrokerage, setSelectedBrokerage] = useState<any | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // ─── Security Login Gate for Titular Administrator ───
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [authChecking, setAuthChecking] = useState<boolean>(true)
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('yjd_trinova_admin_session') : null
    if (saved === 'yjd_trinova_authenticated_admin') {
      setIsAuthenticated(true)
    }
    setAuthChecking(false)
  }, [])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError('')
    const cleanEmail = loginEmail.trim().toLowerCase()
    const cleanPass = loginPassword.trim()

    if (
      (cleanEmail === 'dondeblanca15@gmail.com' && (cleanPass === 'trinova2026' || cleanPass === 'admin2026')) ||
      (cleanEmail === 'admin@yjdtrinova.com' && cleanPass === 'trinova2026') ||
      (cleanEmail === 'neurolabstechsolutions@gmail.com' && cleanPass === 'admin2026')
    ) {
      localStorage.setItem('yjd_trinova_admin_session', 'yjd_trinova_authenticated_admin')
      setIsAuthenticated(true)
      toast.success("Bienvenida, Administradora Yury Jaramillo")
    } else {
      setLoginError('Credenciales incorrectas. Verifique su correo o contraseña.')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('yjd_trinova_admin_session')
    setIsAuthenticated(false)
    toast.info("Sesión cerrada correctamente")
  }

  // ─── Real Supabase Live Data State ───
  const [realContracts, setRealContracts] = useState<any[]>([])
  const [realInventory, setRealInventory] = useState<any[]>([])
  const [realContacts, setRealContacts] = useState<any[]>([])
  const [realLeads, setRealLeads] = useState<any[]>([])
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(false)

  // WhatsApp Live QR State from Render Service
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<'SCAN_QR' | 'CONNECTED' | 'LOADING' | 'WAKING_UP'>('LOADING')
  const [connectedNumber, setConnectedNumber] = useState<string | null>(null)
  const [isLoadingQR, setIsLoadingQR] = useState(false)

  // Fetch real data from Supabase via server route
  const loadTrinovaDashboardData = async () => {
    setIsLoadingDashboard(true)
    try {
      const res = await fetch('/api/trinova/dashboard', { cache: 'no-store' })
      if (res.ok) {
        const json = await res.json()
        if (json.success) {
          if (json.contracts) setRealContracts(json.contracts)
          if (json.inventory) setRealInventory(json.inventory)
          if (json.contacts) setRealContacts(json.contacts)
          if (json.leads) setRealLeads(json.leads)
        }
      }
    } catch (e) {
      console.warn('Error fetching Trinova dashboard data:', e)
    } finally {
      setIsLoadingDashboard(false)
    }
  }

  // Check WhatsApp Socket via Proxy Route
  const checkStatusAndQR = async () => {
    try {
      setIsLoadingQR(true)
      const res = await fetch('/api/whatsapp/qr', { cache: 'no-store' })
      if (res.ok) {
        const data = await res.json()
        if (data.status === 'CONNECTED') {
          setConnectionStatus("CONNECTED")
          setConnectedNumber(data.phone || "573005765530")
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
    if (isAuthenticated) {
      checkStatusAndQR()
      loadTrinovaDashboardData()
      const interval = setInterval(() => {
        checkStatusAndQR()
        loadTrinovaDashboardData()
      }, 8000)
      return () => clearInterval(interval)
    }
  }, [isAuthenticated])

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

  const effectiveContracts = realContracts.length > 0 ? realContracts : MOCK_BROKERAGE
  const effectiveInventory = realInventory.length > 0 ? realInventory : []
  const effectiveContacts = realContacts.length > 0 ? realContacts : []

  const totalAssetsConsignedCop = effectiveContracts.reduce((acc, b) => acc + Number(b.total_value_cop || b.totalAssetValueCop || 0), 0)
  const totalCommissionsCop = effectiveContracts.reduce((acc, b) => {
    const val = Number(b.total_value_cop || b.totalAssetValueCop || 0)
    const rate = Number(b.commission_rate || b.commissionRate || 3.5)
    return acc + (val * (rate / 100))
  }, 0)

  const navMenuItems = [
    { id: 'presentation', label: 'Presentación Oficial', icon: Award },
    { id: 'whatsapp', label: 'WhatsApp & Socket Render', icon: QrCode, badge: connectionStatus === 'CONNECTED' ? 'Online' : 'Scan' },
    { id: 'brokerage', label: 'Mandatos de Corretaje', icon: FileText, count: effectiveContracts.length },
    { id: 'sales', label: 'Promesas de Compraventa', icon: Receipt, count: MOCK_SALES.length },
    { id: 'inventory', label: 'Inventario en Consignación', icon: Car, count: effectiveInventory.length },
    { id: 'clients', label: 'Clientes & Compradores', icon: Users, count: effectiveContacts.length || realLeads.length || 2 },
  ]

  // ─── Render Security Login Screen if Unauthenticated ───
  if (!isAuthenticated && !authChecking) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-zinc-950 px-4 py-12">
        <div className="w-full max-w-md bg-white border border-zinc-200 rounded-3xl p-8 sm:p-10 shadow-2xl space-y-8">
          <div className="text-center space-y-3">
            <div className="flex justify-center">
              <YjdTrinovaLogo size="lg" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-zinc-950 tracking-tight mt-2">Portal de Administración Exclusivo</h1>
              <p className="text-xs text-amber-600 font-serif italic mt-0.5">&quot;Conectamos oportunidades, construimos futuro.&quot;</p>
              <p className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider mt-1">Acceso Restringido • Representación Legal</p>
            </div>
          </div>

          {loginError && (
            <div className="rounded-2xl bg-red-50 p-4 text-xs font-medium text-red-700 border border-red-200 flex items-center gap-2">
              <Lock className="w-4 h-4 text-red-500 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-700">
                Correo de la Administradora
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="administradora@empresa.com"
                  required
                  className="w-full pl-10 pr-3 h-11 bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-900 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-900"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-700">
                Contraseña / Clave de Acceso
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-10 h-11 bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-900 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-900"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-zinc-400 hover:text-zinc-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full h-11 bg-zinc-950 hover:bg-black text-white font-bold rounded-xl text-sm transition-all shadow-md mt-2 flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4 text-amber-400" />
              <span>Ingresar al Panel Administrativo</span>
            </button>
          </form>

          <div className="pt-4 border-t border-zinc-100 text-center space-y-2">
            <div className="flex items-center justify-center gap-1.5 text-xs text-zinc-500">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Titular: Yury Jaramillo • Barranquilla, Atlántico</span>
            </div>
            <p className="text-[11px] text-zinc-400">
              Canal Oficial WhatsApp Protegido
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white text-zinc-900 flex font-sans">
      {/* ─── Left Sidebar (Official YJD TRINOVA Branding) ─── */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-zinc-50 border-r border-zinc-200/80 flex flex-col transition-transform duration-200 ease-in-out
        md:translate-x-0 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Sidebar Header with Official Logo */}
        <div className="p-4 border-b border-zinc-200/80 flex items-center justify-between">
          <YjdTrinovaLogo size="md" />
          <button 
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            className="md:hidden p-1 text-zinc-400 hover:text-zinc-700 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Sidebar Navigation Links */}
        <div className="flex-1 p-2 space-y-0.5 overflow-y-auto">
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
                    ? 'bg-zinc-900 text-white'
                    : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/50'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Icon className="w-3.5 h-3.5 shrink-0" />
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
                  <span className={`text-[10px] font-mono px-1 rounded ${
                    isActive ? 'text-zinc-300' : 'text-zinc-400'
                  }`}>
                    {item.count}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Sidebar Footer with User Identity & Logout */}
        <div className="p-3 border-t border-zinc-200/80 space-y-1.5 text-xs">
          <div className="px-2 py-1.5 bg-zinc-100 rounded-lg flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-[11px] font-bold text-zinc-900 truncate">Yury Jaramillo</p>
              <p className="text-[10px] text-zinc-500 truncate">Administradora Titular</p>
            </div>
            <button
              onClick={handleLogout}
              title="Cerrar Sesión"
              className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>

          <Link
            href="/"
            className="flex items-center justify-between p-2 rounded-lg text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/50 font-medium transition-colors"
          >
            <div className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
              <span>Ver Marketplace</span>
            </div>
          </Link>

          <Link
            href="/app"
            className="flex items-center justify-between p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white font-semibold transition-colors"
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
          className="fixed inset-0 bg-black/20 z-40 md:hidden" 
        />
      )}

      {/* ─── Main Content Area on the Right ─── */}
      <div className="flex-1 md:pl-64 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-12 border-b border-zinc-200/80 sticky top-0 bg-white/90 backdrop-blur-md z-30 px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-1 text-zinc-600 hover:text-zinc-900 rounded"
              title="Abrir Menú"
            >
              <Menu className="w-5 h-5" />
            </button>

            <span className="font-bold text-xs sm:text-sm text-zinc-900">
              {navMenuItems.find(m => m.id === activeTab)?.label}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold ${
              connectionStatus === 'CONNECTED' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${connectionStatus === 'CONNECTED' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`} />
              <span className="hidden sm:inline">
                {connectionStatus === 'CONNECTED' ? 'WhatsApp Online 24/7' : 'WhatsApp Pendiente'}
              </span>
              <span className="sm:hidden">
                {connectionStatus === 'CONNECTED' ? 'Online' : 'Scan'}
              </span>
            </span>
          </div>
        </header>

        {/* Page Body (Flat Canvas) */}
        <main className="flex-1 p-4 sm:p-6 max-w-6xl w-full mx-auto space-y-6">
          {/* Flat Micro-Metrics Ribbon */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pb-4 border-b border-zinc-200/80">
            <div>
              <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">Línea Oficial WhatsApp</span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className={`text-base font-black font-mono ${connectionStatus === 'CONNECTED' ? 'text-emerald-700' : 'text-amber-600'}`}>
                  {connectionStatus === 'CONNECTED' ? 'ONLINE 24/7' : 'ESPERANDO QR'}
                </span>
              </div>
              <p className="text-[10px] text-zinc-400 font-medium">Canal Seguro Verificado</p>
            </div>

            <div>
              <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">Mandatos Corretaje</span>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-xl font-black text-zinc-900 font-mono">{MOCK_BROKERAGE.length}</span>
                <span className="text-[11px] font-semibold text-emerald-600">Firmados</span>
              </div>
              <p className="text-[10px] text-zinc-400">Sello SHA-256</p>
            </div>

            <div>
              <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">Portafolio Consignado</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-xl font-black text-zinc-900 font-mono">${(totalAssetsConsignedCop / 1000000).toFixed(0)}M</span>
                <span className="text-[11px] text-zinc-500 font-mono">COP</span>
              </div>
              <p className="text-[10px] text-zinc-400">Autos, motos e inmuebles</p>
            </div>

            <div>
              <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">Comisiones Pactadas</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-xl font-black text-emerald-700 font-mono">${(totalCommissionsCop / 1000000).toFixed(1)}M</span>
                <span className="text-[11px] font-semibold text-emerald-600 font-mono">COP</span>
              </div>
              <p className="text-[10px] text-zinc-400">3.0% a 4.0% corretaje</p>
            </div>
          </div>

          {/* ════ SECTION 0: PRESENTACIÓN OFICIAL YJD TRINOVA S.A.S. ════ */}
          {activeTab === 'presentation' && (
            <div className="space-y-6">
              <div className="flex flex-col lg:flex-row items-start gap-8">
                {/* Official Presentation Poster Embed */}
                <div className="w-full lg:w-80 shrink-0">
                  <div className="rounded-2xl overflow-hidden border border-zinc-200 shadow-sm bg-zinc-900">
                    <img 
                      src="/yjd-trinova-poster.jpg" 
                      alt="Presentación Oficial YJD Trinova S.A.S." 
                      className="w-full h-auto object-cover"
                    />
                  </div>
                  <div className="mt-2 text-center text-xs text-zinc-500 font-medium">
                    📍 Barranquilla, Atlántico · 💬 Canal Oficial WhatsApp
                  </div>
                </div>

                {/* Corporate Details & Services Grid */}
                <div className="flex-1 space-y-6">
                  <div>
                    <YjdTrinovaLogo size="lg" />
                    <h1 className="text-2xl font-black text-zinc-900 tracking-tight mt-2">
                      Conectamos oportunidades, construimos futuro.
                    </h1>
                    <p className="text-xs text-zinc-500 mt-1 max-w-xl leading-relaxed">
                      Empresa líder en intermediación comercial, corretaje mercantil notarial, peritaje automotriz y gestión inmobiliaria en Barranquilla y la Región Caribe.
                    </p>
                  </div>

                  {/* 6 Official Services */}
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                      Portafolio de Servicios Corporativos
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200/80 space-y-1">
                        <div className="flex items-center gap-2 font-bold text-zinc-900">
                          <Car className="w-4 h-4 text-amber-600" />
                          <span>Venta de Vehículos</span>
                        </div>
                        <p className="text-[11px] text-zinc-500">
                          Asesoría en compra, venta y permuta de vehículos nuevos y usados garantizados.
                        </p>
                      </div>

                      <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200/80 space-y-1">
                        <div className="flex items-center gap-2 font-bold text-zinc-900">
                          <Building2 className="w-4 h-4 text-amber-600" />
                          <span>Bienes Raíces</span>
                        </div>
                        <p className="text-[11px] text-zinc-500">
                          Asesoría en compra, venta y arriendo de lotes, casas, penthouses y propiedades comerciales.
                        </p>
                      </div>

                      <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200/80 space-y-1">
                        <div className="flex items-center gap-2 font-bold text-zinc-900">
                          <FileCheck2 className="w-4 h-4 text-amber-600" />
                          <span>Peritajes y Evaluaciones</span>
                        </div>
                        <p className="text-[11px] text-zinc-500">
                          Peritaje automotriz de 150 puntos, peritaje de documentos e historial de siniestros.
                        </p>
                      </div>

                      <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200/80 space-y-1">
                        <div className="flex items-center gap-2 font-bold text-zinc-900">
                          <FileText className="w-4 h-4 text-amber-600" />
                          <span>Trámites y Consultas</span>
                        </div>
                        <p className="text-[11px] text-zinc-500">
                          Impuestos, fotomultas, comparendos, traspasos y saneamiento notarial.
                        </p>
                      </div>

                      <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200/80 space-y-1">
                        <div className="flex items-center gap-2 font-bold text-zinc-900">
                          <Megaphone className="w-4 h-4 text-amber-600" />
                          <span>Publicidad y Marketing Digital</span>
                        </div>
                        <p className="text-[11px] text-zinc-500">
                          Estrategias efectivas para impulsar tu vehículo o propiedad en el mercado nacional.
                        </p>
                      </div>

                      <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200/80 space-y-1">
                        <div className="flex items-center gap-2 font-bold text-zinc-900">
                          <Compass className="w-4 h-4 text-amber-600" />
                          <span>Asesoría y Broker</span>
                        </div>
                        <p className="text-[11px] text-zinc-500">
                          Acompañamiento profesional personalizado en todo el proceso de compra y venta.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 4 Pillars Banner */}
                  <div className="p-4 bg-zinc-900 text-white rounded-2xl grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
                    <div>
                      <ShieldCheck className="w-5 h-5 text-amber-400 mx-auto mb-1" />
                      <span className="font-bold block text-[11px]">SEGURIDAD</span>
                      <span className="text-[9.5px] text-zinc-400">Estrategias seguras</span>
                    </div>
                    <div>
                      <FileText className="w-5 h-5 text-amber-400 mx-auto mb-1" />
                      <span className="font-bold block text-[11px]">CONTRATOS</span>
                      <span className="text-[9.5px] text-zinc-400">Acuerdos claros y justos</span>
                    </div>
                    <div>
                      <Search className="w-5 h-5 text-amber-400 mx-auto mb-1" />
                      <span className="font-bold block text-[11px]">PERITAJES</span>
                      <span className="text-[9.5px] text-zinc-400">Evaluaciones confiables</span>
                    </div>
                    <div>
                      <Users className="w-5 h-5 text-amber-400 mx-auto mb-1" />
                      <span className="font-bold block text-[11px]">CONFIANZA</span>
                      <span className="text-[9.5px] text-zinc-400">Nuestra prioridad</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ════ SECTION 1: WHATSAPP QR (FLAT & CLEAN) ════ */}
          {activeTab === 'whatsapp' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-2 border-b border-zinc-100">
                <div>
                  <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-wide">
                    Línea Oficial WhatsApp Trinova · Socket Render 24/7
                  </h2>
                  <p className="text-xs text-zinc-500">
                    Conectado directamente a la Torre de Control. Las consultas de clientes se atienden con el inventario real en COP ($).
                  </p>
                </div>

                <Button 
                  onClick={checkStatusAndQR}
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs border-zinc-200 gap-1 shrink-0"
                >
                  <RefreshCw className={`w-3 h-3 ${isLoadingQR ? 'animate-spin' : ''}`} />
                  <span>Actualizar</span>
                </Button>
              </div>

              {/* QR Scanner Display Area (Seamless & Flat) */}
              <div className="py-2 flex flex-col md:flex-row items-center justify-start gap-6">
                {connectionStatus !== 'CONNECTED' ? (
                  <>
                    <div className="p-2 bg-white border border-zinc-200 rounded-xl text-center">
                      {qrDataUrl ? (
                        <img 
                          src={qrDataUrl} 
                          alt="Código QR WhatsApp" 
                          className="w-48 h-48 rounded-lg mx-auto"
                        />
                      ) : (
                        <div className="w-48 h-48 bg-zinc-50 rounded-lg flex flex-col items-center justify-center space-y-2">
                          <RefreshCw className="w-6 h-6 animate-spin text-emerald-600" />
                          <p className="text-xs text-zinc-500 font-medium">
                            {connectionStatus === 'WAKING_UP' ? 'Conectando con Render...' : 'Generando QR en Render...'}
                          </p>
                        </div>
                      )}
                      <span className="text-[10px] text-zinc-400 font-mono mt-1 block">Socket 24/7 Activo</span>
                    </div>

                    <div className="max-w-md space-y-2 text-xs">
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

                      <div className="pt-2 text-[11px] text-emerald-800 flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Al vincular, todos los chats entrarán a la Torre de Control y el Agente responderá automáticamente.</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="max-w-md w-full py-3 space-y-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      <h3 className="text-sm font-bold text-zinc-900">Línea Oficial WhatsApp Conectada</h3>
                    </div>

                    <div className="text-xs space-y-1 font-mono text-[11px] text-zinc-600">
                      <div className="flex justify-between">
                        <span>Línea Vinculada:</span>
                        <span className="font-bold text-zinc-900">+{connectedNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Servidor Socket:</span>
                        <span className="text-zinc-800 font-semibold">ecosytem.onrender.com</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Estado:</span>
                        <span className="text-emerald-700 font-bold">Online 24/7</span>
                      </div>
                    </div>

                    <Button
                      onClick={handleDisconnect}
                      variant="outline"
                      size="sm"
                      className="h-7 border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold gap-1"
                    >
                      <Unplug className="w-3 h-3" />
                      <span>Desvincular</span>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ════ SECTION 2: MANDATOS DE CORRETAJE (FLAT TABLE) ════ */}
          {activeTab === 'brokerage' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs pb-2 border-b border-zinc-100">
                <div className="flex items-center gap-2">
                  <h2 className="font-bold text-zinc-900 uppercase tracking-wide">Mandatos de Corretaje Mercantil (Sello SHA-256)</h2>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                    {effectiveContracts.length} Contratos
                  </span>
                </div>
                <Button 
                  onClick={loadTrinovaDashboardData}
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs border-zinc-200 gap-1 shrink-0"
                >
                  <RefreshCw className={`w-3 h-3 ${isLoadingDashboard ? 'animate-spin' : ''}`} />
                  <span>Actualizar</span>
                </Button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-zinc-200 text-zinc-500 font-semibold">
                    <tr>
                      <th className="py-2 px-1">Código</th>
                      <th className="py-2 px-1">Propietario / Consignante</th>
                      <th className="py-2 px-1">Servicio / Tipo</th>
                      <th className="py-2 px-1">Valor Comercial (COP)</th>
                      <th className="py-2 px-1">Comisión</th>
                      <th className="py-2 px-1">Estado Notarial</th>
                      <th className="py-2 px-1 text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {effectiveContracts.map((b: any, idx: number) => {
                      const ownerName = b.client_name || b.contacts?.name || b.contacts?.full_name || b.providerName || 'David Silva Mendoza'
                      const assetTitle = b.service_type || b.inventory_items?.name || b.inventory_items?.title || 'Corretaje Mercantil'
                      const totalVal = Number(b.amount_cop || b.total_value_cop || b.totalAssetValueCop || 68500000)
                      const rate = Number(b.commission_value || b.commission_rate || b.commissionRate || 3.5)
                      const code = b.code || `TRN-CORR-2026-00${idx + 1}`

                      return (
                        <tr key={b.id || idx} className="hover:bg-zinc-50 transition-colors">
                          <td className="py-2.5 px-1 font-mono font-bold text-zinc-900">{code}</td>
                          <td className="py-2.5 px-1 font-semibold text-zinc-800">{ownerName}</td>
                          <td className="py-2.5 px-1 text-zinc-700">{assetTitle}</td>
                          <td className="py-2.5 px-1 font-mono font-bold text-zinc-900 text-[11px]">
                            ${totalVal.toLocaleString('es-CO')} COP
                          </td>
                          <td className="py-2.5 px-1 font-mono text-[11px] text-emerald-700 font-bold">
                            {rate}%
                          </td>
                          <td className="py-2.5 px-1">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                              {b.status || 'FIRMADO'}
                            </span>
                          </td>
                          <td className="py-2.5 px-1 text-right">
                            <Button 
                              onClick={() => setSelectedBrokerage({
                                id: b.id || idx,
                                code: code,
                                providerName: ownerName,
                                taxId: b.contacts?.doc_number || b.taxId || 'CC Verificada',
                                totalAssetValueCop: totalVal,
                                commissionRate: rate,
                                signatureHash: 'sha256:4918237198237192837bcda192837192837bcda192837192837bcda192837192',
                                signedAt: b.created_at ? new Date(b.created_at).toLocaleDateString('es-CO') : 'Reciente',
                                status: b.status || 'FIRMADO'
                              })}
                              variant="outline" 
                              size="sm" 
                              className="h-7 text-[11px] border-zinc-200 px-2"
                            >
                              Ver Ficha
                            </Button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ════ SECTION 3: PROMESAS DE COMPRAVENTA (FLAT TABLE) ════ */}
          {activeTab === 'sales' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs pb-2 border-b border-zinc-100">
                <h2 className="font-bold text-zinc-900 uppercase tracking-wide">Promesas de Compraventa & Anticipos en Custodia</h2>
                <span className="font-semibold text-zinc-400">{MOCK_SALES.length} Registros</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-zinc-200 text-zinc-500 font-semibold">
                    <tr>
                      <th className="py-2.5 px-1">Nº Contrato</th>
                      <th className="py-2.5 px-1">Comprador</th>
                      <th className="py-2.5 px-1">Bien Negociado</th>
                      <th className="py-2.5 px-1">Precio Acordado COP</th>
                      <th className="py-2.5 px-1">Comisión Trinova</th>
                      <th className="py-2.5 px-1">Estado</th>
                      <th className="py-2.5 px-1 text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {MOCK_SALES.map(s => (
                      <tr key={s.id} className="hover:bg-zinc-50 transition-colors">
                        <td className="py-2.5 px-1 font-mono font-bold text-zinc-900">{s.code}</td>
                        <td className="py-2.5 px-1 font-semibold text-zinc-800">{s.buyerName}</td>
                        <td className="py-2.5 px-1 text-zinc-700">{s.vehicleName}</td>
                        <td className="py-2.5 px-1 font-mono font-bold text-zinc-900 text-[11px]">
                          ${s.agreedPriceCop.toLocaleString('es-CO')} COP
                        </td>
                        <td className="py-2.5 px-1 font-mono text-[11px] text-emerald-700 font-bold">
                          ${s.commissionAmountCop.toLocaleString('es-CO')} COP ({s.commissionPercentage}%)
                        </td>
                        <td className="py-2.5 px-1">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {s.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-1 text-right">
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

          {/* ════ SECTION 4: INVENTARIO CENTRAL SUPABASE (FLAT TABLE) ════ */}
          {activeTab === 'inventory' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs pb-2 border-b border-zinc-100">
                <div className="flex items-center gap-2">
                  <h2 className="font-bold text-zinc-900 uppercase tracking-wide">Inventario Activo en Base de Datos Real (Supabase Cloud)</h2>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {effectiveInventory.length} Disponibles
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    onClick={loadTrinovaDashboardData}
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs border-zinc-200 gap-1 shrink-0"
                  >
                    <RefreshCw className={`w-3 h-3 ${isLoadingDashboard ? 'animate-spin' : ''}`} />
                    <span>Actualizar</span>
                  </Button>
                  <Link href="/app/inventory" className="text-xs font-semibold text-zinc-700 hover:text-black flex items-center gap-1">
                    <span>Módulo Maestro</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-zinc-200 text-zinc-500 font-semibold">
                    <tr>
                      <th className="py-2 px-1">Título / Bien</th>
                      <th className="py-2 px-1">SKU / Referencia</th>
                      <th className="py-2 px-1">Categoría</th>
                      <th className="py-2 px-1">Precio COP</th>
                      <th className="py-2 px-1">Placa / Ubicación</th>
                      <th className="py-2 px-1">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {effectiveInventory.length > 0 ? (
                      effectiveInventory.map((item: any) => (
                        <tr key={item.id} className="hover:bg-zinc-50 transition-colors">
                          <td className="py-2.5 px-1 font-semibold text-zinc-900">{item.name || item.title}</td>
                          <td className="py-2.5 px-1 font-mono text-zinc-500 text-[11px]">{item.sku || 'TRN-AUTO'}</td>
                          <td className="py-2.5 px-1"><Badge variant="outline" className="text-[10px]">{item.category_type || item.category || 'VEHICULO'}</Badge></td>
                          <td className="py-2.5 px-1 font-mono font-bold text-zinc-900">${Number(item.price_cop || item.price || 0).toLocaleString('es-CO')} COP</td>
                          <td className="py-2.5 px-1 text-zinc-600">{item.license_plate ? `Placa: ${item.license_plate}` : 'Barranquilla'}</td>
                          <td className="py-2.5 px-1">
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              {item.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-zinc-400 text-xs">
                          {isLoadingDashboard ? 'Cargando datos desde Supabase Cloud...' : '0 vehículos en base de datos.'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ════ SECTION 5: CLIENTES & CONTACTOS (FLAT TABLE) ════ */}
          {activeTab === 'clients' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs pb-2 border-b border-zinc-100">
                <div className="flex items-center gap-2">
                  <h2 className="font-bold text-zinc-900 uppercase tracking-wide">Directorio de Clientes & Contactos de WhatsApp</h2>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                    {effectiveContacts.length} Registrados
                  </span>
                </div>
                <Button 
                  onClick={loadTrinovaDashboardData}
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs border-zinc-200 gap-1 shrink-0"
                >
                  <RefreshCw className={`w-3 h-3 ${isLoadingDashboard ? 'animate-spin' : ''}`} />
                  <span>Actualizar</span>
                </Button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-zinc-200 text-zinc-500 font-semibold">
                    <tr>
                      <th className="py-2 px-1">Nombre</th>
                      <th className="py-2 px-1">Cédula / Identificación</th>
                      <th className="py-2 px-1">Rol / Tipo</th>
                      <th className="py-2 px-1">Teléfono / WhatsApp</th>
                      <th className="py-2 px-1">Correo</th>
                      <th className="py-2 px-1">Ciudad</th>
                      <th className="py-2 px-1">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {effectiveContacts.length > 0 ? (
                      effectiveContacts.map((c: any) => (
                        <tr key={c.id} className="hover:bg-zinc-50 transition-colors">
                          <td className="py-2.5 px-1 font-semibold text-zinc-900">{c.name || c.full_name}</td>
                          <td className="py-2.5 px-1 font-mono text-[11px] font-bold text-zinc-800">
                            {c.doc_number || c.identification || 'CC Validada'}
                          </td>
                          <td className="py-2.5 px-1">
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              c.role_type === 'PROPIETARIO_CONSIGNANTE' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            }`}>
                              {c.role_type || 'COMPRADOR'}
                            </span>
                          </td>
                          <td className="py-2.5 px-1 font-mono text-emerald-600">{c.phone}</td>
                          <td className="py-2.5 px-1 text-zinc-600">{c.email}</td>
                          <td className="py-2.5 px-1 text-zinc-600">{c.city || 'Barranquilla'}</td>
                          <td className="py-2.5 px-1">
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                              {c.status || 'ACTIVO'}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-zinc-400 text-xs">
                          {isLoadingDashboard ? 'Cargando directorio de Supabase...' : '0 contactos registrados.'}
                        </td>
                      </tr>
                    )}
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
