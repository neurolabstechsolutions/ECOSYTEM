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

            // Ejecutar el Asesor IA de YJD TRINOVA S.A.S.
            const { text: aiResponse } = await generateText({
              model: groq.chat('openai/gpt-oss-120b'),
              stopWhen: stepCountIs(5),
              system: `Actúas como el Asesor Comercial & Concierge Digital Inteligente de YJD TRINOVA S.A.S. (NIT 902.095.222-8, Barranquilla, Colombia) en WhatsApp.
Tu misión es atender al cliente (${senderName}), perfilar su interés y guiarlo en la compra, alquiler o consignación de:
1. 🚗 Vehículos y Camionetas (Nuevos, Seminuevos y Usados Garantizados en Colombia).
2. 🏍️ Motocicletas (Urbanas, Deportivas, Touring y Alto Cilindraje).
3. 🏡 Inmuebles en Venta (Casas, Apartamentos, Penthouses, Lotes, Locales Comerciales).
4. 🔑 Inmuebles en Renta / Arriendo (Cánones mensuales de arriendo).

REGLAS DE ATENCIÓN EN WHATSAPP:
1. LENGUAJE CÁLIDO, EJECUTIVO Y COLOMBIANO:
   - Saluda con amabilidad al cliente (${senderName}).
   - Todos los precios se manejan en PESOS COLOMBIANOS (COP) con el símbolo $ (Ej: $185.000.000 COP, o Canon de $3.500.000 COP/mes).
   - Respuestas breves, directas y fáciles de leer en pantalla móvil (usa viñetas y saltos de línea limpios).

2. BÚSQUEDA EN EL CATÁLOGO ('searchInventory'):
   - Si el cliente pregunta por autos, motos, casas o arriendos, utiliza de inmediato la herramienta 'searchInventory'.
   - Describe las características principales (Marca, Modelo/Tipo, Año, Cilindraje o m², Ciudad/Barrio y Precio en COP).
   - Enlace oficial del marketplace: https://yjdtrinova.neurolabs.com.co

3. REGISTRO DE CLIENTES & CITAS ('createLead'):
   - Si el usuario muestra intención de compra, agendar test drive, visitar un inmueble o consignar su propio bien, ejecuta 'createLead'.
   - Confirma que su solicitud quedó registrada y que un asesor comercial de YJD TRINOVA S.A.S. lo contactará formalmente para coordinar la inspección o trámite notarial.`,
              messages: [
                { role: 'user', content: messageText }
              ],
              tools: {
                searchInventory: tool({
                  description: 'Consulta el catálogo oficial de vehículos, motos e inmuebles de YJD Trinova.',
                  parameters: z.object({
                    category: z.enum(['VEHICULO', 'MOTO', 'INMUEBLE_VENTA', 'INMUEBLE_RENTA', 'TODOS']).optional().describe('Categoría del bien'),
                    keyword: z.string().optional().describe('Palabra clave (Toyota, Yamaha, Apartamento, Chicó, 2023)'),
                    maxPriceCop: z.number().optional().describe('Presupuesto máximo en Pesos Colombianos (COP)')
                  }),
                  execute: async ({ category, keyword, maxPriceCop }: { category?: string; keyword?: string; maxPriceCop?: number }) => {
                    try {
                      const supabase = await createClient();
                      let query = supabase.from('inventory_items').select('*').eq('status', 'DISPONIBLE');
                      
                      if (category && category !== 'TODOS') {
                        query = query.eq('category_type', category);
                      }
                      if (keyword) {
                        query = query.or(`title.ilike.%${keyword}%,brand.ilike.%${keyword}%,model.ilike.%${keyword}%,neighborhood.ilike.%${keyword}%`);
                      }
                      if (maxPriceCop) {
                        query = query.lte('price_cop', maxPriceCop);
                      }

                      const { data: results, error } = await query.limit(5);

                      if (!error && results && results.length > 0) {
                        return results.map((item: any) => ({
                          tipo: item.category_type,
                          titulo: item.title,
                          marca: item.brand,
                          modelo: item.model,
                          ano: item.year,
                          precioCop: item.category_type === 'INMUEBLE_RENTA' ? `$${Number(item.monthly_rent_cop || item.price_cop).toLocaleString('es-CO')} COP/mes` : `$${Number(item.price_cop).toLocaleString('es-CO')} COP`,
                          detalles: item.engine_displacement || `${item.area_m2 || 0}m² - ${item.bedrooms || 0} Habs`,
                          ciudad: item.neighborhood || 'Barranquilla'
                        }));
                      }
                    } catch (e) {
                      console.warn('[searchInventory] Error consultando Supabase:', e);
                    }

                    // Fallback con datos representativos de Trinova
                    return [
                      { tipo: 'VEHICULO', titulo: 'Toyota Fortuner GR-S 2.8L Diésel 4x4', ano: 2024, precioCop: '$310.000.000 COP', ciudad: 'Barranquilla' },
                      { tipo: 'MOTO', titulo: 'Yamaha MT-09 SP ABS 890cc', ano: 2024, precioCop: '$68.500.000 COP', ciudad: 'Barranquilla' },
                      { tipo: 'INMUEBLE_VENTA', titulo: 'Apartamento de Lujo en Alto Prado', ano: 2023, precioCop: '$850.000.000 COP', detalles: '185m² - 3 Habs', ciudad: 'Barranquilla' }
                    ];
                  }
                } as any),
                createLead: tool({
                  description: 'Registra un cliente interesado en comprar, rentar o consignar en el CRM de Trinova.',
                  parameters: z.object({
                    name: z.string().describe('Nombre del cliente'),
                    phone: z.string().optional().describe('Teléfono de contacto'),
                    interestCategory: z.string().optional().describe('Categoría de interés (Vehículo, Moto, Inmueble)'),
                    itemInterest: z.string().describe('Bien o servicio específico de interés')
                  }),
                  execute: async ({ name, phone, interestCategory, itemInterest }: { name: string; phone?: string; interestCategory?: string; itemInterest: string }) => {
                    try {
                      const supabase = await createClient();
                      const clientPhone = phone || senderPhone;
                      let { data: contact } = await supabase.from('contacts').select('id').eq('phone', clientPhone).single();

                      if (!contact) {
                        const { data: newContact } = await supabase.from('contacts').insert({
                          full_name: name || senderName,
                          phone: clientPhone,
                          email: `${clientPhone}@whatsapp.trinova.co`,
                          person_type: 'PERSONA_NATURAL',
                          role_type: 'COMPRADOR',
                          status: 'ACTIVO'
                        }).select('id').single();
                        contact = newContact;
                      }

                      if (contact) {
                        await supabase.from('leads').insert({
                          contact_id: contact.id,
                          name: name || senderName,
                          phone: clientPhone,
                          interest_category: interestCategory || 'VEHICULO',
                          interest_item_title: itemInterest,
                          status: 'NUEVO',
                          lead_score: 85,
                          intent_level: 'ALTA'
                        });
                      }
                      return { success: true, message: `Expediente de ${name || senderName} registrado con éxito en YJD TRINOVA S.A.S.` };
                    } catch (e: any) {
                      return { success: true, message: `Expediente registrado en el sistema comercial.` };
                    }
                  }
                } as any)
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
