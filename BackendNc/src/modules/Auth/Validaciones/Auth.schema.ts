import { z } from 'zod'

// ─── HELPERS REUTILIZABLES ────────────────────────────────────────────────────

/** Bloquea caracteres típicos de inyección SQL / NoSQL / XSS */
const noInjection = (msg = 'Caracteres no permitidos') =>
  z.string().refine(
    (v) => !/[<>"'`;\\{}$]/.test(v),
    msg
  )

const emailSchema = (requiredMessage: string) =>
  z
    .string({ required_error: requiredMessage })
    .trim()
    .toLowerCase()
    .min(5,   'El correo es demasiado corto')
    .max(254, 'El correo es demasiado largo')            
    .email('Ingresa un correo electrónico válido')
    .refine((v) => !/\s/.test(v),      'El correo no puede contener espacios')
    .refine((v) => !/[<>"'`;\\{}$]/.test(v), 'El correo contiene caracteres no permitidos')
    .refine((v) => !v.includes('..'),  'El correo no es válido')
    .refine((v) => {
      const [, domain] = v.split('@')
      return domain && domain.includes('.')
    }, 'El dominio del correo no es válido')

const passwordSchema = (requiredMessage: string) =>
  z
    .string({ required_error: requiredMessage })
    .min(8,   'La contraseña debe tener al menos 8 caracteres')
    .max(128, 'La contraseña no puede superar los 128 caracteres')
    .refine((v) => !/\s/.test(v),            'La contraseña no puede contener espacios')
    .refine((v) => /[a-z]/.test(v),          'Debe contener al menos una minúscula')
    .refine((v) => /[A-Z]/.test(v),          'Debe contener al menos una mayúscula')
    .refine((v) => /[0-9]/.test(v),          'Debe contener al menos un número')
    .refine((v) => /[^A-Za-z0-9]/.test(v),  'Debe contener al menos un símbolo')
    .refine((v) => !/(.)\1{4,}/.test(v),    'La contraseña no puede tener caracteres repetidos consecutivos')

const loginPasswordSchema = (requiredMessage: string) =>
  z
    .string({ required_error: requiredMessage })
    .min(1,   'La contraseña es requerida')
    .max(128, 'Contraseña demasiado larga')
    .refine((v) => !/\s/.test(v), 'La contraseña no puede contener espacios')

const nameSchema = (field: string) =>
  noInjection(`El ${field} contiene caracteres no permitidos`)
    .and(
      z.string()
        .trim()
        .min(1,  `El ${field} es requerido`)
        .max(80, `El ${field} es demasiado largo`)
        .refine((v) => !/\s{2,}/.test(v),   `El ${field} no debe tener espacios dobles`)
        .refine((v) => !/^\s|\s$/.test(v),  `El ${field} no debe empezar ni terminar con espacio`)
        .refine((v) => /^[\p{L}\p{M}' -]+$/u.test(v), `El ${field} solo puede contener letras, tildes y guiones`)
    )

const tokenSchema = (requiredMessage = 'El token es requerido') =>
  z
    .string({ required_error: requiredMessage })
    .trim()
    .min(1,   requiredMessage)
    .max(512, 'Token inválido')
    .refine((v) => !/\s/.test(v), 'El token no puede contener espacios')

// ─── SCHEMAS PÚBLICOS ─────────────────────────────────────────────────────────

export const registroSchema = z.object({
  email: emailSchema('El correo es requerido'),
})

export const loginSchema = z.object({
  email:    emailSchema('El correo es requerido'),
  password: loginPasswordSchema('La contraseña es requerida'),
})

export const recuperarSchema = z.object({
  email: emailSchema('El correo es requerido'),
})

export const verificarOtpSchema = z.object({
  email: emailSchema('El correo es requerido'),
  otp: z
    .string({ required_error: 'El código es requerido' })
    .trim()
    .length(6,            'El código debe tener 6 dígitos')
    .regex(/^\d{6}$/,     'El código solo debe contener números'),
})

export const nuevaPasswordSchema = z
  .object({
    token:     tokenSchema(),
    password:  passwordSchema('La contraseña es requerida'),
    confirmar: z.string({ required_error: 'La confirmación es requerida' }),
  })
  .refine((d) => d.password === d.confirmar, {
    message: 'Las contraseñas no coinciden',
    path:    ['confirmar'],
  })
  .refine((d) => d.password !== d.token, {
    message: 'La contraseña no puede ser igual al token',
    path:    ['password'],
  })

export const resetPasswordSchema = z
  .object({
    token:     tokenSchema(),
    password:  passwordSchema('La contraseña es requerida'),
    confirmar: z.string({ required_error: 'La confirmación es requerida' }),
  })
  .refine((d) => d.password === d.confirmar, {
    message: 'Las contraseñas no coinciden',
    path:    ['confirmar'],
  })

export const updateProfileSchema = z.object({
  firstName:   nameSchema('nombre'),
  lastName:    nameSchema('apellido').optional().or(z.literal('')).default(''),
  displayName: noInjection('El nombre visible contiene caracteres no permitidos').and(
    z.string()
      .trim()
      .min(1,  'El nombre visible es requerido')
      .max(50, 'El nombre visible es demasiado largo')
      .refine((v) => !/\s{2,}/.test(v), 'El nombre visible no debe tener espacios dobles')
  ),
  email: emailSchema('El correo es requerido'),
})

export const updateAddressSchema = z.object({
  country:      z.string().trim().min(1, 'El país es requerido').max(100),
  addressLine1: noInjection('La dirección contiene caracteres no permitidos').and(
    z.string().trim().min(5, 'Ingresa una dirección válida').max(200, 'La dirección es demasiado larga')
  ),
  addressLine2: z.string().trim().max(200).optional().default(''),
  region:       z.string().trim().min(1, 'La región es requerida').max(100),
  city:         z.string().trim().min(1, 'La ciudad es requerida').max(100),
  postalCode:   z.string().trim().regex(/^\d{0,10}$/, 'El código postal solo puede contener números').optional().default(''),
})

// ─── TIPOS ────────────────────────────────────────────────────────────────────

export type RegistroDto      = z.infer<typeof registroSchema>
export type LoginDto         = z.infer<typeof loginSchema>
export type RecuperarDto     = z.infer<typeof recuperarSchema>
export type VerificarOtpDto  = z.infer<typeof verificarOtpSchema>
export type NuevaPasswordDto = z.infer<typeof nuevaPasswordSchema>
export type ResetPasswordDto = z.infer<typeof resetPasswordSchema>
export type UpdateProfileDto  = z.infer<typeof updateProfileSchema>
export type UpdateAddressDto  = z.infer<typeof updateAddressSchema>