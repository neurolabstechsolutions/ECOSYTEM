import { createOpenAI } from '@ai-sdk/openai'
import { streamText, tool, toUIMessageStream, createUIMessageStreamResponse, convertToModelMessages, stepCountIs } from 'ai'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { MOCK_INVENTORY } from '@/lib/mocks'

// Configure Groq as the provider (using OpenAI compatibility)
const groq = createOpenAI({
  baseURL: 'https://api.groq.com/openai/v1',
  apiKey: process.env.GROQ_API_KEY,
});

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json()

    // Normalize messages to guarantee UIMessage parts structure for both legacy content and v4 parts
    const normalizedUIMessages = (messages || []).map((m: any) => ({
      id: m.id || Math.random().toString(),
      role: m.role,
      parts: m.parts || [
        {
          type: 'text',
          text: typeof m.content === 'string' ? m.content : (m.content ? JSON.stringify(m.content) : '')
        }
      ]
    }))

    const modelMessages = await convertToModelMessages(normalizedUIMessages)

    const result = streamText({
      model: groq.chat('openai/gpt-oss-120b'),
      messages: modelMessages,
      stopWhen: stepCountIs(5),
      system: `Actúas como el Asesor de Ventas Consultivo de Alta Gama (Digital Concierge) de Trinova Motors.
Tu misión es perfilar al cliente, ofrecer vehículos de nuestro inventario oficial con sus especificaciones técnicas reales y canalizar al cliente calificado hacia el equipo de corretaje y negociación de Trinova.

PROTOCOLO Y ARQUITECTURA DE ATENCIÓN:
1. DIÁLOGO CONSULTIVO Y PERFILAMIENTO:
   - Sé cálido, empático, sofisticado y tolerante a faltas de ortografía o lenguaje informal (ej: "hols", "que carro me recomiendas").
   - Conversa primero: pregunta el uso principal (ciudad, familia, viajes, trabajo), rango de presupuesto y preferencias de carrocería o combustible.

2. PRESENTACIÓN DE VEHÍCULOS Y ENLACE AL MARKETPLACE:
   - Cuando el cliente pida ver opciones o ya conozcas sus necesidades, ejecuta 'searchInventory'.
   - Presenta cada vehículo con sus capacidades técnicas destacadas (Año, Categoría, Motor/Combustible, Precio en MXN y Stock).
   - Para cada vehículo recomendado, indica que puede ver la ficha técnica completa, galería en alta definición y opciones de financiamiento en el portal de e-commerce de Trinova (ejemplo: https://motor.jjtrinova.com/marketplace).

3. CIERRE Y TRANSFERENCIA A CORRETAJE TRINOVA ('createLead'):
   - En cuanto el cliente muestre intención de compra, apartado, financiamiento o desee cerrar el trato, solicita amablemente su nombre y teléfono/WhatsApp.
   - Ejecuta inmediatamente 'createLead' para registrar el expediente en el CRM con el vehículo de su interés.
   - Realiza la despedida y entrega formal: Informa que tu ciclo como Asesor Digital ha finalizado con éxito y que a partir de este momento un Especialista Senior de Corretaje en Trinova asumirá directamente la negociación, verificación física/legal y entrega del vehículo.

4. TONO:
   - Impecable, ejecutivo, confiable y transparente. Cero tecnicismos confusos.`,
      tools: {
        searchInventory: tool({
          description: 'Consulta el catálogo de vehículos disponibles en inventario. Úsala cuando el cliente solicite modelos específicos o cuando conozcas sus preferencias.',
          parameters: z.object({
            category: z.string().optional().describe('Categoría (ej: SUV, Sedán, Pickup, Hatchback)'),
            maxPrice: z.number().optional().describe('Presupuesto máximo en MXN')
          }),
          execute: async ({ category, maxPrice }) => {
            console.log(`Buscando inventario: category=${category}, maxPrice=${maxPrice}`);
            const supabase = await createClient();
            
            let query = supabase.from('inventory_items').select('*').eq('status', 'AVAILABLE');
            
            if (category) {
              query = query.ilike('category', `%${category}%`);
            }
            if (maxPrice) {
              query = query.lte('price', maxPrice);
            }

            const { data: results, error } = await query;
            if (error || !results || results.length === 0) {
              let fallback = MOCK_INVENTORY.filter(v => v.status === 'AVAILABLE');
              if (category) fallback = fallback.filter(v => v.category.toLowerCase().includes(category.toLowerCase()));
              if (maxPrice) fallback = fallback.filter(v => v.price <= maxPrice);
              if (fallback.length === 0) fallback = MOCK_INVENTORY.slice(0, 3);
              return fallback.map(v => ({ sku: v.sku, name: v.name, price: v.price, stock: v.stock, description: v.description }));
            }

            return results.map(v => ({ sku: v.sku, name: v.name, price: v.price, stock: v.stock }));
          },
        }),
        createLead: tool({
          description: 'Registra un cliente interesado en el CRM (Pipeline).',
          parameters: z.object({
            name: z.string().describe('Nombre del cliente'),
            phone: z.string().describe('Número de teléfono'),
            productInterest: z.string().describe('Vehículo en el que está interesado')
          }),
          execute: async ({ name, phone, productInterest }) => {
            console.log(`Registrando LEAD: ${name} - ${phone} - ${productInterest}`);
            const supabase = await createClient();

            // 1. Crear o buscar contacto
            let { data: contact } = await supabase.from('contacts').select('id').eq('phone', phone).single();
            if (!contact) {
              const { data: newContact } = await supabase.from('contacts').insert({
                name, phone, source: 'whatsapp', status: 'ACTIVO'
              }).select('id').single();
              contact = newContact;
            }

            if (contact) {
              // 2. Crear Lead
              await supabase.from('leads').insert({
                contact_id: contact.id,
                status: 'NEW',
                score: 50,
                product_interest: productInterest,
                intent_level: 'Media'
              });
            }

            return { 
              success: true, 
              status: 'NEW',
              message: `¡Lead creado! ${name} ahora está en el Kanban.` 
            };
          }
        })
      }
    });

    // v4 SDK pattern: pipe fullStream -> toUIMessageStream -> createUIMessageStreamResponse
    return createUIMessageStreamResponse({
      stream: toUIMessageStream({ stream: result.fullStream }),
    });

  } catch (err: any) {
    console.error('API Error:', err);
    return new Response(JSON.stringify({ error: err.message, stack: err.stack }), { status: 500 });
  }
}
