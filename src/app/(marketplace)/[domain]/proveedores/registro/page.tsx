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

// Types
export interface CompanyData {
  legalName: string;
  tradeName: string;
  taxIdType: string;
  taxId: string;
  companyType: string;
  yearsInBusiness: string;
  branchesCount: string;
  website: string;
  address: string;
  city: string;
  country: string;
  phone: string;
  email: string;
  legalRepName: string;
  legalRepDocType: string;
  legalRepDocId: string;
  legalRepRole: string;
  legalRepEmail: string;
  legalRepPhone: string;
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
  condition: "Nuevo (0km)" | "Seminuevo Certificado" | "Usado Seleccionado";
  engine: string;
  suggestedPrice: number;
  brokerageFeeType: "percentage" | "fixed";
  brokerageFeeValue: number;
  availability: string;
  description: string;
  features: string[];
  images: VehicleImage[];
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

const POPULAR_BRANDS = [
  "Porsche", "Mercedes-Benz", "BMW", "Audi", "Land Rover", "Volvo", "Ferrari",
  "Maserati", "Jaguar", "Lexus", "Toyota", "Ford", "Chevrolet", "Volkswagen",
  "Jeep", "Hyundai", "Kia", "Mazda", "Tesla", "BYD"
];

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
      setResolvedDomain(routerParams.domain);
    }
  }, [params, routerParams]);

  // Stepper state: 1: Company, 2: Vehicles, 3: Contract, 4: Success
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showPreviewModal, setShowPreviewModal] = useState<boolean>(false);
  const [showPrintView, setShowPrintView] = useState<boolean>(false);

  // STEP 1: Company Data
  const [companyData, setCompanyData] = useState<CompanyData>({
    legalName: "Inversiones Automotrices Andinas S.A.S.",
    tradeName: "Andina Motors Prestige",
    taxIdType: "NIT",
    taxId: "901.458.789-3",
    companyType: "Concesionario Oficial & Multimarca Premium",
    yearsInBusiness: "12",
    branchesCount: "3",
    website: "https://andinamotors.com",
    address: "Avenida Las Palmas # 28 - 140, Sede Corporativa",
    city: "Medellín",
    country: "Colombia",
    phone: "+57 (604) 448-9000",
    email: "concesionario@andinamotors.com",
    legalRepName: "Mauricio Restrepo Saldarriaga",
    legalRepDocType: "Cédula de Ciudadanía",
    legalRepDocId: "71.298.441",
    legalRepRole: "Representante Legal Principal",
    legalRepEmail: "m.restrepo@andinamotors.com",
    legalRepPhone: "+57 310 889 4521",
    bankName: "Bancolombia",
    bankAccountType: "Cuenta Corriente",
    bankAccountNumber: "032-984511-90",
  });

  // STEP 2: Vehicle Inventory List
  const [vehicles, setVehicles] = useState<VehicleItem[]>([
    {
      id: "veh-demo-1",
      brand: "Porsche",
      model: "Macan GTS",
      year: 2024,
      trim: "Sport Chrono Package",
      bodyType: "SUV Premium",
      mileage: 8500,
      transmission: "Automática PDK 7 Vel.",
      fuelType: "Gasolina Extra (V6 2.9L Biturbo)",
      exteriorColor: "Crayon Grey (Gris Tiza)",
      interiorColor: "Cuero Negro con Costuras Carmine Red",
      vin: "WP1ZZZ95ZPLB84920",
      licensePlate: "KLU-890",
      condition: "Seminuevo Certificado",
      engine: "2.9L V6 Twin-Turbo (440 HP / 550 Nm)",
      suggestedPrice: 118000,
      brokerageFeeType: "percentage",
      brokerageFeeValue: 3.5,
      availability: "Disponible en Sala Principal",
      description:
        "Vehículo en impecable estado estético y mecánico. Garantía Porsche Approved activa hasta 2026. Mantenimientos al día en taller oficial, cero reclamaciones o siniestros.",
      features: [
        "Techo Panorámico de Cristal",
        "Tapicería en Cuero Nappa / Alcantara",
        "Sistema de Sonido Premium (Burmester / Bose / Harman Kardon)",
        "Paquete de Asistencias a la Conducción ADAS (Nivel 2)",
        "Suspensión Neumática Adaptativa",
        "Cámaras de Visión 360° con Render 3D",
        "Rines de Aleación Ligera Forjados",
        "Garantía de Fábrica Vigente"
      ],
      images: SAMPLE_VEHICLE_IMAGES,
    },
  ]);

  // Form state for creating a new vehicle in Step 2
  const [currentVehicle, setCurrentVehicle] = useState<Omit<VehicleItem, "id">>({
    brand: "BMW",
    model: "M3 Competition xDrive",
    year: 2023,
    trim: "M Carbon Exterior Package",
    bodyType: "Sedán Deportivo",
    mileage: 14200,
    transmission: "M Steptronic 8 Vel. Drivelogic",
    fuelType: "Gasolina (S58 3.0L TwinPower Turbo)",
    exteriorColor: "Isle of Man Green",
    interiorColor: "Cuero Merino Silverstone / Negro",
    vin: "WBA33AY08PFS91823",
    licensePlate: "NXZ-432",
    condition: "Seminuevo Certificado",
    engine: "3.0L L6 Twin-Turbo (510 HP / 650 Nm)",
    suggestedPrice: 99500,
    brokerageFeeType: "percentage",
    brokerageFeeValue: 3.5,
    availability: "Disponible en Vitrina",
    description:
      "Unico dueño, paquete de frenos M Compound, escape deportivo M Sport, historial de servicio completo en BMW.",
    features: [
      "Tapicería en Cuero Nappa / Alcantara",
      "Head-Up Display Proyectado",
      "Faros Matrix LED / Láser Adaptativos",
      "Apple CarPlay & Android Auto Inalámbrico",
      "Cámaras de Visión 360° con Render 3D"
    ],
    images: [],
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
    if (!companyData.legalName.trim()) {
      toast.error("Por favor ingresa la Razón Social de la empresa");
      return false;
    }
    if (!companyData.taxId.trim()) {
      toast.error("Por favor ingresa el NIT / Identificación Fiscal");
      return false;
    }
    if (!companyData.email.trim() || !companyData.email.includes("@")) {
      toast.error("Por favor ingresa un correo corporativo válido");
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
    return true;
  };

  // Step 2 Validation
  const validateStep2 = (): boolean => {
    if (vehicles.length === 0) {
      toast.error("Debes agregar al menos 1 vehículo al lote de corretaje para continuar");
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
      toast.error("Debes certificar la procedencia legal y estado del inventario");
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

  // Handler to add a new vehicle to the list
  const handleAddVehicleToList = () => {
    if (!currentVehicle.brand || !currentVehicle.model || !currentVehicle.suggestedPrice) {
      toast.error("Completa al menos la Marca, Modelo y Precio de Venta sugerido");
      return;
    }

    const newVehicle: VehicleItem = {
      ...currentVehicle,
      id: `veh-${Date.now()}`,
      images: currentVehicle.images.length > 0 ? currentVehicle.images : SAMPLE_VEHICLE_IMAGES.slice(0, 2),
    };

    setVehicles((prev) => [...prev, newVehicle]);
    toast.success(`Vehículo ${newVehicle.brand} ${newVehicle.model} agregado al inventario del contrato`);

    // Reset current form to a clean state
    setCurrentVehicle({
      brand: "Mercedes-Benz",
      model: "GLE 450 4MATIC",
      year: 2024,
      trim: "AMG Line Night Edition",
      bodyType: "SUV",
      mileage: 4200,
      transmission: "9G-TRONIC Automática",
      fuelType: "Mild Hybrid Gasolina (3.0L Turbo)",
      exteriorColor: "Negro Obsidiana Metalizado",
      interiorColor: "Cuero Nappa Café Tartufo",
      vin: "W1N1671591A992810",
      licensePlate: "LUX-777",
      condition: "Seminuevo Certificado",
      engine: "3.0L Turbo Inline-6 EQ Boost (375 HP)",
      suggestedPrice: 104500,
      brokerageFeeType: "percentage",
      brokerageFeeValue: 3.5,
      availability: "Disponible en Vitrina",
      description: "Estado impecable, techo panorámico, paquete acústico con doble cristal.",
      features: [
        "Techo Panorámico de Cristal",
        "Sistema de Sonido Premium (Burmester / Bose / Harman Kardon)",
        "Suspensión Neumática Adaptativa"
      ],
      images: [],
    });
  };

  const handleRemoveVehicle = (id: string) => {
    if (vehicles.length <= 1) {
      toast.error("El contrato debe contener al menos un vehículo registrado.");
      return;
    }
    setVehicles((prev) => prev.filter((v) => v.id !== id));
    toast.info("Vehículo retirado de la lista");
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
  const handleSignContract = () => {
    if (!validateStep3()) return;

    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setContractSignature((prev) => ({
        ...prev,
        verificationHash: calculatedVerificationHash,
        signedAtTimestamp: new Date().toISOString(),
      }));
      setCurrentStep(4);
      toast.success("¡Contrato firmado y formalizado con éxito! Registro de proveedor activo.");
    }, 1800);
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
              <ShieldCheck className="h-5 w-5 text-zinc-100" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading font-bold text-lg tracking-tight text-zinc-900">
                  AutoBroker<span className="text-zinc-500 font-normal">Core</span>
                </span>
                <Badge variant="outline" className="text-[11px] font-mono uppercase bg-zinc-100 border-zinc-200 text-zinc-700">
                  {resolvedDomain ? `${resolvedDomain}.marketplace` : "Portal Proveedores"}
                </Badge>
              </div>
              <p className="text-xs text-zinc-500 hidden sm:block">
                Portal Oficial de Afiliación & Mandato de Corretaje Comercial
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
                    className="text-xs border-zinc-300 hover:bg-zinc-100 text-zinc-700 h-8 gap-1.5"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-amber-600" />
                    <span className="hidden sm:inline">Cargar Demo</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">Rellena automáticamente con datos empresariales de prueba</p>
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
            STEP 1: COMPANY DETAILS (DATOS DE LA EMPRESA / DEALERSHIP)
        ══════════════════════════════════════════════════════════════════ */}
        {currentStep === 1 && (
          <div className="space-y-6 max-w-[1200px] mx-auto">
            {/* Card: Información Jurídica y Comercial */}
            <Card className="border-zinc-200 bg-white shadow-sm">
              <CardHeader className="border-b border-zinc-100 pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-zinc-100 text-zinc-900">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-bold text-zinc-900">
                        1. Información Jurídica y Comercial de la Empresa
                      </CardTitle>
                      <CardDescription className="text-xs text-zinc-500">
                        Identificación fiscal y características de la entidad proveedora o concesionario
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant="outline" className="border-zinc-200 text-zinc-600 bg-zinc-50 text-xs">
                    Paso 1 de 3
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="pt-6 space-y-6">
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
                      className="border-zinc-200 focus-visible:ring-zinc-900 text-sm"
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
                      className="border-zinc-200 focus-visible:ring-zinc-900 text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="taxIdType" className="text-xs font-semibold text-zinc-700">
                      Tipo de Identificación Fiscal
                    </Label>
                    <Select
                      value={companyData.taxIdType}
                      onValueChange={(val) => setCompanyData({ ...companyData, taxIdType: val })}
                    >
                      <SelectTrigger id="taxIdType" className="border-zinc-200 text-sm">
                        <SelectValue placeholder="Selecciona tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NIT">NIT (Colombia)</SelectItem>
                        <SelectItem value="RFC">RFC (México)</SelectItem>
                        <SelectItem value="CIF/NIF">CIF / NIF (España)</SelectItem>
                        <SelectItem value="RUT">RUT (Chile / Uruguay)</SelectItem>
                        <SelectItem value="RUC">RUC (Perú / Ecuador)</SelectItem>
                        <SelectItem value="EIN">EIN / Tax ID (USA)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="taxId" className="text-xs font-semibold text-zinc-700">
                      Número de Identificación Fiscal <span className="text-rose-500">*</span>
                    </Label>
                    <Input
                      id="taxId"
                      placeholder="901.458.789-3"
                      value={companyData.taxId}
                      onChange={(e) => setCompanyData({ ...companyData, taxId: e.target.value })}
                      className="border-zinc-200 focus-visible:ring-zinc-900 text-sm font-mono"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="companyType" className="text-xs font-semibold text-zinc-700">
                      Tipo de Concesionario / Dealer
                    </Label>
                    <Select
                      value={companyData.companyType}
                      onValueChange={(val) => setCompanyData({ ...companyData, companyType: val })}
                    >
                      <SelectTrigger id="companyType" className="border-zinc-200 text-sm">
                        <SelectValue placeholder="Selecciona categoría" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Concesionario Oficial & Multimarca Premium">
                          Concesionario Oficial & Multimarca Premium
                        </SelectItem>
                        <SelectItem value="Dealer Autorizado de Marca Oficial">
                          Dealer Autorizado de Marca Oficial
                        </SelectItem>
                        <SelectItem value="Boutique de Seminuevos de Alta Gama">
                          Boutique de Seminuevos de Alta Gama
                        </SelectItem>
                        <SelectItem value="Importador Directo de Vehículos">
                          Importador Directo de Vehículos
                        </SelectItem>
                        <SelectItem value="Flotilla Corporativa / Renting">
                          Flotilla Corporativa / Renting
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="yearsInBusiness" className="text-xs font-semibold text-zinc-700">
                      Años en el Mercado Automotriz
                    </Label>
                    <Input
                      id="yearsInBusiness"
                      type="number"
                      placeholder="10"
                      value={companyData.yearsInBusiness}
                      onChange={(e) => setCompanyData({ ...companyData, yearsInBusiness: e.target.value })}
                      className="border-zinc-200 focus-visible:ring-zinc-900 text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="branchesCount" className="text-xs font-semibold text-zinc-700">
                      Número de Sedes / Vitrinas
                    </Label>
                    <Input
                      id="branchesCount"
                      type="number"
                      placeholder="2"
                      value={companyData.branchesCount}
                      onChange={(e) => setCompanyData({ ...companyData, branchesCount: e.target.value })}
                      className="border-zinc-200 focus-visible:ring-zinc-900 text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="website" className="text-xs font-semibold text-zinc-700">
                      Sitio Web / Enlace Corporativo
                    </Label>
                    <Input
                      id="website"
                      placeholder="https://..."
                      value={companyData.website}
                      onChange={(e) => setCompanyData({ ...companyData, website: e.target.value })}
                      className="border-zinc-200 focus-visible:ring-zinc-900 text-sm"
                    />
                  </div>
                </div>

                <Separator className="bg-zinc-100 my-4" />

                {/* Sede y Contacto */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  <div className="lg:col-span-2 space-y-2">
                    <Label htmlFor="address" className="text-xs font-semibold text-zinc-700">
                      Dirección Sede Principal <span className="text-rose-500">*</span>
                    </Label>
                    <Input
                      id="address"
                      placeholder="Calle o Avenida, Número, Sector"
                      value={companyData.address}
                      onChange={(e) => setCompanyData({ ...companyData, address: e.target.value })}
                      className="border-zinc-200 focus-visible:ring-zinc-900 text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-xs font-semibold text-zinc-700">
                      Ciudad <span className="text-rose-500">*</span>
                    </Label>
                    <Input
                      id="city"
                      placeholder="Medellín / Bogotá / CDMX"
                      value={companyData.city}
                      onChange={(e) => setCompanyData({ ...companyData, city: e.target.value })}
                      className="border-zinc-200 focus-visible:ring-zinc-900 text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="country" className="text-xs font-semibold text-zinc-700">
                      País
                    </Label>
                    <Input
                      id="country"
                      placeholder="Colombia"
                      value={companyData.country}
                      onChange={(e) => setCompanyData({ ...companyData, country: e.target.value })}
                      className="border-zinc-200 focus-visible:ring-zinc-900 text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-xs font-semibold text-zinc-700">
                      Teléfono / WhatsApp PBX Comercial <span className="text-rose-500">*</span>
                    </Label>
                    <Input
                      id="phone"
                      placeholder="+57 (604) 448-9000"
                      value={companyData.phone}
                      onChange={(e) => setCompanyData({ ...companyData, phone: e.target.value })}
                      className="border-zinc-200 focus-visible:ring-zinc-900 text-sm font-mono"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-xs font-semibold text-zinc-700">
                      Correo Electrónico Institucional <span className="text-rose-500">*</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="contacto@concesionario.com"
                      value={companyData.email}
                      onChange={(e) => setCompanyData({ ...companyData, email: e.target.value })}
                      className="border-zinc-200 focus-visible:ring-zinc-900 text-sm font-mono"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Card: Representante Legal y Apoderado */}
            <Card className="border-zinc-200 bg-white shadow-sm">
              <CardHeader className="border-b border-zinc-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-zinc-100 text-zinc-900">
                    <FileSignature className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-bold text-zinc-900">
                      2. Datos del Representante Legal o Apoderado Firmante
                    </CardTitle>
                    <CardDescription className="text-xs text-zinc-500">
                      Persona natural con facultad jurídica para celebrar contratos de intermediación y mandato
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="legalRepName" className="text-xs font-semibold text-zinc-700">
                      Nombre Completo del Representante <span className="text-rose-500">*</span>
                    </Label>
                    <Input
                      id="legalRepName"
                      placeholder="Ej. Mauricio Restrepo Saldarriaga"
                      value={companyData.legalRepName}
                      onChange={(e) => setCompanyData({ ...companyData, legalRepName: e.target.value })}
                      className="border-zinc-200 focus-visible:ring-zinc-900 text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="legalRepRole" className="text-xs font-semibold text-zinc-700">
                      Cargo / Calidad en que Actúa <span className="text-rose-500">*</span>
                    </Label>
                    <Input
                      id="legalRepRole"
                      placeholder="Ej. Representante Legal Principal / Gerente General"
                      value={companyData.legalRepRole}
                      onChange={(e) => setCompanyData({ ...companyData, legalRepRole: e.target.value })}
                      className="border-zinc-200 focus-visible:ring-zinc-900 text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="legalRepDocType" className="text-xs font-semibold text-zinc-700">
                      Tipo de Documento
                    </Label>
                    <Select
                      value={companyData.legalRepDocType}
                      onValueChange={(val) => setCompanyData({ ...companyData, legalRepDocType: val })}
                    >
                      <SelectTrigger id="legalRepDocType" className="border-zinc-200 text-sm">
                        <SelectValue placeholder="Selecciona tipo de documento" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Cédula de Ciudadanía">Cédula de Ciudadanía (C.C.)</SelectItem>
                        <SelectItem value="Cédula de Extranjería">Cédula de Extranjería (C.E.)</SelectItem>
                        <SelectItem value="Pasaporte">Pasaporte Internacional</SelectItem>
                        <SelectItem value="DNI">DNI (Documento Nacional)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="legalRepDocId" className="text-xs font-semibold text-zinc-700">
                      Número de Documento <span className="text-rose-500">*</span>
                    </Label>
                    <Input
                      id="legalRepDocId"
                      placeholder="71.298.441"
                      value={companyData.legalRepDocId}
                      onChange={(e) => setCompanyData({ ...companyData, legalRepDocId: e.target.value })}
                      className="border-zinc-200 focus-visible:ring-zinc-900 text-sm font-mono"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="legalRepPhone" className="text-xs font-semibold text-zinc-700">
                      Teléfono Directo del Firmante
                    </Label>
                    <Input
                      id="legalRepPhone"
                      placeholder="+57 310 889 4521"
                      value={companyData.legalRepPhone}
                      onChange={(e) => setCompanyData({ ...companyData, legalRepPhone: e.target.value })}
                      className="border-zinc-200 focus-visible:ring-zinc-900 text-sm font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="legalRepEmail" className="text-xs font-semibold text-zinc-700">
                      Correo Electrónico para Notificaciones Judiciales y Contrato <span className="text-rose-500">*</span>
                    </Label>
                    <Input
                      id="legalRepEmail"
                      type="email"
                      placeholder="representante@concesionario.com"
                      value={companyData.legalRepEmail}
                      onChange={(e) => setCompanyData({ ...companyData, legalRepEmail: e.target.value })}
                      className="border-zinc-200 focus-visible:ring-zinc-900 text-sm font-mono"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-zinc-700">
                      Cuenta Bancaria para Liquidaciones de Ventas
                    </Label>
                    <div className="grid grid-cols-3 gap-2">
                      <Input
                        placeholder="Banco"
                        value={companyData.bankName}
                        onChange={(e) => setCompanyData({ ...companyData, bankName: e.target.value })}
                        className="border-zinc-200 text-xs"
                      />
                      <Input
                        placeholder="Tipo (Cte/Aho)"
                        value={companyData.bankAccountType}
                        onChange={(e) => setCompanyData({ ...companyData, bankAccountType: e.target.value })}
                        className="border-zinc-200 text-xs"
                      />
                      <Input
                        placeholder="# Cuenta"
                        value={companyData.bankAccountNumber}
                        onChange={(e) => setCompanyData({ ...companyData, bankAccountNumber: e.target.value })}
                        className="border-zinc-200 text-xs font-mono"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Step 1 Actions */}
            <div className="flex items-center justify-between pt-4">
              <div className="text-xs text-zinc-500 flex items-center gap-1.5">
                <Info className="h-4 w-4 text-zinc-400" />
                <span>Sus datos están protegidos bajo protocolos de confidencialidad comercial.</span>
              </div>
              <Button
                type="button"
                onClick={() => {
                  if (validateStep1()) {
                    setCurrentStep(2);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }
                }}
                className="bg-zinc-900 hover:bg-zinc-800 text-white font-medium px-6 gap-2 shadow-sm"
              >
                <span>Continuar a Carga de Vehículos</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            STEP 2: VEHICLE INVENTORY DETAILS (CARGA DE VEHÍCULOS / LOTE)
        ══════════════════════════════════════════════════════════════════ */}
        {currentStep === 2 && (
          <div className="space-y-6 max-w-[1200px] mx-auto">
            {/* Top Summary Banner of Current Batch */}
            <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-zinc-900 text-white">
                  <Car className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-zinc-900">
                      Inventario Asignado al Contrato de Corretaje
                    </h2>
                    <Badge variant="secondary" className="bg-zinc-100 text-zinc-800 font-mono text-xs">
                      {vehicles.length} {vehicles.length === 1 ? "vehículo" : "vehículos"}
                    </Badge>
                  </div>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Valoración total estimada: <span className="font-semibold text-zinc-900">${totalValuation.toLocaleString()} USD</span> · Comisión Corretaje Est.: <span className="font-semibold text-emerald-700">${estimatedTotalBrokerage.toLocaleString()} USD</span>
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
                className="border-zinc-300 hover:bg-zinc-100 text-zinc-700 text-xs h-9 gap-1.5 shrink-0"
              >
                <Plus className="h-4 w-4" />
                <span>Agregar Otra Unidad</span>
              </Button>
            </div>

            {/* List of Already Added Vehicles */}
            {vehicles.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                    Vehículos Registrados en este Lote ({vehicles.length})
                  </Label>
                  <span className="text-xs text-zinc-500">Listos para inclusión en contrato marco</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {vehicles.map((veh, index) => (
                    <Card key={veh.id} className="border-zinc-200 bg-white shadow-sm hover:border-zinc-300 transition-all overflow-hidden">
                      <div className="flex flex-col sm:flex-row h-full">
                        {/* Thumbnail / Image Preview */}
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
                              #{index + 1} · {veh.year}
                            </Badge>
                          </div>
                          <div className="absolute bottom-2 right-2">
                            <Badge variant="secondary" className="bg-white/90 text-zinc-800 text-[10px] backdrop-blur font-medium">
                              {veh.images.length} fotos
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
                                <p className="text-xs text-zinc-500">{veh.trim || veh.bodyType}</p>
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
                              <div className="flex items-center gap-1">
                                <Gauge className="h-3 w-3 text-zinc-400" />
                                <span>{veh.mileage.toLocaleString()} km</span>
                              </div>
                              <div className="flex items-center gap-1 font-mono">
                                <Hash className="h-3 w-3 text-zinc-400" />
                                <span>{veh.licensePlate || "Sin placa"}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Fuel className="h-3 w-3 text-zinc-400" />
                                <span className="truncate">{veh.fuelType.split(" ")[0]}</span>
                              </div>
                              <div className="flex items-center gap-1 font-mono text-[10px] text-zinc-500">
                                <span>VIN: ...{veh.vin ? veh.vin.slice(-6) : "N/A"}</span>
                              </div>
                            </div>
                          </div>

                          <div className="pt-3 mt-2 border-t border-zinc-100 flex items-center justify-between">
                            <div>
                              <p className="text-[10px] text-zinc-500">Precio Sugerido</p>
                              <p className="text-sm font-extrabold text-zinc-900">
                                ${veh.suggestedPrice.toLocaleString()} USD
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-[10px] text-zinc-500">Comisión Corretaje</p>
                              <Badge variant="outline" className="text-xs border-emerald-300 text-emerald-800 bg-emerald-50 font-semibold">
                                {veh.brokerageFeeType === "percentage"
                                  ? `${veh.brokerageFeeValue}% ($${((veh.suggestedPrice * veh.brokerageFeeValue) / 100).toLocaleString()})`
                                  : `$${veh.brokerageFeeValue.toLocaleString()}`}
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

            {/* Vehicle Creation Form Section */}
            <div id="vehicle-form-section">
              <Card className="border-zinc-200 bg-white shadow-sm">
                <CardHeader className="border-b border-zinc-100 pb-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-zinc-100 text-zinc-900">
                        <Plus className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-lg font-bold text-zinc-900">
                          Formulario de Carga de Vehículo Individual
                        </CardTitle>
                        <CardDescription className="text-xs text-zinc-500">
                          Complete la ficha técnica, condiciones comerciales y adjunte las fotografías
                        </CardDescription>
                      </div>
                    </div>

                    {/* Mode Tabs */}
                    <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-lg border border-zinc-200">
                      <button
                        type="button"
                        onClick={() => setActiveVehicleTab("individual")}
                        className={`text-xs px-3 py-1 rounded-md font-medium transition-colors ${
                          activeVehicleTab === "individual"
                            ? "bg-white text-zinc-900 shadow-sm"
                            : "text-zinc-600 hover:text-zinc-900"
                        }`}
                      >
                        Ingreso Manual
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveVehicleTab("bulk")}
                        className={`text-xs px-3 py-1 rounded-md font-medium transition-colors flex items-center gap-1 ${
                          activeVehicleTab === "bulk"
                            ? "bg-white text-zinc-900 shadow-sm"
                            : "text-zinc-600 hover:text-zinc-900"
                        }`}
                      >
                        <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />
                        <span>Carga Excel / CSV</span>
                      </button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-6 space-y-6">
                  {activeVehicleTab === "bulk" ? (
                    /* Bulk upload tab */
                    <div className="border-2 border-dashed border-zinc-300 rounded-xl p-8 text-center bg-zinc-50/50 space-y-4">
                      <div className="mx-auto h-12 w-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200">
                        <FileSpreadsheet className="h-6 w-6" />
                      </div>
                      <div className="max-w-md mx-auto">
                        <h4 className="text-sm font-bold text-zinc-900">Carga Masiva de Flotilla o Inventario Dealer</h4>
                        <p className="text-xs text-zinc-500 mt-1">
                          Arrastre su archivo Excel (.xlsx) o CSV con las columnas estándar de marca, modelo, VIN, kilometraje y precio.
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs gap-1.5 border-zinc-300"
                          onClick={() => toast.info("Descargando plantilla de inventario Excel...")}
                        >
                          <Download className="h-3.5 w-3.5" />
                          <span>Descargar Plantilla .XLSX</span>
                        </Button>
                        <Button
                          size="sm"
                          className="bg-zinc-900 hover:bg-zinc-800 text-white text-xs gap-1.5"
                          onClick={() => {
                            toast.success("Archivo demo procesado: 3 vehículos cargados al inventario");
                            handleAddVehicleToList();
                            setActiveVehicleTab("individual");
                          }}
                        >
                          <Upload className="h-3.5 w-3.5" />
                          <span>Subir y Procesar Archivo</span>
                        </Button>
                      </div>
                    </div>
                  ) : (
                    /* Individual Form */
                    <>
                      {/* Brand, Model, Year, Trim */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="vBrand" className="text-xs font-semibold text-zinc-700">
                            Marca <span className="text-rose-500">*</span>
                          </Label>
                          <Select
                            value={currentVehicle.brand}
                            onValueChange={(val) => setCurrentVehicle({ ...currentVehicle, brand: val })}
                          >
                            <SelectTrigger id="vBrand" className="border-zinc-200 text-sm">
                              <SelectValue placeholder="Selecciona marca" />
                            </SelectTrigger>
                            <SelectContent className="max-h-60">
                              {POPULAR_BRANDS.map((b) => (
                                <SelectItem key={b} value={b}>
                                  {b}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="vModel" className="text-xs font-semibold text-zinc-700">
                            Modelo <span className="text-rose-500">*</span>
                          </Label>
                          <Input
                            id="vModel"
                            placeholder="Ej. M3 Competition / Cayenne"
                            value={currentVehicle.model}
                            onChange={(e) => setCurrentVehicle({ ...currentVehicle, model: e.target.value })}
                            className="border-zinc-200 focus-visible:ring-zinc-900 text-sm"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="vYear" className="text-xs font-semibold text-zinc-700">
                            Año Modelo <span className="text-rose-500">*</span>
                          </Label>
                          <Select
                            value={currentVehicle.year.toString()}
                            onValueChange={(val) => setCurrentVehicle({ ...currentVehicle, year: parseInt(val) })}
                          >
                            <SelectTrigger id="vYear" className="border-zinc-200 text-sm">
                              <SelectValue placeholder="Año" />
                            </SelectTrigger>
                            <SelectContent className="max-h-60">
                              {[2026, 2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015].map((y) => (
                                <SelectItem key={y} value={y.toString()}>
                                  {y}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="vTrim" className="text-xs font-semibold text-zinc-700">
                            Versión / Línea / Trim
                          </Label>
                          <Input
                            id="vTrim"
                            placeholder="Ej. GTS / M Sport / AMG Line"
                            value={currentVehicle.trim}
                            onChange={(e) => setCurrentVehicle({ ...currentVehicle, trim: e.target.value })}
                            className="border-zinc-200 focus-visible:ring-zinc-900 text-sm"
                          />
                        </div>
                      </div>

                      {/* Technical Specs: Body, Mileage, Transmission, Fuel */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="vBodyType" className="text-xs font-semibold text-zinc-700">
                            Carrocería
                          </Label>
                          <Select
                            value={currentVehicle.bodyType}
                            onValueChange={(val) => setCurrentVehicle({ ...currentVehicle, bodyType: val })}
                          >
                            <SelectTrigger id="vBodyType" className="border-zinc-200 text-sm">
                              <SelectValue placeholder="Tipo" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="SUV / Crossover">SUV / Crossover</SelectItem>
                              <SelectItem value="Sedán Deportivo">Sedán Deportivo</SelectItem>
                              <SelectItem value="Coupé">Coupé</SelectItem>
                              <SelectItem value="Cabriolet / Convertible">Cabriolet / Convertible</SelectItem>
                              <SelectItem value="Hatchback">Hatchback</SelectItem>
                              <SelectItem value="Pick-up 4x4">Pick-up 4x4</SelectItem>
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
                            placeholder="12500"
                            value={currentVehicle.mileage}
                            onChange={(e) => setCurrentVehicle({ ...currentVehicle, mileage: parseInt(e.target.value) || 0 })}
                            className="border-zinc-200 focus-visible:ring-zinc-900 text-sm font-mono"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="vTransmission" className="text-xs font-semibold text-zinc-700">
                            Transmisión
                          </Label>
                          <Select
                            value={currentVehicle.transmission}
                            onValueChange={(val) => setCurrentVehicle({ ...currentVehicle, transmission: val })}
                          >
                            <SelectTrigger id="vTransmission" className="border-zinc-200 text-sm">
                              <SelectValue placeholder="Transmisión" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Automática Secuencial">Automática Secuencial</SelectItem>
                              <SelectItem value="Automática PDK 7 Vel.">Doble Embrague (PDK / DSG / DCT)</SelectItem>
                              <SelectItem value="M Steptronic 8 Vel. Drivelogic">Automática 8 Vel. Deportiva</SelectItem>
                              <SelectItem value="Manual 6 Velocidades">Manual 6 Velocidades</SelectItem>
                              <SelectItem value="Direct Drive EV">Transmisión Directa Eléctrica</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="vFuelType" className="text-xs font-semibold text-zinc-700">
                            Motorización & Combustible
                          </Label>
                          <Select
                            value={currentVehicle.fuelType}
                            onValueChange={(val) => setCurrentVehicle({ ...currentVehicle, fuelType: val })}
                          >
                            <SelectTrigger id="vFuelType" className="border-zinc-200 text-sm">
                              <SelectValue placeholder="Combustible" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Gasolina Extra (V6 2.9L Biturbo)">Gasolina Turbo</SelectItem>
                              <SelectItem value="Mild Hybrid Gasolina (3.0L Turbo)">Híbrido Ligero (MHEV)</SelectItem>
                              <SelectItem value="Híbrido Enchufable (PHEV)">Híbrido Enchufable (PHEV)</SelectItem>
                              <SelectItem value="100% Eléctrico (BEV)">100% Eléctrico (BEV)</SelectItem>
                              <SelectItem value="Diésel Turbo">Diésel Turbo</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* VIN, License Plate, Condition, Colors */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="vVin" className="text-xs font-semibold text-zinc-700">
                            Número de Chasis / VIN (17 Dígitos) <span className="text-rose-500">*</span>
                          </Label>
                          <Input
                            id="vVin"
                            placeholder="WP1ZZZ95ZPLB84920"
                            value={currentVehicle.vin}
                            onChange={(e) => setCurrentVehicle({ ...currentVehicle, vin: e.target.value.toUpperCase() })}
                            className="border-zinc-200 focus-visible:ring-zinc-900 text-sm font-mono uppercase"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="vPlate" className="text-xs font-semibold text-zinc-700">
                            Placa / Matrícula
                          </Label>
                          <Input
                            id="vPlate"
                            placeholder="KLU-890"
                            value={currentVehicle.licensePlate}
                            onChange={(e) => setCurrentVehicle({ ...currentVehicle, licensePlate: e.target.value.toUpperCase() })}
                            className="border-zinc-200 focus-visible:ring-zinc-900 text-sm font-mono uppercase"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="vCondition" className="text-xs font-semibold text-zinc-700">
                            Estado del Vehículo
                          </Label>
                          <Select
                            value={currentVehicle.condition}
                            onValueChange={(val: any) => setCurrentVehicle({ ...currentVehicle, condition: val })}
                          >
                            <SelectTrigger id="vCondition" className="border-zinc-200 text-sm">
                              <SelectValue placeholder="Estado" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Nuevo (0km)">Nuevo (0km)</SelectItem>
                              <SelectItem value="Seminuevo Certificado">Seminuevo Certificado</SelectItem>
                              <SelectItem value="Usado Seleccionado">Usado Seleccionado</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="vExtColor" className="text-xs font-semibold text-zinc-700">
                            Color Exterior & Interior
                          </Label>
                          <div className="grid grid-cols-2 gap-1.5">
                            <Input
                              placeholder="Ext. (Gris Tiza)"
                              value={currentVehicle.exteriorColor}
                              onChange={(e) => setCurrentVehicle({ ...currentVehicle, exteriorColor: e.target.value })}
                              className="border-zinc-200 text-xs"
                            />
                            <Input
                              placeholder="Int. (Cuero Negro)"
                              value={currentVehicle.interiorColor}
                              onChange={(e) => setCurrentVehicle({ ...currentVehicle, interiorColor: e.target.value })}
                              className="border-zinc-200 text-xs"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Pricing & Commercial Brokerage Terms */}
                      <div className="bg-zinc-50 border border-zinc-200/80 rounded-xl p-5 space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-emerald-700" />
                            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900">
                              Condiciones Comerciales de Corretaje para este Vehículo
                            </h4>
                          </div>
                          <Badge variant="outline" className="bg-white border-zinc-200 text-[11px] text-zinc-600">
                            Cálculo en Tiempo Real
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                          <div className="space-y-1.5">
                            <Label htmlFor="vPrice" className="text-xs font-semibold text-zinc-700">
                              Precio de Venta al Público (PVP en USD) <span className="text-rose-500">*</span>
                            </Label>
                            <div className="relative">
                              <span className="absolute left-3 top-2.5 text-zinc-400 text-sm font-semibold">$</span>
                              <Input
                                id="vPrice"
                                type="number"
                                placeholder="95000"
                                value={currentVehicle.suggestedPrice}
                                onChange={(e) => setCurrentVehicle({ ...currentVehicle, suggestedPrice: parseFloat(e.target.value) || 0 })}
                                className="pl-7 border-zinc-200 focus-visible:ring-zinc-900 text-sm font-mono font-bold"
                              />
                            </div>
                            <p className="text-[11px] text-zinc-500">Precio publicado en vitrina digital</p>
                          </div>

                          <div className="space-y-1.5">
                            <Label htmlFor="vFee" className="text-xs font-semibold text-zinc-700">
                              Comisión de Corretaje Acordada
                            </Label>
                            <div className="flex gap-2">
                              <Select
                                value={currentVehicle.brokerageFeeType}
                                onValueChange={(val: any) => setCurrentVehicle({ ...currentVehicle, brokerageFeeType: val })}
                              >
                                <SelectTrigger className="w-24 border-zinc-200 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="percentage">% Porc.</SelectItem>
                                  <SelectItem value="fixed">Fijo ($)</SelectItem>
                                </SelectContent>
                              </Select>
                              <Input
                                id="vFee"
                                type="number"
                                step="0.1"
                                placeholder="3.5"
                                value={currentVehicle.brokerageFeeValue}
                                onChange={(e) => setCurrentVehicle({ ...currentVehicle, brokerageFeeValue: parseFloat(e.target.value) || 0 })}
                                className="border-zinc-200 focus-visible:ring-zinc-900 text-sm font-mono"
                              />
                            </div>
                            <p className="text-[11px] text-zinc-500">
                              Honorario del corredor por cierre de venta
                            </p>
                          </div>

                          {/* Calculated Net Payout */}
                          <div className="space-y-1.5 bg-white p-3 rounded-lg border border-zinc-200">
                            <p className="text-xs font-semibold text-zinc-700">Liquidación Neta para el Proveedor</p>
                            <p className="text-lg font-extrabold text-emerald-800">
                              ${(
                                currentVehicle.suggestedPrice -
                                (currentVehicle.brokerageFeeType === "percentage"
                                  ? (currentVehicle.suggestedPrice * currentVehicle.brokerageFeeValue) / 100
                                  : currentVehicle.brokerageFeeValue)
                              ).toLocaleString()}{" "}
                              <span className="text-xs font-normal text-zinc-500">USD</span>
                            </p>
                            <p className="text-[10px] text-zinc-400">Desembolso tras cierre de venta e inspección</p>
                          </div>
                        </div>
                      </div>

                      {/* Highlighted Features / Extras */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs font-semibold text-zinc-700">
                            Equipamiento Destacado y Extras (Haga clic para activar)
                          </Label>
                          <span className="text-xs text-zinc-500 font-mono">
                            {currentVehicle.features.length} seleccionados
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {AVAILABLE_FEATURES.map((feat) => {
                            const isSelected = currentVehicle.features.includes(feat);
                            return (
                              <button
                                key={feat}
                                type="button"
                                onClick={() => toggleFeatureInCurrentVehicle(feat)}
                                className={`text-xs px-3 py-1.5 rounded-lg border transition-all text-left flex items-center gap-1.5 ${
                                  isSelected
                                    ? "bg-zinc-900 text-white border-zinc-900 shadow-sm"
                                    : "bg-zinc-50 border-zinc-200 text-zinc-700 hover:bg-zinc-100 hover:border-zinc-300"
                                }`}
                              >
                                {isSelected && <Check className="h-3 w-3 text-white" />}
                                <span>{feat}</span>
                              </button>
                            );
                          })}
                        </div>

                        {/* Custom Feature Add */}
                        <div className="flex gap-2 max-w-md pt-1">
                          <Input
                            placeholder="Agregar otro equipamiento personalizado..."
                            value={customFeatureInput}
                            onChange={(e) => setCustomFeatureInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                handleAddCustomFeature();
                              }
                            }}
                            className="text-xs border-zinc-200 h-8"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleAddCustomFeature}
                            className="text-xs border-zinc-300 h-8"
                          >
                            Añadir
                          </Button>
                        </div>
                      </div>

                      {/* Photo Upload Section */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs font-semibold text-zinc-700">
                            Galería Fotográfica del Vehículo ({currentVehicle.images.length} fotos)
                          </Label>
                          <span className="text-xs text-zinc-500">Mínimo 2 fotos recomendadas (Frontal, Interior)</span>
                        </div>

                        {/* Image dropzone simulation */}
                        <div className="border border-dashed border-zinc-300 rounded-xl p-5 bg-zinc-50/60 flex flex-col sm:flex-row items-center justify-between gap-4">
                          <div className="flex items-center gap-3 text-left">
                            <div className="p-3 rounded-xl bg-white border border-zinc-200 text-zinc-700 shadow-sm">
                              <Upload className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-zinc-800">
                                Carga de Fotografías en Alta Resolución (JPG, PNG, WebP)
                              </p>
                              <p className="text-[11px] text-zinc-500">
                                Las fotos serán procesadas con sello de agua y optimizadas para el marketplace
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 w-full sm:w-auto">
                            <Select
                              value={selectedImageTag}
                              onValueChange={(val) => setSelectedImageTag(val)}
                            >
                              <SelectTrigger className="w-36 border-zinc-200 text-xs h-8 bg-white">
                                <SelectValue placeholder="Etiqueta" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Frontal Principal">Frontal</SelectItem>
                                <SelectItem value="Cabina / Interior">Interior</SelectItem>
                                <SelectItem value="Vista Trasera">Trasera</SelectItem>
                                <SelectItem value="Motor y Chasis">Motor</SelectItem>
                                <SelectItem value="Rines y Llantas">Rines</SelectItem>
                              </SelectContent>
                            </Select>

                            <Button
                              type="button"
                              size="sm"
                              onClick={handleSimulateAddImage}
                              className="bg-zinc-900 hover:bg-zinc-800 text-white text-xs h-8 gap-1.5 whitespace-nowrap"
                            >
                              <Plus className="h-3.5 w-3.5" />
                              <span>Agregar Foto Demo</span>
                            </Button>
                          </div>
                        </div>

                        {/* Display uploaded images */}
                        {currentVehicle.images.length > 0 && (
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                            {currentVehicle.images.map((img, idx) => (
                              <div
                                key={img.id}
                                className="relative rounded-lg overflow-hidden border border-zinc-200 group bg-zinc-100 aspect-[4/3]"
                              >
                                <img
                                  src={img.url}
                                  alt={img.name}
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                  <Button
                                    type="button"
                                    variant="destructive"
                                    size="sm"
                                    className="h-7 w-7 p-0"
                                    onClick={() => {
                                      setCurrentVehicle((prev) => ({
                                        ...prev,
                                        images: prev.images.filter((i) => i.id !== img.id),
                                      }));
                                    }}
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                                <div className="absolute bottom-1 left-1">
                                  <Badge className="text-[9px] bg-zinc-900/80 text-white backdrop-blur">
                                    {img.tag}
                                  </Badge>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Observations / Description */}
                      <div className="space-y-2">
                        <Label htmlFor="vDesc" className="text-xs font-semibold text-zinc-700">
                          Descripción Comercial & Observaciones del Peritaje
                        </Label>
                        <Textarea
                          id="vDesc"
                          rows={3}
                          placeholder="Mencione el estado estético, garantías vigentes, mantenimientos recientes o accesorios incluidos..."
                          value={currentVehicle.description}
                          onChange={(e) => setCurrentVehicle({ ...currentVehicle, description: e.target.value })}
                          className="border-zinc-200 focus-visible:ring-zinc-900 text-sm"
                        />
                      </div>

                      {/* Add current vehicle button */}
                      <div className="pt-2 flex justify-end">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleAddVehicleToList}
                          className="border-zinc-900 text-zinc-900 hover:bg-zinc-900 hover:text-white text-xs font-bold gap-2"
                        >
                          <Plus className="h-4 w-4" />
                          <span>Guardar y Agregar Esta Unidad al Lote</span>
                        </Button>
                      </div>
                    </>
                  )}
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
                JY TRINOVA S.A.S. · CONTRATO DE INTERMEDIACIÓN & CORRETAJE MERCANTIL
              </h2>
              <p className="text-xs text-zinc-500 font-mono mt-1">ID: {contractSignature.contractId}</p>
            </div>

            <p>
              En la ciudad de {companyData.city}, a los {new Date().getDate()} días del mes de{" "}
              {new Date().toLocaleString("es-ES", { month: "long" })} de {new Date().getFullYear()}, se suscribe
              el presente contrato entre <strong>JY TRINOVA S.A.S.</strong> (El Corredor Intermediario) y{" "}
              <strong>{companyData.legalName.toUpperCase()}</strong> ({companyData.taxIdType} No. {companyData.taxId}),
              representada legalmente por <strong>{companyData.legalRepName}</strong> ({companyData.legalRepDocType} No. {companyData.legalRepDocId}).
            </p>

            <div className="border border-zinc-200 p-4 rounded bg-zinc-50 font-sans text-xs space-y-2">
              <p className="font-bold text-zinc-900">INVENTARIO ASIGNADO:</p>
              {vehicles.map((v, idx) => (
                <div key={v.id} className="flex justify-between border-b border-zinc-200 pb-1">
                  <span>
                    #{idx + 1}: {v.brand} {v.model} {v.year} (VIN: {v.vin})
                  </span>
                  <span className="font-bold font-mono">${v.suggestedPrice.toLocaleString()} USD</span>
                </div>
              ))}
            </div>

            <p>
              Las partes manifiestan haber leído, consentido y aceptado en su totalidad las estipulaciones contractuales relativas a honorarios, garantías de procedencia, liquidación de fondos y protección de datos.
            </p>

            {/* Signature Box */}
            <div className="pt-8 border-t border-zinc-300 grid grid-cols-2 gap-8 font-sans">
              <div className="space-y-2">
                <p className="text-[11px] font-bold uppercase text-zinc-500">Por la Plataforma Corredora:</p>
                <div className="h-16 flex items-end">
                  <span className="font-heading italic text-lg text-zinc-800">AutoBroker Digital Signature Seal</span>
                </div>
                <div className="border-t border-zinc-400 pt-1 text-[11px] text-zinc-600">
                  <p className="font-bold">Director Legal & Operaciones</p>
                  <p>AutoBroker Core Technologies S.A.S.</p>
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

