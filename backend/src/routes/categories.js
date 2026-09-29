const express = require('express');
const { query } = require('../config/db');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// GET /api/categories (Public)
router.get('/', async (req, res) => {
  try {
    const result = await query('SELECT * FROM product_categories ORDER BY name ASC');
    return res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Fetch categories error:', error);
    return res.status(500).json({ success: false, error: 'Failed to retrieve categories' });
  }
});

// POST /api/categories (Admin only)
router.post('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { name, slug } = req.body;
    if (!name) return res.status(400).json({ success: false, error: 'Category name is required' });

    const cleanSlug = (slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));

    const result = await query(
      'INSERT INTO product_categories (name, slug) VALUES ($1, $2) RETURNING *',
      [name, cleanSlug]
    );

    return res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({ success: false, error: 'Category slug already exists' });
    }
    console.error('Create category error:', error);
    return res.status(500).json({ success: false, error: 'Failed to create category' });
  }
});

// PUT /api/categories/:id (Admin only)
router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, slug } = req.body;

    const result = await query(
      `UPDATE product_categories 
       SET name = COALESCE($1, name), 
           slug = COALESCE($2, slug) 
       WHERE id = $3 
       RETURNING *`,
      [name, slug, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Category not found' });
    }

    return res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Update category error:', error);
    return res.status(500).json({ success: false, error: 'Failed to update category' });
  }
});

// DELETE /api/categories/:id (Admin only)
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query('DELETE FROM product_categories WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Category not found' });
    }
    return res.json({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Delete category error:', error);
    return res.status(500).json({ success: false, error: 'Failed to delete category' });
  }
});

module.exports = router;
