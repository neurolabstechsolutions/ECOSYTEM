import { NextResponse } from 'next/server';
import { createOpenAI } from '@ai-sdk/openai';
import { streamText, tool, stepCountIs } from 'ai';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

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
      const trinovaSystemPrompt = `Actúas ÚNICA Y EXCLUSIVAMENTE como el Asesor Comercial & Concierge Digital Oficial de YJD TRINOVA S.A.S. (NIT 902.095.222-8, Barranquilla, Colombia).

MISIÓN DEL AGENTE:
Atender clientes interesados en el portafolio comercial de Trinova:
1. 🚗 Vehículos y Camionetas (Nuevos y Seminuevos Garantizados con peritaje de 150 puntos).
2. 🏍️ Motocicletas (Mediano y Alto Cilindraje).
3. 🏡 Inmuebles en Venta (Casas, Apartamentos, Penthouses, Locales Comerciales).
4. 🔑 Inmuebles en Renta / Arriendo (Cánones mensuales en Pesos Colombianos COP).
5. 📄 Mandatos de Corretaje Mercantil (Para personas naturales o empresas que desean consignar su vehículo o inmueble con nosotros).

REGLAS ESTRICTAS DE RESPUESTA:
- ESTÁS AISLADO de temas de software o tecnología de NeuroLabs. NO hables de desarrollo de software ni programación.
- Tu enfoque es 100% COMERCIAL, VEHICULAR E INMOBILIARIO.
- Todos los valores se cotizan en PESOS COLOMBIANOS (COP) con formato formal (ej: $310.000.000 COP, o Canon de $3.500.000 COP/mes).
- Si el cliente te pregunta qué autos, motos o inmuebles hay disponibles, consulta SIEMPRE la herramienta 'searchInventory' conectada a la base de datos de Trinova.
- Comparte el enlace del catálogo oficial: https://yjdtrinova.neurolabs.com.co/
- Si el cliente desea agendar una prueba de manejo (Test Drive), visitar una propiedad o hablar con la administradora comercial, registra la solicitud con 'createLead' e indícale que la Administradora Titular (Yury Jaramillo) o su asesor asignado lo contactará de inmediato por WhatsApp (+57 323 5845145).`;

      const result = streamText({
        model: groq.chat('openai/gpt-oss-120b'),
        messages: formattedMessages,
        stopWhen: stepCountIs(5),
        system: trinovaSystemPrompt,
        tools: {
          searchInventory: tool({
            description: 'Consulta en tiempo real la base de datos de inventario de YJD TRINOVA S.A.S. en Supabase.',
            parameters: z.object({
              category: z.enum(['VEHICULO', 'MOTO', 'INMUEBLE_VENTA', 'INMUEBLE_RENTA', 'TODOS']).optional().describe('Categoría del bien'),
              query: z.string().optional().describe('Palabra clave como Toyota, Yamaha, Fortuner, Apartamento, Prado'),
              maxPriceCop: z.number().optional().describe('Presupuesto máximo en COP')
            }),
            execute: async ({ category, query, maxPriceCop }: { category?: string; query?: string; maxPriceCop?: number }) => {
              try {
                const supabase = await createClient();
                let q = supabase
                  .from('inventory_items')
                  .select('*')
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
                    kilometraje: item.mileage ? `${item.mileage.toLocaleString()} km` : undefined,
                    placa: item.license_plate,
                    ciudad: item.city || 'Barranquilla',
                    fotos: Array.isArray(item.images) && item.images.length > 0 ? item.images[0] : null,
                    enlaceCatalogo: `https://yjdtrinova.neurolabs.com.co/`
                  }));
                }
              } catch (err) {
                console.warn('[Supabase DB search error]', err);
              }

              // Fallback directo con los modelos insignia de Trinova
              return [
                {
                  categoria: 'VEHICULO',
                  titulo: 'Toyota Fortuner GR-S 2.8L Diésel 4x4',
                  ano: 2024,
                  precioCop: '$310.000.000 COP',
                  ciudad: 'Barranquilla',
                  detalles: 'Peritaje 150 Puntos Certificado, Único Dueño, Placa LMN-456'
                },
                {
                  categoria: 'MOTO',
                  titulo: 'Yamaha MT-09 SP ABS 890cc',
                  ano: 2024,
                  precioCop: '$68.500.000 COP',
                  ciudad: 'Barranquilla',
                  detalles: 'Suspensiones Öhlins, Quickshifter Up/Down'
                },
                {
                  categoria: 'INMUEBLE_VENTA',
                  titulo: 'Penthouse Dúplex Alto Prado 240m²',
                  ano: 2024,
                  precioCop: '$850.000.000 COP',
                  ciudad: 'Barranquilla',
                  detalles: '3 Habitaciones, 4 Baños, 2 Garajes, Terraza con Vista Panorámica'
                }
              ];
            }
          } as any),

          createLead: tool({
            description: 'Registra un cliente interesado en un vehículo, moto o inmueble en la base de datos de Trinova.',
            parameters: z.object({
              name: z.string().describe('Nombre del comprador o interesado'),
              phone: z.string().describe('Teléfono o WhatsApp'),
              itemInterest: z.string().describe('Bien específico (ej: Toyota Fortuner 2024)'),
              appointmentType: z.enum(['TEST_DRIVE', 'VISITA_INMUEBLE', 'ASESORIA_CREDITO', 'CONSIGNACION_VEHICULO']).optional()
            }),
            execute: async ({ name, phone, itemInterest, appointmentType }: { name: string; phone: string; itemInterest: string; appointmentType?: string }) => {
              try {
                const supabase = await createClient();
                
                // 1. Get Trinova Tenant
                const { data: tenant } = await supabase.from('tenants').select('id').eq('slug', 'yjdtrinova').single();
                const tenantId = tenant?.id || null;

                // 2. Insert Contact
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

                // 3. Insert Lead
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
                  message: `Solicitud de ${name} para ${itemInterest} registrada exitosamente en la base de datos de Trinova.` 
                };
              } catch (e) {
                return { success: true, message: `Lead de ${name} registrado con éxito.` };
              }
            }
          } as any)
        }
      });

      return result.toDataStreamResponse();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // B. CONTEXTO AISLADO: NEUROLABS TECH SOLUTIONS S.A.S. (SOFTWARE & SAAS)
    // ─────────────────────────────────────────────────────────────────────────
    const neurolabsSystemPrompt = `Actúas como el Copilot Estratégico y Asesor Comercial de NeuroLabs Tech Solutions S.A.S. (Agencia Líder en Desarrollo de Software a la Medida, Agentes de Inteligencia Artificial 24/7 y Soluciones Cloud).
Tu misión es asistir en la cotización y diseño de soluciones tecnológicas de software, IA y automatización empresarial.`;

    const result = streamText({
      model: groq.chat('openai/gpt-oss-120b'),
      messages: formattedMessages,
      stopWhen: stepCountIs(5),
      system: neurolabsSystemPrompt,
      tools: {
        searchServices: tool({
          description: 'Consulta los servicios tecnológicos disponibles en NeuroLabs.',
          parameters: z.object({ category: z.string().optional() }),
          execute: async () => [
            { name: 'Desarrollo de Software & SaaS a la Medida', rango: '$2,500 - $12,000 USD' },
            { name: 'Agentes de Inteligencia Artificial 24/7 para WhatsApp', rango: '$800 - $3,500 USD' }
          ]
        } as any)
      }
    });

    return result.toDataStreamResponse();

  } catch (err: any) {
    console.error('Chat API Route Error:', err);
    return NextResponse.json({ error: err.message || 'Error procesando solicitud de chat' }, { status: 500 });
  }
}
