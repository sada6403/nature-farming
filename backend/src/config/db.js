const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

let poolConfig = {};

if (process.env.DATABASE_URL) {
  poolConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL.includes('sslmode=require') || process.env.PGSSL === 'true'
      ? { rejectUnauthorized: false }
      : false,
  };
} else {
  poolConfig = {
    host: process.env.PGHOST || 'localhost',
    port: parseInt(process.env.PGPORT || '5432', 10),
    user: process.env.PGUSER || 'postgres',
    password: process.env.PGPASSWORD || 'postgres',
    database: process.env.PGDATABASE || 'nature_farming',
    ssl: process.env.PGSSL === 'true' ? { rejectUnauthorized: false } : false,
  };
}

const pool = new Pool({
  ...poolConfig,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  console.error('[PostgreSQL Pool Error]:', err.message);
});

async function query(text, params) {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    if (process.env.NODE_ENV === 'development' && duration > 500) {
      console.warn(`[Slow Query] ${duration}ms: ${text}`);
    }
    return res;
  } catch (error) {
    console.error('[Database Query Error]:', error.message, '\nQuery:', text);
    throw error;
  }
}

async function testConnection() {
  try {
    const res = await pool.query('SELECT NOW() as current_time');
    return { connected: true, timestamp: res.rows[0].current_time };
  } catch (error) {
    const msg = error.message || error.errors?.[0]?.message || error.code || 'Unable to connect to PostgreSQL server';
    return { connected: false, error: msg };
  }
}

module.exports = {
  pool,
  query,
  testConnection,
};
