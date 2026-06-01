export type PasswordFormErrors = Partial<Record<'password' | 'confirmar' | 'auth', string>>

export const validatePassword = (password: string, confirm: string): PasswordFormErrors => {
  if (!password.trim()) {
    return { password: 'La contraseña es obligatoria.' }
  }
  if (password.length < 8) {
    return { password: 'La contraseña debe tener al menos 8 caracteres.' }
  }
  if (!/[A-Z]/.test(password)) {
    return { password: 'Debe contener al menos una mayúscula.' }
  }
  if (!/[0-9]/.test(password)) {
    return { password: 'Debe contener al menos un número.' }
  }
  if (password !== confirm) {
    return { confirmar: 'Las contraseñas no coinciden.' }
  }
  return {}
}
