"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Car, Home, Plus, Search, Filter, Edit, Trash2,
  ExternalLink, RefreshCw, CheckCircle2, Building2,
  DollarSign, MapPin, Image as ImageIcon, ShieldCheck,
  Phone, Eye, Layers, Video
} from "lucide-react";
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
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

export interface DBInventoryItem {
  id: string;
  tenant_id?: string;
  category_type: "VEHICULO" | "MOTO" | "INMUEBLE_VENTA" | "INMUEBLE_RENTA";
  title: string;
  brand: string;
  model: string;
  year: number;
  price_cop: number;
  monthly_rent_cop?: number;
  mileage?: number;
  fuel_type?: string;
  transmission?: string;
  license_plate?: string;
  exterior_color?: string;
  area_m2?: number;
  bedrooms?: number;
  bathrooms?: number;
  city: string;
  neighborhood?: string;
  images?: string[];
  video_url?: string;
  description?: string;
  status: "DISPONIBLE" | "RESERVADO" | "VENDIDO" | "RENTADO";
  created_at?: string;
  tenants?: { name: string; slug: string };
  contacts?: { full_name: string; phone: string };
}

export default function InventoryManagementPage() {
  const supabase = createClient();

  const [items, setItems] = useState<DBInventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedTenant, setSelectedTenant] = useState<string>("ALL");

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<DBInventoryItem | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Form State for new item
  const [formCategory, setFormCategory] = useState<DBInventoryItem["category_type"]>("VEHICULO");
  const [formTitle, setFormTitle] = useState("");
  const [formBrand, setFormBrand] = useState("");
  const [formModel, setFormModel] = useState("");
  const [formYear, setFormYear] = useState(new Date().getFullYear());
  const [formPriceCop, setFormPriceCop] = useState(0);
  const [formCity, setFormCity] = useState("Barranquilla");
  const [formMileage, setFormMileage] = useState(0);
  const [formPlate, setFormPlate] = useState("");
  const [formImages, setFormImages] = useState("");
  const [formVideoUrl, setFormVideoUrl] = useState("");
  const [formDesc, setFormDesc] = useState("");

  // Fetch real items from Supabase via server API route
  const fetchInventory = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/inventory");
      if (res.ok) {
        const json = await res.json();
        if (json.items) {
          setItems(json.items as DBInventoryItem[]);
        }
      }
    } catch (err) {
      console.error("Error fetching inventory:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesSearch = 
        item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.model?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.license_plate?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCat = selectedCategory === "ALL" || item.category_type === selectedCategory;
      const matchesTenant = selectedTenant === "ALL" || item.tenants?.slug === selectedTenant;

      return matchesSearch && matchesCat && matchesTenant;
    });
  }, [items, searchQuery, selectedCategory, selectedTenant]);

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle || formPriceCop <= 0) {
      toast.error("Por favor ingresa título y precio válido en COP");
      return;
    }

    try {
      const parsedImages = formImages.split(",").map(s => s.trim()).filter(Boolean);

      const newItemPayload = {
        tenant_slug: "yjdtrinova",
        category_type: formCategory,
        title: formTitle,
        brand: formBrand || "Trinova",
        model: formModel || "General",
        year: Number(formYear) || new Date().getFullYear(),
        price_cop: Number(formPriceCop),
        city: formCity,
        mileage: Number(formMileage) || 0,
        license_plate: formPlate || null,
        images: parsedImages,
        video_url: formVideoUrl || null,
        description: formDesc,
        status: "DISPONIBLE"
      };

      const res = await fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newItemPayload),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        toast.error(`Error guardando en base de datos: ${json.error || "Error desconocido"}`);
      } else {
        toast.success("Bien guardado exitosamente en la base de datos de Trinova");
        if (json.item) setItems([json.item as DBInventoryItem, ...items]);
        setIsCreateModalOpen(false);
        setFormTitle("");
        setFormBrand("");
        setFormModel("");
        setFormPriceCop(0);
        setFormPlate("");
        setFormImages("");
        setFormVideoUrl("");
        setFormDesc("");
        fetchInventory();
      }
    } catch (err: any) {
      toast.error("Error al conectar con el servidor.");
    }
  };
        setFormPriceCop(0);
        setFormImages("");
        setFormVideoUrl("");
        setFormDesc("");
      }
    } catch (err: any) {
      toast.error("Error al conectar con la base de datos");
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!window.confirm("¿Seguro que deseas eliminar este bien del inventario central de la base de datos?")) return;

    try {
      const { error } = await supabase
        .from("inventory_items")
        .delete()
        .eq("id", id);

      if (error) {
        toast.error(`Error al eliminar: ${error.message}`);
      } else {
        setItems(prev => prev.filter(i => i.id !== id));
        toast.success("Ítem eliminado de la base de datos");
      }
    } catch (e) {
      toast.error("Error eliminando ítem");
    }
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      {/* ─── Compact Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-zinc-200/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-zinc-900 tracking-tight">Inventario Central & Portafolio (Supabase DB)</h1>
            <Badge variant="outline" className="text-xs bg-zinc-100 text-zinc-700 font-semibold rounded-md border-zinc-200">
              {filteredItems.length} Registrados
            </Badge>
          </div>
          <p className="text-xs text-zinc-500 mt-0.5">Control exclusivo por empresa · Carros, Motos e Inmuebles en Pesos Colombianos (COP)</p>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            onClick={fetchInventory}
            variant="outline"
            size="sm"
            className="h-8 text-xs border-zinc-200 px-2.5 gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Sincronizar DB</span>
          </Button>

          <Button 
            onClick={() => setIsCreateModalOpen(true)}
            size="sm"
            className="h-8 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold rounded-lg px-3 gap-1.5 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Cargar Bien</span>
          </Button>
        </div>
      </div>

      {/* ─── Compact Search & Filters ─── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 text-xs">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-zinc-400" />
          <Input 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por marca, modelo, placa, ciudad..."
            className="h-8 pl-8 text-xs border-zinc-200 bg-white rounded-lg focus-visible:ring-zinc-900"
          />
        </div>

        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: "ALL", label: "Todos" },
            { id: "VEHICULO", label: "Carros" },
            { id: "MOTO", label: "Motos" },
            { id: "INMUEBLE_VENTA", label: "Inmuebles Venta" },
            { id: "INMUEBLE_RENTA", label: "Inmuebles Renta" },
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium whitespace-nowrap transition-colors ${selectedCategory === cat.id ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'}`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Compact Table View ─── */}
      <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-semibold">
              <tr>
                <th className="py-2.5 px-3">Bien / Título</th>
                <th className="py-2.5 px-3">Empresa Asignada</th>
                <th className="py-2.5 px-3">Categoría</th>
                <th className="py-2.5 px-3">Precio COP</th>
                <th className="py-2.5 px-3">Ubicación / Placa</th>
                <th className="py-2.5 px-3">Estado</th>
                <th className="py-2.5 px-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filteredItems.map(item => (
                <tr key={item.id} className="hover:bg-zinc-50/80 transition-colors">
                  <td className="py-2.5 px-3">
                    <div className="font-semibold text-zinc-900 flex items-center gap-1.5">
                      {item.category_type === 'VEHICULO' && <Car className="h-3.5 w-3.5 text-zinc-500 shrink-0" />}
                      {item.category_type === 'MOTO' && <Layers className="h-3.5 w-3.5 text-zinc-500 shrink-0" />}
                      {item.category_type.includes('INMUEBLE') && <Home className="h-3.5 w-3.5 text-zinc-500 shrink-0" />}
                      <span className="truncate max-w-xs">{item.title}</span>
                    </div>
                    <div className="text-[10px] text-zinc-400 font-mono">
                      Año: {item.year} {item.mileage ? `· ${item.mileage.toLocaleString()} km` : ''}
                    </div>
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-zinc-800 text-[11px]">
                    {item.tenants?.name || "YJD TRINOVA S.A.S."}
                  </td>
                  <td className="py-2.5 px-3">
                    <Badge variant="outline" className="text-[10px] bg-zinc-100 text-zinc-700 border-zinc-200 font-normal">
                      {item.category_type.replace(/_/g, ' ')}
                    </Badge>
                  </td>
                  <td className="py-2.5 px-3 font-mono font-bold text-zinc-900 text-[11px]">
                    ${Number(item.price_cop || 0).toLocaleString("es-CO")} COP
                  </td>
                  <td className="py-2.5 px-3 text-zinc-600 text-[11px]">
                    <div>{item.city}</div>
                    {item.license_plate && <div className="text-[10px] font-mono text-zinc-400">Placa: {item.license_plate}</div>}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      item.status === 'DISPONIBLE' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                      item.status === 'RESERVADO' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                      'bg-zinc-100 text-zinc-600'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        onClick={() => { setSelectedItem(item); setIsDetailOpen(true); }}
                        variant="outline"
                        size="sm"
                        className="h-7 text-[11px] border-zinc-200 px-2"
                      >
                        Ver
                      </Button>
                      <Button
                        onClick={() => handleDeleteItem(item.id)}
                        variant="ghost"
                        size="sm"
                        className="h-7 text-[11px] text-zinc-400 hover:text-red-600 px-1.5"
                        title="Eliminar de la Base de Datos"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredItems.length === 0 && !isLoading && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-zinc-400 text-xs">
                    <p className="font-medium text-zinc-600">0 ítems encontrados en la base de datos.</p>
                    <p className="text-[11px] text-zinc-400 mt-1">Los vehículos, motos e inmuebles registrados por proveedores en el formulario aparecerán aquí en tiempo real.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── Modal: Cargar Nuevo Bien a Supabase ─── */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-lg bg-white">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-zinc-900">
              Cargar Bien al Inventario de Trinova (Base de Datos Real)
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-500">
              Se almacenará directamente en la tabla `inventory_items` de Supabase Cloud.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateItem} className="space-y-3 pt-2 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-zinc-700">Categoría</Label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value as any)}
                  className="w-full h-9 rounded-lg border border-zinc-200 px-2 text-xs bg-white text-zinc-800 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                >
                  <option value="VEHICULO">Carro / Camioneta</option>
                  <option value="MOTO">Motocicleta</option>
                  <option value="INMUEBLE_VENTA">Inmueble Venta</option>
                  <option value="INMUEBLE_RENTA">Inmueble Renta</option>
                </select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold text-zinc-700">Empresa (Tenant)</Label>
                <Input readOnly value="YJD TRINOVA S.A.S." className="h-9 text-xs bg-zinc-50 font-semibold" />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold text-zinc-700">Título del Bien *</Label>
              <Input
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="Ej. Toyota Fortuner GR-S 2.8 Diesel 4x4"
                className="h-9 text-xs"
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-zinc-700">Marca</Label>
                <Input
                  value={formBrand}
                  onChange={(e) => setFormBrand(e.target.value)}
                  placeholder="Toyota"
                  className="h-9 text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-zinc-700">Modelo</Label>
                <Input
                  value={formModel}
                  onChange={(e) => setFormModel(e.target.value)}
                  placeholder="Fortuner"
                  className="h-9 text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-zinc-700">Año</Label>
                <Input
                  type="number"
                  value={formYear}
                  onChange={(e) => setFormYear(Number(e.target.value))}
                  className="h-9 text-xs font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-zinc-700">Precio en Pesos COP ($) *</Label>
                <Input
                  type="number"
                  value={formPriceCop}
                  onChange={(e) => setFormPriceCop(Number(e.target.value))}
                  placeholder="310000000"
                  className="h-9 text-xs font-mono font-bold"
                  required
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-zinc-700">Ciudad</Label>
                <Input
                  value={formCity}
                  onChange={(e) => setFormCity(e.target.value)}
                  placeholder="Barranquilla"
                  className="h-9 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-zinc-700">Placa (si aplica)</Label>
                <Input
                  value={formPlate}
                  onChange={(e) => setFormPlate(e.target.value)}
                  placeholder="LMN-456"
                  className="h-9 text-xs font-mono uppercase"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-zinc-700">Kilometraje (si aplica)</Label>
                <Input
                  type="number"
                  value={formMileage}
                  onChange={(e) => setFormMileage(Number(e.target.value))}
                  placeholder="15000"
                  className="h-9 text-xs font-mono"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold text-zinc-700">URLs de Imágenes (separadas por coma)</Label>
              <Input
                value={formImages}
                onChange={(e) => setFormImages(e.target.value)}
                placeholder="https://ejemplo.com/foto1.jpg, https://ejemplo.com/foto2.jpg"
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold text-zinc-700">Enlace de Video del Vehículo / Inmueble (Opcional)</Label>
              <Input
                value={formVideoUrl}
                onChange={(e) => setFormVideoUrl(e.target.value)}
                placeholder="https://youtube.com/... o https://vimeo.com/..."
                className="h-9 text-xs font-mono"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold text-zinc-700">Descripción / Peritaje</Label>
              <Textarea
                value={formDesc}
                onChange={(e) => setFormDesc(e.target.value)}
                placeholder="Detalla estado mecánico, accesorios y características..."
                className="text-xs min-h-[60px]"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsCreateModalOpen(false)} className="h-8 text-xs">
                Cancelar
              </Button>
              <Button type="submit" size="sm" className="h-8 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold">
                Guardar en Supabase
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ─── Modal: Ver Detalle del Ítem ─── */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-zinc-900">
              {selectedItem?.title}
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-500">
              Empresa: {selectedItem?.tenants?.name || "YJD TRINOVA S.A.S."}
            </DialogDescription>
          </DialogHeader>

          {selectedItem && (
            <div className="space-y-3 pt-2 text-xs">
              <div className="p-3 rounded-lg bg-zinc-50 border border-zinc-200 space-y-1.5 font-mono text-[11px]">
                <div className="flex justify-between text-zinc-600">
                  <span>Precio COP:</span>
                  <span className="font-bold text-zinc-900">${Number(selectedItem.price_cop || 0).toLocaleString("es-CO")} COP</span>
                </div>
                <div className="flex justify-between text-zinc-600">
                  <span>Categoría:</span>
                  <span className="text-zinc-900">{selectedItem.category_type}</span>
                </div>
                <div className="flex justify-between text-zinc-600">
                  <span>Ciudad:</span>
                  <span className="text-zinc-900">{selectedItem.city}</span>
                </div>
                {selectedItem.license_plate && (
                  <div className="flex justify-between text-zinc-600">
                    <span>Placa:</span>
                    <span className="text-zinc-900">{selectedItem.license_plate}</span>
                  </div>
                )}
                {selectedItem.contacts && (
                  <div className="flex justify-between text-zinc-600 pt-1 border-t border-zinc-200">
                    <span>Propietario / Consignante:</span>
                    <span className="text-zinc-900 font-bold">{selectedItem.contacts.full_name} ({selectedItem.contacts.phone})</span>
                  </div>
                )}
              </div>

              {selectedItem.images && selectedItem.images.length > 0 && (
                <div className="space-y-1">
                  <span className="font-semibold text-zinc-700">Imágenes ({selectedItem.images.length})</span>
                  <div className="grid grid-cols-3 gap-1.5">
                    {selectedItem.images.slice(0, 3).map((img, idx) => (
                      <img key={idx} src={img} alt="Foto bien" className="w-full h-16 object-cover rounded-lg border border-zinc-200" />
                    ))}
                  </div>
                </div>
              )}

              {selectedItem.video_url && (
                <div className="p-2 rounded bg-zinc-100 flex items-center justify-between text-[11px]">
                  <span className="flex items-center gap-1"><Video className="h-3 w-3 text-red-600" /> Video del Bien</span>
                  <a href={selectedItem.video_url} target="_blank" rel="noreferrer" className="text-blue-600 underline">Ver Video</a>
                </div>
              )}

              <DialogFooter className="pt-2">
                <Button size="sm" onClick={() => setIsDetailOpen(false)} className="h-8 text-xs bg-zinc-900 text-white">
                  Cerrar
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
