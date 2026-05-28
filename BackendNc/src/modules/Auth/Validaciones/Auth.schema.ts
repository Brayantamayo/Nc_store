import { z } from 'zod'

export const registroSchema = z.object({
  email: z
    .string({ required_error: 'El correo es requerido' })
    .email('Formato de correo inválido')
    .toLowerCase()
    .trim(),
})

export const loginSchema = z.object({
  email: z
    .string({ required_error: 'El correo es requerido' })
    .email('Formato de correo inválido')
    .toLowerCase()
    .trim(),
  password: z
    .string({ required_error: 'La contraseña es requerida' })
    .min(1, 'La contraseña es requerida'),
})

export const recuperarSchema = z.object({
  email: z
    .string({ required_error: 'El correo es requerido' })
    .email('Formato de correo inválido')
    .toLowerCase()
    .trim(),
})

export const verificarOtpSchema = z.object({
  email: z
    .string({ required_error: 'El correo es requerido' })
    .email('Formato de correo inválido')
    .toLowerCase()
    .trim(),
  otp: z
    .string({ required_error: 'El OTP es requerido' })
    .length(6, 'El OTP debe tener 6 dígitos')
    .regex(/^\d{6}$/, 'El OTP solo debe contener números'),
})

export const nuevaPasswordSchema = z.object({
  token: z.string({ required_error: 'El token es requerido' }).min(1),
  password: z
    .string({ required_error: 'La contraseña es requerida' })
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
    .regex(/[0-9]/, 'Debe contener al menos un número'),
  confirmar: z.string({ required_error: 'La confirmación es requerida' }),
}).refine((d) => d.password === d.confirmar, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmar'],
})

export const resetPasswordSchema = z.object({
  token: z.string({ required_error: 'El token es requerido' }).min(1),
  password: z
    .string({ required_error: 'La contraseña es requerida' })
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
    .regex(/[0-9]/, 'Debe contener al menos un número'),
  confirmar: z.string({ required_error: 'La confirmación es requerida' }),
}).refine((d) => d.password === d.confirmar, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmar'],
})

export type RegistroDto       = z.infer<typeof registroSchema>
export type LoginDto          = z.infer<typeof loginSchema>
export type RecuperarDto      = z.infer<typeof recuperarSchema>
export type VerificarOtpDto   = z.infer<typeof verificarOtpSchema>
export type NuevaPasswordDto  = z.infer<typeof nuevaPasswordSchema>
export type ResetPasswordDto  = z.infer<typeof resetPasswordSchema>