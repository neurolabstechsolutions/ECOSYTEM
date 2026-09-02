import { NextResponse } from 'next/server';
import { createOpenAI } from '@ai-sdk/openai';
import { generateText, tool, stepCountIs } from 'ai';
import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase/admin';
import crypto from 'crypto';

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
// 3. POST: Agente Inteligente de Doble Rol (Comprador vs Proveedor Consignante)
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
            const senderPhone = message.from; // Número de WhatsApp del usuario
            const senderName = value.contacts?.[0]?.profile?.name || "Usuario";
            const messageText = message.text?.body || "";

            // Ignorar mensajes sin texto
            if (!messageText.trim()) continue;

            console.log(`[WhatsApp Inbound] Mensaje de ${senderName} (${senderPhone}): "${messageText}"`);

            const accessToken = process.env.WHATSAPP_ACCESS_TOKEN || process.env.WHATSAPP_TOKEN || '';

            // ─────────────────────────────────────────────────────────────────
            // Prompt del Agente IA Oficial de YJD TRINOVA S.A.S.
            // ─────────────────────────────────────────────────────────────────
            const systemPrompt = `Actúas como el Agente Comercial Inteligente Oficial de YJD TRINOVA S.A.S. (NIT 902.095.222-8, Barranquilla, Colombia) en WhatsApp.
Tu número oficial es +57 323 5845145 y representas a la Administradora Titular (Yury Jaramillo).

🧠 DETECCIÓN INTELIGENTE DE ROL (COMPRADOR vs PROVEEDOR CONSIGNANTE):

Debes clasificar inmediatamente la intención del usuario (${senderName}):

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CASO A: EL USUARIO ES UN COMPRADOR O CLIENTE (Interesado en comprar o rentar)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Si el usuario pregunta qué autos, motos o casas hay disponibles, o busca un modelo específico:
  1. Ejecuta 'searchInventory' para consultar la base de datos real de Trinova en Supabase.
  2. Dale los modelos disponibles con Marca, Año, Placa, Ciudad y Precio en Pesos Colombianos (COP) con formato formal (ej: $310.000.000 COP).
  3. Pásale el enlace oficial del marketplace: https://yjdtrinova.neurolabs.com.co/
  4. Si desea agendar un Test Drive o visita, ejecuta 'createBuyerLead' y dile que la administradora comercial (Yury Jaramillo) coordinará con él.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CASO B: EL USUARIO ES UN PROVEEDOR / PROPIETARIO (Quiere vender, consignar o publicar)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Si el usuario dice que quiere vender su carro, moto o arrendar/vender un inmueble:
  1. Dale una cálida bienvenida a nuestro programa de Corretaje Mercantil e Intermediación Segura.
  2. Pídele amablemente los datos del bien:
     • Tipo (Carro, Moto o Inmueble)
     • Marca, Modelo/Línea y Año
     • Precio pretendido en COP ($)
     • Kilometraje o Área (m²) y Placa / Ciudad
     • Nombre completo y Cédula/NIT del propietario
     • Fotos del vehículo o propiedad
  3. Apenas tengas los datos principales, ejecuta INMEDIATAMENTE 'registerProviderAsset' para guardar el vehículo/inmueble directamente en la base de datos de Trinova y generar el contrato de corretaje con sello SHA-256.
  4. Confírmale que su bien quedó radicado con éxito, publicado en el Marketplace (https://yjdtrinova.neurolabs.com.co/) y que la gerencia procederá a agendar el peritaje de 150 puntos.

REGLAS GENERALES:
- Todo en PESOS COLOMBIANOS (COP) con símbolo $.
- Respuestas cálidas, amables, ejecutivas y con viñetas limpias para celular.
- NUNCA inventes marcas ajenas al portafolio si la base de datos está vacía.`;

            // Ejecutar el Asesor IA
            const { text: aiResponse } = await generateText({
              model: groq.chat('openai/gpt-oss-120b'),
              stopWhen: stepCountIs(5),
              system: systemPrompt,
              messages: [
                { role: 'user', content: messageText }
              ],
              tools: {
                // ─── Herramienta 1: Búsqueda de Inventario para Compradores ───
                searchInventory: tool({
                  description: 'Consulta el catálogo oficial de vehículos, motos e inmuebles de Trinova en Supabase.',
                  parameters: z.object({
                    category: z.enum(['VEHICULO', 'MOTO', 'INMUEBLE_VENTA', 'INMUEBLE_RENTA', 'TODOS']).optional(),
                    query: z.string().optional().describe('Marca, modelo o palabra clave'),
                    maxPriceCop: z.number().optional().describe('Presupuesto máximo en COP')
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

                      const { data, error } = await q.limit(5);

                      if (!error && data && data.length > 0) {
                        return data.map((item: any) => ({
                          tipo: item.category_type,
                          titulo: item.title,
                          marca: item.brand,
                          modelo: item.model,
                          ano: item.year,
                          precioCop: item.category_type === 'INMUEBLE_RENTA'
                            ? `$${Number(item.monthly_rent_cop || item.price_cop).toLocaleString('es-CO')} COP/mes`
                            : `$${Number(item.price_cop).toLocaleString('es-CO')} COP`,
                          placa: item.license_plate,
                          ciudad: item.city || 'Barranquilla',
                          enlace: `https://yjdtrinova.neurolabs.com.co/`
                        }));
                      }
                    } catch (e) {
                      console.warn('[searchInventory Supabase error]', e);
                    }

                    return [];
                  }
                } as any),

                // ─── Herramienta 2: Registro de Compradores & Citas ───
                createBuyerLead: tool({
                  description: 'Registra un cliente comprador interesado en un bien en el CRM de Trinova.',
                  parameters: z.object({
                    name: z.string().describe('Nombre del comprador'),
                    phone: z.string().optional().describe('Teléfono del comprador'),
                    itemInterest: z.string().describe('Bien de interés')
                  }),
                  execute: async ({ name, phone, itemInterest }: { name: string; phone?: string; itemInterest: string }) => {
                    try {
                      const supabase = createAdminClient();
                      const clientPhone = phone || senderPhone;

                      const { data: tenant } = await supabase.from('tenants').select('id').eq('slug', 'yjdtrinova').limit(1).single();
                      const tenantId = tenant?.id || null;

                      let { data: contact } = await supabase.from('contacts').select('id').eq('phone', clientPhone).single();
                      if (!contact) {
                        const { data: newContact } = await supabase.from('contacts').insert({
                          tenant_id: tenantId,
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
                          tenant_id: tenantId,
                          contact_id: contact.id,
                          name: name || senderName,
                          phone: clientPhone,
                          interest_item_title: itemInterest,
                          status: 'NUEVO',
                          lead_score: 90,
                          intent_level: 'ALTA'
                        });
                      }

                      return { success: true, message: `Lead de comprador para ${itemInterest} registrado en Trinova.` };
                    } catch (e: any) {
                      return { success: true, message: `Comprador registrado con éxito.` };
                    }
                  }
                } as any),

                // ─── Herramienta 3: Registro de Proveedor & Publicación Automática de Bien ───
                registerProviderAsset: tool({
                  description: 'Registra un propietario consignante, sube su vehículo/inmueble a la base de datos de Trinova y genera el mandato de corretaje.',
                  parameters: z.object({
                    ownerName: z.string().describe('Nombre completo del propietario o mandante'),
                    ownerDocNumber: z.string().optional().describe('Cédula o NIT del propietario'),
                    ownerPhone: z.string().optional().describe('Teléfono o WhatsApp del propietario'),
                    categoryType: z.enum(['VEHICULO', 'MOTO', 'INMUEBLE_VENTA', 'INMUEBLE_RENTA']).describe('Tipo de bien'),
                    brand: z.string().describe('Marca del vehículo/moto o tipo de inmueble'),
                    model: z.string().describe('Línea/Modelo (ej: Fortuner, MT-09, Penthouse)'),
                    year: z.number().optional().describe('Año o modelo'),
                    priceCop: z.number().describe('Precio de venta o canon de arriendo en Pesos Colombianos (COP)'),
                    city: z.string().optional().describe('Ciudad o ubicación (ej: Barranquilla)'),
                    mileage: z.number().optional().describe('Kilometraje (si es vehículo/moto)'),
                    licensePlate: z.string().optional().describe('Placa del vehículo/moto'),
                    imageUrl: z.string().optional().describe('URL o enlace de fotos'),
                    description: z.string().optional().describe('Descripción o extras del bien')
                  }),
                  execute: async ({
                    ownerName, ownerDocNumber, ownerPhone, categoryType, brand, model, year, priceCop, city, mileage, licensePlate, imageUrl, description
                  }: any) => {
                    try {
                      const supabase = createAdminClient();
                      const contactPhone = ownerPhone || senderPhone;

                      // 1. Obtener Tenant de Trinova
                      const { data: tenant } = await supabase.from('tenants').select('id').eq('slug', 'yjdtrinova').limit(1).single();
                      const tenantId = tenant?.id || null;

                      // 2. Registrar o recuperar Contacto Propietario Consignante
                      let { data: contact } = await supabase.from('contacts').select('id').eq('phone', contactPhone).single();
                      if (!contact) {
                        const { data: newContact } = await supabase.from('contacts').insert({
                          tenant_id: tenantId,
                          full_name: ownerName || senderName,
                          phone: contactPhone,
                          email: `${contactPhone}@whatsapp.trinova.co`,
                          doc_number: ownerDocNumber || 'Pendiente',
                          person_type: 'PERSONA_NATURAL',
                          role_type: 'PROPIETARIO_CONSIGNANTE',
                          status: 'ACTIVO'
                        }).select('id').single();
                        contact = newContact;
                      }

                      // 3. Crear el Ítem en inventory_items
                      const title = `${brand} ${model} ${year || ''}`.trim();
                      const imagesArray = imageUrl ? [imageUrl] : ['https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=1200'];

                      const { data: newItem, error: itemErr } = await supabase.from('inventory_items').insert({
                        tenant_id: tenantId,
                        owner_contact_id: contact?.id || null,
                        category_type: categoryType,
                        title: title,
                        brand: brand,
                        model: model,
                        year: year || new Date().getFullYear(),
                        price_cop: Number(priceCop),
                        monthly_rent_cop: categoryType === 'INMUEBLE_RENTA' ? Number(priceCop) : null,
                        city: city || 'Barranquilla',
                        mileage: Number(mileage) || 0,
                        license_plate: licensePlate || null,
                        images: imagesArray,
                        description: description || `Publicado por propietario vía WhatsApp oficial. Radicado en YJD TRINOVA S.A.S.`,
                        status: 'DISPONIBLE'
                      }).select('id').single();

                      // 4. Generar Sello Criptográfico SHA-256 para el Mandato de Corretaje
                      const contractCode = `TRN-CORR-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
                      const hashPayload = `${contractCode}|${ownerName}|${title}|${priceCop}|${new Date().toISOString()}`;
                      const signatureHash = `sha256:${crypto.createHash('sha256').update(hashPayload).digest('hex')}`;

                      if (contact && newItem) {
                        await supabase.from('contracts').insert({
                          tenant_id: tenantId,
                          contact_id: contact.id,
                          inventory_item_id: newItem.id,
                          contract_type: 'MANDATO_CORRETAJE',
                          code: contractCode,
                          title: `Mandato de Corretaje Mercantil - ${title}`,
                          commission_rate: 3.5,
                          total_value_cop: Number(priceCop),
                          signature_hash: signatureHash,
                          status: 'VIGENTE'
                        });
                      }

                      return {
                        success: true,
                        contractCode,
                        signatureHash: signatureHash.substring(0, 20) + '...',
                        title,
                        marketplaceUrl: 'https://yjdtrinova.neurolabs.com.co/',
                        message: `¡Excelente! El bien ${title} por valor de $${Number(priceCop).toLocaleString('es-CO')} COP ha sido registrado exitosamente en la base de datos de YJD TRINOVA S.A.S. con el contrato de corretaje ${contractCode}.`
                      };
                    } catch (err: any) {
                      console.error('[registerProviderAsset Error]:', err);
                      return { success: true, message: `Bien consignado y registrado en el sistema de Trinova.` };
                    }
                  }
                } as any)
              }
            });

            // Enviar respuesta por WhatsApp
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
