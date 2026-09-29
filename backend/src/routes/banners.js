const express = require('express');
const { query } = require('../config/db');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// GET /api/banners (Public / Admin)
router.get('/', async (req, res) => {
  try {
    const { all } = req.query;
    let sql = 'SELECT * FROM ads_banners';
    if (all !== 'true') {
      sql += ' WHERE is_active = true';
    }
    sql += ' ORDER BY display_order ASC, created_at DESC';

    const result = await query(sql);
    return res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Fetch banners error:', error);
    return res.status(500).json({ success: false, error: 'Failed to retrieve promotional banners' });
  }
});

// POST /api/banners (Admin only)
router.post('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { title, image_url, link, is_active = true, display_order = 0 } = req.body;
    if (!image_url) {
      return res.status(400).json({ success: false, error: 'Banner image URL is required' });
    }

    const result = await query(
      `INSERT INTO ads_banners (title, image_url, link, is_active, display_order, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
       RETURNING *`,
      [title || '', image_url, link || '', Boolean(is_active), parseInt(display_order || '0', 10)]
    );

    return res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Create banner error:', error);
    return res.status(500).json({ success: false, error: 'Failed to save banner' });
  }
});

// PUT /api/banners/:id (Admin only)
router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, image_url, link, is_active, display_order } = req.body;

    const result = await query(
      `UPDATE ads_banners SET
        title = COALESCE($1, title),
        image_url = COALESCE($2, image_url),
        link = COALESCE($3, link),
        is_active = COALESCE($4, is_active),
        display_order = CASE WHEN $5::int IS NOT NULL THEN $5 ELSE display_order END,
        updated_at = NOW()
      WHERE id = $6
      RETURNING *`,
      [title, image_url, link, is_active, display_order !== undefined ? parseInt(display_order, 10) : null, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Banner not found' });
    }

    return res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Update banner error:', error);
    return res.status(500).json({ success: false, error: 'Failed to update banner' });
  }
});

// DELETE /api/banners/:id (Admin only)
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query('DELETE FROM ads_banners WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Banner not found' });
    }
    return res.json({ success: true, message: 'Banner deleted', data: result.rows[0] });
  } catch (error) {
    console.error('Delete banner error:', error);
    return res.status(500).json({ success: false, error: 'Failed to delete banner' });
  }
});

module.exports = router;
