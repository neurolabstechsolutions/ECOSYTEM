import { MOCK_INVENTORY } from '@/lib/mocks'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Plus, Search, Filter, Edit, PackageX } from 'lucide-react'
import { Input } from '@/components/ui/input'
import Image from 'next/image'

export default async function InventoryPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-8 fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-black font-serif">Catálogo e Inventario</h1>
          <p className="text-slate-500 mt-2 text-lg">Gestiona los vehículos disponibles y sus características técnicas.</p>
        </div>
        <Button className="bg-black hover:bg-slate-800 text-white rounded-full px-6">
          <Plus className="mr-2 h-4 w-4" /> Agregar Vehículo
        </Button>
      </div>

      <div className="flex items-center space-x-4 bg-white border border-slate-200 rounded-2xl p-2 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Buscar por SKU, modelo o categoría..." 
            className="pl-9 bg-slate-50 border-transparent focus-visible:ring-slate-200 text-slate-900 placeholder:text-slate-400 rounded-xl"
          />
        </div>
        <Button variant="outline" className="border-slate-200 text-slate-700 hover:text-black hover:bg-slate-100 rounded-xl">
          <Filter className="mr-2 h-4 w-4" /> Filtros Avanzados
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {MOCK_INVENTORY.map((product) => (
          <Card key={product.id} className="bg-white border-slate-200 shadow-sm rounded-2xl overflow-hidden flex flex-col hover:border-black transition-colors">
            {/* Imagen del Vehículo */}
            <div className="relative h-48 w-full bg-white">
              {/* Usamos etiqueta img normal por simplicidad con picsum (Next/Image requiere configurar domains) */}
              <img 
                src={product.images[0]} 
                alt={product.name} 
                className="object-cover w-full h-full opacity-90 hover:opacity-100 transition-opacity"
              />
              <div className="absolute top-2 right-2">
                <Badge className={
                  product.status === 'AVAILABLE' 
                    ? 'bg-emerald-500 text-white border-none' 
                    : 'bg-red-500 text-white border-none'
                }>
                  {product.status === 'AVAILABLE' ? 'DISPONIBLE' : 'AGOTADO'}
                </Badge>
              </div>
            </div>

            <CardContent className="p-5 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-2">
                <div className="text-xs text-slate-400 font-medium">{product.sku}</div>
                <Badge variant="outline" className="text-slate-500 border-slate-200 bg-slate-50 rounded-full">
                  {product.category}
                </Badge>
              </div>
              <h3 className="text-lg font-bold text-black leading-tight mb-2 font-serif">{product.name}</h3>
              
              <div className="text-2xl font-black text-black mb-4 mt-auto">
                ${product.price.toLocaleString('es-MX')} <span className="text-sm font-medium text-slate-500">MXN</span>
              </div>

              {/* Características Clave (JSONB Metadata renderizado) */}
              <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div><span className="text-slate-400 block uppercase tracking-wider text-[10px]">Año</span> <span className="font-semibold text-black">{product.metadata.year}</span></div>
                <div><span className="text-slate-400 block uppercase tracking-wider text-[10px]">Motor</span> <span className="font-semibold text-black">{product.metadata.fuel}</span></div>
                <div><span className="text-slate-400 block uppercase tracking-wider text-[10px]">Color</span> <span className="font-semibold text-black">{product.metadata.color}</span></div>
                <div><span className="text-slate-400 block uppercase tracking-wider text-[10px]">Stock</span> <span className="font-semibold text-black">{product.stock} un.</span></div>
              </div>
            </CardContent>

            <CardFooter className="p-4 border-t border-slate-100 bg-white gap-2">
              <Button variant="outline" className="flex-1 border-slate-200 text-slate-700 hover:text-black hover:bg-slate-50 rounded-xl">
                <Edit className="w-4 h-4 mr-2" /> Editar
              </Button>
              <Button variant="ghost" size="icon" className="text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl" title="Descontinuar">
                <PackageX className="w-4 h-4" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}


