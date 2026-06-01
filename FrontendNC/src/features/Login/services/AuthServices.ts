import api from '@/shared/api/api'
import type { AuthUser, LoginResponse } from '@/shared/types/auth.types'

// Re-export para compatibilidad (Navbar importa desde aquí)
export { useCustomerSessionStore } from '@/shared/contexts/customerSessionStore'

// Re-export tipos para que otros módulos los consuman desde aquí si prefieren
export type { AuthUser, LoginResponse }

export interface RegistroResponse {
  message: string
  passwordTemporal?: string
}

export interface UpdateProfileResponse {
  message: string
  profile: {
    firstName: string
    lastName: string
    displayName: string
    email: string
  }
}

export interface UpdateAddressResponse {
  message: string
  address: {
    firstName: string
    lastName: string
    country: string
    addressLine1: string
    addressLine2: string
    region: string
    city: string
    postalCode: string
  }
}

export const authService = {

  login: async (email: string, password: string): Promise<LoginResponse> => {
    const { data } = await api.post('/auth/login', { email, password })
    return data
  },

  registro: async (email: string): Promise<RegistroResponse> => {
    const { data } = await api.post('/auth/registro', { email })
    return data
  },

  solicitarOtp: async (email: string): Promise<{ message: string }> => {
    const { data } = await api.post('/auth/recuperar', { email })
    return data
  },

  verificarOtp: async (email: string, otp: string): Promise<{ resetToken: string; message: string }> => {
    const { data } = await api.post('/auth/verificar-otp', { email, otp })
    return data
  },

  nuevaPassword: async (token: string, password: string, confirmar: string): Promise<{ message: string }> => {
    const { data } = await api.post('/auth/nueva-password', { token, password, confirmar })
    return data
  },

  crearPassword: async (token: string, password: string, confirmar: string): Promise<{ message: string }> => {
    const { data } = await api.post('/auth/crear-password', { token, password, confirmar })
    return data
  },

  updateProfile: async (payload: {
    firstName: string
    lastName: string
    displayName: string
    email: string
  }): Promise<UpdateProfileResponse> => {
    const { data } = await api.put('/auth/perfil', payload)
    return data
  },

  updateAddress: async (payload: {
    country: string
    addressLine1: string
    addressLine2: string
    region: string
    city: string
    postalCode: string
  }): Promise<UpdateAddressResponse> => {
    const { data } = await api.put('/auth/direccion', payload)
    return data
  },
}
