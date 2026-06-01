import { PrismaClient }   from '@prisma/client'
import bcrypt             from 'bcryptjs'
import jwt                from 'jsonwebtoken'
import crypto             from 'crypto'
import { enviarCorreoBienvenida, enviarCorreoOtp } from '../../config/Mailer'
import type {
  RegistroDto, LoginDto, RecuperarDto, VerificarOtpDto,
  NuevaPasswordDto, ResetPasswordDto, UpdateProfileDto, UpdateAddressDto,
} from '../Auth/Validaciones/Auth.schema'

const prisma = new PrismaClient()

const JWT_SECRET      = process.env.JWT_SECRET!
const JWT_EXPIRES_IN  = process.env.JWT_EXPIRES_IN ?? '7d'
const OTP_TTL_MINUTES = 15
const TOKEN_TTL_HOURS = 24

// ─── SEGURIDAD: validar que JWT_SECRET exista y sea robusto al iniciar ────────
if (!JWT_SECRET || JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET debe tener al menos 32 caracteres')
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const generarOtp = (): string =>
  crypto.randomInt(100_000, 999_999).toString()               // crypto seguro, no Math.random

const generarPasswordTemporal = (): string =>
  crypto.randomBytes(16).toString('base64url')                // 16 bytes = mayor entropía

const firmarJwt = (payload: object): string =>
  jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as any)

const crearTokenRegistro = (email: string, expiresAt: Date) =>
  prisma.registroToken.create({
    data: { token: crypto.randomUUID(), email, nombre: '', telefono: '', expiresAt },
  })

// ─── RATE LIMIT simple en memoria (producción: usar Redis) ───────────────────
const intentosLogin   = new Map<string, { count: number; until: number }>()
const intentosOtp     = new Map<string, { count: number; until: number }>()
const intentosRegistro = new Map<string, { count: number; until: number }>()

const MAX_LOGIN    = 5
const MAX_OTP      = 5
const MAX_REGISTRO = 3
const BLOQUEO_MS   = 15 * 60 * 1000  // 15 min

function verificarRateLimit(
  mapa: Map<string, { count: number; until: number }>,
  key: string,
  max: number
) {
  const ahora = Date.now()
  const entry = mapa.get(key)

  if (entry && ahora < entry.until) {
    const mins = Math.ceil((entry.until - ahora) / 60_000)
    throw new Error(`Demasiados intentos. Intenta de nuevo en ${mins} minuto(s).`)
  }

  const nuevo = { count: (entry?.count ?? 0) + 1, until: ahora + BLOQUEO_MS }
  if (nuevo.count >= max) {
    mapa.set(key, nuevo)
    throw new Error(`Demasiados intentos. Intenta de nuevo en 15 minutos.`)
  }

  mapa.set(key, { ...nuevo, until: 0 })  // reinicia ventana sin bloquear aún
}

function limpiarRateLimit(
  mapa: Map<string, { count: number; until: number }>,
  key: string
) {
  mapa.delete(key)
}

// ─── REGISTRO ─────────────────────────────────────────────────────────────────

export const registrar = async ({ email }: RegistroDto) => {
  // Rate limit por email para evitar spam de registro
  verificarRateLimit(intentosRegistro, email, MAX_REGISTRO)

  const rol = await prisma.role.findUnique({ where: { nombre: 'CLIENTE' } })
  if (!rol) throw new Error('Rol CLIENTE no configurado en la base de datos')

  const existe = await prisma.usuario.findUnique({ where: { email } })
  if (existe) throw new Error('Este correo ya está registrado')

  const hash = await bcrypt.hash(generarPasswordTemporal(), 12)
  await prisma.$transaction(async (tx) => {
    const usuario = await tx.usuario.create({ data: { email, password: hash, roleId: rol.id } })
    await tx.cliente.create({ data: { usuarioId: usuario.id } })
  })

  // Invalidar tokens anteriores no usados para este email
  await prisma.registroToken.updateMany({
    where: { email, usado: false },
    data:  { usado: true },
  })

  const expiresAt = new Date(Date.now() + TOKEN_TTL_HOURS * 60 * 60 * 1000)
  const registro  = await crearTokenRegistro(email, expiresAt)

  await enviarCorreoBienvenida(email, registro.token)

  limpiarRateLimit(intentosRegistro, email)
  return { message: 'Revisa tu correo para crear tu contraseña.' }
}

// ─── CREAR CONTRASEÑA (link de bienvenida) ────────────────────────────────────

export const crearPassword = async ({ token, password }: ResetPasswordDto) => {
  // Validar formato UUID antes de tocar la BD
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(token)) {
    throw new Error('Token inválido')
  }

  const registro = await prisma.registroToken.findUnique({ where: { token } })
  if (!registro)                       throw new Error('Token inválido')
  if (registro.usado)                  throw new Error('Este enlace ya fue utilizado')
  if (registro.expiresAt < new Date()) throw new Error('El enlace ha expirado')

  const usuario = await prisma.usuario.findUnique({ where: { email: registro.email } })
  if (!usuario) throw new Error('Usuario no encontrado')

  // Evitar reutilizar la misma contraseña
  const esIgual = await bcrypt.compare(password, usuario.password)
  if (esIgual) throw new Error('La contraseña nueva no puede ser igual a la actual')

  const hash = await bcrypt.hash(password, 12)

  await prisma.$transaction([
    prisma.usuario.update({ where: { id: usuario.id }, data: { password: hash } }),
    prisma.registroToken.update({ where: { token }, data: { usado: true } }),
  ])

  return { message: 'Contraseña creada correctamente. Ya puedes iniciar sesión.' }
}

// ─── LOGIN ────────────────────────────────────────────────────────────────────

export const login = async ({ email, password }: LoginDto) => {
  // Rate limit por email para bloquear fuerza bruta
  verificarRateLimit(intentosLogin, email, MAX_LOGIN)

  const usuario = await prisma.usuario.findUnique({
    where:   { email },
    include: { role: true, cliente: true },
  })

  // Comparación constante aunque el usuario no exista (evita timing attack)
  const hashFalso = '$2a$12$invalidhashfortimingnpurposesonly000000000000000000000'
  const passwordOk = usuario
    ? await bcrypt.compare(password, usuario.password)
    : await bcrypt.compare(password, hashFalso).then(() => false)

  if (!usuario || !passwordOk) {
    throw new Error('Credenciales incorrectas')
  }

  limpiarRateLimit(intentosLogin, email)

  const token = firmarJwt({
    sub:   usuario.id,
    email: usuario.email,
    rol:   usuario.role.nombre,
  })

  return {
    token,
    usuario: {
      id:            usuario.id,
      email:         usuario.email,
      nombre:        usuario.nombre,
      apellido:      usuario.apellido,
      nombreVisible: usuario.nombreVisible,
      rol:           usuario.role.nombre,
      cliente: usuario.cliente
        ? {
            firstName:    usuario.nombre        ?? '',
            lastName:     usuario.apellido       ?? '',
            country:      'Colombia',
            addressLine1: usuario.cliente.direccion    ?? '',
            addressLine2: usuario.cliente.direccion2   ?? '',
            region:       usuario.cliente.region       ?? '',
            city:         usuario.cliente.ciudad       ?? '',
            postalCode:   usuario.cliente.codigoPostal ?? '',
          }
        : null,
    },
  }
}

// ─── ACTUALIZAR PERFIL ────────────────────────────────────────────────────────

export const actualizarPerfil = async (userId: number, dto: UpdateProfileDto) => {
  if (!Number.isInteger(userId) || userId <= 0) throw new Error('ID de usuario inválido')

  const usuarioExistente = await prisma.usuario.findUnique({ where: { id: userId } })
  if (!usuarioExistente) throw new Error('Usuario no encontrado')

  const emailActualizado = dto.email.toLowerCase().trim()
  if (emailActualizado !== usuarioExistente.email) {
    const existeEmail = await prisma.usuario.findUnique({ where: { email: emailActualizado } })
    if (existeEmail && existeEmail.id !== userId) throw new Error('Ya existe otra cuenta con ese correo')
  }

  const usuario = await prisma.usuario.update({
    where: { id: userId },
    data: {
      nombre:        dto.firstName.trim(),
      apellido:      dto.lastName?.trim() ?? '',
      nombreVisible: dto.displayName.trim(),
      email:         emailActualizado,
    },
  })

  return {
    message: 'Los datos de la cuenta se guardaron correctamente.',
    profile: {
      firstName:   usuario.nombre        ?? '',
      lastName:    usuario.apellido      ?? '',
      displayName: usuario.nombreVisible ?? '',
      email:       usuario.email,
    },
  }
}

// ─── ACTUALIZAR DIRECCIÓN ─────────────────────────────────────────────────────

export const actualizarDireccion = async (userId: number, dto: UpdateAddressDto) => {
  if (!Number.isInteger(userId) || userId <= 0) throw new Error('ID de usuario inválido')

  const usuario = await prisma.usuario.findUnique({
    where: { id: userId }, include: { cliente: true },
  })
  if (!usuario) throw new Error('Usuario no encontrado')

  if (!usuario.cliente) {
    await prisma.cliente.create({ data: { usuarioId: usuario.id } })
  }

  const cliente = await prisma.cliente.update({
    where: { usuarioId: usuario.id },
    data: {
      direccion:    dto.addressLine1,
      direccion2:   dto.addressLine2 ?? '',
      region:       dto.region,
      ciudad:       dto.city,
      codigoPostal: dto.postalCode ?? '',
    },
  })

  return {
    message: 'La dirección se guardó correctamente.',
    address: {
      country:      dto.country,
      addressLine1: cliente.direccion    ?? '',
      addressLine2: cliente.direccion2   ?? '',
      region:       cliente.region       ?? '',
      city:         cliente.ciudad       ?? '',
      postalCode:   cliente.codigoPostal ?? '',
    },
  }
}

// ─── RECUPERAR CONTRASEÑA — ENVIAR OTP ───────────────────────────────────────

export const solicitarOtp = async ({ email }: RecuperarDto) => {
  // Rate limit para evitar spam de OTPs
  verificarRateLimit(intentosOtp, email, MAX_OTP)

  const usuario = await prisma.usuario.findUnique({ where: { email } })
  // Respuesta genérica: no revela si el correo existe
  if (!usuario) return { message: 'Si el correo está registrado, recibirás un código.' }

  // Invalidar OTPs anteriores
  await prisma.passwordResetOtp.updateMany({
    where: { email, usado: false },
    data:  { usado: true },
  })

  const otp       = generarOtp()                              // crypto.randomInt
  const hash      = await bcrypt.hash(otp, 10)
  const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000)

  await prisma.passwordResetOtp.create({ data: { email, otp: hash, expiresAt } })
  await enviarCorreoOtp(email, otp)

  return { message: 'Si el correo está registrado, recibirás un código.' }
}

// ─── VERIFICAR OTP ────────────────────────────────────────────────────────────

export const verificarOtp = async ({ email, otp }: VerificarOtpDto) => {
  const registros = await prisma.passwordResetOtp.findMany({
    where:   { email, usado: false },
    orderBy: { createdAt: 'desc' },
    take:    1,
  })

  const registro = registros[0]
  if (!registro || registro.expiresAt < new Date()) {
    throw new Error('El código es inválido o ha expirado')
  }

  const ok = await bcrypt.compare(otp, registro.otp)
  if (!ok) throw new Error('El código es inválido o ha expirado')

  const resetToken = crypto.randomUUID()
  const expiresAt  = new Date(Date.now() + 15 * 60 * 1000)

  await prisma.$transaction([
    prisma.passwordResetOtp.update({ where: { id: registro.id }, data: { usado: true } }),
    prisma.registroToken.create({
      data: { token: resetToken, email, nombre: '', telefono: '', expiresAt },
    }),
  ])

  limpiarRateLimit(intentosOtp, email)

  return { resetToken, message: 'Código verificado correctamente' }
}

// ─── NUEVA CONTRASEÑA (tras verificar OTP) ───────────────────────────────────

export const nuevaPassword = async ({ token, password }: NuevaPasswordDto) => {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(token)) {
    throw new Error('Token inválido')
  }

  const registro = await prisma.registroToken.findUnique({ where: { token } })
  if (!registro)                       throw new Error('Token inválido')
  if (registro.usado)                  throw new Error('Este token ya fue utilizado')
  if (registro.expiresAt < new Date()) throw new Error('El token ha expirado')

  const usuario = await prisma.usuario.findUnique({ where: { email: registro.email } })
  if (!usuario) throw new Error('Usuario no encontrado')

  const esIgual = await bcrypt.compare(password, usuario.password)
  if (esIgual) throw new Error('La contraseña nueva no puede ser igual a la actual')

  const hash = await bcrypt.hash(password, 12)

  await prisma.$transaction([
    prisma.usuario.update({ where: { id: usuario.id }, data: { password: hash } }),
    prisma.registroToken.update({ where: { token }, data: { usado: true } }),
  ])

  return { message: 'Contraseña actualizada correctamente. Ya puedes iniciar sesión.' }
}
