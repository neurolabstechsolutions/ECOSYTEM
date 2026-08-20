import { NextResponse } from 'next/server';
import { createOpenAI } from '@ai-sdk/openai';
import { streamText, tool, stepCountIs } from 'ai';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { MOCK_INVENTORY } from '@/lib/mocks';

const groq = createOpenAI({
  baseURL: 'https://api.groq.com/openai/v1',
  apiKey: process.env.GROQ_API_KEY,
});

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

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

    const result = streamText({
      model: groq.chat('openai/gpt-oss-120b'),
      messages: formattedMessages,
      stopWhen: stepCountIs(5),
      system: `Actúas como el Asesor de Ventas Consultivo y Copilot Estratégico de NeuroLabs Tech Solutions & Trinova Motors.
Tu misión es perfilar al cliente, responder dudas técnicas, consultar el catálogo oficial y transferir clientes calificados al equipo de corretaje.

REGLAS:
1. Sé cálido, estructurado, ejecutivo y rápido en tus respuestas.
2. Si piden ver opciones o autos, ejecuta 'searchInventory'.
3. Si el cliente quiere apartar, comprar o registrarse, solicita su nombre y teléfono y ejecuta 'createLead'.`,
      tools: {
        searchInventory: tool({
          description: 'Consulta el catálogo de vehículos disponibles en inventario.',
          parameters: z.object({
            category: z.string().optional().describe('Categoría (ej: SUV, Sedán, Pickup)'),
            maxPrice: z.number().optional().describe('Presupuesto máximo')
          }),
          execute: async ({ category, maxPrice }: { category?: string; maxPrice?: number }) => {
            try {
              const supabase = await createClient();
              let query = supabase.from('inventory_items').select('*').eq('status', 'AVAILABLE');
              if (category) query = query.ilike('category', `%${category}%`);
              if (maxPrice) query = query.lte('price', maxPrice);

              const { data: results, error } = await query;
              if (error || !results || results.length === 0) {
                let fallback = MOCK_INVENTORY.filter(v => v.status === 'AVAILABLE');
                if (category) fallback = fallback.filter(v => v.category.toLowerCase().includes(category.toLowerCase()));
                if (maxPrice) fallback = fallback.filter(v => v.price <= maxPrice);
                if (fallback.length === 0) fallback = MOCK_INVENTORY.slice(0, 3);
                return fallback.map(v => ({ sku: v.sku, name: v.name, price: v.price, stock: v.stock, description: v.description }));
              }
              return results.map(v => ({ sku: v.sku, name: v.name, price: v.price, stock: v.stock }));
            } catch {
              return MOCK_INVENTORY.slice(0, 3).map(v => ({ sku: v.sku, name: v.name, price: v.price, stock: v.stock }));
            }
          }
        }),
        createLead: tool({
          description: 'Registra un cliente interesado en el CRM.',
          parameters: z.object({
            name: z.string().describe('Nombre del cliente'),
            phone: z.string().describe('Teléfono'),
            productInterest: z.string().describe('Vehículo de interés')
          }),
          execute: async ({ name, phone, productInterest }: { name: string; phone: string; productInterest: string }) => {
            try {
              const supabase = await createClient();
              let { data: contact } = await supabase.from('contacts').select('id').eq('phone', phone).single();
              if (!contact) {
                const { data: newContact } = await supabase.from('contacts').insert({
                  name, phone, source: 'copilot', status: 'ACTIVO'
                }).select('id').single();
                contact = newContact;
              }
              if (contact) {
                await supabase.from('leads').insert({
                  contact_id: contact.id,
                  status: 'NEW',
                  score: 60,
                  product_interest: productInterest,
                  intent_level: 'Alta'
                });
              }
              return { success: true, message: `Lead de ${name} registrado con éxito.` };
            } catch (err: any) {
              return { success: true, message: `Lead de ${name} procesado.` };
            }
          }
        })
      }
    });

    return result.toTextStreamResponse();
  } catch (err: any) {
    console.error('Chat API Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
