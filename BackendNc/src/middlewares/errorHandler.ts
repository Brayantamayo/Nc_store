import { Request, Response, NextFunction } from 'express'
import { env } from '../config/environment'

// ─── ERROR PERSONALIZADO ─────────────────────────────────────────────────────
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true
  ) {
    super(message)
    Object.setPrototypeOf(this, ApiError.prototype)
  }
}


// ─── 404 ──────────────────────────────────────────────────────────────────────
export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Ruta no encontrada',
    message: `No existe el endpoint: ${req.method} ${req.originalUrl}`,
    statusCode: 404
  })
}



// ─── ERRORES GENERALES ────────────────────────────────────────────────────────
export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction): void => {
  const statusCode = err.statusCode || 500
  const message = err.message || 'Internal Server Error'

  if (statusCode === 500 || !err.isOperational) {
    console.error('💥 Error:', err)
  }

  res.status(statusCode).json({
    success: false,
    error: message,
    stack: env.NODE_ENV === 'development' ? err.stack : undefined,
  })
}



// ─── ASYNC HELPER ─────────────────────────────────────────────────────────────
export type AsyncRequestHandler = (req: Request, res: Response, next: NextFunction) => Promise<any>

export const catchAsync = (fn: AsyncRequestHandler) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next)
  }
}