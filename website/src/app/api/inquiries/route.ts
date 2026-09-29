import { createHash } from 'node:crypto';

import { NextResponse } from 'next/server';
import { z } from 'zod';

import { createSupabaseAdminClient } from '@/lib/supabase-server';

export const runtime = 'nodejs';

const inquirySchema = z.object({
  type: z.enum(['contact', 'farmer_interest']),
  full_name: z.string().trim().min(2).max(120),
  email: z.union([z.string().trim().email().max(254), z.literal('')]).optional(),
  phone: z.string().trim().min(7).max(24).regex(/^[0-9+()\-\s]+$/),
  subject: z.string().trim().max(160).optional(),
  message: z.string().trim().max(3000).optional(),
  district: z.string().trim().max(120).optional(),
  assigned_branch_id: z.union([z.string().uuid(), z.literal(''), z.null()]).optional(),
  website: z.string().max(0).optional(),
}).superRefine((value, context) => {
  if (value.type === 'contact') {
    if (!value.email) {
      context.addIssue({ code: 'custom', path: ['email'], message: 'Email is required' });
    }
    if (!value.subject) {
      context.addIssue({ code: 'custom', path: ['subject'], message: 'Subject is required' });
    }
    if (!value.message) {
      context.addIssue({ code: 'custom', path: ['message'], message: 'Message is required' });
    }
  }
});

function clientAddress(request: Request) {
  const forwarded = request.headers.get('x-forwarded-for');
  return forwarded?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown';
}

function jsonError(message: string, status: number) {
  return NextResponse.json(
    { success: false, error: message },
    { status, headers: { 'Cache-Control': 'no-store' } },
  );
}

export async function POST(request: Request) {
  const contentLength = Number(request.headers.get('content-length') || 0);
  if (contentLength > 20_000) {
    return jsonError('Request body is too large', 413);
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return jsonError('Invalid JSON body', 400);
  }

  const parsed = inquirySchema.safeParse(body);
  if (!parsed.success) {
    return jsonError('Please check the submitted information', 422);
  }

  // Honeypot submissions receive a normal response so bots cannot tune around it.
  if (parsed.data.website) {
    return NextResponse.json({ success: true }, { status: 201 });
  }

  try {
    const supabase = createSupabaseAdminClient();
    const salt = process.env.INQUIRY_RATE_LIMIT_SALT;
    if (!salt) {
      throw new Error('Missing INQUIRY_RATE_LIMIT_SALT');
    }

    const ipHash = createHash('sha256')
      .update(`${salt}:${clientAddress(request)}`)
      .digest('hex');
    const windowStart = new Date(Date.now() - 15 * 60 * 1000).toISOString();

    const { count, error: rateError } = await supabase
      .from('inquiry_rate_limits')
      .select('id', { count: 'exact', head: true })
      .eq('ip_hash', ipHash)
      .gte('created_at', windowStart);

    if (rateError) throw rateError;
    if ((count ?? 0) >= 5) {
      return jsonError('Too many requests. Please try again later.', 429);
    }

    const { error: logError } = await supabase
      .from('inquiry_rate_limits')
      .insert({ ip_hash: ipHash });
    if (logError) throw logError;

    // Opportunistic cleanup keeps the small rate-limit table bounded.
    await supabase
      .from('inquiry_rate_limits')
      .delete()
      .lt('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    const data = { ...parsed.data };
    delete data.website;
    const { error } = await supabase.from('inquiries').insert({
      ...data,
      email: data.email || null,
      subject: data.subject || null,
      message: data.message || null,
      district: data.district || null,
      assigned_branch_id: data.assigned_branch_id || null,
    });

    if (error) throw error;

    return NextResponse.json(
      { success: true },
      { status: 201, headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (error) {
    console.error('Inquiry API error:', error instanceof Error ? error.message : error);
    return jsonError('Unable to submit your request right now', 500);
  }
}
