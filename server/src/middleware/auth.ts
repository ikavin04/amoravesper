import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../services/jwt';

export interface AuthRequest extends Request {
  admin?: { adminId: string; email: string };
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction): void {
  try {
    const token = req.cookies?.token || req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const payload = verifyToken(token);
    req.admin = payload;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}
