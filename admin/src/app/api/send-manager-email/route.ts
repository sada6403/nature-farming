import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

import { createSupabaseAdminClient } from '@/lib/supabase-server';

export const runtime = 'nodejs';

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function escapeHtml(value: unknown) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function errorResponse(message: string, status: number) {
  return NextResponse.json(
    { success: false, error: message },
    { status, headers: { 'Cache-Control': 'no-store' } },
  );
}

export async function POST(request: Request) {
  try {
    const authorization = request.headers.get('authorization');
    const token = authorization?.startsWith('Bearer ') ? authorization.slice(7) : null;
    if (!token) return errorResponse('Unauthorized', 401);

    const supabase = createSupabaseAdminClient();
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError || !userData.user) return errorResponse('Unauthorized', 401);

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userData.user.id)
      .single();
    if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
      return errorResponse('Forbidden', 403);
    }

    const body = await request.json();
    const inquiryId = typeof body?.inquiryId === 'string' ? body.inquiryId : '';
    const branchId = typeof body?.branchId === 'string' ? body.branchId : '';
    if (!uuidPattern.test(inquiryId) || !uuidPattern.test(branchId)) {
      return errorResponse('Invalid inquiry or branch identifier', 400);
    }

    const [{ data: inquiry, error: inquiryError }, { data: branch, error: branchError }] = await Promise.all([
      supabase.from('inquiries').select('*').eq('id', inquiryId).single(),
      supabase.from('branches').select('*').eq('id', branchId).single(),
    ]);

    if (inquiryError || !inquiry) return errorResponse('Inquiry not found', 404);
    if (branchError || !branch) return errorResponse('Branch not found', 404);
    if (!branch.email) return errorResponse('Branch manager email not configured', 400);

    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = Number(process.env.SMTP_PORT);
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    if (!smtpHost || !smtpPort || !smtpUser || !smtpPass) {
      throw new Error('SMTP is not configured');
    }

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: { user: smtpUser, pass: smtpPass },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_FROM || smtpUser,
      to: branch.email,
      subject: `New Farmer Registration Request - ${inquiry.full_name}`,
      html: `
        <div style="font-family: sans-serif; line-height: 1.6; color: #333">
          <h2 style="color: #166534">New Farmer Registration</h2>
          <p>Hello <strong>${escapeHtml(branch.manager_name || 'Manager')}</strong>,</p>
          <p>A new farmer has requested to join <strong>${escapeHtml(branch.name)}</strong>.</p>
          <table style="width: 100%; border-collapse: collapse">
            <tr><th style="text-align:left;padding:8px;border:1px solid #ddd">Farmer</th><td style="padding:8px;border:1px solid #ddd">${escapeHtml(inquiry.full_name)}</td></tr>
            <tr><th style="text-align:left;padding:8px;border:1px solid #ddd">Phone</th><td style="padding:8px;border:1px solid #ddd">${escapeHtml(inquiry.phone)}</td></tr>
            <tr><th style="text-align:left;padding:8px;border:1px solid #ddd">Location</th><td style="padding:8px;border:1px solid #ddd">${escapeHtml(inquiry.district || 'N/A')}</td></tr>
            <tr><th style="text-align:left;padding:8px;border:1px solid #ddd">Email</th><td style="padding:8px;border:1px solid #ddd">${escapeHtml(inquiry.email || 'N/A')}</td></tr>
            <tr><th style="text-align:left;padding:8px;border:1px solid #ddd">Message</th><td style="padding:8px;border:1px solid #ddd">${escapeHtml(inquiry.message || 'N/A')}</td></tr>
          </table>
          <p>Please contact the farmer and proceed with the field evaluation.</p>
        </div>`,
    });

    const { error: updateError } = await supabase
      .from('inquiries')
      .update({
        status: 'contacted',
        assigned_branch_id: branchId,
        admin_notes: `Manager notified by email on ${new Date().toISOString()}`,
      })
      .eq('id', inquiryId);
    if (updateError) throw updateError;

    return NextResponse.json(
      { success: true, message: 'Email sent successfully' },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (error) {
    console.error('Manager email API error:', error instanceof Error ? error.message : error);
    return errorResponse('Unable to send the email', 500);
  }
}
