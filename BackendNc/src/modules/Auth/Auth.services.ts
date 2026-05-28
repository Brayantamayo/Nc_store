import { PrismaClient }                from '@prisma/client'
import bcrypt                          from 'bcryptjs'
import jwt                             from 'jsonwebtoken'
import crypto                          from 'crypto'
import { enviarCorreoBienvenida, enviarCorreoOtp } from '../../config/Mailer'
import type {
  RegistroDto,
  LoginDto,
  RecuperarDto,
  VerificarOtpDto,
  NuevaPasswordDto,
  ResetPasswordDto,
} from '../Auth/Validaciones/Auth.schema'

const prisma = new PrismaClient()

const JWT_SECRET       = process.env.JWT_SECRET!
const JWT_EXPIRES_IN   = process.env.JWT_EXPIRES_IN ?? '7d'
const OTP_TTL_MINUTES  = 15
const TOKEN_TTL_HOURS  = 24

// ─── HELPERS ─────────────────────────────────────────────────────────────────

const generarOtp = (): string =>
  Math.floor(100_000 + Math.random() * 900_000).toString()

const generarPasswordTemporal = (): string =>
  crypto.randomBytes(12).toString('base64url')

const firmarJwt = (payload: object): string =>
  jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as any)

// ─── REGISTRO ────────────────────────────────────────────────────────────────

export const registrar = async ({ email }: RegistroDto) => {
  const existe = await prisma.usuario.findUnique({ where: { email } })
  if (existe) throw new Error('Ya existe una cuenta con ese correo')

  // Obtener rol CLIENTE (debe existir en la BD)
  const rol = await prisma.role.findUnique({ where: { nombre: 'CLIENTE' } })
  if (!rol) throw new Error('Rol CLIENTE no configurado en la base de datos')

  const passwordTemporal = generarPasswordTemporal()
  const hash             = await bcrypt.hash(passwordTemporal, 12)

  // Crear usuario + cliente en una transacción
  const usuario = await prisma.$transaction(async (tx) => {
    const u = await tx.usuario.create({
      data: {
        email,
        password: hash,
        roleId:   rol.id,
      },
    })

    await tx.cliente.create({ data: { usuarioId: u.id } })

    return u
  })

  // Generar token de activación (RegistroToken)
  const expiresAt = new Date(Date.now() + TOKEN_TTL_HOURS * 60 * 60 * 1000)
  const registro  = await prisma.registroToken.create({
    data: { email, nombre: '', telefono: '', expiresAt },
  })

  await enviarCorreoBienvenida(email, registro.token)

  return { message: 'Cuenta creada. Revisa tu correo para crear tu contraseña.' }
}

// ─── CREAR CONTRASEÑA (link de bienvenida) ───────────────────────────────────

export const crearPassword = async ({ token, password }: ResetPasswordDto) => {
  const registro = await prisma.registroToken.findUnique({ where: { token } })

  if (!registro)              throw new Error('Token inválido')
  if (registro.usado)         throw new Error('Este enlace ya fue utilizado')
  if (registro.expiresAt < new Date()) throw new Error('El enlace ha expirado')

  const usuario = await prisma.usuario.findUnique({ where: { email: registro.email } })
  if (!usuario) throw new Error('Usuario no encontrado')

  const hash = await bcrypt.hash(password, 12)

  await prisma.$transaction([
    prisma.usuario.update({ where: { id: usuario.id }, data: { password: hash } }),
    prisma.registroToken.update({ where: { token }, data: { usado: true } }),
  ])

  return { message: 'Contraseña creada correctamente. Ya puedes iniciar sesión.' }
}

// ─── LOGIN ───────────────────────────────────────────────────────────────────

export const login = async ({ email, password }: LoginDto) => {
  const usuario = await prisma.usuario.findUnique({
    where:   { email },
    include: { role: true },
  })

  if (!usuario) throw new Error('Credenciales incorrectas')

  const ok = await bcrypt.compare(password, usuario.password)
  if (!ok)  throw new Error('Credenciales incorrectas')

  const token = firmarJwt({
    sub:   usuario.id,
    email: usuario.email,
    rol:   usuario.role.nombre,
  })

  return {
    token,
    usuario: {
      id:             usuario.id,
      email:          usuario.email,
      nombre:         usuario.nombre,
      nombreVisible:  usuario.nombreVisible,
      rol:            usuario.role.nombre,
    },
  }
}

// ─── RECUPERAR CONTRASEÑA — ENVIAR OTP ───────────────────────────────────────

export const solicitarOtp = async ({ email }: RecuperarDto) => {
  const usuario = await prisma.usuario.findUnique({ where: { email } })
  // Respuesta genérica para no revelar si el correo existe
  if (!usuario) return { message: 'Si el correo está registrado, recibirás un código.' }

  // Invalidar OTPs anteriores
  await prisma.passwordResetOtp.updateMany({
    where: { email, usado: false },
    data:  { usado: true },
  })

  const otp       = generarOtp()
  const hash      = await bcrypt.hash(otp, 10)
  const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000)

  await prisma.passwordResetOtp.create({
    data: { email, otp: hash, expiresAt },
  })

  await enviarCorreoOtp(email, otp)

  return { message: 'Si el correo está registrado, recibirás un código.' }
}

// ─── VERIFICAR OTP ───────────────────────────────────────────────────────────

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

  // El OTP es válido — generar token de sesión único para el reset
  const resetToken = crypto.randomBytes(32).toString('hex')
  const expiresAt  = new Date(Date.now() + 15 * 60 * 1000) // 15 min

  await prisma.$transaction([
    prisma.passwordResetOtp.update({ where: { id: registro.id }, data: { usado: true } }),
    prisma.registroToken.create({
      data: { email, nombre: '', telefono: '', expiresAt },
    }),
  ])

  // Devolvemos el token para que el frontend pueda hacer el cambio de contraseña
  const nuevoRegistro = await prisma.registroToken.findFirst({
    where:   { email, usado: false },
    orderBy: { createdAt: 'desc' },
  })

  return { resetToken: nuevoRegistro?.token, message: 'Código verificado correctamente' }
}

// ─── NUEVA CONTRASEÑA (tras verificar OTP) ───────────────────────────────────

export const nuevaPassword = async ({ token, password }: NuevaPasswordDto) => {
  const registro = await prisma.registroToken.findUnique({ where: { token } })

  if (!registro)              throw new Error('Token inválido')
  if (registro.usado)         throw new Error('Este token ya fue utilizado')
  if (registro.expiresAt < new Date()) throw new Error('El token ha expirado')

  const usuario = await prisma.usuario.findUnique({ where: { email: registro.email } })
  if (!usuario) throw new Error('Usuario no encontrado')

  const hash = await bcrypt.hash(password, 12)

  await prisma.$transaction([
    prisma.usuario.update({ where: { id: usuario.id }, data: { password: hash } }),
    prisma.registroToken.update({ where: { token }, data: { usado: true } }),
  ])

  return { message: 'Contraseña actualizada correctamente. Ya puedes iniciar sesión.' }
}