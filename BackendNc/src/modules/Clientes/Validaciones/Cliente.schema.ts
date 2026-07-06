import { z } from 'zod';

export const idParamSchema = z.object({
  id: z.coerce
    .number({ invalid_type_error: 'El ID debe ser un número' })
    .int('El ID debe ser un entero')
    .positive('El ID debe ser mayor a 0'),
});

const textSchema = (field: string, min = 1, max = 120) =>
  z
    .string({ required_error: `El ${field} es requerido` })
    .trim()
    .min(min, `El ${field} es demasiado corto`)
    .max(max, `El ${field} es demasiado largo`);

const optionalTextSchema = (max = 120) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((value) => value?.trim() || '');

export const createClienteSchema = z.object({
  email: z
    .string({ required_error: 'El correo es requerido' })
    .trim()
    .toLowerCase()
    .email('El correo no es válido'),
  password: z
    .string({ required_error: 'La contraseña es requerida' })
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .max(128, 'La contraseña no puede superar los 128 caracteres'),
  firstName: textSchema('nombre', 2, 80),
  lastName: optionalTextSchema(80),
  displayName: textSchema('nombre visible', 2, 80),
  addressLine1: optionalTextSchema(200),
  addressLine2: optionalTextSchema(200),
  region: optionalTextSchema(100),
  city: optionalTextSchema(100),
  postalCode: optionalTextSchema(20),
});

export const updateClienteSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email('El correo no es válido')
    .optional(),
  password: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .max(128, 'La contraseña no puede superar los 128 caracteres')
    .optional(),
  firstName: z.string().trim().min(2).max(80).optional(),
  lastName: z.string().trim().max(80).optional(),
  displayName: z.string().trim().min(2).max(80).optional(),
  addressLine1: z.string().trim().max(200).optional(),
  addressLine2: z.string().trim().max(200).optional(),
  region: z.string().trim().max(100).optional(),
  city: z.string().trim().max(100).optional(),
  postalCode: z.string().trim().max(20).optional(),
});

export type CreateClienteDto = z.infer<typeof createClienteSchema>;
export type UpdateClienteDto = z.infer<typeof updateClienteSchema>;
