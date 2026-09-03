"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  MOCK_REAL_ESTATE_PROPERTIES,
  getStoredProperties,
  REAL_ESTATE_REGIONS,
  PROPERTY_TYPES,
  OPERATION_TYPES,
  Property,
  RealEstateAgencyInfo,
  DEFAULT_AGENCY,
} from "@/lib/marketplace-mocks";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
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
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Building2,
  Home,
  Bed,
  Bath,
  Maximize2,
  MapPin,
  MessageCircle,
  ShieldCheck,
  Award,
  Search,
  SlidersHorizontal,
  Heart,
  Share2,
  ChevronLeft,
  ChevronRight,
  Check,
  Star,
  DollarSign,
  Calculator,
  Clock,
  Key,
  CheckCircle2,
  RotateCcw,
  X,
  Grid,
  List,
  Zap,
  ArrowRight,
  Filter,
  Car,
  Layers,
  Compass,
  FileText,
} from "lucide-react";
import { toast } from "sonner";

interface RealEstateMarketplaceProps {
  agency?: RealEstateAgencyInfo;
}

export function RealEstateMarketplace({ agency = DEFAULT_AGENCY }: RealEstateMarketplaceProps) {
  // Dynamic Real Estate Properties State (Synchronized with Supabase Cloud Realtime)
  const [propertiesList, setPropertiesList] = useState<Property[]>([]);

  useEffect(() => {
    const loadLiveProperties = async () => {
      try {
        const res = await fetch("/api/trinova/dashboard", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (data.inventory && data.inventory.length > 0) {
            const realEstateItems = data.inventory.filter(
              (item: any) => item.category_type === "INMUEBLE_VENTA" || item.category_type === "INMUEBLE_RENTA"
            );

            if (realEstateItems.length > 0) {
              const mappedProps: Property[] = realEstateItems.map((item: any, idx: number) => {
                const priceCop = Number(item.price_cop || item.price || 850000000);
                const isRent = item.category_type === "INMUEBLE_RENTA";

                return {
                  id: item.id,
                  code: item.sku || `TRN-PROP-00${idx + 1}`,
                  title: item.name || item.title || "Penthouse Dúplex Alto Prado 240m²",
                  propertyType: "Penthouse" as any,
                  operationType: isRent ? "Arriendo" : "Venta",
                  priceCop: priceCop,
                  region: "Barranquilla (Atlántico)",
                  city: item.city || "Barranquilla",
                  neighborhood: item.neighborhood || "Alto Prado",
                  addressBrief: "Calle 82 # 21 Sur 06, Barranquilla",
                  images: item.images && item.images.length > 0 ? item.images : ["https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1200"],
                  description: item.description || "Exclusivo inmueble verificado y respaldado por YJD TRINOVA S.A.S.",
                  amenities: ["Vista Panorámica", "Piscina Privada", "Seguridad 24/7", "Acabados de Lujo"],
                  featured: true,
                  specs: {
                    areaM2: item.area_m2 || 240,
                    bedrooms: item.bedrooms || 3,
                    bathrooms: item.bathrooms || 4,
                    parkingSpots: item.parking_spots || 2,
                    stratum: item.stratum || 6,
                    builtYear: item.year || 2024,
                  },
                  agency: {
                    name: "YJD TRINOVA S.A.S.",
                    phone: "+57 (605) 322-5918",
                    whatsappPhone: "573235845145",
                    rating: 4.9,
                    verified: true,
                    address: "Barranquilla, Atlántico",
                    city: "Barranquilla"
                  }
                };
              });

              setPropertiesList(mappedProps);
              return;
            }
          }
        }
      } catch (e) {
        console.warn("Error fetching live real estate properties:", e);
      }
      setPropertiesList(getStoredProperties());
    };

    loadLiveProperties();
  }, []);

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("Todas las Regiones");
  const [selectedPropertyType, setSelectedPropertyType] = useState("Todos");
  const [selectedOperation, setSelectedOperation] = useState("Todos");
  const [priceRangeMillions, setPriceRangeMillions] = useState<[number, number]>([500, 6000]); // 500M to 6.000M COP
  const [minBedrooms, setMinBedrooms] = useState<number>(0);
  const [minAreaM2, setMinAreaM2] = useState<number>(0);
  const [sortBy, setSortBy] = useState<"featured" | "price_asc" | "price_desc" | "area_desc">("featured");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Interaction states
  const [favorites, setFavorites] = useState<string[]>([]);
  const [selectedPropertyForModal, setSelectedPropertyForModal] = useState<Property | null>(null);
  const [activeImageIndexMap, setActiveImageIndexMap] = useState<Record<string, number>>({});
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Mortgage Calculator inside Modal
  const [downPaymentPercent, setDownPaymentPercent] = useState<number>(30);
  const [loanTermYears, setLoanTermYears] = useState<number>(15);

  // Toggle favorite
  const toggleFavorite = (propertyId: string) => {
    setFavorites((prev) => {
      const isFav = prev.includes(propertyId);
      if (isFav) {
        toast.info("Propiedad eliminada de favoritos");
        return prev.filter((id) => id !== propertyId);
      } else {
        toast.success("Propiedad guardada en tus favoritos");
        return [...prev, propertyId];
      }
    });
  };

  // Image slider navigation per card
  const handlePrevImage = (e: React.MouseEvent, prop: Property) => {
    e.stopPropagation();
    const currentIndex = activeImageIndexMap[prop.id] || 0;
    const prevIndex = (currentIndex - 1 + prop.images.length) % prop.images.length;
    setActiveImageIndexMap((prev) => ({ ...prev, [prop.id]: prevIndex }));
  };

  const handleNextImage = (e: React.MouseEvent, prop: Property) => {
    e.stopPropagation();
    const currentIndex = activeImageIndexMap[prop.id] || 0;
    const nextIndex = (currentIndex + 1) % prop.images.length;
    setActiveImageIndexMap((prev) => ({ ...prev, [prop.id]: nextIndex }));
  };

  // Format currency helpers for Colombian Pesos
  const formatCop = (amountCop: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
    }).format(amountCop);
  };

  const formatMillionsShort = (amountCop: number) => {
    const millions = amountCop / 1000000;
    if (millions >= 1000) {
      return `$${(millions / 1000).toFixed(2)} Mil Millones`;
    }
    return `$${millions.toLocaleString("es-CO")}M`;
  };

  // Generate WhatsApp Inquiry Link for a Property
  const buildWhatsAppPropertyLink = (prop: Property) => {
    const phoneNumber = prop.agency?.whatsappPhone || agency.whatsappPhone;
    const message = `¡Hola! 👋 Vengo desde el portal inmobiliario de *${agency.name}*.
Estoy interesado en la siguiente propiedad:
🏢 *${prop.title}*
🔢 Código: *${prop.code}*
💰 Precio: ${formatCop(prop.priceCop)}
📍 Ubicación: ${prop.neighborhood}, ${prop.city}
📐 Área: ${prop.specs.areaM2} m² | ${prop.specs.bedrooms} Habitaciones | ${prop.specs.bathrooms} Baños

¿Podrían enviarme la ficha técnica completa en PDF y coordinar una visita / llamada con el asesor comercial? ¡Muchas gracias!`;

    return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
  };

  // Reset all filters
  const resetFilters = () => {
    setSearchQuery("");
    setSelectedRegion("Todas las Regiones");
    setSelectedPropertyType("Todos");
    setSelectedOperation("Todos");
    setPriceRangeMillions([500, 6000]);
    setMinBedrooms(0);
    setMinAreaM2(0);
    setSortBy("featured");
  };

  // Quick Preset Filters
  const applyQuickFilter = (type: "penthouse" | "medellin" | "beach" | "campestre" | "under2b") => {
    resetFilters();
    if (type === "penthouse") setSelectedPropertyType("Penthouse");
    if (type === "medellin") setSelectedRegion("Medellín (Antioquia)");
    if (type === "beach") setSelectedRegion("Cartagena (Bolívar)");
    if (type === "campestre") setSelectedPropertyType("Casa Campestre");
    if (type === "under2b") setPriceRangeMillions([500, 2000]);
  };

  // Active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (searchQuery.trim() !== "") count++;
    if (selectedRegion !== "Todas las Regiones") count++;
    if (selectedPropertyType !== "Todos") count++;
    if (selectedOperation !== "Todos") count++;
    if (priceRangeMillions[0] > 500 || priceRangeMillions[1] < 6000) count++;
    if (minBedrooms > 0) count++;
    if (minAreaM2 > 0) count++;
    return count;
  }, [
    searchQuery,
    selectedRegion,
    selectedPropertyType,
    selectedOperation,
    priceRangeMillions,
    minBedrooms,
    minAreaM2,
  ]);

  // Filtered & Sorted Properties
  const filteredProperties = useMemo(() => {
    const list = propertiesList.filter((prop) => {
      // Search query (title, neighborhood, city, code, description)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const fullText = `${prop.title} ${prop.neighborhood} ${prop.city} ${prop.code} ${prop.propertyType} ${prop.description}`.toLowerCase();
        if (!fullText.includes(q)) return false;
      }

      // Region
      if (selectedRegion !== "Todas las Regiones" && prop.region !== selectedRegion) {
        return false;
      }

      // Property Type
      if (selectedPropertyType !== "Todos" && prop.propertyType !== selectedPropertyType) {
        return false;
      }

      // Operation Type
      if (selectedOperation !== "Todos" && prop.operationType !== selectedOperation) {
        return false;
      }

      // Price Range in COP Millions
      const priceInMillions = prop.priceCop / 1000000;
      if (priceInMillions < priceRangeMillions[0] || priceInMillions > priceRangeMillions[1]) {
        return false;
      }

      // Minimum Bedrooms
      if (minBedrooms > 0 && (prop.specs?.bedrooms || 0) < minBedrooms) {
        return false;
      }

      // Minimum Area
      if (minAreaM2 > 0 && (prop.specs?.areaM2 || 0) < minAreaM2) {
        return false;
      }

      return true;
    });

    // Sorting
    return list.sort((a, b) => {
      if (sortBy === "price_asc") return a.priceCop - b.priceCop;
      if (sortBy === "price_desc") return b.priceCop - a.priceCop;
      if (sortBy === "area_desc") return (b.specs?.areaM2 || 0) - (a.specs?.areaM2 || 0);
      return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
    });
  }, [
    propertiesList,
    searchQuery,
    selectedRegion,
    selectedPropertyType,
    selectedOperation,
    priceRangeMillions,
    minBedrooms,
    minAreaM2,
    sortBy,
  ]);

  // Property counts by type
  const propertyTypeCounts = useMemo(() => {
    const map: Record<string, number> = {};
    MOCK_REAL_ESTATE_PROPERTIES.forEach((prop) => {
      map[prop.propertyType] = (map[prop.propertyType] || 0) + 1;
    });
    return map;
  }, []);

  // Mortgage calculation for modal
  const calculatedMortgage = useMemo(() => {
    if (!selectedPropertyForModal) return { downPayment: 0, loanAmount: 0, monthlyQuota: 0 };
    const price = selectedPropertyForModal.priceCop;
    const downPayment = (price * downPaymentPercent) / 100;
    const loanAmount = price - downPayment;
    const annualInterestRate = 0.125; // 12.5% EA promedio bancario en Colombia
    const monthlyRate = annualInterestRate / 12;
    const totalMonths = loanTermYears * 12;

    const monthlyQuota =
      loanAmount > 0
        ? (loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, totalMonths))) /
          (Math.pow(1 + monthlyRate, totalMonths) - 1)
        : 0;

    return {
      downPayment,
      loanAmount,
      monthlyQuota: Math.round(monthlyQuota),
    };
  }, [selectedPropertyForModal, downPaymentPercent, loanTermYears]);

  return (
    <div className="space-y-8">
      {/* ────────────────────────────────────────────────────── */}
      {/* REAL ESTATE HERO SECTION */}
      {/* ────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white p-5 sm:p-10 lg:p-14 shadow-2xl">
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-center">
          {/* Left Column: Heading & Information */}
          <div className="lg:col-span-7 space-y-4 sm:space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 sm:px-3.5 sm:py-1.5 text-[11px] sm:text-xs font-semibold text-emerald-400 backdrop-blur-md">
              <Building2 className="h-3.5 w-3.5 text-emerald-400" />
              <span>División de Bienes Raíces & Inmuebles Prime &bull; Colombia</span>
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight font-heading text-white leading-tight">
              Propiedades de Autor,{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
                Penthouses & Mansiones
              </span>{" "}
              en Colombia.
            </h1>

            <p className="text-sm sm:text-base text-slate-300 sm:text-lg max-w-2xl leading-relaxed">
              Curaduría exclusiva de inmuebles de alto estándar en Bogotá, Medellín, Cartagena, Barranquilla y Llanogrande. Estudio de títulos jurídico garantizado y asesoría VIP por WhatsApp.
            </p>

            {/* Search Input Bar */}
            <div className="pt-1 sm:pt-2 flex flex-col gap-2 sm:flex-row sm:items-center max-w-xl">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Buscar por sector (El Poblado, Chicó, Castillogrande), código..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-11 sm:h-12 pl-10 pr-4 text-xs sm:text-sm bg-slate-900/90 border-slate-700 text-white placeholder:text-slate-400 rounded-xl focus:bg-slate-900 focus:ring-2 focus:ring-emerald-500 transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <Button
                onClick={() => {
                  const gridElement = document.getElementById("real-estate-catalog");
                  gridElement?.scrollIntoView({ behavior: "smooth" });
                }}
                className="h-11 sm:h-12 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-5 sm:px-6 rounded-xl shadow-lg transition-all cursor-pointer text-xs sm:text-sm"
              >
                Explorar ({filteredProperties.length})
              </Button>
            </div>

            {/* Quick Chips / Filters with smooth horizontal scroll on touch devices */}
            <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-slate-400 pt-1 overflow-x-auto pb-1.5 -mx-1 px-1 no-scrollbar sm:flex-wrap">
              <span className="font-semibold text-slate-300 shrink-0">Explorar:</span>
              <button
                onClick={() => applyQuickFilter("penthouse")}
                className="rounded-full border border-slate-700 bg-slate-900/80 px-2.5 sm:px-3 py-1 text-slate-200 hover:border-emerald-500 hover:text-emerald-400 transition shrink-0 whitespace-nowrap"
              >
                Penthouses ({propertyTypeCounts["Penthouse"] || 0})
              </button>
              <button
                onClick={() => applyQuickFilter("medellin")}
                className="rounded-full border border-slate-700 bg-slate-900/80 px-2.5 sm:px-3 py-1 text-slate-200 hover:border-emerald-500 hover:text-emerald-400 transition shrink-0 whitespace-nowrap"
              >
                El Poblado
              </button>
              <button
                onClick={() => applyQuickFilter("beach")}
                className="rounded-full border border-slate-700 bg-slate-900/80 px-2.5 sm:px-3 py-1 text-slate-200 hover:border-emerald-500 hover:text-emerald-400 transition shrink-0 whitespace-nowrap"
              >
                Frente al Mar
              </button>
              <button
                onClick={() => applyQuickFilter("campestre")}
                className="rounded-full border border-slate-700 bg-slate-900/80 px-2.5 sm:px-3 py-1 text-slate-200 hover:border-emerald-500 hover:text-emerald-400 transition shrink-0 whitespace-nowrap"
              >
                Campestres
              </button>
              <button
                onClick={() => applyQuickFilter("under2b")}
                className="rounded-full border border-slate-700 bg-slate-900/80 px-2.5 sm:px-3 py-1 text-slate-200 hover:border-emerald-500 hover:text-emerald-400 transition shrink-0 whitespace-nowrap"
              >
                Hasta $2.000M
              </button>
            </div>
          </div>

          {/* Right Column: Real Estate Trust Matrix Card */}
          <div className="lg:col-span-5">
            <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 sm:p-8 backdrop-blur-xl shadow-xl space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">
                    Broker Inmobiliario Oficial &bull; {agency.taxId ? `NIT ${agency.taxId}` : "NIT 902.095.222-8"}
                  </span>
                  <h3 className="text-lg font-bold font-heading text-white mt-0.5">{agency.legalName || "YJD TRINOVA S.A.S."}</h3>
                  <p className="text-[11px] text-slate-400 font-medium">{agency.name}</p>
                </div>
                <div className="flex items-center gap-1.5 rounded-full bg-slate-800 px-3 py-1 border border-slate-700">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  <span className="text-xs font-bold text-white">{agency.rating}</span>
                  <span className="text-[10px] text-slate-400">/ 5.0</span>
                </div>
              </div>

              <ul className="space-y-4 text-xs">
                <li className="flex items-center gap-3.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shrink-0">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-bold text-white">Estudio de Títulos 100% Jurídico</p>
                    <p className="text-slate-400 text-[11px]">Inmuebles saneados libres de gravámenes</p>
                  </div>
                </li>
                <li className="flex items-center gap-3.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shrink-0">
                    <Award className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-bold text-white">Fiduciarias & Bancos Aliados</p>
                    <p className="text-slate-400 text-[11px]">Proyectos respaldados por fiducias certificadas</p>
                  </div>
                </li>
                <li className="flex items-center gap-3.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shrink-0">
                    <Compass className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-bold text-white">Ficha Técnica & Dossier en PDF</p>
                    <p className="text-slate-400 text-[11px]">Entrega inmediata de planos y cotización por WhatsApp</p>
                  </div>
                </li>
                <li className="flex items-center gap-3.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shrink-0">
                    <MessageCircle className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-bold text-white">Asesoría Inmobiliaria VIP</p>
                    <p className="text-slate-400 text-[11px]">Atención inmediata & asesores directos para visitas privadas</p>
                  </div>
                </li>
              </ul>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-emerald-400" />
                  <span>{agency.city}</span>
                </div>
                <a
                  href={`https://wa.me/${agency.whatsappPhone}?text=${encodeURIComponent(
                    `Hola ${agency.name}, deseo agendar una asesoría para compra de finca raíz de alto nivel.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1"
                >
                  <span>Contactar Asesor</span>
                  <ArrowRight className="h-3 w-3" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────── */}
      {/* CATALOG / INVENTORY AREA */}
      {/* ────────────────────────────────────────────────────── */}
      <div id="real-estate-catalog" className="space-y-6 pt-4">
        {/* Top Controls Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
          <div className="flex items-center gap-3">
            {/* Mobile Sheet Trigger */}
            <Sheet open={mobileFilterOpen} onOpenChange={setMobileFilterOpen}>
              <SheetTrigger className="flex items-center gap-2 border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 lg:hidden px-3.5 py-2 rounded-xl text-xs font-semibold shadow-sm cursor-pointer">
                <SlidersHorizontal className="h-4 w-4" />
                <span>Filtros Inmobiliarios</span>
                {activeFiltersCount > 0 && (
                  <Badge className="h-5 w-5 rounded-full bg-slate-950 p-0 text-[10px] text-white flex items-center justify-center">
                    {activeFiltersCount}
                  </Badge>
                )}
              </SheetTrigger>
              <SheetContent side="left" className="w-[320px] sm:w-[400px] overflow-y-auto bg-white p-6">
                <SheetHeader className="text-left border-b border-slate-200 pb-4">
                  <SheetTitle className="text-lg font-bold text-slate-950 flex items-center justify-between">
                    <span>Filtros de Propiedades</span>
                    {activeFiltersCount > 0 && (
                      <button
                        onClick={resetFilters}
                        className="text-xs font-semibold text-emerald-600 hover:text-emerald-700"
                      >
                        Limpiar ({activeFiltersCount})
                      </button>
                    )}
                  </SheetTitle>
                </SheetHeader>
                <div className="space-y-6 py-6 text-xs">
                  {/* Region */}
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-900">Ubicación / Ciudad</Label>
                    <select
                      value={selectedRegion}
                      onChange={(e) => setSelectedRegion(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-800"
                    >
                      {REAL_ESTATE_REGIONS.map((reg) => (
                        <option key={reg} value={reg}>
                          {reg}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Property Type */}
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-900">Tipo de Inmueble</Label>
                    <select
                      value={selectedPropertyType}
                      onChange={(e) => setSelectedPropertyType(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-800"
                    >
                      {PROPERTY_TYPES.map((pt) => (
                        <option key={pt} value={pt}>
                          {pt}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Min Bedrooms */}
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-900">Habitaciones Mínimas</Label>
                    <div className="grid grid-cols-5 gap-1.5">
                      {[0, 2, 3, 4, 5].map((num) => (
                        <button
                          key={num}
                          onClick={() => setMinBedrooms(num)}
                          className={`rounded-lg py-2 text-xs font-bold transition ${
                            minBedrooms === num
                              ? "bg-slate-950 text-white"
                              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                          }`}
                        >
                          {num === 0 ? "Todas" : `${num}+`}
                        </button>
                      ))}
                    </div>
                  </div>

                  <Button
                    onClick={() => setMobileFilterOpen(false)}
                    className="w-full bg-slate-950 text-white rounded-xl py-3 font-bold text-xs"
                  >
                    Ver {filteredProperties.length} Propiedades
                  </Button>
                </div>
              </SheetContent>
            </Sheet>

            <span className="text-sm text-slate-600 font-medium">
              Mostrando <strong className="text-slate-950 font-bold">{filteredProperties.length}</strong> propiedades exclusivas
            </span>
          </div>

          {/* Sort & View Mode Switcher */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline text-xs font-bold text-slate-500">Ordenar:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800 shadow-sm focus:outline-none"
              >
                <option value="featured">Destacadas Primero</option>
                <option value="price_asc">Precio: Menor a Mayor</option>
                <option value="price_desc">Precio: Mayor a Menor</option>
                <option value="area_desc">Mayor Superficie (m²)</option>
              </select>
            </div>

            {/* Grid / List view buttons */}
            <div className="hidden sm:flex items-center rounded-xl border border-slate-300 bg-white p-1 shadow-sm">
              <button
                onClick={() => setViewMode("grid")}
                className={`rounded-lg p-1.5 transition ${
                  viewMode === "grid" ? "bg-slate-950 text-white" : "text-slate-500 hover:text-slate-900"
                }`}
                title="Vista Cuadrícula"
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`rounded-lg p-1.5 transition ${
                  viewMode === "list" ? "bg-slate-950 text-white" : "text-slate-500 hover:text-slate-900"
                }`}
                title="Vista Lista"
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Main Grid: Left Sidebar (Desktop) + Property Cards */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Desktop Left Filter Sidebar */}
          <aside className="hidden lg:block lg:col-span-3 space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h4 className="text-sm font-bold text-slate-950 flex items-center gap-2">
                  <Filter className="h-4 w-4 text-emerald-600" />
                  Filtros Avanzados
                </h4>
                {activeFiltersCount > 0 && (
                  <button
                    onClick={resetFilters}
                    className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700"
                  >
                    Limpiar ({activeFiltersCount})
                  </button>
                )}
              </div>

              {/* City / Region */}
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-900">Ubicación / Ciudad</Label>
                <select
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-800 font-medium focus:bg-white transition"
                >
                  {REAL_ESTATE_REGIONS.map((reg) => (
                    <option key={reg} value={reg}>
                      {reg}
                    </option>
                  ))}
                </select>
              </div>

              {/* Property Type */}
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-900">Tipo de Inmueble</Label>
                <select
                  value={selectedPropertyType}
                  onChange={(e) => setSelectedPropertyType(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-800 font-medium focus:bg-white transition"
                >
                  {PROPERTY_TYPES.map((pt) => (
                    <option key={pt} value={pt}>
                      {pt} ({pt === "Todos" ? MOCK_REAL_ESTATE_PROPERTIES.length : propertyTypeCounts[pt] || 0})
                    </option>
                  ))}
                </select>
              </div>

              {/* Operation Type */}
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-900">Tipo de Operación</Label>
                <select
                  value={selectedOperation}
                  onChange={(e) => setSelectedOperation(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-800 font-medium focus:bg-white transition"
                >
                  {OPERATION_TYPES.map((op) => (
                    <option key={op} value={op}>
                      {op}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Range Slider (COP Millions) */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between text-xs">
                  <Label className="font-bold text-slate-900">Rango de Precio</Label>
                  <span className="text-[11px] font-bold text-emerald-700">
                    ${priceRangeMillions[0]}M - ${priceRangeMillions[1]}M COP
                  </span>
                </div>
                <Slider
                  min={500}
                  max={6000}
                  step={100}
                  value={priceRangeMillions}
                  onValueChange={(val) => setPriceRangeMillions(val as [number, number])}
                  className="py-2"
                />
              </div>

              {/* Min Bedrooms */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <Label className="text-xs font-bold text-slate-900">Habitaciones Mínimas</Label>
                <div className="grid grid-cols-5 gap-1.5">
                  {[0, 2, 3, 4, 5].map((num) => (
                    <button
                      key={num}
                      onClick={() => setMinBedrooms(num)}
                      className={`rounded-lg py-2 text-xs font-bold transition ${
                        minBedrooms === num
                          ? "bg-slate-950 text-white shadow-sm"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      {num === 0 ? "Todas" : `${num}+`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Min Area (m²) */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <Label className="text-xs font-bold text-slate-900">Superficie Mínima (m²)</Label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[0, 150, 300, 450].map((area) => (
                    <button
                      key={area}
                      onClick={() => setMinAreaM2(area)}
                      className={`rounded-lg py-2 text-[11px] font-bold transition ${
                        minAreaM2 === area
                          ? "bg-slate-950 text-white shadow-sm"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      {area === 0 ? "Todas" : `${area}m²+`}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Right Column: Properties Grid / List */}
          <div className="lg:col-span-9 space-y-6">
            {filteredProperties.length === 0 ? (
              <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center space-y-4">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                  <Building2 className="h-7 w-7" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 font-heading">No se encontraron propiedades</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  No hay inmuebles que coincidan con los filtros seleccionados. Intenta ampliar el rango de precio o cambiar la ciudad.
                </p>
                <Button onClick={resetFilters} variant="outline" className="rounded-xl text-xs font-bold">
                  Restablecer Filtros
                </Button>
              </div>
            ) : (
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 md:grid-cols-2 gap-6"
                    : "space-y-4"
                }
              >
                {filteredProperties.map((prop) => {
                  const currentImgIndex = activeImageIndexMap[prop.id] || 0;
                  const isFav = favorites.includes(prop.id);

                  return (
                    <Card
                      key={prop.id}
                      onClick={() => setSelectedPropertyForModal(prop)}
                      className="group bg-white border-slate-200/90 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:border-slate-400 flex flex-col cursor-pointer !p-0 !pt-0 gap-0"
                    >
                      {/* Image Slider Container */}
                      <div className="relative h-64 sm:h-72 w-full bg-slate-900 overflow-hidden rounded-t-3xl">
                        <img
                          src={prop.images[currentImgIndex]}
                          alt={prop.title}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />

                        {/* Top Badges */}
                        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
                          <Badge className="bg-slate-950/90 text-white font-bold text-[10px] backdrop-blur-md">
                            {prop.operationType}
                          </Badge>
                          {prop.badge && (
                            <Badge className="bg-emerald-600 text-white font-bold text-[10px] shadow-sm">
                              {prop.badge}
                            </Badge>
                          )}
                        </div>

                        {/* Favorite Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(prop.id);
                          }}
                          className="absolute top-3 right-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-slate-800 shadow-md backdrop-blur-md transition hover:scale-110 hover:bg-white"
                          title={isFav ? "Quitar de favoritos" : "Guardar en favoritos"}
                        >
                          <Heart
                            className={`h-4 w-4 ${
                              isFav ? "fill-red-500 text-red-500" : "text-slate-700"
                            }`}
                          />
                        </button>

                        {/* Carousel Arrows */}
                        {prop.images.length > 1 && (
                          <div className="absolute inset-y-0 inset-x-2 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => handlePrevImage(e, prop)}
                              className="flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md hover:bg-black"
                            >
                              <ChevronLeft className="h-4 w-4" />
                            </button>
                            <button
                              onClick={(e) => handleNextImage(e, prop)}
                              className="flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md hover:bg-black"
                            >
                              <ChevronRight className="h-4 w-4" />
                            </button>
                          </div>
                        )}

                        {/* Image Pagination Dots */}
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1 z-10">
                          {prop.images.map((_, idx) => (
                            <span
                              key={idx}
                              className={`h-1.5 rounded-full transition-all ${
                                idx === currentImgIndex
                                  ? "w-5 bg-white shadow-md"
                                  : "w-1.5 bg-white/50"
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Property Body Content */}
                      <CardContent className="p-6 flex-1 flex flex-col justify-between space-y-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs text-slate-400">
                            <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                              {prop.code} &bull; {prop.propertyType}
                            </span>
                            <span className="font-semibold text-slate-500 flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5 text-slate-400" />
                              {prop.neighborhood}, {prop.city}
                            </span>
                          </div>

                          <h3 className="text-lg font-extrabold text-slate-950 font-heading leading-tight group-hover:text-emerald-700 transition-colors line-clamp-2">
                            {prop.title}
                          </h3>
                        </div>

                        {/* Specs Grid with Icons */}
                        <div className="grid grid-cols-4 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-100 text-center text-xs">
                          <div>
                            <span className="text-[10px] text-slate-400 block font-bold uppercase">Área</span>
                            <span className="font-bold text-slate-900">{prop.specs?.areaM2 || 240} m²</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block font-bold uppercase">Hab.</span>
                            <span className="font-bold text-slate-900">{prop.specs?.bedrooms || 3}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block font-bold uppercase">Baños</span>
                            <span className="font-bold text-slate-900">{prop.specs?.bathrooms || 4}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block font-bold uppercase">Estrato</span>
                            <span className="font-bold text-slate-900">{prop.specs?.stratum || 6}</span>
                          </div>
                        </div>

                        {/* Pricing & Monthly Quota */}
                        <div className="pt-2 border-t border-slate-100 flex items-end justify-between">
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                              VALOR DE VENTA
                            </span>
                            <span className="text-xl font-black text-slate-950 font-heading">
                              {formatCop(prop.priceCop)}
                            </span>
                            {prop.monthlyEstimateCop && (
                              <p className="text-[11px] font-semibold text-emerald-700 mt-0.5">
                                Cuota est: ~{formatCop(prop.monthlyEstimateCop)}/mes
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>

                      {/* Card Footer Actions */}
                      <CardFooter className="p-4 pt-0 gap-2">
                        <Button
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPropertyForModal(prop);
                          }}
                          className="flex-1 rounded-xl text-xs font-bold border-slate-200 hover:bg-slate-100"
                        >
                          Ver Ficha Completa
                        </Button>
                        <a
                          href={buildWhatsAppPropertyLink(prop)}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 shadow-sm transition"
                        >
                          <MessageCircle className="h-4 w-4 fill-white text-emerald-600" />
                          <span>Consultar</span>
                        </a>
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ────────────────────────────────────────────────────── */}
      {/* LUXURY PROPERTY DOSSIER / MODAL */}
      {/* ────────────────────────────────────────────────────── */}
      <Dialog
        open={Boolean(selectedPropertyForModal)}
        onOpenChange={(open) => !open && setSelectedPropertyForModal(null)}
      >
        <DialogContent className="!max-w-[1200px] !w-[96vw] sm:!w-[92vw] max-h-[92vh] overflow-y-auto bg-white p-4 sm:p-8 md:p-10 rounded-2xl sm:rounded-3xl border-slate-200 shadow-2xl">
          {selectedPropertyForModal && (
            <div className="space-y-5 sm:space-y-6 text-xs text-slate-700">
              {/* Modal Header */}
              <DialogHeader className="text-left space-y-1.5 sm:space-y-2 border-b border-slate-100 pb-3 sm:pb-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <Badge className="bg-slate-950 text-white font-bold text-[10px]">
                      {selectedPropertyForModal.operationType}
                    </Badge>
                    <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-800 font-bold text-[10px]">
                      {selectedPropertyForModal.propertyType}
                    </Badge>
                    {selectedPropertyForModal.badge && (
                      <Badge className="bg-emerald-600 text-white font-bold text-[10px]">
                        {selectedPropertyForModal.badge}
                      </Badge>
                    )}
                  </div>
                  <span className="font-bold text-slate-400 uppercase text-[10px] sm:text-xs">
                    Código: {selectedPropertyForModal.code}
                  </span>
                </div>

                <DialogTitle className="text-xl sm:text-3xl font-black font-heading text-slate-950 leading-tight">
                  {selectedPropertyForModal.title}
                </DialogTitle>
                <DialogDescription className="text-xs sm:text-sm text-slate-500 flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-600 shrink-0" />
                  {selectedPropertyForModal.addressBrief} &bull; {selectedPropertyForModal.neighborhood}, {selectedPropertyForModal.city}
                </DialogDescription>
              </DialogHeader>

              {/* Gallery Carousel with responsive mobile height */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 sm:gap-3 md:gap-4">
                <div className="md:col-span-2 h-56 sm:h-80 md:h-[400px] rounded-xl sm:rounded-2xl overflow-hidden bg-slate-950 shadow-sm">
                  <img
                    src={selectedPropertyForModal.images[0]}
                    alt={selectedPropertyForModal.title}
                    className="h-full w-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-1 gap-2 sm:gap-3 md:gap-4">
                  {selectedPropertyForModal.images.slice(1, 3).map((img, idx) => (
                    <div key={idx} className="h-28 sm:h-38 md:h-[192px] rounded-xl sm:rounded-2xl overflow-hidden bg-slate-950 shadow-sm">
                      <img src={img} alt="Vista detalle" className="h-full w-full object-cover hover:scale-105 transition-transform duration-500" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Tabs: Detalles, Amenidades, Simulador Hipotecario */}
              <Tabs defaultValue="details" className="w-full pt-1 sm:pt-2">
                <TabsList className="grid grid-cols-3 bg-slate-100 p-1 rounded-xl sm:rounded-2xl h-10 sm:h-11">
                  <TabsTrigger value="details" className="rounded-lg sm:rounded-xl text-[11px] sm:text-sm font-bold">
                    Características
                  </TabsTrigger>
                  <TabsTrigger value="amenities" className="rounded-lg sm:rounded-xl text-[11px] sm:text-sm font-bold truncate">
                    Amenidades ({selectedPropertyForModal.amenities.length})
                  </TabsTrigger>
                  <TabsTrigger value="mortgage" className="rounded-lg sm:rounded-xl text-[11px] sm:text-sm font-bold">
                    Simulador
                  </TabsTrigger>
                </TabsList>

                {/* Tab 1: Details */}
                <TabsContent value="details" className="space-y-4 pt-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 bg-slate-50 p-5 rounded-2xl border border-slate-200/80">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Área Construida</span>
                      <span className="font-extrabold text-sm text-slate-900">{selectedPropertyForModal.specs?.areaM2 || 240} m²</span>
                    </div>
                    {selectedPropertyForModal.specs?.lotAreaM2 && (
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Área de Lote</span>
                        <span className="font-extrabold text-sm text-slate-900">{selectedPropertyForModal.specs.lotAreaM2} m²</span>
                      </div>
                    )}
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Habitaciones</span>
                      <span className="font-extrabold text-sm text-slate-900">{selectedPropertyForModal.specs?.bedrooms || 3}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Baños</span>
                      <span className="font-extrabold text-sm text-slate-900">{selectedPropertyForModal.specs?.bathrooms || 4}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Parqueaderos</span>
                      <span className="font-extrabold text-sm text-slate-900">{selectedPropertyForModal.specs?.parkingSpots || 2} Privados</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Estrato</span>
                      <span className="font-extrabold text-sm text-slate-900">{selectedPropertyForModal.specs?.stratum || 6}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Año Entrega</span>
                      <span className="font-extrabold text-sm text-slate-900">{selectedPropertyForModal.specs?.builtYear || 2024}</span>
                    </div>
                    {selectedPropertyForModal.specs?.adminFeeCop && (
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Administración</span>
                        <span className="font-extrabold text-sm text-slate-900">{formatCop(selectedPropertyForModal.specs.adminFeeCop)}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-bold text-slate-900 text-sm">Descripción del Inmueble</h4>
                    <p className="text-slate-600 leading-relaxed text-xs sm:text-sm">
                      {selectedPropertyForModal.description}
                    </p>
                  </div>
                </TabsContent>

                {/* Tab 2: Amenities */}
                <TabsContent value="amenities" className="pt-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedPropertyForModal.amenities.map((amenity, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs font-semibold text-slate-800"
                      >
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                        <span>{amenity}</span>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                {/* Tab 3: Mortgage Simulator */}
                <TabsContent value="mortgage" className="pt-4 space-y-4">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                        <Calculator className="h-4 w-4 text-emerald-600" />
                        Simulador de Crédito Hipotecario (Bancos Colombia)
                      </h4>
                      <Badge variant="outline" className="text-[10px] font-bold bg-white text-slate-700">
                        Tasa Ref: 12.5% E.A.
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs font-bold text-slate-700">
                          <span>Cuota Inicial ({downPaymentPercent}%)</span>
                          <span className="text-emerald-700">{formatCop(calculatedMortgage.downPayment)}</span>
                        </div>
                        <Slider
                          min={10}
                          max={50}
                          step={5}
                          value={[downPaymentPercent]}
                          onValueChange={(val) => {
                            const num = Array.isArray(val) ? val[0] : Number(val);
                            if (!isNaN(num)) setDownPaymentPercent(num);
                          }}
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-xs font-bold text-slate-700">
                          <span>Plazo del Crédito ({loanTermYears} Años)</span>
                          <span className="text-slate-900">{loanTermYears * 12} Meses</span>
                        </div>
                        <Slider
                          min={5}
                          max={20}
                          step={5}
                          value={[loanTermYears]}
                          onValueChange={(val) => {
                            const num = Array.isArray(val) ? val[0] : Number(val);
                            if (!isNaN(num)) setLoanTermYears(num);
                          }}
                        />
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                          CUOTA MENSUAL ESTIMADA
                        </span>
                        <span className="text-xl font-black text-slate-950 font-heading">
                          {formatCop(calculatedMortgage.monthlyQuota)} <span className="text-xs font-semibold text-slate-500">/ mes</span>
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 max-w-xs text-right hidden sm:block">
                        *Cálculo orientativo sin seguros ni gastos de escrituración. Sujeto a estudio de crédito bancario.
                      </p>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              {/* Modal Bottom Contact & Action Bar */}
              <div className="pt-3 sm:pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    VALOR TOTAL DE LA PROPIEDAD
                  </span>
                  <span className="text-xl sm:text-2xl font-black text-slate-950 font-heading">
                    {formatCop(selectedPropertyForModal.priceCop)}
                  </span>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedPropertyForModal(null)}
                    className="rounded-xl text-xs font-bold h-11 px-4"
                  >
                    Cerrar
                  </Button>
                  <a
                    href={buildWhatsAppPropertyLink(selectedPropertyForModal)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 sm:px-5 h-11 shadow-lg transition"
                  >
                    <MessageCircle className="h-4 w-4 fill-white text-emerald-600" />
                    <span className="truncate">Solicitar Brochure & Cita</span>
                  </a>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
