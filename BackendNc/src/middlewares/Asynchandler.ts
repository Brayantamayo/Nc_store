import { Request, Response, NextFunction, RequestHandler } from 'express'
import { ZodError } from 'zod'

// ─── MAPA DE PALABRAS CLAVE → STATUS CODE ────────────────────────────────────

const STATUS_MAP: Array<[string, number]> = [
  ['Ya existe',        409],
  ['no encontrad',     404],
  ['No se puede',      409],
  ['insuficiente',     409],
  ['inválido',         400],
  ['requerido',        400],
  ['expirado',         410],
  ['utilizado',        410],
  ['Credenciales',     401],
  ['No autenticado',   401],
  ['No tienes permiso',403],
]

const resolveStatus = (message: string): number => {
  for (const [keyword, status] of STATUS_MAP) {
    if (message.includes(keyword)) return status
  }
  return 500
}

// ─── ASYNC HANDLER ───────────────────────────────────────────────────────────

type AsyncFn = (req: Request, res: Response, next: NextFunction) => Promise<void>

export const asyncHandler = (fn: AsyncFn): RequestHandler =>
  (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((err: unknown) => {
      // Errores de validación Zod
      if (err instanceof ZodError) {
        const errores = err.errors.map((e) => ({
          campo:   e.path.join('.'),
          mensaje: e.message,
        }))
        res.status(400).json({ ok: false, errores })
        return
      }

      // Errores de negocio
      const message = err instanceof Error ? err.message : 'Error interno del servidor'
      const status  = resolveStatus(message)
      res.status(status).json({ ok: false, message })
    })
  }