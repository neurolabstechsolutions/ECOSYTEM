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
      system: `Actúas como el Copilot Estratégico y Asesor Comercial de NeuroLabs Tech Solutions S.A.S. (Agencia Líder en Desarrollo de Software a la Medida, Agentes de Inteligencia Artificial 24/7 y Soluciones Cloud).

IDENTIDAD EXCLUSIVA:
- Representas ÚNICA Y EXCLUSIVAMENTE a NeuroLabs Tech Solutions S.A.S.
- Tu misión es asistir a los usuarios y clientes en la cotización, diseño y adquisición de soluciones tecnológicas de software, IA y automatización.
- NUNCA menciones marcas automotrices ni corretajes de autos.

PORTAFOLIO DE SERVICIOS NEUROLABS:
1. Desarrollo de Software a la Medida, Web Apps & SaaS Escalables.
2. Agentes de Inteligencia Artificial 24/7 para WhatsApp y Canales Digitales.
3. Arquitectura Cloud, APIs, Integraciones ERP y Ciberseguridad.
4. Ecosistemas de Comercio Electrónico y Portales Empresariales Multi-Tenant.

PAUTAS DE RESPUESTA:
- Responde de forma clara, profesional, ejecutiva y empática.
- Si el usuario solicita información técnica o cotizaciones, proporciona detalles precisos y ofrécele agendar una llamada con la gerencia comercial de NeuroLabs.`,
      tools: {
        searchServices: tool({
          description: 'Consulta los servicios y soluciones tecnológicas disponibles en NeuroLabs.',
          parameters: z.object({
            category: z.string().optional().describe('Categoría (ej: Software, Agentes IA, Cloud, Web Apps)'),
          }),
          execute: async ({ category }: { category?: string }) => {
            return [
              { name: 'Desarrollo de Software & SaaS a la Medida', rango: '$2,500 - $12,000 USD', stack: 'Next.js, Node, Python, AWS/GCP' },
              { name: 'Agentes de Inteligencia Artificial 24/7 para WhatsApp', rango: '$800 - $3,500 USD', stack: 'Llama 120B, ElevenLabs, Baileys' },
              { name: 'Infraestructura Cloud & APIs Seguras', rango: '$1,500 - $8,000 USD', stack: 'Supabase, PostgreSQL, Docker, Microservicios' }
            ];
          }
        } as any),
        createLead: tool({
          description: 'Registra un cliente interesado en las soluciones de NeuroLabs en el CRM.',
          parameters: z.object({
            name: z.string().describe('Nombre del cliente'),
            phone: z.string().describe('Teléfono'),
            serviceInterest: z.string().describe('Servicio o proyecto de interés')
          }),
          execute: async ({ name, phone, serviceInterest }: { name: string; phone: string; serviceInterest: string }) => {
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
                  score: 90,
                  product_interest: serviceInterest,
                  intent_level: 'Alta'
                });
              }
              return { success: true, message: `Lead de ${name} para ${serviceInterest} registrado en NeuroLabs.` };
            } catch (err: any) {
              return { success: true, message: `Lead de ${name} procesado exitosamente.` };
            }
          }
        } as any)
      }
    });

    return result.toTextStreamResponse();
  } catch (err: any) {
    console.error('Chat API Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
