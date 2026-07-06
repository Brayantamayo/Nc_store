import axios from 'axios'
import { getErrorMessage } from '@/shared/utils/getErrorMessage'

const ADMIN_TOKEN_KEY = 'nc-admin-token';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  // nc-panel-access es la página de login, no requiere token
  const pathname     = window.location.pathname.toLowerCase();
  const isAdminRoute = pathname.startsWith('/admin');

  let token: string | null = null

  if (isAdminRoute) {
    token = localStorage.getItem(ADMIN_TOKEN_KEY)
  } else {
    // El token de cliente vive en el estado persistido de Zustand bajo 'nc-customer-session'
    try {
      const raw = localStorage.getItem('nc-customer-session')
      if (raw) {
        const parsed = JSON.parse(raw) as { state?: { token?: string } }
        token = parsed?.state?.token ?? null
      }
    } catch {
      token = null
    }
  }

  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = getErrorMessage(error, 'Error inesperado')

    if (error.response?.status === 401) {
      const isLoginRequest = error.config?.url?.includes('/auth/login')
      const pathname       = window.location.pathname.toLowerCase()
      const isAdminRoute   = pathname.startsWith('/admin')

      if (!isLoginRequest) {
        if (isAdminRoute) {
          localStorage.removeItem(ADMIN_TOKEN_KEY)
          localStorage.removeItem('nc-admin-session')
          localStorage.removeItem('nc-admin-email')
          window.location.href = '/'
        } else {
          // Sesión de cliente expirada — limpiar el store persistido y redirigir
          localStorage.removeItem('nc-customer-session')
          window.location.href = '/mi-cuenta'
        }
      }
    }

    return Promise.reject(new Error(message))
  }
)

export default api
