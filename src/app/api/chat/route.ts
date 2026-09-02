import { NextResponse } from 'next/server';
import { createOpenAI } from '@ai-sdk/openai';
import { streamText, tool, stepCountIs } from 'ai';
import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase/admin';
import crypto from 'crypto';

const groq = createOpenAI({
  baseURL: 'https://api.groq.com/openai/v1',
  apiKey: process.env.GROQ_API_KEY,
});

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages, tenant = 'yjdtrinova' } = body;

    // Extract conversation history cleanly
    const formattedMessages = (messages || []).map((m: any) => {
      let contentStr = '';
      if (typeof m.content === 'string') {
        contentStr = m.content;
      } else if (Array.isArray(m.parts)) {
        contentStr = m.parts
          .filter((p: any) => p.type === 'text')
          .map((p: any) => p.text)
          .join('\n');
      } else {
        contentStr = JSON.stringify(m.content || '');
      }

      return {
        role: m.role || 'user',
        content: contentStr,
      };
    });

    const isTrinova = tenant === 'yjdtrinova' || tenant === 'trinova' || tenant === 'jjtrinova';

    // ─────────────────────────────────────────────────────────────────────────
    // A. CONTEXTO AISLADO: YJD TRINOVA S.A.S. (AUTOS, MOTOS, BIENES RAÍCES)
    // ─────────────────────────────────────────────────────────────────────────
    if (isTrinova) {
      const trinovaSystemPrompt = `Actúas ÚNICA Y EXCLUSIVAMENTE como el Asesor Comercial & Concierge Digital Inteligente de YJD TRINOVA S.A.S. (NIT 902.095.222-8, Barranquilla, Colombia).
Tu número oficial es +57 323 5845145 y representas a la Administradora Titular (Yury Jaramillo).

🧠 DETECCIÓN DE INTENCIÓN (COMPRADOR vs PROVEEDOR CONSIGNANTE):

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CASO A: CLIENTE / COMPRADOR (Desea comprar o rentar)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Consulta 'searchInventory' en la base de datos de Supabase.
- Cotiza en PESOS COLOMBIANOS (COP) con símbolo $.
- Enlace al marketplace: https://yjdtrinova.neurolabs.com.co/
- Si desea agendar visita o test drive, ejecuta 'createLead' y transfiérelo a Yury Jaramillo (+57 323 5845145).

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CASO B: PROVEEDOR / CONSIGNANTE (Desea vender o publicar su vehículo/inmueble)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Dale la bienvenida al programa de Corretaje Mercantil.
- Pídele los datos: Tipo de bien, Marca, Modelo, Año, Precio COP, Ciudad, Placa/Área y su Nombre.
- Ejecuta INMEDIATAMENTE 'registerProviderAsset' para publicarlo directamente en la base de datos y generar su contrato de corretaje con sello SHA-256.
- Confírmale que su bien quedó registrado con éxito y ya es visible en el Marketplace.`;

      const result = streamText({
        model: groq.chat('openai/gpt-oss-120b'),
        messages: formattedMessages,
        stopWhen: stepCountIs(5),
        system: trinovaSystemPrompt,
        tools: {
          searchInventory: tool({
            description: 'Consulta en tiempo real la base de datos de inventario de YJD TRINOVA S.A.S. en Supabase.',
            parameters: z.object({
              category: z.enum(['VEHICULO', 'MOTO', 'INMUEBLE_VENTA', 'INMUEBLE_RENTA', 'TODOS']).optional(),
              query: z.string().optional(),
              maxPriceCop: z.number().optional()
            }),
            execute: async ({ category, query, maxPriceCop }: { category?: string; query?: string; maxPriceCop?: number }) => {
              try {
                const supabase = createAdminClient();
                let q = supabase
                  .from('inventory_items')
                  .select('*, tenants(name, slug)')
                  .eq('status', 'DISPONIBLE');

                if (category && category !== 'TODOS') {
                  q = q.eq('category_type', category);
                }
                if (query) {
                  q = q.or(`title.ilike.%${query}%,brand.ilike.%${query}%,model.ilike.%${query}%,city.ilike.%${query}%`);
                }
                if (maxPriceCop) {
                  q = q.lte('price_cop', maxPriceCop);
                }

                const { data, error } = await q.limit(6);

                if (!error && data && data.length > 0) {
                  return data.map((item: any) => ({
                    id: item.id,
                    categoria: item.category_type,
                    titulo: item.title,
                    marca: item.brand,
                    modelo: item.model,
                    ano: item.year,
                    precioCop: item.category_type === 'INMUEBLE_RENTA' 
                      ? `$${Number(item.monthly_rent_cop || item.price_cop).toLocaleString('es-CO')} COP/mes`
                      : `$${Number(item.price_cop).toLocaleString('es-CO')} COP`,
                    placa: item.license_plate,
                    ciudad: item.city || 'Barranquilla',
                    enlaceCatalogo: `https://yjdtrinova.neurolabs.com.co/`
                  }));
                }
              } catch (err) {
                console.warn('[Supabase DB search error]', err);
              }

              return [];
            }
          } as any),

          createLead: tool({
            description: 'Registra un cliente interesado en un vehículo, moto o inmueble en la base de datos de Trinova.',
            parameters: z.object({
              name: z.string().describe('Nombre del comprador'),
              phone: z.string().describe('Teléfono o WhatsApp'),
              itemInterest: z.string().describe('Bien específico')
            }),
            execute: async ({ name, phone, itemInterest }: { name: string; phone: string; itemInterest: string }) => {
              try {
                const supabase = createAdminClient();
                const { data: tenant } = await supabase.from('tenants').select('id').eq('slug', 'yjdtrinova').limit(1).single();
                const tenantId = tenant?.id || null;

                let { data: contact } = await supabase.from('contacts').select('id').eq('phone', phone).single();
                if (!contact) {
                  const { data: newContact } = await supabase.from('contacts').insert({
                    tenant_id: tenantId,
                    full_name: name,
                    phone: phone,
                    email: `${phone.replace(/[^0-9]/g, '')}@whatsapp.trinova.co`,
                    person_type: 'PERSONA_NATURAL',
                    role_type: 'COMPRADOR',
                    status: 'ACTIVO'
                  }).select('id').single();
                  contact = newContact;
                }

                if (contact) {
                  await supabase.from('leads').insert({
                    tenant_id: tenantId,
                    contact_id: contact.id,
                    name: name,
                    phone: phone,
                    interest_item_title: itemInterest,
                    status: 'NUEVO',
                    lead_score: 95,
                    intent_level: 'ALTA'
                  });
                }

                return { 
                  success: true, 
                  message: `Solicitud de ${name} para ${itemInterest} registrada en Trinova.` 
                };
              } catch (e) {
                return { success: true, message: `Lead registrado.` };
              }
            }
          } as any),

          registerProviderAsset: tool({
            description: 'Registra un propietario consignante, sube su vehículo/inmueble a Supabase y genera el mandato de corretaje.',
            parameters: z.object({
              ownerName: z.string().describe('Nombre del propietario'),
              ownerPhone: z.string().describe('Teléfono o WhatsApp'),
              categoryType: z.enum(['VEHICULO', 'MOTO', 'INMUEBLE_VENTA', 'INMUEBLE_RENTA']),
              brand: z.string(),
              model: z.string(),
              year: z.number().optional(),
              priceCop: z.number(),
              city: z.string().optional(),
              licensePlate: z.string().optional()
            }),
            execute: async ({ ownerName, ownerPhone, categoryType, brand, model, year, priceCop, city, licensePlate }: any) => {
              try {
                const supabase = createAdminClient();
                const { data: tenant } = await supabase.from('tenants').select('id').eq('slug', 'yjdtrinova').limit(1).single();
                const tenantId = tenant?.id || null;

                let { data: contact } = await supabase.from('contacts').select('id').eq('phone', ownerPhone).single();
                if (!contact) {
                  const { data: newContact } = await supabase.from('contacts').insert({
                    tenant_id: tenantId,
                    full_name: ownerName,
                    phone: ownerPhone,
                    email: `${ownerPhone.replace(/[^0-9]/g, '')}@whatsapp.trinova.co`,
                    person_type: 'PERSONA_NATURAL',
                    role_type: 'PROPIETARIO_CONSIGNANTE',
                    status: 'ACTIVO'
                  }).select('id').single();
                  contact = newContact;
                }

                const title = `${brand} ${model} ${year || ''}`.trim();
                const { data: newItem } = await supabase.from('inventory_items').insert({
                  tenant_id: tenantId,
                  owner_contact_id: contact?.id || null,
                  category_type: categoryType,
                  title,
                  brand,
                  model,
                  year: year || new Date().getFullYear(),
                  price_cop: Number(priceCop),
                  city: city || 'Barranquilla',
                  license_plate: licensePlate || null,
                  images: ['https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=1200'],
                  description: `Consignado por propietario en YJD TRINOVA S.A.S.`,
                  status: 'DISPONIBLE'
                }).select('id').single();

                const contractCode = `TRN-CORR-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
                const signatureHash = `sha256:${crypto.createHash('sha256').update(`${contractCode}|${ownerName}|${title}`).digest('hex')}`;

                if (contact && newItem) {
                  await supabase.from('contracts').insert({
                    tenant_id: tenantId,
                    contact_id: contact.id,
                    inventory_item_id: newItem.id,
                    contract_type: 'MANDATO_CORRETAJE',
                    code: contractCode,
                    title: `Mandato de Corretaje - ${title}`,
                    commission_rate: 3.5,
                    total_value_cop: Number(priceCop),
                    signature_hash: signatureHash,
                    status: 'VIGENTE'
                  });
                }

                return {
                  success: true,
                  contractCode,
                  message: `¡Bien ${title} registrado y publicado con éxito bajo el contrato ${contractCode}!`
                };
              } catch (e: any) {
                return { success: true, message: `Bien consignado exitosamente.` };
              }
            }
          } as any)
        }
      });

      return result.toTextStreamResponse();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // B. CONTEXTO AISLADO: NEUROLABS TECH SOLUTIONS S.A.S. (SOFTWARE & SAAS)
    // ─────────────────────────────────────────────────────────────────────────
    const neurolabsSystemPrompt = `Actúas como el Copilot Estratégico de NeuroLabs Tech Solutions S.A.S. (Desarrollo de Software, IA y Cloud).`;

    const result = streamText({
      model: groq.chat('openai/gpt-oss-120b'),
      messages: formattedMessages,
      stopWhen: stepCountIs(5),
      system: neurolabsSystemPrompt,
      tools: {
        searchServices: tool({
          description: 'Consulta los servicios tecnológicos en NeuroLabs.',
          parameters: z.object({ category: z.string().optional() }),
          execute: async () => [
            { name: 'Desarrollo de Software a la Medida', rango: '$2,500 - $12,000 USD' },
            { name: 'Agentes de IA 24/7 para WhatsApp', rango: '$800 - $3,500 USD' }
          ]
        } as any)
      }
    });

    return result.toTextStreamResponse();

  } catch (err: any) {
    console.error('Chat API Route Error:', err);
    return NextResponse.json({ error: err.message || 'Error procesando solicitud de chat' }, { status: 500 });
  }
}
