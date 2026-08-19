'use client'

import React, { useState } from 'react'
import {
  FileText,
  Building2,
  CheckCircle2,
  Clock,
  Download,
  Search,
  ShieldCheck,
  Eye,
  SlidersHorizontal,
  FileCheck2,
  DollarSign,
  TrendingUp,
  Percent,
  Calendar,
  ExternalLink,
  ChevronRight,
  Sparkles,
  ArrowUpRight,
  Filter,
  Check,
  Copy,
  AlertCircle,
  Users,
  Car,
  MapPin,
  Phone,
  Mail,
  UserCheck,
  CreditCard,
  Receipt,
  Scale
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
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

// 1. Interfaz Contrato de Corretaje (Proveedor ➔ JY Trinova S.A.S.)
interface BrokerageContract {
  id: string
  code: string
  providerName: string
  legalName: string
  taxId: string
  city: string
  commissionRate: number
  vehicleCount: number
  totalAssetValue: number
  signedAt: string
  expiresAt: string
  status: 'VIGENTE' | 'EN_REVISION' | 'POR_RENOVAR'
  signatureHash: string
  signerName: string
  signerRole: string
  signerEmail: string
}

// 2. Interfaz Contrato de Compraventa / Separación (Cliente ➔ JY Trinova S.A.S. ➔ Concesionario)
interface ClientSaleContract {
  id: string
  code: string
  buyerName: string
  buyerId: string // RFC o Cédula
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
  status: 'PAGADO_Y_CERRADO' | 'ANTICIPO_DEPOSITADO' | 'EN_FIRMA' | 'EN_REVISION_LEGAL'
  paymentMethod: 'Transferencia Bancaria SPEI' | 'Crédito Automotriz Aprobado' | 'Contado'
  signatureHash: string
}

// 3. Interfaz Directorio de Clientes
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

const MOCK_BROKERAGE_CONTRACTS: BrokerageContract[] = [
  {
    id: 'cnt-101',
    code: 'TRN-CORR-2026-001',
    providerName: 'Grupo Automotriz Premier',
    legalName: 'Distribuidora Premier del Norte S.A. de C.V.',
    taxId: 'DPN850412KL9',
    city: 'Monterrey, N.L.',
    commissionRate: 3.5,
    vehicleCount: 18,
    totalAssetValue: 14250000,
    signedAt: '2026-08-01',
    expiresAt: '2027-08-01',
    status: 'VIGENTE',
    signatureHash: 'sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    signerName: 'Lic. Alejandro Garza Morales',
    signerRole: 'Representante Legal',
    signerEmail: 'alejandro.garza@premierauto.com'
  },
  {
    id: 'cnt-102',
    code: 'TRN-CORR-2026-002',
    providerName: 'Valle Alto Seminuevos',
    legalName: 'Comercializadora de Vehículos Valle Alto S.A.',
    taxId: 'CVV9108237T1',
    city: 'Guadalajara, Jal.',
    commissionRate: 4.0,
    vehicleCount: 12,
    totalAssetValue: 8900000,
    signedAt: '2026-08-05',
    expiresAt: '2027-08-05',
    status: 'VIGENTE',
    signatureHash: 'sha256:88d4266fd4e6338d13b845fcf289579d209c897823b9217da3e161936f031589',
    signerName: 'Ing. Sofía Mendoza Rivas',
    signerRole: 'Directora Comercial',
    signerEmail: 'sofia@vallealtoseminuevos.com'
  },
  {
    id: 'cnt-103',
    code: 'TRN-CORR-2026-003',
    providerName: 'Kavak Partners CDMX',
    legalName: 'Operadora de Flotillas Metropolitanas S.A.P.I.',
    taxId: 'OFM170204AB3',
    city: 'Ciudad de México',
    commissionRate: 3.0,
    vehicleCount: 35,
    totalAssetValue: 29800000,
    signedAt: '2026-08-10',
    expiresAt: '2027-08-10',
    status: 'VIGENTE',
    signatureHash: 'sha256:bc6e52518e90ffab9994c66ff97f5877c22956cfb2caea453715c0e14db834ae',
    signerName: 'Mtro. Fernando Castillo Ruiz',
    signerRole: 'Apoderado Legal',
    signerEmail: 'f.castillo@kavakpartners.mx'
  }
]

const MOCK_CLIENT_CONTRACTS: ClientSaleContract[] = [
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
    commissionAmount: 29750, // 3.5%
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
    commissionAmount: 28500, // 3.0%
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
    commissionAmount: 26000, // 4.0%
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

export default function TrinovaAdminPortalPage() {
  const [activeTab, setActiveTab] = useState('client-contracts')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedBrokerage, setSelectedBrokerage] = useState<BrokerageContract | null>(null)
  const [selectedClientContract, setSelectedClientContract] = useState<ClientSaleContract | null>(null)
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerProfile | null>(null)
  const [copiedHash, setCopiedHash] = useState(false)

  // Totales
  const totalSalesVolume = MOCK_CLIENT_CONTRACTS.reduce((acc, c) => acc + c.agreedPrice, 0)
  const totalCommissionsEarned = MOCK_CLIENT_CONTRACTS.reduce((acc, c) => acc + c.commissionAmount, 0)
  const totalDepositsCollected = MOCK_CLIENT_CONTRACTS.reduce((acc, c) => acc + c.depositAmount, 0)

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedHash(true)
    setTimeout(() => setCopiedHash(false), 2000)
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Encabezado Corporativo */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded-full">
              Portal de Administración & Intermediación
            </span>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Entidad Operativa: JY Trinova S.A.S.
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 font-serif mt-2">
            Control de Contratos, Clientes & Comisiones
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Gestión fiduciaria de compraventas de clientes, mandatos mercantiles con proveedores y liquidación de corretaje.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" className="border-slate-200 text-slate-700 hover:text-black">
            <Download className="w-4 h-4 mr-2" /> Exportar Auditoría
          </Button>
          <Button className="bg-slate-900 hover:bg-slate-800 text-white rounded-lg shadow-sm">
            <FileCheck2 className="w-4 h-4 mr-2" /> Emitir Nuevo Contrato
          </Button>
        </div>
      </div>

      {/* Tarjetas de Métricas Ejecutivas Trinova */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="bg-white border-slate-200 shadow-sm rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Comisiones JY Trinova</span>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-bold text-slate-900">${(totalCommissionsEarned).toLocaleString()}</span>
              <span className="text-xs text-slate-500 ml-1">MXN</span>
            </div>
            <div className="mt-2 text-xs text-emerald-600 font-medium flex items-center">
              <TrendingUp className="w-3.5 h-3.5 mr-1" /> Devengadas en 3 operaciones
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 shadow-sm rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Volumen Comercial Cerrado</span>
              <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-700">
                <Car className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-bold text-slate-900">${(totalSalesVolume / 1000000).toFixed(2)}M</span>
              <span className="text-xs text-slate-500 ml-1">MXN</span>
            </div>
            <div className="mt-2 text-xs text-slate-500 font-medium">
              3 compraventas formalizadas
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
              <span className="text-2xl font-bold text-slate-900">${(totalDepositsCollected).toLocaleString()}</span>
              <span className="text-xs text-slate-500 ml-1">MXN</span>
            </div>
            <div className="mt-2 text-xs text-emerald-600 font-medium flex items-center">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Cuentas bancarias verificadas
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 shadow-sm rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Seguridad Jurídica</span>
              <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-700">
                <Scale className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-bold text-slate-900">NOM-151</span>
            </div>
            <div className="mt-2 text-xs text-slate-500 font-medium">
              Constancias y firmas no repudiables
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Navegación por Pestañas */}
      <Tabs defaultValue="client-contracts" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-slate-100 p-1 rounded-xl border border-slate-200">
          <TabsTrigger value="client-contracts" className="data-[state=active]:bg-white data-[state=active]:text-slate-900 rounded-lg text-sm font-medium px-4 py-2">
            <FileText className="w-4 h-4 mr-2" /> Contratos Compraventa (Clientes)
          </TabsTrigger>
          <TabsTrigger value="customers" className="data-[state=active]:bg-white data-[state=active]:text-slate-900 rounded-lg text-sm font-medium px-4 py-2">
            <Users className="w-4 h-4 mr-2" /> Expedientes de Clientes (Datos Personales)
          </TabsTrigger>
          <TabsTrigger value="brokerage-contracts" className="data-[state=active]:bg-white data-[state=active]:text-slate-900 rounded-lg text-sm font-medium px-4 py-2">
            <Building2 className="w-4 h-4 mr-2" /> Mandatos de Corretaje (Proveedores)
          </TabsTrigger>
          <TabsTrigger value="commissions" className="data-[state=active]:bg-white data-[state=active]:text-slate-900 rounded-lg text-sm font-medium px-4 py-2">
            <Receipt className="w-4 h-4 mr-2" /> Liquidación de Comisiones
          </TabsTrigger>
        </TabsList>

        {/* ──────────────────────────────────────────────────────────── */}
        {/* PESTAÑA 1: CONTRATOS DE COMPRAVENTA DE CLIENTES */}
        {/* ──────────────────────────────────────────────────────────── */}
        <TabsContent value="client-contracts" className="space-y-4">
          <Card className="bg-white border-slate-200 shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="border-b border-slate-100 p-6 bg-slate-50/50">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <CardTitle className="text-lg font-bold text-slate-900">
                    Contratos de Compraventa & Separación Formal (Compradores)
                  </CardTitle>
                  <CardDescription className="text-slate-500 text-sm">
                    Acuerdos mercantiles vinculantes donde el cliente formaliza la adquisición de su vehículo con la intermediación de JY Trinova S.A.S.
                  </CardDescription>
                </div>

                <div className="relative w-full md:w-72">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <Input
                    placeholder="Buscar por cliente, SKU o código..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 bg-white border-slate-200 text-sm rounded-lg"
                  />
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-slate-50/80">
                  <TableRow className="border-slate-100 hover:bg-transparent">
                    <TableHead className="font-semibold text-slate-700">Contrato & Cliente</TableHead>
                    <TableHead className="font-semibold text-slate-700">Vehículo / Concesionario</TableHead>
                    <TableHead className="font-semibold text-slate-700">Monto Total</TableHead>
                    <TableHead className="font-semibold text-slate-700">Anticipo</TableHead>
                    <TableHead className="font-semibold text-slate-700">Comisión Trinova</TableHead>
                    <TableHead className="font-semibold text-slate-700">Estado</TableHead>
                    <TableHead className="text-right font-semibold text-slate-700">Acción</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {MOCK_CLIENT_CONTRACTS.map((contract) => (
                    <TableRow key={contract.id} className="border-slate-100 hover:bg-slate-50/60 transition-colors">
                      <TableCell>
                        <div className="font-semibold text-slate-900">{contract.buyerName}</div>
                        <div className="text-xs text-slate-500 font-mono">{contract.code} • {contract.buyerId}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-medium text-slate-800">{contract.vehicleName}</div>
                        <div className="text-xs text-slate-500">{contract.dealershipName} (VIN: {contract.vehicleVin.slice(-6)})</div>
                      </TableCell>
                      <TableCell className="text-sm font-bold text-slate-900">
                        ${contract.agreedPrice.toLocaleString()} MXN
                      </TableCell>
                      <TableCell className="text-sm text-slate-700">
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-200 font-medium">
                          ${contract.depositAmount.toLocaleString()} MXN
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-semibold text-slate-900">${contract.commissionAmount.toLocaleString()} MXN</div>
                        <div className="text-[11px] text-slate-500 font-medium">{contract.commissionPercentage}% de corretaje</div>
                      </TableCell>
                      <TableCell>
                        {contract.status === 'PAGADO_Y_CERRADO' && (
                          <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">Pagado & Cerrado</Badge>
                        )}
                        {contract.status === 'ANTICIPO_DEPOSITADO' && (
                          <Badge className="bg-blue-50 text-blue-800 border-blue-200">Anticipo en Custodia</Badge>
                        )}
                        {contract.status === 'EN_FIRMA' && (
                          <Badge className="bg-amber-50 text-amber-800 border-amber-200">En Proceso de Firma</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedClientContract(contract)}
                          className="border-slate-200 text-slate-700 hover:text-black hover:bg-slate-100"
                        >
                          <Eye className="w-3.5 h-3.5 mr-1.5" /> Ver Contrato
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
        {/* PESTAÑA 2: EXPEDIENTES DE CLIENTES (DATOS PERSONALES & DOMICILIO) */}
        {/* ──────────────────────────────────────────────────────────── */}
        <TabsContent value="customers" className="space-y-4">
          <Card className="bg-white border-slate-200 shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="border-b border-slate-100 p-6 bg-slate-50/50">
              <CardTitle className="text-lg font-bold text-slate-900">
                Padrón de Compradores & Clientes Registrados
              </CardTitle>
              <CardDescription className="text-slate-500 text-sm">
                Registro de identidad, direcciones fiscales/residenciales y expedientes de debida diligencia de clientes atendidos por el Asesor IA y cerrados por Trinova.
              </CardDescription>
            </CardHeader>

            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-slate-50/80">
                  <TableRow className="border-slate-100 hover:bg-transparent">
                    <TableHead className="font-semibold text-slate-700">Nombre & Identificación</TableHead>
                    <TableHead className="font-semibold text-slate-700">Dirección Residencial Completa</TableHead>
                    <TableHead className="font-semibold text-slate-700">Contacto Directo</TableHead>
                    <TableHead className="font-semibold text-slate-700">Vehículo Adquirido</TableHead>
                    <TableHead className="font-semibold text-slate-700">Verificación KYC</TableHead>
                    <TableHead className="text-right font-semibold text-slate-700">Expediente</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {MOCK_CUSTOMERS.map((cust) => (
                    <TableRow key={cust.id} className="border-slate-100 hover:bg-slate-50/60 transition-colors">
                      <TableCell>
                        <div className="font-semibold text-slate-900">{cust.fullName}</div>
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
                        <div className="text-xs text-slate-500">${cust.totalSpent.toLocaleString()} MXN</div>
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
                          className="border-slate-200 text-slate-700 hover:text-black hover:bg-slate-100"
                        >
                          <Eye className="w-3.5 h-3.5 mr-1.5" /> Ficha Cliente
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
        <TabsContent value="brokerage-contracts" className="space-y-4">
          <Card className="bg-white border-slate-200 shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="border-b border-slate-100 p-6 bg-slate-50/50">
              <CardTitle className="text-lg font-bold text-slate-900">
                Mandatos Mercantiles de Corretaje (Concesionarias & Proveedores)
              </CardTitle>
              <CardDescription className="text-slate-500 text-sm">
                Contratos firmados donde los lotes y agencias otorgan a JY Trinova S.A.S. la exclusividad o mandato para intermediar su inventario.
              </CardDescription>
            </CardHeader>

            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-slate-50/80">
                  <TableRow className="border-slate-100 hover:bg-transparent">
                    <TableHead className="font-semibold text-slate-700">Proveedor & Código</TableHead>
                    <TableHead className="font-semibold text-slate-700">Razón Social & RFC</TableHead>
                    <TableHead className="font-semibold text-slate-700">Comisión Pactada</TableHead>
                    <TableHead className="font-semibold text-slate-700">Autos en Consignación</TableHead>
                    <TableHead className="font-semibold text-slate-700">Vigencia</TableHead>
                    <TableHead className="font-semibold text-slate-700">Estado</TableHead>
                    <TableHead className="text-right font-semibold text-slate-700">Acción</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {MOCK_BROKERAGE_CONTRACTS.map((contract) => (
                    <TableRow key={contract.id} className="border-slate-100 hover:bg-slate-50/60 transition-colors">
                      <TableCell>
                        <div className="font-semibold text-slate-900">{contract.providerName}</div>
                        <div className="text-xs text-slate-500 font-mono">{contract.code}</div>
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
                        <div className="text-sm font-medium text-slate-900">{contract.vehicleCount} vehículos</div>
                        <div className="text-xs text-slate-500">${(contract.totalAssetValue / 1000000).toFixed(1)}M MXN</div>
                      </TableCell>
                      <TableCell className="text-sm text-slate-700">
                        {contract.signedAt} al {contract.expiresAt}
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-emerald-50 text-emerald-800 border-emerald-200">Vigente</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedBrokerage(contract)}
                          className="border-slate-200 text-slate-700 hover:text-black hover:bg-slate-100"
                        >
                          <Eye className="w-3.5 h-3.5 mr-1.5" /> Ver Mandato
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
        {/* PESTAÑA 4: LIQUIDACIÓN DE COMISIONES & REPORTES FINANCIEROS */}
        {/* ──────────────────────────────────────────────────────────── */}
        <TabsContent value="commissions" className="space-y-4">
          <Card className="bg-white border-slate-200 shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="border-b border-slate-100 p-6 bg-slate-50/50">
              <CardTitle className="text-lg font-bold text-slate-900">
                Liquidación de Comisiones & Reportes Financieros de JY Trinova S.A.S.
              </CardTitle>
              <CardDescription className="text-slate-500 text-sm">
                Desglose financiero de ingresos por corretaje mercantil automotriz correspondientes a la empresa intermediaria.
              </CardDescription>
            </CardHeader>

            <CardContent className="p-6">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
                    <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">Total Comisiones Devengadas</span>
                    <div className="text-2xl font-bold text-slate-900 mt-2">${totalCommissionsEarned.toLocaleString()} MXN</div>
                    <p className="text-xs text-slate-500 mt-1">Ingreso neto por intermediación mercantil</p>
                  </div>
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
                    <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">Comisiones Liquidadas en Banco</span>
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
                  <strong>Cláusula de Transparencia Fiduciaria:</strong> De conformidad con los Mandatos de Corretaje Comercial celebrados por <strong>JY Trinova S.A.S.</strong>, las comisiones se liberan automáticamente una vez que la entrega física del vehículo y el endoso de factura son completados satisfactoriamente entre el concesionario y el comprador final.
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ──────────────────────────────────────────────────────────── */}
      {/* MODAL DETALLE DE CONTRATO DE COMPRAVENTA DE CLIENTE */}
      {/* ──────────────────────────────────────────────────────────── */}
      {selectedClientContract && (
        <Dialog open={!!selectedClientContract} onOpenChange={(open) => !open && setSelectedClientContract(null)}>
          <DialogContent className="max-w-3xl bg-white border-slate-200 p-0 overflow-hidden rounded-2xl">
            <DialogHeader className="p-6 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center justify-between">
                <div>
                  <DialogTitle className="text-xl font-bold text-slate-900 font-serif">
                    Contrato de Compraventa & Separación Vehicular
                  </DialogTitle>
                  <DialogDescription className="text-slate-500 text-xs font-mono mt-1">
                    Folio: {selectedClientContract.code} • Intermediado por JY Trinova S.A.S.
                  </DialogDescription>
                </div>
                <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">
                  {selectedClientContract.status}
                </Badge>
              </div>
            </DialogHeader>

            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              {/* Partes */}
              <div className="grid grid-cols-3 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <div>
                  <span className="font-bold text-slate-400 uppercase tracking-wider block mb-1">Comprador Final</span>
                  <div className="font-bold text-slate-900 text-sm">{selectedClientContract.buyerName}</div>
                  <div className="text-slate-500">{selectedClientContract.buyerId}</div>
                  <div className="text-slate-600 mt-1">{selectedClientContract.buyerPhone}</div>
                </div>
                <div>
                  <span className="font-bold text-slate-400 uppercase tracking-wider block mb-1">Intermediario Garante</span>
                  <div className="font-bold text-slate-900 text-sm">JY Trinova S.A.S.</div>
                  <div className="text-slate-500">Corretaje Automotriz</div>
                  <div className="text-slate-600 mt-1">contacto@jjtrinova.com</div>
                </div>
                <div>
                  <span className="font-bold text-slate-400 uppercase tracking-wider block mb-1">Concesionario Proveedor</span>
                  <div className="font-bold text-slate-900 text-sm">{selectedClientContract.dealershipName}</div>
                  <div className="text-slate-500">Inventario Consignado</div>
                  <div className="text-slate-600 mt-1">VIN: {selectedClientContract.vehicleVin}</div>
                </div>
              </div>

              {/* Domicilio del Comprador */}
              <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-1">
                <span className="text-xs uppercase font-bold text-slate-400">Domicilio Legal del Comprador</span>
                <p className="text-sm font-medium text-slate-900">{selectedClientContract.buyerAddress}</p>
              </div>

              {/* Términos Financieros */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-xs text-slate-400">Precio Pactado</span>
                  <div className="text-lg font-bold text-slate-900 mt-1">${selectedClientContract.agreedPrice.toLocaleString()} MXN</div>
                </div>
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-xs text-slate-400">Anticipo / Reserva</span>
                  <div className="text-lg font-bold text-emerald-700 mt-1">${selectedClientContract.depositAmount.toLocaleString()} MXN</div>
                </div>
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-xs text-slate-400">Comisión Trinova ({selectedClientContract.commissionPercentage}%)</span>
                  <div className="text-lg font-bold text-slate-900 mt-1">${selectedClientContract.commissionAmount.toLocaleString()} MXN</div>
                </div>
              </div>

              {/* Certificación Criptográfica */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Método de Pago:</span>
                  <strong className="text-slate-900">{selectedClientContract.paymentMethod}</strong>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Sello de Tiempo (Timestamp):</span>
                  <strong className="text-slate-900">{selectedClientContract.signedAt} UTC</strong>
                </div>
                <div className="pt-2 border-t border-slate-200">
                  <span className="text-[11px] uppercase font-bold text-slate-400">Huella Digital del Contrato (SHA-256)</span>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="text-[10px] bg-white p-2 rounded border border-slate-200 flex-1 truncate font-mono text-slate-700">
                      {selectedClientContract.signatureHash}
                    </code>
                    <Button size="sm" variant="outline" onClick={() => copyToClipboard(selectedClientContract.signatureHash)} className="h-7 text-xs">
                      {copiedHash ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3">
              <Button variant="outline" size="sm" onClick={() => setSelectedClientContract(null)}>
                Cerrar
              </Button>
              <Button size="sm" className="bg-slate-900 hover:bg-slate-800 text-white" onClick={() => alert(`Descargando Contrato de Compraventa Certificado: ${selectedClientContract.code}`)}>
                <Download className="w-4 h-4 mr-2" /> Descargar Contrato Compraventa (PDF)
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
          <DialogContent className="max-w-lg bg-white border-slate-200 rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-slate-900 font-serif">{selectedCustomer.fullName}</DialogTitle>
              <DialogDescription className="text-xs text-slate-500 font-mono">{selectedCustomer.identification}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 text-sm py-2">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-xs font-bold text-slate-400 uppercase">Domicilio Residencial:</span>
                <p className="font-medium text-slate-800 mt-1">{selectedCustomer.address}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-xs text-slate-400">Teléfono</span>
                  <div className="font-semibold text-slate-900 mt-0.5">{selectedCustomer.phone}</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-xs text-slate-400">Correo</span>
                  <div className="font-semibold text-slate-900 mt-0.5 truncate">{selectedCustomer.email}</div>
                </div>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-xs text-slate-400">Vehículo Adquirido & Inversión</span>
                <div className="font-bold text-slate-900 mt-0.5">{selectedCustomer.preferredVehicle}</div>
                <div className="text-xs text-emerald-700 font-semibold mt-0.5">${selectedCustomer.totalSpent.toLocaleString()} MXN</div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => setSelectedCustomer(null)} className="w-full bg-slate-900 text-white">
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
                    Mandato de Corretaje Mercantil
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

            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto text-sm">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex justify-between"><span className="text-slate-500">Proveedor:</span> <strong className="text-slate-900">{selectedBrokerage.providerName}</strong></div>
                <div className="flex justify-between"><span className="text-slate-500">Razón Social:</span> <span className="text-slate-800">{selectedBrokerage.legalName}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">RFC / Tax ID:</span> <span className="text-slate-800 font-mono">{selectedBrokerage.taxId}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Comisión Pactada:</span> <strong className="text-emerald-700">{selectedBrokerage.commissionRate}% + IVA</strong></div>
                <div className="flex justify-between"><span className="text-slate-500">Autos en Consignación:</span> <span className="text-slate-800">{selectedBrokerage.vehicleCount} unidades</span></div>
              </div>
            </div>

            <DialogFooter className="p-4 border-t border-slate-100 bg-slate-50">
              <Button variant="outline" size="sm" onClick={() => setSelectedBrokerage(null)}>Cerrar</Button>
              <Button size="sm" className="bg-slate-900 text-white" onClick={() => alert(`Descargando Mandato ${selectedBrokerage.code}...`)}>
                <Download className="w-4 h-4 mr-2" /> Descargar Mandato (PDF)
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
