import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { query } from '../db/pool';
import { signToken } from '../services/jwt';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { authLimiter } from '../middleware/rateLimiter';

const router = Router();

// POST /api/auth/login
router.post('/login', authLimiter, async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password required' });
      return;
    }

    const targetEmail = email.toLowerCase().trim();
    const envAdminEmail = (process.env.ADMIN_EMAIL || 'amoraavesper@gmail.com').toLowerCase().trim();
    const envAdminPass = process.env.ADMIN_PASSWORD || 'AmoraVesper16@';

    let isValidAdmin = false;
    let adminId = 'admin-1';
    let adminEmail = targetEmail;

    try {
      const result = await query('SELECT * FROM admins WHERE email = $1', [targetEmail]);
      if (result.rows.length > 0) {
        const admin = result.rows[0];
        isValidAdmin = await bcrypt.compare(password, admin.password_hash);
        adminId = admin.id;
        adminEmail = admin.email;
      }
    } catch {
      // Fallback if DB query fails during dev
    }

    if (!isValidAdmin && targetEmail === envAdminEmail && password === envAdminPass) {
      isValidAdmin = true;
      adminId = 'admin-1';
      adminEmail = envAdminEmail;
    }

    if (!isValidAdmin) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const token = signToken({ adminId, email: adminEmail });

    const isProd = process.env.NODE_ENV === 'production';
    res.cookie('token', token, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({
      message: 'Logged in successfully',
      token,
      admin: { id: adminId, email: adminEmail },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/auth/logout
router.post('/logout', (req: Request, res: Response) => {
  const isProd = process.env.NODE_ENV === 'production';
  res.clearCookie('token', {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
  });
  res.json({ message: 'Logged out' });
});

// GET /api/auth/me
router.get('/me', requireAuth, (req: AuthRequest, res: Response) => {
  res.json({ admin: req.admin });
});

export default router;
