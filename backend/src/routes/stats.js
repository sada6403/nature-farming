const express = require('express');
const { query, testConnection } = require('../config/db');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// GET /api/stats/dashboard (Admin only)
router.get('/dashboard', authenticate, requireAdmin, async (req, res) => {
  try {
    const [totalRequestsRes, activeProductsRes, totalBranchesRes, pendingInquiriesRes, recentInquiriesRes] =
      await Promise.all([
        query('SELECT COUNT(*)::int as count FROM inquiries'),
        query('SELECT COUNT(*)::int as count FROM products WHERE is_published = true'),
        query('SELECT COUNT(*)::int as count FROM branches WHERE is_active = true'),
        query("SELECT COUNT(*)::int as count FROM inquiries WHERE status = 'new'"),
        query(`
          SELECT id, full_name as name, type, status, created_at as time
          FROM inquiries
          ORDER BY created_at DESC
          LIMIT 5
        `),
      ]);

    return res.json({
      success: true,
      data: {
        totalRequests: totalRequestsRes.rows[0]?.count || 0,
        activeProducts: activeProductsRes.rows[0]?.count || 0,
        totalBranches: totalBranchesRes.rows[0]?.count || 0,
        pendingInquiries: pendingInquiriesRes.rows[0]?.count || 0,
        recentInquiries: recentInquiriesRes.rows.map((row) => ({
          id: row.id,
          name: row.name,
          type: row.type === 'farmer_interest' ? 'Farmer Registration' : 'Contact Inquiry',
          status: row.status ? row.status.charAt(0).toUpperCase() + row.status.slice(1) : 'New',
          time: new Date(row.time).toLocaleDateString(),
        })),
      },
    });
  } catch (error) {
    console.error('Fetch dashboard stats error:', error);
    return res.status(500).json({ success: false, error: 'Failed to retrieve dashboard statistics' });
  }
});

// GET /api/stats/system-status (Admin only)
router.get('/system-status', authenticate, requireAdmin, async (req, res) => {
  const dbHealth = await testConnection();
  return res.json({
    success: true,
    data: {
      database: dbHealth.connected ? 'Operational' : 'Disconnected',
      authService: 'Operational',
      storage: 'Operational',
      uptime: process.uptime(),
      nodeVersion: process.version,
    },
  });
});

module.exports = router;
