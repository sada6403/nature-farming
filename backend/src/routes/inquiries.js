const express = require('express');
const nodemailer = require('nodemailer');
const { query } = require('../config/db');
const { authenticate, requireAdmin } = require('../middleware/auth');
const { inquiryRateLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

function escapeHtml(val) {
  return String(val ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

// POST /api/inquiries (Public with rate limit)
router.post('/', inquiryRateLimiter, async (req, res) => {
  try {
    const { type, full_name, email, phone, subject, message, district, assigned_branch_id, website } = req.body;

    // Honeypot check: if website field is filled, silently return 201 to fool bots
    if (website) {
      return res.status(201).json({ success: true });
    }

    if (!type || !['contact', 'farmer_interest'].includes(type)) {
      return res.status(400).json({ success: false, error: 'Valid inquiry type is required' });
    }
    if (!full_name || full_name.trim().length < 2) {
      return res.status(400).json({ success: false, error: 'Valid name is required' });
    }
    if (!phone || phone.trim().length < 7) {
      return res.status(400).json({ success: false, error: 'Valid phone number is required' });
    }

    if (type === 'contact') {
      if (!email) return res.status(400).json({ success: false, error: 'Email is required for general contact' });
      if (!message) return res.status(400).json({ success: false, error: 'Message is required' });
    }

    const result = await query(
      `INSERT INTO inquiries (
        type, full_name, email, phone, subject, message, district, assigned_branch_id, status, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'new', NOW(), NOW())
      RETURNING *`,
      [
        type,
        full_name.trim(),
        email ? email.trim() : null,
        phone.trim(),
        subject ? subject.trim() : null,
        message ? message.trim() : null,
        district ? district.trim() : null,
        assigned_branch_id || null,
      ]
    );

    return res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Inquiry submission error:', error);
    return res.status(500).json({ success: false, error: 'Failed to process inquiry' });
  }
});

// GET /api/inquiries (Admin only)
router.get('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { type, status } = req.query;

    let sql = `
      SELECT 
        i.*,
        b.name as branch_name,
        b.phone as branch_phone,
        b.email as branch_email,
        b.manager_name as branch_manager_name
      FROM inquiries i
      LEFT JOIN branches b ON i.assigned_branch_id = b.id
      WHERE 1=1
    `;
    const params = [];

    if (type && type !== 'all') {
      params.push(type);
      sql += ` AND i.type = $${params.length}`;
    }

    if (status && status !== 'all') {
      params.push(status);
      sql += ` AND i.status = $${params.length}`;
    }

    sql += ' ORDER BY i.created_at DESC';

    const result = await query(sql, params);
    return res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Fetch inquiries error:', error);
    return res.status(500).json({ success: false, error: 'Failed to retrieve inquiries' });
  }
});

// PATCH /api/inquiries/:id (Admin only)
router.patch('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, admin_notes, assigned_branch_id } = req.body;

    const result = await query(
      `UPDATE inquiries SET
        status = COALESCE($1, status),
        admin_notes = COALESCE($2, admin_notes),
        assigned_branch_id = CASE WHEN $3::text IS NOT NULL THEN $3::uuid ELSE assigned_branch_id END,
        updated_at = NOW()
      WHERE id = $4
      RETURNING *`,
      [status, admin_notes, assigned_branch_id, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Inquiry not found' });
    }

    return res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Update inquiry error:', error);
    return res.status(500).json({ success: false, error: 'Failed to update inquiry' });
  }
});

// DELETE /api/inquiries/:id (Admin only)
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query('DELETE FROM inquiries WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Inquiry not found' });
    }
    return res.json({ success: true, message: 'Inquiry deleted successfully' });
  } catch (error) {
    console.error('Delete inquiry error:', error);
    return res.status(500).json({ success: false, error: 'Failed to delete inquiry' });
  }
});

// POST /api/inquiries/:id/email (Admin only - send email to branch manager)
router.post('/:id/email', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { branchId } = req.body;

    const inqRes = await query('SELECT * FROM inquiries WHERE id = $1', [id]);
    if (inqRes.rows.length === 0) return res.status(404).json({ success: false, error: 'Inquiry not found' });
    const inquiry = inqRes.rows[0];

    const targetBranchId = branchId || inquiry.assigned_branch_id;
    if (!targetBranchId) {
      return res.status(400).json({ success: false, error: 'Please assign a branch before sending email' });
    }

    const branchRes = await query('SELECT * FROM branches WHERE id = $1', [targetBranchId]);
    if (branchRes.rows.length === 0) return res.status(404).json({ success: false, error: 'Branch not found' });
    const branch = branchRes.rows[0];

    if (!branch.email) {
      return res.status(400).json({ success: false, error: 'Branch manager email is not configured' });
    }

    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = parseInt(process.env.SMTP_PORT || '587', 10);
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    if (!smtpHost || !smtpUser || !smtpPass) {
      return res.status(500).json({ success: false, error: 'SMTP server settings not configured in backend' });
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
        <div style="font-family: sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
          <div style="background-color: #166534; padding: 20px; color: #ffffff;">
            <h2 style="margin: 0; font-size: 20px;">Nature Farming - New Farmer Registration</h2>
          </div>
          <div style="padding: 24px;">
            <p>Dear <strong>${escapeHtml(branch.manager_name || 'Branch Manager')}</strong>,</p>
            <p>A new farmer registration inquiry has been received for <strong>${escapeHtml(branch.name)}</strong>.</p>
            <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
              <tr><th style="text-align:left;padding:8px;border:1px solid #cbd5e1;background:#f8fafc">Farmer Name</th><td style="padding:8px;border:1px solid #cbd5e1">${escapeHtml(inquiry.full_name)}</td></tr>
              <tr><th style="text-align:left;padding:8px;border:1px solid #cbd5e1;background:#f8fafc">Phone Number</th><td style="padding:8px;border:1px solid #cbd5e1">${escapeHtml(inquiry.phone)}</td></tr>
              <tr><th style="text-align:left;padding:8px;border:1px solid #cbd5e1;background:#f8fafc">Location / District</th><td style="padding:8px;border:1px solid #cbd5e1">${escapeHtml(inquiry.district || 'Not specified')}</td></tr>
              <tr><th style="text-align:left;padding:8px;border:1px solid #cbd5e1;background:#f8fafc">Email</th><td style="padding:8px;border:1px solid #cbd5e1">${escapeHtml(inquiry.email || 'N/A')}</td></tr>
              <tr><th style="text-align:left;padding:8px;border:1px solid #cbd5e1;background:#f8fafc">Message</th><td style="padding:8px;border:1px solid #cbd5e1">${escapeHtml(inquiry.message || 'N/A')}</td></tr>
            </table>
            <p>Please contact the applicant promptly to verify details and arrange an on-site visit.</p>
          </div>
          <div style="background-color: #f1f5f9; padding: 12px 24px; font-size: 12px; color: #64748b; text-align: center;">
            &copy; ${new Date().getFullYear()} Nature Farming (Pvt) Ltd. All rights reserved.
          </div>
        </div>
      `,
    });

    // Mark as contacted & assign branch
    await query(
      "UPDATE inquiries SET status = 'contacted', assigned_branch_id = $1, updated_at = NOW() WHERE id = $2",
      [targetBranchId, id]
    );

    return res.json({ success: true, message: `Notification email dispatched to ${branch.email}` });
  } catch (error) {
    console.error('Send manager email error:', error);
    return res.status(500).json({ success: false, error: 'Failed to send manager email: ' + error.message });
  }
});

module.exports = router;
