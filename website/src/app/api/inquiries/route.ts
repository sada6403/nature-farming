import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Forward to backend server
    const clientIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '';

    const backendRes = await fetch(`${BACKEND_URL}/api/inquiries`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': clientIp,
      },
      body: JSON.stringify(body),
    });

    const data = await backendRes.json().catch(() => ({}));
    return NextResponse.json(data, {
      status: backendRes.status,
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (error: any) {
    console.error('Website Inquiries API forward error:', error);
    return NextResponse.json(
      { success: false, error: 'Unable to submit your inquiry. Please try again later.' },
      { status: 500 }
    );
  }
}
