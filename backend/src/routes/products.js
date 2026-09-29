const express = require('express');
const { query } = require('../config/db');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// GET /api/products (Public / Admin)
router.get('/', async (req, res) => {
  try {
    const { category, featured, all, search } = req.query;

    let sql = `
      SELECT 
        p.*,
        json_build_object('id', pc.id, 'name', pc.name, 'slug', pc.slug) as product_categories
      FROM products p
      LEFT JOIN product_categories pc ON p.category_id = pc.id
      WHERE 1=1
    `;
    const params = [];

    // Filter published unless all=true (with or without auth check)
    if (all !== 'true') {
      sql += ' AND p.is_published = true';
    }

    if (featured === 'true') {
      sql += ' AND p.is_featured = true';
    }

    if (category) {
      params.push(category);
      sql += ` AND (pc.slug = $${params.length} OR pc.name = $${params.length})`;
    }

    if (search) {
      params.push(`%${search}%`);
      sql += ` AND (p.name ILIKE $${params.length} OR p.description ILIKE $${params.length})`;
    }

    sql += ' ORDER BY p.is_featured DESC, p.created_at DESC';

    const result = await query(sql, params);
    return res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Fetch products error:', error);
    return res.status(500).json({ success: false, error: 'Failed to retrieve products' });
  }
});

// GET /api/products/:idOrSlug (Public)
router.get('/:idOrSlug', async (req, res) => {
  try {
    const { idOrSlug } = req.params;
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(idOrSlug);

    const sql = `
      SELECT 
        p.*,
        json_build_object('id', pc.id, 'name', pc.name, 'slug', pc.slug) as product_categories
      FROM products p
      LEFT JOIN product_categories pc ON p.category_id = pc.id
      WHERE ${isUuid ? 'p.id = $1' : 'p.slug = $1'}
    `;

    const result = await query(sql, [idOrSlug]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    return res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Fetch product detail error:', error);
    return res.status(500).json({ success: false, error: 'Failed to retrieve product' });
  }
});

// POST /api/products (Admin only)
router.post('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const {
      name,
      slug,
      description,
      benefits,
      price,
      image_url,
      category_id,
      is_featured = false,
      is_published = true,
    } = req.body;

    if (!name) return res.status(400).json({ success: false, error: 'Product name is required' });

    const cleanSlug = (slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
    const parsedPrice = price !== undefined && price !== '' ? parseFloat(price) : null;

    const result = await query(
      `INSERT INTO products (
        name, slug, description, benefits, price, image_url,
        category_id, is_featured, is_published, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
      RETURNING *`,
      [
        name,
        cleanSlug,
        description || null,
        Array.isArray(benefits) ? benefits : null,
        parsedPrice,
        image_url || null,
        category_id || null,
        Boolean(is_featured),
        Boolean(is_published),
      ]
    );

    // Fetch joined category
    const inserted = await query(
      `SELECT p.*, json_build_object('name', pc.name) as product_categories
       FROM products p
       LEFT JOIN product_categories pc ON p.category_id = pc.id
       WHERE p.id = $1`,
      [result.rows[0].id]
    );

    return res.status(201).json({ success: true, data: inserted.rows[0] });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({ success: false, error: 'Product with this slug already exists' });
    }
    console.error('Create product error:', error);
    return res.status(500).json({ success: false, error: 'Failed to create product' });
  }
});

// PUT /api/products/:id (Admin only)
router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      slug,
      description,
      benefits,
      price,
      image_url,
      category_id,
      is_featured,
      is_published,
    } = req.body;

    const parsedPrice = price !== undefined && price !== '' ? parseFloat(price) : null;

    const result = await query(
      `UPDATE products SET
        name = COALESCE($1, name),
        slug = COALESCE($2, slug),
        description = COALESCE($3, description),
        benefits = COALESCE($4, benefits),
        price = CASE WHEN $5::numeric IS NOT NULL THEN $5 ELSE price END,
        image_url = COALESCE($6, image_url),
        category_id = CASE WHEN $7::uuid IS NOT NULL THEN $7 ELSE category_id END,
        is_featured = COALESCE($8, is_featured),
        is_published = COALESCE($9, is_published),
        updated_at = NOW()
      WHERE id = $10
      RETURNING *`,
      [
        name,
        slug,
        description,
        Array.isArray(benefits) ? benefits : null,
        parsedPrice,
        image_url,
        category_id || null,
        is_featured,
        is_published,
        id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    const updated = await query(
      `SELECT p.*, json_build_object('name', pc.name) as product_categories
       FROM products p
       LEFT JOIN product_categories pc ON p.category_id = pc.id
       WHERE p.id = $1`,
      [id]
    );

    return res.json({ success: true, data: updated.rows[0] });
  } catch (error) {
    console.error('Update product error:', error);
    return res.status(500).json({ success: false, error: 'Failed to update product' });
  }
});

// DELETE /api/products/:id (Admin only)
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query('DELETE FROM products WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }
    return res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    return res.status(500).json({ success: false, error: 'Failed to delete product' });
  }
});

module.exports = router;
