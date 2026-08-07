import bcrypt from 'bcryptjs';
import { pool } from '../src/db/pool';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

async function seed() {
  const client = await pool.connect();

  try {
    console.log('📦 Running database migration...');

    // Run schema SQL
    const schemaPath = path.join(__dirname, '../src/db/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf-8');
    await client.query(schema);
    console.log('✅ Schema applied');

    // Create admin
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;

    if (!email || !password) {
      throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env');
    }

    const existing = await client.query('SELECT id FROM admins WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      console.log(`⚠️  Admin with email "${email}" already exists. Skipping.`);
    } else {
      const hash = await bcrypt.hash(password, 12);
      await client.query(
        'INSERT INTO admins (email, password_hash) VALUES ($1, $2)',
        [email, hash]
      );
      console.log(`✅ Admin created: ${email}`);
    }

    console.log('🎉 Seed complete!');
  } catch (err) {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
