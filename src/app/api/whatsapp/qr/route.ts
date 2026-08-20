import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const res = await fetch('https://ecosytem.onrender.com/qr', {
      cache: 'no-store',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!res.ok) {
      return NextResponse.json({ status: 'WAKING_UP', qr: null, phone: null });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ status: 'CONNECTING', qr: null, phone: null });
  }
}
