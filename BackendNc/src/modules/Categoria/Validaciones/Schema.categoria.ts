import { z } from 'zod'

// ─── PARAMS ──────────────────────────────────────────────────────────────────
export const idParamSchema = z.object({
id: z.coerce
    .number({ invalid_type_error: 'El ID debe ser un número' })
    .int()
    .positive('El ID debe ser mayor a 0'),
})


// ─── CATEGORIA ───────────────────────────────────────────────────────────────
export const createCategoriaSchema = z.object({
nombre: z
    .string({ required_error: 'El nombre es requerido' })
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(80, 'El nombre no puede superar 80 caracteres')
    .trim(),
slug: z
    .string({ required_error: 'El slug es requerido' })
    .min(2, 'El slug debe tener al menos 2 caracteres')
    .max(80, 'El slug no puede superar 80 caracteres')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'El slug solo puede contener letras minúsculas, números y guiones')
    .trim(),
imagen: z
    .string()
    .url('La imagen debe ser una URL válida')
    .optional(),
})

export const updateCategoriaSchema = createCategoriaSchema.partial().refine(
(d) => Object.keys(d).length > 0,
{ message: 'Debes enviar al menos un campo para actualizar' }
)

export type CreateCategoriaDto = z.infer<typeof createCategoriaSchema>
export type UpdateCategoriaDto = z.infer<typeof updateCategoriaSchema>