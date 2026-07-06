import { z } from 'zod';

export const idParamSchema = z.object({
  id: z.coerce
    .number({ invalid_type_error: 'El ID debe ser un número' })
    .int()
    .positive('El ID debe ser mayor a 0'),
});

export const categoriaIdParamSchema = z.object({
  categoriaId: z.coerce
    .number({ invalid_type_error: 'El categoriaId debe ser un número' })
    .int()
    .positive('El categoriaId debe ser mayor a 0'),
});

export const slugParamSchema = z.object({
  slug: z.string().trim().min(2, 'El slug debe tener al menos 2 caracteres'),
});

export const createProductoSchema = z.object({
  nombre: z
    .string({ required_error: 'El nombre es requerido' })
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(120, 'El nombre no puede superar 120 caracteres')
    .trim(),
  slug: z
    .string({ required_error: 'El slug es requerido' })
    .min(2, 'El slug debe tener al menos 2 caracteres')
    .max(120, 'El slug no puede superar 120 caracteres')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'El slug solo puede contener letras minúsculas, números y guiones')
    .trim(),
  descripcion: z
    .string()
    .max(1000, 'La descripción no puede superar 1000 caracteres')
    .trim()
    .optional(),
  precio: z
    .coerce
    .number({ required_error: 'El precio es requerido' })
    .positive('El precio debe ser mayor a 0'),
  precioOriginal: z
    .coerce
    .number()
    .positive('El precio original debe ser mayor a 0')
    .optional()
    .nullable(),
  categoriaId: z
    .coerce
    .number({ required_error: 'La categoría es requerida' })
    .int('La categoría debe ser un entero')
    .positive('La categoría debe ser mayor a 0'),
  activo: z.coerce.boolean().default(true),
});

export const updateProductoSchema = createProductoSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  { message: 'Debes enviar al menos un campo para actualizar' }
);

export type CreateProductoDto = z.infer<typeof createProductoSchema>;
export type UpdateProductoDto = z.infer<typeof updateProductoSchema>;
