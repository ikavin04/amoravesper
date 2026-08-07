import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const isSupabase = Boolean(process.env.DATABASE_URL?.includes('supabase'));
const isProd = process.env.NODE_ENV === 'production';

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: (isProd || isSupabase) ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('connect', () => {
  if (process.env.NODE_ENV !== 'production') {
    console.log('✅ Database connected');
  }
});

pool.on('error', (err) => {
  console.error('⚠️ Database connection warning:', err.message || err);
});

export const query = async (text: string, params?: unknown[]) => {
  try {
    return await pool.query(text, params);
  } catch (err: any) {
    console.error('⚠️ DB Query Error:', err.message || err);
    throw err;
  }
};
