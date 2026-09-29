const crypto = require('crypto');
const { query } = require('../config/db');

const SALT = process.env.INQUIRY_RATE_LIMIT_SALT || 'nature_farming_inquiry_rate_limit_default_salt';

async function inquiryRateLimiter(req, res, next) {
  try {
    const rawIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket.remoteAddress || 'unknown';
    const ipHash = crypto.createHash('sha256').update(`${SALT}:${rawIp}`).digest('hex');

    const windowStart = new Date(Date.now() - 15 * 60 * 1000).toISOString();

    const countRes = await query(
      'SELECT COUNT(*)::int as count FROM inquiry_rate_limits WHERE ip_hash = $1 AND created_at >= $2',
      [ipHash, windowStart]
    );

    const count = countRes.rows[0]?.count || 0;
    if (count >= 5) {
      return res.status(429).json({
        success: false,
        error: 'Too many submissions from this connection. Please try again after 15 minutes.',
      });
    }

    // Record submission attempt
    await query('INSERT INTO inquiry_rate_limits (ip_hash) VALUES ($1)', [ipHash]);

    // Clean up older records opportunistically (older than 24 hours)
    query('DELETE FROM inquiry_rate_limits WHERE created_at < NOW() - INTERVAL \'24 hours\'').catch(() => {});

    next();
  } catch (err) {
    console.error('Rate limiting check failed, proceeding gracefully:', err.message);
    next();
  }
}

module.exports = { inquiryRateLimiter };
