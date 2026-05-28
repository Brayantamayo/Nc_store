import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host:   process.env.SMTP_HOST,
  port:   Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

const FROM = `"${process.env.STORE_NAME ?? 'NC Store'}" <${process.env.SMTP_USER}>`

// ─── BIENVENIDA + LINK PARA CREAR CONTRASEÑA ─────────────────────────────────

export const enviarCorreoBienvenida = async (email: string, token: string) => {
  const link = `${process.env.FRONTEND_URL}/crear-password?token=${token}`

  await transporter.sendMail({
    from:    FROM,
    to:      email,
    subject: 'Bienvenida — crea tu contraseña',
    html: `
      <div style="font-family:sans-serif;max-width:540px;margin:0 auto;">
        <h2 style="color:#c2185b;">¡Bienvenida a ${process.env.STORE_NAME ?? 'NC Store'}!</h2>
        <p>Tu cuenta fue creada con el correo <strong>${email}</strong>.</p>
        <p>Para ingresar necesitas crear tu contraseña. Haz clic en el siguiente botón — el enlace es válido por <strong>24 horas</strong>.</p>
        <a href="${link}"
           style="display:inline-block;margin:16px 0;padding:12px 28px;background:#e91e8c;color:#fff;text-decoration:none;border-radius:6px;font-weight:600;">
          Crear contraseña
        </a>
        <p style="font-size:12px;color:#999;">Si no solicitaste esta cuenta, ignora este correo.</p>
      </div>
    `,
  })
}

// ─── OTP RECUPERACIÓN ────────────────────────────────────────────────────────

export const enviarCorreoOtp = async (email: string, otp: string) => {
  await transporter.sendMail({
    from:    FROM,
    to:      email,
    subject: 'Código para recuperar tu contraseña',
    html: `
      <div style="font-family:sans-serif;max-width:540px;margin:0 auto;">
        <h2 style="color:#c2185b;">Recuperación de contraseña</h2>
        <p>Tu código de verificación es:</p>
        <div style="font-size:36px;font-weight:700;letter-spacing:10px;color:#c2185b;margin:20px 0;">
          ${otp}
        </div>
        <p>Este código expira en <strong>15 minutos</strong>.</p>
        <p style="font-size:12px;color:#999;">Si no solicitaste este código, ignora este correo.</p>
      </div>
    `,
  })
}