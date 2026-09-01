"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { useParams, useRouter, usePathname } from "next/navigation";
import {
  Building2,
  Car,
  FileText,
  CheckCircle2,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  ArrowLeft,
  Upload,
  Plus,
  Trash2,
  Eye,
  Download,
  Printer,
  Sparkles,
  Lock,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Globe,
  Hash,
  Award,
  AlertCircle,
  Info,
  Check,
  RotateCcw,
  PenTool,
  Copy,
  ExternalLink,
  ChevronRight,
  FileCheck2,
  BadgeCheck,
  DollarSign,
  Fuel,
  Gauge,
  SlidersHorizontal,
  RefreshCw,
  FileSignature,
  FileSpreadsheet,
  HelpCircle,
  User,
  Home,
  Key,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import {
  Vehicle,
  Property,
  getStoredVehicles,
  saveStoredVehicles,
  getStoredProperties,
  saveStoredProperties,
  DEFAULT_DEALER,
  DEFAULT_AGENCY,
} from "@/lib/marketplace-mocks";

// Types
export interface CompanyData {
  personType: "NATURAL" | "JURIDICA";
  // Persona Natural
  fullName: string;
  docType: string;
  docId: string;
  // Persona Jurídica
  legalName: string;
  tradeName: string;
  taxIdType: string;
  taxId: string;
  companyType: string;
  yearsInBusiness: string;
  branchesCount: string;
  website: string;
  legalRepName: string;
  legalRepDocType: string;
  legalRepDocId: string;
  legalRepRole: string;
  legalRepEmail: string;
  legalRepPhone: string;
  // Campos comunes
  address: string;
  city: string;
  country: string;
  phone: string;
  email: string;
  bankName: string;
  bankAccountType: string;
  bankAccountNumber: string;
}

export interface VehicleImage {
  id: string;
  name: string;
  url: string;
  tag: string;
}

export interface VehicleItem {
  id: string;
  itemType: "VEHICULO" | "MOTO" | "INMUEBLE_VENTA" | "INMUEBLE_RENTA";
  brand: string;
  model: string;
  year: number;
  trim: string;
  bodyType: string;
  mileage: number;
  transmission: string;
  fuelType: string;
  exteriorColor: string;
  interiorColor: string;
  vin: string;
  licensePlate: string;
  condition: string;
  engine: string;
  suggestedPrice: number;
  brokerageFeeType: "percentage" | "fixed";
  brokerageFeeValue: number;
  availability: string;
  description: string;
  features: string[];
  images: VehicleImage[];
  // Campos inmobiliarios
  propertyType?: string;
  areaM2?: number;
  bedrooms?: number;
  bathrooms?: number;
  parkingSpots?: number;
  neighborhood?: string;
}

export interface ContractSignatureData {
  contractId: string;
  signerName: string;
  signerDocType: string;
  signerDocId: string;
  signerRole: string;
  signerEmail: string;
  signatureType: "draw" | "type";
  typedSignatureText: string;
  signatureFont: string;
  drawnSignatureDataUrl: string | null;
  signedAtTimestamp: string;
  verificationHash: string;
  ipAddress: string;
  acceptTerms: boolean;
  acceptVehicleWarranty: boolean;
  acceptDataPrivacy: boolean;
  acceptDigitalSignatureValidity: boolean;
}

const CAR_BRANDS = [
  "Toyota", "Mazda", "Chevrolet", "Renault", "Kia", "Hyundai", "Nissan",
  "Volkswagen", "Ford", "BMW", "Mercedes-Benz", "Audi", "Porsche", "Land Rover",
  "Volvo", "Jeep", "BYD", "Suzuki", "Honda", "Mitsubishi"
];

const MOTO_BRANDS = [
  "Yamaha", "Honda", "Suzuki", "Kawasaki", "KTM", "BMW Motorrad", "Ducati",
  "Bajaj / Pulsar", "Royal Enfield", "TVS", "Hero", "Harley-Davidson", "Triumph", "Benelli"
];

const PROPERTY_TYPES = [
  "Casa", "Apartamento", "Penthouse", "Casa Campestre", "Oficina / Local", "Lote / Terreno", "Bodega / Industrial"
];

const POPULAR_BRANDS = [...CAR_BRANDS, ...MOTO_BRANDS];

const AVAILABLE_FEATURES = [
  "Techo Panorámico de Cristal",
  "Tapicería en Cuero Nappa / Alcantara",
  "Asientos Climatizados con Masaje",
  "Sistema de Sonido Premium (Burmester / Bose / Harman Kardon)",
  "Apple CarPlay & Android Auto Inalámbrico",
  "Paquete de Asistencias a la Conducción ADAS (Nivel 2)",
  "Faros Matrix LED / Láser Adaptativos",
  "Suspensión Neumática Adaptativa",
  "Cámaras de Visión 360° con Render 3D",
  "Head-Up Display Proyectado",
  "Blindaje Certificado (Nivel II / III)",
  "Rines de Aleación Ligera Forjados",
  "Garantía de Fábrica Vigente",
  "Historial 100% en Concesionario Oficial"
];

const SAMPLE_VEHICLE_IMAGES: VehicleImage[] = [
  {
    id: "img-1",
    name: "Frontal_TresCuartos.jpg",
    url: "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?q=80&w=800&auto=format&fit=crop",
    tag: "Frontal Principal"
  },
  {
    id: "img-2",
    name: "Interior_Consola.jpg",
    url: "https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?q=80&w=800&auto=format&fit=crop",
    tag: "Cabina / Interior"
  },
  {
    id: "img-3",
    name: "Trasera_Angulo.jpg",
    url: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?q=80&w=800&auto=format&fit=crop",
    tag: "Vista Trasera"
  },
  {
    id: "img-4",
    name: "Detalle_Rines.jpg",
    url: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=800&auto=format&fit=crop",
    tag: "Rines y Llantas"
  }
];

export default function ProviderRegistrationPage({
  params,
}: {
  params?: { domain?: string } | Promise<{ domain?: string }>;
}) {
  // Extract domain fallback (works both with Next.js params and React Router useParams)
  const routerParams = useParams();
  const [resolvedDomain, setResolvedDomain] = useState<string>("central");

  useEffect(() => {
    if (params) {
      if (typeof (params as any).then === "function") {
        (params as Promise<{ domain?: string }>).then((p) => {
          if (p?.domain) setResolvedDomain(p.domain);
        });
      } else if ((params as any).domain) {
        setResolvedDomain((params as any).domain);
      }
    } else if (routerParams.domain) {
      setResolvedDomain(Array.isArray(routerParams.domain) ? routerParams.domain[0] : (routerParams.domain || "prestige"));
    }
  }, [params, routerParams]);

  // Stepper state: 1: Company, 2: Vehicles, 3: Contract, 4: Success
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showPreviewModal, setShowPreviewModal] = useState<boolean>(false);
  const [showPrintView, setShowPrintView] = useState<boolean>(false);

  // STEP 1: Company / Owner Data (Persona Natural por defecto)
  const [companyData, setCompanyData] = useState<CompanyData>({
    personType: "NATURAL",
    fullName: "",
    docType: "Cédula de Ciudadanía",
    docId: "",
    legalName: "",
    tradeName: "",
    taxIdType: "NIT",
    taxId: "",
    companyType: "Concesionario / Proveedor / Propietario Directo",
    yearsInBusiness: "1",
    branchesCount: "1",
    website: "",
    legalRepName: "",
    legalRepDocType: "Cédula de Ciudadanía",
    legalRepDocId: "",
    legalRepRole: "Propietario / Representante Legal",
    legalRepEmail: "",
    legalRepPhone: "",
    address: "",
    city: "Barranquilla",
    country: "Colombia",
    phone: "",
    email: "",
    bankName: "Bancolombia",
    bankAccountType: "Cuenta de Ahorros",
    bankAccountNumber: "",
  });

  // STEP 2: Category Selector & Inventory List
  const [selectedAssetType, setSelectedAssetType] = useState<"VEHICULO" | "MOTO" | "INMUEBLE_VENTA" | "INMUEBLE_RENTA">("VEHICULO");
  const [vehicles, setVehicles] = useState<VehicleItem[]>([]);

  // Form state for creating a new item in Step 2
  const [currentVehicle, setCurrentVehicle] = useState<Omit<VehicleItem, "id">>({
    itemType: "VEHICULO",
    brand: "",
    model: "",
    year: new Date().getFullYear(),
    trim: "",
    bodyType: "SUV / Camioneta",
    mileage: 0,
    transmission: "Automática",
    fuelType: "Gasolina",
    exteriorColor: "",
    interiorColor: "",
    vin: "",
    licensePlate: "",
    condition: "Seminuevo Certificado",
    engine: "2.0L",
    suggestedPrice: 0,
    brokerageFeeType: "percentage",
    brokerageFeeValue: 3.5,
    availability: "Disponible para Venta Inmediata",
    description: "",
    features: [
      "Aire Acondicionado",
      "Rines de Lujo",
      "Pantalla Táctil",
      "Frenos ABS"
    ],
    images: [],
    propertyType: "Apartamento",
    areaM2: 85,
    bedrooms: 3,
    bathrooms: 2,
    parkingSpots: 1,
    neighborhood: "Villa Country",
  });

  const [activeVehicleTab, setActiveVehicleTab] = useState<"individual" | "bulk">("individual");
  const [selectedImageTag, setSelectedImageTag] = useState<string>("Frontal");
  const [customFeatureInput, setCustomFeatureInput] = useState<string>("");

  // STEP 3: Digital Brokerage Contract State
  const [contractSignature, setContractSignature] = useState<ContractSignatureData>({
    contractId: `CTR-COR-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`,
    signerName: companyData.legalRepName,
    signerDocType: companyData.legalRepDocType,
    signerDocId: companyData.legalRepDocId,
    signerRole: companyData.legalRepRole,
    signerEmail: companyData.legalRepEmail,
    signatureType: "type",
    typedSignatureText: companyData.legalRepName,
    signatureFont: "font-signature-1",
    drawnSignatureDataUrl: null,
    signedAtTimestamp: new Date().toISOString(),
    verificationHash: "",
    ipAddress: "190.142.68.12",
    acceptTerms: false,
    acceptVehicleWarranty: false,
    acceptDataPrivacy: false,
    acceptDigitalSignatureValidity: false,
  });

  // Sync signer with company rep when moving to step 3
  useEffect(() => {
    setContractSignature((prev) => ({
      ...prev,
      signerName: companyData.legalRepName || prev.signerName,
      signerDocType: companyData.legalRepDocType || prev.signerDocType,
      signerDocId: companyData.legalRepDocId || prev.signerDocId,
      signerRole: companyData.legalRepRole || prev.signerRole,
      signerEmail: companyData.legalRepEmail || prev.signerEmail,
      typedSignatureText: companyData.legalRepName || prev.typedSignatureText,
    }));
  }, [companyData]);

  // Compute live verification hash based on contents
  const calculatedVerificationHash = useMemo(() => {
    const raw = `${contractSignature.contractId}|${companyData.taxId}|${companyData.legalName}|${vehicles.length}|${contractSignature.signerDocId}|2026-AUTOBROKER-SECURE`;
    // Simple deterministic hex generator for UI simulation
    let hash = 0;
    for (let i = 0; i < raw.length; i++) {
      hash = ((hash << 5) - hash) + raw.charCodeAt(i);
      hash |= 0;
    }
    const hex1 = Math.abs(hash).toString(16).padStart(8, "0");
    const hex2 = Math.abs((hash * 31) | 0).toString(16).padStart(8, "0");
    const hex3 = Math.abs((hash * 97) | 0).toString(16).padStart(8, "0");
    const hex4 = Math.abs((hash * 13) | 0).toString(16).padStart(8, "0");
    return `SHA256:${hex1}${hex2}${hex3}${hex4}`.toUpperCase();
  }, [contractSignature.contractId, companyData.taxId, companyData.legalName, vehicles.length, contractSignature.signerDocId]);

  // Signature Canvas Handling
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasCanvasSignature, setHasCanvasSignature] = useState(false);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
    setIsDrawing(true);
    setHasCanvasSignature(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#09090b"; // Rich zinc-900
    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      setContractSignature((prev) => ({
        ...prev,
        drawnSignatureDataUrl: canvas.toDataURL("image/png"),
      }));
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasCanvasSignature(false);
    setContractSignature((prev) => ({ ...prev, drawnSignatureDataUrl: null }));
  };

  // Step 1 Validation
  const validateStep1 = (): boolean => {
    if (companyData.personType === "NATURAL") {
      if (!companyData.fullName.trim()) {
        toast.error("Por favor ingresa tus Nombres y Apellidos Completos");
        return false;
      }
      if (!companyData.docId.trim()) {
        toast.error("Por favor ingresa tu Número de Cédula / Documento");
        return false;
      }
      if (!companyData.phone.trim()) {
        toast.error("Por favor ingresa tu Número de Teléfono Celular o WhatsApp");
        return false;
      }
      if (!companyData.email.trim() || !companyData.email.includes("@")) {
        toast.error("Por favor ingresa un correo electrónico válido");
        return false;
      }
    } else {
      if (!companyData.legalName.trim()) {
        toast.error("Por favor ingresa la Razón Social de la empresa");
        return false;
      }
      if (!companyData.taxId.trim()) {
        toast.error("Por favor ingresa el NIT / Identificación Fiscal");
        return false;
      }
      if (!companyData.legalRepName.trim()) {
        toast.error("Por favor ingresa el nombre del Representante Legal");
        return false;
      }
      if (!companyData.legalRepDocId.trim()) {
        toast.error("Por favor ingresa el documento del Representante Legal");
        return false;
      }
      if (!companyData.email.trim() || !companyData.email.includes("@")) {
        toast.error("Por favor ingresa un correo corporativo válido");
        return false;
      }
    }
    return true;
  };

  // Step 2 Validation
  const validateStep2 = (): boolean => {
    if (vehicles.length === 0) {
      if ((currentVehicle.brand.trim() || currentVehicle.model.trim()) && Number(currentVehicle.suggestedPrice) > 0) {
        handleAddVehicleToList();
        return true;
      }
      toast.error("Por favor completa los datos del bien y haz clic en 'Agregar al Contrato' antes de continuar.");
      return false;
    }
    return true;
  };

  // Step 3 Validation
  const validateStep3 = (): boolean => {
    if (!contractSignature.acceptTerms) {
      toast.error("Debes aceptar los términos y cláusulas del Contrato de Corretaje");
      return false;
    }
    if (!contractSignature.acceptVehicleWarranty) {
      toast.error("Debes certificar la procedencia legal y libre posesión del inventario");
      return false;
    }
    if (!contractSignature.acceptDataPrivacy) {
      toast.error("Debes autorizar el tratamiento de datos personales y comerciales");
      return false;
    }
    if (!contractSignature.acceptDigitalSignatureValidity) {
      toast.error("Debes consentir la validez legal de la firma digital");
      return false;
    }
    if (contractSignature.signatureType === "type" && !contractSignature.typedSignatureText.trim()) {
      toast.error("Por favor escribe tu nombre completo para la firma tipográfica");
      return false;
    }
    if (contractSignature.signatureType === "draw" && !hasCanvasSignature) {
      toast.error("Por favor realiza el trazo de tu firma en el recuadro digital");
      return false;
    }
    return true;
  };

  // Handler to add a new item (vehicle, moto, property) to the list
  const handleAddVehicleToList = () => {
    const isRealEstate = selectedAssetType === "INMUEBLE_VENTA" || selectedAssetType === "INMUEBLE_RENTA";
    if (!isRealEstate && (!currentVehicle.brand || !currentVehicle.model || !currentVehicle.suggestedPrice)) {
      toast.error("Completa la Marca, Modelo y Precio sugerido");
      return;
    }
    if (isRealEstate && (!currentVehicle.brand || !currentVehicle.suggestedPrice)) {
      toast.error("Completa el Título comercial y el Precio / Canon mensual");
      return;
    }

    const defaultImages = selectedAssetType === "MOTO"
      ? [{ id: `img-${Date.now()}`, name: "Moto.jpg", url: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=1200&q=80", tag: "Principal" }]
      : isRealEstate
      ? [{ id: `img-${Date.now()}`, name: "Inmueble.jpg", url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80", tag: "Fachada" }]
      : [{ id: `img-${Date.now()}`, name: "Vehiculo.jpg", url: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80", tag: "Frontal" }];

    const newVehicle: VehicleItem = {
      ...currentVehicle,
      itemType: selectedAssetType,
      id: `item-${Date.now()}`,
      images: currentVehicle.images.length > 0 ? currentVehicle.images : defaultImages,
    };

    setVehicles((prev) => [...prev, newVehicle]);
    toast.success(`Ítem ${newVehicle.brand} ${newVehicle.model} agregado al contrato de corretaje`);

    // Reset current form to a clean state
    setCurrentVehicle({
      itemType: selectedAssetType,
      brand: "",
      model: "",
      year: new Date().getFullYear(),
      trim: "",
      bodyType: selectedAssetType === "MOTO" ? "Moto / Motocicleta" : "SUV / Camioneta",
      mileage: 0,
      transmission: "Automática",
      fuelType: "Gasolina",
      exteriorColor: "",
      interiorColor: "",
      vin: "",
      licensePlate: "",
      condition: "Seminuevo Certificado",
      engine: selectedAssetType === "MOTO" ? "890cc" : "2.0L",
      suggestedPrice: 0,
      brokerageFeeType: "percentage",
      brokerageFeeValue: 3.5,
      availability: "Disponible para Venta Inmediata",
      description: "",
      features: [
        "Aire Acondicionado",
        "Rines de Lujo",
        "Pantalla Táctil",
        "Frenos ABS"
      ],
      images: [],
      propertyType: "Apartamento",
      areaM2: 85,
      bedrooms: 3,
      bathrooms: 2,
      parkingSpots: 1,
      neighborhood: "Villa Country",
    });
  };

  const handleRemoveVehicle = (id: string) => {
    if (vehicles.length <= 1) {
      toast.error("El contrato debe contener al menos un ítem registrado.");
      return;
    }
    setVehicles((prev) => prev.filter((v) => v.id !== id));
    toast.info("Ítem retirado de la lista");
  };

  const toggleFeatureInCurrentVehicle = (feature: string) => {
    setCurrentVehicle((prev) => {
      const exists = prev.features.includes(feature);
      return {
        ...prev,
        features: exists
          ? prev.features.filter((f) => f !== feature)
          : [...prev.features, feature],
      };
    });
  };

  const handleAddCustomFeature = () => {
    if (!customFeatureInput.trim()) return;
    if (!currentVehicle.features.includes(customFeatureInput.trim())) {
      setCurrentVehicle((prev) => ({
        ...prev,
        features: [...prev.features, customFeatureInput.trim()],
      }));
      setCustomFeatureInput("");
    }
  };

  // Simulating image upload
  const handleSimulateAddImage = () => {
    const randomImg = SAMPLE_VEHICLE_IMAGES[Math.floor(Math.random() * SAMPLE_VEHICLE_IMAGES.length)];
    const newImage: VehicleImage = {
      id: `img-${Date.now()}`,
      name: `Foto_${selectedImageTag.replace(/\s+/g, "_")}_${Date.now().toString().slice(-4)}.jpg`,
      url: randomImg.url,
      tag: selectedImageTag,
    };

    setCurrentVehicle((prev) => ({
      ...prev,
      images: [...prev.images, newImage],
    }));
    toast.success(`Fotografía clasificada como "${selectedImageTag}" cargada exitosamente`);
  };

  // Final formalization
  const handleSignContract = async () => {
    if (!validateStep3()) return;

    setIsSubmitting(true);

    try {
      // 1. Separate vehicle / moto items from real estate items
      const newVehiclesToPublish: Vehicle[] = [];
      const newPropertiesToPublish: Property[] = [];

      const ownerDisplayName = companyData.personType === "NATURAL"
        ? companyData.fullName || "Propietario Particular"
        : companyData.tradeName || companyData.legalName || "Concesionario Aliado";

      vehicles.forEach((v) => {
        if (v.itemType === "INMUEBLE_VENTA" || v.itemType === "INMUEBLE_RENTA") {
          const prop: Property = {
            id: v.id || `prop-prov-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            title: v.brand ? `${v.propertyType || "Inmueble"} - ${v.brand}` : `${v.propertyType || "Inmueble"} en ${companyData.city || "Barranquilla"}`,
            propertyType: (v.propertyType as any) || "Apartamento",
            operationType: v.itemType === "INMUEBLE_RENTA" ? "Arriendo" : "Venta",
            priceCop: Number(v.suggestedPrice) || 0,
            region: "Barranquilla (Atlántico)",
            city: companyData.city || "Barranquilla",
            neighborhood: v.neighborhood || "Zona Norte",
            addressBrief: companyData.address || "Sector Residencial",
            code: `TRN-RE-${Math.floor(100 + Math.random() * 900)}`,
            images: v.images && v.images.length > 0
              ? v.images.map((img) => img.url)
              : ["https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80"],
            specs: {
              areaM2: v.areaM2 || 85,
              lotAreaM2: (v.areaM2 || 85) + 20,
              bedrooms: v.bedrooms || 3,
              bathrooms: v.bathrooms || 2,
              parkingSpots: v.parkingSpots || 1,
              stratum: 4,
              builtYear: Number(v.year) || new Date().getFullYear(),
            },
            amenities: v.features && v.features.length > 0 ? v.features : ["Seguridad 24/7", "Parqueadero Privado"],
            description: v.description || `Excelente inmueble en ${v.itemType === "INMUEBLE_RENTA" ? "arriendo" : "venta"}, consignado a través de YJD TRINOVA S.A.S.`,
            featured: true,
            agency: {
              ...DEFAULT_AGENCY,
              name: ownerDisplayName,
              phone: companyData.phone || DEFAULT_AGENCY.phone,
              whatsappPhone: companyData.phone || DEFAULT_AGENCY.whatsappPhone,
              address: companyData.address || DEFAULT_AGENCY.address,
              city: companyData.city || DEFAULT_AGENCY.city,
            },
          };
          newPropertiesToPublish.push(prop);
        } else {
          // Vehículo o Moto
          const fuelMapped: "Gasolina" | "Híbrido" | "Eléctrico" | "Diésel" =
            v.fuelType.toLowerCase().includes("híbrido") || v.fuelType.toLowerCase().includes("hybrid")
              ? "Híbrido"
              : v.fuelType.toLowerCase().includes("eléctrico") || v.fuelType.toLowerCase().includes("electric")
              ? "Eléctrico"
              : v.fuelType.toLowerCase().includes("diésel") || v.fuelType.toLowerCase().includes("diesel")
              ? "Diésel"
              : "Gasolina";

          const transMapped: "Automática" | "Secuencial / DCT" | "Manual" =
            v.transmission.toLowerCase().includes("manual")
              ? "Manual"
              : v.transmission.toLowerCase().includes("secuencial") || v.transmission.toLowerCase().includes("dct")
              ? "Secuencial / DCT"
              : "Automática";

          const bodyMapped: any = v.itemType === "MOTO" ? "Moto / Motocicleta" : (v.bodyType || "SUV / Camioneta");

          const veh: Vehicle = {
            id: v.id || `veh-prov-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            brand: v.brand,
            model: v.model,
            trim: v.trim || undefined,
            year: Number(v.year),
            price: Number(v.suggestedPrice),
            currency: "COP",
            monthlyEstimate: Math.round(Number(v.suggestedPrice) / 48),
            mileage: Number(v.mileage) || 0,
            fuelType: fuelMapped,
            transmission: transMapped,
            bodyType: bodyMapped,
            region: "Barranquilla (Atlántico)",
            city: companyData.city || "Barranquilla, Atlántico",
            exteriorColor: v.exteriorColor || "Gris / Plata",
            interiorColor: v.interiorColor || "Cuero Negro",
            doors: bodyMapped.includes("Moto") ? 0 : 4,
            condition: "Seminuevo Certificado",
            badge: "Certificado",
            featured: true,
            vin: v.vin || `VIN-${Date.now().toString().slice(-6)}`,
            plateEnding: v.licensePlate ? `Placa ${v.licensePlate}` : "Placa de Barranquilla",
            images: v.images && v.images.length > 0
              ? v.images.map((img) => img.url)
              : [v.itemType === "MOTO"
                  ? "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=1200&q=80"
                  : "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80"],
            specs: {
              engine: v.engine || (v.itemType === "MOTO" ? "890cc DOHC" : "2.0L Turbo"),
              horsepower: v.itemType === "MOTO" ? 119 : 200,
              acceleration: v.itemType === "MOTO" ? "0-100 km/h: 3.5s" : "0-100 km/h: 6.8s",
              traction: v.itemType === "MOTO" ? "RWD" : "AWD",
            },
            keyFeatures: v.features && v.features.length > 0 ? v.features : ["Garantía de Procedencia", "Inspección Pericial 360°"],
            inspectionScore: 98,
            dealer: {
              ...DEFAULT_DEALER,
              name: ownerDisplayName,
              phone: companyData.phone || DEFAULT_DEALER.phone,
              city: companyData.city || DEFAULT_DEALER.city,
              address: companyData.address || DEFAULT_DEALER.address,
            },
          };
          newVehiclesToPublish.push(veh);
        }
      });

      // 2. Save directly into persistent databases
      if (newVehiclesToPublish.length > 0) {
        const existingVeh = getStoredVehicles();
        saveStoredVehicles([...newVehiclesToPublish, ...existingVeh]);
      }
      if (newPropertiesToPublish.length > 0) {
        const existingProp = getStoredProperties();
        saveStoredProperties([...newPropertiesToPublish, ...existingProp]);
      }

      // 3. Dispatch storage event for real-time sync across open pages
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("storage"));
      }

      // 4. Send payload to backend API
      try {
        await fetch("/api/proveedores/registro", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            company: companyData,
            vehicles: vehicles,
            contract: {
              ...contractSignature,
              verificationHash: calculatedVerificationHash,
              signedAtTimestamp: new Date().toISOString(),
            },
          }),
        });
      } catch (apiErr) {
        console.warn("API log error:", apiErr);
      }

      setContractSignature((prev) => ({
        ...prev,
        verificationHash: calculatedVerificationHash,
        signedAtTimestamp: new Date().toISOString(),
      }));

      setIsSubmitting(false);
      setCurrentStep(4);
      toast.success("¡Contrato firmado y formalizado con éxito! El inventario quedó publicado en el marketplace.");
    } catch (err) {
      setIsSubmitting(false);
      toast.error("Ocurrió un error al procesar el contrato.");
    }
  };

  // Total valuation calculation
  const totalValuation = useMemo(() => {
    return vehicles.reduce((sum, v) => sum + (Number(v.suggestedPrice) || 0), 0);
  }, [vehicles]);

  const estimatedTotalBrokerage = useMemo(() => {
    return vehicles.reduce((sum, v) => {
      const price = Number(v.suggestedPrice) || 0;
      const fee = v.brokerageFeeType === "percentage"
        ? (price * (Number(v.brokerageFeeValue) || 0)) / 100
        : Number(v.brokerageFeeValue) || 0;
      return sum + fee;
    }, 0);
  }, [vehicles]);

  // Load demo data helper
  const handleLoadDemoData = () => {
    setCompanyData({
      personType: "NATURAL",
      fullName: "Carlos Eduardo Mendoza Valenzuela",
      docType: "Cédula de Ciudadanía",
      docId: "80.456.912",
      legalName: "Grupo Automotriz Premier & Luxury Cars S.A.S.",
      tradeName: "Premier Motors Selection",
      taxIdType: "NIT",
      taxId: "900.874.192-8",
      companyType: "Concesionario Oficial & Multimarca Premium",
      yearsInBusiness: "15",
      branchesCount: "4",
      website: "https://premiermotors.co",
      address: "Carrera 7 # 116 - 50, Edificio Teleport Business Center",
      city: "Bogotá D.C.",
      country: "Colombia",
      phone: "+57 (601) 745-8000",
      email: "proveedores@premiermotors.co",
      legalRepName: "Carlos Eduardo Mendoza Valenzuela",
      legalRepDocType: "Cédula de Ciudadanía",
      legalRepDocId: "80.456.912",
      legalRepRole: "Director General & Representante Legal",
      legalRepEmail: "c.mendoza@premiermotors.co",
      legalRepPhone: "+57 318 450 9988",
      bankName: "Davivienda",
      bankAccountType: "Cuenta Corriente Empresarial",
      bankAccountNumber: "4570-0098-1234",
    });
    toast.success("Datos corporativos de prueba cargados correctamente");
  };

  return (
    <div className="min-h-screen bg-zinc-50/70 text-zinc-900 font-body selection:bg-zinc-900 selection:text-white">
      {/* Top Header / Portal Navigation Bar */}
      <header className="sticky top-0 z-40 w-full border-b border-zinc-200/80 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-zinc-900 text-white flex items-center justify-center shadow-sm">
              <Building2 className="h-5 w-5 text-zinc-100" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading font-bold text-base sm:text-lg tracking-tight text-zinc-900">
                  YJD TRINOVA <span className="text-zinc-500 font-normal">S.A.S.</span>
                </span>
                <Badge variant="outline" className="text-[10px] font-mono uppercase bg-zinc-100 border-zinc-200 text-zinc-700">
                  NIT 902.095.222-8
                </Badge>
              </div>
              <p className="text-xs text-zinc-500 hidden sm:block">
                Portal Oficial de Proveedores & Mandato de Corretaje Comercial
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 text-xs text-zinc-500 bg-zinc-100/80 px-3 py-1.5 rounded-lg border border-zinc-200/60">
              <Lock className="h-3.5 w-3.5 text-emerald-600" />
              <span>Cifrado Notarial SSL 256-bit</span>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLoadDemoData}
                    className="text-xs border-zinc-300 hover:bg-zinc-100 text-zinc-700 h-8 gap-1.5 rounded-xl"
                  >
                    <RefreshCw className="h-3.5 w-3.5 text-zinc-500" />
                    <span className="hidden sm:inline">Cargar Ejemplo</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">Rellena con datos de ejemplo para pruebas</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-zinc-600 hover:text-zinc-900 gap-1 h-8"
              onClick={() => window.open("#", "_blank")}
            >
              <HelpCircle className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Mesa de Ayuda</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Hero Title Section */}
        <div className="mb-8 sm:mb-10 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-zinc-100 text-zinc-800 border border-zinc-200 mb-3">
            <Award className="h-3.5 w-3.5 text-zinc-700" />
            <span>Afiliación de Red de Concesionarios y Proveedores Verificados</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 tracking-tight mb-3">
            Registro Corporativo & Contrato de Corretaje
          </h1>
          <p className="text-sm sm:text-base text-zinc-600 leading-relaxed">
            Consigne su inventario automotor en nuestra red de corretaje premium con formalización
            jurídica digital, liquidaciones garantizadas y exposición multicanal de alto impacto.
          </p>
        </div>

        {/* Stepper Navigation Indicator */}
        <div className="mb-10 max-w-4xl mx-auto">
          <div className="grid grid-cols-3 gap-2 sm:gap-4 relative">
            {/* Step 1 Pill */}
            <button
              type="button"
              onClick={() => currentStep > 1 && setCurrentStep(1)}
              className={`flex items-center gap-3 p-3 sm:p-4 rounded-xl border text-left transition-all ${
                currentStep === 1
                  ? "bg-white border-zinc-900 shadow-md ring-1 ring-zinc-900"
                  : currentStep > 1
                  ? "bg-white/80 border-zinc-200 hover:border-zinc-300 text-zinc-700"
                  : "bg-zinc-100/50 border-zinc-200/60 text-zinc-400 cursor-not-allowed"
              }`}
            >
              <div
                className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 text-sm font-semibold transition-colors ${
                  currentStep === 1
                    ? "bg-zinc-900 text-white"
                    : currentStep > 1
                    ? "bg-emerald-600 text-white"
                    : "bg-zinc-200 text-zinc-500"
                }`}
              >
                {currentStep > 1 ? <Check className="h-4 w-4" /> : "1"}
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">Paso 01</p>
                <p className="text-xs sm:text-sm font-semibold text-zinc-900 truncate">Empresa & Dealer</p>
              </div>
            </button>

            {/* Step 2 Pill */}
            <button
              type="button"
              onClick={() => currentStep > 2 && setCurrentStep(2)}
              className={`flex items-center gap-3 p-3 sm:p-4 rounded-xl border text-left transition-all ${
                currentStep === 2
                  ? "bg-white border-zinc-900 shadow-md ring-1 ring-zinc-900"
                  : currentStep > 2
                  ? "bg-white/80 border-zinc-200 hover:border-zinc-300 text-zinc-700"
                  : "bg-zinc-100/50 border-zinc-200/60 text-zinc-400 cursor-not-allowed"
              }`}
            >
              <div
                className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 text-sm font-semibold transition-colors ${
                  currentStep === 2
                    ? "bg-zinc-900 text-white"
                    : currentStep > 2
                    ? "bg-emerald-600 text-white"
                    : "bg-zinc-200 text-zinc-500"
                }`}
              >
                {currentStep > 2 ? <Check className="h-4 w-4" /> : "2"}
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">Paso 02</p>
                <p className="text-xs sm:text-sm font-semibold text-zinc-900 truncate">
                  Inventario ({vehicles.length})
                </p>
              </div>
            </button>

            {/* Step 3 Pill */}
            <button
              type="button"
              onClick={() => currentStep > 3 && setCurrentStep(3)}
              className={`flex items-center gap-3 p-3 sm:p-4 rounded-xl border text-left transition-all ${
                currentStep === 3
                  ? "bg-white border-zinc-900 shadow-md ring-1 ring-zinc-900"
                  : currentStep > 3
                  ? "bg-white/80 border-zinc-200 hover:border-zinc-300 text-zinc-700"
                  : "bg-zinc-100/50 border-zinc-200/60 text-zinc-400 cursor-not-allowed"
              }`}
            >
              <div
                className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 text-sm font-semibold transition-colors ${
                  currentStep === 3
                    ? "bg-zinc-900 text-white"
                    : currentStep > 3
                    ? "bg-emerald-600 text-white"
                    : "bg-zinc-200 text-zinc-500"
                }`}
              >
                {currentStep > 3 ? <Check className="h-4 w-4" /> : "3"}
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">Paso 03</p>
                <p className="text-xs sm:text-sm font-semibold text-zinc-900 truncate">Firma de Contrato</p>
              </div>
            </button>
          </div>

          {/* Progress bar line */}
          <div className="mt-3">
            <Progress
              value={currentStep === 1 ? 33.33 : currentStep === 2 ? 66.66 : currentStep === 3 ? 90 : 100}
              className="h-1.5 bg-zinc-200"
            />
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════════
            STEP 1: OWNER / COMPANY DETAILS (PERSONA NATURAL O JURÍDICA)
        ══════════════════════════════════════════════════════════════════ */}
        {currentStep === 1 && (
          <div className="space-y-6 max-w-[1200px] mx-auto">
            {/* Card: Selector de Tipo de Persona */}
            <Card className="border-zinc-200 bg-white shadow-sm overflow-hidden">
              <CardHeader className="border-b border-zinc-100 pb-4 bg-zinc-50/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-zinc-900 text-white">
                      {companyData.personType === "NATURAL" ? (
                        <User className="h-5 w-5" />
                      ) : (
                        <Building2 className="h-5 w-5" />
                      )}
                    </div>
                    <div>
                      <CardTitle className="text-base sm:text-lg font-bold text-zinc-900">
                        1. Identificación del Propietario / Consignante
                      </CardTitle>
                      <CardDescription className="text-xs text-zinc-500">
                        Selecciona si eres propietario particular (Persona Natural) o representas a una empresa / concesionario
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant="outline" className="border-zinc-200 text-zinc-600 bg-white text-xs">
                    Paso 1 de 3
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="pt-6 space-y-6">
                {/* Person Type Selector Segment */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-1.5 bg-zinc-100/80 rounded-2xl border border-zinc-200/80">
                  <button
                    type="button"
                    onClick={() => setCompanyData({ ...companyData, personType: "NATURAL" })}
                    className={`flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                      companyData.personType === "NATURAL"
                        ? "bg-white text-zinc-900 shadow-sm ring-1 ring-zinc-900/10"
                        : "text-zinc-500 hover:text-zinc-900"
                    }`}
                  >
                    <User className="h-4 w-4 text-emerald-600" />
                    <span>Persona Natural (Propietario / Dueño Particular)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCompanyData({ ...companyData, personType: "JURIDICA" })}
                    className={`flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                      companyData.personType === "JURIDICA"
                        ? "bg-white text-zinc-900 shadow-sm ring-1 ring-zinc-900/10"
                        : "text-zinc-500 hover:text-zinc-900"
                    }`}
                  >
                    <Building2 className="h-4 w-4 text-blue-600" />
                    <span>Persona Jurídica (Empresa / Concesionario / Inmobiliaria)</span>
                  </button>
                </div>

                {/* FORM FOR PERSONA NATURAL */}
                {companyData.personType === "NATURAL" && (
                  <div className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <Label htmlFor="fullName" className="text-xs font-semibold text-zinc-700">
                          Nombres y Apellidos Completos <span className="text-rose-500">*</span>
                        </Label>
                        <Input
                          id="fullName"
                          placeholder="Ej. Juan Carlos Pérez Gómez"
                          value={companyData.fullName}
                          onChange={(e) => setCompanyData({ ...companyData, fullName: e.target.value })}
                          className="border-zinc-200 focus-visible:ring-zinc-900 text-sm h-11 rounded-xl"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="space-y-2">
                          <Label htmlFor="docType" className="text-xs font-semibold text-zinc-700">
                            Tipo Documento
                          </Label>
                          <Select
                            value={companyData.docType}
                            onValueChange={(val) => setCompanyData({ ...companyData, docType: val || "Cédula de Ciudadanía" })}
                          >
                            <SelectTrigger id="docType" className="border-zinc-200 text-xs h-11 rounded-xl">
                              <SelectValue placeholder="Tipo" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Cédula de Ciudadanía">C.C. (Cédula)</SelectItem>
                              <SelectItem value="Cédula de Extranjería">C.E. (Extranjería)</SelectItem>
                              <SelectItem value="Pasaporte">Pasaporte</SelectItem>
                              <SelectItem value="PEP">PEP / PPT</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="sm:col-span-2 space-y-2">
                          <Label htmlFor="docId" className="text-xs font-semibold text-zinc-700">
                            Número de Documento <span className="text-rose-500">*</span>
                          </Label>
                          <Input
                            id="docId"
                            placeholder="Ej. 1.045.890.123"
                            value={companyData.docId}
                            onChange={(e) => setCompanyData({ ...companyData, docId: e.target.value })}
                            className="border-zinc-200 focus-visible:ring-zinc-900 text-sm font-mono h-11 rounded-xl"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="phoneNatural" className="text-xs font-semibold text-zinc-700">
                          Celular / WhatsApp <span className="text-rose-500">*</span>
                        </Label>
                        <Input
                          id="phoneNatural"
                          placeholder="+57 300 123 4567"
                          value={companyData.phone}
                          onChange={(e) => setCompanyData({ ...companyData, phone: e.target.value })}
                          className="border-zinc-200 focus-visible:ring-zinc-900 text-sm font-mono h-11 rounded-xl"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="emailNatural" className="text-xs font-semibold text-zinc-700">
                          Correo Electrónico <span className="text-rose-500">*</span>
                        </Label>
                        <Input
                          id="emailNatural"
                          type="email"
                          placeholder="propietario@email.com"
                          value={companyData.email}
                          onChange={(e) => setCompanyData({ ...companyData, email: e.target.value })}
                          className="border-zinc-200 focus-visible:ring-zinc-900 text-sm h-11 rounded-xl"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="cityNatural" className="text-xs font-semibold text-zinc-700">
                          Ciudad de Residencia <span className="text-rose-500">*</span>
                        </Label>
                        <Input
                          id="cityNatural"
                          placeholder="Barranquilla / Soledad"
                          value={companyData.city}
                          onChange={(e) => setCompanyData({ ...companyData, city: e.target.value })}
                          className="border-zinc-200 focus-visible:ring-zinc-900 text-sm h-11 rounded-xl"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="addressNatural" className="text-xs font-semibold text-zinc-700">
                          Dirección de Residencia
                        </Label>
                        <Input
                          id="addressNatural"
                          placeholder="Calle / Carrera / Barrio"
                          value={companyData.address}
                          onChange={(e) => setCompanyData({ ...companyData, address: e.target.value })}
                          className="border-zinc-200 focus-visible:ring-zinc-900 text-sm h-11 rounded-xl"
                        />
                      </div>
                    </div>

                    <div className="p-4 rounded-xl border border-zinc-200 bg-zinc-50/50 space-y-3">
                      <Label className="text-xs font-bold text-zinc-800">
                        Cuenta Bancaria para Transferencias de Liquidación (Venta / Canon de Renta)
                      </Label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <Input
                          placeholder="Banco (Ej. Bancolombia, Davivienda, Nequi)"
                          value={companyData.bankName}
                          onChange={(e) => setCompanyData({ ...companyData, bankName: e.target.value })}
                          className="border-zinc-200 text-xs h-10 rounded-lg bg-white"
                        />
                        <Select
                          value={companyData.bankAccountType}
                          onValueChange={(val) => setCompanyData({ ...companyData, bankAccountType: val || "Cuenta de Ahorros" })}
                        >
                          <SelectTrigger className="border-zinc-200 text-xs h-10 rounded-lg bg-white">
                            <SelectValue placeholder="Tipo de Cuenta" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Cuenta de Ahorros">Cuenta de Ahorros</SelectItem>
                            <SelectItem value="Cuenta Corriente">Cuenta Corriente</SelectItem>
                            <SelectItem value="Billetera Digital (Nequi / Daviplata)">Billetera Digital (Nequi / Daviplata)</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input
                          placeholder="Número de Cuenta / Celular Nequi"
                          value={companyData.bankAccountNumber}
                          onChange={(e) => setCompanyData({ ...companyData, bankAccountNumber: e.target.value })}
                          className="border-zinc-200 text-xs font-mono h-10 rounded-lg bg-white"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* FORM FOR PERSONA JURÍDICA */}
                {companyData.personType === "JURIDICA" && (
                  <div className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <Label htmlFor="legalName" className="text-xs font-semibold text-zinc-700">
                          Razón Social Completa <span className="text-rose-500">*</span>
                        </Label>
                        <Input
                          id="legalName"
                          placeholder="Ej. Inversiones Automotrices Andinas S.A.S."
                          value={companyData.legalName}
                          onChange={(e) => setCompanyData({ ...companyData, legalName: e.target.value })}
                          className="border-zinc-200 focus-visible:ring-zinc-900 text-sm h-11 rounded-xl"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="tradeName" className="text-xs font-semibold text-zinc-700">
                          Nombre Comercial / Marca de la Vitrina <span className="text-rose-500">*</span>
                        </Label>
                        <Input
                          id="tradeName"
                          placeholder="Ej. Andina Motors Prestige"
                          value={companyData.tradeName}
                          onChange={(e) => setCompanyData({ ...companyData, tradeName: e.target.value })}
                          className="border-zinc-200 focus-visible:ring-zinc-900 text-sm h-11 rounded-xl"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                      <div className="space-y-2">
                        <Label htmlFor="taxId" className="text-xs font-semibold text-zinc-700">
                          NIT / Identificación Fiscal <span className="text-rose-500">*</span>
                        </Label>
                        <Input
                          id="taxId"
                          placeholder="901.458.789-3"
                          value={companyData.taxId}
                          onChange={(e) => setCompanyData({ ...companyData, taxId: e.target.value })}
                          className="border-zinc-200 focus-visible:ring-zinc-900 text-sm font-mono h-11 rounded-xl"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="legalRepName" className="text-xs font-semibold text-zinc-700">
                          Representante Legal <span className="text-rose-500">*</span>
                        </Label>
                        <Input
                          id="legalRepName"
                          placeholder="Ej. Mauricio Restrepo Saldarriaga"
                          value={companyData.legalRepName}
                          onChange={(e) => setCompanyData({ ...companyData, legalRepName: e.target.value })}
                          className="border-zinc-200 focus-visible:ring-zinc-900 text-sm h-11 rounded-xl"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="legalRepDocId" className="text-xs font-semibold text-zinc-700">
                          Cédula del Representante <span className="text-rose-500">*</span>
                        </Label>
                        <Input
                          id="legalRepDocId"
                          placeholder="71.298.441"
                          value={companyData.legalRepDocId}
                          onChange={(e) => setCompanyData({ ...companyData, legalRepDocId: e.target.value })}
                          className="border-zinc-200 focus-visible:ring-zinc-900 text-sm font-mono h-11 rounded-xl"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="phoneJuridica" className="text-xs font-semibold text-zinc-700">
                          Teléfono / PBX Comercial <span className="text-rose-500">*</span>
                        </Label>
                        <Input
                          id="phoneJuridica"
                          placeholder="+57 (605) 322-5918"
                          value={companyData.phone}
                          onChange={(e) => setCompanyData({ ...companyData, phone: e.target.value })}
                          className="border-zinc-200 focus-visible:ring-zinc-900 text-sm font-mono h-11 rounded-xl"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="emailJuridica" className="text-xs font-semibold text-zinc-700">
                          Correo Institucional <span className="text-rose-500">*</span>
                        </Label>
                        <Input
                          id="emailJuridica"
                          type="email"
                          placeholder="contacto@empresa.com"
                          value={companyData.email}
                          onChange={(e) => setCompanyData({ ...companyData, email: e.target.value })}
                          className="border-zinc-200 focus-visible:ring-zinc-900 text-sm h-11 rounded-xl"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="addressJuridica" className="text-xs font-semibold text-zinc-700">
                          Dirección Sede Principal
                        </Label>
                        <Input
                          id="addressJuridica"
                          placeholder="Calle o Carrera, Sede"
                          value={companyData.address}
                          onChange={(e) => setCompanyData({ ...companyData, address: e.target.value })}
                          className="border-zinc-200 focus-visible:ring-zinc-900 text-sm h-11 rounded-xl"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Step 1 Actions */}
            <div className="flex items-center justify-between pt-4">
              <div className="text-xs text-zinc-500 flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <span>Información encriptada y protegida bajo el marco legal de YJD TRINOVA S.A.S.</span>
              </div>
              <Button
                          type="button"
                          onClick={() => {
                            if (validateStep1()) {
                              setCurrentStep(2);
                              window.scrollTo({ top: 0, behavior: "smooth" });
                            }
                          }}
                          className="bg-zinc-900 hover:bg-zinc-800 text-white font-medium px-6 gap-2 shadow-sm rounded-xl h-11"
                        >
                          <span>Continuar a Carga de Bienes & Inventario</span>
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* ══════════════════════════════════════════════════════════════════
            STEP 2: ASSET CONSIGNMENT INVENTORY (VEHÍCULOS, MOTOS, INMUEBLES)
        ══════════════════════════════════════════════════════════════════ */}
                  {currentStep === 2 && (
                    <div className="space-y-6 max-w-[1200px] mx-auto">
                      {/* Top Summary Banner of Current Batch */}
                      <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 rounded-xl bg-zinc-900 text-white">
                            {selectedAssetType === "MOTO" ? (
                              <Car className="h-6 w-6" />
                            ) : selectedAssetType.includes("INMUEBLE") ? (
                              <Home className="h-6 w-6" />
                            ) : (
                              <Car className="h-6 w-6" />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h2 className="text-base font-bold text-zinc-900">
                                Inventario Asignado al Contrato de Corretaje (Trinova)
                              </h2>
                              <Badge variant="secondary" className="bg-zinc-100 text-zinc-800 font-mono text-xs">
                                {vehicles.length} {vehicles.length === 1 ? "ítem registrado" : "ítems registrados"}
                              </Badge>
                            </div>
                            <p className="text-xs text-zinc-500 mt-0.5">
                              Valoración total: <span className="font-semibold text-zinc-900">${totalValuation.toLocaleString("es-CO")} COP</span> · Comisión Est.: <span className="font-semibold text-emerald-700">${estimatedTotalBrokerage.toLocaleString("es-CO")} COP</span>
                            </p>
                          </div>
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const elem = document.getElementById("vehicle-form-section");
                            elem?.scrollIntoView({ behavior: "smooth" });
                          }}
                          className="border-zinc-300 hover:bg-zinc-100 text-zinc-700 text-xs h-9 gap-1.5 shrink-0 rounded-xl"
                        >
                          <Plus className="h-4 w-4" />
                          <span>Agregar Otro Bien</span>
                        </Button>
                      </div>

                      {/* List of Already Added Items */}
                      {vehicles.length > 0 && (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <Label className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                              Bienes Registrados en este Contrato ({vehicles.length})
                            </Label>
                            <span className="text-xs text-zinc-500">Listos para inclusión en el contrato de mandato</span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {vehicles.map((veh, index) => (
                              <Card key={veh.id} className="border-zinc-200 bg-white shadow-sm hover:border-zinc-300 transition-all overflow-hidden">
                                <div className="flex flex-col sm:flex-row h-full">
                                  {/* Thumbnail */}
                                  <div className="sm:w-44 h-36 sm:h-auto bg-zinc-100 relative shrink-0 overflow-hidden">
                                    {veh.images && veh.images.length > 0 ? (
                                      <img
                                        src={veh.images[0].url}
                                        alt={`${veh.brand} ${veh.model}`}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <div className="w-full h-full flex flex-col items-center justify-center text-zinc-400">
                                        <Car className="h-8 w-8 mb-1" />
                                        <span className="text-[10px]">Sin imagen</span>
                                      </div>
                                    )}
                                    <div className="absolute top-2 left-2">
                                      <Badge className="bg-zinc-900/90 text-white text-[10px] backdrop-blur font-mono">
                                        #{index + 1} · {veh.itemType === "MOTO" ? "Moto" : veh.itemType === "INMUEBLE_VENTA" ? "Venta" : veh.itemType === "INMUEBLE_RENTA" ? "Renta" : "Vehículo"}
                                      </Badge>
                                    </div>
                                  </div>

                                  {/* Details */}
                                  <div className="p-4 flex-1 flex flex-col justify-between">
                                    <div>
                                      <div className="flex items-start justify-between gap-2">
                                        <div>
                                          <h3 className="text-sm font-bold text-zinc-900 leading-tight">
                                            {veh.brand} {veh.model}
                                          </h3>
                                          <p className="text-xs text-zinc-500">{veh.trim || veh.bodyType || veh.propertyType || "Consignación"}</p>
                                        </div>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => handleRemoveVehicle(veh.id)}
                                          className="h-7 w-7 p-0 text-zinc-400 hover:text-rose-600 hover:bg-rose-50"
                                        >
                                          <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                      </div>

                                      <div className="grid grid-cols-2 gap-x-2 gap-y-1 mt-3 text-[11px] text-zinc-600">
                                        <div className="flex items-center gap-1 font-mono">
                                          <span>{veh.year || new Date().getFullYear()}</span>
                                        </div>
                                        <div className="flex items-center gap-1 font-mono">
                                          <span>{veh.licensePlate || veh.neighborhood || "Barranquilla"}</span>
                                        </div>
                                      </div>
                                    </div>

                                    <div className="pt-3 mt-2 border-t border-zinc-100 flex items-center justify-between">
                                      <div>
                                        <p className="text-[10px] text-zinc-500">Valor / Canon</p>
                                        <p className="text-sm font-extrabold text-zinc-900">
                                          ${Number(veh.suggestedPrice).toLocaleString("es-CO")} COP
                                        </p>
                                      </div>
                                      <div className="text-right">
                                        <p className="text-[10px] text-zinc-500">Comisión</p>
                                        <Badge variant="outline" className="text-xs border-emerald-300 text-emerald-800 bg-emerald-50 font-semibold">
                                          {veh.brokerageFeeValue}%
                                        </Badge>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </Card>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Asset Creation Form Section */}
                      <div id="vehicle-form-section">
                        <Card className="border-zinc-200 bg-white shadow-sm overflow-hidden">
                          <CardHeader className="border-b border-zinc-100 pb-4 bg-zinc-50/50">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                              <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-zinc-900 text-white">
                                  <Plus className="h-5 w-5" />
                                </div>
                                <div>
                                  <CardTitle className="text-base sm:text-lg font-bold text-zinc-900">
                                    2. Carga y Registro de Bien a Consignar
                                  </CardTitle>
                                  <CardDescription className="text-xs text-zinc-500">
                                    Selecciona la categoría (Moto, Carro, Inmueble Venta o Renta) y completa la ficha técnica
                                  </CardDescription>
                                </div>
                              </div>
                            </div>
                          </CardHeader>

                          <CardContent className="pt-6 space-y-6">
                            {/* Category Selector */}
                            <div className="space-y-2">
                              <Label className="text-xs font-bold uppercase tracking-wider text-zinc-700">
                                ¿Qué tipo de bien o servicio deseas consignar con Trinova?
                              </Label>
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedAssetType("VEHICULO");
                                    setCurrentVehicle((prev) => ({ ...prev, itemType: "VEHICULO", bodyType: "SUV / Camioneta", brand: "" }));
                                  }}
                                  className={`flex flex-col items-center justify-center p-3.5 rounded-xl border text-center transition-all ${
                                    selectedAssetType === "VEHICULO"
                                      ? "bg-zinc-900 text-white border-zinc-900 shadow-sm"
                                      : "bg-zinc-50 border-zinc-200 text-zinc-700 hover:bg-zinc-100"
                                  }`}
                                >
                                  <Car className="h-5 w-5 mb-1" />
                                  <span className="text-xs font-bold">Carro / Camioneta</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedAssetType("MOTO");
                                    setCurrentVehicle((prev) => ({ ...prev, itemType: "MOTO", bodyType: "Moto / Motocicleta", brand: "" }));
                                  }}
                                  className={`flex flex-col items-center justify-center p-3.5 rounded-xl border text-center transition-all ${
                                    selectedAssetType === "MOTO"
                                      ? "bg-zinc-900 text-white border-zinc-900 shadow-sm"
                                      : "bg-zinc-50 border-zinc-200 text-zinc-700 hover:bg-zinc-100"
                                  }`}
                                >
                                  <Car className="h-5 w-5 mb-1" />
                                  <span className="text-xs font-bold">Moto / Motocicleta</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedAssetType("INMUEBLE_VENTA");
                                    setCurrentVehicle((prev) => ({ ...prev, itemType: "INMUEBLE_VENTA", propertyType: "Apartamento", brand: "" }));
                                  }}
                                  className={`flex flex-col items-center justify-center p-3.5 rounded-xl border text-center transition-all ${
                                    selectedAssetType === "INMUEBLE_VENTA"
                                      ? "bg-zinc-900 text-white border-zinc-900 shadow-sm"
                                      : "bg-zinc-50 border-zinc-200 text-zinc-700 hover:bg-zinc-100"
                                  }`}
                                >
                                  <Home className="h-5 w-5 mb-1" />
                                  <span className="text-xs font-bold">Inmueble (Venta)</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedAssetType("INMUEBLE_RENTA");
                                    setCurrentVehicle((prev) => ({ ...prev, itemType: "INMUEBLE_RENTA", propertyType: "Apartamento", brand: "" }));
                                  }}
                                  className={`flex flex-col items-center justify-center p-3.5 rounded-xl border text-center transition-all ${
                                    selectedAssetType === "INMUEBLE_RENTA"
                                      ? "bg-zinc-900 text-white border-zinc-900 shadow-sm"
                                      : "bg-zinc-50 border-zinc-200 text-zinc-700 hover:bg-zinc-100"
                                  }`}
                                >
                                  <Key className="h-5 w-5 mb-1" />
                                  <span className="text-xs font-bold">Inmueble (Renta)</span>
                                </button>
                              </div>
                            </div>

                            {/* FORM FIELDS FOR VEHICLES & MOTOS */}
                            {(selectedAssetType === "VEHICULO" || selectedAssetType === "MOTO") && (
                              <div className="space-y-4 pt-2">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                  <div className="space-y-2">
                                    <Label htmlFor="vBrand" className="text-xs font-semibold text-zinc-700">
                                      Marca <span className="text-rose-500">*</span>
                                    </Label>
                                    <Select
                                      value={currentVehicle.brand}
                                      onValueChange={(val) => setCurrentVehicle({ ...currentVehicle, brand: val || "" })}
                                    >
                                      <SelectTrigger id="vBrand" className="border-zinc-200 text-sm h-11 rounded-xl">
                                        <SelectValue placeholder="Selecciona marca" />
                                      </SelectTrigger>
                                      <SelectContent className="max-h-60">
                                        {(selectedAssetType === "MOTO" ? MOTO_BRANDS : CAR_BRANDS).map((b) => (
                                          <SelectItem key={b} value={b}>
                                            {b}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>

                                  <div className="space-y-2">
                                    <Label htmlFor="vModel" className="text-xs font-semibold text-zinc-700">
                                      Línea / Modelo <span className="text-rose-500">*</span>
                                    </Label>
                                    <Input
                                      id="vModel"
                                      placeholder={selectedAssetType === "MOTO" ? "Ej. MT-09" : "Ej. Fortuner"}
                                      value={currentVehicle.model}
                                      onChange={(e) => setCurrentVehicle({ ...currentVehicle, model: e.target.value })}
                                      className="border-zinc-200 focus-visible:ring-zinc-900 text-sm h-11 rounded-xl"
                                    />
                                  </div>

                                  <div className="space-y-2">
                                    <Label htmlFor="vYear" className="text-xs font-semibold text-zinc-700">
                                      Año Modelo <span className="text-rose-500">*</span>
                                    </Label>
                                    <Select
                                      value={currentVehicle.year.toString()}
                                      onValueChange={(val) => setCurrentVehicle({ ...currentVehicle, year: parseInt(val || "2024") || 2024 })}
                                    >
                                      <SelectTrigger id="vYear" className="border-zinc-200 text-sm h-11 rounded-xl">
                                        <SelectValue placeholder="Año" />
                                      </SelectTrigger>
                                      <SelectContent className="max-h-60">
                                        {[2026, 2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017].map((y) => (
                                          <SelectItem key={y} value={y.toString()}>
                                            {y}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>

                                  <div className="space-y-2">
                                    <Label htmlFor="vMileage" className="text-xs font-semibold text-zinc-700">
                                      Kilometraje (km) <span className="text-rose-500">*</span>
                                    </Label>
                                    <Input
                                      id="vMileage"
                                      type="number"
                                      placeholder="12000"
                                      value={currentVehicle.mileage}
                                      onChange={(e) => setCurrentVehicle({ ...currentVehicle, mileage: parseInt(e.target.value) || 0 })}
                                      className="border-zinc-200 focus-visible:ring-zinc-900 text-sm font-mono h-11 rounded-xl"
                                    />
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <Label htmlFor="vPlate" className="text-xs font-semibold text-zinc-700">
                                      Placa (Ej. KLU-890)
                                    </Label>
                                    <Input
                                      id="vPlate"
                                      placeholder="Placa del vehículo"
                                      value={currentVehicle.licensePlate}
                                      onChange={(e) => setCurrentVehicle({ ...currentVehicle, licensePlate: e.target.value.toUpperCase() })}
                                      className="border-zinc-200 focus-visible:ring-zinc-900 text-sm font-mono uppercase h-11 rounded-xl"
                                    />
                                  </div>

                                  <div className="space-y-2">
                                    <Label htmlFor="vPrice" className="text-xs font-semibold text-zinc-700">
                                      Precio de Venta Sugerido (COP) <span className="text-rose-500">*</span>
                                    </Label>
                                    <Input
                                      id="vPrice"
                                      type="number"
                                      placeholder="Ej. 120000000"
                                      value={currentVehicle.suggestedPrice || ""}
                                      onChange={(e) => setCurrentVehicle({ ...currentVehicle, suggestedPrice: parseFloat(e.target.value) || 0 })}
                                      className="border-zinc-200 focus-visible:ring-zinc-900 text-sm font-mono font-bold h-11 rounded-xl"
                                    />
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* FORM FIELDS FOR REAL ESTATE (VENTA / RENTA) */}
                            {(selectedAssetType === "INMUEBLE_VENTA" || selectedAssetType === "INMUEBLE_RENTA") && (
                              <div className="space-y-4 pt-2">
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                  <div className="space-y-2">
                                    <Label htmlFor="propType" className="text-xs font-semibold text-zinc-700">
                                      Tipo de Inmueble <span className="text-rose-500">*</span>
                                    </Label>
                                    <Select
                                      value={currentVehicle.propertyType}
                                      onValueChange={(val: any) => setCurrentVehicle({ ...currentVehicle, propertyType: val || "Apartamento" })}
                                    >
                                      <SelectTrigger id="propType" className="border-zinc-200 text-sm h-11 rounded-xl">
                                        <SelectValue placeholder="Tipo de Inmueble" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {["Apartamento", "Casa", "Lote", "Local Comercial", "Oficina"].map((pt) => (
                                          <SelectItem key={pt} value={pt}>
                                            {pt}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>

                                  <div className="sm:col-span-2 space-y-2">
                                    <Label htmlFor="propTitle" className="text-xs font-semibold text-zinc-700">
                                      Título Comercial del Inmueble <span className="text-rose-500">*</span>
                                    </Label>
                                    <Input
                                      id="propTitle"
                                      placeholder="Ej. Hermoso Apartamento con Vista al Río"
                                      value={currentVehicle.brand}
                                      onChange={(e) => setCurrentVehicle({ ...currentVehicle, brand: e.target.value })}
                                      className="border-zinc-200 focus-visible:ring-zinc-900 text-sm h-11 rounded-xl"
                                    />
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                                  <div className="space-y-2">
                                    <Label htmlFor="propNeighborhood" className="text-xs font-semibold text-zinc-700">
                                      Barrio / Sector <span className="text-rose-500">*</span>
                                    </Label>
                                    <Input
                                      id="propNeighborhood"
                                      placeholder="Ej. Alto Prado"
                                      value={currentVehicle.neighborhood}
                                      onChange={(e) => setCurrentVehicle({ ...currentVehicle, neighborhood: e.target.value })}
                                      className="border-zinc-200 focus-visible:ring-zinc-900 text-sm h-11 rounded-xl"
                                    />
                                  </div>

                                  <div className="space-y-2">
                                    <Label htmlFor="propArea" className="text-xs font-semibold text-zinc-700">
                                      Área Construida (m²)
                                    </Label>
                                    <Input
                                      id="propArea"
                                      type="number"
                                      placeholder="85"
                                      value={currentVehicle.areaM2}
                                      onChange={(e) => setCurrentVehicle({ ...currentVehicle, areaM2: parseFloat(e.target.value) || 0 })}
                                      className="border-zinc-200 text-sm h-11 rounded-xl"
                                    />
                                  </div>

                                  <div className="space-y-2">
                                    <Label htmlFor="propBedrooms" className="text-xs font-semibold text-zinc-700">
                                      Habitaciones
                                    </Label>
                                    <Input
                                      id="propBedrooms"
                                      type="number"
                                      placeholder="3"
                                      value={currentVehicle.bedrooms}
                                      onChange={(e) => setCurrentVehicle({ ...currentVehicle, bedrooms: parseInt(e.target.value) || 0 })}
                                      className="border-zinc-200 text-sm h-11 rounded-xl"
                                    />
                                  </div>

                                  <div className="space-y-2">
                                    <Label htmlFor="propPrice" className="text-xs font-semibold text-zinc-700">
                                      {selectedAssetType === "INMUEBLE_RENTA" ? "Canon Mensual (COP)" : "Precio Venta (COP)"} <span className="text-rose-500">*</span>
                                    </Label>
                                    <Input
                                      id="propPrice"
                                      type="number"
                                      placeholder={selectedAssetType === "INMUEBLE_RENTA" ? "Ej. 2800000" : "Ej. 450000000"}
                                      value={currentVehicle.suggestedPrice || ""}
                                      onChange={(e) => setCurrentVehicle({ ...currentVehicle, suggestedPrice: parseFloat(e.target.value) || 0 })}
                                      className="border-zinc-200 focus-visible:ring-zinc-900 text-sm font-mono font-bold h-11 rounded-xl"
                                    />
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Photo & Description Section */}
                            <div className="space-y-4 pt-2">
                              <div className="border border-dashed border-zinc-300 rounded-xl p-5 bg-zinc-50/60 flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div className="flex items-center gap-3 text-left">
                                  <div className="p-3 rounded-xl bg-white border border-zinc-200 text-zinc-700 shadow-sm">
                                    <Upload className="h-5 w-5" />
                                  </div>
                                  <div>
                                    <p className="text-xs font-bold text-zinc-800">
                                      Galería de Fotos ({currentVehicle.images.length} cargadas)
                                    </p>
                                    <p className="text-[11px] text-zinc-500">
                                      Cargue imágenes claras para la publicación en el marketplace de Trinova
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 w-full sm:w-auto">
                                  <Select
                                    value={selectedImageTag}
                                    onValueChange={(val) => setSelectedImageTag(val || "Principal")}
                                  >
                                    <SelectTrigger className="w-36 border-zinc-200 text-xs h-9 bg-white rounded-lg">
                                      <SelectValue placeholder="Etiqueta" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="Frontal Principal">Foto Principal</SelectItem>
                                      <SelectItem value="Cabina / Interior">Interior</SelectItem>
                                      <SelectItem value="Vista Trasera">Trasera / Baños</SelectItem>
                                      <SelectItem value="Motor y Chasis">Motor / Cocina</SelectItem>
                                      <SelectItem value="Rines y Llantas">Detalles</SelectItem>
                                    </SelectContent>
                                  </Select>

                                  <Button
                                    type="button"
                                    size="sm"
                                    onClick={handleSimulateAddImage}
                                    className="bg-zinc-900 hover:bg-zinc-800 text-white text-xs h-9 rounded-lg gap-1.5 whitespace-nowrap"
                                  >
                                    <Plus className="h-3.5 w-3.5" />
                                    <span>Agregar Foto</span>
                                  </Button>
                                </div>
                              </div>

                              {/* Observations / Description */}
                              <div className="space-y-2">
                                <Label htmlFor="vDesc" className="text-xs font-semibold text-zinc-700">
                                  Descripción Comercial & Observaciones
                                </Label>
                                <Textarea
                                  id="vDesc"
                                  rows={3}
                                  placeholder="Mencione el estado, características especiales, garantías, documentos al día, etc..."
                                  value={currentVehicle.description}
                                  onChange={(e) => setCurrentVehicle({ ...currentVehicle, description: e.target.value })}
                                  className="border-zinc-200 focus-visible:ring-zinc-900 text-sm rounded-xl"
                                />
                              </div>

                              {/* Add current vehicle button */}
                              <div className="pt-2">
                                <Button
                                  type="button"
                                  onClick={handleAddVehicleToList}
                                  className="w-full bg-zinc-900 hover:bg-zinc-800 text-white text-sm font-bold h-11 rounded-xl gap-2 shadow-sm"
                                >
                                  <Plus className="h-4 w-4" />
                                  <span>Guardar y Agregar Este Bien al Lote de Corretaje</span>
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>

            {/* Step 2 Actions */}
            <div className="flex items-center justify-between pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setCurrentStep(1);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="border-zinc-300 text-zinc-700 hover:bg-zinc-100 font-medium px-5 gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Volver a Datos de Empresa</span>
              </Button>

              <Button
                type="button"
                onClick={() => {
                  if (validateStep2()) {
                    setCurrentStep(3);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }
                }}
                className="bg-zinc-900 hover:bg-zinc-800 text-white font-medium px-6 gap-2 shadow-sm"
              >
                <span>Continuar a Contrato de Corretaje</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            STEP 3: DIGITAL BROKERAGE CONTRACT (CONTRATO DE CORRETAJE DIGITAL)
        ══════════════════════════════════════════════════════════════════ */}
        {currentStep === 3 && (
          <div className="space-y-6 max-w-[1200px] mx-auto">
            {/* Contract Summary Box Header */}
            <div className="bg-zinc-900 text-white rounded-2xl p-6 sm:p-8 shadow-md">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="bg-zinc-800 text-zinc-300 border-zinc-700 font-mono text-xs">
                      {contractSignature.contractId}
                    </Badge>
                    <Badge className="bg-emerald-950 text-emerald-300 border-emerald-800 text-xs">
                      Pendiente de Firma
                    </Badge>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                    Contrato Marco de Corretaje Comercial & Mandato de Intermediación
                  </h2>
                  <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-2xl">
                    Celebrado entre la plataforma digital administradora y el concesionario proveedor{" "}
                    <span className="text-white font-semibold">{companyData.legalName}</span> para la
                    consignación y comercialización de {vehicles.length} {vehicles.length === 1 ? "vehículo" : "vehículos"}.
                  </p>
                </div>

                <div className="bg-zinc-800/80 p-4 rounded-xl border border-zinc-700 text-right shrink-0">
                  <p className="text-[11px] text-zinc-400 uppercase tracking-wider">Valor Lote Asegurado</p>
                  <p className="text-xl font-bold font-mono text-white">
                    ${totalValuation.toLocaleString()} <span className="text-xs font-normal text-zinc-400">USD</span>
                  </p>
                  <p className="text-[10px] text-zinc-400 mt-0.5">Comisión plataforma: 3.5%</p>
                </div>
              </div>
            </div>

            {/* Legal Text Block with Simulated Scrollable Notarial Document */}
            <Card className="border-zinc-200 bg-white shadow-sm overflow-hidden">
              <CardHeader className="border-b border-zinc-100 bg-zinc-50/70 pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-zinc-700" />
                    <div>
                      <CardTitle className="text-base font-bold text-zinc-900">
                        Texto Jurídico del Contrato de Corretaje Digital
                      </CardTitle>
                      <CardDescription className="text-xs text-zinc-500">
                        Lea con atención las siguientes cláusulas contractuales antes de estampar su firma digital
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[11px] font-mono bg-white border-zinc-200 text-zinc-600">
                    Vigencia: 12 Meses Renovables
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="p-0">
                {/* Scrollable Legal Document Viewer */}
                <div className="h-96 overflow-y-auto p-6 sm:p-8 space-y-6 text-xs sm:text-sm text-zinc-700 leading-relaxed bg-white border-b border-zinc-200 select-text font-serif">
                  <div className="text-center pb-4 border-b border-zinc-200 not-italic font-sans">
                    <p className="text-xs font-bold tracking-widest uppercase text-zinc-500">DOCUMENTO OFICIAL DE CORRETAJE</p>
                    <h3 className="text-base font-bold text-zinc-900 mt-1">
                      CONTRATO PRIVADO DE CORRETAJE MERCANTIL Y AUTORIZACIÓN DE INTERMEDIACIÓN AUTOMOTRIZ
                    </h3>
                    <p className="text-xs text-zinc-500 font-mono mt-1">
                      ID CONTRATO: {contractSignature.contractId} · EMISIÓN: {new Date().toLocaleDateString("es-ES", { year: "numeric", month: "long", day: "numeric" })}
                    </p>
                  </div>

                  <div className="space-y-4 text-justify">
                    <p>
                      Entre los suscritos, a saber: por una parte, <strong>JY TRINOVA S.A.S.</strong> (en adelante denominada <strong>"EL CORREDOR"</strong> o <strong>"LA EMPRESA DE INTERMEDIACIÓN"</strong>), sociedad válidamente constituida dedicada a la intermediación comercial, corretaje y comercialización de vehículos automotores; y por la otra parte, <strong>{companyData.legalName.toUpperCase()}</strong>, identificada con el {companyData.taxIdType} No. <strong>{companyData.taxId}</strong>, con domicilio en {companyData.address}, ciudad de {companyData.city}, {companyData.country}, representada en este acto por <strong>{companyData.legalRepName.toUpperCase()}</strong>, mayor de edad, identificado con {companyData.legalRepDocType} No. <strong>{companyData.legalRepDocId}</strong>, en su calidad de {companyData.legalRepRole} (en adelante denominado <strong>"EL PROVEEDOR"</strong> o <strong>"EL CONCESIONARIO"</strong>), se ha convenido celebrar el presente Contrato de Corretaje Comercial, el cual se regirá por las siguientes cláusulas:
                    </p>

                    <h4 className="font-bold text-zinc-900 font-sans text-xs uppercase tracking-wider pt-2">
                      CLÁUSULA PRIMERA. – OBJETO DEL CONTRATO:
                    </h4>
                    <p>
                      El presente contrato tiene por objeto regular las condiciones bajo las cuales <strong>EL CORREDOR</strong> desplegará sus capacidades tecnológicas, comerciales y de mercadeo digital para contactar, intermediar y promover la venta de los vehículos automotores de propiedad y/o legítima tenencia de <strong>EL PROVEEDOR</strong> con potenciales compradores finales debidamente calificados a través de la red del marketplace.
                    </p>

                    <h4 className="font-bold text-zinc-900 font-sans text-xs uppercase tracking-wider pt-2">
                      CLÁUSULA SEGUNDA. – IDENTIFICACIÓN DEL INVENTARIO Y DECLARACIÓN DE PROCEDENCIA LÍCITA:
                    </h4>
                    <p>
                      El inventario objeto del presente mandato comprende inicialmente los siguientes vehículos registrados en la plataforma:
                    </p>
                    <div className="bg-zinc-50 p-3 rounded-lg border border-zinc-200 font-mono text-xs space-y-2">
                      {vehicles.map((v, i) => (
                        <div key={v.id} className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-200/60 pb-1.5 last:border-0 last:pb-0">
                          <span>
                            <strong>Unidad {i + 1}:</strong> {v.brand} {v.model} ({v.year}) - VIN: {v.vin || "No provisto"} - Placa: {v.licensePlate || "N/A"}
                          </span>
                          <span className="font-bold text-zinc-900">
                            PVP: ${v.suggestedPrice.toLocaleString()} USD (Comisión: {v.brokerageFeeType === "percentage" ? `${v.brokerageFeeValue}%` : `$${v.brokerageFeeValue}`})
                          </span>
                        </div>
                      ))}
                    </div>
                    <p>
                      <strong>EL PROVEEDOR</strong> garantiza bajo la gravedad de juramento que todos y cada uno de los vehículos consignados cuentan con procedencia 100% legal, se encuentran libres de gravámenes, prendas, embargos, medidas cautelares o limitaciones al dominio, y con sus obligaciones tributarias y de tránsito plenamente al día.
                    </p>

                    <h4 className="font-bold text-zinc-900 font-sans text-xs uppercase tracking-wider pt-2">
                      CLÁUSULA TERCERA. – HONORARIOS DE CORRETAJE Y LIQUIDACIÓN:
                    </h4>
                    <p>
                      Las partes acuerdan que por cada transacción efectivamente perfeccionada y cerrada a través de la gestión de intermediación de <strong>EL CORREDOR</strong>, éste devengará una comisión de corretaje comercial correspondiente al porcentaje o valor estipulado en la ficha de cada unidad. Los fondos de la venta serán liquidados y transferidos a la cuenta bancaria de <strong>EL PROVEEDOR</strong> dentro de los tres (3) días hábiles siguientes al traspaso legal y entrega a satisfacción del vehículo al comprador.
                    </p>

                    <h4 className="font-bold text-zinc-900 font-sans text-xs uppercase tracking-wider pt-2">
                      CLÁUSULA CUARTA. – OBLIGACIONES DE LAS PARTES:
                    </h4>
                    <p>
                      <strong>1. De EL CORREDOR:</strong> (a) Publicar y promover el inventario en canales calificados; (b) Realizar el perfilamiento y calificación crediticia de compradores; (c) Coordinar visitas y pruebas de manejo bajo protocolos de seguridad; (d) Facilitar el proceso de trámites de traspaso.<br />
                      <strong>2. De EL PROVEEDOR:</strong> (a) Mantener el vehículo en óptimas condiciones de conservación y disponible para inspección; (b) No vender la unidad sin previa notificación inmediata al corredor si existe una oferta formal en curso; (c) Responder por la garantía legal y el saneamiento por evicción y vicios ocultos de conformidad con la ley del consumidor automotriz aplicable.
                    </p>

                    <h4 className="font-bold text-zinc-900 font-sans text-xs uppercase tracking-wider pt-2">
                      CLÁUSULA QUINTA. – VIGENCIA, NO EXCLUSIVIDAD Y TERMINACIÓN:
                    </h4>
                    <p>
                      El presente contrato tendrá una vigencia de doce (12) meses contados a partir de su firma digital, renovable automáticamente por periodos iguales salvo manifestación en contrario enviada con quince (15) días de antelación. Salvo pacto expreso por escrito, el presente mandato es de carácter <em>no exclusivo</em>, permitiendo a <strong>EL PROVEEDOR</strong> comercializar sus unidades por canales propios respetando los clientes presentados por el corredor.
                    </p>

                    <h4 className="font-bold text-zinc-900 font-sans text-xs uppercase tracking-wider pt-2">
                      CLÁUSULA SEXTA. – HABEAS DATA, PROTECCIÓN DE DATOS Y CONFIDENCIALIDAD:
                    </h4>
                    <p>
                      Ambas partes se obligan a dar estricto cumplimiento a la legislación sobre protección de datos personales. <strong>EL PROVEEDOR</strong> autoriza de manera previa, expresa e informada a <strong>EL CORREDOR</strong> a recolectar, almacenar y tratar los datos de contacto y comerciales para los fines exclusivos de ejecución del mandato de corretaje.
                    </p>

                    <h4 className="font-bold text-zinc-900 font-sans text-xs uppercase tracking-wider pt-2">
                      CLÁUSULA SÉPTIMA. – VALIDEZ Y EFICACIA DE LA FIRMA DIGITAL:
                    </h4>
                    <p>
                      Las partes convienen expresamente que la firma estampada en este documento mediante mecanismos electrónicos, huella criptográfica SHA-256 y sellado de tiempo posee plena validez jurídica, valor probatorio y fuerza vinculante de conformidad con la legislación de comercio electrónico y firma digital vigente.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Interactive Digital Signature Module */}
            <Card className="border-zinc-200 bg-white shadow-sm">
              <CardHeader className="border-b border-zinc-100 pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-zinc-100 text-zinc-900">
                      <PenTool className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-base font-bold text-zinc-900">
                        Panel de Firma Digital del Representante Legal
                      </CardTitle>
                      <CardDescription className="text-xs text-zinc-500">
                        Seleccione su modalidad de firma y complete los datos de formalización notarial
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant="outline" className="border-emerald-300 text-emerald-800 bg-emerald-50 text-xs font-mono">
                    IP: {contractSignature.ipAddress}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="pt-6 space-y-6">
                {/* Signer information confirmation */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-zinc-50 p-4 rounded-xl border border-zinc-200/80 text-xs">
                  <div>
                    <span className="text-zinc-500 block">Firmante:</span>
                    <span className="font-bold text-zinc-900">{contractSignature.signerName}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block">Documento:</span>
                    <span className="font-bold text-zinc-900 font-mono">
                      {contractSignature.signerDocType}: {contractSignature.signerDocId}
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block">Cargo / Calidad:</span>
                    <span className="font-bold text-zinc-900">{contractSignature.signerRole}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block">Hash Integridad:</span>
                    <span className="font-mono text-[10px] text-zinc-700 truncate block">
                      {calculatedVerificationHash.slice(0, 18)}...
                    </span>
                  </div>
                </div>

                {/* Signature Input Mode Selection */}
                <Tabs
                  value={contractSignature.signatureType}
                  onValueChange={(val: any) => setContractSignature({ ...contractSignature, signatureType: val })}
                  className="w-full"
                >
                  <TabsList className="grid grid-cols-2 max-w-md bg-zinc-100 p-1">
                    <TabsTrigger value="type" className="text-xs gap-1.5 data-[state=active]:bg-white">
                      <FileSignature className="h-3.5 w-3.5" />
                      <span>Rúbrica Tipográfica Formal</span>
                    </TabsTrigger>
                    <TabsTrigger value="draw" className="text-xs gap-1.5 data-[state=active]:bg-white">
                      <PenTool className="h-3.5 w-3.5" />
                      <span>Trazo Manuscrito (Canvas)</span>
                    </TabsTrigger>
                  </TabsList>

                  {/* Mode 1: Typed Signature */}
                  <TabsContent value="type" className="pt-4 space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="typedSig" className="text-xs font-semibold text-zinc-700">
                        Escriba su Nombre Completo para Generar la Rúbrica Jurídica
                      </Label>
                      <Input
                        id="typedSig"
                        placeholder="Nombre completo del representante..."
                        value={contractSignature.typedSignatureText}
                        onChange={(e) => setContractSignature({ ...contractSignature, typedSignatureText: e.target.value })}
                        className="border-zinc-200 focus-visible:ring-zinc-900 text-sm font-medium"
                      />
                    </div>

                    {/* Signature Font Preview */}
                    <div className="p-6 rounded-xl border border-zinc-200 bg-zinc-50/50 flex flex-col items-center justify-center min-h-[120px] text-center">
                      <p className="text-[10px] uppercase tracking-widest text-zinc-400 mb-2">Vista Previa de la Rúbrica</p>
                      <p className="text-3xl sm:text-4xl text-zinc-900 font-heading italic tracking-wide">
                        {contractSignature.typedSignatureText || "Firma Digital"}
                      </p>
                      <div className="w-48 h-0.5 bg-zinc-300 mt-2 mb-1" />
                      <p className="text-[11px] font-mono text-zinc-500">
                        {contractSignature.signerName} · {contractSignature.signerDocId}
                      </p>
                    </div>
                  </TabsContent>

                  {/* Mode 2: Drawn Signature on Canvas */}
                  <TabsContent value="draw" className="pt-4 space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-semibold text-zinc-700">
                          Dibuje su firma con el cursor del mouse o pantalla táctil
                        </Label>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={clearCanvas}
                          className="text-xs h-7 text-zinc-500 hover:text-zinc-900 gap-1"
                        >
                          <RotateCcw className="h-3 w-3" />
                          <span>Limpiar Trazo</span>
                        </Button>
                      </div>

                      <div className="border border-zinc-300 rounded-xl bg-white overflow-hidden shadow-inner flex flex-col items-center justify-center relative touch-none">
                        <canvas
                          ref={canvasRef}
                          width={600}
                          height={160}
                          className="w-full h-40 cursor-crosshair bg-white"
                          onMouseDown={startDrawing}
                          onMouseMove={draw}
                          onMouseUp={stopDrawing}
                          onMouseLeave={stopDrawing}
                          onTouchStart={startDrawing}
                          onTouchMove={draw}
                          onTouchEnd={stopDrawing}
                        />
                        {!hasCanvasSignature && (
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-zinc-300 text-xs">
                            <span>Firme aquí utilizando el cursor o su dedo</span>
                          </div>
                        )}
                        <div className="w-3/4 border-b border-dashed border-zinc-300 absolute bottom-6 pointer-events-none" />
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>

                <Separator className="bg-zinc-100" />

                {/* Mandatory Consent Checkboxes */}
                <div className="space-y-3.5 pt-1">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="acceptTerms"
                      checked={contractSignature.acceptTerms}
                      onCheckedChange={(c) => setContractSignature({ ...contractSignature, acceptTerms: Boolean(c) })}
                      className="mt-0.5 border-zinc-400 data-[state=checked]:bg-zinc-900 data-[state=checked]:text-white"
                    />
                    <Label htmlFor="acceptTerms" className="text-xs text-zinc-700 leading-relaxed font-normal cursor-pointer">
                      <strong>Acepto y ratifico</strong> todas las cláusulas, términos comerciales, esquema de honorarios y condiciones estipuladas en el presente Contrato de Corretaje Comercial.
                    </Label>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="acceptWarranty"
                      checked={contractSignature.acceptVehicleWarranty}
                      onCheckedChange={(c) => setContractSignature({ ...contractSignature, acceptVehicleWarranty: Boolean(c) })}
                      className="mt-0.5 border-zinc-400 data-[state=checked]:bg-zinc-900 data-[state=checked]:text-white"
                    />
                    <Label htmlFor="acceptWarranty" className="text-xs text-zinc-700 leading-relaxed font-normal cursor-pointer">
                      <strong>Certifico la procedencia lícita</strong>, veracidad en los kilometrajes declarados y vigencia legal de los {vehicles.length} vehículos cargados en este contrato.
                    </Label>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="acceptPrivacy"
                      checked={contractSignature.acceptDataPrivacy}
                      onCheckedChange={(c) => setContractSignature({ ...contractSignature, acceptDataPrivacy: Boolean(c) })}
                      className="mt-0.5 border-zinc-400 data-[state=checked]:bg-zinc-900 data-[state=checked]:text-white"
                    />
                    <Label htmlFor="acceptPrivacy" className="text-xs text-zinc-700 leading-relaxed font-normal cursor-pointer">
                      <strong>Autorizo el tratamiento de datos</strong> personales y comerciales conforme a las políticas de privacidad y protección de datos del marketplace.
                    </Label>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="acceptSigValidity"
                      checked={contractSignature.acceptDigitalSignatureValidity}
                      onCheckedChange={(c) => setContractSignature({ ...contractSignature, acceptDigitalSignatureValidity: Boolean(c) })}
                      className="mt-0.5 border-zinc-400 data-[state=checked]:bg-zinc-900 data-[state=checked]:text-white"
                    />
                    <Label htmlFor="acceptSigValidity" className="text-xs text-zinc-700 leading-relaxed font-normal cursor-pointer">
                      <strong>Otorgo plena validez jurídica</strong> a esta firma digital, reconociendo su fuerza probatoria vinculante con sellado notarial y hash criptográfico.
                    </Label>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Step 3 Actions */}
            <div className="flex items-center justify-between pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setCurrentStep(2);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="border-zinc-300 text-zinc-700 hover:bg-zinc-100 font-medium px-5 gap-2"
                disabled={isSubmitting}
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Volver a Inventario</span>
              </Button>

              <Button
                type="button"
                onClick={handleSignContract}
                disabled={isSubmitting}
                className="bg-zinc-900 hover:bg-zinc-800 text-white font-bold px-8 py-2.5 h-11 gap-2 shadow-md"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Estampando Firma Digital y Hash...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    <span>Firmar y Formalizar Registro de Proveedor</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            STEP 4: CONFIRMATION & SUCCESS SCREEN (CONTRATO FORMALIZADO)
        ══════════════════════════════════════════════════════════════════ */}
        {currentStep === 4 && (
          <div className="space-y-8 max-w-4xl mx-auto">
            {/* Celebration & Certificate Header */}
            <div className="bg-white border border-zinc-200 rounded-2xl p-8 sm:p-10 shadow-sm text-center space-y-4">
              <div className="mx-auto h-16 w-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200 shadow-sm">
                <BadgeCheck className="h-9 w-9" />
              </div>

              <div className="max-w-xl mx-auto">
                <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 text-xs mb-2">
                  Contrato de Corretaje Formalizado Exitosamente
                </Badge>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight">
                  ¡Bienvenido a la Red de Proveedores AutoBroker!
                </h2>
                <p className="text-sm text-zinc-600 mt-2 leading-relaxed">
                  El contrato marco de corretaje para <strong className="text-zinc-900">{companyData.tradeName}</strong> ({companyData.legalName}) ha sido sellado criptográficamente y depositado en nuestra bóveda notarial.
                </p>
              </div>

              {/* Certificate Details Strip */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-zinc-50 p-4 rounded-xl border border-zinc-200/80 text-left mt-6 max-w-2xl mx-auto text-xs">
                <div>
                  <span className="text-zinc-500 block">Número de Contrato:</span>
                  <span className="font-bold text-zinc-900 font-mono">{contractSignature.contractId}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block">Fecha y Hora de Firma:</span>
                  <span className="font-bold text-zinc-900 font-mono">
                    {new Date(contractSignature.signedAtTimestamp).toLocaleString("es-ES")}
                  </span>
                </div>
                <div>
                  <span className="text-zinc-500 block">Vehículos en Consignación:</span>
                  <span className="font-bold text-emerald-800 font-mono">
                    {vehicles.length} Unidades (${totalValuation.toLocaleString()} USD)
                  </span>
                </div>
              </div>

              {/* Hash Certificate Box */}
              <div className="p-3 bg-zinc-100/70 rounded-lg border border-zinc-200 max-w-2xl mx-auto flex items-center justify-between gap-2 text-[11px] font-mono text-zinc-600">
                <div className="flex items-center gap-2 truncate">
                  <Lock className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
                  <span className="truncate">{contractSignature.verificationHash || calculatedVerificationHash}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(contractSignature.verificationHash || calculatedVerificationHash);
                    toast.success("Hash criptográfico copiado al portapapeles");
                  }}
                  className="h-6 text-[10px] text-zinc-700 hover:bg-zinc-200"
                >
                  <Copy className="h-3 w-3 mr-1" />
                  Copiar
                </Button>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
                <Button
                  onClick={() => setShowPrintView(true)}
                  className="bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-xs h-10 px-5 gap-2 shadow-sm"
                >
                  <Printer className="h-4 w-4" />
                  <span>Imprimir / Descargar Contrato Notarial (PDF)</span>
                </Button>

                <Button
                  variant="outline"
                  onClick={() => {
                    toast.info("Redirigiendo al panel de inventario y analíticas del proveedor...");
                  }}
                  className="border-zinc-300 text-zinc-700 hover:bg-zinc-100 text-xs h-10 px-5 gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span>Ir al Panel de Control de Inventario</span>
                </Button>
              </div>
            </div>

            {/* Next Steps Card */}
            <Card className="border-zinc-200 bg-white shadow-sm">
              <CardHeader className="border-b border-zinc-100 pb-4">
                <CardTitle className="text-base font-bold text-zinc-900">
                  Próximos Pasos en el Proceso de Activación
                </CardTitle>
                <CardDescription className="text-xs text-zinc-500">
                  Flujo de trabajo para la publicación e inicio de comercialización de su inventario
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl border border-zinc-200 bg-zinc-50/50 space-y-2">
                    <div className="h-7 w-7 rounded-lg bg-zinc-900 text-white flex items-center justify-center text-xs font-bold">
                      1
                    </div>
                    <h4 className="text-xs font-bold text-zinc-900">Validación Documental</h4>
                    <p className="text-xs text-zinc-500 leading-relaxed">
                      Nuestro equipo legal verificará los certificados de tradición y libertad de los vehículos en un plazo máximo de 2 a 4 horas hábiles.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl border border-zinc-200 bg-zinc-50/50 space-y-2">
                    <div className="h-7 w-7 rounded-lg bg-zinc-900 text-white flex items-center justify-center text-xs font-bold">
                      2
                    </div>
                    <h4 className="text-xs font-bold text-zinc-900">Inspección Pericial 360°</h4>
                    <p className="text-xs text-zinc-500 leading-relaxed">
                      Un perito automotriz certificado agendará la toma de fotografía profesional y peritaje de carrocería y motor sin costo adicional.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl border border-zinc-200 bg-zinc-50/50 space-y-2">
                    <div className="h-7 w-7 rounded-lg bg-zinc-900 text-white flex items-center justify-center text-xs font-bold">
                      3
                    </div>
                    <h4 className="text-xs font-bold text-zinc-900">Publicación & Matching</h4>
                    <p className="text-xs text-zinc-500 leading-relaxed">
                      Sus vehículos se activarán con insignia de Concesionario Verificado, conectando inmediatamente con compradores y solicitudes de crédito.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Reset / Register Another Batch */}
            <div className="text-center pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setCurrentStep(1);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="text-xs text-zinc-500 hover:text-zinc-900"
              >
                ¿Desea registrar otra empresa o nuevo lote de vehículos? Haga clic aquí
              </Button>
            </div>
          </div>
        )}
      </main>

      {/* ══════════════════════════════════════════════════════════════════
          PRINT / PDF MODAL VIEW FOR SIGNED CONTRACT
      ══════════════════════════════════════════════════════════════════ */}
      <Dialog open={showPrintView} onOpenChange={setShowPrintView}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-8 bg-white text-zinc-900 font-serif">
          <DialogHeader className="font-sans border-b border-zinc-200 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-lg font-bold text-zinc-900">
                  Copia Certificada del Contrato de Corretaje Comercial
                </DialogTitle>
                <DialogDescription className="text-xs text-zinc-500 font-mono">
                  Documento con validez jurídica notarial · Hash: {contractSignature.verificationHash || calculatedVerificationHash}
                </DialogDescription>
              </div>
              <Button
                size="sm"
                onClick={() => window.print()}
                className="bg-zinc-900 text-white text-xs gap-1.5 font-sans"
              >
                <Printer className="h-3.5 w-3.5" />
                <span>Imprimir Documento</span>
              </Button>
            </div>
          </DialogHeader>

          {/* Printable Document Body */}
          <div className="space-y-6 pt-4 text-xs leading-relaxed text-zinc-800">
            <div className="text-center pb-2 border-b border-zinc-200 font-sans">
              <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-900">
                YJD TRINOVA S.A.S. · CONTRATO DE INTERMEDIACIÓN & CORRETAJE MERCANTIL
              </h2>
              <p className="text-xs text-zinc-500 font-mono mt-1">NIT 902.095.222-8 · Barranquilla, Atlántico · ID: {contractSignature.contractId}</p>
            </div>

            <p>
              En la ciudad de {companyData.city || "Barranquilla"}, a los {new Date().getDate()} días del mes de{" "}
              {new Date().toLocaleString("es-ES", { month: "long" })} de {new Date().getFullYear()}, se suscribe
              el presente contrato entre <strong>YJD TRINOVA S.A.S.</strong> (NIT 902.095.222-8, con domicilio en Calle 82 # 21 Sur 06 Esquina, Barranquilla, actuando como El Corredor Intermediario) y{" "}
              <strong>{companyData.legalName.toUpperCase()}</strong> ({companyData.taxIdType} No. {companyData.taxId}),
              representada legalmente por <strong>{companyData.legalRepName}</strong> ({companyData.legalRepDocType} No. {companyData.legalRepDocId}).
            </p>

            <div className="border border-zinc-200 p-4 rounded bg-zinc-50 font-sans text-xs space-y-2">
              <p className="font-bold text-zinc-900">INVENTARIO ASIGNADO AL MANDATO:</p>
              {vehicles.map((v, idx) => (
                <div key={v.id} className="flex justify-between border-b border-zinc-200 pb-1">
                  <span>
                    #{idx + 1}: {v.brand} {v.model} {v.year} (VIN: {v.vin})
                  </span>
                  <span className="font-bold font-mono">${Number(v.suggestedPrice).toLocaleString("es-CO")} COP</span>
                </div>
              ))}
            </div>

            <p>
              Las partes manifiestan haber leído, consentido y aceptado en su totalidad las estipulaciones contractuales relativas a honorarios de corretaje comercial, garantías de procedencia legal, liquidación directa y protección de datos conforme a la Ley 1581 de 2012.
            </p>

            {/* Signature Box */}
            <div className="pt-8 border-t border-zinc-300 grid grid-cols-2 gap-8 font-sans">
              <div className="space-y-2">
                <p className="text-[11px] font-bold uppercase text-zinc-500">Por la Plataforma Corredora:</p>
                <div className="h-16 flex items-end">
                  <span className="font-heading italic text-lg text-zinc-800">YJD TRINOVA S.A.S. Digital Seal</span>
                </div>
                <div className="border-t border-zinc-400 pt-1 text-[11px] text-zinc-600">
                  <p className="font-bold">Dirección General & Comercial</p>
                  <p>YJD TRINOVA S.A.S. · NIT 902.095.222-8</p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-[11px] font-bold uppercase text-zinc-500">Por el Concesionario Proveedor:</p>
                <div className="h-16 flex items-end">
                  {contractSignature.signatureType === "draw" && contractSignature.drawnSignatureDataUrl ? (
                    <img
                      src={contractSignature.drawnSignatureDataUrl}
                      alt="Firma"
                      className="max-h-14 object-contain"
                    />
                  ) : (
                    <span className="font-heading italic text-xl text-zinc-900">
                      {contractSignature.typedSignatureText || companyData.legalRepName}
                    </span>
                  )}
                </div>
                <div className="border-t border-zinc-400 pt-1 text-[11px] text-zinc-600">
                  <p className="font-bold">{companyData.legalRepName}</p>
                  <p>{companyData.legalRepDocType}: {companyData.legalRepDocId}</p>
                  <p className="text-[10px] text-zinc-400 font-mono">
                    Sellado digital: {new Date().toISOString()} · IP: {contractSignature.ipAddress}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="font-sans border-t border-zinc-200 pt-4">
            <Button variant="outline" size="sm" onClick={() => setShowPrintView(false)}>
              Cerrar Vista
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

