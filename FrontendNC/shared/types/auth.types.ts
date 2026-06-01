// ─── TIPOS DE AUTENTICACIÓN ──────────────────────────────────────────────────
// Fuente única de verdad para las interfaces de Auth en todo el frontend.

/** Usuario devuelto por el backend en /auth/login */
export interface AuthUser {
  id:            number
  email:         string
  nombre:        string | null
  apellido:      string | null
  nombreVisible: string | null
  rol:           string
  cliente:       CustomerAddress | null
}

/** Respuesta completa de POST /auth/login */
export interface LoginResponse {
  token:   string
  usuario: AuthUser
}

/** Dirección de envío del cliente */
export interface CustomerAddress {
  firstName:    string
  lastName:     string
  country:      string
  addressLine1: string
  addressLine2: string
  region:       string
  city:         string
  postalCode:   string
}

/** Sesión activa del cliente en el frontend */
export interface CustomerSession {
  id:          number
  email:       string
  firstName:   string
  lastName:    string
  displayName: string
  rol:         string
  createdAt:   string
  address:     CustomerAddress
}
