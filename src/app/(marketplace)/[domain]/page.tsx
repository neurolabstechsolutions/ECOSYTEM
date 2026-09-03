"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  MOCK_INVENTORY,
  getStoredVehicles,
  getDealershipByDomain,
  REGIONS_LIST,
  BRANDS_LIST,
  BODY_TYPES,
  FUEL_TYPES,
  Vehicle,
  DEFAULT_AGENCY,
} from "@/lib/marketplace-mocks";
import { RealEstateMarketplace } from "@/components/real-estate-marketplace";
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
  SheetFooter,
} from "@/components/ui/sheet";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Search,
  SlidersHorizontal,
  MapPin,
  Gauge,
  Fuel,
  ShieldCheck,
  Award,
  Phone,
  MessageCircle,
  Clock,
  Heart,
  Share2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Calendar,
  Zap,
  Building2,
  Grid,
  List,
  Star,
  DollarSign,
  Calculator,
  ArrowRight,
  Filter,
  Check,
  Car as CarIcon,
  X,
} from "lucide-react";

import { useParams } from "next/navigation";
import Link from "next/link";
import { YjdTrinovaLogo } from "@/components/yjd-trinova-logo";

interface MarketplacePageProps {
  params: Promise<{
    domain: string;
  }>;
}

export default function MarketplacePage(props: MarketplacePageProps) {
  // Unwrap the params Promise (Next.js 15+ requirement)
  const resolvedParams = React.use(props.params);
  const domainParam = resolvedParams?.domain || "prestige";
  const dealer = useMemo(() => getDealershipByDomain(domainParam), [domainParam]);

  // Currency configuration (Forced to COP for Colombia)
  const USD_TO_COP_RATE = 3900;

  // Active Category Switcher: Real Estate vs Vehicles
  const [activeMarketplaceTab, setActiveMarketplaceTab] = useState<"real_estate" | "vehicles">("real_estate");

  // Dynamic Vehicles Inventory State (Synchronized with Dashboard / LocalStorage)
  const [vehiclesList, setVehiclesList] = useState<Vehicle[]>([]);

  useEffect(() => {
    setVehiclesList(getStoredVehicles());
    const handleStorage = () => setVehiclesList(getStoredVehicles());
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  // Search and filter states (Vehicles)
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("Todas las Regiones");
  const [selectedBrand, setSelectedBrand] = useState("Todas las Marcas");
  const [selectedBodyType, setSelectedBodyType] = useState("Todos");
  const [selectedFuelType, setSelectedFuelType] = useState("Todos");
  const [selectedTransmission, setSelectedTransmission] = useState("Todos");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 160000]);
  const [minYear, setMinYear] = useState<number>(2020);
  const [onlyCertified, setOnlyCertified] = useState(false);
  const [sortBy, setSortBy] = useState("featured");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Interaction states
  const [favorites, setFavorites] = useState<string[]>([]);
  const [selectedVehicleForModal, setSelectedVehicleForModal] = useState<Vehicle | null>(null);
  const [activeImageIndexMap, setActiveImageIndexMap] = useState<Record<string, number>>({});
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Loan calculator inside modal
  const [downPaymentPercent, setDownPaymentPercent] = useState(30);
  const [loanTermMonths, setLoanTermMonths] = useState(48);

  // Toggle favorite
  const toggleFavorite = (carId: string) => {
    setFavorites((prev) =>
      prev.includes(carId) ? prev.filter((id) => id !== carId) : [...prev, carId]
    );
  };

  // Image slider navigation per card
  const handlePrevImage = (e: React.MouseEvent, car: Vehicle) => {
    e.stopPropagation();
    const currentIndex = activeImageIndexMap[car.id] || 0;
    const prevIndex = (currentIndex - 1 + car.images.length) % car.images.length;
    setActiveImageIndexMap((prev) => ({ ...prev, [car.id]: prevIndex }));
  };

  const handleNextImage = (e: React.MouseEvent, car: Vehicle) => {
    e.stopPropagation();
    const currentIndex = activeImageIndexMap[car.id] || 0;
    const nextIndex = (currentIndex + 1) % car.images.length;
    setActiveImageIndexMap((prev) => ({ ...prev, [car.id]: nextIndex }));
  };

  // Format currency helpers
  const formatPrice = (usdAmount: number) => {
    const copAmount = usdAmount * USD_TO_COP_RATE;
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
    }).format(copAmount);
  };

  const formatMonthlyEstimate = (monthlyUsd: number) => {
    const copAmount = monthlyUsd * USD_TO_COP_RATE;
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
    }).format(copAmount);
  };

  // Generate WhatsApp Inquiry Link
  const buildWhatsAppLink = (vehicle: Vehicle) => {
    const phoneNumber = vehicle.dealer?.whatsappPhone || dealer.whatsappPhone;
    const message = `¡Hola! 👋 Vengo desde el marketplace de *${dealer.name}*.
Estoy interesado en el siguiente vehículo:
🚗 *${vehicle.year} ${vehicle.brand} ${vehicle.model}* (${vehicle.trim || "Versión Estándar"})
💰 Precio: ${formatPrice(vehicle.price)}
📍 Ubicación: ${vehicle.city}
🔢 VIN: ${vehicle.vin}

¿Podrían confirmarme si aún sigue disponible y coordinar una asesoría / prueba de manejo? ¡Muchas gracias!`;

    return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
  };

  // Reset all filters
  const resetFilters = () => {
    setSearchQuery("");
    setSelectedRegion("Todas las Regiones");
    setSelectedBrand("Todas las Marcas");
    setSelectedBodyType("Todos");
    setSelectedFuelType("Todos");
    setSelectedTransmission("Todos");
    setPriceRange([0, 160000]);
    setMinYear(2020);
    setOnlyCertified(false);
    setSortBy("featured");
  };

  // Active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (searchQuery.trim() !== "") count++;
    if (selectedRegion !== "Todas las Regiones") count++;
    if (selectedBrand !== "Todas las Marcas") count++;
    if (selectedBodyType !== "Todos") count++;
    if (selectedFuelType !== "Todos") count++;
    if (selectedTransmission !== "Todos") count++;
    if (priceRange[0] > 0 || priceRange[1] < 160000) count++;
    if (minYear > 2020) count++;
    if (onlyCertified) count++;
    return count;
  }, [
    searchQuery,
    selectedRegion,
    selectedBrand,
    selectedBodyType,
    selectedFuelType,
    selectedTransmission,
    priceRange,
    minYear,
    onlyCertified,
  ]);

  // Filtered & Sorted Inventory
  const filteredVehicles = useMemo(() => {
    return vehiclesList.filter((car) => {
      // Search query (brand, model, trim, vin, city)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const fullTitle = `${car.year} ${car.brand} ${car.model} ${car.trim || ""} ${car.vin} ${car.city}`.toLowerCase();
        if (!fullTitle.includes(q)) return false;
      }

      // Region
      if (selectedRegion !== "Todas las Regiones" && car.region !== selectedRegion) {
        return false;
      }

      // Brand
      if (selectedBrand !== "Todas las Marcas" && car.brand !== selectedBrand) {
        return false;
      }

      // Body Type
      if (selectedBodyType !== "Todos" && car.bodyType !== selectedBodyType) {
        return false;
      }

      // Fuel Type
      if (selectedFuelType !== "Todos" && car.fuelType !== selectedFuelType) {
        return false;
      }

      // Transmission
      if (
        selectedTransmission !== "Todos" &&
        !car.transmission.toLowerCase().includes(selectedTransmission.toLowerCase())
      ) {
        return false;
      }

      // Price Range
      if (car.price < priceRange[0] || car.price > priceRange[1]) {
        return false;
      }

      // Year
      if (car.year < minYear) {
        return false;
      }

      // Only Certified
      if (onlyCertified && car.condition !== "Seminuevo Certificado") {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === "price-asc") return a.price - b.price;
      if (sortBy === "price-desc") return b.price - a.price;
      if (sortBy === "year-desc") return b.year - a.year;
      if (sortBy === "mileage-asc") return a.mileage - b.mileage;
      if (sortBy === "inspection-desc") return b.inspectionScore - a.inspectionScore;
      // Default: featured first, then newest
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return b.year - a.year;
    });
  }, [
    vehiclesList,
    searchQuery,
    selectedRegion,
    selectedBrand,
    selectedBodyType,
    selectedFuelType,
    selectedTransmission,
    priceRange,
    minYear,
    onlyCertified,
    sortBy,
  ]);

  // Brand vehicle counts for sidebar pills
  const brandCounts = useMemo(() => {
    const map: Record<string, number> = {};
    MOCK_INVENTORY.forEach((car) => {
      map[car.brand] = (map[car.brand] || 0) + 1;
    });
    return map;
  }, []);

  // Quick Preset Filters for Hero
  const applyQuickFilter = (type: "porsche" | "bmw" | "hybrid" | "under60k" | "suv") => {
    resetFilters();
    if (type === "porsche") setSelectedBrand("Porsche");
    if (type === "bmw") setSelectedBrand("BMW");
    if (type === "hybrid") setSelectedFuelType("Híbrido");
    if (type === "under60k") setPriceRange([0, 60000]);
    if (type === "suv") setSelectedBodyType("SUV");
  };

  // Financing calculation for modal
  const calculatedLoan = useMemo(() => {
    if (!selectedVehicleForModal) return { downPayment: 0, loanAmount: 0, monthlyQuota: 0 };
    const price = selectedVehicleForModal.price;
    const downPayment = (price * downPaymentPercent) / 100;
    const loanAmount = price - downPayment;
    const annualInterestRate = 0.095; // 9.5% TEA approx
    const monthlyRate = annualInterestRate / 12;
    const monthlyQuota =
      loanAmount > 0
        ? (loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, loanTermMonths))) /
          (Math.pow(1 + monthlyRate, loanTermMonths) - 1)
        : 0;

    return {
      downPayment,
      loanAmount,
      monthlyQuota: Math.round(monthlyQuota),
    };
  }, [selectedVehicleForModal, downPaymentPercent, loanTermMonths]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased selection:bg-slate-900 selection:text-white">
      {/* ────────────────────────────────────────────────────── */}
      {/* TOP CORPORATE TRUST BAR */}
      {/* ────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
        <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between px-3 sm:px-6 lg:px-8 gap-2">
          {/* Brand & Dealership Identity */}
          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
            <Link href="/" className="hover:opacity-90 transition-opacity">
              <YjdTrinovaLogo size="md" />
            </Link>
          </div>

          {/* Central Category Switcher Tabs */}
          <div className="flex items-center rounded-xl sm:rounded-2xl bg-slate-100 p-0.5 sm:p-1 border border-slate-200 shadow-inner shrink-0">
            <button
              onClick={() => setActiveMarketplaceTab("real_estate")}
              className={`flex items-center gap-1 sm:gap-1.5 rounded-lg sm:rounded-xl px-2.5 sm:px-3.5 py-1 sm:py-1.5 text-[11px] sm:text-xs font-bold transition-all cursor-pointer ${
                activeMarketplaceTab === "real_estate"
                  ? "bg-slate-950 text-white shadow-md"
                  : "text-slate-600 hover:text-slate-950 hover:bg-slate-200/60"
              }`}
            >
              <Building2 className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-emerald-400" />
              <span>Bienes Raíces</span>
              <span className="hidden sm:inline-block px-1.5 py-0.2 rounded-full bg-emerald-600 text-[8px] sm:text-[9px] text-white font-extrabold ml-0.5 animate-pulse">
                NUEVO
              </span>
            </button>
            <button
              onClick={() => setActiveMarketplaceTab("vehicles")}
              className={`flex items-center gap-1 sm:gap-1.5 rounded-lg sm:rounded-xl px-2.5 sm:px-3.5 py-1 sm:py-1.5 text-[11px] sm:text-xs font-bold transition-all cursor-pointer ${
                activeMarketplaceTab === "vehicles"
                  ? "bg-slate-950 text-white shadow-md"
                  : "text-slate-600 hover:text-slate-950 hover:bg-slate-200/60"
              }`}
            >
              <CarIcon className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              <span>Vehículos</span>
            </button>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center space-x-1.5 sm:space-x-2.5 shrink-0">
            <Link
              href="/admin"
              className="hidden md:inline-flex items-center gap-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 px-3 py-1.5 text-xs font-semibold border border-slate-200 transition"
            >
              <span>Portal Admin</span>
            </Link>

            <Link
              href="/proveedores/registro"
              className="hidden lg:inline-flex items-center gap-1 rounded-xl bg-slate-900 hover:bg-slate-800 text-white px-3 py-1.5 text-xs font-semibold shadow-xs transition"
            >
              <span>Consignar con Nosotros</span>
            </Link>

            {/* Direct WhatsApp Callout in Header */}
            <a
              href={`https://wa.me/573235845145?text=${encodeURIComponent(
                activeMarketplaceTab === "real_estate"
                  ? "Hola YJD Trinova S.A.S., me gustaría recibir información sobre su catálogo de inmuebles y proyectos disponibles."
                  : "Hola YJD Trinova S.A.S., me gustaría recibir información sobre su catálogo de vehículos disponibles."
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-[11px] sm:text-xs font-bold text-white shadow-sm transition hover:bg-emerald-700"
            >
              <MessageCircle className="h-3.5 w-3.5 fill-white text-emerald-600" />
              <span className="hidden sm:inline">WhatsApp Oficial</span>
              <span className="sm:hidden">WhatsApp</span>
            </a>
          </div>
        </div>
      </header>

      {/* ────────────────────────────────────────────────────── */}
      {/* CONDITIONAL CONTENT: REAL ESTATE VS VEHICLES */}
      {/* ────────────────────────────────────────────────────── */}
      {activeMarketplaceTab === "real_estate" ? (
        <main className="mx-auto max-w-[1600px] px-4 py-8 sm:px-6 lg:px-8">
          <RealEstateMarketplace agency={DEFAULT_AGENCY} />
        </main>
      ) : (
        <>
          {/* ────────────────────────────────────────────────────── */}
          {/* VEHICLES HERO SECTION */}
          {/* ────────────────────────────────────────────────────── */}
          <section className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-b from-white via-slate-50/50 to-slate-100/40 py-8 sm:py-12 lg:py-16">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 h-96 w-96 rounded-full bg-slate-100/80 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 -mb-12 h-64 w-64 rounded-full bg-slate-200/40 blur-3xl pointer-events-none" />

        <div className="relative mx-auto max-w-[1600px] px-3 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-center">
            {/* Left Column: Heading & Information */}
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-100/90 px-3 py-1 text-[11px] sm:text-xs font-semibold text-slate-800 shadow-sm mb-3 sm:mb-4">
                <ShieldCheck className="h-3.5 w-3.5 text-slate-900" />
                <span>Marketplace Oficial &bull; Garantía 100% Certificada</span>
              </div>

              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-950 font-heading leading-tight">
                Encuentra tu próximo vehículo con{" "}
                <span className="underline decoration-slate-400 decoration-2 underline-offset-4">
                  confianza total
                </span>
                .
              </h1>

              <p className="mt-3 sm:mt-4 text-sm sm:text-base text-slate-600 sm:text-lg max-w-2xl leading-relaxed">
                Inspección pericial de 150 puntos, historial de mantenimientos garantizado,
                financiación pre-aprobada en minutos y entrega inmediata en todo el país.
              </p>

              {/* Live Search Input Bar */}
              <div className="mt-5 sm:mt-6 flex flex-col gap-2 sm:flex-row sm:items-center max-w-xl">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    type="text"
                    placeholder="Buscar por marca, modelo, línea o año..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-11 sm:h-12 pl-10 pr-4 text-xs sm:text-sm bg-slate-50/90 border-slate-300 rounded-xl shadow-inner focus:bg-white focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <Button
                  onClick={() => {
                    const gridElement = document.getElementById("inventory-grid");
                    gridElement?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="h-11 sm:h-12 bg-slate-950 hover:bg-slate-800 text-white font-semibold px-5 sm:px-6 shadow-md rounded-xl text-xs sm:text-sm cursor-pointer"
                >
                  Explorar ({filteredVehicles.length})
                </Button>
              </div>

              {/* Quick Tags / Fast Filters with horizontal scroll on touch */}
              <div className="mt-3.5 sm:mt-4 flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-slate-500 overflow-x-auto pb-1.5 -mx-1 px-1 no-scrollbar sm:flex-wrap">
                <span className="font-semibold text-slate-700 shrink-0">Filtros rápidos:</span>
                <button
                  onClick={() => applyQuickFilter("porsche")}
                  className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-slate-700 hover:border-slate-400 hover:bg-slate-50 transition shrink-0 whitespace-nowrap"
                >
                  Porsche ({brandCounts["Porsche"] || 0})
                </button>
                <button
                  onClick={() => applyQuickFilter("bmw")}
                  className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-slate-700 hover:border-slate-400 hover:bg-slate-50 transition shrink-0 whitespace-nowrap"
                >
                  BMW ({brandCounts["BMW"] || 0})
                </button>
                <button
                  onClick={() => applyQuickFilter("hybrid")}
                  className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-slate-700 hover:border-slate-400 hover:bg-slate-50 transition shrink-0 whitespace-nowrap"
                >
                  <Zap className="h-3 w-3" /> Híbridos & Eléctricos
                </button>
                <button
                  onClick={() => applyQuickFilter("suv")}
                  className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-slate-700 hover:border-slate-400 hover:bg-slate-50 transition shrink-0 whitespace-nowrap"
                >
                  SUVs
                </button>
                <button
                  onClick={() => applyQuickFilter("under60k")}
                  className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-slate-700 hover:border-slate-400 hover:bg-slate-50 transition shrink-0 whitespace-nowrap"
                >
                  Menos de $60K
                </button>
              </div>
            </div>

            {/* Right Column: Dealership Trust Matrix Card */}
            <div className="lg:col-span-5">
              <div className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-sm ring-1 ring-slate-900/5 backdrop-blur-sm">
                <div className="flex items-center justify-between border-b border-slate-100 pb-5 mb-6">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      Concesionario Oficial &bull; {dealer.taxId ? `NIT ${dealer.taxId}` : "Verificado"}
                    </span>
                    <h3 className="text-xl font-heading font-extrabold text-slate-900 mt-1">{dealer.name}</h3>
                    {dealer.legalName && (
                      <p className="text-[11px] text-slate-500 font-medium">{dealer.legalName}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 rounded-full bg-slate-50 px-3 py-1.5 border border-slate-200">
                    <Star className="h-3.5 w-3.5 fill-slate-900 text-slate-900" />
                    <span className="text-xs font-bold text-slate-900">{dealer.rating}</span>
                    <span className="text-[10px] text-slate-500 font-medium">({dealer.reviewsCount})</span>
                  </div>
                </div>

                {/* Sleek Trust List (Corporate Style) */}
                <ul className="space-y-5">
                  <li className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 border border-slate-100 shrink-0">
                      <ShieldCheck className="h-5 w-5 text-slate-900" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-950">150 Puntos de Peritaje</p>
                      <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mt-0.5">Inspección técnica certificada</p>
                    </div>
                  </li>
                  <li className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 border border-slate-100 shrink-0">
                      <Award className="h-5 w-5 text-slate-900" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-950">Garantía Directa de 12 Meses</p>
                      <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mt-0.5">Cobertura mecánica nacional</p>
                    </div>
                  </li>
                  <li className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 border border-slate-100 shrink-0">
                      <DollarSign className="h-5 w-5 text-slate-900" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-950">Aprobación de Crédito 24h</p>
                      <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mt-0.5">Financiación preferencial</p>
                    </div>
                  </li>
                  <li className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 border border-slate-100 shrink-0">
                      <Clock className="h-5 w-5 text-slate-900" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-950">Respuesta Inmediata</p>
                      <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mt-0.5">Asesor VIP vía WhatsApp</p>
                    </div>
                  </li>
                </ul>

                {/* Dealership Info Footer */}
                <div className="mt-4 flex items-center justify-between pt-2 text-xs text-slate-500">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                    <span>{dealer.city}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Building2 className="h-3.5 w-3.5 text-slate-400" />
                    <span>{dealer.businessHours.split("|")[0]}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────── */}
      {/* MAIN CONTENT AREA: SIDEBAR FILTERS & CARS GRID */}
      {/* ────────────────────────────────────────────────────── */}
      <main id="inventory-grid" className="mx-auto max-w-[1600px] px-4 py-10 sm:px-6 lg:px-8">
        {/* Top Control Bar: Mobile Filter Button, Sort Selector, Results Count */}
        <div className="mb-6 flex flex-col gap-4 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            {/* Mobile Sheet Trigger for Filters */}
            <Sheet open={mobileFilterOpen} onOpenChange={setMobileFilterOpen}>
              <SheetTrigger className="flex items-center gap-2 border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 lg:hidden px-3.5 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm cursor-pointer">
                <SlidersHorizontal className="h-4 w-4" />
                <span>Filtros</span>
                {activeFiltersCount > 0 && (
                  <Badge className="ml-1 h-5 w-5 rounded-full bg-slate-950 p-0 text-[10px] text-white flex items-center justify-center">
                    {activeFiltersCount}
                  </Badge>
                )}
              </SheetTrigger>
              <SheetContent side="left" className="w-[320px] sm:w-[400px] overflow-y-auto bg-white p-6">
                <SheetHeader className="text-left border-b border-slate-200 pb-4">
                  <SheetTitle className="text-lg font-bold text-slate-950 flex items-center justify-between">
                    <span>Filtros de Búsqueda</span>
                    {activeFiltersCount > 0 && (
                      <button
                        onClick={resetFilters}
                        className="text-xs font-normal text-slate-500 hover:text-slate-900 underline"
                      >
                        Restablecer ({activeFiltersCount})
                      </button>
                    )}
                  </SheetTitle>
                </SheetHeader>

                {/* Mobile Filter Controls */}
                <div className="mt-6 space-y-6">
                  {/* Region Filter */}
                  <div>
                    <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Región / Ciudad
                    </Label>
                    <Select value={selectedRegion} onValueChange={(val) => val && setSelectedRegion(val)}>
                      <SelectTrigger className="mt-1.5 h-10 bg-slate-50 border-slate-200">
                        <SelectValue placeholder="Selecciona región" />
                      </SelectTrigger>
                      <SelectContent>
                        {REGIONS_LIST.map((reg) => (
                          <SelectItem key={reg} value={reg}>
                            {reg}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Brand Filter */}
                  <div>
                    <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Marca
                    </Label>
                    <Select value={selectedBrand} onValueChange={(val) => val && setSelectedBrand(val)}>
                      <SelectTrigger className="mt-1.5 h-10 bg-slate-50 border-slate-200">
                        <SelectValue placeholder="Selecciona marca" />
                      </SelectTrigger>
                      <SelectContent>
                        {BRANDS_LIST.map((br) => (
                          <SelectItem key={br} value={br}>
                            {br}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Price Slider */}
                  <div>
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Precio Máximo (USD)
                      </Label>
                      <span className="text-xs font-bold text-slate-900">
                        {formatPrice(priceRange[1])}
                      </span>
                    </div>
                    <Slider
                      value={[priceRange[1]]}
                      min={30000}
                      max={160000}
                      step={5000}
                      onValueChange={(val) => {
                        const num = Array.isArray(val) ? val[0] : Number(val);
                        if (!isNaN(num)) setPriceRange([0, num]);
                      }}
                      className="mt-3"
                    />
                  </div>

                  {/* Body Type */}
                  <div>
                    <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Carrocería
                    </Label>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {BODY_TYPES.map((bt) => (
                        <button
                          key={bt}
                          onClick={() => setSelectedBodyType(bt)}
                          className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
                            selectedBodyType === bt
                              ? "bg-slate-950 text-white"
                              : "border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                          }`}
                        >
                          {bt}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Fuel Type */}
                  <div>
                    <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Combustible
                    </Label>
                    <Select value={selectedFuelType} onValueChange={(val) => val && setSelectedFuelType(val as any)}>
                      <SelectTrigger className="mt-1.5 h-10 bg-slate-50 border-slate-200">
                        <SelectValue placeholder="Selecciona combustible" />
                      </SelectTrigger>
                      <SelectContent>
                        {FUEL_TYPES.map((fuel) => (
                          <SelectItem key={fuel} value={fuel}>
                            {fuel}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <SheetFooter className="mt-8 border-t border-slate-200 pt-4">
                  <Button
                    onClick={() => setMobileFilterOpen(false)}
                    className="w-full bg-slate-950 text-white font-semibold"
                  >
                    Ver Resultados ({filteredVehicles.length})
                  </Button>
                </SheetFooter>
              </SheetContent>
            </Sheet>

            <div>
              <p className="text-sm font-semibold text-slate-900">
                Mostrando <span className="font-bold">{filteredVehicles.length}</span> vehículos
                disponibles
              </p>
              {activeFiltersCount > 0 && (
                <p className="text-xs text-slate-500">
                  Filtros activos aplicados ({activeFiltersCount})
                </p>
              )}
            </div>
          </div>

          {/* Sort & View Mode Switcher */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Label htmlFor="sort-select" className="text-xs font-medium text-slate-500 hidden sm:block">
                Ordenar por:
              </Label>
              <Select value={sortBy} onValueChange={(val) => val && setSortBy(val)}>
                <SelectTrigger id="sort-select" className="h-9 w-[180px] bg-white border-slate-200 text-xs font-medium">
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="featured">Destacados</SelectItem>
                  <SelectItem value="price-asc">Precio: Menor a Mayor</SelectItem>
                  <SelectItem value="price-desc">Precio: Mayor a Menor</SelectItem>
                  <SelectItem value="year-desc">Año: Más Reciente</SelectItem>
                  <SelectItem value="mileage-asc">Menor Kilometraje</SelectItem>
                  <SelectItem value="inspection-desc">Score de Peritaje</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Grid / List View Toggle */}
            <div className="hidden sm:flex items-center rounded-lg border border-slate-200 bg-white p-0.5">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-md transition ${
                  viewMode === "grid" ? "bg-slate-100 text-slate-900" : "text-slate-400 hover:text-slate-700"
                }`}
                title="Vista de Cuadrícula"
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-md transition ${
                  viewMode === "list" ? "bg-slate-100 text-slate-900" : "text-slate-400 hover:text-slate-700"
                }`}
                title="Vista de Lista"
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Layout: Sidebar (Desktop) + Grid */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* ────────────────────────────────────────────────────── */}
          {/* DESKTOP FILTERS SIDEBAR */}
          {/* ────────────────────────────────────────────────────── */}
          <aside className="hidden lg:col-span-3 lg:block">
            <div className="sticky top-24 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm space-y-6">
              {/* Header with Clear Action */}
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4 text-slate-900" />
                  <h3 className="text-sm font-bold text-slate-900">Filtros Avanzados</h3>
                </div>
                {activeFiltersCount > 0 && (
                  <button
                    onClick={resetFilters}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-900"
                  >
                    <RotateCcw className="h-3 w-3" />
                    Limpiar
                  </button>
                )}
              </div>

              {/* 1. Region Filter */}
              <div>
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Región / Ciudad
                </Label>
                <Select value={selectedRegion} onValueChange={(val) => val && setSelectedRegion(val)}>
                  <SelectTrigger className="mt-1.5 h-9 bg-slate-50 border-slate-200 text-xs">
                    <SelectValue placeholder="Seleccionar región" />
                  </SelectTrigger>
                  <SelectContent>
                    {REGIONS_LIST.map((reg) => (
                      <SelectItem key={reg} value={reg} className="text-xs">
                        {reg}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 2. Brand Filter with Pills / Counts */}
              <div>
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Marca
                </Label>
                <div className="mt-2 space-y-1">
                  <button
                    onClick={() => setSelectedBrand("Todas las Marcas")}
                    className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium transition ${
                      selectedBrand === "Todas las Marcas"
                        ? "bg-slate-900 text-white"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <span>Todas las Marcas</span>
                    <span className="text-[11px] opacity-70">{MOCK_INVENTORY.length}</span>
                  </button>
                  {BRANDS_LIST.filter((b) => b !== "Todas las Marcas").map((brand) => {
                    const count = brandCounts[brand] || 0;
                    if (count === 0) return null;
                    return (
                      <button
                        key={brand}
                        onClick={() => setSelectedBrand(brand)}
                        className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium transition ${
                          selectedBrand === brand
                            ? "bg-slate-900 text-white font-semibold"
                            : "text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        <span>{brand}</span>
                        <span
                          className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                            selectedBrand === brand
                              ? "bg-slate-800 text-white"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Price Range Slider */}
              <div className="border-t border-slate-100 pt-4">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Precio Máximo
                  </Label>
                  <span className="text-xs font-bold text-slate-900">
                    {formatPrice(priceRange[1])}
                  </span>
                </div>
                <Slider
                  value={[priceRange[1]]}
                  min={30000}
                  max={160000}
                  step={5000}
                  onValueChange={(val) => {
                    const num = Array.isArray(val) ? val[0] : Number(val);
                    if (!isNaN(num)) setPriceRange([0, num]);
                  }}
                  className="mt-3"
                />
                <div className="mt-2 flex justify-between text-[10px] text-slate-400">
                  <span>$30k</span>
                  <span>$80k</span>
                  <span>$160k+</span>
                </div>
              </div>

              {/* 4. Body Type */}
              <div className="border-t border-slate-100 pt-4">
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Tipo de Carrocería
                </Label>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {BODY_TYPES.map((type) => (
                    <button
                      key={type}
                      onClick={() => setSelectedBodyType(type)}
                      className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${
                        selectedBodyType === type
                          ? "bg-slate-900 text-white shadow-xs"
                          : "border border-slate-200 bg-slate-50/80 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* 5. Fuel Type */}
              <div className="border-t border-slate-100 pt-4">
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Combustible
                </Label>
                <Select value={selectedFuelType} onValueChange={(val) => val && setSelectedFuelType(val as any)}>
                  <SelectTrigger className="mt-1.5 h-9 bg-slate-50 border-slate-200 text-xs">
                    <SelectValue placeholder="Tipo de combustible" />
                  </SelectTrigger>
                  <SelectContent>
                    {FUEL_TYPES.map((fuel) => (
                      <SelectItem key={fuel} value={fuel} className="text-xs">
                        {fuel}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 6. Only Certified Toggle */}
              <div className="border-t border-slate-100 pt-4">
                <label className="flex items-center justify-between cursor-pointer rounded-lg border border-slate-200 bg-slate-50/60 p-2.5 hover:bg-slate-50 transition">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-emerald-600" />
                    <span className="text-xs font-semibold text-slate-800">
                      Solo Certificados
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={onlyCertified}
                    onChange={(e) => setOnlyCertified(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                  />
                </label>
              </div>
            </div>
          </aside>

          {/* ────────────────────────────────────────────────────── */}
          {/* CARS GRID / LIST */}
          {/* ────────────────────────────────────────────────────── */}
          <div className="lg:col-span-9">
            {/* Active filter badges */}
            {activeFiltersCount > 0 && (
              <div className="mb-5 flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-slate-500">Filtros:</span>
                {searchQuery && (
                  <Badge variant="secondary" className="gap-1 bg-slate-200 text-slate-800 text-xs">
                    "{searchQuery}"
                    <X className="h-3 w-3 cursor-pointer" onClick={() => setSearchQuery("")} />
                  </Badge>
                )}
                {selectedRegion !== "Todas las Regiones" && (
                  <Badge variant="secondary" className="gap-1 bg-slate-200 text-slate-800 text-xs">
                    {selectedRegion}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => setSelectedRegion("Todas las Regiones")}
                    />
                  </Badge>
                )}
                {selectedBrand !== "Todas las Marcas" && (
                  <Badge variant="secondary" className="gap-1 bg-slate-200 text-slate-800 text-xs">
                    {selectedBrand}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => setSelectedBrand("Todas las Marcas")}
                    />
                  </Badge>
                )}
                {selectedBodyType !== "Todos" && (
                  <Badge variant="secondary" className="gap-1 bg-slate-200 text-slate-800 text-xs">
                    {selectedBodyType}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => setSelectedBodyType("Todos")}
                    />
                  </Badge>
                )}
                {selectedFuelType !== "Todos" && (
                  <Badge variant="secondary" className="gap-1 bg-slate-200 text-slate-800 text-xs">
                    {selectedFuelType}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => setSelectedFuelType("Todos")}
                    />
                  </Badge>
                )}
                {onlyCertified && (
                  <Badge variant="secondary" className="gap-1 bg-emerald-100 text-emerald-800 text-xs">
                    Certificados
                    <X className="h-3 w-3 cursor-pointer" onClick={() => setOnlyCertified(false)} />
                  </Badge>
                )}
                <button
                  onClick={resetFilters}
                  className="text-xs text-slate-500 hover:text-slate-900 underline ml-2"
                >
                  Borrar todos
                </button>
              </div>
            )}

            {/* Empty State */}
            {filteredVehicles.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-xs">
                <CarIcon className="mx-auto h-12 w-12 text-slate-300" />
                <h3 className="mt-4 text-base font-bold text-slate-900">
                  No encontramos vehículos con estos filtros
                </h3>
                <p className="mt-2 text-sm text-slate-500 max-w-md mx-auto">
                  Prueba ajustando el rango de precio, cambiando la ubicación o eliminando los filtros seleccionados.
                </p>
                <Button
                  onClick={resetFilters}
                  variant="outline"
                  className="mt-6 border-slate-300 text-slate-800 font-semibold"
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Restablecer todos los filtros
                </Button>
              </div>
            ) : (
              /* Vehicle Cards Container */
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3"
                    : "space-y-4"
                }
              >
                {filteredVehicles.map((car) => {
                  const currentImgIdx = activeImageIndexMap[car.id] || 0;
                  const isFav = favorites.includes(car.id);
                  const isList = viewMode === "list";

                  return (
                    <Card
                      key={car.id}
                      className={`group overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm transition-all duration-300 hover:shadow-lg hover:border-slate-300 flex flex-col justify-between !p-0 !pt-0 gap-0 ${
                        isList ? "sm:flex-row sm:items-stretch" : ""
                      }`}
                    >
                      {/* Photo Gallery Container */}
                      <div
                        className={`relative overflow-hidden bg-slate-900 ${
                          isList ? "sm:w-80 shrink-0 h-56 sm:h-auto sm:rounded-l-2xl" : "h-56 w-full rounded-t-2xl"
                        }`}
                      >
                        <img
                          src={car.images[currentImgIdx] || car.images[0]}
                          alt={`${car.brand} ${car.model}`}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                        />

                        {/* Top Badges Overlay */}
                        <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5 z-10">
                          {car.badge && (
                            <span className="rounded-md bg-slate-950/90 backdrop-blur-md px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
                              {car.badge}
                            </span>
                          )}
                          {car.fuelType === "Híbrido" || car.fuelType === "Eléctrico" ? (
                            <span className="rounded-md bg-emerald-600/90 backdrop-blur-md px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
                              🌱 {car.fuelType}
                            </span>
                          ) : null}
                        </div>

                        {/* Favorite Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(car.id);
                          }}
                          className="absolute top-2.5 right-2.5 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 backdrop-blur-md text-slate-700 shadow-sm transition hover:bg-white hover:text-red-500"
                          aria-label="Guardar vehículo"
                        >
                          <Heart
                            className={`h-4 w-4 ${
                              isFav ? "fill-red-500 text-red-500" : ""
                            }`}
                          />
                        </button>

                        {/* Image Arrow Switchers (on hover) */}
                        {car.images.length > 1 && (
                          <>
                            <button
                              onClick={(e) => handlePrevImage(e, car)}
                              className="absolute left-1.5 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white opacity-0 transition group-hover:opacity-100 hover:bg-black/80"
                            >
                              <ChevronLeft className="h-4 w-4" />
                            </button>
                            <button
                              onClick={(e) => handleNextImage(e, car)}
                              className="absolute right-1.5 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white opacity-0 transition group-hover:opacity-100 hover:bg-black/80"
                            >
                              <ChevronRight className="h-4 w-4" />
                            </button>
                            {/* Dot indicators */}
                            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1 z-10">
                              {car.images.map((_, idx) => (
                                <span
                                  key={idx}
                                  className={`h-1.5 rounded-full transition-all ${
                                    idx === currentImgIdx
                                      ? "w-4 bg-white"
                                      : "w-1.5 bg-white/50"
                                  }`}
                                />
                              ))}
                            </div>
                          </>
                        )}
                      </div>

                      {/* Card Content & Details */}
                      <div className="flex flex-1 flex-col justify-between p-4 sm:p-5">
                        <div>
                          {/* Location & Year */}
                          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3 text-slate-400" />
                              {car.city}
                            </span>
                            <span className="font-semibold text-slate-700">{car.year}</span>
                          </div>

                          {/* Vehicle Title */}
                          <h3 className="text-base font-bold text-slate-950 line-clamp-1 group-hover:text-slate-800 transition">
                            {car.brand} {car.model}
                          </h3>
                          {car.trim && (
                            <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                              {car.trim}
                            </p>
                          )}

                          {/* Quick Specs Grid (Mileage, Transmission, Fuel, Engine) */}
                          <div className="mt-3 grid grid-cols-2 gap-2 border-t border-b border-slate-100 py-2.5 text-xs text-slate-600">
                            <div className="flex items-center gap-1.5">
                              <Gauge className="h-3.5 w-3.5 text-slate-400" />
                              <span>{car.mileage.toLocaleString()} km</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Zap className="h-3.5 w-3.5 text-slate-400" />
                              <span className="truncate">{car.transmission}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Fuel className="h-3.5 w-3.5 text-slate-400" />
                              <span>{car.fuelType}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                              <span className="font-semibold text-slate-900">
                                {car.inspectionScore}/100 Peritaje
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Price & Action Buttons */}
                        <div className="mt-4 pt-2">
                          <div className="flex items-baseline justify-between">
                            <div>
                              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                                Precio Contado
                              </p>
                              <div className="flex items-baseline gap-1.5">
                                <span className="text-xl font-extrabold text-slate-950">
                                  {formatPrice(car.price)}
                                </span>
                                {car.originalPrice && car.originalPrice > car.price && (
                                  <span className="text-xs text-slate-400 line-through">
                                    {formatPrice(car.originalPrice)}
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="text-right">
                              <p className="text-[10px] text-slate-500">Estimado Mensual</p>
                              <p className="text-xs font-semibold text-slate-700">
                                {formatMonthlyEstimate(car.monthlyEstimate)}/mes
                              </p>
                            </div>
                          </div>

                          {/* CTAs: WhatsApp Primary + Technical Sheet Dialog Trigger */}
                          <div className="mt-4 grid grid-cols-2 gap-2">
                            {/* Technical Sheet / Detail Modal */}
                            <Button
                              variant="outline"
                              onClick={() => setSelectedVehicleForModal(car)}
                              className="h-10 text-xs font-semibold border-slate-200 bg-slate-50 text-slate-800 hover:bg-slate-100 hover:text-slate-950"
                            >
                              Ver Ficha
                            </Button>

                            {/* 'Info / Buy via WhatsApp' Primary Button */}
                            <a
                              href={buildWhatsAppLink(car)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex h-10 items-center justify-center gap-1.5 rounded-md bg-emerald-600 px-3 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-700 active:scale-[0.98]"
                            >
                              <MessageCircle className="h-4 w-4 fill-white text-emerald-600" />
                              <span>WhatsApp</span>
                            </a>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* ────────────────────────────────────────────────────── */}
      {/* VEHICLE TECHNICAL SPECIFICATIONS & FINANCE MODAL */}
      {/* ────────────────────────────────────────────────────── */}
      <Dialog
        open={Boolean(selectedVehicleForModal)}
        onOpenChange={(open) => !open && setSelectedVehicleForModal(null)}
      >
        <DialogContent className="!max-w-[1200px] !w-[96vw] sm:!w-[92vw] h-[92vh] lg:h-[85vh] overflow-y-auto lg:overflow-hidden bg-white p-0 rounded-2xl sm:rounded-3xl border-0 shadow-2xl">
          {selectedVehicleForModal && (
            <div className="flex flex-col lg:flex-row h-full w-full">
              
              {/* Left Column: Full height image */}
              <div className="relative w-full lg:w-[55%] h-56 sm:h-72 lg:h-full bg-slate-100 flex-shrink-0">
                <img
                  src={selectedVehicleForModal.images[0]}
                  alt={`${selectedVehicleForModal.brand} ${selectedVehicleForModal.model}`}
                  className="h-full w-full object-cover"
                />
              </div>

              {/* Right Column: Content with Tabs */}
              <div className="w-full lg:w-[45%] flex flex-col h-full bg-white font-sans">
                
                {/* Header Info (Fixed at top) */}
                <div className="p-4 sm:p-6 lg:p-10 pb-0 flex-shrink-0">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                    <Badge className="bg-slate-900 text-white font-bold text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-sm">
                      {selectedVehicleForModal.condition}
                    </Badge>
                    <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">
                      VIN: {selectedVehicleForModal.vin}
                    </span>
                  </div>
                  <h2 className="font-heading text-2xl sm:text-4xl lg:text-5xl font-extrabold text-slate-950 leading-tight tracking-tight">
                    {selectedVehicleForModal.brand}
                    <span className="block mt-0.5 sm:mt-1 text-slate-500 font-light text-lg sm:text-2xl lg:text-3xl tracking-normal">{selectedVehicleForModal.model} {selectedVehicleForModal.trim}</span>
                  </h2>
                  <p className="mt-2 sm:mt-3 text-xs font-bold tracking-widest text-slate-400 uppercase">{selectedVehicleForModal.year}</p>
                </div>

                <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10 pt-4 sm:pt-6 custom-scrollbar">
                  <Tabs defaultValue="resumen" className="w-full">
                    <TabsList className="w-full justify-start border-b border-slate-200 rounded-none bg-transparent p-0 mb-8 h-auto">
                      <TabsTrigger value="resumen" className="rounded-none border-b-2 border-transparent data-[state=active]:border-slate-900 data-[state=active]:bg-transparent data-[state=active]:text-slate-900 px-4 py-3 text-sm font-bold tracking-wider uppercase text-slate-500 transition-colors">Resumen</TabsTrigger>
                      <TabsTrigger value="ficha" className="rounded-none border-b-2 border-transparent data-[state=active]:border-slate-900 data-[state=active]:bg-transparent data-[state=active]:text-slate-900 px-4 py-3 text-sm font-bold tracking-wider uppercase text-slate-500 transition-colors">Ficha Técnica</TabsTrigger>
                      <TabsTrigger value="financiacion" className="rounded-none border-b-2 border-transparent data-[state=active]:border-slate-900 data-[state=active]:bg-transparent data-[state=active]:text-slate-900 px-4 py-3 text-sm font-bold tracking-wider uppercase text-slate-500 transition-colors">Financiación</TabsTrigger>
                    </TabsList>

                    <TabsContent value="resumen" className="space-y-10 mt-0 outline-none">
                      {/* Price CTA Box */}
                      <div className="pb-10 border-b border-slate-100">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Precio Total</span>
                        <div className="text-4xl font-extrabold text-slate-900 mb-6 font-heading tracking-tight">
                          {formatPrice(selectedVehicleForModal.price)}
                        </div>
                        <a
                          href={buildWhatsAppLink(selectedVehicleForModal)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex w-full items-center justify-center gap-3 bg-slate-950 px-6 py-4 text-sm font-bold text-white transition-all hover:bg-slate-800 hover:shadow-lg hover:-translate-y-0.5 rounded-sm"
                        >
                          <MessageCircle className="h-5 w-5" />
                          Agendar Test Drive Exclusivo
                        </a>
                      </div>

                      {/* Highlights */}
                      <div>
                         <h4 className="font-heading text-lg font-bold text-slate-900 mb-5">Equipamiento Destacado</h4>
                         <ul className="space-y-3">
                           {selectedVehicleForModal.keyFeatures.map((feat, idx) => (
                             <li key={idx} className="flex items-start gap-3 text-sm text-slate-600 font-medium">
                               <span className="mt-1.5 w-1.5 h-1.5 bg-emerald-600 rounded-full flex-shrink-0" />
                               <span className="leading-relaxed">{feat}</span>
                             </li>
                           ))}
                         </ul>
                      </div>
                    </TabsContent>

                    <TabsContent value="ficha" className="mt-0 outline-none">
                      <h4 className="font-heading text-lg font-bold text-slate-900 mb-6">Especificaciones Técnicas</h4>
                      <div className="space-y-0 text-sm">
                        <div className="flex justify-between items-center border-b border-slate-100 py-3.5 hover:bg-slate-50 px-2 transition-colors">
                          <span className="text-slate-500 font-medium">Motor</span>
                          <span className="font-bold text-slate-900 text-right">{selectedVehicleForModal.specs.engine}</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-slate-100 py-3.5 hover:bg-slate-50 px-2 transition-colors">
                          <span className="text-slate-500 font-medium">Potencia Máxima</span>
                          <span className="font-bold text-slate-900 text-right">{selectedVehicleForModal.specs.horsepower} HP</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-slate-100 py-3.5 hover:bg-slate-50 px-2 transition-colors">
                          <span className="text-slate-500 font-medium">Aceleración (0-100 km/h)</span>
                          <span className="font-bold text-slate-900 text-right">{selectedVehicleForModal.specs.acceleration}</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-slate-100 py-3.5 hover:bg-slate-50 px-2 transition-colors">
                          <span className="text-slate-500 font-medium">Sistema de Tracción</span>
                          <span className="font-bold text-slate-900 text-right">{selectedVehicleForModal.specs.traction}</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-slate-100 py-3.5 hover:bg-slate-50 px-2 transition-colors">
                          <span className="text-slate-500 font-medium">Transmisión</span>
                          <span className="font-bold text-slate-900 text-right">{selectedVehicleForModal.transmission}</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-slate-100 py-3.5 hover:bg-slate-50 px-2 transition-colors">
                          <span className="text-slate-500 font-medium">Kilometraje Certificado</span>
                          <span className="font-bold text-slate-900 text-right">{selectedVehicleForModal.mileage.toLocaleString()} km</span>
                        </div>
                        <div className="flex justify-between items-center py-3.5 hover:bg-slate-50 px-2 transition-colors">
                          <span className="text-slate-500 font-medium">Carrocería</span>
                          <span className="font-bold text-slate-900 text-right">{selectedVehicleForModal.bodyType}</span>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="financiacion" className="mt-0 outline-none">
                      <div className="bg-slate-50 p-6 sm:p-8 border border-slate-100 rounded-xl">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                          <h4 className="font-heading text-lg font-bold text-slate-900 flex items-center gap-2">
                            <Calculator className="h-5 w-5 text-slate-900" />
                            Simulador
                          </h4>
                          <span className="text-[10px] font-bold text-slate-500 tracking-widest uppercase border-b border-slate-300 pb-0.5">
                            Tasa Preferencial Aliada
                          </span>
                        </div>

                        <div className="space-y-8">
                          <div>
                            <div className="flex justify-between text-sm font-medium text-slate-600 mb-3">
                              <span>Cuota Inicial ({downPaymentPercent}%)</span>
                              <span className="font-bold text-slate-900">
                                {formatPrice(calculatedLoan.downPayment)}
                              </span>
                            </div>
                            <Slider
                              value={[downPaymentPercent]}
                              min={10}
                              max={60}
                              step={5}
                              onValueChange={(val) => {
                                const num = Array.isArray(val) ? val[0] : Number(val);
                                if (!isNaN(num)) setDownPaymentPercent(num);
                              }}
                              className="[&_[role=slider]]:bg-slate-900 [&_[role=slider]]:border-slate-900"
                            />
                          </div>

                          <div>
                            <div className="text-sm font-medium text-slate-600 mb-3">
                              <span>Plazo de Financiación</span>
                            </div>
                            <div className="flex gap-2 sm:gap-3">
                              {[24, 36, 48, 60].map((term) => (
                                <button
                                  key={term}
                                  onClick={() => setLoanTermMonths(term)}
                                  className={`flex-1 py-2 text-xs font-bold transition-all border rounded-md ${
                                    loanTermMonths === term
                                      ? "bg-slate-900 border-slate-900 text-white"
                                      : "bg-white border-slate-200 text-slate-500 hover:border-slate-400 hover:text-slate-900"
                                  }`}
                                >
                                  {term}m
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-6 border-t border-slate-200">
                            <span className="text-xs font-bold tracking-wider uppercase text-slate-400">
                              Cuota Estimada
                            </span>
                            <span className="font-heading text-2xl font-extrabold text-slate-900">
                              {formatPrice(calculatedLoan.monthlyQuota)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>

                  <div className="mt-8 flex justify-end">
                    <Button
                      variant="ghost"
                      onClick={() => setSelectedVehicleForModal(null)}
                      className="text-slate-400 hover:text-slate-900 hover:bg-transparent tracking-widest uppercase text-[10px] font-bold"
                    >
                      Cerrar Vista
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
        </>
      )}

      {/* ────────────────────────────────────────────────────── */}
      {/* SECCIÓN OFICIAL: YJD TRINOVA S.A.S. (PRESENTACIÓN & SERVICIOS) */}
      {/* ────────────────────────────────────────────────────── */}
      <section className="bg-slate-900 text-white py-16 px-4 sm:px-6 lg:px-8 mt-12 border-t border-slate-800">
        <div className="mx-auto max-w-[1400px]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Poster Image */}
            <div className="lg:col-span-4 flex justify-center">
              <div className="rounded-2xl overflow-hidden border border-slate-700 shadow-2xl max-w-xs w-full bg-slate-950">
                <img 
                  src="/yjd-trinova-poster.jpg" 
                  alt="Presentación Oficial YJD Trinova S.A.S." 
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>

            {/* Content & 6 Services */}
            <div className="lg:col-span-8 space-y-6">
              <div>
                <YjdTrinovaLogo size="lg" className="[&_span]:text-white [&_.text-zinc-900]:text-white" />
                <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white mt-3 font-heading">
                  Conectamos oportunidades, construimos futuro.
                </h2>
                <p className="text-slate-300 text-sm mt-2 max-w-2xl leading-relaxed">
                  Intermediación de confianza, corretaje mercantil notarial, peritaje automotriz y gestión inmobiliaria integral en Barranquilla y toda Colombia.
                </p>
              </div>

              {/* 6 Services Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 space-y-1">
                  <div className="flex items-center gap-2 font-bold text-amber-400">
                    <CarIcon className="w-4 h-4" />
                    <span>Venta de Vehículos</span>
                  </div>
                  <p className="text-slate-300 text-[11px]">
                    Compra, venta y permuta de vehículos nuevos y usados garantizados.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 space-y-1">
                  <div className="flex items-center gap-2 font-bold text-amber-400">
                    <Building2 className="w-4 h-4" />
                    <span>Bienes Raíces</span>
                  </div>
                  <p className="text-slate-300 text-[11px]">
                    Compra, venta y arriendo de lotes, casas, apartamentos y locales.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 space-y-1">
                  <div className="flex items-center gap-2 font-bold text-amber-400">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Peritajes y Evaluaciones</span>
                  </div>
                  <p className="text-slate-300 text-[11px]">
                    Peritaje de 150 puntos, historial de siniestros y estudio de títulos.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 space-y-1">
                  <div className="flex items-center gap-2 font-bold text-amber-400">
                    <Award className="w-4 h-4" />
                    <span>Trámites y Consultas</span>
                  </div>
                  <p className="text-slate-300 text-[11px]">
                    Impuestos, fotomultas, comparendos, traspasos y saneamiento.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 space-y-1">
                  <div className="flex items-center gap-2 font-bold text-amber-400">
                    <Zap className="w-4 h-4" />
                    <span>Marketing Digital</span>
                  </div>
                  <p className="text-slate-300 text-[11px]">
                    Estrategias de alto impacto para impulsar tu vehículo o propiedad.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 space-y-1">
                  <div className="flex items-center gap-2 font-bold text-amber-400">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Asesoría y Broker</span>
                  </div>
                  <p className="text-slate-300 text-[11px]">
                    Acompañamiento profesional en todo el proceso de negociación.
                  </p>
                </div>
              </div>

              {/* 4 Pillars & Contact Banner */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-800">
                <div className="flex items-center gap-4 text-xs font-semibold text-slate-300">
                  <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-amber-400" /> Seguridad</span>
                  <span className="flex items-center gap-1.5"><Award className="w-4 h-4 text-amber-400" /> Contratos</span>
                  <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-amber-400" /> Peritajes</span>
                  <span className="flex items-center gap-1.5"><Heart className="w-4 h-4 text-amber-400" /> Confianza</span>
                </div>

                <a
                  href="https://wa.me/573235845145?text=Hola%20YJD%20Trinova%2C%20deseo%20m%C3%A1s%20informaci%C3%B3n%20sobre%20sus%20servicios."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 text-xs font-bold transition shadow-lg shrink-0"
                >
                  <MessageCircle className="w-4 h-4 fill-white text-emerald-600" />
                  <span>Chatear por WhatsApp Oficial</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────── */}
      {/* CORPORATE TRUST FOOTER */}
      {/* ────────────────────────────────────────────────────── */}
      <footer className="border-t border-slate-200 bg-white py-12">
        <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-950 text-white shadow-xs">
                  {activeMarketplaceTab === "real_estate" ? (
                    <Building2 className="h-5 w-5 text-emerald-400" />
                  ) : (
                    <CarIcon className="h-5 w-5" />
                  )}
                </div>
                <div>
                  <span className="text-base font-bold text-slate-950 font-heading block">
                    {dealer.legalName || "YJD TRINOVA S.A.S."}
                  </span>
                  <span className="text-[11px] font-bold text-slate-600 block">
                    NIT {dealer.taxId || "902.095.222-8"}
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                {activeMarketplaceTab === "real_estate"
                  ? "Plataforma oficial de curaduría de bienes raíces prime, proyectos sobre planos, penthouses y residencias campestres en Colombia. Desarrollado y administrado por YJD TRINOVA S.A.S."
                  : "Plataforma corporativa de corretaje, compra, venta y retoma de vehículos seminuevos certificados con peritaje pericial. Operado por YJD TRINOVA S.A.S."}
              </p>
              <div className="text-xs text-slate-500 space-y-1 pt-1 font-medium">
                <p>📍 {dealer.address}, Barranquilla (Atlántico)</p>
                <p>💬 Canal Oficial WhatsApp 24/7</p>
                <p>✉️ {dealer.email || "contacto@yjdtrinova.com"}</p>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">
                {activeMarketplaceTab === "real_estate" ? "Garantías & Respaldo" : "Garantías & Servicios"}
              </h4>
              <ul className="space-y-2 text-xs text-slate-600">
                {activeMarketplaceTab === "real_estate" ? (
                  <>
                    <li className="flex items-center gap-1.5">
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                      Estudio de Títulos Jurídico 100%
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                      Fideicomisos & Fiducias Certificadas
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                      Simulación Hipotecaria en Tiempo Real
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                      Dossier y Planos en PDF al Instante
                    </li>
                  </>
                ) : (
                  <>
                    <li className="flex items-center gap-1.5">
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                      Inspección Técnica 150 Puntos
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                      Garantía Mecánica 12 Meses
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                      Financiación con 6 Bancos Aliados
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                      Retoma de Tu Vehículo Usado
                    </li>
                  </>
                )}
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">
                Ciudades & Cobertura
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-600">
                <li>• Barranquilla & Región Caribe</li>
                <li>• Bogotá D.C. (Chicó, Rosales, Santa Bárbara)</li>
                <li>• Medellín (El Poblado, Las Palmas, Laureles)</li>
                <li>• Cartagena (Castillogrande, Bocagrande)</li>
                <li>• Llanogrande & Cali (Ciudad Jardín)</li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">
                Atención Inmediata
              </h4>
              <p className="text-xs text-slate-600 mb-3">
                Asesoría personalizada y cotizaciones directas por WhatsApp.
              </p>
              <a
                href={`https://wa.me/${
                  activeMarketplaceTab === "real_estate" ? DEFAULT_AGENCY.whatsappPhone : dealer.whatsappPhone
                }?text=${encodeURIComponent(
                  activeMarketplaceTab === "real_estate"
                    ? `Hola ${DEFAULT_AGENCY.name}, deseo recibir asesoría para compra de finca raíz.`
                    : `Hola, deseo recibir asesoría para comprar un vehículo en ${dealer.name}.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition"
              >
                <MessageCircle className="h-4 w-4 fill-white text-emerald-600" />
                Contactar por WhatsApp
              </a>
            </div>
          </div>

          <div className="mt-8 border-t border-slate-100 pt-6 text-center text-xs text-slate-400">
            &copy; {new Date().getFullYear()}{" "}
            {dealer.legalName || "YJD TRINOVA S.A.S."} &bull; NIT {dealer.taxId || "902.095.222-8"} &bull; Todos los derechos reservados &bull; Barranquilla, Atlántico, Colombia.
          </div>
        </div>
      </footer>

      {/* Floating Sticky WhatsApp Button */}
      <a
        href={`https://wa.me/${
          activeMarketplaceTab === "real_estate" ? DEFAULT_AGENCY.whatsappPhone : dealer.whatsappPhone
        }?text=${encodeURIComponent(
          activeMarketplaceTab === "real_estate"
            ? `Hola ${DEFAULT_AGENCY.name}, estoy viendo las propiedades en el marketplace y deseo solicitar información.`
            : `Hola ${dealer.name}, estoy navegando en su catálogo y me gustaría hacer una consulta.`
        )}`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-white shadow-xl ring-4 ring-white transition hover:scale-105 hover:bg-emerald-700"
        title="Hablar por WhatsApp"
      >
        <MessageCircle className="h-7 w-7 fill-white text-emerald-600" />
        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
          1
        </span>
      </a>
    </div>
  );
}

