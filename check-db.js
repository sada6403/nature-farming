const { pool, query } = require('./backend/src/config/db');

async function checkDatabase() {
  console.log('🔍 Checking PostgreSQL Database Connection & Tables...');
  try {
    const tables = [
      'profiles',
      'company_settings',
      'product_categories',
      'products',
      'branches',
      'inquiries',
      'gallery',
      'faqs',
      'ads_banners',
    ];

    for (const table of tables) {
      try {
        const countRes = await query(`SELECT COUNT(*)::int as count FROM ${table}`);
        const count = countRes.rows[0]?.count || 0;
        console.log(`📊 Table [${table}]: ${count} records`);
      } catch (err) {
        console.log(`⚠️ Table [${table}]: does not exist yet (run 'npm run db:init')`);
      }
    }
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  } finally {
    await pool.end();
  }
}

checkDatabase();
