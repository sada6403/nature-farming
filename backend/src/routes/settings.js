const express = require('express');
const { query } = require('../config/db');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// GET /api/settings (Public)
router.get('/', async (req, res) => {
  try {
    const result = await query('SELECT * FROM company_settings WHERE id = 1');
    if (result.rows.length === 0) {
      return res.json({
        success: true,
        data: {
          id: 1,
          company_name: 'Nature Farming',
          tagline: "Sri Lanka's Leading Aloe Vera Partner",
          total_farmers: 5000,
          districts_count: 12,
        },
      });
    }
    return res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Fetch settings error:', error);
    return res.status(500).json({ success: false, error: 'Failed to retrieve company settings' });
  }
});

// PUT /api/settings (Admin only)
router.put('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const {
      company_name,
      tagline,
      logo_url,
      head_office_address,
      primary_phone,
      secondary_phone,
      primary_email,
      whatsapp_number,
      facebook_link,
      instagram_link,
      youtube_link,
      about_us,
      mission,
      vision,
      total_farmers,
      districts_count,
    } = req.body;

    const result = await query(
      `INSERT INTO company_settings (
        id, company_name, tagline, logo_url, head_office_address,
        primary_phone, secondary_phone, primary_email, whatsapp_number,
        facebook_link, instagram_link, youtube_link, about_us, mission, vision,
        total_farmers, districts_count, updated_at
      ) VALUES (
        1, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14,
        COALESCE($15, 5000), COALESCE($16, 12), NOW()
      )
      ON CONFLICT (id) DO UPDATE SET
        company_name = COALESCE(EXCLUDED.company_name, company_settings.company_name),
        tagline = COALESCE(EXCLUDED.tagline, company_settings.tagline),
        logo_url = COALESCE(EXCLUDED.logo_url, company_settings.logo_url),
        head_office_address = COALESCE(EXCLUDED.head_office_address, company_settings.head_office_address),
        primary_phone = COALESCE(EXCLUDED.primary_phone, company_settings.primary_phone),
        secondary_phone = COALESCE(EXCLUDED.secondary_phone, company_settings.secondary_phone),
        primary_email = COALESCE(EXCLUDED.primary_email, company_settings.primary_email),
        whatsapp_number = COALESCE(EXCLUDED.whatsapp_number, company_settings.whatsapp_number),
        facebook_link = COALESCE(EXCLUDED.facebook_link, company_settings.facebook_link),
        instagram_link = COALESCE(EXCLUDED.instagram_link, company_settings.instagram_link),
        youtube_link = COALESCE(EXCLUDED.youtube_link, company_settings.youtube_link),
        about_us = COALESCE(EXCLUDED.about_us, company_settings.about_us),
        mission = COALESCE(EXCLUDED.mission, company_settings.mission),
        vision = COALESCE(EXCLUDED.vision, company_settings.vision),
        total_farmers = COALESCE(EXCLUDED.total_farmers, company_settings.total_farmers),
        districts_count = COALESCE(EXCLUDED.districts_count, company_settings.districts_count),
        updated_at = NOW()
      RETURNING *`,
      [
        company_name || 'Nature Farming',
        tagline || null,
        logo_url || null,
        head_office_address || null,
        primary_phone || null,
        secondary_phone || null,
        primary_email || null,
        whatsapp_number || null,
        facebook_link || null,
        instagram_link || null,
        youtube_link || null,
        about_us || null,
        mission || null,
        vision || null,
        total_farmers ? parseInt(total_farmers, 10) : null,
        districts_count ? parseInt(districts_count, 10) : null,
      ]
    );

    return res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Update settings error:', error);
    return res.status(500).json({ success: false, error: 'Failed to update company settings' });
  }
});

module.exports = router;
