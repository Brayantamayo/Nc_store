// ─── CLIENTE ──────────────────────────────────────────────────────────────────

const BREVO_API_KEY = process.env.BREVO_API_KEY!;
const brandName = process.env.STORE_NAME ;
const brandUrl = process.env.FRONTEND_URL;

const sender = {
  email: process.env.SMTP_USER!,
  name: brandName,
};

// ─── HELPER ───────────────────────────────────────────────────────────────────

async function sendMail(to: string, subject: string, htmlContent: string) {
  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": BREVO_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sender,
      to: [{ email: to }],
      subject,
      htmlContent,
    }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(`Brevo error: ${JSON.stringify(error)}`);
  }
}

// ─── SHELL ────────────────────────────────────────────────────────────────────

const emailShell = (content: string) => `
  <div style="margin:0;padding:0;background:#f6f2f4;">
    <div style="max-width:600px;margin:0 auto;padding:28px 16px 40px;">
      <div style="background:#f7b8bb;padding:30px 32px 26px;border:1px solid rgba(0,0,0,0.08);border-bottom:none;">
        <h1 style="margin:0;font-family:Arial,sans-serif;font-size:28px;line-height:1.2;color:#1f1f1f;font-weight:500;">
          ${brandName}
        </h1>
      </div>
      <div style="background:#0a0a0a;padding:32px;color:#f7f3f5;border:1px solid rgba(0,0,0,0.08);font-family:Arial,sans-serif;">
        ${content}
      </div>
      <div style="padding:18px 8px 0;text-align:center;font-family:Arial,sans-serif;font-size:12px;color:#6a6a6a;">
        ${brandName} — <a href="${brandUrl}" style="color:#7a3b58;text-decoration:underline;">${brandUrl}</a>
      </div>
    </div>
  </div>
`

// ─── BIENVENIDA + LINK PARA CREAR CONTRASEÑA ─────────────────────────────────

export const enviarCorreoBienvenida = async (email: string, token: string) => {
  const link = `${process.env.FRONTEND_URL}/crear-password?token=${token}&email=${encodeURIComponent(email)}`;

  await sendMail(
    email,
    `Bienvenida a ${brandName} — crea tu contraseña`,
    emailShell(`
      <p style="margin:0 0 18px;font-size:15px;line-height:1.7;color:#d8d8d8;">Hola <strong style="color:#fff;">${email}</strong>,</p>
      <p style="margin:0 0 18px;font-size:15px;line-height:1.7;color:#d8d8d8;">
        Gracias por crear tu cuenta en ${brandName}. Para entrar a tu perfil primero necesitas definir tu contraseña inicial.
      </p>
      <p style="margin:0 0 24px;font-size:15px;line-height:1.7;color:#d8d8d8;">
        Haz clic en el botón para continuar. Este enlace estará disponible por <strong style="color:#fff;">24 horas</strong>.
      </p>
      <a href="${link}"
         style="display:inline-block;margin:0 0 22px;padding:13px 28px;background:#f3b0bd;color:#111;text-decoration:none;border-radius:999px;font-weight:700;letter-spacing:0.04em;">
        Crear contraseña
      </a>
      <p style="margin:0 0 12px;font-size:14px;line-height:1.7;color:#d8d8d8;">
        Si el botón no abre, copia y pega este enlace en tu navegador:
      </p>
      <p style="margin:0;font-size:13px;line-height:1.7;word-break:break-all;color:#f4cad0;">
        ${link}
      </p>
      <p style="margin:26px 0 0;font-size:13px;line-height:1.7;color:#9d9d9d;">
        Si no solicitaste esta cuenta, puedes ignorar este correo.
      </p>
    `)
  );
};

// ─── OTP RECUPERACIÓN ────────────────────────────────────────────────────────

export const enviarCorreoOtp = async (email: string, otp: string) => {
  await sendMail(
    email,
    `Código para recuperar tu contraseña en ${brandName}`,
    emailShell(`
      <p style="margin:0 0 18px;font-size:15px;line-height:1.7;color:#d8d8d8;">Hola,</p>
      <p style="margin:0 0 18px;font-size:15px;line-height:1.7;color:#d8d8d8;">
        Recibimos una solicitud para recuperar el acceso a tu cuenta.
      </p>
      <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#d8d8d8;">
        Tu código de verificación es:
      </p>
      <div style="margin:10px 0 22px;padding:18px 20px;border:1px solid rgba(255,255,255,0.12);background:#141414;text-align:center;font-size:36px;font-weight:700;letter-spacing:0.28em;color:#f7b8bb;">
        ${otp}
      </div>
      <p style="margin:0 0 10px;font-size:15px;line-height:1.7;color:#d8d8d8;">
        Este código expira en <strong style="color:#fff;">15 minutos</strong>.
      </p>
      <p style="margin:0;font-size:13px;line-height:1.7;color:#9d9d9d;">
        Si no pediste este cambio, puedes ignorar este mensaje.
      </p>
    `)
  );
};