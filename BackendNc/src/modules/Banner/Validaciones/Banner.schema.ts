import { z } from 'zod';

export const idParamSchema = z.object({
  id: z.coerce
    .number({ invalid_type_error: 'El ID debe ser un número' })
    .int()
    .positive('El ID debe ser mayor a 0'),
});

export const createBannerSchema = z.object({
  titulo: z
    .string()
    .trim()
    .min(1, 'El título es requerido')
    .max(80, 'El título no puede superar 80 caracteres'),
  subtitulo: z
    .string()
    .trim()
    .min(1, 'El subtítulo es requerido')
    .max(80, 'El subtítulo no puede superar 80 caracteres'),
  desc: z
    .string()
    .trim()
    .max(160, 'La descripción no puede superar 160 caracteres')
    .optional(),
});

export const updateBannerSchema = z.object({
  titulo: z
    .string()
    .trim()
    .min(1, 'El título es requerido')
    .max(80, 'El título no puede superar 80 caracteres')
    .optional(),
  subtitulo: z
    .string()
    .trim()
    .min(1, 'El subtítulo es requerido')
    .max(80, 'El subtítulo no puede superar 80 caracteres')
    .optional(),
  desc: z
    .string()
    .trim()
    .max(160, 'La descripción no puede superar 160 caracteres')
    .optional(),
  activo: z.boolean().optional(),
});

export type CreateBannerDto = z.infer<typeof createBannerSchema>;
export type UpdateBannerDto = z.infer<typeof updateBannerSchema>;
