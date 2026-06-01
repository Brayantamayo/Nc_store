import express      from 'express'
import cors         from 'cors'
import helmet       from 'helmet'
import rateLimit    from 'express-rate-limit'
import { routes }   from './routes'
import { notFoundHandler, errorHandler } from './middlewares/errorHandler'

// ─── MÓDULOS ─────────────────────────────────────────────────────────────────
import authRoutes      from './modules/Auth/Auth.routes'
import categoriaRoutes from './modules/Categoria/Categoria.routes'
import varianteRoutes  from './modules/Variante/Variante.routes'  
import productsRoutes  from './modules/Productos/products.routes'

// ─── MIDDLEWARES DE AUTENTICACIÓN ─────────────────────────────────────────────
import { soloAdmin, autenticado } from './middlewares/Auth.middleware'
import imagenRoutes from './modules/Imagen/Imagen.routes'

const app = express()

// ─── SEGURIDAD ────────────────────────────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: {
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      'upgrade-insecure-requests': null,
    }
  }
}))

app.use(cors({
  origin: (origin, callback) => {
    const allowed = [
      'http://localhost:3000',
      'http://localhost:5173',
      process.env.FRONTEND_URL,
    ]
    if (!origin) return callback(null, true)
    if (origin.startsWith('http://localhost:')) return callback(null, true)
    if (allowed.includes(origin)) return callback(null, true)
    callback(new Error('No permitido por CORS'))
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))

app.use(express.json())

// ─── RATE LIMITING ────────────────────────────────────────────────────────────
const authLimiter = rateLimit({
  windowMs:       15 * 60 * 1000,
  max:            10,
  message:        { message: 'Demasiados intentos. Intenta de nuevo en 15 minutos.' },
  standardHeaders: true,
  legacyHeaders:  false,
})

app.use('/api/auth/login',          authLimiter)
app.use('/api/auth/registro',       authLimiter)
app.use('/api/auth/recuperar',      authLimiter)
app.use('/api/auth/verificar-otp',  authLimiter)
app.use('/api/auth/nueva-password', authLimiter)

// ─── HEALTH CHECK ─────────────────────────────────────────────────────────────
app.use(routes)

// ─── RUTAS PÚBLICAS ───────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes)

// ─── RUTAS PROTEGIDAS — SOLO ADMIN ───────────────────────────────────────────
app.use('/api/categorias', ...soloAdmin, categoriaRoutes)
app.use('/api/productos',  ...soloAdmin, productsRoutes)
app.use('/api/variantes',  ...soloAdmin, varianteRoutes)
app.use('/api/imagenes', ...soloAdmin, imagenRoutes)  // ← agrega esto


// ─── ERRORES ─────────────────────────────────────────────────────────────────
app.use(notFoundHandler)
app.use(errorHandler)

export default app
