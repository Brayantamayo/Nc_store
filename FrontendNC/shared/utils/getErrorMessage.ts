const FRIENDLY_MESSAGES: Record<string, string> = {
  'Credenciales incorrectas': 'El correo o la contraseña no son correctos. Revisa los datos e intenta de nuevo.',
  'Request failed with status code 401': 'El correo o la contraseña no son correctos. Revisa los datos e intenta de nuevo.',
  'Network Error': 'No pudimos conectar con el servidor. Revisa tu conexión e intenta de nuevo.',
}

const normalizeMessage = (message: string): string => {
  const trimmed = message.trim()
  return FRIENDLY_MESSAGES[trimmed] ?? trimmed
}

export const getErrorMessage = (error: unknown, fallback = 'Ocurrió un error inesperado'): string => {
  const data = (error as any)?.response?.data

  if (typeof data?.message === 'string' && data.message.trim()) return normalizeMessage(data.message)
  if (typeof data?.error === 'string' && data.error.trim()) return normalizeMessage(data.error)
  if (typeof data === 'string' && data.trim()) return normalizeMessage(data)

  if (Array.isArray(data?.errors) && data.errors.length > 0) {
    const firstError = data.errors[0]
    if (typeof firstError === 'string' && firstError.trim()) return normalizeMessage(firstError)
    if (typeof firstError?.message === 'string' && firstError.message.trim()) return normalizeMessage(firstError.message)
  }

  if (Array.isArray(data?.errores) && data.errores.length > 0) {
    const messages = data.errores
      .map((item: { mensaje?: string; message?: string }) => item.mensaje ?? item.message)
      .filter(Boolean)
      .join(' - ')
    if (messages.trim()) return normalizeMessage(messages)
  }

  if (data?.details) {
    if (typeof data.details === 'string' && data.details.trim()) return normalizeMessage(data.details)
    if (typeof data.details?.message === 'string' && data.details.message.trim()) {
      return normalizeMessage(data.details.message)
    }
  }

  if (typeof (error as Error)?.message === 'string' && (error as Error).message.trim()) {
    return normalizeMessage((error as Error).message)
  }

  if (data && typeof data === 'object') {
    try {
      const json = JSON.stringify(data)
      if (json) return json.substring(0, 200)
    } catch {}
  }

  return fallback
}
