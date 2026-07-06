import { z } from 'zod';

export const idParamSchema = z.object({
  id: z.coerce
    .number({ invalid_type_error: 'El ID debe ser un número' })
    .int()
    .positive('El ID debe ser mayor a 0'),
});

export const createGaleriaSchema = z.object({
  caption: z
    .string()
    .trim()
    .max(120, 'El texto no puede superar 120 caracteres')
    .optional(),
});

export type CreateGaleriaDto = z.infer<typeof createGaleriaSchema>;
