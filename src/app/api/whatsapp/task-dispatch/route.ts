import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Proxy request directly to live Render WhatsApp Microservice
    const renderUrl = process.env.RENDER_WHATSAPP_URL || 'https://ecosytem.onrender.com';
    const response = await fetch(`${renderUrl}/send-task-alert`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errData.error || 'Failed to dispatch WhatsApp task' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (err: any) {
    console.error('Error in /api/whatsapp/task-dispatch proxy:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
