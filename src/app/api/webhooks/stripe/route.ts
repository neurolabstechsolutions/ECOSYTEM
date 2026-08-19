import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const signature = req.headers.get('stripe-signature');
    const body = await req.text();

    // En un entorno de producción, aquí verificaríamos la firma usando la librería de stripe:
    // const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    // const event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
    
    // Simulación del evento parseado (ya que no instalamos Stripe puro en este momento)
    const event = JSON.parse(body);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const customerEmail = session.customer_details?.email;
      
      console.log(`[STRIPE] Pago completado para ${customerEmail}. Añadiendo tokens...`);

      // Iniciar cliente de Supabase
      const supabase = await createClient();

      // Aquí buscaríamos el tenant por email y le actualizaríamos su saldo de tokens
      // await supabase.from('tenants').update({ token_balance: 10000 }).eq('email', customerEmail);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error('Error procesando webhook de Stripe:', error);
    return NextResponse.json({ error: 'Webhook Error' }, { status: 400 });
  }
}
