// src/lib/mocks.ts
// Centralized Mock Data para la Fase 2 (UI) de NeuroLabs AI Commerce

export const MOCK_METRICS = {
  todayConversations: 124,
  openConversations: 32,
  newLeads: 45,
  qualifiedLeads: 18,
  appointments: 5,
  conversionRate: '14.5%',
  avgResponseTime: '1m 24s',
  aiHandled: 110,
  humanTransferred: 14,
}

export const MOCK_USER = {
  name: 'Admin Piloto',
  email: 'admin@automotriz.com',
  role: 'TENANT_ADMIN',
  tenant: 'Piloto Automotriz',
  avatar: 'https://i.pravatar.cc/150?u=admin'
}

export const MOCK_SIDEBAR_LINKS = [
  { name: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
  { name: 'Contactos', path: '/contacts', icon: 'Users' },
  { name: 'Leads (Pipeline)', path: '/leads', icon: 'Target' },
  { name: 'Conversaciones', path: '/conversations', icon: 'MessageSquare' },
  { name: 'Inventario', path: '/inventory', icon: 'Package' },
  { name: 'Contratos & Corretaje', path: '/contracts', icon: 'FileCheck2' },
  { name: 'Agentes IA', path: '/agents', icon: 'Bot' },
  { name: 'Conocimiento', path: '/knowledge', icon: 'Library' },
  { name: 'Automatizaciones', path: '/automations', icon: 'Workflow' },
  { name: 'Simulador IA', path: '/playground', icon: 'Sparkles' },
  { name: 'Citas', path: '/appointments', icon: 'Calendar' },
  { name: 'Analytics', path: '/analytics', icon: 'BarChart3' },
  { name: 'Integraciones', path: '/integrations', icon: 'Plug' },
  { name: 'Uso y Costos', path: '/usage', icon: 'Coins' },
  { name: 'Facturación', path: '/billing', icon: 'CreditCard' },
  { name: 'Usuarios', path: '/users', icon: 'UsersCog' },
  { name: 'Configuración', path: '/settings', icon: 'Settings' },
]

// FASE 3: CRM MOCKS
export const MOCK_CONTACTS = [
  { id: '1', name: 'Carlos López', phone: '+52 55 1234 5678', email: 'carlos.l@example.com', source: 'WhatsApp', tags: ['Alta prioridad', 'Contado'], status: 'ACTIVO', createdAt: '2026-08-10T10:00:00Z', tenant: 'Piloto Automotriz' },
  { id: '2', name: 'María Fernanda', phone: '+52 55 8765 4321', email: 'mafer@ejemplo.com', source: 'Facebook', tags: ['Crédito'], status: 'ACTIVO', createdAt: '2026-08-11T14:30:00Z', tenant: 'Piloto Automotriz' },
  { id: '3', name: 'Roberto Gómez', phone: '+52 55 5555 5555', email: 'roberto@gomez.com', source: 'Web', tags: ['Flotilla'], status: 'INACTIVO', createdAt: '2026-08-12T09:15:00Z', tenant: 'Piloto Automotriz' },
]

export const MOCK_LEADS = [
  { id: 'l1', contactId: '1', name: 'Carlos López', status: 'NEW', score: 85, productInterest: 'Sedán Modelo X 2026', budget: '$450,000 MXN', intent: 'Alta', assignedTo: 'Admin Piloto' },
  { id: 'l2', contactId: '2', name: 'María Fernanda', status: 'QUALIFIED', score: 92, productInterest: 'SUV Familiar Premium', budget: '$850,000 MXN', intent: 'Muy Alta', assignedTo: 'Admin Piloto' },
  { id: 'l3', contactId: '3', name: 'Roberto Gómez', status: 'NEGOTIATION', score: 65, productInterest: '3 x Pickups de Carga', budget: '$1,500,000 MXN', intent: 'Media', assignedTo: 'Admin Piloto' },
  { id: 'l4', contactId: '1', name: 'Juan Pérez (Nuevo)', status: 'CONTACTED', score: 40, productInterest: 'Hatchback Básico', budget: 'Sin definir', intent: 'Baja', assignedTo: 'Agente 1' },
  { id: 'l5', contactId: '2', name: 'Ana Sofía', status: 'WON', score: 100, productInterest: 'Sedán Eléctrico', budget: '$950,000 MXN', intent: 'Cerrada', assignedTo: 'Admin Piloto' },
]

// FASE 4: INVENTORY MOCKS
export const MOCK_INVENTORY = [
  { 
    id: 'v1', 
    sku: 'SUV-2026-X', 
    name: 'SUV Familiar Premium 2026', 
    description: 'Camioneta deportiva utilitaria de lujo con asientos de piel y tecnología híbrida.',
    price: 850000, 
    category: 'SUV', 
    stock: 4, 
    status: 'AVAILABLE',
    metadata: { year: 2026, color: 'Rojo Carmesí', mileage: 0, fuel: 'Híbrido' },
    images: ['https://picsum.photos/seed/suvred/800/500']
  },
  { 
    id: 'v2', 
    sku: 'SED-ELC-Z', 
    name: 'Sedán Eléctrico Z-Type', 
    description: 'Sedán 100% eléctrico con autonomía extendida de 500km.',
    price: 950000, 
    category: 'Sedán', 
    stock: 2, 
    status: 'AVAILABLE',
    metadata: { year: 2025, color: 'Blanco Perla', mileage: 15, fuel: 'Eléctrico' },
    images: ['https://picsum.photos/seed/sedanwhite/800/500']
  },
  { 
    id: 'v3', 
    sku: 'PKP-4X4-T', 
    name: 'Pickup 4x4 Todo Terreno', 
    description: 'Camioneta de carga doble cabina ideal para trabajo pesado.',
    price: 650000, 
    category: 'Pickup', 
    stock: 0, 
    status: 'OUT_OF_STOCK',
    metadata: { year: 2024, color: 'Plata Metálico', mileage: 0, fuel: 'Diesel' },
    images: ['https://picsum.photos/seed/pickup/800/500']
  },
  { 
    id: 'v4', 
    sku: 'HTB-ECO-B', 
    name: 'Hatchback Eco-City', 
    description: 'Compacto ideal para la ciudad. Excelente rendimiento de combustible.',
    price: 320000, 
    category: 'Hatchback', 
    stock: 12, 
    status: 'AVAILABLE',
    metadata: { year: 2026, color: 'Azul Marino', mileage: 0, fuel: 'Gasolina' },
    images: ['https://picsum.photos/seed/hatchback/800/500']
  },
]

// MEGA SPRINT: MOCKS (Fases 6, 7, 8) - ADVANCED

export type IntegrationStatus = "CONNECTED" | "DISCONNECTED" | "ERROR" | "PENDING";
export type IntegrationCategory = "All" | "AI & ML" | "Communication" | "Payments" | "Infrastructure";

export interface IntegrationConfigField {
  key: string;
  label: string;
  type: "text" | "password" | "select" | "url";
  value: string;
  placeholder?: string;
  description?: string;
  options?: string[];
}

export interface Integration {
  id: string;
  name: string;
  provider: string;
  category: "AI & ML" | "Communication" | "Payments" | "Infrastructure";
  description: string;
  status: IntegrationStatus;
  lastSync: string;
  iconType: "whatsapp" | "openai" | "stripe" | "slack" | "supabase" | "github";
  colorScheme: {
    bg: string;
    border: string;
    glow: string;
    text: string;
  };
  metrics?: {
    latencyMs?: number;
    requestsToday?: number;
    uptime?: string;
    eventsProcessed?: number;
  };
  authType: "API Key" | "OAuth 2.0" | "Webhook Secret";
  webhookUrl?: string;
  docsUrl?: string;
  configFields: IntegrationConfigField[];
}

export const MOCK_INTEGRATIONS: Integration[] = [
  {
    id: "meta-whatsapp",
    name: "Meta WhatsApp Cloud API",
    provider: "Meta Platforms",
    category: "Communication",
    description: "Automate outbound messaging, customer support notifications, and interactive chat flows via official WhatsApp Business API.",
    status: "CONNECTED",
    lastSync: "2 mins ago",
    iconType: "whatsapp",
    colorScheme: {
      bg: "bg-emerald-500/10 dark:bg-emerald-950/40",
      border: "border-emerald-500/30 dark:border-emerald-700/40",
      glow: "shadow-emerald-500/10",
      text: "text-emerald-500 dark:text-emerald-400"
    },
    metrics: { latencyMs: 142, requestsToday: 12450, uptime: "99.98%", eventsProcessed: 8940 },
    authType: "OAuth 2.0",
    webhookUrl: "https://api.neurometric.io/v1/webhooks/whatsapp",
    docsUrl: "https://developers.facebook.com/docs/whatsapp/cloud-api",
    configFields: [
      { key: "phoneNumberId", label: "Phone Number ID", type: "text", value: "109847291847192" },
      { key: "systemToken", label: "Permanent Access Token", type: "password", value: "EAAGxxxx" }
    ]
  },
  {
    id: "openai",
    name: "OpenAI Platform",
    provider: "OpenAI Inc.",
    category: "AI & ML",
    description: "High-throughput neural models (GPT-4o, o3-mini) for automated cognitive reasoning, entity extraction, and knowledge embeddings.",
    status: "CONNECTED",
    lastSync: "Just now",
    iconType: "openai",
    colorScheme: {
      bg: "bg-teal-500/10 dark:bg-teal-950/40",
      border: "border-teal-500/30 dark:border-teal-700/40",
      glow: "shadow-teal-500/10",
      text: "text-teal-500 dark:text-teal-400"
    },
    metrics: { latencyMs: 380, requestsToday: 48920, uptime: "99.95%", eventsProcessed: 320140 },
    authType: "API Key",
    configFields: [
      { key: "apiKey", label: "API Secret Key", type: "password", value: "sk-proj-..." }
    ]
  }
];

export interface KnowledgeDocument {
  id: string;
  name: string;
  type: "pdf" | "docx" | "doc" | "csv" | "txt" | "markdown";
  size: string;
  fileSizeBytes: number;
  status: "PROCESSED" | "PROCESSING" | "QUEUED" | "FAILED";
  chunksCount: number;
  tokensCount: number;
  category: "Financial" | "Technical" | "Market Intelligence" | "Legal & Compliance" | "Research";
  uploadedAt: string;
  updatedAt: string;
  author: string;
  summary: string;
  embeddingModel: string;
  tags: string[];
}

export const MOCK_KNOWLEDGE: KnowledgeDocument[] = [
  {
    id: "doc-001",
    name: "Q3_2026_Quantitative_Risk_Analysis.pdf",
    type: "pdf",
    size: "4.8 MB",
    fileSizeBytes: 5033164,
    status: "PROCESSED",
    chunksCount: 184,
    tokensCount: 46200,
    category: "Financial",
    uploadedAt: "2026-08-14 14:20",
    updatedAt: "2026-08-14 14:23",
    author: "Dr. Elena Vance",
    summary: "Deep volatility modeling and covariance matrices for multi-asset equity & FX portfolios.",
    embeddingModel: "text-embedding-3-large (1536 dims)",
    tags: ["Risk", "Quantitative", "Q3", "Portfolio"]
  },
  {
    id: "doc-002",
    name: "Neural_Transformer_Architecture_Specs_v3.docx",
    type: "docx",
    size: "2.3 MB",
    fileSizeBytes: 2411724,
    status: "PROCESSED",
    chunksCount: 112,
    tokensCount: 28400,
    category: "Technical",
    uploadedAt: "2026-08-14 11:05",
    updatedAt: "2026-08-14 11:08",
    author: "Marcus Chen",
    summary: "Hyperparameter tuning guides, sparse-attention layer design, and KV cache optimization notes.",
    embeddingModel: "text-embedding-3-large (1536 dims)",
    tags: ["Architecture", "Deep Learning", "LLM"]
  }
];

export interface Contact {
  id: string;
  name: string;
  avatar?: string;
  phone: string;
  email: string;
  company?: string;
  status: 'online' | 'offline' | 'away';
  channel: 'whatsapp' | 'web' | 'telegram' | 'instagram';
}

export interface LastMessage {
  text: string;
  timestamp: string;
  sender: 'user' | 'ai' | 'agent';
  status: 'sent' | 'delivered' | 'read';
}

export type HandlingStatus = 'AI_HANDLING' | 'HUMAN_NEEDED';

export interface Conversation {
  id: string;
  contact: Contact;
  lastMessage: LastMessage;
  handlingStatus: HandlingStatus;
  unreadCount: number;
  tags: string[];
  pinned?: boolean;
  sentiment?: 'positive' | 'neutral' | 'urgent' | 'negative';
  assignedAgent?: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  sender: 'user' | 'ai' | 'agent';
  senderName?: string;
  text: string;
  timestamp: string;
  status?: 'sent' | 'delivered' | 'read';
  aiConfidence?: number;
  suggestedActions?: string[];
  attachments?: any[];
}

export const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: "conv-1",
    contact: { id: "c-1", name: "Valeria Gómez", phone: "+57 312 849 2011", email: "valeria@neurotech.co", company: "NeuroTech Soluciones", status: "online", channel: "whatsapp" },
    lastMessage: { text: "Necesitamos cotizar el plan Enterprise para 25 puestos con integración CRM.", timestamp: "10:42 AM", sender: "user", status: "read" },
    handlingStatus: "HUMAN_NEEDED", unreadCount: 2, tags: ["Lead Calificado", "Enterprise", "Urgente"], sentiment: "urgent", assignedAgent: "Jafet C."
  },
  {
    id: "conv-2",
    contact: { id: "c-2", name: "Carlos Mario Restrepo", phone: "+57 300 554 9912", email: "carlos@grupoandina.com", company: "Grupo Andina S.A.S.", status: "online", channel: "whatsapp" },
    lastMessage: { text: "Te he adjuntado la factura fiscal y el reporte de balance general.", timestamp: "10:35 AM", sender: "ai", status: "read" },
    handlingStatus: "AI_HANDLING", unreadCount: 0, tags: ["Contabilidad", "Soporte Nivel 1"], sentiment: "positive"
  }
];

export const MOCK_MESSAGES: Record<string, ChatMessage[]> = {
  "conv-1": [
    { id: "m-101", conversationId: "conv-1", sender: "user", text: "¡Hola! Estamos evaluando la plataforma para nuestra división comercial.", timestamp: "10:38 AM", status: "read" },
    { id: "m-102", conversationId: "conv-1", sender: "ai", senderName: "Neuro AI", text: "¡Hola Valeria! Un placer saludarte. ¿Cuántos usuarios estiman?", timestamp: "10:39 AM", status: "read" },
    { id: "m-103", conversationId: "conv-1", sender: "user", text: "Necesitamos cotizar el plan Enterprise para 25 puestos con integración CRM.", timestamp: "10:42 AM", status: "read" }
  ],
  "conv-2": [
    { id: "m-201", conversationId: "conv-2", sender: "user", text: "Buenos días, necesito copia del estado de cuenta consolidado.", timestamp: "10:30 AM", status: "read" },
    { id: "m-202", conversationId: "conv-2", sender: "ai", senderName: "Neuro AI ERP", text: "Te he adjuntado la factura fiscal.", timestamp: "10:35 AM", status: "read" }
  ]
};

