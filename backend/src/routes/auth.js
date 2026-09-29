const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../config/db');
const { authenticate, requireAdmin, requireSuperAdmin, JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const result = await query(
      'SELECT id, email, password_hash, full_name, role FROM profiles WHERE LOWER(email) = $1',
      [cleanEmail]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, error: 'Invalid credentials or user not found' });
    }

    const user = result.rows[0];

    if (!user.password_hash) {
      return res.status(401).json({
        success: false,
        error: 'Password not set for this account. Please run db:init or contact Super Admin.',
      });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    if (!['admin', 'super_admin'].includes(user.role)) {
      return res.status(403).json({ success: false, error: 'Access denied: Admin privileges required.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, full_name: user.full_name },
      JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    return res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error during login' });
  }
});

// GET /api/auth/me
router.get('/me', authenticate, async (req, res) => {
  return res.json({
    success: true,
    user: req.user,
  });
});

// POST /api/auth/change-password
router.post('/change-password', authenticate, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword || newPassword.length < 6) {
      return res.status(400).json({ success: false, error: 'New password must be at least 6 characters long' });
    }

    const result = await query('SELECT password_hash FROM profiles WHERE id = $1', [req.user.id]);
    const currentHash = result.rows[0]?.password_hash;

    if (currentHash) {
      const isMatch = await bcrypt.compare(currentPassword, currentHash);
      if (!isMatch) {
        return res.status(400).json({ success: false, error: 'Current password does not match' });
      }
    }

    const salt = await bcrypt.genSalt(10);
    const newHash = await bcrypt.hash(newPassword, salt);

    await query('UPDATE profiles SET password_hash = $1, updated_at = NOW() WHERE id = $2', [newHash, req.user.id]);

    return res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    return res.status(500).json({ success: false, error: 'Failed to update password' });
  }
});

// POST /api/auth/create-admin (Super Admin only)
router.post('/create-admin', authenticate, requireSuperAdmin, async (req, res) => {
  try {
    const { email, password, full_name, role = 'admin' } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const existing = await query('SELECT id FROM profiles WHERE LOWER(email) = $1', [cleanEmail]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ success: false, error: 'An account with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const result = await query(
      `INSERT INTO profiles (email, password_hash, full_name, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, email, full_name, role, created_at`,
      [cleanEmail, hash, full_name || 'Admin', role]
    );

    return res.status(201).json({ success: true, user: result.rows[0] });
  } catch (error) {
    console.error('Create admin error:', error);
    return res.status(500).json({ success: false, error: 'Failed to create administrator' });
  }
});

// GET /api/auth/admins (Super Admin only)
router.get('/admins', authenticate, requireSuperAdmin, async (req, res) => {
  try {
    const result = await query(
      'SELECT id, email, full_name, role, created_at FROM profiles ORDER BY created_at ASC'
    );
    return res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Fetch admins error:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch admin accounts' });
  }
});

module.exports = router;
