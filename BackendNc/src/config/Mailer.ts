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

// ─── CONFIRMACIÓN DE PEDIDO ──────────────────────────────────────────────────

interface OrderItemEmail {
  productName: string;
  color: string;
  quantity: number;
  unitPrice: number;
  image?: string;
  detallesCombo?: any;
}

interface OrderConfirmationData {
  orderId: number;
  customerName: string;
  items: OrderItemEmail[];
  subtotal: number;
  shippingCost: number;
  total: number;
}

const formatCOP = (value: number) =>
  `$${value.toLocaleString('es-CO')}`;

export const enviarCorreoConfirmacionPedido = async (
  email: string,
  data: OrderConfirmationData,
) => {
  const itemsHtml = data.items
    .map(
      (item) => `
      <tr>
        <td style="padding:12px 8px;border-bottom:1px solid rgba(255,255,255,0.08);">
          <div style="display:flex;align-items:center;gap:12px;">
            ${
              item.image
                ? `<img src="${item.image}" alt="${item.productName}" style="width:50px;height:50px;object-fit:cover;border-radius:8px;" />`
                : ''
            }
            <div>
              <p style="margin:0;font-size:14px;color:#fff;font-weight:600;">${item.productName}</p>
              ${
                item.detallesCombo
                  ? Object.entries(item.detallesCombo)
                      .map(([opt, color]) => `<p style="margin:2px 0 0;font-size:12px;color:#aaa;"><strong>${opt}:</strong> ${color}</p>`)
                      .join('')
                  : `<p style="margin:2px 0 0;font-size:12px;color:#aaa;">Color: ${item.color} · Cant: ${item.quantity}</p>`
              }
              ${item.detallesCombo ? `<p style="margin:4px 0 0;font-size:12px;color:#aaa;font-weight:600;">Cant: ${item.quantity}</p>` : ''}
            </div>
          </div>
        </td>
        <td style="padding:12px 8px;border-bottom:1px solid rgba(255,255,255,0.08);text-align:right;font-size:14px;color:#f3b0bd;font-weight:600;">
          ${formatCOP(item.unitPrice * item.quantity)}
        </td>
      </tr>`,
    )
    .join('');

  await sendMail(
    email,
    `¡Pedido #${data.orderId} recibido! — ${brandName}`,
    emailShell(`
      <p style="margin:0 0 6px;font-size:22px;font-weight:700;color:#f3b0bd;">
        ¡Hemos recibido tu pedido!
      </p>
      <p style="margin:0 0 22px;font-size:15px;line-height:1.7;color:#d8d8d8;">
        Hola <strong style="color:#fff;">${data.customerName}</strong>, muchas gracias por confiar en nosotros. 
        Tu pedido <strong style="color:#f3b0bd;">#${data.orderId}</strong> ya está siendo procesado.
      </p>

      <div style="margin:0 0 24px;padding:16px;background:#141414;border:1px solid rgba(255,255,255,0.08);border-radius:12px;">
        <p style="margin:0 0 12px;font-size:13px;text-transform:uppercase;letter-spacing:0.06em;color:#888;font-weight:700;">
          Resumen de tu pedido
        </p>
        <table style="width:100%;border-collapse:collapse;">
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <div style="margin-top:16px;padding-top:12px;border-top:1px solid rgba(255,255,255,0.12);">
          <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
            <span style="font-size:13px;color:#aaa;">Subtotal</span>
            <span style="font-size:13px;color:#d8d8d8;">${formatCOP(data.subtotal)}</span>
          </div>
          <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
            <span style="font-size:13px;color:#aaa;">Envío</span>
            ${data.shippingCost === 0
              ? `<span><span style="font-size:13px;color:#888;text-decoration:line-through;">$14.500</span> <strong style="font-size:13px;color:#4caf50;">GRATIS</strong></span>`
              : `<span style="font-size:13px;color:#d8d8d8;">${formatCOP(data.shippingCost)}</span>`
            }
          </div>
          <div style="display:flex;justify-content:space-between;padding-top:10px;border-top:1px solid rgba(255,255,255,0.12);">
            <span style="font-size:16px;font-weight:700;color:#fff;">Total</span>
            <span style="font-size:16px;font-weight:700;color:#f3b0bd;">${formatCOP(data.total)}</span>
          </div>
        </div>
      </div>

      <p style="margin:0 0 18px;font-size:15px;line-height:1.7;color:#d8d8d8;">
        Te notificaremos cuando tu pedido cambie de estado. Si tienes alguna pregunta, no dudes en contactarnos.
      </p>

      <a href="${brandUrl}"
         style="display:inline-block;padding:13px 28px;background:#f3b0bd;color:#111;text-decoration:none;border-radius:999px;font-weight:700;letter-spacing:0.04em;">
        Visitar la tienda
      </a>

      <p style="margin:26px 0 0;font-size:13px;line-height:1.7;color:#9d9d9d;">
        Este correo fue enviado porque realizaste una compra en ${brandName}.
      </p>
    `),
  );
};