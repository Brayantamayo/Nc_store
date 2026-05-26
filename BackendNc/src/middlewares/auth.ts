// src/middlewares/auth.ts
import { Request, Response, NextFunction } from 'express';
import { ApiError } from './errorHandler';

// Extend Express request type to include custom user context
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: string;
      };
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new ApiError(401, 'Authorization token missing or invalid');
  }

  const token = authHeader.split(' ')[1];

  // Simulated JWT validation (can be replaced with jwt.verify in production)
  if (token === 'demo-token-admin') {
    req.user = { id: 'admin-id', role: 'admin' };
    return next();
  } else if (token === 'demo-token-user') {
    req.user = { id: 'user-id', role: 'user' };
    return next();
  }

  throw new ApiError(401, 'Unauthorized');
}

export function requireRole(role: 'admin' | 'user') {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || req.user.role !== role) {
      throw new ApiError(403, 'Forbidden: Insufficient permissions');
    }
    next();
  };
}
