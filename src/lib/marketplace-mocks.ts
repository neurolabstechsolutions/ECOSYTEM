export interface VehicleSpec {
  engine: string;
  horsepower: number;
  torque?: string;
  acceleration: string; // e.g. "0-100 km/h: 3.8s"
  traction: "AWD" | "RWD" | "FWD" | "4x4";
  fuelEconomy?: string; // e.g. "34 MPG / 8.2L/100km"
  transmissionDetails?: string;
}

export interface DealershipInfo {
  name: string;
  legalName?: string;
  taxId?: string; // NIT
  domain: string;
  tagline: string;
  phone: string;
  whatsappPhone: string;
  whatsappMessageTemplate?: string;
  address: string;
  city: string;
  email?: string;
  rating: number;
  reviewsCount: number;
  verified: boolean;
  logoText?: string;
  businessHours: string;
  badges: string[];
}

export interface Vehicle {
  id: string;
  brand: string;
  model: string;
  trim?: string;
  year: number;
  price: number; // in USD
  currency: string;
  originalPrice?: number;
  monthlyEstimate: number; // e.g. $650/mo
  mileage: number; // in km
  fuelType: "Gasolina" | "Híbrido" | "Eléctrico" | "Diésel";
  transmission: "Automática" | "Secuencial / DCT" | "Manual";
  bodyType: "SUV" | "Sedan" | "Coupe" | "Convertible" | "Pickup" | "Hatchback";
  region: string;
  city: string;
  exteriorColor: string;
  interiorColor: string;
  doors: number;
  condition: "Nuevo" | "Seminuevo Certificado" | "Usado Garantizado";
  badge?: "Certificado" | "Único Dueño" | "Garantía 2 Años" | "Entrega Inmediata" | "Híbrido Eco" | "Oportunidad";
  featured?: boolean;
  vin: string;
  plateEnding?: string; // e.g. "Terminada en 4"
  images: string[];
  specs: VehicleSpec;
  keyFeatures: string[];
  inspectionScore: number; // out of 100
  dealer: DealershipInfo;
}

export interface PropertySpec {
  areaM2: number;
  lotAreaM2?: number;
  bedrooms: number;
  bathrooms: number;
  parkingSpots: number;
  stratum: number; // Estrato 4, 5, 6
  builtYear: number;
  adminFeeCop?: number;
  floorNumber?: number;
  totalFloors?: number;
}

export interface RealEstateAgencyInfo {
  name: string;
  legalName?: string;
  taxId?: string; // NIT
  developer?: string;
  phone: string;
  whatsappPhone: string;
  rating: number;
  verified: boolean;
  address: string;
  city: string;
}

export interface Property {
  id: string;
  title: string;
  propertyType: "Apartamento" | "Casa de Lujo" | "Penthouse" | "Casa Campestre" | "Oficina / Local" | "Lote / Terreno";
  operationType: "Venta" | "Arriendo" | "Preventa / Sobre Planos";
  priceCop: number;
  originalPriceCop?: number;
  monthlyEstimateCop?: number;
  region: string;
  city: string;
  neighborhood: string;
  addressBrief: string;
  badge?: "Entrega Inmediata" | "Sobre Planos" | "Exclusivo" | "Vista Panorámica" | "Oportunidad" | "Negociable";
  featured?: boolean;
  code: string;
  images: string[];
  specs: PropertySpec;
  amenities: string[];
  description: string;
  agency: RealEstateAgencyInfo;
}

export const REAL_ESTATE_REGIONS = [
  "Todas las Regiones",
  "Bogotá D.C.",
  "Medellín (Antioquia)",
  "Cartagena (Bolívar)",
  "Barranquilla (Atlántico)",
  "Cali (Valle)",
  "Llanogrande / Rionegro",
  "Santa Marta (Magdalena)",
];

export const PROPERTY_TYPES = [
  "Todos",
  "Casa",
  "Apartamento",
  "Penthouse",
  "Casa Campestre",
  "Oficina / Local",
  "Lote / Terreno",
  "Bodega / Industrial",
];

export const OPERATION_TYPES = [
  "Todos",
  "Venta",
  "Arriendo",
  "Preventa / Sobre Planos",
];

export const REGIONS_LIST = [
  "Todas las Regiones",
  "Barranquilla (Atlántico)",
  "Bogotá D.C.",
  "Medellín (Antioquia)",
  "Cartagena (Bolívar)",
  "Cali (Valle)",
  "Bucaramanga (Santander)",
  "Eje Cafetero",
  "Santa Marta (Magdalena)",
];

export const BRANDS_LIST = [
  "Todas las Marcas",
  "Toyota",
  "Mazda",
  "Chevrolet",
  "Renault",
  "Yamaha",
  "Honda",
  "Suzuki",
  "Kawasaki",
  "BMW",
  "Mercedes-Benz",
  "Porsche",
  "Audi",
  "Ford",
  "Kia",
  "Hyundai",
  "Nissan",
  "Volkswagen",
];

export const BODY_TYPES = [
  "Todos",
  "SUV / Camioneta",
  "Sedán",
  "Moto / Motocicleta",
  "Pickup",
  "Hatchback",
  "Coupe",
  "Convertible",
  "Camión / Utilitario",
];

export const FUEL_TYPES = [
  "Todos",
  "Gasolina",
  "Híbrido",
  "Eléctrico",
  "Diésel",
];

export const DEFAULT_AGENCY: RealEstateAgencyInfo = {
  name: "YJD Trinova Real Estate & Inversiones",
  legalName: "YJD TRINOVA S.A.S.",
  taxId: "902.095.222-8",
  developer: "YJD TRINOVA S.A.S. - Inversiones & Desarrollo",
  phone: "+57 (605) 322-5918",
  whatsappPhone: "573005765530",
  address: "Calle 82 # 21 Sur 06 Esquina",
  city: "Barranquilla (Atlántico), Colombia",
  rating: 4.98,
  verified: true,
};

export const DEFAULT_DEALER: DealershipInfo = {
  name: "YJD Trinova S.A.S.",
  legalName: "YJD TRINOVA S.A.S.",
  taxId: "902.095.222-8",
  domain: "jjtrinova",
  tagline: "Marketplace Oficial & Corretaje Vehicular Certificado",
  phone: "+57 (605) 322-5918",
  whatsappPhone: "573005765530",
  address: "Calle 82 # 21 Sur 06 Esquina",
  city: "Barranquilla, Atlántico, Colombia",
  email: "dondeblanca15@gmail.com",
  rating: 4.98,
  reviewsCount: 412,
  verified: true,
  businessHours: "Lun - Sáb: 8:00 AM - 7:00 PM | Dom: 10:00 AM - 4:00 PM",
  badges: ["NIT 902.095.222-8", "Inspección 150 Puntos", "Garantía Mecánica", "Barranquilla - Atlántico"],
};

// Base de datos de Inventario Vacía (Lista para datos reales de la empresa)
export const MOCK_INVENTORY: Vehicle[] = [];

// Plantillas de demostración
export const SAMPLE_DEMO_VEHICLES: Vehicle[] = [
  {
    id: "car-001",
    brand: "Porsche",
    model: "911 Carrera S",
    trim: "Sport Chrono Package PDK",
    year: 2023,
    price: 138500,
    originalPrice: 145000,
    currency: "USD",
    monthlyEstimate: 1850,
    mileage: 8400,
    fuelType: "Gasolina",
    transmission: "Secuencial / DCT",
    bodyType: "Coupe",
    region: "Bogotá D.C.",
    city: "Bogotá - Zona Norte",
    exteriorColor: "Crayon Gray / Nardo",
    interiorColor: "Cuero Negro con costuras Rojas",
    doors: 2,
    condition: "Seminuevo Certificado",
    badge: "Certificado",
    featured: true,
    vin: "WP0AB2A98NS29104",
    plateEnding: "Placa terminada en 8",
    images: [
      "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=1200&q=80",
    ],
    specs: {
      engine: "3.0L Boxer Twin-Turbo 6 Cil.",
      horsepower: 450,
      torque: "530 Nm",
      acceleration: "0-100 km/h: 3.5s",
      traction: "RWD",
      fuelEconomy: "28 MPG Combinado",
      transmissionDetails: "PDK 8 Velocidades Doble Embrague",
    },
    keyFeatures: [
      "Paquete Sport Chrono",
      "Escape Deportivo Activo",
      "Rines Carrera Classic 20/21''",
      "Sistema de Sonido BOSE Surround",
      "Faros LED Matrix PDLS+",
      "Asientos Deportivos Plus 18 Vías",
    ],
    inspectionScore: 99,
    dealer: DEFAULT_DEALER,
  },
  {
    id: "car-002",
    brand: "BMW",
    model: "M4 Competition",
    trim: "M xDrive Carbon Package",
    year: 2024,
    price: 98900,
    originalPrice: 104000,
    currency: "USD",
    monthlyEstimate: 1320,
    mileage: 4200,
    fuelType: "Gasolina",
    transmission: "Automática",
    bodyType: "Coupe",
    region: "Medellín (Antioquia)",
    city: "Medellín - El Poblado",
    exteriorColor: "Isle of Man Green",
    interiorColor: "Cuero Merino Silverstone / Negro",
    doors: 2,
    condition: "Seminuevo Certificado",
    badge: "Único Dueño",
    featured: true,
    vin: "WBS43AY00PFP88231",
    plateEnding: "Placa terminada en 3",
    images: [
      "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1580274455191-1c62238fa333?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1200&q=80",
    ],
    specs: {
      engine: "3.0L BMW M TwinPower Turbo 6L",
      horsepower: 510,
      torque: "650 Nm",
      acceleration: "0-100 km/h: 3.4s",
      traction: "AWD",
      fuelEconomy: "24 MPG",
      transmissionDetails: "M Steptronic 8 Vel. con Drivelogic",
    },
    keyFeatures: [
      "Tracción Total M xDrive configurable",
      "Techo en Fibra de Carbono",
      "Frenos M Compound con calipers rojos",
      "Head-Up Display M con Telemetría",
      "BMW Live Cockpit Professional con pantalla curva",
      "Escape M Performance activo",
    ],
    inspectionScore: 98,
    dealer: DEFAULT_DEALER,
  },
  {
    id: "car-003",
    brand: "Mercedes-Benz",
    model: "C300 AMG Line",
    trim: "Night Edition 4MATIC Mild-Hybrid",
    year: 2023,
    price: 54900,
    originalPrice: 58000,
    currency: "USD",
    monthlyEstimate: 740,
    mileage: 16800,
    fuelType: "Híbrido",
    transmission: "Automática",
    bodyType: "Sedan",
    region: "Bogotá D.C.",
    city: "Bogotá - Chicó",
    exteriorColor: "Blanco Polar / Night Package",
    interiorColor: "Cuero Artico Negro",
    doors: 4,
    condition: "Seminuevo Certificado",
    badge: "Híbrido Eco",
    featured: true,
    vin: "W1K2060471F198302",
    plateEnding: "Placa terminada en 5",
    images: [
      "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1617531653332-bd46c24f2068?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1553440569-bcc63803a83d?auto=format&fit=crop&w=1200&q=80",
    ],
    specs: {
      engine: "2.0L Turbo 4 Cil. + EQ Boost 48V",
      horsepower: 258,
      torque: "400 Nm",
      acceleration: "0-100 km/h: 5.7s",
      traction: "AWD",
      fuelEconomy: "38 MPG Combinado",
      transmissionDetails: "9G-TRONIC Automática 9 Vel.",
    },
    keyFeatures: [
      "Paquete exterior e interior AMG Line",
      "MBUX Pantalla Central OLED 11.9''",
      "Luces DIGITAL LIGHT adaptativas",
      "Sonido Surround Burmester 3D",
      "Techo Panorámico Corredizo",
      "Sin restricción de pico y placa (Eco)",
    ],
    inspectionScore: 97,
    dealer: DEFAULT_DEALER,
  },
  {
    id: "car-004",
    brand: "Land Rover",
    model: "Defender 110",
    trim: "X-Dynamic SE P400 3.0 MHEV",
    year: 2023,
    price: 94500,
    originalPrice: 99000,
    currency: "USD",
    monthlyEstimate: 1280,
    mileage: 22000,
    fuelType: "Híbrido",
    transmission: "Automática",
    bodyType: "SUV",
    region: "Cali (Valle)",
    city: "Cali - Ciudad Jardín",
    exteriorColor: "Santorini Black Metallic",
    interiorColor: "Robustec & Cuero Windsor Ebony",
    doors: 5,
    condition: "Seminuevo Certificado",
    badge: "Garantía 2 Años",
    featured: true,
    vin: "SALWR2V45PA771923",
    plateEnding: "Placa terminada en 1",
    images: [
      "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=1200&q=80",
    ],
    specs: {
      engine: "3.0L i6 Turbocharged MHEV",
      horsepower: 400,
      torque: "550 Nm",
      acceleration: "0-100 km/h: 6.1s",
      traction: "4x4",
      fuelEconomy: "26 MPG",
      transmissionDetails: "Automática ZF 8 Vel. con Reductora",
    },
    keyFeatures: [
      "Suspensión Neumática Electrónica Adaptativa",
      "Terrain Response 2 con Modos Off-road",
      "Cámaras 3D Surround 360° con ClearSight",
      "Sistema de Infoentretenimiento Pivi Pro 11.4''",
      "Enganche de remolque eléctrico y barras de techo",
      "Rines de 20'' Gloss Dark Grey",
    ],
    inspectionScore: 96,
    dealer: DEFAULT_DEALER,
  },
  {
    id: "car-005",
    brand: "Audi",
    model: "RS6 Avant",
    trim: "Dynamic Plus Carbon Black",
    year: 2023,
    price: 142000,
    originalPrice: 149000,
    currency: "USD",
    monthlyEstimate: 1910,
    mileage: 11300,
    fuelType: "Híbrido",
    transmission: "Automática",
    bodyType: "Sedan",
    region: "Bogotá D.C.",
    city: "Bogotá - Santa Ana",
    exteriorColor: "Nardo Gray Special Edition",
    interiorColor: "Cuero Valcona con costuras en Panal",
    doors: 5,
    condition: "Seminuevo Certificado",
    badge: "Certificado",
    featured: true,
    vin: "WAUZZZF27PN018247",
    plateEnding: "Placa terminada en 9",
    images: [
      "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=1200&q=80",
    ],
    specs: {
      engine: "4.0L V8 Twin-Turbo TFSI MHEV",
      horsepower: 600,
      torque: "800 Nm",
      acceleration: "0-100 km/h: 3.6s",
      traction: "AWD",
      fuelEconomy: "22 MPG",
      transmissionDetails: "Tiptronic 8 Vel. con Tracción Quattro",
    },
    keyFeatures: [
      "Tracción Total Quattro con Diferencial Deportivo",
      "Eje Trasero Direccional Activo",
      "Frenos Cerámicos RS",
      "Faros HD Matrix LED con Láser Audi",
      "Sonido Bang & Olufsen 3D Advanced 19 Altavoces",
      "Escape Deportivo RS en Negro",
    ],
    inspectionScore: 99,
    dealer: DEFAULT_DEALER,
  },
  {
    id: "car-006",
    brand: "Tesla",
    model: "Model Y Performance",
    trim: "Dual Motor All-Wheel Drive",
    year: 2024,
    price: 52900,
    originalPrice: 56000,
    currency: "USD",
    monthlyEstimate: 710,
    mileage: 6100,
    fuelType: "Eléctrico",
    transmission: "Automática",
    bodyType: "SUV",
    region: "Medellín (Antioquia)",
    city: "Medellín - Llanogrande",
    exteriorColor: "Deep Blue Metallic",
    interiorColor: "Interior Premium Blanco & Negro",
    doors: 5,
    condition: "Seminuevo Certificado",
    badge: "Entrega Inmediata",
    featured: false,
    vin: "5YJYGDED8PF901924",
    plateEnding: "Placa terminada en 6",
    images: [
      "https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1536700503339-1e4b06520771?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1571127236794-81c0bbfe1ce3?auto=format&fit=crop&w=1200&q=80",
    ],
    specs: {
      engine: "Dual Motor Eléctrico AWD (514 HP)",
      horsepower: 514,
      torque: "660 Nm",
      acceleration: "0-100 km/h: 3.5s",
      traction: "AWD",
      fuelEconomy: "Autonomía EPA: 514 km",
      transmissionDetails: "Transmisión Eléctrica de 1 Marcha",
    },
    keyFeatures: [
      "Autopilot con Conducción Autónoma Total (FSD)",
      "Aceleración 0-100 en 3.5s con Modo Pista",
      "Rines Überturbine de 21 pulgadas",
      "Frenos Performance con calipers rojos",
      "Techo de cristal panorámico continuo",
      "Carga Ultra Rápida Supercharger V3",
    ],
    inspectionScore: 98,
    dealer: DEFAULT_DEALER,
  },
  {
    id: "car-007",
    brand: "Toyota",
    model: "Land Cruiser 300",
    trim: "GR-Sport 3.3L Twin-Turbo Diesel",
    year: 2023,
    price: 126000,
    originalPrice: 132000,
    currency: "USD",
    monthlyEstimate: 1690,
    mileage: 18500,
    fuelType: "Diésel",
    transmission: "Automática",
    bodyType: "SUV",
    region: "Barranquilla (Atlántico)",
    city: "Barranquilla - Altos de Riomar",
    exteriorColor: "Blanco Perla / Detalles GR",
    interiorColor: "Cuero Negro con costuras GR Rojas",
    doors: 5,
    condition: "Seminuevo Certificado",
    badge: "Certificado",
    featured: true,
    vin: "JTEBX7AJ6N4018239",
    plateEnding: "Placa terminada en 2",
    images: [
      "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1594502184342-2e12f877aa73?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=1200&q=80",
    ],
    specs: {
      engine: "3.3L V6 Twin-Turbo Diésel",
      horsepower: 302,
      torque: "700 Nm",
      acceleration: "0-100 km/h: 6.9s",
      traction: "4x4",
      fuelEconomy: "31 MPG",
      transmissionDetails: "Direct Shift Automática 10 Vel.",
    },
    keyFeatures: [
      "Suspensión E-KDSS Electrónica Avanzada",
      "Bloqueos de Diferencial Delantero, Central y Trasero",
      "Pantalla Táctil HD de 12.3'' con JBL 14 Altavoces",
      "Toyota Safety Sense 2.5+",
      "Nevera Central Cool Box",
      "Blindaje nivel 2 Plus opcional disponible",
    ],
    inspectionScore: 97,
    dealer: DEFAULT_DEALER,
  },
  {
    id: "car-008",
    brand: "Volvo",
    model: "XC90 Recharge",
    trim: "Ultimate T8 Dark Theme Plug-in Hybrid",
    year: 2023,
    price: 76500,
    originalPrice: 82000,
    currency: "USD",
    monthlyEstimate: 1030,
    mileage: 14000,
    fuelType: "Híbrido",
    transmission: "Automática",
    bodyType: "SUV",
    region: "Bogotá D.C.",
    city: "Bogotá - Rosales",
    exteriorColor: "Platinum Gray Metallic",
    interiorColor: "Cuero Nappa Perforado Ámbar",
    doors: 5,
    condition: "Seminuevo Certificado",
    badge: "Híbrido Eco",
    featured: false,
    vin: "YV4A22PK0P1982741",
    plateEnding: "Placa terminada en 7",
    images: [
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=80",
    ],
    specs: {
      engine: "2.0L Turbo Supercargado + Motor Eléctrico",
      horsepower: 455,
      torque: "709 Nm",
      acceleration: "0-100 km/h: 5.3s",
      traction: "AWD",
      fuelEconomy: "Autonomía EV: 73 km (110 MPGe)",
      transmissionDetails: "Geartronic Automática 8 Vel.",
    },
    keyFeatures: [
      "7 Pasajeros en 3 Filas de Asientos Reales",
      "Sonido Bowers & Wilkins High Fidelity 19 Parlantes",
      "Palanca de Cambios en Cristal Orrefors hecho a mano",
      "Google Built-In con Asistente y Google Maps nativo",
      "Purificador de Aire Avanzado PM2.5",
      "Suspensión Neumática con 4 Modos",
    ],
    inspectionScore: 98,
    dealer: DEFAULT_DEALER,
  },
  {
    id: "car-009",
    brand: "Ford",
    model: "Mustang Mach 1",
    trim: "5.0L V8 Tremec Manual",
    year: 2022,
    price: 58900,
    originalPrice: 63000,
    currency: "USD",
    monthlyEstimate: 790,
    mileage: 15400,
    fuelType: "Gasolina",
    transmission: "Manual",
    bodyType: "Coupe",
    region: "Bucaramanga (Santander)",
    city: "Bucaramanga - Cabecera",
    exteriorColor: "Fighter Jet Gray con franjas Naranjas",
    interiorColor: "Asientos Recaro en Cuero Negro",
    doors: 2,
    condition: "Seminuevo Certificado",
    badge: "Oportunidad",
    featured: false,
    vin: "1FA6P8R05N5512093",
    plateEnding: "Placa terminada en 0",
    images: [
      "https://images.unsplash.com/photo-1584345604476-8ec5e12e42dd?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1547744152-14d985cb937f?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1619682817481-e994891cd1f5?auto=format&fit=crop&w=1200&q=80",
    ],
    specs: {
      engine: "5.0L V8 Coyote Naturally Aspirated",
      horsepower: 470,
      torque: "569 Nm",
      acceleration: "0-100 km/h: 4.1s",
      traction: "RWD",
      fuelEconomy: "20 MPG",
      transmissionDetails: "Tremec 3160 Manual 6 Vel. Rev-Match",
    },
    keyFeatures: [
      "Suspensión MagneRide con Calibración de Circuito",
      "Diferencial Torsen de Deslizamiento Limitado",
      "Frenos Brembo de 6 pistones delanteros",
      "Escape con Válvula Activa de 4 Salidas",
      "Asientos Deportivos Recaro de Fábrica",
      "Radiadores adicionales del Shelby GT350",
    ],
    inspectionScore: 96,
    dealer: DEFAULT_DEALER,
  },
  {
    id: "car-010",
    brand: "Porsche",
    model: "Macan GTS",
    trim: "2.9L Twin-Turbo PDK",
    year: 2023,
    price: 88500,
    originalPrice: 94000,
    currency: "USD",
    monthlyEstimate: 1190,
    mileage: 12800,
    fuelType: "Gasolina",
    transmission: "Secuencial / DCT",
    bodyType: "SUV",
    region: "Medellín (Antioquia)",
    city: "Medellín - Envigado",
    exteriorColor: "Carmine Red",
    interiorColor: "Paquete GTS Alcantara / Cuero con costuras Carmine",
    doors: 5,
    condition: "Seminuevo Certificado",
    badge: "Certificado",
    featured: true,
    vin: "WP1AB2AY9PLA19024",
    plateEnding: "Placa terminada en 4",
    images: [
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=1200&q=80",
    ],
    specs: {
      engine: "2.9L V6 Twin-Turbocharged",
      horsepower: 440,
      torque: "550 Nm",
      acceleration: "0-100 km/h: 4.3s",
      traction: "AWD",
      fuelEconomy: "25 MPG",
      transmissionDetails: "PDK 7 Velocidades",
    },
    keyFeatures: [
      "Suspensión Neumática con PASM y rebaje de 10mm",
      "Porsche Torque Vectoring Plus (PTV Plus)",
      "Paquete Sport Chrono con selector de modos",
      "Frenos Porsche Surface Coated Brake (PSCB)",
      "Rines RS Spyder Design de 21'' en Negro Satinado",
      "Sonido Bose Surround Sound",
    ],
    inspectionScore: 98,
    dealer: DEFAULT_DEALER,
  },
  {
    id: "car-011",
    brand: "BMW",
    model: "X5 xDrive45e M-Sport",
    trim: "Plug-in Hybrid AWD",
    year: 2023,
    price: 79900,
    originalPrice: 85000,
    currency: "USD",
    monthlyEstimate: 1070,
    mileage: 19500,
    fuelType: "Híbrido",
    transmission: "Automática",
    bodyType: "SUV",
    region: "Bogotá D.C.",
    city: "Bogotá - Cedritos",
    exteriorColor: "Mineral White Metallic",
    interiorColor: "Cuero Vernasca Coffee",
    doors: 5,
    condition: "Seminuevo Certificado",
    badge: "Híbrido Eco",
    featured: false,
    vin: "5UXTA6C07N9A48201",
    plateEnding: "Placa terminada en 8",
    images: [
      "https://images.unsplash.com/photo-1556189250-72ba954cfc2b?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1580274455191-1c62238fa333?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1200&q=80",
    ],
    specs: {
      engine: "3.0L Turbo 6L + Motor Eléctrico",
      horsepower: 394,
      torque: "600 Nm",
      acceleration: "0-100 km/h: 5.6s",
      traction: "AWD",
      fuelEconomy: "Autonomía Eléctrica: 85 km",
      transmissionDetails: "Steptronic 8 Vel. con levas al volante",
    },
    keyFeatures: [
      "Paquete Aerodinámico M Sport",
      "Techo Panorámico Sky Lounge con iluminación LED",
      "Luces Láser BMW con alcance 500m",
      "Suspensión neumática autonivelante en 2 ejes",
      "Acceso de confort y puertas con Soft-Close",
      "Exento de Pico y Placa nacional",
    ],
    inspectionScore: 97,
    dealer: DEFAULT_DEALER,
  },
  {
    id: "car-012",
    brand: "Lexus",
    model: "RX 350 F-Sport",
    trim: "Luxury AWD All-New Generation",
    year: 2024,
    price: 67900,
    originalPrice: 72000,
    currency: "USD",
    monthlyEstimate: 910,
    mileage: 7200,
    fuelType: "Gasolina",
    transmission: "Automática",
    bodyType: "SUV",
    region: "Eje Cafetero",
    city: "Pereira - Circunvalar",
    exteriorColor: "Iridium Silver Metallic",
    interiorColor: "Cuero F-Sport Circuit Red",
    doors: 5,
    condition: "Seminuevo Certificado",
    badge: "Único Dueño",
    featured: false,
    vin: "2T2HZCAAXRC019842",
    plateEnding: "Placa terminada en 5",
    images: [
      "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1200&q=80",
    ],
    specs: {
      engine: "2.4L Turbo 4 Cil. D-4ST",
      horsepower: 275,
      torque: "430 Nm",
      acceleration: "0-100 km/h: 7.2s",
      traction: "AWD",
      fuelEconomy: "29 MPG Combinado",
      transmissionDetails: "Direct Shift Automática 8 Vel.",
    },
    keyFeatures: [
      "Parrilla Spindle Body exclusiva F-Sport",
      "Pantalla Táctil Multimedia Lexus Interface de 14''",
      "Sistema de Audio Mark Levinson 21 Altavoces",
      "Lexus Safety System+ 3.0",
      "Suspensión Adaptativa Variable (AVS)",
      "Head-Up Display a color de 10''",
    ],
    inspectionScore: 99,
    dealer: DEFAULT_DEALER,
  },
];

// Base de datos de Inmuebles Vacía (Lista para datos reales de la empresa)
export const MOCK_REAL_ESTATE_PROPERTIES: Property[] = [];

// Plantillas de demostración de Inmuebles
export const SAMPLE_DEMO_PROPERTIES: Property[] = [
  {
    id: "prop-001",
    title: "Penthouse Dúplex con Terraza 360° & Vista a los Cerros",
    propertyType: "Penthouse",
    operationType: "Venta",
    priceCop: 2850000000, // $2.850.000.000 COP
    originalPriceCop: 3100000000,
    monthlyEstimateCop: 24500000,
    region: "Bogotá D.C.",
    city: "Bogotá D.C.",
    neighborhood: "Chicó Reservado",
    addressBrief: "Calle 94 con Carrera 7ma",
    badge: "Vista Panorámica",
    featured: true,
    code: "NL-RE-101",
    images: [
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
    ],
    specs: {
      areaM2: 340,
      bedrooms: 4,
      bathrooms: 5,
      parkingSpots: 4,
      stratum: 6,
      builtYear: 2023,
      adminFeeCop: 1650000,
      floorNumber: 12,
      totalFloors: 12,
    },
    amenities: [
      "Ascensor Privado Directo al Piso",
      "Terraza Privada de 70m² con Jacuzzi & BBQ",
      "Domótica Integral Lutron (Luces, Clima y Sonido)",
      "Chimenea a Gas Automatizada",
      "Cocina Italiana con Electrodomésticos Sub-Zero",
      "Edificio con Club House, Piscina Climatizada & Spa",
      "Cuarto y Baño de Servicio",
      "Seguridad Blindada 24/7 y CCTV",
    ],
    description: "Espectacular Penthouse Dúplex de autor con acabados importados en mármol de Carrara y maderas nobles. Techos de doble altura, ventanales piso a techo con aislamiento termoacústico y vista ininterrumpida a los Cerros Orientales.",
    agency: DEFAULT_AGENCY,
  },
  {
    id: "prop-002",
    title: "Mansión de Lujo en El Poblado con Piscina Infinita",
    propertyType: "Casa de Lujo",
    operationType: "Venta",
    priceCop: 4600000000, // $4.600.000.000 COP
    originalPriceCop: 4950000000,
    monthlyEstimateCop: 38900000,
    region: "Medellín (Antioquia)",
    city: "Medellín",
    neighborhood: "El Poblado - Las Palmas",
    addressBrief: "Alto de Las Palmas, Sector Exclusivo",
    badge: "Exclusivo",
    featured: true,
    code: "NL-RE-202",
    images: [
      "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=80",
    ],
    specs: {
      areaM2: 580,
      lotAreaM2: 1850,
      bedrooms: 5,
      bathrooms: 6,
      parkingSpots: 6,
      stratum: 6,
      builtYear: 2024,
      adminFeeCop: 1420000,
      totalFloors: 2,
    },
    amenities: [
      "Piscina Infinita Climatizada con Vista a la Ciudad",
      "Cava de Vinos Subterránea con Control de Humedad",
      "Sala de Cine / Home Theater con Sonido Dolby Atmos",
      "Gimnasio Privado Equipado",
      "Zona Húmeda: Sauna y Turco",
      "Sistema de Paneles Solares & Baterías Tesla",
      "Sendero Ecológico y Jardines Zen Paisajísticos",
      "Portería con Doble Anillo de Seguridad",
    ],
    description: "Obra maestra de arquitectura contemporánea en el sector más codiciado de Medellín. Espacios abiertos, integración total con la naturaleza, clima perfecto y privacidad absoluta rodeada de bosque nativo.",
    agency: DEFAULT_AGENCY,
  },
  {
    id: "prop-003",
    title: "Apartamento Frente al Mar con Acceso a Muelle Privado",
    propertyType: "Apartamento",
    operationType: "Venta",
    priceCop: 1950000000, // $1.950.000.000 COP
    monthlyEstimateCop: 16800000,
    region: "Cartagena (Bolívar)",
    city: "Cartagena de Indias",
    neighborhood: "Castillogrande",
    addressBrief: "Paseo Peatonal de Castillogrande",
    badge: "Entrega Inmediata",
    featured: true,
    code: "NL-RE-303",
    images: [
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80",
    ],
    specs: {
      areaM2: 215,
      bedrooms: 3,
      bathrooms: 4,
      parkingSpots: 2,
      stratum: 6,
      builtYear: 2023,
      adminFeeCop: 1250000,
      floorNumber: 18,
      totalFloors: 25,
    },
    amenities: [
      "Vista Frontal Directa a la Bahía de Cartagena",
      "Balcón Terraza con Cortinas de Cristal Plegables",
      "Piscina con Horizonte Infinito y Deck Solarium",
      "Muelle Privado para Yates y Embarcaciones",
      "Zona de Coworking VIP con Salas de Juntas",
      "Planta Eléctrica de Cobertura Total",
      "Salida Directa a la Playa",
    ],
    description: "Apartamento de alta gama en primera línea de mar en Castillogrande. Diseñado para maximizar la brisa y las puestas de sol caribeñas, con amenidades de resort 5 estrellas.",
    agency: DEFAULT_AGENCY,
  },
  {
    id: "prop-004",
    title: "Casa Campestre de Ensueño con Helipuerto & Bosque Nativo",
    propertyType: "Casa Campestre",
    operationType: "Venta",
    priceCop: 3750000000, // $3.750.000.000 COP
    originalPriceCop: 3950000000,
    monthlyEstimateCop: 31800000,
    region: "Llanogrande / Rionegro",
    city: "Rionegro - Llanogrande",
    neighborhood: "Llanogrande Alto",
    addressBrief: "Km 7 Vía Don Diego - Llanogrande",
    badge: "Oportunidad",
    featured: false,
    code: "NL-RE-404",
    images: [
      "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600585154363-67eb9e2e2099?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600607687644-c7171b42498f?auto=format&fit=crop&w=1200&q=80",
    ],
    specs: {
      areaM2: 450,
      lotAreaM2: 3200,
      bedrooms: 4,
      bathrooms: 5,
      parkingSpots: 8,
      stratum: 5,
      builtYear: 2022,
      adminFeeCop: 890000,
      totalFloors: 1,
    },
    amenities: [
      "Helipuerto Autorizado en el Lote",
      "Kiosco Gourmet con Horno de Leña y Parrilla Vasca",
      "Lago Privado con Deck de Pesca y Relajación",
      "Picadero para Caballos y 2 Caballerizas",
      "Calefacción por Suelo Radiante",
      "Sistema de Recolección de Aguas Lluvias & Riego",
      "A solo 15 minutos del Aeropuerto JMC",
    ],
    description: "Espectacular finca campestre en un solo nivel con diseño bioclimático, techos altos en madera laminada y amplios ventanales. La combinación perfecta de tranquilidad campestre y conectividad internacional.",
    agency: DEFAULT_AGENCY,
  },
  {
    id: "prop-005",
    title: "Penthouse de Autor con Terraza Jardín en Alto Prado",
    propertyType: "Penthouse",
    operationType: "Venta",
    priceCop: 1680000000, // $1.680.000.000 COP
    monthlyEstimateCop: 14500000,
    region: "Barranquilla (Atlántico)",
    city: "Barranquilla",
    neighborhood: "Alto Prado",
    addressBrief: "Carrera 58 con Calle 82",
    badge: "Entrega Inmediata",
    featured: true,
    code: "NL-RE-505",
    images: [
      "https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600573472550-8090b5e0745e?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80",
    ],
    specs: {
      areaM2: 290,
      bedrooms: 3,
      bathrooms: 4,
      parkingSpots: 3,
      stratum: 6,
      builtYear: 2024,
      adminFeeCop: 1100000,
      floorNumber: 15,
      totalFloors: 15,
    },
    amenities: [
      "Terraza Jardín de 55m² con Vista al Río Magdalena",
      "Aire Acondicionado Central VRF de Alta Eficiencia",
      "Acabados en Mármol Royal Grey y Cuarzo",
      "Piscina Tipo Lounge en Rooftop del Edificio",
      "Salón Social Climatizado & Gimnasio Spinning",
      "Cámaras de Vigilancia con IA Perimetral",
    ],
    description: "Ubicado en el corazón de Alto Prado, este Penthouse combina elegancia clásica y tecnología de vanguardia. Techos de 3.20m de altura y excelente ventilación natural cruzada.",
    agency: DEFAULT_AGENCY,
  },
  {
    id: "prop-006",
    title: "Casa de Lujo en Condominio Cerrado - Ciudad Jardín",
    propertyType: "Casa de Lujo",
    operationType: "Venta",
    priceCop: 2200000000, // $2.200.000.000 COP
    monthlyEstimateCop: 18900000,
    region: "Cali (Valle)",
    city: "Cali",
    neighborhood: "Ciudad Jardín",
    addressBrief: "Avenida San Joaquín",
    badge: "Negociable",
    featured: false,
    code: "NL-RE-606",
    images: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1200&q=80",
    ],
    specs: {
      areaM2: 420,
      lotAreaM2: 750,
      bedrooms: 4,
      bathrooms: 5,
      parkingSpots: 4,
      stratum: 6,
      builtYear: 2023,
      adminFeeCop: 950000,
      totalFloors: 2,
    },
    amenities: [
      "Piscina Privada con Cascada & Zona Húmeda",
      "Estudio / Oficina Ejecutiva Independiente",
      "Habitación Principal con Walk-in Closet Doble",
      "Condominio con Cancha de Tenis & Sendero Verde",
      "Parqueadero para Visitantes Interno",
      "Seguridad Armada 24 Horas",
    ],
    description: "Hermosa residencia familiar en el sector más exclusivo del sur de Cali. Iluminación natural abundante, amplios corredores y jardines tropicales privados.",
    agency: DEFAULT_AGENCY,
  },
  {
    id: "prop-007",
    title: "Apartamento de Vanguardia sobre Planos en Rosales",
    propertyType: "Apartamento",
    operationType: "Preventa / Sobre Planos",
    priceCop: 1450000000, // $1.450.000.000 COP
    monthlyEstimateCop: 12500000,
    region: "Bogotá D.C.",
    city: "Bogotá D.C.",
    neighborhood: "Rosales",
    addressBrief: "Transversal 3ra con Calle 72",
    badge: "Sobre Planos",
    featured: true,
    code: "NL-RE-707",
    images: [
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=80",
    ],
    specs: {
      areaM2: 175,
      bedrooms: 3,
      bathrooms: 3,
      parkingSpots: 2,
      stratum: 6,
      builtYear: 2026,
      adminFeeCop: 850000,
      floorNumber: 6,
      totalFloors: 10,
    },
    amenities: [
      "Proyecto Sostenible Certificación LEED Oro",
      "Planes de Pago Flexibles con Fiduciaria",
      "Rooftop con Lounge Firepit & Zona Yoga",
      "Teatro Privado y Cuarto de Juegos",
      "Parqueaderos con Cargadores Eléctricos",
      "Pet Spa y Estación de Lavado",
    ],
    description: "Oportunidad de inversión sobre planos en Rosales. Proyecto boutique de solo 18 unidades con arquitectura de firma internacional y acabados de lujo personalizables.",
    agency: DEFAULT_AGENCY,
  },
  {
    id: "prop-008",
    title: "Piso Corporativo Inteligente & Oficinas Prime",
    propertyType: "Oficina / Local",
    operationType: "Venta",
    priceCop: 3200000000, // $3.200.000.000 COP
    monthlyEstimateCop: 27500000,
    region: "Bogotá D.C.",
    city: "Bogotá D.C.",
    neighborhood: "Santa Bárbara / Calle 116",
    addressBrief: "Avenida Calle 116 con Carrera 9na",
    badge: "Exclusivo",
    featured: false,
    code: "NL-RE-808",
    images: [
      "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1200&q=80",
    ],
    specs: {
      areaM2: 410,
      bedrooms: 0,
      bathrooms: 6,
      parkingSpots: 10,
      stratum: 6,
      builtYear: 2023,
      adminFeeCop: 2800000,
      floorNumber: 8,
      totalFloors: 14,
    },
    amenities: [
      "Piso Completo con Control de Acceso Biométrico",
      "Auditorio Corporativo para 80 Personas en Edificio",
      "6 Salas de Juntas Climatizadas y Equipadas",
      "Cableado Estructurado Categoría 6A & Fibra Óptica",
      "Baterías de Baños Privadas para Hombres y Mujeres",
      "10 Parqueaderos Privados en Sótano",
    ],
    description: "Piso de oficinas AAA en edificio corporativo de última generación. Ideal para multinacionales, firmas de tecnología, fondos de inversión y consultoras de primer nivel.",
    agency: DEFAULT_AGENCY,
  }
];

export function getDealershipByDomain(domain: string): DealershipInfo {
  const formattedDomain = (domain || "").toLowerCase().replace(/[^a-z0-9-]/g, "");
  
  if (!formattedDomain || formattedDomain === "demo" || formattedDomain === "default" || formattedDomain.startsWith("ecosystem") || formattedDomain.includes("vercel")) {
    return DEFAULT_DEALER;
  }

  // Pre-configured custom domains
  const presets: Record<string, Partial<DealershipInfo>> = {
    "jjtrinova": {
      name: "YJD Trinova S.A.S.",
      legalName: "YJD TRINOVA S.A.S.",
      taxId: "902.095.222-8",
      tagline: "Marketplace Oficial & Corretaje Vehicular Certificado",
      phone: "+57 (605) 322-5918",
      whatsappPhone: "573005765530",
      address: "Calle 82 # 21 Sur 06 Esquina",
      city: "Barranquilla, Atlántico, Colombia",
      email: "dondeblanca15@gmail.com",
      rating: 4.98,
      reviewsCount: 412,
      badges: ["NIT 902.095.222-8", "Mandato Certificado", "Inspección Pericial 360°", "Barranquilla - Atlántico"],
    },
    "yjdtrinova": {
      name: "YJD Trinova S.A.S.",
      legalName: "YJD TRINOVA S.A.S.",
      taxId: "902.095.222-8",
      tagline: "Marketplace Oficial & Corretaje Vehicular Certificado",
      phone: "+57 (605) 322-5918",
      whatsappPhone: "573005765530",
      address: "Calle 82 # 21 Sur 06 Esquina",
      city: "Barranquilla, Atlántico, Colombia",
      email: "dondeblanca15@gmail.com",
      rating: 4.98,
      reviewsCount: 412,
      badges: ["NIT 902.095.222-8", "Mandato Certificado", "Inspección Pericial 360°", "Barranquilla - Atlántico"],
    },
    "trinova": {
      name: "YJD Trinova S.A.S.",
      legalName: "YJD TRINOVA S.A.S.",
      taxId: "902.095.222-8",
      tagline: "Marketplace Oficial & Corretaje Vehicular Certificado",
      phone: "+57 (605) 322-5918",
      whatsappPhone: "573005765530",
      address: "Calle 82 # 21 Sur 06 Esquina",
      city: "Barranquilla, Atlántico, Colombia",
      email: "dondeblanca15@gmail.com",
      rating: 4.98,
      reviewsCount: 412,
      badges: ["NIT 902.095.222-8", "Mandato Certificado", "Inspección Pericial 360°", "Barranquilla - Atlántico"],
    },
    "autohaus": {
      name: "Autohaus German Motors",
      tagline: "Especialistas en Vehículos Alemanes de Alto Rendimiento",
      phone: "+1 (800) 555-0199",
      whatsappPhone: "573105550199",
      city: "Bogotá D.C. & Medellín",
      rating: 4.95,
      reviewsCount: 420,
      badges: ["Garantía Alemana 100%", "Inspección Certificada Dekra", "Financiación Premium"],
    },
    "luxurymotors": {
      name: "Luxury Motors International",
      tagline: "Curaduría de Superdeportivos y SUVs de Lujo",
      phone: "+1 (800) 777-9000",
      whatsappPhone: "573207779000",
      city: "Medellín - El Poblado",
      rating: 5.0,
      reviewsCount: 290,
      badges: ["Exclusividad Garantizada", "Entrega Puerta a Puerta", "Blindaje Certificado"],
    }
  };

  const preset = presets[formattedDomain];
  if (preset) {
    return {
      ...DEFAULT_DEALER,
      domain: formattedDomain,
      ...preset,
    };
  }

  return DEFAULT_DEALER;
}

// ─────────────────────────────────────────────────────────────
// STORAGE PERSISTENCE & INVENTORY HELPERS
// ─────────────────────────────────────────────────────────────

export function getStoredVehicles(): Vehicle[] {
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem("neurolabs_vehicles_inventory");
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error("Error reading stored vehicles:", e);
    }
  }
  return MOCK_INVENTORY;
}

export function saveStoredVehicles(vehicles: Vehicle[]): void {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem("neurolabs_vehicles_inventory", JSON.stringify(vehicles));
    } catch (e) {
      console.error("Error saving vehicles:", e);
    }
  }
}

export function getStoredProperties(): Property[] {
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem("neurolabs_realestate_inventory");
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error("Error reading stored properties:", e);
    }
  }
  return MOCK_REAL_ESTATE_PROPERTIES;
}

export function saveStoredProperties(properties: Property[]): void {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem("neurolabs_realestate_inventory", JSON.stringify(properties));
    } catch (e) {
      console.error("Error saving properties:", e);
    }
  }
}
