# ARCHITECTURE

## Tipo de Aplicación
SaaS B2B Multi-tenant Serverless.

## Stack
- Frontend: Next.js 14+ (React 18, App Router)
- Estilos: Tailwind CSS v4 + shadcn/ui + Radix UI
- Backend: Next.js Route Handlers (Serverless)
- Base de Datos: PostgreSQL (Supabase)
- Auth: Supabase Auth
- AI/LLM: Google Gemini

## Diagrama Conceptual
```text
Client (Browser) -> Next.js (App Router) -> Supabase (Postgres + Auth)
                                       -> Google Gemini (AI)
                                       -> WhatsApp Webhook Handler
```

## Aislamiento Multi-Tenant
Toda la base de datos está protegida por Row Level Security (RLS).
El `tenant_id` se extrae del perfil del usuario logueado en cada petición. Ninguna query puede retornar datos que no coincidan con el `tenant_id` del usuario activo, previniendo fuga de datos.

## Estructura de Carpetas Principal
- `/docs`: Fuente única de verdad del proyecto.
- `/src/app`: Páginas y layouts de Next.js (Frontend).
- `/src/app/api`: Rutas de backend (Endpoints serverless).
- `/src/components`: Componentes UI reutilizables.
- `/src/lib`: Funciones utilitarias y clientes (ej. Supabase Client, OpenAI Client).
- `/supabase`: Configuración y migraciones de base de datos local.
