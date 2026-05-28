import { Router } from 'express'
import * as AuthController from './Auth.controller'

const router = Router()

// POST /api/auth/registro          → crear cuenta con solo el email
router.post('/registro',            AuthController.registro)

// POST /api/auth/crear-password    → activar cuenta (link del correo de bienvenida)
router.post('/crear-password',      AuthController.crearPassword)

// POST /api/auth/login             → iniciar sesión
router.post('/login',               AuthController.login)

// POST /api/auth/recuperar         → solicitar OTP de recuperación
router.post('/recuperar',           AuthController.solicitarOtp)

// POST /api/auth/verificar-otp     → verificar código OTP
router.post('/verificar-otp',       AuthController.verificarOtp)

// POST /api/auth/nueva-password    → guardar nueva contraseña (tras OTP)
router.post('/nueva-password',      AuthController.nuevaPassword)

export default router