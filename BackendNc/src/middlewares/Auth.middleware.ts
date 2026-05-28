import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

// ─── TIPOS ───────────────────────────────────────────────────────────────────

export interface JwtPayload {
  sub:   number
  email: string
  rol:   string
  iat:   number
  exp:   number
}

// Extender el tipo de Request para incluir el usuario autenticado
declare global {
  namespace Express {
    interface Request {
      usuario?: JwtPayload
    }
  }
}

// ─── VERIFICAR TOKEN ─────────────────────────────────────────────────────────

export const verificarToken = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ ok: false, message: 'Token no proporcionado' })
    return
  }

  const token = authHeader.split(' ')[1]

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as unknown as JwtPayload
    req.usuario   = payload
    next()
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      res.status(401).json({ ok: false, message: 'La sesión ha expirado' })
      return
    }
    res.status(401).json({ ok: false, message: 'Token inválido' })
  }
}

// ─── VERIFICAR ROL ───────────────────────────────────────────────────────────

export const verificarRol = (...roles: string[]) =>
  (req: Request, res: Response, next: NextFunction): void => {
    if (!req.usuario) {
      res.status(401).json({ ok: false, message: 'No autenticado' })
      return
    }

    if (!roles.includes(req.usuario.rol)) {
      res.status(403).json({ ok: false, message: 'No tienes permiso para esta acción' })
      return
    }

    next()
  }

// ─── SHORTCUTS ───────────────────────────────────────────────────────────────

// Solo admin
export const soloAdmin = [verificarToken, verificarRol('ADMIN')]

// Admin o cliente autenticado
export const autenticado = [verificarToken]