const express = require('express');
const { query } = require('../config/db');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// GET /api/branches (Public / Admin)
router.get('/', async (req, res) => {
  try {
    const { all } = req.query;
    let sql = 'SELECT * FROM branches';
    if (all !== 'true') {
      sql += ' WHERE is_active = true';
    }
    sql += ' ORDER BY name ASC';

    const result = await query(sql);
    return res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Fetch branches error:', error);
    return res.status(500).json({ success: false, error: 'Failed to retrieve branches' });
  }
});

// GET /api/branches/:id (Public)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query('SELECT * FROM branches WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Branch not found' });
    }
    return res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Fetch branch error:', error);
    return res.status(500).json({ success: false, error: 'Failed to retrieve branch' });
  }
});

// POST /api/branches (Admin only)
router.post('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { name, district, address, phone, email, map_url, manager_name, is_active = true } = req.body;
    if (!name || !district || !address) {
      return res.status(400).json({ success: false, error: 'Name, district, and address are required' });
    }

    const result = await query(
      `INSERT INTO branches (
        name, district, address, phone, email, map_url, manager_name, is_active, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
      RETURNING *`,
      [name, district, address, phone || null, email || null, map_url || null, manager_name || null, Boolean(is_active)]
    );

    return res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Create branch error:', error);
    return res.status(500).json({ success: false, error: 'Failed to create branch' });
  }
});

// PUT /api/branches/:id (Admin only)
router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, district, address, phone, email, map_url, manager_name, is_active } = req.body;

    const result = await query(
      `UPDATE branches SET
        name = COALESCE($1, name),
        district = COALESCE($2, district),
        address = COALESCE($3, address),
        phone = COALESCE($4, phone),
        email = COALESCE($5, email),
        map_url = COALESCE($6, map_url),
        manager_name = COALESCE($7, manager_name),
        is_active = COALESCE($8, is_active),
        updated_at = NOW()
      WHERE id = $9
      RETURNING *`,
      [name, district, address, phone, email, map_url, manager_name, is_active, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Branch not found' });
    }

    return res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Update branch error:', error);
    return res.status(500).json({ success: false, error: 'Failed to update branch' });
  }
});

// DELETE /api/branches/:id (Admin only)
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query('DELETE FROM branches WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Branch not found' });
    }
    return res.json({ success: true, message: 'Branch deleted successfully' });
  } catch (error) {
    console.error('Delete branch error:', error);
    return res.status(500).json({ success: false, error: 'Failed to delete branch' });
  }
});

module.exports = router;
