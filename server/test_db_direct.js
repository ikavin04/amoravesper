const { Pool } = require('pg');
const dotenv = require('dotenv');
dotenv.config();

async function testConnection() {
  console.log('Testing ap-northeast-1 connection pooler...');
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000,
  });

  try {
    const res = await pool.query('SELECT NOW()');
    console.log('🎉 SUCCESSFUL DATABASE CONNECTION! Server time:', res.rows[0].now);
  } catch (err) {
    console.error('❌ Connection error:', err.message);
  } finally {
    await pool.end();
  }
}

testConnection();
