const express = require('express');
const { query } = require('../config/db');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// GET /api/gallery (Public)
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    let sql = 'SELECT * FROM gallery';
    const params = [];

    if (category && category !== 'all') {
      params.push(category);
      sql += ' WHERE category = $1';
    }

    sql += ' ORDER BY display_order ASC, created_at DESC';

    const result = await query(sql, params);
    return res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Fetch gallery error:', error);
    return res.status(500).json({ success: false, error: 'Failed to retrieve gallery' });
  }
});

// POST /api/gallery (Admin only)
router.post('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { title, image_url, category = 'other', display_order = 0 } = req.body;
    if (!image_url) {
      return res.status(400).json({ success: false, error: 'Image URL is required' });
    }

    const result = await query(
      `INSERT INTO gallery (title, image_url, category, display_order, created_at, updated_at)
       VALUES ($1, $2, $3, $4, NOW(), NOW())
       RETURNING *`,
      [title || 'Untitled', image_url, category, parseInt(display_order || '0', 10)]
    );

    return res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Create gallery item error:', error);
    return res.status(500).json({ success: false, error: 'Failed to save gallery item' });
  }
});

// PUT /api/gallery/:id (Admin only)
router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, image_url, category, display_order } = req.body;

    const result = await query(
      `UPDATE gallery SET
        title = COALESCE($1, title),
        image_url = COALESCE($2, image_url),
        category = COALESCE($3, category),
        display_order = CASE WHEN $4::int IS NOT NULL THEN $4 ELSE display_order END,
        updated_at = NOW()
      WHERE id = $5
      RETURNING *`,
      [title, image_url, category, display_order !== undefined ? parseInt(display_order, 10) : null, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Gallery item not found' });
    }

    return res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Update gallery item error:', error);
    return res.status(500).json({ success: false, error: 'Failed to update gallery item' });
  }
});

// DELETE /api/gallery/:id (Admin only)
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query('DELETE FROM gallery WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Gallery item not found' });
    }
    return res.json({ success: true, message: 'Gallery item deleted', data: result.rows[0] });
  } catch (error) {
    console.error('Delete gallery item error:', error);
    return res.status(500).json({ success: false, error: 'Failed to delete gallery item' });
  }
});

module.exports = router;
