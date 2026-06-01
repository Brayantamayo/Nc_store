import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authService } from '../../src/features/Login/services/AuthServices'
import type { AuthUser, CustomerAddress, CustomerSession } from '../types/auth.types'
import { getErrorMessage } from '../utils/getErrorMessage'

// ─── HELPERS ─────────────────────────────────────────────────────────────────

const buildEmptyAddress = (): CustomerAddress => ({
  firstName:    '',
  lastName:     '',
  country:      'Colombia',
  addressLine1: '',
  addressLine2: '',
  region:       '',
  city:         '',
  postalCode:   '',
})

const buildSession = (usuario: AuthUser): CustomerSession => ({
  id:          usuario.id,
  email:       usuario.email,
  firstName:   usuario.nombre ?? '',
  lastName:    usuario.apellido ?? '',
  displayName: usuario.nombreVisible ?? '',
  rol:         usuario.rol,
  createdAt:   new Date().toISOString(),
  address:     usuario.cliente ?? buildEmptyAddress(),
})

// ─── STORE ───────────────────────────────────────────────────────────────────

interface CustomerSessionState {
  customer: CustomerSession | null
  token:    string | null

  login:             (email: string, password: string) => Promise<{ success: boolean; message: string; customer?: CustomerSession }>
  registerWithEmail: (email: string) => Promise<{ success: boolean; message: string; passwordTemporal?: string }>
  updateProfile:     (payload: { firstName: string; lastName: string; displayName: string; email: string }) => Promise<{ success: boolean; message: string }>
  updateAddress:     (address: CustomerAddress) => Promise<{ success: boolean; message: string }>
  logout:            () => void
  isLoggedIn:        () => boolean
}

export const useCustomerSessionStore = create<CustomerSessionState>()(
  persist(
    (set, get) => ({
      customer: null,
      token:    null,

      login: async (email, password) => {
        try {
          const data = await authService.login(email, password)
          const session = buildSession(data.usuario)

          localStorage.setItem('token', data.token)
          localStorage.removeItem('nc-admin-session')
          set({ customer: session, token: data.token })

          return { success: true, message: 'Sesión iniciada correctamente.', customer: session }
        } catch (err) {
          return {
            success: false,
            message: getErrorMessage(err, 'No pudimos iniciar sesión. Revisa tus datos e intenta de nuevo.'),
          }
        }
      },

      registerWithEmail: async (email) => {
        try {
          const data = await authService.registro(email)
          return { success: true, message: data.message, passwordTemporal: data.passwordTemporal }
        } catch (err) {
          return { success: false, message: getErrorMessage(err, 'No pudimos crear la cuenta.') }
        }
      },

      updateProfile: async (payload) => {
        try {
          const data = await authService.updateProfile(payload)
          const current = get().customer
          if (current) {
            set({
              customer: {
                ...current,
                firstName: data.profile.firstName,
                lastName: data.profile.lastName,
                displayName: data.profile.displayName,
                email: data.profile.email,
              },
            })
          }
          return { success: true, message: data.message }
        } catch (err) {
          return {
            success: false,
            message: getErrorMessage(err, 'No pudimos guardar los datos de la cuenta.'),
          }
        }
      },

      updateAddress: async (address) => {
        try {
          const data = await authService.updateAddress(address)
          const current = get().customer
          if (current) {
            set({
              customer: {
                ...current,
                address: data.address,
              },
            })
          }
          return { success: true, message: data.message }
        } catch (err) {
          return {
            success: false,
            message: getErrorMessage(err, 'No pudimos guardar la dirección.'),
          }
        }
      },

      logout: () => {
        localStorage.removeItem('token')
        localStorage.removeItem('nc-admin-session')
        set({ customer: null, token: null })
      },

      isLoggedIn: () => Boolean(get().customer && get().token),
    }),
    {
      name:    'nc-customer-session',
      version: 4,
      partialize: (state) => ({ token: state.token, customer: state.customer }),
      migrate: () => ({ customer: null, token: null }),
    }
  )
)
