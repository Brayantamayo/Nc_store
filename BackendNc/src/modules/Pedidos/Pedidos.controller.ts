import { asyncHandler } from '../../middlewares/Asynchandler';
import { paginar } from '../../utils/paginar';
import * as PedidoService from './Pedidos.service';
import { enviarCorreoConfirmacionPedido } from '../../config/Mailer';
import {
  createPedidoSchema,
  idParamSchema,
  updatePedidoSchema,
} from './Validaciones/Pedido.schema';

export const getAll = asyncHandler(async (req, res) => {
  const pagination = paginar(req.query);
  const data = await PedidoService.getAllPedidos(pagination);

  res.status(200).json({ ok: true, ...data });
});

export const getById = asyncHandler(async (req, res) => {
  const { id } = idParamSchema.parse(req.params);
  const data = await PedidoService.getPedidoById(id);

  if (!data) {
    res.status(404).json({ ok: false, message: 'Pedido no encontrado' });
    return;
  }

  res.status(200).json({ ok: true, data });
});

const SHIPPING_FEE = 14500;
const FREE_SHIPPING_THRESHOLD = 300000;

export const create = asyncHandler(async (req, res) => {
  const body = createPedidoSchema.parse(req.body);
  const data = await PedidoService.createPedido(body);

  // ── Enviar correo de confirmación (fire-and-forget) ─────────────────────
  if (data) {
    const customerEmail = data.usuario?.email || body.guestEmail || '';
    const customerName = data.usuario?.nombre || body.guestName || 'Cliente';

    if (customerEmail) {
      const items = data.items.map((item: any) => ({
        productName: item.variante?.producto?.nombre || 'Producto',
        color: item.variante?.color || '',
        quantity: item.cantidad,
        unitPrice: Number(item.precio),
        image: item.variante?.imagenes?.[0] || '',
        detallesCombo: item.detallesCombo,
      }));

      const subtotal = items.reduce(
        (acc: number, item: any) => acc + item.unitPrice * item.quantity,
        0,
      );

      const isFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;
      const shippingCost = isFreeShipping ? 0 : SHIPPING_FEE;

      enviarCorreoConfirmacionPedido(customerEmail, {
        orderId: data.id,
        customerName,
        items,
        subtotal,
        shippingCost,
        total: subtotal + shippingCost,
      }).catch((err) => {
        console.error('Error enviando correo de confirmación:', err);
      });
    }
  }

  res.status(201).json({ ok: true, data });
});

export const update = asyncHandler(async (req, res) => {
  const { id } = idParamSchema.parse(req.params);
  const body = updatePedidoSchema.parse(req.body);
  const data = await PedidoService.updatePedido(id, body);

  res.status(200).json({ ok: true, data });
});

export const remove = asyncHandler(async (req, res) => {
  const { id } = idParamSchema.parse(req.params);
  const data = await PedidoService.deletePedido(id);

  res.status(200).json({ ok: true, data, message: 'Pedido eliminado correctamente' });
});
