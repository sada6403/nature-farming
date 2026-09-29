import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization') || '';
    const body = await request.json();
    const inquiryId = body?.inquiryId;
    const branchId = body?.branchId;

    if (!inquiryId || !branchId) {
      return NextResponse.json({ success: false, error: 'inquiryId and branchId are required' }, { status: 400 });
    }

    const res = await fetch(`${BACKEND_URL}/api/inquiries/${inquiryId}/email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
      body: JSON.stringify({ branchId }),
    });

    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Internal proxy error' }, { status: 500 });
  }
}
