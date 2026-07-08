import { z } from 'zod';

export const estadoPedidoEnum = z.enum([
  'PENDIENTE',
  'PAGADO',
  'ENVIADO',
  'ENTREGADO',
  'CANCELADO',
]);

export const idParamSchema = z.object({
  id: z.coerce
    .number({ invalid_type_error: 'El ID debe ser un número' })
    .int()
    .positive('El ID debe ser mayor a 0'),
});

export const pedidoItemSchema = z.object({
  varianteId: z.coerce
    .number({ required_error: 'El varianteId es requerido' })
    .int('El varianteId debe ser un entero')
    .positive('El varianteId debe ser mayor a 0'),
  cantidad: z.coerce
    .number({ required_error: 'La cantidad es requerida' })
    .int('La cantidad debe ser un entero')
    .positive('La cantidad debe ser mayor a 0'),
  detallesCombo: z.any().optional(),
});

export const createPedidoSchema = z.object({
  usuarioId: z.coerce
    .number({ invalid_type_error: 'El usuarioId debe ser un entero' })
    .int('El usuarioId debe ser un entero')
    .positive('El usuarioId debe ser mayor a 0')
    .optional(),
  clienteId: z.coerce
    .number({ invalid_type_error: 'El clienteId debe ser un entero' })
    .int('El clienteId debe ser un entero')
    .positive('El clienteId debe ser mayor a 0')
    .optional(),
  guestEmail: z.string().email('Correo inválido').optional(),
  guestName: z.string().min(1, 'El nombre es requerido').optional(),
  guestLastName: z.string().optional(),
  guestPhone: z.string().optional(),
  guestAddressLine1: z.string().optional(),
  guestAddressLine2: z.string().optional(),
  guestCity: z.string().optional(),
  guestRegion: z.string().optional(),
  guestPostalCode: z.string().optional(),
  estado: estadoPedidoEnum.optional(),
  items: z
    .array(pedidoItemSchema)
    .min(1, 'Debes enviar al menos un item en el pedido'),
});

export const updatePedidoSchema = z
  .object({
    estado: estadoPedidoEnum.optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Debes enviar al menos un campo para actualizar',
  });

export type CreatePedidoDto = z.infer<typeof createPedidoSchema>;
export type UpdatePedidoDto = z.infer<typeof updatePedidoSchema>;
