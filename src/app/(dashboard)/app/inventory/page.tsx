"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Vehicle,
  Property,
  getStoredVehicles,
  saveStoredVehicles,
  getStoredProperties,
  saveStoredProperties,
  SAMPLE_DEMO_VEHICLES,
  SAMPLE_DEMO_PROPERTIES,
  BODY_TYPES,
  PROPERTY_TYPES,
  OPERATION_TYPES,
  FUEL_TYPES,
  REGIONS_LIST,
  DEFAULT_DEALER,
  DEFAULT_AGENCY,
} from "@/lib/marketplace-mocks";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Car,
  Home,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Package,
  PackageX,
  ExternalLink,
  RefreshCw,
  Sparkles,
  CheckCircle2,
  Building2,
  DollarSign,
  MapPin,
  Image as ImageIcon,
  Key,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { toast } from "sonner";

export default function InventoryManagementPage() {
  const [activeTab, setActiveTab] = useState<"vehicles" | "properties">("vehicles");
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Todos");
  const [isLoaded, setIsLoaded] = useState(false);

  // Modals
  const [vehicleModalOpen, setVehicleModalOpen] = useState(false);
  const [propertyModalOpen, setPropertyModalOpen] = useState(false);
  const [editingVehicleId, setEditingVehicleId] = useState<string | null>(null);
  const [editingPropertyId, setEditingPropertyId] = useState<string | null>(null);

  // Form state for Vehicle / Moto
  const [vehicleForm, setVehicleForm] = useState<{
    brand: string;
    model: string;
    trim: string;
    year: number;
    price: number;
    mileage: number;
    fuelType: "Gasolina" | "Híbrido" | "Eléctrico" | "Diésel";
    transmission: "Automática" | "Secuencial / DCT" | "Manual";
    bodyType: string;
    city: string;
    exteriorColor: string;
    interiorColor: string;
    doors: number;
    condition: "Nuevo" | "Seminuevo Certificado" | "Usado Garantizado";
    badge: string;
    vin: string;
    plateEnding: string;
    imageUrl: string;
    engine: string;
    horsepower: number;
    keyFeatures: string;
  }>({
    brand: "",
    model: "",
    trim: "",
    year: new Date().getFullYear(),
    price: 0,
    mileage: 0,
    fuelType: "Gasolina",
    transmission: "Automática",
    bodyType: "SUV / Camioneta",
    city: "Barranquilla, Atlántico",
    exteriorColor: "Negro",
    interiorColor: "Cuero Negro",
    doors: 4,
    condition: "Seminuevo Certificado",
    badge: "Garantía Mecánica",
    vin: "",
    plateEnding: "Placa de Barranquilla",
    imageUrl: "",
    engine: "2.0L Turbo",
    horsepower: 180,
    keyFeatures: "Aire Acondicionado, Rines de Lujo, Pantalla Táctil, Sensores de Reversa",
  });

  // Form state for Property
  const [propertyForm, setPropertyForm] = useState<{
    title: string;
    propertyType: "Apartamento" | "Casa" | "Penthouse" | "Casa Campestre" | "Oficina / Local" | "Lote / Terreno" | "Bodega / Industrial";
    operationType: "Venta" | "Arriendo" | "Preventa / Sobre Planos";
    priceCop: number;
    city: string;
    neighborhood: string;
    addressBrief: string;
    badge: string;
    code: string;
    areaM2: number;
    lotAreaM2: number;
    bedrooms: number;
    bathrooms: number;
    parkingSpots: number;
    stratum: number;
    builtYear: number;
    adminFeeCop: number;
    imageUrl: string;
    amenities: string;
    description: string;
  }>({
    title: "",
    propertyType: "Apartamento",
    operationType: "Venta",
    priceCop: 0,
    city: "Barranquilla, Atlántico",
    neighborhood: "Villa Country",
    addressBrief: "Calle 79 con Carrera 53",
    badge: "Exclusivo",
    code: `YJD-RE-${Math.floor(100 + Math.random() * 900)}`,
    areaM2: 120,
    lotAreaM2: 0,
    bedrooms: 3,
    bathrooms: 2,
    parkingSpots: 2,
    stratum: 5,
    builtYear: new Date().getFullYear(),
    adminFeeCop: 450000,
    imageUrl: "",
    amenities: "Piscina, Seguridad 24/7, Gimnasio, Ascensor, Zona Infantil, BBQ",
    description: "Excelente propiedad con acabados de primera calidad, excelente iluminación y ubicación estratégica.",
  });

  // Load from storage on mount
  useEffect(() => {
    const loadedVehicles = getStoredVehicles();
    const loadedProps = getStoredProperties();
    setVehicles(loadedVehicles);
    setProperties(loadedProps);
    setIsLoaded(true);
  }, []);

  // Save changes
  const updateVehiclesState = (newList: Vehicle[]) => {
    setVehicles(newList);
    saveStoredVehicles(newList);
  };

  const updatePropertiesState = (newList: Property[]) => {
    setProperties(newList);
    saveStoredProperties(newList);
  };

  // Wipe whole database to 0
  const handleWipeDatabase = () => {
    if (window.confirm("¿Estás seguro de que deseas vaciar completamente la base de datos? Se borrarán todos los vehículos e inmuebles para dejarlos en 0.")) {
      updateVehiclesState([]);
      updatePropertiesState([]);
      toast.success("Base de datos vaciada con éxito. Ahora está lista para cargar datos reales.");
    }
  };

  // Restore sample demo data
  const handleLoadDemoData = () => {
    if (window.confirm("¿Deseas cargar los datos de demostración (12 autos y 6 inmuebles)?")) {
      updateVehiclesState(SAMPLE_DEMO_VEHICLES);
      updatePropertiesState(SAMPLE_DEMO_PROPERTIES);
      toast.success("Datos de demostración cargados exitosamente.");
    }
  };

  // Open Vehicle Modal for Create / Edit
  const handleOpenVehicleModal = (veh?: Vehicle) => {
    if (veh) {
      setEditingVehicleId(veh.id);
      setVehicleForm({
        brand: veh.brand,
        model: veh.model,
        trim: veh.trim || "",
        year: veh.year,
        price: veh.price,
        mileage: veh.mileage,
        fuelType: veh.fuelType,
        transmission: veh.transmission,
        bodyType: veh.bodyType,
        city: veh.city,
        exteriorColor: veh.exteriorColor,
        interiorColor: veh.interiorColor,
        doors: veh.doors,
        condition: veh.condition,
        badge: veh.badge || "Certificado",
        vin: veh.vin,
        plateEnding: veh.plateEnding || "",
        imageUrl: veh.images?.[0] || "",
        engine: veh.specs?.engine || "2.0L Turbo",
        horsepower: veh.specs?.horsepower || 180,
        keyFeatures: veh.keyFeatures?.join(", ") || "",
      });
    } else {
      setEditingVehicleId(null);
      setVehicleForm({
        brand: "",
        model: "",
        trim: "",
        year: new Date().getFullYear(),
        price: 0,
        mileage: 0,
        fuelType: "Gasolina",
        transmission: "Automática",
        bodyType: "SUV / Camioneta",
        city: "Barranquilla, Atlántico",
        exteriorColor: "Negro",
        interiorColor: "Cuero Negro",
        doors: 4,
        condition: "Seminuevo Certificado",
        badge: "Garantía Mecánica",
        vin: `VIN-${Math.floor(100000 + Math.random() * 900000)}`,
        plateEnding: "Placa terminada en 5",
        imageUrl: "",
        engine: "2.0L Turbo",
        horsepower: 180,
        keyFeatures: "Aire Acondicionado, Rines de Lujo, Pantalla Táctil, Sensores de Reversa",
      });
    }
    setVehicleModalOpen(true);
  };

  // Save Vehicle
  const handleSaveVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicleForm.brand || !vehicleForm.model || vehicleForm.price <= 0) {
      toast.error("Por favor completa la marca, modelo y precio del vehículo.");
      return;
    }

    const imagesList = vehicleForm.imageUrl.trim()
      ? vehicleForm.imageUrl.split(",").map((s) => s.trim()).filter(Boolean)
      : ["https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80"];

    const newVehicle: Vehicle = {
      id: editingVehicleId || `veh-${Date.now()}`,
      brand: vehicleForm.brand,
      model: vehicleForm.model,
      trim: vehicleForm.trim || undefined,
      year: Number(vehicleForm.year),
      price: Number(vehicleForm.price),
      currency: "COP",
      monthlyEstimate: Math.round(Number(vehicleForm.price) / 48),
      mileage: Number(vehicleForm.mileage),
      fuelType: vehicleForm.fuelType,
      transmission: vehicleForm.transmission,
      bodyType: vehicleForm.bodyType as any,
      region: "Barranquilla (Atlántico)",
      city: vehicleForm.city,
      exteriorColor: vehicleForm.exteriorColor,
      interiorColor: vehicleForm.interiorColor,
      doors: Number(vehicleForm.doors),
      condition: vehicleForm.condition,
      badge: (vehicleForm.badge as any) || undefined,
      featured: true,
      vin: vehicleForm.vin,
      plateEnding: vehicleForm.plateEnding,
      images: imagesList,
      specs: {
        engine: vehicleForm.engine,
        horsepower: Number(vehicleForm.horsepower),
        acceleration: "0-100 km/h: 7.2s",
        traction: "FWD",
      },
      keyFeatures: vehicleForm.keyFeatures.split(",").map((s) => s.trim()).filter(Boolean),
      inspectionScore: 98,
      dealer: DEFAULT_DEALER,
    };

    if (editingVehicleId) {
      const updated = vehicles.map((v) => (v.id === editingVehicleId ? newVehicle : v));
      updateVehiclesState(updated);
      toast.success("Vehículo actualizado correctamente.");
    } else {
      updateVehiclesState([newVehicle, ...vehicles]);
      toast.success("¡Vehículo / Moto agregado exitosamente al catálogo!");
    }
    setVehicleModalOpen(false);
  };

  // Delete Vehicle
  const handleDeleteVehicle = (id: string) => {
    if (window.confirm("¿Deseas eliminar este vehículo del inventario?")) {
      const updated = vehicles.filter((v) => v.id !== id);
      updateVehiclesState(updated);
      toast.info("Vehículo eliminado del inventario.");
    }
  };

  // Open Property Modal for Create / Edit
  const handleOpenPropertyModal = (prop?: Property) => {
    if (prop) {
      setEditingPropertyId(prop.id);
      setPropertyForm({
        title: prop.title,
        propertyType: prop.propertyType as any,
        operationType: prop.operationType,
        priceCop: prop.priceCop,
        city: prop.city,
        neighborhood: prop.neighborhood,
        addressBrief: prop.addressBrief,
        badge: prop.badge || "Exclusivo",
        code: prop.code,
        areaM2: prop.specs.areaM2,
        lotAreaM2: prop.specs.lotAreaM2 || 0,
        bedrooms: prop.specs.bedrooms,
        bathrooms: prop.specs.bathrooms,
        parkingSpots: prop.specs.parkingSpots,
        stratum: prop.specs.stratum,
        builtYear: prop.specs.builtYear,
        adminFeeCop: prop.specs.adminFeeCop || 0,
        imageUrl: prop.images?.[0] || "",
        amenities: prop.amenities?.join(", ") || "",
        description: prop.description,
      });
    } else {
      setEditingPropertyId(null);
      setPropertyForm({
        title: "",
        propertyType: "Apartamento",
        operationType: "Venta",
        priceCop: 0,
        city: "Barranquilla, Atlántico",
        neighborhood: "Villa Country",
        addressBrief: "Calle 79 con Carrera 53",
        badge: "Exclusivo",
        code: `YJD-RE-${Math.floor(100 + Math.random() * 900)}`,
        areaM2: 120,
        lotAreaM2: 0,
        bedrooms: 3,
        bathrooms: 2,
        parkingSpots: 2,
        stratum: 5,
        builtYear: new Date().getFullYear(),
        adminFeeCop: 450000,
        imageUrl: "",
        amenities: "Piscina, Seguridad 24/7, Gimnasio, Ascensor, Zona Infantil, BBQ",
        description: "Excelente propiedad con acabados de primera calidad, excelente iluminación y ubicación estratégica.",
      });
    }
    setPropertyModalOpen(true);
  };

  // Save Property
  const handleSaveProperty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!propertyForm.title || propertyForm.priceCop <= 0) {
      toast.error("Por favor completa el título y precio del inmueble.");
      return;
    }

    const imagesList = propertyForm.imageUrl.trim()
      ? propertyForm.imageUrl.split(",").map((s) => s.trim()).filter(Boolean)
      : ["https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80"];

    const newProperty: Property = {
      id: editingPropertyId || `prop-${Date.now()}`,
      title: propertyForm.title,
      propertyType: propertyForm.propertyType as any,
      operationType: propertyForm.operationType,
      priceCop: Number(propertyForm.priceCop),
      monthlyEstimateCop: Math.round(Number(propertyForm.priceCop) * 0.008),
      region: "Barranquilla (Atlántico)",
      city: propertyForm.city,
      neighborhood: propertyForm.neighborhood,
      addressBrief: propertyForm.addressBrief,
      badge: (propertyForm.badge as any) || undefined,
      featured: true,
      code: propertyForm.code,
      images: imagesList,
      specs: {
        areaM2: Number(propertyForm.areaM2),
        lotAreaM2: propertyForm.lotAreaM2 ? Number(propertyForm.lotAreaM2) : undefined,
        bedrooms: Number(propertyForm.bedrooms),
        bathrooms: Number(propertyForm.bathrooms),
        parkingSpots: Number(propertyForm.parkingSpots),
        stratum: Number(propertyForm.stratum),
        builtYear: Number(propertyForm.builtYear),
        adminFeeCop: Number(propertyForm.adminFeeCop),
      },
      amenities: propertyForm.amenities.split(",").map((s) => s.trim()).filter(Boolean),
      description: propertyForm.description,
      agency: DEFAULT_AGENCY,
    };

    if (editingPropertyId) {
      const updated = properties.map((p) => (p.id === editingPropertyId ? newProperty : p));
      updatePropertiesState(updated);
      toast.success("Inmueble actualizado correctamente.");
    } else {
      updatePropertiesState([newProperty, ...properties]);
      toast.success("¡Propiedad agregada exitosamente al catálogo!");
    }
    setPropertyModalOpen(false);
  };

  // Delete Property
  const handleDeleteProperty = (id: string) => {
    if (window.confirm("¿Deseas eliminar este inmueble del inventario?")) {
      const updated = properties.filter((p) => p.id !== id);
      updatePropertiesState(updated);
      toast.info("Inmueble eliminado del inventario.");
    }
  };

  // Filtered lists
  const filteredVehicles = useMemo(() => {
    return vehicles.filter((v) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const text = `${v.brand} ${v.model} ${v.year} ${v.vin} ${v.city}`.toLowerCase();
        if (!text.includes(q)) return false;
      }
      if (categoryFilter !== "Todos" && v.bodyType !== categoryFilter) {
        return false;
      }
      return true;
    });
  }, [vehicles, searchQuery, categoryFilter]);

  const filteredProperties = useMemo(() => {
    return properties.filter((p) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const text = `${p.title} ${p.neighborhood} ${p.city} ${p.code} ${p.propertyType}`.toLowerCase();
        if (!text.includes(q)) return false;
      }
      if (categoryFilter !== "Todos" && p.propertyType !== categoryFilter) {
        return false;
      }
      return true;
    });
  }, [properties, searchQuery, categoryFilter]);

  // Format currency helpers
  const formatCop = (val: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
    }).format(val);
  };

  if (!isLoaded) return null;

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16">
      {/* ────────────────────────────────────────────────────── */}
      {/* HEADER & DATABASE CONTROL BAR */}
      {/* ────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
              YJD TRINOVA S.A.S. • NIT 902.095.222-8
            </span>
            <Badge className="bg-emerald-100 text-emerald-800 border-none font-bold text-[10px]">
              🟢 Base de Datos Activa
            </Badge>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-950 font-heading mt-1">
            Gestión Central de Inventario
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Carga y administra tus carros, motos y propiedades reales para el marketplace.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center flex-wrap gap-2.5">
          <Button
            variant="outline"
            onClick={handleWipeDatabase}
            className="border-red-200 text-red-700 hover:bg-red-50 hover:border-red-300 text-xs font-bold rounded-xl"
            title="Vaciar todos los registros para empezar en 0"
          >
            <Trash2 className="mr-1.5 h-3.5 w-3.5 text-red-600" />
            Vaciar Base de Datos (0)
          </Button>

          <Button
            variant="outline"
            onClick={handleLoadDemoData}
            className="border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold rounded-xl"
            title="Restaurar ejemplos de prueba"
          >
            <RefreshCw className="mr-1.5 h-3.5 w-3.5 text-slate-500" />
            Cargar Ejemplos
          </Button>

          {activeTab === "vehicles" ? (
            <Button
              onClick={() => handleOpenVehicleModal()}
              className="bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md px-4"
            >
              <Plus className="mr-1.5 h-4 w-4" />
              Agregar Vehículo / Moto
            </Button>
          ) : (
            <Button
              onClick={() => handleOpenPropertyModal()}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md px-4"
            >
              <Plus className="mr-1.5 h-4 w-4" />
              Agregar Inmueble
            </Button>
          )}
        </div>
      </div>

      {/* ────────────────────────────────────────────────────── */}
      {/* KPI METRIC CARDS */}
      {/* ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white border-slate-200 p-5 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Vehículos & Motos</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-800">
              <Car className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-950 font-heading mt-2">{vehicles.length}</div>
          <p className="text-[11px] text-slate-400 mt-1">Carros, motos y camionetas activas</p>
        </Card>

        <Card className="bg-white border-slate-200 p-5 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Bienes Raíces</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              <Building2 className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-950 font-heading mt-2">{properties.length}</div>
          <p className="text-[11px] text-slate-400 mt-1">Casas, apartamentos y lotes</p>
        </Card>

        <Card className="bg-white border-slate-200 p-5 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Portal Público</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
              <ExternalLink className="h-4 w-4" />
            </div>
          </div>
          <div className="text-sm font-bold text-slate-950 truncate mt-2">yjdtrinova.neurolabs.com.co</div>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">Sincronización en tiempo real</p>
        </Card>

        <Card className="bg-white border-slate-200 p-5 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Estado de Datos</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            </div>
          </div>
          <div className="text-base font-extrabold text-slate-900 mt-2">
            {vehicles.length === 0 && properties.length === 0 ? "0 Registros (Limpia)" : `${vehicles.length + properties.length} Registros`}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Listo para tus datos reales</p>
        </Card>
      </div>

      {/* ────────────────────────────────────────────────────── */}
      {/* MODULE TABS: VEHICLES VS PROPERTIES */}
      {/* ────────────────────────────────────────────────────── */}
      <Tabs value={activeTab} onValueChange={(val: any) => { setActiveTab(val); setCategoryFilter("Todos"); }} className="w-full space-y-6">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <TabsList className="bg-slate-100 p-1 rounded-2xl h-12 w-full sm:w-auto grid grid-cols-2">
            <TabsTrigger value="vehicles" className="rounded-xl text-xs font-bold gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <Car className="h-4 w-4" />
              <span>Vehículos & Motos ({vehicles.length})</span>
            </TabsTrigger>
            <TabsTrigger value="properties" className="rounded-xl text-xs font-bold gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <Building2 className="h-4 w-4 text-emerald-600" />
              <span>Bienes Raíces ({properties.length})</span>
            </TabsTrigger>
          </TabsList>

          {/* Search & Filter Bar */}
          <div className="flex items-center gap-2 flex-1 max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder={activeTab === "vehicles" ? "Buscar por marca, modelo o VIN..." : "Buscar por título, barrio o código..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 text-xs bg-white border-slate-200 rounded-xl h-11"
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-700 font-semibold focus:outline-none"
            >
              <option value="Todos">Todas las categorías</option>
              {activeTab === "vehicles"
                ? BODY_TYPES.filter((t) => t !== "Todos").map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))
                : PROPERTY_TYPES.filter((t) => t !== "Todos").map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
            </select>
          </div>
        </div>

        {/* ────────────────────────────────────────────────────── */}
        {/* TAB 1: VEHICLES & MOTOS */}
        {/* ────────────────────────────────────────────────────── */}
        <TabsContent value="vehicles" className="space-y-6 mt-0">
          {filteredVehicles.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 text-slate-400">
                <Car className="h-8 w-8 text-slate-300" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 font-heading">
                {vehicles.length === 0 ? "No hay vehículos ni motos cargados" : "No hay resultados para esta búsqueda"}
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                {vehicles.length === 0
                  ? "Tu catálogo de vehículos está listo y vacío. Agrega tus primeros carros, motos o camionetas con fotos y especificaciones reales."
                  : "Prueba cambiando el término de búsqueda o seleccionando otra categoría."}
              </p>
              <div className="pt-2 flex justify-center gap-3">
                <Button
                  onClick={() => handleOpenVehicleModal()}
                  className="bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md px-5"
                >
                  <Plus className="mr-1.5 h-4 w-4" />
                  Agregar Primer Vehículo / Moto
                </Button>
                {vehicles.length === 0 && (
                  <Button
                    variant="outline"
                    onClick={handleLoadDemoData}
                    className="border-slate-300 text-slate-700 text-xs font-semibold rounded-xl"
                  >
                    <RefreshCw className="mr-1.5 h-3.5 w-3.5" /> Cargar Ejemplos
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredVehicles.map((car) => (
                <Card
                  key={car.id}
                  className="bg-white border-slate-200/90 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between !p-0 !pt-0 gap-0"
                >
                  <div className="relative h-48 w-full bg-slate-900 overflow-hidden rounded-t-2xl">
                    <img
                      src={car.images[0]}
                      alt={`${car.brand} ${car.model}`}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute top-2.5 left-2.5 flex gap-1.5">
                      <Badge className="bg-slate-950/90 text-white font-bold text-[10px]">
                        {car.year}
                      </Badge>
                      <Badge className="bg-emerald-600 text-white font-bold text-[10px]">
                        {car.bodyType}
                      </Badge>
                    </div>
                  </div>

                  <CardContent className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        VIN: {car.vin} &bull; {car.city}
                      </div>
                      <h3 className="text-lg font-extrabold text-slate-950 font-heading mt-0.5">
                        {car.brand} {car.model}
                      </h3>
                      {car.trim && <p className="text-xs text-slate-500 font-medium">{car.trim}</p>}
                    </div>

                    <div className="grid grid-cols-3 gap-1.5 bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-center text-xs">
                      <div>
                        <span className="text-[9px] text-slate-400 block font-bold uppercase">KM</span>
                        <span className="font-bold text-slate-900">{car.mileage.toLocaleString()} km</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 block font-bold uppercase">Motor</span>
                        <span className="font-bold text-slate-900">{car.fuelType}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 block font-bold uppercase">Caja</span>
                        <span className="font-bold text-slate-900">{car.transmission.split(" ")[0]}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="text-[9px] text-slate-400 font-bold uppercase block">Precio</span>
                        <span className="text-lg font-black text-slate-950 font-heading">
                          {formatCop(car.price)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenVehicleModal(car)}
                          className="h-8 rounded-lg text-xs font-bold px-2.5"
                        >
                          <Edit className="h-3.5 w-3.5 mr-1" /> Editar
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteVehicle(car.id)}
                          className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 rounded-lg"
                          title="Eliminar"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ────────────────────────────────────────────────────── */}
        {/* TAB 2: REAL ESTATE & PROPERTIES */}
        {/* ────────────────────────────────────────────────────── */}
        <TabsContent value="properties" className="space-y-6 mt-0">
          {filteredProperties.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-500">
                <Building2 className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 font-heading">
                {properties.length === 0 ? "No hay inmuebles ni propiedades cargadas" : "No hay resultados para esta búsqueda"}
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                {properties.length === 0
                  ? "Tu catálogo de bienes raíces está listo y vacío. Agrega tus primeras casas, apartamentos, penthouses o lotes reales."
                  : "Prueba cambiando el término de búsqueda o seleccionando otro tipo de inmueble."}
              </p>
              <div className="pt-2 flex justify-center gap-3">
                <Button
                  onClick={() => handleOpenPropertyModal()}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md px-5"
                >
                  <Plus className="mr-1.5 h-4 w-4" />
                  Agregar Primer Inmueble
                </Button>
                {properties.length === 0 && (
                  <Button
                    variant="outline"
                    onClick={handleLoadDemoData}
                    className="border-slate-300 text-slate-700 text-xs font-semibold rounded-xl"
                  >
                    <RefreshCw className="mr-1.5 h-3.5 w-3.5" /> Cargar Ejemplos
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProperties.map((prop) => (
                <Card
                  key={prop.id}
                  className="bg-white border-slate-200/90 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between !p-0 !pt-0 gap-0"
                >
                  <div className="relative h-48 w-full bg-slate-900 overflow-hidden rounded-t-2xl">
                    <img
                      src={prop.images[0]}
                      alt={prop.title}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute top-2.5 left-2.5 flex gap-1.5">
                      <Badge className="bg-slate-950/90 text-white font-bold text-[10px]">
                        {prop.operationType}
                      </Badge>
                      <Badge className="bg-emerald-600 text-white font-bold text-[10px]">
                        {prop.propertyType}
                      </Badge>
                    </div>
                  </div>

                  <CardContent className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        {prop.code} &bull; {prop.neighborhood}, {prop.city}
                      </div>
                      <h3 className="text-base font-extrabold text-slate-950 font-heading mt-0.5 line-clamp-2">
                        {prop.title}
                      </h3>
                    </div>

                    <div className="grid grid-cols-4 gap-1.5 bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-center text-xs">
                      <div>
                        <span className="text-[9px] text-slate-400 block font-bold uppercase">Área</span>
                        <span className="font-bold text-slate-900">{prop.specs.areaM2} m²</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 block font-bold uppercase">Hab.</span>
                        <span className="font-bold text-slate-900">{prop.specs.bedrooms}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 block font-bold uppercase">Baños</span>
                        <span className="font-bold text-slate-900">{prop.specs.bathrooms}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 block font-bold uppercase">Parq.</span>
                        <span className="font-bold text-slate-900">{prop.specs.parkingSpots}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="text-[9px] text-slate-400 font-bold uppercase block">Precio</span>
                        <span className="text-lg font-black text-slate-950 font-heading">
                          {formatCop(prop.priceCop)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenPropertyModal(prop)}
                          className="h-8 rounded-lg text-xs font-bold px-2.5"
                        >
                          <Edit className="h-3.5 w-3.5 mr-1" /> Editar
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteProperty(prop.id)}
                          className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 rounded-lg"
                          title="Eliminar"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* ────────────────────────────────────────────────────── */}
      {/* MODAL: AGREGAR / EDITAR VEHÍCULO O MOTO */}
      {/* ────────────────────────────────────────────────────── */}
      <Dialog open={vehicleModalOpen} onOpenChange={setVehicleModalOpen}>
        <DialogContent className="!max-w-2xl !w-[95vw] max-h-[90vh] overflow-y-auto bg-white p-6 sm:p-8 rounded-3xl border-slate-200 shadow-2xl">
          <DialogHeader className="border-b border-slate-100 pb-4 text-left">
            <DialogTitle className="text-xl font-bold font-heading text-slate-950">
              {editingVehicleId ? "Editar Vehículo / Moto" : "Agregar Nuevo Vehículo o Moto"}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Ingresa los datos técnicos y fotos reales. Aparecerá inmediatamente en el portal público.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveVehicle} className="space-y-4 py-3 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-800">Tipo de Vehículo *</Label>
                <select
                  value={vehicleForm.bodyType}
                  onChange={(e) => setVehicleForm({ ...vehicleForm, bodyType: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-800 font-medium"
                >
                  <option value="SUV / Camioneta">SUV / Camioneta</option>
                  <option value="Sedán">Sedán</option>
                  <option value="Moto / Motocicleta">Moto / Motocicleta</option>
                  <option value="Pickup">Pickup</option>
                  <option value="Hatchback">Hatchback</option>
                  <option value="Coupe">Coupe</option>
                  <option value="Convertible">Convertible</option>
                  <option value="Camión / Utilitario">Camión / Utilitario</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-800">Condición *</Label>
                <select
                  value={vehicleForm.condition}
                  onChange={(e: any) => setVehicleForm({ ...vehicleForm, condition: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-800 font-medium"
                >
                  <option value="Nuevo">Nuevo (0 KM)</option>
                  <option value="Seminuevo Certificado">Seminuevo Certificado</option>
                  <option value="Usado Garantizado">Usado Garantizado</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-800">Marca *</Label>
                <Input
                  placeholder="Ej. Toyota, Yamaha, Mazda"
                  value={vehicleForm.brand}
                  onChange={(e) => setVehicleForm({ ...vehicleForm, brand: e.target.value })}
                  className="rounded-xl text-xs bg-slate-50"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-800">Modelo / Línea *</Label>
                <Input
                  placeholder="Ej. Fortuner, MT-09, CX-30"
                  value={vehicleForm.model}
                  onChange={(e) => setVehicleForm({ ...vehicleForm, model: e.target.value })}
                  className="rounded-xl text-xs bg-slate-50"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-800">Año *</Label>
                <Input
                  type="number"
                  placeholder="2024"
                  value={vehicleForm.year}
                  onChange={(e) => setVehicleForm({ ...vehicleForm, year: Number(e.target.value) })}
                  className="rounded-xl text-xs bg-slate-50"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-800">Precio Total (COP) *</Label>
                <Input
                  type="number"
                  placeholder="Ej. 145000000"
                  value={vehicleForm.price || ""}
                  onChange={(e) => setVehicleForm({ ...vehicleForm, price: Number(e.target.value) })}
                  className="rounded-xl text-xs bg-slate-50 font-bold"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-800">Kilometraje (km) *</Label>
                <Input
                  type="number"
                  placeholder="Ej. 18500"
                  value={vehicleForm.mileage}
                  onChange={(e) => setVehicleForm({ ...vehicleForm, mileage: Number(e.target.value) })}
                  className="rounded-xl text-xs bg-slate-50"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-800">Combustible *</Label>
                <select
                  value={vehicleForm.fuelType}
                  onChange={(e: any) => setVehicleForm({ ...vehicleForm, fuelType: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-800 font-medium"
                >
                  <option value="Gasolina">Gasolina</option>
                  <option value="Diésel">Diésel</option>
                  <option value="Híbrido">Híbrido</option>
                  <option value="Eléctrico">Eléctrico</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-800">Transmisión</Label>
                <select
                  value={vehicleForm.transmission}
                  onChange={(e: any) => setVehicleForm({ ...vehicleForm, transmission: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-800 font-medium"
                >
                  <option value="Automática">Automática</option>
                  <option value="Manual">Manual</option>
                  <option value="Secuencial / DCT">Secuencial / DCT</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-800">Ciudad / Ubicación</Label>
                <Input
                  placeholder="Barranquilla, Atlántico"
                  value={vehicleForm.city}
                  onChange={(e) => setVehicleForm({ ...vehicleForm, city: e.target.value })}
                  className="rounded-xl text-xs bg-slate-50"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-800">Placa / Detalle</Label>
                <Input
                  placeholder="Ej. Placa terminada en 8"
                  value={vehicleForm.plateEnding}
                  onChange={(e) => setVehicleForm({ ...vehicleForm, plateEnding: e.target.value })}
                  className="rounded-xl text-xs bg-slate-50"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-800">
                URL de la Imagen Principal o Múltiples (separadas por coma) *
              </Label>
              <Input
                placeholder="https://images.unsplash.com/... o enlace de la foto"
                value={vehicleForm.imageUrl}
                onChange={(e) => setVehicleForm({ ...vehicleForm, imageUrl: e.target.value })}
                className="rounded-xl text-xs bg-slate-50"
              />
              {vehicleForm.imageUrl && (
                <div className="mt-2 h-28 w-44 rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                  <img
                    src={vehicleForm.imageUrl.split(",")[0].trim()}
                    alt="Vista previa"
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-800">
                Equipamiento & Características Clave (separadas por coma)
              </Label>
              <Input
                placeholder="Ej. Frenos ABS, Suspensión Invertida, Techo Panorámico, Pantalla Apple CarPlay"
                value={vehicleForm.keyFeatures}
                onChange={(e) => setVehicleForm({ ...vehicleForm, keyFeatures: e.target.value })}
                className="rounded-xl text-xs bg-slate-50"
              />
            </div>

            <DialogFooter className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setVehicleModalOpen(false)}
                className="rounded-xl text-xs"
              >
                Cancelar
              </Button>
              <Button type="submit" className="bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs rounded-xl">
                {editingVehicleId ? "Guardar Cambios" : "Publicar Vehículo / Moto"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ────────────────────────────────────────────────────── */}
      {/* MODAL: AGREGAR / EDITAR INMUEBLE */}
      {/* ────────────────────────────────────────────────────── */}
      <Dialog open={propertyModalOpen} onOpenChange={setPropertyModalOpen}>
        <DialogContent className="!max-w-2xl !w-[95vw] max-h-[90vh] overflow-y-auto bg-white p-6 sm:p-8 rounded-3xl border-slate-200 shadow-2xl">
          <DialogHeader className="border-b border-slate-100 pb-4 text-left">
            <DialogTitle className="text-xl font-bold font-heading text-slate-950">
              {editingPropertyId ? "Editar Inmueble" : "Agregar Nuevo Inmueble"}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Registra casas, apartamentos, penthouses o lotes para la división de Bienes Raíces.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveProperty} className="space-y-4 py-3 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-800">Tipo de Inmueble *</Label>
                <select
                  value={propertyForm.propertyType}
                  onChange={(e: any) => setPropertyForm({ ...propertyForm, propertyType: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-800 font-medium"
                >
                  <option value="Apartamento">Apartamento</option>
                  <option value="Casa">Casa</option>
                  <option value="Penthouse">Penthouse</option>
                  <option value="Casa Campestre">Casa Campestre</option>
                  <option value="Oficina / Local">Oficina / Local</option>
                  <option value="Lote / Terreno">Lote / Terreno</option>
                  <option value="Bodega / Industrial">Bodega / Industrial</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-800">Operación *</Label>
                <select
                  value={propertyForm.operationType}
                  onChange={(e: any) => setPropertyForm({ ...propertyForm, operationType: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-800 font-medium"
                >
                  <option value="Venta">Venta</option>
                  <option value="Arriendo">Arriendo</option>
                  <option value="Preventa / Sobre Planos">Preventa / Sobre Planos</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-800">Título Comercial *</Label>
              <Input
                placeholder="Ej. Espectacular Penthouse Dúplex con Vista al Mar"
                value={propertyForm.title}
                onChange={(e) => setPropertyForm({ ...propertyForm, title: e.target.value })}
                className="rounded-xl text-xs bg-slate-50 font-medium"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-800">Precio Total (COP) *</Label>
                <Input
                  type="number"
                  placeholder="Ej. 650000000"
                  value={propertyForm.priceCop || ""}
                  onChange={(e) => setPropertyForm({ ...propertyForm, priceCop: Number(e.target.value) })}
                  className="rounded-xl text-xs bg-slate-50 font-bold"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-800">Ciudad *</Label>
                <Input
                  placeholder="Barranquilla, Atlántico"
                  value={propertyForm.city}
                  onChange={(e) => setPropertyForm({ ...propertyForm, city: e.target.value })}
                  className="rounded-xl text-xs bg-slate-50"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-800">Barrio / Sector *</Label>
                <Input
                  placeholder="Ej. Villa Country, El Prado"
                  value={propertyForm.neighborhood}
                  onChange={(e) => setPropertyForm({ ...propertyForm, neighborhood: e.target.value })}
                  className="rounded-xl text-xs bg-slate-50"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-800">Área (m²) *</Label>
                <Input
                  type="number"
                  placeholder="140"
                  value={propertyForm.areaM2}
                  onChange={(e) => setPropertyForm({ ...propertyForm, areaM2: Number(e.target.value) })}
                  className="rounded-xl text-xs bg-slate-50"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-800">Habitaciones</Label>
                <Input
                  type="number"
                  placeholder="3"
                  value={propertyForm.bedrooms}
                  onChange={(e) => setPropertyForm({ ...propertyForm, bedrooms: Number(e.target.value) })}
                  className="rounded-xl text-xs bg-slate-50"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-800">Baños</Label>
                <Input
                  type="number"
                  placeholder="2"
                  value={propertyForm.bathrooms}
                  onChange={(e) => setPropertyForm({ ...propertyForm, bathrooms: Number(e.target.value) })}
                  className="rounded-xl text-xs bg-slate-50"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-800">Parqueaderos</Label>
                <Input
                  type="number"
                  placeholder="2"
                  value={propertyForm.parkingSpots}
                  onChange={(e) => setPropertyForm({ ...propertyForm, parkingSpots: Number(e.target.value) })}
                  className="rounded-xl text-xs bg-slate-50"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-800">
                URL de la Foto Principal (o separadas por coma) *
              </Label>
              <Input
                placeholder="https://images.unsplash.com/... o enlace de la foto"
                value={propertyForm.imageUrl}
                onChange={(e) => setPropertyForm({ ...propertyForm, imageUrl: e.target.value })}
                className="rounded-xl text-xs bg-slate-50"
              />
              {propertyForm.imageUrl && (
                <div className="mt-2 h-28 w-44 rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                  <img
                    src={propertyForm.imageUrl.split(",")[0].trim()}
                    alt="Vista previa"
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-800">
                Amenidades (separadas por coma)
              </Label>
              <Input
                placeholder="Piscina, Gimnasio, Ascensor Privado, Seguridad 24/7, Terraza BBQ"
                value={propertyForm.amenities}
                onChange={(e) => setPropertyForm({ ...propertyForm, amenities: e.target.value })}
                className="rounded-xl text-xs bg-slate-50"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-800">Descripción Completa</Label>
              <Textarea
                rows={3}
                placeholder="Detalla las características principales del inmueble..."
                value={propertyForm.description}
                onChange={(e) => setPropertyForm({ ...propertyForm, description: e.target.value })}
                className="rounded-xl text-xs bg-slate-50"
              />
            </div>

            <DialogFooter className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setPropertyModalOpen(false)}
                className="rounded-xl text-xs"
              >
                Cancelar
              </Button>
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl">
                {editingPropertyId ? "Guardar Cambios" : "Publicar Inmueble"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}


