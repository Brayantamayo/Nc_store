import { Request, Response } from 'express'
import * as AuthService       from './Auth.services'
import { asyncHandler }       from '../../middlewares/Asynchandler'
import {
  registroSchema,
  loginSchema,
  recuperarSchema,
  verificarOtpSchema,
  nuevaPasswordSchema,
  resetPasswordSchema,
  updateProfileSchema,
  updateAddressSchema,
} from './Validaciones/Auth.schema'

// ─── REGISTRO ────────────────────────────────────────────────────────────────

export const registro = asyncHandler(async (req, res) => {
  const body   = registroSchema.parse(req.body)
  const result = await AuthService.registrar(body)
  res.status(201).json({ ok: true, ...result })
})

// ─── CREAR CONTRASEÑA (link de bienvenida) ───────────────────────────────────

export const crearPassword = asyncHandler(async (req, res) => {
  const body   = resetPasswordSchema.parse(req.body)
  const result = await AuthService.crearPassword(body)
  res.status(200).json({ ok: true, ...result })
})

// ─── LOGIN ───────────────────────────────────────────────────────────────────

export const login = asyncHandler(async (req, res) => {
  const body   = loginSchema.parse(req.body)
  const result = await AuthService.login(body)
  res.status(200).json({ ok: true, ...result })
})

// ─── RECUPERAR — SOLICITAR OTP ───────────────────────────────────────────────

export const solicitarOtp = asyncHandler(async (req, res) => {
  const body   = recuperarSchema.parse(req.body)
  const result = await AuthService.solicitarOtp(body)
  res.status(200).json({ ok: true, ...result })
})

// ─── VERIFICAR OTP ───────────────────────────────────────────────────────────

export const verificarOtp = asyncHandler(async (req, res) => {
  const body   = verificarOtpSchema.parse(req.body)
  const result = await AuthService.verificarOtp(body)
  res.status(200).json({ ok: true, ...result })
})

// ─── NUEVA CONTRASEÑA ────────────────────────────────────────────────────────

export const nuevaPassword = asyncHandler(async (req, res) => {
  const body   = nuevaPasswordSchema.parse(req.body)
  const result = await AuthService.nuevaPassword(body)
  res.status(200).json({ ok: true, ...result })
})

export const actualizarPerfil = asyncHandler(async (req, res) => {
  const userId = req.usuario?.sub
  if (!userId) throw new Error('No autenticado')

  const body = updateProfileSchema.parse(req.body)
  const result = await AuthService.actualizarPerfil(Number(userId), body)
  res.status(200).json({ ok: true, ...result })
})

export const actualizarDireccion = asyncHandler(async (req, res) => {
  const userId = req.usuario?.sub
  if (!userId) throw new Error('No autenticado')

  const body = updateAddressSchema.parse(req.body)
  const result = await AuthService.actualizarDireccion(Number(userId), body)
  res.status(200).json({ ok: true, ...result })
})
