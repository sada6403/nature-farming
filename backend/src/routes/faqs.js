const express = require('express');
const { query } = require('../config/db');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// GET /api/faqs (Public)
router.get('/', async (req, res) => {
  try {
    const result = await query('SELECT * FROM faqs ORDER BY display_order ASC, created_at ASC');
    return res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Fetch FAQs error:', error);
    return res.status(500).json({ success: false, error: 'Failed to retrieve FAQs' });
  }
});

// POST /api/faqs (Admin only)
router.post('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { question, answer, display_order = 0 } = req.body;
    if (!question || !answer) {
      return res.status(400).json({ success: false, error: 'Question and answer are required' });
    }

    const result = await query(
      `INSERT INTO faqs (question, answer, display_order, created_at, updated_at)
       VALUES ($1, $2, $3, NOW(), NOW())
       RETURNING *`,
      [question, answer, parseInt(display_order || '0', 10)]
    );

    return res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Create FAQ error:', error);
    return res.status(500).json({ success: false, error: 'Failed to create FAQ' });
  }
});

// PUT /api/faqs/:id (Admin only)
router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { question, answer, display_order } = req.body;

    const result = await query(
      `UPDATE faqs SET
        question = COALESCE($1, question),
        answer = COALESCE($2, answer),
        display_order = CASE WHEN $3::int IS NOT NULL THEN $3 ELSE display_order END,
        updated_at = NOW()
      WHERE id = $4
      RETURNING *`,
      [question, answer, display_order !== undefined ? parseInt(display_order, 10) : null, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'FAQ not found' });
    }

    return res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Update FAQ error:', error);
    return res.status(500).json({ success: false, error: 'Failed to update FAQ' });
  }
});

// DELETE /api/faqs/:id (Admin only)
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query('DELETE FROM faqs WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'FAQ not found' });
    }
    return res.json({ success: true, message: 'FAQ deleted' });
  } catch (error) {
    console.error('Delete FAQ error:', error);
    return res.status(500).json({ success: false, error: 'Failed to delete FAQ' });
  }
});

module.exports = router;
