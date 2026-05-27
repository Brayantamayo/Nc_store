// src/middlewares/auth.ts

/**
 * Middleware de autenticación y autorización.
 *
 * Funciones:
 * - Validar tokens de acceso.
 * - Identificar usuarios autenticados.
 * - Controlar permisos según roles.
 *
 * Middlewares:
 * - requireAuth
 * - requireRole
 */
import { Request, Response, NextFunction } from 'express';
import { ApiError } from './errorHandler';

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
