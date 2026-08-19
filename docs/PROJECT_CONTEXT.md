# PROJECT_CONTEXT

## ¿Qué es NeuroLabs AI Commerce?
Es una plataforma SaaS B2B multi-tenant que permite a las empresas:
- Conectar WhatsApp Business Platform.
- Atender conversaciones mediante agentes de IA.
- Consultar información empresarial en tiempo real (inventario/catálogo).
- Capturar y calificar leads.
- Automatizar seguimiento comercial.
- Transferir conversaciones a agentes humanos.
- Gestionar citas.
- Mostrar métricas y analíticas avanzadas.

## Objetivo Comercial
Permitir que NeuroLabs incorpore rápidamente nuevos clientes, ofreciendo un sistema de atención + ventas + CRM + automatización + IA + WhatsApp + analíticas como un servicio recurrente.

## Principio Multi-tenant
- Toda funcionalidad es multi-tenant desde el diseño base.
- Toda entidad se relaciona con `tenant_id`.
- Nunca se hardcodean configuraciones de un solo cliente.

## Piloto Inicial
- **Industria:** Automotriz
- **Inventario:** ~50 vehículos
- **Volumen Esperado:** ~3,000 consultas mensuales
- **Canal Inicial:** WhatsApp Business Platform
- **Objetivo del Piloto:** Convertir conversaciones de WhatsApp en oportunidades comerciales/leads.

## Stack y Arquitectura (Fase 0)
- **Frontend/Backend:** Next.js 14+ (App Router)
- **UI:** Tailwind CSS + shadcn/ui
- **DB & Auth:** PostgreSQL + Supabase (RLS para aislamiento multi-tenant)
- **IA:** Google Gemini (Function calling / Agent tools)
- **Integraciones Clave:** WhatsApp Business API, Stripe (futuro)

## Restricciones y Principios
- Aislamiento total de datos entre tenants (mediante RLS).
- Optimización de costos de IA (minimizar tokens, uso de herramientas estructuradas).
- WhatsApp como adaptador de canal genérico, permitiendo expansión futura.
- IA tratada como orquestador, NUNCA como fuente de verdad de datos transaccionales.
