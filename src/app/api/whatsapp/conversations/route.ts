import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const res = await fetch('https://ecosytem.onrender.com/conversations', {
      cache: 'no-store',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!res.ok) {
      return NextResponse.json({ conversations: [], total: 0, status: 'DISCONNECTED' });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ conversations: [], total: 0, status: 'OFFLINE' });
  }
}
