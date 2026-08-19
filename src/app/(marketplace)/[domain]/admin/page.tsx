'use client'

import React, { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Building2,
  FileText,
  Users,
  Car,
  DollarSign,
  TrendingUp,
  ShieldCheck,
  Download,
  Search,
  Eye,
  CheckCircle2,
  Clock,
  ExternalLink,
  MapPin,
  Phone,
  Mail,
  UserCheck,
  CreditCard,
  Receipt,
  Scale,
  ArrowUpRight,
  Check,
  Copy,
  SlidersHorizontal,
  ChevronRight,
  Sparkles,
  ArrowRight,
  Briefcase,
  Layers,
  HelpCircle
} from 'lucide-react'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

// Interfaces
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
  totalAssetValue: number
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
  vehicleVin: string
  dealershipName: string
  agreedPrice: number
  depositAmount: number
  commissionAmount: number
  commissionPercentage: number
  signedAt: string
  status: 'PAGADO_Y_CERRADO' | 'ANTICIPO_DEPOSITADO' | 'EN_FIRMA'
  paymentMethod: string
  signatureHash: string
}

interface CustomerProfile {
  id: string
  fullName: string
  identification: string
  address: string
  city: string
  phone: string
  email: string
  contractCount: number
  totalSpent: number
  kycStatus: 'VERIFICADO_100%' | 'PENDIENTE_DOCUMENTOS'
  preferredVehicle: string
  registeredAt: string
}

const MOCK_BROKERAGE: BrokerageContract[] = [
  {
    id: 'cnt-101',
    code: 'TRN-CORR-2026-001',
    providerName: 'Grupo Automotriz Premier',
    providerType: 'Persona Jurídica',
    legalName: 'Distribuidora Premier del Norte S.A. de C.V.',
    taxId: 'DPN850412KL9',
    city: 'Monterrey, N.L.',
    commissionRate: 3.5,
    vehicleCount: 18,
    totalAssetValue: 14250000,
    signedAt: '2026-08-01',
    status: 'VIGENTE',
    signatureHash: 'sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    signerName: 'Lic. Alejandro Garza Morales',
    signerRole: 'Representante Legal',
    signerEmail: 'alejandro.garza@premierauto.com',
    signerPhone: '+52 81 8399 2200'
  },
  {
    id: 'cnt-102',
    code: 'TRN-CORR-2026-002',
    providerName: 'Valle Alto Seminuevos',
    providerType: 'Persona Jurídica',
    legalName: 'Comercializadora de Vehículos Valle Alto S.A.',
    taxId: 'CVV9108237T1',
    city: 'Guadalajara, Jal.',
    commissionRate: 4.0,
    vehicleCount: 12,
    totalAssetValue: 8900000,
    signedAt: '2026-08-05',
    status: 'VIGENTE',
    signatureHash: 'sha256:88d4266fd4e6338d13b845fcf289579d209c897823b9217da3e161936f031589',
    signerName: 'Ing. Sofía Mendoza Rivas',
    signerRole: 'Directora Comercial',
    signerEmail: 'sofia@vallealtoseminuevos.com',
    signerPhone: '+52 33 3612 8844'
  },
  {
    id: 'cnt-103',
    code: 'TRN-CORR-2026-003',
    providerName: 'Carlos Eduardo Ramírez (Particular)',
    providerType: 'Persona Natural',
    legalName: 'Carlos Eduardo Ramírez Peña',
    taxId: 'RAPC8406129K1',
    city: 'Ciudad de México',
    commissionRate: 4.5,
    vehicleCount: 2,
    totalAssetValue: 1450000,
    signedAt: '2026-08-11',
    status: 'VIGENTE',
    signatureHash: 'sha256:4918237198237192837bcda192837192837192837bcda192837192837bcda192',
    signerName: 'Carlos Eduardo Ramírez',
    signerRole: 'Propietario Particular',
    signerEmail: 'carlos.ramirez@gmail.com',
    signerPhone: '+52 55 1829 3300'
  }
]

const MOCK_SALES: ClientSaleContract[] = [
  {
    id: 'cli-cnt-201',
    code: 'CV-TRN-2026-089',
    buyerName: 'Ing. Mauricio Cantú Garza',
    buyerId: 'CAGM8803159J2',
    buyerAddress: 'Av. Vasconcelos #1450, Col. del Valle, San Pedro Garza García, N.L., CP 66220',
    buyerPhone: '+52 81 1920 4455',
    buyerEmail: 'mauricio.cantu@constructora.mx',
    vehicleName: 'SUV Familiar Premium 2026 (Híbrida)',
    vehicleSku: 'SUV-2026-X',
    vehicleVin: '3N1AB7AP4MY289104',
    dealershipName: 'Grupo Automotriz Premier',
    agreedPrice: 850000,
    depositAmount: 50000,
    commissionAmount: 29750,
    commissionPercentage: 3.5,
    signedAt: '2026-08-14 11:20:45',
    status: 'PAGADO_Y_CERRADO',
    paymentMethod: 'Transferencia Bancaria SPEI',
    signatureHash: 'sha256:7c9e0d11f92e8a716c5b91b920e817bc16298ef918237ca0291937e28918274a'
  },
  {
    id: 'cli-cnt-202',
    code: 'CV-TRN-2026-090',
    buyerName: 'Dra. Patricia Ortiz Morales',
    buyerId: 'OIMP7911048Z1',
    buyerAddress: 'Paseo de la Reforma #222, Depto 14B, Cuauhtémoc, CDMX, CP 06600',
    buyerPhone: '+52 55 4912 3388',
    buyerEmail: 'patricia.ortiz@medicos.org',
    vehicleName: 'Sedán Eléctrico Z-Type 2025',
    vehicleSku: 'SED-ELC-Z',
    vehicleVin: '1G1RC6E45HU109482',
    dealershipName: 'Kavak Partners CDMX',
    agreedPrice: 950000,
    depositAmount: 95000,
    commissionAmount: 28500,
    commissionPercentage: 3.0,
    signedAt: '2026-08-15 16:45:10',
    status: 'ANTICIPO_DEPOSITADO',
    paymentMethod: 'Crédito Automotriz Aprobado',
    signatureHash: 'sha256:9281938a19283bc9192837192837192837bcda192837192837192837bcda1928'
  },
  {
    id: 'cli-cnt-203',
    code: 'CV-TRN-2026-091',
    buyerName: 'Lic. Rodrigo Saldivar Treviño',
    buyerId: 'SATR8209215T3',
    buyerAddress: 'Calle Real de Acacias #304, Puerta de Hierro, Zapopan, Jal., CP 45116',
    buyerPhone: '+52 33 2200 9811',
    buyerEmail: 'rodrigo.saldivar@corporativo.com',
    vehicleName: 'Pickup 4x4 Todo Terreno 2026',
    vehicleSku: 'PKP-4X4-T',
    vehicleVin: '3FA6P0H78ER209144',
    dealershipName: 'Valle Alto Seminuevos',
    agreedPrice: 650000,
    depositAmount: 30000,
    commissionAmount: 26000,
    commissionPercentage: 4.0,
    signedAt: '2026-08-16 10:15:00',
    status: 'EN_FIRMA',
    paymentMethod: 'Contado',
    signatureHash: 'sha256:1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b'
  }
]

const MOCK_CUSTOMERS: CustomerProfile[] = [
  {
    id: 'cust-1',
    fullName: 'Ing. Mauricio Cantú Garza',
    identification: 'RFC: CAGM8803159J2 / CURP: CAGM880315HNLNR01',
    address: 'Av. Vasconcelos #1450, Col. del Valle, San Pedro Garza García, N.L., CP 66220',
    city: 'San Pedro Garza García, N.L.',
    phone: '+52 81 1920 4455',
    email: 'mauricio.cantu@constructora.mx',
    contractCount: 1,
    totalSpent: 850000,
    kycStatus: 'VERIFICADO_100%',
    preferredVehicle: 'SUV Familiar Premium 2026',
    registeredAt: '2026-08-14'
  },
  {
    id: 'cust-2',
    fullName: 'Dra. Patricia Ortiz Morales',
    identification: 'RFC: OIMP7911048Z1 / CURP: OIMP791104MDFRRN04',
    address: 'Paseo de la Reforma #222, Depto 14B, Cuauhtémoc, CDMX, CP 06600',
    city: 'Ciudad de México',
    phone: '+52 55 4912 3388',
    email: 'patricia.ortiz@medicos.org',
    contractCount: 1,
    totalSpent: 950000,
    kycStatus: 'VERIFICADO_100%',
    preferredVehicle: 'Sedán Eléctrico Z-Type 2025',
    registeredAt: '2026-08-15'
  },
  {
    id: 'cust-3',
    fullName: 'Lic. Rodrigo Saldivar Treviño',
    identification: 'RFC: SATR8209215T3 / CURP: SATR820921HJCLRN09',
    address: 'Calle Real de Acacias #304, Puerta de Hierro, Zapopan, Jal., CP 45116',
    city: 'Zapopan, Jal.',
    phone: '+52 33 2200 9811',
    email: 'rodrigo.saldivar@corporativo.com',
    contractCount: 1,
    totalSpent: 650000,
    kycStatus: 'VERIFICADO_100%',
    preferredVehicle: 'Pickup 4x4 Todo Terreno 2026',
    registeredAt: '2026-08-16'
  }
]

export default function TrinovaDedicatedAdminPage() {
  const params = useParams()
  const domain = (params?.domain as string) || 'jjtrinova'
  const [activeTab, setActiveTab] = useState('sales')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSale, setSelectedSale] = useState<ClientSaleContract | null>(null)
  const [selectedBrokerage, setSelectedBrokerage] = useState<BrokerageContract | null>(null)
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerProfile | null>(null)
  const [copiedHash, setCopiedHash] = useState(false)

  const totalCommissionsEarned = MOCK_SALES.reduce((acc, s) => acc + s.commissionAmount, 0)
  const totalSalesVolume = MOCK_SALES.reduce((acc, s) => acc + s.agreedPrice, 0)
  const totalDeposits = MOCK_SALES.reduce((acc, s) => acc + s.depositAmount, 0)
  const totalAssetsConsigned = MOCK_BROKERAGE.reduce((acc, b) => acc + b.totalAssetValue, 0)

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedHash(true)
    setTimeout(() => setCopiedHash(false), 2000)
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Top Navbar Dedicado para JY Trinova S.A.S. */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-serif font-bold text-lg shadow-sm">
              JT
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-lg leading-tight font-serif">JY Trinova S.A.S.</span>
                <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-200 text-[10px] font-semibold py-0">
                  Panel de Dirección
                </Badge>
              </div>
              <p className="text-xs text-slate-500">División de Intermediación & Corretaje Mercantil</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link href={`/`} className="text-xs text-slate-600 hover:text-black font-medium flex items-center gap-1 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors">
              <ExternalLink className="w-3.5 h-3.5" /> Ver Marketplace Público
            </Link>
            <Link href={`/proveedores/registro`} className="text-xs text-slate-600 hover:text-black font-medium flex items-center gap-1 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors">
              <Building2 className="w-3.5 h-3.5" /> Registro de Proveedores
            </Link>
            <div className="w-px h-5 bg-slate-200 mx-1" />
            <div className="text-right hidden sm:block">
              <span className="text-xs font-semibold text-slate-800 block">Administradora Titular</span>
              <span className="text-[11px] text-slate-400">admin@jjtrinova.com</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Banner de Bienvenida y Resumen Estratégico */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-6 sm:p-8 rounded-3xl shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
              Centro de Mando & Control de Negociaciones
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mt-1 font-serif">
              Portal Ejecutivo de la Administradora
            </h1>
            <p className="text-slate-300 text-sm mt-1.5 max-w-2xl leading-relaxed">
              Monitorea en tiempo real los contratos de corretaje firmados por concesionarios, las compraventas formalizadas con clientes, los expedientes personales y la liquidación neta de comisiones de <strong>JY Trinova S.A.S.</strong>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <Button
              onClick={() => window.open('/diagrama_flujo_neurolabs.jpg', '_blank')}
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-xs gap-1.5"
            >
              <FileText className="w-4 h-4" /> Ver Flujo de Trabajo
            </Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-md"
              onClick={() => alert("Generando reporte de auditoría legal y fiscal...")}
            >
              <Download className="w-4 h-4 mr-1.5" /> Descargar Balance
            </Button>
          </div>
        </div>

        {/* 4 Tarjetas de Métricas de Negocio de JY Trinova */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <Card className="bg-white border-slate-200 shadow-sm rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Comisiones Devengadas</span>
                <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-2xl font-bold text-slate-900">${totalCommissionsEarned.toLocaleString()}</span>
                <span className="text-xs text-slate-500 ml-1">MXN</span>
              </div>
              <div className="mt-2 text-xs text-emerald-600 font-medium flex items-center">
                <TrendingUp className="w-3.5 h-3.5 mr-1" /> 3.0% - 4.5% por corretaje
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-slate-200 shadow-sm rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Volumen Intermediado</span>
                <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-700">
                  <Car className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-2xl font-bold text-slate-900">${(totalSalesVolume / 1000000).toFixed(2)}M</span>
                <span className="text-xs text-slate-500 ml-1">MXN</span>
              </div>
              <div className="mt-2 text-xs text-slate-500 font-medium">
                En vehículos cerrados formalmente
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-slate-200 shadow-sm rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Anticipos en Custodia</span>
                <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-700">
                  <CreditCard className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-2xl font-bold text-slate-900">${totalDeposits.toLocaleString()}</span>
                <span className="text-xs text-slate-500 ml-1">MXN</span>
              </div>
              <div className="mt-2 text-xs text-emerald-600 font-medium flex items-center">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Garantía fiduciaria activa
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-slate-200 shadow-sm rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Cartera Consignada</span>
                <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-700">
                  <Building2 className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-2xl font-bold text-slate-900">${(totalAssetsConsigned / 1000000).toFixed(1)}M</span>
                <span className="text-xs text-slate-500 ml-1">MXN</span>
              </div>
              <div className="mt-2 text-xs text-slate-500 font-medium">
                {MOCK_BROKERAGE.reduce((a, b) => a + b.vehicleCount, 0)} unidades bajo mandato
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pestañas de Gestión Principal */}
        <Tabs defaultValue="sales" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white p-1.5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap h-auto gap-1">
            <TabsTrigger value="sales" className="data-[state=active]:bg-slate-900 data-[state=active]:text-white rounded-xl text-xs sm:text-sm font-semibold px-4 py-2.5 transition-all">
              <FileText className="w-4 h-4 mr-2" /> Contratos de Compraventa (Clientes)
            </TabsTrigger>
            <TabsTrigger value="customers" className="data-[state=active]:bg-slate-900 data-[state=active]:text-white rounded-xl text-xs sm:text-sm font-semibold px-4 py-2.5 transition-all">
              <Users className="w-4 h-4 mr-2" /> Expedientes de Clientes (Direcciones & Datos)
            </TabsTrigger>
            <TabsTrigger value="brokerage" className="data-[state=active]:bg-slate-900 data-[state=active]:text-white rounded-xl text-xs sm:text-sm font-semibold px-4 py-2.5 transition-all">
              <Building2 className="w-4 h-4 mr-2" /> Mandatos de Corretaje (Proveedores)
            </TabsTrigger>
            <TabsTrigger value="commissions" className="data-[state=active]:bg-slate-900 data-[state=active]:text-white rounded-xl text-xs sm:text-sm font-semibold px-4 py-2.5 transition-all">
              <Receipt className="w-4 h-4 mr-2" /> Liquidación de Comisiones & Reportes
            </TabsTrigger>
          </TabsList>

          {/* ──────────────────────────────────────────────────────────── */}
          {/* PESTAÑA 1: CONTRATOS DE COMPRAVENTA DE CLIENTES */}
          {/* ──────────────────────────────────────────────────────────── */}
          <TabsContent value="sales" className="space-y-4">
            <Card className="bg-white border-slate-200 shadow-sm rounded-2xl overflow-hidden">
              <CardHeader className="border-b border-slate-100 p-6 bg-slate-50/50">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <CardTitle className="text-lg font-bold text-slate-900 font-serif">
                      Contratos de Compraventa & Separación Formal (Compradores)
                    </CardTitle>
                    <CardDescription className="text-slate-500 text-xs mt-0.5">
                      Acuerdos mercantiles vinculantes celebrados entre el comprador, el concesionario y <strong>JY Trinova S.A.S.</strong> como intermediario garante.
                    </CardDescription>
                  </div>

                  <div className="relative w-full md:w-72">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <Input
                      placeholder="Buscar contrato, comprador o VIN..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 bg-white border-slate-200 text-xs rounded-xl"
                    />
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-slate-50/80">
                    <TableRow className="border-slate-100">
                      <TableHead className="font-semibold text-slate-700">Folio & Comprador</TableHead>
                      <TableHead className="font-semibold text-slate-700">Vehículo / Concesionario</TableHead>
                      <TableHead className="font-semibold text-slate-700">Precio Pactado</TableHead>
                      <TableHead className="font-semibold text-slate-700">Anticipo</TableHead>
                      <TableHead className="font-semibold text-slate-700">Comisión Trinova</TableHead>
                      <TableHead className="font-semibold text-slate-700">Estado</TableHead>
                      <TableHead className="text-right font-semibold text-slate-700">Acción</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {MOCK_SALES.map((sale) => (
                      <TableRow key={sale.id} className="border-slate-100 hover:bg-slate-50/60 transition-colors">
                        <TableCell>
                          <div className="font-bold text-slate-900">{sale.buyerName}</div>
                          <div className="text-xs text-slate-500 font-mono">{sale.code} • {sale.buyerId}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm font-medium text-slate-800">{sale.vehicleName}</div>
                          <div className="text-xs text-slate-500">{sale.dealershipName} (VIN: {sale.vehicleVin.slice(-6)})</div>
                        </TableCell>
                        <TableCell className="text-sm font-bold text-slate-900">
                          ${sale.agreedPrice.toLocaleString()} MXN
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-200 font-medium">
                            ${sale.depositAmount.toLocaleString()} MXN
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm font-bold text-slate-900">${sale.commissionAmount.toLocaleString()} MXN</div>
                          <div className="text-[11px] text-slate-500">{sale.commissionPercentage}% corretaje</div>
                        </TableCell>
                        <TableCell>
                          {sale.status === 'PAGADO_Y_CERRADO' && (
                            <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">Pagado & Cerrado</Badge>
                          )}
                          {sale.status === 'ANTICIPO_DEPOSITADO' && (
                            <Badge className="bg-blue-50 text-blue-800 border-blue-200">Anticipo en Custodia</Badge>
                          )}
                          {sale.status === 'EN_FIRMA' && (
                            <Badge className="bg-amber-50 text-amber-800 border-amber-200">En Firma</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedSale(sale)}
                            className="border-slate-200 text-slate-700 hover:text-black hover:bg-slate-100 text-xs"
                          >
                            <Eye className="w-3.5 h-3.5 mr-1" /> Ver Contrato
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ──────────────────────────────────────────────────────────── */}
          {/* PESTAÑA 2: EXPEDIENTES DE CLIENTES */}
          {/* ──────────────────────────────────────────────────────────── */}
          <TabsContent value="customers" className="space-y-4">
            <Card className="bg-white border-slate-200 shadow-sm rounded-2xl overflow-hidden">
              <CardHeader className="border-b border-slate-100 p-6 bg-slate-50/50">
                <CardTitle className="text-lg font-bold text-slate-900 font-serif">
                  Padrón & Expedientes de Clientes Compradores
                </CardTitle>
                <CardDescription className="text-slate-500 text-xs">
                  Directorio confidencial con domicilios comprobados, identificaciones oficiales (RFC/CURP) y expedientes de debida diligencia.
                </CardDescription>
              </CardHeader>

              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-slate-50/80">
                    <TableRow className="border-slate-100">
                      <TableHead className="font-semibold text-slate-700">Nombre & Identificación</TableHead>
                      <TableHead className="font-semibold text-slate-700">Domicilio Residencial Completo</TableHead>
                      <TableHead className="font-semibold text-slate-700">Contacto Directo</TableHead>
                      <TableHead className="font-semibold text-slate-700">Vehículo Adquirido</TableHead>
                      <TableHead className="font-semibold text-slate-700">Estado KYC</TableHead>
                      <TableHead className="text-right font-semibold text-slate-700">Acción</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {MOCK_CUSTOMERS.map((cust) => (
                      <TableRow key={cust.id} className="border-slate-100 hover:bg-slate-50/60 transition-colors">
                        <TableCell>
                          <div className="font-bold text-slate-900">{cust.fullName}</div>
                          <div className="text-xs text-slate-500 font-mono">{cust.identification}</div>
                        </TableCell>
                        <TableCell className="max-w-xs">
                          <div className="text-xs text-slate-800 flex items-start gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                            <span>{cust.address}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-xs font-medium text-slate-800 flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-400" /> {cust.phone}
                          </div>
                          <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                            <Mail className="w-3 h-3 text-slate-400" /> {cust.email}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm font-medium text-slate-900">{cust.preferredVehicle}</div>
                          <div className="text-xs text-slate-500 font-semibold">${cust.totalSpent.toLocaleString()} MXN</div>
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-emerald-50 text-emerald-800 border-emerald-200 flex items-center gap-1 w-fit">
                            <UserCheck className="w-3 h-3" /> Verificado
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedCustomer(cust)}
                            className="border-slate-200 text-slate-700 hover:text-black hover:bg-slate-100 text-xs"
                          >
                            <Eye className="w-3.5 h-3.5 mr-1" /> Ver Ficha
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ──────────────────────────────────────────────────────────── */}
          {/* PESTAÑA 3: MANDATOS DE CORRETAJE (PROVEEDORES) */}
          {/* ──────────────────────────────────────────────────────────── */}
          <TabsContent value="brokerage" className="space-y-4">
            <Card className="bg-white border-slate-200 shadow-sm rounded-2xl overflow-hidden">
              <CardHeader className="border-b border-slate-100 p-6 bg-slate-50/50">
                <CardTitle className="text-lg font-bold text-slate-900 font-serif">
                  Mandatos Mercantiles de Corretaje (Concesionarias & Proveedores)
                </CardTitle>
                <CardDescription className="text-slate-500 text-xs">
                  Contratos suscritos a través de la plataforma por personas jurídicas y naturales otorgando a <strong>JY Trinova S.A.S.</strong> la facultad de intermediación.
                </CardDescription>
              </CardHeader>

              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-slate-50/80">
                    <TableRow className="border-slate-100">
                      <TableHead className="font-semibold text-slate-700">Proveedor & Tipo</TableHead>
                      <TableHead className="font-semibold text-slate-700">Razón Social & RFC</TableHead>
                      <TableHead className="font-semibold text-slate-700">Comisión Pactada</TableHead>
                      <TableHead className="font-semibold text-slate-700">Unidades Consignadas</TableHead>
                      <TableHead className="font-semibold text-slate-700">Fecha de Firma</TableHead>
                      <TableHead className="font-semibold text-slate-700">Estado</TableHead>
                      <TableHead className="text-right font-semibold text-slate-700">Acción</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {MOCK_BROKERAGE.map((contract) => (
                      <TableRow key={contract.id} className="border-slate-100 hover:bg-slate-50/60 transition-colors">
                        <TableCell>
                          <div className="font-bold text-slate-900">{contract.providerName}</div>
                          <div className="text-xs text-slate-500 font-mono">{contract.code} • {contract.providerType}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-slate-800">{contract.legalName}</div>
                          <div className="text-xs text-slate-500">{contract.taxId} • {contract.city}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="bg-slate-100 text-slate-800 font-bold">
                            {contract.commissionRate}% + IVA
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm font-medium text-slate-900">{contract.vehicleCount} unidades</div>
                          <div className="text-xs text-slate-500">${(contract.totalAssetValue / 1000000).toFixed(1)}M MXN</div>
                        </TableCell>
                        <TableCell className="text-sm text-slate-700">
                          {contract.signedAt}
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-emerald-50 text-emerald-800 border-emerald-200">Vigente</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedBrokerage(contract)}
                            className="border-slate-200 text-slate-700 hover:text-black hover:bg-slate-100 text-xs"
                          >
                            <Eye className="w-3.5 h-3.5 mr-1" /> Ver Mandato
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ──────────────────────────────────────────────────────────── */}
          {/* PESTAÑA 4: COMISIONES & REPORTES FINANCIEROS */}
          {/* ──────────────────────────────────────────────────────────── */}
          <TabsContent value="commissions" className="space-y-4">
            <Card className="bg-white border-slate-200 shadow-sm rounded-2xl overflow-hidden">
              <CardHeader className="border-b border-slate-100 p-6 bg-slate-50/50">
                <CardTitle className="text-lg font-bold text-slate-900 font-serif">
                  Liquidación de Comisiones de Corretaje (JY Trinova S.A.S.)
                </CardTitle>
                <CardDescription className="text-slate-500 text-xs">
                  Auditoría financiera de ingresos por intermediación mercantil devengados en el período.
                </CardDescription>
              </CardHeader>

              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
                    <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">Total Comisiones Devengadas</span>
                    <div className="text-2xl font-bold text-slate-900 mt-2">${totalCommissionsEarned.toLocaleString()} MXN</div>
                    <p className="text-xs text-slate-500 mt-1">Ingreso neto por intermediación mercantil</p>
                  </div>
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
                    <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">Comisiones Liquidadas</span>
                    <div className="text-2xl font-bold text-emerald-700 mt-2">$29,750 MXN</div>
                    <p className="text-xs text-emerald-600 mt-1">1 contrato pagado al 100%</p>
                  </div>
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
                    <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">Comisiones por Cobrar / Custodia</span>
                    <div className="text-2xl font-bold text-amber-700 mt-2">$54,500 MXN</div>
                    <p className="text-xs text-amber-600 mt-1">2 contratos en fase de entrega y anticipo</p>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 p-4 bg-slate-50 text-xs text-slate-600 leading-relaxed">
                  <strong>Protocolo de Liquidación Fiduciaria:</strong> De conformidad con los Mandatos de Corretaje celebrados por <strong>JY Trinova S.A.S.</strong>, las comisiones se liberan automáticamente en la cuenta bancaria de la empresa una vez confirmada la entrega física del vehículo y el endoso de factura.
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* ──────────────────────────────────────────────────────────── */}
        {/* MODAL DETALLE DE COMPRAVENTA DE CLIENTE */}
        {/* ──────────────────────────────────────────────────────────── */}
        {selectedSale && (
          <Dialog open={!!selectedSale} onOpenChange={(open) => !open && setSelectedSale(null)}>
            <DialogContent className="max-w-3xl bg-white border-slate-200 p-0 overflow-hidden rounded-2xl">
              <DialogHeader className="p-6 border-b border-slate-100 bg-slate-50/50">
                <div className="flex items-center justify-between">
                  <div>
                    <DialogTitle className="text-xl font-bold text-slate-900 font-serif">
                      Contrato Privado de Compraventa con Intermediación
                    </DialogTitle>
                    <DialogDescription className="text-slate-500 text-xs font-mono mt-1">
                      Folio: {selectedSale.code} • Intermediado por JY Trinova S.A.S.
                    </DialogDescription>
                  </div>
                  <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">
                    {selectedSale.status}
                  </Badge>
                </div>
              </DialogHeader>

              <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto text-xs">
                {/* Partes */}
                <div className="grid grid-cols-3 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div>
                    <span className="font-bold text-slate-400 uppercase tracking-wider block mb-1">Comprador</span>
                    <div className="font-bold text-slate-900 text-sm">{selectedSale.buyerName}</div>
                    <div className="text-slate-500">{selectedSale.buyerId}</div>
                    <div className="text-slate-600 mt-1">{selectedSale.buyerPhone}</div>
                  </div>
                  <div>
                    <span className="font-bold text-slate-400 uppercase tracking-wider block mb-1">Intermediario Garante</span>
                    <div className="font-bold text-slate-900 text-sm">JY Trinova S.A.S.</div>
                    <div className="text-slate-500">Corretaje Automotriz</div>
                    <div className="text-slate-600 mt-1">contacto@jjtrinova.com</div>
                  </div>
                  <div>
                    <span className="font-bold text-slate-400 uppercase tracking-wider block mb-1">Concesionario</span>
                    <div className="font-bold text-slate-900 text-sm">{selectedSale.dealershipName}</div>
                    <div className="text-slate-500">Inventario Consignado</div>
                    <div className="text-slate-600 mt-1">VIN: {selectedSale.vehicleVin}</div>
                  </div>
                </div>

                {/* Domicilio */}
                <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
                  <span className="text-xs uppercase font-bold text-slate-400">Domicilio Legal del Comprador</span>
                  <p className="text-sm font-medium text-slate-900">{selectedSale.buyerAddress}</p>
                </div>

                {/* Términos Financieros */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="text-slate-400">Precio Pactado</span>
                    <div className="text-base font-bold text-slate-900 mt-0.5">${selectedSale.agreedPrice.toLocaleString()} MXN</div>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="text-slate-400">Anticipo en Custodia</span>
                    <div className="text-base font-bold text-emerald-700 mt-0.5">${selectedSale.depositAmount.toLocaleString()} MXN</div>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="text-slate-400">Comisión Trinova ({selectedSale.commissionPercentage}%)</span>
                    <div className="text-base font-bold text-slate-900 mt-0.5">${selectedSale.commissionAmount.toLocaleString()} MXN</div>
                  </div>
                </div>

                {/* Hash */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                  <span className="text-[11px] uppercase font-bold text-slate-400">Firma Criptográfica SHA-256</span>
                  <div className="flex items-center gap-2">
                    <code className="text-[10px] bg-white p-2 rounded border border-slate-200 flex-1 truncate font-mono text-slate-700">
                      {selectedSale.signatureHash}
                    </code>
                    <Button size="sm" variant="outline" onClick={() => copyToClipboard(selectedSale.signatureHash)} className="h-7 text-xs">
                      {copiedHash ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    </Button>
                  </div>
                </div>
              </div>

              <DialogFooter className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
                <Button variant="outline" size="sm" onClick={() => setSelectedSale(null)}>Cerrar</Button>
                <Button size="sm" className="bg-slate-900 text-white" onClick={() => alert(`Descargando Contrato Compraventa: ${selectedSale.code}`)}>
                  <Download className="w-4 h-4 mr-1.5" /> Descargar PDF Certificado
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* ──────────────────────────────────────────────────────────── */}
        {/* MODAL FICHA DE CLIENTE */}
        {/* ──────────────────────────────────────────────────────────── */}
        {selectedCustomer && (
          <Dialog open={!!selectedCustomer} onOpenChange={(open) => !open && setSelectedCustomer(null)}>
            <DialogContent className="max-w-md bg-white border-slate-200 rounded-2xl">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-slate-900 font-serif">{selectedCustomer.fullName}</DialogTitle>
                <DialogDescription className="text-xs text-slate-500 font-mono">{selectedCustomer.identification}</DialogDescription>
              </DialogHeader>
              <div className="space-y-3 text-xs py-2">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="font-bold text-slate-400 uppercase">Domicilio Residencial</span>
                  <p className="font-medium text-slate-800 mt-1 text-sm">{selectedCustomer.address}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-400">Teléfono</span>
                    <div className="font-semibold text-slate-900 mt-0.5">{selectedCustomer.phone}</div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-400">Correo</span>
                    <div className="font-semibold text-slate-900 mt-0.5 truncate">{selectedCustomer.email}</div>
                  </div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400">Vehículo Adquirido</span>
                  <div className="font-bold text-slate-900 mt-0.5 text-sm">{selectedCustomer.preferredVehicle}</div>
                  <div className="text-xs text-emerald-700 font-semibold mt-0.5">${selectedCustomer.totalSpent.toLocaleString()} MXN</div>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={() => setSelectedCustomer(null)} className="w-full bg-slate-900 text-white text-xs">
                  Cerrar Expediente
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* ──────────────────────────────────────────────────────────── */}
        {/* MODAL DETALLE DE MANDATO DE CORRETAJE */}
        {/* ──────────────────────────────────────────────────────────── */}
        {selectedBrokerage && (
          <Dialog open={!!selectedBrokerage} onOpenChange={(open) => !open && setSelectedBrokerage(null)}>
            <DialogContent className="max-w-2xl bg-white border-slate-200 p-0 overflow-hidden rounded-2xl">
              <DialogHeader className="p-6 border-b border-slate-100 bg-slate-50/50">
                <div className="flex items-center justify-between">
                  <div>
                    <DialogTitle className="text-xl font-bold text-slate-900 font-serif">
                      Mandato de Corretaje Mercantil (Proveedor)
                    </DialogTitle>
                    <DialogDescription className="text-slate-500 text-xs font-mono mt-1">
                      ID: {selectedBrokerage.code} • Celebrado con JY Trinova S.A.S.
                    </DialogDescription>
                  </div>
                  <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">
                    VIGENTE
                  </Badge>
                </div>
              </DialogHeader>

              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto text-xs">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="flex justify-between"><span className="text-slate-500">Proveedor:</span> <strong className="text-slate-900">{selectedBrokerage.providerName}</strong></div>
                  <div className="flex justify-between"><span className="text-slate-500">Tipo de Persona:</span> <span className="text-slate-800">{selectedBrokerage.providerType}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Razón Social:</span> <span className="text-slate-800">{selectedBrokerage.legalName}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">RFC / Tax ID:</span> <span className="text-slate-800 font-mono">{selectedBrokerage.taxId}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Comisión Pactada:</span> <strong className="text-emerald-700">{selectedBrokerage.commissionRate}% + IVA</strong></div>
                  <div className="flex justify-between"><span className="text-slate-500">Autos en Consignación:</span> <span className="text-slate-800">{selectedBrokerage.vehicleCount} unidades</span></div>
                </div>
              </div>

              <DialogFooter className="p-4 border-t border-slate-100 bg-slate-50">
                <Button variant="outline" size="sm" onClick={() => setSelectedBrokerage(null)}>Cerrar</Button>
                <Button size="sm" className="bg-slate-900 text-white" onClick={() => alert(`Descargando Mandato ${selectedBrokerage.code}...`)}>
                  <Download className="w-4 h-4 mr-1.5" /> Descargar Mandato (PDF)
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </main>
    </div>
  )
}
