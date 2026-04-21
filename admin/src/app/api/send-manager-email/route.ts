import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase Client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function POST(request: Request) {
  try {
    const { inquiryId, branchId } = await request.json();

    if (!inquiryId || !branchId) {
      return NextResponse.json({ error: 'Missing inquiryId or branchId' }, { status: 400 });
    }

    // 1. Fetch Inquiry details
    const { data: inquiry, error: inquiryError } = await supabase
      .from('inquiries')
      .select('*')
      .eq('id', inquiryId)
      .single();

    if (inquiryError || !inquiry) {
      return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 });
    }

    // 2. Fetch Branch/Manager details
    const { data: branch, error: branchError } = await supabase
      .from('branches')
      .select('*')
      .eq('id', branchId)
      .single();

    if (branchError || !branch) {
      return NextResponse.json({ error: 'Branch not found' }, { status: 404 });
    }

    if (!branch.email) {
      return NextResponse.json({ error: 'Branch manager email not configured' }, { status: 400 });
    }

    // 3. Configure SMTP Transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // 4. Construct Email Content
    const mailOptions = {
      from: `"${process.env.EMAIL_FROM}" <${process.env.SMTP_USER}>`,
      to: branch.email,
      subject: `New Farmer Registration Request - ${inquiry.full_name}`,
      html: `
        <div style="font-family: sans-serif; line-height: 1.6; color: #333;">
          <h2 style="color: #166534;">New Farmer Registration</h2>
          <p>Hello <strong>${branch.manager_name || 'Manager'}</strong>,</p>
          <p>A new farmer has expressed interest in joining your branch (<strong>${branch.name}</strong>). Here are the details:</p>
          
          <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <tr style="background-color: #f0fdf4;">
              <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold; width: 150px;">Farmer Name</td>
              <td style="padding: 10px; border: 1px solid #ddd;">${inquiry.full_name}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Phone Number</td>
              <td style="padding: 10px; border: 1px solid #ddd;">${inquiry.phone}</td>
            </tr>
            <tr style="background-color: #f0fdf4;">
              <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Location / Area</td>
              <td style="padding: 10px; border: 1px solid #ddd;">${inquiry.district}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Email</td>
              <td style="padding: 10px; border: 1px solid #ddd;">${inquiry.email || 'N/A'}</td>
            </tr>
            <tr style="background-color: #f0fdf4;">
              <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Experience/Message</td>
              <td style="padding: 10px; border: 1px solid #ddd;">${inquiry.message || 'No message provided'}</td>
            </tr>
          </table>
          
          <p style="margin-top: 30px;">Please contact the farmer and proceed with the field evaluation process.</p>
          
          <div style="margin-top: 40px; font-size: 12px; color: #777; border-top: 1px solid #eee; padding-top: 10px;">
            This is an automated notification from the Natural Farming Portal.
          </div>
        </div>
      `,
    };

    // 5. Send Email
    await transporter.sendMail(mailOptions);

    // 6. Update Inquiry status to 'contacted'
    await supabase
      .from('inquiries')
      .update({ status: 'contacted', admin_notes: `Notified branch manager: ${branch.manager_name} (${branch.email}) on ${new Date().toLocaleString()}` })
      .eq('id', inquiryId);

    return NextResponse.json({ success: true, message: 'Email sent successfully' });

  } catch (error: any) {
    console.error('Email API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
