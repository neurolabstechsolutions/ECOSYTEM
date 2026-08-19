import { NextResponse } from 'next/server';
import { createOpenAI } from '@ai-sdk/openai';
import { generateText, tool, stepCountIs } from 'ai';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { MOCK_INVENTORY } from '@/lib/mocks';

const groq = createOpenAI({
  baseURL: 'https://api.groq.com/openai/v1',
  apiKey: process.env.GROQ_API_KEY,
});

// ─────────────────────────────────────────────────────────────────────────────
// 1. GET: Verificación del Webhook de Meta (WhatsApp Cloud API)
// ─────────────────────────────────────────────────────────────────────────────
export async function GET(req: Request) {
  const url = new URL(req.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");

  const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || "neurolabs_secure_token_2026";

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("[WhatsApp Webhook] ✅ Verificación exitosa de Meta Webhook");
    return new NextResponse(challenge, { status: 200 });
  }

  console.warn("[WhatsApp Webhook] ❌ Token de verificación inválido:", token);
  return new NextResponse("Forbidden", { status: 403 });
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Helper: Enviar mensaje de texto de vuelta al usuario por WhatsApp
// ─────────────────────────────────────────────────────────────────────────────
async function sendWhatsAppMessage({
  phoneNumberId,
  to,
  text,
  accessToken
}: {
  phoneNumberId: string;
  to: string;
  text: string;
  accessToken: string;
}) {
  try {
    const url = `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: to,
        type: 'text',
        text: { preview_url: true, body: text }
      })
    });

    const data = await response.json();
    if (!response.ok) {
      console.error('[WhatsApp API Error]:', data);
    } else {
      console.log('[WhatsApp API Success] Mensaje enviado a:', to, 'ID:', data.messages?.[0]?.id);
    }
    return data;
  } catch (err) {
    console.error('[WhatsApp Send Message Exception]:', err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. POST: Recepción de Mensajes Entrantes y Ejecución del Asesor IA
// ─────────────────────────────────────────────────────────────────────────────
export async function POST(req: Request) {
  try {
    const payload = await req.json();

    if (payload.object === 'whatsapp_business_account') {
      for (const entry of payload.entry || []) {
        for (const change of entry.changes || []) {
          const value = change.value;
          if (value && value.messages && value.messages.length > 0) {
            
            const phoneNumberId = value.metadata.phone_number_id;
            const message = value.messages[0];
            const senderPhone = message.from; // Número de WhatsApp del cliente
            const senderName = value.contacts?.[0]?.profile?.name || "Cliente";
            const messageText = message.text?.body || "";

            // Ignorar mensajes sin texto (ej: confirmaciones de entrega o estados)
            if (!messageText.trim()) continue;

            console.log(`[WhatsApp Inbound] Mensaje de ${senderName} (${senderPhone}): "${messageText}"`);

            // Obtener el Access Token de WhatsApp
            const accessToken = process.env.WHATSAPP_ACCESS_TOKEN || process.env.WHATSAPP_TOKEN || '';

            if (!accessToken) {
              console.warn('[WhatsApp Webhook] WHATSAPP_ACCESS_TOKEN no configurado en .env.local');
            }

            // Ejecutar el Asesor IA de JY Trinova S.A.S.
            const { text: aiResponse } = await generateText({
              model: groq.chat('openai/gpt-oss-120b'),
              stopWhen: stepCountIs(5),
              system: `Actúas como el Asesor de Ventas Consultivo de Alta Gama (Digital Concierge) de JY Trinova S.A.S. en WhatsApp.
Tu misión es atender al cliente (${senderName}), perfilar sus necesidades vehiculares, recomendar opciones del catálogo oficial y canalizarlo al equipo de corretaje y compraventa.

REGLAS PARA WHATSAPP:
1. DIÁLOGO CONSULTIVO HUMANO Y ÁGIL:
   - Saluda cordialmente llamando al cliente por su nombre si es posible (${senderName}).
   - Sé breve, persuasivo y estructurado (los mensajes de WhatsApp deben ser fáciles de leer en pantalla móvil).
   - Usa viñetas claras y espaciado limpio.

2. CATÁLOGO & FICHAS TÉCNICAS:
   - Si el cliente busca un auto, ejecuta 'searchInventory'.
   - Presenta los modelos disponibles con sus precios en MXN y características clave.
   - Enlace oficial del catálogo: https://motor.jjtrinova.com/marketplace

3. CIERRE Y TRANSFERENCIA A CORRETAJE TRINOVA ('createLead'):
   - Si el cliente desea comprar, apartar o financiar, confirma su nombre y ejecuta 'createLead'.
   - Informa cordialmente que el expediente quedó registrado y que un Especialista Senior de Corretaje de JY Trinova S.A.S. lo contactará por esta misma vía para formalizar el contrato de compraventa y coordinar la entrega.`,
              messages: [
                { role: 'user', content: messageText }
              ],
              tools: {
                searchInventory: tool({
                  description: 'Consulta el catálogo de vehículos disponibles en inventario.',
                  parameters: z.object({
                    category: z.string().optional().describe('Categoría (ej: SUV, Sedán, Pickup)'),
                    maxPrice: z.number().optional().describe('Presupuesto máximo')
                  }),
                  execute: async ({ category, maxPrice }) => {
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
                  }
                }),
                createLead: tool({
                  description: 'Registra un cliente interesado en el CRM para cierre por parte de Trinova.',
                  parameters: z.object({
                    name: z.string().describe('Nombre del cliente'),
                    phone: z.string().describe('Teléfono de contacto'),
                    productInterest: z.string().describe('Vehículo de interés')
                  }),
                  execute: async ({ name, phone, productInterest }) => {
                    const supabase = await createClient();
                    let { data: contact } = await supabase.from('contacts').select('id').eq('phone', phone || senderPhone).single();
                    if (!contact) {
                      const { data: newContact } = await supabase.from('contacts').insert({
                        name: name || senderName,
                        phone: phone || senderPhone,
                        source: 'WhatsApp Cloud API',
                        status: 'ACTIVO'
                      }).select('id').single();
                      contact = newContact;
                    }
                    if (contact) {
                      await supabase.from('leads').insert({
                        contact_id: contact.id,
                        status: 'NEW',
                        score: 75,
                        product_interest: productInterest,
                        intent_level: 'Alta'
                      });
                    }
                    return { success: true, message: `Lead registrado en el CRM de JY Trinova S.A.S.` };
                  }
                })
              }
            });

            // Enviar la respuesta del Asesor IA de vuelta al chat de WhatsApp
            if (aiResponse && accessToken) {
              await sendWhatsAppMessage({
                phoneNumberId,
                to: senderPhone,
                text: aiResponse,
                accessToken
              });
            }
          }
        }
      }
      return NextResponse.json({ status: 'EVENT_RECEIVED' }, { status: 200 });
    }

    return NextResponse.json({ status: 'NOT_A_WHATSAPP_EVENT' }, { status: 200 });
  } catch (error: any) {
    console.error("[WhatsApp Webhook Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
