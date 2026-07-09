import { z } from 'zod'
// ─── VARIANTE ────────────────────────────────────────────────────────────────
 
export const createVarianteSchema = z.object({
  productoId: z
    .coerce.number({ required_error: 'El productoId es requerido' })
    .int('El productoId debe ser un entero')
    .positive('El productoId debe ser mayor a 0'),
  color: z
    .string({ required_error: 'El color es requerido' })
    .min(2, 'El color debe tener al menos 2 caracteres')
    .max(50, 'El color no puede superar 50 caracteres')
    .trim(),
  stock: z
    .coerce.number()
    .int('El stock debe ser un número entero')
    .min(1, 'El stock debe ser mayor a 0')
    .default(1),
  activo: z
    .coerce.boolean()
    .default(true),
  imagenes: z
    .array(z.string().url('Cada imagen debe ser una URL válida'))
    .default([]),
  opcionComboNombre: z.string().optional().nullable(),
})

export const createManyVariantesSchema = z.object({
  productoId: z
    .coerce.number({ required_error: 'El productoId es requerido' })
    .int('El productoId debe ser un entero')
    .positive('El productoId debe ser mayor a 0'),
  variantes: z
    .array(
      z.object({
        color: z
          .string({ required_error: 'El color es requerido' })
          .min(2, 'El color debe tener al menos 2 caracteres')
          .max(50, 'El color no puede superar 50 caracteres')
          .trim(),
        stock: z
          .coerce.number()
          .int('El stock debe ser un número entero')
          .min(1, 'El stock debe ser mayor a 0')
          .default(1),
        activo: z
          .coerce.boolean()
          .default(true),
        imagenes: z
          .array(z.string().url('Cada imagen debe ser una URL válida'))
          .default([]),
        opcionComboNombre: z.string().optional().nullable(),
      })
    )
    .min(1, 'Debes enviar al menos una variante'),
})
 
export const updateVarianteSchema = z.object({
  color: z
    .string()
    .min(2, 'El color debe tener al menos 2 caracteres')
    .max(50, 'El color no puede superar 50 caracteres')
    .trim()
    .optional(),
  stock: z
    .coerce.number()
    .int('El stock debe ser un número entero')
    .min(0, 'El stock no puede ser negativo')
    .optional(),
  activo: z
    .coerce.boolean()
    .optional(),
  imagenes: z
    .array(z.string().url('Cada imagen debe ser una URL válida'))
    .optional(),
  opcionComboNombre: z.string().optional().nullable(),
}).refine(
  (d) => Object.keys(d).length > 0,
  { message: 'Debes enviar al menos un campo para actualizar' }
)
 
export const ajustarStockSchema = z.object({
  cantidad: z
    .coerce.number({ required_error: 'La cantidad es requerida' })
    .int('La cantidad debe ser un número entero')
    .refine((n) => n !== 0, { message: 'La cantidad no puede ser 0' }),
})
 
export const idParamSchema = z.object({
  id: z.coerce
    .number({ invalid_type_error: 'El ID debe ser un número' })
    .int()
    .positive('El ID debe ser mayor a 0'),
})
 
export const productoIdParamSchema = z.object({
  productoId: z.coerce
    .number({ invalid_type_error: 'El productoId debe ser un número' })
    .int()
    .positive('El productoId debe ser mayor a 0'),
})
 
// ─── TIPOS ───────────────────────────────────────────────────────────────────

export type CreateVarianteDto  = z.infer<typeof createVarianteSchema>
export type CreateManyVariantesDto = z.infer<typeof createManyVariantesSchema>
export type UpdateVarianteDto  = z.infer<typeof updateVarianteSchema>
export type AjustarStockDto    = z.infer<typeof ajustarStockSchema>
